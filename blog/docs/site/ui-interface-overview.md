# SiteBoy UI Interface Overview

Operational reference for page archetypes, layout structure, and standard tool organisation.

Authority:
- `blog/docs/guides/standards/design-law.md` — absolute aesthetic and geometric law
- `blog/docs/guides/tool-standards.md` — tool minimum functionality
- `blog/docs/components/COMPONENT-REFERENCE.md` — component API

This file does not redefine typography, colour, border, or prohibition law. It applies the canonical law to common page structures.

---

## 0. Glossary

| Term | Definition |
| --- | --- |
| F | Base unit = 14px. See `design-law.md`. |
| PCS | Primary Content Surface. Dominant page region. |
| Rail / Toolbar | Top row of sibling cells used for mode or tool actions. "Rail" and "toolbar" are synonymous. |
| Tab | Top-level sidebar partition. |
| Block | Named subdivision inside a tab. |
| Component | Individual control or display element. |
| Mode | Current active tab. |

---

## 1. Page Archetypes

Each page has one PCS:

| Page Type | PCS | Secondary Regions |
| --- | --- | --- |
| Tool | Canvas or output viewport | Sidebar, toolbar, transport, status |
| Documentation | Text column | TOC, navigation, supporting media |
| TOC | List column | Header, navigation only |
| Gallery | Media grid or strip | Captioning, navigation only |

If a secondary region competes with the PCS, redesign the page.

---

## 2. Standard Tool Layout

Default tool structure:

```
┌─────────────────────────────────────────────┐
│ optional top rail / toolbar                │
├────────────────┬────────────────────────────┤
│ sidebar        │ PCS                        │
│ 30F fixed      │ flex: 1                    │
│ scrollable     │ dominant region            │
└────────────────┴────────────────────────────┘
```

Operational defaults:
- Sidebar width = `30F`
- Rail height = `2F`
- Control height = `2F`
- Same-block control gap = `F/2`
- Block separation = shared `1px` boundary, not open gap
- Portrait reflow = `PCS` first, controls second
- Toolbar status cell: `flex: 1; min-width: 30F` in landscape, `flex: 1; min-width: 0` in compact/portrait
- All toolbar action cells: equal width at `nF` (default `6F`; see `design-law.md §17`)

Use a top rail only when actions must remain simultaneously accessible with the sidebar workflow.

---

## 3. Sidebar Structure

Required hierarchy:

```javascript
sidebar: [
    ['TAB NAME', [
        ['Block Title', [
            // components
        ]],
    ]],
]
```

Structural rule:
- `TAB -> BLOCK -> COMPONENT`

Standard tab names:

| Tab | Purpose |
| --- | --- |
| CONTROLS | Primary parameters |
| CANVAS | Output size, display, render settings |
| ANIMATION | Playback configuration when simultaneous access is not required elsewhere |
| PRESETS | Save/load state |
| INFO | Help, formulas, credits |

Standard block names:

| Block | Purpose |
| --- | --- |
| Parameters | Core adjustable values |
| Style | Render style values |
| Canvas | Width, height, display mode |
| Export | Export actions |
| Playback | Animation controls |
| Source | File input |
| Output | Values and result displays |

Tool-specific names are allowed only when they describe a real domain partition more precisely than the standard name.

---

## 4. PCS Application

### 4.1 Tools

- Canvas or output viewport remains dominant.
- Sidebar scrolls independently.
- Controls should not be overlaid on the PCS when they can exist as surrounding partitions.
- Status, transport, or export surfaces may exist if they preserve PCS primacy.

### 4.2 Documentation

- Text column dominates.
- Supporting elements must remain subordinate.
- Avoid panel proliferation around prose.

### 4.3 Gallery

- Media grid dominates.
- Captions remain structurally thin.

### 4.4 TOC

- The list itself is the PCS.
- Chrome must remain minimal.

---

## 5. Responsive and Adaptive Layout

### 5.1 Breakpoints

| Breakpoint | Threshold | Behaviour |
| --- | --- | --- |
| Portrait | `< 800px` | PCS moves above sidebar; sidebar below |
| Compact | `< 500px` | Low-priority controls collapse or merge |

