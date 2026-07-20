/**
 * grados-academicos.js — Catálogos › Grados académicos (molde CatalogSimple + orden ⇅).
 */
(function () {
  const IN_USE = new Set(["grado-1", "grado-2", "grado-3"]); // docentes seed

  document.addEventListener("DOMContentLoaded", () => {
    CatalogSimple.mount({
      storageKey: "tutortrack-grados-academicos",
      version: "grados-v2",
      auditTable: "grado_academico",
      idPrefix: "grado",
      hasOrden: true,
      labels: {
        singular: "Grado académico",
        created: "Grado académico creado",
        updated: "Grado académico actualizado",
        deleted: "Grado académico eliminado",
        activated: "Grado académico activado",
        deactivated: "Grado académico desactivado",
      },
      searchKeys: ["nombre", "abreviatura"],
      seed: [
        { id: "grado-1", nombre: "Bachiller", abreviatura: "Bach.", orden: 1, activo: true },
        { id: "grado-2", nombre: "Licenciado", abreviatura: "Lic.", orden: 2, activo: true },
        { id: "grado-3", nombre: "Magíster", abreviatura: "Mg.", orden: 3, activo: true },
        { id: "grado-4", nombre: "Doctor", abreviatura: "Dr.", orden: 4, activo: true },
      ],
      fields: [
        { key: "nombre", label: "Nombre", required: true, unique: true },
        {
          key: "abreviatura",
          label: "Abreviatura",
          required: true,
          unique: true,
        },
      ],
      isInUse: (row) =>
        IN_USE.has(row.id)
          ? "Está asignado a uno o más docentes (FK docente.grado_academico_id)."
          : false,
    });
  });
})();
