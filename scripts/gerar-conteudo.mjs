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

function prettify(id) {
  return id.replace(/^\d+[-_]/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
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

function extrairItensProduto(md, fonte) {
  const linhas = md.split(/\r?\n/);
  const itens = [];
  let atual = null;
  const flush = () => { if (atual && atual.texto.trim()) itens.push(atual); atual = null; };
  for (const linha of linhas) {
    const tags = [...linha.matchAll(/\[(corpo|amor|maternidade|prosperidade)\]/gi)].map((m) => m[1].toLowerCase());
    if (tags.length) {
      flush();
      const texto = linha.replace(/\[(corpo|amor|maternidade|prosperidade)\]/gi, "").replace(/^[\s\-*•:]+/, "").trim();
      atual = { temas: [...new Set(tags)], texto, ...fonte };
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
  const destDir = path.join(OUT_MATERIAL, destRel);
  for (const f of fs.readdirSync(srcDir).sort()) {
    if (!f.toLowerCase().endsWith(".pdf")) continue;
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f));
    out.push({ nome: prettify(f.replace(/\.pdf$/i, "")), ficheiro: `material/${destRel}/${f}` });
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
  t = t.replace(/[_-]?p(arte)?\d+$/i, "");       // tira _P2 / _Parte2 no fim
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

function extrasDe(dir) {
  return { objetivos: lerPainelUnidade(dir, "objetivos"), complementar: lerPainelUnidade(dir, "complementar") };
}

// Agrupa as aulas pelas Unidades (módulos). Cada disciplina tem 4 por defeito.
function agruparUnidades(aulas, extras = {}) {
  const objetivos = extras.objetivos || {};
  const complementar = extras.complementar || {};
  const nums = aulas.map((a) => a.unidade).filter((n) => n);
  const max = Math.max(4, ...nums);
  const unidades = [];
  for (let n = 1; n <= max; n++) {
    unidades.push({
      n,
      titulo: `Unidade ${n}`,
      objetivos: objetivos[n] || "",
      complementar: complementar[n] || "",
      aulas: aulas.filter((a) => a.unidade === n),
    });
  }
  const soltas = aulas.filter((a) => !a.unidade);
  if (soltas.length) unidades.push({ n: 0, titulo: "Outras aulas", objetivos: "", complementar: "", aulas: soltas });
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
      const cursoTitulo = prettify(cursoId);
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
        cadeiras.push({ ...base, materiais, aulas, unidades: agruparUnidades(aulas, extrasDe(cadDir)) });
      }
      // Pastas de conteúdo que não constam do programa — não perder nada.
      for (const cadId of fs.readdirSync(cursoDir).sort()) {
        if (ESPECIAIS.has(cadId) || cadId.startsWith(".") || cadId === "programa.json" || usados.has(cadId)) continue;
        const cadDir = path.join(cursoDir, cadId);
        if (!isDir(cadDir)) continue;
        const cadTitulo = prettify(cadId);
        const materiais = copiarMaterial(path.join(cadDir, "_material"), `${cursoId}/${cadId}`);
        const aulas = lerAulas(cadDir, { curso: cursoId, cursoTitulo, cadeira: cadId, areaTitulo: `${cursoTitulo} · ${cadTitulo}` }, banco);
        cadeiras.push({ id: cadId, titulo: cadTitulo, ementa: [], inicio: null, fim: null, materiais, aulas, unidades: agruparUnidades(aulas, extrasDe(cadDir)) });
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

  const conteudo = { geradoEm: new Date().toISOString(), temas: TEMAS, cursos, partilhada, banco };
  fs.writeFileSync(OUT_JSON, JSON.stringify(conteudo, null, 2), "utf-8");

  const nCad = cursos.reduce((s, c) => s + c.cadeiras.length, 0);
  const nAulas = cursos.reduce((s, c) => s + c.cadeiras.reduce((n, k) => n + k.aulas.length, 0), 0) + (partilhada?.aulas.length || 0);
  console.log(`conteudo.json: ${cursos.length} curso(s), ${nCad} cadeira(s), ${nAulas} aula(s), ${banco.length} item(ns) de produto.`);
}

main();
