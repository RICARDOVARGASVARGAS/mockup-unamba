/**
 * catalog-table.js — motor de listados de catálogo (mockup).
 *
 * Patrón SaaS admin premium: búsqueda con botón, filtros, paginación,
 * tabla con columna ancla y acciones solo-icono coloreadas.
 *
 * Uso:
 *   const table = CatalogTable.mount(rootEl, {
 *     data, searchKeys, filters, columns, pageSize, onEdit,
 *     initialSortKey, initialSortDir  // opcional; columnas sortable por defecto
 *   });
 *   // Clic en encabezado ordena asc/desc. Columna: { sortable: false } para desactivar.
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
  const ICON_VIEW =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>';
  const ICON_RESET_PASSWORD =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" /></svg>';
  const ICON_HISTORY =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>';
  const ICON_CHEVRON_L =
    '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>';
  const ICON_CHEVRON_R =
    '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>';
  const ICON_SORT =
    '<svg class="catalog-sort-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4.5 5.5 8 2l3.5 3.5h-7Zm0 5L8 14l3.5-3.5h-7Z" opacity=".35"/><path data-up d="M4.5 5.5 8 2l3.5 3.5h-7Z"/><path data-down d="M4.5 10.5 8 14l3.5-3.5h-7Z"/></svg>';
  const ICON_MORE =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.75"/><circle cx="12" cy="12" r="1.75"/><circle cx="19" cy="12" r="1.75"/></svg>';

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function defaultSortValue(row, key) {
    const value = row?.[key];
    if (value == null) return "";
    if (typeof value === "boolean") return value ? 1 : 0;
    if (typeof value === "number") return value;
    if (Array.isArray(value)) return value.length;
    return String(value).toLowerCase();
  }

  function compareValues(a, b) {
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b), "es", { numeric: true, sensitivity: "base" });
  }

  function closeOverflowMenus(except) {
    document.querySelectorAll("[data-overflow-menu].is-open").forEach((menu) => {
      if (except && menu === except) return;
      menu.classList.remove("is-open");
      const panel = menu.querySelector("[data-overflow-panel]");
      if (panel) panel.hidden = true;
      menu.querySelector("[data-overflow-trigger]")?.setAttribute("aria-expanded", "false");
    });
  }

  let overflowDocBound = false;

  function overflowMenuHtml(row, options) {
    const id = escapeHtml(row.id);
    const extras =
      typeof options.overflowExtra === "function" ? options.overflowExtra(row, escapeHtml) || [] : [];
    const items = [];

    if (options.onResetPassword) {
      items.push({
        action: "reset-password",
        label: "Restablecer contraseña",
        icon: ICON_RESET_PASSWORD,
      });
    }
    if (options.auditTable) {
      items.push({
        action: "history",
        label: "Auditoría",
        icon: ICON_HISTORY,
      });
    }
    extras.forEach((ex) => {
      if (!ex || !ex.label) return;
      items.push({
        action: ex.action || "extra",
        label: ex.label,
        icon: ex.icon || "",
        extraId: ex.id || "",
      });
    });

    if (!items.length) return "";

    const list = items
      .map(
        (it) => `
      <button
        type="button"
        class="catalog-overflow-item"
        data-overflow-action="${escapeHtml(it.action)}"
        data-overflow-extra="${escapeHtml(it.extraId || "")}"
        data-row-id="${id}"
        role="menuitem"
      >
        ${it.icon ? `<span class="catalog-overflow-icon" aria-hidden="true">${it.icon}</span>` : ""}
        <span>${escapeHtml(it.label)}</span>
      </button>`
      )
      .join("");

    return `
      <div class="catalog-overflow" data-overflow-menu>
        <button
          type="button"
          class="btn-action btn-action-more"
          data-overflow-trigger
          data-row-id="${id}"
          title="Más acciones"
          aria-label="Más acciones"
          aria-haspopup="menu"
          aria-expanded="false"
        >
          ${ICON_MORE}
        </button>
        <div class="catalog-overflow-panel" data-overflow-panel role="menu" hidden>
          ${list}
        </div>
      </div>`;
  }

  function actionButtons(row, deleteLabel, options) {
    const name = escapeHtml(deleteLabel(row));
    const id = escapeHtml(row.id);
    const useOverflow = Boolean(options.overflowMenu);
    const viewBtn = options.onView
      ? `<button type="button" class="btn-action btn-action-view" data-row-view data-row-id="${id}" title="Ver ficha" aria-label="Ver ficha">
        ${ICON_VIEW}
      </button>`
      : "";
    const resetBtn =
      !useOverflow && options.onResetPassword
        ? `<button type="button" class="btn-action btn-action-accent" data-row-reset-password data-row-id="${id}" title="Restablecer contraseña" aria-label="Restablecer contraseña">
        ${ICON_RESET_PASSWORD}
      </button>`
        : "";
    const historyBtn =
      !useOverflow && options.auditTable
        ? `<button type="button" class="btn-action btn-action-history" data-row-history data-row-id="${id}" title="Historial" aria-label="Historial">
        ${ICON_HISTORY}
      </button>`
        : "";
    const deleteBtn = options.onDeleteAsk
      ? `<button type="button" class="btn-action btn-action-danger" data-row-delete-ask data-row-id="${id}" title="Eliminar" aria-label="Eliminar">
        ${ICON_DELETE}
      </button>`
      : `<button type="button" class="btn-action btn-action-danger" data-delete-trigger data-delete-name="${name}" data-row-id="${id}" title="Eliminar" aria-label="Eliminar">
        ${ICON_DELETE}
      </button>`;
    const overflow = useOverflow ? overflowMenuHtml(row, options) : "";
    return `
      ${viewBtn}
      <button type="button" class="btn-action btn-action-edit" data-row-edit data-row-id="${id}" title="Editar" aria-label="Editar">
        ${ICON_EDIT}
      </button>
      ${resetBtn}
      ${historyBtn}
      ${deleteBtn}
      ${overflow}`;
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

      /* Ordenamiento por columna (clic en encabezado) */
      this.sortKey = options.initialSortKey ?? null;
      this.sortDir = options.initialSortDir === "desc" ? "desc" : "asc";

      this.options.auditTable =
        options.auditTable || root.getAttribute("data-audit-table") || "";

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
      this.render();
    }

    historyLabel(row) {
      if (typeof this.options.historyLabel === "function") {
        return this.options.historyLabel(row);
      }
      const del = this.options.deleteLabel;
      if (typeof del === "function") return del(row);
      return row.nombre || row.id;
    }

    logAudit(accion, registroId, anteriores, nuevos) {
      const tabla = this.options.auditTable;
      if (!tabla || !window.AuditoriaData) return;
      AuditoriaData.log({
        accion,
        tabla_afectada: tabla,
        registro_id: registroId,
        valores_anteriores: anteriores,
        valores_nuevos: nuevos,
      });
    }

    isSortable(col) {
      if (!col?.key) return false;
      if (col.sortable === false) return false;
      return true;
    }

    toggleSort(key) {
      if (this.sortKey === key) {
        this.sortDir = this.sortDir === "asc" ? "desc" : "asc";
      } else {
        this.sortKey = key;
        this.sortDir = "asc";
      }
      this.page = 1;
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

      if (!overflowDocBound) {
        overflowDocBound = true;
        document.addEventListener("click", (event) => {
          if (event.target.closest("[data-overflow-menu]")) return;
          closeOverflowMenus();
        });
        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape") closeOverflowMenus();
        });
      }

      this.root.addEventListener("click", (event) => {
        const sortBtn = event.target.closest("[data-sort-key]");
        if (sortBtn) {
          event.preventDefault();
          this.toggleSort(sortBtn.dataset.sortKey);
          return;
        }

        const overflowTrigger = event.target.closest("[data-overflow-trigger]");
        if (overflowTrigger) {
          event.preventDefault();
          event.stopPropagation();
          const menu = overflowTrigger.closest("[data-overflow-menu]");
          const panel = menu?.querySelector("[data-overflow-panel]");
          const opening = !menu?.classList.contains("is-open");
          closeOverflowMenus(opening ? menu : null);
          if (!menu || !panel) return;
          menu.classList.toggle("is-open", opening);
          panel.hidden = !opening;
          overflowTrigger.setAttribute("aria-expanded", opening ? "true" : "false");
          return;
        }

        const overflowItem = event.target.closest("[data-overflow-action]");
        if (overflowItem) {
          event.preventDefault();
          const row = this.data.find((r) => r.id === overflowItem.dataset.rowId);
          closeOverflowMenus();
          if (!row) return;
          const action = overflowItem.dataset.overflowAction;
          if (action === "reset-password") {
            this.askResetPassword(row);
            return;
          }
          if (action === "history") {
            this.openHistory(row);
            return;
          }
          if (typeof this.options.onOverflowAction === "function") {
            this.options.onOverflowAction(row, action, overflowItem.dataset.overflowExtra || "");
          }
          return;
        }

        const viewBtn = event.target.closest("[data-row-view]");
        if (viewBtn && this.options.onView) {
          const row = this.data.find((r) => r.id === viewBtn.dataset.rowId);
          if (row) this.options.onView(row);
          return;
        }
        const editBtn = event.target.closest("[data-row-edit]");
        if (editBtn && this.options.onEdit) {
          const row = this.data.find((r) => r.id === editBtn.dataset.rowId);
          if (row) this.options.onEdit(row);
          return;
        }
        const deleteAskBtn = event.target.closest("[data-row-delete-ask]");
        if (deleteAskBtn && this.options.onDeleteAsk) {
          const row = this.data.find((r) => r.id === deleteAskBtn.dataset.rowId);
          if (!row) return;
          Promise.resolve(this.options.onDeleteAsk(row)).then((result) => {
            if (!result) return;
            if (result === "deleted" || result === true) {
              this.remove(row.id, { skipAudit: true });
              this.logAudit("eliminar", row.id, row, null);
              if (this.options.onDelete) this.options.onDelete(row.id);
            } else if (result === "deactivated") {
              this.update(row.id, { activo: false });
              if (typeof this.options.onDeactivate === "function") {
                this.options.onDeactivate(row.id);
              }
            } else if (result === "activated") {
              this.update(row.id, { activo: true });
              if (typeof this.options.onActivate === "function") {
                this.options.onActivate(row.id);
              }
            }
          });
          return;
        }
        const resetBtn = event.target.closest("[data-row-reset-password]");
        if (resetBtn && this.options.onResetPassword) {
          const row = this.data.find((r) => r.id === resetBtn.dataset.rowId);
          if (row) this.askResetPassword(row);
          return;
        }
        const historyBtn = event.target.closest("[data-row-history]");
        if (historyBtn && this.options.auditTable) {
          const row = this.data.find((r) => r.id === historyBtn.dataset.rowId);
          if (row) this.openHistory(row);
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
        const before = this.data.find((r) => r.id === id);
        this.remove(id, { skipAudit: true });
        this.logAudit("eliminar", id, before || null, null);
        if (this.options.onDelete) this.options.onDelete(id);
      });
    }

    askResetPassword(row) {
      if (!this.options.onResetPassword) return;
      const name = this.historyLabel(row);
      const customPrompt =
        typeof this.options.resetPasswordPrompt === "function"
          ? this.options.resetPasswordPrompt(row)
          : null;
      const ask = customPrompt
        ? Promise.resolve(customPrompt)
        : window.AppConfirm
          ? AppConfirm.request({
              title: "Restablecer contraseña",
              message: `¿Restablecer la contraseña de "${name}"? Se regenerará a partir del número de documento.`,
              confirmLabel: "Restablecer",
              cancelLabel: "Cancelar",
              variant: "warning",
            })
          : Promise.resolve(window.confirm(`¿Restablecer la contraseña de "${name}"?`));
      Promise.resolve(ask).then((ok) => {
        if (!ok) return;
        this.options.onResetPassword(row);
        this.logAudit("restablecer_contraseña", row.id, null, {
          documento: row.documento || null,
        });
      });
    }

    openHistory(row) {
      if (!this.options.auditTable) return;
      const detail = {
        tabla: this.options.auditTable,
        registroId: row.id,
        titulo: this.historyLabel(row),
      };
      if (window.AppHistorial) AppHistorial.open(detail);
      else document.dispatchEvent(new CustomEvent("app:historial-open", { detail }));
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
        if (typeof f.match === "function") {
          rows = rows.filter((row) => f.match(row, value));
        } else {
          rows = rows.filter((row) => String(f.getValue(row)) === value);
        }
      });

      if (this.sortKey) {
        const col = (this.options.columns || []).find((c) => c.key === this.sortKey);
        const getValue = col?.sortValue
          ? (row) => col.sortValue(row)
          : (row) => defaultSortValue(row, this.sortKey);
        const dir = this.sortDir === "desc" ? -1 : 1;
        rows.sort((a, b) => compareValues(getValue(a), getValue(b)) * dir);
      } else if (this.options.sort) {
        rows.sort(this.options.sort);
      }
      return rows;
    }

    renderChrome() {
      const cols = this.options.columns || [];
      this.theadEl.innerHTML = `
        <tr>
          ${cols
            .map((c) => {
              const cls = [
                c.num ? "col-num" : "",
                c.align === "right" ? "text-right" : "",
                c.align === "center" ? "text-center" : "",
              ]
                .filter(Boolean)
                .join(" ");

              if (!this.isSortable(c)) {
                return `<th scope="col" class="${cls}">${escapeHtml(c.label)}</th>`;
              }

              const active = this.sortKey === c.key;
              const ariaSort = active ? (this.sortDir === "asc" ? "ascending" : "descending") : "none";
              const stateClass = active ? `is-sorted is-sorted-${this.sortDir}` : "";
              const nextHint = active && this.sortDir === "asc" ? "descendente" : "ascendente";

              return `
                <th scope="col" class="${cls}" aria-sort="${ariaSort}">
                  <button
                    type="button"
                    class="catalog-sort-btn ${stateClass}"
                    data-sort-key="${escapeHtml(c.key)}"
                    title="Ordenar por ${escapeHtml(c.label)} (${nextHint})"
                    aria-label="Ordenar por ${escapeHtml(c.label)}"
                  >
                    <span>${escapeHtml(c.label)}</span>
                    ${ICON_SORT}
                  </button>
                </th>`;
            })
            .join("")}
          <th scope="col" class="text-right">Acciones</th>
        </tr>`;
    }

    render() {
      this.renderChrome();
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

      pageRows.forEach((row, i) => {
        const tr = document.createElement("tr");
        tr.dataset.row = "true";
        tr.dataset.id = row.id;
        const cells = (this.options.columns || [])
          .map((col) => {
            const content = col.render
              ? col.render(row, escapeHtml, start + i + 1)
              : escapeHtml(row[col.key]);
            const cls = [
              col.primary ? "col-primary" : "",
              col.muted ? "col-muted" : "",
              col.num ? "col-num" : "",
              col.align === "right" ? "text-right" : "",
              col.align === "center" ? "text-center" : "",
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
              ${actionButtons(row, deleteLabel, this.options)}
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
      this.logAudit("crear", item?.id, null, item);
    }

    update(id, patch) {
      const idx = this.data.findIndex((r) => r.id === id);
      if (idx === -1) return;
      const beforeFull = { ...this.data[idx] };
      this.data[idx] = { ...this.data[idx], ...patch };
      const afterFull = this.data[idx];
      this.render();
      const keys = Object.keys(patch || {});
      const anteriores = {};
      const nuevos = {};
      keys.forEach((k) => {
        anteriores[k] = beforeFull[k];
        nuevos[k] = afterFull[k];
      });
      this.logAudit("editar", id, keys.length ? anteriores : beforeFull, keys.length ? nuevos : afterFull);
    }

    remove(id, opts = {}) {
      const before = this.data.find((r) => r.id === id);
      this.data = this.data.filter((r) => r.id !== id);
      this.render();
      if (!opts.skipAudit) this.logAudit("eliminar", id, before || null, null);
    }

    setData(rows) {
      this.data = [...(rows || [])];
      this.page = 1;
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
    icons: {
      edit: ICON_EDIT,
      delete: ICON_DELETE,
      view: ICON_VIEW,
      resetPassword: ICON_RESET_PASSWORD,
      history: ICON_HISTORY,
      more: ICON_MORE,
    },
    escapeHtml,
    closeOverflowMenus,
  };
})();
