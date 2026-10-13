# Metodologia: áreas da vida × bases de conhecimento × histórico

> **Estado:** proposta para validação, **revista** em 13 de outubro de 2026 após a
> revisão GPT-0001 e GPT-0002 no PR #67. Demonstrada com dados reais do Banco de Produto
> (1742 entradas). Nada foi reorganizado. Nenhum post foi criado, nenhum pilar, público
> ou oferta foi decidido.
>
> **O que mudou nesta revisão:** a atribuição de base por curso foi despromovida de
> diagnóstico a convenção da primeira amostra. A secção 3 passa a ser resultado histórico
> dessa convenção, e as conclusões que dependiam dela estão assinaladas e retiradas. A
> secção 3-A traz a contraprova e os denominadores. A secção 4.5 foi reescrita.

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

> ⚠️ **Esta tabela é a convenção da primeira amostra, não uma classificação.** Ver 3-A.

~~Há aqui um desequilíbrio a assumir: a base psicológica tem apenas uma cadeira
(Neuropsicanálise, 12 entradas). Ou se aceita que ela é hoje residual, ou se reclassifica
Psicologia e Espiritualidade como psicológica em vez de transpessoal. É uma decisão tua.~~
**Pedido retirado em 13 out 2026.** Era pedir uma caixa única onde não há caixa única: um
curso contém contributos de várias bases, e a contagem de 12 entradas é um resultado da
convenção, não uma propriedade da cadeira.

## 3. O cruzamento pela convenção "uma base por curso" (resultado histórico)

> ⚠️ **Esta matriz é o resultado da primeira convenção, conservado para registo.** As
> colunas são **curso de origem agrupado**, não base de conhecimento. A contraprova está
> em 3-A. Não ler coluna a coluna.

Contagem por área candidata recuperada por marcadores e por grupo de cursos da convenção:

| Área | sistémica | transpessoal | psicológica | neurocientífica | total |
|---|---:|---:|---:|---:|---:|
| Família e pertença | 266 | 168 | 0 | 58 | 492 |
| Relações amorosas | 135 | 74 | 1 | 11 | 221 |
| Maternidade | 346 | 404 | 8 | 187 | 945 |
| Corpo e experiência emocional | 132 | 183 | 9 | 180 | 504 |
| Prosperidade, trabalho e vocação | 101 | 138 | 0 | 18 | 257 |
| Identidade, sentido e espiritualidade | 39 | 268 | 1 | 19 | 327 |

Uma entrada pode servir mais do que uma área, por isso os totais somam mais do que 1742.

~~O que esta matriz mostra de imediato:~~ **Conclusões retiradas em 13 out 2026.**
Dependiam todas de tratar a coluna como base de conhecimento, e por isso caem com 3-A:

- ~~Maternidade é a única área com as quatro bases povoadas.~~
- ~~Relações amorosas é das mais pobres, e falta-lhe material.~~ A contagem mede a
  recuperação do classificador, não a suficiência do conhecimento. **Não se pede material
  novo com base nela.**
- ~~Identidade vive quase só da base transpessoal.~~ Não demonstrado.
- ~~Família e pertença não tem nenhuma entrada da base psicológica.~~ Não demonstrado.

O que sobrevive, porque não depende da convenção: as áreas foram recuperadas por
marcadores no texto e **214 entradas não tiveram nenhuma área recuperada por este
classificador de áreas**. Não confundir com as 767 sem marcador de base em 3-A: são campos
e procedimentos diferentes; a sobreposição entre os conjuntos não foi medida. Em ambos os
casos é um limite do classificador, não uma afirmação sobre o conhecimento.

## 3-A. Contraprova: a base não é propriedade do curso

Script: `scripts/analise/classificar-bases-por-entrada.py`. Classifica cada entrada por
marcadores de conceito no texto, ignorando o curso. Denominadores, exclusivos e a somar
1742:

| | entradas |
|---|---:|
| com marcador, a base do curso está presente | 605 |
| com marcador, a base do curso **está ausente** | 365 |
| com marcador, curso fora da tabela de bases (ROTA100K) | 5 |
| sem nenhum marcador de base | 767 |
| **soma** | **1742** |

Transversal a estes grupos, **206 entradas** mostram mais do que uma base.

