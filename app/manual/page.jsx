import Link from "next/link";
import manuais from "../../lib/manuais.json";

export const metadata = { title: "Manuais para descarregar · SyntIA" };

const mb = (b) => `${(b / (1024 * 1024)).toFixed(b < 1024 * 1024 ? 2 : 1)} MB`;

// Um ficheiro, uma linha: o que é, o que traz, o tamanho, e um botão que
// descarrega. O href aponta para /manual/<ficheiro>.md, que é um ficheiro
// estático em public/ — não passa por função nenhuma, não tem limite de 4,5 MB
// nem timeout, e abre à primeira mesmo com 6 MB.
function Linha({ titulo, nota, ficheiro, bytes, aulas, cards, destaque }) {
  return (
    <div className={`dl-row${destaque ? " dl-destaque" : ""}`}>
      <div className="grow">
        <div className="dl-titulo">{titulo}</div>
        <div className="meta">
          {nota}
          {aulas ? ` · ${aulas} aula${aulas === 1 ? "" : "s"}` : ""}
          {cards ? ` · ${cards} perguntas de revisão` : ""} · {mb(bytes)}
        </div>
      </div>
      <a className="btn-manual" href={`/manual/${ficheiro}`} download={ficheiro}>
        ⬇ descarregar
      </a>
    </div>
  );
}

export default function ManuaisPage() {
  const cursos = manuais.cursos || [];

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / Manuais para descarregar
      </div>
      <h1>Manuais para descarregar</h1>
      <p className="lead">
        A matéria inteira num ficheiro: as sínteses de cada aula, os objetivos e
        os resumos de cada unidade, as perguntas de revisão e as de avaliação.
        Descarrega e usa onde quiseres — <strong>ChatGPT</strong>,{" "}
        <strong>Gemini</strong>, NotebookLM, ou só para ler.
      </p>

      <div className="dl-como">
        <strong>Como se usa, em dois passos</strong>
        <ol>
          <li>Carrega em <em>descarregar</em>. O ficheiro vai para os teus Ficheiros.</li>
          <li>
            No ChatGPT ou no Gemini, anexa-o à conversa e pergunta. O ficheiro já
            diz ao modelo que a matéria é tua e que deve responder a partir dela.
          </li>
        </ol>
        <p className="dl-nota">
          É <strong>.md</strong> (texto) e não PDF de propósito: um PDF perde os
          títulos e gasta o dobro dos tokens; o texto entra inteiro, com as
          disciplinas e as unidades a servirem de índice ao modelo.
        </p>
      </div>

      {manuais.rota && (
        <>
          {/* A ROTA100K em secção própria, e ⛔ não dentro das pós: é conhecimento de
              negócio, ⛔ não matéria académica — é uma distinção dela. Por isso também
              ⛔ não entra no «tudo junto». */}
          <div className="section-label" style={{ marginTop: 34 }}>{manuais.rota.titulo}</div>
          <Linha
            destaque
            titulo="O curso completo"
            nota="criação de conteúdo e crescimento · lista única de aulas, sem módulos"
            ficheiro={manuais.rota.ficheiro}
            bytes={manuais.rota.bytes}
            aulas={manuais.rota.aulas}
            cards={manuais.rota.cards}
          />
        </>
      )}

      <div className="section-label" style={{ marginTop: 34 }}>Pós-graduações, tudo junto</div>
      <Linha
        destaque
        titulo="As pós-graduações todas"
        nota={`${cursos.length} cursos num ficheiro`}
        ficheiro={manuais.tudo.ficheiro}
        bytes={manuais.tudo.bytes}
        aulas={manuais.tudo.aulas}
        cards={manuais.tudo.cards}
      />

      {cursos.map((c) => (
        <div key={c.id} style={{ marginTop: 30 }}>
          <div className="section-label">{c.titulo}</div>
          <Linha
            destaque
            titulo="O curso completo"
            nota={`${c.disciplinas.length} disciplina${c.disciplinas.length === 1 ? "" : "s"}`}
            ficheiro={c.ficheiro}
            bytes={c.bytes}
            aulas={c.aulas}
            cards={c.cards}
          />
          {c.disciplinas.map((k) => (
            <Linha
              key={k.id}
              titulo={k.titulo}
              nota="só esta disciplina"
              ficheiro={k.ficheiro}
              bytes={k.bytes}
              aulas={k.aulas}
              cards={k.cards}
            />
          ))}
        </div>
      ))}

      {cursos.length === 0 && !manuais.rota && (
        <p className="empty">Ainda não há matéria sintetizada para compilar.</p>
      )}
    </>
  );
}
