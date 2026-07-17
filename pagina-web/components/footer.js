/**
 * footer.js — pie de página global (<site-footer>).
 *
 * Contacto, redes y enlaces según docs/ESPECIFICACION.md (footer / menú
 * secundario). Los datos de contacto son PLACEHOLDERS explícitos: no
 * hay datos institucionales reales en la especificación todavía.
 */

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "#",
    path: '<path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.7c0-.87.24-1.46 1.5-1.46h1.6V4.56A21.6 21.6 0 0 0 14.3 4.4c-2.24 0-3.77 1.37-3.77 3.88v2.22H8v3h2.53V21h3Z" fill="currentColor" />',
  },
  {
    label: "Instagram",
    href: "#",
    path: '<path d="M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Zm0 6.1a2.35 2.35 0 1 1 0-4.7 2.35 2.35 0 0 1 0 4.7Z" fill="currentColor" /><path fill-rule="evenodd" clip-rule="evenodd" d="M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Zm0 1.5A1.5 1.5 0 0 0 5.5 7v10A1.5 1.5 0 0 0 7 18.5h10a1.5 1.5 0 0 0 1.5-1.5V7A1.5 1.5 0 0 0 17 5.5H7Z" fill="currentColor" /><circle cx="16.2" cy="7.8" r="0.9" fill="currentColor" />',
  },
  {
    label: "YouTube",
    href: "#",
    path: '<path fill-rule="evenodd" clip-rule="evenodd" d="M21.6 8.2a2.5 2.5 0 0 0-1.76-1.77C18.2 6 12 6 12 6s-6.2 0-7.84.43A2.5 2.5 0 0 0 2.4 8.2 26.4 26.4 0 0 0 2 12a26.4 26.4 0 0 0 .4 3.8 2.5 2.5 0 0 0 1.76 1.77C5.8 18 12 18 12 18s6.2 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26.4 26.4 0 0 0 22 12a26.4 26.4 0 0 0-.4-3.8ZM10 14.6V9.4l5.2 2.6-5.2 2.6Z" fill="currentColor" />',
  },
  {
    label: "X (Twitter)",
    href: "#",
    path: '<path d="m4 4 6.6 8.55L4.2 20H6l5.5-6.35L15.9 20H20l-6.9-8.94L19.1 4h-1.8l-5.1 5.87L8.1 4H4Zm2.6 1.4h1.9l9 11.7h-1.9l-9-11.7Z" fill="currentColor" />',
  },
];

const LEGAL_LINKS = [
  { label: "Preguntas Frecuentes (FAQ)", href: "pages/faq.html" },
  { label: "Política de privacidad", href: "pages/privacidad.html" },
  { label: "Términos y condiciones", href: "pages/terminos.html" },
];

const EXTERNAL_LINKS = [
  { label: "Matrícula", href: "#" },
  { label: "Biblioteca", href: "#" },
  { label: "Pagos", href: "#" },
];

class SiteFooter extends HTMLElement {
  connectedCallback() {
    const base = window.getBasePath ? window.getBasePath() : "";
    const year = new Date().getFullYear();

    this.innerHTML = `
      <footer class="w-full bg-primary text-onPrimary">
        <div class="page-container grid gap-10 section-y-sm sm:grid-cols-2 lg:grid-cols-4">
          <div class="flex flex-col gap-3">
            <a href="${base}index.html" class="flex items-center gap-2" aria-label="Ir a inicio">
              <img src="${base}assets/img/facultad/logo_facultad.jpg" alt="" class="h-9 w-9 shrink-0 rounded-lg bg-onPrimary object-contain p-0.5" />
              <span class="font-heading text-sm font-semibold text-onPrimary">Facultad de Administración</span>
            </a>
            <p class="text-sm text-onPrimary/70">
              Universidad Nacional Micaela Bastidas de Apurímac (UNAMBA).
              Formando profesionales en gestión y administración.
            </p>
            <img src="${base}assets/img/facultad/logo_universidad.jpg" alt="Universidad Nacional Micaela Bastidas de Apurímac" class="mt-1 h-14 w-14 rounded-full bg-onPrimary object-contain p-0.5" />
          </div>

          <div>
            <h2 class="font-heading text-sm font-semibold text-onPrimary">Enlaces</h2>
            <ul class="mt-4 space-y-2">
              ${LEGAL_LINKS.map(
                (link) => `
                <li><a href="${base}${link.href}" class="text-sm text-onPrimary transition hover:text-accent">${link.label}</a></li>`
              ).join("")}
            </ul>
          </div>

          <div>
            <h2 class="font-heading text-sm font-semibold text-onPrimary">Accesos a sistemas</h2>
            <ul class="mt-4 space-y-2">
              ${EXTERNAL_LINKS.map(
                (link) => `
                <li><a href="${link.href}" class="inline-flex items-center gap-1 text-sm text-onPrimary transition hover:text-accent">${link.label} <span aria-hidden="true">↗</span></a></li>`
              ).join("")}
            </ul>
          </div>

          <div>
            <h2 class="font-heading text-sm font-semibold text-onPrimary">Contacto</h2>
            <address class="mt-4 flex flex-col gap-2 text-sm not-italic text-onPrimary/90">
              <span>Av. Universitaria s/n, Abancay – Apurímac <em class="text-onPrimary/60">(dirección de ejemplo)</em></span>
              <a href="mailto:contacto@ejemplo-unamba.edu.pe" class="transition hover:text-accent">contacto@ejemplo-unamba.edu.pe</a>
              <a href="tel:+51900000000" class="transition hover:text-accent">+51 900 000 000</a>
              <span>Lun. a vie., 8:00 a.m. – 4:00 p.m. <em class="text-onPrimary/60">(ejemplo)</em></span>
            </address>
            <div class="mt-4 flex gap-2">
              ${SOCIAL_LINKS.map(
                (social) => `
                <a
                  href="${social.href}"
                  aria-label="${social.label}"
                  class="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-onPrimary transition hover:bg-accent hover:text-primary-dark"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">${social.path}</svg>
                </a>`
              ).join("")}
            </div>
          </div>
        </div>

        <div class="border-t border-white/15">
          <div class="page-container flex flex-col items-center gap-2 py-6 text-center text-xs text-onPrimary/70 sm:flex-row sm:justify-between sm:text-left">
            <p>© ${year} Facultad de Administración — UNAMBA. Todos los derechos reservados.</p>
            <p class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-end">
              <span>Mockup de diseño, contenido de ejemplo.</span>
              <a href="${base}pages/admin/login.html" class="text-onPrimary/75 transition hover:text-accent">Acceso administrativo</a>
            </p>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define("site-footer", SiteFooter);
