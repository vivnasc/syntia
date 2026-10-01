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

  // Cria o bucket público se ainda não existir (idempotente) e tenta subir o
  // limite de tamanho: uma gravação de ecrã tem centenas de MB e o limite por
  // omissão do projeto é bem mais baixo do que isso. O pedido pode ser cortado
  // pelo plano do Supabase — por isso não assumimos que resultou: a seguir
  // perguntamos ao bucket qual é o limite que ele tem MESMO, e é esse que vai
  // para o browser.
  const LIMITE_PEDIDO = 5 * 1024 * 1024 * 1024; // 5 GB
  await supa.storage.createBucket(BUCKET, { public: true, fileSizeLimit: LIMITE_PEDIDO }).catch(() => {});
  await supa.storage.updateBucket(BUCKET, { public: true, fileSizeLimit: LIMITE_PEDIDO }).catch(() => {});

  let limite = null;
  try {
    const { data: b } = await supa.storage.getBucket(BUCKET);
    const bruto = b?.file_size_limit ?? b?.fileSizeLimit ?? null;
    if (typeof bruto === "number") limite = bruto;
    else if (typeof bruto === "string") {
      // pode vir como "50MB"/"5GB"
      const m = bruto.trim().match(/^([\d.]+)\s*([KMG]?B)?$/i);
      if (m) {
        const mult = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 }[(m[2] || "B").toUpperCase()] || 1;
        limite = Math.round(parseFloat(m[1]) * mult);
      }
    }
  } catch { /* se não der para saber, o browser não bloqueia nada */ }

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
  return Response.json({ path: data.path, token: data.token, publicUrl, signedUrl, limite });
}
