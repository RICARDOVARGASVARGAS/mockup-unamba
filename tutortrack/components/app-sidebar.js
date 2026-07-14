/**
 * app-sidebar.js — navegación lateral compartida de TutorTrack (<app-sidebar>).
 *
 * Un solo menú con las 4 secciones del sistema, todas visibles y
 * navegables en la misma sesión (mockup para demo al cliente — no hay
 * backend real ni sesión que filtre por permisos todavía, ver
 * ../CLAUDE.md § Modelo de datos y alcance):
 *   Administrador → Docente-Tutor → Estudiante → Receptor/Psicología
 *
 * Cada sección es su propio <details> colapsable; dentro, los ítems se
 * agrupan en sub-<details> cuando hay varios relacionados (ej.
 * "Catálogos" dentro de Administrador). Agregar una pantalla nueva es
 * solo sumar un objeto a NAV_SECTIONS, sin tocar el resto del archivo.
 *
 * En móvil/tablet actúa como drawer: <app-topbar> dispara el evento
 * "app:toggle-sidebar" en `document`, que este componente escucha.
 *
 * Todo el archivo va dentro de un IIFE: <app-sidebar> y <app-topbar> se
 * cargan juntas en la misma página, y sin esto sus helpers internos
 * (`ICONS`, `icon()`) chocarían como redeclaraciones globales.
 */
