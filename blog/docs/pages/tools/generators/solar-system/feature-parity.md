# Solar System — Feature Parity

## Feature Inventory

Three legacy docs were consolidated. `solar-system.md` (mixed bundle) and `SOLAR-SYSTEM-TOOL-README.md` (page doc) are treated as spec sources. `solar-system-audit.md` (audit only) carries forward previously identified gaps. Features are cross-checked against the live source.

| Feature | Legacy source | Status in live source | Notes |
| --- | --- | --- | --- |
| Real-time planetary positions (8 planets) | solar-system.md, README | Confirmed | `computePlanetPosition` using T from `Date.now()` |
| Keplerian orbital elements (all 6 + rates) | solar-system.md, README | Confirmed | PLANET_DATA contains a0, aDot, e0, eDot, I0, IDot, L0, LDot, w0, wDot, O0, ODot for all 8 planets |
| Kepler equation solver (Newton-Raphson) | solar-system.md, README | Confirmed | `solveKeplerEquation` — 30 max iterations, 1e-6° tolerance |
| Logarithmic distance scaling | solar-system.md, README | Confirmed | `scaleDistance`: `log(AU × 10 + 1)` |
| Viewer position on Earth (local solar time) | solar-system.md, README | Confirmed | `_getLocalSolarTime`, viewer dot drawn on Earth's disc |
| FOV cone | solar-system.md | Confirmed | Two line segments from viewer dot; angle controlled by `fovAngle` |
| Asteroid belt | solar-system.md, README | Confirmed | Particles [2.2, 3.2] AU; count: [100, 1000]; ImageData putImageData rendering (two-level cache) |
| IP-based geolocation (no permission popup) | solar-system.md, README | Confirmed | `fetch('https://ipapi.co/json/')` in `_requestLocation()` |
| Export PNG | solar-system.md | Confirmed | Export config: `png: true` |
| Export SVG | solar-system.md | Confirmed | Export config: `svg: true` |
| Hours since Emu War (Easter egg) | solar-system-audit.md (undocumented), README | Confirmed | `EMU_WAR_MS = new Date(1932, 10, 2, 11, 0, 0).getTime()` |
| Planet selection / click interaction | solar-system.md | Absent | No click event handling in live source. This was a feature of the prior ToolBase implementation, not ported to the `.gen.js` format. |
| Planet trails (circular buffer) | solar-system.md, solar-system-audit.md | Absent | Not implemented. Audit confirms this was missing in the prior implementation; not ported. |
| `showTrails` parameter | solar-system.md | Absent | Parameter listed in spec; not in `SCRIPT_CONFIG.parameters` in live source |
| `trailLength` parameter | solar-system.md | Absent | Same — in spec, not in live source |
| Angular separation display | solar-system.md, solar-system-audit.md | Absent | No measurement display in live source |
| Custom date/time selection | solar-system.md | Absent | Generator reads `Date.now()` only; no time-travel controls |
| Reset button | solar-system-audit.md | Absent | Host feature; not a generator concern |
| Distance to Pluto in giraffe units (Easter egg) | solar-system-audit.md (undocumented) | Confirmed | Present in `showInfo` block; Pluto approximated as circular orbit |
| Canvas size controls (canvasWidth/Height) | solar-system.md | Removed | Parameters removed in v5.0.0 — were declared but never wired to `draw()` |
| VGA colour palette for planets | README | Confirmed | All PLANET_DATA colors are VGA palette values |

---

## Host Feature Audit

| Host feature | Used? | Notes |
| --- | --- | --- |
| Presets | Yes — 3 presets | Default, Dense Belt, Minimal; values nested under `values: {}` key (non-standard preset format — still open) |
| INFO tab | Yes | `infoSections` fully populated with DESCRIPTION, ALGORITHM, PARAMETERS, PRESETS, PERFORMANCE, ANIMATION, KNOWN LIMITATIONS, REFERENCES |
| Animation config | Yes | `type: 'infinite'`, `defaultFps: 1`, `sequencer: false`, `animatableParams: []` inside animation block |
| Export config | Yes — explicit | `png: true, svg: true, gif: false, webm: false, sequence: false` |
| animatableParams | Declared | `animatableParams: []` inside `animation` block — empty; frame argument intentionally unused; non-deterministic by design |

---

## Parity Holes

1. **Planet trails absent.** Described in `solar-system.md` and confirmed missing by `solar-system-audit.md`. The circular buffer and trail rendering were not ported from the prior ToolBase implementation to the `.gen.js` format.

2. **`showTrails` and `trailLength` parameters absent.** Listed in the spec's parameter table; not present in `SCRIPT_CONFIG.parameters` in the live source.

3. **Planet selection/click interaction absent.** The prior implementation supported clicking planets to select them (up to 2 for measurement). This UI interaction cannot exist in the `.gen.js` format without host support for canvas click events — not ported.

