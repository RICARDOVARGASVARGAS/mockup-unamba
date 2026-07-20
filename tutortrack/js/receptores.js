/**
 * receptores.js — listado Admin › Usuarios y acceso › Receptores.
 * Cards Total/Activos/Inactivos (usuario.activo) · columna Entidad · sin Roles.
 * Borrado permitido; aviso si es el único receptor activo de su entidad.
 */
(function () {
  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  const esc = (v) => CatalogTable.escapeHtml(v);

  function mapRows(rows) {
    return rows.map((r) => ({
      ...r,
      nombre_completo: ReceptoresData.nombreCompleto(r),
      email: r.email || "",
      entidad_nombre: ReceptoresData.entidadNombre(r.entidad_receptora_id),
    }));
  }

  function fillEntidadFilter() {
    const select = document.getElementById("filter-entidad");
    if (!select) return;
    const current = select.value;
    select.innerHTML =
      `<option value="">Todas</option>` +
      ReceptoresData.ENTIDADES.map(
        (e) => `<option value="${esc(e.id)}">${esc(e.nombre)}</option>`
      ).join("");
    if (current) select.value = current;
  }

  function renderSummary(allRows) {
    const { total, activos, inactivos } = ReceptoresData.resumenCounts(allRows);
    const set = (sel, n) => {
      const el = document.querySelector(sel);
      if (el) el.textContent = String(n);
    };
    set("[data-summary-total]", total);
    set("[data-summary-activos]", activos);
    set("[data-summary-inactivos]", inactivos);
  }

  function receptorHtml(row, escapeFn) {
    const name = ReceptoresData.nombreCompleto(row);
    const src = ReceptoresData.resolveFotoUrl(ReceptoresData.fotoSrc(row));
    const avatar = `<img src="${escapeFn(src)}" alt="" class="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border" width="40" height="40" />`;
    return `
      <div class="flex min-w-0 items-center gap-3">
        ${avatar}
        <div class="docente-nombre font-medium text-text leading-snug">${escapeFn(name)}</div>
      </div>`;
  }

  function documentoHtml(row, escapeFn) {
    const clave =
      (window.TiposDocumentoData && TiposDocumentoData.clave(row.tipo_documento_id)) || "";
    const num = row.documento || "";
    if (!clave && !num) return `<span class="text-text-muted">—</span>`;
    return `
      <div class="leading-snug">
        ${clave ? `<div class="text-xs font-medium text-text-muted">${escapeFn(clave)}</div>` : ""}
        <div class="font-medium text-text">${escapeFn(num || "—")}</div>
      </div>`;
  }

  function contactoHtml(row, escapeFn) {
    const email = row.email || "";
    const tel = row.celular_principal || "";
    if (!email && !tel) return `<span class="text-text-muted">—</span>`;
    return `
      <div class="min-w-0 leading-snug">
        ${email ? `<div class="truncate text-text">${escapeFn(email)}</div>` : ""}
        ${
          tel
            ? `<div class="text-xs text-text-muted">${escapeFn(tel)}</div>`
            : `<div class="text-xs text-text-muted">Sin celular</div>`
        }
      </div>`;
  }

  function estadoHtml(row) {
    return row.activo !== false
      ? '<span class="badge badge-success"><span aria-hidden="true">●</span> Activo</span>'
      : '<span class="badge badge-neutral"><span aria-hidden="true">○</span> Inactivo</span>';
  }

  function docLabel(row) {
    const clave =
      (window.TiposDocumentoData && TiposDocumentoData.clave(row.tipo_documento_id)) || "";
    return `${clave ? `${clave} ` : ""}${row.documento || ""}`.trim() || "—";
  }

  function resetPasswordPrompt(row) {
    const nombre = ReceptoresData.nombreCompleto(row);
    const doc = docLabel(row);
    const num = row.documento || "—";
    return AppConfirm.request({
      title: "Restablecer contraseña",
      confirmLabel: "Restablecer",
      cancelLabel: "Cancelar",
      variant: "warning",
      messageHtml: `
        <p><span class="font-medium text-text">Receptor:</span> ${esc(nombre)}</p>
        <p><span class="font-medium text-text">Documento:</span> ${esc(doc)}</p>
        <p class="pt-1">La nueva contraseña será el número de documento:
          <strong class="text-text font-semibold">${esc(num)}</strong>
        </p>
        <p class="rounded-md border border-warning/30 bg-warning-bg px-3 py-2 text-warning">
          La contraseña actual dejará de funcionar. El receptor deberá cambiarla al ingresar.
        </p>`,
    });
  }

  function askDelete(row) {
    const nombre = ReceptoresData.nombreCompleto(row);
    const doc = docLabel(row);
    const entidad = ReceptoresData.entidadNombre(row.entidad_receptora_id) || "su entidad";
    const unico = ReceptoresData.esUnicoActivoDeEntidad(row.id);

    const avisoUnico = unico
      ? `<p class="rounded-md border border-warning/30 bg-warning-bg px-3 py-2 text-warning">
          Es el único receptor activo de <strong>${esc(entidad)}</strong>; esa entidad quedaría sin nadie para gestionar derivaciones.
        </p>`
      : "";

    return AppConfirm.request({
      title: "Eliminar receptor",
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      variant: "danger",
      messageHtml: `
        <p>¿Eliminar a <strong class="text-text">${esc(nombre)}</strong> (${esc(doc)})?</p>
        <p>Se eliminará su perfil (soft delete). Las derivaciones de la entidad no se afectan.</p>
        ${avisoUnico}
        <p class="pt-1 text-text-muted">También puedes solo desactivar el acceso desde el menú ⋯.</p>`,
    }).then((ok) => {
      if (!ok) return false;
      ReceptoresData.remove(row.id);
      toast("Receptor eliminado");
      renderSummary(ReceptoresData.load());
      return "deleted";
    });
  }

  function toggleActivo(row) {
    const next = !(row.activo !== false);
    const label = next ? "Activar" : "Desactivar";
    const nombre = ReceptoresData.nombreCompleto(row);
    const unico = !next && ReceptoresData.esUnicoActivoDeEntidad(row.id);
    const entidad = ReceptoresData.entidadNombre(row.entidad_receptora_id) || "su entidad";

    return AppConfirm.request({
      title: `${label} receptor`,
      confirmLabel: label,
      cancelLabel: "Cancelar",
      variant: next ? "primary" : "warning",
      messageHtml: next
        ? `<p>¿Activar a <strong class="text-text">${esc(nombre)}</strong>? Recuperará el acceso al sistema.</p>`
        : `<p>¿Desactivar a <strong class="text-text">${esc(nombre)}</strong>? No podrá iniciar sesión.</p>
           ${
             unico
               ? `<p class="rounded-md border border-warning/30 bg-warning-bg px-3 py-2 text-warning mt-2">
                    Es el único receptor activo de ${esc(entidad)}.
                  </p>`
               : ""
           }`,
    }).then((ok) => {
      if (!ok) return false;
      ReceptoresData.setActivo(row.id, next);
      toast(next ? "Receptor activado" : "Receptor desactivado");
      renderSummary(ReceptoresData.load());
      return next ? "activated" : "deactivated";
    });
  }

  function mountTable(rows) {
    const root = document.querySelector("[data-catalog]");
    if (!root || !window.CatalogTable) return null;

    fillEntidadFilter();
    renderSummary(rows);

    const table = CatalogTable.mount(root, {
      data: mapRows(rows),
      pageSize: 8,
      overflowMenu: true,
      searchKeys: [
        "nombres",
        "apellido_paterno",
        "apellido_materno",
        "nombre_completo",
        "documento",
        "email",
      ],
      filters: [
        {
          id: "entidad",
          getValue: (r) => r.entidad_receptora_id || "",
        },
        {
          id: "estado",
          getValue: (r) => (r.activo !== false ? "activo" : "inactivo"),
        },
      ],
      initialSortKey: "apellido_paterno",
      deleteLabel: (r) => ReceptoresData.nombreCompleto(r),
      historyLabel: (r) => ReceptoresData.nombreCompleto(r),
      columns: [
        {
          key: "_n",
          label: "N°",
          num: true,
          align: "center",
          sortable: false,
          render: (_row, escapeFn, n) => escapeFn(n),
        },
        {
          key: "nombres",
          label: "Receptor",
          primary: true,
          sortValue: (r) => ReceptoresData.nombreCompleto(r).toLowerCase(),
          render: receptorHtml,
        },
        {
          key: "entidad_receptora_id",
          label: "Entidad",
          muted: true,
          sortValue: (r) => (r.entidad_nombre || "").toLowerCase(),
          render: (row, escapeFn) =>
            row.entidad_nombre
              ? escapeFn(row.entidad_nombre)
              : `<span class="text-text-muted">—</span>`,
        },
        {
          key: "documento",
          label: "Documento",
          muted: true,
          sortValue: (r) =>
            `${TiposDocumentoData?.clave(r.tipo_documento_id) || ""} ${r.documento || ""}`.toLowerCase(),
          render: documentoHtml,
        },
        {
          key: "email",
          label: "Contacto",
          muted: true,
          sortValue: (r) => (r.email || "").toLowerCase(),
          render: contactoHtml,
        },
        {
          key: "activo",
          label: "Estado",
          align: "center",
          sortValue: (r) => (r.activo !== false ? 1 : 0),
          render: estadoHtml,
        },
      ],
      onView: (row) => {
        window.location.href = `receptores-ver.html?id=${encodeURIComponent(row.id)}`;
      },
      onEdit: (row) => {
        window.location.href = `receptores-form.html?id=${encodeURIComponent(row.id)}`;
      },
      resetPasswordPrompt,
      onResetPassword: () => {
        toast("Contraseña restablecida");
      },
      onDeleteAsk: askDelete,
      overflowExtra: (row) => [
        {
          id: "toggle-activo",
          action: "toggle-activo",
          label: row.activo !== false ? "Desactivar" : "Activar",
        },
      ],
      onOverflowAction: (row, action) => {
        if (action !== "toggle-activo") return;
        toggleActivo(row).then((result) => {
          if (result) table.setData(mapRows(ReceptoresData.load()));
        });
      },
      onDeactivate: () => {
        table.setData(mapRows(ReceptoresData.load()));
      },
      onActivate: () => {
        table.setData(mapRows(ReceptoresData.load()));
      },
      onDelete: () => {
        renderSummary(ReceptoresData.load());
      },
    });

    document.querySelector("[data-open-create]")?.addEventListener("click", () => {
      window.location.href = "receptores-form.html";
    });

    document.querySelector("[data-catalog-refresh]")?.addEventListener("click", () => {
      const fresh = ReceptoresData.load();
      table.setData(mapRows(fresh));
      renderSummary(fresh);
      toast("Lista actualizada");
    });

    return table;
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.ReceptoresData || !window.CatalogTable) return;

    const params = new URLSearchParams(window.location.search);
    const saved = params.get("saved");
    if (saved === "created" || saved === "1") {
      toast("Receptor registrado");
    } else if (saved === "updated") {
      toast("Receptor actualizado");
    }
    if (saved) {
      params.delete("saved");
      const clean = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", clean);
    }

    const empty = document.querySelector("[data-catalog-empty] p");

    ReceptoresData.ready()
      .then((rows) => mountTable(rows))
      .catch((err) => {
        console.error(err);
        if (empty) empty.textContent = "No se pudieron cargar los receptores de prueba.";
        document.querySelector("[data-catalog-empty]")?.classList.remove("hidden");
        document.querySelector("[data-catalog-table-wrap]")?.classList.add("hidden");
        toast("Error al cargar receptores", "danger");
      });
  });
})();
