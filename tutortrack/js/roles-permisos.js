/**
 * roles-permisos.js — maestro-detalle RBAC (DISEÑO-FRONTEND.md).
 * Izquierda: roles · Derecha: permisos por módulo del rol seleccionado.
 */
(function () {
  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  let selectedId = null;
  /** Snapshot de permisoIds al cargar el rol (para dirty-check). */
  let baselinePermisos = [];
  let dirty = false;

  function syncMeta() {
    const meta = RolesPermisosData.resumenMeta();
    const el = document.querySelector("[data-rbac-meta]");
    if (el) {
      el.textContent = `${meta.roles} roles · ${meta.activos} activos · ${meta.permisos} permisos`;
    }
  }

  function syncActivoToggle(activo) {
    const toggle = document.getElementById("rol-activo-toggle");
    const checkbox = document.getElementById("rol-activo");
    if (!toggle || !checkbox) return;
    checkbox.checked = !!activo;
    toggle.setAttribute("aria-checked", activo ? "true" : "false");
  }

  function openRolModal(row) {
    const backdrop = document.querySelector("[data-rol-backdrop]");
    const title = document.querySelector("[data-rol-title]");
    const editingId = document.querySelector("[data-rol-editing-id]");
    const clave = document.getElementById("rol-clave");
    const nombre = document.getElementById("rol-nombre");
    const desc = document.getElementById("rol-desc");
    const hint = document.querySelector("[data-rol-clave-hint]");

    if (row) {
      title.textContent = "Editar rol";
      editingId.value = row.id;
      clave.value = row.clave || "";
      clave.readOnly = true;
      clave.classList.add("opacity-80");
      if (hint) hint.textContent = "La clave no se puede cambiar después de crear el rol.";
      nombre.value = row.nombre || "";
      desc.value = row.descripcion || "";
      syncActivoToggle(row.activo !== false);
    } else {
      title.textContent = "Nuevo rol";
      editingId.value = "";
      clave.value = "";
      clave.readOnly = false;
      clave.classList.remove("opacity-80");
      if (hint) hint.textContent = "Identificador estable (snake_case). Solo editable al crear.";
      nombre.value = "";
      desc.value = "";
      syncActivoToggle(true);
    }

    backdrop.classList.remove("hidden");
    backdrop.classList.add("flex");
    (row ? nombre : clave).focus();
  }

  function closeRolModal() {
    const backdrop = document.querySelector("[data-rol-backdrop]");
    backdrop.classList.add("hidden");
    backdrop.classList.remove("flex");
  }

  function askDeleteOrDeactivate(row) {
    if (row.protegido) {
      toast("Los roles protegidos no se pueden eliminar", "warning");
      return Promise.resolve(false);
    }
    const n = RolesPermisosData.conteoUsuarios(row.id);

    if (n === 0) {
      return AppConfirm.request({
        title: "Eliminar rol",
        confirmLabel: "Eliminar",
        cancelLabel: "Cancelar",
        variant: "danger",
        messageHtml: `
          <p>¿Eliminar el rol <strong class="text-text">${esc(row.nombre)}</strong>?</p>
          <p>No está asignado a ningún usuario.</p>`,
      }).then((ok) => {
        if (!ok) return false;
        RolesPermisosData.removeRol(row.id);
        toast("Rol eliminado");
        if (selectedId === row.id) selectedId = null;
        renderAll();
        return true;
      });
    }

    return AppConfirm.request({
      title: "No se puede eliminar",
      confirmLabel: "Desactivar rol",
      cancelLabel: "Cancelar",
      variant: "primary",
      messageHtml: `
        <p>Este rol está asignado a <strong class="text-text">${n}</strong> usuario${n === 1 ? "" : "s"};
        desactívalo en lugar de eliminarlo.</p>
        <p class="pt-1">Los usuarios conservan el vínculo, pero el rol inactivo no debería usarse en altas nuevas.</p>`,
    }).then((ok) => {
      if (!ok) return false;
      RolesPermisosData.setActivo(row.id, false);
      toast("Rol desactivado");
      renderAll();
      return true;
    });
  }

  function renderRolesList() {
    const list = document.querySelector("[data-rbac-roles-list]");
    const mobileSelect = document.querySelector("[data-rbac-rol-select]");
    if (!list) return;

    const roles = RolesPermisosData.roles().sort((a, b) => {
      if (a.protegido !== b.protegido) return a.protegido ? -1 : 1;
      return a.nombre.localeCompare(b.nombre, "es");
    });

    if (!selectedId && roles.length) {
      selectedId = roles.find((r) => r.activo !== false)?.id || roles[0].id;
    }
    if (selectedId && !roles.some((r) => r.id === selectedId)) {
      selectedId = roles[0]?.id || null;
    }

    list.innerHTML = roles
      .map((rol) => {
        const selected = rol.id === selectedId;
        const inactive = rol.activo === false;
        const n = RolesPermisosData.conteoUsuarios(rol.id);
        const lock = rol.protegido
          ? `<span class="rbac-lock" title="Rol protegido" aria-label="Protegido">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </span>`
          : "";
        const badge = inactive
          ? `<span class="badge badge-neutral ml-1">Inactivo</span>`
          : "";
        const actions =
          selected && !rol.protegido
            ? `<div class="rbac-rol-actions">
                <button type="button" class="rbac-icon-btn" data-rol-edit="${esc(rol.id)}" title="Editar" aria-label="Editar rol">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                  </svg>
                </button>
                <button type="button" class="rbac-icon-btn rbac-icon-danger" data-rol-delete="${esc(rol.id)}" title="Eliminar" aria-label="Eliminar rol">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>`
            : "";

        return `
          <li>
            <button
              type="button"
              role="option"
              aria-selected="${selected ? "true" : "false"}"
              class="rbac-rol-item${selected ? " is-selected" : ""}${inactive ? " is-inactive" : ""}"
              data-rol-select="${esc(rol.id)}"
            >
              <div class="rbac-rol-main">
                <div class="rbac-rol-title">
                  <span class="rbac-rol-nombre">${esc(rol.nombre)}</span>
                  ${lock}
                  ${badge}
                </div>
                <div class="rbac-rol-meta">
                  <code class="rbac-clave">${esc(rol.clave)}</code>
                  <span aria-hidden="true">·</span>
                  <a
                    href="usuarios.html?rol=${encodeURIComponent(rol.id)}"
                    class="rbac-users-link"
                    data-rol-users
                    title="Ver usuarios con este rol"
                  >${n} usuario${n === 1 ? "" : "s"}</a>
                </div>
              </div>
              ${actions}
            </button>
          </li>`;
      })
      .join("");

    if (mobileSelect) {
      mobileSelect.innerHTML = roles
        .map(
          (r) =>
            `<option value="${esc(r.id)}" ${r.id === selectedId ? "selected" : ""}>${esc(r.nombre)}${
              r.activo === false ? " (inactivo)" : ""
            }</option>`
        )
        .join("");
    }

    list.querySelectorAll("[data-rol-select]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (e.target.closest("[data-rol-users]")) return;
        if (e.target.closest("[data-rol-edit]") || e.target.closest("[data-rol-delete]")) return;
        selectRol(btn.getAttribute("data-rol-select"));
      });
    });

    list.querySelectorAll("[data-rol-edit]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const rol = RolesPermisosData.findRol(btn.getAttribute("data-rol-edit"));
        if (rol) openRolModal(rol);
      });
    });

    list.querySelectorAll("[data-rol-delete]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const rol = RolesPermisosData.findRol(btn.getAttribute("data-rol-delete"));
        if (rol) askDeleteOrDeactivate(rol);
      });
    });

    list.querySelectorAll("[data-rol-users]").forEach((a) => {
      a.addEventListener("click", (e) => e.stopPropagation());
    });
  }

  function currentCheckedIds() {
    return [...document.querySelectorAll("[data-rbac-modulos] input[data-perm]:checked")].map(
      (el) => el.value
    );
  }

  function updateAsignadosCount() {
    const total = RolesPermisosData.permisos().length;
    const n = currentCheckedIds().length;
    const a = document.querySelector("[data-rbac-asignados]");
    const t = document.querySelector("[data-rbac-total]");
    if (a) a.textContent = String(n);
    if (t) t.textContent = String(total);
  }

  function markDirty() {
    const next = currentCheckedIds().sort().join(",");
    const base = [...baselinePermisos].sort().join(",");
    dirty = next !== base;
    const btn = document.querySelector("[data-rbac-guardar]");
    if (btn) btn.disabled = !dirty;
  }

  function renderPermisosPanel() {
    const empty = document.querySelector("[data-rbac-perms-empty]");
    const panel = document.querySelector("[data-rbac-perms-panel]");
    const modulosEl = document.querySelector("[data-rbac-modulos]");
    const aviso = document.querySelector("[data-rbac-protegido-aviso]");
    const guardar = document.querySelector("[data-rbac-guardar]");

    const rol = selectedId ? RolesPermisosData.findRol(selectedId) : null;
    if (!rol) {
      empty?.classList.remove("hidden");
      panel?.classList.add("hidden");
      return;
    }

    empty?.classList.add("hidden");
    panel?.classList.remove("hidden");

    document.querySelector("[data-rbac-rol-nombre]").textContent = rol.nombre;

    const toolbar = document.querySelector("[data-rbac-rol-toolbar]");
    if (toolbar) {
      if (rol.protegido) {
        toolbar.classList.add("hidden");
        toolbar.innerHTML = "";
      } else {
        toolbar.classList.remove("hidden");
        toolbar.classList.add("flex");
        toolbar.innerHTML = `
          <button type="button" class="btn-secondary btn-sm" data-toolbar-edit title="Editar rol">
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
            </svg>
            Editar
          </button>
          <button type="button" class="btn-secondary btn-sm text-danger" data-toolbar-delete title="Eliminar rol">
            Eliminar
          </button>`;
        toolbar.querySelector("[data-toolbar-edit]")?.addEventListener("click", () => openRolModal(rol));
        toolbar.querySelector("[data-toolbar-delete]")?.addEventListener("click", () => askDeleteOrDeactivate(rol));
      }
    }

    baselinePermisos = [...(rol.permisoIds || [])];
    dirty = false;
    if (guardar) {
      guardar.disabled = true;
      guardar.classList.toggle("hidden", rol.protegido);
    }
    aviso?.classList.toggle("hidden", !rol.protegido);

    const selected = new Set(rol.permisoIds || []);
    const byModulo = RolesPermisosData.permisosPorModulo();
    const readonly = rol.protegido;

    modulosEl.innerHTML = RolesPermisosData.MODULOS.filter(
      (m) => (byModulo[m] || []).length
    )
      .map((modulo, idx) => {
        const perms = byModulo[modulo] || [];
        const allOn = perms.every((p) => selected.has(p.id));
        const open = idx < 2; // primeros módulos abiertos
        return `
          <details class="rbac-modulo" ${open ? "open" : ""} data-modulo="${esc(modulo)}">
            <summary class="rbac-modulo-summary">
              <span class="rbac-modulo-name">${esc(modulo)}</span>
              <label class="rbac-modulo-todos">
                <input
                  type="checkbox"
                  data-modulo-todos="${esc(modulo)}"
                  ${allOn ? "checked" : ""}
                  ${readonly ? "disabled" : ""}
                  aria-label="Todos los permisos de ${esc(modulo)}"
                />
                <span>Todos</span>
              </label>
            </summary>
            <div class="rbac-modulo-body">
              ${perms
                .map(
                  (p) => `
                <label class="rbac-perm" title="${esc(p.clave)}">
                  <input
                    type="checkbox"
                    data-perm
                    value="${esc(p.id)}"
                    data-modulo-ref="${esc(modulo)}"
                    ${selected.has(p.id) ? "checked" : ""}
                    ${readonly ? "disabled" : ""}
                  />
                  <span class="rbac-perm-nombre">${esc(p.nombre)}</span>
                </label>`
                )
                .join("")}
            </div>
          </details>`;
      })
      .join("");

    updateAsignadosCount();

    if (!readonly) {
      modulosEl.querySelectorAll(".rbac-modulo-todos").forEach((lab) => {
        lab.addEventListener("click", (e) => e.stopPropagation());
      });
      modulosEl.querySelectorAll("[data-perm]").forEach((cb) => {
        cb.addEventListener("change", () => {
          syncModuloTodos(cb.getAttribute("data-modulo-ref"));
          updateAsignadosCount();
          markDirty();
        });
      });
      modulosEl.querySelectorAll("[data-modulo-todos]").forEach((cb) => {
        cb.addEventListener("change", () => {
          const mod = cb.getAttribute("data-modulo-todos");
          modulosEl
            .querySelectorAll(`input[data-perm][data-modulo-ref="${CSS.escape(mod)}"]`)
            .forEach((p) => {
              p.checked = cb.checked;
            });
          updateAsignadosCount();
          markDirty();
        });
      });
    }
  }

  function syncModuloTodos(modulo) {
    const root = document.querySelector(`[data-modulo="${CSS.escape(modulo)}"]`);
    if (!root) return;
    const perms = [...root.querySelectorAll("[data-perm]")];
    const todos = root.querySelector("[data-modulo-todos]");
    if (!todos || !perms.length) return;
    todos.checked = perms.every((p) => p.checked);
  }

  function selectRol(id) {
    if (dirty && selectedId && selectedId !== id) {
      AppConfirm.request({
        title: "Cambios sin guardar",
        confirmLabel: "Descartar",
        cancelLabel: "Seguir editando",
        variant: "warning",
        messageHtml: `<p>Hay cambios de permisos sin guardar. ¿Descartarlos?</p>`,
      }).then((ok) => {
        if (!ok) return;
        dirty = false;
        selectedId = id;
        renderAll();
      });
      return;
    }
    selectedId = id;
    renderAll();
  }

  function renderAll() {
    syncMeta();
    renderRolesList();
    renderPermisosPanel();
  }

  function guardarPermisos() {
    const rol = selectedId ? RolesPermisosData.findRol(selectedId) : null;
    if (!rol || rol.protegido) return;
    try {
      RolesPermisosData.setRolPermisos(rol.id, currentCheckedIds());
      baselinePermisos = currentCheckedIds();
      dirty = false;
      const btn = document.querySelector("[data-rbac-guardar]");
      if (btn) btn.disabled = true;
      toast("Permisos actualizados");
      renderRolesList();
    } catch (err) {
      if (err.message === "protegido") {
        toast("Este rol está protegido", "warning");
      } else {
        toast("No se pudieron guardar los permisos", "danger");
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.RolesPermisosData) return;

    const boot = () => {
      const params = new URLSearchParams(window.location.search);
      const rolParam = params.get("rol");
      if (rolParam && RolesPermisosData.findRol(rolParam)) {
        selectedId = rolParam;
      }

      renderAll();

      document.querySelector("[data-open-create]")?.addEventListener("click", () => {
        openRolModal(null);
      });
      document.querySelector("[data-open-create-mobile]")?.addEventListener("click", () => {
        openRolModal(null);
      });

      document.querySelector("[data-rbac-guardar]")?.addEventListener("click", guardarPermisos);

      document.querySelector("[data-rbac-rol-select]")?.addEventListener("change", (e) => {
        selectRol(e.target.value);
      });

      const backdrop = document.querySelector("[data-rol-backdrop]");
      document.querySelector("[data-rol-cancel]")?.addEventListener("click", closeRolModal);
      backdrop?.addEventListener("click", (e) => {
        if (e.target === backdrop) closeRolModal();
      });

      document.getElementById("rol-activo-toggle")?.addEventListener("click", () => {
        syncActivoToggle(!document.getElementById("rol-activo").checked);
      });

      document.querySelector("[data-rol-form]")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const editingId = document.querySelector("[data-rol-editing-id]").value;
        const clave = document.getElementById("rol-clave").value.trim().toLowerCase();
        const nombre = document.getElementById("rol-nombre").value.trim();
        const descripcion = document.getElementById("rol-desc").value.trim();
        const activo = document.getElementById("rol-activo").checked;

        if (!clave || !nombre) {
          toast("Clave y nombre son obligatorios", "warning");
          return;
        }
        if (!/^[a-z][a-z0-9_]*$/.test(clave)) {
          toast("La clave debe ser snake_case (letras, números y _)", "warning");
          return;
        }
        if (RolesPermisosData.claveExiste(clave, editingId || null)) {
          toast("Ya existe un rol con esa clave", "warning");
          return;
        }
        if (RolesPermisosData.nombreExiste(nombre, editingId || null)) {
          toast("Ya existe un rol con ese nombre", "warning");
          return;
        }

        try {
          const existing = editingId ? RolesPermisosData.findRol(editingId) : null;
          const row = RolesPermisosData.upsertRol({
            id: editingId || `rol-${Date.now()}`,
            clave: editingId ? existing.clave : clave,
            nombre,
            descripcion,
            activo,
            protegido: false,
            permisoIds: existing ? existing.permisoIds : [],
          });
          toast(editingId ? "Rol actualizado" : "Rol creado");
          closeRolModal();
          selectedId = row.id;
          dirty = false;
          renderAll();
        } catch (err) {
          if (err.message === "protegido") {
            toast("Los roles protegidos no se pueden modificar", "warning");
          } else {
            toast("No se pudo guardar el rol", "danger");
          }
        }
      });
    };

    const readyUsuarios =
      window.UsuariosData && typeof UsuariosData.ready === "function"
        ? UsuariosData.ready()
        : Promise.resolve();

    Promise.all([RolesPermisosData.ready(), readyUsuarios])
      .then(boot)
      .catch((err) => {
        console.error(err);
        toast("Error al cargar roles y permisos", "danger");
      });
  });
})();
