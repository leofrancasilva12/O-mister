import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  // Valida autenticação via JWT
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token de autenticação necessário." });
  }

  const token = authHeader.slice(7);

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: "Supabase não configurado no servidor." });
  }

  try {
    // Cria cliente Supabase com service role (acesso administrativo)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Verifica o token para obter o user_id
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: "Token inválido." });
    }

    const userId = user.id;

    // Deleta os dados do usuário em cascata (conversas, perfil, etc.)
    // A tabela user_profiles será deletada automaticamente pela constraint
    await supabase.from("conversations").delete().eq("user_id", userId);
    await supabase.from("user_profiles").delete().eq("user_id", userId);

    // Deleta a conta do usuário
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) {
      return res.status(500).json({ error: "Erro ao deletar conta: " + deleteError.message });
    }

    return res.status(200).json({ success: true, message: "Conta deletada com sucesso." });
  } catch (err) {
    console.error("Erro ao deletar conta:", err);
    return res.status(500).json({ error: "Erro ao deletar conta." });
  }
}
