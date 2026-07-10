/**
 * galeria.js — filtro por categoría de álbum en pages/galeria.html.
 * Cada álbum es un <details>; filtrar solo alterna "hidden" en el
 * elemento, no interfiere con su propio abrir/cerrar nativo.
 */
(function () {
  const grid = document.querySelector("[data-albums-grid]");
  if (!grid) return;

  const items = Array.from(grid.querySelectorAll("[data-album-item]"));
  const chips = Array.from(document.querySelectorAll("[data-album-filter]"));
  const emptyState = document.querySelector("[data-albums-empty]");

  let currentFilter = "todos";

  function render() {
    let visibleCount = 0;
    items.forEach((item) => {
      const visible = currentFilter === "todos" || item.dataset.categoria === currentFilter;
      item.classList.toggle("hidden", !visible);
      if (visible) visibleCount += 1;
    });
    emptyState.classList.toggle("hidden", visibleCount > 0);
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      currentFilter = chip.dataset.albumFilter;

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
