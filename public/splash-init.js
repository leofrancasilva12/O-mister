// Decide antes de renderizar: splash só aparece logo após o login.
// Fica em arquivo externo (e não inline) para respeitar a CSP sem
// precisar de 'unsafe-inline' em script-src.
try {
  if (sessionStorage.getItem("omister.justLoggedIn") !== "1") {
    document.documentElement.classList.add("no-splash");
  }
} catch (e) {}
