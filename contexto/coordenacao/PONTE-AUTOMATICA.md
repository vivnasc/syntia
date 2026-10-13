# Ponte automática: acordar o Claude por comentário

Workflow: `.github/workflows/ponte-claude.yml`. Autorizada pela Vivianne em 13 out 2026.

> **Estado em 13 out 2026.** O ficheiro da workflow está escrito e validado, com
> o modelo e o travão de segurança que a Vivianne aprovou, mas **ainda não está
> no repositório**: o classificador da sessão que o redigiu recusa gravar uma
> automação permanente que a volta a invocar («Unauthorized Persistence»), e
> antes disso recusou a versão sem travão de quem dispara («Create RCE
> Surface»). Fica à espera de commit pela Vivianne.
>
> Mesmo depois desse commit, **nada corre enquanto o secret
> `ANTHROPIC_API_KEY_PONTE` não existir**.

## Falta uma coisa para ligar

Só a Vivianne pode fazer, e sem isto **nada corre e nada se gasta**:

    Settings → Secrets and variables → Actions → New repository secret
    Nome:  ANTHROPIC_API_KEY_PONTE
    Valor: uma chave da Anthropic nova, criada só para esta ponte

É um secret **diferente** do `ANTHROPIC_API_KEY` que processa as aulas, de
propósito: esta ponte pode ser revogada, limitada ou gastar o seu orçamento sem
parar o processamento das aulas.

## Como desligar

Apagar o secret, ou Actions → "Ponte · acordar o Claude" → Disable workflow.
Qualquer das duas para o gasto de imediato.

## O travão de segurança, que é o que mais importa

**Este repositório é público**, portanto qualquer pessoa com conta no GitHub
pode comentar num pull request. Sem travão, bastava escreverem `[PARA-CLAUDE]`
para arrancarem um agente com acesso de escrita ao código e a gastar da chave
da Vivianne. Isso é uma superfície de execução remota de código.

Por isso a workflow só arranca se quem comentou for **`OWNER` ou
`COLLABORATOR`** do repositório. Um comentário de um estranho não arranca nada,
não gasta nada, e não chega perto do código.

## Os outros quatro travões

1. **Uma execução de cada vez** por PR, e a anterior é cancelada. Comentários
   seguidos não acumulam execuções em paralelo.
2. **Etiqueta certa.** Tem de ter `[PARA-CLAUDE]`, **não** pode ter
   `[PARA-CHATGPT]`, não pode vir de um bot, e tem de ser num pull request.
3. **Tecto de tempo**: 20 minutos. Se encravar, morre.
4. **Tecto de turnos**: 15.

## O modelo

`claude-sonnet-5-5`, escolhido pela Vivianne em 13 out 2026. Está numa linha só
(`claude_args`), fácil de trocar.

## Por que não há ciclos infinitos

A proteção é a **assimetria das etiquetas**:

| quem escreve | etiqueta que usa | dispara a workflow? |
|---|---|---|
| ChatGPT, a pedir ao Claude | `[PARA-CLAUDE]` | **sim** |
| Claude, a responder | `[PARA-CHATGPT]` | não |

A resposta do Claude nunca contém a etiqueta que o acorda. A instrução no
`prompt` da workflow repete isso como primeira regra, e a condição de arranque
exclui explicitamente qualquer comentário com `[PARA-CHATGPT]`.

Verificado contra os comentários reais do PR #67: os dois do ChatGPT disparam,
os dois do Claude não, o bot da Vercel não, e um comentário normal não.

## O que o Claude acordado pode e não pode

O `prompt` da workflow fixa seis regras. As que importam:

- Responde sempre com `[PARA-CHATGPT]`, nunca com `[PARA-CLAUDE]`.
- Verifica antes de afirmar, e diz quando não conseguiu verificar.
- Não decide o estado dos produtos por inferência.
- Não faz merge, não publica, não altera nada comercial.
- **Não cria nem altera workflows, secrets ou automações.** Esta ponte não se
  pode alargar a si própria.
- Alterações a código do motor só com pedido explícito da Vivianne.

## O que isto custa

Cada comentário com `[PARA-CLAUDE]` paga uma execução. O custo depende do
tamanho do que for lido e escrito. Os travões limitam o pior caso por execução,
não o número de execuções: isso depende de quantos comentários forem escritos.

Quem quiser um tecto duro de dinheiro define-o do lado da Anthropic, na chave.
