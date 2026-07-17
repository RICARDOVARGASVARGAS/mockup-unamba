/**
 * app-toast.js — notificación superior centrada (<app-toast>).
 * Una sola instancia por página. Escucha "app:toast" en `document`:
 *   detail: { message: string, type?: "success"|"error"|"warning"|"info" }
 * Por defecto: success. Baja desde arriba; auto-cierra a los 4.5s o con X.
 */
(function () {
  const ICONS = {
    success:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />',
    error:
      '<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />',
    warning:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />',
    info: '<path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />',
    close: '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />',
  };

  const TYPES = new Set(["success", "error", "warning", "info"]);

  function normalizeType(type) {
    if (type === "danger") return "error";
    return TYPES.has(type) ? type : "success";
  }

  class AppToast extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div class="app-toast-host" aria-live="polite" aria-relevant="additions">
          <div data-toast class="app-toast" hidden role="status">
            <span data-toast-icon class="app-toast-icon" aria-hidden="true"></span>
            <p data-toast-message class="app-toast-message"></p>
            <button type="button" data-toast-close class="app-toast-close" aria-label="Cerrar notificación">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">${ICONS.close}</svg>
            </button>
          </div>
        </div>
      `;
      this.timer = null;
      this.init();
    }

    init() {
      const toast = this.querySelector("[data-toast]");
      const messageEl = this.querySelector("[data-toast-message]");
      const iconEl = this.querySelector("[data-toast-icon]");

      const hide = () => {
        toast.hidden = true;
        toast.classList.remove("is-visible");
      };

      const show = (detail = {}) => {
        const text = detail.message || "";
        if (!text) return;
        const type = normalizeType(detail.type);

        toast.dataset.type = type;
        messageEl.textContent = text;
        iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">${ICONS[type]}</svg>`;

        toast.hidden = false;
        // Reinicia animación de entrada
        toast.classList.remove("is-visible");
        void toast.offsetWidth;
        toast.classList.add("is-visible");

        clearTimeout(this.timer);
        this.timer = setTimeout(hide, 4500);
      };

      document.addEventListener("app:toast", (event) => show(event.detail || {}));
      this.querySelector("[data-toast-close]").addEventListener("click", () => {
        clearTimeout(this.timer);
        hide();
      });
    }
  }

  customElements.define("app-toast", AppToast);
})();
