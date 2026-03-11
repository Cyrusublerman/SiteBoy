# DISTORT — UI/UX Specification

Canonical layout, interaction, and aesthetic compliance reference for the DISTORT image processing tool.

**Governing documents (read before this one):**

| Document | Authority | Scope |
|----------|-----------|-------|
| `blog/docs/guides/standards/design-law.md` | Absolute | Site design law: ideology, partition logic, scale, typography, colour |
| `blog/docs/site/ui-interface-overview.md` | High | Operational layout patterns, PCS application, standard tool organisation |
| `blog/docs/guides/effect-module-style-guide.md` | High | Module param presentation, tier order, modulation UI |
| `blog/docs/guides/effect-module-standards.md` | High | NodePanel contract, mask system, driver eligibility |
| `blog/docs/components/distort/driver-system.md` | High | Expression driver, image driver, variable reference |
| `blog/docs/guides/tools/tool-build-guide.md` | Medium | ToolBase wiring pattern |
| `blog/docs/guides/tool-standards.md` | Medium | Tool minimum functionality |

Any conflict between this document and `design-law.md` — the site law wins.

---

## 1. Source Tool Analysis

The original DISTORT tool was built with custom DOM outside ToolBase. Its features are preserved below as a feature inventory; the layout and implementation are replaced entirely.

### What the source tool had

| Feature | Source implementation | Status in rebuild |
|---------|-----------------------|-------------------|
| Viewport canvas with zoom/pan | Custom `ViewportRenderer` + `OffscreenCanvas` | **Replace** with `ViewportCanvas` BaseComponent |
| Effect stack (ordered node list) | Custom `EffectStack` BaseComponent | **Port** as sidebar block in PIPELINE tab |
| Node param panel | Custom `NodePanel` per node | **Port** as expandable row in stack block |
| Right panel (seed, mod map, variations) | Separate `div.distort-rightpanel`, 220px fixed | **Removed** — violates Single-Sheet Reality |
| Variation grid (N×N thumbnails) | Custom component inside right panel | **Move** to EXPORT dropdown → renders into canvas |
| Modulation map upload | Button in right panel | **Move** into each param row as `+D` driver button |
| Seed control | Slider in right panel | **Move** into CANVAS tab |
| ADD MODULE button | Button inside right panel | **Move** to Stack block in PIPELINE tab |
| Refresh / re-render button | Button in right panel | **Removed** — pipeline auto-renders on param change |
| Recipe save/load | Not in original UI | **Add** in EXPORT dropdown |
| SVG export | Not in original UI | **Add** in EXPORT dropdown |
| Multi-frame transport | Not in original UI | **Add** as TransportStrip below canvas |

### What violated site aesthetics in the source

- Right panel: separate width (220px, not 30F), its own border-left — floating panel, violates Single-Sheet Reality
- `display: flex; flex-direction: column; overflow: hidden auto` — manual CSS outside ToolBase
- Inline colour values, custom font-size overrides
- ADD MODULE, REFRESH, SEED in the same panel as canvas — controls adjacent to canvas violate Tool Primacy

### Reference: GeneratorToolbar pattern

The generators page (`assets/js/shared/components/tool/GeneratorToolbar.js`) demonstrates the correct top bar pattern: full-width 2F toolbar sitting above both sidebar and canvas, containing quick-access tool-level actions (dropdown, display mode, export). DISTORT adopts this pattern directly.

---

## 2. Layout Architecture

### 2.1 Overall structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TOP BAR  2F (28px)  ─────────────────────────────────────────────────────── │
│ [source.jpg ▾    ] [UNDO][REDO][FIT][FILL][ACTUAL][PREVIEW/FULL][EXPORT ▾] │
├────────────────────────────────┬────────────────────────────────────────────┤
│ SIDEBAR  30F (420px)           │  CANVAS AREA  flex: 1                      │
├────────────────────────────────┤                                            │
│ PIPELINE │ CANVAS              │      ┌──────────────────────────┐          │
│ ─────────────────────────────  │      │                          │          │
│                                │      │   ViewportCanvas         │          │
│   [tab content — scrollable]   │      │   (zoom / pan)           │          │
│                                │      │                          │          │
│                                │      └──────────────────────────┘          │
│                                │  ──────────────────────────────────────    │
│                                │  [◀][▶][▶▶] ══════●═══ 12/48  24fps       │
└────────────────────────────────┴────────────────────────────────────────────┘
```

**Top bar:** 2F (28px), full width, spans above both sidebar and canvas. Persistent — always visible. Implemented as `DistortToolbar` BaseComponent (not part of ToolBase sidebar).

**Sidebar:** fixed 420px (30F), scrolls independently. 2 tabs only: PIPELINE and CANVAS.

**Canvas area:** `flex: 1`. Centred image within. No controls, overlays, or panels on the canvas.

**Transport strip:** Below the canvas column only (does not extend under sidebar). Conditionally visible when `frameCount > 1`. Implemented as `TransportStrip` BaseComponent.

### 2.2 Why 2 tabs (not 4)

The original spec had PIPELINE / CANVAS / EXPORT / ANIMATION. This fails the simultaneous-access requirement:

| What you need to do at the same time | Problem with 4-tab spec | Fix |
|--------------------------------------|-------------------------|-----|
| Edit pipeline + watch animation play | ANIMATION tab hides pipeline | Transport strip (always visible) |
| Adjust params + change quality | CANVAS tab hides pipeline | Quality in top bar |
| Edit pipeline + export | EXPORT tab hides pipeline | Export in top bar dropdown |
| Undo after mistake + edit pipeline | UNDO buried in Stack block | UNDO/REDO in top bar |

With controls redistributed to the top bar and transport strip, the sidebar needs only:
- **PIPELINE** — source upload + effect stack (primary working tab)
- **CANVAS** — output size + seed + animation settings (configure once, rarely revisited)

### 2.3 Tab rail

```
┌──────────────────────┐
│ PIPELINE  │  CANVAS  │
└──────────────────────┘
  height: 2F (28px) — handled by ToolBase
