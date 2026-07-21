/**
 * fichas-ciclo-data.js — fichas del docente por ciclo+período (`ficha_ciclo_periodo`)
 * + llenados (`ficha_llenada` / `respuesta` / `respuesta_opcion`).
 * Seed demo: Quinto ciclo · 2026-I · Dr. Quispe · 4 tutorados con ritmos distintos.
 */
(function () {
  const STORAGE_KEY = "tutortrack-fichas-ciclo";
  const VERSION_KEY = "tutortrack-fichas-ciclo-version";
  const STORAGE_VERSION = "seed-m3-ciclo-v1";

  const DOCENTE_DEMO = {
    id: "doc-1",
    nombre: "Carlos Quispe Mamani",
    nombre_corto: "Dr. Quispe",
  };

  const PERIODO_DEMO = { id: "per-2026-1", nombre: "2026-I", vigente: true };
  const CICLO_DEMO = { id: "ciclo-5", nombre: "Quinto ciclo", abrev: "5°" };
  const CP_DEMO = { id: "cp-5-2026-1", periodo_id: "per-2026-1", ciclo_id: "ciclo-5" };

  const ESTUDIANTES = [
    {
      id: "est-1",
      nombres: "Ana",
      apellido_paterno: "Quispe",
      apellido_materno: "Mamani",
      codigo: "2021-1001",
    },
    {
      id: "est-2",
      nombres: "Carlos",
      apellido_paterno: "Huanca",
      apellido_materno: "Flores",
      codigo: "2021-1002",
    },
    {
      id: "est-3",
      nombres: "Diana",
      apellido_paterno: "Torres",
      apellido_materno: "Rojas",
      codigo: "2021-1003",
    },
    {
      id: "est-4",
      nombres: "Luis",
      apellido_paterno: "Vega",
      apellido_materno: "Chávez",
      codigo: "2021-1004",
    },
  ];

  function clonePreguntasFromPlantilla(plantilla, fcpId) {
    return (plantilla.preguntas || []).map((p, i) => {
      const np = JSON.parse(JSON.stringify(window.FichasData ? FichasData.normalizePregunta(p) : p));
      np.id = `${fcpId}-p${i + 1}`;
      np.ficha_id = null;
      np.ficha_ciclo_periodo_id = fcpId;
      np.orden = i + 1;
      np.opciones = (np.opciones || []).map((o, j) => ({
        ...o,
        id: `${fcpId}-p${i + 1}-o${j + 1}`,
      }));
      return np;
    });
  }

  function buildSeedFcps() {
    if (!window.FichasData) return [];
    const plantillas = {
      1: FichasData.findById("ficha-1"),
      2: FichasData.findById("ficha-2"),
      3: FichasData.findById("ficha-3"),
      4: FichasData.findById("ficha-4"),
      5: FichasData.findById("ficha-5"),
      6: FichasData.findById("ficha-6"),
    };

    const defs = [
      { n: 1, origen: "ficha-1", nombre: "Diagnóstica inicial", habilitada: true, tipo: "tf-1" },
      { n: 2, origen: "ficha-2", nombre: "Seguimiento mensual", habilitada: true, tipo: "tf-2" },
      { n: 3, origen: "ficha-3", nombre: "Autoevaluación de hábitos", habilitada: true, tipo: "tf-2" },
      { n: 4, origen: "ficha-4", nombre: "Taller de hábitos", habilitada: false, tipo: "tf-3" },
      { n: 5, origen: "ficha-5", nombre: "Check-in emocional", habilitada: true, tipo: "tf-2" },
      { n: 6, origen: null, nombre: "Encuesta de cierre", habilitada: false, tipo: "tf-4", desde_cero: true },
    ];

    return defs.map((d) => {
      const id = `fcp-${d.n}`;
      const src = d.origen ? plantillas[d.n] : null;
      const preguntas = src
        ? clonePreguntasFromPlantilla(src, id)
        : [
            {
              id: `${id}-p1`,
              ficha_id: null,
              ficha_ciclo_periodo_id: id,
              orden: 1,
              area_id: "area-5",
              tipo_pregunta: "escala",
              enunciado: "Satisfacción general con la tutoría",
              opciones: [],
              escala_min: 1,
              escala_max: 5,
              etiqueta_min: "Muy baja",
              etiqueta_max: "Muy alta",
            },
          ];
      return {
        id,
        ciclo_periodo_id: CP_DEMO.id,
        periodo_id: PERIODO_DEMO.id,
        ciclo_id: CICLO_DEMO.id,
        docente_id: DOCENTE_DEMO.id,
        ficha_origen_id: d.origen,
        tipo_ficha_id: d.tipo,
        nombre: d.nombre,
        descripcion: src?.descripcion || "Creada de cero por el docente.",
        habilitada: d.habilitada,
        created_at: `2026-03-0${d.n}T10:00:00.000Z`,
        preguntas,
      };
    });
  }

  /**
   * Matriz demo de llenados (estudiante × ficha):
   * Ana: F1 revisada, F2 enviada, F3 enviada, F4 🔒, F5 borrador, F6 🔒 → al día
   * Carlos: F1 revisada, F2 enviada, F3 borrador, resto sin/bloqueado → mitad
   * Diana: F1 enviada, F2 borrador, resto sin → temprana
   * Luis: todo sin abrir → sin empezar
   */
  function buildSeedLlenados() {
    const rows = [];
    const add = (estId, fcpN, estado, revisada, fecha, respuestasFn) => {
      const fcpId = `fcp-${fcpN}`;
      const flId = `fl-${estId}-${fcpN}`;
      const fcp = (_data?.fcps || []).find((f) => f.id === fcpId);
      const preguntas = fcp?.preguntas || [];
      rows.push({
        id: flId,
        estudiante_id: estId,
        ficha_ciclo_periodo_id: fcpId,
        estado,
        revisada: !!revisada,
        fecha_enviado: fecha || null,
        respuestas: typeof respuestasFn === "function" ? respuestasFn(flId, preguntas) : [],
      });
    };

    const fullAnswers = (flId, preguntas) =>
      preguntas.map((p, i) => respuestaDemo(flId, p, i));

    const partialAnswers = (flId, preguntas, count) =>
      preguntas.slice(0, count).map((p, i) => respuestaDemo(flId, p, i));

    /* Ana — al día */
    add("est-1", 1, "enviada", true, "2026-03-10T15:00:00.000Z", fullAnswers);
    add("est-1", 2, "enviada", false, "2026-03-18T11:00:00.000Z", fullAnswers);
    add("est-1", 3, "enviada", false, "2026-03-22T09:30:00.000Z", fullAnswers);
    add("est-1", 5, "borrador", false, null, (flId, ps) => partialAnswers(flId, ps, 1));

    /* Carlos — mitad */
    add("est-2", 1, "enviada", true, "2026-03-11T14:00:00.000Z", fullAnswers);
    add("est-2", 2, "enviada", false, "2026-03-19T16:00:00.000Z", fullAnswers);
    add("est-2", 3, "borrador", false, null, (flId, ps) => partialAnswers(flId, ps, 3));

    /* Diana — temprana */
    add("est-3", 1, "enviada", false, "2026-03-12T10:00:00.000Z", fullAnswers);
    add("est-3", 2, "borrador", false, null, (flId, ps) => partialAnswers(flId, ps, 5));

    /* Luis — sin empezar (sin filas) */
    return rows;
  }

  function respuestaDemo(flId, pregunta, idx) {
    const tipo = pregunta.tipo_pregunta || pregunta.tipo;
    const base = {
      id: `${flId}-r${pregunta.orden || idx + 1}`,
      ficha_llenada_id: flId,
      pregunta_id: pregunta.id,
      respuesta_texto: null,
      respuesta_valor: null,
      observaciones_tutor: "",
      opciones_ids: [],
    };
    if (tipo === "texto_abierto") {
      base.respuesta_texto = "Me siento relativamente bien, aunque con algo de carga académica.";
    } else if (tipo === "escala") {
      base.respuesta_valor = 3;
    } else if (tipo === "si_no" || tipo === "alternativa_unica") {
      const ops = pregunta.opciones || [];
      const pick = ops[Math.min(1, ops.length - 1)] || ops[0];
      if (pick) base.opciones_ids = [pick.id];
    } else if (tipo === "respuesta_multiple") {
      const ops = pregunta.opciones || [];
      base.opciones_ids = ops.slice(0, Math.min(2, ops.length)).map((o) => o.id);
    }
    /* Ana F1: observación en primera pregunta */
    if (flId === "fl-est-1-1" && pregunta.orden === 1) {
      base.observaciones_tutor = "Conversar en la próxima sesión sobre su adaptación.";
    }
    return base;
  }

  let _data = null;
  let readyPromise = null;

  function ensureVersion() {
    if (sessionStorage.getItem(VERSION_KEY) !== STORAGE_VERSION) {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
  }

  function load() {
    ensureVersion();
    if (_data) return _data;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        _data = JSON.parse(raw);
        return _data;
      }
    } catch (_) {
      /* ignore */
    }
    const fcps = buildSeedFcps();
    _data = { fcps, llenados: [] };
    _data.llenados = buildSeedLlenados();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(_data));
    return _data;
  }

  function save() {
    if (!_data) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(_data));
  }

  function ready() {
    if (readyPromise) return readyPromise;
    readyPromise = Promise.resolve().then(() => {
      if (window.FichasData) return FichasData.ready().then(() => load());
      return load();
    });
    return readyPromise;
  }

  function countClonesFrom(fichaId) {
    return load().fcps.filter((f) => f.ficha_origen_id === fichaId).length;
  }

  function listFcps({ docenteId, cicloPeriodoId, cicloId, periodoId } = {}) {
    return load().fcps.filter((f) => {
      if (docenteId && f.docente_id !== docenteId) return false;
      if (cicloPeriodoId && f.ciclo_periodo_id !== cicloPeriodoId) return false;
      if (cicloId && f.ciclo_id !== cicloId) return false;
      if (periodoId && f.periodo_id !== periodoId) return false;
      return true;
    });
  }

  function findFcp(id) {
    return load().fcps.find((f) => f.id === id) || null;
  }

  function upsertFcp(fcp) {
    const data = load();
    const idx = data.fcps.findIndex((f) => f.id === fcp.id);
    if (idx === -1) data.fcps.push(fcp);
    else data.fcps[idx] = fcp;
    save();
    return fcp;
  }

  function setHabilitada(fcpId, habilitada) {
    const f = findFcp(fcpId);
    if (!f) return null;
    f.habilitada = !!habilitada;
    upsertFcp(f);
    return f;
  }

  function countLlenados(fcpId) {
    return load().llenados.filter((l) => l.ficha_ciclo_periodo_id === fcpId).length;
  }

  function llenadoStats(fcpId) {
    const rows = load().llenados.filter((l) => l.ficha_ciclo_periodo_id === fcpId);
    const estudiantes = ESTUDIANTES.length;
    let enviadas = 0;
    let borradores = 0;
    rows.forEach((r) => {
      if (r.estado === "enviada") enviadas += 1;
      else if (r.estado === "borrador") borradores += 1;
    });
    const conLlenado = new Set(rows.map((r) => r.estudiante_id));
    const sin = estudiantes - conLlenado.size;
    return { enviadas, borradores, sin, total: estudiantes };
  }

  function removeFcp(fcpId) {
    if (countLlenados(fcpId) > 0) return false;
    const data = load();
    data.fcps = data.fcps.filter((f) => f.id !== fcpId);
    save();
    return true;
  }

  function clonarDePlantilla({ fichaOrigenId, cicloPeriodoId, cicloId, periodoId, docenteId }) {
    const src = FichasData.findById(fichaOrigenId);
    if (!src || src.activo === false) return null;
    const id = `fcp-${Date.now()}`;
    const fcp = {
      id,
      ciclo_periodo_id: cicloPeriodoId || CP_DEMO.id,
      periodo_id: periodoId || PERIODO_DEMO.id,
      ciclo_id: cicloId || CICLO_DEMO.id,
      docente_id: docenteId || DOCENTE_DEMO.id,
      ficha_origen_id: fichaOrigenId,
      tipo_ficha_id: src.tipo_ficha_id,
      nombre: src.nombre,
      descripcion: src.descripcion,
      habilitada: false,
      created_at: new Date().toISOString(),
      preguntas: clonePreguntasFromPlantilla(src, id),
    };
    upsertFcp(fcp);
    return fcp;
  }

  function crearDesdeCero({ tipo_ficha_id, nombre, descripcion, cicloPeriodoId, cicloId, periodoId, docenteId }) {
    const id = `fcp-${Date.now()}`;
    const fcp = {
      id,
      ciclo_periodo_id: cicloPeriodoId || CP_DEMO.id,
      periodo_id: periodoId || PERIODO_DEMO.id,
      ciclo_id: cicloId || CICLO_DEMO.id,
      docente_id: docenteId || DOCENTE_DEMO.id,
      ficha_origen_id: null,
      tipo_ficha_id,
      nombre,
      descripcion: descripcion || "",
      habilitada: false,
      created_at: new Date().toISOString(),
      preguntas: [],
    };
    upsertFcp(fcp);
    return fcp;
  }

  function findLlenado(estudianteId, fcpId) {
    return (
      load().llenados.find(
        (l) => l.estudiante_id === estudianteId && l.ficha_ciclo_periodo_id === fcpId
      ) || null
    );
  }

  function findLlenadoById(id) {
    return load().llenados.find((l) => l.id === id) || null;
  }

  function upsertLlenado(fl) {
    const data = load();
    const idx = data.llenados.findIndex((l) => l.id === fl.id);
    if (idx === -1) data.llenados.push(fl);
    else data.llenados[idx] = fl;
    save();
    return fl;
  }

  function estadoCelda(estudianteId, fcp) {
    if (!fcp.habilitada) return "no_habilitada";
    const fl = findLlenado(estudianteId, fcp.id);
    if (!fl) return "sin_abrir";
    if (fl.estado === "enviada" && fl.revisada) return "revisada";
    if (fl.estado === "enviada") return "enviada";
    if (fl.estado === "borrador") return "borrador";
    return "sin_abrir";
  }

  function nombreEstudiante(est) {
    return `${est.nombres} ${est.apellido_paterno} ${est.apellido_materno}`.trim();
  }

  function porRevisarCount(docenteId = DOCENTE_DEMO.id) {
    const fcps = listFcps({ docenteId });
    const fcpIds = new Set(fcps.map((f) => f.id));
    return load().llenados.filter(
      (l) => fcpIds.has(l.ficha_ciclo_periodo_id) && l.estado === "enviada" && !l.revisada
    ).length;
  }

  /**
   * Lista para el estudiante: fichas de su tutor en orden de creación,
   * con bloqueos de habilitación y secuencia.
   */
  function misFichasEstudiante(estudianteId = "est-1") {
    const fcps = listFcps({ docenteId: DOCENTE_DEMO.id, cicloId: CICLO_DEMO.id }).slice().sort((a, b) =>
      String(a.created_at).localeCompare(String(b.created_at))
    );

    let prevEnviadaOk = true;
    return fcps.map((fcp) => {
      const fl = findLlenado(estudianteId, fcp.id);
      let estado_llenado = "sin_abrir";
      let progreso = { respondidas: 0, total: (fcp.preguntas || []).length };
      if (fl) {
        estado_llenado = fl.estado;
        progreso.respondidas = (fl.respuestas || []).length;
      }

      let bloqueo = null;
      if (!fcp.habilitada) {
        bloqueo = "no_habilitada";
      } else if (!prevEnviadaOk && estado_llenado !== "enviada") {
        bloqueo = "secuencia";
      }

      const activa =
        fcp.habilitada && !bloqueo && estado_llenado !== "enviada" && prevEnviadaOk;

      if (fcp.habilitada) {
        prevEnviadaOk = estado_llenado === "enviada";
      }

      return {
        fcp,
        ficha_llenada: fl,
        estado_llenado,
        progreso,
        bloqueo,
        activa,
      };
    });
  }

  window.FichasCicloData = {
    DOCENTE_DEMO,
    PERIODO_DEMO,
    CICLO_DEMO,
    CP_DEMO,
    ESTUDIANTES,
    load,
    save,
    ready,
    countClonesFrom,
    listFcps,
    findFcp,
    upsertFcp,
    setHabilitada,
    countLlenados,
    llenadoStats,
    removeFcp,
    clonarDePlantilla,
    crearDesdeCero,
    findLlenado,
    findLlenadoById,
    upsertLlenado,
    estadoCelda,
    nombreEstudiante,
    porRevisarCount,
    misFichasEstudiante,
  };
})();
