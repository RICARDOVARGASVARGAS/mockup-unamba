# Modelo de datos — TutorTrack

Notas de referencia (entidades, atributos, reglas) para el futuro backend.
Son solo apuntes: no se implementan en este mockup, se actualizan a
medida que se confirma cada parte del alcance en conversación con el
usuario. Cuando algo sigue en discusión se marca explícitamente como
**(pendiente)**.

## Convención de nombres (confirmada)

Para no confundir dos conceptos distintos que ambos usan la palabra
"ciclo":
- **Periodo Académico** → el contenedor temporal general (ej. `2026-I`,
  `2026-II`). Mismo término que ya usa `../docentrack/`.
- **Ciclo** → el nivel curricular del estudiante (1° al 10°). Catálogo
  aparte, no se mezcla con Periodo Académico.

## Entidades confirmadas hasta ahora

### Usuario
Tabla base **compartida** entre Docente y Estudiante — es donde vive la
identidad de login, no los datos propios de cada rol de negocio.
- `id`
- `documento` (DNI/CE)
- `nombres`
- `apellido_paterno`
- `apellido_materno`
- `sexo`
- `fecha_nacimiento`
- `correo_electronico`
- `contrasena` (hash, nunca texto plano)

### Docente
Cuelga 1:1 de `Usuario` — un docente-tutor **es** un Usuario, con datos
adicionales propios de su rol de negocio.
- `id`
- `usuario_id` → Usuario
- `foto_perfil_url`
- (otros atributos propios de docente — pendiente, no es el foco de
  esta parte de la conversación)

### Ciclo
Catálogo de niveles curriculares.
- `id`
- `numero` (1 al 10)
- `nombre` (ej. "Primer ciclo")

Por ahora se asume fijo (10 ciclos), aunque el usuario mencionó que la
malla curricular podría actualizarse — impacto en este catálogo
**(pendiente de definir)**.

### PeriodoAcademico
Catálogo de periodos (semestre/año).
- `id`
- `nombre` (ej. "2026-I", "2026-II")
- `fecha_inicio`, `fecha_fin` (pendiente si se necesita en el mockup)
- `activo` (booleano, para saber cuál es el periodo vigente)

### CicloPeriodo
**Entidad puente / nodo central**: representa la instancia de un
**Ciclo dentro de un Periodo Académico específico**. De esta entidad
cuelgan tanto el temario como los docentes asignados de ese periodo —
es lo que se **copia** al crear un nuevo periodo (ver regla de copia
abajo).
- `id`
- `ciclo_id` → Ciclo
- `periodo_academico_id` → PeriodoAcademico

Un mismo Ciclo (ej. "1° ciclo") tiene una fila `CicloPeriodo` distinta
por cada Periodo Académico en el que participa (una para 2026-I, otra
para 2026-II, etc.), cada una independiente.

### Temario
Ítems del temario de tutoría, ligados a una instancia `CicloPeriodo`
concreta (no al Ciclo en abstracto, ni al Periodo en abstracto).
- `id`
- `ciclo_periodo_id` → CicloPeriodo
- `tema` (texto)
- `orden` (para ordenar la lista)

### DocenteCicloPeriodo
Relación **muchos a muchos** entre Docente y CicloPeriodo: qué
docente(s) dictan tutoría en qué ciclo, dentro de un periodo académico
específico.
- `id`
- `docente_id` → Docente
- `ciclo_periodo_id` → CicloPeriodo

Reglas confirmadas:
- Un **Ciclo puede tener uno o más Docentes** asignados (n:n).
- Un **Docente puede dictar tutoría en uno o más Ciclos** (n:n).
- Esta asignación es **propia de cada Periodo Académico**: un docente
  puede estar en varios ciclos en 2026-I, y en 2026-II mantenerse igual
  o cambiar — son datos independientes por periodo.
- **Unicidad**: un mismo `docente_id` no puede tener dos filas para el
  mismo `ciclo_periodo_id` (evita duplicar la misma asignación).

### Estudiante
Cuelga 1:1 de `Usuario`, igual que Docente — mismo patrón, tabla
separada para sus atributos propios de negocio.
- `id`
- `usuario_id` → Usuario
- `foto_perfil_url`
- (otros atributos propios de estudiante, ej. código universitario —
  pendiente, no es el foco de esta parte de la conversación)

### Rol / Permiso (control de acceso)
RBAC estándar sobre `Usuario` (por lo tanto válido tanto para Docente
como para Estudiante, y para cualquier otro tipo de usuario que se
agregue después, ej. coordinador, psicología):

