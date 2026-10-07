"use client";
import { useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "aulas";
const EXT_OK = /\.(mp3|m4a|wav|mp4|aac|ogg|flac|webm|mov|m4v|pdf|docx|txt|md)$/i;
// Vídeo: entra, mas é um engano caro. A Syntia só ouve a FALA — a imagem não
// serve para nada aqui. Uma aula de 10 min: ~1 GB em vídeo, ~5 MB em áudio.
// (1/out: ela arrastou 15 gravações de ecrã de 1,07 GB; a caixa dizia "MP3, PDF
// ou txt" e o filtro aceitava .mp4 em silêncio. Começou 15 GB sem ninguém a
// avisar, e ao fim de 5 minutos ainda ia no primeiro.)
const EXT_VIDEO = /\.(mp4|webm|mov|m4v)$/i;
// Estimativa honesta a 20 Mbps de upload (um valor comum em casa). Serve para
// ela VER o que está a começar, não para prometer rapidez.
const tempo = (bytes) => {
  const h = (bytes * 8) / (20 * 1e6) / 3600;
  if (h < 1 / 60) return `${Math.max(1, Math.round(h * 3600))} s`;
  if (h < 1) return `${Math.round(h * 60)} min`;
  return `${h.toFixed(1)} h`;
};
const unidadeDe = (nome) => {
  const m = nome.match(/^U(\d+)/i);
  return m ? `U${m[1]}` : null;
};

// Cliente Supabase (criado uma vez, se as variáveis existirem).
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supa = SUPA_URL && SUPA_ANON ? createClient(SUPA_URL, SUPA_ANON) : null;

// "412,7 MB" — para ela perceber logo porque é que um envio demora.
function tamanho(bytes) {
  if (!bytes && bytes !== 0) return "";
  const u = ["B", "KB", "MB", "GB"];
  let n = bytes, i = 0;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

// Envia com XHR para poder reportar progresso. O uploadToSignedUrl do
// supabase-js não expõe progresso nenhum, e numa gravação de ecrã de centenas
// de MB isso deixa o ecrã parado em "a enviar…" durante minutos, sem forma de
// distinguir um envio a correr de um envio pendurado.
// Devolve true se enviou; lança se falhou. Quem chama trata do recuo.
function enviarComProgresso(signedUrl, file, aoProgresso, apikey) {
  return new Promise((resolve, reject) => {
    // O corpo tem de ser EXATAMENTE o que o supabase-js envia para um ficheiro
    // do browser: PUT multipart com "cacheControl" e o ficheiro na chave vazia.
    // (Confirmado no storage-js: para um Blob ele monta FormData; só para
    // streams é que envia o corpo em bruto.) O content-type não se define à
    // mão, senão perde-se o boundary do multipart.
    const corpo = new FormData();
    corpo.append("cacheControl", "3600");
    corpo.append("", file);

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl, true);
    xhr.setRequestHeader("x-upsert", "false");
    // O portal do Supabase recusa QUALQUER pedido sem apikey. O supabase-js
    // junta-a sozinho a tudo o que envia (vive no this.headers do cliente), e
    // foi isso que faltou aqui: o ficheiro subia inteiro e só no fim é que era
    // recusado. A chave é a anónima, que já vai no código da página.
    if (apikey) {
      xhr.setRequestHeader("apikey", apikey);
      xhr.setRequestHeader("authorization", `Bearer ${apikey}`);
    }
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) aoProgresso(e.loaded, e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(true);
      else reject(new Error(`${xhr.status} ${xhr.responseText || ""}`.trim()));
    };
    xhr.onerror = () => reject(new Error("falha de rede"));
    xhr.onabort = () => reject(new Error("envio cancelado"));
    xhr.send(corpo);
  });
}

