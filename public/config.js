/* =========================================================
   Configuração do Supabase (login + conversas na conta).

   Preencha com os dados do SEU projeto Supabase:
     Painel Supabase → Project Settings → API
       - Project URL   → SUPABASE_URL
       - anon public   → SUPABASE_ANON_KEY   (pode ficar pública)

   Enquanto estiver com os valores de exemplo abaixo, o app roda
   em "modo local" (conversas só no navegador, sem login).
   Passo a passo completo: veja SUPABASE-SETUP.md
   ========================================================= */
window.OMISTER_CONFIG = {
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || "",
};
