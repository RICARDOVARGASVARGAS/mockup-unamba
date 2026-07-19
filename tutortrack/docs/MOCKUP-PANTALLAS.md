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
- [x] **Pantalla 4** · Docentes (listado + formulario + ficha)
- [x] **Pantalla 5** · Estudiantes (listado + formulario)
- [x] **Pantalla 6** · Usuarios + ajustes de Roles y permisos

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

## Pantalla 4 · Docentes (listado + formulario + ficha) ✅ HECHO

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
- **Acciones:** Ver · Editar · Restablecer contraseña · Eliminar.
  Toasts: «Docente registrado / actualizado / eliminado» y
  «Contraseña restablecida». Botón **Actualizar lista** en el encabezado.
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

## Pantalla 5 · Estudiantes (listado + formulario) — ✅ Hecho

Mismo patrón que Docentes. El ítem "Estudiantes" ya existe en el sidebar.

- **Archivos:** `pages/admin/estudiantes.html`,
  `pages/admin/estudiantes-form.html`, `js/estudiantes.js`,
  `js/estudiantes-form.js`, `js/estudiantes-data.js` (seed embebido).
- **Columnas de la lista:** Estudiante (foto + nombre) · Código universitario ·
  Documento · Correo · Estado · Acciones (Editar · Restablecer contraseña ·
  Eliminar).
- **Extras de listado:** Actualizar lista; toasts «Estudiante registrado /
  actualizado / eliminado».
- **Formulario, agrupado:**
  - *Datos personales:* Foto, Tipo de documento (select) + Número (+ RENIEC
    simulado), Nombres, Apellido paterno, Apellido materno, Sexo, Fecha de
    nacimiento.
  - *Contacto:* Correo de acceso, Correo personal, Celular principal,
    Celular secundario.
  - *Datos de estudiante:* Código universitario, ORCID (opcional).
  - *Acceso:* Estado (toggle activo). Contraseña inicial no se captura
    (se genera desde el documento).
- **Datos placeholder:** fotos de `assets/img/estudiantes/`, códigos ficticios
  (ej. `2021-1001`).

## Pantalla 6 · Usuarios + Roles y permisos — ✅ Hecho

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

---

# Módulo 2 — Estructura académica

Las pantallas de este módulo cubren las 6 tablas de `BD-BACKEND.md` Módulo 2:
`ciclo`, `periodo_academico` (ya construidos como catálogos), `ciclo_periodo`,
`docente_ciclo_periodo`, `temario`, `estudiante_ciclo_periodo`.

**Nota general:** los datos del JS deben reflejar la relación real entre
tablas. Ejemplo: al mostrar docentes de un `ciclo_periodo`, solo aparecen los
que están asignados en `docente_ciclo_periodo` para ese ciclo+período; al
matricular un estudiante, el select de docente solo muestra esos mismos.

## Estado y orden de construcción (Módulo 2)

- [x] **Pantalla M2-1** · Ciclos (catálogo) — ya construido (`ciclos.html`)
- [x] **Pantalla M2-2** · Periodos académicos (catálogo) — ya construido (`periodos-academicos.html`)
- [x] **Pantalla M2-3** · Gestión del período: ciclos, docentes y temario
- [x] **Pantalla M2-4** · Temario por ciclo+período (vista árbol)
- [x] **Pantalla M2-5** · Matrículas — estudiantes por ciclo+período
- [x] **Pantalla M2-6** · Avanzar estudiantes (propuesta + confirmación)

---

## Pantalla M2-1 · Ciclos (catálogo) — ✅ Ya construido

Archivo existente: `pages/admin/ciclos.html` + `js/ciclos.js`.
Columnas: N° · Nombre · Orden · Estado · Acciones.
Sin cambios pendientes.

## Pantalla M2-2 · Periodos académicos (catálogo) — ✅ Ya construido

Archivo existente: `pages/admin/periodos-academicos.html` + `js/periodos-academicos.js`.
Sin cambios pendientes.

---

## Pantalla M2-3 · Gestión del período — ✅ Hecho

Pantalla central del Módulo 2. Muestra todos los `ciclo_periodo` del período
seleccionado y permite gestionar los docentes asignados a cada uno. El temario
y las matrículas tienen sus propias sub-páginas (M2-4 y M2-5).

