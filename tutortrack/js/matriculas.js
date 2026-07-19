/**
 * matriculas.js — listado de estudiantes matriculados en un ciclo×período (M2-5).
 * Recibe ?cp=<id>&ciclo=<nombre>&periodo=<nombre> por query string.
 */
(function () {
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const toast = (msg, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message: msg, type } }));

  function getBasePath() {
    return typeof window.getBasePath === "function" ? window.getBasePath() : "../../";
  }

  const params      = new URLSearchParams(window.location.search);
  const CP_ID       = params.get("cp") || "cp-301";
  const CICLO_NOMBRE   = params.get("ciclo")   || "1° Ciclo";
  const PERIODO_NOMBRE = params.get("periodo") || "2026-I";

  let rows = [];
  let tableInstance = null;
  const DOCENTES = MatriculasData.getDocentes(CP_ID);

  function docenteNombre(docenteId) {
    const d = DOCENTES.find((d) => d.docente_id === docenteId);
    return d ? d.nombre : "—";
  }

  function docenteAbrev(docenteId) {
    const d = DOCENTES.find((d) => d.docente_id === docenteId);
    return d ? d.abrev : "—";
  }

  /* ------------------------------------------------------------------ */
  /* Balance de carga                                                     */
  /* ------------------------------------------------------------------ */

  function renderBalance() {
    const container = document.getElementById("balance-carga");
    const byDocente = {};
    rows.forEach((r) => {
      byDocente[r.docente_id] = (byDocente[r.docente_id] || 0) + 1;
    });
    const base = getBasePath();
    container.innerHTML = DOCENTES.map((d) => {
      const n = byDocente[d.docente_id] || 0;
      return `
      <div class="flex items-center gap-2 rounded-full border border-border bg-bg px-3 py-1.5">
        <img src="${base}assets/img/avatares/usuario-m.svg" alt="" class="h-6 w-6 rounded-full" />
        <span class="text-sm font-medium text-text">${esc(d.abrev)}</span>
        <span class="badge badge-neutral">${n} tutorado${n !== 1 ? "s" : ""}</span>
      </div>`;
    }).join("");
  }

  /* ------------------------------------------------------------------ */
  /* Tabla                                                                */
  /* ------------------------------------------------------------------ */

  function mountTable() {
    const root = document.querySelector("[data-catalog]");
    if (!root || !window.CatalogTable) return;

    /* Opciones de filtro por docente */
    const sel = document.getElementById("mat-filter-docente");
    DOCENTES.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d.docente_id;
      opt.textContent = d.abrev;
      sel.appendChild(opt);
    });

    tableInstance = CatalogTable.mount(root, {
      data: rows.map((r) => ({ ...r, nombre_completo: MatriculasData.nombreCompleto(r) })),
      pageSize: 10,
      searchKeys: ["nombres", "apellido_paterno", "apellido_materno", "nombre_completo", "codigo_universitario"],
      filters: [{ id: "docente", getValue: (r) => r.docente_id }],
      initialSortKey: "apellido_paterno",
      deleteLabel: (r) => MatriculasData.nombreCompleto(r),
      columns: [
        {
          key: "nombres",
          label: "Estudiante",
          primary: true,
          sortValue: (r) => MatriculasData.nombreCompleto(r).toLowerCase(),
          render: (row, e) => {
            const base = getBasePath();
            const avatar = row.sexo === "F"
              ? `${base}assets/img/avatares/usuario-f.svg`
              : `${base}assets/img/avatares/usuario-m.svg`;
            return `
              <div class="flex items-center gap-3">
                <img src="${e(avatar)}" alt="" class="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-border" />
                <div class="min-w-0">
                  <div class="font-medium text-text leading-snug">${e(MatriculasData.nombreCompleto(row))}</div>
                  <div class="text-xs text-text-muted">${e(row.codigo_universitario || "")}</div>
                </div>
              </div>`;
          },
        },
        {
          key: "docente_id",
          label: "Tutor asignado",
          muted: true,
          sortValue: (r) => docenteAbrev(r.docente_id).toLowerCase(),
          render: (row, e) => `<span class="text-text">${e(docenteAbrev(row.docente_id))}</span>`,
        },
        {
          key: "fichas_llenadas",
          label: "Fichas",
          align: "center",
          sortValue: (r) => r.fichas_llenadas,
          render: (row) =>
            row.fichas_llenadas > 0
              ? `<span class="badge badge-success">${row.fichas_llenadas}</span>`
              : `<span class="text-text-muted">0</span>`,
        },
      ],
      /* onEdit → abre modal "Cambiar tutor" */
      onEdit: (row) => openCambiarTutorModal(row),
      /* onDelete → abre modal "Retirar" */
      onDelete: (id) => {
        const row = rows.find((r) => r.id === id);
        if (row) {
          rows = MatriculasData.retirar(CP_ID, rows, id);
          tableInstance?.setData(rows.map((r) => ({ ...r, nombre_completo: MatriculasData.nombreCompleto(r) })));
          renderBalance();
        }
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /* Modal: Matricular                                                    */
  /* ------------------------------------------------------------------ */

  function openMatricularModal() {
    const candidatos = MatriculasData.candidatos(CP_ID, rows);
    const selEst  = document.getElementById("mat-candidato");
    const selDoc  = document.getElementById("mat-docente");

    selEst.innerHTML =
      `<option value="">Seleccionar estudiante…</option>` +
      candidatos.map((c, i) => `<option value="${i}">${esc(MatriculasData.nombreCompleto(c))} (${esc(c.codigo_universitario)})</option>`).join("");

    selDoc.innerHTML =
      `<option value="">Seleccionar tutor…</option>` +
      DOCENTES.map((d) => `<option value="${esc(d.docente_id)}">${esc(d.nombre)}</option>`).join("");

    selEst._candidatos = candidatos;

    const bd = document.getElementById("modal-mat-backdrop");
    bd.classList.remove("hidden");
    bd.classList.add("flex");
  }

  function closeMatricularModal() {
    const bd = document.getElementById("modal-mat-backdrop");
    bd.classList.add("hidden");
    bd.classList.remove("flex");
  }

  /* ------------------------------------------------------------------ */
  /* Modal: Cambiar tutor                                                 */
  /* ------------------------------------------------------------------ */

  function openCambiarTutorModal(row) {
    document.getElementById("tutor-mat-id").value = row.id;
    document.getElementById("modal-tutor-nombre").textContent = MatriculasData.nombreCompleto(row);
    const sel = document.getElementById("tutor-select");
    sel.innerHTML = DOCENTES.map(
      (d) => `<option value="${esc(d.docente_id)}" ${d.docente_id === row.docente_id ? "selected" : ""}>${esc(d.nombre)}</option>`
    ).join("");
    const bd = document.getElementById("modal-tutor-backdrop");
    bd.classList.remove("hidden");
    bd.classList.add("flex");
  }

  function closeCambiarTutorModal() {
    const bd = document.getElementById("modal-tutor-backdrop");
    bd.classList.add("hidden");
    bd.classList.remove("flex");
  }

  /* ------------------------------------------------------------------ */
  /* Modal: Retirar                                                       */
  /* ------------------------------------------------------------------ */

  function openRetirarModal(row) {
    document.getElementById("retirar-mat-id").value = row.id;
    const fichas = row.fichas_llenadas || 0;
    document.getElementById("modal-retirar-msg").textContent =
      `¿Retirar a ${MatriculasData.nombreCompleto(row)} de la matrícula?${
        fichas > 0 ? ` Esta acción no se puede deshacer: el estudiante ya tiene ${fichas} ficha${fichas > 1 ? "s" : ""} llenada${fichas > 1 ? "s" : ""}.` : ""
      }`;
    const bd = document.getElementById("modal-retirar-backdrop");
    bd.classList.remove("hidden");
    bd.classList.add("flex");
  }

  function closeRetirarModal() {
    const bd = document.getElementById("modal-retirar-backdrop");
    bd.classList.add("hidden");
    bd.classList.remove("flex");
  }

  /* ------------------------------------------------------------------ */
  /* Init                                                                 */
  /* ------------------------------------------------------------------ */

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.MatriculasData || !window.CatalogTable) return;

    document.getElementById("bc-ciclo").textContent = CICLO_NOMBRE;
    document.getElementById("page-title").textContent = `Estudiantes matriculados — ${CICLO_NOMBRE} · ${PERIODO_NOMBRE}`;

    rows = MatriculasData.load(CP_ID);
    renderBalance();
    mountTable();

    /* Actualizar */
    document.getElementById("btn-actualizar").addEventListener("click", () => {
      rows = MatriculasData.load(CP_ID);
      tableInstance?.setData(rows.map((r) => ({ ...r, nombre_completo: MatriculasData.nombreCompleto(r) })));
      renderBalance();
      toast("Lista actualizada");
    });

    /* Matricular */
    document.getElementById("btn-matricular").addEventListener("click", openMatricularModal);
    document.getElementById("btn-mat-cancelar").addEventListener("click", closeMatricularModal);
    document.getElementById("modal-mat-backdrop").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeMatricularModal();
    });
    document.getElementById("form-matricular").addEventListener("submit", (e) => {
      e.preventDefault();
      const selEst  = document.getElementById("mat-candidato");
      const selDoc  = document.getElementById("mat-docente");
      const idx     = selEst.value;
      const docId   = selDoc.value;
      if (idx === "" || !docId) { toast("Selecciona estudiante y tutor", "warning"); return; }
      const candidato = selEst._candidatos[parseInt(idx, 10)];
      if (!candidato) return;
      rows = MatriculasData.matricular(CP_ID, rows, candidato, docId);
      tableInstance?.setData(rows.map((r) => ({ ...r, nombre_completo: MatriculasData.nombreCompleto(r) })));
      renderBalance();
      closeMatricularModal();
      toast("Estudiante matriculado");
    });

    /* Cambiar tutor */
    document.getElementById("btn-tutor-cancelar").addEventListener("click", closeCambiarTutorModal);
    document.getElementById("modal-tutor-backdrop").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeCambiarTutorModal();
    });
    document.getElementById("form-cambiar-tutor").addEventListener("submit", (e) => {
      e.preventDefault();
      const matId   = document.getElementById("tutor-mat-id").value;
      const docId   = document.getElementById("tutor-select").value;
      if (!docId) { toast("Selecciona un tutor", "warning"); return; }
      rows = MatriculasData.cambiarTutor(CP_ID, rows, matId, docId);
      tableInstance?.setData(rows.map((r) => ({ ...r, nombre_completo: MatriculasData.nombreCompleto(r) })));
      renderBalance();
      closeCambiarTutorModal();
      toast("Tutor actualizado");
    });

  });
})();
