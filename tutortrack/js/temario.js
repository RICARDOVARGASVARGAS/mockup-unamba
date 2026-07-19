/**
 * temario.js — árbol editable de temas para un ciclo×período (M2-4).
 * Recibe ?cp=<id>&ciclo=<nombre>&periodo=<nombre> por query string.
 */
(function () {
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const toast = (msg, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message: msg, type } }));

  const params      = new URLSearchParams(window.location.search);
  const CP_ID       = params.get("cp") || "cp-301";
  const CICLO_NOMBRE   = params.get("ciclo")   || "1° Ciclo";
  const PERIODO_NOMBRE = params.get("periodo") || "2026-I";

  let nodos = [];
  let _elimId = null;

  /* ------------------------------------------------------------------ */
  /* Render árbol                                                         */
  /* ------------------------------------------------------------------ */

  function render() {
    nodos = TemarioData.load(CP_ID);
    const tree = TemarioData.buildTree(nodos);
    const container = document.getElementById("tree-container");
    const empty     = document.getElementById("tree-empty");

    if (!tree.length) {
      container.innerHTML = "";
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");
    container.innerHTML = renderNodes(tree, [], 0);
    bindTreeButtons();
  }

  function renderNodes(nodes, prefix, depth) {
    return nodes
      .map((node, i) => {
        const num = [...prefix, i + 1].join(".");
        const hasChildren = node.children && node.children.length > 0;
        const indent = depth * 20;

        const childrenHtml = hasChildren
          ? `<div class="mt-1 space-y-1">${renderNodes(node.children, [...prefix, i + 1], depth + 1)}</div>`
          : "";

        const subtemas = TemarioData.countDescendants(nodos, node.id);

        return `
        <div class="rounded-md border border-border bg-surface" style="margin-left:${indent}px">
          <div class="flex items-center gap-2 px-3 py-2.5">
            <span class="shrink-0 min-w-[2rem] text-xs font-mono font-semibold text-text-muted">${esc(num)}</span>
            <span class="flex-1 text-sm font-medium text-text leading-snug">${esc(node.texto)}</span>
            <div class="flex shrink-0 items-center gap-1">
              <button type="button" class="btn-ghost btn-icon-xs" data-move-up="${esc(node.id)}" title="Subir" aria-label="Subir">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75 12 8.25l7.5 7.5" />
                </svg>
              </button>
              <button type="button" class="btn-ghost btn-icon-xs" data-move-down="${esc(node.id)}" title="Bajar" aria-label="Bajar">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <button type="button" class="btn-ghost btn-icon-xs text-primary" data-edit-tema="${esc(node.id)}" title="Editar" aria-label="Editar">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                </svg>
              </button>
              <button type="button" class="btn-ghost btn-icon-xs text-primary" data-add-subtema="${esc(node.id)}" title="Agregar subtema" aria-label="Agregar subtema">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
              <button type="button" class="btn-ghost btn-icon-xs text-danger" data-del-tema="${esc(node.id)}" data-desc="${subtemas}" title="Eliminar" aria-label="Eliminar">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916" />
                </svg>
              </button>
            </div>
          </div>
          ${childrenHtml ? `<div class="border-t border-border pb-2 pr-2 pt-1">${childrenHtml}</div>` : ""}
        </div>`;
      })
      .join("");
  }

  function bindTreeButtons() {
    document.querySelectorAll("[data-move-up]").forEach((btn) => {
      btn.addEventListener("click", () => {
        nodos = TemarioData.moveUp(nodos, btn.dataset.moveUp);
        TemarioData.save(CP_ID, nodos);
        render();
      });
    });

    document.querySelectorAll("[data-move-down]").forEach((btn) => {
      btn.addEventListener("click", () => {
        nodos = TemarioData.moveDown(nodos, btn.dataset.moveDown);
        TemarioData.save(CP_ID, nodos);
        render();
      });
    });

    document.querySelectorAll("[data-edit-tema]").forEach((btn) => {
      btn.addEventListener("click", () => openModal(btn.dataset.editTema, null));
    });

    document.querySelectorAll("[data-add-subtema]").forEach((btn) => {
      btn.addEventListener("click", () => openModal(null, btn.dataset.addSubtema));
    });

    document.querySelectorAll("[data-del-tema]").forEach((btn) => {
      btn.addEventListener("click", () => {
        _elimId = btn.dataset.delTema;
        const desc = parseInt(btn.dataset.desc, 10);
        const msg = desc > 0
          ? `Este tema tiene ${desc} subtema${desc > 1 ? "s" : ""}. ¿Eliminar todo el árbol?`
          : "¿Eliminar este tema?";
        document.getElementById("modal-elim-msg").textContent = msg;
        const bd = document.getElementById("modal-elim-backdrop");
        bd.classList.remove("hidden");
        bd.classList.add("flex");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Modal tema                                                           */
  /* ------------------------------------------------------------------ */

  function openModal(editId, padreId) {
    const isEdit = Boolean(editId);
    document.getElementById("modal-tema-title").textContent = isEdit
      ? "Editar tema"
      : padreId
      ? "Nuevo subtema"
      : "Nuevo tema raíz";
    document.getElementById("tema-editing-id").value = editId || "";
    document.getElementById("tema-padre-id").value  = padreId || "";
    const nodo = isEdit ? nodos.find((n) => n.id === editId) : null;
    document.getElementById("tema-texto").value = nodo ? nodo.texto : "";

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

  /* ------------------------------------------------------------------ */
  /* Init                                                                 */
  /* ------------------------------------------------------------------ */

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.TemarioData) return;

    /* Breadcrumb + título */
    document.getElementById("bc-ciclo").textContent = CICLO_NOMBRE;
    document.getElementById("page-title").textContent = `Temario — ${CICLO_NOMBRE} · ${PERIODO_NOMBRE}`;

    render();

    /* Botón raíz */
    document.getElementById("btn-add-raiz").addEventListener("click", () => openModal(null, null));

    /* Form tema */
    document.getElementById("form-tema").addEventListener("submit", (e) => {
      e.preventDefault();
      const texto   = document.getElementById("tema-texto").value.trim();
      const editId  = document.getElementById("tema-editing-id").value;
      const padreId = document.getElementById("tema-padre-id").value || null;
      if (!texto) { toast("Ingresa el texto del tema", "warning"); return; }

      if (editId) {
        TemarioData.updateNodo(nodos, editId, texto);
      } else {
        TemarioData.addNodo(nodos, padreId, texto);
      }
      TemarioData.save(CP_ID, nodos);
      closeModal();
      render();
      toast("Tema guardado");
    });

    document.getElementById("btn-tema-cancelar").addEventListener("click", closeModal);
    document.getElementById("modal-tema-backdrop").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeModal();
    });

    /* Modal eliminar */
    document.getElementById("btn-elim-cancelar").addEventListener("click", () => {
      const bd = document.getElementById("modal-elim-backdrop");
      bd.classList.add("hidden");
      bd.classList.remove("flex");
    });
    document.getElementById("btn-elim-confirmar").addEventListener("click", () => {
      if (!_elimId) return;
      nodos = TemarioData.removeSubtree(nodos, _elimId);
      TemarioData.save(CP_ID, nodos);
      _elimId = null;
      const bd = document.getElementById("modal-elim-backdrop");
      bd.classList.add("hidden");
      bd.classList.remove("flex");
      render();
      toast("Tema eliminado");
    });
    document.getElementById("modal-elim-backdrop").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) {
        e.currentTarget.classList.add("hidden");
        e.currentTarget.classList.remove("flex");
      }
    });
  });
})();
