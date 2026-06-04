# Cursive Glyph Builder — Agent handover

**Updated:** 2026-05-24  
**Route:** `#tools/utilities/cursive-glyph-builder`  
**Tracker:** F4 `blog/docs/todo/F4-cursive-glyph-builder-ux.md` — **REVIEW**  
**Parent:** F1 — **DONE**

---

## 0. Next agent — start here

| P | Task | Done when |
| --- | --- | --- |
| **P0** | Hard refresh → GLYPHS tab with populated library | Ink fully visible in cells; no systematic clip at cell edges |
| **P0** | If GLYPHS OK: run §9 browser smoke; F4 → **DONE** in item file + `index.md` | Predicates (a)–(k) verified |
| **P1** | Re-save one old capture if atlas still wrong | New `drawing.captureGeometry` from save path; compare to estimated |
| **P2** | Optional: ZIP `library.settings` round-trip; atlas pagination | User request only |

**Active defect (2026-05-24):** GLYPHS atlas clipped ink when replay used typographic capture box + `overflow:hidden` + independent W/H rounding. Latest fix: **bbox-fit** in `GlyphAtlasGrid` (§5). **User reported clip persisted through several iterations** — verify in browser before closing F4.

**Do not:** duplicate page spec; add CANVAS sidebar tab; edit `.cursor/plans/*`; put glyph CSS only in `styles.css` (not loaded).

---

## 1. Purpose

Prompt-driven cursive capture over reference OpenType font. Ink → glyph-space strokes + `captureGeometry` per drawing. IndexedDB + ZIP export.

**Loop:** SESSION font → trace row → Enter (save + next).

---

## 2. File map (SSoT)

| Concern | Owner |
| --- | --- |
| Tool shell, views, preview, atlas handoff | `assets/js/tools/utilities/cursive-glyph-builder.js` |
| Atlas grid DOM + cell render | `assets/js/shared/components/drawing/GlyphAtlasGrid.js` |
| Capture pointer, ink, guides | `assets/js/shared/components/drawing/GlyphCaptureCanvas.js` |
| Toolbar + INFO | `assets/js/shared/components/tool/GlyphBuilderToolbar.js` |
| **Coordinate system (glyph ↔ canvas)** | `assets/js/shared/algorithms/typography/stroke-capture.js` |
| Bezier fit | `assets/js/shared/algorithms/typography/bezier-fit.js` |
| Queue / row window | `assets/js/shared/algorithms/typography/prompt-sequencer.js` |
| OpenType | `assets/js/shared/typography/opentype-adapter.js` |
| IndexedDB | `assets/js/shared/data/glyph-library-store.js` |
| **Glyph-builder + atlas CSS** | `assets/css/tools.css` (via `index.css` — **not** `styles.css`) |
| Operator doc | `blog/docs/pages/tools/utilities/cursive-glyph-builder.md` §0 |
| Tracker | `blog/docs/todo/F4-cursive-glyph-builder-ux.md` |

---

## 3. Views

| View | `_session.view` | Renders via |
| --- | --- | --- |
| Capture | `capture` | `GlyphCaptureCanvas` on ToolBase canvas |
| Preview | `preview` | `_drawPreviewView` on ToolBase canvas (cached bitmap) |
| GLYPHS | `atlas` | `GlyphAtlasGrid` DOM; canvas hidden (`atlas-active` CSS) |

Toggle: toolbar PREVIEW / GLYPHS → `_setCanvasView`. Atlas: `_renderAtlasDOM()` → `_getAtlasEntries()` → `_atlasGrid.update()`.

---

## 4. Coordinate system (single frame)

**Storage:** strokes in glyph-space (baseline `y=0`, x scaled by capture advance; `fontAdvanceWidth` = UPM at save).

**Persisted viewport:** `DrawingRecord.captureGeometry` — set on save via `captureGeometryFromCanvasRow(lay.active, metrics, lay.fontSize)`.

| Field | Meaning |
| --- | --- |
| `canvasAdvanceWidth` | Run advance px (`_runAdvancePx` at trace size) |
| `captureHeight` | Ascender→descender band px |
| `ascPx`, `descPx` | Band metrics at `traceFontSize` |
| `fontAdvanceWidth` | UPM |
| `traceFontSize` | Trace size at capture |

**Projection helpers** (`stroke-capture.js`):

| Function | Use |
| --- | --- |
| `promptGeometryFromCapture(g)` | Normalise at save |
| `linePromptGeometry(x, baselineY, advanceW)` | Preview compose, ghost/active ink |
| `viewportPromptGeometry(g, viewportW)` | Atlas 1:1 capture replay |
| `projectStrokes` | Alias for `denormaliseStrokes` |
| `captureCellDimensions(g, displayScale)` | Cell W/H with height derived from width (uniform s) |
| `canvasStrokeBounds(strokes, lineW)` | Atlas ink AABB |
| `fitTransformForBounds(bounds, vw, vh, fill)` | Atlas letterbox |

