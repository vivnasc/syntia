import Link from "next/link";
import { getCursos, getCurso, getPartilhada } from "../../../lib/conteudo";
import { Prazo } from "../../Prazo";

export function generateStaticParams() {
  const ids = getCursos().map((c) => ({ curso: c.id }));
  return ids.length ? ids : [{ curso: "_" }];
}

export default function CursoPage({ params }) {
  const curso = getCurso(params.curso);
  if (!curso) return <div className="empty">Curso não encontrado.</div>;
  const partTemAulas = !!(getPartilhada()?.aulas.length);

  const total = curso.cadeiras.length;
  const comecadas = curso.cadeiras.filter((k) => (k.partilhada ? partTemAulas : k.aulas.length > 0)).length;
  const pct = total ? Math.round((comecadas / total) * 100) : 0;

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / {curso.titulo}
      </div>
      <h1>{curso.titulo}</h1>
      <p className="lead">{total} disciplinas no programa · {comecadas} começada{comecadas === 1 ? "" : "s"}.</p>
      <div className="bar" style={{ maxWidth: 420 }}><span style={{ width: `${pct}%` }} /></div>

      {curso.materiais.length > 0 && (
        <>
          <div className="section-label" style={{ marginTop: 30 }}>Programa do curso</div>
          <div className="materiais">
            {curso.materiais.map((m) => (
              <a key={m.ficheiro} className="mat" href={`/${m.ficheiro}`} target="_blank" rel="noreferrer">
                <span className="ic">▤</span> {m.nome}
              </a>
            ))}
          </div>
        </>
      )}

      <div className="section-label" style={{ marginTop: 34 }}>Disciplinas · {total}</div>
      <div className="list">
        {curso.cadeiras.map((k, i) => {
          const feita = k.partilhada ? partTemAulas : k.aulas.length > 0;
          const href = k.partilhada ? "/partilhada" : `/curso/${curso.id}/${k.id}`;
          const estado = k.partilhada
            ? "disciplina comum às 3 pós"
            : feita
              ? `${k.aulas.length} aula${k.aulas.length === 1 ? "" : "s"}`
              : "por começar";
          return (
            <Link key={k.id} href={href} className={`row${feita ? "" : " row-dim"}`}>
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <span className="grow">
                <div style={{ fontWeight: 600 }}>
                  {k.titulo} {k.partilhada && <span className="sb-tag">comum</span>}
                </div>
                <div className="meta">{estado}{k.ementa?.length ? ` · ${k.ementa.length} tópicos` : ""}</div>
                {k.inicio && k.fim && <Prazo inicio={k.inicio} fim={k.fim} />}
              </span>
              <span className="arrow">→</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
