/**
 * fichas-ciclo.js — Docente › Fichas de mi ciclo.
 * Clonar plantilla / crear de cero / habilitar ⇄ / editar en constructor.
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

  const TIPO_BADGE = {
    "tf-1": "badge-primary",
    "tf-2": "badge-success",
    "tf-3": "badge-info",
    "tf-4": "badge-neutral",
  };

  function currentFcps() {
    return FichasCicloData.listFcps({
      docenteId: FichasCicloData.DOCENTE_DEMO.id,
      cicloId: document.getElementById("sel-ciclo")?.value || FichasCicloData.CICLO_DEMO.id,
      periodoId: document.getElementById("sel-periodo")?.value || FichasCicloData.PERIODO_DEMO.id,
    }).sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
  }

  function renderSummary(fcps) {
    const set = (sel, n) => {
      const el = document.querySelector(sel);
      if (el) el.textContent = String(n);
    };
    set("[data-summary-total]", fcps.length);
    set("[data-summary-hab]", fcps.filter((f) => f.habilitada).length);
    set("[data-summary-est]", FichasCicloData.ESTUDIANTES.length);
  }

  function llenadoHtml(fcp) {
    if (!fcp.habilitada) {
      return `<span class="text-sm text-text-muted">🔒 aún no habilitada</span>`;
    }
    const s = FichasCicloData.llenadoStats(fcp.id);
    return `<span class="text-sm text-text">
      <span class="text-success font-medium">●${s.enviadas} env</span>
      <span class="text-text-muted"> · </span>
      <span class="text-warning font-medium">${s.borradores} borr</span>
      <span class="text-text-muted"> · </span>
      <span>${s.sin} sin</span>
    </span>`;
  }

  function renderTable() {
    const fcps = currentFcps();
    renderSummary(fcps);
    const body = document.querySelector("[data-fcp-body]");
    const empty = document.querySelector("[data-fcp-empty]");
    if (!body) return;

    if (!fcps.length) {
      body.innerHTML = "";
      empty?.classList.remove("hidden");
      return;
    }
    empty?.classList.add("hidden");

    body.innerHTML = fcps
      .map((fcp, i) => {
        const tipo = FichasData.tipoFichaNombre(fcp.tipo_ficha_id);
        const badge = TIPO_BADGE[fcp.tipo_ficha_id] || "badge-neutral";
        const nPreg = (fcp.preguntas || []).length;
        return `
        <tr>
          <td class="text-center text-text-muted">${i + 1}</td>
          <td>
            <div class="font-medium text-text">${esc(fcp.nombre)}</div>
            ${fcp.descripcion ? `<div class="text-xs text-text-muted line-clamp-1">${esc(fcp.descripcion)}</div>` : ""}
          </td>
          <td><span class="badge ${badge}">${esc(tipo)}</span></td>
          <td class="text-center"><span class="badge badge-neutral">${nPreg}</span></td>
          <td class="text-center">
            <button
              type="button"
              class="catalog-estado-toggle${fcp.habilitada ? " is-on" : ""}"
              data-toggle-hab="${esc(fcp.id)}"
              role="switch"
              aria-checked="${fcp.habilitada ? "true" : "false"}"
              title="${fcp.habilitada ? "Inhabilitar" : "Habilitar"}"
              aria-label="${fcp.habilitada ? "Inhabilitar" : "Habilitar"}"
            >
              <span class="catalog-estado-dot" aria-hidden="true"></span>
              <span>${fcp.habilitada ? "Sí" : "No"}</span>
            </button>
          </td>
          <td>${llenadoHtml(fcp)}</td>
          <td>
            <div class="flex justify-end gap-0.5">
              <button type="button" class="btn-action btn-action-edit" data-edit="${esc(fcp.id)}" title="Editar" aria-label="Editar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"/></svg>
              </button>
              <button type="button" class="btn-action btn-action-view" data-ver="${esc(fcp.id)}" title="Vista previa" aria-label="Vista previa">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
              </button>
              <button type="button" class="btn-action btn-action-danger" data-del="${esc(fcp.id)}" title="Eliminar" aria-label="Eliminar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
              </button>
            </div>
          </td>
        </tr>`;
      })
      .join("");
  }

  function toggleMenu(open) {
    const panel = document.querySelector("[data-nueva-panel]");
    const trigger = document.querySelector("[data-nueva-trigger]");
    if (!panel || !trigger) return;
    panel.classList.toggle("hidden", !open);
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function openClonar() {
    const list = document.querySelector("[data-clonar-list]");
    const backdrop = document.querySelector("[data-clonar-backdrop]");
    const cicloId = document.getElementById("sel-ciclo")?.value;
    const plantillas = FichasData.load().filter((f) => f.activo !== false);
    list.innerHTML = plantillas
      .map((f) => {
        const ciclos = (f.ciclo_ids || [])
          .map((id) => `<span class="badge badge-neutral">${esc(FichasData.cicloAbrev(id))}</span>`)
          .join(" ");
        const sugerida = (f.ciclo_ids || []).includes(cicloId);
        return `
        <button type="button" class="w-full rounded-lg border border-border p-3 text-left hover:border-primary ${sugerida ? "bg-primary/5" : ""}" data-pick-plantilla="${esc(f.id)}">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="font-medium text-text">${esc(f.nombre)}</div>
              <div class="mt-0.5 text-xs text-text-muted">${esc(FichasData.tipoFichaNombre(f.tipo_ficha_id))} · ${(f.preguntas || []).length} preguntas</div>
            </div>
            ${sugerida ? '<span class="badge badge-success shrink-0">Sugerida</span>' : ""}
          </div>
          <div class="mt-2 flex flex-wrap gap-1">${ciclos || '<span class="text-xs text-text-muted">Sin ciclos sugeridos</span>'}</div>
        </button>`;
      })
      .join("");
    backdrop.classList.remove("hidden");
    backdrop.classList.add("flex");
  }

  function closeClonar() {
    const backdrop = document.querySelector("[data-clonar-backdrop]");
    backdrop?.classList.add("hidden");
    backdrop?.classList.remove("flex");
  }

  function openCero() {
    const sel = document.getElementById("cero-tipo");
    if (sel && !sel.options.length) {
      FichasData.TIPOS_FICHA_SEED.forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t.id;
        opt.textContent = t.nombre;
        sel.appendChild(opt);
      });
    }
    document.getElementById("cero-nombre").value = "";
    document.getElementById("cero-desc").value = "";
    const backdrop = document.querySelector("[data-cero-backdrop]");
    backdrop.classList.remove("hidden");
    backdrop.classList.add("flex");
  }

  function closeCero() {
    const backdrop = document.querySelector("[data-cero-backdrop]");
    backdrop?.classList.add("hidden");
    backdrop?.classList.remove("flex");
  }

  function bind() {
    document.querySelector("[data-nueva-trigger]")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const panel = document.querySelector("[data-nueva-panel]");
      toggleMenu(panel?.classList.contains("hidden"));
    });
    document.addEventListener("click", () => toggleMenu(false));

    document.querySelector("[data-clonar]")?.addEventListener("click", () => {
      toggleMenu(false);
      openClonar();
    });
    document.querySelector("[data-desde-cero]")?.addEventListener("click", () => {
      toggleMenu(false);
      /* DISEÑO: abrir constructor vacío (crea al guardar) */
      window.location.href = "fichas-form.html?nuevo=1";
    });

    document.querySelector("[data-clonar-cerrar]")?.addEventListener("click", closeClonar);
    document.querySelector("[data-clonar-backdrop]")?.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeClonar();
    });
    document.querySelector("[data-clonar-list]")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-pick-plantilla]");
      if (!btn) return;
      const fcp = FichasCicloData.clonarDePlantilla({
        fichaOrigenId: btn.getAttribute("data-pick-plantilla"),
        cicloId: document.getElementById("sel-ciclo")?.value,
        periodoId: document.getElementById("sel-periodo")?.value,
      });
      if (!fcp) {
        toast("No se pudo clonar la plantilla", "danger");
        return;
      }
      toast("Ficha creada");
      closeClonar();
      window.location.href = `fichas-form.html?fcp=${encodeURIComponent(fcp.id)}`;
    });

    document.querySelector("[data-cero-cerrar]")?.addEventListener("click", closeCero);
    document.querySelector("[data-cero-crear]")?.addEventListener("click", () => {
      const nombre = document.getElementById("cero-nombre")?.value.trim();
      const tipo = document.getElementById("cero-tipo")?.value;
      if (!nombre || !tipo) {
        toast("Nombre y tipo son obligatorios", "danger");
        return;
      }
      const fcp = FichasCicloData.crearDesdeCero({
        nombre,
        tipo_ficha_id: tipo,
        descripcion: document.getElementById("cero-desc")?.value.trim() || "",
        cicloId: document.getElementById("sel-ciclo")?.value,
        periodoId: document.getElementById("sel-periodo")?.value,
      });
      toast("Ficha creada");
      closeCero();
      window.location.href = `fichas-form.html?fcp=${encodeURIComponent(fcp.id)}`;
    });

    document.querySelector("[data-fcp-body]")?.addEventListener("click", (e) => {
      const hab = e.target.closest("[data-toggle-hab]");
      if (hab) {
        const id = hab.getAttribute("data-toggle-hab");
        const fcp = FichasCicloData.findFcp(id);
        if (!fcp) return;
        const next = !fcp.habilitada;
        const n = FichasCicloData.countLlenados(id);
        const go = () => {
          FichasCicloData.setHabilitada(id, next);
          toast(next ? "Ficha habilitada" : "Ficha inhabilitada");
          renderTable();
        };
        if (!next && n > 0) {
          AppConfirm.request({
            title: "Inhabilitar ficha",
            confirmLabel: "Inhabilitar",
            cancelLabel: "Cancelar",
            variant: "warning",
            messageHtml: `<p><strong class="text-text">${n} estudiante${n === 1 ? "" : "s"}</strong> ya empezaron esta ficha. Podrán verla como bloqueada; los llenados existentes se conservan.</p>`,
          }).then((ok) => {
            if (ok) go();
          });
        } else {
          go();
        }
        return;
      }

      const edit = e.target.closest("[data-edit]");
      if (edit) {
        window.location.href = `fichas-form.html?fcp=${encodeURIComponent(edit.getAttribute("data-edit"))}`;
        return;
      }

      const ver = e.target.closest("[data-ver]");
      if (ver) {
        window.location.href = `fichas-form.html?fcp=${encodeURIComponent(ver.getAttribute("data-ver"))}&preview=1`;
        return;
      }

      const del = e.target.closest("[data-del]");
      if (del) {
        const id = del.getAttribute("data-del");
        const fcp = FichasCicloData.findFcp(id);
        const n = FichasCicloData.countLlenados(id);
        if (n > 0) {
          AppConfirm.request({
            title: "No se puede eliminar",
            confirmLabel: "Entendido",
            cancelLabel: "Cerrar",
            variant: "primary",
            messageHtml: `<p><strong class="text-text">${esc(fcp?.nombre || "")}</strong> tiene ${n} llenado(s) de estudiantes. No se puede eliminar.</p>`,
          });
          return;
        }
        AppConfirm.request({
          title: "Eliminar ficha",
          confirmLabel: "Eliminar",
          cancelLabel: "Cancelar",
          variant: "danger",
          messageHtml: `<p>¿Eliminar <strong class="text-text">${esc(fcp?.nombre || "")}</strong>?</p>`,
        }).then((ok) => {
          if (!ok) return;
          FichasCicloData.removeFcp(id);
          toast("Ficha eliminada");
          renderTable();
        });
      }
    });

    document.getElementById("sel-ciclo")?.addEventListener("change", renderTable);
    document.getElementById("sel-periodo")?.addEventListener("change", renderTable);
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.FichasData || !window.FichasCicloData) return;
    const q = new URLSearchParams(window.location.search);
    const saved = q.get("saved");
    if (saved) {
      toast(saved === "updated" ? "Ficha guardada" : "Ficha creada");
      q.delete("saved");
      window.history.replaceState({}, "", `${window.location.pathname}${q.toString() ? `?${q}` : ""}`);
    }

    Promise.all([FichasData.ready(), FichasCicloData.ready()])
      .then(() => {
        bind();
        renderTable();
      })
      .catch((err) => {
        console.error(err);
        toast("Error al cargar fichas", "danger");
      });
  });
})();
