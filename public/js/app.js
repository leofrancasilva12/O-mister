/* =========================================================
   Estado e persistência
   - Com Supabase configurado + logado  → conversas na conta (nuvem).
   - Sem Supabase configurado           → conversas no navegador (local).
   ========================================================= */
const STORE_KEY = "omister.chats.v1";
const ACTIVE_KEY = "omister.activeChat.v1";
const COLLAPSE_KEY = "omister.sidebarCollapsed.v1";
const THEME_KEY = "omister.theme.v1";

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
let selectedChatIds = new Set(); // ids das conversas selecionadas no gerenciador
let conversationsSearch = ""; // texto de busca no gerenciador

/* =========================================================
   Toast (feedback rápido no rodapé)
   ========================================================= */
function showToast(message, type = "") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast" + (type ? " toast-" + type : "");
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("leaving");
    setTimeout(() => toast.remove(), 200);
  }, 2600);
}

/* =========================================================
   Tema claro/escuro
   ========================================================= */
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") root.setAttribute("data-theme", "dark");
  else root.removeAttribute("data-theme");

  const moon = document.getElementById("theme-icon-moon");
  const sun = document.getElementById("theme-icon-sun");
  if (moon && sun) {
    moon.hidden = theme === "dark";
    sun.hidden = theme !== "dark";
  }
}

