# CentrePointPicker

**ComponentLibrary key:** `centre-point-picker`. **Class:** `CentrePointPicker` extends `BaseComponent`.

## Purpose

`PICK CENTRE` activates one-shot viewport pick; commits CENTRE X / CENTRE Y in image space (G6).

## Options

```javascript
{
  label: 'PICK CENTRE',
  active: false,           // boolean — arm pick mode
  centreX: 0.5,          // normalised 0–1 or px per module contract
  centreY: 0.5,
  coordSpace: 'NORMALISED', // 'NORMALISED' | 'PIXELS' — module-defined
  onArm: () => {},       // request canvas overlay
  onPick: (x, y) => {},  // committed coords
  onCancel: () => {},
  disabled: false
}
```

## ToolBase

Not shorthand; NodePanel builds via `ComponentLibrary.create('centre-point-picker', opts, deps)` or `new CentrePointPicker(opts, deps)`.

## Direct usage

```javascript
const pick = new CentrePointPicker({ onPick: (x, y) => setParams(x, y) }, deps);
parent.appendChild(pick.render());
```

## Methods

- `setActive(bool)`
- `setCentre(x,y)`
- `destroy()`

## Visual

Single `button` row `size: 'm'`; when `active`, button state uses inversion per tab active rule where applicable; label UPPERCASE.

## Modules

RADIALBLUR, TWIRL, SPHERIZE, CHROMATICAB, LENSBUBBLES, VIGNETTE, GRATING, WAVEDISTORTION, TILEBLEND (kaleidoscope centre).

## Dependencies

Tool host must expose canvas pick contract (Distort viewport). No `window.*` inside component — events via injected bus.

## Compliance

`component-patterns.md` §2: compose `button` only; no inline DOM outside BaseComponent internals.
