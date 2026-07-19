export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  // Nota: Por enquanto, apenas faz logout.
  // Deletar a conta requer SUPABASE_SERVICE_ROLE_KEY configurada no Vercel,
  // o que é opcional. A deleção real dos dados (conversas, perfil) pode ser
  // feita via RLS policies (Row Level Security) no Supabase se implementado.

  return res.status(200).json({
    success: true,
    message: "Logout realizado. Sua conta continuará existindo para possível reativação."
  });
}
