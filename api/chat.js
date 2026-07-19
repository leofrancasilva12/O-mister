import { buildSystemPrompt } from "../lib/system-prompt.js";
import jwt from "jsonwebtoken";

const MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-haiku-4.5";
const MAX_HISTORY = 20;
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

// Rate limiting: máximo 30 requisições por minuto por IP/usuário
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map();

function checkRateLimit(key) {
  const now = Date.now();
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

function verifyToken(token) {
  if (!SUPABASE_JWT_SECRET) {
    console.warn("SUPABASE_JWT_SECRET não configurada, JWT validation desabilitada");
    return null;
  }

  try {
    return jwt.verify(token, SUPABASE_JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch (err) {
    return null;
  }
}

export default async function handler(req, res) {
  console.log("[CHAT] Requisição recebida:", {
    method: req.method,
    url: req.url,
    hasAuth: !!req.headers.authorization,
  });

  try {
    // CORS: aceita apenas requisições do mesmo origin
    const origin = req.headers.origin || "";
    const allowedOrigins = [
      "https://mister-intelligence.vercel.app",
      "http://localhost:3000",
      "http://localhost:5173",
    ];

    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.setHeader("Access-Control-Max-Age", "3600");
    }

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido." });
    }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  let userId = null;

  if (token) {
    // Se há secret configurado, valida token
    if (SUPABASE_JWT_SECRET) {
      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: "Token inválido ou expirado." });
      }
      userId = decoded.sub;
    }
    // Se não há secret, aceita qualquer token (fallback para desenvolvimento)
  } else {
    console.log("Requisição sem token de autenticação");
  }

  // Verifica rate limit
  const rateLimitKey = getRateLimitKey(req, userId);
  if (!checkRateLimit(rateLimitKey)) {
    return res.status(429).json({
      error: "Muitas requisições. Tente novamente em alguns instantes.",
    });
  }

  console.log("[CHAT] Validações passadas, processando body...");

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("[CHAT] ERRO: OPENROUTER_API_KEY não configurada");
    return res.status(500).json({
      error: "OPENROUTER_API_KEY não configurada no ambiente.",
    });
  }

  const { messages, userName } = req.body || {};
  console.log("[CHAT] Body recebido:", {
    messagesCount: messages?.length,
    hasUserName: !!userName,
  });

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
      msg.content = content.map((part) => {
        if (part.type === "text") {
          return { type: "text", text: String(part.text ?? "").slice(0, 4000) };
        }
        if (part.type === "image_url" && part.image_url?.url) {
          // Valida base64 de imagem
          if (!part.image_url.url.startsWith("data:image/")) {
            return { type: "text", text: "[Imagem inválida]" };
          }
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
    console.log("[CHAT] Construindo system prompt...");
    const systemPrompt = buildSystemPrompt();
    console.log("[CHAT] System prompt construído, chamando OpenRouter...");

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
          {
            role: "system",
            content: systemPrompt + (sanitizedUserName ? `\n\nO usuário se chama ${sanitizedUserName}. Use seu nome ocasionalmente para personalizar as respostas.` : "")
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
    console.error("ERRO NO /api/chat:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    if (!res.headersSent) {
      return res.status(500).json({
        error: "Não foi possível gerar a resposta.",
        debug: err.message
      });
    } else {
      res.end();
    }
  }
}
