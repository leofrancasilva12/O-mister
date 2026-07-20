import { buildSystemPrompt } from "../lib/system-prompt.js";
import { applyCors, getBearerToken, verifyToken, isJwtConfigured } from "../lib/http.js";

const MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-haiku-4.5";
const MAX_HISTORY = 20;

// Limites de payload de imagem (base64) para evitar abuso/custo/DoS.
const MAX_IMAGES = 4;
const MAX_IMAGE_CHARS = 3_000_000; // ~2 MB por imagem em base64

// Rate limiting: máximo 30 requisições por minuto por IP/usuário.
// Observação: em serverless o Map é por-instância; um limite robusto exige
// um store compartilhado (ex.: Vercel KV/Upstash). Aqui evitamos apenas abuso
// trivial e vazamento de memória (poda de entradas expiradas).
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map();

function pruneRateLimit(now) {
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetTime) rateLimitMap.delete(key);
  }
}

function checkRateLimit(key) {
  const now = Date.now();
  pruneRateLimit(now);
  const entry = rateLimitMap.get(key) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

  if (now > entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + RATE_LIMIT_WINDOW;
  }

  entry.count++;
  rateLimitMap.set(key, entry);

  return entry.count <= RATE_LIMIT_MAX;
}

function getRateLimitKey(req, userId) {
  // Prioriza usuário autenticado, senão usa IP
  if (userId) return `user:${userId}`;
  const ip = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.socket.remoteAddress || "unknown";
  return `ip:${ip}`;
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const token = getBearerToken(req);
  let userId = null;

  // Se um token foi enviado, ele DEVE ser válido (falha fechada). Requisições
  // sem token continuam permitidas (modo convidado), mas rate-limitadas por IP.
  if (token) {
    if (!isJwtConfigured()) {
      return res.status(500).json({ error: "Serviço não configurado no servidor." });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }
    userId = decoded.sub;
  }

  // Verifica rate limit
  const rateLimitKey = getRateLimitKey(req, userId);
  if (!checkRateLimit(rateLimitKey)) {
    return res.status(429).json({
      error: "Muitas requisições. Tente novamente em alguns instantes.",
    });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "OPENROUTER_API_KEY não configurada no ambiente.",
    });
  }

  const { messages, userName } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Envie ao menos uma mensagem." });
  }

  if (messages.length > MAX_HISTORY * 2) {
    return res.status(400).json({ error: "Histórico muito longo." });
  }

  // Sanitiza userName: apenas alphanuméricas, espaços e hífen, máx 50 caracteres
  let sanitizedUserName = "";
  if (typeof userName === "string") {
    sanitizedUserName = userName
      .slice(0, 50)
      .replace(/[^a-zA-ZÀ-ÿ0-9\s\-]/g, "")
      .trim();
  }

  // Valida estrutura de cada mensagem
  for (const msg of messages) {
    if (!msg || typeof msg !== "object") {
      return res.status(400).json({ error: "Formato inválido." });
    }
    if (msg.role !== "user" && msg.role !== "assistant") {
      return res.status(400).json({ error: "Role deve ser 'user' ou 'assistant'." });
    }
    if (!msg.content) {
      return res.status(400).json({ error: "Content obrigatório." });
    }
  }

  // Mantém apenas as últimas trocas para não crescer o contexto sem limite.
  // Suporta tanto texto puro quanto arrays (visão).
  const history = messages.slice(-MAX_HISTORY).map(({ role, content }) => {
    const msg = { role: role === "assistant" ? "assistant" : "user" };

    // Se content é array (visão com imagens), passa como está; senão normaliza como texto
    if (Array.isArray(content)) {
      let imageCount = 0;
      msg.content = content.map((part) => {
        if (part.type === "text") {
          return { type: "text", text: String(part.text ?? "").slice(0, 4000) };
        }
        if (part.type === "image_url" && part.image_url?.url) {
          const url = part.image_url.url;
          // Valida base64 de imagem
          if (!url.startsWith("data:image/")) {
            return { type: "text", text: "[Imagem inválida]" };
          }
          // Limita quantidade e tamanho para evitar abuso/custo/DoS
          if (imageCount >= MAX_IMAGES) {
            return { type: "text", text: "[Imagem ignorada: limite excedido]" };
          }
          if (url.length > MAX_IMAGE_CHARS) {
            return { type: "text", text: "[Imagem muito grande]" };
          }
          imageCount++;
          return part;
        }
        return { type: "text", text: "[Conteúdo inválido]" };
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
        temperature: 0.5, // um pouco mais alta: tom natural e caloroso
        messages: [
          {
            role: "system",
            content: buildSystemPrompt() + (sanitizedUserName ? `\n\nO nome do usuário é ${sanitizedUserName}. Chame-o pelo nome com naturalidade e calor — ao cumprimentar, ao iniciar respostas importantes ou para deixar o papo mais próximo. Não force em toda frase, mas seja um colega simpático, não um manual.` : "")
          },
          ...history,
        ],
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error("Erro da OpenRouter:", upstream.status, detail);
      // Retorna mensagem genérica ao cliente, nunca detalhes do servidor
      return res.status(500).json({
        error: "Não foi possível gerar a resposta. Tente novamente.",
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
