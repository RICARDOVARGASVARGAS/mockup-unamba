/**
 * usuarios-data.js — store mockup Usuario (admin, coordinador, receptor).
 * Docentes y estudiantes tienen sus propias pantallas; aquí solo
 * los usuarios que no caben en esas categorías.
 */
(function () {
  const STORAGE_KEY = "tutortrack-usuarios";
  const VERSION_KEY = "tutortrack-usuarios-version";
  const STORAGE_VERSION = "seed-26-v1";

  const AVATAR_M = "assets/img/avatares/usuario-m.svg";
  const AVATAR_F = "assets/img/avatares/usuario-f.svg";

  const SEED = [
    {
      id: "usr-01",
      tipo_documento_id: "td-1",
      documento: "40123456",
      nombres: "Ricardo",
      apellido_paterno: "Vargas",
      apellido_materno: "Vargas",
      sexo: "M",
      fecha_nacimiento: "1980-03-15",
      email: "r.vargas@unamba.edu.pe",
      email_personal: "vargasvargas.ric@gmail.com",
      celular_principal: "900100001",
      celular_secundario: "",
      foto_perfil_url: "assets/img/admin/ricardo-vargas.jpg",
      activo: true,
      rolIds: ["rol-1"],
    },
    {
      id: "usr-02",
      tipo_documento_id: "td-1",
      documento: "41234567",
      nombres: "Carmen Lucía",
      apellido_paterno: "López",
      apellido_materno: "Mendoza",
      sexo: "F",
      fecha_nacimiento: "1978-07-22",
      email: "c.lopez@unamba.edu.pe",
      email_personal: "",
      celular_principal: "900100002",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      rolIds: ["rol-4"],
    },
    {
      id: "usr-03",
      tipo_documento_id: "td-1",
      documento: "42345678",
      nombres: "Diana Patricia",
      apellido_paterno: "Torres",
      apellido_materno: "Quispe",
      sexo: "F",
      fecha_nacimiento: "1985-11-08",
      email: "d.torres@unamba.edu.pe",
      email_personal: "dianatorres85@gmail.com",
      celular_principal: "900100003",
      celular_secundario: "900100030",
      foto_perfil_url: "",
      activo: true,
      rolIds: ["rol-5"],
    },
    {
      id: "usr-04",
      tipo_documento_id: "td-1",
      documento: "43456789",
      nombres: "Marco Antonio",
      apellido_paterno: "Fernández",
      apellido_materno: "Huanca",
      sexo: "M",
      fecha_nacimiento: "1982-05-19",
      email: "m.fernandez@unamba.edu.pe",
      email_personal: "",
      celular_principal: "900100004",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      rolIds: ["rol-6"],
    },
    {
      id: "usr-05",
      tipo_documento_id: "td-1",
      documento: "44567890",
      nombres: "Lucía",
      apellido_paterno: "Quispe",
      apellido_materno: "Apaza",
      sexo: "F",
      fecha_nacimiento: "1990-01-30",
      email: "l.quispe@unamba.edu.pe",
      email_personal: "",
      celular_principal: "900100005",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: false,
      rolIds: ["rol-7"],
    },
  ];

  /* ----- helpers de roles (seed compartido con roles-permisos.js) ----- */

  const ROLES_LABEL = {
    "rol-1": "Administrador",
    "rol-2": "Docente-Tutor",
    "rol-3": "Estudiante",
    "rol-4": "Coordinador de tutoría",
    "rol-5": "Psicólogo",
    "rol-6": "Servicios médicos",
    "rol-7": "Trabajo social",
  };

  function rolesLabel(rolIds) {
    return (rolIds || []).map((id) => ROLES_LABEL[id] || id);
  }

  /* ----- store ----- */

  let cachedSeed = null;
  let readyPromise = null;

  function normalizeRow(row) {
    return {
      ...row,
      email: row.email || "",
      email_personal: row.email_personal || "",
      celular_principal: row.celular_principal || "",
      celular_secundario: row.celular_secundario || "",
      activo: row.activo !== false,
      foto_perfil_url: row.foto_perfil_url || "",
      rolIds: row.rolIds || [],
    };
  }

  function cloneRows(rows) {
    return (rows || []).map(normalizeRow);
  }

  function ensureVersion() {
    if (sessionStorage.getItem(VERSION_KEY) !== STORAGE_VERSION) {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
  }

  function getSeed() {
    if (!cachedSeed) cachedSeed = cloneRows(SEED);
    return cachedSeed;
  }

  function ready() {
    if (readyPromise) return readyPromise;
    ensureVersion();
    readyPromise = Promise.resolve().then(() => {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length) return cloneRows(parsed);
        }
      } catch (_) { /* ignore */ }
      const seed = getSeed();
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return cloneRows(seed);
    });
    return readyPromise;
  }

  function load() {
    ensureVersion();
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return cloneRows(parsed);
      }
    } catch (_) { /* ignore */ }
    return cloneRows(getSeed());
  }

  function save(rows) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }

  function findById(id) {
    return load().find((r) => r.id === id) || null;
  }

  function upsert(row) {
    const rows = load();
    const normalized = normalizeRow(row);
    const idx = rows.findIndex((r) => r.id === normalized.id);
    if (idx === -1) rows.unshift(normalized);
    else rows[idx] = normalized;
    save(rows);
    return normalized;
  }

  function remove(id) {
    save(load().filter((r) => r.id !== id));
  }

  function nombreCompleto(row) {
    return [row.nombres, row.apellido_paterno, row.apellido_materno].filter(Boolean).join(" ").trim();
  }

  function iniciales(row) {
    const n = (row.nombres || "?").trim().charAt(0);
    const a = (row.apellido_paterno || "?").trim().charAt(0);
    return (n + a).toUpperCase();
  }

  function fotoSrc(row) {
    if (row && row.foto_perfil_url) return row.foto_perfil_url;
    return row && row.sexo === "F" ? AVATAR_F : AVATAR_M;
  }

  function resolveFotoUrl(url) {
    if (!url) return "";
    if (url.startsWith("data:") || url.startsWith("blob:") || /^https?:\/\//i.test(url)) return url;
    return "../../" + String(url).replace(/^\.\.\//, "");
  }

  async function resetFromSeed() {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    cachedSeed = null;
    readyPromise = null;
    return ready();
  }

  window.UsuariosData = {
    AVATAR_M,
    AVATAR_F,
    ROLES_LABEL,
    SEED,
    ready,
    resetFromSeed,
    load,
    save,
    findById,
    upsert,
    remove,
    nombreCompleto,
    iniciales,
    fotoSrc,
    resolveFotoUrl,
    rolesLabel,
  };
})();
