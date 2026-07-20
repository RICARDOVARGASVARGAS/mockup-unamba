/**
 * estudiantes.js — listado Admin › Usuarios y acceso › Estudiantes.
 * Cards por estado académico · columnas sin Roles · overflow con
 * contraseña / auditoría / acceso / marcar egresado|retirado|reactivar.
 */
(function () {
  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  const esc = (v) => CatalogTable.escapeHtml(v);

  function mapRows(rows) {
    return rows.map((r) => ({
      ...r,
      nombre_completo: EstudiantesData.nombreCompleto(r),
      email: r.email || "",
    }));
  }

  function renderSummary(allRows) {
    const { total, activos, inactivos } = EstudiantesData.resumenCounts(allRows);
    const set = (sel, n) => {
      const el = document.querySelector(sel);
      if (el) el.textContent = String(n);
    };
    set("[data-summary-total]", total);
    set("[data-summary-activos]", activos);
    set("[data-summary-inactivos]", inactivos);
  }

  function estudianteHtml(row, escapeFn) {
    const name = EstudiantesData.nombreCompleto(row);
    const src = EstudiantesData.resolveFotoUrl(EstudiantesData.fotoSrc(row));
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
    const estado = row.estado || "activo";
    if (estado === "egresado") {
      return '<span class="badge badge-neutral"><span aria-hidden="true">○</span> Egresado</span>';
    }
    if (estado === "retirado") {
      return '<span class="badge badge-neutral"><span aria-hidden="true">○</span> Retirado</span>';
    }
    return '<span class="badge badge-success"><span aria-hidden="true">●</span> Activo</span>';
  }

  function docLabel(row) {
    const clave =
      (window.TiposDocumentoData && TiposDocumentoData.clave(row.tipo_documento_id)) || "";
    return `${clave ? `${clave} ` : ""}${row.documento || ""}`.trim() || "—";
  }

  function resetPasswordPrompt(row) {
    const nombre = EstudiantesData.nombreCompleto(row);
    const doc = docLabel(row);
    const num = row.documento || "—";
    return AppConfirm.request({
      title: "Restablecer contraseña",
      confirmLabel: "Restablecer",
      cancelLabel: "Cancelar",
      variant: "warning",
      messageHtml: `
        <p><span class="font-medium text-text">Estudiante:</span> ${esc(nombre)}</p>
        <p><span class="font-medium text-text">Documento:</span> ${esc(doc)}</p>
        <p class="pt-1">La nueva contraseña será el número de documento:
          <strong class="text-text font-semibold">${esc(num)}</strong>
        </p>
        <p class="rounded-md border border-warning/30 bg-warning-bg px-3 py-2 text-warning">
          La contraseña actual dejará de funcionar. El estudiante deberá cambiarla al ingresar.
        </p>`,
    });
  }

  function askDeleteOrDeactivate(row) {
    const nombre = EstudiantesData.nombreCompleto(row);
    const doc = docLabel(row);
    const hist = EstudiantesData.getHistorial(row.id);

    if (!EstudiantesData.tieneHistorial(row.id)) {
      return AppConfirm.request({
        title: "Eliminar estudiante",
        confirmLabel: "Eliminar",
        cancelLabel: "Cancelar",
        variant: "danger",
        messageHtml: `
          <p>¿Eliminar a <strong class="text-text">${esc(nombre)}</strong> (${esc(doc)})?</p>
          <p>No tiene matrículas ni fichas llenadas. Se eliminará su perfil (soft delete).</p>`,
      }).then((ok) => {
        if (!ok) return false;
        EstudiantesData.remove(row.id);
        toast("Estudiante eliminado");
        renderSummary(EstudiantesData.load());
        return "deleted";
      });
    }

    const bullets = [];
    if (hist.matriculas > 0) bullets.push(`${hist.matriculas} matrículas`);
    if (hist.fichas_llenadas > 0) bullets.push(`${hist.fichas_llenadas} fichas llenadas`);

    return AppConfirm.request({
      title: "No se puede eliminar",
      confirmLabel: "Desactivar estudiante",
      cancelLabel: "Cancelar",
      variant: "primary",
      messageHtml: `
        <p><strong class="text-text">${esc(nombre)}</strong> tiene historial:</p>
        <ul class="list-disc pl-5 space-y-0.5">
          ${bullets.map((b) => `<li>${esc(b)}</li>`).join("")}
        </ul>
        <p class="pt-1">Para conservar el historial no se elimina. Puedes desactivarlo: no podrá iniciar sesión.</p>`,
    }).then((ok) => {
      if (!ok) return false;
      EstudiantesData.setActivo(row.id, false);
      toast("Estudiante desactivado");
      renderSummary(EstudiantesData.load());
      return "deactivated";
    });
  }

  function toggleActivo(row) {
    const next = !(row.activo !== false);
    const label = next ? "Activar" : "Desactivar";
    const nombre = EstudiantesData.nombreCompleto(row);
    return AppConfirm.request({
      title: `${label} acceso`,
      confirmLabel: label,
      cancelLabel: "Cancelar",
      variant: next ? "primary" : "warning",
      messageHtml: next
        ? `<p>¿Activar el acceso de <strong class="text-text">${esc(nombre)}</strong>? Podrá iniciar sesión.</p>`
        : `<p>¿Desactivar el acceso de <strong class="text-text">${esc(nombre)}</strong>? No podrá iniciar sesión.</p>`,
    }).then((ok) => {
      if (!ok) return false;
      EstudiantesData.setActivo(row.id, next);
      toast(next ? "Estudiante activado" : "Estudiante desactivado");
      return next ? "activated" : "deactivated";
    });
  }

  function changeEstadoAcademico(row, nuevoEstado) {
    const nombre = EstudiantesData.nombreCompleto(row);
    const labels = {
      egresado: "Marcar como egresado",
      retirado: "Marcar como retirado",
      activo: "Reactivar (cursando)",
    };
    const title = labels[nuevoEstado] || "Cambiar estado";
    return AppConfirm.request({
      title,
      confirmLabel: "Confirmar",
      cancelLabel: "Cancelar",
      variant: "primary",
      messageHtml: `<p>¿Cambiar el estado académico de <strong class="text-text">${esc(nombre)}</strong> a
        <strong class="text-text">${esc(EstudiantesData.estadoNombre(nuevoEstado))}</strong>?</p>
        <p class="text-text-muted">Esto no cambia el acceso de login (se gestiona aparte).</p>`,
    }).then((ok) => {
      if (!ok) return false;
      EstudiantesData.setEstado(row.id, nuevoEstado);
      toast(`Estado actualizado: ${EstudiantesData.estadoNombre(nuevoEstado)}`);
      renderSummary(EstudiantesData.load());
      return "estado-changed";
    });
  }

  function overflowEstadoItems(row) {
    const estado = row.estado || "activo";
    const items = [];
    if (estado !== "egresado") {
      items.push({ id: "marcar-egresado", action: "marcar-egresado", label: "Marcar egresado" });
    }
    if (estado !== "retirado") {
      items.push({ id: "marcar-retirado", action: "marcar-retirado", label: "Marcar retirado" });
    }
    if (estado !== "activo") {
      items.push({ id: "reactivar", action: "reactivar", label: "Reactivar" });
    }
    return items;
  }

  function mountTable(rows) {
    const root = document.querySelector("[data-catalog]");
    if (!root || !window.CatalogTable) return null;

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
        "codigo_universitario",
      ],
      filters: [
        {
          id: "estado",
          getValue: (r) => r.estado || "activo",
        },
      ],
      initialSortKey: "apellido_paterno",
      deleteLabel: (r) => EstudiantesData.nombreCompleto(r),
      historyLabel: (r) => EstudiantesData.nombreCompleto(r),
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
          label: "Estudiante",
          primary: true,
          sortValue: (r) => EstudiantesData.nombreCompleto(r).toLowerCase(),
          render: estudianteHtml,
        },
        {
          key: "codigo_universitario",
          label: "Código univ.",
          muted: true,
          sortValue: (r) => (r.codigo_universitario || "").toLowerCase(),
          render: (row, escapeFn) =>
            row.codigo_universitario
              ? `<span class="font-medium text-text">${escapeFn(row.codigo_universitario)}</span>`
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
          key: "estado",
          label: "Estado",
          align: "center",
          sortValue: (r) => r.estado || "activo",
          render: estadoHtml,
        },
      ],
      onView: (row) => {
        window.location.href = `estudiantes-ver.html?id=${encodeURIComponent(row.id)}`;
      },
      onEdit: (row) => {
        window.location.href = `estudiantes-form.html?id=${encodeURIComponent(row.id)}`;
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
          label: row.activo !== false ? "Desactivar acceso" : "Activar acceso",
        },
        ...overflowEstadoItems(row),
      ],
      onOverflowAction: (row, action) => {
        const refresh = () => table.setData(mapRows(EstudiantesData.load()));
        if (action === "toggle-activo") {
          toggleActivo(row).then((result) => {
            if (result) refresh();
          });
          return;
        }
        if (action === "marcar-egresado") {
          changeEstadoAcademico(row, "egresado").then((result) => {
            if (result) refresh();
          });
          return;
        }
        if (action === "marcar-retirado") {
          changeEstadoAcademico(row, "retirado").then((result) => {
            if (result) refresh();
          });
          return;
        }
        if (action === "reactivar") {
          changeEstadoAcademico(row, "activo").then((result) => {
            if (result) refresh();
          });
        }
      },
      onDeactivate: () => {
        table.setData(mapRows(EstudiantesData.load()));
      },
      onActivate: () => {
        table.setData(mapRows(EstudiantesData.load()));
      },
      onDelete: () => {
        renderSummary(EstudiantesData.load());
      },
    });

    document.querySelector("[data-open-create]")?.addEventListener("click", () => {
      window.location.href = "estudiantes-form.html";
    });

    document.querySelector("[data-catalog-refresh]")?.addEventListener("click", () => {
      const fresh = EstudiantesData.load();
      table.setData(mapRows(fresh));
      renderSummary(fresh);
      toast("Lista actualizada");
    });

    return table;
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.EstudiantesData || !window.CatalogTable) return;

    const params = new URLSearchParams(window.location.search);
    const saved = params.get("saved");
    if (saved === "created" || saved === "1") {
      toast("Estudiante registrado");
    } else if (saved === "updated") {
      toast("Estudiante actualizado");
    }
    if (saved) {
      params.delete("saved");
      const clean = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", clean);
    }

    const empty = document.querySelector("[data-catalog-empty] p");

    EstudiantesData.ready()
      .then((rows) => mountTable(rows))
      .catch((err) => {
        console.error(err);
        if (empty) {
          empty.textContent = "No se pudieron cargar los estudiantes de prueba.";
        }
        document.querySelector("[data-catalog-empty]")?.classList.remove("hidden");
        document.querySelector("[data-catalog-table-wrap]")?.classList.add("hidden");
        toast("Error al cargar estudiantes", "danger");
      });
  });
})();