```

Maximum 2 tabs. This is a deliberate reduction from the 4-tab limit — DISTORT's working surface is the pipeline, everything else is secondary.

### 2.4 Mobile / portrait

```
┌──────────────────────────────────────────────────────┐
│ TOP BAR (full width, 2F)                             │
├──────────────────────────────────────────────────────┤
│  CANVAS AREA (top, ~50vh)                            │
│  ViewportCanvas                                      │
│  ──────────────────────── TransportStrip (if active) │
├──────────────────────────────────────────────────────┤
│  SIDEBAR (bottom, ~50vh)                             │
│  PIPELINE │ CANVAS                                   │
│  [scrollable tab content]                            │
└──────────────────────────────────────────────────────┘
```

Portrait threshold: < 800px viewport width. Handled by ToolBase responsive behaviour. Top bar wraps or collapses non-essential buttons on narrow viewports (implementation detail).

---

## 3. Top Bar (DistortToolbar)

Height: 2F (28px). Full width. Sits above both sidebar and canvas. Implemented as `DistortToolbar extends BaseComponent` — not part of ToolBase's sidebar system.

### 3.1 Layout

```
┌───────────────────────────────────────────────────────────────────────────┐
│ [  input.jpg ▾       ] [UNDO][REDO] [FIT][FILL][ACTUAL] [PREVIEW] [EXPORT▾]│
│  ←── ~37.5% ────────→  ←12.5%→      ←─── 25% ────→      ←12.5%→  ←12.5%→│
└───────────────────────────────────────────────────────────────────────────┘
```

All cells share the 1px `var(--c-border)` right border. Bottom border separates top bar from sidebar/canvas. Cells are proportional — exact percentages are implementation detail; the above is a guide.

### 3.2 Source cell (left, ~37.5%)

Displays current source filename truncated if needed. Click opens the system file picker (accepts image/*). Behaves like the generator dropdown in `GeneratorToolbar` — left-heavy cell giving maximum label room.

```
[ input.jpg ▾             ]   ← filename + arrow glyph
```

When no source is loaded:
```
[ NO SOURCE ▾             ]
```

### 3.3 UNDO / REDO cells

Two cells, each ~12.5%. Active (clickable) when history has entries. Greyed when unavailable. These are the only undo/redo access points — not repeated in the sidebar.

### 3.4 Display mode cells (FIT / FILL / ACTUAL)

Three cells matching the `GeneratorToolbar` pattern exactly. Active cell: inverted (text bg, bg text). Controls `ViewportCanvas` display mode. Same semantics as generators.

### 3.5 QUALITY cell

Single cell, cycles between PREVIEW and FULL on click. Active state (FULL) is inverted. FULL triggers a high-quality re-render of the current frame; PREVIEW runs the fast path used during editing. This must be in the top bar because quality switches are made frequently while editing nodes.

### 3.6 EXPORT cell (dropdown)

```
EXPORT ▾
  ─────────────────────
  EXPORT PNG
  EXPORT SVG            ← shown only when all nodes in stack are type: vector
  ─────────────────────
  SAVE RECIPE
  LOAD RECIPE
  ─────────────────────
  VARIATIONS (3×3) ▸   ← sub-menu: GRID 2/3/4, SEED RANGE, GENERATE
  RENDER SEQUENCE ▸     ← sub-menu: FRAME COUNT, FORMAT, RENDER ALL
```

Dropdown opens below the EXPORT cell, aligned right. Inline sub-menus for Variations and Sequence (no secondary popups). Closes on any selection or outside click.

---

## 4. PIPELINE Tab

The primary working tab. Contains source image reference and the effect stack.

### 4.1 Full layout

```
PIPELINE │ CANVAS
─────────────────────────────

Source
─────────────────────────────
[  1920 × 1080  input.jpg   ]   ← value component (read-only, reflects top bar state)

Stack
─────────────────────────────
[  + ADD EFFECT               ]   ← button, full width, 2F
─────────────────────────────

