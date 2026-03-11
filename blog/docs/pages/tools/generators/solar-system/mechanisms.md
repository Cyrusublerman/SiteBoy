# Solar System — Mechanisms

Mathematical model class: Keplerian orbital mechanics (NASA JPL two-body approximation) with Newton-Raphson equation solving and logarithmic distance compression.

---

## State Model

This generator uses a 2D canvas context (`context: '2d'`). All persistent state is held in module-level variables, not on `this`. This is a standards violation (see `issues-and-conflicts.md`); the state is documented here as-found.

| Variable | Type | Holds | Initialised | Mutates | Reset trigger |
| --- | --- | --- | --- | --- | --- |
| `planets` | Array of planet objects | Eight planet state objects derived from PLANET_DATA; each has orbital element fields plus `cachedPos`, `lastT`, `screenX`, `screenY`, `screenRadius` | First `draw()` call via `initializePlanets()` | `cachedPos` and `lastT` on each position query; `screenX/Y/screenRadius` each frame | Never reset; `planets.length === 0` check only fires once per module load |
| `asteroidParticles` | Array | Random `{angle, distance, color}` objects for asteroid belt | First `draw()` call; regenerated when `asteroidCount` changes | Replaced entirely when count changes | `asteroidParticles.length !== params.asteroidCount` |
| `asteroidCached` | Array or null | Cached `{x, y, color}` screen positions for asteroid belt | Lazily on first draw of belt; null after regeneration | Populated on first belt draw after null | Set to null by `generateAsteroidBelt()` |
| `longitude` | number or null | User's geographic longitude from IP geolocation; null before response | null at module load | On geolocation fetch response | Never reset |
| `latitude` | number or null | User's geographic latitude (stored but not used in render) | null at module load | On geolocation fetch response | Never reset |
| `locationRequested` | boolean | Flag preventing duplicate fetch calls | false at module load | Set to true on first `requestLocation()` call | Never reset |

---

## Function Inventory

| Function | Role | Inputs | Output | Complexity |
| --- | --- | --- | --- | --- |
| `initializePlanets()` | Creates planet state objects from PLANET_DATA, adding position cache and screen coordinate fields | none | void; mutates module `planets` | O(8) = O(1) |
| `getCenturiesPastJ2000()` | Computes T, the time parameter for orbital element evaluation | none (reads `Date.now()`) | `number` — Julian centuries since J2000 | O(1) |
| `getLocalSolarTime()` | Returns fractional day [0,1] representing local solar time; uses longitude offset if available | none (reads `longitude` and `Date`) | `number` — solar time as fraction of day | O(1) |
| `solveKeplerEquation(M, e)` | Newton-Raphson solver for Kepler's equation M = E − e*·sin(E); returns E in degrees | `M: number` (mean anomaly, degrees), `e: number` (eccentricity) | `number` — eccentric anomaly E in degrees | O(iter) ≤ O(30) |
| `normalizeAngle(angle)` | Maps angle in degrees to [-180, 180] range via while-loop subtraction/addition | `angle: number` (degrees) | `number` — normalised angle in degrees | O(1) for typical input (at most a few iterations) |
| `computePlanetPosition(planet, T)` | Evaluates all six orbital elements at T, solves Kepler equation, transforms to heliocentric ecliptic coordinates; caches result on planet object | `planet` (planet object with orbital element fields), `T: number` (centuries) | `{x, y, distance}` in AU | O(1) per planet (fixed element count) |
| `scaleDistance(distanceAU)` | Logarithmic distance compression | `distanceAU: number` | `number` — compressed distance in display units | O(1) |
| `generateAsteroidBelt(count)` | Creates `count` asteroid particles with random angles and distances in [2.2, 3.2] AU; clears position cache | `count: number` | void; mutates `asteroidParticles`, nulls `asteroidCached` | O(count) |
| `drawAsteroidBelt(ctx, distScale)` | Renders asteroid belt; builds screen position cache on first call, then uses cache | `ctx` (Canvas2D context), `distScale: number` | void; draws to canvas | O(count) first call, O(count) subsequent (cache already populated) |
| `requestLocation()` | Fires fetch to ipapi.co to obtain longitude/latitude; sets module-level vars on success; silent-fails | none | void; side effect: mutates `longitude`, `latitude`, `locationRequested` | O(1) (async) |
| `draw(ctx, canvas, params, frame)` | Main render hook: lazy init, asteroid regeneration, compute T, draw all elements | `ctx`, `canvas`, `params`, `frame` (unused) | void | O(count) for asteroid belt; O(8) for planets |

---

## Mathematical Model

**Time parameter T (Julian centuries past J2000):**
`T = (Date.now() − J2000_MS) / 86400000 / 36525`

