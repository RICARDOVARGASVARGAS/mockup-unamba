/**
 * estudiantes-form.js — alta/edición Estudiante (usuario + perfil).
 * Campos según docs/BD-BACKEND.md y docs/MOCKUP-PANTALLAS.md § Pantalla 5.
 */
(function () {
  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  const MAX_FOTO_BYTES = 2 * 1024 * 1024;

  function fillSelect(select, options, current, emptyLabel) {
    select.innerHTML = `<option value="">${CatalogTable.escapeHtml(emptyLabel)}</option>${options
      .map(
        (opt) =>
          `<option value="${CatalogTable.escapeHtml(opt.id || opt.value)}" ${(opt.id || opt.value) === current ? "selected" : ""}>${CatalogTable.escapeHtml(opt.nombre || opt.label)}</option>`
      )
      .join("")}`;
  }

  function fillTiposDocumento(select, currentId) {
    const tipos = window.TiposDocumentoData
      ? TiposDocumentoData.activos()
      : [{ id: "td-1", nombre: "DNI" }];
    fillSelect(select, tipos, currentId || "td-1", "Seleccionar…");
  }

  function syncActivoToggle(activo) {
    const toggle = document.getElementById("est-activo-toggle");
    const checkbox = document.getElementById("est-activo");
    if (!toggle || !checkbox) return;
    checkbox.checked = !!activo;
    toggle.setAttribute("aria-checked", activo ? "true" : "false");
  }

  function resolveFotoSrc(url) {
    if (!url) return "";
    if (url.startsWith("data:") || url.startsWith("blob:") || /^https?:\/\//i.test(url)) return url;
    return `../../${url.replace(/^\.\.\//, "")}`;
  }

  function bindFotoUpload(initialUrl) {
    const fileInput = document.getElementById("est-foto-file");
    const hidden = document.getElementById("est-foto");
    const trigger = document.querySelector("[data-foto-trigger]");
    const preview = document.querySelector("[data-foto-preview]");
    const empty = document.querySelector("[data-foto-empty]");
    const btnQuitar = document.querySelector("[data-foto-quitar]");
    if (!fileInput || !hidden || !trigger || !preview || !empty) return;

    function setFoto(url) {
      hidden.value = url || "";
      const has = Boolean(url);
      trigger.setAttribute("data-has-photo", has ? "true" : "false");
      trigger.setAttribute("aria-label", has ? "Foto de perfil" : "Subir foto de perfil");
      if (has) {
        preview.src = resolveFotoSrc(url);
        preview.classList.remove("hidden");
        empty.classList.add("hidden");
        btnQuitar?.classList.remove("hidden");
      } else {
        preview.removeAttribute("src");
        preview.classList.add("hidden");
        empty.classList.remove("hidden");
        btnQuitar?.classList.add("hidden");
        fileInput.value = "";
      }
    }

    trigger.addEventListener("click", () => {
      if (hidden.value) return;
      fileInput.click();
    });

    btnQuitar?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setFoto("");
    });

    fileInput.addEventListener("change", () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast("Selecciona una imagen (JPG o PNG)", "warning");
        fileInput.value = "";
        return;
      }
      if (file.size > MAX_FOTO_BYTES) {
        toast("La imagen no debe superar 2 MB", "warning");
        fileInput.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setFoto(String(reader.result || ""));
      reader.onerror = () => toast("No se pudo leer la imagen", "danger");
      reader.readAsDataURL(file);
    });

    setFoto(initialUrl || "");
  }

  const RENIEC_EXTRA = {
    "78000001": {
      nombres: "Patricia",
      apellido_paterno: "López",
      apellido_materno: "Quispe",
      sexo: "F",
      fecha_nacimiento: "2003-08-15",
    },
    "78000002": {
      nombres: "Andrés",
      apellido_paterno: "Medina",
      apellido_materno: "Castro",
      sexo: "M",
      fecha_nacimiento: "2002-03-22",
    },
  };

  function setReniecLoading(btn, loading) {
    const icon = btn.querySelector("[data-reniec-icon]");
    const spinner = btn.querySelector("[data-reniec-spinner]");
    btn.disabled = loading;
    btn.setAttribute("aria-busy", loading ? "true" : "false");
    icon?.classList.toggle("hidden", loading);
    spinner?.classList.toggle("hidden", !loading);
  }

  function lookupReniecMock(documento) {
    const doc = String(documento || "").trim();
    if (!doc) return null;
    if (RENIEC_EXTRA[doc]) return { ...RENIEC_EXTRA[doc] };
    const row = EstudiantesData.load().find((r) => String(r.documento).trim() === doc);
    if (!row) return null;
    return {
      nombres: row.nombres || "",
      apellido_paterno: row.apellido_paterno || "",
      apellido_materno: row.apellido_materno || "",
      sexo: row.sexo || "",
      fecha_nacimiento: row.fecha_nacimiento || "",
    };
  }

  function applyReniecResult(person) {
    document.getElementById("est-nombres").value = person.nombres || "";
    document.getElementById("est-apaterno").value = person.apellido_paterno || "";
    document.getElementById("est-amaterno").value = person.apellido_materno || "";
    document.getElementById("est-fnac").value = person.fecha_nacimiento || "";
    if (person.sexo) document.getElementById("est-sexo").value = person.sexo;
  }

  function bindReniecSearch(tipoSelect) {
    const btn = document.querySelector("[data-reniec-buscar]");
    const docInput = document.getElementById("est-documento");
    if (!btn || !docInput) return;

    const run = async () => {
      const documento = docInput.value.trim();
      if (!documento) {
        toast("Ingresa el número de documento", "warning");
        docInput.focus();
        return;
      }

      const tipoId = tipoSelect.value;
      const clave =
        (window.TiposDocumentoData && TiposDocumentoData.clave(tipoId)) || "";
      if (clave && clave !== "DNI") {
        toast("La consulta RENIEC del mockup aplica solo a DNI", "warning");
        return;
      }

      setReniecLoading(btn, true);
      await new Promise((resolve) => setTimeout(resolve, 1100));
      const person = lookupReniecMock(documento);
      setReniecLoading(btn, false);

      if (!person) {
        toast("No se encontró", "warning");
        return;
      }

      applyReniecResult(person);
      toast("Datos cargados desde RENIEC (simulado)");
    };

    btn.addEventListener("click", () => {
      run().catch((err) => {
        console.error(err);
        setReniecLoading(btn, false);
        toast("Error al consultar RENIEC", "danger");
      });
    });

    docInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        btn.click();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("[data-estudiante-form]");
    if (!form || !window.EstudiantesData) return;

    EstudiantesData.ready()
      .then(() => initForm(form))
      .catch((err) => {
        console.error(err);
        toast("No se pudieron cargar los estudiantes de prueba.", "danger");
      });
  });

  function initForm(form) {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("id");
    const existing = editId ? EstudiantesData.findById(editId) : null;
    const isEdit = Boolean(existing);

    const title = document.querySelector("[data-form-page-title]");
    const tipoSelect = document.getElementById("est-tipo-documento");
    const activoToggle = document.getElementById("est-activo-toggle");

    if (title) title.textContent = isEdit ? "Editar estudiante" : "Nuevo estudiante";

    fillTiposDocumento(tipoSelect, isEdit ? existing.tipo_documento_id : "td-1");
    bindReniecSearch(tipoSelect);
    bindFotoUpload(isEdit ? existing.foto_perfil_url : "");

    activoToggle.addEventListener("click", () => {
      syncActivoToggle(!document.getElementById("est-activo").checked);
    });

    if (isEdit) {
      document.getElementById("est-documento").value = existing.documento || "";
      document.getElementById("est-nombres").value = existing.nombres || "";
      document.getElementById("est-apaterno").value = existing.apellido_paterno || "";
      document.getElementById("est-amaterno").value = existing.apellido_materno || "";
      document.getElementById("est-sexo").value = existing.sexo || "";
      document.getElementById("est-fnac").value = existing.fecha_nacimiento || "";
      document.getElementById("est-email").value = existing.email || "";
      document.getElementById("est-email-personal").value = existing.email_personal || "";
      document.getElementById("est-cel-principal").value = existing.celular_principal || "";
      document.getElementById("est-cel-secundario").value = existing.celular_secundario || "";
      document.getElementById("est-codigo").value = existing.codigo_universitario || "";
      document.getElementById("est-orcid").value = existing.codigo_orcid || "";
      syncActivoToggle(existing.activo !== false);
    } else {
      syncActivoToggle(true);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const row = {
        id: isEdit ? existing.id : `est-${Date.now()}`,
        tipo_documento_id: tipoSelect.value,
        documento: document.getElementById("est-documento").value.trim(),
        nombres: document.getElementById("est-nombres").value.trim(),
        apellido_paterno: document.getElementById("est-apaterno").value.trim(),
        apellido_materno: document.getElementById("est-amaterno").value.trim(),
        sexo: document.getElementById("est-sexo").value,
        fecha_nacimiento: document.getElementById("est-fnac").value,
        email: document.getElementById("est-email").value.trim(),
        email_personal: document.getElementById("est-email-personal").value.trim(),
        celular_principal: document.getElementById("est-cel-principal").value.trim(),
        celular_secundario: document.getElementById("est-cel-secundario").value.trim(),
        foto_perfil_url: document.getElementById("est-foto").value,
        activo: document.getElementById("est-activo").checked,
        codigo_universitario: document.getElementById("est-codigo").value.trim(),
        codigo_orcid: document.getElementById("est-orcid").value.trim(),
      };

      if (
        !row.tipo_documento_id ||
        !row.documento ||
        !row.nombres ||
        !row.apellido_paterno ||
        !row.apellido_materno ||
        !row.email ||
        !row.codigo_universitario
      ) {
        toast("Completa los campos obligatorios", "warning");
        return;
      }

      const others = EstudiantesData.load().filter((r) => r.id !== row.id);
      if (
        others.some(
          (r) =>
            r.tipo_documento_id === row.tipo_documento_id &&
            String(r.documento).trim() === row.documento
        )
      ) {
        toast("Ya existe un usuario con ese tipo y número de documento", "warning");
        return;
      }
      if (others.some((r) => String(r.email).toLowerCase() === row.email.toLowerCase())) {
        toast("Ya existe un usuario con ese correo de acceso", "warning");
        return;
      }
      if (
        others.some(
          (r) =>
            String(r.codigo_universitario).toLowerCase() === row.codigo_universitario.toLowerCase()
        )
      ) {
        toast("Ya existe un estudiante con ese código universitario", "warning");
        return;
      }

      EstudiantesData.upsert(row);
      if (window.AuditoriaData) {
        AuditoriaData.log({
          accion: isEdit ? "editar" : "crear",
          tabla_afectada: "estudiante",
          registro_id: row.id,
          valores_anteriores: isEdit ? existing : null,
          valores_nuevos: row,
        });
      }
      window.location.href = isEdit
        ? "estudiantes.html?saved=updated"
        : "estudiantes.html?saved=created";
    });
  }
})();