[ ⠿ ][ ✓ ] GREYSCALE  [ S ] [ × ]   ← collapsed node row, 2F
[ ⠿ ][ ✓ ] GAUSS BLUR [ S ] [ × ]
[ ⠿ ][   ] LEVELS     [ S ] [ × ]   ← disabled (greyed label)

   ▾ GAUSS BLUR                    ← expanded node header
   ────────────────────────────────
   OPACITY      ──────●─────  0.80
   BLEND MODE   NORMAL ▾
   ────────────────────────────────
   SIGMA        ──────────●── 3.50  [+D]
   PASSES       ─●   1              [+D]
   ────────────────────────────────
   ▸ MASK
   ────────────────────────────────

[ ⠿ ][ ✓ ] LEVELS     [ S ] [ × ]
[ ⠿ ][ ✓ ] FILM GRAIN [ S ] [ × ]
```

**Source block** is read-only — it reflects what was set via the top bar source cell. Its purpose is to display resolution and filename without requiring the user to switch away from the pipeline.

**UNDO / REDO** are removed from the stack block (they moved to the top bar). The Stack block now contains only [+ ADD EFFECT] and the stack itself.

### 4.2 Node row (collapsed)

```
┌──────────────────────────────────────────────┐
│ ⠿  [ ✓ ]  GAUSS BLUR        [ S ] [ × ]     │  height: 2F (28px)
└──────────────────────────────────────────────┘
  │    │     │                   │     │
  │    │     │                   │     └── remove button (×), 2F × 2F
  │    │     │                   └──────── solo button (S), 2F × 2F
  │    │     └──────────────────────────── node display name (UPPERCASE)
  │    └────────────────────────────────── enable toggle (✓ = enabled, □ = bypassed)
  └─────────────────────────────────────── drag handle (⠿), 2F × 2F
```

Click anywhere on the row (except buttons) to expand. Drag handle is distinct from click-to-expand.

### 4.3 Node row (expanded)

```
┌──────────────────────────────────────────────┐
│ ⠿  [ ✓ ]  GAUSS BLUR        [ S ] [ × ]     │  ← header row, 2F
├──────────────────────────────────────────────┤
│ OPACITY     ─────────────●──  0.80           │  ← Tier 2 universal
│ BLEND MODE  NORMAL ▾                         │
├──────────────────────────────────────────────┤
│ SIGMA       ──────────●──  3.50     [+D]     │  ← Tier 3 primary
│ PASSES      ─●   1                  [+D]     │
├──────────────────────────────────────────────┤
│ ▸ MASK                                       │  ← mask block (collapsed)
└──────────────────────────────────────────────┘
```

Dividers between tiers: shared 1px `var(--c-border)`. Not a new element — CSS gap produces the shared border line.

### 4.4 Node row with active driver

Expression driver:
```
│ SIGMA       ──────────●──  3.50     [+D ●]  │
│             DRIVER: expr ▾                   │
│             = lum * 30                       │
│             live: 12.6 at centre             │
```

Image driver:
```
│ SIGMA       ──────────●──  3.50     [+D ●]  │
│             DRIVER: image ▾                  │
│             [  map_a.png              × ]    │
│             AMOUNT     ─────────●── 0.70     │
│             INVERT     [ off ]               │
```

### 4.5 Mask block (expanded)

```
┌──────────────────────────────────────────────┐
│ ▾ MASK                                       │
├──────────────────────────────────────────────┤
│ SOURCE    NONE ▾                             │
│                                              │
│   (when SOURCE = UPLOAD:)                    │
│   [  mask.png               × ]             │
│                                              │
│   (when SOURCE ≠ NONE:)                      │
│   INVERT  [ off ]                            │
│   BLUR    ─●──────────────   0              │
└──────────────────────────────────────────────┘
```

Always the last block in the expanded node. Rendered by NodePanel infrastructure — not declared in `paramDefs`.

### 4.6 ADD EFFECT flow

[+ ADD EFFECT] opens an inline category picker within the sidebar (no modal, no popup):

```
PIPELINE │ CANVAS
─────────────────────────────
Stack
─────────────────────────────
[  × CLOSE                    ]
─────────────────────────────
▸ COLOUR / TONE
▸ BLUR
▾ WARP
    FLOW FIELD
    BAND SHIFT
    ADVECTION
▸ DISTORTION
▸ LINE RENDER
...
```

Selecting a module name appends it to the bottom of the stack and collapses the picker. Appended node auto-expands.

---

## 5. CANVAS Tab

Settings that govern canvas-level behaviour. Configured once per session, rarely revisited during active pipeline editing.

```
PIPELINE │ CANVAS
─────────────────────────────

Output
─────────────────────────────
WIDTH        ──────────────●  1920   ← slider+number, step 1
HEIGHT       ──────────────●  1080   ← slider+number, step 1

Seed
─────────────────────────────
GLOBAL SEED  ─────────●─────  42    ← slider+number (integer)
[  RANDOMISE SEED  ]

