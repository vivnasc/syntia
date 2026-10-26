import AulaRaiz from "../../../AulaRaiz";
import { getRaiz } from "../../../../lib/conteudo";

export function generateStaticParams() {
  const out = (getRaiz("venda100k")?.aulas || []).map((a) => ({ aula: a.nome }));
  return out.length ? out : [{ aula: "_" }];
}

export default function AulaVendaPage({ params }) {
  return <AulaRaiz id="venda100k" nome={decodeURIComponent(params.aula)} />;
}
