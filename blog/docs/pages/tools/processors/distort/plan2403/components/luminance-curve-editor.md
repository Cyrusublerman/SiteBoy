# LuminanceCurveEditor

**ComponentLibrary key:** `luminance-curve-editor`. **Class:** `LuminanceCurveEditor` extends `BaseComponent`.

## Purpose

Editable piecewise curve mapping input luminance→density or luminance→radius (STIPPLE, DELAUNAYMESH).

## Options

```javascript
{
  points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], // normalised 0–1
  label: 'LUMINANCE CURVE',
  onChange: (points) => {},
  preview: false // optional mini plot — if canvas used, canvas colours `var(--vga-*)` per workspace rules for canvas output
}
```

## Compliance

UI chrome: `var(--c-*)` only; F units; no rounded corners. If curve drawn on canvas, palette `var(--vga-*)`.

## Methods

`setPoints()`, `getPoints()`, `destroy()`.

## Dependencies

May compose `canvas` output component for edit surface; interactions via BaseComponent-safe hooks only.

## Modules

STIPPLE, DELAUNAYMESH.

## Related controls

STIPPLE Stage 1 (Tone Field) also defines **INVERT TONE** and **OPERATE IN LINEAR LIGHT** — separate boolean params on the module, not properties of `LuminanceCurveEditor`. Bundle them in the same NodePanel section when rebuilding STIPPLE.