Animation
─────────────────────────────
FRAME COUNT  ─────────●─────  48    ← slider+number, step 1; 1 = still image
FPS          ─────────●─────  24    ← slider+number (1–120)
```

**Global seed**: canvas-level setting, not per-node. Per-node seeds are derived from `globalSeed XOR nodeId`. Lives here — not in PIPELINE.

**Display mode** (FIT/FILL/ACTUAL) moved to top bar — no longer in CANVAS tab.

**Animation settings** (`FRAME COUNT`, `FPS`) are the configuration counterpart to the transport strip. Setting `FRAME COUNT > 1` activates the transport strip below the canvas. Reducing back to 1 hides the strip.

---

## 6. Transport Strip

The transport strip sits below the canvas column (right side only — does not extend under the sidebar). It is conditionally visible: present only when `frameCount > 1`.

### 6.1 Layout

```
┌──────────────────────────────────────────────────────────┐
│  [◀◀]  [▶]  [▶▶]   ══════════════●═══   12 / 48   24fps │
│  2F height                                               │
└──────────────────────────────────────────────────────────┘
    │      │    │       │                    │         │
    │      │    │       │                    │         └── FPS display (value component)
    │      │    │       │                    └──────────── frame readout (current / total)
    │      │    │       └───────────────────────────────── frame scrubber (slider, full range)
    │      │    └───────────────────────────────────────── next frame button
    │      └────────────────────────────────────────────── play / pause button (toggles ▶ / ■)
    └───────────────────────────────────────────────────── previous frame button
```

All buttons: 2F × 2F. Scrubber: fills remaining width. Border: 1px `var(--c-border)` top edge only (shared with canvas bottom).

### 6.2 Why strip (not tab)

The transport must be accessible **simultaneously** with the pipeline. When animation is playing, the user needs to:
- Expand and edit node params while watching the output change across frames
- Pause, scrub to a specific frame, then tweak params
- Toggle solo on a node while the animation is running

A sidebar ANIMATION tab makes all of this impossible without tab switching. The strip keeps transport always in view without consuming sidebar space.

### 6.3 Animation architecture

Frame state (`frame`, `frameCount`) flows into `Pipeline.ctx` on every render:
```
TransportStrip → AppState.frame → WorkerBridge.queueRender(frame) → Pipeline.ctx
```

Expression drivers read `frame`, `frameCount`, and `t` (normalised time) from `ctx.frameVars`. This is the same model as the generators page (`generative-tool-host.js`), where `frame` is an integer counter driving per-frame evaluation.

**`AnimationLoop` from `AnimationFoundation`** drives playback — no custom `requestAnimationFrame`. The TransportStrip calls `animator.start()` / `animator.pause()` / `animator.stop()` and does not implement its own loop.

### 6.4 Sequence export

Sequence export (RENDER ALL FRAMES, FORMAT, EXPORT SEQUENCE) lives in the EXPORT dropdown in the top bar, not in the transport strip. The strip is transport only — no configuration.

---

## 7. Parameter Row Anatomy

Every numeric parameter row in an expanded node follows this pattern:

```
┌──────────────────────────────────────────────────────────────────────┐
│ LABEL          ──────────────●──────  VALUE      [+D]               │
│ height: 2F (28px)                                                    │
└──────────────────────────────────────────────────────────────────────┘
  │                │                     │           │
  │                │                     │           └── driver button (hidden until hover)
  │                │                     └──────────── numeric readout (right-aligned)
  │                └────────────────────────────────── slider track
  └─────────────────────────────────────────────────── label (UPPERCASE, max 16 chars)
