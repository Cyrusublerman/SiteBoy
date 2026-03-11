# Issue Flagging Guide

Every problem, gap, or non-compliance found during a module's documentation must be recorded in `issues-and-conflicts.md` using the format defined here. Issues are flagged only — module code is not rewritten in the documentation programme. Fixes are tracked by the issue record; a separate implementation task resolves them.

---

## 1. Severity Taxonomy

Every issue has exactly one severity.

| Severity | Meaning |
| --- | --- |
| `ERROR` | The code will cause a runtime fault, produce silently wrong output, or break the pipeline/Worker contract. Must be fixed before the module can be trusted in production. |
| `WARN` | The code violates a site standard or best practice but is not immediately broken. Should be fixed but does not block use. |
| `NOTE` | A gap, ambiguity, parity hole, or escalation candidate needing attention but not a standards violation. Informational. |

When in doubt between ERROR and WARN: if the problem causes observable wrong behaviour, it is ERROR. If it causes a standards violation but the module still works, it is WARN.

---

## 2. Record Format

Every issue must use this exact format:

```
[SEVERITY] [CATEGORY] Short description (one line)
Location: <method name, loop description, or specific param key>
Evidence: <exact quote from source, or precise paraphrase with enough detail to locate the issue>
Impact: <what goes wrong, what is missing, or what standards rule is violated>
```

**Example:**

```
[ERROR] [BUG] Pixel index not clamped at right/bottom boundary in FlowFieldNode
Location: apply() — inner loop at `const srcIdx = (sy * w + sx) * 4`
Evidence: `sx = Math.round(x + dx)` — sx is not clamped to [0, w-1] before computing
  srcIdx. At right boundary, sx can equal w, making srcIdx = (sy * w + w) * 4 which
  reads one pixel past the row boundary into the next row.
Impact: Row-wrap artefacts at right edge of image under any non-zero horizontal flow.
```

The "Location" field must be specific enough to locate the relevant code in under 30 seconds.

---

## 3. Categories

Use one of the following category tags per issue:

| Category tag | Use for |
| --- | --- |
| `[BUG]` | Logic errors, index out of bounds, buffer overrun, wrong formula, NaN propagation |
| `[STANDARDS]` | Violations of `build-module.md`, `code-standards.md`, `design-law.md`, or `effect-module-standards.md` |
| `[PERFORMANCE]` | Algorithmic complexity concerns, per-pixel allocations, missing PREVIEW caps, Worker threading |
| `[PARITY]` | Features described in the component-level doc that are absent or changed in the live source |
| `[ESCALATION]` | Algorithms that should be in the shared library but are implemented inline |
| `[CONFLICT]` | Direct contradiction between two inputs (e.g. component-level doc says one thing, source does another) |

---

## 4. Standards Violations

### 4.1 Worker context violations

These apply to all modules. Execution is off main thread — browser globals are unavailable.

| Issue | Severity | Evidence pattern |
| --- | --- | --- |
| `document.*` access | ERROR | `document.createElement`, `document.getElementById`, `document.querySelector` |
| `window.*` access | ERROR | `window.location`, `window.addEventListener`, `window.performance` |
| `fetch()` or `XMLHttpRequest` | ERROR | Any network request inside `apply()` or `buildGeometry()` |
| `requestAnimationFrame` / `setInterval` / `setTimeout` | ERROR | Any timing call inside the module |
| `console.*` in production code | WARN | `console.log`, `console.warn` left in published module |

### 4.2 paramDefs violations

| Issue | Severity | Evidence pattern |
| --- | --- | --- |
| No tier-3 param | WARN | All params have `tier: 4` or `tier: 5` |
| `range` param read via `this.params[key]` when `driveable: true` | WARN | `this.params.blurRadius` instead of `this.getModulated('blurRadius', ...)` |
| Label exceeds 16 chars | WARN | `label: 'GAUSSIAN SIGMA VALUE'` — 20 chars |
| Label not SCREAMING CASE | WARN | `label: 'Blur Radius'` |
| `range` param missing `min`, `max`, `step`, or `default` | ERROR | Any range param without required fields |

### 4.3 Buffer / memory violations

