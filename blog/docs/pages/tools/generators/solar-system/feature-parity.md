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
