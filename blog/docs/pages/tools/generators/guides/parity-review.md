# Parity Review Guide

Systematic process for reviewing one generator: run the reference, inspect it, then compare every dimension to the live implementation. Findings are logged to `issues.md` in this folder.

This is a *live review* process, not a documentation pass. Treat it as a test session, not a writing session.

---

## Prerequisites

- Dev server running at `http://localhost:3001` (or whatever port Vite binds)
- Reference files accessible at `http://localhost:3001/reference/generators/<id>/` — Vite serves the full repo root; use this to open reference HTML files directly in the browser
- `issues.md` open for logging
- `inventory.md` open for the generator's `id`, `category`, and `context`
- The generator's `.gen.js` file at `assets/js/tools/generators/scripts/<category>/<id>.gen.js`

---

## Phase 1 — Reference Analysis

Open the reference file in the browser. The reference file is typically at one of:

```
http://localhost:3001/reference/generators/<id>/index.html
http://localhost:3001/reference/generators/<id>/src/index.html
```

Check the generator's `migration-log.md` or `source-reference.md` for the exact path if not found above.

Work through every question below in order. Record answers in a scratch note before touching `issues.md`.

### 1.1 Purpose and output

Answer exactly:
- What visual output does it produce? (shapes, lines, fields, patterns — be specific)
- What is the mathematical or physical model? (parametric curve / particle system / wave superposition / reaction-diffusion / etc.)
- What is the canvas size in the reference? (check the HTML or source for `width`, `height`)
- What colour space does it use? (greyscale, VGA palette, arbitrary RGB/HSL, CSS named colours)

### 1.2 Animation

Answer exactly:
- Does it animate at all? (yes / no)
- If yes: is animation continuous (runs by default without user input) or triggered (requires a button / keypress / interaction)?
- How is the animation loop driven? (note if it uses `requestAnimationFrame`, `setInterval`, `p5.draw()`, or something else — this matters for standards compliance in the port)
- Is there a visible frame rate or timing control in the reference UI?
- Does the animation loop, or does it run once and stop?
- Is the animation deterministic (same output every time given the same params) or random?

### 1.3 Core algorithms

Answer exactly:
- What is the dominant computation? (e.g. point cloud trace, N-body simulation, FFT, pixel convolution)
- Are there any named mathematical constructs? (Lissajous, Fourier, Perlin noise, Voronoi, etc.)
- What is the render pipeline order? (e.g. clear → compute → plot → trail)
- Is the canvas cleared each frame, or is there trail/accumulation?

### 1.4 Independent variables

List every user-facing control in the reference. For each:

| Control label | Type | Range / options | Default | What it visually does |
| --- | --- | --- | --- | --- |
| | | | | |

Note: include controls that exist in the reference HTML even if they are absent in the live implementation — absence is an issue to log.

### 1.5 Pre-existing UI

Answer exactly:
- Does the reference have any UI at all? (yes / no)
- If yes: what components are present? (sliders, number inputs, dropdowns, buttons, checkboxes, colour pickers, canvas overlays, text readouts)
- What did each button/action do? (e.g. "RESET button re-randomised seed and cleared canvas")
- Was there any output from the UI beyond the canvas? (equation display, value readout, debug info)
- Was there any preset or preset-like mechanism (hardcoded configurations, URL params, etc.)?

---

## Phase 2 — Implementation Analysis

Open the live generator:

```
http://localhost:3001/#tools/generators?script=<id>
```

Work through every question below.

### 2.1 Output match

