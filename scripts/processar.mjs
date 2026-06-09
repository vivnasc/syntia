// scripts/processar.mjs
//
// Pipeline automático de processamento de aulas.
//
// Para cada áudio novo em <area>/_audio/:
//   1. Transcreve com Groq Whisper (pt). Áudios grandes são reamostrados
//      para 16 kHz mono e, se necessário, divididos em troços com ffmpeg.
//   2. Passa a transcrição pela API do Claude com o prompt-mestre, usando os
//      PDFs de <area>/_material/ como contexto de referência (Bloco B).
//   3. Escreve transcricoes/<nome>.txt, sinteses/<nome>.md e produto/<nome>.md.
//
// "Área" = qualquer pasta que tenha um subdiretório _audio. Hoje são os 3
// cursos e a disciplina-partilhada. Adicionar uma área nova é só criar a
// pasta com a mesma estrutura — não é preciso mexer aqui.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const CLAUDE_MODEL = "claude-opus-4-8";
const GROQ_MODEL = "whisper-large-v3";
const PROMPT_MESTRE = fs.readFileSync("prompts/prompt-mestre.md", "utf-8");

// Contexto do ecossistema de produto (opcional). Se existir, é injetado na
// chamada ao Claude para o Bloco C mapear as aulas para os produtos reais.
const ECOSSISTEMA_PATH = "contexto/ecossistema-produto.md";
const ECOSSISTEMA = fs.existsSync(ECOSSISTEMA_PATH)
  ? fs.readFileSync(ECOSSISTEMA_PATH, "utf-8")
  : "";

const AUDIO_EXT = [".mp3", ".m4a", ".wav", ".mp4", ".aac", ".ogg", ".flac", ".webm"];
const TEXTO_EXT = [".txt", ".md"];

// Groq aceita ficheiros até ~25 MB. Mantemo-nos com folga abaixo disso.
const LIMITE_BYTES = 24 * 1024 * 1024;
const SEGUNDOS_POR_TROCO = 1200; // 20 min por troço quando é preciso dividir

// Limite de segurança para o material de referência enviado ao Claude.
const LIMITE_MATERIAL_BYTES = 28 * 1024 * 1024;

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
function temFfmpeg() {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
const FFMPEG = temFfmpeg();

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

// Quanto esperar antes de tentar de novo, a partir do Retry-After ou da
// mensagem do Groq/Anthropic ("try again in 2m16.5s"). Limitado a 2 min.
function esperaMs(resp, corpo) {
  const ra = resp.headers.get("retry-after");
  if (ra && !isNaN(+ra)) return Math.min(+ra * 1000, 120000);
  const m = /try again in\s+(?:([0-9.]+)m)?([0-9.]+)s/i.exec(corpo || "");
  if (m) {
    const seg = (+(m[1] || 0)) * 60 + (+m[2] || 0);
    return Math.min(seg * 1000 + 1500, 120000);
  }
  return 10000;
}

// fetch que aguenta limites de ritmo (429) e erros temporários (5xx):
// espera e tenta de novo até maxTentativas. Devolve a última resposta.
async function fetchRetry(url, opts, maxTentativas = 6) {
  for (let i = 0; ; i++) {
    const resp = await fetch(url, opts);
    if (resp.ok || (resp.status !== 429 && resp.status < 500) || i >= maxTentativas - 1) return resp;
    const corpo = await resp.clone().text().catch(() => "");
    const ms = esperaMs(resp, corpo);
    console.log(`    (ritmo/erro ${resp.status}; espero ${Math.round(ms / 1000)}s e tento de novo ${i + 1}/${maxTentativas})`);
    await dormir(ms);
  }
}

function listarDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .map((n) => path.join(dir, n))
    .filter((p) => fs.statSync(p).isDirectory());
}

// Uma "cadeira" é qualquer pasta com um subdiretório _audio:
//   cursos/<curso>/<cadeira>   ou   disciplina-partilhada
function descobrirCadeiras() {
  const out = [];
  for (const cursoDir of listarDirs("cursos")) {
    for (const cadDir of listarDirs(cursoDir)) {
      const base = path.basename(cadDir);
      if (base.startsWith(".") || base === "_material") continue;
      if (fs.existsSync(path.join(cadDir, "_audio"))) out.push(cadDir);
    }
  }
  if (fs.existsSync(path.join("disciplina-partilhada", "_audio"))) out.push("disciplina-partilhada");
  return out;
}

