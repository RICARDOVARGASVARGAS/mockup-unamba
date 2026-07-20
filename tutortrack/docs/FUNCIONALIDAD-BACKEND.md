# Funcionalidad del Backend — TutorTrack

Descripción **textual** de qué hace cada endpoint: validaciones, reglas de
negocio, transacciones y permisos. Es la guía de implementación para el
backend (Laravel + MySQL). **No incluye diseño ni frontend** — eso se
trabaja aparte.

- Esquema de tablas, contrato de rutas y decisiones de dominio: [`BD-BACKEND.md`](./BD-BACKEND.md) — **fuente única de verdad**.

**Reglas generales (aplican a todo):**
- Auth por token (Sanctum). Todo endpoint no público exige estar autenticado
  y tener el **permiso** indicado; si falta el permiso → `403`.
- Los `index` devuelven resultados **paginados** y **excluyen** los registros
  con `deleted_at` (soft delete).
- Las contraseñas siempre se guardan **hasheadas**; nunca se devuelven.
- Toda operación que toca varias tablas va en **transacción** (todo o nada).
- Validaciones de unicidad ignoran el propio registro al editar.

---

## Módulo 1 — Identidad y acceso

### Autenticación

**`POST /auth/login`**
- Recibe `email` + `contrasena`. El `email` es el **correo de acceso**.
- Valida credenciales; además la cuenta debe estar **habilitada**
  (`activo = 1`) y **no eliminada** (`deleted_at IS NULL`).
- Si es válido: emite token (si viene "recordarme", token de mayor
  duración) y devuelve el usuario + la lista **unificada de permisos** de
  todos sus roles.
- Si falla (credenciales, inactivo o eliminado): `401` con mensaje
  **genérico** ("Correo o contraseña incorrectos"); no revelar cuál falló
  ni si el correo existe.

**`POST /auth/logout`** — revoca el token actual del usuario.

**`GET /auth/me`** — devuelve el usuario autenticado con sus roles y su
lista de permisos (el frontend arma el menú/accesos con esto).

**`POST /auth/forgot-password`**
- Recibe `email`. Si existe y está activo, genera un token temporal y envía
  el correo con el enlace de recuperación.
- Responde **igual exista o no** el correo (no filtrar quién está registrado).

**`POST /auth/reset-password`**
- Recibe token + nueva contraseña. Valida que el token esté vigente, hashea
  y guarda la nueva contraseña, e **invalida** el token usado.

**`PUT /auth/password`** — cambia la propia contraseña; exige `contrasena_actual`
correcta + `contrasena_nueva`.

### Usuarios (identidad)

**`GET /usuarios`** — lista paginada. Filtros: buscar por `nombres` /
`apellidos` / `documento` / `email`; filtrar por rol y por `activo`.

**`POST /usuarios`** — crea una identidad.
- Valida `tipo_documento_id` + `documento` **único por tipo**, `email` único
  y con formato válido; `email_personal` opcional (no único). Opcional:
  validar el largo del `documento` según la `clave` del tipo (DNI = 8 dígitos).
- Hashea la contraseña.
- Puede recibir la lista de `roles` a asignar (crea las filas `usuario_rol`).

**`GET /usuarios/{id}`** — detalle del usuario + sus roles.

**`PUT /usuarios/{id}`** — edita datos. Mantiene la unicidad de `documento`
y `email`. La contraseña **no** se cambia aquí (endpoint aparte).

**`DELETE /usuarios/{id}`** — **soft delete** (`deleted_at`). Nunca hard
delete: el usuario tiene FKs históricas. Un usuario eliminado no puede
iniciar sesión; su `email`/`documento` quedan reservados.

**`PATCH /usuarios/{id}/estado`** — activa/desactiva (`activo`). Un usuario
`activo = 0` no puede iniciar sesión, pero sigue existiendo y listándose.

**`PUT /usuarios/{id}/roles`** — **sincroniza** los roles del usuario
(reemplaza el conjunto en `usuario_rol`). Valida que cada `rol_id` exista y
esté activo. Los permisos nunca se asignan directo al usuario: solo vía rol.

### Perfiles (docente / estudiante)

**`POST /docentes`** — en **una transacción**:
1. Crea (o reutiliza, si ya existe por `documento`) la fila `usuario`.
2. Crea la fila `docente` (perfil).
3. Asigna el rol `docente_tutor` (`usuario_rol`) si no lo tenía.
- Reutilizar el `usuario` cubre el caso "ya es estudiante y ahora también
  docente": **no se duplica la identidad**, se agrega el perfil + rol.
- Valida `documento`/`email` únicos (si es usuario nuevo); `codigo_orcid`
  con formato válido si viene.

**`GET /docentes`** — lista con datos del `usuario` + `grado_academico` +
`especialidad` (joins).

**`PUT /docentes/{id}`** — edita el perfil docente y los datos del `usuario`
asociado.

