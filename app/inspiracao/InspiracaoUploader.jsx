"use client";
import { useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "aulas";
// Vídeos e áudio (Reels, gravações) — e também texto, se quiseres colar algo.
const EXT_OK = /\.(mp4|mov|m4v|webm|mkv|avi|mp3|m4a|wav|aac|ogg|flac|txt|md)$/i;

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supa = SUPA_URL && SUPA_ANON ? createClient(SUPA_URL, SUPA_ANON) : null;

export default function InspiracaoUploader() {
  const [itens, setItens] = useState([]); // { file, status: fila|enviar|feito|erro, erro }
  const [legenda, setLegenda] = useState("");
  const [correr, setCorrer] = useState(false);
  const [arrastar, setArrastar] = useState(false);
  const [aviso, setAviso] = useState("");
  const inputRef = useRef(null);

  function juntar(fileList) {
    const novos = [];
    let ignorados = 0;
    for (const f of Array.from(fileList || [])) {
      if (EXT_OK.test(f.name)) novos.push({ file: f, status: "fila", erro: "" });
      else ignorados++;
    }
    setAviso(ignorados ? `${ignorados} ficheiro(s) ignorado(s) (usa vídeo ou áudio).` : "");
    setItens((prev) => [...prev, ...novos]);
  }

  function remover(idx) {
    setItens((prev) => prev.filter((_, i) => i !== idx));
  }

  async function enviarTodos() {
    if (!itens.some((it) => it.status !== "feito")) return;
    setCorrer(true);
    for (let i = 0; i < itens.length; i++) {
      if (itens[i].status === "feito") continue;
      setItens((prev) => prev.map((it, j) => (j === i ? { ...it, status: "enviar", erro: "" } : it)));
      try {
        const file = itens[i].file;
        if (!supa) throw new Error("Supabase não configurado no site (faltam as variáveis NEXT_PUBLIC_SUPABASE_*).");

        // 1) link de upload autorizado
        const r = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name }),
        });
        const prep = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(prep.error || `preparar upload (${r.status})`);

        // 2) upload direto para o Supabase
        const up = await supa.storage.from(BUCKET).uploadToSignedUrl(prep.path, prep.token, file, {
          contentType: file.type || "application/octet-stream",
        });
        if (up.error) throw new Error(`upload: ${up.error.message}`);

        // 3) dispara a transcrição + ideias (modo inspiração)
        const resp = await fetch("/api/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: prep.publicUrl, filename: file.name, modo: "inspiracao", legenda: legenda.trim() }),
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
      <div
        className={`dropzone${arrastar ? " on" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setArrastar(true); }}
        onDragLeave={() => setArrastar(false)}
        onDrop={(e) => { e.preventDefault(); setArrastar(false); juntar(e.dataTransfer.files); }}
      >
        <div style={{ fontWeight: 650 }}>🎬 Arrasta os vídeos para aqui</div>
        <div className="hint">Reels, gravações, áudios · cada um vira transcrição + ideias de conteúdo</div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="video/*,audio/*,.txt,.md"
          style={{ display: "none" }}
          onChange={(e) => juntar(e.target.files)}
        />
      </div>

      <label className="lead" style={{ margin: 0, display: "block" }}>
        Legenda original <span style={{ color: "var(--ink-soft)", fontWeight: 400 }}>(opcional — cola aqui a legenda do post; torna as ideias mais completas)</span>
        <textarea
          value={legenda}
          onChange={(e) => setLegenda(e.target.value)}
          className="campo"
          rows={3}
          placeholder="Ex.: a legenda/descrição que acompanha o Reel…"
          disabled={correr}
          style={{ resize: "vertical", fontFamily: "inherit" }}
        />
      </label>
      <div className="hint">Aplica-se aos vídeos deste envio — se cada Reel tiver legenda diferente, envia um de cada vez.</div>

      {aviso && <div style={{ color: "var(--ink-soft)", fontSize: 13 }}>{aviso}</div>}

      {itens.length > 0 && (
        <div className="fila">
          {itens.map((it, i) => (
            <div key={i} className={`fila-item ${it.status}`}>
              <div className="fi-linha">
                <span className="fi-nome">{it.file.name}</span>
                <span className="fi-estado">
                  {it.status === "fila" && (!correr ? <button className="fi-x" onClick={() => remover(i)}>remover</button> : "em fila")}
                  {it.status === "enviar" && "a enviar…"}
                  {it.status === "feito" && "✓"}
                  {it.status === "erro" && "erro"}
                </span>
              </div>
              {it.status === "erro" && it.erro && <div className="fi-erro">{it.erro}</div>}
            </div>
          ))}
        </div>
      )}

      <button className="btn" onClick={enviarTodos} disabled={correr || porEnviar === 0}>
        {correr ? "A enviar…" : porEnviar > 0 ? `Enviar ${porEnviar} vídeo${porEnviar === 1 ? "" : "s"}` : feitos > 0 ? "Tudo enviado ✓" : "Enviar"}
      </button>

      {feitos > 0 && !correr && (
        <div className="txt" style={{ fontSize: 13.5 }}>
          {feitos} enviado{feitos === 1 ? "" : "s"} para processar. A transcrição e as ideias aparecem aqui
          dentro de alguns minutos. <a href="/estado" style={{ color: "var(--gold-soft)" }}>Vê o estado aqui</a>.
          {" "}<button className="fi-x" onClick={() => { setItens([]); setAviso(""); }}>limpar lista</button>
        </div>
      )}
    </div>
  );
}
