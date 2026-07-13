import Link from "next/link";
import InspiracaoUploader from "./InspiracaoUploader";
import InspiracaoItem from "./InspiracaoItem";
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
            <InspiracaoItem key={it.nome} item={it} />
          ))}
        </div>
      )}
    </>
  );
}
