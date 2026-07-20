/**
 * temario-data.js — árbol de temas por ciclo_periodo (profundidad libre).
 */
(function () {
  const SEED_CP301 = [
    { id: "t-101", padre_id: null, orden: 1, tema: "Adaptación a la vida universitaria" },
    { id: "t-102", padre_id: "t-101", orden: 1, tema: "Integración social" },
    { id: "t-103", padre_id: "t-101", orden: 2, tema: "Manejo del tiempo" },
    { id: "t-201", padre_id: null, orden: 2, tema: "Bienestar personal" },
    { id: "t-202", padre_id: "t-201", orden: 1, tema: "Salud y hábitos" },
    { id: "t-203", padre_id: "t-201", orden: 2, tema: "Relaciones interpersonales" },
    { id: "t-301", padre_id: null, orden: 3, tema: "Orientación vocacional" },
  ];

  const SEED_CP302 = [
    { id: "t-401", padre_id: null, orden: 1, tema: "Habilidades de comunicación" },
    { id: "t-402", padre_id: "t-401", orden: 1, tema: "Expresión oral y escrita" },
    { id: "t-403", padre_id: "t-401", orden: 2, tema: "Escucha activa" },
    { id: "t-501", padre_id: null, orden: 2, tema: "Proyecto de vida" },
    { id: "t-502", padre_id: "t-501", orden: 1, tema: "Metas a corto y mediano plazo" },
  ];

  const SEED_CP303 = [
    { id: "t-601", padre_id: null, orden: 1, tema: "Autoconocimiento" },
    { id: "t-602", padre_id: "t-601", orden: 1, tema: "Fortalezas y áreas de mejora" },
  ];

  const SEEDS = { "cp-301": SEED_CP301, "cp-302": SEED_CP302, "cp-303": SEED_CP303 };

  function storageKey(cpId) {
    return `tutortrack-temario-${cpId}`;
  }

  function normalize(nodos) {
    return (nodos || []).map((n) => ({
      id: n.id,
      padre_id: n.padre_id || null,
      orden: Number(n.orden) || 1,
      tema: n.tema || n.texto || "",
    }));
  }

  function load(cpId) {
    try {
      const raw = sessionStorage.getItem(storageKey(cpId));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return normalize(parsed);
      }
    } catch (_) {
      /* ignore */
    }
    const seed = SEEDS[cpId] ? JSON.parse(JSON.stringify(SEEDS[cpId])) : [];
    const nodos = normalize(seed);
    sessionStorage.setItem(storageKey(cpId), JSON.stringify(nodos));
    return nodos;
  }

  function save(cpId, nodos) {
    const clean = normalize(nodos);
    sessionStorage.setItem(storageKey(cpId), JSON.stringify(clean));
    if (window.GestionPeriodoData) {
      const data = GestionPeriodoData.load();
      GestionPeriodoData.syncTemarioCount(data, cpId, clean.length);
    }
    return clean;
  }

  function buildTree(nodos) {
    const byId = {};
    nodos.forEach((n) => {
      byId[n.id] = { ...n, children: [] };
    });
    const roots = [];
    nodos.forEach((n) => {
      if (n.padre_id && byId[n.padre_id]) byId[n.padre_id].children.push(byId[n.id]);
      else roots.push(byId[n.id]);
    });
    const sort = (arr) =>
      arr
        .sort((a, b) => a.orden - b.orden)
        .map((n) => ({ ...n, children: sort(n.children) }));
    return sort(roots);
  }

  function countDescendants(nodos, id) {
    const children = nodos.filter((n) => n.padre_id === id);
    return children.reduce((acc, c) => acc + 1 + countDescendants(nodos, c.id), 0);
  }

  function isDescendant(nodos, ancestorId, maybeChildId) {
    let cur = nodos.find((n) => n.id === maybeChildId);
    while (cur && cur.padre_id) {
      if (cur.padre_id === ancestorId) return true;
      cur = nodos.find((n) => n.id === cur.padre_id);
    }
    return false;
  }

  function reorderSiblings(nodos, padreId) {
    const pid = padreId || null;
    const siblings = nodos
      .filter((n) => (n.padre_id || null) === pid)
      .sort((a, b) => a.orden - b.orden);
    siblings.forEach((s, i) => {
      const idx = nodos.findIndex((n) => n.id === s.id);
      if (idx !== -1) nodos[idx].orden = i + 1;
    });
  }

  function addNodo(nodos, padreId, tema) {
    const pid = padreId || null;
    const siblings = nodos.filter((n) => (n.padre_id || null) === pid);
    const maxOrden = siblings.reduce((m, s) => Math.max(m, s.orden), 0);
    const id = `t-${Date.now()}`;
    nodos.push({ id, padre_id: pid, orden: maxOrden + 1, tema });
    return id;
  }

  function updateNodo(nodos, id, tema) {
    const idx = nodos.findIndex((n) => n.id === id);
    if (idx !== -1) nodos[idx].tema = tema;
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
    const next = nodos.filter((n) => !toRemove.has(n.id));
    const removed = nodos.find((n) => n.id === id);
    if (removed) reorderSiblings(next, removed.padre_id);
    return next;
  }

  /** Reordenar entre hermanos (swap de orden). */
  function moveSibling(nodos, id, direction) {
    const node = nodos.find((n) => n.id === id);
    if (!node) return nodos;
    const siblings = nodos
      .filter((n) => (n.padre_id || null) === (node.padre_id || null))
      .sort((a, b) => a.orden - b.orden);
    const idx = siblings.findIndex((n) => n.id === id);
    const swapWith = direction < 0 ? siblings[idx - 1] : siblings[idx + 1];
    if (!swapWith) return nodos;
    const a = nodos.findIndex((n) => n.id === node.id);
    const b = nodos.findIndex((n) => n.id === swapWith.id);
    const tmp = nodos[a].orden;
    nodos[a].orden = nodos[b].orden;
    nodos[b].orden = tmp;
    return nodos;
  }

  /**
   * Mueve un nodo: nuevo padre + posición entre hermanos (0-based).
   * Si targetParentId === id o es descendiente → no-op.
   */
  function moveNode(nodos, id, newParentId, beforeSiblingId) {
    const node = nodos.find((n) => n.id === id);
    if (!node) return nodos;
    const parent = newParentId || null;
    if (parent === id) return nodos;
    if (parent && isDescendant(nodos, id, parent)) return nodos;

    const oldParent = node.padre_id || null;
    node.padre_id = parent;

    const siblings = nodos
      .filter((n) => n.id !== id && (n.padre_id || null) === parent)
      .sort((a, b) => a.orden - b.orden);

    let insertAt = siblings.length;
    if (beforeSiblingId) {
      const bi = siblings.findIndex((n) => n.id === beforeSiblingId);
      if (bi >= 0) insertAt = bi;
    }
    siblings.splice(insertAt, 0, node);
    siblings.forEach((s, i) => {
      const idx = nodos.findIndex((n) => n.id === s.id);
      if (idx !== -1) nodos[idx].orden = i + 1;
    });
    if (oldParent !== parent) reorderSiblings(nodos, oldParent);
    return nodos;
  }

  window.TemarioData = {
    load,
    save,
    buildTree,
    countDescendants,
    addNodo,
    updateNodo,
    removeSubtree,
    moveSibling,
    moveNode,
    reorderSiblings,
    /* aliases legacy */
    moveUp: (nodos, id) => moveSibling(nodos, id, -1),
    moveDown: (nodos, id) => moveSibling(nodos, id, 1),
  };
})();
