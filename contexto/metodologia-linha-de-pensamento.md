# Metodologia: áreas da vida × bases de conhecimento × histórico

> **Estado:** proposta para validação. Demonstrada com dados reais do Banco de Produto
> em 13 de outubro de 2026 (1742 entradas). Nada foi reorganizado ainda. Nenhum post foi
> criado, nenhum pilar, público ou oferta foi decidido.

## 1. O que está hoje no banco

O Banco de Produto tem **1742 entradas**, cada uma com `curso`, `cadeira`, `aula`,
`temas`, `produto`, `ideia` e `texto` integral.

Duas coisas limitam-no desde a origem, e ambas são verificáveis no código:

**A redução a quatro categorias.** O extrator só reconhece cinco etiquetas, fixadas numa
expressão regular em `scripts/gerar-conteudo.mjs`:

```js
const RE_TAG = /\[(corpo|amor|maternidade|prosperidade|oportunidade)\]/gi;
```

Daí a distribuição atual: maternidade 694, amor 295, prosperidade 154, corpo 79. Não
existe etiqueta para família e pertença nem para identidade, sentido e espiritualidade,
que são duas das seis áreas. O que não tem etiqueta fica fora: **214 entradas** não têm
nenhuma.

**A classificação por produto.** O campo `produto` aponta 645 das 1742 entradas para
FreeMe Mãe (358), SyncHim (203) e Infonte (84), por uma função que ainda testa esses
nomes no código. Agrupar por aqui é agrupar por um catálogo que mudou.

Por isso a classificação desta proposta é feita **pelo conteúdo do campo `texto`**, e não
pela etiqueta nem pelo nome do produto.

## 2. As seis áreas e as quatro bases

As seis áreas de trabalho:

1. Família e pertença
2. Relações amorosas
3. Maternidade
4. Corpo e experiência emocional
5. Prosperidade, trabalho e vocação
6. Identidade, sentido e espiritualidade

As quatro bases de conhecimento obtêm-se dos cursos existentes. Esta correspondência é
uma **proposta**, não um dado:

| Curso na Syntia | Base |
|---|---|
| Constelação Familiar Sistémica | sistémica |
| Psicologia Transpessoal | transpessoal |
| Psicologia e Espiritualidade | transpessoal |
| Neurociências do Desenvolvimento Humano | neurocientífica |
| Neurociências Cognitivas e Processos Psicológicos | neurocientífica |
| Neuropsicanálise | psicológica |
| ROTA100K | nenhuma (é método de conteúdo, não base) |

Há aqui um desequilíbrio a assumir: a base **psicológica** tem apenas uma cadeira
(Neuropsicanálise, 12 entradas). Ou se aceita que ela é hoje residual, ou se reclassifica
Psicologia e Espiritualidade como psicológica em vez de transpessoal. É uma decisão tua.

## 3. O cruzamento real, hoje

Contagem por área (reconhecida pelo conteúdo) e por base:

| Área | sistémica | transpessoal | psicológica | neurocientífica | total |
|---|---:|---:|---:|---:|---:|
| Família e pertença | 266 | 168 | 0 | 58 | 492 |
| Relações amorosas | 135 | 74 | 1 | 11 | 221 |
| Maternidade | 346 | 404 | 8 | 187 | 945 |
| Corpo e experiência emocional | 132 | 183 | 9 | 180 | 504 |
| Prosperidade, trabalho e vocação | 101 | 138 | 0 | 18 | 257 |
| Identidade, sentido e espiritualidade | 39 | 268 | 1 | 19 | 327 |

Uma entrada pode servir mais do que uma área, por isso os totais somam mais do que 1742.

O que esta matriz mostra de imediato:

- **Maternidade está sobre-representada** e é a única área com as quatro bases povoadas.
- **Relações amorosas**, que é o eixo que dizes trabalhar hoje, é das mais pobres: 221
  entradas, e quase nada de neurociência (11) ou psicologia (1).
- **Identidade, sentido e espiritualidade** vive quase só da base transpessoal (268 de
  327). Falta-lhe o contraponto sistémico.
