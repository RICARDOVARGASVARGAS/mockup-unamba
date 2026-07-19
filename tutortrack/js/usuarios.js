/**
 * usuarios.js — listado admin Usuarios (admin, coordinador, receptor).
 */
(function () {
  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  function mapRows(rows) {
    return rows.map((r) => ({
      ...r,
      nombre_completo: UsuariosData.nombreCompleto(r),
      email: r.email || "",
    }));
  }

  function usuarioHtml(row, esc) {
    const name = UsuariosData.nombreCompleto(row);
    const src = UsuariosData.resolveFotoUrl(UsuariosData.fotoSrc(row));
    const avatar = `<img src="${esc(src)}" alt="" class="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border" width="40" height="40" />`;
    return `
      <div class="flex min-w-0 items-center gap-3">
        ${avatar}
        <div class="font-medium text-text leading-snug">${esc(name)}</div>
      </div>`;
  }

  function documentoHtml(row, esc) {
    const clave =
      (window.TiposDocumentoData && TiposDocumentoData.clave(row.tipo_documento_id)) || "";
    const num = row.documento || "";
    if (!clave && !num) return `<span class="text-text-muted">—</span>`;
    return `
      <div class="leading-snug">
        ${clave ? `<div class="text-xs font-medium text-text-muted">${esc(clave)}</div>` : ""}
        <div class="font-medium text-text">${esc(num || "—")}</div>
      </div>`;
  }

  function rolesHtml(row, esc) {
    const labels = UsuariosData.rolesLabel(row.rolIds);
    if (!labels.length) return `<span class="text-text-muted">Sin roles</span>`;
    return labels
      .map((l) => `<span class="badge badge-neutral mr-1">${esc(l)}</span>`)
      .join("");
  }

  function estadoHtml(row) {
    return row.activo !== false
      ? '<span class="badge badge-success">Activo</span>'
      : '<span class="badge badge-neutral">Inactivo</span>';
  }

  function mountTable(rows) {
    const root = document.querySelector("[data-catalog]");
    if (!root || !window.CatalogTable) return null;

    const table = CatalogTable.mount(root, {
      data: mapRows(rows),
      pageSize: 8,
      searchKeys: ["nombres", "apellido_paterno", "apellido_materno", "nombre_completo", "documento", "email"],
      filters: [
        {
          id: "estado",
          getValue: (r) => (r.activo !== false ? "activo" : "inactivo"),
        },
      ],
      initialSortKey: "apellido_paterno",
      deleteLabel: (r) => UsuariosData.nombreCompleto(r),
      columns: [
        {
          key: "nombres",
          label: "Usuario",
          primary: true,
          sortValue: (r) => UsuariosData.nombreCompleto(r).toLowerCase(),
          render: usuarioHtml,
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
          label: "Correo",
          muted: true,
          sortValue: (r) => (r.email || "").toLowerCase(),
          render: (row, esc) =>
            row.email
              ? `<span class="truncate text-text">${esc(row.email)}</span>`
              : `<span class="text-text-muted">—</span>`,
        },
        {
          key: "rolIds",
          label: "Roles",
          render: rolesHtml,
        },
        {
          key: "activo",
          label: "Estado",
          align: "center",
          sortValue: (r) => (r.activo !== false ? 1 : 0),
          render: estadoHtml,
        },
      ],
      onEdit: (row) => {
        window.location.href = `usuarios-form.html?id=${encodeURIComponent(row.id)}`;
      },
      onResetPassword: () => {
        toast("Contraseña restablecida");
      },
      onDelete: (id) => {
        UsuariosData.remove(id);
      },
    });

    document.querySelector("[data-open-create]")?.addEventListener("click", () => {
      window.location.href = "usuarios-form.html";
    });

    document.querySelector("[data-catalog-refresh]")?.addEventListener("click", () => {
      table.setData(mapRows(UsuariosData.load()));
      toast("Lista actualizada");
    });

    return table;
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.UsuariosData || !window.CatalogTable) return;

    const params = new URLSearchParams(window.location.search);
    const saved = params.get("saved");
    if (saved === "created" || saved === "1") {
      toast("Usuario registrado");
    } else if (saved === "updated") {
      toast("Usuario actualizado");
    }
    if (saved) {
      params.delete("saved");
      const clean = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", clean);
    }

    const empty = document.querySelector("[data-catalog-empty] p");

    UsuariosData.ready()
      .then((rows) => mountTable(rows))
      .catch((err) => {
        console.error(err);
        if (empty) empty.textContent = "No se pudieron cargar los usuarios.";
        document.querySelector("[data-catalog-empty]")?.classList.remove("hidden");
        document.querySelector("[data-catalog-table-wrap]")?.classList.add("hidden");
        toast("Error al cargar usuarios", "danger");
      });
  });
})();
