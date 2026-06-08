import Link from "next/link";

export default function Topbar({ active }) {
  return (
    <div className="topbar">
      <Link href="/" className="brand">✦ SyntIA</Link>
      <span className="spacer" />
      <Link href="/" className={`nav ${active === "areas" ? "active" : ""}`}>Áreas</Link>
      <Link href="/produto/" className={`nav ${active === "produto" ? "active" : ""}`}>Banco de Produto</Link>
    </div>
  );
}
