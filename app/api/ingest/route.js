// Recebe o URL do áudio (já no Blob) + o curso/cadeira escolhidos e dispara a
// Action "Processar Aulas" no GitHub (workflow_dispatch), que vai buscar o
// áudio, transcreve e faz commit da síntese/flashcards/produto.
//
// O token do GitHub vive só aqui, no servidor — nunca chega ao browser.
import { getCursos, getPartilhada } from "../../../lib/conteudo";

const EXT_OK = /\.(mp3|m4a|wav|mp4|aac|ogg|flac|webm|pdf|txt|md)$/i;

function sanitizarNome(nome) {
  const base = String(nome || "").split(/[\\/]/).pop() || "";
  return base.replace(/\s+/g, "_").replace(/[^\w.\-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const { url, curso, cadeira, filename, modo, unidade } = payload || {};
  const modoFinal = modo === "material" ? "material" : modo === "consolidar" ? "consolidar" : "aula";
  const consolidar = modoFinal === "consolidar";

  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    return Response.json({ error: "Falta configurar GITHUB_DISPATCH_TOKEN no servidor." }, { status: 500 });
  }

  let nomeFicheiro = "";
  if (!consolidar) {
    if (!url || typeof url !== "string" || !url.startsWith("https://")) {
      return Response.json({ error: "URL do áudio em falta." }, { status: 400 });
    }
    nomeFicheiro = sanitizarNome(filename);
    if (!EXT_OK.test(nomeFicheiro)) {
      return Response.json({ error: "Tipo de ficheiro não suportado (usa MP3, PDF ou txt)." }, { status: 400 });
    }
  }

  // Constrói o caminho de destino (disciplina), validando contra o programa.
  let areaDir;
  let destinoTitulo;
  const partilhada = getPartilhada();
  if (partilhada && curso === partilhada.id) {
    areaDir = "disciplina-partilhada";
    destinoTitulo = partilhada.titulo;
  } else {
    const c = getCursos().find((x) => x.id === curso);
    if (!c) return Response.json({ error: "Curso desconhecido." }, { status: 400 });

    const disc = c.cadeiras.find((k) => !k.partilhada && (k.id === cadeira || k.titulo === cadeira));
    if (!disc) return Response.json({ error: "Disciplina desconhecida neste curso." }, { status: 400 });

    areaDir = `cursos/${c.id}/${disc.id}`;
    destinoTitulo = `${c.titulo} · ${disc.titulo}`;
  }

  const repo = process.env.GH_REPO || "vivnasc/syntia";
  const ref = process.env.GH_BRANCH || "main";

  const resp = await fetch(
    `https://api.github.com/repos/${repo}/actions/workflows/processar.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref,
        inputs: {
          audio_url: consolidar ? "" : url,
          curso: areaDir,
          filename: nomeFicheiro,
          modo: modoFinal,
          unidade: consolidar ? String(unidade || "") : "",
        },
      }),
    }
  );

  if (resp.status !== 204) {
    const texto = await resp.text();
    return Response.json(
      { error: `GitHub recusou o disparo (${resp.status}): ${texto.slice(0, 300)}` },
      { status: 502 }
    );
  }

  return Response.json({ ok: true, destino: destinoTitulo, filename: nomeFicheiro });
}
