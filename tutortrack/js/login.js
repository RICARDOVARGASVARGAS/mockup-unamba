/**
 * login.js — interacción del login de TutorTrack.
 *
 * Sin backend: el submit no valida nada, solo navega al dashboard de
 * Administrador (vista con el menú completo de las 4 secciones — ver
 * components/app-sidebar.js). La alerta de error (`[data-login-error]`)
 * queda en el markup para mostrar el estado visual, pero no se activa
 * desde aquí. El link "¿Olvidaste tu contraseña?" es solo visual, sin
 * funcionalidad (decisión confirmada del usuario).
 */

document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("login-password");
  const passwordToggle = document.querySelector("[data-password-toggle]");
  const iconEye = document.querySelector("[data-icon-eye]");
  const iconEyeOff = document.querySelector("[data-icon-eye-off]");

  const themeIconSun = document.querySelector("[data-icon-sun]");
  const themeIconMoon = document.querySelector("[data-icon-moon]");
  const syncThemeIcon = (theme) => {
    const isDark = theme === "dark";
    themeIconSun.classList.toggle("hidden", isDark);
    themeIconMoon.classList.toggle("hidden", !isDark);
  };
  syncThemeIcon(window.Theme ? window.Theme.getTheme() : "light");
  document.addEventListener("themechange", (event) => syncThemeIcon(event.detail.theme));

  passwordToggle.addEventListener("click", () => {
    const isVisible = passwordInput.type === "text";
    passwordInput.type = isVisible ? "password" : "text";
    passwordToggle.setAttribute("aria-pressed", String(!isVisible));
    passwordToggle.setAttribute("aria-label", isVisible ? "Mostrar contraseña" : "Ocultar contraseña");
    iconEye.classList.toggle("hidden", !isVisible);
    iconEyeOff.classList.toggle("hidden", isVisible);
  });

  document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    window.location.href = "pages/admin/dashboard.html";
  });
});
