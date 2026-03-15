# Circles — Feature Parity

## Core Features

| Feature | Legacy spec | Live | Status |
|---|---|---|---|
| N nested circles with decreasing radii | ✓ | ✓ | PASS |
| Chain of orbits (parent-child hierarchy) | ✓ | ✓ | PASS |
| Lines mode (outline + radius line) | ✓ | ✓ | PASS |
| B/W mode (alternating fill) | ✓ | ✓ | PASS |
| Gradient mode (alpha depth) | ✓ | ✓ | PASS |
| 3600-frame loop | ✓ | ✓ (configurable) | PASS |
| Circle count slider | ✓ (recommended) | ✓ | PASS |
| Cycle frames slider | ✓ (recommended) | ✓ | PASS |
| Play/pause | ✓ (recommended) | ✓ (host transport controls) | PASS |
| Outer radius slider | ✓ (recommended) | ✗ | DROP — canvas-relative sizing is the design; absolute slider out of scope |
| Line width slider | ✓ (recommended) | ✗ | DROP — cosmetic; not in core feature set |
| Colour customisation | ✓ (recommended) | ✗ | DROP — canvas output colours; can be revisited as enhancement |
| Frame export / pre-render | ✓ | ✓ (sequence export) | PASS |

## Parameters

| Parameter | Spec | Live | Status |
|---|---|---|---|
| displayMode (radio: Lines/B/W/Gradient) | ✓ | ✓ | PASS |
| circleCount (10–200) | ✓ | ✓ | PASS |
| cycleFrames (600–7200) | ✓ | ✓ | PASS |
| largestRadius (100–400) | ✓ | ✗ | FAIL |
| lineWidth | recommended | ✗ | FAIL |
| strokeColor | recommended | ✗ | FAIL |

## Standards Compliance

| Check | Status | Notes |
|---|---|---|
| Module-level mutable state | PASS | resolved — closure via IIFE |
| animatableParams declared | PASS | resolved — `animatableParams: []` |
| console.log removed | PASS | resolved |
| Canvas resize rebuild | PASS | resolved — `_prevW`/`_prevH` tracking |
| displayMode undefined guard | PASS | resolved — `(params.displayMode \|\| 'lines').toLowerCase()` |
| rgba() in gradient mode | PASS | Canvas output is exempt from CSS variable constraint per design-law §6.2 |
| loopFrames static vs cycleFrames dynamic | OPEN | documented; loopFrames not updated when cycleFrames changes |
