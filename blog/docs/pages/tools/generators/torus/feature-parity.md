# Torus — Feature Parity


The live script is a full port with enhancements. Audit classification: "Enhanced — implementation has more controls than original reference."

## Core Features

| Feature | Legacy spec | Live | Status |
|---|---|---|---|
| Torus 3D parametric surface | ✓ | ✓ | PASS |
| Cross-section ellipses (36) with 25% alpha | ✓ | ✓ (36 ellipses, 0.25 alpha) | PASS |
| Toroidal surface spirals (9 per direction) | ✓ | ✓ (configurable) | PASS |
| 4 spiral winds | ✓ | ✓ (configurable) | PASS |
| 3D → 2D projection | ✓ | ✓ | PASS |
| Frame-based rotation | ✓ | ✓ | PASS |
| 3600-frame loop | ✓ | ✓ (configurable) | PASS |
| Adjustable spiral count | ✓ (recommended) | ✓ | PASS |
| Adjustable torus size | ✓ (recommended) | ✓ | PASS |
| Adjustable view angles | ✓ (recommended) | ✓ | PASS |
| Adjustable cycle speed | ✓ (recommended) | ✓ | PASS |
| Play/pause | ✓ (recommended) | ✓ (host transport controls) | PASS |
| Separate major/minor radius sliders | ✓ (recommended) | ✗ (locked equal, R=r by design) | DROP — separate sliders not implemented; architectural constraint documented |
| Wind count slider | ✓ (recommended, hardcoded) | ✓ | PASS |
| PNG export | ✓ | ✓ | PASS |
| GIF/WebM export | not in spec | ✓ | NEW |

## Parameters vs Legacy Spec

| Parameter | Spec | Live | Status |
|---|---|---|---|
| majorRadius (50–300) | ✓ | ✗ (subsumed into torusSize) | PARTIAL |
| minorRadius (50–300) | ✓ | ✗ (same as majorRadius) | PARTIAL |
| viewAngleX (radians) | ✓ | ✓ (as degrees `viewX`) | PASS |
| viewAngleY (radians) | ✓ | ✓ (as degrees `viewY`) | PASS |
| numSpirals | ✓ | ✓ | PASS |
| spiralWinds | ✓ | ✓ | PASS |
| cycleFrames | ✓ | ✓ | PASS |
| showTorusMesh | not in spec | ✓ | NEW |