**Como ler os 365:** significam ausência de marcador lexical, **não erro comprovado**.
São candidatos a revisão humana, não um segundo diagnóstico automático.

Exemplo concreto, em
`cursos/01-constelacao-sistemica/pensamento-sistemico-teoria/produto/U1_As_Origens_do_Pensamento_Sist_mico.md`:
a aula é dos cinco axiomas da comunicação, do duplo vínculo e da causalidade circular.
Pela convenção a entrada é sistémica; os marcadores no texto são psicológicos. Não é
preciso escolher: **a entrada é candidata às duas**, e é isso que a convenção não permitia
dizer. Candidata, não classificada: cada atribuição fica por justificar, como em 5-B.

**Classificação por entrada, proposta e não taxonomia:** manter `curso` e `cadeira` como
proveniência, e acrescentar `bases[]` com zero ou mais, `areas[]` com sobreposição
permitida, e `confianca` por atribuição, distinguindo *marcador lexical encontrado* de
*classificação revista por leitura do conceito*.

## 4. Amostra A: um assunto recuperado em quatro grupos de cursos

### Assunto: *o que se herda sem saber*

**432 candidatos recuperados**, distribuídos pelos quatro grupos de cursos da convenção histórica. Isto não confirma quatro bases em cada entrada nem a pertinência de todos os candidatos. Áreas candidatas que atravessa: Família e pertença,
Maternidade, Identidade.

#### 4.1 · As entradas que o alimentam

Grupo de cursos «sistémica» da convenção histórica (159 candidatos), por aula de origem:

- Constelação Familiar Sistémica › Explorando o Pensamento Sistémico e a Teoria dos Sistemas › *Terapia Constelação Familiar* (9)
- Constelação Familiar Sistémica › Definindo e Entendendo as Constelações Familiares › *A1 Definição e Elaborações Importantes* (8)
- Constelação Familiar Sistémica › Mudança Epistemológica e Introdução ao Pensamento Sistémico › *A2 Genograma* (7)
- Constelação Familiar Sistémica › Definindo e Entendendo as Constelações Familiares › *A2 Relacionamento Entre Pais e Filhos* (6)

Grupo de cursos «transpessoal» da convenção histórica (182 candidatos):

- Psicologia Transpessoal › Técnicas Transpessoais: Constelação Familiar › *A2 Constelação Sistémica, Pressupostos Teóricos e de Intervenção* (15)
- Psicologia Transpessoal › Transpessoal: História e Fundamentos › *Ciência, Espiritualidade, Física Quântica* (6)
- Psicologia Transpessoal › Técnicas Transpessoais: Astrologia › *A7 As Oitavas Superiores do Psiquismo Humano* (6)

Grupo de cursos «neurocientífica» da convenção histórica (88 candidatos):

- Neurociências do Desenvolvimento Humano › O Cérebro do Adulto e do Idoso › *A3 Mecanismos Epigenéticos* (6)
- Neurociências do Desenvolvimento Humano › O Cérebro do Adulto e do Idoso › *A8 Plasticidade Neuronal* (4)
- Neurociências do Desenvolvimento Humano › Doenças Neurológicas em Crianças e Adolescentes › *A2 Neurobiologia do Transtorno do Espectro Autista*

Grupo de cursos «psicológica» da convenção histórica (3 candidatos): Neuropsicanálise › Neuroanatomia e Neurofisiologia › U2 e U3.

#### 4.2 · O contributo de cada base

> Cada linha diz o que **aquele modelo afirma**, não o que está demonstrado. O estatuto
> de evidência difere entre eles e não se equipara.

- **Sistémica: o que o modelo afirma.** Propõe como mecanismo de transmissão o pertencimento,
  lealdade, emaranhamento, o excluído que volta por alguém que entrou depois dele no
  grupo. O genograma dá-lhe forma visível.
- **Transpessoal: permite alargar.** Coloca a herança para além da família biológica, com
  o inconsciente coletivo, os arquétipos e o campo. É a base que impede que a herança
  seja lida apenas como história de casa.
- **Neurocientífica: o que a investigação mede.** A epigenética distingue código genético
  de expressão dos genes. Uma entrada diz, literalmente: *"podes ter os mesmos genes e uma vida
  completamente diferente"*. É aqui que a plasticidade entra como contraponto.
