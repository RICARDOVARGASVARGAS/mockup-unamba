/**
 * fichas-form.js — constructor compartido de fichas (plantilla admin / ficha docente).
 * Editor inline por pregunta; campos condicionales según tipo_pregunta (5 constantes).
 */
(function () {
  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const TIPOS_OPCIONES = new Set(["alternativa_unica", "respuesta_multiple"]);
  const ICON_DRAG =
    '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>';

  let ctx = "plantilla"; /* plantilla | fcp */
  let entityId = null;
  let preguntas = [];
  let editingId = null;
  let dragFrom = null;
  let bloqueaEdicionPreguntas = false; /* fcp con llenados: no editar enunciado/tipo */
  let modoVistaPrevia = false;

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function isDocentePage() {
    return /\/docente\//.test(window.location.pathname);
  }

  function syncToggle(btnId, checkId, on) {
    const btn = document.getElementById(btnId);
    const check = document.getElementById(checkId);
    if (check) check.checked = !!on;
    if (btn) btn.setAttribute("aria-checked", on ? "true" : "false");
  }

  function bindToggle(btnId, checkId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener("click", () => {
      const next = btn.getAttribute("aria-checked") !== "true";
      syncToggle(btnId, checkId, next);
    });
  }

  function fillTipos() {
    const sel = document.getElementById("fch-tipo");
    if (!sel) return;
    FichasData.TIPOS_FICHA_SEED.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.nombre;
      sel.appendChild(opt);
    });
  }

  function fillCiclos(selected) {
    const wrap = document.getElementById("fch-ciclos");
    if (!wrap) return;
    const set = new Set(selected || []);
    wrap.innerHTML = FichasData.CICLOS_SEED.map(
      (c) => `
      <label class="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm hover:border-primary">
        <input type="checkbox" name="ciclo" value="${esc(c.id)}" class="rounded border-border text-primary focus:ring-primary" ${set.has(c.id) ? "checked" : ""} />
        <span>${esc(c.abrev)} · ${esc(c.nombre)}</span>
      </label>`
    ).join("");
  }

  function selectedCiclos() {
    return Array.from(document.querySelectorAll('#fch-ciclos input[name="ciclo"]:checked')).map(
      (el) => el.value
    );
  }

  function newPregunta() {
    return {
      id: `preg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ficha_id: ctx === "plantilla" ? entityId : null,
      ficha_ciclo_periodo_id: ctx === "fcp" ? entityId : null,
      orden: preguntas.length + 1,
      area_id: "area-1",
      tipo_pregunta: "texto_abierto",
      enunciado: "",
      opciones: [],
      escala_min: 1,
      escala_max: 5,
      etiqueta_min: "",
      etiqueta_max: "",
      _nueva: true,
    };
  }

  function reindex() {
    preguntas.forEach((p, i) => {
      p.orden = i + 1;
    });
  }

  function renderList() {
    const list = document.querySelector("[data-preguntas-list]");
    const empty = document.querySelector("[data-preguntas-empty]");
    const count = document.querySelector("[data-preguntas-count]");
    if (count) count.textContent = `(${preguntas.length})`;

    if (!preguntas.length) {
      if (list) list.innerHTML = "";
      empty?.classList.remove("hidden");
      return;
    }
    empty?.classList.add("hidden");

    list.innerHTML = preguntas
      .map((p, i) => {
        const open = editingId === p.id;
        const tipoLabel = FichasData.tipoPreguntaLabel(p.tipo_pregunta);
        const areaLabel = FichasData.areaNombre(p.area_id);
        return `
        <div class="rounded-lg border border-border bg-surface ${open ? "ring-1 ring-primary" : ""}" data-preg-card="${esc(p.id)}" draggable="${open ? "false" : "true"}">
          <div class="flex items-start gap-2 p-3">
            <button type="button" class="mt-1 shrink-0 cursor-grab text-text-muted hover:text-text" data-drag-handle title="Arrastrar" aria-label="Arrastrar para reordenar">${ICON_DRAG}</button>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-semibold text-text-muted">${i + 1}.</span>
                <span class="text-sm font-medium text-text">${esc(p.enunciado || "(Sin enunciado)")}</span>
              </div>
              <div class="mt-1.5 flex flex-wrap gap-1.5">
                <span class="badge badge-primary">${esc(tipoLabel)}</span>
                <span class="badge badge-neutral">${esc(areaLabel)}</span>
              </div>
            </div>
            <div class="flex shrink-0 items-center gap-0.5">
              ${
                modoVistaPrevia
                  ? ""
                  : `
              <button type="button" class="btn-action btn-action-edit" data-edit-preg="${esc(p.id)}" title="Editar" aria-label="Editar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"/></svg>
              </button>
              <button type="button" class="btn-action btn-action-view" data-dup-preg="${esc(p.id)}" title="Duplicar" aria-label="Duplicar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75m9.75 9.75H8.625c-.621 0-1.125-.504-1.125-1.125V4.5A1.125 1.125 0 0 1 8.625 3.375h6.75c.621 0 1.125.504 1.125 1.125v9.75Z"/></svg>
              </button>
              <button type="button" class="btn-action btn-action-danger" data-del-preg="${esc(p.id)}" title="Eliminar" aria-label="Eliminar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
              </button>`
              }
            </div>
          </div>
          ${open ? editorHtml(p) : ""}
        </div>`;
      })
      .join("");

    bindDrag();
  }

  function editorHtml(p) {
    const locked = bloqueaEdicionPreguntas && !p._nueva;
    const tiposOpts = FichasData.TIPOS_PREGUNTA.map(
      (t) =>
        `<option value="${esc(t.id)}" ${p.tipo_pregunta === t.id ? "selected" : ""}>${esc(t.label)}</option>`
    ).join("");
    const areasOpts = FichasData.AREAS_SEED.filter((a) => a.id !== "area-6" || p.area_id === "area-6")
      .map(
        (a) =>
          `<option value="${esc(a.id)}" ${p.area_id === a.id ? "selected" : ""}>${esc(a.nombre)}</option>`
      )
      .join("");

    let extra = "";
    if (TIPOS_OPCIONES.has(p.tipo_pregunta)) {
      const ops = p.opciones || [];
      extra = `
        <div class="space-y-2" data-editor-opciones>
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-text">Opciones (≥ 2)</span>
            <button type="button" class="btn-ghost text-sm" data-add-opcion>+ Agregar opción</button>
          </div>
          <div data-ops-list class="space-y-1.5">
            ${ops
              .map(
                (o, i) => `
              <div class="flex items-center gap-2" data-op-row="${esc(o.id)}" draggable="true">
                <button type="button" class="cursor-grab text-text-muted" data-op-drag title="Arrastrar" aria-label="Reordenar opción">${ICON_DRAG}</button>
                <input type="text" class="form-input flex-1" data-op-texto value="${esc(o.texto)}" placeholder="Opción ${i + 1}" ${locked ? "disabled" : ""} />
                <button type="button" class="btn-action btn-action-danger" data-del-opcion="${esc(o.id)}" title="Quitar" aria-label="Quitar opción" ${locked ? "disabled" : ""}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                </button>
              </div>`
              )
              .join("")}
          </div>
        </div>`;
    } else if (p.tipo_pregunta === "escala") {
      extra = `
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4" data-editor-escala>
          <div>
            <label class="form-label">Min</label>
            <input type="number" min="1" max="9" class="form-input" data-esc-min value="${esc(p.escala_min ?? 1)}" ${locked ? "disabled" : ""} />
          </div>
          <div>
            <label class="form-label">Max</label>
            <input type="number" min="2" max="10" class="form-input" data-esc-max value="${esc(p.escala_max ?? 5)}" ${locked ? "disabled" : ""} />
          </div>
          <div>
            <label class="form-label">Etiqueta min</label>
            <input type="text" class="form-input" data-esc-emin value="${esc(p.etiqueta_min || "")}" placeholder="Nunca" ${locked ? "disabled" : ""} />
          </div>
          <div>
            <label class="form-label">Etiqueta max</label>
            <input type="text" class="form-input" data-esc-emax value="${esc(p.etiqueta_max || "")}" placeholder="Siempre" ${locked ? "disabled" : ""} />
          </div>
        </div>`;
    } else if (p.tipo_pregunta === "si_no") {
      extra = `<p class="text-xs text-text-muted">Sí / No genera automáticamente sus 2 opciones al guardar.</p>`;
    }

    return `
      <div class="border-t border-border bg-[color:var(--color-bg)] px-3 py-4 sm:px-4" data-preg-editor>
        ${
          locked
            ? `<p class="mb-3 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-text">Esta ficha ya tiene respuestas de estudiantes. No se puede cambiar el enunciado, tipo ni opciones.</p>`
            : ""
        }
        <div class="space-y-3">
          <div>
            <label class="form-label">Enunciado <span class="text-danger">*</span></label>
            <input type="text" class="form-input" data-ed-enunciado value="${esc(p.enunciado)}" placeholder="Escribe la pregunta…" ${locked ? "disabled" : ""} />
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label class="form-label">Área</label>
              <select class="form-input" data-ed-area ${locked ? "disabled" : ""}>${areasOpts}</select>
            </div>
            <div>
              <label class="form-label">Tipo</label>
              <select class="form-input" data-ed-tipo ${locked ? "disabled" : ""}>${tiposOpts}</select>
            </div>
          </div>
          ${extra}
          <div class="flex justify-end gap-2 pt-1">
            <button type="button" class="btn-secondary" data-cancel-preg>Cancelar</button>
            <button type="button" class="btn-primary" data-save-preg ${locked ? "disabled" : ""}>Guardar pregunta</button>
          </div>
        </div>
      </div>`;
  }

  function findPreg(id) {
    return preguntas.find((p) => p.id === id);
  }

  function readEditorInto(p) {
    const root = document.querySelector("[data-preg-editor]");
    if (!root) return;
    p.enunciado = root.querySelector("[data-ed-enunciado]")?.value.trim() || "";
    p.area_id = root.querySelector("[data-ed-area]")?.value || p.area_id;
    const tipo = root.querySelector("[data-ed-tipo]")?.value || p.tipo_pregunta;
    p.tipo_pregunta = tipo;

    if (TIPOS_OPCIONES.has(tipo)) {
      p.opciones = Array.from(root.querySelectorAll("[data-op-row]")).map((row, i) => ({
        id: row.getAttribute("data-op-row"),
        texto: row.querySelector("[data-op-texto]")?.value.trim() || "",
        orden: i + 1,
      }));
      p.escala_min = null;
      p.escala_max = null;
      p.etiqueta_min = null;
      p.etiqueta_max = null;
    } else if (tipo === "escala") {
      p.opciones = [];
      p.escala_min = Number(root.querySelector("[data-esc-min]")?.value || 1);
      p.escala_max = Number(root.querySelector("[data-esc-max]")?.value || 5);
      p.etiqueta_min = root.querySelector("[data-esc-emin]")?.value.trim() || "";
      p.etiqueta_max = root.querySelector("[data-esc-emax]")?.value.trim() || "";
    } else if (tipo === "si_no") {
      p.opciones = [
        { id: `${p.id}-si`, texto: "Sí", orden: 1 },
        { id: `${p.id}-no`, texto: "No", orden: 2 },
      ];
      p.escala_min = null;
      p.escala_max = null;
      p.etiqueta_min = null;
      p.etiqueta_max = null;
    } else {
      p.opciones = [];
      p.escala_min = null;
      p.escala_max = null;
      p.etiqueta_min = null;
      p.etiqueta_max = null;
    }
  }

  function validatePregunta(p) {
    if (!p.enunciado) return "El enunciado es obligatorio.";
    if (TIPOS_OPCIONES.has(p.tipo_pregunta)) {
      const validOps = (p.opciones || []).filter((o) => o.texto);
      if (validOps.length < 2) return "Alternativa única / múltiple requiere al menos 2 opciones.";
      p.opciones = validOps.map((o, i) => ({ ...o, orden: i + 1 }));
    }
    if (p.tipo_pregunta === "escala") {
      const min = Number(p.escala_min);
      const max = Number(p.escala_max);
      if (!(min >= 1 && max <= 10 && min < max)) {
        return "Escala: 1 ≤ min < max ≤ 10.";
      }
    }
    return null;
  }

  function bindDrag() {
    const list = document.querySelector("[data-preguntas-list]");
    if (!list) return;
    list.querySelectorAll("[data-preg-card]").forEach((card) => {
      card.addEventListener("dragstart", (e) => {
        if (editingId) {
          e.preventDefault();
          return;
        }
        dragFrom = card.getAttribute("data-preg-card");
        e.dataTransfer.effectAllowed = "move";
        card.classList.add("opacity-50");
      });
      card.addEventListener("dragend", () => {
        card.classList.remove("opacity-50");
        dragFrom = null;
      });
      card.addEventListener("dragover", (e) => {
        e.preventDefault();
      });
      card.addEventListener("drop", (e) => {
        e.preventDefault();
        const toId = card.getAttribute("data-preg-card");
        if (!dragFrom || dragFrom === toId) return;
        const fromIdx = preguntas.findIndex((p) => p.id === dragFrom);
        const toIdx = preguntas.findIndex((p) => p.id === toId);
        if (fromIdx < 0 || toIdx < 0) return;
        const [item] = preguntas.splice(fromIdx, 1);
        preguntas.splice(toIdx, 0, item);
        reindex();
        renderList();
      });
    });

    /* Reordenar opciones dentro del editor */
    let dragOpFrom = null;
    const opsList = list.querySelector("[data-ops-list]");
    if (opsList && !bloqueaEdicionPreguntas) {
      opsList.querySelectorAll("[data-op-row]").forEach((row) => {
        row.addEventListener("dragstart", (e) => {
          e.stopPropagation();
          dragOpFrom = row.getAttribute("data-op-row");
          e.dataTransfer.effectAllowed = "move";
          row.classList.add("opacity-50");
        });
        row.addEventListener("dragend", () => {
          row.classList.remove("opacity-50");
          dragOpFrom = null;
        });
        row.addEventListener("dragover", (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
        row.addEventListener("drop", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const toId = row.getAttribute("data-op-row");
          const p = findPreg(editingId);
          if (!p || !dragOpFrom || dragOpFrom === toId) return;
          readEditorInto(p);
          const fromIdx = p.opciones.findIndex((o) => o.id === dragOpFrom);
          const toIdx = p.opciones.findIndex((o) => o.id === toId);
          if (fromIdx < 0 || toIdx < 0) return;
          const [item] = p.opciones.splice(fromIdx, 1);
          p.opciones.splice(toIdx, 0, item);
          p.opciones.forEach((o, i) => {
            o.orden = i + 1;
          });
          renderList();
        });
      });
    }
  }

  function openEditor(id) {
    editingId = id;
    renderList();
  }

  function closeEditor() {
    editingId = null;
    renderList();
  }

  function bindListClicks() {
    document.querySelector("[data-preguntas-list]")?.addEventListener("click", (e) => {
      const editBtn = e.target.closest("[data-edit-preg]");
      if (editBtn) {
        openEditor(editBtn.getAttribute("data-edit-preg"));
        return;
      }
      const dupBtn = e.target.closest("[data-dup-preg]");
      if (dupBtn) {
        const src = findPreg(dupBtn.getAttribute("data-dup-preg"));
        if (!src) return;
        const copia = JSON.parse(JSON.stringify(src));
        copia.id = `preg-${Date.now()}`;
        copia._nueva = true;
        copia.enunciado = `${src.enunciado} (copia)`;
        copia.opciones = (copia.opciones || []).map((o, i) => ({
          ...o,
          id: `${copia.id}-o${i + 1}`,
        }));
        const idx = preguntas.findIndex((p) => p.id === src.id);
        preguntas.splice(idx + 1, 0, copia);
        reindex();
        editingId = copia.id;
        renderList();
        toast("Pregunta duplicada");
        return;
      }
      const delBtn = e.target.closest("[data-del-preg]");
      if (delBtn) {
        const id = delBtn.getAttribute("data-del-preg");
        const p = findPreg(id);
        if (bloqueaEdicionPreguntas && p && !p._nueva) {
          toast("No se puede eliminar: la ficha ya tiene respuestas", "danger");
          return;
        }
        AppConfirm.request({
          title: "Eliminar pregunta",
          confirmLabel: "Eliminar",
          cancelLabel: "Cancelar",
          variant: "danger",
          messageHtml: `<p>¿Eliminar esta pregunta?</p>`,
        }).then((ok) => {
          if (!ok) return;
          preguntas = preguntas.filter((x) => x.id !== id);
          if (editingId === id) editingId = null;
          reindex();
          renderList();
          toast("Pregunta eliminada");
        });
        return;
      }

      if (e.target.closest("[data-cancel-preg]")) {
        const p = findPreg(editingId);
        if (p?._nueva && !p.enunciado) {
          preguntas = preguntas.filter((x) => x.id !== editingId);
          reindex();
        }
        closeEditor();
        return;
      }

      if (e.target.closest("[data-save-preg]")) {
        const p = findPreg(editingId);
        if (!p) return;
        if (bloqueaEdicionPreguntas && !p._nueva) {
          toast("No se puede editar: la ficha ya tiene respuestas", "danger");
          return;
        }
        readEditorInto(p);
        const err = validatePregunta(p);
        if (err) {
          toast(err, "danger");
          return;
        }
        delete p._nueva;
        closeEditor();
        toast("Pregunta guardada");
        return;
      }

      if (e.target.closest("[data-add-opcion]")) {
        const p = findPreg(editingId);
        if (!p) return;
        readEditorInto(p);
        p.opciones = p.opciones || [];
        p.opciones.push({
          id: `op-${Date.now()}`,
          texto: "",
          orden: p.opciones.length + 1,
        });
        renderList();
        return;
      }

      const delOp = e.target.closest("[data-del-opcion]");
      if (delOp) {
        const p = findPreg(editingId);
        if (!p) return;
        readEditorInto(p);
        p.opciones = (p.opciones || []).filter((o) => o.id !== delOp.getAttribute("data-del-opcion"));
        renderList();
      }
    });

    document.querySelector("[data-preguntas-list]")?.addEventListener("change", (e) => {
      if (!e.target.matches("[data-ed-tipo]")) return;
      const p = findPreg(editingId);
      if (!p) return;
      readEditorInto(p);
      if (TIPOS_OPCIONES.has(p.tipo_pregunta) && !(p.opciones || []).length) {
        p.opciones = [
          { id: `op-${Date.now()}-1`, texto: "", orden: 1 },
          { id: `op-${Date.now()}-2`, texto: "", orden: 2 },
        ];
      }
      if (p.tipo_pregunta === "escala") {
        p.escala_min = p.escala_min ?? 1;
        p.escala_max = p.escala_max ?? 5;
      }
      renderList();
    });
  }

  function previewWidget(p) {
    const tipo = p.tipo_pregunta;
    const name = `prev-${p.id}`;
    if (tipo === "texto_abierto") {
      return `<textarea class="form-textarea" rows="3" placeholder="Tu respuesta…" disabled></textarea>`;
    }
    if (tipo === "escala") {
      const min = p.escala_min ?? 1;
      const max = p.escala_max ?? 5;
      const nums = [];
      for (let n = min; n <= max; n += 1) nums.push(n);
      return `
        <div class="flex flex-wrap items-center gap-2 text-sm">
          <span class="text-text-muted">${esc(p.etiqueta_min || "")}</span>
          ${nums
            .map(
              (n) => `
            <label class="inline-flex items-center gap-1">
              <input type="radio" name="${esc(name)}" disabled /> ${n}
            </label>`
            )
            .join("")}
          <span class="text-text-muted">${esc(p.etiqueta_max || "")}</span>
        </div>`;
    }
    const ops =
      tipo === "si_no"
        ? [
            { id: "si", texto: "Sí" },
            { id: "no", texto: "No" },
          ]
        : p.opciones || [];
    const inputType = tipo === "respuesta_multiple" ? "checkbox" : "radio";
    return `<div class="space-y-2">${ops
      .map(
        (o) => `
      <label class="flex items-center gap-2 text-sm">
        <input type="${inputType}" name="${esc(name)}" disabled />
        <span>${esc(o.texto)}</span>
      </label>`
      )
      .join("")}</div>`;
  }

  function openPreview() {
    const body = document.querySelector("[data-preview-body]");
    const backdrop = document.querySelector("[data-preview-backdrop]");
    if (!body || !backdrop) return;
    const nombre = document.getElementById("fch-nombre")?.value.trim() || "Sin nombre";
    body.innerHTML = `
      <h3 class="font-heading text-lg font-semibold text-text">${esc(nombre)}</h3>
      ${
        preguntas.length
          ? preguntas
              .map(
                (p, i) => `
        <div class="rounded-lg border border-border p-4">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <p class="font-medium text-text">${i + 1}. ${esc(p.enunciado || "(Sin enunciado)")}</p>
            <span class="badge badge-neutral">${esc(FichasData.tipoPreguntaLabel(p.tipo_pregunta))}</span>
          </div>
          <div class="mt-3">${previewWidget(p)}</div>
        </div>`
              )
              .join("")
          : `<p class="text-sm text-text-muted">No hay preguntas para previsualizar.</p>`
      }`;
    backdrop.classList.remove("hidden");
    backdrop.classList.add("flex");
  }

  function closePreview() {
    const backdrop = document.querySelector("[data-preview-backdrop]");
    if (!backdrop) return;
    backdrop.classList.add("hidden");
    backdrop.classList.remove("flex");
  }

  function collectHeader() {
    return {
      nombre: document.getElementById("fch-nombre")?.value.trim() || "",
      tipo_ficha_id: document.getElementById("fch-tipo")?.value || "",
      descripcion: document.getElementById("fch-desc")?.value.trim() || "",
      activo: document.getElementById("fch-activo")?.checked !== false,
      habilitada: document.getElementById("fch-habilitada")?.checked === true,
      ciclo_ids: selectedCiclos(),
    };
  }

  function saveAll() {
    if (editingId) {
      toast("Guarda o cancela la pregunta en edición primero", "danger");
      return;
    }
    const h = collectHeader();
    if (!h.nombre) {
      toast("El nombre es obligatorio", "danger");
      return;
    }
    if (!h.tipo_ficha_id) {
      toast("El tipo de ficha es obligatorio", "danger");
      return;
    }

    const cleanPreguntas = preguntas.map((p, i) => {
      const n = FichasData.normalizePregunta(p);
      delete n._nueva;
      n.orden = i + 1;
      if (ctx === "plantilla") {
        n.ficha_id = entityId;
        n.ficha_ciclo_periodo_id = null;
      } else {
        n.ficha_id = null;
        n.ficha_ciclo_periodo_id = entityId;
      }
      return n;
    });

    if (ctx === "plantilla") {
      const id = entityId || `ficha-${Date.now()}`;
      entityId = id;
      cleanPreguntas.forEach((p) => {
        p.ficha_id = id;
      });
      FichasData.upsert({
        id,
        tipo_ficha_id: h.tipo_ficha_id,
        nombre: h.nombre,
        descripcion: h.descripcion,
        activo: h.activo,
        ciclo_ids: h.ciclo_ids,
        preguntas: cleanPreguntas,
        updated_at: new Date().toISOString(),
      });
      toast("Plantilla guardada");
      window.location.href = `fichas.html?saved=${params().get("id") ? "updated" : "created"}`;
      return;
    }

    /* fcp docente */
    let fcp = entityId ? FichasCicloData.findFcp(entityId) : null;
    if (!fcp) {
      /* Crear de cero desde constructor vacío */
      fcp = FichasCicloData.crearDesdeCero({
        tipo_ficha_id: h.tipo_ficha_id,
        nombre: h.nombre,
        descripcion: h.descripcion,
      });
      entityId = fcp.id;
      fcp.habilitada = h.habilitada;
      cleanPreguntas.forEach((p) => {
        p.ficha_id = null;
        p.ficha_ciclo_periodo_id = entityId;
      });
      fcp.preguntas = cleanPreguntas;
      FichasCicloData.upsertFcp(fcp);
      toast("Ficha creada");
      window.location.href = `fichas-ciclo.html?saved=created`;
      return;
    }
    fcp.nombre = h.nombre;
    fcp.tipo_ficha_id = h.tipo_ficha_id;
    fcp.descripcion = h.descripcion;
    fcp.habilitada = h.habilitada;
    fcp.preguntas = cleanPreguntas;
    FichasCicloData.upsertFcp(fcp);
    toast("Ficha guardada");
    window.location.href = `fichas-ciclo.html?saved=updated`;
  }

  function loadPlantilla(id) {
    const f = FichasData.findById(id);
    if (!f) {
      toast("Plantilla no encontrada", "danger");
      return;
    }
    entityId = f.id;
    document.querySelector("[data-form-title]").textContent = f.nombre;
    document.getElementById("fch-nombre").value = f.nombre;
    document.getElementById("fch-tipo").value = f.tipo_ficha_id;
    document.getElementById("fch-desc").value = f.descripcion || "";
    syncToggle("fch-activo-toggle", "fch-activo", f.activo !== false);
    fillCiclos(f.ciclo_ids || []);
    preguntas = (f.preguntas || []).map((p) => FichasData.normalizePregunta(p));
    if (FichasData.estaEnUso(f.id)) {
      document.querySelector("[data-aviso-clon]")?.classList.remove("hidden");
    }
    renderList();
  }

  function loadFcp(id) {
    const fcp = FichasCicloData.findFcp(id);
    if (!fcp) {
      toast("Ficha no encontrada", "danger");
      return;
    }
    entityId = fcp.id;
    bloqueaEdicionPreguntas = FichasCicloData.countLlenados(id) > 0;
    document.querySelector("[data-form-title]").textContent = fcp.nombre;
    document.getElementById("fch-nombre").value = fcp.nombre;
    document.getElementById("fch-tipo").value = fcp.tipo_ficha_id;
    document.getElementById("fch-desc").value = fcp.descripcion || "";
    syncToggle("fch-hab-toggle", "fch-habilitada", !!fcp.habilitada);
    document.querySelector("[data-wrap-activo]")?.classList.add("hidden");
    document.querySelector("[data-wrap-habilitar]")?.classList.remove("hidden");
    document.querySelector("[data-wrap-ciclos]")?.classList.add("hidden");
    const back = document.querySelector("[data-back-link]");
    if (back) {
      back.href = "fichas-ciclo.html";
      back.textContent = "← Volver a fichas de mi ciclo";
    }
    preguntas = (fcp.preguntas || []).map((p) => FichasData.normalizePregunta(p));
    renderList();
  }

  function setupContexto() {
    const q = params();
    const fcpId = q.get("fcp") || (q.get("modo") === "fcp" ? q.get("id") : null);
    const plantillaId = !fcpId ? q.get("id") : null;

    if (isDocentePage() || fcpId) {
      ctx = "fcp";
      document.body.dataset.fichaContexto = "fcp";
      document.querySelector("[data-wrap-activo]")?.classList.add("hidden");
      document.querySelector("[data-wrap-habilitar]")?.classList.remove("hidden");
      document.querySelector("[data-wrap-ciclos]")?.classList.add("hidden");
      const back = document.querySelector("[data-back-link]");
      if (back) {
        back.href = "fichas-ciclo.html";
        back.textContent = "← Volver a fichas de mi ciclo";
      }
    }

    fillTipos();
    fillCiclos([]);
    bindToggle("fch-activo-toggle", "fch-activo");
    bindToggle("fch-hab-toggle", "fch-habilitada");
    bindListClicks();

    document.querySelector("[data-btn-add-preg]")?.addEventListener("click", () => {
      if (editingId) {
        toast("Guarda o cancela la pregunta en edición primero", "danger");
        return;
      }
      const p = newPregunta();
      preguntas.push(p);
      reindex();
      editingId = p.id;
      renderList();
    });

    document.querySelector("[data-btn-preview]")?.addEventListener("click", openPreview);
    document.querySelector("[data-preview-close]")?.addEventListener("click", closePreview);
    document.querySelector("[data-preview-backdrop]")?.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closePreview();
    });
    document.querySelector("[data-btn-guardar]")?.addEventListener("click", saveAll);

    const wantPreview = q.get("preview") === "1";
    modoVistaPrevia = wantPreview;

    if (wantPreview) {
      document.querySelector("[data-btn-guardar]")?.classList.add("hidden");
      document.querySelector("[data-btn-add-preg]")?.classList.add("hidden");
      const title = document.querySelector("[data-form-title]");
      if (title) title.insertAdjacentHTML("afterend", '<span class="ml-2 badge badge-neutral align-middle">Vista previa</span>');
    }

    if (ctx === "fcp") {
      return FichasCicloData.ready().then(() => {
        if (fcpId) loadFcp(fcpId);
        else {
          document.querySelector("[data-form-title]").textContent = "Nueva ficha";
          entityId = null;
          syncToggle("fch-hab-toggle", "fch-habilitada", false);
          renderList();
        }
        if (wantPreview) setTimeout(() => openPreview(), 80);
      });
    }

    return FichasData.ready().then(() => {
      if (plantillaId) loadPlantilla(plantillaId);
      else {
        document.querySelector("[data-form-title]").textContent = "Nueva plantilla";
        entityId = null;
        renderList();
      }
      if (wantPreview) setTimeout(() => openPreview(), 80);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.FichasData) return;
    setupContexto().catch((err) => {
      console.error(err);
      toast("Error al cargar el constructor", "danger");
    });
  });
})();
