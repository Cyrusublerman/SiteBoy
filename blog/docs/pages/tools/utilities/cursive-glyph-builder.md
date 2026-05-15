# Cursive Glyph Library Builder — Idea & Implementation

**Status:** draft analysis  
**Target section:** `#tools/cursive-glyph-builder` (utility, not generative)  
**Owner files (once built):** `assets/js/tools/utilities/cursive-glyph-builder.js`, `assets/js/shared/algorithms/typography/{stroke-capture,bezier-fit,prompt-sequencer}.js`, `assets/js/shared/components/drawing/GlyphCaptureCanvas.js`, `assets/js/shared/typography/opentype-adapter.js`, `assets/js/shared/data/glyph-library-store.js`

---

## 1. Idea Summary

Guided prompt-driven capture tool. User draws one prompt at a time (single glyph → digraph → trigraph) on top of a reference-font glyph. Each drawing is stored as raw polylines + stroke order + normalised coordinates, tagged with prompt context. Output = one JSON library file usable as training/reconstruction data for cursive rendering.

**System equation:**  
`drawing = geometry + sequence + context`

**User loop:** `Load → Prompt → Draw → Save → Next`. No browsing. No metadata editing mid-flow.

---

## 2. Conceptual Model (P0.5 classification)

| Field | Value |
| --- | --- |
| Architecture | **Modular Coordinated System** (one state store, 6 coupled engines) |
| Primary data structure | `LibraryFile` (JSON tree: project → queue → drawings → indexes) |
| Secondary data | `Prompt`, `DrawingRecord`, `Stroke`, `Anchor`, `ReferenceFont` |
| PCS | Capture canvas (reference glyph + ink layer + overlays) |
| Mode | Singular — prompt type varies only by context length |

**Integration relationships (3):**
1. Prompt Engine determines what the Canvas renders behind the ink.
2. Drawing Engine emits strokes that are converted by the Normalisation Engine into library-space coordinates keyed by the active Prompt.
3. Storage Layer is the single source of truth; autosaving is triggered by completion of a `DrawingRecord`, not by UI events.

---

## 3. Core Data (CORE_DATA)

```text
LibraryFile {
  version, project{name,createdAt,updatedAt},
  referenceFont{ name, source:'upload'|'google', fileName, fontHash,
                 metrics{ unitsPerEm, ascender, xHeight, capHeight, baseline, descender },
                 glyphData },
  queueState{ currentIndex, prompts[], skipDeferred[], history[] },
  drawings: { [drawingId]: DrawingRecord },
  indexes: { byText, byType, byCentreGlyph, byConnection, byDate },
  settings,
  stats { singlesCovered, digraphsCovered, trigraphsCovered,
          totalPrompts, totalDrawings, coveragePercent }
}

Prompt { id, type:'single'|'digraph'|'trigraph'|'hardpair'|'variation',
         text, centreGlyph, leftContext, rightContext,
         priority, variationsDrawn, deferred:bool,
         skipped:bool, reason }

DrawingRecord { id, promptId, variationIndex, type, text, characters[],
                centreGlyph, leftContext, rightContext,
                strokes[], strokeOrder[], anchors[], connections[],
                metrics{ bbox, advanceWidth, overflow },
                referenceFont, createdAt, updatedAt, tags[], status }

Stroke { id, order,
         rawPoints[{x,y,t}],          // device-space, kept for export raw/ folder
         smoothed[{x,y}],              // Chaikin output, normalised glyph-space
         beziers[ BezierSegment ],     // cubic path, normalised glyph-space
         duration }

BezierSegment { a0:{x,y}, h1:{x,y}, h2:{x,y}, a1:{x,y} }  // cubic: a0 → h1 → h2 → a1

Anchor { id, role:'entry'|'exit'|'tangent',
         strokeId, segmentIndex, t,
         x, y, angle, isEndpoint }
```

**Invariants (per Q9, Q10, Q11, Q12):**
1. `strokes[*].beziers` and `anchors[*]` coordinates live in **normalised glyph-space per prompt**: `x ∈ [0, advanceWidth]` where `advanceWidth` sums the reference font's per-character advances for `prompt.text`; `y` = 0 at **baseline** (positive upward).
2. `y` is split into three informational bands using reference-font metrics:
   - Descender band: `y ∈ [descender, 0]`
   - x-height band: `y ∈ [0, xHeight]`
   - Ascender band: `y ∈ [xHeight, ascender]`