(function () {
  const NAV_SECTIONS = [
    {
      id: "admin",
      label: "Administrador",
      icon: "cog",
      dashboard: { label: "Dashboard", path: "admin/dashboard.html" },
      groups: [
        {
          label: "Catálogos",
          items: [
            { label: "Ciclos", path: "admin/ciclos.html" },
            { label: "Periodos académicos", path: "admin/periodos-academicos.html" },
            { label: "Áreas", path: "admin/areas.html" },
            { label: "Tipos de ficha", path: "admin/tipos-ficha.html" },
            { label: "Tipos de pregunta", path: "admin/tipos-pregunta.html" },
            { label: "Entidades receptoras", path: "admin/entidades-receptoras.html" },
            { label: "Tipos de estado de derivación", path: "admin/tipos-estado-derivacion.html" },
            { label: "Roles y permisos", path: "admin/roles-permisos.html" },
          ],
        },
        {
          label: "Gestión por periodo",
          items: [
            { label: "Docentes", path: "admin/docentes.html" },
            { label: "Estudiantes", path: "admin/estudiantes.html" },
            { label: "Ciclo x Periodo", path: "admin/ciclo-periodo.html" },
            { label: "Matrículas", path: "admin/matriculas.html" },
          ],
        },
        {
          label: "Fichas",
          items: [
            { label: "Plantillas de fichas", path: "admin/fichas.html" },
            { label: "Asignación a ciclos", path: "admin/fichas-asignacion.html" },
          ],
        },
        {
          label: "Alertas y derivación",
          items: [
            { label: "Alertas IA", path: "admin/alertas.html" },
            { label: "Derivaciones", path: "admin/derivaciones.html" },
          ],
        },
      ],
    },
    {
      id: "docente",
      label: "Docente-Tutor",
      icon: "users",
      dashboard: { label: "Dashboard", path: "docente/dashboard.html" },
      groups: [
        {
          label: "Tutoría",
          items: [
            { label: "Mis tutorados", path: "docente/tutorados.html" },
            { label: "Temario", path: "docente/temario.html" },
          ],
        },
        {
          label: "Fichas",
          items: [{ label: "Fichas por revisar", path: "docente/fichas.html" }],
        },
        {
          label: "Alertas",
          items: [
            { label: "Alertas IA", path: "docente/alertas.html" },
            { label: "Derivaciones", path: "docente/derivaciones.html" },
          ],
        },
      ],
    },
    {
      id: "estudiante",
      label: "Estudiante",
      icon: "academic",
      dashboard: { label: "Inicio", path: "estudiante/dashboard.html" },
      groups: [
        {
          label: "Mi tutoría",
          items: [
            { label: "Mis fichas", path: "estudiante/fichas.html" },
            { label: "Mi tutor", path: "estudiante/tutor.html" },
          ],
        },
      ],
    },
    {
      id: "receptor",
      label: "Receptor / Psicología",
      icon: "heart",
      dashboard: { label: "Dashboard", path: "receptor/dashboard.html" },
      groups: [
        {
          label: "Casos",
          items: [
            { label: "Casos derivados", path: "receptor/casos.html" },
            { label: "Historial de seguimiento", path: "receptor/historial.html" },
          ],
        },
      ],
    },
  ];

  const ICONS = {
    chevron: '<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />',
    close: '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />',
    cog: '<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.751.43.992l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.397-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.751-.43-.992l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />',
    users: '<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />',
    academic: '<path d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443" stroke-linecap="round" stroke-linejoin="round" />',
    heart: '<path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />',
    menu: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />',
  };

  function icon(name, extraClass = "h-5 w-5") {
    return `<svg class="${extraClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">${ICONS[name]}</svg>`;
  }

  function href(path) {
    return `${window.getBasePath()}pages/${path}`;
  }

  function isActive(path) {
    return window.location.pathname.endsWith("/" + path);
  }

  function currentSectionId() {
    const match = window.location.pathname.match(/\/pages\/([^/]+)\//);
    return match ? match[1] : null;
  }

  function renderGroup(group) {
    const hasActive = group.items.some((item) => isActive(item.path));
    return `
      <details class="group/nav" ${hasActive ? "open" : ""}>
        <summary class="flex cursor-pointer list-none items-center justify-between rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted transition hover:bg-surface-2 hover:text-text [&::-webkit-details-marker]:hidden">
          ${group.label}
          ${icon("chevron", "h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-open/nav:rotate-180")}
        </summary>
        <ul class="mt-1 space-y-0.5 pb-1 pl-2">
          ${group.items
            .map((item) => {
              const active = isActive(item.path);
              return `
            <li>
              <a href="${href(item.path)}" class="block rounded-md px-3 py-2 text-sm transition ${
                active ? "bg-primary/10 font-medium text-primary" : "text-text-muted hover:bg-surface-2 hover:text-text"
              }">${item.label}</a>
            </li>`;
            })
            .join("")}
        </ul>
      </details>`;
  }

  function renderSection(section, activeSectionId) {
    const isCurrentSection = section.id === activeSectionId;
    const hasActive = isCurrentSection || section.groups.some((g) => g.items.some((i) => isActive(i.path)));

    return `
      <details class="group/section" ${hasActive ? "open" : ""}>
        <summary class="flex cursor-pointer list-none items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-text transition hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
          <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${isCurrentSection ? "bg-primary text-onPrimary" : "bg-surface-2 text-text-muted"}">
            ${icon(section.icon, "h-4 w-4")}
          </span>
          <span class="flex-1">${section.label}</span>
          ${icon("chevron", "h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 group-open/section:rotate-180")}
        </summary>
        <div class="mt-1 space-y-0.5 border-l border-border pb-2 pl-3">
          <a href="${href(section.dashboard.path)}" class="block rounded-md px-3 py-2 text-sm font-medium transition ${
            isActive(section.dashboard.path) ? "bg-primary/10 text-primary" : "text-text hover:bg-surface-2"
          }">${section.dashboard.label}</a>
          ${section.groups.map(renderGroup).join("")}
        </div>
      </details>`;
  }

  class AppSidebar extends HTMLElement {
    connectedCallback() {
      const activeSectionId = currentSectionId();

      this.innerHTML = `
        <div data-backdrop class="fixed inset-0 z-40 hidden bg-gray-900/50 lg:hidden"></div>
        <aside
          data-panel
          class="fixed inset-y-0 left-0 z-50 flex h-screen w-72 -translate-x-full flex-col border-r border-border bg-surface transition-transform duration-200 lg:translate-x-0"
        >
          <div class="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
            <a href="${window.getBasePath()}index.html" class="flex items-center gap-2">
              <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-onPrimary font-heading text-sm font-bold">TT</span>
              <span class="flex flex-col leading-tight">
                <span class="font-heading text-sm font-semibold text-text">TutorTrack</span>
                <span class="text-xs text-text-muted">Módulo de tutoría</span>
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

          <nav aria-label="Menú de TutorTrack" class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            ${NAV_SECTIONS.map((section) => renderSection(section, activeSectionId)).join('<div class="my-2 border-t border-border"></div>')}
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

      document.addEventListener("app:toggle-sidebar", () => {
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

  customElements.define("app-sidebar", AppSidebar);
})();
