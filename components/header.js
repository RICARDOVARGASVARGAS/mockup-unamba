/**
 * header.js — cabecera global (<site-header>).
 *
 * Se define UNA vez aquí y se reutiliza poniendo la etiqueta
 * <site-header></site-header> en cada página + este <script>. Cambiar
 * el menú, el logo o el comportamiento se hace solo en este archivo.
 *
 * Menú principal: reagrupado desde el listado de docs/ESPECIFICACION.md
 * ("Menú de Navegación") para bajar de 11 a 7 ítems de primer nivel.
 * "Actualidad" agrupa Noticias/Eventos/Comunicados; "Comunidad" agrupa
 * Vida Estudiantil/Posgrado/Galería. Ningún destino se pierde, solo
 * cambia el agrupamiento.
 */

const NAV_ITEMS = [
  { label: "Inicio", href: "index.html" },
  {
    label: "Nosotros",
    children: [
      { label: "La Facultad", href: "pages/nosotros.html" },
      { label: "Autoridades", href: "pages/autoridades.html" },
      { label: "Docentes", href: "pages/docentes.html" },
    ],
  },
  {
    label: "Académico",
    children: [
      { label: "Perfiles", href: "pages/academico.html" },
      { label: "Malla curricular", href: "pages/academico.html#malla" },
      { label: "Plan de estudios", href: "pages/academico.html#plan" },
      { label: "Investigación", href: "pages/investigacion.html" },
    ],
  },
  {
    label: "Actualidad",
    children: [
      { label: "Noticias", href: "pages/noticias.html" },
      { label: "Eventos", href: "pages/eventos.html" },
      { label: "Comunicados", href: "pages/comunicados.html" },
    ],
  },
  {
    label: "Servicios",
    children: [
      { label: "Bolsa de trabajo", href: "pages/bolsa-trabajo.html" },
      { label: "Documentos", href: "pages/documentos.html" },
      { label: "Trámites", href: "pages/tramites.html" },
      { label: "Encuestas", href: "pages/encuestas.html" },
      { label: "Convenios", href: "pages/convenios.html" },
    ],
  },
  {
    label: "Comunidad",
    children: [
      { label: "Vida Estudiantil", href: "pages/estudiantes.html" },
      { label: "Posgrado", href: "pages/posgrado.html" },
      { label: "Galería", href: "pages/galeria.html" },
    ],
  },
  { label: "Contacto", href: "pages/contacto.html" },
];

const ICONS = {
  menu: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />',
  close: '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />',
  chevron: '<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />',
  sun: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />',
  moon: '<path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />',
};

function icon(name, extraClass = "h-5 w-5") {
  return `<svg class="${extraClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">${ICONS[name]}</svg>`;
}

function renderDesktopItem(item, base) {
  if (item.children) {
    return `
      <details class="group relative">
        <summary class="flex cursor-pointer list-none items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-onPrimary transition hover:bg-white/10 hover:text-accent [&::-webkit-details-marker]:hidden">
          ${item.label}
          ${icon("chevron", "h-4 w-4 text-onPrimary/70 transition-transform duration-200 group-open:rotate-180")}
        </summary>
        <ul class="absolute left-0 top-full z-20 mt-2 w-56 rounded-lg border border-border bg-surface p-2 shadow-lg">
          ${item.children
            .map(
              (child) => `
            <li>
              <a href="${base}${child.href}" class="block rounded-md px-3 py-2 text-sm text-text transition hover:bg-surface-2 hover:text-primary">${child.label}</a>
            </li>`
            )
            .join("")}
        </ul>
      </details>`;
  }
  return `<a href="${base}${item.href}" class="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-onPrimary transition hover:bg-white/10 hover:text-accent">${item.label}</a>`;
}

function renderMobileItem(item, base) {
  if (item.children) {
    return `
      <details class="group border-b border-border last:border-0">
        <summary class="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-base font-medium text-text [&::-webkit-details-marker]:hidden">
          ${item.label}
          ${icon("chevron", "h-4 w-4 text-text-muted transition-transform duration-200 group-open:rotate-180")}
        </summary>
        <ul class="space-y-1 pb-3">
          ${item.children
            .map(
              (child) => `
            <li><a href="${base}${child.href}" class="block rounded-md px-6 py-2 text-sm text-text-muted transition hover:bg-surface-2 hover:text-primary">${child.label}</a></li>`
            )
            .join("")}
        </ul>
      </details>`;
  }
  return `<a href="${base}${item.href}" class="block border-b border-border px-4 py-3 text-base font-medium text-text last:border-0 hover:bg-surface-2 hover:text-primary">${item.label}</a>`;
}

