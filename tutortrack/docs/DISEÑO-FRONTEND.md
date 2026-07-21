# Diseño Frontend — TutorTrack

**Fuente única del diseño visual del mockup.** Aquí vive *cómo se ve y se
organiza* cada pantalla (menú, layout, columnas, formularios, estados). El
*qué dato/relación* sale siempre de [`BD-BACKEND.md`](./BD-BACKEND.md)
(fuente única de datos) y el *comportamiento del backend* de
[`FUNCIONALIDAD-BACKEND.md`](./FUNCIONALIDAD-BACKEND.md).

> Este proyecto es **solo maqueta** (HTML + Tailwind + JS, sin backend).
> Todo dato es placeholder ficticio. Se construye **una pantalla a la vez**;
> cada sección de este doc se cierra con visto bueno antes de maquetar.
>
> **Datos de prueba (para la demo):** los seeds deben **parecer realistas**
> (nombres, documentos, fechas coherentes) y, sobre todo, **cubrir todos los
> estados posibles** de cada pantalla, para poder mostrarlos en la presentación.
> Ej. en fichas: registros **sin abrir · borrador · enviada · revisada**; en
> personas: activos/inactivos/egresados; con y sin foto; con y sin historial.

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
página; se dispara con el evento `app:toast`
(`{ title, subtitle?, type }` · compat: `{ message }` → título).

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

> **✅ Hecho:** `<app-toast>` acepta `title` + `subtitle?`, duración por tipo
> (4 s / 6 s) y mantiene compatibilidad con `{ message }`.
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
│   └── Plantillas de fichas
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
│   ├── Fichas de mi ciclo
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
| Admin · Fichas | Plantillas de fichas | `ficha` + `ficha_ciclo` + `pregunta` + `opcion_pregunta` |
| Docente · Fichas | Fichas de mi ciclo | `ficha_ciclo_periodo` (clon / cero + `habilitada`) |
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
- [x] Apoderados (sección en form + bloque en ficha + `apoderados-data.js`) — nuevo, delta sobre lo ya hecho

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
- [x] Configuración del período (hub: ciclos + clonar + historial)
- [x] Docentes del ciclo (sub-editor / drawer)
- [x] Temario (árbol por ciclo+período) — compartido con Docente
- [x] Matrículas
- [x] Avanzar estudiantes

**Administrador › Fichas (Módulo 3)**
- [x] Plantillas de fichas — Listado (biblioteca: + ciclos que aplica)
- [x] Plantillas de fichas — Constructor (preguntas, 5 tipos, ciclos que aplica)

**Docente › Fichas (Módulo 3)**
- [x] Fichas de mi ciclo (clonar de plantilla / crear de cero / habilitar)
- [x] Fichas de mis tutorados (matriz + 3 vistas)
- [x] Ver respuestas (observaciones + marcar revisada)

**Estudiante › Fichas (Módulo 3)**
- [x] Mis fichas (lista)
- [x] Llenar ficha (borrador → enviar)

**Alertas y derivación (Módulo 4)**
- [x] Docente · Mis alertas (IA) + detalle (drawer)
- [x] Docente · Derivaciones (crear + lista)
- [x] Receptor · Casos derivados (bandeja + cambiar estado)
- [x] Receptor · Historial de seguimiento
- [x] Admin · Alertas (todas)
- [x] Admin · Derivaciones (todas)

**Dashboards (por rol)**
- [x] Admin · Dashboard
- [x] Docente · Dashboard
- [x] Estudiante · Inicio
- [x] Receptor · Dashboard

**Otras**
- [x] Estudiante · Mi tutor

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
- **Sección 4 · Apoderados** (0..N):
```
┌─ 4 · Apoderados ──────────────────────────────────────────┐
│ [ + Agregar apoderado ]                                    │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ Juan Pérez Quispe · DNI 12345678      [Principal]  ✏ 🗑│ │
│ │ Padre · 987 654 321                                    │ │
│ └───────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```
  - **[+ Agregar apoderado]** abre un modal: primero **buscar por documento**.
    - Si el documento **ya existe** (es apoderado de un hermano) → **reutiliza**:
      muestra sus datos (identidad **solo lectura**) y solo pides **parentesco**
      y **principal** para este estudiante.
    - Si **no existe** → capturas sus datos (nombres, apellidos, celulares,
      email/ocupación/dirección opcionales) + parentesco + principal.
  - **Parentesco:** padre / madre / abuelo(a) / tutor legal / otro.
  - **Principal:** un solo apoderado principal por estudiante (al marcar uno se
    desmarca el anterior).
  - **BD:** `apoderado` (único por documento → reutiliza) + `estudiante_apoderado`
    (`parentesco`, `es_principal`).
- **Sección 5 · Roles:** multi-check, solo roles `activo = 1`, default marcado
  **Estudiante**.
- **BD:** `estudiante.codigo_universitario` (UNIQUE, NOT NULL) · `codigo_orcid`
  (NULL) · resto en `usuario` · roles en `usuario_rol` · apoderados en
  `apoderado` + `estudiante_apoderado`.
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
- **Apoderados:** tarjetas con nombre, parentesco, contacto y badge **Principal**.
  *Bonus:* **"Hermanos en el sistema"** — otros estudiantes que comparten un
  apoderado (enlace a sus fichas), derivado de `estudiante_apoderado` por
  `apoderado_id`. **BD:** `apoderado` + `estudiante_apoderado`.
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

### Administrador › Organización del período › Configuración del período — ✅ Hecho

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

### Organización del período › Temario — ✅ Hecho

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

### Administrador › Organización del período › Matrículas — ✅ Hecho

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

### Administrador › Organización del período › Avanzar estudiantes — ✅ Hecho

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

---

## Fichas (Módulo 3)

Plantillas de fichas configurables → asignación a ciclos+período (clonado) →
llenado por el estudiante → revisión del docente. Empieza por la **plantilla**
(la estructura que todo lo demás consume).

### Administrador › Fichas › Plantillas de fichas — Listado — ✅ Hecho

