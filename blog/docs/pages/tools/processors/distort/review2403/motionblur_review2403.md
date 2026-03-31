# MOTION BLUR — Review 2403

- type: `motionblur`
- category: BLUR
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Applies a directional blur — smears pixels along a preferred direction/angle | — |
| 1.2 | Visually distinct from all other BLUR modules? | YES — directional smear is distinct from isotropic blurs | — |
| 1.3 | Verdict | KEEP | — |

## Notes

Fast-tracked — module functional. One missing feature identified.

See `_global_issues.md` G4 — candidate for consolidation into a single BLUR module with modes.

## Issues

```
[NOTE] [PARITY] No directional weighting/anisotropy control
Location: nodes/motionblur — param set
Evidence: User request: ability to control how strongly the blur prefers the set direction vs spreading isotropically — i.e. an anisotropy or directionality strength param.
Impact: Blur is either fully directional or not; no control over the ratio between directional and isotropic spread.
Required: Add ANISOTROPY (slider) param — 0 = fully isotropic, 1 = fully directional along the set angle.
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on all params
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation inaccessible.
```

## Action Items

1. Add ANISOTROPY (slider) param to control directional preference strength (0 = isotropic, 1 = fully directional).
2. Fix +D driver button (global — tracked in `_global_issues.md` G1).
3. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
4. Consider consolidation into unified BLUR module (global — tracked in `_global_issues.md` G4).
