/**
 * avanzar-estudiantes.js — flujo de 2 pasos para avanzar estudiantes (M2-6).
 * Paso 1: tabla editable con ciclo destino y tutor propuesto.
 * Paso 2: resumen de incluidos/excluidos + confirmación.
 */
(function () {
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const toast = (msg, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message: msg, type } }));

  let rows = [];
  let paso = 1;

  /* ------------------------------------------------------------------ */
  /* Helpers                                                              */
  /* ------------------------------------------------------------------ */

  function getBasePath() {
    return typeof window.getBasePath === "function" ? window.getBasePath() : "../../";
  }

  function docentesParaCiclo(cicloId) {
    return AvanzarData.DOCENTES_DESTINO[cicloId] || [];
  }

  /* ------------------------------------------------------------------ */
  /* Render balance                                                       */
  /* ------------------------------------------------------------------ */

  function renderBalance() {
    const container = document.getElementById("balance-avanzar");
    const balance = AvanzarData.calcBalance(rows);
    container.innerHTML = balance.map((b) => `
      <div class="flex items-center gap-2 rounded-full border border-border bg-bg px-3 py-1.5">
        <span class="text-sm font-medium text-text">${esc(b.abrev)}</span>
        <span class="text-xs text-text-muted">(${esc(b.ciclo)})</span>
        <span class="badge badge-neutral">${b.n} tutorado${b.n !== 1 ? "s" : ""}</span>
      </div>`).join("");
  }

  /* ------------------------------------------------------------------ */
  /* Render tabla propuesta (Paso 1)                                      */
  /* ------------------------------------------------------------------ */

  function renderPropuesta() {
    const tbody = document.getElementById("tbody-propuesta");
    const incluidos = rows.filter((r) => r.incluir).length;
    document.getElementById("propuesta-resumen").textContent =
      `${rows.length} estudiantes del período 2025-II · ${incluidos} incluidos para avanzar`;

    const btnConfirmar = document.getElementById("btn-confirmar-avance");
    btnConfirmar.disabled = incluidos === 0;

    tbody.innerHTML = rows.map((row, i) => {
      const docentes = docentesParaCiclo(row.ciclo_destino_id);
      const docentesOpts = docentes
        .map((d) => `<option value="${esc(d.id)}" ${d.id === row.docente_destino_id ? "selected" : ""}>${esc(d.nombre)}</option>`)
        .join("");

      const ciclosOpts = AvanzarData.CICLOS
        .map((c) => `<option value="${esc(c.id)}" ${c.id === row.ciclo_destino_id ? "selected" : ""}>${esc(c.nombre)}</option>`)
        .join("");

      return `
      <tr class="${row.incluir ? "" : "opacity-50"}">
        <td class="text-center">
          <input type="checkbox" data-row-check="${i}" ${row.incluir ? "checked" : ""} class="h-4 w-4 rounded border-border text-primary" />
        </td>
        <td>
          <div class="font-medium text-text leading-snug">${esc(AvanzarData.nombreCompleto(row))}</div>
          <div class="text-xs text-text-muted">${esc(row.codigo_universitario)}</div>
        </td>
        <td class="text-text-muted">${esc(AvanzarData.cicloNombre(row.ciclo_origen_id))}</td>
        <td>
          <select data-ciclo-sel="${i}" class="form-input py-1 text-sm min-w-[8rem]">
            ${ciclosOpts}
          </select>
        </td>
        <td>
          <select data-docente-sel="${i}" class="form-input py-1 text-sm min-w-[12rem]" ${!docentes.length ? "disabled" : ""}>
            ${docentesOpts || "<option>Sin tutor disponible</option>"}
          </select>
        </td>
      </tr>`;
    }).join("");

    /* Bind checkboxes */
    tbody.querySelectorAll("[data-row-check]").forEach((cb) => {
      cb.addEventListener("change", () => {
        const i = parseInt(cb.dataset.rowCheck, 10);
        rows[i].incluir = cb.checked;
        AvanzarData.save(rows);
        renderBalance();
        renderPropuesta();
      });
    });

    /* Bind ciclo selects */
    tbody.querySelectorAll("[data-ciclo-sel]").forEach((sel) => {
      sel.addEventListener("change", () => {
        const i = parseInt(sel.dataset.cicloSel, 10);
        rows[i].ciclo_destino_id = sel.value;
        rows[i].docente_destino_id = AvanzarData.docenteDefault(sel.value);
        AvanzarData.save(rows);
        renderBalance();
        renderPropuesta();
      });
    });

    /* Bind docente selects */
    tbody.querySelectorAll("[data-docente-sel]").forEach((sel) => {
      sel.addEventListener("change", () => {
        const i = parseInt(sel.dataset.docenteSel, 10);
        rows[i].docente_destino_id = sel.value;
        AvanzarData.save(rows);
        renderBalance();
      });
    });

    /* Checkbox "Seleccionar todos" */
    updateCheckTodos();
  }

  function updateCheckTodos() {
    const chk = document.getElementById("check-todos");
    const total    = rows.length;
    const incluidos = rows.filter((r) => r.incluir).length;
    chk.checked       = incluidos === total;
    chk.indeterminate = incluidos > 0 && incluidos < total;
  }

  /* ------------------------------------------------------------------ */
  /* Paso 2 — Confirmación                                                */
  /* ------------------------------------------------------------------ */

  function irAPaso2() {
    const incluidos = rows.filter((r) => r.incluir);
    const excluidos = rows.filter((r) => !r.incluir);
    const destino   = document.getElementById("sel-destino");
    const destinoNombre = destino.options[destino.selectedIndex]?.text || "2026-I";

    document.getElementById("confirmacion-resumen").textContent =
      `Se matricularán ${incluidos.length} estudiantes en el período ${destinoNombre}.`;

    const listaInc = document.getElementById("lista-incluidos");
    listaInc.innerHTML = incluidos.map((r) => `
      <div class="flex items-center justify-between gap-2 py-1 text-sm">
        <span class="font-medium text-text">${esc(AvanzarData.nombreCompleto(r))}</span>
        <span class="text-xs text-text-muted shrink-0">${esc(AvanzarData.cicloNombre(r.ciclo_destino_id))}</span>
      </div>`).join("") || `<p class="text-sm text-text-muted italic">Ninguno.</p>`;

    const excSec = document.getElementById("excluidos-section");
    if (excluidos.length) {
      excSec.classList.remove("hidden");
      document.getElementById("lista-excluidos").innerHTML = excluidos.map((r) => `
        <div class="flex items-center justify-between gap-2 py-1 text-sm">
          <span class="text-text">${esc(AvanzarData.nombreCompleto(r))}</span>
          <span class="text-xs text-text-muted shrink-0">Excluido</span>
        </div>`).join("");
    } else {
      excSec.classList.add("hidden");
    }

    paso = 2;
    document.getElementById("paso-1").classList.add("hidden");
    document.getElementById("paso-2").classList.remove("hidden");

    /* Stepper visual */
    document.getElementById("step-2-badge").classList.remove("bg-border", "text-text-muted");
    document.getElementById("step-2-badge").classList.add("bg-primary", "text-white");
    document.getElementById("step-2-label").classList.remove("text-text-muted");
    document.getElementById("step-2-label").classList.add("text-primary");
  }

  function volverPaso1() {
    paso = 1;
    document.getElementById("paso-2").classList.add("hidden");
    document.getElementById("paso-1").classList.remove("hidden");
    document.getElementById("step-2-badge").classList.remove("bg-primary", "text-white");
    document.getElementById("step-2-badge").classList.add("bg-border", "text-text-muted");
    document.getElementById("step-2-label").classList.remove("text-primary");
    document.getElementById("step-2-label").classList.add("text-text-muted");
  }

  /* ------------------------------------------------------------------ */
  /* Init                                                                 */
  /* ------------------------------------------------------------------ */

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.AvanzarData) return;

    rows = AvanzarData.load();

    /* Selects de períodos */
    const selOrigen  = document.getElementById("sel-origen");
    const selDestino = document.getElementById("sel-destino");
    AvanzarData.PERIODOS.forEach((p, i) => {
      selOrigen.innerHTML  += `<option value="${esc(p.id)}" ${i === 0 ? "selected" : ""}>${esc(p.nombre)}</option>`;
      selDestino.innerHTML += `<option value="${esc(p.id)}" ${i === 1 ? "selected" : ""}>${esc(p.nombre)}</option>`;
    });

    renderBalance();
    renderPropuesta();

    /* Checkbox "Seleccionar todos" */
    document.getElementById("check-todos").addEventListener("change", (e) => {
      rows.forEach((r) => { r.incluir = e.target.checked; });
      AvanzarData.save(rows);
      renderBalance();
      renderPropuesta();
    });

    /* Paso 1 → 2 */
    document.getElementById("btn-confirmar-avance").addEventListener("click", irAPaso2);

    /* Paso 2 → 1 */
    document.getElementById("btn-volver-editar").addEventListener("click", volverPaso1);

    /* Confirmar matriculación */
    document.getElementById("btn-confirmar-matricular").addEventListener("click", () => {
      const incluidos = rows.filter((r) => r.incluir).length;
      const destino   = document.getElementById("sel-destino");
      const destinoNombre = destino.options[destino.selectedIndex]?.text || "2026-I";
      toast(`${incluidos} estudiantes matriculados en ${destinoNombre} correctamente`);
      /* En una implementación real, aquí navegaría a gestion-periodo.html del nuevo período */
      setTimeout(() => {
        window.location.href = "gestion-periodo.html";
      }, 1800);
    });
  });
})();
