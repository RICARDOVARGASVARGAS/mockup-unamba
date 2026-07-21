/**
 * mis-fichas.js — Estudiante › Mis fichas (mobile-first).
 * Dos bloqueos: no habilitada / completa la anterior (secuencia).
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

  function estudianteId() {
    return sessionStorage.getItem("tutortrack-demo-estudiante") || "est-1";
  }

  function setEstudianteId(id) {
    sessionStorage.setItem("tutortrack-demo-estudiante", id);
  }

  function estadoLabel(item) {
    if (item.bloqueo === "no_habilitada") {
      return { text: "aún no disponible", cls: "text-text-muted" };
    }
    if (item.bloqueo === "secuencia") {
      return { text: "completa la anterior", cls: "text-warning" };
    }
    if (item.estado_llenado === "enviada") {
      const fecha = item.ficha_llenada?.fecha_enviado
        ? new Date(item.ficha_llenada.fecha_enviado).toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "2-digit",
          })
        : "";
      return { text: `● Enviada${fecha ? ` · ${fecha}` : ""}`, cls: "text-success" };
    }
    if (item.estado_llenado === "borrador") {
      const { respondidas, total } = item.progreso;
      return { text: `◐ Borrador ${respondidas}/${total}`, cls: "text-warning" };
    }
    return { text: "○ Sin abrir", cls: "text-text-muted" };
  }

  function accionHtml(item) {
    if (item.bloqueo) return "";
    if (item.estado_llenado === "enviada") {
      return `<a href="llenar-ficha.html?fcp=${esc(item.fcp.id)}&ver=1" class="btn-secondary shrink-0">Ver</a>`;
    }
    if (item.estado_llenado === "borrador") {
      return `<a href="llenar-ficha.html?fcp=${esc(item.fcp.id)}" class="btn-primary shrink-0">Continuar</a>`;
    }
    return `<a href="llenar-ficha.html?fcp=${esc(item.fcp.id)}" class="btn-primary shrink-0">Llenar</a>`;
  }

  function render() {
    const estId = estudianteId();
    const items = FichasCicloData.misFichasEstudiante(estId);
    const list = document.querySelector("[data-fichas-list]");
    const empty = document.querySelector("[data-fichas-empty]");
    const tutor = document.querySelector("[data-tutor]");
    if (tutor) tutor.textContent = FichasCicloData.DOCENTE_DEMO.nombre_corto;

    if (!items.length) {
      list.innerHTML = "";
      empty?.classList.remove("hidden");
      return;
    }
    empty?.classList.add("hidden");

    list.innerHTML = items
      .map((item) => {
        const fcp = item.fcp;
        const tipo = FichasData.tipoFichaNombre(fcp.tipo_ficha_id);
        const badge = TIPO_BADGE[fcp.tipo_ficha_id] || "badge-neutral";
        const nPreg = (fcp.preguntas || []).length;
        const st = estadoLabel(item);
        const locked = !!item.bloqueo;

        if (locked) {
          const msg =
            item.bloqueo === "no_habilitada"
              ? "🔒 aún no disponible"
              : "🔒 completa la anterior";
          return `
          <article class="rounded-xl border border-border bg-surface/60 p-4 opacity-80">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="font-medium text-text">${esc(fcp.nombre)}</h3>
                  <span class="badge ${badge}">${esc(tipo)}</span>
                </div>
                <p class="mt-1.5 text-sm ${st.cls}">${nPreg} preg · ${msg}</p>
              </div>
            </div>
          </article>`;
        }

        return `
        <article class="rounded-xl border border-border bg-surface p-4 shadow-sm ${item.activa ? "ring-1 ring-primary/30" : ""}">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-medium text-text">${esc(fcp.nombre)}</h3>
                <span class="badge ${badge}">${esc(tipo)}</span>
              </div>
              <p class="mt-1.5 text-sm ${st.cls}">${nPreg} preguntas · ${st.text}</p>
            </div>
            ${accionHtml(item)}
          </div>
        </article>`;
      })
      .join("");
  }

  function fillSelect() {
    const sel = document.getElementById("sel-estudiante");
    if (!sel) return;
    sel.innerHTML = FichasCicloData.ESTUDIANTES.map((e) => {
      const name = FichasCicloData.nombreEstudiante(e);
      return `<option value="${esc(e.id)}" ${e.id === estudianteId() ? "selected" : ""}>${esc(name)} · ${esc(e.codigo)}</option>`;
    }).join("");
    sel.addEventListener("change", () => {
      setEstudianteId(sel.value);
      render();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.FichasCicloData || !window.FichasData) return;
    Promise.all([FichasData.ready(), FichasCicloData.ready()])
      .then(() => {
        fillSelect();
        render();
      })
      .catch((err) => {
        console.error(err);
        toast("Error al cargar fichas", "danger");
      });
  });
})();