// Material de referência de uma cadeira = o programa do curso (se aplicável)
// Material de referência para uma aula = material do curso + material da
// disciplina (top-level) + material da UNIDADE da aula (_material/U<n>).
// As apostilas são por unidade, por isso uma aula só recebe a(s) da sua unidade.
function materialParaArea(areaDir, unidade) {
  const partes = areaDir.split(path.sep);
  const blocos = [];
  if (partes[0] === "cursos" && partes.length >= 3) {
    blocos.push(...carregarMaterial(path.join(partes[0], partes[1], "_material")));
  }
  blocos.push(...carregarMaterial(path.join(areaDir, "_material")));
  if (unidade) blocos.push(...carregarMaterial(path.join(areaDir, "_material", `U${unidade}`)));
  blocos.forEach((b) => delete b.cache_control);
  if (blocos.length) blocos[blocos.length - 1].cache_control = { type: "ephemeral" };
  return blocos;
}

// ---------------------------------------------------------------------------
// Preparação do áudio: reamostra para 16 kHz mono e divide se for grande.
// Devolve uma lista de ficheiros (troços) prontos a transcrever.
// ---------------------------------------------------------------------------
function prepararAudio(caminhoAudio, tmpDir) {
  const tamanho = fs.statSync(caminhoAudio).size;

  if (!FFMPEG) {
    if (tamanho > LIMITE_BYTES) {
      throw new Error(
        `Áudio com ${(tamanho / 1e6).toFixed(1)} MB excede o limite do Groq e ffmpeg não está disponível.`
      );
    }
    return [caminhoAudio];
  }

  // 1) Reamostrar para 16 kHz mono mp3 (Whisper só precisa disto e fica muito menor).
  const comprimido = path.join(tmpDir, "audio16k.mp3");
  execFileSync("ffmpeg", [
    "-y", "-i", caminhoAudio,
    "-ac", "1", "-ar", "16000", "-b:a", "64k",
    comprimido,
  ], { stdio: "ignore" });

  if (fs.statSync(comprimido).size <= LIMITE_BYTES) {
    return [comprimido];
  }

  // 2) Ainda grande → dividir em troços por tempo.
  const padrao = path.join(tmpDir, "troco_%03d.mp3");
  execFileSync("ffmpeg", [
    "-y", "-i", comprimido,
    "-f", "segment", "-segment_time", String(SEGUNDOS_POR_TROCO),
    "-c", "copy", padrao,
  ], { stdio: "ignore" });

  return fs.readdirSync(tmpDir)
    .filter((f) => /^troco_\d+\.mp3$/.test(f))
    .sort()
    .map((f) => path.join(tmpDir, f));
}

// ---------------------------------------------------------------------------
// Transcrição via Groq (Whisper large v3)
// ---------------------------------------------------------------------------
async function transcreverTroco(caminho) {
  const dados = fs.readFileSync(caminho);
  const form = new FormData();
  form.append("file", new Blob([dados]), path.basename(caminho));
  form.append("model", GROQ_MODEL);
  form.append("language", "pt");
  form.append("response_format", "text");

  const resp = await fetchRetry("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
    body: form,
  });
  if (!resp.ok) {
    throw new Error(`Groq falhou (${resp.status}): ${await resp.text()}`);
  }
  return (await resp.text()).trim();
}

// Extrai o texto de um PDF com pdftotext (poppler-utils, instalado na Action).
function extrairTextoPdf(caminho) {
  try {
    return execFileSync("pdftotext", ["-enc", "UTF-8", "-nopgbrk", caminho, "-"], {
      maxBuffer: 64 * 1024 * 1024,
    }).toString("utf-8").trim();
  } catch (e) {
    throw new Error(`pdftotext falhou: ${e.message}`);
  }
}

