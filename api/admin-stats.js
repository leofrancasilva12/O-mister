import { applyCors, getBearerToken, verifyToken, isJwtConfigured } from "../lib/http.js";
import { getServiceRoleClient } from "../lib/supabase-admin.js";

// E-mail autorizado a ver o painel de admin. Sem essa env var configurada,
// o endpoint fica bloqueado para todo mundo (falha fechada).
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

// Preços por 1M tokens (USD), espelhando a tabela oficial da Anthropic.
// Modelo desconhecido cai no fallback (preço do Sonnet, o padrão atual).
const PRICING_PER_MILLION = {
  "anthropic/claude-haiku-4.5": { input: 1, output: 5 },
  "anthropic/claude-sonnet-4.5": { input: 3, output: 15 },
  "anthropic/claude-opus-4-6": { input: 5, output: 25 },
};
const FALLBACK_PRICING = { input: 3, output: 15 };

// Câmbio aproximado só para dar uma noção em reais — não é cotação em tempo real.
const USD_TO_BRL = 5.2;

function rowCostUsd(row) {
  const pricing = PRICING_PER_MILLION[row.model] || FALLBACK_PRICING;
  const inputCost = ((row.prompt_tokens || 0) / 1_000_000) * pricing.input;
  const outputCost = ((row.completion_tokens || 0) / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

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
    const [accounts, tokens] = await Promise.all([
      listAccounts(supabase),
      getTokenStats(supabase),
    ]);

    // Junta o consumo por usuário (calculado em getTokenStats) na lista de contas.
    for (const account of accounts) {
      const usage = tokens.byUser.get(account.id);
      account.tokensUsed = usage ? usage.tokens : 0;
      account.costUsd = usage ? usage.costUsd : 0;
    }

    return res.status(200).json({
      totalAccounts: accounts.length,
      accounts: accounts.slice(0, 500), // inclui o id (necessário para excluir a conta pelo painel)
      tokens: {
        total: tokens.total,
        totalCostUsd: tokens.totalCostUsd,
        totalCostBrl: tokens.totalCostUsd * USD_TO_BRL,
        byDay: tokens.byDay,
        guestTokens: tokens.guestTokens,
        guestCostUsd: tokens.guestCostUsd,
      },
    });
  } catch (err) {
    console.error("Erro ao gerar estatísticas de admin:", err);
    return res.status(500).json({ error: "Falha ao carregar estatísticas." });
  }
}

// Lista as contas cadastradas no Supabase Auth (email + data de criação),
// mais recentes primeiro, paginando a admin API.
async function listAccounts(supabase) {
  const perPage = 1000;
  const accounts = [];

  // Limite de segurança: até 50 páginas (50 mil contas), para nunca rodar indefinidamente.
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users || [];
    for (const user of users) {
      accounts.push({ id: user.id, email: user.email || "(sem e-mail)", createdAt: user.created_at });
    }
    if (users.length < perPage) break;
  }

  accounts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return accounts;
}

// Soma total/custo de tokens, agrega por dia e por usuário, a partir da token_usage.
async function getTokenStats(supabase) {
  const { data, error } = await supabase
    .from("token_usage")
    .select("user_id, model, prompt_tokens, completion_tokens, total_tokens, created_at");

  if (error) throw error;

  const rows = data || [];
  let total = 0;
  let totalCostUsd = 0;
  let guestTokens = 0;
  let guestCostUsd = 0;

  const byDayMap = new Map();
  const byUser = new Map();

  for (const row of rows) {
    const rowTokens = row.total_tokens || 0;
    const cost = rowCostUsd(row);

    total += rowTokens;
    totalCostUsd += cost;

    const day = String(row.created_at).slice(0, 10); // YYYY-MM-DD (UTC)
    byDayMap.set(day, {
      tokens: (byDayMap.get(day)?.tokens || 0) + rowTokens,
      costUsd: (byDayMap.get(day)?.costUsd || 0) + cost,
    });

    if (row.user_id) {
      const prev = byUser.get(row.user_id) || { tokens: 0, costUsd: 0 };
      byUser.set(row.user_id, { tokens: prev.tokens + rowTokens, costUsd: prev.costUsd + cost });
    } else {
      guestTokens += rowTokens;
      guestCostUsd += cost;
    }
  }

  const byDay = Array.from(byDayMap.entries())
    .map(([date, agg]) => ({ date, total: agg.tokens, costUsd: agg.costUsd }))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 30);

  return { total, totalCostUsd, byDay, byUser, guestTokens, guestCostUsd };
}
