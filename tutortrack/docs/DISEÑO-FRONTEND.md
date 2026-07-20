# Diseño Frontend — TutorTrack

**Fuente única del diseño visual del mockup.** Aquí vive *cómo se ve y se
organiza* cada pantalla (menú, layout, columnas, formularios, estados). El
*qué dato/relación* sale siempre de [`BD-BACKEND.md`](./BD-BACKEND.md)
(fuente única de datos) y el *comportamiento del backend* de
[`FUNCIONALIDAD-BACKEND.md`](./FUNCIONALIDAD-BACKEND.md).

> Este proyecto es **solo maqueta** (HTML + Tailwind + JS, sin backend).
> Todo dato es placeholder ficticio. Se construye **una pantalla a la vez**;
> cada sección de este doc se cierra con visto bueno antes de maquetar.

---

## Sistema visual (base común)

- **Tema:** claro único (sin modo oscuro). Contraste y foco visibles.
- **Identidad:** azul institucional (estructura, navegación, CTA) + naranja
  (avisos/urgencia puntual, poca superficie) + lienzo blanco/gris frío.
- **Color:** solo vía variables de `css/tokens.css`. Nunca hardcodeado, nunca
  reusando tokens de `pagina-web/` ni `docentrack/`.
- **Tipografía:** Source Serif 4 (títulos, `font-heading`) + Source Sans 3
  (cuerpo, `font-body`).
- **Tono:** módulo sensible (bienestar, salud mental, derivación). La UI
  transmite confidencialidad y cuidado, no burocracia fría.
- **Componentes nativos (Web Components):** `<app-sidebar>`, `<app-topbar>`,
  `<app-toast>`, `<app-modal-confirm>`, `<app-modal-historial>` (auditoría).
- **Motor de listados:** `js/catalog-table.js` (buscar + filtros + meta +
  paginación + acciones de fila) con estilos `catalog-*` / `btn-*` de
  `css/base.css`. Todo listado nuevo lo reutiliza.
- **Rutas:** siempre relativas vía `window.getBasePath()` — nunca absolutas.
- **Responsive:** admin/docente/receptor → escritorio y tablet; estudiante →
  también móvil. El sidebar actúa como drawer en móvil/tablet.

### Notificaciones (toasts) — `<app-toast>`

Feedback de acciones (crear, editar, eliminar, errores). Una sola instancia por
página; se dispara con el evento `app:toast` (`{ message, type }`).

```
        ┌──────────────────────────────────────────┐
        │ ✔  Docente registrado                 ✕  │  ← título (bold)
        │    Se creó el perfil y se asignó el rol. │  ← subtítulo (opcional)
        └──────────────────────────────────────────┘
            (baja desde el borde superior, centrado)
```

| Tipo | Color · icono | Uso | Ejemplo (título / subtítulo) |
|---|---|---|---|
| **success** | verde · ✔ | acción completada | "Docente registrado" / "Se asignó el rol Docente-tutor" |
| **warning** | ámbar · ⚠ | atención, no bloquea | "Revisa los datos" / "El celular quedó vacío" |
| **danger** | rojo · ⊘ | error / fallo | "No se pudo eliminar" / "Tiene tutorados activos" |
| **info** | azul · ⓘ | aviso neutro | "Lista actualizada" |

- **Posición:** superior centrado. **Animación:** slide-down al entrar,
  fade-out al salir.
- **Estructura:** **título obligatorio + subtítulo opcional** (si no aporta,
  solo el título).
- **Duración:** success/info **4 s**, warning/danger **6 s** (más tiempo para
  leer el problema); siempre cerrable con ✕.
- Tono claro y humano (módulo sensible), sin tecnicismos.

> **⬜ Pendiente de implementación:** hoy `<app-toast>` es de **una sola línea**
> y duración fija **4.5 s**. Título+subtítulo y duración por tipo requieren
> **extender el componente**.

---

## Navegación (menú)

Un solo menú con las 4 secciones del sistema (mockup demo: todas visibles y
navegables; en producción el RBAC filtra por permisos). Cada ítem mapea a una
tabla/entidad real de `BD-BACKEND.md` — no hay ítems huérfanos.

### Administrador

```
Administrador
├── Dashboard
├── Usuarios y acceso        ← acceso ≠ catálogo
│   ├── Docentes
│   ├── Estudiantes
│   ├── Receptores
│   ├── Usuarios
│   └── Roles y permisos
├── Catálogos                ← solo catálogos reales
│   ├── Ciclos
│   ├── Periodos académicos
│   ├── Grados académicos
│   ├── Especialidades
│   ├── Tipos de documento
│   ├── Áreas
│   ├── Tipos de ficha
│   └── Entidades receptoras   (sus estados de derivación se editan aquí dentro)
├── Organización del período
│   ├── Configuración del período
│   ├── Matrículas
│   └── Avanzar estudiantes
├── Fichas
│   ├── Plantillas de fichas
│   └── Asignación a ciclos
└── Alertas y derivación
    ├── Alertas IA
    └── Derivaciones
```

### Docente-Tutor

```
Docente-Tutor
├── Dashboard
├── Tutoría
│   ├── Mis tutorados
│   └── Temario
├── Fichas
│   └── Fichas de mis tutorados
└── Alertas
    ├── Alertas IA
    └── Derivaciones
```

### Estudiante

```
Estudiante
├── Inicio
└── Mi tutoría
    ├── Mis fichas
    └── Mi tutor
```

### Receptor / Psicología

```
Receptor / Psicología
├── Dashboard
└── Casos
    ├── Casos derivados
    └── Historial de seguimiento
```

### Mapeo ítem → tabla/entidad (verificación contra BD)

| Sección | Ítem | Tabla / entidad en `BD-BACKEND.md` |
|---------|------|-------------------------------------|
| Admin · Usuarios y acceso | Docentes | `docente` |
| | Estudiantes | `estudiante` |
| | Receptores | `receptor` (perfil 1:1, `/receptores`) |
| | Usuarios | `usuario` (identidades sin perfil especializado) |
| | Roles y permisos | `rol` · `permiso` · `usuario_rol` · `rol_permiso` |
| Admin · Catálogos | Ciclos | `ciclo` |
| | Periodos académicos | `periodo_academico` |
| | Grados académicos | `grado_academico` |
| | Especialidades | `especialidad` |
| | Tipos de documento | `tipo_documento` |
| | Áreas | `area` |
| | Tipos de ficha | `tipo_ficha` |
| | Entidades receptoras | `entidad_receptora` (+ `tipo_estado_derivacion` **anidado**) |
| Admin · Organización del período | Configuración del período | `ciclo_periodo` + `docente_ciclo_periodo` + `temario` |
| | Matrículas | `estudiante_ciclo_periodo` |
| | Avanzar estudiantes | operación sobre `estudiante_ciclo_periodo` |
| Admin · Fichas | Plantillas de fichas | `ficha` + `pregunta` + `opcion_pregunta` |
| | Asignación a ciclos | `ficha_ciclo_periodo` |
| Admin · Alertas y derivación | Alertas IA | `alerta_ia` |
| | Derivaciones | `derivacion` |
| Docente · Tutoría | Mis tutorados | `estudiante_ciclo_periodo` (filtrado por `docente_id`) |
| | Temario | `temario` |
| Docente · Fichas | Fichas de mis tutorados | `ficha_llenada` + `respuesta` |
| Docente · Alertas | Alertas IA / Derivaciones | `alerta_ia` / `derivacion` |
| Estudiante · Mi tutoría | Mis fichas | `ficha_llenada` + `respuesta` |
| | Mi tutor | `docente` (vía `estudiante_ciclo_periodo`) |
| Receptor · Casos | Casos derivados | `derivacion` (filtrado por `entidad_receptora_id`) |
| | Historial de seguimiento | `auditoria` (traza de cambios de estado) |

