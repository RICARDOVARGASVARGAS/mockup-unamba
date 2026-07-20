/**
 * avanzar-estudiantes.js — propuesta revisable origen → destino.
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

  let payload = null;
  let filtroAccion = "";
  let filtroTutor = "";
  let filtroQ = "";
  let chipActivo = "";

  const ACCION_LABEL = {
    avanza: "Avanza",
    repite: "Repite",
    egresa: "Egresa",
    excluir: "Excluir",
  };

  function data() {
    return GestionPeriodoData.load();
  }

  function cicloNombre(id) {
    if (!id) return "—";
    return GestionPeriodoData.cicloById(data(), id)?.nombre || id;
  }

  function poolDocs(cicloId) {
    if (!payload || !cicloId) return [];
    const map = AvanzarData.pools(data(), payload.destinoId);
    return map[cicloId]?.docentes || [];
  }

  function allTutorsInDestino() {
    if (!payload) return [];
    const map = AvanzarData.pools(data(), payload.destinoId);
    const byId = new Map();
    Object.values(map).forEach((p) => {
      (p.docentes || []).forEach((d) => byId.set(d.docente_id, d));
    });
    return [...byId.values()];
  }

  function fillPeriodos() {
    const d = data();
    const periodos = d.periodos || [];
    const vigente = GestionPeriodoData.periodoVigente(d);
    const origenDefault =
      periodos.find((p) => p.nombre === "2025-II")?.id ||
      periodos.find((p) => !p.activo)?.id ||
      periodos[0]?.id;
    const destinoDefault = vigente?.id || periodos[periodos.length - 1]?.id;

    const selO = document.getElementById("sel-origen");
    const selD = document.getElementById("sel-destino");
    selO.innerHTML = periodos.map((p) => `<option value="${esc(p.id)}">${esc(p.nombre)}</option>`).join("");
    selD.innerHTML = periodos.map((p) => `<option value="${esc(p.id)}">${esc(p.nombre)}</option>`).join("");
    selO.value = origenDefault;
    selD.value = destinoDefault;
  }

  function renderContadores() {
    const c = AvanzarData.contadores(payload.rows);
    const el = document.getElementById("contadores");
    const chips = [
      { key: "", label: `Propuesta: ${c.total}`, warn: false },
      { key: "avanza", label: `Avanza ${c.avanza}`, warn: false },
      { key: "repite", label: `Repite ${c.repite}`, warn: false },
      { key: "egresa", label: `Egresa ${c.egresa}`, warn: false },
      { key: "excluir", label: `Excluir ${c.excluir}`, warn: false },
      { key: "sin_tutor", label: `⚠ Sin tutor: ${c.sin_tutor}`, warn: true },
    ];
    el.innerHTML = chips
      .map(
        (ch) => `
      <button type="button" class="avanzar-chip ${ch.warn ? "avanzar-chip-warn" : ""} ${
          chipActivo === ch.key ? "is-active" : ""
        }" data-chip="${esc(ch.key)}">${esc(ch.label)}</button>`
      )
      .join("");

    const marcados = payload.rows.filter((r) => r.selected && r.accion !== "excluir").length;
    document.getElementById("btn-confirmar").textContent = `Confirmar (${marcados} marcados)`;
  }

  function filteredRows() {
    let list = payload.rows.slice();
    const acc = chipActivo || filtroAccion;
    if (acc === "sin_tutor") {
      list = list.filter(
        (r) => (r.accion === "avanza" || r.accion === "repite") && !r.docente_destino_id
      );
    } else if (acc) {
      list = list.filter((r) => r.accion === acc);
    }
    if (filtroTutor) list = list.filter((r) => r.docente_destino_id === filtroTutor);
    if (filtroQ) {
      const q = filtroQ.toLowerCase();
      list = list.filter(
        (r) =>
          AvanzarData.nombreCompleto(r).toLowerCase().includes(q) ||
          String(r.codigo_universitario).toLowerCase().includes(q)
      );
    }
    return list;
  }

  function applyAccion(row, accion) {
    row.accion = accion;
    row.ciclo_faltante = false;
    const ciclos = data().ciclos || [];
    if (accion === "egresa" || accion === "excluir") {
      row.ciclo_destino_id = null;
      row.docente_destino_id = "";
      return;
    }
    if (accion === "repite") {
      row.ciclo_destino_id = row.ciclo_origen_id;
    } else if (accion === "avanza") {
      const sig = AvanzarData.cicloSiguiente(ciclos, row.ciclo_origen_id);
      row.ciclo_destino_id = sig?.id || null;
      if (!sig) {
        row.accion = "egresa";
        row.ciclo_destino_id = null;
        row.docente_destino_id = "";
        return;
      }
    }
    const poolMap = AvanzarData.pools(data(), payload.destinoId);
    const enDestino = Boolean(row.ciclo_destino_id && poolMap[row.ciclo_destino_id]);
    row.ciclo_faltante = !enDestino;
    const pool = poolDocs(row.ciclo_destino_id);
    if (!enDestino) {
      row.docente_destino_id = "";
      return;
    }
    if (!pool.some((d) => d.docente_id === row.docente_destino_id)) {
      row.docente_destino_id = pool[0]?.docente_id || "";
    }
  }

  function renderTable() {
    const list = filteredRows();
    const tbody = document.getElementById("tbody-propuesta");
    tbody.innerHTML = list
      .map((row) => {
        const idx = payload.rows.indexOf(row);
        const docs = poolDocs(row.ciclo_destino_id);
        const needsTutor = row.accion === "avanza" || row.accion === "repite";
        const tutorHtml = !needsTutor
          ? `<span class="text-text-muted">—</span>`
          : docs.length
            ? `<select data-tutor="${idx}" class="form-input py-1 text-sm min-w-[10rem]">
                <option value="">Elegir tutor…</option>
                ${docs
                  .map(
                    (d) =>
                      `<option value="${esc(d.docente_id)}" ${
                        d.docente_id === row.docente_destino_id ? "selected" : ""
                      }>${esc(d.nombre)}</option>`
                  )
                  .join("")}
              </select>`
            : `<span class="tutor-warn">⚠ elegir tutor</span>`;

        const destLabel =
          row.accion === "egresa" || row.accion === "excluir"
            ? "—"
            : row.ciclo_faltante
              ? `<span class="tutor-warn">${esc(cicloNombre(row.ciclo_destino_id))} (no configurado)</span>`
              : esc(cicloNombre(row.ciclo_destino_id));

        return `
        <tr class="${row.selected ? "" : "opacity-50"}" data-idx="${idx}">
          <td class="text-center">
            <input type="checkbox" data-sel class="h-4 w-4 rounded border-border text-primary" ${
              row.selected ? "checked" : ""
            } aria-label="Seleccionar" />
          </td>
          <td>
            <div class="font-medium text-text">${esc(AvanzarData.nombreCompleto(row))}</div>
            <div class="text-xs text-text-muted font-mono">${esc(row.codigo_universitario)}</div>
          </td>
          <td class="col-muted">${esc(cicloNombre(row.ciclo_origen_id))}</td>
          <td class="col-muted">${destLabel}</td>
          <td>${tutorHtml}</td>
          <td>
            <select data-accion="${idx}" class="form-input py-1 text-sm min-w-[7.5rem]">
              ${Object.entries(ACCION_LABEL)
                .map(
                  ([k, lab]) =>
                    `<option value="${k}" ${row.accion === k ? "selected" : ""}>${lab}</option>`
                )
                .join("")}
            </select>
          </td>
        </tr>`;
      })
      .join("");

    const visibles = list;
    document.getElementById("check-all").checked =
      visibles.length > 0 && visibles.every((r) => r.selected);
    document.getElementById("bulk-count").textContent = `Con seleccionados (${
      payload.rows.filter((r) => r.selected).length
    }):`;
  }

  function paintTutorFilters() {
    const tutors = allTutorsInDestino();
    const sel = document.getElementById("filtro-tutor");
    const cur = filtroTutor;
    sel.innerHTML =
      `<option value="">Todos</option>` +
      tutors.map((d) => `<option value="${esc(d.docente_id)}">${esc(d.nombre)}</option>`).join("");
    sel.value = cur;

    const bulk = document.getElementById("bulk-tutor");
    bulk.innerHTML =
      `<option value="">Asignar tutor…</option>` +
      tutors.map((d) => `<option value="${esc(d.docente_id)}">${esc(d.nombre)}</option>`).join("");
  }

  function showPropuesta(show) {
    document.getElementById("panel-propuesta").classList.toggle("hidden", !show);
    document.getElementById("panel-vacio").classList.toggle("hidden", show);
  }

  function refresh() {
    if (!payload) {
      showPropuesta(false);
      return;
    }
    showPropuesta(true);
    paintTutorFilters();
    renderContadores();
    renderTable();
    AvanzarData.savePropuesta(payload);
  }

  function generar() {
    const origenId = document.getElementById("sel-origen").value;
    const destinoId = document.getElementById("sel-destino").value;
    if (!origenId || !destinoId) {
      toast("Elige períodos de origen y destino", "warning");
      return;
    }
    if (origenId === destinoId) {
      toast("Origen y destino deben ser distintos", "warning");
      return;
    }
    if (!window.MatriculasData) {
      toast("No se pudo cargar matrículas", "warning");
      return;
    }
    const destCiclos = GestionPeriodoData.listCicloPeriodos(data(), destinoId);
    if (!destCiclos.length) {
      toast("El período destino no tiene ciclos configurados", "warning");
      return;
    }
    MatriculasData.ensurePeriodo(origenId);
    const activos = MatriculasData.listActivosByPeriodo(origenId);
    if (!activos.length) {
      toast("El período origen no tiene estudiantes activos matriculados", "warning");
      return;
    }
    payload = AvanzarData.generarPropuesta(origenId, destinoId);
    chipActivo = "";
    filtroAccion = "";
    document.getElementById("filtro-accion").value = "";
    toast(`Propuesta generada: ${payload.rows.length} estudiantes del origen`);
    refresh();
  }

  function confirmar() {
    if (!payload) return;
    const c = AvanzarData.contadores(payload.rows);
    const sinTutor = payload.rows.filter(
      (r) =>
        r.selected &&
        (r.accion === "avanza" || r.accion === "repite") &&
        !r.docente_destino_id
    );
    if (sinTutor.length) {
      toast(`Hay ${sinTutor.length} estudiante(s) sin tutor destino`, "warning");
      chipActivo = "sin_tutor";
      refresh();
      return;
    }
    const marcados = payload.rows.filter((r) => r.selected && r.accion !== "excluir").length;
    AppConfirm.request({
      title: "Confirmar avance",
      confirmLabel: "Confirmar",
      cancelLabel: "Cancelar",
      variant: "primary",
      messageHtml: `
        <p>Se procesarán <strong class="text-text">${marcados}</strong> estudiantes.</p>
        <p class="mt-1 text-sm">Avanza/Repite crean matrícula en el destino. Egresa marca egresado. El origen no se modifica.</p>
        <p class="mt-1 text-sm text-text-muted">Avanza ${c.avanza} · Repite ${c.repite} · Egresa ${c.egresa} · Excluir ${c.excluir}</p>`,
    }).then((ok) => {
      if (!ok) return;
      const res = AvanzarData.confirmar(payload);
      payload = null;
      showPropuesta(false);
      const omit =
        res.omitidos > 0 ? ` · ${res.omitidos} omitidos (ya matriculados o sin tutor)` : "";
      toast(
        `${res.procesados} estudiantes procesados · ${res.matriculas} matriculados · ${res.egresados} egresados${omit}`
      );
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.GestionPeriodoData || !window.AvanzarData) return;
    AvanzarData.ensureVersion();
    fillPeriodos();
    payload = AvanzarData.loadPropuesta();
    if (payload) {
      document.getElementById("sel-origen").value = payload.origenId;
      document.getElementById("sel-destino").value = payload.destinoId;
    }
    refresh();

    document.getElementById("btn-generar").addEventListener("click", generar);
    document.getElementById("btn-confirmar").addEventListener("click", confirmar);

    document.getElementById("contadores").addEventListener("click", (e) => {
      const chip = e.target.closest("[data-chip]");
      if (!chip) return;
      chipActivo = chip.getAttribute("data-chip") || "";
      filtroAccion = chipActivo === "sin_tutor" ? "" : chipActivo;
      document.getElementById("filtro-accion").value = filtroAccion;
      refresh();
    });

    document.getElementById("filtro-accion").addEventListener("change", (e) => {
      filtroAccion = e.target.value;
      chipActivo = filtroAccion;
      refresh();
    });
    document.getElementById("filtro-tutor").addEventListener("change", (e) => {
      filtroTutor = e.target.value;
      refresh();
    });
    document.getElementById("filtro-buscar").addEventListener("input", (e) => {
      filtroQ = e.target.value.trim();
      renderTable();
    });

    document.getElementById("check-all").addEventListener("change", (e) => {
      filteredRows().forEach((r) => {
        r.selected = e.target.checked;
      });
      refresh();
    });

    document.getElementById("tbody-propuesta").addEventListener("change", (e) => {
      const tr = e.target.closest("tr[data-idx]");
      if (!tr || !payload) return;
      const idx = Number(tr.dataset.idx);
      const row = payload.rows[idx];
      if (!row) return;
      if (e.target.matches("[data-sel]")) {
        row.selected = e.target.checked;
        refresh();
        return;
      }
      if (e.target.matches("[data-accion]")) {
        applyAccion(row, e.target.value);
        refresh();
        return;
      }
      if (e.target.matches("[data-tutor]")) {
        row.docente_destino_id = e.target.value;
        refresh();
      }
    });

    document.getElementById("btn-bulk").addEventListener("click", () => {
      const accion = document.getElementById("bulk-accion").value;
      const tutor = document.getElementById("bulk-tutor").value;
      const sel = payload.rows.filter((r) => r.selected);
      if (!sel.length) {
        toast("Selecciona filas", "warning");
        return;
      }
      if (accion) sel.forEach((r) => applyAccion(r, accion));
      if (tutor) {
        sel.forEach((r) => {
          if (r.accion === "avanza" || r.accion === "repite") {
            const pool = poolDocs(r.ciclo_destino_id);
            if (pool.some((d) => d.docente_id === tutor)) r.docente_destino_id = tutor;
          }
        });
      }
      if (!accion && !tutor) {
        toast("Elige acción o tutor", "warning");
        return;
      }
      refresh();
      toast("Selección actualizada");
    });
  });
})();
