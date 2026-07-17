# CLAUDE.md — TutorTrack (Módulo de Tutoría)

## Rol
Mandato completo en **`docs/AGENTE-ROL.md`** y regla Cursor
`.cursor/rules/agente-rol.mdc` (alwaysApply). Resumen:

Actúas como **experto UI/UX senior**, **desarrollador / arquitecto
front-end senior** (HTML, CSS/Tailwind, JavaScript, Web Components) y
**analista de dominio**: cada pantalla debe cuadrar con
`docs/MODELO-DATOS.md` — si falta un dato o relación, lo señalas antes
de inventarlo. En la práctica:
- Priorizas jerarquía visual clara y componentes reutilizables por
  encima de resolver cada pantalla "a mano" — un módulo nuevo se arma
  copiando un patrón existente, no reinventando estructura.
- Escribes **código limpio y mantenible**: HTML semántico, separación
  clara entre estructura (HTML), estilos/tokens (CSS) y comportamiento
  (JS); nombres consistentes; sin duplicar el mismo bloque en varias
  pantallas (Custom Elements, igual que el resto del workspace).
- Diseñas pensando en **arquitectura**, no solo en la pantalla puntual:
  cómo crece la carpeta de `/pages` y `/components` a medida que se
  agregan más módulos, sin que el proyecto se vuelva difícil de
  mantener.
- **Ciclo ≠ Periodo Académico**: menú, pantalla y JS separados; su
  cruce es `CicloPeriodo` (otra entidad / otra vista).
- Cuidas accesibilidad (contraste, foco visible, navegación por
  teclado) y consistencia entre pantallas en todo momento.
- Admin/docente/receptor → escritorio y tablet; estudiante → también
  móvil.
Cuando una decisión tenga alternativas, eliges la más usable y
mantenible, y explicas brevemente por qué.

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

## Modelo de datos y alcance — YA CERRADOS

El modelo de datos completo (entidades, relaciones, reglas de
negocio) está documentado en **`docs/MODELO-DATOS.md`** — léelo antes
de maquetar cualquier pantalla, ahí está resuelto:
- Roles de acceso (docente-tutor, estudiante, entidad receptora
  como psicología/salud — con su propio acceso al sistema —,
  admin/coordinador) vía RBAC (`Usuario`/`Rol`/`Permiso`).
- Ciclo académico + Periodo académico + matrícula por periodo
  (`EstudianteCicloPeriodo`), con mecanismo de "avanzar estudiantes"
  y de "copiar" configuración entre periodos.
- Fichas de tutoría configurables (plantilla → clonado por
  ciclo+periodo), con preguntas de texto abierto / alternativa única /
  respuesta múltiple.
- Detección de señales de alerta con IA (plan de dos fases: piloto
  local, luego GPU dedicada) y flujo de derivación con seguimiento
  completo (`Derivacion` + `EstadoDerivacion`).

Solo queda pendiente **contenido** de catálogos (qué roles exactos, qué
preguntas exactas, etc. — ver la sección final de `MODELO-DATOS.md`),
no estructura. La malla curricular (`Ciclo` como catálogo abierto, no
fijo en 10) ya quedó resuelta como catálogo editable.

Identidad visual: **azul institucional + naranja + blanco** (Facultad de
Administración UNAMBA). Azul = estructura, navegación y CTAs principales;
naranja = avisos/urgencia puntual (poca superficie); lienzo blanco/gris
frío. Tipografía: Source Sans 3 + Source Serif 4. Tokens propios en
`css/tokens.css` — sin compartir valores literales con `pagina-web/` ni
`docentrack/`.

Stack: mismo patrón del workspace (HTML + Tailwind + JS, sin backend).

## Tema visual (único)
Tema **claro únicamente** — sin modo oscuro ni botón de alternancia.
Contraste y foco visibles sobre el lienzo claro; tokens en `css/tokens.css`.

## Reglas de diseño
- Contraste accesible y foco visible.
- Componentes reutilizables y consistentes entre pantallas.
- Cuidado especial con el tono: este módulo trata temas sensibles
  (salud mental, consumo de sustancias, riesgo de abandono) — la UI
  debe transmitir confidencialidad y cuidado, no burocracia fría.
- Fotos e identidad solo desde `tutortrack/assets/` (copiadas del
  repositorio `assets/` del workspace cuando haga falta).

