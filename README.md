# O Mister

Assistente técnico de normas API de roscas, tubos e conexões para a indústria de petróleo e gás.

Interface de chat minimalista sobre uma base de conhecimento de três documentos, servida por uma função serverless que conversa com a OpenRouter.

---

## Por que não tem RAG

A base inteira tem cerca de **11 mil tokens**. A janela de contexto do GPT-4o mini tem **128 mil**. Cabe tudo no prompt com folga de mais de 90%.

Construir retrieval aqui traria só desvantagens:

- **Retrieval erra.** Se a busca não trouxer o trecho certo, o modelo responde mal com confiança. Sem retrieval, o modelo vê tudo, sempre.
- **Os documentos são interligados.** O roteamento remete ao glossário, que remete às normas. Fatiar quebra as conexões que dão valor ao conjunto.
- **Custo é irrisório.** Fração de centavo por pergunta, e menos ainda com cache de prompt.

Se um dia a base crescer para megabytes (normas completas, catálogos de fabricante), aí sim vale migrar para RAG. Até lá, isto é mais simples **e** mais preciso.

---

## Estrutura

```
o-mister/
├── api/
│   └── chat.js           Endpoint serverless: recebe a pergunta, chama a OpenRouter, devolve streaming
├── lib/
│   ├── persona.md        Persona do Mister e regras de segurança técnica
│   └── system-prompt.js  Junta persona + base de conhecimento num prompt só
├── knowledge/
│   ├── normas-api-roscas-e-tubos.md
│   ├── glossario-roscas-api.md
│   └── roteamento-normas-api-roscas-tubos.md
├── public/
│   └── index.html        Interface completa: HTML, CSS e JS num arquivo só
├── vercel.json
└── package.json
```

Sem build step, sem dependências. Node 18+ já tem tudo que o projeto usa.

---

## Rodar local

```bash
npm install -g vercel     # só na primeira vez
cp .env.example .env
# edite o .env e coloque sua chave da OpenRouter
vercel dev
```

Abre em `http://localhost:3000`.

A chave sai de [openrouter.ai/keys](https://openrouter.ai/keys).

---

## Deploy

```bash
vercel --prod
```

Depois cadastre as variáveis de ambiente no painel da Vercel, em **Settings → Environment Variables**:

| Variável | Obrigatória | Observação |
|---|---|---|
| `OPENROUTER_API_KEY` | sim | Sua chave da OpenRouter |
| `OPENROUTER_MODEL` | não | Padrão: `openai/gpt-4o-mini` |
| `SITE_URL` | não | A URL pública do projeto |

O `.env` está no `.gitignore`. A chave nunca chega ao navegador — todas as chamadas passam pela função serverless.

---

## Trocar de modelo

Muda uma variável de ambiente e pronto. É a vantagem de usar OpenRouter.

```bash
OPENROUTER_MODEL=anthropic/claude-3.5-haiku
OPENROUTER_MODEL=google/gemini-flash-1.5
OPENROUTER_MODEL=openai/gpt-4o-mini
```

Vale testar mais de um. O roteamento de normas exige um raciocínio que alguns modelos fazem melhor que outros, e os preços na faixa econômica são parecidos. Confira os valores atuais em [openrouter.ai/models](https://openrouter.ai/models).

---

## Editar a base de conhecimento

Mexa nos `.md` dentro de `knowledge/` e faça deploy. Nada de reindexar, nada de reprocessar.

Para incluir um documento novo, adicione-o na lista de `lib/system-prompt.js`:

```js
const KNOWLEDGE_FILES = [
  // ...
  { file: "novo-documento.md", title: "DOCUMENTO 4 — Título aqui" },
];
```

Fique de olho no total. Até uns 30 mil tokens a coisa segue confortável. Passando disso, reavalie.

---

## Ajustar o comportamento

O `lib/persona.md` define quem é o Mister: tom, raciocínio de roteamento e as regras de segurança técnica.

**As regras de segurança são o ponto mais importante do projeto.** O Mister é instruído a nunca inventar torque, dimensão, tolerância ou resistência — dados que vivem em tabelas oficiais e que, errados, viram acidente ou peça rejeitada. Ele também não confirma compatibilidade de conexão pelo nome.

Se for afrouxar alguma dessas regras, pense duas vezes. Elas são o que separa um assistente útil de um passivo.

---

## Detalhes de implementação

**Streaming.** A resposta aparece token a token, via SSE. O indicador de digitação só some quando o primeiro token realmente chega.

**Histórico.** As últimas 20 mensagens seguem no contexto, o que permite perguntas de seguimento ("e para tubing, muda?"). Vive na memória da aba; recarregou, zerou.

**Temperatura 0.3.** Baixa de propósito. Contexto técnico premia consistência, não criatividade.

**Markdown.** Renderizado por uma função mínima que escapa o HTML antes de formatar — nada vindo do modelo consegue injetar marcação na página.

**Cache de prompt.** O system prompt é idêntico em toda requisição. Modelos da OpenAI fazem cache automático de prompts acima de ~1024 tokens, o que derruba bastante o custo. Modelos da Anthropic precisam de configuração explícita de `cache_control`, hoje não implementada aqui.

---

## Limitações

- A base são **resumos originais**, não o texto oficial das normas API. Serve para orientar e explicar conceitos, não para substituir a norma.
- Nenhuma decisão de fabricação, inspeção, aceitação ou rejeição deve se apoiar só no que o Mister diz.
- O histórico não persiste entre sessões.
