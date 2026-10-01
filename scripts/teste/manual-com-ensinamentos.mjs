// scripts/teste/manual-com-ensinamentos.mjs
//
// O PORTÃO do manual. O manual que já existia por cadeira compilava os TÍTULOS
// das aulas e a contagem de flashcards — abria bonito e não ensinava nada. Isso
// não se vê a olho: o ficheiro existe, descarrega, tem páginas. Só se vê quando
// ela o larga no ChatGPT e o modelo não sabe responder.
//
// Por isso a régua não é "o manual existe": é "o manual tem a MATÉRIA lá
// dentro". Mede-se o texto por aula, procura-se uma frase real da síntese
// dentro do ficheiro, e confirma-se que nenhum título da matéria dela subiu
// acima do título da aula onde vive.
//
//   node scripts/teste/manual-com-ensinamentos.mjs

import fs from "node:fs";
import path from "node:path";
import { reancorar } from "../gerar-manuais.mjs";

const ROOT = path.resolve(import.meta.dirname, "..", "..");
const DIR = path.join(ROOT, "public", "manual");
const INDICE = path.join(ROOT, "lib", "manuais.json");

let ok = 0;
const falhas = [];
const t = (nome, cond, detalhe = "") => {
  if (cond) ok += 1;
  else falhas.push(`${nome}${detalhe ? ` — ${detalhe}` : ""}`);
};

// ── 1. reancorar: a mecânica dos títulos ──────────────────────────────────

t(
  "um bloco que abre em ## re-ancora no nível pedido",
  reancorar("## Topo\n\ntexto", 5).startsWith("##### Topo")
);
t(
  "um bloco que abre em # re-ancora no mesmo nível pedido",
  reancorar("# Topo\n\ntexto", 5).startsWith("##### Topo")
);
t(
  "as distâncias entre títulos mantêm-se",
  reancorar("# A\n## B\n### C", 4) === "#### A\n##### B\n###### C"
);
t(
  "o que passa do H6 sai em negrito, não achatado em H6",
  reancorar("# A\n## B\n### C\n#### D", 4) === "#### A\n##### B\n###### C\n**D**",
  JSON.stringify(reancorar("# A\n## B\n### C\n#### D", 4))
);
t(
  "dois níveis fundos não viram o mesmo H6",
  (() => {
    const r = reancorar("# A\n## B\n### C\n#### D\n##### E", 4).split("\n");
    return r[2] === "###### C" && r[3] === "**D**" && r[4] === "**E**";
  })()
);
t(
  "o que está dentro de ``` não se toca",
  reancorar("## Topo\n\n```\n# isto é código\n```", 5).includes("\n# isto é código\n")
);
t("um bloco sem títulos passa intacto", reancorar("só texto\noutra linha", 5) === "só texto\noutra linha");
t("um bloco vazio não rebenta", reancorar("", 5) === "" && reancorar(null, 5) === "");

// ── 2. os ficheiros existem e o catálogo bate com eles ────────────────────

t("o catálogo lib/manuais.json existe", fs.existsSync(INDICE));
if (!fs.existsSync(INDICE)) {
  console.error("sem catálogo — corre `npm run gerar` primeiro.");
  process.exit(1);
}
const cat = JSON.parse(fs.readFileSync(INDICE, "utf-8"));
t("o catálogo tem cursos", (cat.cursos || []).length > 0, `${(cat.cursos || []).length}`);
t("o catálogo tem o ficheiro de tudo", !!cat.tudo?.ficheiro);

const ler = (f) => fs.readFileSync(path.join(DIR, f), "utf-8");
const conteudo = JSON.parse(fs.readFileSync(path.join(ROOT, "lib", "conteudo.json"), "utf-8"));

