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
| Field swap on pixel overlap | live source | Confirmed | Collision detection via sparse Map; swaps grid1 and grid2 values |
| Swap cooldown gate | live source | Confirmed | `swapCooldown` parameter (frames), per-cell `lastSwap` tracking |
| Resolution derived from geometry | live source | Confirmed | `resolution = clamp(round(sideLength/3), 48, 180)` — not user-facing |
| 3 presets (Classic, Turbulent, Calm) | live source | Confirmed | All keys present in each preset |
| Animation config (infinite, 30fps) | live source | Confirmed | `animation: { type: 'infinite', defaultFps: 30, animatableParams: [...] }` |
| `animatableParams` declared | live source | PASS | 6 params: `orbitSpeed`, `spinSpeed`, `growthFactor`, `damping`, `waveDecay`, `identityForce` |
| Explicit export config | live source | PASS | `export: { png: true, gif: false, webm: false }` |
| Compute block (Tier 2) | live source | Confirmed | `compute: { cost: 'particle', interactionScale: 0.5, idleDelay: 200 }` |
| `infoSections` populated | live source | Confirmed | 7 sections: DESCRIPTION, ALGORITHM, PARAMETERS, PRESETS, PERFORMANCE, ANIMATION, KNOWN LIMITATIONS, REFERENCES |

---

## Host Feature Audit

| Host feature | Used? | Notes |
| --- | --- | --- |
| Presets | Yes — 3 presets | Classic, Turbulent, Calm; all 11 parameter keys present in each preset |
| INFO tab | Yes | `infoSections` fully populated |
| Animation config | Yes | `type: 'infinite'`, `defaultFps: 30`, `animatableParams` declared |
| animatableParams | Yes | 6 params declared; host can produce deterministic parameter-animation sweeps |
| Export config | Yes — explicit | `png: true, gif: false, webm: false` |

---

## Parity Holes

1. **`resolution` not user-facing.** The grid resolution per square is a critical determinant of both visual quality and performance but is derived automatically and cannot be set by the user. A `resolution` cap parameter would allow trading quality for frame rate.

2. **Fit/fill/actual viewport and zoom issues (host-level).** Reported problems with the fit/fill/actual viewport mode and zoom functionality are not caused by this generator script. The script outputs to a fixed 1080×1080 canvas with no viewport or scaling logic. These defects lie in the generative tool host's canvas management layer.

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | behaviour | orbit/spin square kinematics | reference/generators/clockwise/source/clockwise.gen.js:84-126,213-254 | compound rotation system |
| R-02 | behaviour | dual-field diffusion physics and identity force | reference/generators/clockwise/source/clockwise.gen.js:128-181 | grid1/grid2 coupled update |
| R-03 | behaviour | overlap swap interaction with cooldown | reference/generators/clockwise/source/clockwise.gen.js:230-250 | per-cell swap gate |
| R-04 | param | system/motion/physics controls | reference/generators/clockwise/source/clockwise.gen.js:22-49 | 11 controls |
| R-05 | interaction | presets + p5 infinite animation loop | reference/generators/clockwise/source/clockwise.gen.js:51-70 | baseline runtime contract |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | method | _needsRebuild | 78-82 | R-04 |
| F-02 | method | _buildSquares | 84-126 | R-01, R-02 |
| F-03 | method | _getAvg | 128-140 | R-02 |
| F-04 | method | _sampleDiff | 142-157 | R-02 |
| F-05 | method | _updatePhysics | 159-181 | R-02 |
| F-06 | method | p5Setup | 183-193 | R-05 |
| F-07 | method | p5Draw | 195-278 | R-01, R-03, R-05 |
| F-08 | top-level-stmt | SCRIPT_CONFIG object | 13-279 | R-04, R-05 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | orbit/spin square kinematics | assets/js/tools/generators/scripts/other/clockwise.gen.js:137-177,265-305 | equivalent kinematics |
| L-02 | behaviour | dual-field diffusion physics and identity force | assets/js/tools/generators/scripts/other/clockwise.gen.js:179-233 | pulse clamp added |
| L-03 | behaviour | overlap swap interaction with cooldown | assets/js/tools/generators/scripts/other/clockwise.gen.js:281-301 | same swap logic |
| L-04 | param | system/motion/physics controls | assets/js/tools/generators/scripts/other/clockwise.gen.js:55-82 | same control surface |
| L-05 | interaction | presets + p5 infinite animation loop | assets/js/tools/generators/scripts/other/clockwise.gen.js:84-123,247-329 | plus info/export/compute metadata |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | kinematics | L-01 | present | clockwise.gen.js:137-177,265-305 | none | none | — |
| R-02 | field physics | L-02 | present | clockwise.gen.js:179-233 | live adds physics clamp safety | none | — |
| R-03 | overlap swap | L-03 | present | clockwise.gen.js:281-301 | none | none | — |
| R-04 | control surface | L-04 | present | clockwise.gen.js:55-82 | none | none | — |
| R-05 | runtime contract | L-05 | partial | clockwise.gen.js:84-123 | preset object shape changed (flat -> `values`), metadata expanded | none | P2 |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Kinematics/diffusion/collision helpers remain inlined in generator module

**Check 2 — Foundation usage**
- AnimationFoundation: host-driven p5 draw lifecycle
- GPUFoundation: not used

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module
- MathematicalFoundation: geometry/diffusion maths inlined

**Check 4 — State scope smells**
- runtime mutable state stored on SCRIPT_CONFIG (`_squares`, `_collisionMap`, angle accumulators)

**Issues logged:** ARCH-029

### Performance Tier Audit

**Primary workload:** p5 per-cell geometry/physics/render loops  
**Tier status:** Tier 2 adaptive interaction scale enabled via `compute.interactionScale`

**Issues logged:** none

### v4 issues logged

- ARCH-029, DOC-050, DOC-051

### v4 questions queued

- none (clockwise turn)
