/**
 * dashboard-estudiante.js — Inicio cálido + tarjeta de seguimiento saneada.
 * GET /mi-seguimiento: solo entidad + mensaje (nunca motivo/IA/estado).
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
    const est = D.ESTUDIANTE_DEMO;
    document.querySelector("[data-nombre]").textContent = est.nombres;
    document.querySelector("[data-contexto]").textContent = `${est.ciclo} · 2026-I`;

    /* —— Seguimiento saneado —— */
    const seg = D.miSeguimiento(est.id);
    const wrap = document.querySelector("[data-seguimiento]");
    if (seg.length) {
      wrap.hidden = false;
      wrap.innerHTML = seg
        .map(
          (s) => `
        <article class="seguimiento-card">
          <p class="text-sm font-semibold text-text">Un mensaje de tu tutoría</p>
          <p class="mt-2 text-sm text-text leading-relaxed">${esc(s.mensaje_estudiante)}</p>
          <p class="mt-1 text-xs text-text-muted">${esc(s.entidad_nombre)} · ${esc(s.indicador)}</p>
          <a href="tutor.html#agendar" class="btn-secondary btn-sm mt-3 inline-flex">Cómo agendar →</a>
        </article>`
        )
        .join("");
    } else {
      wrap.hidden = true;
      wrap.innerHTML = "";
    }

    /* —— Próxima ficha + progreso —— */
    const prox = document.querySelector("[data-proxima-ficha]");
    let completadas = 0;
    let total = 5;
    let proxima = null;
    if (window.FichasCicloData?.misFichasEstudiante) {
      const items = FichasCicloData.misFichasEstudiante(est.id) || [];
      total = items.filter((i) => i.fcp?.habilitada).length || items.length || 5;
      completadas = items.filter((i) => i.estado_llenado === "enviada").length;
      proxima = items.find((i) => i.activa);
      if (!proxima) {
        proxima = items.find((i) => i.estado_llenado === "borrador");
      }
    }
    if (proxima) {
      const nombre = proxima.fcp?.nombre || "Ficha de tutoría";
      const nPreg = proxima.fcp?.preguntas?.length || 8;
      const href =
        proxima.estado_llenado === "enviada"
          ? "mis-fichas.html"
          : `llenar-ficha.html?fcp=${encodeURIComponent(proxima.fcp?.id || "")}`;
      prox.innerHTML = `
        <div>
          <p class="font-medium text-text">${esc(nombre)}</p>
          <p class="text-sm text-text-muted">${esc(nPreg)} preguntas</p>
        </div>
        <a href="${esc(href)}" class="btn-primary shrink-0">${
        proxima.estado_llenado === "borrador" ? "Continuar" : "Abrir"
      }</a>`;
    } else {
      prox.innerHTML = `<p class="text-sm text-text-muted">No tienes fichas pendientes por ahora.</p>
        <a href="mis-fichas.html" class="btn-secondary btn-sm">Ver mis fichas</a>`;
    }
    const pct = total ? Math.round((completadas / total) * 100) : 0;
    document.querySelector("[data-progreso-bar]").style.width = `${pct}%`;
    document.querySelector("[data-progreso-label]").textContent =
      `${completadas}/${total} completadas`;

    /* —— Tutor —— */
    const tutor = D.DOCENTE_DEMO;
    document.querySelector("[data-tutor-nombre]").textContent = tutor.nombre;
    document.querySelector("[data-tutor-email]").textContent = "c.quispe@unamba.edu.pe";
  });
})();
