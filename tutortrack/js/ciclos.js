/**
 * ciclos.js — Catálogos › Ciclos (molde CatalogSimple + orden ⇅).
 */
(function () {
  const IN_USE = new Set(["ciclo-1", "ciclo-2", "ciclo-3", "ciclo-4", "ciclo-5"]);

  const NOMBRES = [
    "Primer ciclo",
    "Segundo ciclo",
    "Tercer ciclo",
    "Cuarto ciclo",
    "Quinto ciclo",
    "Sexto ciclo",
    "Séptimo ciclo",
    "Octavo ciclo",
    "Noveno ciclo",
    "Décimo ciclo",
  ];

  document.addEventListener("DOMContentLoaded", () => {
    CatalogSimple.mount({
      storageKey: "tutortrack-ciclos",
      version: "ciclos-v2",
      auditTable: "ciclo",
      idPrefix: "ciclo",
      hasOrden: true,
      labels: {
        singular: "Ciclo",
        created: "Ciclo creado",
        updated: "Ciclo actualizado",
        deleted: "Ciclo eliminado",
        activated: "Ciclo activado",
        deactivated: "Ciclo desactivado",
      },
      searchKeys: ["nombre"],
      seed: NOMBRES.map((nombre, i) => ({
        id: `ciclo-${i + 1}`,
        nombre,
        orden: i + 1,
        activo: true,
      })),
      fields: [{ key: "nombre", label: "Nombre", required: true, unique: true }],
      isInUse: (row) =>
        IN_USE.has(row.id)
          ? "Está referenciado por ciclo_periodo u otras configuraciones del período."
          : false,
    });
  });
})();
