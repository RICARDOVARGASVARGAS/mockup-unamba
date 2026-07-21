/**
 * alertas.js — Docente › Mis alertas (tarjetas + contadores + drawer + acciones).
 * Admin reutiliza con `window.ALERTAS_PAGE_MODE = "admin"` antes de cargar este script.
 */
(function () {
  const MODE = window.ALERTAS_PAGE_MODE === "admin" ? "admin" : "docente";
  const D = () => window.AlertasDerivacionesData;
  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  let filtroEstado = MODE === "docente" ? "pendiente" : "";
  let selectedId = null;

  function basePath() {
    return typeof getBasePath === "function" ? getBasePath() : "../../";
  }

  function docenteScope() {
    return MODE === "docente" ? D().DOCENTE_DEMO.id : null;
  }

  function filtersFromUi() {
    const f = {
      docente_id: docenteScope() || undefined,
      estado: filtroEstado || undefined,
      nivel_alerta: document.getElementById("filtro-nivel")?.value || undefined,
      area_id: document.getElementById("filtro-area")?.value || undefined,
      q: document.getElementById("filtro-q")?.value?.trim() || undefined,
    };
    if (MODE === "admin") {
      const doc = document.getElementById("filtro-docente")?.value;
      if (doc) f.docente_id = doc;
      const desde = document.getElementById("filtro-desde")?.value;
      const hasta = document.getElementById("filtro-hasta")?.value;
      if (desde) f.fecha_desde = desde;
      if (hasta) f.fecha_hasta = hasta;
    }
    Object.keys(f).forEach((k) => {
      if (!f[k]) delete f[k];
    });
    return f;
  }

  function nivelBadge(nivel) {
    const map = {
      Alta: { cls: "alerta-nivel alerta-nivel--alta", label: "ALTA" },
      Media: { cls: "alerta-nivel alerta-nivel--media", label: "MEDIA" },
      Baja: { cls: "alerta-nivel alerta-nivel--baja", label: "BAJA" },
    };
    const m = map[nivel] || map.Baja;
    return `<span class="${m.cls}">${m.label}</span>`;
  }

  function estadoPill(a) {
    const map = {
      pendiente: { cls: "alerta-estado alerta-estado--pendiente", text: "● Pendiente" },
      revisada: { cls: "alerta-estado alerta-estado--revisada", text: "✔ Revisada" },
      derivada: {
        cls: "alerta-estado alerta-estado--derivada",
        text: a.entidad_sugerida_nombre
          ? `➜ Derivada a ${esc(a.entidad_sugerida_nombre)}`
          : "➜ Derivada",
      },
      descartada: { cls: "alerta-estado alerta-estado--descartada", text: "✖ Descartada" },
    };
    const m = map[a.estado] || map.pendiente;
    return `<span class="${m.cls}">${m.text}</span>`;
  }

  function avatarHtml(a) {
    const bp = basePath();
    if (a.estudiante_foto) {
      return `<img src="${esc(bp + a.estudiante_foto)}" alt="" class="h-10 w-10 rounded-full object-cover" width="40" height="40" />`;
    }
    return `<span class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">${esc(a.estudiante_iniciales)}</span>`;
  }

  function accionesCard(a) {
    if (MODE === "admin") {
      return `<button type="button" class="btn-secondary btn-sm" data-ver="${esc(a.id)}">Ver detalle</button>`;
    }
    const btns = [];
    btns.push(`<button type="button" class="btn-secondary btn-sm" data-ver="${esc(a.id)}">Ver detalle</button>`);
    if (a.estado === "pendiente") {
      btns.push(`<button type="button" class="btn-secondary btn-sm" data-revisar="${esc(a.id)}">Revisar</button>`);
      btns.push(`<button type="button" class="btn-primary btn-sm" data-derivar="${esc(a.id)}">Derivar</button>`);
      btns.push(`<button type="button" class="btn-ghost btn-sm text-danger" data-descartar="${esc(a.id)}">Descartar</button>`);
    } else if (a.estado === "revisada") {
      btns.push(`<button type="button" class="btn-primary btn-sm" data-derivar="${esc(a.id)}">Derivar</button>`);
      btns.push(`<button type="button" class="btn-ghost btn-sm text-danger" data-descartar="${esc(a.id)}">Descartar</button>`);
    } else if (a.estado === "derivada" && a.derivacion_id) {
      btns.push(
        `<a class="btn-secondary btn-sm" href="derivaciones.html?ver=${esc(a.derivacion_id)}">Ver derivación</a>`
      );
    } else if (a.estado === "descartada") {
      btns.push(`<button type="button" class="btn-primary btn-sm" data-reactivar="${esc(a.id)}">Reactivar</button>`);
    }
    return btns.join("");
  }

  function renderContadores() {
    const scope = { docente_id: docenteScope() || undefined };
    if (MODE === "admin") {
      const doc = document.getElementById("filtro-docente")?.value;
      if (doc) scope.docente_id = doc;
    }
    const c = D().conteoEstados(scope);
    const set = (k, n) => {
      const el = document.querySelector(`[data-c-${k}]`);
      if (el) el.textContent = String(n);
    };
    set("pendiente", c.pendiente);
    set("revisada", c.revisada);
    set("derivada", c.derivada);
    set("descartada", c.descartada);
    const cola = document.querySelector("[data-cola-n]");
    if (cola) cola.textContent = String(c.pendiente);
    const colaWrap = document.querySelector("[data-cola-pendientes]");
    if (colaWrap) colaWrap.classList.toggle("hidden", c.pendiente === 0 && MODE === "admin");
  }

  function renderLista() {
    const rows = D().listAlertas(filtersFromUi());
    const lista = document.querySelector("[data-lista]");
    const vacio = document.querySelector("[data-vacio]");
    renderContadores();

    if (!rows.length) {
      lista.innerHTML = "";
      vacio.classList.remove("hidden");
      if (filtroEstado === "pendiente" && MODE === "docente") {
        vacio.textContent = "No tienes alertas pendientes 🎉";
      } else {
        vacio.textContent = "No hay alertas con estos filtros.";
      }
      return;
    }
    vacio.classList.add("hidden");
    lista.innerHTML = rows
      .map(
        (a) => `
      <article class="alerta-card" data-alerta-id="${esc(a.id)}">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div class="flex flex-wrap items-center gap-2">
            ${nivelBadge(a.nivel_alerta)}
            <span class="text-sm font-medium text-text">${esc(a.area_nombre)}</span>
          </div>
          ${estadoPill(a)}
        </div>
        <div class="mt-3 flex gap-3">
          ${avatarHtml(a)}
          <div class="min-w-0 flex-1">
            <p class="font-medium text-text">${esc(a.estudiante_nombre)} · ${esc(a.estudiante_codigo)}</p>
            <p class="text-sm text-text-muted">
              Ficha: ${esc(a.ficha_nombre)} · enviada ${esc(D().formatDate(a.ficha_fecha))}
              ${MODE === "admin" ? ` · tutor: ${esc(a.docente_nombre)}` : ""}
            </p>
            <p class="mt-1 text-sm text-text">"${esc(a.justificacion_resumen)}"</p>
            ${
              a.entidad_sugerida_nombre
                ? `<p class="mt-1 text-xs text-text-muted">Entidad sugerida: ${esc(a.entidad_sugerida_nombre)}</p>`
                : ""
            }
          </div>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">${accionesCard(a)}</div>
      </article>`
      )
      .join("");
  }

  function accionesDrawer(a) {
    if (MODE === "admin") return "";
    const parts = [];
    if (a.estado === "pendiente") {
      parts.push(`<button type="button" class="btn-secondary" data-revisar="${esc(a.id)}">Revisar</button>`);
      parts.push(
        `<button type="button" class="btn-primary" data-derivar="${esc(a.id)}">➜ Derivar${
          a.entidad_sugerida_nombre ? ` a ${esc(a.entidad_sugerida_nombre)}` : ""
        }</button>`
      );
      parts.push(`<button type="button" class="btn-ghost text-danger" data-descartar="${esc(a.id)}">Descartar</button>`);
    } else if (a.estado === "revisada") {
      parts.push(
        `<button type="button" class="btn-primary" data-derivar="${esc(a.id)}">➜ Derivar${
          a.entidad_sugerida_nombre ? ` a ${esc(a.entidad_sugerida_nombre)}` : ""
        }</button>`
      );
      parts.push(`<button type="button" class="btn-ghost text-danger" data-descartar="${esc(a.id)}">Descartar</button>`);
    } else if (a.estado === "descartada") {
      parts.push(`<button type="button" class="btn-primary" data-reactivar="${esc(a.id)}">Reactivar</button>`);
    }
    return parts.join("");
  }

  function openDrawer(id) {
    const a = D().findAlerta(id);
    if (!a) return;
    if (MODE === "docente" && a.docente_id !== D().DOCENTE_DEMO.id) {
      toast("No tienes acceso a esta alerta", "error");
      return;
    }
    selectedId = id;
    const bp = basePath();
    document.querySelector("[data-drawer-sub]").textContent = `${a.area_nombre} · ${a.nivel_alerta}`;
    document.querySelector("[data-drawer-body]").innerHTML = `
      <div class="flex flex-wrap items-center gap-2">
        ${nivelBadge(a.nivel_alerta)}
        <span class="font-medium">${esc(a.area_nombre_largo || a.area_nombre)}</span>
      </div>
      <div class="flex gap-3 items-center">
        ${avatarHtml(a)}
        <div>
          <p class="font-medium">${esc(a.estudiante_nombre)}</p>
          <p class="text-sm text-text-muted">${esc(a.estudiante_codigo)} · ${esc(a.estudiante_ciclo)}</p>
        </div>
      </div>
      <p class="text-sm text-text-muted">
        Origen: ${esc(a.ficha_nombre)} · enviada ${esc(D().formatDate(a.ficha_fecha))}
        ${MODE === "admin" ? `<br/>Tutor: ${esc(a.docente_nombre)}` : ""}
      </p>
      <div>
        <h3 class="text-sm font-semibold text-text">Justificación de la IA</h3>
        <p class="mt-1 text-sm text-text leading-relaxed">"${esc(a.justificacion)}"</p>
      </div>
      <div class="flex flex-wrap gap-3 text-sm">
        <span>Entidad sugerida: <strong>${esc(a.entidad_sugerida_nombre || "—")}</strong></span>
        <span>${estadoPill(a)}</span>
      </div>
      <a class="btn-secondary btn-sm inline-flex" href="${esc(bp)}pages/docente/ficha-respuestas.html?fl=${esc(a.ficha_llenada_id)}">📄 Ver la ficha llenada</a>
    `;
    document.querySelector("[data-drawer-foot]").innerHTML = accionesDrawer(a);

    const backdrop = document.getElementById("drawer-alerta-backdrop");
    const drawer = document.getElementById("drawer-alerta");
    drawer.hidden = false;
    backdrop.classList.remove("hidden");
    requestAnimationFrame(() => drawer.classList.add("is-open"));
  }

  function closeDrawer() {
    const backdrop = document.getElementById("drawer-alerta-backdrop");
    const drawer = document.getElementById("drawer-alerta");
    drawer.classList.remove("is-open");
    setTimeout(() => {
      drawer.hidden = true;
      backdrop.classList.add("hidden");
    }, 200);
    selectedId = null;
  }

  async function onRevisar(id) {
    const r = D().patchAlertaEstado(id, "revisada", {
      docente_id: D().DOCENTE_DEMO.id,
      from: "revisar",
    });
    if (!r.ok) return toast(r.error, "error");
    toast("Alerta marcada como revisada");
    renderLista();
    if (selectedId === id) openDrawer(id);
  }

  async function onDescartar(id) {
    const ok = await window.AppConfirm?.request({
      title: "Descartar alerta",
      message:
        "<p>¿Descartar esta alerta? Podrás <strong>reactivarla</strong> después si fue un error.</p>",
      confirmLabel: "Descartar",
      variant: "danger",
    });
    if (!ok) return;
    const r = D().patchAlertaEstado(id, "descartada", { docente_id: D().DOCENTE_DEMO.id });
    if (!r.ok) return toast(r.error, "error");
    toast("Alerta descartada", "warning");
    renderLista();
    if (selectedId === id) openDrawer(id);
  }

  async function onReactivar(id) {
    const r = D().patchAlertaEstado(id, "revisada", {
      docente_id: D().DOCENTE_DEMO.id,
      from: "reactivar",
    });
    if (!r.ok) return toast(r.error, "error");
    toast("Alerta reactivada (revisada). Ya puedes derivarla.");
    renderLista();
    if (selectedId === id) openDrawer(id);
  }

  function onDerivar(id) {
    window.location.href = `derivaciones.html?alerta=${encodeURIComponent(id)}`;
  }

  function fillAreas() {
    const sel = document.getElementById("filtro-area");
    if (!sel) return;
    D().AREAS.forEach((a) => {
      const opt = document.createElement("option");
      opt.value = a.id;
      opt.textContent = a.corto || a.nombre;
      sel.appendChild(opt);
    });
  }

  function setChipActive(estado) {
    filtroEstado = estado;
    document.querySelectorAll("[data-filtro-estado]").forEach((btn) => {
      const v = btn.getAttribute("data-filtro-estado");
      const on = v === estado;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
  }

  function bind() {
    fillAreas();

    document.querySelector("[data-contadores]")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filtro-estado]");
      if (!btn) return;
      setChipActive(btn.getAttribute("data-filtro-estado") ?? "");
      renderLista();
    });

    ["filtro-nivel", "filtro-area", "filtro-q", "filtro-docente", "filtro-desde", "filtro-hasta"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener(el.tagName === "INPUT" ? "input" : "change", renderLista);
    });

    document.getElementById("btn-limpiar")?.addEventListener("click", () => {
      const nivel = document.getElementById("filtro-nivel");
      const area = document.getElementById("filtro-area");
      const q = document.getElementById("filtro-q");
      if (nivel) nivel.value = "";
      if (area) area.value = "";
      if (q) q.value = "";
      const doc = document.getElementById("filtro-docente");
      if (doc) doc.value = "";
      const desde = document.getElementById("filtro-desde");
      const hasta = document.getElementById("filtro-hasta");
      if (desde) desde.value = "";
      if (hasta) hasta.value = "";
      setChipActive(MODE === "docente" ? "pendiente" : "");
      renderLista();
    });

    document.querySelector("[data-lista]")?.addEventListener("click", (e) => {
      const t = e.target.closest("[data-ver],[data-revisar],[data-derivar],[data-descartar],[data-reactivar]");
      if (!t) return;
      if (t.hasAttribute("data-ver")) openDrawer(t.getAttribute("data-ver"));
      else if (t.hasAttribute("data-revisar")) onRevisar(t.getAttribute("data-revisar"));
      else if (t.hasAttribute("data-derivar")) onDerivar(t.getAttribute("data-derivar"));
      else if (t.hasAttribute("data-descartar")) onDescartar(t.getAttribute("data-descartar"));
      else if (t.hasAttribute("data-reactivar")) onReactivar(t.getAttribute("data-reactivar"));
    });

    document.querySelector("[data-drawer-foot]")?.addEventListener("click", (e) => {
      const t = e.target.closest("[data-revisar],[data-derivar],[data-descartar],[data-reactivar]");
      if (!t) return;
      if (t.hasAttribute("data-revisar")) onRevisar(t.getAttribute("data-revisar"));
      else if (t.hasAttribute("data-derivar")) onDerivar(t.getAttribute("data-derivar"));
      else if (t.hasAttribute("data-descartar")) onDescartar(t.getAttribute("data-descartar"));
      else if (t.hasAttribute("data-reactivar")) onReactivar(t.getAttribute("data-reactivar"));
    });

    document.getElementById("btn-drawer-cerrar")?.addEventListener("click", closeDrawer);
    document.getElementById("drawer-alerta-backdrop")?.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !document.getElementById("drawer-alerta")?.hidden) closeDrawer();
    });

    const params = new URLSearchParams(window.location.search);
    const openId = params.get("alerta") || params.get("ver");
    setChipActive(filtroEstado);
    renderLista();
    if (openId) openDrawer(openId);
  }

  document.addEventListener("DOMContentLoaded", bind);
})();