| Issue | Severity | Evidence pattern |
| --- | --- | --- |
| `ctx.pool` buffer acquired but not released | WARN | `ctx.pool.acquire(size)` without matching `ctx.pool.release()` before return |
| Allocation inside pixel loop | NOTE | `new Float32Array(size)` inside the `for (let y = 0; y < h; y++)` loop |
| Off-by-one pixel index | ERROR | `(y * w + x) * 4` where x or y can reach `w` or `h` without a clamp |

### 4.4 Algorithm violations

| Issue | Severity | Evidence pattern |
| --- | --- | --- |
| Inline algorithm that exists in library | WARN | Reimplementation of Gaussian kernel, Otsu threshold, Sobel operator, noise function already in `assets/js/shared/algorithms/` |
| `destroy()` missing when resources acquired | WARN | Module acquires typed array or LUT in constructor but has no `destroy()` |

---

## 5. Bug Patterns

### 5.1 Pixel index out of bounds

**Pattern:** pixel buffer index that can exceed buffer size under valid parameter values or image dimensions.

```javascript
// Risk: if sx === w (at right edge), srcIdx reads into next row
const srcIdx = (sy * w + sx) * 4;

// Correct guard:
const sx_c = Math.max(0, Math.min(sx, w - 1));
const sy_c = Math.max(0, Math.min(sy, h - 1));
const srcIdx = (sy_c * w + sx_c) * 4;
```

**Severity:** ERROR if the out-of-bounds case occurs under normal parameter values; WARN if only an extreme edge case.

### 5.2 NaN propagation from normalised vector

**Pattern:** computing a unit vector without checking for zero magnitude.

```javascript
// Risk: if magnitude === 0, nx and ny become NaN or Infinity
const mag = Math.sqrt(dx*dx + dy*dy);
const nx = dx / mag, ny = dy / mag;

// Correct guard:
if (mag < 1e-6) return;
const nx = dx / mag, ny = dy / mag;
```

**Severity:** ERROR if NaN propagates to `dst` buffer (corrupts output pixels silently).

### 5.3 Param read without modulation

**Pattern:** a param declared `driveable: true` in `paramDefs` but read via `this.params[key]` in the pixel loop.

**Detection:** for each param with `driveable: true`, search `apply()` for its key. If found as `this.params.key` inside the pixel loop, it is not actually driveable.

**Severity:** WARN. The UI will show the driver slot, but attaching a driver will have no effect.

### 5.4 Missing PREVIEW cap

**Pattern:** a module with O(n × param) cost that does not check `ctx.quality === 'preview'`.

**Detection:** read `apply()` for `ctx.quality`. If absent and the module has iteration/radius/pass params, it lacks PREVIEW caps.

**Severity:** WARN. Interactive performance degraded at high param values.

### 5.5 Allocation in hot path

**Pattern:** creating typed arrays or plain objects inside the per-pixel loop.

```javascript
// Risk: allocates new Float32Array on every pixel — massive GC pressure
for (let i = 0; i < w * h; i++) {
    const kernel = new Float32Array(kernelSize); // BAD
}
```

**Severity:** NOTE. Not immediately broken; causes GC pauses at high resolution.

---

## 6. Performance Risks

| Pattern | Severity | Notes |
| --- | --- | --- |
| O(n × iterations) with no PREVIEW cap | WARN | Flag the loop and the missing cap |
| O(n²) spatial search with no spatial index | WARN | Typical in stipple, voronoi, delaunay — n = pixel count |
| Per-pixel `ctx.pool.acquire()` call | WARN | Pool acquire has overhead; allocate once outside the loop |
| Synchronous multi-pass at FULL resolution | NOTE | Each additional pass × w × h; document the cost |
| `Math.sqrt()` where squared distance suffices | NOTE | Minor; document the opportunity |

---

## 7. Parity Holes

Record each parity hole from Step 1 consolidation as:

```
[NOTE] [PARITY] <Feature name> absent from live source
Location: described in <legacy file>, absent from <source file>
Evidence: "<quote from component-level doc or other legacy file describing the feature>"
Impact: the feature is not available to users in the current implementation
```

If a feature is present but differs:

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

Issues are recorded in the documentation programme. Module code is not rewritten, refactored, or fixed during documentation. If a bug is severe enough to cause a production failure, note it prominently at the top of `issues-and-conflicts.md` and flag it as requiring immediate attention in a separate implementation task. Do not edit the `*Node.js` file.
