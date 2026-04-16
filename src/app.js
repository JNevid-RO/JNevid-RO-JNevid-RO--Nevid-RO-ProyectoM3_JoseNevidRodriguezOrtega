import {
  addMessage,
  getMessages,
  loadSessionMessages
} from "./chat.js";
import { createMessageHtml } from "./utils.js";

const app = document.getElementById("app");
const routes = {
  "/home": homePage,
  "/chat": chatPage,
  "/about": aboutPage
};

function normalizePath(path) {
  if (!path || path === "/") return "/home";
  return path.replace(/\/+$/, "");
}

function navigate(path) {
  const target = normalizePath(path);
  if (target !== normalizePath(location.pathname)) {
    history.pushState({}, "", target);
  }
  render();
}

document.addEventListener("click", event => {
  const link = event.target.closest("[data-link]");
  if (!link) return;
  event.preventDefault();
  navigate(link.getAttribute("href"));
});

window.addEventListener("popstate", render);
window.addEventListener("load", render);

function render() {
  const path = normalizePath(location.pathname);
  const pageRenderer = routes[path];
  app.innerHTML = pageRenderer ? pageRenderer() : notFoundPage();
  updateActiveLink();

  if (path === "/chat") {
    initChat();
  }
}

function updateActiveLink() {
  document.querySelectorAll("nav a").forEach(link => {
    link.classList.toggle(
      "active",
      normalizePath(link.getAttribute("href")) === normalizePath(location.pathname)
    );
  });
}

function homePage() {
  return `
    <section class="page page--home">
      <header class="hero">
        <div class="hero__panel">
          <h1>Isaac Newton Chat</h1>
          <p>Un SPA moderno con routing sin recarga, chat seguro y Gemini AI. Aprende sobre física, movimiento y cálculo.</p>
        </div>
        <div class="hero__image">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/GodfreyKneller-IsaacNewton-1689.jpg/500px-GodfreyKneller-IsaacNewton-1689.jpg" alt="Retrato de Isaac Newton" />
        </div>
      </header>
      <div class="card-grid">
        <article class="card">
          <h2>Experiencia responsive</h2>
          <p>Diseño mobile-first con Flexbox y Grid para mobile, tablet y desktop.</p>
        </article>
        <article class="card">
          <h2>Chat con historia</h2>
          <p>Guarda la conversación en la sesión del navegador y usa scrolling automático.</p>
        </article>
        <article class="card">
          <h2>Serverless proxy</h2>
          <p>Gemini AI se invoca desde una función serverless segura sin exponer la API key.</p>
        </article>
      </div>
    </section>
  `;
}

function aboutPage() {
  return `
    <section class="page page--about">
      <article class="card card--wide">
        <h1>Sobre el proyecto</h1>
        <p>Esta SPA demuestra una integración responsable de Gemini AI con un proxy Vercel Serverless que protege la clave secreta.</p>
        <p>Fue creada por Jose Nevid Rodriguez Ortega.</p>
        <p>Se implementa:</p>
        <ul>
          <li>Routing funcional con History API</li>
          <li>Diseño responsive con media queries</li>
          <li>Llamadas async/await con loading y manejo de errores</li>
          <li>Historial de chat en sesión</li>
          <li>Pruebas unitarias con mocking</li>
        </ul>
      </article>
    </section>
  `;
}

function chatPage() {
  return `
    <section class="page page--chat">
      <div class="chat-window" role="region" aria-label="Chat con Isaac Newton">
        <div class="chat-header">
          <div class="assistant-avatar">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/GodfreyKneller-IsaacNewton-1689.jpg/500px-GodfreyKneller-IsaacNewton-1689.jpg" alt="Retrato de Isaac Newton" />
          </div>
          <div>
            <p class="subtitle">Chat seguro</p>
            <h2>Isaac Newton IA</h2>
            <p class="chat-description">Interactúa con Newton y recibe respuestas históricas en español.</p>
          </div>
          <div class="chat-meta">
            <span class="tag">Gemini AI</span>
          </div>
        </div>
        <div class="status-bar">
          <span id="status-loading" class="status status--loading" aria-live="polite" hidden>Cargando...</span>
          <span id="status-error" class="status status--error" aria-live="assertive" hidden></span>
        </div>
        <div class="messages" id="messages" aria-live="polite"></div>
        <form id="chat-form" class="input-area">
          <input id="input" name="input" type="text" placeholder="Escribe tu pregunta..." autocomplete="off" />
          <button id="send" type="submit">Enviar</button>
        </form>
      </div>
    </section>
  `;
}

function notFoundPage() {
  return `
    <section class="page page--notfound">
      <h1>404</h1>
      <p>No se encontró esta ruta. Usa el menú para navegar a Home, Chat o About.</p>
    </section>
  `;
}

function initChat() {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("input");
  const messagesDiv = document.getElementById("messages");
  const loadingIndicator = document.getElementById("status-loading");
  const errorIndicator = document.getElementById("status-error");
  const sendButton = document.getElementById("send");

  if (!form || !input || !messagesDiv || !loadingIndicator || !errorIndicator || !sendButton) {
    return;
  }

  if (form.dataset.initialized === "true") {
    return;
  }

  form.dataset.initialized = "true";

  loadSessionMessages();

  if (!getMessages().length) {
    addMessage(
      "Hola, soy Isaac Newton. Pregúntame sobre física, matemáticas o el universo.",
      "assistant"
    );
  }

  renderMessages();

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    input.value = "";
    addMessage(text, "user");
    renderMessages();
    setStatus({ loading: true, error: null });

    try {
      const response = await fetch("/api/functions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: getMessages() })
      });

      const rawText = await response.text();
      let data = {};

      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch (parseError) {
          throw new Error("El servidor devolvió una respuesta no válida. Verifica que el backend esté en ejecución.");
        }
      }

      if (!response.ok || data.error) {
        throw new Error(data.error || `Error del servidor ${response.status}`);
      }

      addMessage(data.reply, "assistant");
      renderMessages();
    } catch (error) {
      setStatus({ loading: false, error: error.message || "Ocurrió un error" });
    } finally {
      input.focus();
    }
  });

  function renderMessages() {
    const html = getMessages().map(createMessageHtml).join("");
    messagesDiv.innerHTML = html;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function setStatus({ loading, error }) {
    loadingIndicator.hidden = !loading;
    sendButton.disabled = loading;
    input.disabled = loading;

    if (error) {
      errorIndicator.textContent = error;
      errorIndicator.hidden = false;
    } else {
      errorIndicator.hidden = true;
      errorIndicator.textContent = "";
    }
  }
}

render();
