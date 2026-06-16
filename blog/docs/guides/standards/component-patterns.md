# Component Patterns

Which component to use for every UI need. How to divide space. How to compose pages without duplication.

**Authority:** `design-law.md §17` (toolbar partitions), `design-law.md §2.8` (informative minimalism), `ui-interface-overview.md §2–3` (standard tool layout).

Cross-references: `border-system.md`, `semiotics.md`, `text-treatment.md`, `composite-components.md`.

Building a component from subcomponents (e.g. toggle + slider + numeric field bound into one bordered box) is governed by `composite-components.md` — shared boundaries, no gaps, stack-aware borders. Read it before composing.

---

## 1. Component Mandate

Every UI element that has a ComponentLibrary equivalent must use that component. Inline DOM construction for an equivalent element is a violation.

If the library component lacks required behaviour, **extend the library component** — do not build a one-off. One-off components diverge from the visual system and must be corrected.

**How to use the library:**

```javascript
// Factory method (preferred)
const input = ComponentLibrary.create('numeric-input', {
    label: 'RADIUS',
    min: 0, max: 100, step: 1, value: 10,
    key: 'radius'
}, deps);

// Direct class access
const input = new ComponentLibrary.NumericInput({ label: 'RADIUS', ... }, deps);
```

---

## 2. Canonical Component Table

For every UI need, the canonical component. No alternatives.

| UI need | ComponentLibrary key | Notes |
| --- | --- | --- |
| Numeric input (slider + number field) | `'numeric-input'` | Provides label, slider, field, stepper in one unit |
| Slider (bare range track) | `'slider'` | Monochrome range primitive. Compose inside `numeric-input`, transport, etc.; use directly only when no number field is wanted |
| Dropdown (select from list) | `'dropdown'` | Full-width, anchored expansion, `▾` glyph required |
| Button (action trigger) | `'button'` | Use `size: 's'`/`'m'`/`'l'` for width |
| Toggle group (multi-select) | `'toggle-group'` | Radio-style or multi-select |
| Text input (user-typed string) | `'text-input'` | For free text; not for numeric values |
| Colour input | `'color-input'` | Restricted to VGA palette |
| File input (file picker) | `'file-input'` | Wraps native file picker |
| Collapsible section | `'collapsible-section'` | Handles expand/collapse state |
| Progress bar | `'progress-bar'` | For loading/computation progress |
| Label / text output | `'text'` | For read-only display labels |
| Canvas output | `'canvas'` | For rendered output |
| Tab bar | ToolBase `sidebar` config | Tabs are framework-managed — not custom DOM |
| Equation editor | `'equation-editor'` | For expression/formula inputs |
| Colour palette display | `'palette-preview'` | For displaying a set of VGA colours |
| Preset toolbar (dropdown + randomise + reset) | `'preset-toolbar'` | Generator Presets block; one horizontal partition |
| Canvas size pair (width × height) | `'canvas-size-pair'` | Generator OUTPUT Size block |
| Post effect row (on/off + strength) | `'post-effect-row'` | Generator OUTPUT Post block, per effect |
| Palette layer table | `'palette-table'` | Generator OUTPUT Palette block; flush `PaletteRow` stack |

If a need is not in this table, search `blog/docs/components/COMPONENT-REFERENCE.md` before building anything new.

---

## 3. Proportional Space Division

Proportions are always `nF` (fixed, deterministic) or `flex: 1` (fills remaining). Never percentages. Never ad-hoc pixel values.

### 3.1 Toolbar

```
┌────────────────────────────────────────────────────────────┐
│ STATUS CELL (flex: 1, min-width: 30F) │ ACT │ ACT │ ACT  │
└────────────────────────────────────────────────────────────┘
```

- **Action cells:** All equal width at `n × F` where `n` is a non-zero integer. Default: `6F` (`84px`). All action cells in one toolbar share the same width — no mixing.
- **Status cell:** `flex: 1; min-width: 30F` in landscape. `flex: 1; min-width: 0` in portrait/compact. Absorbs all remaining width.
- **Height:** `2F` for the entire toolbar.
- **No percentage widths.** GeneratorToolbar's `12.5%` is a violation of design-law §17.1.

### 3.2 Sidebar

- **Width:** Always `30F` (`420px` at `F=14`). Fixed. Not configurable per-tool.
- **Tab bar:** Tabs share equal width via `flex: 1`. No fixed widths on individual tabs.
- **Block content:** Full width of sidebar. Padding `F` applied by the block container.
- **Component gap:** `F/2` between siblings within a block.

### 3.3 Canvas Area

- **Landscape:** `flex: 1` — fills all space remaining after sidebar.
- **Portrait:** Full viewport width; sidebar stacks below. `min-height: 200px`.

### 3.4 Parameter Rows

Label and value on the same row:

