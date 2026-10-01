import Link from "next/link";
import Markdown from "../../../Markdown";
import Flashcards from "../../../Flashcards";
import { getRota, getAulaRota } from "../../../../lib/conteudo";

export function generateStaticParams() {
  const r = getRota();
  const out = (r?.aulas || []).map((a) => ({ aula: a.nome }));
  return out.length ? out : [{ aula: "_" }];
}

export default function AulaRotaPage({ params }) {
  const nome = decodeURIComponent(params.aula);
  const found = getAulaRota(nome);
  if (!found) return <div className="empty">Aula não encontrada.</div>;
  const { rota, aula } = found;

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / <Link href="/rota100k">{rota.titulo}</Link> / {aula.titulo}
      </div>
      <h1>{aula.titulo}</h1>

      <Flashcards cards={aula.flashcards} />

      <div className="section-label" style={{ marginTop: 36 }}>Síntese</div>
      <Markdown>{aula.sintese}</Markdown>

      <div className="footer">
        <Link href="/rota100k">← voltar à {rota.titulo}</Link>
      </div>
    </>
  );
}
