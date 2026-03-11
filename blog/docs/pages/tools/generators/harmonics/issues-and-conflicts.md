# Harmonics — Issues and Conflicts

## ERROR [BUG] — Animation Driven by Date.now(), Not frame

**Location:** `SCRIPT_CONFIG.draw` line 251: `const elapsed = (Date.now() - startTime) / 1000;`; `SCRIPT_CONFIG.onInit` line 237: `startTime = Date.now();`.

**Rule:** `code-standards.md` — animation timing must be derived from the `frame` counter provided by the host.

**Issue:** The generator ignores the `frame` argument. All animation is driven by wall-clock elapsed time since `onInit`. This causes:
1. **Non-determinism:** Two renders at the same `frame` index may produce different images depending on when `onInit` was called and system clock precision.
2. **Pre-render breakage:** `canPrerender: true` is declared, but pre-rendering a frame sequence requires that `draw(ctx, canvas, params, n)` always produces the same output for frame `n`. This guarantee is violated by wall-clock timing.
3. **Tab-switch jump:** If the page is hidden and then shown, `Date.now()` resumes from the current time, causing the animation to skip forward.
4. **Export inaccuracy:** GIF/WebM export that renders frames by calling `draw` sequentially will produce a valid sequence only if the host calls `draw` at exactly `1/fps`-second intervals. Any rendering delay causes frame desynchrony.

**Fix:** Compute all timing from `frame`:
```javascript
const elapsed = frame / (params.fps || 60);
```
Remove `startTime` module-level variable. Remove `onInit` hook.

---

## ERROR [BUG] — loopFrames Inaccurate When passDuration ≠ 90

**Location:** `SCRIPT_CONFIG.animation.loopFrames: 720 * 60` (hardcoded 43200).

**Issue:** The total cycle duration is `passDuration × 8` seconds. At `passDuration = 90`, this is 720 s → 43200 frames. But if `passDuration = 30`, cycle is 240 s → 14400 frames. The `loopFrames` field remains 43200, causing the host to seek the wrong frame for loop boundaries in pre-rendered sequences.

**Fix:** Compute `loopFrames` dynamically from params, or recalculate in `onParamChange`.

---

## WARN [STANDARDS] — Module-Level Mutable State

**Location:** Lines 9–11: `let startTime = null; let passDuration = 90; let totalCycleDuration = 720;`

**Rule:** No module-level mutable state.

**Issue:** If module is shared across two tool instances, state will be shared and corrupted. Additionally, these variables store no meaningful value until `onInit` is called, leaving a `null` start time window.

**Fix:** Move all timing state into the `draw` function scope (using `frame`-based timing) and remove module-level declarations.

---

## WARN [STANDARDS] — Non-Standard Lifecycle Hooks (onInit, onParamChange)

**Location:** `SCRIPT_CONFIG.onInit`, `SCRIPT_CONFIG.onParamChange`.

**Rule:** The `.gen.js` format defines only `draw` as the main callback. `onInit` and `onParamChange` are non-standard extensions.

**Issue:** If the host does not invoke `onInit`, `startTime` remains `null` and `Date.now() - null` produces `Date.now()` (NaN-safe coercion), causing `elapsed` to be a large number and the animation to start at a random cycle position.

**Fix:** Remove `onInit` and `onParamChange` if switching to `frame`-based timing (see ERROR above).

---

## WARN [STANDARDS] — Raw Colour Strings

**Location:**
- `draw`: `ctx.fillStyle = \`rgba(0, 0, 0, ${motionBlur})\``
- `draw`: `ctx.fillStyle = '#c0c0c0'`

**Rule:** All colours must use CSS variables `var(--vga-*)`.

**Fix:** Use `var(--vga-black)` / `var(--vga-silver)` or apply the alpha via CSS opacity/filter on a transparent-background canvas approach.

---

## WARN [STANDARDS] — Inert canvasWidth / canvasHeight Parameters

**Location:** Canvas parameter group.

**Fix:** Remove or implement host canvas resize support.

---

## WARN [PERFORMANCE] — N Separate beginPath/fill Calls Per Frame

**Location:** `draw` — inner `for` loop with `ctx.beginPath()`, `ctx.arc()`, `ctx.fill()` per particle.

**Issue:** At `points = 3000`, 3000 separate path+fill flushes per frame. At 60 FPS, this creates 180,000 path flush operations per second — well above what 2D canvas can handle efficiently.

**Fix:** Batch all arcs into a single path:
```javascript
ctx.beginPath();
for (let i = 0; i < points; i++) {
    // ... compute x, y ...
    ctx.moveTo(x + pointSize, y);
    ctx.arc(x, y, pointSize, 0, Math.PI * 2);
}
ctx.fill();
```

---

## NOTE [PARITY] — Ratio Label Not Rendered

**Legacy audit:** "Ratio display ✅ Live ratio label." The live `.gen.js` does not render a ratio label to the canvas. The legacy implementation used `setStatus()` on the host to display the current ratio. The `.gen.js` format may not support this pattern.

---

## NOTE [PARITY] — Play/Pause and Speed Control Missing

**Legacy audit:** Medium gaps. No play/pause; only reset. No speed slider.
