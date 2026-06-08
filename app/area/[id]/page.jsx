import Link from "next/link";
import { getAreas, getArea } from "../../../lib/conteudo";

export function generateStaticParams() {
  const ids = getAreas().map((a) => ({ id: a.id }));
  return ids.length ? ids : [{ id: "_" }];
}

export default function AreaPage({ params }) {
  const area = getArea(params.id);
  if (!area) {
    return <div className="empty">Área não encontrada.</div>;
  }

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / {area.titulo}
      </div>
      <h1>{area.titulo}</h1>

      {area.materiais.length > 0 && (
        <>
          <div className="section-label">Material de referência</div>
          <div className="materiais">
            {area.materiais.map((m) => (
              <a key={m.ficheiro} className="mat" href={`/${m.ficheiro}`} target="_blank" rel="noreferrer">
                <span className="ic">▤</span> {m.nome}
              </a>
            ))}
          </div>
        </>
      )}

      <div className="section-label" style={{ marginTop: 34 }}>
        Aulas{area.aulas.length ? ` · ${area.aulas.length}` : ""}
      </div>
      {area.aulas.length === 0 ? (
        <div className="empty">
          Ainda sem aulas processadas. Envia um MP3 em <strong>Enviar aula</strong> e a
          síntese aparece aqui automaticamente.
        </div>
      ) : (
        <div className="list">
          {area.aulas.map((aula, i) => (
            <Link key={aula.nome} href={`/area/${area.id}/aula/${encodeURIComponent(aula.nome)}`} className="row">
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <span className="grow">
                <div style={{ fontWeight: 600 }}>{aula.titulo}</div>
                <div className="meta">
                  {aula.flashcards.length} flashcard{aula.flashcards.length === 1 ? "" : "s"}
                </div>
              </span>
              <span className="arrow">→</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