where:
- `T` — time in Julian centuries since 1 January 2000 12:00 TT; dimensionless
- `J2000_MS = 946728000000` — millisecond timestamp of J2000 epoch
- `86400000` — milliseconds per day
- `36525` — days per Julian century

**Orbital element evolution (linear in T):**
`a(T) = a₀ + ȧ × T`, and analogously for `e, I, L, ω̄, Ω`

where:
- `a₀, a_dot` — semi-major axis at J2000 and its rate of change; AU and AU/century respectively
- `a(T)` — semi-major axis at time T; AU
- Same structure for eccentricity (`e`), inclination (`I`, degrees), mean longitude (`L`, degrees), longitude of perihelion (`ω̄`, degrees), longitude of ascending node (`Ω`, degrees)

**Derived angular quantities:**
`ω = ω̄ − Ω` (argument of perihelion; degrees)
`M = normalise(L − ω̄)` (mean anomaly; degrees in [-180, 180])

where:
- `ω` — angle from ascending node to perihelion in orbital plane; degrees
- `M` — mean anomaly; where the planet would be if it moved uniformly; degrees

**Kepler equation solver (Newton-Raphson):**
Initial estimate: `E₀ = M + eStar × sin(M_rad)` where `eStar = 57.29578 × e`
Iteration: `E_{n+1} = E_n + ΔM / (1 − e × cos(E_n_rad))`
where `ΔM = M − (E_n − eStar × sin(E_n_rad))`; stop when `|ΔM| < 10⁻⁶`

where:
- `E` — eccentric anomaly; degrees (working in degrees throughout, converted to radians only for trig)
- `eStar = 57.29578 × e` — eccentricity in degrees, matching M's degree units
- `e` — orbital eccentricity; dimensionless, range (0, 1)
- `M_rad, E_n_rad` — M and E converted to radians for `sin`/`cos` evaluation
- Convergence: typically 3–5 iterations; maximum 30

**Orbital plane position:**
`x' = a × (cos(E) − e)`
`y' = a × √(1 − e²) × sin(E)`

where:
- `x', y'` — position in orbital plane with perihelion on +x axis; AU
- `E` — eccentric anomaly; radians (converted from degree solution)

**Ecliptic coordinate transformation:**
`xEcl = (cos(ω)cos(Ω) − sin(ω)sin(Ω)cos(I)) × x' + (−sin(ω)cos(Ω) − cos(ω)sin(Ω)cos(I)) × y'`
`yEcl = (cos(ω)sin(Ω) + sin(ω)cos(Ω)cos(I)) × x' + (−sin(ω)sin(Ω) + cos(ω)cos(Ω)cos(I)) × y'`

where:
- `xEcl, yEcl` — heliocentric ecliptic coordinates; AU
- `ω, Ω, I` — argument of perihelion, longitude of ascending node, inclination; all in radians for trig
- This is the standard 3D orbital-to-ecliptic rotation decomposed into the ecliptic plane projection

**Distance compression (logarithmic):**
`scaledDist = log(AU × 10 + 1)`

where:
- `AU` — heliocentric distance in astronomical units
- `scaledDist` — compressed display-space distance; dimensionless
- At AU=1 (Earth): scaledDist ≈ 2.40; at AU=30 (Neptune): scaledDist ≈ 5.71
- Compression ratio Earth/Neptune in real space: 30×; in log space: 2.38×

**Display scale:**
`cs = s × distanceScale` where `s = min(canvas.width, canvas.height)`
`maxDist = scaleDistance(a₀_Neptune)` — log-scaled distance of Neptune
`distScale = cs / maxDist`
`px = scaleDistance(pos.distance) × distScale × cos(angle)`
`py = scaleDistance(pos.distance) × distScale × sin(angle)`

where:
- `angle = atan2(pos.y, pos.x)` — ecliptic direction angle; radians
- `px, py` — canvas coordinates relative to canvas centre; pixels

**Planet and sun display size:**
`sunDisplayRadius = s × 0.04`
`sizeScale = sunDisplayRadius / 695700 × planetScale`
`screenRadius = max(planet.radius × sizeScale, 2)`

where:
- `695700` — solar radius in km (used as normalisation constant)
- `planet.radius` — planetary equatorial radius in km (from PLANET_DATA)
- `sizeScale` — converts km to canvas pixels, scaled by `planetScale` parameter
- Minimum screenRadius of 2 pixels ensures all planets are visible regardless of scale

**Local solar time:**
`solarTime = ((UTChours + UTCminutes/60 + UTCseconds/3600) / 24 + longitudeHours / 24) mod 1`
where `longitudeHours = longitude / 15`