**`DELETE /docentes/{id}`** — eliminar **solo si no tiene ninguna relación**.
- Si existe ≥1 fila en `docente_ciclo_periodo` (asignado como tutor),
  `estudiante_ciclo_periodo` (tuvo tutorados) o `derivacion` (creó
  derivaciones) → **rechaza `409`/`422`** con el motivo y sugiere **desactivar**
  (no se pierde historial). El frontend muestra los conteos.
- Si **no** tiene relaciones → **soft delete** del `docente` (`deleted_at`). No
  borra el `usuario` (puede seguir siendo estudiante u otro rol).
- **Desactivar** (alternativa a eliminar cuando hay historial): se hace vía
  `PATCH /usuarios/{id}/estado` (`activo = 0`) — el docente deja de ser
  asignable y no inicia sesión, pero conserva todo su historial.

**`/estudiantes`** — análogo a docentes:
- `POST`: transacción usuario + `estudiante` + rol `estudiante`. Valida
  `codigo_universitario` **único** y obligatorio. `estado` nace `activo`.
- `GET` lista (filtra por `estado`), `PUT` edita, `DELETE` soft delete del perfil.

**`PATCH /estudiantes/{id}/estado`** — cambia el **estado académico**
(`activo` / `egresado` / `retirado`). Distinto de `PATCH /usuarios/{id}/estado`
(que es el acceso/login). Un `egresado`/`retirado` sale del padrón activo y de
las propuestas de "Avanzar estudiantes"; su historial se conserva.

**Regla del caso dual (docente + estudiante):** está permitido; el modelo lo
soporta con dos perfiles sobre el mismo `usuario`. *(La validación de que un
estudiante no sea su propio tutor pertenece al Módulo 2 — matrícula.)*

### RBAC (roles y permisos)

**`/roles` [CRUD]**
- `store`/`update`: `clave` y `nombre` únicos. La `clave` no debería cambiar
  una vez creada (el código depende de ella).
- Si `protegido = 1`: `update` y `destroy` se **rechazan** (`422`/`403`) — son
  roles críticos (ej. Administrador).
- `destroy`: no se permite borrar un rol **asignado a usuarios** (para
  retirarlo se usa `activo = 0`). Solo se borra un rol sin uso y no protegido.

**`PUT /roles/{id}/permisos`** — **sincroniza** los permisos del rol
(reemplaza el conjunto en `rol_permiso`). Valida que cada `permiso_id` exista.

**`GET /permisos`** — lista **solo lectura**, agrupada por `modulo` (para la
pantalla de asignación de permisos a roles). No hay crear/editar/borrar: los
permisos los define el desarrollador y se **siembran**.

### Catálogos (tipo_documento / grado_academico / especialidad)

**`/tipos-documento` [CRUD]**, **`/grados-academicos` [CRUD]** y
**`/especialidades` [CRUD]**
- `store`/`update`: `nombre` único.
- `destroy`: **no** se borra un ítem **en uso** por algún docente (la FK lo
  impide). Para retirarlo se usa `activo = 0`.
- `grado_academico` admite `orden` para listar por jerarquía.

---

## Módulo 2 — Estructura académica

### Catálogos (`ciclo` y `periodo_academico`)

**`/ciclos` [CRUD]**
- `store`/`update`: `nombre` y `orden` **únicos**. Al editar `orden`, si el valor ya lo tiene otro ciclo hay que intercambiarlos en una **transacción** (`PUT /ciclos/reordenar`).
- `destroy`: la FK impide eliminar un ciclo que ya tiene `ciclo_periodo` referenciado — responder `422` con mensaje claro ("El ciclo tiene períodos académicos asociados; desactívalo en lugar de eliminarlo").

**`/periodos-academicos` [CRUD]**
- `store`: crear con `activo = 0` por defecto; no se puede crear un período ya activo.
- `update`: editar nombre y fechas. Si `fecha_inicio` y `fecha_fin` están presentes, validar `fecha_inicio <= fecha_fin`. No cambia `activo` por este endpoint.
- `destroy`: rechaza si tiene `ciclo_periodo` referenciado.
- `PATCH /periodos-academicos/{id}/activar`: activa el período y **desactiva todos los demás** en una sola transacción (el sistema garantiza que solo uno esté `activo = 1` en todo momento).

### Ciclo+período (`ciclo_periodo`)

**`GET /periodos-academicos/{id}/ciclos-periodos`**
- Devuelve todos los `ciclo_periodo` del período con: datos del `ciclo`, lista de docentes asignados (con conteo de tutorados cada uno) y total de estudiantes matriculados.

**`POST /periodos-academicos/{id}/ciclos-periodos`**
- Body: `{ ciclo_id }`. Valida que la combinación `(ciclo_id, periodo_academico_id)` no exista ya (UNIQUE). Crea la fila `ciclo_periodo`.

