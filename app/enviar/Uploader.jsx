"use client";
import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

export default function Uploader({ areas }) {
  const [curso, setCurso] = useState(areas[0]?.id || "");
  const [file, setFile] = useState(null);
  const [estado, setEstado] = useState("idle"); // idle | upload | dispatch | ok | erro
  const [erro, setErro] = useState("");
  const [arrastar, setArrastar] = useState(false);
  const inputRef = useRef(null);

  const ocupado = estado === "upload" || estado === "dispatch";

  function escolher(f) {
    if (!f) return;
    setErro("");
    setFile(f);
    if (estado === "ok" || estado === "erro") setEstado("idle");
  }

  async function enviar() {
    setErro("");
    if (!curso) return setErro("Escolhe a área.");
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
        body: JSON.stringify({ url: blob.url, curso, filename: file.name }),
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
    return (
      <div className="prod-item" style={{ borderColor: "var(--prosperidade)" }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Enviada ✓</div>
        <div className="txt">
          A aula <strong>{file?.name}</strong> está a ser processada. Daqui a alguns
          minutos aparece em <strong>{areas.find((a) => a.id === curso)?.titulo}</strong> com
          síntese e flashcards.
        </div>
        <button
          className="chip"
          style={{ marginTop: 14 }}
          onClick={() => {
            setFile(null);
            setEstado("idle");
          }}
        >
          enviar outra
        </button>
      </div>
    );
  }

  return (
    <div className="list" style={{ maxWidth: 560 }}>
      <label className="lead" style={{ margin: 0 }}>
        Área
        <select value={curso} onChange={(e) => setCurso(e.target.value)} className="campo">
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.titulo}
            </option>
          ))}
        </select>
      </label>

      <div
        className={`dropzone${arrastar ? " on" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastar(true);
        }}
        onDragLeave={() => setArrastar(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastar(false);
          escolher(e.dataTransfer.files?.[0]);
        }}
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
