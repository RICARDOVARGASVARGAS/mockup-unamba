# Especificación de pantallas — TutorTrack

Inventario completo de pantallas antes de diseñar. Cada entrada dice
**para qué sirve**, **qué entidades de `MODELO-DATOS.md` lee/escribe**,
**qué elementos clave debe tener** y **qué reglas de negocio ya
definidas debe respetar** — el detalle visual (layout, componentes
exactos) se resuelve recién en la etapa de diseño, pantalla por
pantalla, después de cerrar este documento completo.

Los nombres de archivo coinciden exactamente con los `path` ya
definidos en `components/app-sidebar.js`, para que el menú y esta
especificación nunca se desalineen.

## Convención usada en cada ficha de pantalla

- **Sección**: a qué una de las 4 secciones del sidebar pertenece.
- **Objetivo**: qué problema resuelve esta pantalla, en una línea.
- **Entidades**: qué tablas de `MODELO-DATOS.md` lee y/o escribe.
- **Elementos clave**: qué debe poder verse/hacerse (sin diseñar el
  layout todavía).
- **Reglas**: validaciones o comportamientos ya acordados que la
  pantalla debe respetar (no se repiten los detalles, se referencian).
- **Formulario**: si aplica, si el alta/edición se resuelve con un
  modal (catálogos simples) o una página aparte (entidades con más
  campos/relaciones) — propuesta a confirmar en diseño.

---

## Fase 0 — Compartido (hecho)

Ya construido y probado: `index.html` (login), `components/app-sidebar.js`,
`components/app-topbar.js`, un dashboard de ejemplo por sección
(`pages/<sección>/dashboard.html`). Ver `../CLAUDE.md` § Estado actual.

---

## Fase 1 — Catálogos independientes (Administrador)

Todos siguen el mismo patrón: listado con buscador simple + alta/edición
por modal (son catálogos de `id` + `nombre`, no ameritan página aparte)
+ acción "Eliminar" solo si el ítem no está en uso (regla general de
integridad, no se repite en cada ficha).

### `admin/ciclos.html` — Ciclos
- **Objetivo**: administrar el catálogo de niveles curriculares (1° al 10°, editable — ver `MODELO-DATOS.md` § Ciclo).
- **Entidades**: `Ciclo`.
- **Elementos clave**: listado ordenado por `numero`; alta/edición de `numero` + `nombre`; sin límite fijo de 10 (el catálogo debe poder crecer, ej. 11°/12° en 2028).
- **Reglas**: `numero` único; no permitir eliminar un `Ciclo` referenciado por algún `CicloPeriodo`.

### `admin/periodos-academicos.html` — Periodos académicos
- **Objetivo**: administrar los periodos (2026-I, 2026-II...) y marcar cuál está vigente.
- **Entidades**: `PeriodoAcademico`.
- **Elementos clave**: listado; alta/edición de `nombre`, `fecha_inicio`, `fecha_fin`; marcar `activo` (un solo periodo vigente a la vez — validar que al activar uno se desactive el anterior).
- **Reglas**: al crear un periodo nuevo, ofrecer el flujo de "copiar configuración del periodo anterior" (ver Fase 3, `admin/ciclo-periodo.html`) — este catálogo es el punto de entrada de ese flujo.

### `admin/areas.html` — Áreas
- **Objetivo**: catálogo temático de preguntas (ej. "Personal y social", "Salud corporal y mental").
- **Entidades**: `Area`.
- **Elementos clave**: listado simple; alta/edición de `nombre`.
- **Reglas**: no eliminar un `Area` referenciada por alguna `Pregunta`.

### `admin/tipos-ficha.html` — Tipos de ficha
- **Objetivo**: catálogo de tipos de ficha (Diagnóstico, Seguimiento, Grupal, Encuesta...).
- **Entidades**: `TipoFicha`.
- **Elementos clave**: listado; alta/edición de `nombre`.
- **Reglas**: catálogo abierto — el usuario puede agregar tipos nuevos sin tocar código.

### `admin/tipos-pregunta.html` — Tipos de pregunta
- **Objetivo**: catálogo de tipos de pregunta (Texto abierto, Alternativa única, Respuesta múltiple).
- **Entidades**: `TipoPregunta`.
- **Elementos clave**: listado; alta/edición de `nombre`.
- **Reglas**: el constructor de fichas (Fase 4) depende de este catálogo para saber si debe pedir opciones (`OpcionPregunta`) o no.

### `admin/entidades-receptoras.html` — Entidades receptoras
- **Objetivo**: catálogo de a dónde se puede derivar un caso (Psicología, Servicios médicos...).
- **Entidades**: `EntidadReceptora`.
- **Elementos clave**: listado; alta/edición de `nombre`.
- **Reglas**: cada `EntidadReceptora` normalmente implica un `Rol` correspondiente (ver `admin/roles-permisos.html`) para que su personal tenga acceso — no automático, pero sí a tener en mente al crear una entidad nueva.