**`DELETE /ciclos-periodos/{id}`**
- Rechaza si la fila tiene hijos en `temario`, `docente_ciclo_periodo` o `estudiante_ciclo_periodo` — exponer cuál de los tres existe para orientar al usuario.

**`POST /periodos-academicos/{id}/clonar`**
- Body: `{ periodo_origen_id }`. En una **transacción**:
  1. Para cada `ciclo_periodo` del período origen, crea el `ciclo_periodo` equivalente en el período destino (si no existe ya).
  2. Clona el `temario` completo (árbol recursivo: primero nodos raíz, luego hijos manteniendo el `padre_id` mapeado a los nuevos `id`).
  3. Clona `docente_ciclo_periodo` (mismos docentes, nuevo `ciclo_periodo_id`).
  4. **No** clona `estudiante_ciclo_periodo` — la matrícula es manual o vía "Avanzar estudiantes".
- Rechaza si el período destino ya tiene `ciclo_periodo` para alguno de los ciclos del origen (protege contra clonar dos veces).

### Docentes por ciclo+período (`docente_ciclo_periodo`)

**`GET /ciclos-periodos/{id}/docentes`**
- Devuelve la lista de docentes asignados al ciclo+período, con conteo de tutorados cada uno (balance de carga).
- Respuesta: `[ { docente_id, nombre_completo, email, n_tutorados } ]`.

**`POST /ciclos-periodos/{id}/docentes`**
- Body: `{ docente_id }`. Valida que el docente exista y no esté ya asignado a este `ciclo_periodo` (UNIQUE). Inserta la fila.

**`DELETE /ciclos-periodos/{id}/docentes/{docente_id}`**
- Rechaza si el docente tiene estudiantes en `estudiante_ciclo_periodo` con ese `ciclo_periodo_id` — no se puede retirar un tutor que tiene tutorados activos.

**`PUT /ciclos-periodos/{id}/docentes`**
- Body: `{ docente_ids: [] }`. Sincroniza la lista completa en transacción: calcula diferencia entre el conjunto actual y el nuevo; rechaza si algún docente a retirar tiene tutorados; inserta los nuevos; elimina los que salen.

### Temario (`temario`)

**`GET /ciclos-periodos/{id}/temario`**
- Devuelve el árbol completo ordenado con `WITH RECURSIVE`. La respuesta es una lista anidada:
  ```json
  [
    { "id": 1, "tema": "Adaptación universitaria", "orden": 1, "padre_id": null,
      "hijos": [
        { "id": 3, "tema": "Integración social", "orden": 1, "padre_id": 1, "hijos": [] },
        { "id": 4, "tema": "Manejo del tiempo",  "orden": 2, "padre_id": 1, "hijos": [] }
      ]
    },
    { "id": 2, "tema": "Bienestar personal", "orden": 2, "padre_id": null, "hijos": [...] }
  ]
  ```

**`POST /ciclos-periodos/{id}/temario`**
- Body: `{ tema, orden, padre_id? }`. Si `padre_id` viene, valida que el ítem padre pertenezca al mismo `ciclo_periodo_id`. Inserta la fila.

**`PUT /temario/{id}`**
- Edita `tema`, `orden` y/o `padre_id`. Si mueve el ítem (`padre_id` cambia), valida que el nuevo padre sea del mismo `ciclo_periodo` y que no sea descendiente del ítem a mover (ciclos en el árbol).

**`DELETE /temario/{id}`**
- Body opcional: `{ modo: "rechazar" | "cascada" }` (default `"rechazar"`).
- `rechazar`: devuelve `422` si el ítem tiene hijos directos — el admin decide qué hacer con ellos primero.
- `cascada`: elimina el subárbol completo en transacción (primero hojas, luego padres — usando la consulta recursiva para encontrar todos los descendientes).

**`PUT /ciclos-periodos/{id}/temario/reordenar`**
- Body: `[ { id, orden } ]`. Aplica todos los cambios de `orden` en una sola transacción para evitar conflictos temporales de unicidad. Valida que todos los `id` pertenezcan al `ciclo_periodo` indicado.

### Matrículas de tutoría (`estudiante_ciclo_periodo`)

**`GET /ciclos-periodos/{id}/estudiantes`**
- Lista paginada de estudiantes matriculados. Incluye: datos del estudiante (nombre, código, foto), nombre del tutor asignado, y conteo de fichas llenadas (borrador + enviadas). Filtros: `?docente_id=`, `?buscar=`.

**`POST /ciclos-periodos/{id}/estudiantes`**
- Body: `{ estudiante_id, docente_id }`.
- Valida que el estudiante no tenga ya matrícula **en ningún ciclo del mismo período académico** (regla: un estudiante, un ciclo por período). Obtiene el `periodo_academico_id` derivando desde `ciclo_periodo`.
- Valida que el `docente_id` esté en `docente_ciclo_periodo` para este `ciclo_periodo_id`.
- Inserta la fila.

