/**
 * estudiantes-ver.js — ficha de solo lectura del estudiante (DISEÑO-FRONTEND.md).
 */
(function () {
  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function dash(value) {
    const v = String(value ?? "").trim();
    return v || "—";
  }

  function sexoLabel(sexo) {
    if (sexo === "F") return "Femenino";
    if (sexo === "M") return "Masculino";
    if (sexo === "N") return "No especificado";
    return "—";
  }

  function calcEdad(iso) {
    if (!iso) return null;
    const d = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
    return age >= 0 ? age : null;
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function formatDateTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return formatDate(String(iso).slice(0, 10));
    return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  }

  function setHtml(selector, html) {
    const el = document.querySelector(selector);
    if (el) el.innerHTML = html;
  }

  function docLabel(row) {
    const clave =
      (window.TiposDocumentoData && TiposDocumentoData.clave(row.tipo_documento_id)) || "";
    return `${clave ? `${clave} ` : ""}${row.documento || ""}`.trim() || "—";
  }

  function orcidLink(code) {
    const v = (code || "").trim();
    if (!v) return "—";
    return `<a href="https://orcid.org/${esc(v)}" target="_blank" rel="noopener noreferrer">${esc(v)} <span aria-hidden="true">↗</span></a>`;
  }

  function estadoAcademicoBadge(estado) {
    if (estado === "egresado") {
      return '<span class="badge badge-neutral"><span aria-hidden="true">○</span> Egresado</span>';
    }
    if (estado === "retirado") {
      return '<span class="badge badge-neutral"><span aria-hidden="true">○</span> Retirado</span>';
    }
    return '<span class="badge badge-success"><span aria-hidden="true">●</span> Activo</span>';
  }

  function renderHistorial(row) {
    const hist = EstudiantesData.historialTutoria(row.id);
    const statsEl = document.querySelector("[data-ficha-historial-stats]");
    const body = document.querySelector("[data-ficha-historial-body]");
    const wrap = document.querySelector("[data-ficha-historial-wrap]");
    const empty = document.querySelector("[data-ficha-historial-empty]");
    if (!statsEl || !body) return;

    statsEl.innerHTML = `
      <div class="ficha-actividad-stat">
        <span class="ficha-actividad-stat-value">${esc(hist.periodos_cursados)}</span>
        <span class="ficha-actividad-stat-label">períodos cursados</span>
      </div>
      <div class="ficha-actividad-stat">
        <span class="ficha-actividad-stat-value">${esc(hist.ciclo_actual)}</span>
        <span class="ficha-actividad-stat-label">ciclo actual</span>
      </div>
      <div class="ficha-actividad-stat">
        <span class="ficha-actividad-stat-value" style="font-size:var(--text-sm);line-height:1.3">${esc(hist.tutor_actual)}</span>
        <span class="ficha-actividad-stat-label">tutor actual</span>
      </div>`;

    const rows = hist.por_periodo || [];
    if (!rows.length) {
      wrap?.classList.add("hidden");
      empty?.classList.remove("hidden");
      return;
    }

    empty?.classList.add("hidden");
    wrap?.classList.remove("hidden");
    body.innerHTML = rows
      .map(
        (r) => `
      <tr>
        <td class="font-medium text-text">${esc(r.periodo)}</td>
        <td><span class="badge badge-neutral">${esc(r.ciclo)}</span></td>
        <td class="text-text">${esc(r.tutor)}</td>
      </tr>`
      )
      .join("");
  }

  function bindActions(row) {
    const edit = document.querySelector("[data-ficha-editar]");
    if (edit) edit.href = `estudiantes-form.html?id=${encodeURIComponent(row.id)}`;

    document.querySelector("[data-ficha-password]")?.addEventListener("click", () => {
      const nombre = EstudiantesData.nombreCompleto(row);
      const doc = docLabel(row);
      AppConfirm.request({
        title: "Restablecer contraseña",
        confirmLabel: "Restablecer",
        cancelLabel: "Cancelar",
        variant: "warning",
        messageHtml: `
          <p><span class="font-medium text-text">Estudiante:</span> ${esc(nombre)}</p>
          <p><span class="font-medium text-text">Documento:</span> ${esc(doc)}</p>
          <p class="pt-1">La nueva contraseña será el número de documento:
            <strong class="text-text font-semibold">${esc(row.documento || "—")}</strong>
          </p>
          <p class="rounded-md border border-warning/30 bg-warning-bg px-3 py-2 text-warning">
            La contraseña actual dejará de funcionar. El estudiante deberá cambiarla al ingresar.
          </p>`,
      }).then((ok) => {
        if (!ok) return;
        if (window.AuditoriaData) {
          AuditoriaData.log({
            accion: "restablecer_contraseña",
            tabla_afectada: "estudiante",
            registro_id: row.id,
            valores_anteriores: null,
            valores_nuevos: { documento: row.documento || null },
          });
        }
        toast("Contraseña restablecida");
      });
    });

    document.querySelector("[data-ficha-auditoria]")?.addEventListener("click", () => {
      const detail = {
        tabla: "estudiante",
        registroId: row.id,
        titulo: EstudiantesData.nombreCompleto(row),
      };
      if (window.AppHistorial) AppHistorial.open(detail);
      else document.dispatchEvent(new CustomEvent("app:historial-open", { detail }));
    });
  }

  function render(row) {
    const name = EstudiantesData.nombreCompleto(row);
    const codigo = row.codigo_universitario || "—";
    const src = EstudiantesData.resolveFotoUrl(EstudiantesData.fotoSrc(row));
    const edad = calcEdad(row.fecha_nacimiento);
    const fnac =
      row.fecha_nacimiento
        ? `${formatDate(row.fecha_nacimiento)}${edad != null ? ` (${edad})` : ""}`
        : "—";

    document.title = `${name} | TutorTrack (Mockup)`;

    setHtml(
      "[data-ficha-avatar]",
      `<img src="${esc(src)}" alt="Foto de ${esc(name)}" width="96" height="96" />`
    );
    setHtml("[data-ficha-estado]", estadoAcademicoBadge(row.estado));
    setText("[data-ficha-nombre]", name);
    setText("[data-ficha-ids]", `${docLabel(row)} · Código ${codigo}`);
    setText("[data-ficha-sexo]", sexoLabel(row.sexo));
    setText("[data-ficha-fnac]", fnac);
    setText("[data-ficha-email]", dash(row.email));
    setText("[data-ficha-email-personal]", dash(row.email_personal));
    setText("[data-ficha-cel1]", dash(row.celular_principal));
    setText("[data-ficha-cel2]", dash(row.celular_secundario));
    setText(
      "[data-ficha-acceso]",
      row.activo !== false ? "Activo (puede iniciar sesión)" : "Inactivo (sin acceso)"
    );
    setText("[data-ficha-codigo]", dash(codigo));
    setHtml("[data-ficha-orcid]", orcidLink(row.codigo_orcid));

    const roles = row.roles || [];
    setHtml(
      "[data-ficha-roles]",
      roles.length
        ? `<ul class="ficha-roles" role="list">${roles
            .map(
              (id) =>
                `<li class="ficha-role-chip">${esc(EstudiantesData.rolNombre(id))}</li>`
            )
            .join("")}</ul>`
        : '<p class="ficha-roles-empty">Sin roles asignados</p>'
    );

    setText(
      "[data-ficha-meta]",
      `Registrado: ${formatDateTime(row.created_at)}  ·  Última actualización: ${formatDateTime(row.updated_at)}`
    );

    renderHistorial(row);
    bindActions(row);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const id = new URLSearchParams(window.location.search).get("id");
    const ficha = document.querySelector("[data-ficha]");
    const empty = document.querySelector("[data-ficha-empty]");
    if (!window.EstudiantesData) return;

    EstudiantesData.ready()
      .then(() => {
        const row = id ? EstudiantesData.findById(id) : null;
        if (!row) {
          ficha?.classList.add("hidden");
          empty?.classList.remove("hidden");
          toast("Estudiante no encontrado", "warning");
          return;
        }
        render(row);
      })
      .catch((err) => {
        console.error(err);
        ficha?.classList.add("hidden");
        empty?.classList.remove("hidden");
        toast("No se pudo cargar la ficha", "danger");
      });
  });
})();
