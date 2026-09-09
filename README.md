# O Mister

Assistente técnico especializado em normas API de roscas, tubos, conexões e Quality Management System para a indústria de petróleo e gás.

Interface de chat minimalista sobre uma base de conhecimento consolidada (API 5B, 5CT, 5L, 7-1, 7-2, 7G-2, 11B, 6A, Q1 + curso de roscas), servida por uma função serverless que conversa com Claude Haiku 4.5 via OpenRouter.

---

## Por que não tem RAG

A base inteira (persona + as duas bases de `knowledge/`) tem cerca de **115 mil caracteres**, algo como **30 mil tokens** (estimativa). A janela de contexto do Claude Haiku 4.5 tem **200 mil**. Cabe tudo no prompt com folga de mais de 80%.

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
│   ├── chat.js                        Endpoint serverless: recebe a pergunta, chama OpenRouter, devolve streaming
│   ├── text-to-speech.js              Converte a resposta em áudio
│   └── admin-*.js, delete-account.js, is-admin.js, notify-account-event.js
├── lib/
│   ├── persona.md                     Persona do Mister: tom, regras de segurança, casos de teste
│   ├── system-prompt.js               Junta persona + as bases de conhecimento (KNOWLEDGE_FILES)
│   └── http.js, rate-limit.js, notify.js, supabase-admin.js
├── knowledge/
│   ├── api-normas-completas.md            Normas API + QMS (Q1) + glossário + roteamento
│   └── curso-roscas-api-iq-engenharia.md  Curso de roscas: dimensões de conexões API
├── public/
│   ├── index.html                     Chat (interface principal)
│   ├── normas-api.html                Consulta navegável da base "Normas API"
│   ├── curso-roscas.html              Consulta navegável da base "Rosca API" (curso)
│   ├── login.html, admin.html         Login e painel de admin
│   ├── css/                           style.css (app) · knowledge.css (páginas de consulta) · admin.css
│   └── js/                            app.js, auth.js, config.js · knowledge.js (páginas de consulta)
├── db/                                 Scripts SQL do Supabase (schema, admin, notificações)
├── .env.example                       Modelo das variáveis de ambiente (copie para .env)
├── vercel.json                        Config Vercel: maxDuration, includeFiles, headers de segurança
├── package.json                       Scripts: dev, deploy
└── README.md                          Este arquivo
```

Sem build step, sem dependências de frontend. Node 18+ já tem tudo que o projeto usa no back-end.

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
| `SUPABASE_URL` | para login/registro de uso | URL do projeto Supabase |
| `SUPABASE_JWT_SECRET` | para login (modo legado HS256) | Ver `SUPABASE-SETUP.md` |
| `SUPABASE_SERVICE_ROLE_KEY` | para deletar conta e para o painel de admin | Chave `service_role` do Supabase (nunca expor no front-end) |
| `ADMIN_EMAIL` | para o painel de admin (`/admin.html`) | E-mail autorizado a ver `/api/admin-stats`. Sem essa variável, o painel fica bloqueado para todo mundo |
| `NOTIFY_WEBHOOK_SECRET` | para notificação de cadastro/exclusão por e-mail | Segredo compartilhado com o trigger do Supabase (`db/admin-notifications.sql`) |
| `RESEND_API_KEY` | para notificação de cadastro/exclusão por e-mail | Chave da API do [Resend](https://resend.com) |
| `NOTIFY_FROM_EMAIL` | não | Remetente do e-mail de notificação. Padrão: `O Mister <onboarding@resend.dev>` |
| `DAILY_TOKEN_LIMIT` | não | Se configurada, manda um e-mail pro admin quando o consumo de tokens do dia passa desse número |
| `ELEVENLABS_API_KEY` | para o botão de ouvir a resposta (`/api/text-to-speech`) | Chave da API da [ElevenLabs](https://elevenlabs.io). Sem ela, o botão de áudio fica indisponível |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | não | Rate limiting compartilhado entre instâncias serverless (Upstash Redis, também aceita as variáveis equivalentes do Vercel KV: `KV_REST_API_URL` / `KV_REST_API_TOKEN`). Sem elas, cai para um limitador em memória por instância |

O `.env` está no `.gitignore`. A chave nunca chega ao navegador — todas as chamadas passam pela função serverless.

---

## Trocar de modelo

O padrão é **Claude Haiku 4.5**. Para mudar, edite a variável de ambiente:

```bash
# Na Vercel Settings → Environment Variables:
OPENROUTER_MODEL=anthropic/claude-haiku-4.5    # Padrão atual (mais rápido e barato)
OPENROUTER_MODEL=anthropic/claude-sonnet-4.5   # Mais inteligente, mais caro
OPENROUTER_MODEL=anthropic/claude-opus-4-6     # Mais preciso, mais caro ainda
```

O roteamento de normas API exige precisão — teste bem antes de trocar em produção. Confira preços em [openrouter.ai/models](https://openrouter.ai/models).

---

## Painel de admin (consumo de tokens e contas)

Em `/admin.html` (ex.: `https://mister-intelligence.vercel.app/admin.html`) fica um painel simples, com sidebar (Painel / Chat / Landing page / Sair), mostrando:
- Total de contas cadastradas no Supabase Auth, e a lista de e-mails (mais recente primeiro).
- Total de tokens consumidos e consumo por dia (últimos 30 dias).

