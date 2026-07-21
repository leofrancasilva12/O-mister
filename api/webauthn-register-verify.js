import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { applyCors, getBearerToken, verifyToken, isJwtConfigured } from "../lib/http.js";
import { getServiceRoleClient } from "../lib/supabase-admin.js";
import { isWebauthnConfigured, getRpConfig, verifyChallengeTicket } from "../lib/webauthn.js";

const MAX_DEVICE_NAME = 60;

// Confere a resposta do navegador (navigator.credentials.create) e salva a
// credencial nova, associada ao usuário autenticado.
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

  const { response, ticket, deviceName } = req.body || {};
  if (!response || !ticket) {
    return res.status(400).json({ error: "Requisição incompleta." });
  }

  const claims = verifyChallengeTicket(ticket);
  if (!claims || claims.purpose !== "register" || claims.userId !== decoded.sub) {
    return res.status(400).json({ error: "Cadastro expirado ou inválido. Tente novamente." });
  }

  const supabase = getServiceRoleClient();
  if (!supabase) {
    return res.status(500).json({ error: "Serviço não configurado no servidor." });
  }

  try {
    const { rpID, origin } = getRpConfig(req);

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: claims.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ error: "Não foi possível confirmar a biometria." });
    }

    const { credential } = verification.registrationInfo;
    const safeName =
      typeof deviceName === "string" ? deviceName.slice(0, MAX_DEVICE_NAME).trim() : "";

    const { error } = await supabase.from("webauthn_credentials").insert({
      user_id: decoded.sub,
      credential_id: credential.id,
      public_key: isoBase64URL.fromBuffer(credential.publicKey),
      counter: credential.counter,
      transports: JSON.stringify(credential.transports || []),
      device_name: safeName || null,
    });

    if (error) {
      // 23505 = unique_violation: essa credencial já estava cadastrada.
      if (error.code === "23505") {
        return res.status(409).json({ error: "Esse dispositivo já está cadastrado." });
      }
      throw error;
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Erro ao verificar cadastro WebAuthn:", err);
    return res.status(500).json({ error: "Falha ao confirmar o cadastro." });
  }
}
