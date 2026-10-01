// Exporta o SABER COMPLETO da Syntia para dentro do clone do viviannepag.
//
// A ponte antiga levava só as listas de conceitos (cursos.ts). Esta leva TUDO
// o que é textual — as sínteses integrais, transcrições, resumos, objetivos,
// produto e o saber.json — para `<vp>/saber/`, organizado por curso/cadeira,
// com um INDICE.md gerado e uma secção no CLAUDE.md do viviannepag (acrescentada
// uma única vez, de forma idempotente) a dizer às sessões de lá onde está o saber.
//
// Uso: node scripts/exportar-saber-completo.mjs <dir do clone do viviannepag>
//
// Regras:
//  - `saber/` é apagado e reconstruído a cada corrida (fonte de verdade = Syntia);
//  - nunca copia _audio nem _material (binários pesados ficam de fora);
//  - nunca toca em nada fora de saber/ e da secção própria do CLAUDE.md.
import fs from "node:fs";
import path from "node:path";

const vp = process.argv[2];
if (!vp || !fs.existsSync(vp)) {
  console.error("Uso: node scripts/exportar-saber-completo.mjs <clone do viviannepag>");
  process.exit(1);
}

const PASTAS = new Set(["sinteses", "resumos", "objetivos", "produto", "transcricoes"]);
// Raízes que a ponte leva para o viviannepag. Além dos cursos da pós, as áreas
// de topo: a disciplina-partilhada e a rota100k (criação de conteúdo).
const RAIZES = ["cursos", "disciplina-partilhada", "rota100k"].filter((r) => fs.existsSync(r));
const destino = path.join(vp, "saber");

// 1) Reconstruir saber/ do zero.
fs.rmSync(destino, { recursive: true, force: true });
fs.mkdirSync(destino, { recursive: true });

let copiados = 0;
function copiar(rel) {
  const alvo = path.join(destino, rel);
  fs.mkdirSync(path.dirname(alvo), { recursive: true });
  fs.copyFileSync(rel, alvo);
  copiados++;
}
function percorrer(dir) {
  for (const nome of fs.readdirSync(dir)) {
    const rel = path.join(dir, nome);
    const st = fs.statSync(rel);
    if (st.isDirectory()) {
      if (nome === "_audio" || nome === "_material") continue;
      percorrer(rel);
    } else if (PASTAS.has(path.basename(dir)) || nome === "programa.json") {
      copiar(rel);
    }
  }
}
for (const raiz of RAIZES) percorrer(raiz);
if (fs.existsSync("public/saber.json")) {
  fs.copyFileSync("public/saber.json", path.join(destino, "saber.json"));
  copiados++;
}

// 2) Gerar o INDICE.md.
const linhas = [
  "# Saber dos cursos — fonte completa (Syntia)",
  "",
  "Copiado automaticamente do repositório da Syntia (vivnasc/syntia). NÃO editar",
  "à mão: o robô de sync sobrescreve a cada aula nova.",
  "",
  "Estrutura: `saber/cursos/<curso>/<cadeira>/{sinteses,resumos,objetivos,produto,transcricoes}/`.",
  "As **sínteses** são o material principal (resumo executivo, conceitos-chave,",
  "flashcards, definições citáveis, perguntas de avaliação). As **transcrições**",
  "são o texto bruto das aulas. `saber.json` é o artefacto máquina.",
  "",
];
const contar = (p) => (fs.existsSync(p) ? fs.readdirSync(p).length : 0);
const cursosDir = path.join(destino, "cursos");
if (fs.existsSync(cursosDir)) {
  for (const curso of fs.readdirSync(cursosDir).sort()) {
    const cdir = path.join(cursosDir, curso);
    if (!fs.statSync(cdir).isDirectory()) continue;
    let titulo = curso;
    const prog = path.join(cdir, "programa.json");
    if (fs.existsSync(prog)) {
      try { titulo = JSON.parse(fs.readFileSync(prog, "utf-8")).curso || curso; } catch {}
    }
    linhas.push(`## ${titulo}  (\`${curso}\`)`);
    for (const cad of fs.readdirSync(cdir).sort()) {
      const p = path.join(cdir, cad);
      if (!fs.statSync(p).isDirectory()) continue;
      linhas.push(`- \`${cad}\` — ${contar(path.join(p, "sinteses"))} sínteses, ${contar(path.join(p, "transcricoes"))} transcrições`);
    }
    linhas.push("");
  }
}
if (fs.existsSync(path.join(destino, "disciplina-partilhada"))) {
  linhas.push("## Disciplina partilhada (`disciplina-partilhada`)", "");
}
const rotaDir = path.join(destino, "rota100k");
if (fs.existsSync(rotaDir)) {
  linhas.push(
    "## ROTA100K  (`rota100k`)",
    "",
    "Espaço de criação de conteúdo e crescimento de audiência. Não é da pós:",
    "é conhecimento de negócio, e é o que está mais perto dos produtos.",
    `- ${contar(path.join(rotaDir, "sinteses"))} sínteses, ${contar(path.join(rotaDir, "transcricoes"))} transcrições`,
    ""
  );
}
fs.writeFileSync(path.join(destino, "INDICE.md"), linhas.join("\n"));

// 3) Secção no CLAUDE.md do viviannepag (idempotente: só se ainda não existir).
const MARCA = "## 📚 SABER DOS CURSOS — fonte completa, DENTRO deste repo";
const claudeMd = path.join(vp, "CLAUDE.md");
if (fs.existsSync(claudeMd) && !fs.readFileSync(claudeMd, "utf-8").includes(MARCA)) {
  fs.appendFileSync(
    claudeMd,
    `\n\n---\n\n${MARCA} (\`saber/\`)\n\n` +
      "O conhecimento COMPLETO das pós-graduações dela vive neste repositório, em\n" +
      "`saber/` — não é preciso sair do repo nem adivinhar nada:\n\n" +
      "- `saber/INDICE.md` — mapa de todos os cursos e cadeiras (começa por aqui).\n" +
      "- `saber/cursos/<curso>/<cadeira>/sinteses/*.md` — **o material principal**:\n" +
      "  resumo executivo, conceitos-chave, flashcards, definições citáveis,\n" +
      "  perguntas de avaliação, por aula.\n" +
      "- `saber/cursos/<curso>/<cadeira>/transcricoes/*.txt` — texto bruto das aulas.\n" +
      "- `saber/cursos/<curso>/<cadeira>/{resumos,objetivos,produto}/` — resumos de\n" +
      "  unidade, objetivos e leituras orientadas.\n" +
      "- `saber/saber.json` — artefacto máquina (conceitos, metadados, banco de ideias).\n" +
      "- `saber/rota100k/` — **ROTA100K**: criação de conteúdo, audiência e\n" +
      "  crescimento. Não é da pós, é conhecimento de negócio; é o material mais\n" +
      "  diretamente aplicável aos produtos.\n\n" +
      "⚠️ NÃO editar `saber/` à mão: é escrito pelo robô de sync da Syntia\n" +
      "(vivnasc/syntia) e sobrescrito a cada aula nova. Para usar o saber, lê daqui;\n" +
      "para o corrigir, corrige-se na Syntia.\n"
  );
  console.error("CLAUDE.md: secção do saber acrescentada.");
}

console.error(`saber/ reconstruído: ${copiados} ficheiros.`);
