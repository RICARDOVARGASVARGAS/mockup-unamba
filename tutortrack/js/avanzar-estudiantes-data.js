/**
 * avanzar-estudiantes-data.js — seed para el flujo "Avanzar estudiantes" (M2-6).
 * Genera la propuesta de matrícula del periodo 2025-II → 2026-I.
 */
(function () {
  const STORAGE_KEY = "tutortrack-avanzar-propuesta";
  const VERSION_KEY = "tutortrack-avanzar-version";
  const STORAGE_VERSION = "seed-26-v1";

  const PERIODOS = [
    { id: "per-2", nombre: "2025-II" },
    { id: "per-3", nombre: "2026-I"  },
  ];

  const CICLOS = [
    { id: "cic-1", nombre: "1° Ciclo", orden: 1 },
    { id: "cic-2", nombre: "2° Ciclo", orden: 2 },
    { id: "cic-3", nombre: "3° Ciclo", orden: 3 },
    { id: "cic-4", nombre: "4° Ciclo", orden: 4 },
    { id: "cic-5", nombre: "5° Ciclo", orden: 5 },
  ];

  /* Docentes por ciclo en el período destino (2026-I) */
  const DOCENTES_DESTINO = {
    "cic-1": [
      { id: "doc-01", nombre: "Mg. Carlos Vargas Huanca",     abrev: "Vargas H." },
      { id: "doc-02", nombre: "Lic. Ana Torres Mendoza",      abrev: "Torres M." },
    ],
    "cic-2": [
      { id: "doc-03", nombre: "Dr. Roberto Quispe Ramos",     abrev: "Quispe R." },
    ],
    "cic-3": [
      { id: "doc-01", nombre: "Mg. Carlos Vargas Huanca",     abrev: "Vargas H." },
      { id: "doc-04", nombre: "Mg. Patricia Flores Cárdenas", abrev: "Flores C." },
    ],
    "cic-4": [
      { id: "doc-02", nombre: "Lic. Ana Torres Mendoza",      abrev: "Torres M." },
    ],
    "cic-5": [
      { id: "doc-05", nombre: "Lic. Jorge Mamani Juárez",     abrev: "Mamani J." },
    ],
  };

  /* Genera propuesta de avance: ciclo siguiente por orden */
  function cicloSiguiente(cicloId) {
    const actual = CICLOS.find((c) => c.id === cicloId);
    if (!actual) return cicloId;
    const sig = CICLOS.find((c) => c.orden === actual.orden + 1);
    return sig ? sig.id : cicloId; /* si ya está en el último, repite */
  }

  /* Primer docente del ciclo destino por defecto */
  function docenteDefault(cicloDestinoId) {
    const docs = DOCENTES_DESTINO[cicloDestinoId] || [];
    return docs.length ? docs[0].id : "";
  }

  function buildSeed() {
    const primera = [
      ["Ana Sofía",     "Mamani",     "Flores",    "F", "2021-1001", "cic-1"],
      ["Diego Andrés",  "Quispe",     "Huamán",    "M", "2021-1002", "cic-1"],
      ["Valeria",       "Condori",    "Ramos",     "F", "2022-1103", "cic-1"],
      ["Luis Fernando", "Paucar",     "Torres",    "M", "2020-0904", "cic-2"],
      ["Camila",        "Chávez",     "Vargas",    "F", "2021-1005", "cic-2"],
      ["Bruno",         "Soto",       "Cárdenas",  "M", "2021-1006", "cic-2"],
      ["Jimena",        "Ríos",       "Mendoza",   "F", "2023-1207", "cic-1"],
      ["Pedro",         "Huanca",     "Apaza",     "M", "2019-0808", "cic-3"],
      ["Rosa",          "Ccama",      "Huillca",   "F", "2022-1009", "cic-2"],
      ["Marco",         "Larico",     "Checalla",  "M", "2021-1010", "cic-3"],
      ["Lucía",         "Tito",       "Quispe",    "F", "2023-1011", "cic-1"],
      ["Carlos",        "Flores",     "Mamani",    "M", "2022-1012", "cic-2"],
      ["Claudia",       "Ramos",      "Choque",    "F", "2021-1013", "cic-3"],
      ["Erick",         "Huanta",     "Pillco",    "M", "2020-1014", "cic-4"],
      ["Nadia",         "Cutipa",     "Calizaya",  "F", "2023-1015", "cic-1"],
      ["Kevin",         "Mulluni",    "Ticona",    "M", "2022-1016", "cic-2"],
      ["Fatima",        "Limache",    "Quilla",    "F", "2021-1017", "cic-3"],
      ["Josué",         "Vargas",     "Herrera",   "M", "2023-1018", "cic-1"],
      ["Milagros",      "Sucapuca",   "Coila",     "F", "2022-1019", "cic-2"],
      ["Álvaro",        "Cruz",       "Benique",   "M", "2021-1020", "cic-4"],
      ["Deysi",         "Sanca",      "Morales",   "F", "2023-1021", "cic-1"],
      ["Rodrigo",       "Cayo",       "Colque",    "M", "2022-1022", "cic-2"],
      ["Judith",        "Paredes",    "Turpo",     "F", "2021-1023", "cic-3"],
      ["Fernando",      "Lupaca",     "Mamani",    "M", "2020-1024", "cic-4"],
      ["Yesica",        "Chambilla",  "Ticona",    "F", "2023-1025", "cic-1"],
      ["Jonathan",      "Ayca",       "Flores",    "M", "2022-1026", "cic-2"],
      ["Maricruz",      "Quispe",     "Callo",     "F", "2021-1027", "cic-3"],
      ["Abelardo",      "Chura",      "Velásquez", "M", "2023-1028", "cic-1"],
      ["Lizbeth",       "Condori",    "Quispe",    "F", "2022-1029", "cic-2"],
      ["Ronal",         "Mamani",     "Huanca",    "M", "2021-1030", "cic-3"],
      ["Yadhira",       "Apaza",      "Flores",    "F", "2023-1031", "cic-1"],
      ["Sebastián",     "Torres",     "Chura",     "M", "2022-1032", "cic-2"],
      /* más 121 ficticios simplificados */
    ];

    /* Expandir a 153 usando un patrón genérico */
    while (primera.length < 153) {
      const i = primera.length + 1;
      const ciclos = ["cic-1", "cic-2", "cic-3", "cic-4", "cic-5"];
      primera.push([`Estudiante-${i}`, "Apellido", "Materno", i % 2 === 0 ? "M" : "F", `2023-${String(i).padStart(4, "0")}`, ciclos[i % 5]]);
    }

    return primera.map(([nombres, ap, am, sexo, cod, cicloId], i) => {
      const cicloDestino = cicloSiguiente(cicloId);
      return {
        id:               `av-${i + 1}`,
        nombres,
        apellido_paterno:  ap,
        apellido_materno:  am,
        sexo,
        codigo_universitario: cod,
        ciclo_origen_id:  cicloId,
        ciclo_destino_id: cicloDestino,
        docente_destino_id: docenteDefault(cicloDestino),
        incluir:          i >= 148 ? false : true, /* primeros 148 incluidos */
      };
    });
  }

  function load() {
    if (sessionStorage.getItem(VERSION_KEY) !== STORAGE_VERSION) {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (Array.isArray(p)) return p;
      }
    } catch (_) { /* ignore */ }
    const seed = buildSeed();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  function save(rows) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }

  function nombreCompleto(row) {
    return [row.nombres, row.apellido_paterno, row.apellido_materno].filter(Boolean).join(" ").trim();
  }

  function cicloNombre(cicloId) {
    return CICLOS.find((c) => c.id === cicloId)?.nombre || cicloId;
  }

  function calcBalance(rows) {
    const inc = rows.filter((r) => r.incluir);
    const byDoc = {};
    inc.forEach((r) => {
      const key = `${r.ciclo_destino_id}|${r.docente_destino_id}`;
      byDoc[key] = (byDoc[key] || 0) + 1;
    });
    const result = [];
    Object.keys(DOCENTES_DESTINO).forEach((cicloId) => {
      DOCENTES_DESTINO[cicloId].forEach((d) => {
        const key = `${cicloId}|${d.id}`;
        result.push({ docente_id: d.id, abrev: d.abrev, ciclo: cicloNombre(cicloId), n: byDoc[key] || 0 });
      });
    });
    return result;
  }

  window.AvanzarData = {
    PERIODOS,
    CICLOS,
    DOCENTES_DESTINO,
    load,
    save,
    nombreCompleto,
    cicloNombre,
    calcBalance,
    docenteDefault,
    cicloSiguiente,
  };
})();
