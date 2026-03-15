# Circles — Feature Parity

Legacy source: `circles.md` (mixed bundle), `circles-audit.md` (audit only).

Audit classification: "Complete — all features from reference implemented."

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
| Play/pause | ✓ (recommended) | ✗ | FAIL |
| Outer radius slider | ✓ (recommended) | ✗ (responsive sizing only) | FAIL |
| Line width slider | ✓ (recommended) | ✗ (hardcoded 1) | FAIL |
| Colour customisation | ✓ (recommended) | ✗ (hardcoded) | FAIL |
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
| rgba() in gradient mode | FAIL | `rgba(255,255,255,${alpha})` still used in gradient draw path |
| loopFrames static vs cycleFrames dynamic | OPEN | documented; loopFrames not updated when cycleFrames changes |
