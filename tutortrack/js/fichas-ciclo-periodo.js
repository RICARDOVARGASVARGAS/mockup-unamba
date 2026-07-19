/**
 * fichas-ciclo-periodo.js — gestión de fichas asignadas a un ciclo+período.
 */
(function () {
  const toast = (msg, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message: msg, type } }));

  const TIPO_BADGE = {
    "tf-1": "badge-primary",
    "tf-2": "badge-success",
    "tf-3": "badge-neutral",
  };

  const params  = new URLSearchParams(window.location.search);
  const cpId    = params.get("cp")     || "cp-301";
  const ciclo   = params.get("ciclo")  || "Ciclo";
  const periodo = params.get("periodo") || "Período";

  let _pendingDesasignarId = null;

  function tipoBadge(tipoId) {
    const cls = TIPO_BADGE[tipoId] || "badge-neutral";
    const nombre = FichasData.tipoFichaNombre(tipoId);
    return `<span class="badge ${cls}">${nombre}</span>`;
  }

  function renderList() {
    const rows = FichasCpData.load(cpId);
    const list  = document.getElementById("fichas-list");
    const empty = document.getElementById("fichas-empty");

    if (!rows.length) {
      list.innerHTML  = "";
      empty.classList.remove("hidden");
      return;
    }

    empty.classList.add("hidden");
    list.innerHTML = rows.map((f) => `
      <div class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" data-fcp-id="${f.id}">
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-medium text-text">${escHtml(f.nombre)}</span>
            ${tipoBadge(f.tipo_ficha_id)}
          </div>
          <div class="mt-1 flex flex-wrap gap-3 text-xs text-text-muted">
            <span>${f.n_preguntas} pregunta${f.n_preguntas !== 1 ? "s" : ""}</span>
            <span>·</span>
            <span>${f.completadas} de ${f.total_estudiantes} estudiantes completaron</span>
            <span>·</span>
            <span>Asignada el ${formatDate(f.fecha_asignacion)}</span>
          </div>
          <div class="mt-2">
            <div class="h-1.5 w-full max-w-xs rounded-full bg-border overflow-hidden">
              <div class="h-full rounded-full bg-primary" style="width:${f.total_estudiantes ? Math.round((f.completadas / f.total_estudiantes) * 100) : 0}%"></div>
            </div>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <a href="fichas-form.html?id=${encodeURIComponent(f.ficha_id)}&modo=ver" class="btn-secondary text-xs py-1.5 px-3">Ver preguntas</a>
          <button type="button" class="btn-ghost text-xs py-1.5 px-3 text-danger hover:bg-danger/10" data-desasignar="${f.id}" data-nombre="${escHtml(f.nombre)}">Desasignar</button>
        </div>
      </div>
    `).join("");
  }

  function buildFichaSelect() {
    const asignadas = FichasCpData.load(cpId).map((f) => f.ficha_id);
    const todas     = FichasData.load().filter((f) => f.activo && !asignadas.includes(f.id));
    const sel       = document.getElementById("sel-ficha");
    sel.innerHTML   = '<option value="">Seleccionar…</option>';
    todas.forEach((f) => {
      const opt = document.createElement("option");
      opt.value = f.id;
      opt.textContent = `${f.nombre} (${FichasData.tipoFichaNombre(f.tipo_ficha_id)} · ${(f.preguntas || []).length} preg.)`;
      sel.appendChild(opt);
    });
    if (!todas.length) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "— Todas las fichas activas ya están asignadas —";
      opt.disabled = true;
      sel.appendChild(opt);
    }
  }

  function openAsignar() {
    buildFichaSelect();
    const bd = document.getElementById("modal-asignar-backdrop");
    bd.classList.remove("hidden");
    bd.classList.add("flex");
    document.getElementById("sel-ficha").value = "";
  }

  function closeAsignar() {
    const bd = document.getElementById("modal-asignar-backdrop");
    bd.classList.add("hidden");
    bd.classList.remove("flex");
  }

  function openDesasignar(fcpId, nombre) {
    _pendingDesasignarId = fcpId;
    document.getElementById("desasignar-nombre").textContent = nombre;
    const bd = document.getElementById("modal-desasignar-backdrop");
    bd.classList.remove("hidden");
    bd.classList.add("flex");
  }

  function closeDesasignar() {
    _pendingDesasignarId = null;
    const bd = document.getElementById("modal-desasignar-backdrop");
    bd.classList.add("hidden");
    bd.classList.remove("flex");
  }

  function escHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    /* Breadcrumb + título */
    document.getElementById("bc-ciclo").textContent = ciclo;
    document.getElementById("page-title").textContent = `Fichas — ${ciclo} · ${periodo}`;
    document.getElementById("page-subtitle").textContent = `Período académico ${periodo}`;

    const base = window.getBasePath ? window.getBasePath() : "../../";
    document.getElementById("link-gestion").href = `${base}pages/admin/gestion-periodo.html`;

    renderList();

    /* Btn asignar */
    document.getElementById("btn-asignar").addEventListener("click", openAsignar);
    document.getElementById("btn-asignar-cancelar").addEventListener("click", closeAsignar);
    document.getElementById("modal-asignar-backdrop").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeAsignar();
    });

    document.getElementById("form-asignar").addEventListener("submit", (e) => {
      e.preventDefault();
      const fichaId = document.getElementById("sel-ficha").value;
      if (!fichaId) { toast("Selecciona una ficha", "warning"); return; }
      const ficha = FichasData.findById(fichaId);
      if (!ficha) return;
      const result = FichasCpData.asignar(cpId, ficha);
      if (!result) { toast("Esa ficha ya está asignada", "warning"); return; }
      closeAsignar();
      renderList();
      toast("Ficha asignada correctamente");
    });

    /* Btn desasignar */
    document.getElementById("btn-desasignar-cancelar").addEventListener("click", closeDesasignar);
    document.getElementById("modal-desasignar-backdrop").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeDesasignar();
    });
    document.getElementById("btn-desasignar-confirm").addEventListener("click", () => {
      if (!_pendingDesasignarId) return;
      FichasCpData.desasignar(cpId, _pendingDesasignarId);
      closeDesasignar();
      renderList();
      toast("Ficha desasignada");
    });

    /* Delegación: clic en desasignar */
    document.getElementById("fichas-list").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-desasignar]");
      if (btn) openDesasignar(btn.dataset.desasignar, btn.dataset.nombre);
    });
  });
})();
