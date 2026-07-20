/**
 * gestion-periodo-data.js — Configuración del período (Módulo 2).
 * Entidades: periodo_academico, ciclo, ciclo_periodo, docente_ciclo_periodo,
 * contadores de temario / matrículas (mock) + traza local de movimientos.
 */
(function () {
  const STORAGE_KEY = "tutortrack-gestion-periodo";
  const VERSION_KEY = "tutortrack-gestion-periodo-version";
  const STORAGE_VERSION = "gp-v3-config-diseno";

  const PERIODOS_SEED = [
    { id: "p-2024-2", nombre: "2024-II", fecha_inicio: "2024-08-01", fecha_fin: "2024-12-15", activo: false },
    { id: "p-2025-1", nombre: "2025-I", fecha_inicio: "2025-03-01", fecha_fin: "2025-07-15", activo: false },
    { id: "p-2025-2", nombre: "2025-II", fecha_inicio: "2025-08-01", fecha_fin: "2025-12-20", activo: false },
    { id: "p-2026-1", nombre: "2026-I", fecha_inicio: "2026-03-01", fecha_fin: "2026-07-31", activo: true },
  ];

  const CICLOS_SEED = [
    { id: "ciclo-1", nombre: "Primer ciclo", orden: 1, activo: true },
    { id: "ciclo-2", nombre: "Segundo ciclo", orden: 2, activo: true },
    { id: "ciclo-3", nombre: "Tercer ciclo", orden: 3, activo: true },
    { id: "ciclo-4", nombre: "Cuarto ciclo", orden: 4, activo: true },
    { id: "ciclo-5", nombre: "Quinto ciclo", orden: 5, activo: true },
    { id: "ciclo-6", nombre: "Sexto ciclo", orden: 6, activo: true },
    { id: "ciclo-7", nombre: "Séptimo ciclo", orden: 7, activo: true },
    { id: "ciclo-8", nombre: "Octavo ciclo", orden: 8, activo: true },
    { id: "ciclo-9", nombre: "Noveno ciclo", orden: 9, activo: true },
    { id: "ciclo-10", nombre: "Décimo ciclo", orden: 10, activo: true },
  ];

  const DOCENTES = [
    { id: "doc-01", nombre: "Dr. Raúl Quispe Mamani", activo: true },
    { id: "doc-02", nombre: "Mg. Lucía Torres Ávila", activo: true },
    { id: "doc-03", nombre: "Mg. Carlos Vargas Huanca", activo: true },
    { id: "doc-04", nombre: "Lic. Ana Mendoza Flores", activo: true },
    { id: "doc-05", nombre: "Mg. Patricia Flores Cárdenas", activo: true },
    { id: "doc-06", nombre: "Lic. Jorge Mamani Juárez", activo: true },
    { id: "doc-07", nombre: "Mg. Elena Condori Apaza", activo: true },
  ];

  /** ciclo_periodos[periodoId][cicloId] = { id, n_matriculados, n_temas } */
  const SEED = {
    ciclo_periodos: {
      "p-2025-2": {
        "ciclo-1": { id: "cp-251", n_matriculados: 28, n_temas: 6 },
        "ciclo-2": { id: "cp-252", n_matriculados: 26, n_temas: 5 },
        "ciclo-3": { id: "cp-253", n_matriculados: 30, n_temas: 7 },
        "ciclo-4": { id: "cp-254", n_matriculados: 24, n_temas: 4 },
        "ciclo-5": { id: "cp-255", n_matriculados: 22, n_temas: 5 },
        "ciclo-6": { id: "cp-256", n_matriculados: 20, n_temas: 4 },
        "ciclo-7": { id: "cp-257", n_matriculados: 18, n_temas: 3 },
        "ciclo-8": { id: "cp-258", n_matriculados: 16, n_temas: 3 },
        "ciclo-9": { id: "cp-259", n_matriculados: 14, n_temas: 2 },
        "ciclo-10": { id: "cp-260", n_matriculados: 12, n_temas: 2 },
      },
      /* 2026-I: solo 1°–3° → clonar desde 2025-II agrega 4°–10° */
      "p-2026-1": {
        "ciclo-1": { id: "cp-301", n_matriculados: 20, n_temas: 7 },
        "ciclo-2": { id: "cp-302", n_matriculados: 18, n_temas: 5 },
        "ciclo-3": { id: "cp-303", n_matriculados: 22, n_temas: 6 },
      },
    },
    /** docentes_asignados[cpId] = [{ docente_id, nombre, n_tutorados }] */
    docentes_asignados: {
      "cp-251": [
        { docente_id: "doc-01", nombre: "Dr. Raúl Quispe Mamani", n_tutorados: 15 },
        { docente_id: "doc-02", nombre: "Mg. Lucía Torres Ávila", n_tutorados: 13 },
      ],
      "cp-252": [{ docente_id: "doc-03", nombre: "Mg. Carlos Vargas Huanca", n_tutorados: 26 }],
      "cp-253": [
        { docente_id: "doc-01", nombre: "Dr. Raúl Quispe Mamani", n_tutorados: 16 },
        { docente_id: "doc-05", nombre: "Mg. Patricia Flores Cárdenas", n_tutorados: 14 },
      ],
      "cp-254": [{ docente_id: "doc-02", nombre: "Mg. Lucía Torres Ávila", n_tutorados: 24 }],
      "cp-255": [{ docente_id: "doc-06", nombre: "Lic. Jorge Mamani Juárez", n_tutorados: 22 }],
      "cp-256": [{ docente_id: "doc-04", nombre: "Lic. Ana Mendoza Flores", n_tutorados: 20 }],
      "cp-257": [{ docente_id: "doc-07", nombre: "Mg. Elena Condori Apaza", n_tutorados: 18 }],
      "cp-258": [{ docente_id: "doc-03", nombre: "Mg. Carlos Vargas Huanca", n_tutorados: 16 }],
      "cp-259": [{ docente_id: "doc-05", nombre: "Mg. Patricia Flores Cárdenas", n_tutorados: 14 }],
      "cp-260": [{ docente_id: "doc-06", nombre: "Lic. Jorge Mamani Juárez", n_tutorados: 12 }],
      "cp-301": [
        { docente_id: "doc-01", nombre: "Dr. Raúl Quispe Mamani", n_tutorados: 12 },
        { docente_id: "doc-02", nombre: "Mg. Lucía Torres Ávila", n_tutorados: 8 },
      ],
      "cp-302": [{ docente_id: "doc-03", nombre: "Mg. Carlos Vargas Huanca", n_tutorados: 18 }],
      "cp-303": [
        { docente_id: "doc-01", nombre: "Dr. Raúl Quispe Mamani", n_tutorados: 10 },
        { docente_id: "doc-05", nombre: "Mg. Patricia Flores Cárdenas", n_tutorados: 12 },
      ],
    },
    /** movimientos del período (auditoría de UI); también se escribe en AuditoriaData */
    movimientos: [],
  };

  let _data = null;

  function ensureVersion() {
    if (sessionStorage.getItem(VERSION_KEY) !== STORAGE_VERSION) {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
  }

  function readCatalogPeriodos() {
    try {
      const raw = sessionStorage.getItem("tutortrack-periodos");
      if (!raw) return null;
      const rows = JSON.parse(raw);
      if (!Array.isArray(rows) || !rows.length) return null;
      return rows
        .map((p) => ({
          id: p.id,
          nombre: p.nombre,
          fecha_inicio: p.fecha_inicio || "",
          fecha_fin: p.fecha_fin || "",
          activo: Boolean(p.activo),
        }))
        .sort((a, b) => String(b.nombre).localeCompare(String(a.nombre), "es"));
    } catch (_) {
      return null;
    }
  }

  function readCatalogCiclos() {
    try {
      const raw = sessionStorage.getItem("tutortrack-ciclos");
      if (!raw) return null;
      const rows = JSON.parse(raw);
      if (!Array.isArray(rows) || !rows.length) return null;
      return rows
        .filter((c) => c.activo !== false)
        .map((c) => ({
          id: c.id,
          nombre: c.nombre,
          orden: Number(c.orden) || 0,
          activo: c.activo !== false,
        }))
        .sort((a, b) => a.orden - b.orden);
    } catch (_) {
      return null;
    }
  }

  function load() {
    ensureVersion();
    if (_data) {
      _data.periodos = readCatalogPeriodos() || PERIODOS_SEED;
      _data.ciclos = readCatalogCiclos() || CICLOS_SEED;
      return _data;
    }
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        _data = JSON.parse(raw);
        _data.periodos = readCatalogPeriodos() || PERIODOS_SEED;
        _data.ciclos = readCatalogCiclos() || CICLOS_SEED;
        if (!_data.docentes_asignados) _data.docentes_asignados = {};
        if (!_data.ciclo_periodos) _data.ciclo_periodos = {};
        if (!_data.movimientos) _data.movimientos = [];
        return _data;
      }
    } catch (_) {
      /* ignore */
    }
    _data = JSON.parse(JSON.stringify(SEED));
    _data.periodos = readCatalogPeriodos() || PERIODOS_SEED;
    _data.ciclos = readCatalogCiclos() || CICLOS_SEED;
    _data.movimientos = seedMovimientos();
    persist();
    return _data;
  }

  function persist() {
    if (!_data) return;
    const { periodos, ciclos, ...rest } = _data;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  }

  function save(data) {
    _data = data;
    persist();
  }

  function seedMovimientos() {
    return [
      {
        id: "mov-1",
        periodo_id: "p-2026-1",
        created_at: "2026-02-10T09:15:00.000Z",
        usuario_nombre: "Ricardo Vargas Vargas",
        accion: "crear",
        tabla: "ciclo_periodo",
        resumen: "Se agregó Primer ciclo al período",
        valores_nuevos: { ciclo: "Primer ciclo" },
      },
      {
        id: "mov-2",
        periodo_id: "p-2026-1",
        created_at: "2026-02-10T09:20:00.000Z",
        usuario_nombre: "Ricardo Vargas Vargas",
        accion: "crear",
        tabla: "docente_ciclo_periodo",
        resumen: "Se asignó Dr. Raúl Quispe Mamani a Primer ciclo",
        valores_nuevos: { docente: "Dr. Raúl Quispe Mamani", ciclo: "Primer ciclo" },
      },
      {
        id: "mov-3",
        periodo_id: "p-2026-1",
        created_at: "2026-02-12T11:05:00.000Z",
        usuario_nombre: "Ricardo Vargas Vargas",
        accion: "crear",
        tabla: "ciclo_periodo",
        resumen: "Se agregaron Segundo y Tercer ciclo",
        valores_nuevos: { ciclos: "Segundo ciclo, Tercer ciclo" },
      },
    ];
  }

  function periodoVigente(data) {
    return data.periodos.find((p) => p.activo) || data.periodos[0] || null;
  }

  function cicloById(data, cicloId) {
    return data.ciclos.find((c) => c.id === cicloId) || null;
  }

  function periodoById(data, periodoId) {
    return data.periodos.find((p) => p.id === periodoId) || null;
  }

  function listCicloPeriodos(data, periodoId) {
    const map = data.ciclo_periodos[periodoId] || {};
    return data.ciclos
      .filter((c) => map[c.id])
      .map((ciclo) => {
        const cp = map[ciclo.id];
        const docentes = getDocentesAsignados(data, cp.id);
        return {
          id: cp.id,
          ciclo_id: ciclo.id,
          ciclo_nombre: ciclo.nombre,
          ciclo_orden: ciclo.orden,
          periodo_id: periodoId,
          n_docentes: docentes.length,
          n_temas: (() => {
            const live = countTemario(cp.id);
            return live > 0 ? live : Number(cp.n_temas) || 0;
          })(),
          n_matriculados: Number(cp.n_matriculados) || 0,
          docentes,
        };
      });
  }

  function countTemario(cpId) {
    if (window.TemarioData && typeof TemarioData.load === "function") {
      try {
        return TemarioData.load(cpId).length;
      } catch (_) {
        /* ignore */
      }
    }
    return 0;
  }

  function summary(data, periodoId) {
    const rows = listCicloPeriodos(data, periodoId);
    const docentesIds = new Set();
    rows.forEach((r) => r.docentes.forEach((d) => docentesIds.add(d.docente_id)));
    return {
      ciclos: rows.length,
      docentes: docentesIds.size,
      matriculados: rows.reduce((acc, r) => acc + r.n_matriculados, 0),
    };
  }

  function ciclosDisponibles(data, periodoId) {
    const map = data.ciclo_periodos[periodoId] || {};
    return data.ciclos.filter((c) => !map[c.id]);
  }

  function addCiclos(data, periodoId, cicloIds) {
    if (!data.ciclo_periodos[periodoId]) data.ciclo_periodos[periodoId] = {};
    const map = data.ciclo_periodos[periodoId];
    const added = [];
    cicloIds.forEach((cicloId) => {
      if (map[cicloId]) return;
      const ciclo = cicloById(data, cicloId);
      if (!ciclo) return;
      const cpId = `cp-${Date.now()}-${cicloId}`;
      map[cicloId] = { id: cpId, n_matriculados: 0, n_temas: 0 };
      data.docentes_asignados[cpId] = [];
      added.push(ciclo.nombre);
      auditLog(data, {
        periodo_id: periodoId,
        accion: "crear",
        tabla: "ciclo_periodo",
        registro_id: cpId,
        resumen: `Se agregó ${ciclo.nombre} al período`,
        valores_nuevos: { ciclo: ciclo.nombre, ciclo_id: cicloId },
      });
    });
    persist();
    return added;
  }

  function canRemoveCiclo(data, periodoId, cicloId) {
    const cp = data.ciclo_periodos[periodoId]?.[cicloId];
    if (!cp) return { ok: false, reason: "Ciclo no configurado en este período." };
    const docentes = getDocentesAsignados(data, cp.id);
    const nTemas = Number(cp.n_temas) || countTemario(cp.id);
    const nMat = Number(cp.n_matriculados) || 0;
    if (docentes.length || nTemas || nMat) {
      const parts = [];
      if (docentes.length) parts.push(`${docentes.length} docente(s)`);
      if (nTemas) parts.push(`${nTemas} tema(s)`);
      if (nMat) parts.push(`${nMat} matriculado(s)`);
      return {
        ok: false,
        reason: `Primero vacía este ciclo (${parts.join(", ")}).`,
      };
    }
    return { ok: true, cp };
  }

  function removeCiclo(data, periodoId, cicloId) {
    const check = canRemoveCiclo(data, periodoId, cicloId);
    if (!check.ok) return check;
    const ciclo = cicloById(data, cicloId);
    const cpId = check.cp.id;
    delete data.ciclo_periodos[periodoId][cicloId];
    delete data.docentes_asignados[cpId];
    auditLog(data, {
      periodo_id: periodoId,
      accion: "eliminar",
      tabla: "ciclo_periodo",
      registro_id: cpId,
      resumen: `Se quitó ${ciclo?.nombre || cicloId} del período`,
      valores_anteriores: { ciclo: ciclo?.nombre || cicloId },
    });
    persist();
    return { ok: true };
  }

  function getDocentesAsignados(data, cpId) {
    return (data.docentes_asignados[cpId] || []).map((d) => ({ ...d }));
  }

  function cargaDocenteEnPeriodo(data, periodoId, docenteId) {
    const map = data.ciclo_periodos[periodoId] || {};
    let total = 0;
    Object.values(map).forEach((cp) => {
      const row = (data.docentes_asignados[cp.id] || []).find((d) => d.docente_id === docenteId);
      if (row) total += Number(row.n_tutorados) || 0;
    });
    return total;
  }

  function docentesDisponiblesParaCp(data, periodoId, cpId) {
    const asignados = new Set(getDocentesAsignados(data, cpId).map((d) => d.docente_id));
    return DOCENTES.filter((d) => d.activo && !asignados.has(d.id)).map((d) => ({
      ...d,
      carga_periodo: cargaDocenteEnPeriodo(data, periodoId, d.id),
    }));
  }

  function assignDocentes(data, periodoId, cpId, docenteIds) {
    const list = data.docentes_asignados[cpId] || (data.docentes_asignados[cpId] = []);
    const added = [];
    docenteIds.forEach((id) => {
      if (list.some((d) => d.docente_id === id)) return;
      const doc = DOCENTES.find((d) => d.id === id);
      if (!doc) return;
      list.push({ docente_id: doc.id, nombre: doc.nombre, n_tutorados: 0 });
      added.push(doc.nombre);
      auditLog(data, {
        periodo_id: periodoId,
        accion: "crear",
        tabla: "docente_ciclo_periodo",
        registro_id: `${cpId}:${doc.id}`,
        resumen: `Se asignó ${doc.nombre}`,
        valores_nuevos: { docente: doc.nombre, ciclo_periodo_id: cpId },
      });
    });
    persist();
    return added;
  }

  function canRemoveDocente(data, cpId, docenteId) {
    const row = getDocentesAsignados(data, cpId).find((d) => d.docente_id === docenteId);
    if (!row) return { ok: false, reason: "Docente no asignado." };
    if (Number(row.n_tutorados) > 0) {
      return {
        ok: false,
        reason: "Reasígnalos en Matrículas antes de quitarlo.",
        n_tutorados: row.n_tutorados,
        nombre: row.nombre,
      };
    }
    return { ok: true, row };
  }

  function removeDocente(data, periodoId, cpId, docenteId) {
    const check = canRemoveDocente(data, cpId, docenteId);
    if (!check.ok) return check;
    data.docentes_asignados[cpId] = (data.docentes_asignados[cpId] || []).filter(
      (d) => d.docente_id !== docenteId
    );
    auditLog(data, {
      periodo_id: periodoId,
      accion: "eliminar",
      tabla: "docente_ciclo_periodo",
      registro_id: `${cpId}:${docenteId}`,
      resumen: `Se quitó ${check.row.nombre}`,
      valores_anteriores: { docente: check.row.nombre, ciclo_periodo_id: cpId },
    });
    persist();
    return { ok: true };
  }

  function previewClone(data, origenId, destinoId) {
    const origen = data.ciclo_periodos[origenId] || {};
    const destino = data.ciclo_periodos[destinoId] || {};
    const agregar = [];
    const omitir = [];
    Object.keys(origen).forEach((cicloId) => {
      const ciclo = cicloById(data, cicloId);
      const nombre = ciclo?.nombre || cicloId;
      if (destino[cicloId]) omitir.push(nombre);
      else agregar.push({ cicloId, nombre });
    });
    return { agregar, omitir };
  }

  function cloneTemario(origenCpId, destinoCpId) {
    if (!window.TemarioData || typeof TemarioData.load !== "function") return 0;
    const nodos = TemarioData.load(origenCpId);
    if (!nodos.length) return 0;
    const idMap = {};
    const cloned = nodos.map((n) => {
      const newId = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      idMap[n.id] = newId;
      return { ...n, id: newId };
    });
    cloned.forEach((n) => {
      if (n.padre_id && idMap[n.padre_id]) n.padre_id = idMap[n.padre_id];
      else n.padre_id = null;
    });
    TemarioData.save(destinoCpId, cloned);
    return cloned.length;
  }

  function clonarMerge(data, origenId, destinoId) {
    const preview = previewClone(data, origenId, destinoId);
    if (!preview.agregar.length) return preview;
    if (!data.ciclo_periodos[destinoId]) data.ciclo_periodos[destinoId] = {};
    const origen = data.ciclo_periodos[origenId];
    preview.agregar.forEach(({ cicloId }) => {
      const src = origen[cicloId];
      const newCpId = `cp-${Date.now()}-${cicloId}`;
      const nTemas = cloneTemario(src.id, newCpId) || Number(src.n_temas) || 0;
      data.ciclo_periodos[destinoId][cicloId] = {
        id: newCpId,
        n_matriculados: 0,
        n_temas: nTemas,
      };
      const docs = (data.docentes_asignados[src.id] || []).map((d) => ({
        docente_id: d.docente_id,
        nombre: d.nombre,
        n_tutorados: 0,
      }));
      data.docentes_asignados[newCpId] = docs;
    });
    const origenNombre = periodoById(data, origenId)?.nombre || origenId;
    auditLog(data, {
      periodo_id: destinoId,
      accion: "crear",
      tabla: "ciclo_periodo",
      registro_id: destinoId,
      resumen: `Clonado desde ${origenNombre}: +${preview.agregar.length} ciclo(s)`,
      valores_nuevos: {
        origen: origenNombre,
        agregados: preview.agregar.map((a) => a.nombre).join(", "),
        omitidos: preview.omitir.join(", ") || "—",
      },
    });
    persist();
    return preview;
  }

  function auditLog(data, entry) {
    const mov = {
      id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      periodo_id: entry.periodo_id,
      created_at: new Date().toISOString(),
      usuario_nombre: (window.AuditoriaData && AuditoriaData.ACTOR?.nombre) || "Ricardo Vargas Vargas",
      accion: entry.accion,
      tabla: entry.tabla,
      resumen: entry.resumen,
      valores_anteriores: entry.valores_anteriores || null,
      valores_nuevos: entry.valores_nuevos || null,
    };
    data.movimientos = data.movimientos || [];
    data.movimientos.unshift(mov);
    if (window.AuditoriaData && typeof AuditoriaData.log === "function") {
      AuditoriaData.log({
        accion: entry.accion,
        tabla_afectada: entry.tabla,
        registro_id: entry.registro_id || entry.periodo_id,
        valores_anteriores: entry.valores_anteriores,
        valores_nuevos: entry.valores_nuevos,
      });
    }
  }

  function listMovimientos(data, periodoId) {
    return (data.movimientos || [])
      .filter((m) => m.periodo_id === periodoId)
      .slice()
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  }

  function findCicloPeriodoMeta(data, cpId) {
    for (const [periodoId, map] of Object.entries(data.ciclo_periodos || {})) {
      for (const [cicloId, cp] of Object.entries(map)) {
        if (cp.id === cpId) {
          return {
            periodo_id: periodoId,
            ciclo_id: cicloId,
            periodo: periodoById(data, periodoId),
            ciclo: cicloById(data, cicloId),
            cp,
          };
        }
      }
    }
    return null;
  }

  /** Actualiza n_matriculados y n_tutorados del pool tras cambios en Matrículas. */
  function syncMatriculas(data, cpId, rows) {
    const meta = findCicloPeriodoMeta(data, cpId);
    if (!meta) return;
    meta.cp.n_matriculados = Array.isArray(rows) ? rows.length : 0;
    const counts = {};
    (rows || []).forEach((r) => {
      if (!r.docente_id) return;
      counts[r.docente_id] = (counts[r.docente_id] || 0) + 1;
    });
    const list = data.docentes_asignados[cpId] || [];
    list.forEach((d) => {
      d.n_tutorados = counts[d.docente_id] || 0;
    });
    persist();
  }

  function syncTemarioCount(data, cpId, nTemas) {
    const meta = findCicloPeriodoMeta(data, cpId);
    if (!meta) return;
    meta.cp.n_temas = Number(nTemas) || 0;
    persist();
  }

  /** Ciclos del período destino con su pool de docentes (para Avanzar). */
  function poolsPorCiclo(data, periodoId) {
    const map = data.ciclo_periodos[periodoId] || {};
    const out = {};
    Object.entries(map).forEach(([cicloId, cp]) => {
      out[cicloId] = {
        cp_id: cp.id,
        docentes: getDocentesAsignados(data, cp.id),
      };
    });
    return out;
  }

  window.GestionPeriodoData = {
    DOCENTES,
    load,
    save,
    periodoVigente,
    periodoById,
    cicloById,
    listCicloPeriodos,
    summary,
    ciclosDisponibles,
    addCiclos,
    canRemoveCiclo,
    removeCiclo,
    getDocentesAsignados,
    cargaDocenteEnPeriodo,
    docentesDisponiblesParaCp,
    assignDocentes,
    canRemoveDocente,
    removeDocente,
    previewClone,
    clonarMerge,
    listMovimientos,
    findCicloPeriodoMeta,
    syncMatriculas,
    syncTemarioCount,
    poolsPorCiclo,
  };
})();
