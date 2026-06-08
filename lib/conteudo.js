import dados from "./conteudo.json";

export function getConteudo() {
  return dados;
}
export function getAreas() {
  return dados.areas;
}
export function getCursos() {
  return dados.areas.filter((a) => a.tipo === "curso");
}
export function getPartilhada() {
  return dados.areas.find((a) => a.tipo === "partilhada") || null;
}
export function getArea(id) {
  return dados.areas.find((a) => a.id === id) || null;
}
export function getAula(areaId, nome) {
  const area = getArea(areaId);
  if (!area) return null;
  const aula = area.aulas.find((x) => x.nome === nome);
  return aula ? { area, aula } : null;
}
export function getBanco() {
  return dados.banco;
}
export function getTemas() {
  return dados.temas;
}
