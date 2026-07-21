/* Painel de admin: exige login e checa autorização no servidor
   (/api/admin-stats), que só libera para o e-mail em ADMIN_EMAIL. */
(function () {
  var STATES = ["admin-state-loading", "admin-state-login", "admin-state-denied", "admin-state-error", "admin-content"];
  var currentAccounts = [];
  var currentToken = null;

  function show(id) {
    STATES.forEach(function (elId) {
      var el = document.getElementById(elId);
      if (el) el.hidden = elId !== id;
    });
  }

  function formatNumber(n) {
    return new Intl.NumberFormat("pt-BR").format(n || 0);
  }

  function formatDate(iso) {
    if (!iso) return "—";
    try {
      return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
    } catch (e) {
      return iso;
    }
  }

  function formatUsd(n) {
    return "US$ " + (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatBrl(n) {
    return "R$ " + (n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function renderChart(byDay) {
    var chart = document.getElementById("admin-daily-chart");
    var empty = document.getElementById("admin-daily-empty");
    chart.innerHTML = "";

    if (!byDay || byDay.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    var ordered = byDay.slice().reverse(); // API manda mais recente primeiro; gráfico lê da esquerda (mais antigo) pra direita
    var max = Math.max.apply(null, ordered.map(function (d) { return d.total; }));

    ordered.forEach(function (day) {
      var bar = document.createElement("div");
      bar.className = "admin-chart-bar";
      var pct = max > 0 ? Math.max((day.total / max) * 100, 2) : 2;
      bar.style.height = pct + "%";
      var dayNum = day.date.slice(8, 10);
      bar.title = day.date + " — " + formatNumber(day.total) + " tokens (" + formatUsd(day.costUsd) + ")";
      bar.setAttribute("aria-label", bar.title);
      chart.appendChild(bar);
    });
  }

  function renderAccountsTable(filterText) {
    var accountsBody = document.getElementById("admin-accounts-body");
    var accountsEmpty = document.getElementById("admin-accounts-empty");
    var noMatch = document.getElementById("admin-accounts-no-match");
    accountsBody.innerHTML = "";

    if (currentAccounts.length === 0) {
      accountsEmpty.hidden = false;
      noMatch.hidden = true;
      return;
    }
    accountsEmpty.hidden = true;

    var needle = (filterText || "").trim().toLowerCase();
    var filtered = needle
      ? currentAccounts.filter(function (a) { return a.email.toLowerCase().indexOf(needle) !== -1; })
      : currentAccounts;

    noMatch.hidden = filtered.length > 0;

    filtered.forEach(function (account) {
      var tr = document.createElement("tr");

      var tdEmail = document.createElement("td");
      tdEmail.textContent = account.email;

      var tdDate = document.createElement("td");
      tdDate.textContent = formatDate(account.createdAt);

      var tdTokens = document.createElement("td");
      tdTokens.textContent = formatNumber(account.tokensUsed);

      var tdActions = document.createElement("td");
      var delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "admin-row-delete";
      delBtn.textContent = "Excluir";
      delBtn.addEventListener("click", function () { deleteAccount(account); });
      tdActions.appendChild(delBtn);

      tr.appendChild(tdEmail);
      tr.appendChild(tdDate);
      tr.appendChild(tdTokens);
      tr.appendChild(tdActions);
      accountsBody.appendChild(tr);
    });
  }

  async function deleteAccount(account) {
    var ok = window.confirm(
      "Excluir a conta " + account.email + "?\n\nIsso apaga permanentemente as conversas, o perfil e o login dessa pessoa. Não dá pra desfazer."
    );
    if (!ok) return;

    try {
      var res = await fetch("/api/admin-delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + currentToken,
        },
        body: JSON.stringify({ userId: account.id, confirm: true }),
      });

      var data = await res.json().catch(function () { return {}; });

      if (!res.ok) {
        alert("Erro ao excluir: " + (data.error || res.status));
        return;
      }

      currentAccounts = currentAccounts.filter(function (a) { return a.id !== account.id; });
      document.getElementById("stat-accounts").textContent = formatNumber(currentAccounts.length);
      renderAccountsTable(document.getElementById("admin-accounts-search").value);
    } catch (err) {
      console.error("Falha ao excluir conta:", err);
      alert("Falha ao excluir conta. Tente novamente.");
    }
  }

  function renderStats(data) {
    currentAccounts = data.accounts || [];

    document.getElementById("stat-accounts").textContent = formatNumber(data.totalAccounts);
    document.getElementById("stat-tokens-total").textContent = formatNumber(data.tokens && data.tokens.total);

    var tokens = data.tokens || {};
    document.getElementById("stat-cost-total").textContent = formatUsd(tokens.totalCostUsd);
    var sub = "≈ " + formatBrl(tokens.totalCostBrl) + " (câmbio aproximado)";
    if (tokens.guestTokens) {
      sub += " · inclui " + formatNumber(tokens.guestTokens) + " tokens de convidados (sem login)";
    }
    document.getElementById("stat-cost-sub").textContent = sub;

    renderChart(tokens.byDay);
    renderAccountsTable("");

    show("admin-content");
  }

  function wireLogout() {
    var btn = document.getElementById("admin-logout-btn");
    if (!btn) return;
    btn.hidden = false;
    btn.addEventListener("click", async function () {
      try {
        await window.OMISTER.auth.signOut();
      } catch (err) {
        console.error("Falha ao sair:", err);
      }
      window.location.href = "login.html";
    });
  }

  function wireSearch() {
    var input = document.getElementById("admin-accounts-search");
    if (!input) return;
    input.addEventListener("input", function () {
      renderAccountsTable(input.value);
    });
  }

  async function init() {
    if (!window.OMISTER || !window.OMISTER.isConfigured) {
      show("admin-state-login");
      return;
    }

    var session;
    try {
      var sessionRes = await window.OMISTER.auth.getSession();
      session = sessionRes && sessionRes.data && sessionRes.data.session;
    } catch (err) {
      console.error("Falha ao obter sessão:", err);
    }

    if (!session) {
      show("admin-state-login");
      return;
    }

    currentToken = session.access_token;
    wireLogout();
    wireSearch();

    try {
      var res = await fetch("/api/admin-stats", {
        headers: { Authorization: "Bearer " + currentToken },
      });

      if (res.status === 401) {
        show("admin-state-login");
        return;
      }
      if (res.status === 403) {
        show("admin-state-denied");
        return;
      }
      if (!res.ok) {
        show("admin-state-error");
        return;
      }

      var data = await res.json();
      renderStats(data);
    } catch (err) {
      console.error("Falha ao carregar estatísticas de admin:", err);
      show("admin-state-error");
    }
  }

  init();
})();