for (const c of cat.cursos || []) {
  const nome = c.id;
  t(`[${nome}] o ficheiro do curso existe`, fs.existsSync(path.join(DIR, c.ficheiro)));
  if (!fs.existsSync(path.join(DIR, c.ficheiro))) continue;
  const md = ler(c.ficheiro);

  t(`[${nome}] o tamanho no catálogo bate com o ficheiro`, Buffer.byteLength(md, "utf8") === c.bytes);

  // ── A RÉGUA: matéria por aula. Um manual de títulos dá ~60 caracteres por
  // aula; um manual com as sínteses dá milhares. 2000 é um chão largo, de
  // propósito — não é para medir qualidade, é para apanhar um manual vazio.
  const porAula = md.length / Math.max(1, c.aulas);
  t(`[${nome}] tem matéria a sério por aula (≥2000 car.)`, porAula >= 2000, `${Math.round(porAula)} car./aula`);

  t(`[${nome}] nenhum título passa do H6`, !/^#{7,}\s/m.test(md));
  t(`[${nome}] diz a quem o ler o que é`, md.includes("num modelo de linguagem"));
  t(`[${nome}] tem índice`, md.includes("## Índice"));
  t(`[${nome}] tem perguntas de revisão`, md.includes("Perguntas e respostas"));

  // ── a frase real: vai-se ao conteúdo e procura-se uma passagem da síntese
  // de uma aula DENTRO do manual. É isto que um manual de títulos não passa.
  const curso = conteudo.cursos.find((x) => x.id === c.id);
  const aulas = [];
  const unidades = [];
  for (const k of curso.cadeiras || [])
    for (const u of k.unidades || []) {
      unidades.push(u);
      for (const a of u.aulas || []) if ((a.sintese || "").length > 400) aulas.push(a);
    }

  // Os objetivos e os resumos de unidade só se exigem onde a FONTE os tem —
  // mas aí exigem-se, senão um manual que os deixasse cair passava calado.
  // (O 05 tem quatro aulas e nenhuma unidade com objetivos: é a matéria que
  // ainda não subiu, não um buraco do manual.)
  for (const [campo, rotulo] of [["objetivos", "Objetivos da unidade"], ["resumo", "Resumo da unidade"]]) {
    const naFonte = unidades.some((u) => (u[campo] || "").trim());
    t(`[${nome}] ${naFonte ? "traz" : "não inventa"} ${rotulo.toLowerCase()}`, md.includes(rotulo) === naFonte);
  }
  t(`[${nome}] há aulas com síntese para medir`, aulas.length > 0);

  // três amostras espalhadas — a primeira, a do meio e a última
  const amostra = [aulas[0], aulas[Math.floor(aulas.length / 2)], aulas[aulas.length - 1]].filter(Boolean);
  for (const a of amostra) {
    const frase = (a.sintese.match(/[^\n#*>|]{90,200}\./g) || [])[0];
    if (!frase) continue;
    t(`[${nome}] a síntese de «${a.titulo}» está no manual`, md.includes(frase.trim()), frase.trim().slice(0, 60) + "…");
    t(`[${nome}] o título de «${a.titulo}» está no manual`, md.includes(a.titulo));
  }

  // ── A INVERSÃO, que é o bug que a re-ancoragem existe para evitar: um
  // título da matéria dela a ficar ao nível (ou acima) da estrutura do manual.
  // Não se adivinha pelo nível — compara-se com os títulos que o manual tem
  // DIREITO de pôr em cada nível. Qualquer outro título em H1-H4 é matéria que
  // escapou para cima, e o índice do ChatGPT sai ao contrário.
  const permitidos = {
    1: new Set([curso.titulo]),
    2: new Set(["Índice", ...(curso.cadeiras || []).map((k) => k.titulo)]),
    3: new Set((curso.cadeiras || []).flatMap((k) => (k.unidades || []).map((u) => u.titulo || (u.n ? `Unidade ${u.n}` : "Outras aulas")))),
    4: new Set([
      "Objetivos da unidade", "Resumo da unidade", "Leitura complementar", "Avaliação da unidade",
      ...(curso.cadeiras || []).flatMap((k) => (k.unidades || []).flatMap((u) => (u.aulas || []).map((a) => a.titulo))),
    ]),
  };
  const intrusos = [];
  for (const l of md.split("\n")) {
    const m = l.match(/^(#{1,4})\s+(.*)$/);
    if (!m) continue;
    const texto = m[2].trim();
    if (!permitidos[m[1].length].has(texto)) intrusos.push(`H${m[1].length} «${texto}»`);
  }
  t(`[${nome}] nenhum título da matéria sobe para a estrutura`, intrusos.length === 0, `${intrusos.length}: ${intrusos.slice(0, 3).join(" · ")}`);

  // ── e por disciplina, para ela poder levar só uma
  for (const k of c.disciplinas || []) {
    t(`[${nome}/${k.id}] o ficheiro da disciplina existe`, fs.existsSync(path.join(DIR, k.ficheiro)));
    if (!fs.existsSync(path.join(DIR, k.ficheiro))) continue;
    const mk = ler(k.ficheiro);
    t(`[${nome}/${k.id}] tem matéria por aula`, mk.length / Math.max(1, k.aulas) >= 2000, `${Math.round(mk.length / Math.max(1, k.aulas))}`);
    t(`[${nome}/${k.id}] cabe no manual do curso`, mk.length < md.length + 4096);
  }
}

// ── 3. o ficheiro de tudo ─────────────────────────────────────────────────
const tudo = ler(cat.tudo.ficheiro);
t("tudo.md tem todos os cursos", (cat.cursos || []).every((c) => tudo.includes(`# ${c.titulo}`)));
t("tudo.md é maior do que o maior curso", tudo.length > Math.max(...cat.cursos.map((c) => c.bytes)));
t("tudo.md soma as aulas de todos os cursos", cat.tudo.aulas === cat.cursos.reduce((a, c) => a + c.aulas, 0));

// ── fim ───────────────────────────────────────────────────────────────────
if (falhas.length) {
  console.error(`manual: ${ok} ✓ · ${falhas.length} ✗`);
  for (const f of falhas) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`manual: ${ok} ✓`);
