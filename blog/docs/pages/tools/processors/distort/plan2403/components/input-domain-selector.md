# InputDomainSelector

**ComponentLibrary key:** `input-domain-selector`. **Class:** `InputDomainSelector` extends `BaseComponent`.

## Purpose

Single dropdown enumerating INPUT DOMAIN (LUMINANCE, R/G/B, SATURATION, CHROMA, GRADIENT MAGNITUDE, EXTERNAL FIELD, etc.) per module review tables.

## Options

```javascript
{
  label: 'INPUT DOMAIN',
  value: 'LUMINANCE',
  options: [{ value: 'LUMINANCE', label: 'LUMINANCE' }, ...],
  onChange: (v) => {},
  disabled: false
}
```

## Implementation

Thin wrapper: `ComponentLibrary.create('dropdown', opts, deps)` with standard row height `2F`.

## ToolBase

Not shorthand; `ComponentLibrary.create('input-domain-selector', opts, deps)` or `new InputDomainSelector(opts, deps)`.

## Direct usage

```javascript
const dom = new InputDomainSelector({ value: 'LUMINANCE', options: [...], onChange: (v) => {} }, deps);
parent.appendChild(dom.render());
```

## Visual

Single dropdown row `height: 2F`; label `INPUT DOMAIN` UPPERCASE.

## Modules

DILATEERODE, OPENCLOSE, OTSUTHRESHOLD, CONTOUR, HALFTONEPATTERN (RESPONSE SOURCE overlap — do not alias keys).

## Methods

`destroy()` forwards to Dropdown instance.
