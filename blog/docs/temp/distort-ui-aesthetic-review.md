# Distort UI — Aesthetic Review

Authority: `design-law.md` > `ui-interface-overview.md`  
Scope: 8 UI components in `assets/js/tools/processors/distort/ui/`

---

## 1. Component Inventory

### 1.1 DistortToolbar

**Visual driver:** Horizontal flex row; width partitioned into proportional cells separated by `1px solid var(--c-border)`. Cells: SOURCE (37.5%), UNDO (6.25%), REDO (6.25%), FIT (6.25%), FILL (6.25%), ACTUAL (6.25%), PREVIEW/FULL (12.5%), EXPORT (12.5%).

**Result:** A 2F-high tab strip. Active state = full inversion (`--c-text` bg / `--c-bg` text). Disabled state = text dimmed to `--c-border`. Hover = inversion. Export dropdown extends below the rail as an absolutely positioned overlay with its own `1px border`.

**State signals used:** inversion (active), border-colour text (disabled), positional (dropdown open/closed).

---

### 1.2 NodePanel

**Visual driver:** Two regions — a 2F header + a collapsible body. Header subdivided into 2F×2F cells (drag ⠿, enable ✓/○, name flex, solo S, remove ×) each separated by `1px solid var(--c-border)`. Body: vertical stack of rows, each `min-height: 2F`, `padding: 0 F`, separated by `1px solid var(--c-border)` as `border-top`. Row anatomy: label (7F wide) + control (flex) + value readout (4F wide). Param rows group by tier (3→4→5) with divider elements between tiers.

**Result:** A monospaced, uniform-height panel. Enabled/disabled name shown by colour (`--c-text` / `--c-border`) and `opacity: 0.55`. Solo state = S cell fully inverted. Driver button (+D) appears on row hover; active driver = `--c-accent` background.

**State signals used:** inversion (solo, active driver, toggle ON/OFF), border-colour text (disabled name, drag/solo/remove cells), opacity fade (disabled name name), hover inversion.

---

### 1.3 EffectStack

**Visual driver:** Flex column. Fixed-height "ADD EFFECT / × CLOSE" button at top with full `border: 1px solid var(--c-border)` outline. Below: scrollable `flex:1` content area with `border-top: 1px solid var(--c-border)`. Content renders either `CategoryPicker` (when open) or the ordered list of `NodePanel` instances. Empty state shows centred placeholder text in `--c-border` colour.

**Result:** A managed list container. The add button visually reads as a freestanding bordered object rather than a partition cell. NodePanel rows fill the scroll area flush to each other.

**State signals used:** text content change (ADD EFFECT ↔ × CLOSE), inversion (add button hover).

---

### 1.4 CategoryPicker

**Visual driver:** Full-height flex column within the EffectStack content area (inline replacement). Header row (2F): "× CLOSE" cell (7F wide, right border) + search input (flex). List body: scrollable. Each category = a 2F header button (`--c-border` text, `border-top`). Each entry = a 2F item button (`--c-text` text, `padding-left: 2F` indent, `border-top`).

**Result:** A searchable inline module browser. Category headers are visually subdued (border colour). Entries are full-width, indented 2F to imply hierarchy. Hover = inversion. Empty filter state shows "NO MATCH" in border colour.

**State signals used:** text colour distinction (category header vs entry), `▸`/`▾` glyph (collapsed/expanded), inversion (hover, close button hover).

---

### 1.5 ViewportCanvas

**Visual driver:** Full-area canvas (PCS). Background filled with `--vga-black` (resolved via `getComputedStyle`). Rendered result drawn via `OffscreenCanvas` → `ctx.drawImage` at calculated position from `_layout()`. Loading state: opaque `--c-bg` overlay div with "RENDERING..." text (Space Mono, F px, `--c-text`).

**Display modes:**
- `normal` — result only
- `original` — source pixels only
- `split` — source left / result right, draggable `--vga-silver` divider line
- `diff` — per-channel absolute difference, rendered as bitmap
- `overlay` — source + result at `globalAlpha: 0.5`

**Variation mode:** Replaces standard draw; delegates to `VariationGrid` with VGA palette colours.