3. Storage is vector-only (anchors + handles). No bitmap. Raw pointer points retained only for export `raw/` folder.

---

## 4. Requirements (REQ_LIST, must-do)

1. All 5 phases present in queue. Phase 1 (singles) is MVP priority; Phases 2–5 ship in same build if time permits, otherwise gated by a feature-flag constant.
2. Reference font: two sources — **upload** (`.ttf`/`.otf`) OR **Google Fonts list** (reuse `window.googleFontsLoader`). Font file bytes hashed (SHA-256 via `crypto.subtle`) and retained for ZIP export.
3. Hard-pair list (Phase 4) auto-derived from the font's kerning table (opentype.js `font.kerningPairs`); top-N by absolute adjustment magnitude. No hand curation.
4. Mandatory overlays on canvas: baseline, x-height, cap-height, ascender line, ascender-band shading (from x-height to ascender band), descender, left/right advance bounds, bbox. Toggle each control from **VIEW** on the utility toolbar (below the site subheader) so sidebar stays within the ≤4 tab ceiling.
5. Freehand capture via Pointer Events. Mouse, stylus, touch all accepted. Pressure **not** stored.
6. Per-stroke undo (last stroke removed). No per-point undo.
7. Stroke order = insertion order; every stroke has a monotonically increasing `order`.
8. On stroke end: raw polyline → `chaikinSmooth` (2 iterations) → cubic Bezier fit → vector storage. Entry/exit anchors extracted; mid-stroke tangent anchors extracted at curvature extrema.
9. Normalisation: performed on `Save + Next`. Output coords are glyph-space per §3 invariants.
10. Completion model: no fixed `requiredVariations`. A prompt is counted "covered" once `variationsDrawn ≥ 1`. Progress metric = **coverage percent** across active queue.
11. If the loaded font has no glyph for a prompt's character, the prompt is **auto-skipped** and logged in `queueState.history`.
12. Variable fonts: use the font's default instance. No axis UI.
13. Autosave to IndexedDB on every `Save + Next`, on `New`, and on `Import`.
14. `Skip` defers the prompt to the end of the queue (appended to `skipDeferred`). A deferred prompt is re-issued after the main queue completes one pass.
15. Resume: on tool load, read active library from IndexedDB, restart at `queueState.currentIndex`.
16. Destructive actions (`New library`, `Import` over existing data, `Clear library`) require confirmation modal. Other actions do not prompt.
17. Export: **single ZIP** via `jszip` (already a dependency). Folder structure per §9.3. No JSON-only export mode.
18. Import: ZIP file produced by this tool only. Schema-validated on read.
19. All persistence is local (IndexedDB). Zero network calls except Google Fonts stylesheet fetch.
20. Hard fail (halt + full-content error overlay) if: IndexedDB unavailable, `opentype.js` fails to parse the font, Web Crypto missing, or corrupted library on import.
21. Footer rail: read-only **`2F`** canvas strip summarising Undo / Clear / Skip / Save+Next (shortcut legend). Primary labelled controls remain in SESSION/PROMPT; exports live under toolbar EXPORT/IMPORT.
22. Header rail: read-only **`2F`** strip on the PCS — prompt text, mode, variation ordinal within the active prompt (`variationsDrawn + 1` display), reference font name.
23. Keyboard shortcuts: `Enter` = Save+Next, `Esc` = Skip, `Ctrl+Z` = Undo, `Ctrl+Shift+Z` = Redo.
24. Every sidebar control wired to a real handler; no stubs.
25. Canvas shows only the **current** prompt's reference glyph; no next-prompt preview.

---

## 5. Architecture Mapping to SiteBoy Toolbase

### 5.1 Section choice

**Tools**, not Art. It is utility (structured data capture), not aesthetic output.

- URL: `#tools/cursive-glyph-builder`
- Registration: `assets/js/sections/tools_section.js` (pages, toolsSections, getDropdownItems, renderTool switch, renderer).
- Asset loader entry: `'cursive-glyph-builder': { script: '.../cursive-glyph-builder.js', className: 'CursiveGlyphBuilder', dependencies: ['algorithms'] }`.