4. **Angular separation and distance measurement absent.** Depended on planet selection; absent without it.

5. **Custom date/time selection absent.** The generator uses `Date.now()` unconditionally. No time-travel or historical position display is possible.

6. **Non-standard preset format.** Each preset wraps its values under `values: {}` instead of placing them directly in the preset object. Standard contract requires `name` plus all parameter keys at the top level.

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | behaviour | Keplerian orbital mechanics pipeline | reference/generators/solar-system/source/solar-system.gen.js:58-152 | J2000 time base, Newton solve, ecliptic transform |
| R-02 | behaviour | logarithmic distance scaling and planet render | reference/generators/solar-system/source/solar-system.gen.js:154-199,250-303 | compressed AU display model |
| R-03 | behaviour | asteroid belt generation/render cache | reference/generators/solar-system/source/solar-system.gen.js:162-199 | cached belt positions |
| R-04 | behaviour | Earth viewer/FOV and info overlays | reference/generators/solar-system/source/solar-system.gen.js:304-361 | local solar time, cone, info text |
| R-05 | param | display/asteroid/viewer/canvas controls | reference/generators/solar-system/source/solar-system.gen.js:438-539 | includes inert canvas params |
| R-06 | interaction | infinite realtime loop + export/presets | reference/generators/solar-system/source/solar-system.gen.js:382-436 | realtime draw semantics |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | function | initializePlanets | 47-56 | R-01 |
| F-02 | function | getCenturiesPastJ2000 | 58-61 | R-01 |
| F-03 | function | getLocalSolarTime | 63-77 | R-04 |
| F-04 | function | solveKeplerEquation | 79-98 | R-01 |
| F-05 | function | normalizeAngle | 100-104 | R-01 |
| F-06 | function | computePlanetPosition | 106-152 | R-01, R-02 |
| F-07 | function | scaleDistance | 154-156 | R-02, R-03 |
| F-08 | function | generateAsteroidBelt | 162-176 | R-03 |
| F-09 | function | drawAsteroidBelt | 178-199 | R-03 |
| F-10 | function | requestLocation | 205-218 | R-04 |
| F-11 | function | draw | 224-362 | R-02, R-03, R-04 |
| F-12 | top-level-stmt | SCRIPT_CONFIG object | 368-542 | R-05, R-06 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | Keplerian orbital mechanics pipeline | assets/js/tools/generators/scripts/other/solar-system.gen.js:36-94 | same mechanics with method/closure clean-up |
| L-02 | behaviour | logarithmic distance scaling and planet render | assets/js/tools/generators/scripts/other/solar-system.gen.js:96-98,307-380 | same render model |
| L-03 | behaviour | asteroid belt generation/render cache | assets/js/tools/generators/scripts/other/solar-system.gen.js:227-280,340-342 | two-level cache + ImageData path |
| L-04 | behaviour | Earth viewer/FOV and info overlays | assets/js/tools/generators/scripts/other/solar-system.gen.js:282-303,382-426 | same overlay model |
| L-05 | param | display/asteroid/viewer controls | assets/js/tools/generators/scripts/other/solar-system.gen.js:187-212 | inert canvas params removed |
| L-06 | interaction | infinite realtime loop + export/presets | assets/js/tools/generators/scripts/other/solar-system.gen.js:117-130,180-185 | animation/export semantics retained |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | Kepler pipeline | L-01 | present | solar-system.gen.js:36-94 | same algorithm, refactored methods | none | — |
| R-02 | planet render/scaling | L-02 | present | solar-system.gen.js:96-98,307-380 | none | none | — |
| R-03 | asteroid belt cache/render | L-03 | present | solar-system.gen.js:227-280 | upgraded to ImageData batch draw | none | — |
| R-04 | viewer/info overlays | L-04 | present | solar-system.gen.js:282-303,382-426 | none | none | — |
| R-05 | parameter surface | L-05 | partial | solar-system.gen.js:187-212 | inert canvasWidth/canvasHeight removed | none | P2 |
| R-06 | loop/export/presets | L-06 | present | solar-system.gen.js:117-130,180-185 | standards metadata normalised | none | — |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Kepler and rendering helpers remain inlined in generator module

**Check 2 — Foundation usage**
- AnimationFoundation: no raw RAF/interval APIs
- GPUFoundation: no raw GPU APIs

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module
- MathematicalFoundation: orbital/layout maths inlined

**Check 4 — State scope smells**
- module-level mutable state from reference removed; live stores mutable state on SCRIPT_CONFIG `this.*`

**Issues logged:** ARCH-027

### Performance Tier Audit

**Primary workload:** lightweight 2D canvas + per-planet O(1) mechanics  
**Optimisation status:** asteroid rendering upgraded to cached ImageData batch path

**Issues logged:** none

### v4 issues logged

- ARCH-027, DOC-045, DOC-046

### v4 questions queued

- none (solar-system turn)
