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

// Onde procurar áreas com _audio. Tudo o que estiver em cursos/* mais a
// disciplina partilhada (que nunca é duplicada).
const RAIZES_AREAS = ["cursos", "."];
const PASTAS_IGNORAR = new Set([".git", ".github", "node_modules", "web", "scripts", "prompts"]);

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

function descobrirAreas() {
  const areas = [];
  for (const raiz of RAIZES_AREAS) {
    if (!fs.existsSync(raiz)) continue;
    if (raiz === ".") {
      // disciplina-partilhada e outras áreas soltas na raiz
      for (const nome of fs.readdirSync(raiz)) {
        if (PASTAS_IGNORAR.has(nome) || nome.startsWith(".")) continue;
        const dir = path.join(raiz, nome);
        if (fs.existsSync(path.join(dir, "_audio")) && fs.statSync(dir).isDirectory()) {
          areas.push(dir);
        }
      }
    } else {
      for (const nome of fs.readdirSync(raiz)) {
        const dir = path.join(raiz, nome);
        if (fs.statSync(dir).isDirectory() && fs.existsSync(path.join(dir, "_audio"))) {
          areas.push(dir);
        }
      }
    }
  }
  // Normaliza (remove "./") e tira duplicados
  return [...new Set(areas.map((a) => a.replace(/^\.\//, "")))];
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

  const resp = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
    body: form,
  });
  if (!resp.ok) {
    throw new Error(`Groq falhou (${resp.status}): ${await resp.text()}`);
  }
  return (await resp.text()).trim();
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
async function processarComClaude(transcricao, materialBlocos) {
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
  content.push({ type: "text", text: `${PROMPT_MESTRE}\n\n=== TRANSCRIÇÃO DA AULA ===\n${transcricao}` });

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
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
// Loop principal
// ---------------------------------------------------------------------------
async function main() {
  if (!GROQ_API_KEY || !ANTHROPIC_API_KEY) {
    throw new Error("Faltam os secrets GROQ_API_KEY e/ou ANTHROPIC_API_KEY.");
  }
  if (!FFMPEG) console.log("Aviso: ffmpeg indisponível — áudios grandes vão falhar.");

  const areas = descobrirAreas();
  if (!areas.length) {
    console.log("Nenhuma área com _audio encontrada.");
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

    const material = carregarMaterial(path.join(area, "_material"));

    for (const audio of audios) {
      const nomeBase = path.basename(audio, path.extname(audio));
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