**`PATCH /ciclos-periodos/{id}/estudiantes/{estudiante_id}`**
- Body: `{ docente_id }`. Cambia solo el tutor. Valida que el nuevo docente esté asignado al ciclo+período. No afecta fichas llenadas ya creadas.

**`DELETE /ciclos-periodos/{id}/estudiantes/{estudiante_id}`**
- Rechaza si el estudiante tiene `ficha_llenada` para este `ciclo_periodo` (protege el historial).

**`GET /periodos-academicos/{id}/avanzar-estudiantes/propuesta`**
- Parámetro requerido: `periodo_origen_id` (del cual se toma la matrícula actual).
- Solo considera estudiantes con `estado = 'activo'` (los `egresado`/`retirado` no entran).
- Para cada estudiante del período origen, arma una **propuesta editable** con una
  `accion` sugerida:
  1. Obtiene el `ciclo` actual y busca el siguiente por `orden` (`orden` actual + 1, ciclo activo).
  2. Obtiene el `ciclo_periodo_id` del ciclo destino en el período destino (el `{id}` de la ruta).
  3. Propone el mismo `docente_id` si sigue asignado en el ciclo destino; si no, marca `sin_tutor` (el admin elige uno del pool).
  4. **`accion` sugerida:** `avanzar` si hay ciclo siguiente; `egresar` si está en el último ciclo (sin `orden` superior). El admin puede cambiarla a `repetir` (mismo ciclo) o `excluir`.
- El sistema **propone, no decide** (no hay notas de aprobado/jalado en el modelo). Respuesta incluye balance de carga propuesto por docente.

**`POST /periodos-academicos/{id}/avanzar-estudiantes/confirmar`**
- Body: `[ { estudiante_id, accion, ciclo_periodo_id?, docente_id? } ]` con
  `accion ∈ { avanzar, repetir, egresar, excluir }`.
- En una sola **transacción** (todo o nada):
  - `avanzar` / `repetir` → inserta `estudiante_ciclo_periodo` con el
    `ciclo_periodo_id` + `docente_id` indicados. Valida: sin matrícula previa en
    el período destino; `docente_id` presente en `docente_ciclo_periodo` de ese
    `ciclo_periodo_id`.
  - `egresar` → **no** crea matrícula; actualiza `estudiante.estado = 'egresado'`.
  - `excluir` → no hace nada (el estudiante queda como estaba).
- No modifica el período origen.

---

## Módulo 3 — Fichas

### Catálogos de fichas

**`/tipos-ficha` [CRUD]**
- `store`/`update`: `clave` y `nombre` únicos. La `clave` no debería editarse si ya tiene `ficha` referenciada (el código la usa como identificador estable) — responder `422` con aviso.
- `destroy`: rechaza si existe alguna `ficha` con ese `tipo_ficha_id` — usar `activo=0`.

**`/areas` [CRUD]**
- `store`/`update`: `clave` y `nombre` únicos. La `clave` la usa el modelo de IA en su respuesta JSON — no cambiarla una vez creada.
- `destroy`: rechaza si tiene `pregunta` o `alerta_ia` referenciada.

### Plantillas de fichas (`ficha`)

**`POST /fichas`**
- Body: `{ tipo_ficha_id, nombre, descripcion?, activo? }`. Valida que `tipo_ficha_id` exista y esté activo. Crea la plantilla sin preguntas.

**`PUT /fichas/{id}`**
- Edita encabezado. **No** toca preguntas — esas tienen su propio endpoint.

**`DELETE /fichas/{id}`**
- Rechaza si tiene `ficha_ciclo_periodo` referenciada (ya fue asignada a algún ciclo+período). Usar `PATCH /fichas/{id}/estado` para desactivarla.

**`PATCH /fichas/{id}/estado`**
- Body: `{ activo: 0 | 1 }`. Activa o desactiva la plantilla.
- Una ficha inactiva no puede asignarse a nuevos `ciclo_periodo`, pero las asignaciones y llenados existentes no se afectan.

**`POST /fichas/{id}/duplicar`**
- En transacción:
  1. Crea nueva `ficha` con `nombre = "Copia de {nombre}"` y `activo = 1`.
  2. Clona cada `pregunta` (con `ficha_id` apuntando a la nueva ficha, nuevo `id`).
  3. Clona cada `opcion_pregunta` usando el mapa `old_pregunta_id → new_pregunta_id`.
- Devuelve la nueva `ficha` con sus preguntas.

### Preguntas de plantilla

