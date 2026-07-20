/**
 * matriculas-data.js — estudiante_ciclo_periodo por cp_id.
 * Seeds alineados a GestionPeriodoData; sync de conteos al hub.
 */
(function () {
  const FICHAS_TOTAL = 3;
  const VERSION = "mat-v3-cableado";
  const ESTADOS_KEY = "tutortrack-estudiante-estados";

  function storageKey(cpId) {
    return `tutortrack-matriculas-${cpId}`;
  }
  function versionKey(cpId) {
    return `tutortrack-matriculas-${cpId}-version`;
  }

  /** Conteos alineados al hub (gestion-periodo-data seed). */
  const SEED_CFG = {
    /* 2025-II — origen típico de Avanzar */
    "cp-251": { n: 28, docentes: ["doc-01", "doc-02"], prefix: "251" },
    "cp-252": { n: 26, docentes: ["doc-03"], prefix: "252" },
    "cp-253": { n: 30, docentes: ["doc-01", "doc-05"], prefix: "253" },
    "cp-254": { n: 24, docentes: ["doc-02"], prefix: "254" },
    "cp-255": { n: 22, docentes: ["doc-06"], prefix: "255" },
    "cp-256": { n: 20, docentes: ["doc-04"], prefix: "256" },
    "cp-257": { n: 18, docentes: ["doc-07"], prefix: "257" },
    "cp-258": { n: 16, docentes: ["doc-03"], prefix: "258" },
    "cp-259": { n: 14, docentes: ["doc-05"], prefix: "259" },
    "cp-260": { n: 12, docentes: ["doc-06"], prefix: "260" },
    /* 2026-I — período vigente */
    "cp-301": { n: 20, docentes: ["doc-01", "doc-02"], prefix: "301" },
    "cp-302": { n: 18, docentes: ["doc-03"], prefix: "302" },
    "cp-303": { n: 22, docentes: ["doc-01", "doc-05"], prefix: "303" },
  };

  const NOMBRES = [
    ["Ana Sofía", "Quispe", "Mamani", "F"],
    ["Diego Andrés", "Huanca", "Flores", "M"],
    ["Valeria", "Condori", "Ramos", "F"],
    ["Luis Fernando", "Paucar", "Torres", "M"],
    ["Camila", "Chávez", "Vargas", "F"],
    ["Bruno", "Soto", "Cárdenas", "M"],
    ["Jimena", "Ríos", "Mendoza", "F"],
    ["Pedro", "Apaza", "Huillca", "M"],
    ["Rosa", "Ccama", "Checalla", "F"],
    ["Marco", "Larico", "Pillco", "M"],
    ["Lucía", "Tito", "Calizaya", "F"],
    ["Carlos", "Flores", "Ticona", "M"],
    ["Claudia", "Ramos", "Choque", "F"],
    ["Erick", "Huanta", "Quilla", "M"],
    ["Nadia", "Cutipa", "Coila", "F"],
    ["Kevin", "Mulluni", "Benique", "M"],
    ["Fatima", "Limache", "Morales", "F"],
    ["Josué", "Vargas", "Colque", "M"],
    ["Milagros", "Sucapuca", "Turpo", "F"],
    ["Álvaro", "Cruz", "Callo", "M"],
    ["Deysi", "Sanca", "Velásquez", "F"],
    ["Rodrigo", "Cayo", "Herrera", "M"],
    ["Judith", "Paredes", "Chura", "F"],
    ["Fernando", "Lupaca", "Inca", "M"],
    ["Yesica", "Chambilla", "Lima", "F"],
    ["Jonathan", "Ayca", "Nina", "M"],
    ["Maricruz", "Quispe", "Puma", "F"],
    ["Abelardo", "Chura", "Ari", "M"],
    ["Lizbeth", "Condori", "Soto", "F"],
    ["Ronal", "Mamani", "Ríos", "M"],
  ];

  const CANDIDATOS = [
    { estudiante_id: "est-c01", nombres: "Jorge", apellido_paterno: "Inca", apellido_materno: "Ramos", sexo: "M", codigo_universitario: "2024-0001", estado: "activo" },
    { estudiante_id: "est-c02", nombres: "Paola", apellido_paterno: "Lima", apellido_materno: "Vargas", sexo: "F", codigo_universitario: "2024-0002", estado: "activo" },
    { estudiante_id: "est-c03", nombres: "Alex", apellido_paterno: "Nina", apellido_materno: "Quispe", sexo: "M", codigo_universitario: "2024-0003", estado: "activo" },
    { estudiante_id: "est-c04", nombres: "Gisela", apellido_paterno: "Cruz", apellido_materno: "Flores", sexo: "F", codigo_universitario: "2024-0004", estado: "activo" },
    { estudiante_id: "est-c05", nombres: "Héctor", apellido_paterno: "Puma", apellido_materno: "Chura", sexo: "M", codigo_universitario: "2024-0005", estado: "activo" },
    { estudiante_id: "est-c06", nombres: "Noelia", apellido_paterno: "Ari", apellido_materno: "Mamani", sexo: "F", codigo_universitario: "2024-0006", estado: "activo" },
  ];

  function loadEstados() {
    try {
      return JSON.parse(sessionStorage.getItem(ESTADOS_KEY) || "{}");
    } catch (_) {
      return {};
    }
  }

  function saveEstados(map) {
    sessionStorage.setItem(ESTADOS_KEY, JSON.stringify(map));
  }

  function getEstado(estudianteId) {
    const map = loadEstados();
    return map[estudianteId] || "activo";
  }

  function setEstado(estudianteId, estado) {
    const map = loadEstados();
    map[estudianteId] = estado;
    saveEstados(map);
  }

  function buildSeed(cpId) {
    const cfg = SEED_CFG[cpId];
    if (!cfg) return [];
    const rows = [];
    for (let i = 0; i < cfg.n; i++) {
      const [nombres, ap, am, sexo] = NOMBRES[i % NOMBRES.length];
      const doc = cfg.docentes[i % cfg.docentes.length];
      const cod = `${cfg.prefix}-${String(i + 1).padStart(3, "0")}`;
      rows.push({
        id: `mat-${cpId}-${i + 1}`,
        estudiante_id: `est-${cpId}-${i + 1}`,
        nombres: i < NOMBRES.length ? nombres : `${nombres}-${i + 1}`,
        apellido_paterno: ap,
        apellido_materno: am,
        sexo,
        codigo_universitario: cod,
        docente_id: doc,
        fichas_llenadas: i < 3 ? (i % 3) + 1 : i < 6 ? 1 : 0,
        fichas_total: FICHAS_TOTAL,
      });
    }
    return rows;
  }

  function load(cpId) {
    if (!cpId) return [];
    if (sessionStorage.getItem(versionKey(cpId)) !== VERSION) {
      sessionStorage.removeItem(storageKey(cpId));
      sessionStorage.setItem(versionKey(cpId), VERSION);
    }
    try {
      const raw = sessionStorage.getItem(storageKey(cpId));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const rows = parsed.map((r) => ({ ...r, fichas_total: r.fichas_total || FICHAS_TOTAL }));
          syncGp(cpId, rows);
          return rows;
        }
      }
    } catch (_) {
      /* ignore */
    }
    const seed = buildSeed(cpId);
    sessionStorage.setItem(storageKey(cpId), JSON.stringify(seed));
    syncGp(cpId, seed);
    return seed;
  }

  function save(cpId, rows) {
    sessionStorage.setItem(storageKey(cpId), JSON.stringify(rows));
    syncGp(cpId, rows);
    return rows;
  }

  function syncGp(cpId, rows) {
    if (!window.GestionPeriodoData) return;
    const data = GestionPeriodoData.load();
    GestionPeriodoData.syncMatriculas(data, cpId, rows);
  }

  /** Carga (y sincroniza hub) todos los ciclo_periodo configurados. */
  function ensureAllConfigured() {
    if (!window.GestionPeriodoData) return;
    const data = GestionPeriodoData.load();
    Object.values(data.ciclo_periodos || {}).forEach((map) => {
      Object.values(map || {}).forEach((cp) => load(cp.id));
    });
  }

  function ensurePeriodo(periodoId) {
    if (!window.GestionPeriodoData || !periodoId) return;
    const data = GestionPeriodoData.load();
    const map = data.ciclo_periodos[periodoId] || {};
    Object.values(map).forEach((cp) => load(cp.id));
  }

  /**
   * Matrículas activas del período (una por estudiante), con ciclo_id.
   * Excluye egresados/retirados.
   */
  function listActivosByPeriodo(periodoId) {
    if (!window.GestionPeriodoData || !periodoId) return [];
    ensurePeriodo(periodoId);
    const data = GestionPeriodoData.load();
    const map = data.ciclo_periodos[periodoId] || {};
    const out = [];
    Object.entries(map).forEach(([cicloId, cp]) => {
      load(cp.id).forEach((r) => {
        const estado = getEstado(r.estudiante_id);
        if (estado !== "activo") return;
        out.push({
          ...r,
          ciclo_origen_id: cicloId,
          cp_origen_id: cp.id,
          docente_origen_id: r.docente_id,
          estado,
        });
      });
    });
    return out;
  }

  function nombreCompleto(row) {
    return [row.nombres, row.apellido_paterno, row.apellido_materno].filter(Boolean).join(" ").trim();
  }

  function getDocentes(cpId) {
    if (window.GestionPeriodoData) {
      const data = GestionPeriodoData.load();
      const list = GestionPeriodoData.getDocentesAsignados(data, cpId);
      if (list.length) {
        return list.map((d) => ({
          docente_id: d.docente_id,
          nombre: d.nombre,
          abrev: shortName(d.nombre),
          n_tutorados: Number(d.n_tutorados) || 0,
        }));
      }
    }
    return [];
  }

  function shortName(nombre) {
    const parts = String(nombre || "")
      .replace(/^(Dr\.|Mg\.|Lic\.)\s*/i, "")
      .split(/\s+/);
    if (parts.length < 2) return nombre;
    return `${parts[0]} ${parts[1].charAt(0)}.`;
  }

  function codigosEnPeriodo(periodoId) {
    const set = new Set();
    if (!window.GestionPeriodoData || !periodoId) return set;
    const data = GestionPeriodoData.load();
    const map = data.ciclo_periodos[periodoId] || {};
    Object.values(map).forEach((cp) => {
      load(cp.id).forEach((r) => set.add(r.codigo_universitario));
    });
    return set;
  }

  function candidatos(cpId, rows, periodoId) {
    const enPeriodo = codigosEnPeriodo(periodoId);
    return CANDIDATOS.filter(
      (c) =>
        (c.estado || "activo") === "activo" &&
        getEstado(c.estudiante_id) === "activo" &&
        !enPeriodo.has(c.codigo_universitario)
    );
  }

  function matricularVarios(cpId, rows, estudiantes, docenteId) {
    estudiantes.forEach((est) => {
      rows.unshift({
        id: `mat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        estudiante_id: est.estudiante_id || `est-${Date.now()}`,
        nombres: est.nombres,
        apellido_paterno: est.apellido_paterno,
        apellido_materno: est.apellido_materno,
        sexo: est.sexo || "",
        codigo_universitario: est.codigo_universitario || "",
        docente_id: docenteId,
        fichas_llenadas: 0,
        fichas_total: FICHAS_TOTAL,
      });
    });
    return save(cpId, rows);
  }

  function cambiarTutor(cpId, rows, matIds, docenteId) {
    const set = new Set(matIds);
    rows.forEach((r) => {
      if (set.has(r.id)) r.docente_id = docenteId;
    });
    return save(cpId, rows);
  }

  function canRetirar(row) {
    if (Number(row.fichas_llenadas) > 0) {
      return {
        ok: false,
        reason: "Tiene fichas llenadas en este ciclo; no se puede retirar (protege el historial).",
      };
    }
    return { ok: true };
  }

  function retirar(cpId, rows, matId) {
    const row = rows.find((r) => r.id === matId);
    if (!row) return { ok: false, reason: "No encontrado", rows };
    const check = canRetirar(row);
    if (!check.ok) return { ok: false, reason: check.reason, rows };
    const next = rows.filter((r) => r.id !== matId);
    save(cpId, next);
    return { ok: true, rows: next };
  }

  function summary(rows, docentes) {
    const n = rows.length;
    const tutores = docentes.length;
    const prom = tutores ? Math.round((n / tutores) * 10) / 10 : 0;
    return { matriculados: n, tutores, promedio: prom };
  }

  /**
   * Inserta en lote. Omite códigos ya en el período del cp (regla 1 matrícula/período).
   * @returns {{ inserted: number, skipped: number, rows }}
   */
  function insertMany(cpId, newRows) {
    const rows = load(cpId);
    let periodoId = null;
    if (window.GestionPeriodoData) {
      const meta = GestionPeriodoData.findCicloPeriodoMeta(GestionPeriodoData.load(), cpId);
      periodoId = meta?.periodo_id || null;
    }
    const codes = periodoId ? codigosEnPeriodo(periodoId) : new Set(rows.map((r) => r.codigo_universitario));
    let inserted = 0;
    let skipped = 0;
    newRows.forEach((r) => {
      if (codes.has(r.codigo_universitario)) {
        skipped += 1;
        return;
      }
      rows.push({
        ...r,
        id: r.id || `mat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        fichas_llenadas: r.fichas_llenadas || 0,
        fichas_total: r.fichas_total || FICHAS_TOTAL,
      });
      codes.add(r.codigo_universitario);
      inserted += 1;
    });
    save(cpId, rows);
    return { inserted, skipped, rows };
  }

  window.MatriculasData = {
    FICHAS_TOTAL,
    load,
    save,
    nombreCompleto,
    getDocentes,
    candidatos,
    matricularVarios,
    cambiarTutor,
    canRetirar,
    retirar,
    summary,
    insertMany,
    ensureAllConfigured,
    ensurePeriodo,
    listActivosByPeriodo,
    getEstado,
    setEstado,
  };
})();
