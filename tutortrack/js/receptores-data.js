/**
 * receptores-data.js — store mockup Receptor (usuario + receptor + entidad).
 * Perfil mínimo: entidad_receptora_id obligatorio.
 * Soft delete siempre permitido (sin FKs entrantes); aviso si es el único activo de su entidad.
 */
(function () {
  const STORAGE_KEY = "tutortrack-receptores";
  const VERSION_KEY = "tutortrack-receptores-version";
  const STORAGE_VERSION = "seed-8-v1-receptores";

  const AVATAR_M = "assets/img/avatares/usuario-m.svg";
  const AVATAR_F = "assets/img/avatares/usuario-f.svg";

  const ROLES = [{ id: "rol-5", nombre: "Receptor", activo: true }];

  const ENTIDADES = [
    { id: "er1", nombre: "Psicología", activo: true },
    { id: "er2", nombre: "Servicios médicos", activo: true },
    { id: "er3", nombre: "Bienestar universitario", activo: true },
    { id: "er4", nombre: "Trabajo social", activo: true },
    { id: "er5", nombre: "Defensoría estudiantil", activo: true },
    { id: "er6", nombre: "Orientación vocacional", activo: true },
    { id: "er7", nombre: "Oficina de discapacidad", activo: true },
    { id: "er8", nombre: "Consejería académica", activo: true },
  ];

  /** Carga mock de derivaciones por entidad (no por receptor_id). */
  const CARGA_ENTIDAD = {
    er1: { total: 45, en_proceso: 12, atendidas: 33 },
    er2: { total: 28, en_proceso: 6, atendidas: 22 },
    er3: { total: 18, en_proceso: 4, atendidas: 14 },
    er4: { total: 12, en_proceso: 3, atendidas: 9 },
    er5: { total: 8, en_proceso: 2, atendidas: 6 },
    er6: { total: 5, en_proceso: 1, atendidas: 4 },
    er7: { total: 3, en_proceso: 1, atendidas: 2 },
    er8: { total: 10, en_proceso: 2, atendidas: 8 },
  };

  const SEED = [
    {
      id: "rec-01",
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
      entidad_receptora_id: "er1",
      roles: ["rol-5"],
      created_at: "2026-02-10T09:00:00",
      updated_at: "2026-07-15T11:20:00",
    },
    {
      id: "rec-02",
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
      celular_secundario: "930111088",
      foto_perfil_url: "",
      activo: true,
      entidad_receptora_id: "er1",
      roles: ["rol-5"],
    },
    {
      id: "rec-03",
      tipo_documento_id: "td-1",
      documento: "43457890",
      nombres: "Carmen",
      apellido_paterno: "Huamán",
      apellido_materno: "Torres",
      sexo: "F",
      fecha_nacimiento: "1988-11-05",
      email: "c.huaman@unamba.edu.pe",
      email_personal: "",
      celular_principal: "930111003",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      entidad_receptora_id: "er2",
      roles: ["rol-5"],
    },
    {
      id: "rec-04",
      tipo_documento_id: "td-1",
      documento: "44568901",
      nombres: "Jorge",
      apellido_paterno: "Quispe",
      apellido_materno: "Mamani",
      sexo: "M",
      fecha_nacimiento: "1979-09-18",
      email: "j.quispe@unamba.edu.pe",
      email_personal: "jquispe.personal@outlook.com",
      celular_principal: "",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      entidad_receptora_id: "er3",
      roles: ["rol-5"],
    },
    {
      id: "rec-05",
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
      entidad_receptora_id: "er4",
      roles: ["rol-5"],
    },
    {
      id: "rec-06",
      tipo_documento_id: "td-1",
      documento: "46780123",
      nombres: "Miguel Ángel",
      apellido_paterno: "Soto",
      apellido_materno: "Vega",
      sexo: "M",
      fecha_nacimiento: "1983-07-14",
      email: "m.soto@unamba.edu.pe",
      email_personal: "",
      celular_principal: "930111006",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      entidad_receptora_id: "er5",
      roles: ["rol-5"],
    },
    {
      id: "rec-07",
      tipo_documento_id: "td-2",
      documento: "002345678",
      nombres: "Patricia",
      apellido_paterno: "Béjar",
      apellido_materno: "Salas",
      sexo: "F",
      fecha_nacimiento: "1987-04-08",
      email: "p.bejar@unamba.edu.pe",
      email_personal: "",
      celular_principal: "930111007",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      entidad_receptora_id: "er6",
      roles: ["rol-5"],
    },
    {
      id: "rec-08",
      tipo_documento_id: "td-1",
      documento: "47891234",
      nombres: "Andrés",
      apellido_paterno: "Flores",
      apellido_materno: "Cruz",
      sexo: "M",
      fecha_nacimiento: "1986-12-20",
      email: "a.flores@unamba.edu.pe",
      email_personal: "",
      celular_principal: "930111008",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      entidad_receptora_id: "er2",
      roles: ["rol-5"],
    },
  ];

  let cachedSeed = null;
  let readyPromise = null;

  function normalizeRow(row) {
    const roles = [...(row.roles || ["rol-5"])];
    return {
      ...row,
      email: row.email || "",
      email_personal: row.email_personal || "",
      celular_principal: row.celular_principal || "",
      celular_secundario: row.celular_secundario || "",
      activo: row.activo !== false,
      entidad_receptora_id: row.entidad_receptora_id || "",
      foto_perfil_url: row.foto_perfil_url || "",
      created_at: row.created_at || "2026-02-10T09:00:00",
      updated_at: row.updated_at || "2026-07-15T11:20:00",
      roles,
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
    const idx = rows.findIndex((r) => r.id === normalized.id);
    if (idx === -1) rows.unshift(normalized);
    else rows[idx] = normalized;
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
    rows[idx] = {
      ...rows[idx],
      activo: Boolean(activo),
      updated_at: new Date().toISOString(),
    };
    save(rows);
    return rows[idx];
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

  function entidadesActivas() {
    return ENTIDADES.filter((e) => e.activo !== false);
  }

  function entidadNombre(id) {
    return ENTIDADES.find((e) => e.id === id)?.nombre || "";
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

  /** ¿Es el único receptor con acceso activo de su entidad? */
  function esUnicoActivoDeEntidad(id) {
    const row = findById(id);
    if (!row || !row.entidad_receptora_id) return false;
    const activosMisma = load().filter(
      (r) =>
        r.entidad_receptora_id === row.entidad_receptora_id &&
        r.activo !== false &&
        !r.deleted_at
    );
    return activosMisma.length === 1 && activosMisma[0].id === id;
  }

  function cargaEntidad(entidadId) {
    return CARGA_ENTIDAD[entidadId] || { total: 0, en_proceso: 0, atendidas: 0 };
  }

  function resumenCounts(rows) {
    const list = rows || load();
    const total = list.length;
    const activos = list.filter((r) => r.activo !== false).length;
    return { total, activos, inactivos: total - activos };
  }

  async function resetFromSeed() {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    cachedSeed = null;
    readyPromise = null;
    return ready();
  }

  window.ReceptoresData = {
    ROLES,
    ENTIDADES,
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
    setActivo,
    nombreCompleto,
    fotoSrc,
    resolveFotoUrl,
    entidadesActivas,
    entidadNombre,
    rolesActivos,
    rolNombre,
    rolesLabel,
    esUnicoActivoDeEntidad,
    cargaEntidad,
    resumenCounts,
  };
})();