- **Archivos (al codificar):** `pages/admin/fichas.html` + `js/fichas.js`.
- **Objetivo:** administrar las plantillas de ficha; entrada al **constructor**.
```
Plantillas de fichas                          [ ⟳ Actualizar ]  [ + Nueva plantilla ]

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ 📄 TOTAL          │  │ ✔ ACTIVAS         │  │ ⏸ INACTIVAS       │
│ 6                │  │ 5                │  │ 1                │
└──────────────────┘  └──────────────────┘  └──────────────────┘

Buscar:[ nombre… ]   Tipo:[ Todos ▾ ]   Estado:[ Todos ▾ ]   [🔍][✕]
┌────┬───────────────────────────┬──────────────┬───────────┬───────────┬────────────────────────────┐
│ N° │ Plantilla                 │ Tipo         │ Preguntas │ Estado    │ Acciones                   │
├────┼───────────────────────────┼──────────────┼───────────┼───────────┼────────────────────────────┤
│ 1  │ Ficha diagnóstica inicial │ Diagnóstico  │ 12        │ ● Activa  │ ✏ Editar  🗑  ⋯            │
│    │ Evalúa adaptación…        │              │           │           │                            │
│ 2  │ Seguimiento mensual       │ Seguimiento  │ 8         │ ● Activa  │ ✏ Editar  🗑  ⋯            │
│ 3  │ Encuesta de cierre        │ Encuesta     │ 0 ⚠       │ ○ Inactiva│ ✏ Editar  🗑  ⋯            │
└────┴───────────────────────────┴──────────────┴───────────┴───────────┴────────────────────────────┘
```
> **Es la BIBLIOTECA general** (plantillas del admin). **No se asigna aquí** —
> el **docente** las clona desde su pantalla "Fichas de mi ciclo".
- **Cards (3):** Total · Activas · Inactivas — inmutables, por `ficha.activo`.
- **Barra:** Buscar por nombre · filtro **Tipo** · filtro **Ciclo** (agrupa por
  "para qué ciclos aplica") · filtro **Estado**.
- **Columnas (7):** N° · **Plantilla** (nombre + descripción muted) · **Tipo**
  (badge) · **Ciclos** (chips: 1°, 2°… — para qué ciclos aplica, guía) ·
  **Preguntas** (`0 ⚠` = sin preguntas) · **Estado** (badge) · Acciones.
- **Acciones de fila:**
  | Control | Acción | Nota |
  |---|---|---|
  | ✏ Editar | abre el **constructor** (`fichas-form.html`) | preguntas + ciclos que aplica |
  | 🗑 Eliminar | `<app-modal-confirm>`; **bloqueado si está en uso** como origen de clones → **Desactivar** | usar `activo = 0` |
  | ⋯ | **Duplicar** (clona plantilla + preguntas) · **Auditoría 🕵** · **Activar/Desactivar** | |
- **[+ Nueva plantilla]** → constructor vacío.
- **Desactivar** (`activo = 0`) → **no se puede clonar** para nuevas fichas; las
  copias del docente ya creadas no se afectan.
- **BD:** `ficha` + `ficha_ciclo` (ciclos que aplica) + count de `pregunta`.
  **Auditoría** por fila.
- **Toasts:** "Plantilla creada / actualizada / duplicada / eliminada / desactivada".

### Administrador › Fichas › Plantillas de fichas — Constructor — ✅ Hecho

- **Archivos (al codificar):** `pages/admin/fichas-form.html` + `js/fichas-form.js`.
- **Tipo:** página aparte (rica). Arma la ficha: encabezado + preguntas.

> **`tipo_pregunta` NO es tabla** — son **5 constantes en código** (efecto enum):
> `texto_abierto`, `alternativa_unica`, `respuesta_multiple`, `si_no`, `escala`.
> El admin **no** puede agregar/quitar tipos (cada uno tiene su lógica de
> render propia). Se guarda en `pregunta.tipo_pregunta` (CHECK/enum, no FK).
```
← Volver a plantillas       Nueva plantilla              [ 👁 Vista previa ]  [ Guardar ]

┌─ Encabezado ──────────────────────────────────────────────┐
│ Nombre*        [ Ficha diagnóstica inicial ]              │
│ Tipo de ficha* [ Diagnóstico ▾ ]        Estado [ ● Activa ]│
│ Descripción    [ Evalúa la adaptación del estudiante… ]   │
└───────────────────────────────────────────────────────────┘
┌─ Preguntas (12) ─────────────────────────  [ + Agregar pregunta ] ┐
│ ⠿ 1. ¿Cómo describirías tu adaptación?  [Alt. única] [Personal social] ✏ ⧉ 🗑│
│ ⠿ 2. ¿Has pensado en abandonar?         [Sí/No] [Salud mental]         ✏ ⧉ 🗑│
│ ⠿ 3. Nivel de estrés este mes           [Escala 1–5] [Salud mental]    ✏ ⧉ 🗑│
│    ▼ EDITANDO ────────────────────────────────────────────────────────────── │
│      Enunciado: [ Nivel de estrés este mes ]                                  │
│      Área: [ Salud mental ▾ ]   Tipo: [ Escala ▾ ]                            │
│      Min:[1] Max:[5]  Etiqueta min:[ Nunca ]  Etiqueta max:[ Siempre ]        │
│                                        [ Cancelar ]  [ Guardar pregunta ]     │
└───────────────────────────────────────────────────────────────────────────────┘
```

**1 · Encabezado** → `ficha`: Nombre* · Tipo de ficha* (select `tipo_ficha`) ·
Descripción · **Ciclos que aplica** (multi-select de `ciclo` → `ficha_ciclo`,
guía) · Estado (toggle).

> **El constructor es compartido:** el **admin** lo usa para las **plantillas**
> de la biblioteca; el **docente** lo usa para **su** ficha del ciclo (clonada o
> de cero), donde además aparece el toggle **Habilitar**. Misma pantalla, mismos
> 5 tipos de pregunta.

**2 · Lista de preguntas:** tarjetas colapsables. Cada una: `⠿` arrastrar · orden
· enunciado · badge **tipo** · badge **área** · acciones **✏ editar · ⧉ duplicar
· 🗑 eliminar**. **[+ Agregar pregunta]** añade una tarjeta ya expandida al final.
Reordenar por `orden` con `⠿`.

