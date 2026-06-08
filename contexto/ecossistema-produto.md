# Ecossistema de Produto — contexto para o Bloco C

Retrato fiel dos produtos reais da Vivianne, recolhido dos projetos de Claude.
O pipeline usa este ficheiro como **referência** ao gerar o Bloco C (produto) de
cada aula, para que as ideias sejam específicas dos produtos reais e respeitem a
**voz de cada um** (ver o glossário no fim de cada bloco).

Organização: um cabeçalho por projeto/dossiê. Dentro de cada projeto, um bloco
por produto/oferta, seguido do mapa por tema e do glossário de voz.

> Estado da recolha: **4 de 4 dossiês recebidos — recolha completa.**

---

# Projeto 1 — Infonte (família Sete Ecos)

## Infonte
- **Essência (1 frase):** Percurso em sete etapas que leva a mulher da dispersão à acção concreta através da tese "a abundância não responde a quem a persegue, responde a quem se basta".
- **Temas que toca:** prosperidade (central), corpo/mente (clareza, ruído mental), identidade/herança familiar (sonhos que não são teus). Amor e maternidade não aparecem explicitamente neste material.
- **Formato:** Aplicação web (PWA), Next.js + Supabase. Percurso assíncrono com 7 etapas que abrem em sequência (cron diário). Cada etapa tem blocos de texto + ferramenta prática + campo de resposta da leitora guardado na BD.
- **Para quem é:** Mulher adulta que se reconhece como dispersa, cansada de perseguir, com talento a mais e clareza a menos, ideias que não saem do papel. Momento de vida: a meio, "por arrumar", não pronta. Dor principal: ruído mental, fome interior disfarçada de ambição, sonhos herdados confundidos com sonhos próprios.
- **Promessa / transformação:** De **entrada**: dispersa, mente cheia, projectos por acabar, a perseguir em sete direcções. De **saída**: inteira, mente limpa, uma direcção, sonho partido em acções já começadas. A transformação central é trocar fome por chão.
- **Conceitos e linguagem-assinatura:**
  - "bastar-se", "quem se basta atrai", "a abundância não responde a quem a persegue"
  - "esvaziar a mesa" (ferramenta da etapa 1)
  - "contar o que já tens" (ferramenta da etapa 2)
  - "fome", "chão", "lugar cheio" vs "lugar vazio"
  - "sonho meu / emprestado / de outro" (triagem herdada)
  - "fazer muito para valer" (síndrome a quebrar)
  - "vinte abas abertas na cabeça"
  - "talento a mais, clareza a menos"
  - "infonte. clareza, foco, acção." (selo de fecho)
  - A gota: símbolo visual, "a fonte que vem de dentro"
- **Estado:** No ar. Aplicação deployada em https://infonte.vivannedossantos.com. Campanha de lançamento corre 1 a 30 de Junho 2026 no IG + TikTok. Subscrição abre 1 de Julho 2026.
- **Pilares de conteúdo:** As 7 etapas como espinha (esvaziar, bastar-se, clarear, focar, materializar, sustentar, tornar-se fonte). Cada uma é um pilar autónomo com tese, mecanismo, ferramenta e prática de 3 dias.
- **O que ainda falta:**
  - Lista de espera com mecânica de desconto para subscritores antes de 1 de Julho (plano escrito, ainda não implementado)
  - Integração PayPal (código pronto, env vars por preencher)
  - SMTP de confirmação no Supabase Auth (ou manter "confirm email" desligado)
  - Testemunhos ("elas dizem" como destaque mencionado no perfil) — (por definir)
  - Preço final da subscrição — (por definir)
  - % de desconto da lista de espera — (por definir)

## Campanha 30 dias (Junho 2026)
- **Essência (1 frase):** Aquecimento pré-lançamento de 30 posts (manhã didáctico 10h + tarde emocional 13h) que conduz a leitora pela ferida → virada → método → porta, terminando a encher lista de espera.
- **Temas que toca:** prosperidade, identidade, herança familiar de sonhos. Não toca amor/maternidade directamente.
- **Formato:** 60 publicações Instagram + TikTok, importadas via CSV no Metricool. Cada dia tem post da manhã (carrossel didáctico 10 slides) + post da tarde (carrossel emocional 10 slides, "Eco" do manhã). 4 semanas com arco fechado.
- **Para quem é:** Mesma persona do Infonte. Captação de audiência cold antes de saber que o produto existe.
- **Promessa / transformação:** Reconhecimento ("isto sou eu") → tese contraintuitiva → ferramentas pequenas → convite a entrar na lista.
- **Conceitos e linguagem-assinatura:** Mesma do Infonte. Acresce: "a ferida que ninguém nomeia" (semana 1), "a virada" (semana 2), "o método" (semana 3), "a porta" (semana 4).
- **Estado:** No ar desde 1 de Junho. Termina 30 de Junho.
- **Pilares de conteúdo:** Os 4 arcos semanais + 7 etapas como provas pequenas de método.
- **O que ainda falta:** Nada operacional — está a correr. Para próxima campanha: as 10 lições documentadas em `CLAUDE.md` evitam re-iteração.

## Sete Ecos (marca-mãe)
- **Essência (1 frase):** (por definir — referida como casa de várias marcas, paleta terra, é a "família" de onde nasce o Infonte)
- **Temas que toca:** (por definir)
- **Formato:** (por definir)
- **Para quem é:** (por definir)
- **Promessa / transformação:** (por definir)
- **Conceitos e linguagem-assinatura:** Família terra. Infonte é "mais dourada e luminosa" que a paleta-mãe.
- **Estado:** (por definir)
- **Pilares de conteúdo:** (por definir)
- **O que ainda falta:** Tudo o que define a marca-mãe está fora deste projecto.

