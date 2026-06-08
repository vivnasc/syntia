import Link from "next/link";
import Uploader from "./Uploader";
import { getCursos, getPartilhada } from "../../lib/conteudo";

export const metadata = { title: "Enviar aula — SyntIA" };

export default function EnviarPage() {
  const cursos = getCursos();
  const partilhada = getPartilhada();
  const areas = [
    ...cursos.map((c) => ({ id: c.id, titulo: c.titulo })),
    ...(partilhada ? [{ id: partilhada.id, titulo: partilhada.titulo }] : []),
  ];

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / Enviar aula
      </div>
      <h1>Enviar aula</h1>
      <p className="lead">
        Arrasta o MP3 da aula, escolhe a área e envia. O resto é automático:
        transcrição, síntese, flashcards e ideias de produto aparecem na app daqui
        a alguns minutos. Não precisas de abrir o GitHub.
      </p>

      <Uploader areas={areas} />

      <div className="footer">O áudio fica guardado em segurança; ao repositório vão só os textos gerados.</div>
    </>
  );
}