```

**[+D] driver button:**
- Hidden by default; visible on row hover
- Becomes [+D●] (filled, `var(--c-accent)`) when a driver is active
- Click opens the driver picker inline below the row
- Driver picker collapses on [×] or choosing `none`

**Dropdown / toggle rows** do not have [+D] — drivers only attach to `range` params.

**Precision:** dictated by `paramDef.step` — see `effect-module-style-guide.md §4`.

---

## 8. Vector Node Tier 2

LINE RENDER modules have additional Tier 2 params between the universal base and Tier 3 primary:

```
┌──────────────────────────────────────────────┐
│ ⠿  [ ✓ ]  LUMFLOW           [ S ] [ × ]     │
├──────────────────────────────────────────────┤
│ OPACITY     ─────────────●──  0.80           │  ← Universal base
│ BLEND MODE  NORMAL ▾                         │
├──────────────────────────────────────────────┤
│ STROKE W    ─●──────────────  0.70  [+D]     │  ← Tier 2 type-specific
│ BG LEVEL    ────────────────  10    [+D]     │
├──────────────────────────────────────────────┤
│ PATTERN     HORIZONTAL ▾                     │  ← Tier 3 primary
│ SPACING     ──────●──────── 8       [+D]     │
│ AMPLITUDE   ─────────●───── 15      [+D]     │
│ ITERATIONS  ──────────────● 3       [+D]     │
├──────────────────────────────────────────────┤
│ STEP        ─●────────────── 2      [+D]     │  ← Tier 4 secondary
│ LUM EXP     ──────●────────  1.00   [+D]     │
│ DAMPING     ──────────────●  0.95   [+D]     │
├──────────────────────────────────────────────┤
│ [  EXPORT SVG  ]                             │  ← vector export action (Tier 5)
├──────────────────────────────────────────────┤
│ ▸ MASK                                       │
└──────────────────────────────────────────────┘
```

---

## 9. Site Aesthetic Compliance

### 9.1 F-system (non-negotiable)

| Dimension | Value | Enforced by |
|-----------|-------|-------------|
| Top bar height | 28px (2F) | DistortToolbar — match GeneratorToolbar |
| Sidebar width | 420px (30F) | ToolBase — do not override |
| Tab rail height | 28px (2F) | ToolBase — do not override |
| Control row height | 28px (2F) | ToolBase — do not override |
| Gap between controls | 7px (F/2) | ToolBase — do not override |
| Block padding | 14px (F) | ToolBase — do not override |
| Node header row | 28px (2F) | NodePanel component |
| Transport strip height | 28px (2F) | TransportStrip — match tab rail |
| [+D] button width | 28px (2F) | Must match control height |
| Driver picker row | 28px (2F) | Expression input height |
| Top bar cell borders | 1px `var(--c-border)` | DistortToolbar — match GeneratorToolbar |

**All custom components must use F-tokens.** No `px` values in custom CSS except via `calc(var(--F) * N)`.

### 9.2 Colour (non-negotiable)

| Surface | Rule | Token |
|---------|------|-------|
| Top bar background | `var(--c-bg)` | DistortToolbar |
| Top bar active cell | inverted: `var(--c-text)` bg, `var(--c-bg)` text | DistortToolbar |
| Sidebar background | `var(--c-bg)` | ToolBase handles |
| Tab rail active | inverted: `var(--c-text)` bg, `var(--c-bg)` text | ToolBase handles |
| Control labels | `var(--c-text)` | ToolBase handles |
| Borders / dividers | `var(--c-border)` | ToolBase handles |
| Transport strip | `var(--c-bg)` bg, `var(--c-border)` top border | TransportStrip |
| Node header when expanded | No background change — share border only | NodePanel |
| Disabled node label | greyed via opacity | NodePanel |
| Driver active [+D●] | `var(--c-accent)` | NodePanel |
| Canvas output | Any colour (pipeline output, unrestricted) | — |

**No hardcoded hex, rgb, or hsl in any DISTORT UI code.**

### 9.3 Typography application (inherits design law)

| Element | Case | Source of rule |
|---------|------|----------------|
| Top bar source cell | UPPERCASE | `design-law.md` |
| Top bar action cells | UPPERCASE | `design-law.md` |
| Tab names | UPPERCASE | `design-law.md` |
| Block titles | Title Case | `design-law.md` |
| Node display name | UPPERCASE | `design-law.md` |
| paramDef labels | UPPERCASE | `design-law.md` |
| Select option strings | UPPERCASE | `design-law.md` |
| Transport frame readout | digits only | `design-law.md` |
| Status strip (if used) | lowercase when intentionally quiet | `design-law.md` |

### 9.4 Single-Sheet Reality checklist

| Check | Pass condition |
|-------|----------------|
| No double borders | NodePanel header shares border with sidebar — no outer border on expanded node |
| No floating panels | Driver picker inline below param row; EXPORT is a dropdown, not a modal |
| No card chrome | No shadows, no rounded corners, no background fills on nodes |
| No overlay on canvas | Zero controls rendered inside or over the canvas area |
| No right panel | Source right panel removed; all controls in sidebar or top bar |
| Transport accessible always | Strip is always visible when `frameCount > 1`, regardless of sidebar tab |

---

## 10. What ToolBase Provides vs What Must Be Built

### 10.1 ToolBase provides (do not re-implement)

| Feature | How ToolBase provides it |
|---------|--------------------------|
| Sidebar layout (30F, tab rail, blocks) | `ToolBase.sidebarConfig` |
| Component rendering (slider, dropdown, toggle, file, button, value, progress) | `ComponentLibrary` via paramDef type |
| Canvas area (flex: 1) | `ToolBase.canvasConfig` |
| Tab switching (PIPELINE / CANVAS) | Tab config array |
| Block separators (1px borders) | Automatic via ToolBase block structure |
| F-system spacing | Automatic — do not override |
| onUpdate callbacks | Per-component `onChange` wired by ToolBase |
| Portrait responsiveness | Built into ToolBase layout |

### 10.2 Must be built as new components

| Component | Type | Where | Description |
|-----------|------|--------|-------------|
| `DistortToolbar` | BaseComponent | Above sidebar + canvas | Top bar: source picker, UNDO/REDO, display mode, quality, export dropdown. Follows `GeneratorToolbar` architecture |
| `TransportStrip` | BaseComponent | Below canvas column | Play/pause/prev/next, frame scrubber, readout. Uses `AnimationLoop` from AnimationFoundation |
| `EffectStack` | BaseComponent | PIPELINE tab, Stack block | Ordered NodePanel[] with drag-to-reorder, add, remove, solo |
| `NodePanel` | BaseComponent | Inside EffectStack | Expandable row: header + tier-ordered param controls + mask block |
| `DriverButton` | UI primitive | Each `range` param row | `[+D]` / `[+D●]`; opens/closes DriverPicker |
| `DriverPicker` | UI primitive | Inline below param row | Type dropdown + image upload OR expression input + live preview |
| `CategoryPicker` | BaseComponent | Stack block (replaces stack on ADD) | Scrollable category/module list; collapses on selection |
| `ViewportCanvas` | BaseComponent | Canvas area | OffscreenCanvas + ctx.putImageData + zoom/pan |

### 10.3 Must be extended (not rebuilt)

| Target | Extension needed |
|--------|-----------------|
| `ExpressionEval.js` | Per-pixel vars (`r`, `g`, `b`, `lum`, `u`, `v`, `x`, `y`), temporal alias `t`, extended function set, `scope()` classifier — see `driver-system.md` |
| `EffectNode.getModulated()` | Wire `ctx.pixelVars` for expression per-pixel evaluation |
| `Pipeline.js` | Pre-compute `ctx.pixelVars` array when any expression in the stack has pixel scope; accept `frame`/`frameCount` in ctx |

---

## 11. Component Behaviour Contracts

### 11.1 DistortToolbar

```
Inputs:   AppState (source, history, displayMode, quality, stackIsAllVector)
Outputs:  onSourceChange(file) → AppState.setSource()
          onUndo() → History.undo() → AppState.setStack()
          onRedo() → History.redo() → AppState.setStack()
          onDisplayModeChange(mode) → ViewportCanvas.setMode()
          onQualityChange(quality) → WorkerBridge.setQuality()
          onExport(action) → DistortActions[action]()

