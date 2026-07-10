# Especificación del Sistema — Web Facultad de Administración UNAMBA

Este documento describe todas las páginas, secciones y módulos del sistema.
Es la referencia de **qué construir**. Las instrucciones de **cómo trabajar**
están en `CLAUDE.md`.

## Leyenda

- **[BD]** — Dinámico, va en base de datos (CRUD)
- **[BD-CFG]** — Configuración editable (una sola vez)
- **[EST]** — Estático, fijo en el código
- **[SIS]** — Módulo interno del sistema (no público)
- **[EXT]** — Enlace a sistema externo (no se construye)

> Nota para el mockup: aquí no hay base de datos. Las marcas [BD], [SIS], etc.
> indican qué será dinámico en el sistema final, para diseñar cada pantalla
> pensando en cómo se llenará. En el mockup se maquetan con datos de ejemplo.

---

# PARTE 1 — Sitio Público

## / (Inicio)
- Banner / slider hero (imágenes rotativas, título, botón, orden) — [BD]
- Bloque de bienvenida / lema — [BD-CFG]
- Accesos rápidos destacados — [BD]
- Últimas noticias (3–4 recientes) — [BD]
- Próximos eventos (los más cercanos) — [BD]
- Comunicados oficiales recientes — [BD]
- Cifras / datos clave (semestres, etc.) — [BD-CFG]
- Accesos a sistemas externos (matrícula, biblioteca, pagos) — [EXT]
- Enlaces de interés (logos externos) — [BD]
- Menú y layout — [EST]

## /nosotros (La Facultad)
- Reseña histórica — [BD]
- Misión y Visión — [BD]
- Valores / Principios — [BD]
- Objetivos educacionales — [BD]
- Organigrama (imagen o interactivo) — [BD]
- Oferta / fortalezas (biblioteca, cómputo, intercambio, eventos) — [BD]

## /autoridades (Autoridades y Organización)
- Decano — [BD]
- Directora de Escuela — [BD]
- Director de Departamento Académico — [BD]
- Consejo de Facultad — [BD]
- Comités y comisiones (nombre, función, resolución, miembros) — [BD]

## /docentes (Plana Docente)
Listado de docentes — [BD]. Cada docente:
- Nombre completo
- Foto
- Grado académico
- Categoría (principal / asociado / auxiliar / contratado)
- Sede (Abancay / Cotabambas-Tambobamba)
- Correo
- Hoja de vida / enlace

Incluye filtro por sede y categoría — [BD].
**Corrige** el problema del sitio actual: docentes sin nombre ni foto.

## /academico (Información Académica)
- Perfil del ingresante — [BD]
- Perfil del egresado / profesional — [BD]
- Campo ocupacional — [BD]
- Competencias (genéricas / específicas / técnicas) — [BD]
- Malla curricular (imagen/PDF o tabla de cursos por semestre) — [BD]
- Plan de estudios / currículo por competencias — [BD]
- Grado y título — [BD-CFG]

## /noticias (Noticias)
- Listado con paginación (título, imagen, fecha, resumen) — [BD]
- Detalle de noticia `/noticias/:id` (contenido, galería, fecha) — [BD]
- Filtro por fecha / categoría — [BD]

## /eventos (Eventos)
- Listado (título, fecha, hora, lugar, imagen) — [BD]
- Detalle de evento — [BD]
- Separación automática próximos / pasados — [BD]
**Corrige** el "presente año académico" sin fecha del sitio actual.

## /comunicados (Comunicados Oficiales)
- Listado (título, fecha, archivo adjunto PDF) — [BD]
- Detalle de comunicado — [BD]

## /bolsa-trabajo (Bolsa de Trabajo)
Tres tipos, cada uno [BD]: prácticas pre-profesionales, prácticas
profesionales, empleos.
Campos: título, empresa, descripción, enlace, vigencia.
Debe ser un módulo **real**, no solo texto como en el sitio actual.

## /documentos (Repositorio de Documentos)
Categorías, todas [BD]: reglamentos, sílabos, planes/mallas, resoluciones,
documentos de gestión.
Campos: tipo, año, semestre, sede, archivo PDF.
Reemplaza la dependencia de Google Drive.

## /galeria (Galería Fotográfica)
- Álbumes por categoría (instalaciones, eventos, proyección social, alumnos) — [BD]
- Fotos dentro de cada álbum — [BD]

## /posgrado (Posgrado / Maestrías)
- Maestría en Gestión Pública — [BD]
- Maestría en Gestión de Proyectos — [BD]
- (info, admisión, plan de estudios)

## /investigacion (Investigación y Publicaciones)
- Líneas de investigación — [BD]
- Proyectos de investigación — [BD]
- Publicaciones / artículos (título, autor, fecha, archivo/enlace) — [BD]
- Docentes investigadores — [BD]

## /estudiantes (Vida Estudiantil)
- Grupos estudiantiles / Centro Federado (nombre, descripción, logo, contacto) — [BD]
- Estudiantes destacados (nombre, logro, foto, fecha) — [BD]

