-- =====================================================================
-- CORREÇÃO: permitir exclusão de conversas (resetar políticas RLS)
-- Rode isto no Supabase: SQL Editor → New query → Cole tudo → Run
-- =====================================================================

-- 1) Remove políticas antigas (inclusive as de soft-delete com deleted_at)
drop policy if exists "conversas do proprio usuario" on public.conversations;
drop policy if exists "conversas deletadas do usuario" on public.conversations;

-- 2) Se a coluna deleted_at existir, apaga conversas que ficaram "soft-deleted"
--    e remove a coluna (não é mais usada).
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'conversations'
      and column_name = 'deleted_at'
  ) then
    delete from public.conversations where deleted_at is not null;
    alter table public.conversations drop column deleted_at;
  end if;
end $$;

-- 3) Cria a política correta: cada usuário tem controle total das próprias conversas
--    (ler, inserir, atualizar E apagar).
create policy "conversas do proprio usuario"
  on public.conversations
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Pronto. Agora a exclusão de conversas funciona normalmente.
