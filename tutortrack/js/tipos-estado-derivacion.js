/**
 * tipos-estado-derivacion.js — catálogo TipoEstadoDerivacion.
 * `orden` y `fase` son ayuda de orden/filtro en el mockup.
 */
(function () {
  const SEED = [
    { id: "ted1", orden: 1, nombre: "Derivado", fase: "inicial" },
    { id: "ted2", orden: 2, nombre: "En atención", fase: "inicial" },
    { id: "ted3", orden: 3, nombre: "En seguimiento", fase: "proceso" },
    { id: "ted4", orden: 4, nombre: "Pendiente de informe", fase: "proceso" },
    { id: "ted5", orden: 5, nombre: "Resuelto", fase: "final" },
    { id: "ted6", orden: 6, nombre: "Cerrado", fase: "final" },
    { id: "ted7", orden: 7, nombre: "Reabierto", fase: "final" },
    { id: "ted8", orden: 8, nombre: "Anulado", fase: "final" },
  ];

  const FASE_LABEL = {
    inicial: "Inicial",
    proceso: "Proceso",
    final: "Final",
  };

  const toast = (m) => document.dispatchEvent(new CustomEvent("app:toast", { detail: { message: m } }));

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-catalog]");
    const backdrop = document.querySelector("[data-form-backdrop]");
    const form = document.querySelector("[data-form]");
    const title = document.querySelector("[data-form-title]");
    const editingId = document.querySelector("[data-editing-id]");
    const orden = document.getElementById("tipo-estado-orden");
    const nombre = document.getElementById("tipo-estado-nombre");
    const fase = document.getElementById("tipo-estado-fase");

    const open = (row) => {
      if (row) {
        title.textContent = "Editar tipo de estado";
        editingId.value = row.id;
        orden.value = row.orden;
        nombre.value = row.nombre;
        fase.value = row.fase;
      } else {
        title.textContent = "Nuevo tipo de estado";
        editingId.value = "";
        form.reset();
      }
      backdrop.classList.remove("hidden");
      backdrop.classList.add("flex");
      nombre.focus();
    };
    const close = () => {
      backdrop.classList.add("hidden");
      backdrop.classList.remove("flex");
    };

    const table = CatalogTable.mount(root, {
      data: SEED,
      pageSize: 5,
      searchKeys: ["nombre"],
      filters: [{ id: "fase", getValue: (r) => r.fase }],
      sort: (a, b) => a.orden - b.orden,
      columns: [
        { key: "orden", label: "Orden", align: "right", muted: true },
        { key: "nombre", label: "Nombre", primary: true },
        {
          key: "fase",
          label: "Fase",
          muted: true,
          render: (r, esc) => esc(FASE_LABEL[r.fase] || r.fase),
        },
      ],
      onEdit: open,
    });

    document.querySelector("[data-open-create]").addEventListener("click", () => open(null));
    document.querySelector("[data-form-cancel]").addEventListener("click", close);
    backdrop.addEventListener("click", (e) => e.target === backdrop && close());
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const n = nombre.value.trim();
      const o = Number(orden.value);
      if (!n || !o) return;
      const f = fase.value;
      if (editingId.value) {
        table.update(editingId.value, { orden: o, nombre: n, fase: f });
        toast("Tipo de estado actualizado");
      } else {
        table.add({ id: `ted-${Date.now()}`, orden: o, nombre: n, fase: f });
        toast("Tipo de estado creado");
      }
      close();
    });
  });
})();
