import Link from "next/link";
import ReuniaoUploader from "./ReuniaoUploader";
import ReuniaoItem from "./ReuniaoItem";
import { getReunioes } from "../../lib/conteudo";

export const metadata = { title: "Reuniões — SyntIA" };

export default function ReunioesPage() {
  const itens = getReunioes();

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / Reuniões
      </div>
      <h1>Reuniões</h1>
      <p className="lead">
        O teu espaço para <strong>gravações de reuniões</strong>, à parte dos cursos. Arrasta a
        gravação (áudio ou vídeo) e cada uma vira uma <strong>transcrição</strong> e um{" "}
        <strong>resumo</strong> (pontos principais, decisões e próximos passos). Nada disto se
        mistura com as cadeiras nem com o conhecimento dos produtos.
      </p>

      <ReuniaoUploader />

      <h2 style={{ marginTop: 28 }}>Guardadas {itens.length ? `(${itens.length})` : ""}</h2>

      {itens.length === 0 ? (
        <p className="empty">Ainda não tens reuniões guardadas. Arrasta a primeira acima.</p>
      ) : (
        <div className="list">
          {itens.map((it) => (
            <ReuniaoItem key={it.nome} item={it} />
          ))}
        </div>
      )}
    </>
  );
}
