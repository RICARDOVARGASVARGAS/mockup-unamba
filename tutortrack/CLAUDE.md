# CLAUDE.md — TutorTrack (Módulo de Tutoría)

## Rol
Actúas como diseñador/desarrollador UI/UX senior (HTML, CSS/Tailwind,
JavaScript) y, de forma complementaria, analista de bases de datos:
mientras maquetas cada pantalla también identificas qué entidades,
atributos y reglas necesitará el backend real (ver
`docs/MODELO-DATOS.md`, cuando se cree). Cuando una decisión tenga
alternativas, eliges la más usable y mantenible, y explicas brevemente
por qué.

## Qué es este proyecto
Mockup visual (HTML + Tailwind + JS) de **TutorTrack**, sistema para
digitalizar el proceso de **tutoría** de la Facultad de Administración:
el acompañamiento que un docente-tutor da a sus estudiantes asignados
(tutorados) en un ámbito **personal, no académico** (bienestar,
adaptación a la vida universitaria, dificultades personales), a
diferencia de una asesoría de curso.
Este repo es SOLO la maqueta visual: sin backend, sin base de datos
real. Es un proyecto **independiente y autocontenido** dentro del
workspace (ver `../CLAUDE.md`): no comparte componentes, estilos,
tokens de color ni código con `../pagina-web/` ni `../docentrack/`.

## Problema que resuelve (contexto actual)
Hoy el proceso es **100% manual y en papel**:
- A cada docente se le asignan **n tutorados** (estudiantes) a su cargo.
- El estudiante llena un **formulario físico** con preguntas sobre su
  situación (cómo le va en la universidad, molestias, dificultades).
- El docente debería leer esas respuestas y, si detecta señales de
  alerta (inclinación a abandonar la universidad, problemas como
  consumo de drogas, alcoholismo u otros), **derivar** al estudiante a
  la entidad correspondiente (psicología, servicios médicos, etc.).

**Por qué falla hoy**: todo es manual, sin orden ni sistematización;
los docentes no tienen tiempo de leer los formularios en papel, así
que muchas señales de alerta no se detectan ni se derivan a tiempo.

Nota aparte mencionada por el usuario: en paralelo se va a actualizar
la malla curricular / forma en que se dictan las clases — impacto en
este módulo aún **por definir** (posible relación con qué
docente-tutor corresponde a qué estudiante por ciclo/carrera).

## Alcance — a definir en partes siguientes
Esto se irá completando por partes en la conversación. Pendiente de
precisar:
- Roles de acceso (docente-tutor, estudiante-tutorado, coordinador de
  tutoría, psicología/entidad receptora, admin) y qué ve/hace cada uno.
- Estructura y contenido exacto del formulario (preguntas, frecuencia
  de llenado, quién lo dispara).
- Cómo se detecta/marca una "señal de alerta" (¿lectura manual del
  docente, reglas automáticas sobre respuestas, ambas?).
- Flujo de derivación: a qué entidades se deriva, qué información viaja,
  quién hace seguimiento del caso derivado.
- Relación entre docente-tutor y tutorados (cómo se asignan, si cambia
  por periodo académico).
- Relación con la actualización de malla curricular (si aplica a este
  módulo o es un proyecto aparte).
- Identidad visual (paleta propia, distinta de `pagina-web/` y
  `docentrack/`) — propuesta inicial: violeta como color primario,
  a falta de mejor definición.
- Stack — se asume el mismo patrón del workspace (HTML + Tailwind +
  JS, sin backend) salvo que el usuario indique algo distinto.

## Modo claro/oscuro (obligatorio, en todo)
Mismo mecanismo que el resto del workspace (variables CSS, botón
alterna `[data-theme]`, estado en memoria durante la navegación, sin
localStorage).

## Reglas de diseño
- Contraste accesible y foco visible en ambos temas.
- Componentes reutilizables y consistentes entre pantallas.
- Cuidado especial con el tono: este módulo trata temas sensibles
  (salud mental, consumo de sustancias, riesgo de abandono) — la UI
  debe transmitir confidencialidad y cuidado, no burocracia fría.

## Convenciones de código
- Archivos en minúscula con guiones.
- Mismo patrón de inyección de componentes que el resto del workspace
  (`getBasePath()`, partials en `/components`, sin duplicar HTML).
- Colores solo vía variables CSS de este proyecto — nunca hardcodeados,
  nunca reutilizando los de `pagina-web/` o `docentrack/`.

## Qué NO hacer
- No implementar backend, base de datos ni lógica de servidor real
  (documentar el modelo de datos en `docs/MODELO-DATOS.md` sí;
  ejecutarlo aquí, no).
- No compartir componentes, tokens de color ni JS con `pagina-web/` ni
  `docentrack/`.
- No inventar datos institucionales reales (nombres de docentes,
  estudiantes, casos) — usar placeholders claramente marcados,
  especialmente sensible tratándose de datos de salud/personales.
- No asumir alcance no confirmado (roles, flujo de derivación exacto,
  contenido del formulario) sin antes confirmarlo con el usuario — este
  documento se irá completando por partes.

## Estructura del repo (propuesta inicial, ajustar al crecer)
- `/docs/ESPECIFICACION.md` → pantallas y módulos — por crear
- `/docs/MODELO-DATOS.md` → entidades/atributos para el futuro backend — por crear
- `/components` → header/sidebar, tarjetas, formularios reutilizables
- `/pages` → pantallas del mockup
- `/assets`
- `/css` → `tokens.css` (paleta propia), `base.css`
- `/js` → tema, inyección de componentes
- `index.html` → punto de entrada

## Estado actual
Proyecto recién creado. Aún no hay pantallas ni especificación —
esperando que el usuario detalle el alcance por partes (ver sección
"Alcance — a definir en partes siguientes").
