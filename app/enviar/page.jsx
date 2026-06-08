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
        Escolhe o curso e a cadeira, arrasta o MP3 e envia. O resto é automático:
        transcrição, síntese, flashcards e ideias de produto aparecem na cadeira certa
        daqui a alguns minutos. Se for uma cadeira nova, é criada na hora.
      </p>

      <Uploader cursos={cursos} partilhada={partilhada} />

      <div className="footer">O áudio fica guardado em segurança; ao repositório vão só os textos gerados.</div>
    </>
  );
}
