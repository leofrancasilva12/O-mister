/* Login por biometria (WebAuthn/passkeys), em script clássico.
   A biblioteca @simplewebauthn/browser só é baixada quando o usuário
   realmente tenta cadastrar ou entrar por biometria (mesmo padrão de
   carregamento sob demanda usado em auth.js para o supabase-js). */
(function () {
  var CDN = "https://cdn.jsdelivr.net/npm/@simplewebauthn/browser@13.3.0/dist/bundle/index.umd.min.js";
  var libPromise = null;

  function loadLib() {
    if (!libPromise) {
      libPromise = new Promise(function (resolve, reject) {
        if (window.SimpleWebAuthnBrowser) return resolve(window.SimpleWebAuthnBrowser);
        var s = document.createElement("script");
        s.src = CDN;
        s.onload = function () { resolve(window.SimpleWebAuthnBrowser); };
        s.onerror = function () {
          reject(new Error("Não foi possível carregar o suporte a biometria."));
        };
        document.head.appendChild(s);
      });
    }
    return libPromise;
  }

  function isSupported() {
    return !!window.PublicKeyCredential;
  }

  // Verificação nativa do navegador — não precisa da biblioteca pra isso,
  // então pode rodar em toda carga de página sem custo de rede extra.
  async function isPlatformAuthenticatorAvailable() {
    if (!isSupported()) return false;
    try {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (e) {
      return false;
    }
  }

  async function apiFetch(path, opts) {
    var res = await fetch(path, opts);
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) {
      var err = new Error(data.error || "Falha na requisição.");
      err.status = res.status;
      throw err;
    }
    return data;
  }

  // Cadastra o dispositivo atual (impressão digital / Face ID) na conta
  // já autenticada.
  async function registerCredential(accessToken, deviceName) {
    var lib = await loadLib();
    var optionsRes = await apiFetch("/api/webauthn-register-options", {
      method: "POST",
      headers: { Authorization: "Bearer " + accessToken },
    });
    var attResp = await lib.startRegistration({ optionsJSON: optionsRes.options });
    await apiFetch("/api/webauthn-register-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + accessToken },
      body: JSON.stringify({ response: attResp, ticket: optionsRes.ticket, deviceName: deviceName || "" }),
    });
  }

  // Faz login por biometria (antes de ter sessão). Retorna {tokenHash, type}
  // pra ser trocado por uma sessão de verdade via OMISTER.auth.verifyOtp.
  async function loginWithCredential(email) {
    var lib = await loadLib();
    var optionsRes = await apiFetch("/api/webauthn-login-options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email }),
    });
    var authResp = await lib.startAuthentication({ optionsJSON: optionsRes.options });
    return apiFetch("/api/webauthn-login-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response: authResp, ticket: optionsRes.ticket }),
    });
  }

  function listCredentials(accessToken) {
    return apiFetch("/api/webauthn-credentials", {
      headers: { Authorization: "Bearer " + accessToken },
    }).then(function (data) { return data.credentials; });
  }

  function removeCredential(accessToken, id) {
    return apiFetch("/api/webauthn-credentials", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + accessToken },
      body: JSON.stringify({ id: id }),
    });
  }

  window.OMISTER_WEBAUTHN = {
    isSupported: isSupported,
    isPlatformAuthenticatorAvailable: isPlatformAuthenticatorAvailable,
    registerCredential: registerCredential,
    loginWithCredential: loginWithCredential,
    listCredentials: listCredentials,
    removeCredential: removeCredential,
  };
})();
