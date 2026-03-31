# SERPENTINE — Review 2403

- type: `serpentine`
- category: LINE RENDER
- isVector: true
- verdict: KEEP
- priority: HIGH
- date: 2026-03-24
- reviewer: user
- reference: `reference/generators/serpentine.html`

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Generates oscillating serpentine lines driven by image luminance — spacing, amplitude, frequency, drag, and stroke weight control the line behaviour | — |
| 1.2 | Visually distinct from all other modules? | YES — serpentine luminance-line rendering is unique | — |
| 1.3 | Verdict | KEEP — parity work and blending fix required | — |

## Issues

```
[ERROR] [BUG] Blending/compositing appears broken — module may not be rasterised correctly into the pipeline
Location: nodes/serpentine — rasterisation / compositing stage
Evidence: User observed blending issues; output does not composite cleanly with other pipeline layers.
Impact: Module output may not blend correctly, making it unusable in multi-effect stacks.
Action: Audit rasterisation of vector output into pixel buffer; verify alpha compositing and blend mode application.
```

```
[ERROR] [PARITY] No FRAME param — time/iteration state is inaccessible
Location: nodes/serpentine — param set
Evidence: Module has animation/iteration-based internal state but no FRAME param to select which frame is shown.
Impact: Static output is frozen at an arbitrary frame; animation cannot be driven.
Required: Add FRAME param (see _global_issues.md G9).
```

```
[ERROR] [PARITY] Missing oscillation bounds controls — no spawn rate, no vertical bounds
Location: nodes/serpentine — oscillation param set
Evidence: Reference exposes: spawn rate, oscillation top bound, oscillation bottom bound. Module exposes amplitude and frequency only — no bound clamping or spawn control.
Impact: Line behaviour cannot be constrained vertically; spawn density is uncontrolled.
```

```
[WARN] [PARITY] Drag response shaping absent — no response curve or curve strength
Location: nodes/serpentine — drag params
Evidence: Module has DRAG LIGHT and DRAG DARK (matching reference Drag Bright/Dark). Reference also has Response Curve selector and Curve Strength param — absent from module.
Impact: Luminance-response shaping of drag behaviour is not possible.
```

```
[WARN] [PARITY] No line tension subsystem
Location: nodes/serpentine — param set
Evidence: Reference has a dedicated Line Tension section: Base Tension, Bright Tension Boost, Bright Threshold, Max Segment Length. Module has only a generic ITERATIONS param.
Impact: Line structural stability and segment-length control are absent; module cannot replicate the reference's articulated line model.
```

```
[WARN] [PARITY] Rendering is monochrome scalar only — no explicit colour control
Location: nodes/serpentine — rendering params
Evidence: Module has BG LEVEL and STROKE LVL (scalar). Reference has explicit colour pickers for background and stroke plus a Line Opacity slider.
Impact: Cannot produce coloured serpentine output; rendering is limited to greyscale levels.
Required: Add STROKE COLOUR and BG COLOUR pickers (or at minimum a palette/colour param).
```

```
[NOTE] [PARITY] SVG export not exposed in module — see _global_issues.md G10
Location: NodePanel — serpentine module
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
```

## Source Parity Gap Table

| Reference Section | Reference Capability | Module Status |
|---|---|---|
| Oscillation | Spawn rate, wave frequency, top/bottom bounds, base speed | PARTIAL — frequency, amplitude, speed present; spawn rate and bounds absent |
| Drag Response | Drag Bright, Drag Dark, Response Curve, Curve Strength | PARTIAL — Drag Bright/Dark present; curve shaping absent |
| Line Tension | Base Tension, Bright Tension Boost, Bright Threshold, Max Segment Length | ABSENT |
| Rendering | Stroke colour picker, BG colour picker, Line Opacity | ABSENT — replaced by scalar BG/Stroke level only |
| Animation | Timing controls, pause/reset, record | ABSENT |
| Engine Mode | Flow / Static / Serpentine switching | ABSENT |
| Export | SVG/canvas export actions | ABSENT (global G10) |

## Action Items

1. **[CRITICAL]** Fix rasterisation/compositing — audit how vector output is composited into the pixel pipeline.
2. **[HIGH PRIORITY]** Add FRAME param for time/iteration state (global — tracked in `_global_issues.md` G9).
3. **[HIGH PRIORITY]** Add oscillation bounds: SPAWN RATE, TOP BOUND, BOTTOM BOUND params.
4. **[HIGH PRIORITY]** Add drag response shaping: RESPONSE CURVE dropdown, CURVE STRENGTH slider.
5. Add Line Tension subsystem: BASE TENSION, BRIGHT TENSION BOOST, BRIGHT THRESHOLD, MAX SEGMENT LENGTH.
6. Add explicit colour rendering: STROKE COLOUR, BG COLOUR pickers, LINE OPACITY slider.
7. Add EXPORT SVG action to NodePanel (global — tracked in `_global_issues.md` G10).
8. Fix +D driver button (global — tracked in `_global_issues.md` G1).
9. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
10. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
11. Add vector module indicator in CategoryPicker (global — tracked in `_global_issues.md` G7).
12. Merge LINE RENDER categories (global — tracked in `_global_issues.md` G8).
