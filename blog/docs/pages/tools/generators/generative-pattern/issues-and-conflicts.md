# Generative Pattern — Issues and Conflicts

## ERROR

**[RESOLVED]** **[BUG] Generator Not Implemented (Stub)**
Full implementation present in `generative-pattern.gen.js` v1.0.0: hybrid point distribution (GEO-023), proximity graph (GEO-024), Gray-Scott solver (PHYS-005), SDF computation (IMG-018), Blob (PAT-011), Truchet (PAT-010), Nested Contours (PAT-012), Global Contours (PAT-012 variant), flow-field animation (ANIM-012).

**[RESOLVED]** **[BUG] complexity Parameter Has No Effect**
Replaced with 18-parameter set across Points, Connectivity, Evolution, Render, and Animation groups.

---

## WARN

**[RESOLVED]** **[STANDARDS] No animation Block in SCRIPT_CONFIG**
`animation: { type: 'infinite', defaultFps: 60 }` added.

**[RESOLVED]** **[STANDARDS] No export Block in SCRIPT_CONFIG**
`export: { png: true, gif: false, webm: false }` added. GIF/WebM disabled: animation advances monotonically (no loop point).

**[RESOLVED]** **[STANDARDS] No presets in SCRIPT_CONFIG**
4 presets added: Truchet Grid, Blob Field, RD Contours, Global Web.

---

## Stale Documentation

**[STALE DOC] [DOC-026] — migration-log.md States Generator Not Implemented**

Migration log was written against the stub (v(none)). States "Generator is not implemented." Live source is v1.0.0 with a full implementation (Gray-Scott solver, proximity graph, 4 render modes, flow animation). Migration log must be rewritten to reflect the current implementation state and record which roadmap items were completed.

---

**[STALE DOC] [DOC-027] — All Docs Written Against Stub/Spec**

All pack files (ui-layout.md, mechanisms.md, description.md, feature-parity.md, performance.md) were produced when the generator was a stub. `ui-layout.md` says "Status: Unimplemented stub" and documents only the single `complexity` stub parameter. `mechanisms.md` and `description.md` likely describe the spec intent (JFA for SDF, full 19-param set) rather than the actual implementation (brute-force 80×80 SDF grid, 18-param set). Full review of all docs against live v1.0.0 source required before these can be used.

---

## NOTE

**[RESOLVED]** **[RESEARCH] Gray-Scott Solver Required**
PHYS-005 implemented with degree-normalised graph Laplacian on the proximity graph topology. Seeded with v=0.25 in nodes within 80 px of canvas centre. dt=0.5 per step.

**[PARTIAL]** **[RESEARCH] Jump Flood Algorithm Required**
JFA not implemented. SDF computed via brute-force minimum weighted distance on an 80×80 rasterised grid with per-pixel bounding-box spatial culling. Documented in KNOWN LIMITATIONS as producing stepped/blocky contours at low density or high zoom.

---

## v4 turn log (2026-04-23)

- **GEN-013 (P1, SKIPPED-PHASE-3):** Reference source is a placeholder stub; live implementation is full pipeline and cannot be strict source-parity matched.
- **GEN-014 (P1, SKIPPED-PHASE-3):** Reference single-parameter contract (`complexity`) diverges from live 18-parameter multi-group contract.
- **GEN-015 (P1, SKIPPED-PHASE-3):** Reference minimal script skeleton diverges from live presets/animation/export/info architecture.
- **ARCH-016 (P1, FIXED):** Live generative-pattern imports no modules from `assets/js/shared/` (`zero-shared-imports`).
- **PERF-006 (P2, SKIPPED-PHASE-3):** No worker/GPU acceleration path for rebuild-heavy SDF/evolution pipeline. Queued as `Q-mid-fix-PERF-006` due broad refactor scope.
- **DOC-021 (P2, FIXED):** `migration-log.md` updated to live v1.0.0 implementation state.
- **DOC-022 (P2, OPEN):** Pack docs remain partially stub-era and need full refresh against live implementation details.
