/**
 * estudiantes-form.js — alta/edición Estudiante (usuario + perfil + roles).
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
    const roles =
      typeof EstudiantesData.rolesActivos === "function"
        ? EstudiantesData.rolesActivos()
        : EstudiantesData.ROLES;
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

    const boot = () =>
      Promise.all([
        EstudiantesData.ready(),
        window.ApoderadosData ? ApoderadosData.ready() : Promise.resolve(),
      ]);

    boot()
      .then(() => initForm(form))
      .catch((err) => {
        console.error(err);
        toast("No se pudieron cargar los estudiantes de prueba.", "danger");
      });
  });

  function docClave(tipoId) {
    return (window.TiposDocumentoData && TiposDocumentoData.clave(tipoId)) || "";
  }

  function formatDoc(tipoId, documento) {
    const clave = docClave(tipoId);
    return `${clave ? `${clave} ` : ""}${documento || ""}`.trim() || "—";
  }

  function fillParentescoSelect(select, current) {
    const opts = window.ApoderadosData ? ApoderadosData.PARENTESCOS : [];
    select.innerHTML = opts
      .map(
        (p) =>
          `<option value="${CatalogTable.escapeHtml(p.id)}" ${p.id === current ? "selected" : ""}>${CatalogTable.escapeHtml(p.nombre)}</option>`
      )
      .join("");
  }

  /**
   * Sección 4 · Apoderados — modal buscar/reutilizar + listado con link/unlink/updateVinculo.
   * En alta se usa un id provisional para poder vincular antes de guardar el estudiante.
   */
  function bindApoderados(estudianteId) {
    if (!window.ApoderadosData) return { estudianteId };

    const listEl = document.querySelector("[data-apoderados-list]");
    const emptyEl = document.querySelector("[data-apoderados-empty]");
    const backdrop = document.getElementById("modal-apoderado-backdrop");
    const btnAdd = document.querySelector("[data-apoderado-agregar]");
    const btnBuscar = document.querySelector("[data-apo-buscar]");
    const btnCancel = document.querySelector("[data-apo-cancelar]");
    const btnSave = document.querySelector("[data-apo-guardar]");
    const stepBuscar = document.querySelector("[data-apo-step-buscar]");
    const stepDatos = document.querySelector("[data-apo-step-datos]");
    const reusedBanner = document.querySelector("[data-apo-reused-banner]");
    const titleEl = document.getElementById("modal-apoderado-title");
    const hintEl = document.querySelector("[data-apo-modal-hint]");
    const tipoSelect = document.getElementById("apo-tipo-documento");
    const docInput = document.getElementById("apo-documento");
    const fields = {
      nombres: document.getElementById("apo-nombres"),
      apaterno: document.getElementById("apo-apaterno"),
      amaterno: document.getElementById("apo-amaterno"),
      cel1: document.getElementById("apo-cel1"),
      cel2: document.getElementById("apo-cel2"),
      email: document.getElementById("apo-email"),
      ocupacion: document.getElementById("apo-ocupacion"),
      direccion: document.getElementById("apo-direccion"),
      parentesco: document.getElementById("apo-parentesco"),
      principal: document.getElementById("apo-principal"),
    };

    let mode = "add"; // add | edit
    let editApoderadoId = null;
    let reusedApoderado = null;
    let identityLocked = false;

    const identityInputs = [
      tipoSelect,
      docInput,
      fields.nombres,
      fields.apaterno,
      fields.amaterno,
      fields.cel1,
      fields.cel2,
      fields.email,
      fields.ocupacion,
      fields.direccion,
    ];

    function setIdentityLocked(locked) {
      identityLocked = locked;
      identityInputs.forEach((el) => {
        if (!el) return;
        if (el.tagName === "SELECT") el.disabled = locked;
        else el.readOnly = locked;
        el.classList.toggle("opacity-80", locked);
      });
      reusedBanner?.classList.toggle("hidden", !locked);
    }

    function fillIdentity(ap) {
      if (tipoSelect) fillTiposDocumento(tipoSelect, ap?.tipo_documento_id || "td-1");
      if (docInput) docInput.value = ap?.documento || "";
      fields.nombres.value = ap?.nombres || "";
      fields.apaterno.value = ap?.apellido_paterno || "";
      fields.amaterno.value = ap?.apellido_materno || "";
      fields.cel1.value = ap?.celular_principal || "";
      fields.cel2.value = ap?.celular_secundario || "";
      fields.email.value = ap?.email || "";
      fields.ocupacion.value = ap?.ocupacion || "";
      fields.direccion.value = ap?.direccion || "";
    }

    function readApoderadoPayload() {
      return {
        tipo_documento_id: tipoSelect.value,
        documento: docInput.value.trim(),
        nombres: fields.nombres.value.trim(),
        apellido_paterno: fields.apaterno.value.trim(),
        apellido_materno: fields.amaterno.value.trim(),
        celular_principal: fields.cel1.value.trim(),
        celular_secundario: fields.cel2.value.trim(),
        email: fields.email.value.trim(),
        ocupacion: fields.ocupacion.value.trim(),
        direccion: fields.direccion.value.trim(),
      };
    }

    function openModal(opts) {
      mode = opts.mode || "add";
      editApoderadoId = opts.apoderadoId || null;
      reusedApoderado = null;
      fillParentescoSelect(fields.parentesco, opts.parentesco || "padre");
      fields.principal.checked = !!opts.es_principal;
      fillIdentity(opts.apoderado || null);
      setIdentityLocked(false);

      if (titleEl) {
        titleEl.textContent = mode === "edit" ? "Editar apoderado" : "Agregar apoderado";
      }
      if (hintEl) {
        hintEl.textContent =
          mode === "edit"
            ? "Puedes actualizar el vínculo (parentesco / principal) y los datos de contacto."
            : "Busca por documento. Si ya existe, se reutiliza.";
      }

      stepBuscar?.classList.toggle("hidden", mode === "edit");
      stepDatos?.classList.toggle("hidden", mode !== "edit");
      btnSave?.classList.toggle("hidden", mode !== "edit");
      if (mode === "edit") {
        tipoSelect.disabled = true;
        docInput.readOnly = true;
        tipoSelect.classList.add("opacity-80");
        docInput.classList.add("opacity-80");
      }

      backdrop?.classList.remove("hidden");
      backdrop?.classList.add("flex");
      (mode === "edit" ? fields.parentesco : docInput)?.focus();
    }

    function closeModal() {
      backdrop?.classList.add("hidden");
      backdrop?.classList.remove("flex");
    }

    function showDatosStep(found) {
      reusedApoderado = found;
      setIdentityLocked(!!found);
      if (found) fillIdentity(found);
      stepDatos?.classList.remove("hidden");
      btnSave?.classList.remove("hidden");
      fields.parentesco?.focus();
    }

    function renderList() {
      const rows = ApoderadosData.listByEstudiante(estudianteId);
      if (!listEl || !emptyEl) return;
      emptyEl.classList.toggle("hidden", rows.length > 0);
      listEl.innerHTML = rows
        .map((ap) => {
          const nombre = ApoderadosData.nombreCompleto(ap);
          const parentesco = ApoderadosData.parentescoLabel(ap.parentesco);
          const contacto = ap.celular_principal || ap.email || "—";
          const badge = ap.es_principal
            ? '<span class="badge badge-accent">Principal</span>'
            : "";
          return `
          <article class="rounded-md border border-border bg-bg px-4 py-3" data-apoderado-card data-apoderado-id="${CatalogTable.escapeHtml(ap.id)}">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="font-medium text-text">${CatalogTable.escapeHtml(nombre)}</p>
                  ${badge}
                </div>
                <p class="mt-0.5 text-sm text-text-muted">${CatalogTable.escapeHtml(formatDoc(ap.tipo_documento_id, ap.documento))}</p>
                <p class="mt-1 text-sm text-text">${CatalogTable.escapeHtml(parentesco)} · ${CatalogTable.escapeHtml(contacto)}</p>
              </div>
              <div class="flex shrink-0 gap-1">
                <button type="button" class="btn-ghost btn-icon-xs" data-apo-edit title="Editar" aria-label="Editar apoderado">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                  </svg>
                </button>
                <button type="button" class="btn-ghost btn-icon-xs text-danger" data-apo-remove title="Quitar" aria-label="Quitar apoderado">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.033-2.164h-2.934c-1.123 0-2.033.983-2.033 2.164v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          </article>`;
        })
        .join("");
    }

    function runBuscar() {
      const tipoId = tipoSelect.value;
      const documento = docInput.value.trim();
      if (!tipoId || !documento) {
        toast("Ingresa tipo y número de documento", "warning");
        return;
      }
      const clave = docClave(tipoId);
      if (clave === "DNI" && !/^\d{8}$/.test(documento)) {
        toast("El DNI debe tener 8 dígitos", "warning");
        return;
      }
      const already = ApoderadosData.listByEstudiante(estudianteId).some(
        (a) => a.tipo_documento_id === tipoId && String(a.documento).trim() === documento
      );
      if (already) {
        toast("Este apoderado ya está vinculado al estudiante", "warning");
        return;
      }
      const found = ApoderadosData.findByDocumento(tipoId, documento);
      if (!found) {
        fillIdentity({ tipo_documento_id: tipoId, documento });
        showDatosStep(null);
        toast("Documento no registrado — completa los datos", "info");
        return;
      }
      showDatosStep(found);
      toast("Apoderado reutilizado");
    }

    function saveVinculo() {
      const parentesco = fields.parentesco.value;
      const esPrincipal = fields.principal.checked;
      if (!parentesco) {
        toast("Selecciona el parentesco", "warning");
        return;
      }

      if (mode === "edit" && editApoderadoId) {
        const payload = readApoderadoPayload();
        if (!payload.nombres || !payload.apellido_paterno || !payload.apellido_materno) {
          toast("Completa nombres y apellidos", "warning");
          return;
        }
        ApoderadosData.updateVinculo(estudianteId, editApoderadoId, {
          apoderado: {
            nombres: payload.nombres,
            apellido_paterno: payload.apellido_paterno,
            apellido_materno: payload.apellido_materno,
            celular_principal: payload.celular_principal,
            celular_secundario: payload.celular_secundario,
            email: payload.email,
            ocupacion: payload.ocupacion,
            direccion: payload.direccion,
          },
          parentesco,
          es_principal: esPrincipal,
        });
        toast("Vínculo actualizado");
        closeModal();
        renderList();
        return;
      }

      const payload = identityLocked && reusedApoderado
        ? {
            tipo_documento_id: reusedApoderado.tipo_documento_id,
            documento: reusedApoderado.documento,
            nombres: reusedApoderado.nombres,
            apellido_paterno: reusedApoderado.apellido_paterno,
            apellido_materno: reusedApoderado.apellido_materno,
          }
        : readApoderadoPayload();

      if (!payload.tipo_documento_id || !payload.documento) {
        toast("Busca primero por documento", "warning");
        return;
      }
      if (!payload.nombres || !payload.apellido_paterno || !payload.apellido_materno) {
        toast("Completa nombres y apellidos", "warning");
        return;
      }

      const result = ApoderadosData.link(estudianteId, payload, parentesco, esPrincipal);
      const linked = ApoderadosData.listByEstudiante(estudianteId).find(
        (a) => a.id === result.apoderado.id
      );
      if (!linked) {
        toast("No se pudo vincular (¿ya estaba agregado?)", "warning");
        return;
      }
      toast(identityLocked ? "Apoderado vinculado (reutilizado)" : "Apoderado agregado");
      closeModal();
      renderList();
    }

    btnAdd?.addEventListener("click", () => openModal({ mode: "add" }));
    btnCancel?.addEventListener("click", closeModal);
    backdrop?.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });
    btnBuscar?.addEventListener("click", runBuscar);
    docInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        runBuscar();
      }
    });
    btnSave?.addEventListener("click", saveVinculo);

    listEl?.addEventListener("click", (e) => {
      const card = e.target.closest("[data-apoderado-card]");
      if (!card) return;
      const apId = card.getAttribute("data-apoderado-id");
      const row = ApoderadosData.listByEstudiante(estudianteId).find((a) => a.id === apId);
      if (!row) return;

      if (e.target.closest("[data-apo-edit]")) {
        openModal({
          mode: "edit",
          apoderadoId: row.id,
          apoderado: row,
          parentesco: row.parentesco,
          es_principal: row.es_principal,
        });
        return;
      }

      if (e.target.closest("[data-apo-remove]")) {
        const nombre = ApoderadosData.nombreCompleto(row);
        const ask = window.AppConfirm
          ? AppConfirm.request({
              title: "Quitar apoderado",
              confirmLabel: "Quitar",
              cancelLabel: "Cancelar",
              variant: "danger",
              messageHtml: `<p>¿Quitar el vínculo con <strong class="text-text">${CatalogTable.escapeHtml(nombre)}</strong>?</p>
                <p>Si no tiene otros hijos vinculados, también se elimina del catálogo de apoderados.</p>`,
            })
          : Promise.resolve(window.confirm(`¿Quitar a ${nombre}?`));

        ask.then((ok) => {
          if (!ok) return;
          ApoderadosData.unlink(estudianteId, apId);
          toast("Apoderado desvinculado");
          renderList();
        });
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && backdrop && !backdrop.classList.contains("hidden")) closeModal();
    });

    fillTiposDocumento(tipoSelect, "td-1");
    fillParentescoSelect(fields.parentesco, "padre");
    renderList();

    return { estudianteId, renderList };
  }

  function initForm(form) {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("id");
    const existing = editId ? EstudiantesData.findById(editId) : null;
    const isEdit = Boolean(existing);
    const fromUsuario =
      params.get("from_usuario") === "1" && window.UsuariosData
        ? UsuariosData.consumeStashForPerfil()
        : null;
    const fromUsuarioId = fromUsuario?.usuario_id || null;
    /** Id estable para vincular apoderados antes de guardar (alta). */
    const estudianteId = isEdit ? existing.id : `est-${Date.now()}`;

    const title = document.querySelector("[data-form-page-title]");
    const rolesBox = document.querySelector("[data-roles-checklist]");
    const tipoSelect = document.getElementById("est-tipo-documento");
    const activoToggle = document.getElementById("est-activo-toggle");
    const backLink = document.querySelector('a[href="estudiantes.html"]');

    if (title) {
      title.textContent = isEdit
        ? "Editar estudiante"
        : fromUsuario
          ? "Agregar perfil de estudiante"
          : "Nuevo estudiante";
    }

    if (fromUsuario && backLink) {
      backLink.href = `usuarios-ver.html?id=${encodeURIComponent(fromUsuarioId)}`;
      backLink.textContent = "← Volver a la ficha";
    }
    document.querySelectorAll('a.btn-secondary[href="estudiantes.html"]').forEach((a) => {
      if (!fromUsuarioId) return;
      a.href = `usuarios-ver.html?id=${encodeURIComponent(fromUsuarioId)}`;
    });

    const passwordNote = document.querySelector("[data-password-note]");
    if (passwordNote) passwordNote.classList.toggle("hidden", isEdit || Boolean(fromUsuario));

    const emailHint = document.querySelector("[data-email-hint]");
    if (emailHint) {
      emailHint.textContent = isEdit
        ? "Es el login. Cámbialo con cuidado: el estudiante usará este correo para ingresar."
        : fromUsuario
          ? "Identidad reutilizada — solo lectura. Completa los datos de estudiante abajo."
          : "Login institucional (único). No se define contraseña a mano.";
    }

    fillRoles(rolesBox, isEdit ? existing.roles : ["rol-3"]);
    fillTiposDocumento(tipoSelect, isEdit ? existing.tipo_documento_id : fromUsuario?.tipo_documento_id || "td-1");
    bindReniecSearch(tipoSelect);
    bindFotoUpload(isEdit ? existing.foto_perfil_url : fromUsuario?.foto_perfil_url || "");
    bindApoderados(estudianteId);

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
    } else if (fromUsuario) {
      document.getElementById("est-documento").value = fromUsuario.documento || "";
      document.getElementById("est-nombres").value = fromUsuario.nombres || "";
      document.getElementById("est-apaterno").value = fromUsuario.apellido_paterno || "";
      document.getElementById("est-amaterno").value = fromUsuario.apellido_materno || "";
      document.getElementById("est-sexo").value = fromUsuario.sexo || "";
      document.getElementById("est-fnac").value = fromUsuario.fecha_nacimiento || "";
      document.getElementById("est-email").value = fromUsuario.email || "";
      document.getElementById("est-email-personal").value = fromUsuario.email_personal || "";
      document.getElementById("est-cel-principal").value = fromUsuario.celular_principal || "";
      document.getElementById("est-cel-secundario").value = fromUsuario.celular_secundario || "";
      syncActivoToggle(fromUsuario.activo !== false);
      [
        "est-tipo-documento",
        "est-documento",
        "est-nombres",
        "est-apaterno",
        "est-amaterno",
        "est-sexo",
        "est-fnac",
        "est-email",
        "est-email-personal",
        "est-cel-principal",
        "est-cel-secundario",
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
        id: estudianteId,
        tipo_documento_id: fromUsuario ? fromUsuario.tipo_documento_id : tipoSelect.value,
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
        estado: isEdit ? existing.estado || "activo" : "activo",
        codigo_universitario: document.getElementById("est-codigo").value.trim(),
        codigo_orcid: document.getElementById("est-orcid").value.trim(),
        created_at: isEdit ? existing.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        roles,
      };

      const orcid = row.codigo_orcid;
      if (orcid && !/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(orcid)) {
        toast("ORCID debe tener el formato 0000-0000-0000-0000", "warning");
        return;
      }

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
      if (fromUsuarioId && window.UsuariosData) {
        UsuariosData.linkPerfil(fromUsuarioId, "estudiante", row.id);
      }
      if (window.AuditoriaData) {
        AuditoriaData.log({
          accion: isEdit ? "editar" : "crear",
          tabla_afectada: "estudiante",
          registro_id: row.id,
          valores_anteriores: isEdit ? existing : null,
          valores_nuevos: row,
        });
      }
      if (fromUsuarioId) {
        window.location.href = `usuarios-ver.html?id=${encodeURIComponent(fromUsuarioId)}&saved=perfil&perfil=estudiante`;
        return;
      }
      window.location.href = isEdit
        ? "estudiantes.html?saved=updated"
        : "estudiantes.html?saved=created";
    });
  }
})();
