# Squares — Feature Parity

## Source Reference

- Live: `assets/js/tools/generators/scripts/other/squares.gen.js` v2.0.0
- Legacy spec: `reference/generators/squares/legacy-docs/squares.md`
- Audit: `reference/generators/squares/legacy-docs/squares-audit.md`

Audit verdict: "Complete — all patterns, transitions, effects, and timeline from reference implemented."

## Feature Comparison

| Feature | Status | Notes |
|---|---|---|
| 50×50 grid (2500 tiles) | PASS | Default; configurable 20–80 |
| 7 base patterns | PASS | All implemented as pure functions |
| 5 transition types | PASS | All implemented |
| 6 effect types | PASS | All 7 (including `none`) implemented |
| 240-second timeline (15 phases) | PASS | Timeline array complete and accurate |
| `gridSize` slider | PASS | 20–80, step 5 |
| `speed` slider | PASS | 0.5–3 |
| `seek` scrubber | FAIL | Declared; not wired into draw |
| Play/Pause control | PASS | Host transport |
| Keyboard controls (Space, R, H) | FAIL | Not implemented |
| Info/phase display overlay | PARTIAL | Host may surface phase name via status |
| Info hide toggle | FAIL | No toggle implemented |
| Export (PNG, GIF, WebM, sequence) | PASS | All four enabled in `export` block |
| Pre-render support (`canPrerender`) | PASS | Flag set; `frame` parameter correct |

## Parameters

| key | Spec | Live | Status |
|---|---|---|---|
| `gridSize` | slider 10–100 | slider 20–80 | PARTIAL (narrower range) |
| `speed` | slider 0.5–2 | slider 0.5–3 | PARTIAL (wider range) |
| `seek` | slider 0–240 | declared, inert | FAIL |
| `canvasWidth` | not in spec | present, inert | NEW (inert) |
| `canvasHeight` | not in spec | present, inert | NEW (inert) |

## Summary

Core animation content achieves full parity. Seek scrubber, keyboard controls, and info toggle are the three outstanding gaps identified in the original audit. The `gridSize` range was narrowed (min 20 vs spec 10) and speed range widened (max 3 vs spec 2), both minor divergences.
