/**
 * usuarios-ver.js — ficha identidad maestra + bloque Perfiles (Agregar / Quitar).
 */
(function () {
  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  const TIPOS = ["docente", "estudiante", "receptor"];

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

  function perfilStore(tipo) {
    if (tipo === "docente") return window.DocentesData || null;
    if (tipo === "estudiante") return window.EstudiantesData || null;
    if (tipo === "receptor") return window.ReceptoresData || null;
    return null;
  }

  function quitarPerfil(row, tipo) {
    const label = UsuariosData.PERFIL_LABEL[tipo] || tipo;
    const perfilId = row.perfiles?.[tipo];
    const store = perfilStore(tipo);

    if (!perfilId || !store) {
      UsuariosData.unlinkPerfil(row.id, tipo);
      toast("Perfil quitado");
      return Promise.resolve(true);
    }

    const tieneHist =
      typeof store.tieneHistorial === "function" ? store.tieneHistorial(perfilId) : false;

    if (tieneHist) {
      return AppConfirm.request({
        title: `No se puede quitar el perfil`,
        confirmLabel: `Desactivar ${label.toLowerCase()}`,
        cancelLabel: "Cancelar",
        variant: "primary",
        messageHtml: `
          <p>El perfil de <strong class="text-text">${esc(label)}</strong> tiene historial de negocio.</p>
          <p class="pt-1">No se quita: se desactiva el perfil. La identidad permanece intacta.</p>`,
      }).then((ok) => {
        if (!ok) return false;
        if (typeof store.setActivo === "function") store.setActivo(perfilId, false);
        toast(`Perfil de ${label.toLowerCase()} desactivado`);
        return true;
      });
    }

    let extra = "";
    if (tipo === "receptor" && typeof store.esUnicoActivoDeEntidad === "function") {
      if (store.esUnicoActivoDeEntidad(perfilId)) {
        const rec = store.findById(perfilId);
        const entidad =
          (typeof store.entidadNombre === "function" &&
            store.entidadNombre(rec?.entidad_receptora_id)) ||
          "su entidad";
        extra = `<p class="rounded-md border border-warning/30 bg-warning-bg px-3 py-2 text-warning mt-2">
          Es el único receptor activo de <strong>${esc(entidad)}</strong>.
        </p>`;
      }
    }

    return AppConfirm.request({
      title: "Quitar perfil",
      confirmLabel: "Quitar perfil",
      cancelLabel: "Cancelar",
      variant: "danger",
      messageHtml: `
        <p>¿Quitar el perfil de <strong class="text-text">${esc(label)}</strong> de esta identidad?</p>
        <p>Se eliminará el perfil (soft delete). La persona y sus roles quedan intactos.</p>
        ${extra}`,
    }).then((ok) => {
      if (!ok) return false;
      store.remove(perfilId);
      UsuariosData.unlinkPerfil(row.id, tipo);
      toast("Perfil quitado");
      return true;
    });
  }

  function agregarPerfil(row, tipo) {
    const label = UsuariosData.PERFIL_LABEL[tipo] || tipo;
    return AppConfirm.request({
      title: "Agregar perfil",
      confirmLabel: `Continuar`,
      cancelLabel: "Cancelar",
      variant: "primary",
      messageHtml: `
        <p>Se abrirá el formulario de <strong class="text-text">${esc(label)}</strong> con la identidad de
        <strong class="text-text">${esc(UsuariosData.nombreCompleto(row))}</strong> precargada (solo lectura).</p>
        <p class="pt-1">Solo completarás los datos del perfil. No se duplicará la persona.</p>`,
    }).then((ok) => {
      if (!ok) return false;
      const form = UsuariosData.stashForPerfil(row.id, tipo);
      if (!form) {
        toast("No se pudo preparar el formulario", "danger");
        return false;
      }
      window.location.href = `${form}?from_usuario=1`;
      return true;
    });
  }

  function renderPerfiles(row) {
    const list = document.querySelector("[data-ficha-perfiles]");
    if (!list) return;
    list.innerHTML = TIPOS.map((tipo) => {
      const tiene = UsuariosData.tienePerfil(row, tipo);
      const label = UsuariosData.PERFIL_LABEL[tipo] || tipo;
      const perfilId = row.perfiles?.[tipo];
      const verHref = perfilId
        ? `${UsuariosData.PERFIL_VER[tipo]}?id=${encodeURIComponent(perfilId)}`
        : "#";
      const status = tiene
        ? `<span class="text-success font-medium" aria-hidden="true">✓</span>`
        : `<span class="text-text-muted" aria-hidden="true">○</span>`;
      const actions = tiene
        ? `
          <div class="flex flex-wrap gap-2">
            <a href="${esc(verHref)}" class="btn-secondary inline-flex text-sm">Ver ficha →</a>
            <button type="button" class="btn-secondary inline-flex text-sm" data-quitar-perfil="${esc(tipo)}">Quitar perfil</button>
          </div>`
        : `<button type="button" class="btn-primary inline-flex text-sm" data-agregar-perfil="${esc(tipo)}">+ Agregar perfil</button>`;
      return `
        <li class="flex flex-col gap-3 rounded-md border border-border bg-bg px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-2 font-medium text-text">
            ${status}
            <span>${esc(label)}</span>
          </div>
          ${actions}
        </li>`;
    }).join("");

    list.querySelectorAll("[data-agregar-perfil]").forEach((btn) => {
      btn.addEventListener("click", () => {
        agregarPerfil(row, btn.getAttribute("data-agregar-perfil"));
      });
    });
    list.querySelectorAll("[data-quitar-perfil]").forEach((btn) => {
      btn.addEventListener("click", () => {
        quitarPerfil(row, btn.getAttribute("data-quitar-perfil")).then((ok) => {
          if (!ok) return;
          const fresh = UsuariosData.findById(row.id);
          if (fresh) renderAll(fresh);
        });
      });
    });
  }

  function bindActions(row) {
    const edit = document.querySelector("[data-ficha-editar]");
    if (edit) edit.href = `usuarios-form.html?id=${encodeURIComponent(row.id)}`;

    const gestionar = document.querySelector("[data-ficha-gestionar-roles]");
    if (gestionar) gestionar.href = `usuarios-form.html?id=${encodeURIComponent(row.id)}#roles`;

    document.querySelector("[data-ficha-password]")?.addEventListener("click", () => {
      const nombre = UsuariosData.nombreCompleto(row);
      const doc = docLabel(row);
      AppConfirm.request({
        title: "Restablecer contraseña",
        confirmLabel: "Restablecer",
        cancelLabel: "Cancelar",
        variant: "warning",
        messageHtml: `
          <p><span class="font-medium text-text">Usuario:</span> ${esc(nombre)}</p>
          <p><span class="font-medium text-text">Documento:</span> ${esc(doc)}</p>
          <p class="pt-1">La nueva contraseña será el número de documento:
            <strong class="text-text font-semibold">${esc(row.documento || "—")}</strong>
          </p>`,
      }).then((ok) => {
        if (ok) toast("Contraseña restablecida");
      });
    });

    document.querySelector("[data-ficha-auditoria]")?.addEventListener("click", () => {
      const detail = {
        tabla: "usuario",
        registroId: row.id,
        titulo: UsuariosData.nombreCompleto(row),
      };
      if (window.AppHistorial) AppHistorial.open(detail);
      else document.dispatchEvent(new CustomEvent("app:historial-open", { detail }));
    });
  }

  function renderAll(row) {
    const src = UsuariosData.resolveFotoUrl(UsuariosData.fotoSrc(row));
    setHtml(
      "[data-ficha-avatar]",
      `<img src="${esc(src)}" alt="" class="h-full w-full object-cover" width="96" height="96" />`
    );
    setText("[data-ficha-nombre]", UsuariosData.nombreCompleto(row));
    setText("[data-ficha-ids]", `${docLabel(row)} · ${row.email || "Sin correo"}`);
    setHtml(
      "[data-ficha-estado]",
      row.activo !== false
        ? '<span class="badge badge-success"><span aria-hidden="true">●</span> Activo</span>'
        : '<span class="badge badge-neutral"><span aria-hidden="true">○</span> Inactivo</span>'
    );

    setText("[data-ficha-sexo]", sexoLabel(row.sexo));
    const edad = calcEdad(row.fecha_nacimiento);
    setText(
      "[data-ficha-fnac]",
      row.fecha_nacimiento
        ? `${formatDate(row.fecha_nacimiento)}${edad != null ? ` (${edad} años)` : ""}`
        : "—"
    );
    setText("[data-ficha-email]", dash(row.email));
    setText("[data-ficha-email-personal]", dash(row.email_personal));
    setText("[data-ficha-cel1]", dash(row.celular_principal));
    setText("[data-ficha-cel2]", dash(row.celular_secundario));

    const roles = UsuariosData.rolesLabel(row.roles || row.rolIds);
    setHtml(
      "[data-ficha-roles]",
      roles.length
        ? `<div class="flex flex-wrap gap-1">${roles
            .map((l) => `<span class="badge badge-neutral">${esc(l)}</span>`)
            .join("")}</div>`
        : `<p class="ficha-roles-empty">Sin roles asignados.</p>`
    );

    renderPerfiles(row);

    setText(
      "[data-ficha-meta]",
      `Registrado: ${formatDateTime(row.created_at)} · Última actualización: ${formatDateTime(row.updated_at)}`
    );
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.UsuariosData) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const saved = params.get("saved");

    if (saved === "perfil") {
      const tipo = params.get("perfil") || "docente";
      const label = (UsuariosData.PERFIL_LABEL[tipo] || tipo).toLowerCase();
      toast(`Perfil de ${label} agregado`);
    } else if (saved === "updated") {
      toast("Usuario actualizado");
    }
    if (saved) {
      params.delete("saved");
      params.delete("perfil");
      const clean = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
      window.history.replaceState({}, "", clean);
    }

    const showEmpty = () => {
      document.querySelector("[data-ficha]")?.classList.add("hidden");
      document.querySelector("[data-ficha-empty]")?.classList.remove("hidden");
    };

    UsuariosData.ready()
      .then(() => {
        const row = id ? UsuariosData.findById(id) : null;
        if (!row) {
          showEmpty();
          return;
        }
        const readyStores = [
          window.DocentesData?.ready?.(),
          window.EstudiantesData?.ready?.(),
          window.ReceptoresData?.ready?.(),
        ].filter(Boolean);
        return Promise.all(readyStores).then(() => {
          renderAll(row);
          bindActions(row);
        });
      })
      .catch((err) => {
        console.error(err);
        showEmpty();
        toast("Error al cargar el usuario", "danger");
      });
  });
})();
