// Rate limiting com store compartilhado (Upstash Redis / Vercel KV via REST).
//
// Em serverless cada instância tem sua própria memória, então um Map local
// não segura abuso real. Quando as variáveis do Upstash/Vercel KV estão
// configuradas, usamos o Redis compartilhado (INCR + EXPIRE) via REST — sem
// adicionar dependências. Sem elas, caímos para um Map em memória (melhor que
// nada em dev). Em caso de erro no Redis, falhamos aberto (permitimos) para
// nunca derrubar o chat por causa do limitador.

const KV_URL =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
const KV_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";

const kvEnabled = !!(KV_URL && KV_TOKEN);

async function kvCommand(path) {
  const res = await fetch(`${KV_URL}/${path}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
  if (!res.ok) throw new Error(`KV ${res.status}`);
  const data = await res.json();
  return data.result;
}

// ---- Fallback em memória (por-instância) ----
const memMap = new Map();
function memLimited(key, max, windowMs) {
  const now = Date.now();
  for (const [k, e] of memMap) {
    if (now > e.resetTime) memMap.delete(k);
  }
  const entry = memMap.get(key) || { count: 0, resetTime: now + windowMs };
  if (now > entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + windowMs;
  }
  entry.count++;
  memMap.set(key, entry);
  return entry.count > max;
}

// Retorna true se a requisição deve ser BLOQUEADA (excedeu o limite).
export async function isRateLimited(key, { max = 30, windowSec = 60 } = {}) {
  if (!kvEnabled) {
    return memLimited(key, max, windowSec * 1000);
  }
  try {
    const namespaced = `rl:${key}`;
    const count = await kvCommand(`incr/${encodeURIComponent(namespaced)}`);
    if (count === 1) {
      // Primeira ocorrência na janela: define expiração.
      await kvCommand(`expire/${encodeURIComponent(namespaced)}/${windowSec}`);
    }
    return count > max;
  } catch (err) {
    // Falha aberta: não bloqueia o usuário se o Redis estiver indisponível.
    console.error("[rate-limit] KV indisponível, liberando:", err.message);
    return false;
  }
}

export const rateLimitBackend = kvEnabled ? "kv" : "memory";
