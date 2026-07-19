/**
 * fichas.js — listado admin de plantillas de fichas (M3-4).
 */
(function () {
  const toast = (msg, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message: msg, type } }));

  const TIPO_BADGE = {
    "tf-1": "badge-primary",
    "tf-2": "badge-success",
    "tf-3": "badge-neutral",
  };

  function tipoHtml(row, esc) {
    const nombre = FichasData.tipoFichaNombre(row.tipo_ficha_id);
    const cls    = TIPO_BADGE[row.tipo_ficha_id] || "badge-neutral";
    return `<span class="badge ${cls}">${esc(nombre)}</span>`;
  }

  function estadoHtml(row) {
    return row.activo !== false
      ? '<span class="badge badge-success">Activa</span>'
      : '<span class="badge badge-neutral">Inactiva</span>';
  }

  function mountTable(fichas) {
    const root = document.querySelector("[data-catalog]");
    if (!root || !window.CatalogTable) return null;

    /* Poblar filtro de tipo */
    const selTipo = document.getElementById("filter-tipo");
    FichasData.TIPOS_FICHA_SEED.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.nombre;
      selTipo.appendChild(opt);
    });

    const data = fichas.map((f) => ({
      ...f,
      n_preguntas: (f.preguntas || []).length,
    }));

    const table = CatalogTable.mount(root, {
      data,
      pageSize: 8,
      searchKeys: ["nombre", "descripcion"],
      filters: [
        { id: "tipo",   getValue: (r) => r.tipo_ficha_id },
        { id: "estado", getValue: (r) => (r.activo !== false ? "activo" : "inactivo") },
      ],
      initialSortKey: "nombre",
      deleteLabel: (r) => r.nombre,
      columns: [
        {
          key: "nombre",
          label: "Ficha",
          primary: true,
          render: (row, esc) => `
            <div>
              <div class="font-medium text-text">${esc(row.nombre)}</div>
              ${row.descripcion ? `<div class="text-xs text-text-muted mt-0.5 line-clamp-1">${esc(row.descripcion)}</div>` : ""}
            </div>`,
        },
        { key: "tipo_ficha_id", label: "Tipo",      render: tipoHtml },
        {
          key: "n_preguntas",
          label: "Preguntas",
          align: "center",
          render: (row) => `<span class="badge badge-neutral">${row.n_preguntas}</span>`,
        },
        { key: "activo", label: "Estado", align: "center", render: estadoHtml },
      ],
      onEdit: (row) => {
        window.location.href = `fichas-form.html?id=${encodeURIComponent(row.id)}`;
      },
      onDelete: (id) => {
        FichasData.remove(id);
        toast("Plantilla eliminada");
      },
    });

    /* Botones adicionales: Ver preguntas + Duplicar */
    document.addEventListener("click", (e) => {
      const verBtn    = e.target.closest("[data-ver-preguntas]");
      const dupBtn    = e.target.closest("[data-duplicar-ficha]");

      if (verBtn) {
        const id = verBtn.dataset.verPreguntas;
        window.location.href = `fichas-form.html?id=${encodeURIComponent(id)}&modo=ver`;
        return;
      }
      if (dupBtn) {
        const id    = dupBtn.dataset.duplicarFicha;
        const copia = FichasData.duplicar(id);
        if (copia) {
          table.setData(FichasData.load().map((f) => ({ ...f, n_preguntas: (f.preguntas || []).length })));
          toast("Ficha duplicada");
        }
      }
    });

    document.querySelector("[data-open-create]")?.addEventListener("click", () => {
      window.location.href = "fichas-form.html";
    });

    document.querySelector("[data-catalog-refresh]")?.addEventListener("click", () => {
      table.setData(FichasData.load().map((f) => ({ ...f, n_preguntas: (f.preguntas || []).length })));
      toast("Lista actualizada");
    });

    return table;
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.FichasData || !window.CatalogTable) return;

    const params = new URLSearchParams(window.location.search);
    const saved  = params.get("saved");
    if (saved === "created") toast("Ficha creada");
    else if (saved === "updated") toast("Ficha actualizada");
    if (saved) {
      params.delete("saved");
      const clean = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
      window.history.replaceState({}, "", clean);
    }

    FichasData.ready()
      .then((fichas) => mountTable(fichas))
      .catch((err) => {
        console.error(err);
        toast("Error al cargar fichas", "danger");
      });
  });
})();
