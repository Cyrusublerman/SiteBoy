# Tile Mosaic — Issues and Conflicts

## ERROR [BUG] — Generator Not Implemented (Stub)

**Location:** `assets/js/tools/generators/scripts/pattern/tile-mosaic.gen.js` — entire file.

**Issue:** Live script is a placeholder. The `draw` function fills the canvas black. `tileSize` parameter is not read. The comment `// TODO: Extract from tile-mosaic.js` references a missing source file.

**Impact:** Catastrophic — generator produces no output.

**Required action:** Full implementation of the intended algorithm (rect packing, sprite generation, pseudo-lighting, noise overlay, animation modes, palette system).

---

## ERROR [BUG] — tileSize Parameter Has No Effect

**Location:** `SCRIPT_CONFIG.parameters` — `tileSize` slider; `draw` function — ignores `params`.

**Fix:** Implement or remove.

---

## WARN [STANDARDS] — No animation Block in SCRIPT_CONFIG

**Rule:** All generators must declare `animation` in SCRIPT_CONFIG.

**Fix:** Add `animation: { type: 'none' }` for the stub.

---

## WARN [STANDARDS] — No export Block in SCRIPT_CONFIG

**Fix:** Add `export: { png: true }` minimum when implemented.

---

## WARN [STANDARDS] — No presets in SCRIPT_CONFIG

**Fix:** Add presets when implementation is complete.

---

## WARN [CONFLICT] — Canvas Size Conflict (spec vs live)

**Spec:** `canvas: { width: 900, height: 900 }`.
**Live:** `canvas: { width: 800, height: 800 }`.

Resolution: adopt spec dimensions when implementing, or explicitly document the 800×800 choice.

---

## NOTE [RESEARCH] — Rect Packing Complexity

The audit flags `rectPacker` (GEO-016) as HIGH priority research gap. Rectilinear bin packing with variable tile sizes is NP-hard in the general case; a heuristic shelf or guillotine algorithm is required for real-time use.

---

## NOTE [RESEARCH] — Sprite Grammar System

The tile grammar (Concentric, Wedge, Stripe, Solid, Texture, Micro) is listed as HIGH priority. Six distinct rendering modes with offscreen canvas sprite caching constitute a significant implementation scope.
