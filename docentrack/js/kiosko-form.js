/**
 * kiosko-form.js — formulario de registro + modal de confirmación.
 * Toast al abrir resumen y al confirmar; validación mínima de horas.
 */
(function () {
  function val(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function toast(message, type) {
    if (window.KioskoToastShow) window.KioskoToastShow(message, type);
    else document.dispatchEvent(new CustomEvent("kiosko:toast", { detail: { message, type } }));
  }

  function openModal() {
    const modal = document.getElementById("kiosk-confirm-modal");
    if (!modal) return;

    const entrada = val("hora-entrada");
    const salida = val("hora-salida");
    if (entrada && salida && entrada >= salida) {
      toast("La hora de salida debe ser posterior a la de entrada", "warning");
      return;
    }

    setText("confirm-curso", val("curso"));
    setText("confirm-ciclo", val("ciclo"));
    setText("confirm-periodo", val("periodo"));
    setText("confirm-tema", val("tema"));
    setText("confirm-aula", val("aula"));
    setText("confirm-alumnos", val("alumnos"));
    setText("confirm-horas", `${entrada} – ${salida}`);

    modal.hidden = false;
    document.body.classList.add("overflow-hidden");
    toast("Revise el resumen antes de confirmar", "info");
    modal.querySelector("[data-confirm-ok]")?.focus();
  }

  function closeModal() {
    const modal = document.getElementById("kiosk-confirm-modal");
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("overflow-hidden");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("kiosk-register-form");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      openModal();
    });

    document.querySelectorAll("[data-confirm-close]").forEach((btn) => {
      btn.addEventListener("click", closeModal);
    });

    document.querySelector("[data-confirm-ok]")?.addEventListener("click", () => {
      toast("Guardando registro…", "info");
      setTimeout(() => {
        window.location.href = "confirmacion.html";
      }, 450);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });
  });
})();
