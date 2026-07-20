/**
 * matriculas.js — Matrículas por período + ciclo (DISEÑO-FRONTEND).
 */
(function () {
  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const toast = (msg, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message: msg, type } }));

  const params = new URLSearchParams(location.search);
  let periodoId = null;
  let cpId = params.get("cp") || null;
  let rows = [];
  let docentes = [];
  const selected = new Set();
  let query = "";
  let filterTutor = "";

  function gp() {
    return GestionPeriodoData.load();
  }

  function initScope() {
    const data = gp();
    if (!periodoId) {
      const meta = cpId ? GestionPeriodoData.findCicloPeriodoMeta(data, cpId) : null;
      periodoId = meta?.periodo_id || GestionPeriodoData.periodoVigente(data)?.id || data.periodos[0]?.id;
    }
    const ciclos = GestionPeriodoData.listCicloPeriodos(data, periodoId);
    if (!cpId || !ciclos.some((c) => c.id === cpId)) {
      cpId = ciclos[0]?.id || null;
    }
  }

  function renderSelectors() {
    const data = gp();
    const per = GestionPeriodoData.periodoById(data, periodoId);
    const selP = document.getElementById("sel-periodo");
    selP.innerHTML = data.periodos
      .map(
        (p) =>
          `<option value="${esc(p.id)}" ${p.id === periodoId ? "selected" : ""}>${esc(p.nombre)}${
            p.activo ? " · Vigente" : ""
          }</option>`
      )
      .join("");
    document.getElementById("badge-vigente").classList.toggle("hidden", !per?.activo);

    const ciclos = GestionPeriodoData.listCicloPeriodos(data, periodoId);
    const selC = document.getElementById("sel-ciclo");
    if (!ciclos.length) {
      selC.innerHTML = `<option value="">Sin ciclos configurados</option>`;
      cpId = null;
    } else {
      selC.innerHTML = ciclos
        .map(
          (c) =>
            `<option value="${esc(c.id)}" ${c.id === cpId ? "selected" : ""}>${esc(c.ciclo_nombre)}</option>`
        )
        .join("");
    }
  }

  function reload() {
    initScope();
    renderSelectors();
    if (!cpId) {
      rows = [];
      docentes = [];
    } else {
      rows = MatriculasData.load(cpId);
      docentes = MatriculasData.getDocentes(cpId);
    }
    selected.clear();
    paintFilterTutor();
    paintBulkTutor();
    renderSummary();
    renderTable();
  }

  function paintFilterTutor() {
    const sel = document.getElementById("mat-filter-tutor");
    const cur = filterTutor;
    sel.innerHTML =
      `<option value="">Todos</option>` +
      docentes.map((d) => `<option value="${esc(d.docente_id)}">${esc(d.nombre)}</option>`).join("");
    sel.value = cur;
  }

  function paintBulkTutor() {
    const sel = document.getElementById("bulk-tutor");
    sel.innerHTML =
      `<option value="">Asignar tutor…</option>` +
      docentes
        .map((d) => {
          const carga = rows.filter((r) => r.docente_id === d.docente_id).length;
          return `<option value="${esc(d.docente_id)}">${esc(d.nombre)} (${carga})</option>`;
        })
        .join("");
  }

  function renderSummary() {
    const s = MatriculasData.summary(rows, docentes);
    document.getElementById("sum-mat").textContent = String(s.matriculados);
    document.getElementById("sum-tut").textContent = String(s.tutores);
    document.getElementById("sum-prom").textContent = String(s.promedio);
  }

  function filtered() {
    let list = rows.slice();
    if (filterTutor) list = list.filter((r) => r.docente_id === filterTutor);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          MatriculasData.nombreCompleto(r).toLowerCase().includes(q) ||
          String(r.codigo_universitario || "")
            .toLowerCase()
            .includes(q)
      );
    }
    return list;
  }

  function docenteNombre(id) {
    return docentes.find((d) => d.docente_id === id)?.nombre || "—";
  }

  function renderTable() {
    const list = filtered();
    const tbody = document.getElementById("mat-tbody");
    const empty = document.getElementById("mat-empty");
    const wrap = document.querySelector(".catalog-table-wrap");
    document.getElementById("mat-meta").textContent = list.length
      ? `Mostrando ${list.length} de ${rows.length}`
      : "Sin resultados";

    if (!list.length) {
      tbody.innerHTML = "";
      empty.classList.remove("hidden");
      wrap?.classList.add("hidden");
    } else {
      empty.classList.add("hidden");
      wrap?.classList.remove("hidden");
      tbody.innerHTML = list
        .map((r) => {
          const checked = selected.has(r.id) ? "checked" : "";
          return `
          <tr data-id="${esc(r.id)}">
            <td class="text-center">
              <input type="checkbox" class="h-4 w-4 rounded border-border text-primary" data-row-check ${checked} aria-label="Seleccionar" />
            </td>
            <td class="col-primary">${esc(MatriculasData.nombreCompleto(r))}</td>
            <td class="col-muted font-mono text-sm">${esc(r.codigo_universitario)}</td>
            <td>
              <button type="button" class="text-left text-sm font-medium text-primary hover:underline" data-edit-tutor>
                ${esc(docenteNombre(r.docente_id))}
                <span class="text-text-muted" aria-hidden="true"> ✎</span>
              </button>
            </td>
            <td class="text-center col-muted">${r.fichas_llenadas}/${r.fichas_total || MatriculasData.FICHAS_TOTAL}</td>
            <td class="col-actions">
              <div class="catalog-actions">
                <button type="button" class="btn-action btn-action-edit" data-edit-tutor title="Cambiar tutor" aria-label="Cambiar tutor">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"/></svg>
                </button>
                <button type="button" class="btn-action btn-action-danger" data-retirar title="Quitar matrícula" aria-label="Quitar matrícula">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
                </button>
              </div>
            </td>
          </tr>`;
        })
        .join("");
    }
    updateBulkBar();
    const all = list.length && list.every((r) => selected.has(r.id));
    document.getElementById("check-all").checked = all;
  }

  function updateBulkBar() {
    const bar = document.getElementById("bulk-bar");
    const n = selected.size;
    bar.classList.toggle("is-visible", n > 0);
    document.getElementById("bulk-count").textContent = `${n} seleccionado${n === 1 ? "" : "s"}`;
  }

  function showModal(id) {
    const el = document.getElementById(id);
    el.classList.remove("hidden");
    el.classList.add("flex");
  }
  function hideModal(id) {
    const el = document.getElementById(id);
    el.classList.add("hidden");
    el.classList.remove("flex");
  }

  let candidatosCache = [];

  function openMatricular() {
    if (!cpId) {
      toast("Configura ciclos en el período primero", "warning");
      return;
    }
    if (!docentes.length) {
      toast("Asigna docentes al ciclo antes de matricular", "warning");
      return;
    }
    candidatosCache = MatriculasData.candidatos(cpId, rows, periodoId);
    document.getElementById("mat-cand-search").value = "";
    paintCandidatos("");
    const sel = document.getElementById("mat-tutor");
    sel.innerHTML =
      `<option value="">Seleccionar tutor…</option>` +
      docentes
        .map((d) => {
          const carga = rows.filter((r) => r.docente_id === d.docente_id).length;
          return `<option value="${esc(d.docente_id)}">${esc(d.nombre)} · carga ${carga}</option>`;
        })
        .join("");
    showModal("modal-mat-backdrop");
  }

  function paintCandidatos(q) {
    const query = (q || "").toLowerCase();
    const list = query
      ? candidatosCache.filter(
          (c) =>
            MatriculasData.nombreCompleto(c).toLowerCase().includes(query) ||
            c.codigo_universitario.toLowerCase().includes(query)
        )
      : candidatosCache;
    const box = document.getElementById("lista-candidatos");
    const vacio = document.getElementById("cand-vacio");
    if (!list.length) {
      box.innerHTML = "";
      vacio.classList.remove("hidden");
      return;
    }
    vacio.classList.add("hidden");
    box.innerHTML = list
      .map(
        (c) => `
      <label class="gp-check-item">
        <input type="checkbox" name="cand" value="${esc(c.codigo_universitario)}" />
        <span class="min-w-0">
          <span class="block font-medium truncate">${esc(MatriculasData.nombreCompleto(c))}</span>
          <span class="block text-xs text-text-muted font-mono">${esc(c.codigo_universitario)}</span>
        </span>
      </label>`
      )
      .join("");
  }

  function confirmMatricular() {
    const codes = [...document.querySelectorAll('#lista-candidatos input[name="cand"]:checked')].map(
      (el) => el.value
    );
    const docenteId = document.getElementById("mat-tutor").value;
    if (!codes.length) {
      toast("Selecciona al menos un estudiante", "warning");
      return;
    }
    if (!docenteId) {
      toast("Selecciona un tutor", "warning");
      return;
    }
    const ests = candidatosCache.filter((c) => codes.includes(c.codigo_universitario));
    rows = MatriculasData.matricularVarios(cpId, rows, ests, docenteId);
    hideModal("modal-mat-backdrop");
    docentes = MatriculasData.getDocentes(cpId);
    paintFilterTutor();
    paintBulkTutor();
    renderSummary();
    renderTable();
    toast(ests.length === 1 ? "Estudiante matriculado" : `${ests.length} estudiantes matriculados`);
  }

  function openCambiarTutor(row) {
    document.getElementById("modal-tutor-nombre").textContent = MatriculasData.nombreCompleto(row);
    document.getElementById("tutor-mat-id").value = row.id;
    const sel = document.getElementById("tutor-select");
    sel.innerHTML = docentes
      .map(
        (d) =>
          `<option value="${esc(d.docente_id)}" ${d.docente_id === row.docente_id ? "selected" : ""}>${esc(
            d.nombre
          )}</option>`
      )
      .join("");
    showModal("modal-tutor-backdrop");
  }

  function askRetirar(row) {
    const check = MatriculasData.canRetirar(row);
    if (!check.ok) {
      return AppConfirm.request({
        title: "No se puede retirar",
        confirmLabel: "Entendido",
        cancelLabel: "Cerrar",
        variant: "warning",
        messageHtml: `<p><strong class="text-text">${esc(
          MatriculasData.nombreCompleto(row)
        )}</strong></p><p>${esc(check.reason)}</p>`,
      });
    }
    return AppConfirm.request({
      title: "Quitar matrícula",
      confirmLabel: "Quitar",
      cancelLabel: "Cancelar",
      variant: "danger",
      messageHtml: `<p>¿Retirar a <strong class="text-text">${esc(
        MatriculasData.nombreCompleto(row)
      )}</strong> de este ciclo?</p>`,
    }).then((ok) => {
      if (!ok) return;
      const res = MatriculasData.retirar(cpId, rows, row.id);
      if (!res.ok) {
        toast(res.reason, "warning");
        return;
      }
      rows = res.rows;
      selected.delete(row.id);
      docentes = MatriculasData.getDocentes(cpId);
      paintBulkTutor();
      renderSummary();
      renderTable();
      toast("Matrícula retirada");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.GestionPeriodoData || !window.MatriculasData) return;
    MatriculasData.ensureAllConfigured();
    reload();

    document.getElementById("sel-periodo").addEventListener("change", (e) => {
      periodoId = e.target.value;
      cpId = null;
      reload();
    });
    document.getElementById("sel-ciclo").addEventListener("change", (e) => {
      cpId = e.target.value || null;
      selected.clear();
      rows = cpId ? MatriculasData.load(cpId) : [];
      docentes = cpId ? MatriculasData.getDocentes(cpId) : [];
      paintFilterTutor();
      paintBulkTutor();
      renderSummary();
      renderTable();
    });

    document.getElementById("btn-matricular").addEventListener("click", openMatricular);
    document.getElementById("btn-buscar").addEventListener("click", () => {
      query = document.getElementById("mat-search").value.trim();
      renderTable();
    });
    document.getElementById("mat-search").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        query = e.target.value.trim();
        renderTable();
      }
    });
    document.getElementById("btn-limpiar").addEventListener("click", () => {
      document.getElementById("mat-search").value = "";
      document.getElementById("mat-filter-tutor").value = "";
      query = "";
      filterTutor = "";
      renderTable();
    });
    document.getElementById("mat-filter-tutor").addEventListener("change", (e) => {
      filterTutor = e.target.value;
      renderTable();
    });

    document.getElementById("check-all").addEventListener("change", (e) => {
      const list = filtered();
      if (e.target.checked) list.forEach((r) => selected.add(r.id));
      else list.forEach((r) => selected.delete(r.id));
      renderTable();
    });

    document.getElementById("mat-tbody").addEventListener("click", (e) => {
      const tr = e.target.closest("tr[data-id]");
      if (!tr) return;
      const row = rows.find((r) => r.id === tr.dataset.id);
      if (!row) return;
      if (e.target.matches("[data-row-check]")) {
        if (e.target.checked) selected.add(row.id);
        else selected.delete(row.id);
        updateBulkBar();
        return;
      }
      if (e.target.closest("[data-edit-tutor]")) {
        openCambiarTutor(row);
        return;
      }
      if (e.target.closest("[data-retirar]")) askRetirar(row);
    });

    document.getElementById("btn-bulk-asignar").addEventListener("click", () => {
      const docenteId = document.getElementById("bulk-tutor").value;
      if (!docenteId) {
        toast("Elige un tutor", "warning");
        return;
      }
      if (!selected.size) return;
      rows = MatriculasData.cambiarTutor(cpId, rows, [...selected], docenteId);
      docentes = MatriculasData.getDocentes(cpId);
      paintBulkTutor();
      renderSummary();
      renderTable();
      toast("Tutor actualizado");
    });

    document.getElementById("btn-mat-cancelar").addEventListener("click", () => hideModal("modal-mat-backdrop"));
    document.getElementById("btn-mat-confirmar").addEventListener("click", confirmMatricular);
    document.getElementById("mat-cand-search").addEventListener("input", (e) => paintCandidatos(e.target.value));
    document.getElementById("modal-mat-backdrop").addEventListener("click", (e) => {
      if (e.target.id === "modal-mat-backdrop") hideModal("modal-mat-backdrop");
    });

    document.getElementById("btn-tutor-cancelar").addEventListener("click", () => hideModal("modal-tutor-backdrop"));
    document.getElementById("btn-tutor-guardar").addEventListener("click", () => {
      const id = document.getElementById("tutor-mat-id").value;
      const docenteId = document.getElementById("tutor-select").value;
      rows = MatriculasData.cambiarTutor(cpId, rows, [id], docenteId);
      docentes = MatriculasData.getDocentes(cpId);
      hideModal("modal-tutor-backdrop");
      paintBulkTutor();
      renderSummary();
      renderTable();
      toast("Tutor actualizado");
    });
    document.getElementById("modal-tutor-backdrop").addEventListener("click", (e) => {
      if (e.target.id === "modal-tutor-backdrop") hideModal("modal-tutor-backdrop");
    });
  });
})();
