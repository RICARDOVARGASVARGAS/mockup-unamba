/**
 * usuarios-form.js — alta/edición Usuario (admin, coordinador, receptor).
 */
(function () {
  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  const MAX_FOTO_BYTES = 2 * 1024 * 1024;

  const ROLES_ALL = [
    { id: "rol-1", nombre: "Administrador" },
    { id: "rol-2", nombre: "Docente-Tutor" },
    { id: "rol-3", nombre: "Estudiante" },
    { id: "rol-4", nombre: "Coordinador de tutoría" },
    { id: "rol-5", nombre: "Psicólogo" },
    { id: "rol-6", nombre: "Servicios médicos" },
    { id: "rol-7", nombre: "Trabajo social" },
  ];

  function selectedRoles(form) {
    return [...form.querySelectorAll('[name="roles"]:checked')].map((el) => el.value);
  }

  function fillRoles(container, selectedIds) {
    const selected = new Set(selectedIds || []);
    container.innerHTML = ROLES_ALL.map(
      (rol) => `
      <label class="flex items-center gap-2 rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-text">
        <input type="checkbox" name="roles" value="${rol.id}" ${selected.has(rol.id) ? "checked" : ""} class="h-4 w-4 rounded border-border text-primary" />
        <span>${CatalogTable.escapeHtml(rol.nombre)}</span>
      </label>`
    ).join("");
  }

  function fillTiposDocumento(select, currentId) {
    const tipos = window.TiposDocumentoData
      ? TiposDocumentoData.activos()
      : [{ id: "td-1", nombre: "DNI" }];
    select.innerHTML =
      `<option value="">Seleccionar…</option>` +
      tipos
        .map(
          (t) =>
            `<option value="${CatalogTable.escapeHtml(t.id)}" ${t.id === currentId ? "selected" : ""}>${CatalogTable.escapeHtml(t.nombre)}</option>`
        )
        .join("");
  }

  function syncActivoToggle(activo) {
    const toggle = document.getElementById("usr-activo-toggle");
    const checkbox = document.getElementById("usr-activo");
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
    const fileInput = document.getElementById("usr-foto-file");
    const hidden = document.getElementById("usr-foto");
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
    "70001001": { nombres: "Paola", apellido_paterno: "Huanca", apellido_materno: "Ramos", sexo: "F", fecha_nacimiento: "1991-03-17" },
    "70001002": { nombres: "José Luis", apellido_paterno: "Mendoza", apellido_materno: "Apaza", sexo: "M", fecha_nacimiento: "1985-08-25" },
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
    const row = UsuariosData.load().find((r) => String(r.documento).trim() === doc);
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
    document.getElementById("usr-nombres").value = person.nombres || "";
    document.getElementById("usr-apaterno").value = person.apellido_paterno || "";
    document.getElementById("usr-amaterno").value = person.apellido_materno || "";
    document.getElementById("usr-fnac").value = person.fecha_nacimiento || "";
    if (person.sexo) document.getElementById("usr-sexo").value = person.sexo;
  }

  function bindReniecSearch(tipoSelect) {
    const btn = document.querySelector("[data-reniec-buscar]");
    const docInput = document.getElementById("usr-documento");
    if (!btn || !docInput) return;

    const run = async () => {
      const documento = docInput.value.trim();
      if (!documento) {
        toast("Ingresa el número de documento", "warning");
        docInput.focus();
        return;
      }
      const clave = (window.TiposDocumentoData && TiposDocumentoData.clave(tipoSelect.value)) || "";
      if (clave && clave !== "DNI") {
        toast("La consulta RENIEC del mockup aplica solo a DNI", "warning");
        return;
      }
      setReniecLoading(btn, true);
      await new Promise((resolve) => setTimeout(resolve, 1100));
      const person = lookupReniecMock(documento);
      setReniecLoading(btn, false);
      if (!person) { toast("No se encontró", "warning"); return; }
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
      if (e.key === "Enter") { e.preventDefault(); btn.click(); }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("[data-usuario-form]");
    if (!form || !window.UsuariosData) return;

    UsuariosData.ready()
      .then(() => initForm(form))
      .catch((err) => {
        console.error(err);
        toast("No se pudieron cargar los datos.", "danger");
      });
  });

  function initForm(form) {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("id");
    const existing = editId ? UsuariosData.findById(editId) : null;
    const isEdit = Boolean(existing);

    const title = document.querySelector("[data-form-page-title]");
    const rolesBox = document.querySelector("[data-roles-checklist]");
    const tipoSelect = document.getElementById("usr-tipo-documento");
    const activoToggle = document.getElementById("usr-activo-toggle");

    if (title) title.textContent = isEdit ? "Editar usuario" : "Nuevo usuario";

    fillRoles(rolesBox, isEdit ? existing.rolIds : []);
    fillTiposDocumento(tipoSelect, isEdit ? existing.tipo_documento_id : "td-1");
    bindReniecSearch(tipoSelect);
    bindFotoUpload(isEdit ? existing.foto_perfil_url : "");

    activoToggle.addEventListener("click", () => {
      syncActivoToggle(!document.getElementById("usr-activo").checked);
    });

    if (isEdit) {
      document.getElementById("usr-documento").value = existing.documento || "";
      document.getElementById("usr-nombres").value = existing.nombres || "";
      document.getElementById("usr-apaterno").value = existing.apellido_paterno || "";
      document.getElementById("usr-amaterno").value = existing.apellido_materno || "";
      document.getElementById("usr-sexo").value = existing.sexo || "";
      document.getElementById("usr-fnac").value = existing.fecha_nacimiento || "";
      document.getElementById("usr-email").value = existing.email || "";
      document.getElementById("usr-email-personal").value = existing.email_personal || "";
      document.getElementById("usr-cel-principal").value = existing.celular_principal || "";
      document.getElementById("usr-cel-secundario").value = existing.celular_secundario || "";
      syncActivoToggle(existing.activo !== false);
    } else {
      syncActivoToggle(true);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const rolIds = selectedRoles(form);
      if (!rolIds.length) {
        toast("Asigna al menos un rol", "warning");
        return;
      }

      const row = {
        id: isEdit ? existing.id : `usr-${Date.now()}`,
        tipo_documento_id: tipoSelect.value,
        documento: document.getElementById("usr-documento").value.trim(),
        nombres: document.getElementById("usr-nombres").value.trim(),
        apellido_paterno: document.getElementById("usr-apaterno").value.trim(),
        apellido_materno: document.getElementById("usr-amaterno").value.trim(),
        sexo: document.getElementById("usr-sexo").value,
        fecha_nacimiento: document.getElementById("usr-fnac").value,
        email: document.getElementById("usr-email").value.trim(),
        email_personal: document.getElementById("usr-email-personal").value.trim(),
        celular_principal: document.getElementById("usr-cel-principal").value.trim(),
        celular_secundario: document.getElementById("usr-cel-secundario").value.trim(),
        foto_perfil_url: document.getElementById("usr-foto").value,
        activo: document.getElementById("usr-activo").checked,
        rolIds,
      };

      if (!row.tipo_documento_id || !row.documento || !row.nombres || !row.apellido_paterno || !row.apellido_materno || !row.email) {
        toast("Completa los campos obligatorios", "warning");
        return;
      }

      const others = UsuariosData.load().filter((r) => r.id !== row.id);
      if (others.some((r) => r.tipo_documento_id === row.tipo_documento_id && String(r.documento).trim() === row.documento)) {
        toast("Ya existe un usuario con ese tipo y número de documento", "warning");
        return;
      }
      if (others.some((r) => String(r.email).toLowerCase() === row.email.toLowerCase())) {
        toast("Ya existe un usuario con ese correo de acceso", "warning");
        return;
      }

      UsuariosData.upsert(row);
      if (window.AuditoriaData) {
        AuditoriaData.log({
          accion: isEdit ? "editar" : "crear",
          tabla_afectada: "usuario",
          registro_id: row.id,
          valores_anteriores: isEdit ? existing : null,
          valores_nuevos: row,
        });
      }
      window.location.href = isEdit ? "usuarios.html?saved=updated" : "usuarios.html?saved=created";
    });
  }
})();
