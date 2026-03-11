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
| Rail | Top row of sibling cells used for mode or tool actions. |
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

## 5. Portrait Mode

Portrait rule:

`PCS -> secondary controls`

Default threshold:
- viewport width `< 800px`

Operational behaviour:
- PCS moves above the sidebar
- sidebar remains scrollable
- same `F`-based sizing law remains in effect

Portrait mode is a reordering of partitions, not a new design language.

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