**Rol**
- `id`
- `nombre` (catálogo — contenido exacto pendiente, ej. "Docente-Tutor",
  "Coordinador", "Estudiante", "Psicología/Entidad receptora")

**Permiso**
- `id`
- `nombre` (catálogo — contenido exacto pendiente)

**UsuarioRol** (n:n)
- `usuario_id` → Usuario
- `rol_id` → Rol

**RolPermiso** (n:n)
- `rol_id` → Rol
- `permiso_id` → Permiso

Reglas confirmadas:
- Un **Usuario puede tener uno o más Roles**.
- Un **Rol puede tener uno o más Permisos**.
- Los permisos nunca se asignan directo a un Usuario — siempre pasan
  por un Rol.

### EstudianteCicloPeriodo (matrícula de tutoría)
Representa que un Estudiante está matriculado en un `CicloPeriodo`
concreto (ciclo + periodo académico), a cargo de un Docente específico.
Esta fila es propia de cada periodo — **no se arrastra ni se deriva
automáticamente del periodo anterior**, se crea de nuevo cada vez (ver
mecanismo de "Avanzar estudiantes" más abajo).
- `id`
- `estudiante_id` → Estudiante
- `ciclo_periodo_id` → CicloPeriodo *(fija ciclo + periodo a la vez)*
- `docente_id` → Docente

Reglas confirmadas:
- **Un estudiante solo puede tener una matrícula por Periodo
  Académico** (unicidad: `estudiante_id` + el `periodo_academico_id` de
  su `ciclo_periodo_id`, no puede repetirse dentro del mismo periodo).
- Un estudiante **sí puede repetir el mismo Ciclo** en periodos
  distintos, todas las veces que sea necesario — cada periodo es una
  fila independiente, sin límite de repeticiones.
- El `docente_id` asignado debe ser uno de los docentes que ya
  figuran en `DocenteCicloPeriodo` para ese mismo `ciclo_periodo_id`
  (no se puede asignar un docente que no dicta ese ciclo en ese
  periodo). **Regla de aplicación**, no de llave foránea — la base de
  datos no la garantiza sola, debe validarse en la lógica del sistema.
- No existe un campo de estado explícito en Estudiante
  (activo/egresado/retirado): se **infiere** por ausencia de matrícula
  en el periodo vigente. Si más adelante se necesita distinguir
  "egresado" de "retirado" para reportes, se revisita esta decisión.

### Progresión de estudiantes entre periodos ("Avanzar estudiantes")
Acción manual asistida al abrir un nuevo Periodo Académico, mismo
espíritu que la copia de `CicloPeriodo` (propone, pero no decide por el
usuario):
1. Por cada estudiante matriculado en el periodo anterior, el sistema
   **propone** matricularlo en el `Ciclo` con el `numero` inmediato
   superior, dentro del nuevo periodo.
2. El admin revisa la propuesta y corrige lo que no aplique: dejar al
   estudiante en el mismo ciclo (repite), moverlo a un ciclo distinto,
   o excluirlo de la lista (no se matricula ese periodo → egresa o se
   retira, sin necesidad de marcarlo explícitamente).
3. Al confirmar, se crean las filas `EstudianteCicloPeriodo` del nuevo
   periodo. El periodo anterior no se modifica.

Como el "ciclo siguiente" se busca por `numero` (no por una cantidad
fija de 10), si el catálogo `Ciclo` crece en el futuro (ej. 11° y 12°
en 2028) la propuesta de avance simplemente los encuentra — no
requiere migrar datos históricos.

Beneficios que se derivan gratis de este modelo:
- **Historial completo de un estudiante**: se obtiene consultando todas
  sus filas `EstudianteCicloPeriodo` ordenadas por periodo (qué ciclo
  cursó, con qué docente, en cada periodo).
- **Balance de carga entre docentes**: al momento de "Avanzar
  estudiantes", conviene mostrar en pantalla el conteo de tutorados por
  docente para que el admin reequilibre a criterio propio — no se
  necesita un algoritmo automático para este mockup.

## Regla de "copiar" al crear un nuevo Periodo Académico

Motivación del usuario: si el temario o las asignaciones de un ciclo no
cambian de un periodo a otro, no se quiere volver a configurar todo
desde cero — pero tampoco se quiere que dos periodos **compartan la
misma fila** (para que un cambio futuro en 2026-II nunca afecte lo que
ya ocurrió en 2026-I).

