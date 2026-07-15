/**
 * catalog-table.js — motor de listados de catálogo (mockup).
 *
 * Patrón SaaS admin premium: búsqueda con botón, filtros, paginación,
 * tabla con columna ancla y acciones solo-icono coloreadas.
 *
 * Uso:
 *   const table = CatalogTable.mount(rootEl, {
 *     data, searchKeys, filters, columns, pageSize, onEdit
 *   });
 *   table.add(item); table.update(id, patch); table.remove(id);
 *
 * El root debe incluir [data-catalog-search], [data-catalog-search-btn],
 * [data-catalog-clear], [data-catalog-meta], [data-catalog-thead],
 * [data-catalog-body], [data-catalog-empty], [data-catalog-pagination],
 * y opcionalmente [data-filter="<id>"] por cada filtro.
 */
(function () {
  const ICON_EDIT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>';
  const ICON_DELETE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>';
  const ICON_CHEVRON_L =
    '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>';
  const ICON_CHEVRON_R =
    '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>';

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function actionButtons(row, deleteLabel) {
    const name = escapeHtml(deleteLabel(row));
    return `
      <button type="button" class="btn-action btn-action-edit" data-row-edit data-row-id="${escapeHtml(row.id)}" title="Editar" aria-label="Editar">
        ${ICON_EDIT}
      </button>
      <button type="button" class="btn-action btn-action-danger" data-delete-trigger data-delete-name="${name}" data-row-id="${escapeHtml(row.id)}" title="Eliminar" aria-label="Eliminar">
        ${ICON_DELETE}
      </button>`;
  }

  class CatalogTable {
    constructor(root, options) {
      this.root = root;
      this.options = options;
      this.data = [...(options.data || [])];
      this.page = 1;
      this.pageSize = options.pageSize || 5;
      this.query = "";
      this.appliedQuery = "";
      this.filterValues = {};
      (options.filters || []).forEach((f) => {
        this.filterValues[f.id] = "";
      });

      this.searchInput = root.querySelector("[data-catalog-search]");
      this.searchBtn = root.querySelector("[data-catalog-search-btn]");
      this.clearBtn = root.querySelector("[data-catalog-clear]");
      this.metaEl = root.querySelector("[data-catalog-meta]");
      this.theadEl = root.querySelector("[data-catalog-thead]");
      this.tbodyEl = root.querySelector("[data-catalog-body]");
      this.emptyEl = root.querySelector("[data-catalog-empty]");
      this.paginationEl = root.querySelector("[data-catalog-pagination]");
      this.pageSizeSelect = root.querySelector("[data-catalog-page-size]");

      this.bind();
      this.renderChrome();
      this.render();
    }

    bind() {
      if (this.searchBtn) {
        this.searchBtn.addEventListener("click", () => this.applySearch());
      }
      if (this.searchInput) {
        this.searchInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            this.applySearch();
          }
        });
      }
      if (this.clearBtn) {
        this.clearBtn.addEventListener("click", () => this.clearFilters());
      }
      (this.options.filters || []).forEach((f) => {
        const el = this.root.querySelector(`[data-filter="${f.id}"]`);
        if (!el) return;
        el.addEventListener("change", () => {
          this.filterValues[f.id] = el.value;
          this.page = 1;
          this.render();
        });
      });

      this.root.addEventListener("click", (event) => {
        const editBtn = event.target.closest("[data-row-edit]");
        if (editBtn && this.options.onEdit) {
          const row = this.data.find((r) => r.id === editBtn.dataset.rowId);
          if (row) this.options.onEdit(row);
          return;
        }
        const pageBtn = event.target.closest("[data-page]");
        if (pageBtn && !pageBtn.disabled) {
          this.page = Number(pageBtn.dataset.page);
          this.render();
        }
      });

      document.addEventListener("app:delete-confirmed", (event) => {
        const id = event.detail?.id;
        if (!id || !this.data.some((r) => r.id === id)) return;
        this.remove(id);
        if (this.options.onDelete) this.options.onDelete(id);
      });
    }

    applySearch() {
      this.appliedQuery = (this.searchInput?.value || "").trim().toLowerCase();
      this.query = this.appliedQuery;
      this.page = 1;
      this.render();
    }

    clearFilters() {
      if (this.searchInput) this.searchInput.value = "";
      this.appliedQuery = "";
      this.query = "";
      (this.options.filters || []).forEach((f) => {
        this.filterValues[f.id] = "";
        const el = this.root.querySelector(`[data-filter="${f.id}"]`);
        if (el) el.value = "";
      });
      this.page = 1;
      this.render();
    }

    filtered() {
      let rows = [...this.data];
      const q = this.appliedQuery;
      if (q) {
        const keys = this.options.searchKeys || ["nombre"];
        rows = rows.filter((row) =>
          keys.some((key) => String(row[key] ?? "").toLowerCase().includes(q))
        );
      }
      (this.options.filters || []).forEach((f) => {
        const value = this.filterValues[f.id];
        if (!value) return;
        rows = rows.filter((row) => String(f.getValue(row)) === value);
      });
      if (this.options.sort) rows.sort(this.options.sort);
      return rows;
    }

    renderChrome() {
      const cols = this.options.columns || [];
      this.theadEl.innerHTML = `
        <tr>
          ${cols.map((c) => `<th scope="col" class="${c.align === "right" ? "text-right" : ""}">${escapeHtml(c.label)}</th>`).join("")}
          <th scope="col" class="text-right">Acciones</th>
        </tr>`;
    }

    render() {
      const rows = this.filtered();
      const total = rows.length;
      const totalPages = Math.max(1, Math.ceil(total / this.pageSize));
      if (this.page > totalPages) this.page = totalPages;
      const start = (this.page - 1) * this.pageSize;
      const pageRows = rows.slice(start, start + this.pageSize);

      if (this.metaEl) {
        if (total === 0) {
          this.metaEl.textContent = "Sin resultados";
        } else {
          const from = start + 1;
          const to = Math.min(start + this.pageSize, total);
          this.metaEl.textContent = `Mostrando ${from}–${to} de ${total}`;
        }
      }

      this.tbodyEl.innerHTML = "";
      const hasRows = pageRows.length > 0;
      this.emptyEl?.classList.toggle("hidden", hasRows);
      this.root.querySelector("[data-catalog-table-wrap]")?.classList.toggle("hidden", !hasRows);

      const deleteLabel = this.options.deleteLabel || ((r) => r.nombre || r.id);
      const extraActions = this.options.extraActions || (() => "");

      pageRows.forEach((row) => {
        const tr = document.createElement("tr");
        tr.dataset.row = "true";
        tr.dataset.id = row.id;
        const cells = (this.options.columns || [])
          .map((col) => {
            const content = col.render ? col.render(row, escapeHtml) : escapeHtml(row[col.key]);
            const cls = [
              col.primary ? "col-primary" : "",
              col.muted ? "col-muted" : "",
              col.align === "right" ? "text-right" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return `<td class="${cls}">${content}</td>`;
          })
          .join("");
        tr.innerHTML = `
          ${cells}
          <td class="col-actions">
            <div class="catalog-actions">
              ${extraActions(row, escapeHtml)}
              ${actionButtons(row, deleteLabel)}
            </div>
          </td>`;
        this.tbodyEl.appendChild(tr);
      });

      this.renderPagination(totalPages);
    }

    renderPagination(totalPages) {
      if (!this.paginationEl) return;
      const buttons = [];
      buttons.push(
        `<button type="button" class="catalog-page-btn" data-page="${this.page - 1}" aria-label="Anterior" ${this.page <= 1 ? "disabled" : ""}>${ICON_CHEVRON_L}</button>`
      );
      const windowSize = 5;
      let from = Math.max(1, this.page - Math.floor(windowSize / 2));
      let to = Math.min(totalPages, from + windowSize - 1);
      from = Math.max(1, to - windowSize + 1);
      for (let p = from; p <= to; p++) {
        buttons.push(
          `<button type="button" class="catalog-page-btn" data-page="${p}" ${p === this.page ? 'aria-current="page"' : ""}>${p}</button>`
        );
      }
      buttons.push(
        `<button type="button" class="catalog-page-btn" data-page="${this.page + 1}" aria-label="Siguiente" ${this.page >= totalPages ? "disabled" : ""}>${ICON_CHEVRON_R}</button>`
      );

      this.paginationEl.innerHTML = `
        <div class="text-sm text-text-muted">Página ${this.page} de ${totalPages}</div>
        <div class="flex flex-wrap items-center gap-3">
          <label class="inline-flex items-center gap-2 text-sm text-text-muted">
            Filas
            <select data-catalog-page-size class="catalog-select h-8 w-16 py-0">
              ${[5, 8, 10].map((n) => `<option value="${n}" ${n === this.pageSize ? "selected" : ""}>${n}</option>`).join("")}
            </select>
          </label>
          <div class="catalog-page-btns">${buttons.join("")}</div>
        </div>`;

      this.pageSizeSelect = this.paginationEl.querySelector("[data-catalog-page-size]");
      this.pageSizeSelect.addEventListener("change", () => {
        this.pageSize = Number(this.pageSizeSelect.value) || 5;
        this.page = 1;
        this.render();
      });
    }

    add(item) {
      this.data.unshift(item);
      this.page = 1;
      this.render();
    }

    update(id, patch) {
      const idx = this.data.findIndex((r) => r.id === id);
      if (idx === -1) return;
      this.data[idx] = { ...this.data[idx], ...patch };
      this.render();
    }

    remove(id) {
      this.data = this.data.filter((r) => r.id !== id);
      this.render();
    }

    getAll() {
      return [...this.data];
    }

    find(id) {
      return this.data.find((r) => r.id === id);
    }
  }

  window.CatalogTable = {
    mount(root, options) {
      return new CatalogTable(root, options);
    },
    icons: { edit: ICON_EDIT, delete: ICON_DELETE },
    escapeHtml,
  };
})();
