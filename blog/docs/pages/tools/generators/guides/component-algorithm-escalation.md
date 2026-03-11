# Component and Algorithm Escalation Guide

When a generator script contains code that should be in a shared library but is not, it must be flagged for escalation. Escalation is a documentation action — it records that a library gap exists. It does not block the generator's documentation or operation. The inline implementation continues to function until the library version is created and integrated.

---

## 1. When to Escalate a New Algorithm

Flag an algorithm for escalation when all four conditions are true:

1. **It is implemented inline** in the generator script (i.e. it is a function defined inside the `.gen.js` file, not imported from `assets/js/shared/algorithms/`)
2. **It is non-trivial** — more than a one-liner; the implementation takes at least 5 lines or requires meaningful algorithmic design
3. **It is not already in the library** — confirm by searching `assets/js/shared/algorithms/` for a function that computes the same thing
4. **It is likely reusable** — the algorithm is either named in the field (has a standard name), is used in another generator already, or addresses a problem (noise, geometry, packing, physics) that other generators are likely to share

**Examples of escalation candidates from existing generators:**

| Algorithm | Generator | Library candidate location |
| --- | --- | --- |
| Fibonacci sequence generation `_fibSeq(n)` | fibonacci-balls | `assets/js/shared/algorithms/math-utils/fibonacci.js` |
| Apollonius tangent point computation `_tangentToTwo(c1, c2, r)` | fibonacci-balls | `assets/js/shared/algorithms/geometry/circle-packing.js` |
| Front-chain circle packing `_packFrontChain(radii, indices, size)` | fibonacci-balls | `assets/js/shared/algorithms/geometry/circle-packing.js` |
| Elastic collision impulse | fibonacci-balls, any physics generator | `assets/js/shared/algorithms/physics/collision.js` |
| Lissajous parametric evaluation | lissajous, harmonics | `assets/js/shared/algorithms/parametric/lissajous.js` |
| Keplerian orbital position | solar-system | `assets/js/shared/algorithms/astronomy/kepler.js` |

**Examples of things that are NOT escalation candidates:**

- `Math.sqrt(dx*dx + dy*dy)` — one-liner, standard, no escalation needed
- `((h + shift) % 360 + 360) % 360` — one-liner modular arithmetic
- A generator-specific helper that depends entirely on that generator's state model

---

## 2. When to Escalate a New UI Component

Flag a UI component for escalation when all four conditions are true, as defined in `blog/docs/guides/standards/tool-standards.md` §3:

1. **The pattern appears in three or more generators or tools** — a pattern used by only one or two is not yet a shared-library candidate
2. **It is non-trivial** — a component requiring its own state management, event handling, or rendering logic (not just a wrapper around a single HTML element)
3. **It can be tested or reasoned about in isolation** — its inputs and outputs are well-defined independently of any specific generator
4. **It has a configurable interface** — it must accept parameters that customise its behaviour, not be hardcoded

**Note:** generators do not own their own UI. The generator host provides all UI. A generator script that appears to need a custom UI component is more likely a case where the host's parameter system needs extending, not where a new component is needed in the library. Be precise about whether the need is in the generator script or in the host.

---

## 3. How to Flag — Record Format

Record every escalation candidate in the generator's `issues-and-conflicts.md` using the issue format from `issue-flagging.md`:

### Algorithm escalation

```
[NOTE] [ESCALATION] Algorithm candidate: <algorithm name>
Location: <function name> in <source file>
Description: <what the algorithm computes, in one sentence>
Candidate library location: assets/js/shared/algorithms/<module>/<file>.js
Reason: non-trivial; named algorithm; not in library; likely reusable across generators
```

**Example:**

```
[NOTE] [ESCALATION] Algorithm candidate: front-chain circle packing
Location: _packFrontChain() in fibonacci-balls.gen.js
Description: Places circles of given radii tangent to adjacent front circles, minimising
  distance from centre, using the Apollonius tangent point formula for placement candidates.
Candidate library location: assets/js/shared/algorithms/geometry/circle-packing.js
Reason: non-trivial; implements a named packing algorithm (Apollonius / Descartes);
  not in library; applicable to any generator needing packed circle layouts
```

### UI component escalation

```
[NOTE] [ESCALATION] UI component candidate: <component name>
Location: used in <generator id> and <other generators if known>
Description: <what the component does, in one sentence>
Candidate library location: assets/js/shared/component-library.js
Reason: appears in 3+ tools; non-trivial; configurable interface
```

---

## 4. Tracking Escalations

All escalation candidates must also be recorded in `blog/docs/guides/shared-utilities.md`, as required by `blog/docs/guides/standards/tool-standards.md` §3. This is the sitewide registry of candidate shared utilities.

Format for `shared-utilities.md` entry:

```markdown
## <Algorithm name>

- Source: `<generator id>` — `<function name>` in `<source file>`
- Description: <one-sentence description>
- Candidate library location: `<path>`
- Status: escalated — not yet in library
- Identified: <date>
```

---

## 5. Existing Processes to Link

When an escalation is acted on (implemented in the library), follow the existing processes:

### Adding an algorithm to the library

1. Add the module to `assets/js/shared/algorithms/` following the existing file structure (one file per algorithm family, exported functions, no global side effects)
2. Export the function from the relevant index file in the algorithms directory
3. Update `blog/docs/guides/shared-utilities.md` status from "escalated — not yet in library" to "available: `<path>`"
4. Update the generator's `issues-and-conflicts.md` entry from `[NOTE] [ESCALATION]` to `[NOTE] [RESOLVED] Algorithm extracted to library`
5. The generator script should then import from the library at the next opportunity — this is an implementation task, not a documentation task

**Reference:** `blog/docs/guides/tools/tool-build-guide.md` §Algorithm Library Dependency and §Available Algorithm Modules

### Adding a component to the library

1. Add the component class to `assets/js/shared/component-library.js` following the existing component structure (extends BaseComponent, implements `.destroy()`)
2. Export it from the component library
3. Update `blog/docs/guides/shared-utilities.md` status
4. Update `blog/docs/components/COMPONENT-REFERENCE.md` with the new component's API

**Reference:** `blog/docs/guides/tools/tool-build-guide.md` §Component Types and `blog/docs/components/COMPONENT-REFERENCE.md`

---

## 6. Escalation Does Not Block

An escalation flag never blocks:
- The generator from being documented
- The generator from operating (the inline implementation continues to work)
- The migration from being closed (escalations are NOTE severity and do not prevent 8/8 completion)

The escalation is a forward-looking signal that the library should grow to accommodate this pattern. It is resolved separately from the documentation programme.