Pra habilitar:
1. Rode `db/admin-token-usage.sql` no SQL Editor do Supabase (cria a tabela `token_usage`, onde cada resposta do chat grava seu consumo).
2. Configure `SUPABASE_SERVICE_ROLE_KEY` (se ainda não tiver, ela também é necessária para excluir conta).
3. Configure `ADMIN_EMAIL` com o e-mail que você usa pra logar no app — só esse e-mail consegue ver a página. Sem essa variável, o painel fica bloqueado pra todo mundo (inclusive você).
4. Entre em `/admin.html` já logado com esse e-mail.

### Notificação por e-mail (novo cadastro / conta deletada)

Toda vez que alguém cria ou deleta uma conta, o admin recebe um e-mail. Pra habilitar:

1. Crie uma conta grátis em [resend.com](https://resend.com) e gere uma API Key (**API Keys → Create API Key**).
2. Configure `RESEND_API_KEY` na Vercel com essa chave.
3. Enquanto não configurar um domínio próprio no Resend, o remetente padrão (`onboarding@resend.dev`) só consegue enviar para o e-mail com o qual você criou a conta no Resend — use o mesmo e-mail em `ADMIN_EMAIL`.
4. Escolha um segredo (qualquer string aleatória) e configure em `NOTIFY_WEBHOOK_SECRET` na Vercel.
5. Abra `db/admin-notifications.sql`, troque `SEGREDO_AQUI` pelo mesmo segredo do passo 4, e rode o script no SQL Editor do Supabase (cria a extensão `pg_net` e os triggers em `auth.users`).
6. Redeploy o projeto na Vercel pra aplicar as novas variáveis.

### Alerta de limite diário de tokens

Manda um e-mail pro admin quando o consumo de tokens do dia ultrapassa um valor configurado (útil pra perceber uso fora do normal antes de virar surpresa na fatura). Pra habilitar:

1. Rode `db/admin-daily-alert.sql` no SQL Editor do Supabase (cria a tabela `daily_alert_log`, usada só para não mandar o alerta mais de uma vez no mesmo dia).
2. Configure `RESEND_API_KEY` e `ADMIN_EMAIL` (mesmas variáveis da notificação de cadastro/exclusão acima).
3. Configure `DAILY_TOKEN_LIMIT` na Vercel com o número de tokens do dia que deve disparar o alerta (ex.: `500000`).
4. Redeploy o projeto na Vercel pra aplicar a nova variável.

Sem `DAILY_TOKEN_LIMIT` configurada, essa checagem fica desligada e não tem custo extra nenhum.

---

## Editar a base de conhecimento

Hoje tem **duas bases**, cada uma em um `.md` dentro de `knowledge/`, listadas em `KNOWLEDGE_FILES` (`lib/system-prompt.js`) e incluídas inteiras no system prompt do chat. Cada uma também tem uma página HTML navegável (sidebar do chat → "Normas API" / "Rosca API"), com índice, busca e destaque de termo — pra quem quer só consultar um valor sem precisar perguntar ao Mister.

| Arquivo em `knowledge/` | Conteúdo | Página de consulta |
|---|---|---|
| `api-normas-completas.md` | Visão geral das normas API · API Specification Q1 (QMS) · normas de roscas e tubos (5B, 5CT, 5L, 7-1, 7-2, 7G-2, 11B) · glossário · roteamento de perguntas | `public/normas-api.html` |
| `curso-roscas-api-iq-engenharia.md` | Curso de roscas (Imídio Queiroz Engenharia): fundamentos, REG/IF/FH, Buttress, rosca redonda casing, Extreme Line, tubing NU/EU, Line Pipe, NPT/BSP, haste de bombeio | `public/curso-roscas.html` |

**Para atualizar uma base existente:** edite o `.md` e faça deploy — o chat usa a versão mais recente automaticamente (lido em runtime). A **página HTML de consulta não atualiza sozinha**: ela é gerada a partir do markdown, então uma edição no `.md` exige regenerar o HTML correspondente pra refletir na página (mas já vale pro chat imediatamente, mesmo sem regenerar).

**Para adicionar uma base nova:**
1. Crie o `.md` em `knowledge/`.
2. Adicione uma entrada em `KNOWLEDGE_FILES` (`lib/system-prompt.js`) — o chat já passa a usá-la.
3. Gere a página de consulta seguindo o padrão de `normas-api.html`/`curso-roscas.html` (usa `public/css/knowledge.css` + `public/js/knowledge.js`, que cuidam de índice, busca, tema e responsivo automaticamente) e adicione o link no sidebar (`public/index.html`, seção "Base de conhecimento").

Nada de reindexar, nada de reprocessar — é tudo texto puro incluído no prompt.

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

**Modelo:** Claude Haiku 4.5 via OpenRouter (padrão) — rápido e o mais barato das opções listadas em [Trocar de modelo](#trocar-de-modelo).

**Cache de prompt.** O system prompt (persona + bases de conhecimento) é idêntico em toda requisição. Modelos da Anthropic (como Claude Haiku 4.5) suportam prompt caching, que reduz custos de input em ~90% para requisições repetidas.

---

## Limitações

- As bases são **resumos/material didático originais**, não o texto oficial das normas API. Servem para orientar e explicar conceitos, não para substituir a norma.
- Nenhuma decisão de fabricação, inspeção, aceitação ou rejeição deve se apoiar só no que o Mister diz.
- O histórico não persiste entre sessões.
