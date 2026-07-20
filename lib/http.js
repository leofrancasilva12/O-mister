// Helpers compartilhados pelos endpoints serverless: CORS + validação de JWT.
// Centraliza a lista de origens e a verificação de token para evitar
// duplicação e comportamento divergente entre /api/*.

import jwt from "jsonwebtoken";
import { createPublicKey } from "crypto";

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;

// Origens permitidas. SITE_URL (produção) é adicionada quando definida.
const ALLOWED_ORIGINS = [
  "https://mister-intelligence.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.SITE_URL,
].filter(Boolean);

// Aplica os cabeçalhos de CORS quando a origem é permitida.
// Retorna true se a requisição era um preflight OPTIONS já respondido.
export function applyCors(req, res, methods = "POST, OPTIONS") {
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", methods);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "3600");
  }
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true;
  }
  return false;
}

// Extrai o token "Bearer" do cabeçalho Authorization (ou null).
export function getBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
}

// ---- Verificação de JWT ----
//
// O Supabase assina os tokens de duas formas, dependendo do projeto:
//   - Legado: HS256 com um segredo compartilhado (SUPABASE_JWT_SECRET);
//   - Atual (chaves "sb_publishable_..."): assimétrico (ES256/RS256), em que
//     a assinatura é verificada com a chave pública publicada no JWKS do
//     projeto. Não existe segredo compartilhado nesse modo.
// Suportamos os dois: o algoritmo do cabeçalho do token decide o caminho.

let jwksCache = { keys: null, fetchedAt: 0 };
const JWKS_TTL_MS = 10 * 60 * 1000;

async function getJwks(forceRefresh) {
  const now = Date.now();
  if (!forceRefresh && jwksCache.keys && now - jwksCache.fetchedAt < JWKS_TTL_MS) {
    return jwksCache.keys;
  }
  const res = await fetch(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`);
  if (!res.ok) throw new Error(`JWKS respondeu ${res.status}`);
  const data = await res.json();
  jwksCache = { keys: data.keys || [], fetchedAt: now };
  return jwksCache.keys;
}

function decodeHeader(token) {
  try {
    return JSON.parse(Buffer.from(token.split(".")[0], "base64url").toString());
  } catch {
    return null;
  }
}

// Retorna o payload verificado, ou null se o token for inválido/expirado.
export async function verifyToken(token) {
  const header = decodeHeader(token);
  if (!header || !header.alg) return null;

  // Caminho legado: segredo compartilhado.
  if (header.alg === "HS256") {
    if (!SUPABASE_JWT_SECRET) return null;
    try {
      return jwt.verify(token, SUPABASE_JWT_SECRET, { algorithms: ["HS256"] });
    } catch {
      return null;
    }
  }

  // Caminho atual: chave pública do JWKS do projeto.
  if (!SUPABASE_URL) return null;
  try {
    let keys = await getJwks(false);
    let jwk = keys.find((k) => k.kid === header.kid);
    // kid desconhecido pode ser rotação de chave: recarrega uma vez.
    if (!jwk) {
      keys = await getJwks(true);
      jwk = keys.find((k) => k.kid === header.kid);
    }
    if (!jwk) return null;

    const publicKey = createPublicKey({ key: jwk, format: "jwk" });
    return jwt.verify(token, publicKey, { algorithms: ["ES256", "RS256"] });
  } catch (err) {
    console.error("[auth] Falha ao verificar token via JWKS:", err.message);
    return null;
  }
}

// Há como validar tokens? (segredo legado OU URL do projeto para o JWKS)
export const isJwtConfigured = () => !!(SUPABASE_JWT_SECRET || SUPABASE_URL);
