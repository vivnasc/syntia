# DESTRAVE STORY

Curso próprio sobre stories no Instagram. Espaço de raiz, fora de `cursos/`
(que é a pós-graduação) e separado da ROTA100K e da VENDA100K.

Está no mesmo patamar da `disciplina-partilhada`: é uma raiz que a ponte lê,
por isso tudo o que entra aqui chega ao `viviannepag`.

As aulas são gravadas uma a uma, cerca de 25 minutos cada.

## Módulos

Ainda sem `modulos.json`. Enquanto não existir, as aulas sem prefixo `U<n>_`
ficam todas em "Outras aulas", como na ROTA100K.

Para as agrupar por módulo, cria um `modulos.json` aqui, a mapear número de
unidade para nome do módulo, e carrega cada aula com o prefixo da unidade:

    { "1": "Nome do primeiro módulo", "2": "Nome do segundo" }

O nome do módulo é o que chega ao `saber.json` e ao `INDICE.md` do saber, e é
por aí que os agentes o encontram.

Estrutura (criada pelo processamento, não à mão):

    destrave-story/
      modulos.json    nomes dos módulos (à mão, este sim, e opcional)
      transcricoes/   texto bruto das aulas
      sinteses/       Bloco A + B
      produto/        Bloco C — o que alimenta os produtos
      resumos/
      objetivos/
      _material/      PDFs de apoio
