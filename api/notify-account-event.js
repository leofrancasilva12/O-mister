// Recebe eventos de cadastro/exclusão de conta (chamado pelo trigger do
// Postgres via pg_net — ver db/admin-notifications.sql) e envia um e-mail
// de aviso para o admin.

import { sendAdminEmail } from "../lib/notify.js";

const NOTIFY_WEBHOOK_SECRET = process.env.NOTIFY_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  // Falha fechada: sem o segredo configurado, ninguém consegue disparar isso.
  if (!NOTIFY_WEBHOOK_SECRET) {
    console.error("NOTIFY_WEBHOOK_SECRET não configurada — notificação bloqueada.");
    return res.status(500).json({ error: "Serviço não configurado no servidor." });
  }

  const providedSecret = req.headers["x-notify-secret"];
  if (providedSecret !== NOTIFY_WEBHOOK_SECRET) {
    return res.status(401).json({ error: "Não autorizado." });
  }

  const { event, email, created_at } = req.body || {};
  if (event !== "signup" && event !== "delete") {
    return res.status(400).json({ error: "Evento inválido." });
  }

  const isSignup = event === "signup";
  const subject = isSignup ? "Novo cadastro no O Mister" : "Conta deletada no O Mister";
  const when = created_at ? new Date(created_at).toLocaleString("pt-BR") : new Date().toLocaleString("pt-BR");
  const text = isSignup
    ? `Novo cadastro: ${email}\nData: ${when}`
    : `Conta deletada: ${email}\nData: ${when}`;

  const emailSent = await sendAdminEmail({ subject, text });
  return res.status(200).json({ received: true, emailSent });
}
