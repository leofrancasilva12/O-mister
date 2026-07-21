import { createClient } from "@supabase/supabase-js";

// Cliente Supabase com service role: bypassa RLS, usado só em código de
// servidor que precisa gravar/ler dados fora do escopo de um usuário (ex.:
// deleção de conta, registro de consumo de tokens, estatísticas de admin).
let cachedClient = null;

export function getServiceRoleClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  if (!cachedClient) {
    cachedClient = createClient(url, key, { auth: { persistSession: false } });
  }
  return cachedClient;
}
