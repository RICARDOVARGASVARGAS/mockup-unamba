# BD + Backend — TutorTrack (versión final para implementar)

Este documento es el **qué ejecutable**: esquema de base de datos (MySQL),
reglas de funcionalidad y APIs probables del backend, módulo por módulo.
El **porqué** (razonamiento, decisiones de dominio) vive en
[`MODELO-DATOS.md`](./MODELO-DATOS.md) y no se duplica aquí.

> Frontend: fuera de alcance de este doc — el diseño ya está en la maqueta.

---

## Convenciones fijadas (aplican a TODO el esquema)

- **Motor:** MySQL / MariaDB · motor `InnoDB` · charset `utf8mb4_unicode_ci`.
- **PK:** `id` `BIGINT UNSIGNED AUTO_INCREMENT` (estilo Laravel `id()`).
- **Auditoría:** `created_at` y `updated_at` `TIMESTAMP NULL` en **todas** las
  tablas (estilo Laravel `timestamps()`).
- **FKs:** `{entidad}_id` `BIGINT UNSIGNED` con su `FOREIGN KEY` explícita.
- **Booleanos** (`activo`, etc.): `TINYINT(1)`.
- **Sin `ENUM` en columnas:** los "tipos" se modelan como tablas catálogo
  (coincide con la decisión de "catálogo abierto").
- **Borrado lógico:** `deleted_at` `TIMESTAMP NULL` (soft delete estilo
  Laravel) en tablas de **entidad con historial** (ej. `usuario`); los
  **catálogos** usan `activo`. `activo` (habilitar/deshabilitar) y
  `deleted_at` (eliminar/ocultar) **no son lo mismo** y pueden coexistir.
- **Nombres:** español snake_case, en **singular** (`usuario`, `ciclo_periodo`,
  `ficha_llenada`). Se traducen a inglés al implementar de verdad.
- **APIs:** REST orientado a recursos; cada endpoint documenta el **permiso**
  que exige (enlaza con el RBAC). Nivel contrato, no OpenAPI completo.

---

## Índice de módulos

1. **Identidad y acceso** — `tipo_documento`, `usuario`, `rol`, `permiso`,
   `usuario_rol`, `rol_permiso`, `grado_academico`, `especialidad`,
   `docente`, `estudiante`. _(✔ completo — 10 tablas)_
2. **Estructura académica** — `ciclo`, `periodo_academico`, `ciclo_periodo`,
   `docente_ciclo_periodo`, `temario`, `estudiante_ciclo_periodo`.
   _(en progreso — `ciclo`, `periodo_academico` ✔)_
3. **Fichas** — `tipo_ficha`, `tipo_pregunta`, `area`, `ficha`, `pregunta`,
   `opcion_pregunta`, `ficha_ciclo_periodo`, `ficha_llenada`, `respuesta`,
   `respuesta_opcion`. _(pendiente)_
4. **IA / Alertas / Derivación** — `alerta_ia`, `entidad_receptora`,
   `derivacion`, `estado_derivacion`, `tipo_estado_derivacion`. _(pendiente)_

**Transversales** — `auditoria` (bitácora de cambios).

---

## Módulo 1 — Identidad y acceso

### `tipo_documento` (catálogo)

Tipo de documento de identidad. Se crea **antes** de `usuario`, que lo
referencia. La `clave` es el código estable que el backend usa para validar
por tipo (ej. `DNI` = 8 dígitos).

| Campo | Tipo | Nulo | Notas |
|-------|------|:----:|-------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `clave` | `VARCHAR(10)` | NO | **UNIQUE** — `DNI`, `CE`, `PAS` |
| `nombre` | `VARCHAR(60)` | NO | **UNIQUE** — "DNI", "Carné de Extranjería", "Pasaporte" |
| `activo` | `TINYINT(1)` | NO | DEFAULT `1` |
| `created_at` | `TIMESTAMP` | SÍ | |
| `updated_at` | `TIMESTAMP` | SÍ | |

