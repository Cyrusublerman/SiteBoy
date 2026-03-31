# RADIAL BLUR — Review 2403

- type: `radialblur`
- category: BLUR
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Applies a radial zoom blur emanating from a centre point, with configurable parameters | — |
| 1.2 | Visually distinct from all other BLUR modules? | YES — radial/zoom blur is distinct from all other blur types | — |
| 1.3 | Verdict | KEEP | — |

## Notes

Fast-tracked — module functional. One UX improvement identified.

See `_global_issues.md` G4 — candidate for consolidation into a single BLUR module with modes.

## Issues

```
[NOTE] [PARITY] No canvas-click centre point picker
Location: nodes/radialblur — centre point param
Evidence: User request: ability to set the blur centre by clicking a button then clicking a point directly on the canvas, rather than adjusting numeric X/Y params.
Impact: Positioning the blur centre is imprecise and slow with sliders alone; canvas pick would be significantly more usable.
Required: Add a "PICK CENTRE" button that activates a canvas click-to-set interaction for the centre point coordinates.
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on all params
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation inaccessible.
```

## Action Items

1. Add PICK CENTRE canvas interaction — button in NodePanel activates click-to-set mode on the viewport canvas; click sets centre X/Y coords.
2. Fix +D driver button (global — tracked in `_global_issues.md` G1).
3. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
4. Consider consolidation into unified BLUR module (global — tracked in `_global_issues.md` G4).
