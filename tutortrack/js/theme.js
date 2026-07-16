/**
 * theme.js — mecanismo de modo claro/oscuro.
 *
 * Alterna [data-theme] en <html>. Los valores viven en css/tokens.css.
 * Estado en memoria (sin localStorage). Al navegar a otra página .html
 * el tema vuelve a "claro".
 *
 * syncPrimaryContrast ajusta --color-on-primary / --color-on-accent
 * según el fill real. Las superficies de marca (fotos, campus-strip)
 * usan --color-on-brand (siempre claro) y no dependen de este sync.
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

function bestOnColor(bgHex) {
  if (!/^#[0-9a-f]{6}$/i.test(bgHex)) return null;
  const bgLum = relativeLuminance(bgHex);
  const whiteContrast = contrastRatio(bgLum, 1);
  const inkContrast = contrastRatio(bgLum, relativeLuminance("#0a101c"));
  return whiteContrast >= inkContrast ? "#ffffff" : "#0a101c";
}

function syncPrimaryContrast() {
  const styles = getComputedStyle(document.documentElement);
  const primary = styles.getPropertyValue("--color-primary").trim();
  const accent = styles.getPropertyValue("--color-accent").trim();

  const onPrimary = bestOnColor(primary);
  const onAccent = bestOnColor(accent);

  if (onPrimary) document.documentElement.style.setProperty("--color-on-primary", onPrimary);
  if (onAccent) document.documentElement.style.setProperty("--color-on-accent", onAccent);
  /* Marca/foto: siempre blanco legible sobre navy */
  document.documentElement.style.setProperty("--color-on-brand", "#ffffff");
}

function applyTheme(theme) {
  if (!THEMES.includes(theme)) return;
  currentTheme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  /* Limpia overrides inline previos para que tokens.css mande, luego sync */
  document.documentElement.style.removeProperty("--color-on-primary");
  document.documentElement.style.removeProperty("--color-on-accent");
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
