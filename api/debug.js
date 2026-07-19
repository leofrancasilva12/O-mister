export default function handler(req, res) {
  const keys = {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? "✅ Configurada" : "❌ NÃO configurada",
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET ? "✅ Configurada" : "❌ NÃO configurada",
    SUPABASE_URL: process.env.SUPABASE_URL ? "✅ Configurada" : "❌ NÃO configurada",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Configurada" : "❌ NÃO configurada",
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY ? "✅ Configurada" : "❌ NÃO configurada",
    NODE_ENV: process.env.NODE_ENV || "não definido",
  };

  return res.status(200).json({
    status: "debug",
    environment: keys,
    timestamp: new Date().toISOString()
  });
}
