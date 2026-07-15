// Conversor mínimo de Markdown -> blocos estruturados, para depois desenhar no
// PDF (react-pdf não percebe markdown nem HTML). Cobre o que os resumos e
// objetivos realmente usam: títulos (#..####), parágrafos, listas (- e 1.),
// tabelas estilo GitHub (| ... | com linha ---), citações (>), régua (---) e
// formatação inline **negrito**, *itálico* e `código`.

// As fontes padrão do react-pdf (Helvetica/Times) só cobrem o Latin-1 + os
// extras do WinAnsi. Um caractere fora disso (≠, →, ≈, símbolos, emoji…) faz o
// cálculo de layout rebentar ("unsupported number") e o PDF nem gera. Trocamos
// os símbolos comuns por equivalentes seguros e removemos o resto.
// Extras do WinAnsi permitidos além do Latin-1 (aspas curvas, travessões, …, •, €, ™…).
const WINANSI_EXTRA = new Set([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160,
  0x2039, 0x0152, 0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014,
  0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e, 0x0178,
]);
const SUBST = {
  "≠": "!=", "→": "->", "←": "<-", "↔": "<->",
  "≈": "~", "≤": "<=", "≥": ">=", "⇒": "=>",
  "′": "'", "″": '"', " ": " ",
};
export function sanitizarPdf(s) {
  if (!s) return "";
  let out = "";
  for (const ch of String(s).normalize("NFC")) {
    const cp = ch.codePointAt(0);
    if (SUBST[ch] != null) { out += SUBST[ch]; continue; }
    if (cp <= 0xff || WINANSI_EXTRA.has(cp)) { out += ch; continue; }
    // Caractere não suportado e sem equivalente: remove (evita o crash).
    // (mantém-se o espaço à volta, não parte palavras.)
  }
  return out;
}

function parseInline(text) {
  const runs = [];
  const re = /(\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\n]+)\*|_([^_\n]+)_|`([^`]+)`)/g;
  let last = 0;
  let m;
  const push = (o) => runs.push({ ...o, text: sanitizarPdf(o.text) });
  while ((m = re.exec(text))) {
    if (m.index > last) push({ text: text.slice(last, m.index) });
    if (m[2] != null) push({ text: m[2], bold: true });
    else if (m[3] != null) push({ text: m[3], bold: true });
    else if (m[4] != null) push({ text: m[4], italic: true });
    else if (m[5] != null) push({ text: m[5], italic: true });
    else if (m[6] != null) push({ text: m[6], code: true });
    last = re.lastIndex;
  }
  if (last < text.length) push({ text: text.slice(last) });
  return runs.length ? runs : [{ text: sanitizarPdf(text || "") }];
}

function splitRow(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

const RE_BLOCK_START = /^(#{1,6}\s|>\s?|\s*[-*+]\s+|\s*\d+[.)]\s+|---+\s*$)/;

export function parseMarkdown(md) {
  const lines = (md || "").replace(/\r/g, "").split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    // Régua horizontal
    if (/^---+\s*$/.test(line.trim())) { blocks.push({ type: "hr" }); i++; continue; }

    // Título
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { blocks.push({ type: "h", level: h[1].length, runs: parseInline(h[2].trim()) }); i++; continue; }

    // Tabela: linha com | seguida de separador |---|
    if (line.includes("|") && i + 1 < lines.length &&
        /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes("-")) {
      const header = splitRow(line).map(parseInline);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
        rows.push(splitRow(lines[i]).map(parseInline));
        i++;
      }
      blocks.push({ type: "table", header, rows });
      continue;
    }

    // Citação
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      blocks.push({ type: "quote", runs: parseInline(buf.join(" ")) });
      continue;
    }

    // Lista não ordenada. Junta as linhas de continuação (indentadas) ao item e
    // mantém itens separados por linha em branco dentro da mesma lista.
    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(/^\s*[-*+]\s+(.*)$/);
        if (m) {
          let text = m[1];
          i++;
          while (i < lines.length && lines[i].trim() && /^\s+/.test(lines[i]) && !/^\s*[-*+]\s+/.test(lines[i]) && !/^\s*\d+[.)]\s+/.test(lines[i])) { text += " " + lines[i].trim(); i++; }
          items.push(parseInline(text));
        } else if (!lines[i].trim()) {
          let j = i + 1;
          while (j < lines.length && !lines[j].trim()) j++;
          if (j < lines.length && /^\s*[-*+]\s+/.test(lines[j])) { i = j; continue; }
          break;
        } else break;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Lista ordenada. Igual à não ordenada, mas preserva o número da fonte (para
    // numerar 1, 2, 3… mesmo com continuações e linhas em branco entre itens).
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = [];
      const nums = [];
      while (i < lines.length) {
        const m = lines[i].match(/^\s*(\d+)[.)]\s+(.*)$/);
        if (m) {
          nums.push(parseInt(m[1], 10));
          let text = m[2];
          i++;
          while (i < lines.length && lines[i].trim() && /^\s+/.test(lines[i]) && !/^\s*[-*+]\s+/.test(lines[i]) && !/^\s*\d+[.)]\s+/.test(lines[i])) { text += " " + lines[i].trim(); i++; }
          items.push(parseInline(text));
        } else if (!lines[i].trim()) {
          let j = i + 1;
          while (j < lines.length && !lines[j].trim()) j++;
          if (j < lines.length && /^\s*\d+[.)]\s+/.test(lines[j])) { i = j; continue; }
          break;
        } else break;
      }
      blocks.push({ type: "ol", items, nums });
      continue;
    }

    // Parágrafo (junta linhas até quebra/bloco novo)
    const buf = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !RE_BLOCK_START.test(lines[i]) && !lines[i].includes("|")) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", runs: parseInline(buf.join(" ")) });
  }
  return blocks;
}