// Obtém o texto-fonte de um ficheiro, conforme o tipo: áudio → transcrição,
// PDF → extração, txt/md → leitura direta.
async function textoFonteDe(caminho, ext) {
  if (AUDIO_EXT.includes(ext)) return transcrever(caminho);
  if (ext === ".pdf") return extrairTextoPdf(caminho);
  if (TEXTO_EXT.includes(ext)) return fs.readFileSync(caminho, "utf-8").trim();
  throw new Error(`Tipo de ficheiro não suportado: ${ext}`);
}

async function transcrever(caminhoAudio) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "aula-"));
  try {
    const trocos = prepararAudio(caminhoAudio, tmpDir);
    const partes = [];
    for (let i = 0; i < trocos.length; i++) {
      if (trocos.length > 1) console.log(`    troço ${i + 1}/${trocos.length}...`);
      partes.push(await transcreverTroco(trocos[i]));
    }
    return partes.join("\n\n");
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// PDFs de referência → blocos "document" para o Claude (com prompt caching)
// ---------------------------------------------------------------------------
function carregarMaterial(materialDir) {
  if (!fs.existsSync(materialDir)) return [];
  const pdfs = fs.readdirSync(materialDir)
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .sort();

  const blocos = [];
  let total = 0;
  for (const nome of pdfs) {
    const caminho = path.join(materialDir, nome);
    const tamanho = fs.statSync(caminho).size;
    if (total + tamanho > LIMITE_MATERIAL_BYTES) {
      console.log(`    (material ${nome} ignorado: excede limite de contexto)`);
      continue;
    }
    total += tamanho;
    blocos.push({
      type: "document",
      title: nome,
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: fs.readFileSync(caminho).toString("base64"),
      },
    });
  }
  // Cacheia o material para que aulas seguintes do mesmo curso não voltem a pagá-lo.
  if (blocos.length) blocos[blocos.length - 1].cache_control = { type: "ephemeral" };
  return blocos;
}

// ---------------------------------------------------------------------------
// Processamento via API do Claude
// ---------------------------------------------------------------------------
async function processarComClaude(transcricao, materialBlocos, rotulo = "TRANSCRIÇÃO DA AULA") {
  const content = [];
  if (materialBlocos.length) {
    content.push({
      type: "text",
      text:
        "MATERIAL OFICIAL DE REFERÊNCIA (PDFs do curso e/ou da disciplina). " +
        "Usa-o para garantir que definições, autores e classificações do Bloco B " +
        "batem certo com o material — não inventes nada que não esteja na aula ou aqui.",
    });
    content.push(...materialBlocos);
  }
  if (ECOSSISTEMA) {
    content.push({
      type: "text",
      text:
        "CONTEXTO DO ECOSSISTEMA DE PRODUTO DA VIVIANNE (a seguir). No BLOCO C, " +
        "em vez de aplicares os quatro temas em abstrato, mapeia para estes " +
        "produtos REAIS: diz que produto específico cada ideia alimenta e respeita " +
        "a VOZ e o GLOSSÁRIO desse produto. Cada produto tem o seu glossário — não " +
        "os mistures. Regras de voz: português de Portugal, sem travessões longos " +
        "(— –), nomes de marca como aparecem (ex.: \"infonte\" em minúsculas), e " +
        "evita o jargão proibido listado em cada glossário. Se uma aula não tocar " +
        "nenhum produto real de um tema, mantém a aplicação genérica desse tema.\n\n" +
        ECOSSISTEMA,
      cache_control: { type: "ephemeral" },
    });
  }
  content.push({ type: "text", text: `${PROMPT_MESTRE}\n\n=== ${rotulo} ===\n${transcricao}` });

  const resp = await fetchRetry("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 16000,
      messages: [{ role: "user", content }],
    }),
  });
  if (!resp.ok) {
    throw new Error(`Claude falhou (${resp.status}): ${await resp.text()}`);
  }
  const data = await resp.json();
  return data.content.map((b) => (b.type === "text" ? b.text : "")).join("\n");
}

