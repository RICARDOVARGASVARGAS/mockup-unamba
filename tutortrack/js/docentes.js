/**
 * docentes.js — listado Admin › Usuarios y acceso › Docentes.
 * Cards + tabla (N°, Docente, Documento, Especialidad, Roles, Contacto, Estado)
 * + acciones Ver/Editar/Eliminar + overflow ⋯ (contraseña · auditoría · activar/desactivar).
 */
(function () {
  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  const esc = (v) => CatalogTable.escapeHtml(v);

  function mapRows(rows) {
    return rows.map((r) => ({
      ...r,
      nombre_completo: DocentesData.nombreCompleto(r),
      email: r.email || "",
      especialidad_nombre: DocentesData.especialidadNombre(r.especialidad_id),
    }));
  }

  function fillEspecialidadFilter() {
    const select = document.getElementById("filter-especialidad");
    if (!select) return;
    const current = select.value;
    select.innerHTML =
      `<option value="">Todas</option>` +
      DocentesData.ESPECIALIDADES.map(
        (e) => `<option value="${esc(e.id)}">${esc(e.nombre)}</option>`
      ).join("");
    if (current) select.value = current;
  }

  /** Cards: conteo global inmutable (no cambia con filtros). */
  function renderSummary(allRows) {
    const { total, activos, inactivos } = DocentesData.resumenCounts(allRows);
    const set = (sel, n) => {
      const el = document.querySelector(sel);
      if (el) el.textContent = String(n);
    };
    set("[data-summary-total]", total);
    set("[data-summary-activos]", activos);
    set("[data-summary-inactivos]", inactivos);
  }

  function docenteHtml(row, escapeFn) {
    const name = DocentesData.nombreCompleto(row);
    const abrev = DocentesData.gradoAbrev(row.grado_academico_id);
    const gradoNombre = DocentesData.gradoNombre(row.grado_academico_id);
    const src = DocentesData.resolveFotoUrl(DocentesData.fotoSrc(row));
    const avatar = `<img src="${escapeFn(src)}" alt="" class="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border" width="40" height="40" />`;
    const gradoLine = abrev
      ? `<span class="text-xs font-medium text-text-muted" title="${escapeFn(gradoNombre || abrev)}">${escapeFn(abrev)}</span>`
      : "";
    return `
      <div class="flex min-w-0 items-center gap-3">
        ${avatar}
        <div class="min-w-0">
          ${gradoLine ? `<div class="leading-tight">${gradoLine}</div>` : ""}
          <div class="docente-nombre font-medium text-text leading-snug">${escapeFn(name)}</div>
        </div>
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

  function rolesHtml(row, escapeFn) {
    const labels = DocentesData.rolesLabel(row.roles);
    if (!labels.length) return `<span class="text-text-muted">Sin roles</span>`;
    return `<div class="flex flex-wrap gap-1">${labels
      .map((l) => `<span class="badge badge-neutral">${escapeFn(l)}</span>`)
      .join("")}</div>`;
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
    const nombre = DocentesData.nombreConGrado(row);
    const doc = docLabel(row);
    const num = row.documento || "—";
    return AppConfirm.request({
      title: "Restablecer contraseña",
      confirmLabel: "Restablecer",
      cancelLabel: "Cancelar",
      variant: "warning",
      messageHtml: `
        <p><span class="font-medium text-text">Docente:</span> ${esc(nombre)}</p>
        <p><span class="font-medium text-text">Documento:</span> ${esc(doc)}</p>
        <p class="pt-1">La nueva contraseña será el número de documento:
          <strong class="text-text font-semibold">${esc(num)}</strong>
        </p>
        <p class="rounded-md border border-warning/30 bg-warning-bg px-3 py-2 text-warning">
          La contraseña actual dejará de funcionar. El docente deberá cambiarla al ingresar.
        </p>`,
    });
  }

  function askDeleteOrDeactivate(row) {
    const nombre = DocentesData.nombreConGrado(row);
    const doc = docLabel(row);
    const rel = DocentesData.getRelaciones(row.id);

    if (!DocentesData.tieneHistorial(row.id)) {
      return AppConfirm.request({
        title: "Eliminar docente",
        confirmLabel: "Eliminar",
        cancelLabel: "Cancelar",
        variant: "danger",
        messageHtml: `
          <p>¿Eliminar a <strong class="text-text">${esc(nombre)}</strong> (${esc(doc)})?</p>
          <p>No tiene tutorías ni historial registrado. Se eliminará su perfil (soft delete).</p>`,
      }).then((ok) => {
        if (!ok) return false;
        DocentesData.remove(row.id);
        toast("Docente eliminado");
        renderSummary(DocentesData.load());
        return "deleted";
      });
    }

    const bullets = [];
    if (rel.tutorados_vigentes > 0) {
      bullets.push(`${rel.tutorados_vigentes} tutorados en el período vigente`);
    }
    if (rel.periodos_tutor > 0) {
      bullets.push(`${rel.periodos_tutor} períodos como tutor`);
    }
    if (rel.derivaciones > 0) {
      bullets.push(`${rel.derivaciones} derivaciones creadas`);
    }
    if (!bullets.length && rel.tutorados_historico > 0) {
      bullets.push(`${rel.tutorados_historico} tutorados en el historial`);
    }

    return AppConfirm.request({
      title: "No se puede eliminar",
      confirmLabel: "Desactivar docente",
      cancelLabel: "Cancelar",
      variant: "primary",
      messageHtml: `
        <p><strong class="text-text">${esc(nombre)}</strong> tiene historial:</p>
        <ul class="list-disc pl-5 space-y-0.5">
          ${bullets.map((b) => `<li>${esc(b)}</li>`).join("")}
        </ul>
        <p class="pt-1">Para conservar el historial no se elimina. Puedes desactivarlo: deja de ser asignable y no podrá iniciar sesión.</p>`,
    }).then((ok) => {
      if (!ok) return false;
      DocentesData.setActivo(row.id, false);
      toast("Docente desactivado");
      renderSummary(DocentesData.load());
      return "deactivated";
    });
  }

  function toggleActivo(row) {
    const next = !(row.activo !== false);
    const label = next ? "Activar" : "Desactivar";
    const nombre = DocentesData.nombreConGrado(row);
    return AppConfirm.request({
      title: `${label} docente`,
      confirmLabel: label,
      cancelLabel: "Cancelar",
      variant: next ? "primary" : "warning",
      messageHtml: next
        ? `<p>¿Activar a <strong class="text-text">${esc(nombre)}</strong>? Recuperará el acceso al sistema.</p>`
        : `<p>¿Desactivar a <strong class="text-text">${esc(nombre)}</strong>? No podrá iniciar sesión ni ser asignado como tutor.</p>`,
    }).then((ok) => {
      if (!ok) return false;
      DocentesData.setActivo(row.id, next);
      toast(next ? "Docente activado" : "Docente desactivado");
      renderSummary(DocentesData.load());
      return next ? "activated" : "deactivated";
    });
  }

  function mountTable(rows) {
    const root = document.querySelector("[data-catalog]");
    if (!root || !window.CatalogTable) return null;

    fillEspecialidadFilter();
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
        "celular_principal",
      ],
      filters: [
        {
          id: "especialidad",
          getValue: (r) => r.especialidad_id || "",
        },
        {
          id: "estado",
          getValue: (r) => (r.activo !== false ? "activo" : "inactivo"),
        },
      ],
      initialSortKey: "apellido_paterno",
      deleteLabel: (r) => DocentesData.nombreCompleto(r),
      historyLabel: (r) => DocentesData.nombreConGrado(r),
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
          label: "Docente",
          primary: true,
          sortValue: (r) => DocentesData.nombreCompleto(r).toLowerCase(),
          render: docenteHtml,
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
          key: "especialidad_id",
          label: "Especialidad",
          muted: true,
          sortValue: (r) => (r.especialidad_nombre || "").toLowerCase(),
          render: (row, escapeFn) =>
            row.especialidad_nombre
              ? escapeFn(row.especialidad_nombre)
              : `<span class="text-text-muted">—</span>`,
        },
        {
          key: "roles",
          label: "Roles",
          sortable: false,
          render: rolesHtml,
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
        window.location.href = `docentes-ver.html?id=${encodeURIComponent(row.id)}`;
      },
      onEdit: (row) => {
        window.location.href = `docentes-form.html?id=${encodeURIComponent(row.id)}`;
      },
      resetPasswordPrompt,
      onResetPassword: () => {
        toast("Contraseña restablecida");
      },
      onDeleteAsk: askDeleteOrDeactivate,
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
          if (!result) return;
          table.setData(mapRows(DocentesData.load()));
        });
      },
      onDeactivate: () => {
        table.setData(mapRows(DocentesData.load()));
      },
      onActivate: () => {
        table.setData(mapRows(DocentesData.load()));
      },
      onDelete: () => {
        renderSummary(DocentesData.load());
      },
    });

    document.querySelector("[data-open-create]")?.addEventListener("click", () => {
      window.location.href = "docentes-form.html";
    });

    document.querySelector("[data-catalog-refresh]")?.addEventListener("click", () => {
      const fresh = DocentesData.load();
      table.setData(mapRows(fresh));
      renderSummary(fresh);
      toast("Lista actualizada");
    });

    return table;
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.DocentesData || !window.CatalogTable) return;

    const params = new URLSearchParams(window.location.search);
    const saved = params.get("saved");
    if (saved === "created" || saved === "1") {
      toast("Docente registrado");
    } else if (saved === "updated") {
      toast("Docente actualizado");
    }
    if (saved) {
      params.delete("saved");
      const clean = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", clean);
    }

    const empty = document.querySelector("[data-catalog-empty] p");

    DocentesData.ready()
      .then((rows) => mountTable(rows))
      .catch((err) => {
        console.error(err);
        if (empty) {
          empty.textContent = "No se pudieron cargar los docentes de prueba.";
        }
        document.querySelector("[data-catalog-empty]")?.classList.remove("hidden");
        document.querySelector("[data-catalog-table-wrap]")?.classList.add("hidden");
        toast("Error al cargar docentes", "danger");
      });
  });
})();
