/**
 * tutor.js — Estudiante › Mi tutor (contacto cálido del tutor vigente).
 */
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const D = window.AlertasDerivacionesData;
    const tutor = D?.DOCENTE_DEMO;
    const card = document.querySelector("[data-tutor-card]");
    const empty = document.querySelector("[data-sin-tutor]");

    if (!tutor) {
      card?.classList.add("hidden");
      empty?.classList.remove("hidden");
      return;
    }

    const bp = typeof getBasePath === "function" ? getBasePath() : "../../";
    document.querySelector("[data-tutor-nombre]").textContent = `Dr. ${tutor.nombre}`;
    document.querySelector("[data-tutor-esp]").textContent = "Especialidad: Marketing";
    document.querySelector("[data-tutor-email]").textContent = "📧 c.quispe@unamba.edu.pe";
    document.querySelector("[data-tutor-cel]").textContent = "📱 910 000 011";
    const foto = document.querySelector("[data-tutor-foto]");
    if (foto) foto.src = `${bp}assets/img/docentes/docente-1.jpg`;
  });
})();
