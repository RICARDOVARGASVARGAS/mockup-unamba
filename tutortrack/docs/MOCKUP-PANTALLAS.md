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
- **Seguimiento:** al terminar una pantalla, marca su casilla en «Estado y
  orden» (`- [ ]` → `- [x]`) y cambia el estado de su encabezado a **✅ Hecho**.

## Estado y orden de construcción

Marca la casilla al terminar cada pantalla:

- [x] **Pantalla 1** · Grados académicos (catálogo)
- [x] **Pantalla 2** · Especialidades (catálogo)
- [x] **Pantalla 3** · Tipos de documento (catálogo)
- [x] **Pantalla 4** · Docentes (listado + formulario)
- [ ] **Pantalla 5** · Estudiantes (listado + formulario)
- [ ] **Pantalla 6** · Usuarios + ajustes de Roles y permisos

---

## Pantalla 1 · Grados académicos (catálogo) — ✅ Hecho

- **Copiar de:** `pages/admin/ciclos.html` + `js/ciclos.js` (catálogo con
  nombre + orden + activo — el mismo caso).
- **Archivos:** `pages/admin/grados-academicos.html`,
  `js/grados-academicos.js`.
- **Columnas de la tabla:** N° · Nombre · Abreviatura · Estado (badge) · Acciones.
- **Formulario (modal):** Nombre, Abreviatura (texto corto, ej. `Bach.`),
  N° de orden, Estado (toggle activo).
- **Sidebar:** ítem **"Grados académicos"** en *Catálogos*.
- **Datos placeholder:** Bachiller (`Bach.`), Licenciado (`Lic.`), Magíster
  (`Mg.`), Doctor (`Dr.`).
- **Uso:** la abreviatura se muestra en listados densos (ej. docentes).

## Pantalla 2 · Especialidades (catálogo) — ✅ Hecho

- **Copiar de:** `pages/admin/areas.html` + `js/areas.js` (catálogo simple
  nombre + activo).
- **Archivos nuevos:** `pages/admin/especialidades.html`, `js/especialidades.js`.
- **Columnas:** N° · Nombre · Estado (badge visual) · Acciones.
- **Formulario (modal):** Nombre (texto), N° de orden (número), Estado (toggle activo — único lugar para editarlo).
- **Sidebar:** agregar ítem **"Especialidades"** al grupo *Catálogos*.
- **Datos placeholder:** Marketing, Finanzas, Gestión Pública, Recursos
  Humanos, Contabilidad.

## Pantalla 3 · Tipos de documento (catálogo) — ✅ Hecho ✅ HECHO

- **Copiar de:** `pages/admin/especialidades.html` + `js/especialidades.js`
  (catálogo simple nombre + activo).
- **Archivos:** `pages/admin/tipos-documento.html`, `js/tipos-documento.js`,
  `js/tipos-documento-data.js` (seed compartido con formularios).
- **Columnas:** N° · Clave · Nombre · Estado (badge) · Acciones.
- **Formulario (modal):** Clave, Nombre, Estado (toggle activo).
- **Sidebar:** ítem **"Tipos de documento"** en *Catálogos*.
- **Datos placeholder:** DNI, Carné de Extranjería, Pasaporte.
- **Nota:** el `select` de tipo de documento ya está en el formulario de
  docentes; pendiente en estudiantes/usuarios.

## Pantalla 4 · Docentes (listado + formulario) ✅ HECHO

Entidad rica → **lista** + **página de formulario aparte** (demasiados campos
para un modal). El ítem "Docentes" ya existe en el sidebar (grupo *Gestión por
periodo*) apuntando a `docentes.html`.

- **Archivos:**
  - `pages/admin/docentes.html` — lista (`js/catalog-table.js`).
  - `pages/admin/docentes-ver.html` — ficha de solo lectura (ver).
  - `pages/admin/docentes-form.html` — formulario crear/editar.
  - `js/docentes.js`, `js/docentes-ver.js`, `js/docentes-form.js`,
    `js/docentes-data.js` (seed embebido; sin `docentes.json`).
- **Listado:** nombres largos se envuelven tras un ancho máximo; sin foto se
  usa avatar predeterminado según sexo (`usuario-m.svg` / `usuario-f.svg`).
  Algunos registros sin celular para contrastar el contacto.
- **Columnas de la lista:** N° · Docente (foto + abreviatura de grado +
  nombres y apellidos) · Documento (tipo + número) · Contacto (correo +
  celular) · Acciones.
- **Acciones:** Ver (ficha profesional: nombre en mayúsculas, grado completo,
  bloques Identidad / Contacto / Académico / Biografía) · Editar · Eliminar.
- **Formulario, agrupado (alineado a BD):**
  - *Datos personales:* Foto, Tipo de documento + Número (+ buscar RENIEC
    simulado), Nombres, Apellido paterno, Apellido materno, Sexo, Fecha de
    nacimiento.
  - *Contacto y acceso:* Correo de acceso (`email`, login), Correo personal,
    Celular principal, Celular secundario, Estado (`activo`). La contraseña
    inicial **no se captura** en el form: se genera en backend a partir del
    documento (o auto).
  - *Perfil académico (`docente`):* Grado académico, Especialidad, ORCID,
    URL del CV, Biografía.
  - *Roles:* multi-check `usuario_rol`.
- **Datos placeholder:** fotos de `assets/img/docentes/` y nombres ficticios.

## Pantalla 5 · Estudiantes (listado + formulario) — ⬜ Pendiente

Mismo patrón que Docentes. El ítem "Estudiantes" ya existe en el sidebar.

- **Archivos nuevos:** `pages/admin/estudiantes.html`,
  `pages/admin/estudiantes-form.html`, `js/estudiantes.js`.
- **Columnas de la lista:** Foto + Nombre completo · Código universitario ·
  Documento · Correo · Estado · Acciones.
- **Formulario, agrupado:**
  - *Datos personales:* Foto, Tipo de documento (select) + Número de documento,
    Nombres, Apellido paterno, Apellido materno, Sexo, Fecha de nacimiento.
  - *Contacto:* Correo de acceso, Correo personal, Celular principal,
    Celular secundario.
  - *Datos de estudiante:* Código universitario, ORCID (opcional).
  - *Acceso:* Estado (toggle activo).
- **Datos placeholder:** fotos de `assets/img/estudiantes/`, códigos ficticios
  (ej. `2021-1234`).

## Pantalla 6 · Usuarios + Roles y permisos — ⬜ Pendiente

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
