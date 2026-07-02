# MODELO-DATOS.md

## Reglas

- Imagen: 16:9, object-fit cover, mínimo 1200px ancho.
- Sin campo "destacada": todas las tarjetas ocupan 1 columna.
- Fotos/videos dentro de `resumen` y `cuerpo` siempre referencian un `Archivo` ya subido (no URLs sueltas).

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

| Campo  | Nota                                            |
|--------|-------------------------------------------------|
| id     |                                                 |
| nombre | Institucional, Académico, Convenios, Comunidad  |
| color  | Código hex (ej. #0B3D91)                       |

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
