/**
 * tipos-ficha.js — Catálogos › Tipos de ficha (molde CatalogSimple).
 * Orden en modal + columna (sin flechas ⇅; hasOrden: false).
 */
(function () {
  const IN_USE = new Set(["tf-1", "tf-2"]); // fichas seed
  const STORAGE_KEY = "tutortrack-tipos-ficha";

  function nextOrden(all) {
    if (!all.length) return 1;
    return Math.max(...all.map((r) => Number(r.orden) || 0)) + 1;
  }

  document.addEventListener("DOMContentLoaded", () => {
    CatalogSimple.mount({
      storageKey: STORAGE_KEY,
      version: "tf-v2",
      auditTable: "tipo_ficha",
      idPrefix: "tf",
      hasOrden: false,
      labels: {
        singular: "Tipo de ficha",
        created: "Tipo de ficha creado",
        updated: "Tipo de ficha actualizado",
        deleted: "Tipo de ficha eliminado",
        activated: "Tipo de ficha activado",
        deactivated: "Tipo de ficha desactivado",
      },
      searchKeys: ["clave", "nombre", "descripcion"],
      initialSortKey: "orden",
      sort: (a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0),
      seed: [
        {
          id: "tf-1",
          clave: "diagnostico",
          nombre: "Diagnóstico",
          descripcion: "Ficha inicial de diagnóstico del tutorado.",
          orden: 1,
          activo: true,
        },
        {
          id: "tf-2",
          clave: "seguimiento",
          nombre: "Seguimiento",
          descripcion: "Seguimiento periódico del acompañamiento.",
          orden: 2,
          activo: true,
        },
        {
          id: "tf-3",
          clave: "grupal",
          nombre: "Grupal",
          descripcion: "Sesión o ficha de tutoría grupal.",
          orden: 3,
          activo: true,
        },
        {
          id: "tf-4",
          clave: "encuesta",
          nombre: "Encuesta",
          descripcion: "Encuesta complementaria de bienestar.",
          orden: 4,
          activo: true,
        },
      ],
      fields: [
        { key: "clave", label: "Clave", required: true, unique: true },
        {
          key: "nombre",
          label: "Nombre",
          required: true,
          unique: true,
          tooltipKey: "descripcion",
        },
        { key: "descripcion", label: "Descripción", column: false },
        { key: "orden", label: "Orden", required: true },
      ],
      extraColumn: () => ({
        key: "orden",
        label: "Orden",
        align: "center",
        render: (row, esc) => esc(row.orden ?? "—"),
      }),
      onOpenModal: (row, isEdit) => {
        const el = document.getElementById("field-orden");
        if (!el || isEdit) return;
        try {
          const raw = sessionStorage.getItem(STORAGE_KEY);
          const list = raw ? JSON.parse(raw) : [];
          el.value = String(nextOrden(Array.isArray(list) ? list : []));
        } catch (_) {
          el.value = "1";
        }
      },
      validate: (patch, id, all) => {
        const el = document.getElementById("field-orden");
        const raw = el ? String(el.value).trim() : "";
        if (raw === "") return "Completa el campo Orden";
        const orden = Number(raw);
        if (!Number.isFinite(orden) || orden < 1) {
          return "El orden debe ser un número mayor o igual a 1";
        }
        const clash = all.find((r) => r.id !== id && Number(r.orden) === orden);
        if (clash) return "Ya existe un tipo de ficha con ese orden";
        /* CatalogSimple omite orden en el submit; lo inyectamos aquí */
        patch.orden = orden;
        return null;
      },
      isInUse: (row) =>
        IN_USE.has(row.id)
          ? "Tiene fichas asociadas (FK ficha.tipo_ficha_id)."
          : false,
    });
  });
})();
