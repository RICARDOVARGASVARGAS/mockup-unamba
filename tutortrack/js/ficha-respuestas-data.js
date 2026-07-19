/**
 * ficha-respuestas-data.js — respuestas de un estudiante en una ficha (vista docente).
 * Modela respuesta_pregunta + observacion_tutor.
 */
(function () {
  const STORAGE_KEY     = "tutortrack-ficha-respuestas";
  const VERSION_KEY     = "tutortrack-ficha-respuestas-version";
  const STORAGE_VERSION = "seed-26-v1";

  /* Seed: respuestas de cada estudiante en fcp-1 (Ficha diagnóstica inicial) */
  const SEED = {
    "fcp-1": {
      "est-01": {
        fecha_envio: "2026-03-18",
        revisada: false,
        respuestas: {
          "preg-101": { tipo: "si_no",              valor: "Sí" },
          "preg-102": { tipo: "escala",             valor: 3, escala_min: 1, escala_max: 5, escala_label_min: "Muy mal", escala_label_max: "Muy bien" },
          "preg-103": { tipo: "alternativa_unica",  valor: "Bueno (apruebo sin problemas)", opciones: ["Excelente (notas altas sin dificultades)", "Bueno (apruebo sin problemas)", "Regular (tengo algunas dificultades)", "Deficiente (tengo muchas dificultades)"] },
          "preg-104": { tipo: "respuesta_multiple", valor: ["Dificultad para dormir", "Problemas para concentrarme en clase"], opciones: ["Dificultad para dormir", "Sensación de tristeza o desmotivación", "Problemas para concentrarme en clase", "Conflictos con compañeros o familiares", "Ninguna de las anteriores"] },
          "preg-105": { tipo: "texto_abierto",      valor: "Me motiva el deseo de superarme y ser un buen profesional para apoyar a mi familia." },
        },
        observaciones: {},
      },
      "est-02": {
        fecha_envio: "2026-03-17",
        revisada: true,
        respuestas: {
          "preg-101": { tipo: "si_no",              valor: "No" },
          "preg-102": { tipo: "escala",             valor: 2, escala_min: 1, escala_max: 5, escala_label_min: "Muy mal", escala_label_max: "Muy bien" },
          "preg-103": { tipo: "alternativa_unica",  valor: "Regular (tengo algunas dificultades)", opciones: ["Excelente (notas altas sin dificultades)", "Bueno (apruebo sin problemas)", "Regular (tengo algunas dificultades)", "Deficiente (tengo muchas dificultades)"] },
          "preg-104": { tipo: "respuesta_multiple", valor: ["Sensación de tristeza o desmotivación", "Dificultad para dormir"], opciones: ["Dificultad para dormir", "Sensación de tristeza o desmotivación", "Problemas para concentrarme en clase", "Conflictos con compañeros o familiares", "Ninguna de las anteriores"] },
          "preg-105": { tipo: "texto_abierto",      valor: "Quiero tener una carrera estable. Aunque a veces me siento abrumado con las tareas." },
        },
        observaciones: {
          "preg-102": "El estudiante reporta bienestar bajo. Recomendar seguimiento en próxima sesión.",
          "preg-104": "Presenta señales de estrés y tristeza. Evaluar derivación a psicología.",
        },
      },
      "est-03": {
        fecha_envio: "2026-03-20",
        revisada: false,
        respuestas: {
          "preg-101": { tipo: "si_no",              valor: "Sí" },
          "preg-102": { tipo: "escala",             valor: 4, escala_min: 1, escala_max: 5, escala_label_min: "Muy mal", escala_label_max: "Muy bien" },
          "preg-103": { tipo: "alternativa_unica",  valor: "Excelente (notas altas sin dificultades)", opciones: ["Excelente (notas altas sin dificultades)", "Bueno (apruebo sin problemas)", "Regular (tengo algunas dificultades)", "Deficiente (tengo muchas dificultades)"] },
          "preg-104": { tipo: "respuesta_multiple", valor: ["Ninguna de las anteriores"], opciones: ["Dificultad para dormir", "Sensación de tristeza o desmotivación", "Problemas para concentrarme en clase", "Conflictos con compañeros o familiares", "Ninguna de las anteriores"] },
          "preg-105": { tipo: "texto_abierto",      valor: "Me motiva aprender y aportar a la sociedad con mis conocimientos." },
        },
        observaciones: {},
      },
    },
  };

  /* Preguntas de la ficha diagnóstica (para renderizar) */
  const PREGUNTAS_FICHA_1 = [
    { id: "preg-101", orden: 1, area_id: "area-1", area_nombre: "Adaptación universitaria", enunciado: "¿Es tu primera vez que estudias en una universidad?" },
    { id: "preg-102", orden: 2, area_id: "area-2", area_nombre: "Bienestar personal",       enunciado: "En una escala del 1 al 5, ¿cómo calificarías tu bienestar emocional en los últimos 15 días?" },
    { id: "preg-103", orden: 3, area_id: "area-5", area_nombre: "Rendimiento académico",    enunciado: "¿Cómo describirías tu rendimiento académico hasta ahora?" },
    { id: "preg-104", orden: 4, area_id: "area-2", area_nombre: "Bienestar personal",       enunciado: "¿Has experimentado alguna de las siguientes situaciones recientemente? (Marca todas las que apliquen)" },
    { id: "preg-105", orden: 5, area_id: "area-3", area_nombre: "Orientación vocacional",   enunciado: "¿Qué es lo que más te motiva a continuar tus estudios universitarios?" },
  ];

  const AREA_COLORES = {
    "area-1": "badge-primary",
    "area-2": "badge-success",
    "area-3": "badge-warning",
    "area-4": "badge-danger",
    "area-5": "badge-neutral",
  };

  let _data = null;

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
      _data = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(SEED));
    } catch (_) {
      _data = JSON.parse(JSON.stringify(SEED));
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(_data));
    return _data;
  }

  function getRespuestas(fichaId, estId) {
    const data = load();
    return (data[fichaId] || {})[estId] || null;
  }

  function saveObservacion(fichaId, estId, pregId, texto) {
    const data = load();
    if (!data[fichaId]) data[fichaId] = {};
    if (!data[fichaId][estId]) return;
    data[fichaId][estId].observaciones[pregId] = texto;
    _data = data;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function marcarRevisada(fichaId, estId) {
    const data = load();
    if (!data[fichaId] || !data[fichaId][estId]) return;
    data[fichaId][estId].revisada = true;
    _data = data;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getPreguntas(fichaId) {
    /* En un mockup real, cargaríamos las preguntas clonadas del fcp.
       Por ahora usamos el seed de la ficha diagnóstica para fcp-1. */
    return PREGUNTAS_FICHA_1;
  }

  window.FichaRespuestasData = { getRespuestas, saveObservacion, marcarRevisada, getPreguntas, AREA_COLORES };
})();
