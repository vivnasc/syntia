"use client";
import { useState } from "react";

// Deixa a Vivianne mover uma aula para outra unidade na própria app
// (renomeia os ficheiros no servidor, sem reprocessar). Autonomia.
export default function MoverAula({ curso, cadeira, arquivos, unidadeAtual, unidades }) {
  const [estado, setEstado] = useState(""); // "", a-mover, feito, erro
  const destinos = (unidades || []).filter((n) => n !== unidadeAtual);
  if (!destinos.length || !arquivos?.length) return null;

  async function mover(u) {
    if (!u) return;
    setEstado("a-mover");
    try {
      const r = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "mover", curso, cadeira, arquivos, unidade: u }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "falha");
      setEstado("feito");
    } catch {
      setEstado("erro");
    }
  }

  if (estado === "a-mover") return <span className="mover-msg">a mover…</span>;
  if (estado === "feito") return <span className="mover-msg ok">✓ a mover — vê em Estado</span>;

  return (
    <span className="mover">
      <select className="mover-sel" defaultValue="" onChange={(e) => mover(e.target.value)} aria-label="Mover para unidade">
        <option value="" disabled>⇄ mover para…</option>
        {destinos.map((n) => (
          <option key={n} value={n}>Unidade {n}</option>
        ))}
      </select>
      {estado === "erro" && <span className="mover-err">erro — tenta de novo</span>}
    </span>
  );
}
