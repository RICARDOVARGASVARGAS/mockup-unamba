# PALETA.md — Sistema de Diseño del Mockup

Define los tokens de diseño (color, tipografía, bordes, sombras, espaciado)
del mockup. Todo se implementa como variables para poder cambiarlo desde un
solo lugar. Acompaña a `CLAUDE.md`.

> ⚠️ COLORES PROVISIONALES: los hex de marca (azul y amarillo) son una
> aproximación a la identidad de la UNAMBA, NO valores oficiales. Reemplázalos
> por los del manual de identidad o el logo oficial cuando estén disponibles.
> El picker del mockup sirve exactamente para afinarlos y exportar los hex.

---

## 1. Colores de marca

| Rol | Variable | HEX provisional | Uso |
|-----|----------|-----------------|-----|
| Primario | `--color-primary` | `#0B3D91` | Azul institucional. Cabecera, botones, enlaces. |
| Primario oscuro | `--color-primary-dark` | `#082C6B` | Hover de botones, énfasis. |
| Primario claro | `--color-primary-light` | `#3B63B0` | Fondos suaves, estados. |
| Acento | `--color-accent` | `#F2B705` | Amarillo/dorado. Resaltes, hover, detalles. |
| Acento oscuro | `--color-accent-dark` | `#C99503` | Hover sobre elementos de acento. |

**Regla del amarillo (IMPORTANTE):** el amarillo es acento, no color de
fondo de botones con texto blanco (ilegible). Si un botón es amarillo, su
texto debe ser oscuro (`--color-text` en tono oscuro), nunca blanco.
Preferir botones primarios en azul; amarillo para detalles y resaltes.

---

## 2. Tema claro (por defecto)

| Variable | HEX | Uso |
|----------|-----|-----|
| `--color-bg` | `#FFFFFF` | Fondo general. |
| `--color-surface` | `#F5F7FA` | Tarjetas, superficies elevadas. |
| `--color-surface-2` | `#EBEEF3` | Superficies secundarias, hover de filas. |
| `--color-text` | `#1A1F2B` | Texto principal. |
| `--color-text-muted` | `#5B6472` | Texto secundario, descripciones. |
| `--color-border` | `#D9DEE6` | Bordes y separadores. |

---

## 3. Tema oscuro

Mismos roles, valores adaptados. El azul y amarillo se aclaran un poco para
no vibrar sobre fondo oscuro (misma identidad, mejor legibilidad).

| Variable | HEX | Uso |
|----------|-----|-----|
| `--color-bg` | `#0F141C` | Fondo general oscuro. |
| `--color-surface` | `#1A2130` | Tarjetas. |
| `--color-surface-2` | `#232C3D` | Superficies secundarias. |
| `--color-text` | `#E7ECF3` | Texto principal claro. |
| `--color-text-muted` | `#9AA4B4` | Texto secundario. |
| `--color-border` | `#2C3648` | Bordes. |
| `--color-primary` (oscuro) | `#4C7BE0` | Azul aclarado para modo oscuro. |
| `--color-accent` (oscuro) | `#FFC933` | Amarillo aclarado para modo oscuro. |

---

## 4. Colores de estado (funcionales, fijos)

No los toca el picker. Se usan en formularios, avisos y el panel admin.

| Estado | Variable | HEX | Uso |
|--------|----------|-----|-----|
| Éxito | `--color-success` | `#1B873F` | "Guardado correctamente". |
| Error | `--color-danger` | `#D02F2F` | Errores, campos inválidos. |
| Advertencia | `--color-warning` | `#E08600` | Avisos importantes. |
| Información | `--color-info` | `#1D6FB8` | Mensajes informativos. |

Cada uno con una versión de fondo suave (10–15% opacidad) para banners.

---

## 5. Escala de grises (neutros)

Base del orden visual. Útil para textos, bordes, fondos y estados deshabilitados.

| Variable | HEX |
|----------|-----|
| `--gray-50` | `#F7F9FC` |
| `--gray-100` | `#EDF1F6` |
| `--gray-200` | `#D9DEE6` |
| `--gray-300` | `#BAC2CE` |
| `--gray-400` | `#95A0B0` |
| `--gray-500` | `#6B7688` |
| `--gray-600` | `#4D566650` → usar `#4D5666` |
| `--gray-700` | `#38404E` |
| `--gray-800` | `#252C38` |
| `--gray-900` | `#151A22` |

---

## 6. Tipografía

Dos fuentes, definidas como variables para cambiarlas desde un solo lugar.
Ambas gratuitas (Google Fonts). Voz de marca: **solemne, clara, anclada**
(institución pública andina — no tipografía SaaS genérica).

