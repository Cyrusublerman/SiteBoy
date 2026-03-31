# GAUSS BLUR — Review 2403

- type: `gaussblur`
- category: BLUR
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Applies a Gaussian blur — smooth, natural-looking blur with a bell-curve weighted kernel | — |
| 1.2 | Visually distinct from all other BLUR modules? | YES — Gaussian blur is perceptually distinct from box, motion, radial, median, bilateral | — |
| 1.3 | Verdict | KEEP | — |

## Section 5 — Performance

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 5.1 | Cost-scaling params? | YES — RADIUS (or SIGMA) scales render cost | — |
| 5.3 | Render cost class? | SLOW — performance is notably poor at higher values | WARN |

## Notes

Fast-tracked — module functional. Algorithm unverified by user (no source access); assumed Gaussian from name and output.

See `_global_issues.md` G4 — candidate for consolidation into a single BLUR module with modes.

## Issues

```
[WARN] [PERFORMANCE] Module is slow at high radius/sigma values
Location: nodes/gaussblur — radius param
Evidence: User observed noticeably slow render performance.
Impact: Poor interactivity at high params.
Action: Confirm implementation uses separable 1D Gaussian kernel passes (O(n·r) not O(n·r²)). Set appropriate previewMax on radius param.
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on all params
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation inaccessible.
```

## Action Items

1. Verify implementation uses separable 1D Gaussian kernel (not 2D convolution). Rewrite if not.
2. Set previewMax on radius/sigma param to cap preview render cost.
3. Fix +D driver button (global — tracked in `_global_issues.md` G1).
4. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
5. Consider consolidation into unified BLUR module (global — tracked in `_global_issues.md` G4).
