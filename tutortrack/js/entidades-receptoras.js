/**
 * entidades-receptoras.js — listado + enlace a pipeline de estados.
 * Usa CatalogSimple helpers pero store propio (EntidadesReceptorasData).
 */
(function () {
  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  const esc = (v) => CatalogTable.escapeHtml(v);

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.EntidadesReceptorasData || !window.CatalogTable) return;

    const Data = EntidadesReceptorasData;
    const root = document.querySelector("[data-catalog]");
    const backdrop = document.querySelector("[data-form-backdrop]");
    const form = document.querySelector("[data-form]");
    const title = document.querySelector("[data-form-title]");
    const editingId = document.querySelector("[data-editing-id]");

    // Cards
    if (!document.querySelector("[data-people-summary]")) {
      root.insertAdjacentHTML("beforebegin", CatalogSimple.cardsHtml());
    }

    function refreshSummary() {
      CatalogSimple.renderSummary(Data.resumen());
    }

    function syncToggle(activo) {
      CatalogSimple.syncToggle("field-activo-toggle", "field-activo", activo);
    }

    function openModal(row) {
      const isEdit = Boolean(row);
      title.textContent = isEdit ? "Editar entidad" : "Nueva entidad";
      editingId.value = isEdit ? row.id : "";
      const clave = document.getElementById("field-clave");
      clave.value = isEdit ? row.clave : "";
      clave.readOnly = isEdit;
      clave.classList.toggle("opacity-80", isEdit);
      document.getElementById("field-nombre").value = isEdit ? row.nombre : "";
      document.getElementById("field-descripcion").value = isEdit ? row.descripcion || "" : "";
      syncToggle(isEdit ? row.activo !== false : true);
      backdrop.classList.remove("hidden");
      backdrop.classList.add("flex");
      (isEdit ? document.getElementById("field-nombre") : clave).focus();
    }

    function closeModal() {
      backdrop.classList.add("hidden");
      backdrop.classList.remove("flex");
    }

    function askDelete(row) {
      if (!Data.puedeEliminar(row.id)) {
        return AppConfirm.request({
          title: "No se puede eliminar",
          confirmLabel: "Desactivar",
          cancelLabel: "Cancelar",
          variant: "primary",
          messageHtml: `
            <p><strong class="text-text">${esc(row.nombre)}</strong> no se puede eliminar.</p>
            <p>${esc(Data.motivoBloqueo(row.id))}</p>
            <p class="pt-1">Puedes desactivarla para que deje de usarse en nuevas derivaciones.</p>`,
        }).then((ok) => {
          if (!ok) return false;
          const rows = Data.entidades().map((r) =>
            r.id === row.id ? { ...r, activo: false } : r
          );
          Data.saveEntidades(rows);
          toast("Entidad desactivada");
          refreshSummary();
          return "deactivated";
        });
      }
      return AppConfirm.request({
        title: "Eliminar entidad",
        confirmLabel: "Eliminar",
        cancelLabel: "Cancelar",
        variant: "danger",
        messageHtml: `<p>¿Eliminar <strong class="text-text">${esc(row.nombre)}</strong>? No tiene derivaciones ni estados.</p>`,
      }).then((ok) => {
        if (!ok) return false;
        Data.saveEntidades(Data.entidades().filter((r) => r.id !== row.id));
        toast("Entidad eliminada");
        refreshSummary();
        return "deleted";
      });
    }

    Data.ready().then(() => {
      const table = CatalogTable.mount(root, {
        data: Data.entidades(),
        pageSize: 10,
        searchKeys: ["clave", "nombre", "descripcion"],
        filters: [
          { id: "estado", getValue: (r) => (r.activo !== false ? "activo" : "inactivo") },
        ],
        initialSortKey: "nombre",
        deleteLabel: (r) => r.nombre,
        columns: [
          {
            key: "_n",
            label: "N°",
            num: true,
            align: "center",
            sortable: false,
            render: (_r, e, n) => e(n),
          },
          {
            key: "clave",
            label: "Clave",
            muted: true,
            render: (r, e) => `<code class="catalog-clave">${e(r.clave)}</code>`,
          },
          {
            key: "nombre",
            label: "Nombre",
            primary: true,
            render: (r, e) => {
              if (!r.descripcion) return e(r.nombre);
              return `<div class="leading-snug">
                <div class="font-medium">${e(r.nombre)}</div>
                <div class="text-xs text-text-muted truncate" title="${e(r.descripcion)}">${e(r.descripcion)}</div>
              </div>`;
            },
          },
          {
            key: "estados",
            label: "Estados",
            sortable: false,
            render: (r, e) => {
              const n = Data.conteoActivos(r.id);
              return `<a href="entidades-receptoras-estados.html?id=${encodeURIComponent(r.id)}" class="text-primary font-medium hover:underline">${e(n)} pasos ▸</a>`;
            },
          },
          {
            key: "activo",
            label: "Estado",
            align: "center",
            sortable: false,
            render: CatalogSimple.estadoToggleHtml,
          },
        ],
        onEdit: openModal,
        onDeleteAsk: askDelete,
        extraActions: (row) =>
          `<a href="entidades-receptoras-estados.html?id=${encodeURIComponent(row.id)}" class="btn-action btn-action-edit" title="Estados" aria-label="Editar estados">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
          </a>`,
      });

      refreshSummary();

      root.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-toggle-activo]");
        if (!btn) return;
        e.preventDefault();
        const id = btn.getAttribute("data-row-id");
        const rows = Data.entidades();
        const idx = rows.findIndex((r) => r.id === id);
        if (idx === -1) return;
        const next = !(rows[idx].activo !== false);
        rows[idx] = { ...rows[idx], activo: next };
        Data.saveEntidades(rows);
        table.setData(Data.entidades());
        refreshSummary();
        toast(next ? "Entidad activada" : "Entidad desactivada");
      });

      document.querySelector("[data-open-create]")?.addEventListener("click", () => openModal(null));
      document.querySelector("[data-catalog-refresh]")?.addEventListener("click", () => {
        table.setData(Data.entidades());
        refreshSummary();
        toast("Lista actualizada");
      });
      document.querySelector("[data-form-cancel]")?.addEventListener("click", closeModal);
      backdrop.addEventListener("click", (ev) => {
        if (ev.target === backdrop) closeModal();
      });
      document.getElementById("field-activo-toggle")?.addEventListener("click", () => {
        syncToggle(!document.getElementById("field-activo").checked);
      });

      form.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const id = editingId.value;
        let clave = document.getElementById("field-clave").value.trim().toLowerCase();
        const nombre = document.getElementById("field-nombre").value.trim();
        const descripcion = document.getElementById("field-descripcion").value.trim();
        const activo = document.getElementById("field-activo").checked;
        if (!clave || !nombre) {
          toast("Clave y nombre son obligatorios", "warning");
          return;
        }
        if (!/^[a-z][a-z0-9_]*$/.test(clave)) {
          toast("La clave debe ser snake_case", "warning");
          return;
        }
        const all = Data.entidades();
        if (id) {
          const prev = all.find((r) => r.id === id);
          clave = prev.clave;
        }
        if (all.some((r) => r.id !== id && r.clave === clave)) {
          toast("Ya existe una entidad con esa clave", "warning");
          return;
        }
        if (all.some((r) => r.id !== id && r.nombre.toLowerCase() === nombre.toLowerCase())) {
          toast("Ya existe una entidad con ese nombre", "warning");
          return;
        }
        if (id) {
          Data.saveEntidades(
            all.map((r) =>
              r.id === id ? { ...r, nombre, descripcion, activo, clave } : r
            )
          );
          toast("Entidad actualizada");
        } else {
          all.unshift({
            id: `ent-${Date.now()}`,
            clave,
            nombre,
            descripcion,
            activo,
          });
          Data.saveEntidades(all);
          toast("Entidad creada");
        }
        table.setData(Data.entidades());
        refreshSummary();
        closeModal();
      });
    });
  });
})();
