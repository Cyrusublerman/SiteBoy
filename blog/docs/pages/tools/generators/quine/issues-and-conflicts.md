# Quine — Issues and Conflicts

## ERROR

None.

## WARN

**[RESOLVED] [STANDARDS] All state on `SCRIPT_CONFIG`**
All mutable state moved to `_instances: WeakMap` keyed by p5 instance via `_makeState()`. Per-invocation scoping now correct; concurrent instances no longer share state.

**[PARTIAL] [STANDARDS] Raw RGB colour objects**
`_BG`, `_INK_CODE`, `_INK_COMMENT` remain hardcoded `{ r, g, b }` objects. Source now carries explicit exemption comment: "Canvas output colours — exempt from UI CSS variable rule per design-law §6.2". No equivalent CSS tokens exist for paper-simulation palette. UI colours are unaffected.

**[RESOLVED] [STANDARDS] Non-standard preset format**
Presets now use `{ name, values: { ... } }` structure. All three presets (Classic, Fast, Slow Bleed) are compliant.

**[RESOLVED] [STANDARDS] No `animatableParams` declared**
`animation.animatableParams: ['entropy', 'urgency', 'gravity', 'delayScale']` is now present.

**[RESOLVED] [STANDARDS] No export options**
`export: { png: true, gif: false, webm: false }` now declared.

**[RESOLVED] [BUG] Non-deterministic timing**
`_noiseT` counter removed. Character delays now derived via `_pseudoNoise(charIndex)` — a deterministic integer hash seeded from the character's index. Same `charIndex` and params always produce the same delay.

**[RESOLVED] [PERFORMANCE] `_diffuse` full-canvas pass**
Active bounding box (`activeX0/Y0/X1/Y1`) maintained and tightened each frame. `_diffuse` clips its iteration to the expanded active region; full-canvas scan eliminated.

**[RESOLVED] [PERFORMANCE] Three 56 MB Float32Array buffers**
`_reflection` buffer removed. Source now uses two buffers (`residue` + `echo`), with a comment confirming: "Uses 2 buffers instead of 3 (removes `_reflection`)".

**[ARCHITECTURE] `p.noLoop()` in `p5Setup`**
Still present. Host must call `p.redraw()` each frame for the animation to run. A re-initialisation guard in `p5Draw` (`if (!state) { ... }`) indicates the host may not always call `p5Setup` before `p5Draw`. Confirmation that the host calls `p.redraw()` per frame is still required.

## NOTE

**[RESOLVED] [DEAD CODE] `_lastRenderedLine`**
Property is absent from `_makeState()`. Dead code removed.

**[RESOLVED] [ACCURACY] Header comment: "Perlin noise-driven delay"**
Header no longer describes Perlin noise. `_pseudoNoise` is correctly described as "Deterministic hash → value in [0, 1)".

**[PARITY] Partial quine**
`_QUINE_TEXT` still renders parameter names without numeric values. A true quine would render the exact source of `SCRIPT_CONFIG` verbatim.
