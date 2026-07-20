/**
 * areas.js — Catálogos › Áreas (molde CatalogSimple).
 */
(function () {
  const IN_USE = new Set(["area-1", "area-2"]); // pregunta / alerta_ia seed

  document.addEventListener("DOMContentLoaded", () => {
    CatalogSimple.mount({
      storageKey: "tutortrack-areas",
      version: "areas-v2",
      auditTable: "area",
      idPrefix: "area",
      labels: {
        singular: "Área",
        created: "Área creada",
        updated: "Área actualizada",
        deleted: "Área eliminada",
        activated: "Área activada",
        deactivated: "Área desactivada",
      },
      searchKeys: ["clave", "nombre", "descripcion"],
      seed: [
        {
          id: "area-1",
          clave: "personal_social",
          nombre: "Personal y social",
          descripcion: "Vínculos, familia y adaptación a la vida universitaria.",
          activo: true,
        },
        {
          id: "area-2",
          clave: "salud_mental",
          nombre: "Salud corporal y mental",
          descripcion: "Bienestar físico, emocional y hábitos de cuidado.",
          activo: true,
        },
        {
          id: "area-3",
          clave: "academico",
          nombre: "Académico",
          descripcion: "Motivación, carga académica y riesgo de abandono.",
          activo: true,
        },
        {
          id: "area-4",
          clave: "economico",
          nombre: "Económico",
          descripcion: "Situación económica y acceso a recursos.",
          activo: true,
        },
        {
          id: "area-5",
          clave: "vocacional",
          nombre: "Vocacional y profesional",
          descripcion: "Orientación de carrera e inserción profesional.",
          activo: true,
        },
        {
          id: "area-6",
          clave: "servicios",
          nombre: "Servicios institucionales",
          descripcion: "Uso de servicios de apoyo de la facultad (demo inactivo).",
          activo: false,
        },
      ],
      fields: [
        { key: "clave", label: "Clave", required: true, unique: true },
        {
          key: "nombre",
          label: "Nombre",
          required: true,
          unique: true,
          primary: true,
          secondaryKey: "descripcion",
        },
        { key: "descripcion", label: "Descripción", column: false },
      ],
      isInUse: (row) =>
        IN_USE.has(row.id)
          ? "Tiene preguntas o alertas IA asociadas (FK pregunta/alerta_ia)."
          : false,
    });
  });
})();