### `admin/tipos-estado-derivacion.html` — Tipos de estado de derivación
- **Objetivo**: catálogo de estados posibles del seguimiento de una derivación (Derivado, En atención, En seguimiento, Resuelto, Cerrado...).
- **Entidades**: `TipoEstadoDerivacion`.
- **Elementos clave**: listado; alta/edición de `nombre`; posibilidad de definir un orden lógico (para mostrar una línea de tiempo coherente en `receptor/casos.html`).
- **Reglas**: catálogo abierto, contenido a definir con el usuario antes de poblarlo.

### `admin/roles-permisos.html` — Roles y permisos
- **Objetivo**: administrar el RBAC completo (`Rol`, `Permiso`, y sus asignaciones).
- **Entidades**: `Rol`, `Permiso`, `RolPermiso`, y de forma indirecta `UsuarioRol` (la asignación de rol a un usuario puntual se hace desde `admin/docentes.html` / `admin/estudiantes.html`, no aquí).
- **Elementos clave**: dos listados o dos pestañas — Roles (con sus permisos asignados, checklist de `Permiso` por `Rol`) y Permisos (catálogo simple). Alta/edición de ambos.
- **Reglas**: un permiso nunca se asigna directo a un `Usuario` — siempre pasa por un `Rol` (ver `MODELO-DATOS.md`).
- **Formulario**: página aparte (no modal) por la complejidad de la matriz Rol×Permiso.

---

## Fase 2 — Docente y Estudiante (Administrador)

### `admin/docentes.html` — Docentes
- **Objetivo**: CRUD de docentes-tutores.
- **Entidades**: `Docente`, `Usuario` (1:1), `UsuarioRol` (asignar el/los roles del docente, ej. "Docente-Tutor").
- **Elementos clave**: listado (nombre completo, correo, foto, roles asignados); alta/edición con los campos de `Usuario` (documento, nombres, apellidos, sexo, fecha de nacimiento, correo, contraseña inicial) + los propios de `Docente` (foto de perfil) + selector de Rol(es).
- **Reglas**: la contraseña se maneja como cualquier alta de usuario (hash en el backend real; en el mockup, campo visual sin lógica).
- **Formulario**: página aparte (`admin/docentes-form.html`), por la cantidad de campos.

### `admin/estudiantes.html` — Estudiantes
- **Objetivo**: CRUD de estudiantes.
- **Entidades**: `Estudiante`, `Usuario` (1:1).
- **Elementos clave**: listado (nombre completo, código, correo, foto); alta/edición con los mismos campos de `Usuario` + código universitario (atributo propio de `Estudiante`, contenido exacto pendiente) + foto de perfil.
- **Reglas**: la matrícula en un ciclo/periodo **no se hace aquí** — se gestiona en `admin/matriculas.html` (Fase 3). Esta pantalla es solo el dato maestro del estudiante.
- **Formulario**: página aparte (`admin/estudiantes-form.html`).

---

## Fase 3 — Configuración por periodo (Administrador)

### `admin/ciclo-periodo.html` — Ciclo x Periodo
- **Objetivo**: el corazón de la configuración semestral — para un Periodo Académico dado, define qué Ciclos participan, qué Docente(s) dicta(n) cada uno, y su Temario.
- **Entidades**: `CicloPeriodo`, `DocenteCicloPeriodo`, `Temario`.
- **Elementos clave**:
  - Selector de Periodo Académico arriba (por defecto el vigente).
  - Listado de `CicloPeriodo` de ese periodo (uno por Ciclo), cada uno expandible para ver/editar sus Docentes asignados (n:n) y su Temario (lista de temas, editable).
  - Botón destacado **"Copiar configuración de un periodo anterior"** al abrir un Periodo Académico nuevo sin configurar todavía — selecciona el periodo de origen, clona `CicloPeriodo` + `Temario` + `DocenteCicloPeriodo`, y a partir de ahí todo es editable de forma independiente (ver regla de copia en `MODELO-DATOS.md`).
- **Reglas**: la asignación Docente↔Ciclo es n:n y propia de cada periodo; unicidad (mismo docente no se repite en el mismo `CicloPeriodo`).

