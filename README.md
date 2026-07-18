# O Mister

Assistente técnico especializado em normas API de roscas, tubos, conexões e Quality Management System para a indústria de petróleo e gás.

Interface de chat minimalista sobre uma base de conhecimento consolidada (API 5B, 5CT, 5L, 7-1, 7-2, 7G-2, 11B, 6A, Q1), servida por uma função serverless que conversa com Claude 3.5 Haiku via OpenRouter.

---

## Por que não tem RAG

A base inteira tem cerca de **10.9 mil tokens**. A janela de contexto do Claude 3.5 Haiku tem **200 mil**. Cabe tudo no prompt com folga de mais de 95%.

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
│   └── chat.js                    Endpoint serverless: recebe a pergunta, chama OpenRouter, devolve streaming
├── lib/
│   ├── persona.md                 Persona do Mister: tom, regras de segurança, casos de teste
│   └── system-prompt.js           Junta persona + base de conhecimento consolidada
├── knowledge/
│   └── api-normas-completas.md    BASE ÚNICA: normas API + QMS + glossário + roteamento integrados
├── public/
│   ├── index.html                 Interface minimalista (HTML + CSS + JS)
│   ├── style.css                  Estilos Apple-minimalist, dark/light mode
│   └── app.js                     Frontend: chat, streaming, markdown renderer
├── vercel.json                    Config Vercel: maxDuration, includeFiles
├── package.json                   Scripts: dev, deploy
└── README.md                       Este arquivo
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
| `OPENROUTER_MODEL` | não | Padrão: `anthropic/claude-haiku-4.5` |
| `SITE_URL` | não | A URL pública do projeto |

O `.env` está no `.gitignore`. A chave nunca chega ao navegador — todas as chamadas passam pela função serverless.

---

## Trocar de modelo

O padrão é **Claude 3.5 Haiku**. Para mudar, edite a variável de ambiente:

```bash
# Na Vercel Settings → Environment Variables:
OPENROUTER_MODEL=anthropic/claude-haiku-4.5    # Padrão atual (rápido, barato)
OPENROUTER_MODEL=anthropic/claude-opus-4-6     # Mais preciso, mais caro
OPENROUTER_MODEL=google/gemini-flash-1.5       # Alternativa rápida
```

O roteamento de normas API exige precisão — Claude 3.5 Haiku foi testado e aprovado para essa tarefa. Outros modelos podem funcionar, mas teste antes de mudar em produção. Confira preços em [openrouter.ai/models](https://openrouter.ai/models).

---

## Editar a base de conhecimento

A base está consolidada em um único arquivo: `knowledge/api-normas-completas.md`.

Para atualizar: edite este arquivo e faça deploy. Nada de reindexar, nada de reprocessar.

**Estrutura do arquivo:**
- Seção 1: Visão geral das normas API
- Seção 2: API Specification Q1 (Quality Management System)
- Seção 3: Normas de roscas e tubos (5B, 5CT, 5L, 7-1, 7-2, 7G-2, 11B)
- Seção 4: Glossário técnico integrado
- Seção 5: Roteamento de perguntas → normas
- Seção 6: Tabelas de roteamento rápido

**Tamanho atual:** ~33KB (~10.9k tokens). Até uns 30 mil tokens a coisa segue confortável na janela de contexto do Claude 3.5 Haiku (200k). Passando disso, considere splitting novamente.

---

## Ajustar o comportamento

O `lib/persona.md` define quem é o Mister: identidade, tom de voz, regras de segurança técnica, exemplos de respostas boas vs ruins, e casos de teste.

**As regras de segurança são inegociáveis.** O Mister nunca inventaria:
- Valores numéricos (torques, dimensões, tolerâncias, resistências)
- Compatibilidade de conexões apenas por semelhança de nome
- Propriedades de produtos sem consultar tabelas oficiais

Se a pergunta exige um número que está em tabela, o Mister explica o conceito, remete à norma, pede dados essenciais e cita onde achar o valor exato. Isso é segurança técnica, não incompetência.

**Casos de teste:** A persona inclui 5+ exemplos de respostas corretas vs incorretas para garantir que o modelo não perca a calibração. Vale revisar esses casos antes de mudar a persona.

---

## Detalhes de implementação

**Streaming.** A resposta aparece token a token, via SSE. O indicador de digitação só some quando o primeiro token realmente chega.

**Histórico.** As últimas 20 mensagens seguem no contexto, o que permite perguntas de seguimento ("e para tubing, muda?"). Vive na memória da aba; recarregou, zerou.

**Temperatura 0.3.** Baixa de propósito. Contexto técnico premia consistência, não criatividade.

**Markdown.** Renderizado por uma função mínima que escapa o HTML antes de formatar — nada vindo do modelo consegue injetar marcação na página.

**Modelo:** Claude 3.5 Haiku via OpenRouter. Rápido, preciso para roteamento técnico, 40% mais barato que Sonnet 4.6.

**Cache de prompt.** O system prompt (~10.9k tokens) é idêntico em toda requisição. Modelos da Anthropic (como Claude 3.5 Haiku) suportam prompt caching que reduz custos de input em ~90% para requisições repetidas.

---

## Limitações

- A base são **resumos originais**, não o texto oficial das normas API. Serve para orientar e explicar conceitos, não para substituir a norma.
- Nenhuma decisão de fabricação, inspeção, aceitação ou rejeição deve se apoiar só no que o Mister diz.
- O histórico não persiste entre sessões.
