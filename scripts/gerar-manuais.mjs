// scripts/gerar-manuais.mjs
//
// Escreve MANUAIS COMPLETOS em Markdown a partir de lib/conteudo.json —
// com os ENSINAMENTOS lá dentro (as sínteses inteiras, os objetivos, os
// resumos de unidade, os flashcards e os quizzes), não uma lista de títulos.
//
// Serve para ela descarregar um ficheiro e usar o conhecimento FORA daqui
// (ChatGPT, Gemini, NotebookLM). Markdown e não PDF de propósito: um PDF
// perde a estrutura e gasta o dobro dos tokens; um .md entra em qualquer
// modelo com os títulos e as listas intactos.
//
// Saída:
//   public/manual/<curso>.md                 um por curso
//   public/manual/<curso>__<cadeira>.md      um por disciplina
//   public/manual/tudo.md                    os seis cursos num ficheiro
//   lib/manuais.json                         o catálogo (a página importa daqui)
//
// Correm no prebuild, como o conteudo.json. São derivados do repositório:
// não se editam à mão e não vão para o git.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTEUDO = path.join(ROOT, "lib", "conteudo.json");
const OUT_DIR = path.join(ROOT, "public", "manual");
const OUT_INDICE = path.join(ROOT, "lib", "manuais.json");

const hoje = () =>
  new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });

