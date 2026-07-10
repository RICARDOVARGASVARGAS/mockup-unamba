# Especificación del Sistema — DocenTrack

Este documento describe todas las pantallas, estados y módulos del sistema.
Es la referencia de **qué construir**. Las decisiones de **cómo trabajar**
(rol, reglas de flujo, alcance) están en `CLAUDE.md`.

## Leyenda

- **[BD]** — Dinámico, va en base de datos (CRUD)
- **[BD-CFG]** — Configuración editable (una sola vez)
- **[EST]** — Estático, fijo en el código
- **[SIS]** — Módulo interno del sistema (no es contenido, es lógica/estado)
- **[EXT]** — Depende de hardware/servicio externo (lector de huella)

> Nota para el mockup: aquí no hay base de datos ni lector real. Las
> marcas indican qué será dinámico o depende de hardware en el sistema
> final, para diseñar cada pantalla pensando en cómo se llenará o
> reaccionará. En el mockup se maquetan con datos de ejemplo y los
> estados del lector se simulan (botones de "forzar estado X" ocultos,
> como el picker de colores).

---

# PARTE 1 — Kiosko de Fichaje

No es un sitio con menú de navegación: es **un flujo lineal de pantallas**
que vuelve siempre al reposo. Un solo toque de huella por visita (ver
`CLAUDE.md` → "El flujo de fichaje").

## 1. Reposo (pantalla por defecto, `index.html`)
- Mensaje principal: "Coloque su dedo en el lector" — [EST]
- Reloj y fecha actual en vivo — [SIS]
- Ilustración/ícono del lector con estado neutro — [EST]
- Toggle tema claro/oscuro — [SIS]
- Toggle modo de interacción (Escritorio/Táctil) — [SIS] — herramienta de
  mockup, ocultable para presentar limpio
- Logo/nombre del sistema (DocenTrack) — [EST]

## 2. Leyendo / procesando — [EXT]
- Animación de "verificando huella…" tras colocar el dedo
- Sin acciones del usuario, transición automática

## 3. Identificado — [BD]
- Confirmación breve: foto + nombre del docente reconocido
- Transición automática (1–2 segundos) hacia el formulario

## 4. Formulario de registro de clase — [BD]
Header de contexto: foto + nombre del docente ya identificado (no se
vuelve a pedir). Campos, todos select/input mínimo:
- Curso/asignatura — select, pre-completado si hay horario cargado — [BD]
- Ciclo — select — [BD]
- Aula — select — [BD]
- Periodo académico — select (auto si el docente dicta en uno solo) — [BD]
- Tema — select, del temario propio del curso elegido (se recarga al
  cambiar de curso) — [BD]
- Número de alumnos — input numérico declarado — [BD]
- Hora de entrada — input hora (declarada, no timestamp real) — [BD]
- Hora de salida — input hora (declarada) — [BD]
- Badge "fuera de horario" — visual, no bloqueante, aparece si la hora
  declarada no calza con el horario asignado — [SIS]
- Acciones: Guardar / Cancelar (vuelve a reposo sin guardar)

## 5. Guardado exitoso — [SIS]
- Confirmación visual + resumen de lo registrado
- Vuelve a reposo automáticamente tras unos segundos

## 6. Estados de error (variantes de la pantalla de lectura/reposo)
Deben diseñarse desde el inicio, no como parche posterior:
- Huella no reconocida (no hay match 1:N) — opción de reintentar — [EXT]
- Docente no identificado / no enrolado — mensaje "contacte a
  administración" — [BD]
- Lector desconectado o no detectado por el sistema — [EXT]
- Timeout de captura (tiempo agotado sin dedo en el lector) — [EXT]
- Error al guardar el registro (ej. sin conexión) — opción de reintentar — [SIS]

---

# PARTE 2 — Panel Administrativo

Ruta base `/admin`. Un solo rol, Administrador, acceso total.

1. **Login** — [SIS]
2. **Dashboard** — registros de hoy, docentes con huella pendiente de
   enrolar, alertas "fuera de horario" pendientes de revisión — [SIS]
3. **Docentes** — [BD]
   - Listado (foto, nombre, código, estado de huella: enrolada / pendiente)
   - Crear / editar docente
   - **Enrolamiento de huella** (pantalla dedicada: captura, confirmación,
     re-enrolar si falla)
