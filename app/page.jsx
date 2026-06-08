import Link from "next/link";
import { getCursos, getPartilhada, getBanco } from "../lib/conteudo";

export default function Home() {
  const cursos = getCursos();
  const partilhada = getPartilhada();
  const banco = getBanco();

  return (
    <>
      <h1>As tuas áreas de estudo</h1>
      <p className="lead">
        Escolhe uma área na barra ao lado para ver as aulas. Larga MP3 novos em
        <strong> Enviar aula</strong> e a síntese, os flashcards e as ideias de
        produto aparecem aqui sozinhos.
      </p>

      <div className="section-label">Pós-graduações</div>
      <div className="grid">
        {cursos.map((c, i) => (
          <Link key={c.id} href={`/area/${c.id}`} className="card">
            <div className="eyebrow">Pós-graduação {String(i + 1).padStart(2, "0")}</div>
            <div className="title">{c.titulo}</div>
            <div className="meta">
              {c.aulas.length} aula{c.aulas.length === 1 ? "" : "s"} · {c.materiais.length} PDF de referência
            </div>
          </Link>
        ))}
      </div>

      {partilhada && (
        <>
          <div className="section-label" style={{ marginTop: 34 }}>Disciplina partilhada</div>
          <Link href={`/area/${partilhada.id}`} className="card">
            <div className="eyebrow">Comum às três pós · nunca duplicada</div>
            <div className="title">{partilhada.titulo}</div>
            <div className="meta">
              {partilhada.aulas.length} aula{partilhada.aulas.length === 1 ? "" : "s"} · {partilhada.materiais.length} PDF
            </div>
          </Link>
        </>
      )}

      <div className="section-label" style={{ marginTop: 34 }}>Banco de Produto</div>
      <Link href="/produto" className="card">
        <div className="eyebrow">corpo · amor · maternidade · prosperidade</div>
        <div className="title">Abrir o Banco de Produto</div>
        <div className="meta">{banco.length} ideia{banco.length === 1 ? "" : "s"} reunida{banco.length === 1 ? "" : "s"} dos teus produtos</div>
      </Link>

      <div className="footer">PWA instalável · conteúdo gerado a partir do repositório</div>
    </>
  );
}
