import Link from "next/link";
import { getCursos, getCadeira } from "../../../../../lib/conteudo";
import ManualPDFClient from "./ManualPDFClient";

export function generateStaticParams() {
  const out = [];
  for (const c of getCursos())
    for (const k of c.cadeiras)
      if (!k.partilhada) out.push({ curso: c.id, cadeira: k.id });
  return out.length ? out : [{ curso: "_", cadeira: "_" }];
}

// Manual de uma cadeira como PDF renderizado pela própria app (@react-pdf):
// documento real, paginado, com capa, uma unidade por página (objetivos +
// resumo + lista de aulas) e numeração. Mostrado num visualizador embutido,
// com botão para descarregar. Genérico — serve qualquer cadeira dos 3 cursos.
export default function ManualPage({ params }) {
  const found = getCadeira(params.curso, params.cadeira);
  if (!found) return <div className="empty">Disciplina não encontrada.</div>;
  const { curso, cadeira } = found;

  const unidades = (cadeira.unidades || [])
    .filter((u) => u.aulas.length > 0 || u.objetivos || u.resumo)
    .map((u) => ({
      n: u.n,
      titulo: u.titulo,
      objetivos: u.objetivos || "",
      resumo: u.resumo || "",
      aulas: (u.aulas || []).map((a) => ({ titulo: a.titulo, flashcards: a.flashcards?.length || 0 })),
    }));

  const hoje = new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="manual-pdf-page">
      <div className="manual-barra">
        <Link href={`/curso/${curso.id}/${cadeira.id}`}>← voltar à disciplina</Link>
      </div>

      {unidades.length === 0 ? (
        <p className="empty">Esta disciplina ainda não tem conteúdo para compilar.</p>
      ) : (
        <ManualPDFClient
          curso={{ id: curso.id, titulo: curso.titulo }}
          cadeira={{ id: cadeira.id, titulo: cadeira.titulo, ementa: cadeira.ementa || [], apresentacao: cadeira.apresentacao || "" }}
          unidades={unidades}
          hoje={hoje}
        />
      )}
    </div>
  );
}
