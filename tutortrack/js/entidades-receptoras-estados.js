/**
 * entidades-receptoras-estados.js — pipeline de estados por entidad.
 */
(function () {
  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  function esc(v) {
    return String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function syncToggle(activo) {
    const t = document.getElementById("estado-activo-toggle");
    const c = document.getElementById("estado-activo");
    if (!t || !c) return;
    c.checked = !!activo;
    t.setAttribute("aria-checked", activo ? "true" : "false");
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.EntidadesReceptorasData) return;
    const Data = EntidadesReceptorasData;
    const params = new URLSearchParams(window.location.search);
    const entidadId = params.get("id");

    const showEmpty = () => {
      document.querySelector("[data-pipeline]")?.classList.add("hidden");
      document.querySelector("[data-pipeline-empty]")?.classList.remove("hidden");
    };

    Data.ready().then(() => {
      const entidad = entidadId ? Data.findEntidad(entidadId) : null;
      if (!entidad) {
        showEmpty();
        return;
      }

      document.querySelector("[data-entidad-nombre]").textContent = entidad.nombre;
      document.title = `Estados — ${entidad.nombre} | TutorTrack`;

      const backdrop = document.querySelector("[data-estado-backdrop]");
      const form = document.querySelector("[data-estado-form]");
      const formTitle = document.querySelector("[data-estado-title]");
      const editingId = document.querySelector("[data-estado-editing-id]");
      const activoWrap = document.querySelector("[data-estado-activo-wrap]");

      function sorted(list) {
        return [...list].sort((a, b) => (a.orden || 0) - (b.orden || 0));
      }

      function render() {
        const all = Data.estadosDe(entidadId);
        const activos = sorted(all.filter((e) => e.activo !== false));
        const retirados = sorted(all.filter((e) => e.activo === false));

        const listEl = document.querySelector("[data-pipeline-activos]");
        listEl.innerHTML = activos
          .map((est, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === activos.length - 1;
            return `
            <li class="pipeline-step">
              <div class="pipeline-rail">
                <div class="pipeline-orden-btns">
                  <button type="button" class="catalog-orden-btn" data-up="${esc(est.id)}" ${isFirst ? "disabled" : ""} title="Subir" aria-label="Subir">▲</button>
                  <button type="button" class="catalog-orden-btn" data-down="${esc(est.id)}" ${isLast ? "disabled" : ""} title="Bajar" aria-label="Bajar">▼</button>
                </div>
                <span class="pipeline-num">${idx + 1}</span>
                ${idx < activos.length - 1 ? '<span class="pipeline-line" aria-hidden="true"></span>' : ""}
              </div>
              <div class="pipeline-card">
                <div>
                  <div class="pipeline-card-title">${esc(est.nombre)}</div>
                  <div class="pipeline-card-meta">
                    <code class="catalog-clave">${esc(est.clave)}</code>
                    <span class="badge badge-success">Activo</span>
                  </div>
                </div>
                <button type="button" class="btn-secondary btn-sm" data-edit="${esc(est.id)}">Editar</button>
              </div>
            </li>`;
          })
          .join("");

        if (!activos.length) {
          listEl.innerHTML =
            '<li class="text-sm text-text-muted py-4">Sin estados activos. Agrega el primer paso del pipeline.</li>';
        }

        document.querySelector("[data-retirados-count]").textContent = String(retirados.length);
        const retEl = document.querySelector("[data-pipeline-retirados]");
        retEl.innerHTML = retirados.length
          ? retirados
              .map(
                (est) => `
            <li class="pipeline-card opacity-80">
              <div>
                <div class="pipeline-card-title">${esc(est.nombre)}</div>
                <div class="pipeline-card-meta">
                  <code class="catalog-clave">${esc(est.clave)}</code>
                  <span class="badge badge-neutral">Retirado</span>
                </div>
              </div>
              <button type="button" class="btn-secondary btn-sm" data-edit="${esc(est.id)}">Editar</button>
            </li>`
              )
              .join("")
          : '<li class="text-sm text-text-muted px-1 py-2">Ninguno retirado.</li>';

        listEl.querySelectorAll("[data-edit], [data-up], [data-down]").forEach(() => {});
      }

      function openModal(row) {
        const isEdit = Boolean(row);
        formTitle.textContent = isEdit ? "Editar estado" : "Agregar estado";
        editingId.value = isEdit ? row.id : "";
        const clave = document.getElementById("estado-clave");
        clave.value = isEdit ? row.clave : "";
        clave.readOnly = isEdit;
        clave.classList.toggle("opacity-80", isEdit);
        document.getElementById("estado-nombre").value = isEdit ? row.nombre : "";
        activoWrap.classList.toggle("hidden", !isEdit);
        syncToggle(isEdit ? row.activo !== false : true);
        backdrop.classList.remove("hidden");
        backdrop.classList.add("flex");
        (isEdit ? document.getElementById("estado-nombre") : clave).focus();
      }

      function closeModal() {
        backdrop.classList.add("hidden");
        backdrop.classList.remove("flex");
      }

      function swap(id, dir) {
        const activos = sorted(Data.estadosDe(entidadId).filter((e) => e.activo !== false));
        const idx = activos.findIndex((e) => e.id === id);
        const j = dir === "up" ? idx - 1 : idx + 1;
        if (idx < 0 || j < 0 || j >= activos.length) return;
        const tmp = activos[idx].orden;
        activos[idx].orden = activos[j].orden;
        activos[j].orden = tmp;
        const map = Object.fromEntries(activos.map((e) => [e.id, e]));
        const all = Data.estadosDe(entidadId).map((e) => map[e.id] || e);
        Data.saveEstados(entidadId, all);
        render();
        toast("Orden actualizado");
      }

      document.querySelector("[data-pipeline]").addEventListener("click", (e) => {
        const edit = e.target.closest("[data-edit]");
        if (edit) {
          const row = Data.estadosDe(entidadId).find((x) => x.id === edit.getAttribute("data-edit"));
          if (row) openModal(row);
          return;
        }
        const up = e.target.closest("[data-up]");
        if (up && !up.disabled) {
          swap(up.getAttribute("data-up"), "up");
          return;
        }
        const down = e.target.closest("[data-down]");
        if (down && !down.disabled) swap(down.getAttribute("data-down"), "down");
      });

      document.querySelector("[data-agregar-estado]")?.addEventListener("click", () => openModal(null));
      document.querySelector("[data-estado-cancel]")?.addEventListener("click", closeModal);
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) closeModal();
      });
      document.getElementById("estado-activo-toggle")?.addEventListener("click", () => {
        syncToggle(!document.getElementById("estado-activo").checked);
      });

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = editingId.value;
        let clave = document.getElementById("estado-clave").value.trim().toLowerCase();
        const nombre = document.getElementById("estado-nombre").value.trim();
        if (!clave || !nombre) {
          toast("Clave y nombre son obligatorios", "warning");
          return;
        }
        if (!/^[a-z][a-z0-9_]*$/.test(clave)) {
          toast("La clave debe ser snake_case", "warning");
          return;
        }
        const all = Data.estadosDe(entidadId);
        if (id) {
          const prev = all.find((x) => x.id === id);
          clave = prev.clave;
          const activo = document.getElementById("estado-activo").checked;
          Data.saveEstados(
            entidadId,
            all.map((x) => (x.id === id ? { ...x, nombre, activo, clave } : x))
          );
          toast(activo ? "Estado actualizado" : "Estado retirado");
        } else {
          if (all.some((x) => x.clave === clave)) {
            toast("Ya existe un estado con esa clave en esta entidad", "warning");
            return;
          }
          const maxOrden = all.length
            ? Math.max(...all.map((x) => Number(x.orden) || 0))
            : 0;
          all.push({
            id: `est-${Date.now()}`,
            clave,
            nombre,
            orden: maxOrden + 1,
            activo: true,
          });
          Data.saveEstados(entidadId, all);
          toast("Estado agregado");
        }
        closeModal();
        render();
      });

      render();
    });
  });
})();
