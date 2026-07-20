/**
 * gestion-periodo.js — Configuración del período (hub + drawer docentes).
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

  let _data;
  let _periodoId = null;
  let _cpDrawer = null; /* { id, ciclo_nombre, periodo_nombre, periodo_id } */

  function formatWhen(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function currentPeriodo() {
    return GestionPeriodoData.periodoById(_data, _periodoId) || GestionPeriodoData.periodoVigente(_data);
  }

  function render() {
    _data = GestionPeriodoData.load();
    if (!_periodoId) {
      _periodoId = GestionPeriodoData.periodoVigente(_data)?.id || _data.periodos[0]?.id;
    }
    if (!_data.periodos.some((p) => p.id === _periodoId)) {
      _periodoId = GestionPeriodoData.periodoVigente(_data)?.id || _data.periodos[0]?.id;
    }
    renderSelect();
    renderSummary();
    renderTable();
  }

  function renderSelect() {
    const sel = document.getElementById("select-periodo");
    const per = currentPeriodo();
    sel.innerHTML = _data.periodos
      .map(
        (p) =>
          `<option value="${esc(p.id)}" ${p.id === _periodoId ? "selected" : ""}>${esc(p.nombre)}${
            p.activo ? " · Vigente" : ""
          }</option>`
      )
      .join("");
    document.getElementById("badge-vigente").classList.toggle("hidden", !per?.activo);
  }

  function renderSummary() {
    const s = GestionPeriodoData.summary(_data, _periodoId);
    document.getElementById("sum-ciclos").textContent = String(s.ciclos);
    document.getElementById("sum-docentes").textContent = String(s.docentes);
    document.getElementById("sum-matriculados").textContent = String(s.matriculados);
  }

  function renderTable() {
    const rows = GestionPeriodoData.listCicloPeriodos(_data, _periodoId);
    const tbody = document.getElementById("tbody-ciclos");
    const empty = document.getElementById("empty-ciclos");
    const wrap = document.querySelector("#panel-tabla .catalog-table-wrap");

    if (!rows.length) {
      tbody.innerHTML = "";
      empty.classList.remove("hidden");
      wrap?.classList.add("hidden");
      return;
    }
    empty.classList.add("hidden");
    wrap?.classList.remove("hidden");

    const base = getBasePath();
    tbody.innerHTML = rows
      .map((r, i) => {
        const docLabel =
          r.n_docentes === 1 ? "1 tutor" : `${r.n_docentes} tutores`;
        const temLabel = r.n_temas === 1 ? "1 tema" : `${r.n_temas} temas`;
        return `
        <tr data-cp-id="${esc(r.id)}" data-ciclo-id="${esc(r.ciclo_id)}">
          <td class="col-num text-center">${i + 1}</td>
          <td class="col-primary">${esc(r.ciclo_nombre)}</td>
          <td class="col-muted">${esc(docLabel)}</td>
          <td class="col-muted">${esc(temLabel)}</td>
          <td class="col-muted">${r.n_matriculados}</td>
          <td class="col-actions">
            <div class="catalog-actions">
              <button type="button" class="btn-action btn-action-view" data-action-docentes title="Docentes" aria-label="Docentes del ciclo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
              </button>
              <a
                class="btn-action btn-action-edit"
                href="temario.html?cp=${encodeURIComponent(r.id)}"
                title="Temario"
                aria-label="Temario del ciclo"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                </svg>
              </a>
              <button type="button" class="btn-action btn-action-danger" data-action-quitar title="Quitar ciclo" aria-label="Quitar ciclo del período">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          </td>
        </tr>`;
      })
      .join("");
  }

  /* —— Agregar ciclos —— */
  function openAgregar() {
    const disponibles = GestionPeriodoData.ciclosDisponibles(_data, _periodoId);
    const list = document.getElementById("lista-ciclos-agregar");
    const vacio = document.getElementById("agregar-vacio");
    const btn = document.getElementById("btn-agregar-confirmar");
    if (!disponibles.length) {
      list.innerHTML = "";
      vacio.classList.remove("hidden");
      btn.disabled = true;
    } else {
      vacio.classList.add("hidden");
      btn.disabled = false;
      list.innerHTML = disponibles
        .map(
          (c) => `
        <label class="gp-check-item">
          <input type="checkbox" name="ciclo" value="${esc(c.id)}" />
          <span>${esc(c.nombre)}</span>
        </label>`
        )
        .join("");
    }
    showModal("modal-agregar-backdrop");
  }

  function confirmAgregar() {
    const ids = [...document.querySelectorAll('#lista-ciclos-agregar input[name="ciclo"]:checked')].map(
      (el) => el.value
    );
    if (!ids.length) {
      toast("Selecciona al menos un ciclo", "warning");
      return;
    }
    const added = GestionPeriodoData.addCiclos(_data, _periodoId, ids);
    hideModal("modal-agregar-backdrop");
    render();
    toast(added.length === 1 ? `Se agregó ${added[0]}` : `Se agregaron ${added.length} ciclos`);
  }

  /* —— Clonar —— */
  function openClonar() {
    const otros = _data.periodos.filter(
      (p) => p.id !== _periodoId && Object.keys(_data.ciclo_periodos[p.id] || {}).length
    );
    if (!otros.length) {
      toast("No hay períodos con ciclos para clonar", "warning");
      return;
    }
    const sel = document.getElementById("select-origen-clonar");
    sel.innerHTML = otros.map((p) => `<option value="${esc(p.id)}">${esc(p.nombre)}</option>`).join("");
    updateClonePreview();
    showModal("modal-clonar-backdrop");
  }

  function updateClonePreview() {
    const origenId = document.getElementById("select-origen-clonar").value;
    const dest = currentPeriodo();
    const origen = GestionPeriodoData.periodoById(_data, origenId);
    const preview = GestionPeriodoData.previewClone(_data, origenId, _periodoId);
    const el = document.getElementById("clonar-preview");
    const btn = document.getElementById("btn-clonar-confirmar");
    document.getElementById("modal-clonar-title").textContent =
      `Clonar desde ${origen?.nombre || "…"} → ${dest?.nombre || "…"}`;

    if (!preview.agregar.length) {
      el.innerHTML = `<p>No hay ciclos nuevos que agregar: todos los del origen ya existen en el destino.</p>`;
      btn.disabled = true;
      btn.textContent = "Clonar";
      return;
    }
    btn.disabled = false;
    btn.textContent = `Clonar ${preview.agregar.length}`;
    el.innerHTML = `
      <p>Se agregarán <strong class="text-text">${preview.agregar.length}</strong> ciclo(s) (con docentes y temario):</p>
      <ul>${preview.agregar.map((a) => `<li>+ ${esc(a.nombre)}</li>`).join("")}</ul>
      ${
        preview.omitir.length
          ? `<p class="mt-2">Se omiten ${preview.omitir.length} que ya existen (no se tocan): ${esc(
              preview.omitir.join(", ")
            )}</p>`
          : ""
      }`;
  }

  function confirmClonar() {
    const origenId = document.getElementById("select-origen-clonar").value;
    const result = GestionPeriodoData.clonarMerge(_data, origenId, _periodoId);
    hideModal("modal-clonar-backdrop");
    render();
    if (!result.agregar.length) {
      toast("No había ciclos nuevos que clonar", "warning");
      return;
    }
    toast(`Se clonaron ${result.agregar.length} ciclo(s)`);
  }

  /* —— Quitar ciclo —— */
  function askQuitar(cicloId, cicloNombre) {
    const check = GestionPeriodoData.canRemoveCiclo(_data, _periodoId, cicloId);
    if (!check.ok) {
      return AppConfirm.request({
        title: "No se puede quitar",
        confirmLabel: "Entendido",
        cancelLabel: "Cerrar",
        variant: "warning",
        messageHtml: `<p><strong class="text-text">${esc(cicloNombre)}</strong> tiene datos asociados.</p><p>${esc(
          check.reason
        )}</p>`,
      });
    }
    return AppConfirm.request({
      title: "Quitar ciclo del período",
      confirmLabel: "Quitar",
      cancelLabel: "Cancelar",
      variant: "danger",
      messageHtml: `<p>¿Quitar <strong class="text-text">${esc(
        cicloNombre
      )}</strong> de este período? No tiene docentes, temario ni matriculados.</p>`,
    }).then((ok) => {
      if (!ok) return;
      GestionPeriodoData.removeCiclo(_data, _periodoId, cicloId);
      render();
      toast("Ciclo quitado del período");
    });
  }

  /* —— Historial —— */
  function openHistorial() {
    const per = currentPeriodo();
    document.getElementById("modal-hist-sub").textContent = per
      ? `Período ${per.nombre} · ciclos y docentes`
      : "";
    const list = document.getElementById("modal-hist-list");
    const rows = GestionPeriodoData.listMovimientos(_data, _periodoId);
    if (!rows.length) {
      list.innerHTML = `
        <div class="historial-empty">
          <p class="historial-empty-title">Sin movimientos</p>
          <p class="historial-empty-text">Aún no hay altas/bajas de ciclos o docentes en este período.</p>
        </div>`;
    } else {
      list.innerHTML = `<ol class="historial-timeline">${rows
        .map((r) => {
          const badge =
            r.accion === "eliminar"
              ? "badge badge-danger"
              : r.accion === "crear"
                ? "badge badge-success"
                : "badge badge-info";
          const label =
            r.accion === "eliminar" ? "Quitar" : r.accion === "crear" ? "Agregar" : esc(r.accion);
          return `
          <li class="historial-item">
            <div class="historial-item-head">
              <span class="${badge}">${label}</span>
              <time class="historial-time">${esc(formatWhen(r.created_at))}</time>
            </div>
            <dl class="historial-meta-grid">
              <div><dt>Quién</dt><dd>${esc(r.usuario_nombre)}</dd></div>
              <div><dt>Entidad</dt><dd>${esc(r.tabla === "docente_ciclo_periodo" ? "Docente del ciclo" : "Ciclo del período")}</dd></div>
            </dl>
            <p class="mt-2 text-sm text-text">${esc(r.resumen)}</p>
          </li>`;
        })
        .join("")}</ol>`;
    }
    showModal("modal-historial-backdrop");
  }

  /* —— Drawer docentes —— */
  function openDrawer(row) {
    const per = currentPeriodo();
    _cpDrawer = {
      id: row.id,
      ciclo_id: row.ciclo_id,
      ciclo_nombre: row.ciclo_nombre,
      periodo_id: _periodoId,
      periodo_nombre: per?.nombre || "",
    };
    document.getElementById("drawer-doc-title").textContent = `Docentes — ${row.ciclo_nombre}`;
    document.getElementById("drawer-doc-sub").textContent = per?.nombre || "";
    renderDrawerList();
    const backdrop = document.getElementById("drawer-docentes-backdrop");
    const drawer = document.getElementById("drawer-docentes");
    backdrop.classList.remove("hidden");
    drawer.hidden = false;
    requestAnimationFrame(() => drawer.classList.add("is-open"));
  }

  function closeDrawer() {
    const backdrop = document.getElementById("drawer-docentes-backdrop");
    const drawer = document.getElementById("drawer-docentes");
    drawer.classList.remove("is-open");
    setTimeout(() => {
      backdrop.classList.add("hidden");
      drawer.hidden = true;
      _cpDrawer = null;
    }, 200);
  }

  function renderDrawerList() {
    if (!_cpDrawer) return;
    const docs = GestionPeriodoData.getDocentesAsignados(_data, _cpDrawer.id);
    const body = document.getElementById("drawer-doc-body");
    const empty = document.getElementById("drawer-doc-empty");
    const foot = document.getElementById("drawer-doc-foot");
    const wrap = body.closest(".catalog-table-wrap");

    if (!docs.length) {
      body.innerHTML = "";
      empty.classList.remove("hidden");
      wrap?.classList.add("hidden");
    } else {
      empty.classList.add("hidden");
      wrap?.classList.remove("hidden");
      body.innerHTML = docs
        .map(
          (d) => `
        <tr>
          <td class="col-primary">${esc(d.nombre)}</td>
          <td class="text-center col-muted">${Number(d.n_tutorados) || 0}</td>
          <td class="col-actions text-right">
            <button type="button" class="btn-action btn-action-danger" data-quitar-doc="${esc(
              d.docente_id
            )}" title="Quitar" aria-label="Quitar docente">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </td>
        </tr>`
        )
        .join("");
    }

    const totalTutorados = docs.reduce((a, d) => a + (Number(d.n_tutorados) || 0), 0);
    const n = docs.length;
    const prom = n ? Math.round((totalTutorados / n) * 10) / 10 : 0;
    foot.textContent = `${totalTutorados} tutorados en el ciclo · ${n} tutor${n === 1 ? "" : "es"} · promedio ${prom} c/u`;
  }

  function askQuitarDocente(docenteId) {
    if (!_cpDrawer) return;
    const check = GestionPeriodoData.canRemoveDocente(_data, _cpDrawer.id, docenteId);
    if (!check.ok) {
      return AppConfirm.request({
        title: "No se puede quitar",
        confirmLabel: "Entendido",
        cancelLabel: "Cerrar",
        variant: "warning",
        messageHtml: `<p><strong class="text-text">${esc(
          check.nombre || "Este docente"
        )}</strong> tiene ${check.n_tutorados} tutorado(s) en este ciclo.</p><p>${esc(check.reason)}</p>`,
      });
    }
    return AppConfirm.request({
      title: "Quitar docente",
      confirmLabel: "Quitar",
      cancelLabel: "Cancelar",
      variant: "danger",
      messageHtml: `<p>¿Quitar a <strong class="text-text">${esc(
        check.row.nombre
      )}</strong> del pool de este ciclo?</p>`,
    }).then((ok) => {
      if (!ok) return;
      GestionPeriodoData.removeDocente(_data, _cpDrawer.periodo_id, _cpDrawer.id, docenteId);
      renderDrawerList();
      renderSummary();
      renderTable();
      toast("Docente quitado del ciclo");
    });
  }

  function openAsignar() {
    if (!_cpDrawer) return;
    document.getElementById("asignar-buscar").value = "";
    paintAsignarList("");
    showModal("modal-asignar-backdrop");
  }

  function paintAsignarList(q) {
    const disponibles = GestionPeriodoData.docentesDisponiblesParaCp(
      _data,
      _cpDrawer.periodo_id,
      _cpDrawer.id
    );
    const query = (q || "").trim().toLowerCase();
    const filtered = query
      ? disponibles.filter((d) => d.nombre.toLowerCase().includes(query))
      : disponibles;
    const list = document.getElementById("lista-asignar-docentes");
    const vacio = document.getElementById("asignar-vacio");
    const btn = document.getElementById("btn-asignar-confirmar");
    if (!filtered.length) {
      list.innerHTML = "";
      vacio.classList.remove("hidden");
      btn.disabled = true;
      return;
    }
    vacio.classList.add("hidden");
    btn.disabled = false;
    list.innerHTML = filtered
      .map(
        (d) => `
      <label class="gp-check-item">
        <input type="checkbox" name="docente" value="${esc(d.id)}" />
        <span class="flex-1 min-w-0">
          <span class="block font-medium text-text truncate">${esc(d.nombre)}</span>
          <span class="block text-xs text-text-muted">Carga en el período: ${d.carga_periodo} tutorado(s)</span>
        </span>
      </label>`
      )
      .join("");
  }

  function confirmAsignar() {
    const ids = [...document.querySelectorAll('#lista-asignar-docentes input[name="docente"]:checked')].map(
      (el) => el.value
    );
    if (!ids.length) {
      toast("Selecciona al menos un docente", "warning");
      return;
    }
    const added = GestionPeriodoData.assignDocentes(
      _data,
      _cpDrawer.periodo_id,
      _cpDrawer.id,
      ids
    );
    hideModal("modal-asignar-backdrop");
    renderDrawerList();
    renderSummary();
    renderTable();
    toast(added.length === 1 ? `Se asignó ${added[0]}` : `Se asignaron ${added.length} docentes`);
  }

  /* —— Modales helpers —— */
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

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.GestionPeriodoData) return;
    if (window.MatriculasData) MatriculasData.ensureAllConfigured();
    render();

    document.getElementById("select-periodo").addEventListener("change", (e) => {
      _periodoId = e.target.value;
      render();
    });

    document.getElementById("btn-agregar-ciclos").addEventListener("click", openAgregar);
    document.getElementById("btn-clonar").addEventListener("click", openClonar);
    document.getElementById("btn-historial").addEventListener("click", openHistorial);

    document.querySelectorAll("[data-open-agregar]").forEach((b) => b.addEventListener("click", openAgregar));
    document.querySelectorAll("[data-open-clonar]").forEach((b) => b.addEventListener("click", openClonar));

    document.getElementById("btn-agregar-cancelar").addEventListener("click", () => hideModal("modal-agregar-backdrop"));
    document.getElementById("btn-agregar-confirmar").addEventListener("click", confirmAgregar);
    document.getElementById("modal-agregar-backdrop").addEventListener("click", (e) => {
      if (e.target.id === "modal-agregar-backdrop") hideModal("modal-agregar-backdrop");
    });

    document.getElementById("btn-clonar-cancelar").addEventListener("click", () => hideModal("modal-clonar-backdrop"));
    document.getElementById("btn-clonar-confirmar").addEventListener("click", confirmClonar);
    document.getElementById("select-origen-clonar").addEventListener("change", updateClonePreview);
    document.getElementById("modal-clonar-backdrop").addEventListener("click", (e) => {
      if (e.target.id === "modal-clonar-backdrop") hideModal("modal-clonar-backdrop");
    });

    document.getElementById("btn-hist-cerrar").addEventListener("click", () => hideModal("modal-historial-backdrop"));
    document.getElementById("modal-historial-backdrop").addEventListener("click", (e) => {
      if (e.target.id === "modal-historial-backdrop") hideModal("modal-historial-backdrop");
    });

    document.getElementById("tbody-ciclos").addEventListener("click", (e) => {
      const tr = e.target.closest("tr[data-cp-id]");
      if (!tr) return;
      const rows = GestionPeriodoData.listCicloPeriodos(_data, _periodoId);
      const row = rows.find((r) => r.id === tr.dataset.cpId);
      if (!row) return;
      if (e.target.closest("[data-action-docentes]")) {
        openDrawer(row);
        return;
      }
      if (e.target.closest("[data-action-quitar]")) {
        askQuitar(row.ciclo_id, row.ciclo_nombre);
      }
    });

    document.getElementById("btn-drawer-cerrar").addEventListener("click", closeDrawer);
    document.getElementById("drawer-docentes-backdrop").addEventListener("click", closeDrawer);
    document.getElementById("btn-asignar-docentes").addEventListener("click", openAsignar);

    document.getElementById("drawer-doc-body").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-quitar-doc]");
      if (!btn) return;
      askQuitarDocente(btn.getAttribute("data-quitar-doc"));
    });

    document.getElementById("btn-asignar-cancelar").addEventListener("click", () => hideModal("modal-asignar-backdrop"));
    document.getElementById("btn-asignar-confirmar").addEventListener("click", confirmAsignar);
    document.getElementById("asignar-buscar").addEventListener("input", (e) => paintAsignarList(e.target.value));
    document.getElementById("modal-asignar-backdrop").addEventListener("click", (e) => {
      if (e.target.id === "modal-asignar-backdrop") hideModal("modal-asignar-backdrop");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!document.getElementById("modal-asignar-backdrop").classList.contains("hidden")) {
        hideModal("modal-asignar-backdrop");
        return;
      }
      if (!document.getElementById("drawer-docentes").hidden) closeDrawer();
    });
  });
})();