4. **Cursos** — [BD]
   - Listado, crear/editar
   - **Temario** del curso como sub-sección (lista de temas que después
     aparecen como select en el kiosko)
5. **Ciclos** — [BD] — catálogo simple (I–X)
6. **Periodos académicos** — [BD] — catálogo (ej. 2026-I, 2026-II),
   concepto separado de ciclo (ver `CLAUDE.md`)
7. **Aulas** — [BD] — catálogo (nombre/código, capacidad)
8. **Horarios / Asignaciones** — [BD] — módulo central: docente + curso +
   ciclo + aula + periodo académico + bloque horario (día, hora inicio,
   hora fin). De aquí sale el pre-completado del kiosko y la validación
   de "fuera de horario"
9. **Registros de asistencia** — [BD]
   - Listado con filtros (docente, curso, fecha, periodo, con/sin alerta)
   - Detalle de un registro
   - Corrección de un dato ya guardado — exige motivo, queda con
     auditoría (quién, cuándo, motivo, valor anterior → nuevo). Nunca
     permite crear un registro nuevo sin huella (ver regla dura en
     `CLAUDE.md`)
10. **Reportes** — [BD] — horas dictadas por docente/periodo, exportable
    (Excel/PDF). Alcance mínimo por ahora
11. **Auditoría** — [SIS] — log de correcciones (quién cambió qué y cuándo)
12. **Configuración / Usuarios admin** — [SIS] — cuentas con acceso al
    panel (aunque hoy solo exista el rol Administrador)

---

# PARTE 3 — Módulos del Sistema (base técnica)

1. Autenticación admin (login/logout) — [SIS]
2. Integración biométrica (servicio local: capturar / enrolar /
   identificar) — [EXT], no se construye en este repo
3. Validación de horario (declarado vs. asignado → badge no bloqueante) — [SIS]
4. Auditoría de correcciones — [SIS]

---

# Funcionalidades Transversales (UX / técnicas)

- Tema claro/oscuro en todo (kiosko y admin)
- Modo de interacción Escritorio/Táctil (solo kiosko, herramienta de mockup)
- Accesibilidad: contraste, foco visible, navegación por teclado (admin)
- Panel admin responsive (escritorio + tablet); el kiosko no necesita
  adaptarse a celular, es un dispositivo fijo
- Estados de error del lector siempre visibles y claros, nunca un error
  genérico

---

# Navegación

**Kiosko**: sin menú tradicional. Flujo lineal: Reposo → Identificación →
Formulario → Confirmación → Reposo. Solo dos controles persistentes:
tema claro/oscuro y modo de interacción.

**Panel admin** (sidebar):
Dashboard · Docentes · Cursos · Ciclos · Periodos académicos · Aulas ·
Horarios · Registros de asistencia · Reportes · Auditoría · Configuración

---

# Conteo

- **Kiosko:** 1 flujo con 6 pantallas/estados (incluye variantes de error)
- **Panel admin:** 12 secciones
- **Dinámico:** prácticamente todo el contenido operativo es autoadministrable
  desde el panel (docentes, cursos, temario, horarios, aulas, registros)

---

# Alcance del Mockup vs Sistema Final

Este mockup maqueta el **flujo completo del kiosko** (incluyendo estados
de error) y el **panel administrativo completo** con datos de ejemplo. La
integración biométrica real (Parte 3.2) y el backend no se construyen
aquí — solo se diseña la interfaz asumiendo que esos datos existen.

**Núcleo sugerido para maquetar primero** (mayor impacto y el que más
decisiones de diseño concentra):
1. Kiosko: Reposo + estados del lector (incluye errores)
2. Kiosko: Formulario de registro + badge "fuera de horario"
3. Kiosko: Confirmación de guardado
4. Admin: Login + Dashboard
5. Admin: Horarios/Asignaciones (el CRUD más complejo, del que depende el
   pre-completado del kiosko)
6. Admin: Registros de asistencia + corrección con auditoría

El resto de catálogos del admin (Docentes, Cursos+Temario, Ciclos,
Periodos académicos, Aulas, Reportes) siguen el mismo patrón visual de
listado + formulario una vez definido ese núcleo.
