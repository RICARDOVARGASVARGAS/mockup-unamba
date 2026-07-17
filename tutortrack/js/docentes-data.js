/**
 * docentes-data.js — store mockup Docente (usuario + docente + roles).
 * Seed embebido (sin fetch) para que funcione sin Live Server.
 */
(function () {
  const STORAGE_KEY = "tutortrack-docentes";
  const VERSION_KEY = "tutortrack-docentes-version";
  const STORAGE_VERSION = "seed-25-v4-inline-avatares";

  const AVATAR_M = "assets/img/avatares/usuario-m.svg";
  const AVATAR_F = "assets/img/avatares/usuario-f.svg";

  const ROLES = [
    { id: "rol-2", nombre: "Docente-Tutor" },
    { id: "rol-4", nombre: "Coordinador de tutoría" },
  ];

  const GRADOS = [
    { id: "grado-1", nombre: "Bachiller", abreviatura: "Bach." },
    { id: "grado-2", nombre: "Licenciado", abreviatura: "Lic." },
    { id: "grado-3", nombre: "Magíster", abreviatura: "Mg." },
    { id: "grado-4", nombre: "Doctor", abreviatura: "Dr." },
  ];

  const ESPECIALIDADES = [
    { id: "esp-1", nombre: "Marketing" },
    { id: "esp-2", nombre: "Finanzas" },
    { id: "esp-3", nombre: "Gestión Pública" },
    { id: "esp-4", nombre: "Recursos Humanos" },
    { id: "esp-5", nombre: "Contabilidad" },
  ];

  /** Seed de prueba embebido — todos con grado; teléfonos y fotos parciales. */
  const SEED = [
  {
    "id": "doc-01",
    "tipo_documento_id": "td-1",
    "documento": "45678912",
    "nombres": "Carlos",
    "apellido_paterno": "Quispe",
    "apellido_materno": "Mamani",
    "sexo": "M",
    "fecha_nacimiento": "1985-03-14",
    "email": "c.quispe@unamba.edu.pe",
    "email_personal": "c.quispe.personal@gmail.com",
    "celular_principal": "910000011",
    "celular_secundario": "910000088",
    "foto_perfil_url": "assets/img/docentes/docente-1.jpg",
    "activo": true,
    "grado_academico_id": "grado-1",
    "especialidad_id": "esp-1",
    "codigo_orcid": "0000-0002-1000-2000",
    "cv_url": "https://example.com/cv/doc-01.pdf",
    "biografia": "Docente de la Facultad de Administración UNAMBA.",
    "roles": [
      "rol-2"
    ]
  },
  {
    "id": "doc-02",
    "tipo_documento_id": "td-1",
    "documento": "40111223",
    "nombres": "María Elena",
    "apellido_paterno": "Huamán",
    "apellido_materno": "Torres",
    "sexo": "F",
    "fecha_nacimiento": "1988-07-22",
    "email": "m.huaman@unamba.edu.pe",
    "email_personal": "",
    "celular_principal": "910000028",
    "celular_secundario": "",
    "foto_perfil_url": "assets/img/docentes/docente-2.jpg",
    "activo": true,
    "grado_academico_id": "grado-2",
    "especialidad_id": "esp-2",
    "codigo_orcid": "",
    "cv_url": "",
    "biografia": "",
    "roles": [
      "rol-2",
      "rol-4"
    ]
  },
  {
    "id": "doc-03",
    "tipo_documento_id": "td-1",
    "documento": "47890123",
    "nombres": "José Luis",
    "apellido_paterno": "Condori",
    "apellido_materno": "Paucar",
    "sexo": "M",
    "fecha_nacimiento": "1982-11-05",
    "email": "j.condori@unamba.edu.pe",
    "email_personal": "",
    "celular_principal": "",
    "celular_secundario": "",
    "foto_perfil_url": "assets/img/docentes/docente-3.jpg",
    "activo": true,
    "grado_academico_id": "grado-3",
    "especialidad_id": "esp-3",
    "codigo_orcid": "",
    "cv_url": "",
    "biografia": "",
    "roles": [
      "rol-2"
    ]
  },
  {
    "id": "doc-04",
    "tipo_documento_id": "td-1",
    "documento": "44556677",
    "nombres": "Ana Rosa",
    "apellido_paterno": "Béjar",
    "apellido_materno": "Salas",
    "sexo": "F",
    "fecha_nacimiento": "1990-01-30",
    "email": "a.bejar@unamba.edu.pe",
    "email_personal": "a.bejar.personal@gmail.com",
    "celular_principal": "910000062",
    "celular_secundario": "",
    "foto_perfil_url": "",
    "activo": true,
    "grado_academico_id": "grado-4",
    "especialidad_id": "esp-4",
    "codigo_orcid": "",
    "cv_url": "",
    "biografia": "",
    "roles": [
      "rol-2"
    ]
  },
  {
    "id": "doc-05",
    "tipo_documento_id": "td-2",
    "documento": "41223344",
    "nombres": "Pedro",
    "apellido_paterno": "Ttito",
    "apellido_materno": "Flores",
    "sexo": "M",
    "fecha_nacimiento": "1979-09-18",
    "email": "p.ttito@unamba.edu.pe",
    "email_personal": "",
    "celular_principal": "",
    "celular_secundario": "",
    "foto_perfil_url": "assets/img/docentes/docente-1.jpg",
    "activo": true,
    "grado_academico_id": "grado-1",
    "especialidad_id": "esp-5",
    "codigo_orcid": "",
    "cv_url": "",
    "biografia": "Docente de la Facultad de Administración UNAMBA.",
    "roles": [
      "rol-4"
    ]
  },
  {
    "id": "doc-06",
    "tipo_documento_id": "td-1",
    "documento": "42334455",
    "nombres": "María Fernanda Alexandra",
    "apellido_paterno": "Quispe Condori",
    "apellido_materno": "Huamán de la Cruz",
    "sexo": "F",
    "fecha_nacimiento": "1987-04-12",
    "email": "l.mamani@unamba.edu.pe",
    "email_personal": "",
    "celular_principal": "910000096",
    "celular_secundario": "985000455",
    "foto_perfil_url": "assets/img/docentes/docente-2.jpg",
    "activo": true,
    "grado_academico_id": "grado-2",
    "especialidad_id": "esp-1",
    "codigo_orcid": "0000-0002-1005-2005",
    "cv_url": "",
    "biografia": "",
    "roles": [
      "rol-2"
    ]
  },
  {
    "id": "doc-07",
    "tipo_documento_id": "td-1",
    "documento": "43445566",
    "nombres": "Roberto",
    "apellido_paterno": "Chávez",
    "apellido_materno": "Rojas",
    "sexo": "M",
    "fecha_nacimiento": "1981-06-28",
    "email": "r.chavez@unamba.edu.pe",
    "email_personal": "r.chavez.personal@gmail.com",
    "celular_principal": "",
    "celular_secundario": "",
    "foto_perfil_url": "assets/img/docentes/docente-3.jpg",
    "activo": true,
    "grado_academico_id": "grado-3",
    "especialidad_id": "esp-2",
    "codigo_orcid": "",
    "cv_url": "https://example.com/cv/doc-07.pdf",
    "biografia": "",
    "roles": [
      "rol-2"
    ]
  },
  {
    "id": "doc-08",
    "tipo_documento_id": "td-1",
    "documento": "46778899",
    "nombres": "Patricia",
    "apellido_paterno": "Aguilar",
    "apellido_materno": "Vera",
    "sexo": "F",
    "fecha_nacimiento": "1986-12-03",
    "email": "p.aguilar@unamba.edu.pe",
    "email_personal": "",
    "celular_principal": "910000130",
    "celular_secundario": "",
    "foto_perfil_url": "",
    "activo": false,
    "grado_academico_id": "grado-4",
    "especialidad_id": "esp-3",
    "codigo_orcid": "",
    "cv_url": "",
    "biografia": "",
    "roles": [
      "rol-2"
    ]
  },
  {
    "id": "doc-09",
    "tipo_documento_id": "td-1",
    "documento": "48990011",
    "nombres": "Fernando",
    "apellido_paterno": "Cárdenas",
    "apellido_materno": "López",
    "sexo": "M",
    "fecha_nacimiento": "1984-02-19",
    "email": "f.cardenas@unamba.edu.pe",
    "email_personal": "",
    "celular_principal": "",
    "celular_secundario": "",
    "foto_perfil_url": "assets/img/docentes/docente-1.jpg",
    "activo": true,
    "grado_academico_id": "grado-1",
    "especialidad_id": "esp-4",
    "codigo_orcid": "",
    "cv_url": "",
    "biografia": "Docente de la Facultad de Administración UNAMBA.",
    "roles": [
      "rol-2",
      "rol-4"
    ]
  },
  {
    "id": "doc-10",
    "tipo_documento_id": "td-1",
    "documento": "40011223",
    "nombres": "Silvia",
    "apellido_paterno": "Paredes",
    "apellido_materno": "Gutierrez",
    "sexo": "M",
    "fecha_nacimiento": "1991-08-07",
    "email": "s.paredes@unamba.edu.pe",
    "email_personal": "s.paredes.personal@gmail.com",
    "celular_principal": "910000164",
    "celular_secundario": "",
    "foto_perfil_url": "",
    "activo": true,
    "grado_academico_id": "grado-2",
    "especialidad_id": "esp-5",
    "codigo_orcid": "",
    "cv_url": "",
    "biografia": "",
    "roles": [
      "rol-2"
    ]
  },
  {
    "id": "doc-11",
    "tipo_documento_id": "td-1",
    "documento": "41122334",
    "nombres": "Juan Carlos Eduardo",
    "apellido_paterno": "Paucar Mendoza",
    "apellido_materno": "Villavicencio",
    "sexo": "M",
    "fecha_nacimiento": "1983-05-25",
    "email": "m.salazar@unamba.edu.pe",
    "email_personal": "",
    "celular_principal": "910000181",
    "celular_secundario": "985000910",
    "foto_perfil_url": "assets/img/docentes/docente-3.jpg",
    "activo": true,
    "grado_academico_id": "grado-3",
    "especialidad_id": "esp-1",
    "codigo_orcid": "0000-0002-1010-2010",
    "cv_url": "",
    "biografia": "",
    "roles": [
      "rol-2"
    ]
  },
  {
    "id": "doc-12",
    "tipo_documento_id": "td-2",
    "documento": "42233445",
    "nombres": "Rosa María",
    "apellido_paterno": "Valencia",
    "apellido_materno": "Castro",
    "sexo": "F",
    "fecha_nacimiento": "1989-10-11",
    "email": "r.valencia@unamba.edu.pe",
    "email_personal": "",
    "celular_principal": "",
    "celular_secundario": "",
    "foto_perfil_url": "",
    "activo": true,
    "grado_academico_id": "grado-4",
    "especialidad_id": "esp-2",
    "codigo_orcid": "",
    "cv_url": "",
    "biografia": "",
    "roles": [
      "rol-2"
    ]
  },
  {
    "id": "doc-13",
    "tipo_documento_id": "td-1",
    "documento": "43344556",
    "nombres": "Héctor",
    "apellido_paterno": "Ramírez",
    "apellido_materno": "Soto",
    "sexo": "M",
    "fecha_nacimiento": "1978-01-16",
    "email": "h.ramirez@unamba.edu.pe",
    "email_personal": "h.ramirez.personal@gmail.com",
    "celular_principal": "910000215",
    "celular_secundario": "",
    "foto_perfil_url": "assets/img/docentes/docente-1.jpg",
    "activo": true,
    "grado_academico_id": "grado-1",
    "especialidad_id": "esp-3",
    "codigo_orcid": "",
    "cv_url": "https://example.com/cv/doc-13.pdf",
    "biografia": "Docente de la Facultad de Administración UNAMBA.",
    "roles": [
      "rol-2"
    ]
  },
  {
    "id": "doc-14",
    "tipo_documento_id": "td-1",
    "documento": "44455667",
    "nombres": "Claudia",
    "apellido_paterno": "Mendoza",
    "apellido_materno": "Pinto",
    "sexo": "M",
    "fecha_nacimiento": "1992-03-09",
    "email": "c.mendoza@unamba.edu.pe",
    "email_personal": "",
    "celular_principal": "910000232",
    "celular_secundario": "",
    "foto_perfil_url": "",
    "activo": true,
    "grado_academico_id": "grado-2",
    "especialidad_id": "esp-4",
    "codigo_orcid": "",
    "cv_url": "",
    "biografia": "",
    "roles": [
      "rol-2"
    ]
  },
  {
    "id": "doc-15",
    "tipo_documento_id": "td-1",
    "documento": "45566778",
    "nombres": "Álvaro",
    "apellido_paterno": "Espinoza",
    "apellido_materno": "Cruz",
    "sexo": "M",
    "fecha_nacimiento": "1980-07-31",
    "email": "a.espinoza@unamba.edu.pe",
    "email_personal": "",
    "celular_principal": "",
    "celular_secundario": "",
    "foto_perfil_url": "assets/img/docentes/docente-3.jpg",
    "activo": true,
    "grado_academico_id": "grado-3",
    "especialidad_id": "esp-5",
    "codigo_orcid": "",
    "cv_url": "",
    "biografia": "",
    "roles": [
      "rol-4"
    ]
  },
  {
    "id": "doc-16",
    "tipo_documento_id": "td-1",
    "documento": "46677889",
    "nombres": "Diana",
    "apellido_paterno": "Flores",
    "apellido_materno": "Apaza",
    "sexo": "F",
    "fecha_nacimiento": "1987-09-21",
    "email": "d.flores@unamba.edu.pe",
    "email_personal": "d.flores.personal@gmail.com",
    "celular_principal": "910000266",
    "celular_secundario": "985001365",
    "foto_perfil_url": "",
    "activo": true,
    "grado_academico_id": "grado-4",
    "especialidad_id": "esp-1",
    "codigo_orcid": "0000-0002-1015-2015",
    "cv_url": "",
    "biografia": "",
    "roles": [
      "rol-2"
    ]
  },
  {
    "id": "doc-17",
    "tipo_documento_id": "td-1",
    "documento": "47788990",
    "nombres": "Jorge",
    "apellido_paterno": "Navarro",
    "apellido_materno": "Meza",
    "sexo": "M",
    "fecha_nacimiento": "1985-12-14",
    "email": "j.navarro@unamba.edu.pe",
    "email_personal": "",
    "celular_principal": "910000283",
    "celular_secundario": "",
    "foto_perfil_url": "assets/img/docentes/docente-1.jpg",
    "activo": true,
    "grado_academico_id": "grado-1",
    "especialidad_id": "esp-2",
    "codigo_orcid": "",
    "cv_url": "",
    "biografia": "Docente de la Facultad de Administración UNAMBA.",
    "roles": [
      "rol-2"
    ]
  },
  {
    "id": "doc-18",
    "tipo_documento_id": "td-3",
    "documento": "48899001",
    "nombres": "Karina",
    "apellido_paterno": "Ortiz",
    "apellido_materno": "Vega",
    "sexo": "F",
    "fecha_nacimiento": "1993-04-02",
    "email": "k.ortiz@unamba.edu.pe",
    "email_personal": "",
    "celular_principal": "",
    "celular_secundario": "",
    "foto_perfil_url": "assets/img/docentes/docente-2.jpg",
    "activo": true,
    "grado_academico_id": "grado-2",
    "especialidad_id": "esp-3",
    "codigo_orcid": "",
    "cv_url": "",
    "biografia": "",
    "roles": [
      "rol-2"
    ]
  },
  {
    "id": "doc-19",
    "tipo_documento_id": "td-1",
    "documento": "49900112",
    "nombres": "Walter",
    "apellido_paterno": "Poma",
    "apellido_materno": "Hancco",
    "sexo": "M",
    "fecha_nacimiento": "1982-08-27",
    "email": "w.poma@unamba.edu.pe",
    "email_personal": "w.poma.personal@gmail.com",
    "celular_principal": "910000317",
    "celular_secundario": "",
    "foto_perfil_url": "assets/img/docentes/docente-3.jpg",
    "activo": true,
    "grado_academico_id": "grado-3",
    "especialidad_id": "esp-4",
    "codigo_orcid": "",
    "cv_url": "https://example.com/cv/doc-19.pdf",
    "biografia": "",
    "roles": [
      "rol-2"
    ]
  },
  {
    "id": "doc-20",
    "tipo_documento_id": "td-1",
    "documento": "40022334",
    "nombres": "Elena",
    "apellido_paterno": "Ríos",
    "apellido_materno": "Cabrera",
    "sexo": "F",
    "fecha_nacimiento": "1986-11-08",
    "email": "e.rios@unamba.edu.pe",
    "email_personal": "",
    "celular_principal": "910000334",
    "celular_secundario": "",
    "foto_perfil_url": "",
    "activo": true,
    "grado_academico_id": "grado-4",
    "especialidad_id": "esp-5",
    "codigo_orcid": "",
    "cv_url": "",
    "biografia": "",
    "roles": [
      "rol-2",
      "rol-4"
    ]
  },
  {
    "id": "doc-21",
    "tipo_documento_id": "td-1",
    "documento": "41133445",
    "nombres": "Santiago",
    "apellido_paterno": "Vargas",
    "apellido_materno": "Luna",
    "sexo": "M",
    "fecha_nacimiento": "1977-02-23",
    "email": "s.vargas@unamba.edu.pe",
    "email_personal": "",
    "celular_principal": "",
    "celular_secundario": "",
    "foto_perfil_url": "assets/img/docentes/docente-1.jpg",
    "activo": true,
    "grado_academico_id": "grado-1",
    "especialidad_id": "esp-1",
    "codigo_orcid": "0000-0002-1020-2020",
    "cv_url": "",
    "biografia": "Docente de la Facultad de Administración UNAMBA.",
    "roles": [
      "rol-2"
    ]
  },
  {
    "id": "doc-22",
    "tipo_documento_id": "td-3",
    "documento": "42244556",
    "nombres": "Fabiola",
    "apellido_paterno": "Yupanqui",
    "apellido_materno": "Ramos",
    "sexo": "F",
    "fecha_nacimiento": "1990-06-17",
    "email": "f.yupanqui@unamba.edu.pe",
    "email_personal": "f.yupanqui.personal@gmail.com",
    "celular_principal": "910000368",
    "celular_secundario": "",
    "foto_perfil_url": "assets/img/docentes/docente-2.jpg",
    "activo": true,
    "grado_academico_id": "grado-2",
    "especialidad_id": "esp-2",
    "codigo_orcid": "",
    "cv_url": "",
    "biografia": "",
    "roles": [
      "rol-2"
    ]
  },
  {
    "id": "doc-23",
    "tipo_documento_id": "td-1",
    "documento": "43355667",
    "nombres": "Óscar",
    "apellido_paterno": "Zúñiga",
    "apellido_materno": "Peña",
    "sexo": "M",
    "fecha_nacimiento": "1984-09-04",
    "email": "o.zuniga@unamba.edu.pe",
    "email_personal": "",
    "celular_principal": "910000385",
    "celular_secundario": "",
    "foto_perfil_url": "assets/img/docentes/docente-3.jpg",
    "activo": true,
    "grado_academico_id": "grado-3",
    "especialidad_id": "esp-3",
    "codigo_orcid": "",
    "cv_url": "",
    "biografia": "",
    "roles": [
      "rol-2"
    ]
  },
  {
    "id": "doc-24",
    "tipo_documento_id": "td-1",
    "documento": "44466778",
    "nombres": "Gabriela",
    "apellido_paterno": "Arce",
    "apellido_materno": "Molina",
    "sexo": "F",
    "fecha_nacimiento": "1988-12-29",
    "email": "g.arce@unamba.edu.pe",
    "email_personal": "",
    "celular_principal": "",
    "celular_secundario": "",
    "foto_perfil_url": "",
    "activo": true,
    "grado_academico_id": "grado-4",
    "especialidad_id": "esp-4",
    "codigo_orcid": "",
    "cv_url": "",
    "biografia": "",
    "roles": [
      "rol-2"
    ]
  },
  {
    "id": "doc-25",
    "tipo_documento_id": "td-1",
    "documento": "45577889",
    "nombres": "Iván",
    "apellido_paterno": "Delgado",
    "apellido_materno": "Nuñez",
    "sexo": "M",
    "fecha_nacimiento": "1981-05-13",
    "email": "i.delgado@unamba.edu.pe",
    "email_personal": "i.delgado.personal@gmail.com",
    "celular_principal": "910000419",
    "celular_secundario": "",
    "foto_perfil_url": "assets/img/docentes/docente-1.jpg",
    "activo": true,
    "grado_academico_id": "grado-1",
    "especialidad_id": "esp-5",
    "codigo_orcid": "",
    "cv_url": "https://example.com/cv/doc-25.pdf",
    "biografia": "Docente de la Facultad de Administración UNAMBA.",
    "roles": [
      "rol-2"
    ]
  }
];

  let cachedSeed = null;
  let readyPromise = null;

  function normalizeRow(row) {
    const roles = [...(row.roles || [])];
    return {
      ...row,
      email: row.email || row.correo_electronico || "",
      email_personal: row.email_personal || "",
      celular_principal: row.celular_principal || "",
      celular_secundario: row.celular_secundario || "",
      activo: row.activo !== false,
      grado_academico_id: row.grado_academico_id || "",
      especialidad_id: row.especialidad_id || "",
      codigo_orcid: row.codigo_orcid || "",
      cv_url: row.cv_url || "",
      biografia: row.biografia || "",
      foto_perfil_url: row.foto_perfil_url || "",
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

  function nombreCompleto(row) {
    return [row.nombres, row.apellido_paterno, row.apellido_materno].filter(Boolean).join(" ").trim();
  }

  function iniciales(row) {
    const n = (row.nombres || "?").trim().charAt(0);
    const a = (row.apellido_paterno || "?").trim().charAt(0);
    return (n + a).toUpperCase();
  }

  /** Foto real o avatar predeterminado según sexo. */
  function fotoSrc(row) {
    if (row && row.foto_perfil_url) return row.foto_perfil_url;
    return row && row.sexo === "F" ? AVATAR_F : AVATAR_M;
  }

  function resolveFotoUrl(url) {
    if (!url) return "";
    if (url.startsWith("data:") || url.startsWith("blob:") || /^https?:\/\//i.test(url)) return url;
    return "../../" + String(url).replace(/^\.\.\//, "");
  }

  function rolNombre(id) {
    return ROLES.find((r) => r.id === id)?.nombre || id;
  }

  function gradoNombre(id) {
    return GRADOS.find((r) => r.id === id)?.nombre || "";
  }

  function gradoAbrev(id) {
    const g = GRADOS.find((r) => r.id === id);
    return g?.abreviatura || g?.nombre || "";
  }

  function especialidadNombre(id) {
    return ESPECIALIDADES.find((r) => r.id === id)?.nombre || "";
  }

  async function resetFromSeed() {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    cachedSeed = null;
    readyPromise = null;
    return ready();
  }

  window.DocentesData = {
    ROLES,
    GRADOS,
    ESPECIALIDADES,
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
    rolNombre,
    gradoNombre,
    gradoAbrev,
    especialidadNombre,
  };
})();
