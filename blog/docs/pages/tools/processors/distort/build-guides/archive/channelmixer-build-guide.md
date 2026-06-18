# CHANNELMIXER — Build Guide

- module: channelmixer
- node: ChannelMixerNode.js
- category: COLOUR / TONE
- review verdict: KEEP
- rebuild severity: MINOR

## Current State Summary

Current file: `assets/js/tools/processors/distort/nodes/colour/ChannelMixerNode.js`

20 lines. Uses `createEffectModule` factory. Imports `channelMix` from the shared algorithm layer. Declares nine range params (`rr`…`bb`) covering the full 3×3 matrix. All params carry `driveable: true` and `unit: 'n'`. The `apply()` signature is `apply(src, dst, w, h, p)` — five arguments, omitting `ctx` and `modulate`.

The module is functionally correct. The 3×3 matrix multiplication is fully delegated to `channelMix`; default values form the identity matrix; output is clamped inside `channelMix`. No architectural violations are present. The module is registered correctly in `registry.js` under `'COLOUR / TONE'` with label `'CHANNEL MIXER'` and a correct description.

The reference source (`reference/distort/channelmixer/source/ChannelMixerNode.js`) is identical to the current implementation except the reference source has no `driveable` or `unit` fields on any param — the current implementation is ahead of the reference on those fields.

## Reference Parity Gaps

**Current implementation vs reference source:**

| Key | Ref value | Current value | Gap |
|-----|-----------|---------------|-----|
| All params — `driveable` | absent | `true` | Current is ahead of ref — improvement, not a gap |
| All params — `unit` | absent | `'n'` | Current is ahead of ref — improvement, not a gap |
| `apply()` signature | `apply(src, dst, w, h, p)` | `apply(src, dst, w, h, p)` | identical |
| `type` | `'channelmixer'` | `'channelmixer'` | identical |
| `name` | `'CHANNEL MIXER'` | `'CHANNEL MIXER'` | identical |
| `category` | `'COLOUR / TONE'` | `'COLOUR / TONE'` | identical |

**Structural gap inherited from reference (not introduced by current implementation):**

The reference source — and therefore the current file — omits `ctx` and `modulate` from the `apply()` signature. The `EffectNode` base class signature is `apply(src, dst, w, h, ctx)`. The factory standard documented in `issues-and-conflicts.md` is `apply(src, dst, w, h, p, ctx, modulate)`. This omission exists in both the reference and the current file; the current file did not regress from the reference.

## Review Spec Gaps

Review (`channelmixer_review2403.md`) verdict: KEEP. Fast-tracked. Two action items:

1. Fix +D driver button (G1 — global, tracked separately).
2. Audit all params for `driveable: true` (G2 — global).

**Status of action items against current file:**

| Action | Status |
|--------|--------|
| G1 — +D driver button fix | Not a module-level change. NodePanel fix required globally. |
| G2 — `driveable: true` on all range params | **Already satisfied.** All nine params carry `driveable: true`. |

No module-specific review gaps remain. The G2 requirement is met. The G1 bug is a NodePanel infrastructure issue, not addressable in this file.

## Missing Parameters

**Vs. ui-layout.md spec:** The ui-layout.md table specifies `driveable: no` for all nine params. The current implementation has `driveable: true` on all nine. This is a **beneficial deviation** — the ui-layout.md reflects the reference state, which predates the G2 requirement. The current state is correct per the review action items.

**No parameters are missing.** All nine matrix coefficients (`rr`, `rg`, `rb`, `gr`, `gg`, `gb`, `br`, `bg`, `bb`) are present with correct keys, labels, types, ranges, steps, defaults, and tiers.

## Extra/Incorrect Parameters

None. The nine params are the complete and correct set. No extraneous keys are declared.

## UI Compliance Issues

| Check | Status | Detail |
|-------|--------|--------|
| Registry entry present | pass | `registry.js` line 113 |
| Registry `type` | pass | `'channelmixer'` |
| Registry `label` | pass | `'CHANNEL MIXER'` — all caps, correct |
| Registry `description` | pass | Accurate prose description present |
| Node `name` | pass | `'CHANNEL MIXER'` |
| Node `category` | pass | `'COLOUR / TONE'` |
| Param labels — casing | pass | All labels use `A→B` arrow notation, uppercase letters (`R→R`, `G→R`, etc.) |
| Param labels — glyph | **review required** | `→` (U+2192 RIGHTWARDS ARROW) used. Semiotics guide must be read before confirming this is the correct glyph. No substitution made here — flagged for verification only. |
| `unit: 'n'` on all range params | present | All nine params carry `unit: 'n'` (normalised). Satisfies G16 intent for unitless normalised coefficients. |
| `driveable: true` on all range params | pass | All nine params carry `driveable: true`. Satisfies G2. |
| Tier assignments | pass | Tier 3 = output red row (`rr`, `rg`, `rb`); tier 4 = output green (`gr`, `gg`, `gb`); tier 5 = output blue (`br`, `bg`, `bb`). Correct per spec. |
| No mode-conditional params | pass | No MODE param; G14 does not apply. |
| No extra internal blend mode param | pass | G15 does not apply. |
| `isVector: false` | pass | Review confirms `isVector: false`; G7 / G10 do not apply. |
| No time/iteration state | pass | G9 does not apply. |
| No centre X/Y params | pass | G6 does not apply. |

## Global Issues

Applicability assessed against the current module:

