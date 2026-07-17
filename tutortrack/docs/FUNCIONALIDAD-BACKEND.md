# Funcionalidad del Backend — TutorTrack

Descripción **textual** de qué hace cada endpoint: validaciones, reglas de
negocio, transacciones y permisos. Es la guía de implementación para el
backend (Laravel + MySQL). **No incluye diseño ni frontend** — eso se
trabaja aparte.

- Esquema de tablas y contrato de rutas: [`BD-BACKEND.md`](./BD-BACKEND.md).
- Razonamiento de dominio: [`MODELO-DATOS.md`](./MODELO-DATOS.md).

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

**`DELETE /docentes/{id}`** — **soft delete** del `docente` (`deleted_at`).
No borra el `usuario` (puede seguir siendo estudiante u otro rol). Opcional:
retirar el rol `docente_tutor`.

**`/estudiantes`** — análogo a docentes:
- `POST`: transacción usuario + `estudiante` + rol `estudiante`. Valida
  `codigo_universitario` **único** y obligatorio.
- `GET` lista, `PUT` edita, `DELETE` soft delete del perfil.

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

<!-- Próximo: Módulo 2 — Estructura académica -->
