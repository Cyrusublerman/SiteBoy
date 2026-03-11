# Shape Array — Issues and Conflicts

## ERROR

None.

## WARN

**[BUG] `_globalT` is frame-rate-dependent**
`this._globalT = (this._globalT + morphSpeed) % 1` accumulates outside of `frame` counter. If the host skips frames (e.g., during tab switch, resize, or heavy load), `_globalT` drifts from its expected position. Replay, pre-render, and seek are all broken as a result.
Fix: `const globalT = (frame × morphSpeed) % 1`.

**[STANDARDS] State stored on `SCRIPT_CONFIG` object**
`_globalT` is a config-object property. Same architectural issue as `fibonacci-balls`, `animated-lines`, `golden-grid`, `order-disorder`. Should be scoped per-invocation.

**[STANDARDS] Preset format non-standard**
Flat objects without `values: { ... }` wrapper.

**[STANDARDS] No `export` block**
No PNG/GIF/WebM export available.

**[STANDARDS] Raw colour literals**
`bgColor === 'dark' ? 20 : 245` and `bgColor === 'dark' ? 255 : 0` — raw P5 brightness/greyscale values, not CSS variables.

**[PERFORMANCE] `_samplePerimeter` O(circleRes × n) per cell**
Inner edge-walk is O(n) per sample point, for circleRes samples → O(circleRes × n). At max params: 400 cells × 2 calls × 64 × 4 = 204,800 iterations just for sampling.
Fix: precompute cumulative edge lengths, use binary search → O(n + circleRes) per call.

## NOTE

**[DESIGN] `circleRes` conflates sampling resolution with circle side count**
`stages[3] = max(8, circleRes)` links the circle polygon side count to the perimeter sampling resolution. Increasing `circleRes` for smoother interpolation also makes the target "circle" a higher-sided polygon. These concerns could be separated into `circleRes` (sampling) and `maxSides` (circle polygon sides).

**[DESIGN] Line stage (n=2) always closes with `p.endShape(CLOSE)`**
Closing a 2-point shape draws: v0→v1→v0→close = a degenerate zero-area shape. Visually this appears as a line (the two paths overlap). Correct for the visual intent but may surprise users who inspect the shape structure.
