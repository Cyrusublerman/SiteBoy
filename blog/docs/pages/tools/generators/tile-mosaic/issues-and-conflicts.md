# Tile Mosaic — Issues and Conflicts

## ERROR

**[RESOLVED]** **[BUG] Generator Not Implemented (Stub)**
Full implementation present in `tile-mosaic.gen.js` v1.0.0: rectPacker (GEO-016) with Uniform Grid, Packed Rects A, Packed Rects B; offscreen sprite cache (CANVAS-008); pseudo-3D lighting (PAT-008); noise overlay (PAT-009); sprite blit (CANVAS-009); Breathing, Morph Layouts, Texture Drift, and All animation modes (ANIM-008, ANIM-009, ANIM-010).

**[RESOLVED]** **[BUG] tileSize Parameter Has No Effect**
Now read by `_buildLayout` for packed rect packing; controls base tile dimension with ±40% variance.

---

## WARN

**[RESOLVED]** **[STANDARDS] No animation Block in SCRIPT_CONFIG**
`animation: { type: 'infinite', defaultFps: 60, sequencer: false, animationExport: false }` added.

**[RESOLVED]** **[STANDARDS] No export Block in SCRIPT_CONFIG**
`export: { png: true, gif: false, webm: false }` added. GIF/WebM disabled: infinite animation with no loop point.

**[RESOLVED]** **[STANDARDS] No presets in SCRIPT_CONFIG**
5 presets added: Geometric, Organic, Neon Grid, Mosaic Flow, Pastel Dream.

**[PARTIAL]** **[CONFLICT] Canvas Size Conflict (spec vs live)**
Spec states 900×900. Implemented at 800×800. Explicit design decision documented in DESCRIPTION infoSection: "The spec value of 900×900 was not adopted." Spec canvas size not adopted but decision is now recorded.

---

## Stale Documentation

**[STALE DOC] [DOC-028] — migration-log.md States Generator Not Implemented**

Migration log was written against the stub (v(none)). States "Generator is not implemented" with 10 missing subsystems. Live source is v1.0.0 with full implementation (rectPacker, offscreen sprite cache, pseudo-3D lighting, noise overlay, 4 animation modes). Migration log must be rewritten.

---

**[RESOLVED 2026-04-30] [DOC-024] — Pack Docs Refreshed Against Live v1.1.0**

`description.md`, `ui-layout.md`, `mechanisms.md`, and `performance.md` fully rewritten against live v1.1.0 source. Canvas 800×800 confirmed; all parameters documented including TIL-03 Z-stack, TIL-04 per-tile overlay, TIL-05 colourway, TIL-06 Truchet/Hex/Triangle tile types. DOC-024 closed.

---

## NOTE

**[RESOLVED]** **[RESEARCH] Rect Packing Complexity**
Shelf-first heuristic (GEO-016) implemented for both Packed Rects A (insertion order) and Packed Rects B (tiles sorted by descending height before packing). Performance documented in PERFORMANCE infoSection.

**[RESOLVED]** **[RESEARCH] Sprite Grammar System**
All 6 tile types implemented: Concentric (concentric arc rings), Wedge (6-sector pie), Stripe (5 bands), Solid (fillRect), Texture (fBm noise multiply blend), Micro (10 fine bands). Each rendered once to OffscreenCanvas per unique `(type, w, h, colorIdx)` tuple; subsequent blits use cached sprite.

---

## v4 turn log (2026-04-23)

- **GEN-016 (P1, WONTFIX):** Reference source is a placeholder stub; strict source parity to live full tile pipeline is not meaningful.
- **GEN-017 (P1, WONTFIX):** Reference single-parameter stub contract diverges from live 14-parameter implementation.
- **GEN-018 (P1, WONTFIX):** Reference minimal script skeleton diverges from live presets/animation/export/info architecture.
- **ARCH-017 (P1, FIXED):** Live tile-mosaic imports no modules from `assets/js/shared/` (`zero-shared-imports`).
- **PERF-007 (P2, WONTFIX):** No worker/GPU acceleration path for cache/rebuild and overlay-heavy pipeline.
- **DOC-023 (P2, FIXED):** `migration-log.md` updated to live v1.0.0 implementation state.
- **DOC-024 (P2, FIXED):** description.md, ui-layout.md, mechanisms.md, performance.md fully rewritten against live v1.1.0 — 2026-04-30.
