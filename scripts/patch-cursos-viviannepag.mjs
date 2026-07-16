// Atualiza o lib/infografico/cursos.ts do viviannepag a partir do saber.json da
// Syntia, IN-PLACE e de forma GENÉRICA/AUTÓNOMA:
//
//  - Para cada curso do saber.json (conceitosCurso[key]) com conceitos que
//    cheguem (>= MIN):
//      · se já existe um bloco com esse id -> troca só a lista de `conceitos`;
//      · se ainda não existe -> CRIA um bloco novo (nome/descrição/paleta vêm
//        de saber.cursosMeta) e insere-o no array CURSOS.
//  - Nunca reescreve o ficheiro todo: preserva imports, getCurso(),
//    conceitosDosCursos(), comentários e qualquer outro export.
//  - Se um curso ainda tem poucos conceitos (< MIN), não lhe toca.
//  - Repõe conceitosDosCursos() se faltar (15+ motores importam-na).
//
// Os filtros de domínio (limpar OSM da constelação, tirar a parte clínica das
// neurociências) já foram aplicados na Syntia — aqui só se escreve o que vem.
//
// Uso: node scripts/patch-cursos-viviannepag.mjs <cursos.ts existente> <saber.json>
//      (escreve o ficheiro atualizado no stdout; diagnóstico no stderr)

import fs from "node:fs";

const MIN = 8;         // mínimo de conceitos para um curso entrar/atualizar
const CAP = Infinity;  // sem teto: injeta-se a biblioteca toda

const cursosPath = process.argv[2];
const saberPath = process.argv[3] || "public/saber.json";

let texto = fs.readFileSync(cursosPath, "utf-8");
const saber = JSON.parse(fs.readFileSync(saberPath, "utf-8"));
const cc = saber.conceitosCurso || {};
const meta = saber.cursosMeta || {};

const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
const log = (m) => process.stderr.write(m + "\n");
const corpoDe = (lista) => lista.slice(0, CAP).map((x) => `      '${esc(x)}',`).join("\n");

let atualizados = 0, criados = 0;

for (const key of Object.keys(cc)) {
  const lista = Array.isArray(cc[key]) ? cc[key] : [];
  if (lista.length < MIN) {
    log(`- ${key}: ${lista.length} conceitos (< ${MIN}) — ainda não toco (à espera de conteúdo)`);
    continue;
  }
  const corpo = corpoDe(lista);

  // Já existe um bloco com este id? (tolerante ao espaçamento)
  const reBloco = new RegExp(`(id:\\s*'${key}'[\\s\\S]*?conceitos:\\s*\\[)([\\s\\S]*?)(\\])`);
  if (reBloco.test(texto)) {
    texto = texto.replace(reBloco, (_m, ini, _antigo, fim) => `${ini}\n${corpo}\n    ${fim}`);
    atualizados++;
    log(`✓ ${key}: ${lista.length} conceitos atualizados`);
    continue;
  }

  // Não existe — cria um bloco novo a partir dos metadados e insere no CURSOS.
  const m = meta[key] || {};
  const nome = esc(m.nome || key);
  const desc = esc(m.descricao || "");
  const mundo = esc(m.mundo || "escola");
  const novo =
    `  {\n` +
    `    id: '${esc(key)}',\n` +
    `    nome: '${nome}',\n` +
    `    descricao: '${desc}',\n` +
    `    mundo: '${mundo}',\n` +
    `    conceitos: [\n${corpo}\n    ],\n` +
    `  },\n`;

  const reArr = /(export const CURSOS:\s*Curso\[\]\s*=\s*\[[\s\S]*?)(\n\];)/;
  if (!reArr.test(texto)) {
    log(`! ${key}: não encontrei o array CURSOS para inserir — ignoro (não parto nada)`);
    continue;
  }
  texto = texto.replace(reArr, (_m, arr, fim) => `${arr}\n${novo.replace(/\n$/, "")}${fim}`);
  criados++;
  log(`＋ ${key}: curso NOVO criado no viviannepag (${lista.length} conceitos, paleta ${mundo})`);
}

// Rede de segurança: repõe conceitosDosCursos() se faltar (idempotente).
if (!/conceitosDosCursos/.test(texto)) {
  const FN = [
    "",
    "// Cerebro academico: TODA a biblioteca de conceitos dos cursos, rotulada por",
    "// curso. Injetada como profundidade nos motores (nunca a superficie).",
    "// (_seed/_n mantidos por compatibilidade; ja nao se amostra, injeta-se tudo.)",
    "export function conceitosDosCursos(_seed = 0, _n = 0): string {",
    "  return CURSOS",
    "    .map((c) => `${c.nome}: ${c.conceitos.join(' · ')}`)",
    "    .join('\\n');",
    "}",
    "",
  ].join("\n");
  texto = texto.replace(/\s*$/, "\n") + FN;
  log("+ conceitosDosCursos estava em falta — repus a função");
}

log(`\nCursos atualizados: ${atualizados} · criados: ${criados}`);
process.stdout.write(texto);
