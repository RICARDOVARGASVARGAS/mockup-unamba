/**
 * app-topbar.js — barra superior compartida de TutorTrack (<app-topbar>).
 *
 * Atributos:
 *   page-title     — título de la pantalla actual.
 *   user-name      — nombre + apellidos del usuario de ejemplo.
 *   user-role      — etiqueta de su rol (ej. "Docente-Tutor").
 *   user-initials  — iniciales para el avatar (si no hay foto).
 *   user-avatar    — opcional; ruta relativa a foto (usa getBasePath).
 *   user-ciclo     — opcional; solo Estudiante (ver MODELO-DATOS.md).
 *                   Si no se pasa, no se muestra.
 *
 * "Carrera" es fija para todo el sistema (Facultad de Administración,
 * ver ../CLAUDE.md § Decisiones de alcance — Escuela Profesional
 * descartada), así que se muestra siempre igual, sin atributo.
 *
 * Usuarios de ejemplo fijos (sin sesión real — el mockup no tiene
 * backend, ver ../CLAUDE.md § Modelo de datos y alcance).
 *
 * Todo el archivo va dentro de un IIFE, mismo motivo que app-sidebar.js.
 */
(function () {
  const CARRERA = "Administración";

  const ICONS = {
    menu: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />',
    sun: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />',
    moon: '<path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />',
    chevron: '<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />',
    bell: '<path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />',
  };

  function icon(name, extraClass = "h-5 w-5") {
    return `<svg class="${extraClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">${ICONS[name]}</svg>`;
  }

  class AppTopbar extends HTMLElement {
    connectedCallback() {
      const title = this.getAttribute("page-title") || "";
      const userName = this.getAttribute("user-name") || "Usuario Demo";
      const userRole = this.getAttribute("user-role") || "";
      const userInitials = this.getAttribute("user-initials") || "U";
      const userCiclo = this.getAttribute("user-ciclo"); // solo Estudiante
      const userAvatar = this.getAttribute("user-avatar");

      const subtitleParts = [userRole, `Carrera: ${CARRERA}`];
      if (userCiclo) subtitleParts.splice(1, 0, `Ciclo actual: ${userCiclo}°`);
      const subtitle = subtitleParts.filter(Boolean).join(" · ");

      const avatarHtml = userAvatar
        ? `<img class="avatar-photo" src="${window.getBasePath()}${userAvatar}" alt="" width="32" height="32" />`
        : `<span class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-semibold text-onPrimary">${userInitials}</span>`;

      this.innerHTML = `
        <header class="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-bg px-4 sm:px-6">
          <button
            type="button"
            data-open-sidebar
            aria-label="Abrir menú"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-2 hover:text-text lg:hidden"
          >
            ${icon("menu")}
          </button>

          <h1 class="font-heading text-base font-semibold text-text truncate sm:text-lg">${title}</h1>

          <div class="ml-auto flex items-center gap-0.5">
            <button
              type="button"
              data-theme-toggle
              aria-label="Cambiar tema"
              class="inline-flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-2 hover:text-text"
            >
              <span data-icon-sun>${icon("sun")}</span>
              <span data-icon-moon class="hidden">${icon("moon")}</span>
            </button>

            <details class="group relative">
              <summary class="relative flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-md text-text-muted transition hover:bg-surface-2 hover:text-text [&::-webkit-details-marker]:hidden">
                ${icon("bell")}
                <span class="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent"></span>
              </summary>
              <div class="absolute right-0 top-full z-20 mt-1.5 w-72 rounded-lg border border-border bg-bg p-2 shadow-md">
                <p class="px-2 py-1 text-xs font-semibold text-text-muted">Notificaciones</p>
                <a href="#" class="mt-0.5 block rounded-md px-2 py-2 text-sm transition hover:bg-surface">
                  <span class="font-medium text-text">Nueva alerta IA</span>
                  <span class="block text-xs text-text-muted">Ejemplo de contenido — se conecta en la Fase 5</span>
                </a>
              </div>
            </details>

            <details class="group relative ml-1">
              <summary class="flex cursor-pointer list-none items-center gap-2 rounded-md py-1 pl-1.5 pr-1 transition hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
                ${avatarHtml}
                <span class="hidden flex-col items-start leading-tight sm:flex">
                  <span class="text-sm font-medium text-text">${userName}</span>
                  <span class="text-xs text-text-muted">${subtitle}</span>
                </span>
                <span class="hidden text-text-muted sm:block">${icon("chevron", "h-4 w-4")}</span>
              </summary>
              <ul class="absolute right-0 top-full z-20 mt-1.5 w-48 rounded-lg border border-border bg-bg p-1.5 shadow-md">
                <li><a href="#" class="block rounded-md px-3 py-2 text-sm text-text hover:bg-surface">Mi perfil</a></li>
                <li><a href="${window.getBasePath()}index.html" class="block rounded-md px-3 py-2 text-sm text-danger hover:bg-danger-bg">Cerrar sesión</a></li>
              </ul>
            </details>
          </div>
        </header>
      `;

      this.init();
    }

    init() {
      this.querySelector("[data-open-sidebar]").addEventListener("click", () => {
        document.dispatchEvent(new CustomEvent("app:toggle-sidebar"));
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

      const menus = this.querySelectorAll("details");
      document.addEventListener("click", (event) => {
        menus.forEach((menu) => {
          if (!this.contains(event.target) || !menu.contains(event.target)) {
            if (!this.contains(event.target)) menu.open = false;
          }
        });
      });
      // Cierra un menú al abrir el otro
      menus.forEach((menu) => {
        menu.addEventListener("toggle", () => {
          if (menu.open) menus.forEach((other) => other !== menu && (other.open = false));
        });
      });
    }
  }

  customElements.define("app-topbar", AppTopbar);
})();