- **Família e pertença** não tem nenhuma entrada da base psicológica.

## 4. Amostra A: um assunto com as quatro bases

### Assunto: *o que se herda sem saber*

**432 entradas**, presentes nas quatro bases. Áreas que atravessa: Família e pertença,
Maternidade, Identidade.

#### 4.1 · As entradas que o alimentam

Base **sistémica** (159 entradas), por aula de origem:

- Constelação Familiar Sistémica › Explorando o Pensamento Sistémico e a Teoria dos Sistemas › *Terapia Constelação Familiar* (9)
- Constelação Familiar Sistémica › Definindo e Entendendo as Constelações Familiares › *A1 Definição e Elaborações Importantes* (8)
- Constelação Familiar Sistémica › Mudança Epistemológica e Introdução ao Pensamento Sistémico › *A2 Genograma* (7)
- Constelação Familiar Sistémica › Definindo e Entendendo as Constelações Familiares › *A2 Relacionamento Entre Pais e Filhos* (6)

Base **transpessoal** (182):

- Psicologia Transpessoal › Técnicas Transpessoais: Constelação Familiar › *A2 Constelação Sistémica, Pressupostos Teóricos e de Intervenção* (15)
- Psicologia Transpessoal › Transpessoal: História e Fundamentos › *Ciência, Espiritualidade, Física Quântica* (6)
- Psicologia Transpessoal › Técnicas Transpessoais: Astrologia › *A7 As Oitavas Superiores do Psiquismo Humano* (6)

Base **neurocientífica** (88):

- Neurociências do Desenvolvimento Humano › O Cérebro do Adulto e do Idoso › *A3 Mecanismos Epigenéticos* (6)
- Neurociências do Desenvolvimento Humano › O Cérebro do Adulto e do Idoso › *A8 Plasticidade Neuronal* (4)
- Neurociências do Desenvolvimento Humano › Doenças Neurológicas em Crianças e Adolescentes › *A2 Neurobiologia do Transtorno do Espectro Autista*

Base **psicológica** (3): Neuropsicanálise › Neuroanatomia e Neurofisiologia › U2 e U3.

#### 4.2 · O contributo de cada base

- **Sistémica: permite compreender.** Dá o mecanismo da transmissão: pertencimento,
  lealdade, emaranhamento, o excluído que volta por alguém que entrou depois dele no
  grupo. O genograma dá-lhe forma visível.
- **Transpessoal: permite alargar.** Coloca a herança para além da família biológica, com
  o inconsciente coletivo, os arquétipos e o campo. É a base que impede que a herança
  seja lida apenas como história de casa.
- **Neurocientífica: permite distinguir.** A epigenética separa o que é herdado do que é
  destino. Uma entrada diz, literalmente: *"podes ter os mesmos genes e uma vida
  completamente diferente"*. É aqui que a plasticidade entra como contraponto.
- **Psicológica: permite questionar.** Quase ausente. É a lacuna desta amostra.

#### 4.3 · Pergunta central

**O que é que herdei que não é destino?**

Sustenta sequência porque obriga a separar três coisas que normalmente aparecem
juntas: o que se repete, o que se transmite e o que se pode mudar.

#### 4.4 · Conteúdos anteriores relacionados

**Não verificável deste lado.** Este repositório tem 25 ficheiros em `inspiracao/`
(11 ideias, 3 legendas, 11 transcrições), que são referências recolhidas, não registo de
publicação. O acervo e os guiões vivem no outro repositório. Enquanto esse registo não
estiver acessível à Syntia, o ponto 4 de qualquer dossiê fica por preencher, e nenhuma
proposta pode afirmar que um assunto é novo.

#### 4.5 · O avanço possível

O argumento *"carregas o que não é teu"* está dado e, pelo que dizes, saturado. O que a
matriz mostra por desenvolver não é outro cenário para o mesmo argumento, é a
**tensão entre as bases**: a sistémica diz que o padrão se repete até alguém o ver; a
neurociência diz que a expressão genética muda com o ambiente. Juntas levantam uma
pergunta que nenhuma das duas responde sozinha: se é mudável, porque é que não muda
sozinho? Isso é avanço, e não repetição.

