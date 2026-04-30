# Defecated — Feature Parity

## Source Reference

- Live gen script: `assets/js/tools/generators/scripts/other/defecated.gen.js` v1.0.0
- Legacy tool: `assets/js/tools/generators/defecated-tool.js` — full ToolBase implementation (reference)

## Feature Status

| Feature | Status | Notes |
|---|---|---|
| Google Fonts cycling | PASS | 40 families loaded from CDN; Fisher-Yates shuffle per session |
| WebGL gooey blur shader | PASS | GLSL via `p.createShader`; 31×31 Gaussian + smoothstep threshold |
| Configurable text lines (1–3) | PARTIAL | Dropdown options (5 per line); free-text input not supported by SCRIPT_CONFIG |
| Power-curve morphology timing | PASS | Symmetric power-curve ease; `power` param 2–10 |
| Blur/threshold animation | PASS | `blurAmount = intensity × blurMax`; `threshold` lerped 0.5→0.3 |
| Offscreen buffer double-buffering | PASS | `gfx1`/`gfx2` swap on cycle completion |
| Canvas size modes (fit/fill/actual) | PARTIAL | WEBGL canvas centred at native 800×600; host viewport controls ineffective (documented limitation) |
| Debug overlay | PASS | `displayOptions` toggle; 2D graphics buffer for reliable text in WEBGL context |
| Parameter set | PASS | Text (3), Layout (3), Timing (2), Effect (1), Display (1) = 10 params; 4 presets |

## Architectural Barriers (Resolved or Residual)

| Barrier | Status |
|---|---|
| WebGL requirement | RESOLVED — p5Setup recreates canvas in WEBGL mode |
| Iframe isolation | RESOLVED — standard p5Setup/p5Draw pattern used |
| `text` input type | RESIDUAL — dropdown substitution in place; free-text not available |
| Non-deterministic animation | RESIDUAL — Math.random() + millis(); GIF/WebM export disabled |
| Google Fonts CDN | RESIDUAL — external dependency; no offline fallback |

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | param | single placeholder slider | reference/generators/defecated/source/defecated.gen.js:11-14 | minimal stub surface |
| R-02 | behaviour | black-canvas placeholder draw | reference/generators/defecated/source/defecated.gen.js:16-19 | no morph engine |
| R-03 | interaction | static script skeleton | reference/generators/defecated/source/defecated.gen.js:6-20 | no animation/export metadata |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | top-level-stmt | SCRIPT_CONFIG object | 6-20 | R-01, R-02, R-03 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | WebGL gooey shader morph pipeline | assets/js/tools/generators/scripts/other/defecated.gen.js:22-67,313-346 | Gaussian blur + threshold morph |
| L-02 | behaviour | font queue lifecycle + text sizing/render buffers | assets/js/tools/generators/scripts/other/defecated.gen.js:70-145,271-292,365-373 | 40-font cycle |
| L-03 | param | text/layout/timing/effect/display controls | assets/js/tools/generators/scripts/other/defecated.gen.js:166-211 | 10 controls |
| L-04 | interaction | infinite animation + presets + info/export metadata | assets/js/tools/generators/scripts/other/defecated.gen.js:156-164,202-247 | PNG only export path |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | placeholder slider | L-03 | diverged | defecated.gen.js:166-211 | stub control replaced by full parameter surface | user decision | P1 |
| R-02 | placeholder draw | L-01, L-02 | diverged | defecated.gen.js:22-145,313-346 | stub render replaced by shader/text morph engine | user decision | P1 |
| R-03 | static skeleton | L-04 | diverged | defecated.gen.js:156-164,202-247 | added presets/export/info/infinite runtime metadata | user decision | P1 |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Shader/font/timing helpers remain inlined in generator module

**Check 2 — Foundation usage**
- AnimationFoundation: host-driven p5 loop path
- GPUFoundation: not used (custom p5 WEBGL shader path)

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module
- MathematicalFoundation: sizing/timing maths inlined

**Check 4 — State scope smells**
- mutable runtime state on SCRIPT_CONFIG (`_fontQueue`, `_gfx*`, `_startTime`, etc.)

**Issues logged:** GEN-028, GEN-029, GEN-030, ARCH-032

### Performance Tier Audit

**Primary workload:** GPU fragment-shader blur kernel over 800x600 WebGL surface  
**Tier status:** no explicit adaptive scaling/worker path; workload is GPU-bound and bounded by fixed canvas size

**Issues logged:** none

### v4 issues logged

- GEN-028, GEN-029, GEN-030, ARCH-032, DOC-057, DOC-058

### v4 questions queued

- none (defecated turn)
