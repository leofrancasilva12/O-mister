import { readFileSync } from "fs";
import { join } from "path";

// Arquivo único consolidado: normas API + QMS + roteamento + glossário integrado
const KNOWLEDGE_FILES = [
  {
    file: "api-normas-completas.md",
    title: "BASE DE CONHECIMENTO — Normas API de Roscas, Tubos e Quality Management System",
  },
];

// Montado uma única vez por instância (cold start) e reaproveitado
// entre requisições quentes. Cache atualiza a cada hora (quando horário muda).
let cachedPrompt = null;
let cachedHour = null;

function read(...segments) {
  return readFileSync(join(process.cwd(), ...segments), "utf-8");
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "manhã (bom dia)";
  if (hour >= 12 && hour < 18) return "tarde (boa tarde)";
  return "noite (boa noite)";
}

export function buildSystemPrompt() {
  const currentHour = new Date().getHours();

  // Invalida cache se a hora mudou (atualiza saudação a cada hora)
  if (cachedPrompt && cachedHour === currentHour) {
    return cachedPrompt;
  }

  const persona = read("lib", "persona.md");
  const timeOfDay = getTimeOfDay();

  const knowledge = KNOWLEDGE_FILES.map(({ file, title }) => {
    const content = read("knowledge", file);
    return `<documento titulo="${title}">\n\n${content}\n\n</documento>`;
  }).join("\n\n");

  cachedPrompt = [
    persona,
    `\n\n---\n\n# CONTEXTO ATUAL\n\nHorário do servidor: ${timeOfDay}. Use essa informação para saudações apropriadas.\n`,
    "\n\n---\n\n# BASE DE CONHECIMENTO\n",
    "Abaixo está o documento de referência consolidado na íntegra. Baseie suas respostas nele.\n",
    knowledge,
  ].join("\n");

  cachedHour = currentHour;
  return cachedPrompt;
}
