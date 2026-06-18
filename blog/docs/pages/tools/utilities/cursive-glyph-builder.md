# Cursive Glyph Library Builder — Idea & Implementation

**Status:** live (operator §0 + §15 = shipped UI)  
**Route:** `#tools/utilities/cursive-glyph-builder` (utility, not generative)  
**Owner files:** `assets/js/tools/utilities/cursive-glyph-builder.js`, `assets/js/shared/algorithms/typography/{stroke-capture,bezier-fit,prompt-sequencer}.js`, `assets/js/shared/components/drawing/GlyphCaptureCanvas.js`, `assets/js/shared/components/tool/GlyphBuilderToolbar.js`, `assets/js/shared/typography/opentype-adapter.js`, `assets/js/shared/data/glyph-library-store.js`

---

## 0. Operator guide (INFO panel)

**Loop:** SESSION → pick reference font → trace active row → **Enter** (save + next). No mid-flow library browsing.

### Toolbar (canvas column)

| Control | Action |
| --- | --- |
| **INFO** | This document (operator section first). |
| **SCALE** | Click cycles **FIT → FILL → ACTUAL** (label shows current mode). Highlighted in capture view only. |
| **PREVIEW** | Toggle: recomposed lowercase lorem from captured ink; grey ref for gaps. Click again → capture. |
| **GLYPHS** | Toggle: label-free atlas of all captures (ink only). Click again → capture. |
| **EXPORT▾** | Import ZIP · Load font file · Export PNG · Export SVG (stroke-only vector) · Export library ZIP. |

Reference font is **not** on the toolbar — use SESSION.

### Sidebar (3 tabs)

| Tab | Contents |
| --- | --- |
| **SESSION** | New Library · Reference font dropdown (`sf:` system, `gf:` Google cursives) + status caption · Typography (trace size, leading, tracking, kerning, skew, BOLD/ITALIC/UNDER, LOCK). |
| **PROMPT** | Status line (`mode — glyphs — coverage%`) · Current (3-col) · Queue (Previous, Next, Skip, Clear Ink). |
| **VIEW** | Guide overlays · PAN (mutually exclusive with trace) · Ink line thickness + cap. |

### Canvas views

| View | Trace | Shortcuts |
| --- | --- | --- |
| **Capture** (default) | On (unless PAN) | Active |
| **PREVIEW** | Off | Blocked |
| **GLYPHS** (atlas) | Off | Blocked |

Capture shows a **vertical row stack**: active prompt centred; inactive queue rows show reference paths; **ghost ink** on completed rows above the active index.

### Keyboard (capture only; blocked when PAN on or focus in a form field)

| Key | Action |
| --- | --- |
| Enter / → | Save + next |
| Esc | Skip (defer) |
| ← | Previous prompt |
| Backspace | Clear unsaved ink |
| Ctrl+Z | Undo stroke |
| Ctrl+Shift+Z | Redo stroke |

Footer rail on canvas repeats the shortcut legend.

### Export / session caveats

- Library ZIP is **simplified** (see §9.2): not the full multi-folder aspirational layout.
- **Typography and ink settings** persist in IndexedDB (`library.settings`); ZIP import does **not** restore them — reload session or re-set in SESSION/VIEW after import.
- **PREVIEW** uses lowercase lorem; uppercase captures may not match segments.
- **GLYPHS** clips when the grid exceeds the viewport (no scroll yet).
- **BOLD** never synthesised; greys out when the single loaded face lacks bold. One font file only (no separate bold/italic files).

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

**Runtime subset (IndexedDB + tool):** `referenceFont`, `queueState`, `drawings`, `settings` (typography + ink), `stats` (often empty). **Not yet built at runtime:** `project`, `indexes`, parallel ZIP folders `raw/` / `vectors/` / `json/`.

