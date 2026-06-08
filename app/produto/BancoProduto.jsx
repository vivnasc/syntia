"use client";
import { useMemo, useState } from "react";

const ROTULO = {
  corpo: "corpo",
  amor: "amor",
  maternidade: "maternidade",
  prosperidade: "prosperidade",
};

export default function BancoProduto({ banco, temas }) {
  const [ativo, setAtivo] = useState("todos");

  const itens = useMemo(() => {
    if (ativo === "todos") return banco;
    return banco.filter((it) => it.temas.includes(ativo));
  }, [ativo, banco]);

  const contagem = useMemo(() => {
    const c = { todos: banco.length };
    for (const t of temas) c[t] = banco.filter((it) => it.temas.includes(t)).length;
    return c;
  }, [banco, temas]);

  return (
    <>
      <div className="filtros">
        <span className="chip" data-tema="todos" data-on={ativo === "todos"} onClick={() => setAtivo("todos")}>
          todos · {contagem.todos}
        </span>
        {temas.map((t) => (
          <span
            key={t}
            className="chip"
            data-tema={t}
            data-on={ativo === t}
            onClick={() => setAtivo(t)}
          >
            {ROTULO[t]} · {contagem[t]}
          </span>
        ))}
      </div>

      {itens.length === 0 ? (
        <div className="empty">
          Ainda sem ideias{ativo !== "todos" ? ` para "${ROTULO[ativo]}"` : ""}. Aparecem aqui
          assim que processares aulas que toquem o tema.
        </div>
      ) : (
        <div className="prod">
          {itens.map((it, i) => (
            <div className="prod-item" key={i}>
              <div className="tags">
                {it.temas.map((t) => (
                  <span className="tag" data-tema={t} key={t}>{ROTULO[t]}</span>
                ))}
              </div>
              <div className="txt">{it.texto}</div>
              <div className="src">{it.areaTitulo} · {it.aula}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