| Variable | Fuente | Uso |
|----------|--------|-----|
| `--font-heading` | **Source Serif 4** | Títulos y display. Gravitas académica. |
| `--font-body` | **Source Sans 3** | Cuerpo y UI. Legible, neutra, institucional. |

> Cambiables: si se prefiere otra combinación, reemplazar solo estas dos
> variables. No usar más de 2–3 fuentes en total. Evitar Inter, Poppins,
> Plus Jakarta Sans y otras caras saturadas de plantillas.

**Escala de tamaños (modular ~1.25; body fijo, títulos fluidos):**

| Token | Tamaño | Uso |
|-------|--------|-----|
| `--text-xs` | 0.75rem | Etiquetas, badges. |
| `--text-sm` | 0.875rem | Texto secundario, metadata. |
| `--text-base` | 1rem | Cuerpo. |
| `--text-lg` | 1.25rem | Lead / destacados. |
| `--text-xl` | 1.375rem | Subtítulos compactos. |
| `--text-2xl` | `clamp(1.375rem … 1.75rem)` | Títulos de sección. |
| `--text-3xl` | `clamp(1.75rem … 2.375rem)` | Títulos de página. |
| `--text-4xl` | `clamp(2rem … 2.875rem)` | Banner / hero. |
| `--text-5xl` | `clamp(2.25rem … 3.5rem)` | Display hero. |

Pesos: 400 (normal), 500 (medio), 600 (semibold), 700 (bold para títulos).
Interlineado: 1.6 cuerpo, 1.15 títulos, 1.05 display.
Tracking display: `-0.025em` (piso ≥ `-0.04em`). Medida de prosa: `65ch`.

**Roles tipográficos** (clases en `base.css`):
| Clase | Uso |
|-------|-----|
| `.text-display` / `.brand-mark` | Hero |
| `.heading-section` | Título de sección mayor |
| `.heading-block` | Título de bloque / grupo |
| `.heading-card` / `.heading-card-sm` | Títulos de tarjeta / ítem |
| `.text-lead` / `.text-meta` / `.note-example` | Lead, metadata, avisos de maqueta |
| `.label-kicker` | Label corto en mayúsculas (uso puntual) |
| `.page-banner h1` | Título de página interna (fluido) |

---

## 7. Bordes redondeados (radios)

Recomendación: redondeado **suave**, ni cuadrado (frío) ni excesivo (informal).
Transmite modernidad manteniendo seriedad institucional.

| Variable | Valor | Uso |
|----------|-------|-----|
| `--radius-sm` | 4px | Inputs, badges pequeños. |
| `--radius-md` | 8px | Botones, tarjetas (por defecto). |
| `--radius-lg` | 12px | Tarjetas grandes, modales. |
| `--radius-xl` | 16px | Contenedores destacados, hero. |
| `--radius-full` | 9999px | Avatares, chips, botón del chatbot. |

---

## 8. Sombras (elevación)

Sombras sutiles; nada pesado. Dan profundidad sin ensuciar.

| Variable | Uso |
|----------|-----|
| `--shadow-sm` | Tarjetas en reposo. Sombra muy tenue. |
| `--shadow-md` | Tarjetas en hover, dropdowns. |
| `--shadow-lg` | Modales, menús flotantes, widget del chatbot. |

En modo oscuro las sombras son menos visibles; apoyar la elevación también
con `--color-surface` más claro que el fondo.

---

## 9. Escala de espaciado

Espaciado consistente para que todo respire igual. Base de 4px.

| Token | Valor |
|-------|-------|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-12` | 48px |
| `--space-16` | 64px |
| `--space-20` | 80px |
| `--space-24` | 96px |
| `--space-section` | `clamp(3rem … 5.5rem)` | Padding vertical de sección |
| `--space-section-sm` | `clamp(2.25rem … 3.5rem)` | Banner / secciones compactas |
| `--space-section-lg` | `clamp(4rem … 7rem)` | Momentos de marca con más aire |

Usar múltiplos de la escala, no valores arbitrarios. Preferir clases
`.section-y` / `.section-y-sm` / `.section-y-lg` de `base.css` frente a
`py-14`/`py-16` idénticos en todas las secciones.

---

## 10. Breakpoints (responsive, mobile-first)

Diseñar primero móvil, luego escalar.

| Nombre | Ancho | Dispositivo |
|--------|-------|-------------|
| base | 0px | Móvil (por defecto) |
| sm | 640px | Móvil grande |
| md | 768px | Tablet |
| lg | 1024px | Escritorio |
| xl | 1280px | Escritorio grande |

---

## 11. El picker (recordatorio)

- Manipula **solo** `--color-primary` (azul) y `--color-accent` (amarillo).
- Muestra y exporta sus HEX para pasarlos a desarrollo.
- Colores de estado, grises, radios y sombras NO se tocan con el picker.
- Debe funcionar en tema claro y oscuro.