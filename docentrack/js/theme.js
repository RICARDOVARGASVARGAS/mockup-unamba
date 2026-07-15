/**
 * theme.js — modo claro/oscuro DocenTrack.
 *
 * Alterna [data-theme] en <html>. Estado en memoria (sin localStorage).
 * En multi-página el tema vuelve a "claro" al navegar a otro .html.
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
  const ink = getComputedStyle(document.documentElement).getPropertyValue("--gray-900").trim() || "#0f1c2e";
  const inkHex = /^#[0-9a-f]{6}$/i.test(ink) ? ink : "#0f1c2e";
  const darkContrast = contrastRatio(bgLum, relativeLuminance(inkHex));
  const onPrimary = whiteContrast >= darkContrast ? "#ffffff" : inkHex;

  document.documentElement.style.setProperty("--color-on-primary", onPrimary);
}

function syncThemeControls(theme) {
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    const next = theme === "dark" ? "claro" : "oscuro";
    btn.setAttribute("aria-label", `Cambiar a modo ${next}`);
    btn.setAttribute("title", `Cambiar a modo ${next}`);
  });
}

function applyTheme(theme) {
  if (!THEMES.includes(theme)) return;
  currentTheme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  syncPrimaryContrast();
  syncThemeControls(theme);
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