export default function Uploader({ cursos, partilhada }) {
  const destinos = [
    // "auto": a Syntia lê cada ficheiro e decide sozinha o curso e a cadeira
    // (classificação no processamento). Ideal para lotes de PDFs misturados.
    { id: "auto", titulo: "🤖 Deixar a Syntia decidir", tipo: "auto", cadeiras: [] },
    ...cursos.map((c) => ({ ...c, tipo: "curso" })),
    ...(partilhada ? [{ id: partilhada.id, titulo: partilhada.titulo, tipo: "partilhada", cadeiras: [] }] : []),
    // ROTA100K: espaço próprio, fora da pós. Não tem disciplinas.
    { id: "rota100k", titulo: "🚀 ROTA100K", tipo: "raiz", cadeiras: [] },
  ];

  // Sem pré-seleção: obriga a escolher curso e disciplina (evita enviar para o
  // destino errado por o primeiro vir marcado por defeito).
  const [destinoId, setDestinoId] = useState("");
  const destino = destinos.find((d) => d.id === destinoId);
  // Destinos sem disciplina: a partilhada e as áreas de raiz (ROTA100K).
  const isPart = destino?.tipo === "partilhada" || destino?.tipo === "raiz";
  const isAuto = destino?.tipo === "auto";
  const cadeiras = destino?.cadeiras || [];

  const [cadeiraSel, setCadeiraSel] = useState("");
  const [modo, setModo] = useState("aula"); // "aula" = vira síntese · "material" = apostila/referência
  const [itens, setItens] = useState([]); // { file, status: fila|enviar|feito|erro, erro }
  const [correr, setCorrer] = useState(false);
  const [arrastar, setArrastar] = useState(false);
  const [aviso, setAviso] = useState("");
  const inputRef = useRef(null);

  function trocarDestino(id) {
    setDestinoId(id);
    setCadeiraSel(""); // ao trocar de curso, força reescolher a disciplina
  }

  function juntar(fileList) {
    const novos = [];
    let ignorados = 0;
    for (const f of Array.from(fileList || [])) {
      if (EXT_OK.test(f.name)) novos.push({ file: f, status: "fila", erro: "" });
      else ignorados++;
    }
    setItens((prev) => [...prev, ...novos]);

    // O aviso diz o que está mesmo a acontecer, ANTES de ela carregar em enviar.
    // Um ficheiro de vídeo não é "mais um ficheiro": é 200 vezes mais bytes para
    // exactamente o mesmo texto, e a diferença são horas de espera.
    const partes = [];
    if (ignorados) partes.push(`${ignorados} ficheiro(s) ignorado(s) (formato que a Syntia não lê).`);
    const videos = novos.filter((n) => EXT_VIDEO.test(n.file.name));
    if (videos.length) {
      const bytesVideo = videos.reduce((t, n) => t + n.file.size, 0);
      partes.push(
        `${videos.length} são VÍDEO (${tamanho(bytesVideo)}, cerca de ${tempo(bytesVideo)} a enviar). `
        + `A Syntia só ouve a FALA — a imagem não entra na síntese. `
        + `A MESMA aula em áudio ocupa cerca de ${tamanho(bytesVideo / videos.length / 200)} em vez de ${tamanho(bytesVideo / videos.length)}, `
        + `e a síntese sai exactamente igual. `
        + `No iPad: Atalhos → Codificar multimédia → "Apenas áudio" (aceita vários de uma vez).`,
      );
    }
    setAviso(partes.join(" "));
  }

  function remover(idx) {
    setItens((prev) => prev.filter((_, i) => i !== idx));
  }

  async function enviarTodos() {
    if (!destinoId) return setAviso("Escolhe o curso.");
    if (!isPart && !isAuto && !cadeiraSel) return setAviso("Escolhe a disciplina.");
    if (!itens.some((it) => it.status !== "feito")) return;

    setCorrer(true);
    for (let i = 0; i < itens.length; i++) {
      if (itens[i].status === "feito") continue;
      setItens((prev) => prev.map((it, j) => (j === i ? { ...it, status: "enviar", erro: "" } : it)));
      try {
        const file = itens[i].file;
        if (!supa) throw new Error("Supabase não configurado no site (faltam as variáveis NEXT_PUBLIC_SUPABASE_*).");

        // 1) pede ao servidor um link de upload autorizado
        let prep;
        try {
          const r = await fetch("/api/upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename: file.name }),
          });
          prep = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(prep.error || `preparar upload (${r.status})`);
        } catch (e) {
          throw new Error(`preparar: ${e?.message || e}`);
        }

        // Falha depressa e com motivo: antes esperava-se o envio todo de um
        // ficheiro grande demais para só no fim rebentar (ou ficar pendurado).
        if (prep.limite && file.size > prep.limite) {
          throw new Error(
            `o ficheiro tem ${tamanho(file.size)} e o limite de envio é ${tamanho(prep.limite)}. ` +
            `Grava só o áudio em vez do ecrã: a Syntia deita o vídeo fora e usa só o som, ` +
            `por isso um áudio da mesma aula ocupa umas 200 vezes menos.`
          );
        }

        // 2) envia o ficheiro direto para o Supabase — com repetição (3x),
        // porque falhas momentâneas de rede são normais em uploads.
        const marcarProgresso = (feito, total) =>
          setItens((prev) => prev.map((it, j) => (j === i ? { ...it, feito, total } : it)));

        let up = null;
        for (let tent = 1; tent <= 3; tent++) {
          try {
            if (prep.signedUrl) {
              // caminho com barra de progresso
              await enviarComProgresso(prep.signedUrl, file, marcarProgresso, SUPA_ANON);
            } else {
              // servidor antigo, sem signedUrl: caminho de sempre, sem progresso
              const r = await supa.storage.from(BUCKET).uploadToSignedUrl(prep.path, prep.token, file, {
                contentType: file.type || "application/octet-stream",
              });
              if (r.error) throw r.error;
            }
            up = { error: null };
          } catch (err) {
            up = { error: err };
            // Rede de segurança: se o envio com progresso falhar logo à primeira,
            // tenta o caminho antigo antes de desistir. Assim uma mudança na API
            // do Supabase tira a barra de progresso, não a capacidade de enviar.
            if (tent === 1 && prep.signedUrl) {
              try {
                // Antes isto repunha a barra a 0 sem explicação nenhuma e parecia
                // que o envio tinha recomeçado do nada. Agora diz-se o que é.
                setItens((prev) => prev.map((it, j) => (j === i
                  ? { ...it, status: "repetir", feito: 0, total: 0, erro: String(err?.message || err) }
                  : it)));
                const r = await supa.storage.from(BUCKET).uploadToSignedUrl(prep.path, prep.token, file, {
                  contentType: file.type || "application/octet-stream",
                });
                if (r.error) throw r.error;
                up = { error: null };
              } catch (err2) {
                up = { error: err2 };
              }
            }
          }
          if (!up.error) break;
          if (tent < 3) await new Promise((r) => setTimeout(r, 1500 * tent));
        }
        if (up.error) {
          const msg = String(up.error?.message || up.error);
          // "Failed to fetch" = o browser nem chegou ao Supabase. Em vez de
          // adivinhar, sondamos o serviço e reportamos o que o browser viu.
          if (/failed to fetch|networkerror|load failed/i.test(msg)) {
            const alvo = (() => { try { return new URL(SUPA_URL).host; } catch { return "supabase"; } })();
            let sonda;
            try {
              const r = await fetch(`${SUPA_URL}/storage/v1/version`, { mode: "cors" });
              sonda = `o serviço respondeu ${r.status} — o bloqueio é só ao envio (PUT)`;
            } catch (e2) {
              sonda = `ligação bloqueada (${e2?.message || "sem detalhe"}) — nada passa deste browser/rede para lá`;
            }
            throw new Error(`upload: sem ligação a ${alvo} após 3 tentativas. Sonda: ${sonda}.`);
          }
          throw new Error(`upload: ${msg}`);
        }

        // 3) dispara a transcrição
        setItens((prev) => prev.map((it, j) => (j === i ? { ...it, status: "arrancar" } : it)));
        const resp = await fetch("/api/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: prep.publicUrl, curso: destinoId, cadeira: isPart || isAuto ? "" : cadeiraSel, filename: file.name, modo }),
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(data.error || `processar (${resp.status})`);
        setItens((prev) => prev.map((it, j) => (j === i ? { ...it, status: "feito" } : it)));
      } catch (e) {
        setItens((prev) => prev.map((it, j) => (j === i ? { ...it, status: "erro", erro: e?.message || "erro" } : it)));
      }
    }
    setCorrer(false);
  }

  const porEnviar = itens.filter((it) => it.status !== "feito").length;
  const feitos = itens.filter((it) => it.status === "feito").length;

  return (
    <div className="list" style={{ maxWidth: 620 }}>
      <label className="lead" style={{ margin: 0 }}>
        Curso
        <select value={destinoId} onChange={(e) => trocarDestino(e.target.value)} className="campo" disabled={correr}>
          <option value="" disabled>— escolhe o curso —</option>
          {destinos.map((d) => (
            <option key={d.id} value={d.id}>{d.titulo}{d.tipo === "partilhada" ? " (partilhada)" : ""}</option>
          ))}
        </select>
      </label>

      {isAuto && (
        <div className="txt" style={{ fontSize: 13 }}>
          A Syntia lê cada ficheiro e arruma-o sozinha no curso e cadeira certos.
          Se não tiver confiança suficiente num ficheiro, esse envio falha no estado
          e envia-lo escolhendo o curso à mão.
        </div>
      )}

      {destino && !isPart && !isAuto && (
        <label className="lead" style={{ margin: 0 }}>
          Disciplina
          <select value={cadeiraSel} onChange={(e) => setCadeiraSel(e.target.value)} className="campo" disabled={correr}>
            <option value="" disabled>— escolhe a disciplina —</option>
            {cadeiras.map((k, i) => (
              <option key={k.id} value={k.id}>{String(i + 1).padStart(2, "0")} · {k.titulo}</option>
            ))}
          </select>
        </label>
      )}

      <div className="modo-tabs">
        <button type="button" className={`modo-tab${modo === "aula" ? " on" : ""}`} onClick={() => setModo("aula")} disabled={correr}>
          Aulas
          <span>cada ficheiro vira síntese + flashcards</span>
        </button>
        <button type="button" className={`modo-tab${modo === "material" ? " on" : ""}`} onClick={() => setModo("material")} disabled={correr}>
          Apostila / referência
          <span>nome U1_ liga à Unidade 1; torna as sínteses exatas</span>
        </button>
      </div>

      <div
        className={`dropzone${arrastar ? " on" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setArrastar(true); }}
        onDragLeave={() => setArrastar(false)}
        onDrop={(e) => { e.preventDefault(); setArrastar(false); juntar(e.dataTransfer.files); }}
      >
        <div style={{ fontWeight: 650 }}>
          {modo === "material" ? "Arrasta a apostila (PDF) para aqui" : "Arrasta MP3, PDF ou txt para aqui"}
        </div>
        <div className="hint">
          {modo === "material"
            ? "apostila por unidade (nome U1_, U2_…) — não vira aula, alimenta as sínteses"
            : "vários de uma vez · cada um vira síntese + flashcards · o nome U1_/U2_ arruma por unidade · vídeo também entra, mas é 200× maior do que o áudio para a mesma síntese"}
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg,.flac,.mp4,.webm,.mov,.m4v,.pdf,.docx,.txt,.md"
          style={{ display: "none" }}
          onChange={(e) => juntar(e.target.files)}
        />
      </div>

      {aviso && <div style={{ color: "var(--ink-soft)", fontSize: 13 }}>{aviso}</div>}

      {itens.length > 0 && (() => {
        const bytesTotal = itens.reduce((t, it) => t + it.file.size, 0);
        return (
          <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
            {itens.length} ficheiro(s) · <b>{tamanho(bytesTotal)}</b> · cerca de <b>{tempo(bytesTotal)}</b> a enviar
          </div>
        );
      })()}

      {itens.length > 0 && (
        <div className="fila">
          {itens.map((it, i) => (
            <div key={i} className={`fila-item ${it.status}`}>
              <div className="fi-linha">
                <span className="fi-uni">{unidadeDe(it.file.name) || "—"}</span>
                <span className="fi-nome">{it.file.name}</span>
                <span className="fi-tam">{tamanho(it.file.size)}</span>
                <span className="fi-estado">
                  {it.status === "fila" && (!correr ? <button className="fi-x" onClick={() => remover(i)}>remover</button> : "em fila")}
                  {it.status === "enviar" &&
                    (it.total
                      ? `${Math.floor((it.feito / it.total) * 100)}% · ${tamanho(it.feito)} de ${tamanho(it.total)}`
                      : "a enviar…")}
                  {it.status === "repetir" && "o primeiro caminho falhou · a repetir por outro…"}
                  {it.status === "arrancar" && "a arrancar o processamento…"}
                  {it.status === "feito" && "✓"}
                  {it.status === "erro" && "erro"}
                </span>
              </div>
              {it.status === "enviar" && it.total > 0 && (
                <div className="fi-barra"><span style={{ width: `${Math.min(100, (it.feito / it.total) * 100)}%` }} /></div>
              )}
              {(it.status === "erro" || it.status === "repetir") && it.erro && (
                <div className="fi-erro">{it.erro}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {destinoId && (isPart || isAuto || cadeiraSel) ? (
        <div className="dest-confirma">
          A enviar para <b>{destino.titulo}</b>
          {!isPart && !isAuto && <> · <b>{cadeiras.find((k) => k.id === cadeiraSel)?.titulo}</b></>}
        </div>
      ) : (
        itens.length > 0 && <div className="dest-falta">Escolhe o curso e a disciplina acima antes de enviar.</div>
      )}

      {correr && (
        <div className="dest-falta" style={{ borderStyle: "solid" }}>
          Não feches nem mudes de separador enquanto a barra anda: o ficheiro sobe
          daqui do teu iPad, por isso o envio pára se saíres desta página. Um vídeo
          grande pode levar vários minutos.
        </div>
      )}

      <button className="btn" onClick={enviarTodos} disabled={correr || porEnviar === 0 || !destinoId || (!isPart && !isAuto && !cadeiraSel)}>
        {correr ? "A enviar…" : porEnviar > 0 ? `Enviar ${porEnviar} ficheiro${porEnviar === 1 ? "" : "s"}` : feitos > 0 ? "Tudo enviado ✓" : "Enviar"}
      </button>

      {feitos > 0 && !correr && (
        <div className="txt" style={{ fontSize: 13.5 }}>
          {feitos} ficheiro{feitos === 1 ? "" : "s"} enviado{feitos === 1 ? "" : "s"} para processar.{" "}
          <a href="/estado" style={{ color: "var(--gold-soft)" }}>Vê o estado aqui</a> (✓ pronto / a processar / falhou).
          {" "}<button className="fi-x" onClick={() => { setItens([]); setAviso(""); }}>limpar lista</button>
        </div>
      )}
    </div>
  );
}
