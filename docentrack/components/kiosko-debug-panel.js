/**
 * kiosko-debug-panel.js — herramienta de mockup (<kiosko-debug-panel>).
 *
 * El kiosko real reacciona al lector de huella; en el mockup no hay
 * lector, así que este panel deja "forzar" cualquier estado del flujo
 * con un clic para poder mostrarlos todos en una demo. NO es parte del
 * producto final — mismo espíritu que <color-picker-tool> en
 * pagina-web. Se puede ocultar para presentar el kiosko limpio.
 */

const DEBUG_STORAGE_KEY = "docentrack-debug-hidden";

const STATES = [
  { label: "Reposo", href: "index.html", group: "Flujo" },
  { label: "Leyendo huella", href: "pages/kiosko/procesando.html", group: "Flujo" },
  { label: "Identificado", href: "pages/kiosko/identificado.html", group: "Flujo" },
  { label: "Formulario de registro", href: "pages/kiosko/formulario.html", group: "Flujo" },
  { label: "Guardado exitoso", href: "pages/kiosko/confirmacion.html", group: "Flujo" },
  { label: "Huella no reconocida", href: "pages/kiosko/error-no-reconocido.html", group: "Errores" },
  { label: "Docente no identificado", href: "pages/kiosko/error-no-identificado.html", group: "Errores" },
  { label: "Lector desconectado", href: "pages/kiosko/error-lector-desconectado.html", group: "Errores" },
  { label: "Timeout de captura", href: "pages/kiosko/error-timeout.html", group: "Errores" },
  { label: "Error al guardar", href: "pages/kiosko/error-guardado.html", group: "Errores" },
];

function groupItems(base) {
  const groups = [...new Set(STATES.map((s) => s.group))];
  return groups
    .map(
      (group) => `
      <p class="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted first:mt-0">${group}</p>
      <ul class="space-y-1">
        ${STATES.filter((s) => s.group === group)
          .map(
            (s) => `
          <li>
            <a href="${base}${s.href}" class="block rounded-md px-2.5 py-2 text-sm text-text transition hover:bg-surface-2 hover:text-primary">${s.label}</a>
          </li>`
          )
          .join("")}
      </ul>`
    )
    .join("");
}

class KioskoDebugPanel extends HTMLElement {
  connectedCallback() {
    const base = window.getBasePath ? window.getBasePath() : "";
    const hidden = sessionStorage.getItem(DEBUG_STORAGE_KEY) === "1";

    this.innerHTML = `
      <button
        type="button"
        data-debug-show
        aria-label="Mostrar panel de estados (mockup)"
        title="Forzar estado (mockup)"
        class="${hidden ? "" : "hidden"} fixed bottom-5 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text shadow-md transition hover:bg-surface-2"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </button>

      <aside
        data-debug-panel
        aria-label="Forzar estado del kiosko (mockup)"
        class="${hidden ? "hidden" : ""} fixed bottom-5 right-5 z-50 max-h-[min(80vh,32rem)] w-[min(calc(100vw-2.5rem),18rem)] overflow-y-auto rounded-xl border border-border bg-surface p-4 shadow-lg"
      >
        <div class="mb-1 flex items-start justify-between gap-2">
          <div>
            <p class="font-heading text-sm font-semibold text-text">Forzar estado</p>
            <p class="mt-0.5 text-xs text-text-muted">Herramienta del mockup, no del kiosko final</p>
          </div>
          <button
            type="button"
            data-debug-hide
            aria-label="Ocultar panel"
            title="Ocultar"
            class="shrink-0 rounded-md p-1 text-text-muted transition hover:bg-surface-2 hover:text-text"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        ${groupItems(base)}
      </aside>
    `;

    this.init();
  }

  init() {
    const panel = this.querySelector("[data-debug-panel]");
    const showBtn = this.querySelector("[data-debug-show]");
    const hideBtn = this.querySelector("[data-debug-hide]");

    const setPanelVisible = (visible) => {
      panel.classList.toggle("hidden", !visible);
      showBtn.classList.toggle("hidden", visible);
      sessionStorage.setItem(DEBUG_STORAGE_KEY, visible ? "0" : "1");
    };

    hideBtn.addEventListener("click", () => setPanelVisible(false));
    showBtn.addEventListener("click", () => setPanelVisible(true));
  }
}

customElements.define("kiosko-debug-panel", KioskoDebugPanel);
