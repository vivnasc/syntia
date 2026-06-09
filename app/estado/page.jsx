"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

function tempoRelativo(iso) {
  if (!iso) return "";
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "agora mesmo";
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  return `há ${Math.floor(s / 86400)} dias`;
}

function estadoDe(r) {
  if (r.status !== "completed") return { txt: "a processar…", cls: "proc" };
  if (r.conclusion === "success") return { txt: "✓ pronto", cls: "ok" };
  if (r.conclusion === "cancelled") return { txt: "cancelado", cls: "dim" };
  return { txt: "✗ falhou", cls: "erro" };
}

export default function EstadoPage() {
  const [runs, setRuns] = useState(null);
  const [erro, setErro] = useState("");
  const [aCarregar, setACarregar] = useState(false);

  async function carregar() {
    setACarregar(true);
    try {
      const r = await fetch("/api/estado", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "falha");
      setRuns(d.runs);
      setErro("");
    } catch (e) {
      setErro(e?.message || "erro");
    } finally {
      setACarregar(false);
    }
  }

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 15000); // atualiza sozinho a cada 15s
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <div className="crumbs"><Link href="/">Início</Link> / Estado dos envios</div>
      <h1>Estado dos envios</h1>
      <p className="lead">
        O que enviaste e em que pé está cada coisa. Atualiza sozinho; podes também
        carregar em atualizar. <strong>✓ pronto</strong> significa que já está na disciplina.
      </p>

      <button className="btn" style={{ maxWidth: 200 }} onClick={carregar} disabled={aCarregar}>
        {aCarregar ? "A atualizar…" : "Atualizar"}
      </button>

      {erro && <div className="empty" style={{ marginTop: 16 }}>Não consegui ler o estado: {erro}</div>}

      {runs && runs.length === 0 && <div className="empty" style={{ marginTop: 16 }}>Ainda sem envios.</div>}

      {runs && runs.length > 0 && (
        <div className="list" style={{ marginTop: 16 }}>
          {runs.map((r, i) => {
            const e = estadoDe(r);
            return (
              <a key={i} href={r.url} target="_blank" rel="noreferrer" className={`estado-row ${e.cls}`}>
                <span className="grow">
                  <div style={{ fontWeight: 600, wordBreak: "break-word" }}>{r.titulo}</div>
                  <div className="meta">{tempoRelativo(r.quando)}</div>
                </span>
                <span className="estado-badge">{e.txt}</span>
              </a>
            );
          })}
        </div>
      )}
    </>
  );
}
