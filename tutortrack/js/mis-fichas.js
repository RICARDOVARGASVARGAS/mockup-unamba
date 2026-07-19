/**
 * mis-fichas.js — lista de fichas del estudiante.
 */
(function () {
  const toast = (msg, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message: msg, type } }));

  const ESTADO_CONFIG = {
    pendiente:   { label: "Pendiente",   cls: "badge-neutral",  icon: "clock" },
    en_progreso: { label: "En progreso", cls: "badge-warning",  icon: "edit"  },
    enviada:     { label: "Enviada",     cls: "badge-success",  icon: "check" },
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

  function accionBtn(ficha, base) {
    const url = `${base}pages/estudiante/llenar-ficha.html?id=${encodeURIComponent(ficha.id)}&nombre=${encodeURIComponent(ficha.nombre)}`;
    switch (ficha.estado) {
      case "pendiente":
        return `<a href="${url}" class="btn-primary w-full text-center">Comenzar</a>`;
      case "en_progreso":
        return `<a href="${url}" class="btn-primary w-full text-center">Continuar</a>`;
      case "enviada":
        return `<a href="${url}&modo=ver" class="btn-secondary w-full text-center">Ver mis respuestas</a>`;
      default:
        return "";
    }
  }

  function render() {
    const base   = window.getBasePath ? window.getBasePath() : "../../";
    const fichas = MisFichasData.load();
    const grid   = document.getElementById("fichas-grid");

    grid.innerHTML = fichas.map((f) => {
      const cfg    = ESTADO_CONFIG[f.estado] || ESTADO_CONFIG.pendiente;
      const tipoCls = MisFichasData.TIPO_BADGE[f.tipo_ficha_id] || "badge-neutral";

      return `
        <article class="app-card flex flex-col p-5 gap-4">
          <div class="flex items-start justify-between gap-2">
            <span class="badge ${tipoCls}">${escHtml(f.tipo_nombre)}</span>
            <span class="badge ${cfg.cls}">${cfg.label}</span>
          </div>
          <div class="flex-1">
            <h3 class="font-heading text-base font-semibold text-text">${escHtml(f.nombre)}</h3>
            <p class="mt-0.5 text-xs text-text-muted">${escHtml(f.ciclo)} · ${escHtml(f.periodo)}</p>
            <p class="mt-2 text-sm text-text-muted">${f.n_preguntas} pregunta${f.n_preguntas !== 1 ? "s" : ""}</p>
            ${f.fecha_limite ? `<p class="mt-1 text-xs text-text-muted">Fecha límite: <strong>${formatDate(f.fecha_limite)}</strong></p>` : ""}
            ${f.estado === "enviada" && f.fecha_envio ? `<p class="mt-1 text-xs text-success">Enviada el ${formatDate(f.fecha_envio)}</p>` : ""}
          </div>
          <div>${accionBtn(f, base)}</div>
        </article>`;
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("enviada")) {
      toast("Ficha enviada correctamente");
      params.delete("enviada");
      window.history.replaceState({}, "", `${window.location.pathname}${params.toString() ? "?" + params : ""}`);
    }
    render();
  });
})();
