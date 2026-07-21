/**
 * casos.js — Receptor › Casos derivados (Kanban + Lista + cambiar estado).
 */
(function () {
  const D = () => window.AlertasDerivacionesData;
  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const ENTIDAD_ID = () => D().RECEPTOR_DEMO.entidad_receptora_id;
  let vista = "kanban";
  let selectedId = null;
  let pendingMove = null;
  let dragId = null;

  function casos() {
    const q = document.getElementById("filtro-q")?.value?.trim();
    return D().listDerivaciones({
      entidad_receptora_id: ENTIDAD_ID(),
      q: q || undefined,
    });
  }

  function pipeline() {
    return D()
      .estadosEntidad(ENTIDAD_ID())
      .filter((e) => e.activo !== false)
      .sort((a, b) => a.orden - b.orden);
  }

  function primerEstadoId() {
    return pipeline()[0]?.id || null;
  }

  function renderKanban() {
    const board = document.querySelector("[data-vista-kanban]");
    const rows = casos();
    const cols = pipeline();
    const primer = primerEstadoId();
    const nuevos = rows.filter((r) => r.tipo_estado_derivacion_id === primer).length;
    document.querySelector("[data-nuevos-n]").textContent = String(nuevos);

    board.innerHTML = cols
      .map((col) => {
        const cards = rows.filter((r) => r.tipo_estado_derivacion_id === col.id);
        return `
        <div class="kanban-col" data-col-estado="${esc(col.id)}">
          <div class="kanban-col-head">
            <span>${esc(col.nombre)}</span>
            <span class="kanban-col-count">${cards.length}</span>
          </div>
          <div class="kanban-col-body" data-drop-zone="${esc(col.id)}">
            ${
              cards
                .map(
                  (c) => `
              <article class="kanban-card" draggable="true" data-caso-id="${esc(c.id)}">
                <p class="font-medium text-sm">${esc(c.estudiante_nombre)}</p>
                <p class="text-xs text-text-muted">${esc(c.docente_nombre)}</p>
                <p class="text-xs text-text-muted mt-1">${esc(D().formatDate(c.created_at))}</p>
                <button type="button" class="btn-secondary btn-sm mt-2 w-full" data-atender="${esc(c.id)}">Atender</button>
              </article>`
                )
                .join("") || `<p class="px-1 py-3 text-xs text-text-muted text-center">Sin casos</p>`
            }
          </div>
        </div>`;
      })
      .join("");
  }

  function renderLista() {
    const rows = casos();
    const tbody = document.querySelector("[data-lista-body]");
    const vacio = document.querySelector("[data-lista-vacio]");
    if (!rows.length) {
      tbody.innerHTML = "";
      vacio.classList.remove("hidden");
      return;
    }
    vacio.classList.add("hidden");
    tbody.innerHTML = rows
      .map(
        (c) => `
      <tr>
        <td>
          <span class="font-medium">${esc(c.estudiante_nombre)}</span>
          <span class="block text-xs text-text-muted">${esc(c.estudiante_codigo)}</span>
        </td>
        <td>${esc(c.docente_nombre)}</td>
        <td>● ${esc(c.estado_nombre)}</td>
        <td class="whitespace-nowrap">${esc(D().formatDate(c.created_at))}</td>
        <td class="text-right">
          <button type="button" class="btn-secondary btn-sm" data-atender="${esc(c.id)}">Atender</button>
        </td>
      </tr>`
      )
      .join("");
  }

  function render() {
    const ent = D().entidadById(ENTIDAD_ID());
    document.querySelector("[data-entidad-nombre]").textContent = ent?.nombre || "—";
    if (vista === "kanban") {
      document.querySelector("[data-vista-kanban]").classList.remove("hidden");
      document.querySelector("[data-vista-lista]").classList.add("hidden");
      renderKanban();
    } else {
      document.querySelector("[data-vista-kanban]").classList.add("hidden");
      document.querySelector("[data-vista-lista]").classList.remove("hidden");
      renderLista();
    }
  }

  function openDrawer(id) {
    const c = D().findDerivacion(id);
    if (!c || c.entidad_receptora_id !== ENTIDAD_ID()) {
      return toast("No tienes acceso a este caso", "error");
    }
    selectedId = id;
    document.getElementById("drawer-caso-title").textContent = `Caso · ${c.estudiante_nombre}`;
    document.querySelector("[data-drawer-sub]").textContent =
      `Derivada por ${c.docente_nombre} · ${D().formatDate(c.created_at)}`;

    const estados = pipeline();
    const opts = estados
      .map(
        (e) =>
          `<option value="${esc(e.id)}" ${e.id === c.tipo_estado_derivacion_id ? "selected" : ""}>${esc(
            e.nombre
          )}</option>`
      )
      .join("");

    const { recorridos } = D().timelineDerivacion(id);
    const tl = recorridos
      .map(
        (r) => `
      <li class="timeline-item is-done">
        <p class="text-sm font-medium">● ${esc(r.estado_nombre)}</p>
        <p class="text-xs text-text-muted">${esc(D().formatDate(r.fecha, true))} · ${esc(r.quien)}</p>
        ${r.nota ? `<p class="text-sm">Nota: ${esc(r.nota)}</p>` : ""}
      </li>`
      )
      .join("");

    document.querySelector("[data-drawer-body]").innerHTML = `
      <p class="text-sm"><span class="text-text-muted">Motivo:</span> ${esc(c.motivo)}</p>
      <div class="flex flex-wrap gap-2 text-sm">
        ${
          c.alerta
            ? `<span class="alerta-nivel alerta-nivel--${c.alerta.nivel_alerta === "Alta" ? "alta" : c.alerta.nivel_alerta === "Media" ? "media" : "baja"}">${esc(
                c.alerta.nivel_alerta
              )}</span><span>${esc(c.alerta.area_nombre)}</span>`
            : `<span class="text-text-muted">Sin alerta IA (manual)</span>`
        }
        ${
          c.alerta
            ? `<a class="btn-secondary btn-sm" href="${esc(
                typeof getBasePath === "function" ? getBasePath() : "../../"
              )}pages/docente/ficha-respuestas.html?fl=${esc(c.alerta.ficha_llenada_id)}">📄 Ver ficha</a>`
            : ""
        }
      </div>
      <p class="text-sm">Estado actual: <strong>● ${esc(c.estado_nombre)}</strong></p>
      <div>
        <h3 class="text-sm font-semibold mb-2">Línea de tiempo (auditoría)</h3>
        <ul class="timeline-list">${tl || "<li class=\"text-sm text-text-muted\">Sin eventos</li>"}</ul>
      </div>
      <div data-drawer-visibilidad></div>
    `;

    document.querySelector("[data-drawer-foot]").innerHTML = `
      <div class="catalog-field">
        <label for="drawer-estado" class="form-label">Cambiar a</label>
        <select id="drawer-estado" class="form-input">${opts}</select>
      </div>
      <div class="catalog-field">
        <label for="drawer-nota" class="form-label">Nota</label>
        <textarea id="drawer-nota" class="form-input min-h-[3.5rem]" placeholder="Observación…">${esc(
          c.nota || ""
        )}</textarea>
      </div>
      <button type="button" class="btn-primary w-full" id="btn-guardar-estado">Guardar estado</button>
    `;

    const visRoot = document.querySelector("[data-drawer-visibilidad]");
    if (visRoot) {
      const on = Number(c.visible_estudiante) === 1;
      visRoot.innerHTML = `
        <div class="rounded-xl border border-border bg-surface p-3 space-y-2">
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm font-semibold">Compartir con el estudiante</p>
            <label class="inline-flex items-center gap-2 cursor-pointer text-xs text-text-muted">
              <span data-vis-label>${on ? "● on" : "○ off"}</span>
              <input type="checkbox" data-vis-toggle class="h-4 w-4 accent-[var(--color-primary)]" ${on ? "checked" : ""} />
            </label>
          </div>
          <div data-vis-msg-wrap class="${on ? "" : "hidden"}">
            <label for="vis-mensaje-caso" class="form-label">Mensaje para el estudiante</label>
            <input id="vis-mensaje-caso" type="text" maxlength="255" class="form-input"
              value="${esc(c.mensaje_estudiante || "")}"
              placeholder="Te sugerimos una cita con…" />
          </div>
          <button type="button" class="btn-secondary btn-sm" data-vis-guardar>Guardar visibilidad</button>
        </div>`;
      const toggle = visRoot.querySelector("[data-vis-toggle]");
      const msgWrap = visRoot.querySelector("[data-vis-msg-wrap]");
      toggle?.addEventListener("change", () => {
        msgWrap?.classList.toggle("hidden", !toggle.checked);
        const lab = visRoot.querySelector("[data-vis-label]");
        if (lab) lab.textContent = toggle.checked ? "● on" : "○ off";
      });
      visRoot.querySelector("[data-vis-guardar]")?.addEventListener("click", () => {
        const visible = !!toggle?.checked;
        const r = D().setVisibilidad(
          id,
          {
            visible_estudiante: visible ? 1 : 0,
            mensaje_estudiante: visRoot.querySelector("#vis-mensaje-caso")?.value || "",
          },
          D().RECEPTOR_DEMO,
          { rol: "receptor", entidad_receptora_id: ENTIDAD_ID() }
        );
        if (!r.ok) return toast(r.error, "error");
        toast(visible ? "Mensaje visible en el Inicio del estudiante" : "Oculto al estudiante");
        openDrawer(id);
      });
    }

    const backdrop = document.getElementById("drawer-caso-backdrop");
    const drawer = document.getElementById("drawer-caso");
    drawer.hidden = false;
    backdrop.classList.remove("hidden");
    requestAnimationFrame(() => drawer.classList.add("is-open"));

    document.getElementById("btn-guardar-estado")?.addEventListener("click", () => {
      const nuevo = document.getElementById("drawer-estado").value;
      const nota = document.getElementById("drawer-nota").value;
      applyEstado(id, nuevo, nota);
    });
  }

  function closeDrawer() {
    const backdrop = document.getElementById("drawer-caso-backdrop");
    const drawer = document.getElementById("drawer-caso");
    drawer.classList.remove("is-open");
    setTimeout(() => {
      drawer.hidden = true;
      backdrop.classList.add("hidden");
    }, 200);
    selectedId = null;
  }

  function applyEstado(id, estadoId, nota) {
    const r = D().cambiarEstadoDerivacion(id, estadoId, nota, D().RECEPTOR_DEMO, {
      entidad_receptora_id: ENTIDAD_ID(),
    });
    if (!r.ok) return toast(r.error, "error");
    toast("Estado actualizado");
    closeNotaModal();
    render();
    if (selectedId === id) openDrawer(id);
  }

  function openNotaModal(casoId, estadoId) {
    const st = D().estadoById(estadoId);
    pendingMove = { casoId, estadoId };
    document.querySelector("[data-nota-destino]").textContent = `Mover a: ${st?.nombre || "—"}`;
    document.getElementById("nota-texto").value = "";
    const bd = document.getElementById("modal-nota-backdrop");
    bd.classList.remove("hidden");
    bd.classList.add("flex");
  }

  function closeNotaModal() {
    pendingMove = null;
    const bd = document.getElementById("modal-nota-backdrop");
    bd.classList.add("hidden");
    bd.classList.remove("flex");
  }

  function bindDrag() {
    const board = document.querySelector("[data-vista-kanban]");
    board.addEventListener("dragstart", (e) => {
      const card = e.target.closest("[data-caso-id]");
      if (!card) return;
      dragId = card.getAttribute("data-caso-id");
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", dragId);
    });
    board.addEventListener("dragend", (e) => {
      e.target.closest("[data-caso-id]")?.classList.remove("dragging");
      board.querySelectorAll(".kanban-col").forEach((c) => c.classList.remove("is-drop-target"));
      dragId = null;
    });
    board.addEventListener("dragover", (e) => {
      e.preventDefault();
      const col = e.target.closest(".kanban-col");
      board.querySelectorAll(".kanban-col").forEach((c) => c.classList.remove("is-drop-target"));
      col?.classList.add("is-drop-target");
    });
    board.addEventListener("drop", (e) => {
      e.preventDefault();
      const col = e.target.closest(".kanban-col");
      board.querySelectorAll(".kanban-col").forEach((c) => c.classList.remove("is-drop-target"));
      if (!col || !dragId) return;
      const nuevoEstado = col.getAttribute("data-col-estado");
      const caso = D().findDerivacion(dragId);
      if (!caso || caso.tipo_estado_derivacion_id === nuevoEstado) return;
      openNotaModal(dragId, nuevoEstado);
    });
  }

  function bind() {
    document.querySelectorAll("[data-vista-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        vista = btn.getAttribute("data-vista-btn");
        document.querySelectorAll("[data-vista-btn]").forEach((b) => {
          const on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-pressed", String(on));
        });
        render();
      });
    });

    document.getElementById("filtro-q")?.addEventListener("input", render);

    document.querySelector("main")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-atender]");
      if (btn) openDrawer(btn.getAttribute("data-atender"));
    });

    document.getElementById("btn-drawer-cerrar")?.addEventListener("click", closeDrawer);
    document.getElementById("drawer-caso-backdrop")?.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!document.getElementById("modal-nota-backdrop").classList.contains("hidden")) closeNotaModal();
        else if (!document.getElementById("drawer-caso").hidden) closeDrawer();
      }
    });

    document.getElementById("btn-nota-cancelar")?.addEventListener("click", () => {
      closeNotaModal();
      render();
    });
    document.getElementById("btn-nota-guardar")?.addEventListener("click", () => {
      if (!pendingMove) return;
      applyEstado(pendingMove.casoId, pendingMove.estadoId, document.getElementById("nota-texto").value);
    });

    bindDrag();
    render();
  }

  document.addEventListener("DOMContentLoaded", bind);
})();
