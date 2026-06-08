# SyntIA — PWA de estudo + pipeline automático de aulas

Largas ficheiros **MP3** de aulas no repositório e, sozinho, tens:
**transcrição → síntese de estudo + flashcards → ideias de produto**, tudo
visível numa app instalável (PWA). Não precisas de correr nada localmente.

---

## Estrutura

```
cursos/
  01-constelacao-sistemica/
  02-psicologia-transpessoal/
  03-psicologia-espiritualidade/
    _audio/         ← largas aqui os MP3 das aulas
    _material/      ← PDFs de referência do curso (programa SEC-CES, etc.)
    transcricoes/   ← gerado: <aula>.txt
    sinteses/       ← gerado: <aula>.md  (Bloco A + B + flashcards)
    produto/        ← gerado: <aula>.md  (Bloco C, por tema)

disciplina-partilhada/   ← comum às 3 pós, NUNCA duplicada (mesma estrutura)
  _material/             ← as 4 Unidades + a Apresentação

prompts/prompt-mestre.md   ← o prompt que orienta o Claude
scripts/processar.mjs      ← o pipeline
.github/workflows/processar.yml  ← dispara sozinho quando há áudio novo
web/                       ← a PWA (Next.js)
```

**Adicionar um curso novo** = criar uma pasta `cursos/04-...` com `_audio/` e
(opcional) `_material/`. Não se mexe em código — o pipeline e a app descobrem-na
sozinhos.

---

## ① Onde meto as chaves

As chaves **nunca** ficam no código nem na app — só nos *secrets* do GitHub,
que correm no servidor do GitHub Actions.

No GitHub: **Settings → Secrets and variables → Actions → New repository secret**
e cria estes dois:

| Nome | Onde obténs |
|------|-------------|
| `GROQ_API_KEY` | console.groq.com (transcrição Whisper, tem plano gratuito) |
| `ANTHROPIC_API_KEY` | console.anthropic.com (síntese com o Claude) |

Só isto. A partir daqui, sempre que fizeres upload de um MP3 para
`cursos/<curso>/_audio/` (ou `disciplina-partilhada/_audio/`), o GitHub Action
transcreve, passa pelo prompt-mestre — usando os PDFs de `_material/` como
referência para o Bloco B — e faz commit dos resultados. Demora alguns minutos.

> Podes também correr à mão em **Actions → Processar Aulas → Run workflow**.

---

## ② Como faço o deploy (PWA na Vercel)

1. Entra em **vercel.com**, faz login com o GitHub e **Add New → Project**.
2. Escolhe este repositório. A Vercel lê o `vercel.json` da raiz e já sabe
   construir a app em `web/` — **não precisas de configurar mais nada**.
   (Framework: Next.js · Build: `cd web && npm run build` · Output: `web/out`.)
3. **Deploy.** Fica online num endereço `*.vercel.app`.
4. No telemóvel, abre esse endereço e **"Adicionar ao ecrã principal"** —
   passa a abrir como uma app.

A app **não usa chaves nenhumas** — só lê os ficheiros já gerados no
repositório. Cada vez que o pipeline faz commit de novas sínteses, a Vercel
reconstrói e atualiza a app automaticamente.

---

## O que vês na app

- **Áreas** — as 3 pós + a disciplina partilhada; em cada uma, os PDFs de
  referência e a lista de aulas.
- **Aula** — a síntese de estudo + flashcards (pergunta → tocar para revelar).
- **Banco de Produto** — junta tudo de `produto/` e filtra por
  **corpo · amor · maternidade · prosperidade**, dizendo de que aula veio cada ideia.

---

## Notas técnicas

- Transcrição: **Groq Whisper large-v3** (pt). Áudios grandes são reamostrados
  para 16 kHz mono e divididos em troços com `ffmpeg` para caberem no limite.
- Síntese: **API do Claude** com os PDFs de `_material/` anexados como contexto
  (com *prompt caching*, para aulas seguintes do mesmo curso saírem mais baratas).
- Produto (Bloco C): se existir `contexto/ecossistema-produto.md`, é injetado na
  chamada ao Claude para as ideias de produto serem mapeadas aos produtos reais
  (Infonte, FreeMe, SyncHim, a loja/Universo) e respeitarem a voz de cada um.
- O pipeline é **idempotente**: só processa aulas que ainda não têm resultados.
- A PWA é um *site estático* (Next.js `output: export`) — rápido e barato.
