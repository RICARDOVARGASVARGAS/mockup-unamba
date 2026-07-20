/**
 * estudiantes-data.js — store mockup Estudiante (usuario + perfil estudiante).
 * `estado` = ciclo de vida académico (activo/egresado/retirado).
 * `activo` = acceso/login (`usuario.activo`). Son distintos.
 */
(function () {
  const STORAGE_KEY = "tutortrack-estudiantes";
  const VERSION_KEY = "tutortrack-estudiantes-version";
  const STORAGE_VERSION = "seed-24-v4-observaciones";

  const AVATAR_M = "assets/img/avatares/usuario-m.svg";
  const AVATAR_F = "assets/img/avatares/usuario-f.svg";

  const ROLES = [{ id: "rol-3", nombre: "Estudiante", activo: true }];

  const ESTADOS = [
    { id: "activo", nombre: "Activo" },
    { id: "egresado", nombre: "Egresado" },
    { id: "retirado", nombre: "Retirado" },
  ];

  /**
   * Historial mock. `docente_id` → título derivado del grado real (DocentesData).
   * Ciclos = nombres del catálogo.
   */
  const HISTORIAL = {
    "est-01": {
      matriculas: 3,
      fichas_llenadas: 5,
      por_periodo: [
        { periodo: "2026-I", ciclo: "Quinto ciclo", docente_id: "doc-01", vigente: true },
        { periodo: "2025-II", ciclo: "Cuarto ciclo", docente_id: "doc-02", vigente: false },
        { periodo: "2025-I", ciclo: "Tercer ciclo", docente_id: "doc-02", vigente: false },
      ],
    },
    "est-02": {
      matriculas: 4,
      fichas_llenadas: 8,
      por_periodo: [
        { periodo: "2026-I", ciclo: "Sexto ciclo", docente_id: "doc-03", vigente: true },
        { periodo: "2025-II", ciclo: "Quinto ciclo", docente_id: "doc-01", vigente: false },
        { periodo: "2025-I", ciclo: "Cuarto ciclo", docente_id: "doc-01", vigente: false },
        { periodo: "2024-II", ciclo: "Tercer ciclo", docente_id: "doc-07", vigente: false },
      ],
    },
    "est-03": {
      matriculas: 2,
      fichas_llenadas: 2,
      por_periodo: [
        { periodo: "2026-I", ciclo: "Tercer ciclo", docente_id: "doc-04", vigente: true },
        { periodo: "2025-II", ciclo: "Segundo ciclo", docente_id: "doc-04", vigente: false },
      ],
    },
    "est-04": {
      matriculas: 2,
      fichas_llenadas: 12,
      por_periodo: [
        { periodo: "2026-I", ciclo: "Octavo ciclo", docente_id: "doc-09", vigente: true },
        { periodo: "2025-II", ciclo: "Séptimo ciclo", docente_id: "doc-09", vigente: false },
      ],
    },
    "est-06": {
      matriculas: 2,
      fichas_llenadas: 4,
      por_periodo: [
        { periodo: "2026-I", ciclo: "Quinto ciclo", docente_id: "doc-08", vigente: true },
        { periodo: "2025-II", ciclo: "Cuarto ciclo", docente_id: "doc-08", vigente: false },
      ],
    },
    "est-08": {
      matriculas: 2,
      fichas_llenadas: 15,
      por_periodo: [
        { periodo: "2025-II", ciclo: "Décimo ciclo", docente_id: "doc-13", vigente: false },
        { periodo: "2025-I", ciclo: "Noveno ciclo", docente_id: "doc-13", vigente: false },
      ],
    },
    "est-10": {
      matriculas: 1,
      fichas_llenadas: 0,
      por_periodo: [
        { periodo: "2026-I", ciclo: "Primer ciclo", docente_id: "doc-12", vigente: true },
      ],
    },
    "est-12": {
      matriculas: 2,
      fichas_llenadas: 1,
      por_periodo: [
        { periodo: "2026-I", ciclo: "Segundo ciclo", docente_id: "doc-14", vigente: true },
        { periodo: "2025-II", ciclo: "Primer ciclo", docente_id: "doc-14", vigente: false },
      ],
    },
  };

  /** Fallback si DocentesData no está cargado (mismo grado que seed docentes). */
  const TUTOR_FALLBACK = {
    "doc-01": "Bach. Carlos Quispe Mamani",
    "doc-02": "Lic. María Elena Huamán Torres",
    "doc-03": "Mg. José Luis Condori Paucar",
    "doc-04": "Dr. Ana Rosa Béjar Salas",
    "doc-07": "Mg. Roberto Chávez Rojas",
    "doc-08": "Dr. Patricia Aguilar Vera",
    "doc-09": "Bach. Fernando Cárdenas López",
    "doc-12": "Dr. Rosa María Valencia Castro",
    "doc-13": "Bach. Héctor Ramírez Soto",
    "doc-14": "Lic. Claudia Mendoza Pinto",
  };

  const EMPTY_HISTORIAL = { matriculas: 0, fichas_llenadas: 0, por_periodo: [] };

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
      estado: "activo",
      codigo_universitario: "2021-1001",
      codigo_orcid: "",
      roles: ["rol-3"],
      created_at: "2026-02-03T11:02:00",
      updated_at: "2026-07-18T14:32:00",
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
      estado: "activo",
      codigo_universitario: "2021-1002",
      codigo_orcid: "0000-0003-1111-2222",
      roles: ["rol-3"],
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
      estado: "activo",
      codigo_universitario: "2022-1103",
      codigo_orcid: "",
      roles: ["rol-3"],
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
      estado: "activo",
      codigo_universitario: "2020-0904",
      codigo_orcid: "",
      roles: ["rol-3"],
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
      estado: "retirado",
      codigo_universitario: "2021-1005",
      codigo_orcid: "",
      roles: ["rol-3"],
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
      estado: "activo",
      codigo_universitario: "2021-1006",
      codigo_orcid: "0000-0002-3333-4444",
      roles: ["rol-3"],
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
      estado: "activo",
      codigo_universitario: "2023-1207",
      codigo_orcid: "",
      roles: ["rol-3"],
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
      estado: "egresado",
      codigo_universitario: "2019-0808",
      codigo_orcid: "",
      roles: ["rol-3"],
    },
    {
      id: "est-09",
      tipo_documento_id: "td-1",
      documento: "78901234",
      nombres: "Lucía Fernanda",
      apellido_paterno: "Torres",
      apellido_materno: "Ávila",
      sexo: "F",
      fecha_nacimiento: "2003-03-11",
      email: "l.torres@unamba.edu.pe",
      email_personal: "",
      celular_principal: "920111009",
      celular_secundario: "",
      foto_perfil_url: "assets/img/estudiantes/estudiante-1.jpg",
      activo: true,
      estado: "activo",
      codigo_universitario: "2022-1109",
      codigo_orcid: "",
      roles: ["rol-3"],
    },
    {
      id: "est-10",
      tipo_documento_id: "td-1",
      documento: "79012345",
      nombres: "Mateo",
      apellido_paterno: "Vargas",
      apellido_materno: "Luna",
      sexo: "M",
      fecha_nacimiento: "2005-08-22",
      email: "m.vargas@unamba.edu.pe",
      email_personal: "",
      celular_principal: "920111010",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      estado: "activo",
      codigo_universitario: "2025-0110",
      codigo_orcid: "",
      roles: ["rol-3"],
    },
    {
      id: "est-11",
      tipo_documento_id: "td-1",
      documento: "70123456",
      nombres: "Sofía",
      apellido_paterno: "Béjar",
      apellido_materno: "Salas",
      sexo: "F",
      fecha_nacimiento: "2002-06-05",
      email: "s.bejar@unamba.edu.pe",
      email_personal: "sofia.bejar@gmail.com",
      celular_principal: "",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      estado: "egresado",
      codigo_universitario: "2019-0811",
      codigo_orcid: "0000-0003-5555-6666",
      roles: ["rol-3"],
    },
    {
      id: "est-12",
      tipo_documento_id: "td-1",
      documento: "70234567",
      nombres: "Sebastián",
      apellido_paterno: "Flores",
      apellido_materno: "Cruz",
      sexo: "M",
      fecha_nacimiento: "2004-10-17",
      email: "s.flores@unamba.edu.pe",
      email_personal: "",
      celular_principal: "920111012",
      celular_secundario: "920111088",
      foto_perfil_url: "assets/img/estudiantes/estudiante-2.jpg",
      activo: true,
      estado: "activo",
      codigo_universitario: "2023-1212",
      codigo_orcid: "",
      roles: ["rol-3"],
    },
    {
      id: "est-13",
      tipo_documento_id: "td-1",
      documento: "70345678",
      nombres: "Daniela",
      apellido_paterno: "Aguilar",
      apellido_materno: "Vera",
      sexo: "F",
      fecha_nacimiento: "2003-12-01",
      email: "d.aguilar@unamba.edu.pe",
      email_personal: "",
      celular_principal: "920111013",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      estado: "activo",
      codigo_universitario: "2022-1113",
      codigo_orcid: "",
      roles: ["rol-3"],
    },
    {
      id: "est-14",
      tipo_documento_id: "td-1",
      documento: "70456789",
      nombres: "Gabriel",
      apellido_paterno: "Espinoza",
      apellido_materno: "Pinto",
      sexo: "M",
      fecha_nacimiento: "2001-04-25",
      email: "g.espinoza@unamba.edu.pe",
      email_personal: "",
      celular_principal: "",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: false,
      estado: "retirado",
      codigo_universitario: "2020-0914",
      codigo_orcid: "",
      roles: ["rol-3"],
    },
    {
      id: "est-15",
      tipo_documento_id: "td-3",
      documento: "AB123456",
      nombres: "Nicole",
      apellido_paterno: "Yupanqui",
      apellido_materno: "Ramos",
      sexo: "F",
      fecha_nacimiento: "2004-09-14",
      email: "n.yupanqui@unamba.edu.pe",
      email_personal: "",
      celular_principal: "920111015",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      estado: "activo",
      codigo_universitario: "2023-1215",
      codigo_orcid: "",
      roles: ["rol-3"],
    },
    {
      id: "est-16",
      tipo_documento_id: "td-1",
      documento: "70567890",
      nombres: "Ángel",
      apellido_paterno: "Delgado",
      apellido_materno: "Nuñez",
      sexo: "M",
      fecha_nacimiento: "2002-11-08",
      email: "a.delgado@unamba.edu.pe",
      email_personal: "",
      celular_principal: "920111016",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      estado: "activo",
      codigo_universitario: "2021-1016",
      codigo_orcid: "",
      roles: ["rol-3"],
    },
    {
      id: "est-17",
      tipo_documento_id: "td-1",
      documento: "70678901",
      nombres: "Melissa",
      apellido_paterno: "Ortiz",
      apellido_materno: "Vega",
      sexo: "F",
      fecha_nacimiento: "2003-01-29",
      email: "m.ortiz@unamba.edu.pe",
      email_personal: "mel.ortiz@gmail.com",
      celular_principal: "920111017",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      estado: "activo",
      codigo_universitario: "2022-1117",
      codigo_orcid: "",
      roles: ["rol-3"],
    },
    {
      id: "est-18",
      tipo_documento_id: "td-1",
      documento: "70789012",
      nombres: "Kevin",
      apellido_paterno: "Poma",
      apellido_materno: "Hancco",
      sexo: "M",
      fecha_nacimiento: "2004-07-03",
      email: "k.poma@unamba.edu.pe",
      email_personal: "",
      celular_principal: "",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      estado: "activo",
      codigo_universitario: "2023-1218",
      codigo_orcid: "",
      roles: ["rol-3"],
    },
    {
      id: "est-19",
      tipo_documento_id: "td-1",
      documento: "70890123",
      nombres: "Andrea",
      apellido_paterno: "Arce",
      apellido_materno: "Molina",
      sexo: "F",
      fecha_nacimiento: "2002-05-19",
      email: "a.arce@unamba.edu.pe",
      email_personal: "",
      celular_principal: "920111019",
      celular_secundario: "",
      foto_perfil_url: "assets/img/estudiantes/estudiante-1.jpg",
      activo: true,
      estado: "activo",
      codigo_universitario: "2021-1019",
      codigo_orcid: "",
      roles: ["rol-3"],
    },
    {
      id: "est-20",
      tipo_documento_id: "td-1",
      documento: "70901234",
      nombres: "Cristian",
      apellido_paterno: "Zúñiga",
      apellido_materno: "Peña",
      sexo: "M",
      fecha_nacimiento: "2001-08-27",
      email: "c.zuniga@unamba.edu.pe",
      email_personal: "",
      celular_principal: "920111020",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      estado: "egresado",
      codigo_universitario: "2019-0820",
      codigo_orcid: "",
      roles: ["rol-3"],
    },
    {
      id: "est-21",
      tipo_documento_id: "td-1",
      documento: "71012345",
      nombres: "Paula",
      apellido_paterno: "Navarro",
      apellido_materno: "Meza",
      sexo: "F",
      fecha_nacimiento: "2005-02-14",
      email: "p.navarro@unamba.edu.pe",
      email_personal: "",
      celular_principal: "920111021",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      estado: "activo",
      codigo_universitario: "2025-0121",
      codigo_orcid: "",
      roles: ["rol-3"],
    },
    {
      id: "est-22",
      tipo_documento_id: "td-1",
      documento: "71123456",
      nombres: "Renato",
      apellido_paterno: "Salazar",
      apellido_materno: "Díaz",
      sexo: "M",
      fecha_nacimiento: "2003-11-30",
      email: "r.salazar@unamba.edu.pe",
      email_personal: "",
      celular_principal: "",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      estado: "activo",
      codigo_universitario: "2022-1122",
      codigo_orcid: "",
      roles: ["rol-3"],
    },
    {
      id: "est-23",
      tipo_documento_id: "td-1",
      documento: "71234568",
      nombres: "Fiorella",
      apellido_paterno: "Cabrera",
      apellido_materno: "Ríos",
      sexo: "F",
      fecha_nacimiento: "2004-03-07",
      email: "f.cabrera@unamba.edu.pe",
      email_personal: "",
      celular_principal: "920111023",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      estado: "activo",
      codigo_universitario: "2023-1223",
      codigo_orcid: "",
      roles: ["rol-3"],
    },
    {
      id: "est-24",
      tipo_documento_id: "td-1",
      documento: "71345679",
      nombres: "Óscar",
      apellido_paterno: "Medina",
      apellido_materno: "Quispe",
      sexo: "M",
      fecha_nacimiento: "2002-09-16",
      email: "o.medina@unamba.edu.pe",
      email_personal: "",
      celular_principal: "920111024",
      celular_secundario: "",
      foto_perfil_url: "",
      activo: true,
      estado: "activo",
      codigo_universitario: "2021-1024",
      codigo_orcid: "",
      roles: ["rol-3"],
    },
  ];

  let cachedSeed = null;
  let readyPromise = null;

  function normalizeEstado(estado) {
    const v = String(estado || "activo").toLowerCase();
    if (v === "egresado" || v === "retirado" || v === "activo") return v;
    return "activo";
  }

  function normalizeRow(row) {
    const roles = [...(row.roles || ["rol-3"])];
    return {
      ...row,
      email: row.email || row.correo_electronico || "",
      email_personal: row.email_personal || "",
      celular_principal: row.celular_principal || "",
      celular_secundario: row.celular_secundario || "",
      activo: row.activo !== false,
      estado: normalizeEstado(row.estado),
      codigo_universitario: row.codigo_universitario || "",
      codigo_orcid: row.codigo_orcid || "",
      foto_perfil_url: row.foto_perfil_url || "",
      created_at: row.created_at || "2026-02-03T11:02:00",
      updated_at: row.updated_at || "2026-07-18T14:32:00",
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

  function setEstado(id, estado) {
    const rows = load();
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    rows[idx] = {
      ...rows[idx],
      estado: normalizeEstado(estado),
      updated_at: new Date().toISOString(),
    };
    save(rows);
    return rows[idx];
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

  function rolesActivos() {
    return ROLES.filter((r) => r.activo !== false);
  }

  function rolNombre(id) {
    return ROLES.find((r) => r.id === id)?.nombre || id;
  }

  function rolesLabel(ids) {
    return (ids || []).map((id) => rolNombre(id)).filter(Boolean);
  }

  function estadoNombre(estado) {
    return ESTADOS.find((e) => e.id === normalizeEstado(estado))?.nombre || "Activo";
  }

  function tutorLabel(docenteId, legacyTutor) {
    if (docenteId && window.DocentesData) {
      const row = DocentesData.findById(docenteId);
      if (row) return DocentesData.nombreConGrado(row);
    }
    if (docenteId && TUTOR_FALLBACK[docenteId]) return TUTOR_FALLBACK[docenteId];
    return legacyTutor || "—";
  }

  function enrichPorPeriodo(list) {
    return (list || []).map((p) => ({
      ...p,
      tutor: tutorLabel(p.docente_id, p.tutor),
    }));
  }

  function getHistorial(id) {
    const h = HISTORIAL[id];
    if (!h) return { ...EMPTY_HISTORIAL, por_periodo: [] };
    const por = enrichPorPeriodo(h.por_periodo);
    return {
      ...h,
      matriculas: por.length || h.matriculas || 0,
      por_periodo: por,
    };
  }

  function tieneHistorial(id) {
    const h = getHistorial(id);
    return h.matriculas > 0 || h.fichas_llenadas > 0;
  }

  function historialTutoria(id) {
    const h = getHistorial(id);
    const vigente = (h.por_periodo || []).find((p) => p.vigente) || h.por_periodo[0] || null;
    return {
      periodos_cursados: (h.por_periodo || []).length,
      ciclo_actual: vigente?.ciclo || "—",
      tutor_actual: vigente?.tutor || "—",
      por_periodo: h.por_periodo || [],
      matriculas: h.matriculas,
      fichas_llenadas: h.fichas_llenadas,
    };
  }

  /** Cards: Total · Activos (estado=activo) · No activos (egresado+retirado). */
  function resumenCounts(rows) {
    const list = rows || load();
    const total = list.length;
    const activos = list.filter((r) => normalizeEstado(r.estado) === "activo").length;
    return { total, activos, inactivos: total - activos };
  }

  async function resetFromSeed() {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    cachedSeed = null;
    readyPromise = null;
    return ready();
  }

  window.EstudiantesData = {
    ROLES,
    ESTADOS,
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
    setEstado,
    nombreCompleto,
    iniciales,
    fotoSrc,
    resolveFotoUrl,
    rolesActivos,
    rolNombre,
    rolesLabel,
    estadoNombre,
    getHistorial,
    tieneHistorial,
    historialTutoria,
    resumenCounts,
  };
})();
