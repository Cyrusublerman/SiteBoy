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

**[STALE DOC] [DOC-001] — mechanisms.md Documents Removed Architecture**

`mechanisms.md` state model and render pipeline sections still describe `Date.now()` timing, module-level `startTime`/`passDuration`/`totalCycleDuration`, and `onInit`/`onParamChange` hooks — all of which were resolved. Full rewrite needed against live source.

---

**[STALE DOC] [DOC-002] — ui-layout.md Canvas Group**

`ui-layout.md` still documents a Canvas parameter group (`canvasWidth`, `canvasHeight`). These parameters were removed (see RESOLVED above). Canvas group entry must be deleted from the doc.

---

**[STALE DOC] [DOC-003] — performance.md Wall-Clock Timing Risk**

`performance.md` contains a "Wall-Clock Timing Risk" section describing a risk that was resolved. Section must be removed.

---

**[STALE DOC] [DOC-004] — feature-parity.md Play/Pause Missing Claim**

`feature-parity.md` NOTE states "Play/Pause Missing". Host ANIMATE tab exposes PLAY/STOP controls. Claim is stale — remove.

---

**[MISSING DOC] [DOC-005] — source-reference.md Absent**

`source-reference.md` does not exist for this generator. Must be created documenting the reference source file location, origin, and key divergences.

---

**[WONTFIX] [GEN-001] — Animation Does Not Auto-Run on Load**

`SCRIPT_CONFIG.animation.type = 'loop'` and `canPrerender: true` are set. On load the canvas is static at frame 0; animation starts on manual PLAY. User decision: keep manual start/stop so exports remain clean and deterministic.

---

**[STALE DOC] [DOC-006 / host] — tool.md Export Contract Incomplete**

Host export surface offers PNG/JPEG/WEBP/AVIF for images and GIF/WEBM/MP4/ZIP for animation. `tool.md` documents only PNG (image) and GIF/WEBM/ZIP (animation). Fix in `tool.md`.

---

## v4 turn log (2026-04-23)

- **GEN-002 (P1, FIXED):** `canvasWidth` capability in reference is absent in live (`reference/.../harmonics.gen.js:214-221`; live has no matching param row).
- **GEN-003 (P1, FIXED):** `canvasHeight` capability in reference is absent in live (`reference/.../harmonics.gen.js:223-230`; live has no matching param row).
- **GEN-004 (P2, SKIPPED-PHASE-3):** reference lifecycle capability `onInit` diverges in live (live uses frame-derived timing in `draw` only).
- **ARCH-003 (P1, FIXED):** zero shared imports in live harmonics source (`assets/js/tools/generators/scripts/parametric/harmonics.gen.js`).
- **ARCH-004 (P1, WONTFIX):** live generator does not extend `BaseComponent` (procedural module script pattern). User confirmed generators are procedural and this issue class is not applicable.
- **DOC-001 (P2, FIXED):** `description.md` still claims wall-clock timing (`Date.now`) though live is frame-derived.
- **DOC-002 (P2, FIXED):** `ui-layout.md` documents removed Canvas params and stale loopFrames behaviour.
- **DOC-003 (P2, FIXED):** `performance.md` "Wall-Clock Timing Risk" section is stale vs live implementation.
