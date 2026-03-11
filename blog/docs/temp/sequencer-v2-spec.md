# Sequencer V2 — Design Spec

## Status
Draft. Supersedes `Sequencer` (interactive.js L1375–1943) and `CheckpointList` (interactive.js L1197–1372).

---

## 1. Problem

Existing `Sequencer`: vertical list of checkpoints/transitions with basic toggle controls (all/sequential, blend/step). No visual timeline, no easing selection, no output-blending, no scrubber, no per-parameter curve control.

Tools with many parameters (Lissajous, wave-interference, future tools) need a proper animation choreography system.

---

## 2. Definitions

| Term | Meaning |
|---|---|
| **Checkpoint** | Deep-cloned snapshot of all tool parameters at one moment. |
| **Segment** | The tween span between two adjacent checkpoints. Owns duration, strategy, easing, param mode. |
| **Timeline** | Ordered list of checkpoints with segments between them. |
| **Scrubber** | Draggable playhead indicating current position. |
| **Parameter tween** | Interpolate individual param values A→B. |
| **Output tween** | Render A and B separately, cross-fade pixel data. |
| **Simultaneous** | All parameters lerp together over segment duration. |
| **Sequential** | Parameters animate one-at-a-time in sequence within segment duration. |

---

## 3. Data Model

```
Timeline {
  checkpoints: Checkpoint[]
  segments: Segment[]            // segments[i] spans checkpoints[i] → checkpoints[i+1]
  loop: boolean
  fps: number                    // default 60
}

Checkpoint {
  id: string                     // unique, stable across drag reorder
  name: string                   // user-editable
  params: Record<string, any>    // deep clone of tool state
  hold: number                   // seconds to dwell before next segment
}

Segment {
  duration: number               // seconds
  strategy: 'parameter' | 'output'
  easing: string                 // key from Easing map (animation-utils.js)
  paramMode: 'simultaneous' | 'sequential'
  paramOverrides: Record<string, {
    easing: string
    order: number                // position in sequential queue
  }> | null
}
```

Derived: `totalDuration = Σ(checkpoint.hold) + Σ(segment.duration)`.

---

## 4. Tween Strategies

### 4a. Parameter Tween (`strategy: 'parameter'`)

Interpolate each param from checkpoint A to checkpoint B.

**Simultaneous** (`paramMode: 'simultaneous'`):
All params lerp together. Each uses segment easing unless `paramOverrides[key].easing` is set.

**Sequential** (`paramMode: 'sequential'`):
Segment duration subdivided among params. Param at position `k` of `n` active params:
- `localT = clamp((segmentT - k/n) * n, 0, 1)`
- Each sub-span uses its own easing (from override or segment default).

Interpolation by type:
- `number` → `a + (b-a) * easing(t)`
- `string` (enum) → step at `t ≥ 0.5`
- `boolean` → step at `t ≥ 0.5`

### 4b. Output Tween (`strategy: 'output'`)

Render both checkpoint states to offscreen buffers, cross-fade pixel data:
`pixel = A*(1-easing(t)) + B*easing(t)`.

Requires tool to implement `renderToBuffer(params) → canvas`.
Fallback: degrade to parameter tween if tool lacks `renderToBuffer`.

---

## 5. Easing Integration

All 18 easings from `animation-utils.js` available per-segment and per-parameter override:
`linear`, `easeInQuad`, `easeOutQuad`, `easeInOutQuad`, `easeInCubic`, `easeOutCubic`, `easeInOutCubic`, `easeInQuart`, `easeOutQuart`, `easeInOutQuart`, `easeInSine`, `easeOutSine`, `easeInOutSine`, `easeInExpo`, `easeOutExpo`, `easeInOutExpo`, `easeOutElastic`, `easeOutBounce`.

Default: `easeInOutCubic`.

---

## 6. UI — Two Views

The sequencer provides two synchronised views. Both operate on the same `Timeline` data.

### 6a. Sidebar Panel (vertical, inside ANIMATION tab)

Lives within the standard TAB → BLOCK → COMPONENT hierarchy. Renders in a block called **Sequence** inside the ANIMATION tab.

