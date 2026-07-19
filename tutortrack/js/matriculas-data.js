/**
 * matriculas-data.js — seed de matrículas (estudiante_ciclo_periodo).
 * Seed para cp-301 (1° Ciclo — 2026-I): 32 estudiantes, 2 docentes.
 */
(function () {
  function storageKey(cpId) {
    return `tutortrack-matriculas-${cpId}`;
  }

  /* Docentes de cp-301 */
  const DOCENTES_CP = {
    "cp-301": [
      { docente_id: "doc-01", nombre: "Mg. Carlos Vargas Huanca",   abrev: "Vargas H." },
      { docente_id: "doc-02", nombre: "Lic. Ana Torres Mendoza",    abrev: "Torres M." },
    ],
    "cp-302": [
      { docente_id: "doc-03", nombre: "Dr. Roberto Quispe Ramos",   abrev: "Quispe R." },
    ],
    "cp-303": [
      { docente_id: "doc-01", nombre: "Mg. Carlos Vargas Huanca",   abrev: "Vargas H." },
      { docente_id: "doc-04", nombre: "Mg. Patricia Flores Cárdenas", abrev: "Flores C." },
    ],
  };

  function buildSeed(cpId) {
    if (cpId !== "cp-301") return [];
    const nombres = [
      ["Ana Sofía",    "Mamani",    "Flores",   "F", "2021-1001"],
      ["Diego Andrés", "Quispe",    "Huamán",   "M", "2021-1002"],
      ["Valeria",      "Condori",   "Ramos",    "F", "2022-1103"],
      ["Luis Fernando","Paucar",    "Torres",   "M", "2020-0904"],
      ["Camila",       "Chávez",    "Vargas",   "F", "2021-1005"],
      ["Bruno",        "Soto",      "Cárdenas", "M", "2021-1006"],
      ["Jimena",       "Ríos",      "Mendoza",  "F", "2023-1207"],
      ["Pedro",        "Huanca",    "Apaza",    "M", "2019-0808"],
      ["Rosa",         "Ccama",     "Huillca",  "F", "2022-1009"],
      ["Marco",        "Larico",    "Checalla", "M", "2021-1010"],
      ["Lucía",        "Tito",      "Quispe",   "F", "2023-1011"],
      ["Carlos",       "Flores",    "Mamani",   "M", "2022-1012"],
      ["Claudia",      "Ramos",     "Choque",   "F", "2021-1013"],
      ["Erick",        "Huanta",    "Pillco",   "M", "2020-1014"],
      ["Nadia",        "Cutipa",    "Calizaya", "F", "2023-1015"],
      ["Kevin",        "Mulluni",   "Ticona",   "M", "2022-1016"],
      ["Fatima",       "Limache",   "Quilla",   "F", "2021-1017"],
      ["Josué",        "Vargas",    "Herrera",  "M", "2023-1018"],
      ["Milagros",     "Sucapuca",  "Coila",    "F", "2022-1019"],
      ["Álvaro",       "Cruz",      "Benique",  "M", "2021-1020"],
      ["Deysi",        "Sanca",     "Morales",  "F", "2023-1021"],
      ["Rodrigo",      "Cayo",      "Colque",   "M", "2022-1022"],
      ["Judith",       "Paredes",   "Turpo",    "F", "2021-1023"],
      ["Fernando",     "Lupaca",    "Mamani",   "M", "2020-1024"],
      ["Yesica",       "Chambilla", "Ticona",   "F", "2023-1025"],
      ["Jonathan",     "Ayca",      "Flores",   "M", "2022-1026"],
      ["Maricruz",     "Quispe",    "Callo",    "F", "2021-1027"],
      ["Abelardo",     "Chura",     "Velásquez","M", "2023-1028"],
      ["Lizbeth",      "Condori",   "Quispe",   "F", "2022-1029"],
      ["Ronal",        "Mamani",    "Huanca",   "M", "2021-1030"],
      ["Yadhira",      "Apaza",     "Flores",   "F", "2023-1031"],
      ["Sebastián",    "Torres",    "Chura",    "M", "2022-1032"],
    ];

    const docentes = ["doc-01", "doc-02"];
    return nombres.map(([nombres, ap, am, sexo, cod], i) => ({
      id:              `mat-301-${i + 1}`,
      estudiante_id:   `est-${String(i + 1).padStart(3, "0")}`,
      nombres,
      apellido_paterno: ap,
      apellido_materno: am,
      sexo,
      codigo_universitario: cod,
      foto_perfil_url: "",
      docente_id:      docentes[i < 16 ? 0 : 1],
      fichas_llenadas: i < 5 ? (i % 2) + 1 : 0,
    }));
  }

  function load(cpId) {
    try {
      const raw = sessionStorage.getItem(storageKey(cpId));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) { /* ignore */ }
    const seed = buildSeed(cpId);
    sessionStorage.setItem(storageKey(cpId), JSON.stringify(seed));
    return seed;
  }

  function save(cpId, rows) {
    sessionStorage.setItem(storageKey(cpId), JSON.stringify(rows));
  }

  function nombreCompleto(row) {
    return [row.nombres, row.apellido_paterno, row.apellido_materno].filter(Boolean).join(" ").trim();
  }

  function getDocentes(cpId) {
    return DOCENTES_CP[cpId] || [];
  }

  function matricular(cpId, rows, estudiante, docenteId) {
    const newRow = {
      id:              `mat-${Date.now()}`,
      estudiante_id:   `est-${Date.now()}`,
      nombres:         estudiante.nombres,
      apellido_paterno: estudiante.apellido_paterno,
      apellido_materno: estudiante.apellido_materno,
      sexo:            estudiante.sexo || "",
      codigo_universitario: estudiante.codigo_universitario || "",
      foto_perfil_url: "",
      docente_id:      docenteId,
      fichas_llenadas: 0,
    };
    rows.unshift(newRow);
    save(cpId, rows);
    return rows;
  }

  function cambiarTutor(cpId, rows, matId, docenteId) {
    const idx = rows.findIndex((r) => r.id === matId);
    if (idx !== -1) rows[idx].docente_id = docenteId;
    save(cpId, rows);
    return rows;
  }

  function retirar(cpId, rows, matId) {
    const newRows = rows.filter((r) => r.id !== matId);
    save(cpId, newRows);
    return newRows;
  }

  /* Estudiantes disponibles para matricular (los que no están en este cp) */
  const CANDIDATOS = [
    { nombres: "Jorge", apellido_paterno: "Inca", apellido_materno: "Ramos",   sexo: "M", codigo_universitario: "2024-0001" },
    { nombres: "Paola", apellido_paterno: "Lima", apellido_materno: "Vargas",  sexo: "F", codigo_universitario: "2024-0002" },
    { nombres: "Alex",  apellido_paterno: "Nina", apellido_materno: "Quispe",  sexo: "M", codigo_universitario: "2024-0003" },
    { nombres: "Gisela",apellido_paterno: "Cruz", apellido_materno: "Flores",  sexo: "F", codigo_universitario: "2024-0004" },
  ];

  function candidatos(cpId, rows) {
    const matriculados = new Set(rows.map((r) => r.codigo_universitario));
    return CANDIDATOS.filter((c) => !matriculados.has(c.codigo_universitario));
  }

  window.MatriculasData = {
    load,
    save,
    nombreCompleto,
    getDocentes,
    matricular,
    cambiarTutor,
    retirar,
    candidatos,
  };
})();
