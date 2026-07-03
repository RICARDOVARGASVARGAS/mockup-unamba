# MODELO-DATOS.md

## Reglas

- Imagen: 16:9, object-fit cover, mínimo 1200px ancho.
- Sin campo "destacada": todas las tarjetas ocupan 1 columna.
- Fotos/videos dentro de `resumen`, `cuerpo` y `descripcion` siempre referencian un `Archivo` ya subido (no URLs sueltas).
- Línea de tiempo de eventos: agrupar visualmente por mes (calculado desde `fecha_inicio`, no un campo aparte).

## Usuario

| Campo             | Nota                     |
|-------------------|--------------------------|
| id                |                          |
| numero_documento  | DNI/CE                   |
| nombres           |                          |
| apellido_paterno  |                          |
| apellido_materno  |                          |
| fecha_nacimiento  |                          |
| correo            | login                    |
| rol_id            | FK → Rol (admin/editor)  |
| estado            | activo / inactivo        |

## Archivo

| Campo         | Nota                              |
|---------------|------------------------------------|
| id            |                                    |
| nombre        |                                    |
| ruta          | URL/path del archivo               |
| tipo          | imagen / video / pdf               |
| alt_text      | Obligatorio si tipo = imagen        |
| tamano_bytes  |                                    |
| ancho         | Solo imagen/video                  |
| alto          | Solo imagen/video                  |
| subido_por    | FK → Usuario                       |

## Categoria

Compartida por Noticia y Evento (mismo color en ambos si el nombre coincide).

