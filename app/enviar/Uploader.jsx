"use client";
import { useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "aulas";
const EXT_OK = /\.(mp3|m4a|wav|mp4|aac|ogg|flac|webm|pdf|txt|md)$/i;
const unidadeDe = (nome) => {
  const m = nome.match(/^U(\d+)/i);
  return m ? `U${m[1]}` : null;
};

// Cliente Supabase (criado uma vez, se as variáveis existirem).
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supa = SUPA_URL && SUPA_ANON ? createClient(SUPA_URL, SUPA_ANON) : null;

export default function Uploader({ cursos, partilhada }) {
  const destinos = [
    ...cursos.map((c) => ({ ...c, tipo: "curso" })),
    ...(partilhada ? [{ id: partilhada.id, titulo: partilhada.titulo, tipo: "partilhada", cadeiras: [] }] : []),
  ];

  const [destinoId, setDestinoId] = useState(destinos[0]?.id || "");
  const destino = destinos.find((d) => d.id === destinoId);
  const isPart = destino?.tipo === "partilhada";
  const cadeiras = destino?.cadeiras || [];

  const [cadeiraSel, setCadeiraSel] = useState(cadeiras[0]?.id || "");
  const [modo, setModo] = useState("aula"); // "aula" = vira síntese · "material" = apostila/referência
  const [itens, setItens] = useState([]); // { file, status: fila|enviar|feito|erro, erro }
  const [correr, setCorrer] = useState(false);
  const [arrastar, setArrastar] = useState(false);
  const [aviso, setAviso] = useState("");
  const inputRef = useRef(null);

  function trocarDestino(id) {
    setDestinoId(id);
    const d = destinos.find((x) => x.id === id);
    setCadeiraSel(d?.cadeiras?.[0]?.id || "");
  }

  function juntar(fileList) {
    const novos = [];
    let ignorados = 0;
    for (const f of Array.from(fileList || [])) {
      if (EXT_OK.test(f.name)) novos.push({ file: f, status: "fila", erro: "" });
      else ignorados++;
    }
    setAviso(ignorados ? `${ignorados} ficheiro(s) ignorado(s) (só MP3, PDF ou txt).` : "");
    setItens((prev) => [...prev, ...novos]);
  }

  function remover(idx) {
    setItens((prev) => prev.filter((_, i) => i !== idx));
  }

  async function enviarTodos() {
    if (!destinoId) return setAviso("Escolhe o curso.");
    if (!isPart && !cadeiraSel) return setAviso("Escolhe a disciplina.");
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

        // 2) envia o ficheiro direto para o Supabase
        const up = await supa.storage.from(BUCKET).uploadToSignedUrl(prep.path, prep.token, file, {
          contentType: file.type || "application/octet-stream",
        });
        if (up.error) throw new Error(`upload: ${up.error.message}`);

        // 3) dispara a transcrição
        const resp = await fetch("/api/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: prep.publicUrl, curso: destinoId, cadeira: isPart ? "" : cadeiraSel, filename: file.name, modo }),
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
          {destinos.map((d) => (
            <option key={d.id} value={d.id}>{d.titulo}{d.tipo === "partilhada" ? " (partilhada)" : ""}</option>
          ))}
        </select>
      </label>

      {!isPart && (
        <label className="lead" style={{ margin: 0 }}>
          Disciplina
          <select value={cadeiraSel} onChange={(e) => setCadeiraSel(e.target.value)} className="campo" disabled={correr}>
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
            : "vários de uma vez · cada um vira síntese + flashcards · o nome U1_/U2_ arruma por unidade"}
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg,.flac,.pdf,.txt,.md"
          style={{ display: "none" }}
          onChange={(e) => juntar(e.target.files)}
        />
      </div>

      {aviso && <div style={{ color: "var(--ink-soft)", fontSize: 13 }}>{aviso}</div>}

      {itens.length > 0 && (
        <div className="fila">
          {itens.map((it, i) => (
            <div key={i} className={`fila-item ${it.status}`}>
              <div className="fi-linha">
                <span className="fi-uni">{unidadeDe(it.file.name) || "—"}</span>
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
        {correr ? "A enviar…" : porEnviar > 0 ? `Enviar ${porEnviar} aula${porEnviar === 1 ? "" : "s"}` : feitos > 0 ? "Tudo enviado ✓" : "Enviar aulas"}
      </button>

      {feitos > 0 && !correr && (
        <div className="txt" style={{ fontSize: 13.5 }}>
          {feitos} aula{feitos === 1 ? "" : "s"} a processar. Em alguns minutos aparecem na disciplina com síntese e flashcards.
        </div>
      )}
    </div>
  );
}
