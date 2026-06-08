import "./globals.css";
import SWRegister from "./SWRegister";
import Sidebar from "./Sidebar";
import { getCursos, getPartilhada } from "../lib/conteudo";
export const metadata = {
  title: "SyntIA — Estudo das pós-graduações",
  description: "Sínteses, flashcards e banco de produto das aulas, gerados automaticamente.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "SyntIA" },
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/icon-180.png",
  },
};

export const viewport = {
  themeColor: "#141210",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  const part = getPartilhada();
  const partTemAulas = !!(part && part.aulas.length);
  const cursos = getCursos().map((c) => ({
    id: c.id,
    titulo: c.titulo,
    cadeiras: c.cadeiras.map((k) => ({
      id: k.id,
      titulo: k.titulo,
      partilhada: !!k.partilhada,
      feita: k.partilhada ? partTemAulas : k.aulas.length > 0,
    })),
  }));
  const partilhada = part ? { id: part.id, titulo: part.titulo } : null;

  return (
    <html lang="pt">
      <body>
        <SWRegister />
        <div className="app">
          <Sidebar cursos={cursos} partilhada={partilhada} />
          <main className="main">
            <div className="main-inner">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
