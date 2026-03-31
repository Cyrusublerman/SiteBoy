# FLOW FIELD — Review 2403

- type: `flowfield`
- category: WARP
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Uses Perlin noise to generate a flow field, then warps/distorts the image along that field | — |
| 1.2 | Visually distinct from all other WARP modules? | YES — Perlin-driven flow field warp is distinct from band shift and advection | — |
| 1.3 | Verdict | KEEP | — |

## Issues

```
[WARN] [PARITY] No seed control for Perlin noise
Location: nodes/flowfield — param set
Evidence: Module appears to use Perlin noise internally but exposes no SEED param. Every render produces the same flow field with no way to get variation.
Impact: No randomisation or reproducibility control; cannot explore different flow field configurations.
Required: Add SEED (integer input or slider) param to control Perlin noise seed.
```

```
[NOTE] [PARITY] No octave/layer control for Perlin noise
Location: nodes/flowfield — param set
Evidence: Perlin noise complexity (number of octaves/layers) is not exposed. More octaves produce richer, more detailed flow fields.
Required: Add OCTAVES (slider, integer) param to control noise layer count.
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on all params
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation inaccessible.
```

## Action Items

1. Add SEED param (integer) to Perlin noise generator.
2. Add OCTAVES param (integer slider) to control noise layer count.
3. Fix +D driver button (global — tracked in `_global_issues.md` G1).
4. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
5. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