Undo/Redo availability: greyed when History.canUndo() / History.canRedo() is false.
Quality state: PREVIEW (fast path) | FULL (full-quality re-render). Toggled by single click.
EXPORT SVG: only shown when AppState.stackIsAllVector === true.
```

### 11.2 TransportStrip

```
Inputs:   AppState.frame, AppState.frameCount, AppState.fps
Outputs:  onFrameChange(n) → AppState.setFrame() → WorkerBridge.queueRender(n)
          onPlayPause() → animator.start() / animator.pause()
          onPrev() → AppState.setFrame(Math.max(0, frame - 1))
          onNext() → AppState.setFrame(Math.min(frameCount - 1, frame + 1))

Animation: Uses AnimationFoundation.AnimationLoop — NO custom requestAnimationFrame.
           On each animation tick: frame = (frame + 1) % frameCount → queueRender.
           Strip is mounted below ViewportCanvas element, unmounted when frameCount returns to 1.

Visibility: conditional — rendered only when AppState.frameCount > 1.
```

### 11.3 EffectStack

```
Inputs:   AppState.stack (ordered EffectNode[])
Outputs:  onStackChange(newStack) → AppState.setStack() → WorkerBridge.queueRender()
          onSoloChange(nodeId)
          onReorder(fromIdx, toIdx)
          onRemove(nodeId)
          onAdd(type) → creates EffectNode, appends to stack

Drag-reorder: pointer events on drag-handle only.
              No full-row drag (prevents conflicts with click-to-expand).

Solo:     Sets AppState.soloId. Pipeline skips all nodes where
          node.id !== soloId (when soloId is set).

History:  History.push(stackSnapshot) on every mutation.
          UNDO/REDO is triggered via DistortToolbar — EffectStack only restores state.
```

### 11.4 NodePanel

```
Inputs:   EffectNode instance, ComponentLibrary, deps
Outputs:  onChange(key, value) → node.params[key] → onStackChange()
          onEnableChange(bool) → node.enabled
          onOpacityChange(float) → node.opacity
          onBlendModeChange(string) → node.blendMode
          onSolo() → EffectStack.onSoloChange(node.id)
          onRemove() → EffectStack.onRemove(node.id)
          onDriverChange(key, driverConfig) → node.modulation[key]
          onMaskChange(maskConfig) → node.mask

Expand/collapse: click on row header (not drag handle, not buttons).
                 Expanded state is local UI state — not serialised.

Tier order: Header → Universal base (opacity, blendMode) →
            Type-specific (if vector: strokeWidth, bgLevel) →
            paramDefs tiers 3–5 → Mask block
```

### 11.5 DriverPicker

```
Type: none | image | expr
  none  → driver.type = null, static param value used
  image → driver.mapId (key into AppState.modMaps)
          driver.amount (float 0–1)
          driver.invert (bool)
  expr  → driver.expr (string beginning with '=')

Expression input:
  - Single-line text, validates using ExpressionEval.isExpression()
  - Live result: evaluated at image centre pixel for current frame
  - Error display: 'syntax error: ...' in var(--c-border) colour
  - Debounce: 300ms before triggering re-render