- **Psicológica:** contributo não estabelecido pela leitura desta amostra. A contagem por curso não demonstra uma lacuna de conhecimento.

#### 4.3 · Pergunta central

**O que é que herdei que não é destino?**

Sustenta sequência porque obriga a separar três coisas que normalmente aparecem
juntas: o que se repete, o que se transmite e o que se pode mudar.

#### 4.4 · Conteúdos anteriores relacionados

**Parcialmente verificável desde 13 out 2026.** O índice editorial de 91 registos está
agora em `contexto/coordenacao/`. Dá antecedentes candidatos por título e gancho, e a
distinção entre produzido e publicado. Não dá corpo de texto, por isso a comparação
semântica fica por completar. Ver 5-D.

**Histórico anterior a essa data:** Este repositório tem 25 ficheiros em `inspiracao/`
(11 ideias, 3 legendas, 11 transcrições), que são referências recolhidas, não registo de
publicação. O acervo e os guiões vivem no outro repositório. Enquanto esse registo não
estiver acessível à Syntia, o ponto 4 de qualquer dossiê fica por preencher, e nenhuma
proposta pode afirmar que um assunto é novo.

#### 4.5 · O avanço possível

> ⚠️ **Reescrito em 13 out 2026.** A versão anterior propunha como avanço a "tensão"
> entre lealdades sistémicas e epigenética. **Retirada.** São níveis e estatutos de
> conhecimento diferentes, e pô-los em tensão fazia a epigenética servir de prova a uma
> leitura de constelações. Expressão genética, aprendizagem e transmissão familiar não
> são sinónimos.

O argumento *"carregas o que não é teu"* está dado, e tu dizes que está saturado.
**Essa saturação não foi demonstrada pelo acervo consultado**, e o índice não permite
atribuí-la à produção ou à publicação: fica como afirmação tua, não como resultado. O que a
amostra permite propor não é outro cenário para o mesmo argumento, nem uma síntese entre
registos. É registar, lado a lado e **com o estatuto de cada um identificado**, o que cada registo
afirma, onde divergem e onde cada um pára: o que a leitura sistémica descreve, o que a
biologia mede, e o que nenhuma das duas sustenta. Lado a lado não é equivalente: uma
proposta interpretativa e um resultado medido não têm o mesmo peso probatório, e dizer
isso faz parte do conteúdo.

#### 4.6 · Continuidade

Uma peça sobre o que o modelo sistémico propõe como transmissão abre a pergunta sobre o
que é fixo; a seguinte
pode trazer o registo biológico **como registo distinto e não como confirmação**; a
terceira pode nomear o que fica por decidir. Nenhuma série exige quatro bases, e
acrescentar uma base só para dar aparência de autoridade é o contrário do método.

## 5. Amostra B: um assunto com recuperação limitada pelo procedimento

### Assunto: *dar e receber nas relações*

**82 candidatos recuperados** (pertinência e cobertura por verificar), distribuídos pelos grupos de cursos da convenção histórica: «sistémica» (55), «transpessoal» (26), «neurocientífica» (1) e «psicológica» (0). São contagens por origem agrupada, não bases confirmadas nem medida de suficiência. Área candidata: Relações amorosas.

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
- **Neurocientífica e psicológica:** o classificador não recuperou praticamente nada.
  Resultado da recuperação, não ausência comprovada de material pertinente.

#### 5.3 · Pergunta central

**Porque é que receber custa mais do que dar?**

#### 5.4 · Conteúdos anteriores

Mesmo limite do ponto 4.4.

#### 5.5 · O avanço possível

> ⚠️ **Corrigido.** A versão anterior concluía que "esta área precisa de material". Não
> se conclui falta de material a partir de uma contagem por palavras-chave. **Retirada.**

O que se pode afirmar: a pesquisa por palavras-chave recuperou **82 candidatos; a
pertinência e a cobertura estão por verificar**. Pode haver falsos positivos entre eles e
entradas pertinentes de fora. A mesma ressalva vale para todas as contagens das amostras A
e B. Antes de qualquer pedido de material novo, é preciso identificar os conceitos
distintos já presentes e as lacunas específicas. Um desenvolvimento rigoroso com uma só
base pertinente é legítimo.

#### 5.6 · Continuidade