// ── Markdown: juntar o material de outra pessoa sem lhe partir os títulos ──
//
// Cada síntese tem títulos próprios, mas não todas no mesmo nível: umas abrem
// em `#`, outras em `##`. Metidas debaixo de um título do manual, as de `#`
// subiam acima da aula e o índice do ChatGPT/Gemini ficava ao contrário.
//
// Por isso não se DESCE um número fixo de níveis: RE-ANCORA-SE o bloco — acha-se
// o título mais alto que lá está e desloca-se tudo para que ele caia no nível
// pedido, mantendo as distâncias entre os de baixo. Um bloco que abra em `##`
// não desperdiça o nível de cima.
//
// E quando um bloco é fundo demais para o espaço que resta, o que passa do H6
// (o markdown não tem H7) sai como linha em NEGRITO, não achatado em H6 com os
// de cima: dois níveis diferentes a virar H6 ficam indistinguíveis, e é
// exactamente a hierarquia que faz um manual navegável.
//
// Linhas dentro de ``` ficam como estão.
export function reancorar(md, alvo) {
  const linhas = String(md ?? "").split("\n");
  const niveis = [];
  let dentroDeCodigo = false;
  for (const l of linhas) {
    if (/^\s*```/.test(l)) { dentroDeCodigo = !dentroDeCodigo; continue; }
    if (dentroDeCodigo) continue;
    const m = l.match(/^(#{1,6})\s+\S/);
    if (m) niveis.push(m[1].length);
  }
  if (!niveis.length) return String(md ?? "");
  const desloca = alvo - Math.min(...niveis);
  dentroDeCodigo = false;
  return linhas
    .map((l) => {
      if (/^\s*```/.test(l)) { dentroDeCodigo = !dentroDeCodigo; return l; }
      if (dentroDeCodigo) return l;
      const m = l.match(/^(#{1,6})\s+(.*)$/);
      if (!m) return l;
      const nivel = m[1].length + desloca;
      const texto = m[2].trim();
      if (nivel > 6) return texto ? `**${texto}**` : "";
      return "#".repeat(Math.max(1, nivel)) + " " + texto;
    })
    .join("\n");
}

// Um bloco de texto entra no manual com o seu rótulo e uma linha em branco de
// cada lado — e só entra se tiver texto. Um título órfão é ruído para o modelo.
function bloco(nivel, rotulo, texto) {
  const t = String(texto ?? "").trim();
  if (!t) return [];
  return [`${"#".repeat(nivel)} ${rotulo}`, "", reancorar(t, nivel + 1), ""];
}

const slugAnc = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// ── as peças ──────────────────────────────────────────────────────────────

function aulaMd(aula, nivel) {
  const out = [`${"#".repeat(nivel)} ${aula.titulo}`, ""];
  if (aula.partes > 1) out.push(`*${aula.partes} partes.*`, "");
  const sintese = String(aula.sintese ?? "").trim();
  // Sem rótulo "Síntese": o corpo da aula É a síntese, e o rótulo custava um
  // nível de títulos que a matéria precisa mais do que ele.
  if (sintese) out.push(reancorar(sintese, nivel + 1), "");
  const cards = aula.flashcards || [];
  if (cards.length) {
    out.push(`${"#".repeat(nivel + 1)} Perguntas e respostas`, "");
    for (const c of cards) out.push(`- **${c.p}**`, `  ${c.r}`);
    out.push("");
  }
  return out;
}

function unidadeMd(u, nivel) {
  const titulo = u.titulo || (u.n ? `Unidade ${u.n}` : "Outras aulas");
  const out = [`${"#".repeat(nivel)} ${titulo}`, ""];
  out.push(...bloco(nivel + 1, "Objetivos da unidade", u.objetivos));
  out.push(...bloco(nivel + 1, "Resumo da unidade", u.resumo));
  out.push(...bloco(nivel + 1, "Leitura complementar", u.complementar));
  for (const a of u.aulas || []) out.push(...aulaMd(a, nivel + 1));
  const quiz = u.quiz || [];
  if (quiz.length) {
    out.push(`${"#".repeat(nivel + 1)} Avaliação da unidade`, "");
    quiz.forEach((q, i) => {
      out.push(`**${i + 1}. ${q.p}**`, "");
      (q.opcoes || []).forEach((o, j) => {
        out.push(`- ${String.fromCharCode(97 + j)}) ${o}${j === q.correta ? "  ← correta" : ""}`);
      });
      if (q.explica) out.push("", `*${q.explica}*`);
      out.push("");
    });
  }
  return out;
}

function cadeiraMd(cadeira, nivel) {
  const out = [`${"#".repeat(nivel)} ${cadeira.titulo}`, ""];
  if (cadeira.ementa?.length) {
    out.push("No programa, esta disciplina cobre:", "");
    for (const t of cadeira.ementa) out.push(`- ${t}`);
    out.push("");
  }
  for (const u of comConteudo(cadeira)) out.push(...unidadeMd(u, nivel + 1));
  return out;
}

// Uma unidade só conta se trouxer ensinamento: uma síntese, um objetivo, um
// resumo. Uma unidade com o título e mais nada enche o ficheiro e não ensina.
function comConteudo(cadeira) {
  return (cadeira.unidades || []).filter(
    (u) =>
      (u.aulas || []).some((a) => (a.sintese || "").trim() || (a.flashcards || []).length) ||
      (u.objetivos || "").trim() ||
      (u.resumo || "").trim()
  );
}

const cadeirasComConteudo = (curso) =>
  (curso.cadeiras || []).filter((k) => comConteudo(k).length > 0);

function contar(cadeiras) {
  let aulas = 0;
  let cards = 0;
  let quiz = 0;
  for (const k of cadeiras)
    for (const u of comConteudo(k)) {
      quiz += (u.quiz || []).length;
      for (const a of u.aulas || []) {
        aulas += 1;
        cards += (a.flashcards || []).length;
      }
    }
  return { disciplinas: cadeiras.length, aulas, cards, quiz };
}

// ── o cabeçalho: o ficheiro tem de se explicar a quem o abrir ──────────────
//
// Quando ela larga isto no ChatGPT ou no Gemini, o modelo não sabe o que está
// a ler. Estas linhas dizem-lho: de quem é a matéria, de que curso, o que lá
// está e como o usar. Sem isto, um modelo responde por cima do material dela.
function cabecalho(titulo, subtitulo, n, indice) {
  return [
    `# ${titulo}`,
    "",
    subtitulo,
    "",
    `Material de estudo compilado a ${hoje()} · ${n.disciplinas} disciplina${n.disciplinas === 1 ? "" : "s"} · ` +
      `${n.aulas} aula${n.aulas === 1 ? "" : "s"} · ${n.cards} perguntas de revisão · ${n.quiz} perguntas de avaliação.`,
    "",
    "> **Para quem está a ler isto num modelo de linguagem.** Este documento é a",
    "> matéria das pós-graduações da Vivianne Nascimento, sintetizada aula a aula",
    "> a partir das aulas originais. Responde a partir daqui e cita a disciplina e",
    "> a unidade de onde tiraste cada coisa. Quando a resposta não estiver neste",
    "> documento, diz que não está em vez de a completares por fora.",
    "",
    "---",
    "",
    "## Índice",
    "",
    ...indice,
    "",
    "---",
    "",
  ];
}

function escrever(ficheiro, linhas) {
  const md = linhas.join("\n").replace(/\n{4,}/g, "\n\n\n").trim() + "\n";
  fs.writeFileSync(path.join(OUT_DIR, ficheiro), md, "utf-8");
  return Buffer.byteLength(md, "utf8");
}

// ── main ──────────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(CONTEUDO)) {
    console.error("manuais: falta lib/conteudo.json — corre primeiro gerar-conteudo.mjs.");
    process.exit(1);
  }
  const dados = JSON.parse(fs.readFileSync(CONTEUDO, "utf-8"));
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const cursos = [];
  const todoOIndice = [];
  const todoOCorpo = [];

  for (const curso of dados.cursos || []) {
    const cadeiras = cadeirasComConteudo(curso);
    if (!cadeiras.length) continue;

    const n = contar(cadeiras);
    const indice = cadeiras.map((k) => `- [${k.titulo}](#${slugAnc(k.titulo)})`);
    const corpo = cadeiras.flatMap((k) => cadeiraMd(k, 2));

    const ficheiro = `${curso.id}.md`;
    const bytes = escrever(ficheiro, [
      ...cabecalho(curso.titulo, `Manual completo do curso — a matéria inteira, disciplina a disciplina.`, n, indice),
      ...corpo,
    ]);

    // as disciplinas, uma a uma, para ela poder levar só a de que precisa
    const disciplinas = [];
    for (const k of cadeiras) {
      const nk = contar([k]);
      const fk = `${curso.id}__${k.id}.md`;
      const bk = escrever(fk, [
        ...cabecalho(
          k.titulo,
          `Disciplina de *${curso.titulo}* — a matéria inteira, unidade a unidade.`,
          nk,
          comConteudo(k).map((u) => `- [${u.titulo || `Unidade ${u.n}`}](#${slugAnc(u.titulo || `unidade-${u.n}`)})`)
        ),
        ...comConteudo(k).flatMap((u) => unidadeMd(u, 2)),
      ]);
      disciplinas.push({ id: k.id, titulo: k.titulo, ficheiro: fk, bytes: bk, ...nk });
    }

    cursos.push({ id: curso.id, titulo: curso.titulo, ficheiro, bytes, ...n, disciplinas });
    todoOIndice.push(`- [${curso.titulo}](#${slugAnc(curso.titulo)})`);
    todoOCorpo.push(`# ${curso.titulo}`, "", ...cadeiras.flatMap((k) => cadeiraMd(k, 2)));
  }

  const nTudo = cursos.reduce(
    (a, c) => ({
      disciplinas: a.disciplinas + c.disciplinas.length,
      aulas: a.aulas + c.aulas,
      cards: a.cards + c.cards,
      quiz: a.quiz + c.quiz,
    }),
    { disciplinas: 0, aulas: 0, cards: 0, quiz: 0 }
  );
  const bytesTudo = escrever("tudo.md", [
    ...cabecalho(
      "Pós-graduações — a matéria toda",
      `${cursos.length} cursos num ficheiro só.`,
      nTudo,
      todoOIndice
    ),
    ...todoOCorpo,
  ]);

  const indice = { feitoEm: new Date().toISOString(), cursos, tudo: { ficheiro: "tudo.md", bytes: bytesTudo, ...nTudo } };
  fs.writeFileSync(OUT_INDICE, JSON.stringify(indice, null, 2), "utf-8");

  const mb = (b) => (b / (1024 * 1024)).toFixed(2);
  for (const c of cursos) console.log(`manual: ${c.ficheiro.padEnd(44)} ${mb(c.bytes)} MB · ${c.aulas} aulas · ${c.disciplinas.length} disciplinas`);
  console.log(`manual: tudo.md ${mb(bytesTudo)} MB · ${nTudo.aulas} aulas · ${nTudo.disciplinas} disciplinas`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
