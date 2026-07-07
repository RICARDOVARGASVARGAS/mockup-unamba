# PLAN-ADMIN.md — Panel de Administración (`/admin`)

Plan de trabajo para maquetar el panel de administración (Parte 2 de
`docs/ESPECIFICACION.md`), cruzado con `docs/MODELO-DATOS.md`.

## Cómo usamos este documento

- Cada línea es un paso. Se marca `[x]` solo cuando confirmas que está bien.
- **Antes de empezar cada módulo**, planteo mis dudas/sugerencias de diseño
  en el chat (qué campos, qué vista, si conviene agrupar algo) antes de
  tocar código.
- Vamos **módulo por módulo** (no CRUD por CRUD suelto): cada módulo agrupa
  su entidad principal + catálogos chicos asociados (ej. Noticias incluye
  Categoria), porque así se maqueta con datos reales de ejemplo coherentes
  y no se fragmenta el trabajo.
- Cuando un módulo requiere una entidad que **no existe todavía** en
  `MODELO-DATOS.md`, el primer paso de ese módulo es anotarla ahí (mismo
  formato que el resto), antes de maquetar la pantalla.
- Orden sugerido por impacto: primero fundamentos (login, dashboard,
  componentes base), luego el núcleo de contenido, luego el resto.
- **Fases 3, 4.1, 4.2 y 4.3** se planearon como spec completa para
  Cursor (por eso tienen bloques de código extensos) — así se
  implementaron. **Desde 4.4 en adelante, Claude Code construye los
  archivos reales directamente** (ya no se usa Cursor); este documento
  vuelve a ser una bitácora liviana: qué se decidió y por qué, sin
  volcar el HTML completo cada vez (el código ya vive en el repo).

---

## Fase 0 — Preparación ✅

- [x] 0.1 Estructura de carpetas: `pages/admin/` (nueva subcarpeta,
      creada). `js/site-paths.js` actualizado para resolver rutas desde
      dos niveles de profundidad (`../../`).
- [x] 0.2 Convención de nombres: kebab-case — `<modulo>.html` (listado),
      `<modulo>-form.html` (crear/editar). `login.html` y
      `dashboard.html` son casos únicos, sin "-form".
- [x] 0.3 Catálogo de componentes confirmado:
      - **Web Components** (idénticos en todo el admin, en `/components`):
        `admin-sidebar.js`, `admin-topbar.js`, `admin-modal-confirm.js`,
        `admin-toast.js`.
      - **Patrones de markup** (Tailwind, se copian y ajustan por
        módulo, no son JS): tabla de listado, formulario, `StatusBadge`.
      - Alcance: una sola vista de rol, sin diferenciar admin/editor
        visualmente.

## Fase 1 — Login ✅

- [x] 1.1 Maquetado `pages/admin/login.html` + `js/admin-login.js`: dos
      columnas (branding + formulario), correo, contraseña con
      mostrar/ocultar, recordarme, "olvidé mi contraseña" (decorativo),
      alerta de error (oculta por defecto), toggle de tema (mismo patrón
      JS de `header.js`, vía evento `themechange`), botón "Ingresar"
      navega a `dashboard.html`. Verificado con Playwright headless:
      responsive (desktop/móvil), modo claro/oscuro, toggle de
      contraseña y navegación funcionan sin errores de consola.

## Fase 2 — Dashboard ✅

- [x] 2.1 Maquetado `pages/admin/dashboard.html`: 4 tarjetas resumen
      (Noticias publicadas, Eventos próximos, Mensajes nuevos, Ofertas
      activas), accesos rápidos (Nueva noticia/evento/comunicado →
      apuntan a `<modulo>-form.html`, aún no existen), actividad
      reciente (datos de ejemplo) y últimos mensajes de contacto. Sin
      gráficos, según lo acordado. Verificado con Playwright: desktop,
      móvil, claro/oscuro, menú de usuario, sin errores de consola.
- [x] 2.2 (adelantado desde Fase 3, ver nota abajo) `components/admin-sidebar.js`
      (`<admin-sidebar>`): navegación agrupada en 9 categorías + Dashboard,
      27 enlaces ya apuntando a su nombre de archivo final (ver lista
      completa dentro del componente), grupos colapsables
      (`<details>`), resalta el ítem activo, drawer overlay en móvil.
- [x] 2.3 (adelantado desde Fase 3) `components/admin-topbar.js`
      (`<admin-topbar>`): botón hamburguesa (dispara evento
      `admin:toggle-sidebar`), título de página vía atributo
      `page-title`, toggle de tema (mismo patrón `themechange`), menú de
      usuario de ejemplo (María Rojas / Administradora) con "Cerrar
      sesión" → `login.html`.

  **Nota técnica:** ambos componentes van envueltos en un IIFE — se
  cargan juntos en cada página del admin, y sin eso sus helpers internos
  (`ICONS`, `icon()`) chocan como redeclaraciones globales (bug real
  encontrado y corregido durante la verificación). Cualquier componente
  admin nuevo que se agregue a `/components` debe seguir el mismo
  criterio (IIFE) si define helpers con nombres genéricos.

## Fase 3 — Componentes base restantes del admin ✅

Sidebar y topbar ya se construyeron en la Fase 2 (todo módulo los
reutiliza tal cual, sin tocarlos). Decisiones ya tomadas para esta fase:
buscador/filtros de tabla funcionan de verdad con JS genérico,
"Eliminar" sí quita la fila del DOM, "Guardar" muestra un toast al
volver al listado (`?saved=1`), y los campos de texto enriquecido llevan
una barra de herramientas falsa (no funcional).

Todo el código de abajo es la especificación completa para Cursor — no
implementado aún por Claude Code en este repo.

### 3.1 `components/admin-modal-confirm.js` (`<admin-modal-confirm>`)

- [x] Una sola instancia por página de listado, colocada cerca de
      `</body>`. Escucha clics en cualquier `[data-delete-trigger]` del
      documento (no importa en qué fila esté). Al confirmar, quita la
      `<tr>` más cercana al trigger (con transición de opacidad) y
      dispara `admin:toast` con "Elemento eliminado". Cierra con
      Cancelar, clic fuera del panel, o tecla Escape.
- Trigger en cada fila: `<button data-delete-trigger data-delete-name="Título del ítem">`.

```js
/**
 * admin-modal-confirm.js — modal de confirmación de eliminación
 * (<admin-modal-confirm>).
 *
 * Una sola instancia por página, colocada cerca de </body> en cada
 * listado. Escucha clics en cualquier [data-delete-trigger] del
 * documento, sin importar en qué fila esté.
 *
 * Trigger: <button data-delete-trigger data-delete-name="Texto del ítem">
 * Al confirmar, quita la <tr> más cercana al trigger (con transición) y
 * dispara "admin:toast" para avisar que se eliminó. Sin backend: el
 * cambio es solo en el DOM, se resetea al recargar la página.
 */
(function () {
  const ICONS = {
    warning:
      '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />',
  };

  class AdminModalConfirm extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div data-backdrop class="fixed inset-0 z-50 hidden items-center justify-center bg-gray-900/50 p-4">
          <div data-panel role="alertdialog" aria-modal="true" aria-labelledby="modal-confirm-title" class="w-full max-w-sm rounded-lg bg-surface p-6 shadow-lg">
            <span class="flex h-11 w-11 items-center justify-center rounded-full bg-danger-bg text-danger">
              <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">${ICONS.warning}</svg>
            </span>
            <h2 id="modal-confirm-title" class="mt-4 font-heading text-lg font-semibold text-text">Eliminar elemento</h2>
            <p data-message class="mt-2 text-sm text-text-muted"></p>
            <div class="mt-6 flex justify-end gap-3">
              <button type="button" data-cancel class="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text transition hover:bg-surface-2">Cancelar</button>
              <button type="button" data-confirm class="rounded-md bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">Eliminar</button>
            </div>
          </div>
        </div>
      `;
      this.pendingRow = null;
      this.init();
    }

    init() {
      const backdrop = this.querySelector("[data-backdrop]");
      const message = this.querySelector("[data-message]");

      const open = (name, row) => {
        this.pendingRow = row || null;
        message.textContent = `¿Eliminar "${name}"? Esta acción no se puede deshacer.`;
        backdrop.classList.remove("hidden");
        backdrop.classList.add("flex");
      };

      const close = () => {
        backdrop.classList.add("hidden");
        backdrop.classList.remove("flex");
        this.pendingRow = null;
      };

      document.addEventListener("click", (event) => {
        const trigger = event.target.closest("[data-delete-trigger]");
        if (!trigger) return;
        open(trigger.dataset.deleteName || "este elemento", trigger.closest("tr"));
      });

      this.querySelector("[data-cancel]").addEventListener("click", close);
      backdrop.addEventListener("click", (event) => {
        if (event.target === backdrop) close();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !backdrop.classList.contains("hidden")) close();
      });

      this.querySelector("[data-confirm]").addEventListener("click", () => {
        if (this.pendingRow) {
          const row = this.pendingRow;
          row.classList.add("opacity-0", "transition", "duration-200");
          setTimeout(() => row.remove(), 200);
        }
        close();
        document.dispatchEvent(
          new CustomEvent("admin:toast", { detail: { message: "Elemento eliminado", variant: "success" } })
        );
      });
    }
  }

  customElements.define("admin-modal-confirm", AdminModalConfirm);
})();
```

### 3.2 `components/admin-toast.js` (`<admin-toast>`)

- [x] Una sola instancia por página (listados Y formularios). Escucha
      `admin:toast` en `document` (`detail: { message, variant }`).
      Auto-cierra a los 4s o con botón X. Por ahora solo se usa la
      variante `success` (Guardado/Eliminado).

```js
/**
 * admin-toast.js — notificación flotante (<admin-toast>).
 *
 * Una sola instancia por página. Escucha "admin:toast" en `document`
 * (detail: { message, variant }). variant: "success" (por ahora el
 * único usado — Guardado/Eliminado). Auto-cierra a los 4s o con el
 * botón X.
 */
