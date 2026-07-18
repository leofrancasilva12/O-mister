(function () {
  var googleBtn = document.getElementById("google-btn");
  var form = document.getElementById("email-form");
  var emailInput = document.getElementById("email-input");
  var emailBtn = document.getElementById("email-btn");
  var msg = document.getElementById("auth-msg");
  var configWarn = document.getElementById("auth-config-warn");

  function showMsg(text, kind) {
    msg.textContent = text;
    msg.className = "auth-msg " + (kind || "info");
    msg.hidden = false;
  }

  // URL para onde o Supabase volta após autenticar (raiz = o app).
  var redirectTo = window.location.origin + "/";

  if (!window.OMISTER || !window.OMISTER.isConfigured) {
    // Supabase ainda não configurado: mostra aviso e desabilita as ações.
    configWarn.hidden = false;
    googleBtn.disabled = true;
    emailInput.disabled = true;
    emailBtn.disabled = true;
    return;
  }

  // Já logado? vai direto pro app.
  OMISTER.auth.getSession().then(function (res) {
    if (res && res.data && res.data.session) {
      window.location.replace("index.html");
    }
  });

  googleBtn.addEventListener("click", function () {
    googleBtn.disabled = true;
    OMISTER.auth
      .signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo } })
      .then(function (res) {
        if (res && res.error) {
          googleBtn.disabled = false;
          showMsg("Não foi possível iniciar o login com Google: " + res.error.message, "error");
        }
      })
      .catch(function (e) {
        googleBtn.disabled = false;
        showMsg("Erro: " + e.message, "error");
      });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = emailInput.value.trim();
    if (!email) return;

    emailBtn.disabled = true;
    emailBtn.textContent = "Enviando...";
    OMISTER.auth
      .signInWithOtp({ email: email, options: { emailRedirectTo: redirectTo } })
      .then(function (res) {
        emailBtn.disabled = false;
        emailBtn.textContent = "Enviar link de acesso";
        if (res && res.error) {
          showMsg("Erro ao enviar: " + res.error.message, "error");
        } else {
          showMsg("Enviamos um link de acesso para " + email + ". Confira sua caixa de entrada.", "ok");
          form.reset();
        }
      })
      .catch(function (err) {
        emailBtn.disabled = false;
        emailBtn.textContent = "Enviar link de acesso";
        showMsg("Erro: " + err.message, "error");
      });
  });
})();
