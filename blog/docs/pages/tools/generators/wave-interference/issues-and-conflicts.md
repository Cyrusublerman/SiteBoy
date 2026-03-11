# Wave Interference — Issues and Conflicts

## WARN [STANDARDS] — Parameter Keys Use Underscore Notation

**Location:** `SCRIPT_CONFIG.parameters` — keys `phi_r1`, `phi_r2`, `phi_x1`, `phi_x2`, `phi_y1`, `phi_y2`, `wave_r1`, `wave_r2`, `wave_x1`, `wave_x2`, `wave_y1`, `wave_y2`.

**Rule:** `code-standards.md` §Parameter Naming: all parameter keys must be camelCase.

**Impact:** Host normalisation, preset merging, and any system that assumes camelCase keys will mishandle these parameters.

**Fix:** Rename to `phiR1`, `phiR2`, `phiX1`, `phiX2`, `phiY1`, `phiY2`, `waveR1`, `waveR2`, `waveX1`, `waveX2`, `waveY1`, `waveY2` throughout `draw`, `computePixels`, and `animatableParams`.

---

## WARN [STANDARDS] — Inert canvasWidth / canvasHeight Parameters

**Location:** `SCRIPT_CONFIG.parameters` group "Canvas": `canvasWidth`, `canvasHeight`.

**Rule:** Parameters must affect the rendered output when changed.

**Issue:** The `draw` function reads `canvas.width` and `canvas.height` (the actual DOM canvas dimensions set by the host), not `params.canvasWidth` or `params.canvasHeight`. Changing these sliders has no effect on the rendered image.

**Fix:** Either (a) remove the Canvas parameter group, or (b) implement host support for dynamic canvas resizing driven by these parameters (requires `needsRebuild` or equivalent hook).

---

## WARN [STANDARDS] — Preset Format Uses Partial Objects

**Location:** `LANDMARKS` array — each entry is a partial set of param overrides, not a complete parameter map.

**Rule:** `code-standards.md` §Presets: presets must be full parameter snapshots.

**Issue:** The host must merge preset objects over defaults to produce a valid param set. If the host applies presets directly without merging, all unspecified parameters remain at their previous values, producing inconsistent results when switching presets.

**Fix:** Expand each LANDMARK to a full parameter map including all keys at their default or preset-specific values.

---

## WARN [PARITY] — Binary Thresholding Not Implemented

**Location:** `draw` function — normalisation and greyscale output.

**Legacy Spec (`wave-interference.md` §3):** Output is binary black/white based on sign of intensity: `value > 0 ? 255 : 0`.

**Live:** Output is continuous greyscale via min-max normalisation.

**Impact:** Visual output diverges from spec. This is a design change rather than a bug (greyscale is arguably more informative), but it is undocumented and marks a deliberate departure.

**Resolution options:** (a) Document greyscale as the new intended output and update spec; (b) Add a `threshold` toggle parameter to offer both modes.

---

## WARN [PARITY] — WebGL Rendering Not Implemented

**Location:** `SCRIPT_CONFIG`, `draw`.

**Legacy Spec (`wave-interference.md` §3, §4):** Primary rendering path is a WebGL fragment shader; CPU ImageData is the fallback.

**Live:** Only CPU ImageData path is implemented. At 512×512 and 60 FPS, main-thread performance may be insufficient without the Worker path.

**Impact:** Potential frame drops at 60 FPS with complex configurations on main thread.

**Mitigation already present:** `compute.worker: true` and `computePixels` provide an alternative to WebGL offloading; Worker execution is architecturally equivalent if the ComputeScheduler supports it.

---

## WARN [PARITY] — 18 Parameters Have No UI Controls

**Location:** `SCRIPT_CONFIG.parameters` — missing from all groups.

**Missing parameters with no UI slot:**

| Parameter | Functional | Group |
|---|---|---|
| `Or2` | ✓ | R Term 2 offset |
| `wave_r2` | ✓ | R Term 2 wave type |
| `prm1`, `prm2` | ✓ | R Modulation powers |
| `phi_rm1`, `phi_rm2` | ✓ | R Modulation phases |
| `Ox1`, `Ox2` | ✓ | X Term 1, 2 offsets |
| `wave_x1`, `wave_x2` | ✓ | X Term 1, 2 wave types |
| `pxm1`, `pxm2` | ✓ | X Modulation powers |
| `phi_xm1`, `phi_xm2` | ✓ | X Modulation phases |
| `Oy1`, `Oy2` | ✓ | Y Term 1, 2 offsets |
| `wave_y1`, `wave_y2` | ✓ | Y Term 1, 2 wave types |
| `pym1`, `pym2` | ✓ | Y Modulation powers |
| `phi_ym1`, `phi_ym2` | ✓ | Y Modulation phases |

All default to 0 or 1 (via `|| 0` / `|| 1` fallbacks) and are therefore latent but inaccessible to the user. **Fix:** Add missing sliders/radios to their respective groups.

---

## WARN [PARITY] — Modulation Formula Diverges From Spec

**Location:** `computeR`, `computeX`, `computeY`, `computePixels._R/_X/_Y`.

**Legacy Spec:** Modulation is `M · safePow(sin(frm1·r), prm1) · safePow(cos(frm2·r), prm2)` — a product of two independently-powered waves using sin and cos respectively.

**Live:** `M · (safePow(sin(frm1·r), prm1) + safePow(sin(frm2·r), prm2))` — a sum of two sin-only waves.

**Impact:** Different modulation character; cross-multiplication from the spec is absent. Presets from the legacy spec may not reproduce the intended visual output.

---

## WARN [PARITY] — Checkpoint and Sequence Animation Missing

**Location:** `SCRIPT_CONFIG.animation`.

**Legacy Spec (`wave-interference.md` §5):** The tool has a checkpoint save/load system and a sequence animation mode that interpolates between saved checkpoints.

**Live:** Neither checkpoints nor sequence animation are present. Only phase-parameter animation is supported via `animatableParams`.

**Impact:** Major interactive feature from the spec is absent.

---

## NOTE [STANDARDS] — console.log in Production Export

**Location:** Line 439: `console.log('✅ Wave Interference script loaded');`

**Rule:** Production scripts should not emit to the console.

**Fix:** Remove or gate behind a debug flag.

---

## NOTE [STANDARDS] — compute.idleDelay Uses Non-Standard Pattern

**Location:** `compute: { idleDelay: 200 }`.

**Issue:** `idleDelay` is listed as a ComputeScheduler hint per the source comment, but if ComputeScheduler does not support this field, it is silently ignored. This is architectural coupling without a contract.

**Risk:** Low — failure mode is silent no-op.
