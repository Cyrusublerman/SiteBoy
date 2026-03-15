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

## NOTE

**[RESOLVED]** **[RESEARCH] Gray-Scott Solver Required**
PHYS-005 implemented with degree-normalised graph Laplacian on the proximity graph topology. Seeded with v=0.25 in nodes within 80 px of canvas centre. dt=0.5 per step.

**[PARTIAL]** **[RESEARCH] Jump Flood Algorithm Required**
JFA not implemented. SDF computed via brute-force minimum weighted distance on an 80×80 rasterised grid with per-pixel bounding-box spatial culling. Documented in KNOWN LIMITATIONS as producing stepped/blocky contours at low density or high zoom.
