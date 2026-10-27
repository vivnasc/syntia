import AulaRaiz from "../../../AulaRaiz";
import { getRaiz } from "../../../../lib/conteudo";

export function generateStaticParams() {
  const out = (getRaiz("destrave-story")?.aulas || []).map((a) => ({ aula: a.nome }));
  return out.length ? out : [{ aula: "_" }];
}

export default function AulaDestraveStoryPage({ params }) {
  return <AulaRaiz id="destrave-story" nome={decodeURIComponent(params.aula)} />;
}
