/* =========================================================
   Estado e persistência
   - Com Supabase configurado + logado  → conversas na conta (nuvem).
   - Sem Supabase configurado           → conversas no navegador (local).
   ========================================================= */
const STORE_KEY = "omister.chats.v1";
const ACTIVE_KEY = "omister.activeChat.v1";
const COLLAPSE_KEY = "omister.sidebarCollapsed.v1";

let chats = [];
let activeId = localStorage.getItem(ACTIVE_KEY) || null;
let isStreaming = false;
let useCloud = false;
let user = null;

function newId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function chatTitle(chat) {
  return (chat && chat.title) || "Nova conversa";
}

function activeChat() {
  return chats.find((c) => c.id === activeId) || null;
}

function persistActive() {
  try {
    if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
    else localStorage.removeItem(ACTIVE_KEY);
  } catch {}
}

function saveLocal() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(chats));
  } catch {}
}

// Salva um chat alterado (upsert na nuvem) ou tudo (local).
function saveChat(chat) {
  if (useCloud) {
    if (chat) OMISTER.cloudUpsert(chat, user.id).catch((e) => console.error("Supabase:", e));
  } else {
    saveLocal();
  }
  persistActive();
}

async function loadChats() {
  if (useCloud) {
    try {
      return await OMISTER.cloudList();
    } catch (e) {
      console.error("Supabase list:", e);
      return [];
    }
  }
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/* =========================================================
   Elementos
   ========================================================= */
const app = document.getElementById("app");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const openSidebarBtn = document.getElementById("open-sidebar");
const closeSidebarBtn = document.getElementById("close-sidebar");
const collapseBtn = document.getElementById("collapse-sidebar");
const openRailBtn = document.getElementById("open-rail");
const newChatBtn = document.getElementById("new-chat");
const chatListEl = document.getElementById("chat-list");
const emptyState = document.getElementById("empty-state");
const messagesEl = document.getElementById("messages");
const chatScroll = document.getElementById("chat-scroll");
const form = document.getElementById("input-form");
const input = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const accountEl = document.getElementById("account");
const accountEmailEl = document.getElementById("account-email");
const logoutBtn = document.getElementById("logout-btn");

const typingRow = document.createElement("div");
typingRow.id = "typing";
typingRow.innerHTML =
  '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';

const isMobile = () => window.matchMedia("(max-width: 820px)").matches;

/* =========================================================
   Autenticação
   ========================================================= */
let redirected = false;

async function initAuth() {
  if (!OMISTER.isConfigured) return; // modo local: sem login

  const { data } = await OMISTER.auth.getSession();
  if (!data.session) {
    redirected = true;
    window.location.replace("login.html");
    return;
  }

  user = data.session.user;
  useCloud = true;

  accountEmailEl.textContent = user.email || "Conectado";
  accountEl.hidden = false;
  logoutBtn.addEventListener("click", async () => {
    await OMISTER.auth.signOut();
    window.location.replace("login.html");
  });

  OMISTER.auth.onAuthStateChange((_event, session) => {
    if (!session) window.location.replace("login.html");
  });
}

/* =========================================================
   Sidebar: abrir/fechar (mobile) e recolher/expandir (desktop)
   ========================================================= */
function openSidebar() {
  sidebar.classList.add("open");
  overlay.classList.add("visible");
}
function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("visible");
}
openSidebarBtn.addEventListener("click", openSidebar);
closeSidebarBtn.addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);

function setCollapsed(collapsed) {
  app.classList.toggle("collapsed", collapsed);
  try {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
  } catch {}
}
collapseBtn.addEventListener("click", () => setCollapsed(true));
openRailBtn.addEventListener("click", () => setCollapsed(false));
setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");

/* =========================================================
   Lista de conversas
   ========================================================= */
function renderChatList() {
  chatListEl.innerHTML = "";
  const sorted = [...chats].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  if (!sorted.length) {
    const hint = document.createElement("p");
    hint.className = "chat-empty-hint";
    hint.textContent = "Nenhuma conversa ainda.";
    chatListEl.appendChild(hint);
    return;
  }

  for (const chat of sorted) {
    const item = document.createElement("div");
    item.className = "chat-item" + (chat.id === activeId ? " active" : "");
    item.title = chatTitle(chat);

    const title = document.createElement("span");
    title.className = "chat-item-title";
    title.textContent = chatTitle(chat);
    item.appendChild(title);

    const del = document.createElement("button");
    del.className = "chat-del";
    del.setAttribute("aria-label", "Excluir conversa");
    del.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteChat(chat.id);
    });
    item.appendChild(del);

    item.addEventListener("click", () => selectChat(chat.id));
    chatListEl.appendChild(item);
  }
}

function selectChat(id) {
  if (isStreaming) return;
  activeId = id;
  persistActive();
  renderChatList();
  renderMessages();
  if (isMobile()) closeSidebar();
}

function deleteChat(id) {
  if (isStreaming) return;
  const chat = chats.find((c) => c.id === id);
  if (!chat) return;
  if (!confirm(`Excluir a conversa "${chatTitle(chat)}"?`)) return;

  chats = chats.filter((c) => c.id !== id);
  if (activeId === id) activeId = null;

  if (useCloud) OMISTER.cloudDelete(id).catch((e) => console.error("Supabase:", e));
  else saveLocal();
  persistActive();

  renderChatList();
  renderMessages();
}

