/**
 * llenar-ficha.js — Estudiante › Llenar ficha.
 * Render por tipo · autoguardado borrador · enviar (bloquea).
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

  let fcp = null;
  let llenado = null;
  let soloLectura = false;
  let saveTimer = null;

  function estudianteId() {
    return sessionStorage.getItem("tutortrack-demo-estudiante") || "est-1";
  }

  function answersMap() {
    const map = {};
    (llenado?.respuestas || []).forEach((r) => {
      map[r.pregunta_id] = r;
    });
    return map;
  }

  function widget(p, answer, disabled) {
    const tipo = p.tipo_pregunta || p.tipo;
    const name = `q-${p.id}`;
    const dis = disabled ? "disabled" : "";

    if (tipo === "texto_abierto") {
      return `<textarea name="${esc(name)}" data-preg="${esc(p.id)}" data-tipo="texto_abierto" rows="3" class="form-textarea min-h-[5.5rem]" placeholder="Escribe tu respuesta…" ${dis}>${esc(answer?.respuesta_texto || "")}</textarea>`;
    }

    if (tipo === "escala") {
      const min = p.escala_min ?? 1;
      const max = p.escala_max ?? 5;
      const val = answer?.respuesta_valor;
      const nums = [];
      for (let n = min; n <= max; n += 1) nums.push(n);
      return `
        <div class="flex flex-wrap items-center gap-2 sm:gap-3" data-preg="${esc(p.id)}" data-tipo="escala">
          <span class="text-xs text-text-muted">${esc(p.etiqueta_min || "")}</span>
          ${nums
            .map(
              (n) => `
            <label class="inline-flex min-h-[44px] min-w-[44px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md border border-border px-2 py-1.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/10">
              <input type="radio" name="${esc(name)}" value="${n}" class="sr-only" ${val == n ? "checked" : ""} ${dis} />
              <span class="font-semibold">${n}</span>
            </label>`
            )
            .join("")}
          <span class="text-xs text-text-muted">${esc(p.etiqueta_max || "")}</span>
        </div>`;
    }

    const ops =
      tipo === "si_no" && !(p.opciones || []).length
        ? [
            { id: `${p.id}-si`, texto: "Sí" },
            { id: `${p.id}-no`, texto: "No" },
          ]
        : p.opciones || [];
    const selected = new Set(answer?.opciones_ids || []);
    const inputType = tipo === "respuesta_multiple" ? "checkbox" : "radio";

    return `
      <div class="space-y-2" data-preg="${esc(p.id)}" data-tipo="${esc(tipo)}">
        ${ops
          .map(
            (o) => `
          <label class="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input type="${inputType}" name="${esc(name)}" value="${esc(o.id)}" class="h-4 w-4 text-primary" ${selected.has(o.id) ? "checked" : ""} ${dis} />
            <span class="text-sm text-text">${esc(o.texto)}</span>
          </label>`
          )
          .join("")}
      </div>`;
  }

  function collectAnswers() {
    const form = document.querySelector("[data-llenar-form]");
    const preguntas = fcp.preguntas || [];
    return preguntas.map((p) => {
      const tipo = p.tipo_pregunta || p.tipo;
      const base = {
        id: `${llenado.id}-r${p.orden}`,
        ficha_llenada_id: llenado.id,
        pregunta_id: p.id,
        respuesta_texto: null,
        respuesta_valor: null,
        observaciones_tutor: answersMap()[p.id]?.observaciones_tutor || "",
        opciones_ids: [],
      };

      if (tipo === "texto_abierto") {
        const el = form.querySelector(`[data-preg="${p.id}"]`);
        base.respuesta_texto = el?.value?.trim() || "";
        if (!base.respuesta_texto) return null;
      } else if (tipo === "escala") {
        const checked = form.querySelector(`[data-preg="${p.id}"] input:checked`);
        if (!checked) return null;
        base.respuesta_valor = Number(checked.value);
      } else {
        const checked = Array.from(
          form.querySelectorAll(`[data-preg="${p.id}"] input:checked`)
        );
        if (!checked.length) return null;
        base.opciones_ids = checked.map((c) => c.value);
      }
      return base;
    }).filter(Boolean);
  }

  function updateProgress() {
    const total = (fcp.preguntas || []).length;
    const answered = collectAnswers().length;
    const pct = total ? Math.round((answered / total) * 100) : 0;
    const txt = document.querySelector("[data-progreso-texto]");
    const bar = document.querySelector("[data-progreso-bar]");
    if (txt) txt.textContent = `${answered} / ${total}`;
    if (bar) bar.style.width = `${pct}%`;
    const btn = document.querySelector("[data-btn-enviar]");
    if (btn && !soloLectura) btn.disabled = answered < total;
  }

  function setSaveIndicator(msg) {
    const el = document.querySelector("[data-save-indicator]");
    if (el) el.textContent = msg;
  }

  function ensureLlenado() {
    const estId = estudianteId();
    let fl = FichasCicloData.findLlenado(estId, fcp.id);
    if (!fl) {
      fl = {
        id: `fl-${estId}-${fcp.id}`,
        estudiante_id: estId,
        ficha_ciclo_periodo_id: fcp.id,
        estado: "borrador",
        revisada: false,
        fecha_enviado: null,
        respuestas: [],
      };
      FichasCicloData.upsertLlenado(fl);
    }
    return fl;
  }

  function canOpen() {
    const items = FichasCicloData.misFichasEstudiante(estudianteId());
    const item = items.find((i) => i.fcp.id === fcp.id);
    if (!item) return { ok: false, reason: "Ficha no encontrada" };
    if (item.bloqueo === "no_habilitada") return { ok: false, reason: "Esta ficha aún no está disponible" };
    if (item.bloqueo === "secuencia") return { ok: false, reason: "Completa la ficha anterior primero" };
    return { ok: true, item };
  }

  function saveDraft(silent) {
    if (soloLectura) return;
    llenado = ensureLlenado();
    if (llenado.estado === "enviada") {
      soloLectura = true;
      return;
    }
    llenado.estado = "borrador";
    llenado.respuestas = collectAnswers();
    FichasCicloData.upsertLlenado(llenado);
    setSaveIndicator("Guardado ✓");
    if (!silent) toast("Borrador guardado");
    updateProgress();
  }

  function scheduleAutosave() {
    if (soloLectura) return;
    setSaveIndicator("Guardando…");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveDraft(true), 600);
  }

  function enviar() {
    if (soloLectura) return;
    const answers = collectAnswers();
    const total = (fcp.preguntas || []).length;
    if (answers.length < total) {
      toast("Responde todas las preguntas antes de enviar", "danger");
      return;
    }
    AppConfirm.request({
      title: "Enviar ficha",
      confirmLabel: "Enviar",
      cancelLabel: "Cancelar",
      variant: "primary",
      messageHtml:
        "<p>Una vez enviada <strong class=\"text-text\">no podrás editarla</strong>. ¿Deseas continuar?</p>",
    }).then((ok) => {
      if (!ok) return;
      llenado = ensureLlenado();
      llenado.estado = "enviada";
      llenado.fecha_enviado = new Date().toISOString();
      llenado.respuestas = answers;
      FichasCicloData.upsertLlenado(llenado);
      toast("Ficha enviada");
      window.location.href = "mis-fichas.html";
    });
  }

  function render() {
    const form = document.querySelector("[data-llenar-form]");
    const map = answersMap();
    document.querySelector("[data-ficha-nombre]").textContent = fcp.nombre;

    form.innerHTML = (fcp.preguntas || [])
      .map((p, i) => {
        const tipo = FichasData.tipoPreguntaLabel(p.tipo_pregunta || p.tipo);
        return `
        <fieldset class="rounded-xl border border-border bg-surface p-4">
          <legend class="px-1 text-sm font-medium text-text">
            ${i + 1}. ${esc(p.enunciado)}
            <span class="ml-1 font-normal text-text-muted">· ${esc(tipo)}</span>
          </legend>
          <div class="mt-3">${widget(p, map[p.id], soloLectura)}</div>
        </fieldset>`;
      })
      .join("");

    if (soloLectura) {
      document.querySelector("[data-btn-borrador]")?.classList.add("hidden");
      document.querySelector("[data-btn-enviar]")?.classList.add("hidden");
      document.querySelector("[data-solo-lectura]")?.classList.remove("hidden");
    }

    updateProgress();
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.FichasCicloData || !window.FichasData) return;
    const q = new URLSearchParams(window.location.search);
    const fcpId = q.get("fcp");
    const ver = q.get("ver") === "1";

    Promise.all([FichasData.ready(), FichasCicloData.ready()])
      .then(() => {
        fcp = FichasCicloData.findFcp(fcpId);
        if (!fcp) {
          toast("Ficha no encontrada", "danger");
          return;
        }

        const gate = canOpen();
        if (!gate.ok && !ver) {
          toast(gate.reason, "danger");
          setTimeout(() => {
            window.location.href = "mis-fichas.html";
          }, 800);
          return;
        }

        llenado = FichasCicloData.findLlenado(estudianteId(), fcp.id);
        if (llenado?.estado === "enviada" || ver) {
          soloLectura = true;
          if (!llenado) llenado = { id: "tmp", respuestas: [] };
        } else {
          llenado = ensureLlenado();
        }

        render();

        const form = document.querySelector("[data-llenar-form]");
        form?.addEventListener("input", () => {
          updateProgress();
          scheduleAutosave();
        });
        form?.addEventListener("change", () => {
          updateProgress();
          scheduleAutosave();
        });

        document.querySelector("[data-btn-borrador]")?.addEventListener("click", () => saveDraft(false));
        document.querySelector("[data-btn-enviar]")?.addEventListener("click", enviar);
      })
      .catch((err) => {
        console.error(err);
        toast("Error al abrir la ficha", "danger");
      });
  });
})();
