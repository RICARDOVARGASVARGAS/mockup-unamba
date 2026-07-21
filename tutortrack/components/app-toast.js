/**
 * app-toast.js — notificación superior centrada (<app-toast>).
 * Una sola instancia por página. Escucha "app:toast" en `document`:
 *   detail: { title, subtitle?, type? }  — preferido
 *   detail: { message, type? }           — compat: message → título
 * Tipos: success | info | warning | error | danger (alias de error).
 * Duración: success/info 4s · warning/danger 6s. Cierre con ✕.
 * Posición superior centrada; slide-down al entrar; fade-out al salir.
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
  const DURATION_MS = {
    success: 4000,
    info: 4000,
    warning: 6000,
    error: 6000,
  };
  const EXIT_MS = 320;

  function normalizeType(type) {
    if (type === "danger") return "error";
    return TYPES.has(type) ? type : "success";
  }

  /** Título obligatorio; subtitle opcional. Compat: message → title. */
  function resolveCopy(detail = {}) {
    const title = String(detail.title ?? detail.message ?? "").trim();
    const subtitle = String(detail.subtitle ?? "").trim();
    return { title, subtitle };
  }

  class AppToast extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div class="app-toast-host" aria-live="polite" aria-relevant="additions">
          <div data-toast class="app-toast" hidden role="status">
            <span data-toast-icon class="app-toast-icon" aria-hidden="true"></span>
            <div class="app-toast-body">
              <p data-toast-title class="app-toast-title"></p>
              <p data-toast-subtitle class="app-toast-subtitle" hidden></p>
            </div>
            <button type="button" data-toast-close class="app-toast-close" aria-label="Cerrar notificación">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">${ICONS.close}</svg>
            </button>
          </div>
        </div>
      `;
      this.timer = null;
      this.exitTimer = null;
      this.init();
    }

    init() {
      const toast = this.querySelector("[data-toast]");
      const titleEl = this.querySelector("[data-toast-title]");
      const subtitleEl = this.querySelector("[data-toast-subtitle]");
      const iconEl = this.querySelector("[data-toast-icon]");

      const hide = () => {
        clearTimeout(this.timer);
        clearTimeout(this.exitTimer);
        if (toast.hidden) return;
        toast.classList.remove("is-visible");
        this.exitTimer = setTimeout(() => {
          toast.hidden = true;
        }, EXIT_MS);
      };

      const show = (detail = {}) => {
        const { title, subtitle } = resolveCopy(detail);
        if (!title) return;
        const type = normalizeType(detail.type);

        clearTimeout(this.timer);
        clearTimeout(this.exitTimer);

        toast.dataset.type = type;
        titleEl.textContent = title;
        if (subtitle) {
          subtitleEl.textContent = subtitle;
          subtitleEl.hidden = false;
        } else {
          subtitleEl.textContent = "";
          subtitleEl.hidden = true;
        }
        iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">${ICONS[type]}</svg>`;

        toast.hidden = false;
        toast.classList.remove("is-visible");
        void toast.offsetWidth;
        toast.classList.add("is-visible");

        this.timer = setTimeout(hide, DURATION_MS[type] ?? 4000);
      };

      document.addEventListener("app:toast", (event) => show(event.detail || {}));
      this.querySelector("[data-toast-close]").addEventListener("click", hide);
    }
  }

  customElements.define("app-toast", AppToast);
})();
