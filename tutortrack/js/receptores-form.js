/**
 * receptores-form.js — alta/edición Receptor (usuario + receptor + roles).
 */
(function () {
  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  const MAX_FOTO_BYTES = 2 * 1024 * 1024;

  function selectedRoles(form) {
    return [...form.querySelectorAll('[name="roles"]:checked')].map((el) => el.value);
  }

  function fillRoles(container, selectedIds) {
    const selected = new Set(selectedIds || []);
    const roles = ReceptoresData.rolesActivos();
    container.innerHTML = roles
      .map(
        (rol) => `
      <label class="flex items-center gap-2 rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-text">
        <input type="checkbox" name="roles" value="${rol.id}" ${selected.has(rol.id) ? "checked" : ""} class="h-4 w-4 rounded border-border text-primary" />
        <span>${CatalogTable.escapeHtml(rol.nombre)}</span>
      </label>`
      )
      .join("");
  }

  function fillSelect(select, options, current, emptyLabel) {
    select.innerHTML = `<option value="">${CatalogTable.escapeHtml(emptyLabel)}</option>${options
      .map(
        (opt) =>
          `<option value="${CatalogTable.escapeHtml(opt.id)}" ${opt.id === current ? "selected" : ""}>${CatalogTable.escapeHtml(opt.nombre)}</option>`
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
    const toggle = document.getElementById("rec-activo-toggle");
    const checkbox = document.getElementById("rec-activo");
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
    const fileInput = document.getElementById("rec-foto-file");
    const hidden = document.getElementById("rec-foto");
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
    "79000001": {
      nombres: "Lucía",
      apellido_paterno: "Paredes",
      apellido_materno: "Gutierrez",
      sexo: "F",
      fecha_nacimiento: "1991-05-20",
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
    const row = ReceptoresData.load().find((r) => String(r.documento).trim() === doc);
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
    document.getElementById("rec-nombres").value = person.nombres || "";
    document.getElementById("rec-apaterno").value = person.apellido_paterno || "";
    document.getElementById("rec-amaterno").value = person.apellido_materno || "";
    document.getElementById("rec-fnac").value = person.fecha_nacimiento || "";
    if (person.sexo) document.getElementById("rec-sexo").value = person.sexo;
  }

  function bindReniecSearch(tipoSelect) {
    const btn = document.querySelector("[data-reniec-buscar]");
    const docInput = document.getElementById("rec-documento");
    if (!btn || !docInput) return;

    const run = async () => {
      const documento = docInput.value.trim();
      if (!documento) {
        toast("Ingresa el número de documento", "warning");
        docInput.focus();
        return;
      }
      const clave =
        (window.TiposDocumentoData && TiposDocumentoData.clave(tipoSelect.value)) || "";
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
    const form = document.querySelector("[data-receptor-form]");
    if (!form || !window.ReceptoresData) return;
    ReceptoresData.ready()
      .then(() => initForm(form))
      .catch((err) => {
        console.error(err);
        toast("No se pudieron cargar los receptores de prueba.", "danger");
      });
  });

  function initForm(form) {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("id");
    const existing = editId ? ReceptoresData.findById(editId) : null;
    const isEdit = Boolean(existing);
    const fromUsuario =
      params.get("from_usuario") === "1" && window.UsuariosData
        ? UsuariosData.consumeStashForPerfil()
        : null;
    const fromUsuarioId = fromUsuario?.usuario_id || null;

    const title = document.querySelector("[data-form-page-title]");
    const rolesBox = document.querySelector("[data-roles-checklist]");
    const tipoSelect = document.getElementById("rec-tipo-documento");
    const entidadSelect = document.getElementById("rec-entidad");
    const activoToggle = document.getElementById("rec-activo-toggle");
    const backLink = document.querySelector('a[href="receptores.html"]');

    if (title) {
      title.textContent = isEdit
        ? "Editar receptor"
        : fromUsuario
          ? "Agregar perfil de receptor"
          : "Nuevo receptor";
    }

    if (fromUsuario && backLink) {
      backLink.href = `usuarios-ver.html?id=${encodeURIComponent(fromUsuarioId)}`;
      backLink.textContent = "← Volver a la ficha";
    }
    document.querySelectorAll('a.btn-secondary[href="receptores.html"]').forEach((a) => {
      if (!fromUsuarioId) return;
      a.href = `usuarios-ver.html?id=${encodeURIComponent(fromUsuarioId)}`;
    });

    document.querySelector("[data-password-note]")?.classList.toggle("hidden", isEdit || Boolean(fromUsuario));
    const emailHint = document.querySelector("[data-email-hint]");
    if (emailHint) {
      emailHint.textContent = isEdit
        ? "Es el login. Cámbialo con cuidado: el receptor usará este correo para ingresar."
        : fromUsuario
          ? "Identidad reutilizada — solo lectura. Completa la entidad receptora abajo."
          : "Login institucional (único). No se define contraseña a mano.";
    }

    fillRoles(rolesBox, isEdit ? existing.roles : ["rol-5"]);
    fillTiposDocumento(tipoSelect, isEdit ? existing.tipo_documento_id : fromUsuario?.tipo_documento_id || "td-1");
    fillSelect(
      entidadSelect,
      ReceptoresData.entidadesActivas(),
      isEdit ? existing.entidad_receptora_id : "",
      "Seleccionar…"
    );
    bindReniecSearch(tipoSelect);
    bindFotoUpload(isEdit ? existing.foto_perfil_url : fromUsuario?.foto_perfil_url || "");

    activoToggle.addEventListener("click", () => {
      syncActivoToggle(!document.getElementById("rec-activo").checked);
    });

    if (isEdit) {
      document.getElementById("rec-documento").value = existing.documento || "";
      document.getElementById("rec-nombres").value = existing.nombres || "";
      document.getElementById("rec-apaterno").value = existing.apellido_paterno || "";
      document.getElementById("rec-amaterno").value = existing.apellido_materno || "";
      document.getElementById("rec-sexo").value = existing.sexo || "";
      document.getElementById("rec-fnac").value = existing.fecha_nacimiento || "";
      document.getElementById("rec-email").value = existing.email || "";
      document.getElementById("rec-email-personal").value = existing.email_personal || "";
      document.getElementById("rec-cel-principal").value = existing.celular_principal || "";
      document.getElementById("rec-cel-secundario").value = existing.celular_secundario || "";
      syncActivoToggle(existing.activo !== false);
    } else if (fromUsuario) {
      document.getElementById("rec-documento").value = fromUsuario.documento || "";
      document.getElementById("rec-nombres").value = fromUsuario.nombres || "";
      document.getElementById("rec-apaterno").value = fromUsuario.apellido_paterno || "";
      document.getElementById("rec-amaterno").value = fromUsuario.apellido_materno || "";
      document.getElementById("rec-sexo").value = fromUsuario.sexo || "";
      document.getElementById("rec-fnac").value = fromUsuario.fecha_nacimiento || "";
      document.getElementById("rec-email").value = fromUsuario.email || "";
      document.getElementById("rec-email-personal").value = fromUsuario.email_personal || "";
      document.getElementById("rec-cel-principal").value = fromUsuario.celular_principal || "";
      document.getElementById("rec-cel-secundario").value = fromUsuario.celular_secundario || "";
      syncActivoToggle(fromUsuario.activo !== false);
      [
        "rec-tipo-documento",
        "rec-documento",
        "rec-nombres",
        "rec-apaterno",
        "rec-amaterno",
        "rec-sexo",
        "rec-fnac",
        "rec-email",
        "rec-email-personal",
        "rec-cel-principal",
        "rec-cel-secundario",
      ].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.readOnly = el.tagName === "INPUT";
        if (el.tagName === "SELECT") el.disabled = true;
        el.classList.add("opacity-80");
      });
      document.querySelector("[data-reniec-buscar]")?.setAttribute("disabled", "true");
      document.querySelector("[data-foto-trigger]")?.setAttribute("disabled", "true");
      document.querySelector("[data-foto-quitar]")?.classList.add("hidden");
      activoToggle.setAttribute("disabled", "true");
      if (rolesBox) rolesBox.classList.add("pointer-events-none", "opacity-80");
    } else {
      syncActivoToggle(true);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const roles = selectedRoles(form);
      if (!roles.length) {
        toast("Asigna al menos un rol", "warning");
        return;
      }

      const row = {
        id: isEdit ? existing.id : `rec-${Date.now()}`,
        tipo_documento_id: fromUsuario ? fromUsuario.tipo_documento_id : tipoSelect.value,
        documento: document.getElementById("rec-documento").value.trim(),
        nombres: document.getElementById("rec-nombres").value.trim(),
        apellido_paterno: document.getElementById("rec-apaterno").value.trim(),
        apellido_materno: document.getElementById("rec-amaterno").value.trim(),
        sexo: document.getElementById("rec-sexo").value,
        fecha_nacimiento: document.getElementById("rec-fnac").value,
        email: document.getElementById("rec-email").value.trim(),
        email_personal: document.getElementById("rec-email-personal").value.trim(),
        celular_principal: document.getElementById("rec-cel-principal").value.trim(),
        celular_secundario: document.getElementById("rec-cel-secundario").value.trim(),
        foto_perfil_url: document.getElementById("rec-foto").value,
        activo: document.getElementById("rec-activo").checked,
        entidad_receptora_id: entidadSelect.value,
        created_at: isEdit ? existing.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        roles,
      };

      const tipoClave =
        (window.TiposDocumentoData && TiposDocumentoData.clave(row.tipo_documento_id)) || "";
      if (tipoClave === "DNI" && !/^\d{8}$/.test(row.documento)) {
        toast("El DNI debe tener 8 dígitos", "warning");
        return;
      }

      if (
        !row.tipo_documento_id ||
        !row.documento ||
        !row.nombres ||
        !row.apellido_paterno ||
        !row.apellido_materno ||
        !row.email ||
        !row.entidad_receptora_id
      ) {
        toast("Completa los campos obligatorios", "warning");
        return;
      }

      const others = ReceptoresData.load().filter((r) => r.id !== row.id);
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

      ReceptoresData.upsert(row);
      if (fromUsuarioId && window.UsuariosData) {
        UsuariosData.linkPerfil(fromUsuarioId, "receptor", row.id);
      }
      if (window.AuditoriaData) {
        AuditoriaData.log({
          accion: isEdit ? "editar" : "crear",
          tabla_afectada: "receptor",
          registro_id: row.id,
          valores_anteriores: isEdit ? existing : null,
          valores_nuevos: row,
        });
      }
      if (fromUsuarioId) {
        window.location.href = `usuarios-ver.html?id=${encodeURIComponent(fromUsuarioId)}&saved=perfil&perfil=receptor`;
        return;
      }
      window.location.href = isEdit
        ? "receptores.html?saved=updated"
        : "receptores.html?saved=created";
    });
  }
})();