## /tramites (Trámites)
- Guía de trámites frecuentes — [BD]
- Enlaces a sistemas oficiales (académico, pagos, biblioteca) — [EXT]
- Formatos descargables — [BD]

## /encuestas (Encuestas)
- Listado de encuestas activas (estudiantes, egresados, docentes, empleadores) — [BD]
- Seguimiento al egresado — [BD]

## /convenios (Convenios)
- Listado (institución, tipo, descripción, vigencia, documento) — [BD]

## /faq (Preguntas Frecuentes)
- Listado de preguntas y respuestas (pregunta, respuesta, categoría) — [BD]
- Agrupadas por tema — [BD]
- Además, alimenta y mejora al chatbot IA.

## /contacto (Contacto)
- Datos de contacto (correo, teléfono, dirección, horario) — [BD-CFG]
- Mapa de ubicación — [EST / BD-CFG]
- Formulario de contacto / buzón — [BD]
- Redes sociales — [BD-CFG]

## Páginas legales
- `/privacidad` — Política de privacidad — [BD]
- `/terminos` — Términos y condiciones — [BD]

## Componentes globales (en todas las páginas)
- Cabecera / logo / menú — [EST]
- Buscador interno — [BD]
- Selector de idioma (ES / EN) — [SIS]
- Selector de tema claro / oscuro — [SIS]
- Footer (contacto, redes, enlaces) — [BD-CFG]
- **Chatbot IA flotante** (responde sobre reglamentos, malla, comunicados) — [BD/SIS]
- Botón "ir arriba" / accesibilidad — [EST]

---

# PARTE 2 — Panel de Administración (privado)

Ruta base `/admin`. Secciones:

1. Login / autenticación — [SIS]
2. Dashboard (resumen y estadísticas) — [SIS]
3. Gestión de noticias — [BD]
4. Gestión de eventos — [BD]
5. Gestión de comunicados — [BD]
6. Gestión de docentes — [BD]
7. Gestión de autoridades — [BD]
8. Gestión de bolsa de trabajo — [BD]
9. Gestión de documentos — [BD]
10. Gestión de galería — [BD]
11. Gestión de convenios — [BD]
12. Gestión de encuestas — [BD]
13. Gestión de banners — [BD]
14. Gestión de páginas (nosotros, académico) — [BD]
15. Gestión de investigación — [BD]
16. Gestión de vida estudiantil — [BD]
17. Gestión de trámites — [BD]
18. Gestión de FAQ — [BD]
19. Gestión de enlaces de interés — [BD]
20. Gestión de páginas legales — [BD]
21. Configuración institucional — [BD-CFG]
22. Gestión de usuarios y roles — [SIS]
23. Panel del chatbot: subir documentos RAG (PDFs que alimentan la IA) — [SIS]
24. Registro de actividad / logs (auditoría: quién cambió qué y cuándo) — [SIS]
25. Mensajes recibidos (buzón de contacto) — [BD]

---

# PARTE 3 — Módulos del Sistema (base técnica)

1. Usuarios — [SIS]
2. Roles y permisos (admin / editor) — [SIS]
3. Autenticación (login / logout) — [SIS]
4. Documentos RAG + vectores (chatbot IA) — [SIS]
5. Registro de auditoría / logs — [SIS]
6. Multi-idioma (traducciones) — [SIS]

---

# Funcionalidades Transversales (UX / técnicas)

- Diseño responsive (móvil, tablet, escritorio)
- Tema claro / oscuro
- Multi-idioma (español / inglés)
- Buscador interno global
- SEO (meta etiquetas, sitemap, URLs amigables)
- Accesibilidad (contraste, navegación por teclado)
- Chatbot IA flotante con RAG
- Optimización de imágenes y carga rápida
- Migas de pan (breadcrumbs)
- Paginación en listados largos

---

# Menú de Navegación

**Menú principal:**
- Inicio
- Nosotros → La Facultad, Autoridades, Docentes
- Académico → Perfiles, Malla curricular, Plan de estudios, Investigación
- Noticias
- Eventos
- Comunicados
- Servicios → Bolsa de trabajo, Documentos, Trámites, Encuestas, Convenios
- Vida Estudiantil
- Posgrado
- Galería
- Contacto

**Menú secundario / footer:**
- FAQ
- Política de privacidad
- Términos y condiciones
- Accesos a sistemas externos
- Redes sociales

---

# Conteo

- **Páginas públicas principales:** 19 (+ páginas legales)
- **Panel admin:** 1 sistema con ~25 secciones
- **Dinámico:** ~95% del contenido es autoadministrable

Esto confirma que es un **sistema web real**, no una landing page.

---

# Alcance del Mockup vs Sistema Final

Este mockup maqueta **el sitio público** con datos de ejemplo. El panel de
administración y la base técnica (Parte 2 y 3) son del sistema final; en el
mockup pueden representarse de forma mínima o dejarse fuera según se decida.

**Núcleo sugerido para maquetar primero** (mayor impacto para la demo):
Inicio, Noticias, Eventos, Comunicados, Docentes, Documentos, y el widget
del Chatbot IA. El resto de páginas siguen el mismo patrón visual.