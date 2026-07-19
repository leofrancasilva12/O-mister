import jwt from "jsonwebtoken";

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

function verifyToken(token) {
  if (!SUPABASE_JWT_SECRET) {
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
  // CORS
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
  }

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  // Autenticação obrigatória
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Token obrigatório." });
  }

  if (SUPABASE_JWT_SECRET) {
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }
  }
  // Sem secret: aceita qualquer token (fallback para desenvolvimento)

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