**3 · Editor por pregunta (inline / acordeón — cambia según el tipo):**
- **Siempre:** Enunciado · **Área** (select `area`) · **Tipo** (los 5).
- **Condicional:**
  | Tipo | Aparece | Validación |
  |------|---------|------------|
  | Alternativa única / Respuesta múltiple | **lista de opciones** (⠿ reordenar · 🗑 · [+ Agregar opción]) | ≥ 2 opciones |
  | Escala | Min · Max · Etiqueta min · Etiqueta max | 1 ≤ min < max ≤ 10 |
  | Texto abierto / Sí-No | nada extra (Sí/No autogenera sus 2 opciones al guardar) | — |

**4 · Vista previa 👁:** modo lectura que pinta la ficha **como la ve el
estudiante** (radios, checkboxes, escala, textarea). No guarda; solo revisa.

**Guardar y reglas:**
- Persiste encabezado + preguntas + opciones → vuelve a la lista. Toast "Plantilla guardada".
- **Editar una plantilla ya asignada:** los cambios afectan **solo asignaciones
  futuras** — las ya asignadas usan su **copia clonada** (`ficha_ciclo_periodo`),
  así que los llenados existentes **no se tocan**. Aviso informativo.
- **BD:** `ficha` · `pregunta` (`tipo_pregunta` enum, `area_id`, `enunciado`,
  `orden`, `escala_min/max`, `etiqueta_min/max`) · `opcion_pregunta`.

**Patrón clave:** un solo editor que **se adapta** al tipo (no pantallas
separadas por tipo). Editor **inline** (no modal) para armar muchas preguntas sin
fricción.

### Docente › Fichas › Fichas de mi ciclo — ✅ Hecho

Cada docente arma **sus** fichas en su ciclo: **clona** de la biblioteca o
**crea de cero**, personaliza y **habilita a su ritmo**. (Reemplaza la vieja
"Asignación a ciclos" del admin — ahora el dueño es el docente.)
```
Fichas de mi ciclo   Período:[ 2026-I ▾ ●Vigente ]  Ciclo:[ Quinto ciclo ▾ ]   [ + Nueva ficha ▾ ]

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ 📄 MIS FICHAS     │  │ ✔ HABILITADAS     │  │ 🎓 ESTUDIANTES    │
│ 4                │  │ 2                │  │ 20               │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌────┬──────────────────────┬─────────────┬───────────┬──────────────┬─────────────────────────┬──────────────────┐
│ N° │ Ficha                │ Tipo        │ Preguntas │ Habilitada   │ Llenado                 │ Acciones         │
├────┼──────────────────────┼─────────────┼───────────┼──────────────┼─────────────────────────┼──────────────────┤
│ 1  │ Diagnóstica inicial  │ Diagnóstico │ 12        │ [ ● Sí  ⇄ ]  │ ●12 env ·3 borr ·5 sin  │ ✏ Editar  👁  🗑 │
│ 2  │ Seguimiento mensual  │ Seguimiento │ 8         │ [ ○ No  ⇄ ]  │ 🔒 aún no habilitada    │ ✏ Editar  👁  🗑 │
└────┴──────────────────────┴─────────────┴───────────┴──────────────┴─────────────────────────┴──────────────────┘
```
- **Archivos (al codificar):** `pages/docente/fichas-ciclo.html` + `js/fichas-ciclo.js`.
- **Selectores** Período + Ciclo (de los que tutora). Muestra **solo SUS** fichas.
- **Cards:** Mis fichas · Habilitadas · Estudiantes del ciclo.
- **[+ Nueva ficha ▾]** — menú con dos opciones:
  - **Clonar de plantilla:** elige de la **biblioteca activa**; se muestra **para
    qué ciclos se sugiere** cada plantilla (guía, no bloquea). Al elegir → clona
    y abre el constructor para personalizar.
  - **Crear de cero:** abre el constructor vacío.
- **Columna Habilitada:** toggle `⇄` — habilita/inhabilita para sus estudiantes.
  Inhabilitar una que ya tiene llenados → **aviso** ("N estudiantes ya empezaron"),
  no bloqueo.
- **✏ Editar** → constructor (su copia, editable) · **👁 Ver** (vista previa) ·
  **🗑 Eliminar** (bloqueado si hay `ficha_llenada`).
- **BD:** `ficha_ciclo_periodo` (`docente_id` = él, `ficha_origen_id`,
  `habilitada`; preguntas propias clonadas); progreso desde `ficha_llenada`.
- **Toasts:** "Ficha creada / habilitada / inhabilitada / eliminada".

### Estudiante › Fichas › Mis fichas — ✅ Hecho

**Mobile-first** (el estudiante llena desde el celular). Muestra las fichas de
su **ciclo+período vigente** con su estado de llenado.
```
Mis fichas · 2026-I · Quinto ciclo              Tutor: Dr. Quispe
┌────────────────────────────────────────────┐
│ Ficha diagnóstica inicial     [Diagnóstico] │
│ 12 preguntas · ● Enviada · 18/03      [ Ver ]│
├────────────────────────────────────────────┤
│ Seguimiento mensual           [Seguimiento] │
│ 8 preguntas · ◐ Borrador 5/8    [ Continuar ]│
├────────────────────────────────────────────┤
│ Encuesta de cierre  · 6 preg · ○ Sin abrir  [ Llenar ]│
├────────────────────────────────────────────┤
│ 🔒 Taller de hábitos · aún no disponible            │
└────────────────────────────────────────────┘
```
- **Archivos (al codificar):** `pages/estudiante/mis-fichas.html` + `js/mis-fichas.js`.
- Muestra las fichas de **su tutor** que estén **habilitadas**; las **no
  habilitadas** aparecen **🔒 bloqueadas** ("aún no disponible") para que sepa que
  vienen más.
- **Estados:** Sin abrir · Borrador (progreso) · Enviada · 🔒 No habilitada.
  Acción: **Llenar / Continuar / Ver**; las bloqueadas no tienen acción.
- **Llenado secuencial:** las fichas se llenan **en orden**; una ficha queda
  **bloqueada hasta que la anterior esté enviada**. Hay **dos bloqueos distintos**
  (mensajes distintos):
  - 🔒 **No habilitada** — el docente aún no la suelta.
  - 🔒 **Completa la anterior** — la ficha previa no está enviada todavía.
  - La **"activa"** = la primera (en orden) que esté habilitada y con todas las
    previas enviadas.