**Notas de decisión (contra la BD):**
- **`Tipos de pregunta` no está en el menú:** los 5 tipos son constantes en
  código, no hay tabla (`BD-BACKEND.md` § `tipo_pregunta` — "NO es tabla").
- **`Tipos de estado de derivación` no es catálogo global:** es **por entidad
  receptora** (`tipo_estado_derivacion.entidad_receptora_id`); se gestiona
  *dentro* de cada entidad, no como ítem propio.
- **`Historial de seguimiento` (Receptor)** no tiene tabla propia: es una
  vista de lectura sobre `auditoria` (los cambios de estado de las
  derivaciones de su entidad).

> **Pendiente de aplicar en `components/app-sidebar.js`:** el menú en código
> aún tiene la estructura anterior. Esta es la estructura **objetivo**; se
> alinea el `app-sidebar.js` cuando se acuerde tocar código.

---

## Pantallas

### Estado de construcción (checklist para la IA)

Al **implementar** cada pantalla según este diseño, marca su casilla
(`- [ ]` → `- [x]`) y cambia el estado de su encabezado a **✅ Hecho**. Mientras
no esté construida en código según este doc, queda **⬜ Pendiente**.

**Administrador › Usuarios y acceso › Docentes**
- [ ] Listado (tabla + 3 cards)
- [ ] Formulario (crear / editar)
- [ ] Ficha (ver, solo lectura)
- [ ] Modales: Restablecer contraseña · Eliminar · Auditoría

**Administrador › Usuarios y acceso › Estudiantes**
- [ ] Listado (tabla + 3 cards)
- [ ] Formulario (crear / editar)
- [ ] Ficha (ver, solo lectura)
- [ ] Modales (reusa los genéricos)

**Administrador › Usuarios y acceso › Receptores**
- [ ] Listado (tabla + 3 cards)
- [ ] Formulario (crear / editar)
- [ ] Ficha (ver, solo lectura)
- [ ] Modales (reusa los genéricos)

**Administrador › Usuarios y acceso › Usuarios**
- [ ] Listado (identidad maestra: Perfiles + Roles)
- [ ] Formulario (crear / editar: identidad + roles)
- [ ] Ficha (ver, con bloque Perfiles)
- [ ] Modales (genéricos + Agregar/Quitar perfil)

**Administrador › Usuarios y acceso › Roles y permisos**
- [ ] Pantalla maestro-detalle (roles + permisos por módulo)
- [ ] Modales (Nuevo/Editar rol · Eliminar/Desactivar rol)

---

### Patrón base — «Listado de personas» (guía)

Docentes, Estudiantes, Receptores y Usuarios comparten esta base. **Por ahora
es una guía, no un componente cerrado** — al terminar el diseño se analiza qué
patrones conviene extraer de verdad (evitar abstracción prematura).

- **3 cards de resumen** arriba: `Total` · `Activos` · `Inactivos`.
  **Solo informativas** (no filtran) y con **conteo global inmutable**: el
  número no cambia al buscar/filtrar la tabla. Regla: `Total = Activos +
  Inactivos`; los soft-deleted (`deleted_at`) **no** aparecen ni cuentan.
- **Barra de consulta:** Buscar (texto + botón 🔍) · filtros (select) · Limpiar (✕).
- **Tabla** (`js/catalog-table.js`): `N°` + columnas de persona + `Estado`
  (badge) + `Acciones`.
- **Acciones de fila:** visibles **Ver · Editar · Eliminar**; el resto
  (**Restablecer contraseña, Auditoría** y futuras) van en un menú **«⋯»**
  (overflow) — así crece sin ensanchar ni rediseñar la fila.
- **Eliminar = soft delete** (`<app-modal-confirm>`); **Auditoría** abre
  `<app-modal-historial>` (traza desde `auditoria`).
- Cada pantalla solo cambia su **columna propia**: Docentes → Especialidad;
  Estudiantes → Código universitario; Receptores → Entidad; Usuarios → (Roles
  como info central).

---

### Administrador › Usuarios y acceso › Docentes — Listado — ⬜ Pendiente

- **Archivos (al codificar):** `pages/admin/docentes.html` + `js/docentes.js`.
- **Objetivo:** escanear rápido quién es quién, su estado de acceso y sus
  roles, y actuar sin entrar a cada ficha.
- **Datos:** `docente` + `usuario` + `grado_academico` + `especialidad` +
  roles (`usuario_rol`).

**Cards (3, informativas, conteo global):**

| Card | Ejemplo | Color · icono | Sub-línea | Fuente |
|------|:------:|---------------|-----------|--------|
| Total docentes | `24` | azul · 👥 | "registrados" | conteo de `docente` no eliminados |
| Activos | `21` | verde `success` · ✔ | "con acceso habilitado" | `usuario.activo = 1` |
| Inactivos | `3` | gris `muted` · ⏸ | "sin acceso" | `usuario.activo = 0` |

3 columnas en escritorio/tablet, apiladas en móvil. Colores solo de tokens
(naranja **no** se usa aquí — reservado a urgencia real).

**Barra de consulta:**
- Buscar: por nombre, apellido, documento o correo.
- Filtro **Especialidad** (select, de `especialidad`).
- Filtro **Estado** (Todos / Activo / Inactivo).
- Limpiar: resetea búsqueda + filtros.

**Columnas (8):**

| # | Columna | Contenido | Fuente |
|---|---------|-----------|--------|
| 1 | N° | correlativo de página (centrado) | — |
| 2 | Docente | foto circular + abreviatura de grado (`Dr.`) encima + nombres y apellidos | `usuario` + `grado_academico.abreviatura` |
| 3 | Documento | clave del tipo (`DNI`) + número | `tipo_documento.clave` + `usuario.documento` |
| 4 | Especialidad | nombre de la especialidad | `especialidad.nombre` |
| 5 | Roles | chips (soporta N roles: `Docente-tutor` · `Admin`) — **no** se supone un solo rol | `usuario_rol` → `rol.nombre` |
| 6 | Contacto | correo de acceso + celular (o "Sin celular" en gris) | `usuario.email` + `celular_principal` |
| 7 | Estado | badge `● Activo` (verde) / `○ Inactivo` (gris) | `usuario.activo` |
| 8 | Acciones | ver «Acciones de fila» | — |

