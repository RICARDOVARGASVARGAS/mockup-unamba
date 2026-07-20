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

> **Aplicado en `components/app-sidebar.js`:** el menú admin coincide con este
> árbol (Usuarios y acceso · Catálogos · Organización del período · Fichas ·
> Alertas y derivación). Sin *Tipos de pregunta* ni *Tipos de estado de
> derivación* como ítems de menú.

---

## Pantallas

### Estado de construcción (checklist para la IA)

Al **implementar** cada pantalla según este diseño, marca su casilla
(`- [ ]` → `- [x]`) y cambia el estado de su encabezado a **✅ Hecho**. Mientras
no esté construida en código según este doc, queda **⬜ Pendiente**.

**Administrador › Usuarios y acceso › Docentes**
- [x] Listado (tabla + 3 cards)
- [x] Formulario (crear / editar)
- [x] Ficha (ver, solo lectura)
- [x] Modales: Restablecer contraseña · Eliminar · Auditoría

**Administrador › Usuarios y acceso › Estudiantes**
- [x] Listado (tabla + 3 cards)
- [x] Formulario (crear / editar)
- [x] Ficha (ver, solo lectura)
- [x] Modales (reusa los genéricos)

**Administrador › Usuarios y acceso › Receptores**
- [x] Listado (tabla + 3 cards)
- [x] Formulario (crear / editar)
- [x] Ficha (ver, solo lectura)
- [x] Modales (reusa los genéricos)

**Administrador › Usuarios y acceso › Usuarios**
- [x] Listado (identidad maestra: Perfiles + Roles)
- [x] Formulario (crear / editar: identidad + roles)
- [x] Ficha (ver, con bloque Perfiles)
- [x] Modales (genéricos + Agregar/Quitar perfil)

**Administrador › Usuarios y acceso › Roles y permisos**
- [x] Pantalla maestro-detalle (roles + permisos por módulo)
- [x] Modales (Nuevo/Editar rol · Eliminar/Desactivar rol)

**Administrador › Catálogos**
- [x] Especialidades
- [x] Tipos de documento
- [x] Áreas
- [x] Tipos de ficha
- [x] Grados académicos
- [x] Ciclos
- [x] Periodos académicos (especial: único activo)
- [x] Entidades receptoras — listado + modal
- [x] Estados de derivación — sub-página (pipeline por entidad)

**Administrador › Organización del período**
- [ ] Configuración del período (hub: ciclos + clonar + historial)
- [ ] Docentes del ciclo (sub-editor / drawer)
- [ ] Temario (árbol por ciclo+período) — compartido con Docente
- [ ] Matrículas
- [ ] Avanzar estudiantes

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

### Administrador › Usuarios y acceso › Docentes — Listado — ✅ Hecho

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

### Administrador › Usuarios y acceso › Docentes — Formulario (crear / editar) — ✅ Hecho

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

### Administrador › Usuarios y acceso › Docentes — Ficha (ver, solo lectura) — ✅ Hecho

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

### Administrador › Usuarios y acceso › Docentes — Modales — ✅ Hecho

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

### Administrador › Usuarios y acceso › Estudiantes — Listado — ✅ Hecho

- **Archivos (al codificar):** `pages/admin/estudiantes.html` + `js/estudiantes.js`.
- **Cards (3):** Total · Activos · No activos (egresados/retirados) — conteo
  global inmutable, por **estado académico** (`estudiante.estado`).
- **Barra:** Buscar por nombre, apellido, **código universitario**, documento o
  correo · filtro **Estado** (Activo / Egresado / Retirado) · Limpiar. **Sin**
  filtro de Especialidad.
- **Dos estados distintos:** la columna Estado muestra el **académico**
  (`estudiante.estado`: activo/egresado/retirado); el **acceso/login**
  (`usuario.activo`) se ve/edita en el formulario. No confundirlos.
```
[ 320 Total ]  [ 298 Activos ]  [ 22 Inactivos ]
N° │ Estudiante          │ Código univ. │ Documento    │ Contacto        │ Estado   │ Acciones
 1 │ (foto) Ana Quispe M.│ 2021-1001    │ DNI 72154893 │ a.quispe@una... │ ● Activo │ 👁 ✏ ⋯
```
- **Columnas (7):** N° · Estudiante (foto + nombre) · **Código universitario** ·
  Documento (tipo + número) · Contacto (correo + celular) · **Estado académico**
  (badge: Activo / Egresado / Retirado) · Acciones.
  - En el "⋯" se agrega **Marcar egresado / retirado / reactivar** (setea
    `estudiante.estado`).
  - **Sin columna Roles:** un estudiante casi siempre tiene solo el rol
    `Estudiante`; se ve en la ficha. (Docentes/Usuarios sí la llevan.)
- **Acciones:** Ver · Editar · Eliminar + "⋯" (Restablecer contraseña ·
  Auditoría · Activar/Desactivar).
- **BD:** `estudiante` + `usuario`; Código = `estudiante.codigo_universitario`.

### Administrador › Usuarios y acceso › Estudiantes — Formulario (crear / editar) — ✅ Hecho

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

### Administrador › Usuarios y acceso › Estudiantes — Ficha (ver, solo lectura) — ✅ Hecho

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

### Administrador › Usuarios y acceso › Estudiantes — Modales — ✅ Hecho

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

### Administrador › Usuarios y acceso › Receptores — Listado — ✅ Hecho

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

