/* Painel de admin: exige login e checa autorização no servidor
   (/api/admin-stats), que só libera para o e-mail em ADMIN_EMAIL. */
(function () {
  var STATES = ["admin-state-loading", "admin-state-login", "admin-state-denied", "admin-state-error", "admin-content"];

  function show(id) {
    STATES.forEach(function (elId) {
      var el = document.getElementById(elId);
      if (el) el.hidden = elId !== id;
    });
  }

  function formatNumber(n) {
    return new Intl.NumberFormat("pt-BR").format(n || 0);
  }

  function renderStats(data) {
    document.getElementById("stat-accounts").textContent = formatNumber(data.totalAccounts);
    document.getElementById("stat-tokens-total").textContent = formatNumber(data.tokens && data.tokens.total);

    var tbody = document.getElementById("admin-daily-body");
    var empty = document.getElementById("admin-daily-empty");
    tbody.innerHTML = "";

    var byDay = (data.tokens && data.tokens.byDay) || [];
    empty.hidden = byDay.length > 0;

    byDay.forEach(function (row) {
      var tr = document.createElement("tr");
      var tdDate = document.createElement("td");
      tdDate.textContent = row.date;
      var tdTotal = document.createElement("td");
      tdTotal.textContent = formatNumber(row.total);
      tr.appendChild(tdDate);
      tr.appendChild(tdTotal);
      tbody.appendChild(tr);
    });

    show("admin-content");
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

    try {
      var res = await fetch("/api/admin-stats", {
        headers: { Authorization: "Bearer " + session.access_token },
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
