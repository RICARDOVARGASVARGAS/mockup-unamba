/**
 * entidades-receptoras-data.js — entidades + tipos_estado_derivacion por entidad.
 */
(function () {
  const STORAGE_KEY = "tutortrack-entidades-receptoras";
  const VERSION_KEY = "tutortrack-entidades-receptoras-version";
  const STORAGE_VERSION = "ent-v2-pipeline";

  const SEED_ENTIDADES = [
    {
      id: "ent-1",
      clave: "psicologia",
      nombre: "Psicología",
      descripcion: "Atención psicológica y bienestar emocional",
      activo: true,
    },
    {
      id: "ent-2",
      clave: "servicios_medicos",
      nombre: "Servicios médicos",
      descripcion: "Atención médica y salud física",
      activo: true,
    },
    {
      id: "ent-3",
      clave: "bienestar",
      nombre: "Bienestar universitario",
      descripcion: "Orientación y apoyo socioeducativo",
      activo: true,
    },
  ];

  const SEED_ESTADOS = {
    "ent-1": [
      { id: "est-p1", clave: "derivado", nombre: "Derivado", orden: 1, activo: true },
      { id: "est-p2", clave: "en_evaluacion", nombre: "En evaluación psicológica", orden: 2, activo: true },
      { id: "est-p3", clave: "en_terapia", nombre: "En terapia", orden: 3, activo: true },
      { id: "est-p4", clave: "resuelto", nombre: "Resuelto", orden: 4, activo: true },
      { id: "est-p5", clave: "cerrado", nombre: "Cerrado", orden: 5, activo: true },
      { id: "est-p6", clave: "no_asiste", nombre: "No asiste", orden: 6, activo: false },
      { id: "est-p7", clave: "rechazado", nombre: "Rechazado por el estudiante", orden: 7, activo: false },
    ],
    "ent-2": [
      { id: "est-m1", clave: "derivado", nombre: "Derivado", orden: 1, activo: true },
      { id: "est-m2", clave: "en_consulta", nombre: "En consulta", orden: 2, activo: true },
      { id: "est-m3", clave: "en_tratamiento", nombre: "En tratamiento", orden: 3, activo: true },
      { id: "est-m4", clave: "alta", nombre: "Alta médica", orden: 4, activo: true },
      { id: "est-m5", clave: "cerrado", nombre: "Cerrado", orden: 5, activo: true },
    ],
    "ent-3": [
      { id: "est-b1", clave: "derivado", nombre: "Derivado", orden: 1, activo: true },
      { id: "est-b2", clave: "en_orientacion", nombre: "En orientación", orden: 2, activo: true },
      { id: "est-b3", nombre: "En seguimiento", clave: "en_seguimiento", orden: 3, activo: true },
      { id: "est-b4", clave: "cerrado", nombre: "Cerrado", orden: 4, activo: true },
    ],
  };

  /** Entidades con derivaciones (no se eliminan). */
  const CON_DERIVACIONES = new Set(["ent-1", "ent-2"]);

  let cached = null;

  function ensureVersion() {
    if (sessionStorage.getItem(VERSION_KEY) !== STORAGE_VERSION) {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
  }

  function defaultState() {
    return {
      entidades: SEED_ENTIDADES.map((e) => ({ ...e })),
      estados: JSON.parse(JSON.stringify(SEED_ESTADOS)),
    };
  }

  function loadState() {
    ensureVersion();
    if (cached) return cached;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.entidades && parsed?.estados) {
          cached = parsed;
          return cached;
        }
      }
    } catch (_) {
      /* ignore */
    }
    cached = defaultState();
    saveState(cached);
    return cached;
  }

  function saveState(state) {
    cached = state;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function entidades() {
    return loadState().entidades.map((e) => ({ ...e }));
  }

  function saveEntidades(rows) {
    const state = loadState();
    state.entidades = rows.map((e) => ({ ...e }));
    saveState(state);
  }

  function findEntidad(id) {
    return loadState().entidades.find((e) => e.id === id) || null;
  }

  function estadosDe(entidadId) {
    const list = loadState().estados[entidadId] || [];
    return list.map((e) => ({ ...e }));
  }

  function saveEstados(entidadId, list) {
    const state = loadState();
    state.estados[entidadId] = list.map((e) => ({ ...e }));
    saveState(state);
  }

  function conteoActivos(entidadId) {
    return estadosDe(entidadId).filter((e) => e.activo !== false).length;
  }

  function tieneEstados(entidadId) {
    return estadosDe(entidadId).length > 0;
  }

  function puedeEliminar(entidadId) {
    if (CON_DERIVACIONES.has(entidadId)) return false;
    if (tieneEstados(entidadId)) return false;
    return true;
  }

  function motivoBloqueo(entidadId) {
    if (CON_DERIVACIONES.has(entidadId)) {
      return "Tiene derivaciones asociadas.";
    }
    if (tieneEstados(entidadId)) {
      return "Tiene estados de derivación configurados.";
    }
    return "";
  }

  window.EntidadesReceptorasData = {
    SEED_ENTIDADES,
    ready: () => Promise.resolve(loadState()),
    entidades,
    saveEntidades,
    findEntidad,
    estadosDe,
    saveEstados,
    conteoActivos,
    puedeEliminar,
    motivoBloqueo,
    resumen() {
      const list = entidades();
      const total = list.length;
      const activos = list.filter((e) => e.activo !== false).length;
      return { total, activos, inactivos: total - activos };
    },
  };
})();
