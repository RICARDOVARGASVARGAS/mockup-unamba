# BD + Backend — TutorTrack (versión final para implementar)

Este documento es el **qué ejecutable**: esquema de base de datos (MySQL),
reglas de funcionalidad y APIs probables del backend, módulo por módulo.
El razonamiento y las decisiones de dominio están **integradas en este mismo
documento** junto al esquema — es la **fuente única de verdad**.

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
   `docente`, `estudiante`, `receptor`. _(✔ completo — 11 tablas)_
2. **Estructura académica** — `ciclo`, `periodo_academico`, `ciclo_periodo`,
   `docente_ciclo_periodo`, `temario`, `estudiante_ciclo_periodo`.
   _(✔ completo — 6 tablas)_
3. **Fichas** — `tipo_ficha`, `area`, `ficha`, `pregunta`,
   `opcion_pregunta`, `ficha_ciclo_periodo`, `ficha_llenada`, `respuesta`,
   `respuesta_opcion`. _(✔ completo — 9 tablas)_
   > `tipo_pregunta` **eliminado como tabla** — reemplazado por 5 constantes en código.
4. **IA / Alertas / Derivación** — `entidad_receptora`, `tipo_estado_derivacion`,
   `alerta_ia`, `derivacion`. _(✔ completo — 4 tablas)_
   > `estado_derivacion` **eliminado como tabla** — la trazabilidad la cubre `auditoria`; ver decisión de diseño en la sección M4.

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
| `sexo` | `CHAR(1)` | SÍ | `'M'` / `'F'` / `'N'` (No especificado) — CHECK constraint en BD |
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
  -- Valores válidos: 'M' = Masculino, 'F' = Femenino, 'N' = No especificado
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
  CONSTRAINT fk_usuario_tipo_documento FOREIGN KEY (tipo_documento_id) REFERENCES tipo_documento (id),
  CONSTRAINT chk_usuario_sexo CHECK (sexo IN ('M', 'F', 'N'))
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

Perfil 1:1 de `usuario`. Anchor + `codigo_universitario` + `estado` (ciclo de
vida académico). El **ciclo** NO es campo — se deriva de la matrícula del
período vigente (`estudiante_ciclo_periodo`); la **escuela** queda diferida
(fuera de alcance). El **estado** (activo/egresado/retirado) SÍ es explícito:
antes se infería por ausencia de matrícula (ambiguo), ahora se marca al
avanzar/egresar/retirar.

| Campo | Tipo | Nulo | Notas |
|-------|------|:----:|-------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `usuario_id` | `BIGINT UNSIGNED` | NO | FK → `usuario(id)`, **UNIQUE** (1:1) |
| `codigo_universitario` | `VARCHAR(20)` | NO | **UNIQUE** |
| `codigo_orcid` | `VARCHAR(19)` | SÍ | opcional (CV futuro) |
| `estado` | `VARCHAR(10)` | NO | DEFAULT `activo` — ciclo de vida académico: `activo` / `egresado` / `retirado`. CHECK en BD |
| `created_at` | `TIMESTAMP` | SÍ | |
| `updated_at` | `TIMESTAMP` | SÍ | |
| `deleted_at` | `TIMESTAMP` | SÍ | soft delete |

**Índices:** PK (`id`) · **UNIQUE (`usuario_id`)** · **UNIQUE (`codigo_universitario`)** · índice en `estado`.

**`estado` (ciclo de vida) vs `usuario.activo` (acceso):** son distintos.
`estado` = situación académica (`activo` cursando, `egresado` terminó,
`retirado` abandonó); `usuario.activo` = si puede iniciar sesión. Un egresado
puede conservar acceso para ver su historial. Los egresados/retirados **no**
entran en las propuestas de "Avanzar estudiantes" ni cuentan como padrón activo.