## SyncHim (referência cruzada)
- **Essência (1 frase):** Marca separada com voz própria (autora Marina Vale, não Vivianne). Mencionada só como padrão técnico aprovado do qual o Infonte copia o fluxo de produção de carrosséis.
- **Estado:** Existe, fora deste projecto. Documentação pública referida em CLAUDE.md (PIPELINE-CIRCUITO-COMPLETO, PIPELINE-UX-PRODUCAO, EXPERIENCIA-PRODUCAO-CONTEUDO).
- **O que ainda falta:** Não pertence a este projecto — mencionada só como referência de padrão.

### Mapa rápido por tema (Projeto 1)

**Prosperidade**
- Produto: **Infonte** (todo o percurso). **Campanha 30 dias** (aquecimento).
- Conteúdo de aula que seria ouro:
  - "Cobrar o que vale, recusar o que diminui" (mecânica de quem se basta)
  - "Como funciona a carência: três sintomas que destravam dinheiro quando se vêem"
  - "Despachar sonhos herdados sem culpa" (ferramenta sistémica adaptada)
  - "O inventário do que já tens" (etapa 2 alargada)
  - "Materializar: a ideia vira plano vira primeiro passo" (etapa 5)

**Corpo / mente**
- Produto: **Infonte** (etapas 1, 6 — esvaziar e sustentar).
- Conteúdo de aula que seria ouro:
  - "Vinte abas abertas: porque a mente cheia parece produtiva e não é"
  - "Sustentar a clareza quando o ruído volta" (etapa 6)
  - Possível extensão: práticas de presença/respiração coerentes com o tom da marca (sem jargão "energia/vibração")

**Amor**
- Produto: (por definir — nenhum produto neste projecto toca o tema directamente)
- Conteúdo de aula que seria ouro: (por definir)

**Maternidade**
- Produto: (por definir — nenhum produto neste projecto toca o tema directamente)
- Conteúdo de aula que seria ouro: (por definir)

### Glossário da voz (Projeto 1 — Infonte)

1. **bastar-se** — verbo central, não "bastar". É reflexo, identidade. "Quem se basta atrai."
2. **a abundância não responde a quem a persegue, responde a quem se basta** — tese-mãe, citável literal.
3. **fome / chão** — par opositor. "Agir de fome" vs "agir de chão". Substitui "carência" técnico.
4. **lugar cheio / lugar vazio** — "querer de um lugar cheio, não de um lugar vazio". Sem "vibração", sem "frequência".
5. **esvaziar a mesa** — ferramenta da etapa 1, expressão própria. Não "fazer triagem".
6. **sonho meu / emprestado / de outro** — triagem herdada. "Devolver a quem pertence" sem desprezo.
7. **fazer muito para valer** — diagnóstico, não acusação. Mostra o padrão.
8. **vinte abas abertas na cabeça** — metáfora do ruído mental. Reutilizável.
9. **talento a mais, clareza a menos** — síntese da persona.
10. **infonte. clareza, foco, acção.** — selo de fecho, três palavras em ordem fixa, ponto final.
11. **a fonte que vem de dentro** — o que a gota (símbolo) representa.
12. **não ensino o que tenho, ensino o caminho até bastar-te** — diferenciador da autoridade da Vivianne (não-guru).
13. **a meio, por arrumar, incompleta** — autorização para começar agora sem estar pronta.
14. **pt-PT, sem travessões** — regra rígida: vírgula, ponto, dois pontos, parênteses. O nome "infonte" sempre em minúsculas.
15. **proibido**: "universo", "manifesta", "mindset", "abundância" sozinha como jargão, "energia", "vibração", "alma", "cura", "luz", "alinhamento", "abraça-te", "ama-te", "hustle", "growth", "abundance mindset". Tudo o que cheire a guru ou coach americano sai.

---

# Projeto 2 — FreeMe (A Travessia da Mãe)

## FreeMe — A Travessia da Mãe
- **Essência (1 frase):** Uma app que conduz mães por um percurso interior de 7 bloqueios emocionais (peso, vazio, culpa, medo, vergonha, mágoa, rancor), assente em trabalho sistémico, para "pousar o que não era seu para carregar".
- **Temas que toca:** **corpo** (somatização, cortisol, sono materno, "when the body says no"), **amor** (ordens do amor de Hellinger, "amar não é sacrifício", relação mãe/filho), **maternidade** (núcleo de tudo). Prosperidade: não aplicável (sem evidência no repo).
- **Formato:** PWA (Next.js 16, `manifest.webmanifest` → standalone, instalável). Bilingue PT/EN. Estrutura interna: **diagnóstico (7 perguntas) → mapa personalizado → desbloqueio (paywall) → travessia por bloqueio (áudio guiado + leitura + exercícios escritos + zona de cautela) → validação final (antes/depois)**. Pagamento PayPal único, "acesso vitalício" (`NEXT_PUBLIC_FREEME_PRICE` default 29.00 USD — valor real configurado por env var, (por definir) qual está em produção).
- **Para quem é:** Mães (PT e Moçambique pelo menos — linhas de apoio incluem SNS 24 e Linha da Mulher 1458). Momento de vida: mãe esgotada, em culpa silenciosa, que sente que "falhou com ele" e que "não é a mãe que sonhou ser". Dor principal nomeada na landing: "a culpa que ninguém nomeia, que te impede de educar e de ocupar o teu lugar".
- **Promessa / transformação:** De uma mãe que "carrega tudo, em silêncio, e abandona o seu lugar" para uma mãe que "sabe o caminho de volta a si — e esse não se desaprende". Não promete cura ("no fim não estás curada. Ninguém fica."). Promete travessia, ordem, lugar.
- **Conceitos e linguagem-assinatura:**
  - "A Travessia da Mãe" (subtítulo oficial)
  - "uma app, um percurso, uma travessia"
  - "Pousar o que não era teu para carregar"
  - "Ocupar o teu lugar"
  - "As ordens do amor entre uma mãe e um filho" (Hellinger)
  - "Honrar sem repetir"
  - "Voltar a ti"
  - "A culpa que ninguém nomeia"
  - "Pertenço exactamente como sou"
  - Símbolos finais da validação: "Ocupei o meu lugar." / "Voltei a mim." / "Pouso o que não é meu." / "Sou mãe, e sou inteira."
  - Os 7 bloqueios com tag curta: peso = "o que carregas", vazio = "o que te falta", culpa = "o que te acusa", medo = "o que te aperta" (restantes tags (por definir) sem ler `blockers.ts` na íntegra).