> En tablet la tabla hace scroll horizontal. Alternativa compacta (si se
> prefiere 7 columnas): mover los chips de Roles **debajo del nombre** en la
> celda «Docente». **Elegido: columna dedicada** (más claro).

**Acciones de fila:**

| Control | Acción | Resultado |
|---------|--------|-----------|
| 👁 azul | Ver | `docentes-ver.html?id=` (ficha solo lectura) |
| ✏ azul | Editar | `docentes-form.html?id=` |
| 🗑 rojo | Eliminar | `<app-modal-confirm>` → soft delete → toast "Docente eliminado" |
| ⋯ | (overflow) | **Restablecer contraseña** (modal → toast) · **Auditoría** (`<app-modal-historial>`) · *futuras acciones* |

**Comportamiento:**
- CTA header: **Nuevo docente** → `docentes-form.html` (pantalla aparte, no
  modal: entidad rica). Botón **Actualizar lista**.
- Paginación: 8 por defecto; selector 5 / 8 / 10. Orden inicial: apellido paterno.
- Sin foto: avatar por defecto según sexo (`usuario-m.svg` / `usuario-f.svg`).
- Estado vacío: "No se encontraron docentes con esos criterios."

> **Candidato a patrón reutilizable:** cards de resumen (Total/Activos/
> Inactivos) + tabla de personas + acciones con overflow. Revisar al final
> junto con Estudiantes / Receptores / Usuarios.

---

### Administrador › Usuarios y acceso › Docentes — Formulario (crear / editar) — ⬜ Pendiente

- **Archivos (al codificar):** `pages/admin/docentes-form.html` + `js/docentes-form.js`.
- **Tipo:** página aparte (no modal) — la entidad es rica. La **misma pantalla**
  sirve para crear y editar.
- **Datos:** un docente se guarda en **3 tablas** — `usuario` (identidad/login),
  `docente` (perfil) y `usuario_rol` (roles).

**Estructura visual:**
```
← Volver al listado
Nuevo docente                                                   [ 📷 Subir foto ]
Completa la identidad, el contacto y el perfil académico.       (opcional, arriba-dcha)

┌─ 1 · Identidad ───────────────────────────────────────────────────────────┐
│ Tipo de documento* [ DNI ▾ ]     Número de documento* [__________] [🔍]    │
│ Nombres* [______________________________________________]                  │
│ Apellido paterno* [________________]   Apellido materno* [________________] │
│ Sexo [ Seleccionar ▾ ]                 Fecha de nacimiento [ dd/mm/aaaa ]   │
└───────────────────────────────────────────────────────────────────────────┘
┌─ 2 · Contacto y acceso ───────────────────────────────────────────────────┐
│ Correo de acceso* [__________@unamba.edu.pe]   Correo personal [____@___]  │
│ Celular principal [__________]   Celular secundario [__________]            │
│ Estado de acceso  [ ● Activo | ○ Inactivo ]                                │
└───────────────────────────────────────────────────────────────────────────┘
┌─ 3 · Perfil académico  (opcional) ────────────────────────────────────────┐
│ Grado académico [ Seleccionar ▾ ]      Especialidad [ Seleccionar ▾ ]      │
│ ORCID [ 0000-0000-0000-0000 ]          URL del CV [ https://… ]            │
│ Biografía [__________________________________________________________]     │
└───────────────────────────────────────────────────────────────────────────┘
┌─ 4 · Roles*  (al menos uno) ──────────────────────────────────────────────┐
│ ☑ Docente-tutor    ☐ Coordinador de tutoría    ☐ Administrador   …         │
└───────────────────────────────────────────────────────────────────────────┘
                                              [ Cancelar ]   [ Guardar docente ]
```

**1 · Identidad → `usuario`**

| Campo (UI) | Control | Oblig. | Columna BD | Notas |
|---|---|:--:|---|---|
| Foto | uploader circular | No | `foto_perfil_url` | opcional; sin foto → avatar por sexo |
| Tipo de documento | select | **Sí** | `tipo_documento_id` | default DNI; de `tipo_documento` |
| Número de documento | texto + 🔍 RENIEC | **Sí** | `documento` | único **por tipo**; DNI = 8 dígitos. RENIEC (simulado, solo DNI) autocompleta nombres/apellidos |
| Nombres | texto | **Sí** | `nombres` | uno o varios |
| Apellido paterno | texto | **Sí** | `apellido_paterno` | |
| Apellido materno | texto | **Sí** | `apellido_materno` | |
| Sexo | select | No | `sexo` | **M / F / N (No especificado)** — los 3 valores del CHECK |
| Fecha de nacimiento | date | No | `fecha_nacimiento` | |

**2 · Contacto y acceso → `usuario`**

| Campo (UI) | Control | Oblig. | Columna BD | Notas |
|---|---|:--:|---|---|
| Correo de acceso | email | **Sí** | `email` | **único**; es el login (institucional) |
| Correo personal | email | No | `email_personal` | no único; solo contacto |
| Celular principal | tel | No | `celular_principal` | |
| Celular secundario | tel | No | `celular_secundario` | |
| Estado de acceso | toggle | **Sí** | `activo` | default **Activo**; Inactivo = no inicia sesión |

> **Contraseña:** **no se captura ni se crea a mano.** El backend la
> **autogenera** a partir del número de documento (`contrasena`, hash). En
> **crear**, una nota informa: "La contraseña inicial será el número de
> documento." Se cambia solo con **Restablecer contraseña** (menú "⋯" del
> listado).

**3 · Perfil académico → `docente` (todo opcional)**

| Campo (UI) | Control | Oblig. | Columna BD | Notas |
|---|---|:--:|---|---|
| Grado académico | select | No | `grado_academico_id` | de `grado_academico` |
| Especialidad | select | No | `especialidad_id` | una sola (por ahora) |
| ORCID | texto | No | `codigo_orcid` | máscara `0000-0000-0000-0000` |
| URL del CV | url | No | `cv_url` | |
| Biografía | textarea | No | `biografia` | reseña de perfil |

**4 · Roles → `usuario_rol` (pivote)**

| Campo (UI) | Control | Oblig. | Columna BD | Notas |
|---|---|:--:|---|---|
| Roles | multi-check | **Sí (≥1)** | `usuario_rol` → `rol_id` | **solo se listan los roles `activo = 1`**. Multi-rol real (un docente puede ser también Admin/Coordinador). Default marcado: `Docente-tutor` |

**No va en el form** (lo maneja el sistema): `contrasena`, `remember_token`,
`created_at`, `updated_at`, `deleted_at`, `id`/`usuario_id`.

**Crear vs. Editar (misma pantalla):**

| | Crear | Editar |
|---|---|---|
| Título | "Nuevo docente" | "Editar docente" |
| Carga | vacío, Estado = Activo | precargado con los datos actuales |
| Contraseña | se autogenera (= documento) + nota informativa | no aparece; se usa "Restablecer contraseña" |
| Correo de acceso | editable | editable **con aviso** (es el login) |
| Documento | editable | editable con cuidado (afecta unicidad) |
| Roles | `Docente-tutor` premarcado | refleja los roles actuales |

