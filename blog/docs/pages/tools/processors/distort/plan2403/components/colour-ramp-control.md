# ColourRampControl

**ComponentLibrary key:** `colour-ramp-control` (proposed). **Class:** `ColourRampControl` extends `BaseComponent`. **Compliance:** `component-development.md`, `design-law.md` (UI `var(--c-*)`), `border-system.md`, `text-treatment.md` (param labels UPPERCASE `F×0.75`), `COMPONENT-REFERENCE.md` structure.

## Purpose

Bundles MIN COLOUR, MAX COLOUR, RAMP SOURCE, RAMP SPACE, and CLAMP toggle for scalar→colour mapping after detection stages.

## Options

```javascript
{
  minColour: '#000000',     // string hex VGA-preferred
  maxColour: '#ffffff',
  rampSource: 'NORMALISED_MAGNITUDE', // enum per module contract
  rampSpace: 'RGB',         // 'RGB' | 'HSV'
  // When true: values below detection threshold map fully to minColour; when false: retain residual mapped values below threshold (see EDGE module threshold param).
  clamp: true,
  labels: { min: 'MIN COLOUR', max: 'MAX COLOUR' },
  // Runtime fill; typical EDGE values: RAW MAGNITUDE | NORMALISED MAGNITUDE | POST-THRESHOLD VALUE (module may subset).
  rampSourceOptions: [],    // { value, label }[]
  onChange: (patch) => {}  // patch: partial state
}
```

## ToolBase

Not a ToolBase shorthand row; built in NodePanel via `ComponentLibrary.create('colour-ramp-control', opts, deps)`.

## Methods

- `setState(patch)` — merge props and re-render owned children.
- `getState()` — returns serialisable param object for node IO.
- `destroy()` — tear down child `ColorInput`/`Dropdown`/`ToggleGroup` instances.

## Direct usage

```javascript
const ramp = new ColourRampControl({ ... }, deps);
parent.appendChild(ramp.render());
```

## Visual (NodePanel)

Vertical stack `gap: F/2`; each row `height: 2F`; collapsible section optional header `MAPPING`; borders per `border-system.md` §3.

## Modules

SOBEL, CANNY, LAPLACIAN, DOG, CELLULARAUTOMATA, REACTIONDIFFUSION, PERLINOVERLAY, STIPPLE, WAVEDISTORTION (output mapping per wavedistortion review).

## Dependencies

Primitives: `color-input`, `dropdown`, `toggle-group`. **G1** (+D driver panel): must be functional before any driver QA on ramp-adjacent numerics; G1 blocks nested driveable rows until fixed.

## Checklist (`algorithms.md` N/A)

`component-development.md`: BaseComponent; F-only layout; destroy; export in `component-library.js`; doc in `blog/docs/components/input/ColourRampControl.md` post-implementation.
