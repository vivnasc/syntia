import Link from "next/link";
import BancoProduto from "./BancoProduto";
import { getBanco } from "../../lib/conteudo";

export default function ProdutoPage() {
  // Sem o campo `texto`: os rascunhos são buscados a /banco-textos.json quando
  // alguém abre um cartão. O índice `i` é o que os liga a esse ficheiro.
  const banco = getBanco().map((b, i) => ({ ...b, texto: undefined, i }));

  return (
    <>
      <div className="crumbs">
        <Link href="/">Início</Link> / Banco de Produto
      </div>
      <h1>Banco de Produto</h1>
      <p className="lead">
        O que aprendes, pronto a <strong>implementar</strong>. Filtra pelo teu
        produto (Infonte, FreeMe, SyncHim, Livros), lê a ideia numa linha e abre
        o rascunho só se quiseres. Cada cartão diz de que aula veio.
      </p>

      <BancoProduto banco={banco} />
    </>
  );
}
