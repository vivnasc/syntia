// Autoriza uploads diretos para o Vercel Blob.
// O browser pede aqui um token de upload; o ficheiro vai direto browser → Blob,
// por isso não passa pelo limite de tamanho das funções da Vercel.
//
// Não restringimos tipos de ficheiro (é uma ferramenta privada) e damos um
// sufixo aleatório ao nome guardado para nunca colidir com um upload anterior
// — o nome original da aula viaja à parte no /api/ingest, por isso a etiqueta
// da aula é preservada.
import { handleUpload } from "@vercel/blob/client";

export async function POST(request) {
  const body = await request.json();
  try {
    const json = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => ({
        addRandomSuffix: true,
        maximumSizeInBytes: 1024 * 1024 * 1024, // 1 GB
      }),
      // O disparo do pipeline é feito pelo cliente via /api/ingest depois do
      // upload terminar, por isso aqui não é preciso fazer nada.
      onUploadCompleted: async () => {},
    });
    return Response.json(json);
  } catch (e) {
    return Response.json({ error: e.message || "Falha no upload." }, { status: 400 });
  }
}