**Validaciones visibles (mockup, sin backend):**
- Campos `*` obligatorios; error inline si faltan.
- Email con formato válido; ORCID con máscara `0000-0000-0000-0000`.
- Número según tipo (DNI = 8 dígitos) — pista bajo el campo.
- Unicidad de documento/email → la valida el backend (aquí solo se anota).

**Responsive:**
- Las grillas de 2 columnas (dentro de cada sección) colapsan a **1 columna**
  en móvil/tablet angosto.
- Foto: arriba-derecha en escritorio; **sobre las secciones** al colapsar.
- Los **checks de Roles** se acomodan en grilla fluida (2 col → 1 col); nunca
  se desbordan.
- Footer de acciones (**Cancelar / Guardar**) **sticky** al pie en pantallas
  cortas; los botones se apilan a ancho completo en móvil.
- Foco visible y navegación por teclado en todos los controles.

---

### Administrador › Usuarios y acceso › Docentes — Ficha (ver, solo lectura) — ⬜ Pendiente

- **Archivos (al codificar):** `pages/admin/docentes-ver.html` + `js/docentes-ver.js`.
- **Tipo:** vista de consulta, **solo lectura**. Se llega desde la acción 👁 del
  listado. No tiene "Guardar".

**Estructura visual:**
```
← Volver al listado
┌───────────────────────────────────────────────────────────────────────────┐
│ [foto 96px]  Dr. Raúl Quispe Mamani                          ● Activo       │
│              DNI 45231890                                                    │
│                                    [ ✏ Editar ][ 🔑 Contraseña ][ 🕵 Auditoría ]│
├───────────────────────────────────────────────────────────────────────────┤
│  Identidad                        │  Contacto y acceso                       │
│  Sexo           Masculino         │  Correo de acceso  r.quispe@unamba.edu.pe│
│  Fecha nacim.   12/04/1985 (40)   │  Correo personal   rquispe@gmail.com     │
│                                   │  Celular principal 987 654 321           │
│                                   │  Celular secund.   —                     │
├───────────────────────────────────────────────────────────────────────────┤
│  Perfil académico                                                           │
│  Grado  Doctor      Especialidad  Marketing                                 │
│  ORCID  0000-0002-1825-0097 ↗     CV  https://… ↗                           │
│  Biografía  Docente con 12 años de experiencia en…                          │
├───────────────────────────────────────────────────────────────────────────┤
│  Actividad de tutoría                                                       │
│  [ 10 períodos ]   [ 20 tutorados vigentes ]   [ 200 tutorados histórico ]  │
│  Período    Ciclo(s)      Tutorados                                         │
│  2026-I     III · V       20                                                │
│  2025-II    II · IV       20            (scroll · "Ver todos")              │
│  …                                                                          │
├───────────────────────────────────────────────────────────────────────────┤
│  Roles                                                                      │
│  [Docente-tutor] [Coordinador de tutoría] [Administrador]  ← chips, al final │
├───────────────────────────────────────────────────────────────────────────┤
│  Registrado: 03/02/2026  ·  Última actualización: 18/07/2026                │
└───────────────────────────────────────────────────────────────────────────┘
```

**Bloques (todo solo lectura) y su fuente en BD:**

| Bloque | Muestra | Fuente BD |
|---|---|---|
| Encabezado | foto grande, grado + nombre completo, tipo+documento, badge **Estado**, acciones | `usuario` + `grado_academico` + `usuario.activo` |
| Identidad | Sexo, Fecha de nacimiento (+ edad calculada) | `usuario` |
| Contacto y acceso | Correo de acceso, Correo personal, Celular principal, Celular secundario | `usuario` |
| Perfil académico | Grado, Especialidad, ORCID (enlace ↗), CV (enlace ↗), Biografía | `docente` + `grado_academico` + `especialidad` |
| **Actividad de tutoría** | 3 stats + tabla por período (ver abajo) | `docente_ciclo_periodo` + `estudiante_ciclo_periodo` + `periodo_academico`/`ciclo` |
| **Roles** | chips (soporta N roles) — **al final**, fuera del encabezado | `usuario_rol` → `rol` |
| Metadatos | Registrado el / Última actualización | `usuario.created_at` / `updated_at` |

**Actividad de tutoría — regla de escala (resumen, nunca volcado):**
Un docente puede acumular cientos de tutorados (p. ej. 10 períodos × 20 = 200).
**Nunca** se listan los estudiantes aquí; solo se resume:
- **3 mini-stats:** `Períodos como tutor` (períodos distintos en
  `docente_ciclo_periodo`) · `Tutorados vigentes` (`estudiante_ciclo_periodo`
  del docente en el período activo) · `Tutorados histórico`
  (`COUNT(estudiante_ciclo_periodo WHERE docente_id = X)`).
- **Tabla compacta por período** (reciente primero, con scroll / "Ver todos"):
  `Período` · `Ciclo(s) tutorado(s)` (chips — n:n en `docente_ciclo_periodo`) ·
  `N° tutorados` (conteo en ese período). ~10 filas, no 200.
- El **detalle** de los estudiantes de un período **no** vive aquí: vivirá en
  Matrículas/tutorados (Módulo 2). Cada fila podrá enlazar allí cuando se
  diseñe ese módulo. *(Pendiente Módulo 2.)*

**Detalles de diseño:**
- Acciones del encabezado = las mismas del "⋯" del listado, pero visibles aquí
  (hay espacio): **Editar · Restablecer contraseña · Auditoría**.
- Campos vacíos se muestran como "—" (nunca en blanco).
- Enlaces (ORCID, CV) abren en pestaña nueva con ícono de enlace externo.
- **Responsive:** 2 columnas (Identidad | Contacto) → 1 columna apilada en
  móvil. Encabezado: foto + datos en fila; en móvil la foto va arriba centrada.
  La tabla de tutoría hace scroll horizontal si hace falta.

---

### Administrador › Usuarios y acceso › Docentes — Modales — ⬜ Pendiente

Usan componentes ya existentes: `<app-modal-confirm>` y `<app-modal-historial>`.
Son **genéricos** — sirven igual para Estudiantes, Receptores y Usuarios; solo
el aviso de relaciones es propio de cada perfil. **Candidatos a patrón
reutilizable.**

#### 3a · Restablecer contraseña 🔑

Se abre desde el "⋯" del listado o el encabezado de la ficha.
```
┌───────────────────────────────────────────────┐
│  🔑  Restablecer contraseña               [✕]  │
├───────────────────────────────────────────────┤
│  Docente:   Dr. Raúl Quispe Mamani             │
│  Documento: DNI 45231890                        │
│                                                 │
│  La nueva contraseña será el número de          │
│  documento:  45231890                           │
│                                                 │
│  ⚠ La contraseña actual dejará de funcionar.    │
│     El docente deberá cambiarla al ingresar.    │
├───────────────────────────────────────────────┤
│                   [ Cancelar ]  [ Restablecer ] │
└───────────────────────────────────────────────┘
```
- **No** se escribe contraseña: se **autogenera** = número de documento
  (`usuario.contrasena`, hash). Coherente con el formulario.
