import Link from "next/link";
import { getCursos, getPartilhada, getBanco, getTemas } from "../lib/conteudo";
import { PainelPrazos } from "./Prazo";

const COR_TEMA = {
  corpo: "var(--corpo)",
  amor: "var(--amor)",
  maternidade: "var(--maternidade)",
  prosperidade: "var(--prosperidade)",
};

export default function Home() {
  const cursos = getCursos();
  const partilhada = getPartilhada();
  const banco = getBanco();
  const temas = getTemas();
  const partTemAulas = !!(partilhada && partilhada.aulas.length);

  const aulasDe = (c) => c.cadeiras.reduce((n, k) => n + k.aulas.length, 0);
  const flashDe = (c) => c.cadeiras.reduce((n, k) => n + k.aulas.reduce((m, a) => m + a.flashcards.length, 0), 0);
  const comecadasDe = (c) => c.cadeiras.filter((k) => (k.partilhada ? partTemAulas : k.aulas.length > 0)).length;

  const totalAulas = cursos.reduce((s, c) => s + aulasDe(c), 0) + (partilhada?.aulas.length || 0);
  const totalFlash = cursos.reduce((s, c) => s + flashDe(c), 0) + (partilhada?.aulas.reduce((m, a) => m + a.flashcards.length, 0) || 0);
  const totalDisc = cursos.reduce((s, c) => s + c.cadeiras.length, 0);
  const comecadas = cursos.reduce((s, c) => s + comecadasDe(c), 0);

  const temaCount = Object.fromEntries(temas.map((t) => [t, banco.filter((it) => it.temas.includes(t)).length]));

  // Prazos de todas as disciplinas (partilhada uma só vez).
  const prazoItens = [];
  const vistos = new Set();
  for (const c of cursos) {
    for (const k of c.cadeiras) {
      if (!k.inicio || !k.fim) continue;
      const href = k.partilhada ? "/partilhada" : `/curso/${c.id}/${k.id}`;
      const chave = `${href}|${k.titulo}`;
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      prazoItens.push({ cursoTitulo: k.partilhada ? "Comum às 3 pós" : c.titulo, titulo: k.titulo, inicio: k.inicio, fim: k.fim, href });
    }
  }

  return (
    <>
      <h1>O teu painel</h1>
      <p className="lead">
        O programa de cada pós tem <strong>9 disciplinas</strong> — estão todas aqui desde já.
        À medida que envias aulas, cada disciplina preenche-se e o progresso sobe.
      </p>

      <div className="stats">
        <div className="stat"><div className="n">{comecadas}<span className="den">/{totalDisc}</span></div><div className="l">disciplinas começadas</div></div>
        <div className="stat"><div className="n">{totalAulas}</div><div className="l">aulas processadas</div></div>
        <div className="stat"><div className="n">{totalFlash}</div><div className="l">flashcards</div></div>
        <div className="stat"><div className="n">{banco.length}</div><div className="l">ideias de produto</div></div>
      </div>

      <div className="section-label" style={{ marginTop: 34 }}>Prazos · o que está aberto</div>
      <PainelPrazos itens={prazoItens} />

      <div className="section-label" style={{ marginTop: 34 }}>Progresso por curso</div>
      <div className="prog">
        {cursos.map((c) => {
          const tot = c.cadeiras.length;
          const fei = comecadasDe(c);
          const pct = tot ? Math.round((fei / tot) * 100) : 0;
          return (
            <Link key={c.id} href={`/curso/${c.id}`} className="prog-row">
              <div className="prog-head">
                <span className="t">{c.titulo}</span>
                <span className="c">{fei} de {tot} disciplinas</span>
              </div>
              <div className="bar"><span style={{ width: `${pct}%` }} /></div>
            </Link>
          );
        })}
        {partilhada && (
          <Link href="/partilhada" className="prog-row">
            <div className="prog-head">
              <span className="t">{partilhada.titulo}</span>
              <span className="c">{partTemAulas ? `${partilhada.aulas.length} aula(s) · comum aos 3` : "por começar · comum aos 3"}</span>
            </div>
            <div className="bar"><span style={{ width: partTemAulas ? "100%" : "0%" }} /></div>
          </Link>
        )}
      </div>

      <div className="section-label" style={{ marginTop: 34 }}>Cobertura por tema · Banco de Produto</div>
      <div className="temas-cov">
        {temas.map((t) => (
          <Link key={t} href="/produto" className="tcov">
            <span className="dot" style={{ background: COR_TEMA[t] }} />
            <span className="nm">{t}</span>
            {temaCount[t] > 0 ? <span className="v">{temaCount[t]}</span> : <span className="v zero">a explorar</span>}
          </Link>
        ))}
      </div>

      <div className="footer">PWA instalável · conteúdo gerado a partir do repositório</div>
    </>
  );
}
