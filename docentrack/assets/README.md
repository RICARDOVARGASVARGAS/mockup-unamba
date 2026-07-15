# Assets — DocenTrack

Carpeta de recursos visuales del proyecto (logos, íconos, imágenes).
Cada proyecto del workspace tiene su propia carpeta `assets/` — no se
comparten archivos entre `pagina-web/`, `docentrack/` y `tutortrack/`.

## Estructura

```
assets/
├── img/
│   └── facultad/
│       ├── logo_universidad.jpg   # Escudo / sello UNAMBA
│       ├── logo_universidad.ico   # Favicon
│       └── logo_facultad.jpg      # Logo Facultad de Administración
└── icons/                         # Íconos propios del producto (opcionales)
```

## Qué poner aquí

| Archivo sugerido | Uso |
|------------------|-----|
| `logo_universidad.jpg` / `.png` / `.svg` | Cabeceras, login, pie |
| `logo_facultad.jpg` / `.png` / `.svg` | Marca de la facultad en admin/kiosko |
| `logo_universidad.ico` | Favicon del navegador |
| Otros logos / sellos | Subcarpetas nuevas según necesidad |

Puedes **reemplazar** los archivos actuales (copiados como punto de
partida desde `pagina-web/assets/`) por versiones oficiales de mayor
resolución o SVG. Mantén los mismos nombres si no quieres tocar el HTML.

## Convención de rutas

Desde pantallas en la raíz del proyecto: `assets/img/facultad/...`  
Desde `/pages/admin/` o `/pages/kiosko/`: `../../assets/img/facultad/...`  
En Custom Elements: usar `getBasePath()` + `assets/img/facultad/...`.