## Convenciones de código
- Archivos en minúscula con guiones.
- Mismo patrón de inyección de componentes que el resto del workspace:
  **Web Components nativos (Custom Elements)**, no partials fetched por
  JS. Un componente es un archivo `.js` en `/components` que define
  `customElements.define(...)` y construye su propio `innerHTML` en
  `connectedCallback()`; la página solo escribe la etiqueta
  (`<app-sidebar></app-sidebar>`, `<app-topbar page-title="...">`).
  Funciona igual en `file://` que con servidor — sin fetch, sin CORS.
- `getBasePath()` (`js/site-paths.js`) resuelve el prefijo relativo
  según la profundidad de la página (`""` en la raíz, `"../../"` bajo
  `/pages/<sección>/`) para que los mismos enlaces funcionen sin
  servidor. Todo enlace entre secciones usa este prefijo, nunca rutas
  absolutas (`/pages/...` rompe en `file://`).
- Colores solo vía variables CSS de este proyecto — nunca hardcodeados,
  nunca reutilizando los de `pagina-web/` o `docentrack/`.
- Los `custom elements` son `inline` por defecto: `base.css` los fuerza
  a `display:block` (`app-sidebar`, `app-topbar`) — si se agrega un
  componente nuevo, sumarlo ahí también.

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

## Estructura del repo (real, ajustar al crecer)
- `/docs/ESPECIFICACION.md` → pantallas y módulos — cerrado (inventario)
- `/docs/MODELO-DATOS.md` → entidades/atributos del futuro backend — cerrado
- `/docs/AGENTE-ROL.md` → mandato del agente (UI/UX + front + dominio)
- `/.cursor/rules/agente-rol.mdc` → misma regla, alwaysApply en Cursor
- `/components` → `app-sidebar.js`, `app-topbar.js` (Custom Elements,
  ver "Convenciones de código")
- `/pages/admin/`, `/pages/docente/`, `/pages/estudiante/`,
  `/pages/receptor/` → una carpeta por sección/rol, misma profundidad
  (2 niveles bajo la raíz) para que `getBasePath()` funcione igual en
  todas
- `/css` → `tokens.css` (azul + naranja + blanco), `base.css`
- `/js` → `theme.js` (contraste on-primary), `site-paths.js`, `tailwind-config.js`, `login.js`,
  `catalog-table.js` (motor de listados de catálogo)
- `index.html` → login (punto de entrada único, sin selector de rol)

## Estado actual
- ~~Modelo de datos~~ — cerrado en `docs/MODELO-DATOS.md`.
- ~~Fase 0 — Compartido~~ — hecho: login único (permisos, no roles
  hardcodeados; recuperar contraseña solo visual), `app-sidebar`
  (4 secciones — Administrador / Docente-Tutor / Estudiante /
  Receptor-Psicología — todas visibles a la vez para la demo, con
  catálogos del admin agrupados en sub-secciones colapsables),
  `app-topbar` (perfil, carrera fija "Administración", ciclo actual
  solo en Estudiante, notificaciones), 100% responsive (drawer
  off-canvas en móvil/tablet para las 4 secciones), un dashboard de
  ejemplo por sección. Probado en navegador: login → dashboard,
  navegación entre las 4 secciones. Tema claro único.
- ~~Especificación~~ — inventario completo de pantallas cerrado en
  `docs/ESPECIFICACION.md` (todas las fases, objetivo/entidades/reglas
  por pantalla) antes de seguir diseñando.
- ~~Fase 1 — Catálogos~~ — hecho. Pantallas:
  `ciclos`, `periodos-academicos`, `areas`, `tipos-ficha`,
  `tipos-pregunta`, `entidades-receptoras`, `tipos-estado-derivacion`,
  `roles-permisos` (pestañas Roles | Permisos). Motor compartido
  `js/catalog-table.js` (buscar + botón, filtros, paginación, acciones
  etiquetadas) + `app-toast` / `app-modal-confirm`.
- Próximas fases (pantallas reales, siguiendo `app-sidebar.js` como
  fuente de verdad de la navegación):
  2. Docente y Estudiante (cuelgan de Usuario).
  3. Configuración por periodo (CicloPeriodo, DocenteCicloPeriodo,
     Temario, EstudianteCicloPeriodo + "Avanzar estudiantes").
  4. Fichas (plantilla, preguntas, clonado por CicloPeriodo, y la
     vista de estudiante llenando una ficha).
  5. IA / Alertas / Derivación (AlertaIA, Derivacion,
     EstadoDerivacion).
