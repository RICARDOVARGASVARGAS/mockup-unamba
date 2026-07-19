/**
 * fichas-ciclo-periodo-data.js — asignación de fichas a ciclo+período.
 * Modela la tabla ficha_ciclo_periodo: qué fichas están asignadas a cada cp.
 */
(function () {
  const STORAGE_KEY     = "tutortrack-fichas-cp";
  const VERSION_KEY     = "tutortrack-fichas-cp-version";
  const STORAGE_VERSION = "seed-26-v1";

  /* seed: fichas asignadas por ciclo_periodo_id */
  const SEED = {
    "cp-301": [
      {
        id: "fcp-1",
        ciclo_periodo_id: "cp-301",
        ficha_id: "ficha-1",
        nombre: "Ficha diagnóstica inicial",
        tipo_ficha_id: "tf-1",
        n_preguntas: 5,
        completadas: 21,
        total_estudiantes: 32,
        fecha_asignacion: "2026-03-05",
      },
      {
        id: "fcp-2",
        ciclo_periodo_id: "cp-301",
        ficha_id: "ficha-2",
        nombre: "Seguimiento mensual",
        tipo_ficha_id: "tf-2",
        n_preguntas: 3,
        completadas: 14,
        total_estudiantes: 32,
        fecha_asignacion: "2026-04-10",
      },
    ],
    "cp-302": [
      {
        id: "fcp-3",
        ciclo_periodo_id: "cp-302",
        ficha_id: "ficha-1",
        nombre: "Ficha diagnóstica inicial",
        tipo_ficha_id: "tf-1",
        n_preguntas: 5,
        completadas: 20,
        total_estudiantes: 28,
        fecha_asignacion: "2026-03-05",
      },
    ],
    "cp-303": [],
    "cp-304": [],
    "cp-305": [],
  };

  let _data = null;

  function ensureVersion() {
    if (sessionStorage.getItem(VERSION_KEY) !== STORAGE_VERSION) {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
  }

  function load(cpId) {
    ensureVersion();
    if (!_data) {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        _data = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(SEED));
      } catch (_) {
        _data = JSON.parse(JSON.stringify(SEED));
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(_data));
    }
    return cpId ? (_data[cpId] || []) : _data;
  }

  function save(data) {
    _data = data;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function asignar(cpId, ficha) {
    const data = load();
    if (!data[cpId]) data[cpId] = [];
    const ya = data[cpId].find((f) => f.ficha_id === ficha.id);
    if (ya) return null;
    const nuevo = {
      id: `fcp-${Date.now()}`,
      ciclo_periodo_id: cpId,
      ficha_id: ficha.id,
      nombre: ficha.nombre,
      tipo_ficha_id: ficha.tipo_ficha_id,
      n_preguntas: (ficha.preguntas || []).length,
      completadas: 0,
      total_estudiantes: 0,
      fecha_asignacion: new Date().toISOString().slice(0, 10),
    };
    data[cpId].push(nuevo);
    save(data);
    return nuevo;
  }

  function desasignar(cpId, fcpId) {
    const data = load();
    if (!data[cpId]) return;
    data[cpId] = data[cpId].filter((f) => f.id !== fcpId);
    save(data);
  }

  window.FichasCpData = { load, asignar, desasignar };
})();
