# BILATERAL — Review 2403

- type: `bilateral`
- category: BLUR
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Applies a bilateral filter — edge-preserving blur that smooths regions while maintaining sharp edges by weighting on both spatial distance and colour similarity | — |
| 1.2 | Visually distinct from all other BLUR modules? | YES — edge-preserving bilateral is distinct from all other blur modes | — |
| 1.3 | Verdict | KEEP | — |

## Issues

```
[ERROR] [BUG] Module does not finish rendering — hangs or times out
Location: nodes/bilateral — render pipeline
Evidence: User tested module; render never completes. Module is entirely non-functional.
Impact: Module is unusable in its current state. Likely cause: O(n·r²) bilateral filter with no early exit, previewMax cap, or worker timeout handling — render blocks indefinitely at any non-trivial radius.
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on all params
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation inaccessible.
```

## Action Items

1. **[CRITICAL]** Investigate bilateral render hang — add worker timeout, previewMax radius cap, and/or approximate bilateral implementation (e.g. use a small fixed kernel or fast bilateral approximation).
2. Set previewMax on all cost-scaling params to prevent hang in preview mode.
3. Fix +D driver button (global — tracked in `_global_issues.md` G1).
4. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
5. Consider consolidation into unified BLUR module (global — tracked in `_global_issues.md` G4).
