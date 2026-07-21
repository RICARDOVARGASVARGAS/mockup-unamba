/**
 * dashboard-receptor.js — KPIs de la entidad + casos estancados.
 */
(function () {
  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  document.addEventListener("DOMContentLoaded", () => {
    const D = window.AlertasDerivacionesData;
    if (!D) return;
    const entId = D.RECEPTOR_DEMO.entidad_receptora_id;
    const ent = D.entidadById(entId);
    document.querySelector("[data-entidad]").textContent = ent?.nombre || "Receptor";

    const k = D.kpisReceptor(entId);
    document.querySelector("[data-kpi-nuevos]").textContent = String(k.nuevos);
    document.querySelector("[data-kpi-proceso]").textContent = String(k.en_proceso);
    document.querySelector("[data-kpi-resueltos]").textContent = String(k.resueltos_mes);
    document.querySelector("[data-kpi-activos]").textContent = String(k.activos);

    const ln = document.querySelector("[data-lista-nuevos]");
    ln.innerHTML = k.lista_nuevos.length
      ? k.lista_nuevos
          .map(
            (c) =>
              `<li class="text-sm"><span class="font-medium">${esc(c.estudiante_nombre)}</span> · ${esc(
                c.docente_nombre
              )}</li>`
          )
          .join("")
      : `<li class="text-sm text-text-muted">Sin casos nuevos</li>`;

    const le = document.querySelector("[data-lista-estancados]");
    le.innerHTML = k.estancados.length
      ? k.estancados
          .map(
            (c) =>
              `<li class="text-sm"><span class="font-medium">${esc(c.estudiante_nombre)}</span> · ${esc(
                c.dias_sin_movimiento
              )} días sin movimiento</li>`
          )
          .join("")
      : `<li class="text-sm text-text-muted">Ningún caso estancado</li>`;
  });
})();