### `admin/matriculas.html` — Matrículas
- **Objetivo**: matricular estudiantes en un Ciclo dentro de un Periodo Académico, a cargo de un Docente específico; incluye el asistente "Avanzar estudiantes".
- **Entidades**: `EstudianteCicloPeriodo`.
- **Elementos clave**:
  - Listado de matrículas del periodo seleccionado (estudiante, ciclo, docente asignado), con conteo de tutorados por docente visible (para detectar desequilibrios de carga).
  - Alta manual de una matrícula puntual (buscar estudiante → elegir Ciclo del periodo → elegir Docente, limitado a los ya asignados a ese `CicloPeriodo` en `DocenteCicloPeriodo`).
  - Asistente **"Avanzar estudiantes"**: toma las matrículas del periodo anterior, propone el Ciclo siguiente (por `numero`) para cada estudiante en el nuevo periodo, permite corregir individualmente (repite, cambia de ciclo, o se excluye = egresa/retira) antes de confirmar.
- **Reglas**: un estudiante solo puede tener una matrícula por Periodo Académico; sí puede repetir el mismo Ciclo en periodos distintos.

---

## Fase 4 — Fichas

### `admin/fichas.html` — Plantillas de fichas
- **Objetivo**: constructor de fichas reutilizables (plantillas) — el docente/admin diseña una vez, la reutiliza en varios ciclos/periodos.
- **Entidades**: `Ficha`, `Pregunta` (con `ficha_id` lleno, `ficha_ciclo_periodo_id` vacío), `OpcionPregunta`.
- **Elementos clave**: listado de plantillas (nombre, tipo, cantidad de preguntas); editor de plantilla — agregar preguntas en orden, elegir `TipoPregunta` por pregunta (si es alternativa/múltiple, agregar sus `OpcionPregunta`), elegir `Area` de cada pregunta.
- **Reglas**: mientras la plantilla no esté asignada a ningún `CicloPeriodo`, se edita libremente; una vez clonada (ver siguiente pantalla), los cambios posteriores en la plantilla NO afectan las copias ya en uso.
- **Formulario**: página aparte (`admin/fichas-form.html`) — el editor de preguntas necesita espacio.

### `admin/fichas-asignacion.html` — Asignación de fichas a ciclos
- **Objetivo**: tomar una plantilla de `Ficha` y "publicarla" (clonarla) hacia uno o más `CicloPeriodo` para que los estudiantes de ese ciclo+periodo puedan llenarla.
- **Entidades**: `FichaCicloPeriodo` (clon) + copia de `Pregunta`/`OpcionPregunta` con `ficha_ciclo_periodo_id` lleno.
- **Elementos clave**: elegir plantilla → elegir uno o más `CicloPeriodo` destino (del periodo vigente) → confirmar clonado. Listado de qué fichas ya están asignadas a cada ciclo del periodo actual.
- **Reglas**: el clonado es una copia independiente — editar la copia después no debe tocar la plantilla original, y viceversa.

### `docente/temario.html` — Temario (Docente)
- **Objetivo**: que el docente-tutor vea (y, si tiene permiso, edite) el temario de tutoría del/los ciclo(s) que dicta en el periodo vigente.
- **Entidades**: `Temario` (vía `CicloPeriodo` de sus `DocenteCicloPeriodo`).
- **Elementos clave**: selector de ciclo (si dicta más de uno), lista de temas en orden.

### `docente/fichas.html` — Fichas por revisar (Docente)
- **Objetivo**: el docente ve las fichas que sus tutorados han llenado, lee las respuestas y anota su observación por pregunta.
- **Entidades**: `FichaLlenada`, `Respuesta` (lectura + edición de `observaciones_tutor`), `RespuestaOpcion`.
- **Elementos clave**: listado de `FichaLlenada` de sus tutorados (estudiante, tipo de ficha, fecha, estado revisado/sin revisar); vista de detalle con cada `Pregunta` + `Respuesta` del estudiante + campo `observaciones_tutor` editable por pregunta.
- **Reglas**: esta es la pantalla donde el docente puede detectar manualmente una señal de alerta además de la que ya generó la IA — sus `observaciones_tutor` quedan como insumo adicional, no reemplazan la `AlertaIA`.

### `estudiante/fichas.html` — Mis fichas (Estudiante)
- **Objetivo**: el estudiante ve su ficha pendiente y la llena; también ve su historial de fichas ya enviadas.
- **Entidades**: crea `FichaLlenada` + `Respuesta` (+ `RespuestaOpcion` si aplica) al enviar.
- **Elementos clave**: ficha pendiente destacada (si existe) con el formulario completo (una pregunta a la vez o todo en una sola página — a decidir en diseño); botón "Enviar" que crea `FichaLlenada` de una sola vez (sin borrador, ver regla confirmada); historial de fichas anteriores (solo lectura, sin ver `observaciones_tutor` del docente — dato interno).
- **Reglas**: sin estado de borrador — `FichaLlenada` se crea solo al enviar completo.

### `estudiante/tutor.html` — Mi tutor (Estudiante)
- **Objetivo**: que el estudiante sepa quién es su docente-tutor asignado este periodo.
- **Entidades**: `EstudianteCicloPeriodo` → `Docente`.
- **Elementos clave**: tarjeta con nombre, foto, y quizás un dato de contacto del docente-tutor.

