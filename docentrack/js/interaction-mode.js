/**
 * interaction-mode.js — herramienta de mockup: alterna el "modo de
 * interacción" del kiosko entre Escritorio y Táctil (ver "Modo de
 * interacción" en docentrack/CLAUDE.md).
 *
 * Alterna [data-density] en <html>, que es lo que hace que css/tokens.css
 * agrande --kiosk-tap/--kiosk-gap/--kiosk-text. No define tamaños aquí,
 * solo cambia el modo. Estado en memoria, igual que theme.js.
 */

const DENSITIES = ["desktop", "touch"];
const DEFAULT_DENSITY = "desktop";

let currentDensity = DEFAULT_DENSITY;

function applyDensity(density) {
  if (!DENSITIES.includes(density)) return;
  currentDensity = density;
  if (density === "touch") {
    document.documentElement.setAttribute("data-density", "touch");
  } else {
    document.documentElement.removeAttribute("data-density");
  }
  document.dispatchEvent(new CustomEvent("densitychange", { detail: { density: currentDensity } }));
}

function toggleDensity() {
  applyDensity(currentDensity === "desktop" ? "touch" : "desktop");
}

function getDensity() {
  return currentDensity;
}

applyDensity(currentDensity);

document.addEventListener("click", (event) => {
  const setTrigger = event.target.closest("[data-density-set]");
  if (setTrigger) {
    applyDensity(setTrigger.dataset.densitySet);
    return;
  }
  const trigger = event.target.closest("[data-density-toggle]");
  if (trigger) toggleDensity();
});

window.InteractionMode = { applyDensity, toggleDensity, getDensity };