function initTheme() {
  let theme = localStorage.getItem(THEME_KEY);
  if (!theme) {
    // Segue a preferência do sistema na primeira vez
    theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  applyTheme(theme);
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

// Aplica o tema imediatamente (antes do DOM completo) para evitar flash
initTheme();

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
  if (!text || text.trim().length === 0) return;

  try {
    const session = await OMISTER.auth.getSession();
    if (!session?.data?.session?.access_token) {
      alert("É necessário estar autenticado para usar TTS.");
      return;
    }

    const res = await fetch("/api/text-to-speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.data.session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        voiceId: "pNInz6obpgDQGcFmaJgB",
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Erro ao gerar áudio");
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

/* =========================================================
   Compartilhar mensagem (WhatsApp / share nativo)
   ========================================================= */
async function shareMessage(text) {
  const shareText = text + "\n\n— via O Mister";

  // Em mobile com suporte nativo, abre o menu de compartilhamento do sistema
  if (navigator.share) {
    try {
      await navigator.share({ text: shareText });
      return;
    } catch (e) {
      if (e.name === "AbortError") return; // usuário cancelou
      // senão, cai no fallback do WhatsApp
    }
  }

  // Fallback: abre o WhatsApp com o texto pronto
  const url = "https://wa.me/?text=" + encodeURIComponent(shareText);
  window.open(url, "_blank", "noopener");
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
async function saveChat(chat) {
  if (useCloud) {
    if (chat) {
      try {
        await OMISTER.cloudUpsert(chat, user.id);
      } catch (e) {
        console.error("Erro ao salvar na nuvem:", e);
        alert("Erro ao salvar alterações: " + (e.message || "Tente novamente."));
      }
    }
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
const manageChatsBtn = document.getElementById("manage-chats-btn");
const conversationsModal = document.getElementById("conversations-modal");
const conversationsCloseX = document.getElementById("conversations-close-x");
const conversationsList = document.getElementById("conversations-list");
const conversationsSearchInput = document.getElementById("conversations-search-input");
const conversationsSelectAll = document.getElementById("conversations-select-all");
const conversationsCount = document.getElementById("conversations-count");
const conversationsShareBtn = document.getElementById("conversations-share");
const conversationsDeleteBtn = document.getElementById("conversations-delete");
const emptyState = document.getElementById("empty-state");
const messagesEl = document.getElementById("messages");
const chatScroll = document.getElementById("chat-scroll");
const form = document.getElementById("input-form");
const input = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const accountEl = document.getElementById("account");
const logoutBtn = document.getElementById("logout-btn");
const imageInput = document.getElementById("image-input");
const uploadBtn = document.getElementById("upload-btn");
const imagePreview = document.getElementById("image-preview");
const pdfInput = document.getElementById("pdf-input");
const pdfBtn = document.getElementById("pdf-btn");
const settingsBtn = document.getElementById("settings-btn");
const adminLinkBtn = document.getElementById("admin-link-btn");
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
const sidebarProfilePhoto = document.getElementById("sidebar-profile-photo");
const sidebarProfileName = document.getElementById("sidebar-profile-name");
const sidebarProfileEmail = document.getElementById("sidebar-profile-email");
const accountEmailEl = sidebarProfileEmail; // alias para compatibilidade

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
const welcomeModal = document.getElementById("welcome-modal");
const welcomeName = document.getElementById("welcome-name");
const welcomeCloseBtn = document.getElementById("welcome-close");

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
  if (e.key === "Escape" && !conversationsModal.hidden) closeConversationsModal();
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
  const photoHTML = profile.photo ? `<img src="${profile.photo}" alt="Perfil">` : '👤';

  // Atualiza header mobile
  mobileProfileName.textContent = name;
  mobileProfileCompany.textContent = profile.company || "";
  mobileProfilePhoto.innerHTML = photoHTML;

  // Atualiza sidebar profile (rodapé do sidebar)
  sidebarProfileName.textContent = name;
  sidebarProfilePhoto.innerHTML = photoHTML;
}

function openSettings() {
  // Carrega perfil do usuário (usa chave correta por user.id)
  const key = getProfileKey();
  const profile = JSON.parse(localStorage.getItem(key) || "{}");
  profileNameInput.value = profile.name || "";
  profileCompanyInput.value = profile.company || "";

  if (profile.photo) {
    profilePhotoPreview.innerHTML = `<img src="${profile.photo}" alt="Perfil">`;
  } else {
    profilePhotoPreview.innerHTML = '<span style="font-size: 32px;">👤</span>';
  }

  updatePhotoRemoveButton();
  settingsModal.hidden = false;
}

function closeSettings() {
  settingsModal.hidden = true;
}

function showWelcome(userName) {
  const name = userName || "Amigo";
  welcomeName.textContent = `Olá, ${name}!`;
  welcomeModal.hidden = false;
}

function closeWelcome() {
  welcomeModal.hidden = true;
}

const settingsDeleteAccountBtn = document.getElementById("settings-delete-account");

settingsBtn?.addEventListener("click", openSettings);
settingsCloseBtn.addEventListener("click", closeSettings);
settingsModal.addEventListener("click", (e) => {
  if (e.target === settingsModal) closeSettings();
});

// Welcome modal listeners
welcomeCloseBtn.addEventListener("click", closeWelcome);
welcomeModal.addEventListener("click", (e) => {
  if (e.target === welcomeModal) closeWelcome();
});

settingsDeleteAccountBtn.addEventListener("click", () => {
  // Usa modal padrão em vez de confirm()
  showModal(
    "Deletar conta?",
    "Esta ação é irreversível. Você perderá acesso à sua conta e todos os dados serão apagados.",
    "Deletar"
  );
  // Override do callback padrão para deletar
  modalCallback = () => {
    closeModal();
    deleteAccount();
  };
});

async function deleteAccount() {
  try {
    // Pega token de autenticação
    const session = await OMISTER.auth.getSession();
    const token = session?.data?.session?.access_token;

    if (!token) {
      alert("Erro: não foi possível autenticar.");
      return;
    }

    // Limpa localStorage (todos os dados locais do usuário)
    const key = getProfileKey();
    localStorage.removeItem(key);
    localStorage.removeItem(STORE_KEY);
    localStorage.removeItem(ACTIVE_KEY);
    localStorage.removeItem(COLLAPSE_KEY);

    // Chama API para deletar conta (deleta também no Supabase)
    const res = await fetch("/api/delete-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      try {
        const error = JSON.parse(text);
        throw new Error(error.error || "Erro desconhecido");
      } catch {
        throw new Error(text || "Erro ao deletar conta no servidor");
      }
    }

    // Faz logout
    await OMISTER.auth.signOut();

    // Aguarda um pouco e redireciona
    setTimeout(() => {
      window.location.replace("login.html");
    }, 300);
  } catch (err) {
    alert("Erro ao deletar conta: " + err.message);
    console.error("Erro detalhado:", err);
  }
}

settingsSaveBtn.addEventListener("click", async () => {
  // Verifica se é primeira vez (perfil vazio antes)
  const key = getProfileKey();
  const oldProfile = JSON.parse(localStorage.getItem(key) || "{}");
  const isFirstTime = !oldProfile.name;

  // Salva perfil
  const profile = {
    name: profileNameInput.value.trim(),
    company: profileCompanyInput.value.trim(),
    photo: profilePhotoPreview.querySelector("img")?.src || ""
  };
  localStorage.setItem(key, JSON.stringify(profile));

  // Salva na nuvem se logado
  if (useCloud && user) {
    try {
      await OMISTER.cloudSaveProfile(user.id, profile);
    } catch (e) {
      console.error("Erro ao salvar perfil na nuvem:", e);
    }
  }

  // Atualiza UI com novo perfil
  updateProfileUI();

  // Fecha settings
  closeSettings();

  // Se é primeira vez, mostra boas-vindas
  if (isFirstTime && profile.name) {
    setTimeout(() => showWelcome(profile.name), 400);
  } else {
    // Se não é primeira vez, mostra confirmação
    showModal("Perfil salvo!", "Suas informações foram atualizadas com sucesso.", "Fechar");
  }
});

// Upload de foto de perfil
const profilePhotoRemoveBtn = document.getElementById("profile-photo-remove");

function updatePhotoRemoveButton() {
  const hasPhoto = profilePhotoPreview.querySelector("img");
  profilePhotoRemoveBtn.hidden = !hasPhoto;
}

profilePhotoInput.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Por favor, selecione uma imagem.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    profilePhotoPreview.innerHTML = `<img src="${ev.target.result}" alt="Perfil">`;
    updatePhotoRemoveButton();
  };
  reader.readAsDataURL(file);
});

profilePhotoRemoveBtn.addEventListener("click", (e) => {
  e.preventDefault();
  profilePhotoPreview.innerHTML = '<span style="font-size: 32px;">👤</span>';
  profilePhotoInput.value = "";
  updatePhotoRemoveButton();
});

/* =========================================================
   Autenticação
   ========================================================= */
let redirected = false;

async function initAuth() {
  if (!OMISTER.isConfigured) return; // modo local: sem login

  // Aguarda session ser processada (inclui OAuth redirect)
  return new Promise((resolve) => {
    let sessionFound = false;
    let timeoutId;

    OMISTER.auth.onAuthStateChange((event, session) => {
      console.log("App auth state:", event, session ? "logado" : "não logado");

      if (session && !sessionFound) {
        sessionFound = true;
        user = session.user;
        useCloud = true;

        // Carrega perfil da nuvem
        (async () => {
          try {
            const key = getProfileKey();
            const localProfile = JSON.parse(localStorage.getItem(key) || "{}");

            if (!localProfile.name) {
              const cloudProfile = await OMISTER.cloudLoadProfile(user.id);
              if (cloudProfile && cloudProfile.name) {
                localStorage.setItem(key, JSON.stringify(cloudProfile));
              }
            }

            updateProfileUI();
            sidebarProfileEmail.textContent = user.email || "Conectado";
            accountEl.hidden = false;
            console.log("Account element shown", accountEl);
            checkAdminAccess(session.access_token);

            // Se não tem perfil, abre modal
            const finalProfile = JSON.parse(localStorage.getItem(key) || "{}");
            if (!finalProfile.name) {
              setTimeout(() => openSettings(), 800);
            }
          } catch (e) {
            console.error("Erro ao carregar perfil:", e);
          }
        })();

        clearTimeout(timeoutId);
        resolve();
      }
    });

    // Timeout de segurança
    timeoutId = setTimeout(() => {
      if (!sessionFound) {
        console.log("Timeout: sem sessão, redirecionando pra login");
        redirected = true;
        resolve();
        // Redireciona pra login após resolver
        setTimeout(() => {
          window.location.replace("login.html");
        }, 100);
      }
    }, 1500);
  });
}

// Configura logout
logoutBtn.addEventListener("click", async () => {
  await OMISTER.auth.signOut();
  window.location.replace("login.html");
});

// Botão de admin: fica escondido por padrão, só aparece se /api/is-admin confirmar.
if (adminLinkBtn) {
  adminLinkBtn.addEventListener("click", () => {
    window.location.href = "admin.html";
  });
}

async function checkAdminAccess(accessToken) {
  if (!adminLinkBtn || !accessToken) return;
  try {
    const res = await fetch("/api/is-admin", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    adminLinkBtn.hidden = !data.isAdmin;
  } catch (e) {
    console.error("Falha ao checar acesso de admin:", e);
  }
}

// Botão de alternar tema
const themeBtn = document.getElementById("theme-btn");
if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

// Chips de sugestão no estado vazio
const emptySuggestions = document.getElementById("empty-suggestions");
if (emptySuggestions) {
  emptySuggestions.querySelectorAll(".suggestion-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      if (isStreaming) return;
      sendMessage(chip.textContent);
    });
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
    manageChatsBtn.style.display = "none";
    return;
  }
  manageChatsBtn.style.display = "";

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

async function deleteChat(id) {
  if (isStreaming) return;
  const chat = chats.find((c) => c.id === id);
  if (!chat) return;

  showModal(
    "Excluir conversa?",
    `Tem certeza que deseja excluir a conversa <strong>"${escapeHtml(chatTitle(chat))}"</strong>? Essa ação não pode ser desfeita.`,
    "Excluir",
    async () => {
      chats = chats.filter((c) => c.id !== id);
      if (activeId === id) activeId = null;

      if (useCloud) {
        try {
          await OMISTER.cloudDelete(id);
        } catch (e) {
          console.error("Erro ao excluir conversa:", e);
          showToast("Erro ao excluir. Tente novamente.", "error");
        }
      } else {
        saveLocal();
      }
      persistActive();

      renderChatList();
      renderMessages();
      showToast("Conversa excluída", "success");
    }
  );
}

/* =========================================================
   Gerenciador de conversas (modal): selecionar, excluir, compartilhar
   ========================================================= */
let deleteConfirmPending = false;
let deleteConfirmTimer = null;

function openConversationsModal() {
  selectedChatIds.clear();
  conversationsSearch = "";
  if (conversationsSearchInput) conversationsSearchInput.value = "";
  resetDeleteConfirm();
  renderConversationsModal();
  conversationsModal.hidden = false;
}

function closeConversationsModal() {
  conversationsModal.hidden = true;
  selectedChatIds.clear();
  resetDeleteConfirm();
}

// Agrupa conversas por faixa de data (Hoje, Ontem, 7 dias, Mais antigas)
function groupChatsByDate(list) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const sevenDaysAgo = startOfToday - 7 * 86400000;

  const groups = { Hoje: [], Ontem: [], "Últimos 7 dias": [], "Mais antigas": [] };
  for (const chat of list) {
    const t = chat.updatedAt || 0;
    if (t >= startOfToday) groups["Hoje"].push(chat);
    else if (t >= startOfYesterday) groups["Ontem"].push(chat);
    else if (t >= sevenDaysAgo) groups["Últimos 7 dias"].push(chat);
    else groups["Mais antigas"].push(chat);
  }
  return groups;
}

function renderConversationsModal() {
  conversationsList.innerHTML = "";
  let sorted = [...chats].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  // Filtro de busca
  const q = conversationsSearch.trim().toLowerCase();
  if (q) {
    sorted = sorted.filter((c) => {
      if (chatTitle(c).toLowerCase().includes(q)) return true;
      // busca também no conteúdo das mensagens
      return (c.messages || []).some(
        (m) => typeof m.content === "string" && m.content.toLowerCase().includes(q)
      );
    });
  }

  if (!sorted.length) {
    const empty = document.createElement("p");
    empty.className = "conversations-empty";
    empty.textContent = q ? "Nenhuma conversa encontrada." : "Você ainda não tem conversas.";
    conversationsList.appendChild(empty);
    updateConversationsUI();
    return;
  }

  // Renderiza por grupos de data
  const groups = groupChatsByDate(sorted);
  for (const [label, list] of Object.entries(groups)) {
    if (!list.length) continue;

    const header = document.createElement("div");
    header.className = "conversations-group-label";
    header.textContent = label;
    conversationsList.appendChild(header);

    for (const chat of list) {
      conversationsList.appendChild(buildConversationRow(chat));
    }
  }

  updateConversationsUI();
}

function buildConversationRow(chat) {
  const row = document.createElement("div");
  row.className = "conversations-row";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "conversations-checkbox";
  checkbox.checked = selectedChatIds.has(chat.id);
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) selectedChatIds.add(chat.id);
    else selectedChatIds.delete(chat.id);
    resetDeleteConfirm();
    updateConversationsUI();
  });
  row.appendChild(checkbox);

  const info = document.createElement("div");
  info.className = "conversations-row-info";

  const title = document.createElement("div");
  title.className = "conversations-row-title";
  title.textContent = chatTitle(chat);
  info.appendChild(title);

  const meta = document.createElement("div");
  meta.className = "conversations-row-meta";
  const count = chat.messages ? chat.messages.length : 0;
  meta.textContent = `${count} ${count === 1 ? "mensagem" : "mensagens"} · ${formatChatDate(chat.updatedAt)}`;
  info.appendChild(meta);

  row.appendChild(info);

  // Ações da linha: renomear e abrir
  const actions = document.createElement("div");
  actions.className = "conversations-row-actions";

  const renameBtn = document.createElement("button");
  renameBtn.className = "conversations-row-btn";
  renameBtn.title = "Renomear";
  renameBtn.setAttribute("aria-label", "Renomear conversa");
  renameBtn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  renameBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    startRenameConversation(chat, row, info);
  });
  actions.appendChild(renameBtn);

  const openBtn = document.createElement("button");
  openBtn.className = "conversations-row-btn";
  openBtn.title = "Abrir conversa";
  openBtn.setAttribute("aria-label", "Abrir conversa");
  openBtn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>';
  openBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeConversationsModal();
    selectChat(chat.id);
  });
  actions.appendChild(openBtn);

  row.appendChild(actions);

  // Clicar na linha (fora dos botões) alterna a seleção
  row.addEventListener("click", (e) => {
    if (e.target === checkbox) return;
    checkbox.checked = !checkbox.checked;
    checkbox.dispatchEvent(new Event("change"));
  });

  return row;
}