#### 4.6 · Continuidade

Uma peça sobre o mecanismo da transmissão (sistémica) abre a pergunta sobre o que é
fixo; a peça seguinte responde com a epigenética e a plasticidade (neurocientífica);
a terceira pergunta o que exige de quem decide interromper (transpessoal, com o
assentimento); e a quarta volta ao concreto, ao genograma.

## 5. Amostra B: um assunto pobre

### Assunto: *dar e receber nas relações*

**82 entradas**, apenas duas bases: sistémica (55) e transpessoal (26). Neurociência: 1.
Psicologia: 0. Área: Relações amorosas.

#### 5.1 · As entradas

- Constelação Familiar Sistémica › O Constelador Familiar e as Técnicas... › *As Forças do Amor*
- Constelação Familiar Sistémica › O Constelador Familiar... › *Frases de Solução*
- Constelação Familiar Sistémica › Definindo e Entendendo... › *A2 Inocência Paralisante e Culpa que Faz Crescer*
- Psicologia Transpessoal › Mitologia, Simbolismo e Terapia Junguiana › *Jornada do Herói em Diferentes Mitologias*

#### 5.2 · Contributo das bases

- **Sistémica:** a lei do equilíbrio, e sobretudo o detalhe de que a relação se mantém
  pelo ligeiro excesso e não pela entrega total. Uma entrada regista-o assim: *"a aula diz
  explicitamente que a relação se mantém pelo ligeiro excesso, não pela entrega total"*.
- **Transpessoal:** o conflito entre o mito que se vive e o desejo de intimidade.
- **Neurocientífica e psicológica:** praticamente nada. É a lacuna.

#### 5.3 · Pergunta central

**Porque é que receber custa mais do que dar?**

#### 5.4 · Conteúdos anteriores

Mesmo limite do ponto 4.4.

#### 5.5 · O avanço possível

Esta área precisa de material antes de precisar de método. É o exemplo claro de
**o que falta carregar**: sem base neurocientífica nem psicológica, qualquer sequência
sobre relações amorosas vai repetir o mesmo registo.

#### 5.6 · Continuidade

Fica em aberto até a área ter mais de uma base a sustentá-la.

## 6. O que já existe na app

- O Banco de Produto com 1742 entradas e o **texto integral** de cada uma.
- `curso`, `cadeira` e **`aula`** em todas as entradas do banco interno.
- As sínteses integrais, transcrições, resumos, objetivos e flashcards por aula.
- A ponte automática para o outro repositório, em duas camadas.

## 7. O que precisa de ser acrescentado

1. **A `aula` perde-se na exportação.** O banco interno tem o campo; `saber.json` não.
   Linha 522 de `scripts/gerar-conteudo.mjs`. Sem isto, o requisito de citar a aula de
   origem é impossível do lado de lá. Correção de uma linha.
2. **As seis áreas não existem como classificação.** Hoje há cinco etiquetas fixas no
   extrator. A classificação por conteúdo demonstrada aqui corre fora da app.
3. **As quatro bases não existem como conceito.** Derivam do curso, por uma tabela que
   não está em lado nenhum do código.
4. **Não há registo de utilização.** Nada na Syntia sabe se uma entrada já foi usada.
   Sem isto não há histórico, e sem histórico o ponto 4 nunca se preenche.
5. **A classificação por produto está presa a um catálogo extinto.** 645 entradas
   apontam para FreeMe, SyncHim e Infonte, e a função `matchProduto` continua a
   produzi-las a cada aula nova.

## 8. O que não foi feito, e porquê

- **Não decidi o estado dos produtos.** Infonte e SyncHim estão dados como
  descontinuados por indicação tua. Dos restantes não infiro nada. O
  `ecossistema-produto.md` continua a declarar-se "retrato atual (jul 2026)" e não foi
  tocado.
- **Não reorganizei nada.** Esta amostra foi produzida por um script de leitura. O
  `conteudo.json` e o `saber.json` não foram alterados por ela.
- **Não escrevi conteúdo nem adaptei nada a voz nenhuma.**
