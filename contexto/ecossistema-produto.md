# Levantamento · Produtos à venda + Conteúdos das 3 contas principais

> **Para quê:** este é o retrato ATUAL (jul 2026) do que está à venda e do que cada
> conta publica, para alimentar o motor que propõe conteúdos novos a partir das
> aulas. O motor andava a referenciar produtos já abolidos e a ignorar os que
> foram criados. Este é o contexto do Bloco C — a fonte de verdade dos produtos.
>
> **Fonte:** extraído do código do repo dos produtos (não de memória). Onde há
> divergência entre ficheiros, vale o mais recente.

---

## PARTE 1 — PRODUTOS À VENDA (o catálogo atual do site)

Site: **viviannedossantos.com**. Fonte de verdade: `app/api/admin/seed-produtos/route.ts`
(só entra aqui o que tem `publicado: true`).

### 1.1 · Livros / pilares (avulsos)

| Produto | Preço | Nota |
|---|---|---|
| **Os 7 Sinais de Desencaixe** | €14 (era €19) | Livro ~50 mil palavras. O equilíbrio entre pertença e autenticidade. Livro-âncora da porta «O Limiar». |
| **As Sete Faces do Medo** | $17 | Como o medo construiu escolhas, relações e vidas. Livro-âncora da porta «O Medo». |
| **A Grande Transição** | $27 | Introdução às Ciências da Consciência Emergente. Livro-âncora da porta «A Transição». |

### 1.2 · Ebooks fundadores — €7 cada

| Slug | Título |
|---|---|
| ebook-01-culpa | A culpa não é boa conselheira |
| ebook-02-herdaste | O que herdaste sem saber |
| ebook-03-quemes | Quem és para além do que fazes |
| ebook-04-sentido | O sentido que procuras |
| ebook-05-escuro | Atravessar o escuro |
| ebook-06-no-casal | O nó invisível do casal |
| ebook-07-sonho | Nem todo o sonho que carregas nasceu em ti |
| ebook-08-voz | De quem é esta voz? |

### 1.3 · Guias práticos — €5 cada

| Slug | Título |
|---|---|
| guia-01-meu | O que é meu, o que não é meu |
| guia-02-frases | 7 frases para dizer não sem culpa |
| guia-03-presenca | Práticas de presença para o dia a dia |
| guia-04-mente | Esvaziar a mente em 3 passos |
| guia-05-luto | Ritual para o luto que ninguém vê |
| guia-06-perguntas | As 5 perguntas antes de uma discussão |
| guia-07-teu | O que é mesmo teu |
| guia-08-culpa | A culpa que não tem origem |
| guia-09-meta | De quem é esta meta? |
| guia-10-receber | Aprender a receber |
| guia-11-intensidade | Amor ou intensidade? |
| guia-12-lugar | O teu lugar à mesa |
| guia-13-guarda | Baixar a guarda em segurança |
| guia-14-parar | Quem és quando paras |

### 1.4 · As 7 Coleções (universos) e os ebooks profundos — €7 cada

As 7 coleções são a espinha do catálogo. Todas **ativas** (`estado: 'producao'`). A
mesma pergunta em sete roupas: «o que estou a carregar/perseguir que não é meu?».
Cada uma tem os seus ebooks profundos (~€7). **50 ebooks profundos no total.**

> ⚠️ **FreeMe · Infonte · SyncHim são COLEÇÕES DE PRODUTO (vivas), não contas de
> Instagram.** As contas de IG com esses nomes foram abolidas (ver Parte 2). O motor
> deve tratá-las como *universos de produto* para onde uma peça encaminha, nunca como
> perfis onde se publica.

**I · FreeMe Mãe** — as feridas da maternidade (culpa, herança invisível, limites, dizer basta):
`mae-01 Amar sem carregar` · `mae-02 A mãe que ficou` · `mae-03 A mãe que salva` ·
`mae-04 Amar e dizer basta` · `mae-05 A mãe que quis unir` · `mae-06 A mãe que cumpriu` ·
`mae-07 A mãe solo` · `mae-08 A mãe que não sentiu` · `mae-09 A mãe que criou à distância` ·
`mae-10 A mãe arrependida` · `mae-11 A mãe que teme pesar`

**II · Infonte** — identidade e propósito (quem és para além do que fazes):
`inf-01 A mulher que nunca chega` · `inf-02 A mulher que persegue a próxima montanha` ·
`inf-03 A mulher que chegou e sentiu pouco` · `inf-04 A mulher que herdou uma vida` ·
`inf-05 A mulher que tem medo do próprio tamanho` · `inf-06 A mulher que não se autoriza a ganhar mais`

