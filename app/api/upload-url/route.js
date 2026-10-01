// Prepara um upload direto browser → Supabase Storage.
// O servidor (com a service-role key) cria um "signed upload URL": um link
// temporário e autorizado para UM ficheiro. O ficheiro em si nunca passa pelo
// servidor, por isso não há limite de tamanho. Garante também que o bucket
// público existe.
import { createClient } from "@supabase/supabase-js";

const BUCKET = "aulas";

export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return Response.json({ error: "Supabase não configurado (faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY)." }, { status: 500 });
  }

  let filename = "ficheiro";
  try {
    const body = await request.json();
    if (body?.filename) filename = body.filename;
  } catch {}

  const supa = createClient(url, serviceKey, { auth: { persistSession: false } });

  // Cria o bucket público se ainda não existir (idempotente).
  await supa.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  const seguro = String(filename).split(/[\\/]/).pop()
    .replace(/\s+/g, "_")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "") || "ficheiro";
  const caminho = `${Date.now()}-${seguro}`;

  const { data, error } = await supa.storage.from(BUCKET).createSignedUploadUrl(caminho);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const publicUrl = encodeURI(`${url.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${caminho}`);
  // signedUrl explícito para o browser poder enviar com XHR e assim ter barra de
  // progresso (o uploadToSignedUrl do supabase-js não reporta progresso nenhum).
  // Construído à mão em vez de usar data.signedUrl, que muda de forma entre
  // versões do cliente (ora relativo, ora absoluto).
  const signedUrl = `${url.replace(/\/$/, "")}/storage/v1/object/upload/sign/${BUCKET}/${encodeURIComponent(caminho)}?token=${encodeURIComponent(data.token)}`;
  return Response.json({ path: data.path, token: data.token, publicUrl, signedUrl });
}
