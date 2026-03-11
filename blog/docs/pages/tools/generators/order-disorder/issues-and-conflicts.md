# Order and Disorder — Issues and Conflicts

## ERROR

None.

## WARN

**[BUG] Noise time is not looping**
`t = frame × noiseTimeScale` and `jt = frame × jiggleSpeed` advance monotonically. At `frame = loopFrames`, `t = loopFrames × noiseTimeScale` (default: 360 × 0.016 = 5.76), not 0. The noise displacement at the start and end of a loop cycle do not match. Animation is `type: 'loop'` but is not seamlessly loopable.
Fix: use `t = (frame % loopFrames) × noiseTimeScale / loopFrames` × some constant, or treat animation as `type: 'infinite'`.

**[BUG] Canvas dimensions hardcoded in `_buildPoints`**
`W = 1080, H = 1080` are literals. Centre is computed as `(540, 540)`. If the host renders at a different canvas size, grid extends beyond canvas bounds (or fails to cover it), and the influence field centre is misaligned.
Fix: use `p.width`, `p.height` and pass them into `_buildPoints`.

**[BUG] `animation.loopFrames` conflicts with `params.loopFrames`**
Static `animation.loopFrames = 360` is used by host/export; user-adjustable slider drives actual animation. Same issue as `golden-grid`. At `loopFrames = 720` ("Wide Chaos" preset), export will capture only 360 frames (half a loop).

**[STANDARDS] State stored on `SCRIPT_CONFIG` object**
`_points`, `_lastParams` mutated via `this.*`. Same pattern as prior P5 generators.

**[STANDARDS] Preset format non-standard**
Flat objects without `values: { ... }` wrapper.

**[STANDARDS] Raw P5 colour values**
`p.background(255)` and `p.stroke(0)` — cannot be overridden by CSS variable system.

**[STANDARDS] No `export` block**
No PNG/GIF/WebM export available.

**[PERFORMANCE] `p.point` not batched**
Each of N points calls `p.point(x, y)` individually. P5 does not batch these into a single draw call. At N ≈ 31,329 (default): 31K individual canvas path operations/frame.
Fix: use `p.beginShape(p.POINTS); for each pt: p.vertex(x,y); p.endShape()` for a batched draw path.

## NOTE

**[PERFORMANCE] `_normalizeAngle` while-loop**
While loop to normalize angle to (−π, π]. For typical inputs (difference between two atan2 values), at most one iteration is needed. Could be replaced with `((theta + Math.PI) % (2*Math.PI) + 2*Math.PI) % (2*Math.PI) - Math.PI` but correctness is identical.

**[DESIGN] `curvedR` exponent hardcoded to 1**
`curvedR = clamp(normR, 0, 1)^1` — the exponent is 1, making it linear. The comment structure (`1`) suggests it was intended to be a configurable sharpness parameter but was left as a literal. Exposing it as `radialCurve` would give users control over radial falloff shape, similar to how `ccw` uses `0.7`.