### Administrador › Usuarios y acceso › Receptores — Formulario (crear / editar) — ✅ Hecho

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

### Administrador › Usuarios y acceso › Receptores — Ficha (ver, solo lectura) — ✅ Hecho

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

### Administrador › Usuarios y acceso › Receptores — Modales — ✅ Hecho

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

### Administrador › Usuarios y acceso › Usuarios — Listado — ✅ Hecho

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

### Administrador › Usuarios y acceso › Usuarios — Formulario (crear / editar) — ✅ Hecho

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

### Administrador › Usuarios y acceso › Usuarios — Ficha (ver) — ✅ Hecho

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

### Administrador › Usuarios y acceso › Usuarios — Modales — ✅ Hecho

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

### Administrador › Usuarios y acceso › Roles y permisos — ✅ Hecho

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

---

## Catálogos

Los 8 catálogos comparten un **molde común** (abajo). Cada uno solo define sus
**columnas/campos propios**. Se documentan de lo simple a lo especial.

### Patrón base «Catálogo simple» (guía)

**Tabla:**
```
Catálogo                                        [ ⟳ Actualizar ]  [ + Nuevo registro ]
Descripción breve del catálogo.

┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ 📋  TOTAL           │  │ ✔  ACTIVOS          │  │ ⏸  INACTIVOS        │
│ 12                  │  │ 10                  │  │ 2                   │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘

Buscar:[ … ]        Estado:[ Todos ▾ ]        [🔍][✕]
Mostrando 1–10 de 12
┌─────┬──────────────────────────┬────────────────┬─────────────────────┐
│ N°  │ [ campos propios ]       │ Estado         │ Acciones            │
├─────┼──────────────────────────┼────────────────┼─────────────────────┤
│  1  │ …                        │ [ ● Activo  ⇄ ]│  ✏     🕵     🗑    │
│  2  │ …                        │ [ ○ Inactivo⇄ ]│  ✏     🕵     🗑    │
└─────┴──────────────────────────┴────────────────┴─────────────────────┘
                                                    ‹ 1  2 ›   Filas:[10 ▾]
```
- **Cards (3):** Total · Activos · Inactivos — informativas, conteo global
  inmutable (igual que en personas). BD: `activo`.
- **Estado:** toggle interactivo `⇄` en la fila → **activar/desactivar** al
  instante (sin abrir modal).
- **Acciones (3 botones visibles, con color):**
  | Botón | Acción | Color |
  |---|---|---|
  | ✏ Editar | abre el modal de edición | azul |
  | 🕵 Historial | `<app-modal-historial>` (auditoría de ese registro) | naranja |
  | 🗑 Eliminar | `<app-modal-confirm>`; **bloqueado si está en uso** (FK) → sugiere desactivar | rojo |
- **Barra:** Buscar (por nombre) + filtro Estado + Limpiar.
- **Motor:** `js/catalog-table.js` + estilos `catalog-*`. Paginación 5/10/…

**Formulario (modal — alta/edición):**
```
┌─ Nuevo registro ─────────────────────────┐
│  [ campo propio 1 ]*                      │
│  [ campo propio 2 ]   (según el catálogo) │
│  Estado    [ ● Activo | ○ Inactivo ]      │
│                    [ Cancelar ]  [ Guardar ]│
└──────────────────────────────────────────┘
```
- Alta y edición en el **mismo modal** (título "Nuevo…" / "Editar…").
- Los **campos propios varían** por catálogo; el toggle **Estado** siempre está.
- Validación: unicidad de `nombre`/`clave` (según el catálogo).

**Reglas comunes (los 8):**
- **Eliminar solo si no está en uso** (la FK lo impide) → si se usa, se
  **desactiva** (`activo = 0`).
- **Catálogos con `clave`:** la `clave` es editable **solo al crear** (el código
  y/o la IA dependen de ella); al **editar** se muestra **bloqueada**.
- **Auditoría** por fila (🕵) en todos.
- Cards, buscador, filtro Estado y paginación **iguales** en los 8.
- **Toasts:** "[Registro] creado / actualizado / eliminado / activado /
  desactivado".

**Columnas/campos propios por catálogo** (el resto es el molde):

| Catálogo | Columnas propias | Campos del modal |
|---|---|---|
| Especialidades | Nombre | Nombre* |
| Tipos de documento | Clave · Nombre | Clave* · Nombre* |
| Áreas | Clave · Nombre | Clave* · Nombre* |
| Tipos de ficha | Clave · Nombre | Clave* · Nombre* |
| Grados académicos | Nombre · Abreviatura · Orden | Nombre* · Abreviatura* · Orden |
| Ciclos | Nombre · Orden | Nombre* · Orden* |
| Periodos académicos | Nombre · Inicio · Fin | Nombre* · Fechas (único activo) |
| Entidades receptoras | Clave · Nombre | Clave* · Nombre* · Descripción (+ estados anidados) |

> **Candidato a patrón reutilizable:** todo el molde de catálogo. Revisar al
> final junto con los 8.

### Administrador › Catálogos › Especialidades — ✅ Hecho

- **Archivos (al codificar):** `pages/admin/especialidades.html` + `js/especialidades.js`.
- **Instancia más simple del molde.** Columna propia: **Nombre**.
- **Columnas (4):** N° · Nombre · Estado (toggle) · Acciones (✏ · 🕵 · 🗑).
- **Modal Nueva / Editar:** **Nombre*** (único) + Estado (toggle). **Nada más.**
  - *Corrección vs. mockup viejo:* **no** lleva "N° de orden" — la tabla
    `especialidad` es solo `nombre` + `activo`.
