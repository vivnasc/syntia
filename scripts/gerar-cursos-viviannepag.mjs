// Gera o `lib/infografico/cursos.ts` do repo viviannepag a partir do saber.json
// da Syntia. Chamado pela GitHub Action de sincronização — a cada aula nova, os
// conceitos-chave dos cursos são reescritos automaticamente (deixam de ser à mão).
//
// Regras de segurança:
//  - Preserva a ESTRUTURA exata do ficheiro (imports, tipos, id/nome/descricao/mundo).
//  - Só mexe nos `conceitos` de cada curso.
//  - Se a Syntia ainda não tiver conceitos para um curso, mantém a lista ATUAL
//    (fallback embutido) — nunca apaga o que já tens.
//
// Uso: node scripts/gerar-cursos-viviannepag.mjs <caminho-saber.json> > cursos.ts
//
// Ligação ATIVA: o secret VIVIANNEPAG_TOKEN está criado, por isso a Action já
// escreve o cursos.ts no viviannepag a cada aula nova (sem intervenção manual).

import fs from "node:fs";

const CAP = 40; // nº máximo de conceitos por curso (mantém o ficheiro limpo)

// Metadados dos 4 cursos (id, nome, descrição, paleta) — a espinha do cursos.ts.
const CURSOS = [
  { id: "transpessoal", nome: "Psicologia Transpessoal", descricao: "Bio · psíquico · social · espiritual. Oriente e Ocidente em diálogo.", mundo: "escola" },
  { id: "constelacao", nome: "Constelação Familiar Sistémica", descricao: "Bert Hellinger e as Ordens do Amor. A pessoa dentro dos seus sistemas.", mundo: "synchim" },
  { id: "espiritualidade", nome: "Psicologia e Espiritualidade", descricao: "Espiritualidade como sentido, propósito e qualidade de vida.", mundo: "autora" },
  { id: "desenvolvimento", nome: "Desenvolvimento Pessoal e Profissional", descricao: "Cadeira comum aos 3: carreira, comunicação e saúde do cuidador.", mundo: "infonte" },
];

// Fallback: as listas atuais (escritas à mão). Usadas só se a Syntia ainda não
// tiver conceitos para esse curso — assim nunca se perde nada.
const FALLBACK = {
  transpessoal: ["Bio-psico-social-espiritual", "Oriente encontra Ocidente", "Arquétipos e símbolos (Jung)", "Estados ampliados de consciência", "O Self transpessoal", "Sombra e integração", "Experiências de pico (Maslow)", "O inconsciente coletivo", "Individuação", "Sincronicidade"],
  constelacao: ["As Ordens do Amor", "O direito de pertencer", "Dar e receber em equilíbrio", "Lealdades invisíveis", "O campo morfogenético", "Parentificação: ser mãe da mãe", "O sintoma como amor", "Amor cego vs amor consciente", "Segredos de família", "Frases que curam (frases de solução)"],
  espiritualidade: ["Espiritualidade não é religião", "Sentido e propósito (Frankl)", "Bem-estar espiritual", "Logoterapia: o porquê", "Os três caminhos de sentido (Frankl)", "Perdão: libertar-se, não esquecer", "Transcender o ego", "Compaixão e autocompaixão", "Mindfulness e presença", "A pergunta pelo sentido da vida"],
  desenvolvimento: ["Inteligência emocional", "Burnout do cuidador", "Comunicar com presença", "Limites saudáveis", "Autocompaixão", "Dizer não sem culpa", "Assertividade vs agressividade", "Descanso como produtividade", "Síndrome do impostor", "Resiliência no trabalho"],
};

const saberPath = process.argv[2] || "public/saber.json";
const saber = JSON.parse(fs.readFileSync(saberPath, "utf-8"));
const cc = saber.conceitosCurso || {};

const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'");

const blocos = CURSOS.map((c) => {
  const daSyntia = Array.isArray(cc[c.id]) ? cc[c.id] : [];
  const lista = (daSyntia.length >= 8 ? daSyntia : FALLBACK[c.id]).slice(0, CAP);
  const conceitos = lista.map((x) => `      '${esc(x)}',`).join("\n");
  return `  {
    id: '${c.id}',
    nome: '${esc(c.nome)}',
    descricao: '${esc(c.descricao)}',
    mundo: '${c.mundo}',
    conceitos: [
${conceitos}
    ],
  },`;
}).join("\n");

process.stdout.write(`// Os cursos (pos-graduacoes) da Vivianne — dimensao DIDATICA dos infograficos
// (substitui os universos da loja nesta linha; sem CTA, so conhecimento).
//
// GERADO automaticamente a partir do saber.json da Syntia (conceitos das aulas
// reais). NAO editar a mao — a cada aula nova na Syntia, este ficheiro e reescrito.
import type { Mundo } from '@/lib/estudio-conteudo';

export type Curso = {
  id: string;
  nome: string;
  descricao: string;
  mundo: Mundo;       // paleta visual
  conceitos: string[]; // conceitos didaticos (das aulas reais da Syntia)
};

export const CURSOS: Curso[] = [
${blocos}
];

export function getCurso(id: string): Curso {
  return CURSOS.find((c) => c.id === id) ?? CURSOS[0];
}
`);
