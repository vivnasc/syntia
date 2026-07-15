# Brief para uma sessão de Claude NO repo `viviannepag`

> Cola isto tal e qual numa sessão de Claude aberta no `viviannepag`. É uma ordem
> única que liga a automação — depois corre sozinha para sempre, sem copiar nada.

---

**Tarefa:** publicar o catálogo como artefacto vivo, para o motor de conteúdos (e o
repo Syntia) o poderem ler por URL, sempre atualizado a cada deploy.

1. Cria uma rota (ou um passo de build) que **gera `catalogo.json` a partir da fonte
   de verdade** — `app/api/admin/seed-produtos/route.ts` (só `publicado: true`),
   `lib/colecoes.ts`, `lib/packs.ts`, `lib/instagram/contas.ts`. Nada hardcoded: lê
   sempre do seed/coleções para nunca ficar desatualizado.

2. Serve-o em **`/catalogo.json`** (rota `app/catalogo.json/route.ts` com
   `revalidate`, ou um ficheiro escrito para `public/catalogo.json` no build). Deve
   ficar acessível em `https://viviannedossantos.com/catalogo.json`.

3. **Forma do JSON** (o motor e a Syntia esperam esta estrutura):

```json
{
  "geradoEm": "ISO-8601",
  "livros":   [ { "id", "titulo", "preco", "porta" } ],
  "ebooksFundadores": [ { "slug", "titulo", "preco" } ],
  "guias":    [ { "slug", "titulo", "preco" } ],
  "colecoes": [ { "id", "titulo", "tema", "sobre", "ebooks": [ { "slug", "titulo" } ] } ],
  "packs":    [ { "id", "titulo", "preco" } ],
  "contas":   [ { "handle", "papel", "vende": true|false } ],
  "abolidos": { "produtos": [...], "contas": [...] }
}
```

Regras: **Método VS abolido** (não incluir Os Sete Véus nem ver/vir/viver.soltar como
vivos → vão para `abolidos`). **FreeMe/Infonte/SyncHim são coleções**, não contas.

4. (Opcional, fecha o círculo dos dois lados) O motor de propostas passa a ler os dois
   artefactos vivos:

```js
const [saber, catalogo] = await Promise.all([
  fetch(SABER_URL).then(r => r.json()),      // https://<site-syntia>/saber.json
  fetch(CATALOGO_URL).then(r => r.json()),   // https://viviannedossantos.com/catalogo.json
]);
```

**Referência da estrutura já preenchida** (jul 2026): existe um `catalogo.json` de
exemplo no repo Syntia em `contexto/para-viviannepag/catalogo.json` — usa-o só para
confirmar os campos/valores esperados; a rota deve gerar o real a partir do seed.

Feito isto, a ponte fica automática: mudar um produto → deploy → o motor vê. Ninguém
copia nada.
