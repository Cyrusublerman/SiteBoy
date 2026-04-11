# MaskControls

**ComponentLibrary key:** `mask-controls`. **Class:** `MaskControls` extends `BaseComponent`.

## Purpose

MASK SOURCE, MASK METRIC, MASK MIN/MAX, MASK SOFTNESS, MASK INVERT for DOMAINWARP-class masking layers.

## Options

```javascript
{
  maskSource: 'LUMINANCE',
  maskMetric: 'LINEAR',
  maskMin: 0,
  maskMax: 1,
  maskSoftness: 0,
  maskInvert: false,
  onChange: (patch) => {},
  sourceOptions: [],
  metricOptions: []
}
```

## Structure

`dropdown` + `dropdown` + two `numeric-input` + `toggle-group` (single INV boolean).

## ToolBase

Not shorthand; `ComponentLibrary.create('mask-controls', opts, deps)` or `new MaskControls(opts, deps)`.

## Direct usage

```javascript
const m = new MaskControls({ onChange: (patch) => {} }, deps);
parent.appendChild(m.render());
```

## Visual

Vertical stack `gap: F/2`; rows `height: 2F`; UPPERCASE param labels.

## Modules

DOMAINWARP; MOIRE/GRATING Phase 3+ per reviews.

## Dependencies

Field bus normalisation spec must match MASK MIN/MAX semantics.

## Methods

`getState()`, `setState()`, `destroy()`.
