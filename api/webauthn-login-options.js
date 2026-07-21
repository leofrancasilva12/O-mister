import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { applyCors } from "../lib/http.js";
import { getServiceRoleClient, findUserByEmail } from "../lib/supabase-admin.js";
import { isWebauthnConfigured, getRpConfig, signChallengeTicket } from "../lib/webauthn.js";
import { isRateLimited } from "../lib/rate-limit.js";

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_SEC = 60;

function getIp(req) {
  return req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown";
}

// Gera as opções para autenticar por biometria, ANTES do login (endpoint
// público). O e-mail identifica de quem são as credenciais permitidas.
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

  const { email } = req.body || {};
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Informe o e-mail." });
  }

  const supabase = getServiceRoleClient();
  if (!supabase) {
    return res.status(500).json({ error: "Serviço não configurado no servidor." });
  }

  const genericError = { error: "Nenhum login por biometria cadastrado para esse e-mail." };

  try {
    const user = await findUserByEmail(supabase, email);
    if (!user) {
      return res.status(404).json(genericError);
    }

    const { data: credentials, error } = await supabase
      .from("webauthn_credentials")
      .select("credential_id, transports")
      .eq("user_id", user.id);

    if (error) throw error;
    if (!credentials || credentials.length === 0) {
      return res.status(404).json(genericError);
    }

    const { rpID } = getRpConfig(req);

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "preferred",
      allowCredentials: credentials.map((c) => ({
        id: c.credential_id,
        transports: safeParseTransports(c.transports),
      })),
    });

    const ticket = signChallengeTicket({
      purpose: "login",
      userId: user.id,
      challenge: options.challenge,
    });

    return res.status(200).json({ options, ticket });
  } catch (err) {
    console.error("Erro ao gerar opções de login WebAuthn:", err);
    return res.status(500).json({ error: "Falha ao preparar o login." });
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
