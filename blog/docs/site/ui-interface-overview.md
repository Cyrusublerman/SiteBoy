# SiteBoy UI Rules

All SiteBoy surfaces—tools, galleries, TOCs, documentation—are generated from a single ideological core. This document restates that ideology and the concrete rules it produces.

**Related Documents:**
- `blog/docs/guides/tools/tool-build-guide.md` — Implementation patterns
- `blog/docs/guides/f-system.md` — Sizing tokens
- `blog/docs/guides/tool-standards.md` — Minimum functionality

---

## 0. Glossary

| Term | Definition |
| --- | --- |
| **F** | Base unit = 14px. All dimensions derive from F. |
| **Tab** | Top-level sidebar section (e.g., CONTROLS, CANVAS). Uppercase. |
| **Block** | Grouping of related controls within a Tab (e.g., Parameters, Style). Title Case. |
| **Component** | Individual UI element (slider, button, toggle, etc.). |
| **Key** | Unique identifier for a component's value. camelCase. |
| **PCS** | Primary Content Surface. The dominant visual area of a page (canvas for tools, text column for docs). |
| **Rail** | Horizontal tab bar at sidebar top. |
| **Mode** | Current active Tab (only one Tab is visible at a time). |

---

## 1. Core Ideology

| Principle | Definition |
| --- | --- |
| Grid Absolutism | F is the indivisible unit; everything snaps to the quantised grid. |
| Single-Sheet Reality | UI reads as a single cut surface; adjacent blocks share borders, no floating cards. |
| Informative Minimalism | Only interaction/interpretation elements render; no filler copy or decorative chrome. |
| Hierarchy as Function | Typography and inversion communicate structure, never decoration. |
| Device-Agnostic Precision | Tool behaviour and layout math are identical across viewports; spacing is never fluid. |
| Tool Primacy | Canvas/output column always dominates; controls adapt around it. |
| Component Monotheism | Each component type exists once in ComponentLibrary; no custom variants. |
| Functional Alignment | Labels precede controls; widths are fixed; alignments reflect semantic grouping. |
| Zero Ambiguity | Controls must explain themselves; unclear UI is redesigned, not annotated. |
| Silence | Negative space is deliberate and F-based; nothing floats. |
| Content Sovereignty | Content dictates layout; galleries stay typographic, tools keep canvas dominance. |

**Aesthetic Statement:** Instrumental, grid-bound, silent, precise, terminal-like, hierarchical by function.

---

## 2. F-System

### 2.1 Tokens

| Token | CSS Variable | Value | Usage |
| --- | --- | --- | --- |
| F | `--F` or `--f` | 14px | Base unit, body text, standard gaps |
| F/2 | `calc(var(--F) / 2)` | 7px | Tight gaps, half-unit spacing |
| 2F | `calc(var(--F) * 2)` | 28px | Control heights, header heights |
| 30F | `calc(var(--F) * 30)` | 420px | Sidebar width |

### 2.2 Rules

1. All spacing = F or F/2 multiples. No other values permitted.
2. All control heights = 2F (28px).
3. Block padding = F.
4. Gap between controls (same block) = F/2.
5. Gap between blocks = shared 1px border (no gap).
6. Sidebar width = 30F (fixed, never fluid).
7. Canvas sizes should be F-multiples: 196, 280, 392, 420, 560, 784, 840...

### 2.3 CSS Patterns

```css
/* Control height */
height: calc(var(--F) * 2);      /* 28px */

/* Standard gap */
gap: var(--F);                   /* 14px */

/* Tight gap */
gap: calc(var(--F) / 2);         /* 7px */

/* Container padding */
padding: var(--F);               /* 14px */
```

---

## 3. Single-Sheet Reality (Border Rules)

1. **Zero double borders** — Adjacent modules rely on CSS gaps to produce one 1px divider both elements share. No component renders its own outer border unless it is the outermost container.
2. **Hierarchical compartments** — Tabs, blocks, and controls are nested compartments that line up flush. `[ TAB | TAB ]` rails, stacked blocks, and inline controls all read as cuts in the same sheet.
3. **Margins vs padding** — Only outer containers use margin to separate from viewport. Everything else uses padding.
4. **No card chrome** — No shadows, rounded corners, gradients, or floating panels. Differentiation via typography, thin dividers, or inversion only.

