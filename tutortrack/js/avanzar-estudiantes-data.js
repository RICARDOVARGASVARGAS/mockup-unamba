/**
 * avanzar-estudiantes-data.js — propuesta desde matrículas reales del período origen.
 */
(function () {
  const STORAGE_KEY = "tutortrack-avanzar-propuesta";
  const VERSION_KEY = "tutortrack-avanzar-version";
  const STORAGE_VERSION = "av-v3-desde-matriculas";

  const ACCIONES = ["avanza", "repite", "egresa", "excluir"];

  function ensureVersion() {
    if (sessionStorage.getItem(VERSION_KEY) !== STORAGE_VERSION) {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
  }

  function nombreCompleto(row) {
    return [row.nombres, row.apellido_paterno, row.apellido_materno].filter(Boolean).join(" ").trim();
  }

  function ciclosFromGp(data) {
    return (data.ciclos || []).slice().sort((a, b) => a.orden - b.orden);
  }

  function cicloSiguiente(ciclos, cicloId) {
    const actual = ciclos.find((c) => c.id === cicloId);
    if (!actual) return null;
    const maxOrden = ciclos.reduce((m, c) => Math.max(m, c.orden), 0);
    if (actual.orden >= maxOrden) return null;
    return ciclos.find((c) => c.orden === actual.orden + 1) || null;
  }

  function pools(data, periodoDestinoId) {
    return GestionPeriodoData.poolsPorCiclo(data, periodoDestinoId);
  }

  function pickTutor(poolDocs, preferId) {
    if (!poolDocs || !poolDocs.length) return "";
    if (preferId && poolDocs.some((d) => d.docente_id === preferId)) return preferId;
    return poolDocs[0].docente_id;
  }

  /**
   * Propuesta desde estudiantes activos matriculados en el período origen.
   * DISEÑO + BD: ciclo orden+1; mismo tutor si sigue en pool destino; último → Egresa.
   */
  function generarPropuesta(origenId, destinoId) {
    if (!window.MatriculasData) {
      throw new Error("MatriculasData no disponible");
    }
    MatriculasData.ensurePeriodo(origenId);
    MatriculasData.ensurePeriodo(destinoId);

    const data = GestionPeriodoData.load();
    const ciclos = ciclosFromGp(data);
    const poolMap = pools(data, destinoId);
    const origenes = MatriculasData.listActivosByPeriodo(origenId);

    const yaEnDestino = new Set();
    const destMap = data.ciclo_periodos[destinoId] || {};
    Object.values(destMap).forEach((cp) => {
      MatriculasData.load(cp.id).forEach((r) => yaEnDestino.add(r.codigo_universitario));
    });

    const rows = origenes.map((est, i) => {
      const sig = cicloSiguiente(ciclos, est.ciclo_origen_id);
      let accion = "avanza";
      let cicloDestinoId = sig?.id || null;
      if (!sig) {
        accion = "egresa";
        cicloDestinoId = null;
      }

      /* Si el ciclo destino no existe en el período destino → avisar sin tutor / excluir implícito vía pool vacío */
      const pool = cicloDestinoId ? poolMap[cicloDestinoId]?.docentes || [] : [];
      const cicloEnDestino = Boolean(cicloDestinoId && poolMap[cicloDestinoId]);
      let docenteId = "";
      if ((accion === "avanza" || accion === "repite") && cicloEnDestino) {
        docenteId = pickTutor(pool, est.docente_origen_id);
      }

      return {
        id: `av-${est.estudiante_id}`,
        estudiante_id: est.estudiante_id,
        nombres: est.nombres,
        apellido_paterno: est.apellido_paterno,
        apellido_materno: est.apellido_materno,
        sexo: est.sexo,
        codigo_universitario: est.codigo_universitario,
        ciclo_origen_id: est.ciclo_origen_id,
        docente_origen_id: est.docente_origen_id,
        estado: "activo",
        accion,
        ciclo_destino_id: cicloDestinoId,
        docente_destino_id: docenteId,
        selected: true,
        ya_en_destino: yaEnDestino.has(est.codigo_universitario),
        ciclo_faltante: accion === "avanza" && cicloDestinoId && !cicloEnDestino,
      };
    });

    /* Algunos "repite" demo (~3 primeros del 2° ciclo) — el admin puede revertir */
    let repiteCount = 0;
    rows.forEach((r) => {
      if (repiteCount >= 3) return;
      if (r.accion !== "avanza") return;
      if (r.ciclo_origen_id !== "ciclo-2") return;
      r.accion = "repite";
      r.ciclo_destino_id = r.ciclo_origen_id;
      const pool = poolMap[r.ciclo_destino_id]?.docentes || [];
      r.docente_destino_id = pickTutor(pool, r.docente_origen_id);
      repiteCount += 1;
    });

    const payload = {
      origenId,
      destinoId,
      rows,
      generated_at: new Date().toISOString(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return payload;
  }

  function loadPropuesta() {
    ensureVersion();
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {
      /* ignore */
    }
    return null;
  }

  function savePropuesta(payload) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function contadores(rows) {
    const c = { total: rows.length, avanza: 0, repite: 0, egresa: 0, excluir: 0, sin_tutor: 0 };
    rows.forEach((r) => {
      if (ACCIONES.includes(r.accion)) c[r.accion] += 1;
      if ((r.accion === "avanza" || r.accion === "repite") && !r.docente_destino_id) c.sin_tutor += 1;
    });
    return c;
  }

  /**
   * Confirma: inserta matrículas destino · egresa estado · no toca origen.
   * @returns {{ procesados, egresados, matriculas, omitidos }}
   */
  function confirmar(payload) {
    const data = GestionPeriodoData.load();
    const poolMap = pools(data, payload.destinoId);
    let procesados = 0;
    let egresados = 0;
    let matriculas = 0;
    let omitidos = 0;

    payload.rows.forEach((r) => {
      if (!r.selected) return;
      if (r.accion === "excluir") return;
      procesados += 1;

      if (r.accion === "egresa") {
        egresados += 1;
        if (window.MatriculasData) MatriculasData.setEstado(r.estudiante_id, "egresado");
        return;
      }

      if (r.accion === "avanza" || r.accion === "repite") {
        if (!r.ciclo_destino_id || !r.docente_destino_id) {
          omitidos += 1;
          return;
        }
        const cpId = poolMap[r.ciclo_destino_id]?.cp_id;
        if (!cpId || !window.MatriculasData) {
          omitidos += 1;
          return;
        }
        const res = MatriculasData.insertMany(cpId, [
          {
            estudiante_id: r.estudiante_id,
            nombres: r.nombres,
            apellido_paterno: r.apellido_paterno,
            apellido_materno: r.apellido_materno,
            sexo: r.sexo,
            codigo_universitario: r.codigo_universitario,
            docente_id: r.docente_destino_id,
            fichas_llenadas: 0,
          },
        ]);
        matriculas += res.inserted;
        omitidos += res.skipped;
      }
    });

    sessionStorage.removeItem(STORAGE_KEY);
    return { procesados, egresados, matriculas, omitidos };
  }

  window.AvanzarData = {
    ACCIONES,
    ensureVersion,
    nombreCompleto,
    generarPropuesta,
    loadPropuesta,
    savePropuesta,
    contadores,
    confirmar,
    cicloSiguiente,
    pools,
  };
})();
