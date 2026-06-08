// Autoriza uploads diretos para o Vercel Blob.
// O browser pede aqui um token de upload; só o concedemos se o código de
// acesso (UPLOAD_PASSCODE) bater certo. O ficheiro vai direto browser → Blob,
// por isso não passa pelo limite de tamanho das funções da Vercel.
import { handleUpload } from "@vercel/blob/client";

const TIPOS_AUDIO = [
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/aac",
  "audio/flac",
  "audio/webm",
  "application/octet-stream",
];

export async function POST(request) {
  const body = await request.json();
  try {
    const json = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => {
        // Sem proteção por código: qualquer pedido pode obter um token de upload.
        return {
          allowedContentTypes: TIPOS_AUDIO,
          maximumSizeInBytes: 500 * 1024 * 1024, // 500 MB
        };
      },
      // O disparo do pipeline é feito pelo cliente via /api/ingest depois do
      // upload terminar, por isso aqui não é preciso fazer nada.
      onUploadCompleted: async () => {},
    });
    return Response.json(json);
  } catch (e) {
    return Response.json({ error: e.message || "Falha no upload." }, { status: 400 });
  }
}
