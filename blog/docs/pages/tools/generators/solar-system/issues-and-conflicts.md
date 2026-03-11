# Solar System — Issues and Conflicts

## Standards Compliance Check (`build-page.md` §8)

**This is a 2D generator (context: '2d'); p5 rules do not apply.**

**All generator rules:**

- No `document.*` / `window.*` / `.innerHTML` / `.createElement`: **PASS** — none of these appear in the source
- No `requestAnimationFrame` / `setInterval` / `setTimeout` for animation: **PASS** — none present; animation is host-driven
- Canvas output uses VGA palette or algorithmic colour with justification: **PASS** — all planet colours in PLANET_DATA (`#c0c0c0, #ffff00, #00ffff, #ff0000, #808000, #008080, #0000ff`) are VGA palette values; asteroid and UI colours (`#ffffff, #808080, #000000`) are VGA palette values; no non-VGA colours
- No inline algorithm that exists in `assets/js/shared/algorithms/`: **PASS** — Keplerian mechanics and Newton-Raphson solver are not in the shared library
- State stored on `this`, not undocumented module-level variables: **FAIL** — all state (`planets`, `asteroidParticles`, `asteroidCached`, `longitude`, `latitude`, `locationRequested`) is module-level, not on `this`. This is a standards violation per `code-standards.md` §2. Some variables are intentional caches (`asteroidCached`, `locationRequested`), but none are documented as such in comments.
- `destroy()` or equivalent cleanup: **NOTE** — no `destroy()` method. The geolocation fetch is async and does not need cancellation. No event listeners or timers are created. No cleanup needed.
- `id` is kebab-case and matches filename: **PASS** — `id: 'solar-system'`, file `solar-system.gen.js`
- `title` is Title Case: **PASS** — `title: 'Solar System'`
- `category` is one of the permitted values: **PASS** — `category: 'other'`
- Render hook is a method on SCRIPT_CONFIG: **FAIL** — `draw` is assigned as `draw: draw` where `draw` is a module-level function, not a method defined inside SCRIPT_CONFIG. The render hook does not use `this` at all. This is not how the method pattern is described in `code-standards.md` §2.
- All parameter keys are camelCase: **PASS** — `distanceScale, planetScale, showLabels, showInfo, asteroidCount, showAsteroidBelt, showViewer, fovAngle, canvasWidth, canvasHeight`
- All preset objects include `name` and all parameter keys: **FAIL** — preset values are nested under `values: {}` instead of placed directly at the preset object top level. Standard contract: `{ name: '...', distanceScale: ..., ... }`. Actual format: `{ name: '...', values: { distanceScale: ..., ... } }`.

---

## Bug and Risk Detection

**[WARN] [BUG] `canvasWidth` and `canvasHeight` parameters are not wired in `draw()`**
Location: `draw()` — the function uses `canvas.width` and `canvas.height` from the host-provided argument; `params.canvasWidth` and `params.canvasHeight` are never referenced
Evidence: Search for `canvasWidth` in `draw()` — absent. Search for `canvasHeight` in `draw()` — absent. The generator reads `const s = Math.min(canvas.width, canvas.height)` using the argument, not the param.
Impact: The Canvas group in the sidebar has two sliders (Width, Height) that produce no visible effect when moved. Users moving these sliders will observe no change in the output.

**[WARN] [BUG] Module-level mutable state violates generator state model**
Location: module level — `let planets = []`, `let asteroidParticles = []`, `let asteroidCached = null`, `let longitude = null`, `let latitude = null`, `let locationRequested = false`
Evidence: All six state variables are declared at module scope, outside SCRIPT_CONFIG and outside any named helper. They are mutated by `draw()` and its called functions.
Impact: Module-level state persists across host reloads of the same module if the module is cached. If the host calls `draw()` after a soft-reset without reloading the module, `planets.length` will be non-zero and `initializePlanets()` will not be called again. This causes stale state if the planet data or asteroid configuration is changed outside the parameter flow.

**[WARN] [BUG] `draw()` ignores `frame` argument; uses real-world time**
Location: `draw(ctx, canvas, params, frame)` — `frame` is never referenced; `getCenturiesPastJ2000()` reads `Date.now()`
Evidence: The function signature accepts `frame` but no code reads it. `getCenturiesPastJ2000()` uses `Date.now()` directly. `getLocalSolarTime()` reads `new Date()`.
Impact: The animation is non-deterministic with respect to frame number. Sequence exports (`gif`, `webm`, `sequence`) would produce incorrect or random-order planet positions rather than a smooth sweep. The generator's output is a snapshot of real-world time at the moment of each frame render, not a function of frame index.

**[WARN] [STANDARDS] Non-standard preset format**
Location: `SCRIPT_CONFIG.presets`
Evidence: `{ name: 'Default', values: { distanceScale: 0.45, ... } }` — values nested under `values` key. Standard: `{ name: 'Default', distanceScale: 0.45, ... }` (keys at top level per `build-page.md` §1.3).
Impact: If the host reads preset values as `preset[key]` rather than `preset.values[key]`, applying presets will silently fail (all parameters reset to defaults). The host's preset handling determines whether this is observable.

