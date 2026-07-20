/**
 * periodos-academicos.js — único vigente; cards Total / Vigente / No vigentes.
 */
(function () {
  const STORAGE_KEY = "tutortrack-periodos";
  const VERSION_KEY = "tutortrack-periodos-version";
  const VERSION = "per-v2-unico-vigente";

  const SEED = [
    { id: "p-2024-1", nombre: "2024-I", fecha_inicio: "2024-03-01", fecha_fin: "2024-07-15", activo: false },
    { id: "p-2024-2", nombre: "2024-II", fecha_inicio: "2024-08-01", fecha_fin: "2024-12-15", activo: false },
    { id: "p-2025-1", nombre: "2025-I", fecha_inicio: "2025-03-01", fecha_fin: "2025-07-15", activo: false },
    { id: "p-2025-2", nombre: "2025-II", fecha_inicio: "2025-08-01", fecha_fin: "2025-12-20", activo: false },
    { id: "p-2026-1", nombre: "2026-I", fecha_inicio: "2026-03-01", fecha_fin: "2026-07-31", activo: true },
  ];

  /** Periodos con ciclo_periodo (no eliminables). */
  const CON_DATOS = new Set(["p-2025-1", "p-2025-2", "p-2026-1"]);

  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  const esc = (v) => CatalogTable.escapeHtml(v);

  const store = CatalogSimple.makeStore(STORAGE_KEY, VERSION_KEY, VERSION, SEED);

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function refreshSummary() {
    const rows = store.load();
    const vigente = rows.find((r) => r.activo);
    const elT = document.querySelector("[data-summary-total]");
    const elV = document.querySelector("[data-summary-vigente]");
    const elN = document.querySelector("[data-summary-inactivos]");
    if (elT) elT.textContent = String(rows.length);
    if (elV) {
      elV.textContent = vigente ? vigente.nombre : "—";
      elV.classList.toggle("text-base", true);
    }
    if (elN) elN.textContent = String(rows.filter((r) => !r.activo).length);
    document.querySelector("[data-sin-vigente]")?.classList.toggle("hidden", Boolean(vigente));
  }

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-catalog]");
    const backdrop = document.querySelector("[data-form-backdrop]");
    const form = document.querySelector("[data-form]");
    const title = document.querySelector("[data-form-title]");
    const editingId = document.querySelector("[data-editing-id]");

    function openModal(row) {
      title.textContent = row ? "Editar período" : "Nuevo período";
      editingId.value = row ? row.id : "";
      document.getElementById("periodo-nombre").value = row?.nombre || "";
      document.getElementById("periodo-inicio").value = row?.fecha_inicio || "";
      document.getElementById("periodo-fin").value = row?.fecha_fin || "";
      backdrop.classList.remove("hidden");
      backdrop.classList.add("flex");
      document.getElementById("periodo-nombre").focus();
    }

    function closeModal() {
      backdrop.classList.add("hidden");
      backdrop.classList.remove("flex");
    }

    function marcarVigente(row) {
      const actual = store.load().find((r) => r.activo);
      return AppConfirm.request({
        title: "Marcar período vigente",
        confirmLabel: "Marcar vigente",
        cancelLabel: "Cancelar",
        variant: "primary",
        messageHtml: `
          <p>¿Marcar <strong class="text-text">${esc(row.nombre)}</strong> como período vigente?</p>
          ${
            actual
              ? `<p>El período actual (<strong>${esc(actual.nombre)}</strong>) dejará de serlo.</p>`
              : ""
          }
          <p class="pt-1">Matrículas, fichas y alertas pasarán a operar sobre ${esc(row.nombre)}.</p>`,
      }).then((ok) => {
        if (!ok) return;
        const next = store.load().map((r) => ({ ...r, activo: r.id === row.id }));
        store.save(next);
        table.setData(store.load());
        refreshSummary();
        toast(`${row.nombre} es ahora el período vigente`);
      });
    }

    function askDelete(row) {
      if (row.activo) {
        return AppConfirm.request({
          title: "No se puede eliminar",
          confirmLabel: "Entendido",
          cancelLabel: "Cerrar",
          variant: "warning",
          messageHtml: `<p><strong class="text-text">${esc(row.nombre)}</strong> es el período vigente. Marca otro como vigente antes de eliminarlo.</p>`,
        }).then(() => false);
      }
      if (CON_DATOS.has(row.id)) {
        return AppConfirm.request({
          title: "No se puede eliminar",
          confirmLabel: "Entendido",
          cancelLabel: "Cerrar",
          variant: "warning",
          messageHtml: `<p>Este período tiene ciclos/matrículas asociados; es historial y no se puede eliminar.</p>`,
        }).then(() => false);
      }
      return AppConfirm.request({
        title: "Eliminar período",
        confirmLabel: "Eliminar",
        cancelLabel: "Cancelar",
        variant: "danger",
        messageHtml: `<p>¿Eliminar <strong class="text-text">${esc(row.nombre)}</strong>? No tiene datos asociados.</p>`,
      }).then((ok) => {
        if (!ok) return false;
        store.save(store.load().filter((r) => r.id !== row.id));
        toast("Período eliminado");
        refreshSummary();
        return "deleted";
      });
    }

    const table = CatalogTable.mount(root, {
      data: store.load(),
      pageSize: 10,
      searchKeys: ["nombre"],
      filters: [
        {
          id: "estado",
          getValue: (r) => (r.activo ? "vigente" : "no_vigente"),
        },
      ],
      initialSortKey: "nombre",
      initialSortDir: "desc",
      deleteLabel: (r) => r.nombre,
      columns: [
        {
          key: "_n",
          label: "N°",
          num: true,
          align: "center",
          sortable: false,
          render: (_r, e, n) => e(n),
        },
        { key: "nombre", label: "Nombre", primary: true },
        {
          key: "fecha_inicio",
          label: "Inicio",
          muted: true,
          render: (r) => formatDate(r.fecha_inicio),
        },
        {
          key: "fecha_fin",
          label: "Fin",
          muted: true,
          render: (r) => formatDate(r.fecha_fin),
        },
        {
          key: "activo",
          label: "Estado",
          sortable: false,
          render: (r) =>
            r.activo
              ? '<span class="badge badge-success"><span aria-hidden="true">●</span> Vigente</span>'
              : `<button type="button" class="btn-secondary btn-sm" data-marcar-vigente data-row-id="${esc(r.id)}">Marcar vigente</button>`,
        },
      ],
      onEdit: openModal,
      onDeleteAsk: askDelete,
    });

    refreshSummary();

    root.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-marcar-vigente]");
      if (!btn) return;
      e.preventDefault();
      const row = store.load().find((r) => r.id === btn.getAttribute("data-row-id"));
      if (row) marcarVigente(row);
    });

    document.querySelector("[data-open-create]")?.addEventListener("click", () => openModal(null));
    document.querySelector("[data-catalog-refresh]")?.addEventListener("click", () => {
      table.setData(store.load());
      refreshSummary();
      toast("Lista actualizada");
    });
    document.querySelector("[data-form-cancel]")?.addEventListener("click", closeModal);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = editingId.value;
      const nombre = document.getElementById("periodo-nombre").value.trim();
      const fecha_inicio = document.getElementById("periodo-inicio").value;
      const fecha_fin = document.getElementById("periodo-fin").value;
      if (!nombre) {
        toast("El nombre es obligatorio", "warning");
        return;
      }
      if (fecha_inicio && fecha_fin && fecha_inicio > fecha_fin) {
        toast("La fecha de inicio debe ser anterior o igual a la de fin", "warning");
        return;
      }
      const all = store.load();
      if (all.some((r) => r.id !== id && r.nombre.toLowerCase() === nombre.toLowerCase())) {
        toast("Ya existe un período con ese nombre", "warning");
        return;
      }
      if (id) {
        const next = all.map((r) =>
          r.id === id ? { ...r, nombre, fecha_inicio, fecha_fin } : r
        );
        store.save(next);
        toast("Período actualizado");
      } else {
        all.unshift({
          id: `p-${Date.now()}`,
          nombre,
          fecha_inicio,
          fecha_fin,
          activo: false,
        });
        store.save(all);
        toast("Período creado");
      }
      table.setData(store.load());
      refreshSummary();
      closeModal();
    });
  });
})();
