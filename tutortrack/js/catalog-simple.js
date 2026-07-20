/**
 * catalog-simple.js — molde compartido de catálogos (DISEÑO-FRONTEND.md).
 * Cards · toggle estado en fila · modal CRUD · delete→desactivar · reorder ⇅.
 *
 * Uso:
 *   CatalogSimple.mount({
 *     storageKey, version, seed, auditTable,
 *     labels: { singular, created, updated, deleted, activated, deactivated },
 *     searchKeys, fields, hasOrden, hideOrdenInModal, isInUse, ...
 *   });
 */
(function () {
  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  function esc(v) {
    return CatalogTable.escapeHtml(v);
  }

  function makeStore(storageKey, versionKey, version, seed) {
    let cached = null;

    function ensureVersion() {
      if (sessionStorage.getItem(versionKey) !== version) {
        sessionStorage.removeItem(storageKey);
        sessionStorage.setItem(versionKey, version);
      }
    }

    function load() {
      ensureVersion();
      if (cached) return cached.map((r) => ({ ...r }));
      try {
        const raw = sessionStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            cached = parsed;
            return cached.map((r) => ({ ...r }));
          }
        }
      } catch (_) {
        /* ignore */
      }
      cached = seed.map((r) => ({ ...r }));
      sessionStorage.setItem(storageKey, JSON.stringify(cached));
      return cached.map((r) => ({ ...r }));
    }

    function save(rows) {
      cached = rows.map((r) => ({ ...r }));
      sessionStorage.setItem(storageKey, JSON.stringify(cached));
    }

    function resumen(rows) {
      const list = rows || load();
      const total = list.length;
      const activos = list.filter((r) => r.activo !== false).length;
      return { total, activos, inactivos: total - activos };
    }

    return { load, save, resumen };
  }

  function renderSummary(counts) {
    const set = (sel, n) => {
      const el = document.querySelector(sel);
      if (el) el.textContent = String(n);
    };
    set("[data-summary-total]", counts.total);
    set("[data-summary-activos]", counts.activos);
    set("[data-summary-inactivos]", counts.inactivos);
  }

  function syncToggle(toggleId, checkboxId, activo) {
    const toggle = document.getElementById(toggleId);
    const checkbox = document.getElementById(checkboxId);
    if (!toggle || !checkbox) return;
    checkbox.checked = !!activo;
    toggle.setAttribute("aria-checked", activo ? "true" : "false");
  }

  function estadoToggleHtml(row, escapeFn) {
    const on = row.activo !== false;
    return `
      <button
        type="button"
        class="catalog-estado-toggle${on ? " is-on" : ""}"
        data-toggle-activo
        data-row-id="${escapeFn(row.id)}"
        role="switch"
        aria-checked="${on ? "true" : "false"}"
        title="${on ? "Desactivar" : "Activar"}"
        aria-label="${on ? "Desactivar" : "Activar"}"
      >
        <span class="catalog-estado-dot" aria-hidden="true"></span>
        <span>${on ? "Activo" : "Inactivo"}</span>
      </button>`;
  }

  function ordenHtml(row, escapeFn, allSorted) {
    const idx = allSorted.findIndex((r) => r.id === row.id);
    const isFirst = idx <= 0;
    const isLast = idx === allSorted.length - 1;
    return `
      <div class="catalog-orden">
        <div class="catalog-orden-btns">
          <button type="button" class="catalog-orden-btn" data-orden-up data-row-id="${escapeFn(row.id)}" ${isFirst ? "disabled" : ""} title="Subir" aria-label="Subir">▲</button>
          <button type="button" class="catalog-orden-btn" data-orden-down data-row-id="${escapeFn(row.id)}" ${isLast ? "disabled" : ""} title="Bajar" aria-label="Bajar">▼</button>
        </div>
        <span class="catalog-orden-num">${escapeFn(row.orden)}</span>
      </div>`;
  }

  function cardsHtml() {
    return `
      <div class="people-summary catalog-summary" data-people-summary aria-label="Resumen del catálogo">
        <article class="people-summary-card people-summary-total">
          <div class="people-summary-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          </div>
          <div>
            <p class="people-summary-label">Total</p>
            <p class="people-summary-value" data-summary-total>0</p>
            <p class="people-summary-sub">registros</p>
          </div>
        </article>
        <article class="people-summary-card people-summary-active">
          <div class="people-summary-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
          </div>
          <div>
            <p class="people-summary-label">Activos</p>
            <p class="people-summary-value" data-summary-activos>0</p>
            <p class="people-summary-sub">disponibles</p>
          </div>
        </article>
        <article class="people-summary-card people-summary-inactive">
          <div class="people-summary-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>
          </div>
          <div>
            <p class="people-summary-label">Inactivos</p>
            <p class="people-summary-value" data-summary-inactivos>0</p>
            <p class="people-summary-sub">ocultos</p>
          </div>
        </article>
      </div>`;
  }

  /**
   * @param {object} cfg
   */
  function mount(cfg) {
    const root = document.querySelector(cfg.root || "[data-catalog]");
    if (!root || !window.CatalogTable) return null;

    const store = makeStore(
      cfg.storageKey,
      cfg.versionKey || cfg.storageKey + "-version",
      cfg.version || "v1",
      cfg.seed || []
    );

    const labels = cfg.labels || {};
    const singular = labels.singular || "Registro";
    const fields = cfg.fields || [{ key: "nombre", label: "Nombre", required: true, unique: true }];
    const hasOrden = Boolean(cfg.hasOrden);
    const hideOrdenInModal = cfg.hideOrdenInModal !== false; // default true when hasOrden
    const claveField = fields.find((f) => f.key === "clave");

    // Inject cards if missing
    const main = root.closest("main") || root.parentElement;
    if (main && !document.querySelector("[data-people-summary]")) {
      root.insertAdjacentHTML("beforebegin", cardsHtml());
    }

    function refreshSummary() {
      renderSummary(store.resumen(store.load()));
    }

    function sortedByOrden(rows) {
      return [...rows].sort((a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0));
    }

    function nextOrden(rows) {
      if (!rows.length) return 1;
      return Math.max(...rows.map((r) => Number(r.orden) || 0)) + 1;
    }

    function buildColumns() {
      const cols = [
        {
          key: "_n",
          label: "N°",
          num: true,
          align: "center",
          sortable: false,
          render: (_r, escapeFn, n) => escapeFn(n),
        },
      ];

      if (hasOrden) {
        cols.push({
          key: "orden",
          label: "Orden",
          align: "center",
          sortable: false,
          render: (row, escapeFn) =>
            ordenHtml(row, escapeFn, sortedByOrden(store.load())),
        });
      }

      if (claveField) {
        cols.push({
          key: "clave",
          label: "Clave",
          muted: true,
          render: (row, escapeFn) =>
            `<code class="catalog-clave">${escapeFn(row.clave || "—")}</code>`,
        });
      }

      fields
        .filter((f) => f.key !== "clave" && f.key !== "activo" && f.key !== "orden")
        .forEach((f) => {
          if (f.column === false) return;
          cols.push({
            key: f.key,
            label: f.columnLabel || f.label,
            primary: f.primary !== false && f.key === "nombre",
            muted: f.muted,
            render: f.render
              ? f.render
              : (row, escapeFn) => {
                  const main = row[f.key];
                  if (f.secondaryKey && row[f.secondaryKey]) {
                    return `<div class="leading-snug">
                      <div class="font-medium text-text">${escapeFn(main || "—")}</div>
                      <div class="text-xs text-text-muted truncate" title="${escapeFn(row[f.secondaryKey])}">${escapeFn(row[f.secondaryKey])}</div>
                    </div>`;
                  }
                  if (f.tooltipKey && row[f.tooltipKey]) {
                    return `<span title="${escapeFn(row[f.tooltipKey])}">${escapeFn(main || "—")}</span>`;
                  }
                  return escapeFn(main ?? "—");
                },
          });
        });

      if (typeof cfg.extraColumn === "function") {
        cols.push(cfg.extraColumn());
      }

      cols.push({
        key: "activo",
        label: "Estado",
        align: "center",
        sortable: false,
        render: estadoToggleHtml,
      });

      return cols;
    }

    const backdrop = document.querySelector(cfg.backdrop || "[data-form-backdrop]");
    const form = document.querySelector(cfg.form || "[data-form]");
    const formTitle = document.querySelector(cfg.formTitle || "[data-form-title]");
    const editingIdEl = document.querySelector("[data-editing-id]");

    function openModal(row) {
      if (!backdrop || !form) return;
      const isEdit = Boolean(row);
      if (formTitle) {
        formTitle.textContent = isEdit
          ? `Editar ${singular.toLowerCase()}`
          : `Nuevo ${singular.toLowerCase()}`;
      }
      if (editingIdEl) editingIdEl.value = isEdit ? row.id : "";

      fields.forEach((f) => {
        const el = document.getElementById(f.inputId || `field-${f.key}`);
        if (!el) return;
        if (f.key === "activo") return;
        el.value = isEdit ? row[f.key] ?? "" : f.defaultValue ?? "";
        if (f.key === "clave") {
          el.readOnly = isEdit;
          el.classList.toggle("opacity-80", isEdit);
        }
      });

      const activoToggle = document.getElementById(cfg.activoToggleId || "field-activo-toggle");
      const activoCheck = document.getElementById(cfg.activoCheckboxId || "field-activo");
      if (activoToggle && activoCheck) {
        syncToggle(
          cfg.activoToggleId || "field-activo-toggle",
          cfg.activoCheckboxId || "field-activo",
          isEdit ? row.activo !== false : true
        );
      }

      if (typeof cfg.onOpenModal === "function") cfg.onOpenModal(row, isEdit);

      backdrop.classList.remove("hidden");
      backdrop.classList.add("flex");
      const first = fields.find((f) => f.key !== "clave" || !isEdit);
      const focusEl = first
        ? document.getElementById(first.inputId || `field-${first.key}`)
        : null;
      focusEl?.focus();
    }

    function closeModal() {
      if (!backdrop) return;
      backdrop.classList.add("hidden");
      backdrop.classList.remove("flex");
    }

    function askDelete(row) {
      const inUse =
        typeof cfg.isInUse === "function" ? cfg.isInUse(row, table.getAll()) : false;
      const name = row.nombre || row.clave || row.id;

      if (!inUse) {
        return AppConfirm.request({
          title: `Eliminar ${singular.toLowerCase()}`,
          confirmLabel: "Eliminar",
          cancelLabel: "Cancelar",
          variant: "danger",
          messageHtml: `<p>¿Eliminar <strong class="text-text">${esc(name)}</strong>?</p>
            <p>No está en uso. Se eliminará del catálogo.</p>`,
        }).then((ok) => {
          if (!ok) return false;
          const next = store.load().filter((r) => r.id !== row.id);
          store.save(next);
          toast(labels.deleted || `${singular} eliminado`);
          refreshSummary();
          return "deleted";
        });
      }

      const reason =
        typeof inUse === "string"
          ? inUse
          : `Está en uso por otros registros del sistema.`;

      return AppConfirm.request({
        title: "No se puede eliminar",
        confirmLabel: "Desactivar",
        cancelLabel: "Cancelar",
        variant: "primary",
        messageHtml: `<p><strong class="text-text">${esc(name)}</strong> no se puede eliminar.</p>
          <p>${esc(reason)}</p>
          <p class="pt-1">Puedes desactivarlo para que deje de ofrecerse en altas nuevas.</p>`,
      }).then((ok) => {
        if (!ok) return false;
        const rows = store.load();
        const idx = rows.findIndex((r) => r.id === row.id);
        if (idx !== -1) {
          rows[idx] = { ...rows[idx], activo: false };
          store.save(rows);
        }
        toast(labels.deactivated || `${singular} desactivado`);
        refreshSummary();
        return "deactivated";
      });
    }

    function swapOrden(id, dir) {
      const rows = sortedByOrden(store.load());
      const idx = rows.findIndex((r) => r.id === id);
      const j = dir === "up" ? idx - 1 : idx + 1;
      if (idx < 0 || j < 0 || j >= rows.length) return;
      const a = rows[idx];
      const b = rows[j];
      const tmp = a.orden;
      a.orden = b.orden;
      b.orden = tmp;
      const map = Object.fromEntries(rows.map((r) => [r.id, r]));
      const all = store.load().map((r) => map[r.id] || r);
      store.save(all);
      table.setData(store.load());
      toast("Orden actualizado");
    }

    let table;

    const columns = typeof cfg.columns === "function" ? cfg.columns : buildColumns;

    table = CatalogTable.mount(root, {
      data: store.load(),
      pageSize: cfg.pageSize || 10,
      searchKeys: cfg.searchKeys || ["nombre"],
      filters: [
        {
          id: "estado",
          getValue: (r) => (r.activo !== false ? "activo" : "inactivo"),
        },
        ...(cfg.extraFilters || []),
      ],
      initialSortKey: hasOrden ? "orden" : cfg.initialSortKey || "nombre",
      sort: hasOrden
        ? (a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0)
        : cfg.sort,
      deleteLabel: (r) => r.nombre || r.clave || r.id,
      historyLabel: (r) => r.nombre || r.clave || r.id,
      columns: typeof columns === "function" ? columns() : columns,
      onEdit: openModal,
      onDeleteAsk: askDelete,
      extraActions: cfg.extraActions,
      ...(cfg.tableOptions || {}),
    });

    refreshSummary();

    // Toggle estado en fila
    root.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-toggle-activo]");
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.getAttribute("data-row-id");
        const rows = store.load();
        const idx = rows.findIndex((r) => r.id === id);
        if (idx === -1) return;
        const next = !(rows[idx].activo !== false);
        rows[idx] = { ...rows[idx], activo: next };
        store.save(rows);
        table.setData(store.load());
        refreshSummary();
        toast(next ? labels.activated || `${singular} activado` : labels.deactivated || `${singular} desactivado`);
        return;
      }
      const up = e.target.closest("[data-orden-up]");
      if (up && !up.disabled) {
        e.preventDefault();
        swapOrden(up.getAttribute("data-row-id"), "up");
        return;
      }
      const down = e.target.closest("[data-orden-down]");
      if (down && !down.disabled) {
        e.preventDefault();
        swapOrden(down.getAttribute("data-row-id"), "down");
      }
    });

    document.querySelector("[data-open-create]")?.addEventListener("click", () => openModal(null));
    document.querySelector("[data-catalog-refresh]")?.addEventListener("click", () => {
      table.setData(store.load());
      refreshSummary();
      toast("Lista actualizada");
    });
    document.querySelector("[data-form-cancel]")?.addEventListener("click", closeModal);
    backdrop?.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });

    const activoToggle = document.getElementById(cfg.activoToggleId || "field-activo-toggle");
    const activoCheck = document.getElementById(cfg.activoCheckboxId || "field-activo");
    activoToggle?.addEventListener("click", () => {
      syncToggle(
        cfg.activoToggleId || "field-activo-toggle",
        cfg.activoCheckboxId || "field-activo",
        !activoCheck.checked
      );
    });

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = editingIdEl?.value || "";
      const patch = {};
      for (const f of fields) {
        if (f.key === "activo" || f.key === "orden") continue;
        const el = document.getElementById(f.inputId || `field-${f.key}`);
        if (!el) continue;
        let val = el.value;
        if (typeof f.parse === "function") val = f.parse(val);
        else if (typeof val === "string") val = val.trim();
        if (f.required && (val === "" || val == null)) {
          toast(`Completa el campo ${f.label}`, "warning");
          el.focus();
          return;
        }
        if (f.pattern && val && !f.pattern.test(val)) {
          toast(f.patternMessage || `Formato inválido en ${f.label}`, "warning");
          el.focus();
          return;
        }
        patch[f.key] = val;
      }

      patch.activo = activoCheck ? activoCheck.checked : true;

      const all = store.load();
      for (const f of fields) {
        if (!f.unique) continue;
        const clash = all.find(
          (r) =>
            r.id !== id &&
            String(r[f.key] || "").toLowerCase() === String(patch[f.key] || "").toLowerCase()
        );
        if (clash) {
          toast(`Ya existe un registro con ese ${f.label.toLowerCase()}`, "warning");
          return;
        }
      }

      if (typeof cfg.validate === "function") {
        const err = cfg.validate(patch, id, all);
        if (err) {
          toast(err, "warning");
          return;
        }
      }

      if (id) {
        const prev = all.find((r) => r.id === id);
        if (!prev) return;
        if (claveField) patch.clave = prev.clave;
        if (hasOrden) patch.orden = prev.orden;
        const next = all.map((r) => (r.id === id ? { ...r, ...patch } : r));
        store.save(next);
        if (window.AuditoriaData && cfg.auditTable) {
          AuditoriaData.log({
            accion: "editar",
            tabla_afectada: cfg.auditTable,
            registro_id: id,
            valores_anteriores: prev,
            valores_nuevos: { ...prev, ...patch },
          });
        }
        toast(labels.updated || `${singular} actualizado`);
      } else {
        const row = {
          id: `${cfg.idPrefix || "cat"}-${Date.now()}`,
          ...patch,
        };
        if (hasOrden) row.orden = nextOrden(all);
        if (typeof cfg.beforeCreate === "function") cfg.beforeCreate(row, all);
        all.unshift(row);
        store.save(all);
        if (window.AuditoriaData && cfg.auditTable) {
          AuditoriaData.log({
            accion: "crear",
            tabla_afectada: cfg.auditTable,
            registro_id: row.id,
            valores_anteriores: null,
            valores_nuevos: row,
          });
        }
        toast(labels.created || `${singular} creado`);
      }

      table.setData(store.load());
      refreshSummary();
      closeModal();
      if (typeof cfg.afterSave === "function") cfg.afterSave();
    });

    return {
      table,
      store,
      openModal,
      closeModal,
      refreshSummary,
      reload() {
        table.setData(store.load());
        refreshSummary();
      },
    };
  }

  window.CatalogSimple = {
    mount,
    makeStore,
    renderSummary,
    estadoToggleHtml,
    ordenHtml,
    cardsHtml,
    syncToggle,
    esc,
  };
})();
