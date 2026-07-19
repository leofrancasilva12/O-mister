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
let streamAbort = null; // controlar cancelamento de streaming
let currentAudio = null; // controlar áudio sendo tocado
let isListening = false; // controlar status da gravação
let recognition = null; // Web Speech API
let audioPlayerElement = null; // elemento de áudio
let audioPlayerVisible = false; // estado do player

/* =========================================================
   STT (Speech-to-Text) — Gravação de voz
   ========================================================= */
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Seu navegador não suporta gravação de voz.");
    return null;
  }

  const rec = new SpeechRecognition();
  rec.lang = "pt-BR";
  rec.interimResults = true;
  rec.continuous = false;

  rec.onstart = () => {
    isListening = true;
    voiceBtn.classList.add("listening");
  };

  rec.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    input.value = transcript;
    updateSendState();
  };

  rec.onerror = (event) => {
    console.error("Erro na gravação:", event.error);
  };

  rec.onend = () => {
    isListening = false;
    voiceBtn.classList.remove("listening");
  };

  return rec;
}

const voiceBtn = document.getElementById("voice-btn");
voiceBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (!recognition) recognition = initSpeechRecognition();
  if (recognition) {
    if (isListening) {
      recognition.stop();
    } else {
      input.focus();
      recognition.start();
    }
  }
});

/* =========================================================
   Audio Player Customizado
   ========================================================= */
function initAudioPlayer() {
  const player = document.getElementById("audio-player");
  const audioEl = document.getElementById("audio-element");
  const playBtn = document.getElementById("audio-play-btn");
  const progressBar = document.getElementById("audio-progress");
  const closeBtn = document.getElementById("audio-close-btn");

  audioPlayerElement = audioEl;

  playBtn.addEventListener("click", () => {
    if (audioEl.paused) {
      audioEl.play();
      playBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    } else {
      audioEl.pause();
      playBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
    }
  });

  audioEl.addEventListener("timeupdate", () => {
    progressBar.value = (audioEl.currentTime / audioEl.duration) * 100 || 0;
  });

  audioEl.addEventListener("ended", () => {
    playBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
  });

  progressBar.addEventListener("input", () => {
    audioEl.currentTime = (progressBar.value / 100) * audioEl.duration;
  });

  closeBtn.addEventListener("click", () => {
    audioEl.pause();
    audioEl.src = "";
    player.hidden = true;
    audioPlayerVisible = false;
  });
}

/* =========================================================
   TTS (Text-to-Speech) com ElevenLabs
   ========================================================= */
async function speakWithElevenLabs(text) {
  const cfg = window.OMISTER_CONFIG || {};
  // Tenta: Vercel env var → config.js → localStorage
  let apiKey = window.ELEVENLABS_API_KEY || cfg.ELEVENLABS_API_KEY || localStorage.getItem("elevenlabs_key");

  if (!apiKey) {
    alert("Configure ElevenLabs no Vercel (env var ELEVENLABS_API_KEY)");
    return;
  }

  try {
    // Para PT-BR, usando voz "Adam" (homem maduro)
    const voiceId = "pNInz6obpgDQGcFmaJgB"; // Adam - male voice

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_flash_v2_5",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail?.message || "Erro ao gerar áudio");
    }

    const audioBlob = await res.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Para se houver áudio tocando
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    // Mostra player
    const player = document.getElementById("audio-player");
    const playBtn = document.getElementById("audio-play-btn");
    player.hidden = false;
    audioPlayerVisible = true;

    // Carrega no player customizado
    if (audioPlayerElement) {
      audioPlayerElement.src = audioUrl;
      audioPlayerElement.play();
      playBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    }
  } catch (err) {
    alert("Erro ao gerar áudio: " + err.message);
  }
}

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
const imageInput = document.getElementById("image-input");
const uploadBtn = document.getElementById("upload-btn");
const imagePreview = document.getElementById("image-preview");
const pdfInput = document.getElementById("pdf-input");
const pdfBtn = document.getElementById("pdf-btn");
const settingsBtn = document.getElementById("settings-btn") || document.getElementById("settings-btn-top");
const settingsBtnTop = document.getElementById("settings-btn-top");
const settingsModal = document.getElementById("settings-modal");
const settingsCloseBtn = document.getElementById("settings-close");
const settingsSaveBtn = document.getElementById("settings-save");
const profilePhotoInput = document.getElementById("profile-photo-input");
const profilePhotoPreview = document.getElementById("profile-photo-preview");
const profileNameInput = document.getElementById("profile-name-input");
const profileCompanyInput = document.getElementById("profile-company-input");
const mobileProfilePhoto = document.getElementById("mobile-profile-photo");
const mobileProfileName = document.getElementById("mobile-profile-name");
const mobileProfileCompany = document.getElementById("mobile-profile-company");
const desktopProfilePhoto = document.getElementById("desktop-profile-photo");
const desktopProfileName = document.getElementById("desktop-profile-name");
const desktopProfileCompany = document.getElementById("desktop-profile-company");

