/**
 * roles-permisos.js — RBAC: pestañas Roles y Permisos.
 * Permisos nunca se asignan directo a Usuario — siempre vía Rol.
 */
(function () {
  const PERMISOS_SEED = [
    { id: "perm-1", nombre: "gestionar_catalogos", modulo: "catalogos" },
    { id: "perm-2", nombre: "gestionar_usuarios", modulo: "catalogos" },
    { id: "perm-3", nombre: "ver_tutorados", modulo: "tutoria" },
    { id: "perm-4", nombre: "editar_temario", modulo: "tutoria" },
    { id: "perm-5", nombre: "llenar_ficha", modulo: "fichas" },
    { id: "perm-6", nombre: "revisar_fichas", modulo: "fichas" },
    { id: "perm-7", nombre: "asignar_fichas", modulo: "fichas" },
    { id: "perm-8", nombre: "ver_alertas", modulo: "alertas" },
    { id: "perm-9", nombre: "derivar_caso", modulo: "alertas" },
    { id: "perm-10", nombre: "registrar_seguimiento", modulo: "alertas" },
    { id: "perm-11", nombre: "cerrar_derivacion", modulo: "alertas" },
  ];

  const ROLES_SEED = [
    { id: "rol-1", nombre: "Administrador", ambito: "interno", permisoIds: ["perm-1", "perm-2", "perm-7", "perm-8"] },
    { id: "rol-2", nombre: "Docente-Tutor", ambito: "interno", permisoIds: ["perm-3", "perm-4", "perm-6", "perm-8", "perm-9"] },
    { id: "rol-3", nombre: "Estudiante", ambito: "interno", permisoIds: ["perm-5"] },
    { id: "rol-4", nombre: "Coordinador de tutoría", ambito: "interno", permisoIds: ["perm-1", "perm-2", "perm-3", "perm-7", "perm-8"] },
    { id: "rol-5", nombre: "Psicólogo", ambito: "receptor", permisoIds: ["perm-8", "perm-10", "perm-11"] },
    { id: "rol-6", nombre: "Servicios médicos", ambito: "receptor", permisoIds: ["perm-8", "perm-10", "perm-11"] },
    { id: "rol-7", nombre: "Trabajo social", ambito: "receptor", permisoIds: ["perm-8", "perm-10"] },
  ];

  const AMBITO = { interno: "Interno", receptor: "Entidad receptora" };
  const MODULO = {
    catalogos: "Catálogos",
    tutoria: "Tutoría",
    fichas: "Fichas",
    alertas: "Alertas / derivación",
  };

  const toast = (m) => document.dispatchEvent(new CustomEvent("app:toast", { detail: { message: m } }));

  document.addEventListener("DOMContentLoaded", () => {
    let permisosData = [...PERMISOS_SEED];
    let activeTab = "roles";

    const panelRoles = document.querySelector('[data-panel="roles"]');
    const panelPermisos = document.querySelector('[data-panel="permisos"]');
    const createLabel = document.querySelector("[data-create-label]");
    const openCreate = document.querySelector("[data-open-create]");

    const rolBackdrop = document.querySelector("[data-rol-backdrop]");
    const rolForm = document.querySelector("[data-rol-form]");
    const rolTitle = document.querySelector("[data-rol-title]");
    const rolEditingId = document.querySelector("[data-rol-editing-id]");
    const rolNombre = document.getElementById("rol-nombre");
    const rolAmbito = document.getElementById("rol-ambito");
    const checklist = document.querySelector("[data-permisos-checklist]");

    const permisoBackdrop = document.querySelector("[data-permiso-backdrop]");
    const permisoForm = document.querySelector("[data-permiso-form]");
    const permisoTitle = document.querySelector("[data-permiso-title]");
    const permisoEditingId = document.querySelector("[data-permiso-editing-id]");
    const permisoNombre = document.getElementById("permiso-nombre");
    const permisoModulo = document.getElementById("permiso-modulo");

    function rebuildChecklist(selectedIds) {
      const selected = new Set(selectedIds || []);
      checklist.innerHTML = permisosData
        .map(
          (p) => `
        <label class="flex items-center gap-2 text-sm text-text">
          <input type="checkbox" value="${p.id}" ${selected.has(p.id) ? "checked" : ""} class="h-4 w-4 rounded border-border text-primary" />
          <span>${CatalogTable.escapeHtml(p.nombre)}</span>
          <span class="text-xs text-text-muted">(${CatalogTable.escapeHtml(MODULO[p.modulo] || p.modulo)})</span>
        </label>`
        )
        .join("");
    }

    function openRolModal(row) {
      if (row) {
        rolTitle.textContent = "Editar rol";
        rolEditingId.value = row.id;
        rolNombre.value = row.nombre;
        rolAmbito.value = row.ambito;
        rebuildChecklist(row.permisoIds);
      } else {
        rolTitle.textContent = "Nuevo rol";
        rolEditingId.value = "";
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
        permisoTitle.textContent = "Editar permiso";
        permisoEditingId.value = row.id;
        permisoNombre.value = row.nombre;
        permisoModulo.value = row.modulo;
      } else {
        permisoTitle.textContent = "Nuevo permiso";
        permisoEditingId.value = "";
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

    const rolesTable = CatalogTable.mount(panelRoles, {
      data: ROLES_SEED,
      pageSize: 5,
      searchKeys: ["nombre"],
      filters: [{ id: "ambito", getValue: (r) => r.ambito }],
      sort: (a, b) => a.nombre.localeCompare(b.nombre, "es"),
      columns: [
        { key: "nombre", label: "Rol", primary: true },
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
      onEdit: openRolModal,
    });

    const permisosTable = CatalogTable.mount(panelPermisos, {
      data: PERMISOS_SEED,
      pageSize: 5,
      searchKeys: ["nombre"],
      filters: [{ id: "modulo", getValue: (r) => r.modulo }],
      sort: (a, b) => a.nombre.localeCompare(b.nombre, "es"),
      columns: [
        { key: "nombre", label: "Permiso", primary: true },
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
      if (!nombre) return;
      const permisoIds = [...checklist.querySelectorAll("input:checked")].map((i) => i.value);
      const patch = { nombre, ambito: rolAmbito.value, permisoIds };
      if (rolEditingId.value) {
        rolesTable.update(rolEditingId.value, patch);
        toast("Rol actualizado");
      } else {
        rolesTable.add({ id: `rol-${Date.now()}`, ...patch });
        toast("Rol creado");
      }
      closeRolModal();
    });

    permisoForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = permisoNombre.value.trim();
      if (!nombre) return;
      const patch = { nombre, modulo: permisoModulo.value };
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
