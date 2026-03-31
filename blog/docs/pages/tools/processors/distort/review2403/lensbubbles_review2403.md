# LENS BUBBLES — Review 2403

- type: `lensbubbles`
- category: REFRACTION
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Places lens-like bubbles across the image that locally distort pixels as if viewed through a convex lens | — |
| 1.2 | Visually distinct from all other REFRACTION modules? | YES — discrete bubble lenses are distinct from ripple wave distortion | — |
| 1.3 | Verdict | KEEP | — |

## Issues

```
[WARN] [PARITY] No control over bubble position noise — missing seed, translation, and noise params
Location: nodes/lensbubbles — param set
Evidence: Bubble positions are determined by internal noise but no seed, translation offset, or noise scale params are exposed. Cannot reproduce a specific arrangement or explore variations.
Impact: Bubble placement is fixed and uncontrollable; no way to reposition bubbles or get variation.
Required: Add SEED (integer), OFFSET X (slider), OFFSET Y (slider), and NOISE SCALE (slider) params to control bubble position distribution.
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on all params
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation inaccessible.
```

## Action Items

1. Add SEED param (integer) for bubble position noise.
2. Add OFFSET X and OFFSET Y params (sliders, in pixels) for translation of bubble field.
3. Add NOISE SCALE param (slider) to control bubble position distribution density.
4. Fix +D driver button (global — tracked in `_global_issues.md` G1).
5. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
6. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
