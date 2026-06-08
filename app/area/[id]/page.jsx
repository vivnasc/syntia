import Link from "next/link";
import Topbar from "../../Topbar";
import { getAreas, getArea } from "../../../lib/conteudo";

export function generateStaticParams() {
  const ids = getAreas().map((a) => ({ id: a.id }));
  return ids.length ? ids : [{ id: "_" }];
}

export default function AreaPage({ params }) {
  const area = getArea(params.id);
  if (!area) {
    return (
      <div className="wrap">
        <Topbar active="areas" />
        <div className="empty">Área não encontrada.</div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <Topbar active="areas" />
      <div className="crumbs">
        <Link href="/">Áreas</Link> / {area.titulo}
      </div>
      <h1>{area.titulo}</h1>

      {area.materiais.length > 0 && (
        <>
          <h2>Material de referência</h2>
          <div className="materiais">
            {area.materiais.map((m) => (
              <a key={m.ficheiro} className="mat" href={`/${m.ficheiro}`} target="_blank" rel="noreferrer">
                <span className="ic">▤</span> {m.nome}
              </a>
            ))}
          </div>
        </>
      )}

      <h2>Aulas</h2>
      {area.aulas.length === 0 ? (
        <div className="empty">
          Ainda sem aulas processadas. Larga um MP3 em <code>{area.id}/_audio/</code> e
          a síntese aparece aqui automaticamente.
        </div>
      ) : (
        <div className="list">
          {area.aulas.map((aula, i) => (
            <Link key={aula.nome} href={`/area/${area.id}/aula/${encodeURIComponent(aula.nome)}/`} className="row">
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <span className="grow">
                <div style={{ fontWeight: 650 }}>{aula.titulo}</div>
                <div className="meta" style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                  {aula.flashcards.length} flashcard{aula.flashcards.length === 1 ? "" : "s"}
                </div>
              </span>
              <span className="arrow">→</span>
            </Link>
          ))}
        </div>
      )}

      <div className="footer">{area.titulo}</div>
    </div>
  );
}
