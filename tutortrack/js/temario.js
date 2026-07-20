/**
 * temario.js — editor de árbol (outline) por ciclo_periodo.
 * Query: ?cp=<id>  ·  data-role="docente" en <body> limita a ciclos tutoreados.
 */
(function () {
  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const toast = (msg, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message: msg, type } }));

  const params = new URLSearchParams(location.search);
  const isDocente = document.body.getAttribute("data-role") === "docente";
  /** Ciclos que tutora el docente demo (doc-01). */
  const DOCENTE_CPS = ["cp-301", "cp-303"];

  let cpId = params.get("cp") || "";
  let nodos = [];
  const collapsed = new Set();
  let dragId = null;

  function metaFor(cp) {
    if (window.GestionPeriodoData) {
      const data = GestionPeriodoData.load();
      return GestionPeriodoData.findCicloPeriodoMeta(data, cp);
    }
    return null;
  }

  function resolveCp() {
    if (cpId) return cpId;
    if (isDocente) return DOCENTE_CPS[0];
    if (window.GestionPeriodoData) {
      const data = GestionPeriodoData.load();
      const vig = GestionPeriodoData.periodoVigente(data);
      const rows = GestionPeriodoData.listCicloPeriodos(data, vig?.id);
      return rows[0]?.id || "cp-301";
    }
    return "cp-301";
  }

  function renderHeader() {
    const meta = metaFor(cpId);
    const ciclo = meta?.ciclo?.nombre || "Ciclo";
    const periodo = meta?.periodo?.nombre || "";
    const title = document.getElementById("page-title");
    const bc = document.getElementById("bc-ciclo");
    if (title) title.textContent = periodo ? `Temario — ${ciclo} · ${periodo}` : `Temario — ${ciclo}`;
    if (bc) bc.textContent = ciclo;

    const back = document.getElementById("btn-volver");
    if (back && !isDocente) {
      back.href = "gestion-periodo.html";
      back.classList.remove("hidden");
    }

    const sel = document.getElementById("sel-cp-docente");
    if (sel && isDocente && window.GestionPeriodoData) {
      const data = GestionPeriodoData.load();
      sel.innerHTML = DOCENTE_CPS.map((id) => {
        const m = GestionPeriodoData.findCicloPeriodoMeta(data, id);
        const label = m
          ? `${m.ciclo?.nombre || id} · ${m.periodo?.nombre || ""}`
          : id;
        return `<option value="${esc(id)}" ${id === cpId ? "selected" : ""}>${esc(label)}</option>`;
      }).join("");
      sel.classList.remove("hidden");
    }
  }

  function persist() {
    nodos = TemarioData.save(cpId, nodos);
  }

  function render() {
    nodos = TemarioData.load(cpId);
    const tree = TemarioData.buildTree(nodos);
    const container = document.getElementById("tree-container");
    const empty = document.getElementById("tree-empty");
    if (!tree.length) {
      container.innerHTML = "";
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");
    container.innerHTML = `<div class="temario-tree">${renderNodes(tree, [])}</div>`;
  }

  function renderNodes(nodes, prefix) {
    return nodes
      .map((node, i) => {
        const num = [...prefix, i + 1].join(".");
        const hasChildren = node.children && node.children.length > 0;
        const isCollapsed = collapsed.has(node.id);
        const childrenHtml = hasChildren
          ? `<div class="temario-children ${isCollapsed ? "is-collapsed" : ""}" data-children-of="${esc(
              node.id
            )}">${renderNodes(node.children, [...prefix, i + 1])}</div>`
          : "";

        return `
        <div
          class="temario-node"
          data-node-id="${esc(node.id)}"
          draggable="true"
        >
          <div class="temario-row">
            <span class="temario-handle" title="Arrastrar" aria-label="Arrastrar para reordenar" data-drag-handle>
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
            </span>
            <button type="button" class="temario-toggle ${hasChildren ? "" : "is-leaf"}" data-toggle="${esc(
              node.id
            )}" aria-label="${isCollapsed ? "Expandir" : "Colapsar"}" aria-expanded="${
          hasChildren && !isCollapsed
        }">
              <svg class="h-3.5 w-3.5 transition-transform ${isCollapsed ? "" : "rotate-90"}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
            </button>
            <span class="temario-num">${esc(num)}</span>
            <span class="temario-text">${esc(node.tema)}</span>
            <div class="temario-actions">
              <button type="button" class="btn-ghost btn-icon-xs" data-edit="${esc(node.id)}" title="Editar" aria-label="Editar tema">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/></svg>
              </button>
              <button type="button" class="btn-ghost btn-icon-xs text-primary" data-add-child="${esc(
                node.id
              )}" title="Agregar subtema" aria-label="Agregar subtema">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
              </button>
              <button type="button" class="btn-ghost btn-icon-xs text-danger" data-del="${esc(
                node.id
              )}" title="Eliminar" aria-label="Eliminar tema">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>
              </button>
            </div>
          </div>
          ${childrenHtml}
        </div>`;
      })
      .join("");
  }

  function openModal(editId, padreId) {
    document.getElementById("modal-tema-title").textContent = editId
      ? "Editar tema"
      : padreId
        ? "Nuevo subtema"
        : "Nuevo tema";
    document.getElementById("tema-editing-id").value = editId || "";
    document.getElementById("tema-padre-id").value = padreId || "";
    const nodo = editId ? nodos.find((n) => n.id === editId) : null;
    document.getElementById("tema-texto").value = nodo ? nodo.tema : "";
    const bd = document.getElementById("modal-tema-backdrop");
    bd.classList.remove("hidden");
    bd.classList.add("flex");
    document.getElementById("tema-texto").focus();
  }

  function closeModal() {
    const bd = document.getElementById("modal-tema-backdrop");
    bd.classList.add("hidden");
    bd.classList.remove("flex");
  }

  function askDelete(id) {
    const desc = TemarioData.countDescendants(nodos, id);
    const nodo = nodos.find((n) => n.id === id);
    const msg =
      desc > 0
        ? `<p>Se eliminará <strong class="text-text">${esc(nodo?.tema || "este tema")}</strong> y sus <strong>${desc}</strong> subtema(s).</p>`
        : `<p>¿Eliminar <strong class="text-text">${esc(nodo?.tema || "este tema")}</strong>?</p>`;
    return AppConfirm.request({
      title: "Eliminar tema",
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      variant: "danger",
      messageHtml: msg,
    }).then((ok) => {
      if (!ok) return;
      nodos = TemarioData.removeSubtree(nodos, id);
      persist();
      render();
      toast("Tema eliminado");
    });
  }

  function bindTreeEvents(container) {
    container.addEventListener("click", (e) => {
      const toggle = e.target.closest("[data-toggle]");
      if (toggle && !toggle.classList.contains("is-leaf")) {
        const id = toggle.getAttribute("data-toggle");
        if (collapsed.has(id)) collapsed.delete(id);
        else collapsed.add(id);
        render();
        return;
      }
      const edit = e.target.closest("[data-edit]");
      if (edit) {
        openModal(edit.getAttribute("data-edit"), null);
        return;
      }
      const add = e.target.closest("[data-add-child]");
      if (add) {
        openModal(null, add.getAttribute("data-add-child"));
        return;
      }
      const del = e.target.closest("[data-del]");
      if (del) askDelete(del.getAttribute("data-del"));
    });

    container.addEventListener("dragstart", (e) => {
      const node = e.target.closest("[data-node-id]");
      if (!node || !e.target.closest("[data-drag-handle], [data-node-id]")) return;
      if (!e.target.closest("[data-drag-handle]") && e.target.closest("button")) {
        e.preventDefault();
        return;
      }
      dragId = node.getAttribute("data-node-id");
      node.classList.add("is-dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", dragId);
    });

    container.addEventListener("dragend", () => {
      dragId = null;
      container.querySelectorAll(".is-dragging, .is-drop-target").forEach((el) => {
        el.classList.remove("is-dragging", "is-drop-target");
      });
    });

    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      const node = e.target.closest("[data-node-id]");
      container.querySelectorAll(".is-drop-target").forEach((el) => el.classList.remove("is-drop-target"));
      if (node && node.getAttribute("data-node-id") !== dragId) node.classList.add("is-drop-target");
    });

    container.addEventListener("drop", (e) => {
      e.preventDefault();
      const target = e.target.closest("[data-node-id]");
      container.querySelectorAll(".is-drop-target").forEach((el) => el.classList.remove("is-drop-target"));
      if (!target || !dragId) return;
      const targetId = target.getAttribute("data-node-id");
      if (targetId === dragId) return;

      const rect = target.querySelector(".temario-row")?.getBoundingClientRect();
      const mid = rect ? rect.top + rect.height / 2 : 0;
      /* mitad superior = hermano antes; mitad inferior = hijo del target */
      if (rect && e.clientY < mid) {
        const tNode = nodos.find((n) => n.id === targetId);
        TemarioData.moveNode(nodos, dragId, tNode?.padre_id || null, targetId);
      } else {
        TemarioData.moveNode(nodos, dragId, targetId, null);
      }
      persist();
      render();
      toast("Temario reordenado");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.TemarioData) return;
    cpId = resolveCp();
    renderHeader();
    render();

    const container = document.getElementById("tree-container");
    bindTreeEvents(container);

    document.getElementById("btn-add-raiz")?.addEventListener("click", () => openModal(null, null));

    document.getElementById("sel-cp-docente")?.addEventListener("change", (e) => {
      cpId = e.target.value;
      const url = new URL(location.href);
      url.searchParams.set("cp", cpId);
      history.replaceState(null, "", url);
      renderHeader();
      render();
    });

    document.getElementById("form-tema")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const tema = document.getElementById("tema-texto").value.trim();
      const editId = document.getElementById("tema-editing-id").value;
      const padreId = document.getElementById("tema-padre-id").value || null;
      if (!tema) {
        toast("Ingresa el texto del tema", "warning");
        return;
      }
      if (editId) TemarioData.updateNodo(nodos, editId, tema);
      else TemarioData.addNodo(nodos, padreId, tema);
      persist();
      closeModal();
      render();
      toast(editId ? "Tema actualizado" : "Tema agregado");
    });

    document.getElementById("btn-tema-cancelar")?.addEventListener("click", closeModal);
    document.getElementById("modal-tema-backdrop")?.addEventListener("click", (e) => {
      if (e.target.id === "modal-tema-backdrop") closeModal();
    });
  });
})();
