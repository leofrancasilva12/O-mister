// Helpers compartilhados pelos endpoints de login por biometria (WebAuthn).
import jwt from "jsonwebtoken";

const RP_NAME = "O Mister";
const CHALLENGE_SECRET = process.env.WEBAUTHN_CHALLENGE_SECRET;

// Sem essa env var, o recurso fica desligado (falha fechada).
export function isWebauthnConfigured() {
  return Boolean(CHALLENGE_SECRET);
}

// rpID/origin são derivados da própria requisição (não de uma env var fixa),
// para funcionar tanto em produção quanto em preview deployments da Vercel
// — WebAuthn exige que rpID/origin batam exatamente com o domínio usado
// pelo navegador.
export function getRpConfig(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const proto = req.headers["x-forwarded-proto"] || "https";
  const rpID = String(host).split(":")[0];
  const origin = `${proto}://${host}`;
  return { rpName: RP_NAME, rpID, origin };
}

// "Ticket" assinado com o challenge da cerimônia WebAuthn: evita precisar de
// armazenamento de estado entre a etapa de "opções" e a de "verificação"
// (funções serverless são stateless / podem cair em instâncias diferentes).
export function signChallengeTicket(payload) {
  return jwt.sign(payload, CHALLENGE_SECRET, { expiresIn: "5m" });
}

// Retorna o payload do ticket, ou null se inválido/expirado.
export function verifyChallengeTicket(ticket) {
  if (!ticket || typeof ticket !== "string") return null;
  try {
    return jwt.verify(ticket, CHALLENGE_SECRET);
  } catch {
    return null;
  }
}