Fica em aberto. A continuidade não depende de um número mínimo de bases: depende de haver
uma pergunta sustentada por conceitos pertinentes e de existir comparação editorial
disponível para saber o que já foi dito.

## 5-B. As cinco entradas da amostra, com caminho consultável

Cada entrada do banco vem de um ficheiro `produto/`, e tem ao lado a síntese e a
transcrição integrais com o mesmo nome. Os caminhos abaixo estão completos e são
verificáveis no repositório, na versão `405d60796bb98a4d41a2cdcf925422ad77ec06d3`.

**Um ficheiro `produto/` contém várias aplicações.** A entrada da amostra é o parágrafo
citado, não o ficheiro inteiro: localiza-se pela primeira frase do excerto. A classificação é **candidata**, e a última coluna regista o que a entrada
**não** demonstra, para a aplicação não ser lida como conclusão.

### 1 · Comunicação e causalidade circular
- produto: `cursos/01-constelacao-sistemica/pensamento-sistemico-teoria/produto/U1_As_Origens_do_Pensamento_Sist_mico.md`
- síntese: `cursos/01-constelacao-sistemica/pensamento-sistemico-teoria/sinteses/U1_As_Origens_do_Pensamento_Sist_mico.md`
- transcrição: `cursos/01-constelacao-sistemica/pensamento-sistemico-teoria/transcricoes/U1_As_Origens_do_Pensamento_Sist_mico.txt`
- aula: *As Origens do Pensamento Sistémico* · etiqueta atual `amor` · produto antigo `Livros`
- conceitos: cinco axiomas da comunicação, duplo vínculo, causalidade circular, pontuação das sequências
- área candidata: Relações amorosas · bases candidatas: psicológica e sistémica, sobreposição a justificar
- **limite:** os axiomas não demonstram a tese de que "casais não morrem por falta de amor, morrem por dessincronia". Essa tese é interpretação de catálogo, não achado da aula.

### 2 · Genograma
- produto: `cursos/01-constelacao-sistemica/mudanca-epistemologica/produto/U4_A2_Genograma_P1.md`
- síntese: `cursos/01-constelacao-sistemica/mudanca-epistemologica/sinteses/U4_A2_Genograma_P1.md`
- transcrição: `cursos/01-constelacao-sistemica/mudanca-epistemologica/transcricoes/U4_A2_Genograma_P1.txt`
- aula: *A2 Genograma* · etiqueta `maternidade` · produto antigo `FreeMe Mãe`
- conceito sustentado pelo exemplo consultado: o genograma como instrumento.
- aplicação contestada: padrão materno através de gerações; não sustentado pelo exemplo citado, que se refere à mesma mãe.
- áreas candidatas: Família e pertença, Maternidade
- ⚠️ **DIVERGÊNCIA ENTRE APLICAÇÃO E FONTE, verificada em 13 out 2026.** A aplicação
  original situa o acontecimento numa geração anterior; o exemplo consultado na transcrição
  situa-o **na história da mesma mãe**: um filho, depois um abortamento, e a relação com
  esse filho vivo altera-se a seguir. Conservar o original e **não usar este exemplo como
  demonstração transgeracional**. O ficheiro `produto/` não foi reescrito.

### 3 · Genética e epigenética
- produto: `cursos/04-neurociencias-desenvolvimento-humano/doencas-neurologicas-criancas-adolescentes/produto/U2_A2_Neurobiologia_do_Transtorno_do_Espectro_Autista.md`
- síntese: `cursos/04-neurociencias-desenvolvimento-humano/doencas-neurologicas-criancas-adolescentes/sinteses/U2_A2_Neurobiologia_do_Transtorno_do_Espectro_Autista.md`
- transcrição: `cursos/04-neurociencias-desenvolvimento-humano/doencas-neurologicas-criancas-adolescentes/transcricoes/U2_A2_Neurobiologia_do_Transtorno_do_Espectro_Autista.txt`
- aula: *A2 Neurobiologia do Transtorno do Espectro Autista* · **sem etiqueta** · produto antigo `Oportunidade`
- conceito: distinção entre genética e epigenética
- base candidata: neurocientífica · a ligação à herança familiar é **aplicação proposta**, não classificação validada
- **limite:** a frase da aplicação não demonstra que a epigenética valide uma premissa editorial nem uma leitura de constelações.