**III · Prosperidade** — a relação com o valor (receber, merecer, cobrar):
`pros-01 A mulher que paga para pertencer` · `pros-02 A mulher que tem medo de dever` ·
`pros-03 A mulher que transforma valor em trabalho` · `pros-04 A mulher que herdou a escassez` ·
`pros-05 A mulher que tem medo de receber` · `pros-06 A mulher que não consegue cobrar` ·
`pros-07 A mulher que não pode ter mais do que os outros`

**IV · SyncHim** — a vinculação amorosa (perder-se quando se ama):
`syn-01 A mulher que ama a ausência` · `syn-02 A mulher que se torna indispensável` ·
`syn-03 A mulher que desaparece no amor` · `syn-04 A mulher que espera ser escolhida` ·
`syn-05 A mulher que ama o potencial` · `syn-06 A mulher que nunca baixa a guarda` ·
`syn-07 A mulher que confunde intensidade com amor`

**V · Pertença** — família, lugar, ser escolhida:
`per-01 A pessoa que carrega a família` · `per-02 A pessoa que faz a ponte` ·
`per-03 A escolhida que carrega o que a família lhe entregou` · `per-04 A pessoa que ficou responsável cedo demais` ·
`per-05 A pessoa que não pertence em lado nenhum` · `per-06 A pessoa que nunca dá trabalho` ·
`per-07 A pessoa que mantém toda a gente ligada`

**VI · Força** — sobrevivência, o escuro, o luto invisível:
`for-01 A mulher que não pode falhar` · `for-02 A mulher que nunca pede` ·
`for-03 A mulher que não incomoda` · `for-04 A mulher que se tornou forte demais` ·
`for-05 A mulher que vive em modo sobrevivência` · `for-06 A mulher que não sabe receber ajuda`

**VII · Trabalho e Vocação** — o valor pela produção:
`tra-01 A mulher que se tornou indispensável` · `tra-02 A mulher que não ocupa a cadeira` ·
`tra-03 A mulher que carrega a empresa` · `tra-04 A mulher que tem medo de ser vista` ·
`tra-05 A mulher que confunde exaustão com mérito` · `tra-06 A mulher que trabalha para merecer`

### 1.5 · Packs (bundles)

Um pack por coleção (inclui automaticamente todos os produtos publicados desse
universo) + um pack «tudo» (catálogo inteiro). Ex.: `pack-freeme-mae` €40 (era €106),
`pack-infonte` €35 (era €90). Fonte: `lib/packs.ts`.

---

## PARTE 2 — O QUE FOI ABOLIDO / NÃO ESTÁ À VENDA

Isto é o que o motor tem de PARAR de referenciar como produto vivo.

### 2.1 · Método VS (Ver e Soltar) — ABOLIDO

O motor comercial «Método VS / os 7 véus / as 3 portas ver·vir·viver» foi **abolido**.
Os produtos que sobraram dele existem no seed mas com **`publicado: false`** (não estão à venda):

- **Os Sete Véus** (€19) — livro-pilar do método. `publicado: false`.
- **ver.soltar** · **vir.soltar** · **viver.soltar** (€9 cada) — os 3 manuais-filhos. `publicado: false`.

> Se o motor propõe algo «para a escada do Método VS» ou «encaixa nos 7 véus / ver·vir·viver»,
> está desatualizado. Esse encaixe já não existe. O que existe é a escada das 7 Coleções
> (Parte 1.4) e as 3 portas/livros (Parte 1.1).

### 2.2 · Contas de Instagram abolidas

Removidas a pedido da Vivianne — **já não existem**: `synchim`, `freeme`, `infonte`,
`loranne`, `ancient`, `escola`.

As antigas contas do método (ver/vir/viver.soltar) foram **renomeadas** e passaram a ser
as irmãs PT das 3 portas (mantiveram o token, só mudou o handle):
ver.soltar → **@assetefacesdomedo** · vir.soltar → **@portadolimiar** · viver.soltar → **@agrandetransicao**.

> ⚠️ **FreeMe / Infonte / SyncHim desapareceram como CONTAS, mas continuam vivos como
> COLEÇÕES de produto.** Uma proposta pode dizer «porta de entrada para a coleção
> Infonte»; não pode dizer «publica no perfil Infonte».

---

## PARTE 3 — CONTAS DE INSTAGRAM (mapa) + as 3 principais

### 3.0 · Mapa de todas as contas ativas

- **@vivianne.dos.santos** (conta-mãe, PT) + **@viviannewrites** (a mãe em inglês) — é aqui que a **mae.cine** publica.
- **@veu.a.veu** — a conta didática.
- **@soulab.studio** (PT) + **@soulab_en** (EN) — o laboratório.
- As 3 portas/livros, cada uma bilingue (EN principal + PT irmã):
  - O Medo: **@thesevenfacesoffear** / **@assetefacesdomedo**
  - O Limiar: **@theopenthreshold** / **@portadolimiar**
  - A Transição: **@thegreat_transition** / **@agrandetransicao**

