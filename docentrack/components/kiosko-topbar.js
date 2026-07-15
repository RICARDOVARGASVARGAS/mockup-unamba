/**
 * kiosko-topbar.js — cabecera del kiosko (<kiosko-topbar>).
 * Marca, reloj en vivo, tema claro/oscuro y acceso al panel admin.
 */

const ICONS = {
  sun: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />',
  moon: '<path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />',
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
      <header class="w-full border-b border-border bg-bg/95 backdrop-blur-sm">
        <div class="brand-stripe" aria-hidden="true"></div>
        <div class="page-container flex h-14 items-center gap-3 sm:h-16">
          <a href="${base}index.html" class="flex shrink-0 items-center gap-2.5 rounded-md" aria-label="DocenTrack — ir a reposo">
            <img
              src="${base}assets/img/facultad/logo_universidad.jpg"
              alt="UNAMBA"
              class="h-9 w-9 shrink-0 rounded-full bg-surface object-contain ring-2 ring-accent sm:h-10 sm:w-10"
            />
            <img
              src="${base}assets/img/facultad/logo_facultad.jpg"
              alt=""
              class="hidden h-9 w-9 shrink-0 rounded-md bg-surface object-contain ring-1 ring-primary/30 sm:block"
            />
            <span class="hidden flex-col leading-tight sm:flex">
              <span class="font-heading text-sm font-semibold tracking-tight text-text">DocenTrack</span>
              <span class="text-xs font-medium text-accent">Registro de horas lectivas</span>
            </span>
          </a>

          <div data-clock class="ml-3 hidden flex-col leading-tight text-text-muted md:flex" aria-live="polite">
            <span data-clock-time class="font-heading text-lg font-semibold tabular-nums text-text"></span>
            <span data-clock-day class="text-xs capitalize"></span>
          </div>

          <div class="ml-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              data-theme-toggle
              title="Cambiar a modo oscuro"
              aria-label="Cambiar a modo oscuro"
              class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-primary transition hover:border-accent hover:text-accent"
            >
              <span data-icon-sun aria-hidden="true">${icon("sun")}</span>
              <span data-icon-moon class="hidden" aria-hidden="true">${icon("moon")}</span>
            </button>

            <a
              href="${base}pages/admin/login.html"
              title="Panel de administración"
              aria-label="Ir al panel de administración"
              class="inline-flex h-11 items-center gap-1.5 rounded-full border border-accent bg-accent-soft px-3.5 text-accent transition hover:bg-accent hover:text-onAccent"
            >
              ${icon("shield", "h-4 w-4")}
              <span class="hidden text-xs font-semibold sm:inline">Administrador</span>
            </a>
          </div>
        </div>
      </header>
    `;

    this.initClock();
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
