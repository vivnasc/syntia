import AulaRaiz from "../../../AulaRaiz";
import { getRaiz } from "../../../../lib/conteudo";

export function generateStaticParams() {
  const out = (getRaiz("rota100k")?.aulas || []).map((a) => ({ aula: a.nome }));
  return out.length ? out : [{ aula: "_" }];
}

export default function AulaRotaPage({ params }) {
  return <AulaRaiz id="rota100k" nome={decodeURIComponent(params.aula)} />;
}
