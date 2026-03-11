# Issue Flagging Guide

Every problem, gap, or non-compliance found during a generator's documentation must be recorded in `issues-and-conflicts.md` using the format defined here. Issues are flagged only — generator code is not rewritten in the documentation programme. Fixes are tracked by the issue record; a separate implementation task resolves them.

---

## 1. Severity Taxonomy

Every issue has exactly one severity.

| Severity | Meaning |
| --- | --- |
| `ERROR` | The code will cause a runtime fault, produce silently wrong output, or break the host's animation/rendering contract. Must be fixed before the generator can be trusted in production. |
| `WARN` | The code violates a site standard or best practice but is not immediately broken. Should be fixed but does not block use. |
| `NOTE` | A gap, ambiguity, parity hole, or escalation candidate that needs attention but is not a standards violation. Informational. |

When in doubt between ERROR and WARN: if the problem causes observable wrong behaviour, it is ERROR. If it causes a standards violation but the generator still works, it is WARN.

---

## 2. Record Format

Every issue must use this exact format:

```
[SEVERITY] [CATEGORY] Short description (one line)
Location: <function name, method name, or line-level description in the source>
Evidence: <exact quote from source, or precise paraphrase with enough detail to locate the issue>
Impact: <what goes wrong, what is missing, or what standards rule is violated>
```

**Example:**

```
[ERROR] [BUG] Division by zero not guarded in _resolveVelocity
Location: _resolveVelocity — `const dvn = ... / (sp1 + sp2 + 0.001)`
Evidence: `(sp1 + sp2 + 0.001)` — the `+ 0.001` guard exists here, but the
  separation step at `_separate` divides by `d` without a zero guard:
  `const nx = dx / d, ny = dy / d;` where d could be 0 if two circles
  occupy exactly the same position.
Impact: NaN propagated into circle positions if two circles are co-located,
  causing the circle to disappear or the simulation to break.
```

The "Location" field should be specific enough that someone who has not read the source can find the relevant code in under 30 seconds.

---

## 3. Categories

Use one of the following category tags per issue:

| Category tag | Use for |
| --- | --- |
| `[BUG]` | Logic errors, division by zero, off-by-one, unbounded growth, wrong formula |
| `[STANDARDS]` | Violations of `build-page.md`, `code-standards.md`, `design-law.md`, or `p5-generator-standards.md` |
| `[PERFORMANCE]` | Algorithmic complexity concerns, per-frame allocations, main-thread blocking |
| `[PARITY]` | Features described in legacy docs that are absent or changed in the live source |
| `[ESCALATION]` | Algorithms or UI patterns that should be in the shared library but are implemented inline |
| `[CONFLICT]` | Direct contradiction between two inputs (e.g. spec says one thing, source does another) |

---

## 4. Standards Violations

### 4.1 p5 generator violations

These apply to all generators with `canvas.context: 'p5'`.

| Issue | Severity | Evidence pattern |
| --- | --- | --- |
| `p.noLoop()` not called in `p5Setup` | ERROR | Search `p5Setup` for `p.noLoop()` — absent |
| `p.createCanvas()` called | WARN | Search source for `createCanvas` |
| `p.loop()` called internally | ERROR | Search source for `.loop()` |
| Internal `requestAnimationFrame` / `setInterval` | ERROR | Search source for `requestAnimationFrame`, `setInterval`, `setTimeout` |
| Internal frame counter instead of `frame` argument | WARN | Look for `let frame = 0; frame++` or equivalent in `p5Draw` scope |
| Non-deterministic output in animated generator | WARN | `Math.random()` or `p.random()` in `p5Draw` without seeded RNG |

### 4.2 All generator violations

| Issue | Severity | Evidence pattern |
| --- | --- | --- |
| DOM access | WARN | `document.`, `window.`, `.innerHTML`, `.createElement`, `.appendChild` |
| Non-VGA colour without justification | WARN | `p.fill(r, g, b)` with arbitrary RGB not in VGA table; `p.stroke('#hex')` with non-VGA hex |
| Inline algorithm that exists in library | WARN | Implementation of noise, marching squares, Delaunay, etc. already in `assets/js/shared/algorithms/` |
| Module-level mutable state, undocumented | NOTE | `let x = []` or `var x = {}` at module level, mutated in render hooks |
| No `destroy()` or cleanup when state exists | WARN | Generator has `this.*` timers, event listeners, or audio contexts without cleanup |
| Parameter key not used in render | WARN | Key appears in `parameters` but never in `p5Draw` or `draw` |

