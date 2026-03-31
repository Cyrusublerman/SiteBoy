# ADVECTION — Review 2403

- type: `advection`
- category: WARP
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Uses noise or pattern layers as vector fields (analogous to flow fields) to advect/warp the image — exact internal mechanism unclear from output alone | — |
| 1.2 | Visually distinct from all other WARP modules? | YES — produces a distinct warping effect not replicated by flowfield or bandshift | — |
| 1.3 | Verdict | KEEP | — |

## Issues

```
[NOTE] [PARITY] Module purpose and param semantics are not clearly communicated
Location: nodes/advection — param set and module description
Evidence: User is unsure what the module is intended to do — output is interesting but mechanism is opaque. Params do not clearly indicate what vector source is being used or how advection steps work.
Impact: Module is hard to use intentionally; creative control is limited by lack of clarity.
Required: Document module purpose clearly. Label params with meaningful names and units.
```

```
[NOTE] [PARITY] No image-based vector source option
Location: nodes/advection — vector source param
Evidence: User request: ability to drive advection vectors from the source image's luminosity (or other image property), or from an uploaded modulation image.
Impact: Advection is currently limited to internal noise/pattern sources; image-reactive warping is not possible.
Required: Add VECTOR SOURCE dropdown: INTERNAL NOISE / IMAGE LUMINOSITY / UPLOADED IMAGE. When UPLOADED IMAGE selected, expose image upload input.
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on all params
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation inaccessible.
```

## Action Items

1. Document module purpose and param semantics clearly — what is the vector source, what do each of the params control, what units are used.
2. Add VECTOR SOURCE param: INTERNAL NOISE / IMAGE LUMINOSITY / UPLOADED IMAGE.
3. Implement uploaded modulation image input for vector source.
4. Fix +D driver button (global — tracked in `_global_issues.md` G1).
5. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
6. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