```
┌─────────────────────────────────────────┐
│ ANIMATION                               │  ← tab
├─────────────────────────────────────────┤
│ Sequence                                │  ← block header
├─────────────────────────────────────────┤
│ [+ SAVE STATE]  [⟲ Loop]  [CLEAR]      │  ← controls row
├─────────────────────────────────────────┤
│ ⋮⋮ State 1         Hold: [2.0]s   ▶ ⎘ ×│  ← checkpoint row
│    ↓ Transition  [1.5]s  BLEND  SIMUL   │  ← segment row
│ ⋮⋮ State 2         Hold: [1.0]s   ▶ ⎘ ×│
│    ↓ Transition  [2.0]s  PARAM  SEQ     │
│ ⋮⋮ State 3         Hold: [1.5]s   ▶ ⎘ ×│
├─────────────────────────────────────────┤
│ Total: 8.0s (480 frames @ 60fps)        │
├─────────────────────────────────────────┤
│ ▸ Segment Detail                        │  ← collapsible (selected segment)
│   Strategy: [Parameter ▾]              │
│   Easing:   [easeInOutCubic ▾] ╭─╮     │  ← mini curve preview
│   Mode:     ○ Simultaneous ○ Sequential │
│   ▸ Per-Param Overrides                 │  ← expandable
│     freqX: [easeOutQuad ▾]  order: [1]  │
│     freqY: [easeInCubic ▾]  order: [2]  │
│     ...                                 │
├─────────────────────────────────────────┤
│ Export Settings                         │  ← existing block
│ ...                                     │
└─────────────────────────────────────────┘
```

**Checkpoint row** (height: 2F per row):
- `⋮⋮` drag handle — `var(--vga-gray)`, `cursor: grab`
- Name — editable text input, `flex: 1`
- Hold — numeric input, seconds, width `4F`
- `▶` load — applies params to tool
- `⎘` duplicate
- `×` delete — `var(--vga-red)`

**Segment row** (height: 2F, background nudge with `var(--vga-navy)` at 0.15 opacity):
- `↓` arrow — `var(--vga-gray)`
- Duration — seconds numeric input, width `4F`
- Strategy badge — click to cycle: `PARAM` / `OUTPUT`
- Mode badge — click to cycle: `SIMUL` / `SEQ` (only when strategy=PARAM)
- Click row → opens **Segment Detail** below total

**Segment Detail** (collapsible panel):
- Strategy dropdown
- Easing dropdown with 4×2F mini curve canvas beside it (draws the easing curve in `var(--c-text)` on `var(--c-bg)`)
- Param Mode radio (only if strategy=parameter)
- Per-Param Overrides — collapsible list, one row per numeric param. Each row: param name, easing dropdown, order number input

All inputs: height `2F`, borders `1px solid var(--c-border)`, `var(--c-bg)` background, `var(--c-text)` colour. No shadows, no rounded corners.

### 6b. Horizontal Timeline Strip (below canvas)

New element appended to `.tool-canvas-area`, after the canvas component. Sits at the bottom of the canvas column. Only visible when the tool has a sequencer with ≥1 checkpoint.

**Dimensions:**
- Height: `2F` (28px) — matches header, subheader, all controls
- Width: 100% of `.tool-canvas-area`
- Border: `1px solid var(--c-border)` top edge only (shared border with canvas above)
- Background: `var(--c-bg)`

**Layout (landscape):**

```
┌──────────────────────────────────────────────────────────────┐
│ ▶ │ ■ ■ ■ ═══════ ■ ■ ═══════════ ■ ═════ ■ ■ │ 12.5s      │
│   │ 1 2 3         4 5             6       7 8 │            │
└──────────────────────────────────────────────────────────────┘
  │     │                                           │
  │     └── timeline track                          └── duration
  └── play/pause
```

Zones (left to right):
1. **Transport** (width: `2F`): Single play/pause toggle. `▶` / `■`. Border-right: `1px solid var(--c-border)`.
2. **Track** (flex: 1): The visual timeline.
3. **Duration** (width: `5F`): Total time readout. Right-aligned. `var(--vga-aqua)` text. Border-left: `1px solid var(--c-border)`.

**Track detail:**

The track region is a proportional representation of the full timeline duration.

- **Checkpoint markers** (`■`): 
  - Width: `F` (14px), full height of track.
  - Background: `var(--c-text)`.
  - Draggable horizontally to reorder.
  - Hover: invert to `var(--c-accent)` background.
  - Active/selected: `var(--vga-aqua)` background.
  - Show checkpoint name as `title` attribute (tooltip).
  - Click: select checkpoint (opens detail in sidebar panel).

