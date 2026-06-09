import Link from "next/link";
import { getCursos, getCadeira } from "../../../../lib/conteudo";
import { Prazo } from "../../../Prazo";
import Markdown from "../../../Markdown";
import Quiz from "../../../Quiz";
import Consolidar from "../../../Consolidar";
import MoverAula from "../../../MoverAula";

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
  const numerosUnidades = unidades.map((u) => u.n);
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

      {unidades.some((u) => u.aulas.length > 0) && (
        <p style={{ marginTop: 14 }}>
          <Link href={`/curso/${curso.id}/${cadeira.id}/manual`} className="btn-manual">
            📘 Manual de estudo (PDF)
          </Link>
        </p>
      )}

      {cadeira.ementa?.length > 0 && (
        <>
          <div className="section-label">No programa, esta disciplina cobre</div>
          <ul className="ementa">
            {cadeira.ementa.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </>
      )}

      {cadeira.materiais.filter((m) => !m.unidade).length > 0 && (
        <>
          <div className="section-label" style={{ marginTop: 30 }}>Material de referência</div>
          <div className="materiais">
            {cadeira.materiais.filter((m) => !m.unidade).map((m) => (
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
            <details className="painel-uni">
              <summary>🎯 Objetivos desta unidade — guia de estudo</summary>
              <Markdown>{u.objetivos}</Markdown>
            </details>
          )}
          {u.resumo && (
            <details className="painel-uni">
              <summary>📘 Resumo da unidade — a matéria toda de relance</summary>
              <Markdown>{u.resumo}</Markdown>
            </details>
          )}
          {u.quiz?.length > 0 && (
            <details className="painel-uni">
              <summary>📝 Treina — quiz da unidade ({u.quiz.length} perguntas de escolha múltipla)</summary>
              <Quiz perguntas={u.quiz} />
            </details>
          )}
          {u.aulas.length > 0 && (
            <Consolidar curso={curso.id} cadeira={cadeira.id} unidade={u.n} />
          )}
          {u.complementar && (
            <details className="painel-uni">
              <summary>📎 Material complementar e leituras</summary>
              <Markdown>{u.complementar}</Markdown>
            </details>
          )}
          {cadeira.materiais.filter((m) => m.unidade === u.n).length > 0 && (
            <div className="materiais" style={{ marginBottom: 10 }}>
              {cadeira.materiais.filter((m) => m.unidade === u.n).map((m) => (
                <a key={m.ficheiro} className="mat" href={`/${m.ficheiro}`} target="_blank" rel="noreferrer">
                  <span className="ic">▤</span> {m.nome}
                </a>
              ))}
            </div>
          )}
          {u.aulas.length > 0 && (
            <div className="list">
              {u.aulas.map((aula) => (
                <div className="row-wrap" key={aula.nome}>
                  <Link href={`/curso/${curso.id}/${cadeira.id}/aula/${encodeURIComponent(aula.nome)}`} className="row">
                    <span className="grow">
                      <div style={{ fontWeight: 600 }}>{aula.titulo}</div>
                      <div className="meta">
                        {aula.partes > 1 ? `${aula.partes} partes · ` : ""}{aula.flashcards.length} flashcard{aula.flashcards.length === 1 ? "" : "s"}
                      </div>
                    </span>
                    <span className="arrow">→</span>
                  </Link>
                  <MoverAula curso={curso.id} cadeira={cadeira.id} arquivos={aula.arquivos} unidadeAtual={aula.unidade} unidades={numerosUnidades} />
                </div>
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
              <div className="row-wrap" key={aula.nome}>
                <Link href={`/curso/${curso.id}/${cadeira.id}/aula/${encodeURIComponent(aula.nome)}`} className="row">
                  <span className="grow"><div style={{ fontWeight: 600 }}>{aula.titulo}</div></span>
                  <span className="arrow">→</span>
                </Link>
                <MoverAula curso={curso.id} cadeira={cadeira.id} arquivos={aula.arquivos} unidadeAtual={aula.unidade ?? 0} unidades={numerosUnidades} />
              </div>
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
