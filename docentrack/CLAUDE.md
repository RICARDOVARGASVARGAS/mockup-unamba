# CLAUDE.md — DocenTrack (Registro de Horas Lectivas Docentes)

## Rol
Actúas como diseñador/desarrollador UI/UX senior (HTML, CSS/Tailwind,
JavaScript) y, de forma complementaria, analista de bases de datos: mientras
maquetas cada pantalla también identificas qué entidades, atributos y
reglas necesitará el backend real (ver docs/MODELO-DATOS.md, cuando se
cree). Diseñas dos experiencias muy distintas dentro del mismo proyecto:
- **Kiosko de fichaje**: flujo rápido tipo terminal, mínimos toques,
  máxima claridad, pensado para usarse de pie/sentado en segundos.
- **Panel administrativo**: herramienta de oficina para gestión de datos
  (docentes, cursos, horarios, aulas, asistencia), con más densidad de
  información pero igual de cuidada.
Cuando una decisión tenga alternativas, eliges la más usable y mantenible,
y explicas brevemente por qué.

## Qué es este proyecto
Mockup visual (HTML + Tailwind + JS) de **DocenTrack**, sistema para
digitalizar el registro de horas lectivas de los docentes de la Facultad
de Administración (hoy se hace en un cuaderno físico con firma
manuscrita). Su propósito es validar el diseño y el modelo de datos ANTES
de construir el sistema real (Laravel + React + PostgreSQL).
Este repo es SOLO la maqueta visual: sin backend, sin base de datos real.
Es un proyecto **independiente y autocontenido** dentro del workspace
(ver `../CLAUDE.md`): no comparte componentes, estilos, tokens de color ni
código con `../pagina-web/`.

## Alcance confirmado

- **Cobertura institucional**: solo Facultad de Administración (no toda
  la universidad).
- **Sede**: una sola sede por ahora (mono-sede). No hay selector de sede
  ni el modelo de datos lo contempla todavía.
- **Fases**: fase 1 = PC en mesa de registro (este mockup). Fase 2 =
  tablet por sede con app Flutter (fuera de alcance de este mockup, solo
  referencia).
- **En esta etapa**: solo mockup + modelado de datos, en paralelo. No se
  construye el backend (Laravel) todavía.

## El flujo de fichaje (kiosko)

Un **solo toque de huella por visita** — no dos, no un formulario primero:

1. Pantalla en reposo, esperando huella (estado por defecto del kiosko).
2. Docente coloca el dedo → el sistema identifica 1:N (sin elegir nombre
   de una lista).
3. Identificado, se despliega el formulario: si hay horario cargado para
   ese docente, viene pre-completado (asignatura, ciclo, aula); si no,
   se presentan selects para elegirlos.
4. En ese mismo formulario el docente declara **hora de entrada y hora de
   salida de la clase ya dictada** (no son timestamps en tiempo real —
   el docente suele venir después de dictar la clase), más tema (del
   temario del curso, no texto libre) y número de alumnos (declarado,
   input numérico simple).
5. Guardar. Fin de la interacción — sin segunda huella, sin firma.

Este orden (huella → identifica → recién el formulario) es intencional:
reduce fricción y evita pedirle al docente tocar el lector dos veces en
la misma visita.

### Validación de horario declarado
Si la hora declarada no calza con el horario asignado a ese docente para
ese curso, se marca con una **alerta visual no bloqueante** (ej. badge
"fuera de horario") para que el admin lo revise después — nunca impide
guardar el registro. Motivo: el propio flujo ya asume casos legítimos de
desalineación (reposición de clase, cobertura de otro docente, etc.), así
que bloquear sería forzar "correcciones" de algo que puede ser correcto.

### Registro vs. corrección — regla dura
- **Crear** un registro de asistencia **siempre requiere huella**. No
  existe alta manual sin huella, bajo ninguna circunstancia.
