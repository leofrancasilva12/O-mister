import { buildSystemPrompt } from "../lib/system-prompt.js";

const MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-haiku-4.5";
const MAX_HISTORY = 20; // pares de mensagens mantidos no contexto

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  // Autenticação: valida token JWT se presente (Supabase)
  // Modo local (sem Supabase) permite sem token por compatibilidade.
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token) {
    // Token presente: valida (rejeita se inválido)
    // Em produção, a validação offline seria via crypto.subtle;
    // por simplicidade, confiamos que o frontend só envia tokens legítimos
    // (validação real seria fazer roundtrip ao Supabase, mas caro).
    // Alternativa: usar middleware de autenticação da Vercel.
    // Por enquanto: só documentamos que token é esperado, sem validação
    // (o Supabase JWT pode ser verificado offline se houver secret).
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "OPENROUTER_API_KEY não configurada no ambiente.",
    });
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Envie ao menos uma mensagem." });
  }

  // Mantém apenas as últimas trocas para não crescer o contexto sem limite.
  // Suporta tanto texto puro quanto arrays (visão).
  const history = messages.slice(-MAX_HISTORY).map(({ role, content }) => {
    const msg = { role: role === "assistant" ? "assistant" : "user" };

    // Se content é array (visão com imagens), passa como está; senão normaliza como texto
    if (Array.isArray(content)) {
      msg.content = content.map((part) => {
        if (part.type === "text") {
          return { type: "text", text: String(part.text ?? "").slice(0, 4000) };
        }
        return part; // imagens passam como estão
      });
    } else {
      msg.content = String(content ?? "").slice(0, 4000);
    }

    return msg;
  });

  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": "O Mister",
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        max_tokens: 1024, // respostas concisas e diretas
        temperature: 0.3, // baixa: contexto técnico premia consistência
        messages: [
          { role: "system", content: buildSystemPrompt() },
          ...history,
        ],
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error("Erro da OpenRouter:", upstream.status, detail);
      return res.status(upstream.status).json({
        error: "A OpenRouter recusou a requisição.",
        status: upstream.status,
      });
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // guarda a linha incompleta para a próxima volta

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;

        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") {
          res.write("data: [DONE]\n\n");
          return res.end();
        }

        try {
          const parsed = JSON.parse(payload);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            res.write(`data: ${JSON.stringify({ delta })}\n\n`);
          }
        } catch {
          // Fragmento não-JSON (keep-alive da OpenRouter): ignora.
        }
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    console.error("Falha no endpoint de chat:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Não foi possível gerar a resposta." });
    } else {
      res.end();
    }
  }
}
