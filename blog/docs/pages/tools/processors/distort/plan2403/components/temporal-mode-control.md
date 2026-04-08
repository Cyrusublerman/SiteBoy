# TemporalModeControl

**ComponentLibrary key:** `temporal-mode-control`. **Class:** `TemporalModeControl` extends `BaseComponent`.

## Purpose

TEMPORAL MODE: STATIC / DRIFT / BAKED / FRAME-driven plus PHASE DRIFT SPEED where applicable.

## Options

```javascript
{
  temporalMode: 'STATIC',
  modeOptions: [],
  driftSpeed: 0,
  onChange: (patch) => {},
  frameBindingKey: 'frame' // links to FrameSlider external
}
```

## Structure

`dropdown` + optional `numeric-input` for speed; visibility G14 when mode STATIC hides drift.

## ToolBase

Not shorthand; `ComponentLibrary.create('temporal-mode-control', opts, deps)` or `new TemporalModeControl(opts, deps)`.

## Direct usage

```javascript
const t = new TemporalModeControl({ temporalMode: 'STATIC', onChange: (patch) => {} }, deps);
parent.appendChild(t.render());
```

## Visual

`dropdown` row + optional speed row; each `height: 2F`; UPPERCASE labels.

## Modules

FILMGRAIN, SCANLINES, INTERFERENCE.

## Methods

`getState()`, `setState()`, `destroy()`.
