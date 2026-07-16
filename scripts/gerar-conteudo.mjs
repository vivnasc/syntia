// scripts/gerar-conteudo.mjs
//
// Lê o repositório (cursos/<curso>/<cadeira>/... e disciplina-partilhada) e
// produz a árvore que a PWA renderiza:
//   - lib/conteudo.json
//   - public/material/<curso>/<cadeira|__curso>/<ficheiro>.pdf (cópia dos PDFs)
//
// Hierarquia: Curso → Cadeira → Aulas. Uma cadeira é qualquer subpasta de um
// curso (exceto _material). A disciplina-partilhada é uma cadeira comum aos 3.
// Adicionar curso/cadeira = criar pasta — sem tocar aqui.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_JSON = path.join(ROOT, "lib", "conteudo.json");
const OUT_MATERIAL = path.join(ROOT, "public", "material");
const TEMAS = ["corpo", "amor", "maternidade", "prosperidade"];
const ESPECIAIS = new Set(["_material", "_audio", "transcricoes", "sinteses", "produto"]);

const existe = (p) => fs.existsSync(p);
const lerTxt = (p) => (existe(p) ? fs.readFileSync(p, "utf-8") : "");
const isDir = (p) => existe(p) && fs.statSync(p).isDirectory();

// Quando os ficheiros foram criados, os acentos perderam-se: "é/í/ã/ç…" viraram
// "_" (ou desapareceram). "Sist_mica" era "Sistémica", "Fam_lia" era "Família".
// Repomos os termos conhecidos ANTES de trocar "_" por espaço, senão a palavra
// parte-se em dois ("Sist Mica"). Match sem distinguir maiúsculas; saída canónica.
// Mais longas primeiro (Sist_micas antes de Sist_mica).
const ACENTOS = [
  [/sist[_ ]?micas/gi, "Sistémicas"],
  [/sist[_ ]?mica/gi, "Sistémica"],
  [/sist[_ ]?mico/gi, "Sistémico"],
  [/sistemico/gi, "Sistémico"],
  [/fam[_ ]?lia/gi, "Família"],
  [/rela[_ ]?es/gi, "Relações"],
  [/intera[_ ]?o/gi, "Interação"],
  [/organiza[_ ]?o/gi, "Organização"],
  [/constela[_ ]?o/gi, "Constelação"],
  [/revis[_ ]?o/gi, "Revisão"],
  [/cl[_ ]?nica/gi, "Clínica"],
  [/cl[_ ]?ssicas/gi, "Clássicas"],
  [/padr[_ ]?o/gi, "Padrão"],
  [/din[_ ]?mico/gi, "Dinâmico"],
  [/m[_ ]?todos/gi, "Métodos"],
  [/m[_ ]?todo/gi, "Método"],
  [/p[_ ]?s-modernidade/gi, "Pós‑modernidade"], // hífen não-quebrável: sobrevive ao passo "_-"→espaço
  [/hist[_ ]?ricos/gi, "Históricos"],
  [/hist[_ ]?rico/gi, "Histórico"],
  [/ci[_ ]?ncia/gi, "Ciência"],
  [/f[_ ]?sica/gi, "Física"],
  [/qu[_ ]?ntica/gi, "Quântica"],
  [/transpessoa(?!l)/gi, "Transpessoal"], // ficheiros vieram com "Transpessoa" truncado
  [/administracao/gi, "Administração"],
  [/sintese/gi, "Síntese"],
  // "ParteI/II/III/IV" colados, sem separador — mais longos primeiro.
  [/parteiv\b/gi, "Parte IV"],
  [/parteiii\b/gi, "Parte III"],
  [/parteii\b/gi, "Parte II"],
  [/partei\b/gi, "Parte I"],
];
// Palavras de ligação ficam minúsculas (exceto se forem a 1.ª palavra).
const LIGACAO = new Set(["a", "à", "às", "ao", "aos", "o", "os", "as", "e", "ou",
  "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas", "para", "por",
  "com", "sem", "que", "se"]);

