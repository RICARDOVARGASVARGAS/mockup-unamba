/**
 * bolsa-trabajo.js — filtro por tipo + vigencia dinámica de
 * pages/bolsa-trabajo.html. La vigencia se calcula contra la fecha de hoy
 * del navegador (Oferta.fecha_vigencia), mismo criterio que ya usamos en
 * comunicados.js para las convocatorias con plazo.
 */
(function () {
  const list = document.querySelector("[data-ofertas-list]");
  if (!list) return;

  const items = Array.from(list.querySelectorAll("[data-oferta-item]"));
  const chips = Array.from(document.querySelectorAll("[data-oferta-filter]"));
  const emptyState = document.querySelector("[data-ofertas-empty]");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  items.forEach((item) => {
    const slot = item.querySelector("[data-oferta-vigencia]");
    if (!slot || !item.dataset.vigencia) return;

    const target = new Date(`${item.dataset.vigencia}T00:00:00`);
    const diffDays = Math.round((target - today) / 86400000);
    const label = target.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });

    if (diffDays < 0) {
      slot.textContent = "Oferta vencida";
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
    items.forEach((item) => {
      const visible = currentFilter === "todos" || item.dataset.tipo === currentFilter;
      item.classList.toggle("hidden", !visible);
      if (visible) visibleCount += 1;
    });
    emptyState.classList.toggle("hidden", visibleCount > 0);
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      currentFilter = chip.dataset.ofertaFilter;

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
