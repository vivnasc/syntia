"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const norm = (p) => (p || "/").replace(/\/+$/, "") || "/";

export default function Sidebar({ cursos, partilhada }) {
  const here = norm(usePathname());
  const [open, setOpen] = useState(false);
  const fechar = () => setOpen(false);

  const cursoActive = (id) => here === `/curso/${id}` || here.startsWith(`/curso/${id}/`);
  const cadActive = (cid, kid) => here.startsWith(`/curso/${cid}/${kid}`);
  const is = (href) => here === href || here.startsWith(href + "/");

  // Curso aberto: o que está ativo, ou o primeiro por defeito.
  const ativoId = cursos.find((c) => cursoActive(c.id))?.id || cursos[0]?.id;
  const [aberto, setAberto] = useState(ativoId);

  return (
    <>
      <div className="mobile-bar">
        <button className="burger" aria-label="Abrir menu" onClick={() => setOpen(true)}>☰</button>
        <Link href="/" className="mb-brand" onClick={fechar}><span className="star">✦</span> SyntIA</Link>
      </div>

      <div className={`scrim${open ? " show" : ""}`} onClick={fechar} />

      <aside className={`sidebar${open ? " open" : ""}`}>
        <Link href="/" className="sb-brand" onClick={fechar}><span className="star">✦</span> SyntIA</Link>

        <div className="sb-group-label">Cursos</div>
        {cursos.map((c) => {
          const exp = aberto === c.id;
          return (
            <div key={c.id} className="sb-curso-block">
              <div className={`sb-curso-head${cursoActive(c.id) ? " active" : ""}`}>
                <Link href={`/curso/${c.id}`} className="sb-curso-link" onClick={fechar}>{c.titulo}</Link>
                <button
                  className="sb-toggle"
                  aria-label={exp ? "Recolher" : "Expandir"}
                  onClick={() => setAberto(exp ? null : c.id)}
                >
                  {exp ? "▾" : "▸"}
                </button>
              </div>
              {exp && c.cadeiras.map((k, i) => {
                const href = k.partilhada ? "/partilhada" : `/curso/${c.id}/${k.id}`;
                const active = k.partilhada ? is("/partilhada") : cadActive(c.id, k.id);
                return (
                  <Link
                    key={k.id}
                    href={href}
                    onClick={fechar}
                    className={`sb-link sb-cad${active ? " active" : ""}${k.feita ? "" : " por-dar"}`}
                  >
                    <span className="sb-cad-n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="sb-cad-t">{k.titulo}</span>
                    {k.partilhada && <span className="sb-tag">comum</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}

        <div className="sb-group-label">Ferramentas</div>
        <Link href="/produto" onClick={fechar} className={`sb-link${is("/produto") ? " active" : ""}`}>Banco de Produto</Link>
        <Link href="/enviar" onClick={fechar} className={`sb-link${is("/enviar") ? " active" : ""}`}>Enviar aula</Link>
      </aside>
    </>
  );
}
