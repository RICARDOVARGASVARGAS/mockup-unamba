/**
 * ficha-respuestas.js — detalle de respuestas de un tutorado (vista docente).
 */
(function () {
  const toast = (msg, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message: msg, type } }));

  const params   = new URLSearchParams(window.location.search);
  const estId    = params.get("est")    || "est-01";
  const fichaId  = params.get("ficha")  || "fcp-1";
  const estNombre = decodeURIComponent(params.get("nombre") || "Estudiante");

  function escHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function initials(nombre) {
    return nombre.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  /* Renderiza la respuesta según tipo */
  function renderRespuesta(preg, resp) {
    if (!resp) return `<p class="text-sm text-text-muted italic">Sin respuesta</p>`;

    switch (preg.tipo || resp.tipo) {
      case "texto_abierto":
        return `<div class="rounded-lg bg-surface-2 border border-border p-3 text-sm text-text leading-relaxed">${escHtml(resp.valor)}</div>`;

      case "si_no":
        return `
          <div class="flex gap-3">
            ${["Sí", "No"].map((op) => `
              <span class="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium
                ${resp.valor === op ? "border-primary bg-primary/10 text-primary" : "border-border text-text-muted"}">
                ${resp.valor === op ? `<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>` : ""}
                ${op}
              </span>`).join("")}
          </div>`;

      case "alternativa_unica":
        return `
          <ul class="space-y-1.5">
            ${(resp.opciones || []).map((op) => `
              <li class="flex items-start gap-2 text-sm
                ${resp.valor === op ? "font-medium text-primary" : "text-text-muted"}">
                <span class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border
                  ${resp.valor === op ? "border-primary bg-primary" : "border-border"}">
                  ${resp.valor === op ? `<span class="h-1.5 w-1.5 rounded-full bg-white"></span>` : ""}
                </span>
                ${escHtml(op)}
              </li>`).join("")}
          </ul>`;

      case "respuesta_multiple":
        return `
          <ul class="space-y-1.5">
            ${(resp.opciones || []).map((op) => {
              const checked = Array.isArray(resp.valor) && resp.valor.includes(op);
              return `
                <li class="flex items-start gap-2 text-sm ${checked ? "font-medium text-primary" : "text-text-muted"}">
                  <span class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border
                    ${checked ? "border-primary bg-primary" : "border-border"}">
                    ${checked ? `<svg class="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>` : ""}
                  </span>
                  ${escHtml(op)}
                </li>`;
            }).join("")}
          </ul>`;

      case "escala": {
        const min = resp.escala_min || 1;
        const max = resp.escala_max || 5;
        const val = resp.valor;
        const total = max - min + 1;
        const dots = [];
        for (let i = min; i <= max; i++) {
          dots.push(`<span class="flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold
            ${i === val ? "bg-primary text-white border-primary" : "border-border text-text-muted"}">${i}</span>`);
        }
        return `
          <div>
            <div class="flex items-center gap-1.5 flex-wrap">${dots.join("")}</div>
            <div class="mt-1.5 flex justify-between text-xs text-text-muted max-w-xs">
              <span>${escHtml(resp.escala_label_min || "")}</span>
              <span>${escHtml(resp.escala_label_max || "")}</span>
            </div>
          </div>`;
      }

      default:
        return `<p class="text-sm text-text-muted">${escHtml(String(resp.valor || ""))}</p>`;
    }
  }

  function renderPreguntas(preguntas, record) {
    const container = document.getElementById("preguntas-container");
    container.innerHTML = preguntas.map((preg) => {
      const resp = (record.respuestas || {})[preg.id];
      const obs  = (record.observaciones || {})[preg.id] || "";
      const areaCls = FichaRespuestasData.AREA_COLORES[preg.area_id] || "badge-neutral";

      return `
        <div class="app-card p-5 space-y-4" data-preg-id="${preg.id}">
          <div class="flex flex-wrap items-start gap-2">
            <span class="badge ${areaCls} shrink-0">${escHtml(preg.area_nombre)}</span>
            <span class="text-xs text-text-muted">Pregunta ${preg.orden}</span>
          </div>
          <p class="font-medium text-text">${escHtml(preg.enunciado)}</p>
          <div class="pl-1">${renderRespuesta(preg, resp)}</div>

          <!-- Observación del tutor -->
          <div class="border-t border-border pt-4">
            <label class="form-label mb-1.5 block">Observación del tutor</label>
            <textarea
              data-obs-pregid="${preg.id}"
              rows="2"
              class="form-textarea text-sm"
              placeholder="Añade una nota u observación sobre esta respuesta…"
            >${escHtml(obs)}</textarea>
            <div class="mt-2 flex justify-end">
              <button type="button" data-guardar-obs="${preg.id}" class="btn-secondary text-xs py-1.5 px-3">Guardar observación</button>
            </div>
          </div>
        </div>`;
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const base = window.getBasePath ? window.getBasePath() : "../../";

    /* Breadcrumb */
    document.getElementById("bc-nombre").textContent = estNombre;
    document.getElementById("link-fichas").href = `${base}pages/docente/fichas-tutorados.html`;
    document.getElementById("link-volver").href  = `${base}pages/docente/fichas-tutorados.html`;

    /* Datos del estudiante */
    document.getElementById("est-avatar").textContent = initials(estNombre);
    document.getElementById("est-nombre").textContent = estNombre;
    document.getElementById("est-meta").textContent   = "1° Ciclo · 2026-I";
    document.getElementById("ficha-nombre").textContent = "Ficha diagnóstica inicial";

    const record = FichaRespuestasData.getRespuestas(fichaId, estId);

    if (!record) {
      document.getElementById("preguntas-container").innerHTML =
        `<div class="app-card p-8 text-center text-text-muted text-sm">No se encontraron respuestas para este estudiante.</div>`;
      return;
    }

    if (record.revisada) {
      document.getElementById("revisada-badge").classList.remove("hidden");
      document.getElementById("btn-marcar-revisada").disabled = true;
      document.getElementById("btn-marcar-revisada").textContent = "Ya marcada como revisada";
      document.getElementById("btn-marcar-revisada").classList.add("opacity-60", "cursor-not-allowed");
    }

    const preguntas = FichaRespuestasData.getPreguntas(fichaId);
    renderPreguntas(preguntas, record);

    /* Guardar observaciones */
    document.getElementById("preguntas-container").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-guardar-obs]");
      if (!btn) return;
      const pregId = btn.dataset.guardarObs;
      const ta = document.querySelector(`[data-obs-pregid="${pregId}"]`);
      FichaRespuestasData.saveObservacion(fichaId, estId, pregId, ta.value);
      toast("Observación guardada");
    });

    /* Marcar revisada */
    document.getElementById("btn-marcar-revisada").addEventListener("click", () => {
      FichaRespuestasData.marcarRevisada(fichaId, estId);
      document.getElementById("revisada-badge").classList.remove("hidden");
      const btn = document.getElementById("btn-marcar-revisada");
      btn.disabled = true;
      btn.textContent = "Ya marcada como revisada";
      btn.classList.add("opacity-60", "cursor-not-allowed");
      toast("Ficha marcada como revisada");
    });
  });
})();