function startRenameConversation(chat, row, info) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "conversations-rename-input";
  input.value = chatTitle(chat);
  row.replaceChild(input, info);
  input.focus();
  input.select();

  let done = false;
  const commit = async (save) => {
    if (done) return;
    done = true;
    if (save) {
      const newTitle = input.value.trim();
      if (newTitle && newTitle !== chat.title) {
        chat.title = newTitle.slice(0, 60);
        chat.updatedAt = Date.now();
        await saveChat(chat);
        renderChatList();
        showToast("Conversa renomeada", "success");
      }
    }
    renderConversationsModal();
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); commit(true); }
    else if (e.key === "Escape") { e.preventDefault(); commit(false); }
  });
  input.addEventListener("blur", () => commit(true));
  // Evita que o clique no input alterne seleção
  input.addEventListener("click", (e) => e.stopPropagation());
}

function formatChatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function updateConversationsUI() {
  const count = selectedChatIds.size;
  conversationsCount.textContent =
    count === 0 ? "Nenhuma selecionada" : `${count} ${count === 1 ? "selecionada" : "selecionadas"}`;
  if (!deleteConfirmPending) conversationsDeleteBtn.textContent = `Excluir (${count})`;
  conversationsDeleteBtn.disabled = count === 0;
  conversationsShareBtn.disabled = count === 0;
  conversationsSelectAll.checked = count > 0 && count === chats.length;
}

