import Link from "next/link";
import Markdown from "../../../../Markdown";
import Flashcards from "../../../../Flashcards";
import { getAreas, getAula } from "../../../../../lib/conteudo";

export function generateStaticParams() {
  const params = [];
  for (const area of getAreas()) {
    for (const aula of area.aulas) {
      params.push({ id: area.id, aula: aula.nome });
    }
  }
  // Sentinela: garante a geração estática mesmo sem aulas ainda.
  return params.length ? params : [{ id: "_", aula: "_" }];
}

export default function AulaPage({ params }) {
  const id = decodeURIComponent(params.id);
  const nome = decodeURIComponent(params.aula);
  const found = getAula(id, nome);
  if (!found) {
    return <div className="empty">Aula não encontrada.</div>;
  }
  const { area, aula } = found;

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / <Link href={`/area/${area.id}`}>{area.titulo}</Link> / {aula.titulo}
      </div>
      <h1>{aula.titulo}</h1>

      <Flashcards cards={aula.flashcards} />

      <div className="section-label" style={{ marginTop: 36 }}>Síntese de estudo</div>
      <Markdown>{aula.sintese}</Markdown>

      <div className="footer">
        <Link href={`/area/${area.id}`}>← voltar a {area.titulo}</Link>
      </div>
    </>
  );
}
