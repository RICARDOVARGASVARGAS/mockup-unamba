/**
 * tipos-documento.js — Catálogos › Tipos de documento (molde CatalogSimple).
 * Seed compartido vía TiposDocumentoData (formularios de persona).
 */
(function () {
  const Data = window.TiposDocumentoData;
  if (!Data) {
    console.error("TiposDocumentoData no cargado. Incluí tipos-documento-data.js antes.");
    return;
  }

  const IN_USE = new Set(["td-1", "td-2"]); // usuarios seed

  document.addEventListener("DOMContentLoaded", () => {
    CatalogSimple.mount({
      storageKey: Data.STORAGE_KEY,
      versionKey: Data.VERSION_KEY,
      version: Data.STORAGE_VERSION,
      auditTable: "tipo_documento",
      idPrefix: "td",
      labels: {
        singular: "Tipo de documento",
        created: "Tipo de documento creado",
        updated: "Tipo de documento actualizado",
        deleted: "Tipo de documento eliminado",
        activated: "Tipo de documento activado",
        deactivated: "Tipo de documento desactivado",
      },
      searchKeys: ["clave", "nombre"],
      seed: Data.SEED.map((r) => ({ ...r })),
      fields: [
        {
          key: "clave",
          label: "Clave",
          required: true,
          unique: true,
          parse: (v) => String(v || "").trim().toUpperCase(),
          pattern: /^[A-Z][A-Z0-9_]*$/,
          patternMessage:
            "La clave debe empezar con letra mayúscula y solo usar A–Z, 0–9 y _",
        },
        { key: "nombre", label: "Nombre", required: true, unique: true },
      ],
      isInUse: (row) =>
        IN_USE.has(row.id)
          ? "Está en uso por uno o más usuarios (FK usuario.tipo_documento_id)."
          : false,
    });
  });
})();
