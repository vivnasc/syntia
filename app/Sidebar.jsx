"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const norm = (p) => (p || "/").replace(/\/+$/, "") || "/";

export default function Sidebar({ areas }) {
  const here = norm(usePathname());
  const [open, setOpen] = useState(false);

  const areaActive = (id) => here === `/area/${id}` || here.startsWith(`/area/${id}/`);
  const isHere = (href) => here === href || here.startsWith(href + "/");

  const fechar = () => setOpen(false);

  return (
    <>
      <div className="mobile-bar">
        <button className="burger" aria-label="Abrir menu" onClick={() => setOpen(true)}>☰</button>
        <Link href="/" className="mb-brand" onClick={fechar}><span className="star">✦</span> SyntIA</Link>
      </div>

      <div className={`scrim${open ? " show" : ""}`} onClick={fechar} />

      <aside className={`sidebar${open ? " open" : ""}`} onClick={fechar}>
        <Link href="/" className="sb-brand"><span className="star">✦</span> SyntIA</Link>

        <div className="sb-group-label">Áreas de estudo</div>
        {areas.map((a) => (
          <Link
            key={a.id}
            href={`/area/${a.id}`}
            className={`sb-link${areaActive(a.id) ? " active" : ""}`}
          >
            {a.titulo}
          </Link>
        ))}

        <div className="sb-group-label">Ferramentas</div>
        <Link href="/produto" className={`sb-link${isHere("/produto") ? " active" : ""}`}>
          Banco de Produto
        </Link>
        <Link href="/enviar" className={`sb-link${isHere("/enviar") ? " active" : ""}`}>
          Enviar aula
        </Link>
      </aside>
    </>
  );
}