- **No cambia la BD** — es regla de UI/lógica sobre datos existentes (fichas +
  estado). Orden = de creación; *(si a futuro el docente debe reordenarlas, se
  agrega un `orden` a `ficha_ciclo_periodo` — cambio pequeño).*
- **BD:** `ficha_ciclo_periodo` de su `ciclo_periodo` **filtrado por su tutor**
  (`docente_id`); solo `habilitada = 1` se puede llenar; su `ficha_llenada`.

### Estudiante › Fichas › Llenar ficha — ✅ Hecho

```
← Mis fichas    Seguimiento mensual          Guardado ✓
Progreso  5 / 8   ▓▓▓▓▓░░░

1. ¿Cómo describirías tu adaptación?          · Alt. única
   ( ) Muy buena   (•) Buena   ( ) Regular   ( ) Mala
2. ¿Qué te preocupa? (elige varias)           · Múltiple
   [x] Economía   [ ] Salud   [x] Estudios
3. Nivel de estrés este mes                   · Escala
   Nunca  1( ) 2( ) 3(•) 4( ) 5( )  Siempre
4. ¿Has pensado en abandonar?                 · Sí/No
   ( ) Sí   (•) No
5. Cuéntanos cómo te sientes                   · Texto
   [ __________________________________ ]
                      [ Guardar borrador ]   [ Enviar ]
```
- **Archivos (al codificar):** `pages/estudiante/llenar-ficha.html` + `js/llenar-ficha.js`.
- Cada pregunta se **renderiza según su tipo** (radios / checkboxes / escala /
  sí-no / textarea).
- **Autoguardado** como borrador al responder (indicador "Guardado ✓").
- **Enviar** se habilita solo cuando **todas** están respondidas; confirma
  *"una vez enviada no podrás editarla"* → `estado = enviada`, `fecha_enviado`,
  y la **bloquea** (solo lectura). Dispara el análisis de IA (Módulo 4, async).
- **Flujo:** `Sin abrir → [Llenar] → Borrador (autoguarda, idempotente) →
  [Enviar, todas respondidas] → Enviada (inmutable)`.
- **BD:** `ficha_llenada` (estado) + `respuesta` + `respuesta_opcion`.
- **Responsive:** una columna, targets grandes, cómodo en móvil.

### Docente › Fichas › Fichas de mis tutorados — ✅ Hecho

El docente ve cómo van sus tutorados en **sus** fichas, y entra a revisar las
enviadas. Como cada estudiante avanza a su ritmo (6 fichas, uno al día, otro a la
mitad, otro sin empezar), la vista principal es una **matriz**.
```
Fichas de mis tutorados · 2026-I · Quinto ciclo    Ver:[ Matriz ▾ ]   🔴 3 por revisar

                        F1 Diag  F2 Seg  F3 Aut  F4  F5  F6   Progreso
Ana Quispe Mamani         ✓        ●       ●      ●   ◐   ○     4/6
Carlos Huanca Flores      ✓        ✓       ●      ○   ○   ○     3/6
Diana Torres              ●        ◐       ○      ○   ○   ○     1/6
Luis Vega                 ○        ○       ○      ○   ○   ○     0/6  ⚠

Leyenda:  ✓ revisada · ● enviada (por revisar) · ◐ borrador · ○ sin abrir
```
- **Archivos (al codificar):** `pages/docente/fichas-tutorados.html` + `js/fichas-tutorados.js`.
- **Selector de ciclo** (de los que tutora) + indicador **🔴 N por revisar**.
- **3 vistas** (toggle):
  - **Matriz** (default): filas = tutorados, columnas = **las fichas del docente**
    del ciclo, celda = estado. De un vistazo: quién está al día / a medias / sin
    empezar (⚠).
  - **Por ficha:** una ficha a través de todos los tutorados.
  - **Por estudiante:** todas las fichas de un tutorado.
- **Interacción:** clic en celda **● enviada** → **Ver respuestas**. Las ◐/○ **no**
  son clickeables (el docente ve el *estado*, no el contenido del borrador).
- **BD:** cruce de `ficha_ciclo_periodo` del docente (columnas) × sus tutorados en
  `estudiante_ciclo_periodo` (filas) × `ficha_llenada` (estado de cada celda).

### Docente › Fichas › Ver respuestas — ✅ Hecho

```
← Mis tutorados    Diagnóstica inicial                    [ ✓ Marcar revisada ]
Ana Quispe Mamani · 2021-1001 · Quinto ciclo · Enviada 18/03/2026 · ○ Sin revisar

1. ¿Cómo describirías tu adaptación?                     · Personal y social
   Respuesta:  Regular
   💬 Observación del tutor:  [ Conversar en la próxima sesión…            ]
2. ¿Qué te preocupa? (varias)                            · Económico
   Respuesta:  Economía · Estudios
   💬 [ + agregar observación ]
3. Nivel de estrés este mes                              · Salud mental
   Respuesta:  4 / 5   (alto)
   💬 [ + agregar observación ]
```
- **Archivos (al codificar):** `pages/docente/ficha-respuestas.html` + `js/ficha-respuestas.js`.
- **Cabecera:** estudiante + código + ciclo + `fecha_enviado` + badge revisada.
- Cada pregunta: enunciado + área + **respuesta renderizada según su tipo** +
  **observación del tutor** (`observaciones_tutor`) inline con **autoguardado**
  (colapsada como "+ agregar observación" si vacía).
- Respuestas en **solo lectura** (el docente no edita lo que respondió el alumno).
- **[✓ Marcar revisada]** (sticky): solo si `estado = enviada`; marca
  `revisada = 1`. Idempotente.
- **BD:** `ficha_llenada` (`revisada`) + `respuesta` (+ `observaciones_tutor`) +
  `respuesta_opcion`.

> **Bonus (Módulo 4):** aquí se mostrará la **alerta de IA** de esta ficha (nivel
> + área) y el botón **Derivar**. Se conecta al diseñar Módulo 4.

---

## Alertas y derivación (Módulo 4)

