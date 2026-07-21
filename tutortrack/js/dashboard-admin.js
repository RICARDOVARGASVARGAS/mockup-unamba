/**
 * dashboard-admin.js — KPIs de supervisión del período vigente.
 */
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const D = window.AlertasDerivacionesData;
    if (!D) return;
    const k = D.kpisAdmin();
    const set = (sel, v) => {
      const el = document.querySelector(sel);
      if (el) el.textContent = String(v);
    };
    set("[data-kpi-alertas]", k.alertas_pendientes);
    set("[data-kpi-deriv]", k.derivaciones_abiertas);

    const n = k.por_nivel;
    document.querySelector("[data-bloque-alertas]").textContent =
      `🔴 Alta ${n.Alta || 0} · 🟠 Media ${n.Media || 0} · 🔵 Baja ${n.Baja || 0}`;

    const ents = Object.entries(k.por_entidad);
    document.querySelector("[data-bloque-deriv]").textContent = ents.length
      ? ents.map(([name, c]) => `${name} ${c}`).join(" · ")
      : "Sin derivaciones abiertas";

    /* Cobertura / fichas: demo coherente con diseño (no inventa tablas nuevas) */
    set("[data-kpi-matriculados]", 320);
    set("[data-kpi-docentes]", 24);
    set("[data-fichas-label]", "44/60 enviadas · 73%");
    set("[data-cobertura]", "315/320 con tutor");
    set("[data-sin-tutor]", "⚠ 5 sin tutor");
  });
})();