```text
LibraryFile {   // aspirational full schema
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

## 4. Requirements (REQ_LIST)

Tag: **IMPLEMENTED** | **DEFERRED** | **OBSOLETE** (superseded by row grid / VIEW tab / toolbar).

| # | Tag | Requirement |
| --- | --- | --- |
| 1 | IMPLEMENTED | All 5 phases in queue (`phasesEnabled: true` in `buildPromptSet`). |
| 2 | IMPLEMENTED | Reference font: SESSION dropdown (`sf:` / `gf:`) + EXPORT▾ font upload; bytes hashed; retained for ZIP. |
| 3 | IMPLEMENTED | Hard-pair phase from font kerning table (top-N, default 50). |
| 4 | IMPLEMENTED | Overlays: baseline, descender, x-height, cap, ascender, ascender shade, bounds, bbox, ref glyph — toggles in sidebar **VIEW** tab (not toolbar). |
| 5 | IMPLEMENTED | Pointer Events; mouse/stylus/touch; no pressure. |
| 6 | IMPLEMENTED | Per-stroke undo/redo. |
| 7 | IMPLEMENTED | Stroke `order` monotonic. |
| 8 | IMPLEMENTED | Stroke end: Chaikin ×2 → cubic fit → anchors (`GlyphCaptureCanvas` + `bezier-fit.js`). |
| 9 | IMPLEMENTED | Normalise on Save + Next (`stroke-capture.js`). |
| 10 | IMPLEMENTED | Coverage % when `variationsDrawn ≥ 1`. |
| 11 | IMPLEMENTED | Missing glyph omitted at queue build. |
| 12 | IMPLEMENTED | Variable fonts: default instance only. |
| 13 | IMPLEMENTED | Autosave IndexedDB on Save+Next, New, Import, Skip, typography/ink change. |
| 14 | IMPLEMENTED | Skip → `skipDeferred`; drained after main pass. |
| 15 | IMPLEMENTED | Resume at `queueState.currentIndex` from IndexedDB. |
| 16 | IMPLEMENTED | Confirm modal on New library, Import over non-empty library. |
| 17 | IMPLEMENTED | Export single ZIP via `AssetLoader.ensureJSZip()` (§9.2 actual layout). |
| 18 | DEFERRED | Import: ZIP from this tool; **no** semver/schema version gate yet. |
| 19 | IMPLEMENTED | Local persistence; Google Fonts fetch only outbound network. |
| 20 | IMPLEMENTED | Error overlay on fatal font/DB failures (`ErrorPane`). |
| 21 | IMPLEMENTED | Footer rail `2F` shortcut legend; PROMPT + toolbar EXPORT. |
| 22 | IMPLEMENTED | Header rail: prompt · type · variation · font · row count. |
| 23 | IMPLEMENTED | Keyboard: Enter, Esc, ←, →, Backspace, Ctrl+Z, Ctrl+Shift+Z (capture only). |
| 24 | IMPLEMENTED | Sidebar controls wired (no stubs). |
| 25 | OBSOLETE | Was “current prompt only, no preview” — **row grid** shows inactive queue rows + ghost ink; PREVIEW/GLYPHS are separate view modes. |
| — | IMPLEMENTED | Toolbar SCALE / PREVIEW / GLYPHS; SESSION typography; VIEW PAN + ink (not in original REQ numbering). |
| — | DEFERRED | Full §9.2 multi-folder ZIP + `library.settings` in manifest round-trip. |
| — | DEFERRED | `indexes` + populated `stats` on library object. |

---

## 5. Architecture Mapping to SiteBoy Toolbase

### 5.1 Section choice

**Tools**, not Art. It is utility (structured data capture), not aesthetic output.

- URL: `#tools/utilities/cursive-glyph-builder`
- Registration: `assets/js/sections/tools_section.js`
- Asset loader: `'cursive-glyph-builder': { script: '.../cursive-glyph-builder.js', className: 'CursiveGlyphBuilderTool', dependencies: ['algorithms'] }`

### 5.2 File ownership (SSoT)

| Concern | Owner file | Note |
| --- | --- | --- |
| Tool shell + sidebar + event wiring | `assets/js/tools/utilities/cursive-glyph-builder.js` | ESM ToolBase consumer; render() is entry point |
| Capture canvas (ink + reference + overlays) | `assets/js/shared/components/drawing/GlyphCaptureCanvas.js` | Logic-only attach to ToolBase canvas — §5.3 |
| Canvas-column toolbar | `assets/js/shared/components/tool/GlyphBuilderToolbar.js` | INFO / SCALE / PREVIEW / GLYPHS / EXPORT▾ |
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
- Vector stroke model vs bitmap history incompatible.

