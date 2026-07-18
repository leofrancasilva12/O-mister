/* =========================================================
   Camada de autenticação + dados (Supabase), em script clássico
   (funciona também ao abrir o arquivo direto, via file://).

   A biblioteca do Supabase só é baixada quando estiver configurado
   (getClient), então em "modo local" nada é carregado da rede.

   Expõe window.OMISTER com:
     - isConfigured
     - auth.getSession / signInWithOAuth / signInWithOtp / signOut / onAuthStateChange
     - cloudList / cloudUpsert / cloudDelete
   ========================================================= */
(function () {
  var cfg = window.OMISTER_CONFIG || {};
  function valid(v, marker) {
    return typeof v === "string" && v.length > 0 && v.indexOf(marker) === -1;
  }
  var isConfigured =
    valid(cfg.SUPABASE_URL, "SEU-PROJETO") &&
    valid(cfg.SUPABASE_ANON_KEY, "SUA-ANON");

  var SUPABASE_CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  var clientPromise = null;

  function loadLib() {
    return new Promise(function (resolve, reject) {
      if (window.supabase && window.supabase.createClient) return resolve();
      var s = document.createElement("script");
      s.src = SUPABASE_CDN;
      s.onload = resolve;
      s.onerror = function () {
        reject(new Error("Não foi possível carregar a biblioteca do Supabase."));
      };
      document.head.appendChild(s);
    });
  }

  function getClient() {
    if (!clientPromise) {
      clientPromise = loadLib().then(function () {
        return window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
      });
    }
    return clientPromise;
  }

  function fromRow(row) {
    return {
      id: row.id,
      title: row.title || "",
      messages: Array.isArray(row.messages) ? row.messages : [],
      createdAt: row.created_at ? Date.parse(row.created_at) : Date.now(),
      updatedAt: row.updated_at ? Date.parse(row.updated_at) : Date.now(),
    };
  }

  window.OMISTER = {
    isConfigured: isConfigured,

    auth: {
      getSession: function () {
        return getClient().then(function (c) { return c.auth.getSession(); });
      },
      signInWithOAuth: function (opts) {
        return getClient().then(function (c) { return c.auth.signInWithOAuth(opts); });
      },
      signInWithOtp: function (opts) {
        return getClient().then(function (c) { return c.auth.signInWithOtp(opts); });
      },
      signOut: function () {
        return getClient().then(function (c) { return c.auth.signOut(); });
      },
      onAuthStateChange: function (cb) {
        return getClient().then(function (c) { return c.auth.onAuthStateChange(cb); });
      },
    },

    cloudList: function () {
      return getClient()
        .then(function (c) {
          return c.from("conversations").select("*").order("updated_at", { ascending: false });
        })
        .then(function (res) {
          if (res.error) throw res.error;
          return (res.data || []).map(fromRow);
        });
    },

    cloudUpsert: function (chat, userId) {
      return getClient()
        .then(function (c) {
          return c.from("conversations").upsert({
            id: chat.id,
            user_id: userId,
            title: chat.title || "",
            messages: chat.messages,
            updated_at: new Date(chat.updatedAt || Date.now()).toISOString(),
          });
        })
        .then(function (res) {
          if (res.error) throw res.error;
        });
    },

    cloudDelete: function (id) {
      return getClient()
        .then(function (c) {
          return c.from("conversations").delete().eq("id", id);
        })
        .then(function (res) {
          if (res.error) throw res.error;
        });
    },
  };
})();
