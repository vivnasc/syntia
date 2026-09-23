"use client";
import { useState } from "react";

// Apaga uma aula (ou um material) carregado por engano, ou carregado na
// cadeira errada. Pede confirmação antes, porque isto não tem volta: os
// ficheiros saem do repositório. O áudio/PDF original continua no
// armazenamento, portanto pode sempre reenviar-se para o sítio certo.
//
// tipo="aula"     -> arquivos = nomes-base das aulas (sem extensão)
// tipo="material" -> arquivos = caminhos dentro de _material (ex.: "U2/X.pdf")
export default function Apagar({ curso, cadeira, arquivos, tipo = "aula", rotulo }) {
  const [fase, setFase] = useState("inicio"); // inicio, confirmar, a-apagar, feito, erro
  if (!arquivos?.length) return null;

  async function apagar() {
    setFase("a-apagar");
    try {
      const r = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modo: tipo === "material" ? "apagar-material" : "apagar",
          curso,
          cadeira,
          arquivos,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "falha");
      setFase("feito");
    } catch {
      setFase("erro");
    }
  }

  if (fase === "a-apagar") return <span className="mover-msg">a apagar…</span>;
  if (fase === "feito") return <span className="mover-msg ok">✓ apagado, vê em Estado</span>;

  if (fase === "confirmar") {
    return (
      <span className="apagar-conf">
        <span className="apagar-pergunta">apagar {rotulo ? `"${rotulo}"` : "isto"}?</span>
        <button type="button" className="apagar-sim" onClick={apagar}>sim, apagar</button>
        <button type="button" className="apagar-nao" onClick={() => setFase("inicio")}>não</button>
      </span>
    );
  }

  return (
    <span className="apagar">
      <button
        type="button"
        className="apagar-btn"
        title="Apagar (carregado por engano ou na cadeira errada)"
        aria-label="Apagar"
        onClick={() => setFase("confirmar")}
      >
        ✕
      </button>
      {fase === "erro" && <span className="mover-err">erro, tenta de novo</span>}
    </span>
  );
}