Al enviar una ficha, un **job de IA** analiza las respuestas y crea `alerta_ia`
si detecta señales. El **docente** las gestiona, **deriva** a una entidad
(Psicología, Bienestar…), y el **receptor** atiende el caso. Módulo **sensible**:
tono cuidadoso, confidencialidad estricta (el estudiante **nunca** ve sus alertas
ni derivaciones).

### Docente › Alertas y derivación › Mis alertas — ✅ Hecho

- **Archivos (al codificar):** `pages/docente/alertas.html` + `js/alertas.js`.
- **Qué es:** las alertas de IA de **sus tutorados**. Las alertas **no** se crean
  aquí (las genera el job al enviar la ficha); el docente solo las **gestiona**.
```
Mis alertas                                              🔴 5 pendientes

[ Pendientes 5 ] [ Revisadas 3 ] [ Derivadas 2 ] [ Descartadas 1 ]   ← clic = filtro
Filtros: [ Nivel ▾ ] [ Área ▾ ] [ Estado ▾ ]        Buscar:[ estudiante… ]

┌─ 🔴 ALTA · Salud mental ──────────────────────────────── ● Pendiente ┐
│ (foto) Ana Quispe Mamani · 2021-1001                                 │
│ Ficha: Diagnóstica inicial · enviada 18/03/2026                     │
│ "Las respuestas indican estrés severo y señales de… (resumen IA)"   │
│ Entidad sugerida: Psicología                                         │
│                 [ Ver detalle ]  [ Revisar ]  [ Derivar ]  [ Descartar ]│
├──────────────────────────────────────────────────────────────────────┤
│ 🟠 MEDIA · Económico · Carlos Huanca Flores           ● Pendiente     │
│ 🔵 BAJA · Académico · Diana Torres              ✔ Revisada            │
│ 🟣 Salud mental · Luis Vega            ➜ Derivada a Psicología (ver)  │
│ ⚪ Económico · Marco Larico             ✖ Descartada   [ Reactivar ]   │
└──────────────────────────────────────────────────────────────────────┘
```
- **Contadores por estado** (Pendientes / Revisadas / Derivadas / Descartadas) —
  **clicables** = filtro; "🔴 N pendientes" es la cola del docente.
- **Tarjetas** (no tabla — contenido rico): nivel (badge color), estudiante (foto
  + nombre), ficha de origen + fecha, justificación resumida, entidad sugerida,
  estado.
- **Color por nivel, sobrio:** Alta = rojo · Media = ámbar · Baja = azul. Orden
  por **nivel + fecha** (lo urgente arriba), sin alarmismo.
- **Filtros:** Nivel · Área · Estado · buscar por estudiante.

**Detalle (drawer lateral — no pierde la lista):**
```
┌─ Detalle de alerta ─────────────────────────── [✕] ┐
│ 🔴 ALTA · Salud mental                             │
│ Ana Quispe Mamani · 2021-1001 · Quinto ciclo       │
│ Origen: Ficha diagnóstica inicial · enviada 18/03  │
│                                                    │
│ Justificación de la IA                             │
│ "En las preguntas 3 y 5 reporta estrés alto y…"    │
│                                                    │
│ Entidad sugerida: Psicología   ·   Estado: Pendiente│
│ [ 📄 Ver la ficha llenada ]                        │
│ [ Revisar ]  [ ➜ Derivar a Psicología ]  [ Descartar ]│
└────────────────────────────────────────────────────┘
```
- **Acciones sensibles al estado:**
  - `Pendiente` → Revisar · Derivar · Descartar.
  - `Revisada` → Derivar · Descartar.
  - `Derivada` → solo Ver (no se descarta una ya derivada).
  - `Descartada` → Ver · **Reactivar** (vuelve a `revisada` para poder derivar —
    deshace un descarte por error; conserva la justificación de la IA).
- **Derivar** pre-carga la derivación con estudiante + área + **entidad sugerida**
  + enlaza `alerta_ia_id` (→ pantalla Derivaciones).
- **Ver la ficha llenada** → las respuestas que dispararon la alerta (Módulo 3).
- **Estado vacío amable:** "No tienes alertas pendientes 🎉".

**Dominio / BD:**
- **Confidencialidad:** el docente solo ve alertas de **sus** tutorados; el
  estudiante **nunca** ve las suyas.
- **BD:** `alerta_ia` (`nivel_alerta`, `area_id`, `justificacion`,
  `entidad_receptora_sugerida_id`, `estado`, `docente_id`, `ficha_llenada_id`).
  El **estudiante** se obtiene por join `alerta_ia → ficha_llenada.estudiante_id`
  (no hay `estudiante_id` directo). Una ficha puede generar **varias** alertas
  (UNIQUE por `ficha_llenada_id` + `area_id`).
- **Acciones →** `PATCH /mis-alertas/{id}/revisar` · `/descartar` · **`/reactivar`**;
  Derivar → `POST /derivaciones`. *(Reactivar y derivar-manual: sin cambio de BD.)*

### Docente › Alertas y derivación › Derivaciones — ✅ Hecho

El docente **crea** derivaciones (desde una alerta o manual) y **sigue** su
avance. **Crea y observa** — el que **mueve el estado** es el receptor (otra
pantalla). El **estudiante nunca** ve sus derivaciones.

- **Archivos (al codificar):** `pages/docente/derivaciones.html` + `js/derivaciones.js`.

**Crear derivación (modal):**
```
Nueva derivación
Estudiante*   Ana Quispe Mamani · 2021-1001   (precargado si viene de alerta;
                                               manual → elegir de sus tutorados)
Entidad*      [ Psicología ▾ ]                (sugerida si viene de alerta)
Alerta origen 🔴 ALTA · Salud mental · 18/03  [enlazada]   (manual: —)
Motivo*       [ Describe por qué derivas…                 ]
                                   [ Cancelar ]  [ Derivar ]
```
- **Estudiante:** precargado desde "Mis alertas"; en manual, de **sus tutorados**.
- **Entidad:** solo **activas**; precarga la **sugerida** de la alerta.
- **Alerta de origen:** enlaza `alerta_ia_id` (en manual queda vacía — permitido).
- **Motivo:** obligatorio.
- **Al derivar:** nace en el **primer estado activo** de la entidad (ej. "Derivado");
  si vino de alerta, esa alerta pasa a `derivada`.
