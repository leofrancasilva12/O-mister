-- =====================================================================
-- O Mister — login por biometria (WebAuthn/passkeys)
-- Rode este script no painel do Supabase: SQL Editor → New query → Run
-- =====================================================================

-- Uma linha por credencial (dispositivo) cadastrado por cada usuário.
create table if not exists public.webauthn_credentials (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  credential_id  text not null unique,
  public_key     text not null,
  counter        bigint not null default 0,
  transports     text,
  device_name    text,
  created_at     timestamptz not null default now(),
  last_used_at   timestamptz
);

create index if not exists webauthn_credentials_user_id_idx
  on public.webauthn_credentials (user_id);

-- Row Level Security: habilitada, sem nenhuma policy — só o service role
-- (usado pelos endpoints api/webauthn-*.js) consegue acessar esta tabela.
alter table public.webauthn_credentials enable row level security;
