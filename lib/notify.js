// Envio de e-mail para o admin via Resend. Compartilhado entre o webhook
// de cadastro/exclusão (api/notify-account-event.js) e o alerta de limite
// diário de tokens (api/chat.js).

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const NOTIFY_FROM = process.env.NOTIFY_FROM_EMAIL || "O Mister <onboarding@resend.dev>";

// Retorna true se o e-mail foi enviado com sucesso. Nunca lança — falha de
// e-mail nunca deve derrubar o fluxo que a chamou.
export async function sendAdminEmail({ subject, text }) {
  if (!RESEND_API_KEY || !ADMIN_EMAIL) {
    console.error("RESEND_API_KEY ou ADMIN_EMAIL não configurados — e-mail não enviado.");
    return false;
  }

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: NOTIFY_FROM, to: ADMIN_EMAIL, subject, text }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      console.error("Falha ao enviar e-mail:", resp.status, detail);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Erro ao chamar a API do Resend:", err);
    return false;
  }
}
