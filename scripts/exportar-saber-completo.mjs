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
    } else if (PASTAS.has(path.basename(dir)) || nome === "programa.json" || nome === "MANUAL.md") {
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
    "**Começa por `saber/rota100k/MANUAL.md`**: compila as 20 aulas do curso por",
    "ordem de execução, com os procedimentos e todos os números num só sítio.",
    ""
  );
  linhas.push(
    "Espaço de criação de conteúdo e crescimento de audiência. Não é da pós:",
    "é conhecimento de negócio, e é o que está mais perto dos produtos.",
    `- ${contar(path.join(rotaDir, "sinteses"))} sínteses, ${contar(path.join(rotaDir, "transcricoes"))} transcrições`,
    ""
  );
}
fs.writeFileSync(path.join(destino, "INDICE.md"), linhas.join("\n"));

// 3) Secção no CLAUDE.md do viviannepag. Idempotente E atualizável: a secção
// vai entre marcadores, por isso uma versão nova SUBSTITUI a antiga em vez de
// ser ignorada (antes só se escrevia se ainda não existisse, e o texto ficava
// congelado na primeira versão para sempre).
const MARCA = "## 📚 SABER DOS CURSOS — fonte completa, DENTRO deste repo";
const INI = "<!-- saber-syntia:inicio -->";
const FIM = "<!-- saber-syntia:fim -->";
const claudeMd = path.join(vp, "CLAUDE.md");
if (fs.existsSync(claudeMd)) {
  const seccao =
    `${INI}\n\n${MARCA} (\`saber/\`)\n\n` +
      "O conhecimento COMPLETO das pós-graduações dela vive neste repositório, em\n" +
      "`saber/` — não é preciso sair do repo nem adivinhar nada:\n\n" +
      "- `saber/INDICE.md` — mapa de todos os cursos e cadeiras (começa por aqui).\n" +
      "- `saber/cursos/<curso>/<cadeira>/sinteses/*.md` — **o material principal**:\n" +
      "  resumo executivo, conceitos-chave, flashcards, definições citáveis,\n" +
      "  perguntas de avaliação, por aula.\n" +
      "- `saber/cursos/<curso>/<cadeira>/transcricoes/*.txt` — **a transcrição\n" +
      "  INTEGRAL** de cada aula, palavra por palavra, copiada byte a byte. Não é\n" +
      "  resumo nem extrato: quando precisares do que foi mesmo dito, lê daqui.\n" +
      "- `saber/cursos/<curso>/<cadeira>/{resumos,objetivos,produto}/` — resumos de\n" +
      "  unidade, objetivos e leituras orientadas.\n" +
      "- `saber/saber.json` — artefacto máquina (conceitos, metadados, banco de ideias).\n" +
      "\n### ROTA100K (`saber/rota100k/`)\n\n" +
      "Criação de conteúdo, audiência e crescimento. **Não é da pós**: é\n" +
      "conhecimento de negócio, e é o material mais diretamente aplicável aos\n" +
      "produtos. Tem a mesma forma de uma cadeira, mas sem o nível do curso:\n\n" +
      "- `saber/rota100k/MANUAL.md` — **começa por aqui**: o curso inteiro\n" +
      "  compilado por ordem de execução, com os procedimentos passo a passo, todos\n" +
      "  os números num só sítio, e uma secção que diz o que o curso NÃO desenvolve.\n" +
      "- `saber/rota100k/transcricoes/*.txt` — **a transcrição INTEGRAL** de cada\n" +
      "  aula gravada, palavra por palavra. É aqui que está tudo o que foi dito.\n" +
      "- `saber/rota100k/sinteses/*.md` — síntese por aula (resumo executivo,\n" +
      "  conceitos-chave, flashcards, definições citáveis).\n" +
      "- `saber/rota100k/produto/*.md` — o Bloco C: como cada aula se aplica aos\n" +
      "  produtos reais.\n" +
      "\nA ROTA100K **não tem módulos**: é uma lista única de aulas. Cada ficheiro\n" +
      "chama-se pelo assunto da aula, por exemplo\n" +
      "`Como_escolher_o_gancho_dos_primeiros_segundos.txt`. O título é dado a\n" +
      "partir do conteúdo da gravação, por isso é descritivo e não sequencial:\n" +
      "não contes com ordem nem com numeração.\n\n" +
      "⚠️ NÃO editar `saber/` à mão: é escrito pelo robô de sync da Syntia\n" +
      "(vivnasc/syntia) e sobrescrito a cada aula nova. Para usar o saber, lê daqui;\n" +
      "para o corrigir, corrige-se na Syntia.\n\n" +
      FIM + "\n";

  const atual = fs.readFileSync(claudeMd, "utf-8");
  let novo;
  if (atual.includes(INI) && atual.includes(FIM)) {
    // Já tem marcadores: substitui o que está entre eles.
    novo = atual.slice(0, atual.indexOf(INI)) + seccao + atual.slice(atual.indexOf(FIM) + FIM.length);
  } else if (atual.includes(MARCA)) {
    // Versão antiga, sem marcadores: corta a partir do título e põe a nova.
    novo = atual.slice(0, atual.indexOf(MARCA)).replace(/\s*---\s*$/, "\n\n---\n\n") + seccao;
  } else {
    novo = atual.replace(/\s*$/, "") + `\n\n---\n\n${seccao}`;
  }
  novo = novo.replace(/\s*$/, "\n"); // sem isto o ficheiro ganhava uma linha por
                                      // execução e o robô commitava em todos os syncs
  if (novo !== atual) {
    fs.writeFileSync(claudeMd, novo, "utf-8");
    console.error("CLAUDE.md: secção do saber escrita/atualizada.");
  } else {
    console.error("CLAUDE.md: secção do saber já estava igual.");
  }
}

console.error(`saber/ reconstruído: ${copiados} ficheiros.`);
