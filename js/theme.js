/**
 * theme.js — mecanismo de modo claro/oscuro.
 *
 * Alterna el atributo [data-theme] en <html>, que es lo que hace que
 * css/tokens.css cambie de valores (mismo nombre de variable, distinto
 * valor). No define nuevos estilos aquí, solo cambia de tema.
 *
 * Estado en memoria (una variable JS), sin localStorage/sessionStorage,
 * tal como pide CLAUDE.md. Ojo: al ser un sitio multi-página (no SPA),
 * esto significa que el tema vuelve a "claro" al navegar a otra página
 * .html. Si más adelante se quiere que el tema persista entre páginas,
 * habría que revisar esa regla (por ejemplo, permitir sessionStorage).
 */

const THEMES = ["light", "dark"];
const DEFAULT_THEME = "light";

let currentTheme = DEFAULT_THEME;

function applyTheme(theme) {
  if (!THEMES.includes(theme)) return;
  currentTheme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  document.dispatchEvent(
    new CustomEvent("themechange", { detail: { theme: currentTheme } })
  );
}

function toggleTheme() {
  applyTheme(currentTheme === "light" ? "dark" : "light");
}

function getTheme() {
  return currentTheme;
}

// Aplica el tema por defecto en cuanto carga el script.
applyTheme(currentTheme);

// Cualquier elemento con [data-theme-toggle] alterna el tema al hacer clic.
document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-theme-toggle]");
  if (trigger) toggleTheme();
});

window.Theme = { applyTheme, toggleTheme, getTheme };
