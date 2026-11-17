"use client";
import { useMemo, useRef, useState } from "react";
import Markdown from "../Markdown";

const ORDEM = ["Infonte", "FreeMe", "SyncHim", "Livros", "Oportunidade", "Outro"];

// Quantos cartões se mostram de cada vez. O banco passou dos dois mil itens, e
// desenhar tudo de uma vez matava o separador do browser.
const PAGINA = 60;

// Um cartão. O rascunho não vem com a página: é buscado a /banco-textos.json
// na primeira vez que alguém abre um, e só aí convertido de markdown. Antes
// disto, os dois mil rascunhos vinham todos no HTML e eram todos convertidos
// mesmo fechados, porque o <details> esconde mas não impede que existam.
function Cartao({ it, pedirTexto }) {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState(null);

  async function abrir(e) {
    const open = e.currentTarget.open;
    setAberto(open);
    if (open && texto === null) setTexto(await pedirTexto(it.i));
  }

  return (
    <div className="prod-item" data-prod={it.produto}>
      <div className="prod-top">
        <span className="prod-badge" data-prod={it.produto}>{it.produto}</span>
        {it.temas.map((t) => (
          <span className="tag" data-tema={t} key={t}>{t}</span>
        ))}
      </div>
      <div className="prod-ideia">{it.ideia}</div>
      <details className="prod-det" onToggle={abrir}>
        <summary>ver o rascunho completo</summary>
        {aberto && (texto === null ? <p className="meta">a carregar o rascunho…</p> : <Markdown>{texto}</Markdown>)}
      </details>
      <div className="src">{it.areaTitulo} · {it.aula}</div>
    </div>
  );
}

export default function BancoProduto({ banco }) {
  const [ativo, setAtivo] = useState("todos");
  const [quantos, setQuantos] = useState(PAGINA);

  // Os rascunhos vivem num ficheiro à parte e são buscados uma só vez, na
  // primeira abertura. Guardados em ref para não redesenhar a lista toda.
  const textos = useRef(null);
  const aPedir = useRef(null);
  async function pedirTexto(i) {
    if (!textos.current) {
      if (!aPedir.current) {
        aPedir.current = fetch("/banco-textos.json")
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []);
      }
      textos.current = await aPedir.current;
    }
    return textos.current[i] ?? "(rascunho indisponível)";
  }

  // Produtos presentes, pela ordem definida, com contagem.
  const produtos = useMemo(() => {
    const c = {};
    for (const it of banco) c[it.produto] = (c[it.produto] || 0) + 1;
    return ORDEM.filter((p) => c[p]).map((p) => ({ nome: p, n: c[p] }));
  }, [banco]);

  const itens = useMemo(
    () => (ativo === "todos" ? banco : banco.filter((it) => it.produto === ativo)),
    [ativo, banco]
  );

  function filtrar(p) {
    setAtivo(p);
    setQuantos(PAGINA); // volta ao início ao trocar de filtro
  }

  const visiveis = itens.slice(0, quantos);
  const faltam = itens.length - visiveis.length;

  return (
    <>
      <div className="filtros">
        <span className="chip" data-prod="todos" data-on={ativo === "todos"} onClick={() => filtrar("todos")}>
          todos · {banco.length}
        </span>
        {produtos.map((p) => (
          <span
            key={p.nome}
            className="chip"
            data-prod={p.nome}
            data-on={ativo === p.nome}
            onClick={() => filtrar(p.nome)}
          >
            {p.nome} · {p.n}
          </span>
        ))}
      </div>

      {itens.length === 0 ? (
        <div className="empty">
          Ainda sem ideias{ativo !== "todos" ? ` para ${ativo}` : ""}. Aparecem aqui assim que
          processares aulas que liguem a este produto.
        </div>
      ) : (
        <>
          <div className="prod">
            {visiveis.map((it) => (
              <Cartao it={it} pedirTexto={pedirTexto} key={it.i} />
            ))}
          </div>
          {faltam > 0 && (
            <div className="mais">
              <button className="btn-mais" onClick={() => setQuantos((n) => n + PAGINA)}>
                mostrar mais {Math.min(PAGINA, faltam)} de {faltam} por ver
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
