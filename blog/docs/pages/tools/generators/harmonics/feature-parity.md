# Harmonics — Feature Parity

## Core Features

| Feature | Spec (lissajous.md harmonics section) | Live | Status |
|---|---|---|---|
| 13 musical intervals (unison → octave) | ✓ | ✓ | PASS |
| 4 view modes | ✓ | ✓ (lateralClosed, counterCurrent, lateralOpen, concurrent) | PASS |
| Time warp at harmonic ratios | ✓ | ✓ (double-smoothstep) | PASS |
| 90 s pass × 8 passes = 720 s cycle | ✓ | ✓ (configurable) | PASS |
| Motion blur (partial clear) | ✓ | ✓ | PASS |
| Ratio display during animation | ✓ | ✗ | DROP — host status bar not available in gen.js format; on-canvas label outside scope |
| Pre-render support for export | ✓ (onRenderFrame) | ✓ (canPrerender: true) | PASS |

## Parameters

| Parameter | Spec | Live | Status |
|---|---|---|---|
| motionBlur | ✓ | ✓ | PASS |
| passDuration | not in original spec | ✓ | NEW |
| points | not in spec | ✓ | NEW |
| pointSize | not in spec | ✓ | NEW |
| Speed control | recommended (audit) | ✓ (host Speed slider) | PASS |
| Play/pause | recommended (audit) | ✓ (host transport controls) | PASS |

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
| Frame-based timing | ✓ | PASS | resolved — `elapsed = frame / fps`; wall-clock timing removed |
