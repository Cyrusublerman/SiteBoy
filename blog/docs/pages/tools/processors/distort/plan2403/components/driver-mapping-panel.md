# DriverMappingPanel

**ComponentLibrary key:** `driver-mapping-panel`. **Class:** `DriverMappingPanel` extends `BaseComponent`.

## Purpose

Per-param mapping: FIXED vs IMAGE-DRIVEN vs FIELD-DRIVEN; METRIC; optional CURVE — for MOIRE, GRATING, TRUCHET, TILEBLEND, STIPPLE.

## Options

```javascript
{
  paramKey: 'PHASE',
  mode: 'FIXED', // 'FIXED' | 'IMAGE' | 'FIELD'
  sourceField: null,
  metric: 'LUMINANCE',
  min: 0,
  max: 1,
  curve: 'LINEAR',
  onChange: (patch) => {}
}
```

**Curve grammar (TBD):** candidate `curve` / `curveOptions` values include `LINEAR`, `EASE_IN`, `EASE_OUT`, `STEP`; final enum + semantics locked when driver bus spec is written.

## ToolBase

Not shorthand; `ComponentLibrary.create('driver-mapping-panel', opts, deps)` or `new DriverMappingPanel(opts, deps)`.

## Direct usage

```javascript
const d = new DriverMappingPanel({ paramKey: 'PHASE', onChange: (patch) => {} }, deps);
parent.appendChild(d.render());
```

## Visual

Collapsible section per param group; inner rows `height: 2F`; `gap: F/2`.

## Dependencies

**G1** must be fixed before user-facing QA of +D slot attachment to mapped params.

## Compliance

Uses `dropdown`, `numeric-input`, `collapsible-section` for row grouping; no RAF.

## Modules

MOIRE, GRATING, TRUCHET, TILEBLEND, STIPPLE.

## Methods

`destroy()` — remove all child components and bus listeners.