- **Segment spans** (between markers):
  - Background: `var(--c-bg)`.
  - Width proportional to segment duration relative to total.
  - Hover: subtle fill `var(--vga-navy)`.
  - Click: select segment (opens segment detail in sidebar panel).
  - Thin label inside if wide enough: duration in seconds, `var(--vga-gray)` text, `font-size: 0.75F`.

- **Hold spans** (within/after checkpoint marker):
  - Visually merged with the checkpoint marker. If hold > 0, marker width extends proportionally.
  - Differentiated by lighter fill: `var(--vga-gray)` instead of `var(--c-text)`.

- **Scrubber** (playhead):
  - Full-height vertical line, `1px solid var(--vga-lime)`.
  - Small triangle indicator at top, `var(--vga-lime)`.
  - Draggable. On drag: scrubs timeline, calls interpolation pipeline, updates tool in real-time.
  - During playback: animates along track.

**Portrait mode:**
Same strip, full width, appears below canvas and above sidebar. Same 2F height.

**No checkpoints state:**
Strip hidden entirely. Appears on first checkpoint save.

---

## 7. Interaction Flow

### Save checkpoint
1. User adjusts tool params.
2. Clicks `+ SAVE STATE` (sidebar) → `onSave()` fires → tool returns current params.
3. New checkpoint appended. If first, strip appears below canvas.
4. Default segment created between new and previous checkpoint.

### Reorder
- Sidebar: drag `⋮⋮` handle, drop on another checkpoint row. Segments rebuild.
- Strip: drag checkpoint marker horizontally, drop at new position. Same reorder logic.

### Configure segment
- Sidebar: click segment row → Segment Detail panel opens.
- Strip: click segment span → same Segment Detail opens in sidebar.

