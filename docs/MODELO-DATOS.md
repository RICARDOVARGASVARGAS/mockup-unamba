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