### 5.2 File ownership (SSoT)

| Concern | Owner file | Note |
| --- | --- | --- |
| Tool shell + sidebar + event wiring | `assets/js/tools/utilities/cursive-glyph-builder.js` | ESM ToolBase consumer; render() is entry point |
| Capture canvas (ink + reference glyph + overlays) | `assets/js/shared/components/drawing/GlyphCaptureCanvas.js` (**new**, extends `BaseComponent`) | New component — see §5.3 for DrawCanvas disposition |
| Font parsing + metrics + kerning + glyph outlines | `assets/js/shared/typography/opentype-adapter.js` (**new**) | Wraps `opentype.js`; exposes `loadFromBytes`, `loadFromGoogle`, `getMetrics`, `getGlyphPath`, `getKerningPairs`, `hashBytes` |
| Chaikin smoothing + glyph-space normalisation | `assets/js/shared/algorithms/typography/stroke-capture.js` (**new**, pure) | Imports existing `chaikinSmooth` from `geometry/curve-geometry.js` |
| Cubic Bezier fitting + tangent anchor extraction | `assets/js/shared/algorithms/typography/bezier-fit.js` (**new**, pure) | Heuristic fit: anchors at curvature extrema; handles at `1/3` chord length along tangent |
| Queue generation + phase tables + skip/defer semantics | `assets/js/shared/algorithms/typography/prompt-sequencer.js` (**new**, pure) | No DOM. Phases 1–5. Hard pairs built from font kerning |
| IndexedDB persistence | `assets/js/shared/data/glyph-library-store.js` (**new**) | Thin async wrapper; DB `cursive-glyph-builder`, store `libraries`, key `'active'` |
| ZIP export/import | Inline in tool file; uses `jszip` (already a workspace dep) |

### 5.3 DrawCanvas disposition (Q41)

**Decision: build new `GlyphCaptureCanvas`; do not extend `DrawCanvas`.**

Reasons:
- `DrawCanvas` stores content as a greyscale bitmap (`getImageData`/`putImageData`). Our model stores vector strokes (cubic Beziers + anchors + order). The two storage models are incompatible.
- `DrawCanvas` history uses `ImageData` snapshots. Per-stroke undo requires an array of stroke records, not pixel snapshots.
- We need three stacked layers (reference glyph path, ruled overlays, ink); `DrawCanvas` has two (main + preview) and a bitmap fill model.

Reuse from `DrawCanvas`:
- Pointer-event wiring pattern (pointerdown/move/up/leave + `e.stopPropagation` on context menu).
- Coordinate-mapping helper (`getBoundingClientRect` → canvas-space).
- SVG cursor helper for a visible crosshair at pen tip.

Copy-adapt, do not import. Place shared primitives in `assets/js/shared/utils/pointer-utils.js` only if a second consumer materialises.

### 5.4 Reuse (DO NOT duplicate)

- `window.AnimationFoundation` — not used (event-driven).
- `ComponentLibrary` factory for every sidebar control (buttons, dropdowns, file input, text output, toggles).
- `chaikinSmooth` from `shared/algorithms/geometry/curve-geometry.js`.
- `window.googleFontsLoader` (used by `font-analysis-tool`) for Google Fonts list + load.
- `MathematicalFoundation` / F-system for layout sizes.
- `jszip` (already in `package.json` deps) for export.

### 5.5 Dependencies (library layer)

| Need | Choice | Placement |
| --- | --- | --- |
| TTF/OTF parsing + kerning + glyph outlines | `opentype.js` (**add to npm deps**) | Static import in `opentype-adapter.js` |
| ZIP write/read | `jszip` (already present) | Dynamic import in tool file on first export |
| IndexedDB | Raw `indexedDB` API — no dep | `shared/data/glyph-library-store.js` |
| Hashing | Web Crypto `crypto.subtle.digest('SHA-256', …)` | Inline in `opentype-adapter.js` |
| Google Fonts discovery | Existing `window.googleFontsLoader` | Consumed by `opentype-adapter.js` |

---

## 6. UI Layout (maps to `ui-interface-overview.md §2–3`)

Single archetype: Tool page, PCS = capture canvas.

