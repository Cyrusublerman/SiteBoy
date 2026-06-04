# SiteBoy CSS Architecture — Modular System

## File Structure

```
assets/css/
├── index.css          # Entry point (imports all modules)
├── base.css           # Palette, reset, typography, F-system vars
├── components.css     # UI component classes
├── layout.css         # Page structure, responsive
├── tools.css          # ToolBase, canvas, sidebar
├── utilities.css      # Utility classes, debug, scrollbar
├── adjustment-bundles.css  # Adjustment bundle styles
└── styles.css         # ⚠ DEAD — legacy monolith, do NOT edit
```

## Usage

`index.html` loads the modular entry point:

```html
<link rel="stylesheet" href="assets/css/index.css">
```

## Routing (where to put new CSS)

| Concern | File |
| --- | --- |
| Palette vars, reset, typography | `base.css` |
| UI component classes (buttons, dropdowns, gallery items, forms) | `components.css` |
| Page structure, containers, grids, responsive breakpoints | `layout.css` |
| Tool interfaces (ToolBase, canvas area, sidebar, tabs) | `tools.css` |
| Utilities, debug helpers, scrollbar | `utilities.css` |

## Rules

- NEVER edit `styles.css` — it is a dead monolith pending deletion.
- Do NOT create new `.css` files; use the existing modules.
- All constraints from `rules.mdc` apply (VGA palette, F-system, no gradients/shadows/radius).