**Result:** Dominant image region. Zoom/pan via pointer drag and wheel. `imageSmoothingEnabled` toggled by zoom level (disabled at ≥2× for pixel-accurate rendering).

**State signals used:** loading overlay (render in progress), cursor style (`grab`/`grabbing`), split-line position.

---

### 1.6 VariationGrid (pure function)

**Visual driver:** Called by `ViewportCanvas._drawVariations()`. Draws directly into the passed `CanvasRenderingContext2D`. Grid layout: `cols = 2` if ≤4 items else `cols = 3`; gap = `max(1, round(F/14))` px (effectively 1px). Cell dims calculated from remaining space after gaps.

**Result:** Grid of thumbnails. Each cell: image drawn via OffscreenCanvas + 1px `--vga-gray` border stroke + optional SEED label (F×1.5 tall strip, `--vga-black` bg, `--vga-silver` text, `F×0.75` font).

**State signals used:** none (static render).

---

### 1.7 DriverPicker

**Visual driver:** Inline sub-panel appended inside the `NodePanel` body row wrap (below the owning slider row). Flex column; rows follow same row anatomy as NodePanel (label 7F, control flex). Mode select = dropdown. Expression mode adds EXPR text input + LIVE preview span. Image mode adds CHOOSE file button + filename + AMOUNT range + INVERT toggle.

**Result:** An inline expando attached to a specific parameter row. Visual language identical to NodePanel rows.