where:
- `solarTime` — fraction of day [0, 1]; 0.5 = solar noon (facing sun), 0 = midnight
- `longitude` — from IP geolocation; degrees east

**Viewer position on Earth:**
`viewerAngle = earthOrbitAngle + solarTime × 2π`
`viewerX = earthX + earthScreenRadius × cos(viewerAngle)`
`viewerY = earthY + earthScreenRadius × sin(viewerAngle)`

where:
- `earthOrbitAngle = atan2(earthPos.y, earthPos.x)` — Earth's ecliptic direction
- `viewerAngle` — angle of viewer on Earth's disc; at solarTime=0.5 (noon), viewer faces the Sun

**FOV cone:**
`leftAngle = viewerAngle − fovRad/2`, `rightAngle = viewerAngle + fovRad/2`
Cone lines extend 20 pixels from viewer position in left and right directions.

where:
- `fovRad = fovAngle × DEG_TO_RAD`; `fovAngle` from params; degrees, range [10, 90]

**Emu War info text:**
`hrs = floor((Date.now() − EMU_WAR_MS) / 3600000)`
where `EMU_WAR_MS = new Date(1932, 10, 2, 11, 0, 0).getTime()` (2 November 1932, 11:00)

**Pluto distance (approximation):**
`plutoAngle = T × 0.004` (radians; simplified circular orbit approximation)
`distAU = sqrt((plutoX − earthX)² + (plutoY − earthY)²)` in AU
`distGiraffes = distAU × 149597870700 / 36`

where:
- `149597870700` — metres per AU
- `36` — assumed giraffe small intestine length in metres (fixed assumption)

**Precision note:** T accumulates from a fixed epoch. At the time of development (2026), T ≈ 0.26 centuries. No precision risk at current timescales for orbital element computation.

---

## Render Loop Order

`draw(ctx, canvas, params, frame)` executes in this order:

1. If `planets.length === 0`: call `initializePlanets()`, call `generateAsteroidBelt(params.asteroidCount || 300)`, call `requestLocation()` (fires async fetch; does not block)
2. If `asteroidParticles.length !== (params.asteroidCount || 300)`: call `generateAsteroidBelt(params.asteroidCount || 300)`
3. Compute `s = min(canvas.width, canvas.height)`, `cx = canvas.width / 2`, `cy = canvas.height / 2`
4. Compute `T = getCenturiesPastJ2000()` (reads `Date.now()`; ignores `frame` argument)
5. Clear canvas: `ctx.fillStyle = '#000000'`, `ctx.fillRect(0, 0, canvas.width, canvas.height)`
6. `ctx.save()`, `ctx.translate(cx, cy)` — coordinate origin at canvas centre
7. Compute `distanceScale`, `cs`, `maxDist`, `distScale`, `sizeScale`
8. Draw sun: white circle of radius `695700 × sizeScale` at origin
9. If `showAsteroidBelt`: call `drawAsteroidBelt(ctx, distScale)` (builds or uses cached screen positions)
10. For each of 8 planets (Mercury → Neptune): call `computePlanetPosition(planet, T)`; compute `angle`, `scaledDist`; compute `px, py`; store `screenX/Y/screenRadius` on planet; draw filled circle; if `showLabels`: draw text label
11. If `showViewer` and earth was found: call `getLocalSolarTime()`; compute `viewerAngle` and position; draw FOV cone (two line segments); draw viewer dot (2px cyan circle)
12. `ctx.restore()`
13. If `showInfo`: compute Emu War hours; draw counter text; compute Pluto approximate position; compute distance in giraffe units; draw distance text

---

## Rebuild Mechanism

There is no formal rebuild detection mechanism (no `_cfgKey`, no `_lastParams` comparison). The generator uses lazy initialisation:

- **First-frame init:** `planets.length === 0` — fires only once per module load. Planets are never reset regardless of parameter changes.
- **Asteroid regeneration:** `asteroidParticles.length !== params.asteroidCount` — triggers on any change to `asteroidCount`. Regeneration is stochastic (random positions); changing asteroidCount and changing it back produces a different belt layout.
- **Position caching:** `planet.cachedPos` is invalidated by `planet.lastT !== T`. Since T changes each real-world second, positions are recomputed at approximately 1s intervals matching `defaultFps: 1`.

All display parameters (`distanceScale`, `planetScale`, `showLabels`, `showInfo`, `showViewer`, `fovAngle`) are applied live each frame with no rebuild.

`canvasWidth` and `canvasHeight` are declared as parameters but are not read in `draw()` — the generator uses `canvas.width` and `canvas.height` from the host-provided argument. See `issues-and-conflicts.md`.
