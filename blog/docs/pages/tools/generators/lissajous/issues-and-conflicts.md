# Lissajous Curves — Issues and Conflicts

## Standards Compliance Check (`build-page.md` §8)

**This is a 2D generator (context: '2d'); p5 rules do not apply.**

**All generator rules:**

- No `document.*` / `window.*` / `.innerHTML` / `.createElement`: **PASS** — none present
- No `requestAnimationFrame` / `setInterval` / `setTimeout` for animation: **PASS** — none present; animation is host-driven
- Canvas output uses VGA palette or algorithmic colour with justification: **PASS** — black background (`#000000`), white stroke (`#ffffff`); both VGA palette values
- No inline algorithm that exists in `assets/js/shared/algorithms/`: **PASS** — the parametric Lissajous evaluation with signedPow is specific to this generator; `safePow` is imported from shared module (not re-implemented inline)
- State stored on `this`, not undocumented module-level variables: **PASS** — the generator is stateless; no mutable module-level state exists. `LANDMARKS` is a module-level constant (read-only); `signedPow` and `preset` are pure functions. No state violation.
- `destroy()` or equivalent cleanup: **NOTE** — no `destroy()` method; appropriate for a stateless generator. No timers or event listeners to clean up.
- `id` is kebab-case and matches filename: **PASS** — `id: 'lissajous'`, file `lissajous.gen.js`
- `title` is Title Case: **PASS** — `title: 'Lissajous Curves'`
- `category` is one of permitted values: **PASS** — `category: 'parametric'`
- All parameter keys are camelCase: **PASS** — all phase parameters renamed from `phi_x1`, `phi_x2` etc. to `phiX1`, `phiX2`, `phiXm1`, `phiXm2`, `phiY1`, `phiY2`, `phiYm1`, `phiYm2` in v1.1.0. All keys now camelCase.
- All preset objects include `name` and all parameter keys: **PASS** — the `preset()` helper provides all 30 parameter keys as defaults, and `LANDMARKS` is built entirely using this helper. All 28 presets have all keys.
- `frame` argument used, no internal frame counter: **NOTE** — `frame` is not declared in the `draw(ctx, canvas, params)` signature; correctly omitted for a fully stateless generator driven by `params` alone.
- Render hook is a method on SCRIPT_CONFIG: **PASS** — `draw(ctx, canvas, params)` is defined as an inline method on SCRIPT_CONFIG.

---

## Bug and Risk Detection

**[RESOLVED] [WARN] [STANDARDS] Parameter keys are not camelCase**
Location: `SCRIPT_CONFIG.parameters` — `phi_x1`, `phi_x2`, `phi_xm1`, `phi_xm2`, `phi_y1`, `phi_y2`, `phi_ym1`, `phi_ym2`
Evidence: `build-page.md` §5.1 requires all parameter keys to be camelCase. Keys containing underscores (`phi_x1` etc.) do not satisfy this requirement.
Impact: If the host's parameter system serialises or de-serialises keys expecting camelCase, underscore keys may cause failures in preset loading, URL serialisation, or animation param lookup. The `animatableParams` block also references these keys and must be kept consistent.

*Fix (v1.1.0): All `phi_*` keys renamed to camelCase: `phiX1`, `phiX2`, `phiXm1`, `phiXm2`, `phiY1`, `phiY2`, `phiYm1`, `phiYm2`. Parameter definitions, preset defaults, `animatableParams`, and `draw()` references updated consistently.*

**[RESOLVED] [WARN] [STANDARDS] Render hook assigned as external function reference, not inline method**
Location: `SCRIPT_CONFIG = { ..., draw: draw }` where `draw` is a module-level function
Evidence: Same pattern as solar-system.gen.js. The function does not use `this` and is defined outside the SCRIPT_CONFIG literal.
Impact: Violates the method pattern per `code-standards.md` §2.

*Fix (v1.1.0): `draw()` moved to an inline method on SCRIPT_CONFIG. Module-level `evaluate()` helper eliminated by inlining its body into the draw loop.*

**[RESOLVED] [WARN] [PERFORMANCE] Rotation trig computed inside `evaluate()` every call**
Location: `evaluate(t, p)` — `const rot = ...; const cosR = Math.cos(rot); const sinR = Math.sin(rot);`
Evidence: The rotation angle is a function of `p.rotation` only, which does not change within a single frame. `evaluate` is called `points` times per frame. At `points=40000`, this produces 40,000 redundant `Math.cos` and `Math.sin` evaluations of the same constant angle.
Impact: Estimated 0.5–2ms of unnecessary trig per frame at high point counts.

