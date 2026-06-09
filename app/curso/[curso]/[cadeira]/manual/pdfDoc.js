// Desenho do manual em PDF (react-pdf), em JS puro com React.createElement —
// sem JSX, para poder ser usado tanto pelo componente cliente como por um
// script de teste em Node. É a ÚNICA fonte de verdade do aspeto do manual.
//
// Ideia central: nada de texto corrido monótono. O markdown é agrupado em
// secções (cada título "possui" o conteúdo até ao título seguinte) e cada
// nível ganha um tratamento visual próprio — secções com barra de cor,
// conceitos como cartões, e palavras-chave (definição/reflexão/reter/atenção)
// como CAIXAS DE DESTAQUE. Títulos nunca ficam órfãos no fim da página.

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { parseMarkdown } from "./mdToPdf.js";

const h = React.createElement;

const INK = "#1a1a1a", SOFT = "#555555", GOLD = "#6b4f1d", LINE = "#cfc7b8";

const s = StyleSheet.create({
  page: { paddingTop: 46, paddingBottom: 58, paddingHorizontal: 50, fontFamily: "Helvetica", fontSize: 10.5, color: INK, lineHeight: 1.5 },

  // Capa
  cover: { flexGrow: 1, justifyContent: "center" },
  coverCurso: { fontFamily: "Helvetica-Bold", fontSize: 11, color: GOLD, letterSpacing: 1.5, textTransform: "uppercase" },
  coverTitulo: { fontFamily: "Times-Bold", fontSize: 30, marginTop: 10, marginBottom: 12, lineHeight: 1.15 },
  coverRule: { borderBottomWidth: 2, borderBottomColor: GOLD, width: 90, marginBottom: 16 },
  coverSub: { fontSize: 10, color: SOFT },
  coverEmentaLabel: { marginTop: 32, fontFamily: "Helvetica-Bold", fontSize: 9, color: SOFT, letterSpacing: 1, textTransform: "uppercase" },
  coverEmentaItem: { fontSize: 10.5, marginTop: 4, paddingLeft: 10 },

  // Unidade
  uniHead: { fontFamily: "Times-Bold", fontSize: 21, marginBottom: 2 },
  uniKicker: { fontFamily: "Helvetica-Bold", fontSize: 9, color: GOLD, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 },
  uniRule: { borderBottomWidth: 2, borderBottomColor: GOLD, marginBottom: 12, marginTop: 4 },

  // Etiqueta de secção principal (objetivos/resumo/aulas)
  secLabel: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: "#fff", backgroundColor: GOLD, letterSpacing: 1, textTransform: "uppercase", paddingVertical: 3, paddingHorizontal: 8, borderRadius: 3, marginTop: 16, marginBottom: 8, alignSelf: "flex-start" },

  // Títulos do markdown
  h1: { fontFamily: "Times-Bold", fontSize: 15, marginTop: 12, marginBottom: 5 },
  h2bar: { flexDirection: "row", alignItems: "center", marginTop: 12, marginBottom: 6 },
  h2tick: { width: 4, height: 14, backgroundColor: GOLD, marginRight: 7, borderRadius: 2 },
  h2text: { fontFamily: "Helvetica-Bold", fontSize: 12.5 },

  // Texto
  p: { marginBottom: 6, textAlign: "justify" },
  b: { fontFamily: "Helvetica-Bold" }, i: { fontFamily: "Helvetica-Oblique" }, code: { fontFamily: "Courier", fontSize: 9.5, color: "#7a3b12" },
  hr: { borderBottomWidth: 1, borderBottomColor: LINE, marginVertical: 8 },

  // Listas
  list: { marginBottom: 6 }, li: { flexDirection: "row", marginBottom: 2.5 }, bullet: { width: 14, color: GOLD, fontFamily: "Helvetica-Bold" }, liText: { flex: 1 },

  // Cartão de conceito (títulos nível 3+ com corpo)
  card: { backgroundColor: "#faf7ef", borderLeftWidth: 3, borderLeftColor: GOLD, borderRadius: 4, padding: 9, marginTop: 8, marginBottom: 8 },
  cardTitle: { fontFamily: "Helvetica-Bold", fontSize: 11, color: "#5a431a", marginBottom: 4 },

  // Caixa de destaque (callout)
  callout: { borderRadius: 5, padding: 10, marginVertical: 9, borderLeftWidth: 4 },
  calloutLabel: { fontFamily: "Helvetica-Bold", fontSize: 8, letterSpacing: 1, textTransform: "uppercase", marginBottom: 5 },

  // Tabela
  table: { marginVertical: 8, borderWidth: 1, borderColor: LINE, borderRadius: 3 },
  trow: { flexDirection: "row" }, thead: { backgroundColor: "#f0ebe0" },
  cell: { padding: 5, borderRightWidth: 1, borderBottomWidth: 1, borderColor: LINE },
  thText: { fontFamily: "Helvetica-Bold", fontSize: 9.5 }, tdText: { fontSize: 9.5 },

  // Aulas
  aulaBox: { backgroundColor: "#f7f5ef", borderRadius: 5, padding: 10, marginTop: 4 },
  aulaItem: { flexDirection: "row", marginBottom: 3 }, aulaNum: { width: 16, color: GOLD, fontFamily: "Helvetica-Bold" }, aulaText: { flex: 1 }, aulaMeta: { color: SOFT },

  pageNum: { position: "absolute", bottom: 26, left: 50, right: 50, textAlign: "center", fontSize: 8, color: SOFT },
  footRule: { position: "absolute", bottom: 40, left: 50, right: 50, borderBottomWidth: 0.5, borderBottomColor: LINE },
});

