/**
 * kiosko-sim.js — simulación del flujo de fichaje (mockup sin lector).
 *
 * En reposo: toque corto en la huella = lectura OK; mantener ~0,7 s abre
 * el selector de resultado (para demo de errores) sin panel permanente.
 * Procesando / identificado / confirmación avanzan solos con toast.
 */
(function () {
  const LONG_PRESS_MS = 700;

  const OUTCOMES = {
    ok: {
      label: "Huella reconocida",
      href: "identificado.html",
      delay: 1600,
      toast: { message: "Huella leída. Identificando docente…", type: "info" },
    },
    "no-reconocido": {
      label: "Huella no reconocida",
      href: "error-no-reconocido.html",
      delay: 1600,
      toast: { message: "No hay coincidencia en el padrón de huellas", type: "danger" },
    },
    "no-identificado": {
      label: "Docente no enrolado",
      href: "error-no-identificado.html",
      delay: 1600,
      toast: { message: "Docente sin huella enrolada", type: "warning" },
    },
    timeout: {
      label: "Timeout de captura",
      href: "error-timeout.html",
      delay: 1400,
      toast: { message: "Tiempo de espera agotado", type: "warning" },
    },
    desconectado: {
      label: "Lector desconectado",
      href: "error-lector-desconectado.html",
      delay: 900,
      toast: { message: "No se detecta el lector biométrico", type: "danger" },
    },
    guardado: {
      label: "Error al guardar (demo)",
      href: "error-guardado.html",
      delay: 700,
      toast: { message: "Simulando fallo al guardar el registro…", type: "danger" },
    },
  };

  function base() {
    return window.getBasePath ? window.getBasePath() : "";
  }

  function kioskPath(file) {
    const b = base();
    return b ? `${b}pages/kiosko/${file}` : `pages/kiosko/${file}`;
  }

  function toast(message, type) {
    if (window.KioskoToastShow) window.KioskoToastShow(message, type);
    else document.dispatchEvent(new CustomEvent("kiosko:toast", { detail: { message, type } }));
  }

  function page() {
    return document.body.dataset.kioskPage || "";
  }

  function simParam() {
    return new URLSearchParams(window.location.search).get("sim") || "ok";
  }

  function go(href) {
    window.location.href = href;
  }

  function delayMs(ms) {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? Math.min(ms, 200) : ms;
  }

  function startCapture(outcomeKey) {
    const key = OUTCOMES[outcomeKey] ? outcomeKey : "ok";
    sessionStorage.setItem("docentrack-sim", key);
    toast("Coloque el dedo… leyendo huella", "info");
    go(`${kioskPath("procesando.html")}?sim=${encodeURIComponent(key)}`);
  }

  function buildScenarioDialog() {
    const dialog = document.createElement("dialog");
    dialog.className = "kiosk-scenario-dialog";
    dialog.setAttribute("aria-labelledby", "kiosk-scenario-title");
    dialog.innerHTML = `
      <form method="dialog" class="kiosk-scenario-sheet">
        <h2 id="kiosk-scenario-title" class="font-heading text-lg font-semibold text-text">Probar otro resultado</h2>
        <p class="mt-1 text-sm text-text-muted">Solo para la demo del mockup. El flujo habitual es un toque breve en la huella.</p>
        <ul class="mt-4 space-y-2">
          ${Object.entries(OUTCOMES)
            .map(
              ([key, item]) => `
            <li>
              <button type="submit" value="${key}" class="kiosk-scenario-option">
                ${item.label}
              </button>
            </li>`
            )
            .join("")}
        </ul>
        <button type="submit" value="cancel" class="kiosk-scenario-cancel mt-3">Cancelar</button>
      </form>
    `;
    document.body.appendChild(dialog);
    dialog.addEventListener("close", () => {
      const value = dialog.returnValue;
      if (value && value !== "cancel" && OUTCOMES[value]) startCapture(value);
    });
    return dialog;
  }

  function wireFingerprintPad() {
    const pad = document.querySelector("[data-fingerprint-start]");
    if (!pad) return;

    let pressTimer = null;
    let longFired = false;
    let dialog = null;

    const clearPress = () => {
      clearTimeout(pressTimer);
      pressTimer = null;
    };

    const openScenarios = () => {
      longFired = true;
      if (!dialog) dialog = buildScenarioDialog();
      dialog.returnValue = "";
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    };

    const onDown = (event) => {
      if (event.type === "mousedown" && event.button !== 0) return;
      longFired = false;
      clearPress();
      pressTimer = setTimeout(openScenarios, LONG_PRESS_MS);
    };

    const onUp = (event) => {
      if (event.type === "mouseup" && event.button !== 0) return;
      clearPress();
      if (longFired) return;
      startCapture("ok");
    };

    const onCancel = () => clearPress();

    pad.addEventListener("mousedown", onDown);
    pad.addEventListener("mouseup", onUp);
    pad.addEventListener("mouseleave", onCancel);
    pad.addEventListener("touchstart", onDown, { passive: true });
    pad.addEventListener("touchend", onUp);
    pad.addEventListener("touchcancel", onCancel);
    pad.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        startCapture("ok");
      }
    });
  }

  function runProcessing() {
    const key = simParam();
    const outcome = OUTCOMES[key] || OUTCOMES.ok;
    toast(outcome.toast.message, outcome.toast.type);
    setTimeout(() => go(kioskPath(outcome.href)), delayMs(outcome.delay));
  }

  function runIdentified() {
    toast("Docente identificado: Lucía Mamani Quispe", "success");
    setTimeout(() => go(kioskPath("formulario.html")), delayMs(1500));
  }

  function runSuccess() {
    toast("Registro guardado correctamente", "success");
    setTimeout(() => go(`${base()}index.html`), delayMs(4500));
  }

  function runErrorPage() {
    const messages = {
      "no-reconocido": { message: "Huella no reconocida. Intente de nuevo.", type: "danger" },
      "no-identificado": { message: "Docente sin enrolar. Acuda a administración.", type: "warning" },
      desconectado: { message: "Lector desconectado. Revise el cable USB.", type: "danger" },
      timeout: { message: "Tiempo agotado. Vuelva a colocar el dedo.", type: "warning" },
      guardado: { message: "No se pudo guardar. Intente otra vez.", type: "danger" },
    };
    const key = page().replace(/^error-/, "");
    const msg = messages[key];
    if (msg) toast(msg.message, msg.type);
  }

  function runFormHints() {
    if (document.querySelector(".badge-warning")) {
      toast('Marcado "fuera de horario" — puedes guardar igual; el admin lo revisará', "warning");
    }
  }

  function initReaderBar() {
    const bar = document.querySelector("[data-reader-status]");
    if (!bar) return;
    const disconnected = page() === "error-desconectado" || simParam() === "desconectado";
    bar.dataset.state = disconnected ? "offline" : "online";
    const label = bar.querySelector("[data-reader-label]");
    if (label) {
      label.textContent = disconnected ? "Lector desconectado" : "Lector biométrico listo";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initReaderBar();
    const current = page();

    if (current === "reposo") wireFingerprintPad();
    if (current === "procesando") runProcessing();
    if (current === "identificado") runIdentified();
    if (current === "confirmacion") runSuccess();
    if (current === "formulario") runFormHints();
    if (current.startsWith("error")) runErrorPage();
  });

  window.KioskoSim = { startCapture, OUTCOMES };
})();