- **Estado:** **No ar**. Domínio: `freeme.viviannedossantos.com`. 1ª campanha de marketing IG+TikTok em curso (D1 publicou 01/06/2026). Vercel Web Analytics activo. Supabase + PayPal integrados.
- **Pilares de conteúdo:** Os 7 bloqueios (peso → vazio → culpa → medo → vergonha → mágoa → rancor — ordem terapêutica fixa em `THERAPEUTIC_ORDER`). Cada bloqueio = unidade de aula: áudio guiado (script escrito em PT/EN) + leitura + 6+ exercícios de escrita reflexiva + zona de cautela. Autoridades científicas citadas (todas verificáveis e nomeadas no conteúdo): **Gabor Maté**, **Allison Daminger (Harvard, American Sociological Review 2019)**, **Stanford** (carga + sono materno), **Brené Brown** (vergonha, vulnerabilidade), **Bert Hellinger** (ordens do amor, constelação familiar), **Donald Winnicott** (fusão mãe-bebé, identidade materna), **Rachel Yehuda** (trauma transgeracional, epigenética).
- **O que ainda falta:**
  - 12 posts D21-D30 ignorados pelo Metricool no 1º import (cap aparente ~48 linhas) — pendente re-import separado por rede
  - TikTok side dos 48 posts unificados vai falhar silenciosamente (PNG rejeitado). Plano: importar CSV "TikTok only" com slides JPG, começando 2/6
  - Estratégia pós-campanha 1 (re-engagement, próximo produto, funil seguinte): (por definir)
  - Preço real em produção (`NEXT_PUBLIC_FREEME_PRICE`): (por definir)
  - Outras línguas além de PT/EN: (por definir)

### Mapa rápido por tema (Projeto 2)

**Corpo**
- Produtos: FreeMe (bloqueios peso, vazio e medo tocam directamente em sintomas físicos: insónia, cortisol, exaustão, somatização).
- Conteúdo que seria ouro: Aulas com **dados Stanford de sono materno** (1.350h perdidas/ano, cortisol elevado a dormir), neurociência do stress crónico em mães, **Rachel Yehuda + epigenética** (carga vinda do sistema, não tua). Tudo o que mostra que o corpo regista o que a mente nega.

**Amor**
- Produtos: FreeMe (bloqueios culpa, vergonha, mágoa, rancor — todos no eixo relacional mãe/filho; bloqueio peso também trabalha "amar é carregar" vs "amar não é sacrifício").
- Conteúdo que seria ouro: As **3 ordens do amor de Bert Hellinger** explicadas pela Vivianne com casos reais, Winnicott sobre fusão necessária vs fusão prolongada, "honrar sem repetir" como prática.

**Maternidade**
- Produtos: FreeMe é integralmente sobre maternidade. Único produto identificado no repo.
- Conteúdo que seria ouro: Os 7 bloqueios em vídeo longo (uma aula por bloqueio com Vivianne em câmara), o diagnóstico aprofundado, casos de constelação familiar (sem nomear pessoas), **Daminger (Harvard 2019)** sobre carga cognitiva invisível, descodificação do "modelo impossível" (uma mulher a fazer o que se pediria a três).

**Prosperidade**
- Produtos: Nenhum identificado no repo. (por definir)
- Conteúdo que seria ouro: (por definir)

### Glossário da voz (Projeto 2 — FreeMe)

1. **"A Travessia da Mãe"** — sempre com maiúsculas, é o subtítulo oficial do produto, nunca traduzir para "jornada" em PT.
2. **"Pousar"** (não "largar", não "deixar") — pousar o peso, pousar o que não é teu. É verbo-chave terapêutico.
3. **"Ocupar o teu lugar"** — em vez de "ser tu mesma" ou "afirmar-te". É o vocabulário sistémico.
4. **"As ordens do amor"** — referência a Hellinger; nunca chamar "regras" nem "leis do amor", são *ordens*.
5. **"Honrar sem repetir"** — fórmula para a relação com a mãe/linhagem.
6. **"O que não era teu para carregar"** — frase-mãe da promessa; usar literal.
7. **"Diagnóstico grátis na bio"** / **"Diagnóstico grátis. Link na bio."** — CTA padrão da campanha social.
8. **"A mãe não se pode queixar. A mãe aguenta."** — frase de descodificação do silêncio materno (usada na landing).
9. **"Não é mais um curso"** — anti-posicionamento contra cursos de parentalidade.
10. **"Por dentro, no teu ritmo"** — modo da travessia.
11. **"Não estás curada. Ninguém fica. Mas sabes o caminho de volta a ti."** — frase de fecho; promessa honesta sem milagre.
12. **"Carregas"** (verbo) — usado em vez de "tens" para descrever fardo emocional.
13. **PT-PT estrito** — "tu" (nunca "você"), "estás" (não "está"), "filho/filha" (não "criança" sempre que possível, embora apareça "criança ferida" como contraste retórico), "casa" (não "lar"), "pousar" (não "soltar"), "mágoa" (com m minúsculo nos bloqueios; "A mágoa" com artigo quando é o nome do bloqueio).
14. **Os 7 bloqueios com artigo:** O peso, O vazio, A culpa, O medo, A vergonha, A mágoa, O rancor — sempre com artigo, capa por capa.
15. **"@vivianne.dos.santos"** — handle Instagram padrão da Vivianne, sempre incluído nas captions da campanha.

