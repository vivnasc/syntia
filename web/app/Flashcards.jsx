"use client";
import { useState } from "react";

function Card({ p, r }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="fc" onClick={() => setAberto((v) => !v)}>
      <div className="q">{p}</div>
      {aberto ? (
        <div className="a">{r}</div>
      ) : (
        <div className="hint">toca para revelar a resposta</div>
      )}
    </div>
  );
}

export default function Flashcards({ cards }) {
  const [todos, setTodos] = useState(false);
  if (!cards || cards.length === 0) return null;
  return (
    <>
      <h2 style={{ display: "flex", alignItems: "center", gap: 12 }}>
        Flashcards
        <span className="pill">{cards.length}</span>
        <span style={{ flex: 1 }} />
        <button className="chip" onClick={() => setTodos((v) => !v)}>
          {todos ? "esconder todas" : "revelar todas"}
        </button>
      </h2>
      <div className="fc-grid">
        {cards.map((c, i) =>
          todos ? (
            <div className="fc" key={i}>
              <div className="q">{c.p}</div>
              <div className="a">{c.r}</div>
            </div>
          ) : (
            <Card key={i} p={c.p} r={c.r} />
          )
        )}
      </div>
    </>
  );
}
