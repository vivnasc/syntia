import Link from "next/link";
import Markdown from "./Markdown";
import Flashcards from "./Flashcards";
import { getAulaRaiz } from "../lib/conteudo";

// Página de uma aula de uma área de raiz (ROTA100K, VENDA100K).
export default function AulaRaiz({ id, nome }) {
  const found = getAulaRaiz(id, nome);
  if (!found) return <div className="empty">Aula não encontrada.</div>;
  const { raiz, aula } = found;

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / <Link href={`/${raiz.id}`}>{raiz.titulo}</Link> / {aula.titulo}
      </div>
      <h1>{aula.titulo}</h1>

      <Flashcards cards={aula.flashcards} />

      <div className="section-label" style={{ marginTop: 36 }}>Síntese</div>
      <Markdown>{aula.sintese}</Markdown>

      <div className="footer">
        <Link href={`/${raiz.id}`}>← voltar à {raiz.titulo}</Link>
      </div>
    </>
  );
}
