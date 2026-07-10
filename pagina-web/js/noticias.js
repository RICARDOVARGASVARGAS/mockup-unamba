/**
 * noticias.js — filtro por categoría + paginación de pages/noticias.html.
 *
 * Todo corre sobre los <article data-news-item> ya presentes en el HTML
 * (datos de ejemplo estáticos): no hay backend, solo mostrar/ocultar y
 * paginar en el navegador. Página específica, no un componente global.
 */
(function () {
  const grid = document.querySelector("[data-news-grid]");
  if (!grid) return;

  const items = Array.from(grid.querySelectorAll("[data-news-item]"));
  const chips = Array.from(document.querySelectorAll("[data-news-filter]"));
  const pagination = document.querySelector("[data-news-pagination]");
  const perPage = 6;

  let currentFilter = "todas";
  let currentPage = 1;

  function filteredItems() {
    return items.filter((item) => currentFilter === "todas" || item.dataset.category === currentFilter);
  }

  function render() {
    const filtered = filteredItems();
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    currentPage = Math.min(currentPage, totalPages);
    const visible = new Set(filtered.slice((currentPage - 1) * perPage, currentPage * perPage));

    items.forEach((item) => item.classList.toggle("hidden", !visible.has(item)));
    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    pagination.innerHTML = "";
    if (totalPages <= 1) return;

    const makeButton = (label, page, { active = false, disabled = false } = {}) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = label;
      btn.disabled = disabled;
      btn.className = active
        ? "h-9 min-w-9 rounded-md bg-primary px-3 text-sm font-semibold text-onPrimary"
        : "h-9 min-w-9 rounded-md border border-border px-3 text-sm font-medium text-text transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border";
      btn.addEventListener("click", () => {
        currentPage = page;
        render();
        grid.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return btn;
    };

    pagination.appendChild(makeButton("‹ Anterior", currentPage - 1, { disabled: currentPage === 1 }));
    for (let page = 1; page <= totalPages; page += 1) {
      pagination.appendChild(makeButton(String(page), page, { active: page === currentPage }));
    }
    pagination.appendChild(makeButton("Siguiente ›", currentPage + 1, { disabled: currentPage === totalPages }));
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      currentFilter = chip.dataset.newsFilter;
      currentPage = 1;

      chips.forEach((other) => {
        const active = other === chip;
        other.classList.toggle("bg-primary", active);
        other.classList.toggle("text-onPrimary", active);
        other.classList.toggle("border-primary", active);
        other.classList.toggle("border-border", !active);
        other.classList.toggle("text-text", !active);
        other.setAttribute("aria-pressed", String(active));
      });

      render();
    });
  });

  render();
})();