- Botón principal **azul** (sensible, no destructivo). Al confirmar → toast
  **success** "Contraseña restablecida".

#### 3b · Eliminar / Desactivar 🗑 (context-aware, 2 estados)

**Regla:** solo se **elimina** un docente **sin ninguna relación**. Si tiene
historial, **no** se elimina — se **desactiva** (mismo patrón que catálogos).

**Chequeo de relaciones (BD):** ≥1 fila en `docente_ciclo_periodo` (asignado
como tutor) · `estudiante_ciclo_periodo` (tuvo tutorados) · `derivacion`
(creó derivaciones) → **Estado B**.

**Estado A — sin relaciones (se puede eliminar):**
```
┌───────────────────────────────────────────────┐
│  🗑  Eliminar docente                     [✕]  │
├───────────────────────────────────────────────┤
│  ¿Eliminar a Dr. Raúl Quispe Mamani            │
│  (DNI 45231890)?                                │
│  No tiene tutorías ni historial registrado.     │
│  Se eliminará su perfil (soft delete).          │
├───────────────────────────────────────────────┤
│                   [ Cancelar ]  [ Eliminar ]    │
└───────────────────────────────────────────────┘
```
→ soft delete (`docente.deleted_at`); toast **success** "Docente eliminado".

**Estado B — con historial (bloqueado, ofrece desactivar):**
```
┌───────────────────────────────────────────────┐
│  🗑  No se puede eliminar                  [✕]  │
├───────────────────────────────────────────────┤
│  Dr. Raúl Quispe Mamani tiene historial:        │
│    • 20 tutorados en el período vigente         │
│    • 8 períodos como tutor                      │
│    • 3 derivaciones creadas                     │
│  Para conservar el historial no se elimina.     │
│  Puedes desactivarlo: deja de ser asignable y   │
│  no podrá iniciar sesión.                       │
├───────────────────────────────────────────────┤
│                [ Cancelar ]  [ Desactivar docente ]│
└───────────────────────────────────────────────┘
```
→ desactivar = `usuario.activo = 0`; toast **success** "Docente desactivado".
- Botón destructivo (Eliminar) en **rojo**; foco por defecto en **Cancelar**.
- **Acción rápida asociada:** en el "⋯" del listado se agrega **Activar /
  Desactivar** (setea `usuario.activo`) sin pasar por el modal de borrado.

#### 3c · Auditoría 🕵 (historial, solo lectura)

Componente `<app-modal-historial>`. Lee `auditoria` filtrando por
`tabla_afectada` (`docente`/`usuario`) + `registro_id` del docente.
```
┌───────────────────────────────────────────────────────────────┐
│  🕵  Auditoría — Dr. Raúl Quispe Mamani     Filtrar:[ Todas ▾ ] │
├───────────────────────────────────────────────────────────────┤
│ ✏ EDITÓ        Ricardo Vargas Vargas · 18/07/2026 · 14:32      │
│   Campo               Antes            Después                 │
│   Celular principal   987 654 321      999 888 777             │
│   Especialidad        Finanzas         Marketing               │
├───────────────────────────────────────────────────────────────┤
│ ✏ EDITÓ        Ricardo Vargas Vargas · 10/05/2026 · 09:15      │
│   Estado              Activo           Inactivo                │
├───────────────────────────────────────────────────────────────┤
│ ➕ CREÓ         Ricardo Vargas Vargas · 03/02/2026 · 11:02      │
│   Registro creado.   [ ver valores iniciales ▾ ]              │
│                                     (scroll · más antiguos ↓) │
└───────────────────────────────────────────────────────────────┘
```
| Parte | Muestra | Fuente BD |
|---|---|---|
| Tipo de operación (badge) | CREÓ ➕ / EDITÓ ✏ / ELIMINÓ 🗑 / INICIÓ SESIÓN 🔑 | `auditoria.accion` |
| Quién | nombre del autor (o "Sistema" si null) | `auditoria.usuario_id` → `usuario` |
| Cuándo | fecha · hora | `auditoria.created_at` |
| Qué cambió | tabla **Campo · Antes · Después** (un renglón por campo modificado) | diff de `valores_anteriores` ↔ `valores_nuevos` (JSON) |
| Detalle técnico | IP · navegador (en "ver más") | `ip` · `user_agent` · `url` |

- **Crear:** sin "antes" → valores iniciales colapsables. **Editar:** solo los
  campos que cambiaron. **Eliminar:** indica el soft delete.
- Orden reciente→antiguo; filtro por tipo de operación; **inmutable** (solo
  lectura, coherente con la tabla append-only).

---

## Estudiantes

Reusa el patrón «Listado de personas», los 3 modales genéricos y los toasts de
Docentes. Aquí solo se documenta lo **propio**; lo idéntico se referencia.
**Perfil `estudiante`** = `codigo_universitario` (obligatorio, único) +
`codigo_orcid` (opcional). Sin grado, especialidad, CV ni biografía.

### Administrador › Usuarios y acceso › Estudiantes — Listado — ⬜ Pendiente

- **Archivos (al codificar):** `pages/admin/estudiantes.html` + `js/estudiantes.js`.
- **Cards (3):** Total · Activos · Inactivos — igual que Docentes (conteo global
  inmutable; `usuario.activo`; soft-deleted fuera).
- **Barra:** Buscar por nombre, apellido, **código universitario**, documento o
  correo · filtro **Estado** · Limpiar. **Sin** filtro de Especialidad.
```
[ 320 Total ]  [ 298 Activos ]  [ 22 Inactivos ]
N° │ Estudiante          │ Código univ. │ Documento    │ Contacto        │ Estado   │ Acciones
 1 │ (foto) Ana Quispe M.│ 2021-1001    │ DNI 72154893 │ a.quispe@una... │ ● Activo │ 👁 ✏ ⋯
```
- **Columnas (7):** N° · Estudiante (foto + nombre) · **Código universitario** ·
  Documento (tipo + número) · Contacto (correo + celular) · Estado (badge) ·
  Acciones.
  - **Sin columna Roles:** un estudiante casi siempre tiene solo el rol
    `Estudiante`; se ve en la ficha. (Docentes/Usuarios sí la llevan.)
- **Acciones:** Ver · Editar · Eliminar + "⋯" (Restablecer contraseña ·
  Auditoría · Activar/Desactivar).
- **BD:** `estudiante` + `usuario`; Código = `estudiante.codigo_universitario`.

### Administrador › Usuarios y acceso › Estudiantes — Formulario (crear / editar) — ⬜ Pendiente

- **Archivos (al codificar):** `pages/admin/estudiantes-form.html` + `js/estudiantes-form.js`.
- **Secciones 1 (Identidad) y 2 (Contacto y acceso):** **idénticas a Docentes**
  (foto, tipo+documento con RENIEC, nombres/apellidos, sexo, fecha; correos,
  celulares, Estado). Contraseña autogenerada = documento.