let selectedImage = null; // { data: base64, type: 'image/jpeg', name: 'file.jpg' }
let selectedPdf = null; // { data: base64, name: 'file.pdf' }

function createTypingRow() {
  const row = document.createElement("div");
  row.id = "typing";
  row.className = "typing-row";
  row.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  const stopBtn = document.createElement("button");
  stopBtn.className = "typing-stop";
  stopBtn.setAttribute("aria-label", "Parar");
  stopBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
  stopBtn.addEventListener("click", () => {
    if (streamAbort) streamAbort.abort();
  });
  row.appendChild(stopBtn);
  return row;
}

const isMobile = () => window.matchMedia("(max-width: 820px)").matches;

/* =========================================================
   Modal de confirmação (estilo Claude)
   ========================================================= */
const modalOverlay = document.getElementById("modal-overlay");
const modalText = document.getElementById("modal-text");
const modalCancel = document.getElementById("modal-cancel");
const modalConfirm = document.getElementById("modal-confirm");

let modalCallback = null;

function showModal(title, text, confirmText = "Excluir", onConfirm = null) {
  document.getElementById("modal-title").textContent = title;
  modalText.innerHTML = text;
  modalConfirm.textContent = confirmText;
  modalCallback = onConfirm;
  modalOverlay.hidden = false;
}

function closeModal() {
  modalOverlay.hidden = true;
  modalCallback = null;
}

modalCancel.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
modalConfirm.addEventListener("click", () => {
  if (modalCallback) modalCallback();
  closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalOverlay.hidden) closeModal();
  if (e.key === "Escape" && !settingsModal.hidden) closeSettings();
});

/* =========================================================
   Modal de Configurações
   ========================================================= */
function getProfileKey() {
  // Isola perfil por user.id se autenticado, senão usa chave genérica
  return user && user.id ? `user_profile_${user.id}` : "user_profile";
}

function updateProfileUI() {
  const key = getProfileKey();
  const profile = JSON.parse(localStorage.getItem(key) || "{}");
  const name = profile.name || "O Mister";
  const company = profile.company || "";
  const photoHTML = profile.photo ? `<img src="${profile.photo}" alt="Perfil">` : '👤';

  // Atualiza header mobile
  mobileProfileName.textContent = name;
  mobileProfileCompany.textContent = company;
  mobileProfilePhoto.innerHTML = photoHTML;

  // Atualiza desktop profile
  desktopProfileName.textContent = name;
  desktopProfileCompany.textContent = company;
  desktopProfilePhoto.innerHTML = photoHTML;
}

function openSettings() {
  // Carrega perfil do usuário
  const profile = JSON.parse(localStorage.getItem("user_profile") || "{}");
  profileNameInput.value = profile.name || "";
  profileCompanyInput.value = profile.company || "";

  if (profile.photo) {
    profilePhotoPreview.innerHTML = `<img src="${profile.photo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" alt="Perfil">`;
  } else {
    profilePhotoPreview.innerHTML = '<span style="font-size: 32px;">👤</span>';
  }

  settingsModal.hidden = false;
}

