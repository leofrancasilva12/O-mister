import { readFileSync } from "fs";
import { join } from "path";

// Arquivo único consolidado: normas API + QMS + roteamento + glossário integrado
const KNOWLEDGE_FILES = [
  {
    file: "api-normas-completas.md",
    title: "BASE DE CONHECIMENTO — Normas API de Roscas, Tubos e Quality Management System",
  },
  {
    file: "curso-roscas-api-iq-engenharia.md",
    title: "CURSO DE ROSCAS API — Treinamento Imídio Queiroz Engenharia (dimensões de conexões)",
  },
];

// Montado uma única vez por instância (cold start) e reaproveitado
// entre requisições quentes.
let cachedPrompt = null;

function read(...segments) {
  return readFileSync(join(process.cwd(), ...segments), "utf-8");
}

export function buildSystemPrompt() {
  if (cachedPrompt) return cachedPrompt;

  const persona = read("lib", "persona.md");

  const knowledge = KNOWLEDGE_FILES.map(({ file, title }) => {
    const content = read("knowledge", file);
    return `<documento titulo="${title}">\n\n${content}\n\n</documento>`;
  }).join("\n\n");

  cachedPrompt = [
    persona,
    "\n\n---\n\n# BASE DE CONHECIMENTO\n",
    "Abaixo está o documento de referência consolidado na íntegra. Baseie suas respostas nele.\n",
    knowledge,
  ].join("\n");

  return cachedPrompt;
}
