# MODULE FLOW LINES — Review 2403

- type: `moduleflowlines`
- category: LINE RENDER
- isVector: true
- verdict: KEEP — complete rebuild required
- priority: HIGH
- date: 2026-03-24
- reviewer: user
- reference: `reference/generators/flow_lines_v14_with_info.html`

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Traces flow lines through a gradient field derived from the source image — seeds a uniform grid of points and advects each through the normalised gradient field for N iterations | — |
| 1.2 | Visually distinct from all other modules? | YES — gradient-field flow line tracing is distinct from serpentine and statichalftone | — |
| 1.3 | Verdict | KEEP — complete rebuild required | ERROR |

## Current Implementation (from reference pack)

**Algorithm chain:** `buildBaseGradient` → `normalizeField` → uniform seed grid → `buildFlowLines` → `vectorToRaster`

**Current params:** SPACING (2–40px), ITERATIONS (4–200, previewMax 12), STEP SIZE (0.25–5px), STROKE W (0.25–4), BG LEVEL (0–255), STROKE LVL (0–255), OPACITY, BLEND MODE

**Architecture:** Factory pattern, `isVector: true`, implements both `apply()` and `applyVector()`. Delegates entirely to shared algorithm SSoTs — no inline logic.

## Issues

```
[ERROR] [PARITY] Module has enormous issues and requires a complete rebuild against reference
Location: nodes/moduleflowlines — full implementation
Reference: reference/generators/flow_lines_v14_with_info.html
Evidence: User determination during review: module does not adequately implement the reference tool. Rebuild required.
Impact: Module is not fit for purpose in its current state.
```

```
[WARN] [PARITY] Rendering is monochrome scalar only — no colour control
Location: nodes/moduleflowlines — BG LEVEL and STROKE LVL params
Evidence: Background and stroke are scalar greyscale levels (0–255). Reference provides full colour control.
Impact: Cannot produce coloured flow line output.
Required: Replace BG LEVEL/STROKE LVL with STROKE COLOUR and BG COLOUR pickers, or add a palette/colour system.
```

```
[WARN] [PARITY] Seed grid is uniform only — no adaptive or luminance-weighted seeding
Location: nodes/moduleflowlines — seed generation
Evidence: Description confirms uniform grid seeding with no luminance-weighted or adaptive seeding option.
Impact: Line density cannot be concentrated in high-detail regions.
```

```
[WARN] [PARITY] No variable step integration — fixed forward Euler only
Location: nodes/moduleflowlines — buildFlowLines advection
Evidence: Description confirms forward Euler only; no Runge-Kutta or adaptive step size.
Impact: Lines in high-curvature regions may be inaccurate.
```

```
[WARN] [STANDARDS] FRAME param required — advection is iteration-based
Location: nodes/moduleflowlines — param set
Evidence: Per _global_issues.md G9, iteration-based modules require a FRAME param.
Impact: No user control over which iteration state is shown.
```

```
[NOTE] [PARITY] SVG export exists via DistortActions.exportSVG() but not exposed in NodePanel — see _global_issues.md G10
Location: NodePanel — moduleflowlines module
Evidence: Legacy docs confirm buildGeometry() / exportSVG() exists at tool level. Per G10, this should also be accessible directly from the NodePanel.
```

```
[NOTE] [PARITY] All range params listed as lacking getModulated() calls — driver system not wired
Location: nodes/moduleflowlines — all range params
Evidence: Legacy docs state: "No parameters in this module have pre-wired getModulated() calls — all values read directly from this.params."
Impact: Driver modulation (G2) cannot function even after G1 is fixed until getModulated() is wired.
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
```

## Action Items

1. **[HIGH PRIORITY]** Conduct full rebuild of moduleflowlines against `reference/generators/flow_lines_v14_with_info.html`.
2. **[HIGH PRIORITY]** Wire `getModulated()` calls for all range params to enable driver support.
3. Add FRAME param (global — tracked in `_global_issues.md` G9).
4. Replace BG LEVEL / STROKE LVL with colour picker params (STROKE COLOUR, BG COLOUR).
5. Add luminance-weighted and adaptive seeding options.
6. Investigate Runge-Kutta or adaptive step integration for higher accuracy in high-curvature regions.
7. Expose SVG export in NodePanel (global — tracked in `_global_issues.md` G10).
8. Fix +D driver button (global — tracked in `_global_issues.md` G1).
9. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
10. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
11. Add vector module indicator in CategoryPicker (global — tracked in `_global_issues.md` G7).
12. Merge LINE RENDER categories (global — tracked in `_global_issues.md` G8).
