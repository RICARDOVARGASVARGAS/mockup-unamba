/**
 * fichas-tutorados.js — Docente › matriz estudiantes × fichas + 3 vistas.
 */
(function () {
  const toast = (message, type = "success") =>
    document.dispatchEvent(new CustomEvent("app:toast", { detail: { message, type } }));

  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  function abrevFicha(nombre, index) {
    const clean = String(nombre || "")
      .replace(/^(ficha|encuesta|taller|check-in)\s+(de\s+)?/i, "")
      .trim();
    const words = clean.split(/\s+/).filter((w) => !/^(de|del|la|el|los|las)$/i.test(w));
    const short = (words[0] || "F").slice(0, 4);
    return `F${index + 1} ${short}`;
  }

  function fcps() {
    const cicloId = document.getElementById("sel-ciclo")?.value || FichasCicloData.CICLO_DEMO.id;
    return FichasCicloData.listFcps({
      docenteId: FichasCicloData.DOCENTE_DEMO.id,
      cicloId,
    }).sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
  }

  function celdaSimbolo(estado) {
    switch (estado) {
      case "revisada":
        return { html: "✓", title: "Revisada", clickable: true, cls: "text-success font-bold" };
      case "enviada":
        return { html: "●", title: "Enviada · por revisar", clickable: true, cls: "text-primary font-bold" };
      case "borrador":
        return { html: "◐", title: "Borrador", clickable: false, cls: "text-warning" };
      case "no_habilitada":
        return { html: "🔒", title: "No habilitada", clickable: false, cls: "text-text-muted" };
      default:
        return { html: "○", title: "Sin abrir", clickable: false, cls: "text-text-muted" };
    }
  }

  /** Progreso = enviadas+revisadas / total fichas del docente (como en DISEÑO). */
  function progresoEst(estId, lista) {
    let done = 0;
    const total = lista.length;
    lista.forEach((fcp) => {
      const st = FichasCicloData.estadoCelda(estId, fcp);
      if (st === "enviada" || st === "revisada") done += 1;
    });
    return { done, total };
  }

  function renderMatriz() {
    const lista = fcps();
    const head = document.querySelector("[data-matriz-head]");
    const body = document.querySelector("[data-matriz-body]");
    head.innerHTML = `
      <tr>
        <th class="text-left">Estudiante</th>
        ${lista
          .map(
            (f, i) =>
              `<th class="text-center whitespace-nowrap" title="${esc(f.nombre)}">${esc(abrevFicha(f.nombre, i))}</th>`
          )
          .join("")}
        <th class="text-center">Progreso</th>
      </tr>`;

    body.innerHTML = FichasCicloData.ESTUDIANTES.map((est) => {
      const prog = progresoEst(est.id, lista);
      const warn = prog.done === 0 && prog.total > 0 ? ' <span class="text-warning" title="Sin empezar">⚠</span>' : "";
      const celdas = lista
        .map((fcp) => {
          const st = FichasCicloData.estadoCelda(est.id, fcp);
          const sim = celdaSimbolo(st);
          const fl = FichasCicloData.findLlenado(est.id, fcp.id);
          if (sim.clickable && fl) {
            return `<td class="text-center">
              <a href="ficha-respuestas.html?fl=${esc(fl.id)}" class="${sim.cls} inline-flex h-8 w-8 items-center justify-center rounded hover:bg-primary/10" title="${sim.title}" aria-label="${esc(est.nombres)} · ${esc(fcp.nombre)} · ${sim.title}">${sim.html}</a>
            </td>`;
          }
          return `<td class="text-center"><span class="${sim.cls}" title="${sim.title}">${sim.html}</span></td>`;
        })
        .join("");
      return `
        <tr>
          <td>
            <div class="font-medium text-text">${esc(FichasCicloData.nombreEstudiante(est))}</div>
            <div class="text-xs text-text-muted">${esc(est.codigo)}</div>
          </td>
          ${celdas}
          <td class="text-center font-medium">${prog.done}/${prog.total}${warn}</td>
        </tr>`;
    }).join("");
  }

  function estadoTexto(st) {
    const map = {
      revisada: "✓ Revisada",
      enviada: "● Enviada (por revisar)",
      borrador: "◐ Borrador",
      no_habilitada: "🔒 No habilitada",
      sin_abrir: "○ Sin abrir",
    };
    return map[st] || st;
  }

  function renderPorFicha() {
    const lista = fcps();
    const sel = document.getElementById("sel-ficha");
    if (sel && !sel.dataset.filled) {
      sel.innerHTML = lista
        .map((f, i) => `<option value="${esc(f.id)}">F${i + 1} · ${esc(f.nombre)}</option>`)
        .join("");
      sel.dataset.filled = "1";
    }
    const fcp = FichasCicloData.findFcp(sel?.value) || lista[0];
    const body = document.querySelector("[data-por-ficha-body]");
    if (!fcp) {
      body.innerHTML = "";
      return;
    }
    body.innerHTML = FichasCicloData.ESTUDIANTES.map((est) => {
      const st = FichasCicloData.estadoCelda(est.id, fcp);
      const fl = FichasCicloData.findLlenado(est.id, fcp.id);
      const link =
        (st === "enviada" || st === "revisada") && fl
          ? `<a href="ficha-respuestas.html?fl=${esc(fl.id)}" class="btn-secondary text-sm">Ver respuestas</a>`
          : "";
      return `
        <tr>
          <td class="font-medium">${esc(FichasCicloData.nombreEstudiante(est))}</td>
          <td class="text-text-muted">${esc(est.codigo)}</td>
          <td>${esc(estadoTexto(st))}</td>
          <td class="text-right">${link}</td>
        </tr>`;
    }).join("");
  }

  function renderPorEstudiante() {
    const lista = fcps();
    const sel = document.getElementById("sel-est");
    if (sel && !sel.dataset.filled) {
      sel.innerHTML = FichasCicloData.ESTUDIANTES.map(
        (e) =>
          `<option value="${esc(e.id)}">${esc(FichasCicloData.nombreEstudiante(e))}</option>`
      ).join("");
      sel.dataset.filled = "1";
    }
    const estId = sel?.value || "est-1";
    const body = document.querySelector("[data-por-est-body]");
    body.innerHTML = lista
      .map((fcp, i) => {
        const st = FichasCicloData.estadoCelda(estId, fcp);
        const fl = FichasCicloData.findLlenado(estId, fcp.id);
        const link =
          (st === "enviada" || st === "revisada") && fl
            ? `<a href="ficha-respuestas.html?fl=${esc(fl.id)}" class="btn-secondary text-sm">Ver respuestas</a>`
            : "";
        return `
        <tr>
          <td><span class="text-text-muted">F${i + 1}</span> · ${esc(fcp.nombre)}</td>
          <td>${esc(estadoTexto(st))}</td>
          <td class="text-right">${link}</td>
        </tr>`;
      })
      .join("");
  }

  function switchVista(vista) {
    document.querySelector("[data-vista-matriz]")?.classList.toggle("hidden", vista !== "matriz");
    document.querySelector("[data-vista-ficha]")?.classList.toggle("hidden", vista !== "ficha");
    document.querySelector("[data-vista-estudiante]")?.classList.toggle("hidden", vista !== "estudiante");
    if (vista === "matriz") renderMatriz();
    if (vista === "ficha") renderPorFicha();
    if (vista === "estudiante") renderPorEstudiante();
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.FichasCicloData) return;
    Promise.all([FichasData.ready(), FichasCicloData.ready()])
      .then(() => {
        const n = FichasCicloData.porRevisarCount();
        const el = document.querySelector("[data-por-revisar-n]");
        if (el) el.textContent = String(n);

        document.getElementById("sel-vista")?.addEventListener("change", (e) => {
          switchVista(e.target.value);
        });
        document.getElementById("sel-ciclo")?.addEventListener("change", () => {
          const ciclo = document.getElementById("sel-ciclo");
          const label = ciclo?.selectedOptions?.[0]?.textContent || "";
          const ctx = document.querySelector("[data-contexto]");
          if (ctx) ctx.textContent = `2026-I · ${label}`;
          document.getElementById("sel-ficha")?.removeAttribute("data-filled");
          const n = FichasCicloData.porRevisarCount();
          const el = document.querySelector("[data-por-revisar-n]");
          if (el) el.textContent = String(n);
          switchVista(document.getElementById("sel-vista")?.value || "matriz");
        });
        document.getElementById("sel-ficha")?.addEventListener("change", renderPorFicha);
        document.getElementById("sel-est")?.addEventListener("change", renderPorEstudiante);

        switchVista("matriz");
      })
      .catch((err) => {
        console.error(err);
        toast("Error al cargar matriz", "danger");
      });
  });
})();
