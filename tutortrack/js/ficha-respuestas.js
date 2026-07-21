/**
 * ficha-respuestas.js — Docente › ver respuestas (solo lectura) + observaciones + marcar revisada.
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

  let fl = null;
  let fcp = null;
  let est = null;
  let saveTimers = {};

  function formatRespuesta(pregunta, respuesta) {
    if (!respuesta) return "<span class=\"text-text-muted\">Sin respuesta</span>";
    const tipo = pregunta.tipo_pregunta || pregunta.tipo;
    if (tipo === "texto_abierto") {
      return esc(respuesta.respuesta_texto || "—");
    }
    if (tipo === "escala") {
      const max = pregunta.escala_max ?? 5;
      const v = respuesta.respuesta_valor;
      const alto = v >= Math.ceil(max * 0.8) ? " (alto)" : "";
      return `${esc(v)} / ${esc(max)}${alto}`;
    }
    const ops = pregunta.opciones || [];
    const ids = new Set(respuesta.opciones_ids || []);
    const labels = ops.filter((o) => ids.has(o.id)).map((o) => o.texto);
    return labels.length ? esc(labels.join(" · ")) : "—";
  }

  function render() {
    document.querySelector("[data-ficha-nombre]").textContent = fcp.nombre;
    const fecha = fl.fecha_enviado
      ? new Date(fl.fecha_enviado).toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—";
    const badge = fl.revisada
      ? '<span class="badge badge-success">✓ Revisada</span>'
      : '<span class="badge badge-warning">○ Sin revisar</span>';
    document.querySelector("[data-meta]").innerHTML = `
      ${esc(FichasCicloData.nombreEstudiante(est))} · ${esc(est.codigo)} · ${esc(FichasCicloData.CICLO_DEMO.nombre)}
      · Enviada ${esc(fecha)} · ${badge}`;

    const btn = document.querySelector("[data-btn-revisada]");
    if (fl.revisada) {
      btn.textContent = "✓ Ya revisada";
      btn.disabled = true;
      btn.classList.remove("btn-primary");
      btn.classList.add("btn-secondary");
    }

    const map = {};
    (fl.respuestas || []).forEach((r) => {
      map[r.pregunta_id] = r;
    });

    const wrap = document.querySelector("[data-respuestas]");
    wrap.innerHTML = (fcp.preguntas || [])
      .map((p, i) => {
        const r = map[p.id];
        const obs = r?.observaciones_tutor || "";
        const hasObs = !!obs.trim();
        return `
        <article class="rounded-xl border border-border bg-surface p-4" data-respuesta-card="${esc(r?.id || p.id)}">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <p class="font-medium text-text">${i + 1}. ${esc(p.enunciado)}</p>
            <span class="badge badge-neutral">${esc(FichasData.areaNombre(p.area_id))}</span>
          </div>
          <p class="mt-2 text-sm text-text">
            <span class="text-text-muted">Respuesta:</span> ${formatRespuesta(p, r)}
          </p>
          <div class="mt-3" data-obs-wrap>
            ${
              hasObs
                ? `
              <label class="form-label text-xs">💬 Observación del tutor</label>
              <textarea class="form-textarea mt-1" rows="2" data-obs="${esc(r?.id || "")}" placeholder="Observación…">${esc(obs)}</textarea>
              <p class="mt-1 text-xs text-text-muted" data-obs-status></p>`
                : `
              <button type="button" class="text-sm font-medium text-primary hover:underline" data-add-obs="${esc(r?.id || "")}">
                💬 + agregar observación
              </button>
              <div class="hidden mt-2" data-obs-editor>
                <textarea class="form-textarea" rows="2" data-obs="${esc(r?.id || "")}" placeholder="Observación…"></textarea>
                <p class="mt-1 text-xs text-text-muted" data-obs-status></p>
              </div>`
            }
          </div>
        </article>`;
      })
      .join("");
  }

  function saveObs(respuestaId, texto, statusEl) {
    if (!respuestaId || !fl) return;
    const r = (fl.respuestas || []).find((x) => x.id === respuestaId);
    if (!r) return;
    r.observaciones_tutor = texto;
    FichasCicloData.upsertLlenado(fl);
    if (statusEl) statusEl.textContent = "Guardado ✓";
  }

  function bind() {
    document.querySelector("[data-respuestas]")?.addEventListener("click", (e) => {
      const add = e.target.closest("[data-add-obs]");
      if (!add) return;
      const wrap = add.closest("[data-obs-wrap]");
      add.classList.add("hidden");
      wrap?.querySelector("[data-obs-editor]")?.classList.remove("hidden");
      wrap?.querySelector("textarea")?.focus();
    });

    document.querySelector("[data-respuestas]")?.addEventListener("input", (e) => {
      const ta = e.target.closest("[data-obs]");
      if (!ta) return;
      const id = ta.getAttribute("data-obs");
      const status = ta.parentElement?.querySelector("[data-obs-status]");
      if (status) status.textContent = "Guardando…";
      clearTimeout(saveTimers[id]);
      saveTimers[id] = setTimeout(() => saveObs(id, ta.value, status), 500);
    });

    document.querySelector("[data-btn-revisada]")?.addEventListener("click", () => {
      if (!fl || fl.estado !== "enviada") {
        toast("Solo se pueden marcar fichas enviadas", "danger");
        return;
      }
      if (fl.revisada) return;
      fl.revisada = true;
      FichasCicloData.upsertLlenado(fl);
      toast("Marcada como revisada");
      render();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.FichasCicloData) return;
    const flId = new URLSearchParams(window.location.search).get("fl");

    Promise.all([FichasData.ready(), FichasCicloData.ready()])
      .then(() => {
        fl = FichasCicloData.findLlenadoById(flId);
        if (!fl || fl.estado !== "enviada") {
          toast("Solo se pueden ver fichas enviadas", "danger");
          setTimeout(() => {
            window.location.href = "fichas-tutorados.html";
          }, 700);
          return;
        }
        fcp = FichasCicloData.findFcp(fl.ficha_ciclo_periodo_id);
        est = FichasCicloData.ESTUDIANTES.find((e) => e.id === fl.estudiante_id);
        if (!fcp || !est) {
          toast("Datos incompletos", "danger");
          return;
        }
        render();
        bind();
      })
      .catch((err) => {
        console.error(err);
        toast("Error al cargar respuestas", "danger");
      });
  });
})();
