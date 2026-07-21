-- =====================================================================
-- O Mister — notificação de cadastro novo / conta deletada (para o e-mail
-- do admin). Rode no SQL Editor do Supabase, em partes (veja README.md).
--
-- IMPORTANTE: troque SEGREDO_AQUI pelo mesmo valor que você colocar na
-- env var NOTIFY_WEBHOOK_SECRET da Vercel. Sem isso combinar, o endpoint
-- rejeita a notificação.
-- =====================================================================

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_account_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  payload jsonb;
begin
  if TG_OP = 'INSERT' then
    payload := jsonb_build_object('event', 'signup', 'email', new.email, 'created_at', new.created_at);
  elsif TG_OP = 'DELETE' then
    payload := jsonb_build_object('event', 'delete', 'email', old.email, 'created_at', now());
  end if;

  perform net.http_post(
    url := 'https://mister-intelligence.vercel.app/api/notify-account-event',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-notify-secret', 'SEGREDO_AQUI'),
    body := payload
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.notify_account_event();

drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute function public.notify_account_event();
