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
| Binary black/white thresholding | ✓ (sign-based: value > 0 → white) | ✗ (intentional divergence — continuous greyscale) | FAIL |
| Greyscale normalised output | Not spec'd | ✓ | DIVERGE |
| WebGL GPU rendering | ✓ (primary path) | ✗ (not implemented; worker path provided instead) | FAIL |
| CPU ImageData fallback | ✓ (secondary) | ✓ (only path) | PASS |

## UI Controls — Parameters

| Parameter | Spec | Live | Status |
|---|---|---|---|
| Ar1, fr1, pr1, phiR1, Or1, waveR1 | ✓ | ✓ | PASS |
| Ar2, fr2, pr2, phiR2 | ✓ | ✓ | PASS |
| Or2, waveR2 | ✓ | ✓ | PASS — resolved; UI slots added |
| Mr, frm1, frm2 | ✓ | ✓ | PASS |
| prm1, prm2, phiRm1, phiRm2 | ✓ | ✓ | PASS — resolved; UI slots added |
| Ax1, fx1, px1, phiX1 | ✓ | ✓ | PASS |
| Ox1, waveX1 | ✓ | ✓ | PASS — resolved; UI slots added |
| Ax2, fx2, px2, phiX2 | ✓ | ✓ | PASS |
| Ox2, waveX2 | ✓ | ✓ | PASS — resolved; UI slots added |
| Mx, fxm1, fxm2 | ✓ | ✓ | PASS |
| pxm1, pxm2, phiXm1, phiXm2 | ✓ | ✓ | PASS — resolved; UI slots added |
| Ay1, fy1, py1, phiY1 | ✓ | ✓ | PASS |
| Oy1, waveY1 | ✓ | ✓ | PASS — resolved; UI slots added |
| Ay2, fy2, py2, phiY2 | ✓ | ✓ | PASS |
| Oy2, waveY2 | ✓ | ✓ | PASS — resolved; UI slots added |
| My, fym1, fym2 | ✓ | ✓ | PASS |
| pym1, pym2, phiYm1, phiYm2 | ✓ | ✓ | PASS — resolved; UI slots added |
| scale | ✓ | ✓ | PASS |
| rotation | ✓ | ✓ | PASS |
| blendMode | ✓ | ✓ | PASS |
| canvasWidth / canvasHeight | Not in spec | removed | N/A — parameters removed |

## Modulation Formula

The live implementation's modulation formula differs from the legacy spec:

| Aspect | Spec | Live |
|---|---|---|
| Formula | `M · safePow(sin(frm1·r), prm1) · safePow(cos(frm2·r), prm2)` (product; sin × cos) | `M · (safePow(sin(frm1·r), prm1) + safePow(sin(frm2·r), prm2))` (sum; sin + sin) |
| Interaction | Multiplicative cross-modulation | Additive two-term modulation |

## Animation

| Feature | Spec | Live | Status |
|---|---|---|---|
| Phase animation (advance phi params) | ✓ | ✓ (animatableParams declared) | PASS |
| Per-parameter animation speed/direction | ✓ | ✗ (not in SCRIPT_CONFIG) | FAIL |
| Checkpoint save/load | ✓ | ✗ (sequencer: true declared; host-dependent) | FAIL |
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
| 13 preset landmarks | ✓ | ✓ (13 LANDMARKS with full parameter maps) | PASS |
| Preset format (full parameter maps) | ✓ | PASS | resolved — `_DEFAULTS` spread ensures all presets are complete |
| Worker-based computation | Not spec'd | ✓ (computePixels, compute.worker) | NEW |
| 50% resolution during interaction | Not spec'd | ✓ (compute.interactionScale) | NEW |