### `docente/tutorados.html` — Mis tutorados (Docente)
- **Objetivo**: listado de estudiantes a cargo del docente en el periodo vigente.
- **Entidades**: `EstudianteCicloPeriodo` (filtrado por `docente_id` y periodo vigente).
- **Elementos clave**: listado (nombre, código, ciclo, última ficha enviada, alertas activas si las hay); acceso rápido a las fichas de cada estudiante.

---

## Fase 5 — IA / Alertas / Derivación

### `admin/alertas.html` — Alertas IA (Administrador)
- **Objetivo**: vista global de todas las `AlertaIA` generadas, para supervisión institucional.
- **Entidades**: `AlertaIA` (lectura, todas).
- **Elementos clave**: listado filtrable (nivel, área, estado, docente, periodo); una `FichaLlenada` puede tener varias alertas (una por área detectada) — mostrarlas agrupadas por ficha o listadas individualmente, a decidir en diseño.

### `docente/alertas.html` — Alertas IA (Docente)
- **Objetivo**: el docente revisa las alertas de sus propios tutorados y decide si derivar.
- **Entidades**: `AlertaIA` (filtrado por `docente_id`), crea `Derivacion` al derivar.
- **Elementos clave**: listado de alertas pendientes de sus tutorados (nivel, área, justificación de la IA); acción "Derivar" que abre el formulario de `Derivacion` (elegir `EntidadReceptora` + `usuario_receptor_id` — la persona específica con el Rol correspondiente); acción "Descartar" (cambia `estado` a "Descartada" sin derivar, ej. falso positivo).
- **Reglas**: la decisión de derivar (y a quién) siempre la toma el docente — la IA nunca deriva sola.

### `admin/derivaciones.html` / `docente/derivaciones.html` — Derivaciones
- **Objetivo**: ver el estado de las derivaciones (todas, para Admin; las propias, para Docente).
- **Entidades**: `Derivacion`, `EstadoDerivacion` (lectura del historial).
- **Elementos clave**: listado (estudiante, entidad receptora, fecha, estado actual — el más reciente de `EstadoDerivacion`, nunca un campo aparte); detalle con línea de tiempo completa de `EstadoDerivacion` (comentario + adjunto por entrada).

### `receptor/casos.html` — Casos derivados (Receptor/Psicología)
- **Objetivo**: la entidad receptora (ej. psicología) ve los casos derivados a su cargo y registra el avance.
- **Entidades**: `Derivacion` (filtrado por `usuario_receptor_id`), crea filas nuevas en `EstadoDerivacion`.
- **Elementos clave**: listado de casos (nuevo / en atención / resuelto — según último `EstadoDerivacion`); detalle de un caso con su línea de tiempo y un formulario para agregar una nueva entrada de estado (elegir `TipoEstadoDerivacion`, escribir comentario, adjuntar archivo opcional).
- **Reglas**: el estado actual siempre se lee de la última entrada de `EstadoDerivacion`, nunca se sobreescribe un campo de estado.

### `receptor/historial.html` — Historial de seguimiento (Receptor/Psicología)
- **Objetivo**: vista de solo lectura de todo el historial de `EstadoDerivacion` que el usuario receptor ha registrado, para su propio archivo/consulta.
- **Entidades**: `EstadoDerivacion` (filtrado por `usuario_id` = el receptor).
- **Elementos clave**: listado cronológico, filtrable por caso/fecha.

---

## Resumen de pantallas por sección

| Sección | Pantallas (además del Dashboard) |
|---|---|
| Administrador | Ciclos, Periodos académicos, Áreas, Tipos de ficha, Tipos de pregunta, Entidades receptoras, Tipos de estado de derivación, Roles y permisos, Docentes (+form), Estudiantes (+form), Ciclo x Periodo, Matrículas, Plantillas de fichas (+form), Asignación de fichas, Alertas IA, Derivaciones |
| Docente-Tutor | Mis tutorados, Temario, Fichas por revisar, Alertas IA, Derivaciones |
| Estudiante | Mis fichas, Mi tutor |
| Receptor/Psicología | Casos derivados, Historial de seguimiento |

## Pendiente de definir (antes de diseñar cada pantalla)
- Contenido real de los catálogos (ver `MODELO-DATOS.md` § Pendiente).
- Si el editor de `admin/fichas.html` pide una pregunta a la vez o todas en una sola vista.
- Si `estudiante/fichas.html` presenta el formulario "una pregunta a la vez" (más cuidadoso para temas sensibles) o todo en una sola página.
- Confirmar con el usuario si faltó alguna pantalla antes de pasar a diseño.