(function () {
  const ICONS = {
    check: '<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />',
    close: '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />',
  };

  class AdminToast extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div class="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4 sm:justify-end sm:right-6 sm:px-0">
          <div data-toast class="pointer-events-auto hidden max-w-sm items-center gap-3 rounded-lg border border-success/30 bg-surface px-4 py-3 shadow-lg">
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-bg text-success">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${ICONS.check}</svg>
            </span>
            <p data-toast-message class="text-sm font-medium text-text"></p>
            <button type="button" data-toast-close aria-label="Cerrar" class="ml-2 text-text-muted transition hover:text-text">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">${ICONS.close}</svg>
            </button>
          </div>
        </div>
      `;
      this.timer = null;
      this.init();
    }

    init() {
      const toast = this.querySelector("[data-toast]");
      const message = this.querySelector("[data-toast-message]");

      const show = (text) => {
        message.textContent = text;
        toast.classList.remove("hidden");
        toast.classList.add("flex");
        clearTimeout(this.timer);
        this.timer = setTimeout(hide, 4000);
      };

      const hide = () => {
        toast.classList.add("hidden");
        toast.classList.remove("flex");
      };

      document.addEventListener("admin:toast", (event) => show(event.detail.message));
      this.querySelector("[data-toast-close]").addEventListener("click", hide);
    }
  }

  customElements.define("admin-toast", AdminToast);
})();
```

### 3.3 `js/admin-common.js` (nuevo — compartido por TODO `/admin`)

- [x] Un solo script, incluido una vez en cada página de `/admin`,
      justo después de `theme.js` (ver orden exacto de `<script>` en
      los ejemplos de 3.5 y 3.6 — no importa que se cargue antes que
      `admin-toast.js`: todos son `<script src>` sin `defer`, así que
      ya terminaron de ejecutarse cuando dispara `DOMContentLoaded`).
      Reúne 6 comportamientos genéricos para no repetir JS en cada uno
      de los ~20 módulos (el 6º, campos condicionales, se agregó en la
      Fase 4.2 — ver nota ahí).
- **Regla importante para las claves de filtro**: `data-table-filter="categoria"`
  debe ser una sola palabra en minúscula, sin guiones (el script lee
  `row.dataset[key]` directo — con guiones el `dataset` de JS los
  convierte a camelCase y la comparación fallaría). Ej. usar
  `tipooferta`, no `tipo-oferta`.

```js
/**
 * admin-common.js — comportamientos compartidos por TODAS las páginas
 * de /admin (listados y formularios). Se incluye una vez por página,
 * después de admin-toast.js. Evita repetir el mismo JS en cada uno de
 * los ~20 módulos.
 *
 * Comportamientos:
 * 1) Filtro de tabla — [data-admin-table]
 * 2) Toast al volver de guardar — ?saved=1 en la URL
 * 3) Submit de formulario — [data-admin-form]
 * 4) Toggle de estado (pills) — [data-status-group]
 * 5) Preview de archivo subido — [data-upload-trigger] (imagen con
 *    [data-upload-preview], o PDF con [data-upload-filename] — ver
 *    nota en initUploadPreview, variante PDF agregada en Fase 4.3)
 * 6) Campos condicionales — [data-condition-source] / [data-condition-show]
 *    (agregado en Fase 4.2, para Modalidad → Lugar/Enlace virtual de
 *    Eventos, pero genérico para cualquier módulo futuro)
 */

document.addEventListener("DOMContentLoaded", () => {
  initTableFilters();
  initSavedToast();
  initFormSubmit();
  initStatusToggle();
  initUploadPreview();
  initConditionalFields();
});

function initTableFilters() {
  document.querySelectorAll("[data-admin-table]").forEach((table) => {
    const searchInput = table.querySelector("[data-table-search]");
    const filterSelects = table.querySelectorAll("[data-table-filter]");
    const emptyRow = table.querySelector("[data-empty-row]");

    function apply() {
      const query = (searchInput?.value || "").trim().toLowerCase();
      const activeFilters = Array.from(filterSelects)
        .map((select) => ({ key: select.dataset.tableFilter, value: select.value }))
        .filter((f) => f.value);

      let visibleCount = 0;
      table.querySelectorAll("tbody tr[data-row]").forEach((row) => {
        const matchesSearch = !query || (row.dataset.search || "").includes(query);
        const matchesFilters = activeFilters.every((f) => row.dataset[f.key] === f.value);
        const visible = matchesSearch && matchesFilters;
        row.classList.toggle("hidden", !visible);
        if (visible) visibleCount++;
      });

      if (emptyRow) emptyRow.classList.toggle("hidden", visibleCount > 0);
    }

    searchInput?.addEventListener("input", apply);
    filterSelects.forEach((select) => select.addEventListener("change", apply));
  });
}

function initSavedToast() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("saved") !== "1") return;

  document.dispatchEvent(
    new CustomEvent("admin:toast", { detail: { message: "Guardado correctamente", variant: "success" } })
  );
  params.delete("saved");
  const query = params.toString();
  window.history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : ""));
}

function initFormSubmit() {
  document.querySelectorAll("[data-admin-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const redirect = form.dataset.redirect || "dashboard.html";
      window.location.href = `${redirect}?saved=1`;
    });
  });
}

function initStatusToggle() {
  // Cada botón puede definir su propio color activo con
  // data-status-active-class (ej. "bg-danger text-white" para
  // "Cancelado"). Si no lo define, usa "bg-primary text-onPrimary" por
  // defecto — así los formularios de 2 estados (Noticias) no necesitan
  // declararlo explícitamente, aunque en Fase 3 sí quedó explícito.
  document.querySelectorAll("[data-status-group]").forEach((group) => {
    const options = group.querySelectorAll("[data-status-option]");

    const activate = (target) => {
      options.forEach((btn) => {
        const activeClasses = (btn.dataset.statusActiveClass || "bg-primary text-onPrimary").split(" ");
        btn.classList.remove(...activeClasses);
        btn.classList.add("text-text-muted");
      });
      const activeClasses = (target.dataset.statusActiveClass || "bg-primary text-onPrimary").split(" ");
      target.classList.remove("text-text-muted");
      target.classList.add(...activeClasses);
    };

    options.forEach((btn) => btn.addEventListener("click", () => activate(btn)));
  });
}

function initConditionalFields() {
  // <select data-condition-source="modalidad"> controla cualquier
  // elemento con data-condition-show="modalidad:presencial,hibrido"
  // (oculta/muestra según si el value actual está en esa lista). Al
  // volverse visible, dispara "admin:field-shown" (bubbles) — lo usa,
  // por ejemplo, el mapa Leaflet de Eventos para llamar
  // map.invalidateSize() cuando el contenedor deja de estar oculto.
  document.querySelectorAll("[data-condition-source]").forEach((source) => {
    const key = source.dataset.conditionSource;
    const targets = document.querySelectorAll(`[data-condition-show^="${key}:"]`);

    function apply() {
      targets.forEach((el) => {
        const allowed = el.dataset.conditionShow.split(":")[1].split(",");
        const wasHidden = el.classList.contains("hidden");
        const shouldShow = allowed.includes(source.value);
        el.classList.toggle("hidden", !shouldShow);
        if (shouldShow && wasHidden) {
          el.dispatchEvent(new CustomEvent("admin:field-shown", { bubbles: true }));
        }
      });
    }

    source.addEventListener("change", apply);
    apply();
  });
}

function initUploadPreview() {
  // Dos variantes en el mismo wrapper [data-upload], según qué target
  // exista dentro: [data-upload-preview] (una <img>, para foto de
  // Noticia/Evento) muestra la imagen real; [data-upload-filename]
  // (cualquier elemento de texto, para el PDF de Comunicado/Documento)
  // solo actualiza el nombre de archivo. Un mismo campo podría, en
  // teoría, tener ambos, pero ningún módulo de este mockup lo necesita.
  document.querySelectorAll("[data-upload-trigger]").forEach((trigger) => {
    const wrapper = trigger.closest("[data-upload]");
    const input = wrapper?.querySelector("[data-upload-input]");
    if (!input) return;

    trigger.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) return;

      const preview = wrapper.querySelector("[data-upload-preview]");
      if (preview) {
        preview.src = URL.createObjectURL(file);
        preview.classList.remove("hidden");
        wrapper.querySelector("[data-upload-placeholder]")?.classList.add("hidden");
      }

      const filenameEl = wrapper.querySelector("[data-upload-filename]");
      if (filenameEl) filenameEl.textContent = file.name;
    });
  });
}
```

### 3.4 `StatusBadge` y tarjetas del admin — clases nuevas en `css/base.css`

- [x] No son componentes JS, son clases CSS que se aplican por nombre
      en el markup (`<span class="badge badge-success">Publicado</span>`,
      `<div class="admin-card p-6">`).
- [x] `admin-canvas` / `admin-card` / `admin-toolbar` son el **refresh
      visual** aplicado retroactivamente a Login, Dashboard, y los 3
      módulos ya construidos (Noticias, Eventos, Comunicados) — ver
      nota abajo. En modo claro, `--color-bg` y `--color-surface` casi
      no contrastaban entre sí, así que se invirtió la relación: el
      lienzo detrás del contenido usa `surface-2` (gris visible) y las
      tarjetas usan `bg` (blanco puro) + sombra, para que floten sobre
      el lienzo — el patrón estándar de dashboards modernos.

```css
/* Añadir a css/base.css, junto a los demás estilos base */
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-full);
  padding: 2px 10px;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  white-space: nowrap;
}
.badge-success { background: var(--color-success-bg); color: var(--color-success); }
.badge-warning { background: var(--color-warning-bg); color: var(--color-warning); }
.badge-danger { background: var(--color-danger-bg); color: var(--color-danger); }
.badge-info { background: var(--color-info-bg); color: var(--color-info); }
.badge-neutral { background: var(--color-surface-2); color: var(--color-text-muted); }

/* Lienzo y tarjetas del panel admin. Sin padding propio: se compone
   con utilidades de Tailwind (p-5, p-6, etc.) según el elemento. */
.admin-canvas {
  background: var(--color-surface-2);
}
.admin-card {
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  box-shadow: var(--shadow-sm);
}
.admin-toolbar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-2);
  padding: 0.5rem 0.625rem;
}
[data-admin-table] tbody tr:hover {
  background: var(--color-surface-2);
}
```

**Uso:** `admin-canvas` va en el wrapper `<div class="... flex min-h-screen flex-col lg:pl-72">`
de cada página (ya reemplazado en los ejemplos de este documento).
`admin-card` reemplaza cualquier `rounded-lg border border-border bg-surface`
(con o sin padding, con o sin clases extra — se compone bien con lo que
ya estaba ahí). `admin-toolbar` reemplaza la barra de la barra de
herramientas falsa de texto enriquecido. Ya aplicado en todos los
bloques de código de este documento (Fase 3, 4.2, 4.3) y en los 6
archivos reales ya construidos por Cursor + `dashboard.html` (`login.html`
no lo necesita — tiene su propio layout de dos columnas, sin sidebar/tabla/tarjetas).
**Todo módulo nuevo de aquí en adelante ya nace usando estas clases —
no el patrón viejo.**

Mapeo de estados reales (`docs/MODELO-DATOS.md`) → clase:

| Estado | Clase |
|---|---|
| publicado, activo, vigente, respondido | `badge-success` |
| borrador, inactivo, leído, concluido/concluida, vencida, cerrada, retirado | `badge-neutral` |
| licencia | `badge-warning` |
| cancelado | `badge-danger` |
| nuevo, en curso | `badge-info` |

**"Programado" (decisión, no cambia `MODELO-DATOS.md`):** evaluamos
agregar un estado `programado` guardado en base de datos, pero
requeriría un job/cron para pasar de programado→publicado solo — sobre-
ingeniería para este proyecto. En vez de eso: `estado` se queda en
`borrador`/`publicado` en todos los módulos (Evento conserva sus 3
estados reales: borrador/publicado/cancelado, porque cancelar sí es una
acción real, no una fecha). En el **admin únicamente**, si
`estado=publicado` y `fecha_publicacion` es futura, el listado muestra
`badge-info` con texto "Programado" en vez de "Publicado" — es una
lectura de un campo que ya existe (mismo criterio que "Cerrada" en
Comunicados), cero columnas nuevas, cero jobs. Aplica a Noticias,
Documentos, Maestrías y cualquier módulo con `fecha_publicacion`; no se
reescribió el ejemplo de Noticias porque su fecha de ejemplo (05 jul.
2026) ya pasó y no dispara la condición — el próximo módulo con este
campo debe incluir esta regla desde su primera versión.

**Editor de texto enriquecido (para el sistema real, no este mockup):**
investigado 2026 — recomendado **TipTap** (ProseMirror) sobre Lexical
para el futuro CMS en React/Next.js: 100+ extensiones ya listas
(imágenes, links, tablas, subida de archivos), mejor documentación y
DX, es el estándar de facto para paneles de administración/CMS.
Lexical (Meta) es más liviano y de más bajo nivel — solo se justifica
si el editor fuera crítico en performance, no es el caso aquí. La
barra de herramientas falsa del mockup (sección 3.6) representa
visualmente dónde iría TipTap en el sistema real.

### 3.5 Patrón de listado (markup — se copia y ajusta por módulo)

- [x] Estructura fija: sidebar + topbar (igual que Dashboard) → header
      de página (título + botón "Nuevo X") → toolbar (buscador +
      selects de filtro) → tabla (`data-admin-table`) → paginación
      visual (no funcional, ver nota). Cada módulo trae 6–8 filas de
      ejemplo con datos reales de `docs/ESPECIFICACION.md`/mockup
      existente, nunca contenido inventado sin marcar.
- La paginación es solo visual (botones "Anterior/Siguiente" y números
  de página presentes, sin lógica real) — con 6–8 filas de ejemplo por
  módulo no hace falta paginar de verdad para la demo.

Ejemplo completo con el módulo **Noticias** (Fase 4.1) — todos los
demás módulos siguen exactamente este esqueleto cambiando:
`page-title`, columnas de la tabla, claves de `data-table-filter`,
opciones de los `<select>`, y los datos de ejemplo.

```html
<!-- pages/admin/noticias.html -->
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Noticias — Panel de Administración | Facultad de Administración UNAMBA (Mockup)</title>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap"
      rel="stylesheet"
    />

    <link rel="stylesheet" href="../../css/tokens.css" />
    <link rel="stylesheet" href="../../css/base.css" />

    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <script src="../../js/tailwind-config.js"></script>
  </head>
  <body class="w-full bg-bg text-text font-body antialiased">
    <admin-sidebar></admin-sidebar>

    <div class="admin-canvas flex min-h-screen flex-col lg:pl-72">
      <admin-topbar page-title="Noticias"></admin-topbar>

      <main class="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="font-heading text-xl font-bold text-text">Noticias</h2>
            <p class="text-sm text-text-muted">Gestiona las noticias publicadas en el sitio.</p>
          </div>
          <a href="noticias-form.html" class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-onPrimary transition hover:bg-primary-dark">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva noticia
          </a>
        </div>

        <div class="flex flex-col gap-3 admin-card p-4 sm:flex-row sm:items-center">
          <div class="relative flex-1">
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input type="search" data-table-search placeholder="Buscar por título..." class="h-10 w-full rounded-md border border-border bg-bg pl-9 pr-3 text-sm text-text focus:border-primary focus:outline-none" />
          </div>
          <select data-table-filter="categoria" class="h-10 rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none">
            <option value="">Todas las categorías</option>
            <option value="institucional">Institucional</option>
            <option value="academico">Académico</option>
            <option value="convenios">Convenios</option>
            <option value="comunidad">Comunidad</option>
          </select>
          <select data-table-filter="estado" class="h-10 rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none">
            <option value="">Todos los estados</option>
            <option value="publicado">Publicado</option>
            <option value="borrador">Borrador</option>
          </select>
        </div>

        <div class="overflow-hidden admin-card">
          <div class="overflow-x-auto">
            <table data-admin-table class="w-full text-left text-sm">
              <thead class="border-b border-border bg-surface-2 text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th class="px-4 py-3 font-semibold">Título</th>
                  <th class="px-4 py-3 font-semibold">Categoría</th>
                  <th class="px-4 py-3 font-semibold">Fecha</th>
                  <th class="px-4 py-3 font-semibold">Estado</th>
                  <th class="px-4 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr data-row data-search="semana cultural 2026" data-categoria="institucional" data-estado="publicado">
                  <td class="px-4 py-3 font-medium text-text">Semana Cultural 2026</td>
                  <td class="px-4 py-3 text-text-muted">Institucional</td>
                  <td class="px-4 py-3 text-text-muted">05 jul. 2026</td>
                  <td class="px-4 py-3"><span class="badge badge-success">Publicado</span></td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <a href="noticias-form.html" aria-label="Editar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-2 hover:text-text">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                      </a>
                      <button type="button" data-delete-trigger data-delete-name="Semana Cultural 2026" aria-label="Eliminar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-danger-bg hover:text-danger">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <!-- ...5-7 filas de ejemplo más, mismo patrón... -->
                <tr data-empty-row class="hidden">
                  <td colspan="5" class="px-4 py-10 text-center text-sm text-text-muted">No se encontraron resultados.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex items-center justify-between text-sm text-text-muted">
          <p>Mostrando 1–8 de 24</p>
          <div class="flex items-center gap-1">
            <button class="rounded-md border border-border px-3 py-1.5 hover:bg-surface-2">Anterior</button>
            <button class="rounded-md bg-primary px-3 py-1.5 text-onPrimary">1</button>
            <button class="rounded-md border border-border px-3 py-1.5 hover:bg-surface-2">2</button>
            <button class="rounded-md border border-border px-3 py-1.5 hover:bg-surface-2">3</button>
            <button class="rounded-md border border-border px-3 py-1.5 hover:bg-surface-2">Siguiente</button>
          </div>
        </div>
      </main>
    </div>

    <admin-modal-confirm></admin-modal-confirm>
    <admin-toast></admin-toast>

    <script src="../../js/theme.js"></script>
    <script src="../../js/admin-common.js"></script>
    <script src="../../components/admin-sidebar.js"></script>
    <script src="../../components/admin-topbar.js"></script>
    <script src="../../components/admin-modal-confirm.js"></script>
    <script src="../../components/admin-toast.js"></script>
  </body>
</html>
```

### 3.6 Patrón de formulario (markup — se copia y ajusta por módulo)

- [x] Estructura fija: sidebar + topbar → enlace "Volver a X" → título
      → `<form data-admin-form data-redirect="<modulo>.html">` con
      secciones en tarjetas (Información general → Imagen/Archivo →
      Contenido → Publicación) → barra de acciones (Cancelar/Guardar).
- **Un solo archivo `<modulo>-form.html` sirve para crear y editar**:
  se muestra precargado con datos de ejemplo (modo "editar", más
  informativo visualmente que un formulario vacío). Tanto "Nueva
  noticia" como "Editar" de cada fila del listado apuntan al mismo
  archivo.
- El campo de texto enriquecido usa la barra de herramientas falsa
  (decorativa, botones con `tabindex="-1"` para que no interrumpan la
  navegación por teclado).
- El uploader usa `data-upload` + `data-upload-trigger` +
  `data-upload-input` (input file oculto) + `data-upload-preview` (img)
  + `data-upload-placeholder` — el preview real lo resuelve
  `admin-common.js` (`initUploadPreview`).
- **Intencional, no un descuido:** `<admin-topbar page-title="Noticias">`
  (el módulo) y el `<h2>` dentro de la página ("Editar noticia", la
  acción específica) muestran textos distintos a propósito — el topbar
  siempre lleva el nombre del módulo tal como aparece en el sidebar, el
  `<h2>` lleva la acción concreta de esa pantalla.

Ejemplo completo con **Noticias** (mismo criterio que el listado — el
resto de módulos copian este esqueleto cambiando secciones/campos):

```html
<!-- pages/admin/noticias-form.html -->
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Editar noticia — Panel de Administración | Facultad de Administración UNAMBA (Mockup)</title>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap"
      rel="stylesheet"
    />

    <link rel="stylesheet" href="../../css/tokens.css" />
    <link rel="stylesheet" href="../../css/base.css" />

    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <script src="../../js/tailwind-config.js"></script>
  </head>
  <body class="w-full bg-bg text-text font-body antialiased">
    <admin-sidebar></admin-sidebar>

    <div class="admin-canvas flex min-h-screen flex-col lg:pl-72">
      <admin-topbar page-title="Noticias"></admin-topbar>

      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <div class="mx-auto max-w-3xl">
          <a href="noticias.html" class="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition hover:text-text">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Volver a Noticias
          </a>
          <h2 class="mt-2 font-heading text-xl font-bold text-text">Editar noticia</h2>

          <form data-admin-form data-redirect="noticias.html" class="mt-6 space-y-6">
            <!-- Información general -->
            <div class="admin-card p-5 sm:p-6">
              <h3 class="font-heading text-base font-semibold text-text">Información general</h3>
              <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <label for="noticia-titulo" class="block text-sm font-medium text-text">Título</label>
                  <input id="noticia-titulo" type="text" value="Semana Cultural 2026" class="mt-1.5 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label for="noticia-categoria" class="block text-sm font-medium text-text">Categoría</label>
                  <select id="noticia-categoria" class="mt-1.5 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none">
                    <option>Institucional</option>
                    <option>Académico</option>
                    <option>Convenios</option>
                    <option>Comunidad</option>
                  </select>
                </div>
                <div>
                  <label for="noticia-fecha" class="block text-sm font-medium text-text">Fecha de publicación</label>
                  <input id="noticia-fecha" type="date" value="2026-07-05" class="mt-1.5 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none" />
                </div>
              </div>
            </div>

            <!-- Imagen destacada -->
            <div class="admin-card p-5 sm:p-6" data-upload>
              <h3 class="font-heading text-base font-semibold text-text">Imagen destacada</h3>
              <div class="mt-4 flex flex-col gap-4 sm:flex-row">
                <div class="relative flex h-32 w-full max-w-[220px] shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-bg text-text-muted">
                  <span data-upload-placeholder class="text-xs">Sin imagen</span>
                  <img data-upload-preview class="hidden h-full w-full object-cover" alt="" />
                </div>
                <div class="flex-1 space-y-3">
                  <input type="file" accept="image/*" data-upload-input class="hidden" />
                  <button type="button" data-upload-trigger class="rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition hover:bg-surface-2">Subir imagen</button>
                  <p class="text-xs text-text-muted">JPG o PNG, mínimo 1200px de ancho, relación 16:9.</p>
                  <div>
                    <label for="noticia-alt" class="block text-sm font-medium text-text">Texto alternativo (alt)</label>
                    <input id="noticia-alt" type="text" placeholder="Describe la imagen para accesibilidad" class="mt-1.5 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Contenido -->
            <div class="admin-card p-5 sm:p-6">
              <h3 class="font-heading text-base font-semibold text-text">Contenido</h3>
              <div class="mt-4">
                <label class="block text-sm font-medium text-text">Resumen</label>
                <div class="mt-1.5 overflow-hidden rounded-md border border-border bg-bg">
                  <div class="admin-toolbar">
                    <button type="button" tabindex="-1" class="rounded px-2 py-1 text-sm font-bold text-text-muted hover:bg-surface">B</button>
                    <button type="button" tabindex="-1" class="rounded px-2 py-1 text-sm italic text-text-muted hover:bg-surface">I</button>
                    <span class="mx-1 h-4 w-px bg-border"></span>
                    <button type="button" tabindex="-1" aria-label="Lista" class="rounded p-1.5 text-text-muted hover:bg-surface">
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                    </button>
                    <button type="button" tabindex="-1" aria-label="Enlace" class="rounded p-1.5 text-text-muted hover:bg-surface">
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>
                    </button>
                  </div>
                  <textarea rows="3" class="w-full resize-y border-0 bg-transparent px-3 py-2 text-sm text-text focus:outline-none" placeholder="Resumen breve para la tarjeta...">La Facultad de Administración invita a toda la comunidad universitaria a participar de la Semana Cultural 2026...</textarea>
                </div>
              </div>
              <div class="mt-4">
                <label class="block text-sm font-medium text-text">Cuerpo</label>
                <div class="mt-1.5 overflow-hidden rounded-md border border-border bg-bg">
                  <div class="admin-toolbar">
                    <button type="button" tabindex="-1" class="rounded px-2 py-1 text-sm font-bold text-text-muted hover:bg-surface">B</button>
                    <button type="button" tabindex="-1" class="rounded px-2 py-1 text-sm italic text-text-muted hover:bg-surface">I</button>
                    <span class="mx-1 h-4 w-px bg-border"></span>
                    <button type="button" tabindex="-1" aria-label="Lista" class="rounded p-1.5 text-text-muted hover:bg-surface">
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                    </button>
                    <button type="button" tabindex="-1" aria-label="Enlace" class="rounded p-1.5 text-text-muted hover:bg-surface">
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>
                    </button>
                    <button type="button" tabindex="-1" aria-label="Imagen" class="rounded p-1.5 text-text-muted hover:bg-surface">
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 12V6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75V12M3 12v6.75A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V12M3 12h18" /></svg>
                    </button>
                  </div>
                  <textarea rows="8" class="w-full resize-y border-0 bg-transparent px-3 py-2 text-sm text-text focus:outline-none" placeholder="Contenido completo de la noticia..."></textarea>
                </div>
              </div>
            </div>

            <!-- Publicación -->
            <div class="admin-card p-5 sm:p-6">
              <h3 class="font-heading text-base font-semibold text-text">Publicación</h3>
              <div class="mt-4" data-status-group>
                <span class="block text-sm font-medium text-text">Estado</span>
                <div class="mt-2 inline-flex rounded-md border border-border p-1">
                  <button type="button" data-status-option data-status-active-class="bg-primary text-onPrimary" class="rounded px-4 py-1.5 text-sm font-medium text-text-muted transition">Borrador</button>
                  <button type="button" data-status-option data-status-active-class="bg-primary text-onPrimary" class="rounded bg-primary px-4 py-1.5 text-sm font-medium text-onPrimary transition">Publicado</button>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3">
              <a href="noticias.html" class="rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-text transition hover:bg-surface-2">Cancelar</a>
              <button type="submit" class="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-primary-dark transition hover:bg-accent-dark">Guardar</button>
            </div>
          </form>
        </div>
      </main>
    </div>

    <admin-toast></admin-toast>

    <script src="../../js/theme.js"></script>
    <script src="../../js/admin-common.js"></script>
    <script src="../../components/admin-sidebar.js"></script>
    <script src="../../components/admin-topbar.js"></script>
    <script src="../../components/admin-toast.js"></script>
  </body>
</html>
```

### Checklist de esta fase

- [x] Crear `components/admin-modal-confirm.js` con el código de la
      sección 3.1.
- [x] Crear `components/admin-toast.js` con el código de la sección 3.2.
- [x] Crear `js/admin-common.js` con el código de la sección 3.3.
- [x] Agregar las 5 clases `.badge*` a `css/base.css` (sección 3.4).
- [x] Crear `pages/admin/noticias.html` siguiendo el ejemplo completo de
      la sección 3.5 tal cual (no solo como referencia).
- [x] Crear `pages/admin/noticias-form.html` siguiendo el ejemplo
      completo de la sección 3.6 tal cual (no solo como referencia).

## Fase 4 — Módulos de contenido (núcleo, mayor impacto en demo)

- [x] 4.1 **Noticias** — listado + formulario. Entidades: `Noticia`,
      `Categoria`. **Ya especificado completo en la Fase 3 (3.5 y 3.6)**
      — `noticias.html` y `noticias-form.html` son los archivos de
      ejemplo de esa sección, úsalos tal cual, no son solo ilustrativos.
### 4.2 Eventos ✅

Entidades: `Evento`, `Lugar`, `Categoria` (comparte catálogo con
Noticias, más la opción "Servicios" — exclusiva de Eventos según
`docs/MODELO-DATOS.md`).

**Requiere el ajuste retroactivo a `js/admin-common.js` de la Fase 3**
(`initStatusToggle` generalizado + `initConditionalFields` nuevo — ver
sección 3.3, ya actualizada). Antes de programar Eventos, `admin-common.js`
debe llevar esos dos cambios.

- [x] Listado (`pages/admin/eventos.html`): mismo esqueleto de la
      sección 3.5, con 3 filtros (Categoría, Modalidad, Estado) además
      del buscador. Columnas: Título, Categoría, Modalidad, Fecha
      inicio, Lugar, Estado, Acciones. Fila con `estado=cancelado` NO
      se oculta — se muestra atenuada (`opacity-60` en la `<tr>`) con
      badge rojo "Cancelado", tal como indica `MODELO-DATOS.md`.
      Datos de ejemplo reutilizados de `pages/eventos.html` (mismo
      mockup, no contenido nuevo inventado): Semana de la
      Administración 2026, Charla: Tendencias en Gestión Pública,
      Webinar: Trámites y servicios virtuales para estudiantes, Feria
      Laboral y de Prácticas, Conversatorio con egresados destacados
      (cancelado), Aniversario de la Facultad (borrador).
- [x] Formulario (`pages/admin/eventos-form.html`): mismo esqueleto de
      la sección 3.6, con estas diferencias sobre el patrón de
      Noticias:
      - Un solo campo de texto enriquecido ("Descripción"), no
        resumen+cuerpo — `Evento` no tiene campo `resumen`.
      - Sección nueva "Modalidad y ubicación": select Modalidad
        (`data-condition-source="modalidad"`) → Lugar + mapa Leaflet
        (visibles si modalidad ≠ virtual) y Enlace virtual (visible si
        modalidad ≠ presencial), usando `data-condition-show`.
      - Sección nueva "Inscripción": URL de inscripción (opcional),
        Cupo (número, opcional).
      - Publicación: pills de 3 estados (Borrador/Publicado/Cancelado),
        "Cancelado" en rojo vía `data-status-active-class="bg-danger text-white"`.
      - Imagen destacada explícitamente marcada "(opcional)" en su
        `<label>` — a diferencia de Noticias, en `Evento` el campo
        `foto_portada_id` sí es opcional.
      - Dato de ejemplo: "Semana de la Administración 2026" (mismo
        evento que ya tiene su página de detalle pública en
        `pages/evento-detalle.html`), modalidad Híbrido por defecto —
        así Lugar/mapa y Enlace virtual se ven ambos con datos al
        cargar la página, sin necesidad de tocar el select primero.
- [x] Mapa Leaflet: mismo patrón que `pages/evento-detalle.html` (CDN
      `unpkg.com/leaflet@1.9.4`, tiles de OpenStreetMap, coordenadas
      del campus UNAMBA en Tamburco, Abancay). A diferencia del sitio
      público (mapa fijo de un solo evento), aquí el mapa reacciona al
      `<select>` de Lugar: cambiar el lugar mueve el marcador. Catálogo
      de 3 Lugares de ejemplo con coordenadas en `data-lat`/`data-lng`
      de cada `<option>` — no hay tabla `Lugar` con gestión propia en
      este mockup (ver nota de alcance más abajo).
- [x] **Manejo del bug de Leaflet en contenedor oculto**: si el mapa se
      inicializara mientras su contenedor está oculto (`modalidad` =
      virtual al cargar), se renderiza roto. Se resuelve así: el script
      de esta página solo llama `L.map(...)` si el contenedor ya es
      visible al cargar; si no, espera el evento `admin:field-shown`
      (que dispara `initConditionalFields` de `admin-common.js` al
      des-ocultarlo) para inicializar recién en ese momento. Si el mapa
      ya existe y el campo se vuelve a ocultar y mostrar, se llama
      `map.invalidateSize()` en vez de crear el mapa de nuevo.

**Nota de alcance:** `Lugar` no tiene su propio ítem en el sidebar ni
pantalla de gestión en este mockup — es un catálogo chico reutilizado
solo por Eventos, con 3 opciones de ejemplo hardcodeadas en el
`<select>` del formulario (mismo criterio que Categoría, TipoDocumento,
etc. — catálogos chicos no listados aparte, ver Fase 0.3). Si el
sistema real necesita administrar Lugares con más frecuencia, sería un
módulo propio a futuro, fuera de alcance de este mockup.

```html
<!-- pages/admin/eventos.html -->
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Eventos — Panel de Administración | Facultad de Administración UNAMBA (Mockup)</title>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap"
      rel="stylesheet"
    />

    <link rel="stylesheet" href="../../css/tokens.css" />
    <link rel="stylesheet" href="../../css/base.css" />

    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <script src="../../js/tailwind-config.js"></script>
  </head>
  <body class="w-full bg-bg text-text font-body antialiased">
    <admin-sidebar></admin-sidebar>

    <div class="admin-canvas flex min-h-screen flex-col lg:pl-72">
      <admin-topbar page-title="Eventos"></admin-topbar>

      <main class="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="font-heading text-xl font-bold text-text">Eventos</h2>
            <p class="text-sm text-text-muted">Gestiona los eventos y actividades de la facultad.</p>
          </div>
          <a href="eventos-form.html" class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-onPrimary transition hover:bg-primary-dark">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo evento
          </a>
        </div>

        <div class="flex flex-col gap-3 admin-card p-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div class="relative flex-1 sm:min-w-[200px]">
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input type="search" data-table-search placeholder="Buscar por título..." class="h-10 w-full rounded-md border border-border bg-bg pl-9 pr-3 text-sm text-text focus:border-primary focus:outline-none" />
          </div>
          <select data-table-filter="categoria" class="h-10 rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none">
            <option value="">Todas las categorías</option>
            <option value="institucional">Institucional</option>
            <option value="academico">Académico</option>
            <option value="convenios">Convenios</option>
            <option value="comunidad">Comunidad</option>
            <option value="servicios">Servicios</option>
          </select>
          <select data-table-filter="modalidad" class="h-10 rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none">
            <option value="">Todas las modalidades</option>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
            <option value="hibrido">Híbrido</option>
          </select>
          <select data-table-filter="estado" class="h-10 rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none">
            <option value="">Todos los estados</option>
            <option value="publicado">Publicado</option>
            <option value="borrador">Borrador</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div class="overflow-hidden admin-card">
          <div class="overflow-x-auto">
            <table data-admin-table class="w-full text-left text-sm">
              <thead class="border-b border-border bg-surface-2 text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th class="px-4 py-3 font-semibold">Título</th>
                  <th class="px-4 py-3 font-semibold">Categoría</th>
                  <th class="px-4 py-3 font-semibold">Modalidad</th>
                  <th class="px-4 py-3 font-semibold">Fecha inicio</th>
                  <th class="px-4 py-3 font-semibold">Lugar</th>
                  <th class="px-4 py-3 font-semibold">Estado</th>
                  <th class="px-4 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr data-row data-search="semana de la administración 2026" data-categoria="institucional" data-modalidad="hibrido" data-estado="publicado">
                  <td class="px-4 py-3 font-medium text-text">Semana de la Administración 2026</td>
                  <td class="px-4 py-3 text-text-muted">Institucional</td>
                  <td class="px-4 py-3 text-text-muted">Híbrido</td>
                  <td class="px-4 py-3 text-text-muted">15 jul. 2026</td>
                  <td class="px-4 py-3 text-text-muted">Auditorio Principal</td>
                  <td class="px-4 py-3"><span class="badge badge-success">Publicado</span></td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <a href="eventos-form.html" aria-label="Editar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-2 hover:text-text">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                      </a>
                      <button type="button" data-delete-trigger data-delete-name="Semana de la Administración 2026" aria-label="Eliminar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-danger-bg hover:text-danger">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr data-row data-search="charla tendencias en gestión pública" data-categoria="academico" data-modalidad="presencial" data-estado="publicado">
                  <td class="px-4 py-3 font-medium text-text">Charla: Tendencias en Gestión Pública</td>
                  <td class="px-4 py-3 text-text-muted">Académico</td>
                  <td class="px-4 py-3 text-text-muted">Presencial</td>
                  <td class="px-4 py-3 text-text-muted">22 jul. 2026</td>
                  <td class="px-4 py-3 text-text-muted">Sala de Grados</td>
                  <td class="px-4 py-3"><span class="badge badge-success">Publicado</span></td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <a href="eventos-form.html" aria-label="Editar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-2 hover:text-text">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                      </a>
                      <button type="button" data-delete-trigger data-delete-name="Charla: Tendencias en Gestión Pública" aria-label="Eliminar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-danger-bg hover:text-danger">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr data-row data-search="webinar trámites y servicios virtuales para estudiantes" data-categoria="servicios" data-modalidad="virtual" data-estado="publicado">
                  <td class="px-4 py-3 font-medium text-text">Webinar: Trámites y servicios virtuales para estudiantes</td>
                  <td class="px-4 py-3 text-text-muted">Servicios</td>
                  <td class="px-4 py-3 text-text-muted">Virtual</td>
                  <td class="px-4 py-3 text-text-muted">28 jul. 2026</td>
                  <td class="px-4 py-3 text-text-muted">Virtual</td>
                  <td class="px-4 py-3"><span class="badge badge-success">Publicado</span></td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <a href="eventos-form.html" aria-label="Editar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-2 hover:text-text">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                      </a>
                      <button type="button" data-delete-trigger data-delete-name="Webinar: Trámites y servicios virtuales para estudiantes" aria-label="Eliminar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-danger-bg hover:text-danger">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr data-row data-search="feria laboral y de prácticas" data-categoria="servicios" data-modalidad="presencial" data-estado="publicado">
                  <td class="px-4 py-3 font-medium text-text">Feria Laboral y de Prácticas</td>
                  <td class="px-4 py-3 text-text-muted">Servicios</td>
                  <td class="px-4 py-3 text-text-muted">Presencial</td>
                  <td class="px-4 py-3 text-text-muted">05 ago. 2026</td>
                  <td class="px-4 py-3 text-text-muted">Patio Central</td>
                  <td class="px-4 py-3"><span class="badge badge-success">Publicado</span></td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <a href="eventos-form.html" aria-label="Editar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-2 hover:text-text">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                      </a>
                      <button type="button" data-delete-trigger data-delete-name="Feria Laboral y de Prácticas" aria-label="Eliminar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-danger-bg hover:text-danger">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr data-row data-search="conversatorio con egresados destacados" data-categoria="comunidad" data-modalidad="presencial" data-estado="cancelado" class="opacity-60">
                  <td class="px-4 py-3 font-medium text-text">Conversatorio con egresados destacados</td>
                  <td class="px-4 py-3 text-text-muted">Comunidad</td>
                  <td class="px-4 py-3 text-text-muted">Presencial</td>
                  <td class="px-4 py-3 text-text-muted">20 ago. 2026</td>
                  <td class="px-4 py-3 text-text-muted">Auditorio Principal</td>
                  <td class="px-4 py-3"><span class="badge badge-danger">Cancelado</span></td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <a href="eventos-form.html" aria-label="Editar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-2 hover:text-text">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                      </a>
                      <button type="button" data-delete-trigger data-delete-name="Conversatorio con egresados destacados" aria-label="Eliminar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-danger-bg hover:text-danger">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr data-row data-search="aniversario de la facultad" data-categoria="institucional" data-modalidad="presencial" data-estado="borrador">
                  <td class="px-4 py-3 font-medium text-text">Aniversario de la Facultad</td>
                  <td class="px-4 py-3 text-text-muted">Institucional</td>
                  <td class="px-4 py-3 text-text-muted">Presencial</td>
                  <td class="px-4 py-3 text-text-muted">28 may. 2026</td>
                  <td class="px-4 py-3 text-text-muted">Auditorio Principal</td>
                  <td class="px-4 py-3"><span class="badge badge-neutral">Borrador</span></td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <a href="eventos-form.html" aria-label="Editar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-2 hover:text-text">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                      </a>
                      <button type="button" data-delete-trigger data-delete-name="Aniversario de la Facultad" aria-label="Eliminar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-danger-bg hover:text-danger">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr data-empty-row class="hidden">
                  <td colspan="7" class="px-4 py-10 text-center text-sm text-text-muted">No se encontraron resultados.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex items-center justify-between text-sm text-text-muted">
          <p>Mostrando 1–6 de 6</p>
          <div class="flex items-center gap-1">
            <button class="rounded-md border border-border px-3 py-1.5 hover:bg-surface-2">Anterior</button>
            <button class="rounded-md bg-primary px-3 py-1.5 text-onPrimary">1</button>
            <button class="rounded-md border border-border px-3 py-1.5 hover:bg-surface-2">Siguiente</button>
          </div>
        </div>
      </main>
    </div>

    <admin-modal-confirm></admin-modal-confirm>
    <admin-toast></admin-toast>

    <script src="../../js/theme.js"></script>
    <script src="../../js/admin-common.js"></script>
    <script src="../../components/admin-sidebar.js"></script>
    <script src="../../components/admin-topbar.js"></script>
    <script src="../../components/admin-modal-confirm.js"></script>
    <script src="../../components/admin-toast.js"></script>
  </body>
</html>
```

```html
<!-- pages/admin/eventos-form.html -->
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Editar evento — Panel de Administración | Facultad de Administración UNAMBA (Mockup)</title>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap"
      rel="stylesheet"
    />

    <link rel="stylesheet" href="../../css/tokens.css" />
    <link rel="stylesheet" href="../../css/base.css" />

    <!-- Leaflet: mismo patrón que pages/evento-detalle.html -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <script src="../../js/tailwind-config.js"></script>
  </head>
  <body class="w-full bg-bg text-text font-body antialiased">
    <admin-sidebar></admin-sidebar>

    <div class="admin-canvas flex min-h-screen flex-col lg:pl-72">
      <admin-topbar page-title="Eventos"></admin-topbar>

      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <div class="mx-auto max-w-3xl">
          <a href="eventos.html" class="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition hover:text-text">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Volver a Eventos
          </a>
          <h2 class="mt-2 font-heading text-xl font-bold text-text">Editar evento</h2>

          <form data-admin-form data-redirect="eventos.html" class="mt-6 space-y-6">
            <!-- Información general -->
            <div class="admin-card p-5 sm:p-6">
              <h3 class="font-heading text-base font-semibold text-text">Información general</h3>
              <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div class="sm:col-span-3">
                  <label for="evento-titulo" class="block text-sm font-medium text-text">Título</label>
                  <input id="evento-titulo" type="text" value="Semana de la Administración 2026" class="mt-1.5 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label for="evento-categoria" class="block text-sm font-medium text-text">Categoría</label>
                  <select id="evento-categoria" class="mt-1.5 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none">
                    <option selected>Institucional</option>
                    <option>Académico</option>
                    <option>Convenios</option>
                    <option>Comunidad</option>
                    <option>Servicios</option>
                  </select>
                </div>
                <div>
                  <label for="evento-fecha-inicio" class="block text-sm font-medium text-text">Fecha y hora de inicio</label>
                  <input id="evento-fecha-inicio" type="datetime-local" value="2026-07-15T09:00" class="mt-1.5 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label for="evento-fecha-fin" class="block text-sm font-medium text-text">Fecha y hora de fin <span class="text-text-muted">(opcional)</span></label>
                  <input id="evento-fecha-fin" type="datetime-local" value="2026-07-17T13:00" class="mt-1.5 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none" />
                </div>
              </div>
            </div>

            <!-- Imagen destacada -->
            <div class="admin-card p-5 sm:p-6" data-upload>
              <h3 class="font-heading text-base font-semibold text-text">Imagen destacada <span class="font-normal text-text-muted">(opcional)</span></h3>
              <div class="mt-4 flex flex-col gap-4 sm:flex-row">
                <div class="relative flex h-32 w-full max-w-[220px] shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-bg text-text-muted">
                  <span data-upload-placeholder class="text-xs">Sin imagen</span>
                  <img data-upload-preview class="hidden h-full w-full object-cover" alt="" />
                </div>
                <div class="flex-1 space-y-3">
                  <input type="file" accept="image/*" data-upload-input class="hidden" />
                  <button type="button" data-upload-trigger class="rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition hover:bg-surface-2">Subir imagen</button>
                  <p class="text-xs text-text-muted">JPG o PNG, mínimo 1200px de ancho, relación 16:9.</p>
                  <div>
                    <label for="evento-alt" class="block text-sm font-medium text-text">Texto alternativo (alt)</label>
                    <input id="evento-alt" type="text" placeholder="Describe la imagen para accesibilidad" class="mt-1.5 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Modalidad y ubicación -->
            <div class="admin-card p-5 sm:p-6">
              <h3 class="font-heading text-base font-semibold text-text">Modalidad y ubicación</h3>
              <div class="mt-4">
                <label for="evento-modalidad" class="block text-sm font-medium text-text">Modalidad</label>
                <select id="evento-modalidad" data-condition-source="modalidad" class="mt-1.5 h-11 w-full max-w-xs rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none">
                  <option value="presencial">Presencial</option>
                  <option value="virtual">Virtual</option>
                  <option value="hibrido" selected>Híbrido</option>
                </select>
              </div>

              <div class="mt-4" data-condition-show="modalidad:presencial,hibrido">
                <label for="evento-lugar" class="block text-sm font-medium text-text">Lugar</label>
                <select id="evento-lugar" data-evento-lugar class="mt-1.5 h-11 w-full max-w-xs rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none">
                  <option value="auditorio-principal" data-lat="-13.6169" data-lng="-72.8681" selected>Auditorio Principal</option>
                  <option value="sala-de-grados" data-lat="-13.6172" data-lng="-72.8678">Sala de Grados</option>
                  <option value="patio-central" data-lat="-13.6166" data-lng="-72.8684">Patio Central</option>
                </select>
                <div
                  id="evento-map"
                  class="mt-4 h-56 w-full overflow-hidden rounded-md border border-border"
                  role="img"
                  aria-label="Mapa de ubicación del lugar seleccionado"
                ></div>
              </div>

              <div class="mt-4" data-condition-show="modalidad:virtual,hibrido">
                <label for="evento-enlace-virtual" class="block text-sm font-medium text-text">Enlace virtual</label>
                <input id="evento-enlace-virtual" type="url" value="https://meet.google.com/abc-defg-hij" placeholder="https://meet.google.com/..." class="mt-1.5 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none" />
                <p class="mt-1.5 text-xs text-text-muted">Enlace de acceso a la videollamada (Zoom/Meet).</p>
              </div>
            </div>

            <!-- Descripción -->
            <div class="admin-card p-5 sm:p-6">
              <h3 class="font-heading text-base font-semibold text-text">Descripción</h3>
              <div class="mt-4">
                <div class="overflow-hidden rounded-md border border-border bg-bg">
                  <div class="admin-toolbar">
                    <button type="button" tabindex="-1" class="rounded px-2 py-1 text-sm font-bold text-text-muted hover:bg-surface">B</button>
                    <button type="button" tabindex="-1" class="rounded px-2 py-1 text-sm italic text-text-muted hover:bg-surface">I</button>
                    <span class="mx-1 h-4 w-px bg-border"></span>
                    <button type="button" tabindex="-1" aria-label="Lista" class="rounded p-1.5 text-text-muted hover:bg-surface">
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
                    </button>
                    <button type="button" tabindex="-1" aria-label="Enlace" class="rounded p-1.5 text-text-muted hover:bg-surface">
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>
                    </button>
                    <button type="button" tabindex="-1" aria-label="Imagen" class="rounded p-1.5 text-text-muted hover:bg-surface">
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 12V6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75V12M3 12v6.75A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V12M3 12h18" /></svg>
                    </button>
                  </div>
                  <textarea rows="8" class="w-full resize-y border-0 bg-transparent px-3 py-2 text-sm text-text focus:outline-none" placeholder="Contenido completo del evento...">La Facultad de Administración invita a toda la comunidad universitaria a participar de la Semana de la Administración 2026, tres días de conferencias, talleres y actividades culturales pensadas para estudiantes, docentes y egresados.</textarea>
                </div>
              </div>
            </div>

            <!-- Inscripción -->
            <div class="admin-card p-5 sm:p-6">
              <h3 class="font-heading text-base font-semibold text-text">Inscripción</h3>
              <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label for="evento-inscripcion" class="block text-sm font-medium text-text">URL de inscripción <span class="text-text-muted">(opcional)</span></label>
                  <input id="evento-inscripcion" type="url" value="https://forms.gle/semana-administracion-2026" placeholder="https://forms.gle/..." class="mt-1.5 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label for="evento-cupo" class="block text-sm font-medium text-text">Cupo <span class="text-text-muted">(opcional)</span></label>
                  <input id="evento-cupo" type="number" min="0" value="150" placeholder="Sin límite" class="mt-1.5 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none" />
                </div>
              </div>
            </div>

            <!-- Publicación -->
            <div class="admin-card p-5 sm:p-6">
              <h3 class="font-heading text-base font-semibold text-text">Publicación</h3>
              <div class="mt-4" data-status-group>
                <span class="block text-sm font-medium text-text">Estado</span>
                <div class="mt-2 inline-flex rounded-md border border-border p-1">
                  <button type="button" data-status-option data-status-active-class="bg-primary text-onPrimary" class="rounded px-4 py-1.5 text-sm font-medium text-text-muted transition">Borrador</button>
                  <button type="button" data-status-option data-status-active-class="bg-primary text-onPrimary" class="rounded bg-primary px-4 py-1.5 text-sm font-medium text-onPrimary transition">Publicado</button>
                  <button type="button" data-status-option data-status-active-class="bg-danger text-white" class="rounded px-4 py-1.5 text-sm font-medium text-text-muted transition">Cancelado</button>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3">
              <a href="eventos.html" class="rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-text transition hover:bg-surface-2">Cancelar</a>
              <button type="submit" class="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-primary-dark transition hover:bg-accent-dark">Guardar</button>
            </div>
          </form>
        </div>
      </main>
    </div>

    <admin-toast></admin-toast>

    <script src="../../js/theme.js"></script>
    <script src="../../js/admin-common.js"></script>
    <script src="../../components/admin-sidebar.js"></script>
    <script src="../../components/admin-topbar.js"></script>
    <script src="../../components/admin-toast.js"></script>

    <!-- Mapa Leaflet: reactivo al <select> de Lugar y a data-condition-show
         (ver nota "Manejo del bug de Leaflet en contenedor oculto" arriba). -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const eventoMapEl = document.getElementById("evento-map");
      const eventoLugarSelect = document.getElementById("evento-lugar");
      let eventoMap = null;
      let eventoMarker = null;

      function coordsFromSelectedLugar() {
        const opt = eventoLugarSelect.selectedOptions[0];
        return [Number(opt.dataset.lat), Number(opt.dataset.lng)];
      }

      function initEventoMap() {
        if (eventoMap || !eventoMapEl) return;
        const coords = coordsFromSelectedLugar();
        eventoMap = L.map(eventoMapEl, { scrollWheelZoom: false }).setView(coords, 16);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(eventoMap);
        eventoMarker = L.marker(coords).addTo(eventoMap);
      }

      const ubicacionField = eventoMapEl.closest("[data-condition-show]");

      if (!ubicacionField.classList.contains("hidden")) {
        initEventoMap();
      }

      ubicacionField.addEventListener("admin:field-shown", () => {
        if (!eventoMap) {
          initEventoMap();
        } else {
          eventoMap.invalidateSize();
        }
      });

      eventoLugarSelect.addEventListener("change", () => {
        if (!eventoMap) return;
        const coords = coordsFromSelectedLugar();
        eventoMap.setView(coords, 16);
        eventoMarker.setLatLng(coords);
      });
    </script>
  </body>
</html>
```

### Checklist de Eventos

- [x] Aplicar el ajuste retroactivo a `js/admin-common.js` (generalizar
      `initStatusToggle`, agregar `initConditionalFields`) — sección 3.3
      ya actualizada.
- [x] Crear `pages/admin/eventos.html` siguiendo el ejemplo de arriba
      tal cual.
- [x] Crear `pages/admin/eventos-form.html` siguiendo el ejemplo de
      arriba tal cual, incluyendo el script del mapa.

### 4.3 Comunicados ✅

Entidades: `Comunicado`, `TipoComunicado` (Resolución / Convocatoria /
Aviso).

**Requiere el ajuste retroactivo a `js/admin-common.js`** (variante PDF
de `initUploadPreview` — sección 3.3, ya actualizada).

Comunicado es el módulo más simple hasta ahora: sin campo de texto
enriquecido (no tiene `cuerpo`/`descripcion`) y sin imagen destacada —
el archivo es un PDF, no una foto. Importante: "sin página de detalle"
(`MODELO-DATOS.md`) es una regla del **sitio público** (el clic va
directo al PDF, no a una página propia) — en el admin, "Editar" sigue
abriendo el formulario normal, esa regla no aplica aquí.

- [x] Listado (`pages/admin/comunicados.html`): columnas Número,
      Título, Tipo, Fecha de publicación, Vencimiento, Estado,
      Acciones. Filtros: Tipo + Estado (2 selects + buscador, como
      Noticias). Si `tipo=Convocatoria` y su `fecha_vencimiento` ya
      pasó, se agrega un badge neutral extra "Cerrada" junto a la
      fecha (no reemplaza el badge de Estado — son dos conceptos
      distintos: `estado` es editorial (borrador/publicado),
      "Cerrada" es solo un cálculo de fecha, igual criterio que
      `Oferta`/`Encuesta`/`Convenio` en `MODELO-DATOS.md`). Datos de
      ejemplo reutilizados de `pages/comunicados.html` (mismo mockup):
      Resolución 045-2026-UNAMBA-FA (Cronograma académico 2026-II),
      Mantenimiento de instalaciones (Aviso, sin PDF — demuestra el
      caso `documento_id` vacío también en el admin), Proceso de
      contratación docente 2026-II (Convocatoria vigente, vence
      15 jul. 2026), Resolución 041-2026-UNAMBA-FA (Comisión de
      currícula), Beca de intercambio estudiantil (Convocatoria
      **cerrada**, venció 01 jun. 2026 — hoy en el mockup es 07 jul.
      2026).
- [x] Formulario (`pages/admin/comunicados-form.html`): secciones
      Información general (Número —opcional, placeholder tipo
      "045-2026-UNAMBA-FA"—, Título, Tipo, Fecha de publicación) →
      Vencimiento (campo condicional, `data-condition-source="tipo"` +
      `data-condition-show="tipo:convocatoria"` — solo aplica a
      Convocatorias) → Documento PDF (uploader variante PDF, opcional,
      con `data-upload-filename` en vez de `data-upload-preview`) →
      Publicación (pills de 2 estados, igual que Noticias).
      Dato de ejemplo: Resolución 045-2026-UNAMBA-FA / Cronograma
      académico 2026-II (mismo comunicado que ya aparece en la
      actividad reciente del Dashboard — continuidad entre pantallas).

```html
<!-- pages/admin/comunicados.html -->
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Comunicados — Panel de Administración | Facultad de Administración UNAMBA (Mockup)</title>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap"
      rel="stylesheet"
    />

    <link rel="stylesheet" href="../../css/tokens.css" />
    <link rel="stylesheet" href="../../css/base.css" />

    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <script src="../../js/tailwind-config.js"></script>
  </head>
  <body class="w-full bg-bg text-text font-body antialiased">
    <admin-sidebar></admin-sidebar>

    <div class="admin-canvas flex min-h-screen flex-col lg:pl-72">
      <admin-topbar page-title="Comunicados"></admin-topbar>

      <main class="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="font-heading text-xl font-bold text-text">Comunicados</h2>
            <p class="text-sm text-text-muted">Resoluciones, convocatorias y avisos oficiales.</p>
          </div>
          <a href="comunicados-form.html" class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-onPrimary transition hover:bg-primary-dark">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo comunicado
          </a>
        </div>

        <div class="flex flex-col gap-3 admin-card p-4 sm:flex-row sm:items-center">
          <div class="relative flex-1">
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input type="search" data-table-search placeholder="Buscar por título o número..." class="h-10 w-full rounded-md border border-border bg-bg pl-9 pr-3 text-sm text-text focus:border-primary focus:outline-none" />
          </div>
          <select data-table-filter="tipo" class="h-10 rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none">
            <option value="">Todos los tipos</option>
            <option value="resolucion">Resolución</option>
            <option value="convocatoria">Convocatoria</option>
            <option value="aviso">Aviso</option>
          </select>
          <select data-table-filter="estado" class="h-10 rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none">
            <option value="">Todos los estados</option>
            <option value="publicado">Publicado</option>
            <option value="borrador">Borrador</option>
          </select>
        </div>

        <div class="overflow-hidden admin-card">
          <div class="overflow-x-auto">
            <table data-admin-table class="w-full text-left text-sm">
              <thead class="border-b border-border bg-surface-2 text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th class="px-4 py-3 font-semibold">Número</th>
                  <th class="px-4 py-3 font-semibold">Título</th>
                  <th class="px-4 py-3 font-semibold">Tipo</th>
                  <th class="px-4 py-3 font-semibold">Fecha</th>
                  <th class="px-4 py-3 font-semibold">Vencimiento</th>
                  <th class="px-4 py-3 font-semibold">Estado</th>
                  <th class="px-4 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr data-row data-search="045-2026-unamba-fa cronograma académico 2026-ii" data-tipo="resolucion" data-estado="publicado">
                  <td class="px-4 py-3 text-text-muted">045-2026-UNAMBA-FA</td>
                  <td class="px-4 py-3 font-medium text-text">Cronograma académico 2026-II</td>
                  <td class="px-4 py-3 text-text-muted">Resolución</td>
                  <td class="px-4 py-3 text-text-muted">25 jun. 2026</td>
                  <td class="px-4 py-3 text-text-muted">—</td>
                  <td class="px-4 py-3"><span class="badge badge-success">Publicado</span></td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <a href="comunicados-form.html" aria-label="Editar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-2 hover:text-text">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                      </a>
                      <button type="button" data-delete-trigger data-delete-name="045-2026-UNAMBA-FA — Cronograma académico 2026-II" aria-label="Eliminar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-danger-bg hover:text-danger">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr data-row data-search="mantenimiento de instalaciones" data-tipo="aviso" data-estado="publicado">
                  <td class="px-4 py-3 text-text-muted">—</td>
                  <td class="px-4 py-3 font-medium text-text">Mantenimiento de instalaciones</td>
                  <td class="px-4 py-3 text-text-muted">Aviso</td>
                  <td class="px-4 py-3 text-text-muted">18 jun. 2026</td>
                  <td class="px-4 py-3 text-text-muted">—</td>
                  <td class="px-4 py-3"><span class="badge badge-success">Publicado</span></td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <a href="comunicados-form.html" aria-label="Editar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-2 hover:text-text">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                      </a>
                      <button type="button" data-delete-trigger data-delete-name="Mantenimiento de instalaciones" aria-label="Eliminar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-danger-bg hover:text-danger">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr data-row data-search="proceso de contratación docente 2026-ii" data-tipo="convocatoria" data-estado="publicado">
                  <td class="px-4 py-3 text-text-muted">—</td>
                  <td class="px-4 py-3 font-medium text-text">Proceso de contratación docente 2026-II</td>
                  <td class="px-4 py-3 text-text-muted">Convocatoria</td>
                  <td class="px-4 py-3 text-text-muted">10 jun. 2026</td>
                  <td class="px-4 py-3 text-text-muted">15 jul. 2026</td>
                  <td class="px-4 py-3"><span class="badge badge-success">Publicado</span></td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <a href="comunicados-form.html" aria-label="Editar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-2 hover:text-text">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                      </a>
                      <button type="button" data-delete-trigger data-delete-name="Proceso de contratación docente 2026-II" aria-label="Eliminar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-danger-bg hover:text-danger">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr data-row data-search="041-2026-unamba-fa comisión de currícula" data-tipo="resolucion" data-estado="publicado">
                  <td class="px-4 py-3 text-text-muted">041-2026-UNAMBA-FA</td>
                  <td class="px-4 py-3 font-medium text-text">Comisión de currícula</td>
                  <td class="px-4 py-3 text-text-muted">Resolución</td>
                  <td class="px-4 py-3 text-text-muted">03 jun. 2026</td>
                  <td class="px-4 py-3 text-text-muted">—</td>
                  <td class="px-4 py-3"><span class="badge badge-success">Publicado</span></td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <a href="comunicados-form.html" aria-label="Editar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-2 hover:text-text">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                      </a>
                      <button type="button" data-delete-trigger data-delete-name="041-2026-UNAMBA-FA — Comisión de currícula" aria-label="Eliminar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-danger-bg hover:text-danger">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr data-row data-search="beca de intercambio estudiantil" data-tipo="convocatoria" data-estado="publicado">
                  <td class="px-4 py-3 text-text-muted">—</td>
                  <td class="px-4 py-3 font-medium text-text">Beca de intercambio estudiantil</td>
                  <td class="px-4 py-3 text-text-muted">Convocatoria</td>
                  <td class="px-4 py-3 text-text-muted">27 may. 2026</td>
                  <td class="px-4 py-3">
                    <span class="flex items-center gap-1.5 text-text-muted">
                      01 jun. 2026
                      <span class="badge badge-neutral">Cerrada</span>
                    </span>
                  </td>
                  <td class="px-4 py-3"><span class="badge badge-success">Publicado</span></td>
                  <td class="px-4 py-3">
                    <div class="flex justify-end gap-1">
                      <a href="comunicados-form.html" aria-label="Editar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-surface-2 hover:text-text">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                      </a>
                      <button type="button" data-delete-trigger data-delete-name="Beca de intercambio estudiantil" aria-label="Eliminar" class="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition hover:bg-danger-bg hover:text-danger">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr data-empty-row class="hidden">
                  <td colspan="7" class="px-4 py-10 text-center text-sm text-text-muted">No se encontraron resultados.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex items-center justify-between text-sm text-text-muted">
          <p>Mostrando 1–5 de 5</p>
          <div class="flex items-center gap-1">
            <button class="rounded-md border border-border px-3 py-1.5 hover:bg-surface-2">Anterior</button>
            <button class="rounded-md bg-primary px-3 py-1.5 text-onPrimary">1</button>
            <button class="rounded-md border border-border px-3 py-1.5 hover:bg-surface-2">Siguiente</button>
          </div>
        </div>
      </main>
    </div>

    <admin-modal-confirm></admin-modal-confirm>
    <admin-toast></admin-toast>

    <script src="../../js/theme.js"></script>
    <script src="../../js/admin-common.js"></script>
    <script src="../../components/admin-sidebar.js"></script>
    <script src="../../components/admin-topbar.js"></script>
    <script src="../../components/admin-modal-confirm.js"></script>
    <script src="../../components/admin-toast.js"></script>
  </body>
</html>
```

```html
<!-- pages/admin/comunicados-form.html -->
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Editar comunicado — Panel de Administración | Facultad de Administración UNAMBA (Mockup)</title>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap"
      rel="stylesheet"
    />

    <link rel="stylesheet" href="../../css/tokens.css" />
    <link rel="stylesheet" href="../../css/base.css" />

    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <script src="../../js/tailwind-config.js"></script>
  </head>
  <body class="w-full bg-bg text-text font-body antialiased">
    <admin-sidebar></admin-sidebar>

    <div class="admin-canvas flex min-h-screen flex-col lg:pl-72">
      <admin-topbar page-title="Comunicados"></admin-topbar>

      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <div class="mx-auto max-w-3xl">
          <a href="comunicados.html" class="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition hover:text-text">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Volver a Comunicados
          </a>
          <h2 class="mt-2 font-heading text-xl font-bold text-text">Editar comunicado</h2>

          <form data-admin-form data-redirect="comunicados.html" class="mt-6 space-y-6">
            <!-- Información general -->
            <div class="admin-card p-5 sm:p-6">
              <h3 class="font-heading text-base font-semibold text-text">Información general</h3>
              <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label for="comunicado-numero" class="block text-sm font-medium text-text">Número <span class="text-text-muted">(opcional)</span></label>
                  <input id="comunicado-numero" type="text" value="045-2026-UNAMBA-FA" placeholder="Ej. 045-2026-UNAMBA-FA" class="mt-1.5 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label for="comunicado-tipo" class="block text-sm font-medium text-text">Tipo</label>
                  <select id="comunicado-tipo" data-condition-source="tipo" class="mt-1.5 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none">
                    <option value="resolucion" selected>Resolución</option>
                    <option value="convocatoria">Convocatoria</option>
                    <option value="aviso">Aviso</option>
                  </select>
                </div>
                <div class="sm:col-span-2">
                  <label for="comunicado-titulo" class="block text-sm font-medium text-text">Título</label>
                  <input id="comunicado-titulo" type="text" value="Cronograma académico 2026-II" class="mt-1.5 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label for="comunicado-fecha" class="block text-sm font-medium text-text">Fecha de publicación</label>
                  <input id="comunicado-fecha" type="date" value="2026-06-25" class="mt-1.5 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none" />
                </div>
                <div data-condition-show="tipo:convocatoria" class="hidden">
                  <label for="comunicado-vencimiento" class="block text-sm font-medium text-text">Fecha de vencimiento <span class="text-text-muted">(opcional)</span></label>
                  <input id="comunicado-vencimiento" type="date" class="mt-1.5 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-text focus:border-primary focus:outline-none" />
                  <p class="mt-1.5 text-xs text-text-muted">Solo convocatorias con plazo. Si ya pasó, se muestra "Cerrada" en el listado.</p>
                </div>
              </div>
            </div>

            <!-- Documento PDF -->
            <div class="admin-card p-5 sm:p-6" data-upload>
              <h3 class="font-heading text-base font-semibold text-text">Documento PDF <span class="font-normal text-text-muted">(opcional)</span></h3>
              <div class="mt-4 flex items-center gap-4">
                <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-danger-bg text-danger">
                  <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </span>
                <div class="min-w-0 flex-1">
                  <p data-upload-filename class="truncate text-sm font-medium text-text">resolucion-045-2026-unamba-fa.pdf</p>
                  <p class="text-xs text-text-muted">PDF, máx. 10MB.</p>
                </div>
                <input type="file" accept="application/pdf" data-upload-input class="hidden" />
                <button type="button" data-upload-trigger class="shrink-0 rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition hover:bg-surface-2">Reemplazar</button>
              </div>
            </div>

            <!-- Publicación -->
            <div class="admin-card p-5 sm:p-6">
              <h3 class="font-heading text-base font-semibold text-text">Publicación</h3>
              <div class="mt-4" data-status-group>
                <span class="block text-sm font-medium text-text">Estado</span>
                <div class="mt-2 inline-flex rounded-md border border-border p-1">
                  <button type="button" data-status-option data-status-active-class="bg-primary text-onPrimary" class="rounded px-4 py-1.5 text-sm font-medium text-text-muted transition">Borrador</button>
                  <button type="button" data-status-option data-status-active-class="bg-primary text-onPrimary" class="rounded bg-primary px-4 py-1.5 text-sm font-medium text-onPrimary transition">Publicado</button>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3">
              <a href="comunicados.html" class="rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-text transition hover:bg-surface-2">Cancelar</a>
              <button type="submit" class="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-primary-dark transition hover:bg-accent-dark">Guardar</button>
            </div>
          </form>
        </div>
      </main>
    </div>

    <admin-toast></admin-toast>

    <script src="../../js/theme.js"></script>
    <script src="../../js/admin-common.js"></script>
    <script src="../../components/admin-sidebar.js"></script>
    <script src="../../components/admin-topbar.js"></script>
    <script src="../../components/admin-toast.js"></script>
  </body>
</html>
```

### Checklist de Comunicados

- [x] Aplicar el ajuste retroactivo a `js/admin-common.js` (variante PDF
      de `initUploadPreview`) — sección 3.3 ya actualizada.
- [x] Crear `pages/admin/comunicados.html` siguiendo el ejemplo de
      arriba tal cual.
- [x] Crear `pages/admin/comunicados-form.html` siguiendo el ejemplo de
      arriba tal cual.
- [x] 4.4 **Banners de Inicio** ✅ — Entidad `Banner` documentada en
      `MODELO-DATOS.md` (etiqueta, título, descripción, imagen opcional
      con degradado de respaldo, botón principal/secundario, orden,
      estado). `pages/admin/banners.html` + `banners-form.html`, datos
      de ejemplo = los 3 slides reales de `index.html`.
  **Actualización:** se agregaron las 3 fotos reales del hero
  (`assets/img/banners/banner_1.png` a `_3.png`) tanto en `index.html`
  como en el admin. Bug encontrado y corregido: el overlay oscuro sobre
  la imagen usaba modificadores de opacidad de Tailwind (`/95`, `/40`)
  sobre `primary-dark`, que no funcionan con colores personalizados
  definidos como hex en `tokens.css` (el overlay salía 100% opaco y
  tapaba la foto). Se reemplazó por `color-mix()` inline, mismo
  mecanismo que ya usa `tokens.css` para los fondos `-bg` de estado —
  si se necesita otro overlay con opacidad sobre un color de marca en
  el futuro, usar `color-mix()`, no `/opacidad` de Tailwind.
- [x] 4.5 **Galería** ✅ — `pages/admin/galeria.html` (grid de álbumes,
      no tabla) + `galeria-form.html` con gestor de fotos múltiples
      nuevo (`initGalleryManager` en `admin-common.js`: agregar varias
      fotos a la vez con preview real, quitar con hover). Datos de
      ejemplo = los 5 álbumes reales de `pages/galeria.html`.

  **2 bugs reales encontrados y corregidos en `js/admin-common.js` /
  `components/admin-modal-confirm.js`** (afectaban también a Noticias,
  Eventos y Comunicados, ya construidos — arreglo retroactivo automático
  porque comparten el mismo script):
  1. El buscador/filtros de tabla nunca funcionaron: el JS los buscaba
     *dentro* de `[data-admin-table]`, pero viven en la barra de
     herramientas, afuera (hermanos, no ancestro/descendiente). Ahora
     se buscan a nivel de `document`.
  2. El selector de filas era `tbody tr[data-row]`, así que el modal de
     eliminar y el filtro no funcionaban en listados que no son
     `<table>` (como el grid de Galería). Ahora es `[data-row]` a
     secas, compatible con ambos.

  **Otro cambio de esta sesión:** enlace discreto "Acceso
  administrativo" en la barra inferior del footer (`components/footer.js`),
  hacia `pages/admin/login.html` — así se puede entrar al panel desde
  cualquier página pública sin que sea visualmente prominente.

## Fase 5 — La Facultad

- [ ] 5.1 **Nosotros / La Facultad** — formulario único (singleton) +
      gestión de `ValorInstitucional`, `ObjetivoEducacional`, `Fortaleza`.
- [ ] 5.2 **Autoridades** — listado + formulario. Entidades: `Autoridad`,
      `CargoAutoridad`.
- [ ] 5.3 **Comités** — listado + formulario + gestión de miembros.
      Entidades: `Comite`, `ComiteMiembro`.
- [ ] 5.4 **Docentes** — listado (con filtro sede/categoría) + formulario.
      Entidades: `Docente`, `CategoriaDocente`, `Sede`.

## Fase 6 — Académico

- [ ] 6.1 **Información académica** — formulario único (singleton) +
      gestión de `PerfilIngresante`, `PerfilEgresado`,
      `CampoOcupacional`, `Competencia`/`TipoCompetencia`.
- [ ] 6.2 **Posgrado** — listado + formulario. Entidad: `Maestria`.

## Fase 7 — Investigación

- [ ] 7.1 **Líneas de investigación** — listado + formulario.
- [ ] 7.2 **Proyectos de investigación** — listado + formulario.
- [ ] 7.3 **Publicaciones** — listado + formulario.

## Fase 8 — Servicios

- [ ] 8.1 **Documentos** — listado + formulario. Entidades: `Documento`,
      `TipoDocumento`.
- [ ] 8.2 **Bolsa de trabajo** — listado + formulario. Entidades:
      `Oferta`, `Empresa`, `TipoOferta`.
- [ ] 8.3 **Trámites** — listado + formulario. Entidad: `Tramite`.
- [ ] 8.4 **Encuestas** — listado + formulario. Entidades: `Encuesta`,
      `AudienciaEncuesta`.
- [ ] 8.5 **Convenios** — listado + formulario. Entidades: `Convenio`,
      `Institucion`, `TipoConvenio`.

## Fase 9 — Vida Estudiantil

- [ ] 9.1 **Grupos estudiantiles** — listado + formulario. Entidad:
      `GrupoEstudiantil`.
- [ ] 9.2 **Estudiantes destacados** — listado + formulario. Entidad:
      `EstudianteDestacado`.

## Fase 10 — Comunicación

- [ ] 10.1 **Mensajes recibidos** — listado (buzón). Entidad:
       `MensajeContacto`.
- [ ] 10.2 **FAQ** — *(requiere anotar entidad nueva: pregunta, respuesta,
       categoría)*.
- [ ] 10.3 **Enlaces de interés** — *(requiere anotar entidad nueva: logos
       externos de Inicio)*.

## Fase 11 — Configuración

- [ ] 11.1 **Contacto** — formulario único (singleton) + gestión de
       `RedSocial`.
- [ ] 11.2 **Páginas legales** — *(requiere anotar entidad nueva:
       privacidad/términos)*.
- [ ] 11.3 **Configuración institucional** — *(requiere anotar entidad
       nueva: cifras clave y bloque de bienvenida de Inicio)*.
- [ ] 11.4 **Chatbot IA (panel RAG)** — *(requiere anotar entidad nueva:
       documentos que alimentan la IA)*.

## Fase 12 — Sistema

- [ ] 12.1 **Usuarios y roles** — *(requiere completar la tabla `Rol`,
       hoy solo referenciada como FK)*. Entidad: `Usuario`.
- [ ] 12.2 **Registro de actividad / logs** — *(requiere anotar entidad
       nueva: auditoría)*.

## Fase 13 — Revisión final

- [ ] 13.1 Responsive en todo `/admin` (móvil, tablet, escritorio).
- [ ] 13.2 Modo oscuro consistente en todos los módulos.
- [ ] 13.3 Accesibilidad (foco visible, contraste, navegación por teclado).
- [ ] 13.4 Coherencia visual: mismos componentes reutilizados en todos los
       módulos, sin estilos sueltos.
