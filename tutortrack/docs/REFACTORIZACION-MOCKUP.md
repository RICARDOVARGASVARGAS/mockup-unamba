# Plan de refactorización — Mockup TutorTrack

Documento de trabajo para planificar los cambios funcionales acordados
antes de ejecutarlos en el código. Cada sección describe **qué cambia,
por qué y cuál es el estado de ejecución**.

> Este archivo NO reemplaza a `ESPECIFICACION.md` ni a `BD-BACKEND.md`.
> Es exclusivamente la hoja de ruta de la refactorización del mockup.

---

## Cambio 1 — Nueva estructura del menú (sidebar)

**Estado: acordado — pendiente de ejecutar**

### Problema
El menú actual tiene errores de agrupación y ítems que no corresponden
al modelo de datos:
- `Tipos de pregunta` existe como ítem de menú pero no hay tabla en BD
  (los 5 tipos son constantes fijas en código).
- `Tipos de estado de derivación` aparece como catálogo global, pero los
  estados son **por entidad receptora** — deben gestionarse desde dentro
  de cada entidad, no en un menú propio.
- `Usuarios` y `Roles y permisos` estaban dentro del grupo `Catálogos`
  siendo gestión de acceso, no catálogos.
- `Docentes` y `Estudiantes` estaban dentro de `Gestión por periodo`
  siendo perfiles de usuario, no configuración de período.
- `Historial de seguimiento` en Receptor no tiene equivalente en BD
  (la trazabilidad está cubierta por `auditoria` + `Casos derivados`).
- El grupo `Gestión por periodo` no comunicaba que ahí vive la
  asignación docente↔ciclo y estudiante↔docente.
- El estudiante no tenía acceso a sus fichas de períodos anteriores.
- Path incorrecto: `fichas-asignacion.html` → debe ser
  `fichas-ciclo-periodo.html`.

### Nueva estructura acordada

```
Administrador
├── Dashboard
├── Usuarios y acceso
│   ├── Docentes
│   ├── Estudiantes
│   ├── Usuarios
│   └── Roles y permisos
├── Catálogos
│   ├── Ciclos
│   ├── Periodos académicos
│   ├── Grados académicos
│   ├── Especialidades
│   ├── Tipos de documento
│   ├── Áreas
│   ├── Tipos de ficha
│   └── Entidades receptoras   ← estados de derivación se gestionan aquí
├── Organización del período
│   ├── Gestión del período
│   ├── Matrículas
│   └── Avanzar estudiantes
├── Fichas
│   ├── Plantillas de fichas
│   └── Asignación a ciclos
└── Alertas y derivación
    ├── Alertas IA
    └── Derivaciones

Docente-Tutor
├── Dashboard
├── Tutoría
│   ├── Mis tutorados
│   └── Temario
├── Fichas
│   └── Fichas de mis tutorados
└── Alertas y derivación
    ├── Mis alertas
    └── Mis derivaciones

Estudiante
├── Inicio
└── Mi tutoría
    ├── Mis fichas              ← período activo: llenar y ver lo enviado
    ├── Historial de fichas     ← períodos anteriores: solo lectura propia
    └── Mi tutor

Receptor / Psicología
├── Dashboard
└── Casos
    └── Casos derivados
```

### Archivos a modificar
- `components/app-sidebar.js` — reestructurar `NAV_SECTIONS`
- Agregar página `pages/estudiante/historial-fichas.html`
- Corregir path `fichas-asignacion.html` → `fichas-ciclo-periodo.html`
  (verificar si el archivo ya existe con ese nombre)

---

---

## Cambio 2 — Rediseño pantalla Docentes (`admin/docentes.html`)

**Estado: acordado — pendiente de ejecutar**

### Tabla — columnas acordadas

| Col | Contenido |
|-----|-----------|
| # | Nº de orden en la página actual |
| Avatar | Foto circular o iniciales |
| Nombre | Título abreviado + nombres + apellidos (ej. "Dr. Raúl Quispe Mamani") — el título viene de `grado_academico` |
| Documento | Tipo + número en una sola columna (ej. "DNI · 45231890") |
| Especialidad | Nombre de la especialidad |
| Contacto | Correo institucional arriba · teléfono abajo |
| Estado | Badge ● Activo / ○ Inactivo |
| Acciones | ✏️ Editar · 🔑 Restablecer contraseña · 🕵️ Auditoría · 🗑️ Desactivar |

**Regla global:** el botón 🕵️ de auditoría se aplica en **todas** las tablas del sistema.

**Buscador:** campo de texto — busca por nombre, apellido o DNI.
**Filtros:** Especialidad (select) · Estado (select) · 🧹 limpiar.

### Formulario — página aparte (`admin/docentes-form.html`)

Aplica tanto para Registrar como para Editar.

**Sección Datos personales:** Nombres · Apellidos · Tipo de documento (select) · Nº documento · Sexo (M/F/N) · Fecha de nacimiento · Teléfono.

**Sección Datos de acceso:** Correo institucional *(login)* · Correo personal *(opcional)*.

**Sección Perfil docente:** Grado académico (select) · Especialidad (select) · Código ORCID *(opcional)*.

**Sección Estado:** Activo / Inactivo.

| Diferencia | Registrar | Editar |
|------------|-----------|--------|
| Contraseña | Se genera automáticamente (= nº documento) | No aparece — usa modal 🔑 |
| Correo institucional | Editable | Editable con advertencia |
| Estado | Activo por defecto | Editable |

### Modal — Restablecer contraseña (🔑)
Muestra nombre del docente · confirma acción · nueva contraseña = nº documento · botón confirmar.

### Modal — Desactivar (🗑️)
Muestra nombre + DNI · advierte si tiene tutorados activos en el período vigente · ejecuta soft delete (nunca hard delete).

---

## Cambio 3 — (pendiente de definir)

> Los siguientes cambios se irán documentando aquí a medida que se
> acuerden en la sesión de refactorización.