---

## 4. Tabs and Rails

### 4.1 Tab Rail (Primary Navigation)

- Uppercase text
- Height = 2F (28px)
- Monochrome backgrounds
- Active tab: inverted colors (`var(--c-text)` background, `var(--c-bg)` text)
- Maximum 4 tabs per tool

### 4.2 Standard Tab Names

| Tab | When to Use | Contents |
| --- | --- | --- |
| CONTROLS | Always | Primary parameters |
| CANVAS | Visual tools | Size, display mode, export |
| ANIMATION | Animated tools | Playback, FPS, loop, export |
| PRESETS | State-heavy tools | Save/load configurations |
| INFO | When needed | Help, formulas, credits |

**Maximum 5 standard tabs. If more organization needed, use blocks within tabs.**

### 4.3 Typography

- **Tab names:** UPPERCASE Atkinson Hyperlegible
- **Block titles:** Title Case Atkinson Hyperlegible
- **Control labels:** Sentence case
- **Inversion:** Only for active state, never decoration

---

## 5. Sidebar Blocks

### 5.1 Structure

```
TAB ──┬── BLOCK ──┬── component
      │           ├── component
      │           └── component
      │
      └── BLOCK ──┬── component
                  └── component
```

**Three levels required: TAB → BLOCK → COMPONENT.**

### 5.2 Standard Block Names

| Block | Contents |
| --- | --- |
| Parameters | Core adjustable values |
| Style | Colors, stroke width, fill |
| Canvas | Width, height, display mode |
| Export | Download buttons |
| Playback | Animation controls |
| Source | File upload |
| Output | Result displays, values |

**Use these exact names for consistency. Tool-specific blocks may use descriptive names (e.g., "Wave Settings", "Orbital Parameters").**

### 5.3 Block Layout Rules

1. Block title: Title Case, single baseline, no icons
2. Block content: column with F padding, F/2 gap between controls
3. Controls stretch to full width (sliders, buttons align block-to-block)
4. Labels precede controls (label row above control row for sliders)
5. Toggle labels double as clickable pill; no separate "On/Off" text

---

## 6. Color System

### 6.1 UI Tokens (DOM Elements)

All DOM elements must use CSS variables only:

| Token | Usage |
| --- | --- |
| `var(--c-bg)` | Background color |
| `var(--c-text)` | Text color |
| `var(--c-border)` | Border color |
| `var(--c-accent)` | Accent/highlight |

**No raw hex values in CSS or inline styles.**

### 6.2 Canvas Palette (Rendering)

Canvas drawing may use raw VGA hex values:

```
#000000  #800000  #008000  #808000
#000080  #800080  #008080  #c0c0c0
#808080  #ff0000  #00ff00  #ffff00
#0000ff  #ff00ff  #00ffff  #ffffff
```

These are the only permitted colors for canvas rendering.

### 6.3 State Indications

- Hover: simple inversion
- Active: inversion + 1px border
- No opacity fades or color ramps outside palette

---

## 7. Primary Content Surface (PCS)

Each page type has exactly one PCS. All UI must visually defer to it.

| Page Type | PCS | Behavior |
| --- | --- | --- |
| Tool | Canvas | Canvas never collapses; controls scroll independently |
| Documentation | Text column | Text dominates; no competing panels |
| TOC | TOC list | List centered; minimal chrome |
| Gallery | Media grid | Grid dominates; thin captions only |

### 7.1 Tool PCS Rules

1. Canvas-first: main column never collapsed
2. Edge-aligned UI: overlays hug canvas edges with F padding
3. Canvas tab extras: visualization-related controls stay in CANVAS tab

---

## 8. Component Standards

### 8.1 Controls

| Component | Height | Label Position | Notes |
| --- | --- | --- | --- |
| Slider | 2F | Above | Numeric readout right-aligned |
| Button | 2F | N/A (text is label) | Full width |
| Dropdown | 2F | Above | Full width |
| Toggle | 2F | Inline | Label is clickable pill |
| Color | 2F | Above | Optional hex input |
| Number | 2F | Above | +/- buttons optional |