- **Eliminar 🗑:** bloqueado si está en uso por algún docente (FK
  `docente.especialidad_id`) → sugiere **Desactivar**. Si nunca se usó → elimina.
- **BD:** `especialidad` (`nombre` UNIQUE, `activo`).
- **Datos placeholder:** Marketing, Finanzas, Gestión Pública, Recursos
  Humanos, Contabilidad.

### Administrador › Catálogos › Tipos de documento — ✅ Hecho

- **Archivos (al codificar):** `pages/admin/tipos-documento.html` +
  `js/tipos-documento.js` + `js/tipos-documento-data.js` (seed **compartido**
  con los selects de los formularios de persona).
- **Columnas (5):** N° · **Clave** · **Nombre** · Estado (toggle) · Acciones.
- **Modal Nuevo / Editar:** **Clave*** · **Nombre*** · Estado.
  - `clave` bloqueada al editar — valida el documento (ej. `DNI` = 8 dígitos).
- **Eliminar 🗑:** bloqueado si está en uso por algún `usuario`
  (`usuario.tipo_documento_id`) → **Desactivar**.
- **BD:** `tipo_documento` (`clave` UNIQUE, `nombre` UNIQUE, `activo`).
- **Datos placeholder:** DNI (`DNI`), Carné de Extranjería (`CE`),
  Pasaporte (`PAS`).

### Administrador › Catálogos › Áreas — ✅ Hecho

- **Archivos (al codificar):** `pages/admin/areas.html` + `js/areas.js`.
- **Columnas (5):** N° · **Clave** · **Nombre** (con `descripción` como línea
  secundaria/tooltip) · Estado (toggle) · Acciones.
- **Modal Nuevo / Editar:** **Clave*** · **Nombre*** · **Descripción** · Estado.
  - `clave` bloqueada al editar — **la usa la IA** en su respuesta JSON
    (`personal_social`, `salud_mental`…); cambiarla rompería el mapeo.
- **Eliminar 🗑:** bloqueado si tiene `pregunta` o `alerta_ia` referenciada →
  **Desactivar**.
- **BD:** `area` (`clave` UNIQUE, `nombre` UNIQUE, `descripcion`, `activo`).
- **Datos placeholder:** Personal y social, Salud corporal y mental, Académico,
  Económico, Vocacional y profesional.

### Administrador › Catálogos › Tipos de ficha — ✅ Hecho

- **Archivos (al codificar):** `pages/admin/tipos-ficha.html` + `js/tipos-ficha.js`.
- **Columnas (6):** N° · **Clave** · **Nombre** (con `descripción` en tooltip) ·
  **Orden** · Estado (toggle) · Acciones.
- **Modal Nuevo / Editar:** **Clave*** · **Nombre*** · **Descripción** ·
  **Orden** · Estado.
  - `clave` bloqueada al editar — identificador estable para el código.
  - `orden` controla el orden de aparición en los selects del formulario de
    fichas.
- **Eliminar 🗑:** bloqueado si tiene alguna `ficha` referenciada → **Desactivar**.
- **BD:** `tipo_ficha` (`clave` UNIQUE, `nombre` UNIQUE, `descripcion`, `orden`,
  `activo`).
- **Datos placeholder:** Diagnóstico (`diagnostico`), Seguimiento
  (`seguimiento`), Grupal (`grupal`), Encuesta (`encuesta`).

### Administrador › Catálogos › Grados académicos — ✅ Hecho

Añade `orden` al molde base. Lista **ordenada por `orden`**; se reordena con
**flechas ⇅** (subir/bajar la fila **intercambia el orden** — sin teclear
números).
```
Grados académicos                              [ ⟳ Actualizar ]  [ + Nuevo grado ]
[ 4 Total ]  [ 4 Activos ]  [ 0 Inactivos ]
┌─────┬────────┬──────────────┬──────────────┬───────────┬───────────┐
│ N°  │ Orden  │ Nombre       │ Abreviatura  │ Estado    │ Acciones  │
├─────┼────────┼──────────────┼──────────────┼───────────┼───────────┤
│  1  │ ⇅ 1    │ Bachiller    │ Bach.        │ ● Activo  │ ✏ 🕵 🗑   │
│  2  │ ⇅ 2    │ Licenciado   │ Lic.         │ ● Activo  │ ✏ 🕵 🗑   │
└─────┴────────┴──────────────┴──────────────┴───────────┴───────────┘
```
- **Archivos (al codificar):** `pages/admin/grados-academicos.html` + `js/grados-academicos.js`.
- **Columnas (6):** N° · **Orden** (⇅) · Nombre · **Abreviatura** · Estado · Acciones.
- **Modal Nuevo / Editar:** **Nombre*** · **Abreviatura*** · Estado. El orden lo
  maneja la lista (un grado nuevo se agrega al final).
- **Abreviatura obligatoria y única** (`Bach.`, `Lic.`, `Mg.`, `Dr.`) — se usa
  en listados densos (ej. columna Docente).
- **Eliminar 🗑:** bloqueado si algún docente lo usa
  (`docente.grado_academico_id`) → **Desactivar**.
