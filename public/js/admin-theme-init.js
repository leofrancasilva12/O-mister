// Aplica o tema salvo antes do primeiro paint, para não piscar.
// Externo por causa da CSP (script-src não permite inline).
(function () {
  try {
    var t = localStorage.getItem("omister.theme.v1");
    if (!t) {
      t = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    if (t === "dark") document.documentElement.setAttribute("data-theme", "dark");
  } catch (e) {}
})();
