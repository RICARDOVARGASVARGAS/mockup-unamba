/**
 * theme.js — mecanismo de modo claro/oscuro.
 *
 * Alterna el atributo [data-theme] en <html>, que es lo que hace que
 * css/tokens.css cambie de valores (mismo nombre de variable, distinto
 * valor). No define nuevos estilos aquí, solo cambia de tema.
 *
 * Estado en memoria (una variable JS), sin localStorage/sessionStorage.
 * Al ser un sitio multi-página (no SPA), el tema vuelve a "claro" al
 * navegar a otra página .html.
 */

const THEMES = ["light", "dark"];
const DEFAULT_THEME = "light";

let currentTheme = DEFAULT_THEME;

function relativeLuminance(hex) {
  const clean = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(clean.substr(i, 2), 16) / 255);
  const [R, G, B] = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(lumA, lumB) {
  const [light, dark] = lumA > lumB ? [lumA, lumB] : [lumB, lumA];
  return (light + 0.05) / (dark + 0.05);
}

function syncPrimaryContrast() {
  const primary = getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim();
  if (!/^#[0-9a-f]{6}$/i.test(primary)) return;

  const bgLum = relativeLuminance(primary);
  const whiteContrast = contrastRatio(bgLum, 1);
  const darkContrast = contrastRatio(bgLum, relativeLuminance("#1a1524")); // --gray-900, fijo en ambos temas
  const onPrimary = whiteContrast >= darkContrast ? "#ffffff" : "#1a1524";

  document.documentElement.style.setProperty("--color-on-primary", onPrimary);
}

function applyTheme(theme) {
  if (!THEMES.includes(theme)) return;
  currentTheme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  syncPrimaryContrast();
  document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: currentTheme } }));
}

function toggleTheme() {
  applyTheme(currentTheme === "light" ? "dark" : "light");
}

function getTheme() {
  return currentTheme;
}

applyTheme(currentTheme);

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-theme-toggle]");
  if (trigger) toggleTheme();
});

window.Theme = { applyTheme, toggleTheme, getTheme, syncPrimaryContrast };
