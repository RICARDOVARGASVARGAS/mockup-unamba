/**
 * kiosko-topbar.js — cabecera del kiosko (<kiosko-topbar>).
 *
 * Muestra marca, reloj en vivo y dos controles: tema claro/oscuro y
 * modo de interacción (Escritorio/Táctil, ver interaction-mode.js).
 * Se define UNA vez aquí y se reutiliza en cada pantalla del flujo.
 */

const ICONS = {
  sun: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />',
  moon: '<path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />',
  cursor:
    '<path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 10.5h-2.25m-15.5 0H3m3.227-5.273L4.636 3.636" />',
  hand: '<path stroke-linecap="round" stroke-linejoin="round" d="M7.5 14.25v-2.625a2.625 2.625 0 0 1 5.25 0V6.375a2.625 2.625 0 0 1 5.25 0v6.375m0-3.375a2.625 2.625 0 0 1 3.75 2.386v3.114a9 9 0 0 1-9 9h-1.5a9 9 0 0 1-8.02-4.906l-.634-1.234a2.348 2.348 0 0 1 1.048-3.148l.223-.111a2.348 2.348 0 0 1 2.615.402l1.018 1.018V6.375a2.625 2.625 0 0 1 5.25 0" />',
  shield: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />',
};

function icon(name, extraClass = "h-5 w-5") {
  return `<svg class="${extraClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">${ICONS[name]}</svg>`;
}

function formatClock(date) {
  const time = date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
  const day = date.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
  return { time, day: day.charAt(0).toUpperCase() + day.slice(1) };
}

class KioskoTopbar extends HTMLElement {
  connectedCallback() {
    const base = window.getBasePath ? window.getBasePath() : "";

    this.innerHTML = `
      <header class="w-full border-b border-border bg-surface">
        <div class="page-container flex h-16 items-center gap-3">
          <a href="${base}index.html" class="flex shrink-0 items-center gap-2" aria-label="DocenTrack — ir a reposo">
            <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-onPrimary font-heading text-sm font-bold">DT</span>
            <span class="hidden flex-col leading-tight sm:flex">
              <span class="font-heading text-sm font-semibold text-text">DocenTrack</span>
              <span class="text-xs text-text-muted">Registro de horas lectivas</span>
            </span>
          </a>

          <div data-clock class="ml-4 hidden flex-col leading-tight text-text-muted md:flex">
            <span data-clock-time class="font-heading text-lg font-semibold text-text"></span>
            <span data-clock-day class="text-xs capitalize"></span>
          </div>

          <div class="ml-auto flex shrink-0 items-center gap-2">
            <div class="flex items-center rounded-full border border-border bg-bg p-1" role="group" aria-label="Modo de interacción">
              <button type="button" data-density-set="desktop" data-density-btn="desktop" title="Modo escritorio" aria-label="Modo escritorio" class="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-text-muted transition">
                ${icon("cursor", "h-4 w-4")}<span class="hidden lg:inline">Escritorio</span>
              </button>
              <button type="button" data-density-set="touch" data-density-btn="touch" title="Modo táctil" aria-label="Modo táctil" class="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-text-muted transition">
                ${icon("hand", "h-4 w-4")}<span class="hidden lg:inline">Táctil</span>
              </button>
            </div>

            <button
              type="button"
              data-theme-toggle
              title="Cambiar tema"
              aria-label="Cambiar a modo oscuro"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg text-text transition hover:bg-surface-2"
            >
              <span data-icon-sun>${icon("sun")}</span>
              <span data-icon-moon class="hidden">${icon("moon")}</span>
            </button>

            <a
              href="${base}pages/admin/login.html"
              title="Panel de administración"
              aria-label="Ir al panel de administración"
              class="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-bg px-3 text-text-muted transition hover:border-primary hover:text-primary"
            >
              ${icon("shield", "h-4 w-4")}
              <span class="hidden text-xs font-medium lg:inline">Administrador</span>
            </a>
          </div>
        </div>
      </header>
    `;

    this.initClock();
    this.initDensityIndicator();
    this.initThemeIcon();
  }

  initClock() {
    const timeEl = this.querySelector("[data-clock-time]");
    const dayEl = this.querySelector("[data-clock-day]");
    const tick = () => {
      const { time, day } = formatClock(new Date());
      timeEl.textContent = time;
      dayEl.textContent = day;
    };
    tick();
    this._clockInterval = setInterval(tick, 1000 * 30);
  }

  initDensityIndicator() {
    const buttons = this.querySelectorAll("[data-density-btn]");
    const sync = () => {
      const current = window.InteractionMode ? window.InteractionMode.getDensity() : "desktop";
      buttons.forEach((btn) => {
        const active = btn.dataset.densityBtn === current;
        btn.classList.toggle("bg-primary", active);
        btn.classList.toggle("text-onPrimary", active);
        btn.classList.toggle("text-text-muted", !active);
      });
    };
    sync();
    document.addEventListener("densitychange", sync);
  }

  initThemeIcon() {
    const sun = this.querySelector("[data-icon-sun]");
    const moon = this.querySelector("[data-icon-moon]");
    const sync = () => {
      const dark = window.Theme && window.Theme.getTheme() === "dark";
      sun.classList.toggle("hidden", dark);
      moon.classList.toggle("hidden", !dark);
    };
    sync();
    document.addEventListener("themechange", sync);
  }

  disconnectedCallback() {
    clearInterval(this._clockInterval);
  }
}

customElements.define("kiosko-topbar", KioskoTopbar);