---

# Projeto 3 — A Loja / O Universo das 7 Coleções

> Consolida toda a oferta: ebooks (€7), guias práticos (€5), as travessias
> (FreeMe, Infonte, SyncHim, Escola dos Véus) e a moldura editorial das 7
> coleções. Cobre os 4 temas (prosperidade ainda só tangencial — Coleção III
> "em-breve").

## Ebooks (€7)

### A culpa não é boa conselheira
- **Essência:** Porque te sentes sempre em falta com os teus filhos, e o que essa culpa te está a impedir de fazer.
- **Tema:** maternidade · **Formato:** Ebook PDF (~50 páginas, 8 capítulos; Fraunces + Outfit, capa MJ full-bleed, drop caps, sumário)
- **Para quem é:** Mãe que se sente sempre em falta, faça o que fizer. Dor: a culpa diária que aparece no silêncio da noite.
- **Promessa:** Reconhecer que a culpa não nasceu contigo — herdaste-a — para deixar de a confundir com responsabilidade. "Pousar o que não é teu, e voltar a ti, sem deixares de os amar."
- **Linguagem:** "A culpa não é boa conselheira", "lealdade invisível", "ninguém diz, e por isso tu achas que és a única", "a culpa tem origem", "a travessia"
- **Estado:** No ar (slug `ebook-01-culpa`, €7, PDF editorial gerado)
- **Pilares:** A coisa que sentes e nunca disseste · Ninguém fala da culpa da mãe · Sentir culpa não te torna má mãe · O que a culpa te faz fazer · De onde vem a tua culpa · A diferença entre culpa e responsabilidade · Há um caminho de volta · A travessia
- **Falta:** Correção de ortografia e travessão; livro-porta da escada de produtos para FreeMe

### O que herdaste sem saber
- **Essência:** As lealdades invisíveis: porque repetes o que juraste nunca repetir.
- **Tema:** maternidade · **Formato:** Ebook PDF (8 capítulos)
- **Para quem é:** Mulher que se apanha a usar o tom da própria mãe. Dor: "abres a boca e sai aquela frase. Com aquele tom. É a voz da tua mãe."
- **Promessa:** Ver o padrão herdado (papel-cela) sem o achar defeito pessoal, para deixar de o passar à frente.
- **Linguagem:** "lealdades invisíveis", "herança", "constelação familiar", "padrão, ao contrário de um defeito, pode mudar"
- **Estado:** No ar (€7) · **Falta:** estrutura completa em `ebook-02-herdaste/ebook-02-herdaste.md` (por definir)

### Quem és para além do que fazes
- **Essência:** A diferença entre identidade e papéis. · **Tema:** identidade/Infonte
- **Formato:** Ebook PDF (7 capítulos)
- **Para quem é:** Mulher que perdeu o contacto consigo dentro dos papéis (mãe, profissional, filha, parceira). Dor: "houve um momento em que deixaste de saber quem és."
- **Promessa:** Distinguir identidade de papel; "quem és tu antes de chegares?"
- **Linguagem:** "papel-prisão", "personagens interiores", "ocupar o teu tamanho", "Infonte" · **Estado:** No ar (€7)

### O sentido que procuras
- **Essência:** Porque o sucesso não preenche. · **Tema:** identidade/propósito
- **Formato:** Ebook PDF (6 capítulos)
- **Para quem é:** Mulher que "tem tudo" e sente que falta algo.
- **Promessa:** Distinguir o que persegues por herança do que é mesmo teu — "não precisas de chegar a lado nenhum para já seres suficiente. Só precisas de voltar."
- **Linguagem:** "perseguir o que não é teu", "a fonte interior", "vazio existencial" · **Estado:** No ar (€7)

### Atravessar o escuro
- **Essência:** As crises como passagem. · **Tema:** sobrevivência/Força
- **Formato:** Ebook PDF (6 capítulos)
- **Para quem é:** Mulher que atravessa uma crise, depressão ou luto invisível.
- **Promessa:** A crise como travessia (não como falha) — "pousar a armadura quando estás em segurança."
- **Linguagem:** "atravessar o escuro", "adaptação que te manteve viva", "inteligência de sobrevivência", "armadura"
- **Estado:** No ar (€7) · **Falta:** aviso ético sobre acompanhamento (consta na abertura da Coleção VI Força)

### O nó invisível do casal
- **Essência:** O que está por baixo das discussões que se repetem. · **Tema:** amor
- **Formato:** Ebook PDF (6 capítulos)
- **Para quem é:** Casal que repete a mesma discussão. Dor: "tu sabes qual é. A mesma discussão, sempre."
- **Promessa:** Ver o nó sistémico debaixo da discussão recorrente — porta de entrada para a travessia SyncHim.
- **Linguagem:** "o nó invisível", "SyncHim", "amor que dessincronizou", "fusão vs. relação", "dois que se vêem" · **Estado:** No ar (€7)