function buildShareTextFromChats(ids) {
  const parts = [];
  const sorted = [...chats].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  for (const chat of sorted) {
    if (!ids.has(chat.id)) continue;
    parts.push(`*${chatTitle(chat)}*`);
    for (const m of chat.messages || []) {
      const who = m.role === "user" ? "Você" : "Mister";
      const text = typeof m.content === "string" ? m.content : "[conteúdo]";
      parts.push(`${who}: ${text}`);
    }
    parts.push(""); // linha em branco entre conversas
  }
  return parts.join("\n").trim();
}

function resetDeleteConfirm() {
  deleteConfirmPending = false;
  if (deleteConfirmTimer) { clearTimeout(deleteConfirmTimer); deleteConfirmTimer = null; }
  conversationsDeleteBtn.classList.remove("confirming");
  const count = selectedChatIds.size;
  conversationsDeleteBtn.textContent = `Excluir (${count})`;
}

async function performBulkDelete() {
  const ids = [...selectedChatIds];
  chats = chats.filter((c) => !selectedChatIds.has(c.id));
  if (activeId && selectedChatIds.has(activeId)) activeId = null;

  if (useCloud) {
    try {
      await Promise.all(ids.map((id) => OMISTER.cloudDelete(id)));
    } catch (e) {
      console.error("Erro ao excluir conversas:", e);
      showToast("Erro ao excluir algumas conversas", "error");
    }
  } else {
    saveLocal();
  }
  persistActive();

  const n = ids.length;
  selectedChatIds.clear();
  resetDeleteConfirm();
  renderChatList();
  renderMessages();
  showToast(n === 1 ? "Conversa excluída" : `${n} conversas excluídas`, "success");

  if (chats.length) renderConversationsModal();
  else closeConversationsModal();
}

