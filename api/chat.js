import { buildSystemPrompt } from "../lib/system-prompt.js";
import { applyCors, getBearerToken, verifyToken, isJwtConfigured } from "../lib/http.js";
import { isRateLimited } from "../lib/rate-limit.js";
import { getServiceRoleClient } from "../lib/supabase-admin.js";
import { sendAdminEmail } from "../lib/notify.js";

const MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4.5";
const MAX_HISTORY = 20;

// Alerta por e-mail quando o consumo do dia passa desse tanto de tokens.
// Sem essa env var, a checagem fica desligada (custo zero extra).
const DAILY_TOKEN_LIMIT = process.env.DAILY_TOKEN_LIMIT ? parseInt(process.env.DAILY_TOKEN_LIMIT, 10) : null;

// Limites de payload de imagem (base64) para evitar abuso/custo/DoS.
const MAX_IMAGES = 4;
const MAX_IMAGE_CHARS = 3_000_000; // ~2 MB por imagem em base64

// Rate limiting: máximo 30 requisições por minuto por IP/usuário.
// O store compartilhado (Vercel KV/Upstash) é usado quando configurado;
// caso contrário há fallback em memória. Ver lib/rate-limit.js.
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_SEC = 60;

// Grava o consumo de tokens reportado pela OpenRouter, para o painel de
// admin (ver api/admin-stats.js). Nunca deve derrubar a resposta do chat —
// falha aqui só é logada no servidor.
async function logTokenUsage(userId, usage) {
  if (!usage) return;
  const supabase = getServiceRoleClient();
  if (!supabase) return; // SUPABASE_SERVICE_ROLE_KEY não configurada: silenciosamente ignora

  try {
    const { error } = await supabase.from("token_usage").insert({
      user_id: userId,
      model: MODEL,
      prompt_tokens: usage.prompt_tokens ?? 0,
      completion_tokens: usage.completion_tokens ?? 0,
      total_tokens: usage.total_tokens ?? 0,
    });
    if (error) console.error("Falha ao registrar consumo de tokens:", error);
  } catch (err) {
    console.error("Falha ao registrar consumo de tokens:", err);
  }

  await maybeAlertDailyLimit(supabase);
}

// Verifica se o consumo de hoje passou do limite configurado e, se sim,
// manda um e-mail — só uma vez por dia (dedupe via daily_alert_log).
async function maybeAlertDailyLimit(supabase) {
  if (!DAILY_TOKEN_LIMIT || !supabase) return;

  try {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("token_usage")
      .select("total_tokens")
      .gte("created_at", todayStart.toISOString());
    if (error) throw error;

    const todayTotal = (data || []).reduce((sum, row) => sum + (row.total_tokens || 0), 0);
    if (todayTotal < DAILY_TOKEN_LIMIT) return;

    const alertDate = todayStart.toISOString().slice(0, 10);
    const { error: insertError } = await supabase
      .from("daily_alert_log")
      .insert({ alert_date: alertDate });

    if (insertError) {
      // 23505 = unique_violation: já alertou hoje, não manda de novo.
      if (insertError.code !== "23505") console.error("Falha ao registrar alerta diário:", insertError);
      return;
    }

    await sendAdminEmail({
      subject: "Limite diário de tokens atingido no O Mister",
      text: `O consumo de hoje (${alertDate}) chegou a ${todayTotal} tokens, passando do limite configurado (${DAILY_TOKEN_LIMIT}).`,
    });
  } catch (err) {
    console.error("Falha ao checar limite diário de tokens:", err);
  }
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
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }
    userId = decoded.sub;
  }

  // Verifica rate limit
  const rateLimitKey = getRateLimitKey(req, userId);
  if (await isRateLimited(rateLimitKey, { max: RATE_LIMIT_MAX, windowSec: RATE_LIMIT_WINDOW_SEC })) {
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

  // Prompt caching (Anthropic, repassado pela OpenRouter): marca o último
  // bloco da mensagem mais recente do histórico, para que o próximo turno
  // desta mesma conversa reaproveite o prefixo (system + histórico) já
  // processado, em vez de pagar o custo total de novo a cada mensagem.
  if (history.length > 0) {
    const last = history[history.length - 1];
    const parts = Array.isArray(last.content)
      ? [...last.content]
      : [{ type: "text", text: last.content }];
    parts[parts.length - 1] = { ...parts[parts.length - 1], cache_control: { type: "ephemeral" } };
    last.content = parts;
  }

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
        stream_options: { include_usage: true }, // inclui contagem de tokens no chunk final, para o painel de admin
        max_tokens: 1024, // respostas concisas e diretas
        temperature: 0.5, // um pouco mais alta: tom natural e caloroso
        messages: [
          {
            role: "system",
            // Bloco estável (persona + base de conhecimento) com cache_control:
            // idêntico em todas as conversas, então o cache é reaproveitado
            // entre usuários diferentes. O nome do usuário vem depois, sem
            // cache, pois muda por pessoa.
            content: [
              { type: "text", text: buildSystemPrompt(), cache_control: { type: "ephemeral" } },
              ...(sanitizedUserName
                ? [{ type: "text", text: `O nome do usuário é ${sanitizedUserName}. Chame-o pelo nome com naturalidade e calor — ao cumprimentar, ao iniciar respostas importantes ou para deixar o papo mais próximo. Não force em toda frase, mas seja um colega simpático, não um manual.` }]
                : []),
            ],
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
    let usage = null;

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
          await logTokenUsage(userId, usage);
          return res.end();
        }

        try {
          const parsed = JSON.parse(payload);
          if (parsed.usage) {
            usage = parsed.usage;
          }
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            res.write(`data: ${JSON.stringify({ delta })}\n\n`);
          }
        } catch {
          // Fragmento não-JSON (keep-alive da OpenRouter): ignora.
        }
      }
    }

    await logTokenUsage(userId, usage);
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
