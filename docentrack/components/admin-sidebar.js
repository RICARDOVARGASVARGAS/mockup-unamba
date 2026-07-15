/**
 * admin-sidebar.js — navegación lateral del panel administrativo de
 * DocenTrack (<admin-sidebar>).
 *
 * Panel de marca: azul navy + contorno/acentos naranja (identidad
 * institucional). Ver tokens --sidebar-* y clases .admin-sidebar-* en
 * css/base.css.
 *
 * En móvil/tablet actúa como drawer: <admin-topbar> dispara
 * "admin:toggle-sidebar" en `document`.
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
        <summary class="admin-sidebar-group-label flex cursor-pointer list-none items-center justify-between rounded-md px-3 py-2 text-sm font-semibold transition [&::-webkit-details-marker]:hidden">
          ${group.label}
          ${icon("chevron", "h-4 w-4 shrink-0 transition-transform duration-200 group-open/nav:rotate-180")}
        </summary>
        <ul class="mt-1 space-y-0.5 pb-1 pl-1">
          ${group.items
            .map((item) => {
              const active = isActive(item.href);
              return `
            <li>
              <a href="${item.href}" class="admin-sidebar-link ${active ? "is-active" : ""}"${active ? ' aria-current="page"' : ""}>${item.label}</a>
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
        <div data-backdrop class="fixed inset-0 z-[40] hidden bg-primary/70 lg:hidden" aria-hidden="true"></div>
        <aside
          data-panel
          class="admin-sidebar-panel fixed inset-y-0 left-0 z-[50] flex h-screen w-72 -translate-x-full flex-col transition-transform duration-200 ease-out lg:translate-x-0"
          aria-label="Navegación del panel"
        >
          <div class="brand-stripe shrink-0" aria-hidden="true"></div>
          <div class="admin-sidebar-brand flex h-16 shrink-0 items-center justify-between gap-2 px-4">
            <a href="dashboard.html" class="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              <img
                src="../../assets/img/facultad/logo_universidad.jpg"
                alt="UNAMBA"
                class="h-9 w-9 shrink-0 rounded-full bg-onPrimary object-contain p-0.5 ring-2 ring-accent"
              />
              <img
                src="../../assets/img/facultad/logo_facultad.jpg"
                alt=""
                class="h-8 w-8 shrink-0 rounded-md bg-onPrimary object-contain p-0.5"
              />
              <span class="flex min-w-0 flex-col leading-tight">
                <span class="font-heading text-sm font-semibold text-sidebar-text">DocenTrack</span>
                <span class="text-xs text-sidebar-muted">Panel Admin</span>
              </span>
            </a>
            <button
              type="button"
              data-close-sidebar
              aria-label="Cerrar menú"
              class="inline-flex h-9 w-9 items-center justify-center rounded-md text-sidebar-muted transition hover:bg-sidebar-hover hover:text-sidebar-text lg:hidden"
            >
              ${icon("close")}
            </button>
          </div>

          <nav aria-label="Menú del panel" class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            <a
              href="dashboard.html"
              class="admin-sidebar-link ${dashboardActive ? "is-active" : ""}"
              ${dashboardActive ? 'aria-current="page"' : ""}
            >
              Dashboard
            </a>
            <div class="admin-sidebar-divider my-3 border-t" role="separator"></div>
            ${ADMIN_NAV_GROUPS.map(renderGroup).join("")}
            <div class="admin-sidebar-divider my-3 border-t" role="separator"></div>
            <a href="../../index.html" class="admin-sidebar-link">
              ← Volver al kiosko
            </a>
          </nav>

          <div class="shrink-0 border-t border-accent/25 px-4 py-3">
            <p class="text-[11px] leading-snug text-sidebar-muted">
              Facultad de Administración · UNAMBA
            </p>
          </div>
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