- Does the live implementation render the same visual class of output as the reference?
- Is the canvas size the same?
- Is the colour treatment the same? (VGA constraint is expected, but verify it hasn't broken the character of the output)

### 2.2 Animation match

- Does the animation run at all in the live version?
- Is it continuous / triggered in the same way as the reference?
- Does the timing / speed feel comparable to the reference at default params?
- Does animation stop correctly when switching away from the generator?

### 2.3 Parameter coverage

For each control identified in §1.4:
- Is there a corresponding parameter in the live sidebar?
- Does adjusting it produce the same visual change as in the reference?
- Is the range sensible? (not arbitrarily wider or narrower than the reference)

### 2.4 UI structure

- Does the sidebar have the correct tabs? (PARAMS / ANIMATE / CANVAS / INFO — check against `tool.md` §Sidebar Contract)
- Are all parameter groups present?
- Are presets present and correct?
- Is the INFO tab populated?

### 2.5 Export

- Does EXPORT → PNG produce an image of the current canvas state?
- If the generator is animated: does animation export (GIF / WebM / sequence) exist and work?

### 2.6 Viewport display

- Does FIT scale the canvas to fit the viewport with aspect preserved?
- Does FILL fill the viewport (cropping allowed)?
- Does ACTUAL render at 1 canvas pixel = 1 screen pixel?
- On a narrow viewport or mobile: do FIT / FILL / ACTUAL still function correctly?

---

## Phase 3 — Comparison and Issue Logging

For each discrepancy found between Phase 1 and Phase 2, log an entry in `issues.md`.

### Selecting the issue type

| Discrepancy class | Type prefix |
| --- | --- |
| Generator output / behaviour differs from reference | `GEN` |
| UI element wrong, missing, or violating the tool contract | `UI` |
| Export does not work or produces wrong output | `EXP` |
| FIT / FILL / ACTUAL / zoom / pan malfunction | `VIEW` |
| Breakage only on mobile or narrow viewport | `MOB` |
| Frame drop, memory growth, or load time problem | `PERF` |
| Violation of host contract (`tool.md`) | `ARCH` |

### Severity

| Code | Meaning |
| --- | --- |
| `P0` | Broken: the generator does not render, crashes, or produces completely wrong output |
| `P1` | Major: a significant feature or behaviour is missing or wrong compared to reference |
| `P2` | Minor: the implementation works but differs from reference in a noticeable but tolerable way |
| `P3` | Cosmetic: small visual or label discrepancy; does not affect function |

### Log entry format

Each entry goes into the corresponding table in `issues.md`. For issues needing more than a one-line summary, append a detail block at the bottom of `issues.md`:

```
### <ID> — <one-line summary>

Reference behaviour: <what the reference does>
Live behaviour: <what the implementation does>
Reference file: <path or URL>
Steps to reproduce: <numbered steps>
Notes: <anything else relevant>
```

---

## Review Order

Suggested order for processing all generators. Complete one generator fully before starting the next.

Priority is based on user-facing impact:
1. `harmonics` — default landing script; highest exposure
2. `lissajous` — most parameters; most likely to have UI gaps
3. `cymatics`
4. `moire`
5. `wave-interference`
6. `generative-pattern`
7. `tile-mosaic`
8. `fibonacci-balls`
9. `order-disorder`
10. `golden-grid`
11. `animated-lines`
12. `shape-array`
13. `p5-wave-interference`
14. `p5-wave-colour`
15. `torus`
16. `circles`
17. `interference-figure`
18. `squares`
19. `unified-pattern`
20. `wave-equation-synth`
21. `solar-system`
22. `clockwise`
23. `curtain-morph`
24. `quine`
25. `defecated`

Host-level issues (toolbar, FIT/FILL/ACTUAL, EXPORT, mobile layout) should be logged during the first generator reviewed, since they apply to all. Tag them with `Script = HOST`.

---

## Reference File Locations

Reference source files live at `reference/generators/<id>/`. The structure varies by generator — some have a single `index.html`, some have a `src/index.html`. Check the generator's `source-reference.md` or `migration-log.md` for the authoritative path.

To open a reference file in the browser:
```
http://localhost:3001/reference/generators/<id>/index.html
```

If a reference file has no HTML entry point (e.g. it is a raw JS bundle), it cannot be run directly — note this in the review and rely on the documented mechanisms instead.

---

## Output

At the end of each generator's review, `issues.md` should have:
- All found issues logged with correct ID, severity, and status `OPEN`
- Detail blocks for any P0/P1 issues
- A mental note of which issues are HOST-level (shared across all generators) vs. script-specific