As **3 contas principais** para propostas de conteúdo: **mae.cine**, **soulab**, **veu.a.veu**.

### 3.1 · veu.a.veu — DIDÁTICA (ensina, não vende)

Ensina sem vender: sem CTA de venda, sem produtos, sem links. Otimiza para crescer
(SEGUIR · GUARDAR · PARTILHAR). Público: mulheres adultas cuidadoras em burnout. Âmbito
fixo: as 4 matérias das pós-graduações, numa jornada de 13 semanas (Pertencer → Máscara/Sombra
→ Heranças → Sentido). Voz/visual: GOUACHE sempre, nunca foto; elenco fixo de 5 personagens
(Nina, Teresa, Avó Alice, Rui, Tó). A pergunta é «como é que isto te salvou / do que te
protege», nunca «o que há de errado em ti». Autores/jargão só na legenda. Sem travessões.

### 3.2 · soulab — LABORATÓRIO (explora, não vende)

«Laboratório criativo da alma humana». Não ensina, não vende: explora. Cada peça é
observação/símbolo/hipótese. Bilingue (@soulab.studio PT + @soulab_en EN). Território:
transformação interior, heranças, sobrevivência→vida, arquétipos, consciência, sentido,
a sombra, descanso e receber. Base (nunca nomeada): os 3 livros dela. Visual próprio:
escuro/lunar (`#1B1726`/`#0E0B16`/`#ECE6F2`/destaque `#C9A2E6`). Regra dura: motor próprio,
zero mistura com mãe/veu.a.veu; não usa os 7 véus nem o baralho de personagens.

### 3.3 · mae.cine — a conta-mãe, estratégia @telma.abrahao

Publica na conta-mãe @vivianne.dos.santos (PT) e @viviannewrites (EN). Nicho: «os padrões
que te sabotam / que se repetem» — infância, parentalidade, apego, heranças transgeracionais.
**~90% audiência brasileira → português do Brasil, «você».** Autoridade = o SABER das
cadeiras, usado como **prova científica**. Movimento: «Acaba em Mim» / tribo «Quebra-Ciclos»
(`#acabaemmim #quebraciclos`). Voz (craft da Telma): FACA na abertura, «não é X, é Y»,
ciência com consequência, confrontador primeiro e terno depois, fechar no ciclo quebrado.
CTA: SEGUIR/GUARDAR/PARTILHAR, nunca «comenta»/«marca amigos». Visual: foto cinematográfica
quente (âmbar/terracota), nunca escura, nunca gouache.

---

## PARTE 4 — O SABER / a matéria-prima das aulas

O «cérebro» que o motor deve minerar. As 3 pós-graduações + a cadeira comum:

1. **Psicologia Transpessoal** — Jung, arquétipos, sombra, individuação, Self, estados de consciência.
2. **Constelação Familiar Sistémica** — Hellinger, Ordens do Amor, lealdades invisíveis, pertencer, parentificação.
3. **Psicologia e Espiritualidade** — Frankl, sentido, logoterapia, perdão, qualidade de vida.
4. **Desenvolvimento Pessoal e Profissional** — comum aos 3: burnout do cuidador, limites, comunicação, carreira.

> Esta matéria-prima vive NESTE repo (Syntia): as sínteses, os resumos e as ideias de
> produto por aula. É publicada em `saber.json` para o motor a poder cruzar com o catálogo.

---

## PARTE 5 — O que o motor deve CORRIGIR (resumo acionável)

1. **Apagar o Método VS da escada de produtos.** Nada de «7 véus», «ver·vir·viver», «Os
   Sete Véus (€19)» como produto à venda.
2. **Não tratar FreeMe / Infonte / SyncHim como contas.** São **coleções de produto**.
3. **Conhecer as 3 portas/livros à venda:** Os 7 Sinais de Desencaixe (€14), As Sete Faces
   do Medo ($17), A Grande Transição ($27).
4. **Conhecer o catálogo real:** 3 livros-pilar + 8 ebooks fundadores (€7) + 14 guias (€5)
   + 7 coleções com 50 ebooks profundos (€7) + packs.
5. **Encaminhar propostas para as 3 contas certas** e no registo de cada uma: veu.a.veu
   (didática, gouache) · soulab (explora, escuro/lunar) · mae.cine (Telma, PT-BR «você»,
   faca + ciência-como-prova, foto quente, movimento «Acaba em Mim»).
6. **CTA por defeito:** SEGUIR · GUARDAR · PARTILHAR (nunca «comenta»/«marca amigos»).

---

*Documento gerado a partir do estado do repositório dos produtos em jul 2026. Se um produto
ou formato mudar, o ideal é o repo dos produtos publicar `catalogo.json` e este ficheiro ser
gerado a partir dele (ver contrato da ponte).*
