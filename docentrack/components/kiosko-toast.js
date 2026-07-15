/**
 * kiosko-toast.js — notificación flotante del kiosko (<kiosko-toast>).
 * Escucha "kiosko:toast" en document: { message, type?: 'info'|'success'|'warning'|'danger' }.
 */
(function () {
  const ICONS = {
    success: '<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />',
    info: '<path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />',
    warning:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />',
    danger:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0 3.75h.008M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />',
    close: '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />',
  };

  const TYPE_CLASS = {
    success: { wrap: "border-primary/30", icon: "bg-success-bg text-primary" },
    info: { wrap: "border-border", icon: "bg-info-bg text-info" },
    warning: { wrap: "border-warning/35", icon: "bg-warning-bg text-warning" },
    danger: { wrap: "border-danger/35", icon: "bg-danger-bg text-danger" },
  };

  class KioskoToast extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div class="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex justify-center px-4 sm:bottom-6 sm:justify-end sm:px-6">
          <div
            data-toast
            role="status"
            aria-live="polite"
            class="pointer-events-auto hidden max-w-md items-start gap-3 rounded-lg border bg-bg px-4 py-3 shadow-md"
          >
            <span data-toast-icon class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
              <svg data-toast-svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"></svg>
            </span>
            <p data-toast-message class="flex-1 pt-0.5 text-sm font-medium text-text"></p>
            <button type="button" data-toast-close aria-label="Cerrar aviso" class="shrink-0 rounded-md p-1 text-text-muted transition hover:bg-surface-2 hover:text-text">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">${ICONS.close}</svg>
            </button>
          </div>
        </div>
      `;
      this.timer = null;
      this.init();
    }

    init() {
      const toast = this.querySelector("[data-toast]");
      const message = this.querySelector("[data-toast-message]");
      const iconWrap = this.querySelector("[data-toast-icon]");
      const iconSvg = this.querySelector("[data-toast-svg]");

      const hide = () => {
        toast.classList.add("hidden");
        toast.classList.remove("flex");
      };

      const show = ({ message: text, type = "info" } = {}) => {
        if (!text) return;
        const key = TYPE_CLASS[type] ? type : "info";
        const styles = TYPE_CLASS[key];

        message.textContent = text;
        iconSvg.innerHTML = ICONS[key] || ICONS.info;
        toast.className = `pointer-events-auto flex max-w-md items-start gap-3 rounded-lg border bg-bg px-4 py-3 shadow-md ${styles.wrap}`;
        iconWrap.className = `mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${styles.icon}`;

        clearTimeout(this.timer);
        this.timer = setTimeout(hide, 4200);
      };

      document.addEventListener("kiosko:toast", (event) => show(event.detail || {}));
      this.querySelector("[data-toast-close]").addEventListener("click", () => {
        clearTimeout(this.timer);
        hide();
      });
    }
  }

  customElements.define("kiosko-toast", KioskoToast);

  window.KioskoToastShow = (message, type = "info") => {
    document.dispatchEvent(new CustomEvent("kiosko:toast", { detail: { message, type } }));
  };
})();
