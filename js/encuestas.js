/**
 * encuestas.js — filtro por audiencia + vigencia dinámica de
 * pages/encuestas.html. Mismo patrón que bolsa-trabajo.js: la vigencia se
 * calcula contra la fecha de hoy del navegador (Encuesta.fecha_vigencia).
 * El bloque de "Seguimiento al egresado" tiene su propio [data-encuesta-item]
 * pero no participa del filtro (vive fuera de [data-encuestas-list]).
 */
(function () {
  const list = document.querySelector("[data-encuestas-list]");
  if (!list) return;

  const filterableItems = Array.from(list.querySelectorAll("[data-encuesta-item]"));
  const allItems = Array.from(document.querySelectorAll("[data-encuesta-item]"));
  const chips = Array.from(document.querySelectorAll("[data-encuesta-filter]"));
  const emptyState = document.querySelector("[data-encuestas-empty]");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  allItems.forEach((item) => {
    const slot = item.querySelector("[data-encuesta-vigencia]");
    if (!slot || !item.dataset.vigencia) return;

    const target = new Date(`${item.dataset.vigencia}T00:00:00`);
    const diffDays = Math.round((target - today) / 86400000);
    const label = target.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });

    if (diffDays < 0) {
      slot.textContent = "Encuesta cerrada";
      slot.className = "text-xs font-semibold text-text-muted";
    } else if (diffDays <= 10) {
      slot.textContent = diffDays === 0 ? "Cierra hoy" : `Cierra en ${diffDays} día${diffDays === 1 ? "" : "s"}`;
      slot.className = "text-xs font-semibold text-warning";
    } else {
      slot.textContent = `Vigente hasta: ${label}`;
      slot.className = "text-xs font-medium text-text-muted";
    }
  });

  let currentFilter = "todos";

  function render() {
    let visibleCount = 0;
    filterableItems.forEach((item) => {
      const visible = currentFilter === "todos" || item.dataset.audiencia === currentFilter;
      item.classList.toggle("hidden", !visible);
      if (visible) visibleCount += 1;
    });
    emptyState.classList.toggle("hidden", visibleCount > 0);
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      currentFilter = chip.dataset.encuestaFilter;

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