```
┌────────────────────────────────────────────────────────────┐
│ Header rail (**2F** canvas strip)                           │
├─── Session column ──┬──────── PCS ─────────────────────────┤
│ Sidebar SESSION /     │ Toolbar: VIEW IMPORT EXPORT INFO       │
│ PROMPT tabs         │ Capture canvas (+ header/footer rails) │
├─────────────────────┴────────────────────────────────────────┤
│ Footer rail (**2F** canvas strip — shortcut recap)           │
└────────────────────────────────────────────────────────────────┘
```

Header text is a read-only label component. Footer uses `GeneratorToolbar`-style toolbar (design-law §17: action cells `6F`, status cell `flex: 1 min-width: 30F`).

### 6.1 Sidebar + toolbar surfaces

**Sidebar tabs (2)** — SESSION, PROMPT — keeps headroom below the workspace tab cap.

```
[SESSION]
  Library … New library · Font picker (ZIP import lives under toolbar IMPORT).

[PROMPT]
  Current labels (prompt · phase · coverage)
  Queue actions … Save + Next · Skip · Clear ink

Toolbar (below subheader, aligned with PCS column in landscape):

[VIEW]   overlays + drawing height slider
[IMPORT] library ZIP · font file
[EXPORT] library ZIP · canvas PNG
[INFO]   fetched spec markdown
```

**VIEW toggles**: baseline (`BASE`), descender (`DESC`), x-height (`X-HGT`), cap (`CAP`), reference glyph (`REF`), ascender line (`ASC`), ascender shading (`A-SHD`), left bound (`L-BND`), right bound (`R-BND`), bbox (`BBOX`).

Rails are **`2F`** high label strips painted by `GlyphCaptureCanvas` atop/below the PCS, not sidebar tabs.

Default overlay selection on cold start matches code `DEFAULT_GUIDES`: baseline + descender + x-height + cap + reference glyph; bounds/bbox shading off until enabled in VIEW.

### 6.2 Canvas (PCS)

Three stacked layers inside a single `GlyphCaptureCanvas`:
1. Reference glyph layer — `opentype.js` path → `Path2D` fill, `var(--c-text)` at low alpha.
2. Overlay layer — ruled guides + optional band shading, `var(--c-border)` lines, shaded bands at very low alpha.
3. Ink layer — live user strokes:
   - during drag: raw polyline in `var(--c-text)`;
   - on `pointerup`: replaced by Chaikin-smoothed polyline, then by the cubic Bezier fit rendered via `ctx.bezierCurveTo`.

Canvas internal resolution nominal `40F × 28F` (`560 × 392` when `F=14`). Display mode **`fit`** with **`fillContainer`** so buffers snap to occupied PCS after mount. Horizontal origin uses `≥ 1 F` padded inset proportional to nominal `560 px` canvas width. Baseline Y is `canvasHeight × drawHeightFraction` (slider in VIEW, default `0.7`), matching `_resolvePromptLayout` + `GlyphCaptureCanvas._baselineCanvasY()`.

---

## 7. Capture Pipeline (per drawing)

```
pointerdown     → openStroke({id, order, rawPoints:[]})
pointermove     → rawPoints.push({x, y, t})
pointerup       → closeStroke()
                    smoothed = chaikinSmooth(rawPoints, 2)
                    beziers  = bezierFit(smoothed)              // cubic segments
                    anchors  = extractAnchors(beziers)          // entry + exit + tangent @ curvature extrema
                    redraw ink layer from beziers

Undo            → stroke array pop; redraw ink layer
Redo            → restore from redo stack

Save + Next     → finaliseRecord()
                    normalise all stroke geometry into per-prompt glyph-space:
                      x' = (x - xOrigin) / 1             (device → unnormalised font advance units)
                      y' = (baselineY - y)               // y positive upward, baseline at 0
                      scale by font metrics so x spans [0, advanceWidth]
                    compute metrics { bbox, advanceWidth, overflow }
                    write DrawingRecord into LibraryFile.drawings
                    update indexes + stats.coveragePercent
                    prompt.variationsDrawn += 1
                    queue.advance() → if queue empty, drain skipDeferred into queue
                    IndexedDB.put('active', library)
                    clear ink layer, render next prompt reference glyph

Skip            → prompt.deferred = true
                    push to queueState.skipDeferred
                    queue.advance() (do not save a DrawingRecord)
                    autosave queueState

Clear stroke    → clear current ink layer only (no saved stroke affected — equivalent to Undo-all-unsaved)
```

