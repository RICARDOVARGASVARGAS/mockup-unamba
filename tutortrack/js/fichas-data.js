/**
 * fichas-data.js — seed para plantillas de fichas y sus preguntas.
 * Tipos de pregunta (constantes fijas):
 *   texto_abierto | alternativa_unica | respuesta_multiple | si_no | escala
 */
(function () {
  const STORAGE_KEY   = "tutortrack-fichas";
  const VERSION_KEY   = "tutortrack-fichas-version";
  const STORAGE_VERSION = "seed-26-v1";

  const TIPOS_PREGUNTA = [
    { id: "texto_abierto",      label: "Texto abierto" },
    { id: "alternativa_unica",  label: "Alternativa única" },
    { id: "respuesta_multiple", label: "Respuesta múltiple" },
    { id: "si_no",              label: "Sí / No" },
    { id: "escala",             label: "Escala" },
  ];

  /* Colores por área (simplificado para badges visuales) */
  const AREA_COLORES = {
    "area-1": "badge-primary",
    "area-2": "badge-success",
    "area-3": "badge-warning",
    "area-4": "badge-danger",
    "area-5": "badge-neutral",
  };

  const AREAS_SEED = [
    { id: "area-1", nombre: "Adaptación universitaria" },
    { id: "area-2", nombre: "Bienestar personal" },
    { id: "area-3", nombre: "Orientación vocacional" },
    { id: "area-4", nombre: "Apoyo socioeconómico" },
    { id: "area-5", nombre: "Rendimiento académico" },
  ];

  const TIPOS_FICHA_SEED = [
    { id: "tf-1", nombre: "Diagnóstica" },
    { id: "tf-2", nombre: "Seguimiento" },
    { id: "tf-3", nombre: "Cierre" },
  ];

  const SEED_FICHAS = [
    {
      id: "ficha-1",
      nombre: "Ficha diagnóstica inicial",
      tipo_ficha_id: "tf-1",
      descripcion: "Evaluación inicial del estudiante al comenzar el ciclo. Detecta áreas de riesgo y necesidades de apoyo.",
      activo: true,
      preguntas: [
        {
          id: "preg-101",
          ficha_id: "ficha-1",
          orden: 1,
          area_id: "area-1",
          tipo: "si_no",
          enunciado: "¿Es tu primera vez que estudias en una universidad?",
          opciones: [],
          escala_min: null, escala_max: null, escala_label_min: null, escala_label_max: null,
        },
        {
          id: "preg-102",
          ficha_id: "ficha-1",
          orden: 2,
          area_id: "area-2",
          tipo: "escala",
          enunciado: "En una escala del 1 al 5, ¿cómo calificarías tu bienestar emocional en los últimos 15 días?",
          opciones: [],
          escala_min: 1, escala_max: 5, escala_label_min: "Muy mal", escala_label_max: "Muy bien",
        },
        {
          id: "preg-103",
          ficha_id: "ficha-1",
          orden: 3,
          area_id: "area-5",
          tipo: "alternativa_unica",
          enunciado: "¿Cómo describirías tu rendimiento académico hasta ahora?",
          opciones: [
            { id: "op-1031", texto: "Excelente (notas altas sin dificultades)" },
            { id: "op-1032", texto: "Bueno (apruebo sin problemas)" },
            { id: "op-1033", texto: "Regular (tengo algunas dificultades)" },
            { id: "op-1034", texto: "Deficiente (tengo muchas dificultades)" },
          ],
          escala_min: null, escala_max: null, escala_label_min: null, escala_label_max: null,
        },
        {
          id: "preg-104",
          ficha_id: "ficha-1",
          orden: 4,
          area_id: "area-2",
          tipo: "respuesta_multiple",
          enunciado: "¿Has experimentado alguna de las siguientes situaciones recientemente? (Marca todas las que apliquen)",
          opciones: [
            { id: "op-1041", texto: "Dificultad para dormir" },
            { id: "op-1042", texto: "Sensación de tristeza o desmotivación" },
            { id: "op-1043", texto: "Problemas para concentrarme en clase" },
            { id: "op-1044", texto: "Conflictos con compañeros o familiares" },
            { id: "op-1045", texto: "Ninguna de las anteriores" },
          ],
          escala_min: null, escala_max: null, escala_label_min: null, escala_label_max: null,
        },
        {
          id: "preg-105",
          ficha_id: "ficha-1",
          orden: 5,
          area_id: "area-3",
          tipo: "texto_abierto",
          enunciado: "¿Qué es lo que más te motiva a continuar tus estudios universitarios?",
          opciones: [],
          escala_min: null, escala_max: null, escala_label_min: null, escala_label_max: null,
        },
      ],
    },
    {
      id: "ficha-2",
      nombre: "Seguimiento mensual",
      tipo_ficha_id: "tf-2",
      descripcion: "Seguimiento del estado del estudiante durante el ciclo académico.",
      activo: true,
      preguntas: [
        {
          id: "preg-201",
          ficha_id: "ficha-2",
          orden: 1,
          area_id: "area-5",
          tipo: "escala",
          enunciado: "¿Cómo calificarías tu asistencia a clases este mes?",
          opciones: [],
          escala_min: 1, escala_max: 5, escala_label_min: "Muy baja", escala_label_max: "Perfecta",
        },
        {
          id: "preg-202",
          ficha_id: "ficha-2",
          orden: 2,
          area_id: "area-4",
          tipo: "si_no",
          enunciado: "¿Cuentas con los recursos económicos suficientes para continuar tus estudios este mes?",
          opciones: [],
          escala_min: null, escala_max: null, escala_label_min: null, escala_label_max: null,
        },
        {
          id: "preg-203",
          ficha_id: "ficha-2",
          orden: 3,
          area_id: "area-2",
          tipo: "texto_abierto",
          enunciado: "¿Existe alguna situación personal que esté afectando tu rendimiento académico? Descríbela brevemente.",
          opciones: [],
          escala_min: null, escala_max: null, escala_label_min: null, escala_label_max: null,
        },
      ],
    },
    {
      id: "ficha-3",
      nombre: "Encuesta de cierre",
      tipo_ficha_id: "tf-3",
      descripcion: "Evaluación final al concluir el período académico.",
      activo: false,
      preguntas: [
        {
          id: "preg-301",
          ficha_id: "ficha-3",
          orden: 1,
          area_id: "area-3",
          tipo: "alternativa_unica",
          enunciado: "¿Tienes claro tu proyecto profesional al terminar este ciclo?",
          opciones: [
            { id: "op-3011", texto: "Sí, tengo mi proyecto definido" },
            { id: "op-3012", texto: "Tengo una idea pero no está definida" },
            { id: "op-3013", texto: "No, aún tengo dudas" },
          ],
          escala_min: null, escala_max: null, escala_label_min: null, escala_label_max: null,
        },
      ],
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
      if (raw) { _data = JSON.parse(raw); return _data; }
    } catch (_) { /* ignore */ }
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

  function upsert(ficha) {
    const fichas = load();
    const idx = fichas.findIndex((f) => f.id === ficha.id);
    if (idx === -1) fichas.unshift(ficha);
    else fichas[idx] = ficha;
    save(fichas);
    return ficha;
  }

  function remove(id) {
    save(load().filter((f) => f.id !== id));
  }

  function duplicar(id) {
    const src = findById(id);
    if (!src) return null;
    const newId = `ficha-${Date.now()}`;
    const copia = {
      ...JSON.parse(JSON.stringify(src)),
      id: newId,
      nombre: `Copia de ${src.nombre}`,
      preguntas: src.preguntas.map((p) => ({
        ...JSON.parse(JSON.stringify(p)),
        id: `preg-${Date.now()}-${p.orden}`,
        ficha_id: newId,
        opciones: (p.opciones || []).map((o) => ({ ...o, id: `op-${Date.now()}-${o.id}` })),
      })),
    };
    const fichas = load();
    fichas.unshift(copia);
    save(fichas);
    return copia;
  }

  function tipoPreguntaLabel(tipo) {
    return TIPOS_PREGUNTA.find((t) => t.id === tipo)?.label || tipo;
  }

  function areaNombre(areaId) {
    return AREAS_SEED.find((a) => a.id === areaId)?.nombre || areaId;
  }

  function tipoFichaNombre(tipoId) {
    return TIPOS_FICHA_SEED.find((t) => t.id === tipoId)?.nombre || tipoId;
  }

  window.FichasData = {
    TIPOS_PREGUNTA,
    AREAS_SEED,
    TIPOS_FICHA_SEED,
    AREA_COLORES,
    SEED_FICHAS,
    load,
    save,
    ready,
    findById,
    upsert,
    remove,
    duplicar,
    tipoPreguntaLabel,
    areaNombre,
    tipoFichaNombre,
  };
})();
