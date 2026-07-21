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

// Busca um usuário do Supabase Auth pelo e-mail. A Admin API não tem um
// "getUserByEmail" direto, então pagina listUsers() e filtra — aceitável
// para o volume de contas deste app (mesmo padrão usado no admin-stats).
export async function findUserByEmail(supabase, email) {
  const needle = String(email || "").trim().toLowerCase();
  if (!needle) return null;

  const perPage = 1000;
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users || [];
    const found = users.find((u) => (u.email || "").toLowerCase() === needle);
    if (found) return found;
    if (users.length < perPage) break;
  }
  return null;
}