### Playback
- Click `▶` (sidebar or strip transport).
- Playback engine (AnimationFoundation.AnimationLoop) advances time.
- Each frame: compute global time → determine hold or segment → compute local `t` → apply easing → interpolate → call `onFrame(interpolatedParams)`.
- Scrubber animates along strip track.
- Loop: wraps last checkpoint → first (creates implicit loopback segment using last segment's config).

### Scrub
- Drag scrubber on strip → set time directly → same interpolation pipeline, no RAF.
- Tool updates in real-time during drag.

---

## 8. Integration Contract

### Minimal (parameter tween only)
```js
const seq = new ComponentLibrary.SequencerV2({
  onSave: () => getCurrentParams(),
  onLoad: (params) => applyParams(params),
  onFrame: (params) => applyAndDraw(params),
  fps: 60
});
```

### Full (with output tween support)
```js
const seq = new ComponentLibrary.SequencerV2({
  onSave: () => getCurrentParams(),
  onLoad: (params) => applyParams(params),
  onFrame: (params) => applyAndDraw(params),
  renderToBuffer: (params) => renderOffscreen(params),
  fps: 60
});
```

### Mounting
```js
// Sidebar: ToolBase auto-mounts in ANIMATION tab Sequence block
// Strip: SequencerV2 exposes .getStripElement() → tool appends to canvasArea
this.canvasArea.appendChild(seq.getStripElement());
```

### Serialisation
- `getTimelineData()` → JSON-serialisable `Timeline` object.
- `setTimelineData(data)` → restores full state.
- Tools persist alongside presets.

---

## 9. Playback Engine (internal)

- Uses `AnimationFoundation.AnimationLoop` at configured FPS.
- Maintains `currentTime` (seconds). Each frame: `currentTime += deltaTime`.
- Walk timeline: accumulate checkpoint holds and segment durations to find active phase.
- If in hold: `onFrame(checkpoint.params)` unchanged.
- If in segment: compute `segmentT = elapsed / segment.duration`, apply strategy.
  - Parameter/simultaneous: lerp all params with `easing(segmentT)`.
  - Parameter/sequential: subdivide, per-param `localT`.
  - Output: dual `renderToBuffer`, pixel blend.
- Scrub: set `currentTime` directly, run same pipeline once.
- Loop: wrap `currentTime` modulo `totalDuration`.

---

## 10. Styling Spec

All classes prefixed `seq2-` to avoid collision with existing `.sequencer-*`.

### Strip
```css
.seq2-strip {
    display: flex;
    height: calc(var(--f) * 2);               /* 2F = 28px */
    border-top: 1px solid var(--c-border);
    background: var(--c-bg);
    font-size: calc(var(--f) * 0.75);
    user-select: none;
}

.seq2-strip-transport {
    width: calc(var(--f) * 2);                 /* 2F */
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid var(--c-border);
    cursor: pointer;
    color: var(--c-text);
}

.seq2-strip-transport:hover {
    background: var(--c-text);
    color: var(--c-bg);
}

.seq2-strip-track {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.seq2-strip-duration {
    width: calc(var(--f) * 5);                 /* 5F */
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: calc(var(--f) / 2);
    border-left: 1px solid var(--c-border);
    color: var(--vga-aqua);
}

.seq2-marker {
    position: absolute;
    top: 0;
    height: 100%;
    min-width: var(--f);
    background: var(--c-text);
    cursor: grab;
    z-index: 2;
}

.seq2-marker:hover {
    background: var(--c-accent);
}

.seq2-marker.active {
    background: var(--vga-aqua);
}

.seq2-segment {
    position: absolute;
    top: 0;
    height: 100%;
    z-index: 1;
}

.seq2-segment:hover {
    background: var(--vga-navy);
}

.seq2-scrubber {
    position: absolute;
    top: 0;
    width: 1px;
    height: 100%;
    background: var(--vga-lime);
    z-index: 3;
    pointer-events: none;
}

.seq2-scrubber-head {
    position: absolute;
    top: 0;
    left: -3px;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 6px solid var(--vga-lime);
    pointer-events: auto;
    cursor: ew-resize;
}
```

### Sidebar panel
Reuses existing `.sequencer-*` sizing patterns but with `seq2-` prefix and updated controls (dropdowns for easing, radio for param mode, collapsible per-param overrides).

### Easing preview canvas
```css
.seq2-easing-preview {
    width: calc(var(--f) * 4);                 /* 4F = 56px */
    height: calc(var(--f) * 2);                /* 2F = 28px */
    border: 1px solid var(--c-border);
    background: var(--c-bg);
}
```
Draws the selected easing curve as a 1px `var(--c-text)` line from bottom-left to top-right.

---

## 11. File Ownership

| Concern | File |
|---|---|
| Component | `assets/js/shared/components/interactive/SequencerV2.js` |
| Strip sub-component | Internal to SequencerV2 (single file, strip is a render method) |
| Export chain | interactive/index.js → components/index.js → component-library.js |
| Playback engine | Internal to SequencerV2 (uses `AnimationFoundation.AnimationLoop`) |
| Easing | Import from `assets/js/shared/algorithms/animation/animation-utils.js` |
| Styling | `assets/css/styles.css` — `seq2-*` classes |

---

## 12. Migration

| Tool | Current | Migration |
|---|---|---|
| Lissajous | `Sequencer` (all/sequential, blend/step, frame-based) | `SequencerV2` with parameter tween. Map `mode:'all'` → simultaneous, `mode:'sequential'` → sequential, `type:'blend'` → easeInOutCubic, `type:'step'` → custom step function. Convert frames to seconds at 60fps. |
| Wave-interference | `CheckpointList` (duration-based, no transition config) | `SequencerV2` with parameter tween, simultaneous, default easing. Duration values transfer directly. |

Old components remain until migration verified, then deprecate.

---

## 13. Constraints

- F-system: all sizing `F` / `F/2` multiples. Controls `2F` height. Strip `2F` height.
- Colours: `var(--c-*)` tokens only. Canvas palette accents (`--vga-lime`, `--vga-aqua`, `--vga-navy`, `--vga-red`) for scrubber, duration, drag-hover, delete only.
- Font: Atkinson Hyperlegible only.
- No shadows, gradients, rounded corners.
- No raw DOM outside BaseComponent.
- No RAF/setInterval — AnimationFoundation only.
- `.destroy()` cleans up animator, listeners, strip element, sidebar elements.
- Strip element must be removable from `canvasArea` on destroy.

---

## 14. Open Questions

1. **Output tween buffer**: CPU pixel blend or WebGL? CPU simpler; WebGL needed if canvas exceeds ~1000×1000.
2. **Max checkpoints**: suggest 32 soft limit.
3. **Sequential weights**: equal subdivision vs custom weights per-param? Start with equal, add weights later.
4. **Export pipeline**: SequencerV2 drives frames via `onFrame`, existing AnimationExport captures them. No duplication.
5. **ToolBase auto-wire**: should ToolBase detect `animationConfig.type === 'sequence'` and auto-mount SequencerV2? Or explicit per-tool? Recommend auto-wire.