### Nem todo o sonho que carregas nasceu em ti
- **Essência:** Porque alcanças e continuas a sentir que falta. · **Tema:** identidade/Infonte (toca prosperidade na expressão de "alcançar")
- **Formato:** Ebook PDF (8 capítulos)
- **Para quem é:** Mulher de alto desempenho que persegue metas e nunca chega. Dor: "fizeste tudo certo... Mas não sentes."
- **Promessa:** Separar o sonho herdado do sonho próprio; parar de perseguir o que não é teu.
- **Linguagem:** "perseguir o que não é teu", "sonhos herdados", "substituição", "a que herdou" · **Estado:** No ar (€7, badge `novo`)

### De quem é esta voz?
- **Essência:** Quem decidiu o que conta como sucesso? · **Tema:** identidade
- **Formato:** Ebook PDF (7 capítulos)
- **Para quem é:** Mulher que mede tudo por uma régua interior que não escolheu. Dor: "há uma régua na tua vida... e nunca é suficiente."
- **Promessa:** Identificar a voz herdada que mede o teu valor para voltares a ouvir a tua.
- **Linguagem:** "voz própria", "régua interior", "merecer existir" · **Estado:** No ar (€7, badge `novo`)

## Guias práticos (€5)

### O que é meu, o que não é meu
- **Essência:** Um exercício para parares de carregar o que nunca foi teu. · **Tema:** maternidade
- **Formato:** Guia prático PDF (exercício de duas colunas) · **Para quem é:** Mãe sobrecarregada com cargas que não são suas.
- **Promessa:** Separar concretamente o que é teu do que carregas pelos outros, em 10 minutos.
- **Linguagem:** "o que é meu, o que não é meu", "carregar", "pousar" · **Estado:** No ar (€5)

### 7 frases para dizer não sem culpa
- **Essência:** Limites com amor e firmeza. · **Tema:** maternidade · **Formato:** Guia PDF
- **Para quem é:** Mãe que diz sim quando o corpo pede não. Dor: "compensas a mais. Dizes sim quando o corpo grita não."
- **Promessa:** 7 frases prontas para quando o filho testa os limites, sem culpa.
- **Linguagem:** "limites com amor e firmeza", "dizer não é o primeiro sim que te dás" · **Estado:** No ar (€5)

### Práticas de presença para o dia a dia
- **Essência:** Pequenas pausas que te trazem de volta. · **Tema:** corpo · **Formato:** Guia PDF (7 micro-práticas)
- **Para quem é:** Mulher em modo automático/sobrecarga que quer voltar ao corpo durante o dia.
- **Promessa:** Micro-pausas que devolvem presença sem precisar de mais tempo.
- **Linguagem:** "presença", "pequenas pausas", "voltar a ti" · **Estado:** No ar (€5)

### Esvaziar a mente em 3 passos
- **Essência:** Parar a roda de pensamentos. · **Tema:** corpo (mente como dimensão do corpo) · **Formato:** Guia PDF
- **Para quem é:** Mulher com a cabeça cheia que não dorme/não foca/não decide.
- **Promessa:** Despejar, separar, escolher — 3 passos para travar o ruído mental.
- **Linguagem:** "despejar, separar, escolher", "mente cheia" · **Estado:** No ar (€5)

### Ritual para o luto que ninguém vê
- **Essência:** Para as perdas sem funeral. · **Tema:** luto/Força · **Formato:** Guia PDF (ritual)
- **Para quem é:** Mulher que perdeu algo sem direito a luto público (relação, identidade, lar, oportunidade, parte de si).
- **Promessa:** Um ritual para nomear e honrar o que se perdeu fora do reconhecimento social.
- **Linguagem:** "luto invisível", "perda sem funeral", "honrar" · **Estado:** No ar (€5)

### As 5 perguntas antes de uma discussão
- **Essência:** Antes de reagir. · **Tema:** amor · **Formato:** Guia PDF
- **Para quem é:** Pessoa em relação que entra no automático da discussão.
- **Promessa:** 5 perguntas-âncora que cortam o automatismo antes da resposta.
- **Linguagem:** "perguntas antes da discussão", "antes de reagir" · **Estado:** No ar (€5)

### O que é mesmo teu
- **Essência:** Separar o que persegues por herança. · **Tema:** identidade (toca prosperidade) · **Formato:** Guia PDF
- **Para quem é:** Mulher que persegue metas que talvez nem sejam suas.
- **Promessa:** Distinguir o que persegues para ti do que persegues por herança.
- **Linguagem:** "o que é mesmo teu", "perseguir por herança", "distinguir" · **Estado:** No ar (€5, badge `novo`)

## Travessias (programas, links externos)

### FreeMe (travessia)
- maternidade · `freeme.viviannedossantos.com` · "Pousa o que não era teu para carregar." · "voltar a ti, sem deixar de os amar." · No ar. Falta: módulos/duração/formato (não constam do repo).

### Infonte (travessia)
- identidade/propósito · `infonte.viviannedossantos.com` · "Distingue o que realmente procuras." · Parar de perseguir o que não é teu. · No ar. Falta: detalhes do programa.

### SyncHim (travessia)
- amor · `synchim.viviannedossantos.com` · "Vê o nó invisível do casal." · "o amor deixar de ser fusão e voltar a ser relação." · No ar. Falta: detalhes do programa.

### Escola dos Véus
- identidade/transpessoal · `escoladosveus.space` · "Atravessa cada véu que te separa de quem és." · Formação no método transpessoal/sistémico. · No ar. Falta: mapa dos cursos (não consta do repo).

