# VENDA100K

Espaço próprio, fora de `cursos/` (que é a pós-graduação). Aqui vive o
conhecimento de venda: low ticket, produto, página, quiz, automação e tráfego.

Está no mesmo patamar da `disciplina-partilhada` e da `rota100k`: é uma raiz que
a ponte lê, por isso tudo o que entra aqui chega ao `viviannepag`.

Ao contrário da ROTA100K, que é uma lista única de aulas, a VENDA100K **tem
módulos**. Os módulos do curso vão para as unidades, com os nomes em
`modulos.json`. A numeração começa no Módulo 0 do curso, que aqui é a Unidade 1,
porque a unidade 0 está reservada para aulas sem módulo.

| ficheiro | unidade | módulo do curso |
|---|---|---|
| `U1_*` | 1 | Módulo 0 · O Jogo do Low Ticket |
| `U2_*` | 2 | Módulo 1 · O Que Vender |
| `U3_*` | 3 | Módulo 2 · Criando o Produto com IA |
| `U4_*` | 4 | Módulo 3 · Como vender o teu infoproduto |
| `U5_*` | 5 | Módulo 4 · Audiência Quente + Automação |
| `U6_*` | 6 | Módulo 5 · Tráfego Pago |
| `U7_*` | 7 | Módulo 6 · Ofertas de Low Ticket na prática |

Estrutura (criada pelo processamento, não à mão):

    venda100k/
      modulos.json    nomes dos módulos (à mão, este sim)
      transcricoes/   texto bruto das aulas
      sinteses/       Bloco A + B
      produto/        Bloco C — o que alimenta os produtos
      resumos/
      objetivos/
      _material/      PDFs de apoio
