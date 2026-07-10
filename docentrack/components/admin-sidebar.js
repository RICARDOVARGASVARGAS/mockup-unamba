/**
 * admin-sidebar.js — navegación lateral del panel administrativo de
 * DocenTrack (<admin-sidebar>).
 *
 * Mismo criterio que kiosko-topbar.js: el menú se define UNA vez aquí.
 * En móvil/tablet actúa como drawer: <admin-topbar> dispara el evento
 * "admin:toggle-sidebar" en `document`, que este componente escucha.
 *
 * Todo el archivo va dentro de un IIFE: <admin-sidebar> y <admin-topbar>
 * se cargan juntas en la misma página, y sin esto sus helpers internos
 * (`ICONS`, `icon()`) chocarían como redeclaraciones globales.
 */
(function () {
  const ADMIN_NAV_GROUPS = [
    {
      label: "Gestión académica",
      items: [
        { label: "Docentes", href: "docentes.html" },
        { label: "Cursos", href: "cursos.html" },
        { label: "Ciclos", href: "ciclos.html" },
        { label: "Periodos académicos", href: "periodos-academicos.html" },
        { label: "Aulas", href: "aulas.html" },
        { label: "Horarios", href: "horarios.html" },
      ],
    },
    {
      label: "Asistencia",
      items: [
        { label: "Registros de asistencia", href: "registros.html" },
        { label: "Reportes", href: "reportes.html" },
        { label: "Auditoría", href: "auditoria.html" },
      ],
    },
    {
      label: "Sistema",
      items: [{ label: "Configuración", href: "configuracion.html" }],
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
              <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-onPrimary font-heading text-sm font-bold">DT</span>
              <span class="flex flex-col leading-tight">
                <span class="font-heading text-sm font-semibold text-text">Panel Admin</span>
                <span class="text-xs text-text-muted">DocenTrack</span>
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
            <div class="my-2 border-t border-border"></div>
            <a href="../../index.html" class="block rounded-md px-3 py-2 text-sm text-text-muted transition hover:bg-surface-2 hover:text-text">
              ← Volver al kiosko
            </a>
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
