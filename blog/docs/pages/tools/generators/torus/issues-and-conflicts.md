# Torus — Issues and Conflicts

## **[RESOLVED]** WARN [STANDARDS] — Module-Level Mutable State
*Fix: `let majorRadius`/`let minorRadius` removed; `const R = Math.min(W, H) * (params.torusSize)` computed locally inside `draw` and passed as arguments.*

**Location:** Lines 13–14: `let majorRadius = 0; let minorRadius = 0;`

**Rule:** `code-standards.md` — no persistent module-level mutable state.

**Issue:** `majorRadius` and `minorRadius` are module-level `let` variables that are mutated every `draw` call by `updateRadii`. If multiple generator instances share the module (unlikely but possible depending on host import caching), they will clobber each other.

**Fix:** Compute radii locally inside `draw`; pass as arguments to `drawTorusSpiral` and `drawToroidalSurfaceSpiral`. Remove module-level declarations.

---

## WARN [STANDARDS] — Raw Hex Colour Strings

**Location:**
- `drawTorusSpiral`: `ctx.fillStyle = 'rgba(192, 192, 192, 0.25)'`
- `drawToroidalSurfaceSpiral`: `ctx.strokeStyle = '#c0c0c0'`

**Rule:** All colours must use CSS variables `var(--vga-*)`. No raw hex or rgba strings.

**Fix:** Replace with `var(--vga-silver)` or the appropriate VGA colour variable.

---

## **[RESOLVED]** WARN [STANDARDS] — Non-Standard Parameter Type: toggle
*Fix: `showTorusMesh` changed to `type: 'radio'`, `options: ['on', 'off']`, `default: 'on'`.*

**Location:** `SCRIPT_CONFIG.parameters` — `showTorusMesh` with `type: 'toggle'`.

**Rule:** Standard parameter types are `slider` and `radio`.

**Fix:** Change to `type: 'radio'`, `options: ['on', 'off']`, default `'on'`; or support `toggle` in the host explicitly.

---

## **[RESOLVED]** WARN [STANDARDS] — Inert canvasWidth / canvasHeight Parameters
*Fix: Canvas parameter group removed entirely; `draw` reads `canvas.width`/`canvas.height` directly.*

**Location:** `SCRIPT_CONFIG.parameters` group "Canvas".

**Issue:** `draw` reads `canvas.width`/`canvas.height` directly. Sliders are inert.

**Fix:** Remove Canvas group or implement host canvas resize.

---

## **[RESOLVED]** WARN [STANDARDS] — No animatableParams Declared
*Fix: `animatableParams: []` added to the `animation` block.*

**Location:** `SCRIPT_CONFIG.animation` — missing `animatableParams`.

**Issue:** Animation is implicit via `frame`; no params are declared animatable. The host cannot offer per-parameter animation UI.

**Note:** For `type: 'loop'` with all rotation driven by `frame`, `animatableParams` may not be applicable. However, the standard should still be acknowledged — add `animatableParams: []` or document the implicit frame-driven model.

---

## **[RESOLVED]** WARN [STANDARDS] — console.log in Production
*Fix: `console.log('✅ Toroidal Spirals script loaded')` removed.*

**Location:** Line 324: `console.log('✅ Toroidal Spirals script loaded');`

**Fix:** Remove.

---

## **[RESOLVED]** WARN [BUG] — Non-Standard project3D Projection Matrix
*Fix: Standard Ry×Rx orthographic matrix implemented — `xR = x·cosVY + z·sinVY`, `zR = −x·sinVY + z·cosVY`, `yR = y·cosX − zR·sinX`; per-frame trig pre-computed as `cosX`, `sinX`, `cosVY`, `sinVY`.*

**Location:** `project3D` function.

**Issue:** The function applies two sequential X-axis rotations (first `xRotation`, then `viewAngleX`) and only a partial Y rotation (affecting x output via `z1·sin(viewAngleY)`, but not y output). This deviates from a standard orthographic or perspective 3×3 rotation matrix.

**Impact:** `viewY` changes the projected x-shear but not the vertical component. The visual output is plausible but technically incorrect for applications expecting standard camera control. Specifically, viewAngleY does not produce a standard yaw around the Y-axis.

**Fix:** Implement a standard rotation matrix:
```
Ry: x' = x·cos(θy) + z·sin(θy); z' = −x·sin(θy) + z·cos(θy)
Rx: y' = y·cos(θx) − z'·sin(θx); z'' = y·sin(θx) + z'·cos(θx)
```
Then project: `{ x: cx + x', y: cy − y' }`.

---

## WARN [PARITY] — Major and Minor Radii Locked Equal

**Location:** `updateRadii`: `majorRadius = minorRadius = minDim × sizeFactor`.

**Legacy spec:** Separate `majorRadius` and `minorRadius` sliders with independent ranges.

**Impact:** The user cannot create elliptic tori (R ≠ r). At `torusSize = 0.25`, the generator produces a horn torus; to produce a ring torus with a visible hole, R must be > r.

**Fix:** Add `majorFactor` and `minorFactor` sliders (or `minorRatio`), or implement `updateRadii(W, H, majorFactor, minorFactor)`.

---

## NOTE [PARITY] — Play/Pause Not Implemented

**Legacy spec:** Play/pause control recommended. The audit flags this as a Medium gap.

**Impact:** The animation always runs; the user cannot inspect a single frame via the UI (though GIF/WebM export via the host's export system provides frame access).