```
┌─ 3 · Datos de estudiante ─────────────────────────────────┐
│ Código universitario* [ 2021-1001 ]   ORCID [ 0000-…-… ]  │
└───────────────────────────────────────────────────────────┘
┌─ 4 · Roles*  (al menos uno) ──────────────────────────────┐
│ ☑ Estudiante    ☐ …  (solo roles activos)                 │
└───────────────────────────────────────────────────────────┘
```
- **Sección 3 · Datos de estudiante** (reemplaza a "Perfil académico"):
  Código universitario* (obligatorio, **único**) + ORCID (opcional).
- **Sección 4 · Roles:** multi-check, solo roles `activo = 1`, default marcado
  **Estudiante**.
- **BD:** `estudiante.codigo_universitario` (UNIQUE, NOT NULL) · `codigo_orcid`
  (NULL) · resto en `usuario` · roles en `usuario_rol`.
- Responsive: igual que Docentes.

### Administrador › Usuarios y acceso › Estudiantes — Ficha (ver, solo lectura) — ⬜ Pendiente

- **Archivos (al codificar):** `pages/admin/estudiantes-ver.html` + `js/estudiantes-ver.js`.
```
┌───────────────────────────────────────────────────────────┐
│ [foto]  Ana Lucía Quispe Mamani            ● Activo         │
│         DNI 72154893 · Código 2021-1001                     │
│                          [ ✏ Editar ][ 🔑 Contraseña ][ 🕵 Auditoría ]│
├───────────────────────────────────────────────────────────┤
│  Identidad            │  Contacto y acceso                  │
├───────────────────────────────────────────────────────────┤
│  Datos de estudiante                                        │
│  Código universitario  2021-1001     ORCID  0000-…-…  ↗     │
├───────────────────────────────────────────────────────────┤
│  Historial de tutoría                                       │
│  [ 3 períodos cursados ]  [ Ciclo actual: V ]  [ Tutor: Dr. Quispe ]│
│  Período   Ciclo   Tutor                                    │
│  2026-I    V       Dr. Raúl Quispe Mamani                   │
│  2025-II   IV      Mg. Lucía Torres Ávila                   │
├───────────────────────────────────────────────────────────┤
│  Roles   [Estudiante]                                       │
│  Registrado: … · Última actualización: …                    │
└───────────────────────────────────────────────────────────┘
```
- **Encabezado:** foto, nombre completo, **DNI + Código universitario**
  (identificador clave), badge Estado, acciones (Editar · Contraseña · Auditoría).
- **Identidad / Contacto y acceso:** igual que Docentes.
- **Datos de estudiante:** Código universitario, ORCID (enlace ↗).
- **Historial de tutoría** (óptica del estudiante): por cada período, **qué
  ciclo cursó y quién fue su tutor**. Acotado a **1 fila por período** (UNIQUE
  `estudiante_id, periodo`), así que nunca crece feo.
  - Stats: `Períodos cursados` · `Ciclo actual` · `Tutor actual`.
  - **BD:** `estudiante_ciclo_periodo` → `ciclo_periodo` → `periodo_academico`/
    `ciclo`/`docente`.
  - *Pendiente Módulo 3:* aquí encajará "Fichas llenadas".
- **Roles** (chips) al final; **Metadatos** (`created_at`/`updated_at`).
- Campos vacíos = "—". Responsive igual que la ficha de Docentes.

### Administrador › Usuarios y acceso › Estudiantes — Modales — ⬜ Pendiente

Los 3 genéricos (igual que Docentes). Solo cambia el **chequeo de relaciones**
del borrado:
- **Restablecer contraseña 🔑:** idéntico (nueva = documento).
- **Eliminar / Desactivar 🗑 (2 estados):** bloquea si el estudiante tiene
  **matrículas** (`estudiante_ciclo_periodo`) o **fichas llenadas**
  (`ficha_llenada`) → ofrece **Desactivar** (`usuario.activo = 0`). Ejemplo:
  "Tiene 3 matrículas y 5 fichas llenadas…".
- **Auditoría 🕵:** idéntico (Campo · Antes · Después sobre `auditoria`,
  filtrando `estudiante`/`usuario`).
- **Toasts:** "Estudiante registrado / actualizado / eliminado / desactivado",
  "Contraseña restablecida".

---

## Receptores

Reusa el patrón «Listado de personas», los 3 modales genéricos y los toasts.
**Perfil `receptor`** = solo `entidad_receptora_id` (obligatorio, 1:1 con
usuario). Es el perfil más simple. *(Término técnico del modelo; en UI se
muestra siempre junto a su entidad — "Receptor / Psicología".)*

### Administrador › Usuarios y acceso › Receptores — Listado — ⬜ Pendiente

- **Archivos (al codificar):** `pages/admin/receptores.html` + `js/receptores.js`.
- **Cards (3):** Total · Activos · Inactivos — igual que los demás (conteo
  global inmutable; `usuario.activo`).
- **Barra:** Buscar por nombre, documento o correo · filtro **Entidad** (de
  `entidad_receptora`) · filtro **Estado** · Limpiar.
```
[ 8 Total ]  [ 7 Activos ]  [ 1 Inactivo ]
N° │ Receptor            │ Entidad     │ Documento    │ Contacto        │ Estado   │ Acciones
 1 │ (foto) Rosa Medina  │ Psicología  │ DNI 41235678 │ r.medina@una... │ ● Activo │ 👁 ✏ ⋯
```
- **Columnas (7):** N° · Receptor (foto + nombre) · **Entidad** · Documento ·
  Contacto · Estado · Acciones. **Sin columna Roles** (casi siempre `Receptor`).
- **Acciones:** Ver · Editar · Eliminar + "⋯" (Contraseña · Auditoría ·
  Activar/Desactivar).
- **BD:** `receptor` + `usuario` + `entidad_receptora`; Entidad =
  `entidad_receptora.nombre`.

### Administrador › Usuarios y acceso › Receptores — Formulario (crear / editar) — ⬜ Pendiente

- **Archivos (al codificar):** `pages/admin/receptores-form.html` + `js/receptores-form.js`.
- **Secciones 1 (Identidad) y 2 (Contacto y acceso):** idénticas a Docentes.
```
┌─ 3 · Datos del receptor ──────────────────────────────────┐
│ Entidad receptora* [ Psicología ▾ ]                        │
└───────────────────────────────────────────────────────────┘
┌─ 4 · Roles*  (al menos uno) ──────────────────────────────┐
│ ☑ Receptor    ☐ …  (solo roles activos)                   │
└───────────────────────────────────────────────────────────┘
```
- **Sección 3 · Datos del receptor:** un solo campo — **Entidad receptora***
  (select, obligatorio, solo entidades `activo = 1`).
- **Sección 4 · Roles:** multi-check, solo roles activos, default **Receptor**.
- Contraseña autogenerada = documento. Foto, RENIEC, responsive: igual.
- **BD:** `receptor.entidad_receptora_id` (FK, NOT NULL). Backend crea
  usuario + receptor + rol en transacción.

### Administrador › Usuarios y acceso › Receptores — Ficha (ver, solo lectura) — ⬜ Pendiente

