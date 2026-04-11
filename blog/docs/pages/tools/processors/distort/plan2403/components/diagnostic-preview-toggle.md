# DiagnosticPreviewToggle

**ComponentLibrary key:** `diagnostic-preview-toggle`. **Class:** `DiagnosticPreviewToggle` extends `BaseComponent`.

## Purpose

Multi-toggle for diagnostics: residual map, Voronoi overlay, histogram overlay, NN distance, etc. Items are **module-injected**; the default `items` array below is the **STIPPLE** superset — other modules pass a shorter list.

## Options

```javascript
{
  items: [
    { value: 'RESIDUAL', label: 'RESIDUAL MAP' },
    { value: 'VORONOI', label: 'VORONOI OVERLAY' },
    { value: 'NN_HIST', label: 'NN DISTANCE HISTOGRAM' },
    { value: 'POINT_COUNT', label: 'POINT COUNT' },
    { value: 'ITER_LOG', label: 'ITERATION LOG' }
  ],
  selectedValues: [],
  onChange: (values) => {}
}
```

## Implementation

`toggle-group` multicheck mode; layout `column`; gap `F/2`.

## Modules

STIPPLE, DELAUNAYMESH, PAINTSTROKE, MOIRE (Phase overlays per reviews).

## Methods

`destroy()`.