- **Corregir** un dato de un registro ya creado (ej. aula equivocada) sí
  se puede hacer desde el panel admin, pero exige **motivo** y queda con
  **auditoría** (quién corrigió, cuándo, motivo, valor anterior/nuevo).

## Estados del lector (deben estar en el diseño desde el inicio, no como parche)

- Reposo / esperando huella
- Leyendo / procesando
- Identificación exitosa → transición al formulario
- Huella no reconocida (no hay match 1:N)
- Docente no identificado / no enrolado
- Lector desconectado o no detectado por el sistema
- Timeout de captura (se acabó el tiempo sin dedo en el lector)
- Guardado exitoso / error al guardar

## Enrolamiento de huellas
Lo hace un **administrador desde el panel admin**, nunca el propio
docente en el kiosko. El panel admin incluye una pantalla dedicada de
enrolamiento (dentro del módulo Docentes).

## Panel administrativo — alcance CRUD completo
El admin gestiona **todo el catálogo** del que se alimenta el kiosko, de
forma que el docente en el kiosko solo seleccione/confirme, nunca escriba
texto libre extenso:

- **Docentes** — datos + enrolamiento de huella.
- **Cursos** — cada curso tiene su propio **temario** (catálogo de temas)
  que el admin carga; el docente en el kiosko elige el tema de una lista,
  no lo escribe.
- **Ciclos** — nivel curricular del curso (I a X). Catálogo propio.
- **Periodos académicos** — semestre/año (ej. 2026-I, 2026-II). Concepto
  **separado** de "ciclo": el periodo académico define cuándo rige un
  horario/asignación; el ciclo es el nivel curricular del curso.
- **Aulas** — catálogo institucional.
- **Horarios / Asignaciones** — el corazón del sistema: qué docente dicta
  qué curso, en qué ciclo, aula, periodo académico y bloque horario. De
  acá sale el pre-completado del kiosko.
- **Registros de asistencia** — listado/filtros de lo fichado en el
  kiosko, con la alerta visual de "fuera de horario" cuando aplique, y la
  opción de corrección con motivo + auditoría.
- **Reportes** — reporte de horas dictadas por docente/periodo,
  exportable (Excel/PDF); alcance mínimo por ahora, se puede ampliar
  después con comparativos horas programadas vs. dictadas.

### Roles de acceso
Un solo rol, **Administrador**, con acceso total a todo lo anterior
(mockup simple). Login requerido para entrar al panel. Diferenciar roles
(RRHH, Académico, etc.) queda para una fase posterior si se necesita.

## Identidad visual
**No definida por la facultad todavía** — se diseña con libertad visual
(paleta y tipografía propuestas), dejando fácil de reemplazar por marca
institucional más adelante. Mismo patrón de tokens que el resto del
workspace pero con **su propia paleta**, sin compartir valores con
`pagina-web/`:
- `--color-primary` / `--color-accent` / `--color-bg` / `--color-surface`
  / `--color-text` / `--color-text-muted` — mismos ROLES de variable,
  archivo `css/tokens.css` propio de este proyecto.
- Sugerencia inicial: algo que transmita seguridad/tecnología (ej. un
  índigo o teal como primario) distinto del azul institucional de
  `pagina-web/`, para que ambos proyectos no se confundan visualmente
  durante la presentación. Se afina cuando haya feedback.

## Modo claro/oscuro (obligatorio, en todo)
Kiosko **y** panel admin alternables entre claro/oscuro, mismo mecanismo
que `pagina-web/` (variables CSS, un botón alterna `[data-theme]`, estado
en memoria durante la navegación, sin localStorage).

## Modo de interacción — herramienta de mockup (Escritorio / Táctil)
Como fase 1 es PC en mesa de registro pero no se ha decidido si el
monitor será táctil, el kiosko incluye un **toggle "modo de
interacción"** (igual de espíritu que el color-picker: instrumento del
mockup, no producto final) que alterna en vivo entre:
- **Escritorio** — densidad normal, pensado para mouse/teclado.
- **Táctil** — botones grandes, más espaciado, pensado para dedo.
Sirve para decidir con la facultad qué variante usar en el despliegue
real; puede ocultarse para presentar el kiosko limpio, igual que el
picker de colores.

