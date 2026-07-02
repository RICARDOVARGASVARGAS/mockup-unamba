/**
 * chatbot-widget.js — widget flotante del Chatbot IA (<chatbot-widget>).
 *
 * Diferenciador del proyecto (ver CLAUDE.md / ESPECIFICACION.md). En el
 * mockup es VISUAL, no funcional: el botón abre/cierra el panel y eso
 * es todo. El formulario no procesa nada (no hay IA real todavía).
 */

const CHAT_ICON =
  '<path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />';
const CLOSE_ICON = '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />';
const SEND_ICON =
  '<path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.126A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5" />';
const SPARKLE_ICON =
  '<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />';

class ChatbotWidget extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div id="chatbot-panel" role="dialog" aria-label="Asistente virtual" class="fixed bottom-24 right-5 z-50 hidden w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-lg sm:right-6">
        <div class="flex items-center gap-3 bg-primary px-4 py-3 text-white">
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">${SPARKLE_ICON}</svg>
          </span>
          <div class="flex-1 leading-tight">
            <p class="font-heading text-sm font-semibold">Asistente Virtual</p>
            <p class="text-xs text-white/80">Facultad de Administración</p>
          </div>
          <button type="button" data-chatbot-close aria-label="Cerrar asistente" class="rounded-md p-1 transition hover:bg-white/15">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">${CLOSE_ICON}</svg>
          </button>
        </div>

        <div class="flex max-h-80 flex-col gap-3 overflow-y-auto p-4">
          <div class="max-w-[85%] rounded-lg rounded-tl-none bg-surface-2 px-3 py-2 text-sm text-text">
            ¡Hola! Soy el asistente virtual de la facultad. Puedo ayudarte con reglamentos, malla curricular, comunicados y trámites. ¿En qué puedo ayudarte hoy?
          </div>
          <div class="ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-primary px-3 py-2 text-sm text-white">
            ¿Dónde puedo ver la malla curricular?
          </div>
          <div class="max-w-[85%] rounded-lg rounded-tl-none bg-surface-2 px-3 py-2 text-sm text-text">
            La encuentras en Académico → Malla curricular, con el detalle de cursos por semestre.
          </div>
        </div>

        <form data-chatbot-form class="flex items-center gap-2 border-t border-border p-3">
          <label class="sr-only" for="chatbot-input">Escribe tu pregunta</label>
          <input
            id="chatbot-input"
            type="text"
            placeholder="Escribe tu pregunta..."
            class="flex-1 rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
          <button type="submit" aria-label="Enviar mensaje" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-white transition hover:bg-primary-dark">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">${SEND_ICON}</svg>
          </button>
        </form>
      </div>

      <button
        type="button"
        data-chatbot-toggle
        aria-expanded="false"
        aria-controls="chatbot-panel"
        aria-label="Abrir asistente virtual"
        class="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:bg-primary-dark sm:right-6"
      >
        <span data-icon-open>
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">${CHAT_ICON}</svg>
        </span>
        <span data-icon-close-btn class="hidden">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">${CLOSE_ICON}</svg>
        </span>
      </button>
    `;

    this.init();
  }

  init() {
    const toggle = this.querySelector("[data-chatbot-toggle]");
    const closeBtn = this.querySelector("[data-chatbot-close]");
    const panel = this.querySelector("#chatbot-panel");
    const iconOpen = this.querySelector("[data-icon-open]");
    const iconClose = this.querySelector("[data-icon-close-btn]");
    const form = this.querySelector("[data-chatbot-form]");
    const input = this.querySelector("#chatbot-input");

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar asistente virtual" : "Abrir asistente virtual");
      panel.classList.toggle("hidden", !open);
      panel.classList.toggle("flex", open);
      iconOpen.classList.toggle("hidden", open);
      iconClose.classList.toggle("hidden", !open);
      if (open) input.focus();
    };

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    closeBtn.addEventListener("click", () => setOpen(false));

    document.addEventListener("click", (event) => {
      if (!this.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });

    // Mockup visual: no envía ni procesa mensajes reales todavía.
    form.addEventListener("submit", (event) => {
      event.preventDefault();
    });
  }
}

customElements.define("chatbot-widget", ChatbotWidget);
