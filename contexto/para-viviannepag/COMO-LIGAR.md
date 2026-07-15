# Como fechar a ponte (lado do viviannepag)

Já tens a outra metade construída. Estes ficheiros vivem AQUI (Syntia) só como
entrega — copia-os para o repo `viviannepag`.

## Passo 1 — publicar o catálogo no viviannepag
Copia `catalogo.json` (a par) para o `viviannepag`, em **`public/catalogo.json`**.
Fica servido em `https://viviannedossantos.com/catalogo.json`.

> É a fotografia atual do catálogo (jul 2026), tirada do teu Levantamento. Depois,
> se quiseres, um Claude nesse repo troca este ficheiro estático por uma rota
> `app/api/catalogo/route.ts` que o gera a partir do `seed-produtos` — aí nunca mais
> lhe tocas à mão. Mas para começar, o ficheiro estático já liga tudo.

## Passo 2 — o SABER já está publicado (aqui, Syntia)
`https://<site-syntia>/saber.json` — as matérias das cadeiras + o banco de ideias.

## Passo 3 — o motor lê os dois
No motor de propostas (o teu GPT/app), junta ambos ao contexto:

```js
const [saber, catalogo] = await Promise.all([
  fetch("https://<site-syntia>/saber.json").then(r => r.json()),
  fetch("https://viviannedossantos.com/catalogo.json").then(r => r.json()),
]);
// saber.materias  -> a matéria-prima das aulas
// saber.banco     -> ideias de conteúdo já extraídas, com o tema e a coleção-alvo
// catalogo.colecoes / catalogo.livros / catalogo.guias -> os produtos REAIS
// catalogo.abolidos -> o que o motor deve IGNORAR (Método VS, contas antigas)
```

A partir daqui: mudas um produto no viviannepag e regeneras o `catalogo.json` →
o motor vê logo. Processas uma aula na Syntia → o `saber.json` atualiza → o motor
vê logo. **Zero cópia manual.**

## (Opcional) sincronização automática
Uma GitHub Action num dos repos pode fazer `fetch` do outro e commitar, se quiseres
o círculo totalmente fechado sem dependeres do motor externo.
