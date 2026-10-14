# -*- coding: utf-8 -*-
import json, unicodedata, sys, collections
def norm(s):
    s = unicodedata.normalize("NFD", (s or "").lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")
BASE = {"Constelação Familiar Sistémica":"sistémica","Psicologia Transpessoal":"transpessoal",
        "Psicologia e Espiritualidade":"transpessoal","Neurociências do Desenvolvimento Humano":"neurocientífica",
        "Neurociências Cognitivas e Processos Psicológicos":"neurocientífica","Neuropsicanálise":"psicológica"}
banco = json.load(open("lib/conteudo.json", encoding="utf-8"))["banco"]
ks = [norm(k) for k in sys.argv[1:]]
ach = [e for e in banco if any(k in norm(e["texto"]) for k in ks)]
por = collections.defaultdict(list)
for e in ach:
    b = BASE.get(e.get("cursoTitulo"))
    if b: por[b].append(e)
for b in ["sistémica", "transpessoal", "neurocientífica", "psicológica"]:
    if not por[b]: continue
    print(f"\n{'='*92}\nBASE {b.upper()}  ({len(por[b])} entradas)\n{'='*92}")
    vistos = collections.Counter()
    for e in por[b]:
        ch = (e.get("areaTitulo"), e.get("aula"))
        vistos[ch] += 1
    for (area, aula), n in vistos.most_common(6):
        cad = area.split("·")[-1].strip() if area else "?"
        cur = area.split("·")[0].strip() if area else "?"
        print(f"  [{n:2}] {cur} › {cad}\n       aula: {aula}")
