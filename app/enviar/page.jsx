import Link from "next/link";
import Uploader from "./Uploader";
import { getCursos, getPartilhada } from "../../lib/conteudo";

export const metadata = { title: "Enviar aula — SyntIA" };

export default function EnviarPage() {
  const cursos = getCursos().map((c) => ({
    id: c.id,
    titulo: c.titulo,
    cadeiras: c.cadeiras
      .filter((k) => !k.partilhada)
      .map((k) => ({ id: k.id, titulo: k.titulo })),
  }));
  const part = getPartilhada();
  const partilhada = part ? { id: part.id, titulo: part.titulo } : null;

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / Enviar aula
      </div>
      <h1>Enviar aula</h1>
      <p className="lead">
        Escolhe o curso e a cadeira, arrasta os ficheiros e envia — MP3, PDF ou txt,
        à vontade misturados. O resto é automático: cada um vira síntese, flashcards e
        ideias de produto na cadeira certa daqui a alguns minutos (o áudio é transcrito,
        o PDF e o txt são lidos). Se for uma cadeira nova, é criada na hora.
      </p>

      <Uploader cursos={cursos} partilhada={partilhada} />

      <div className="footer">O áudio fica guardado em segurança; ao repositório vão só os textos gerados.</div>
    </>
  );
}
