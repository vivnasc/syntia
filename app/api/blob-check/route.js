// Página de diagnóstico do Blob. Abre /api/blob-check no browser e ela diz,
// em português simples, se o token do Blob está configurado e se funciona —
// faz a gravação no servidor (sem CORS, sem a complexidade do upload direto),
// para isolar o problema do token de tudo o resto.
import { put } from "@vercel/blob";

function pagina(emoji, titulo, detalhe, cor) {
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
     <body style="font-family:system-ui;background:#15110d;color:#eee;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px">
       <div style="max-width:560px;text-align:center">
         <div style="font-size:54px">${emoji}</div>
         <h1 style="color:${cor};font-size:22px;margin:12px 0">${titulo}</h1>
         <p style="color:#bbb;line-height:1.5;font-size:15px">${detalhe}</p>
       </div>
     </body>`,
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

export async function GET() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return pagina(
      "❌",
      "Falta o token do Blob",
      "A variável <b>BLOB_READ_WRITE_TOKEN</b> não está configurada na Vercel. É por isso que o envio falha. Manda-me esta mensagem que eu digo-te o passo exato.",
      "#e57373"
    );
  }
  try {
    const blob = await put(`diagnostico/check-${Date.now()}.txt`, "ok", {
      access: "public",
      addRandomSuffix: true,
      contentType: "text/plain",
    });
    return pagina(
      "✅",
      "O token funciona!",
      `Gravei um ficheiro de teste com sucesso. O envio de aulas vai funcionar — podes voltar à página de envio e mandar um MP3.<br><br><span style="font-size:12px;color:#777">${blob.url}</span>`,
      "#81c784"
    );
  } catch (e) {
    return pagina(
      "⚠️",
      "O token existe mas foi recusado",
      `O Blob respondeu: <b>${(e?.message || "erro desconhecido").replace(/</g, "&lt;")}</b>.<br><br>Copia esta mensagem e manda-ma — diz-me exatamente o que corrigir (provavelmente o token está incompleto ou é de outra loja).`,
      "#ffb74d"
    );
  }
}
