import Link from "next/link";
import Topbar from "../../../../Topbar";
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
  // Sentinela: garante que o export estático funciona mesmo sem aulas ainda.
  return params.length ? params : [{ id: "_", aula: "_" }];
}

export default function AulaPage({ params }) {
  const id = decodeURIComponent(params.id);
  const nome = decodeURIComponent(params.aula);
  const found = getAula(id, nome);
  if (!found) {
    return (
      <div className="wrap">
        <Topbar active="areas" />
        <div className="empty">Aula não encontrada.</div>
      </div>
    );
  }
  const { area, aula } = found;

  return (
    <div className="wrap">
      <Topbar active="areas" />
      <div className="crumbs">
        <Link href="/">Áreas</Link> / <Link href={`/area/${area.id}/`}>{area.titulo}</Link> / {aula.titulo}
      </div>
      <h1>{aula.titulo}</h1>
      <p className="lead" style={{ marginTop: -2 }}>
        <span className="pill">{area.titulo}</span>
      </p>

      <Flashcards cards={aula.flashcards} />

      <h2>Síntese de estudo</h2>
      <Markdown>{aula.sintese}</Markdown>

      <div className="footer">
        <Link href={`/area/${area.id}/`}>← voltar a {area.titulo}</Link>
      </div>
    </div>
  );
}
