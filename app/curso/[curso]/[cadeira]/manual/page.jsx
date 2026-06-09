import Link from "next/link";
import { getCursos, getCadeira } from "../../../../../lib/conteudo";
import Markdown from "../../../../Markdown";
import ImprimirBtn from "../../../../ImprimirBtn";

export function generateStaticParams() {
  const out = [];
  for (const c of getCursos())
    for (const k of c.cadeiras)
      if (!k.partilhada) out.push({ curso: c.id, cadeira: k.id });
  return out.length ? out : [{ curso: "_", cadeira: "_" }];
}

// Manual imprimível de uma cadeira: junta numa só peça a ementa e, por unidade,
// os objetivos + resumo + a síntese e os flashcards de cada aula. Pensado para
// "Guardar como PDF" no navegador — daí o layout limpo e os estilos @media print.
export default function ManualPage({ params }) {
  const found = getCadeira(params.curso, params.cadeira);
  if (!found) return <div className="empty">Disciplina não encontrada.</div>;
  const { curso, cadeira } = found;

  const unidades = (cadeira.unidades || []).filter((u) => u.aulas.length > 0 || u.objetivos || u.resumo);
  const hoje = new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="manual">
      <div className="manual-barra no-print">
        <Link href={`/curso/${curso.id}/${cadeira.id}`}>← voltar à disciplina</Link>
        <ImprimirBtn />
      </div>

      {/* Capa */}
      <header className="manual-capa">
        <div className="manual-curso">{curso.titulo}</div>
        <h1 className="manual-titulo">{cadeira.titulo}</h1>
        <div className="manual-sub">Manual de estudo · gerado a {hoje}</div>
        {cadeira.ementa?.length > 0 && (
          <div className="manual-ementa">
            <div className="section-label">No programa</div>
            <ul>{cadeira.ementa.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
        )}
      </header>

      {unidades.length === 0 && (
        <p className="empty">Esta disciplina ainda não tem conteúdo para compilar.</p>
      )}

      {unidades.map((u) => (
        <section key={u.n} className="manual-unidade">
          <h2 className="manual-uni-cab">
            <span className="manual-uni-n">U{u.n}</span> {u.titulo}
          </h2>

          {u.objetivos && (
            <div className="manual-bloco">
              <h3>🎯 Objetivos da unidade</h3>
              <Markdown>{u.objetivos}</Markdown>
            </div>
          )}

          {u.resumo && (
            <div className="manual-bloco">
              <h3>📘 Resumo da unidade</h3>
              <Markdown>{u.resumo}</Markdown>
            </div>
          )}

          {u.aulas.map((aula) => (
            <article key={aula.nome} className="manual-aula">
              <h3 className="manual-aula-titulo">{aula.titulo}</h3>

              {aula.sintese && (
                <div className="manual-bloco">
                  <Markdown>{aula.sintese}</Markdown>
                </div>
              )}

              {aula.flashcards?.length > 0 && (
                <div className="manual-bloco manual-cards">
                  <h4>Flashcards · {aula.flashcards.length}</h4>
                  <ol>
                    {aula.flashcards.map((c, i) => (
                      <li key={i}>
                        <span className="manual-card-p">{c.p}</span>
                        <span className="manual-card-r">{c.r}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </article>
          ))}
        </section>
      ))}

      <footer className="manual-rodape">{curso.titulo} · {cadeira.titulo} · SyntIA</footer>
    </div>
  );
}
