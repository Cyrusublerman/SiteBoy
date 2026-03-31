# MEDIAN — Review 2403

- type: `median`
- category: BLUR
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Applies a median blur — replaces each pixel with the median value of its neighbourhood, effective for noise removal while preserving edges | — |
| 1.2 | Visually distinct from all other BLUR modules? | YES — median blur has distinct edge-preserving noise-reduction characteristics | — |
| 1.3 | Verdict | KEEP | — |

## Section 5 — Performance

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 5.1 | Cost-scaling params? | YES — kernel radius scales cost significantly (median sort is O(r²) per pixel) | — |
| 5.3 | Render cost class? | SLOW — noted as a bit slow | WARN |

## Notes

Fast-tracked — module functional. Performance is inherently expensive for median operations.

See `_global_issues.md` G4 — candidate for consolidation into a single BLUR module with modes.

## Issues

```
[WARN] [PERFORMANCE] Median blur is inherently expensive at larger radii
Location: nodes/median — radius param
Evidence: User noted module is a bit slow.
Impact: Poor interactivity at larger kernel sizes.
Action: Set previewMax on radius param. Consider approximation strategies (e.g. histogram-based median) for larger radii.
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on all params
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation inaccessible.
```

## Action Items

1. Set previewMax on radius param to cap preview render cost.
2. Investigate histogram-based median approximation for large radius values.
3. Fix +D driver button (global — tracked in `_global_issues.md` G1).
4. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
5. Consider consolidation into unified BLUR module (global — tracked in `_global_issues.md` G4).
