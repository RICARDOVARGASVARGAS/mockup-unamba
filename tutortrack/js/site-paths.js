/**
 * site-paths.js — ruta base según la profundidad de la página actual.
 *
 * index.html (login) vive en la raíz del proyecto; TODAS las páginas
 * de las 4 secciones (/pages/admin/, /pages/docente/, /pages/estudiante/,
 * /pages/receptor/) están a la misma profundidad: dos niveles bajo la
 * raíz. Como el mockup debe poder abrirse con file:// (sin servidor),
 * no se pueden usar rutas absolutas ("/pages/..."): en file:// eso
 * apunta a la raíz del disco, no del proyecto. Esta función resuelve
 * el prefijo correcto para que los mismos enlaces funcionen en
 * cualquier página, con file:// o con Live Server.
 */
function getBasePath() {
  return window.location.pathname.includes("/pages/") ? "../../" : "";
}

window.getBasePath = getBasePath;
