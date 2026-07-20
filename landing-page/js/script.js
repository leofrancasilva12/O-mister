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

  /* ---------- 1. Cascata automática ----------
     Containers marcados com data-stagger transformam seus filhos em
     elementos animados, com atraso crescente — sem precisar escrever
     data-delay um por um no HTML.                                     */
  var grupos = document.querySelectorAll("[data-stagger]");

  for (var g = 0; g < grupos.length; g++) {
    var grupo = grupos[g];
    var tipo = grupo.getAttribute("data-stagger") || "up";
    var passo = parseFloat(grupo.getAttribute("data-passo")) || 0.07;
    var filhos = grupo.children;

    for (var f = 0; f < filhos.length; f++) {
      var filho = filhos[f];
      filho.classList.add("reveal");
      filho.setAttribute("data-reveal", tipo);
      filho.style.setProperty("--d", (f * passo).toFixed(2) + "s");
    }
  }

  /* ---------- 2. Revelação dos elementos ao rolar ---------- */
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

  /* ---------- 3. Barra de progresso de leitura ---------- */
  var barra = document.getElementById("progresso-barra");
  var topoFixo = document.getElementById("topo-fixo");
  var btnTopo = document.getElementById("voltar-topo");
  var hero = document.getElementById("topo");
  var aguardando = false;

  function aoRolar() {
    var y = window.pageYOffset || document.documentElement.scrollTop;

    // Progresso: quanto da página já foi percorrido.
    if (barra) {
      var total =
        document.documentElement.scrollHeight - window.innerHeight;
      var pct = total > 0 ? (y / total) * 100 : 0;
      barra.style.width = Math.min(pct, 100).toFixed(2) + "%";
    }

    // Cabeçalho e botão aparecem depois que o topo sai da tela.
    var limite = hero ? hero.offsetHeight * 0.75 : 500;
    if (topoFixo) topoFixo.classList.toggle("visivel", y > limite);
    if (btnTopo) btnTopo.classList.toggle("visivel", y > limite);

    aguardando = false;
  }

  /* Clique no botão: sobe suavemente (ou direto, se o usuário
     preferir menos movimento). */
  if (btnTopo) {
    btnTopo.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: semMovimento ? "auto" : "smooth" });
    });
  }

  function pedirAtualizacao() {
    if (!aguardando) {
      aguardando = true;
      requestAnimationFrame(aoRolar);
    }
  }

  window.addEventListener("scroll", pedirAtualizacao, { passive: true });
  window.addEventListener("resize", pedirAtualizacao, { passive: true });
  aoRolar();

  /* ---------- 4. Máquina de escrever no título ---------- */
  var FRASES = [
    "na hora que você precisa.",
    "fundamentado nas normas.",
    "sem parar para procurar.",
    "direto ao ponto."
  ];

  var elFrase = document.getElementById("frase-rotativa");
  var cursorTitulo = document.getElementById("cursor-titulo");

  function rotacionarTitulo() {
    if (!elFrase) return;

    // Com movimento reduzido, mantém a primeira frase fixa.
    if (semMovimento) {
      if (cursorTitulo) cursorTitulo.style.display = "none";
      return;
    }

    var indice = 0;
    var pos = FRASES[0].length; // começa com a primeira frase já escrita
    var apagando = false;

    function ciclo() {
      var frase = FRASES[indice];

      if (apagando) {
        pos--;
        elFrase.textContent = frase.slice(0, pos);
        if (pos === 0) {
          apagando = false;
          indice = (indice + 1) % FRASES.length;
          setTimeout(ciclo, 320);
        } else {
          setTimeout(ciclo, 28);
        }
      } else {
        pos++;
        elFrase.textContent = frase.slice(0, pos);
        if (pos === frase.length) {
          apagando = true;
          setTimeout(ciclo, 2400); // pausa lendo a frase completa
        } else {
          setTimeout(ciclo, 55);
        }
      }
    }

    // Deixa a primeira frase visível um tempo antes de começar a girar.
    setTimeout(function () { apagando = true; ciclo(); }, 2800);
  }

  rotacionarTitulo();

  /* ---------- 5. Conversa em ciclo na simulação do app ---------- */
  var CONVERSA = [
    {
      pergunta: "Qual a diferença entre conexões EUE e NUE?",
      resposta:
        "EUE (External Upset End) possui reforço externo na extremidade do tubo, " +
        "oferecendo maior resistência mecânica na conexão. NUE (Non-Upset End) não " +
        "tem esse reforço, mantendo o diâmetro externo uniforme. Na prática, EUE é " +
        "indicada quando há maior exigência de carga axial."
    },
    {
      pergunta: "Quando usar API 5CT em vez de 5L?",
      resposta:
        "API 5CT trata de tubos para revestimento e produção (casing e tubing), " +
        "usados na construção do poço. API 5L cobre tubulação de linha, para " +
        "transporte de óleo e gás. A escolha segue a aplicação: poço ou duto."
    },
    {
      pergunta: "Decodifique 9 5/8\" 47# P110 BTC",
      resposta:
        "9 5/8\" e o diametro externo nominal. 47# e o peso nominal, 47 lb/ft, " +
        "que define a espessura de parede. P110 e o grau do aco conforme API 5CT " +
        "(110 ksi de limite de escoamento minimo). BTC e Buttress Thread Casing. " +
        "A espessura exata esta na tabela da API 5CT, conforme a edicao em uso."
    },
    {
      pergunta: "O que a API Q1 exige no controle de documentos?",
      resposta:
        "A norma pede procedimento documentado que garanta aprovação antes do uso, " +
        "análise crítica e atualização quando necessário, identificação das alterações " +
        "e da versão vigente, além de disponibilidade da versão correta no ponto de uso."
    }
  ];

  var elResposta = document.getElementById("app-resposta");
  var elCursor = document.getElementById("app-cursor");
  var elPergunta = document.getElementById("app-pergunta");
  var msgUsuario = document.getElementById("app-msg-usuario");
  var msgMister = document.getElementById("app-msg-mister");
  var demo = document.getElementById("app-demo");

  function digitar(texto, aoTerminar) {
    var i = 0;
    if (elCursor) elCursor.classList.add("ativo");

    function proximo() {
      i += 2;
      elResposta.textContent = texto.slice(0, i);
      if (i < texto.length) {
        setTimeout(proximo, 18);
      } else {
        if (elCursor) elCursor.classList.remove("ativo");
        if (aoTerminar) setTimeout(aoTerminar, 3200);
      }
    }
    proximo();
  }

  function mostrarItem(indice) {
    var item = CONVERSA[indice];
    if (!elResposta || !elPergunta) return;

    elPergunta.textContent = item.pergunta;
    elResposta.textContent = "";

    // Reinicia a animação de entrada das duas mensagens.
    [msgUsuario, msgMister].forEach(function (el) {
      if (!el) return;
      el.classList.remove("saindo", "entrando");
      void el.offsetWidth; // força o navegador a reiniciar a animação
      el.classList.add("entrando");
    });

    digitar(item.resposta, function () {
      // Some com as mensagens e passa para a próxima pergunta.
      [msgUsuario, msgMister].forEach(function (el) {
        if (el) el.classList.add("saindo");
      });
      setTimeout(function () {
        mostrarItem((indice + 1) % CONVERSA.length);
      }, 480);
    });
  }

  function iniciarDemo() {
    if (!elResposta || !elPergunta) return;

    if (semMovimento) {
      // Sem animação: mostra a primeira pergunta e resposta já prontas.
      elPergunta.textContent = CONVERSA[0].pergunta;
      elResposta.textContent = CONVERSA[0].resposta;
      if (elCursor) elCursor.style.display = "none";
      return;
    }

    mostrarItem(0);
  }

  if (demo && "IntersectionObserver" in window && !semMovimento) {
    var obsDemo = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            iniciarDemo();
            obsDemo.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    obsDemo.observe(demo);
  } else {
    iniciarDemo();
  }
})();
