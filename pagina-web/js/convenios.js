/**
 * convenios.js — filtro por tipo + vigencia dinámica de pages/convenios.html.
 * "Vigente"/"Convenio vencido" se calcula de Convenio.fecha_fin contra la
 * fecha de hoy del navegador (fecha_fin vacía = vigencia indefinida), mismo
 * criterio que ya usamos en Autoridad y Comite. Nada de esto se hardcodea.
 */
(function () {
  const grid = document.querySelector("[data-convenios-grid]");
  if (!grid) return;

  const items = Array.from(grid.querySelectorAll("[data-convenio-item]"));
  const chips = Array.from(document.querySelectorAll("[data-convenio-filter]"));
  const emptyState = document.querySelector("[data-convenios-empty]");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  items.forEach((item) => {
    const slot = item.querySelector("[data-convenio-vigencia]");
    const inicio = item.dataset.fechaInicio;
    const fin = item.dataset.fechaFin;
    if (!slot) return;

    if (!fin) {
      slot.textContent = `Vigente desde ${inicio} · sin fecha de término`;
      return;
    }

    const finDate = new Date(`${fin}T00:00:00`);
    const finAnio = finDate.getFullYear();

    if (finDate < today) {
      slot.textContent = `Convenio vencido: ${inicio} – ${finAnio}`;
      item.classList.add("opacity-70");
    } else {
      slot.textContent = `Vigente: ${inicio} – ${finAnio}`;
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
      currentFilter = chip.dataset.convenioFilter;

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