| Campo  | Nota                                                        |
|--------|--------------------------------------------------------------|
| id     |                                                               |
| nombre | Institucional, Académico, Convenios, Comunidad, Servicios (solo eventos) |
| color  | Código hex (ej. #0B3D91)                                     |

## Noticia

| Campo             | Nota                            |
|-------------------|----------------------------------|
| id                |                                  |
| titulo            |                                  |
| foto_portada_id   | FK → Archivo                     |
| resumen           | Texto enriquecido, para la tarjeta |
| cuerpo            | Texto enriquecido, contenido completo |
| categoria_id      | FK → Categoria                   |
| fecha_publicacion |                                  |
| estado            | enum: borrador / publicado       |
| autor_id          | FK → Usuario                     |
| slug              | opcional, URL amigable           |

## Lugar

Ambientes físicos del campus, reutilizados por muchos eventos (evita repetir/desalinear el mismo ambiente evento por evento).

| Campo     | Nota                        |
|-----------|-----------------------------|
| id        |                             |
| nombre    | Ej. Auditorio Principal     |
| foto_id   | FK → Archivo (opcional)     |
| latitud   | Opcional                   |
| longitud  | Opcional                   |

Obs: si `latitud`/`longitud` existen, el detalle del evento muestra un mapa (Leaflet + OpenStreetMap — gratis, sin API key). Si no existen, solo se muestra el nombre en texto.

## Evento

| Campo            | Nota                                              |
|------------------|-----------------------------------------------------|
| id               |                                                    |
| titulo           |                                                    |
| foto_portada_id  | FK → Archivo (opcional)                            |
| descripcion      | Texto enriquecido, contenido completo (mismo `prose` que Noticia.cuerpo) |
| categoria_id     | FK → Categoria                                     |
| fecha_inicio     | Fecha + hora                                       |
| fecha_fin        | Fecha + hora, opcional (vacío = evento de un día)  |
| modalidad        | enum: presencial / virtual / híbrido               |
| lugar_id         | FK → Lugar, obligatorio si modalidad ≠ virtual     |
| enlace_virtual   | URL, obligatorio si modalidad ≠ presencial. Enlace de acceso a la videollamada (Zoom/Meet) |
| url_inscripcion  | URL, opcional. Formulario externo (Google Forms). Si está vacío, no hay botón "Inscribirme" |
| cupo             | Número, opcional (vacío = sin límite)              |
| estado           | enum: borrador / publicado / cancelado             |
| autor_id         | FK → Usuario                                       |
| slug             | opcional, URL amigable                             |

Obs: `estado = cancelado` no se oculta, se sigue mostrando en la línea de tiempo pero atenuado y con etiqueta "Cancelado" (evita el "¿y este evento qué pasó?" si simplemente desaparece).

Obs: sin login en el sitio público, "Inscribirme" y "Unirme a videollamada" son enlaces directos a `url_inscripcion`/`enlace_virtual` (`target="_blank"`), nunca una acción de servidor. Cada uno aparece solo si su campo tiene valor — pueden coexistir los dos, uno solo, o ninguno.

## TipoComunicado

| Campo  | Nota                                    |
|--------|-------------------------------------------|
| id     |                                          |
| nombre | Resolución, Convocatoria, Aviso          |
| color  | Código hex (ej. #0B3D91)                 |

## Comunicado

| Campo              | Nota                                                        |
|--------------------|---------------------------------------------------------------|
| id                 |                                                              |
| numero             | Opcional. Identificador oficial (ej. "045-2026-UNAMBA-FA"), sobre todo en resoluciones |
| titulo             |                                                              |
| tipo_id            | FK → TipoComunicado                                          |
| documento_id       | FK → Archivo, opcional (no todo comunicado tiene PDF adjunto) |
| fecha_publicacion  |                                                              |
| fecha_vencimiento  | Opcional. Solo convocatorias con plazo; si ya pasó, se marca "Cerrada" |
| estado             | enum: borrador / publicado                                  |
| autor_id           | FK → Usuario                                                |

Obs: a diferencia de Noticia/Evento, un comunicado no tiene `cuerpo` ni página de detalle — el comunicado ES el documento. El clic va directo al PDF (`documento_id`); si no hay documento adjunto, la fila no es clicable (por ejemplo, un aviso simple sin PDF).

## Sede

Sedes reales de la universidad (no confundir con `Lugar`, que son ambientes dentro de un campus).

| Campo  | Nota                              |
|--------|-------------------------------------|
| id     |                                    |
| nombre | Abancay, Cotabambas-Tambobamba     |

## CategoriaDocente

Rango docente (Ley Universitaria), no confundir con `Categoria` (esa es de contenido: Noticia/Evento).

| Campo  | Nota                                      |
|--------|---------------------------------------------|
| id     |                                            |
| nombre | Principal, Asociado, Auxiliar, Contratado |

## Docente

Perfil público informativo — no requiere cuenta de acceso al sistema.

| Campo                | Nota                                                     |
|----------------------|-------------------------------------------------------------|
| id                   |                                                          |
| nombres              |                                                          |
| apellido_paterno     |                                                          |
| apellido_materno     |                                                          |
| foto_id              | FK → Archivo                                             |
| grado_academico      | Dr., Mg., Lic., Ing., etc.                               |
| categoria_docente_id | FK → CategoriaDocente                                    |
| sede_id              | FK → Sede                                                |
| correo               | Público, de contacto — no es login                       |
| cv_id                | FK → Archivo, opcional (hoja de vida en PDF)             |
| usuario_id           | FK → Usuario, opcional — solo si también administra contenido |
| estado               | enum: borrador / activo / licencia / retirado            |
| orden                | Número, opcional. Define la posición en el listado (no depende de cuándo se registró) |

Obs: en el listado público solo se muestran docentes con `estado = activo` (o `licencia`, con una nota visible de "actualmente de licencia" — a decidir en diseño). `borrador` y `retirado` nunca se muestran, pero el registro no se borra (memoria institucional: quién fue docente, cuándo).

Obs: orden de listado = `orden` ascendente primero; entre quienes no tengan `orden` (o empaten), por `apellido_paterno` alfabético. Así, registrar un docente al final no lo manda al final de la página — su posición se define aparte, a mano.

## TipoDocumento

| Campo  | Nota                                                        |
|--------|----------------------------------------------------------------|
| id     |                                                              |
| nombre | Reglamentos, Sílabos, Planes y Mallas Curriculares, Resoluciones, Documentos de Gestión, Formatos de Trámite |

## Documento

| Campo               | Nota                                                      |
|---------------------|---------------------------------------------------------------|
| id                  |                                                            |
| titulo              |                                                            |
| tipo_documento_id   | FK → TipoDocumento                                        |
| anio                |                                                            |
| semestre            | enum: I / II, opcional (solo aplica a sílabos y planes)   |
| sede_id             | FK → Sede, opcional (vacío = aplica a todas las sedes)    |
| archivo_id          | FK → Archivo                                              |
| fecha_publicacion   |                                                            |
| estado              | enum: borrador / publicado                                |
| autor_id            | FK → Usuario                                              |

Obs: "Resoluciones" existe como tipo aquí y también como tipo en `Comunicado`, a propósito — no es error de diseño. `Comunicado` es el feed cronológico (se anuncia una vez, se archiva por mes); `Documento` es el repositorio permanente, organizado para buscar ("necesito el reglamento vigente"), no para enterarse de algo nuevo. Una misma resolución puede tener una fila en cada tabla, ambas apuntando al mismo `Archivo` — no se duplica el PDF, solo la forma de encontrarlo.

## CargoAutoridad

| Campo  | Nota                                                          |
|--------|-------------------------------------------------------------------|
| id     |                                                                |
| nombre | Decano, Directora de Escuela, Director de Departamento Académico |

## Autoridad

Cargo unipersonal con gestión (a diferencia de `Comite`, que es un cuerpo colegiado con varios miembros).

| Campo         | Nota                                                        |
|---------------|-----------------------------------------------------------------|
| id            |                                                              |
| cargo_id      | FK → CargoAutoridad                                          |
| docente_id    | FK → Docente — quien ocupa el cargo (un decano es, por ley, un docente principal) |
| fecha_inicio  | Inicio de la gestión                                         |
| fecha_fin     | Fin de la gestión, opcional (vacío = en funciones actualmente) |
| resolucion_id | FK → Documento, opcional (resolución de designación)         |
| orden         | Posición de aparición (Decano primero, etc.)                |

Obs: no hay campo `estado` — "vigente" se calcula de `fecha_fin IS NULL O fecha_fin >= hoy` (una gestión puede tener fecha de término ya definida, ej. un periodo fijo de 2 años, y seguir vigente hasta que llegue); "concluida" es `fecha_fin < hoy`. No se guarda aparte para evitar que ambos datos queden contradictorios. Así, cuando cambie el decano, no se borra el registro anterior: se le pone `fecha_fin` y se crea una fila nueva — queda el historial de gestiones.

## Comite

Cuerpo colegiado (Consejo de Facultad, comités, comisiones) — mismo campo `funcion`/`resolucion_id` para cualquiera de los dos, tal como pide la especificación.

| Campo         | Nota                                          |
|---------------|--------------------------------------------------|
| id            |                                                |
| nombre        | Ej. "Consejo de Facultad", "Comité de Currícula" |
| funcion       | Texto breve: para qué existe                  |
| resolucion_id | FK → Documento, opcional (resolución de conformación) |
| fecha_inicio  | Inicio del periodo                             |
| fecha_fin     | Fin del periodo, opcional (vacío = vigente)   |

## ComiteMiembro

| Campo      | Nota                                                          |
|------------|-------------------------------------------------------------------|
| id         |                                                                |
| comite_id  | FK → Comite                                                    |
| docente_id | FK → Docente, opcional                                        |
| nombre     | Nombre completo (se guarda siempre, aunque sea docente)       |
| rol        | Ej. Presidente, Secretario, Miembro, Representante estudiantil |
| orden      | Posición dentro de la lista del comité                        |

Obs: `docente_id` es opcional porque el Consejo de Facultad incluye representantes estudiantiles por ley, y esos no son docentes — no existe (todavía) una tabla de estudiantes en este mockup. `nombre` se guarda siempre en texto para no depender de un JOIN al mostrar la lista; `docente_id`, cuando existe, solo sirve para enlazar a su foto/ficha en `Docente`.

## LaFacultad

**Tabla singleton** — a diferencia de Noticia/Evento/Docente (catálogos con muchas filas, cada una una noticia distinta), aquí existe **una sola fila para toda la página** "/nosotros". No se "publica contenido nuevo" cada vez, se edita el que ya existe.

| Campo               | Nota                                          |
|---------------------|---------------------------------------------------|
| id                  | Fijo en 1 — nunca hay una segunda fila         |
| foto_portada_id     | FK → Archivo, opcional (foto de fachada/campus, cabecera de la página) |
| resena_historica    | Texto enriquecido                              |
| mision              | Texto enriquecido                              |
| vision              | Texto enriquecido                              |
| organigrama_id      | FK → Archivo, opcional (imagen del organigrama) |
| actualizado_por     | FK → Usuario                                    |
| fecha_actualizacion |                                                 |

Obs: las fotos del organigrama interactivo (Decano, Directora de Escuela, Director de Departamento) **no son un campo nuevo aquí** — salen de `Autoridad → Docente.foto_id`, ya existente. Solo `foto_portada_id` es un campo realmente nuevo en esta tabla.

Obs: la especificación permite organigrama como "imagen o interactivo". La versión interactiva **no necesita tabla propia** — se arma en pantalla leyendo `Autoridad` + `Comite`, que ya existen. Si se deja como imagen simple (`organigrama_id`), es más fácil de mantener oficial/aprobado (documento visado), pero se desactualiza si cambian las autoridades y nadie sube una imagen nueva.

## ValorInstitucional

| Campo       | Nota    |
|-------------|---------|
| id          |         |
| nombre      |         |
| descripcion |         |
| orden       |         |

## ObjetivoEducacional

| Campo       | Nota |
|-------------|------|
| id          |      |
| descripcion |      |
| orden       |      |

## Fortaleza

Oferta/fortalezas de la facultad (biblioteca, cómputo, intercambio, eventos).

| Campo       | Nota                          |
|-------------|----------------------------------|
| id          |                                |
| titulo      |                                |
| descripcion |                                |
| icono_id    | FK → Archivo, opcional          |
| orden       |                                |

## InformacionAcademica

**Tabla singleton**, mismo criterio que `LaFacultad`: una sola fila para la página "/academico".

| Campo               | Nota                                                    |
|---------------------|-------------------------------------------------------------|
| id                  | Fijo en 1                                                |
| grado_titulo        | Texto enriquecido — qué grado/título se obtiene al egresar |
| actualizado_por     | FK → Usuario                                              |
| fecha_actualizacion |                                                            |

## PerfilIngresante

| Campo       | Nota |
|-------------|------|
| id          |      |
| descripcion |      |
| orden       |      |

## PerfilEgresado

| Campo       | Nota |
|-------------|------|
| id          |      |
| descripcion |      |
| orden       |      |

## CampoOcupacional

| Campo       | Nota                                     |
|-------------|---------------------------------------------|
| id          |                                            |
| nombre      | Ej. "Consultoría y asesoría empresarial"  |
| descripcion | Opcional                                  |
| orden       |                                            |

## TipoCompetencia

| Campo  | Nota                            |
|--------|-------------------------------------|
| id     |                                  |
| nombre | Genérica, Específica, Técnica    |

## Competencia

| Campo               | Nota                     |
|---------------------|------------------------------|
| id                  |                          |
| tipo_competencia_id | FK → TipoCompetencia      |
| descripcion         |                          |
| orden               |                          |

Obs: Malla curricular y Plan de estudios **no tienen tabla propia** — se muestran como filas de `Documento` (mismo `TipoDocumento = "Planes y Mallas Curriculares"` ya usado en /documentos). Se decidió así en vez de modelar un curso por curso con prerrequisitos, para no ampliar el alcance del mockup; si más adelante se quiere una malla interactiva real, sería un módulo aparte.

## LineaInvestigacion

| Campo       | Nota |
|-------------|------|
| id          |      |
| nombre      |      |
| descripcion |      |
| orden       |      |

## ProyectoInvestigacion

| Campo                | Nota                                   |
|----------------------|---------------------------------------------|
| id                   |                                        |
| titulo               |                                        |
| descripcion          |                                        |
| linea_investigacion_id | FK → LineaInvestigacion, opcional    |
| responsable_id       | FK → Docente                            |
| fecha_inicio         |                                        |
| fecha_fin            | Opcional (vacío = en curso)             |

Obs: no hay campo `estado` — "en curso" o "concluido" se calcula de `fecha_fin IS NULL O fecha_fin >= hoy`, mismo criterio que ya usamos en `Autoridad`.

## Publicacion

| Campo            | Nota                                                        |
|------------------|-----------------------------------------------------------------|
| id               |                                                              |
| titulo           |                                                              |
| autor            | Texto (nombre visible, admite coautores externos separados por coma) |
| autor_docente_id | FK → Docente, opcional — si el autor principal es de la facultad |
| fecha_publicacion |                                                             |
| archivo_id       | FK → Archivo, opcional                                       |
| enlace_externo   | URL, opcional (ej. revista indexada externa)                 |

Obs: "Docentes investigadores" (pedido en la especificación) **no es una tabla ni un campo nuevo en `Docente`** — es la lista de docentes que aparecen como `ProyectoInvestigacion.responsable_id` o `Publicacion.autor_docente_id`. Agregar un flag `es_investigador` hubiera sido dato redundante (se puede desincronizar de la realidad); mejor calcularlo.

## Empresa

Se separó de `Oferta` para no repetir/desalinear el nombre de la misma empresa cada vez que publica (y para poder mostrar su logo).

| Campo   | Nota                        |
|---------|-----------------------------|
| id      |                             |
| nombre  |                             |
| logo_id | FK → Archivo, opcional       |
| sector  | Opcional (ej. "Finanzas", "Retail") |

## TipoOferta

| Campo  | Nota                                                     |
|--------|--------------------------------------------------------------|
| id     |                                                            |
| nombre | Práctica pre-profesional, Práctica profesional, Empleo    |

## Oferta

| Campo          | Nota                                        |
|----------------|------------------------------------------------|
| id             |                                              |
| titulo         |                                              |
| empresa_id     | FK → Empresa                                 |
| tipo_oferta_id | FK → TipoOferta                              |
| descripcion    |                                              |
| enlace         | URL de postulación (obligatorio)             |
| fecha_publicacion |                                           |
| fecha_vigencia | Opcional (vacío = sin fecha límite)          |
| estado         | enum: borrador / publicado                   |
| autor_id       | FK → Usuario                                  |

Obs: "vigente" o "vencida" se calcula de `fecha_vigencia`, mismo criterio que `Comunicado.fecha_vencimiento` — no se guarda aparte.

## Tramite

| Campo               | Nota                                                      |
|---------------------|----------------------------------------------------------------|
| id                  |                                                            |
| nombre              | Ej. "Constancia de matrícula"                              |
| descripcion         |                                                            |
| requisitos          | Texto (lista simple, con saltos de línea)                  |
| pasos               | Texto (lista simple, con saltos de línea)                  |
| formato_documento_id | FK → Documento, opcional (formato descargable asociado)   |
| orden               |                                                            |

Obs: "Formatos descargables" de la especificación **no es tabla propia** — son filas de `Documento` con un `TipoDocumento` nuevo ("Formatos de Trámite"), igual que ya hicimos con Malla/Plan. "Enlaces a sistemas oficiales" (matrícula, pagos, biblioteca) son `[EXT]` en la especificación: enlaces externos fijos, no se guardan en esta base de datos — es la misma sección "Accesos a sistemas" que ya existe en Inicio.

## AudienciaEncuesta

| Campo  | Nota                                       |
|--------|------------------------------------------------|
| id     |                                             |
| nombre | Estudiantes, Egresados, Docentes, Empleadores |

## Encuesta

| Campo              | Nota                                    |
|--------------------|---------------------------------------------|
| id                 |                                          |
| titulo             |                                          |
| descripcion        |                                          |
| audiencia_id       | FK → AudienciaEncuesta                   |
| enlace             | URL externo (ej. Google Forms)           |
| fecha_publicacion  |                                          |
| fecha_vigencia     | Opcional (vacío = sin fecha límite)      |
| estado             | enum: borrador / publicado               |

Obs: "Seguimiento al egresado" **no es una tabla aparte** — es la sección de esta misma página que filtra `Encuesta` por `audiencia_id = Egresados`, con un texto introductorio fijo explicando el programa. Un sistema real de seguimiento (empleabilidad, salarios, ubicación del egresado en el tiempo) sería un módulo mucho más grande, fuera de alcance por ahora.

## Institucion

Igual criterio que `Empresa` en Bolsa de Trabajo: se separa para no repetir el nombre cada vez que renueva o firma otro convenio, y para poder mostrar su logo.

| Campo   | Nota                     |
|---------|--------------------------|
| id      |                          |
| nombre  |                          |
| logo_id | FK → Archivo, opcional    |
| pais    | Opcional                |

## TipoConvenio

| Campo  | Nota                                                                  |
|--------|---------------------------------------------------------------------------|
| id     |                                                                       |
| nombre | Intercambio académico, Prácticas profesionales, Cooperación técnica, Investigación conjunta |

## Convenio

| Campo            | Nota                                        |
|------------------|------------------------------------------------|
| id               |                                              |
| institucion_id   | FK → Institucion                             |
| tipo_convenio_id | FK → TipoConvenio                            |
| descripcion      |                                              |
| fecha_inicio     |                                              |
| fecha_fin        | Opcional (vacío = vigencia indefinida)       |
| documento_id     | FK → Archivo, opcional (documento firmado)   |
| estado           | enum: borrador / publicado                   |

Obs: `documento_id` apunta directo a `Archivo`, no a `Documento` — el convenio ya tiene su propia ficha en esta página, no necesita aparecer también en el repositorio general de /documentos (a diferencia de una resolución, que sí tiene sentido encontrar por los dos caminos).

Obs: "vigente" se calcula de `fecha_fin IS NULL O fecha_fin >= hoy`, mismo criterio que `Autoridad` y `Comite`.

## GrupoEstudiantil

| Campo       | Nota                                    |
|-------------|---------------------------------------------|
| id          |                                          |
| nombre      |                                          |
| descripcion |                                          |
| logo_id     | FK → Archivo, opcional                    |
| contacto    | Texto (correo o red social)              |
| orden       |                                          |

Obs: "Centro Federado" **no es un concepto especial aparte** — es una fila más de `GrupoEstudiantil`, como cualquier otro grupo estudiantil.

## EstudianteDestacado

| Campo   | Nota                                          |
|---------|----------------------------------------------|
| id      |                                               |
| nombre  | Texto — no es un `Usuario` ni `Docente`, es un estudiante (no modelado en este mockup) |
| logro   |                                               |
| foto_id | FK → Archivo                                  |
| fecha   |                                               |
| orden   |                                               |

## Maestria

| Campo                  | Nota                                              |
|------------------------|--------------------------------------------------------|
| id                     |                                                    |
| nombre                 |                                                    |
| descripcion            | Información general del programa                  |
| admision               | Texto — requisitos de admisión                     |
| coordinador_id         | FK → Docente, opcional                              |
| plan_estudio_documento_id | FK → Documento, opcional (mismo `TipoDocumento = "Planes y Mallas Curriculares"`) |
| estado                 | enum: borrador / publicado                          |
| orden                  |                                                    |

## CategoriaAlbum

| Campo  | Nota                                                |
|--------|----------------------------------------------------------|
| id     |                                                      |
| nombre | Instalaciones, Eventos, Proyección Social, Alumnos   |

## Album

| Campo           | Nota                        |
|-----------------|-----------------------------|
| id              |                             |
| titulo          |                             |
| categoria_id    | FK → CategoriaAlbum          |
| fecha           |                             |
| portada_id      | FK → Archivo, opcional (si no hay, se usa la primera foto) |

## AlbumFoto

Tabla puente — las fotos de un álbum.

| Campo      | Nota           |
|------------|----------------|
| id         |                |
| album_id   | FK → Album      |
| archivo_id | FK → Archivo    |
| orden      |                |

## Contacto

**Tabla singleton**, mismo criterio que `LaFacultad` e `InformacionAcademica`.

| Campo               | Nota                                          |
|---------------------|---------------------------------------------------|
| id                  | Fijo en 1                                      |
| correo              |                                                |
| telefono            |                                                |
| direccion           |                                                |
| horario_atencion    |                                                |
| ubicacion_id        | FK → Lugar, opcional (mapa — reusa la misma tabla de Eventos) |
| actualizado_por     | FK → Usuario                                    |
| fecha_actualizacion |                                                |

## RedSocial

| Campo  | Nota                              |
|--------|------------------------------------|
| id     |                                    |
| nombre | Facebook, Instagram, TikTok, YouTube |
| url    |                                    |

Obs: tabla en vez de columnas fijas (`facebook_url`, `instagram_url`...) en `Contacto`, para poder agregar/quitar una red sin tocar el esquema.

## MensajeContacto

Buzón de contacto — lo que llega del formulario público.

| Campo       | Nota                                  |
|-------------|-------------------------------------------|
| id          |                                        |
| nombre      |                                        |
| correo      |                                        |
| asunto      |                                        |
| mensaje     |                                        |
| fecha_envio |                                        |
| estado      | enum: nuevo / leído / respondido       |

Obs: el formulario del mockup es solo visual — sin backend no hay a dónde enviar el mensaje de verdad. Esta tabla es la referencia de a dónde llegaría en el sistema real.
