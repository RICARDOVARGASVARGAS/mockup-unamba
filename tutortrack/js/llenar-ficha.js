/**
 * llenar-ficha.js — formulario del estudiante para llenar una ficha.
 * Autoguarda en borrador; botón "Enviar" habilitado solo si todo está contestado.
 */
(function () {
  const toast = (msg, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message: msg, type } }));

  const params  = new URLSearchParams(window.location.search);
  const fichaId = params.get("id")     || "mf-1";
  const modoVer = params.get("modo") === "ver";
  const nombre  = decodeURIComponent(params.get("nombre") || "Ficha");

  let respuestas = {};   /* pregId → valor */
  let preguntas  = [];

  function escHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ---------- progreso ---------- */
  function contestadas() {
    return preguntas.filter((p) => {
      const v = respuestas[p.id];
      if (v === undefined || v === null || v === "") return false;
      if (Array.isArray(v)) return v.length > 0;
      return true;
    }).length;
  }

  function updateProgreso() {
    const total = preguntas.length;
    const done  = contestadas();
    document.getElementById("progreso-bar").textContent = `${done} de ${total} contestadas`;

    const btn    = document.getElementById("btn-enviar");
    const aviso  = document.getElementById("aviso-incompleto");
    const listo  = done === total;
    btn.disabled = !listo;
    aviso.classList.toggle("hidden", listo);
  }

  /* ---------- autoguardado ---------- */
  let _saveTimer = null;
  function autosave() {
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(() => {
      LlenarFichaData.saveBorrador(fichaId, respuestas);
      if (!modoVer) toast("Progreso guardado", "success");
    }, 600);
  }

  /* ---------- render de cada pregunta ---------- */
  function renderPregunta(preg) {
    const areaCls = LlenarFichaData.AREA_COLORES[preg.area_id] || "badge-neutral";
    const val     = respuestas[preg.id];
    const disabled = modoVer ? "disabled" : "";

    let inputHtml = "";

    switch (preg.tipo) {
      case "texto_abierto": {
        const chars = (val || "").length;
        inputHtml = `
          <textarea id="inp-${preg.id}" data-preg="${preg.id}" data-tipo="texto_abierto"
            rows="4" maxlength="1000"
            class="form-textarea text-sm" placeholder="Escribe tu respuesta…" ${disabled}
          >${escHtml(val || "")}</textarea>
          <p class="mt-1 text-xs text-text-muted text-right"><span id="cnt-${preg.id}">${chars}</span>/1000 caracteres</p>`;
        break;
      }

      case "si_no":
        inputHtml = `
          <div class="flex gap-3">
            ${["Sí", "No"].map((op) => `
              <button type="button"
                class="si-no-btn flex-1 rounded-lg border py-2.5 text-sm font-medium ${!modoVer ? "hover:bg-primary/10" : "cursor-default"}
                  ${val === op ? "selected border-primary bg-primary text-white" : "border-border text-text"}"
                data-preg="${preg.id}" data-tipo="si_no" data-val="${op}" ${disabled}
              >${op}</button>`).join("")}
          </div>`;
        break;

      case "alternativa_unica":
        inputHtml = `
          <ul class="space-y-2">
            ${preg.opciones.map((op) => `
              <li>
                <label class="flex items-start gap-3 cursor-pointer ${modoVer ? "pointer-events-none" : ""}">
                  <input type="radio" name="radio-${preg.id}" value="${escHtml(op)}"
                    class="mt-0.5 accent-primary"
                    data-preg="${preg.id}" data-tipo="alternativa_unica"
                    ${val === op ? "checked" : ""} ${disabled}
                  />
                  <span class="text-sm text-text">${escHtml(op)}</span>
                </label>
              </li>`).join("")}
          </ul>`;
        break;

      case "respuesta_multiple": {
        const checked = Array.isArray(val) ? val : [];
        inputHtml = `
          <ul class="space-y-2">
            ${preg.opciones.map((op) => `
              <li>
                <label class="flex items-start gap-3 cursor-pointer ${modoVer ? "pointer-events-none" : ""}">
                  <input type="checkbox" value="${escHtml(op)}"
                    class="mt-0.5 accent-primary"
                    data-preg="${preg.id}" data-tipo="respuesta_multiple"
                    ${checked.includes(op) ? "checked" : ""} ${disabled}
                  />
                  <span class="text-sm text-text">${escHtml(op)}</span>
                </label>
              </li>`).join("")}
          </ul>`;
        break;
      }

      case "escala": {
        const min = preg.escala_min || 1;
        const max = preg.escala_max || 5;
        inputHtml = `
          <div>
            <div class="flex gap-2 flex-wrap">
              ${Array.from({ length: max - min + 1 }, (_, i) => i + min).map((n) => `
                <button type="button"
                  class="escala-btn flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold
                    ${!modoVer ? "hover:bg-primary/10 hover:border-primary hover:text-primary" : "cursor-default"}
                    ${val === n ? "selected border-primary bg-primary text-white" : "border-border text-text"}"
                  data-preg="${preg.id}" data-tipo="escala" data-val="${n}" ${disabled}
                >${n}</button>`).join("")}
            </div>
            <div class="mt-1.5 flex justify-between text-xs text-text-muted" style="max-width:${(max - min + 1) * 3}rem">
              <span>${escHtml(preg.escala_label_min || "")}</span>
              <span>${escHtml(preg.escala_label_max || "")}</span>
            </div>
          </div>`;
        break;
      }
    }

    return `
      <div class="app-card p-5 space-y-4" id="card-${preg.id}">
        <div class="flex flex-wrap items-center gap-2">
          <span class="badge ${areaCls} shrink-0">${escHtml(preg.area_nombre)}</span>
          <span class="text-xs text-text-muted">Pregunta ${preg.orden} de ${preguntas.length}</span>
        </div>
        <p class="font-medium text-text">${escHtml(preg.enunciado)}</p>
        <div class="pl-1">${inputHtml}</div>
      </div>`;
  }

  function renderAll() {
    document.getElementById("preguntas-container").innerHTML =
      preguntas.map(renderPregunta).join("");
  }

  /* ---------- eventos de respuesta ---------- */
  function bindEvents() {
    const container = document.getElementById("preguntas-container");

    /* textarea */
    container.addEventListener("input", (e) => {
      if (e.target.dataset.tipo === "texto_abierto") {
        respuestas[e.target.dataset.preg] = e.target.value;
        const cnt = document.getElementById(`cnt-${e.target.dataset.preg}`);
        if (cnt) cnt.textContent = e.target.value.length;
        updateProgreso();
        autosave();
      }
      if (e.target.dataset.tipo === "alternativa_unica") {
        respuestas[e.target.dataset.preg] = e.target.value;
        updateProgreso();
        autosave();
      }
      if (e.target.dataset.tipo === "respuesta_multiple") {
        const pregId = e.target.dataset.preg;
        const checkboxes = container.querySelectorAll(`[data-tipo="respuesta_multiple"][data-preg="${pregId}"]`);
        respuestas[pregId] = Array.from(checkboxes).filter((c) => c.checked).map((c) => c.value);
        updateProgreso();
        autosave();
      }
    });

    /* botones (si_no + escala) */
    container.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-tipo='si_no'], [data-tipo='escala']");
      if (!btn || btn.disabled) return;

      const pregId = btn.dataset.preg;
      const tipo   = btn.dataset.tipo;
      const val    = tipo === "escala" ? Number(btn.dataset.val) : btn.dataset.val;

      respuestas[pregId] = val;

      /* actualizar estilos de los hermanos */
      const group = container.querySelectorAll(`[data-tipo="${tipo}"][data-preg="${pregId}"]`);
      group.forEach((b) => {
        const bVal = tipo === "escala" ? Number(b.dataset.val) : b.dataset.val;
        b.classList.toggle("selected", bVal === val);
        if (tipo === "si_no") {
          b.classList.toggle("border-primary", bVal === val);
          b.classList.toggle("bg-primary",     bVal === val);
          b.classList.toggle("text-white",     bVal === val);
          b.classList.toggle("border-border",  bVal !== val);
          b.classList.toggle("text-text",      bVal !== val);
        }
      });

      updateProgreso();
      autosave();
    });
  }

  /* ---------- modal de envío ---------- */
  function openEnviarModal() {
    const bd = document.getElementById("modal-enviar-backdrop");
    bd.classList.remove("hidden");
    bd.classList.add("flex");
  }
  function closeEnviarModal() {
    const bd = document.getElementById("modal-enviar-backdrop");
    bd.classList.add("hidden");
    bd.classList.remove("flex");
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    const base = window.getBasePath ? window.getBasePath() : "../../";

    document.getElementById("ficha-titulo").textContent = nombre;
    document.getElementById("link-volver").href   = `${base}pages/estudiante/mis-fichas.html`;
    document.getElementById("link-cancelar").href = `${base}pages/estudiante/mis-fichas.html`;

    preguntas  = LlenarFichaData.getPreguntas(fichaId);

    if (modoVer) {
      /* Cargar respuestas enviadas (para modo ver, usamos las del store de respuestas del docente como ejemplo) */
      const stored = LlenarFichaData.getBorrador(fichaId);
      respuestas   = Object.assign({}, stored);
      document.getElementById("btn-enviar").style.display = "none";
      document.getElementById("link-cancelar").textContent = "Volver";
    } else {
      respuestas = LlenarFichaData.getBorrador(fichaId);
    }

    renderAll();
    if (!modoVer) bindEvents();
    updateProgreso();

    /* Btn enviar */
    document.getElementById("btn-enviar").addEventListener("click", openEnviarModal);
    document.getElementById("btn-modal-cancelar").addEventListener("click", closeEnviarModal);
    document.getElementById("modal-enviar-backdrop").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeEnviarModal();
    });

    document.getElementById("btn-modal-confirmar").addEventListener("click", () => {
      LlenarFichaData.saveBorrador(fichaId, respuestas);
      MisFichasData.marcarEnviada(fichaId);
      LlenarFichaData.clearBorrador(fichaId);
      closeEnviarModal();
      window.location.href = `${base}pages/estudiante/mis-fichas.html?enviada=1`;
    });
  });
})();