### Archivos
- `pages/admin/gestion-periodo.html`
- `js/gestion-periodo.js`
- `js/gestion-periodo-data.js` (seed: ciclos, períodos, docentes por ciclo)

### Estructura visual

**Encabezado de página:**
- Título: "Gestión del período"
- Select de período activo (ej. "2026-I") con opción de ver otros períodos.
  El período activo se marca visualmente (badge "Vigente").
- Botón **"Clonar desde período anterior"** (abre modal).
- Botón **"Nuevo período"** (abre modal simple: nombre, fechas opcionales).

**Cuerpo: tarjetas por `ciclo_periodo`**
Una tarjeta por cada ciclo del período seleccionado. Cada tarjeta contiene:
- **Encabezado:** nombre del ciclo (ej. "1° Ciclo") + badge con nº de
  estudiantes matriculados (ej. "32 estudiantes").
- **Sección Docentes asignados:** lista de chips/badges con nombre y foto
  miniatura de cada tutor asignado. Botón **"Gestionar docentes"** (abre
  modal).
- **Pie de tarjeta:** dos botones enlace →
  - **"Ver temario"** → navega a Pantalla M2-4.
  - **"Ver estudiantes"** → navega a Pantalla M2-5.

**Modal — Gestionar docentes** (dentro de la misma página):
- Título: "Docentes asignados — [Nombre del ciclo] · [Período]"
- Lista actual de docentes asignados con botón "Quitar" por cada uno.
- Buscador + select para agregar un docente (lista de todos los docentes
  activos, excluyendo los ya asignados).
- Botón "Guardar cambios" (toast: "Docentes actualizados").

**Modal — Clonar desde período anterior:**
- Select "Período de origen" (lista de períodos anteriores con datos).
- Aviso: "Se copiarán los docentes asignados y el temario de cada ciclo.
  Las matrículas de estudiantes NO se copian."
- Botón "Clonar" (toast: "Configuración clonada correctamente").

**Modal — Nuevo período:**
- Campo: Nombre del período (ej. "2026-II").
- Campos opcionales: Fecha de inicio, Fecha de fin.
- Checkbox: "Clonar configuración desde [período actual]" (si se marca,
  se comporta igual que el modal de clonar).
- Botón "Crear período".

### Sidebar
- Grupo **"Gestión por periodo"** → ítem **"Configuración del período"**
  apuntando a `gestion-periodo.html`.

### Datos placeholder
- Período activo: 2026-I con 5 ciclos (del 1° al 5°).
- 1° Ciclo: 2 docentes, 32 estudiantes.
- 2° Ciclo: 1 docente, 28 estudiantes.
- 3° Ciclo: 2 docentes, 35 estudiantes.
- (resto con 1 docente y entre 20-30 estudiantes).
- Período anterior disponible para clonar: 2025-II.

---

## Pantalla M2-4 · Temario por ciclo+período — ✅ Hecho

Vista de árbol editable del temario de un `ciclo_periodo` específico.
Se navega desde la tarjeta del ciclo en M2-3 ("Ver temario").

### Archivos
- `pages/admin/temario.html`
- `js/temario.js`
- `js/temario-data.js` (seed con árbol de ejemplo)

### Estructura visual

**Breadcrumb:** Gestión del período › [Nombre del ciclo] › Temario

**Encabezado:**
- Título: "Temario — [Nombre del ciclo] · [Período]"
- Botón **"Agregar tema raíz"** (agrega ítem al nivel superior).

**Árbol de temas:**
Cada ítem del árbol muestra:
- Ícono de colapsar/expandir (si tiene hijos).
- Numeración automática visual (1, 1.1, 1.1.1…) — solo visual, no guardada.
- Texto del tema.
- Botones de acción inline: **Editar** (modal) · **Agregar subtema** ·
  **Subir / Bajar** (reordenar entre hermanos) · **Eliminar** (modal de
  confirmación; avisa si tiene subtemas).

**Modal — Agregar / Editar tema:**
- Campo: Texto del tema (`VARCHAR 255`).
- Solo texto, sin más campos. El nivel (padre) se determina por desde dónde
  se abrió el modal.
