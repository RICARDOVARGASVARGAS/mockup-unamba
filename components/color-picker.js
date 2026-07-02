/**
 * color-picker.js — herramienta de diseño del mockup (<color-picker-tool>).
 *
 * Solo para experimentar la paleta: ajusta en vivo --color-primary y
 * --color-accent, muestra sus HEX y permite copiarlos/exportarlos.
 * NO es parte del producto final. Se puede ocultar para demos limpias.
 */

const PICKER_STORAGE_KEY = "mockup-color-picker-hidden";

function readCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function hexFromCssVar(name) {
  const raw = readCssVar(name);
  if (!raw) return "#000000";
  if (raw.startsWith("#")) return raw.toUpperCase();

  const rgb = raw.match(/[\d.]+/g);
  if (rgb && rgb.length >= 3) {
    return rgbToHex(Number(rgb[0]), Number(rgb[1]), Number(rgb[2]));
  }
  return "#000000";
}

function setBrandColor(varName, hex) {
  document.documentElement.style.setProperty(varName, hex);
  document.dispatchEvent(
    new CustomEvent("colorchange", { detail: { varName, hex } })
  );
}

class ColorPickerTool extends HTMLElement {
  connectedCallback() {
    const hidden = sessionStorage.getItem(PICKER_STORAGE_KEY) === "1";

    this.innerHTML = `
      <button
        type="button"
        data-picker-show
        aria-label="Mostrar picker de colores"
        title="Picker de colores"
        class="${hidden ? "" : "hidden"} fixed bottom-5 left-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text shadow-md transition hover:bg-surface-2"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
        </svg>
      </button>

      <aside
        data-picker-panel
        aria-label="Picker de colores del mockup"
        class="${hidden ? "hidden" : ""} fixed bottom-5 left-5 z-50 w-[min(calc(100vw-2.5rem),20rem)] rounded-xl border border-border bg-surface p-4 shadow-lg"
      >
        <div class="mb-4 flex items-start justify-between gap-2">
          <div>
            <p class="font-heading text-sm font-semibold text-text">Picker de colores</p>
            <p class="mt-0.5 text-xs text-text-muted">Herramienta del mockup, no del sitio final</p>
          </div>
          <button
            type="button"
            data-picker-hide
            aria-label="Ocultar picker"
            title="Ocultar"
            class="shrink-0 rounded-md p-1 text-text-muted transition hover:bg-surface-2 hover:text-text"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label for="picker-primary" class="mb-1.5 block text-xs font-medium text-text">Primario (azul)</label>
            <div class="flex items-center gap-2">
              <input id="picker-primary" type="color" data-color-input="--color-primary" class="h-10 w-12 cursor-pointer rounded-md border border-border bg-bg" />
              <code data-hex-display="--color-primary" class="flex-1 rounded-md bg-surface-2 px-2 py-1.5 font-mono text-xs text-text">#000000</code>
              <button type="button" data-copy="--color-primary" class="rounded-md border border-border px-2 py-1.5 text-xs text-text-muted transition hover:bg-surface-2 hover:text-primary" title="Copiar HEX">Copiar</button>
            </div>
          </div>

          <div>
            <label for="picker-accent" class="mb-1.5 block text-xs font-medium text-text">Acento (amarillo)</label>
            <div class="flex items-center gap-2">
              <input id="picker-accent" type="color" data-color-input="--color-accent" class="h-10 w-12 cursor-pointer rounded-md border border-border bg-bg" />
              <code data-hex-display="--color-accent" class="flex-1 rounded-md bg-surface-2 px-2 py-1.5 font-mono text-xs text-text">#000000</code>
              <button type="button" data-copy="--color-accent" class="rounded-md border border-border px-2 py-1.5 text-xs text-text-muted transition hover:bg-surface-2 hover:text-primary" title="Copiar HEX">Copiar</button>
            </div>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <button type="button" data-export class="flex-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-white transition hover:bg-primary-dark">Exportar paleta</button>
          <button type="button" data-reset class="rounded-md border border-border px-3 py-2 text-xs text-text-muted transition hover:bg-surface-2">Restablecer</button>
        </div>

        <p data-copy-feedback class="mt-2 hidden text-center text-xs text-success">¡Copiado al portapapeles!</p>
      </aside>
    `;

    this.init();
  }

  init() {
    const panel = this.querySelector("[data-picker-panel]");
    const showBtn = this.querySelector("[data-picker-show]");
    const hideBtn = this.querySelector("[data-picker-hide]");
    const feedback = this.querySelector("[data-copy-feedback]");
    const inputs = this.querySelectorAll("[data-color-input]");

    const defaults = {
      "--color-primary": readCssVar("--color-primary"),
      "--color-accent": readCssVar("--color-accent"),
    };

    const syncDisplays = () => {
      inputs.forEach((input) => {
        const varName = input.dataset.colorInput;
        const hex = hexFromCssVar(varName);
        input.value = hex;
        const display = this.querySelector(`[data-hex-display="${varName}"]`);
        if (display) display.textContent = hex.toUpperCase();
      });
    };

    const setPanelVisible = (visible) => {
      panel.classList.toggle("hidden", !visible);
      showBtn.classList.toggle("hidden", visible);
      sessionStorage.setItem(PICKER_STORAGE_KEY, visible ? "0" : "1");
    };

    syncDisplays();

    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        const varName = input.dataset.colorInput;
        const hex = input.value.toUpperCase();
        setBrandColor(varName, hex);
        const display = this.querySelector(`[data-hex-display="${varName}"]`);
        if (display) display.textContent = hex;
      });
    });

    this.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const varName = btn.dataset.copy;
        const hex = hexFromCssVar(varName);
        try {
          await navigator.clipboard.writeText(hex);
          feedback.classList.remove("hidden");
          setTimeout(() => feedback.classList.add("hidden"), 2000);
        } catch {
          window.prompt("Copia el HEX:", hex);
        }
      });
    });

    this.querySelector("[data-export]").addEventListener("click", async () => {
      const primary = hexFromCssVar("--color-primary");
      const accent = hexFromCssVar("--color-accent");
      const text = [
        "/* Paleta exportada — Mockup UNAMBA */",
        `--color-primary: ${primary};`,
        `--color-accent: ${accent};`,
      ].join("\n");
      try {
        await navigator.clipboard.writeText(text);
        feedback.textContent = "¡Paleta exportada al portapapeles!";
        feedback.classList.remove("hidden");
        setTimeout(() => {
          feedback.classList.add("hidden");
          feedback.textContent = "¡Copiado al portapapeles!";
        }, 2500);
      } catch {
        window.prompt("Copia la paleta:", text);
      }
    });

    this.querySelector("[data-reset]").addEventListener("click", () => {
      document.documentElement.style.removeProperty("--color-primary");
      document.documentElement.style.removeProperty("--color-accent");
      syncDisplays();
    });

    hideBtn.addEventListener("click", () => setPanelVisible(false));
    showBtn.addEventListener("click", () => setPanelVisible(true));

    document.addEventListener("themechange", syncDisplays);
  }
}

customElements.define("color-picker-tool", ColorPickerTool);
