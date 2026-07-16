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

const MIN = 8;         // mínimo de conceitos para substituir (senão mantém o atual)
const CAP = Infinity;  // sem teto: injeta-se a biblioteca toda (custo é ~cêntimos/mês)

// Constelação: a matéria carregada mistura conceitos reais de constelação
// (Ordens do Amor, Emaranhamento, Pertencimento…) com ruído de administração
// (OSM, administração científica, teoria burocrática) que veio nas mesmas aulas.
// Estratégia:
//  - se NÃO houver sinais de constelação, usa a lista à mão (MAO_CONSTELACAO);
//  - se houver, mantém os conceitos da Syntia mas TIRA o ruído de OSM (LIXO)
//    e reforça com o vocabulário de Hellinger que faltar.
const SINAIS_CONSTELACAO = /hellinger|ordens do amor|lealdad|perten|constela|sist[eé]mica familiar|campo morfogen|parentifica|emaranha/i;
const LIXO_CONSTELACAO = /organograma|fluxograma|formul[áa]rio|\bosm\b|administra[çc]|burocr|revolu[çc][ãa]o industrial|estrutura organizacional|[áa]reas funcionais|fun[çc][õo]es administrativ|escola das rela[çc]|teoria cl[áa]ssica|teoria comportamental|\blayout\b|reorganiza|^\s*organiza[çc][ãa]o\s*$|^\s*m[ée]todo\s*$/i;
const MAO_CONSTELACAO = [
  "As Ordens do Amor",
  "O direito de pertencer",
  "Dar e receber em equilíbrio",
  "Lealdades invisíveis",
  "O campo morfogenético",
  "Parentificação: ser mãe da mãe",
  "O sintoma como amor",
  "Amor cego vs amor consciente",
  "Segredos e excluídos do sistema",
  "Emaranhamentos transgeracionais",
  "Hierarquia e ordem de chegada",
  "Frases de solução (frases que curam)",
];

const cursosPath = process.argv[2];
const saberPath = process.argv[3] || "public/saber.json";

let texto = fs.readFileSync(cursosPath, "utf-8");
const saber = JSON.parse(fs.readFileSync(saberPath, "utf-8"));
const cc = saber.conceitosCurso || {};

const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
const IDS = ["transpessoal", "constelacao", "espiritualidade", "desenvolvimento"];

let trocados = 0;
for (const id of IDS) {
  let lista = Array.isArray(cc[id]) ? cc[id] : [];

  // Constelação: limpar o ruído de OSM e garantir o vocabulário de Hellinger.
  if (id === "constelacao") {
    if (!lista.some((x) => SINAIS_CONSTELACAO.test(x))) {
      process.stderr.write("~ constelacao: sem sinais de constelação — uso a lista à mão até chegarem as aulas de Hellinger\n");
      lista = MAO_CONSTELACAO;
    } else {
      const limpa = lista.filter((x) => !LIXO_CONSTELACAO.test(x));
      const vistos = new Set(limpa.map((s) => s.toLowerCase()));
      const reforco = MAO_CONSTELACAO.filter((h) => !vistos.has(h.toLowerCase()));
      const removidos = lista.length - limpa.length;
      lista = [...limpa, ...reforco];
      process.stderr.write(`~ constelacao: removi ${removidos} termos de OSM/administração e reforcei com ${reforco.length} de Hellinger\n`);
    }
  }

  if (lista.length < MIN) {
    process.stderr.write(`- ${id}: só ${lista.length} conceitos (< ${MIN}) — mantenho o que já lá está\n`);
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
