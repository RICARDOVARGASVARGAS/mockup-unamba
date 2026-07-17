/**
 * eventos.js — separación Próximos/Pasados de pages/eventos.html.
 *
 * "Automática" de verdad: compara [data-date] (ISO) de cada evento contra
 * la fecha de hoy en el navegador, no una etiqueta puesta a mano. Corrige
 * el problema del sitio anterior ("presente año académico" sin fecha).
 * También agrupa visualmente por mes (separadores insertados en cada
 * render, ya que el grupo cambia según la pestaña activa).
 */
(function () {
  const timeline = document.querySelector("[data-events-timeline]");
  if (!timeline) return;

  const items = Array.from(timeline.querySelectorAll("[data-event-item]"));
  const tabs = Array.from(document.querySelectorAll("[data-event-tab]"));
  const emptyState = document.querySelector("[data-events-empty]");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  items.forEach((item) => {
    const eventDate = new Date(`${item.dataset.date}T00:00:00`);
    item.dataset.status = eventDate >= today ? "proximo" : "pasado";
  });

  function monthLabel(dateStr) {
    const label = new Date(`${dateStr}T00:00:00`).toLocaleDateString("es-PE", {
      month: "long",
      year: "numeric",
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  function clearDividers() {
    timeline.querySelectorAll("[data-month-divider]").forEach((el) => el.remove());
  }

  function render(status) {
    clearDividers();
    let visibleCount = 0;
    let lastMonthKey = null;
    items.forEach((item) => {
      const visible = item.dataset.status === status;
      item.classList.toggle("hidden", !visible);
      if (!visible) return;
      visibleCount += 1;

      const monthKey = item.dataset.date.slice(0, 7);
      if (monthKey !== lastMonthKey) {
        const divider = document.createElement("li");
        divider.dataset.monthDivider = "";
        divider.className = "pt-1 first:pt-0";
        divider.innerHTML = `<p class="label-kicker text-text-muted">${monthLabel(item.dataset.date)}</p>`;
        timeline.insertBefore(divider, item);
        lastMonthKey = monthKey;
      }
    });
    emptyState.classList.toggle("hidden", visibleCount > 0);
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((other) => {
        const active = other === tab;
        other.setAttribute("aria-selected", String(active));
        other.classList.toggle("bg-primary", active);
        other.classList.toggle("text-onPrimary", active);
        other.classList.toggle("text-text-muted", !active);
      });
      render(tab.dataset.eventTab);
    });
  });

  render("proximo");
})();