- **BD:** `POST /derivaciones` → `derivacion` (`estudiante_id`, `docente_id`,
  `entidad_receptora_id`, `alerta_ia_id?`, `tipo_estado_derivacion_id`, `motivo`).

**Mis derivaciones (lista + seguimiento):**
```
Mis derivaciones                                   [ + Nueva derivación ]
Filtros: [ Entidad ▾ ] [ Estado ▾ ]     Buscar:[ estudiante… ]
┌────┬──────────────────────┬─────────────┬────────────────────┬────────────┬──────────┐
│ N° │ Estudiante           │ Entidad     │ Estado actual      │ Creada     │ Acciones │
│ 1  │ Ana Quispe Mamani    │ Psicología  │ ● En evaluación    │ 18/03/2026 │ 👁 Ver   │
│ 2  │ Diana Torres         │ Psicología  │ ✔ Resuelto         │ 02/03/2026 │ 👁 Ver   │
└────┴──────────────────────┴─────────────┴────────────────────┴────────────┴──────────┘
```
- Lista **solo sus** derivaciones. **Estado actual = solo lectura** (lo mueve el receptor).

**Ver derivación (detalle) — con línea de tiempo:**
```
← Mis derivaciones   Ana Quispe Mamani → Psicología    Estado: ● En evaluación
Motivo: "Señales de estrés severo detectadas en la ficha diagnóstica…"
Alerta de origen: 🔴 ALTA · Salud mental  [ ver alerta ]   ·   [ 📄 ver ficha ]

Línea de tiempo:
  ● Derivado              18/03 14:20 · Dr. Quispe (docente)
  ● En evaluación psic.   19/03 09:10 · Rosa Medina (Psicología)
  ○ En terapia · ○ Resuelto · ○ Cerrado
```
- **Timeline** de estados: recorridos (quién/cuándo, desde `auditoria`) + los que
  faltan del pipeline de la entidad. Enlace a la **alerta** y la **ficha** de origen.

**Interacción / dominio:**
- **Flujo continuo:** "Derivar" en Mis alertas abre el modal **precargado** (cero re-tipeo).
- **El docente sigue, no gestiona:** ve avanzar el estado en el timeline.
- **Confidencialidad:** solo sus derivaciones; el estudiante nunca las ve.
- **BD:** `GET /derivaciones` (su `docente_id`), `GET /derivaciones/{id}`; timeline desde `auditoria`.