All coordinate transforms are pure functions in `stroke-capture.js` and `bezier-fit.js`. No DOM access, no globals.

---

## 8. Prompt Queue Generation (phases)

Pure function `buildPromptSet(font, options) -> Prompt[]`. Inputs: parsed `opentype.js` Font object; options object for phase toggles.

| Phase | Type | Seed | Source |
| --- | --- | --- | --- |
| 1 | single | `a–z`, `A–Z`, `0–9`, ASCII punctuation set | frozen const |
| 2 | digraph | top-100 English digraph frequencies | frozen const |
| 3 | trigraph | top-300 English trigraph frequencies | frozen const |
| 4 | hardpair | pairs with largest `|kerningAdjustment|` in the font's kerning table; top-N (N=50 default) | `font.kerningPairs` |
| 5 | variation | all prompts with `variationsDrawn ≥ 1`, shuffled, re-issued indefinitely | derived at runtime |

Queue construction rules:
- Per Q11, prompts whose characters have no glyph in the font are **omitted at queue-build time** and logged once.
- Per Q3, user may move between phases via a phase-jump dropdown in PROMPT tab (deferred: MVP ships linear order only).
- Per Q14, `Skip` appends to `queueState.skipDeferred`. When main queue exhausts, `skipDeferred` is shuffled back into the queue and drained. If user skips again, they re-defer (no infinite loop: each prompt tracks a `skipCount` to keep skipped-twice prompts at queue tail).
- Per Q19, Phase 5 never terminates; coverage % remains the only progress metric.

Phase tables live inline in `prompt-sequencer.js` as `Object.freeze()`-ed arrays. Queue state persisted inside `LibraryFile.queueState`.

---

## 9. Persistence

### 9.1 IndexedDB schema

```
DB name     : 'cursive-glyph-builder'
Version     : 1
Object store: 'libraries'   (keyPath: 'id')
Record      : { id: 'active', payload: LibraryFile, fontBytes: ArrayBuffer }
```

Only one active library at a time (Q22). Autosave on every `Save + Next`, `New`, `Import`, and `Skip` (Q23).

**Halt condition (Q20, Q35):** if `indexedDB.open` fails or is unavailable, the tool displays a full-content error overlay and disables all controls. No in-memory fallback.

### 9.2 Export — ZIP with folder structure (Q17, Q26, Q27, Q29)

`jszip` is used to build the following structure:

```
library-YYYY-MM-DD-HHmm.zip
├── manifest.json                      // LibraryFile core (project, queueState, indexes, stats, settings)
├── referenceFont/
│   ├── font.ttf                       // raw font bytes
│   ├── metrics.json                   // { unitsPerEm, ascender, xHeight, capHeight, baseline, descender, kerningPairs }
│   └── glyphPaths.json                // per-character SVG-path d-strings used during capture
├── raw/                               // per-drawing raw pointer input (pre-smoothing)
│   ├── drawing_000001.json            // { id, promptId, strokes: [{ rawPoints: [{x,y,t}] }] }
│   └── …
├── vectors/                           // per-drawing smoothed + cubic-Bezier output in glyph-space
│   ├── drawing_000001.json            // { id, promptId, strokes: [{ smoothed, beziers }], anchors }
│   └── …
├── json/                              // per-drawing full DrawingRecord (spec §8.1)
│   ├── drawing_000001.json
│   └── …
├── prompts/
│   └── queue.json                     // queueState + full prompts[] + skipDeferred[]
└── indexes.json                       // byText, byType, byCentreGlyph, byConnection, byDate
```

- All four per-drawing folders reference the same `id`; these are parallel views, not a hierarchy.
- ZIP is plain DEFLATE (jszip default). No encryption.
- No user option to trim folders in MVP — full export every time.

### 9.3 Import (Q18)

File picker accepts `.zip` only. On select:
1. Open via `jszip`.
2. Validate presence of `manifest.json` + `referenceFont/font.ttf`.
3. Validate `manifest.version` against tool version (semver minor-compatible).
4. Destructive-action confirmation modal if the active library is non-empty (Q16, Q24).
5. Write parsed `LibraryFile` + `fontBytes` into IndexedDB under `id:'active'`.
6. Rehydrate queue at `queueState.currentIndex`.

