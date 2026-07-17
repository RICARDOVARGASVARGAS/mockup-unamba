/**
 * especialidades.js — catálogo Especialidad (orden, nombre, activo).
 * Ver docs/MOCKUP-PANTALLAS.md § Pantalla 2.
 */
(function () {
  const SEED = [
    { id: "esp-1", nombre: "Marketing", orden: 1, activo: true },
    { id: "esp-2", nombre: "Finanzas", orden: 2, activo: true },
    { id: "esp-3", nombre: "Gestión Pública", orden: 3, activo: true },
    { id: "esp-4", nombre: "Recursos Humanos", orden: 4, activo: true },
    { id: "esp-5", nombre: "Contabilidad", orden: 5, activo: false },
  ];

  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  function estadoBadge(row) {
    return row.activo
      ? '<span class="badge badge-success">Activo</span>'
      : '<span class="badge badge-neutral">Inactivo</span>';
  }

  function syncFormToggle(activo) {
    const toggle = document.getElementById("especialidad-activo-toggle");
    const checkbox = document.getElementById("especialidad-activo");
    checkbox.checked = !!activo;
    toggle.setAttribute("aria-checked", activo ? "true" : "false");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-catalog]");
    const backdrop = document.querySelector("[data-form-backdrop]");
    const form = document.querySelector("[data-form]");
    const title = document.querySelector("[data-form-title]");
    const editingId = document.querySelector("[data-editing-id]");
    const nombreInput = document.getElementById("especialidad-nombre");
    const ordenInput = document.getElementById("especialidad-orden");
    const activoInput = document.getElementById("especialidad-activo");
    const formToggle = document.getElementById("especialidad-activo-toggle");

    let table;

    function nextOrden() {
      const all = table.getAll();
      if (!all.length) return 1;
      return Math.max(...all.map((r) => Number(r.orden) || 0)) + 1;
    }

    function openModal(row) {
      if (row) {
        title.textContent = "Editar especialidad";
        editingId.value = row.id;
        nombreInput.value = row.nombre;
        ordenInput.value = row.orden;
        syncFormToggle(row.activo);
      } else {
        title.textContent = "Nueva especialidad";
        editingId.value = "";
        form.reset();
        syncFormToggle(true);
        ordenInput.value = nextOrden();
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
      initialSortKey: "orden",
      filters: [
        {
          id: "estado",
          getValue: (row) => (row.activo ? "activo" : "inactivo"),
        },
      ],
      sort: (a, b) => a.orden - b.orden,
      columns: [
        {
          key: "orden",
          label: "N°",
          num: true,
          align: "center",
          render: (row, esc) => esc(row.orden),
        },
        { key: "nombre", label: "Nombre", primary: true },
        {
          key: "activo",
          label: "Estado",
          sortable: false,
          render: (row) => estadoBadge(row),
        },
      ],
      onEdit: openModal,
    });

    formToggle.addEventListener("click", () => {
      syncFormToggle(!activoInput.checked);
    });

    document.querySelector("[data-open-create]").addEventListener("click", () => openModal(null));
    document.querySelector("[data-form-cancel]").addEventListener("click", closeModal);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = nombreInput.value.trim();
      const orden = Number(ordenInput.value);
      const activo = activoInput.checked;
      if (!nombre || !orden) return;

      const id = editingId.value;
      const clash = table.getAll().find((r) => r.orden === orden && r.id !== id);
      if (clash) {
        toast("Ya existe una especialidad con ese orden", "error");
        return;
      }

      if (id) {
        table.update(id, { nombre, orden, activo });
        toast("Especialidad actualizada");
      } else {
        table.add({ id: `esp-${Date.now()}`, nombre, orden, activo });
        toast("Especialidad creada");
      }
      closeModal();
    });
  });
})();
