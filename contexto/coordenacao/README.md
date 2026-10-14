# Coordenação Syntia ↔ ChatGPT

Autorizada por Vivianne em 13 outubro 2026. Objetivo: retirar-lhe o transporte de pedidos e respostas entre sessões.

## Ponto de encontro
PR #67: https://github.com/vivnasc/syntia/pull/67
Branch observada inicialmente: claude/jolly-dijkstra-Jts5w. Ler sempre a head atual; os hashes históricos não são a versão atual por definição.

## Divisão de trabalho
- Claude/Syntia: organização do conhecimento, exportação, classificadores e mecanismos da app. Não produz conteúdos de Instagram nesta tarefa.
- ChatGPT: fornece os antecedentes editoriais acessíveis, revê os pedidos de organização e desenvolve metodologia/editorial apenas quando solicitado. Não altera código da Syntia neste protocolo.
- Vivianne: decisões reais de posicionamento, estado de ofertas e aprovação. Não é mensageira de dados que ambos consigam ler.

## Mensagens
Claude publica no PR um comentário iniciado por:
[SYNTIA-PONTE][PARA-CHATGPT][ID: CL-0001]
Inclui pedido, ficheiros/commit, estado e resultado esperado.

ChatGPT responde:
[SYNTIA-PONTE][PARA-CLAUDE][ID: GPT-0001][EM-RESPOSTA-A: CL-0001]
Inclui o que verificou, resposta, ficheiros entregues e pendências reais.

Cada entrega tem ID único. Antes de responder, consultar comentários existentes e não processar o mesmo ID ou commit duas vezes. Cada lado conserva os próprios ficheiros; não reescrever ficheiros do outro sem pedido explícito. Não interpretar aprovação de coordenação como autorização para merges, publicação, geração paga, alteração de preços ou aquisição de serviços.

## Ativação
ChatGPT: automação por eventos do PR #67, quando criação confirmada pelo serviço. Comentários, commits e revisões dão sinal; o prompt filtra os pedidos relevantes e ignora respostas próprias, bots e ruído. O estado efetivo é declarado na conversa e no PR; não presumir que a execução ocorreu só porque a configuração foi criada.
Claude: arranque automático ainda não confirmado. O repositório não inicia por si uma sessão do Claude. Claude deve responder se dispõe de um mecanismo já configurado e autorizado para consumir estes sinais. Se não, devolver opções e requisitos, sem criar despesas, extrair credenciais ou afirmar integração ativa. Até lá, consultar este ponto ao retomar.
Não configurar uma segunda ativação concorrente do ChatGPT enquanto a primeira existir. Não inventar endpoint de sessões nem tratar comentários como execução concluída.

## Privacidade e conteúdo dos sinais
Este repositório é público. Não transportar dados pessoais, familiares, clínicos, de clientes, credenciais ou exportações de clientes. O índice partilhado contém só títulos e estados editoriais históricos; não prova publicação atual. As fontes de cliente ficam fora desta ponte.

## Continuidade
Este canal começa no PR #67. Antes de encerrar o PR, decidir a migração para um próximo PR ou outro canal com evento suportado. Não assumir que um gatilho limitado ao #67 vigia todo o projeto.
