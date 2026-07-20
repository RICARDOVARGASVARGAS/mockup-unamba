/**
 * tipos-documento-data.js — seed compartido (listado + formularios de persona).
 */
(function () {
  const STORAGE_KEY = "tutortrack-tipos-documento";
  const VERSION_KEY = "tutortrack-tipos-documento-version";
  const STORAGE_VERSION = "td-v2-catalog-mold";

  const SEED = [
    { id: "td-1", clave: "DNI", nombre: "DNI", activo: true },
    { id: "td-2", clave: "CE", nombre: "Carné de Extranjería", activo: true },
    { id: "td-3", clave: "PAS", nombre: "Pasaporte", activo: true },
  ];

  function ensureVersion() {
    if (sessionStorage.getItem(VERSION_KEY) !== STORAGE_VERSION) {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
  }

  function load() {
    ensureVersion();
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed.map((r) => ({ ...r }));
      }
    } catch (_) {
      /* ignore */
    }
    const seed = SEED.map((r) => ({ ...r }));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed.map((r) => ({ ...r }));
  }

  function persist(rows) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }

  window.TiposDocumentoData = {
    SEED,
    STORAGE_KEY,
    VERSION_KEY,
    STORAGE_VERSION,
    load,
    persist,
    activos() {
      return load().filter((t) => t.activo !== false);
    },
    findById(id) {
      return load().find((t) => t.id === id) || null;
    },
    label(id) {
      return this.findById(id)?.nombre || id || "";
    },
    clave(id) {
      return this.findById(id)?.clave || "";
    },
  };
})();
