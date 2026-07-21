/**
 * alertas-derivaciones-data.js — Módulo 4 mockup (alerta_ia + derivacion + auditoría).
 * Coherente con FichasCicloData (est-1..4, doc-1, fl-*) y entidades-receptoras (ent-*).
 * Las alertas NO se crean por UI: solo se siembran / gestionan.
 */
(function () {
  const STORAGE_KEY = "tutortrack-m4-alertas-derivaciones";
  const VERSION_KEY = "tutortrack-m4-alertas-derivaciones-version";
  const STORAGE_VERSION = "m4-seed-v2-visibilidad";

  /** Estudiante demo (Inicio / Mi tutor / mi-seguimiento). */
  const ESTUDIANTE_DEMO = {
    id: "est-1",
    nombres: "Ana",
    apellido_paterno: "Quispe",
    apellido_materno: "Mamani",
    codigo: "2021-1001",
    ciclo: "Quinto ciclo",
    foto: "assets/img/estudiantes/estudiante-1.jpg",
    docente_id: "doc-1",
  };

  const DOCENTE_DEMO = {
    id: "doc-1",
    nombre: "Carlos Quispe Mamani",
    nombre_corto: "Dr. Quispe",
    usuario_id: "usr-doc-1",
  };

  const DOCENTE_B = {
    id: "doc-2",
    nombre: "Elena Torres Vargas",
    nombre_corto: "Mg. Torres",
    usuario_id: "usr-doc-2",
  };

  const RECEPTOR_DEMO = {
    id: "rec-01",
    usuario_id: "usr-rec-1",
    nombres: "Rosa",
    apellido_paterno: "Medina",
    apellido_materno: "Ccahua",
    nombre_corto: "Rosa Medina",
    entidad_receptora_id: "ent-1",
  };

  const AREAS = [
    { id: "area-1", clave: "personal_social", nombre: "Personal y social", corto: "Personal" },
    { id: "area-2", clave: "salud_mental", nombre: "Salud corporal y mental", corto: "Salud mental" },
    { id: "area-3", clave: "academico", nombre: "Académico", corto: "Académico" },
    { id: "area-4", clave: "economico", nombre: "Económico", corto: "Económico" },
    { id: "area-5", clave: "vocacional", nombre: "Vocacional y profesional", corto: "Vocacional" },
  ];

  const ESTUDIANTES = [
    {
      id: "est-1",
      nombres: "Ana",
      apellido_paterno: "Quispe",
      apellido_materno: "Mamani",
      codigo: "2021-1001",
      ciclo: "Quinto ciclo",
      foto: "assets/img/estudiantes/estudiante-1.jpg",
      docente_id: "doc-1",
    },
    {
      id: "est-2",
      nombres: "Carlos",
      apellido_paterno: "Huanca",
      apellido_materno: "Flores",
      codigo: "2021-1002",
      ciclo: "Quinto ciclo",
      foto: "assets/img/estudiantes/estudiante-2.jpg",
      docente_id: "doc-1",
    },
    {
      id: "est-3",
      nombres: "Diana",
      apellido_paterno: "Torres",
      apellido_materno: "Rojas",
      codigo: "2021-1003",
      ciclo: "Quinto ciclo",
      foto: "",
      docente_id: "doc-1",
    },
    {
      id: "est-4",
      nombres: "Luis",
      apellido_paterno: "Vega",
      apellido_materno: "Chávez",
      codigo: "2021-1004",
      ciclo: "Quinto ciclo",
      foto: "",
      docente_id: "doc-1",
    },
    {
      id: "est-5",
      nombres: "Marco",
      apellido_paterno: "Larico",
      apellido_materno: "Puma",
      codigo: "2021-1005",
      ciclo: "Quinto ciclo",
      foto: "",
      docente_id: "doc-1",
    },
    {
      id: "est-6",
      nombres: "Patricia",
      apellido_paterno: "Nina",
      apellido_materno: "Condori",
      codigo: "2020-2108",
      ciclo: "Cuarto ciclo",
      foto: "",
      docente_id: "doc-2",
    },
  ];

  /** Contexto de ficha_llenada (join alerta → estudiante / ficha). */
  const FICHAS_LLENADAS = [
    { id: "fl-est-1-1", estudiante_id: "est-1", nombre_ficha: "Diagnóstica inicial", fecha_enviado: "2026-03-10T15:00:00.000Z" },
    { id: "fl-est-1-2", estudiante_id: "est-1", nombre_ficha: "Seguimiento mensual", fecha_enviado: "2026-03-18T11:00:00.000Z" },
    { id: "fl-est-1-3", estudiante_id: "est-1", nombre_ficha: "Autoevaluación de hábitos", fecha_enviado: "2026-03-22T09:30:00.000Z" },
    { id: "fl-est-2-1", estudiante_id: "est-2", nombre_ficha: "Diagnóstica inicial", fecha_enviado: "2026-03-11T14:00:00.000Z" },
    { id: "fl-est-2-2", estudiante_id: "est-2", nombre_ficha: "Seguimiento mensual", fecha_enviado: "2026-03-19T16:00:00.000Z" },
    { id: "fl-est-3-1", estudiante_id: "est-3", nombre_ficha: "Diagnóstica inicial", fecha_enviado: "2026-03-12T10:00:00.000Z" },
    { id: "fl-est-4-1", estudiante_id: "est-4", nombre_ficha: "Diagnóstica inicial", fecha_enviado: "2026-03-08T10:00:00.000Z" },
    { id: "fl-est-5-1", estudiante_id: "est-5", nombre_ficha: "Diagnóstica inicial", fecha_enviado: "2026-03-05T09:00:00.000Z" },
    { id: "fl-est-6-1", estudiante_id: "est-6", nombre_ficha: "Diagnóstica inicial", fecha_enviado: "2026-03-14T12:00:00.000Z" },
  ];

  function buildSeed() {
    const alertas = [
      {
        id: "al-1",
        ficha_llenada_id: "fl-est-1-2",
        area_id: "area-2",
        docente_id: "doc-1",
        nivel_alerta: "Alta",
        justificacion:
          "En las preguntas 3 y 5 reporta estrés alto y señales de aislamiento sostenido. Las respuestas indican dificultad para dormir y pérdida de motivación respecto a periodos anteriores.",
        entidad_receptora_sugerida_id: "ent-1",
        estado: "pendiente",
        fecha_generada: "2026-03-18T11:15:00.000Z",
      },
      {
        id: "al-2",
        ficha_llenada_id: "fl-est-2-2",
        area_id: "area-4",
        docente_id: "doc-1",
        nivel_alerta: "Media",
        justificacion:
          "Reporta dificultades económicas en dos periodos consecutivos y menciona preocupaciones por sostener el semestre. Sin señales clínicas inmediatas.",
        entidad_receptora_sugerida_id: "ent-3",
        estado: "pendiente",
        fecha_generada: "2026-03-19T16:20:00.000Z",
      },
      {
        id: "al-3",
        ficha_llenada_id: "fl-est-3-1",
        area_id: "area-3",
        docente_id: "doc-1",
        nivel_alerta: "Baja",
        justificacion:
          "Menciona carga académica elevada y dudas sobre ritmos de estudio. No se observan señales de abandono ni deterioro emocional marcado.",
        entidad_receptora_sugerida_id: null,
        estado: "revisada",
        fecha_generada: "2026-03-12T10:20:00.000Z",
      },
      {
        id: "al-4",
        ficha_llenada_id: "fl-est-4-1",
        area_id: "area-2",
        docente_id: "doc-1",
        nivel_alerta: "Alta",
        justificacion:
          "Respuestas compatibles con ansiedad elevada y posible consumo de sustancias. Se sugiere evaluación profesional prioritaria.",
        entidad_receptora_sugerida_id: "ent-1",
        estado: "derivada",
        fecha_generada: "2026-03-08T10:30:00.000Z",
      },
      {
        id: "al-5",
        ficha_llenada_id: "fl-est-5-1",
        area_id: "area-4",
        docente_id: "doc-1",
        nivel_alerta: "Media",
        justificacion:
          "Señala presión económica puntual. Tras conversación de tutoría el docente descartó la alerta (situación ya resuelta con apoyo familiar).",
        entidad_receptora_sugerida_id: "ent-3",
        estado: "descartada",
        fecha_generada: "2026-03-05T09:20:00.000Z",
      },
      {
        id: "al-6",
        ficha_llenada_id: "fl-est-1-3",
        area_id: "area-4",
        docente_id: "doc-1",
        nivel_alerta: "Media",
        justificacion:
          "En hábitos de estudio menciona interrupciones por trabajo remunerado y preocupaciones de sostenimiento. Complementa la alerta de salud mental de la misma estudiante.",
        entidad_receptora_sugerida_id: "ent-3",
        estado: "pendiente",
        fecha_generada: "2026-03-22T09:45:00.000Z",
      },
      {
        id: "al-7",
        ficha_llenada_id: "fl-est-2-1",
        area_id: "area-3",
        docente_id: "doc-1",
        nivel_alerta: "Baja",
        justificacion:
          "Leve desmotivación académica al inicio del periodo. El tutor ya conversó el tema en sesión.",
        entidad_receptora_sugerida_id: null,
        estado: "revisada",
        fecha_generada: "2026-03-11T14:20:00.000Z",
      },
      {
        id: "al-8",
        ficha_llenada_id: "fl-est-1-1",
        area_id: "area-2",
        docente_id: "doc-1",
        nivel_alerta: "Alta",
        justificacion:
          "Tendencia de bienestar a la baja desde el ingreso. Respuestas indican aislamiento y estrés severo en la ficha diagnóstica.",
        entidad_receptora_sugerida_id: "ent-1",
        estado: "derivada",
        fecha_generada: "2026-03-10T15:20:00.000Z",
      },
      {
        id: "al-9",
        ficha_llenada_id: "fl-est-1-2",
        area_id: "area-1",
        docente_id: "doc-1",
        nivel_alerta: "Baja",
        justificacion:
          "Dificultades menores de adaptación social en el campus. Monitorear en próximas fichas.",
        entidad_receptora_sugerida_id: null,
        estado: "pendiente",
        fecha_generada: "2026-03-18T11:18:00.000Z",
      },
      {
        id: "al-10",
        ficha_llenada_id: "fl-est-6-1",
        area_id: "area-2",
        docente_id: "doc-2",
        nivel_alerta: "Alta",
        justificacion:
          "Señales de angustia y posible ideación de abandono de estudios. Requiere revisión prioritaria del tutor.",
        entidad_receptora_sugerida_id: "ent-1",
        estado: "pendiente",
        fecha_generada: "2026-03-14T12:30:00.000Z",
      },
      {
        id: "al-11",
        ficha_llenada_id: "fl-est-6-1",
        area_id: "area-3",
        docente_id: "doc-2",
        nivel_alerta: "Media",
        justificacion:
          "Riesgo académico moderado asociado a inasistencia y baja participación.",
        entidad_receptora_sugerida_id: "ent-3",
        estado: "revisada",
        fecha_generada: "2026-03-14T12:32:00.000Z",
      },
    ];

    const derivaciones = [
      {
        id: "der-1",
        estudiante_id: "est-1",
        docente_id: "doc-1",
        entidad_receptora_id: "ent-1",
        alerta_ia_id: "al-8",
        tipo_estado_derivacion_id: "est-p2",
        motivo:
          "Señales de estrés severo detectadas en la ficha diagnóstica. Se solicita evaluación psicológica.",
        nota: "Se agenda primera cita para el 22/03.",
        visible_estudiante: 1,
        mensaje_estudiante:
          "Te sugerimos una cita con Psicología para acompañarte mejor en este momento.",
        created_at: "2026-03-10T16:20:00.000Z",
        updated_at: "2026-03-19T09:10:00.000Z",
      },
      {
        id: "der-2",
        estudiante_id: "est-4",
        docente_id: "doc-1",
        entidad_receptora_id: "ent-1",
        alerta_ia_id: "al-4",
        tipo_estado_derivacion_id: "est-p1",
        motivo:
          "Alertas de ansiedad elevada y posible consumo. Caso nuevo derivado a Psicología.",
        nota: null,
        visible_estudiante: 0,
        mensaje_estudiante: null,
        created_at: "2026-03-09T11:00:00.000Z",
        updated_at: "2026-03-09T11:00:00.000Z",
      },
      {
        id: "der-3",
        estudiante_id: "est-3",
        docente_id: "doc-1",
        entidad_receptora_id: "ent-1",
        alerta_ia_id: null,
        tipo_estado_derivacion_id: "est-p4",
        motivo:
          "Derivación manual tras conversación de tutoría: la estudiante solicitó apoyo emocional.",
        nota: "Ciclo de sesiones completado. Alta favorable.",
        visible_estudiante: 0,
        mensaje_estudiante: null,
        created_at: "2026-03-02T10:00:00.000Z",
        updated_at: "2026-03-16T15:00:00.000Z",
      },
      {
        id: "der-4",
        estudiante_id: "est-2",
        docente_id: "doc-1",
        entidad_receptora_id: "ent-3",
        alerta_ia_id: null,
        tipo_estado_derivacion_id: "est-b2",
        motivo:
          "Dificultades económicas mencionadas en tutoría. Orientación de bienestar universitario.",
        nota: "Se orientó sobre becas y comedor universitario.",
        visible_estudiante: 1,
        mensaje_estudiante:
          "Tu tutor te sugiere acercarte a Bienestar universitario para orientación sobre apoyos disponibles.",
        created_at: "2026-03-15T14:00:00.000Z",
        updated_at: "2026-03-17T10:00:00.000Z",
      },
      {
        id: "der-5",
        estudiante_id: "est-1",
        docente_id: "doc-1",
        entidad_receptora_id: "ent-1",
        alerta_ia_id: null,
        tipo_estado_derivacion_id: "est-p3",
        motivo: "Seguimiento por recaída de estrés en mitad de ciclo (manual).",
        nota: "En proceso semanal. Buena adherencia.",
        visible_estudiante: 0,
        mensaje_estudiante: null,
        created_at: "2026-02-20T09:00:00.000Z",
        updated_at: "2026-03-12T11:00:00.000Z",
      },
      {
        id: "der-6",
        estudiante_id: "est-6",
        docente_id: "doc-2",
        entidad_receptora_id: "ent-2",
        alerta_ia_id: null,
        tipo_estado_derivacion_id: "est-m2",
        motivo: "Derivación a servicios médicos por molestias físicas recurrentes reportadas al tutor.",
        nota: "En evaluación clínica inicial.",
        visible_estudiante: 0,
        mensaje_estudiante: null,
        created_at: "2026-03-13T09:30:00.000Z",
        updated_at: "2026-03-14T08:00:00.000Z",
      },
      {
        id: "der-7",
        estudiante_id: "est-6",
        docente_id: "doc-2",
        entidad_receptora_id: "ent-1",
        alerta_ia_id: null,
        tipo_estado_derivacion_id: "est-p5",
        motivo: "Caso cerrado de periodo anterior (demo historial).",
        nota: "Cierre administrativo tras alta.",
        visible_estudiante: 0,
        mensaje_estudiante: null,
        created_at: "2025-11-10T10:00:00.000Z",
        updated_at: "2025-12-01T16:00:00.000Z",
      },
    ];

    const auditoria = [
      aud("aud-d1-c", "2026-03-10T16:20:00.000Z", actorDoc(DOCENTE_DEMO), "crear", "derivacion", "der-1", null, {
        tipo_estado_derivacion_id: "est-p1",
        nota: null,
        motivo: derivaciones[0].motivo,
      }),
      aud("aud-d1-u1", "2026-03-19T09:10:00.000Z", actorRec(RECEPTOR_DEMO), "editar", "derivacion", "der-1", {
        tipo_estado_derivacion_id: "est-p1",
        nota: null,
      }, {
        tipo_estado_derivacion_id: "est-p2",
        nota: "Se agenda primera cita para el 22/03.",
      }),
      aud("aud-d2-c", "2026-03-09T11:00:00.000Z", actorDoc(DOCENTE_DEMO), "crear", "derivacion", "der-2", null, {
        tipo_estado_derivacion_id: "est-p1",
        nota: null,
        motivo: derivaciones[1].motivo,
      }),
      aud("aud-d3-c", "2026-03-02T10:00:00.000Z", actorDoc(DOCENTE_DEMO), "crear", "derivacion", "der-3", null, {
        tipo_estado_derivacion_id: "est-p1",
        nota: null,
      }),
      aud("aud-d3-u1", "2026-03-05T11:00:00.000Z", actorRec(RECEPTOR_DEMO), "editar", "derivacion", "der-3", {
        tipo_estado_derivacion_id: "est-p1",
        nota: null,
      }, {
        tipo_estado_derivacion_id: "est-p2",
        nota: "Primera entrevista realizada.",
      }),
      aud("aud-d3-u2", "2026-03-10T12:00:00.000Z", actorRec(RECEPTOR_DEMO), "editar", "derivacion", "der-3", {
        tipo_estado_derivacion_id: "est-p2",
        nota: "Primera entrevista realizada.",
      }, {
        tipo_estado_derivacion_id: "est-p3",
        nota: "Inicia plan de sesiones breves.",
      }),
      aud("aud-d3-u3", "2026-03-16T15:00:00.000Z", actorRec(RECEPTOR_DEMO), "editar", "derivacion", "der-3", {
        tipo_estado_derivacion_id: "est-p3",
        nota: "Inicia plan de sesiones breves.",
      }, {
        tipo_estado_derivacion_id: "est-p4",
        nota: "Ciclo de sesiones completado. Alta favorable.",
      }),
      aud("aud-d4-c", "2026-03-15T14:00:00.000Z", actorDoc(DOCENTE_DEMO), "crear", "derivacion", "der-4", null, {
        tipo_estado_derivacion_id: "est-b1",
        nota: null,
      }),
      aud("aud-d4-u1", "2026-03-17T10:00:00.000Z", {
        id: "usr-rec-bienestar",
        nombre: "Luis Alberto Vargas (Bienestar)",
      }, "editar", "derivacion", "der-4", {
        tipo_estado_derivacion_id: "est-b1",
        nota: null,
      }, {
        tipo_estado_derivacion_id: "est-b2",
        nota: "Se orientó sobre becas y comedor universitario.",
      }),
      aud("aud-d5-c", "2026-02-20T09:00:00.000Z", actorDoc(DOCENTE_DEMO), "crear", "derivacion", "der-5", null, {
        tipo_estado_derivacion_id: "est-p1",
        nota: null,
      }),
      aud("aud-d5-u1", "2026-02-25T10:00:00.000Z", actorRec(RECEPTOR_DEMO), "editar", "derivacion", "der-5", {
        tipo_estado_derivacion_id: "est-p1",
        nota: null,
      }, {
        tipo_estado_derivacion_id: "est-p2",
        nota: "Evaluación inicial.",
      }),
      aud("aud-d5-u2", "2026-03-12T11:00:00.000Z", actorRec(RECEPTOR_DEMO), "editar", "derivacion", "der-5", {
        tipo_estado_derivacion_id: "est-p2",
        nota: "Evaluación inicial.",
      }, {
        tipo_estado_derivacion_id: "est-p3",
        nota: "En terapia semanal. Buena adherencia.",
      }),
      aud("aud-d6-c", "2026-03-13T09:30:00.000Z", actorDoc(DOCENTE_B), "crear", "derivacion", "der-6", null, {
        tipo_estado_derivacion_id: "est-m1",
        nota: null,
      }),
      aud("aud-d6-u1", "2026-03-14T08:00:00.000Z", {
        id: "usr-rec-med",
        nombre: "Personal Servicios médicos",
      }, "editar", "derivacion", "der-6", {
        tipo_estado_derivacion_id: "est-m1",
        nota: null,
      }, {
        tipo_estado_derivacion_id: "est-m2",
        nota: "En evaluación clínica inicial.",
      }),
      aud("aud-d7-c", "2025-11-10T10:00:00.000Z", actorDoc(DOCENTE_B), "crear", "derivacion", "der-7", null, {
        tipo_estado_derivacion_id: "est-p1",
        nota: null,
      }),
      aud("aud-d7-u1", "2025-12-01T16:00:00.000Z", actorRec(RECEPTOR_DEMO), "editar", "derivacion", "der-7", {
        tipo_estado_derivacion_id: "est-p4",
        nota: "Alta clínica.",
      }, {
        tipo_estado_derivacion_id: "est-p5",
        nota: "Cierre administrativo tras alta.",
      }),
    ];

    return { alertas, derivaciones, auditoria };
  }

  function actorDoc(d) {
    return { id: d.usuario_id, nombre: `${d.nombre_corto} (docente)` };
  }

  function actorRec(r) {
    return { id: r.usuario_id, nombre: r.nombre_corto };
  }

  function aud(id, created_at, usuario, accion, tabla, registro_id, valores_anteriores, valores_nuevos) {
    return {
      id,
      created_at,
      usuario_id: usuario.id,
      usuario_nombre: usuario.nombre,
      accion,
      tabla,
      registro_id,
      valores_anteriores,
      valores_nuevos,
    };
  }

  let cached = null;

  function ensureVersion() {
    if (sessionStorage.getItem(VERSION_KEY) !== STORAGE_VERSION) {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
  }

  function load() {
    ensureVersion();
    if (cached) return cached;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.alertas && parsed?.derivaciones && parsed?.auditoria) {
          cached = parsed;
          return cached;
        }
      }
    } catch (_) {
      /* ignore */
    }
    cached = buildSeed();
    save(cached);
    return cached;
  }

  function save(state) {
    cached = state;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function mutate(fn) {
    const state = load();
    fn(state);
    save(state);
    return state;
  }

  function findEstudiante(id) {
    return ESTUDIANTES.find((e) => e.id === id) || null;
  }

  function findFichaLlenada(id) {
    if (window.FichasCicloData) {
      const fl = FichasCicloData.findLlenadoById?.(id);
      if (fl) {
        const fcp = FichasCicloData.findFcp?.(fl.ficha_ciclo_periodo_id);
        const est = findEstudiante(fl.estudiante_id) || FichasCicloData.ESTUDIANTES?.find((e) => e.id === fl.estudiante_id);
        return {
          id: fl.id,
          estudiante_id: fl.estudiante_id,
          nombre_ficha: fcp?.nombre || "Ficha",
          fecha_enviado: fl.fecha_enviado,
          ciclo: FichasCicloData.CICLO_DEMO?.nombre || "Quinto ciclo",
          estudiante: est,
        };
      }
    }
    const row = FICHAS_LLENADAS.find((f) => f.id === id);
    if (!row) return null;
    return { ...row, ciclo: findEstudiante(row.estudiante_id)?.ciclo || "—", estudiante: findEstudiante(row.estudiante_id) };
  }

  function areaById(id) {
    if (window.FichasData?.AREAS_SEED) {
      const a = FichasData.AREAS_SEED.find((x) => x.id === id);
      if (a) {
        const local = AREAS.find((x) => x.id === id);
        return { ...a, corto: local?.corto || a.nombre };
      }
    }
    return AREAS.find((a) => a.id === id) || { id, nombre: id, corto: id };
  }

  function entidadById(id) {
    if (window.EntidadesReceptorasData) {
      return EntidadesReceptorasData.findEntidad?.(id) || null;
    }
    const fallback = {
      "ent-1": { id: "ent-1", nombre: "Psicología", activo: true },
      "ent-2": { id: "ent-2", nombre: "Servicios médicos", activo: true },
      "ent-3": { id: "ent-3", nombre: "Bienestar universitario", activo: true },
    };
    return fallback[id] || null;
  }

  function estadosEntidad(entidadId) {
    if (window.EntidadesReceptorasData) {
      return EntidadesReceptorasData.estadosDe(entidadId) || [];
    }
    return [];
  }

  function estadoById(estadoId) {
    const ents = window.EntidadesReceptorasData?.entidades?.() || [
      { id: "ent-1" },
      { id: "ent-2" },
      { id: "ent-3" },
    ];
    for (const e of ents) {
      const found = estadosEntidad(e.id).find((s) => s.id === estadoId);
      if (found) return { ...found, entidad_receptora_id: e.id };
    }
    return null;
  }

  function docenteById(id) {
    if (id === DOCENTE_DEMO.id) return DOCENTE_DEMO;
    if (id === DOCENTE_B.id) return DOCENTE_B;
    return { id, nombre: id, nombre_corto: id, usuario_id: id };
  }

  function nombreCompleto(est) {
    if (!est) return "—";
    return `${est.nombres} ${est.apellido_paterno} ${est.apellido_materno || ""}`.trim();
  }

  function iniciales(est) {
    if (!est) return "?";
    return `${(est.nombres || "?")[0]}${(est.apellido_paterno || "?")[0]}`.toUpperCase();
  }

  function resumenJustificacion(texto, max = 110) {
    const t = String(texto || "").trim();
    if (t.length <= max) return t;
    return `${t.slice(0, max - 1)}…`;
  }

  function enrichAlerta(a) {
    const fl = findFichaLlenada(a.ficha_llenada_id);
    const est = findEstudiante(fl?.estudiante_id) || fl?.estudiante || null;
    const area = areaById(a.area_id);
    const entidad = a.entidad_receptora_sugerida_id ? entidadById(a.entidad_receptora_sugerida_id) : null;
    const doc = docenteById(a.docente_id);
    const der = load().derivaciones.find((d) => d.alerta_ia_id === a.id) || null;
    return {
      ...a,
      estudiante: est,
      estudiante_id: est?.id || fl?.estudiante_id || null,
      estudiante_nombre: nombreCompleto(est),
      estudiante_codigo: est?.codigo || "—",
      estudiante_ciclo: est?.ciclo || fl?.ciclo || "—",
      estudiante_foto: est?.foto || "",
      estudiante_iniciales: iniciales(est),
      ficha_nombre: fl?.nombre_ficha || "Ficha",
      ficha_fecha: fl?.fecha_enviado || a.fecha_generada,
      area_nombre: area.corto || area.nombre,
      area_nombre_largo: area.nombre,
      entidad_sugerida_nombre: entidad?.nombre || null,
      docente_nombre: doc.nombre_corto || doc.nombre,
      docente: doc,
      derivacion_id: der?.id || null,
      justificacion_resumen: resumenJustificacion(a.justificacion),
    };
  }

  function enrichDerivacion(d) {
    const est = findEstudiante(d.estudiante_id);
    const doc = docenteById(d.docente_id);
    const entidad = entidadById(d.entidad_receptora_id);
    const estado = estadoById(d.tipo_estado_derivacion_id);
    const alerta = d.alerta_ia_id ? load().alertas.find((a) => a.id === d.alerta_ia_id) : null;
    const alertaEnr = alerta ? enrichAlerta(alerta) : null;
    return {
      ...d,
      estudiante: est,
      estudiante_nombre: nombreCompleto(est),
      estudiante_codigo: est?.codigo || "—",
      estudiante_foto: est?.foto || "",
      estudiante_iniciales: iniciales(est),
      docente: doc,
      docente_nombre: doc.nombre_corto || doc.nombre,
      entidad_nombre: entidad?.nombre || "—",
      estado_nombre: estado?.nombre || "—",
      estado_clave: estado?.clave || "",
      estado_orden: estado?.orden ?? 0,
      alerta: alertaEnr,
      motivo_resumen: resumenJustificacion(d.motivo, 120),
    };
  }

  const NIVEL_ORDER = { Alta: 0, Media: 1, Baja: 2 };

  function listAlertas(filters = {}) {
    let rows = load().alertas.map(enrichAlerta);
    if (filters.docente_id) rows = rows.filter((a) => a.docente_id === filters.docente_id);
    if (filters.estado) rows = rows.filter((a) => a.estado === filters.estado);
    if (filters.nivel_alerta) rows = rows.filter((a) => a.nivel_alerta === filters.nivel_alerta);
    if (filters.area_id) rows = rows.filter((a) => a.area_id === filters.area_id);
    if (filters.estudiante_id) rows = rows.filter((a) => a.estudiante_id === filters.estudiante_id);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      rows = rows.filter(
        (a) =>
          a.estudiante_nombre.toLowerCase().includes(q) ||
          a.estudiante_codigo.toLowerCase().includes(q) ||
          a.justificacion.toLowerCase().includes(q)
      );
    }
    if (filters.fecha_desde) {
      rows = rows.filter((a) => String(a.fecha_generada).slice(0, 10) >= filters.fecha_desde);
    }
    if (filters.fecha_hasta) {
      rows = rows.filter((a) => String(a.fecha_generada).slice(0, 10) <= filters.fecha_hasta);
    }
    rows.sort((a, b) => {
      const n = (NIVEL_ORDER[a.nivel_alerta] ?? 9) - (NIVEL_ORDER[b.nivel_alerta] ?? 9);
      if (n !== 0) return n;
      return String(b.fecha_generada).localeCompare(String(a.fecha_generada));
    });
    return rows;
  }

  function conteoEstados(filters = {}) {
    const base = { ...filters };
    delete base.estado;
    const rows = listAlertas(base);
    return {
      pendiente: rows.filter((a) => a.estado === "pendiente").length,
      revisada: rows.filter((a) => a.estado === "revisada").length,
      derivada: rows.filter((a) => a.estado === "derivada").length,
      descartada: rows.filter((a) => a.estado === "descartada").length,
    };
  }

  function findAlerta(id) {
    const a = load().alertas.find((x) => x.id === id);
    return a ? enrichAlerta(a) : null;
  }

  function patchAlertaEstado(id, nuevoEstado, opts = {}) {
    const a = load().alertas.find((x) => x.id === id);
    if (!a) return { ok: false, error: "Alerta no encontrada." };
    if (opts.docente_id && a.docente_id !== opts.docente_id) {
      return { ok: false, error: "No tienes acceso a esta alerta." };
    }
    if (nuevoEstado === "revisada" && opts.from === "revisar") {
      if (a.estado !== "pendiente") return { ok: false, error: "La alerta ya fue procesada." };
    }
    if (nuevoEstado === "descartada") {
      const hasDer = load().derivaciones.some((d) => d.alerta_ia_id === id);
      if (hasDer) return { ok: false, error: "No se puede descartar una alerta que ya generó una derivación." };
      if (a.estado === "derivada") return { ok: false, error: "No se puede descartar una alerta derivada." };
    }
    if (nuevoEstado === "revisada" && opts.from === "reactivar") {
      if (a.estado !== "descartada") return { ok: false, error: "Solo se pueden reactivar alertas descartadas." };
    }
    mutate((s) => {
      const row = s.alertas.find((x) => x.id === id);
      row.estado = nuevoEstado;
      row.updated_at = new Date().toISOString();
    });
    return { ok: true, alerta: findAlerta(id) };
  }

  function listDerivaciones(filters = {}) {
    let rows = load().derivaciones.map(enrichDerivacion);
    if (filters.docente_id) rows = rows.filter((d) => d.docente_id === filters.docente_id);
    if (filters.entidad_receptora_id) {
      rows = rows.filter((d) => d.entidad_receptora_id === filters.entidad_receptora_id);
    }
    if (filters.tipo_estado_derivacion_id) {
      rows = rows.filter((d) => d.tipo_estado_derivacion_id === filters.tipo_estado_derivacion_id);
    }
    if (filters.estudiante_id) rows = rows.filter((d) => d.estudiante_id === filters.estudiante_id);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      rows = rows.filter(
        (d) =>
          d.estudiante_nombre.toLowerCase().includes(q) ||
          d.estudiante_codigo.toLowerCase().includes(q) ||
          d.motivo.toLowerCase().includes(q)
      );
    }
    if (filters.fecha_desde) {
      rows = rows.filter((d) => String(d.created_at).slice(0, 10) >= filters.fecha_desde);
    }
    if (filters.fecha_hasta) {
      rows = rows.filter((d) => String(d.created_at).slice(0, 10) <= filters.fecha_hasta);
    }
    rows.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    return rows;
  }

  function findDerivacion(id) {
    const d = load().derivaciones.find((x) => x.id === id);
    return d ? enrichDerivacion(d) : null;
  }

  function primerEstadoActivo(entidadId) {
    return estadosEntidad(entidadId)
      .filter((e) => e.activo !== false)
      .sort((a, b) => a.orden - b.orden)[0] || null;
  }

  function crearDerivacion(payload, actor = DOCENTE_DEMO) {
    const { estudiante_id, entidad_receptora_id, alerta_ia_id, motivo, docente_id } = payload;
    if (!estudiante_id || !entidad_receptora_id || !motivo?.trim()) {
      return { ok: false, error: "Completa estudiante, entidad y motivo." };
    }
    const entidad = entidadById(entidad_receptora_id);
    if (!entidad || entidad.activo === false) {
      return { ok: false, error: "La entidad receptora no está activa." };
    }
    const estadoIni = primerEstadoActivo(entidad_receptora_id);
    if (!estadoIni) {
      return { ok: false, error: "La entidad receptora no tiene estados configurados." };
    }
    if (alerta_ia_id) {
      const al = load().alertas.find((a) => a.id === alerta_ia_id);
      if (!al) return { ok: false, error: "Alerta de origen no encontrada." };
      if (al.estado === "derivada" || al.estado === "descartada") {
        return { ok: false, error: "La alerta no puede derivarse en su estado actual." };
      }
      const fl = findFichaLlenada(al.ficha_llenada_id);
      if (fl && fl.estudiante_id !== estudiante_id) {
        return { ok: false, error: "El estudiante no coincide con la alerta." };
      }
    }
    const id = `der-${Date.now()}`;
    const now = new Date().toISOString();
    const row = {
      id,
      estudiante_id,
      docente_id: docente_id || actor.id,
      entidad_receptora_id,
      alerta_ia_id: alerta_ia_id || null,
      tipo_estado_derivacion_id: estadoIni.id,
      motivo: motivo.trim(),
      nota: null,
      visible_estudiante: 0,
      mensaje_estudiante: null,
      created_at: now,
      updated_at: now,
    };
    mutate((s) => {
      s.derivaciones.push(row);
      if (alerta_ia_id) {
        const al = s.alertas.find((a) => a.id === alerta_ia_id);
        if (al) al.estado = "derivada";
      }
      s.auditoria.push(
        aud(`aud-${id}-c`, now, actorDoc(actor), "crear", "derivacion", id, null, {
          tipo_estado_derivacion_id: estadoIni.id,
          nota: null,
          motivo: row.motivo,
        })
      );
    });
    return { ok: true, derivacion: findDerivacion(id) };
  }

  function cambiarEstadoDerivacion(id, tipoEstadoId, nota, actor = RECEPTOR_DEMO, opts = {}) {
    const d = load().derivaciones.find((x) => x.id === id);
    if (!d) return { ok: false, error: "Derivación no encontrada." };
    if (opts.entidad_receptora_id && d.entidad_receptora_id !== opts.entidad_receptora_id) {
      return { ok: false, error: "No tienes acceso a este caso." };
    }
    const estados = estadosEntidad(d.entidad_receptora_id);
    const nuevo = estados.find((e) => e.id === tipoEstadoId);
    if (!nuevo) return { ok: false, error: "El estado seleccionado no pertenece a la entidad de esta derivación." };
    if (nuevo.activo === false) return { ok: false, error: "El estado seleccionado no está activo." };
    const prevEstado = d.tipo_estado_derivacion_id;
    const prevNota = d.nota;
    const now = new Date().toISOString();
    mutate((s) => {
      const row = s.derivaciones.find((x) => x.id === id);
      row.tipo_estado_derivacion_id = tipoEstadoId;
      row.nota = nota != null && String(nota).trim() ? String(nota).trim() : null;
      row.updated_at = now;
      s.auditoria.push(
        aud(`aud-${id}-${Date.now()}`, now, actorRec(actor), "editar", "derivacion", id, {
          tipo_estado_derivacion_id: prevEstado,
          nota: prevNota,
        }, {
          tipo_estado_derivacion_id: tipoEstadoId,
          nota: row.nota,
        })
      );
    });
    return { ok: true, derivacion: findDerivacion(id) };
  }

  function timelineDerivacion(derivacionId) {
    const d = findDerivacion(derivacionId);
    if (!d) return { recorridos: [], pendientes: [] };
    const pipeline = estadosEntidad(d.entidad_receptora_id)
      .filter((e) => e.activo !== false)
      .sort((a, b) => a.orden - b.orden);
    const events = load()
      .auditoria.filter((a) => a.tabla === "derivacion" && a.registro_id === derivacionId)
      .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));

    const recorridos = events.map((ev) => {
      const estadoId =
        ev.valores_nuevos?.tipo_estado_derivacion_id ||
        (ev.accion === "crear" ? ev.valores_nuevos?.tipo_estado_derivacion_id : null);
      const est = estadoById(estadoId) || {};
      return {
        estado_id: estadoId,
        estado_nombre: est.nombre || "—",
        fecha: ev.created_at,
        quien: ev.usuario_nombre,
        nota: ev.valores_nuevos?.nota ?? null,
        accion: ev.accion,
      };
    });

    const visitados = new Set(recorridos.map((r) => r.estado_id));
    const actualesOrden = estadoById(d.tipo_estado_derivacion_id)?.orden ?? 0;
    const pendientes = pipeline
      .filter((p) => !visitados.has(p.id) && p.orden > actualesOrden)
      .map((p) => ({ estado_id: p.id, estado_nombre: p.nombre, orden: p.orden }));

    return { recorridos, pendientes, pipeline, derivacion: d };
  }

  function historialEntidad(entidadId, filters = {}) {
    const derIds = new Set(
      load()
        .derivaciones.filter((d) => d.entidad_receptora_id === entidadId)
        .map((d) => d.id)
    );
    let rows = load()
      .auditoria.filter((a) => a.tabla === "derivacion" && derIds.has(a.registro_id))
      .map((ev) => {
        const der = findDerivacion(ev.registro_id);
        const fromId = ev.valores_anteriores?.tipo_estado_derivacion_id;
        const toId = ev.valores_nuevos?.tipo_estado_derivacion_id;
        return {
          ...ev,
          estudiante_id: der?.estudiante_id,
          estudiante_nombre: der?.estudiante_nombre || "—",
          de_estado: fromId ? estadoById(fromId)?.nombre : null,
          a_estado: toId ? estadoById(toId)?.nombre : null,
          nota: ev.valores_nuevos?.nota ?? null,
          es_creacion: ev.accion === "crear",
        };
      })
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

    if (filters.estudiante_id) rows = rows.filter((r) => r.estudiante_id === filters.estudiante_id);
    if (filters.estado_id) {
      rows = rows.filter(
        (r) =>
          r.valores_nuevos?.tipo_estado_derivacion_id === filters.estado_id ||
          r.valores_anteriores?.tipo_estado_derivacion_id === filters.estado_id
      );
    }
    if (filters.fecha_desde) {
      rows = rows.filter((r) => String(r.created_at).slice(0, 10) >= filters.fecha_desde);
    }
    if (filters.fecha_hasta) {
      rows = rows.filter((r) => String(r.created_at).slice(0, 10) <= filters.fecha_hasta);
    }
    if (filters.q) {
      const q = filters.q.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.estudiante_nombre.toLowerCase().includes(q) ||
          (r.usuario_nombre || "").toLowerCase().includes(q) ||
          (r.nota || "").toLowerCase().includes(q)
      );
    }
    return rows;
  }

  function tutoradosDe(docenteId) {
    return ESTUDIANTES.filter((e) => e.docente_id === docenteId);
  }

  /**
   * PATCH /derivaciones/{id}/visibilidad — docente creador o receptor de la entidad.
   * Nunca expone motivo/justificacion al estudiante.
   */
  function setVisibilidad(id, { visible_estudiante, mensaje_estudiante }, actor, opts = {}) {
    const d = load().derivaciones.find((x) => x.id === id);
    if (!d) return { ok: false, error: "Derivación no encontrada." };
    const esDocente = opts.rol === "docente" && d.docente_id === (opts.docente_id || actor.id);
    const esReceptor =
      opts.rol === "receptor" &&
      d.entidad_receptora_id === (opts.entidad_receptora_id || actor.entidad_receptora_id);
    if (!esDocente && !esReceptor) {
      return { ok: false, error: "No tienes permiso para cambiar la visibilidad." };
    }
    const visible = visible_estudiante ? 1 : 0;
    const msg =
      visible && mensaje_estudiante != null && String(mensaje_estudiante).trim()
        ? String(mensaje_estudiante).trim().slice(0, 255)
        : visible
          ? d.mensaje_estudiante
          : null;
    const prev = { visible_estudiante: d.visible_estudiante, mensaje_estudiante: d.mensaje_estudiante };
    const now = new Date().toISOString();
    mutate((s) => {
      const row = s.derivaciones.find((x) => x.id === id);
      row.visible_estudiante = visible;
      row.mensaje_estudiante = msg;
      row.updated_at = now;
      const actorFn = opts.rol === "receptor" ? actorRec : actorDoc;
      s.auditoria.push(
        aud(`aud-${id}-vis-${Date.now()}`, now, actorFn(actor), "editar", "derivacion", id, prev, {
          visible_estudiante: visible,
          mensaje_estudiante: msg,
        })
      );
    });
    return { ok: true, derivacion: findDerivacion(id) };
  }

  /**
   * GET /mi-seguimiento — solo visibles del estudiante, respuesta saneada.
   * Nunca incluye motivo, justificacion, alerta ni estado interno.
   */
  function miSeguimiento(estudianteId) {
    const id = estudianteId || ESTUDIANTE_DEMO.id;
    return load()
      .derivaciones.filter((d) => d.estudiante_id === id && Number(d.visible_estudiante) === 1)
      .map((d) => {
        const entidad = entidadById(d.entidad_receptora_id);
        const mensaje =
          (d.mensaje_estudiante && String(d.mensaje_estudiante).trim()) ||
          `Tu tutoría te sugiere acercarte a ${entidad?.nombre || "el servicio de apoyo"}.`;
        return {
          id: d.id,
          entidad_nombre: entidad?.nombre || "—",
          mensaje_estudiante: mensaje,
          indicador: "en seguimiento",
          /* saneado: sin motivo, nota, estado, alerta */
        };
      });
  }

  function estadosFinalesClaves() {
    return new Set(["resuelto", "cerrado", "alta", "alta_medica"]);
  }

  function esDerivacionAbierta(d) {
    const st = estadoById(d.tipo_estado_derivacion_id);
    if (!st) return true;
    return !estadosFinalesClaves().has(st.clave);
  }

  function kpisDocente(docenteId = DOCENTE_DEMO.id) {
    const alertas = listAlertas({ docente_id: docenteId });
    const ders = listDerivaciones({ docente_id: docenteId });
    return {
      tutorados: tutoradosDe(docenteId).length,
      alertas_pendientes: alertas.filter((a) => a.estado === "pendiente").length,
      derivaciones: ders.length,
      derivaciones_abiertas: ders.filter(esDerivacionAbierta).length,
      alertas_recientes: alertas.filter((a) => a.estado === "pendiente" || a.estado === "revisada").slice(0, 5),
    };
  }

  function kpisAdmin() {
    const alertas = listAlertas({});
    const ders = listDerivaciones({});
    const porNivel = { Alta: 0, Media: 0, Baja: 0 };
    alertas
      .filter((a) => a.estado === "pendiente")
      .forEach((a) => {
        porNivel[a.nivel_alerta] = (porNivel[a.nivel_alerta] || 0) + 1;
      });
    const porEntidad = {};
    ders.filter(esDerivacionAbierta).forEach((d) => {
      porEntidad[d.entidad_nombre] = (porEntidad[d.entidad_nombre] || 0) + 1;
    });
    return {
      alertas_pendientes: alertas.filter((a) => a.estado === "pendiente").length,
      derivaciones_abiertas: ders.filter(esDerivacionAbierta).length,
      por_nivel: porNivel,
      por_entidad: porEntidad,
    };
  }

  function kpisReceptor(entidadId = RECEPTOR_DEMO.entidad_receptora_id) {
    const rows = listDerivaciones({ entidad_receptora_id: entidadId });
    const pipe = estadosEntidad(entidadId)
      .filter((e) => e.activo !== false)
      .sort((a, b) => a.orden - b.orden);
    const primer = pipe[0]?.id;
    const finales = new Set(
      pipe.filter((p) => estadosFinalesClaves().has(p.clave)).map((p) => p.id)
    );
    const mes = new Date().toISOString().slice(0, 7);
    const nuevos = rows.filter((r) => r.tipo_estado_derivacion_id === primer);
    const resueltosMes = rows.filter(
      (r) => finales.has(r.tipo_estado_derivacion_id) && String(r.updated_at).startsWith(mes)
    );
    const enProceso = rows.filter(
      (r) => r.tipo_estado_derivacion_id !== primer && !finales.has(r.tipo_estado_derivacion_id)
    );
    const activos = rows.filter((r) => !finales.has(r.tipo_estado_derivacion_id));

    /* Estancados: >7 días sin movimiento en auditoría */
    const ahora = Date.now();
    const estancados = activos
      .map((r) => {
        const events = load()
          .auditoria.filter((a) => a.tabla === "derivacion" && a.registro_id === r.id)
          .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
        const last = events[0]?.created_at || r.updated_at || r.created_at;
        const dias = Math.floor((ahora - new Date(last).getTime()) / 86400000);
        return { ...r, dias_sin_movimiento: dias, ultimo_movimiento: last };
      })
      .filter((r) => r.dias_sin_movimiento >= 7)
      .sort((a, b) => b.dias_sin_movimiento - a.dias_sin_movimiento);

    return {
      nuevos: nuevos.length,
      en_proceso: enProceso.length,
      resueltos_mes: resueltosMes.length,
      activos: activos.length,
      lista_nuevos: nuevos.slice(0, 5),
      estancados: estancados.slice(0, 5),
    };
  }

  function formatDate(iso, withTime = false) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const opts = withTime
      ? { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
      : { day: "2-digit", month: "2-digit", year: "numeric" };
    return d.toLocaleString("es-PE", opts);
  }

  function reset() {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    cached = null;
  }

  window.AlertasDerivacionesData = {
    STORAGE_VERSION,
    DOCENTE_DEMO,
    DOCENTE_B,
    RECEPTOR_DEMO,
    ESTUDIANTE_DEMO,
    AREAS,
    ESTUDIANTES,
    load,
    reset,
    listAlertas,
    conteoEstados,
    findAlerta,
    patchAlertaEstado,
    listDerivaciones,
    findDerivacion,
    crearDerivacion,
    cambiarEstadoDerivacion,
    setVisibilidad,
    miSeguimiento,
    timelineDerivacion,
    historialEntidad,
    tutoradosDe,
    entidadById,
    estadosEntidad,
    estadoById,
    areaById,
    docenteById,
    findEstudiante,
    findFichaLlenada,
    nombreCompleto,
    formatDate,
    primerEstadoActivo,
    esDerivacionAbierta,
    kpisDocente,
    kpisAdmin,
    kpisReceptor,
  };
})();