| Issue | Applies | Action for this module |
|-------|---------|------------------------|
| G1 — +D button non-functional | **Yes** | No module-level fix possible. NodePanel event handler must be repaired globally. Verify +D button works on channelmixer params once G1 is resolved. |
| G2 — All numeric params must have `driveable: true` | **Resolved** | All nine range params already carry `driveable: true`. No change needed. |
| G5 — Slider direct input + double-click-to-default | **Yes** | No module-level fix. Slider component must be updated globally. All nine channelmixer params are slider+number type and will benefit when G5 is resolved. |
| G6 — Canvas click-to-pick for centre point params | Not applicable | No centre X/Y params in this module. |
| G7 — Vector module identifiability | Not applicable | `isVector: false`; pixel-output module. |
| G9 — Time/iteration modules need FRAME param | Not applicable | No temporal state. |
| G10 — Vector modules need SVG export | Not applicable | Pixel-output module. |
| G11 — Shared components for overlapping feature additions | **Conditionally** | No features requiring new shared components are pending for this module. If per-pixel driver wiring is added to `apply()`, the modulation pattern must follow the shared `getModulated()` contract on `EffectNode`, not a bespoke implementation. |
| G12 — Web worker for expensive modules | Not applicable | Cost class A (trivial per-pixel arithmetic). O(n) with no neighbourhood access. No worker optimisation warranted. |
| G14 — Mode-conditional param hiding | Not applicable | No MODE param. |
| G16 — Numeric params must display units | **Yes** | `unit: 'n'` is declared on all nine params. This satisfies the data contract. Whether the NodePanel renderer displays units is a global rendering concern; no module-level change needed beyond what is present. |

## Merge Absorption

The current implementation is **ahead** of the reference source on two fields (`driveable`, `unit`). No rollback to the reference state is warranted. The reference source is the pre-G2 snapshot; the current file correctly reflects post-G2 requirements.

No changes from other module reviews or global issue resolutions are pending absorption into this file, except:

- When G1 (driver button) is resolved globally, verify that per-pixel modulation paths work correctly for this module's nine params.
- If `apply()` signature is standardised to `apply(src, dst, w, h, p, ctx, modulate)` globally (as required by the factory standard documented in `issues-and-conflicts.md`), this module must be updated to accept and use the `ctx` and `modulate` arguments — passing modulated values to `channelMix` rather than `p` directly. This is the single substantive code change required.

## Required Changes (priority ordered)

### P1 — Extend `apply()` signature to include `ctx` and `modulate` [MODERATE — CROSS-CUTTING]

**File:** `assets/js/tools/processors/distort/nodes/colour/ChannelMixerNode.js`

**Current:**
```js
apply(src, dst, w, h, p) {
  dst.set(channelMix(src, w, h, p));
}
```

**Required:** The factory standard signature is `apply(src, dst, w, h, p, ctx, modulate)`. With `driveable: true` on all nine params, the pipeline may provide per-pixel modulation data. Without `ctx` and `modulate` in the signature, modulation is silently discarded and `getModulated()` cannot be called.

The corrected pattern (applied per other modules that use per-pixel modulation) would resolve each of the nine matrix coefficients via `getModulated()` before passing them to `channelMix`. However: `channelMix` accepts the entire `p` object and applies a single matrix to all pixels. To support per-pixel modulation, `channelMix` would need to be called per-pixel with per-pixel resolved values — or the per-pixel loop must be moved into `apply()` directly.

**Precondition:** This change must be coordinated with the shared algorithm layer. If `channelMix` is not modified to accept per-pixel coefficient arrays, the simplest correct implementation is to accept `ctx` and `modulate` in the signature but call `channelMix` with the base (non-modulated) params until per-pixel modulation support is added to the algorithm layer. This makes the signature correct without breaking existing behaviour.

**Immediate action (signature fix only):**
```js
apply(src, dst, w, h, p, ctx, modulate) {
  dst.set(channelMix(src, w, h, p));
}
```

**Full action (per-pixel modulation, deferred until algorithm layer supports it):** Resolve each of `rr`, `rg`, `rb`, `gr`, `gg`, `gb`, `br`, `bg`, `bb` via `this.getModulated(key, pixelIdx, ctx)` per pixel. Requires `channelMix` or an inline pixel loop.

### P2 — Verify `→` glyph against semiotics guide [MINOR — VERIFICATION ONLY]

**File:** `assets/js/tools/processors/distort/nodes/colour/ChannelMixerNode.js` — param labels.

Read `blog/docs/guides/standards/semiotics.md` before any label change. If the guide specifies a different arrow glyph for directional channel relationships, update all nine labels to match. If `→` (U+2192) is the specified glyph, no change is needed.

### P3 — No other module-level changes required

G1, G5, G7, G9, G10, G12, G13, G14, G15, G16 are either not applicable or are global infrastructure issues not addressable in this file.

## Verification Criteria

After implementing P1 (signature fix):

1. `apply()` declares seven arguments: `(src, dst, w, h, p, ctx, modulate)`.
2. Existing behaviour is unchanged: `dst.set(channelMix(src, w, h, p))` still executes correctly for non-modulated use.
3. No linter errors introduced.
4. Module still registers correctly under `'COLOUR / TONE'` in `registry.js`.
5. All nine params retain `driveable: true` and `unit: 'n'`.
6. Once G1 is resolved globally: clicking +D on any channelmixer param opens the driver settings panel. Confirm for at least `rr`, `gg`, `bb` (diagonal entries most likely to be used as luminance drivers).
7. Once G5 is resolved globally: clicking the numeric value field on any channelmixer param accepts keyboard input; double-clicking resets to the param default.
8. Identity matrix (all defaults) produces no visible change to the output image.
9. A non-identity matrix (e.g. `rg: 1`) produces a visually correct channel shift.
