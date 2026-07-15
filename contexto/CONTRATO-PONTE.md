# Contrato da Ponte — Syntia (SABER) ⇄ Produtos (Catálogo)

Objetivo: acabar com o trabalho duplo. Cada repo é **dono** de uma coisa, publica-a
como artefacto, e consome a do outro. Ninguém copia nada à mão.

```
  Syntia (este repo)                 Produtos (viviannedossantos.com)
  ─ dono do SABER                    ─ dono do CATÁLOGO
  ─ publica /saber.json  ───────────▶ o motor lê o SABER daqui
  o motor lê o catálogo daqui ◀─────  ─ publica /catalogo.json
                     ╲               ╱
                      ╲   MOTOR de  ╱
                       ▶ propostas ◀   (cruza SABER × CATÁLOGO → conteúdos)
```

## 1. O que a Syntia (este repo) JÁ publica: `/saber.json`

Gerado no build por `scripts/gerar-conteudo.mjs`, servido em
`https://<site-syntia>/saber.json`. Forma:

```json
{
  "geradoEm": "ISO-8601",
  "fonte": "Syntia · pós-graduações …",
  "materias": [
    { "curso": "…", "cadeiras": [
      { "cadeira": "…", "unidades": [
        { "n": 1, "objetivos": "md", "resumo": "md", "aulas": ["título", …] }
      ] }
    ] }
  ],
  "banco": [
    { "temas": ["amor"], "produto": "SyncHim", "ideia": "…", "texto": "…", "curso": "…", "cadeira": "…" }
  ]
}
```

`materias` = a matéria-prima (objetivos + resumo + títulos de aula por unidade).
`banco` = as ideias de produto já extraídas, com o tema e o universo de produto a que
apontam. É isto que o motor cruza com o catálogo.

## 2. O que o repo dos Produtos deve publicar: `/catalogo.json`

Fonte de verdade lá dentro: `app/api/admin/seed-produtos/route.ts` (só `publicado: true`),
`lib/colecoes.ts`, `lib/packs.ts`, `lib/instagram/contas.ts`. Forma sugerida:

```json
{
  "geradoEm": "ISO-8601",
  "livros":    [ { "id": "os-7-sinais-de-desencaixe", "titulo": "…", "preco": "€14", "porta": "O Limiar" } ],
  "colecoes":  [ { "id": "freeme-mae", "titulo": "FreeMe Mãe", "tema": "maternidade", "ebooks": [ { "slug": "mae-01", "titulo": "Amar sem carregar" } ] } ],
  "guias":     [ { "slug": "guia-01-meu", "titulo": "…", "preco": "€5" } ],
  "ebooks":    [ { "slug": "ebook-01-culpa", "titulo": "…", "preco": "€7" } ],
  "packs":     [ { "id": "pack-freeme-mae", "titulo": "…", "preco": "€40" } ],
  "contas":    [ { "handle": "@vivianne.dos.santos", "papel": "mae.cine", "vende": false } ],
  "abolidos":  ["metodo-vs", "os-sete-veus", "ver.soltar", "vir.soltar", "viver.soltar"]
}
```

Uma rota `GET /api/catalogo` ou um ficheiro em `public/catalogo.json` gerado no build
(a partir do seed) — o que for mais simples lá.

## 3. Como cada lado consome o do outro

- **Motor de propostas** (externo/GPT/app): faz `fetch(SABER_URL)` e `fetch(CATALOGO_URL)`
  e usa ambos como contexto. É o único que precisa dos dois ao mesmo tempo.
- **Opcional (fechar o círculo aqui):** este repo pode, no build, fazer `fetch(CATALOGO_URL)`
  e gerar o `ecossistema-produto.md` a partir dele — assim nunca mais fica desatualizado à
  mão. Enquanto o `catalogo.json` não existir, o `ecossistema-produto.md` é mantido à mão
  (foi atualizado em jul 2026 com o Levantamento).

## 4. Estado

- [x] `saber.json` publicado por este repo.
- [x] `ecossistema-produto.md` atualizado (jul 2026) — Método VS fora, 7 coleções dentro.
- [ ] `catalogo.json` publicado pelo repo dos produtos. **(precisa desse repo)**
- [ ] motor a fazer `fetch` dos dois. **(precisa desse repo / do motor)**
- [ ] (opcional) este repo a gerar o `ecossistema-produto.md` do `catalogo.json`.