function startNewChat() {
  if (isStreaming) return;
  activeId = null; // conversa nova só é criada ao enviar a 1ª mensagem
  persistActive();
  renderChatList();
  renderMessages();
  input.value = "";
  input.style.height = "auto";
  updateSendState();
  if (isMobile()) closeSidebar();
  input.focus();
}
newChatBtn.addEventListener("click", startNewChat);

/* =========================================================
   Render de mensagens
   ========================================================= */
function renderMessages() {
  const chat = activeChat();
  messagesEl.innerHTML = "";

  if (!chat || !chat.messages.length) {
    messagesEl.style.display = "none";
    emptyState.style.display = "flex";
    return;
  }

  emptyState.style.display = "none";
  messagesEl.style.display = "flex";
  for (const m of chat.messages) {
    if (m.role === "user") {
      addUserMessage(m.content);
    } else {
      const bubble = createAssistantMessage();
      bubble.innerHTML = renderMarkdown(m.content);
    }
  }
  scrollToBottom(false);
}

function scrollToBottom(smooth = true) {
  chatScroll.scrollTo({
    top: chatScroll.scrollHeight,
    behavior: smooth ? "smooth" : "auto",
  });
}

function addUserMessage(text) {
  const row = document.createElement("div");
  row.className = "msg-row-user";
  const bubble = document.createElement("div");
  bubble.className = "bubble-user";
  bubble.textContent = text;
  row.appendChild(bubble);
  messagesEl.appendChild(row);
}

function createAssistantMessage() {
  const wrap = document.createElement("div");
  wrap.className = "msg-assistant";
  messagesEl.appendChild(wrap);
  return wrap;
}

/* Markdown mínimo — escapa HTML e aplica formatação com segurança */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderMarkdown(md) {
  const lines = escapeHtml(md).split("\n");
  let html = "";
  let inList = false;

  const inline = (s) =>
    s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*(?!\s)([^*]+?)\*(?!\*)/g, "$1<em>$2</em>")
      .replace(/`([^`]+?)`/g, "<code>$1</code>");

  const closeList = () => {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      closeList();
      continue;
    }

    const bullet = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bullet) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += "<li>" + inline(bullet[1]) + "</li>";
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      closeList();
      html += "<h4>" + inline(heading[2]) + "</h4>";
      continue;
    }

    closeList();
    html += "<p>" + inline(trimmed) + "</p>";
  }

  closeList();
  return html;
}

function showError(message) {
  const wrap = document.createElement("div");
  wrap.className = "msg-error";
  wrap.textContent = message;
  messagesEl.appendChild(wrap);
  scrollToBottom();
}

/* =========================================================
   Composer
   ========================================================= */
function updateSendState() {
  const ready = input.value.trim().length > 0 && !isStreaming;
  sendBtn.disabled = !ready;
  sendBtn.classList.toggle("active", ready);
}

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 128) + "px";
  updateSendState();
});
input.addEventListener("focus", () => form.classList.add("focused"));
input.addEventListener("blur", () => form.classList.remove("focused"));
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage(input.value);
  }
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage(input.value);
});

/* =========================================================
   Envio + streaming
   ========================================================= */
async function sendMessage(rawText) {
  const text = rawText.trim();
  if (!text || isStreaming) return;

  isStreaming = true;

  // Garante uma conversa ativa (cria na 1ª mensagem).
  let chat = activeChat();
  if (!chat) {
    chat = {
      id: newId(),
      title: text.slice(0, 42),
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    chats.push(chat);
    activeId = chat.id;
  }
  if (!chat.title) chat.title = text.slice(0, 42);

  emptyState.style.display = "none";
  messagesEl.style.display = "flex";

  addUserMessage(text);
  chat.messages.push({ role: "user", content: text });
  chat.updatedAt = Date.now();
  saveChat(chat);
  renderChatList();

  input.value = "";
  input.style.height = "auto";
  updateSendState();
  scrollToBottom();

  messagesEl.appendChild(typingRow);
  typingRow.classList.add("visible");
  scrollToBottom();

  let bubble = null;
  let answer = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chat.messages }),
    });

    if (!res.ok) {
      const info = await res.json().catch(() => ({}));
      throw new Error(info.error || "O servidor não respondeu como esperado.");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;

        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") continue;

        try {
          const { delta } = JSON.parse(payload);
          if (!delta) continue;

          if (!bubble) {
            typingRow.classList.remove("visible");
            typingRow.remove();
            bubble = createAssistantMessage();
          }

          answer += delta;
          bubble.innerHTML = renderMarkdown(answer);
          scrollToBottom();
        } catch {
          /* fragmento incompleto: ignora */
        }
      }
    }

    if (answer.trim()) {
      chat.messages.push({ role: "assistant", content: answer });
      chat.updatedAt = Date.now();
      saveChat(chat);
      renderChatList();
    } else {
      throw new Error("A resposta voltou vazia. Tente reformular a pergunta.");
    }
  } catch (err) {
    typingRow.classList.remove("visible");
    typingRow.remove();
    if (bubble && !answer.trim()) bubble.remove();
    showError(err.message || "Não foi possível falar com o Mister agora.");
  } finally {
    isStreaming = false;
    updateSendState();
  }
}

/* =========================================================
   Inicialização
   ========================================================= */
(async function init() {
  await initAuth();
  if (redirected) return; // indo para a tela de login

  chats = await loadChats();
  renderChatList();
  renderMessages();
  updateSendState();
})();
