/**
 * documentos.js — buscador + filtros (año, semestre, sede) de
 * pages/documentos.html. Los documentos están agrupados por tipo en el
 * HTML (Reglamentos, Sílabos...); un grupo entero se oculta si ninguno de
 * sus documentos pasa la búsqueda + filtros activos.
 */
(function () {
  const groupsContainer = document.querySelector("[data-doc-groups]");
  if (!groupsContainer) return;

  const groups = Array.from(groupsContainer.querySelectorAll("[data-doc-group]"));
  const items = Array.from(groupsContainer.querySelectorAll("[data-doc-item]"));
  const emptyState = document.querySelector("[data-doc-empty]");
  const searchInput = document.querySelector("[data-doc-search]");
  const dropdowns = Array.from(document.querySelectorAll("[data-doc-dropdown]"));

  let currentSearch = "";
  let currentAnio = "todos";
  let currentSemestre = "todos";
  let currentSede = "todos";

  function render() {
    let anyVisibleItem = false;

    groups.forEach((group) => {
      let groupHasVisible = false;

      group.querySelectorAll("[data-doc-item]").forEach((item) => {
        const matchesSearch = !currentSearch || item.dataset.nombre.includes(currentSearch);
        const matchesAnio = currentAnio === "todos" || item.dataset.anio === currentAnio;
        const matchesSemestre = currentSemestre === "todos" || item.dataset.semestre === currentSemestre;
        const matchesSede = currentSede === "todos" || item.dataset.sede === currentSede;
        const visible = matchesSearch && matchesAnio && matchesSemestre && matchesSede;
        item.classList.toggle("hidden", !visible);
        if (visible) groupHasVisible = true;
      });

      group.classList.toggle("hidden", !groupHasVisible);
      if (groupHasVisible) anyVisibleItem = true;
    });

    emptyState.classList.toggle("hidden", anyVisibleItem);
  }

  searchInput.addEventListener("input", () => {
    currentSearch = searchInput.value.trim().toLowerCase();
    render();
  });

  dropdowns.forEach((dropdown) => {
    const label = dropdown.querySelector("[data-doc-dropdown-label]");
    const options = Array.from(
      dropdown.querySelectorAll("button[data-doc-filter-anio], button[data-doc-filter-semestre], button[data-doc-filter-sede]")
    );

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

        if (option.dataset.docFilterAnio) currentAnio = option.dataset.docFilterAnio;
        if (option.dataset.docFilterSemestre) currentSemestre = option.dataset.docFilterSemestre;
        if (option.dataset.docFilterSede) currentSede = option.dataset.docFilterSede;
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
