/**
 * Verificación OBSERVACIONES.md — dos pasadas lógicas en un solo run.
 * Ejecutar: node tutortrack/scripts/_verify-observaciones.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const js = path.join(__dirname, "..", "js");

function read(name) {
  return fs.readFileSync(path.join(js, name), "utf8");
}

const GRADO_ABREV = {
  "grado-1": "Bach.",
  "grado-2": "Lic.",
  "grado-3": "Mg.",
  "grado-4": "Dr.",
};

const errors = [];
const warns = [];
function fail(msg) {
  errors.push(msg);
}
function warn(msg) {
  warns.push(msg);
}

/* ── Parse SEED docentes (JSON-ish objects) ── */
const docSrc = read("docentes-data.js");
const docentes = [];
const docObjRe =
  /\{\s*"id":\s*"(doc-\d+)"[\s\S]*?"nombres":\s*"([^"]+)"[\s\S]*?"apellido_paterno":\s*"([^"]+)"[\s\S]*?"apellido_materno":\s*"([^"]+)"[\s\S]*?"sexo":\s*"([MF])"[\s\S]*?"email":\s*"([^"]+)"[\s\S]*?"grado_academico_id":\s*"(grado-\d+)"/g;
let m;
while ((m = docObjRe.exec(docSrc))) {
  docentes.push({
    id: m[1],
    nombres: m[2],
    ap: m[3],
    am: m[4],
    sexo: m[5],
    email: m[6],
    grado: m[7],
  });
}
const docById = Object.fromEntries(docentes.map((d) => [d.id, d]));

function expectedEmail(nombres, ap) {
  const inicial = nombres
    .trim()
    .charAt(0)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const ape = ap
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z]/g, "");
  return `${inicial}.${ape}@unamba.edu.pe`;
}

function nombreConGrado(d) {
  return `${GRADO_ABREV[d.grado]} ${d.nombres} ${d.ap} ${d.am}`.trim();
}

console.log(`\n=== PASADA 1: docentes (${docentes.length}) ===`);
for (const d of docentes) {
  const exp = expectedEmail(d.nombres, d.ap);
  if (d.email !== exp) fail(`email ${d.id}: got ${d.email}, want ${exp} (${d.nombres} ${d.ap})`);
}

/* buildRelaciones integrity: extract RELACIONES block by eval */
const relFnMatch = docSrc.match(
  /function buildRelaciones\(por_periodo, derivaciones\) \{[\s\S]*?\n  \}/
);
const relBlockMatch = docSrc.match(/const RELACIONES = \{[\s\S]*?\n  \};/);
if (!relFnMatch || !relBlockMatch) fail("No se pudo extraer RELACIONES/buildRelaciones");
else {
  // eslint-disable-next-line no-new-func
  const buildRelaciones = new Function(
    `${relFnMatch[0]}; return buildRelaciones;`
  )();
  // eslint-disable-next-line no-new-func
  const RELACIONES = new Function(
    `const buildRelaciones = ${buildRelaciones.toString()}; return ${relBlockMatch[0].replace("const RELACIONES = ", "")}`
  )();

  for (const [id, r] of Object.entries(RELACIONES)) {
    const sum = r.por_periodo.reduce((s, p) => s + p.tutorados, 0);
    if (r.periodos_tutor !== r.por_periodo.length)
      fail(`${id} periodos_tutor=${r.periodos_tutor} != len(por_periodo)=${r.por_periodo.length}`);
    if (r.tutorados_historico !== sum)
      fail(`${id} tutorados_historico=${r.tutorados_historico} != sum=${sum}`);
    const vig = r.por_periodo.find((p) => p.periodo === "2026-I");
    const expectVig = vig ? vig.tutorados : 0;
    if (r.tutorados_vigentes !== expectVig)
      fail(`${id} tutorados_vigentes=${r.tutorados_vigentes} != ${expectVig}`);
    for (const p of r.por_periodo) {
      for (const c of p.ciclos || []) {
        if (!/ciclo/i.test(c)) fail(`${id} ciclo sin nombre catálogo: ${c}`);
        if (/^(I|II|III|IV|V|VI|VII|VIII|IX|X)$/.test(c)) fail(`${id} romano: ${c}`);
      }
    }
  }
  console.log(`RELACIONES OK (${Object.keys(RELACIONES).length} docentes)`);
}