### 4 · Críticas à transpessoal
- produto: `cursos/02-psicologia-transpessoal/historia-fundamentos/produto/U3_Aula01_Psicologia-Transpessoal-Cr_ticas-_Perspectivas-para-Teoria-ParteII.md`
- síntese: `cursos/02-psicologia-transpessoal/historia-fundamentos/sinteses/U3_Aula01_Psicologia-Transpessoal-Cr_ticas-_Perspectivas-para-Teoria-ParteII.md`
- transcrição: `cursos/02-psicologia-transpessoal/historia-fundamentos/transcricoes/U3_Aula01_Psicologia-Transpessoal-Cr_ticas-_Perspectivas-para-Teoria-ParteII.txt`
- aula: *Psicologia Transpessoal, Críticas e Perspectivas para a Teoria, Parte II* · etiqueta `amor` · produto antigo `SyncHim`
- conceito: legitimidade do trabalho com padrões relacionais fora dos critérios positivistas de mensuração
- área candidata: Identidade, sentido e espiritualidade · enquadramento epistemológico
- **limite:** um argumento sobre legitimidade não comprova eficácia nem mecanismo.

### 5 · Jung e os modelos de amor
- produto: `cursos/02-psicologia-transpessoal/historia-fundamentos/produto/U1_Aula01_Fundamentos-Hist_ricos-Psicologia-Transpessoal-_Grof-a-Maslow-ParteIV.md`
- síntese: `cursos/02-psicologia-transpessoal/historia-fundamentos/sinteses/U1_Aula01_Fundamentos-Hist_ricos-Psicologia-Transpessoal-_Grof-a-Maslow-ParteIV.md`
- transcrição: `cursos/02-psicologia-transpessoal/historia-fundamentos/transcricoes/U1_Aula01_Fundamentos-Hist_ricos-Psicologia-Transpessoal-_Grof-a-Maslow-ParteIV.txt`
- aula: *Fundamentos Históricos da Psicologia Transpessoal, de Grof a Maslow, Parte IV* · **sem etiqueta** · produto antigo `Oportunidade`
- conceitos: inconsciente coletivo, individuação junguiana
- área candidata: Identidade, sentido e espiritualidade · Relações amorosas **por confirmar**
- **limite:** o inconsciente coletivo não é o mesmo que a afirmação de que o modelo de amor foi aprendido antes de qualquer relação. A transcrição tem de sustentar essa ligação.

Duas das cinco (3 e 5) não têm etiqueta nenhuma e estão entre as 214 sem área
reconhecida. É o argumento mais forte a favor de tratar as contagens como medida do
classificador.

## 5-C. Uma observação sobre o catálogo, com prova

São duas coisas distintas e convém não as confundir:

- **Repetição literal de texto:** não há. As 1742 entradas têm texto distinto.
- **Repetição da tese:** a frase *"casais não morrem por falta de amor, morrem por
  dessincronia"* aparece em três ficheiros `produto/` de **dois cursos diferentes**, num
  deles identificada como "a tese-mãe da SyncHim".

Textos diferentes não demonstram ideias diferentes. O que se observa é a mesma tese
comercial invocada a partir de aulas diferentes, com cada aula lida como se a validasse.
Na entrada 1 isso é verificável: os axiomas e a pontuação das sequências estão na fonte;
a frase sobre dessincronia está só na aplicação.

Isto não é inferência sobre o catálogo. É o que está nos ficheiros, e mostra por que
razão organizar conhecimento por nome de produto encaminha o conhecimento para a tese em
vez de o contrário.

## 6-A. Nota de reprodutibilidade

`lib/conteudo.json` **não está no repositório** (`.gitignore`, linha 7). Gera-se com
`node scripts/gerar-conteudo.mjs`. É a razão pela qual uma leitura externa devolve 404.

`public/saber.json` está versionado e tem as 1742 entradas, mas **não tem o campo
`aula`**, pelo que não permite verificar as atribuições de aula desta amostra. É o mesmo
defeito registado em 7.1. Os dois scripts de análise aceitam `--saber` para correr sobre
o ficheiro versionado, com essa limitação.

## 5-D. O histórico, agora que existe

