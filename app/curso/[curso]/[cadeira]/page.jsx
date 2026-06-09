import Link from "next/link";
import { getCursos, getCadeira } from "../../../../lib/conteudo";
import { Prazo } from "../../../Prazo";
import Markdown from "../../../Markdown";

export function generateStaticParams() {
  const out = [];
  for (const c of getCursos())
    for (const k of c.cadeiras)
      if (!k.partilhada) out.push({ curso: c.id, cadeira: k.id });
  return out.length ? out : [{ curso: "_", cadeira: "_" }];
}

export default function CadeiraPage({ params }) {
  const found = getCadeira(params.curso, params.cadeira);
  if (!found) return <div className="empty">Disciplina não encontrada.</div>;
  const { curso, cadeira } = found;

  const unidades = (cadeira.unidades || []).filter((u) => u.n >= 1);
  const outras = (cadeira.unidades || []).find((u) => u.n === 0);
  const unidadesComAulas = unidades.filter((u) => u.aulas.length > 0).length;

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / <Link href={`/curso/${curso.id}`}>{curso.titulo}</Link> / {cadeira.titulo}
      </div>
      <h1>{cadeira.titulo}</h1>
      {cadeira.inicio && cadeira.fim && (
        <p className="lead" style={{ marginTop: 4 }}><Prazo inicio={cadeira.inicio} fim={cadeira.fim} /></p>
      )}

      {cadeira.ementa?.length > 0 && (
        <>
          <div className="section-label">No programa, esta disciplina cobre</div>
          <ul className="ementa">
            {cadeira.ementa.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </>
      )}

      {cadeira.materiais.length > 0 && (
        <>
          <div className="section-label" style={{ marginTop: 30 }}>Material de referência</div>
          <div className="materiais">
            {cadeira.materiais.map((m) => (
              <a key={m.ficheiro} className="mat" href={`/${m.ficheiro}`} target="_blank" rel="noreferrer">
                <span className="ic">▤</span> {m.nome}
              </a>
            ))}
          </div>
        </>
      )}

      <div className="section-label" style={{ marginTop: 34 }}>
        Aulas por unidade · {unidadesComAulas} de {unidades.length} unidades começadas
      </div>

      {unidades.map((u) => (
        <div key={u.n} className="unidade">
          <div className="unidade-cab">
            <span className="unidade-n">U{u.n}</span>
            <span>{u.titulo}</span>
            <span className="unidade-c">{u.aulas.length ? `${u.aulas.length} aula${u.aulas.length === 1 ? "" : "s"}` : "por dar"}</span>
          </div>
          {u.objetivos && (
            <details className="painel-uni" open>
              <summary>🎯 Objetivos desta unidade</summary>
              <Markdown>{u.objetivos}</Markdown>
            </details>
          )}
          {u.complementar && (
            <details className="painel-uni">
              <summary>📎 Material complementar e leituras</summary>
              <Markdown>{u.complementar}</Markdown>
            </details>
          )}
          {u.aulas.length > 0 && (
            <div className="list">
              {u.aulas.map((aula) => (
                <Link key={aula.nome} href={`/curso/${curso.id}/${cadeira.id}/aula/${encodeURIComponent(aula.nome)}`} className="row">
                  <span className="grow">
                    <div style={{ fontWeight: 600 }}>{aula.titulo}</div>
                    <div className="meta">
                      {aula.partes > 1 ? `${aula.partes} partes · ` : ""}{aula.flashcards.length} flashcard{aula.flashcards.length === 1 ? "" : "s"}
                    </div>
                  </span>
                  <span className="arrow">→</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}

      {outras && outras.aulas.length > 0 && (
        <div className="unidade">
          <div className="unidade-cab"><span>{outras.titulo}</span></div>
          <div className="list">
            {outras.aulas.map((aula) => (
              <Link key={aula.nome} href={`/curso/${curso.id}/${cadeira.id}/aula/${encodeURIComponent(aula.nome)}`} className="row">
                <span className="grow"><div style={{ fontWeight: 600 }}>{aula.titulo}</div></span>
                <span className="arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {unidadesComAulas === 0 && (
        <div className="empty">
          Ainda sem aulas. Envia os MP3 desta disciplina em <strong>Enviar aula</strong> — o nome
          (U1_, U2_…) coloca cada um na unidade certa.
        </div>
      )}
    </>
  );
}
