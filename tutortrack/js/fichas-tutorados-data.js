/**
 * fichas-tutorados-data.js — estado de llenado de fichas por tutorado (vista docente).
 * Modela ficha_respuesta: qué estado tiene cada estudiante en cada ficha asignada.
 */
(function () {
  const STORAGE_KEY     = "tutortrack-fichas-tutorados";
  const VERSION_KEY     = "tutortrack-fichas-tutorados-version";
  const STORAGE_VERSION = "seed-26-v1";

  /* Fichas disponibles para el docente (clonadas al cp) */
  const FICHAS_DOCENTE = [
    { id: "fcp-1", nombre: "Ficha diagnóstica inicial", tipo_ficha_id: "tf-1", ciclo: "1° Ciclo", periodo: "2026-I" },
    { id: "fcp-2", nombre: "Seguimiento mensual",       tipo_ficha_id: "tf-2", ciclo: "1° Ciclo", periodo: "2026-I" },
  ];

  /* 16 tutorados del docente (doc-01) en cp-301 */
  const SEED_TUTORADOS = [
    { id: "est-01", nombre: "Ana Lucía Quispe Mamani",    codigo: "2022-AD-0021", foto: "" },
    { id: "est-02", nombre: "Carlos Renzo Huanca Flores", codigo: "2022-AD-0034", foto: "" },
    { id: "est-03", nombre: "Diana Paola Torres Sánchez", codigo: "2022-AD-0047", foto: "" },
    { id: "est-04", nombre: "Edwin Saúl Condori Mamani",  codigo: "2022-AD-0058", foto: "" },
    { id: "est-05", nombre: "Fernanda Isabel Ríos Chávez",codigo: "2022-AD-0063", foto: "" },
    { id: "est-06", nombre: "Gianmarco Pérez Vargas",     codigo: "2022-AD-0072", foto: "" },
    { id: "est-07", nombre: "Huanca Quispe Yesenia",      codigo: "2022-AD-0081", foto: "" },
    { id: "est-08", nombre: "Iris Milagros Cárdenas Paz", codigo: "2022-AD-0099", foto: "" },
    { id: "est-09", nombre: "Jesús Antonio Llave Cruz",   codigo: "2022-AD-0102", foto: "" },
    { id: "est-10", nombre: "Karen Soledad Apaza Yucra",  codigo: "2022-AD-0115", foto: "" },
    { id: "est-11", nombre: "Luis Enrique Puma Coaquira", codigo: "2022-AD-0128", foto: "" },
    { id: "est-12", nombre: "María del Rosario Ccopa",    codigo: "2022-AD-0134", foto: "" },
    { id: "est-13", nombre: "Néstor Alfredo Sucari Vila", codigo: "2022-AD-0147", foto: "" },
    { id: "est-14", nombre: "Olinda Beatriz Ramos Inca",  codigo: "2022-AD-0152", foto: "" },
    { id: "est-15", nombre: "Pablo Rodrigo Vilca Ticona", codigo: "2022-AD-0163", foto: "" },
    { id: "est-16", nombre: "Qori Mañanita Yupanqui",     codigo: "2022-AD-0178", foto: "" },
  ];

  /* Estado por (fichaId, estudianteId): pendiente | borrador | enviada */
  const SEED_ESTADOS = {
    "fcp-1": {
      "est-01": { estado: "enviada",   fecha_envio: "2026-03-18" },
      "est-02": { estado: "enviada",   fecha_envio: "2026-03-17" },
      "est-03": { estado: "enviada",   fecha_envio: "2026-03-20" },
      "est-04": { estado: "enviada",   fecha_envio: "2026-03-19" },
      "est-05": { estado: "enviada",   fecha_envio: "2026-03-18" },
      "est-06": { estado: "enviada",   fecha_envio: "2026-03-21" },
      "est-07": { estado: "enviada",   fecha_envio: "2026-03-16" },
      "est-08": { estado: "enviada",   fecha_envio: "2026-03-22" },
      "est-09": { estado: "borrador",  fecha_envio: null },
      "est-10": { estado: "borrador",  fecha_envio: null },
      "est-11": { estado: "borrador",  fecha_envio: null },
      "est-12": { estado: "borrador",  fecha_envio: null },
      "est-13": { estado: "pendiente", fecha_envio: null },
      "est-14": { estado: "pendiente", fecha_envio: null },
      "est-15": { estado: "pendiente", fecha_envio: null },
      "est-16": { estado: "pendiente", fecha_envio: null },
    },
    "fcp-2": {
      "est-01": { estado: "enviada",   fecha_envio: "2026-04-15" },
      "est-02": { estado: "enviada",   fecha_envio: "2026-04-14" },
      "est-03": { estado: "borrador",  fecha_envio: null },
      "est-04": { estado: "pendiente", fecha_envio: null },
      "est-05": { estado: "pendiente", fecha_envio: null },
      "est-06": { estado: "enviada",   fecha_envio: "2026-04-16" },
      "est-07": { estado: "pendiente", fecha_envio: null },
      "est-08": { estado: "borrador",  fecha_envio: null },
      "est-09": { estado: "pendiente", fecha_envio: null },
      "est-10": { estado: "pendiente", fecha_envio: null },
      "est-11": { estado: "pendiente", fecha_envio: null },
      "est-12": { estado: "pendiente", fecha_envio: null },
      "est-13": { estado: "pendiente", fecha_envio: null },
      "est-14": { estado: "pendiente", fecha_envio: null },
      "est-15": { estado: "pendiente", fecha_envio: null },
      "est-16": { estado: "pendiente", fecha_envio: null },
    },
  };

  let _data   = null;

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
      _data = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(SEED_ESTADOS));
    } catch (_) {
      _data = JSON.parse(JSON.stringify(SEED_ESTADOS));
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(_data));
    return _data;
  }

  function getEstados(fichaId) {
    return load()[fichaId] || {};
  }

  function getTutorados() {
    return SEED_TUTORADOS;
  }

  function getFichas() {
    return FICHAS_DOCENTE;
  }

  window.FichasTutoradosData = { load, getEstados, getTutorados, getFichas };
})();
