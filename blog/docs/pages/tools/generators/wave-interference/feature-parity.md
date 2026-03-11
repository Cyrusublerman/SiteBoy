# Wave Interference — Feature Parity

Legacy source: `wave-interference.md` (mixed bundle), `wave-interference-audit.md` (audit only).

## Core Computation

| Feature | Spec | Live | Status |
|---|---|---|---|
| R(r) component with 2 terms | ✓ | ✓ | PASS |
| X(x) component with 2 terms | ✓ | ✓ | PASS |
| Y(y) component with 2 terms | ✓ | ✓ | PASS |
| R/X/Y modulation term | ✓ | ✓ (implementation differs — see Issues) | PARTIAL |
| safePow function | ✓ | ✓ | PASS |
| Sum blend mode | ✓ | ✓ | PASS |
| Multiply blend mode | ✓ | ✓ | PASS |
| Rotation of coordinate space | ✓ | ✓ | PASS |
| Scale (zoom) | ✓ | ✓ | PASS |
| Per-pixel ImageData rendering | ✓ (CPU fallback) | ✓ | PASS |

## Output Mode

| Feature | Spec | Live | Status |
|---|---|---|---|
| Binary black/white thresholding | ✓ (sign-based: value > 0 → white) | ✗ (continuous greyscale via min-max normalisation) | FAIL |
| Greyscale normalised output | Not spec'd | ✓ | DIVERGE |
| WebGL GPU rendering | ✓ (primary path) | ✗ (not implemented) | FAIL |
| CPU ImageData fallback | ✓ (secondary) | ✓ (only path) | PASS |

## UI Controls — Parameters

| Parameter | Spec | Live | Status |
|---|---|---|---|
| Ar1, fr1, pr1, phi_r1, Or1, wave_r1 | ✓ | ✓ | PASS |
| Ar2, fr2, pr2, phi_r2 | ✓ | ✓ | PASS |
| Or2, wave_r2 | ✓ | ✗ (no UI) | FAIL |
| Mr, frm1, frm2 | ✓ | ✓ | PASS |
| prm1, prm2, phi_rm1, phi_rm2 | ✓ | ✗ (functional, no UI) | FAIL |
| Ax1, fx1, px1, phi_x1 | ✓ | ✓ | PASS |
| Ox1, wave_x1 | ✓ | ✗ (no UI) | FAIL |
| Ax2, fx2, px2, phi_x2 | ✓ | ✓ | PASS |
| Ox2, wave_x2 | ✓ | ✗ (no UI) | FAIL |
| Mx, fxm1, fxm2 | ✓ | ✓ | PASS |
| pxm1, pxm2, phi_xm1, phi_xm2 | ✓ | ✗ (functional, no UI) | FAIL |
| Ay1, fy1, py1, phi_y1 | ✓ | ✓ | PASS |
| Oy1, wave_y1 | ✓ | ✗ (no UI) | FAIL |
| Ay2, fy2, py2, phi_y2 | ✓ | ✓ | PASS |
| Oy2, wave_y2 | ✓ | ✗ (no UI) | FAIL |
| My, fym1, fym2 | ✓ | ✓ | PASS |
| pym1, pym2, phi_ym1, phi_ym2 | ✓ | ✗ (functional, no UI) | FAIL |
| scale | ✓ | ✓ | PASS |
| rotation | ✓ | ✓ | PASS |
| blendMode | ✓ | ✓ | PASS |
| canvasWidth / canvasHeight | Not in spec | ✓ (inert) | DIVERGE |

## Modulation Formula

The live implementation's modulation formula differs from the legacy spec:

| Aspect | Spec | Live |
|---|---|---|
| Formula | `M · safePow(sin(frm1·r), prm1) · safePow(cos(frm2·r), prm2)` (product of two modulating waves) | `M · (safePow(sin(frm1·r), prm1) + safePow(sin(frm2·r), prm2))` (sum of two sin waves, no cos) |
| Interaction | Multiplicative cross-modulation | Additive two-term modulation |

## Animation

| Feature | Spec | Live | Status |
|---|---|---|---|
| Phase animation (advance phi params) | ✓ | ✓ (animatableParams declared) | PASS |
| Per-parameter animation speed/direction | ✓ | ✗ (not in SCRIPT_CONFIG) | FAIL |
| Checkpoint save/load | ✓ | ✗ | FAIL |
| Sequence animation (interpolate checkpoints) | ✓ | ✗ | FAIL |
| Loop toggle | ✓ | ✗ | FAIL |
| canPrerender | Not spec'd | ✓ | NEW |

## Export

| Feature | Spec | Live | Status |
|---|---|---|---|
| PNG export | ✓ | ✓ | PASS |
| SVG export | ✓ | ✓ | PASS |
| GIF / WebM / sequence | Not spec'd | ✓ | NEW |

## Other

| Feature | Spec | Live | Status |
|---|---|---|---|
| 13 preset landmarks | ✓ | ✓ (13 LANDMARKS) | PASS |
| Preset format (partial objects) | ✓ | ✓ | PASS |
| Worker-based computation | Not spec'd | ✓ (computePixels, compute.worker) | NEW |
| 50% resolution during interaction | Not spec'd | ✓ (compute.interactionScale) | NEW |