function prettify(id) {
  let s = id.replace(/^\d+[-_]/, "");
  for (const [re, certo] of ACENTOS) s = s.replace(re, certo);
  s = s.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return s.split(" ").map((w, i) => {
    if (i > 0 && LIGACAO.has(w.toLowerCase())) return w.toLowerCase();
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(" ");
}

function extrairFlashcards(md) {
  const linhas = md.split(/\r?\n/);
  const cards = [];
  const mantidas = [];
  for (const linha of linhas) {
    const mP = linha.match(/^\s*P:\s*(.+\S)\s*$/i);
    const mR = linha.match(/^\s*R:\s*(.+\S)\s*$/i);
    if (mP) { cards.push({ p: mP[1].trim(), r: "" }); continue; }
    if (mR && cards.length && !cards[cards.length - 1].r) { cards[cards.length - 1].r = mR[1].trim(); continue; }
    mantidas.push(linha);
  }
  return { flashcards: cards, sinteseSemCards: mantidas.join("\n").replace(/\n{3,}/g, "\n\n").trim() };
}

// Um item de produto só interessa se for uma aplicação ÚTIL. Descarta os
// "negativos" que o modelo às vezes escreve ("sem ligação", "não aborda"…).
function itemUtil(texto) {
  const t = texto.toLowerCase().trim();
  if (t.length < 25) return false;
  const negativos = [
    /sem liga[cç][aã]o/, /n[aã]o for[cç]o/, /n[aã]o aborda/, /n[aã]o toca/,
    /sem aplica[cç][aã]o/, /\(por definir\)/, /n[aã]o se aplica/,
    /nenhum produto/, /^sem /, /n[aã]o h[aá] liga[cç][aã]o/,
  ];
  return !negativos.some((re) => re.test(t));
}

// Deriva a que PRODUTO (repo) a ideia pertence. Olha primeiro a "Ideia
// concreta" (onde o entregável é nomeado), depois o texto todo.
// Mapeia uma ideia para o universo de produto REAL (jul 2026). Fonte: o
// ecossistema-produto.md. O Método VS foi abolido; FreeMe/Infonte/SyncHim são
// COLEÇÕES de produto (não contas). Ver contexto/ecossistema-produto.md.
function matchProduto(s) {
  const t = (s || "").toLowerCase();
  // Abolido — nunca é produto vivo (não está à venda).
  if (/m[eé]todo\s*vs|sete\s*v[ée]us|7\s*v[ée]us|ver[.\s]?soltar|vir[.\s]?soltar|viver[.\s]?soltar/.test(t)) return "Outro";
  // As 7 coleções (universos de produto) — por nome.
  if (/synchim|synchin/.test(t)) return "SyncHim";
  if (/free\s?me/.test(t)) return "FreeMe Mãe";
  if (/infonte/.test(t)) return "Infonte";
  if (/prosperidade/.test(t)) return "Prosperidade";
  if (/perten[çc]a/.test(t)) return "Pertença";
  if (/cole[cç][ãa]o\s+for[çc]a|universo\s+for[çc]a/.test(t)) return "Força";
  if (/voca[çc][ãa]o/.test(t)) return "Trabalho";
  // As 3 portas / livros-pilar.
  if (/desencaixe|limiar|sete\s*faces|7\s*faces|grande\s*transi[çc][ãa]o|a\s*transi[çc][ãa]o|o\s*medo\b/.test(t)) return "Livros";
  // Avulsos e genéricos.
  if (/\bguias?\b/.test(t)) return "Guias";
  if (/\bebooks?\b/.test(t)) return "Ebooks";
  if (/cole[cç][ãa]o|cole[cç][õo]es|universo|\bloja\b|\blivro\b/.test(t)) return "Livros";
  return null;
}
function derivarProduto(texto) {
  const m = /ideia[^:\n]*:\s*([\s\S]+)/i.exec(texto);
  return matchProduto(m ? m[1] : "") || matchProduto(texto) || "Outro";
}

// Título curto e legível para o cartão: a "Ideia concreta" (1ª frase).
function ideiaCurta(texto) {
  const m = /ideia[^:\n]*:\s*([\s\S]+)/i.exec(texto);
  let s = (m ? m[1] : texto).replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
  const frase = s.split(/\.\s/)[0];
  if (frase.length > 30) s = frase;
  if (s.length > 180) s = s.slice(0, 177).trimEnd() + "…";
  return s;
}

function extrairItensProduto(md, fonte) {
  const linhas = md.split(/\r?\n/);
  const itens = [];
  let atual = null;
  const flush = () => {
    if (atual && atual.texto.trim() && itemUtil(atual.texto)) {
      atual.produto = atual._op ? "Oportunidade" : derivarProduto(atual.texto);
      atual.ideia = ideiaCurta(atual.texto);
      delete atual._op;
      itens.push(atual);
    }
    atual = null;
  };
  const RE_TAG = /\[(corpo|amor|maternidade|prosperidade|oportunidade)\]/gi;
  for (const linha of linhas) {
    const todas = [...linha.matchAll(RE_TAG)].map((m) => m[1].toLowerCase());
    if (todas.length) {
      flush();
      const temas = todas.filter((t) => t !== "oportunidade");
      const texto = linha.replace(RE_TAG, "").replace(/^[\s\-*•:]+/, "").trim();
      atual = { temas: [...new Set(temas)], texto, ...fonte, _op: todas.includes("oportunidade") };
    } else if (atual && linha.trim()) {
      atual.texto += "\n" + linha.trim();
    } else if (atual) { flush(); }
  }
  flush();
  return itens;
}

function copiarMaterial(srcDir, destRel) {
  if (!isDir(srcDir)) return [];
  const out = [];
  const copiarDe = (dir, sub, unidade) => {
    for (const f of fs.readdirSync(dir).sort()) {
      if (!f.toLowerCase().endsWith(".pdf")) continue;
      const destDir = path.join(OUT_MATERIAL, destRel, sub);
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(path.join(dir, f), path.join(destDir, f));
      out.push({
        nome: prettify(f.replace(/\.pdf$/i, "")),
        ficheiro: `material/${destRel}${sub ? `/${sub}` : ""}/${f}`,
        unidade,
      });
    }
  };
  copiarDe(srcDir, "", null);
  // Subpastas U<n> = apostilas por unidade.
  for (const d of fs.readdirSync(srcDir)) {
    const m = d.match(/^U(\d+)$/i);
    if (m && isDir(path.join(srcDir, d))) copiarDe(path.join(srcDir, d), d.toUpperCase(), parseInt(m[1], 10));
  }
  return out;
}

function lerPrograma(cursoDir) {
  const p = path.join(cursoDir, "programa.json");
  if (!existe(p)) return [];
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8")).disciplinas || [];
  } catch {
    return [];
  }
}

// Título do curso: usa o campo "curso" do programa.json se existir; senão
// deriva do nome da pasta (prettify).
function tituloDoCurso(cursoDir, cursoId) {
  const p = path.join(cursoDir, "programa.json");
  if (existe(p)) {
    try {
      const t = JSON.parse(fs.readFileSync(p, "utf-8")).curso;
      if (t && typeof t === "string") return t.trim();
    } catch { /* ignora */ }
  }
  return prettify(cursoId);
}

// "U1_Aula05_Historico_Geral_dos_Sistemas_P2" → unidade 1
function unidadeDe(nome) {
  const m = nome.match(/^U(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}
// Tópico = o que identifica a matéria, ignorando o nº de gravação e a parte.
// "U1_Aula02_Bases_Pensamento_Sistemico"      → "Bases_Pensamento_Sistemico"
// "U1_Aula05_Historico_Geral_dos_Sistemas_P2" → "Historico_Geral_dos_Sistemas"
function chaveTopico(nome) {
  let t = nome.replace(/^U\d+[_-]?/i, "");      // tira U<n>_
  t = t.replace(/^aula\d+[_-]?/i, "");          // tira Aula<nn>_
  // Tira o sufixo de parte no fim — árabe (_P2, _Parte2) OU romano
  // (-ParteI, -ParteIV). As gravações longas vêm partidas e os ficheiros
  // usam "ParteI/II/III/IV"; sem isto cada parte virava uma aula isolada.
  t = t.replace(/[\s_-]*parte[\s_-]*(\d+|[ivxlcdm]+)$/i, ""); // Parte II / ParteIV
  t = t.replace(/[\s_-]*p\d+$/i, "");                          // _P2 (forma curta)
  return t.trim();
}
// Título legível do tópico: "Bases_Pensamento_Sistemico" → "Bases Pensamento Sistémico"
function tituloTopico(topico) {
  return prettify(topico) || "Aula";
}

// Lê painéis por unidade (objetivos/, complementar/) → { 1: "texto", 2: "..." }
function lerPainelUnidade(cadeiraDir, sub) {
  const dir = path.join(cadeiraDir, sub);
  const map = {};
  if (!isDir(dir)) return map;
  for (const f of fs.readdirSync(dir)) {
    const m = f.match(/^U(\d+)\.md$/i);
    if (m) map[parseInt(m[1], 10)] = lerTxt(path.join(dir, f));
  }
  return map;
}

// Lê os quizzes por unidade (quiz/U<n>.json) → { 1: [perguntas], ... }
function lerQuizzes(cadeiraDir) {
  const dir = path.join(cadeiraDir, "quiz");
  const map = {};
  if (!isDir(dir)) return map;
  for (const f of fs.readdirSync(dir)) {
    const m = f.match(/^U(\d+)\.json$/i);
    if (!m) continue;
    try { map[parseInt(m[1], 10)] = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")); } catch {}
  }
  return map;
}

function extrasDe(dir) {
  return {
    objetivos: lerPainelUnidade(dir, "objetivos"),
    complementar: lerPainelUnidade(dir, "complementar"),
    resumo: lerPainelUnidade(dir, "resumos"),
    quiz: lerQuizzes(dir),
  };
}

// Apresentação da cadeira (opcional): apresentacao.md na raiz da cadeira.
// Vai para a capa/abertura do manual, não para dentro de uma unidade.
function lerApresentacao(cadeiraDir) {
  const f = path.join(cadeiraDir, "apresentacao.md");
  return fs.existsSync(f) ? lerTxt(f) : "";
}

// Agrupa as aulas pelas Unidades (módulos). Cada disciplina tem 4 por defeito.
function agruparUnidades(aulas, extras = {}) {
  const objetivos = extras.objetivos || {};
  const complementar = extras.complementar || {};
  const resumo = extras.resumo || {};
  const quiz = extras.quiz || {};
  const nums = aulas.map((a) => a.unidade).filter((n) => n);
  const max = Math.max(4, ...nums);
  const unidades = [];
  for (let n = 1; n <= max; n++) {
    unidades.push({
      n,
      titulo: `Unidade ${n}`,
      objetivos: objetivos[n] || "",
      complementar: complementar[n] || "",
      resumo: resumo[n] || "",
      quiz: quiz[n] || [],
      aulas: aulas.filter((a) => a.unidade === n),
    });
  }
  const soltas = aulas.filter((a) => !a.unidade);
  if (soltas.length) unidades.push({ n: 0, titulo: "Outras aulas", objetivos: "", complementar: "", resumo: "", quiz: [], aulas: soltas });
  return unidades;
}

function lerAulas(cadeiraDir, fonte, banco) {
  const sintDir = path.join(cadeiraDir, "sinteses");
  const prodDir = path.join(cadeiraDir, "produto");
  const transDir = path.join(cadeiraDir, "transcricoes");
  if (!isDir(sintDir)) return [];

  // 1) Lê cada ficheiro como uma "parte".
  const partes = [];
  for (const f of fs.readdirSync(sintDir).sort()) {
    if (!f.endsWith(".md")) continue;
    const nome = f.replace(/\.md$/, "");
    const { flashcards, sinteseSemCards } = extrairFlashcards(lerTxt(path.join(sintDir, f)));
    partes.push({
      nome,
      unidade: unidadeDe(nome),
      topico: chaveTopico(nome) || nome,
      sintese: sinteseSemCards,
      flashcards,
      produtoMd: lerTxt(path.join(prodDir, `${nome}.md`)),
      temTranscricao: existe(path.join(transDir, `${nome}.txt`)),
    });
  }

  // 2) Agrupa as partes do mesmo tópico (mesma unidade + mesmo título) numa aula.
  const grupos = new Map();
  for (const p of partes) {
    const chave = `${p.unidade ?? "x"}|${p.topico}`;
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave).push(p);
  }

  // 3) Constrói uma aula por grupo, mantendo a ordem do primeiro ficheiro.
  const aulas = [];
  for (const ps of grupos.values()) {
    const titulo = tituloTopico(ps[0].topico);
    for (const p of ps) banco.push(...extrairItensProduto(p.produtoMd, { ...fonte, aula: titulo }));
    const varias = ps.length > 1;
    aulas.push({
      nome: varias ? `${ps[0].unidade ? `U${ps[0].unidade}_` : ""}${ps[0].topico}` : ps[0].nome,
      titulo,
      unidade: ps[0].unidade,
      partes: ps.length,
      sintese: varias
        ? ps.map((p, i) => `## Parte ${i + 1}\n\n${p.sintese}`).join("\n\n")
        : ps[0].sintese,
      flashcards: ps.flatMap((p) => p.flashcards),
      temTranscricao: ps.some((p) => p.temTranscricao),
      arquivos: ps.map((p) => p.nome),
    });
  }
  return aulas;
}

function main() {
  fs.rmSync(OUT_MATERIAL, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.mkdirSync(OUT_MATERIAL, { recursive: true });

  const banco = [];
  const cursos = [];

  const cursosDir = path.join(ROOT, "cursos");
  if (isDir(cursosDir)) {
    for (const cursoId of fs.readdirSync(cursosDir).sort()) {
      const cursoDir = path.join(cursosDir, cursoId);
      if (!isDir(cursoDir)) continue;
      const cursoTitulo = tituloDoCurso(cursoDir, cursoId);
      const materiaisCurso = copiarMaterial(path.join(cursoDir, "_material"), `${cursoId}/__curso`);

      // As cadeiras (disciplinas) vêm do programa.json — currículo completo,
      // mesmo as que ainda não têm aulas. Preenche as que já têm conteúdo.
      const cadeiras = [];
      const usados = new Set();
      for (const disc of lerPrograma(cursoDir)) {
        usados.add(disc.id);
        const base = { id: disc.id, titulo: disc.titulo, ementa: disc.ementa || [], inicio: disc.inicio || null, fim: disc.fim || null };
        if (disc.partilhada) {
          // disciplina comum: o conteúdo vive na disciplina-partilhada.
          cadeiras.push({ ...base, partilhada: true, materiais: [], aulas: [], unidades: [] });
          continue;
        }
        const cadDir = path.join(cursoDir, disc.id);
        const materiais = copiarMaterial(path.join(cadDir, "_material"), `${cursoId}/${disc.id}`);
        const aulas = isDir(cadDir)
          ? lerAulas(cadDir, { curso: cursoId, cursoTitulo, cadeira: disc.id, areaTitulo: `${cursoTitulo} · ${disc.titulo}` }, banco)
          : [];
        cadeiras.push({ ...base, apresentacao: lerApresentacao(cadDir), materiais, aulas, unidades: agruparUnidades(aulas, extrasDe(cadDir)) });
      }
      // Pastas de conteúdo que não constam do programa — não perder nada.
      for (const cadId of fs.readdirSync(cursoDir).sort()) {
        if (ESPECIAIS.has(cadId) || cadId.startsWith(".") || cadId === "programa.json" || usados.has(cadId)) continue;
        const cadDir = path.join(cursoDir, cadId);
        if (!isDir(cadDir)) continue;
        const cadTitulo = prettify(cadId);
        const materiais = copiarMaterial(path.join(cadDir, "_material"), `${cursoId}/${cadId}`);
        const aulas = lerAulas(cadDir, { curso: cursoId, cursoTitulo, cadeira: cadId, areaTitulo: `${cursoTitulo} · ${cadTitulo}` }, banco);
        cadeiras.push({ id: cadId, titulo: cadTitulo, ementa: [], inicio: null, fim: null, apresentacao: lerApresentacao(cadDir), materiais, aulas, unidades: agruparUnidades(aulas, extrasDe(cadDir)) });
      }
      cursos.push({ id: cursoId, titulo: cursoTitulo, materiais: materiaisCurso, cadeiras });
    }
  }

  // Disciplina partilhada — cadeira comum aos 3 (uma só vez)
  let partilhada = null;
  const partDir = path.join(ROOT, "disciplina-partilhada");
  if (isDir(partDir)) {
    const titulo = "Desenvolvimento Pessoal e Profissional nas Carreiras da Saúde";
    const materiais = copiarMaterial(path.join(partDir, "_material"), "disciplina-partilhada");
    const aulas = lerAulas(partDir, { curso: "disciplina-partilhada", cursoTitulo: titulo, cadeira: "", areaTitulo: titulo }, banco);
    partilhada = { id: "disciplina-partilhada", titulo, inicio: "2026-05-28", fim: "2026-09-05", materiais, aulas, unidades: agruparUnidades(aulas, extrasDe(partDir)) };
  }

  const conteudo = { geradoEm: new Date().toISOString(), temas: TEMAS, cursos, partilhada, banco, inspiracao: lerInspiracao() };
  fs.writeFileSync(OUT_JSON, JSON.stringify(conteudo, null, 2), "utf-8");

  // saber.json — a PONTE: artefacto público e enxuto que o repo dos produtos vai
  // buscar (SABER = cadeiras + ideias de produto). Servido em /saber.json.
  const materias = [...cursos, ...(partilhada ? [{ titulo: partilhada.titulo, cadeiras: [{ ...partilhada }] }] : [])]
    .map((c) => ({
      curso: c.titulo,
      cadeiras: (c.cadeiras || []).filter((k) => (k.unidades || []).some((u) => u.aulas?.length || u.objetivos || u.resumo))
        .map((k) => ({
          cadeira: k.titulo,
          unidades: (k.unidades || []).filter((u) => u.aulas?.length || u.objetivos || u.resumo)
            .map((u) => ({ n: u.n, objetivos: u.objetivos || "", resumo: u.resumo || "", aulas: (u.aulas || []).map((a) => a.titulo) })),
        })),
    })).filter((c) => c.cadeiras.length);
  const saber = {
    geradoEm: conteudo.geradoEm,
    fonte: "Syntia · pós-graduações (Transpessoal, Constelação Sistémica, Psicologia e Espiritualidade, Desenvolvimento Pessoal)",
    materias,
    // Conceitos-chave por curso, no formato do lib/infografico/cursos.ts do
    // viviannepag — extraídos das aulas reais, para deixarem de ser à mão.
    conceitosCurso: conceitosPorCurso(),
    banco: banco.map((b) => ({ temas: b.temas, produto: b.produto, ideia: b.ideia, texto: b.texto, curso: b.cursoTitulo || b.curso, cadeira: b.areaTitulo || b.cadeira })),
  };
  fs.mkdirSync(path.join(ROOT, "public"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "public", "saber.json"), JSON.stringify(saber, null, 2), "utf-8");

  const nCad = cursos.reduce((s, c) => s + c.cadeiras.length, 0);
  const nAulas = cursos.reduce((s, c) => s + c.cadeiras.reduce((n, k) => n + k.aulas.length, 0), 0) + (partilhada?.aulas.length || 0);
  console.log(`conteudo.json: ${cursos.length} curso(s), ${nCad} cadeira(s), ${nAulas} aula(s), ${banco.length} item(ns) de produto.`);
}

// Extrai os "conceitos-chave" de uma síntese (os termos a negrito na secção de
// conceitos), para alimentar o saber dos cursos do viviannepag (lib/infografico/
// cursos.ts) sem os escrever à mão.
function conceitosDeSintese(md) {
  const out = [];
  let dentro = false;
  for (const l of (md || "").split(/\r?\n/)) {
    if (/^#{1,6}\s.*conceitos?[-\s]?chave/i.test(l)) { dentro = true; continue; }
    if (dentro && (/^#{1,6}\s/.test(l) || /^═══/.test(l))) dentro = false;
    if (!dentro) continue;
    const m = l.match(/^\s*(?:[-*]\s*)?\*\*(.+?)\*\*/);
    if (!m) continue;
    let t = m[1].replace(/:\s*$/, "").replace(/\s*\([^)]*\)\s*$/, "").trim();
    if (t.length >= 3 && t.length <= 60 && !/^\d+[.)]/.test(t)) out.push(t);
  }
  return out;
}
function conceitosDoCurso(cadeiraDirs) {
  const vistos = new Set();
  const conceitos = [];
  for (const dir of cadeiraDirs) {
    const sdir = path.join(dir, "sinteses");
    if (!isDir(sdir)) continue;
    for (const f of fs.readdirSync(sdir).sort()) {
      if (!f.endsWith(".md")) continue;
      for (const c of conceitosDeSintese(lerTxt(path.join(sdir, f)))) {
        const k = c.toLowerCase();
        if (!vistos.has(k)) { vistos.add(k); conceitos.push(c); }
      }
    }
  }
  return conceitos;
}
// Mapeia os 4 cursos do viviannepag para as pastas da Syntia.
function conceitosPorCurso() {
  const cadeirasDe = (cursoId) => {
    const base = path.join(ROOT, "cursos", cursoId);
    if (!isDir(base)) return [];
    return fs.readdirSync(base).map((d) => path.join(base, d)).filter((p) => isDir(p) && path.basename(p) !== "_material");
  };
  return {
    transpessoal: conceitosDoCurso(cadeirasDe("02-psicologia-transpessoal")),
    constelacao: conceitosDoCurso(cadeirasDe("01-constelacao-sistemica")),
    espiritualidade: conceitosDoCurso(cadeirasDe("03-psicologia-espiritualidade")),
    desenvolvimento: conceitosDoCurso([path.join(ROOT, "disciplina-partilhada")]),
  };
}

// Espaço de Inspiração: transcrições + ideias de conteúdo de vídeos guardados
// para inspirar conteúdo próprio. Fica fora dos cursos.
function lerInspiracao() {
  const base = path.join(ROOT, "inspiracao");
  const transDir = path.join(base, "transcricoes");
  const ideiasDir = path.join(base, "ideias");
  const legDir = path.join(base, "legendas");
  if (!isDir(transDir) && !isDir(ideiasDir)) return [];
  const nomes = new Set();
  if (isDir(transDir)) for (const f of fs.readdirSync(transDir)) { const m = f.match(/^(.+)\.txt$/i); if (m) nomes.add(m[1]); }
  if (isDir(ideiasDir)) for (const f of fs.readdirSync(ideiasDir)) { const m = f.match(/^(.+)\.md$/i); if (m) nomes.add(m[1]); }
  const itens = [];
  for (const nome of nomes) {
    const tPath = path.join(transDir, `${nome}.txt`);
    const iPath = path.join(ideiasDir, `${nome}.md`);
    const lPath = path.join(legDir, `${nome}.txt`);
    itens.push({
      nome,
      titulo: prettify(nome),
      transcricao: fs.existsSync(tPath) ? lerTxt(tPath) : "",
      ideias: fs.existsSync(iPath) ? lerTxt(iPath) : "",
      legenda: fs.existsSync(lPath) ? lerTxt(lPath) : "",
    });
  }
  itens.sort((a, b) => a.nome.localeCompare(b.nome));
  return itens;
}

main();
