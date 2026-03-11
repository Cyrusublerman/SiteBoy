# Harmonics — Feature Parity

Legacy source: `lissajous.md` (mixed bundle, harmonics section), `harmonics-audit.md` (audit only).

Audit classification: "Complete port of harmonics variant from reference."

## Core Features

| Feature | Spec (lissajous.md harmonics section) | Live | Status |
|---|---|---|---|
| 13 musical intervals (unison → octave) | ✓ | ✓ | PASS |
| 4 view modes | ✓ | ✓ (lateralClosed, counterCurrent, lateralOpen, concurrent) | PASS |
| Time warp at harmonic ratios | ✓ | ✓ (double-smoothstep) | PASS |
| 90 s pass × 8 passes = 720 s cycle | ✓ | ✓ (configurable) | PASS |
| Motion blur (partial clear) | ✓ | ✓ | PASS |
| Ratio display during animation | ✓ | ✗ (no ratio label in live script) | FAIL |
| Pre-render support for export | ✓ (onRenderFrame) | ✓ (canPrerender: true) | PASS |

## Parameters

| Parameter | Spec | Live | Status |
|---|---|---|---|
| motionBlur | ✓ | ✓ | PASS |
| passDuration | not in original spec | ✓ | NEW |
| points | not in spec | ✓ | NEW |
| pointSize | not in spec | ✓ | NEW |
| Speed control | recommended (audit) | ✗ | FAIL |
| Play/pause | recommended (audit) | ✗ | FAIL |

## Rendering

| Feature | Spec | Live | Status |
|---|---|---|---|
| Particle scatter rendering | ✓ | ✓ | PASS |
| View cross-fade interpolation | ✓ | ✓ | PASS |
| Interval ratio interpolation | ✓ | ✓ | PASS |

## Animation Format

| Feature | Spec | Live | Status |
|---|---|---|---|
| `type: 'loop'` | ✓ | ✓ | PASS |
| `canPrerender: true` | — | ✓ | PASS |
| `animatableParams: []` | — | ✓ | PASS |
| Wall-clock timing | — | ✓ (see Issues) | DIVERGE |
