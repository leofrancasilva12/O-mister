/* =========================================================
   Páginas de base de conhecimento (normas-api.html, curso-roscas.html)

   Pega o HTML já convertido do Markdown (dentro de #docs-article) e:
   - agrupa o conteúdo em <section> por h1/h2, casando com a árvore da TOC
   - gera a TOC lateral a partir dos headings (h1/h2/h3 com id)
   - filtra por texto (linhas de tabela, parágrafos e itens de lista)
   - aplica o tema claro/escuro salvo (mesma chave do app principal)
   - controla o menu lateral em telas pequenas
   ========================================================= */
(function () {
  var THEME_KEY = "omister.theme.v1";

  /* ---------- Tema (mesma lógica do app principal) ---------- */
  function applyTheme(theme) {
    var root = document.documentElement;
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    var moon = document.getElementById("docs-theme-icon-moon");
    var sun = document.getElementById("docs-theme-icon-sun");
    if (moon && sun) {
      moon.hidden = theme === "dark";
      sun.hidden = theme !== "dark";
    }
  }

  function initTheme() {
    var theme = localStorage.getItem(THEME_KEY);
    if (!theme) {
      theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    applyTheme(theme);
  }

  function toggleTheme() {
    var isDark = document.documentElement.getAttribute("data-theme") === "dark";
    var next = isDark ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  initTheme(); // aplica antes do resto pra evitar flash

  /* ---------- Normalização de texto (busca sem acento/case) ---------- */
  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/["'\u2018\u2019\u201c\u201d\u2033]/g, "")
      .replace(/\s+/g, " ");
  }

  /* ---------- Agrupa o HTML plano em <section> por h1 / h2 ---------- */
  function wrapSections(article) {
    var children = Array.prototype.slice.call(article.children);
    var h1Section = null;
    var h2Section = null;

    children.forEach(function (el) {
      var tag = el.tagName;
      if (tag === "H1") {
        h1Section = document.createElement("section");
        h1Section.className = "docs-section docs-section-h1";
        h1Section.dataset.level = "1";
        article.insertBefore(h1Section, el);
        h1Section.appendChild(el);
        h2Section = null;
      } else if (tag === "H2") {
        var parent = h1Section || article;
        h2Section = document.createElement("section");
        h2Section.className = "docs-section docs-section-h2";
        h2Section.dataset.level = "2";
        parent.appendChild(h2Section);
        h2Section.appendChild(el);
      } else {
        var target = h2Section || h1Section || article;
        target.appendChild(el);
      }
    });
  }

  /* ---------- Envolve tabelas em wrapper com scroll horizontal ---------- */
  function wrapTables(article) {
    article.querySelectorAll("table").forEach(function (table) {
      var wrap = document.createElement("div");
      wrap.className = "docs-table-wrap";
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  /* ---------- Esconde o índice manual duplicado do markdown ---------- */
  function hideManualIndex(article) {
    var indiceHeading = Array.prototype.find.call(
      article.querySelectorAll("h2"),
      function (h) { return normalize(h.textContent).trim() === "indice"; }
    );
    if (!indiceHeading) return;
    var section = indiceHeading.closest(".docs-section");
    if (section) section.classList.add("docs-md-index-section", "docs-section-hidden");
  }

  /* ---------- Gera a TOC lateral a partir dos headings ---------- */
  function buildToc(article, tocEl) {
    var headings = article.querySelectorAll("h1[id], h2[id], h3[id]");
    var frag = document.createDocumentFragment();
    var indexSection = article.querySelector(".docs-md-index-section");

    headings.forEach(function (h) {
      if (indexSection && indexSection.contains(h)) return;
      var level = h.tagName.toLowerCase();
      var item = document.createElement("div");
      item.className = "docs-toc-item docs-toc-" + level;
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      item.appendChild(a);
      frag.appendChild(item);
      h.dataset.tocLinked = "1";
    });
    tocEl.appendChild(frag);
  }

  /* ---------- Scrollspy simples: marca o item ativo da TOC ---------- */
  function initScrollspy(article, tocEl) {
    var headings = Array.prototype.slice.call(article.querySelectorAll("h1[id], h2[id], h3[id]"));
    var links = tocEl.querySelectorAll("a");
    var linkById = {};
    links.forEach(function (a) { linkById[a.getAttribute("href").slice(1)] = a; });

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var scrollPos = (document.getElementById("docs-main") || window).scrollTop || window.scrollY || 0;
        var current = null;
        headings.forEach(function (h) {
          if (h.offsetTop - 90 <= scrollPos) current = h;
        });
        links.forEach(function (a) { a.classList.remove("docs-toc-active"); });
        if (current && linkById[current.id]) linkById[current.id].classList.add("docs-toc-active");
        ticking = false;
      });
    }
    var scrollHost = document.getElementById("docs-main");
    (scrollHost || window).addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Busca / filtro ---------- */
  function initSearch(article, input, clearBtn, countEl, emptyStateEl, searchWrap) {
    var allRows = article.querySelectorAll("tbody tr");
    var proseEls = article.querySelectorAll("p, li");
    var sections = article.querySelectorAll(".docs-section");

    function clearHighlights(el) {
      el.querySelectorAll("mark.docs-mark").forEach(function (m) {
        var parent = m.parentNode;
        parent.replaceChild(document.createTextNode(m.textContent), m);
        parent.normalize();
      });
    }

    function highlight(el, query) {
      if (!query) return;
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      var textNodes = [];
      var node;
      while ((node = walker.nextNode())) {
        if (node.parentNode.tagName !== "SCRIPT" && node.nodeValue.trim()) textNodes.push(node);
      }
      textNodes.forEach(function (tn) {
        var norm = normalize(tn.nodeValue);
        var idx = norm.indexOf(query);
        if (idx === -1) return;
        var raw = tn.nodeValue;
        var before = raw.slice(0, idx);
        var match = raw.slice(idx, idx + query.length);
        var after = raw.slice(idx + query.length);
        var frag = document.createDocumentFragment();
        frag.appendChild(document.createTextNode(before));
        var markEl = document.createElement("mark");
        markEl.className = "docs-mark";
        markEl.textContent = match;
        frag.appendChild(markEl);
        frag.appendChild(document.createTextNode(after));
        tn.parentNode.replaceChild(frag, tn);
      });
    }

    function reset() {
      allRows.forEach(function (tr) { tr.classList.remove("docs-row-hidden"); });
      proseEls.forEach(function (el) { el.style.display = ""; });
      sections.forEach(function (s) {
        if (!s.classList.contains("docs-md-index-section")) s.classList.remove("docs-section-hidden");
      });
      article.querySelectorAll(".docs-table-wrap").forEach(function (w) { w.style.display = ""; });
      clearHighlights(article);
      countEl.textContent = "";
      emptyStateEl.classList.remove("docs-visible");
    }

    function runSearch(rawQuery) {
      var query = normalize(rawQuery.trim());
      searchWrap.classList.toggle("has-value", rawQuery.length > 0);
      clearHighlights(article);
      if (!query) { reset(); return; }

      var visibleCount = 0;

      // 1) linhas de tabela
      allRows.forEach(function (tr) {
        var match = normalize(tr.textContent).indexOf(query) !== -1;
        tr.classList.toggle("docs-row-hidden", !match);
        if (match) { visibleCount++; highlight(tr, query); }
      });

      // 2) esconde tabelas 100% vazias
      article.querySelectorAll(".docs-table-wrap").forEach(function (wrap) {
        var visible = wrap.querySelectorAll("tbody tr:not(.docs-row-hidden)").length;
        wrap.style.display = visible ? "" : "none";
      });

      // 3) parágrafos e itens de lista (fora de tabela)
      proseEls.forEach(function (el) {
        var match = normalize(el.textContent).indexOf(query) !== -1;
        el.style.display = match ? "" : "none";
        if (match) { visibleCount++; highlight(el, query); }
      });

      // 4) esconde headings que não têm nada visível abaixo nem batem no próprio texto
      var allSections = Array.prototype.slice.call(sections).reverse(); // filhos antes dos pais
      allSections.forEach(function (s) {
        if (s.classList.contains("docs-md-index-section")) return;
        var headingMatches = normalize(s.querySelector("h1, h2, h3") ? s.querySelector("h1, h2, h3").textContent : "").indexOf(query) !== -1;
        var hasVisibleContent = s.querySelector(
          "tbody tr:not(.docs-row-hidden), p:not([style*='display: none']), li:not([style*='display: none']), .docs-section:not(.docs-section-hidden)"
        );
        var show = headingMatches || !!hasVisibleContent;
        s.classList.toggle("docs-section-hidden", !show);
        if (headingMatches) visibleCount++;
      });

      countEl.textContent = visibleCount ? visibleCount + " resultado" + (visibleCount === 1 ? "" : "s") : "nenhum resultado";
      emptyStateEl.classList.toggle("docs-visible", visibleCount === 0);
    }

    var debounceTimer = null;
    input.addEventListener("input", function () {
      clearTimeout(debounceTimer);
      var val = input.value;
      debounceTimer = setTimeout(function () { runSearch(val); }, 120);
    });
    clearBtn.addEventListener("click", function () {
      input.value = "";
      input.focus();
      searchWrap.classList.remove("has-value");
      reset();
    });
  }

  /* ---------- Menu mobile ---------- */
  function initMobileNav() {
    var app = document.getElementById("docs-app");
    var openBtn = document.getElementById("docs-open-toc");
    var closeBtn = document.getElementById("docs-close-toc");
    var overlay = document.getElementById("docs-overlay");
    function open() { app.classList.add("docs-sidebar-open"); }
    function close() { app.classList.remove("docs-sidebar-open"); }
    if (openBtn) openBtn.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    if (overlay) overlay.addEventListener("click", close);
    document.getElementById("docs-toc").addEventListener("click", function (e) {
      if (e.target.tagName === "A") close();
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    var article = document.getElementById("docs-article");
    var tocEl = document.getElementById("docs-toc");
    if (!article || !tocEl) return;

    wrapSections(article);
    wrapTables(article);
    hideManualIndex(article);
    buildToc(article, tocEl);
    initScrollspy(article, tocEl);

    var searchInput = document.getElementById("docs-search-input");
    var searchClear = document.getElementById("docs-search-clear");
    var searchCount = document.getElementById("docs-search-count");
    var emptyState = document.getElementById("docs-empty-state");
    var searchWrap = document.getElementById("docs-search-wrap");
    if (searchInput) initSearch(article, searchInput, searchClear, searchCount, emptyState, searchWrap);

    initMobileNav();

    var themeBtn = document.getElementById("docs-theme-btn");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
  });
})();
