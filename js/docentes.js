/**
 * docentes.js — filtro por sede y categoría de pages/docentes.html.
 * Los dos filtros son independientes y se combinan con AND: si eliges
 * "Abancay" + "Principal", solo se ven los docentes que cumplen ambos.
 *
 * Los filtros son <details>/<summary> (mismo patrón de menú desplegable
 * que ya usa components/header.js): al elegir una opción se actualiza la
 * etiqueta del botón, se cierra el desplegable y se filtra la grilla.
 */
(function () {
  const grid = document.querySelector("[data-docentes-grid]");
  if (!grid) return;

  const items = Array.from(grid.querySelectorAll("[data-docente-item]"));
  const emptyState = document.querySelector("[data-docentes-empty]");
  const dropdowns = Array.from(document.querySelectorAll("[data-docente-dropdown]"));

  let currentSede = "todos";
  let currentCategoria = "todos";

  function render() {
    let visibleCount = 0;
    items.forEach((item) => {
      const matchesSede = currentSede === "todos" || item.dataset.sede === currentSede;
      const matchesCategoria = currentCategoria === "todos" || item.dataset.categoria === currentCategoria;
      const visible = matchesSede && matchesCategoria;
      item.classList.toggle("hidden", !visible);
      if (visible) visibleCount += 1;
    });
    emptyState.classList.toggle("hidden", visibleCount > 0);
  }

  dropdowns.forEach((dropdown) => {
    const label = dropdown.querySelector("[data-docente-dropdown-label]");
    const options = Array.from(dropdown.querySelectorAll("button[data-docente-filter-sede], button[data-docente-filter-categoria]"));

    // Cierra los demás desplegables al abrir uno (mismo criterio que el header)
    dropdown.addEventListener("toggle", () => {
      if (dropdown.open) {
        dropdowns.forEach((other) => {
          if (other !== dropdown) other.open = false;
        });
      }
    });

    options.forEach((option) => {
      option.addEventListener("click", () => {
        options.forEach((other) => other.setAttribute("aria-selected", String(other === option)));
        label.textContent = option.dataset.label;
        dropdown.open = false;

        if (option.dataset.docenteFilterSede) currentSede = option.dataset.docenteFilterSede;
        if (option.dataset.docenteFilterCategoria) currentCategoria = option.dataset.docenteFilterCategoria;
        render();
      });
    });
  });

  document.addEventListener("click", (event) => {
    dropdowns.forEach((dropdown) => {
      if (!dropdown.contains(event.target)) dropdown.open = false;
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") dropdowns.forEach((dropdown) => (dropdown.open = false));
  });

  render();
})();
