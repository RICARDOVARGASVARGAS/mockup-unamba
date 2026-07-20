# Observaciones — Datos de prueba (seeds)

Correcciones para que los **datos de ejemplo** sean **realistas** y **coherentes
entre archivos**. Es una maqueta, pero los datos deben "contar una historia
consistente" (el mismo docente es el mismo en todas las pantallas).

> **Tarea para Cursor:** aplicar las reglas de abajo a **todos** los seeds
> (`js/*-data.js`), manteniendo coherencia cruzada. No inventar campos fuera de
> `docs/BD-BACKEND.md`. Revisar dos veces. Al terminar, marcar cada casilla.

## Reglas de datos (aplican a TODOS los seeds)

1. **Email institucional** = `inicial(nombre).apellido_paterno@unamba.edu.pe` y
   **debe coincidir con el nombre real** de la persona (no `l.mamani` para
   "María Quispe").
2. **`sexo` coincide con el nombre** (Silvia/Claudia = F, etc.).
3. **Nombres realistas de la región (Apurímac):** 1–2 nombres + apellido paterno
   + apellido materno. **Evitar apellidos compuestos absurdos** ("Quispe Condori
   Huamán de la Cruz"). Un solo caso con nombre largo *real* está bien para
   probar el envolvimiento de texto, pero con email coherente.
4. **Una persona = los mismos datos en todos los archivos** que la referencian
   (mismo nombre, grado, documento).
5. **Grado/título consistente:** el prefijo mostrado (`Dr.`/`Mg.`/`Lic.`/`Bach.`)
   debe ser el del `grado_academico_id` **real** del docente en
   `docentes-data.js`.
6. **Ciclos:** una sola convención. Usar el **nombre del catálogo** ("Tercer
   ciclo") o su **número** (3) — **no** números romanos sueltos ("III") que no
   están en el catálogo `ciclo`.
7. **Conteos que reconcilien:** en la ficha del docente/estudiante, los
   contadores resumen (`periodos_tutor`, `tutorados_historico`, `matriculas`)
   deben cuadrar con el detalle `por_periodo` (misma cantidad de períodos, sumas
   plausibles).
8. **Coherencia de tutoría:** el tutor asignado a un estudiante
   (`matriculas-data`) debe estar en el **pool de docentes** de ese
   `ciclo_periodo` (`gestion-periodo-data`). Los estudiantes de una matrícula
   deben existir en `estudiantes-data`.

## Bugs concretos encontrados

### Ya corregidos (por Claude, en `docentes-data.js`)
- [x] `doc-06`: email `l.mamani` → `m.quispe`; nombre acortado (era compuesto absurdo).
- [x] `doc-11`: email `m.salazar` → `j.paucar`; nombre acortado.
- [x] `doc-10` (Silvia) y `doc-14` (Claudia): `sexo` M → F.
- [x] Bump de `STORAGE_VERSION` para forzar re-seed.

### Pendientes (Cursor)
- [x] **`docentes-data.js` › `RELACIONES`:** `periodos_tutor` y
  `tutorados_historico` **no cuadran** con `por_periodo` (ej. `doc-01` dice 8
  períodos / 160 tutorados pero lista 5 períodos ≈ 100). Ajustar para que
  reconcilien (o completar `por_periodo`).
  → Resuelto: `buildRelaciones()` deriva conteos desde `por_periodo`
  (`seed-25-v7-observaciones`).
- [x] **`estudiantes-data.js` › `HISTORIAL`:** los **títulos de tutor** no
  coinciden con el grado real del docente. Ejemplos:
  - "Dr. Carlos Quispe Mamani" → `doc-01` es **Bachiller** (debe ser "Bach.").
  - "Mg. María Elena Huamán Torres" → `doc-02` es **Licenciado** ("Lic.").
  - "Lic. José Luis Condori Paucar" → `doc-03` es **Magíster** ("Mg.").
  - "Bach. Ana Rosa Béjar Salas" → `doc-04` es **Doctor** ("Dr.").
  Corregir para que el título salga del grado real (idealmente derivarlo del
  docente, no hardcodearlo).
  → Resuelto: `docente_id` + `tutorLabel()` / `DocentesData.nombreConGrado`
  (+ `TUTOR_FALLBACK` alineado); `matriculas` = len(`por_periodo`)
  (`seed-24-v4-observaciones`).
- [x] **Ciclos en romanos** ("III", "V") en `docentes-data` (`RELACIONES`) y
  `estudiantes-data` (`HISTORIAL`): unificar a la convención elegida (nombre del
  catálogo o número).
  → Convención: **nombre del catálogo** ("Tercer ciclo", …).
- [x] **Revisión cruzada final:** verificar que docentes, estudiantes,
  matrículas, gestión-período y avanzar cuenten la misma historia (mismos IDs,
  nombres, grados y pools).
  → Verificado 2× con `scripts/_verify-observaciones.mjs` (OK). Pools
  matrículas ⊂ `gestion-periodo` DOCENTES; nombres/grados alineados a
  `docentes-data`.

## Cómo revisar (Cursor)
1. Elegir la convención de ciclos y aplicarla en todos los seeds.
2. Derivar títulos de docente desde su `grado_academico_id` (una función), en
   vez de escribir "Dr./Mg." a mano en cada archivo.
3. Recorrer cada `*-data.js` y validar contra las 8 reglas.
4. Segunda pasada: abrir las pantallas afectadas y confirmar que los datos se
   ven realistas y consistentes.
