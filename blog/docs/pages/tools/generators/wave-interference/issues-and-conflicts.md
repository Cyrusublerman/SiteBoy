# Wave Interference — Issues and Conflicts

## WARN

**[RESOLVED] [STANDARDS] — Parameter Keys Use Underscore Notation**

All parameter keys are now camelCase: `phiR1`, `phiR2`, `phiX1`, `phiX2`, `phiY1`, `phiY2`, `waveR1`, `waveR2`, `waveX1`, `waveX2`, `waveY1`, `waveY2` throughout `draw`, `computePixels`, and `animatableParams`.

---

**[RESOLVED] [STANDARDS] — Inert canvasWidth / canvasHeight Parameters**

Canvas parameter group removed. `canvasWidth` and `canvasHeight` are not declared.

---

**[RESOLVED] [STANDARDS] — Preset Format Uses Partial Objects**

Each LANDMARK now spreads `_DEFAULTS` and overrides only preset-specific keys: `{ name, values: { ..._DEFAULTS, fr1: N } }`. All presets are full parameter maps; no default-merging required by the host.

---

**[PARITY] — Binary Thresholding Not Implemented**

Continuous greyscale via min-max normalisation is intentional. Documented in `KNOWN LIMITATIONS`: "This is an intentional design divergence; greyscale provides more visual information." No `threshold` toggle is implemented.

---

**[PARTIAL] [PARITY] — WebGL Rendering Not Implemented**

CPU ImageData is the only main-thread rendering path. Mitigation: `compute.worker: true` and `computePixels` provide off-main-thread computation via ComputeScheduler. Worker execution is architecturally equivalent to WebGL offloading for this use case.

---

**[RESOLVED] [PARITY] — 18 Parameters Have No UI Controls**

All previously missing parameters now have UI slots: `Or2`, `waveR2`, `prm1`, `prm2`, `phiRm1`, `phiRm2`, `Ox1`, `Ox2`, `waveX1`, `waveX2`, `pxm1`, `pxm2`, `phiXm1`, `phiXm2`, `Oy1`, `Oy2`, `waveY1`, `waveY2`, `pym1`, `pym2`, `phiYm1`, `phiYm2`. All 9 parameter groups (3 terms + 3 modulations per component, plus View) are fully exposed.

---

**[PARITY] — Modulation Formula Diverges From Spec**

Live formula remains: `M · (safePow(sin(frm1·r), prm1) + safePow(sin(frm2·r), prm2))` — additive two-sin sum. Spec described: `M · safePow(sin(frm1·r), prm1) · safePow(cos(frm2·r), prm2)` — multiplicative cross-modulation with cos. Intentional divergence; documented in `KNOWN LIMITATIONS`.

---

**[PARTIAL] [PARITY] — Checkpoint and Sequence Animation Missing**

`animation.sequencer: true` declared, signalling host support for checkpoint interpolation. The generator itself does not implement checkpoint save/load; host is responsible. Per-parameter animation speed/direction controls are not implemented.

---

## NOTE

**[RESOLVED] [STANDARDS] — console.log in Production Export**

No `console.log` calls present in source.

---

**[STANDARDS] — compute.idleDelay Uses Non-Standard Pattern**

`compute: { idleDelay: 200 }` remains. ComputeScheduler hint — silently ignored if unrecognised. Risk: low.
