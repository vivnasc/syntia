"use client";
import { useState } from "react";

// Botão que pede ao servidor para (re)gerar o Resumo + Quiz de uma unidade.
// Assim estas 2 chamadas ao Claude só acontecem quando tu queres, não a cada aula.
export default function Consolidar({ curso, cadeira, unidade }) {
  const [estado, setEstado] = useState("");

  async function gerar() {
    setEstado("a-enviar");
    try {
      const r = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "consolidar", curso, cadeira, unidade }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "falha");
      setEstado("feito");
    } catch {
      setEstado("erro");
    }
  }

  const txt =
    estado === "a-enviar" ? "a gerar…"
    : estado === "feito" ? "✓ a gerar — vê em Estado dos envios"
    : estado === "erro" ? "erro — tenta de novo"
    : "↻ Gerar / atualizar resumo + quiz desta unidade";

  return (
    <button type="button" className="btn-consolidar" onClick={gerar} disabled={estado === "a-enviar" || estado === "feito"}>
      {txt}
    </button>
  );
}
