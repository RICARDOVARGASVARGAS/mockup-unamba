/**
 * tipos-documento.js — UI catálogo tipo_documento (clave, nombre, activo).
 * Ver docs/BD-BACKEND.md § tipo_documento y MOCKUP-PANTALLAS.md § Pantalla 3.
 */
(function () {
  const Data = window.TiposDocumentoData;
  if (!Data) {
    console.error("TiposDocumentoData no cargado. Incluí tipos-documento-data.js antes.");
    return;
  }

  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  function estadoBadge(row) {
    return row.activo
      ? '<span class="badge badge-success">Activo</span>'
      : '<span class="badge badge-neutral">Inactivo</span>';
  }

  function syncFormToggle(activo) {
    const toggle = document.getElementById("td-activo-toggle");
    const checkbox = document.getElementById("td-activo");
    checkbox.checked = !!activo;
    toggle.setAttribute("aria-checked", activo ? "true" : "false");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-catalog]");
    if (!root) return;

    const backdrop = document.querySelector("[data-form-backdrop]");
    const form = document.querySelector("[data-form]");
    const title = document.querySelector("[data-form-title]");
    const editingId = document.querySelector("[data-editing-id]");
    const claveInput = document.getElementById("td-clave");
    const nombreInput = document.getElementById("td-nombre");
    const activoInput = document.getElementById("td-activo");
    const formToggle = document.getElementById("td-activo-toggle");

    let table;

    function nextOrden() {
      const all = table.getAll();
      if (!all.length) return 1;
      return Math.max(...all.map((r) => Number(r.orden) || 0)) + 1;
    }

    function openModal(row) {
      if (row) {
        title.textContent = "Editar tipo de documento";
        editingId.value = row.id;
        claveInput.value = row.clave;
        nombreInput.value = row.nombre;
        syncFormToggle(row.activo);
      } else {
        title.textContent = "Nuevo tipo de documento";
        editingId.value = "";
        form.reset();
        syncFormToggle(true);
      }
      backdrop.classList.remove("hidden");
      backdrop.classList.add("flex");
      claveInput.focus();
    }

    function closeModal() {
      backdrop.classList.add("hidden");
      backdrop.classList.remove("flex");
    }

    table = CatalogTable.mount(root, {
      data: Data.load(),
      pageSize: 5,
      searchKeys: ["clave", "nombre"],
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
        { key: "clave", label: "Clave", muted: true },
        { key: "nombre", label: "Nombre", primary: true },
        {
          key: "activo",
          label: "Estado",
          sortable: false,
          render: (row) => estadoBadge(row),
        },
      ],
      onEdit: openModal,
      onDelete: () => Data.persist(table.getAll()),
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
      const clave = claveInput.value.trim().toUpperCase();
      const nombre = nombreInput.value.trim();
      const activo = activoInput.checked;
      if (!clave || !nombre) return;

      const id = editingId.value;
      const all = table.getAll();
      if (all.some((r) => r.clave === clave && r.id !== id)) {
        toast("Ya existe un tipo con esa clave", "warning");
        return;
      }
      if (all.some((r) => r.nombre.toLowerCase() === nombre.toLowerCase() && r.id !== id)) {
        toast("Ya existe un tipo con ese nombre", "warning");
        return;
      }

      if (id) {
        table.update(id, { clave, nombre, activo });
        toast("Tipo de documento actualizado");
      } else {
        table.add({ id: `td-${Date.now()}`, clave, nombre, activo, orden: nextOrden() });
        toast("Tipo de documento creado");
      }
      Data.persist(table.getAll());
      closeModal();
    });

    document.addEventListener("app:delete-confirmed", () => {
      Data.persist(table.getAll());
    });
  });
})();
