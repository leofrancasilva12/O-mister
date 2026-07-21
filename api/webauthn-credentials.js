import { applyCors, getBearerToken, verifyToken, isJwtConfigured } from "../lib/http.js";
import { getServiceRoleClient } from "../lib/supabase-admin.js";
import { isWebauthnConfigured } from "../lib/webauthn.js";

// Lista (GET) ou remove (DELETE) as credenciais de biometria do usuário
// autenticado — usado na tela de Configurações.
export default async function handler(req, res) {
  if (applyCors(req, res, "GET, DELETE, OPTIONS")) return;

  if (req.method !== "GET" && req.method !== "DELETE") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  if (!isWebauthnConfigured()) {
    return res.status(500).json({ error: "Login por biometria não configurado no servidor." });
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

  const supabase = getServiceRoleClient();
  if (!supabase) {
    return res.status(500).json({ error: "Serviço não configurado no servidor." });
  }

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("webauthn_credentials")
        .select("id, device_name, created_at, last_used_at")
        .eq("user_id", decoded.sub)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        credentials: (data || []).map((c) => ({
          id: c.id,
          deviceName: c.device_name || "Dispositivo sem nome",
          createdAt: c.created_at,
          lastUsedAt: c.last_used_at,
        })),
      });
    } catch (err) {
      console.error("Erro ao listar credenciais WebAuthn:", err);
      return res.status(500).json({ error: "Falha ao carregar dispositivos." });
    }
  }

  // DELETE
  const id = req.query?.id || (req.body && req.body.id);
  if (!id) {
    return res.status(400).json({ error: "Informe o dispositivo a remover." });
  }

  try {
    const { data, error } = await supabase
      .from("webauthn_credentials")
      .delete()
      .eq("id", id)
      .eq("user_id", decoded.sub) // garante que só remove credencial do próprio usuário
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Dispositivo não encontrado." });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erro ao remover credencial WebAuthn:", err);
    return res.status(500).json({ error: "Falha ao remover dispositivo." });
  }
}