- Botón "Guardar" (toast: "Tema guardado").

**Modal — Confirmar eliminar con hijos:**
- "Este tema tiene [n] subtemas. ¿Eliminar todo el árbol?"
- Botón "Eliminar todo" en rojo.

### Datos placeholder
Árbol de ejemplo para 1° Ciclo — 2026-I:
```
1. Adaptación a la vida universitaria
   1.1. Integración a la comunidad universitaria
   1.2. Manejo del tiempo y organización académica
2. Bienestar personal y social
   2.1. Salud mental y manejo del estrés
   2.2. Relaciones interpersonales
3. Orientación vocacional y profesional
```

---

## Pantalla M2-5 · Matrículas — estudiantes por ciclo+período — ✅ Hecho

Lista de estudiantes matriculados en un `ciclo_periodo` específico, con su
tutor asignado y resumen del balance de carga. Se navega desde M2-3
("Ver estudiantes").

### Archivos
- `pages/admin/matriculas.html`
- `js/matriculas.js`
- `js/matriculas-data.js` (seed: estudiantes matriculados por ciclo+período)

### Estructura visual

**Breadcrumb:** Gestión del período › [Nombre del ciclo] › Estudiantes

**Encabezado:**
- Título: "Estudiantes matriculados — [Nombre del ciclo] · [Período]"
- Botón **"Matricular estudiante"** (abre modal).
- Botón **"Actualizar lista"**.

**Panel de balance de carga** (resumen horizontal, encima de la tabla):
- Un chip/badge por docente asignado al ciclo+período mostrando:
  foto miniatura + nombre abreviado + "N tutorados".
  Ejemplo: `[foto] Vargas V. · 16 tutorados`.
- Sirve para visualizar si la carga está equilibrada antes de asignar más.

**Tabla de estudiantes:**
Columnas: N° · Estudiante (foto + nombre) · Código universitario ·
Tutor asignado (nombre) · Fichas llenadas (contador) · Acciones.
Acciones por fila: **Cambiar tutor** (modal) · **Retirar** (modal confirm).

**Modal — Matricular estudiante:**
- Buscador de estudiante (busca por nombre o código universitario).
  Solo muestra estudiantes **sin matrícula en este período** (ya filtrado
  en el seed JS).
- Select de docente (solo los asignados a este `ciclo_periodo`).
- Botón "Matricular" (toast: "Estudiante matriculado").

**Modal — Cambiar tutor:**
- Nombre del estudiante (solo lectura).
- Select de docente (solo los asignados a este `ciclo_periodo`).
- Botón "Guardar" (toast: "Tutor actualizado").

**Modal — Confirmar retirar:**
- "¿Retirar a [nombre] de la matrícula? Esta acción no se puede deshacer
  si el estudiante ya tiene fichas llenadas."
- Botón "Retirar" en rojo.

### Datos placeholder
- 32 estudiantes matriculados en 1° Ciclo — 2026-I.
- 2 docentes: 16 tutorados cada uno.
- Algunos estudiantes con 1-2 fichas llenadas (contador > 0).

---

## Pantalla M2-6 · Avanzar estudiantes — ✅ Hecho

Flujo asistido para abrir un nuevo período matriculando a los estudiantes del
período anterior con el ciclo propuesto (siguiente por `orden`). Es un proceso
de revisión en dos pasos: propuesta → confirmación.

### Archivos
- `pages/admin/avanzar-estudiantes.html`
- `js/avanzar-estudiantes.js`
- `js/avanzar-estudiantes-data.js` (seed: propuesta generada)

### Estructura visual

**Encabezado:**
- Título: "Avanzar estudiantes"
- Indicador de flujo: paso 1 "Revisar propuesta" → paso 2 "Confirmar".
- Selector: "Período de origen" (el anterior, ej. 2025-II) y
  "Período destino" (el nuevo, ej. 2026-I). Ambos prefijados con los
  períodos reales del seed.

**Paso 1 — Tabla de propuesta (editable):**
Columnas:
- **Incluir** (checkbox — desmarcar = no matricular en el nuevo período).
- **Estudiante** (foto + nombre + código).
- **Ciclo actual** (solo lectura — ciclo en 2025-II).
- **Ciclo propuesto** (select editable — por defecto el ciclo siguiente;
  el admin puede cambiar a cualquier ciclo activo, incluido el mismo para
  repetir).
