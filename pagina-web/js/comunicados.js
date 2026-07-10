/**
 * comunicados.js — filtro por tipo + "cargar más" agrupado por mes,
 * de pages/comunicados.html. Datos de ejemplo estáticos, sin backend.
 *
 * También resuelve el estado de las convocatorias con plazo (Comunicado.fecha_vencimiento):
 * compara contra la fecha de hoy del navegador, igual que hace eventos.js con
 * "próximo/pasado" — nada de etiquetas puestas a mano.
 */
(function () {
  const list = document.querySelector("[data-comm-list]");
  if (!list) return;

  const groups = Array.from(list.querySelectorAll("[data-comm-group]"));
  const chips = Array.from(document.querySelectorAll("[data-comm-filter]"));
  const loadMoreBtn = document.querySelector("[data-comm-load-more]");
  const emptyState = document.querySelector("[data-comm-empty]");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  document.querySelectorAll("[data-vencimiento]").forEach((item) => {
    const slot = item.querySelector("[data-comm-vencimiento]");
    if (!slot) return;

    const target = new Date(`${item.dataset.vencimiento}T00:00:00`);
    const diffDays = Math.round((target - today) / 86400000);

    if (diffDays < 0) {
      slot.textContent = "Convocatoria cerrada";
      slot.className = "font-semibold text-text-muted";
    } else if (diffDays <= 14) {
      slot.textContent = diffDays === 0 ? "Cierra hoy" : `Cierra en ${diffDays} día${diffDays === 1 ? "" : "s"}`;
      slot.className = "font-semibold text-warning";
    } else {
      const label = target.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
      slot.textContent = `Vence: ${label}`;
    }
  });

  let currentFilter = "todos";

  function render() {
    let anyVisibleItem = false;

    groups.forEach((group) => {
      const revealed = group.dataset.revealed === "true";
      group.classList.toggle("hidden", !revealed);
      if (!revealed) return;

      let groupHasVisible = false;
      group.querySelectorAll("[data-comm-item]").forEach((item) => {
        const visible = currentFilter === "todos" || item.dataset.category === currentFilter;
        item.classList.toggle("hidden", !visible);
        if (visible) groupHasVisible = true;
      });
      group.classList.toggle("hidden", !groupHasVisible);
      if (groupHasVisible) anyVisibleItem = true;
    });

    emptyState.classList.toggle("hidden", anyVisibleItem);

    const hasMoreGroups = groups.some((group) => group.dataset.revealed !== "true");
    loadMoreBtn.classList.toggle("hidden", !hasMoreGroups);
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      currentFilter = chip.dataset.commFilter;

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

  loadMoreBtn.addEventListener("click", () => {
    const next = groups.find((group) => group.dataset.revealed !== "true");
    if (next) next.dataset.revealed = "true";
    render();
  });

  render();
})();
