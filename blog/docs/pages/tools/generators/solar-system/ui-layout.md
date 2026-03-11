# Solar System — UI Layout

## Parameter Table

| Key | Label | Type | Min | Max | Step | Default | Group | Controls | Rebuild? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `distanceScale` | Distance Scale | slider | 0.2 | 0.8 | 0.05 | 0.45 | Display | Fraction of the shorter canvas dimension allocated to the full orbit span. `cs = s × distanceScale`; `distScale = cs / maxDist`. Higher values spread orbits further out; lower values compress them toward centre. | No |
| `planetScale` | Planet Scale | slider | 0.5 | 3.0 | 0.1 | 1.0 | Display | Multiplier on computed planet display radii: `screenRadius = max(planetRadius × sizeScale × planetScale, 2)`. At 1.0, radii are proportional to true planetary sizes relative to the Sun. | No |
| `showLabels` | Show Labels | toggle | — | — | — | false | Display | When true, draws each planet's name in grey monospace text above its circle. | No |
| `showInfo` | Show Info | toggle | — | — | — | true | Display | When true, draws two info lines at the canvas bottom: hours since the Great Emu War, and distance to Pluto in giraffe small intestines. | No |
| `asteroidCount` | Particles | slider | 100 | 1000 | 50 | 300 | Asteroid Belt | Number of asteroid belt particles. Changing this triggers regeneration of the belt with new random positions. The resulting belt layout differs from any prior layout. | Yes (asteroid regeneration) |
| `showAsteroidBelt` | Show Belt | toggle | — | — | — | true | Asteroid Belt | When true, renders the cached asteroid positions as 1×1 pixel rects in white or grey. | No |
| `showViewer` | Show Viewer | toggle | — | — | — | true | Viewer | When true, draws the viewer marker on Earth: a 2px cyan dot at the local-solar-time position, plus a FOV cone of two line segments. | No |
| `fovAngle` | FOV Angle | slider | 10 | 90 | 5 | 30 | Viewer | Opening angle of the FOV cone in degrees. The cone lines extend 20 pixels in the left and right directions from the viewer dot. Wider angles show a broader viewing arc. | No |
| `canvasWidth` | Width | slider | 400 | 1600 | 100 | 800 | Canvas | Declared in parameters but **not read in `draw()`**. The generator uses `canvas.width` from the host argument. This parameter has no effect on the rendered output. See `issues-and-conflicts.md`. | No |
| `canvasHeight` | Height | slider | 400 | 1600 | 100 | 800 | Canvas | Declared in parameters but **not read in `draw()`**. Same issue as `canvasWidth`. | No |

---

## Preset Table

Preset values are nested under a `values` key in each preset object (non-standard format; see `issues-and-conflicts.md`).

| Name | Key values | Visual character |
| --- | --- | --- |
| Default | distanceScale: 0.45, planetScale: 1.0, asteroidCount: 300, showAsteroidBelt: true, showViewer: true, showLabels: false, showInfo: true, fovAngle: 30 | Baseline: moderate orbit spread, proportional planet sizes, sparse belt, viewer visible, info text visible. No labels (relies on spatial knowledge). |
| Dense Belt | distanceScale: 0.45, planetScale: 1.0, asteroidCount: 1000, showAsteroidBelt: true, showViewer: false, showLabels: true, showInfo: true, fovAngle: 30 | High asteroid density (1000 particles); planet labels shown; viewer hidden. Emphasises the asteroid belt visual band. |
| Minimal | distanceScale: 0.5, planetScale: 1.5, asteroidCount: 100, showAsteroidBelt: false, showViewer: false, showLabels: true, showInfo: false, fovAngle: 30 | Clean view: no belt, no viewer, no info; planets are larger and further out; labels present. Pure planetary position display. |

---

## Sidebar Structure

```
PARAMS
  Display
    Distance Scale (slider)
    Planet Scale (slider)
    Show Labels (toggle)
    Show Info (toggle)
  Asteroid Belt
    Particles (slider)
    Show Belt (toggle)
  Viewer
    Show Viewer (toggle)
    FOV Angle (slider)
  Canvas
    Width (slider)
    Height (slider)
ANIMATE  (present — animation config: type: infinite, defaultFps: 1, canPrerender: false)
EXPORT   (present — export config: png: true, svg: true, gif: false, webm: false, sequence: false)
INFO     (present — description field exists)
```

---

## UX Notes

- `canvasWidth` and `canvasHeight` are inert parameters: they are present in the UI but moving their sliders produces no change to the rendered output. This is a known bug (`issues-and-conflicts.md`).

- `distanceScale` and `asteroidCount` are the only parameters with meaningful structural effect. All others are visibility toggles or scale multipliers applied live.

- `asteroidCount` changes regenerate the belt with fresh random positions. Users adjusting this slider live will see a new random belt layout each time, not a denser or sparser version of the previous one.

- The generator runs at `defaultFps: 1`. At this rate, each frame represents one real-world second. Planet positions are accurate to the current second. Users will not see smooth planet motion — they will see discrete second-by-second position updates.

- The viewer position on Earth depends on IP geolocation (fetched once, asynchronously). On first load, the geolocation request is in flight; the viewer may appear at an incorrect position (based on UTC wall-clock hours) until the response arrives. This is invisible in the UI — there is no loading state.

- `showInfo` renders the Emu War counter and Pluto distance. These are computed from `Date.now()` every frame, so they update in real time.

- `fovAngle` only affects the visual width of the FOV cone lines. It does not change the viewer position or any astronomical calculation.
