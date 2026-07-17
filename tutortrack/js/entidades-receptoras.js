/**
 * entidades-receptoras.js — catálogo EntidadReceptora.
 * `ambito` es solo ayuda de filtro en el mockup (no es atributo del modelo).
 */
(function () {
  const SEED = [
    { id: "er1", nombre: "Psicología", ambito: "salud" },
    { id: "er2", nombre: "Servicios médicos", ambito: "salud" },
    { id: "er3", nombre: "Bienestar universitario", ambito: "bienestar" },
    { id: "er4", nombre: "Trabajo social", ambito: "bienestar" },
    { id: "er5", nombre: "Defensoría estudiantil", ambito: "administrativo" },
    { id: "er6", nombre: "Orientación vocacional", ambito: "bienestar" },
    { id: "er7", nombre: "Oficina de discapacidad", ambito: "bienestar" },
    { id: "er8", nombre: "Consejería académica", ambito: "administrativo" },
  ];

  const AMBITO_LABEL = {
    salud: "Salud",
    bienestar: "Bienestar",
    administrativo: "Administrativo",
  };

  const toast = (m, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message: m, type } }));

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-catalog]");
    const backdrop = document.querySelector("[data-form-backdrop]");
    const form = document.querySelector("[data-form]");
    const title = document.querySelector("[data-form-title]");
    const editingId = document.querySelector("[data-editing-id]");
    const nombre = document.getElementById("entidad-nombre");
    const ambito = document.getElementById("entidad-ambito");

    const open = (row) => {
      if (row) {
        title.textContent = "Editar entidad receptora";
        editingId.value = row.id;
        nombre.value = row.nombre;
        ambito.value = row.ambito;
      } else {
        title.textContent = "Nueva entidad receptora";
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
      filters: [{ id: "ambito", getValue: (r) => r.ambito }],
      sort: (a, b) => a.nombre.localeCompare(b.nombre, "es"),
      columns: [
        { key: "nombre", label: "Nombre", primary: true },
        {
          key: "ambito",
          label: "Ámbito",
          muted: true,
          render: (r, esc) => esc(AMBITO_LABEL[r.ambito] || r.ambito),
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
      const a = ambito.value;
      if (editingId.value) {
        table.update(editingId.value, { nombre: n, ambito: a });
        toast("Entidad receptora actualizada");
      } else {
        table.add({ id: `er-${Date.now()}`, nombre: n, ambito: a });
        toast("Entidad receptora creada");
      }
      close();
    });
  });
})();
