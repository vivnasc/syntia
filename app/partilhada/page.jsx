import Link from "next/link";
import { getPartilhada } from "../../lib/conteudo";
import { Prazo } from "../Prazo";
import Markdown from "../Markdown";
import Quiz from "../Quiz";

export const metadata = { title: "Disciplina Partilhada — SyntIA" };

export default function PartilhadaPage() {
  const p = getPartilhada();
  if (!p) return <div className="empty">Sem disciplina partilhada.</div>;

  const unidades = (p.unidades || []).filter((u) => u.n >= 1);
  const outras = (p.unidades || []).find((u) => u.n === 0);

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / {p.titulo}
      </div>
      <h1>{p.titulo}</h1>
      <p className="lead" style={{ marginTop: 4 }}>
        Comum às três pós-graduações — guardada num só sítio. {p.inicio && p.fim && <Prazo inicio={p.inicio} fim={p.fim} />}
      </p>

      {p.materiais.length > 0 && (
        <>
          <div className="section-label">Material de referência</div>
          <div className="materiais">
            {p.materiais.map((m) => (
              <a key={m.ficheiro} className="mat" href={`/${m.ficheiro}`} target="_blank" rel="noreferrer">
                <span className="ic">▤</span> {m.nome}
              </a>
            ))}
          </div>
        </>
      )}

      <div className="section-label" style={{ marginTop: 34 }}>Aulas por unidade</div>
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
          {u.complementar && (
            <details className="painel-uni">
              <summary>📎 Material complementar e leituras</summary>
              <Markdown>{u.complementar}</Markdown>
            </details>
          )}
          {u.aulas.length > 0 && (
            <div className="list">
              {u.aulas.map((aula) => (
                <Link key={aula.nome} href={`/partilhada/aula/${encodeURIComponent(aula.nome)}`} className="row">
                  <span className="grow">
                    <div style={{ fontWeight: 600 }}>{aula.titulo}</div>
                    <div className="meta">{aula.flashcards.length} flashcard{aula.flashcards.length === 1 ? "" : "s"}</div>
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
              <Link key={aula.nome} href={`/partilhada/aula/${encodeURIComponent(aula.nome)}`} className="row">
                <span className="grow"><div style={{ fontWeight: 600 }}>{aula.titulo}</div></span>
                <span className="arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
