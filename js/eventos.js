/**
 * eventos.js — separación Próximos/Pasados de pages/eventos.html.
 *
 * "Automática" de verdad: compara [data-date] (ISO) de cada evento contra
 * la fecha de hoy en el navegador, no una etiqueta puesta a mano. Corrige
 * el problema del sitio anterior ("presente año académico" sin fecha).
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

  function render(status) {
    let visibleCount = 0;
    items.forEach((item) => {
      const visible = item.dataset.status === status;
      item.classList.toggle("hidden", !visible);
      if (visible) visibleCount += 1;
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
