# MoireWaveInterference2D

| **Function** | `moireWaveInterference2D` |
| **Path** | `assets/js/shared/algorithms/patterns/moire-2d.js` |
| **Category** | `patterns.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/moire-wave-interference-2d.md` |

## Purpose

Two (or more) phase fields φ₁,φ₂; interference `cos(φ₁)+cos(φ₂)` or products → fringe mask.

## Formula

φᵢ = 2π(fᵢ·x + gᵢ·y) + δᵢ; output I = normalise(Σ wᵢ cos φᵢ).

## TERM→CODE

| TERM | CODE |
| --- | --- |
| W1,W2 | base waves |
| BEAT | phase difference |

## I/O

In: x,y, wave params per TYPE. Out: scalar interference + optional fringe distance.

## Complexity

O(W) waves per pixel.

## Modules

MOIRE.

## Dependencies

None.

## @wikipedia Moiré_pattern
## unified-algorithm

WAVES array in CORE_DATA; TYPE selects φ construction only.
