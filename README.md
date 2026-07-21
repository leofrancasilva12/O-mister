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
| `OPENROUTER_MODEL` | não | Padrão: `anthropic/claude-sonnet-4.5` |
| `SITE_URL` | não | A URL pública do projeto |
| `SUPABASE_URL` | para login/registro de uso | URL do projeto Supabase |
| `SUPABASE_JWT_SECRET` | para login (modo legado HS256) | Ver `SUPABASE-SETUP.md` |
| `SUPABASE_SERVICE_ROLE_KEY` | para deletar conta e para o painel de admin | Chave `service_role` do Supabase (nunca expor no front-end) |
| `ADMIN_EMAIL` | para o painel de admin (`/admin.html`) | E-mail autorizado a ver `/api/admin-stats`. Sem essa variável, o painel fica bloqueado para todo mundo |
| `NOTIFY_WEBHOOK_SECRET` | para notificação de cadastro/exclusão por e-mail | Segredo compartilhado com o trigger do Supabase (`db/admin-notifications.sql`) |
| `RESEND_API_KEY` | para notificação de cadastro/exclusão por e-mail | Chave da API do [Resend](https://resend.com) |
| `NOTIFY_FROM_EMAIL` | não | Remetente do e-mail de notificação. Padrão: `O Mister <onboarding@resend.dev>` |
| `DAILY_TOKEN_LIMIT` | não | Se configurada, manda um e-mail pro admin quando o consumo de tokens do dia passa desse número |
| `WEBAUTHN_CHALLENGE_SECRET` | para login por biometria | Segredo aleatório usado para assinar o desafio do WebAuthn. Sem essa variável, o login por biometria fica desligado |

O `.env` está no `.gitignore`. A chave nunca chega ao navegador — todas as chamadas passam pela função serverless.

---

## Trocar de modelo

O padrão é **Claude Sonnet 4.5**. Para mudar, edite a variável de ambiente:

```bash
# Na Vercel Settings → Environment Variables:
OPENROUTER_MODEL=anthropic/claude-sonnet-4.5   # Padrão atual (mais inteligente)
OPENROUTER_MODEL=anthropic/claude-haiku-4.5    # Mais rápido e barato, menos capaz
OPENROUTER_MODEL=anthropic/claude-opus-4-6     # Mais preciso, mais caro
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

## Login por biometria (impressão digital / Face ID)

Depois de entrar uma vez por e-mail ou Google, o usuário pode ativar a biometria do próprio aparelho (Touch ID, Face ID, digital do Android) como atalho pra entrar da próxima vez — sem precisar do link por e-mail. É baseado em [WebAuthn](https://webauthn.guide/), o padrão que os navegadores usam pra falar com o leitor biométrico do aparelho; não existe "senha" nem dado biométrico guardado no servidor, só uma chave pública por dispositivo.

Pra habilitar:

1. Rode `db/webauthn-credentials.sql` no SQL Editor do Supabase (cria a tabela `webauthn_credentials`, uma linha por dispositivo cadastrado).
2. Escolha um segredo (qualquer string aleatória, ex. `openssl rand -hex 32`) e configure em `WEBAUTHN_CHALLENGE_SECRET` na Vercel.
3. Confirme que `SUPABASE_SERVICE_ROLE_KEY` já está configurada (mesma variável usada pelo painel de admin).
4. Redeploy o projeto na Vercel pra aplicar a nova variável.

Depois disso, quem logar normalmente vai ver a opção "Ativar neste dispositivo" em Configurações, e "Entrar com biometria" na tela de login (só aparece em aparelhos com leitor biométrico disponível). Cada credencial fica presa ao domínio onde foi cadastrada — ativar em `mister-intelligence.vercel.app` não funciona em um preview deployment com outra URL, é preciso cadastrar de novo lá.

Sem `WEBAUTHN_CHALLENGE_SECRET` configurada, o recurso fica desligado (nenhum botão aparece) e não tem custo nem risco extra.

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
