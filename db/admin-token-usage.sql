-- =====================================================================
-- O Mister — consumo de tokens (para o painel de admin)
-- Rode este script no painel do Supabase: SQL Editor → New query → Run
-- =====================================================================

-- Uma linha por resposta do chat (autenticada ou convidado), com o
-- consumo de tokens reportado pela OpenRouter.
create table if not exists public.token_usage (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users (id) on delete set null,
  model            text,
  prompt_tokens    integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens     integer not null default 0,
  created_at       timestamptz not null default now()
);

create index if not exists token_usage_created_at_idx
  on public.token_usage (created_at desc);

create index if not exists token_usage_user_id_idx
  on public.token_usage (user_id);

-- Row Level Security: habilitada, sem nenhuma policy — só o service role
-- (usado pelo backend do chat para gravar, e pelo endpoint de admin para
-- ler os agregados) consegue acessar esta tabela. Usuários comuns (JWT
-- normal) não têm nenhuma permissão sobre ela.
alter table public.token_usage enable row level security;
