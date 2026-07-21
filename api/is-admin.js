import { applyCors, getBearerToken, verifyToken, isJwtConfigured } from "../lib/http.js";

// Checagem leve (sem consultar o banco) usada só para decidir se o botão
// de admin aparece no chat. A autorização de verdade continua sendo
// feita pelo /api/admin-stats a cada requisição.
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

export default async function handler(req, res) {
  if (applyCors(req, res, "GET, OPTIONS")) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  if (!isJwtConfigured() || !ADMIN_EMAIL) {
    return res.status(200).json({ isAdmin: false });
  }

  const token = getBearerToken(req);
  if (!token) {
    return res.status(200).json({ isAdmin: false });
  }

  const decoded = await verifyToken(token);
  const email = decoded ? String(decoded.email || "").toLowerCase() : "";

  return res.status(200).json({ isAdmin: email === ADMIN_EMAIL });
}