// Caixas de destaque por palavra-chave no título.
const CALLOUTS = [
  { re: /(reflex|pergunt|auto-?aval|reflet|pense|questõe)/, label: "Para refletir", bg: "#f2eefb", bar: "#7c5cbf", fg: "#5a3fae" },
  { re: /(reter|reten|pontos?-?chave|memoriz|fixar|essencial|síntese|sintese|importante|atenção|atencao|nota)/, label: "A reter", bg: "#fbf5e3", bar: GOLD, fg: "#7a5a16" },
  { re: /(atividade|actividade|prepar|exerc|aplicaç|aplicac|prática|pratica)/, label: "Preparar / atividades", bg: "#eaf3ee", bar: "#3f8a5c", fg: "#2f6b46" },
  { re: /(exemplo|caso|ilustra)/, label: "Exemplo", bg: "#eef2f7", bar: "#4a6fa5", fg: "#355488" },
  { re: /(defini|conceito)/, label: "Definição", bg: "#f5f1ff", bar: "#6a55c0", fg: "#4f3da6" },
];
const semAcento = (t) => (t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
function classify(runs) {
  const t = semAcento(runs.map((r) => r.text).join(" "));
  for (const c of CALLOUTS) if (c.re.test(t)) return c;
  return null;
}

function Runs(runs, style) {
  return h(Text, { style }, runs.map((r, i) => {
    const st = [];
    if (r.bold) st.push(s.b); if (r.italic) st.push(s.i); if (r.code) st.push(s.code);
    return st.length ? h(Text, { key: i, style: st }, r.text) : r.text;
  }));
}

function Table(b, key) {
  const cols = Math.max(1, b.header.length); const w = `${100 / cols}%`;
  const Row = (cells, head, k) => h(View, { key: k, style: [s.trow, head ? s.thead : null], wrap: false },
    Array.from({ length: cols }).map((_, ci) => h(View, { key: ci, style: [s.cell, { width: w }] }, Runs(cells[ci] || [{ text: "" }], head ? s.thText : s.tdText))));
  return h(View, { key, style: s.table }, [Row(b.header, true, "h"), ...b.rows.map((r, ri) => Row(r, false, ri))]);
}

function Leaf(b, key) {
  switch (b.type) {
    case "p": return h(View, { key }, Runs(b.runs, s.p));
    case "hr": return h(View, { key, style: s.hr });
    case "ul": return b.items.map((it, i) => h(View, { key: i, style: s.li }, [h(Text, { key: "b", style: s.bullet }, "•"), Runs(it, s.liText)]));
    case "ol": return b.items.map((it, i) => h(View, { key: i, style: s.li }, [h(Text, { key: "b", style: s.bullet }, `${i + 1}.`), Runs(it, s.liText)]));
    case "table": return Table(b, key);
    default: return null;
  }
}

// Agrupa os blocos planos numa árvore: cada título "possui" o que vem a seguir
// até ao próximo título de nível igual ou superior.
function nest(blocks) {
  const root = []; const stack = [{ level: 0, children: root }];
  for (const b of blocks) {
    if (b.type === "h") {
      const node = { kind: "section", level: b.level, runs: b.runs, children: [] };
      while (stack[stack.length - 1].level >= b.level) stack.pop();
      stack[stack.length - 1].children.push(node);
      stack.push(node);
    } else {
      stack[stack.length - 1].children.push({ kind: "leaf", block: b });
    }
  }
  return root;
}

// Achata a árvore num fluxo de elementos. Títulos de secção (níveis 1 e 2)
// NÃO embrulham o conteúdo numa View — devolvem [título, ...filhos] em linha,
// para o texto fluir naturalmente entre páginas (senão a secção salta inteira
// e deixa metade da página em branco). Só cartões e caixas ficam contidos.
function renderChildren(children, prefix) {
  const out = [];
  children.forEach((n, idx) => {
    const r = renderNode(n, prefix + ":" + idx);
    if (Array.isArray(r)) out.push(...r);
    else if (r) out.push(r);
  });
  return out.map((el, i) => (el ? React.cloneElement(el, { key: `${prefix}#${i}` }) : null));
}

function renderNode(node, prefix) {
  if (node.kind === "leaf") return Leaf(node.block, prefix);

  const kw = classify(node.runs);
  const titleText = node.runs.map((r) => r.text).join("");
  const kids = renderChildren(node.children, prefix);

  // Caixa de destaque (callout) — título + conteúdo numa caixa colorida contida.
  if (kw) {
    return h(View, { style: [s.callout, { backgroundColor: kw.bg, borderLeftColor: kw.bar }], minPresenceAhead: 36 }, [
      h(Text, { key: "l", style: [s.calloutLabel, { color: kw.fg }] }, kw.label),
      h(Text, { key: "t", style: s.cardTitle }, titleText),
      ...kids,
    ]);
  }

  // Conceito (nível 3+) com corpo -> cartão contido.
  if (node.level >= 3 && node.children.length) {
    return h(View, { style: s.card, minPresenceAhead: 36 }, [
      h(Text, { key: "t", style: s.cardTitle }, titleText),
      ...kids,
    ]);
  }

  // Secção (níveis 1 e 2): o título é COLADO à primeira linha do conteúdo num
  // bloco que não parte (wrap:false), por isso nunca fica sozinho no fundo da
  // página. O resto do conteúdo flui livremente a seguir.
  const bar = node.level === 2
    ? h(View, { key: "hb", style: s.h2bar, wrap: false }, [h(View, { key: "t", style: s.h2tick }), h(Text, { key: "x", style: s.h2text }, titleText)])
    : h(View, { key: "hb", style: { marginTop: 10 } }, Runs(node.runs, s.h1));
  const first = kids.length ? kids[0] : null;
  const rest = kids.slice(1);
  const bonded = h(View, { wrap: false, minPresenceAhead: 28 }, first ? [bar, first] : [bar]);
  return [bonded, ...rest];
}

function Markdown(md, prefix) {
  return renderChildren(nest(parseMarkdown(md)), prefix);
}

export function buildManualDocument({ curso, cadeira, unidades, hoje }) {
  return h(Document, { title: `${cadeira.titulo} — Manual`, author: "SyntIA" }, [
    // Capa
    h(Page, { key: "cap", size: "A4", style: s.page }, h(View, { style: s.cover }, [
      h(Text, { key: 1, style: s.coverCurso }, curso.titulo),
      h(Text, { key: 2, style: s.coverTitulo }, cadeira.titulo),
      h(View, { key: 3, style: s.coverRule }),
      h(Text, { key: 4, style: s.coverSub }, `Manual de estudo · gerado a ${hoje}`),
      (cadeira.ementa && cadeira.ementa.length)
        ? h(View, { key: 5 }, [
            h(Text, { key: "l", style: s.coverEmentaLabel }, "No programa"),
            ...cadeira.ementa.map((t, i) => h(Text, { key: i, style: s.coverEmentaItem }, `•  ${t}`)),
          ])
        : null,
    ])),

    // Uma unidade por página (flui se transbordar)
    ...unidades.map((u) => h(Page, { key: u.n, size: "A4", style: s.page }, [
      h(Text, { key: "k", style: s.uniKicker }, `Unidade ${u.n}`),
      h(Text, { key: "hd", style: s.uniHead }, u.titulo),
      h(View, { key: "r", style: s.uniRule }),

      u.objetivos ? h(Text, { key: "ol", style: s.secLabel }, "Objetivos & auto-avaliação") : null,
      ...(u.objetivos ? Markdown(u.objetivos, `u${u.n}obj`) : []),

      u.resumo ? h(Text, { key: "rl", style: s.secLabel }, "Resumo da unidade") : null,
      ...(u.resumo ? Markdown(u.resumo, `u${u.n}res`) : []),

      (u.aulas && u.aulas.length) ? h(Text, { key: "al", style: s.secLabel }, "Aulas desta unidade") : null,
      (u.aulas && u.aulas.length) ? h(View, { key: "ab", style: s.aulaBox }, u.aulas.map((a, i) =>
        h(View, { key: i, style: s.aulaItem }, [
          h(Text, { key: 1, style: s.aulaNum }, `${i + 1}.`),
          h(Text, { key: 2, style: s.aulaText }, [a.titulo, a.flashcards ? h(Text, { key: "m", style: s.aulaMeta }, `   ·   ${a.flashcards} flashcards`) : null]),
        ]))) : null,

      h(View, { key: "fr", style: s.footRule, fixed: true }),
      h(Text, { key: "pn", style: s.pageNum, fixed: true, render: ({ pageNumber, totalPages }) => `${curso.titulo} · ${cadeira.titulo}      ${pageNumber} / ${totalPages}` }),
    ])),
  ]);
}
