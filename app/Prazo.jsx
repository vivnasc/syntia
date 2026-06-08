"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const MS_DIA = 86400000;
const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function fmtData(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${meses[m - 1]}`;
}

function meiaNoite(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Estado de um prazo em relação a hoje.
export function estadoPrazo(inicio, fim, hoje = new Date()) {
  if (!inicio || !fim) return null;
  const h = meiaNoite(hoje);
  const i = meiaNoite(new Date(inicio + "T00:00:00"));
  const f = meiaNoite(new Date(fim + "T00:00:00"));
  if (h < i) return { estado: "futura", dias: Math.round((i - h) / MS_DIA) };
  if (h > f) return { estado: "encerrada", dias: Math.round((h - f) / MS_DIA) };
  return { estado: "aberta", dias: Math.round((f - h) / MS_DIA) };
}

function textoEstado(s) {
  if (s.estado === "futura") return s.dias === 0 ? "abre hoje" : `abre em ${s.dias} dia${s.dias === 1 ? "" : "s"}`;
  if (s.estado === "encerrada") return "encerrada";
  if (s.dias === 0) return "encerra hoje";
  return `encerra em ${s.dias} dia${s.dias === 1 ? "" : "s"}`;
}

// Badge de prazo. As datas (fixas) aparecem já no servidor; o "faltam X dias"
// é calculado no cliente para não congelar na data do build.
export function Prazo({ inicio, fim, soEstado = false }) {
  const [s, setS] = useState(null);
  useEffect(() => { setS(estadoPrazo(inicio, fim)); }, [inicio, fim]);
  if (!inicio || !fim) return null;

  const urgente = s && s.estado === "aberta" && s.dias <= 14;
  const cls = s ? `prazo ${s.estado}${urgente ? " urgente" : ""}` : "prazo";
  return (
    <span className={cls}>
      <span className="prazo-datas">{fmtData(inicio)} – {fmtData(fim)}</span>
      {s && !soEstado && <span className="prazo-dot">·</span>}
      {s && <span className="prazo-txt">{textoEstado(s)}</span>}
    </span>
  );
}

// Painel de prazos do Início: o que está aberto (por urgência) + o que abre a seguir.
export function PainelPrazos({ itens }) {
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  if (!montado) return <div className="empty">A calcular prazos…</div>;

  const comEstado = itens
    .map((it) => ({ ...it, s: estadoPrazo(it.inicio, it.fim) }))
    .filter((it) => it.s);
  const abertas = comEstado.filter((it) => it.s.estado === "aberta").sort((a, b) => a.s.dias - b.s.dias);
  const proximas = comEstado.filter((it) => it.s.estado === "futura").sort((a, b) => a.s.dias - b.s.dias).slice(0, 3);

  return (
    <div className="prazos">
      {abertas.length === 0 && <div className="empty">Nada aberto neste momento.</div>}
      {abertas.map((it) => {
        const urg = it.s.dias <= 14;
        return (
          <Link key={it.href + it.titulo} href={it.href} className={`prazo-card${urg ? " urgente" : ""}`}>
            <span className="pc-faixa" />
            <span className="pc-corpo">
              <span className="pc-curso">{it.cursoTitulo}</span>
              <span className="pc-tit">{it.titulo}</span>
              <span className="pc-meta">{fmtData(it.inicio)} – {fmtData(it.fim)}</span>
            </span>
            <span className="pc-dias">
              <strong>{it.s.dias}</strong>
              <span>dia{it.s.dias === 1 ? "" : "s"}</span>
            </span>
          </Link>
        );
      })}
      {proximas.length > 0 && (
        <div className="prazos-prox">
          A seguir: {proximas.map((it, i) => (
            <span key={it.href + it.titulo}>
              {i > 0 ? " · " : ""}<Link href={it.href}>{it.titulo.split(" ").slice(0, 4).join(" ")}…</Link> ({fmtData(it.inicio)})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