*Fix (v1.1.0): `evaluate()` eliminated; body inlined into `draw()` loop. `cosR` and `sinR` computed once per frame before the loop. Estimated saving: 0.5–2ms at 40,000–80,000 points.*

**[RESOLVED] [NOTE] [BUG] No guard against negative-power off-screen points**
Location: `evaluate(t, p)` — when `px1 < 0` or similar, `signedPow(cos(wx1·t + φx1), px1)` can produce very large values as `|cos(...)| → 0`
Evidence: `signedPow` uses `safePow(|v|, p)` which handles `|v| = 0, p < 0` by returning 0. However, for small but non-zero `|v|` with large negative `p`, the result can be very large. The returned `{x, y}` value will be extremely large in screen coordinates.
Impact: These off-screen extreme values cause `ctx.lineTo` to draw a line from the previous point to a position far outside the canvas. Does not crash the renderer, but produces visible artefact lines.

*Fix (v1.1.0): Path-break guard added: `if (Math.abs(rx) > boundX || Math.abs(ry) > boundY) { first = true; continue; }` where `boundX = W*2`, `boundY = H*2`. Out-of-range points restart the path segment rather than drawing a line to an off-screen position.*

---

## Performance Risks

**[PARTIAL] [WARN] [PERFORMANCE] O(points) × 10 trig evaluations per frame**
Location: `draw()` inner loop — parametric evaluation called `points` times
Evidence: At `points=80000`: approximately 800,000 trig calls + 640,000 safePow calls per frame.
Impact: At 60fps budget (16.7ms), this is 80,000 evaluate calls. At maximum points the frame budget is at risk on lower-end hardware.

*Status: Core O(points) complexity is unchanged; this is inherent to the algorithm. Mitigations applied: (1) `cosR`/`sinR` precomputed once per frame; (2) `evaluate()` body inlined into draw loop, eliminating per-point call overhead and `{x,y}` object allocation; (3) path-break on out-of-range points reduces accumulated path cost. Remaining candidates (WebAssembly, typed array coordinate accumulation) not applied. Documented in PERFORMANCE infoSection.*

---

## Parity Holes (as Issues)

**[NOTE] [PARITY] Y delta coupling architecture replaced with independent Y params**
Location: SCRIPT_CONFIG.parameters — Y groups use independent keys (Ay1, wy1, etc.)
Evidence: `lissajous.md` §4 describes `getFinalParams()` resolving `Ay1 = Ax1 + Ay1_delta`; live source uses Ay1, wy1, etc. as direct independent parameters.
Impact: Users familiar with the legacy delta-coupling model will find fundamentally different parameter behaviour. The preset set has been redesigned for the new model.

**[NOTE] [PARITY] Undo history (50 states) absent**
Location: Not present in live source
Evidence: `lissajous.md` §4 documents `historyStack` array with 50-state limit; confirmed absent by audit.
Impact: Users cannot revert parameter changes.

**[NOTE] [PARITY] Analysis functions absent (coupling check, integer frequency check)**
Location: Not present in live source
Evidence: `lissajous.md` §3 provides implementation code for `checkCoupling()` and `checkIntegerFrequencies()`; audit confirms not implemented.
Impact: No closed-curve indicator or frequency-relationship indicator in the UI.

**[NOTE] [PARITY] Motion blur / trail absent**
Location: Not present in live source
Evidence: `lissajous-audit.md` §2 documents `motionBlur` slider; not in SCRIPT_CONFIG.parameters.
Impact: The trail/blur effect available in the prior ToolBase implementation is unavailable.

---

## Escalation Issues

**[NOTE] [ESCALATION] Algorithm candidate: generalised Lissajous parametric evaluation**
Location: `draw()` inner loop in `lissajous.gen.js`
Description: Evaluates bivariate sum-of-terms parametric curve with signed power distortion and multiplicative modulation, plus rotation transform.
Candidate library location: `assets/js/shared/algorithms/parametric/lissajous.js`
Reason: non-trivial; named algorithm family; applicable to harmonics and any future parametric generator; the `signedPow` function is already partially in shared utilities via `safePow`