**Compartir con el estudiante (visibilidad):** en el **detalle** de la derivación
(tanto aquí como en "Atender" del receptor) hay un toggle **"Compartir con el
estudiante"** (`visible_estudiante`, default **off**). Al activarlo, el profesional
escribe un **mensaje humano** (`mensaje_estudiante`, ej. "Tu tutor te sugiere una
cita con Bienestar"). El estudiante lo verá en su Inicio (ver "Estudiante ›
Inicio · tarjeta de seguimiento"), **saneado** — nunca el `motivo`, la
justificación de la IA ni el estado interno.
```
Detalle de derivación · Ana Quispe → Psicología
  … motivo, timeline …
  ─────────────────────────────────────────────
  Compartir con el estudiante   [ ○ off / ● on ]
  Mensaje para el estudiante: [ Te sugerimos una cita con… ]  [ Guardar ]
```
> **Ética:** off por defecto; **lo activa el profesional** cuando corresponde
> (no automático). Alertas: **nunca** visibles. Validar el tono con
> psicólogos/facultad al usarlo.

### Receptor › Casos › Casos derivados — ✅ Hecho

El receptor (Psicología/Bienestar) ve las derivaciones **de su entidad** y las
**trabaja** por el pipeline (es quien **mueve los estados**). Vista principal:
**kanban** (pipeline visible); alternativa: lista.

- **Archivos (al codificar):** `pages/receptor/casos.html` + `js/casos.js`.
```
Casos derivados · Psicología        [ Kanban | Lista ]        🔴 5 nuevos    Buscar:[…]

┌ Derivado (5) ──┐ ┌ En evaluación (3)┐ ┌ En terapia (2) ┐ ┌ Resuelto (8) ┐ ┌ Cerrado ┐
│ Ana Quispe   🔴│ │ Carlos Huanca    │ │ Diana Torres   │ │ …            │ │ …       │
│ Dr. Quispe     │ │ Mg. Torres       │ │                │ │              │ │         │
│ 18/03  [Atender]│ │ 15/03  [Atender] │ │                │ │              │ │         │
└────────────────┘ └──────────────────┘ └────────────────┘ └──────────────┘ └─────────┘
        ↕ arrastrar una tarjeta a otra columna = cambiar estado (pide nota)
```
- **Columnas = pipeline de su entidad** (`tipo_estado_derivacion`, en orden) +
  contador por columna. **🔴 nuevos** = casos en el primer estado, aún sin abrir.
- **Arrastrar** tarjeta a otra columna = **cambiar estado** (mini-prompt de nota).
  Sin drag: botón **Atender** → detalle.

**Detalle / Atender (drawer):**
```
┌─ Caso · Ana Quispe Mamani ──────────────────────── [✕] ┐
│ Derivada por Dr. Quispe · 18/03/2026                   │
│ Motivo: "Señales de estrés severo detectadas en…"      │
│ Alerta: 🔴 ALTA · Salud mental   ·   📄 ver ficha       │
│ Estado actual:  ● Derivado                             │
│ Cambiar a:  [ En evaluación ▾ ]   Nota: [ … ]  [ Guardar ]│
│ Línea de tiempo (auditoría):                           │
│   ● Derivado       18/03 · Dr. Quispe                  │
│   ● En evaluación  19/03 · Rosa Medina                 │
└────────────────────────────────────────────────────────┘
```

**Interacción / dominio:**
- **Solo su entidad:** nunca ve casos de otra (`receptor.entidad_receptora_id`).
- **Estado válido:** el nuevo estado debe **pertenecer a su entidad** y estar
  **activo** (del pipeline); no puede poner uno de otra entidad.
- **Nota** por cambio (sobreescribe la anterior); cada cambio queda en
  **`auditoria`** → alimenta el timeline y el "Historial de seguimiento".
- **Vista Lista** (alternativa): estudiante · docente · estado · fecha · Atender.
- **BD:** `GET /derivaciones` (filtrado a su entidad) · `PATCH /derivaciones/{id}/estado`.

### Receptor › Casos › Historial de seguimiento — ✅ Hecho

**Registro cronológico** de todo lo que pasó en los casos de su entidad — un
*activity log* de **solo lectura** alimentado por `auditoria`. Complementa al
kanban (estado actual) y al timeline por-caso: aquí se ven **todos los
movimientos juntos**, buscables.

- **Archivos (al codificar):** `pages/receptor/historial.html` + `js/historial.js`.
```
Historial de seguimiento · Psicología
Filtros: [ Estudiante ▾ ] [ Estado ▾ ] [ Fecha ▾ ]        Buscar:[…]
┌──────────────────────────────────────────────────────────────┐
│ 19/03 09:10 · Rosa Medina                                    │
│   Ana Quispe Mamani:  Derivado → En evaluación psicológica   │
│   Nota: "Se agenda primera cita para el 22/03"               │
├──────────────────────────────────────────────────────────────┤
│ 18/03 14:20 · Dr. Quispe (docente)                           │
│   Ana Quispe Mamani:  creó la derivación → Derivado          │
├──────────────────────────────────────────────────────────────┤
│ 17/03 11:00 · Rosa Medina                                    │
│   Carlos Huanca Flores:  En evaluación → En terapia          │
└──────────────────────────────────────────────────────────────┘
```
- **Cronológico** (reciente primero), solo lectura. Cada entrada: fecha·hora ·
  **quién** · **estudiante** (caso) · **de → a** estado · **nota**.
- **Filtros:** estudiante · estado · rango de fecha · buscar.
- **Solo su entidad** (`receptor.entidad_receptora_id`).
- **Reutiliza** el patrón visual de `app-modal-historial` (quién/cuándo/qué
  cambió), pero como **pantalla completa filtrable**, enfocada a derivaciones.
- **BD:** `auditoria` filtrando cambios de `derivacion` de su entidad.

> **Kanban** = dónde está cada caso · **Timeline del caso** = historia de uno ·
> **Historial** = qué pasó en toda la entidad en el tiempo.

### Administrador › Alertas y derivación › Alertas — ✅ Hecho

**Supervisión** de todas las alertas (sin filtro por docente). **Solo lectura**:
el admin observa; revisar/descartar/derivar es del docente.
```
Alertas (supervisión)          [ Pend. 12 ][ Rev. 8 ][ Deriv. 5 ][ Descart. 3 ]
Filtros: [ Docente ▾ ][ Nivel ▾ ][ Área ▾ ][ Estado ▾ ][ Ciclo ▾ ][ Fecha ▾ ]  Buscar:[…]
┌ 🔴 ALTA · Salud mental · Ana Quispe · tutor: Dr. Quispe · Pendiente   [ Ver ] ┐
│ 🟠 MEDIA · Económico · Carlos Huanca · tutor: Mg. Torres · Derivada    [ Ver ] │
└──────────────────────────────────────────────────────────────────────────────┘
```
- **Archivos (al codificar):** `pages/admin/alertas.html` + `js/alertas.js`.
- Misma tarjeta/drawer que "Mis alertas" del docente, pero **sin acciones de
  gestión** (solo Ver) y con **filtros ricos** (docente, estudiante, estado,
  nivel, área, ciclo, fecha) para reportes.
- **BD:** `GET /alertas` (admin — sin restricción por docente).

### Administrador › Alertas y derivación › Derivaciones — ✅ Hecho

**Supervisión** de todas las derivaciones (cualquier entidad/docente). **Solo
lectura** (no mueve estados — eso es del receptor).
```
Derivaciones (supervisión)
Filtros: [ Entidad ▾ ][ Docente ▾ ][ Estado ▾ ][ Fecha ▾ ]     Buscar:[…]
┌────┬──────────────────┬─────────────┬───────────┬──────────────────┬────────────┬──────┐
│ N° │ Estudiante       │ Entidad     │ Docente   │ Estado actual    │ Creada     │ 👁   │
│ 1  │ Ana Quispe M.    │ Psicología  │ Dr. Quispe│ ● En evaluación  │ 18/03/2026 │ Ver  │
└────┴──────────────────┴─────────────┴───────────┴──────────────────┴────────────┴──────┘
```
- **Archivos (al codificar):** `pages/admin/derivaciones.html` + `js/derivaciones.js`.
- Ve **todas**; filtros: entidad, docente, estudiante, estado, fecha. **Ver** →
  detalle con **timeline** (mismo que docente/receptor), solo lectura.
- **BD:** `GET /derivaciones` (admin — sin filtro) · `GET /derivaciones/{id}`.

---

## Dashboards (por rol)

Cada dashboard = **KPIs accionables + la cola de trabajo + un bloque de
"atención"** (sin tutor / por revisar / estancados). Reutilizan cards y listas
existentes.

### Administrador › Dashboard — ✅ Hecho
- **Archivos:** `pages/admin/dashboard.html` + `js/dashboard-admin.js`.
```
Dashboard · Administrador                          Período: 2026-I ●Vigente
┌ 🎓 320 ┐ ┌ 👥 24 ┐ ┌ 🔴 12 ┐ ┌ ➜ 8 ┐
│Matricul.│ │Docentes│ │Alertas │ │Deriv.  │
└─────────┘ └activos ┘ └pend.   ┘ └abiertas┘
┌ Alertas por atender ────┐ ┌ Derivaciones por entidad ─┐
│ 🔴 Alta 3 · 🟠 Media 6  │ │ Psicología 5 · Bienestar 2│
│ · 🔵 Baja 3             │ │ · Serv. médicos 1         │
┌ Avance de fichas ───────┐ ┌ Cobertura de tutoría ─────┐
│ ▓▓▓▓▓▓░░ 44/60 · 73%    │ │ 315/320 con tutor · ⚠ 5 sin│
```
- **KPIs:** matriculados · docentes activos · **alertas pendientes** · derivaciones abiertas.
- **Bloques:** alertas por nivel · derivaciones por entidad · % fichas enviadas ·
  **cobertura** (estudiantes sin tutor = ⚠).
- **BD:** conteos sobre `estudiante_ciclo_periodo`, `docente`, `alerta_ia`,
  `derivacion`, `ficha_llenada` del período vigente.

### Docente-Tutor › Dashboard — ✅ Hecho
- **Archivos:** `pages/docente/dashboard.html` + `js/dashboard-docente.js`.
```
Dashboard · Docente-Tutor
┌ 👥 20 ┐ ┌ 📄 3 ┐ ┌ 🔴 2 ┐ ┌ ➜ 1 ┐
│Tutorad.│ │por rev.│ │Alertas │ │Deriv.  │
┌ Por revisar ────────────┐ ┌ Alertas recientes (Altas 1°)┐
│ Ana · Diagnóstica       │ │ 🔴 Ana · Salud mental       │
│ Carlos · Seguimiento    │ │ 🟠 Carlos · Económico       │
│        [ ir a revisar ] │ │           [ ver alertas ]   │
┌ Avance de mis tutorados ─────────────────────────────────┐
│ ▓▓▓▓▓░░ 14/20 al día · 4 a medias · 2 sin empezar        │
```
- **KPIs:** mis tutorados · **fichas por revisar** · alertas pendientes · derivaciones.
- **Bloques:** cola de revisión · alertas recientes (Altas primero) · avance de tutorados.
- **BD:** filtrado a su `docente_id` (`estudiante_ciclo_periodo`, `ficha_llenada`,
  `alerta_ia`, `derivacion`).

### Estudiante › Inicio — ✅ Hecho
- **Archivos:** `pages/estudiante/dashboard.html` + `js/dashboard-estudiante.js`.
- **Tono cálido y cuidado** (módulo sensible). Mobile-first.
```
Hola, Ana 👋                                    Quinto ciclo · 2026-I
┌ Tu próxima ficha ───────────────────────────────┐
│ Seguimiento mensual · 8 preguntas   [ Continuar ]│
└──────────────────────────────────────────────────┘
┌ Tu progreso ──────────┐ ┌ Tu tutor ───────────────┐
│ ▓▓▓░░ 2/5 completadas │ │ Dr. Raúl Quispe Mamani  │
└───────────────────────┘ │ r.quispe@unamba.edu.pe  │
```
- **Foco:** su **próxima ficha** (la activa) + progreso + **su tutor**.
- **Alertas/derivaciones ocultas** — con **una excepción**: si el profesional
  marcó una derivación como visible, aparece la **tarjeta de seguimiento** (ver
  abajo). Tono humano, sin métricas frías.
- **BD:** su `ficha_ciclo_periodo` habilitada/activa + `ficha_llenada` + su tutor
  (`estudiante_ciclo_periodo.docente_id`).

**Tarjeta de seguimiento (solo si hay derivación con `visible_estudiante = 1`):**
```
┌ Un mensaje de tu tutoría 💛 ────────────────────┐
│ Te sugerimos una cita con Bienestar universitario│
│ para acompañarte mejor.                          │
│                              [ Cómo agendar → ]  │
└──────────────────────────────────────────────────┘
```
- Muestra **solo** `entidad_receptora.nombre` + `mensaje_estudiante` (o un texto
  genérico) + cómo contactar. **Nunca** el `motivo`, la justificación de la IA ni
  el estado interno del caso. Tono de **cuidado**, no clínico.
- Si el estudiante tiene varias visibles, se apilan; si no hay ninguna, la
  tarjeta **no aparece**.
- **BD:** `GET /mi-seguimiento` (derivaciones propias con `visible_estudiante = 1`,
  saneadas).

### Receptor / Psicología › Dashboard — ✅ Hecho
- **Archivos:** `pages/receptor/dashboard.html` + `js/dashboard-receptor.js`.
```
Dashboard · Psicología
┌ 🔴 5 ┐ ┌ ⏳ 3 ┐ ┌ ✔ 8 ┐ ┌ 📁 16 ┐
│Nuevos │ │En proc.│ │Resuelt.│ │Activos │
│       │ │        │ │(mes)   │ │total   │
┌ Nuevos por atender ─────┐ ┌ ⚠ Casos estancados ───────┐
│ Ana · Dr. Quispe        │ │ Carlos H. · 12 días sin    │
│ Luis · Mg. Torres       │ │   movimiento   [ revisar ] │
│          [ ir a casos ] │ └────────────────────────────┘
```
- **KPIs:** nuevos · en proceso · resueltos (mes) · activos totales.
- **Bloque estrella:** ⚠ **casos estancados** (mucho tiempo sin cambio de estado)
  — para que no se le escape ninguno.
- **BD:** `derivacion` de su entidad, por `tipo_estado_derivacion`; "estancados"
  se deriva del último cambio en `auditoria`.

---

## Estudiante › Mi tutor — ✅ Hecho

Pantalla pequeña y **cálida**: el estudiante ve **quién es su tutor** y cómo
contactarlo. Baja la barrera para que se acerque (módulo sensible). Mobile-first.
- **Archivos (al codificar):** `pages/estudiante/tutor.html` + `js/tutor.js`.
```
Mi tutor · 2026-I · Quinto ciclo
┌──────────────────────────────────────────────┐
│  ┌──────┐   Dr. Raúl Quispe Mamani            │
│  │ foto │   Especialidad: Marketing           │
│  │ 88px │   📧 r.quispe@unamba.edu.pe          │
│  └──────┘   📱 987 654 321                     │
└──────────────────────────────────────────────┘
┌ Sobre la tutoría ─────────────────────────────┐
│ Tu tutor te acompaña en tu vida universitaria │
│ — no solo académica. Escríbele cuando lo      │
│ necesites.                                    │
└───────────────────────────────────────────────┘
```
- **Muestra** el tutor del período/ciclo vigente: foto, nombre + grado,
  **especialidad**, correo y celular (si tiene) + texto de apoyo breve.
- **Borde:** si no tiene tutor asignado → "Aún no tienes un tutor asignado;
  comunícate con coordinación."
- **BD:** `estudiante_ciclo_periodo.docente_id` (matrícula vigente) → `docente` +
  `usuario` + `grado_academico` + `especialidad`.