- **BD:** `grado_academico` (`nombre` UNIQUE, `abreviatura` UNIQUE, `orden`,
  `activo`).
- **Datos placeholder:** Bachiller (`Bach.`), Licenciado (`Lic.`), Magíster
  (`Mg.`), Doctor (`Dr.`).

### Administrador › Catálogos › Ciclos — ✅ Hecho

Añade `orden` **único y obligatorio**. Lista **ordenada por `orden`**; se
reordena con **flechas ⇅** que hacen un **intercambio atómico** (no puede haber
dos ciclos con el mismo orden).
```
Ciclos                                         [ ⟳ Actualizar ]  [ + Nuevo ciclo ]
[ 10 Total ]  [ 10 Activos ]  [ 0 Inactivos ]
┌─────┬────────┬────────────────┬───────────┬───────────┐
│ N°  │ Orden  │ Nombre         │ Estado    │ Acciones  │
├─────┼────────┼────────────────┼───────────┼───────────┤
│  1  │ ⇅ 1    │ Primer ciclo   │ ● Activo  │ ✏ 🕵 🗑   │
│  2  │ ⇅ 2    │ Segundo ciclo  │ ● Activo  │ ✏ 🕵 🗑   │
└─────┴────────┴────────────────┴───────────┴───────────┘
```
- **Archivos (al codificar):** `pages/admin/ciclos.html` + `js/ciclos.js`.
- **Columnas (5):** N° · **Orden** (⇅) · Nombre · Estado · Acciones.
- **Modal Nuevo / Editar:** **Nombre*** · Estado. El `orden` se asigna solo al
  final al crear y se cambia con las flechas ⇅.
- **Particularidad — `orden` ÚNICO y obligatorio:** las flechas ⇅ intercambian
  el orden de forma atómica. El `orden` alimenta **"Avanzar estudiantes"** (el
  ciclo siguiente = `orden` + 1), así que debe estar correcto.
- **Eliminar 🗑:** bloqueado si está referenciado por `ciclo_periodo` →
  **Desactivar**. *(Nota BD: `ciclo` no tiene `deleted_at`; se retira con
  `activo = 0`.)*
- **BD:** `ciclo` (`nombre` UNIQUE, `orden` UNIQUE, `activo`).
- **Datos placeholder:** Primer ciclo … Décimo ciclo (`orden` 1–10).

### Administrador › Catálogos › Periodos académicos — ✅ Hecho

**Especial:** el "Estado" no es un toggle libre — **solo un período es vigente**
a la vez. Activar uno **desactiva al anterior** (regla **funcional**, en
transacción; MySQL no la puede imponer nativamente). Aplica **solo al período**
(el semestre `2026-I`), **no** a `ciclo` (los niveles 1°–10° corren varios en
paralelo — ver "Ciclo ≠ Período").
```
Periodos académicos                            [ ⟳ Actualizar ]  [ + Nuevo período ]

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ 📋  TOTAL        │  │ ✔  VIGENTE       │  │ ⏸  NO VIGENTES   │
│ 8                │  │ 2026-I           │  │ 7                │
└──────────────────┘  └──────────────────┘  └──────────────────┘

Buscar:[ nombre… ]   Estado:[ Todos ▾ ] (Todos · Vigente · No vigente)   [🔍][✕]
┌─────┬───────────┬────────────┬────────────┬────────────────────┬───────────┐
│ N°  │ Nombre    │ Inicio     │ Fin        │ Estado             │ Acciones  │
├─────┼───────────┼────────────┼────────────┼────────────────────┼───────────┤
│  1  │ 2026-I    │ 01/03/2026 │ 31/07/2026 │ ● Vigente          │ ✏ 🕵 🗑   │
│  2  │ 2025-II   │ 01/08/2025 │ 20/12/2025 │ [ Marcar vigente ] │ ✏ 🕵 🗑   │
└─────┴───────────┴────────────┴────────────┴────────────────────┴───────────┘
```
- **Archivos (al codificar):** `pages/admin/periodos-academicos.html` + `js/periodos-academicos.js`.
- **Cards adaptadas** (Total/Activos/Inactivos no aplica): **Total** · **Vigente**
  (muestra el nombre, resaltado) · **No vigentes**.
- **Columnas (6):** N° · Nombre (`2026-I`) · Fecha inicio · Fecha fin ·
  **Estado** · Acciones.
- **Estado NO es toggle libre:** la fila vigente muestra `● Vigente`; las demás,
  un botón **[ Marcar vigente ]**. Filtro Estado: Todos / Vigente / No vigente.
