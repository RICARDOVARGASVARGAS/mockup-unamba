/**
 * gestion-periodo.js — pantalla M2-3: tarjetas por ciclo×período,
 * gestión de docentes asignados, modal clonar y modal nuevo período.
 */
(function () {
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const toast = (msg, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message: msg, type } }));

  function getBasePath() {
    return typeof window.getBasePath === "function" ? window.getBasePath() : "../../";
  }

  let _data;
  let _periodoActual;
  let _cpEditando = null;     /* ciclo_periodo id del modal de docentes */
  let _docentesTmp = [];      /* copia temporal para edición */

  /* ------------------------------------------------------------------ */
  /* Render principal                                                     */
  /* ------------------------------------------------------------------ */

  function render() {
    _data = GestionPeriodoData.load();
    _periodoActual = GestionPeriodoData.periodoActivo(_data);
    renderSelectPeriodo();
    renderCards(_periodoActual.id);
    toggleBadgeVigente(_periodoActual.activo);
  }

  function renderSelectPeriodo() {
    const sel = document.getElementById("select-periodo");
    sel.innerHTML = _data.periodos
      .map(
        (p) =>
          `<option value="${esc(p.id)}" ${p.id === _periodoActual.id ? "selected" : ""}>${esc(p.nombre)}${p.activo ? " (vigente)" : ""}</option>`
      )
      .join("");
  }

  function toggleBadgeVigente(activo) {
    const badge = document.getElementById("badge-vigente");
    badge.classList.toggle("hidden", !activo);
  }

  function renderCards(periodoId) {
    const container = document.getElementById("cards-ciclos");
    const sinDatos  = document.getElementById("sin-datos");
    const ciclosEnPeriodo = _data.ciclo_periodos[periodoId];

    if (!ciclosEnPeriodo || !Object.keys(ciclosEnPeriodo).length) {
      container.innerHTML = "";
      sinDatos.classList.remove("hidden");
      return;
    }
    sinDatos.classList.add("hidden");

    const base = getBasePath();
    container.innerHTML = _data.ciclos
      .filter((c) => ciclosEnPeriodo[c.id])
      .map((ciclo) => {
        const cp = ciclosEnPeriodo[ciclo.id];
        const docentes = GestionPeriodoData.getDocentesAsignados(_data, cp.id);
        const periodo  = _data.periodos.find((p) => p.id === periodoId);

        const docentesHtml = docentes.length
          ? docentes
              .map(
                (d) => `
              <div class="flex items-center gap-2">
                <img src="${base}assets/img/avatares/usuario-m.svg" alt="" class="h-7 w-7 rounded-full object-cover ring-1 ring-border" />
                <span class="text-sm font-medium text-text">${esc(d.nombre)}</span>
              </div>`
              )
              .join("")
          : `<p class="text-sm text-text-muted italic">Sin docentes asignados.</p>`;

        return `
        <article class="app-card flex flex-col gap-0">
          <div class="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 class="font-heading font-semibold text-text">${esc(ciclo.nombre)}</h3>
            <span class="badge badge-neutral">${cp.n_estudiantes} estudiantes</span>
          </div>

          <div class="flex-1 p-5 space-y-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Docentes asignados</p>
              <div class="space-y-2">${docentesHtml}</div>
            </div>
            <button
              type="button"
              class="btn-secondary w-full text-sm"
              data-gestionar-cp="${esc(cp.id)}"
              data-ciclo-nombre="${esc(ciclo.nombre)}"
              data-periodo-nombre="${esc(periodo?.nombre || "")}"
            >
              Gestionar docentes
            </button>
          </div>

          <div class="flex gap-2 border-t border-border px-5 py-3 flex-wrap">
            <a
              href="temario.html?cp=${esc(cp.id)}&ciclo=${encodeURIComponent(ciclo.nombre)}&periodo=${encodeURIComponent(periodo?.nombre || "")}"
              class="btn-ghost flex-1 text-center text-sm"
            >Ver temario</a>
            <a
              href="matriculas.html?cp=${esc(cp.id)}&ciclo=${encodeURIComponent(ciclo.nombre)}&periodo=${encodeURIComponent(periodo?.nombre || "")}"
              class="btn-ghost flex-1 text-center text-sm"
            >Ver estudiantes</a>
            <a
              href="fichas-ciclo-periodo.html?cp=${esc(cp.id)}&ciclo=${encodeURIComponent(ciclo.nombre)}&periodo=${encodeURIComponent(periodo?.nombre || "")}"
              class="btn-ghost flex-1 text-center text-sm"
            >Ver fichas</a>
          </div>
        </article>`;
      })
      .join("");

    /* bind botones "Gestionar docentes" */
    container.querySelectorAll("[data-gestionar-cp]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openDocentesModal(btn.dataset.gestionarCp, btn.dataset.cicloNombre, btn.dataset.periodoNombre);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Modal: Gestionar docentes                                            */
  /* ------------------------------------------------------------------ */

  function openDocentesModal(cpId, cicloNombre, periodoNombre) {
    _cpEditando = cpId;
    _docentesTmp = GestionPeriodoData.getDocentesAsignados(_data, cpId);

    document.getElementById("modal-docentes-title").textContent =
      `Docentes asignados — ${cicloNombre}`;
    document.getElementById("modal-docentes-sub").textContent =
      `Período: ${periodoNombre}`;

    renderDocentesList();
    buildDocenteAgregarSelect();

    const backdrop = document.getElementById("modal-docentes-backdrop");
    backdrop.classList.remove("hidden");
    backdrop.classList.add("flex");
  }

  function closeDocentesModal() {
    const backdrop = document.getElementById("modal-docentes-backdrop");
    backdrop.classList.add("hidden");
    backdrop.classList.remove("flex");
    _cpEditando = null;
    _docentesTmp = [];
  }

  function renderDocentesList() {
    const list  = document.getElementById("docentes-asignados-list");
    const empty = document.getElementById("docentes-asignados-empty");
    if (!_docentesTmp.length) {
      list.innerHTML = "";
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");
    list.innerHTML = _docentesTmp
      .map(
        (d) => `
        <li class="flex items-center justify-between gap-3 rounded-md border border-border bg-bg px-3 py-2">
          <span class="text-sm font-medium text-text">${esc(d.nombre)}</span>
          <button type="button" class="btn-ghost text-xs text-danger" data-quitar-docente="${esc(d.docente_id)}">Quitar</button>
        </li>`
      )
      .join("");
    list.querySelectorAll("[data-quitar-docente]").forEach((btn) => {
      btn.addEventListener("click", () => {
        _docentesTmp = _docentesTmp.filter((d) => d.docente_id !== btn.dataset.quitarDocente);
        renderDocentesList();
        buildDocenteAgregarSelect();
      });
    });
  }

  function buildDocenteAgregarSelect() {
    const sel = document.getElementById("select-docente-agregar");
    const asignadosIds = new Set(_docentesTmp.map((d) => d.docente_id));
    const disponibles = GestionPeriodoData.DOCENTES_DISPONIBLES.filter((d) => !asignadosIds.has(d.id));
    sel.innerHTML =
      `<option value="">Seleccionar docente…</option>` +
      disponibles.map((d) => `<option value="${esc(d.id)}">${esc(d.nombre)}</option>`).join("");
  }

  /* ------------------------------------------------------------------ */
  /* Modal: Clonar período                                                */
  /* ------------------------------------------------------------------ */

  function openClonarModal() {
    const sel = document.getElementById("select-origen-clonar");
    const otros = _data.periodos.filter((p) => p.id !== _periodoActual.id && _data.ciclo_periodos[p.id]);
    if (!otros.length) {
      toast("No hay períodos anteriores con datos para clonar", "warning");
      return;
    }
    sel.innerHTML = otros.map((p) => `<option value="${esc(p.id)}">${esc(p.nombre)}</option>`).join("");

    const backdrop = document.getElementById("modal-clonar-backdrop");
    backdrop.classList.remove("hidden");
    backdrop.classList.add("flex");
  }

  function closeClonarModal() {
    const backdrop = document.getElementById("modal-clonar-backdrop");
    backdrop.classList.add("hidden");
    backdrop.classList.remove("flex");
  }

  /* ------------------------------------------------------------------ */
  /* Modal: Nuevo período                                                 */
  /* ------------------------------------------------------------------ */

  function openNuevoPeriodoModal() {
    document.getElementById("form-nuevo-periodo").reset();
    const backdrop = document.getElementById("modal-nuevo-periodo-backdrop");
    backdrop.classList.remove("hidden");
    backdrop.classList.add("flex");
    document.getElementById("np-nombre").focus();
  }

  function closeNuevoPeriodoModal() {
    const backdrop = document.getElementById("modal-nuevo-periodo-backdrop");
    backdrop.classList.add("hidden");
    backdrop.classList.remove("flex");
  }

  /* ------------------------------------------------------------------ */
  /* Init                                                                 */
  /* ------------------------------------------------------------------ */

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.GestionPeriodoData) return;
    render();

    /* Select período */
    document.getElementById("select-periodo").addEventListener("change", (e) => {
      const per = _data.periodos.find((p) => p.id === e.target.value);
      if (!per) return;
      _periodoActual = per;
      toggleBadgeVigente(per.activo);
      renderCards(per.id);
    });

    /* Botón clonar */
    document.getElementById("btn-clonar").addEventListener("click", openClonarModal);
    document.getElementById("btn-clonar-cancelar").addEventListener("click", closeClonarModal);
    document.getElementById("modal-clonar-backdrop").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeClonarModal();
    });
    document.getElementById("btn-clonar-confirmar").addEventListener("click", () => {
      const origenId = document.getElementById("select-origen-clonar").value;
      GestionPeriodoData.clonarPeriodo(_data, origenId, _periodoActual.id);
      closeClonarModal();
      renderCards(_periodoActual.id);
      toast("Configuración clonada correctamente");
    });

    /* Botón nuevo período */
    document.getElementById("btn-nuevo-periodo").addEventListener("click", openNuevoPeriodoModal);
    document.getElementById("btn-np-cancelar").addEventListener("click", closeNuevoPeriodoModal);
    document.getElementById("modal-nuevo-periodo-backdrop").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeNuevoPeriodoModal();
    });
    document.getElementById("form-nuevo-periodo").addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = document.getElementById("np-nombre").value.trim();
      if (!nombre) { toast("Ingresa el nombre del período", "warning"); return; }
      const inicio = document.getElementById("np-inicio").value;
      const fin    = document.getElementById("np-fin").value;
      const clonar = document.getElementById("np-clonar").checked;
      const newId  = GestionPeriodoData.addPeriodo(_data, nombre, inicio, fin);
      if (clonar) GestionPeriodoData.clonarPeriodo(_data, _periodoActual.id, newId);
      closeNuevoPeriodoModal();
      render();
      toast(`Período "${nombre}" creado`);
    });

    /* Modal docentes — botones fijos */
    document.getElementById("btn-agregar-docente").addEventListener("click", () => {
      const sel   = document.getElementById("select-docente-agregar");
      const id    = sel.value;
      if (!id) return;
      const doc = GestionPeriodoData.DOCENTES_DISPONIBLES.find((d) => d.id === id);
      if (!doc) return;
      _docentesTmp.push({ docente_id: doc.id, nombre: doc.nombre, foto_url: "" });
      renderDocentesList();
      buildDocenteAgregarSelect();
    });

    document.getElementById("btn-docentes-cancelar").addEventListener("click", closeDocentesModal);
    document.getElementById("modal-docentes-backdrop").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeDocentesModal();
    });
    document.getElementById("btn-docentes-guardar").addEventListener("click", () => {
      if (!_cpEditando) return;
      GestionPeriodoData.setDocentesAsignados(_data, _cpEditando, _docentesTmp.slice());
      closeDocentesModal();
      renderCards(_periodoActual.id);
      toast("Docentes actualizados");
    });
  });
})();
