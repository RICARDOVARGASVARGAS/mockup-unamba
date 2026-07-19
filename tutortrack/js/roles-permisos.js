/**
 * roles-permisos.js — RBAC: pestañas Roles y Permisos.
 * Permisos nunca se asignan directo a Usuario — siempre vía Rol.
 * Roles marcados como `protegido: true` no se pueden editar ni borrar.
 */
(function () {
  const PERMISOS_SEED = [
    { id: "perm-1",  nombre: "gestionar_usuarios",   descripcion: "Crear, editar y dar de baja usuarios del sistema", modulo: "usuarios" },
    { id: "perm-2",  nombre: "gestionar_roles",       descripcion: "Crear, editar y eliminar roles y permisos", modulo: "usuarios" },
    { id: "perm-3",  nombre: "gestionar_catalogos",   descripcion: "Editar catálogos del sistema (ciclos, áreas, tipos…)", modulo: "catalogos" },
    { id: "perm-4",  nombre: "gestionar_periodo",     descripcion: "Configurar ciclo×período y asignar docentes", modulo: "catalogos" },
    { id: "perm-5",  nombre: "ver_tutorados",         descripcion: "Ver la lista de tutorados asignados al docente", modulo: "tutoria" },
    { id: "perm-6",  nombre: "editar_temario",        descripcion: "Agregar, editar y reordenar temas del temario", modulo: "tutoria" },
    { id: "perm-7",  nombre: "llenar_ficha",          descripcion: "Completar y enviar una ficha de tutoría", modulo: "fichas" },
    { id: "perm-8",  nombre: "revisar_fichas",        descripcion: "Ver y anotar observaciones en fichas de tutorados", modulo: "fichas" },
    { id: "perm-9",  nombre: "asignar_fichas",        descripcion: "Asociar plantillas de ficha a un ciclo×período", modulo: "fichas" },
    { id: "perm-10", nombre: "ver_alertas",           descripcion: "Ver alertas generadas por IA", modulo: "alertas" },
    { id: "perm-11", nombre: "derivar_caso",          descripcion: "Crear una derivación desde una alerta", modulo: "alertas" },
    { id: "perm-12", nombre: "registrar_seguimiento", descripcion: "Agregar estados de seguimiento a una derivación", modulo: "alertas" },
    { id: "perm-13", nombre: "cerrar_derivacion",     descripcion: "Marcar una derivación como cerrada", modulo: "alertas" },
  ];

  const ROLES_SEED = [
    {
      id: "rol-1",
      nombre: "Administrador",
      clave: "administrador",
      ambito: "interno",
      protegido: true,
      permisoIds: ["perm-1", "perm-2", "perm-3", "perm-4", "perm-9", "perm-10"],
    },
    {
      id: "rol-2",
      nombre: "Docente-Tutor",
      clave: "docente_tutor",
      ambito: "interno",
      protegido: true,
      permisoIds: ["perm-5", "perm-6", "perm-8", "perm-10", "perm-11"],
    },
    {
      id: "rol-3",
      nombre: "Estudiante",
      clave: "estudiante",
      ambito: "interno",
      protegido: true,
      permisoIds: ["perm-7"],
    },
    {
      id: "rol-4",
      nombre: "Coordinador de tutoría",
      clave: "coordinador_tutoria",
      ambito: "interno",
      protegido: false,
      permisoIds: ["perm-1", "perm-3", "perm-4", "perm-5", "perm-9", "perm-10"],
    },
    {
      id: "rol-5",
      nombre: "Psicólogo",
      clave: "psicologo",
      ambito: "receptor",
      protegido: false,
      permisoIds: ["perm-10", "perm-12", "perm-13"],
    },
    {
      id: "rol-6",
      nombre: "Servicios médicos",
      clave: "servicios_medicos",
      ambito: "receptor",
      protegido: false,
      permisoIds: ["perm-10", "perm-12", "perm-13"],
    },
    {
      id: "rol-7",
      nombre: "Trabajo social",
      clave: "trabajo_social",
      ambito: "receptor",
      protegido: false,
      permisoIds: ["perm-10", "perm-12"],
    },
  ];

  const AMBITO = { interno: "Interno", receptor: "Entidad receptora" };
  const MODULO = {
    usuarios:  "Usuarios y accesos",
    catalogos: "Catálogos",
    tutoria:   "Tutoría",
    fichas:    "Fichas",
    alertas:   "Alertas / derivación",
  };

  const toast = (m, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message: m, type } }));

  document.addEventListener("DOMContentLoaded", () => {
    let permisosData = [...PERMISOS_SEED];
    let activeTab = "roles";

    const panelRoles    = document.querySelector('[data-panel="roles"]');
    const panelPermisos = document.querySelector('[data-panel="permisos"]');
    const createLabel   = document.querySelector("[data-create-label]");
    const openCreate    = document.querySelector("[data-open-create]");

    const rolBackdrop  = document.querySelector("[data-rol-backdrop]");
    const rolForm      = document.querySelector("[data-rol-form]");
    const rolTitle     = document.querySelector("[data-rol-title]");
    const rolEditingId = document.querySelector("[data-rol-editing-id]");
    const rolNombre    = document.getElementById("rol-nombre");
    const rolClave     = document.getElementById("rol-clave");
    const rolAmbito    = document.getElementById("rol-ambito");
    const checklist    = document.querySelector("[data-permisos-checklist]");

    const permisoBackdrop  = document.querySelector("[data-permiso-backdrop]");
    const permisoForm      = document.querySelector("[data-permiso-form]");
    const permisoTitle     = document.querySelector("[data-permiso-title]");
    const permisoEditingId = document.querySelector("[data-permiso-editing-id]");
    const permisoNombre    = document.getElementById("permiso-nombre");
    const permisoDesc      = document.getElementById("permiso-desc");
    const permisoModulo    = document.getElementById("permiso-modulo");

    /* Checklist de permisos agrupado por módulo */
    function rebuildChecklist(selectedIds) {
      const selected = new Set(selectedIds || []);
      const byModulo = {};
      permisosData.forEach((p) => {
        (byModulo[p.modulo] = byModulo[p.modulo] || []).push(p);
      });
      const order = ["usuarios", "catalogos", "tutoria", "fichas", "alertas"];
      checklist.innerHTML = order
        .filter((m) => byModulo[m])
        .map(
          (m) => `
          <div>
            <p class="text-[0.65rem] font-semibold uppercase tracking-widest text-text-muted mb-1.5">${CatalogTable.escapeHtml(MODULO[m] || m)}</p>
            <div class="space-y-1.5">
              ${byModulo[m]
                .map(
                  (p) => `
              <label class="flex items-start gap-2 text-sm text-text">
                <input type="checkbox" value="${p.id}" ${selected.has(p.id) ? "checked" : ""} class="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary" />
                <span>
                  <span class="font-mono text-xs">${CatalogTable.escapeHtml(p.nombre)}</span>
                  ${p.descripcion ? `<span class="block text-xs text-text-muted">${CatalogTable.escapeHtml(p.descripcion)}</span>` : ""}
                </span>
              </label>`
                )
                .join("")}
            </div>
          </div>`
        )
        .join("");
    }

    function openRolModal(row) {
      if (row) {
        rolTitle.textContent = "Editar rol";
        rolEditingId.value  = row.id;
        rolNombre.value     = row.nombre;
        rolClave.value      = row.clave || "";
        rolAmbito.value     = row.ambito;
        rebuildChecklist(row.permisoIds);
      } else {
        rolTitle.textContent = "Nuevo rol";
        rolEditingId.value  = "";
        rolNombre.value     = "";
        rolClave.value      = "";
        rolForm.reset();
        rebuildChecklist([]);
      }
      rolBackdrop.classList.remove("hidden");
      rolBackdrop.classList.add("flex");
      rolNombre.focus();
    }

    function closeRolModal() {
      rolBackdrop.classList.add("hidden");
      rolBackdrop.classList.remove("flex");
    }

    function openPermisoModal(row) {
      if (row) {
        permisoTitle.textContent   = "Editar permiso";
        permisoEditingId.value     = row.id;
        permisoNombre.value        = row.nombre;
        permisoDesc.value          = row.descripcion || "";
        permisoModulo.value        = row.modulo;
      } else {
        permisoTitle.textContent = "Nuevo permiso";
        permisoEditingId.value   = "";
        permisoForm.reset();
      }
      permisoBackdrop.classList.remove("hidden");
      permisoBackdrop.classList.add("flex");
      permisoNombre.focus();
    }

    function closePermisoModal() {
      permisoBackdrop.classList.add("hidden");
      permisoBackdrop.classList.remove("flex");
    }

    /* Badge de protegido en la columna nombre */
    function nombreRolHtml(r, esc) {
      const nombre = esc(r.nombre);
      const clave  = r.clave ? `<code class="ml-1.5 rounded bg-bg px-1 py-0.5 text-[0.7rem] text-text-muted">${esc(r.clave)}</code>` : "";
      const lock   = r.protegido
        ? `<span class="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-warning/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-warning">
             <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
               <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
             </svg>
             Protegido
           </span>`
        : "";
      return `<span class="font-medium text-text">${nombre}</span>${clave}${lock}`;
    }

    const rolesTable = CatalogTable.mount(panelRoles, {
      data: ROLES_SEED,
      pageSize: 6,
      searchKeys: ["nombre", "clave"],
      filters: [{ id: "ambito", getValue: (r) => r.ambito }],
      sort: (a, b) => a.nombre.localeCompare(b.nombre, "es"),
      columns: [
        {
          key: "nombre",
          label: "Rol",
          primary: true,
          render: nombreRolHtml,
        },
        {
          key: "ambito",
          label: "Ámbito",
          muted: true,
          render: (r, esc) => esc(AMBITO[r.ambito] || r.ambito),
        },
        {
          key: "permisoIds",
          label: "Permisos",
          render: (r) => `<span class="badge badge-neutral">${(r.permisoIds || []).length}</span>`,
        },
      ],
      onEdit: (row) => {
        if (row.protegido) {
          toast("Los roles protegidos no se pueden modificar", "warning");
          return;
        }
        openRolModal(row);
      },
      onDelete: (id) => {
        const row = rolesTable.getAll().find((r) => r.id === id);
        if (row && row.protegido) {
          toast("Los roles protegidos no se pueden eliminar", "warning");
          return;
        }
      },
    });

    const permisosTable = CatalogTable.mount(panelPermisos, {
      data: PERMISOS_SEED,
      pageSize: 6,
      searchKeys: ["nombre", "descripcion"],
      filters: [{ id: "modulo", getValue: (r) => r.modulo }],
      sort: (a, b) => {
        const mo = Object.keys(MODULO);
        const ai = mo.indexOf(a.modulo);
        const bi = mo.indexOf(b.modulo);
        if (ai !== bi) return ai - bi;
        return a.nombre.localeCompare(b.nombre, "es");
      },
      columns: [
        {
          key: "nombre",
          label: "Clave",
          primary: true,
          render: (r, esc) => `<code class="font-mono text-sm text-text">${esc(r.nombre)}</code>`,
        },
        {
          key: "descripcion",
          label: "Descripción",
          muted: true,
          render: (r, esc) => r.descripcion
            ? `<span class="text-text">${esc(r.descripcion)}</span>`
            : `<span class="text-text-muted">—</span>`,
        },
        {
          key: "modulo",
          label: "Módulo",
          muted: true,
          render: (r, esc) => esc(MODULO[r.modulo] || r.modulo),
        },
      ],
      onEdit: openPermisoModal,
      onDelete: (id) => {
        permisosData = permisosData.filter((p) => p.id !== id);
        rolesTable.getAll().forEach((rol) => {
          if ((rol.permisoIds || []).includes(id)) {
            rolesTable.update(rol.id, {
              permisoIds: rol.permisoIds.filter((pid) => pid !== id),
            });
          }
        });
      },
    });

    document.querySelectorAll("[data-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        activeTab = tab.dataset.tab;
        document.querySelectorAll("[data-tab]").forEach((t) => {
          t.setAttribute("aria-selected", String(t.dataset.tab === activeTab));
        });
        panelRoles.classList.toggle("hidden", activeTab !== "roles");
        panelPermisos.classList.toggle("hidden", activeTab !== "permisos");
        createLabel.textContent = activeTab === "roles" ? "Nuevo rol" : "Nuevo permiso";
      });
    });

    openCreate.addEventListener("click", () => {
      if (activeTab === "roles") openRolModal(null);
      else openPermisoModal(null);
    });

    document.querySelector("[data-rol-cancel]").addEventListener("click", closeRolModal);
    rolBackdrop.addEventListener("click", (e) => e.target === rolBackdrop && closeRolModal());
    document.querySelector("[data-permiso-cancel]").addEventListener("click", closePermisoModal);
    permisoBackdrop.addEventListener("click", (e) => e.target === permisoBackdrop && closePermisoModal());

    rolForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = rolNombre.value.trim();
      const clave  = rolClave.value.trim();
      if (!nombre || !clave) { toast("El nombre y la clave son obligatorios", "warning"); return; }
      const permisoIds = [...checklist.querySelectorAll("input:checked")].map((i) => i.value);
      const patch = { nombre, clave, ambito: rolAmbito.value, permisoIds };
      if (rolEditingId.value) {
        rolesTable.update(rolEditingId.value, patch);
        toast("Rol actualizado");
      } else {
        rolesTable.add({ id: `rol-${Date.now()}`, protegido: false, ...patch });
        toast("Rol creado");
      }
      closeRolModal();
    });

    permisoForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = permisoNombre.value.trim();
      if (!nombre) { toast("Ingresa la clave del permiso", "warning"); return; }
      const patch = { nombre, descripcion: permisoDesc.value.trim(), modulo: permisoModulo.value };
      if (permisoEditingId.value) {
        permisosTable.update(permisoEditingId.value, patch);
        permisosData = permisosTable.getAll();
        toast("Permiso actualizado");
      } else {
        const item = { id: `perm-${Date.now()}`, ...patch };
        permisosTable.add(item);
        permisosData = permisosTable.getAll();
        toast("Permiso creado");
      }
      closePermisoModal();
    });
  });
})();