class SiteHeader extends HTMLElement {
  connectedCallback() {
    const base = window.getBasePath ? window.getBasePath() : "";

    this.innerHTML = `
      <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-primary-dark">
        Saltar al contenido
      </a>
      <header data-site-header class="sticky top-0 z-30 w-full bg-primary text-onPrimary transition-shadow duration-200">
        <div class="page-container flex h-16 items-center gap-3">
          <a href="${base}index.html" class="flex shrink-0 items-center gap-2" aria-label="Ir a inicio">
            <img src="${base}assets/img/facultad/logo_facultad.jpg" alt="" class="h-10 w-10 shrink-0 rounded-lg bg-onPrimary object-contain p-0.5" />
            <span class="hidden flex-col leading-tight sm:flex">
              <span class="font-heading text-sm font-semibold text-onPrimary">Facultad de Administración</span>
              <span class="text-xs text-onPrimary/70">UNAMBA</span>
            </span>
          </a>

          <nav aria-label="Menú principal" class="hidden flex-1 items-center justify-center gap-1 lg:flex">
            ${NAV_ITEMS.map((item) => renderDesktopItem(item, base)).join("")}
          </nav>

          <div class="ml-auto flex shrink-0 items-center gap-1">
            <button
              type="button"
              data-theme-toggle
              title="Cambiar tema"
              aria-label="Cambiar a modo oscuro"
              class="inline-flex h-10 w-10 items-center justify-center rounded-md text-onPrimary transition hover:bg-white/10"
            >
              <span data-icon-sun>${icon("sun")}</span>
              <span data-icon-moon class="hidden">${icon("moon")}</span>
            </button>
            <button
              type="button"
              data-menu-toggle
              aria-expanded="false"
              aria-controls="mobile-menu"
              aria-label="Abrir menú"
              class="inline-flex h-10 w-10 items-center justify-center rounded-md text-onPrimary transition hover:bg-white/10 lg:hidden"
            >
              <span data-icon-menu>${icon("menu")}</span>
              <span data-icon-close class="hidden">${icon("close")}</span>
            </button>
          </div>
        </div>

        <div id="mobile-menu" class="hidden border-t border-border bg-bg lg:hidden">
          <nav aria-label="Menú principal móvil" class="page-container py-2">
            ${NAV_ITEMS.map((item) => renderMobileItem(item, base)).join("")}
          </nav>
        </div>
      </header>
    `;

    this.init();
  }

  init() {
    this.initMobileMenu();
    this.initDropdowns();
    this.initThemeIcon();
    this.initScrollShadow();
  }

  initMobileMenu() {
    const toggle = this.querySelector("[data-menu-toggle]");
    const panel = this.querySelector("#mobile-menu");
    const iconMenu = this.querySelector("[data-icon-menu]");
    const iconClose = this.querySelector("[data-icon-close]");

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      panel.classList.toggle("hidden", !open);
      iconMenu.classList.toggle("hidden", open);
      iconClose.classList.toggle("hidden", !open);
    };

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    panel.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    window.matchMedia("(min-width: 1024px)").addEventListener("change", (event) => {
      if (event.matches) setOpen(false);
    });
  }

  initDropdowns() {
    const details = this.querySelectorAll("details");
    details.forEach((entry) => {
      entry.addEventListener("toggle", () => {
        if (entry.open) {
          details.forEach((other) => {
            if (other !== entry) other.open = false;
          });
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (!this.contains(event.target)) {
        details.forEach((entry) => (entry.open = false));
      }
    });
  }

  initThemeIcon() {
    const button = this.querySelector("[data-theme-toggle]");
    const sun = this.querySelector("[data-icon-sun]");
    const moon = this.querySelector("[data-icon-moon]");

    const sync = (theme) => {
      const isDark = theme === "dark";
      sun.classList.toggle("hidden", isDark);
      moon.classList.toggle("hidden", !isDark);
      button.setAttribute("aria-label", isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    };

    sync(window.Theme ? window.Theme.getTheme() : "light");
    document.addEventListener("themechange", (event) => sync(event.detail.theme));
  }

  initScrollShadow() {
    // El header ya se separa del body por color; al hacer scroll suma una
    // sombra para reforzar que queda "flotando" sobre el contenido.
    const header = this.querySelector("[data-site-header]");

    const sync = () => {
      header.classList.toggle("shadow-md", window.scrollY > 4);
    };

    window.addEventListener("scroll", sync, { passive: true });
    sync();
  }
}

customElements.define("site-header", SiteHeader);
