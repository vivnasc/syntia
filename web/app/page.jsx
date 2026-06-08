import Link from "next/link";
import Topbar from "./Topbar";
import { getCursos, getPartilhada, getBanco } from "../lib/conteudo";

export default function Home() {
  const cursos = getCursos();
  const partilhada = getPartilhada();
  const banco = getBanco();

  return (
    <div className="wrap">
      <Topbar active="areas" />
      <h1>As tuas áreas de estudo</h1>
      <p className="lead">
        Larga os MP3 das aulas no repositório e elas aparecem aqui com síntese,
        flashcards e ideias de produto — tudo automático.
      </p>

      <div className="grid">
        {cursos.map((c, i) => (
          <Link key={c.id} href={`/area/${c.id}/`} className="card">
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
          <h2>Disciplina partilhada</h2>
          <p className="lead" style={{ marginTop: -4 }}>
            Comum às três pós — fica num só sítio, nunca duplicada.
          </p>
          <Link href={`/area/${partilhada.id}/`} className="card" style={{ maxWidth: 420 }}>
            <div className="eyebrow">Partilhada</div>
            <div className="title">{partilhada.titulo}</div>
            <div className="meta">
              {partilhada.aulas.length} aula{partilhada.aulas.length === 1 ? "" : "s"} · {partilhada.materiais.length} PDF
            </div>
          </Link>
        </>
      )}

      <h2>Banco de Produto</h2>
      <p className="lead" style={{ marginTop: -4 }}>
        Tudo o que as aulas geram para os teus produtos, filtrável por tema.
      </p>
      <Link href="/produto/" className="card" style={{ maxWidth: 420 }}>
        <div className="eyebrow">corpo · amor · maternidade · prosperidade</div>
        <div className="title">Abrir o Banco de Produto</div>
        <div className="meta">{banco.length} ideia{banco.length === 1 ? "" : "s"} reunida{banco.length === 1 ? "" : "s"}</div>
      </Link>

      <div className="footer">PWA instalável · conteúdo gerado a partir do repositório</div>
    </div>
  );
}
