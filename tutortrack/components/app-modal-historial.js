/**
 * app-modal-historial.js — historial de auditoría por registro (<app-modal-historial>).
 * Muestra quién / cuándo / acción y tabla campo · antes · ahora
 * (valores_anteriores / valores_nuevos según docs/BD-BACKEND.md).
 */
(function () {
  const FIELD_LABELS = {
    nombre: "Nombre",
    abreviatura: "Abreviatura",
    orden: "N° de orden",
    activo: "Estado",
    clave: "Clave",
    grupo: "Grupo",
    ambito: "Ámbito",
    fase: "Fase",
    uso: "Uso",
    modulo: "Módulo",
    requiere_opciones: "Requiere opciones",
    inicio: "Fecha inicio",
    fin: "Fecha fin",
    nombres: "Nombres",
    apellido_paterno: "Apellido paterno",
    apellido_materno: "Apellido materno",
    documento: "Documento",
    tipo_documento_id: "Tipo de documento",
    email: "Correo de acceso",
    email_personal: "Correo personal",
    celular_principal: "Celular principal",
    celular_secundario: "Celular secundario",
    sexo: "Sexo",
    fecha_nacimiento: "Fecha de nacimiento",
    codigo_universitario: "Código universitario",
    codigo_orcid: "ORCID",
    grado_academico_id: "Grado académico",
    especialidad_id: "Especialidad",
    cv_url: "URL del CV",
    biografia: "Biografía",
    foto_perfil_url: "Foto de perfil",
    roles: "Roles",
    permisoIds: "Permisos",
  };

  const HIDDEN_KEYS = new Set(["id", "usuario_id", "created_at", "updated_at", "deleted_at"]);

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("es-PE", {
      weekday: "short",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function fieldLabel(key) {
    return FIELD_LABELS[key] || key.replace(/_/g, " ");
  }

  function formatValue(key, value) {
    if (value == null || value === "") return "—";
    if (typeof value === "boolean") {
      if (key === "activo") return value ? "Activo" : "Inactivo";
      if (key === "requiere_opciones") return value ? "Sí" : "No";
      return value ? "Sí" : "No";
    }
    if (Array.isArray(value)) {
      return value.length ? value.join(", ") : "—";
    }
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch (_) {
        return String(value);
      }
    }
    if (key === "foto_perfil_url") {
      const s = String(value);
      if (s.startsWith("data:")) return "(imagen cargada)";
      return s.split("/").pop() || s;
    }
    return String(value);
  }

  function sameValue(a, b) {
    return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
  }

  /** Diff campo a campo entre valores_anteriores y valores_nuevos. */
  function buildDiffRows(accion, anteriores, nuevos) {
    const before = anteriores && typeof anteriores === "object" ? anteriores : {};
    const after = nuevos && typeof nuevos === "object" ? nuevos : {};
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])]
      .filter((k) => !HIDDEN_KEYS.has(k))
      .sort((a, b) => fieldLabel(a).localeCompare(fieldLabel(b), "es"));

    if (accion === "crear") {
      return keys
        .filter((k) => after[k] != null && after[k] !== "")
        .map((k) => ({
          campo: fieldLabel(k),
          antes: "—",
          ahora: formatValue(k, after[k]),
          changed: true,
        }));
    }

    if (accion === "eliminar") {
      return keys
        .filter((k) => before[k] != null && before[k] !== "")
        .map((k) => ({
          campo: fieldLabel(k),
          antes: formatValue(k, before[k]),
          ahora: "—",
          changed: true,
        }));
    }

    /* editar / restablecer / otros: solo campos que cambiaron; si no hay pares, mostrar ambos lados */
    const changed = keys.filter((k) => !sameValue(before[k], after[k]));
    const useKeys = changed.length ? changed : keys;
    return useKeys.map((k) => ({
      campo: fieldLabel(k),
      antes: formatValue(k, before[k]),
      ahora: formatValue(k, after[k]),
      changed: !sameValue(before[k], after[k]),
    }));
  }

  function badgeClass(accion) {
    if (accion === "crear") return "badge badge-success";
    if (accion === "eliminar") return "badge badge-danger";
    if (accion === "restablecer_contraseña") return "badge badge-warning";
    return "badge badge-info";
  }

  function renderDiffTable(rows) {
    if (!rows.length) {
      return `<p class="historial-empty-diff">Sin detalle de campos en este evento.</p>`;
    }
    return `
      <div class="historial-diff-wrap">
        <table class="historial-diff">
          <thead>
            <tr>
              <th scope="col">Campo</th>
              <th scope="col">Antes</th>
              <th scope="col">Ahora</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (r) => `
              <tr class="${r.changed ? "is-changed" : ""}">
                <th scope="row">${esc(r.campo)}</th>
                <td><span class="historial-val historial-val-before">${esc(r.antes)}</span></td>
                <td><span class="historial-val historial-val-after">${esc(r.ahora)}</span></td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`;
  }

  function renderEvent(r) {
    const accion = r.accion || "";
    const badge = esc(AuditoriaData.accionLabel(accion));
    const who = esc(r.usuario_nombre || "Sistema");
    const when = esc(formatDate(r.created_at));
    const diff = buildDiffRows(accion, r.valores_anteriores, r.valores_nuevos);

    return `
      <li class="historial-item">
        <div class="historial-item-head">
          <span class="${badgeClass(accion)}">${badge}</span>
          <time class="historial-time" datetime="${esc(r.created_at || "")}">${when}</time>
        </div>
        <dl class="historial-meta-grid">
          <div>
            <dt>Quién</dt>
            <dd>${who}</dd>
          </div>
          <div>
            <dt>Cuándo</dt>
            <dd>${when}</dd>
          </div>
          ${
            r.ip
              ? `<div>
            <dt>IP</dt>
            <dd>${esc(r.ip)}</dd>
          </div>`
              : ""
          }
          ${
            r.url
              ? `<div>
            <dt>URL</dt>
            <dd class="historial-url">${esc(r.url)}</dd>
          </div>`
              : ""
          }
        </dl>
        ${renderDiffTable(diff)}
      </li>`;
  }

  class AppModalHistorial extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div data-backdrop class="fixed inset-0 z-50 hidden items-center justify-center bg-black/50 p-4">
          <div
            data-panel
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-historial-title"
            class="historial-modal flex max-h-[min(92vh,44rem)] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-border bg-bg shadow-md"
          >
            <div class="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div class="min-w-0">
                <h2 id="modal-historial-title" data-title class="font-heading text-lg font-semibold text-text">Historial de cambios</h2>
                <p data-subtitle class="mt-0.5 text-sm text-text-muted"></p>
              </div>
              <button type="button" data-close class="btn-ghost btn-icon shrink-0" title="Cerrar" aria-label="Cerrar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div data-list class="historial-list flex-1 overflow-y-auto px-5 py-4"></div>
          </div>
        </div>
      `;
      this.init();
      window.AppHistorial = {
        open: (opts) => this.open(opts || {}),
      };
    }

    open({ tabla, registroId, titulo }) {
      if (!window.AuditoriaData || !tabla || registroId == null) return;
      const rows = AuditoriaData.listByRegistro(tabla, registroId);
      this.querySelector("[data-title]").textContent = "Historial de cambios";
      this.querySelector("[data-subtitle]").textContent = titulo
        ? `${titulo}`
        : `Registro ${registroId}`;

      const list = this.querySelector("[data-list]");
      if (!rows.length) {
        list.innerHTML = `
          <div class="historial-empty">
            <p class="historial-empty-title">Sin cambios registrados</p>
            <p class="historial-empty-text">Este registro aún no tiene eventos en la bitácora de auditoría.</p>
          </div>`;
      } else {
        list.innerHTML = `<ol class="historial-timeline">${rows.map(renderEvent).join("")}</ol>`;
      }

      const backdrop = this.querySelector("[data-backdrop]");
      backdrop.classList.remove("hidden");
      backdrop.classList.add("flex");
    }

    close() {
      const backdrop = this.querySelector("[data-backdrop]");
      backdrop.classList.add("hidden");
      backdrop.classList.remove("flex");
    }

    init() {
      const backdrop = this.querySelector("[data-backdrop]");
      this.querySelector("[data-close]").addEventListener("click", () => this.close());
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) this.close();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !backdrop.classList.contains("hidden")) this.close();
      });
      document.addEventListener("app:historial-open", (e) => this.open(e.detail || {}));
    }
  }

  customElements.define("app-modal-historial", AppModalHistorial);
})();
