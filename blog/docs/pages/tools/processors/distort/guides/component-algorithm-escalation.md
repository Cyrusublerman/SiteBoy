# Component and Algorithm Escalation Guide

When an effect module contains code that should be in a shared library but is not, it must be flagged for escalation. Escalation is a documentation action — it records that a library gap exists. It does not block the module's documentation or operation. The inline implementation continues to function until the library version is created and integrated.

---

## 1. When to Escalate a New Algorithm

Flag an algorithm for escalation when all four conditions are true:

1. **It is implemented inline** in the module (i.e. a function defined inside `*Node.js`, not imported from `assets/js/shared/algorithms/`)
2. **It is non-trivial** — more than a one-liner; the implementation takes at least 5 lines or requires meaningful algorithmic design
3. **It is not already in the library** — confirm by searching `assets/js/shared/algorithms/` for a function that computes the same thing
4. **It is likely reusable** — the algorithm is either named in the field (standard name), is used in another module already, or addresses a problem (noise, convolution, geometry, physics, segmentation) that other modules are likely to share

**Examples of escalation candidates from effect modules:**

| Algorithm | Module | Library candidate location |
| --- | --- | --- |
| Gaussian kernel construction `_buildKernel(sigma)` | GaussianBlurNode | `assets/js/shared/algorithms/convolution/gaussian.js` |
| Perlin noise evaluation | FlowFieldNode, DomainWarpNode | `assets/js/shared/algorithms/noise/perlin.js` |
| Gray-Scott RDE step `_odeStep(u, v, f, k, dt)` | ReactionDiffusionNode | `assets/js/shared/algorithms/physics/reaction-diffusion.js` |
| Sobel operator kernel pair | SobelNode, CannyNode, DomainWarpNode | `assets/js/shared/algorithms/convolution/sobel.js` |
| Otsu threshold computation `_computeOtsu(histogram)` | OtsuThresholdNode | `assets/js/shared/algorithms/segmentation/otsu.js` |
| fBm noise accumulation `_fbm(x, y, octaves)` | PerlinOverlayNode | `assets/js/shared/algorithms/noise/fbm.js` |
| Bilinear interpolation `_sample(src, x, y, w, h)` | FlowFieldNode, AdvectionNode | `assets/js/shared/algorithms/sampling/bilinear.js` |

**Examples of things that are NOT escalation candidates:**

- `(i * 4)` — stride computation, trivial one-liner
- `Math.max(0, Math.min(v, 255))` — clamp, standard
- A helper that depends entirely on that module's specific state (not reusable as-is)

---

## 2. When to Escalate a New UI Component

Flag a UI component for escalation when all four conditions are true:

1. **The pattern appears in three or more modules or tools** — a pattern used by only one or two is not yet a candidate
2. **It is non-trivial** — requires its own state management, event handling, or rendering logic
3. **It can be tested or reasoned about in isolation** — inputs and outputs are well-defined independently of any specific module
4. **It has a configurable interface** — accepts parameters that customise its behaviour, not hardcoded

**Note:** modules do not own their own UI. The NodePanel derives all module controls from `paramDefs`. A module that appears to need a custom UI component is more likely a case where the `paramDefs` system needs extending, not where a new component is needed. Be precise about whether the need is in the module or in the host.

---

## 3. How to Flag — Record Format

Record every escalation candidate in the module's `issues-and-conflicts.md` using the issue format from `issue-flagging.md`:

### Algorithm escalation

```
[NOTE] [ESCALATION] Algorithm candidate: <algorithm name>
Location: <function name> in <source file>
Description: <what the algorithm computes, in one sentence>
Candidate library location: assets/js/shared/algorithms/<module>/<file>.js
Reason: non-trivial; named algorithm; not in library; likely reusable across modules
```

**Example:**

```
[NOTE] [ESCALATION] Algorithm candidate: Gray-Scott reaction-diffusion step
Location: _odeStep() in ReactionDiffusionNode.js
Description: Advances the Gray-Scott u/v concentration grid by one timestep using
  the reaction-diffusion equations with feed rate f and kill rate k.
Candidate library location: assets/js/shared/algorithms/physics/reaction-diffusion.js
Reason: non-trivial (35-line kernel loop); named algorithm (Gray-Scott); not in library;
  applicable to any module requiring reaction-diffusion simulation
```

### UI component escalation

```
[NOTE] [ESCALATION] UI component candidate: <component name>
Location: used in <module> and <other modules if known>
Description: <what the component does, in one sentence>
Candidate library location: assets/js/shared/component-library.js
Reason: appears in 3+ tools; non-trivial; configurable interface
```

---

## 4. Tracking Escalations

All escalation candidates must also be recorded in `blog/docs/guides/shared-utilities.md`, the sitewide registry of candidate shared utilities.

Format for `shared-utilities.md` entry:

```markdown
## <Algorithm name>

- Source: `<type>` module — `<function name>` in `<source file>`
- Description: <one-sentence description>
- Candidate library location: `<path>`
- Status: escalated — not yet in library
- Identified: <date>
```

---

## 5. Existing Processes to Link

When an escalation is acted on (implemented in the library), follow the existing processes:

### Adding an algorithm to the library

1. Add the module to `assets/js/shared/algorithms/` (one file per algorithm family, exported functions, no global side effects)
2. Export the function from the relevant index file
3. Update `blog/docs/guides/shared-utilities.md` status from "escalated" to "available: `<path>`"
4. Update the module's `issues-and-conflicts.md` entry from `[NOTE] [ESCALATION]` to `[NOTE] [RESOLVED] Algorithm extracted to library`
5. The module should then import from the library at the next opportunity — this is an implementation task, not a documentation task

**Reference:** `blog/docs/guides/tools/effect-module-build-guide.md` §Algorithm Library

### Adding a component to the library

1. Add the component class to `assets/js/shared/component-library.js` (extends BaseComponent, implements `.destroy()`)
2. Export it from the component library
3. Update `blog/docs/guides/shared-utilities.md` status
4. Update `blog/docs/components/COMPONENT-REFERENCE.md` with the new component's API

---

## 6. Escalation Does Not Block

An escalation flag never blocks:
- The module from being documented
- The module from operating (the inline implementation continues to work)
- The migration from being closed (escalations are NOTE severity and do not prevent 8/8 completion)

The escalation is a forward-looking signal that the library should grow to accommodate this pattern. It is resolved separately from the documentation programme.
