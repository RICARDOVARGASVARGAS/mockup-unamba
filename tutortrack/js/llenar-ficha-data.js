/**
 * llenar-ficha-data.js — borrador de respuestas del estudiante (autoguardado).
 */
(function () {
  const STORAGE_KEY     = "tutortrack-llenar-ficha";
  const VERSION_KEY     = "tutortrack-llenar-ficha-version";
  const STORAGE_VERSION = "seed-26-v1";

  /* Preguntas de la ficha diagnóstica (mf-1 / fcp-1) */
  const PREGUNTAS_MF1 = [
    {
      id: "preg-101", orden: 1,
      area_id: "area-1", area_nombre: "Adaptación universitaria",
      tipo: "si_no",
      enunciado: "¿Es tu primera vez que estudias en una universidad?",
      opciones: [], escala_min: null, escala_max: null, escala_label_min: null, escala_label_max: null,
    },
    {
      id: "preg-102", orden: 2,
      area_id: "area-2", area_nombre: "Bienestar personal",
      tipo: "escala",
      enunciado: "En una escala del 1 al 5, ¿cómo calificarías tu bienestar emocional en los últimos 15 días?",
      opciones: [], escala_min: 1, escala_max: 5, escala_label_min: "Muy mal", escala_label_max: "Muy bien",
    },
    {
      id: "preg-103", orden: 3,
      area_id: "area-5", area_nombre: "Rendimiento académico",
      tipo: "alternativa_unica",
      enunciado: "¿Cómo describirías tu rendimiento académico hasta ahora?",
      opciones: [
        "Excelente (notas altas sin dificultades)",
        "Bueno (apruebo sin problemas)",
        "Regular (tengo algunas dificultades)",
        "Deficiente (tengo muchas dificultades)",
      ],
      escala_min: null, escala_max: null, escala_label_min: null, escala_label_max: null,
    },
    {
      id: "preg-104", orden: 4,
      area_id: "area-2", area_nombre: "Bienestar personal",
      tipo: "respuesta_multiple",
      enunciado: "¿Has experimentado alguna de las siguientes situaciones recientemente? (Marca todas las que apliquen)",
      opciones: [
        "Dificultad para dormir",
        "Sensación de tristeza o desmotivación",
        "Problemas para concentrarme en clase",
        "Conflictos con compañeros o familiares",
        "Ninguna de las anteriores",
      ],
      escala_min: null, escala_max: null, escala_label_min: null, escala_label_max: null,
    },
    {
      id: "preg-105", orden: 5,
      area_id: "area-3", area_nombre: "Orientación vocacional",
      tipo: "texto_abierto",
      enunciado: "¿Qué es lo que más te motiva a continuar tus estudios universitarios?",
      opciones: [], escala_min: null, escala_max: null, escala_label_min: null, escala_label_max: null,
    },
  ];

  /* Preguntas de seguimiento mensual (mf-2) */
  const PREGUNTAS_MF2 = [
    {
      id: "preg-201", orden: 1,
      area_id: "area-5", area_nombre: "Rendimiento académico",
      tipo: "escala",
      enunciado: "¿Cómo calificarías tu asistencia a clases este mes?",
      opciones: [], escala_min: 1, escala_max: 5, escala_label_min: "Muy baja", escala_label_max: "Perfecta",
    },
    {
      id: "preg-202", orden: 2,
      area_id: "area-4", area_nombre: "Apoyo socioeconómico",
      tipo: "si_no",
      enunciado: "¿Cuentas con los recursos económicos suficientes para continuar tus estudios este mes?",
      opciones: [], escala_min: null, escala_max: null, escala_label_min: null, escala_label_max: null,
    },
    {
      id: "preg-203", orden: 3,
      area_id: "area-2", area_nombre: "Bienestar personal",
      tipo: "texto_abierto",
      enunciado: "¿Existe alguna situación personal que esté afectando tu rendimiento académico? Descríbela brevemente.",
      opciones: [], escala_min: null, escala_max: null, escala_label_min: null, escala_label_max: null,
    },
  ];

  /* Preguntas de cierre (mf-3) */
  const PREGUNTAS_MF3 = [
    {
      id: "preg-301", orden: 1,
      area_id: "area-3", area_nombre: "Orientación vocacional",
      tipo: "alternativa_unica",
      enunciado: "¿Tienes claro tu proyecto profesional al terminar este ciclo?",
      opciones: [
        "Sí, tengo mi proyecto definido",
        "Tengo una idea pero no está definida",
        "No, aún tengo dudas",
      ],
      escala_min: null, escala_max: null, escala_label_min: null, escala_label_max: null,
    },
  ];

  const PREGUNTAS_MAP = { "mf-1": PREGUNTAS_MF1, "mf-2": PREGUNTAS_MF2, "mf-3": PREGUNTAS_MF3 };

  const AREA_COLORES = {
    "area-1": "badge-primary",
    "area-2": "badge-success",
    "area-3": "badge-warning",
    "area-4": "badge-danger",
    "area-5": "badge-neutral",
  };

  function ensureVersion() {
    if (sessionStorage.getItem(VERSION_KEY) !== STORAGE_VERSION) {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
  }

  function getBorrador(fichaId) {
    ensureVersion();
    try {
      const raw = sessionStorage.getItem(`${STORAGE_KEY}-${fichaId}`);
      return raw ? JSON.parse(raw) : {};
    } catch (_) { return {}; }
  }

  function saveBorrador(fichaId, respuestas) {
    sessionStorage.setItem(`${STORAGE_KEY}-${fichaId}`, JSON.stringify(respuestas));
  }

  function clearBorrador(fichaId) {
    sessionStorage.removeItem(`${STORAGE_KEY}-${fichaId}`);
  }

  function getPreguntas(fichaId) {
    return PREGUNTAS_MAP[fichaId] || PREGUNTAS_MF1;
  }

  window.LlenarFichaData = { getBorrador, saveBorrador, clearBorrador, getPreguntas, AREA_COLORES };
})();
