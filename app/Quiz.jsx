"use client";
import { useState } from "react";

export default function Quiz({ perguntas }) {
  const [respostas, setRespostas] = useState({}); // i -> opção escolhida
  const [verificado, setVerificado] = useState(false);

  if (!perguntas?.length) return null;

  const escolher = (i, op) => {
    if (verificado) return;
    setRespostas((r) => ({ ...r, [i]: op }));
  };

  const respondidas = Object.keys(respostas).length;
  const acertos = perguntas.reduce((s, q, i) => s + (respostas[i] === q.correta ? 1 : 0), 0);

  function reiniciar() {
    setRespostas({});
    setVerificado(false);
  }

  return (
    <div className="quiz">
      {verificado && (
        <div className={`quiz-nota ${acertos / perguntas.length >= 0.7 ? "bom" : "fraco"}`}>
          Acertaste <strong>{acertos}</strong> de <strong>{perguntas.length}</strong>
          {acertos / perguntas.length >= 0.7 ? " — estás a ir bem!" : " — revê o que falhaste e tenta outra vez."}
        </div>
      )}

      {perguntas.map((q, i) => (
        <div key={i} className="quiz-q">
          <div className="quiz-p">{i + 1}. {q.p}</div>
          <div className="quiz-ops">
            {q.opcoes.map((op, o) => {
              const escolhida = respostas[i] === o;
              let cls = "quiz-op";
              if (escolhida && !verificado) cls += " sel";
              if (verificado) {
                if (o === q.correta) cls += " certa";
                else if (escolhida) cls += " errada";
              }
              return (
                <button key={o} type="button" className={cls} onClick={() => escolher(i, o)} disabled={verificado}>
                  <span className="quiz-letra">{"ABCD"[o]}</span> {op}
                </button>
              );
            })}
          </div>
          {verificado && q.explica && <div className="quiz-explica">{q.explica}</div>}
        </div>
      ))}

      <div className="quiz-acoes">
        {!verificado ? (
          <button className="btn" onClick={() => setVerificado(true)} disabled={respondidas === 0}>
            Ver resultado ({respondidas}/{perguntas.length})
          </button>
        ) : (
          <button className="btn" onClick={reiniciar}>Tentar de novo</button>
        )}
      </div>
    </div>
  );
}