---

## 5. Bug Patterns

### 5.1 Division by zero

**Pattern:** a denominator that can legitimately reach zero under valid parameter values or simulation states.

```javascript
// Risk: if d === 0 (two circles co-located), nx and ny become NaN
const nx = dx / d, ny = dy / d;

// Correct guard:
if (d === 0) return false;
const nx = dx / d, ny = dy / d;
```

**Severity:** ERROR if the zero case can realistically occur; WARN if it is only a theoretical edge case that normal parameter values never trigger.

### 5.2 Unbounded array growth

**Pattern:** `.push()` inside a per-frame loop without a corresponding bound check.

```javascript
// Risk: trail grows without bound if params.trailLength is 0 or the check is absent
c.trail.push({ x: c.x, y: c.y });
// Correct: must be followed by a length check
if (c.trail.length > params.trailLength) c.trail.shift();
```

If the length check exists but uses `>=` vs `>` inconsistently with how the trail is consumed, that is a NOTE (possible off-by-one, not immediately broken).

**Severity:** ERROR if no bound check exists; NOTE if the bound check is present but may be off-by-one.

### 5.3 State not reset on rebuild

**Pattern:** a `this.*` variable initialised in setup but not re-initialised when a rebuild is triggered by a param change.

**Detection:** identify the rebuild mechanism (Step 0.5 of `document-generator.md`). List all `this.*` variables initialised in `p5Setup` or `_buildX`. Check whether each is also re-set inside the rebuild branch. Any variable set in setup but not in the rebuild branch is a candidate for this bug.

**Severity:** ERROR if the stale state causes visibly wrong output or a crash; WARN if it causes a subtle discrepancy.

### 5.4 Parameters not wired

**Pattern:** a key declared in `SCRIPT_CONFIG.parameters` that never appears in the render hook. The control exists in the UI but moving it produces no visible change.

**Detection:** for each `key` in the parameters array, search the source for that key string in `p5Draw` or `draw`. If absent, the parameter is not wired.

**Severity:** WARN.

---

## 6. Performance Risks

| Pattern | Severity | Notes |
| --- | --- | --- |
| O(n²) loop with no n cap parameter | WARN | Flag the loop and the missing cap; suggest a cap parameter |
| O(n²) loop where n is unbounded by any config | WARN | Same — n must be bounded |
| Per-pixel operation on main thread | WARN | Any `getImageData` / `putImageData`, or a loop over every canvas pixel |
| Object allocation in hot render loop | NOTE | `new Array()`, `{}`, `[]` created fresh every frame; suggests preallocation opportunity |
| `Math.sqrt` in inner loop where squared distance suffices | NOTE | Minor; document the opportunity |

---

## 7. Parity Holes

Parity holes come from the consolidation in Step 1 of `document-generator.md`. Record each as:

```
[NOTE] [PARITY] <Feature name> absent from live source
Location: described in <legacy file>, absent from <source file>
Evidence: "<quote from legacy doc describing the feature>"
Impact: the feature is not available to users in the current implementation
```

If a feature is present in the legacy doc with different behaviour from the live source:

```
[NOTE] [CONFLICT] <Feature name> differs between legacy doc and live source
Location: <legacy file> vs <source file>
Evidence: legacy says "<description>"; source implements "<different description>"
Impact: the intended specification is ambiguous; which version is authoritative is unknown
```

---

## 8. Escalation Issues

Escalation issues are always NOTE severity. See `component-algorithm-escalation.md` for full detail.

```
[NOTE] [ESCALATION] Algorithm candidate: <name>
Location: <function name> in <source file>
Description: <what the algorithm computes>
Candidate library location: assets/js/shared/algorithms/<module>/<filename>.js
Reason: non-trivial, likely reusable, not currently in library
```

---

## 9. Prohibition

Issues are recorded in the documentation programme. Generator code is not rewritten, refactored, or fixed during documentation. If a bug is severe enough to cause a production failure, note it prominently at the top of `issues-and-conflicts.md` and flag it as requiring immediate attention in a separate implementation task. Do not edit the `.gen.js` file.
