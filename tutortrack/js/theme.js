/**
 * theme.js — contraste de texto sobre fills de marca.
 *
 * TutorTrack usa un único tema claro. Este módulo solo ajusta
 * --color-on-primary / --color-on-accent según el fill real.
 * Las superficies de marca (fotos, campus-strip) usan --color-on-brand.
 */

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
  const inkContrast = contrastRatio(bgLum, relativeLuminance("#122033"));
  return whiteContrast >= inkContrast ? "#ffffff" : "#122033";
}

function syncPrimaryContrast() {
  const styles = getComputedStyle(document.documentElement);
  const primary = styles.getPropertyValue("--color-primary").trim();
  const accent = styles.getPropertyValue("--color-accent").trim();

  const onPrimary = bestOnColor(primary);
  const onAccent = bestOnColor(accent);

  if (onPrimary) document.documentElement.style.setProperty("--color-on-primary", onPrimary);
  if (onAccent) document.documentElement.style.setProperty("--color-on-accent", onAccent);
  document.documentElement.style.setProperty("--color-on-brand", "#ffffff");
}

document.documentElement.removeAttribute("data-theme");
syncPrimaryContrast();

window.Theme = { syncPrimaryContrast };
