/**
 * ciclos-periodos.js — interacción de pages/admin/ciclos-periodos.html.
 *
 * Sin backend: los datos viven solo en memoria/DOM de esta página, se
 * resetean al recargar (igual que el resto del mockup). El objetivo es
 * que la demo se sienta real: crear/editar/eliminar sí actualiza las
 * tablas en pantalla.
 *
 * Iconos de acción (editar/eliminar) reutilizados tal cual en las
 * próximas pantallas de catálogo — mismo patrón data-row / data-delete-trigger
 * que ya consume components/app-modal-confirm.js.
 */

const ICON_EDIT =
  '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>';
const ICON_DELETE =
  '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>';

const SEED_CICLOS = Array.from({ length: 10 }, (_, i) => ({
  id: `ciclo-${i + 1}`,
  numero: i + 1,
  nombre: `${i + 1}° ciclo`,
}));

const SEED_PERIODOS = [
  { id: "periodo-2025-2", nombre: "2025-II", inicio: "2025-08-01", fin: "2025-12-15", activo: false },
  { id: "periodo-2026-1", nombre: "2026-I", inicio: "2026-03-01", fin: "2026-07-15", activo: true },
];

function actionButtons({ id, nombre, editAttrs }) {
  return `
    <div class="flex justify-end gap-1">
      <button type="button" data-row-edit ${editAttrs} data-row-id="${id}" aria-label="Editar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-2 hover:text-primary">${ICON_EDIT}</button>
      <button type="button" data-delete-trigger data-delete-name="${nombre}" aria-label="Eliminar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-danger-bg hover:text-danger">${ICON_DELETE}</button>
    </div>`;
}

function renderCicloRow(ciclo) {
  const tr = document.createElement("tr");
  tr.dataset.row = "true";
  tr.dataset.id = ciclo.id;
  tr.innerHTML = `
    <td class="px-4 py-3 font-medium text-text" data-cell="numero">${ciclo.numero}°</td>
    <td class="px-4 py-3 text-text" data-cell="nombre">${ciclo.nombre}</td>
    <td class="px-4 py-3">${actionButtons({ id: ciclo.id, nombre: ciclo.nombre, editAttrs: 'data-edit-kind="ciclo"' })}</td>
  `;
  return tr;
}

function renderPeriodoRow(periodo) {
  const tr = document.createElement("tr");
  tr.dataset.row = "true";
  tr.dataset.id = periodo.id;
  tr.innerHTML = `
    <td class="px-4 py-3 font-medium text-text" data-cell="nombre">${periodo.nombre}</td>
    <td class="px-4 py-3 text-text-muted" data-cell="inicio">${periodo.inicio || "—"}</td>
    <td class="px-4 py-3 text-text-muted" data-cell="fin">${periodo.fin || "—"}</td>
    <td class="px-4 py-3" data-cell="estado">
      ${
        periodo.activo
          ? '<span class="badge badge-success">Vigente</span>'
          : '<button type="button" data-set-vigente class="badge badge-neutral transition hover:bg-primary/10 hover:text-primary">Marcar vigente</button>'
      }
    </td>
    <td class="px-4 py-3">${actionButtons({ id: periodo.id, nombre: periodo.nombre, editAttrs: 'data-edit-kind="periodo"' })}</td>
  `;
  return tr;
}