manageChatsBtn.addEventListener("click", openConversationsModal);
conversationsCloseX.addEventListener("click", closeConversationsModal);
conversationsModal.addEventListener("click", (e) => {
  if (e.target === conversationsModal) closeConversationsModal();
});

conversationsSearchInput.addEventListener("input", () => {
  conversationsSearch = conversationsSearchInput.value;
  resetDeleteConfirm();
  renderConversationsModal();
});

conversationsSelectAll.addEventListener("change", () => {
  if (conversationsSelectAll.checked) {
    chats.forEach((c) => selectedChatIds.add(c.id));
  } else {
    selectedChatIds.clear();
  }
  resetDeleteConfirm();
  renderConversationsModal();
});

conversationsShareBtn.addEventListener("click", () => {
  if (selectedChatIds.size === 0) return;
  const text = buildShareTextFromChats(selectedChatIds);
  shareMessage(text);
});

// Exclusão com confirmação inline (sem popup em cima de popup)
conversationsDeleteBtn.addEventListener("click", () => {
  const count = selectedChatIds.size;
  if (count === 0) return;

  if (!deleteConfirmPending) {
    deleteConfirmPending = true;
    conversationsDeleteBtn.classList.add("confirming");
    conversationsDeleteBtn.textContent = "Confirmar exclusão?";
    deleteConfirmTimer = setTimeout(resetDeleteConfirm, 3500);
    return;
  }

  performBulkDelete();
});

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
      content.innerHTML = renderMarkdownSafe(m.content);
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
    navigator.clipboard.writeText(text)
      .then(() => showToast("Copiado", "success"))
      .catch(() => showToast("Erro ao copiar", "error"));
  });
  toolbar.appendChild(copyBtn);

  const shareBtn = document.createElement("button");
  shareBtn.className = "msg-btn msg-share";
  shareBtn.setAttribute("aria-label", "Compartilhar");
  shareBtn.title = "Compartilhar";
  shareBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';
  shareBtn.addEventListener("click", () => {
    const text = content.innerText || content.textContent;
    if (text.trim()) shareMessage(text);
  });
  toolbar.appendChild(shareBtn);

  // Botão "Ouvir" (TTS) desativado temporariamente
  // const speakBtn = document.createElement("button");
  // speakBtn.className = "msg-btn msg-speak";
  // speakBtn.setAttribute("aria-label", "Ouvir");
  // speakBtn.title = "Ouvir com voz";
  // speakBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
  // speakBtn.addEventListener("click", () => {
  //   const text = content.innerText || content.textContent;
  //   if (text.trim()) speakWithElevenLabs(text);
  // });
  // toolbar.appendChild(speakBtn);

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
        async () => {
          chat.messages.splice(messageIndex, 1);
          chat.updatedAt = Date.now();
          // Se a conversa ficou vazia, remove ela inteira da nuvem
          if (chat.messages.length === 0) {
            chats = chats.filter((c) => c.id !== chat.id);
            if (activeId === chat.id) activeId = null;
            if (useCloud) {
              try { await OMISTER.cloudDelete(chat.id); } catch (e) { console.error(e); }
            } else {
              saveLocal();
            }
            persistActive();
            renderChatList();
          } else {
            await saveChat(chat);
          }
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

function renderMarkdownSafe(md) {
  const html = renderMarkdown(md);
  // DOMPurify remove tags perigosas, mas permite tags estruturais de markdown
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "code",
      "pre",
      "a",
      "strong",
      "em",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
    ALLOW_DATA_ATTR: false,
  });
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

