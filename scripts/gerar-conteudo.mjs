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

function lerAulas(cadeiraDir, fonte, banco) {
  const sintDir = path.join(cadeiraDir, "sinteses");
  const prodDir = path.join(cadeiraDir, "produto");
  const transDir = path.join(cadeiraDir, "transcricoes");
  const aulas = [];
  if (!isDir(sintDir)) return aulas;
  for (const f of fs.readdirSync(sintDir).sort()) {
    if (!f.endsWith(".md")) continue;
    const nome = f.replace(/\.md$/, "");
    const { flashcards, sinteseSemCards } = extrairFlashcards(lerTxt(path.join(sintDir, f)));
    const produtoMd = lerTxt(path.join(prodDir, `${nome}.md`));
    banco.push(...extrairItensProduto(produtoMd, { ...fonte, aula: prettify(nome) }));
    aulas.push({
      nome,
      titulo: prettify(nome),
      sintese: sinteseSemCards,
      flashcards,
      temTranscricao: existe(path.join(transDir, `${nome}.txt`)),
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
        const ementa = disc.ementa || [];
        if (disc.partilhada) {
          // disciplina comum: o conteúdo vive na disciplina-partilhada.
          cadeiras.push({ id: disc.id, titulo: disc.titulo, ementa, partilhada: true, materiais: [], aulas: [] });
          continue;
        }
        const cadDir = path.join(cursoDir, disc.id);
        const materiais = copiarMaterial(path.join(cadDir, "_material"), `${cursoId}/${disc.id}`);
        const aulas = isDir(cadDir)
          ? lerAulas(cadDir, { curso: cursoId, cursoTitulo, cadeira: disc.id, areaTitulo: `${cursoTitulo} · ${disc.titulo}` }, banco)
          : [];
        cadeiras.push({ id: disc.id, titulo: disc.titulo, ementa, materiais, aulas });
      }
      // Pastas de conteúdo que não constam do programa — não perder nada.
      for (const cadId of fs.readdirSync(cursoDir).sort()) {
        if (ESPECIAIS.has(cadId) || cadId.startsWith(".") || cadId === "programa.json" || usados.has(cadId)) continue;
        const cadDir = path.join(cursoDir, cadId);
        if (!isDir(cadDir)) continue;
        const cadTitulo = prettify(cadId);
        const materiais = copiarMaterial(path.join(cadDir, "_material"), `${cursoId}/${cadId}`);
        const aulas = lerAulas(cadDir, { curso: cursoId, cursoTitulo, cadeira: cadId, areaTitulo: `${cursoTitulo} · ${cadTitulo}` }, banco);
        cadeiras.push({ id: cadId, titulo: cadTitulo, ementa: [], materiais, aulas });
      }
      cursos.push({ id: cursoId, titulo: cursoTitulo, materiais: materiaisCurso, cadeiras });
    }
  }

  // Disciplina partilhada — cadeira comum aos 3 (uma só vez)
  let partilhada = null;
  const partDir = path.join(ROOT, "disciplina-partilhada");
  if (isDir(partDir)) {
    const titulo = "Disciplina Partilhada";
    const materiais = copiarMaterial(path.join(partDir, "_material"), "disciplina-partilhada");
    const aulas = lerAulas(partDir, { curso: "disciplina-partilhada", cursoTitulo: titulo, cadeira: "", areaTitulo: titulo }, banco);
    partilhada = { id: "disciplina-partilhada", titulo, materiais, aulas };
  }

  const conteudo = { geradoEm: new Date().toISOString(), temas: TEMAS, cursos, partilhada, banco };
  fs.writeFileSync(OUT_JSON, JSON.stringify(conteudo, null, 2), "utf-8");

  const nCad = cursos.reduce((s, c) => s + c.cadeiras.length, 0);
  const nAulas = cursos.reduce((s, c) => s + c.cadeiras.reduce((n, k) => n + k.aulas.length, 0), 0) + (partilhada?.aulas.length || 0);
  console.log(`conteudo.json: ${cursos.length} curso(s), ${nCad} cadeira(s), ${nAulas} aula(s), ${banco.length} item(ns) de produto.`);
}

main();
