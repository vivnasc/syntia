"use client";

import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { buildManualDocument } from "./pdfDoc";

export default function ManualPDF(props) {
  const doc = buildManualDocument(props);
  const ficheiro = `${props.cadeira.titulo}.pdf`.replace(/[\\/:*?"<>|]+/g, " ").trim();

  return (
    <div className="pdf-wrap">
      <div className="pdf-bar no-print">
        <PDFDownloadLink document={doc} fileName={ficheiro} className="btn-imprimir">
          {({ loading }) => (loading ? "A preparar…" : "⬇  Descarregar PDF")}
        </PDFDownloadLink>
      </div>
      <PDFViewer showToolbar style={{ width: "100%", height: "82vh", border: "none", borderRadius: 10 }}>
        {doc}
      </PDFViewer>
    </div>
  );
}
