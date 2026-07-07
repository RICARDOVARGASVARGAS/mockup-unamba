/**
 * admin-media-picker.js — selector de imágenes de la Biblioteca de
 * archivos (<admin-media-picker>).
 *
 * Se abre escuchando "admin:open-media-picker" en `document` — lo
 * dispara initImageInsert() en admin-common.js cuando se hace clic en
 * un botón [data-insert-image] de un editor de texto enriquecido. Al
 * elegir un archivo (uno ya existente, o uno recién subido ahí mismo),
 * dispara "admin:image-selected" con { nombre, ruta } — quien abrió el
 * picker decide qué hacer con eso.
 *
 * Catálogo de ejemplo intencionalmente parecido al de
 * pages/admin/biblioteca.html — en el sistema real, ambos leerían la
 * misma tabla `Archivo`, este picker sería solo un filtro "tipo=imagen"
 * sobre esa misma biblioteca.
 */
(function () {
  const EJEMPLOS = [
    { nombre: "banner_1.png", ruta: "assets/img/banners/banner_1.png" },
    { nombre: "banner_2.png", ruta: "assets/img/banners/banner_2.png" },
    { nombre: "fachada-facultad.jpg", ruta: "assets/img/nosotros/fachada-facultad.jpg" },
    { nombre: "docente-3.jpg", ruta: "assets/img/docentes/docente-3.jpg" },
    { nombre: "noticia-taller-finanzas.jpg", ruta: "assets/img/noticias/noticia-taller-finanzas.jpg" },
  ];

  class AdminMediaPicker extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div data-backdrop class="fixed inset-0 z-50 hidden items-center justify-center bg-gray-900/50 p-4">
          <div class="w-full max-w-2xl rounded-lg bg-surface p-6 shadow-lg">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="font-heading text-lg font-semibold text-text">Insertar imagen</h2>
                <p class="mt-1 text-sm text-text-muted">Elige una imagen ya subida, o sube una nueva.</p>
              </div>
              <button type="button" data-picker-close aria-label="Cerrar" class="shrink-0 rounded-md p-1.5 text-text-muted transition hover:bg-surface-2 hover:text-text">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div class="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4" data-picker-grid>
              ${EJEMPLOS.map(
                (item) => `
                <button type="button" data-picker-item data-nombre="${item.nombre}" data-ruta="${item.ruta}" class="group overflow-hidden rounded-md border border-border transition hover:border-primary">
                  <span class="block aspect-square overflow-hidden bg-surface-2">
                    <img src="../../${item.ruta}" alt="" class="h-full w-full object-cover" />
                  </span>
                  <span class="block truncate p-1.5 text-left text-xs text-text-muted group-hover:text-primary">${item.nombre}</span>
                </button>`
              ).join("")}
              <input type="file" accept="image/*" data-picker-input class="hidden" />
              <button type="button" data-picker-upload class="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-text-muted transition hover:border-primary hover:text-primary">
                <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                <span class="text-xs">Subir nueva</span>
              </button>
            </div>

            <p class="mt-4 text-xs text-text-muted">
              La biblioteca completa (subir, ver todo, copiar link) está en
              <a href="biblioteca.html" class="font-medium text-primary hover:text-primary-dark">Contenido → Biblioteca de archivos</a>.
            </p>
          </div>
        </div>
      `;
      this.init();
    }

    init() {
      const backdrop = this.querySelector("[data-backdrop]");
      const grid = this.querySelector("[data-picker-grid]");
      const input = this.querySelector("[data-picker-input]");
      const uploadBtn = this.querySelector("[data-picker-upload]");

      const open = () => {
        backdrop.classList.remove("hidden");
        backdrop.classList.add("flex");
      };
      const close = () => {
        backdrop.classList.add("hidden");
        backdrop.classList.remove("flex");
      };
      const select = (nombre, ruta) => {
        document.dispatchEvent(new CustomEvent("admin:image-selected", { detail: { nombre, ruta } }));
        close();
      };

      document.addEventListener("admin:open-media-picker", open);
      this.querySelectorAll("[data-picker-close]").forEach((btn) => btn.addEventListener("click", close));
      backdrop.addEventListener("click", (event) => {
        if (event.target === backdrop) close();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !backdrop.classList.contains("hidden")) close();
      });

      grid.addEventListener("click", (event) => {
        const item = event.target.closest("[data-picker-item]");
        if (item) select(item.dataset.nombre, item.dataset.ruta);
      });

      uploadBtn.addEventListener("click", () => input.click());
      input.addEventListener("change", () => {
        const file = input.files?.[0];
        if (!file) return;
        select(file.name, URL.createObjectURL(file));
        input.value = "";
      });
    }
  }

  customElements.define("admin-media-picker", AdminMediaPicker);
})();
