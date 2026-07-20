/* =========================================================
   MIOG — Landing page
   Animações: revelação ao rolar, contador e efeito de digitação
   na simulação do aplicativo.

   Tudo é progressivo: se o JavaScript falhar ou o usuário preferir
   menos movimento, o conteúdo continua visível e legível.
   ========================================================= */

(function () {
  "use strict";

  var semMovimento =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Revelação dos elementos ao rolar ---------- */
  var alvos = document.querySelectorAll(".reveal");

  function mostrarTudo() {
    for (var i = 0; i < alvos.length; i++) alvos[i].classList.add("visivel");
  }

  if (semMovimento || !("IntersectionObserver" in window)) {
    // Sem animação: exibe imediatamente.
    mostrarTudo();
  } else {
    var observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("visivel");
            observador.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    for (var j = 0; j < alvos.length; j++) observador.observe(alvos[j]);
  }

  /* ---------- 2. Contador numérico do hero ---------- */
  var contadores = document.querySelectorAll("[data-contador]");

  function animarContador(el) {
    var alvo = parseInt(el.getAttribute("data-contador"), 10);
    if (isNaN(alvo)) return;

    if (semMovimento) {
      el.textContent = String(alvo);
      return;
    }

    var duracao = 1100;
    var inicio = null;

    function passo(agora) {
      if (inicio === null) inicio = agora;
      var progresso = Math.min((agora - inicio) / duracao, 1);
      // easing suave na saída
      var suave = 1 - Math.pow(1 - progresso, 3);
      el.textContent = String(Math.round(alvo * suave));
      if (progresso < 1) requestAnimationFrame(passo);
    }

    requestAnimationFrame(passo);
  }

  for (var k = 0; k < contadores.length; k++) {
    (function (el) {
      // Pequeno atraso para acompanhar a entrada do hero.
      setTimeout(function () { animarContador(el); }, 500);
    })(contadores[k]);
  }

  /* ---------- 3. Efeito de digitação na simulação do app ---------- */
  var RESPOSTA =
    "EUE (External Upset End) tem reforço externo na extremidade do tubo, " +
    "oferecendo maior resistência mecânica na conexão. NUE (Non-Upset End) " +
    "não possui esse reforço, mantendo o diâmetro externo uniforme. Na prática, " +
    "EUE é indicada quando há maior exigência de carga axial.";

  var elResposta = document.getElementById("app-resposta");
  var elCursor = document.getElementById("app-cursor");
  var demo = document.getElementById("app-demo");

  function digitar() {
    if (!elResposta) return;

    if (semMovimento) {
      elResposta.textContent = RESPOSTA;
      return;
    }

    var i = 0;
    if (elCursor) elCursor.classList.add("ativo");

    function proximo() {
      // Escreve alguns caracteres por quadro: rápido, mas ainda legível.
      i += 2;
      elResposta.textContent = RESPOSTA.slice(0, i);

      if (i < RESPOSTA.length) {
        setTimeout(proximo, 18);
      } else if (elCursor) {
        // Some com o cursor pouco depois de terminar.
        setTimeout(function () { elCursor.classList.remove("ativo"); }, 1600);
      }
    }

    proximo();
  }

  if (demo && "IntersectionObserver" in window && !semMovimento) {
    var obsDemo = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            digitar();
            obsDemo.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    obsDemo.observe(demo);
  } else {
    // Sem suporte a observer (ou movimento reduzido): mostra o texto pronto.
    digitar();
  }
})();
