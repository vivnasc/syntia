"use client";

// Botão que dispara a impressão do navegador. Em "Guardar como PDF" produz o
// ficheiro do manual. Fica escondido na impressão (classe no-print).
export default function ImprimirBtn({ children = "🖨 Imprimir / Guardar PDF" }) {
  return (
    <button type="button" className="btn-imprimir no-print" onClick={() => window.print()}>
      {children}
    </button>
  );
}
