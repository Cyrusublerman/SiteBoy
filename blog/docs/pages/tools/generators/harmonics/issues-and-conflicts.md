# Harmonics — Issues and Conflicts

## ERROR

**[RESOLVED] [BUG] — Animation Driven by Date.now(), Not frame**

Wall-clock timing removed. `elapsed = frame / fps` is now used throughout. `startTime` module variable and `onInit` hook are gone. Animation is fully deterministic with respect to `frame`.

---

**[RESOLVED] [BUG] — loopFrames Inaccurate When passDuration ≠ 90**

`SCRIPT_CONFIG.animation.loopFrames` is now recomputed each draw call: `Math.round(passDuration * 8 * fps)`. A host reading `loopFrames` after at least one draw call will receive the correct value for any `passDuration`.

---

## WARN

**[RESOLVED] [STANDARDS] — Module-Level Mutable State**

`let startTime`, `let passDuration`, and `let totalCycleDuration` removed from module scope. All timing is now computed locally inside `draw` from `frame` and `params`.

---

**[RESOLVED] [STANDARDS] — Non-Standard Lifecycle Hooks (onInit, onParamChange)**

`onInit` and `onParamChange` removed. No non-standard hooks remain on `SCRIPT_CONFIG`.

---

**[RESOLVED] [STANDARDS] — Raw Colour Strings**

`rgba(0, 0, 0, ${motionBlur})` form eliminated. Partial clear now uses `ctx.globalAlpha = motionBlur` followed by `ctx.fillStyle = '#000000'`. Particle colour uses `ctx.fillStyle = '#c0c0c0'`. Both are valid VGA palette hex values (`#000000` = VGA black, `#c0c0c0` = VGA silver).

---

**[RESOLVED] [STANDARDS] — Inert canvasWidth / canvasHeight Parameters**

Canvas parameter group removed. The parameters are no longer declared.

---

**[RESOLVED] [PERFORMANCE] — N Separate beginPath/fill Calls Per Frame**

Point rendering is now batched: single `beginPath()` followed by all `ctx.arc()` calls then one `ctx.fill()`. For `pointSize ≤ 1`, `ctx.fillRect` is used instead (faster for sub-pixel points). Per-particle path flush eliminated.

---

## NOTE

**[PARITY] — Ratio Label Not Rendered**

No on-canvas ratio label. The live implementation does not render the current interval name or frequency ratio. The legacy `setStatus()` mechanism is not available in the `.gen.js` format.

---

**[PARITY] — Play/Pause and Speed Control Missing**

No play/pause control; animation rate is determined by `passDuration` and the host frame counter only. No speed slider.
