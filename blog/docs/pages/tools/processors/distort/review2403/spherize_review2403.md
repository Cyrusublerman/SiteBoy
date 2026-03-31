# SPHERIZE — Review 2403

- type: `spherize`
- category: DISTORTION
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Distorts the image as if mapped onto a sphere — creates a large bubble/bulge effect | — |
| 1.2 | Visually distinct from all other DISTORTION modules? | YES | — |
| 1.3 | Verdict | KEEP | — |

## Issues

```
[WARN] [PARITY] AMOUNT param maximum is too low
Location: nodes/spherize — AMOUNT param
Evidence: User requires higher amount values to achieve stronger spherical distortion.
Impact: Creative range is artificially limited; maximum distortion is insufficient.
Required: Increase AMOUNT param maximum range.
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on all params
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation inaccessible.
```

## Action Items

1. Increase AMOUNT param maximum to allow stronger spherical distortion.
2. Fix +D driver button (global — tracked in `_global_issues.md` G1).
3. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
4. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