- **Archivos (al codificar):** `pages/admin/receptores-ver.html` + `js/receptores-ver.js`.
```
┌───────────────────────────────────────────────────────────┐
│ [foto]  Rosa Medina Ccahua              ● Activo            │
│         DNI 41235678 · Entidad: Psicología                  │
│                          [ ✏ Editar ][ 🔑 Contraseña ][ 🕵 Auditoría ]│
├───────────────────────────────────────────────────────────┤
│  Identidad            │  Contacto y acceso                  │
├───────────────────────────────────────────────────────────┤
│  Datos del receptor                                         │
│  Entidad receptora   Psicología                             │
├───────────────────────────────────────────────────────────┤
│  Carga de su entidad (Psicología)                           │
│  [ 45 derivaciones ]  [ 12 en proceso ]  [ 33 atendidas ]   │
│  ⓘ Las acciones de esta persona se ven en Auditoría 🕵      │
├───────────────────────────────────────────────────────────┤
│  Roles   [Receptor]                                         │
│  Registrado: … · Última actualización: …                    │
└───────────────────────────────────────────────────────────┘
```
- **Encabezado:** foto, nombre, **DNI + Entidad**, badge Estado, acciones.
- **Identidad / Contacto y acceso:** igual que Docentes.
- **Datos del receptor:** Entidad receptora.
- **Carga de su entidad** (contexto, **no** personal): `derivacion` guarda
  `entidad_receptora_id`, **no** `receptor_id` — varios receptores comparten la
  misma bandeja. Por eso el bloque es de **entidad**, y se aclara que lo hecho
  por *esta persona* se rastrea en **Auditoría**.
  - Stats de la entidad: derivaciones · en proceso · atendidas.
  - **BD:** `derivacion` + `tipo_estado_derivacion` filtrando por
    `entidad_receptora_id`.
  - *Pendiente Módulo 4:* enlace a "Casos derivados" (pantalla aún no diseñada).
- **Roles** (chips) al final; **Metadatos**.

### Administrador › Usuarios y acceso › Receptores — Modales — ⬜ Pendiente

Los 3 genéricos. **Particularidad:** `receptor` **no tiene FKs entrantes**
(nada apunta a `receptor.id`; las derivaciones cuelgan de la entidad), así que
el borrado **no se bloquea por integridad**.
- **Restablecer contraseña 🔑:** idéntico.
- **Eliminar / Desactivar 🗑:** se permite eliminar (soft delete). **Advertencia
  (no bloqueo)** si es el **único receptor activo de su entidad**: *"Es el único
  receptor activo de Psicología; esa entidad quedaría sin nadie para gestionar
  derivaciones."* Opción de Desactivar (`usuario.activo = 0`) igual disponible.
  - **BD:** conteo de `receptor` activos con la misma `entidad_receptora_id`.
- **Auditoría 🕵:** idéntico (filtra `receptor`/`usuario`).
- **Toasts:** "Receptor registrado / actualizado / eliminado / desactivado",
  "Contraseña restablecida".

---

## Usuarios (identidad maestra)

**Concepto clave — 3 capas independientes:**
- **Identidad** (`usuario`): la persona, una sola por documento.
- **Perfil** (`docente`/`estudiante`/`receptor`): opcionales y **acumulables**
  (0..N sobre la misma identidad); son el "enganche" de negocio de cada rol.
- **Acceso** (`usuario_rol`): roles/permisos, **independientes del perfil**.

"Usuarios" es la **lista maestra de todas las identidades** y el centro de
acceso: asigna roles y **agrega/quita perfiles**. Docentes/Estudiantes/
Receptores son las vistas especializadas de cada perfil.

> **Corrección de errores de registro:** como la identidad es única por
> documento (el backend **reutiliza** el `usuario`, nunca duplica) y los
> perfiles se agregan/quitan, un "registro en la pantalla equivocada" se
> arregla desde aquí: se **agrega** el perfil correcto y se **quita** el que
> sobra — sin recrear la persona.

### Administrador › Usuarios y acceso › Usuarios — Listado — ⬜ Pendiente

- **Archivos (al codificar):** `pages/admin/usuarios.html` + `js/usuarios.js`.
- **Cards (3):** Total · Activos · Inactivos (conteo global inmutable).
```
[ 342 Total ]  [ 315 Activos ]  [ 27 Inactivos ]
Buscar:[ nombre, documento o correo… ]  Perfil:[Todos ▾]  Rol:[Todos ▾]  Estado:[Todos ▾]  [🔍][✕]

N° │ Usuario                │ Documento    │ Perfiles      │ Roles                  │ Estado   │ Acciones
 1 │ (foto) Ricardo Vargas  │ DNI 40112233 │ —             │ [Administrador]        │ ● Activo │ 👁 ✏ ⋯
 2 │ (foto) Raúl Quispe M.  │ DNI 45231890 │ [Docente]     │ [Docente-tutor][Admin] │ ● Activo │ 👁 ✏ ⋯
 3 │ (foto) Ana Quispe M.   │ DNI 72154893 │ [Estudiante]  │ [Estudiante]           │ ● Activo │ 👁 ✏ ⋯
```
- **Columnas (7):** N° · Usuario (foto + nombre + **correo de acceso**) ·
  Documento · **Perfiles** (badges Docente/Estudiante/Receptor o "—") ·
  **Roles** (chips) · Estado · Acciones.
- **Filtros:** **Perfil** (Todos / Docente / Estudiante / Receptor / **Sin
  perfil**) · **Rol** · Estado. "Sin perfil" = admin/coordinador puros.
- **BD:** `usuario` + `usuario_rol`→`rol` + existencia de fila en
  `docente`/`estudiante`/`receptor`.

### Administrador › Usuarios y acceso › Usuarios — Formulario (crear / editar) — ⬜ Pendiente

- **Archivos (al codificar):** `pages/admin/usuarios-form.html` + `js/usuarios-form.js`.
- **Secciones 1 (Identidad) y 2 (Contacto y acceso):** idénticas a las demás.
  **Sin** sección de perfil (los perfiles se agregan aparte).
```
┌─ 3 · Roles*  (al menos uno) ──────────────────────────────┐
│ ☐ Administrador  ☐ Coordinador  ☐ Docente-tutor  ☐ …       │
│ ⓘ El rol "Docente-tutor" requiere un perfil de docente     │
│    para asignar tutorías. Podrás agregarlo después.        │
└───────────────────────────────────────────────────────────┘
```
- **Sección 3 · Roles:** multi-check, solo roles `activo = 1`, al menos uno.
- **Aviso rol↔perfil (mejora):** si se marca un rol que *implica* perfil
  (`Docente-tutor`→docente, `Estudiante`→estudiante, `Receptor`→receptor) y ese
  perfil no existe, se muestra un **aviso** (no bloquea): el rol da permisos,
  pero para *funcionar* hace falta el perfil.
- Contraseña autogenerada = documento. Responsive igual.
- **BD:** `usuario` + `usuario_rol`.

### Administrador › Usuarios y acceso › Usuarios — Ficha (ver) — ⬜ Pendiente

