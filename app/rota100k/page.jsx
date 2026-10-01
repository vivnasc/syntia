import Link from "next/link";
import { getRota } from "../../lib/conteudo";
import Markdown from "../Markdown";
import Quiz from "../Quiz";
import Consolidar from "../Consolidar";
import Apagar from "../Apagar";

export const metadata = { title: "ROTA100K — SyntIA" };

export default function RotaPage() {
  const r = getRota();
  if (!r) return <div className="empty">A ROTA100K ainda não tem nada. Envia a primeira gravação em /enviar.</div>;

  const unidades = (r.unidades || []).filter((u) => u.n >= 1);
  const outras = (r.unidades || []).find((u) => u.n === 0);
  const vazio = unidades.every((u) => !u.aulas.length) && !(outras && outras.aulas.length);

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / {r.titulo}
      </div>
      <h1>{r.titulo}</h1>
      <p className="lead" style={{ marginTop: 4 }}>
        Criação de conteúdo, audiência e crescimento. Fica fora dos cursos da pós,
        mas passa pelo mesmo processamento e segue para o repositório dos produtos.
      </p>

      {r.materiais.length > 0 && (
        <>
          <div className="section-label">Material de referência</div>
          <div className="materiais">
            {r.materiais.map((m) => (
              <span key={m.ficheiro} className="mat-wrap">
                <a className="mat" href={`/${m.ficheiro}`} target="_blank" rel="noreferrer">
                  <span className="ic">▤</span> {m.nome}
                </a>
                <Apagar
                  tipo="material"
                  curso="rota100k"
                  cadeira=""
                  arquivos={[m.ficheiro.replace("material/rota100k/", "")]}
                  rotulo={m.nome}
                />
              </span>
            ))}
          </div>
        </>
      )}

      {vazio ? (
        <div className="empty" style={{ marginTop: 28 }}>
          Ainda sem aulas. Envia a gravação em <Link href="/enviar">/enviar</Link> e escolhe ROTA100K.
        </div>
      ) : (
        <div className="section-label" style={{ marginTop: 34 }}>Aulas por unidade</div>
      )}

      {unidades.map((u) => (
        <div key={u.n} className="unidade">
          <div className="unidade-cab">
            <span className="unidade-n">U{u.n}</span>
            <span>{u.titulo}</span>
            <span className="unidade-c">{u.aulas.length ? `${u.aulas.length} aula${u.aulas.length === 1 ? "" : "s"}` : "por dar"}</span>
          </div>
          {u.objetivos && (
            <details className="painel-uni">
              <summary>🎯 Objetivos desta unidade</summary>
              <Markdown>{u.objetivos}</Markdown>
            </details>
          )}
          {u.resumo && (
            <details className="painel-uni">
              <summary>📘 Resumo da unidade</summary>
              <Markdown>{u.resumo}</Markdown>
            </details>
          )}
          {u.quiz?.length > 0 && (
            <details className="painel-uni">
              <summary>📝 Treina — quiz da unidade ({u.quiz.length} perguntas)</summary>
              <Quiz perguntas={u.quiz} />
            </details>
          )}
          {u.aulas.length > 0 && <Consolidar curso="rota100k" cadeira="" unidade={u.n} />}
          {u.aulas.length > 0 && (
            <div className="list">
              {u.aulas.map((aula) => (
                <div key={aula.nome} className="row-wrap">
                  <Link href={`/rota100k/aula/${encodeURIComponent(aula.nome)}`} className="row">
                    <span className="grow">
                      <div style={{ fontWeight: 600 }}>{aula.titulo}</div>
                      <div className="meta">{aula.flashcards.length} flashcard{aula.flashcards.length === 1 ? "" : "s"}</div>
                    </span>
                    <span className="arrow">→</span>
                  </Link>
                  <Apagar curso="rota100k" cadeira="" arquivos={aula.arquivos} rotulo={aula.titulo} />
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
              <div key={aula.nome} className="row-wrap">
                <Link href={`/rota100k/aula/${encodeURIComponent(aula.nome)}`} className="row">
                  <span className="grow"><div style={{ fontWeight: 600 }}>{aula.titulo}</div></span>
                  <span className="arrow">→</span>
                </Link>
                <Apagar curso="rota100k" cadeira="" arquivos={aula.arquivos} rotulo={aula.titulo} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