**Preview:** `_drawComposedLine` — greedy segment match on lorem; `linePromptGeometry` + segment advance from `_runAdvancePx`.

**Atlas geometry backfill:** `_captureGeometryForAtlas` — if stored geom missing or advance drift >5% vs `_runAdvancePx`, rebuild via `captureGeometryLocal`.

---

## 5. Atlas pipeline (current)

**Layout** (`GlyphAtlasGrid._applyLayout`):

- One shared `displayScale` from container width ÷ target single-glyph column width.
- Cell size: `captureCellDimensions(geom, displayScale)` — **height from width** (avoids W/H rounding mismatch).

**Render** (`_renderInk`) — **2026-05-24**:

1. Project at native capture width: `viewportPromptGeometry(geom, geom.canvasAdvanceWidth)`.
2. `canvasStrokeBounds(strokes, lineW)`.
3. `fitTransformForBounds(..., cellW, cellH, INK_CELL_FILL=0.88)` — scale + centre.
4. **No** typographic clip rect.
5. `.glyph-atlas-cell { overflow: visible }`.

**Tuning:** `GlyphAtlasGrid.INK_CELL_FILL` (default `0.88`).

**CSS:** `.tool-canvas-area.atlas-active` shows grid, hides `.canvas-container`; grid `overflow-y/x: auto`.

---

## 6. Session / persistence

- Runtime state: `this._session` (library, queue, view, flags).
- Autosave: IndexedDB via `glyph-library-store.js`.
- **Gap:** ZIP export/import omits `library.settings` (typography/ink).

**Legacy drawings:** may lack `captureGeometry` or have wrong advance (early `widthSpan × em` heuristics). Re-save fixes; `_captureGeometryForAtlas` reconciles advance drift.

---

## 7. Pitfalls

| Stale assumption | Truth |
| --- | --- |
| Atlas draws on main canvas | `GlyphAtlasGrid` DOM + per-cell `<canvas>` |
| `_drawAtlasView` exists | Removed; use `_renderAtlasDOM` |
| Glyph CSS in `styles.css` | Must be in `tools.css` |
| Atlas = typographic box clip | Now bbox-fit; capture box still drives **cell size** |
| `denormaliseStrokes` in tool | Use `projectStrokes` + geometry helpers |
| Inline `display:flex` on atlas grid | Breaks `display:none`; grid visibility CSS-only |

---

## 8. Key tool methods

`_resolvePromptLayout`, `_renderCurrentPrompt`, `_saveAndNext`, `_setCanvasView`, `_drawPreviewView`, `_renderAtlasDOM`, `_getAtlasEntries`, `_captureGeometryForAtlas`, `_captureGeometryFromLayout`, `_drawComposedLine`, `_typography`, `_onToolBaseInit` (resize re-injection).

---

## 9. Browser smoke

- [ ] Load reference font; trace single + digraph; Enter; ghost ink on prior rows
- [ ] SESSION typography affects row pitch / ref paths
- [ ] VIEW guides, PAN⊥trace, ink width/cap in capture + preview + GLYPHS
- [ ] PREVIEW lorem + captured chars; grey ref gaps
- [ ] **GLYPHS:** full ink visible per cell; multi-width cells (single/digraph); scroll if overflow
- [ ] SCALE fit/fill/actual in capture
- [ ] Export PNG + ZIP; import round-trip
- [ ] Resize → layout stable; atlas redraws

---

## 10. If GLYPHS still clips (debug order)

1. Hard refresh / cache bust.
2. DevTools: cell `clientWidth/Height` vs canvas bitmap size.
3. One drawing: compare `captureGeometry.canvasAdvanceWidth` vs `_runAdvancePx(promptText, …, traceFontSize)`.
4. Re-save prompt → fresh `captureGeometry`.
5. Inspect `drawing.metrics.bbox` vs band — ink outside band is expected; bbox-fit should still show all ink.
6. If bbox-fit fails: log `canvasStrokeBounds` null (no beziers?) or `fitTransformForBounds` scale.

**Alternative (user rejected visually but typographically pure):** replay capture box 1:1 to cell edges without bbox-fit — requires correct `captureGeometry` on every drawing.

---

## 11. Open gaps (non-blocking unless requested)

| # | Gap |
| --- | --- |
| 1 | Atlas pagination / virtual scroll for huge libraries |
| 2 | Preview lowercase lorem only |
| 3 | ZIP settings round-trip |
| 4 | Persist `captureGeometry` backfill on session load (avoid re-estimate) |
| 5 | Page doc §4.3 still says atlas "clips" — update when verified fixed |

---

## 12. References

- F4: `blog/docs/todo/F4-cursive-glyph-builder-ux.md`
- Page spec: `blog/docs/pages/tools/utilities/cursive-glyph-builder.md`
- Prior transcript: agent session on atlas/coordinates (2026-05-24)
