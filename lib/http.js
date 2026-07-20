// Helpers compartilhados pelos endpoints serverless: CORS + validação de JWT.
// Centraliza a lista de origens e a verificação de token para evitar
// duplicação e comportamento divergente entre /api/*.

import jwt from "jsonwebtoken";

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

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

// Verifica a assinatura do JWT. Lança se o secret não estiver configurado
// (falha fechada) e retorna o payload decodificado ou null se inválido.
export function verifyToken(token) {
  if (!SUPABASE_JWT_SECRET) {
    throw new Error("SUPABASE_JWT_SECRET não configurada");
  }
  try {
    return jwt.verify(token, SUPABASE_JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    return null;
  }
}

export const isJwtConfigured = () => !!SUPABASE_JWT_SECRET;
