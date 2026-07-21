/**
 * historial.js — Receptor › Historial de seguimiento (auditoría, solo lectura).
 */
(function () {
  const D = () => window.AlertasDerivacionesData;
  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const ENTIDAD_ID = () => D().RECEPTOR_DEMO.entidad_receptora_id;

  function fillFilters() {
    const estSel = document.getElementById("filtro-estudiante");
    const stSel = document.getElementById("filtro-estado");
    const seen = new Set();
    D()
      .listDerivaciones({ entidad_receptora_id: ENTIDAD_ID() })
      .forEach((d) => {
        if (seen.has(d.estudiante_id)) return;
        seen.add(d.estudiante_id);
        const o = document.createElement("option");
        o.value = d.estudiante_id;
        o.textContent = d.estudiante_nombre;
        estSel.appendChild(o);
      });
    D()
      .estadosEntidad(ENTIDAD_ID())
      .filter((e) => e.activo !== false)
      .sort((a, b) => a.orden - b.orden)
      .forEach((e) => {
        const o = document.createElement("option");
        o.value = e.id;
        o.textContent = e.nombre;
        stSel.appendChild(o);
      });
  }

  function filters() {
    return {
      estudiante_id: document.getElementById("filtro-estudiante").value || undefined,
      estado_id: document.getElementById("filtro-estado").value || undefined,
      fecha_desde: document.getElementById("filtro-desde").value || undefined,
      fecha_hasta: document.getElementById("filtro-hasta").value || undefined,
      q: document.getElementById("filtro-q").value.trim() || undefined,
    };
  }

  function render() {
    const ent = D().entidadById(ENTIDAD_ID());
    document.querySelector("[data-entidad-nombre]").textContent = ent?.nombre || "—";

    const rows = D().historialEntidad(ENTIDAD_ID(), filters());
    const feed = document.querySelector("[data-feed]");
    const vacio = document.querySelector("[data-vacio]");

    if (!rows.length) {
      feed.innerHTML = "";
      vacio.classList.remove("hidden");
      return;
    }
    vacio.classList.add("hidden");

    feed.innerHTML = rows
      .map((r) => {
        let cambio;
        if (r.es_creacion) {
          cambio = `creó la derivación → <strong>${esc(r.a_estado || "—")}</strong>`;
        } else {
          cambio = `<strong>${esc(r.de_estado || "—")}</strong> → <strong>${esc(r.a_estado || "—")}</strong>`;
        }
        return `
        <article class="historial-feed-item">
          <p class="text-sm font-medium text-text">
            ${esc(D().formatDate(r.created_at, true))} · ${esc(r.usuario_nombre)}
          </p>
          <p class="mt-1 text-sm text-text">
            ${esc(r.estudiante_nombre)}: ${cambio}
          </p>
          ${r.nota ? `<p class="mt-1 text-sm text-text-muted">Nota: ${esc(r.nota)}</p>` : ""}
        </article>`;
      })
      .join("");
  }

  function bind() {
    fillFilters();
    ["filtro-estudiante", "filtro-estado", "filtro-desde", "filtro-hasta", "filtro-q"].forEach((id) => {
      const el = document.getElementById(id);
      el.addEventListener(el.tagName === "INPUT" && el.type !== "date" ? "input" : "change", render);
    });
    document.getElementById("btn-limpiar").addEventListener("click", () => {
      ["filtro-estudiante", "filtro-estado", "filtro-desde", "filtro-hasta", "filtro-q"].forEach((id) => {
        document.getElementById(id).value = "";
      });
      render();
    });
    render();
  }

  document.addEventListener("DOMContentLoaded", bind);
})();
