/**
 * fichas.js — Admin › Plantillas de fichas (biblioteca).
 * Cards · filtros (tipo/ciclo/estado) · columnas con chips de ciclo ·
 * Editar / Eliminar→Desactivar si en uso · ⋯ Duplicar · Auditoría · Activar/Desactivar.
 */
(function () {
  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  const esc = (v) => CatalogTable.escapeHtml(v);

  const TIPO_BADGE = {
    "tf-1": "badge-primary",
    "tf-2": "badge-success",
    "tf-3": "badge-info",
    "tf-4": "badge-neutral",
  };

  function mapRows(rows) {
    return rows.map((r) => ({
      ...r,
      n_preguntas: (r.preguntas || []).length,
      tipo_nombre: FichasData.tipoFichaNombre(r.tipo_ficha_id),
    }));
  }

  function renderSummary(allRows) {
    const { total, activos, inactivos } = FichasData.resumenCounts(allRows);
    const set = (sel, n) => {
      const el = document.querySelector(sel);
      if (el) el.textContent = String(n);
    };
    set("[data-summary-total]", total);
    set("[data-summary-activos]", activos);
    set("[data-summary-inactivos]", inactivos);
  }

  function fillFilters() {
    const selTipo = document.getElementById("filter-tipo");
    if (selTipo && selTipo.options.length <= 1) {
      FichasData.TIPOS_FICHA_SEED.forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t.id;
        opt.textContent = t.nombre;
        selTipo.appendChild(opt);
      });
    }
    const selCiclo = document.getElementById("filter-ciclo");
    if (selCiclo && selCiclo.options.length <= 1) {
      FichasData.CICLOS_SEED.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.nombre;
        selCiclo.appendChild(opt);
      });
    }
  }

  function plantillaHtml(row, escapeFn) {
    return `
      <div class="min-w-0">
        <div class="font-medium text-text leading-snug">${escapeFn(row.nombre)}</div>
        ${
          row.descripcion
            ? `<div class="mt-0.5 text-xs text-text-muted line-clamp-1">${escapeFn(row.descripcion)}</div>`
            : ""
        }
      </div>`;
  }

  function tipoHtml(row, escapeFn) {
    const nombre = FichasData.tipoFichaNombre(row.tipo_ficha_id);
    const cls = TIPO_BADGE[row.tipo_ficha_id] || "badge-neutral";
    return `<span class="badge ${cls}">${escapeFn(nombre)}</span>`;
  }

  function ciclosHtml(row, escapeFn) {
    const ids = row.ciclo_ids || [];
    if (!ids.length) {
      return `<span class="text-xs text-text-muted">Sin sugerencia</span>`;
    }
    return `<div class="flex flex-wrap gap-1">${ids
      .map((id) => {
        const abrev = FichasData.cicloAbrev(id);
        return `<span class="badge badge-neutral" title="${escapeFn(FichasData.cicloNombre(id))}">${escapeFn(abrev)}</span>`;
      })
      .join("")}</div>`;
  }

  function preguntasHtml(row) {
    const n = row.n_preguntas || 0;
    if (n === 0) {
      return `<span class="badge badge-warning" title="Sin preguntas">0 ⚠</span>`;
    }
    return `<span class="badge badge-neutral">${n}</span>`;
  }

  function estadoHtml(row) {
    return row.activo !== false
      ? '<span class="badge badge-success">Activa</span>'
      : '<span class="badge badge-neutral">Inactiva</span>';
  }

  function askDeleteOrDeactivate(row) {
    const enUso = FichasData.estaEnUso(row.id);
    if (!enUso) {
      return AppConfirm.request({
        title: "Eliminar plantilla",
        confirmLabel: "Eliminar",
        cancelLabel: "Cancelar",
        variant: "danger",
        messageHtml: `<p>¿Eliminar <strong class="text-text">${esc(row.nombre)}</strong>? Esta acción no se puede deshacer en el mockup.</p>`,
      }).then((ok) => {
        if (!ok) return false;
        FichasData.remove(row.id);
        toast("Plantilla eliminada");
        renderSummary(FichasData.load());
        return true;
      });
    }

    return AppConfirm.request({
      title: "No se puede eliminar",
      confirmLabel: "Desactivar plantilla",
      cancelLabel: "Cancelar",
      variant: "primary",
      messageHtml: `
        <p><strong class="text-text">${esc(row.nombre)}</strong> ya fue clonada por docentes.</p>
        <p class="pt-1">Para conservar las copias existentes no se elimina. Puedes desactivarla: no se podrá clonar para fichas nuevas; las copias ya creadas no se afectan.</p>`,
    }).then((ok) => {
      if (!ok) return false;
      FichasData.setActivo(row.id, false);
      toast("Plantilla desactivada");
      renderSummary(FichasData.load());
      return "deactivated";
    });
  }

  function toggleActivo(row) {
    const next = !(row.activo !== false);
    const label = next ? "Activar" : "Desactivar";
    return AppConfirm.request({
      title: `${label} plantilla`,
      confirmLabel: label,
      cancelLabel: "Cancelar",
      variant: next ? "primary" : "warning",
      messageHtml: next
        ? `<p>¿Activar <strong class="text-text">${esc(row.nombre)}</strong>? Volverá a estar disponible para clonar.</p>`
        : `<p>¿Desactivar <strong class="text-text">${esc(row.nombre)}</strong>? No se podrá clonar para fichas nuevas. Las copias del docente ya creadas no se afectan.</p>`,
    }).then((ok) => {
      if (!ok) return false;
      FichasData.setActivo(row.id, next);
      toast(next ? "Plantilla activada" : "Plantilla desactivada");
      renderSummary(FichasData.load());
      return next ? "activated" : "deactivated";
    });
  }

  function mountTable(rows) {
    const root = document.querySelector("[data-catalog]");
    if (!root || !window.CatalogTable) return null;

    fillFilters();
    renderSummary(rows);

    const table = CatalogTable.mount(root, {
      data: mapRows(rows),
      pageSize: 8,
      overflowMenu: true,
      searchKeys: ["nombre", "descripcion"],
      filters: [
        { id: "tipo", getValue: (r) => r.tipo_ficha_id },
        {
          id: "ciclo",
          getValue: (r) => (r.ciclo_ids || []).join("|"),
          match: (row, filterValue) => {
            if (!filterValue) return true;
            return (row.ciclo_ids || []).includes(filterValue);
          },
        },
        {
          id: "estado",
          getValue: (r) => (r.activo !== false ? "activo" : "inactivo"),
        },
      ],
      initialSortKey: "nombre",
      deleteLabel: (r) => r.nombre,
      historyLabel: (r) => r.nombre,
      columns: [
        {
          key: "_n",
          label: "N°",
          num: true,
          align: "center",
          sortable: false,
          render: (_row, escapeFn, n) => escapeFn(n),
        },
        {
          key: "nombre",
          label: "Plantilla",
          primary: true,
          render: plantillaHtml,
        },
        {
          key: "tipo_ficha_id",
          label: "Tipo",
          sortValue: (r) => (r.tipo_nombre || "").toLowerCase(),
          render: tipoHtml,
        },
        {
          key: "ciclo_ids",
          label: "Ciclos",
          sortable: false,
          render: ciclosHtml,
        },
        {
          key: "n_preguntas",
          label: "Preguntas",
          align: "center",
          render: preguntasHtml,
        },
        {
          key: "activo",
          label: "Estado",
          align: "center",
          sortValue: (r) => (r.activo !== false ? 1 : 0),
          render: estadoHtml,
        },
      ],
      onEdit: (row) => {
        window.location.href = `fichas-form.html?id=${encodeURIComponent(row.id)}`;
      },
      onDeleteAsk: askDeleteOrDeactivate,
      overflowExtra: (row) => [
        { id: "duplicar", action: "duplicar", label: "Duplicar" },
        {
          id: "toggle-activo",
          action: "toggle-activo",
          label: row.activo !== false ? "Desactivar" : "Activar",
        },
      ],
      onOverflowAction: (row, action) => {
        if (action === "duplicar") {
          const copia = FichasData.duplicar(row.id);
          if (copia) {
            table.setData(mapRows(FichasData.load()));
            renderSummary(FichasData.load());
            toast("Plantilla duplicada");
          }
          return;
        }
        if (action === "toggle-activo") {
          toggleActivo(row).then((result) => {
            if (!result) return;
            table.setData(mapRows(FichasData.load()));
          });
        }
      },
      onDeactivate: () => {
        table.setData(mapRows(FichasData.load()));
      },
      onActivate: () => {
        table.setData(mapRows(FichasData.load()));
      },
      onDelete: () => {
        renderSummary(FichasData.load());
      },
    });

    document.querySelector("[data-open-create]")?.addEventListener("click", () => {
      window.location.href = "fichas-form.html";
    });

    document.querySelector("[data-catalog-refresh]")?.addEventListener("click", () => {
      const fresh = FichasData.load();
      table.setData(mapRows(fresh));
      renderSummary(fresh);
      toast("Lista actualizada");
    });

    return table;
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.FichasData || !window.CatalogTable) return;

    const params = new URLSearchParams(window.location.search);
    const saved = params.get("saved");
    if (saved === "created") toast("Plantilla creada");
    else if (saved === "updated") toast("Plantilla guardada");
    else if (saved === "duplicated") toast("Plantilla duplicada");
    if (saved) {
      params.delete("saved");
      const clean = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
      window.history.replaceState({}, "", clean);
    }

    FichasData.ready()
      .then((fichas) => mountTable(fichas))
      .catch((err) => {
        console.error(err);
        toast("Error al cargar plantillas", "danger");
      });
  });
})();
