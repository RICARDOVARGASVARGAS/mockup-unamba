/**
 * fichas-data.js — plantillas de ficha (biblioteca admin) + preguntas + ficha_ciclo.
 * Modelo: BD-BACKEND.md Módulo 3 (`ficha`, `ficha_ciclo`, `pregunta`, `opcion_pregunta`).
 * Tipos de pregunta: constantes fijas (no tabla).
 */
(function () {
  const STORAGE_KEY = "tutortrack-fichas";
  const VERSION_KEY = "tutortrack-fichas-version";
  const STORAGE_VERSION = "seed-m3-v3";

  const TIPOS_PREGUNTA = [
    { id: "texto_abierto", label: "Texto abierto" },
    { id: "alternativa_unica", label: "Alternativa única" },
    { id: "respuesta_multiple", label: "Respuesta múltiple" },
    { id: "si_no", label: "Sí / No" },
    { id: "escala", label: "Escala" },
  ];

  const AREA_COLORES = {
    "area-1": "badge-primary",
    "area-2": "badge-success",
    "area-3": "badge-warning",
    "area-4": "badge-danger",
    "area-5": "badge-neutral",
    "area-6": "badge-info",
  };

  const AREAS_SEED = [
    { id: "area-1", clave: "personal_social", nombre: "Personal y social" },
    { id: "area-2", clave: "salud_mental", nombre: "Salud corporal y mental" },
    { id: "area-3", clave: "academico", nombre: "Académico" },
    { id: "area-4", clave: "economico", nombre: "Económico" },
    { id: "area-5", clave: "vocacional", nombre: "Vocacional y profesional" },
    { id: "area-6", clave: "servicios", nombre: "Servicios institucionales" },
  ];

  const TIPOS_FICHA_SEED = [
    { id: "tf-1", clave: "diagnostico", nombre: "Diagnóstico" },
    { id: "tf-2", clave: "seguimiento", nombre: "Seguimiento" },
    { id: "tf-3", clave: "grupal", nombre: "Grupal" },
    { id: "tf-4", clave: "encuesta", nombre: "Encuesta" },
  ];

  const CICLOS_SEED = [
    { id: "ciclo-1", nombre: "Primer ciclo", abrev: "1°", orden: 1 },
    { id: "ciclo-2", nombre: "Segundo ciclo", abrev: "2°", orden: 2 },
    { id: "ciclo-3", nombre: "Tercer ciclo", abrev: "3°", orden: 3 },
    { id: "ciclo-4", nombre: "Cuarto ciclo", abrev: "4°", orden: 4 },
    { id: "ciclo-5", nombre: "Quinto ciclo", abrev: "5°", orden: 5 },
    { id: "ciclo-6", nombre: "Sexto ciclo", abrev: "6°", orden: 6 },
    { id: "ciclo-7", nombre: "Séptimo ciclo", abrev: "7°", orden: 7 },
    { id: "ciclo-8", nombre: "Octavo ciclo", abrev: "8°", orden: 8 },
    { id: "ciclo-9", nombre: "Noveno ciclo", abrev: "9°", orden: 9 },
    { id: "ciclo-10", nombre: "Décimo ciclo", abrev: "10°", orden: 10 },
  ];

  function op(id, texto, orden) {
    return { id, texto, orden };
  }

  function preg(cfg) {
    return {
      id: cfg.id,
      ficha_id: cfg.ficha_id,
      ficha_ciclo_periodo_id: null,
      orden: cfg.orden,
      area_id: cfg.area_id,
      tipo_pregunta: cfg.tipo_pregunta,
      enunciado: cfg.enunciado,
      opciones: cfg.opciones || [],
      escala_min: cfg.escala_min ?? null,
      escala_max: cfg.escala_max ?? null,
      etiqueta_min: cfg.etiqueta_min ?? null,
      etiqueta_max: cfg.etiqueta_max ?? null,
    };
  }

  /** Preguntas reutilizables para la plantilla diagnóstica (cubre los 5 tipos). */
  function preguntasDiagnostica(fichaId) {
    return [
      preg({
        id: `${fichaId}-p1`,
        ficha_id: fichaId,
        orden: 1,
        area_id: "area-1",
        tipo_pregunta: "alternativa_unica",
        enunciado: "¿Cómo describirías tu adaptación a la vida universitaria?",
        opciones: [
          op(`${fichaId}-p1-o1`, "Muy buena", 1),
          op(`${fichaId}-p1-o2`, "Buena", 2),
          op(`${fichaId}-p1-o3`, "Regular", 3),
          op(`${fichaId}-p1-o4`, "Mala", 4),
        ],
      }),
      preg({
        id: `${fichaId}-p2`,
        ficha_id: fichaId,
        orden: 2,
        area_id: "area-4",
        tipo_pregunta: "respuesta_multiple",
        enunciado: "¿Qué te preocupa actualmente? (puedes marcar varias)",
        opciones: [
          op(`${fichaId}-p2-o1`, "Economía", 1),
          op(`${fichaId}-p2-o2`, "Salud", 2),
          op(`${fichaId}-p2-o3`, "Estudios", 3),
          op(`${fichaId}-p2-o4`, "Familia", 4),
        ],
      }),
      preg({
        id: `${fichaId}-p3`,
        ficha_id: fichaId,
        orden: 3,
        area_id: "area-2",
        tipo_pregunta: "escala",
        enunciado: "Nivel de estrés este mes",
        escala_min: 1,
        escala_max: 5,
        etiqueta_min: "Nunca",
        etiqueta_max: "Siempre",
      }),
      preg({
        id: `${fichaId}-p4`,
        ficha_id: fichaId,
        orden: 4,
        area_id: "area-2",
        tipo_pregunta: "si_no",
        enunciado: "¿Has pensado en abandonar la universidad?",
        opciones: [
          op(`${fichaId}-p4-o1`, "Sí", 1),
          op(`${fichaId}-p4-o2`, "No", 2),
        ],
      }),
      preg({
        id: `${fichaId}-p5`,
        ficha_id: fichaId,
        orden: 5,
        area_id: "area-1",
        tipo_pregunta: "texto_abierto",
        enunciado: "Cuéntanos cómo te sientes en este momento",
      }),
      preg({
        id: `${fichaId}-p6`,
        ficha_id: fichaId,
        orden: 6,
        area_id: "area-3",
        tipo_pregunta: "alternativa_unica",
        enunciado: "¿Cómo calificarías tu asistencia a clases?",
        opciones: [
          op(`${fichaId}-p6-o1`, "Asisto siempre", 1),
          op(`${fichaId}-p6-o2`, "Falto ocasionalmente", 2),
          op(`${fichaId}-p6-o3`, "Falto con frecuencia", 3),
        ],
      }),
      preg({
        id: `${fichaId}-p7`,
        ficha_id: fichaId,
        orden: 7,
        area_id: "area-5",
        tipo_pregunta: "si_no",
        enunciado: "¿Tienes claro tu proyecto profesional?",
        opciones: [
          op(`${fichaId}-p7-o1`, "Sí", 1),
          op(`${fichaId}-p7-o2`, "No", 2),
        ],
      }),
      preg({
        id: `${fichaId}-p8`,
        ficha_id: fichaId,
        orden: 8,
        area_id: "area-3",
        tipo_pregunta: "escala",
        enunciado: "Motivación para continuar tus estudios",
        escala_min: 1,
        escala_max: 5,
        etiqueta_min: "Muy baja",
        etiqueta_max: "Muy alta",
      }),
      preg({
        id: `${fichaId}-p9`,
        ficha_id: fichaId,
        orden: 9,
        area_id: "area-4",
        tipo_pregunta: "si_no",
        enunciado: "¿Trabajas además de estudiar?",
        opciones: [
          op(`${fichaId}-p9-o1`, "Sí", 1),
          op(`${fichaId}-p9-o2`, "No", 2),
        ],
      }),
      preg({
        id: `${fichaId}-p10`,
        ficha_id: fichaId,
        orden: 10,
        area_id: "area-1",
        tipo_pregunta: "respuesta_multiple",
        enunciado: "¿Con quién vives actualmente?",
        opciones: [
          op(`${fichaId}-p10-o1`, "Familia", 1),
          op(`${fichaId}-p10-o2`, "Compañeros", 2),
          op(`${fichaId}-p10-o3`, "Solo/a", 3),
          op(`${fichaId}-p10-o4`, "Pareja", 4),
        ],
      }),
      preg({
        id: `${fichaId}-p11`,
        ficha_id: fichaId,
        orden: 11,
        area_id: "area-2",
        tipo_pregunta: "texto_abierto",
        enunciado: "¿Hay algo más que quieras compartir con tu tutor?",
      }),
      preg({
        id: `${fichaId}-p12`,
        ficha_id: fichaId,
        orden: 12,
        area_id: "area-3",
        tipo_pregunta: "alternativa_unica",
        enunciado: "¿Necesitas apoyo académico adicional?",
        opciones: [
          op(`${fichaId}-p12-o1`, "Sí, urgentemente", 1),
          op(`${fichaId}-p12-o2`, "Sí, pero no urgente", 2),
          op(`${fichaId}-p12-o3`, "No por ahora", 3),
        ],
      }),
    ];
  }

  function preguntasSeguimiento(fichaId) {
    return [
      preg({
        id: `${fichaId}-p1`,
        ficha_id: fichaId,
        orden: 1,
        area_id: "area-2",
        tipo_pregunta: "escala",
        enunciado: "Nivel de estrés este mes",
        escala_min: 1,
        escala_max: 5,
        etiqueta_min: "Nunca",
        etiqueta_max: "Siempre",
      }),
      preg({
        id: `${fichaId}-p2`,
        ficha_id: fichaId,
        orden: 2,
        area_id: "area-3",
        tipo_pregunta: "alternativa_unica",
        enunciado: "¿Cómo te fue académicamente este mes?",
        opciones: [
          op(`${fichaId}-p2-o1`, "Muy bien", 1),
          op(`${fichaId}-p2-o2`, "Bien", 2),
          op(`${fichaId}-p2-o3`, "Regular", 3),
          op(`${fichaId}-p2-o4`, "Mal", 4),
        ],
      }),
      preg({
        id: `${fichaId}-p3`,
        ficha_id: fichaId,
        orden: 3,
        area_id: "area-4",
        tipo_pregunta: "si_no",
        enunciado: "¿Cuentas con recursos económicos suficientes este mes?",
        opciones: [
          op(`${fichaId}-p3-o1`, "Sí", 1),
          op(`${fichaId}-p3-o2`, "No", 2),
        ],
      }),
      preg({
        id: `${fichaId}-p4`,
        ficha_id: fichaId,
        orden: 4,
        area_id: "area-2",
        tipo_pregunta: "respuesta_multiple",
        enunciado: "¿Qué situaciones te afectaron? (varias)",
        opciones: [
          op(`${fichaId}-p4-o1`, "Sueño", 1),
          op(`${fichaId}-p4-o2`, "Ánimo", 2),
          op(`${fichaId}-p4-o3`, "Concentración", 3),
          op(`${fichaId}-p4-o4`, "Ninguna", 4),
        ],
      }),
      preg({
        id: `${fichaId}-p5`,
        ficha_id: fichaId,
        orden: 5,
        area_id: "area-1",
        tipo_pregunta: "texto_abierto",
        enunciado: "Describe brevemente cómo te sientes este mes",
      }),
      preg({
        id: `${fichaId}-p6`,
        ficha_id: fichaId,
        orden: 6,
        area_id: "area-3",
        tipo_pregunta: "si_no",
        enunciado: "¿Asististe a todas tus clases este mes?",
        opciones: [
          op(`${fichaId}-p6-o1`, "Sí", 1),
          op(`${fichaId}-p6-o2`, "No", 2),
        ],
      }),
      preg({
        id: `${fichaId}-p7`,
        ficha_id: fichaId,
        orden: 7,
        area_id: "area-5",
        tipo_pregunta: "escala",
        enunciado: "Claridad sobre tu proyecto profesional",
        escala_min: 1,
        escala_max: 5,
        etiqueta_min: "Nada claro",
        etiqueta_max: "Muy claro",
      }),
      preg({
        id: `${fichaId}-p8`,
        ficha_id: fichaId,
        orden: 8,
        area_id: "area-1",
        tipo_pregunta: "texto_abierto",
        enunciado: "¿Qué apoyo esperas de tu tutor este mes?",
      }),
    ];
  }

  const SEED_FICHAS = [
    {
      id: "ficha-1",
      tipo_ficha_id: "tf-1",
      nombre: "Ficha diagnóstica inicial",
      descripcion: "Evalúa la adaptación del estudiante al comenzar el período.",
      activo: true,
      ciclo_ids: ["ciclo-1", "ciclo-2", "ciclo-5"],
      preguntas: preguntasDiagnostica("ficha-1"),
    },
    {
      id: "ficha-2",
      tipo_ficha_id: "tf-2",
      nombre: "Seguimiento mensual",
      descripcion: "Seguimiento general del estudiante durante el período.",
      activo: true,
      ciclo_ids: ["ciclo-1", "ciclo-2", "ciclo-3", "ciclo-4", "ciclo-5", "ciclo-6"],
      preguntas: preguntasSeguimiento("ficha-2"),
    },
    {
      id: "ficha-3",
      tipo_ficha_id: "tf-2",
      nombre: "Autoevaluación de hábitos",
      descripcion: "Hábitos de estudio, sueño y organización personal.",
      activo: true,
      ciclo_ids: ["ciclo-3", "ciclo-4", "ciclo-5"],
      preguntas: [
        preg({
          id: "ficha-3-p1",
          ficha_id: "ficha-3",
          orden: 1,
          area_id: "area-2",
          tipo_pregunta: "escala",
          enunciado: "¿Cuántas horas duermes en promedio?",
          escala_min: 1,
          escala_max: 5,
          etiqueta_min: "< 4 h",
          etiqueta_max: "> 8 h",
        }),
        preg({
          id: "ficha-3-p2",
          ficha_id: "ficha-3",
          orden: 2,
          area_id: "area-3",
          tipo_pregunta: "si_no",
          enunciado: "¿Tienes un horario de estudio definido?",
          opciones: [
            op("ficha-3-p2-o1", "Sí", 1),
            op("ficha-3-p2-o2", "No", 2),
          ],
        }),
        preg({
          id: "ficha-3-p3",
          ficha_id: "ficha-3",
          orden: 3,
          area_id: "area-3",
          tipo_pregunta: "texto_abierto",
          enunciado: "Describe tu rutina típica de estudio",
        }),
        preg({
          id: "ficha-3-p4",
          ficha_id: "ficha-3",
          orden: 4,
          area_id: "area-2",
          tipo_pregunta: "alternativa_unica",
          enunciado: "¿Con qué frecuencia haces ejercicio?",
          opciones: [
            op("ficha-3-p4-o1", "Nunca", 1),
            op("ficha-3-p4-o2", "1–2 veces/semana", 2),
            op("ficha-3-p4-o3", "3 o más", 3),
          ],
        }),
        preg({
          id: "ficha-3-p5",
          ficha_id: "ficha-3",
          orden: 5,
          area_id: "area-1",
          tipo_pregunta: "respuesta_multiple",
          enunciado: "¿Qué hábitos quieres mejorar?",
          opciones: [
            op("ficha-3-p5-o1", "Sueño", 1),
            op("ficha-3-p5-o2", "Alimentación", 2),
            op("ficha-3-p5-o3", "Estudio", 3),
            op("ficha-3-p5-o4", "Redes sociales", 4),
          ],
        }),
        preg({
          id: "ficha-3-p6",
          ficha_id: "ficha-3",
          orden: 6,
          area_id: "area-2",
          tipo_pregunta: "escala",
          enunciado: "Satisfacción con tu organización personal",
          escala_min: 1,
          escala_max: 5,
          etiqueta_min: "Muy baja",
          etiqueta_max: "Muy alta",
        }),
      ],
    },
    {
      id: "ficha-4",
      tipo_ficha_id: "tf-3",
      nombre: "Taller de hábitos",
      descripcion: "Ficha grupal posterior a taller de hábitos de estudio.",
      activo: true,
      ciclo_ids: ["ciclo-5"],
      preguntas: [
        preg({
          id: "ficha-4-p1",
          ficha_id: "ficha-4",
          orden: 1,
          area_id: "area-3",
          tipo_pregunta: "si_no",
          enunciado: "¿Asististe al taller completo?",
          opciones: [
            op("ficha-4-p1-o1", "Sí", 1),
            op("ficha-4-p1-o2", "No", 2),
          ],
        }),
        preg({
          id: "ficha-4-p2",
          ficha_id: "ficha-4",
          orden: 2,
          area_id: "area-3",
          tipo_pregunta: "texto_abierto",
          enunciado: "¿Qué aprendiste en el taller?",
        }),
        preg({
          id: "ficha-4-p3",
          ficha_id: "ficha-4",
          orden: 3,
          area_id: "area-1",
          tipo_pregunta: "escala",
          enunciado: "Utilidad del taller para ti",
          escala_min: 1,
          escala_max: 5,
          etiqueta_min: "Nada útil",
          etiqueta_max: "Muy útil",
        }),
        preg({
          id: "ficha-4-p4",
          ficha_id: "ficha-4",
          orden: 4,
          area_id: "area-5",
          tipo_pregunta: "alternativa_unica",
          enunciado: "¿Aplicarás lo aprendido?",
          opciones: [
            op("ficha-4-p4-o1", "Sí, de inmediato", 1),
            op("ficha-4-p4-o2", "Tal vez", 2),
            op("ficha-4-p4-o3", "No", 3),
          ],
        }),
      ],
    },
    {
      id: "ficha-5",
      tipo_ficha_id: "tf-2",
      nombre: "Check-in emocional",
      descripcion: "Breve chequeo de bienestar emocional a mitad de período.",
      activo: true,
      ciclo_ids: ["ciclo-1", "ciclo-2", "ciclo-3", "ciclo-4", "ciclo-5"],
      preguntas: [
        preg({
          id: "ficha-5-p1",
          ficha_id: "ficha-5",
          orden: 1,
          area_id: "area-2",
          tipo_pregunta: "escala",
          enunciado: "¿Cómo te sientes emocionalmente esta semana?",
          escala_min: 1,
          escala_max: 5,
          etiqueta_min: "Muy mal",
          etiqueta_max: "Muy bien",
        }),
        preg({
          id: "ficha-5-p2",
          ficha_id: "ficha-5",
          orden: 2,
          area_id: "area-2",
          tipo_pregunta: "si_no",
          enunciado: "¿Te gustaría conversar con alguien de apoyo?",
          opciones: [
            op("ficha-5-p2-o1", "Sí", 1),
            op("ficha-5-p2-o2", "No", 2),
          ],
        }),
        preg({
          id: "ficha-5-p3",
          ficha_id: "ficha-5",
          orden: 3,
          area_id: "area-1",
          tipo_pregunta: "texto_abierto",
          enunciado: "Comparte lo que necesites (opcional)",
        }),
      ],
    },
    {
      id: "ficha-6",
      tipo_ficha_id: "tf-4",
      nombre: "Encuesta de cierre",
      descripcion: "Evalúa la satisfacción del estudiante al cerrar el período.",
      activo: false,
      ciclo_ids: ["ciclo-5", "ciclo-10"],
      preguntas: [],
    },
  ];

  let _data = null;
  let readyPromise = null;

  function ensureVersion() {
    if (sessionStorage.getItem(VERSION_KEY) !== STORAGE_VERSION) {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
  }

  function load() {
    ensureVersion();
    if (_data) return _data;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        _data = JSON.parse(raw);
        return _data;
      }
    } catch (_) {
      /* ignore */
    }
    _data = JSON.parse(JSON.stringify(SEED_FICHAS));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(_data));
    return _data;
  }

  function save(fichas) {
    _data = fichas;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fichas));
  }

  function ready() {
    if (readyPromise) return readyPromise;
    readyPromise = Promise.resolve().then(() => load());
    return readyPromise;
  }

  function findById(id) {
    return load().find((f) => f.id === id) || null;
  }

  function resumenCounts(rows) {
    const list = rows || load();
    const total = list.length;
    const activos = list.filter((r) => r.activo !== false).length;
    return { total, activos, inactivos: total - activos };
  }

  function upsert(ficha) {
    const fichas = load();
    const idx = fichas.findIndex((f) => f.id === ficha.id);
    if (idx === -1) fichas.unshift(ficha);
    else fichas[idx] = ficha;
    save(fichas);
    return ficha;
  }

  function setActivo(id, activo) {
    const f = findById(id);
    if (!f) return null;
    f.activo = !!activo;
    f.updated_at = new Date().toISOString();
    upsert(f);
    return f;
  }

  /** ¿Hay clones en ficha_ciclo_periodo que usan esta plantilla como origen? */
  function estaEnUso(id) {
    if (window.FichasCicloData && typeof FichasCicloData.countClonesFrom === "function") {
      return FichasCicloData.countClonesFrom(id) > 0;
    }
    /* Fallback seed: plantillas 1–5 ya clonadas por el docente demo */
    return ["ficha-1", "ficha-2", "ficha-3", "ficha-4", "ficha-5"].includes(id);
  }

  function remove(id) {
    if (estaEnUso(id)) return false;
    save(load().filter((f) => f.id !== id));
    return true;
  }

  function duplicar(id) {
    const src = findById(id);
    if (!src) return null;
    const newId = `ficha-${Date.now()}`;
    const copia = {
      ...JSON.parse(JSON.stringify(src)),
      id: newId,
      nombre: `Copia de ${src.nombre}`,
      activo: true,
      ciclo_ids: [...(src.ciclo_ids || [])],
      preguntas: (src.preguntas || []).map((p, i) => ({
        ...JSON.parse(JSON.stringify(p)),
        id: `preg-${Date.now()}-${i}`,
        ficha_id: newId,
        ficha_ciclo_periodo_id: null,
        opciones: (p.opciones || []).map((o, j) => ({
          ...o,
          id: `op-${Date.now()}-${i}-${j}`,
        })),
      })),
    };
    const fichas = load();
    fichas.unshift(copia);
    save(fichas);
    return copia;
  }

  function tipoPreguntaLabel(tipo) {
    const key = tipo === "tipo" ? null : tipo;
    return TIPOS_PREGUNTA.find((t) => t.id === key)?.label || tipo || "";
  }

  function areaNombre(areaId) {
    return AREAS_SEED.find((a) => a.id === areaId)?.nombre || areaId;
  }

  function tipoFichaNombre(tipoId) {
    return TIPOS_FICHA_SEED.find((t) => t.id === tipoId)?.nombre || tipoId;
  }

  function cicloAbrev(cicloId) {
    return CICLOS_SEED.find((c) => c.id === cicloId)?.abrev || cicloId;
  }

  function cicloNombre(cicloId) {
    return CICLOS_SEED.find((c) => c.id === cicloId)?.nombre || cicloId;
  }

  /** Normaliza pregunta legacy (`tipo` → `tipo_pregunta`, labels de escala). */
  function normalizePregunta(p) {
    if (!p) return p;
    const tipo = p.tipo_pregunta || p.tipo;
    return {
      ...p,
      tipo_pregunta: tipo,
      etiqueta_min: p.etiqueta_min ?? p.escala_label_min ?? null,
      etiqueta_max: p.etiqueta_max ?? p.escala_label_max ?? null,
    };
  }

  window.FichasData = {
    TIPOS_PREGUNTA,
    AREAS_SEED,
    TIPOS_FICHA_SEED,
    CICLOS_SEED,
    AREA_COLORES,
    SEED_FICHAS,
    load,
    save,
    ready,
    findById,
    resumenCounts,
    upsert,
    setActivo,
    estaEnUso,
    remove,
    duplicar,
    tipoPreguntaLabel,
    areaNombre,
    tipoFichaNombre,
    cicloAbrev,
    cicloNombre,
    normalizePregunta,
  };
})();