```sql
CREATE TABLE tipo_documento (
  id          BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  clave       VARCHAR(10)      NOT NULL,
  nombre      VARCHAR(60)      NOT NULL,
  activo      TINYINT(1)       NOT NULL DEFAULT 1,
  created_at  TIMESTAMP        NULL,
  updated_at  TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tipo_documento_clave (clave),
  UNIQUE KEY uq_tipo_documento_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabla 1 · `usuario`

Identidad de login, **compartida** por todos los perfiles (docente,
estudiante, admin, receptor). El acceso NO depende de esta tabla — lo
maneja el RBAC (`rol`/`permiso`). La `foto_perfil_url` vive aquí porque es
de la identidad (todo usuario puede tener foto, incluido el admin).

| Campo | Tipo | Nulo | Notas |
|-------|------|:----:|-------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `tipo_documento_id` | `BIGINT UNSIGNED` | NO | FK → `tipo_documento(id)` (default DNI) |
| `documento` | `VARCHAR(15)` | NO | número; único **en combinación con** `tipo_documento_id` |
| `nombres` | `VARCHAR(100)` | NO | uno o varios nombres de pila (ej. "Juan Carlos") |
| `apellido_paterno` | `VARCHAR(60)` | NO | |
| `apellido_materno` | `VARCHAR(60)` | NO | |
| `email` | `VARCHAR(150)` | NO | **UNIQUE** — correo de **acceso** (login, institucional) |
| `email_personal` | `VARCHAR(150)` | SÍ | correo personal, solo data — **no** único, no es login |
| `contrasena` | `VARCHAR(255)` | NO | hash bcrypt, nunca texto plano |
| `foto_perfil_url` | `VARCHAR(255)` | SÍ | no todos tienen foto |
| `sexo` | `CHAR(1)` | SÍ | 'M' / 'F' |
| `fecha_nacimiento` | `DATE` | SÍ | |
| `celular_principal` | `VARCHAR(20)` | SÍ | contacto principal |
| `celular_secundario` | `VARCHAR(20)` | SÍ | contacto alterno |
| `activo` | `TINYINT(1)` | NO | DEFAULT `1` — habilita/deshabilita el acceso |
| `remember_token` | `VARCHAR(100)` | SÍ | "Recordarme" del login (estándar Laravel) |
| `created_at` | `TIMESTAMP` | SÍ | auditoría |
| `updated_at` | `TIMESTAMP` | SÍ | auditoría |
| `deleted_at` | `TIMESTAMP` | SÍ | soft delete (nunca hard-delete: tiene FKs históricas) |

**Índices:** PK (`id`) · **UNIQUE (`tipo_documento_id`, `documento`)** · UNIQUE (`email`) · índice en `tipo_documento_id`.

**Notas de negocio:**
- El `email` es único, y el `documento` es único **por tipo** (UNIQUE de
  `tipo_documento_id` + `documento`): el mismo número puede existir como DNI
  y como pasaporte de personas distintas. `nombres`, `apellidos` y `foto`
  pueden repetirse.
- `email` = correo de **acceso** (login, institucional, único). `email_personal`
  = solo contacto, **no** único. El usuario puede tener hasta dos celulares
  (`celular_principal`, `celular_secundario`), ambos opcionales.
- Como `email` y (`tipo_documento_id`, `documento`) son UNIQUE, el valor de
  un usuario con `deleted_at` queda **reservado** (no se reusa).
- `contrasena` se guarda hasheada por la capa de aplicación; la BD solo
  almacena el hash.

```sql
CREATE TABLE usuario (
  id                BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  tipo_documento_id BIGINT UNSIGNED  NOT NULL,
  documento         VARCHAR(15)      NOT NULL,
  nombres           VARCHAR(100)     NOT NULL,
  apellido_paterno  VARCHAR(60)      NOT NULL,
  apellido_materno  VARCHAR(60)      NOT NULL,
  email              VARCHAR(150)    NOT NULL,
  email_personal     VARCHAR(150)    NULL,
  contrasena         VARCHAR(255)    NOT NULL,
  foto_perfil_url    VARCHAR(255)    NULL,
  sexo               CHAR(1)         NULL,
  fecha_nacimiento   DATE            NULL,
  celular_principal  VARCHAR(20)     NULL,
  celular_secundario VARCHAR(20)     NULL,
  activo             TINYINT(1)      NOT NULL DEFAULT 1,
  remember_token    VARCHAR(100)     NULL,
  created_at        TIMESTAMP        NULL,
  updated_at        TIMESTAMP        NULL,
  deleted_at        TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuario_documento (tipo_documento_id, documento),
  UNIQUE KEY uq_usuario_email (email),
  KEY idx_usuario_tipo_documento (tipo_documento_id),
  CONSTRAINT fk_usuario_tipo_documento FOREIGN KEY (tipo_documento_id) REFERENCES tipo_documento (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabla 2 · `rol`

Catálogo de roles del RBAC. Un usuario puede tener uno o más roles
(vía `usuario_rol`). La `clave` es el identificador estable para el
backend; el `nombre` es el texto editable que ve el admin.

| Campo | Tipo | Nulo | Notas |
|-------|------|:----:|-------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `clave` | `VARCHAR(50)` | NO | **UNIQUE** — código estable (`admin`, `docente_tutor`, `estudiante`, `psicologo`) |
| `nombre` | `VARCHAR(80)` | NO | **UNIQUE** — nombre visible ("Administrador", "Docente-Tutor") |
| `descripcion` | `VARCHAR(255)` | SÍ | para la pantalla de roles |
| `protegido` | `TINYINT(1)` | NO | DEFAULT `0` — si es `1`, el rol es crítico (ej. Administrador) y la UI no permite borrarlo/editarlo |
| `activo` | `TINYINT(1)` | NO | DEFAULT `1` — desactivar sin borrar |
| `created_at` | `TIMESTAMP` | SÍ | |
| `updated_at` | `TIMESTAMP` | SÍ | |

**Índices:** PK (`id`) · UNIQUE (`clave`) · UNIQUE (`nombre`).

```sql
CREATE TABLE rol (
  id           BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  clave        VARCHAR(50)      NOT NULL,
  nombre       VARCHAR(80)      NOT NULL,
  descripcion  VARCHAR(255)     NULL,
  protegido    TINYINT(1)       NOT NULL DEFAULT 0,
  activo       TINYINT(1)       NOT NULL DEFAULT 1,
  created_at   TIMESTAMP        NULL,
  updated_at   TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rol_clave (clave),
  UNIQUE KEY uq_rol_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabla 3 · `permiso`

Catálogo de permisos. Los define el desarrollador y se **siembran**
(no se activan/desactivan desde el admin) → **sin `activo`**. La `clave`
es lo que el código verifica (`@can('docentes.crear')`).

| Campo | Tipo | Nulo | Notas |
|-------|------|:----:|-------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `clave` | `VARCHAR(80)` | NO | **UNIQUE** — la que verifica el código, estilo `docentes.crear`, `alertas.ver`, `derivaciones.gestionar` |
| `nombre` | `VARCHAR(120)` | NO | nombre visible ("Crear docentes", "Ver alertas") |
| `modulo` | `VARCHAR(50)` | SÍ | agrupa los permisos en la pantalla roles-permisos (ej. "Docentes", "Fichas", "Alertas") |
| `descripcion` | `VARCHAR(255)` | SÍ | |
| `created_at` | `TIMESTAMP` | SÍ | |
| `updated_at` | `TIMESTAMP` | SÍ | |

**Índices:** PK (`id`) · UNIQUE (`clave`).

```sql
CREATE TABLE permiso (
  id           BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  clave        VARCHAR(80)      NOT NULL,
  nombre       VARCHAR(120)     NOT NULL,
  modulo       VARCHAR(50)      NULL,
  descripcion  VARCHAR(255)     NULL,
  created_at   TIMESTAMP        NULL,
  updated_at   TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_permiso_clave (clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

> **Mapeo a Laravel (RBAC).** Este diseño es 1:1 con `spatie/laravel-permission`:
> `rol` = `roles`, `permiso` = `permissions`, nuestra `clave` = el `name`
> del paquete, `usuario_rol` = `model_has_roles`, `rol_permiso` =
> `role_has_permissions`. El paquete aporta la *plomería* (asignar/verificar
> roles y permisos, middleware, `@can`), **no** el contenido: la lista real
> de roles/permisos (el seed) se define igual. Las columnas extra
> (`descripcion`, `activo`, `protegido`, `modulo`) se agregan a las tablas
> del paquete con una migración. Se puede construir a mano o con el paquete;
> la especificación es la misma.

### Tabla 4 · `usuario_rol` (pivote usuario ↔ rol)

Relación n:n. Un usuario puede tener varios roles; un rol lo pueden tener
varios usuarios. Los permisos nunca se asignan directo al usuario — solo
vía sus roles.

| Campo | Tipo | Nulo | Notas |
|-------|------|:----:|-------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `usuario_id` | `BIGINT UNSIGNED` | NO | FK → `usuario(id)`, ON DELETE CASCADE |
| `rol_id` | `BIGINT UNSIGNED` | NO | FK → `rol(id)`, ON DELETE CASCADE |
| `created_at` | `TIMESTAMP` | SÍ | cuándo se asignó el rol |
| `updated_at` | `TIMESTAMP` | SÍ | |

**Índices:** PK (`id`) · **UNIQUE (`usuario_id`, `rol_id`)** · índice en `rol_id` (búsqueda inversa). Sin `deleted_at` (un vínculo se quita, no se archiva).

```sql
CREATE TABLE usuario_rol (
  id          BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  usuario_id  BIGINT UNSIGNED  NOT NULL,
  rol_id      BIGINT UNSIGNED  NOT NULL,
  created_at  TIMESTAMP        NULL,
  updated_at  TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuario_rol (usuario_id, rol_id),
  KEY idx_usuario_rol_rol (rol_id),
  CONSTRAINT fk_usuario_rol_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE,
  CONSTRAINT fk_usuario_rol_rol     FOREIGN KEY (rol_id)     REFERENCES rol (id)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabla 5 · `rol_permiso` (pivote rol ↔ permiso)

Relación n:n. Un rol agrupa varios permisos; un permiso puede estar en
varios roles.

| Campo | Tipo | Nulo | Notas |
|-------|------|:----:|-------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `rol_id` | `BIGINT UNSIGNED` | NO | FK → `rol(id)`, ON DELETE CASCADE |
| `permiso_id` | `BIGINT UNSIGNED` | NO | FK → `permiso(id)`, ON DELETE CASCADE |
| `created_at` | `TIMESTAMP` | SÍ | |
| `updated_at` | `TIMESTAMP` | SÍ | |

**Índices:** PK (`id`) · **UNIQUE (`rol_id`, `permiso_id`)** · índice en `permiso_id`. Sin `deleted_at`.

```sql
CREATE TABLE rol_permiso (
  id          BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  rol_id      BIGINT UNSIGNED  NOT NULL,
  permiso_id  BIGINT UNSIGNED  NOT NULL,
  created_at  TIMESTAMP        NULL,
  updated_at  TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_rol_permiso (rol_id, permiso_id),
  KEY idx_rol_permiso_permiso (permiso_id),
  CONSTRAINT fk_rol_permiso_rol     FOREIGN KEY (rol_id)     REFERENCES rol (id)     ON DELETE CASCADE,
  CONSTRAINT fk_rol_permiso_permiso FOREIGN KEY (permiso_id) REFERENCES permiso (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabla 6 · `grado_academico` (catálogo)

Grado académico del docente (Bachiller, Magíster, Doctor…). Conjunto
cerrado y estándar → catálogo (evita typos, permite orden jerárquico).

| Campo | Tipo | Nulo | Notas |
|-------|------|:----:|-------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `nombre` | `VARCHAR(60)` | NO | **UNIQUE** (Bachiller, Magíster, Doctor…) |
| `abreviatura` | `VARCHAR(10)` | NO | **UNIQUE** — para listados densos (`Bach.`, `Lic.`, `Mg.`, `Dr.`) |
| `orden` | `SMALLINT` | SÍ | jerarquía / orden de listado |
| `activo` | `TINYINT(1)` | NO | DEFAULT `1` |
| `created_at` | `TIMESTAMP` | SÍ | |
| `updated_at` | `TIMESTAMP` | SÍ | |

```sql
CREATE TABLE grado_academico (
  id           BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nombre       VARCHAR(60)      NOT NULL,
  abreviatura  VARCHAR(10)      NOT NULL,
  orden        SMALLINT         NULL,
  activo       TINYINT(1)       NOT NULL DEFAULT 1,
  created_at   TIMESTAMP        NULL,
  updated_at   TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_grado_academico_nombre (nombre),
  UNIQUE KEY uq_grado_academico_abreviatura (abreviatura)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabla 7 · `especialidad` (catálogo)

Especialidad / área del docente (ej. Marketing, Finanzas, Gestión Pública).
Por ahora **un docente tiene una sola** (FK simple en `docente`); si más
adelante se necesita más de una, se agrega un pivote `docente_especialidad`.

| Campo | Tipo | Nulo | Notas |
|-------|------|:----:|-------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `nombre` | `VARCHAR(120)` | NO | **UNIQUE** |
| `activo` | `TINYINT(1)` | NO | DEFAULT `1` |
| `created_at` | `TIMESTAMP` | SÍ | |
| `updated_at` | `TIMESTAMP` | SÍ | |

```sql
CREATE TABLE especialidad (
  id          BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(120)     NOT NULL,
  activo      TINYINT(1)       NOT NULL DEFAULT 1,
  created_at  TIMESTAMP        NULL,
  updated_at  TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_especialidad_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabla 8 · `docente`

Perfil 1:1 de `usuario`. Guarda datos de **perfil/CV** (no los usa la
lógica de tutoría) y sobre todo es el **anchor** de las tablas de negocio
del rol docente (`docente_ciclo_periodo`, `derivacion.docente_id`, …).
La `foto` NO va aquí: vive en `usuario`.

| Campo | Tipo | Nulo | Notas |
|-------|------|:----:|-------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `usuario_id` | `BIGINT UNSIGNED` | NO | FK → `usuario(id)`, **UNIQUE** (1:1) |
| `grado_academico_id` | `BIGINT UNSIGNED` | SÍ | FK → `grado_academico(id)` |
| `especialidad_id` | `BIGINT UNSIGNED` | SÍ | FK → `especialidad(id)` (una sola por ahora) |
| `codigo_orcid` | `VARCHAR(19)` | SÍ | formato `0000-0000-0000-0000` |
| `cv_url` | `VARCHAR(255)` | SÍ | link al CV |
| `biografia` | `TEXT` | SÍ | reseña para la página de perfil |
| `created_at` | `TIMESTAMP` | SÍ | |
| `updated_at` | `TIMESTAMP` | SÍ | |
| `deleted_at` | `TIMESTAMP` | SÍ | soft delete (terminar el rol sin borrar historial) |

**Índices:** PK (`id`) · **UNIQUE (`usuario_id`)** · índices en las FK. Las
FK no llevan `ON DELETE CASCADE`: `usuario` usa soft delete y los catálogos
se desactivan con `activo`, no se borran.

```sql
CREATE TABLE docente (
  id                  BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  usuario_id          BIGINT UNSIGNED  NOT NULL,
  grado_academico_id  BIGINT UNSIGNED  NULL,
  especialidad_id     BIGINT UNSIGNED  NULL,
  codigo_orcid        VARCHAR(19)      NULL,
  cv_url              VARCHAR(255)     NULL,
  biografia           TEXT             NULL,
  created_at          TIMESTAMP        NULL,
  updated_at          TIMESTAMP        NULL,
  deleted_at          TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_docente_usuario (usuario_id),
  KEY idx_docente_grado (grado_academico_id),
  KEY idx_docente_especialidad (especialidad_id),
  CONSTRAINT fk_docente_usuario     FOREIGN KEY (usuario_id)         REFERENCES usuario (id),
  CONSTRAINT fk_docente_grado       FOREIGN KEY (grado_academico_id) REFERENCES grado_academico (id),
  CONSTRAINT fk_docente_especialidad FOREIGN KEY (especialidad_id)   REFERENCES especialidad (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabla 9 · `estudiante`

Perfil 1:1 de `usuario`. Mínima: anchor + `codigo_universitario`. El ciclo,
la escuela y el estado (activo/egresado) NO son campos — se derivan (ciclo
vía matrícula) o están fuera de alcance (escuela diferida; estado se infiere
por ausencia de matrícula en el periodo vigente).

| Campo | Tipo | Nulo | Notas |
|-------|------|:----:|-------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `usuario_id` | `BIGINT UNSIGNED` | NO | FK → `usuario(id)`, **UNIQUE** (1:1) |
| `codigo_universitario` | `VARCHAR(20)` | NO | **UNIQUE** |
| `codigo_orcid` | `VARCHAR(19)` | SÍ | opcional (CV futuro) |
| `created_at` | `TIMESTAMP` | SÍ | |
| `updated_at` | `TIMESTAMP` | SÍ | |
| `deleted_at` | `TIMESTAMP` | SÍ | soft delete |

**Índices:** PK (`id`) · **UNIQUE (`usuario_id`)** · **UNIQUE (`codigo_universitario`)**.

```sql
CREATE TABLE estudiante (
  id                    BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  usuario_id            BIGINT UNSIGNED  NOT NULL,
  codigo_universitario  VARCHAR(20)      NOT NULL,
  codigo_orcid          VARCHAR(19)      NULL,
  created_at            TIMESTAMP        NULL,
  updated_at            TIMESTAMP        NULL,
  deleted_at            TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_estudiante_usuario (usuario_id),
  UNIQUE KEY uq_estudiante_codigo (codigo_universitario),
  CONSTRAINT fk_estudiante_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### APIs — Módulo 1

**Convenciones (todas las rutas):** prefijo `/api/v1`; auth por token
(Laravel Sanctum); **cada endpoint exige un permiso** (RBAC); los `index`
aceptan `?buscar=`, `?page=`, filtros y orden; respuesta JSON con `data` +
`meta`. **[CRUD]** abrevia los 5 endpoints estándar de `apiResource`:
`GET` index · `POST` store · `GET /{id}` show · `PUT/PATCH /{id}` update ·
`DELETE /{id}` destroy.

> **Métodos HTTP:** solo verbos probados (`GET` / `POST` / `PUT` / `PATCH` /
> `DELETE`). No se usa `QUERY` (aún borrador IETF, soporte irregular en
> clientes, proxies y gateways). Búsquedas ricas: `GET` con query-string; si
> un filtro no cabe en la URL, `POST /recurso/buscar` con body JSON.

**Autenticación**

| Método | Ruta | Propósito | Acceso |
|--------|------|-----------|--------|
| `POST` | `/auth/login` | iniciar sesión (email + clave) → token + usuario + permisos | público |
| `POST` | `/auth/logout` | cerrar sesión (revoca el token) | autenticado |
| `GET` | `/auth/me` | usuario actual + roles + permisos (para pintar el menú) | autenticado |
| `POST` | `/auth/forgot-password` | solicitar enlace de recuperación | público |
| `POST` | `/auth/reset-password` | fijar nueva clave con token | público |
| `PUT` | `/auth/password` | cambiar la propia contraseña | autenticado |

**Usuarios (identidad)**

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| **[CRUD]** | `/usuarios` | gestionar identidades (destroy = soft delete) | `usuarios.ver/crear/editar/eliminar` |
| `PATCH` | `/usuarios/{id}/estado` | activar / desactivar acceso (`activo`) | `usuarios.editar` |
| `PUT` | `/usuarios/{id}/roles` | sincronizar los roles del usuario | `usuarios.asignar_roles` |

**Perfiles**

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| **[CRUD]** | `/docentes` | perfil docente (store crea usuario + docente + rol, en transacción) | `docentes.ver/crear/editar/eliminar` |
| **[CRUD]** | `/estudiantes` | perfil estudiante (idem) | `estudiantes.ver/crear/editar/eliminar` |

**RBAC**

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| **[CRUD]** | `/roles` | gestionar roles (bloquea editar/borrar si `protegido`) | `roles.ver/crear/editar/eliminar` |
| `PUT` | `/roles/{id}/permisos` | sincronizar los permisos del rol | `roles.asignar_permisos` |
| `GET` | `/permisos` | listar permisos agrupados por `modulo` (solo lectura) | `roles.ver` |

**Catálogos**

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| **[CRUD]** | `/tipos-documento` | catálogo de tipos de documento (DNI, CE, Pasaporte) | `catalogos.gestionar` |
| **[CRUD]** | `/grados-academicos` | catálogo de grados académicos | `catalogos.gestionar` |
| **[CRUD]** | `/especialidades` | catálogo de especialidades | `catalogos.gestionar` |

> La **funcionalidad** de cada endpoint (validaciones, reglas, transacciones)
> está en [`FUNCIONALIDAD-BACKEND.md`](./FUNCIONALIDAD-BACKEND.md).

---

**Módulo 1 — Identidad y acceso: ✔ completo** (10 tablas: `tipo_documento`,
`usuario`, `rol`, `permiso`, `usuario_rol`, `rol_permiso`, `grado_academico`,
`especialidad`, `docente`, `estudiante`).

## Módulo 2 — Estructura académica

### `ciclo` (catálogo)

Nivel curricular. Malla abierta: se agregan o desactivan sin tocar código.
**Varios** pueden estar `activo = 1` a la vez.

| Campo | Tipo | Nulo | Notas |
|-------|------|:----:|-------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `nombre` | `VARCHAR(60)` | NO | **UNIQUE** — "Primer ciclo", "1° ciclo" |
| `orden` | `SMALLINT` | NO | **UNIQUE** — progresión (calcula el "ciclo siguiente") |
| `activo` | `TINYINT(1)` | NO | DEFAULT `1` — retirar sin ocultar |
| `created_at` | `TIMESTAMP` | SÍ | |
| `updated_at` | `TIMESTAMP` | SÍ | |

**Índices:** PK (`id`) · UNIQUE (`nombre`) · UNIQUE (`orden`).

Sin `deleted_at`: es catálogo → un soft-delete ocultaría valores que el
historial (`ciclo_periodo`) necesita mostrar. Se retira con `activo = 0`;
si nunca se usó, se puede borrar (la FK impide borrar uno referenciado).
Al reordenar, el intercambio de `orden` (UNIQUE) se resuelve en la lógica.

```sql
CREATE TABLE ciclo (
  id          BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(60)      NOT NULL,
  orden       SMALLINT         NOT NULL,
  activo      TINYINT(1)       NOT NULL DEFAULT 1,
  created_at  TIMESTAMP        NULL,
  updated_at  TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ciclo_nombre (nombre),
  UNIQUE KEY uq_ciclo_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### `periodo_academico` (catálogo)

Semestre/año contenedor. **Solo uno vigente** a la vez.

| Campo | Tipo | Nulo | Notas |
|-------|------|:----:|-------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `nombre` | `VARCHAR(20)` | NO | **UNIQUE** — "2026-I", "2026-II" |
| `fecha_inicio` | `DATE` | SÍ | opcional |
| `fecha_fin` | `DATE` | SÍ | opcional |
| `activo` | `TINYINT(1)` | NO | DEFAULT `0` — el vigente |
| `created_at` | `TIMESTAMP` | SÍ | |
| `updated_at` | `TIMESTAMP` | SÍ | |

**Índices:** PK (`id`) · UNIQUE (`nombre`). Sin `deleted_at` (catálogo → `activo`).

**Reglas (aplicación, no BD):**
- Solo un `periodo_academico` con `activo = 1`; al activar uno, los demás pasan a `0`.
- Si ambas fechas están presentes, `fecha_inicio <= fecha_fin`.

```sql
CREATE TABLE periodo_academico (
  id            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(20)      NOT NULL,
  fecha_inicio  DATE             NULL,
  fecha_fin     DATE             NULL,
  activo        TINYINT(1)       NOT NULL DEFAULT 0,
  created_at    TIMESTAMP        NULL,
  updated_at    TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_periodo_academico_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

<!-- Próximas: ciclo_periodo, docente_ciclo_periodo, temario, estudiante_ciclo_periodo -->

---

## Tablas transversales

### `auditoria`

Bitácora **append-only e inmutable**: quién hizo qué, con valores
antes/después. Distinta de `created_at`/`updated_at` (que solo dicen *cuándo*
cambió la fila). Se implementa con **`owen-it/laravel-auditing`** (crea una
tabla equivalente y captura old/new automáticamente); esta es la
especificación. Expone solo lectura para el admin (`GET /auditoria`,
permiso `auditoria.ver`).

| Campo | Tipo | Nulo | Notas |
|-------|------|:----:|-------|
| `id` | `BIGINT UNSIGNED` | NO | PK |
| `usuario_id` | `BIGINT UNSIGNED` | SÍ | quién actuó (null = sistema) — FK → `usuario`, ON DELETE SET NULL |
| `accion` | `VARCHAR(30)` | NO | `crear`, `editar`, `eliminar`, `login`… |
| `tabla_afectada` | `VARCHAR(100)` | NO | modelo/tabla tocada |
| `registro_id` | `BIGINT UNSIGNED` | SÍ | id del registro afectado |
| `valores_anteriores` | `JSON` | SÍ | estado previo |
| `valores_nuevos` | `JSON` | SÍ | estado nuevo |
| `ip` | `VARCHAR(45)` | SÍ | IPv4 / IPv6 |
| `user_agent` | `VARCHAR(255)` | SÍ | navegador |
| `url` | `VARCHAR(255)` | SÍ | endpoint |
| `created_at` | `TIMESTAMP` | SÍ | cuándo (única marca temporal) |

**Índices:** PK (`id`) · (`tabla_afectada`, `registro_id`) · (`usuario_id`) · (`created_at`).

**Notas:**
- **Inmutable:** solo se inserta; nunca `UPDATE` ni `DELETE`. Por eso no lleva
  `updated_at` ni `deleted_at`.
- **Crece rápido** (una fila por cambio): prever retención/archivado a futuro.
- `usuario_id` con `ON DELETE SET NULL` para que la bitácora sobreviva aunque
  se elimine al usuario.
- `JSON` es correcto aquí (payloads sueltos, no entidades relacionadas).

```sql
CREATE TABLE auditoria (
  id                  BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  usuario_id          BIGINT UNSIGNED  NULL,
  accion              VARCHAR(30)      NOT NULL,
  tabla_afectada      VARCHAR(100)     NOT NULL,
  registro_id         BIGINT UNSIGNED  NULL,
  valores_anteriores  JSON             NULL,
  valores_nuevos      JSON             NULL,
  ip                  VARCHAR(45)      NULL,
  user_agent          VARCHAR(255)     NULL,
  url                 VARCHAR(255)     NULL,
  created_at          TIMESTAMP        NULL,
  PRIMARY KEY (id),
  KEY idx_auditoria_registro (tabla_afectada, registro_id),
  KEY idx_auditoria_usuario (usuario_id),
  KEY idx_auditoria_fecha (created_at),
  CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


