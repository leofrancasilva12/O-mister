import { readFileSync } from "fs";
import { join } from "path";

// Ordem importa: a persona vem primeiro para estabelecer o comportamento,
// depois os documentos que ela referencia.
const KNOWLEDGE_FILES = [
  {
    file: "normas-api-roscas-e-tubos.md",
    title: "DOCUMENTO 1 — Visão geral das normas API de roscas e tubos",
  },
  {
    file: "glossario-roscas-api.md",
    title: "DOCUMENTO 2 — Glossário de termos de roscas API",
  },
  {
    file: "roteamento-normas-api-roscas-tubos.md",
    title: "DOCUMENTO 3 — Roteamento de perguntas para normas API",
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
    "Abaixo estão os três documentos de referência na íntegra. Baseie suas respostas neles.\n",
    knowledge,
  ].join("\n");

  return cachedPrompt;
}
