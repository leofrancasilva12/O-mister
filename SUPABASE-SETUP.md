# Configurar login (Supabase + Google)

O front já está pronto. Falta você criar o projeto Supabase e as credenciais do
Google, depois colar os valores no `public/config.js`. Leva ~15 min.

## 1. Criar o projeto Supabase

1. Acesse https://supabase.com e crie uma conta (grátis).
2. **New project** → dê um nome (ex.: `o-mister`), defina uma senha de banco e a região.
3. Espere o projeto provisionar.

## 2. Criar a tabela de conversas

1. No painel do projeto: **SQL Editor** → **New query**.
2. Cole o conteúdo de [`db/schema.sql`](db/schema.sql) e clique em **Run**.
   - Isso cria a tabela `conversations` com Row Level Security (cada usuário só vê as próprias conversas).

## 3. Pegar as chaves da API

1. **Project Settings** (engrenagem) → **API**.
2. Copie:
   - **Project URL** → vai em `SUPABASE_URL`
   - **anon public** (chave `anon`, pode ser pública) → vai em `SUPABASE_ANON_KEY`
3. Cole no arquivo `public/config.js`:

   ```js
   window.OMISTER_CONFIG = {
     SUPABASE_URL: "https://xxxx.supabase.co",
     SUPABASE_ANON_KEY: "eyJhbGciOi...",
   };
   ```

> A chave `anon` é feita para ficar no front — a segurança vem do RLS, não de esconder a chave.

## 4. Ativar login por e-mail

1. **Authentication** → **Providers** → **Email**: deixe habilitado.
   - O padrão é *magic link* (o usuário recebe um link e entra sem senha) — é o que o app usa.
2. **Authentication** → **URL Configuration**:
   - **Site URL**: `https://o-mister.vercel.app`
     (para testar local, use também `http://localhost:3000`)
   - **Redirect URLs**: adicione `https://o-mister.vercel.app/`
     (e `http://localhost:3000/` se for testar local).

## 5. Ativar login com Google

1. No **Google Cloud Console** (https://console.cloud.google.com):
   - Crie/escolha um projeto → **APIs & Services** → **Credentials**.
   - **Create Credentials** → **OAuth client ID** → tipo **Web application**.
   - Em **Authorized redirect URIs**, adicione a URL de callback do Supabase:
     `https://SEU-PROJETO.supabase.co/auth/v1/callback`
     (aparece no passo seguinte, no próprio Supabase).
   - Copie o **Client ID** e o **Client Secret**.
2. No Supabase: **Authentication** → **Providers** → **Google**:
   - Habilite, cole **Client ID** e **Client Secret**, salve.

## 6. Testar

- Rode o site (deploy na Vercel ou `vercel dev`) e abra a página.
- Sem sessão, você é redirecionado para `login.html`.
- Entre com Google ou peça o link por e-mail.
- Depois de logar, as conversas passam a ser salvas na sua conta e sincronizam entre dispositivos.

---

### Enquanto não configurar

Com o `config.js` ainda nos valores de exemplo, o app roda em **modo local**:
sem login e com as conversas salvas só no navegador. Assim dá pra usar/testar
o restante agora mesmo.