function closeSettings() {
  settingsModal.hidden = true;
}

settingsBtn?.addEventListener("click", openSettings);
settingsBtnTop?.addEventListener("click", openSettings);
settingsCloseBtn.addEventListener("click", closeSettings);
settingsModal.addEventListener("click", (e) => {
  if (e.target === settingsModal) closeSettings();
});

settingsSaveBtn.addEventListener("click", () => {
  // Salva perfil
  const profile = {
    name: profileNameInput.value.trim(),
    company: profileCompanyInput.value.trim(),
    photo: profilePhotoPreview.querySelector("img")?.src || ""
  };
  const key = getProfileKey();
  localStorage.setItem(key, JSON.stringify(profile));

  // Atualiza UI com novo perfil
  updateProfileUI();

  // Mostra modal "Perfil salvo"
  closeSettings();
  showModal("Perfil salvo!", "Suas informações foram atualizadas com sucesso.", "Fechar");
});

// Upload de foto de perfil
profilePhotoInput.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Por favor, selecione uma imagem.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    profilePhotoPreview.innerHTML = `<img src="${ev.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" alt="Perfil">`;
  };
  reader.readAsDataURL(file);
});

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
  updateProfileUI(); // Recarrega perfil com a chave correta do usuário

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

  showModal(
    "Excluir conversa?",
    `Tem certeza que deseja excluir a conversa <strong>"${chatTitle(chat)}"</strong>? Essa ação não pode ser desfeita.`,
    "Excluir",
    () => {
      chats = chats.filter((c) => c.id !== id);
      if (activeId === id) activeId = null;

      if (useCloud) OMISTER.cloudDelete(id).catch((e) => console.error("Supabase:", e));
      else saveLocal();
      persistActive();

      renderChatList();
      renderMessages();
    }
  );
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
  chat.messages.forEach((m, idx) => {
    if (m.role === "user") {
      addUserMessage(m.content, m.image || null);
    } else {
      const { content } = createAssistantMessage(idx);
      content.innerHTML = renderMarkdown(m.content);
    }
  });
  scrollToBottom(false);
}

function scrollToBottom(smooth = true) {
  chatScroll.scrollTo({
    top: chatScroll.scrollHeight,
    behavior: smooth ? "smooth" : "auto",
  });
}

function addUserMessage(text, image = null) {
  const row = document.createElement("div");
  row.className = "msg-row-user";
  const bubble = document.createElement("div");
  bubble.className = "bubble-user";

  if (image) {
    const img = document.createElement("img");
    img.src = image.data;
    img.alt = image.name || "uploaded image";
    img.className = "msg-image";
    bubble.appendChild(img);
  }

  if (text) {
    const textDiv = document.createElement("div");
    textDiv.textContent = text;
    bubble.appendChild(textDiv);
  }

  row.appendChild(bubble);
  messagesEl.appendChild(row);
}

