# Mockup — Pantallas a construir (Identidad y acceso)

Guía para **Cursor**. Son pantallas de la **maqueta** (HTML + Tailwind + JS,
**sin backend**). Construir **una pantalla a la vez, en el orden de abajo**;
al terminar cada una, mostrarla antes de seguir con la siguiente.

Los campos y su significado salen del modelo ya cerrado en
[`BD-BACKEND.md`](./BD-BACKEND.md) (Módulo 1). Aquí solo importa lo **visible**.

## Reglas obligatorias (no romper)

- **Copiar el patrón existente** que se indica en cada pantalla — no reinventar
  estructura (ver `../CLAUDE.md`).
- Componentes nativos ya hechos: `<app-sidebar>`, `<app-topbar>`,
  `<app-toast>`, `<app-modal-confirm>`. Rutas relativas con
  `window.getBasePath()` (`js/site-paths.js`), nunca rutas absolutas.
- **Colores solo vía variables de `css/tokens.css`** — nunca hardcodeados.
  Tema **claro único**. Responsive.
- Los estilos de formulario y tabla **ya existen** en `css/base.css`
  (`.catalog-*`, `.form-label`, `.form-input`, `.form-hint`, `.btn-primary`,
  `.btn-secondary`, `.btn-ghost`, `.badge-*`, `.status-toggle`). **Reusarlos.**
- Motor de listados: `js/catalog-table.js` (buscar + filtros + paginación +
  acciones), igual que los catálogos ya hechos.
- **Usuario logueado del admin** en el `<app-topbar>`:
  `user-name="Ricardo Vargas Vargas" user-role="Administrador"
  user-initials="RV" user-avatar="assets/img/admin/ricardo-vargas.jpg"`.
- **Datos de ejemplo:** placeholders claramente ficticios; **no** inventar
  personas reales. Fotos solo desde `assets/img/`.

## Orden de construcción
1. ~~Grados académicos (catálogo)~~ — **hecho**
2. ~~Especialidades (catálogo)~~ — **hecho**
3. Docentes (listado + formulario)
4. Estudiantes (listado + formulario)
5. Usuarios + ajustes de Roles y permisos

---

## Pantalla 1 · Grados académicos (catálogo) ✅ HECHO

- **Copiar de:** `pages/admin/ciclos.html` + `js/ciclos.js` (catálogo con
  nombre + orden + activo — el mismo caso).
- **Archivos nuevos:** `pages/admin/grados-academicos.html`,
  `js/grados-academicos.js`.
- **Columnas de la tabla:** N° · Nombre · Estado (badge visual) · Acciones.
- **Formulario (modal):** Nombre (texto), N° de orden (número), Estado (toggle activo — único lugar para editarlo).
- **Sidebar:** agregar ítem **"Grados académicos"** al grupo *Catálogos* de
  Administrador en `components/app-sidebar.js`.
- **Datos placeholder:** Bachiller, Licenciado, Magíster, Doctor.

## Pantalla 2 · Especialidades (catálogo) ✅ HECHO

- **Copiar de:** `pages/admin/areas.html` + `js/areas.js` (catálogo simple
  nombre + activo).
- **Archivos nuevos:** `pages/admin/especialidades.html`, `js/especialidades.js`.
- **Columnas:** N° · Nombre · Estado (badge visual) · Acciones.
- **Formulario (modal):** Nombre (texto), N° de orden (número), Estado (toggle activo — único lugar para editarlo).
- **Sidebar:** agregar ítem **"Especialidades"** al grupo *Catálogos*.
- **Datos placeholder:** Marketing, Finanzas, Gestión Pública, Recursos
  Humanos, Contabilidad.

## Pantalla 3 · Docentes (listado + formulario)

Entidad rica → **lista** + **página de formulario aparte** (demasiados campos
para un modal). El ítem "Docentes" ya existe en el sidebar (grupo *Gestión por
periodo*) apuntando a `docentes.html`.

- **Archivos nuevos:**
  - `pages/admin/docentes.html` — lista (usar `js/catalog-table.js`). El botón
    "Nuevo docente" y la acción Editar llevan a `docentes-form.html`.
  - `pages/admin/docentes-form.html` — formulario crear/editar (shell
    `app-sidebar` + `app-topbar`, estilos `.form-*` de `base.css`).
  - `js/docentes.js` (lista).
- **Columnas de la lista:** Foto + Nombre completo · Documento · Correo ·
  Grado · Especialidad · Estado · Acciones.
- **Formulario, agrupado:**
  - *Datos personales:* Foto (subida placeholder), Documento, Nombres,
    Apellido paterno, Apellido materno, Sexo, Fecha de nacimiento.
  - *Contacto:* Correo de acceso, Correo personal, Celular principal,
    Celular secundario.
  - *Perfil académico:* Grado académico (select del catálogo), Especialidad
    (select del catálogo), ORCID, URL del CV, Biografía (textarea).
  - *Acceso:* Estado (toggle activo). *(El rol Docente-Tutor se asume; en el
    mockup se puede mostrar como etiqueta fija.)*
- **Datos placeholder:** usar las fotos de `assets/img/docentes/` y nombres
  ficticios.

## Pantalla 4 · Estudiantes (listado + formulario)

Mismo patrón que Docentes. El ítem "Estudiantes" ya existe en el sidebar.

- **Archivos nuevos:** `pages/admin/estudiantes.html`,
  `pages/admin/estudiantes-form.html`, `js/estudiantes.js`.
- **Columnas de la lista:** Foto + Nombre completo · Código universitario ·
  Documento · Correo · Estado · Acciones.
- **Formulario, agrupado:**
  - *Datos personales:* Foto, Documento, Nombres, Apellido paterno, Apellido
    materno, Sexo, Fecha de nacimiento.
  - *Contacto:* Correo de acceso, Correo personal, Celular principal,
    Celular secundario.
  - *Datos de estudiante:* Código universitario, ORCID (opcional).
  - *Acceso:* Estado (toggle activo).
- **Datos placeholder:** fotos de `assets/img/estudiantes/`, códigos ficticios
  (ej. `2021-1234`).

## Pantalla 5 · Usuarios + Roles y permisos

- **Usuarios** (para identidades que **no** son docente ni estudiante, ej.
  Administrador, Receptor/Psicología):
  - **Archivos nuevos:** `pages/admin/usuarios.html` (lista) +
    `pages/admin/usuarios-form.html` (form). Mismo patrón que Docentes, pero
    solo datos de `usuario` + un bloque **"Roles"** (multi-select / chips) para
    asignar uno o varios roles.
  - **Sidebar:** agregar ítem **"Usuarios"** (grupo *Gestión por periodo* o un
    grupo nuevo *Accesos*).
- **Roles y permisos:** la pantalla `pages/admin/roles-permisos.html` **ya
  existe**. Solo **ajustar** para reflejar el modelo cerrado: mostrar la
  `clave` del rol, marcar los roles `protegido` (no editables/borrables), y
  agrupar los permisos por **módulo** en la asignación.

---

**Notas para el mockup (sin backend):** los `select` de grado/especialidad y
la asignación de roles se llenan con datos de ejemplo en el JS; no hay
persistencia real. Todo es visual.

<!-- Estas pantallas cubren el Módulo 1 (Identidad y acceso). Los demás
     módulos (académico, fichas, IA/derivación) se agregan aquí cuando toque. -->
