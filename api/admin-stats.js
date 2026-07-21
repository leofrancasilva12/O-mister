import { applyCors, getBearerToken, verifyToken, isJwtConfigured } from "../lib/http.js";
import { getServiceRoleClient } from "../lib/supabase-admin.js";

// E-mail autorizado a ver o painel de admin. Sem essa env var configurada,
// o endpoint fica bloqueado para todo mundo (falha fechada).
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

export default async function handler(req, res) {
  if (applyCors(req, res, "GET, OPTIONS")) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  if (!isJwtConfigured()) {
    return res.status(500).json({ error: "Serviço não configurado no servidor." });
  }

  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Token obrigatório." });
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }

  const email = String(decoded.email || "").toLowerCase();
  if (!ADMIN_EMAIL || email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: "Acesso negado." });
  }

  const supabase = getServiceRoleClient();
  if (!supabase) {
    return res.status(500).json({ error: "Serviço não configurado no servidor." });
  }

  try {
    const [totalAccounts, tokens] = await Promise.all([
      countTotalAccounts(supabase),
      getTokenStats(supabase),
    ]);

    return res.status(200).json({ totalAccounts, tokens });
  } catch (err) {
    console.error("Erro ao gerar estatísticas de admin:", err);
    return res.status(500).json({ error: "Falha ao carregar estatísticas." });
  }
}

// Conta o total de contas cadastradas no Supabase Auth, paginando a admin API.
async function countTotalAccounts(supabase) {
  const perPage = 1000;
  let total = 0;

  // Limite de segurança: até 50 páginas (50 mil contas), para nunca rodar indefinidamente.
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users || [];
    total += users.length;
    if (users.length < perPage) break;
  }

  return total;
}

// Soma total de tokens e agrega por dia (mais recentes primeiro) a partir da token_usage.
async function getTokenStats(supabase) {
  const { data, error } = await supabase
    .from("token_usage")
    .select("total_tokens, created_at");

  if (error) throw error;

  const rows = data || [];
  const total = rows.reduce((sum, row) => sum + (row.total_tokens || 0), 0);

  const byDayMap = new Map();
  for (const row of rows) {
    const day = String(row.created_at).slice(0, 10); // YYYY-MM-DD (UTC)
    byDayMap.set(day, (byDayMap.get(day) || 0) + (row.total_tokens || 0));
  }

  const byDay = Array.from(byDayMap.entries())
    .map(([date, dayTotal]) => ({ date, total: dayTotal }))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 30);

  return { total, byDay };
}
