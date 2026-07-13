import dados from "./conteudo.json";

export function getConteudo() { return dados; }
export function getCursos() { return dados.cursos || []; }
export function getPartilhada() { return dados.partilhada || null; }
export function getTemas() { return dados.temas || []; }
export function getBanco() { return dados.banco || []; }
export function getInspiracao() { return dados.inspiracao || []; }

export function getInspiracaoItem(nome) {
  return getInspiracao().find((i) => i.nome === nome) || null;
}

export function getCurso(id) {
  return getCursos().find((c) => c.id === id) || null;
}

export function getCadeira(cursoId, cadeiraId) {
  const curso = getCurso(cursoId);
  if (!curso) return null;
  const cadeira = curso.cadeiras.find((k) => k.id === cadeiraId);
  return cadeira ? { curso, cadeira } : null;
}

export function getAulaCurso(cursoId, cadeiraId, nome) {
  const found = getCadeira(cursoId, cadeiraId);
  if (!found) return null;
  const aula = found.cadeira.aulas.find((a) => a.nome === nome);
  return aula ? { ...found, aula } : null;
}

export function getAulaPartilhada(nome) {
  const partilhada = getPartilhada();
  if (!partilhada) return null;
  const aula = partilhada.aulas.find((a) => a.nome === nome);
  return aula ? { partilhada, aula } : null;
}

// Lista achatada de todas as cadeiras (cursos + partilhada) — útil para resumos.
export function getTodasCadeiras() {
  const out = [];
  for (const c of getCursos()) {
    for (const k of c.cadeiras) out.push({ curso: c, cadeira: k });
  }
  const p = getPartilhada();
  if (p) out.push({ curso: null, cadeira: p });
  return out;
}
