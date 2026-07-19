/**
 * mis-fichas-data.js — fichas asignadas al estudiante (vista estudiante).
 */
(function () {
  const STORAGE_KEY     = "tutortrack-mis-fichas";
  const VERSION_KEY     = "tutortrack-mis-fichas-version";
  const STORAGE_VERSION = "seed-26-v1";

  const TIPO_BADGE = {
    "tf-1": "badge-primary",
    "tf-2": "badge-success",
    "tf-3": "badge-neutral",
  };

  const SEED = [
    {
      id: "mf-1",
      fcp_id: "fcp-1",
      nombre: "Ficha diagnóstica inicial",
      tipo_ficha_id: "tf-1",
      tipo_nombre: "Diagnóstica",
      ciclo: "1° Ciclo",
      periodo: "2026-I",
      n_preguntas: 5,
      fecha_limite: "2026-03-25",
      estado: "enviada",
      fecha_envio: "2026-03-18",
    },
    {
      id: "mf-2",
      fcp_id: "fcp-2",
      nombre: "Seguimiento mensual",
      tipo_ficha_id: "tf-2",
      tipo_nombre: "Seguimiento",
      ciclo: "1° Ciclo",
      periodo: "2026-I",
      n_preguntas: 3,
      fecha_limite: "2026-04-20",
      estado: "en_progreso",
      fecha_envio: null,
    },
    {
      id: "mf-3",
      fcp_id: "fcp-3",
      nombre: "Encuesta de cierre",
      tipo_ficha_id: "tf-3",
      tipo_nombre: "Cierre",
      ciclo: "1° Ciclo",
      periodo: "2026-I",
      n_preguntas: 1,
      fecha_limite: "2026-07-15",
      estado: "pendiente",
      fecha_envio: null,
    },
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
      _data = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(SEED));
    } catch (_) {
      _data = JSON.parse(JSON.stringify(SEED));
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(_data));
    return _data;
  }

  function marcarEnviada(id) {
    const data = load();
    const f = data.find((x) => x.id === id);
    if (f) {
      f.estado = "enviada";
      f.fecha_envio = new Date().toISOString().slice(0, 10);
      _data = data;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }

  window.MisFichasData = { load, marcarEnviada, TIPO_BADGE };
})();
