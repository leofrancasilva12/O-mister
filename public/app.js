// Histórico enviado ao backend a cada pergunta
let history = [];
let isStreaming = false;

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const openSidebarBtn = document.getElementById("open-sidebar");
const closeSidebarBtn = document.getElementById("close-sidebar");
const newChatBtn = document.getElementById("new-chat");
const emptyState = document.getElementById("empty-state");
const messagesEl = document.getElementById("messages");
const chatScroll = document.getElementById("chat-scroll");
const form = document.getElementById("input-form");
const input = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const typingRow = document.createElement("div");
typingRow.id = "typing";
typingRow.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';

function openSidebar() { sidebar.classList.add("open"); overlay.classList.add("visible"); }
function closeSidebar() { sidebar.classList.remove("open"); overlay.classList.remove("visible"); }
openSidebarBtn.addEventListener("click", openSidebar);
closeSidebarBtn.addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);

newChatBtn.addEventListener("click", () => {
  if (isStreaming) return;
  history = [];
  messagesEl.innerHTML = "";
  messagesEl.style.display = "none";
  emptyState.style.display = "flex";
  input.value = "";
  input.style.height = "auto";
  updateSendState();
  closeSidebar();
});

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

function scrollToBottom() {
  chatScroll.scrollTo({ top: chatScroll.scrollHeight, behavior: "smooth" });
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

  const inline = (s) => s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*(?!\s)([^*]+?)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/`([^`]+?)`/g, "<code>$1</code>");

  const closeList = () => {
    if (inList) { html += "</ul>"; inList = false; }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) { closeList(); continue; }

    const bullet = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bullet) {
      if (!inList) { html += "<ul>"; inList = true; }
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

async function sendMessage(rawText) {
  const text = rawText.trim();
  if (!text || isStreaming) return;

  isStreaming = true;
  emptyState.style.display = "none";
  messagesEl.style.display = "flex";

  addUserMessage(text);
  history.push({ role: "user", content: text });

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
      body: JSON.stringify({ messages: history }),
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
      history.push({ role: "assistant", content: answer });
    } else {
      throw new Error("A resposta voltou vazia. Tente reformular a pergunta.");
    }
  } catch (err) {
    typingRow.classList.remove("visible");
    typingRow.remove();
    if (bubble && !answer.trim()) bubble.remove();
    history.pop();
    showError(err.message || "Não foi possível falar com o Mister agora.");
  } finally {
    isStreaming = false;
    updateSendState();
  }
}
