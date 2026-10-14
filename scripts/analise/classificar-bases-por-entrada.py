# -*- coding: utf-8 -*-
"""
Classifica cada entrada do Banco de Produto por marcadores de conceito no TEXTO,
independentemente do curso de origem. Serve para testar se a convenção
"uma base por curso" se sustenta.

Lê `lib/conteudo.json`, que é gerado por `node scripts/gerar-conteudo.mjs` e NÃO
está no repositório (.gitignore linha 7). Quem não o puder gerar pode usar
`public/saber.json`, que está versionado, mas que não tem o campo `aula`.

Uso:  python3 scripts/analise/classificar-bases-por-entrada.py [--saber]

IMPORTANTE: "a base do curso não aparece no texto" significa ausência de marcador
lexical, não erro comprovado. Os números são candidatos a revisão humana.
"""
import json, sys, unicodedata, collections

def norm(s):
    s = unicodedata.normalize("NFD", (s or "").lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")

# Convenção da primeira amostra: uma base por curso.
CURSO_BASE = {
    "Constelação Familiar Sistémica": "sistémica",
    "Psicologia Transpessoal": "transpessoal",
    "Psicologia e Espiritualidade": "transpessoal",
    "Neurociências do Desenvolvimento Humano": "neurocientífica",
    "Neurociências Cognitivas e Processos Psicológicos": "neurocientífica",
    "Neuropsicanálise": "psicológica",
    "ROTA100K": None,          # fora das bases por decisão explícita
}

# Marcadores lexicais ao nível do conceito. Lista aberta, não é taxonomia.
MARCADORES = {
    "sistémica": ["pertenc", "exclu", "emaranha", "ordens do amor", "lealdade",
                  "sistema familiar", "constelac", "genograma", "hierarquia",
                  "compensac arcaica", "clã", "transgeracion"],
    "transpessoal": ["transpessoal", "estados de consciencia", "consciencia cosmica",
                     "transcend", "arquetip", "inconsciente coletivo", "espiritual",
                     "self", "individuac", "meditac", "sagrado", "mistic"],
    "psicológica": ["psicanalis", "freud", "klein", "inconsciente", "defesa", "ego",
                    "apego", "vinculac", "comportament", "cognitiv", "aprendizagem",
                    "personalidade", "psicoterap"],
    "neurocientífica": ["cerebro", "neuronal", "neurotransmiss", "cortisol", "amigdala",
                        "epigenet", "plasticidade", "sinapse", "hormon",
                        "sistema nervoso", "neurobiolog", "cortex"],
}
MARCADORES = {k: [norm(x) for x in v] for k, v in MARCADORES.items()}

fonte = "public/saber.json" if "--saber" in sys.argv else "lib/conteudo.json"
banco = json.load(open(fonte, encoding="utf-8"))["banco"]

bate = nao_bate = fora_da_tabela = sem_marcador = 0
multiplas = 0
for e in banco:
    t = norm(e["texto"])
    bases = sorted({b for b, ks in MARCADORES.items() if any(k in t for k in ks)})
    if len(bases) > 1:
        multiplas += 1
    if not bases:
        sem_marcador += 1
        continue
    curso = e.get("cursoTitulo") or e.get("curso")
    if curso not in CURSO_BASE or CURSO_BASE[curso] is None:
        fora_da_tabela += 1
    elif CURSO_BASE[curso] in bases:
        bate += 1
    else:
        nao_bate += 1

print(f"fonte: {fonte}")
print(f"entradas .................................... {len(banco)}")
print(f"  com marcador, base do curso presente ...... {bate}")
print(f"  com marcador, base do curso ausente ....... {nao_bate}   (candidatos a revisão)")
print(f"  com marcador, curso fora da tabela ........ {fora_da_tabela}   (ROTA100K)")
print(f"  sem nenhum marcador de base ............... {sem_marcador}")
print(f"  soma ...................................... {bate+nao_bate+fora_da_tabela+sem_marcador}")
print()
print(f"transversal (não exclusivo): entradas com mais do que uma base .. {multiplas}")
