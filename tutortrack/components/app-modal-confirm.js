/**
 * app-modal-confirm.js — modal de confirmación reutilizable (<app-modal-confirm>).
 *
 * 1) Eliminar fila: botón [data-delete-trigger] → toast + app:delete-confirmed
 * 2) Confirmación genérica: AppConfirm.request({ title, message, confirmLabel, variant })
 *    → Promise<boolean>
 *
 * Fondo: bg-black/50 (nunca bg-gray-900/50).
 */
(function () {
  const ICONS = {
    warning:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />',
    key: '<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />',
  };

  class AppModalConfirm extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div data-backdrop class="fixed inset-0 z-50 hidden items-center justify-center bg-black/50 p-4">
          <div data-panel role="alertdialog" aria-modal="true" aria-labelledby="modal-confirm-title" class="w-full max-w-md rounded-lg border border-border bg-bg p-6 shadow-md">
            <span data-icon-wrap class="flex h-10 w-10 items-center justify-center rounded-md bg-danger-bg text-danger">
              <svg data-icon class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">${ICONS.warning}</svg>
            </span>
            <h2 id="modal-confirm-title" data-title class="mt-4 font-heading text-lg font-semibold text-text">Eliminar elemento</h2>
            <div data-message class="mt-2 text-sm text-text-muted space-y-2"></div>
            <div class="mt-6 flex justify-end gap-2">
              <button type="button" data-cancel class="btn-ghost px-4">Cancelar</button>
              <button type="button" data-confirm class="inline-flex h-10 items-center rounded-md bg-danger px-4 text-sm font-semibold text-white transition hover:opacity-90">Eliminar</button>
            </div>
          </div>
        </div>
      `;
      this.pendingRow = null;
      this.pendingId = null;
      this.mode = "delete";
      this._resolver = null;
      this.init();
      window.AppConfirm = {
        request: (opts) => this.request(opts || {}),
      };
    }

    applyVariant(variant) {
      const iconWrap = this.querySelector("[data-icon-wrap]");
      const icon = this.querySelector("[data-icon]");
      const confirmBtn = this.querySelector("[data-confirm]");
      const isDanger = variant !== "warning" && variant !== "primary";

      if (variant === "warning") {
        iconWrap.className =
          "flex h-10 w-10 items-center justify-center rounded-md bg-warning-bg text-warning";
        icon.innerHTML = ICONS.key;
        confirmBtn.className =
          "inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-90";
      } else if (variant === "primary") {
        iconWrap.className =
          "flex h-10 w-10 items-center justify-center rounded-md bg-primary-soft text-primary";
        icon.innerHTML = ICONS.warning;
        confirmBtn.className =
          "inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-90";
      } else {
        iconWrap.className =
          "flex h-10 w-10 items-center justify-center rounded-md bg-danger-bg text-danger";
        icon.innerHTML = ICONS.warning;
        confirmBtn.className =
          "inline-flex h-10 items-center rounded-md bg-danger px-4 text-sm font-semibold text-white transition hover:opacity-90";
      }

      return isDanger;
    }

    openUi({ title, message, messageHtml, confirmLabel, cancelLabel, variant }) {
      const backdrop = this.querySelector("[data-backdrop]");
      const messageEl = this.querySelector("[data-message]");
      this.querySelector("[data-title]").textContent = title || "Confirmar";
      if (messageHtml) {
        messageEl.innerHTML = messageHtml;
      } else {
        messageEl.textContent = message || "";
      }
      this.querySelector("[data-confirm]").textContent = confirmLabel || "Confirmar";
      this.querySelector("[data-cancel]").textContent = cancelLabel || "Cancelar";
      this.applyVariant(variant || "danger");
      backdrop.classList.remove("hidden");
      backdrop.classList.add("flex");
      // Foco por defecto en Cancelar (acciones destructivas / sensibles)
      this.querySelector("[data-cancel]")?.focus();
    }

    closeUi() {
      const backdrop = this.querySelector("[data-backdrop]");
      backdrop.classList.add("hidden");
      backdrop.classList.remove("flex");
      this.pendingRow = null;
      this.pendingId = null;
      this.mode = "delete";
    }

    request(opts) {
      return new Promise((resolve) => {
        this._resolver = resolve;
        this.mode = "generic";
        this.openUi({
          title: opts.title || "Confirmar",
          message: opts.message || "",
          messageHtml: opts.messageHtml || "",
          confirmLabel: opts.confirmLabel || "Aceptar",
          cancelLabel: opts.cancelLabel || "Cancelar",
          variant: opts.variant || "warning",
        });
      });
    }

    finishGeneric(accepted) {
      const resolve = this._resolver;
      this._resolver = null;
      this.closeUi();
      if (typeof resolve === "function") resolve(Boolean(accepted));
    }

    init() {
      const backdrop = this.querySelector("[data-backdrop]");

      document.addEventListener("click", (event) => {
        const trigger = event.target.closest("[data-delete-trigger]");
        if (!trigger) return;
        this.mode = "delete";
        this.pendingId = trigger.dataset.rowId || trigger.closest("[data-row]")?.dataset.id || null;
        this.pendingRow = trigger.closest("[data-row]");
        this.openUi({
          title: "Eliminar elemento",
          message: `¿Eliminar "${trigger.dataset.deleteName || "este elemento"}"? Esta acción no se puede deshacer.`,
          confirmLabel: "Eliminar",
          cancelLabel: "Cancelar",
          variant: "danger",
        });
      });

      this.querySelector("[data-cancel]").addEventListener("click", () => {
        if (this.mode === "generic") this.finishGeneric(false);
        else this.closeUi();
      });

      backdrop.addEventListener("click", (event) => {
        if (event.target !== backdrop) return;
        if (this.mode === "generic") this.finishGeneric(false);
        else this.closeUi();
      });

      document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (backdrop.classList.contains("hidden")) return;
        if (this.mode === "generic") this.finishGeneric(false);
        else this.closeUi();
      });

      this.querySelector("[data-confirm]").addEventListener("click", () => {
        if (this.mode === "generic") {
          this.finishGeneric(true);
          return;
        }

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
        this.closeUi();
        this.pendingId = null;
        const deleteToast =
          this.getAttribute("delete-toast") ||
          document.querySelector("[data-catalog]")?.getAttribute("data-delete-toast") ||
          "Elemento eliminado";
        document.dispatchEvent(
          new CustomEvent("app:toast", { detail: { message: deleteToast, type: "warning" } })
        );
      });
    }
  }

  customElements.define("app-modal-confirm", AppModalConfirm);
})();