**`POST /fichas/{id}/preguntas`**
- Body: `{ area_id, tipo_pregunta, enunciado, orden, escala_min?, escala_max?, etiqueta_min?, etiqueta_max?, opciones?: [{ texto, orden }] }`.
- Valida que `tipo_pregunta` sea una de las 5 constantes.
- Si `tipo_pregunta = 'alternativa_unica'` o `'respuesta_multiple'`: `opciones` es obligatorio y debe tener ≥ 2 ítems.
- Si `tipo_pregunta = 'si_no'`: crea automáticamente dos filas en `opcion_pregunta` (`"Sí"` orden 1, `"No"` orden 2), sin recibir `opciones` del caller.
- Si `tipo_pregunta = 'escala'`: `escala_min` y `escala_max` son obligatorios; valida `escala_min < escala_max`; rango 1–10.
- Si `tipo_pregunta = 'texto_abierto'`: sin campos extra.
- Todo en transacción (pregunta + opciones).

**`PUT /preguntas/{id}`**
- Edita el enunciado, área, tipo y opciones.
- Si cambia el tipo (ej. de `alternativa_unica` a `escala`): elimina todas las `opcion_pregunta` previas e inserta las del nuevo tipo, en transacción.
- Rechaza cambio de tipo si la `ficha` padre ya tiene `ficha_ciclo_periodo` con `ficha_llenada` asociadas (el historial quedaría inconsistente).

**`DELETE /preguntas/{id}`**
- Elimina la pregunta y sus `opcion_pregunta` en cascada.
- Rechaza si la `ficha` padre ya tiene `ficha_ciclo_periodo` con `ficha_llenada` (respuestas de estudiantes ya existen).

**`PUT /fichas/{id}/preguntas/reordenar`**
- Body: `[ { id, orden } ]`. Valida que todos los `id` sean preguntas de esta `ficha`. Aplica en transacción.

### Asignación a ciclo+período (`ficha_ciclo_periodo`)

**`GET /ciclos-periodos/{cp_id}/fichas`**
- Lista las fichas asignadas al ciclo+período. Incluye: nombre de la ficha, tipo, nº de preguntas y conteo de `ficha_llenada` por estado (`sin_abrir` / `borrador` / `enviada`).
- Permiso: `periodos.ver`.

**`GET /ciclos-periodos/{cp_id}/fichas/{fcp_id}`**
- Devuelve la copia clonada (`ficha_ciclo_periodo`) con su árbol de preguntas y opciones propias (las del clon, no las de la plantilla original).
- Permiso: `periodos.ver`.

**`POST /ciclos-periodos/{cp_id}/fichas`**
- Body: `{ ficha_id }`. Valida que la `ficha` exista y esté `activo=1`.
- En transacción (orden crítico para integridad del mapa):
  1. Crea `ficha_ciclo_periodo` (`ficha_id`, `ciclo_periodo_id`).
  2. Clona cada `pregunta` de la plantilla hacia el clon (mismo campo dual: `ficha_ciclo_periodo_id` lleno, `ficha_id = NULL`). Guarda mapa `{ old_pregunta_id → new_pregunta_id }`.
  3. Clona cada `opcion_pregunta` usando el mapa del paso 2.
- Devuelve el `ficha_ciclo_periodo` con sus preguntas clonadas.

**`DELETE /ciclos-periodos/{cp_id}/fichas/{fcp_id}`**
- Rechaza si existen `ficha_llenada` para esta `ficha_ciclo_periodo_id` (hay respuestas de estudiantes — el historial no se puede borrar). Mostrar cuántas.

### Llenado por el estudiante (`ficha_llenada` + `respuesta`)

**`GET /mis-fichas`**
- Obtiene el `ciclo_periodo` activo del estudiante autenticado: busca en `estudiante_ciclo_periodo` las filas del estudiante, hace join a `ciclo_periodo → periodo_academico` y filtra por `periodo_academico.activo = 1`.
- Devuelve todas las `ficha_ciclo_periodo` de ese `ciclo_periodo`, enriquecidas con el estado de la `ficha_llenada` del estudiante:
  ```json
  {
    "id": 10,
    "nombre": "Ficha diagnóstica inicial",
    "tipo_ficha": { "id": 1, "nombre": "Diagnóstica" },
    "n_preguntas": 5,
    "estado_llenado": "borrador",
    "ficha_llenada_id": 42,
    "fecha_enviado": null
  }
  ```
  Si no existe `ficha_llenada`, `estado_llenado = "sin_abrir"` y `ficha_llenada_id = null`.

**`POST /mis-fichas/{fcp_id}/comenzar`**
- Busca la `ficha_llenada` del estudiante autenticado para esa `fcp_id` (el UNIQUE `(estudiante_id, ficha_ciclo_periodo_id)` garantiza como máximo una fila):
  - Si `estado = 'enviada'` → `409` "Ya enviaste esta ficha."
  - Si `estado = 'borrador'` → `200` con la fila existente (idempotente — el estudiante puede recargar sin crear duplicados).
  - Si no existe → crea `ficha_llenada` con `estado = 'borrador'`.
- Devuelve `{ ficha_llenada_id, preguntas: [...con opciones...] }`.

