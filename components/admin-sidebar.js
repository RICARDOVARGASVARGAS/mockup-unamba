/**
 * admin-sidebar.js — navegación lateral del panel de administración
 * (<admin-sidebar>).
 *
 * Mismo criterio que header.js: la lista de módulos se define UNA sola
 * vez aquí y se reutiliza en todas las páginas de /admin. Cambiar el
 * menú (agregar un módulo, reordenar un grupo) se hace solo en este
 * archivo.
 *
 * Cada enlace ya apunta al nombre de archivo FINAL de su módulo (ver
 * docs/PLAN-ADMIN.md), aunque ese módulo todavía no esté maquetado —
 * así, en cuanto se construya, el link se activa solo sin volver a
 * tocar este componente.
 *
 * En móvil/tablet actúa como drawer: <admin-topbar> dispara el evento
 * "admin:toggle-sidebar" en `document`, que este componente escucha.
 * Se comunican por evento, no por referencia directa, mismo espíritu
 * que theme.js/"themechange".
 *
 * Todo el archivo va dentro de un IIFE: <admin-sidebar> y <admin-topbar>
 * se cargan juntas en la misma página, y sin esto sus helpers internos
 * (`ICONS`, `icon()`) chocarían como redeclaraciones globales.
 */
(function () {
const ADMIN_NAV_GROUPS = [
  {
    label: "Contenido",
    items: [
      { label: "Noticias", href: "noticias.html" },
      { label: "Eventos", href: "eventos.html" },
      { label: "Comunicados", href: "comunicados.html" },
      { label: "Banners", href: "banners.html" },
      { label: "Galería", href: "galeria.html" },
    ],
  },
  {
    label: "La Facultad",
    items: [
      { label: "Nosotros", href: "nosotros.html" },
      { label: "Autoridades", href: "autoridades.html" },
      { label: "Comités", href: "comites.html" },
      { label: "Docentes", href: "docentes.html" },
    ],
  },
  {
    label: "Académico",
    items: [
      { label: "Información académica", href: "academico.html" },
      { label: "Posgrado", href: "posgrado.html" },
    ],
  },
  {
    label: "Investigación",
    items: [
      { label: "Líneas de investigación", href: "investigacion-lineas.html" },
      { label: "Proyectos", href: "investigacion-proyectos.html" },
      { label: "Publicaciones", href: "investigacion-publicaciones.html" },
    ],
  },
  {
    label: "Servicios",
    items: [
      { label: "Documentos", href: "documentos.html" },
      { label: "Bolsa de trabajo", href: "bolsa-trabajo.html" },
      { label: "Trámites", href: "tramites.html" },
      { label: "Encuestas", href: "encuestas.html" },
      { label: "Convenios", href: "convenios.html" },
    ],
  },
  {
    label: "Vida Estudiantil",
    items: [
      { label: "Grupos estudiantiles", href: "grupos-estudiantiles.html" },
      { label: "Estudiantes destacados", href: "estudiantes-destacados.html" },
    ],
  },
  {
    label: "Comunicación",
    items: [
      { label: "Mensajes recibidos", href: "mensajes.html" },
      { label: "FAQ", href: "faq.html" },
      { label: "Enlaces de interés", href: "enlaces-interes.html" },
    ],
  },
  {
    label: "Configuración",
    items: [
      { label: "Contacto", href: "contacto.html" },
      { label: "Páginas legales", href: "paginas-legales.html" },
      { label: "Configuración institucional", href: "configuracion.html" },
      { label: "Chatbot IA", href: "chatbot.html" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Usuarios y roles", href: "usuarios.html" },
      { label: "Registro de actividad", href: "actividad.html" },
    ],
  },
];

const ICONS = {
  chevron: '<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />',
  close: '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />',
};

function icon(name, extraClass = "h-5 w-5") {
  return `<svg class="${extraClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">${ICONS[name]}</svg>`;
}

function isActive(href) {
  return window.location.pathname.endsWith("/" + href);
}

function renderGroup(group) {
  const hasActive = group.items.some((item) => isActive(item.href));
  return `
    <details class="group/nav" ${hasActive ? "open" : ""}>
      <summary class="flex cursor-pointer list-none items-center justify-between rounded-md px-3 py-2 text-sm font-semibold text-text-muted transition hover:bg-surface-2 hover:text-text [&::-webkit-details-marker]:hidden">
        ${group.label}
        ${icon("chevron", "h-4 w-4 shrink-0 transition-transform duration-200 group-open/nav:rotate-180")}
      </summary>
      <ul class="mt-1 space-y-0.5 pb-1 pl-2">
        ${group.items
          .map((item) => {
            const active = isActive(item.href);
            return `
          <li>
            <a href="${item.href}" class="block rounded-md px-3 py-2 text-sm transition ${
              active ? "bg-primary/10 font-medium text-primary" : "text-text-muted hover:bg-surface-2 hover:text-text"
            }">${item.label}</a>
          </li>`;
          })
          .join("")}
      </ul>
    </details>`;
}

class AdminSidebar extends HTMLElement {
  connectedCallback() {
    const dashboardActive = isActive("dashboard.html");

    this.innerHTML = `
      <div data-backdrop class="fixed inset-0 z-40 hidden bg-gray-900/50 lg:hidden"></div>
      <aside
        data-panel
        class="fixed inset-y-0 left-0 z-50 flex h-screen w-72 -translate-x-full flex-col border-r border-border bg-surface transition-transform duration-200 lg:translate-x-0"
      >
        <div class="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
          <a href="dashboard.html" class="flex items-center gap-2">
            <img src="../../assets/img/facultad/logo_facultad.jpg" alt="" class="h-9 w-9 shrink-0 rounded-lg bg-primary object-contain p-0.5" />
            <span class="flex flex-col leading-tight">
              <span class="font-heading text-sm font-semibold text-text">Panel Admin</span>
              <span class="text-xs text-text-muted">Fac. Administración</span>
            </span>
          </a>
          <button
            type="button"
            data-close-sidebar
            aria-label="Cerrar menú"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-2 hover:text-text lg:hidden"
          >
            ${icon("close")}
          </button>
        </div>

        <nav aria-label="Menú del panel" class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <a
            href="dashboard.html"
            class="block rounded-md px-3 py-2 text-sm font-medium transition ${
              dashboardActive ? "bg-primary/10 text-primary" : "text-text hover:bg-surface-2"
            }"
          >
            Dashboard
          </a>
          <div class="my-2 border-t border-border"></div>
          ${ADMIN_NAV_GROUPS.map(renderGroup).join("")}
        </nav>
      </aside>
    `;

    this.init();
  }

  init() {
    const backdrop = this.querySelector("[data-backdrop]");
    const panel = this.querySelector("[data-panel]");
    const closeBtn = this.querySelector("[data-close-sidebar]");

    const setOpen = (open) => {
      panel.classList.toggle("-translate-x-full", !open);
      backdrop.classList.toggle("hidden", !open);
      document.body.classList.toggle("overflow-hidden", open);
    };

    document.addEventListener("admin:toggle-sidebar", () => {
      setOpen(panel.classList.contains("-translate-x-full"));
    });

    backdrop.addEventListener("click", () => setOpen(false));
    closeBtn.addEventListener("click", () => setOpen(false));

    this.addEventListener("click", (event) => {
      if (event.target.closest("a") && window.innerWidth < 1024) setOpen(false);
    });

    window.matchMedia("(min-width: 1024px)").addEventListener("change", (event) => {
      if (event.matches) setOpen(false);
    });
  }
}

customElements.define("admin-sidebar", AdminSidebar);
})();
