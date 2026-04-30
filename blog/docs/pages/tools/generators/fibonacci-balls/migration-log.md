# Fibonacci Balls — Migration Log

## Pack Updated

Date: 2026-04-25  
Source analysed: `assets/js/tools/generators/scripts/physics/fibonacci-balls.gen.js`

## Current State

Implemented and live.

Resolved since the original migration:
- preset format converted to `{ name, values }`
- export metadata added
- velocity growth bounded with speed caps
- dead `_fibSeq` config property removed

## 2026-04-29 additions (FIB-01, FIB-02, FIB-03)

- **FIB-01 Count cap lifted:** `maxFibIndex` raised from 12 to 16 (slider max). Performance warning (`console.warn`) issued when `maxFibIndex > 14` (O(N²) collision cost).
- **FIB-02 Collision audio:** `AudioOutput` (sine wave) initialised in `p5Setup`; `Sound` param group (`soundEnabled`, `soundGain`, `soundDuration`, `soundBaseFreq`). `_applyCollisionColor` calls `_audioOutput.trigger()` on outer-circle collisions; pitch inversely proportional to max colliding radius scaled by `soundBaseFreq`.
- **FIB-03 Audio export:** `getAudioEmitter()` method on `SCRIPT_CONFIG`; `generative-tool-host.js` wires return value into `animationExporter.setAudioEmitter()` post-`p5Setup`. WebM export enabled. `destroy()` cleans up `_audioOutput`.

## Residuals

- No worker/GPU acceleration for dense collision workloads.
- P5 canvas size can vary with Fibonacci index while static config dimensions remain a host-level baseline.
