/**
 * site-paths.js — ruta base según la profundidad de la página actual.
 *
 * Los componentes (header, footer) generan enlaces internos relativos.
 * index.html vive en la raíz; las páginas viven en /pages/. Como el
 * mockup debe poder abrirse con file:// (sin servidor), no se pueden
 * usar rutas absolutas ("/pages/..."): en file:// eso apunta a la raíz
 * del disco, no del proyecto. Esta función resuelve el prefijo correcto
 * ("" en la raíz, "../" dentro de /pages/") para que los mismos enlaces
 * funcionen en cualquier página, con file:// o con Live Server.
 */
function getBasePath() {
  return window.location.pathname.includes("/pages/") ? "../" : "";
}

window.getBasePath = getBasePath;