- **Aviso "sin período vigente":** si ningún período está activo, mostrar un
  aviso arriba ("No hay período vigente. Marca uno para habilitar matrículas y
  fichas.") — todo el sistema opera sobre el vigente.

**Modal (Nuevo / Editar):**
```
┌─ Nuevo período ────────────────────────────┐
│ Nombre*        [ 2026-II ]                 │
│ Fecha inicio   [ dd/mm/aaaa ]              │
│ Fecha fin      [ dd/mm/aaaa ]              │
│ ⓘ Se crea como NO vigente. Se activa luego │
│    con "Marcar vigente".                   │
│                    [ Cancelar ]  [ Guardar ]│
└────────────────────────────────────────────┘
```
- **Campos:** **Nombre*** (`2026-I`, único) · **Fecha inicio** · **Fecha fin**
  (ambas opcionales). **Sin toggle de estado:** nace no vigente (`activo = 0`).
- **Validación:** si ambas fechas están, `inicio ≤ fin`.

**Acción "Marcar vigente" (con confirmación — es crítico):**
```
┌─ Marcar período vigente ───────────────────────┐
│ ¿Marcar 2026-II como período vigente?          │
│ El período actual (2026-I) dejará de serlo.    │
│ Matrículas, fichas y alertas pasarán a operar  │
│ sobre 2026-II.                                 │
│                   [ Cancelar ]  [ Marcar vigente ]│
└────────────────────────────────────────────────┘
```
- Al confirmar: activa ese período y **desactiva el anterior** en una sola
  transacción. Toast: "2026-II es ahora el período vigente".

**Eliminar 🗑:** permitido **solo** si **no es el vigente** y **no tiene
`ciclo_periodo`** asociado. Si tiene datos → bloqueo: "Este período tiene
ciclos/matrículas asociados; es historial y no se puede eliminar." *(Aquí no hay
"desactivar": `activo` es la vigencia, no un borrado suave; `periodo_academico`
no tiene `deleted_at`.)*

- **BD:** `periodo_academico` (`nombre` UNIQUE, `fecha_inicio`, `fecha_fin`,
  `activo` = vigente). Reglas: **un solo `activo = 1`**; `inicio ≤ fin`.
- **Datos placeholder:** 2024-I, 2024-II, 2025-I, 2025-II, 2026-I (vigente).

> **No incluye "Clonar período"**: copiar la configuración (ciclos/docentes/
> temario) a un período nuevo pertenece a **Organización del período** (Módulo
> 2). Este catálogo solo administra la lista y cuál es el vigente.

### Administrador › Catálogos › Entidades receptoras — ✅ Hecho

**El catálogo más rico:** es un catálogo normal (`clave`·`nombre`·`descripción`),
**pero** cada entidad tiene su **propia línea de estados** (`tipo_estado_derivacion`)
— el pipeline por el que pasa una derivación. Se diseña en **2 niveles**.

#### Nivel 1 — Listado de entidades
```
Entidades receptoras                           [ ⟳ Actualizar ]  [ + Nueva entidad ]
[ 3 Total ]  [ 3 Activas ]  [ 0 Inactivas ]
Buscar:[ nombre o clave… ]   Estado:[ Todos ▾ ]   [🔍][✕]
┌─────┬──────────────────┬──────────────┬────────────┬───────────┬──────────────────────┐
│ N°  │ Clave            │ Nombre       │ Estados    │ Estado    │ Acciones             │
├─────┼──────────────────┼──────────────┼────────────┼───────────┼──────────────────────┤
│  1  │ psicologia       │ Psicología   │ 5 pasos ▸  │ ● Activa  │ ✏  🔀 Estados  🕵  🗑 │
│  2  │ servicios_medicos│ Serv. médicos│ 5 pasos ▸  │ ● Activa  │ ✏  🔀 Estados  🕵  🗑 │
│  3  │ bienestar        │ Bienestar    │ 4 pasos ▸  │ ● Activa  │ ✏  🔀 Estados  🕵  🗑 │
└─────┴──────────────────┴──────────────┴────────────┴───────────┴──────────────────────┘
```
- **Archivos (al codificar):** `pages/admin/entidades-receptoras.html` + `js/entidades-receptoras.js`.
- **Molde base** + columna/acción propia **Estados** (nº de pasos + acceso al editor).
- **Modal Nueva / Editar entidad:** **Clave*** (bloqueada al editar — la usa la
  IA y la validación de roles) · **Nombre*** · **Descripción** · Estado.
- **🔀 Estados:** abre el editor de pipeline (Nivel 2).
- **Eliminar 🗑:** bloqueado si tiene `derivacion` o estados configurados →
  **Desactivar**.
- **BD:** `entidad_receptora` (`clave` UNIQUE, `nombre` UNIQUE, `descripcion`,
  `activo`).
- **Datos placeholder:** Psicología (`psicologia`), Servicios médicos
  (`servicios_medicos`), Bienestar universitario (`bienestar`).

#### Nivel 2 — Estados de derivación (pipeline por entidad)

Se llega desde 🔀. **Sub-página** (`entidades-receptoras-estados.html?id=`), no
modal — el editor tiene su propio reordenar + modales de agregar/editar, y un
modal-sobre-modal se sentiría apretado. Se diseña como **línea de tiempo
editable** (es un flujo).
```
← Volver a entidades          Estados de derivación — Psicología    [ + Agregar estado ]

  ⇅  ①  Derivado                     clave: derivado        ● Activo    ✏
  │
  ⇅  ②  En evaluación psicológica    clave: en_evaluacion   ● Activo    ✏
  │
  ⇅  ③  En terapia                   clave: en_terapia      ● Activo    ✏
  │
  ⇅  ④  Resuelto                     clave: resuelto        ● Activo    ✏
  │
  ⇅  ⑤  Cerrado                      clave: cerrado         ● Activo    ✏

  ▸ Estados retirados (2)   — se conservan por historial, no se borran
```
- **Archivos (al codificar):** `pages/admin/entidades-receptoras-estados.html` +
  `js/entidades-receptoras-estados.js`.
- **Timeline vertical numerada** por `orden`, con línea conectora.
- **Reordenar con ⇅** (igual que Ciclos: `orden` **único por entidad** →
  intercambio atómico).
