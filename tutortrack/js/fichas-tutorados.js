/**
 * fichas-tutorados.js — vista docente: estado de fichas por tutorado.
 */
(function () {
  const ESTADO_CONFIG = {
    pendiente: { label: "Pendiente", cls: "badge-neutral" },
    borrador:  { label: "Borrador",  cls: "badge-warning" },
    enviada:   { label: "Enviada",   cls: "badge-success" },
  };

  function escHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  function initials(nombre) {
    return nombre.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  }

  function render(fichaId) {
    const tutorados = FichasTutoradosData.getTutorados();
    const estados   = FichasTutoradosData.getEstados(fichaId);
    const base      = window.getBasePath ? window.getBasePath() : "../../";

    /* Resumen */
    const counts = { pendiente: 0, borrador: 0, enviada: 0 };
    tutorados.forEach((t) => {
      const e = (estados[t.id] || {}).estado || "pendiente";
      counts[e]++;
    });

    document.getElementById("resumen-bar").innerHTML = `
      <span class="font-medium text-text"><strong>${counts.enviada}</strong> de <strong>${tutorados.length}</strong> estudiantes han enviado la ficha</span>
      <span class="ml-auto flex gap-3 flex-wrap">
        <span class="badge badge-success">${counts.enviada} Enviada${counts.enviada !== 1 ? "s" : ""}</span>
        <span class="badge badge-warning">${counts.borrador} Borrador</span>
        <span class="badge badge-neutral">${counts.pendiente} Pendiente${counts.pendiente !== 1 ? "s" : ""}</span>
      </span>
    `;

    /* Tabla */
    const tbody = document.getElementById("tutorados-tbody");
    tbody.innerHTML = tutorados.map((t, i) => {
      const est    = estados[t.id] || { estado: "pendiente", fecha_envio: null };
      const cfg    = ESTADO_CONFIG[est.estado] || ESTADO_CONFIG.pendiente;
      const canVer = est.estado === "enviada";
      const params = `?est=${encodeURIComponent(t.id)}&nombre=${encodeURIComponent(t.nombre)}&ficha=${encodeURIComponent(fichaId)}`;

      return `
        <tr>
          <td>
            <div class="flex items-center gap-3">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                ${initials(t.nombre)}
              </div>
              <div>
                <div class="font-medium text-text">${escHtml(t.nombre)}</div>
                <div class="text-xs text-text-muted">${escHtml(t.codigo)}</div>
              </div>
            </div>
          </td>
          <td class="text-center">
            <span class="badge ${cfg.cls}">${cfg.label}</span>
          </td>
          <td class="text-center text-sm text-text-muted">${formatDate(est.fecha_envio)}</td>
          <td class="text-center">
            ${canVer
              ? `<a href="${base}pages/docente/ficha-respuestas.html${params}" class="btn-secondary text-xs py-1 px-3">Ver respuestas</a>`
              : `<span class="text-xs text-text-muted">—</span>`
            }
          </td>
        </tr>`;
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const fichas = FichasTutoradosData.getFichas();
    const sel    = document.getElementById("sel-ficha");

    fichas.forEach((f) => {
      const opt = document.createElement("option");
      opt.value = f.id;
      opt.textContent = `${f.nombre} · ${f.ciclo} ${f.periodo}`;
      sel.appendChild(opt);
    });

    if (fichas.length) {
      render(fichas[0].id);
    }

    sel.addEventListener("change", () => render(sel.value));
  });
})();
