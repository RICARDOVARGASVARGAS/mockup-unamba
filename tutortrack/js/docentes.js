/**
 * docentes.js — listado admin Docentes.
 * N° · Docente · Documento · Contacto · Ver / Editar / Eliminar.
 */
(function () {
  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  function docenteHtml(row, esc) {
    const name = DocentesData.nombreCompleto(row);
    const abrev = DocentesData.gradoAbrev(row.grado_academico_id);
    const gradoNombre = DocentesData.gradoNombre(row.grado_academico_id);
    const src = DocentesData.resolveFotoUrl(DocentesData.fotoSrc(row));

    const avatar = `<img src="${esc(src)}" alt="" class="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border" width="40" height="40" />`;

    const gradoLine = abrev
      ? `<span class="text-xs font-medium text-text-muted" title="${esc(gradoNombre || abrev)}">${esc(abrev)}</span>`
      : "";

    return `
      <div class="flex min-w-0 items-center gap-3">
        ${avatar}
        <div class="min-w-0">
          ${gradoLine ? `<div class="leading-tight">${gradoLine}</div>` : ""}
          <div class="docente-nombre font-medium text-text leading-snug">${esc(name)}</div>
        </div>
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

  function contactoHtml(row, esc) {
    const email = row.email || row.correo_electronico || "";
    const tel = row.celular_principal || "";
    if (!email && !tel) return `<span class="text-text-muted">—</span>`;
    return `
      <div class="min-w-0 leading-snug">
        ${email ? `<div class="truncate text-text">${esc(email)}</div>` : ""}
        ${tel ? `<div class="text-xs text-text-muted">${esc(tel)}</div>` : `<div class="text-xs text-text-muted">Sin celular</div>`}
      </div>`;
  }

  function mountTable(rows) {
    const root = document.querySelector("[data-catalog]");
    if (!root || !window.CatalogTable) return;

    const data = rows.map((r) => ({
      ...r,
      nombre_completo: DocentesData.nombreCompleto(r),
      email: r.email || r.correo_electronico || "",
    }));

    CatalogTable.mount(root, {
      data,
      pageSize: 8,
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
          id: "estado",
          getValue: (r) => (r.activo !== false ? "activo" : "inactivo"),
        },
      ],
      initialSortKey: "apellido_paterno",
      deleteLabel: (r) => DocentesData.nombreCompleto(r),
      columns: [
        {
          key: "_n",
          label: "N°",
          num: true,
          align: "center",
          sortable: false,
          render: (_row, esc, n) => esc(n),
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
          key: "email",
          label: "Contacto",
          muted: true,
          sortValue: (r) => (r.email || "").toLowerCase(),
          render: contactoHtml,
        },
      ],
      onView: (row) => {
        window.location.href = `docentes-ver.html?id=${encodeURIComponent(row.id)}`;
      },
      onEdit: (row) => {
        window.location.href = `docentes-form.html?id=${encodeURIComponent(row.id)}`;
      },
      onDelete: (id) => {
        DocentesData.remove(id);
      },
    });

    document.querySelector("[data-open-create]")?.addEventListener("click", () => {
      window.location.href = "docentes-form.html";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.DocentesData || !window.CatalogTable) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("saved") === "1") {
      toast("Docente guardado");
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