```javascript
row.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: ${F * 2}px;
    padding: 0 ${F}px;
`;
// Label is flex: 1 (fills space)
// Value readout is flex-shrink: 0 (as wide as content)
```

### 3.5 General Rule

| Pattern | Use | Do not use |
| --- | --- | --- |
| Fixed partition | `n × F` for any cell with a known size | `12.5%`, `180px`, `60px`, `calc(50% - 2px)` |
| Fill remaining | `flex: 1` | `width: 100%` on a sibling of fixed elements |
| Internal spacing | `gap: F/2` or `padding: F` | `margin`, `gap: 10px` |

---

## 4. Feature Ownership Map

Every feature has exactly one location in a tool. If a feature already exists in one place, it may not appear in another. This is enforced by the duplication checklist in §5.

| Feature | Owner | Never in |
| --- | --- | --- |
| Export actions | Toolbar (if toolbar exists); sidebar EXPORT block if no toolbar | Both toolbar and sidebar simultaneously |
| Display mode (fit/fill/actual) | Toolbar | Sidebar |
| Quality toggle | Toolbar | Sidebar |
| Undo / redo | Toolbar | Sidebar |
| Canvas sizing (width, height) | Sidebar CANVAS tab | Toolbar |
| Source / file input trigger | Toolbar status cell | As a full control in sidebar (sidebar may show source name/info but not re-expose the file picker) |
| Global seed | Sidebar CANVAS tab | Toolbar |
| Animation playback controls | Toolbar transport strip OR sidebar ANIMATION tab — choose one | Both simultaneously |
| Frame scrubber | Sidebar ANIMATION tab (if transport is in toolbar) | Toolbar |
| Node pipeline | Sidebar PIPELINE tab (distort only) | Toolbar |

**If a new tool has a feature not in this table:** Decide which region owns it (toolbar = always-accessible; sidebar = contextual), document the decision in the tool's spec, then build it in one place only.

---

## 5. Duplication Prevention Checklist

Run this before shipping any tool page or UI change. Every answer must be YES.

- [ ] For every feature (export, display mode, source, etc.): does it appear in exactly one location?
- [ ] For every action button: is there no other button in the same tool that triggers the same action?
- [ ] For every readout/display: does no other element show the same value?
- [ ] For every sidebar tab: does the tab contain content that cannot live in the toolbar?
- [ ] Has the feature ownership map (§4) been consulted before placing every feature?

---

## 6. Build Recipes

Concrete "if building X" procedures. Follow exactly in the stated order.

### 6.1 Building a Tool Page

1. Use `ToolBase` per `tool-build-guide.md`.
2. Select all UI components from §2 (canonical table). Do not build any component inline.
3. Consult §4 (feature ownership map) before placing every feature.
4. Run §5 (duplication checklist) before shipping.
5. Apply `border-system.md`, `semiotics.md`, `text-treatment.md` throughout.

### 6.2 Building a Toolbar

```
height:    2F
container: border-bottom: 1px solid var(--c-border) (border-system.md §10)
cells:     height 2F, border-left per border-system.md §4
           action cells: width nF (equal, default 6F)
           status cell:  flex: 1, min-width: 30F (landscape)
text:      text-treatment.md §2 — UPPERCASE, F × 0.75, appropriate alignment
glyphs:    semiotics.md §2 — ▾ for dropdown triggers
```

### 6.3 Building a Sidebar Block

```
header:    Title Case, F, bold (text-treatment.md §2 — structural block header)
           border-bottom: 1px solid var(--c-border) when expanded
           border-top per stack position (border-system.md §3)
content:   padding: F on all sides
           display: flex; flex-direction: column; gap: F/2
components: use canonical table (§2); each component height 2F
```

### 6.4 Adding a Dropdown to a Toolbar

1. Trigger cell: standard action cell (`width: 6F`, height `2F`).
2. Trigger label: UPPERCASE, `F × 0.75`, centred. Glyph: `▾` right of label.
3. Dropdown menu: anchored expansion (`design-law.md §16.1`).
   - `position: absolute; top: 100%` relative to trigger.
   - `min-width: 100%` of trigger cell width (never wider than needed — design-law §17.4).
   - Borders: left, right, bottom `1px solid var(--c-border)`; top: none (`border-system.md §9`).
   - `z-index` above siblings.
4. Menu items: height `2F`, `padding: 0 F`, left-aligned, UPPERCASE, `F × 0.75`.
5. Section headers within menu: same height/padding, `color: var(--c-border)` (muted).

### 6.5 Adding a Collapsible Section

**Content sections** (user-facing content inside):

```javascript
// Glyph: ▸ (collapsed) / ▾ (expanded) — left of label
// header border-bottom: conditional (border-system.md §7)
// header text: UPPERCASE, F × 0.75, var(--c-text)
// Stack position: border-top per border-system.md §3
```

**Structural blocks** (organisational scaffolding):

```javascript
// Glyph: + (collapsed) / − (expanded) — right of label
// Same border rules apply
// header text: Title Case, F, bold
```

Use `ComponentLibrary.create('collapsible-section', ...)` for all collapsible sections.

### 6.6 Adding Export to a Tool

Decision tree:

```
Does the tool have a toolbar?
├── YES → Export goes in the toolbar only.
│          Add an EXPORT ▾ cell (action cell, width 6F).
│          Dropdown lists format options.
│          Do NOT add export anywhere in the sidebar.
└── NO  → Export goes in sidebar CANVAS tab, EXPORT block.
           Add download buttons using ComponentLibrary.create('button', ...).
           Do NOT add a toolbar just for export.