### 8.2 Composition Rules

1. Tools must not generate raw DOM — use ComponentLibrary only
2. No inline CSS or HTML events in tool code
3. Custom spacing prohibited — use F-system only
4. Shadows, rounded corners, card visuals prohibited

### 8.3 Complex Widgets

Sequencers, timelines, and galleries must be composed from existing primitives:
- Section → Stack → Grid → ButtonGroup → ToggleGroup

No custom DOM for complex widgets.

---

## 9. Portrait Mode

Portrait always stacks: **PCS (top) → Controls (bottom)**.

- Threshold: viewport width < 800px
- Canvas displays first, sidebar scrolls below
- Same F-based padding and gaps apply
- No exceptions

---

## 10. Implementation Checklist

Before committing any UI change:

| Check | Question |
| --- | --- |
| Ideology | Which principle line(s) require this element? If none, remove it. |
| F-grid | Does every dimension use F or F/2? |
| Single-sheet | Does it share borders with neighbours? No double borders? |
| Minimalism | Does it add copy, chrome, or filler? |
| Component | Is it built from ComponentLibrary? |
| Color | Does it use only `var(--c-*)` for UI, VGA palette for canvas? |
| PCS | Does it respect canvas dominance / typographic purity? |

Any "no" response blocks implementation.

---

## 11. Quick Reference

### Tool Layout

```
┌─────────────────────────────────────────────┐
│ CONTENT CONTAINER (100vw - margins)         │
│ ┌──────────────┬────────────────────────────┤
│ │ SIDEBAR      │ CANVAS AREA                │
│ │ width: 30F   │ flex: 1                    │
│ │ (420px)      │ centers canvas             │
│ │ scrolls      │                            │
│ └──────────────┴────────────────────────────┘
└─────────────────────────────────────────────┘
```

### Sidebar Structure

```javascript
sidebar: [
    ['TAB NAME', [           // UPPERCASE
        ['Block Title', [    // Title Case
            // components...
        ]],
    ]],
]
```

### Dimension Cheat Sheet

| Dimension | Value | F-Multiple |
| --- | --- | --- |
| Base unit | 14px | 1F |
| Half gap | 7px | F/2 |
| Control height | 28px | 2F |
| Header height | 28px | 2F |
| Sidebar width | 420px | 30F |
| Target margin | 56px | 4F |

---

## 12. Ideology → Rules Mapping

| Ideology | Concrete Rule |
| --- | --- |
| Grid Absolutism | F-system tokens, quantised spacing (§2) |
| Single-Sheet Reality | Shared borders, zero double outlines (§3) |
| Informative Minimalism | Block content = label + control only (§5) |
| Hierarchy as Function | Uppercase tabs, sentence-case operations (§4) |
| Device-Agnostic Precision | Fixed 30F sidebar, explicit canvas sizing (§2.2) |
| Tool Primacy | Canvas dominance, controls scroll independently (§7) |
| Component Monotheism | ComponentLibrary primitives only (§8) |
| Functional Alignment | Full-width controls, structured blocks (§5.3) |
| Zero Ambiguity | Toggle labels as text; no helper text (§5.3) |
| Silence | F-based padding/margins only (§2) |
| Content Sovereignty | PCS rules per page type (§7) |

---

## 13. Prohibited Patterns

| Pattern | Violation | Alternative |
| --- | --- | --- |
| `document.createElement()` in tools | Component Monotheism | Use ComponentLibrary |
| `element.style.padding = '8px'` | Grid Absolutism | Use CSS classes with F-system |
| `color: #ff5500` in CSS | Color System | Use `var(--vga-*)` |
| `border-radius: 4px` | Single-Sheet Reality | Remove (no rounded corners) |
| `box-shadow: ...` | Single-Sheet Reality | Remove (no shadows) |
| Floating panels | Single-Sheet Reality | Integrate into sheet |
| More than 4 tabs | Tab Limit | Consolidate into blocks |

---

End of UI Rules.
