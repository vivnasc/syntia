import "./globals.css";
import SWRegister from "./SWRegister";

export const metadata = {
  title: "SyntIA — Estudo das pós-graduações",
  description: "Sínteses, flashcards e banco de produto das aulas, gerados automaticamente.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "SyntIA" },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-180.png",
  },
};

export const viewport = {
  themeColor: "#1e1b4b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>
        <SWRegister />
        {children}
      </body>
    </html>
  );
}
