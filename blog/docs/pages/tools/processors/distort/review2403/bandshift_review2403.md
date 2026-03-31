# BAND SHIFT — Review 2403

- type: `bandshift`
- category: WARP
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Divides the image into horizontal/vertical bands and shifts each band laterally — displacement pattern determined by mode (sine, noise, stepped) | — |
| 1.2 | Visually distinct from all other WARP modules? | YES — banded row/column displacement is distinct from flow field and advection | — |
| 1.3 | Verdict | KEEP | — |

## Issues

```
[ERROR] [BUG] NOISE mode output is broken — amplitude param has no coherent reference unit
Location: nodes/bandshift — NOISE mode, AMPLITUDE param
Evidence: Noise mode produces weird output; amplitude has no defined unit (e.g. pixels). "Intensity of 100" has no documented or intuitive meaning.
Impact: NOISE mode is effectively unusable — user cannot predict or control output.
Required: Define AMPLITUDE in pixels. Document or fix noise type used (Perlin? simplex? white?). Expose noise TYPE as a param if multiple are used.
```

```
[ERROR] [BUG] STEPPED mode output is a mess — params do not produce intelligible output
Location: nodes/bandshift — STEPPED mode
Evidence: Stepped mode produces incoherent output; user cannot determine what any param controls.
Impact: STEPPED mode is non-functional from a usability standpoint.
Required: Audit stepped mode implementation — define clear param semantics (step count, step size, offset) and fix output.
```

```
[WARN] [STANDARDS] Param semantics are unclear across modes — no unit labels, no tooltips
Location: nodes/bandshift — all params
Evidence: User cannot determine what params control what, or what units they operate in.
Impact: Module is confusing and unreliable outside SINE mode.
Required: Label params with units (px, degrees, etc.), add mode-specific param visibility, and document each param's effect.
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on all params
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation inaccessible.
```

## Action Items

1. **[HIGH PRIORITY]** Fix NOISE mode — define AMPLITUDE in pixels, specify and expose noise type, fix output.
2. **[HIGH PRIORITY]** Fix STEPPED mode — audit implementation, define clear param semantics, fix incoherent output.
3. Add unit labels to all params (px, steps, etc.).
4. Implement mode-conditional param visibility — show only relevant params per mode.
5. Fix +D driver button (global — tracked in `_global_issues.md` G1).
6. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
7. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