// Transforma a lista crua de objetivos da unidade num guia de estudo
// assimilável, ancorado na apostila da unidade (se existir).
async function resumirObjetivos(objetivosTexto, materialBlocos) {
  const content = [];
  if (materialBlocos.length) {
    content.push({ type: "text", text: "APOSTILA / MATERIAL DESTA UNIDADE (a seguir). Usa-o como fonte para explicar os objetivos com rigor." });
    content.push(...materialBlocos);
  }
  content.push({
    type: "text",
    text:
      "A seguir está a lista crua dos OBJETIVOS DE APRENDIZAGEM desta unidade. " +
      "Transforma-a num guia de estudo curto e assimilável, em português de Portugal, em markdown:\n" +
      "- Começa com 1 frase a enquadrar o que a unidade quer que domines.\n" +
      "- Para cada objetivo, 1 a 3 linhas que expliquem o que significa na prática e o conceito-chave a reter (com base na apostila, se houver).\n" +
      "- Termina com um bloco \"**Para dominar isto, foca-te em:**\" com 3 a 5 pontos.\n" +
      "Não inventes nada que não esteja nos objetivos ou na apostila. Evita travessões longos.\n\n" +
      "=== OBJETIVOS (lista crua) ===\n" + objetivosTexto,
  });

  const resp = await fetchRetry("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 4000, messages: [{ role: "user", content }] }),
  });
  if (!resp.ok) throw new Error(`Claude falhou ao resumir objetivos (${resp.status}): ${await resp.text()}`);
  const data = await resp.json();
  return data.content.map((b) => (b.type === "text" ? b.text : "")).join("\n").trim();
}

// Junta as sínteses de todas as aulas de uma unidade num "Resumo da Unidade":
// uma visão geral da matéria toda, por temas, ancorada na apostila.
async function resumirUnidade(sintesesTexto, materialBlocos) {
  const content = [];
  if (materialBlocos.length) {
    content.push({ type: "text", text: "APOSTILA / MATERIAL DESTA UNIDADE (a seguir). Usa-o para rigor de conceitos e termos." });
    content.push(...materialBlocos);
  }
  content.push({
    type: "text",
    text:
      "A seguir estão as SÍNTESES das aulas desta unidade. Junta-as num único " +
      "\"Resumo da Unidade\": uma visão geral coerente e assimilável da matéria toda, " +
      "em português de Portugal, em markdown. Regras:\n" +
      "- Começa com 2-3 linhas a enquadrar a unidade.\n" +
      "- Organiza por TEMAS/conceitos da unidade (não aula a aula); funde repetições.\n" +
      "- Mantém nomes de autores, definições e classificações fiéis às sínteses e à apostila.\n" +
      "- Termina com um bloco \"**Em síntese**\" com os pontos essenciais a reter.\n" +
      "Não inventes nada fora das sínteses/apostila. Evita travessões longos.\n\n" +
      "=== SÍNTESES DAS AULAS ===\n" + sintesesTexto,
  });

  const resp = await fetchRetry("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 6000, messages: [{ role: "user", content }] }),
  });
  if (!resp.ok) throw new Error(`Claude falhou ao resumir unidade (${resp.status}): ${await resp.text()}`);
  const data = await resp.json();
  return data.content.map((b) => (b.type === "text" ? b.text : "")).join("\n").trim();
}

// Regenera o resumo de uma unidade a partir das sínteses das suas aulas.
async function regenerarResumoUnidade(area, unidade, materialBlocos) {
  if (!unidade) return;
  const sintDir = path.join(area, "sinteses");
  if (!fs.existsSync(sintDir)) return;
  const re = new RegExp(`^U${unidade}[_-]`, "i");
  const ficheiros = fs.readdirSync(sintDir).filter((f) => f.endsWith(".md") && re.test(f)).sort();
  if (!ficheiros.length) return;
  const sintesesTexto = ficheiros.map((f) => `## ${path.basename(f, ".md")}\n\n${fs.readFileSync(path.join(sintDir, f), "utf-8")}`).join("\n\n---\n\n");

  try {
    const resumo = await resumirUnidade(sintesesTexto, materialBlocos);
    const dir = path.join(area, "resumos");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `U${unidade}.md`), resumo, "utf-8");
    console.log(`[${area}] Resumo da Unidade ${unidade} atualizado (${ficheiros.length} aula(s)).`);
  } catch (e) {
    console.error(`[${area}] aviso: resumo da Unidade ${unidade} falhou: ${e.message}`);
  }

  try {
    await gerarQuizUnidade(area, unidade, sintesesTexto, materialBlocos);
  } catch (e) {
    console.error(`[${area}] aviso: quiz da Unidade ${unidade} falhou: ${e.message}`);
  }
}

