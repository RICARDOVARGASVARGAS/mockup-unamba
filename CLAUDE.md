# CLAUDE.md — Workspace UNAMBA (multi-proyecto)

## Qué es este repo
Este repositorio raíz aloja **varios proyectos independientes** de UNAMBA.
Cada proyecto vive en su propia carpeta, es autocontenido (no depende de
los otros) y tiene su propio `CLAUDE.md` con instrucciones específicas de
rol, stack, arquitectura y reglas de diseño.

## Proyectos

| Carpeta | Proyecto | Instrucciones |
|---------|----------|----------------|
| `pagina-web/` | Mockup de la web institucional de la Facultad de Administración UNAMBA | `pagina-web/CLAUDE.md` |
| `docentrack/` | DocenTrack — sistema de registro de horas lectivas docentes (kiosko biométrico + panel admin) | `docentrack/CLAUDE.md` |
| `tutortrack/` | TutorTrack — módulo de tutoría (acompañamiento personal docente-tutor/estudiante, formularios, derivación a psicología/áreas médicas) | `tutortrack/CLAUDE.md` |

## Regla clave

Cuando trabajes dentro de la carpeta de un proyecto, sigue las
instrucciones de **su propio `CLAUDE.md`** — tiene prioridad sobre este
archivo raíz para cualquier decisión específica de ese proyecto (stack,
paleta, estructura de carpetas, convenciones, etc.). Los proyectos no
comparten componentes, estilos, tokens de color ni código entre sí; no
asumas conexiones entre ellos.

## `index.html` raíz

Es solo una landing/selector visual entre los proyectos disponibles (dos
tarjetas). No pertenece a ninguno de los dos mockups ni sigue sus design
tokens — es una pieza de navegación del workspace, independiente.

## Al agregar un proyecto nuevo

1. Crear su propia carpeta en la raíz, autocontenida.
2. Darle su propio `CLAUDE.md` dentro de esa carpeta.
3. Agregar una fila a la tabla de arriba.
4. Agregar su tarjeta correspondiente en el `index.html` raíz.
