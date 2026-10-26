import Link from "next/link";
import { getRaiz } from "../lib/conteudo";
import Markdown from "./Markdown";
import Quiz from "./Quiz";
import Consolidar from "./Consolidar";
import Apagar from "./Apagar";

// Página de uma área de raiz (ROTA100K, VENDA100K): espaços próprios fora dos
// cursos da pós. Têm a mesma forma de uma cadeira, por isso a página é a mesma
// e só muda o id. Os títulos das unidades vêm do modulos.json da área, quando
// existe; sem ele ficam "Unidade 1", "Unidade 2", como na ROTA100K.
export default function AreaRaiz({ id }) {
  const r = getRaiz(id);
  if (!r) return <div className="empty">Esta área ainda não tem nada. Envia a primeira gravação em /enviar.</div>;

  const unidades = (r.unidades || []).filter((u) => u.n >= 1);
  const outras = (r.unidades || []).find((u) => u.n === 0);
  const vazio = unidades.every((u) => !u.aulas.length) && !(outras && outras.aulas.length);
  const temModulos = unidades.some((u) => !/^Unidade \d+$/.test(u.titulo));

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / {r.titulo}
      </div>
      <h1>{r.titulo}</h1>
      <p className="lead" style={{ marginTop: 4 }}>{r.descricao}</p>

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
                  curso={r.id}
                  cadeira=""
                  arquivos={[m.ficheiro.replace(`material/${r.id}/`, "")]}
                  rotulo={m.nome}
                />
              </span>
            ))}
          </div>
        </>
      )}

      {vazio ? (
        <div className="empty" style={{ marginTop: 28 }}>
          Ainda sem aulas. Envia a gravação em <Link href="/enviar">/enviar</Link> e escolhe {r.titulo}.
        </div>
      ) : (
        <div className="section-label" style={{ marginTop: 34 }}>
          {temModulos ? "Aulas por módulo" : "Aulas por unidade"}
        </div>
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
          {u.aulas.length > 0 && <Consolidar curso={r.id} cadeira="" unidade={u.n} />}
          {u.aulas.length > 0 && (
            <div className="list">
              {u.aulas.map((aula) => (
                <div key={aula.nome} className="row-wrap">
                  <Link href={`/${r.id}/aula/${encodeURIComponent(aula.nome)}`} className="row">
                    <span className="grow">
                      <div style={{ fontWeight: 600 }}>{aula.titulo}</div>
                      <div className="meta">{aula.flashcards.length} flashcard{aula.flashcards.length === 1 ? "" : "s"}</div>
                    </span>
                    <span className="arrow">→</span>
                  </Link>
                  <Apagar curso={r.id} cadeira="" arquivos={aula.arquivos} rotulo={aula.titulo} />
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
                <Link href={`/${r.id}/aula/${encodeURIComponent(aula.nome)}`} className="row">
                  <span className="grow"><div style={{ fontWeight: 600 }}>{aula.titulo}</div></span>
                  <span className="arrow">→</span>
                </Link>
                <Apagar curso={r.id} cadeira="" arquivos={aula.arquivos} rotulo={aula.titulo} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
