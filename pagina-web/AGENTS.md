# AGENTS.md — Guía para agentes de Cursor

Mockup visual de la web institucional de la Facultad de Administración UNAMBA.
HTML + Tailwind CDN + JS mínimo. Sin backend.

## Documentación del proyecto

| Archivo | Para qué consultarlo |
|---------|----------------------|
| `CLAUDE.md` | Guía completa del proyecto (rol, arquitectura, reglas) |
| `docs/AGENTE-ROL.md` | Mandato del agente (UI/UX + front + dominio) |
| `docs/ESPECIFICACION.md` | Qué páginas y secciones existen, menú, alcance mockup |
| `docs/PALETA.md` | Tokens de diseño: colores, tipografía, espaciado, breakpoints |

## Reglas de Cursor (`.cursor/rules/`)

| Regla | Cuándo aplica |
|-------|---------------|
| `mockup-proyecto.mdc` | Siempre — identidad, stack, estructura, prohibiciones |
| `diseno-tokens.mdc` | Al editar CSS o HTML — variables, modo oscuro, paleta |
| `componentes.mdc` | Al editar `/components/` o `/js/` — inyección, rutas |
| `paginas-mockup.mdc` | Al crear/editar páginas — especificación, plantilla |
| `ui-ux.mdc` | Al maquetar HTML — responsive, accesibilidad, patrones |

## Flujo de trabajo recomendado

1. **Nueva página** → Leer sección en `docs/ESPECIFICACION.md` → Copiar plantilla de `paginas-mockup.mdc` → Incluir `<site-header>`, `<site-footer>`, `<chatbot-widget>`
2. **Nuevo componente** → Crear en `/components/` como custom element → Registrar con `customElements.define` → Usar `getBasePath()` para enlaces
3. **Cambio de color/tipografía** → Solo en `css/tokens.css` (nunca hardcodear en HTML)
4. **Nuevo módulo de listado** → Seguir patrón de tarjetas existente con imagen, título, metadatos y paginación visual

## Archivos clave del código

```
css/tokens.css          → Variables CSS (única fuente de verdad de diseño)
css/base.css            → Estilos base globales
js/tailwind-config.js   → Tailwind apunta a variables CSS
js/site-paths.js        → Rutas relativas para file:// y Live Server
js/theme.js             → Alternancia claro/oscuro vía [data-theme]
components/header.js    → Cabecera y menú de navegación
components/footer.js    → Pie de página
components/chatbot-widget.js → Widget flotante del chatbot
index.html              → Página de inicio (por maquetar)
pages/                  → Resto de páginas del mockup
```

## Restricciones críticas

- Repo 100% autónomo — no asumir otros proyectos
- Sin backend, BD ni frameworks pesados
- Colores solo vía variables CSS
- Componentes globales centralizados, nunca copiados
- Contenido real de la especificación o placeholders `[PLACEHOLDER]`
- Abrir con `file://` debe funcionar (rutas relativas)

## Estado actual

Fundación lista: tokens, tema, Tailwind, header, footer, chatbot.
Páginas públicas pendientes de maquetar (prioridad: Inicio, Noticias, Eventos, Comunicados, Docentes, Documentos).
