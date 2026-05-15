# Torus — Issues and Conflicts

## **[RESOLVED]** WARN [STANDARDS] — Module-Level Mutable State
*Fix: `let majorRadius`/`let minorRadius` removed; `const R = Math.min(W, H) * (params.torusSize)` computed locally inside `draw` and passed as arguments.*

**Location:** Lines 13–14: `let majorRadius = 0; let minorRadius = 0;`

**Rule:** `code-standards.md` — no persistent module-level mutable state.

**Issue:** `majorRadius` and `minorRadius` are module-level `let` variables that are mutated every `draw` call by `updateRadii`. If multiple generator instances share the module (unlikely but possible depending on host import caching), they will clobber each other.

**Fix:** Compute radii locally inside `draw`; pass as arguments to `drawTorusSpiral` and `drawToroidalSurfaceSpiral`. Remove module-level declarations.

---

## **[NON-VIOLATION]** WARN [STANDARDS] — Raw Hex Colour Strings

**Location:**
- `drawTorusSpiral`: `ctx.fillStyle = 'rgba(192, 192, 192, 0.25)'`
- `drawToroidalSurfaceSpiral`: `ctx.strokeStyle = '#c0c0c0'`

**Rule clarification:** Workspace rules state "No raw hex/rgb/hsl/named colours in UI styling". The canvas context is not UI styling. Rules separately note "Canvas/render output: `var(--vga-*)` palette values permitted" — permissive, not mandatory. `#c0c0c0` is VGA silver; `rgba(192,192,192,0.25)` is the only method available for a translucent canvas fill (CSS variables resolve to opaque values). This is not a violation. Issue closed.

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

## Stale Documentation

**[STALE DOC] [DOC-011] — mechanisms.md Documents Removed Functions and Old Projection**

Function inventory lists `updateRadii()` (removed in v2.0.0; R computed locally in draw). State Model documents `majorRadius`/`minorRadius` as module-level variables (removed). Projection section describes old 3-stage non-standard algorithm; live source uses standard Ry×Rx. Render pipeline step 1 references `updateRadii`. "Standards violation" note is now resolved. Full mechanisms rewrite needed against live v2.0.0 source.

---

**[STALE DOC] [DOC-012] — ui-layout.md Multiple Stale Entries**

`showTorusMesh` documented as type `toggle`/`default: true` (boolean); live source uses `type: 'radio'`, `options: ['on','off']`, `default: 'on'`. Canvas group lists `canvasWidth`/`canvasHeight` (removed in v2.0.0). Animation section states "No `animatableParams` declared"; live source has `animatableParams: ['viewX', 'viewY']`.

---

**[STALE DOC] [DOC-013] — description.md Projection Section**

Projection paragraph describes "two sequential X-axis rotations (frame-driven xRotation plus static viewAngleX) and a partial Y-axis rotation (viewAngleY)". Live source applies standard Ry×Rx: one Y-axis rotation (viewY + frame phase), then one combined X-axis rotation.

---

**[STALE DOC] [DOC-014] — migration-log.md Analyses v1.0.0**

Migration log states "Source analysed: v1.0.0". Live source is v2.0.0. Open Items 1–8 in the log are all pre-v2.0.0 items; most have been resolved in v2.0.0. Log must be updated to reflect current state.

---

## **[RESOLVED]** WARN [PARITY] — Major and Minor Radii Locked Equal

*Fix: Added `majorRadiusFactor` and `minorRadiusFactor` slider controls; draw path now computes independent `R` and `r` from `baseRadius`.*

**Location:** `draw`: `const R = baseRadius * majorRadiusFactor`, `const r = baseRadius * minorRadiusFactor`.

**Legacy spec:** Separate `majorRadius` and `minorRadius` sliders with independent ranges.

**Impact:** Resolved. Users can create elliptic/ring/horn-like variants by varying independent major/minor factors.

**Status:** Closed.

---

## NOTE [PARITY] — Play/Pause Not Implemented

**Legacy spec:** Play/pause control recommended. The audit flags this as a Medium gap.

**Impact:** The animation always runs; the user cannot inspect a single frame via the UI (though GIF/WebM export via the host's export system provides frame access).

---

## v4 turn log (2026-04-23)

- **GEN-006 (P2, WONTFIX):** Projection behaviour diverges from reference because live keeps corrected standard Ry×Rx model (intentional).
- **GEN-007 (P2, FIXED):** Added independent `majorRadiusFactor` / `minorRadiusFactor` controls; R and r no longer locked equal.
- **ARCH-007 (P1, FIXED):** Live torus source imports no modules from `assets/js/shared/` (`zero-shared-imports`).
- **ARCH-008 (P1, WONTFIX):** Procedural generator pattern retained; `BaseComponent` inheritance not applied to script generators.
- **DOC-007 (P2, FIXED):** `mechanisms.md` now documents live stateless radii model and Ry×Rx projection.
- **DOC-008 (P2, FIXED):** `ui-layout.md` synced to live parameter groups and control types.
- **DOC-009 (P2, FIXED):** `description.md` projection and radius semantics synced with live source.
