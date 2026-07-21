import { generateRegistrationOptions } from "@simplewebauthn/server";
import { isoUint8Array } from "@simplewebauthn/server/helpers";
import { applyCors, getBearerToken, verifyToken, isJwtConfigured } from "../lib/http.js";
import { getServiceRoleClient } from "../lib/supabase-admin.js";
import { isWebauthnConfigured, getRpConfig, signChallengeTicket } from "../lib/webauthn.js";

// Gera as opções para cadastrar uma nova credencial (digital/Face ID) na
// conta do usuário já autenticado. O usuário precisa estar logado por
// e-mail/Google primeiro — biometria é sempre um atalho para uma conta
// que já existe, nunca a forma de criar uma.
export default async function handler(req, res) {
  if (applyCors(req, res, "POST, OPTIONS")) return;

  if (req.method !== "POST") {
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

  try {
    const { data: existing, error } = await supabase
      .from("webauthn_credentials")
      .select("credential_id")
      .eq("user_id", decoded.sub);

    if (error) throw error;

    const { rpName, rpID } = getRpConfig(req);

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userName: decoded.email || decoded.sub,
      userID: isoUint8Array.fromUTF8String(decoded.sub),
      attestationType: "none",
      excludeCredentials: (existing || []).map((c) => ({ id: c.credential_id })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        authenticatorAttachment: "platform",
      },
    });

    const ticket = signChallengeTicket({
      purpose: "register",
      userId: decoded.sub,
      challenge: options.challenge,
    });

    return res.status(200).json({ options, ticket });
  } catch (err) {
    console.error("Erro ao gerar opções de cadastro WebAuthn:", err);
    return res.status(500).json({ error: "Falha ao preparar o cadastro." });
  }
}