- **Archivos (al codificar):** `pages/admin/usuarios-ver.html` + `js/usuarios-ver.js`.
```
← Volver al listado
┌──────────────────────────────────────────────────────────┐
│ [foto] Raúl Quispe Mamani                    ● Activo      │
│        DNI 45231890 · r.quispe@unamba.edu.pe               │
│                          [ ✏ Editar ][ 🔑 Contraseña ][ 🕵 Auditoría ]│
├──────────────────────────────────────────────────────────┤
│  Identidad          │  Contacto y acceso                   │
├──────────────────────────────────────────────────────────┤
│  Perfiles                                                  │
│  ✅ Docente        [ Ver ficha → ]  [ Quitar perfil ]      │
│  ⬜ Estudiante     [ + Agregar perfil ]                    │
│  ⬜ Receptor       [ + Agregar perfil ]                    │
├──────────────────────────────────────────────────────────┤
│  Roles   [Docente-tutor] [Administrador]    [ Gestionar ]  │
├──────────────────────────────────────────────────────────┤
│  Registrado: … · Última actualización: …                   │
└──────────────────────────────────────────────────────────┘
```
- **Bloque "Perfiles"** (el diferenciador): los 3 posibles perfiles; el que
  **tiene** → "Ver ficha →" + "Quitar perfil"; el que **no** → "Agregar perfil".
- **Roles:** chips + "Gestionar" (abre el form en Roles).
- Sin bloque de actividad propio (la actividad vive en las fichas de perfil).
- **BD:** existencia de `docente`/`estudiante`/`receptor` + `usuario_rol`.

### Administrador › Usuarios y acceso › Usuarios — Modales — ⬜ Pendiente

Los 3 genéricos **+ 2 de perfil**:
- **Restablecer contraseña 🔑 / Auditoría 🕵:** idénticos.
- **Eliminar / Desactivar 🗑:** eliminar solo si la identidad **no tiene
  perfiles ni historial**; si los tiene → **Desactivar** (`usuario.activo = 0`,
  deshabilita el login de toda la identidad).
- **➕ Agregar perfil:** eliges Docente/Estudiante/Receptor → abre ese
  formulario de perfil con la **identidad precargada (solo lectura)**; solo se
  completan los **datos del perfil**. El backend **reutiliza** el `usuario`
  (no duplica). Toast: "Perfil de docente agregado".
- **➖ Quitar perfil:** confirma → **soft delete de ese perfil**, con el
  **mismo chequeo de relaciones** de su pantalla (si tiene historial, no se
  quita: se desactiva). La identidad queda intacta.
- **Toasts:** "Usuario registrado / actualizado / eliminado / desactivado",
  "Perfil agregado / quitado", "Contraseña restablecida".

---

### Administrador › Usuarios y acceso › Roles y permisos — ⬜ Pendiente

- **Archivos (al codificar):** `pages/admin/roles-permisos.html` + `js/roles-permisos.js`.
- **Tipo:** **RBAC puro** (asignar permisos a roles) — **no** es un listado de
  personas. Layout **maestro-detalle**: roles a la izquierda, permisos del rol
  seleccionado a la derecha. La pantalla ya existe; se **rediseña** al modelo.

```
Roles y permisos                                    6 roles · 5 activos · 48 permisos
┌─ Roles ────────────────┐  ┌─ Permisos de «Docente-Tutor» ──────────────────────┐
│ [ + Nuevo rol ]        │  │ 12 de 48 asignados            [ Guardar cambios ]   │
│                        │  │                                                     │
│ Administrador     🔒   │  │ ▾ Docentes                        [ Todos ☑ ]       │
│   admin · 3 usuarios   │  │    ☑ Ver docentes     ☑ Crear docentes              │
│ ─────────────────────  │  │    ☐ Editar docentes  ☐ Eliminar docentes           │
│ Docente-Tutor    ◄ ✏🗑 │  │ ▾ Estudiantes                     [ Todos ☐ ]       │
│   docente_tutor · 24   │  │    ☑ Ver estudiantes  ☐ Crear   ☐ Editar  ☐ Elim.  │
│ Estudiante             │  │ ▸ Fichas                                            │
│   estudiante · 320     │  │ ▸ Alertas y derivación            [ Todos ☐ ]       │
│ Receptor               │  │ ▸ Catálogos                                         │
│   psicologo · 8        │  │    …                                                │
└────────────────────────┘  └─────────────────────────────────────────────────────┘
```

**Panel izquierdo — Roles:**
- Cada rol: **nombre** (visible), **clave** (mono, pequeña), **conteo de
  usuarios** (`usuario_rol`), y estado:
  - **🔒 protegido:** rol crítico (ej. Administrador) — no se edita ni se borra.
  - **Inactivo:** atenuado + badge (`rol.activo = 0`).
- Rol **seleccionado** resaltado; muestra acciones **✏ Editar · 🗑 Eliminar**
  (ocultas/deshabilitadas si es protegido). **[+ Nuevo rol]** arriba.
- **BD:** `rol` (nombre, clave, protegido, activo) + conteo `usuario_rol`.

**Panel derecho — Permisos del rol seleccionado:**
- Permisos **agrupados por módulo** (`permiso.modulo`), grupos colapsables, con
  **[Todos ☑]** por módulo.
- Cada permiso = **checkbox** (asignado o no en `rol_permiso`); muestra el
  `nombre` visible con tooltip a la `clave` (ej. `docentes.crear`).
- Contador **"X de Y asignados"** + **[Guardar cambios]** (sincroniza
  `rol_permiso`).
- **Rol protegido → todo en solo lectura** (checkboxes deshabilitados + aviso).
- Los permisos **NO se crean/editan/borran aquí**: son catálogo **sembrado** por
  el desarrollador; esta pantalla **solo los asigna**.
- **BD:** `permiso` (por `modulo`) + `rol_permiso`.

**Modales:**
- **➕ Nuevo rol / ✏ Editar rol:** campos **Clave · Nombre · Descripción ·
  Activo**. La **Clave** es editable **solo al crear** (el código depende de
  ella); al editar se muestra **bloqueada**. `protegido` no se toca desde la UI
  (roles nuevos nacen `protegido = 0`). Validación: `clave` y `nombre` únicos.
- **🗑 Eliminar rol:** solo si **no es protegido** y **no está asignado a ningún
  usuario**. Si está en uso → bloqueo con opción **Desactivar** (`activo = 0`):
  "Este rol está asignado a 24 usuarios; desactívalo en lugar de eliminarlo."
- **Toasts:** "Rol creado / actualizado / eliminado / desactivado", "Permisos
  actualizados".

**Detalles:**
- **Sin cards** (no es lista de personas); solo línea meta "N roles · M activos
  · K permisos".
- **Enlace útil:** el "· 24 usuarios" de un rol lleva al listado de **Usuarios**
  filtrado por ese rol (conecta con el filtro Rol de esa pantalla).
- **Responsive:** dos paneles en escritorio; en tablet/móvil se **apilan**
  (roles arriba → al elegir uno, sus permisos debajo), o los roles pasan a un
  `select` superior.

> Reglas duras: **protegido = candado total** (ni nombre ni permisos);
> **clave inmutable** tras crear; **permisos solo lectura** como catálogo (se
> asignan, no se crean).
