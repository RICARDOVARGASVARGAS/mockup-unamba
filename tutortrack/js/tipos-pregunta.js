/**
 * tipos-pregunta.js — catálogo TipoPregunta.
 * `requiere_opciones` es ayuda de filtro/UI en el mockup (no está en el modelo base).
 */
(function () {
  const SEED = [
    { id: "tp1", nombre: "Texto abierto", requiere_opciones: false },
    { id: "tp2", nombre: "Alternativa única", requiere_opciones: true },
    { id: "tp3", nombre: "Respuesta múltiple", requiere_opciones: true },
    { id: "tp4", nombre: "Escala Likert", requiere_opciones: true },
    { id: "tp5", nombre: "Sí/No", requiere_opciones: true },
    { id: "tp6", nombre: "Fecha", requiere_opciones: false },
    { id: "tp7", nombre: "Numérico", requiere_opciones: false },
  ];

  const toast = (m) => document.dispatchEvent(new CustomEvent("app:toast", { detail: { message: m } }));

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-catalog]");
    const backdrop = document.querySelector("[data-form-backdrop]");
    const form = document.querySelector("[data-form]");
    const title = document.querySelector("[data-form-title]");
    const editingId = document.querySelector("[data-editing-id]");
    const nombre = document.getElementById("tipo-pregunta-nombre");
    const requiereOpciones = document.getElementById("tipo-pregunta-requiere-opciones");

    const open = (row) => {
      if (row) {
        title.textContent = "Editar tipo de pregunta";
        editingId.value = row.id;
        nombre.value = row.nombre;
        requiereOpciones.checked = !!row.requiere_opciones;
      } else {
        title.textContent = "Nuevo tipo de pregunta";
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
      filters: [
        {
          id: "requiere_opciones",
          getValue: (r) => (r.requiere_opciones ? "si" : "no"),
        },
      ],
      sort: (a, b) => a.nombre.localeCompare(b.nombre, "es"),
      columns: [
        { key: "nombre", label: "Nombre", primary: true },
        {
          key: "requiere_opciones",
          label: "Requiere opciones",
          render: (r) =>
            r.requiere_opciones
              ? '<span class="badge badge-info">Sí</span>'
              : '<span class="badge badge-neutral">No</span>',
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
      if (!n) return;
      const req = requiereOpciones.checked;
      if (editingId.value) {
        table.update(editingId.value, { nombre: n, requiere_opciones: req });
        toast("Tipo de pregunta actualizado");
      } else {
        table.add({ id: `tp-${Date.now()}`, nombre: n, requiere_opciones: req });
        toast("Tipo de pregunta creado");
      }
      close();
    });
  });
})();
