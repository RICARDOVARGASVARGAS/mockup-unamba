/**
 * ciclos.js — catálogo Ciclo (nombre, orden, activo).
 * Ver docs/MODELO-DATOS.md § Ciclo.
 */
(function () {
  const NOMBRES = [
    "Primer ciclo",
    "Segundo ciclo",
    "Tercer ciclo",
    "Cuarto ciclo",
    "Quinto ciclo",
    "Sexto ciclo",
    "Séptimo ciclo",
    "Octavo ciclo",
    "Noveno ciclo",
    "Décimo ciclo",
  ];

  const SEED = NOMBRES.map((nombre, i) => ({
    id: `ciclo-${i + 1}`,
    nombre,
    orden: i + 1,
    activo: i < 9, /* último inactivo de ejemplo */
  }));

  const toast = (message) => document.dispatchEvent(new CustomEvent("app:toast", { detail: { message } }));

  function statusToggleHtml(row) {
    const checked = row.activo ? "true" : "false";
    return `
      <button
        type="button"
        class="status-toggle"
        role="switch"
        aria-checked="${checked}"
        aria-label="Estado: ${row.activo ? "Activo" : "Inactivo"}"
        data-toggle-activo
        data-row-id="${CatalogTable.escapeHtml(row.id)}"
      >
        <span class="status-toggle-thumb" aria-hidden="true"></span>
        <span class="status-toggle-label" data-on>Activo</span>
        <span class="status-toggle-label" data-off>Inactivo</span>
      </button>`;
  }

  function syncFormToggle(activo) {
    const toggle = document.getElementById("ciclo-activo-toggle");
    const checkbox = document.getElementById("ciclo-activo");
    checkbox.checked = !!activo;
    toggle.setAttribute("aria-checked", activo ? "true" : "false");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-catalog]");
    const backdrop = document.querySelector("[data-form-backdrop]");
    const form = document.querySelector("[data-form]");
    const title = document.querySelector("[data-form-title]");
    const editingId = document.querySelector("[data-editing-id]");
    const nombreInput = document.getElementById("ciclo-nombre");
    const ordenInput = document.getElementById("ciclo-orden");
    const activoInput = document.getElementById("ciclo-activo");
    const formToggle = document.getElementById("ciclo-activo-toggle");

    let table;

    function nextOrden() {
      const all = table.getAll();
      if (!all.length) return 1;
      return Math.max(...all.map((r) => Number(r.orden) || 0)) + 1;
    }

    function openModal(row) {
      if (row) {
        title.textContent = "Editar ciclo";
        editingId.value = row.id;
        nombreInput.value = row.nombre;
        ordenInput.value = row.orden;
        syncFormToggle(row.activo);
      } else {
        title.textContent = "Nuevo ciclo";
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
      filters: [
        {
          id: "estado",
          getValue: (row) => (row.activo ? "activo" : "inactivo"),
        },
      ],
      sort: (a, b) => a.orden - b.orden,
      columns: [
        { key: "nombre", label: "Nombre", primary: true },
        {
          key: "orden",
          label: "Orden",
          muted: true,
          render: (row, esc) => esc(row.orden),
        },
        {
          key: "activo",
          label: "Estado",
          render: (row) => statusToggleHtml(row),
        },
      ],
      onEdit: openModal,
    });

    root.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-toggle-activo]");
      if (!btn) return;
      e.preventDefault();
      const id = btn.dataset.rowId;
      const row = table.find(id);
      if (!row) return;
      const next = !row.activo;
      table.update(id, { activo: next });
      toast(next ? "Ciclo activado" : "Ciclo desactivado");
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
        toast("Ya existe un ciclo con ese orden");
        return;
      }

      if (id) {
        table.update(id, { nombre, orden, activo });
        toast("Ciclo actualizado");
      } else {
        table.add({ id: `ciclo-${Date.now()}`, nombre, orden, activo });
        toast("Ciclo creado");
      }
      closeModal();
    });
  });
})();
