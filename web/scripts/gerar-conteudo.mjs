// web/scripts/gerar-conteudo.mjs
//
// Lê as pastas do repositório (cursos/* e disciplina-partilhada) e produz:
//   - web/lib/conteudo.json  → dados que a PWA renderiza (áreas, aulas,
//     sínteses, flashcards, banco de produto)
//   - web/public/material/<area>/<ficheiro>.pdf → cópia dos PDFs de referência
//
// Corre automaticamente antes do `next build` (script "prebuild").
// Não é preciso tocar aqui para adicionar um curso: basta criar a pasta.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO = path.resolve(WEB, "..");
const OUT_JSON = path.join(WEB, "lib", "conteudo.json");
const OUT_MATERIAL = path.join(WEB, "public", "material");

const TEMAS = ["corpo", "amor", "maternidade", "prosperidade"];

// --- helpers ----------------------------------------------------------------
const existe = (p) => fs.existsSync(p);
const lerTxt = (p) => (existe(p) ? fs.readFileSync(p, "utf-8") : "");

function prettifyArea(id) {
  return id
    .replace(/^\d+[-_]/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
function prettifyAula(nome) {
  return nome.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

// Extrai flashcards (P:/R:) da síntese e devolve {flashcards, sinteseSemCards}
function extrairFlashcards(md) {
  const linhas = md.split(/\r?\n/);
  const cards = [];
  const mantidas = [];
  let pendente = null;
  for (const linha of linhas) {
    const mP = linha.match(/^\s*P:\s*(.+\S)\s*$/i);
    const mR = linha.match(/^\s*R:\s*(.+\S)\s*$/i);
    if (mP) {
      pendente = { p: mP[1].trim(), r: "" };
      continue;
    }
    if (mR && pendente) {
      pendente.r = mR[1].trim();
      cards.push(pendente);
      pendente = null;
      continue;
    }
    mantidas.push(linha);
  }
  // remove linhas em branco a mais deixadas pela extração
  const sinteseSemCards = mantidas.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return { flashcards: cards, sinteseSemCards };
}

// Divide o markdown de produto em itens etiquetados por tema [corpo] etc.
function extrairItensProduto(md, area, areaTitulo, aula) {
  const linhas = md.split(/\r?\n/);
  const itens = [];
  let atual = null;
  const flush = () => {
    if (atual && atual.texto.trim()) itens.push(atual);
    atual = null;
  };
  for (const linha of linhas) {
    const tags = [...linha.matchAll(/\[(corpo|amor|maternidade|prosperidade)\]/gi)].map((m) =>
      m[1].toLowerCase()
    );
    if (tags.length) {
      flush();
      const texto = linha.replace(/\[(corpo|amor|maternidade|prosperidade)\]/gi, "").replace(/^[\s\-*•:]+/, "").trim();
      atual = { temas: [...new Set(tags)], texto, area, areaTitulo, aula };
    } else if (atual && linha.trim()) {
      atual.texto += "\n" + linha.trim();
    } else if (atual) {
      flush();
    }
  }
  flush();
  return itens;
}

// --- recolha de áreas -------------------------------------------------------
function recolherAreas() {
  const dirs = [];
  const cursosDir = path.join(REPO, "cursos");
  if (existe(cursosDir)) {
    for (const nome of fs.readdirSync(cursosDir).sort()) {
      const d = path.join(cursosDir, nome);
      if (fs.statSync(d).isDirectory()) dirs.push({ id: nome, dir: d, tipo: "curso" });
    }
  }
  const partilhada = path.join(REPO, "disciplina-partilhada");
  if (existe(partilhada)) dirs.push({ id: "disciplina-partilhada", dir: partilhada, tipo: "partilhada" });
  return dirs;
}

// --- main -------------------------------------------------------------------
function main() {
  fs.rmSync(OUT_MATERIAL, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.mkdirSync(OUT_MATERIAL, { recursive: true });

  const areas = [];
  const banco = []; // itens de produto agregados

  for (const { id, dir, tipo } of recolherAreas()) {
    const titulo =
      tipo === "partilhada" ? "Disciplina Partilhada" : prettifyArea(id);

    // materiais (PDFs) → copiar para public/material/<id>
    const materialDir = path.join(dir, "_material");
    const materiais = [];
    if (existe(materialDir)) {
      const destDir = path.join(OUT_MATERIAL, id);
      fs.mkdirSync(destDir, { recursive: true });
      for (const f of fs.readdirSync(materialDir).sort()) {
        if (!f.toLowerCase().endsWith(".pdf")) continue;
        fs.copyFileSync(path.join(materialDir, f), path.join(destDir, f));
        materiais.push({ nome: prettifyAula(f.replace(/\.pdf$/i, "")), ficheiro: `material/${id}/${f}` });
      }
    }

    // aulas = ficheiros de síntese
    const sintDir = path.join(dir, "sinteses");
    const prodDir = path.join(dir, "produto");
    const transDir = path.join(dir, "transcricoes");
    const aulas = [];
    if (existe(sintDir)) {
      for (const f of fs.readdirSync(sintDir).sort()) {
        if (!f.endsWith(".md")) continue;
        const nome = f.replace(/\.md$/, "");
        const sinteseRaw = lerTxt(path.join(sintDir, f));
        const { flashcards, sinteseSemCards } = extrairFlashcards(sinteseRaw);
        const produtoMd = lerTxt(path.join(prodDir, `${nome}.md`));
        const itens = extrairItensProduto(produtoMd, id, titulo, prettifyAula(nome));
        banco.push(...itens);
        aulas.push({
          nome,
          titulo: prettifyAula(nome),
          sintese: sinteseSemCards,
          flashcards,
          temTranscricao: existe(path.join(transDir, `${nome}.txt`)),
        });
      }
    }

    areas.push({ id, tipo, titulo, materiais, aulas });
  }

  const conteudo = {
    geradoEm: new Date().toISOString(),
    temas: TEMAS,
    areas,
    banco,
  };
  fs.writeFileSync(OUT_JSON, JSON.stringify(conteudo, null, 2), "utf-8");

  const nAulas = areas.reduce((s, a) => s + a.aulas.length, 0);
  console.log(
    `conteudo.json gerado: ${areas.length} área(s), ${nAulas} aula(s), ${banco.length} item(ns) de produto.`
  );
}

main();