`contexto/coordenacao/indice-editorial-91-registos.json`, publicado com autorização
expressa de 13 out 2026. Tem 91 registos com título, gancho e estado. **Não tem textos
integrais, métricas nem ligações de publicação**, e os estados não foram reconfirmados na
transferência. Pela declaração da própria fonte, não permite concluir repetição semântica
nem ineditismo. Serve para **localizar antecedentes candidatos**, e é assim que é usado.

Script: `scripts/analise/antecedentes.py`.

### A distinção que faltava: produzido não é publicado

Pelos estados do próprio índice, e com a ressalva de que uma indicação histórica de
publicação não é verificação atual:

| estado preservado no índice | registos |
|---|---:|
| com indicação histórica de publicação ou presença no Instagram | **18** |
| **sem esse marcador** | **73** |
| total | 91 |

~~Quatro em cada cinco registos estão do lado do produzido.~~ **Retirado em 13 out 2026.**
Não decorre dos estados. Os 73 repartem-se por: 28 que remetem para consulta do registo
original (**estado desconhecido**), 23 rascunhos anteriormente aprovados sem publicação
comprovada, 19 em teste no Instagram sem correspondência inequívoca, e 3 rejeitados ou
versões históricas. Ausência do marcador **não demonstra produção concluída**: produção e
publicação são dimensões separadas, e ficam desconhecidas onde a fonte não as estabelece.

### Os temas ditos saturados, por este índice

Índice consultado: `a93ac91`. Os agrupamentos temáticos são **convenção minha**, não da
fonte: o índice não os tem. Os termos abaixo são os usados em cada consulta, contra título
e gancho, e os IDs permitem reproduzir linha a linha.

| tema (convenção minha) | termos da consulta | IDs recuperados | n | com marcador de publicação |
|---|---|---|---:|---|
| limites e disponibilidade | `limite` `disponivel` `dizer que nao` `nao podes` `cansada` `descansar` | A02, A03, A04, A48 | 4 | 0 |
| excesso de responsabilidade | `ajudar` `ajuda` `responsab` `resolves` `carregar` `cuidar` | R06, R10, A01, A11, A38, A47, C01 | 7 | 1 (A38) |
| diminuir-se | `desculp` `equilibrar` `nunca conseguiu` `merec` `espelho` `sou mesmo assim` | R04, R08, A07, A08 | 4 | 0 |
| culpa | `culpa` | A25 | 1 | 0 |
| família e lugar | `familia` `lugar` `sistema familiar` `geracoes` | A06, A26, A28, A33, A48, A57 | 6 | 0 |
| aprovação dos outros | `aprovac` `desaprovac` `elogio` `opiniao` | R02, S02A, A09 | 3 | 0 |

**Leitura possível, não conclusão:** a saturação percebida pode ser de **produção** e não
de **publicação**. Isto não se decide por contagem de títulos, e sem o corpo dos textos
não se compara argumento com argumento. É exatamente o tipo de pergunta que precisa de
leitura humana, e fica registada como tal.

### Exemplo na entrada 2 da amostra (genograma, herança materna)

Quatro antecedentes candidatos. **Nenhum tem, neste índice, o marcador de publicação.**
Isto não significa que não tenham sido publicados: significa que o índice não o regista.
Os estados ficam como estão, sem promoção a aprovação ou publicação atual:

- `A06` *Na tua família, quem podia ser diferente sem perder o lugar?* (rascunho aprovado)
- `A26` *Há coisas que uma família nunca diz, e que ainda assim todos aprendem.* (rascunho aprovado)
- `A28` *Conhecer a tua família não é o mesmo que conhecer o lugar que ocupas nela.* (rascunho aprovado)
- `A48` *Eu a tentar descansar 10 minutos sem achar que o meu sistema familiar vai ruir.* (em teste)

Comparação **por completar** em todos: há título e gancho, não há corpo.

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
4. **Não há ligação entre as entradas do banco e as utilizações.** Nada na Syntia sabe se
   uma entrada já foi usada. O índice editorial de 91 registos, publicado em 13 out 2026,
   dá antecedentes candidatos por título e gancho (ver 5-D), mas é parcial e não se liga às
   entradas: continua a faltar essa ligação, e sem corpo de texto a comparação fica sempre
   por completar.
5. **A classificação por produto depende de nomes de produto**, com Infonte e SyncHim
   declarados descontinuados pela Vivianne e os restantes estados **não inferidos**. 645 entradas
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
