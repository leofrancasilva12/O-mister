# Changelog — O Mister

## [2.0.0] — 2025-07-18

### Mudanças Maiores

#### Knowledge Base Consolidada
- **Consolidação**: Os 3 arquivos separados (`normas-api-roscas-e-tubos.md`, `glossario-roscas-api.md`, `roteamento-normas-api-roscas-tubos.md`) foram unificados em um único arquivo: `api-normas-completas.md` (~33KB, ~10.9k tokens).
- **Benefícios**: Melhor navegação, índice integrado, roteamento visual com matrizes de decisão, glossário inline.

#### Persona Aprimorada
- **Regras de segurança INEGOCIÁVEIS**: Detalhadas e exemplificadas (nunca inventar valores numéricos, nunca confirmar compatibilidade por nome, recusas com utilidade).
- **Exemplos de respostas boas vs ruins**: 5+ cenários mostrando exatamente o que o Mister deve e não deve fazer.
- **Casos de teste**: 5 testes que o Mister deve passar (compatibilidade, torque, propriedade mecânica, seleção de grau, QMS).
- **Comportamento em limites**: Instruções claras para situações ambíguas, fora de escopo, ou de risco técnico.

#### Modelo LLM
- **Mudança padrão**: `anthropic/claude-3-5-haiku` (era `openai/gpt-4o-mini`).
- **Justificativa**: Rápido, preciso para roteamento técnico, ~40% mais barato, suporta prompt caching (reduz custo de input em ~90%).

#### Documentação
- **README.md atualizado**: Reflete novas estruturas, modelo padrão, instruções claras.
- **.env.example criado**: Variáveis de ambiente documentadas.
- **.gitignore criado**: Evita commitar `.env`, `node_modules`, e artefatos de build.
- **CHANGELOG.md criado** (este arquivo): Rastreabilidade de mudanças.

### API Q1 — Quality Management System
- **Novo**: Base de conhecimento agora cobre **API Specification Q1** (Quality Management System) em adição às normas de roscas/tubos.
- **Escopo Q1**: Seções 4-6 cobertas (QMS Requirements, Product Realization, Monitoring/Improvement).
- **Casos de uso**: Documentação QMS, auditorias internas, retention de registros, MOC (Management of Change).

### Melhorias de Segurança Técnica
- Regras claras sobre quando recusar valores numéricos.
- Exemplos de recusa com utilidade (não apenas "não posso").
- Instruções para roteamento automático garantindo sempre a norma correta.
- Casos de teste para validar comportamento.

### Detalhes Técnicos
- `lib/system-prompt.js`: Atualizado para arquivo único de knowledge.
- `api/chat.js`: Modelo padrão mudado para Claude 3.5 Haiku.
- `package.json`: Sem mudanças (Node 18+ suficiente).
- `vercel.json`: Sem mudanças (maxDuration: 60s continua apropriado).

### Tamanho de Prompt
- **Anterior**: ~38KB (3 arquivos) = ~10.9k tokens.
- **Agora**: ~33KB (1 arquivo) = ~10.9k tokens.
- **Impacto**: Sem mudança significativa na janela de contexto; margem de 195k tokens disponíveis no Claude 3.5 Haiku.

---

## Próximos Passos (Recomendações)

1. **Testar localmente**: `vercel dev` com Claude 3.5 Haiku.
2. **Validar segurança**: Testar os 5 casos de teste na persona.
3. **Deploy**: `git push` e monitor em Vercel.
4. **Feedback**: Se o modelo não capturar a persona ou errar nos casos de teste, ajustar `lib/persona.md`.

---

## Versões Anteriores

### [1.0.0] — Initial Release
- 3 arquivos separados de knowledge base.
- Persona básica (22KB).
- Modelo padrão: GPT-4o mini.
- README e estrutura inicial.