**Shipped rendering:** one ToolBase canvas; `GlyphCaptureCanvas.draw(ctx)` composites reference paths, overlays, and ink in paint order (not three `<canvas>` elements).

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

Tool page: sidebar + PCS. Canvas column has `GlyphBuilderToolbar` above the PCS; operator detail in **§0**.

```
┌────────────────────────────────────────────────────────────┐
│ Site subheader                                              │
├─── Sidebar (3 tabs) ─┬─ Toolbar: INFO SCALE PREVIEW GLYPHS EXPORT▾ ┤
│ SESSION / PROMPT /   ├─ PCS: header rail (2F)                  │
│ VIEW                 │     capture | preview | atlas           │
│                      ├─ footer rail (2F)                       │
└──────────────────────┴──────────────────────────────────────────┘
```

### 6.1 Sidebar tabs (3)

| Tab | Blocks |
| --- | --- |
| SESSION | New Library · Reference font + status · Typography (trace size, leading, tracking, kerning, skew, style toggles, LOCK) |
| PROMPT | Status caption · Current 3-col · Queue 4-col (Previous, Next, Skip, Clear Ink) |
| VIEW | Guide overlays · PAN · Ink thickness + line cap |

Export PNG/ZIP and font import: **toolbar EXPORT▾ only** (no CANVAS sidebar tab).

**VIEW guide toggles:** BASE, DESC, X-HGT, CAP, REF, ASC, A-SHD, L-BND, R-BND, BBOX. Default on cold start: BASE, DESC, X-HGT, CAP, REF.

### 6.2 Canvas (PCS)

Single ToolBase `Canvas` (`fit` / `fill` / `actual` via SCALE). `GlyphCaptureCanvas` attaches pointer handlers and paints in `onDraw`:

1. Font-wide metrics guides (not per-prompt bbox boxes).
2. Row stack: inactive rows (reference paths), ghost ink on completed rows, active prompt ref + ink.
3. PREVIEW / GLYPHS: tool-owned compose paths (`_drawPreviewView`, `_drawAtlasView`).

Nominal logical size `560×392`; `setLogicalSize` tracks ToolBase CSS size on resize. Row pitch: `bodyPx + traceFontSize × rowMarginEm` from SESSION typography.

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
                    markDrawn + coveragePercent (indexes deferred)
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

### 9.2 Export — ZIP (shipped layout)

`AssetLoader.ensureJSZip()` → `_exportZip`:

```
glyph-library-<timestamp>.zip
├── manifest.json          // version, exportedAt, fontName, fontHash, drawingCount (thin — no settings)
├── font/reference.ttf
├── queue/state.json       // queueState
├── drawings/singles/*.json
├── drawings/digraphs/*.json
├── drawings/trigraphs/*.json
├── drawings/hardpairs/*.json
├── drawings/variations/*.json
└── anchors/*_anchors.json // optional per drawing
```

DEFLATE default. PNG export: current canvas bitmap (includes PREVIEW/GLYPHS if active).

**Aspirational (DEFERRED):** `raw/`, `vectors/`, `json/`, `referenceFont/metrics.json`, `indexes.json`, `settings` in manifest — see §3.

### 9.3 Import (shipped)

EXPORT▾ → Import ZIP. Steps:
1. `jszip` load; require `manifest.json`, `font/reference.ttf`.
2. Confirm if library has existing drawings.
3. Parse `queue/state.json`, `drawings/**/*.json`; load font bytes.
4. Rebuild in-memory library; autosave IndexedDB.

**Gaps (DEFERRED):** no semver on `manifest.version`; **no** restore of `library.settings` (typography/ink) from ZIP — use IndexedDB session or reconfigure SESSION/VIEW.

**Halt:** missing files or parse errors → `ErrorPane` overlay.

---

## 10. Rule Compliance Checklist

