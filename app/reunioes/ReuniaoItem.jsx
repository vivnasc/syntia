"use client";
import Markdown from "../Markdown";

export default function ReuniaoItem({ item }) {
  function exportarMd() {
    const partes = [`# ${item.titulo}`, ""];
    if (item.resumo) partes.push(item.resumo, "");
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
        <button className="btn-mini" onClick={exportarMd} title="Descarregar esta reunião em Markdown">⬇ Exportar MD</button>
      </div>

      {item.resumo ? (
        <div className="insp-ideias"><Markdown>{item.resumo}</Markdown></div>
      ) : (
        <p className="empty">A resumir… (atualiza daqui a uns minutos)</p>
      )}

      {item.transcricao && (
        <details className="painel-uni">
          <summary>🎙️ Ver transcrição completa</summary>
          <div className="painel-corpo"><p>{item.transcricao}</p></div>
        </details>
      )}
    </section>
  );
}