- **Cada paso:** nombre + `clave` (mono) + badge Activo + ✏ Editar.
- **[+ Agregar estado]:** modal **Clave*** · **Nombre*** (el `orden` se asigna al
  final).
- **✏ Editar estado:** **Nombre** editable · Estado (activo). **Clave bloqueada**
  (el historial depende de ella).
- **Retirar en vez de borrar:** el toggle `activo = 0` **no borra** — mueve el
  paso a **"Estados retirados"** (colapsado). Derivaciones antiguas lo siguen
  referenciando (FK intacta).
- **BD:** `tipo_estado_derivacion` (FK `entidad_receptora_id`, `clave` UNIQUE por
  entidad, `nombre`, `orden` UNIQUE por entidad, `activo`).

**Por qué evolucionar el pipeline NO rompe nada** (regla de historial):
- Cada `derivacion` guarda un **FK al estado**; los estados **nunca se borran**,
  se **retiran** (`activo = 0`).
- Pasar de 5 a 4 pasos = retirar/agregar filas; las **derivaciones antiguas**
  siguen apuntando a su estado (aunque esté retirado, la fila existe y es
  legible); las **nuevas** solo ven los `activo = 1`.
- Un hard delete de un estado en uso lo **bloquea la FK** (RESTRICT) — por eso la
  UI ofrece **"Retirar", no "Eliminar"**.
- **Reglas:** quitar → `activo = 0`; agregar → nueva fila; reordenar → swap de
  `orden` en transacción; renombrar → edita `nombre` (la `clave` no cambia).

---

## Organización del período (Módulo 2)

Todo este grupo trabaja **sobre un período** (seleccionable). El nodo central es
`ciclo_periodo` (un ciclo dentro de un período); de él cuelgan docentes, temario
y matrículas.

### Administrador › Organización del período › Configuración del período — ⬜ Pendiente

Hub que **arma la estructura** de un período: qué ciclos tiene, qué docentes
tutoran cada uno y su temario. **No crea el período** (eso es el catálogo
"Periodos académicos"); aquí se **configura** uno existente.
```
Configuración del período   Período: [ 2026-I ▾  ● Vigente ]   [🕵 Historial]  [⧉ Clonar desde…]  [+ Agregar ciclos]

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ 📚 CICLOS         │  │ 👥 DOCENTES       │  │ 🎓 MATRICULADOS   │
│ 10               │  │ 14 asignados     │  │ 195              │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌─────┬────────────────┬─────────────┬─────────────┬───────────────┬────────────────────────────┐
│ N°  │ Ciclo          │ Docentes    │ Temario     │ Matriculados  │ Acciones                   │
├─────┼────────────────┼─────────────┼─────────────┼───────────────┼────────────────────────────┤
│  1  │ Primer ciclo   │ 2 tutores   │ 8 temas     │ 20            │ 👥 Docentes  📋 Temario  🗑 │
│  2  │ Segundo ciclo  │ 1 tutor     │ 6 temas     │ 18            │ 👥 Docentes  📋 Temario  🗑 │
└─────┴────────────────┴─────────────┴─────────────┴───────────────┴────────────────────────────┘
```
- **Archivos (al codificar):** `pages/admin/gestion-periodo.html` + `js/gestion-periodo.js`.
- **Selector de período** (default: **vigente**): lista **todos** los períodos
  existentes; cambiarlo re-scopea la pantalla. Un período aparece aquí apenas se
  crea en el catálogo (no hace falta que sea vigente).
- **3 cards** del período: Ciclos configurados · Docentes asignados · Matriculados.
- **Tabla de ciclos del período** (`ciclo_periodo`): contadores (docentes,
  temario, matriculados) + acciones por fila.
- **[+ Agregar ciclos]** — **multi-selección**: marca uno o varios ciclos del
  catálogo que aún no estén en el período → crea las filas `ciclo_periodo`.
- **[⧉ Clonar desde…]** — **clonado inteligente (merge)**: copia de un período
  origen **solo los ciclos que faltan** (con sus docentes y temario) y **omite
  los que ya existen** (no los toca). Muestra el detalle antes de confirmar:
  ```
  ┌─ Clonar desde 2025-II → 2026-I ───────────────────────┐
  │ Se agregarán 7 ciclos (con docentes y temario):       │
  │   + 4°, 5°, 6°, 7°, 8°, 9°, 10° ciclo                  │
  │ Se omiten 3 que ya existen (no se tocan): 1°, 2°, 3°   │
  │                          [ Cancelar ]  [ Clonar 7 ]   │
  └───────────────────────────────────────────────────────┘
  ```
  **No** clona matrículas. Calza con `UNIQUE (ciclo_id, periodo)` (lo existente se salta).
- **[🕵 Historial]** — **Historial de movimientos** del período: quién agregó/
  quitó ciclos y asignó/quitó docentes, con fecha. **BD:** `auditoria` filtrando
  `ciclo_periodo` + `docente_ciclo_periodo` de ese período.
- **[🗑 Quitar]** un ciclo del período: **bloqueado si ya tiene** docentes,
  temario o matriculados (hijos históricos) → primero se vacía.
- **Estado vacío:** si el período no tiene ciclos → "Este período aún no tiene
  ciclos configurados" + [ + Agregar ciclos ] y [ ⧉ Clonar desde otro período ].