**`PUT /fichas-llenadas/{fl_id}/respuestas`**
- Valida que el `ficha_llenada_id` pertenezca al estudiante autenticado y que `estado = 'borrador'` (rechaza con `409` si ya fue enviada).
- Upsert incremental: por cada ítem del body, hace `INSERT ... ON DUPLICATE KEY UPDATE` en `respuesta` (usando el UNIQUE `ficha_llenada_id + pregunta_id`). Para opciones: elimina las `respuesta_opcion` previas de esa `respuesta` e inserta las nuevas — todo en transacción por ítem.
- Devuelve `{ guardadas: N }`.

**`POST /fichas-llenadas/{fl_id}/enviar`**
- Valida que pertenezca al estudiante y que `estado = 'borrador'`.
- Valida que exista exactamente una `respuesta` por cada `pregunta` del `ficha_ciclo_periodo` (todas respondidas).
- En transacción: `UPDATE ficha_llenada SET estado='enviada', fecha_enviado=NOW()`.
- Encola un **job asíncrono** que construye el contexto para la IA y procesa la alerta (Módulo 4). No bloquea la respuesta.
- Devuelve `{ enviada: true, fecha_enviado: "2026-03-18T14:23:05.000000Z" }`.

### Vista docente — revisión

**`GET /mis-tutorados/fichas`**
- Devuelve el resumen de fichas asignadas a los `ciclo_periodo` del docente autenticado (período activo), con conteo de estudiantes por estado de llenado (`sin_abrir` / `borrador` / `enviada`).
- Permite al docente ver de un vistazo qué fichas tienen pendientes sus tutorados sin entrar a cada una.

**`GET /ciclos-periodos/{cp_id}/fichas/{fcp_id}/tutorados`**
- Solo accesible si el `docente_id` autenticado está en `docente_ciclo_periodo` para ese `cp_id`.
- Devuelve lista de estudiantes del docente en ese `ciclo_periodo` (de `estudiante_ciclo_periodo`) cruzada con su `ficha_llenada` para esa `fcp_id`:
  ```json
  [
    {
      "estudiante": { "id": 7, "nombre_completo": "Ana Lucía Quispe Mamani", "codigo": "2022-AD-0021" },
      "estado": "enviada",
      "fecha_enviado": "2026-03-18T14:23:05.000000Z",
      "ficha_llenada_id": 42
    },
    {
      "estudiante": { "id": 8, "nombre_completo": "Carlos Renzo Huanca Flores", "codigo": "2022-AD-0034" },
      "estado": "borrador",
      "fecha_enviado": null,
      "ficha_llenada_id": 43
    },
    {
      "estudiante": { "id": 9, "nombre_completo": "Diana Paola Torres Sánchez", "codigo": "2022-AD-0047" },
      "estado": "sin_abrir",
      "fecha_enviado": null,
      "ficha_llenada_id": null
    }
  ]
  ```

**`GET /fichas-llenadas/{fl_id}`**
- Valida que el docente autenticado sea el tutor del estudiante en ese `ciclo_periodo`. Rechaza `403` si no.
- Devuelve la ficha llenada completa: preguntas (del clon), respuestas del estudiante, opciones marcadas y `observaciones_tutor` por cada respuesta. Ver formato JSON en `BD-BACKEND.md`.

**`PATCH /fichas-llenadas/{fl_id}/respuestas/{respuesta_id}/observacion`**
- Body: `{ observaciones_tutor: "texto..." }`. Valida autorización del docente (mismo criterio que el `GET`). Actualiza solo el campo `observaciones_tutor` en la fila `respuesta`.

**`PATCH /fichas-llenadas/{fl_id}/marcar-revisada`**
- Valida autorización del docente. Requiere que `estado = 'enviada'`. Marca el campo `revisada = 1` en `ficha_llenada`. Idempotente: si ya estaba revisada, devuelve `200` sin error.

---

## Módulo 4 — IA / Alertas / Derivación

### Catálogos de M4

**`GET /entidades-receptoras`**
- Devuelve lista paginada. Filtros: `?buscar=` (sobre `nombre`), `?activo=`.
- Requiere autenticación. Todos los usuarios que consultan esta lista (docentes, receptores, admin) ya están autenticados. Permiso: `catalogos.gestionar` para admin; cualquier usuario autenticado puede leerla (el docente la necesita al crear una derivación).

**`POST /entidades-receptoras`**
- Valida `clave` única y `nombre` único.
- La `clave` es usada por la IA en su respuesta JSON — debe ser estable (`psicologia`, `bienestar`, `salud`). Advertir al admin que cambiarla después rompe el mapeo del modelo de IA.