/* romanos sueltos en seeds clave */
const romanRe = /["'](I|II|III|IV|V|VI|VII|VIII|IX|X)["']/g;
for (const f of ["docentes-data.js", "estudiantes-data.js", "gestion-periodo-data.js", "matriculas-data.js"]) {
  const t = read(f);
  let rm;
  while ((rm = romanRe.exec(t))) {
    // permitir en nombres de periodo 2026-I etc. — solo si es token solo
    const around = t.slice(Math.max(0, rm.index - 20), rm.index + 25);
    if (/periodo|202\d/.test(around)) continue;
    fail(`romano suelto en ${f}: ${rm[0]} @ ${around.replace(/\s+/g, " ")}`);
  }
}

console.log(`\n=== PASADA 1b: estudiantes HISTORIAL / TUTOR_FALLBACK ===`);
const estSrc = read("estudiantes-data.js");
const fbMatch = estSrc.match(/const TUTOR_FALLBACK = \{([\s\S]*?)\n  \};/);
if (!fbMatch) fail("TUTOR_FALLBACK ausente");
else {
  const fb = {};
  for (const line of fbMatch[1].matchAll(/"(doc-\d+)":\s*"([^"]+)"/g)) {
    fb[line[1]] = line[2];
  }
  for (const [id, label] of Object.entries(fb)) {
    const d = docById[id];
    if (!d) {
      warn(`TUTOR_FALLBACK ${id} no está en SEED docentes`);
      continue;
    }
    const want = nombreConGrado(d);
    if (label !== want) fail(`TUTOR_FALLBACK ${id}: "${label}" != "${want}"`);
  }
  console.log(`TUTOR_FALLBACK OK (${Object.keys(fb).length})`);
}

/* HISTORIAL docente_ids exist + ciclos catalog */
const histMatch = estSrc.match(/const HISTORIAL = \{([\s\S]*?)\n  \};/);
if (!histMatch) fail("HISTORIAL ausente");
else {
  const ids = [...histMatch[1].matchAll(/docente_id:\s*"(doc-\d+)"/g)].map((x) => x[1]);
  const ciclos = [...histMatch[1].matchAll(/ciclo:\s*"([^"]+)"/g)].map((x) => x[1]);
  for (const id of new Set(ids)) {
    if (!docById[id]) warn(`HISTORIAL usa ${id} no en SEED (ok si solo fallback)`);
  }
  for (const c of ciclos) {
    if (!/ciclo$/i.test(c) && !/ciclo/i.test(c)) fail(`HISTORIAL ciclo raro: ${c}`);
    if (/^(I|II|III|IV|V|VI|VII|VIII|IX|X)$/.test(c)) fail(`HISTORIAL romano: ${c}`);
  }
  // Parse por estudiante: matriculas + por_periodo[].periodo
  const blocks = [...histMatch[1].matchAll(/"(est-\d+)":\s*\{([^]*?)\n    \},?/g)];
  for (const [, estId, body] of blocks) {
    const mat = Number((body.match(/^\s*matriculas:\s*(\d+)/m) || [])[1]);
    const nPor = (body.match(/\{ periodo:/g) || []).length;
    if (mat && nPor && mat !== nPor)
      fail(`${estId} matriculas=${mat} != por_periodo=${nPor}`);
  }
  console.log(`HISTORIAL bloques: ${blocks.length}, refs docentes: ${new Set(ids).size}`);
}

console.log(`\n=== PASADA 2: gestion + matrículas cruzada ===`);
const gpSrc = read("gestion-periodo-data.js");
const gpDocs = [...gpSrc.matchAll(/\{ id: "(doc-\d+)", nombre: "([^"]+)"/g)].map((x) => ({
  id: x[1],
  nombre: x[2],
}));
for (const g of gpDocs) {
  const d = docById[g.id];
  if (!d) {
    fail(`gestion DOCENTES ${g.id} no en docentes-data`);
    continue;
  }
  const want = nombreConGrado(d);
  if (g.nombre !== want) fail(`gestion ${g.id}: "${g.nombre}" != "${want}"`);
}

const asig = [...gpSrc.matchAll(/docente_id: "(doc-\d+)", nombre: "([^"]+)"/g)];
for (const [, id, nombre] of asig) {
  const d = docById[id];
  if (!d) {
    fail(`asignación ${id} no en docentes`);
    continue;
  }
  const want = nombreConGrado(d);
  if (nombre !== want) fail(`asignación ${id}: "${nombre}" != "${want}"`);
  if (!gpDocs.some((g) => g.id === id))
    fail(`asignación ${id} fuera del pool DOCENTES`);
}
console.log(`gestion DOCENTES=${gpDocs.length}, asignaciones=${asig.length}`);

