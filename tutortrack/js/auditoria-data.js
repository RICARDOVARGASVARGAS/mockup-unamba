/**
 * auditoria-data.js — bitácora mockup alineada a docs/BD-BACKEND.md · tabla auditoria.
 * Seed con historial de ejemplo (unos registros con cambios, otros sin eventos).
 */
(function () {
  const STORAGE_KEY = "tutortrack-auditoria";
  const VERSION_KEY = "tutortrack-auditoria-version";
  const STORAGE_VERSION = "aud-seed-v1";

  const ACTOR = {
    id: "usr-admin-1",
    nombre: "Ricardo Vargas Vargas",
  };

  const ACTOR_COORD = {
    id: "usr-coord-1",
    nombre: "María Elena Huamán Torres",
  };

  /** Genera filas de auditoría a partir de una plantilla corta. */
  function buildSeed() {
    const entries = [
      /* —— Ciclos: algunos con ediciones; ciclo-9 y ciclo-10 sin historial —— */
      ev("aud-c01", "2025-11-02T09:10:00.000Z", ACTOR, "crear", "ciclo", "ciclo-1", null, {
        nombre: "Primer ciclo",
        orden: 1,
        activo: true,
      }),
      ev("aud-c02", "2026-02-14T11:22:00.000Z", ACTOR, "editar", "ciclo", "ciclo-1", {
        nombre: "I ciclo",
        orden: 1,
        activo: true,
      }, {
        nombre: "Primer ciclo",
        orden: 1,
        activo: true,
      }),
      ev("aud-c03", "2025-11-02T09:12:00.000Z", ACTOR, "crear", "ciclo", "ciclo-2", null, {
        nombre: "Segundo ciclo",
        orden: 2,
        activo: true,
      }),
      ev("aud-c04", "2026-03-01T16:40:00.000Z", ACTOR_COORD, "editar", "ciclo", "ciclo-5", {
        nombre: "Quinto ciclo",
        orden: 5,
        activo: true,
      }, {
        nombre: "Quinto ciclo",
        orden: 5,
        activo: false,
      }),
      ev("aud-c05", "2026-03-02T08:05:00.000Z", ACTOR, "editar", "ciclo", "ciclo-5", {
        nombre: "Quinto ciclo",
        orden: 5,
        activo: false,
      }, {
        nombre: "Quinto ciclo",
        orden: 5,
        activo: true,
      }),
      ev("aud-c06", "2025-11-02T09:15:00.000Z", ACTOR, "crear", "ciclo", "ciclo-8", null, {
        nombre: "Octavo ciclo",
        orden: 8,
        activo: true,
      }),

      /* —— Grados académicos —— */
      ev("aud-g01", "2025-10-20T10:00:00.000Z", ACTOR, "crear", "grado_academico", "grado-1", null, {
        nombre: "Bachiller",
        abreviatura: "Bach.",
        orden: 1,
        activo: true,
      }),
      ev("aud-g02", "2025-10-20T10:01:00.000Z", ACTOR, "crear", "grado_academico", "grado-2", null, {
        nombre: "Licenciado",
        abreviatura: "Lic.",
        orden: 2,
        activo: true,
      }),
      ev("aud-g03", "2026-01-18T14:30:00.000Z", ACTOR, "editar", "grado_academico", "grado-3", {
        nombre: "Maestro",
        abreviatura: "Mg.",
        orden: 3,
        activo: true,
      }, {
        nombre: "Magíster",
        abreviatura: "Mg.",
        orden: 3,
        activo: true,
      }),
      ev("aud-g04", "2025-10-20T10:03:00.000Z", ACTOR, "crear", "grado_academico", "grado-4", null, {
        nombre: "Doctor",
        abreviatura: "Dr.",
        orden: 4,
        activo: true,
      }),
      /* grado-2 sin más eventos además de crear; grado-1 solo crear */

      /* —— Especialidades —— */
      ev("aud-e01", "2025-10-21T09:00:00.000Z", ACTOR, "crear", "especialidad", "esp-1", null, {
        nombre: "Marketing",
        orden: 1,
        activo: true,
      }),
      ev("aud-e02", "2026-04-10T12:15:00.000Z", ACTOR, "editar", "especialidad", "esp-1", {
        nombre: "Marketing digital",
        orden: 1,
        activo: true,
      }, {
        nombre: "Marketing",
        orden: 1,
        activo: true,
      }),
      ev("aud-e03", "2025-10-21T09:02:00.000Z", ACTOR, "crear", "especialidad", "esp-2", null, {
        nombre: "Finanzas",
        orden: 2,
        activo: true,
      }),
      ev("aud-e04", "2026-05-02T10:00:00.000Z", ACTOR_COORD, "editar", "especialidad", "esp-5", {
        nombre: "Contabilidad",
        orden: 5,
        activo: true,
      }, {
        nombre: "Contabilidad",
        orden: 5,
        activo: false,
      }),
      /* esp-3 y esp-4 sin historial */

      /* —— Tipos de documento —— */
      ev("aud-td01", "2025-09-01T08:00:00.000Z", ACTOR, "crear", "tipo_documento", "td-1", null, {
        clave: "DNI",
        nombre: "DNI",
        activo: true,
        orden: 1,
      }),
      ev("aud-td02", "2025-09-01T08:01:00.000Z", ACTOR, "crear", "tipo_documento", "td-2", null, {
        clave: "CE",
        nombre: "Carné de Extranjería",
        activo: true,
        orden: 2,
      }),
      ev("aud-td03", "2026-02-20T15:45:00.000Z", ACTOR, "editar", "tipo_documento", "td-2", {
        clave: "CE",
        nombre: "Carnet extranjería",
        activo: true,
        orden: 2,
      }, {
        clave: "CE",
        nombre: "Carné de Extranjería",
        activo: true,
        orden: 2,
      }),
      /* td-3 sin historial */

      /* —— Tipos de pregunta —— */
      ev("aud-tp01", "2025-09-10T11:00:00.000Z", ACTOR, "crear", "tipo_pregunta", "tp1", null, {
        nombre: "Texto abierto",
        requiere_opciones: false,
      }),
      ev("aud-tp02", "2025-09-10T11:01:00.000Z", ACTOR, "crear", "tipo_pregunta", "tp2", null, {
        nombre: "Alternativa única",
        requiere_opciones: true,
      }),
      ev("aud-tp03", "2026-01-05T09:20:00.000Z", ACTOR, "editar", "tipo_pregunta", "tp4", {
        nombre: "Escala",
        requiere_opciones: true,
      }, {
        nombre: "Escala Likert",
        requiere_opciones: true,
      }),
      ev("aud-tp04", "2025-09-10T11:05:00.000Z", ACTOR, "crear", "tipo_pregunta", "tp5", null, {
        nombre: "Sí/No",
        requiere_opciones: true,
      }),
      /* tp3, tp6, tp7 sin historial */

      /* —— Tipos de ficha —— */
      ev("aud-tf01", "2025-09-12T10:00:00.000Z", ACTOR, "crear", "tipo_ficha", "tf1", null, {
        nombre: "Diagnóstico",
        uso: "frecuente",
      }),
      ev("aud-tf02", "2026-03-18T13:10:00.000Z", ACTOR_COORD, "editar", "tipo_ficha", "tf1", {
        nombre: "Ficha diagnóstico",
        uso: "frecuente",
      }, {
        nombre: "Diagnóstico",
        uso: "frecuente",
      }),
      ev("aud-tf03", "2025-09-12T10:02:00.000Z", ACTOR, "crear", "tipo_ficha", "tf2", null, {
        nombre: "Seguimiento",
        uso: "frecuente",
      }),
      ev("aud-tf04", "2025-09-12T10:04:00.000Z", ACTOR, "crear", "tipo_ficha", "tf7", null, {
        nombre: "Alerta temprana",
        uso: "frecuente",
      }),
      /* tf3–tf6, tf8 sin historial */

      /* —— Tipos estado derivación —— */
      ev("aud-ted01", "2025-09-15T08:30:00.000Z", ACTOR, "crear", "tipo_estado_derivacion", "ted1", null, {
        orden: 1,
        nombre: "Derivado",
        fase: "inicial",
      }),
      ev("aud-ted02", "2026-04-01T17:00:00.000Z", ACTOR, "editar", "tipo_estado_derivacion", "ted2", {
        orden: 2,
        nombre: "En proceso",
        fase: "inicial",
      }, {
        orden: 2,
        nombre: "En atención",
        fase: "inicial",
      }),
      ev("aud-ted03", "2025-09-15T08:35:00.000Z", ACTOR, "crear", "tipo_estado_derivacion", "ted5", null, {
        orden: 5,
        nombre: "Resuelto",
        fase: "final",
      }),
      /* ted3, ted4, ted6–ted8 sin historial */

      /* —— Áreas —— */
      ev("aud-a01", "2025-09-18T09:00:00.000Z", ACTOR, "crear", "area", "a1", null, {
        nombre: "Personal y social",
        grupo: "personal",
      }),
      ev("aud-a02", "2026-02-28T11:40:00.000Z", ACTOR, "editar", "area", "a4", {
        nombre: "Salud mental",
        grupo: "salud",
      }, {
        nombre: "Salud corporal y mental",
        grupo: "salud",
      }),
      ev("aud-a03", "2025-09-18T09:05:00.000Z", ACTOR, "crear", "area", "a8", null, {
        nombre: "Motivación y abandono",
        grupo: "academico",
      }),
      /* a2, a3, a5–a7, a9, a10 sin historial */

      /* —— Entidades receptoras —— */
      ev("aud-er01", "2025-09-20T10:00:00.000Z", ACTOR, "crear", "entidad_receptora", "er1", null, {
        nombre: "Psicología",
        ambito: "salud",
      }),
      ev("aud-er02", "2026-05-12T09:15:00.000Z", ACTOR_COORD, "editar", "entidad_receptora", "er1", {
        nombre: "Unidad de Psicología",
        ambito: "salud",
      }, {
        nombre: "Psicología",
        ambito: "salud",
      }),
      ev("aud-er03", "2025-09-20T10:02:00.000Z", ACTOR, "crear", "entidad_receptora", "er2", null, {
        nombre: "Servicios médicos",
        ambito: "salud",
      }),
      ev("aud-er04", "2025-09-20T10:05:00.000Z", ACTOR, "crear", "entidad_receptora", "er5", null, {
        nombre: "Defensoría estudiantil",
        ambito: "administrativo",
      }),
      /* er3, er4, er6–er8 sin historial */

      /* —— Periodos académicos —— */
      ev("aud-p01", "2025-01-10T08:00:00.000Z", ACTOR, "crear", "periodo_academico", "p-2025-1", null, {
        nombre: "2025-I",
        inicio: "2025-03-01",
        fin: "2025-07-15",
        activo: true,
      }),
      ev("aud-p02", "2025-07-20T18:00:00.000Z", ACTOR, "editar", "periodo_academico", "p-2025-1", {
        nombre: "2025-I",
        activo: true,
      }, {
        nombre: "2025-I",
        activo: false,
      }),
      ev("aud-p03", "2025-07-20T18:05:00.000Z", ACTOR, "crear", "periodo_academico", "p-2025-2", null, {
        nombre: "2025-II",
        inicio: "2025-08-01",
        fin: "2025-12-15",
        activo: true,
      }),
      ev("aud-p04", "2026-02-25T10:00:00.000Z", ACTOR, "editar", "periodo_academico", "p-2025-2", {
        nombre: "2025-II",
        activo: true,
      }, {
        nombre: "2025-II",
        activo: false,
      }),
      ev("aud-p05", "2026-02-25T10:05:00.000Z", ACTOR, "crear", "periodo_academico", "p-2026-1", null, {
        nombre: "2026-I",
        inicio: "2026-03-01",
        fin: "2026-07-15",
        activo: true,
      }),
      /* p-2023-* y p-2024-* sin historial */

      /* —— Roles / permisos —— */
      ev("aud-r01", "2025-08-01T09:00:00.000Z", ACTOR, "crear", "rol", "rol-1", null, {
        nombre: "Administrador",
        ambito: "interno",
      }),
      ev("aud-r02", "2025-08-01T09:02:00.000Z", ACTOR, "crear", "rol", "rol-2", null, {
        nombre: "Docente-Tutor",
        ambito: "interno",
      }),
      ev("aud-r03", "2026-03-22T14:00:00.000Z", ACTOR, "editar", "rol", "rol-4", {
        nombre: "Coordinador",
        ambito: "interno",
      }, {
        nombre: "Coordinador de tutoría",
        ambito: "interno",
      }),
      ev("aud-r04", "2025-08-01T09:10:00.000Z", ACTOR, "crear", "rol", "rol-5", null, {
        nombre: "Psicólogo",
        ambito: "receptor",
      }),
      /* rol-3, rol-6, rol-7 sin historial */

      ev("aud-pm01", "2025-08-01T09:20:00.000Z", ACTOR, "crear", "permiso", "perm-1", null, {
        nombre: "gestionar_catalogos",
        modulo: "catalogos",
      }),
      ev("aud-pm02", "2026-01-12T16:30:00.000Z", ACTOR, "editar", "permiso", "perm-8", {
        nombre: "ver_alertas_ia",
        modulo: "alertas",
      }, {
        nombre: "ver_alertas",
        modulo: "alertas",
      }),
      ev("aud-pm03", "2025-08-01T09:25:00.000Z", ACTOR, "crear", "permiso", "perm-5", null, {
        nombre: "llenar_ficha",
        modulo: "fichas",
      }),
      /* resto de permisos sin historial */

      /* —— Docentes: varios con historial rico; otros vacíos —— */
      ev("aud-d01", "2025-11-10T10:00:00.000Z", ACTOR, "crear", "docente", "doc-01", null, {
        nombres: "Carlos",
        apellido_paterno: "Quispe",
        documento: "45678912",
        email: "c.quispe@unamba.edu.pe",
        activo: true,
      }),
      ev("aud-d02", "2026-01-20T11:30:00.000Z", ACTOR, "editar", "docente", "doc-01", {
        celular_principal: "",
        especialidad_id: "esp-1",
      }, {
        celular_principal: "910000011",
        especialidad_id: "esp-1",
      }),
      ev("aud-d03", "2026-04-08T09:45:00.000Z", ACTOR, "restablecer_contraseña", "docente", "doc-01", null, {
        documento: "45678912",
      }),
      ev("aud-d04", "2025-11-10T10:05:00.000Z", ACTOR, "crear", "docente", "doc-02", null, {
        nombres: "María Elena",
        apellido_paterno: "Huamán",
        documento: "40111223",
        email: "m.huaman@unamba.edu.pe",
        activo: true,
      }),
      ev("aud-d05", "2026-02-11T15:20:00.000Z", ACTOR_COORD, "editar", "docente", "doc-02", {
        roles: ["rol-2"],
      }, {
        roles: ["rol-2", "rol-4"],
      }),
      ev("aud-d06", "2025-11-12T09:00:00.000Z", ACTOR, "crear", "docente", "doc-03", null, {
        nombres: "José Luis",
        apellido_paterno: "Condori",
        documento: "47890123",
        activo: true,
      }),
      ev("aud-d07", "2026-05-15T10:10:00.000Z", ACTOR, "editar", "docente", "doc-05", {
        activo: true,
      }, {
        activo: false,
      }),
      ev("aud-d08", "2026-05-16T08:00:00.000Z", ACTOR, "editar", "docente", "doc-05", {
        activo: false,
      }, {
        activo: true,
      }),
      ev("aud-d09", "2025-12-01T12:00:00.000Z", ACTOR, "crear", "docente", "doc-07", null, {
        nombres: "Rosa",
        apellido_paterno: "Paredes",
        activo: true,
      }),
      ev("aud-d10", "2026-06-02T14:25:00.000Z", ACTOR, "restablecer_contraseña", "docente", "doc-07", null, {
        documento: "49011223",
      }),
      /* doc-04, doc-06, doc-08+ sin historial (vacío a propósito) */

      /* —— Estudiantes —— */
      ev("aud-s01", "2025-12-05T09:00:00.000Z", ACTOR, "crear", "estudiante", "est-01", null, {
        nombres: "Ana Sofía",
        apellido_paterno: "Mamani",
        codigo_universitario: "2021-1001",
        email: "a.mamani@unamba.edu.pe",
        activo: true,
      }),
      ev("aud-s02", "2026-03-10T16:00:00.000Z", ACTOR, "editar", "estudiante", "est-01", {
        celular_principal: "",
      }, {
        celular_principal: "920111001",
      }),
      ev("aud-s03", "2025-12-05T09:05:00.000Z", ACTOR, "crear", "estudiante", "est-02", null, {
        nombres: "Diego Andrés",
        apellido_paterno: "Quispe",
        codigo_universitario: "2021-1002",
        activo: true,
      }),
      ev("aud-s04", "2026-04-22T11:00:00.000Z", ACTOR, "restablecer_contraseña", "estudiante", "est-02", null, {
        documento: "72345678",
      }),
      ev("aud-s05", "2025-12-06T10:00:00.000Z", ACTOR, "crear", "estudiante", "est-05", null, {
        nombres: "Camila Elizabeth",
        apellido_paterno: "Chávez",
        codigo_universitario: "2021-1005",
        activo: true,
      }),
      ev("aud-s06", "2026-05-01T09:30:00.000Z", ACTOR_COORD, "editar", "estudiante", "est-05", {
        activo: true,
      }, {
        activo: false,
      }),
      ev("aud-s07", "2025-12-07T08:40:00.000Z", ACTOR, "crear", "estudiante", "est-06", null, {
        nombres: "Bruno",
        apellido_paterno: "Soto",
        codigo_universitario: "2021-1006",
        activo: true,
      }),
      /* est-03, est-04, est-07, est-08 sin historial */
    ];

    return entries.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  }

  function ev(id, createdAt, actor, accion, tabla, registroId, anteriores, nuevos) {
    return {
      id,
      usuario_id: actor.id,
      usuario_nombre: actor.nombre,
      accion,
      tabla_afectada: tabla,
      registro_id: String(registroId),
      valores_anteriores: anteriores,
      valores_nuevos: nuevos,
      ip: "10.20.0." + (20 + (id.length % 50)),
      user_agent: "TutorTrack-Mockup/1.0",
      url: "/api/v1/" + tabla.replace(/_/g, "-"),
      created_at: createdAt,
    };
  }

  function ensureVersion() {
    if (sessionStorage.getItem(VERSION_KEY) !== STORAGE_VERSION) {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
  }

  function getSeed() {
    return buildSeed();
  }

  function loadAll() {
    ensureVersion();
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (_) {
      /* ignore */
    }
    const seed = getSeed();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed.map((r) => ({ ...r }));
  }

  function saveAll(rows) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }

  function nextId(rows) {
    return `aud-${Date.now()}-${rows.length + 1}`;
  }

  function sanitizePayload(value) {
    if (value == null) return null;
    try {
      const cloned = JSON.parse(JSON.stringify(value));
      if (cloned && typeof cloned === "object" && !Array.isArray(cloned)) {
        if (typeof cloned.foto_perfil_url === "string" && cloned.foto_perfil_url.startsWith("data:")) {
          cloned.foto_perfil_url = "[imagen]";
        }
      }
      return cloned;
    } catch (_) {
      return null;
    }
  }

  function log(entry) {
    if (!entry || !entry.accion || !entry.tabla_afectada) return null;
    const rows = loadAll();
    const row = {
      id: nextId(rows),
      usuario_id: ACTOR.id,
      usuario_nombre: ACTOR.nombre,
      accion: String(entry.accion),
      tabla_afectada: String(entry.tabla_afectada),
      registro_id: entry.registro_id != null ? String(entry.registro_id) : null,
      valores_anteriores: sanitizePayload(entry.valores_anteriores),
      valores_nuevos: sanitizePayload(entry.valores_nuevos),
      ip: "127.0.0.1",
      user_agent: (navigator.userAgent || "").slice(0, 255),
      url: (location.pathname || "").slice(0, 255),
      created_at: new Date().toISOString(),
    };
    rows.unshift(row);
    saveAll(rows);
    return row;
  }

  function listByRegistro(tabla, registroId) {
    const id = registroId != null ? String(registroId) : "";
    return loadAll().filter(
      (r) => r.tabla_afectada === tabla && String(r.registro_id || "") === id
    );
  }

  function accionLabel(accion) {
    const map = {
      crear: "Crear",
      editar: "Editar",
      eliminar: "Eliminar",
      restablecer_contraseña: "Restablecer contraseña",
      login: "Login",
    };
    return map[accion] || accion;
  }

  function resetFromSeed() {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    return loadAll();
  }

  window.AuditoriaData = {
    ACTOR,
    log,
    loadAll,
    listByRegistro,
    accionLabel,
    resetFromSeed,
  };
})();