- **BD:** `ciclo_periodo` (UNIQUE `ciclo_id`+`periodo_academico_id`; sin
  `activo`/`deleted_at` — es estructural).

#### Sub-editor 👥 Docentes del ciclo (drawer)

Gestiona `docente_ciclo_periodo`: el **pool de tutores** de ese ciclo+período.
Luego, en Matrículas, cada estudiante se asigna a **uno** de ellos.
```
Docentes — Primer ciclo · 2026-I                        [ + Asignar docentes ]
┌──────────────────────────────┬─────────────┬───────────┐
│ Docente                      │ Tutorados   │           │
│ Dr. Raúl Quispe Mamani       │ 12          │ 🗑 Quitar │
│ Mg. Lucía Torres Ávila       │  8          │ 🗑 Quitar │
└──────────────────────────────┴─────────────┴───────────┘
20 tutorados en el ciclo · 2 tutores · promedio 10 c/u
```
- **Tutorados = carga** de cada tutor en este ciclo+período (`estudiante_ciclo_periodo`).
- **[+ Asignar docentes]** — **multi-select** con búsqueda: lista docentes
  **activos** aún no asignados a este ciclo+período, mostrando su **carga total
  en el período** (para balancear).
- **🗑 Quitar:** bloqueado si el docente **tiene tutorados** en este ciclo+período
  → "Reasígnalos en Matrículas antes de quitarlo".
- **Dónde vive:** drawer lateral (no pierde el contexto del período).
- **BD:** `docente_ciclo_periodo` (UNIQUE `docente_id`+`ciclo_periodo_id`, n:n;
  quitar = borrar la fila).

> **📋 Temario** se gestiona en su **propia pantalla** (árbol jerárquico) —
> compartida con el rol Docente. Aquí solo se muestra el contador con enlace.
> Ver «Temario» abajo.

### Organización del período › Temario — ⬜ Pendiente

Árbol de temas de tutoría de un **ciclo+período** (`temario`), de **profundidad
libre** (tema → subtema → sub-subtema…). Es **por `ciclo_periodo`**: el temario
de un ciclo en 2026-I es independiente del de 2026-II. **Pantalla compartida**:
el admin llega desde el 📋 de Configuración del período; el Docente, desde su
menú "Temario" (solo edita los ciclos que tutora).

**No se rehace cada período:** al **clonar** un período, el temario se copia
completo (con su jerarquía) → se parte de una copia y se ajusta. De cero solo la
primera vez. La duplicación por período es intencional: preserva el historial
(editar 2026-I no toca 2025-II).
```
← Volver a configuración      Temario — Primer ciclo · 2026-I       [ + Agregar tema ]

⠿ ▾ 1. Adaptación a la vida universitaria           ✏   ➕ subtema   🗑
      ⠿   1.1  Integración social                    ✏   🗑
      ⠿   1.2  Manejo del tiempo                      ✏   🗑
⠿ ▾ 2. Bienestar personal                           ✏   ➕ subtema   🗑
      ⠿   2.1  Salud y hábitos                        ✏   🗑
```
- **Archivos (al codificar):** `pages/admin/temario.html` + `js/temario.js`
  (recibe `?cp=<ciclo_periodo_id>`).
- **Editor de árbol (outline):**
  - **⠿ arrastrar** para reordenar entre hermanos (swap de `orden` en
    transacción) y para **mover a otro padre** (arrastrar un ítem dentro de otro
    lo vuelve subtema).
  - **▾** expandir/colapsar. Numeración jerárquica (1, 1.1, 1.2…) según
    `padre_id` + `orden`.
  - **Por nodo:** ✏ editar texto · ➕ agregar subtema · 🗑 eliminar.
  - **[+ Agregar tema]** crea un tema raíz al final.
- **Eliminar un tema con subtemas:** confirma "se eliminará este tema y sus N
  subtemas" (**cascada**) — la FK `padre_id` no permite subtemas huérfanos.
- **BD:** `temario` (`ciclo_periodo_id`, `padre_id` auto-referencia, `tema`,
  `orden` entre hermanos; sin `activo`/`deleted_at` → quitar = borrar fila).
- **Compartida con Docente:** misma pantalla; el Docente solo accede a los
  `ciclo_periodo` que tutora (regla de acceso).

### Administrador › Organización del período › Matrículas — ⬜ Pendiente

Mete estudiantes a un ciclo+período y les asigna **un** tutor del pool de ese
ciclo. Muy manejable: asignación **individual** y **en lote**. Es la puerta de
los **ingresantes nuevos** (ej. al 1° ciclo); los **continuadores** entran en
masa por "Avanzar estudiantes".
```
Matrículas    Período:[ 2026-I ▾ ●Vigente ]  Ciclo:[ Primer ciclo ▾ ]      [ + Matricular ]
[ 20 Matriculados ]  [ 2 Tutores ]  [ prom. 10 c/u ]
Buscar:[ nombre o código… ]   Tutor:[ Todos ▾ ]   [🔍][✕]
┌────┬──────────────────────┬──────────────┬──────────────────────┬───────────┬──────────────────┐
│ ☐  │ Estudiante           │ Código       │ Tutor asignado       │ Fichas    │ Acciones         │
├────┼──────────────────────┼──────────────┼──────────────────────┼───────────┼──────────────────┤
│ ☑  │ Ana Quispe Mamani    │ 2021-1001    │ Dr. Raúl Quispe   ✎  │ 2/3       │ 🔄 tutor   🗑    │
│ ☑  │ Carlos Huanca Flores │ 2021-1002    │ Mg. Lucía Torres  ✎  │ 0/3       │ 🔄 tutor   🗑    │
└────┴──────────────────────┴──────────────┴──────────────────────┴───────────┴──────────────────┘
[ con seleccionados: Asignar tutor ▾ ]
```
- **Archivos (al codificar):** `pages/admin/matriculas.html` + `js/matriculas.js`.
- **Selectores** Período (default vigente) + Ciclo → definen el `ciclo_periodo`.
- **Cards:** Matriculados · Tutores · promedio de carga.
- **Columnas:** ☐ (selección) · Estudiante · Código · **Tutor asignado** (✎
  cambio rápido) · **Fichas** (llenadas/total) · Acciones (🔄 Cambiar tutor · 🗑 Quitar).
