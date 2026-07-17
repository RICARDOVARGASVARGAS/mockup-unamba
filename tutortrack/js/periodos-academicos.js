/**
 * periodos-academicos.js — catálogo PeriodoAcademico.
 */
(function () {
  const SEED = [
    { id: "p-2023-1", nombre: "2023-I", inicio: "2023-03-01", fin: "2023-07-15", activo: false },
    { id: "p-2023-2", nombre: "2023-II", inicio: "2023-08-01", fin: "2023-12-15", activo: false },
    { id: "p-2024-1", nombre: "2024-I", inicio: "2024-03-01", fin: "2024-07-15", activo: false },
    { id: "p-2024-2", nombre: "2024-II", inicio: "2024-08-01", fin: "2024-12-15", activo: false },
    { id: "p-2025-1", nombre: "2025-I", inicio: "2025-03-01", fin: "2025-07-15", activo: false },
    { id: "p-2025-2", nombre: "2025-II", inicio: "2025-08-01", fin: "2025-12-15", activo: false },
    { id: "p-2026-1", nombre: "2026-I", inicio: "2026-03-01", fin: "2026-07-15", activo: true },
  ];

  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));
  const ICON_CHECK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>';

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-catalog]");
    const backdrop = document.querySelector("[data-form-backdrop]");
    const form = document.querySelector("[data-form]");
    const title = document.querySelector("[data-form-title]");
    const editingId = document.querySelector("[data-editing-id]");
    const nombreInput = document.getElementById("periodo-nombre");
    const inicioInput = document.getElementById("periodo-inicio");
    const finInput = document.getElementById("periodo-fin");
    const activoInput = document.getElementById("periodo-activo");

    let table;

    function marcarVigente(id) {
      table.getAll().forEach((row) => {
        table.update(row.id, { activo: row.id === id });
      });
      toast("Periodo marcado como vigente", "info");
    }

    function openModal(row) {
      if (row) {
        title.textContent = "Editar periodo académico";
        editingId.value = row.id;
        nombreInput.value = row.nombre;
        inicioInput.value = row.inicio || "";
        finInput.value = row.fin || "";
        activoInput.checked = !!row.activo;
      } else {
        title.textContent = "Nuevo periodo académico";
        editingId.value = "";
        form.reset();
      }
      backdrop.classList.remove("hidden");
      backdrop.classList.add("flex");
      nombreInput.focus();
    }

    function closeModal() {
      backdrop.classList.add("hidden");
      backdrop.classList.remove("flex");
    }

    table = CatalogTable.mount(root, {
      data: SEED,
      pageSize: 5,
      searchKeys: ["nombre"],
      filters: [
        {
          id: "estado",
          getValue: (row) => (row.activo ? "vigente" : "inactivo"),
        },
      ],
      sort: (a, b) => String(b.nombre).localeCompare(String(a.nombre)),
      columns: [
        { key: "nombre", label: "Nombre", primary: true },
        {
          key: "inicio",
          label: "Inicio",
          muted: true,
          render: (row, esc) => esc(row.inicio || "—"),
        },
        {
          key: "fin",
          label: "Fin",
          muted: true,
          render: (row, esc) => esc(row.fin || "—"),
        },
        {
          key: "activo",
          label: "Estado",
          sortable: false,
          render: (row) =>
            row.activo
              ? '<span class="badge badge-success">Vigente</span>'
              : '<span class="badge badge-neutral">Inactivo</span>',
        },
      ],
      extraActions: (row) =>
        row.activo
          ? ""
          : `<button type="button" class="btn-action btn-action-accent" data-set-vigente data-row-id="${CatalogTable.escapeHtml(row.id)}" title="Marcar vigente" aria-label="Marcar vigente">${ICON_CHECK}</button>`,
      onEdit: openModal,
    });

    root.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-set-vigente]");
      if (btn) marcarVigente(btn.dataset.rowId);
    });

    document.querySelector("[data-open-create]").addEventListener("click", () => openModal(null));
    document.querySelector("[data-form-cancel]").addEventListener("click", closeModal);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = nombreInput.value.trim();
      if (!nombre) return;
      const patch = {
        nombre,
        inicio: inicioInput.value,
        fin: finInput.value,
        activo: false,
      };
      const id = editingId.value;
      let targetId = id;
      if (id) {
        table.update(id, patch);
        toast("Periodo académico actualizado");
      } else {
        targetId = `periodo-${Date.now()}`;
        table.add({ id: targetId, ...patch });
        toast("Periodo académico creado");
      }
      if (activoInput.checked) marcarVigente(targetId);
      closeModal();
    });
  });
})();
