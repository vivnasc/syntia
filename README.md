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
contexto/ecossistema-produto.md  ← os teus produtos (alimenta o Bloco C)
scripts/processar.mjs      ← o pipeline
scripts/gerar-*.mjs        ← geração do conteúdo/ícones da PWA (no build)
.github/workflows/processar.yml  ← dispara sozinho quando há áudio novo
app/ · lib/ · public/      ← a PWA (Next.js), na RAIZ do repositório
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
2. Escolhe este repositório. Deixa o **Root Directory** em **`./`** (a raiz) — a
   app está na raiz e a Vercel deteta **Next.js** automaticamente.
3. Em **Storage**, cria um **Blob Store** e liga-o ao projeto (grátis no plano
   base). Fica a guardar os MP3 enviados e define sozinho `BLOB_READ_WRITE_TOKEN`.
4. Em **Settings → Environment Variables**, acrescenta:
   - `GITHUB_DISPATCH_TOKEN` — um *fine-grained token* do GitHub (github.com →
     Settings → Developer settings → Fine-grained tokens), com acesso ao
     repositório `syntia` e permissão **Actions: Read and write**. É o que deixa
     a app arrancar o pipeline.
   - *(opcional)* `GH_REPO` — só se mudares o nome do repositório no futuro; por
     omissão é `vivnasc/syntia`.

   > O envio de aulas está **sem proteção** (qualquer pessoa com o link pode
   > enviar). Se quiseres um cadeado, define `UPLOAD_PASSCODE` e pede para o
   > reativar, ou usa a Password Protection da Vercel (Pro).
5. **Deploy.** Fica online num endereço `*.vercel.app`. No telemóvel, abre e
   **"Adicionar ao ecrã principal"**.

Sempre que o pipeline faz commit de novas sínteses, a Vercel reconstrói e
atualiza a app automaticamente.

## ③ Enviar aulas pela app (sem ir ao GitHub)

Na app, abre **"Enviar aula"**, escolhe a área, arrasta o MP3 e envia. O áudio
vai para o armazenamento, a app arranca o pipeline, e daí a alguns minutos a aula
aparece com síntese e flashcards. O MP3 fica só no armazenamento — ao
repositório vão apenas os textos gerados.

> Continuas a poder largar MP3 diretamente em `cursos/<curso>/_audio/` pelo
> GitHub, se preferires.

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
