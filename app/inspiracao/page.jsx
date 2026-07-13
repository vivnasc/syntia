import Link from "next/link";
import Markdown from "../Markdown";
import InspiracaoUploader from "./InspiracaoUploader";
import { getInspiracao } from "../../lib/conteudo";

export const metadata = { title: "Inspiração — SyntIA" };

export default function InspiracaoPage() {
  const itens = getInspiracao();

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / Inspiração
      </div>
      <h1>Inspiração</h1>
      <p className="lead">
        O teu espaço de criação, à parte dos cursos. Arrasta vídeos (Reels, gravações) e cada um
        vira uma <strong>transcrição</strong> e um bloco de <strong>ideias de conteúdo</strong>
        (gancho, estrutura, temas e frases fortes) para te inspirares nos teus posts. Nada disto
        se mistura com as cadeiras.
      </p>

      <InspiracaoUploader />

      <h2 style={{ marginTop: 28 }}>Guardados {itens.length ? `(${itens.length})` : ""}</h2>

      {itens.length === 0 ? (
        <p className="empty">Ainda não tens vídeos guardados. Arrasta o primeiro acima.</p>
      ) : (
        <div className="list">
          {itens.map((it) => (
            <section key={it.nome} className="insp-card">
              <h3 className="insp-titulo">{it.titulo}</h3>

              {it.ideias ? (
                <div className="insp-ideias">
                  <Markdown>{it.ideias}</Markdown>
                </div>
              ) : (
                <p className="empty">A gerar ideias… (atualiza daqui a uns minutos)</p>
              )}

              {it.transcricao && (
                <details className="painel-uni">
                  <summary>📝 Ver transcrição completa</summary>
                  <div className="painel-corpo">
                    <p style={{ whiteSpace: "pre-wrap" }}>{it.transcricao}</p>
                  </div>
                </details>
              )}
            </section>
          ))}
        </div>
      )}
    </>
  );
}