function createAssistantMessage(messageIndex = null) {
  const wrap = document.createElement("div");
  wrap.className = "msg-assistant";

  const content = document.createElement("div");
  content.className = "msg-content";
  wrap.appendChild(content);

  const toolbar = document.createElement("div");
  toolbar.className = "msg-toolbar";

  const copyBtn = document.createElement("button");
  copyBtn.className = "msg-btn msg-copy";
  copyBtn.setAttribute("aria-label", "Copiar");
  copyBtn.title = "Copiar";
  copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  copyBtn.addEventListener("click", () => {
    const text = content.innerText || content.textContent;
    navigator.clipboard.writeText(text).catch(() => alert("Erro ao copiar"));
  });
  toolbar.appendChild(copyBtn);

  const speakBtn = document.createElement("button");
  speakBtn.className = "msg-btn msg-speak";
  speakBtn.setAttribute("aria-label", "Ouvir");
  speakBtn.title = "Ouvir com voz";
  speakBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
  speakBtn.addEventListener("click", () => {
    const text = content.innerText || content.textContent;
    if (text.trim()) speakWithElevenLabs(text);
  });
  toolbar.appendChild(speakBtn);

  const regenerateBtn = document.createElement("button");
  regenerateBtn.className = "msg-btn msg-regenerate";
  regenerateBtn.setAttribute("aria-label", "Regenerar");
  regenerateBtn.title = "Regenerar";
  regenerateBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>';
  regenerateBtn.addEventListener("click", () => {
    if (!isStreaming) {
      const chat = activeChat();
      if (chat && messageIndex !== null && messageIndex > 0) {
        const prevMsg = chat.messages[messageIndex - 1];
        if (prevMsg && prevMsg.role === "user") {
          sendMessage(prevMsg.content);
        }
      }
    }
  });
  toolbar.appendChild(regenerateBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "msg-btn msg-delete";
  deleteBtn.setAttribute("aria-label", "Deletar");
  deleteBtn.title = "Deletar";
  deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
  deleteBtn.addEventListener("click", () => {
    const chat = activeChat();
    if (chat && messageIndex !== null) {
      showModal(
        "Deletar mensagem?",
        "Esta ação não pode ser desfeita.",
        "Deletar",
        () => {
          chat.messages.splice(messageIndex, 1);
          chat.updatedAt = Date.now();
          saveChat(chat);
          renderMessages();
        }
      );
    }
  });
  toolbar.appendChild(deleteBtn);

  wrap.appendChild(toolbar);
  messagesEl.appendChild(wrap);
  return { content, wrap };
}

/* Markdown mínimo — escapa HTML e aplica formatação com segurança */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderMarkdown(md) {
  let html = "";
  let i = 0;

  while (i < md.length) {
    // Blocos de código (```)
    if (md.slice(i, i + 3) === "```") {
      const end = md.indexOf("```", i + 3);
      if (end !== -1) {
        const code = md.slice(i + 3, end);
        const [langLine, ...codeLines] = code.split("\n");
        const lang = langLine.trim().match(/^[a-z]+/)?.[0] || "";
        const codeBody = codeLines.join("\n").trim();
        html += '<pre class="code-block"><code class="language-' + escapeHtml(lang) + '">' + escapeHtml(codeBody) + "</code></pre>";
        i = end + 3;
        continue;
      }
    }

    // Linhas normais (parágrafo, lista, tabela, etc.)
    const lineEnd = md.indexOf("\n", i);
    const nextBreak = lineEnd === -1 ? md.length : lineEnd;
    const line = md.slice(i, nextBreak);
    const trimmed = line.trim();

    if (!trimmed) {
      html += "<p></p>";
      i = nextBreak + 1;
      continue;
    }

    // Tabelas (|col1|col2|)
    if (trimmed.startsWith("|")) {
      html += renderTable(md, i);
      let tableEnd = i;
      while (tableEnd < md.length && md[tableEnd] !== "\n") tableEnd++;
      while (tableEnd < md.length && md[tableEnd + 1] === "|") {
        tableEnd = md.indexOf("\n", tableEnd + 1);
        if (tableEnd === -1) { tableEnd = md.length; break; }
      }
      i = tableEnd + 1;
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length, 4);
      html += "<h" + level + ">" + renderInline(headingMatch[2]) + "</h" + level + ">";
      i = nextBreak + 1;
      continue;
    }

    // Listas não-ordenadas
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      html += "<ul>";
      while (i < md.length) {
        const lineEnd = md.indexOf("\n", i);
        const line = md.slice(i, lineEnd === -1 ? md.length : lineEnd).trim();
        const bullet = line.match(/^[-*•]\s+(.*)$/);
        if (!bullet) break;
        html += "<li>" + renderInline(bullet[1]) + "</li>";
        i = (lineEnd === -1 ? md.length : lineEnd) + 1;
      }
      html += "</ul>";
      continue;
    }

    // Listas numeradas
    const numMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (numMatch) {
      html += "<ol>";
      while (i < md.length) {
        const lineEnd = md.indexOf("\n", i);
        const line = md.slice(i, lineEnd === -1 ? md.length : lineEnd).trim();
        const num = line.match(/^\d+\.\s+(.*)$/);
        if (!num) break;
        html += "<li>" + renderInline(num[1]) + "</li>";
        i = (lineEnd === -1 ? md.length : lineEnd) + 1;
      }
      html += "</ol>";
      continue;
    }

    // Parágrafo padrão
    html += "<p>" + renderInline(trimmed) + "</p>";
    i = nextBreak + 1;
  }

  return html;
}