**`PUT /entidades-receptoras/{id}`**
- Si `clave` se intenta cambiar y ya existen filas en `alerta_ia` (campo `entidad_receptora_sugerida_id`) o `derivacion` con esta entidad → rechazar `422`: "La clave no puede cambiarse; existen alertas o derivaciones históricas vinculadas a esta entidad."
  - Nota: `alerta_ia` y `derivacion` almacenan FK (no el texto de la clave), por lo que los registros históricos no se corrompen si la clave cambia. La restricción es un **guard conservador** para evitar que el modelo de IA siga generando la clave antigua sin que el administrador lo sepa. Si la entidad no tiene historial, el cambio es seguro y se permite.
  - `tipo_estado_derivacion` **no** es una condición de bloqueo: esos registros usan FK y no dependen del texto de la clave.
- Permite cambiar `nombre` y `descripcion` libremente.

**`DELETE /entidades-receptoras/{id}`**
- Rechaza `422` si existen filas en `derivacion` o `tipo_estado_derivacion` con `entidad_receptora_id` apuntando a ella.
- Recomendar `activo = 0` en lugar de eliminar.

**`PATCH /entidades-receptoras/{id}/estado`**
- Cambia `activo`. Desactivar no afecta derivaciones existentes — solo impide crear nuevas hacia esa entidad.

---

**`GET /entidades-receptoras/{id}/estados-derivacion`**
- Devuelve los estados de esa entidad, ordenados por `orden ASC`. Incluye `activo` para que la UI muestre cuáles están disponibles.

**`POST /entidades-receptoras/{id}/estados-derivacion`**
- Valida `clave` única **dentro de la entidad** (`UNIQUE entidad_receptora_id + clave`).
- Valida `orden` único **dentro de la entidad**.
- Si `orden` no se envía, asigna el siguiente disponible (`MAX(orden) + 1` para esa entidad).

**`PUT /estados-derivacion/{id}`**
- Si se intenta cambiar `clave` y existen `derivacion.tipo_estado_derivacion_id` apuntando a esta fila, rechazar `422`.
- Si se cambia `orden`, verificar unicidad dentro de la misma entidad.

**`DELETE /estados-derivacion/{id}`**
- Rechaza `422` si hay derivaciones cuyo `tipo_estado_derivacion_id` es este estado.
- Recomendar `activo = 0`.

**`PUT /entidades-receptoras/{id}/estados-derivacion/reordenar`**
- Body: `[{ "id": 3, "orden": 1 }, { "id": 4, "orden": 2 }, ...]`
- Valida que todos los `id` pertenezcan a la misma `entidad_receptora_id`. Rechaza `422` si alguno no corresponde.
- Aplica en una sola transacción. Primero asigna órdenes temporales para evitar conflictos de UNIQUE (`orden = orden + 1000`), luego aplica los definitivos.

---

### Alertas IA

> Las alertas **no se crean por API pública**: las genera el sistema automáticamente
> mediante un **job async** que se dispara al recibir `POST /fichas-llenadas/{fl_id}/enviar`.
> El job reconstruye la ficha (preguntas + respuestas + historial del estudiante),
> llama al modelo de IA, parsea su respuesta JSON y hace `INSERT` en `alerta_ia`
> por cada objeto del array `alertas`. El docente y el admin solo leen y gestionan.

**`GET /mis-alertas`** _(docente autenticado)_
- Filtra automáticamente por `docente_id` (el id del perfil `docente` del usuario autenticado).
- Parámetros opcionales: `?estado=pendiente|revisada|derivada|descartada`, `?nivel_alerta=Baja|Media|Alta`, `?area_id=`, `?estudiante_id=`, `?page=`.
- Devuelve el listado con el contexto necesario: nombre del estudiante, nombre de la ficha, área, nivel, justificación resumida, estado y si ya tiene una derivación creada (`derivacion_id`).
- El `meta` incluye `por_estado: { pendiente, revisada, derivada, descartada }` para pintar los contadores en el dashboard del docente.

**`GET /mis-alertas/{id}`** _(docente autenticado)_
- Valida que `alerta_ia.docente_id` coincida con el docente autenticado. Si no → `403`.
- Devuelve el detalle completo: datos del estudiante, ficha llenada (fecha de envío), área, nivel, justificación completa de la IA, entidad sugerida y estado.

**`PATCH /mis-alertas/{id}/revisar`** _(docente autenticado)_
- Valida autorización (mismo criterio que `GET`).
- Valida que `estado = 'pendiente'`. Si ya es `revisada`, `derivada` o `descartada` → `422` "La alerta ya fue procesada."
- Actualiza `estado → 'revisada'`.

**`PATCH /mis-alertas/{id}/descartar`** _(docente autenticado)_
- Valida autorización (mismo criterio).
- Rechaza `422` si la alerta ya tiene una `derivacion` asociada (`alerta_ia_id` en alguna fila de `derivacion`): "No se puede descartar una alerta que ya generó una derivación."
- Actualiza `estado → 'descartada'`.

