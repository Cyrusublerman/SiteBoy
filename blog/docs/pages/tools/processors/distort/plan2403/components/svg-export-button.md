# SVGExportButton

**ComponentLibrary key:** `svg-export-button`. **Class:** `SvgExportButton` extends `BaseComponent`.

## Purpose

In-module SVG export of current vector frame (G10). Not toolbar export (`component-patterns.md` §4 — vector exception per review).

## Options

```javascript
{
  text: 'EXPORT SVG',
  size: 'm',
  fill: true,
  disabled: false,
  title: 'Download current vector frame as SVG',
  onExport: () => Promise<string|Blob> // producer injects serializer (Phase 1 contract; Button may wrap as click handler)
}
```

## ToolBase

Not shorthand; `ComponentLibrary.create('svg-export-button', opts, deps)` or `new SVGExportButton(opts, deps)`.

## Direct usage

```javascript
const exp = new SVGExportButton({ onExport: async () => svgString }, deps);
parent.appendChild(exp.render());
```

## Visual

Single button row `height: 2F`; UPPERCASE `EXPORT SVG`; `var(--c-*)` only.

## Methods

- `setDisabled(b)`
- `destroy()`

## Modules

LUMFLOW, SERPENTINE, STATICHALFTONE, MODULEFLOWLINES.

## Compliance

Button `height: 2F`; UPPERCASE label; `var(--c-*)` only; feature ownership documented in tool spec to avoid duplicate global export.
