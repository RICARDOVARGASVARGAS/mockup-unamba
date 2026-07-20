/**
 * usuarios-data.js — identidad maestra (usuario + roles + perfiles opcionales).
 * Perfiles acumulables: docente / estudiante / receptor (refs a sus stores).
 */
(function () {
  const STORAGE_KEY = "tutortrack-usuarios";
  const VERSION_KEY = "tutortrack-usuarios-version";
  const STORAGE_VERSION = "seed-maestro-v2-perfiles";
  const FROM_USUARIO_KEY = "tutortrack-perfil-from-usuario";

  const AVATAR_M = "assets/img/avatares/usuario-m.svg";
  const AVATAR_F = "assets/img/avatares/usuario-f.svg";

  const ROLES = [
    { id: "rol-1", nombre: "Administrador", activo: true, implica: null },
    { id: "rol-2", nombre: "Docente-Tutor", activo: true, implica: "docente" },
    { id: "rol-3", nombre: "Estudiante", activo: true, implica: "estudiante" },
    { id: "rol-4", nombre: "Coordinador de tutoría", activo: true, implica: null },
    { id: "rol-5", nombre: "Receptor", activo: true, implica: "receptor" },
  ];

  const PERFIL_LABEL = {
    docente: "Docente",
    estudiante: "Estudiante",
    receptor: "Receptor",
  };

  const PERFIL_FORM = {
    docente: "docentes-form.html",
    estudiante: "estudiantes-form.html",
    receptor: "receptores-form.html",
  };

  const PERFIL_VER = {
    docente: "docentes-ver.html",
    estudiante: "estudiantes-ver.html",
    receptor: "receptores-ver.html",
  };

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
      roles: ["rol-1"],
      perfiles: {},
      created_at: "2026-01-10T08:00:00",
      updated_at: "2026-07-18T10:00:00",
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
      roles: ["rol-4"],
      perfiles: {},
    },
    {
      id: "usr-03",
      tipo_documento_id: "td-1",
      documento: "45678912",
      nombres: "Carlos",
      apellido_paterno: "Quispe",
      apellido_materno: "Mamani",
      sexo: "M",
      fecha_nacimiento: "1985-03-14",
      email: "c.quispe@unamba.edu.pe",
      email_personal: "c.quispe.personal@gmail.com",
      celular_principal: "910000011",
      celular_secundario: "",
      foto_perfil_url: "assets/img/docentes/docente-1.jpg",
      activo: true,
      roles: ["rol-2", "rol-1"],
      perfiles: { docente: "doc-01" },
    },
    {
      id: "usr-04",
      tipo_documento_id: "td-1",
      documento: "40111223",
      nombres: "María Elena",
      apellido_paterno: "Huamán",
      apellido_materno: "Torres",
      sexo: "F",
      fecha_nacimiento: "1988-07-22",
      email: "m.huaman@unamba.edu.pe",
      email_personal: "",
      celular_principal: "910000028",
      celular_secundario: "",
      foto_perfil_url: "assets/img/docentes/docente-2.jpg",
      activo: true,
      roles: ["rol-2", "rol-4"],
      perfiles: { docente: "doc-02" },
    },
    {
      id: "usr-05",
      tipo_documento_id: "td-1",
      documento: "71234567",
      nombres: "Ana Sofía",
      apellido_paterno: "Mamani",
      apellido_materno: "Flores",
      sexo: "F",
      fecha_nacimiento: "2003-04-12",
      email: "a.mamani@unamba.edu.pe",
      email_personal: "anasofia.mf@gmail.com",
      celular_principal: "920111001",
      celular_secundario: "",
      foto_perfil_url: "assets/img/estudiantes/estudiante-1.jpg",
      activo: true,
      roles: ["rol-3"],
      perfiles: { estudiante: "est-01" },
    },
    {
      id: "usr-06",
      tipo_documento_id: "td-1",
      documento: "72345678",
      nombres: "Diego Andrés",
      apellido_paterno: "Quispe",
      apellido_materno: "Huamán",
      sexo: "M",
      fecha_nacimiento: "2002-09-28",
      email: "d.quispe@unamba.edu.pe",
      email_personal: "",
      celular_principal: "920111002",
      celular_secundario: "",
      foto_perfil_url: "assets/img/estudiantes/estudiante-2.jpg",
      activo: true,
      roles: ["rol-3"],
      perfiles: { estudiante: "est-02" },
    },
    {
      id: "usr-07",
      tipo_documento_id: "td-1",
      documento: "41235678",
      nombres: "Rosa",
      apellido_paterno: "Medina",
      apellido_materno: "Ccahua",
      sexo: "F",
      fecha_nacimiento: "1985-06-12",
      email: "r.medina@unamba.edu.pe",
      email_personal: "rosa.medina@gmail.com",
      celular_principal: "930111001",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      roles: ["rol-5"],
      perfiles: { receptor: "rec-01" },
    },
    {
      id: "usr-08",
      tipo_documento_id: "td-1",
      documento: "42346789",
      nombres: "Luis Alberto",
      apellido_paterno: "Vargas",
      apellido_materno: "Poma",
      sexo: "M",
      fecha_nacimiento: "1980-03-22",
      email: "l.vargas@unamba.edu.pe",
      email_personal: "",
      celular_principal: "930111002",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      roles: ["rol-5"],
      perfiles: { receptor: "rec-02" },
    },
    {
      id: "usr-09",
      tipo_documento_id: "td-1",
      documento: "48990011",
      nombres: "Fernando",
      apellido_paterno: "Cárdenas",
      apellido_materno: "López",
      sexo: "M",
      fecha_nacimiento: "1984-02-19",
      email: "f.cardenas@unamba.edu.pe",
      email_personal: "",
      celular_principal: "",
      celular_secundario: "",
      foto_perfil_url: "assets/img/docentes/docente-1.jpg",
      activo: true,
      roles: ["rol-2"],
      perfiles: { docente: "doc-09" },
    },
    {
      id: "usr-10",
      tipo_documento_id: "td-1",
      documento: "44568901",
      nombres: "Paola",
      apellido_paterno: "Ríos",
      apellido_materno: "Cabrera",
      sexo: "F",
      fecha_nacimiento: "1992-08-11",
      email: "p.rios@unamba.edu.pe",
      email_personal: "",
      celular_principal: "900100010",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: false,
      roles: ["rol-4"],
      perfiles: {},
    },
    {
      id: "usr-11",
      tipo_documento_id: "td-1",
      documento: "77890123",
      nombres: "Pedro Antonio",
      apellido_paterno: "Huanca",
      apellido_materno: "Apaza",
      sexo: "M",
      fecha_nacimiento: "2000-12-30",
      email: "p.huanca@unamba.edu.pe",
      email_personal: "",
      celular_principal: "",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      roles: ["rol-3"],
      perfiles: { estudiante: "est-08" },
    },
    {
      id: "usr-12",
      tipo_documento_id: "td-1",
      documento: "45679012",
      nombres: "Elena",
      apellido_paterno: "Condori",
      apellido_materno: "Ramos",
      sexo: "F",
      fecha_nacimiento: "1990-01-30",
      email: "e.condori@unamba.edu.pe",
      email_personal: "",
      celular_principal: "930111005",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: false,
      roles: ["rol-5"],
      perfiles: { receptor: "rec-05" },
    },
  ];

  let cachedSeed = null;
  let readyPromise = null;

  function emptyPerfiles() {
    return { docente: null, estudiante: null, receptor: null };
  }

  function normalizePerfiles(p) {
    const base = emptyPerfiles();
    if (!p || typeof p !== "object") return base;
    ["docente", "estudiante", "receptor"].forEach((k) => {
      if (p[k]) base[k] = p[k];
    });
    return base;
  }

  function normalizeRow(row) {
    const roles = [...(row.roles || row.rolIds || [])];
    return {
      ...row,
      email: row.email || "",
      email_personal: row.email_personal || "",
      celular_principal: row.celular_principal || "",
      celular_secundario: row.celular_secundario || "",
      activo: row.activo !== false,
      foto_perfil_url: row.foto_perfil_url || "",
      roles,
      rolIds: roles,
      perfiles: normalizePerfiles(row.perfiles),
      created_at: row.created_at || "2026-02-03T11:02:00",
      updated_at: row.updated_at || "2026-07-18T14:32:00",
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
      } catch (_) {
        /* ignore */
      }
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
    } catch (_) {
      /* ignore */
    }
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
    delete normalized.rolIds;
    normalized.rolIds = normalized.roles;
    const idx = rows.findIndex((r) => r.id === normalized.id);
    if (idx === -1) rows.unshift(normalized);
    else rows[idx] = { ...rows[idx], ...normalized, perfiles: normalized.perfiles };
    save(rows);
    return normalized;
  }

  function remove(id) {
    save(load().filter((r) => r.id !== id));
  }

  function setActivo(id, activo) {
    const rows = load();
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    rows[idx] = { ...rows[idx], activo: Boolean(activo), updated_at: new Date().toISOString() };
    save(rows);
    return rows[idx];
  }

  function linkPerfil(usuarioId, tipo, perfilId) {
    const rows = load();
    const idx = rows.findIndex((r) => r.id === usuarioId);
    if (idx === -1) return null;
    const perfiles = normalizePerfiles(rows[idx].perfiles);
    perfiles[tipo] = perfilId;
    rows[idx] = { ...rows[idx], perfiles, updated_at: new Date().toISOString() };
    save(rows);
    return rows[idx];
  }

  function unlinkPerfil(usuarioId, tipo) {
    const rows = load();
    const idx = rows.findIndex((r) => r.id === usuarioId);
    if (idx === -1) return null;
    const perfiles = normalizePerfiles(rows[idx].perfiles);
    perfiles[tipo] = null;
    rows[idx] = { ...rows[idx], perfiles, updated_at: new Date().toISOString() };
    save(rows);
    return rows[idx];
  }

  function tienePerfil(row, tipo) {
    return Boolean(row?.perfiles?.[tipo]);
  }

  function listaPerfiles(row) {
    const p = normalizePerfiles(row?.perfiles);
    return ["docente", "estudiante", "receptor"].filter((k) => p[k]);
  }

  function tieneAlgúnPerfil(row) {
    return listaPerfiles(row).length > 0;
  }

  function nombreCompleto(row) {
    return [row.nombres, row.apellido_paterno, row.apellido_materno].filter(Boolean).join(" ").trim();
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

  function rolesActivos() {
    return ROLES.filter((r) => r.activo !== false);
  }

  function rolNombre(id) {
    return ROLES.find((r) => r.id === id)?.nombre || id;
  }

  function rolesLabel(ids) {
    return (ids || []).map((id) => rolNombre(id)).filter(Boolean);
  }

  function resumenCounts(rows) {
    const list = rows || load();
    const total = list.length;
    const activos = list.filter((r) => r.activo !== false).length;
    return { total, activos, inactivos: total - activos };
  }

  /** Prepara identidad para abrir form de perfil (Agregar perfil). */
  function stashForPerfil(usuarioId, tipo) {
    const u = findById(usuarioId);
    if (!u || !PERFIL_FORM[tipo]) return null;
    const payload = {
      usuario_id: u.id,
      tipo,
      tipo_documento_id: u.tipo_documento_id,
      documento: u.documento,
      nombres: u.nombres,
      apellido_paterno: u.apellido_paterno,
      apellido_materno: u.apellido_materno,
      sexo: u.sexo,
      fecha_nacimiento: u.fecha_nacimiento,
      email: u.email,
      email_personal: u.email_personal,
      celular_principal: u.celular_principal,
      celular_secundario: u.celular_secundario,
      foto_perfil_url: u.foto_perfil_url,
      activo: u.activo,
    };
    sessionStorage.setItem(FROM_USUARIO_KEY, JSON.stringify(payload));
    return PERFIL_FORM[tipo];
  }

  function consumeStashForPerfil() {
    try {
      const raw = sessionStorage.getItem(FROM_USUARIO_KEY);
      if (!raw) return null;
      sessionStorage.removeItem(FROM_USUARIO_KEY);
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function peekStashForPerfil() {
    try {
      const raw = sessionStorage.getItem(FROM_USUARIO_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  async function resetFromSeed() {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    cachedSeed = null;
    readyPromise = null;
    return ready();
  }

  window.UsuariosData = {
    ROLES,
    PERFIL_LABEL,
    PERFIL_FORM,
    PERFIL_VER,
    AVATAR_M,
    AVATAR_F,
    ROLES_LABEL: Object.fromEntries(ROLES.map((r) => [r.id, r.nombre])),
    SEED,
    ready,
    resetFromSeed,
    load,
    save,
    findById,
    upsert,
    remove,
    setActivo,
    linkPerfil,
    unlinkPerfil,
    tienePerfil,
    listaPerfiles,
    tieneAlgúnPerfil,
    nombreCompleto,
    fotoSrc,
    resolveFotoUrl,
    rolesActivos,
    rolNombre,
    rolesLabel,
    resumenCounts,
    stashForPerfil,
    consumeStashForPerfil,
    peekStashForPerfil,
  };
})();
