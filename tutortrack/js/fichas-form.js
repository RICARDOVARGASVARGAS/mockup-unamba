/**
 * fichas-form.js — alta/edición de plantillas de fichas con constructor de preguntas (M3-4).
 */
(function () {
  const toast = (msg, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message: msg, type } }));

  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const TIPOS_CON_OPCIONES = new Set(["alternativa_unica", "respuesta_multiple"]);
  const TIPOS_CON_ESCALA   = new Set(["escala"]);

  let preguntas     = [];   /* array de preguntas editables */
  let opcionesTmp   = [];   /* opciones del modal de pregunta en edición */
  let editingPregId = null;
  let modoVer       = false;

  /* ------------------------------------------------------------------ */
  /* Render lista de preguntas                                            */
  /* ------------------------------------------------------------------ */

  function renderPreguntas() {
    const list   = document.getElementById("preguntas-list");
    const empty  = document.getElementById("preguntas-empty");
    const count  = document.getElementById("preguntas-count");
    count.textContent = `${preguntas.length} pregunta${preguntas.length !== 1 ? "s" : ""}`;

    if (!preguntas.length) {
      list.innerHTML = "";
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");

    list.innerHTML = preguntas
      .sort((a, b) => a.orden - b.orden)
      .map((p, i) => {
        const areaNombre  = FichasData.areaNombre(p.area_id);
        const tipoLabel   = FichasData.tipoPreguntaLabel(p.tipo);
        const opcionesHtml = TIPOS_CON_OPCIONES.has(p.tipo) && p.opciones?.length
          ? `<div class="mt-2 flex flex-wrap gap-1.5 pl-2">
               ${p.opciones.map((o) => `<span class="badge badge-neutral">${esc(o.texto)}</span>`).join("")}
             </div>`
          : "";
        const escalaHtml = TIPOS_CON_ESCALA.has(p.tipo)
          ? `<div class="mt-1.5 pl-2 text-xs text-text-muted">${esc(p.escala_label_min || "")} [${p.escala_min ?? 1}–${p.escala_max ?? 5}] ${esc(p.escala_label_max || "")}</div>`
          : "";
        const acciones = modoVer ? "" : `
          <div class="flex shrink-0 items-center gap-1">
            <button type="button" class="btn-ghost btn-icon-xs" data-move-up-p="${i}" title="Subir" aria-label="Subir">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75 12 8.25l7.5 7.5"/></svg>
            </button>
            <button type="button" class="btn-ghost btn-icon-xs" data-move-down-p="${i}" title="Bajar" aria-label="Bajar">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>
            </button>
            <button type="button" class="btn-ghost btn-icon-xs text-primary" data-edit-p="${p.id}" title="Editar">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/></svg>
            </button>
            <button type="button" class="btn-ghost btn-icon-xs text-danger" data-del-p="${p.id}" title="Eliminar">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916"/></svg>
            </button>
          </div>`;

        return `
        <div class="rounded-md border border-border bg-surface p-3">
          <div class="flex items-start gap-3">
            <span class="shrink-0 min-w-[1.5rem] text-sm font-mono font-semibold text-text-muted">${i + 1}.</span>
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-1.5 mb-1.5">
                <span class="badge badge-neutral">${esc(areaNombre)}</span>
                <span class="badge badge-primary">${esc(tipoLabel)}</span>
              </div>
              <p class="text-sm font-medium text-text">${esc(p.enunciado)}</p>
              ${opcionesHtml}
              ${escalaHtml}
            </div>
            ${acciones}
          </div>
        </div>`;
      })
      .join("");

    if (!modoVer) bindPreguntaButtons();
  }

  function bindPreguntaButtons() {
    document.querySelectorAll("[data-move-up-p]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.dataset.moveUpP, 10);
        if (i <= 0) return;
        const sorted = [...preguntas].sort((a, b) => a.orden - b.orden);
        const tmp = sorted[i].orden;
        sorted[i].orden = sorted[i - 1].orden;
        sorted[i - 1].orden = tmp;
        renderPreguntas();
      });
    });

    document.querySelectorAll("[data-move-down-p]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.dataset.moveDownP, 10);
        const sorted = [...preguntas].sort((a, b) => a.orden - b.orden);
        if (i >= sorted.length - 1) return;
        const tmp = sorted[i].orden;
        sorted[i].orden = sorted[i + 1].orden;
        sorted[i + 1].orden = tmp;
        renderPreguntas();
      });
    });

    document.querySelectorAll("[data-edit-p]").forEach((btn) => {
      btn.addEventListener("click", () => openPreguntaModal(btn.dataset.editP));
    });

    document.querySelectorAll("[data-del-p]").forEach((btn) => {
      btn.addEventListener("click", () => {
        preguntas = preguntas.filter((p) => p.id !== btn.dataset.delP);
        renderPreguntas();
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Modal: Agregar / Editar pregunta                                    */
  /* ------------------------------------------------------------------ */

  function openPreguntaModal(pregId) {
    editingPregId = pregId || null;
    const existing = pregId ? preguntas.find((p) => p.id === pregId) : null;

    document.getElementById("modal-pregunta-title").textContent = existing ? "Editar pregunta" : "Nueva pregunta";
    document.getElementById("preg-editing-id").value = pregId || "";
    document.getElementById("preg-enunciado").value  = existing?.enunciado || "";
    document.getElementById("preg-area").value        = existing?.area_id  || "";
    document.getElementById("preg-tipo").value        = existing?.tipo      || "";
    document.getElementById("escala-min").value       = existing?.escala_min ?? 1;
    document.getElementById("escala-max").value       = existing?.escala_max ?? 5;
    document.getElementById("escala-label-min").value = existing?.escala_label_min || "";
    document.getElementById("escala-label-max").value = existing?.escala_label_max || "";

    opcionesTmp = existing ? JSON.parse(JSON.stringify(existing.opciones || [])) : [];
    renderOpcionesModal();
    toggleTipoSecciones(existing?.tipo || "");

    const bd = document.getElementById("modal-pregunta-backdrop");
    bd.classList.remove("hidden");
    bd.classList.add("flex");
    document.getElementById("preg-enunciado").focus();
  }

  function closePreguntaModal() {
    const bd = document.getElementById("modal-pregunta-backdrop");
    bd.classList.add("hidden");
    bd.classList.remove("flex");
    opcionesTmp = [];
  }

  function toggleTipoSecciones(tipo) {
    document.getElementById("seccion-opciones").classList.toggle("hidden", !TIPOS_CON_OPCIONES.has(tipo));
    document.getElementById("seccion-escala").classList.toggle("hidden",   !TIPOS_CON_ESCALA.has(tipo));
  }

  function renderOpcionesModal() {
    const ul = document.getElementById("opciones-list");
    ul.innerHTML = opcionesTmp.map((o, i) => `
      <li class="flex items-center gap-2">
        <span class="flex-1 text-sm text-text rounded-md border border-border bg-bg px-2 py-1">${esc(o.texto)}</span>
        <button type="button" class="btn-ghost btn-icon-xs text-danger" data-del-opcion="${i}" aria-label="Quitar">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
        </button>
      </li>`).join("");

    ul.querySelectorAll("[data-del-opcion]").forEach((btn) => {
      btn.addEventListener("click", () => {
        opcionesTmp.splice(parseInt(btn.dataset.delOpcion, 10), 1);
        renderOpcionesModal();
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Init                                                                 */
  /* ------------------------------------------------------------------ */

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.FichasData) return;

    const params  = new URLSearchParams(window.location.search);
    const editId  = params.get("id");
    modoVer       = params.get("modo") === "ver";
    const existing = editId ? FichasData.findById(editId) : null;
    const isEdit   = Boolean(existing);

    const title    = document.getElementById("form-title");
    const tipoSel  = document.getElementById("fch-tipo");
    const areaSel  = document.getElementById("preg-area");
    const tipoPreg = document.getElementById("preg-tipo");
    const toggle   = document.getElementById("fch-activo-toggle");
    const footer   = document.getElementById("form-footer");

    if (modoVer) {
      document.getElementById("modo-ver-badge").classList.remove("hidden");
      document.getElementById("btn-agregar-pregunta").classList.add("hidden");
      footer.classList.add("hidden");
      document.querySelectorAll("#ficha-form input, #ficha-form select, #ficha-form textarea").forEach((el) => { el.disabled = true; });
    }

    title.textContent = isEdit ? (modoVer ? existing.nombre : "Editar ficha") : "Nueva ficha";

    /* Poblar selects de tipos ficha y áreas */
    FichasData.TIPOS_FICHA_SEED.forEach((t) => {
      tipoSel.innerHTML += `<option value="${esc(t.id)}">${esc(t.nombre)}</option>`;
    });
    FichasData.AREAS_SEED.forEach((a) => {
      areaSel.innerHTML += `<option value="${esc(a.id)}">${esc(a.nombre)}</option>`;
    });
    FichasData.TIPOS_PREGUNTA.forEach((tp) => {
      tipoPreg.innerHTML += `<option value="${esc(tp.id)}">${esc(tp.label)}</option>`;
    });

    if (isEdit) {
      document.getElementById("fch-nombre").value = existing.nombre || "";
      tipoSel.value = existing.tipo_ficha_id || "";
      document.getElementById("fch-desc").value = existing.descripcion || "";
      const activo = existing.activo !== false;
      document.getElementById("fch-activo").checked = activo;
      toggle.setAttribute("aria-checked", activo ? "true" : "false");
      preguntas = JSON.parse(JSON.stringify(existing.preguntas || []));
    } else {
      document.getElementById("fch-activo").checked = true;
      toggle.setAttribute("aria-checked", "true");
    }

    renderPreguntas();

    /* Toggle activo */
    toggle.addEventListener("click", () => {
      const cb = document.getElementById("fch-activo");
      cb.checked = !cb.checked;
      toggle.setAttribute("aria-checked", cb.checked ? "true" : "false");
    });

    /* Agregar pregunta */
    document.getElementById("btn-agregar-pregunta").addEventListener("click", () => openPreguntaModal(null));

    /* Tipo de pregunta → mostrar/ocultar secciones */
    tipoPreg.addEventListener("change", () => toggleTipoSecciones(tipoPreg.value));

    /* Opciones: agregar */
    document.getElementById("btn-add-opcion").addEventListener("click", () => {
      const input = document.getElementById("nueva-opcion");
      const texto = input.value.trim();
      if (!texto) return;
      opcionesTmp.push({ id: `op-${Date.now()}`, texto });
      input.value = "";
      renderOpcionesModal();
    });
    document.getElementById("nueva-opcion").addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); document.getElementById("btn-add-opcion").click(); }
    });

    /* Modal pregunta: cancelar */
    document.getElementById("btn-pregunta-cancelar").addEventListener("click", closePreguntaModal);
    document.getElementById("modal-pregunta-backdrop").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closePreguntaModal();
    });

    /* Modal pregunta: guardar */
    document.getElementById("form-pregunta").addEventListener("submit", (e) => {
      e.preventDefault();
      const tipo      = tipoPreg.value;
      const area_id   = areaSel.value;
      const enunciado = document.getElementById("preg-enunciado").value.trim();

      if (!tipo || !area_id || !enunciado) {
        toast("Completa área, tipo y enunciado", "warning");
        return;
      }
      if (TIPOS_CON_OPCIONES.has(tipo) && !opcionesTmp.length) {
        toast("Agrega al menos una opción", "warning");
        return;
      }

      const preg = {
        id:        editingPregId || `preg-${Date.now()}`,
        ficha_id:  editId || "",
        orden:     editingPregId ? preguntas.find((p) => p.id === editingPregId)?.orden ?? (preguntas.length + 1) : preguntas.length + 1,
        area_id,
        tipo,
        enunciado,
        opciones:       TIPOS_CON_OPCIONES.has(tipo) ? opcionesTmp.slice() : [],
        escala_min:     TIPOS_CON_ESCALA.has(tipo) ? parseInt(document.getElementById("escala-min").value, 10) || 1 : null,
        escala_max:     TIPOS_CON_ESCALA.has(tipo) ? parseInt(document.getElementById("escala-max").value, 10) || 5 : null,
        escala_label_min: TIPOS_CON_ESCALA.has(tipo) ? document.getElementById("escala-label-min").value.trim() : null,
        escala_label_max: TIPOS_CON_ESCALA.has(tipo) ? document.getElementById("escala-label-max").value.trim() : null,
      };

      if (editingPregId) {
        const idx = preguntas.findIndex((p) => p.id === editingPregId);
        if (idx !== -1) preguntas[idx] = preg;
      } else {
        preguntas.push(preg);
      }

      closePreguntaModal();
      renderPreguntas();
      toast("Pregunta guardada");
    });

    /* Guardar ficha */
    document.getElementById("ficha-form").addEventListener("submit", (e) => {
      e.preventDefault();
      if (modoVer) return;
      const nombre = document.getElementById("fch-nombre").value.trim();
      const tipo   = tipoSel.value;
      if (!nombre || !tipo) { toast("Nombre y tipo son obligatorios", "warning"); return; }

      const ficha = {
        id:           isEdit ? existing.id : `ficha-${Date.now()}`,
        nombre,
        tipo_ficha_id: tipo,
        descripcion:  document.getElementById("fch-desc").value.trim(),
        activo:       document.getElementById("fch-activo").checked,
        preguntas:    preguntas.map((p, i) => ({ ...p, orden: i + 1 })),
      };

      FichasData.upsert(ficha);
      window.location.href = isEdit ? "fichas.html?saved=updated" : "fichas.html?saved=created";
    });
  });
})();