**[WARN] [STANDARDS] Render hook assigned as external function reference, not inline method**
Location: `SCRIPT_CONFIG = { ..., draw: draw }` where `draw` is a module-level function
Evidence: The `draw` function is defined at module scope and assigned to SCRIPT_CONFIG's `draw` property. It does not use `this` and cannot access other SCRIPT_CONFIG methods.
Impact: Violates the method pattern required by `code-standards.md` §2. The render hook should be defined as a method directly within the SCRIPT_CONFIG object literal, enabling `this` access. In current form, all state must be module-level (which compounds the module-level state violation).

**[WARN] [STANDARDS] External network request (`fetch`) in generator script**
Location: `requestLocation()` — `fetch('https://ipapi.co/json/')`
Evidence: `fetch('https://ipapi.co/json/').then(res => res.json()).then(data => { longitude = data.longitude; latitude = data.latitude; })`
Impact: Generator scripts must communicate with the host only through render hook return values, `this` properties, or the `params` object (`code-standards.md` §3). A `fetch` to an external API is a side effect that extends beyond the canvas. It also creates a network dependency: if ipapi.co is unreachable, geolocation silently fails with no user feedback. Privacy implication: user IP is sent to a third-party service on every page load.

**[NOTE] [STANDARDS] `font` specification uses generic `monospace`, not `Space Mono`**
Location: `draw()` — `ctx.font = '10px monospace'` (used for both planet labels and info text)
Evidence: `ctx.font = '10px monospace'` appears twice in `draw()`.
Impact: The site requires Space Mono as the sole typeface. Using `monospace` may render with a different font depending on system fonts.

**[NOTE] [STANDARDS] `canPrerender: false` is a non-standard animation config field**
Location: `SCRIPT_CONFIG.animation`
Evidence: `animation: { type: 'infinite', defaultFps: 1, canPrerender: false }` — `canPrerender` is not in the animation config contract defined in `build-page.md` §4.2.
Impact: The field is ignored by the host if unrecognised. Not a runtime defect but documents a deviation from the defined contract.

---

## Performance Risks

**[NOTE] [PERFORMANCE] O(count) individual `fillRect` calls per frame for asteroid belt**
Location: `drawAsteroidBelt` — inner loop: `ctx.fillRect(x - 0.5, y - 0.5, 1, 1)`
Evidence: At `asteroidCount=1000`: 1000 individual 1×1 pixel `fillRect` calls per frame.
Impact: At defaultFps=1 this is negligible. If the host increases fps, this scales linearly. Batch rendering via `ImageData` putImageData would eliminate per-call overhead.

---

## Parity Holes (as Issues)

**[NOTE] [PARITY] Planet trails absent**
Location: described in `solar-system.md` and `solar-system-audit.md`; not in `draw()` in live source
Evidence: spec: "Circular buffer for efficient trail storage"; audit: "Planet trails: ❌ Doc mentions but not in code"
Impact: Trail feature described in legacy docs is not available to users.

**[NOTE] [PARITY] `showTrails` and `trailLength` parameters absent**
Location: `SCRIPT_CONFIG.parameters` — neither key present
Evidence: `solar-system.md` lists `showTrails` and `trailLength` in both the variable analysis and the ToolBase configuration sidebar
Impact: Two parameters described in spec have no corresponding implementation.

**[NOTE] [PARITY] Planet selection and angular measurement absent**
Location: not present in live source
Evidence: `solar-system.md`: "Planet selection for distance/angle measurement"; audit: "Angular separation display: ❌"
Impact: Interactive planet selection and measurement not available.

**[NOTE] [PARITY] Custom date/time selection absent**
Location: not present in live source
Evidence: `solar-system.md` §3 "Missing Controls": "Custom date selection", "Speed control (time acceleration)"
Impact: Generator always displays current real-world planetary positions; historical or future dates are inaccessible.

**[NOTE] [PARITY] `canvasWidth`/`canvasHeight` parameters inert**
Location: declared in `SCRIPT_CONFIG.parameters` group 'Canvas'; not read in `draw()`
Evidence: `params.canvasWidth` and `params.canvasHeight` are never referenced in the render path
Impact: UI controls are visible but have no effect.

---

## Escalation Issues

**[NOTE] [ESCALATION] Algorithm candidate: Kepler equation solver**
Location: `solveKeplerEquation(M, e)` in `solar-system.gen.js`
Description: Newton-Raphson solver for Kepler's transcendental equation M = E − e·sin(E); returns eccentric anomaly E in degrees; convergence typically 3–5 iterations.
Candidate library location: `assets/js/shared/algorithms/physics/kepler.js`
Reason: non-trivial (20+ lines, named algorithm); applies to any generator involving Keplerian orbital mechanics; not in shared library

**[NOTE] [ESCALATION] Algorithm candidate: Keplerian heliocentric position computation**
Location: `computePlanetPosition(planet, T)` in `solar-system.gen.js`
Description: Computes heliocentric ecliptic (x, y) coordinates from the six Keplerian orbital elements at time T, including the 3D rotation to ecliptic frame.
Candidate library location: `assets/js/shared/algorithms/astronomy/kepler.js`
Reason: non-trivial; named algorithm (NASA JPL method); reusable for any astronomical generator; not in shared library
