/**
 * admin-common.js — comportamientos compartidos por todas las páginas
 * de /pages/admin (listados y formularios). Se incluye una vez por
 * página, después de admin-toast.js.
 *
 * Comportamientos:
 * 1) Filtro de tabla — [data-admin-table]
 * 2) Toast al volver de guardar — ?saved=1 en la URL
 * 3) Submit de formulario — [data-admin-form]
 * 4) Toggle de estado (pills) — [data-status-group]
 * 5) Gestor de listas repetibles — [data-list-manager] (temario de un
 *    curso, y cualquier mini-catálogo inline futuro)
 * 6) Alta inline de catálogo simple — [data-inline-add] (ciclos,
 *    periodos académicos, aulas)
 */

document.addEventListener("DOMContentLoaded", () => {
  initTableFilters();
  initSavedToast();
  initFormSubmit();
  initStatusToggle();
  initListManager();
  initInlineAdd();
});

function initTableFilters() {
  document.querySelectorAll("[data-admin-table]").forEach((table) => {
    const searchInput = document.querySelector("[data-table-search]");
    const filterSelects = document.querySelectorAll("[data-table-filter]");
    const emptyRow = table.querySelector("[data-empty-row]");

    function apply() {
      const query = (searchInput?.value || "").trim().toLowerCase();
      const activeFilters = Array.from(filterSelects)
        .map((select) => ({ key: select.dataset.tableFilter, value: select.value }))
        .filter((f) => f.value);

      let visibleCount = 0;
      table.querySelectorAll("[data-row]").forEach((row) => {
        const matchesSearch = !query || (row.dataset.search || "").includes(query);
        const matchesFilters = activeFilters.every((f) => row.dataset[f.key] === f.value);
        const visible = matchesSearch && matchesFilters;
        row.classList.toggle("hidden", !visible);
        if (visible) visibleCount++;
      });

      if (emptyRow) emptyRow.classList.toggle("hidden", visibleCount > 0);
    }

    searchInput?.addEventListener("input", apply);
    filterSelects.forEach((select) => select.addEventListener("change", apply));
  });
}

function initSavedToast() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("saved") !== "1") return;

  document.dispatchEvent(new CustomEvent("admin:toast", { detail: { message: "Guardado correctamente" } }));
  params.delete("saved");
  const query = params.toString();
  window.history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : ""));
}

function initFormSubmit() {
  document.querySelectorAll("[data-admin-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const redirect = form.dataset.redirect || "dashboard.html";
      window.location.href = `${redirect}?saved=1`;
    });
  });
}

function initStatusToggle() {
  document.querySelectorAll("[data-status-group]").forEach((group) => {
    const options = group.querySelectorAll("[data-status-option]");

    const activate = (target) => {
      options.forEach((btn) => {
        const activeClasses = (btn.dataset.statusActiveClass || "bg-primary text-onPrimary").split(" ");
        btn.classList.remove(...activeClasses);
        btn.classList.add("text-text-muted");
      });
      const activeClasses = (target.dataset.statusActiveClass || "bg-primary text-onPrimary").split(" ");
      target.classList.remove("text-text-muted");
      target.classList.add(...activeClasses);
    };

    options.forEach((btn) => btn.addEventListener("click", () => activate(btn)));
  });
}

function initListManager() {
  // Lista repetible genérica (temario de un curso, etc.). No sabe nada
  // del contenido de cada fila: el markup vive en el <template> de cada
  // página, este script solo clona y quita filas.
  document.querySelectorAll("[data-list-manager]").forEach((wrapper) => {
    const items = wrapper.querySelector("[data-list-items]");
    const template = wrapper.querySelector("[data-list-template]");
    const addBtn = wrapper.querySelector("[data-list-add]");
    if (!items) return;

    items.addEventListener("click", (event) => {
      const removeBtn = event.target.closest("[data-list-remove]");
      if (removeBtn) removeBtn.closest("[data-list-item]")?.remove();
    });

    addBtn?.addEventListener("click", () => {
      if (!template) return;
      items.appendChild(template.content.cloneNode(true));
    });
  });
}

function initInlineAdd() {
  // Catálogos de un solo campo (ciclos, periodos académicos, aulas):
  // [data-inline-add] envuelve un input + botón "Agregar" que inserta
  // una fila nueva directo en [data-admin-table], sin ir a otra página.
  document.querySelectorAll("[data-inline-add]").forEach((wrapper) => {
    const input = wrapper.querySelector("[data-inline-add-input]");
    const button = wrapper.querySelector("[data-inline-add-button]");
    const table = document.querySelector("[data-admin-table]");
    const rowTemplate = document.querySelector("[data-inline-row-template]");
    if (!input || !button || !table || !rowTemplate) return;

    const addRow = () => {
      const value = input.value.trim();
      if (!value) return;

      const fragment = rowTemplate.content.cloneNode(true);
      const row = fragment.querySelector("[data-row]");
      row.dataset.search = value.toLowerCase();
      const nameCell = row.querySelector("[data-inline-row-value]");
      if (nameCell) nameCell.textContent = value;

      const emptyRow = table.querySelector("[data-empty-row]");
      table.querySelector("tbody").insertBefore(row, emptyRow);
      emptyRow?.classList.add("hidden");

      input.value = "";
      input.focus();
      document.dispatchEvent(new CustomEvent("admin:toast", { detail: { message: "Agregado correctamente" } }));
    };

    button.addEventListener("click", addRow);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addRow();
      }
    });
  });
}
