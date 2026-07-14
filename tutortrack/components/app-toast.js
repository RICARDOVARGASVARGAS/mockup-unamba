/**
 * app-toast.js — notificación flotante (<app-toast>). Una sola
 * instancia por página. Escucha "app:toast" en `document`
 * (detail: { message }). Auto-cierra a los 4s o con el botón X.
 *
 * Reutilizable en cualquier pantalla de catálogo/CRUD (ver
 * pages/admin/ciclos-periodos.html para el primer uso).
 */
(function () {
  const ICONS = {
    check: '<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />',
    close: '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />',
  };

  class AppToast extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div class="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4 sm:justify-end sm:right-6 sm:px-0">
          <div data-toast class="pointer-events-auto hidden max-w-sm items-center gap-3 rounded-lg border border-success/30 bg-surface px-4 py-3 shadow-lg">
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-bg text-success">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${ICONS.check}</svg>
            </span>
            <p data-toast-message class="text-sm font-medium text-text"></p>
            <button type="button" data-toast-close aria-label="Cerrar" class="ml-2 text-text-muted transition hover:text-text">
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

      const show = (text) => {
        message.textContent = text;
        toast.classList.remove("hidden");
        toast.classList.add("flex");
        clearTimeout(this.timer);
        this.timer = setTimeout(hide, 4000);
      };

      const hide = () => {
        toast.classList.add("hidden");
        toast.classList.remove("flex");
      };

      document.addEventListener("app:toast", (event) => show(event.detail.message));
      this.querySelector("[data-toast-close]").addEventListener("click", hide);
    }
  }

  customElements.define("app-toast", AppToast);
})();