**State signals used:** preview text colour (`--c-text` = valid, `--c-border` = idle/error), inversion (INVERT toggle), driver button background (`--c-accent` = active driver from NodePanel's perspective).

---

### 1.8 TransportStrip

**Visual driver:** Flex row, 2F tall, `padding: 0 F`, `gap: F`, `border-top: 1px solid var(--c-border)`. Buttons (◀ ▶ ▶▶): 2F×2F, `border: 1px solid var(--c-border)`. Scrubber: `flex:1` range input, `accent-color: var(--c-text)`. Readouts: right-aligned spans with F-multiple `min-width`.

**Result:** A minimal playback strip. Play/pause toggled by glyph change (▶ ↔ ■). Frame counter = "N / Total". FPS display in `--c-border` colour (subdued).

**State signals used:** glyph change (play ↔ pause), inversion (button hover), scrubber position (current frame), border-colour text (FPS, less prominent than frame counter).

---

## 2. Compliance Assessment

### 2.1 Colour Law — `var(--c-*)` only in UI

| Component | Status | Notes |
|---|---|---|
| DistortToolbar | ✓ | All UI colours via CSS vars |
| NodePanel | ✓ | Driver button uses `--c-accent`; legal |
| EffectStack | ✓ | |
| CategoryPicker | ✓ | |
| ViewportCanvas | ✓ | Canvas context reads CSS vars via `getComputedStyle`; correct workaround |
| VariationGrid | ✓ | Colours resolved by caller and passed in |
| DriverPicker | ✓ | |
| TransportStrip | ✓ | `color` passed as CSS var string, not raw value |

---

### 2.2 Typography Law — Space Mono, UPPERCASE controls

| Component | Status | Notes |
|---|---|---|
| DistortToolbar | ✓ | All labels uppercase, Space Mono |
| NodePanel | **~** | Node name `font-size: F×0.85` — non-standard fraction (standard is F×0.75) |
| EffectStack | **~** | Add button `font-size: F×0.85` — same deviation |
| CategoryPicker | **~** | Entry items `font-size: F×0.85` — same deviation |
| ViewportCanvas | ✓ | Loading overlay uses `F px` (1F) |
| VariationGrid | ✓ | `F×0.75` monospace label |
| DriverPicker | ✓ | All at `F×0.75` |
| TransportStrip | ✓ | All at `F×0.75` |

**Finding:** `F×0.85` is used for "prominent" labels across NodePanel, EffectStack, and CategoryPicker — a locally invented size tier not defined in the F-system or design-law. Two recognised sizes exist: `F` (body/overlay) and `F×0.75` (controls). This is a local exception without authority.

---

### 2.3 Spacing & Dimension Law — F-system only

| Component | Status | Notes |
|---|---|---|
| DistortToolbar | ✓ | Heights 2F; paddings F, F2; export menu min-width 15F |
| NodePanel | **~** | `font-size: F×0.85` (see typography); otherwise F-compliant |
| EffectStack | ✓ | Heights 2F; paddings correct |
| CategoryPicker | ✓ | Indent 2F for items; label width 7F |
| ViewportCanvas | ✓ | F used only for overlay font-size and letter-spacing |
| VariationGrid | **~** | Label strip height `F×1.5` — non-standard; should be `F` or `2F` |
| DriverPicker | ✓ | Consistent F-multiples throughout |
| TransportStrip | ✓ | gap F; readout min-widths 5F/4F |

---

### 2.4 State Signalling Law — inversion / boundary / position / value, no decoration

| Component | Issue | Severity |
|---|---|---|
| NodePanel | `opacity: 0.55` on disabled node name | **Violation** — design-law prohibits "soft emphasis"; opacity fade is decorative, not structural |
| NodePanel | `transition: opacity 120ms ease` on driver button (+D) | **Violation** — animated opacity is decorative chrome; state should flip immediately |
| DriverPicker | Error state (`SYNTAX ERROR`) and idle state (`—`) both rendered in `var(--c-border)` — visually identical | **Defect** — error is a distinct state that must be distinguishable from idle |
| EffectStack | Empty-state placeholder text uses `--c-border` centred; no structural boundary to explain the region | **Minor** — acceptable as muted informational microcopy but reads as decoration |

---

### 2.5 Layout / Partition Law

| Component | Issue | Severity |
|---|---|---|
| EffectStack add button | `border: 1px solid var(--c-border)` on a full-width button — private outline, not a shared boundary | **Violation** — design-law: "Floating elements prohibited"; "detached bordered buttons in open space" explicitly prohibited |
| NodePanel tier dividers | `height: 1px; background: var(--c-border)` inserted as a DOM element between tiers | **Minor** — introduces a structural divider as an absolute element, not as a shared border between adjacent cells; functional but not partition-pure |
| DistortToolbar export dropdown | `position: absolute; top: 100%; right: -1px` with `border: 1px solid var(--c-border)` — a floating panel, not a partition | **Violation** — design-law prohibits floating overlaid panels; dropdown should be inline or sidebar-bound |
| ViewportCanvas | `window.addEventListener('resize', ...)` — direct `window.*` access in a subclass, not within BaseComponent internals | **Architecture violation** — workspace rule SSoT: "NO `window.*` outside BaseComponent module" |

---

### 2.6 Behaviour Law — inline preference, simultaneity, no modal interruption

| Component | Status | Notes |
|---|---|---|
| CategoryPicker | ✓ | Replaces content area inline — correct |
| DriverPicker | ✓ | Expands inline below param row — correct |
| DistortToolbar export menu | **~** | Absolutepositioned dropdown: functionally modal-adjacent; violates partition law above |
| NodePanel mask block | ✓ | Inline expand via `_rebuildBody` |

---

## 3. Summary of Violations

| # | Component | Concern | Rule Breached |
|---|---|---|---|
| V1 | NodePanel | `opacity: 0.55` for disabled state | design-law §Colour — state via structure not decoration |
| V2 | NodePanel | `transition: opacity 120ms ease` on driver button | design-law §Behaviour — no decorative animation chrome |
| V3 | DriverPicker | Error and idle states visually identical (`--c-border`) | design-law §Colour — state signalling must be distinguishable |
| V4 | EffectStack | Add button has private `border: 1px solid` outline | design-law §Geometric — no detached bordered buttons |
| V5 | DistortToolbar | Export dropdown is absolutely positioned floating panel | design-law §Geometric — no floating chrome panels |
| V6 | ViewportCanvas | `window.addEventListener` directly in component | workspace rule — `window.*` outside BaseComponent forbidden |
| M1 | NodePanel / EffectStack / CategoryPicker | `F×0.85` font size — undefined in F-system | design-law §Scale — no ad-hoc local pixel values |
| M2 | VariationGrid | Label strip height `F×1.5` — undefined in F-system | design-law §Scale — same |
| M3 | NodePanel | Tier dividers as inserted DOM elements, not shared borders | design-law §Geometric — prefer shared boundaries |
