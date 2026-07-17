/**
 * areas.js — catálogo Area.
 * `grupo` es solo ayuda de filtro en el mockup (no es atributo del modelo).
 */
(function () {
  const SEED = [
    { id: "a1", nombre: "Personal y social", grupo: "personal" },
    { id: "a2", nombre: "Vida universitaria", grupo: "personal" },
    { id: "a3", nombre: "Relaciones familiares", grupo: "personal" },
    { id: "a4", nombre: "Salud corporal y mental", grupo: "salud" },
    { id: "a5", nombre: "Consumo de sustancias", grupo: "salud" },
    { id: "a6", nombre: "Hábitos de sueño y alimentación", grupo: "salud" },
    { id: "a7", nombre: "Adaptación académica", grupo: "academico" },
    { id: "a8", nombre: "Motivación y abandono", grupo: "academico" },
    { id: "a9", nombre: "Servicios institucionales", grupo: "academico" },
    { id: "a10", nombre: "Situación económica", grupo: "personal" },
  ];

  const GRUPO_LABEL = {
    personal: "Personal / social",
    salud: "Salud",
    academico: "Académico / institucional",
  };

  const toast = (m, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message: m, type } }));

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-catalog]");
    const backdrop = document.querySelector("[data-form-backdrop]");
    const form = document.querySelector("[data-form]");
    const title = document.querySelector("[data-form-title]");
    const editingId = document.querySelector("[data-editing-id]");
    const nombre = document.getElementById("area-nombre");
    const grupo = document.getElementById("area-grupo");

    const open = (row) => {
      if (row) {
        title.textContent = "Editar área";
        editingId.value = row.id;
        nombre.value = row.nombre;
        grupo.value = row.grupo;
      } else {
        title.textContent = "Nueva área";
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
      filters: [{ id: "grupo", getValue: (r) => r.grupo }],
      sort: (a, b) => a.nombre.localeCompare(b.nombre, "es"),
      columns: [
        { key: "nombre", label: "Nombre", primary: true },
        {
          key: "grupo",
          label: "Grupo",
          muted: true,
          render: (r, esc) => esc(GRUPO_LABEL[r.grupo] || r.grupo),
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
      const g = grupo.value;
      if (editingId.value) {
        table.update(editingId.value, { nombre: n, grupo: g });
        toast("Área actualizada");
      } else {
        table.add({ id: `area-${Date.now()}`, nombre: n, grupo: g });
        toast("Área creada");
      }
      close();
    });
  });
})();
