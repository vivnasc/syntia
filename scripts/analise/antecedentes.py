# -*- coding: utf-8 -*-
"""
Procura ANTECEDENTES CANDIDATOS no índice editorial para um assunto do banco.

LIMITE, declarado pela fonte: o índice tem títulos, ganchos e estados, não tem
textos integrais, métricas nem ligações de publicação. Por isso NÃO permite
concluir repetição semântica nem ineditismo. O resultado é uma lista de
candidatos a leitura humana, nada mais.

Uso: python3 scripts/analise/antecedentes.py "palavra" "outra palavra"
"""
import json, sys, unicodedata

def norm(s):
    s = unicodedata.normalize("NFD", (s or "").lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")

d = json.load(open("contexto/coordenacao/indice-editorial-91-registos.json", encoding="utf-8"))
chaves = [norm(k) for k in sys.argv[1:]]
if not chaves:
    print(__doc__); sys.exit(0)

PUBLICADO = ("publicado_ou_presente_instagram",)
achados = []
for e in d["entries"]:
    campo = norm((e.get("title") or "") + " " + (e.get("hook") or ""))
    if any(k in campo for k in chaves):
        achados.append(e)

print(f"{len(achados)} antecedente(s) candidato(s) em {d['count']} registos\n")
for e in achados:
    est = e.get("state") or ""
    marca = "PUBLICAÇÃO INDICADA" if any(p in est for p in PUBLICADO) else "sem publicação comprovada"
    print(f"  [{e['id']}] {e['title']}")
    if e.get("hook"): print(f"        gancho: {e['hook']}")
    print(f"        estado: {est}")
    print(f"        -> {marca}; comparação POR COMPLETAR (sem corpo de texto)\n")