document.addEventListener("DOMContentLoaded", () => {
  const ciclosBody = document.querySelector("[data-ciclos-body]");
  const periodosBody = document.querySelector("[data-periodos-body]");

  SEED_CICLOS.forEach((c) => ciclosBody.appendChild(renderCicloRow(c)));
  SEED_PERIODOS.forEach((p) => periodosBody.appendChild(renderPeriodoRow(p)));

  const toast = (message) => document.dispatchEvent(new CustomEvent("app:toast", { detail: { message } }));

  /* ----- Modal Ciclo ----- */
  const cicloBackdrop = document.querySelector("[data-ciclo-modal-backdrop]");
  const cicloForm = document.querySelector("[data-ciclo-form]");
  const cicloTitle = document.querySelector("[data-ciclo-modal-title]");
  const cicloEditingId = document.querySelector("[data-ciclo-editing-id]");
  const cicloNumero = document.getElementById("ciclo-numero");
  const cicloNombre = document.getElementById("ciclo-nombre");

  function openCicloModal(row) {
    if (row) {
      cicloTitle.textContent = "Editar ciclo";
      cicloEditingId.value = row.dataset.id;
      cicloNumero.value = row.querySelector('[data-cell="numero"]').textContent.replace("°", "");
      cicloNombre.value = row.querySelector('[data-cell="nombre"]').textContent;
    } else {
      cicloTitle.textContent = "Nuevo ciclo";
      cicloEditingId.value = "";
      cicloForm.reset();
    }
    cicloBackdrop.classList.remove("hidden");
    cicloBackdrop.classList.add("flex");
  }

  function closeCicloModal() {
    cicloBackdrop.classList.add("hidden");
    cicloBackdrop.classList.remove("flex");
  }

  document.querySelector("[data-open-ciclo-modal]").addEventListener("click", () => openCicloModal(null));
  document.querySelector("[data-ciclo-cancel]").addEventListener("click", closeCicloModal);
  cicloBackdrop.addEventListener("click", (e) => { if (e.target === cicloBackdrop) closeCicloModal(); });

  cicloForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const numero = Number(cicloNumero.value);
    const nombre = cicloNombre.value.trim();
    if (!numero || !nombre) return;

    const editingId = cicloEditingId.value;
    if (editingId) {
      const row = ciclosBody.querySelector(`[data-id="${editingId}"]`);
      row.querySelector('[data-cell="numero"]').textContent = `${numero}°`;
      row.querySelector('[data-cell="nombre"]').textContent = nombre;
      row.querySelectorAll("[data-delete-trigger]").forEach((btn) => (btn.dataset.deleteName = nombre));
      toast("Ciclo actualizado");
    } else {
      const newRow = renderCicloRow({ id: `ciclo-${Date.now()}`, numero, nombre });
      ciclosBody.appendChild(newRow);
      toast("Ciclo creado");
    }
    closeCicloModal();
  });

  /* ----- Modal Periodo académico ----- */
  const periodoBackdrop = document.querySelector("[data-periodo-modal-backdrop]");
  const periodoForm = document.querySelector("[data-periodo-form]");
  const periodoTitle = document.querySelector("[data-periodo-modal-title]");
  const periodoEditingId = document.querySelector("[data-periodo-editing-id]");
  const periodoNombre = document.getElementById("periodo-nombre");
  const periodoInicio = document.getElementById("periodo-inicio");
  const periodoFin = document.getElementById("periodo-fin");
  const periodoActivo = document.getElementById("periodo-activo");

  function openPeriodoModal(row) {
    if (row) {
      periodoTitle.textContent = "Editar periodo académico";
      periodoEditingId.value = row.dataset.id;
      periodoNombre.value = row.querySelector('[data-cell="nombre"]').textContent;
      periodoInicio.value = row.querySelector('[data-cell="inicio"]').textContent.trim();
      periodoFin.value = row.querySelector('[data-cell="fin"]').textContent.trim();
      periodoActivo.checked = !!row.querySelector('[data-cell="estado"] .badge-success');
    } else {
      periodoTitle.textContent = "Nuevo periodo académico";
      periodoEditingId.value = "";
      periodoForm.reset();
    }
    periodoBackdrop.classList.remove("hidden");
    periodoBackdrop.classList.add("flex");
  }

  function closePeriodoModal() {
    periodoBackdrop.classList.add("hidden");
    periodoBackdrop.classList.remove("flex");
  }

  function marcarVigente(row) {
    periodosBody.querySelectorAll("[data-row]").forEach((r) => {
      const estadoCell = r.querySelector('[data-cell="estado"]');
      const isTarget = r === row;
      estadoCell.innerHTML = isTarget
        ? '<span class="badge badge-success">Vigente</span>'
        : '<button type="button" data-set-vigente class="badge badge-neutral transition hover:bg-primary/10 hover:text-primary">Marcar vigente</button>';
    });
  }

  document.querySelector("[data-open-periodo-modal]").addEventListener("click", () => openPeriodoModal(null));
  document.querySelector("[data-periodo-cancel]").addEventListener("click", closePeriodoModal);
  periodoBackdrop.addEventListener("click", (e) => { if (e.target === periodoBackdrop) closePeriodoModal(); });

  periodoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const nombre = periodoNombre.value.trim();
    if (!nombre) return;
    const data = { nombre, inicio: periodoInicio.value, fin: periodoFin.value, activo: periodoActivo.checked };

    const editingId = periodoEditingId.value;
    let row;
    if (editingId) {
      row = periodosBody.querySelector(`[data-id="${editingId}"]`);
      row.querySelector('[data-cell="nombre"]').textContent = data.nombre;
      row.querySelector('[data-cell="inicio"]').textContent = data.inicio || "—";
      row.querySelector('[data-cell="fin"]').textContent = data.fin || "—";
      row.querySelectorAll("[data-delete-trigger]").forEach((btn) => (btn.dataset.deleteName = data.nombre));
      toast("Periodo académico actualizado");
    } else {
      row = renderPeriodoRow({ id: `periodo-${Date.now()}`, ...data, activo: false });
      periodosBody.appendChild(row);
      toast("Periodo académico creado");
    }
    if (data.activo) marcarVigente(row);
    closePeriodoModal();
  });

  /* ----- Delegación: editar fila y marcar vigente ----- */
  document.addEventListener("click", (event) => {
    const editBtn = event.target.closest("[data-row-edit]");
    if (editBtn) {
      const row = editBtn.closest("[data-row]");
      if (editBtn.dataset.editKind === "ciclo") openCicloModal(row);
      if (editBtn.dataset.editKind === "periodo") openPeriodoModal(row);
      return;
    }
    const vigenteBtn = event.target.closest("[data-set-vigente]");
    if (vigenteBtn) {
      marcarVigente(vigenteBtn.closest("[data-row]"));
      toast("Periodo marcado como vigente");
    }
  });
});
