# INVERT — Review 2403

- type: `invert`
- category: COLOUR / TONE
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Inverts the image (negates all pixel values) | — |
| 1.2 | Visually distinct from all other COLOUR/TONE modules? | YES — unique destructive inversion operation | — |
| 1.3 | Verdict | KEEP | — |

## Notes

Fast-tracked — module functional. One missing feature identified.

## Issues

```
[NOTE] [PARITY] No independent invert-luminosity vs invert-colour control
Location: nodes/invert — param set
Evidence: User request: ability to invert luminosity and colour independently (e.g. invert hue only, or invert lightness only).
Impact: Module is limited to full inversion only; selective channel inversion is not possible.
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on all params
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation inaccessible.
```

## Action Items

1. Add separate toggle or mode param: invert LUMINOSITY only / invert COLOUR (hue) only / invert ALL.
2. Fix +D driver button (global — tracked in `_global_issues.md` G1).
3. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
