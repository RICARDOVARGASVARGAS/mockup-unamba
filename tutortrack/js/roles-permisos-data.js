/**
 * roles-permisos-data.js — RBAC mock (rol · permiso · rol_permiso).
 * Permisos = catálogo sembrado (solo lectura). Roles = CRUD con reglas de protegido.
 */
(function () {
  const STORAGE_KEY = "tutortrack-roles-permisos";
  const VERSION_KEY = "tutortrack-roles-permisos-version";
  const STORAGE_VERSION = "rbac-maestro-v1";

  /** Módulos visibles (orden UI). */
  const MODULOS = [
    "Docentes",
    "Estudiantes",
    "Receptores",
    "Usuarios",
    "Roles",
    "Fichas",
    "Alertas y derivación",
    "Catálogos",
    "Organización del período",
    "Auditoría",
  ];

  /**
   * Catálogo sembrado (~48). clave = lo que verifica el código (@can).
   * No se crean/editan/borran desde la UI.
   */
  const PERMISOS_SEED = [
    // Docentes (4)
    { id: "perm-01", clave: "docentes.ver", nombre: "Ver docentes", modulo: "Docentes", descripcion: "Listar y ver fichas de docentes" },
    { id: "perm-02", clave: "docentes.crear", nombre: "Crear docentes", modulo: "Docentes", descripcion: "Registrar perfil docente" },
    { id: "perm-03", clave: "docentes.editar", nombre: "Editar docentes", modulo: "Docentes", descripcion: "Modificar datos y roles de docente" },
    { id: "perm-04", clave: "docentes.eliminar", nombre: "Eliminar docentes", modulo: "Docentes", descripcion: "Soft delete / desactivar docente" },
    // Estudiantes (4)
    { id: "perm-05", clave: "estudiantes.ver", nombre: "Ver estudiantes", modulo: "Estudiantes", descripcion: "Listar y ver fichas" },
    { id: "perm-06", clave: "estudiantes.crear", nombre: "Crear estudiantes", modulo: "Estudiantes", descripcion: "Registrar perfil estudiante" },
    { id: "perm-07", clave: "estudiantes.editar", nombre: "Editar estudiantes", modulo: "Estudiantes", descripcion: "Modificar datos de estudiante" },
    { id: "perm-08", clave: "estudiantes.eliminar", nombre: "Eliminar estudiantes", modulo: "Estudiantes", descripcion: "Soft delete / desactivar" },
    // Receptores (4)
    { id: "perm-09", clave: "receptores.ver", nombre: "Ver receptores", modulo: "Receptores", descripcion: "Listar personal de entidades" },
    { id: "perm-10", clave: "receptores.crear", nombre: "Crear receptores", modulo: "Receptores", descripcion: "Alta de receptor" },
    { id: "perm-11", clave: "receptores.editar", nombre: "Editar receptores", modulo: "Receptores", descripcion: "Modificar receptor" },
    { id: "perm-12", clave: "receptores.eliminar", nombre: "Eliminar receptores", modulo: "Receptores", descripcion: "Soft delete de receptor" },
    // Usuarios (4)
    { id: "perm-13", clave: "usuarios.ver", nombre: "Ver usuarios", modulo: "Usuarios", descripcion: "Lista maestra de identidades" },
    { id: "perm-14", clave: "usuarios.crear", nombre: "Crear usuarios", modulo: "Usuarios", descripcion: "Alta de identidad" },
    { id: "perm-15", clave: "usuarios.editar", nombre: "Editar usuarios", modulo: "Usuarios", descripcion: "Editar identidad y roles" },
    { id: "perm-16", clave: "usuarios.eliminar", nombre: "Eliminar usuarios", modulo: "Usuarios", descripcion: "Eliminar o desactivar identidad" },
    // Roles (3)
    { id: "perm-17", clave: "roles.ver", nombre: "Ver roles", modulo: "Roles", descripcion: "Ver roles y sus permisos" },
    { id: "perm-18", clave: "roles.gestionar", nombre: "Gestionar roles", modulo: "Roles", descripcion: "Crear, editar y desactivar roles" },
    { id: "perm-19", clave: "roles.asignar_permisos", nombre: "Asignar permisos", modulo: "Roles", descripcion: "Sincronizar rol_permiso" },
    // Fichas (6)
    { id: "perm-20", clave: "fichas.ver", nombre: "Ver fichas", modulo: "Fichas", descripcion: "Ver plantillas y respuestas" },
    { id: "perm-21", clave: "fichas.crear", nombre: "Crear fichas", modulo: "Fichas", descripcion: "Crear plantillas de ficha" },
    { id: "perm-22", clave: "fichas.editar", nombre: "Editar fichas", modulo: "Fichas", descripcion: "Editar plantillas" },
    { id: "perm-23", clave: "fichas.asignar", nombre: "Asignar fichas", modulo: "Fichas", descripcion: "Asociar ficha a ciclo×período" },
    { id: "perm-24", clave: "fichas.llenar", nombre: "Llenar ficha", modulo: "Fichas", descripcion: "Completar ficha (estudiante)" },
    { id: "perm-25", clave: "fichas.revisar", nombre: "Revisar fichas", modulo: "Fichas", descripcion: "Ver respuestas de tutorados" },
    // Alertas y derivación (6)
    { id: "perm-26", clave: "alertas.ver", nombre: "Ver alertas", modulo: "Alertas y derivación", descripcion: "Ver alertas generadas por IA" },
    { id: "perm-27", clave: "alertas.gestionar", nombre: "Gestionar alertas", modulo: "Alertas y derivación", descripcion: "Confirmar o descartar alertas" },
    { id: "perm-28", clave: "derivaciones.crear", nombre: "Derivar caso", modulo: "Alertas y derivación", descripcion: "Crear derivación desde alerta" },
    { id: "perm-29", clave: "derivaciones.ver", nombre: "Ver derivaciones", modulo: "Alertas y derivación", descripcion: "Listar derivaciones" },
    { id: "perm-30", clave: "derivaciones.seguimiento", nombre: "Registrar seguimiento", modulo: "Alertas y derivación", descripcion: "Agregar estados de seguimiento" },
    { id: "perm-31", clave: "derivaciones.cerrar", nombre: "Cerrar derivación", modulo: "Alertas y derivación", descripcion: "Cerrar caso derivado" },
    // Catálogos (8)
    { id: "perm-32", clave: "catalogos.especialidades", nombre: "Especialidades", modulo: "Catálogos", descripcion: "CRUD especialidades" },
    { id: "perm-33", clave: "catalogos.tipos_documento", nombre: "Tipos de documento", modulo: "Catálogos", descripcion: "CRUD tipos de documento" },
    { id: "perm-34", clave: "catalogos.areas", nombre: "Áreas", modulo: "Catálogos", descripcion: "CRUD áreas" },
    { id: "perm-35", clave: "catalogos.tipos_ficha", nombre: "Tipos de ficha", modulo: "Catálogos", descripcion: "CRUD tipos de ficha" },
    { id: "perm-36", clave: "catalogos.grados", nombre: "Grados académicos", modulo: "Catálogos", descripcion: "CRUD grados" },
    { id: "perm-37", clave: "catalogos.ciclos", nombre: "Ciclos", modulo: "Catálogos", descripcion: "CRUD ciclos" },
    { id: "perm-38", clave: "catalogos.periodos", nombre: "Periodos académicos", modulo: "Catálogos", descripcion: "CRUD periodos" },
    { id: "perm-39", clave: "catalogos.entidades", nombre: "Entidades receptoras", modulo: "Catálogos", descripcion: "CRUD entidades" },
    // Organización del período (6)
    { id: "perm-40", clave: "periodo.configurar", nombre: "Configurar período", modulo: "Organización del período", descripcion: "Hub de ciclo×período" },
    { id: "perm-41", clave: "periodo.docentes", nombre: "Docentes del ciclo", modulo: "Organización del período", descripcion: "Asignar docentes-tutores" },
    { id: "perm-42", clave: "periodo.temario", nombre: "Temario", modulo: "Organización del período", descripcion: "Gestionar temario" },
    { id: "perm-43", clave: "periodo.matriculas", nombre: "Matrículas", modulo: "Organización del período", descripcion: "Matricular estudiantes" },
    { id: "perm-44", clave: "periodo.avanzar", nombre: "Avanzar estudiantes", modulo: "Organización del período", descripcion: "Avance de ciclo" },
    { id: "perm-45", clave: "periodo.clonar", nombre: "Clonar período", modulo: "Organización del período", descripcion: "Clonar configuración" },
    // Auditoría (3)
    { id: "perm-46", clave: "auditoria.ver", nombre: "Ver auditoría", modulo: "Auditoría", descripcion: "Historial de cambios" },
    { id: "perm-47", clave: "tutorados.ver", nombre: "Ver tutorados", modulo: "Fichas", descripcion: "Lista de tutorados del docente" },
    { id: "perm-48", clave: "temario.editar_propio", nombre: "Editar temario propio", modulo: "Organización del período", descripcion: "Docente edita temas de su ciclo" },
  ];

  const ALL_PERM_IDS = PERMISOS_SEED.map((p) => p.id);

  const idsByClave = (...claves) =>
    PERMISOS_SEED.filter((p) => claves.includes(p.clave)).map((p) => p.id);

  const ROLES_SEED = [
    {
      id: "rol-1",
      clave: "admin",
      nombre: "Administrador",
      descripcion: "Acceso total al sistema",
      protegido: true,
      activo: true,
      permisoIds: [...ALL_PERM_IDS],
    },
    {
      id: "rol-2",
      clave: "docente_tutor",
      nombre: "Docente-Tutor",
      descripcion: "Acompañamiento a tutorados y revisión de fichas",
      protegido: false,
      activo: true,
      permisoIds: idsByClave(
        "tutorados.ver",
        "fichas.revisar",
        "fichas.ver",
        "alertas.ver",
        "derivaciones.crear",
        "derivaciones.ver",
        "temario.editar_propio",
        "estudiantes.ver"
      ),
    },
    {
      id: "rol-3",
      clave: "estudiante",
      nombre: "Estudiante",
      descripcion: "Llenar fichas de tutoría asignadas",
      protegido: false,
      activo: true,
      permisoIds: idsByClave("fichas.llenar", "fichas.ver"),
    },
    {
      id: "rol-4",
      clave: "coordinador_tutoria",
      nombre: "Coordinador de tutoría",
      descripcion: "Coordina tutoría, periodos y fichas",
      protegido: false,
      activo: true,
      permisoIds: idsByClave(
        "docentes.ver",
        "docentes.editar",
        "estudiantes.ver",
        "estudiantes.editar",
        "usuarios.ver",
        "fichas.ver",
        "fichas.crear",
        "fichas.editar",
        "fichas.asignar",
        "alertas.ver",
        "alertas.gestionar",
        "derivaciones.ver",
        "periodo.configurar",
        "periodo.docentes",
        "periodo.temario",
        "periodo.matriculas",
        "periodo.avanzar",
        "periodo.clonar",
        "catalogos.ciclos",
        "catalogos.periodos",
        "auditoria.ver"
      ),
    },
    {
      id: "rol-5",
      clave: "receptor",
      nombre: "Receptor",
      descripcion: "Atiende derivaciones en su entidad",
      protegido: false,
      activo: true,
      permisoIds: idsByClave(
        "alertas.ver",
        "derivaciones.ver",
        "derivaciones.seguimiento",
        "derivaciones.cerrar"
      ),
    },
    {
      id: "rol-6",
      clave: "consulta_reportes",
      nombre: "Consulta de reportes",
      descripcion: "Rol de solo lectura (ejemplo inactivo)",
      protegido: false,
      activo: false,
      permisoIds: idsByClave("docentes.ver", "estudiantes.ver", "fichas.ver", "alertas.ver", "auditoria.ver"),
    },
  ];

  let cached = null;

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function ensureVersion() {
    if (sessionStorage.getItem(VERSION_KEY) !== STORAGE_VERSION) {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
  }

  function defaultState() {
    return {
      roles: clone(ROLES_SEED),
      // permisos son inmutables en UI; se guardan por si hace falta reset
      permisos: clone(PERMISOS_SEED),
    };
  }

  function loadState() {
    ensureVersion();
    if (cached) return cached;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.roles)) {
          cached = {
            roles: parsed.roles,
            permisos: clone(PERMISOS_SEED),
          };
          return cached;
        }
      }
    } catch (_) {
      /* ignore */
    }
    cached = defaultState();
    saveState(cached);
    return cached;
  }

  function saveState(state) {
    cached = state;
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ roles: state.roles })
    );
  }

  function ready() {
    return Promise.resolve(loadState());
  }

  function permisos() {
    return clone(PERMISOS_SEED);
  }

  function roles() {
    return clone(loadState().roles);
  }

  function findRol(id) {
    return loadState().roles.find((r) => r.id === id) || null;
  }

  function permisoById(id) {
    return PERMISOS_SEED.find((p) => p.id === id) || null;
  }

  function permisosPorModulo() {
    const map = {};
    MODULOS.forEach((m) => {
      map[m] = [];
    });
    PERMISOS_SEED.forEach((p) => {
      if (!map[p.modulo]) map[p.modulo] = [];
      map[p.modulo].push(clone(p));
    });
    return map;
  }

  function upsertRol(row) {
    const state = loadState();
    const normalized = {
      ...row,
      protegido: Boolean(row.protegido),
      activo: row.activo !== false,
      permisoIds: [...(row.permisoIds || [])],
      descripcion: row.descripcion || "",
      updated_at: new Date().toISOString(),
    };
    const idx = state.roles.findIndex((r) => r.id === normalized.id);
    if (idx === -1) {
      normalized.created_at = new Date().toISOString();
      state.roles.push(normalized);
    } else {
      if (state.roles[idx].protegido) {
        throw new Error("protegido");
      }
      normalized.protegido = state.roles[idx].protegido;
      normalized.created_at = state.roles[idx].created_at;
      state.roles[idx] = normalized;
    }
    saveState(state);
    return clone(normalized);
  }

  function setRolPermisos(rolId, permisoIds) {
    const state = loadState();
    const idx = state.roles.findIndex((r) => r.id === rolId);
    if (idx === -1) return null;
    if (state.roles[idx].protegido) throw new Error("protegido");
    state.roles[idx] = {
      ...state.roles[idx],
      permisoIds: [...permisoIds],
      updated_at: new Date().toISOString(),
    };
    saveState(state);
    return clone(state.roles[idx]);
  }

  function setActivo(id, activo) {
    const state = loadState();
    const idx = state.roles.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    if (state.roles[idx].protegido) throw new Error("protegido");
    state.roles[idx] = {
      ...state.roles[idx],
      activo: Boolean(activo),
      updated_at: new Date().toISOString(),
    };
    saveState(state);
    return clone(state.roles[idx]);
  }

  function removeRol(id) {
    const state = loadState();
    const row = state.roles.find((r) => r.id === id);
    if (!row) return false;
    if (row.protegido) throw new Error("protegido");
    state.roles = state.roles.filter((r) => r.id !== id);
    saveState(state);
    return true;
  }

  function claveExiste(clave, exceptId) {
    return loadState().roles.some(
      (r) => r.clave === clave && r.id !== exceptId
    );
  }

  function nombreExiste(nombre, exceptId) {
    return loadState().roles.some(
      (r) =>
        String(r.nombre).toLowerCase() === String(nombre).toLowerCase() &&
        r.id !== exceptId
    );
  }

  /** Conteo de usuarios con el rol (vía UsuariosData si está cargado). */
  function conteoUsuarios(rolId) {
    if (window.UsuariosData && typeof UsuariosData.load === "function") {
      return UsuariosData.load().filter((u) =>
        (u.roles || u.rolIds || []).includes(rolId)
      ).length;
    }
    // Fallback alineado al seed de usuarios
    const FALLBACK = {
      "rol-1": 2,
      "rol-2": 3,
      "rol-3": 3,
      "rol-4": 3,
      "rol-5": 3,
      "rol-6": 0,
    };
    return FALLBACK[rolId] ?? 0;
  }

  function resumenMeta() {
    const list = loadState().roles;
    return {
      roles: list.length,
      activos: list.filter((r) => r.activo !== false).length,
      permisos: PERMISOS_SEED.length,
    };
  }

  function resetFromSeed() {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    cached = null;
    return ready();
  }

  window.RolesPermisosData = {
    MODULOS,
    PERMISOS_SEED,
    ROLES_SEED,
    ready,
    resetFromSeed,
    permisos,
    roles,
    findRol,
    permisoById,
    permisosPorModulo,
    upsertRol,
    setRolPermisos,
    setActivo,
    removeRol,
    claveExiste,
    nombreExiste,
    conteoUsuarios,
    resumenMeta,
  };
})();
