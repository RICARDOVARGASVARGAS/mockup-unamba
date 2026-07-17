/**
 * docentes-ver.js — ficha de solo lectura del docente.
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
    return "—";
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
  }

  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  }

  function setHtml(selector, html) {
    const el = document.querySelector(selector);
    if (el) el.innerHTML = html;
  }

  function render(row) {
    const name = DocentesData.nombreCompleto(row);
    const nameUpper = name.toLocaleUpperCase("es-PE");
    const grado = DocentesData.gradoNombre(row.grado_academico_id);
    const esp = DocentesData.especialidadNombre(row.especialidad_id);
    const clave =
      (window.TiposDocumentoData && TiposDocumentoData.clave(row.tipo_documento_id)) || "";
    const src = DocentesData.resolveFotoUrl(DocentesData.fotoSrc(row));

    document.title = `${name} | TutorTrack (Mockup)`;

    setHtml(
      "[data-ficha-avatar]",
      `<img src="${esc(src)}" alt="Foto de ${esc(name)}" width="112" height="112" />`
    );
    setHtml(
      "[data-ficha-estado]",
      row.activo !== false
        ? '<span class="badge badge-success">Activo</span>'
        : '<span class="badge badge-neutral">Inactivo</span>'
    );
    setText("[data-ficha-nombre]", nameUpper);
    setText("[data-ficha-grado]", grado || "Sin grado académico");
    setText("[data-ficha-especialidad]", esp ? `Especialidad · ${esp}` : "Sin especialidad registrada");

    setText(
      "[data-ficha-documento]",
      clave || row.documento ? `${clave ? `${clave} ` : ""}${row.documento || ""}`.trim() : "—"
    );
    setText("[data-ficha-sexo]", sexoLabel(row.sexo));
    setText("[data-ficha-fnac]", formatDate(row.fecha_nacimiento));
    setText("[data-ficha-email]", dash(row.email));
    setText("[data-ficha-email-personal]", dash(row.email_personal));
    setText("[data-ficha-cel1]", dash(row.celular_principal));
    setText("[data-ficha-cel2]", dash(row.celular_secundario));
    setText("[data-ficha-grado-full]", dash(grado));
    setText("[data-ficha-esp-full]", dash(esp));
    setText("[data-ficha-orcid]", dash(row.codigo_orcid));

    const cvEl = document.querySelector("[data-ficha-cv]");
    if (cvEl) {
      const cv = (row.cv_url || "").trim();
      cvEl.innerHTML = cv
        ? `<a href="${esc(cv)}" target="_blank" rel="noopener noreferrer">Abrir CV</a>`
        : "—";
    }

    const bio = (row.biografia || "").trim();
    setText("[data-ficha-bio]", bio || "Sin biografía registrada.");

    const roles = row.roles || [];
    setHtml(
      "[data-ficha-roles]",
      roles.length
        ? `<ul class="ficha-roles" role="list">${roles
            .map(
              (id) =>
                `<li class="ficha-role-chip">${esc(DocentesData.rolNombre(id))}</li>`
            )
            .join("")}</ul>`
        : '<p class="ficha-roles-empty">Sin roles asignados</p>'
    );

    const edit = document.querySelector("[data-ficha-editar]");
    if (edit) edit.href = `docentes-form.html?id=${encodeURIComponent(row.id)}`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const id = new URLSearchParams(window.location.search).get("id");
    const ficha = document.querySelector("[data-ficha]");
    const empty = document.querySelector("[data-ficha-empty]");
    if (!window.DocentesData) return;

    DocentesData.ready()
      .then(() => {
        const row = id ? DocentesData.findById(id) : null;
        if (!row) {
          ficha?.classList.add("hidden");
          empty?.classList.remove("hidden");
          toast("Docente no encontrado", "warning");
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