## Coleção FreeMe Mãe — 12 livros novos (em construção)
- **Essência:** Os 12 papéis-prisão da maternidade, em livros distintos com a mesma travessia. · **Tema:** maternidade
- **Formato:** 12 ebooks PDF a produzir (escada de €7 cada).
- **Convenção dos títulos:** "A mãe que..." nomeia a postura ferida; "Amar...", "Deixar-se..." nomeia o ato de transformação.
- **Estado:** Em construção (12 ficheiros em `ebooks-plano/Novos/`).
- **Os 12 livros:** 1. A culpa não é boa conselheira (existe, falta correção) · 2. Amar sem carregar (filho no espetro) · 3. A mãe que ficou (filhos adultos) · 4. A mãe que salva (filho frágil) · 5. Amar e dizer basta (filho que magoa) · 6. A mãe que quis unir (nivelamento entre irmãos) · 7. A mãe que cumpriu (filho ausente) · 8. A mãe solo · 9. A mãe que não sentiu · 10. A mãe que criou a distância · 11. A mãe arrependida · 12. A mãe que teme pesar
- **Falta:** Escrita dos 11 livros; ordem definida no `COLECAO-posicionamento.md` (culpa → espetro → mãe que ficou → salva → basta → unir + ausente).

## O Universo (frame editorial das 7 coleções)
- **Essência:** "Uma só pergunta, em sete roupas" — sete coleções como sete portas para a mesma travessia: voltar a ti.
- **Temas:** corpo, amor, maternidade, prosperidade (e identidade, pertença, sobrevivência, trabalho)
- **Formato:** Estrutura editorial / mapa que ordena ebooks, guias e travessias.
- **Pergunta-síntese:** "Posso ocupar o meu lugar sem carregar, sem provar, sem salvar, sem perseguir e sem desaparecer?"
- **Verbos da travessia:** devolver, confiar, recuar, regressar, ocupar, receber, pousar, descansar, distinguir, escolher.
- **Estado:** Mapa fechado (`00-MAPA-MESTRE.md`); Coleções I, II, IV, VI no ar; III, V, VII em-breve.
- **As 7 perguntas:**
  - I FreeMe Mãe — "o que estou a carregar que não é meu?"
  - II Infonte — "o que estou a perseguir que não é meu?"
  - III Prosperidade — "o que me impede de receber o que é meu?"
  - IV SyncHim — "o que me faz perder-me quando amo?"
  - V Pertença — "qual é o meu lugar entre os outros?"
  - VI Força — "o que tive de me tornar para sobreviver?"
  - VII Trabalho e Vocação — "quem sou eu sem aquilo que faço?"
- **Falta:** Coleções III, V, VII têm abertura mas zero produtos. Aberturas em `ebooks-plano/universo/ABERTURAS/`.

### Mapa rápido por tema (Projeto 3)

**Corpo** — Atuais: Práticas de presença · Esvaziar a mente em 3 passos. Ouro para aulas: regulação do sistema nervoso · corpo/mente como dois lugares do mesmo eu · "voltar ao corpo" como porta da presença · sinais somáticos da culpa, da fusão, da pressa.

**Amor** — Atuais: O nó invisível do casal · As 5 perguntas antes de uma discussão · Travessia SyncHim. Ouro: o padrão herdado que levas para dentro do amor · fusão vs. relação · distinguir paixão de tempestade · "desaparecer no amor" · o amor de origem como template · casal como sistema (constelação).

**Maternidade** — Atuais: A culpa não é boa conselheira · O que herdaste sem saber · O que é meu, o que não é meu · 7 frases para dizer não sem culpa · Travessia FreeMe. Em produção: os 12 livros da Coleção FreeMe Mãe. Ouro: lealdades invisíveis · "amar não é carregar" · culpa vs. responsabilidade · devolver o peso geracional · a mãe que ficou (ninho vazio) · filhos no espetro · saídas da fusão materna.

**Prosperidade** — Atuais: nenhum específico (Coleção III em-breve, abertura escrita). Tangencialmente: Nem todo o sonho que carregas nasceu em ti · O que é mesmo teu. Ouro: escassez herdada · medo de receber · "pagar para pertencer" · cobrar sem culpa · travar antes de receber · o valor que vem antes do que se faz · prosperar como traição à origem.

### Glossário da voz (Projeto 3 — O Universo)

1. **A mesma travessia** — todas as portas (livros, coleções, travessias) levam ao mesmo lugar: voltar a si.
2. **Carregar o que não é meu** — verbo fundador. Distinto de cuidar; é segurar peso alheio como se fosse próprio.
3. **Pousar** — o gesto-chave de transformação. Não largar, não abandonar. Pousar.
4. **Voltar a ti** — destino de toda a travessia. Não chegar; regressar.
5. **Lealdade invisível** — termo sistémico/constelação familiar; o que se herda sem se ter assinado.
6. **Papel-prisão / papel-cela** — a personagem interior que protegeu e depois aprisionou. Não é emoção; é papel.
7. **Fusão vs. relação** — par-tese transversal. O amor que cura deixa de ser fusão e torna-se relação. "Dois que se vêem, não dois que se completam por falta."
8. **A mãe que... / Amar sem... / Deixar-se...** — gramática dupla dos títulos. A primeira nomeia a ferida, a segunda o verbo da transformação.
9. **Ninguém diz, e por isso tu achas que és a única** — frase de abertura recorrente; "o não-dito como prova de solidão".
10. **Ocupar o meu lugar** — pergunta-síntese do universo: "posso ocupar o meu lugar sem carregar, sem provar, sem salvar, sem perseguir e sem desaparecer?"
11. **Devolver, confiar, recuar, regressar, ocupar, receber, pousar, descansar, distinguir, escolher** — os verbos da travessia. Nenhum manda conquistar mais. Todos mandam voltar.
12. **Com toda a minha ternura** — assinatura.
13. **Travessia** (vs. transformação) — palavra preferida; passa-se atravessando, não em chegando.
14. **Porta** — cada livro/coleção é uma porta, não a casa.
15. **A fonte interior / o nó invisível / o que não te disseste** — formas de nomear o que está por baixo do sintoma.

