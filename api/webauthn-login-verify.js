import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { applyCors } from "../lib/http.js";
import { getServiceRoleClient } from "../lib/supabase-admin.js";
import { isWebauthnConfigured, getRpConfig, verifyChallengeTicket } from "../lib/webauthn.js";
import { isRateLimited } from "../lib/rate-limit.js";

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_SEC = 60;

function getIp(req) {
  return req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown";
}

// Confere a resposta do navegador (navigator.credentials.get) e, se válida,
// gera um link de login (via Admin API) que o cliente troca por uma sessão
// de verdade com auth.verifyOtp — não existe uma forma direta de "mintar"
// uma sessão do Supabase a partir do servidor além desse mecanismo.
export default async function handler(req, res) {
  if (applyCors(req, res, "POST, OPTIONS")) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  if (!isWebauthnConfigured()) {
    return res.status(500).json({ error: "Login por biometria não configurado no servidor." });
  }

  if (await isRateLimited(`webauthn-login:${getIp(req)}`, { max: RATE_LIMIT_MAX, windowSec: RATE_LIMIT_WINDOW_SEC })) {
    return res.status(429).json({ error: "Muitas tentativas. Tente novamente em instantes." });
  }

  const { response, ticket } = req.body || {};
  if (!response || !ticket) {
    return res.status(400).json({ error: "Requisição incompleta." });
  }

  const claims = verifyChallengeTicket(ticket);
  if (!claims || claims.purpose !== "login") {
    return res.status(400).json({ error: "Login expirado ou inválido. Tente novamente." });
  }

  const supabase = getServiceRoleClient();
  if (!supabase) {
    return res.status(500).json({ error: "Serviço não configurado no servidor." });
  }

  try {
    const { data: stored, error: fetchError } = await supabase
      .from("webauthn_credentials")
      .select("id, user_id, credential_id, public_key, counter, transports")
      .eq("credential_id", response.id)
      .eq("user_id", claims.userId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!stored) {
      return res.status(400).json({ error: "Credencial não reconhecida." });
    }

    const { rpID, origin } = getRpConfig(req);

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: claims.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: stored.credential_id,
        publicKey: isoBase64URL.toBuffer(stored.public_key),
        counter: Number(stored.counter),
        transports: safeParseTransports(stored.transports),
      },
    });

    if (!verification.verified) {
      return res.status(400).json({ error: "Não foi possível confirmar a biometria." });
    }

    await supabase
      .from("webauthn_credentials")
      .update({ counter: verification.authenticationInfo.newCounter, last_used_at: new Date().toISOString() })
      .eq("id", stored.id);

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(stored.user_id);
    if (userError || !userData?.user?.email) throw userError || new Error("Usuário sem e-mail.");

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: userData.user.email,
    });
    if (linkError) throw linkError;

    return res.status(200).json({
      tokenHash: linkData.properties.hashed_token,
      type: "magiclink",
    });
  } catch (err) {
    console.error("Erro ao verificar login WebAuthn:", err);
    return res.status(500).json({ error: "Falha ao concluir o login." });
  }
}

function safeParseTransports(raw) {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}
