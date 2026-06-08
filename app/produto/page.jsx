import Link from "next/link";
import Topbar from "../Topbar";
import BancoProduto from "./BancoProduto";
import { getBanco, getTemas } from "../../lib/conteudo";

export default function ProdutoPage() {
  const banco = getBanco();
  const temas = getTemas();

  return (
    <div className="wrap">
      <Topbar active="produto" />
      <div className="crumbs">
        <Link href="/">Áreas</Link> / Banco de Produto
      </div>
      <h1>Banco de Produto</h1>
      <p className="lead">
        Tudo o que as aulas geram para o teu ecossistema, reunido e filtrável
        pelos quatro temas. Cada ideia diz de que aula veio.
      </p>

      <BancoProduto banco={banco} temas={temas} />

      <div className="footer">corpo · amor · maternidade · prosperidade</div>
    </div>
  );
}
