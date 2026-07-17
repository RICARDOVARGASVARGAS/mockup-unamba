/**
 * estudiantes-data.js — store mockup Estudiante (usuario + perfil estudiante).
 * Seed embebido (sin fetch) para que funcione sin Live Server.
 */
(function () {
  const STORAGE_KEY = "tutortrack-estudiantes";
  const VERSION_KEY = "tutortrack-estudiantes-version";
  const STORAGE_VERSION = "seed-25-v1-inline";

  const AVATAR_M = "assets/img/avatares/usuario-m.svg";
  const AVATAR_F = "assets/img/avatares/usuario-f.svg";

  const SEED = [
    {
      id: "est-01",
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
      codigo_universitario: "2021-1001",
      codigo_orcid: "",
    },
    {
      id: "est-02",
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
      celular_secundario: "920111099",
      foto_perfil_url: "assets/img/estudiantes/estudiante-2.jpg",
      activo: true,
      codigo_universitario: "2021-1002",
      codigo_orcid: "0000-0003-1111-2222",
    },
    {
      id: "est-03",
      tipo_documento_id: "td-1",
      documento: "73456789",
      nombres: "Valeria",
      apellido_paterno: "Condori",
      apellido_materno: "Ramos",
      sexo: "F",
      fecha_nacimiento: "2004-01-18",
      email: "v.condori@unamba.edu.pe",
      email_personal: "val.condori@outlook.com",
      celular_principal: "",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      codigo_universitario: "2022-1103",
      codigo_orcid: "",
    },
    {
      id: "est-04",
      tipo_documento_id: "td-1",
      documento: "74567890",
      nombres: "Luis Fernando",
      apellido_paterno: "Paucar",
      apellido_materno: "Torres",
      sexo: "M",
      fecha_nacimiento: "2001-11-03",
      email: "l.paucar@unamba.edu.pe",
      email_personal: "",
      celular_principal: "920111004",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      codigo_universitario: "2020-0904",
      codigo_orcid: "",
    },
    {
      id: "est-05",
      tipo_documento_id: "td-1",
      documento: "75678901",
      nombres: "Camila Elizabeth",
      apellido_paterno: "Chávez",
      apellido_materno: "Vargas",
      sexo: "F",
      fecha_nacimiento: "2003-07-21",
      email: "c.chavez@unamba.edu.pe",
      email_personal: "",
      celular_principal: "920111005",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: false,
      codigo_universitario: "2021-1005",
      codigo_orcid: "",
    },
    {
      id: "est-06",
      tipo_documento_id: "td-1",
      documento: "76789012",
      nombres: "Bruno",
      apellido_paterno: "Soto",
      apellido_materno: "Cárdenas",
      sexo: "M",
      fecha_nacimiento: "2002-02-14",
      email: "b.soto@unamba.edu.pe",
      email_personal: "bruno.soto@gmail.com",
      celular_principal: "920111006",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      codigo_universitario: "2021-1006",
      codigo_orcid: "0000-0002-3333-4444",
    },
    {
      id: "est-07",
      tipo_documento_id: "td-2",
      documento: "001234567",
      nombres: "Jimena",
      apellido_paterno: "Ríos",
      apellido_materno: "Mendoza",
      sexo: "F",
      fecha_nacimiento: "2004-05-09",
      email: "j.rios@unamba.edu.pe",
      email_personal: "",
      celular_principal: "920111007",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      codigo_universitario: "2023-1207",
      codigo_orcid: "",
    },
    {
      id: "est-08",
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
      codigo_universitario: "2019-0808",
      codigo_orcid: "",
    },
  ];

  let cachedSeed = null;
  let readyPromise = null;

  function normalizeRow(row) {
    return {
      ...row,
      email: row.email || row.correo_electronico || "",
      email_personal: row.email_personal || "",
      celular_principal: row.celular_principal || "",
      celular_secundario: row.celular_secundario || "",
      activo: row.activo !== false,
      codigo_universitario: row.codigo_universitario || "",
      codigo_orcid: row.codigo_orcid || "",
      foto_perfil_url: row.foto_perfil_url || "",
    };
  }

  function cloneRows(rows) {
    return (rows || []).map((row) => normalizeRow(row));
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
    delete normalized.correo_electronico;
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

  window.EstudiantesData = {
    AVATAR_M,
    AVATAR_F,
    SEED,
    ready,
    resetFromSeed,
    resetFromJson: resetFromSeed,
    load,
    save,
    findById,
    upsert,
    remove,
    nombreCompleto,
    iniciales,
    fotoSrc,
    resolveFotoUrl,
  };
})();
