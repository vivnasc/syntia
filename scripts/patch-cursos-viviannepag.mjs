// Atualiza APENAS as listas de `conceitos` dentro do lib/infografico/cursos.ts
// EXISTENTE do viviannepag, a partir do saber.json da Syntia.
//
// Porque é IN-PLACE (e não reescreve o ficheiro todo):
//  - preserva TUDO o resto do ficheiro: imports, a função conceitosDosCursos(),
//    getCurso(), tipos, comentários e quaisquer exports que o viviannepag tenha.
//    (Uma reescrita total apagava a conceitosDosCursos e partia o build.)
//  - para cada curso, só troca o bloco `conceitos: [ ... ],` do bloco cujo
//    `id` corresponde.
//  - se a Syntia ainda não tiver conceitos suficientes para um curso (< MIN),
//    NÃO toca nesse curso — mantém exatamente o que já lá está.
//
// Uso: node scripts/patch-cursos-viviannepag.mjs <cursos.ts existente> <saber.json>
//      (escreve o ficheiro atualizado no stdout)

import fs from "node:fs";

const MIN = 8;    // mínimo de conceitos da Syntia para substituir (senão mantém)
const CAP = 200;  // teto de segurança (a app injeta a biblioteca toda; sem cortar de facto)

const cursosPath = process.argv[2];
const saberPath = process.argv[3] || "public/saber.json";

let texto = fs.readFileSync(cursosPath, "utf-8");
const saber = JSON.parse(fs.readFileSync(saberPath, "utf-8"));
const cc = saber.conceitosCurso || {};

const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
const IDS = ["transpessoal", "constelacao", "espiritualidade", "desenvolvimento"];

let trocados = 0;
for (const id of IDS) {
  const lista = Array.isArray(cc[id]) ? cc[id] : [];
  if (lista.length < MIN) {
    process.stderr.write(`- ${id}: só ${lista.length} conceitos da Syntia (< ${MIN}) — mantenho o que já lá está\n`);
    continue;
  }
  const corpo = lista.slice(0, CAP).map((x) => `      '${esc(x)}',`).join("\n");

  // Encontra o bloco do curso pelo id e substitui só o array de conceitos desse
  // bloco (do 'conceitos: [' até ao ']' de fecho). Tolerante ao espaçamento
  // (uma linha ou várias). Os conceitos não contêm ']', por isso o não-guloso
  // pára no fecho certo; o 'descricao' é string de aspas simples, sem ']'.
  const re = new RegExp(
    `(id:\\s*'${id}'[\\s\\S]*?conceitos:\\s*\\[)([\\s\\S]*?)(\\])`
  );
  if (!re.test(texto)) {
    process.stderr.write(`! ${id}: bloco não encontrado no ficheiro — não mexo\n`);
    continue;
  }
  texto = texto.replace(re, (_m, ini, _antigo, fim) => `${ini}\n${corpo}\n    ${fim}`);
  trocados++;
  process.stderr.write(`✓ ${id}: ${Math.min(lista.length, CAP)} conceitos atualizados\n`);
}

// Rede de segurança: se a função conceitosDosCursos não existir no ficheiro
// (ex.: uma versão anterior do robô apagou-a), repõe-na. 15+ motores importam-na;
// sem ela o build parte. É idempotente — só entra quando falta.
if (!/conceitosDosCursos/.test(texto)) {
  const FN = [
    "",
    "// Cerebro academico: TODA a biblioteca de conceitos das 4 pos-graduacoes,",
    "// rotulada por curso. Injetada como profundidade nos motores (nunca a superficie).",
    "// (_seed/_n mantidos por compatibilidade; ja nao se amostra, injeta-se tudo.)",
    "export function conceitosDosCursos(_seed = 0, _n = 0): string {",
    "  return CURSOS",
    "    .map((c) => `${c.nome}: ${c.conceitos.join(' · ')}`)",
    "    .join('\\n');",
    "}",
    "",
  ].join("\n");
  texto = texto.replace(/\s*$/, "\n") + FN;
  process.stderr.write("+ conceitosDosCursos estava em falta — repus a função\n");
}

process.stderr.write(`\nCursos atualizados: ${trocados}/${IDS.length}\n`);
process.stdout.write(texto);
