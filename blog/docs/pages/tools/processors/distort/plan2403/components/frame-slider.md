# FrameSlider

**ComponentLibrary key:** `frame-slider`. **Class:** `FrameSlider` extends `BaseComponent`.

## Purpose

Standard FRAME (or TIME) param for iteration/animation modules (G9).

## Options

```javascript
{
  label: 'FRAME',
  value: 0,
  min: 0,
  max: 10**6,
  step: 1,
  unit: 'frames',
  key: 'frame',
  onChange: (v) => {},
  onInput: (v) => {}
}
```

## ToolBase

Not shorthand; `ComponentLibrary.create('frame-slider', opts, deps)` or `new FrameSlider(opts, deps)`.

## Direct usage

```javascript
const fs = new FrameSlider({ value: 0, onChange: (v) => {} }, deps);
parent.appendChild(fs.render());
```

## Implementation

Delegate to `ComponentLibrary.create('numeric-input', { display: 'both', ... }, deps)` internally — single wrapper for consistent labelling.

## Methods

- `setValue(n)`
- `getValue()`
- `destroy()` — forward to child NumericInput.destroy()

## Modules

SERPENTINE, STATICHALFTONE, MODULEFLOWLINES, LUMFLOW, FLOWFIELD, ADVECTION, TILEBLEND, CELLULARAUTOMATA, REACTIONDIFFUSION, WAVEDISTORTION, INTERFERENCE, FILMGRAIN, SCANLINES.

## Visual

Single row `height: 2F`; label UPPERCASE `FRAME`; NumericInput slider+field per `border-system.md` §3.

## Dependencies

G5 (direct numeric + double-click default) must apply to underlying NumericInput.
