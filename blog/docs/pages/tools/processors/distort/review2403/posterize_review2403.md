# POSTERIZE — Review 2403

- type: `posterize`
- category: COLOUR / TONE
- isVector: false
- verdict: MERGE(quantise)
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Reduces tonal levels per channel — posterisation via a LEVELS param only | — |
| 1.2 | Visually distinct from all other COLOUR/TONE modules? | NO — posterisation is a subset of quantisation; should be a mode within QUANTISE | — |
| 1.3 | Verdict | MERGE(quantise) | — |

## Issues

```
[ERROR] [PARITY] Posterise is missing per-channel control
Location: nodes/posterize — param set
Evidence: Only a single LEVELS param exists. No ability to posterise R, G, B independently or H, S, L independently.
Impact: Cannot achieve partial posterisation (e.g. posterise only hue while leaving saturation/lightness continuous).
Required (as part of QUANTISE merge): per-channel levels control across RGB and HSL colour spaces.
```

```
[WARN] [STANDARDS] Standalone module is redundant — posterisation is a mode of quantisation
Location: nodes/posterize — CategoryPicker entry
Evidence: User decision: merge into QUANTISE as a posterise mode with per-channel (R/G/B or H/S/L) level control.
Impact: Unnecessary module proliferation.
```

## Action Items

1. Remove posterize as a standalone module.
2. Add POSTERIZE mode to QUANTISE module with the following per-channel params:
   - MODE selector: RGB / HSL
   - Per-channel level sliders (e.g. R LEVELS, G LEVELS, B LEVELS — or H LEVELS, S LEVELS, L LEVELS depending on mode).
