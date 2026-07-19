/**
 * gestion-periodo-data.js — seed para la pantalla de Gestión del período.
 * Modela: periodo_academico, ciclo, ciclo_periodo, docente_ciclo_periodo.
 */
(function () {
  const STORAGE_KEY   = "tutortrack-gestion-periodo";
  const VERSION_KEY   = "tutortrack-gestion-periodo-version";
  const STORAGE_VERSION = "seed-26-v1";

  const PERIODOS = [
    { id: "per-1", nombre: "2025-I",  fecha_inicio: "2025-03-01", fecha_fin: "2025-07-31", activo: false },
    { id: "per-2", nombre: "2025-II", fecha_inicio: "2025-08-01", fecha_fin: "2025-12-31", activo: false },
    { id: "per-3", nombre: "2026-I",  fecha_inicio: "2026-03-01", fecha_fin: "2026-07-31", activo: true  },
  ];

  const CICLOS = [
    { id: "cic-1", nombre: "1° Ciclo", orden: 1 },
    { id: "cic-2", nombre: "2° Ciclo", orden: 2 },
    { id: "cic-3", nombre: "3° Ciclo", orden: 3 },
    { id: "cic-4", nombre: "4° Ciclo", orden: 4 },
    { id: "cic-5", nombre: "5° Ciclo", orden: 5 },
  ];

  /* docente_ciclo_periodo: qué docentes están asignados a cada ciclo×periodo */
  const SEED = {
    periodos: PERIODOS,
    ciclos:   CICLOS,
    /* ciclo_periodos[periodo_id][ciclo_id] = { id, n_estudiantes } */
    ciclo_periodos: {
      "per-2": {
        "cic-1": { id: "cp-201", n_estudiantes: 30 },
        "cic-2": { id: "cp-202", n_estudiantes: 27 },
        "cic-3": { id: "cp-203", n_estudiantes: 33 },
        "cic-4": { id: "cp-204", n_estudiantes: 25 },
        "cic-5": { id: "cp-205", n_estudiantes: 22 },
      },
      "per-3": {
        "cic-1": { id: "cp-301", n_estudiantes: 32 },
        "cic-2": { id: "cp-302", n_estudiantes: 28 },
        "cic-3": { id: "cp-303", n_estudiantes: 35 },
        "cic-4": { id: "cp-304", n_estudiantes: 24 },
        "cic-5": { id: "cp-305", n_estudiantes: 21 },
      },
    },
    /* docentes_asignados[ciclo_periodo_id] = array de { docente_id, nombre, foto_url } */
    docentes_asignados: {
      "cp-201": [
        { docente_id: "doc-01", nombre: "Mg. Vargas H.", foto_url: "" },
        { docente_id: "doc-02", nombre: "Lic. Torres M.", foto_url: "" },
      ],
      "cp-202": [{ docente_id: "doc-03", nombre: "Dr. Quispe R.", foto_url: "" }],
      "cp-203": [
        { docente_id: "doc-01", nombre: "Mg. Vargas H.", foto_url: "" },
        { docente_id: "doc-04", nombre: "Mg. Flores C.", foto_url: "" },
      ],
      "cp-204": [{ docente_id: "doc-02", nombre: "Lic. Torres M.", foto_url: "" }],
      "cp-205": [{ docente_id: "doc-05", nombre: "Lic. Mamani J.", foto_url: "" }],
      "cp-301": [
        { docente_id: "doc-01", nombre: "Mg. Vargas H.", foto_url: "" },
        { docente_id: "doc-02", nombre: "Lic. Torres M.", foto_url: "" },
      ],
      "cp-302": [{ docente_id: "doc-03", nombre: "Dr. Quispe R.", foto_url: "" }],
      "cp-303": [
        { docente_id: "doc-01", nombre: "Mg. Vargas H.", foto_url: "" },
        { docente_id: "doc-04", nombre: "Mg. Flores C.", foto_url: "" },
      ],
      "cp-304": [{ docente_id: "doc-02", nombre: "Lic. Torres M.", foto_url: "" }],
      "cp-305": [{ docente_id: "doc-05", nombre: "Lic. Mamani J.", foto_url: "" }],
    },
  };

  /* Todos los docentes disponibles para asignar */
  const DOCENTES_DISPONIBLES = [
    { id: "doc-01", nombre: "Mg. Carlos Vargas Huanca" },
    { id: "doc-02", nombre: "Lic. Ana Torres Mendoza" },
    { id: "doc-03", nombre: "Dr. Roberto Quispe Ramos" },
    { id: "doc-04", nombre: "Mg. Patricia Flores Cárdenas" },
    { id: "doc-05", nombre: "Lic. Jorge Mamani Juárez" },
    { id: "doc-06", nombre: "Mg. Elena Condori Apaza" },
    { id: "doc-07", nombre: "Lic. Miguel Soto Vega" },
  ];

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
      if (raw) { _data = JSON.parse(raw); return _data; }
    } catch (_) { /* ignore */ }
    _data = JSON.parse(JSON.stringify(SEED));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(_data));
    return _data;
  }

  function save(data) {
    _data = data;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function periodoActivo(data) {
    return data.periodos.find((p) => p.activo) || data.periodos[data.periodos.length - 1];
  }

  function setActivoPeriodo(data, periodoId) {
    data.periodos.forEach((p) => { p.activo = (p.id === periodoId); });
    save(data);
  }

  function getCicloPeriodoId(data, periodoId, cicloId) {
    return data.ciclo_periodos[periodoId]?.[cicloId]?.id || null;
  }

  function getDocentesAsignados(data, cpId) {
    return (data.docentes_asignados[cpId] || []).slice();
  }

  function setDocentesAsignados(data, cpId, docentes) {
    data.docentes_asignados[cpId] = docentes;
    save(data);
  }

  function addPeriodo(data, nombre, fecha_inicio, fecha_fin) {
    const id = `per-${Date.now()}`;
    data.periodos.push({ id, nombre, fecha_inicio: fecha_inicio || "", fecha_fin: fecha_fin || "", activo: false });
    save(data);
    return id;
  }

  function clonarPeriodo(data, origenId, destinoId) {
    const origen   = data.ciclo_periodos[origenId];
    const destino  = data.ciclo_periodos[destinoId] || {};
    if (!origen) return;
    data.ciclo_periodos[destinoId] = {};
    Object.entries(origen).forEach(([cicloId, cp]) => {
      const newCpId = `cp-${Date.now()}-${cicloId}`;
      data.ciclo_periodos[destinoId][cicloId] = { id: newCpId, n_estudiantes: 0 };
      const docentesOrigen = data.docentes_asignados[cp.id] || [];
      data.docentes_asignados[newCpId] = docentesOrigen.slice();
    });
    save(data);
  }

  window.GestionPeriodoData = {
    DOCENTES_DISPONIBLES,
    load,
    save,
    periodoActivo,
    setActivoPeriodo,
    getCicloPeriodoId,
    getDocentesAsignados,
    setDocentesAsignados,
    addPeriodo,
    clonarPeriodo,
  };
})();
