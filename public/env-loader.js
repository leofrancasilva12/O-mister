/* Carrega .env.local em tempo de desenvolvimento */
(async function() {
  try {
    const res = await fetch('../.env.local');
    if (!res.ok) return; // Arquivo não existe (normal em produção)

    const text = await res.text();
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        if (key.trim()) {
          // Injeta no window para o app.js acessar
          window[key.trim()] = value;
        }
      }
    }
  } catch (e) {
    // Silencioso — pode não estar em servidor
  }
})();