**Halt condition:** any validation failure triggers the error overlay; no partial recovery.

---

## 10. Rule Compliance Checklist

| Rule | Action |
| --- | --- |
| No DOM outside BaseComponent | `GlyphCaptureCanvas extends BaseComponent`; sidebar uses ComponentLibrary factory only |
| No RAF / setInterval | Event-driven only |
| F-based sizing | Canvas `40F × 28F`; sidebar 30F; rails 2F; all paddings `F` or `F/2` |
| VGA-only colours | Ink/overlays use `var(--c-text)`, `var(--c-border)`, `var(--c-bg)` only; reference glyph drawn with `var(--c-text)` at reduced alpha |
| Tab count ≤ 4 | 4 tabs (SESSION, PROMPT, OVERLAYS, INFO) — at hard cap |
| Algorithm library | `chaikinSmooth` reused; new pure modules live in `shared/algorithms/typography/` |
| Debug logging | `window.debugLog('TOOLS', …)` only; no raw `console.log`; `console.error` preserved for halt paths |
| Single owner per concern | Font → `opentype-adapter`; strokes → algorithms; persistence → data module; UI → tool file |

---

## 11. MVP Scope

Included: all REQ_LIST items §4. Phase 1 prompts guaranteed; Phases 2–5 gated behind a single `PHASES_ENABLED` constant flipped to `true` when ready.

## 12. Out of MVP

Bezier editing UI, anchor editing UI, stroke segmentation UI, connection-graph editor, pressure modelling, SVG export, contextual rendering, axis controls for variable fonts, multi-library management, server-side sync, CJK/Arabic script prompts, phase-jump UI (linear only).

---

## 13. Implementation Plan (phase order)

1. **P0** — REQ_LIST captured ✓ (§4).
2. **P1** — `npm i opentype.js`; write `opentype-adapter.js` (load bytes, load Google, hash, metrics, glyph path, kerning pairs); write `glyph-library-store.js` (IndexedDB wrapper: `open`, `getActive`, `putActive`, `clear`, `hasAny`).
3. **P2** — write `stroke-capture.js` (Chaikin wrap + glyph-space normaliser + metric computer) and `bezier-fit.js` (cubic fit + tangent-anchor extraction at curvature extrema).
4. **P2.5** — write `prompt-sequencer.js` (phase tables, glyph-presence filter, kerning-pair selection, queue advance, skip-defer, coverage metric).
5. **P3** — build `GlyphCaptureCanvas` component: three stacked `<canvas>` layers, Pointer Events, overlay renderer driven by prop toggles, SVG cursor, per-stroke undo/redo stack, emits `onStrokeEnd(stroke)` and `onDirtyChange()`.
6. **P3.5** — build tool shell `cursive-glyph-builder.js`: ToolBase sidebar (4 tabs), error-overlay renderer, keyboard shortcut handler, wires `GlyphCaptureCanvas` ↔ store ↔ sequencer ↔ ZIP import/export; confirmation-modal utility.
7. **P4** — register in `asset-loader.js` (`dependencies: ['algorithms']`) + `tools_section.js` (5 sites per tool-build-guide §2).
8. **P5** — parameter verification pass: each sidebar control triggers a visible, correct effect; each shortcut tested.
9. **P6** — audit via `process-P6.md` checklist; confirm 100% REQ coverage; lint; ReadLints.

---

## 14. Decisions Log (resolved from Q&A)

