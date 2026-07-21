/**
 * dashboard-docente.js — cola de trabajo del tutor (filtrado a su docente_id).
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
    const k = D.kpisDocente();
    const porRev = window.FichasCicloData?.porRevisarCount?.() ?? 0;

    document.querySelector("[data-kpi-tutorados]").textContent = String(k.tutorados);
    document.querySelector("[data-kpi-por-rev]").textContent = String(porRev);
    document.querySelector("[data-kpi-alertas]").textContent = String(k.alertas_pendientes);
    document.querySelector("[data-kpi-deriv]").textContent = String(k.derivaciones_abiertas);

    const listaRev = document.querySelector("[data-lista-por-revisar]");
    if (window.FichasCicloData) {
      const items = [];
      FichasCicloData.ESTUDIANTES.forEach((est) => {
        const rows = FichasCicloData.misFichasEstudiante?.(est.id) || [];
        rows.forEach((item) => {
          if (item.estado_llenado === "enviada" && item.ficha_llenada && !item.ficha_llenada.revisada) {
            items.push({ est, nombre: item.fcp?.nombre || "Ficha" });
          }
        });
      });
      listaRev.innerHTML = items.length
        ? items
            .slice(0, 4)
            .map(
              (it) =>
                `<li class="text-sm"><span class="font-medium">${esc(it.est.nombres)}</span> · ${esc(it.nombre)}</li>`
            )
            .join("")
        : `<li class="text-sm text-text-muted">Nada por revisar 🎉</li>`;
    }

    const listaAl = document.querySelector("[data-lista-alertas]");
    const alertas = k.alertas_recientes.length
      ? k.alertas_recientes
      : D.listAlertas({ docente_id: D.DOCENTE_DEMO.id, estado: "pendiente" }).slice(0, 5);
    listaAl.innerHTML = alertas.length
      ? alertas
          .map((a) => {
            const icon = a.nivel_alerta === "Alta" ? "🔴" : a.nivel_alerta === "Media" ? "🟠" : "🔵";
            return `<li class="text-sm">${icon} ${esc(a.estudiante?.nombres || a.estudiante_nombre)} · ${esc(
              a.area_nombre
            )}</li>`;
          })
          .join("")
      : `<li class="text-sm text-text-muted">Sin alertas pendientes</li>`;

    const alDia = Math.max(0, k.tutorados - 2);
    const medias = Math.min(2, k.tutorados);
    const sin = Math.max(0, k.tutorados - alDia - medias);
    const pct = k.tutorados ? Math.round((alDia / k.tutorados) * 100) : 0;
    document.querySelector("[data-avance-bar]").style.width = `${pct}%`;
    document.querySelector("[data-avance-label]").textContent =
      `${alDia}/${k.tutorados} al día · ${medias} a medias · ${sin} sin empezar`;
  });
})();
