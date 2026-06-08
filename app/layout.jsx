import "./globals.css";
import SWRegister from "./SWRegister";

export const metadata = {
  title: "SyntIA — Estudo das pós-graduações",
  description: "Sínteses, flashcards e banco de produto das aulas, gerados automaticamente.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "SyntIA" },
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/icon-180.png",
  },
};

export const viewport = {
  themeColor: "#faf7f1",
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