**`GET /alertas`** _(admin)_
- Sin filtro automático por docente — el admin ve todo.
- Filtros: `?docente_id=`, `?estudiante_id=`, `?estado=`, `?nivel_alerta=`, `?area_id=`, `?ciclo_periodo_id=`, `?fecha_desde=`, `?fecha_hasta=`, `?page=`.
- Mismo formato de respuesta que `/mis-alertas` pero sin restricción de visibilidad.

**`GET /alertas/{id}`** _(admin)_
- Sin restricción de docente. Mismo detalle que `/mis-alertas/{id}`.

---

### Derivaciones

**`POST /derivaciones`** _(docente autenticado, permiso `derivaciones.crear`)_

Flujo completo en una sola transacción:

1. **Validar estudiante**: `estudiante_id` debe corresponder a un tutorado del docente autenticado en el `ciclo_periodo` activo (verificar en `estudiante_ciclo_periodo` donde `docente_id` = docente autenticado y el `periodo_academico.activo = 1`).
2. **Validar entidad**: `entidad_receptora_id` debe existir y estar `activo = 1`.
3. **Validar alerta** (si `alerta_ia_id` viene en el body):
   - La alerta debe existir y pertenecer a un tutorado del docente.
   - `estado` debe ser `pendiente` o `revisada` — rechaza `422` si es `derivada` o `descartada`.
4. **Determinar estado inicial**: buscar el primer estado activo de la entidad destino (`SELECT id FROM tipo_estado_derivacion WHERE entidad_receptora_id = ? AND activo = 1 ORDER BY orden ASC LIMIT 1`). Si la entidad no tiene estados activos → `422` "La entidad receptora no tiene estados configurados."
5. **Crear la derivación**: `INSERT INTO derivacion (estudiante_id, docente_id, entidad_receptora_id, alerta_ia_id, tipo_estado_derivacion_id, motivo)`.
6. **Actualizar la alerta** (si `alerta_ia_id` viene): `UPDATE alerta_ia SET estado = 'derivada' WHERE id = ?`.

Responde `201` con el detalle de la derivación creada.

---

**`GET /derivaciones`** _(docente / receptor / admin)_

El filtro aplicado depende del rol del usuario autenticado:
- Si tiene `docente` profile → `WHERE docente_id = {docente autenticado}`
- Si tiene `receptor` profile → `WHERE entidad_receptora_id = {receptor.entidad_receptora_id}`
- Si es admin → sin filtro por defecto

Parámetros opcionales:
- `?entidad_receptora_id=` (admin puede filtrar por entidad; receptor no necesita pasarlo — ya se filtra solo)
- `?tipo_estado_derivacion_id=` — filtrar por estado actual
- `?estudiante_id=`
- `?docente_id=` (solo admin)
- `?fecha_desde=`, `?fecha_hasta=` (sobre `derivacion.created_at`)
- `?page=`

Devuelve lista con: datos del estudiante, docente creador, entidad destino, estado actual, motivo (truncado a 120 chars para el listado), fecha de creación.

---

**`GET /derivaciones/{id}`** _(docente creador / receptor de la entidad / admin)_

Control de acceso:
- Si el autenticado es docente: verificar que `derivacion.docente_id` sea su perfil.
- Si el autenticado es receptor: verificar que `derivacion.entidad_receptora_id` sea la entidad de su perfil `receptor`.
- Si es admin: acceso libre.
- En cualquier otro caso → `403`.

Devuelve el detalle completo (ver formato JSON en `BD-BACKEND.md`).

---

**`PATCH /derivaciones/{id}/estado`** _(receptor de la entidad / admin)_

1. **Validar acceso**: el receptor autenticado debe pertenecer a `derivacion.entidad_receptora_id`. Si no → `403`.
2. **Validar el nuevo estado**: el `tipo_estado_derivacion_id` enviado debe:
   - Existir en la BD.
   - Pertenecer a la misma `entidad_receptora_id` de la derivación: `SELECT id FROM tipo_estado_derivacion WHERE id = ? AND entidad_receptora_id = ?`. Si no coincide → `422` "El estado seleccionado no pertenece a la entidad de esta derivación."
   - Estar `activo = 1`. Si está inactivo → `422`.
3. **Actualizar**: `UPDATE derivacion SET tipo_estado_derivacion_id = ?, nota = ?, updated_at = NOW() WHERE id = ?`.
   - La `nota` sobreescribe la anterior. El historial de cambios (quién, cuándo, de qué estado a cuál, nota anterior) queda en la tabla `auditoria` automáticamente.

Responde `200` con la derivación actualizada.

---

**Notas de seguridad del módulo:**
- Un estudiante **nunca ve** sus propias alertas ni derivaciones — la confidencialidad protege el proceso de tutoría.
- El docente solo ve alertas y derivaciones de sus **propios tutorados** (verificar siempre contra `estudiante_ciclo_periodo`).
- El receptor solo ve derivaciones para **su entidad** (verificar siempre contra `receptor.entidad_receptora_id`).
- Ningún endpoint de este módulo expone datos de otros docentes o entidades.