---

# Projeto 4 — SyncHim (A travessia do casal)

> Eixo central do tema **amor**. Diagnóstico gratuito → travessia dos 7 nós →
> biblioteca completa, mais a Coleção IV literária. **Só toca amor.** Maternidade
> e prosperidade ficam de fora — a marca recusa explicitamente o vocabulário
> new-age de "prosperidade/abundância/frequência".

## SyncHim · Diagnóstico (Tier 0)
- **Essência:** Diagnóstico íntimo e gratuito que revela qual dos sete padrões antigos está a tirar a tua relação de sincronia.
- **Tema:** amor · **Formato:** PWA web (Next.js), texto, 21 perguntas + Sessão 1 (reconhecimento) + Sessão 2 (revelação do nó). Sem áudio, sem vídeo, sem rosto. 8 minutos de leitura.
- **Para quem é:** Mulheres em relações sérias — casadas há anos OU em construção (variantes "casada"/"solteira"). "Por fora está tudo bem, por dentro tu sabes." Dor: dessincronia sem nome.
- **Promessa:** De "não sei o que se passa connosco" para "tem um nome — e é meu". Reconhecimento + nome do padrão. Não promete resolver, devolve visão.
- **Linguagem:** "os 7 nós", "nó dominante", "padrão antigo", "voltar a ti", "sincronia/dessincronia", "ver / nomear / dissolver", "honestidade brutal contigo mesma".
- **Estado:** No ar (`/diagnostico` e `/resultado`, PT + EN).
- **Pilares:** as 21 perguntas (scoring 0-3 por padrão), Sessão 1 (`content/pt/sessao-01.md`), Sessão 2 com revelação do nó, leads por nó (lead/body/fraseQueDoi) em `no-content.ts` + variantes solteira.
- **Falta:** reescrita das sessões pagas em variante "solteira" (hoje cai por fallback para "casada"); afinação das `fraseQueDoi`.

## SyncHim · Travessia do nó dominante (Tier 1)
- **Essência:** Percurso pago de 21 dias para atravessar o nó que o diagnóstico revelou. · **Tema:** amor
- **Formato:** 5 sessões adicionais (3-7) personalizadas pelo nó + 5 práticas + acesso vitalício. Gating temporal de 3 dias entre sessões. Texto puro.
- **Para quem é:** Mulher que fez o diagnóstico e quer trabalhar o nó nomeado.
- **Promessa:** Da compreensão do nó (Tier 0) à travessia — origem sistémica → ponto de viragem → reconfiguração → manutenção. "Quando a sincronia volta, ele volta. Não porque o manipulaste — porque deixaste de o empurrar para longe sem perceberes."
- **Linguagem:** "ordens do amor", "lealdade invisível", "herança", "travessia", "frase-mãe", "verbo-âncora" (ver, regressar, escolher-se, entregar, distinguir), "devolver a ela".
- **Estado:** No ar. Conteúdo pleno só para o **Nó da Fome**; os outros 6 herdam a estrutura mas requerem reescrita.
- **Pilares:** Sessão 3 (mecânica do nó), 4 (origem sistémica), 5 (travessia), 6 (reconfiguração — comum), 7 (retorno — comum). 5 práticas por nó.
- **Falta:** 18 textos (sessões 3-5 × 6 nós) + 30 práticas + variante solteira. · **Preço:** R$ 127 · US$ 39.

## SyncHim · Biblioteca completa dos 7 nós (Tier 2)
- **Essência:** Acesso a todos os 7 nós para sempre. · **Tema:** amor
- **Formato:** Igual ao Tier 1 mas com os 7 nós desbloqueados + refazer diagnóstico ilimitado.
- **Para quem é:** Mulher que quer ferramenta para a vida toda, ou que reconhece mais do que um padrão.
- **Promessa:** "Cada nó que aparecer ao longo da vida, tu atravessa-lo."
- **Linguagem:** "o mapa inteiro", "a biblioteca é tua", "o próximo nó sobe quando o primeiro afrouxa".
- **Estado:** no ar tecnicamente; README marca "disabled at launch — kept for forward compat". Status real (por definir).
- **Falta:** mesma reescrita do Tier 1; clareza pública sobre o tier estar activo. · **Preço:** R$ 297 · US$ 87.

## SyncHim · Upgrade individual ("Atravessar próximo nó")
- **Essência:** Compra à la carte de um nó adicional para quem já fez Tier 1. · **Tema:** amor
- **Formato:** Desbloqueia sessões 3-7 e práticas de UM nó. · **Para quem é:** Compradora do Tier 1 que reconhece outro nó a subir.
- **Promessa:** Continuidade sem committment de biblioteca completa.
- **Linguagem:** "atravessa o teu próximo nó", "o nó que tu atravessaste é teu para sempre".
- **Estado:** No ar (`UpsellSessao7` activo). · **Falta:** só para nós com conteúdo escrito (hoje só Fome). · **Preço:** US$ 19 (BRL por definir).

