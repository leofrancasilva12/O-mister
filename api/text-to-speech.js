import { applyCors, getBearerToken, verifyToken, isJwtConfigured } from "../lib/http.js";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  // Autenticação obrigatória (falha fechada)
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Token obrigatório." });
  }

  if (!isJwtConfigured()) {
    console.error("SUPABASE_JWT_SECRET não configurada — TTS bloqueado.");
    return res.status(500).json({ error: "Serviço não configurado no servidor." });
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }

  if (!ELEVENLABS_API_KEY) {
    return res.status(500).json({
      error: "Serviço TTS não configurado.",
    });
  }

  const { text, voiceId = "pNInz6obpgDQGcFmaJgB" } = req.body || {};

  if (!text || typeof text !== "string" || text.length === 0) {
    return res.status(400).json({ error: "Text obrigatório." });
  }

  if (text.length > 5000) {
    return res.status(400).json({ error: "Texto muito longo (máx 5000 caracteres)." });
  }

  if (typeof voiceId !== "string" || voiceId.length > 50) {
    return res.status(400).json({ error: "Voice ID inválido." });
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_flash_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("ElevenLabs error:", response.status, await response.text());
      return res.status(500).json({
        error: "Não foi possível gerar áudio.",
      });
    }

    const audioBuffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.end(Buffer.from(audioBuffer));
  } catch (err) {
    console.error("TTS error:", err);
    return res.status(500).json({
      error: "Erro ao gerar áudio.",
    });
  }
}
