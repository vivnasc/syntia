# GPT-0009 · Falha verificada e correção delimitada

13 outubro 2026. Diagnóstico por leitura do workflow no main e dos logs da execução 38427581201, job 115400910532.

## Resultado verificado

A ponte existe. Às 16:05 UTC recebeu o comentário, passou a verificação da presença da chave e fez checkout. Falhou na autenticação GitHub antes do trabalho do agente, com `Unable to get ACTIONS_ID_TOKEN_REQUEST_URL env variable` e pedido explícito de `id-token: write`. Isto substitui a informação anterior de que a ponte não estava instalada. Não confirma validade da chave Anthropic nem disponibilidade do modelo.

Execução: https://github.com/vivnasc/syntia/actions/runs/38427581201

## Correção proposta, ainda não aplicada

Ficheiro: `.github/workflows/ponte-claude.yml`, main.

Acrescentar uma linha ao bloco existente:

```yaml
permissions:
  id-token: write
  contents: write
  pull-requests: write
  issues: write
```

Conservar os filtros OWNER/COLLABORATOR, exclusão de bots e mensagens de retorno, limites de 15 turnos e 20 minutos. Não modificar segredos nem publicar os seus valores. A permissão permite pedir um token OIDC para autenticação da ação; o agente existente tem acesso de escrita e pode consumir a API paga configurada.

A tentativa de aplicar esta alteração foi recusada pela revisão automática de segurança: exige autorização específica para a alteração de permissão neste workflow público com escrita e execução paga. Não foi aplicada nem contornada. A autorização geral para a ponte não foi aceite por essa revisão como suficiente.

## Automação ChatGPT

Existe e está ativa, mas o prompt proíbe iniciar chamadas API pagas. Após autorização específica, alinhar apenas a exceção necessária: pedidos de trabalho concretos neste PR podem ativar a ponte Claude existente, dentro dos limites configurados. Preservar as restantes restrições. Não iniciar consumo nem alterar esse limite enquanto a decisão estiver pendente.

O gatilho disponível do ChatGPT refere comentários humanos; respostas de um agente GitHub podem ser publicadas por bot. Não presumir que a volta Claude → ChatGPT funciona: verificar com uma resposta real antes de declarar coordenação de ponta a ponta. Não falsificar autoria nem retirar filtros para contornar essa limitação.

## Trabalho concluído sem depender da ponte

Commit `758816b53101059421b3f3eb57b2e0ff389b67f9`: corrigidas no documento de metodologia as quatro contradições documentais restantes de GPT-0007/GPT-0008: grupos de cursos não são bases confirmadas; contagem não demonstra lacuna; genograma separado da aplicação transgeracional contestada; sobreposição dos conjuntos não medida. Sem alteração do motor, catálogo, scripts ou merge.

## Próxima entrega após desbloqueio

Testar uma execução com pedido único e concreto do percurso GPT-0008, verificar logs e resposta, e produzir pacote de consulta com aplicações originais e fontes integrais. A ligação automática não é o objetivo final: o sistema editorial utilizável permanece pendente. Não repetir rondas de revisão das correções documentais já aplicadas acima.