Portrait mode is a reordering of partitions, not a new design language. The `F`-based sizing law applies at all breakpoints.

The portrait detection threshold must be consistent between the initial render and the resize handler. Using different thresholds (e.g. `< 600` for initial render, `< 800` for resize) causes orientation mismatch — the layout rendered on load differs from the layout rendered after a resize event, producing invisible or duplicated elements.

### 5.2 Control Priority Tiers

Every control in a tool toolbar or rail is assigned a priority tier:

| Tier | Visibility rule |
| --- | --- |
| T1 | Always visible at all widths |
| T2 | Visible above the portrait breakpoint; collapsible or hidden below |
| T3 | Visible only when space is unconstrained; otherwise moved to a menu |

Tier assignment must be declared when implementing the control. T1 controls must remain usable at `< 500px` width.

### 5.3 Simplification Patterns

When available width cannot accommodate a radio group or multi-cell button row:

1. Replace with a cyclic button (single cell that cycles through values on click).
2. The cyclic button displays the current active value as its label.
3. The cyclic button is sized to `2F` height and at least `4F` width.

Example: `FIT | FILL | ACTUAL` (three cells) becomes a single cyclic cell labelled `FIT` that advances to `FILL` then `ACTUAL` on successive clicks.

Implementation pattern:

```javascript
const modes = ['FIT', 'FILL', 'ACTUAL'];
let idx = 0;
cell.textContent = modes[idx];
cell.addEventListener('click', () => {
    idx = (idx + 1) % modes.length;
    cell.textContent = modes[idx];
    onModeChange(modes[idx]);
});
```

### 5.4 Touch Sizing

Minimum interactive target size at portrait breakpoints: `3F × 2F` (`42px × 28px` at `F = 14px`). Elements smaller than this at portrait width are non-compliant.

### 5.5 Vertical Registration

All cells within a toolbar row must share the same top and bottom edge. Cells of different heights within a row are prohibited.

### 5.7 Responsive Lifecycle

When a tool framework (e.g. ToolBase) performs a full destroy/rebuild on orientation change:

1. All tool-injected components (custom panels, canvases, transport strips, effect stacks) must be re-injected into the new DOM.
2. The tool must either: (a) listen for a rebuild callback exposed by the framework, or (b) wrap the framework's resize handler to detect when a full rebuild has occurred and re-run injection.
3. A rebuild that produces empty sidebar sections, a blank canvas area, or missing controls is a blocking defect — it must be fixed before the tool is considered functional.

Wrap pattern for re-injection (distort-main.js example):

```javascript
const orig = toolBase._handleResize.bind(toolBase);
toolBase._handleResize = () => {
  const prev = toolBase.element;
  orig();
  if (toolBase.element !== prev) this._onToolBaseInit(toolBase);
};
```

`_onToolBaseInit` (or equivalent) must be made idempotent: destroy existing instances before creating new ones.

### 5.6 Responsive Verification Checklist

| Check | Question |
| --- | --- |
| Breakpoint coverage | Does the layout reflow correctly at both `< 800px` and `< 500px`? |
| T1 controls | Are all T1 controls readable and tappable at `< 500px`? |
| Cyclic substitution | Are multi-cell button rows replaced with cyclic buttons at compact width? |
| Touch targets | Are all interactive targets at least `3F` wide and `2F` tall at portrait width? |
| Partition integrity | Does the page still read as one subdivided rectangle at all breakpoints? |
| PCS primacy | Is the PCS still the dominant region at all breakpoints? |

Any failing check blocks release.

---

## 6. Implementation Checklist

Before shipping a UI change:

| Check | Question |
| --- | --- |
| Parent | What parent partition owns this element? |
| PCS | Does the PCS still dominate? |
| Structure | Does the page still read as one subdivided rectangle? |
| Size | Are all dimensions derived from `F`? |
| Boundary | Are borders shared where they should be? |
| Analogy | Does this behave like analogous elements elsewhere? |
| Ownership | Is this rule defined here, or should it live in `design-law.md`? |

Any unclear answer blocks implementation.

---

End of Interface Overview.
