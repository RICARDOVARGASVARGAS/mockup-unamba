/**
 * especialidades.js — Catálogos › Especialidades (molde simple).
 */
(function () {
  const IN_USE = new Set(["esp-1", "esp-2", "esp-3", "esp-4"]); // docentes seed

  document.addEventListener("DOMContentLoaded", () => {
    CatalogSimple.mount({
      storageKey: "tutortrack-especialidades",
      version: "esp-v2-sin-orden",
      auditTable: "especialidad",
      idPrefix: "esp",
      labels: {
        singular: "Especialidad",
        created: "Especialidad creada",
        updated: "Especialidad actualizada",
        deleted: "Especialidad eliminada",
        activated: "Especialidad activada",
        deactivated: "Especialidad desactivada",
      },
      seed: [
        { id: "esp-1", nombre: "Marketing", activo: true },
        { id: "esp-2", nombre: "Finanzas", activo: true },
        { id: "esp-3", nombre: "Gestión Pública", activo: true },
        { id: "esp-4", nombre: "Recursos Humanos", activo: true },
        { id: "esp-5", nombre: "Contabilidad", activo: false },
      ],
      fields: [{ key: "nombre", label: "Nombre", required: true, unique: true }],
      isInUse: (row) =>
        IN_USE.has(row.id)
          ? "Está asignada a uno o más docentes (FK especialidad_id)."
          : false,
    });
  });
})();
