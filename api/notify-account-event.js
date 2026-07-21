// Recebe eventos de cadastro/exclusão de conta (chamado pelo trigger do
// Postgres via pg_net — ver db/admin-notifications.sql) e envia um e-mail
// de aviso para o admin usando a API do Resend.

const NOTIFY_WEBHOOK_SECRET = process.env.NOTIFY_WEBHOOK_SECRET;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const NOTIFY_FROM = process.env.NOTIFY_FROM_EMAIL || "O Mister <onboarding@resend.dev>";

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

  if (!RESEND_API_KEY || !ADMIN_EMAIL) {
    console.error("RESEND_API_KEY ou ADMIN_EMAIL não configurados — e-mail de notificação não enviado.");
    // Não é erro do chamador (o trigger do banco): confirma recebimento mesmo assim.
    return res.status(200).json({ received: true, emailSent: false });
  }

  const isSignup = event === "signup";
  const subject = isSignup ? "Novo cadastro no O Mister" : "Conta deletada no O Mister";
  const when = created_at ? new Date(created_at).toLocaleString("pt-BR") : new Date().toLocaleString("pt-BR");
  const text = isSignup
    ? `Novo cadastro: ${email}\nData: ${when}`
    : `Conta deletada: ${email}\nData: ${when}`;

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: ADMIN_EMAIL,
        subject,
        text,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      console.error("Falha ao enviar e-mail de notificação:", resp.status, detail);
      return res.status(200).json({ received: true, emailSent: false });
    }

    return res.status(200).json({ received: true, emailSent: true });
  } catch (err) {
    console.error("Erro ao chamar a API do Resend:", err);
    return res.status(200).json({ received: true, emailSent: false });
  }
}
