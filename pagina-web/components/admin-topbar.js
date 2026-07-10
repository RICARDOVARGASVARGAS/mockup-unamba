/**
 * admin-topbar.js — barra superior del panel de administración
 * (<admin-topbar>).
 *
 * Toma el título de la página desde el atributo `page-title`
 * (<admin-topbar page-title="Dashboard">). El toggle de tema reutiliza
 * el mismo mecanismo que el resto del sitio (theme.js + evento
 * "themechange"). El botón hamburguesa no controla el sidebar
 * directamente: dispara "admin:toggle-sidebar" en `document`, que
 * <admin-sidebar> escucha.
 *
 * Usuario de ejemplo fijo (sin sesión real — el mockup no tiene
 * backend): representa cómo se vería la cuenta de quien está logueado.
 *
 * Todo el archivo va dentro de un IIFE: <admin-sidebar> y <admin-topbar>
 * se cargan juntas en la misma página, y sin esto sus helpers internos
 * (`ICONS`, `icon()`) chocarían como redeclaraciones globales.
 */
(function () {
const ICONS = {
  menu: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />',
  sun: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />',
  moon: '<path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />',
  chevron: '<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />',
};

function icon(name) {
  return `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">${ICONS[name]}</svg>`;
}

class AdminTopbar extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute("page-title") || "";

    this.innerHTML = `
      <header class="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-bg px-4 sm:px-6">
        <button
          type="button"
          data-open-sidebar
          aria-label="Abrir menú"
          class="inline-flex h-10 w-10 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-2 hover:text-text lg:hidden"
        >
          ${icon("menu")}
        </button>

        <h1 class="font-heading text-lg font-semibold text-text">${title}</h1>

        <div class="ml-auto flex items-center gap-1">
          <button
            type="button"
            data-theme-toggle
            aria-label="Cambiar tema"
            class="inline-flex h-10 w-10 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-2 hover:text-text"
          >
            <span data-icon-sun>${icon("sun")}</span>
            <span data-icon-moon class="hidden">${icon("moon")}</span>
          </button>

          <details class="group relative ml-1">
            <summary class="flex cursor-pointer list-none items-center gap-2 rounded-md py-1.5 pl-2 pr-1 transition hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-onPrimary">MR</span>
              <span class="hidden flex-col items-start leading-tight sm:flex">
                <span class="text-sm font-medium text-text">María Rojas</span>
                <span class="text-xs text-text-muted">Administradora</span>
              </span>
              <span class="hidden text-text-muted sm:block">${icon("chevron")}</span>
            </summary>
            <ul class="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-border bg-surface p-2 shadow-lg">
              <li><a href="#" class="block rounded-md px-3 py-2 text-sm text-text hover:bg-surface-2">Mi perfil</a></li>
              <li><a href="login.html" class="block rounded-md px-3 py-2 text-sm text-danger hover:bg-danger-bg">Cerrar sesión</a></li>
            </ul>
          </details>
        </div>
      </header>
    `;

    this.init();
  }

  init() {
    this.querySelector("[data-open-sidebar]").addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("admin:toggle-sidebar"));
    });

    const sun = this.querySelector("[data-icon-sun]");
    const moon = this.querySelector("[data-icon-moon]");
    const syncThemeIcon = (theme) => {
      const isDark = theme === "dark";
      sun.classList.toggle("hidden", isDark);
      moon.classList.toggle("hidden", !isDark);
    };
    syncThemeIcon(window.Theme ? window.Theme.getTheme() : "light");
    document.addEventListener("themechange", (event) => syncThemeIcon(event.detail.theme));

    const userMenu = this.querySelector("details");
    document.addEventListener("click", (event) => {
      if (!this.contains(event.target)) userMenu.open = false;
    });
  }
}

customElements.define("admin-topbar", AdminTopbar);
})();
