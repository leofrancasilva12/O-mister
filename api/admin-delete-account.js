// Exclui uma conta (conversas, perfil e usuário do Auth) a partir do
// painel de admin. Só o e-mail em ADMIN_EMAIL pode chamar isto.

import { applyCors, getBearerToken, verifyToken, isJwtConfigured } from "../lib/http.js";
import { getServiceRoleClient } from "../lib/supabase-admin.js";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== "POST") {
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

  const adminEmail = String(decoded.email || "").toLowerCase();
  if (!ADMIN_EMAIL || adminEmail !== ADMIN_EMAIL) {
    return res.status(403).json({ error: "Acesso negado." });
  }

  const { userId, confirm } = req.body || {};
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "userId obrigatório." });
  }
  if (confirm !== true) {
    return res.status(400).json({ error: "Deleção requer confirmação explícita (confirm: true)." });
  }

  const supabase = getServiceRoleClient();
  if (!supabase) {
    return res.status(500).json({ error: "Serviço não configurado no servidor." });
  }

  try {
    // Trava de segurança: não deixa o admin se auto-deletar por aqui.
    const { data: targetUser, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    if (getUserError || !targetUser?.user) {
      return res.status(404).json({ error: "Conta não encontrada." });
    }
    if (String(targetUser.user.email || "").toLowerCase() === ADMIN_EMAIL) {
      return res.status(400).json({ error: "Não é possível deletar a própria conta de admin por aqui." });
    }

    const { error: deleteConvError } = await supabase
      .from("conversations")
      .delete()
      .eq("user_id", userId);
    if (deleteConvError) {
      console.error("Erro ao deletar conversas:", deleteConvError);
      return res.status(500).json({ error: "Falha ao deletar conversas." });
    }

    const { error: deleteProfileError } = await supabase
      .from("user_profiles")
      .delete()
      .eq("user_id", userId);
    if (deleteProfileError) {
      console.error("Erro ao deletar perfil:", deleteProfileError);
      return res.status(500).json({ error: "Falha ao deletar perfil." });
    }

    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error("Erro ao deletar usuário do Auth:", deleteAuthError);
      return res.status(500).json({ error: "Falha ao deletar usuário." });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erro na deleção de conta (admin):", err);
    return res.status(500).json({ error: "Erro ao deletar conta." });
  }
}
