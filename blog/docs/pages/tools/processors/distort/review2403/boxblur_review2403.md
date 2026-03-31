# BOX BLUR — Review 2403

- type: `boxblur`
- category: BLUR
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Applies a box blur with configurable radius and number of passes | — |
| 1.2 | Visually distinct from all other BLUR modules? | YES — box blur is distinct from gaussian, motion, radial, median, bilateral | — |
| 1.3 | Verdict | KEEP | — |

## Section 5 — Performance

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 5.1 | Cost-scaling params? | YES — RADIUS and PASSES both scale render cost | — |
| 5.3 | Render cost class? | SLOW — performance is notably poor at higher radius/pass values | WARN |

## Issues

```
[WARN] [PERFORMANCE] Module is slow at high radius/pass values
Location: nodes/boxblur — RADIUS and PASSES params
Evidence: User observed noticeably slow render performance.
Impact: Poor interactivity in PREVIEW mode at high params; FULL render times excessive.
Action: Investigate optimisation — box blur is separable (H+V passes) and should be O(n) regardless of radius. Confirm implementation uses separable passes; if not, rewrite. Set appropriate previewMax on RADIUS and PASSES.
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on all params
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation inaccessible.
```

## Action Items

1. Audit box blur implementation — confirm it uses separable H+V passes (O(n) complexity, radius-independent). Rewrite if not.
2. Set previewMax on RADIUS and PASSES to cap preview render cost.
3. Fix +D driver button (global — tracked in `_global_issues.md` G1).
4. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
