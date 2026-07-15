"use client";

import { useEffect, useMemo, useState } from "react";
import { usePDF } from "@react-pdf/renderer";
import { buildManualDocument } from "./pdfDoc";

// Gera o PDF no browser com rede de segurança: primeiro a versão com visual
// (barras/pílulas); se o react-pdf rebentar num conteúdo específico, volta a
// gerar em modo "safe" (cabeçalhos planos) para o manual sair à mesma.
export default function ManualPDF(props) {
  const [safe, setSafe] = useState(false);
  const ficheiro = `${props.cadeira.titulo}.pdf`.replace(/[\\/:*?"<>|]+/g, " ").trim();

  const doc = useMemo(() => buildManualDocument({ ...props, safe }), [props, safe]);
  const [inst, update] = usePDF({ document: doc });

  // Regenera quando o documento muda (ex.: ao entrar em modo seguro).
  useEffect(() => { update(doc); }, [doc, update]);

  // Se a versão com visual falhar, tenta uma vez em modo seguro.
  useEffect(() => {
    if (inst.error && !safe) setSafe(true);
  }, [inst.error, safe]);

  if (inst.error) {
    return <p className="empty">Não foi possível gerar o PDF deste manual.</p>;
  }
  if (inst.loading || !inst.url) {
    return <p className="empty">A preparar o PDF…</p>;
  }

  return (
    <div className="pdf-wrap">
      <div className="pdf-bar no-print">
        <a href={inst.url} download={ficheiro} className="btn-imprimir">⬇&nbsp;&nbsp;Descarregar PDF</a>
      </div>
      <iframe
        src={inst.url}
        title="Manual de estudo"
        style={{ width: "100%", height: "82vh", border: "none", borderRadius: 10 }}
      />
    </div>
  );
}
