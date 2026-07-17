/**
 * tipos-ficha.js — catálogo TipoFicha.
 * `uso` es solo ayuda de filtro en el mockup (no es atributo del modelo).
 */
(function () {
  const SEED = [
    { id: "tf1", nombre: "Diagnóstico", uso: "frecuente" },
    { id: "tf2", nombre: "Seguimiento", uso: "frecuente" },
    { id: "tf3", nombre: "Grupal", uso: "frecuente" },
    { id: "tf4", nombre: "Encuesta", uso: "complementario" },
    { id: "tf5", nombre: "Ingreso", uso: "frecuente" },
    { id: "tf6", nombre: "Cierre", uso: "complementario" },
    { id: "tf7", nombre: "Alerta temprana", uso: "frecuente" },
    { id: "tf8", nombre: "Evaluación intermedia", uso: "complementario" },
  ];

  const USO_LABEL = {
    frecuente: "Frecuente",
    complementario: "Complementario",
  };

  const toast = (m, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message: m, type } }));

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-catalog]");
    const backdrop = document.querySelector("[data-form-backdrop]");
    const form = document.querySelector("[data-form]");
    const title = document.querySelector("[data-form-title]");
    const editingId = document.querySelector("[data-editing-id]");
    const nombre = document.getElementById("tipo-ficha-nombre");
    const uso = document.getElementById("tipo-ficha-uso");

    const open = (row) => {
      if (row) {
        title.textContent = "Editar tipo de ficha";
        editingId.value = row.id;
        nombre.value = row.nombre;
        uso.value = row.uso;
      } else {
        title.textContent = "Nuevo tipo de ficha";
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
      filters: [{ id: "uso", getValue: (r) => r.uso }],
      sort: (a, b) => a.nombre.localeCompare(b.nombre, "es"),
      columns: [
        { key: "nombre", label: "Nombre", primary: true },
        {
          key: "uso",
          label: "Estado uso",
          muted: true,
          render: (r, esc) => esc(USO_LABEL[r.uso] || r.uso),
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
      const u = uso.value;
      if (editingId.value) {
        table.update(editingId.value, { nombre: n, uso: u });
        toast("Tipo de ficha actualizado");
      } else {
        table.add({ id: `tf-${Date.now()}`, nombre: n, uso: u });
        toast("Tipo de ficha creado");
      }
      close();
    });
  });
})();
