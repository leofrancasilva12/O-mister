-- =====================================================================
-- O Mister — alerta por e-mail de limite diário de tokens
-- Rode este script no painel do Supabase: SQL Editor → New query → Run
-- =====================================================================

-- Registra o dia em que o alerta de limite diário já foi enviado, para
-- não mandar o e-mail mais de uma vez no mesmo dia.
create table if not exists public.daily_alert_log (
  alert_date date primary key,
  created_at timestamptz not null default now()
);

-- Row Level Security: habilitada, sem nenhuma policy — só o service role
-- (usado pelo backend do chat) consegue acessar esta tabela. Usuários
-- comuns (JWT normal) não têm nenhuma permissão sobre ela.
alter table public.daily_alert_log enable row level security;