```

### 6.7 Building a Picker / List

```
Surface type: bounded overlay (design-law.md §16.1)
position: absolute; inset: 0 relative to nearest positioned ancestor
z-index: above siblings
overflow-y: auto (scrollable)
borders: left, right, bottom 1px solid var(--c-border); top: none
items: height 2F, padding: 0 F, left-aligned, UPPERCASE, F × 0.75
hover info: native title attribute populated from data source (not from label fallback)
```

### 6.8 Building a Numeric Parameter Row

```javascript
// Use ComponentLibrary — do not build inline
const input = ComponentLibrary.create('numeric-input', {
    label: 'PARAM NAME',   // UPPERCASE
    min: 0, max: 100,
    step: 1, value: 50,
    key: 'paramName'
}, deps);

// The component handles:
// - label (left) + value readout (right) on one row
// - slider full-width below
// - stepper buttons if configured
// Height of interactive row: 2F
```

### 6.9 Building a Tab Bar

```
tabs:      equal width via flex: 1 on each tab
height:    2F
text:      UPPERCASE, F × 0.75, centred
active:    inversion (bg: var(--c-text), color: var(--c-bg)); border-bottom: none
inactive:  default (bg: var(--c-bg), color: var(--c-text)); border-bottom: 1px solid var(--c-border)
container: border-bottom: 1px solid var(--c-border) (under inactive tabs)
```

See `border-system.md §11` for full tab bar border specification.

---

## 7. Codebase Violations (reference — fixes are separate tasks)

| File | Violation | Fix |
| --- | --- | --- |
| `assets/js/shared/components/tool/GeneratorToolbar.js` | Toolbar cell widths use `12.5%` instead of `nF` | Change to `width: ${F * 6}px` per §3.1 |
| `assets/js/tools/generators/core/generative-tool-host.js` + `parameter-builder.js` | Export exists in both toolbar and sidebar | Remove from sidebar; toolbar is the owner |
| `assets/js/shared/components/tool/ToolCanvas.js` | Status bar padding `4px 8px` | `padding: 0 ${F}px` |
| `assets/js/shared/components/tool/ToolTabs.js` | Padding `8px`, `8px 16px` | `0 ${F}px` per §3 |
| `assets/js/shared/components/input/NumericInput.js` | Numeric value display uses `text-align: center` | `text-align: right` |
| `assets/js/shared/components/tool/GeneratorToolbar.js` | Export panel `min-width: 180px` | `min-width: 100%` of trigger cell |

---

## 8. Density Law

Related parameters that are read together by the user MUST be laid out in a multi-column grid, never stacked in a single column.

### Rule: paired numerics

Two numeric parameters that belong conceptually together (width × height, min × max, R × G, start × end) use a **3-column inline grid**:

```
[ label ]  [ input ]  ×  [ input ]
```

Columns: label | first-input | separator-glyph | second-input. The separator glyph is `×` (U+00D7) centred in its own cell. Both inputs share an equal fraction of the available space.

### Rule: palette rows

One colourway layer renders as a **5-column row**:

```
[ label ]  [ swatch ]  [ hex input ]  [ width-or-alpha ]  [ mod chip ]
```

Column widths: label `3F`, swatch `2F`, hex `6F`, width/alpha `3F`, mod chip `2F`. Total `16F` per row.

A `PaletteRow` component encodes this layout. Do not re-implement the five-column structure elsewhere.

### Rule: single-column reserved

Single-column stacked layout is permitted only for parameters that are:
- unrelated to their neighbours
- self-contained (not part of a named pair or group)
- controls with complex internal structure that cannot be abbreviated

### Summary table

| Relationship | Layout | Component |
|---|---|---|
| Paired numerics (W×H, Min×Max) | 3-col inline grid | `CanvasSizePair` or `NumericInput` pair in grid wrapper |
| Palette layer | 5-col row | `PaletteRow` (via `PaletteTable` in generator OUTPUT) |
| Presets + actions | horizontal partition | `PresetToolbar` |
| Post effect | toggle + strength partition | `PostEffectRow` |
| Newline-delimited text | per-line cells + add/remove | `LineListInput` (param type `text`/`textarea`/`lines`) |
| Unrelated single param | 1-col full row | standard param row |

---

End of Component Patterns.
