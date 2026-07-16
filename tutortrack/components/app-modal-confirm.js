/**
 * app-modal-confirm.js — modal de confirmación de eliminación
 * (<app-modal-confirm>). Una sola instancia por página de listado.
 *
 * Trigger: <button data-delete-trigger data-delete-name="Texto del ítem">
 * dentro de un contenedor con [data-row] (la fila que se elimina).
 * Sin backend: el cambio es solo en el DOM, se resetea al recargar.
 *
 * El fondo del modal usa `bg-black/50`, NUNCA `bg-gray-900/50`: nuestro
 * `gray-900` apunta a una variable CSS (`var(--gray-900)`), y Tailwind
 * no puede calcular el modificador de opacidad (`/50`) sobre un color
 * que es una referencia a variable — el fondo queda sin oscurecer.
 * `black` es un color fijo de Tailwind, sí soporta opacidad. Mismo
 * criterio en cualquier backdrop nuevo (ver app-sidebar.js).
 *
 * Reutilizable en cualquier pantalla de catálogo/CRUD — no eliminar
 * directo sin confirmar en ninguna pantalla nueva que se agregue.
 */
(function () {
  const ICONS = {
    warning:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />',
  };

  class AppModalConfirm extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div data-backdrop class="fixed inset-0 z-50 hidden items-center justify-center bg-black/50 p-4">
          <div data-panel role="alertdialog" aria-modal="true" aria-labelledby="modal-confirm-title" class="w-full max-w-sm rounded-lg border border-border bg-bg p-6 shadow-md">
            <span class="flex h-10 w-10 items-center justify-center rounded-md bg-danger-bg text-danger">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">${ICONS.warning}</svg>
            </span>
            <h2 id="modal-confirm-title" class="mt-4 font-heading text-lg font-semibold text-text">Eliminar elemento</h2>
            <p data-message class="mt-2 text-sm text-text-muted"></p>
            <div class="mt-6 flex justify-end gap-2">
              <button type="button" data-cancel class="btn-ghost px-4">Cancelar</button>
              <button type="button" data-confirm class="inline-flex h-10 items-center rounded-md bg-danger px-4 text-sm font-semibold text-white transition hover:opacity-90">Eliminar</button>
            </div>
          </div>
        </div>
      `;
      this.pendingRow = null;
      this.pendingId = null;
      this.init();
    }

    init() {
      const backdrop = this.querySelector("[data-backdrop]");
      const message = this.querySelector("[data-message]");

      const open = (name, row) => {
        this.pendingRow = row || null;
        message.textContent = `¿Eliminar "${name}"? Esta acción no se puede deshacer.`;
        backdrop.classList.remove("hidden");
        backdrop.classList.add("flex");
      };

      const close = () => {
        backdrop.classList.add("hidden");
        backdrop.classList.remove("flex");
        this.pendingRow = null;
        this.pendingId = null;
      };

      document.addEventListener("click", (event) => {
        const trigger = event.target.closest("[data-delete-trigger]");
        if (!trigger) return;
        this.pendingId = trigger.dataset.rowId || trigger.closest("[data-row]")?.dataset.id || null;
        open(trigger.dataset.deleteName || "este elemento", trigger.closest("[data-row]"));
      });

      this.querySelector("[data-cancel]").addEventListener("click", close);
      backdrop.addEventListener("click", (event) => {
        if (event.target === backdrop) close();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !backdrop.classList.contains("hidden")) close();
      });

      this.querySelector("[data-confirm]").addEventListener("click", () => {
        const id = this.pendingId;
        const managed = Boolean(document.querySelector("[data-catalog]"));
        if (!managed && this.pendingRow) {
          const row = this.pendingRow;
          row.classList.add("opacity-0", "transition", "duration-200");
          setTimeout(() => row.remove(), 200);
        }
        document.dispatchEvent(
          new CustomEvent("app:delete-confirmed", { detail: { id, row: this.pendingRow } })
        );
        close();
        this.pendingId = null;
        document.dispatchEvent(new CustomEvent("app:toast", { detail: { message: "Elemento eliminado" } }));
      });
    }
  }

  customElements.define("app-modal-confirm", AppModalConfirm);
})();