## Reglas de diseño
- **Kiosko-first, no mobile-first**: el kiosko se diseña para su
  dispositivo real (PC de mesa/monitor, con el toggle táctil/escritorio
  de arriba) — no necesita adaptarse a celular. El panel admin sí debe
  responder bien en escritorio y tablet (uso de oficina).
- Nada de texto libre extenso ni firma manuscrita en el kiosko: todo
  select/input mínimo.
- Contraste accesible y foco visible en ambos temas, kiosko y admin.
- Componentes reutilizables y consistentes entre pantallas (tarjetas de
  estado del lector, formularios, tablas del admin).

## Convenciones de código
- Archivos en minúscula con guiones.
- Mismo patrón de inyección de componentes que `pagina-web/`
  (`getBasePath()`, partials en `/components`, sin duplicar HTML).
- Colores solo vía variables CSS de este proyecto — nunca hardcodeados,
  nunca reutilizando los de `pagina-web/`.

## Qué NO hacer
- No implementar backend, base de datos ni lógica de servidor real
  (documentar el modelo de datos en `docs/MODELO-DATOS.md` sí; ejecutarlo
  aquí, no).
- No permitir crear un registro de asistencia sin huella, bajo ningún
  pretexto (ver regla dura arriba).
- No usar campos de texto libre para tema/asignatura/aula — siempre
  catálogo gestionado desde el admin.
- No compartir componentes, tokens de color ni JS con `pagina-web/`.
- No inventar datos institucionales reales (nombres de docentes, cursos)
  — usar placeholders claramente marcados.

## Estructura del repo (propuesta, ajustar al crecer)
- `/docs/ESPECIFICACION.md` → pantallas, estados y módulos (kiosko + admin)
- `/docs/MODELO-DATOS.md` → entidades/atributos para el futuro backend — por crear
- `/components` → header/sidebar admin, tarjetas de estado del lector, etc.
- `/pages/kiosko/` → pantallas del flujo de fichaje
- `/pages/admin/` → panel administrativo (login, docentes, cursos, ciclos,
  periodos, aulas, horarios, registros, reportes)
- `/assets`
- `/css` → `tokens.css` (paleta propia), `base.css`
- `/js` → tema, modo de interacción (táctil/escritorio), simulación de
  estados del lector, inyección de componentes
- `index.html` → pantalla de reposo del kiosko (punto de entrada)

## Estado actual
- ~~`docs/ESPECIFICACION.md`~~ — hecho.
- ~~Kiosko~~ — hecho: reposo, procesando, identificado, formulario (con
  badge "fuera de horario" no bloqueante), confirmación, y los 5 estados
  de error del lector. Con panel oculto "Forzar estado" para la demo y
  toggle Escritorio/Táctil.
- ~~Panel administrativo~~ — hecho: login, dashboard, Docentes (+
  enrolamiento de huella en 3 muestras), Cursos (+ temario), Ciclos,
  Periodos académicos, Aulas, Horarios/Asignaciones, Registros de
  asistencia (+ corrección con motivo y auditoría — nunca creación
  manual sin huella), Reportes, Auditoría, Configuración.
- Botón "Administrador" visible en el topbar del kiosko, enlaza al login.

## Próximos pasos sugeridos
1. `docs/MODELO-DATOS.md` — entidades: docentes, huellas (template,
   nunca imagen), cursos, temario, ciclos, periodos académicos, aulas,
   horarios/asignaciones, registros de asistencia, correcciones/auditoría,
   usuarios admin.
2. Afinar paleta con feedback real de la facultad (hoy es provisional:
   naranja/azul/verde institucionales, ver "Identidad visual" arriba).
