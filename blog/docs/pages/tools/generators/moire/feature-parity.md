# Moiré — Feature Parity

Legacy source: `moire-generator-spec.md` (mixed bundle), `moire-generator-audit.md` (audit only).

## Core Computation

| Feature | Spec | Live | Status |
|---|---|---|---|
| Radial grating (sin rings from centre) | ✓ | ✓ | PASS |
| Angular grating (sin sectors) | ✓ | ✓ | PASS |
| Multi-centre field | ✓ | ✓ | PASS |
| Grating combination: SUM, PRODUCT, MIN, MAX | ✓ | ✓ | PASS |
| Threshold to binary output | ✓ | ✓ | PASS |
| Foreground / background colour | ✓ | ✓ | PASS |
| Invert toggle | ✓ | ✓ | PASS |
| Phase animation (frame-driven) | ✓ | ✓ | PASS |
| Phase speed control | ✓ | ✓ | PASS |

## Parameters

| Parameter | Spec Key | Live Key | Status |
|---|---|---|---|
| Grating count | `gratingCount` | `gratingCount` | PASS |
| Base wavelength | `baseWavelength` | `wavelength` | PASS (renamed) |
| Angular frequency | `angularFrequency` | `angularFreq` | PASS (renamed) |
| Angular mod amplitude | `angularModAmplitude` | absent | FAIL |
| Phase offset | `phaseOffset` | `phaseOffset` | PASS |
| Grating combination | `gratingCombination` | `combineMode` | PASS (renamed) |
| Centre offset | `centreOffset` | `centreOffset` | PASS |
| Centre weight A | `centreWeightA` | `weightA` | PASS (renamed) |
| Centre weight B | `centreWeightB` | `weightB` | PASS (renamed) |
| Mask type | `maskType` | `maskType` | PASS |
| Mask size | `maskSize` | `maskSize` | PASS |
| Mask rotation | `maskRotation` | absent | FAIL |
| Animate toggle | `animate` | absent | FAIL (implicit via frame) |
| Phase speed | `phaseSpeed` | `phaseSpeed` | PASS |
| Line threshold | `lineThreshold` | `threshold` | PASS (renamed) |
| Foreground color | `foreground` | `fgColor` | PASS (renamed) |
| Background color | `background` | `bgColor` | PASS (renamed) |
| Invert | `invert` | `invert` | PASS |
| Centre oscillation | not in spec | `centreOsc` | NEW |

## Mask Shapes

| Shape | Spec | Live | Status |
|---|---|---|---|
| None | ✓ | ✓ | PASS |
| Circle | ✓ | ✓ | PASS |
| Triangle | ✓ | ✓ (buggy SDF — see Issues) | PARTIAL |
| Polygon | ✓ | ✗ (replaced by 'square') | FAIL |
| Square | not in spec | ✓ | NEW |

## WebGL Rendering

| Feature | Spec | Live | Status |
|---|---|---|---|
| WebGL fragment shader (primary) | ✓ | ✗ | FAIL |
| CPU ImageData (fallback) | ✓ | ✓ (only path) | PASS |

## Export

| Feature | Spec | Live | Status |
|---|---|---|---|
| Export PNG | ✓ | ✓ | PASS |
| Export SVG | ✓ | ✗ | FAIL |
| Export GIF | ✓ | ✓ | PASS |
| WebM / sequence | not in spec | ✓ | NEW |

## Preset System

| Feature | Spec | Live | Status |
|---|---|---|---|
| Named presets | not explicitly specified | ✓ (3 presets: Classic, Angular, Hypnotic) | NEW |
| Preset format (full param maps) | — | ✓ (nested `{name, values}`) | PASS |