// Gera um quiz de escolha múltipla da unidade (formato do teste real da
// utilizadora) a partir dos objetivos + sínteses + apostila. Guarda JSON.
async function gerarQuizUnidade(area, unidade, sintesesTexto, materialBlocos) {
  const objPath = path.join(area, "objetivos", `U${unidade}.md`);
  const objetivos = fs.existsSync(objPath) ? fs.readFileSync(objPath, "utf-8") : "";

  const content = [];
  if (materialBlocos.length) {
    content.push({ type: "text", text: "APOSTILA DESTA UNIDADE (referência para as perguntas)." });
    content.push(...materialBlocos);
  }
  content.push({
    type: "text",
    text:
      "Cria um quiz de ESCOLHA MÚLTIPLA para eu me preparar para o teste desta unidade. " +
      "Baseia-te SÓ no material a seguir (objetivos + sínteses das aulas + apostila). " +
      "Gera 10 a 12 perguntas sobre os pontos mais importantes e mais prováveis de saírem em teste. " +
      "Cada pergunta tem 4 opções plausíveis, exatamente UMA correta, e uma explicação curta do porquê. " +
      "Português de Portugal, sem travessões longos. " +
      "Responde APENAS com JSON válido (sem markdown, sem ```), no formato exato:\n" +
      '[{"p":"pergunta","opcoes":["A","B","C","D"],"correta":0,"explica":"porquê"}]\n' +
      "O campo 'correta' é o índice (0 a 3) da opção certa.\n\n" +
      (objetivos ? `=== OBJETIVOS ===\n${objetivos}\n\n` : "") +
      `=== SÍNTESES DAS AULAS ===\n${sintesesTexto}`,
  });

  const resp = await fetchRetry("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 8000, messages: [{ role: "user", content }] }),
  });
  if (!resp.ok) throw new Error(`Claude ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  const bruto = data.content.map((b) => (b.type === "text" ? b.text : "")).join("\n");

  // Extrai o array JSON mesmo que venha com texto à volta.
  const ini = bruto.indexOf("[");
  const fim = bruto.lastIndexOf("]");
  if (ini === -1 || fim === -1) throw new Error("resposta sem JSON");
  const perguntas = JSON.parse(bruto.slice(ini, fim + 1))
    .filter((q) => q && q.p && Array.isArray(q.opcoes) && q.opcoes.length === 4 && Number.isInteger(q.correta))
    .map((q) => ({ p: String(q.p), opcoes: q.opcoes.map(String), correta: Math.max(0, Math.min(3, q.correta)), explica: String(q.explica || "") }));
  if (!perguntas.length) throw new Error("nenhuma pergunta válida");

  const dir = path.join(area, "quiz");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `U${unidade}.json`), JSON.stringify(perguntas, null, 2), "utf-8");
  console.log(`[${area}] Quiz da Unidade ${unidade}: ${perguntas.length} perguntas.`);
}

// ---------------------------------------------------------------------------
// Separa o Bloco C (produto) do resto (síntese = Bloco A + B [+ Notas])
// ---------------------------------------------------------------------------
function separarBlocos(saida) {
  const marcadorC = saida.search(/BLOCO\s+C/i);
  if (marcadorC === -1) return { sintese: saida.trim(), produto: "" };
  const inicioLinha = saida.lastIndexOf("\n", marcadorC);
  const corte = inicioLinha === -1 ? marcadorC : inicioLinha;
  return {
    sintese: saida.slice(0, corte).trim(),
    produto: saida.slice(corte).trim(),
  };
}

// ---------------------------------------------------------------------------
// Modo upload: processa um único áudio descarregado (variáveis INGEST_*).
// Usado quando a Action é disparada pelo upload da PWA. O MP3 vem de fora do
// repositório (ex.: /tmp) e não é comitado — só os textos gerados o são.
// ---------------------------------------------------------------------------
async function processarIngest() {
  const ficheiroPath = process.env.INGEST_AUDIO_PATH;
  const area = process.env.INGEST_AREA || "";
  const filename = process.env.INGEST_FILENAME || path.basename(ficheiroPath || "");

  if (!/^(cursos\/[\w.-]+\/[\w.-]+|disciplina-partilhada)$/.test(area)) {
    throw new Error(`Área inválida: "${area}"`);
  }
  if (!ficheiroPath || !fs.existsSync(ficheiroPath)) {
    throw new Error(`Ficheiro não encontrado em ${ficheiroPath}`);
  }

  // Modo "material": a apostila/PDF é guardada como referência da disciplina
  // (não vira aula). Passa a alimentar a síntese de cada aula seguinte.
  if (process.env.INGEST_MODO === "material") {
    const uni = (path.basename(filename).match(/^u(\d+)/i) || [])[1];
    const materialDir = uni ? path.join(area, "_material", `U${uni}`) : path.join(area, "_material");
    fs.mkdirSync(materialDir, { recursive: true });
    const seguro = path.basename(filename).replace(/[^\w.\- ]+/g, "_").trim() || "apostila.pdf";
    fs.copyFileSync(ficheiroPath, path.join(materialDir, seguro));
    console.log(`[${area}] material de referência guardado${uni ? ` (Unidade ${uni})` : ""}: ${seguro}`);
    return;
  }

  const ext = path.extname(filename).toLowerCase();
  const nomeBase = path.basename(filename, path.extname(filename)) || "aula";

  // Ficheiros especiais por nome: objetivos e material complementar da unidade.
  // Não viram aula — ficam num painel próprio da Unidade.
  const especial = /objetiv/i.test(nomeBase)
    ? "objetivos"
    : /(complementar|complement|leituras|artigos|links)/i.test(nomeBase)
      ? "complementar"
      : null;
  if (especial) {
    const uni = (nomeBase.match(/^u(\d+)/i) || [])[1] || "0";
    const dir = path.join(area, especial);
    fs.mkdirSync(dir, { recursive: true });
    const texto = await textoFonteDe(ficheiroPath, ext);
    let saida = texto || "";
    if (especial === "objetivos" && texto) {
      const material = materialParaArea(area, uni !== "0" ? uni : undefined);
      console.log(`[${area}] A resumir objetivos da Unidade ${uni} (${material.length} PDF(s) de apoio)...`);
      saida = await resumirObjetivos(texto, material);
    }
    fs.writeFileSync(path.join(dir, `U${uni}.md`), saida, "utf-8");
    console.log(`[${area}] ${especial} da Unidade ${uni} guardado.`);
    return;
  }

  const transDir = path.join(area, "transcricoes");
  const sintDir = path.join(area, "sinteses");
  const prodDir = path.join(area, "produto");
  [transDir, sintDir, prodDir].forEach((d) => fs.mkdirSync(d, { recursive: true }));

  const txtPath = path.join(transDir, `${nomeBase}.txt`);
  const sintPath = path.join(sintDir, `${nomeBase}.md`);
  const prodPath = path.join(prodDir, `${nomeBase}.md`);

  if (fs.existsSync(txtPath) && fs.existsSync(sintPath) && fs.existsSync(prodPath)) {
    console.log(`[${area}] ${nomeBase} já processado, salto.`);
    return;
  }

  const uniAula = (nomeBase.match(/^u(\d+)/i) || [])[1];
  const material = materialParaArea(area, uniAula);
  const rotulo = AUDIO_EXT.includes(ext) ? "TRANSCRIÇÃO DA AULA" : "TEXTO DA AULA (documento enviado)";

  console.log(`[${area}] A obter o texto de ${filename} (${ext || "?"})...`);
  const texto = fs.existsSync(txtPath)
    ? fs.readFileSync(txtPath, "utf-8")
    : await textoFonteDe(ficheiroPath, ext);
  if (!texto || !texto.trim()) {
    throw new Error(`Sem texto utilizável em ${filename} (PDF só com imagens? áudio vazio?).`);
  }
  fs.writeFileSync(txtPath, texto, "utf-8");

  console.log(`[${area}] A processar com o Claude (${material.length} PDF(s) de referência)...`);
  const saida = await processarComClaude(texto, material, rotulo);
  const { sintese, produto } = separarBlocos(saida);
  fs.writeFileSync(sintPath, sintese, "utf-8");
  fs.writeFileSync(prodPath, produto, "utf-8");
  console.log(`[${area}] ${nomeBase} concluído.`);
  // Nota: o Resumo e o Quiz da unidade são gerados a pedido (modo "consolidar"),
  // para não gastar 3 chamadas ao Claude por cada aula.
}

// Gera/atualiza o Resumo + Quiz de uma unidade, a pedido (botão na app).
async function consolidarUnidade(area, unidade) {
  if (!/^(cursos\/[\w.-]+\/[\w.-]+|disciplina-partilhada)$/.test(area)) {
    throw new Error(`Área inválida: "${area}"`);
  }
  const material = materialParaArea(area, unidade);
  await regenerarResumoUnidade(area, unidade, material);
}

// ---------------------------------------------------------------------------
// Loop principal
// ---------------------------------------------------------------------------
async function main() {
  if (!GROQ_API_KEY || !ANTHROPIC_API_KEY) {
    throw new Error("Faltam os secrets GROQ_API_KEY e/ou ANTHROPIC_API_KEY.");
  }
  if (!FFMPEG) console.log("Aviso: ffmpeg indisponível — áudios grandes vão falhar.");

  // Pedido de consolidação: gerar Resumo + Quiz de uma unidade (sem ficheiro).
  if (process.env.INGEST_MODO === "consolidar") {
    await consolidarUnidade(process.env.INGEST_AREA || "", process.env.INGEST_UNIDADE || "");
    return;
  }

  // Disparado pela PWA: um único áudio vindo do armazenamento.
  if (process.env.INGEST_AUDIO_PATH) {
    await processarIngest();
    return;
  }

  const areas = descobrirCadeiras();
  if (!areas.length) {
    console.log("Nenhuma cadeira com _audio encontrada.");
    return;
  }

  let processadas = 0;
  let erros = 0;

  for (const area of areas) {
    const audioDir = path.join(area, "_audio");
    const transDir = path.join(area, "transcricoes");
    const sintDir = path.join(area, "sinteses");
    const prodDir = path.join(area, "produto");
    [transDir, sintDir, prodDir].forEach((d) => fs.mkdirSync(d, { recursive: true }));

    const audios = fs.readdirSync(audioDir)
      .filter((f) => AUDIO_EXT.includes(path.extname(f).toLowerCase()))
      .sort();
    if (!audios.length) continue;

    for (const audio of audios) {
      const nomeBase = path.basename(audio, path.extname(audio));
      const material = materialParaArea(area, (nomeBase.match(/^u(\d+)/i) || [])[1]);
      const txtPath = path.join(transDir, `${nomeBase}.txt`);
      const sintPath = path.join(sintDir, `${nomeBase}.md`);
      const prodPath = path.join(prodDir, `${nomeBase}.md`);

      // Idempotente: só (re)processa se faltar algum dos três resultados.
      if (fs.existsSync(txtPath) && fs.existsSync(sintPath) && fs.existsSync(prodPath)) {
        console.log(`[${area}] ${audio} já processado, salto.`);
        continue;
      }

      try {
        console.log(`[${area}] A transcrever ${audio}...`);
        const transcricao = fs.existsSync(txtPath)
          ? fs.readFileSync(txtPath, "utf-8")
          : await transcrever(path.join(audioDir, audio));
        fs.writeFileSync(txtPath, transcricao, "utf-8");

        console.log(`[${area}] A processar com o Claude (${material.length} PDF(s) de referência)...`);
        const saida = await processarComClaude(transcricao, material);
        const { sintese, produto } = separarBlocos(saida);

        fs.writeFileSync(sintPath, sintese, "utf-8");
        fs.writeFileSync(prodPath, produto, "utf-8");
        console.log(`[${area}] ${audio} concluído.`);
        processadas++;
      } catch (e) {
        erros++;
        console.error(`[${area}] ERRO em ${audio}: ${e.message}`);
      }
    }
  }

  console.log(`=== FIM === ${processadas} aula(s) processada(s), ${erros} erro(s).`);
  if (erros > 0 && processadas === 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
