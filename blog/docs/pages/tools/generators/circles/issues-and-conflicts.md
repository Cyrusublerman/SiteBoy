# Circles — Issues and Conflicts

## WARN [STANDARDS] — Module-Level Mutable State

**Location:** Lines 15–17: `let circles = []; let largestRadius = 0; let radiusDecrement = 0;`

**Rule:** No module-level mutable state.

**Fix:** Move `circles`, `largestRadius`, `radiusDecrement` into a closure or compute locally in `draw`.

---

## WARN [STANDARDS] — Raw Colour Strings

**Location:**
- `draw`: `ctx.fillStyle = '#000000'` (clear)
- `draw` (lines mode): `ctx.strokeStyle = '#ffffff'`
- `draw` (b/w mode): `ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#000000'`
- `draw` (gradient mode): `` ctx.fillStyle = `rgba(255, 255, 255, ${alpha})` ``

**Rule:** All colours must use CSS variables `var(--vga-*)`.

**Fix:** Replace with `var(--vga-white)`, `var(--vga-black)` etc.

---

## WARN [STANDARDS] — No animatableParams Declared

**Location:** `SCRIPT_CONFIG.animation` — no `animatableParams` key.

**Fix:** Add `animatableParams: []` (frame-driven animation, no phase params).

---

## WARN [STANDARDS] — loopFrames Hardcoded Inconsistently with cycleFrames

**Location:** `SCRIPT_CONFIG.animation.loopFrames: 3600`; `cycleFrames` parameter range 600–7200.

**Issue:** If `cycleFrames` is changed to 1200 (10 s loop), the generator's actual loop period is 1200 frames, but the host is told the loop is 3600 frames. Pre-render sequences will be cut too long or too short.

**Fix:** Document that `loopFrames` is a default matching `cycleFrames` default; or compute dynamically.

---

## WARN [STANDARDS] — console.log in Production

**Location:** Line 206: `console.log('✅ Circles script loaded');`

**Fix:** Remove.

---

## NOTE [BUG] — Orbit Model Is Not Rolling Motion

**Location:** `draw` — transform calculation: `orbitAngle = (frame / cycleFrames) × TWO_PI` applied identically to all circles.

**Issue:** All circles orbit at the same angular rate (`orbitAngle`). This means the entire chain of circles rotates as a single rigid arm — not as epicyclic rolling circles. In true rolling motion, inner circles would complete `(R_outer / R_inner)` orbits for every orbit of the outer circle, producing spirograph/epicycloid paths.

**Impact:** The visual output is a chain of concentric circles on a rotating arm, not a spirograph or rolling-circle pattern as described. The legacy doc says "rolling motion accumulates rotations" but the code does not implement this.

**Fix:** To implement true rolling: `orbitAngle_i = frame × (largestRadius / radius_i) × (2π / cycleFrames)`.

---

## NOTE [BUG] — Rebuild Does Not Detect Canvas Size Change

**Location:** `draw` — rebuild condition: `circles.length === 0 || circles.length !== params.circleCount`.

**Issue:** If the canvas is resized (W or H changes), `largestRadius` is not updated because `initCircles` is not re-called. The circles remain sized for the previous canvas dimensions.

**Fix:** Track canvas size in module state; trigger rebuild when size changes:
```javascript
if (circles.length !== params.circleCount || prevW !== W || prevH !== H) {
    initCircles(W, H, params.circleCount);
}
```

---

## NOTE [BUG] — displayMode.toLowerCase() Throws If displayMode Is Undefined

**Location:** `draw` line 81: `const mode = params.displayMode.toLowerCase();`

**Issue:** If the host provides `params.displayMode = undefined` (e.g., before the radio default is applied), this throws a TypeError.

**Fix:** `const mode = (params.displayMode || 'lines').toLowerCase();`

---

## NOTE [PARITY] — Play/Pause, Speed, largestRadius, Line Width Missing

**Legacy audit:** Medium gaps. All four are flagged as recommended additions. None are implemented in the live script.