/* matrículas: docentes del pool; estudiantes sintéticos est-{cp}-* son locales al módulo */
const matSrc = read("matriculas-data.js");
const seedCfg = [...matSrc.matchAll(/"(cp-\d+)":\s*\{\s*n:\s*(\d+),\s*docentes:\s*\[([^\]]+)\]/g)];
for (const [, cpId, n, docsRaw] of seedCfg) {
  const docs = [...docsRaw.matchAll(/"(doc-\d+)"/g)].map((x) => x[1]);
  for (const id of docs) {
    if (!docById[id]) fail(`SEED_CFG ${cpId} docente desconocido ${id}`);
    if (!gpDocs.some((g) => g.id === id))
      fail(`SEED_CFG ${cpId}: ${id} no está en pool DOCENTES de gestión`);
  }
  // n_matriculados del hub debe coincidir
  const nHub = gpSrc.match(new RegExp(`"${cpId.replace("cp-", "cp-")}":[\\s\\S]*?n_matriculados:\\s*(\\d+)`));
  // buscar en ciclo_periodos
  const hubHit = [...gpSrc.matchAll(new RegExp(`id: "${cpId}"[^}]*n_matriculados: (\\d+)`, "g"))];
  if (hubHit.length) {
    const hubN = Number(hubHit[0][1]);
    if (hubN !== Number(n)) fail(`${cpId} n=${n} != hub n_matriculados=${hubN}`);
  }
  // docentes_asignados deben usar subset de SEED_CFG
  const asigBlock = gpSrc.match(new RegExp(`"${cpId}":\\s*\\[([\\s\\S]*?)\\]`, "m"));
  if (asigBlock) {
    const asigDocs = [...asigBlock[1].matchAll(/docente_id: "(doc-\d+)"/g)].map((x) => x[1]);
    for (const id of asigDocs) {
      if (!docs.includes(id)) fail(`${cpId} asignación ${id} no en SEED_CFG docentes`);
    }
  }
}
console.log(`SEED_CFG cps=${seedCfg.length}`);

const matEstsMain = [...matSrc.matchAll(/estudiante_id:\s*"(est-\d+)"/g)].map((x) => x[1]);
const estIds = [...estSrc.matchAll(/id:\s*"(est-\d+)"/g)].map((x) => x[1]);
const estSet = new Set(estIds);
for (const id of new Set(matEstsMain)) {
  // solo IDs del catálogo principal (est-01…), no est-c01 ni est-cp-*
  if (/^est-\d+$/.test(id) && !estSet.has(id)) fail(`matrícula estudiante desconocido ${id}`);
}

/* sexo heurística nombres femeninos comunes */
const FEM = /^(María|Ana|Rosa|Patricia|Silvia|Claudia|Lucía|Elena|Carmen|Fiorella|Julia|Isabel|Sofía|Valeria|Andrea|Diana|Gabriela)/i;
for (const d of docentes) {
  const first = d.nombres.split(/\s+/)[0];
  if (FEM.test(first) && d.sexo !== "F") fail(`sexo ${d.id} ${d.nombres} debería ser F`);
  if (!FEM.test(first) && /^(Carlos|José|Pedro|Roberto|Fernando|Héctor|Óscar|Luis|Miguel|Juan)/i.test(first) && d.sexo !== "M")
    fail(`sexo ${d.id} ${d.nombres} debería ser M`);
}

/* estudiantes emails */
{
  const estPeople = [];
  const re =
    /\{\s*id:\s*"(est-\d+)"[\s\S]*?nombres:\s*"([^"]+)"[\s\S]*?apellido_paterno:\s*"([^"]+)"[\s\S]*?sexo:\s*"([MF])"[\s\S]*?email:\s*"([^"]+)"/g;
  let em;
  while ((em = re.exec(estSrc))) {
    estPeople.push({ id: em[1], nombres: em[2], ap: em[3], sexo: em[4], email: em[5] });
  }
  for (const e of estPeople) {
    const want = expectedEmail(e.nombres, e.ap);
    if (e.email !== want) fail(`email ${e.id}: got ${e.email}, want ${want}`);
    const first = e.nombres.split(/\s+/)[0];
    if (FEM.test(first) && e.sexo !== "F") fail(`sexo ${e.id} ${e.nombres} debería ser F`);
  }
  console.log(`estudiantes emails/sexo OK (${estPeople.length})`);
}

console.log(`\n=== RESULTADO ===`);
if (warns.length) {
  console.log("Avisos:");
  warns.forEach((w) => console.log("  !", w));
}
if (errors.length) {
  console.log(`FALLÓ (${errors.length}):`);
  errors.forEach((e) => console.log("  ✗", e));
  process.exit(1);
}
console.log("OK — todas las comprobaciones pasaron.");
process.exit(0);
