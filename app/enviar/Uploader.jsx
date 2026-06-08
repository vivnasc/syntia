"use client";
import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

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
  const [file, setFile] = useState(null);
  const [estado, setEstado] = useState("idle"); // idle | upload | dispatch | ok | erro
  const [erro, setErro] = useState("");
  const [arrastar, setArrastar] = useState(false);
  const inputRef = useRef(null);

  const ocupado = estado === "upload" || estado === "dispatch";

  function trocarDestino(id) {
    setDestinoId(id);
    const d = destinos.find((x) => x.id === id);
    setCadeiraSel(d?.cadeiras?.[0]?.id || "");
    setErro("");
  }

  function escolher(f) {
    if (!f) return;
    setErro("");
    setFile(f);
    if (estado === "ok" || estado === "erro") setEstado("idle");
  }

  async function enviar() {
    setErro("");
    if (!destinoId) return setErro("Escolhe o curso.");
    if (!isPart && !cadeiraSel) return setErro("Escolhe a disciplina.");
    if (!file) return setErro("Escolhe o ficheiro de áudio.");

    try {
      setEstado("upload");
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
        contentType: file.type || "audio/mpeg",
      });

      setEstado("dispatch");
      const resp = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: blob.url, curso: destinoId, cadeira: isPart ? "" : cadeiraSel, filename: file.name }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Falha ao iniciar o processamento.");
      setEstado("ok");
    } catch (e) {
      setEstado("erro");
      setErro(e?.message || "Algo correu mal.");
    }
  }

  if (estado === "ok") {
    const onde = isPart ? destino?.titulo : `${destino?.titulo} · ${cadeiras.find((k) => k.id === cadeiraSel)?.titulo || ""}`;
    return (
      <div className="prod-item" style={{ borderColor: "var(--gold)" }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Enviada ✓</div>
        <div className="txt">
          A aula <strong>{file?.name}</strong> está a ser processada. Daqui a alguns minutos
          aparece em <strong>{onde}</strong> com síntese e flashcards.
        </div>
        <button className="chip" style={{ marginTop: 14 }} onClick={() => { setFile(null); setEstado("idle"); }}>
          enviar outra
        </button>
      </div>
    );
  }

  return (
    <div className="list" style={{ maxWidth: 560 }}>
      <label className="lead" style={{ margin: 0 }}>
        Curso
        <select value={destinoId} onChange={(e) => trocarDestino(e.target.value)} className="campo">
          {destinos.map((d) => (
            <option key={d.id} value={d.id}>{d.titulo}{d.tipo === "partilhada" ? " (partilhada)" : ""}</option>
          ))}
        </select>
      </label>

      {!isPart && (
        <label className="lead" style={{ margin: 0 }}>
          Disciplina
          <select value={cadeiraSel} onChange={(e) => setCadeiraSel(e.target.value)} className="campo">
            {cadeiras.map((k, i) => (
              <option key={k.id} value={k.id}>{String(i + 1).padStart(2, "0")} · {k.titulo}</option>
            ))}
          </select>
        </label>
      )}

      <div
        className={`dropzone${arrastar ? " on" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setArrastar(true); }}
        onDragLeave={() => setArrastar(false)}
        onDrop={(e) => { e.preventDefault(); setArrastar(false); escolher(e.dataTransfer.files?.[0]); }}
      >
        {file ? (
          <>
            <div style={{ fontWeight: 650 }}>{file.name}</div>
            <div className="hint">{(file.size / 1e6).toFixed(1)} MB · toca para trocar</div>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 650 }}>Arrasta o MP3 para aqui</div>
            <div className="hint">ou toca para escolher do dispositivo</div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg,.flac"
          style={{ display: "none" }}
          onChange={(e) => escolher(e.target.files?.[0])}
        />
      </div>

      {erro && <div style={{ color: "var(--corpo)", fontSize: 14 }}>{erro}</div>}

      <button className="btn" onClick={enviar} disabled={ocupado}>
        {estado === "upload" ? "A enviar o áudio…" : estado === "dispatch" ? "A iniciar…" : "Enviar aula"}
      </button>
    </div>
  );
}
