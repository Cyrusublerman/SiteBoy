# Wave Interference — UI Layout

## Parameter Groups

| Group | Key(s) | Type | Default | Range / Options |
|---|---|---|---|---|
| R(r) Term 1 | `Ar1` | slider | 1 | −2 → 2, step 0.1 |
| R(r) Term 1 | `fr1` | slider | 20 | 0 → 50, step 0.5 |
| R(r) Term 1 | `pr1` | slider | 1 | −7 → 7, step 0.1 |
| R(r) Term 1 | `phi_r1` | slider | 0 | −6.28 → 6.28, step 0.01 |
| R(r) Term 1 | `Or1` | slider | 0 | −2 → 2, step 0.1 |
| R(r) Term 1 | `wave_r1` | radio | sin | sin / cos |
| R(r) Term 2 † | `Ar2` | slider | 0 | −2 → 2, step 0.1 |
| R(r) Term 2 † | `fr2` | slider | 0 | 0 → 50, step 0.5 |
| R(r) Term 2 † | `pr2` | slider | 1 | −7 → 7, step 0.1 |
| R(r) Term 2 † | `phi_r2` | slider | 0 | −6.28 → 6.28, step 0.01 |
| R(r) Modulation † | `Mr` | slider | 0 | −1 → 1, step 0.01 |
| R(r) Modulation † | `frm1` | slider | 0 | 0 → 50, step 0.5 |
| R(r) Modulation † | `frm2` | slider | 0 | 0 → 50, step 0.5 |
| X(x) Term 1 † | `Ax1` | slider | 0 | −2 → 2, step 0.1 |
| X(x) Term 1 † | `fx1` | slider | 0 | 0 → 50, step 0.5 |
| X(x) Term 1 † | `px1` | slider | 1 | −7 → 7, step 0.1 |
| X(x) Term 1 † | `phi_x1` | slider | 0 | −6.28 → 6.28, step 0.01 |
| X(x) Term 2 † | `Ax2` | slider | 0 | −2 → 2, step 0.1 |
| X(x) Term 2 † | `fx2` | slider | 0 | 0 → 50, step 0.5 |
| X(x) Term 2 † | `px2` | slider | 1 | −7 → 7, step 0.1 |
| X(x) Term 2 † | `phi_x2` | slider | 0 | −6.28 → 6.28, step 0.01 |
| Y(y) Term 1 † | `Ay1` | slider | 0 | −2 → 2, step 0.1 |
| Y(y) Term 1 † | `fy1` | slider | 0 | 0 → 50, step 0.5 |
| Y(y) Term 1 † | `py1` | slider | 1 | −7 → 7, step 0.1 |
| Y(y) Term 1 † | `phi_y1` | slider | 0 | −6.28 → 6.28, step 0.01 |
| Y(y) Term 2 † | `Ay2` | slider | 0 | −2 → 2, step 0.1 |
| Y(y) Term 2 † | `fy2` | slider | 0 | 0 → 50, step 0.5 |
| Y(y) Term 2 † | `py2` | slider | 1 | −7 → 7, step 0.1 |
| Y(y) Term 2 † | `phi_y2` | slider | 0 | −6.28 → 6.28, step 0.01 |
| View | `scale` | slider | 300 | 50 → 500, step 10 |
| View | `rotation` | slider | 0 | 0 → 360, step 1 |
| View | `blendMode` | radio | sum | sum / multiply |
| Canvas | `canvasWidth` | slider | 512 | 256 → 1024, step 64 |
| Canvas | `canvasHeight` | slider | 512 | 256 → 1024, step 64 |

† = `defaultCollapsed: true` in SCRIPT_CONFIG.

**Total parameters: 35** across 10 groups.

## Missing Modulation Parameters

The R(r) Modulation group declares `frm1`, `frm2`, and `Mr`, but omits `phi_rm1`, `phi_rm2`, `prm1`, `prm2` from the parameters array. These keys are referenced in `computeR` and `computePixels._R` — they are functional (default to 0) but have no UI controls. Equivalent omissions exist for X(x) and Y(y) modulation: `phi_xm1`, `phi_xm2`, `pxm1`, `pxm2`, `phi_ym1`, `phi_ym2`, `pym1`, `pym2` are absent from the parameters list.

Also missing from the parameters array: `wave_r2` (the wave_* radio for R Term 2), `Or2` (offset for R Term 2), `Ox1`, `Ox2` (offsets for X Terms 1 and 2), `Oy1`, `Oy2` (offsets for Y Terms 1 and 2), `wave_x1`, `wave_x2`, `wave_y1`, `wave_y2` (wave-type radios for all X and Y terms).

## Presets (LANDMARKS)

| Name | Active Components |
|---|---|
| 20 Rings (Default) | R Term 1: Ar1=1, fr1=20, pr1=1 |
| 1 Ring | R Term 1: Ar1=1, fr1=1, pr1=1 |
| 3 Rings | R Term 1: Ar1=1, fr1=3, pr1=1 |
| 5 Rings | R Term 1: Ar1=1, fr1=5, pr1=1 |
| 10 Rings | R Term 1: Ar1=1, fr1=10, pr1=1 |
| Inverted 5 Rings | R Term 1: Ar1=−1, fr1=5, pr1=1 |
| Offset Rings | R Term 1 + Or1=0.3 |
| Horizontal Lines | Y Term 1: Ay1=1, fy1=5, py1=1 |
| Vertical Lines | X Term 1: Ax1=1, fx1=5, px1=1 |
| Grid 5×5 | X Term 1 + Y Term 1 at matching freq |
| Moiré Cross | X: fx1=5, Y: fy1=5.5 (slight detuning) |
| Rings + Grid | R + weak X + weak Y |
| Complex Interference | R: 2 terms + weak X term |

Presets supply only the non-default keys. The host must merge them over the default param values. Presets are partial objects, not full parameter maps — same non-standard format as `solar-system.gen.js`.

## Animation

- `type: 'parametric'`
- `animatableParams`: `['phi_r1', 'phi_r2', 'phi_x1', 'phi_x2', 'phi_y1', 'phi_y2']`
- `defaultFps: 60`
- `canPrerender: true`

Phase parameters drive animation. Advancing phase shifts the interference pattern in the corresponding spatial dimension.

## Canvas

- Fixed: 512×512, 2d context, black background.
- `canvasWidth`/`canvasHeight` parameters are declared in the UI but the `draw` function reads `canvas.width` and `canvas.height` — not `params.canvasWidth` — so these sliders have no effect at runtime. This is a known inert-parameter issue (same as `solar-system.gen.js`).

## Export

`png: true, svg: true, gif: true, webm: true, sequence: true`