| # | Question | Decision |
| --- | --- | --- |
| 1 | MVP phase cut-off | All 5 phases coded; Phase 1 guaranteed; 2–5 behind `PHASES_ENABLED` flag |
| 2 | Phase-4 source | Auto-derived from font kerning table (top-N by abs. magnitude) |
| 3 | Phase jumping | Allowed in principle; MVP ships linear only |
| 4 | `requiredVariations` | Removed. Infinite variations; progress = coverage % |
| 5 | Font source | Upload **and** Google Fonts (radio toggle in SESSION) |
| 6 | opentype.js delivery | Bundle via npm |
| 7 | Missing glyph | Auto-skip prompt at queue-build time |
| 8 | Variable fonts | Use default instance; no axis UI |
| 9 | Normalisation basis | Per-prompt (varies with prompt string) |
| 10 | Y axis | Baseline = `y=0`, positive upward; Y split into descender / x-height / ascender bands |
| 11 | Advance width | Reference font's advance |
| 12 | Storage model | Vector-only: anchors + cubic handles (Bezier path). Raw points kept only for `raw/` export |
| 13 | Smoothing | Chaikin ×2 default; other methods deferred |
| 14 | Pressure | Not stored |
| 15 | Input devices | Mouse, stylus, touch all accepted |
| 16 | Undo granularity | Per stroke |
| 17 | Anchors | Entry + exit endpoints **plus** mid-stroke tangent anchors at curvature extrema |
| 18 | Completion | A prompt variation is complete on `Save + Next` (≥1 stroke implicit) |
| 19 | Variations per prompt | Unbounded |
| 20 | Skip semantics | Defer to end of queue |
| 21 | Resume | Open at `queueState.currentIndex` |
| 22 | Libraries | Single active library only |
| 23 | Autosave | On every `Save + Next`, `Skip`, `New`, `Import` |
| 24 | Destructive action UX | Confirmation modal on `New`, `Import` over existing data, `Clear library` |
| 25 | Network | 100% local; Google Fonts stylesheet is the only outbound request |
| 26 | Export format | ZIP (jszip) |
| 27 | ZIP layout | `manifest.json`, `referenceFont/`, `raw/`, `vectors/`, `json/`, `prompts/`, `indexes.json` |
| 28 | SVG export | Not in MVP |
| 29 | Compression | DEFLATE (jszip default) |
| 30 | UI minimalism | ToolBase standard layout: sidebar + canvas PCS; no custom chrome |
| 31 | Dropdown widths | Use ToolBase/ComponentLibrary defaults only; no custom sizes |
| 32 | Overlay controls | Dedicated OVERLAYS tab in sidebar |
| 33 | Canvas content | Current prompt only; no preview |
| 34 | Error UX | Full-content overlay |
| 35 | Missing dep | Halt + error overlay; no degrade path |
| 36 | Corrupted import | Halt + error overlay; no partial recovery |
| 37 | Tools-TOC thumbnail | N/A — not implemented site-wide |
| 38 | Shortcuts | `Enter` / `Esc` / `Ctrl+Z` / `Ctrl+Shift+Z` |
| 39 | Script support | Font-agnostic; no CJK/Arabic-specific work in MVP |
| 40 | Section | `#tools/cursive-glyph-builder` |
| 41 | DrawCanvas reuse | **New** `GlyphCaptureCanvas`; copy pointer pattern but do not extend (bitmap vs vector model incompatibility) |

---

## 15. Live implementation (SITE UI)

Canonical doc path fetched by the tool INFO panel: `/blog/docs/pages/tools/utilities/cursive-glyph-builder.md`.

| Area | Behaviour |
| --- | --- |
| PCS | Universal `Canvas` (`fit`/`fill`/`actual`); `GlyphCaptureCanvas` attaches pointer handlers and renders in `ToolBase.onDraw`. |
| Tabs | SESSION, PROMPT, CANVAS, INFO (four tabs maximum). CANVAS packs display mode radios in one horizontal row plus a 5-item guide toggle grid (`BASE/DESC/X-HGT/CAP/REF`). |
| Fonts | Dropdown lists heuristic + API-derived system faces (`detectSystemFonts`) with prefixed values `sf:Family`; separator; optional Google cursives prefixed `gf:Name`. Prefer **FONT FILE** for reliable bytes. `Adapter.loadFromLocal` uses Chromium `queryLocalFonts` when user picks `sf:*`. |
| Errors / confirm | `ErrorPane`, `ModalConfirm` (ComponentLibrary) — overlays are `position:absolute; inset:0` on the tools `content-container` only. |

## 16. Improvements backlog

| Item | Detail |
| --- | --- |
| Export download | Avoid `document.createElement('a')` in `_exportZip` by routing through a sanctioned download helper (`BaseComponent`). |
| Full REQ §4 | REQ still lists header/footer rails and extra overlays (ascender bands, bbox); PCS currently implements baseline/guides subset + reference toggle. |

## 17. Verification

Cross-check `[blog/docs/guides/checklists/process-P6.md](blog/docs/guides/checklists/process-P6.md)` whenever tool changes touch DOM or pipelines.