| Rule | Action |
| --- | --- |
| No DOM outside BaseComponent | `GlyphCaptureCanvas extends BaseComponent`; sidebar uses ComponentLibrary factory only |
| No RAF / setInterval | Event-driven only |
| F-based sizing | Canvas `40F × 28F`; sidebar 30F; rails 2F; all paddings `F` or `F/2` |
| VGA-only colours | Ink/overlays use `var(--c-text)`, `var(--c-border)`, `var(--c-bg)` only; reference glyph drawn with `var(--c-text)` at reduced alpha |
| Tab count ≤ 4 | 3 sidebar tabs (SESSION, PROMPT, VIEW) + toolbar INFO dropdown |
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
5. **P3** — `GlyphCaptureCanvas`: attach to ToolBase canvas, Pointer Events, overlays, undo/redo, `onStrokeEnd` / `onDirtyChange`. ✓
6. **P3.5** — tool shell: 3 sidebar tabs + `GlyphBuilderToolbar`, views capture/preview/atlas. ✓
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
| 5 | Font source | SESSION dropdown (`sf:` / `gf:`) + EXPORT▾ font file import |
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
| 27 | ZIP layout | Shipped: §9.2; aspirational multi-folder DEFERRED |
| 28 | SVG export | Not in MVP |
| 29 | Compression | DEFLATE (jszip default) |
| 30 | UI minimalism | ToolBase standard layout: sidebar + canvas PCS; no custom chrome |
| 31 | Dropdown widths | Use ToolBase/ComponentLibrary defaults only; no custom sizes |
| 32 | Overlay controls | Sidebar **VIEW** tab (was OVERLAYS) |
| 33 | Canvas content | Row grid + PREVIEW/GLYPHS view modes |
| 34 | Error UX | Full-content overlay |
| 35 | Missing dep | Halt + error overlay; no degrade path |
| 36 | Corrupted import | Halt + error overlay; no partial recovery |
| 37 | Tools-TOC thumbnail | N/A — not implemented site-wide |
| 38 | Shortcuts | `Enter` / `Esc` / `Ctrl+Z` / `Ctrl+Shift+Z` |
| 39 | Script support | Font-agnostic; no CJK/Arabic-specific work in MVP |
| 40 | Section | `#tools/utilities/cursive-glyph-builder` |
| 41 | DrawCanvas reuse | **New** `GlyphCaptureCanvas`; copy pointer pattern but do not extend (bitmap vs vector model incompatibility) |

---

## 15. Live implementation (SITE UI)

INFO fetches this file (`DOC_MD_PATH`). Operator truth: **§0**. File map: `blog/docs/temp/cursive-glyph-builder-handover.md` §2.

| Area | Behaviour |
| --- | --- |
| Route | `#tools/utilities/cursive-glyph-builder` |
| Toolbar | `GlyphBuilderToolbar`: INFO, SCALE (fit/fill/actual cycle), PREVIEW, GLYPHS, EXPORT▾ (PNG · SVG · ZIP · import) |
| Sidebar | SESSION, PROMPT, VIEW (3 tabs) |
| Views | `_canvasView`: capture \| preview \| atlas |
| Capture | `getRowWindow` row stack; ghost ink; font-wide guides |
| Fonts | `detectSystemFonts` → `sf:`; `GF_CURSIVE` → `gf:`; upload via EXPORT▾; TTC failure → `fontStatus` |
| Persistence | IndexedDB `library.settings`; autosave; ZIP per §9.2 |
| Errors | `ErrorPane`, `ModalConfirm` on tool overlay |

## 16. Improvements backlog

| Item | Detail |
| --- | --- |
| ZIP settings round-trip | Export/import `library.settings` in manifest |
| Atlas pagination | Scroll or pages when grid overflows |
| Preview case | Optional uppercase segmentation or case-normalised match |
| Import validation | Semver / schema gate on manifest |
| Full ZIP tree | `raw/`, `vectors/`, `indexes` per aspirational §3 |
| F4 closure | Browser smoke — `blog/docs/temp/cursive-glyph-builder-handover.md` §14 |

## 17. Verification

- Operator: INFO §0 vs live UI labels.
- Implementer: `process-P6.md` on owner file changes.
- Release: handover §14 smoke checklist + F4 Done when (`blog/docs/todo/F4-cursive-glyph-builder-ux.md`).