Image input:
  - file component (accept: image/*)
  - On upload: loads into AppState.modMaps[generatedKey]
  - Amount slider (0–1) appears after file is loaded
```

### 11.6 ViewportCanvas

```
Renders: ctx.putImageData of pipeline output RGBA buffer
Zoom:    scroll-wheel scales around cursor; double-click resets to fit
Pan:     pointer-down + drag translates image within area
Fit:     image scaled to fit area, centred, aspect-preserved
Fill:    image scaled to fill area (may crop)
Actual:  1 pixel = 1 screen pixel; scrollable
```

---

## 12. Tab and Toolbar Block Map

Complete map of all controls and their location:

```
DISTORT TOOLBAR (top bar, always visible)
├── source cell       (filename ▾ — file picker trigger)
├── button            (UNDO)
├── button            (REDO)
├── button×3          (FIT, FILL, ACTUAL — display mode)
├── button            (PREVIEW / FULL — quality cycle)
└── dropdown          (EXPORT ▾)
    ├── EXPORT PNG
    ├── EXPORT SVG        (conditional — all-vector stack only)
    ├── ─────────────
    ├── SAVE RECIPE
    ├── LOAD RECIPE
    ├── ─────────────
    ├── ▸ VARIATIONS      (GRID 2/3/4, SEED RANGE, GENERATE)
    └── ▸ RENDER SEQUENCE (FRAME COUNT, FORMAT, RENDER ALL)

PIPELINE tab
└── Source block
    └── value             (read-only: W × H  filename)
└── Stack block
    ├── button            (+ ADD EFFECT)
    └── [EffectStack — see §11.3]
        └── [NodePanel per node — see §11.4]

CANVAS tab
└── Output block
    ├── slider+number     (WIDTH)
    └── slider+number     (HEIGHT)
└── Seed block
    ├── slider+number     (GLOBAL SEED)
    └── button            (RANDOMISE SEED)
└── Animation block
    ├── slider+number     (FRAME COUNT — 1 = still image)
    └── slider+number     (FPS)

TRANSPORT STRIP (below canvas column, visible when frameCount > 1)
├── button            (◀◀ prev frame)
├── button            (▶ / ■ play/pause)
├── button            (▶▶ next frame)
├── slider            (frame scrubber, range 0–frameCount−1)
├── value             (N / frameCount readout)
└── value             (FPS display)
```

---

## 13. Interaction State Map

```
STATE                       DISPLAY
──────────────────────────────────────────────────────────────────
No source loaded            Canvas shows placeholder.
                            Top bar source cell: NO SOURCE ▾
                            Stack block: [+ ADD EFFECT] disabled.
                            Transport strip: hidden.

Source loaded,              Stack block: [+ ADD EFFECT] active.
stack empty                 Canvas shows source image.
                            Transport strip: hidden (frameCount = 1).

Source loaded,              Pipeline renders top-to-bottom.
stack non-empty, idle       Canvas shows pipeline output (PREVIEW quality).

Param changed               Pipeline re-renders at PREVIEW quality.
                            Top bar quality cell shows PREVIEW.

FULL quality active         Full-quality re-render triggered on each change.
                            Top bar quality cell inverted.

Node disabled               Label greyed. Node bypassed. Preview updates.

Node solo active            Solo button inverted on active node.
                            Other node labels dim (opacity 0.4).
                            Preview shows solo node output only.

ADD EFFECT clicked          Stack block replaced with CategoryPicker.
                            [+ ADD EFFECT] becomes [× CLOSE].

Module selected             CategoryPicker collapses, node appended.
                            Node auto-expands. Preview re-renders.

Driver active on param      [+D] becomes [+D●] in var(--c-accent).
                            Slider greyed. Driver picker visible.

FRAME COUNT set > 1         CANVAS tab Animation block active.
                            TransportStrip appears below canvas.
                            Frame 0 rendered immediately.

Transport: play             AnimationLoop starts. Frame increments at FPS rate.
                            Pipeline re-renders on each frame tick.
                            User can edit nodes simultaneously.

Transport: scrub            Dragging scrubber → AppState.setFrame(n) → render.
                            Animation pauses during scrub.

UNDO / REDO clicked         History restores full stack snapshot.
                            Pipeline re-renders. Undo/redo in top bar only.

EXPORT VARIATIONS           Canvas switches to N×N thumbnail grid.
                            Clicking thumbnail adopts that seed.
                            [BACK] button appears above grid in canvas area.
                            (Rendered into canvas — not a popup.)

EXPORT SVG clicked          Only enabled when stackIsAllVector.
                            buildGeometry() called on each node.
                            LineSets concatenated → SVG paths → download.
```

---

## 14. Prohibited Patterns (DISTORT-specific additions)

These extend the site-wide prohibited patterns from `ui-interface-overview.md §13`.

| Pattern | Violation | Correct alternative |
|---------|-----------|---------------------|
| Controls rendered in or over the canvas | Tool Primacy | All controls in sidebar or top bar |
| Right-side panel or second sidebar | Single-Sheet Reality | Left sidebar only |
| Popup / modal for ADD EFFECT or driver | Single-Sheet Reality | Inline CategoryPicker / DriverPicker |
| Floating variation grid | Single-Sheet Reality | Render into ViewportCanvas |
| ANIMATION as a sidebar tab | Simultaneous access | TransportStrip below canvas |
| EXPORT as a sidebar tab | Simultaneous access | Top bar EXPORT dropdown |
| UNDO / REDO in sidebar | Accessibility | Top bar buttons |
| Display mode (FIT/FILL) in CANVAS tab | Accessibility | Top bar cells |
| Quality toggle in CANVAS tab | Accessibility | Top bar cell |
| Colour-coded node category badges | Silence | Text labels only |
| Icons on node header | Silence | Text labels only |
| Custom font-size on node label | Hierarchy as Function | Inherit from ToolBase |
| `node.params.opacity` as a paramDef | NodePanel Contract | Opacity is NodePanel-level |
| `node.params.blendMode` as a paramDef | NodePanel Contract | BlendMode is NodePanel-level |
| Custom `requestAnimationFrame` in transport | AnimationFoundation | `AnimationLoop` from AnimationFoundation |
| Typed expression in a slider value field | Component Monotheism | DriverPicker expression input |
| Hard-coding `display: flex` on nodes | Grid Absolutism | ToolBase block layout |
| Global seed in PIPELINE tab | Canvas-level concern | CANVAS tab Seed block |

---

## 15. Reference Index

| Need | Document |
|------|----------|
| F-system token values | `ui-interface-overview.md §2` |
| Permitted CSS colour tokens | `ui-interface-overview.md §6` |
| Tab/block naming rules | `ui-interface-overview.md §4–5` |
| GeneratorToolbar implementation | `assets/js/shared/components/tool/GeneratorToolbar.js` |
| AnimationLoop / AnimationFoundation | `assets/js/core/animation-foundation.js` |
| paramDef label rules | `effect-module-style-guide.md §2` |
| Control tier order | `effect-module-style-guide.md §3` |
| Which component for which data | `effect-module-style-guide.md §4` |
| Modulation UI (driver button) | `effect-module-style-guide.md §5` |
| NodePanel contract (opacity, blendMode, mask) | `effect-module-standards.md — NodePanel Contract` |
| Driver types, variables, functions | `driver-system.md` |
| Vector geometry export | `effect-module-standards.md — Vector Geometry Export` |
| ToolBase config syntax | `tool-build-guide.md` |
| Module pre-submission checklist | `effect-module-standards.md — Pre-submission Checklist` |
| Style compliance checklist | `effect-module-style-guide.md §12` |

---

## 16. Implementation Matrix (Authoritative)

This matrix is a compliance contract for implementation work. Each row must resolve to exactly one owner component and exactly one data owner.

| Element | Owner component | Data owner | Mandatory constraints |
|---------|------------------|------------|-----------------------|
| Top source cell | `DistortToolbar` | `AppState.source*` | UPPERCASE, 2F row, shared boundaries only |
| Undo/redo cells | `DistortToolbar` | `History` | Disabled state must be deterministic; no duplicate controls in sidebar |
| Fit/fill/actual | `DistortToolbar` | `ViewportCanvas` | Active state by inversion only |
| Quality cell | `DistortToolbar` | `AppState.quality` | `PREVIEW/FULL` only; top bar only |
| Export dropdown | `DistortToolbar` | `DistortTool` actions | Inline list, no modal/floating panel |
| Source block readout | ToolBase block (`PIPELINE/SOURCE`) | `AppState.source*` | Read-only mirror of top bar |
| Stack add flow | `EffectStack` + `CategoryPicker` | `AppState.stack` | Inline substitution, no popup |
| Node row header | `NodePanel` | `EffectNode` + `AppState.soloNodeId` | 2F row, drag/enable/solo/remove |
| Node params tiers | `NodePanel` | `EffectNode.params` | Tier order fixed; UPPERCASE labels |
| Driver editor | `DriverPicker` | `EffectNode.modulation` + `AppState.modulationMaps` | `none|image|expr`; inline only |
| Mask block | `NodePanel` | `EffectNode.mask` | Always last; source/upload/invert/feather |
| Canvas output | `ViewportCanvas` | render result buffer | No control overlays |
| Transport strip | `TransportStrip` | `AppState.frame*` | Visible iff `frameCount > 1`; AnimationFoundation loop |
| Variations view | `ViewportCanvas` + `VariationGrid` | rendered seed outputs | Rendered in canvas surface, not side panel |

### Authority precedence for conflicts

1. `design-law.md` (absolute)
2. `ui-interface-overview.md`, `component-rules.md`
3. `type.md`, `tool-standards.md`, `COMPONENT-REFERENCE.md`
4. This file (`distort/ui-ux.md`)

### Design-law gate (must pass per changed element)

For each changed element, implementer must prove:

1. Parent partition is explicit
2. Shared boundary logic is explicit
3. Sizing is F-derived
4. Analogous site element is named
5. Non-floating behaviour is preserved
6. State signalling is consistent with site law
