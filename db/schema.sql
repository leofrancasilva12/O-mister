-- =====================================================================
-- O Mister — esquema do banco (Supabase / Postgres)
-- Rode este script no painel do Supabase: SQL Editor → New query → Run
-- =====================================================================

-- Tabela de conversas: cada linha é uma conversa de um usuário.
create table if not exists public.conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text,
  messages   jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_user_updated_idx
  on public.conversations (user_id, updated_at desc);

-- Row Level Security: cada usuário só enxerga/edita as próprias conversas.
alter table public.conversations enable row level security;

drop policy if exists "conversas do proprio usuario" on public.conversations;
create policy "conversas do proprio usuario"
  on public.conversations
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