function renderInline(text) {
  text = escapeHtml(text);
  // Links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  // Negrito **text**
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Itálico *text* (não seguido de *)
  text = text.replace(/(\s|^)\*([^*\s][^*]*[^*\s])\*(\s|$)/g, "$1<em>$2</em>$3");
  // Código `text`
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  return text;
}

function renderTable(md, start) {
  const lines = [];
  let i = start;
  while (i < md.length) {
    const lineEnd = md.indexOf("\n", i);
    const line = md.slice(i, lineEnd === -1 ? md.length : lineEnd).trim();
    if (!line.startsWith("|")) break;
    lines.push(line);
    i = (lineEnd === -1 ? md.length : lineEnd) + 1;
  }

  if (lines.length < 2) return "";

  const rows = lines.map((l) =>
    l
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim())
  );

  let html = "<table><thead><tr>";
  rows[0].forEach((cell) => {
    html += "<th>" + renderInline(cell) + "</th>";
  });
  html += "</tr></thead><tbody>";
  rows.slice(2).forEach((row) => {
    html += "<tr>";
    row.forEach((cell) => {
      html += "<td>" + renderInline(cell) + "</td>";
    });
    html += "</tr>";
  });
  html += "</tbody></table>";

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
   Upload de imagens
   ========================================================= */
function renderImagePreview() {
  imagePreview.innerHTML = "";
  if (selectedImage) {
    const container = document.createElement("div");
    container.className = "image-preview-item";

    const img = document.createElement("img");
    img.src = selectedImage.data;
    img.alt = selectedImage.name;
    container.appendChild(img);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "image-remove-btn";
    removeBtn.setAttribute("aria-label", "Remover imagem");
    removeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    removeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      selectedImage = null;
      renderImagePreview();
      updateSendState();
    });
    container.appendChild(removeBtn);

    imagePreview.appendChild(container);
  }
}

uploadBtn.addEventListener("click", (e) => {
  e.preventDefault();
  imageInput.click();
});

imageInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Por favor, selecione uma imagem.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    selectedImage = {
      data: ev.target.result,
      type: file.type,
      name: file.name
    };
    renderImagePreview();
    updateSendState();
  };
  reader.readAsDataURL(file);
  imageInput.value = ""; // limpa input para permitir selecionar o mesmo arquivo novamente
});

/* PDF Upload */
function renderPdfPreview() {
  imagePreview.innerHTML = "";
  if (selectedImage) {
    const container = document.createElement("div");
    container.className = "image-preview-item";
    const img = document.createElement("img");
    img.src = selectedImage.data;
    img.alt = selectedImage.name;
    container.appendChild(img);
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "image-remove-btn";
    removeBtn.setAttribute("aria-label", "Remover imagem");
    removeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    removeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      selectedImage = null;
      renderImagePreview();
      updateSendState();
    });
    container.appendChild(removeBtn);
    imagePreview.appendChild(container);
  }
  if (selectedPdf) {
    const container = document.createElement("div");
    container.className = "pdf-preview-item";
    const icon = document.createElement("div");
    icon.className = "pdf-icon";
    icon.innerHTML = "📄";
    const name = document.createElement("span");
    name.className = "pdf-name";
    name.textContent = selectedPdf.name;
    container.appendChild(icon);
    container.appendChild(name);
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "image-remove-btn";
    removeBtn.setAttribute("aria-label", "Remover PDF");
    removeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    removeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      selectedPdf = null;
      renderPdfPreview();
      updateSendState();
    });
    container.appendChild(removeBtn);
    imagePreview.appendChild(container);
  }
}

