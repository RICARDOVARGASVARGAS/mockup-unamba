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
 * 7) Gestor de fotos múltiples — [data-gallery] (agregado en Fase 4.5,
 *    para el álbum de Galería)
 * 8) Gestor de listas repetibles — [data-list-manager] (agregado en
 *    Fase 5.3, para miembros de Comité; reutilizable para cualquier
 *    mini-catálogo inline futuro, ej. Valores/Objetivos/Fortalezas de
 *    LaFacultad en 5.1)
 * 9) Biblioteca de archivos — [data-media-add] (agregar Archivo nuevo
 *    al grid de pages/admin/biblioteca.html, con preview real)
 * 10) Copiar link — [data-copy-link] (biblioteca.html y cualquier otra
 *     tarjeta de archivo que necesite copiar su ruta)
 * 11) Insertar imagen en editor — [data-insert-image] (abre
 *     <admin-media-picker>, inserta la imagen elegida en el textarea
 *     del editor que disparó el botón — ver admin-media-picker.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  initTableFilters();
  initSavedToast();
  initFormSubmit();
  initStatusToggle();
  initUploadPreview();
  initConditionalFields();
  initGalleryManager();
  initListManager();
  initMediaLibrary();
  initCopyLink();
  initImageInsert();
});

function initTableFilters() {
  // El buscador y los <select> de filtro viven en la barra de
  // herramientas, FUERA de [data-admin-table] (son hermanos, no
  // ancestro/descendiente) — por eso se buscan a nivel de `document`,
  // no `table.querySelector(...)`. Cada página de listado tiene un solo
  // buscador y un solo [data-admin-table], así que no hay ambigüedad.
  // El selector de filas es [data-row] a secas (no "tbody tr[data-row]"):
  // así funciona igual si [data-admin-table] es un <table> (Noticias,
  // Eventos, Comunicados, Banners) o un <div> en grid (Galería).
  document.querySelectorAll("[data-admin-table]").forEach((table) => {
    const searchInput = document.querySelector("[data-table-search]");
    const filterSelects = document.querySelectorAll("[data-table-filter]");
    const emptyRow = table.querySelector("[data-empty-row]");

    function apply() {
      const query = (searchInput?.value || "").trim().toLowerCase();
      const activeFilters = Array.from(filterSelects)
        .map((select) => ({ key: select.dataset.tableFilter, value: select.value }))
        .filter((f) => f.value);

      let visibleCount = 0;
      table.querySelectorAll("[data-row]").forEach((row) => {
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

function initGalleryManager() {
  // Grid de fotos de un álbum: [data-gallery] envuelve [data-gallery-grid]
  // (miniaturas [data-gallery-item], cada una con su botón
  // [data-gallery-remove]) + un input file oculto [data-gallery-input]
  // disparado por [data-gallery-add]. Seleccionar varios archivos los
  // agrega como miniaturas nuevas antes del botón "Agregar" (preview
  // real vía URL.createObjectURL, sin backend).
  document.querySelectorAll("[data-gallery]").forEach((wrapper) => {
    const grid = wrapper.querySelector("[data-gallery-grid]");
    const addBtn = wrapper.querySelector("[data-gallery-add]");
    const input = wrapper.querySelector("[data-gallery-input]");
    if (!grid || !addBtn || !input) return;

    grid.addEventListener("click", (event) => {
      const removeBtn = event.target.closest("[data-gallery-remove]");
      if (removeBtn) removeBtn.closest("[data-gallery-item]")?.remove();
    });

    addBtn.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
      Array.from(input.files || []).forEach((file) => {
        const item = document.createElement("div");
        item.dataset.galleryItem = "";
        item.className = "group relative aspect-square overflow-hidden rounded-md border border-border";
        item.innerHTML = `
          <img src="${URL.createObjectURL(file)}" class="h-full w-full object-cover" alt="" />
          <button type="button" data-gallery-remove aria-label="Quitar foto" class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900/70 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100">
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        `;
        grid.insertBefore(item, addBtn);
      });
      input.value = "";
    });
  });
}

function initListManager() {
  // Lista repetible genérica: [data-list-manager] envuelve
  // [data-list-items] (filas [data-list-item], cada una con su botón
  // [data-list-remove]) + un <template data-list-template> que define
  // la forma de una fila NUEVA + un botón [data-list-add]. No sabe nada
  // del contenido de la fila (nombre/rol de un miembro, texto de un
  // valor institucional, etc.) — el markup de cada fila vive en el
  // propio <template> de cada página, este script solo clona y quita filas.
  document.querySelectorAll("[data-list-manager]").forEach((wrapper) => {
    const items = wrapper.querySelector("[data-list-items]");
    const template = wrapper.querySelector("[data-list-template]");
    const addBtn = wrapper.querySelector("[data-list-add]");
    if (!items) return;

    items.addEventListener("click", (event) => {
      const removeBtn = event.target.closest("[data-list-remove]");
      if (removeBtn) removeBtn.closest("[data-list-item]")?.remove();
    });

    addBtn?.addEventListener("click", () => {
      if (!template) return;
      items.appendChild(template.content.cloneNode(true));
    });
  });
}

function initMediaLibrary() {
  // [data-media-add] es la tarjeta "Subir archivo" dentro del propio
  // [data-admin-table] de biblioteca.html. Al elegir archivo(s), arma
  // una tarjeta [data-row] nueva (imagen real con preview, o ícono para
  // PDF/video) ANTES de la tarjeta de agregar, y queda inmediatamente
  // filtrable/buscable porque reutiliza el mismo patrón data-row que ya
  // lee initTableFilters().
  document.querySelectorAll("[data-media-add]").forEach((addTile) => {
    const grid = addTile.closest("[data-admin-table]");
    const input = grid?.querySelector("[data-media-input]");
    if (!grid || !input) return;

    addTile.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
      Array.from(input.files || []).forEach((file) => {
        const isImage = file.type.startsWith("image/");
        const isPdf = file.type === "application/pdf";
        const tipo = isImage ? "imagen" : isPdf ? "pdf" : "video";
        const tipoLabel = isImage ? "Imagen" : isPdf ? "PDF" : "Video";
        const sizeLabel =
          file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;

        const card = document.createElement("div");
        card.dataset.row = "";
        card.dataset.search = file.name.toLowerCase();
        card.dataset.tipo = tipo;
        card.className = "overflow-hidden admin-card";
        card.innerHTML = `
          ${
            isImage
              ? `<div class="relative aspect-video overflow-hidden bg-surface-2"><img src="${URL.createObjectURL(
                  file
                )}" class="h-full w-full object-cover" alt="" /></div>`
              : `<div class="flex aspect-video items-center justify-center bg-surface-2 text-danger">
                   <svg class="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                 </div>`
          }
          <div class="p-3">
            <p class="truncate text-sm font-medium text-text">${file.name}</p>
            <p class="text-xs text-text-muted">${tipoLabel} · ${sizeLabel}</p>
            <div class="mt-2 flex items-center justify-between gap-1">
              <button type="button" data-copy-link data-link-value="${file.name}" class="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-text transition hover:bg-surface-2">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>
                Copiar link
              </button>
              <button type="button" data-delete-trigger data-delete-name="${file.name}" aria-label="Eliminar" class="rounded-md p-1.5 text-text-muted transition hover:bg-danger-bg hover:text-danger">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
              </button>
            </div>
          </div>
        `;
        grid.insertBefore(card, addTile);
      });
      input.value = "";
    });
  });
}

function initCopyLink() {
  // Reusable en cualquier tarjeta de archivo, no solo biblioteca.html.
  // navigator.clipboard requiere HTTPS o localhost — funciona al abrir
  // el mockup con Live Server; si falla (ej. file://), no rompe nada,
  // solo no copia de verdad, pero el toast igual confirma la acción.
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-copy-link]");
    if (!button) return;
    const value = button.dataset.linkValue || "";
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    document.dispatchEvent(new CustomEvent("admin:toast", { detail: { message: "Link copiado", variant: "success" } }));
  });
}

function initImageInsert() {
  // [data-insert-image] vive en la barra de un editor de texto
  // enriquecido (ver noticias-form.html / eventos-form.html). Al hacer
  // clic, recuerda el <textarea> hermano de esa barra y abre
  // <admin-media-picker> (evento "admin:open-media-picker"). Cuando el
  // picker dispara "admin:image-selected", el nombre del archivo se
  // inserta en la posición del cursor de ESE textarea — no hace falta
  // que el picker sepa nada del editor que lo llamó.
  let targetTextarea = null;

  document.querySelectorAll("[data-insert-image]").forEach((button) => {
    button.addEventListener("click", () => {
      const toolbar = button.parentElement;
      const wrapper = toolbar.parentElement;
      targetTextarea = wrapper.querySelector("textarea") || null;
      document.dispatchEvent(new CustomEvent("admin:open-media-picker"));
    });
  });

  document.addEventListener("admin:image-selected", (event) => {
    if (!targetTextarea) return;
    const tag = `[imagen: ${event.detail.nombre}]`;
    const start = targetTextarea.selectionStart ?? targetTextarea.value.length;
    const end = targetTextarea.selectionEnd ?? targetTextarea.value.length;
    const value = targetTextarea.value;
    targetTextarea.value = value.slice(0, start) + tag + value.slice(end);
    targetTextarea.focus();
    const cursor = start + tag.length;
    targetTextarea.setSelectionRange(cursor, cursor);
    document.dispatchEvent(new CustomEvent("admin:toast", { detail: { message: "Imagen insertada", variant: "success" } }));
  });
}
