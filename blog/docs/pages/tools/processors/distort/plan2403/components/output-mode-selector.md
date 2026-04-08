# OutputModeSelector

**ComponentLibrary key:** `output-mode-selector`. **Class:** `OutputModeSelector` extends `BaseComponent`.

## Purpose

Selects IMAGE / MASK / FIELD / HYBRID (and module-specific enums) for modules exporting to driver bus.

## Options

```javascript
{
  label: 'OUTPUT MODE',
  value: 'IMAGE',
  options: [], // per-module contract
  onChange: (v) => {},
  disabled: false
}
```

## Modules

DILATEERODE, OPENCLOSE, OTSUTHRESHOLD, SCANLINES, VIGNETTE, FILMGRAIN, SDFSHAPE, CONTOUR, INTERFERENCE, DELAUNAYMESH, STIPPLE.

## G14

Hide row entirely when module does not support multi-output — not disabled-hidden.

## ToolBase

Not shorthand; `ComponentLibrary.create('output-mode-selector', opts, deps)` or `new OutputModeSelector(opts, deps)`.

## Direct usage

```javascript
const om = new OutputModeSelector({ value: 'IMAGE', options: [...], onChange: (v) => {} }, deps);
parent.appendChild(om.render());
```

## Visual

Single dropdown row `height: 2F`; label `OUTPUT MODE` UPPERCASE.

## Methods

`setValue(v)`, `destroy()`.
