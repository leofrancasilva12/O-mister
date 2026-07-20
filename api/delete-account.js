import { createClient } from "@supabase/supabase-js";
import { applyCors, getBearerToken, verifyToken, isJwtConfigured } from "../lib/http.js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Token obrigatório." });
  }

  // Falha fechada: sem secret configurado não há como validar o dono do token,
  // e um endpoint destrutivo nunca deve confiar num JWT não verificado.
  if (!isJwtConfigured()) {
    console.error("SUPABASE_JWT_SECRET não configurada — deleção bloqueada.");
    return res.status(500).json({ error: "Serviço não configurado no servidor." });
  }

  const decoded = await verifyToken(token);
  if (!decoded || !decoded.sub) {
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
      console.error("Erro ao deletar usuário do Auth:", deleteAuthError);
    }

    return res.status(200).json({
      success: true,
      authDeleted: !deleteAuthError,
      message: "Conta, conversas e perfil foram permanentemente deletados.",
    });
  } catch (err) {
    console.error("Erro na deleção de conta:", err);
    return res.status(500).json({ error: "Erro ao deletar conta." });
  }
}