pdfBtn.addEventListener("click", (e) => {
  e.preventDefault();
  pdfInput.click();
});

pdfInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.type !== "application/pdf") {
    alert("Por favor, selecione um arquivo PDF.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    selectedPdf = {
      data: ev.target.result,
      type: "application/pdf",
      name: file.name
    };
    renderPdfPreview();
    updateSendState();
  };
  reader.readAsDataURL(file);
  pdfInput.value = "";
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

  addUserMessage(text, selectedImage);
  const userMsg = { role: "user", content: text };
  if (selectedImage) userMsg.image = selectedImage;
  if (selectedPdf) userMsg.pdf = selectedPdf;
  chat.messages.push(userMsg);
  chat.updatedAt = Date.now();
  saveChat(chat);
  renderChatList();

  input.value = "";
  input.style.height = "auto";
  selectedImage = null;
  selectedPdf = null;
  renderPdfPreview();
  updateSendState();
  scrollToBottom();

  const typingEl = createTypingRow();
  messagesEl.appendChild(typingEl);
  typingEl.classList.add("visible");
  scrollToBottom();

  let bubble = null;
  let answer = "";
  streamAbort = new AbortController();

  try {
    const headers = { "Content-Type": "application/json" };
    // Envia token JWT do Supabase se logado (autenticação do endpoint)
    if (useCloud && user) {
      const session = await OMISTER.auth.getSession();
      if (session?.data?.session?.access_token) {
        headers["Authorization"] = `Bearer ${session.data.session.access_token}`;
      }
    }

    // Transforma mensagens para formato OpenRouter (vision compatible)
    const formattedMessages = chat.messages.map((m) => {
      if (m.role === "user" && (m.image || m.pdf)) {
        const contentArray = [];
        if (m.content) contentArray.push({ type: "text", text: m.content });
        if (m.image) {
          contentArray.push({
            type: "image",
            source: {
              type: "base64",
              media_type: m.image.type,
              data: m.image.data.split(",")[1],
            },
          });
        }
        if (m.pdf) {
          contentArray.push({
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: m.pdf.data.split(",")[1],
            },
          });
        }
        return { role: "user", content: contentArray };
      }
      return m;
    });

    // Pega nome do usuário para personalizar a resposta
    const profile = JSON.parse(localStorage.getItem("user_profile") || "{}");
    const userName = profile.name || "usuário";

    const res = await fetch("/api/chat", {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: formattedMessages,
        userName: userName // Passa pra API personalizar resposta
      }),
      signal: streamAbort.signal,
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
            typingEl.classList.remove("visible");
            typingEl.remove();
            const msgIdx = chat.messages.length;
            const created = createAssistantMessage(msgIdx);
            bubble = created.content;
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
    if (err.name === "AbortError") {
      // Usuário parou a resposta — mantém o que foi gerado
      if (answer.trim()) {
        chat.messages.push({ role: "assistant", content: answer });
        chat.updatedAt = Date.now();
        saveChat(chat);
        renderChatList();
      }
    } else {
      typingEl.classList.remove("visible");
      typingEl.remove();
      if (bubble && !answer.trim()) bubble.parentElement.remove();
      showError(err.message || "Não foi possível falar com o Mister agora.");
    }
  } finally {
    typingEl.classList.remove("visible");
    if (typingEl.parentElement) typingEl.remove();
    streamAbort = null;
    isStreaming = false;
    updateSendState();
  }
}

/* =========================================================
   Inicialização
   ========================================================= */
(async function init() {
  initAudioPlayer();
  updateProfileUI(); // Carrega perfil do usuário

  await initAuth();
  if (redirected) return; // indo para a tela de login

  chats = await loadChats();
  renderChatList();

  // Sempre começa com novo chat (não carrega a última)
  activeId = null;
  persistActive();

  renderMessages();
  updateSendState();
})();