// Magic bytes validation (previne arquivos malformados)
async function validateFileMagicBytes(file) {
  const header = await file.slice(0, 8).arrayBuffer();
  const view = new Uint8Array(header);

  // JPG: FF D8 FF
  if (view[0] === 0xFF && view[1] === 0xD8 && view[2] === 0xFF) return true;
  // PNG: 89 50 4E 47
  if (view[0] === 0x89 && view[1] === 0x50 && view[2] === 0x4E && view[3] === 0x47) return true;
  // GIF: 47 49 46 38
  if (view[0] === 0x47 && view[1] === 0x49 && view[2] === 0x46 && view[3] === 0x38) return true;
  // WebP: RIFF ... WEBP
  if (view[0] === 0x52 && view[1] === 0x49 && view[2] === 0x46 && view[3] === 0x46) return true;
  // PDF: 25 50 44 46 (% P D F)
  if (view[0] === 0x25 && view[1] === 0x50 && view[2] === 0x44 && view[3] === 0x46) return true;

  return false;
}

uploadBtn.addEventListener("click", (e) => {
  e.preventDefault();
  imageInput.click();
});

imageInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Por favor, selecione uma imagem válida.");
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    alert("Imagem muito grande (máximo 10 MB).");
    return;
  }

  const isValidMagic = await validateFileMagicBytes(file);
  if (!isValidMagic) {
    alert("Arquivo de imagem inválido (assinatura não reconhecida).");
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
  imageInput.value = "";
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
    alert("Por favor, selecione um arquivo PDF válido.");
    return;
  }

  if (file.size > 50 * 1024 * 1024) {
    alert("PDF muito grande (máximo 50 MB).");
    return;
  }

  const isValidPdf = await validateFileMagicBytes(file);
  if (!isValidPdf) {
    alert("Arquivo PDF inválido (assinatura não reconhecida).");
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
  await saveChat(chat);
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
    const key = getProfileKey();
    const profile = JSON.parse(localStorage.getItem(key) || "{}");
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
      console.error("Erro da API:", res.status, info);
      throw new Error(info.error || `Status ${res.status}: O servidor não respondeu como esperado.`);
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
          bubble.innerHTML = renderMarkdownSafe(answer);
          scrollToBottom();
        } catch {
          /* fragmento incompleto: ignora */
        }
      }
    }

    if (answer.trim()) {
      chat.messages.push({ role: "assistant", content: answer });
      chat.updatedAt = Date.now();
      await saveChat(chat);
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
        await saveChat(chat);
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
function showChatListSkeleton() {
  chatListEl.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const sk = document.createElement("div");
    sk.className = "chat-skeleton";
    sk.style.width = 70 + Math.random() * 30 + "%";
    chatListEl.appendChild(sk);
  }
}

(async function init() {
  initAudioPlayer();
  updateProfileUI(); // Carrega perfil do usuário

  await initAuth();
  if (redirected) return; // indo para a tela de login

  showChatListSkeleton();
  chats = await loadChats();
  renderChatList();

  // Sempre começa com novo chat (não carrega a última)
  activeId = null;
  persistActive();

  renderMessages();
  updateSendState();

  hideSplash();
})();

// Some com a tela de splash suavemente após o app carregar
function hideSplash() {
  const splash = document.getElementById("splash-screen");
  if (!splash || splash.classList.contains("gone")) return;
  // Garante um tempo mínimo de exibição para a marca aparecer
  setTimeout(() => {
    splash.classList.add("hiding");
    setTimeout(() => splash.classList.add("gone"), 500);
  }, 1600);
}

// Failsafe: nunca deixa a splash travada mais de 6s
setTimeout(() => {
  const splash = document.getElementById("splash-screen");
  if (splash && !splash.classList.contains("gone")) {
    splash.classList.add("hiding");
    setTimeout(() => splash.classList.add("gone"), 500);
  }
}, 6000);
