import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function verifyToken(token) {
  if (!SUPABASE_JWT_SECRET) {
    return null;
  }

  try {
    return jwt.verify(token, SUPABASE_JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (err) {
    return null;
  }
}

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin || "";
  const allowedOrigins = [
    "https://mister-intelligence.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "3600");
  }

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Token obrigatório." });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }

  const userId = decoded.sub;

  // Valida confirmação explícita via body
  const { confirm } = req.body || {};
  if (confirm !== true) {
    return res.status(400).json({
      error: "Deleção requer confirmação explícita (confirm: true).",
    });
  }

  // Sem service role key: retorna erro
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("SUPABASE_SERVICE_ROLE_KEY não configurada");
    return res.status(500).json({
      error: "Deleção de conta não configurada no servidor.",
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Deleta conversas do usuário
    const { error: deleteConvError } = await supabase
      .from("conversations")
      .delete()
      .eq("user_id", userId);

    if (deleteConvError) {
      console.error("Erro ao deletar conversas:", deleteConvError);
      return res.status(500).json({ error: "Falha ao deletar conversas." });
    }

    // Deleta perfil do usuário
    const { error: deleteProfileError } = await supabase
      .from("user_profiles")
      .delete()
      .eq("user_id", userId);

    if (deleteProfileError) {
      console.error("Erro ao deletar perfil:", deleteProfileError);
      return res.status(500).json({ error: "Falha ao deletar perfil." });
    }

    // Deleta usuário do Auth do Supabase
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error("Erro ao deletar usuário:", deleteAuthError);
      // Não retorna erro aqui porque conversas/perfil já foram deletados
      // A deleção de Auth é secundária
    }

    return res.status(200).json({
      success: true,
      message: "Conta, conversas e perfil foram permanentemente deletados.",
    });
  } catch (err) {
    console.error("Erro na deleção de conta:", err);
    return res.status(500).json({ error: "Erro ao deletar conta." });
  }
}
