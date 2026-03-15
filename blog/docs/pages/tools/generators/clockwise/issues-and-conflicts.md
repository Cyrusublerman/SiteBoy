# Clockwise — Issues and Conflicts

## Standards Compliance Check (`build-page.md` §8)

**p5 generator rules:**

- `p.noLoop()` called in `p5Setup`: **PASS** — `p.noLoop()` present in `p5Setup`
- `p.createCanvas()` not called: **PASS** — absent from source; host creates and owns the canvas
- `p.loop()` not called internally: **PASS** — absent from source
- Animation driven by host, not internal: **PASS** — no `requestAnimationFrame`, `setInterval`, or `setTimeout` in source; frame delivery is entirely host-managed

**All generator rules:**

- No `document.*` / `window.*` / `.innerHTML` / `.createElement`: **PASS** — none present in source
- No `requestAnimationFrame` / `setInterval` / `setTimeout` for animation: **PASS** — none present
- Canvas output uses VGA palette or algorithmic colour with justification: **CONDITIONAL PASS** — the generator uses `p.fill(H, 90, B)` in HSB mode where `H = hue × 360` derives from the physics grid2 field value and `B = map(pulse, 0, 1, 100, 50)` derives from grid1. Both are direct functions of physical quantities in the simulation model (hue evolves through reaction-diffusion dynamics; brightness maps from wave pulse amplitude). This satisfies the algorithmic colour space exemption (`build-page.md` §3.2). Saturation is fixed at 90 (not VGA-palette).
- No inline algorithm that exists in `assets/js/shared/algorithms/`: **PASS** — the two-field cellular diffusion with identity restoration is specific to this generator; no equivalent exists in the shared algorithms library
- State stored on `this`, not undocumented module-level variables: **PASS** — all state (`_squares`, `_collisionMap`, `_globalOrbitAngle`, `_globalSpinAngle`, `_lastParams`) is on `this` (SCRIPT_CONFIG object)
- `id` is kebab-case and matches filename: **PASS** — `id: 'clockwise'`, file `clockwise.gen.js`
- `title` is Title Case: **PASS** — `title: 'Clockwise'`
- `category` is one of the permitted values: **PASS** — `category: 'other'`
- All parameter keys are camelCase: **PASS** — `numSquares`, `orbitRadius`, `orbitSpeed`, `spinSpeed`, `orbitDir`, `growthFactor`, `damping`, `waveDecay`, `identityForce`, `swapCooldown`, `wrapAround`
- All preset objects include `name` and all parameter keys: **PASS** — each preset includes all 11 keys
- `destroy()` or equivalent cleanup: **NOTE** — no `destroy()` method defined. The generator has no timers, audio contexts, or event listeners that require cleanup. The p5 lifecycle is managed by the host. No cleanup is needed at the generator level; this is not a defect.
- `frame` argument used, no internal frame counter: **PASS** — `frame` argument is used as the timestamp reference in swap cooldown: `const now = frame`

---

## Bug and Risk Detection

**[RESOLVED] [WARN] [BUG] Render reads from pre-physics buffer (one-frame rendering lag)**
Location: `p5Draw` — render loop after call to `_updatePhysics(sq, params)`
Evidence: `_updatePhysics` computes new values into `sq.next1` and `sq.next2`, then swaps buffers: `[sq.grid1, sq.next1] = [sq.next1, sq.grid1]`. After the swap, `sq.grid1` holds the newly computed values and `sq.next1` holds the prior-frame values. The render immediately following reads `const pulse = Math.max(0, Math.min(1, sq.next1[x][y]))` and `const hue = sq.next2[x][y]` — both from `next1`/`next2`, which are the pre-physics (old) values.
Impact: The displayed frame shows physics values from the previous frame, not the current frame.

*Fix (v1.1.0): Render now reads from `sq.grid1[x][y]` and `sq.grid2[x][y]` (the post-swap active buffers) rather than `sq.next1`/`sq.next2`. Rendering lag eliminated.*

**[RESOLVED] [WARN] [BUG] Unclamped pulse values in physics buffer**
Location: `_updatePhysics` — grid1 update: `sq.next1[x][y] = (v1 + (a1 - v1) * cohesion + d1 * growthFactor * damping) * waveDecay`
Evidence: No clamp is applied to `next1[x][y]` before it is stored. When `growthFactor × damping > 1`, the diffusion term can amplify high-gradient cells beyond [0,1]. The render-time clamp `Math.max(0, Math.min(1, sq.next1[x][y]))` protects display but the out-of-range value re-enters the physics computation as `v1` in the next frame.
Impact: At extreme parameter combinations, the pulse field can diverge.