## Coleção IV · "A mulher que..." (7 livros)
- **Essência:** Sete livros literários, cada um sobre uma figura da mulher na ferida do amor — lente individual que aponta para a SyncHim sem a substituir. · **Tema:** amor
- **Formato:** Livros (suporte por definir). Escrita literária, sem método clínico.
- **Para quem é:** Mulher antes de estar pronta para o produto, ou que quer compreensão sem trabalho ainda.
- **Promessa:** "Compreender a ferida é a primeira metade. A outra metade faz-se a dois — e isso é onde a SyncHim entra."
- **Linguagem:** "a mulher que ama a ausência", "a mulher que desaparece", "a mulher que confunde intensidade com amor"; verbos-âncora por livro; frase-mãe que abre cada capítulo.
- **Estado:** em construção (Phase 2 editorial).
- **Falta:** mapeamento final livros-vs-nós; decidir 8.º livro ("a mulher que fica em quem a magoa"); afinar verbos repetidos; todo o conteúdo (por definir).

## Pipeline editorial · estúdio interno `/admin`
- **Essência:** Infraestrutura própria para produzir/agendar/exportar carrosseis IG e reels MP4 que sustentam organicamente os produtos pagos. *(meio, não produto)*
- **Tema:** amor (alimenta os produtos acima).
- **Formato:** Estúdio web interno + GitHub Actions (Puppeteer + FFmpeg) + Supabase Storage + export CSV Metricool (IG/TikTok/YouTube Shorts).
- **Linguagem:** Karaokê SyncHim (palavra activa em ouro `#D4A857`), EB Garamond serif, estrela persa, paleta bordeaux→escuro.
- **Estado:** No ar. 140+ posts em produção; 31 reels SV-* renderizados.
- **Falta:** não é produto à venda — é gerador (ver `EXPERIENCIA-PRODUCAO-CONTEUDO.md`).

### Mapa rápido por tema (Projeto 4)

**Corpo** — Nenhum produto SyncHim toca corpo (é texto puro, leitura). *Loranne* (projeto separado, musicoterapia, "o corpo lembra o que a mente esqueceu") não vive neste repo. Porta aberta via Psicologia Transpessoal, mas seria território editorial novo. (por definir)

**Amor** — SyncHim Diagnóstico, Tier 1, Tier 2, Upgrade (todo o eixo central) + Coleção IV (lente literária). Aulas que alimentam: ordens do amor no casal (Constelação Familiar), padrões sistémicos herdados, "fusão vs relação", arquétipos da feminilidade no amor (Jung, Transpessoal), o vazio como chamado (Espiritualidade).

**Maternidade** — Nenhum produto SyncHim toca maternidade. (por definir — território editorial novo ou fora do universo.)

**Prosperidade** — **Explicitamente proibido** como vocabulário (`SYNCHIM-CONCEITO.md` §6.4): "prosperidade" new-age está na lista preta com "manifestar", "abundância", "frequência". A marca recusa o eixo.

### Glossário da voz (Projeto 4 — SyncHim)

1. **nó / os 7 nós / nó dominante** — unidade de análise, minúscula salvo em título.
2. **sincronia / dessincronia** — palavra-mãe; "casais não morrem por falta de amor, morrem por dessincronia".
3. **travessia** — verbo do percurso de 21 dias (não "jornada", não "transformação").
4. **ordens do amor** — vocabulário sistémico (Hellinger), usar literal.
5. **voltar a ti / voltar à tua frequência** — fim do percurso, nunca "encontrar-te".
6. **padrão antigo** — preferir a "trauma", "bloqueio" ou "ferida emocional".
7. **ferida** — admitido no livro/coleção; no app preferir "padrão" ou "nó".
8. **fusão vs relação** — a tese ("o amor deixa de ser fusão e passa a ser relação").
9. **lealdade invisível / herança** — vindo da Constelação.
10. **ver / nomear / dissolver** — método em 3 movimentos, manter ordem.
11. **frase-mãe** — a frase que abre cada sessão/capítulo, formato fixo.
12. **anti-guru, anti-curso** — auto-descrição da voz.
13. **devolver a ela / devolver visão** — fim de qualquer texto, não fechar conclusões.
14. **sem cobrar, sem brigar, sem ele saber** — promessa-assinatura da landing.
15. **honestidade brutal contigo mesma** — registo emocional do diagnóstico.

**Regras de uso transversais (SyncHim):**
- **PT-PT sempre** (telemóvel, ecrã, casa de banho — nunca celular, tela, banheiro).
- **Tu, 2ª pessoa, sempre** — falar com ela, nunca sobre ela.
- **Sem travessões longos** (—, –) no corpo — vírgula, ponto, dois pontos. Exceção: assinatura visual ao lado da estrela persa.
- **Sem emojis** no corpo (livros e app); admitidos em redes sociais.
- **Frases curtas, parágrafos 1-3 linhas**, ritmo de leitura em telemóvel.
- **Proibidos:** "energia feminina", "sagrado feminino", "vibração", "frequência" (new-age), "alinhar com o universo", "manifestar", "abundância", "afirmações", "decretos", "tu mereces" (como motor argumentativo), jargão coaching americano traduzido.

---

## Nota de relação entre produtos (por confirmar pela Vivianne)

`SYNCHIM-CONCEITO.md` referido numa sessão afirma *"FreeMe = Pós-SyncHim. Quem
fez a travessia e está a refazer-se"* (relação **sequencial**: casal → libertação
pós-fusão). Já o retrato do FreeMe e o da SyncHim tratam-se como **portas
autónomas por tema** (amor vs maternidade). Até a Vivianne decidir, o pipeline
trata-os como **portas independentes**, sem forçar ligação sequencial.
