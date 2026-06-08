// scripts/processar.mjs
// Percorre todas as pastas cursos/<curso>/_audio, transcreve cada áudio
// que ainda não tenha transcrição, e gera síntese (Bloco A+B) e produto (Bloco C).

import fs from "node:fs";
import path from "node:path";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const CURSOS_DIR = "cursos";
const PROMPT_MESTRE = fs.readFileSync("prompts/prompt-mestre.md", "utf-8");
const AUDIO_EXT = [".mp3", ".m4a", ".wav", ".mp4", ".aac", ".ogg", ".flac"];

// ---- Transcrição via Groq (Whisper large v3) ----
async function transcrever(caminhoAudio) {
  const dados = fs.readFileSync(caminhoAudio);
  const form = new FormData();
  form.append("file", new Blob([dados]), path.basename(caminhoAudio));
  form.append("model", "whisper-large-v3");
  form.append("language", "pt");
  form.append("response_format", "text");

  const resp = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
    body: form,
  });
  if (!resp.ok) {
    throw new Error(`Groq falhou (${resp.status}): ${await resp.text()}`);
  }
  return await resp.text();
}

// ---- Processamento via API do Claude ----
async function processarComClaude(transcricao) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-opus-4-8",
      max_tokens: 8000,
      messages: [
        { role: "user", content: `${PROMPT_MESTRE}\n\n=== TRANSCRIÇÃO ===\n${transcricao}` },
      ],
    }),
  });
  if (!resp.ok) {
    throw new Error(`Claude falhou (${resp.status}): ${await resp.text()}`);
  }
  const data = await resp.json();
  return data.content.map((b) => (b.type === "text" ? b.text : "")).join("\n");
}

// ---- Separa Bloco C (produto) do resto (síntese) ----
function separarBlocos(saida) {
  const marcadorC = saida.indexOf("BLOCO C");
  if (marcadorC === -1) return { sintese: saida, produto: "" };
  // recua até ao início da linha do separador do Bloco C
  let inicio = saida.lastIndexOf("\n", marcadorC);
  const sintese = saida.slice(0, inicio).trim();
  const produto = saida.slice(inicio).trim();
  return { sintese, produto };
}

// ---- Loop principal ----
async function main() {
  if (!fs.existsSync(CURSOS_DIR)) {
    console.log("Pasta cursos/ não existe ainda.");
    return;
  }
  const cursos = fs.readdirSync(CURSOS_DIR).filter((c) =>
    fs.statSync(path.join(CURSOS_DIR, c)).isDirectory()
  );

  for (const curso of cursos) {
    const audioDir = path.join(CURSOS_DIR, curso, "_audio");
    if (!fs.existsSync(audioDir)) continue;

    const transDir = path.join(CURSOS_DIR, curso, "transcricoes");
    const sintDir = path.join(CURSOS_DIR, curso, "sinteses");
    const prodDir = path.join(CURSOS_DIR, curso, "produto");
    [transDir, sintDir, prodDir].forEach((d) => fs.mkdirSync(d, { recursive: true }));

    const audios = fs
      .readdirSync(audioDir)
      .filter((f) => AUDIO_EXT.includes(path.extname(f).toLowerCase()));

    for (const audio of audios) {
      const nomeBase = path.basename(audio, path.extname(audio));
      const txtPath = path.join(transDir, `${nomeBase}.txt`);

      if (fs.existsSync(txtPath)) {
        console.log(`[${curso}] ${audio} já processado, salto.`);
        continue;
      }

      console.log(`[${curso}] A transcrever ${audio}...`);
      const transcricao = await transcrever(path.join(audioDir, audio));
      fs.writeFileSync(txtPath, transcricao, "utf-8");

      console.log(`[${curso}] A processar com o Claude...`);
      const saida = await processarComClaude(transcricao);
      const { sintese, produto } = separarBlocos(saida);

      fs.writeFileSync(path.join(sintDir, `${nomeBase}.md`), sintese, "utf-8");
      fs.writeFileSync(path.join(prodDir, `${nomeBase}.md`), produto, "utf-8");
      console.log(`[${curso}] ${audio} concluído.`);
    }
  }
  console.log("=== PROCESSAMENTO COMPLETO ===");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
