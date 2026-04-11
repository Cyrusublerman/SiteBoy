# NoiseSourceControl

**ComponentLibrary key:** `noise-source-control`. **Class:** `NoiseSourceControl` extends `BaseComponent`.

## Purpose

Composite UI for NOISE TYPE, SEED, SCALE, OCTAVES (where applicable) shared by noise-consuming modules (G11).

## Options

```javascript
{
  noiseType: 'PERLIN',
  noiseTypeOptions: [], // dropdown options
  seed: 0,
  scale: 1,
  octaves: 4,
  showOctaves: true,
  onChange: (patch) => {}
}
```

## Structure

Vertical stack: `dropdown` (NOISE TYPE), `numeric-input` (SEED integer), `numeric-input` (SCALE), optional `numeric-input` (OCTAVES).

## ToolBase

Not shorthand; `ComponentLibrary.create('noise-source-control', opts, deps)` or `new NoiseSourceControl(opts, deps)`.

## Direct usage

```javascript
const ns = new NoiseSourceControl({ onChange: (patch) => applyNodePatch(patch) }, deps);
parent.appendChild(ns.render());
```

## Visual

Vertical stack `gap: F/2`; each control row `height: 2F`; labels UPPERCASE.

## Modules

PERLINOVERLAY, DOMAINWARP, FILMGRAIN, FLOWFIELD, LENSBUBBLES.

## Dependencies

Algorithm specs in `plan2403/algorithms/*-noise-*.md`.

## Methods

`setState(patch)`, `getState()`, `destroy()`.