```sql
CREATE TABLE estudiante (
  id                    BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  usuario_id            BIGINT UNSIGNED  NOT NULL,
  codigo_universitario  VARCHAR(20)      NOT NULL,
  codigo_orcid          VARCHAR(19)      NULL,
  estado                VARCHAR(10)      NOT NULL DEFAULT 'activo',
  -- Valores válidos: 'activo' = cursando, 'egresado' = terminó, 'retirado' = abandonó
  created_at            TIMESTAMP        NULL,
  updated_at            TIMESTAMP        NULL,
  deleted_at            TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_estudiante_usuario (usuario_id),
  UNIQUE KEY uq_estudiante_codigo (codigo_universitario),
  KEY idx_estudiante_estado (estado),
  CONSTRAINT fk_estudiante_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id),
  CONSTRAINT chk_estudiante_estado CHECK (estado IN ('activo', 'egresado', 'retirado'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabla 10 · `receptor`

Perfil 1:1 de `usuario` para los miembros de las entidades receptoras (psicólogos,
coordinadores de bienestar, médicos, etc.). Sin esta tabla el backend no puede
determinar a qué `entidad_receptora` pertenece el usuario autenticado —
información necesaria para filtrar sus derivaciones al consultar `GET /mis-derivaciones`.

Sigue exactamente el mismo patrón 1:1 que `docente` y `estudiante`.

> **¿Por qué no basta con el rol?** El `rol` indica *qué puede hacer* el usuario
> (permisos RBAC). La `entidad_receptora` indica *a qué departamento pertenece*.
> Dos psicólogos en dos entidades distintas tendrían el mismo rol pero distintas
> entidades — esa diferencia solo la captura este perfil.

| Campo | Tipo | Nulo | Notas |
|-------|------|:----:|-------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `usuario_id` | `BIGINT UNSIGNED` | NO | FK → `usuario(id)`, **UNIQUE** (1:1) |
| `entidad_receptora_id` | `BIGINT UNSIGNED` | NO | FK → `entidad_receptora(id)` — a qué entidad pertenece este receptor |
| `created_at` | `TIMESTAMP` | SÍ | |
| `updated_at` | `TIMESTAMP` | SÍ | |
| `deleted_at` | `TIMESTAMP` | SÍ | soft delete (desvincula el perfil sin borrar historial) |

**Índices:** PK (`id`) · **UNIQUE (`usuario_id`)** · índice en `entidad_receptora_id`
(todos los receptores de una entidad).

**Nota:** un receptor no puede pertenecer a más de una entidad a la vez (UNIQUE en
`usuario_id`). Si fuera necesario en el futuro, esta restricción se relaja con un
pivote `receptor_entidad`.

```sql
CREATE TABLE receptor (
  id                    BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  usuario_id            BIGINT UNSIGNED  NOT NULL,
  entidad_receptora_id  BIGINT UNSIGNED  NOT NULL,
  created_at            TIMESTAMP        NULL,
  updated_at            TIMESTAMP        NULL,
  deleted_at            TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_receptor_usuario (usuario_id),
  KEY idx_receptor_entidad (entidad_receptora_id),
  CONSTRAINT fk_receptor_usuario  FOREIGN KEY (usuario_id)           REFERENCES usuario (id),
  CONSTRAINT fk_receptor_entidad  FOREIGN KEY (entidad_receptora_id) REFERENCES entidad_receptora (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabla 11 · `apoderado`

Apoderado/tutor familiar de uno o más estudiantes. **No es un `usuario`** (no
inicia sesión). Es **único por documento**: cuando se registra un apoderado que
ya existe (porque es padre de otro hermano ya matriculado), se **reutiliza** la
fila — no se duplica. Así, actualizar su celular una vez se refleja en todos sus
hijos.

| Campo | Tipo | Nulo | Notas |
|-------|------|:----:|-------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `tipo_documento_id` | `BIGINT UNSIGNED` | NO | FK → `tipo_documento(id)` |
| `documento` | `VARCHAR(15)` | NO | único **en combinación con** `tipo_documento_id` |
| `nombres` | `VARCHAR(100)` | NO | |
| `apellido_paterno` | `VARCHAR(60)` | NO | |
| `apellido_materno` | `VARCHAR(60)` | NO | |
| `celular_principal` | `VARCHAR(20)` | SÍ | contacto principal |
| `celular_secundario` | `VARCHAR(20)` | SÍ | |
| `email` | `VARCHAR(150)` | SÍ | opcional, no único |
| `ocupacion` | `VARCHAR(100)` | SÍ | opcional |
| `direccion` | `VARCHAR(255)` | SÍ | opcional |
| `created_at` | `TIMESTAMP` | SÍ | |
| `updated_at` | `TIMESTAMP` | SÍ | |
| `deleted_at` | `TIMESTAMP` | SÍ | soft delete |

**Índices:** PK (`id`) · **UNIQUE (`tipo_documento_id`, `documento`)** · índice en `tipo_documento_id`.

```sql
CREATE TABLE apoderado (
  id                 BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  tipo_documento_id  BIGINT UNSIGNED  NOT NULL,
  documento          VARCHAR(15)      NOT NULL,
  nombres            VARCHAR(100)     NOT NULL,
  apellido_paterno   VARCHAR(60)      NOT NULL,
  apellido_materno   VARCHAR(60)      NOT NULL,
  celular_principal  VARCHAR(20)      NULL,
  celular_secundario VARCHAR(20)      NULL,
  email              VARCHAR(150)     NULL,
  ocupacion          VARCHAR(100)     NULL,
  direccion          VARCHAR(255)     NULL,
  created_at         TIMESTAMP        NULL,
  updated_at         TIMESTAMP        NULL,
  deleted_at         TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_apoderado_documento (tipo_documento_id, documento),
  KEY idx_apoderado_tipo_documento (tipo_documento_id),
  CONSTRAINT fk_apoderado_tipo_documento FOREIGN KEY (tipo_documento_id) REFERENCES tipo_documento (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabla 12 · `estudiante_apoderado` (puente estudiante ↔ apoderado)

Relación **n:n**: un apoderado tiene varios estudiantes (hermanos); un
estudiante tiene varios apoderados (padre + madre). El `parentesco` y quién es
el contacto principal son propios del **vínculo**, por eso viven aquí.

| Campo | Tipo | Nulo | Notas |
|-------|------|:----:|-------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `estudiante_id` | `BIGINT UNSIGNED` | NO | FK → `estudiante(id)` |
| `apoderado_id` | `BIGINT UNSIGNED` | NO | FK → `apoderado(id)` |
| `parentesco` | `VARCHAR(30)` | NO | `padre` / `madre` / `abuelo` / `tutor_legal` / `otro` (CHECK) |
| `es_principal` | `TINYINT(1)` | NO | DEFAULT `0` — contacto principal de **ese** estudiante |
| `created_at` | `TIMESTAMP` | SÍ | |
| `updated_at` | `TIMESTAMP` | SÍ | |

**Índices:** PK (`id`) · **UNIQUE (`estudiante_id`, `apoderado_id`)** — un
apoderado no se vincula dos veces al mismo estudiante · índice en `apoderado_id`
(buscar todos los tutorados/hermanos de un apoderado).

**Regla (aplicación):** a lo sumo **un** `es_principal = 1` por estudiante.

```sql
CREATE TABLE estudiante_apoderado (
  id            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  estudiante_id BIGINT UNSIGNED  NOT NULL,
  apoderado_id  BIGINT UNSIGNED  NOT NULL,
  parentesco    VARCHAR(30)      NOT NULL,
  es_principal  TINYINT(1)       NOT NULL DEFAULT 0,
  created_at    TIMESTAMP        NULL,
  updated_at    TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_estudiante_apoderado (estudiante_id, apoderado_id),
  KEY idx_ea_apoderado (apoderado_id),
  CONSTRAINT fk_ea_estudiante FOREIGN KEY (estudiante_id) REFERENCES estudiante (id),
  CONSTRAINT fk_ea_apoderado  FOREIGN KEY (apoderado_id)  REFERENCES apoderado (id),
  CONSTRAINT chk_ea_parentesco CHECK (parentesco IN ('padre','madre','abuelo','tutor_legal','otro'))
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
| **[CRUD]** | `/receptores` | perfil receptor (store crea usuario + receptor + rol, en transacción; `entidad_receptora_id` obligatorio) | `receptores.ver/crear/editar/eliminar` |

**Apoderados** (sub-recurso del estudiante)

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| `GET` | `/estudiantes/{id}/apoderados` | apoderados de un estudiante (con parentesco / principal) | `estudiantes.ver` |
| `POST` | `/estudiantes/{id}/apoderados` | vincular apoderado: si el `documento` **ya existe**, reutiliza la fila; si no, crea. Luego inserta `estudiante_apoderado` | `estudiantes.editar` |
| `PUT` | `/estudiantes/{id}/apoderados/{apoderado_id}` | editar el vínculo (`parentesco`, `es_principal`) y/o datos del apoderado | `estudiantes.editar` |
| `DELETE` | `/estudiantes/{id}/apoderados/{apoderado_id}` | quitar el vínculo. **No borra el apoderado** si tiene otros hijos vinculados | `estudiantes.editar` |
| `GET` | `/apoderados/{id}/estudiantes` | hermanos: estudiantes que comparten ese apoderado | `estudiantes.ver` |

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

**Módulo 1 — Identidad y acceso: ✔ completo** (13 tablas: `tipo_documento`,
`usuario`, `rol`, `permiso`, `usuario_rol`, `rol_permiso`, `grado_academico`,
`especialidad`, `docente`, `estudiante`, `receptor`, `apoderado`,
`estudiante_apoderado`).

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

### `ciclo_periodo` (entidad puente — nodo central del módulo académico)

Une un `Ciclo` (nivel curricular, ej. "1° ciclo") con un `PeriodoAcademico`
(ej. "2026-I") en una fila concreta. Es el **ancla** de todo lo que ocurre
en ese ciclo durante ese período: de aquí cuelgan el temario, los docentes
asignados y los estudiantes matriculados.

La relación entre `ciclo` y `periodo_academico` es **n:n en ambos sentidos**:
- Un **ciclo** aparece en muchos períodos (1° ciclo estuvo en 2025-I, 2025-II,
  2026-I…).
- Un **período** contiene muchos ciclos (2026-I tiene el 1°, 2°, 3° ciclo…
  todos activos a la vez).

Esto genera una fila `ciclo_periodo` por cada combinación válida:

| ciclo_id  | periodo_academico_id |
|-----------|----------------------|
| 1° ciclo  | 2026-I               |
| 2° ciclo  | 2026-I               |
| 3° ciclo  | 2026-I               |
| 1° ciclo  | 2026-II              |
| 2° ciclo  | 2026-II              |

Cada fila es **independiente**: un cambio en la configuración de 2026-II
(temario, docentes) nunca toca lo que ya ocurrió en 2026-I. Al abrir un
nuevo período se puede **clonar** la configuración del anterior (nuevas
filas, no referencias compartidas).

| Campo | Tipo | Nulo | Comentario |
|-------|------|:----:|------------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `ciclo_id` | `BIGINT UNSIGNED` | NO | FK → `ciclo(id)` — qué nivel curricular |
| `periodo_academico_id` | `BIGINT UNSIGNED` | NO | FK → `periodo_academico(id)` — en qué período |
| `created_at` | `TIMESTAMP` | SÍ | auditoría |
| `updated_at` | `TIMESTAMP` | SÍ | auditoría |

**Índices:** PK (`id`) · **UNIQUE (`ciclo_id`, `periodo_academico_id`)** —
la misma combinación no puede repetirse · índice en `periodo_academico_id`
(búsqueda inversa: "todos los ciclos de este período").

**Sin `activo` ni `deleted_at`:** no es catálogo ni entidad con historial
propio — es un vínculo estructural. Si se quiere "retirar" un ciclo de un
período, se desactiva el `ciclo` o el `periodo_academico`, no esta fila.
Las FK **no llevan `ON DELETE CASCADE`** porque esta tabla tiene hijos
históricos (temario, estudiantes matriculados, fichas llenadas).

```sql
CREATE TABLE ciclo_periodo (
  id                    BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  ciclo_id              BIGINT UNSIGNED  NOT NULL,
  periodo_academico_id  BIGINT UNSIGNED  NOT NULL,
  created_at            TIMESTAMP        NULL,
  updated_at            TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ciclo_periodo (ciclo_id, periodo_academico_id),
  KEY idx_ciclo_periodo_periodo (periodo_academico_id),
  CONSTRAINT fk_ciclo_periodo_ciclo   FOREIGN KEY (ciclo_id)             REFERENCES ciclo (id),
  CONSTRAINT fk_ciclo_periodo_periodo FOREIGN KEY (periodo_academico_id) REFERENCES periodo_academico (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### `docente_ciclo_periodo` — asignación de docentes a un ciclo en un período

Registra qué docente(s) dictan tutoría en qué ciclo dentro de un período
académico específico. Responde a la pregunta: *"¿quién es el tutor del 2°
ciclo en 2026-I?"*.

La relación es **n:n en ambos sentidos**:
- Un **ciclo+período** puede tener varios tutores asignados.
- Un **docente** puede tutorar varios ciclos en el mismo período.

La asignación es **propia de cada período** — si en 2026-II cambia el tutor
del 3° ciclo, solo se edita la fila de 2026-II; la de 2026-I queda intacta.
Al clonar un período, estas filas se duplican (no se referencian) hacia el
nuevo `ciclo_periodo`.

| Campo | Tipo | Nulo | Comentario |
|-------|------|:----:|------------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `docente_id` | `BIGINT UNSIGNED` | NO | FK → `docente(id)` — el tutor asignado |
| `ciclo_periodo_id` | `BIGINT UNSIGNED` | NO | FK → `ciclo_periodo(id)` — en qué ciclo+período |
| `created_at` | `TIMESTAMP` | SÍ | auditoría |
| `updated_at` | `TIMESTAMP` | SÍ | auditoría |

**Índices:** PK (`id`) · **UNIQUE (`docente_id`, `ciclo_periodo_id`)** — el
mismo docente no puede aparecer dos veces en el mismo ciclo+período · índice
en `ciclo_periodo_id` (búsqueda inversa: "todos los tutores de este ciclo en
este período").

**Sin `activo` ni `deleted_at`:** si se retira un docente de un ciclo, la
fila se elimina directamente. El historial real está en
`estudiante_ciclo_periodo` (el estudiante conserva el `docente_id` que tenía
al matricularse — ese dato no cambia aunque se modifique esta tabla).
Las FK **no llevan `ON DELETE CASCADE`** para evitar borrados accidentales
en cascada desde `docente` o `ciclo_periodo`.

```sql
CREATE TABLE docente_ciclo_periodo (
  id                BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  docente_id        BIGINT UNSIGNED  NOT NULL,
  ciclo_periodo_id  BIGINT UNSIGNED  NOT NULL,
  created_at        TIMESTAMP        NULL,
  updated_at        TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_docente_ciclo_periodo (docente_id, ciclo_periodo_id),
  KEY idx_docente_ciclo_periodo_cp (ciclo_periodo_id),
  CONSTRAINT fk_dcp_docente       FOREIGN KEY (docente_id)       REFERENCES docente (id),
  CONSTRAINT fk_dcp_ciclo_periodo FOREIGN KEY (ciclo_periodo_id) REFERENCES ciclo_periodo (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### `temario` — ítems del temario de tutoría por ciclo+período

Guarda la lista de temas que el docente-tutor debe cubrir durante las
sesiones de tutoría de un `ciclo_periodo` concreto. No está ligado al ciclo
en abstracto ni al período en abstracto — está ligado a la **instancia
específica** (ej. "temario del 2° ciclo en 2026-I"), lo que permite que cada
período tenga su propio temario independiente y editable.

Al clonar un período, estos ítems se **duplican** (con sus relaciones
padre-hijo) hacia el nuevo `ciclo_periodo` — así el admin parte de una copia
y ajusta solo lo que cambia, sin tocar el período anterior.

**Estructura jerárquica (árbol de profundidad libre):** la tabla se
auto-referencia mediante `padre_id`. Un ítem con `padre_id = NULL` es un
**tema raíz**; si apunta a otro `temario`, es un **subtema** de ese ítem.
Esto permite estructuras de cualquier profundidad (tema → subtema →
sub-subtema…) sin agregar tablas extra. El campo `orden` posiciona cada ítem
entre sus **hermanos** (ítems con el mismo `padre_id` dentro del mismo
`ciclo_periodo_id`). Las consultas de árbol completo se hacen con
`WITH RECURSIVE` (MySQL 8+).

Ejemplo de árbol:

```
[NULL] Tema 1: Adaptación a la vida universitaria   (orden 1)
  ├── Subtema 1.1: Integración social               (orden 1)
  └── Subtema 1.2: Manejo del tiempo                (orden 2)
[NULL] Tema 2: Bienestar personal                   (orden 2)
  └── Subtema 2.1: Salud y hábitos                  (orden 1)
```

| Campo | Tipo | Nulo | Comentario |
|-------|------|:----:|------------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `ciclo_periodo_id` | `BIGINT UNSIGNED` | NO | FK → `ciclo_periodo(id)` — instancia ciclo+período a la que pertenece este ítem |
| `padre_id` | `BIGINT UNSIGNED` | SÍ | FK → `temario(id)` — auto-referencia; `NULL` = tema raíz; cualquier valor = subtema de ese ítem |
| `tema` | `VARCHAR(255)` | NO | texto del tema o subtema (ej. "Adaptación a la vida universitaria") |
| `orden` | `SMALLINT` | NO | posición entre hermanos (mismo `padre_id` + mismo `ciclo_periodo_id`) |
| `created_at` | `TIMESTAMP` | SÍ | auditoría |
| `updated_at` | `TIMESTAMP` | SÍ | auditoría |

**Índices:** PK (`id`) · índice en `ciclo_periodo_id` · índice en `padre_id`
(navegar hijos de un nodo) · unicidad de orden entre hermanos gestionada a
nivel de aplicación (el UNIQUE compuesto con `padre_id` nullable no es
fiable en MySQL — trata cada `NULL` como distinto).

**Sin `activo` ni `deleted_at`:** si un tema se quita, se elimina la fila.
Al eliminar un tema raíz, la aplicación debe eliminar o reasignar sus
subtemas antes (la FK de `padre_id` impide huérfanos).

**Nota sobre reordenamiento (drag & drop):** el intercambio de `orden` entre
dos ítems debe hacerse en transacción para evitar conflictos momentáneos.

```sql
CREATE TABLE temario (
  id                BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  ciclo_periodo_id  BIGINT UNSIGNED  NOT NULL,
  padre_id          BIGINT UNSIGNED  NULL,
  tema              VARCHAR(255)     NOT NULL,
  orden             SMALLINT         NOT NULL,
  created_at        TIMESTAMP        NULL,
  updated_at        TIMESTAMP        NULL,
  PRIMARY KEY (id),
  KEY idx_temario_ciclo_periodo (ciclo_periodo_id),
  KEY idx_temario_padre (padre_id),
  CONSTRAINT fk_temario_ciclo_periodo FOREIGN KEY (ciclo_periodo_id) REFERENCES ciclo_periodo (id),
  CONSTRAINT fk_temario_padre         FOREIGN KEY (padre_id)         REFERENCES temario (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### `estudiante_ciclo_periodo` — matrícula de tutoría

Registra que un estudiante está matriculado en un ciclo+período específico y
bajo qué tutor. Es la tabla que responde: *"¿quién tutora a qué estudiante,
en qué ciclo, en qué período?"* y es la base del mecanismo **"Avanzar
estudiantes"** al abrir un período nuevo.

La relación entre `estudiante` y `ciclo_periodo` es **n:n**:
- Un **estudiante** aparece en muchos `ciclo_periodo` a lo largo del tiempo
  (uno por cada período que curse, y puede repetir ciclo).
- Un **ciclo_periodo** tiene muchos estudiantes matriculados.

Esta tabla es el pivote de ese n:n, con un atributo extra: `docente_id`.
Como un mismo `ciclo_periodo` puede tener varios tutores asignados (vía
`docente_ciclo_periodo`), es necesario saber a cuál de ellos está asignado
**este estudiante en particular** — ese dato vive aquí, no se puede derivar
de otra tabla.

| Campo | Tipo | Nulo | Comentario |
|-------|------|:----:|------------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `estudiante_id` | `BIGINT UNSIGNED` | NO | FK → `estudiante(id)` — quién está matriculado |
| `ciclo_periodo_id` | `BIGINT UNSIGNED` | NO | FK → `ciclo_periodo(id)` — en qué ciclo+período |
| `docente_id` | `BIGINT UNSIGNED` | NO | FK → `docente(id)` — tutor asignado a este estudiante; debe existir en `docente_ciclo_periodo` para el mismo `ciclo_periodo_id` (regla de aplicación, no de FK) |
| `created_at` | `TIMESTAMP` | SÍ | auditoría |
| `updated_at` | `TIMESTAMP` | SÍ | auditoría |

**Índices:** PK (`id`) · **UNIQUE (`estudiante_id`, `ciclo_periodo_id`)** —
un estudiante no puede matricularse dos veces en el mismo ciclo+período ·
índice en `ciclo_periodo_id` (todos los estudiantes de un ciclo+período) ·
índice en `docente_id` (todos los tutorados de un docente).

**Regla clave (aplicación, no BD):** un estudiante solo puede tener **una
matrícula por período académico** — no puede estar en el 1° ciclo Y en el
2° ciclo dentro del mismo 2026-I. Esta unicidad se valida en código cruzando
el `periodo_academico_id` que se deriva del `ciclo_periodo_id`.

**Sin `activo` ni `deleted_at`:** esta tabla no lleva estado propio. El estado
del estudiante (`activo` / `egresado` / `retirado`) vive **explícito** en
`estudiante.estado` — se marca al avanzar/egresar/retirar, ya **no** se infiere
por ausencia de matrícula.

**"Avanzar estudiantes"** (al abrir un período nuevo):
1. El sistema propone matricular a cada estudiante del período anterior en el
   ciclo con `orden` inmediato superior (`activo = 1`).
2. El admin revisa la propuesta: puede mantener el ciclo (repite), cambiar
   el ciclo, cambiar el tutor asignado o excluir al estudiante.
3. Al confirmar, se insertan las filas `estudiante_ciclo_periodo` del nuevo
   período. El período anterior no se modifica.

```sql
CREATE TABLE estudiante_ciclo_periodo (
  id                BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  estudiante_id     BIGINT UNSIGNED  NOT NULL,
  ciclo_periodo_id  BIGINT UNSIGNED  NOT NULL,
  docente_id        BIGINT UNSIGNED  NOT NULL,
  created_at        TIMESTAMP        NULL,
  updated_at        TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_estudiante_ciclo_periodo (estudiante_id, ciclo_periodo_id),
  KEY idx_ecp_ciclo_periodo (ciclo_periodo_id),
  KEY idx_ecp_docente (docente_id),
  CONSTRAINT fk_ecp_estudiante    FOREIGN KEY (estudiante_id)    REFERENCES estudiante (id),
  CONSTRAINT fk_ecp_ciclo_periodo FOREIGN KEY (ciclo_periodo_id) REFERENCES ciclo_periodo (id),
  CONSTRAINT fk_ecp_docente       FOREIGN KEY (docente_id)       REFERENCES docente (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## APIs — Módulo 2

> Mismas convenciones que Módulo 1: prefijo `/api/v1`, auth Sanctum, respuesta
> `{ data, meta }`, `[CRUD]` = 5 endpoints estándar de `apiResource`.

### Catálogos

**Ciclos**

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| `GET` | `/ciclos` | Listar ciclos (activos y no activos, paginado, `?buscar=`, `?activo=`) | `catalogos.gestionar` |
| `POST` | `/ciclos` | Crear ciclo (`nombre`, `orden`, `activo`) | `catalogos.gestionar` |
| `GET` | `/ciclos/{id}` | Ver ciclo | `catalogos.gestionar` |
| `PUT` | `/ciclos/{id}` | Editar ciclo | `catalogos.gestionar` |
| `DELETE` | `/ciclos/{id}` | Eliminar ciclo (rechaza si tiene `ciclo_periodo` referenciado) | `catalogos.gestionar` |
| `PATCH` | `/ciclos/{id}/estado` | Activar / desactivar (`activo`) | `catalogos.gestionar` |
| `PUT` | `/ciclos/reordenar` | Intercambiar `orden` entre dos ciclos en transacción — body: `{ id_a, id_b }` | `catalogos.gestionar` |

**Periodos académicos**

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| `GET` | `/periodos-academicos` | Listar períodos (`?activo=`) | `periodos.ver` |
| `POST` | `/periodos-academicos` | Crear período (`nombre`, `fecha_inicio?`, `fecha_fin?`) | `periodos.gestionar` |
| `GET` | `/periodos-academicos/{id}` | Ver período | `periodos.ver` |
| `PUT` | `/periodos-academicos/{id}` | Editar período (nombre y fechas; no cambia `activo` por aquí) | `periodos.gestionar` |
| `DELETE` | `/periodos-academicos/{id}` | Eliminar (rechaza si tiene `ciclo_periodo` referenciado) | `periodos.gestionar` |
| `PATCH` | `/periodos-academicos/{id}/activar` | Marcar como vigente — desactiva los demás en transacción | `periodos.gestionar` |

### Configuración por período (`ciclo_periodo`)

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| `GET` | `/periodos-academicos/{id}/ciclos-periodos` | Listar todos los `ciclo_periodo` del período, con resumen de docentes y nº de estudiantes | `periodos.ver` |
| `POST` | `/periodos-academicos/{id}/ciclos-periodos` | Crear un `ciclo_periodo` individual — body: `{ ciclo_id }` | `periodos.gestionar` |
| `DELETE` | `/ciclos-periodos/{id}` | Eliminar (rechaza si tiene temario, docentes asignados o estudiantes matriculados) | `periodos.gestionar` |
| `POST` | `/periodos-academicos/{id}/clonar` | Clonar configuración de un período origen — body: `{ periodo_origen_id }` — duplica `ciclo_periodo` + `temario` (árbol completo) + `docente_ciclo_periodo`; no clona matrículas de estudiantes | `periodos.gestionar` |

### Docentes por ciclo+período (`docente_ciclo_periodo`)

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| `GET` | `/ciclos-periodos/{id}/docentes` | Listar docentes asignados al ciclo+período, con conteo de tutorados cada uno (balance de carga) | `periodos.ver` |
| `POST` | `/ciclos-periodos/{id}/docentes` | Asignar docente — body: `{ docente_id }` | `periodos.gestionar` |
| `DELETE` | `/ciclos-periodos/{id}/docentes/{docente_id}` | Retirar docente (rechaza si tiene estudiantes matriculados con ese `docente_id` en este `ciclo_periodo`) | `periodos.gestionar` |
| `PUT` | `/ciclos-periodos/{id}/docentes` | Sincronizar lista completa de docentes — body: `{ docente_ids: [] }` — reemplaza la asignación en transacción (rechaza si algún docente a retirar tiene tutorados) | `periodos.gestionar` |

### Temario (`temario`)

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| `GET` | `/ciclos-periodos/{id}/temario` | Devolver árbol completo ordenado (`WITH RECURSIVE`), como lista anidada `{ id, tema, orden, hijos: [...] }` | `periodos.ver` |
| `POST` | `/ciclos-periodos/{id}/temario` | Agregar ítem — body: `{ tema, orden, padre_id? }` | `periodos.gestionar` |
| `PUT` | `/temario/{id}` | Editar texto (`tema`) y/o mover (`padre_id`, `orden`) | `periodos.gestionar` |
| `DELETE` | `/temario/{id}` | Eliminar ítem — body opcional: `{ modo: "rechazar" \| "cascada" }` — por defecto rechaza si tiene hijos; con `cascada` los elimina en transacción | `periodos.gestionar` |
| `PUT` | `/ciclos-periodos/{id}/temario/reordenar` | Reordenar hermanos — body: `[ { id, orden } ]` — aplica en transacción para respetar el orden sin conflictos temporales | `periodos.gestionar` |

### Matrículas de tutoría (`estudiante_ciclo_periodo`)

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| `GET` | `/ciclos-periodos/{id}/estudiantes` | Listar estudiantes matriculados con su tutor asignado y conteo de fichas llenadas | `periodos.ver` |
| `POST` | `/ciclos-periodos/{id}/estudiantes` | Matricular estudiante — body: `{ estudiante_id, docente_id }` — valida que no tenga ya matrícula en otro ciclo de este período y que el docente esté asignado al `ciclo_periodo` | `periodos.gestionar` |
| `PATCH` | `/ciclos-periodos/{id}/estudiantes/{estudiante_id}` | Cambiar tutor asignado — body: `{ docente_id }` — valida que el nuevo docente esté en `docente_ciclo_periodo` | `periodos.gestionar` |
| `DELETE` | `/ciclos-periodos/{id}/estudiantes/{estudiante_id}` | Retirar matrícula (rechaza si tiene fichas llenadas) | `periodos.gestionar` |
| `GET` | `/periodos-academicos/{id}/avanzar-estudiantes/propuesta` | Devolver propuesta de avance: por cada estudiante del período anterior, propone el `ciclo_periodo` del ciclo con `orden` siguiente en el **nuevo** período, con su tutor actual si sigue disponible; incluye conteo de carga por docente | `periodos.gestionar` |
| `POST` | `/periodos-academicos/{id}/avanzar-estudiantes/confirmar` | Confirmar propuesta (editada por el admin) — body: `[ { estudiante_id, ciclo_periodo_id, docente_id } ]` — inserta todas las filas en una transacción; rechaza si algún estudiante ya tiene matrícula en ese período | `periodos.gestionar` |

---

**Módulo 2 — Estructura académica: ✔ completo** (6 tablas: `ciclo`,
`periodo_academico`, `ciclo_periodo`, `docente_ciclo_periodo`, `temario`,
`estudiante_ciclo_periodo`).

---

## Módulo 3 — Fichas

### `tipo_ficha` (catálogo)

Clasifica cada ficha de tutoría según su propósito. Catálogo abierto: se
agregan nuevos tipos sin tocar código (por eso no es un `ENUM`). Ejemplos:
"Diagnóstico" (inicio del período), "Seguimiento" (durante el período),
"Grupal" (sesión grupal), "Encuesta" (cierre / satisfacción).

La `clave` es el identificador estable para el backend — si el nombre visible
cambia (ej. "Diagnóstico" → "Ficha inicial"), el código que referencia
`diagnostico` no se rompe. El `orden` controla el orden de aparición en los
selects del formulario de fichas.

| Campo | Tipo | Nulo | Comentario |
|-------|------|:----:|------------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `clave` | `VARCHAR(30)` | NO | **UNIQUE** — identificador estable para el código (`diagnostico`, `seguimiento`, `grupal`, `encuesta`) |
| `nombre` | `VARCHAR(80)` | NO | **UNIQUE** — nombre visible en la UI ("Diagnóstico", "Seguimiento") |
| `descripcion` | `VARCHAR(255)` | SÍ | explicación del propósito del tipo (se muestra como tooltip al admin al crear una ficha) |
| `orden` | `SMALLINT` | SÍ | orden de aparición en selects y listados |
| `activo` | `TINYINT(1)` | NO | DEFAULT `1` — desactivar sin borrar |
| `created_at` | `TIMESTAMP` | SÍ | auditoría |
| `updated_at` | `TIMESTAMP` | SÍ | auditoría |

**Índices:** PK (`id`) · UNIQUE (`clave`) · UNIQUE (`nombre`). Sin `deleted_at`
(catálogo → `activo`).

```sql
CREATE TABLE tipo_ficha (
  id           BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  clave        VARCHAR(30)      NOT NULL,
  nombre       VARCHAR(80)      NOT NULL,
  descripcion  VARCHAR(255)     NULL,
  orden        SMALLINT         NULL,
  activo       TINYINT(1)       NOT NULL DEFAULT 1,
  created_at   TIMESTAMP        NULL,
  updated_at   TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tipo_ficha_clave (clave),
  UNIQUE KEY uq_tipo_ficha_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### `tipo_pregunta` — decisión: NO es tabla

**`tipo_pregunta` se elimina como tabla de catálogo.** El tipo de pregunta
es un **contrato de comportamiento** entre frontend y backend: cada tipo
determina qué widget se renderiza, cómo se valida y cómo se guarda la
respuesta. Agregar un tipo nuevo siempre requiere cambios en código — una
tabla no compra flexibilidad real.

El tipo se guarda como `VARCHAR` en la tabla `pregunta` y se valida en la
capa de aplicación contra esta lista fija de constantes:

| Constante (clave) | Nombre visible | Widget | ¿Requiere `opcion_pregunta`? |
|---|---|---|---|
| `texto_abierto` | Texto abierto | `<textarea>` libre | No |
| `alternativa_unica` | Alternativa única | Radio buttons | Sí |
| `respuesta_multiple` | Respuesta múltiple | Checkboxes | Sí |
| `si_no` | Sí / No | Dos radio fijos ("Sí" / "No") | No — opciones predefinidas en código |
| `escala` | Escala | Barra numérica 1 a N | No — configurable con campos extra en `pregunta` |

Estas cinco claves son los **únicos valores válidos** del campo
`tipo_pregunta` en la tabla `pregunta`. El frontend y el backend los
conocen por contrato; la BD solo almacena la cadena.

### `area` (catálogo)

Clasifica temáticamente las preguntas de una ficha y las alertas que genera
la IA. Dos entidades la usan: `pregunta` (agrupa preguntas por área en la
vista del tutor) y `alerta_ia` (la IA indica en qué área detectó la señal).

La `clave` es especialmente importante aquí: el modelo de IA debe devolver
en su respuesta JSON el área detectada. Si devuelve un `id` numérico el
prompt se vuelve frágil; si devuelve una `clave` estable (`salud_mental`,
`personal_social`) el backend la mapea sin riesgo aunque el nombre visible
cambie.

| Campo | Tipo | Nulo | Comentario |
|-------|------|:----:|------------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `clave` | `VARCHAR(40)` | NO | **UNIQUE** — identificador estable usado por el modelo de IA en su respuesta JSON (`personal_social`, `salud_mental`, `academico`, `economico`) |
| `nombre` | `VARCHAR(120)` | NO | **UNIQUE** — nombre visible en la UI ("Personal y social", "Salud corporal y mental") |
| `descripcion` | `VARCHAR(255)` | SÍ | descripción del área para el admin y el diseñador de fichas |
| `activo` | `TINYINT(1)` | NO | DEFAULT `1` |
| `created_at` | `TIMESTAMP` | SÍ | auditoría |
| `updated_at` | `TIMESTAMP` | SÍ | auditoría |

**Índices:** PK (`id`) · UNIQUE (`clave`) · UNIQUE (`nombre`). Sin `deleted_at`
(catálogo → `activo`).

**Ejemplo de filas seed:**

| clave | nombre | descripcion |
|---|---|---|
| `personal_social` | Personal y social | Relaciones interpersonales, adaptación a la vida universitaria, situación familiar |
| `salud_mental` | Salud corporal y mental | Estado emocional, estrés, ansiedad, consumo de sustancias |
| `academico` | Académico | Rendimiento, asistencia, dificultades con materias |
| `economico` | Económico | Dificultades financieras, trabajo, becas |
| `vocacional` | Vocacional y profesional | Orientación de carrera, motivación, metas |

```sql
CREATE TABLE area (
  id           BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  clave        VARCHAR(40)      NOT NULL,
  nombre       VARCHAR(120)     NOT NULL,
  descripcion  VARCHAR(255)     NULL,
  activo       TINYINT(1)       NOT NULL DEFAULT 1,
  created_at   TIMESTAMP        NULL,
  updated_at   TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_area_clave (clave),
  UNIQUE KEY uq_area_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### `ficha` (plantilla)

Es una **plantilla general** de ficha — la **biblioteca** que el admin diseña
(nombre, tipo, preguntas). No se llena directamente ni pertenece a un ciclo: es
un **punto de partida reutilizable**. El **docente**, en su ciclo, la **clona**
(o crea una de cero) para obtener **su** ficha — ver `ficha_ciclo_periodo` —,
que personaliza y habilita a su ritmo. Editar la plantilla **no** afecta las
copias ya creadas.

Una plantilla puede indicar **para qué ciclos aplica** (1°, 2°…) como **guía,
no restricción** — ver la puente `ficha_ciclo` — y agruparse por ciclo en la
biblioteca. El docente ve esa sugerencia al clonar, pero puede usarla igual.

**Flujo (biblioteca → ficha del docente):**
```
ficha (plantilla general, admin)
    │  el DOCENTE clona (o crea de cero) para SU ciclo → copia independiente
    ├──► ficha_ciclo_periodo (Docente A · 1° ciclo — 2026-I · habilitable)
    └──► ficha_ciclo_periodo (Docente B · 1° ciclo — 2026-I · sus propias fichas)
```

| Campo | Tipo | Nulo | Comentario |
|-------|------|:----:|------------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `tipo_ficha_id` | `BIGINT UNSIGNED` | NO | FK → `tipo_ficha(id)` — clasifica la ficha (Diagnóstico, Seguimiento, etc.) |
| `nombre` | `VARCHAR(150)` | NO | nombre descriptivo de la plantilla (ej. "Ficha diagnóstica — Primer ciclo") |
| `descripcion` | `TEXT` | SÍ | instrucciones o contexto visible al admin al asignarla a un ciclo+período |
| `activo` | `TINYINT(1)` | NO | DEFAULT `1` — desactivar impide **clonarla** para nuevas fichas; las copias ya creadas no se afectan |
| `created_at` | `TIMESTAMP` | SÍ | auditoría |
| `updated_at` | `TIMESTAMP` | SÍ | auditoría |

**Índices:** PK (`id`) · índice en `tipo_ficha_id`. Sin `deleted_at`
(catálogo → `activo`; las copias clonadas son independientes y no dependen
de que la plantilla siga activa).

**Ejemplo de filas seed:**

| tipo_ficha | nombre | descripcion |
|---|---|---|
| Diagnóstico | Ficha diagnóstica — Ciclos 1° y 2° | Se aplica la primera semana del período para conocer la situación inicial del estudiante |
| Seguimiento | Ficha de seguimiento mensual | Seguimiento general del estudiante durante el período |
| Encuesta | Encuesta de cierre 2026-I | Evalúa la satisfacción del estudiante al cerrar el período |

```sql
CREATE TABLE ficha (
  id            BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  tipo_ficha_id BIGINT UNSIGNED  NOT NULL,
  nombre        VARCHAR(150)     NOT NULL,
  descripcion   TEXT             NULL,
  activo        TINYINT(1)       NOT NULL DEFAULT 1,
  created_at    TIMESTAMP        NULL,
  updated_at    TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ficha_nombre (nombre),
  KEY idx_ficha_tipo (tipo_ficha_id),
  CONSTRAINT fk_ficha_tipo_ficha FOREIGN KEY (tipo_ficha_id) REFERENCES tipo_ficha (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### `ficha_ciclo` (puente plantilla ↔ ciclo — guía)

Indica **para qué ciclos aplica** una plantilla (1°, 2°…). Es **guía, no
restricción**: al clonar, el docente ve la sugerencia pero puede usar la
plantilla en cualquier ciclo. Permite **agrupar/filtrar la biblioteca por ciclo**.

| Campo | Tipo | Nulo | Comentario |
|-------|------|:----:|------------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `ficha_id` | `BIGINT UNSIGNED` | NO | FK → `ficha(id)` |
| `ciclo_id` | `BIGINT UNSIGNED` | NO | FK → `ciclo(id)` |

**Índices:** PK · **UNIQUE (`ficha_id`, `ciclo_id`)** · índice en `ciclo_id`.

```sql
CREATE TABLE ficha_ciclo (
  id        BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  ficha_id  BIGINT UNSIGNED  NOT NULL,
  ciclo_id  BIGINT UNSIGNED  NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ficha_ciclo (ficha_id, ciclo_id),
  KEY idx_ficha_ciclo_ciclo (ciclo_id),
  CONSTRAINT fk_ficha_ciclo_ficha FOREIGN KEY (ficha_id) REFERENCES ficha (id) ON DELETE CASCADE,
  CONSTRAINT fk_ficha_ciclo_ciclo FOREIGN KEY (ciclo_id) REFERENCES ciclo (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### `pregunta`

Guarda cada pregunta de una ficha. Esta tabla sirve tanto para las preguntas
de la **plantilla original** (`ficha`) como para las preguntas de cada
**copia clonada** (`ficha_ciclo_periodo`) — mismo diseño, sin duplicar
estructura.

> ⚠️ Esta tabla define **qué se pregunta y cómo**. No tiene nada que ver
> con las respuestas de los estudiantes — esas viven en `respuesta` y
> `respuesta_opcion`, que se ven más adelante.

**Cómo funciona el campo dual (`ficha_id` / `ficha_ciclo_periodo_id`):**

```
PLANTILLA — ficha_id lleno, ficha_ciclo_periodo_id = NULL
┌──────────────────────────────────────────────────────────┐
│ ficha "Ficha diagnóstica"  (id = 1)                      │
│                                                          │
│  pregunta (id=1)  ficha_id=1  "¿Cómo te adaptas...?"    │
│  pregunta (id=2)  ficha_id=1  "¿Dificultades económicas?"│
│  pregunta (id=3)  ficha_id=1  "Califica tu bienestar"   │
└──────────────────────────────────────────────────────────┘
          │
          │  "Asignar a ciclo+período" → clona ficha + preguntas
          │  Se crean FILAS NUEVAS e independientes
          │
          ├──────────────────────────────────────────────────────────┐
          ▼                                                          ▼
CLON — ficha_ciclo_periodo_id lleno, ficha_id = NULL

ficha_ciclo_periodo (id=10)               ficha_ciclo_periodo (id=11)
1° ciclo — 2026-I                         2° ciclo — 2026-I

pregunta (id=4)  fcp_id=10               pregunta (id=7)  fcp_id=11
pregunta (id=5)  fcp_id=10               pregunta (id=8)  fcp_id=11
pregunta (id=6)  fcp_id=10               pregunta (id=9)  fcp_id=11

  └─ Editar pregunta 4 no toca            └─ Completamente independiente
     la plantilla (1) ni el clon (7)         de plantilla y del otro clon
```

**Regla de aplicación (no de FK):** exactamente uno de `ficha_id` /
`ficha_ciclo_periodo_id` debe estar lleno — nunca ambos, nunca ninguno.
La BD no puede garantizarlo sola (dos nullable FK); lo valida la lógica
del sistema.

**Campos extra para tipo `escala`:** solo se llenan cuando
`tipo_pregunta = 'escala'`; para los otros cuatro tipos quedan en NULL.

| Campo | Tipo | Nulo | Comentario |
|-------|------|:----:|------------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `ficha_id` | `BIGINT UNSIGNED` | SÍ | FK → `ficha(id)` — lleno si pertenece a la plantilla; NULL si es clon |
| `ficha_ciclo_periodo_id` | `BIGINT UNSIGNED` | SÍ | FK → `ficha_ciclo_periodo(id)` — lleno si es copia en uso; NULL si es plantilla |
| `area_id` | `BIGINT UNSIGNED` | NO | FK → `area(id)` — área temática de la pregunta (ej. "Salud mental", "Económico") |
| `tipo_pregunta` | `VARCHAR(30)` | NO | constante fija: `texto_abierto` · `alternativa_unica` · `respuesta_multiple` · `si_no` · `escala` — validado en aplicación |
| `enunciado` | `TEXT` | NO | texto visible de la pregunta (ej. "¿Cómo te sientes en la universidad?") |
| `orden` | `SMALLINT` | NO | posición de la pregunta dentro de su ficha (plantilla o clon) |
| `escala_min` | `TINYINT` | SÍ | solo si `tipo_pregunta = 'escala'` — valor mínimo (ej. `1`) |
| `escala_max` | `TINYINT` | SÍ | solo si `tipo_pregunta = 'escala'` — valor máximo (ej. `5`) |
| `etiqueta_min` | `VARCHAR(60)` | SÍ | solo si `tipo_pregunta = 'escala'` — etiqueta del extremo inferior (ej. "Muy mal") |
| `etiqueta_max` | `VARCHAR(60)` | SÍ | solo si `tipo_pregunta = 'escala'` — etiqueta del extremo superior (ej. "Muy bien") |
| `created_at` | `TIMESTAMP` | SÍ | auditoría |
| `updated_at` | `TIMESTAMP` | SÍ | auditoría |

**Índices:** PK (`id`) · índice en `ficha_id` · índice en
`ficha_ciclo_periodo_id` · índice en `area_id`.

**Ejemplo de filas (plantilla ficha_id = 1):**

| id | ficha_id | fcp_id | area | tipo_pregunta | enunciado | orden |
|----|----------|--------|------|---------------|-----------|-------|
| 1 | 1 | NULL | Personal y social | `texto_abierto` | ¿Cómo describirías tu adaptación a la vida universitaria? | 1 |
| 2 | 1 | NULL | Salud mental | `escala` | ¿Cómo calificarías tu bienestar emocional? (1=Muy mal, 5=Muy bien) | 2 |
| 3 | 1 | NULL | Económico | `si_no` | ¿Tienes dificultades económicas que afecten tus estudios? | 3 |
| 4 | 1 | NULL | Académico | `alternativa_unica` | ¿Cuál es tu mayor dificultad académica actualmente? | 4 |

```sql
CREATE TABLE pregunta (
  id                     BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  ficha_id               BIGINT UNSIGNED  NULL,
  ficha_ciclo_periodo_id BIGINT UNSIGNED  NULL,
  area_id                BIGINT UNSIGNED  NOT NULL,
  tipo_pregunta          VARCHAR(30)      NOT NULL,
  enunciado              TEXT             NOT NULL,
  orden                  SMALLINT         NOT NULL,
  escala_min             TINYINT          NULL,
  escala_max             TINYINT          NULL,
  etiqueta_min           VARCHAR(60)      NULL,
  etiqueta_max           VARCHAR(60)      NULL,
  created_at             TIMESTAMP        NULL,
  updated_at             TIMESTAMP        NULL,
  PRIMARY KEY (id),
  KEY idx_pregunta_ficha (ficha_id),
  KEY idx_pregunta_fcp (ficha_ciclo_periodo_id),
  KEY idx_pregunta_area (area_id),
  CONSTRAINT fk_pregunta_ficha FOREIGN KEY (ficha_id)
    REFERENCES ficha (id),
  CONSTRAINT fk_pregunta_fcp FOREIGN KEY (ficha_ciclo_periodo_id)
    REFERENCES ficha_ciclo_periodo (id),
  CONSTRAINT fk_pregunta_area FOREIGN KEY (area_id)
    REFERENCES area (id),
  CONSTRAINT chk_pregunta_padre CHECK (
    (ficha_id IS NOT NULL AND ficha_ciclo_periodo_id IS NULL) OR
    (ficha_id IS NULL     AND ficha_ciclo_periodo_id IS NOT NULL)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### `opcion_pregunta`

Guarda las **opciones disponibles** para preguntas de tipo `alternativa_unica`
y `respuesta_multiple`. No es la respuesta del estudiante — es el menú de
posibilidades que el admin define al diseñar la ficha. La respuesta real
(qué opción marcó el estudiante) vive en `respuesta_opcion`.

> ⚠️ Este sistema **no tiene respuestas correctas ni incorrectas**. No es un
> examen. Las opciones son señales que el estudiante reporta; el análisis de
> si algo es preocupante lo hace el docente-tutor y la IA — no el sistema de
> calificación.

**Qué tipos de pregunta usan esta tabla:**

```
tipo_pregunta = 'alternativa_unica'
"¿Cuál es tu mayor dificultad académica?"
    │
    ├──► opcion_pregunta (orden 1) → "Dificultad con los horarios"
    ├──► opcion_pregunta (orden 2) → "Falta de comprensión de temas"
    ├──► opcion_pregunta (orden 3) → "Problemas con docentes"
    └──► opcion_pregunta (orden 4) → "Falta de materiales"
         (el estudiante elige UNA sola)

tipo_pregunta = 'respuesta_multiple'
"¿Qué situaciones afectan tu bienestar?"
    │
    ├──► opcion_pregunta (orden 1) → "Estrés por las clases"
    ├──► opcion_pregunta (orden 2) → "Problemas familiares"
    ├──► opcion_pregunta (orden 3) → "Dificultades económicas"
    └──► opcion_pregunta (orden 4) → "Problemas de salud"
         (el estudiante puede elegir VARIAS)

tipo_pregunta = 'texto_abierto'  → sin filas (el estudiante escribe libremente)
tipo_pregunta = 'si_no'          → sin filas (Sí/No fijos en el frontend)
tipo_pregunta = 'escala'         → sin filas (rango definido en pregunta.escala_min/max)
```

**Relación con respuestas (vista completa del flujo):**

```
opcion_pregunta              ← define las opciones disponibles (diseño)
      │
      │  el estudiante llena la ficha y marca opciones
      ▼
respuesta_opcion             ← registra qué opción marcó el estudiante (evento)
```

Al clonar una `ficha`, las opciones se duplican junto con sus preguntas —
cada clon tiene sus propias filas `opcion_pregunta` independientes.

| Campo | Tipo | Nulo | Comentario |
|-------|------|:----:|------------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `pregunta_id` | `BIGINT UNSIGNED` | NO | FK → `pregunta(id)` — a qué pregunta pertenece esta opción |
| `texto` | `VARCHAR(255)` | NO | texto visible al estudiante (ej. "Dificultad con los horarios") |
| `orden` | `SMALLINT` | NO | orden de aparición entre las opciones de esa pregunta |
| `created_at` | `TIMESTAMP` | SÍ | auditoría |
| `updated_at` | `TIMESTAMP` | SÍ | auditoría |

**Índices:** PK (`id`) · índice en `pregunta_id`.

**Ejemplo de filas:**

| pregunta_id | texto | orden |
|---|---|---|
| 4 | Dificultad con los horarios | 1 |
| 4 | Falta de comprensión de temas | 2 |
| 4 | Problemas con docentes | 3 |
| 4 | Falta de materiales | 4 |

```sql
CREATE TABLE opcion_pregunta (
  id           BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  pregunta_id  BIGINT UNSIGNED  NOT NULL,
  texto        VARCHAR(255)     NOT NULL,
  orden        SMALLINT         NOT NULL,
  created_at   TIMESTAMP        NULL,
  updated_at   TIMESTAMP        NULL,
  PRIMARY KEY (id),
  KEY idx_opcion_pregunta_pregunta (pregunta_id),
  CONSTRAINT fk_opcion_pregunta_pregunta FOREIGN KEY (pregunta_id) REFERENCES pregunta (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### `ficha_ciclo_periodo`

Es **la ficha del docente** en un ciclo+período: la que sus estudiantes llenan.
El docente la obtiene **clonando una plantilla** (`ficha`) o **creándola de
cero**, y la **personaliza** (sus preguntas son filas propias y editables). Cada
docente arma **sus** fichas — uno puede tener 8 y otro 6 en el mismo ciclo — y
las **habilita** a su ritmo. Editar la plantilla original **no** la afecta.

```
ficha (biblioteca de plantillas, admin)
    │  el DOCENTE clona (o crea de cero) para SU ciclo → copia independiente
    ▼
ficha_ciclo_periodo (id=10)
    │   docente_id = A          ← dueño
    │   ficha_origen_id = 1     ← plantilla de origen (NULL si es de cero)
    │   ciclo_periodo_id = 5    ← a qué ciclo+período
    │   habilitada = 0/1        ← si los estudiantes ya pueden llenarla
    │
    ├──► preguntas propias (fcp_id=10), editables por el docente
    └──► sus 16 estudiantes la llenan cuando está habilitada
         (Docente B tiene SUS propias fichas, distintas)
```

- `ficha_origen_id` es **solo trazabilidad** (de qué plantilla vino, o NULL).
- El estudiante ve las fichas de **su** tutor (`docente_id`) que estén
  **`habilitada = 1`**; las no habilitadas se muestran 🔒 bloqueadas.

| Campo | Tipo | Nulo | Comentario |
|-------|------|:----:|------------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `ciclo_periodo_id` | `BIGINT UNSIGNED` | NO | FK → `ciclo_periodo(id)` — a qué ciclo+período |
| `docente_id` | `BIGINT UNSIGNED` | NO | FK → `docente(id)` — **dueño** (quién la creó/usa) |
| `ficha_origen_id` | `BIGINT UNSIGNED` | SÍ | FK → `ficha(id)` — plantilla clonada (**NULL** = de cero); solo trazabilidad |
| `tipo_ficha_id` | `BIGINT UNSIGNED` | NO | FK → `tipo_ficha(id)` — propio (copiado del origen o elegido) |
| `nombre` | `VARCHAR(150)` | NO | propio (personalizable tras el clon) |
| `descripcion` | `TEXT` | SÍ | propia |
| `habilitada` | `TINYINT(1)` | NO | DEFAULT `0` — si los estudiantes ya pueden llenarla |
| `created_at` | `TIMESTAMP` | SÍ | auditoría |
| `updated_at` | `TIMESTAMP` | SÍ | auditoría |

**Índices:** PK (`id`) · índice en `ciclo_periodo_id` · `docente_id` ·
`ficha_origen_id`. **Sin UNIQUE:** un docente puede tener **varias** fichas en el
mismo ciclo+período.

**Ejemplo de filas:**

| id | docente_id | ciclo_periodo_id | ficha_origen_id | nombre | habilitada |
|----|-----------|------------------|-----------------|--------|:---------:|
| 10 | A | 5 | 1 | Diagnóstica inicial | 1 |
| 11 | A | 5 | 2 | Seguimiento mensual | 0 |
| 12 | B | 5 | NULL | Mi ficha de bienestar (de cero) | 1 |

```sql
CREATE TABLE ficha_ciclo_periodo (
  id                BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  ciclo_periodo_id  BIGINT UNSIGNED  NOT NULL,
  docente_id        BIGINT UNSIGNED  NOT NULL,
  ficha_origen_id   BIGINT UNSIGNED  NULL,
  tipo_ficha_id     BIGINT UNSIGNED  NOT NULL,
  nombre            VARCHAR(150)     NOT NULL,
  descripcion       TEXT             NULL,
  habilitada        TINYINT(1)       NOT NULL DEFAULT 0,
  created_at        TIMESTAMP        NULL,
  updated_at        TIMESTAMP        NULL,
  PRIMARY KEY (id),
  KEY idx_fcp_ciclo_periodo (ciclo_periodo_id),
  KEY idx_fcp_docente (docente_id),
  KEY idx_fcp_origen (ficha_origen_id),
  CONSTRAINT fk_fcp_ciclo_periodo FOREIGN KEY (ciclo_periodo_id) REFERENCES ciclo_periodo (id),
  CONSTRAINT fk_fcp_docente       FOREIGN KEY (docente_id)       REFERENCES docente (id),
  CONSTRAINT fk_fcp_origen        FOREIGN KEY (ficha_origen_id)  REFERENCES ficha (id),
  CONSTRAINT fk_fcp_tipo_ficha    FOREIGN KEY (tipo_ficha_id)    REFERENCES tipo_ficha (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### `ficha_llenada`

Registra el **evento** de que un estudiante llenó (o está llenando) una
`ficha_ciclo_periodo`. Es el encabezado del formulario completado — no guarda
las respuestas en sí (esas van en `respuesta`), solo dice *quién*, *qué
ficha* y *en qué estado está*.

> **Decisión de diseño — Borrador en BD (Opción C):**
> Se agregó el campo `estado` para soportar el flujo borrador → enviada.
> Sin este campo, un estudiante que pierde conexión a mitad de la ficha
> perdería todo su avance. Con él, las respuestas se guardan de forma
> incremental y el estudiante puede retomar desde cualquier dispositivo.
> El campo `fecha_llenado` fue renombrado a `fecha_enviado` (nullable) para
> reflejar que solo se registra al momento del envío final; `created_at`
> ya captura cuándo el estudiante comenzó a llenar.

**Flujo de estados:**

```
Estudiante abre la ficha
        │
        ▼
ficha_llenada  estado='borrador'  fecha_enviado=NULL
        │
        │  respuestas se van guardando incrementalmente en `respuesta`
        │
        ├── [pierde internet / cierra la app]
        │         │
        │         └──► vuelve más tarde, retoma desde donde lo dejó ✅
        │
        └── [envía la ficha completa]
                  │
                  ▼
        ficha_llenada  estado='enviada'  fecha_enviado=2026-03-15
                  │
                  └──► la IA la toma para analizar y generar alertas
```

**Reglas de negocio (aplicación, no BD):**

```
✅ Un estudiante puede tener máximo UN borrador por ficha_ciclo_periodo
   a la vez — no puede abrir dos borradores de la misma ficha.
✅ Una ficha enviada es DEFINITIVA — no puede volver a estado borrador.
✅ La IA solo analiza fichas con estado = 'enviada'.
✅ Reportes, conteos y estadísticas solo consideran estado = 'enviada'.
⏳ Borradores sin actividad por más de N días pueden auto-expirarse
   (lógica de background job — fuera de alcance del mockup por ahora).
```

**Qué se gana con este diseño:**

```
Sin borrador (diseño anterior)        Con borrador en BD (diseño actual)
──────────────────────────────────    ──────────────────────────────────
Se fue el internet → pierde todo      Se fue el internet → retoma donde quedó
Solo funciona en un dispositivo       Funciona en cualquier dispositivo
Ficha larga = riesgo alto             Ficha larga = sin problema
Datos limpios (solo completas)        Datos igual de limpios (filtro por estado)
```

| Campo | Tipo | Nulo | Comentario |
|-------|------|:----:|------------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `estudiante_id` | `BIGINT UNSIGNED` | NO | FK → `estudiante(id)` — quién está llenando la ficha |
| `ficha_ciclo_periodo_id` | `BIGINT UNSIGNED` | NO | FK → `ficha_ciclo_periodo(id)` — qué ficha está llenando |
| `estado` | `VARCHAR(20)` | NO | DEFAULT `'borrador'` — valores válidos: `borrador` (en progreso) · `enviada` (completada y definitiva) — validado en aplicación |
| `fecha_enviado` | `TIMESTAMP` | SÍ | NULL mientras es borrador; se llena al momento del envío final — `TIMESTAMP` (no `DATE`) para conservar la hora exacta |
| `revisada` | `TINYINT(1)` | NO | DEFAULT `0` — el docente-tutor marcó que ya leyó y revisó las respuestas (no cambia el estado del estudiante) |
| `created_at` | `TIMESTAMP` | SÍ | cuándo el estudiante comenzó a llenar la ficha |
| `updated_at` | `TIMESTAMP` | SÍ | última vez que guardó progreso |

**Índices:** PK (`id`) · **UNIQUE (`estudiante_id`, `ficha_ciclo_periodo_id`)** —
un estudiante solo puede tener un registro (borrador o enviado) por ficha asignada;
el seguimiento mensual usa múltiples `ficha_ciclo_periodo` separadas, no múltiples
llenados del mismo FCP · índice en `estado` (cola de la IA: `estado = 'enviada'`).

**Ejemplo de filas:**

| estudiante | ficha_ciclo_periodo | estado | fecha_enviado | created_at |
|---|---|---|---|---|
| Juan Pérez | Ficha diagnóstica · 1° ciclo 2026-I | `enviada` | 2026-03-15 | 2026-03-15 08:30 |
| María López | Ficha diagnóstica · 1° ciclo 2026-I | `borrador` | NULL | 2026-03-15 09:10 |
| Carlos Ríos | Ficha diagnóstica · 1° ciclo 2026-I | `enviada` | 2026-03-16 | 2026-03-16 10:05 |

```sql
CREATE TABLE ficha_llenada (
  id                       BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  estudiante_id            BIGINT UNSIGNED  NOT NULL,
  ficha_ciclo_periodo_id   BIGINT UNSIGNED  NOT NULL,
  estado                   VARCHAR(20)      NOT NULL DEFAULT 'borrador',
  fecha_enviado            TIMESTAMP        NULL,
  revisada                 TINYINT(1)       NOT NULL DEFAULT 0,
  created_at               TIMESTAMP        NULL,
  updated_at               TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ficha_llenada (estudiante_id, ficha_ciclo_periodo_id),
  KEY idx_ficha_llenada_estado (estado),
  CONSTRAINT fk_fl_estudiante FOREIGN KEY (estudiante_id)          REFERENCES estudiante (id),
  CONSTRAINT fk_fl_fcp        FOREIGN KEY (ficha_ciclo_periodo_id) REFERENCES ficha_ciclo_periodo (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### `respuesta`

Guarda la respuesta de un estudiante a **cada pregunta individual** dentro
de una `ficha_llenada`. Por cada pregunta de la ficha hay exactamente una
fila `respuesta`. Esta tabla NO almacena qué opciones marcó el estudiante
en preguntas de selección — eso vive en `respuesta_opcion`.

**Cómo se almacena según el tipo de pregunta:**

```
tipo_pregunta = 'texto_abierto'
  respuesta_texto = "Me cuesta adaptarme, extraño a mi familia..."
  respuesta_valor = NULL
  → sin filas en respuesta_opcion

tipo_pregunta = 'escala'
  respuesta_texto = NULL
  respuesta_valor = 2   ← el número elegido (ej. en escala 1-5)
  → sin filas en respuesta_opcion

tipo_pregunta = 'si_no'
tipo_pregunta = 'alternativa_unica'
tipo_pregunta = 'respuesta_multiple'
  respuesta_texto = NULL
  respuesta_valor = NULL
  → las opciones marcadas van en respuesta_opcion (tabla aparte)
```

**Cómo el backend reconstruye la ficha completa para la IA o el tutor:**

```
ficha_llenada (Juan Pérez · Ficha diagnóstica · 2026-03-15 · enviada)
    │
    ├── pregunta "¿Cómo te adaptas a la universidad?"
    │   área: Personal y social · tipo: texto_abierto
    │   └── respuesta_texto: "Me cuesta adaptarme, extraño a mi familia..."
    │
    ├── pregunta "Califica tu bienestar emocional"
    │   área: Salud mental · tipo: escala (1-5)
    │   └── respuesta_valor: 2  ← señal de alerta potencial
    │
    ├── pregunta "¿Tienes dificultades económicas?"
    │   área: Económico · tipo: si_no
    │   └── respuesta_opcion → "Sí"
    │
    └── pregunta "¿Cuál es tu mayor dificultad académica?"
        área: Académico · tipo: alternativa_unica
        └── respuesta_opcion → "Horarios"
```

El backend ensambla este bloque con JOINs y lo envía a la IA como contexto
limpio en texto. La IA nunca accede a la BD directamente — solo recibe la
ficha reconstruida. El campo `observaciones_tutor` permite al docente anotar
su lectura sobre cada respuesta puntual antes o después del análisis de la IA.

**Garantías del diseño:**

```
✅ UNIQUE (ficha_llenada_id, pregunta_id) → una sola respuesta por pregunta
✅ filtro estado = 'enviada' → la IA nunca procesa borradores
✅ JOIN con pregunta → recupera enunciado, área y tipo para el contexto
✅ JOIN con respuesta_opcion → recupera texto de opciones seleccionadas
✅ ficha_llenada_id separa respuestas de distintos estudiantes
```

| Campo | Tipo | Nulo | Comentario |
|-------|------|:----:|------------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `ficha_llenada_id` | `BIGINT UNSIGNED` | NO | FK → `ficha_llenada(id)` — a qué envío pertenece esta respuesta |
| `pregunta_id` | `BIGINT UNSIGNED` | NO | FK → `pregunta(id)` — qué pregunta se responde (debe ser de la copia clonada, no de la plantilla) |
| `respuesta_texto` | `TEXT` | SÍ | solo si `tipo_pregunta = 'texto_abierto'` — texto libre del estudiante |
| `respuesta_valor` | `TINYINT` | SÍ | solo si `tipo_pregunta = 'escala'` — número elegido en la escala (ej. `2`) |
| `observaciones_tutor` | `TEXT` | SÍ | comentario del docente-tutor sobre esta respuesta puntual — dónde detecta o no una señal de alerta |
| `created_at` | `TIMESTAMP` | SÍ | auditoría |
| `updated_at` | `TIMESTAMP` | SÍ | auditoría |

**Índices:** PK (`id`) · **UNIQUE (`ficha_llenada_id`, `pregunta_id`)** —
una sola respuesta por pregunta por envío · índice en `pregunta_id`.

**Ejemplo de filas:**

| ficha_llenada_id | pregunta_id | respuesta_texto | respuesta_valor | observaciones_tutor |
|---|---|---|---|---|
| 1 | 1 | "Me cuesta adaptarme..." | NULL | NULL |
| 1 | 2 | NULL | 2 | "Puntaje bajo — revisar en reunión" |
| 1 | 3 | NULL | NULL | NULL |
| 1 | 4 | NULL | NULL | NULL |

```sql
CREATE TABLE respuesta (
  id                  BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  ficha_llenada_id    BIGINT UNSIGNED  NOT NULL,
  pregunta_id         BIGINT UNSIGNED  NOT NULL,
  respuesta_texto     TEXT             NULL,
  respuesta_valor     TINYINT          NULL,
  observaciones_tutor TEXT             NULL,
  created_at          TIMESTAMP        NULL,
  updated_at          TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_respuesta (ficha_llenada_id, pregunta_id),
  KEY idx_respuesta_pregunta (pregunta_id),
  CONSTRAINT fk_respuesta_ficha_llenada FOREIGN KEY (ficha_llenada_id) REFERENCES ficha_llenada (id),
  CONSTRAINT fk_respuesta_pregunta      FOREIGN KEY (pregunta_id)      REFERENCES pregunta (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### `respuesta_opcion`

Tabla pivote que registra **qué opción(es) marcó el estudiante** en preguntas
de tipo `si_no`, `alternativa_unica` y `respuesta_multiple`. Existe porque
`respuesta_multiple` permite marcar varias opciones a la vez — eso no cabe
en una sola columna, se necesita una fila por opción marcada.

> **¿Por qué una tabla aparte y no una columna en `respuesta`?**
> Si guardáramos las opciones como columnas (`opcion_1`, `opcion_2`…) no
> sabríamos cuántas poner. Con una fila por opción marcada, se pueden
> registrar 1, 2, 5 o 10 opciones seleccionadas sin cambiar el esquema.

**Cómo se usa según el tipo:**

```
tipo = 'alternativa_unica'
"¿Cuál es tu mayor dificultad académica?"
Opciones disponibles (opcion_pregunta):
  [1] Horarios   [2] Comprensión   [3] Docentes   [4] Materiales

El estudiante marca [1] → UNA sola fila en respuesta_opcion:
  respuesta_id=3 · opcion_pregunta_id=1  ("Horarios")

────────────────────────────────────────────────────────

tipo = 'respuesta_multiple'
"¿Qué situaciones afectan tu bienestar?"
Opciones disponibles (opcion_pregunta):
  [1] Estrés   [2] Familia   [3] Económico   [4] Salud

El estudiante marca [1], [2] y [3] → TRES filas en respuesta_opcion:
  respuesta_id=4 · opcion_pregunta_id=1  ("Estrés")
  respuesta_id=4 · opcion_pregunta_id=2  ("Familia")
  respuesta_id=4 · opcion_pregunta_id=3  ("Económico")

────────────────────────────────────────────────────────

tipo = 'si_no'
"¿Tienes dificultades económicas?"
Opciones en BD (auto-creadas al guardar la pregunta): [1] Sí  [2] No
El frontend las muestra fijas, pero en BD existen como opcion_pregunta.

El estudiante marca "Sí" → UNA fila:
  respuesta_id=5 · opcion_pregunta_id=1  ("Sí")

────────────────────────────────────────────────────────

tipo = 'texto_abierto' → sin filas aquí (respuesta en respuesta.respuesta_texto)
tipo = 'escala'        → sin filas aquí (respuesta en respuesta.respuesta_valor)
```

**Nota sobre `si_no`:** aunque las opciones "Sí" y "No" son fijas en el
frontend (no se muestran en el constructor de fichas), sí se crean como filas
en `opcion_pregunta` automáticamente al guardar una pregunta de tipo `si_no`.
Esto mantiene el almacenamiento **uniforme**: toda selección de opción, sin
importar el tipo, pasa siempre por `respuesta_opcion`. La IA y los reportes
no necesitan lógica diferente según el tipo.

| Campo | Tipo | Nulo | Comentario |
|-------|------|:----:|------------|
| `respuesta_id` | `BIGINT UNSIGNED` | NO | FK → `respuesta(id)` — a qué respuesta pertenece |
| `opcion_pregunta_id` | `BIGINT UNSIGNED` | NO | FK → `opcion_pregunta(id)` — qué opción fue marcada |
| `created_at` | `TIMESTAMP` | SÍ | auditoría |
| `updated_at` | `TIMESTAMP` | SÍ | auditoría |

**PK compuesta:** (`respuesta_id`, `opcion_pregunta_id`) — la misma opción
no puede marcarse dos veces en la misma respuesta. Sin `id` propio: ninguna
otra tabla referencia esta por su ID.

**Ejemplo de filas:**

| respuesta_id | opcion_pregunta_id | texto de la opción |
|---|---|---|
| 3 | 1 | "Horarios" (alternativa_unica — 1 fila) |
| 4 | 5 | "Estrés por las clases" (respuesta_multiple — fila 1 de 3) |
| 4 | 6 | "Problemas familiares" (respuesta_multiple — fila 2 de 3) |
| 4 | 7 | "Dificultades económicas" (respuesta_multiple — fila 3 de 3) |
| 5 | 9 | "Sí" (si_no — 1 fila) |

```sql
CREATE TABLE respuesta_opcion (
  respuesta_id        BIGINT UNSIGNED  NOT NULL,
  opcion_pregunta_id  BIGINT UNSIGNED  NOT NULL,
  created_at          TIMESTAMP        NULL,
  updated_at          TIMESTAMP        NULL,
  PRIMARY KEY (respuesta_id, opcion_pregunta_id),
  KEY idx_respuesta_opcion_opcion (opcion_pregunta_id),
  CONSTRAINT fk_ro_respuesta       FOREIGN KEY (respuesta_id)       REFERENCES respuesta (id),
  CONSTRAINT fk_ro_opcion_pregunta FOREIGN KEY (opcion_pregunta_id) REFERENCES opcion_pregunta (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Review completo — Módulo 3

### Diagrama de relaciones

```
tipo_ficha ──────────────────────► ficha (plantilla)
                                        │
                          clona al asignar a ciclo+período
                                        │
                                        ▼
ciclo_periodo ───────────────► ficha_ciclo_periodo (copia independiente)
                                        │
                    ┌───────────────────┤
                    ▼                   ▼
               pregunta            pregunta
            (de plantilla)      (de clon — en uso real)
                    │                   │
                    └─────────┬─────────┘
                              ▼
                       opcion_pregunta
                    (opciones disponibles)
                              │
                              │  el estudiante llena la ficha
                              ▼
estudiante ────────► ficha_llenada (borrador → enviada)
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
               respuesta           respuesta
           (texto / escala)    (si_no / alt. única / múltiple)
                                         │
                                         ▼
                                  respuesta_opcion
                               (opción(es) seleccionada(s))
                                         │
                                         ▼
                                  opcion_pregunta
                               (texto de la opción marcada)
```

### Observaciones y puntos de mejora

**1. ✅ CHECK constraint en `pregunta` — incorporado al SQL**
El campo dual `ficha_id` / `ficha_ciclo_periodo_id` requiere exactamente
uno lleno. El `CREATE TABLE pregunta` ya incluye:
```sql
CONSTRAINT chk_pregunta_padre CHECK (
  (ficha_id IS NOT NULL AND ficha_ciclo_periodo_id IS NULL) OR
  (ficha_id IS NULL     AND ficha_ciclo_periodo_id IS NOT NULL)
)
```
Garantiza integridad a nivel de BD; sin él solo lo detectaría el código.

**2. ✅ `area_id` en `pregunta` es NOT NULL — confirmar si es intencional**
Toda pregunta debe pertenecer a un área. Si en el futuro hay preguntas
"neutras" (ej. "¿Cuántos años tienes?") sin área temática clara, se puede
agregar un área genérica como "General" en el catálogo — sin cambiar el
esquema.

**3. ✅ Borrador — máximo uno por (estudiante + ficha_ciclo_periodo)**
No hay UNIQUE en BD para esto porque el estudiante puede enviar la misma
ficha varias veces (ej. seguimiento mensual). La regla se valida en
aplicación: antes de crear un nuevo `ficha_llenada`, verificar que no
exista ya uno con `estado = 'borrador'` para esa combinación.

**4. ✅ `si_no` — opciones auto-creadas en BD**
Al guardar una pregunta de tipo `si_no`, el backend crea automáticamente
dos filas en `opcion_pregunta` ("Sí" orden 1, "No" orden 2). El frontend
no las muestra en el constructor pero sí las usa al guardar la respuesta
del estudiante vía `respuesta_opcion`. Almacenamiento uniforme para la IA.

**5. ✅ Clonado en orden correcto**
Al clonar una `ficha` hacia una `ficha_ciclo_periodo`, el backend debe
respetar este orden en transacción:
1. Crear `ficha_ciclo_periodo`
2. Clonar `pregunta` (guardar mapa old_id → new_id)
3. Clonar `opcion_pregunta` usando el mapa del paso 2

Sin ese mapa, las opciones clonadas podrían quedar referenciando preguntas
de la plantilla original en lugar de las clonadas.

### Veredicto

El módulo 3 es sólido y escalable. El CHECK constraint del punto 1 ya está
incorporado al SQL de `pregunta`. El UNIQUE en `ficha_llenada` garantiza que
un estudiante no pueda duplicar el llenado de la misma ficha asignada. El
esquema tiene **integridad garantizada a nivel de BD** en todos los puntos
críticos. Las reglas de aplicación restantes están bien documentadas y el
backend puede implementarlas sin ambigüedad.

**Módulo 3 — Fichas: ✔ completo** (9 tablas: `tipo_ficha`, `area`, `ficha`,
`pregunta`, `opcion_pregunta`, `ficha_ciclo_periodo`, `ficha_llenada`,
`respuesta`, `respuesta_opcion`).

---

## APIs — Módulo 3

> Mismas convenciones que M1/M2: prefijo `/api/v1`, auth Sanctum, respuesta
> `{ data, meta }`, `[CRUD]` = 5 endpoints estándar de `apiResource`.
> Los 5 tipos de pregunta son constantes de código: `texto_abierto` |
> `alternativa_unica` | `respuesta_multiple` | `si_no` | `escala`.

### Catálogos de fichas

**Tipos de ficha**

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| `GET` | `/tipos-ficha` | Listar tipos (`?activo=`, `?buscar=`) | `catalogos.gestionar` |
| `POST` | `/tipos-ficha` | Crear tipo — body: `{ clave, nombre, descripcion?, orden?, activo? }` | `catalogos.gestionar` |
| `GET` | `/tipos-ficha/{id}` | Ver tipo | `catalogos.gestionar` |
| `PUT` | `/tipos-ficha/{id}` | Editar tipo (rechaza editar `clave` si ya tiene fichas referenciadas) | `catalogos.gestionar` |
| `DELETE` | `/tipos-ficha/{id}` | Eliminar (rechaza si tiene `ficha` referenciada — usar `activo=0`) | `catalogos.gestionar` |
| `PATCH` | `/tipos-ficha/{id}/estado` | Activar / desactivar (`activo`) | `catalogos.gestionar` |

**Áreas**

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| `GET` | `/areas` | Listar áreas (`?activo=`, `?buscar=`) | `catalogos.gestionar` |
| `POST` | `/areas` | Crear área — body: `{ clave, nombre, descripcion?, activo? }` | `catalogos.gestionar` |
| `GET` | `/areas/{id}` | Ver área | `catalogos.gestionar` |
| `PUT` | `/areas/{id}` | Editar área (no cambiar `clave` si la IA la referencia) | `catalogos.gestionar` |
| `DELETE` | `/areas/{id}` | Eliminar (rechaza si tiene `pregunta` referenciada) | `catalogos.gestionar` |
| `PATCH` | `/areas/{id}/estado` | Activar / desactivar | `catalogos.gestionar` |

### Plantillas de fichas (`ficha`)

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| `GET` | `/fichas` | Listar plantillas (`?buscar=`, `?tipo_ficha_id=`, `?activo=`, paginado) — incluye conteo de preguntas y de `ficha_ciclo_periodo` activos | `fichas.ver` |
| `POST` | `/fichas` | Crear plantilla — body: `{ tipo_ficha_id, nombre, descripcion?, activo? }` | `fichas.gestionar` |
| `GET` | `/fichas/{id}` | Ver plantilla (sin preguntas — para editar encabezado) | `fichas.ver` |
| `PUT` | `/fichas/{id}` | Editar encabezado (`nombre`, `tipo_ficha_id`, `descripcion`, `activo`) | `fichas.gestionar` |
| `DELETE` | `/fichas/{id}` | Eliminar plantilla (rechaza si tiene `ficha_ciclo_periodo` — usar `activo=0`) | `fichas.gestionar` |
| `PATCH` | `/fichas/{id}/estado` | Activar / desactivar (`activo`) | `fichas.gestionar` |
| `POST` | `/fichas/{id}/duplicar` | Duplicar plantilla completa (ficha + preguntas + opciones) con nombre "Copia de…" | `fichas.gestionar` |

### Preguntas de plantilla (`pregunta` con `ficha_id`)

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| `GET` | `/fichas/{id}/preguntas` | Listar preguntas de la plantilla ordenadas por `orden`, cada una con sus `opcion_pregunta` | `fichas.ver` |
| `POST` | `/fichas/{id}/preguntas` | Agregar pregunta — body: `{ area_id, tipo_pregunta, enunciado, orden, escala_min?, escala_max?, etiqueta_min?, etiqueta_max?, opciones?: [{ texto, orden }] }` — si `tipo = si_no` crea las opciones "Sí"/"No" automáticamente | `fichas.gestionar` |
| `PUT` | `/preguntas/{id}` | Editar pregunta y reemplazar sus opciones (transacción: borra opciones viejas, inserta nuevas) | `fichas.gestionar` |
| `DELETE` | `/preguntas/{id}` | Eliminar pregunta y sus opciones en cascada (rechaza si la ficha ya tiene `ficha_ciclo_periodo` con llenados) | `fichas.gestionar` |
| `PUT` | `/fichas/{id}/preguntas/reordenar` | Reordenar preguntas — body: `[{ id, orden }]` — aplica en transacción | `fichas.gestionar` |

### Asignación de fichas a ciclo+período (`ficha_ciclo_periodo`)

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| `GET` | `/ciclos-periodos/{cp_id}/fichas` | Listar fichas asignadas al ciclo+período, con conteo de `ficha_llenada` por estado (pendiente / borrador / enviada) | `periodos.ver` |
| `POST` | `/ciclos-periodos/{cp_id}/fichas` | Asignar ficha — body: `{ ficha_id }` — clona ficha + preguntas + opciones en transacción (ver orden correcto en revisión M3); la `ficha` origen debe estar `activo=1` | `periodos.gestionar` |
| `GET` | `/ciclos-periodos/{cp_id}/fichas/{fcp_id}` | Ver la copia clonada con sus preguntas y opciones propias | `periodos.ver` |
| `DELETE` | `/ciclos-periodos/{cp_id}/fichas/{fcp_id}` | Desasignar ficha (rechaza si existen `ficha_llenada` de algún estudiante para esta copia) | `periodos.gestionar` |

### Llenado de ficha por el estudiante (`ficha_llenada` + `respuesta`)

> El estudiante solo accede a las fichas de su `ciclo_periodo` activo.
> Los endpoints usan el `estudiante_id` del usuario autenticado — no se pasa como parámetro.

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| `GET` | `/mis-fichas` | Listar las `ficha_ciclo_periodo` del `ciclo_periodo` activo del estudiante, enriquecidas con el estado de su `ficha_llenada` (sin_abrir / borrador / enviada) y `fecha_enviado` | `fichas.llenar` |
| `GET` | `/mis-fichas/{fcp_id}` | Ver la ficha (preguntas + opciones) + el borrador existente del estudiante (respuestas guardadas hasta ahora), si lo hay | `fichas.llenar` |
| `POST` | `/mis-fichas/{fcp_id}/comenzar` | Crear `ficha_llenada` con `estado = 'borrador'` (rechaza si ya existe un borrador para esa combinación estudiante+fcp) | `fichas.llenar` |
| `PUT` | `/fichas-llenadas/{fl_id}/respuestas` | Guardar progreso (upsert incremental): body: `[ { pregunta_id, respuesta_texto?, respuesta_valor?, opcion_ids?: [] } ]` — solo actualiza las preguntas enviadas, deja las demás intactas; rechaza si `estado = 'enviada'` | `fichas.llenar` |
| `POST` | `/fichas-llenadas/{fl_id}/enviar` | Enviar ficha definitivamente — valida que todas las preguntas tengan respuesta; cambia `estado` a `'enviada'` y registra `fecha_enviado`; dispara el análisis de IA (job async) | `fichas.llenar` |

**Formato de body para guardar respuestas (`PUT /fichas-llenadas/{fl_id}/respuestas`):**

```json
{
  "respuestas": [
    { "pregunta_id": 4, "respuesta_texto": "Me siento bien adaptado..." },
    { "pregunta_id": 5, "respuesta_valor": 3 },
    { "pregunta_id": 6, "opcion_ids": [12] },
    { "pregunta_id": 7, "opcion_ids": [15, 17, 18] },
    { "pregunta_id": 8, "opcion_ids": [22] }
  ]
}
```

> Regla: `respuesta_texto` para `texto_abierto`; `respuesta_valor` para `escala`;
> `opcion_ids` para `si_no`, `alternativa_unica` y `respuesta_multiple`.

### Vista docente — revisión de fichas llenadas

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| `GET` | `/mis-tutorados/fichas` | Listar fichas asignadas al(os) ciclo+período del docente autenticado, con conteo de estudiantes por estado | `fichas.ver_tutorados` |
| `GET` | `/ciclos-periodos/{cp_id}/fichas/{fcp_id}/tutorados` | Estado de llenado de cada tutorado del docente en esa ficha: `[ { estudiante, estado, fecha_enviado, ficha_llenada_id? } ]` | `fichas.ver_tutorados` |
| `GET` | `/fichas-llenadas/{fl_id}` | Detalle completo de una `ficha_llenada` enviada: preguntas + respuestas + opciones marcadas + observaciones del tutor | `fichas.ver_tutorados` |
| `PATCH` | `/fichas-llenadas/{fl_id}/respuestas/{respuesta_id}/observacion` | Guardar / actualizar observación del tutor sobre una respuesta — body: `{ observaciones_tutor: "..." }` | `fichas.ver_tutorados` |
| `PATCH` | `/fichas-llenadas/{fl_id}/marcar-revisada` | Marcar la ficha como revisada por el tutor (campo `revisada` en `ficha_llenada`) | `fichas.ver_tutorados` |

**Formato de respuesta para `GET /fichas-llenadas/{fl_id}`:**

```json
{
  "data": {
    "id": 42,
    "estudiante": { "id": 7, "nombre_completo": "Ana Lucía Quispe Mamani", "codigo": "2022-AD-0021" },
    "ficha_ciclo_periodo": { "id": 10, "nombre": "Ficha diagnóstica inicial" },
    "estado": "enviada",
    "fecha_enviado": "2026-03-18T14:23:05.000000Z",
    "revisada": false,
    "respuestas": [
      {
        "id": 101,
        "pregunta": {
          "id": 4, "orden": 1, "enunciado": "¿Es tu primera vez...?",
          "tipo_pregunta": "si_no",
          "area": { "id": 1, "nombre": "Adaptación universitaria", "clave": "personal_social" }
        },
        "respuesta_texto": null,
        "respuesta_valor": null,
        "opciones_marcadas": [ { "id": 9, "texto": "Sí" } ],
        "observaciones_tutor": null
      },
      {
        "id": 102,
        "pregunta": {
          "id": 5, "orden": 2, "enunciado": "¿Cómo calificarías tu bienestar...?",
          "tipo_pregunta": "escala",
          "escala_min": 1, "escala_max": 5,
          "etiqueta_min": "Muy mal", "etiqueta_max": "Muy bien",
          "area": { "id": 2, "nombre": "Bienestar personal", "clave": "salud_mental" }
        },
        "respuesta_texto": null,
        "respuesta_valor": 3,
        "opciones_marcadas": [],
        "observaciones_tutor": "Puntaje medio, hacer seguimiento."
      }
    ]
  }
}
```

---

**Módulo 3 — APIs: ✔ completo**

---

## Módulo 4 — IA / Alertas / Derivación

**Decisiones de diseño transversales a este módulo:**

```
[Decisión 1 — Historial como contexto de la IA]
El backend incluye en el prompt no solo la ficha actual, sino TODAS las
fichas anteriores del estudiante (respuestas + alertas previas) ordenadas
cronológicamente. La IA detecta tendencias, no solo instantáneas.
→ No requiere cambio de esquema. Es diseño del prompt.

[Decisión 2 — La IA sugiere a dónde derivar]
Además del nivel y área de alerta, la IA sugiere qué EntidadReceptora
sería la más adecuada. Se guarda en alerta_ia.entidad_receptora_sugerida_id
(nullable). El docente siempre puede ignorarla — es orientativa, nunca
vinculante.
```

**Mapa de relaciones del módulo:**

```
ficha_llenada ──► alerta_ia ──────────────────────────────► area
(Módulo 3)            │        nivel: Baja/Media/Alta
                      │        estado: pendiente/revisada/
                      │                derivada/descartada
                      │        entidad_sugerida (nullable) ──► entidad_receptora
                      │
                      │  docente revisa y decide derivar
                      ▼
                 derivacion ──────────────────────────────► entidad_receptora
                      ├──────────────────────────────────► tipo_estado_derivacion
                      │        estado actual del caso
                      │
                      └── motivo  (texto del docente al crear la derivación)
                          nota    (texto del receptor; historial de cambios en auditoria)
```

### `entidad_receptora` (catálogo)

Define los destinos a los que un docente-tutor puede derivar a un estudiante
cuando detecta una señal de alerta. Catálogo abierto — se agregan nuevas
entidades sin tocar código.

Esta entidad tiene dos usos en el módulo:
- En `derivacion` → indica el tipo de entidad a la que se deriva el caso.
- En `alerta_ia.entidad_receptora_sugerida_id` → la IA sugiere la entidad
  más adecuada según el área y severidad detectadas.
- Como referencia para validar que el `usuario_receptor` en `derivacion`
  tenga el rol compatible con la entidad (regla de aplicación — ver
  `derivacion`).

La `clave` es necesaria porque el backend la usa para validar roles y porque
el modelo de IA la incluye en su respuesta JSON — si la validación dependiera
del nombre visible y alguien lo renombra, el sistema se rompe.

| Campo | Tipo | Nulo | Comentario |
|-------|------|:----:|------------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `clave` | `VARCHAR(40)` | NO | **UNIQUE** — identificador estable para backend e IA (`psicologia`, `servicios_medicos`, `bienestar`) |
| `nombre` | `VARCHAR(120)` | NO | **UNIQUE** — nombre visible ("Psicología", "Servicios médicos") |
| `descripcion` | `VARCHAR(255)` | SÍ | descripción del área y qué tipo de casos recibe |
| `activo` | `TINYINT(1)` | NO | DEFAULT `1` |
| `created_at` | `TIMESTAMP` | SÍ | auditoría |
| `updated_at` | `TIMESTAMP` | SÍ | auditoría |

**Índices:** PK (`id`) · UNIQUE (`clave`) · UNIQUE (`nombre`). Sin `deleted_at`
(catálogo → `activo`).

**Ejemplo de filas seed:**

| clave | nombre | descripcion |
|---|---|---|
| `psicologia` | Psicología | Atención de casos de salud mental, estrés severo, consumo de sustancias |
| `servicios_medicos` | Servicios médicos | Atención de casos de salud física |
| `bienestar` | Bienestar universitario | Apoyo social, económico y de integración |

```sql
CREATE TABLE entidad_receptora (
  id           BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  clave        VARCHAR(40)      NOT NULL,
  nombre       VARCHAR(120)     NOT NULL,
  descripcion  VARCHAR(255)     NULL,
  activo       TINYINT(1)       NOT NULL DEFAULT 1,
  created_at   TIMESTAMP        NULL,
  updated_at   TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_entidad_receptora_clave (clave),
  UNIQUE KEY uq_entidad_receptora_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### `tipo_estado_derivacion` (catálogo)

Define los estados por los que puede pasar una derivación desde que el
docente la crea hasta que se cierra. **Cada `entidad_receptora` tiene su
propio conjunto de estados** (Opción B confirmada) — Psicología puede tener
pasos distintos a Servicios médicos, y ambos pueden evolucionar de forma
independiente en el futuro.

**Cómo evoluciona sin romper el historial:**

```
Hoy — Psicología tiene 5 pasos (todos activo=1):
  1. Derivado → 2. En evaluación → 3. En terapia → 4. Resuelto → 5. Cerrado

En 3 años deciden simplificar a 4 pasos:
  · tipo_estado (en_evaluacion, activo=0)  ← retirado, FILA EXISTE
  · tipo_estado (en_terapia,    activo=0)  ← retirado, FILA EXISTE
  · tipo_estado (en_atencion,   activo=1)  ← nuevo estado agregado

Derivaciones ANTIGUAS → siguen referenciando en_evaluacion / en_terapia
                        sin romper FK — se muestran en historial como
                        "estado retirado" pero son legibles
Derivaciones NUEVAS   → solo ven estados con activo=1
```

**Línea de tiempo visual (ejemplo por entidad):**

```
Psicología:
  [1] Derivado → [2] En evaluación psicológica → [3] En terapia
  → [4] Resuelto → [5] Cerrado

Servicios médicos:
  [1] Derivado → [2] En consulta médica → [3] En tratamiento
  → [4] Alta médica → [5] Cerrado

Bienestar universitario:
  [1] Derivado → [2] En atención → [3] Apoyo activo
  → [4] Resuelto → [5] Cerrado
```

| Campo | Tipo | Nulo | Comentario |
|-------|------|:----:|------------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `entidad_receptora_id` | `BIGINT UNSIGNED` | NO | FK → `entidad_receptora(id)` — a qué entidad pertenece este estado |
| `clave` | `VARCHAR(40)` | NO | identificador estable dentro de la entidad (`derivado`, `en_evaluacion`, `en_terapia`, `resuelto`, `cerrado`) — UNIQUE por entidad |
| `nombre` | `VARCHAR(80)` | NO | nombre visible en la UI ("En evaluación psicológica") — puede repetirse entre entidades |
| `orden` | `SMALLINT` | NO | posición en la línea de tiempo dentro de la entidad — UNIQUE por entidad |
| `activo` | `TINYINT(1)` | NO | DEFAULT `1` — desactivar retira el estado de nuevas derivaciones sin romper el historial existente |
| `created_at` | `TIMESTAMP` | SÍ | auditoría |
| `updated_at` | `TIMESTAMP` | SÍ | auditoría |

**Índices:** PK (`id`) · **UNIQUE (`entidad_receptora_id`, `clave`)** —
clave única dentro de cada entidad · **UNIQUE (`entidad_receptora_id`,
`orden`)** — sin dos estados en la misma posición dentro de la misma
entidad · índice en `entidad_receptora_id`.

**Reglas de evolución (aplicación):**

```
✅ Quitar un paso   → activo = 0 (historial preservado, FK intacta)
✅ Agregar un paso  → nueva fila con nuevo orden
✅ Reordenar        → actualizar orden en transacción (mismo patrón que ciclo.orden)
✅ Renombrar        → editar nombre (la clave no cambia → historial consistente)
✅ Cambio total     → desactivar todos los anteriores, crear los nuevos
```

**Ejemplo de filas seed:**

| entidad_receptora | orden | clave | nombre |
|---|---|---|---|
| Psicología | 1 | `derivado` | Derivado |
| Psicología | 2 | `en_evaluacion` | En evaluación psicológica |
| Psicología | 3 | `en_terapia` | En terapia |
| Psicología | 4 | `resuelto` | Resuelto |
| Psicología | 5 | `cerrado` | Cerrado |
| Servicios médicos | 1 | `derivado` | Derivado |
| Servicios médicos | 2 | `en_consulta` | En consulta médica |
| Servicios médicos | 3 | `en_tratamiento` | En tratamiento |
| Servicios médicos | 4 | `alta_medica` | Alta médica |
| Servicios médicos | 5 | `cerrado` | Cerrado |

```sql
CREATE TABLE tipo_estado_derivacion (
  id                    BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  entidad_receptora_id  BIGINT UNSIGNED  NOT NULL,
  clave                 VARCHAR(40)      NOT NULL,
  nombre                VARCHAR(80)      NOT NULL,
  orden                 SMALLINT         NOT NULL,
  activo                TINYINT(1)       NOT NULL DEFAULT 1,
  created_at            TIMESTAMP        NULL,
  updated_at            TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ted_entidad_clave  (entidad_receptora_id, clave),
  UNIQUE KEY uq_ted_entidad_orden  (entidad_receptora_id, orden),
  KEY idx_ted_entidad_receptora    (entidad_receptora_id),
  CONSTRAINT fk_ted_entidad_receptora
    FOREIGN KEY (entidad_receptora_id) REFERENCES entidad_receptora (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### `alerta_ia`

Guarda el resultado del análisis que hace el modelo de IA sobre una
`ficha_llenada` enviada. Por cada área donde se detecta una señal se genera
**una fila independiente** — sin límite de alertas por ficha. Si el
estudiante no muestra ninguna señal, no se crea ninguna fila.

**Cuántas alertas puede generar una ficha:**

```
Una ficha enviada puede generar CERO, UNA o MUCHAS alertas:

Caso 1 — Sin señales:
  ficha_llenada → (ninguna fila en alerta_ia)
  El estudiante está bien.

Caso 2 — Una señal:
  ficha_llenada → alerta_ia (Salud mental · Alta)

Caso 3 — Varias señales en distintas áreas:
  ficha_llenada → alerta_ia (Salud mental   · Alta)
                → alerta_ia (Económico       · Media)
                → alerta_ia (Académico        · Baja)

Caso 4 — Muchas señales (sin límite superior):
  ficha_llenada → alerta_ia (área 1) → alerta_ia (área 2)
                → alerta_ia (área 3) → alerta_ia (área 4) → ...
```

**Lo que SÍ está controlado:** no puede haber dos alertas del mismo área
para la misma ficha — no tendría sentido que la IA genere dos alertas de
"Salud mental" del mismo análisis. Se garantiza con UNIQUE
(`ficha_llenada_id`, `area_id`).

**Cómo la IA construye el contexto antes de analizar:**

```
Backend ensambla el prompt con:
  [1] Ficha actual (preguntas + respuestas del estudiante)
  [2] Historial completo del estudiante:
        · fichas anteriores ordenadas cronológicamente
        · alertas previas generadas (nivel, área, justificación)
        · tendencia detectada (mejora / deterioro / estabilidad)

IA devuelve JSON estructurado:
  {
    "alertas": [
      {
        "area_clave":              "salud_mental",
        "nivel_alerta":            "Alta",
        "justificacion":           "Tendencia de 3 períodos a la baja...",
        "entidad_sugerida_clave":  "psicologia"
      },
      {
        "area_clave":              "economico",
        "nivel_alerta":            "Media",
        "justificacion":           "Reporta dificultades económicas...",
        "entidad_sugerida_clave":  null
      }
    ]
  }

Backend mapea area_clave → area.id y entidad_sugerida_clave →
entidad_receptora.id, luego inserta una fila alerta_ia por cada objeto.
```

| Campo | Tipo | Nulo | Comentario |
|-------|------|:----:|------------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `ficha_llenada_id` | `BIGINT UNSIGNED` | NO | FK → `ficha_llenada(id)` — qué ficha originó esta alerta |
| `area_id` | `BIGINT UNSIGNED` | NO | FK → `area(id)` — área donde se detectó la señal |
| `docente_id` | `BIGINT UNSIGNED` | NO | FK → `docente(id)` — tutor a quien se notifica (el tutor del estudiante en ese ciclo+período) |
| `nivel_alerta` | `VARCHAR(10)` | NO | constante fija: `Baja` · `Media` · `Alta` — validado en aplicación |
| `justificacion` | `TEXT` | NO | texto generado por la IA explicando por qué detectó la señal |
| `entidad_receptora_sugerida_id` | `BIGINT UNSIGNED` | SÍ | FK → `entidad_receptora(id)` — entidad que la IA sugiere para derivar; NULL si no tiene certeza suficiente |
| `estado` | `VARCHAR(20)` | NO | DEFAULT `'pendiente'` — constantes fijas: `pendiente` · `revisada` · `derivada` · `descartada` — validado en aplicación |
| `fecha_generada` | `TIMESTAMP` | NO | cuándo generó la alerta la IA |
| `created_at` | `TIMESTAMP` | SÍ | auditoría |
| `updated_at` | `TIMESTAMP` | SÍ | auditoría |

**Índices:** PK (`id`) · **UNIQUE (`ficha_llenada_id`, `area_id`)** — una
sola alerta por área por ficha · índice en `docente_id` · índice en `estado`
(filtrar alertas pendientes eficientemente) · índice en
`entidad_receptora_sugerida_id`.

**Ejemplo de filas:**

| ficha_llenada | area | nivel | justificacion | entidad_sugerida | estado |
|---|---|---|---|---|---|
| Juan Pérez · 2026-03-15 | Salud mental | Alta | "Tendencia de 3 períodos a la baja en bienestar, respuestas indican aislamiento" | Psicología | pendiente |
| Juan Pérez · 2026-03-15 | Económico | Media | "Reporta dificultades económicas en dos períodos consecutivos" | Bienestar universitario | pendiente |

```sql
CREATE TABLE alerta_ia (
  id                              BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  ficha_llenada_id                BIGINT UNSIGNED  NOT NULL,
  area_id                         BIGINT UNSIGNED  NOT NULL,
  docente_id                      BIGINT UNSIGNED  NOT NULL,
  nivel_alerta                    VARCHAR(10)      NOT NULL,
  justificacion                   TEXT             NOT NULL,
  entidad_receptora_sugerida_id   BIGINT UNSIGNED  NULL,
  estado                          VARCHAR(20)      NOT NULL DEFAULT 'pendiente',
  fecha_generada                  TIMESTAMP        NOT NULL,
  created_at                      TIMESTAMP        NULL,
  updated_at                      TIMESTAMP        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_alerta_ficha_area (ficha_llenada_id, area_id),
  KEY idx_alerta_docente          (docente_id),
  KEY idx_alerta_estado           (estado),
  KEY idx_alerta_entidad_sugerida (entidad_receptora_sugerida_id),
  CONSTRAINT fk_alerta_ficha_llenada  FOREIGN KEY (ficha_llenada_id)              REFERENCES ficha_llenada (id),
  CONSTRAINT fk_alerta_area           FOREIGN KEY (area_id)                       REFERENCES area (id),
  CONSTRAINT fk_alerta_docente        FOREIGN KEY (docente_id)                    REFERENCES docente (id),
  CONSTRAINT fk_alerta_entidad_sug    FOREIGN KEY (entidad_receptora_sugerida_id) REFERENCES entidad_receptora (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### `derivacion` — expediente de derivación

Registra la decisión formal del docente-tutor de enviar a un estudiante a una
entidad receptora (psicología, bienestar universitario, servicios médicos, etc.)
tras detectar una señal de alerta. Es el **expediente del caso**: quién deriva
a quién, a dónde, por qué y en qué estado está ahora.

**Dos orígenes posibles:**
- **Desde una alerta IA:** el docente revisa una `alerta_ia` (estado `pendiente`)
  y decide actuar — `alerta_ia_id` apunta a esa alerta, que pasa a `derivada`.
- **Manual:** el docente detecta la situación en una conversación sin que la IA
  la haya marcado — `alerta_ia_id` es `NULL`.

```
[Decisión de diseño — eliminación de `estado_derivacion`]

La tabla `estado_derivacion` (historial de transiciones de estado) fue
ELIMINADA del esquema. La trazabilidad completa de quién cambió el estado,
cuándo y desde qué valor anterior ya está cubierta por la tabla `auditoria`,
que captura automáticamente cada UPDATE sobre `derivacion` (campo
`tipo_estado_derivacion_id`) con usuario, timestamp, valor anterior y nuevo.

Duplicar esa información en una segunda tabla solo añadiría peso sin aportar
datos que `auditoria` no tenga. La única información adicional que
`estado_derivacion` hubiera aportado — notas contextuales del receptor por
cada cambio de estado — se resuelve con la columna `nota TEXT NULL` en la
propia tabla `derivacion`: el receptor actualiza la nota al mover el estado,
y `auditoria` conserva el historial de todas las versiones anteriores.
```

| Campo | Tipo | Nulo | Notas |
|-------|------|:----:|-------|
| `id` | `BIGINT UNSIGNED` | NO | PK, AUTO_INCREMENT |
| `estudiante_id` | `BIGINT UNSIGNED` | NO | FK → `estudiante(id)` — quién es derivado |
| `docente_id` | `BIGINT UNSIGNED` | NO | FK → `docente(id)` — tutor que crea la derivación |
| `entidad_receptora_id` | `BIGINT UNSIGNED` | NO | FK → `entidad_receptora(id)` — a dónde se deriva el caso |
| `alerta_ia_id` | `BIGINT UNSIGNED` | SÍ | FK → `alerta_ia(id)` — alerta que originó la derivación; `NULL` si fue manual |
| `tipo_estado_derivacion_id` | `BIGINT UNSIGNED` | NO | FK → `tipo_estado_derivacion(id)` — **estado actual** del caso (desnormalizado para consultas eficientes; el historial de cambios está en `auditoria`) |
| `motivo` | `TEXT` | NO | Texto libre del docente explicando por qué deriva al estudiante |
| `nota` | `TEXT` | SÍ | Observación actual del receptor sobre el avance del caso; se sobreescribe con cada actualización — `auditoria` conserva el historial de versiones anteriores |
| `created_at` | `TIMESTAMP` | SÍ | |
| `updated_at` | `TIMESTAMP` | SÍ | |

**Índices:** PK (`id`) · índice en `estudiante_id` (todas las derivaciones de un estudiante)
· índice en `docente_id` (todos los casos creados por un tutor) · índice en
`entidad_receptora_id` (cola de casos por entidad) · índice en
`tipo_estado_derivacion_id` (filtrar por estado activo) · índice en `alerta_ia_id`.

**Reglas de aplicación (no de FK):**
- El `tipo_estado_derivacion_id` inicial al crear la derivación debe ser el primer
  estado activo de la entidad destino (`orden = 1, activo = 1` en
  `tipo_estado_derivacion` para ese `entidad_receptora_id`). El sistema lo
  asigna automáticamente — el docente no elige el estado, solo elige a dónde deriva.
- **Integridad cruzada no garantizable por FK:** la BD no puede verificar con una
  FK estándar que `tipo_estado_derivacion_id` pertenezca a la misma
  `entidad_receptora_id` de la derivación. Esta regla **debe validarse en
  aplicación** al crear y al cambiar de estado: `SELECT id FROM
  tipo_estado_derivacion WHERE id = ? AND entidad_receptora_id = ?`. El receptor
  que gestiona su entidad solo ve los estados de su entidad en la UI — nunca
  debería poder seleccionar un estado de otra.
- Al crear la derivación desde una alerta IA, el backend actualiza
  `alerta_ia.estado` a `derivada` en la misma transacción.
- Un estudiante puede tener múltiples derivaciones activas simultáneas (a distintas
  entidades) o a lo largo del tiempo — no hay `UNIQUE` sobre `(estudiante_id,
  entidad_receptora_id)`.
- **Sin `deleted_at`:** los expedientes de derivación no se eliminan ni borran
  lógicamente. Son registros de bienestar con trazabilidad obligatoria.

**Ejemplo de filas:**

| estudiante | docente | entidad | alerta_ia_id | estado_actual | motivo |
|---|---|---|---|---|---|
| Ana Quispe | Ricardo Vargas | Psicología | 12 | En evaluación | "Respuestas indican aislamiento sostenido en tres períodos" |
| Luis Mamani | Ricardo Vargas | Bienestar universitario | NULL | En atención | "Comentó en sesión de tutoría dificultades económicas graves" |

```sql
CREATE TABLE derivacion (
  id                          BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  estudiante_id               BIGINT UNSIGNED  NOT NULL,
  docente_id                  BIGINT UNSIGNED  NOT NULL,
  entidad_receptora_id        BIGINT UNSIGNED  NOT NULL,
  alerta_ia_id                BIGINT UNSIGNED  NULL,
  tipo_estado_derivacion_id   BIGINT UNSIGNED  NOT NULL,
  motivo                      TEXT             NOT NULL,
  nota                        TEXT             NULL,
  created_at                  TIMESTAMP        NULL,
  updated_at                  TIMESTAMP        NULL,
  PRIMARY KEY (id),
  KEY idx_derivacion_estudiante   (estudiante_id),
  KEY idx_derivacion_docente      (docente_id),
  KEY idx_derivacion_entidad      (entidad_receptora_id),
  KEY idx_derivacion_estado       (tipo_estado_derivacion_id),
  KEY idx_derivacion_alerta       (alerta_ia_id),
  CONSTRAINT fk_derivacion_estudiante   FOREIGN KEY (estudiante_id)             REFERENCES estudiante (id),
  CONSTRAINT fk_derivacion_docente      FOREIGN KEY (docente_id)                REFERENCES docente (id),
  CONSTRAINT fk_derivacion_entidad      FOREIGN KEY (entidad_receptora_id)      REFERENCES entidad_receptora (id),
  CONSTRAINT fk_derivacion_alerta       FOREIGN KEY (alerta_ia_id)              REFERENCES alerta_ia (id),
  CONSTRAINT fk_derivacion_estado       FOREIGN KEY (tipo_estado_derivacion_id) REFERENCES tipo_estado_derivacion (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

**Módulo 4 — Tablas: ✔ completo** (4 tablas: `entidad_receptora`, `tipo_estado_derivacion`, `alerta_ia`, `derivacion`).

---

## APIs — Módulo 4

> Mismas convenciones que M1/M2/M3: prefijo `/api/v1`, auth Sanctum,
> respuesta `{ data, meta }`, `[CRUD]` = 5 endpoints estándar.
>
> **Roles relevantes en este módulo:**
> - `docente_tutor` — crea derivaciones, ve sus alertas y casos derivados.
> - `receptor` — gestiona los casos de su entidad (filtra por `receptor.entidad_receptora_id`).
> - `admin` — visibilidad total sobre alertas y derivaciones.

### Catálogos de M4

**Entidades receptoras** (`entidad_receptora`)

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| `GET` | `/entidades-receptoras` | Listar entidades (`?activo=`, `?buscar=`) | `catalogos.gestionar` |
| `POST` | `/entidades-receptoras` | Crear entidad — body: `{ clave, nombre, descripcion?, activo? }` | `catalogos.gestionar` |
| `GET` | `/entidades-receptoras/{id}` | Ver entidad | `catalogos.gestionar` |
| `PUT` | `/entidades-receptoras/{id}` | Editar (rechaza cambiar `clave` si tiene `tipo_estado_derivacion` o `derivacion` referenciados) | `catalogos.gestionar` |
| `DELETE` | `/entidades-receptoras/{id}` | Eliminar (rechaza si tiene `derivacion` o `tipo_estado_derivacion` — usar `activo=0`) | `catalogos.gestionar` |
| `PATCH` | `/entidades-receptoras/{id}/estado` | Activar / desactivar (`activo`) | `catalogos.gestionar` |

**Estados de derivación** (`tipo_estado_derivacion`) — siempre **anidados bajo su entidad**

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| `GET` | `/entidades-receptoras/{id}/estados-derivacion` | Listar estados de la entidad, ordenados por `orden` | `catalogos.gestionar` |
| `POST` | `/entidades-receptoras/{id}/estados-derivacion` | Crear estado — body: `{ clave, nombre, orden, activo? }` | `catalogos.gestionar` |
| `GET` | `/estados-derivacion/{id}` | Ver estado | `catalogos.gestionar` |
| `PUT` | `/estados-derivacion/{id}` | Editar estado (rechaza cambiar `clave` si hay `derivacion` en ese estado) | `catalogos.gestionar` |
| `DELETE` | `/estados-derivacion/{id}` | Eliminar (rechaza si hay `derivacion.tipo_estado_derivacion_id` apuntando a él — usar `activo=0`) | `catalogos.gestionar` |
| `PATCH` | `/estados-derivacion/{id}/estado` | Activar / desactivar (`activo`) | `catalogos.gestionar` |
| `PUT` | `/entidades-receptoras/{id}/estados-derivacion/reordenar` | Reordenar estados — body: `[{ id, orden }]` — aplica en transacción | `catalogos.gestionar` |

### Alertas IA (`alerta_ia`)

> Las alertas las **crea únicamente el sistema** (job async tras `POST /fichas-llenadas/{fl_id}/enviar`).
> El docente y el admin solo las leen y cambian su estado.

**Vista docente — sus tutorados**

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| `GET` | `/mis-alertas` | Listar alertas de los tutorados del docente autenticado. Filtros: `?estado=` (`pendiente`/`revisada`/`derivada`/`descartada`), `?nivel_alerta=` (`Baja`/`Media`/`Alta`), `?area_id=`, `?estudiante_id=`, `?page=`. El `meta` incluye conteo por estado | `alertas.ver` |
| `GET` | `/mis-alertas/{id}` | Ver detalle de una alerta (valida que la alerta pertenezca a un tutorado del docente) | `alertas.ver` |
| `PATCH` | `/mis-alertas/{id}/revisar` | Marcar como revisada (`estado: pendiente → revisada`). Rechaza si `estado ≠ 'pendiente'` | `alertas.ver` |
| `PATCH` | `/mis-alertas/{id}/descartar` | Marcar como descartada (`estado → descartada`). Rechaza si ya tiene una `derivacion` asociada (`alerta_ia_id`) | `alertas.ver` |

**Vista admin — todas las alertas**

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| `GET` | `/alertas` | Listar todas las alertas del sistema. Filtros: `?docente_id=`, `?estudiante_id=`, `?estado=`, `?nivel_alerta=`, `?area_id=`, `?ciclo_periodo_id=`, `?fecha_desde=`, `?fecha_hasta=` | `alertas.gestionar` |
| `GET` | `/alertas/{id}` | Ver detalle de cualquier alerta | `alertas.gestionar` |

**Formato de respuesta `GET /mis-alertas` (y `/alertas`):**

```json
{
  "data": [
    {
      "id": 12,
      "estudiante": {
        "id": 5,
        "nombre_completo": "Juan Pérez López",
        "codigo": "2024-AD-0012"
      },
      "ficha_llenada": {
        "id": 20,
        "nombre_ficha": "Ficha diagnóstica · 1° ciclo 2026-I",
        "fecha_enviado": "2026-03-15T14:22:00"
      },
      "area": { "id": 2, "clave": "salud_mental", "nombre": "Salud corporal y mental" },
      "nivel_alerta": "Alta",
      "justificacion": "Tendencia de 3 períodos a la baja en bienestar, respuestas indican aislamiento",
      "entidad_sugerida": { "id": 1, "clave": "psicologia", "nombre": "Psicología" },
      "estado": "pendiente",
      "fecha_generada": "2026-03-15T15:01:00",
      "derivacion_id": null
    }
  ],
  "meta": {
    "total": 5,
    "por_estado": { "pendiente": 3, "revisada": 1, "derivada": 1, "descartada": 0 }
  }
}
```

### Derivaciones (`derivacion`)

> El endpoint `GET /derivaciones` devuelve resultados **filtrados por rol**
> automáticamente (sin cambiar la URL):
> - **Docente autenticado** → solo las derivaciones que él creó (`docente_id`).
> - **Receptor autenticado** → solo las de su entidad (`entidad_receptora_id` de su perfil `receptor`).
> - **Admin** → todas.

| Método | Ruta | Propósito | Permiso |
|--------|------|-----------|---------|
| `POST` | `/derivaciones` | Crear derivación — ver body abajo | `derivaciones.crear` |
| `GET` | `/derivaciones` | Listar derivaciones (filtrado por rol automático). Filtros: `?entidad_receptora_id=`, `?estado_id=`, `?estudiante_id=`, `?docente_id=` (solo admin), `?fecha_desde=`, `?fecha_hasta=`, `?page=` | `derivaciones.ver` |
| `GET` | `/derivaciones/{id}` | Ver detalle completo — accesible por el docente creador, cualquier receptor de la entidad destino o el admin | `derivaciones.ver` |
| `PATCH` | `/derivaciones/{id}/estado` | Avanzar estado del caso — solo receptor de la entidad destino o admin — body abajo | `derivaciones.gestionar` |

**Body `POST /derivaciones`:**

```json
{
  "estudiante_id": 5,
  "entidad_receptora_id": 1,
  "motivo": "Las respuestas de la ficha diagnóstica indican aislamiento sostenido y bajo bienestar emocional en tres períodos consecutivos.",
  "alerta_ia_id": 12
}
```

> `alerta_ia_id` es **opcional** (derivación manual = `null`). Si se envía, el backend valida que la alerta exista, pertenezca a un tutorado del docente y no esté ya `derivada`.

**Body `PATCH /derivaciones/{id}/estado`:**

```json
{
  "tipo_estado_derivacion_id": 4,
  "nota": "Estudiante citado para evaluación inicial el martes 22 a las 10:00."
}
```

> `nota` es opcional. El backend valida que `tipo_estado_derivacion_id` pertenezca a la misma `entidad_receptora_id` de la derivación.

**Formato de respuesta `GET /derivaciones` y `GET /derivaciones/{id}`:**

```json
{
  "data": {
    "id": 7,
    "estudiante": {
      "id": 5,
      "nombre_completo": "Juan Pérez López",
      "codigo": "2024-AD-0012"
    },
    "docente": {
      "id": 2,
      "nombre_completo": "Ricardo Vargas Vargas"
    },
    "entidad_receptora": {
      "id": 1,
      "clave": "psicologia",
      "nombre": "Psicología"
    },
    "alerta_ia": {
      "id": 12,
      "nivel_alerta": "Alta",
      "area": "Salud corporal y mental",
      "justificacion": "Tendencia de 3 períodos a la baja en bienestar..."
    },
    "estado_actual": {
      "id": 3,
      "clave": "en_evaluacion",
      "nombre": "En evaluación"
    },
    "motivo": "Las respuestas indican aislamiento sostenido...",
    "nota": "Estudiante citado para evaluación el martes 22.",
    "created_at": "2026-03-20T10:30:00",
    "updated_at": "2026-03-22T09:15:00"
  }
}
```

**Módulo 4 — APIs: ✔ completo**

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


