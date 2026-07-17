/**
 * tipos-documento-data.js — seed + sessionStorage del catálogo tipo_documento.
 * Usado por el listado admin y por formularios (docentes, etc.).
 */
(function () {
  const STORAGE_KEY = "tutortrack-tipos-documento";
  const VERSION_KEY = "tutortrack-tipos-documento-version";
  const STORAGE_VERSION = "td-v1";

  const SEED = [
    { id: "td-1", clave: "DNI", nombre: "DNI", activo: true, orden: 1 },
    { id: "td-2", clave: "CE", nombre: "Carné de Extranjería", activo: true, orden: 2 },
    { id: "td-3", clave: "PAS", nombre: "Pasaporte", activo: true, orden: 3 },
  ];

  function ensureVersion() {
    if (sessionStorage.getItem(VERSION_KEY) !== STORAGE_VERSION) {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
  }

  function loadSeed() {
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
    const seed = SEED.map((r) => ({ ...r }));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  function persist(rows) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }

  window.TiposDocumentoData = {
    SEED,
    STORAGE_KEY,
    load: loadSeed,
    persist,
    activos() {
      return loadSeed().filter((t) => t.activo);
    },
    findById(id) {
      return loadSeed().find((t) => t.id === id) || null;
    },
    label(id) {
      return this.findById(id)?.nombre || id || "";
    },
    clave(id) {
      return this.findById(id)?.clave || "";
    },
  };
})();
