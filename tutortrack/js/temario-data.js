/**
 * temario-data.js — seed del árbol de temas por ciclo×período.
 * Estructura: adjacency list con padre_id (null = raíz).
 * Almacenado en sessionStorage con clave por ciclo_periodo_id.
 */
(function () {
  /* Árbol ejemplo para cp-301 (1° Ciclo — 2026-I) */
  const SEED_CP301 = [
    { id: "t-101", padre_id: null,   orden: 1, texto: "Adaptación a la vida universitaria" },
    { id: "t-102", padre_id: "t-101", orden: 1, texto: "Integración a la comunidad universitaria" },
    { id: "t-103", padre_id: "t-101", orden: 2, texto: "Manejo del tiempo y organización académica" },
    { id: "t-201", padre_id: null,   orden: 2, texto: "Bienestar personal y social" },
    { id: "t-202", padre_id: "t-201", orden: 1, texto: "Salud mental y manejo del estrés" },
    { id: "t-203", padre_id: "t-201", orden: 2, texto: "Relaciones interpersonales" },
    { id: "t-301", padre_id: null,   orden: 3, texto: "Orientación vocacional y profesional" },
  ];

  const SEED_CP302 = [
    { id: "t-401", padre_id: null,   orden: 1, texto: "Habilidades de comunicación" },
    { id: "t-402", padre_id: "t-401", orden: 1, texto: "Expresión oral y escrita" },
    { id: "t-403", padre_id: "t-401", orden: 2, texto: "Escucha activa" },
    { id: "t-501", padre_id: null,   orden: 2, texto: "Proyecto de vida" },
    { id: "t-502", padre_id: "t-501", orden: 1, texto: "Metas a corto y mediano plazo" },
  ];

  const SEEDS = {
    "cp-301": SEED_CP301,
    "cp-302": SEED_CP302,
  };

  function storageKey(cpId) {
    return `tutortrack-temario-${cpId}`;
  }

  function load(cpId) {
    try {
      const raw = sessionStorage.getItem(storageKey(cpId));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) { /* ignore */ }
    const seed = SEEDS[cpId] ? JSON.parse(JSON.stringify(SEEDS[cpId])) : [];
    sessionStorage.setItem(storageKey(cpId), JSON.stringify(seed));
    return seed;
  }

  function save(cpId, nodos) {
    sessionStorage.setItem(storageKey(cpId), JSON.stringify(nodos));
  }

  function buildTree(nodos) {
    const byId = {};
    nodos.forEach((n) => { byId[n.id] = { ...n, children: [] }; });
    const roots = [];
    nodos.forEach((n) => {
      if (n.padre_id && byId[n.padre_id]) {
        byId[n.padre_id].children.push(byId[n.id]);
      } else {
        roots.push(byId[n.id]);
      }
    });
    const sort = (arr) => arr.sort((a, b) => a.orden - b.orden).map((n) => ({ ...n, children: sort(n.children) }));
    return sort(roots);
  }

  function countDescendants(nodos, id) {
    const children = nodos.filter((n) => n.padre_id === id);
    return children.reduce((acc, c) => acc + 1 + countDescendants(nodos, c.id), 0);
  }

  /* Reorder siblings after move: recompute orden 1..n */
  function reorderSiblings(nodos, padreId) {
    const siblings = nodos
      .filter((n) => n.padre_id === (padreId || null))
      .sort((a, b) => a.orden - b.orden);
    siblings.forEach((s, i) => {
      const idx = nodos.findIndex((n) => n.id === s.id);
      if (idx !== -1) nodos[idx].orden = i + 1;
    });
  }

  function moveUp(nodos, id) {
    const node = nodos.find((n) => n.id === id);
    if (!node || node.orden <= 1) return nodos;
    const siblings = nodos
      .filter((n) => n.padre_id === (node.padre_id || null))
      .sort((a, b) => a.orden - b.orden);
    const idx = siblings.findIndex((n) => n.id === id);
    if (idx <= 0) return nodos;
    const prev = siblings[idx - 1];
    const nodeIdx = nodos.findIndex((n) => n.id === node.id);
    const prevIdx = nodos.findIndex((n) => n.id === prev.id);
    nodos[nodeIdx].orden = prev.orden;
    nodos[prevIdx].orden = node.orden;
    return nodos;
  }

  function moveDown(nodos, id) {
    const node = nodos.find((n) => n.id === id);
    if (!node) return nodos;
    const siblings = nodos
      .filter((n) => n.padre_id === (node.padre_id || null))
      .sort((a, b) => a.orden - b.orden);
    const idx = siblings.findIndex((n) => n.id === id);
    if (idx >= siblings.length - 1) return nodos;
    const next = siblings[idx + 1];
    const nodeIdx = nodos.findIndex((n) => n.id === node.id);
    const nextIdx = nodos.findIndex((n) => n.id === next.id);
    nodos[nodeIdx].orden = next.orden;
    nodos[nextIdx].orden = node.orden;
    return nodos;
  }

  function addNodo(nodos, padreId, texto) {
    const siblings = nodos.filter((n) => n.padre_id === (padreId || null));
    const maxOrden = siblings.reduce((m, s) => Math.max(m, s.orden), 0);
    const id = `t-${Date.now()}`;
    nodos.push({ id, padre_id: padreId || null, orden: maxOrden + 1, texto });
    return id;
  }

  function updateNodo(nodos, id, texto) {
    const idx = nodos.findIndex((n) => n.id === id);
    if (idx !== -1) nodos[idx].texto = texto;
  }

  function removeSubtree(nodos, id) {
    const toRemove = new Set([id]);
    let changed = true;
    while (changed) {
      changed = false;
      nodos.forEach((n) => {
        if (n.padre_id && toRemove.has(n.padre_id) && !toRemove.has(n.id)) {
          toRemove.add(n.id);
          changed = true;
        }
      });
    }
    return nodos.filter((n) => !toRemove.has(n.id));
  }

  window.TemarioData = {
    load,
    save,
    buildTree,
    countDescendants,
    addNodo,
    updateNodo,
    moveUp,
    moveDown,
    removeSubtree,
    reorderSiblings,
  };
})();
