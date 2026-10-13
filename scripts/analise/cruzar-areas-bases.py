# -*- coding: utf-8 -*-
import json, re, unicodedata, collections, sys

def norm(s):
    s = unicodedata.normalize("NFD", (s or "").lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")

BASE_POR_CURSO = {
    "Constelação Familiar Sistémica": "sistémica",
    "Psicologia Transpessoal": "transpessoal",
    "Psicologia e Espiritualidade": "transpessoal",
    "Neurociências do Desenvolvimento Humano": "neurocientífica",
    "Neurociências Cognitivas e Processos Psicológicos": "neurocientífica",
    "Neuropsicanálise": "psicológica",
    "ROTA100K": None,
}

# As 6 áreas, reconhecidas pelo CONTEÚDO do texto, não pela etiqueta.
AREAS = {
 "Família e pertença": [
   "pertenc", "exclu", "ancestr", "geraco", "transgeracion", "linhagem", "cla ", "sistema familiar",
   "lealdade", "emaranha", "arvore genealogica", "genograma", "avo", "bisav", "segredo de familia",
   "ordem de chegada", "hierarquia", "lugar no sistema", "irmao", "irma ", "adoc", "orfan"],
 "Relações amorosas": [
   "casal", "conjug", "parceir", "amoros", "relacionamento", "namor", "marido", "esposa",
   "separac", "divorcio", "infidelidade", "traic", "vinculo amoroso", "dar e receber", "compensac",
   "ex-", "parceiros anteriores"],
 "Maternidade": [
   "mae", "maes", "materna", "maternidade", "filho", "filha", "gravid", "gestac", "parto",
   "amamenta", "bebe", "crianca", "puerper", "aborto", "natimort"],
 "Corpo e experiência emocional": [
   "corpo", "somat", "doenc", "sintoma", "adoec", "sistema nervoso", "cerebro", "neuro",
   "emocao", "emocoes", "stress", "estresse", "ansiedade", "trauma", "respirac", "sensac",
   "amigdala", "cortisol", "regulac emocional", "dor "],
 "Prosperidade, trabalho e vocação": [
   "prosperidade", "dinheiro", "escassez", "abundanc", "trabalho", "profiss", "carreira",
   "vocac", "sucesso", "empresa", "organizac", "negocio", "merecimento", "sustento"],
 "Identidade, sentido e espiritualidade": [
   "identidade", "quem sou", "self", "individuac", "sentido", "proposito", "espiritual",
   "transcend", "consciencia cosmica", "alma", "fe ", "religios", "sagrado", "misti",
   "arquetip", "sombra", "niilismo", "existencial"],
}
AREAS_N = {a: [norm(k) for k in ks] for a, ks in AREAS.items()}

banco = json.load(open("lib/conteudo.json", encoding="utf-8"))["banco"]
for e in banco:
    t = norm(e["texto"])
    e["_areas"] = sorted({a for a, ks in AREAS_N.items() if any(k in t for k in ks)})
    e["_base"] = BASE_POR_CURSO.get(e.get("cursoTitulo") or e.get("curso"))

if len(sys.argv) > 1 and sys.argv[1] == "matriz":
    bases = ["sistémica", "transpessoal", "psicológica", "neurocientífica"]
    print(f"{'ÁREA':40}" + "".join(f"{b[:13]:>15}" for b in bases) + f"{'TOTAL':>8}")
    print("-" * 108)
    for a in AREAS:
        linha = [sum(1 for e in banco if a in e["_areas"] and e["_base"] == b) for b in bases]
        print(f"{a:40}" + "".join(f"{n:>15}" for n in linha) + f"{sum(linha):>8}")
    sem = sum(1 for e in banco if not e["_areas"])
    print("-" * 108)
    print(f"{'sem área reconhecida':40}{'':60}{sem:>8}")
    print(f"{'total de entradas':40}{'':60}{len(banco):>8}")
else:
    json.dump(banco, open("/tmp/claude-0/-home-user-estudos/008b197e-1cd5-5f97-8472-acad6b04ec1c/scratchpad/mapa/banco.json", "w", encoding="utf-8"), ensure_ascii=False)
    print("gravado")
