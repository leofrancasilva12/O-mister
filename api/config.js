// DEPRECATED: Este endpoint foi removido por questões de segurança.
// Nunca exponha API keys públicas, mesmo que "secretas".
// Para TTS, use um endpoint proxy autenticado em /api/text-to-speech.

export default function handler(req, res) {
  return res.status(410).json({
    error: "Este endpoint foi removido.",
    message: "Use um endpoint proxy autenticado para TTS.",
  });
}