*Fix (v1.1.0): Clamp applied at physics write time: `sq.next1[x][y] = raw1 < 0 ? 0 : raw1 > 1 ? 1 : raw1`. Out-of-range values no longer re-enter the simulation.*

**[NOTE] [BUG] Collision map first-writer-only: third-square overlap ignored**
Location: `p5Draw` — collision detection: `if (!map.has(idx)) { map.set(idx, {...}); } else { ...swap... }`
Evidence: When two squares map to the same pixel, the first square's entry is stored and then used for the swap. If a third square then maps to the same pixel, it will initiate a second swap with the same first-frame occupant.
Impact: In dense overlap zones, later squares do not correctly interact with the most recent occupant. Produces a mild mixing bias in high-density scenarios; not a crash risk. Documented in KNOWN LIMITATIONS.

---

## Performance Risks

**[RESOLVED] [WARN] [PERFORMANCE] O(1,166,400) flat array clear per frame**
Location: `p5Draw` — `for (let i = 0; i < map.length; i++) map[i] = null;`
Evidence: `_collisionMap` is a flat array of 1080 × 1080 = 1,166,400 elements. The entire array is cleared to `null` every frame regardless of how many cells are active.
Impact: At 30fps this is approximately 35M null assignments per second.

*Fix (v1.1.0): `_collisionMap` converted from a flat null-initialised array to a sparse `Map`. Cleared each frame via `map.clear()` which operates only on populated entries — O(N × res²) ≈ O(171,000) at peak vs. O(1,166,400) previously.*

**[WARN] [PERFORMANCE] O(N × res²) individual p.rect() calls per frame**
Location: `p5Draw` — inner render loop: `p.rect(ent.cartesian.x - ent.drawSize * 0.5, ...)`
Evidence: At `numSquares=6, orbitRadius=540`: approximately 171,000 `p.rect()` calls per frame. Each call carries p5's per-draw-call overhead.
Impact: At 30fps this is approximately 5.1M draw calls per second. Dominant wall-clock cost on most hardware. Documented in PERFORMANCE section.

**[NOTE] [PERFORMANCE] Per-frame trig evaluations in geometry pass**
Location: `p5Draw` — cell world position: `Math.cos(theta)` and `Math.sin(theta)` per cell
Evidence: At peak load (171,000 cells), 342,000 trig evaluations per frame.
Impact: Moderate cost. Rotation matrix incremental update could reduce per-frame trig to O(N).

---

## Parity Holes (as Issues)

**[RESOLVED] [NOTE] [PARITY] `animatableParams` not declared**
Location: `SCRIPT_CONFIG.animation`
Evidence: `animation: { type: 'infinite', defaultFps: 30 }` — `animatableParams` field absent
Impact: The host cannot identify which parameters produce smooth animation when swept in a sequence export.

*Fix (v1.1.0): `animatableParams` declared in `animation` block: `['orbitSpeed', 'spinSpeed', 'growthFactor', 'damping', 'waveDecay', 'identityForce']`.*

**[NOTE] [PARITY] Fit/fill/actual viewport and zoom issues are host-level defects, not generator defects**
Location: Not present in `clockwise.gen.js`
Evidence: The generator contains no viewport scaling, canvas sizing, or zoom logic. It outputs to a fixed 1080×1080 p5 canvas via `p.rect()` calls positioned in pixel coordinates.
Impact: The reported broken fit/fill/actual and zoom behaviour is a defect in the generative tool host's canvas management layer. This generator script is not the source of the problem and does not need modification to resolve it.

---

## Escalation Issues

**[NOTE] [ESCALATION] Algorithm candidate: two-field cellular diffusion with identity restoration**
Location: `_updatePhysics` in `clockwise.gen.js`
Description: Advances two coupled scalar field grids (pulse and hue) using neighbourhood averaging, weighted difference amplification, per-step decay, modular wrapping, and an identity bias pull — a discrete reaction-diffusion variant.
Candidate library location: `assets/js/shared/algorithms/physics/reaction-diffusion.js`
Reason: non-trivial (20+ lines, named algorithm class); the neighbourhood scan + diffusion pattern is reusable in any cellular automata or wave generator; not currently in the shared library
