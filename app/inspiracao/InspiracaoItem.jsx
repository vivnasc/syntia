"use client";
import { useState } from "react";
import Markdown from "../Markdown";

export default function InspiracaoItem({ item }) {
  const [legenda, setLegenda] = useState(item.legenda || "");
  const [estado, setEstado] = useState(""); // "" | enviar | feito | erro
  const [erro, setErro] = useState("");

  async function guardarLegenda() {
    if (!legenda.trim()) { setErro("Cola a legenda primeiro."); return; }
    setEstado("enviar"); setErro("");
    try {
      const resp = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo: "inspiracao-legenda", filename: item.nome, legenda: legenda.trim() }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.error || `erro (${resp.status})`);
      setEstado("feito");
    } catch (e) {
      setEstado("erro"); setErro(e?.message || "erro");
    }
  }

  function exportarMd() {
    const partes = [`# ${item.titulo}`, ""];
    if (item.legenda) partes.push("## Legenda original do post", "", item.legenda, "");
    if (item.ideias) partes.push(item.ideias, "");
    if (item.transcricao) partes.push("---", "", "## Transcrição", "", item.transcricao, "");
    const md = partes.join("\n");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.nome}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="insp-card">
      <div className="insp-topo">
        <div>
          <h3 className="insp-titulo">{item.titulo}</h3>
          {item.data && (
            <span className="footer" style={{ opacity: 0.6 }}>
              {new Date(item.data).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </span>
          )}
        </div>
        <button className="btn-mini" onClick={exportarMd} title="Descarregar este estudo em Markdown">⬇ Exportar MD</button>
      </div>

      {item.ideias ? (
        <div className="insp-ideias"><Markdown>{item.ideias}</Markdown></div>
      ) : (
        <p className="empty">A gerar ideias… (atualiza daqui a uns minutos)</p>
      )}

      <details className="painel-uni">
        <summary>📝 Legenda do post {item.legenda ? "(guardada — editar)" : "(dar para ideias mais completas)"}</summary>
        <div className="painel-corpo">
          <textarea
            value={legenda}
            onChange={(e) => setLegenda(e.target.value)}
            className="campo"
            rows={4}
            placeholder="Cola aqui a legenda/descrição original deste Reel…"
            disabled={estado === "enviar"}
            style={{ resize: "vertical", fontFamily: "inherit", width: "100%" }}
          />
          <button className="btn" onClick={guardarLegenda} disabled={estado === "enviar"} style={{ marginTop: 8 }}>
            {estado === "enviar" ? "A regenerar…" : "Guardar e regenerar ideias"}
          </button>
          {estado === "feito" && <p className="footer">Enviado. As ideias atualizadas aparecem aqui dentro de uns minutos (atualiza a página).</p>}
          {estado === "erro" && <p className="fi-erro">{erro}</p>}
        </div>
      </details>

      {item.transcricao && (
        <details className="painel-uni">
          <summary>🎙️ Ver transcrição completa</summary>
          <div className="painel-corpo"><p>{item.transcricao}</p></div>
        </details>
      )}
    </section>
  );
}
