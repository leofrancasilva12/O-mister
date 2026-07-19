/* Carrega config do backend (Vercel env vars) */
(async function() {
  try {
    const res = await fetch("/api/config");
    if (res.ok) {
      const data = await res.json();
      if (data.elevenlabsApiKey) {
        window.ELEVENLABS_API_KEY = data.elevenlabsApiKey;
      }
    }
  } catch (e) {
    // Silencioso — fallback para localStorage
  }
})();
