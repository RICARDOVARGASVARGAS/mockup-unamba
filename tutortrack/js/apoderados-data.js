/**
 * apoderados-data.js — store mockup Apoderado + vínculo estudiante↔apoderado.
 * Modelo: `apoderado` (único por documento → se reutiliza) + `estudiante_apoderado`
 * (n:n con `parentesco` + `es_principal`). Hermanos comparten el mismo apoderado.
 * Ver docs/BD-BACKEND.md § apoderado / estudiante_apoderado.
 */
(function () {
  const AP_KEY = "tutortrack-apoderados";
  const VIN_KEY = "tutortrack-estudiante-apoderado";
  const VERSION_KEY = "tutortrack-apoderados-version";
  const VERSION = "apo-v1";

  const PARENTESCOS = [
    { id: "padre", nombre: "Padre" },
    { id: "madre", nombre: "Madre" },
    { id: "abuelo", nombre: "Abuelo(a)" },
    { id: "tutor_legal", nombre: "Tutor legal" },
    { id: "otro", nombre: "Otro" },
  ];

  /** Apoderados de ejemplo. `ap-01` es padre de dos hermanos (est-01 y est-05). */
  const SEED_APODERADOS = [
    { id: "ap-01", tipo_documento_id: "td-1", documento: "41111111", nombres: "Juan", apellido_paterno: "Pérez", apellido_materno: "Quispe", celular_principal: "987654321", celular_secundario: "", email: "", ocupacion: "Agricultor", direccion: "Av. Los Andes 123, Abancay" },
    { id: "ap-02", tipo_documento_id: "td-1", documento: "42222222", nombres: "Rosa", apellido_paterno: "Mamani", apellido_materno: "Torres", celular_principal: "912345678", celular_secundario: "", email: "rosa.mamani@gmail.com", ocupacion: "Comerciante", direccion: "" },
    { id: "ap-03", tipo_documento_id: "td-1", documento: "43333333", nombres: "Pedro", apellido_paterno: "Huanca", apellido_materno: "Flores", celular_principal: "998877665", celular_secundario: "", email: "", ocupacion: "", direccion: "" },
  ];

  /** Vínculos estudiante↔apoderado. est-01 y est-05 comparten ap-01 (hermanos). */
  const SEED_VINCULOS = [
    { id: "ea-01", estudiante_id: "est-01", apoderado_id: "ap-01", parentesco: "padre", es_principal: true },
    { id: "ea-02", estudiante_id: "est-01", apoderado_id: "ap-02", parentesco: "madre", es_principal: false },
    { id: "ea-03", estudiante_id: "est-05", apoderado_id: "ap-01", parentesco: "padre", es_principal: true },
    { id: "ea-04", estudiante_id: "est-02", apoderado_id: "ap-03", parentesco: "padre", es_principal: true },
  ];

  function ensureVersion() {
    if (sessionStorage.getItem(VERSION_KEY) !== VERSION) {
      sessionStorage.removeItem(AP_KEY);
      sessionStorage.removeItem(VIN_KEY);
      sessionStorage.setItem(VERSION_KEY, VERSION);
    }
  }

  function readStore(key, seed) {
    ensureVersion();
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {
      /* ignore */
    }
    const clone = seed.map((r) => ({ ...r }));
    sessionStorage.setItem(key, JSON.stringify(clone));
    return clone;
  }

  const loadApoderados = () => readStore(AP_KEY, SEED_APODERADOS);
  const loadVinculos = () => readStore(VIN_KEY, SEED_VINCULOS);
  const saveApoderados = (rows) => sessionStorage.setItem(AP_KEY, JSON.stringify(rows));
  const saveVinculos = (rows) => sessionStorage.setItem(VIN_KEY, JSON.stringify(rows));

  const uid = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  function nombreCompleto(ap) {
    return [ap.nombres, ap.apellido_paterno, ap.apellido_materno].filter(Boolean).join(" ").trim();
  }

  function parentescoLabel(id) {
    return PARENTESCOS.find((p) => p.id === id)?.nombre || id || "—";
  }

  /** Busca un apoderado por tipo+documento (para reutilizar en hermanos). */
  function findByDocumento(tipoId, documento) {
    const doc = String(documento || "").trim();
    if (!doc) return null;
    return (
      loadApoderados().find(
        (a) => a.tipo_documento_id === tipoId && String(a.documento).trim() === doc
      ) || null
    );
  }

  /** Apoderados de un estudiante, con datos del vínculo (parentesco, principal). */
  function listByEstudiante(estudianteId) {
    const aps = loadApoderados();
    return loadVinculos()
      .filter((v) => v.estudiante_id === estudianteId)
      .map((v) => {
        const ap = aps.find((a) => a.id === v.apoderado_id);
        return ap
          ? { ...ap, vinculo_id: v.id, parentesco: v.parentesco, es_principal: !!v.es_principal }
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => (b.es_principal ? 1 : 0) - (a.es_principal ? 1 : 0));
  }

  /** Estudiantes (ids) que comparten algún apoderado con este estudiante (hermanos). */
  function hermanos(estudianteId) {
    const vinculos = loadVinculos();
    const misApoderados = new Set(
      vinculos.filter((v) => v.estudiante_id === estudianteId).map((v) => v.apoderado_id)
    );
    const ids = new Set();
    vinculos.forEach((v) => {
      if (v.estudiante_id !== estudianteId && misApoderados.has(v.apoderado_id)) {
        ids.add(v.estudiante_id);
      }
    });
    return [...ids];
  }

  /** Estudiantes vinculados a un apoderado. */
  function estudiantesDeApoderado(apoderadoId) {
    return loadVinculos()
      .filter((v) => v.apoderado_id === apoderadoId)
      .map((v) => v.estudiante_id);
  }

  /**
   * Vincula un apoderado a un estudiante. Si `apoderado.documento` ya existe,
   * reutiliza esa fila (no duplica). Garantiza un solo `es_principal` por estudiante.
   */
  function link(estudianteId, apoderado, parentesco, esPrincipal) {
    const aps = loadApoderados();
    let target = findByDocumento(apoderado.tipo_documento_id, apoderado.documento);

    if (!target) {
      target = { id: uid("ap"), ...apoderado };
      aps.unshift(target);
      saveApoderados(aps);
    }

    const vinculos = loadVinculos();
    const exists = vinculos.find(
      (v) => v.estudiante_id === estudianteId && v.apoderado_id === target.id
    );
    if (exists) return { apoderado: target, vinculo: exists, reused: true };

    if (esPrincipal) {
      vinculos.forEach((v) => {
        if (v.estudiante_id === estudianteId) v.es_principal = false;
      });
    }

    const vinculo = {
      id: uid("ea"),
      estudiante_id: estudianteId,
      apoderado_id: target.id,
      parentesco: parentesco || "otro",
      es_principal: !!esPrincipal,
    };
    vinculos.unshift(vinculo);
    saveVinculos(vinculos);
    return { apoderado: target, vinculo, reused: !!target.id };
  }

  /** Actualiza datos del apoderado y/o del vínculo (parentesco, principal). */
  function updateVinculo(estudianteId, apoderadoId, changes) {
    const aps = loadApoderados();
    const apIdx = aps.findIndex((a) => a.id === apoderadoId);
    if (apIdx !== -1 && changes.apoderado) {
      aps[apIdx] = { ...aps[apIdx], ...changes.apoderado };
      saveApoderados(aps);
    }
    const vinculos = loadVinculos();
    if (changes.es_principal) {
      vinculos.forEach((v) => {
        if (v.estudiante_id === estudianteId) v.es_principal = false;
      });
    }
    const v = vinculos.find(
      (x) => x.estudiante_id === estudianteId && x.apoderado_id === apoderadoId
    );
    if (v) {
      if (changes.parentesco != null) v.parentesco = changes.parentesco;
      if (changes.es_principal != null) v.es_principal = !!changes.es_principal;
      saveVinculos(vinculos);
    }
    return v || null;
  }

  /** Quita el vínculo. El apoderado NO se borra si tiene otros hijos vinculados. */
  function unlink(estudianteId, apoderadoId) {
    let vinculos = loadVinculos().filter(
      (v) => !(v.estudiante_id === estudianteId && v.apoderado_id === apoderadoId)
    );
    saveVinculos(vinculos);
    const stillUsed = vinculos.some((v) => v.apoderado_id === apoderadoId);
    if (!stillUsed) {
      saveApoderados(loadApoderados().filter((a) => a.id !== apoderadoId));
    }
    return { apoderadoRemoved: !stillUsed };
  }

  function ready() {
    ensureVersion();
    return Promise.resolve().then(() => {
      loadApoderados();
      loadVinculos();
      return true;
    });
  }

  window.ApoderadosData = {
    PARENTESCOS,
    ready,
    loadApoderados,
    loadVinculos,
    nombreCompleto,
    parentescoLabel,
    findByDocumento,
    listByEstudiante,
    hermanos,
    estudiantesDeApoderado,
    link,
    updateVinculo,
    unlink,
  };
})();
