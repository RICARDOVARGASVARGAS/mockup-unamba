/**
 * kiosko-form.js — formulario de registro + modal de confirmación.
 *
 * Al pulsar "Guardar registro" se muestra el resumen completo y las
 * fotos; el usuario elige Confirmar o Cancelar.
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

  function openModal() {
    const modal = document.getElementById("kiosk-confirm-modal");
    if (!modal) return;

    setText("confirm-curso", val("curso"));
    setText("confirm-ciclo", val("ciclo"));
    setText("confirm-periodo", val("periodo"));
    setText("confirm-tema", val("tema"));
    setText("confirm-aula", val("aula"));
    setText("confirm-alumnos", val("alumnos"));
    setText("confirm-horas", `${val("hora-entrada")} – ${val("hora-salida")}`);

    modal.hidden = false;
    document.body.classList.add("overflow-hidden");
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
      window.location.href = "confirmacion.html";
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });
  });
})();