Mecanismo: al abrir un nuevo Periodo Académico, se puede **clonar**
la configuración de un periodo anterior:
1. Se crean nuevas filas `CicloPeriodo` (una por cada Ciclo) para el
   nuevo Periodo Académico.
2. Se **duplican** (no se referencian) los ítems de `Temario` y las
   filas de `DocenteCicloPeriodo` del periodo de origen hacia las
   nuevas filas `CicloPeriodo`.
3. A partir de ahí, el usuario edita libremente la copia (cambia
   docentes, ajusta temario) sin que eso toque el periodo anterior.

## Fichas (formularios de tutoría)

### Decisiones de alcance
- **Escuela Profesional: descartada por ahora.** Todo el proyecto es
  para la Facultad de Administración (ver `../CLAUDE.md`), sin
  distinción de escuela. Si en el futuro se necesita, se retoma como
  decisión aparte — no se modela hoy.
- **"Semestre actual" en la ficha de papel = `Ciclo`**, ya modelado vía
  `EstudianteCicloPeriodo` → `CicloPeriodo` → `Ciclo`. No es un dato
  nuevo, se obtiene por relación, igual que "apellidos y nombres"
  (→ Usuario) y "código de estudiante" (→ Estudiante).
- **Ficha individual vs. ficha grupal**: solo cambia el `TipoFicha`, el
  contenido y la estructura son exactamente los mismos — no requiere
  tablas ni lógica aparte.

### Plantilla vs. instancia en uso (mismo principio que el Temario)
Igual que con `Temario`, una `Ficha` es una **plantilla** editable
libremente mientras no está en uso. Al asignarla a uno o más
`CicloPeriodo`, se **clona** (ficha + preguntas + opciones) hacia una
copia independiente — así se puede reutilizar la misma ficha en varios
ciclos sin que un cambio futuro en la plantilla afecte lo que un ciclo
ya tiene en uso.

### TipoFicha (catálogo)
- `id`
- `nombre` (ej. "Diagnóstico", "Seguimiento", "Grupal", "Encuesta" —
  catálogo abierto, se pueden agregar más tipos sin tocar código)

### TipoPregunta (catálogo)
- `id`
- `nombre` (por ahora tres: "Texto abierto", "Alternativa única",
  "Respuesta múltiple" — catálogo abierto, no un enum fijo)

