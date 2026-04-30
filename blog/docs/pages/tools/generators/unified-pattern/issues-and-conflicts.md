# Unified Pattern — Issues and Conflicts

## ERROR

**[RESOLVED]** **[BUG] Generator Not Implemented (Stub)**
Full implementation present in `unified-pattern.gen.js` v1.0.0: jittered grid (GEO-018), domain warp (GEO-019), superellipse SDF (GEO-020), nested shapes (GEO-021), smooth union (GEO-022), palette mapper (COLOR-008), SDF renderer (CANVAS-013). Worker offload via `computePixels` active.

**[RESOLVED]** **[BUG] scale Parameter Has No Effect**
Replaced with 15-parameter set across Layout, Shape, and Style groups.

---

## WARN

**[RESOLVED]** **[STANDARDS] No animation Block in SCRIPT_CONFIG**
`animation: { type: 'none' }` added.

**[RESOLVED]** **[STANDARDS] No export Block in SCRIPT_CONFIG**
`export: { png: true, gif: false, webm: false }` added. SVG export not implemented (per-pixel SDF output incompatible with vector export without contour extraction).

**[RESOLVED]** **[STANDARDS] No presets in SCRIPT_CONFIG**
5 presets added: Atomic, Op-Art, Organic, Minimal, Dense.

---

## NOTE

**[RESOLVED]** **[PERFORMANCE] O(W×H×N_cells×nestingLevels) Render Cost**
Tier 3 Worker offload via `computePixels` (main thread never blocked) + per-pixel bounding-box spatial culling (reduces O(N_cells) to O(~9 cells in range) at typical params). Tier 2 adaptive resolution (50% linear scale during slider interaction, idleDelay 300 ms) also active.

## Stale Documentation

**[RESOLVED] [STALE DOC] [DOC-043] — migration-log.md States Generator Not Implemented**

Migration log was written against the stub (v(none)). States "Generator is not implemented" with 7 subsystems missing. Live source is v1.0.0 with full implementation (jittered grid, domain warp, superellipse SDF, nested shapes, smooth union, palette mapper, SDF renderer, Worker offload). **Fixed:** migration log rewritten against v1.0.0.

---

**[RESOLVED] [STALE DOC] [DOC-044] — All Docs Written Against Stub/Spec**

All pack files (ui-layout.md, mechanisms.md, description.md, feature-parity.md, performance.md) were produced when the generator was a stub. **Fixed:** description, ui-layout, mechanisms, and performance docs reconciled with live v1.0.0 behaviour.

---

**[RESOLVED]** **[RESEARCH] Smooth-Min Stability**
Numerically stable log-sum-exp smooth-min implemented: `m − σ·ln(exp((m−a)/σ) + exp((m−b)/σ))` where `m = min(a,b)`. Shift by `m` prevents overflow/underflow for large `|a−b|/σ`.

---

## v4 turn log (2026-04-23)

- **GEN-022 (P1, WONTFIX):** Reference source is a placeholder stub; strict source parity against live implementation is not meaningful.
- **GEN-023 (P1, WONTFIX):** Reference single-parameter stub contract diverges from live 15-parameter implementation by design.
- **GEN-024 (P1, WONTFIX):** Reference minimal script skeleton diverges from live presets/worker/export/info architecture by design.
- **ARCH-026 (P1, FIXED):** Live unified-pattern imports no modules from `assets/js/shared/` (`zero-shared-imports`).
- **DOC-043 (P2, FIXED):** `migration-log.md` rewritten against live implementation.
- **DOC-044 (P2, FIXED):** Stub-era docs reconciled with live v1.0.0 behaviour.