- **[+ Matricular]** (modal):
  - **Estudiantes:** multi-select con búsqueda; candidatos = `estado = activo` y
    **sin matrícula en este período** (regla 1 matrícula/período).
  - **Tutor:** del **pool del ciclo** (`docente_ciclo_periodo`), con su carga
    para balancear.
- **Asignar/Cambiar tutor:** el nuevo tutor debe estar en el pool del ciclo. **En
  lote:** seleccionar filas → "Asignar tutor" (reparto rápido).
- **🗑 Quitar:** bloqueado si el estudiante tiene **fichas llenadas** en este
  `ciclo_periodo` (protege el historial).
- **BD:** `estudiante_ciclo_periodo` (UNIQUE `estudiante`+`ciclo_periodo`;
  `docente_id` ∈ pool del ciclo; 1 matrícula por período vía `periodo` derivado).
- **Toasts:** "Estudiante matriculado", "Tutor actualizado", "Matrícula retirada".

### Administrador › Organización del período › Avanzar estudiantes — ⬜ Pendiente

Operación **masiva** al abrir un período: propone mover cada estudiante al ciclo
siguiente, y tú **revisas y corriges**. **No es un botón ciego** — el sistema no
sabe quién aprobó (no hay notas), así que **propone y tú decides**.
```
Avanzar estudiantes
Origen: [ 2025-II ▾ ]   →   Destino: [ 2026-I ▾ ]           [ Generar propuesta ]

Propuesta: 320   [ Avanza 280 ] [ Repite 30 ] [ Egresa 8 ] [ Excluir 2 ]   [ ⚠ Sin tutor: 5 ]
Filtros:[ Acción ▾ ] [ Tutor ▾ ]   Buscar:[ … ]
┌────┬────────────────┬───────────┬─────────────┬───────────────────┬──────────────┐
│ ☑  │ Estudiante     │ Ciclo act.│ → Destino   │ Tutor destino     │ Acción       │
├────┼────────────────┼───────────┼─────────────┼───────────────────┼──────────────┤
│ ☑  │ Ana Quispe     │ 1° ciclo  │ 2° ciclo    │ Dr. Quispe     ✎  │ [ Avanza ▾ ] │
│ ☑  │ Carlos Huanca  │ 3° ciclo  │ 3° ciclo    │ Mg. Torres     ✎  │ [ Repite ▾ ] │
│ ☑  │ Diana Torres   │ 10° ciclo │ —           │ —                 │ [ Egresa ▾ ] │
│ ☐  │ Luis Vega      │ 2° ciclo  │ 3° ciclo    │ ⚠ elegir tutor    │ [ Avanza ▾ ] │
└────┴────────────────┴───────────┴─────────────┴───────────────────┴──────────────┘
[ con seleccionados: Acción ▾ · Asignar tutor ▾ ]          [ Confirmar (318 marcados) ]
```
- **Archivos (al codificar):** `pages/admin/avanzar-estudiantes.html` + `js/avanzar-estudiantes.js`.
- **Origen / Destino** (períodos) + **[Generar propuesta]**.
- Solo considera estudiantes con `estado = activo` del período origen.
- **Propuesta por estudiante** (editable):
  - Ciclo siguiente (`orden` + 1); mismo tutor si sigue en el pool destino.
  - Último ciclo (máximo `orden`) → propone **Egresa** (sin ciclo destino).
  - Tutor ya no disponible (renunció) → **⚠ elegir tutor** del nuevo pool.
- **Acción por fila:** Avanza / Repite (mismo ciclo) / Egresa / Excluir. Tutor
  editable (✎, del pool destino).
- **Contadores** grandes + **filtro por acción** y **"⚠ sin tutor"** → atiendes
  solo las excepciones (los repetidores, los sin tutor); los fáciles quedan por
  default.
- **En lote:** seleccionar filas → fijar acción o asignar tutor.
- **[Confirmar]** (una transacción, no toca el origen):
  - Avanza / Repite → crea `estudiante_ciclo_periodo` (ciclo destino + tutor).
  - Egresa → `estudiante.estado = egresado` (sin matrícula).
  - Excluir → no hace nada.
- **Validaciones:** sin matrícula previa en el destino; tutor ∈ pool del ciclo destino.
- **BD:** `estudiante_ciclo_periodo` (insert) · `estudiante.estado` (egresar) ·
  `ciclo.orden` (siguiente).
- **Toasts:** "318 estudiantes procesados · 8 egresados".