### Area (catálogo)
Clasifica temáticamente cada pregunta (ej. "Personal y social", "Salud
corporal y mental").
- `id`
- `nombre`

### Ficha (plantilla)
- `id`
- `tipo_ficha_id` → TipoFicha
- `nombre`
- `descripcion`

### Pregunta
- `id`
- `ficha_id` → Ficha (nullable)
- `ficha_ciclo_periodo_id` → FichaCicloPeriodo (nullable)
- `area_id` → Area
- `tipo_pregunta_id` → TipoPregunta
- `enunciado` (texto de la pregunta)
- `orden`

**Regla de aplicación (no se garantiza solo con llaves foráneas):**
exactamente uno de `ficha_id` / `ficha_ciclo_periodo_id` debe estar
lleno, nunca ambos ni ninguno.
- `ficha_id` lleno → es una pregunta de la **plantilla** (`Ficha`).
- `ficha_ciclo_periodo_id` lleno → es una pregunta **clonada**, en uso
  para ese `CicloPeriodo` específico (independiente de la plantilla de
  origen).

`OpcionPregunta` no necesita este mismo campo doble: al colgar de
`Pregunta`, hereda automáticamente si pertenece a una plantilla o a una
copia clonada.

### OpcionPregunta
Solo aplica a preguntas de tipo "Alternativa única" o "Respuesta
múltiple" (no a "Texto abierto").
- `id`
- `pregunta_id` → Pregunta
- `texto`
- `orden`

### FichaCicloPeriodo
La **copia clonada** de una `Ficha`, ya en uso para un `CicloPeriodo`
específico. `ficha_id` queda solo como trazabilidad de qué plantilla
la originó — las preguntas/opciones reales de esta instancia son sus
propias copias, no las de la plantilla.
- `id`
- `ficha_id` → Ficha (plantilla de origen)
- `ciclo_periodo_id` → CicloPeriodo

### FichaLlenada
Una ficha específica, llenada por un estudiante puntual, en una fecha.
- `id`
- `estudiante_id` → Estudiante
- `ficha_ciclo_periodo_id` → FichaCicloPeriodo
- `fecha_llenado`

**Confirmado: sin borrador.** La fila `FichaLlenada` se crea **solo
cuando el estudiante envía la ficha completa** — no existe un estado
intermedio "en progreso". Decisión explícita del usuario para evitar
falsos procesos (fichas a medias que nunca se completan).

### Respuesta
La respuesta de un estudiante a una pregunta puntual dentro de una
`FichaLlenada`, más el comentario del tutor sobre esa respuesta.
- `id`
- `ficha_llenada_id` → FichaLlenada
- `pregunta_id` → Pregunta (de la copia clonada en `FichaCicloPeriodo`)
- `respuesta_texto` (solo si la pregunta es de tipo texto abierto)
- `observaciones_tutor` (comentario del docente-tutor sobre esta
  respuesta puntual — dónde detecta o no una señal de alerta)

### RespuestaOpcion
Relación **muchos a muchos** entre `Respuesta` y `OpcionPregunta` — una
fila por opción marcada (una sola fila si es alternativa única, varias
si es respuesta múltiple).
- `respuesta_id` → Respuesta
- `opcion_pregunta_id` → OpcionPregunta

## IA — detección de señales de alerta

### Plan de despliegue (dos fases, decisión del usuario)

**Fase 1 — Piloto local (actual, costo cero adicional).** La universidad
prefiere un gasto fuerte único de hardware antes que un gasto variable
recurrente de API en la nube ("gasto indeterminado"). Se valida el
enfoque con hardware ya disponible:
- GPU de prueba: **NVIDIA RTX 3060 de 8 GB** (ya la tiene el usuario).
- Modelo: un modelo abierto cuantizado de 7-8 mil millones de
  parámetros (ej. Llama 3.1 8B, Qwen2.5 7B, Mistral 7B) corriendo vía
  Ollama — cabe cómodo en 8 GB (pesos ~4-5 GB + espacio de contexto).
- No hay presión de tiempo real: las fichas se procesan en una **cola
  secuencial simple** (una detrás de otra, sin lotes artificiales ni
  pausas), corriendo de forma continua. Con ~3,000-5,000 estudiantes y
  fichas que se van llenando escalonadas durante la semana (no todas a
  la vez), la cola se vacía en cuestión de días sin necesidad de
  optimizar velocidad.

**Fase 2 — Si el piloto funciona, adquirir GPU potente (~S/8,000).**
Investigado en el mercado (julio 2026): a ese presupuesto (~USD
2,000-2,200) la opción recomendada es la **NVIDIA RTX 5090 (32 GB
GDDR7)** — a ese precio ya se consigue en el rango $1,999-$2,199. Sus
32 GB permiten correr modelos bastante más grandes que en la fase 1:
del rango de 25-32 GB de VRAM, incluyendo modelos de hasta 70 mil
millones de parámetros con cuantización agresiva. Alternativa más
económica dentro de la familia: **RTX 4090 (24 GB GDDR6X)**, suficiente
para modelos de hasta 32 mil millones de parámetros en cuantización
Q4 — sigue siendo, según varias fuentes, la opción más equilibrada
para IA local en 2026, aunque con menos margen que la 5090.

Fuentes consultadas (julio 2026):
- [Best NVIDIA GPU for Local AI 2026 — FormulaMod](https://www.formulamod.net/blogs/new/which-nvidia-gpu-for-local-ai-in-2026-rtx-3090-vs-4060-ti-vs-4070-ti-super-vs-4090-vs-5090)
- [RTX 5090 vs RTX 4090 for AI 2026 — Compute Market](https://www.compute-market.com/blog/rtx-5090-vs-rtx-4090-for-ai-2026)
- [Best GPU for AI & LLM Inference 2026 — Compute Market](https://www.compute-market.com/blog/best-gpu-for-ai-2026)

### Rol de la IA (confirmado)
- **Apoyo de detección temprana, nunca reemplazo ni diagnóstico
  automático.** La IA analiza las respuestas (más historial reciente
  del estudiante) y genera una alerta con nivel/justificación — la
  decisión y la derivación siempre las toma un humano (el
  docente-tutor).
- Requiere un **prompt de sistema** bien diseñado que fije el rol de la
  IA, qué debe evaluar, y que devuelva una salida **estructurada**
  (JSON), no texto libre, para poder guardarla directo en la tabla de
  alertas.
- No se necesita RAG (búsqueda documental) para esto — es una tarea de
  clasificación/análisis de texto. El "historial completo" del
  estudiante se resuelve pasándole al modelo sus `Respuesta` anteriores
  como contexto directo, ya que están modeladas en `FichaLlenada`.

### AlertaIA
Resultado del análisis de una `FichaLlenada` por el modelo de IA.
- `id`
- `ficha_llenada_id` → FichaLlenada
- `nivel_alerta` (catálogo: "Baja", "Media", "Alta")
- `area_relacionada_id` → Area
- `justificacion` (texto breve generado por el modelo)
- `estado` (catálogo: "Pendiente", "Revisada", "Derivada", "Descartada")
- `docente_id` → Docente (a quién se notifica)
- `fecha_generada`

**Confirmado: una `FichaLlenada` puede generar varias `AlertaIA`.** Si
el estudiante muestra señales en más de un área a la vez (ej. una de
posible deserción y otra de consumo de sustancias), se genera **una
fila `AlertaIA` por cada área detectada** — no una sola alerta con un
área "dominante". La relación `ficha_llenada_id` ya lo soporta sin
cambios (varias filas pueden compartir el mismo `ficha_llenada_id`).

### EntidadReceptora (catálogo)
A dónde se puede derivar un caso.
- `id`
- `nombre` (ej. "Psicología", "Servicios médicos" — catálogo abierto,
  contenido exacto pendiente)

### Derivacion
Cuando el docente revisa una `AlertaIA` y decide derivar al estudiante,
elige manualmente a dónde — no es una decisión automática de la IA.
Este registro es el "expediente" de la derivación; el detalle de cómo
va evolucionando el caso vive en `EstadoDerivacion` (abajo), no aquí.
- `id`
- `alerta_ia_id` → AlertaIA
- `entidad_receptora_id` → EntidadReceptora (tipo de entidad, ej.
  "Psicología")
- `usuario_receptor_id` → Usuario (la persona específica del área
  receptora asignada al caso — debe tener un Rol acorde a la
  `entidad_receptora_id`, ej. Rol "Psicólogo" para EntidadReceptora
  "Psicología". **Regla de aplicación**, no de llave foránea — mismo
  patrón que la validación de `docente_id` en `EstudianteCicloPeriodo`)
- `docente_id` → Docente (quién derivó)
- `fecha_derivacion`

**Confirmado: la entidad receptora sí tiene acceso propio al
sistema.** Psicología/salud entran con su propio Usuario y Rol (ya
definidos en el bloque RBAC) y registran ellos mismos el avance del
caso — no es el docente quien lo anota a mano.

### EstadoDerivacion
Historial completo de una `Derivacion` — cada fila es un cambio de
estado en el tiempo, con su propio comentario y adjunto opcional (ej.
un informe). Puede registrarlo tanto el docente como la entidad
receptora.
- `id`
- `derivacion_id` → Derivacion
- `tipo_estado_id` → TipoEstadoDerivacion (catálogo, ej. "Derivado",
  "En atención", "En seguimiento", "Resuelto", "Cerrado" — contenido
  exacto pendiente)
- `comentario` (texto)
- `adjunto_url` (nullable — ej. informe o constancia adjunta)
- `usuario_id` → Usuario (quién registró esta entrada)
- `fecha`

**Regla:** el estado *actual* de una `Derivacion` no se guarda como
campo aparte — se obtiene consultando la fila `EstadoDerivacion` más
reciente (por `fecha`) de esa derivación. Evita el mismo problema que
ya resolvimos antes con la "matrícula por periodo": nunca dos fuentes
de verdad para el mismo dato.

### TipoEstadoDerivacion (catálogo)
- `id`
- `nombre` (contenido exacto pendiente, ver arriba)

## Pendiente de definir (próximas partes de la conversación)

Todo lo que queda pendiente es **contenido de catálogos**, no
estructura — el diseño de tablas y relaciones quedó cerrado:

- Atributos propios adicionales de Docente y de Estudiante (más allá de
  lo ya definido).
- Contenido exacto del catálogo Rol/Permiso (qué roles y permisos
  existen realmente — ya sabemos que incluye al menos "Docente-Tutor",
  "Estudiante", y un rol por cada `EntidadReceptora`, ej. "Psicólogo").
- Contenido exacto de los catálogos TipoFicha, Area, TipoEstadoDerivacion,
  EntidadReceptora, y las preguntas reales de cada ficha (esto ya tiene
  estructura, falta el contenido).
- Diseño del prompt de sistema para la IA (fuera del alcance de este
  documento — es lógica de aplicación, no de base de datos).
