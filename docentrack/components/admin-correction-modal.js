/**
 * admin-correction-modal.js — modal de corrección de un registro de
 * asistencia (<admin-correction-modal>), usado solo en registros.html.
 *
 * Regla dura del proyecto (ver docentrack/CLAUDE.md): un registro SIEMPRE
 * se crea con huella, nunca manualmente. Lo único que el panel admin
 * permite es CORREGIR un dato ya existente, y solo dejando motivo —
 * queda auditado (quién, cuándo, motivo). Este modal no crea registros
 * nuevos, solo edita uno existente y exige el motivo antes de habilitar
 * "Guardar corrección".
 *
 * Trigger: <button data-correct-trigger data-correct-summary="texto del
 * registro"> en la fila correspondiente ([data-row]).
 */
(function () {
  class AdminCorrectionModal extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div data-backdrop class="fixed inset-0 z-50 hidden items-center justify-center bg-gray-900/50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="correction-title" class="w-full max-w-md rounded-lg bg-surface p-6 shadow-lg">
            <h2 id="correction-title" class="font-heading text-lg font-semibold text-text">Corregir registro</h2>
            <p data-summary class="mt-1 text-sm text-text-muted"></p>

            <div class="mt-4 flex items-start gap-2 rounded-md bg-info-bg px-3 py-2.5 text-xs text-info">
              <svg class="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
              <span>La huella no se puede cambiar: solo se corrige el dato mal registrado. Quedará auditado con tu nombre, la fecha y el motivo.</span>
            </div>

            <form data-correction-form class="mt-4 space-y-4">
              <div>
                <label for="correction-value" class="block text-sm font-medium text-text">Valor corregido</label>
                <input id="correction-value" data-correction-value type="text" required class="mt-1.5 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label for="correction-motivo" class="block text-sm font-medium text-text">Motivo de la corrección <span class="text-danger">*</span></label>
                <textarea id="correction-motivo" data-correction-motivo required rows="3" placeholder="Ej. el docente indicó verbalmente el aula equivocada, se confirmó con el horario asignado." class="mt-1.5 w-full resize-y rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"></textarea>
              </div>

              <div class="flex items-center justify-end gap-3 pt-1">
                <button type="button" data-cancel class="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text transition hover:bg-surface-2">Cancelar</button>
                <button type="submit" data-submit disabled class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-onPrimary transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50">Guardar corrección</button>
              </div>
            </form>
          </div>
        </div>
      `;
      this.pendingRow = null;
      this.init();
    }

    init() {
      const backdrop = this.querySelector("[data-backdrop]");
      const summary = this.querySelector("[data-summary]");
      const form = this.querySelector("[data-correction-form]");
      const valueInput = this.querySelector("[data-correction-value]");
      const motivoInput = this.querySelector("[data-correction-motivo]");
      const submitBtn = this.querySelector("[data-submit]");

      const open = (text, currentValue, row) => {
        this.pendingRow = row || null;
        summary.textContent = text || "";
        valueInput.value = currentValue || "";
        motivoInput.value = "";
        submitBtn.disabled = true;
        backdrop.classList.remove("hidden");
        backdrop.classList.add("flex");
        valueInput.focus();
      };

      const close = () => {
        backdrop.classList.add("hidden");
        backdrop.classList.remove("flex");
        this.pendingRow = null;
      };

      const syncSubmitState = () => {
        submitBtn.disabled = motivoInput.value.trim().length < 10;
      };
      motivoInput.addEventListener("input", syncSubmitState);

      document.addEventListener("click", (event) => {
        const trigger = event.target.closest("[data-correct-trigger]");
        if (!trigger) return;
        open(trigger.dataset.correctSummary, trigger.dataset.correctValue, trigger.closest("[data-row]"));
      });

      this.querySelector("[data-cancel]").addEventListener("click", close);
      backdrop.addEventListener("click", (event) => {
        if (event.target === backdrop) close();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !backdrop.classList.contains("hidden")) close();
      });

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (submitBtn.disabled) return;

        if (this.pendingRow) {
          const valueCell = this.pendingRow.querySelector("[data-correct-target]");
          if (valueCell) valueCell.textContent = valueInput.value;
          const statusCell = this.pendingRow.querySelector("[data-correct-status]");
          if (statusCell) {
            statusCell.innerHTML = `<span class="badge badge-info">Corregido</span>`;
          }
        }

        close();
        document.dispatchEvent(
          new CustomEvent("admin:toast", { detail: { message: "Corrección guardada y auditada" } })
        );
      });
    }
  }

  customElements.define("admin-correction-modal", AdminCorrectionModal);
})();