- **Tutor propuesto** (select editable — por defecto el mismo tutor si sigue
  asignado al nuevo `ciclo_periodo`; si no, el primero disponible).

Panel lateral o inferior: **Balance de carga** — tabla con docente y nº de
tutorados asignados en la propuesta actual. Se actualiza en tiempo real al
editar los selects.

Botón **"Confirmar avance"** (activo solo si hay al menos un estudiante
incluido).

**Paso 2 — Confirmación:**
- Resumen: "Se matricularán N estudiantes en [Período destino]."
  Lista colapsable con los estudiantes incluidos y sus ciclos/tutores.
- Lista de estudiantes excluidos (si hay) con nota: "No serán matriculados
  en este período."
- Botón **"Confirmar y matricular"** (toast: "N estudiantes matriculados en
  2026-I correctamente"). Regresa a M2-3 del nuevo período.
- Botón **"Volver y editar"** (regresa al paso 1).

### Sidebar
- Grupo **"Gestión por periodo"** → ítem **"Avanzar estudiantes"**
  apuntando a `avanzar-estudiantes.html`.

### Datos placeholder
- Período origen: 2025-II con 153 estudiantes matriculados.
- 148 incluidos por defecto; 5 excluidos (desmarcados).
- Algunos estudiantes repiten ciclo (ciclo propuesto = ciclo actual).
- Balance visible: tutor A: 52 · tutor B: 48 · tutor C: 48.

---

---

# Módulo 3 — Fichas

Las pantallas cubren el ciclo completo de una ficha: diseño de plantilla →
asignación a ciclo+período → llenado por el estudiante → revisión por el
docente.

## Estado y orden de construcción (Módulo 3)

- [x] **Pantalla M3-1** · Tipos de ficha (catálogo) — ya construido (`tipos-ficha.html`)
- [x] **Pantalla M3-2** · Áreas (catálogo) — ya construido (`areas.html`)
- [x] **Pantalla M3-3** · Tipos de pregunta (catálogo) — ya construido (`tipos-pregunta.html`)
- [x] **Pantalla M3-4** · Plantillas de fichas — listado + constructor de preguntas
- [x] **Pantalla M3-5** · Asignación de fichas a ciclo+período (desde Gestión del período)
- [x] **Pantalla M3-6** · Fichas de mis tutorados (vista docente)
- [x] **Pantalla M3-7** · Respuestas de una ficha (detalle docente + observaciones)
- [x] **Pantalla M3-8** · Mis fichas (vista estudiante — lista de fichas asignadas)
- [x] **Pantalla M3-9** · Llenar una ficha (vista estudiante — formulario con autoguardado)

---

## Pantalla M3-1 · Tipos de ficha — ✅ Ya construido
Archivo existente: `pages/admin/tipos-ficha.html` + `js/tipos-ficha.js`. Sin cambios pendientes.

## Pantalla M3-2 · Áreas — ✅ Ya construido
Archivo existente: `pages/admin/areas.html` + `js/areas.js`. Sin cambios pendientes.

## Pantalla M3-3 · Tipos de pregunta — ✅ Ya construido
Archivo existente: `pages/admin/tipos-pregunta.html` + `js/tipos-pregunta.js`.
> Nota: esta pantalla muestra los 5 tipos como referencia visual, pero son
> constantes fijas en código — no se agregan ni eliminan desde la UI.

---

## Pantalla M3-4 · Plantillas de fichas — ✅ Hecho

Pantalla principal de gestión de fichas del admin. Listado de plantillas +
constructor de preguntas embebido en una página de formulario separada.

### Archivos
- `pages/admin/fichas.html` — listado
- `pages/admin/fichas-form.html` — crear/editar plantilla + preguntas
- `js/fichas.js`, `js/fichas-form.js`, `js/fichas-data.js`

### Listado (`fichas.html`)
- **Copiar de:** `pages/admin/docentes.html` (lista con acciones)
- **Columnas:** N° · Nombre · Tipo (badge con color por tipo) · Nº de preguntas · Estado · Acciones
- **Acciones por fila:** Ver preguntas · Editar · Duplicar · Eliminar
- **Botón encabezado:** "Nueva ficha"
- **Filtros:** por Tipo de ficha · por Estado (activa/inactiva)
- **Toasts:** "Ficha creada / actualizada / eliminada / duplicada"

### Formulario (`fichas-form.html`)
**Sección 1 — Datos de la ficha:**
- Nombre (`VARCHAR 150`)
- Tipo de ficha (select — datos de `tipos-ficha`)
- Descripción (textarea opcional)
- Estado (toggle activo)

**Sección 2 — Preguntas (constructor):**
Lista editable de preguntas con:
- Botón **"Agregar pregunta"** (abre modal)
- Cada pregunta muestra: número de orden · área (badge) · tipo (badge) · enunciado (truncado) · botones Editar · Mover arriba/abajo · Eliminar
- Las opciones de `alternativa_unica` y `respuesta_multiple` se muestran indentadas bajo su pregunta como chips editables

**Modal — Agregar / Editar pregunta:**
- Área (select → datos de `areas.js`)
- Tipo de pregunta (select con los 5 tipos)
- Enunciado (textarea)
- **Si tipo = `alternativa_unica` o `respuesta_multiple`:** sección "Opciones" con lista + campo para agregar opción + botón quitar por cada una
- **Si tipo = `escala`:** campos Valor mínimo, Valor máximo, Etiqueta mínima, Etiqueta máxima
- **Si tipo = `texto_abierto` o `si_no`:** sin campos extra

### Sidebar
Grupo **"Fichas"** → ítem **"Plantillas de fichas"** apuntando a `fichas.html`

### Datos placeholder
- 3 plantillas: "Ficha diagnóstica inicial", "Seguimiento mensual", "Encuesta de cierre"
- "Ficha diagnóstica inicial" con 5 preguntas de distintos tipos como ejemplo

---

## Pantalla M3-5 · Asignación de fichas a ciclo+período — ✅ Hecho

Se accede desde la tarjeta del ciclo en `gestion-periodo.html`. Muestra las
fichas ya asignadas al ciclo+período y permite asignar nuevas desde las
plantillas activas.

### Archivos
- `pages/admin/fichas-ciclo-periodo.html`
- `js/fichas-ciclo-periodo.js`, `js/fichas-ciclo-periodo-data.js`

### Estructura visual
**Breadcrumb:** Gestión del período › [Ciclo] › Fichas asignadas

**Encabezado:**
- Título: "Fichas — [Ciclo] · [Período]"
- Botón **"Asignar ficha"** (abre modal)

**Lista de fichas asignadas:**
Cada fila muestra: nombre de la ficha · tipo (badge) · nº de preguntas ·
nº de estudiantes que la completaron · Acciones: Ver preguntas · Desasignar

**Modal — Asignar ficha:**
- Select de plantillas activas (solo las `activo = 1`, no las ya asignadas a este ciclo+período)
- Aviso: "Se clonará la ficha y sus preguntas. Los cambios posteriores a la plantilla no afectarán esta copia."
- Botón "Asignar" (toast: "Ficha asignada correctamente")

### Sidebar
Enlace desde tarjeta de ciclo en `gestion-periodo.html`, no ítem directo en sidebar.

---

## Pantalla M3-6 · Fichas de mis tutorados — ✅ Hecho

Vista del **docente-tutor**: ve el estado de llenado de las fichas de sus
estudiantes asignados en el período activo.

### Archivos
- `pages/docente/fichas-tutorados.html`
- `js/fichas-tutorados.js`, `js/fichas-tutorados-data.js`

### Estructura visual
**Selector de ficha** (tabs o select): muestra las fichas asignadas al
ciclo+período del docente (ej. "Ficha diagnóstica · 1° ciclo 2026-I")

**Tabla de estudiantes:**
Columnas: N° · Estudiante (foto + nombre) · Estado (badge: Pendiente /
Borrador / Enviada) · Fecha envío · Acciones

- **Pendiente** (gris) → el estudiante aún no abrió la ficha
- **Borrador** (amarillo) → la abrió pero no la envió
- **Enviada** (verde) → completada, disponible para revisar

**Acciones por fila:**
- "Ver respuestas" (solo si estado = Enviada) → navega a M3-7
- Sin más acciones — el docente no puede editar respuestas del estudiante

**Resumen encabezado:** "X de Y estudiantes han enviado la ficha"

### Sidebar
Grupo **"Mis tutorados"** (sección Docente-Tutor) → ítem **"Fichas"**

### Datos placeholder
- 16 estudiantes, mix de estados: 8 Enviada · 4 Borrador · 4 Pendiente

---

## Pantalla M3-7 · Respuestas de una ficha (detalle docente) — ✅ Hecho

El docente revisa las respuestas de UN estudiante en UNA ficha, y puede
añadir observaciones por pregunta.

### Archivos
- `pages/docente/ficha-respuestas.html`
- `js/ficha-respuestas.js`, `js/ficha-respuestas-data.js`

### Estructura visual
**Breadcrumb:** Fichas de tutorados › [Nombre del estudiante]

**Encabezado:**
- Foto + nombre del estudiante · Ciclo · Período · Fecha de envío
- Nombre de la ficha

**Lista de preguntas y respuestas:**
Por cada pregunta:
- Área (badge de color) + enunciado de la pregunta
- Respuesta del estudiante destacada visualmente:
  - `texto_abierto` → caja de texto con el contenido
  - `escala` → barra visual con el valor marcado (ej. ●●○○○ para 2/5)
  - `si_no` / `alternativa_unica` → opción marcada en verde
  - `respuesta_multiple` → todas las opciones marcadas en verde
- Campo **"Observación del tutor"** (textarea editable inline, se guarda con botón "Guardar observación")

**Botón final:** "Marcar ficha como revisada" (cambia estado interno del docente — no afecta la ficha del estudiante)

### Datos placeholder
Respuestas coherentes con los temas de tutoría. Mezcla de tipos de pregunta.

---

## Pantalla M3-8 · Mis fichas (vista estudiante) — ✅ Hecho

El estudiante ve todas las fichas que tiene pendientes o ya completadas.

### Archivos
- `pages/estudiante/mis-fichas.html`
- `js/mis-fichas.js`, `js/mis-fichas-data.js`

### Estructura visual
**Lista de fichas:**
Tarjeta por cada ficha asignada al ciclo+período del estudiante.
Cada tarjeta: nombre de la ficha · tipo (badge) · estado (Pendiente /
En progreso / Enviada) · fecha límite (si aplica) · botón acción:
- Pendiente → "Comenzar"
- En progreso → "Continuar" (retoma el borrador)
- Enviada → "Ver mis respuestas" (solo lectura)

### Sidebar
Grupo **"Mi tutoría"** (sección Estudiante) → ítem **"Mis fichas"**

---

## Pantalla M3-9 · Llenar una ficha (vista estudiante) — ✅ Hecho

El formulario que el estudiante completa. Autoguardado en borrador.

### Archivos
- `pages/estudiante/llenar-ficha.html`
- `js/llenar-ficha.js`, `js/llenar-ficha-data.js`

### Estructura visual
**Encabezado:** nombre de la ficha · indicador de progreso (ej. "Pregunta 3 de 8")

**Preguntas una a una o todas en scroll** (scroll continuo recomendado):
- `texto_abierto` → `<textarea>` con contador de caracteres
- `escala` → barra de selección 1 a N con etiquetas en extremos
- `si_no` → dos botones grandes "Sí" / "No"
- `alternativa_unica` → radio buttons con las opciones
- `respuesta_multiple` → checkboxes con las opciones

**Autoguardado:** toast discreto "Progreso guardado" cada vez que el
estudiante responde una pregunta (simula guardado en borrador).

**Botón final:** "Enviar ficha" — solo habilitado si todas las preguntas
tienen respuesta. Modal de confirmación: "Una vez enviada no podrás
editarla. ¿Confirmar envío?" → toast "Ficha enviada correctamente" →
regresa a M3-8.

### Datos placeholder
Usar las preguntas de la "Ficha diagnóstica inicial" del seed de `fichas-data.js`

---

<!-- Módulo 4 (IA/Alertas/Derivación) se agrega aquí cuando se cierre
     su diseño en BD-BACKEND.md. -->
