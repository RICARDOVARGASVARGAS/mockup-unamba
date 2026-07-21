/**
 * derivaciones.js — Docente › Derivaciones (crear + lista + timeline).
 * Admin: window.DERIVACIONES_PAGE_MODE = "admin" (solo lectura, ve todas).
 */
(function () {
  const MODE = window.DERIVACIONES_PAGE_MODE === "admin" ? "admin" : "docente";
  const D = () => window.AlertasDerivacionesData;
  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  let detalleId = null;

  function docenteScope() {
    return MODE === "docente" ? D().DOCENTE_DEMO.id : null;
  }

  function showVista(name) {
    document.querySelectorAll("[data-vista]").forEach((el) => {
      el.classList.toggle("hidden", el.getAttribute("data-vista") !== name);
    });
  }

  function fillEntidadesFiltro() {
    const sel = document.getElementById("filtro-entidad");
    if (!sel || !window.EntidadesReceptorasData) return;
    EntidadesReceptorasData.entidades().forEach((e) => {
      const o = document.createElement("option");
      o.value = e.id;
      o.textContent = e.nombre;
      sel.appendChild(o);
    });
  }

  function fillEstadosFiltro() {
    const sel = document.getElementById("filtro-estado");
    if (!sel || !window.EntidadesReceptorasData) return;
    const seen = new Set();
    EntidadesReceptorasData.entidades().forEach((ent) => {
      EntidadesReceptorasData.estadosDe(ent.id).forEach((st) => {
        if (seen.has(st.id)) return;
        seen.add(st.id);
        const o = document.createElement("option");
        o.value = st.id;
        o.textContent = `${ent.nombre}: ${st.nombre}`;
        sel.appendChild(o);
      });
    });
  }

  function filters() {
    const f = {
      docente_id: docenteScope() || undefined,
      entidad_receptora_id: document.getElementById("filtro-entidad")?.value || undefined,
      tipo_estado_derivacion_id: document.getElementById("filtro-estado")?.value || undefined,
      q: document.getElementById("filtro-q")?.value?.trim() || undefined,
    };
    if (MODE === "admin") {
      const doc = document.getElementById("filtro-docente")?.value;
      if (doc) f.docente_id = doc;
      const desde = document.getElementById("filtro-desde")?.value;
      const hasta = document.getElementById("filtro-hasta")?.value;
      if (desde) f.fecha_desde = desde;
      if (hasta) f.fecha_hasta = hasta;
    }
    Object.keys(f).forEach((k) => {
      if (!f[k]) delete f[k];
    });
    return f;
  }

  function renderLista() {
    const rows = D().listDerivaciones(filters());
    const tbody = document.querySelector("[data-tbody]");
    const vacio = document.querySelector("[data-vacio]");
    if (!tbody) return;
    if (!rows.length) {
      tbody.innerHTML = "";
      vacio?.classList.remove("hidden");
      return;
    }
    vacio?.classList.add("hidden");
    tbody.innerHTML = rows
      .map((d, i) => {
        const docenteCol =
          MODE === "admin" ? `<td>${esc(d.docente_nombre)}</td>` : "";
        return `
      <tr>
        <td class="text-center text-text-muted">${i + 1}</td>
        <td>
          <span class="font-medium">${esc(d.estudiante_nombre)}</span>
          <span class="block text-xs text-text-muted">${esc(d.estudiante_codigo)}</span>
        </td>
        <td>${esc(d.entidad_nombre)}</td>
        ${docenteCol}
        <td><span class="font-medium">● ${esc(d.estado_nombre)}</span></td>
        <td class="whitespace-nowrap">${esc(D().formatDate(d.created_at))}</td>
        <td class="text-right">
          <button type="button" class="btn-ghost btn-icon" data-ver="${esc(d.id)}" title="Ver" aria-label="Ver derivación">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        </td>
      </tr>`;
      })
      .join("");
  }

  function renderTimeline(derId) {
    const { recorridos, pendientes } = D().timelineDerivacion(derId);
    const ul = document.querySelector("[data-det-timeline]");
    const items = [
      ...recorridos.map(
        (r) => `
        <li class="timeline-item is-done">
          <p class="font-medium text-sm">● ${esc(r.estado_nombre)}</p>
          <p class="text-xs text-text-muted">${esc(D().formatDate(r.fecha, true))} · ${esc(r.quien)}</p>
          ${r.nota ? `<p class="mt-0.5 text-sm text-text">Nota: ${esc(r.nota)}</p>` : ""}
        </li>`
      ),
      ...pendientes.map(
        (p) => `
        <li class="timeline-item is-pending">
          <p class="font-medium text-sm">○ ${esc(p.estado_nombre)}</p>
        </li>`
      ),
    ];
    ul.innerHTML = items.join("") || `<li class="text-sm text-text-muted">Sin eventos aún.</li>`;
  }

  function openDetalle(id) {
    const d = D().findDerivacion(id);
    if (!d) return toast("Derivación no encontrada", "error");
    if (MODE === "docente" && d.docente_id !== D().DOCENTE_DEMO.id) {
      return toast("No tienes acceso a esta derivación", "error");
    }
    detalleId = id;
    document.querySelector("[data-det-titulo]").textContent =
      `${d.estudiante_nombre} → ${d.entidad_nombre}`;
    document.querySelector("[data-det-estado]").textContent = `● ${d.estado_nombre}`;
    document.querySelector("[data-det-motivo]").textContent = d.motivo;
    const origen = document.querySelector("[data-det-origen]");
    let html = "";
    const bp = typeof getBasePath === "function" ? getBasePath() : "../../";
    if (d.alerta) {
      html += `<a class="btn-secondary btn-sm" href="alertas.html?alerta=${esc(d.alerta_ia_id)}">Alerta: ${esc(
        d.alerta.nivel_alerta
      )} · ${esc(d.alerta.area_nombre)}</a>`;
      html += `<a class="btn-secondary btn-sm" href="${esc(bp)}pages/docente/ficha-respuestas.html?fl=${esc(
        d.alerta.ficha_llenada_id
      )}">📄 Ver ficha</a>`;
    } else {
      html += `<span class="text-sm text-text-muted">Origen: manual (sin alerta IA)</span>`;
    }
    if (MODE === "admin") {
      html += `<span class="text-sm text-text-muted">Docente: ${esc(d.docente_nombre)}</span>`;
    }
    origen.innerHTML = html;
    renderTimeline(id);

    const visWrap = document.querySelector("[data-det-visibilidad]");
    if (visWrap) {
      if (MODE === "admin") {
        visWrap.innerHTML = `
          <p class="text-sm text-text-muted">
            Visibilidad al estudiante:
            <strong>${d.visible_estudiante ? "Compartida" : "Oculta"}</strong>
            ${d.visible_estudiante && d.mensaje_estudiante ? ` · “${esc(d.mensaje_estudiante)}”` : ""}
          </p>`;
      } else {
        visWrap.innerHTML = visibilityPanelHtml(d);
        bindVisibilityForm(visWrap, id, "docente");
      }
    }

    showVista("detalle");
  }

  function visibilityPanelHtml(d) {
    const on = Number(d.visible_estudiante) === 1;
    return `
      <div class="rounded-xl border border-border bg-surface p-4 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="text-sm font-semibold text-text">Compartir con el estudiante</p>
            <p class="text-xs text-text-muted">Off por defecto. Solo un mensaje humano — nunca el motivo ni la IA.</p>
          </div>
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <span class="text-xs text-text-muted">${on ? "● on" : "○ off"}</span>
            <input type="checkbox" data-vis-toggle class="h-4 w-4 accent-[var(--color-primary)]" ${on ? "checked" : ""} />
          </label>
        </div>
        <div class="catalog-field" data-vis-msg-wrap ${on ? "" : "hidden"}>
          <label for="vis-mensaje" class="form-label">Mensaje para el estudiante</label>
          <input id="vis-mensaje" type="text" maxlength="255" class="form-input"
            value="${esc(d.mensaje_estudiante || "")}"
            placeholder="Te sugerimos una cita con…" />
        </div>
        <button type="button" class="btn-primary btn-sm" data-vis-guardar>Guardar visibilidad</button>
      </div>`;
  }

  function bindVisibilityForm(root, derId, rol) {
    const toggle = root.querySelector("[data-vis-toggle]");
    const msgWrap = root.querySelector("[data-vis-msg-wrap]");
    const msgInput = root.querySelector("#vis-mensaje");
    toggle?.addEventListener("change", () => {
      msgWrap?.classList.toggle("hidden", !toggle.checked);
      const label = toggle.closest("label")?.querySelector("span");
      if (label) label.textContent = toggle.checked ? "● on" : "○ off";
    });
    root.querySelector("[data-vis-guardar]")?.addEventListener("click", () => {
      const visible = !!toggle?.checked;
      const r = D().setVisibilidad(
        derId,
        {
          visible_estudiante: visible ? 1 : 0,
          mensaje_estudiante: msgInput?.value || "",
        },
        D().DOCENTE_DEMO,
        { rol: "docente", docente_id: D().DOCENTE_DEMO.id }
      );
      if (!r.ok) return toast(r.error, "error");
      toast(visible ? "Ahora el estudiante verá el mensaje en su Inicio" : "Oculto al estudiante");
      openDetalle(derId);
    });
  }

  function fillModalSelects() {
    const estSel = document.getElementById("der-estudiante");
    const entSel = document.getElementById("der-entidad");
    estSel.innerHTML = "";
    D()
      .tutoradosDe(D().DOCENTE_DEMO.id)
      .forEach((e) => {
        const o = document.createElement("option");
        o.value = e.id;
        o.textContent = `${D().nombreCompleto(e)} · ${e.codigo}`;
        estSel.appendChild(o);
      });
    entSel.innerHTML = "";
    (window.EntidadesReceptorasData?.entidades() || [])
      .filter((e) => e.activo !== false)
      .forEach((e) => {
        const o = document.createElement("option");
        o.value = e.id;
        o.textContent = e.nombre;
        entSel.appendChild(o);
      });
  }

  function openModal(prefill = {}) {
    fillModalSelects();
    document.getElementById("der-alerta-id").value = prefill.alerta_ia_id || "";
    const origen = document.querySelector("[data-alerta-origen]");
    if (prefill.alerta_ia_id) {
      const a = D().findAlerta(prefill.alerta_ia_id);
      if (a) {
        document.getElementById("der-estudiante").value = a.estudiante_id;
        document.getElementById("der-estudiante").disabled = true;
        if (a.entidad_receptora_sugerida_id) {
          document.getElementById("der-entidad").value = a.entidad_receptora_sugerida_id;
        }
        if (!document.getElementById("der-motivo").value) {
          document.getElementById("der-motivo").value = a.justificacion_resumen || "";
        }
        origen.innerHTML = `Alerta origen: <span class="font-medium text-danger">${esc(
          a.nivel_alerta
        )}</span> · ${esc(a.area_nombre)} · ${esc(D().formatDate(a.fecha_generada))} <span class="badge badge-success ml-1">enlazada</span>`;
      }
    } else {
      document.getElementById("der-estudiante").disabled = false;
      document.getElementById("der-motivo").value = "";
      origen.innerHTML = `Alerta origen: <span class="text-text-muted">— (manual)</span>`;
    }
    const bd = document.getElementById("modal-derivar-backdrop");
    bd.classList.remove("hidden");
    bd.classList.add("flex");
  }

  function closeModal() {
    const bd = document.getElementById("modal-derivar-backdrop");
    bd.classList.add("hidden");
    bd.classList.remove("flex");
    document.getElementById("der-estudiante").disabled = false;
    document.getElementById("form-derivar").reset();
    document.getElementById("der-alerta-id").value = "";
  }

  function bind() {
    fillEntidadesFiltro();
    fillEstadosFiltro();

    if (MODE === "admin") {
      document.getElementById("btn-nueva")?.classList.add("hidden");
    }

    document.getElementById("btn-nueva")?.addEventListener("click", () => openModal());
    document.getElementById("btn-derivar-cancelar")?.addEventListener("click", closeModal);
    document.getElementById("modal-derivar-backdrop")?.addEventListener("click", (e) => {
      if (e.target.id === "modal-derivar-backdrop") closeModal();
    });

    document.getElementById("form-derivar")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const r = D().crearDerivacion(
        {
          estudiante_id: document.getElementById("der-estudiante").value,
          entidad_receptora_id: document.getElementById("der-entidad").value,
          alerta_ia_id: document.getElementById("der-alerta-id").value || null,
          motivo: document.getElementById("der-motivo").value,
          docente_id: D().DOCENTE_DEMO.id,
        },
        D().DOCENTE_DEMO
      );
      if (!r.ok) return toast(r.error, "error");
      toast("Derivación creada");
      closeModal();
      renderLista();
      openDetalle(r.derivacion.id);
    });

    document.querySelector("[data-tbody]")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-ver]");
      if (btn) openDetalle(btn.getAttribute("data-ver"));
    });

    document.getElementById("btn-volver")?.addEventListener("click", () => {
      detalleId = null;
      showVista("lista");
      renderLista();
      history.replaceState({}, "", window.location.pathname);
    });

    ["filtro-entidad", "filtro-estado", "filtro-q", "filtro-docente", "filtro-desde", "filtro-hasta"].forEach(
      (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener(el.tagName === "INPUT" ? "input" : "change", renderLista);
      }
    );

    document.getElementById("btn-limpiar")?.addEventListener("click", () => {
      ["filtro-entidad", "filtro-estado", "filtro-q", "filtro-docente", "filtro-desde", "filtro-hasta"].forEach(
        (id) => {
          const el = document.getElementById(id);
          if (el) el.value = "";
        }
      );
      renderLista();
    });

    const params = new URLSearchParams(window.location.search);
    renderLista();
    showVista("lista");

    if (MODE === "docente" && params.get("alerta")) {
      openModal({ alerta_ia_id: params.get("alerta") });
    }
    if (params.get("ver")) {
      openDetalle(params.get("ver"));
    }
  }

  document.addEventListener("DOMContentLoaded", bind);
})();
