# Clockwise — Feature Parity

## Feature Inventory

No legacy docs exist for this generator. The live source is the only available reference. Feature parity cannot be assessed against external inputs. The table below records features confirmed by code review of the live source.

| Feature | Source | Status in live source | Notes |
| --- | --- | --- | --- |
| N orbiting squares (N=2–12) | live source | Confirmed | `numSquares` parameter, range [2,12] |
| Circular orbit path | live source | Confirmed | Polar orbit: `cx = 540 + orbitRadius × cos(curAngle)` |
| Per-square self-rotation (spin) | live source | Confirmed | `globalSpinAngle` accumulates `spinSpeed` per frame |
| Orbit direction control (CW/CCW) | live source | Confirmed | `orbitDir` dropdown, multiplied into orbit advance |
| Two independent physics fields per square | live source | Confirmed | `grid1` (pulse/brightness) and `grid2` (hue), independently diffusing |
| Discrete diffusion equation (neighbourhood average + difference) | live source | Confirmed | `_getAvg` and `_sampleDiff` used in `_updatePhysics` |
| Per-frame pulse decay (waveDecay) | live source | Confirmed | Applied to grid1 only: `× waveDecay` |
| Hue identity bias (per-square anchor) | live source | Confirmed | `bias = i / numSquares`; `identityForce` pulls grid2 toward bias |
| Toroidal/clamped neighbourhood toggle | live source | Confirmed | `wrapAround` dropdown ('on'/'off') |
| Field swap on pixel overlap | live source | Confirmed | Collision detection via flat pixel map; swaps grid1 and grid2 values |
| Swap cooldown gate | live source | Confirmed | `swapCooldown` parameter (frames), per-cell `lastSwap` tracking |
| Resolution derived from geometry | live source | Confirmed | `resolution = clamp(round(sideLength/3), 48, 180)` — not user-facing |
| 3 presets (Classic, Turbulent, Calm) | live source | Confirmed | All keys present in each preset |
| Animation config (infinite, 30fps) | live source | Confirmed | `animation: { type: 'infinite', defaultFps: 30 }` |

---

## Host Feature Audit

| Host feature | Used? | Notes |
| --- | --- | --- |
| Presets | Yes — 3 presets | Classic, Turbulent, Calm; all 11 parameter keys present in each preset |
| INFO tab | Yes | `description` field present: "Orbiting pixel squares with internal cellular wave physics..." |
| Animation config | Yes | `type: 'infinite'`, `defaultFps: 30` |
| animatableParams | No | Not declared; the host cannot identify which parameters are safe to animate in a sequence export |
| Export config | Default | No explicit `export` field; host provides default PNG export |

---

## Parity Holes

1. **No `animatableParams` declared.** The animation config omits `animatableParams`, so the host cannot produce deterministic parameter-animation sequence exports for this generator.

2. **`resolution` not user-facing.** The grid resolution per square is a critical determinant of both visual quality and performance but is derived automatically and cannot be set by the user. A `resolution` cap parameter would allow trading quality for frame rate.

3. **Fit/fill/actual viewport and zoom issues (host-level).** Reported problems with the fit/fill/actual viewport mode and zoom functionality are not caused by this generator script. The script outputs to a fixed 1080×1080 canvas with no viewport or scaling logic. These defects lie in the generative tool host's canvas management layer.

4. **No `animatableParams` for sequence export.** As noted above; the generator uses `Math.random()` nowhere, so randomness is not the issue — rather, the host lacks guidance on which params produce smooth animation when swept.
