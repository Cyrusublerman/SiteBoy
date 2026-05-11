# Generator Rules

Rules specific to generators on the unified generator host. All 22 generator scripts are bound by this contract. Per-script files may not override any rule here.

## 1. Non-Optional Host Parts

Mandatory for every generator page:

- top toolbar (generator selector, FIT/FILL/ACTUAL, INFO, EXPORT)
- canvas viewport
- `PARAMS` tab
- `OUTPUT` tab
- transport strip (PLAY / STOP / SPEED / TIMELINE) below the canvas

Conditional:

- sequencer/timeline strip iff animation is frame-addressable (see §7)
- `INFO` panel iff `infoSections` declared

Removed/forbidden:

- `ANIMATE` tab — deleted; transport lives below canvas, modulators live inline in PARAMS
- `CANVAS` tab — renamed to `OUTPUT`

## 2. Sidebar Law

Generator scripts declare data only.

A `.gen.js` file MAY export:

- `SCRIPT_CONFIG` — the config object
- `draw(ctx, canvas, params, frame)` — pure draw function (2d/webgl context)
- `setup(ctx, canvas, params)` — optional one-time init (2d/webgl context)
- `renderFrame(ctx, canvas, params, frameIndex, totalFrames)` — optional frame renderer for export
- `p5Setup(p, params)` — p5 init (p5 context only)
- `p5Draw(p, params, frame)` — p5 draw (p5 context only)

A `.gen.js` file MUST NOT contain or implement:

- sidebar tabs or DOM
- custom toolbar controls
- custom export panels
- animation timing logic (`requestAnimationFrame`, `setInterval`, `Date.now`)
- routing or URL manipulation
- component instantiation or event binding
- modulation calculation logic

The host derives all UI from `SCRIPT_CONFIG`. Scripts influence UI only through the declared config fields.

## 3. UI Law

Generator-specific UI must inherit the host, not compete with it.

Required:

- toolbar remains the sole display-mode owner (FIT/FILL/ACTUAL)
- sidebar remains the sole parameter owner
- canvas remains the sole output surface
- transport strip (below canvas) remains the sole playback control

Forbidden:

- overlay controls inside canvas
- custom right-side panels
- generator-local fit/fill/actual controls
- generator-local export chrome duplicating host export
- transport buttons inside the sidebar

## 4. Animation Law

All animation timing uses `AnimationFoundation`. Frame increment and playback are host-managed.

### Frame purity (required)

`draw()` reads `params.<key>` only. It MUST NOT read `frame` to compute time-driven motion. Time-driven motion (constant rotation, oscillation, drift) is expressed as default modulators declared in `animation.modulators[]`. The `frame` parameter remains in the signature for back-compat but using it to drive visual output is a violation.

Exception: a script may use `frame` as an opaque index for deterministic seeding or lookup (e.g. `Math.sin(frame * 0.01)` as a noise offset). The distinction is: is the time-derivation user-visible and should it be user-controllable? If yes → modulator. If no → frame index is acceptable.

Forbidden in generator scripts:

- internal `requestAnimationFrame`
- internal `setInterval`
- internal `setTimeout` loops
- p5 `loop()`-driven playback for host-managed scripts
- computing rotation, phase, or position directly from `frame / cycleFrames`

Required:

- frame progression comes from host playback
- same params + same frame ⇒ same output (determinism)
- pause state still renders a valid single frame

## 5. Tab and Layout Law

### Universal-test

Before placing a control, ask: *replace the script with a different one — does this concern still apply?*

- Yes → `OUTPUT` tab (host-level concern, applies to every script)
- No → `PARAMS` tab (script-level concern, specific to this algorithm)

### Tab assignment

| Concern | Tab |
|---|---|
| Script-specific knobs (radii, counts, modes, algorithm params) | PARAMS |
| Per-param modulation (LFO, linear, expression driver) | PARAMS — inline chip per param row |
| Presets, Randomise, Reset | PARAMS |
| Canvas size (width × height, aspect, pixel ratio) | OUTPUT |
| Per-layer colours, stroke widths, alphas | OUTPUT |
| Post-processing effects (grain, vignette, posterise) | OUTPUT |
| Play / Pause / Stop / Speed / Timeline | Transport strip below canvas |
| Loop length (`loopFrames`) | PARAMS — it is a script param |
| Seed | PARAMS — it is a script param |

### Density law

Related parameters read together MUST be laid out in a multi-column grid, not stacked:

- Paired numerics (width × height, min × max, R × G): 3-col `[input × input]`
- Palette rows: 5-col `[label | swatch | hex | width-or-alpha | mod-chip]`

Stacked single-column rows are reserved for unrelated, single-purpose params.

## 6. Config Law

Required fields for every script:

- `id` — kebab-case string, unique
- `title` — display title
- `category` — one of `parametric | wave | pattern | physics | other`
- `canvas.width`, `canvas.height` — positive integers
- `canvas.context` — one of `2d | webgl | p5`
- `parameters` — array of one or more `ParameterGroup` objects

Context-specific requirements:

- `2d/webgl`: `draw(ctx, canvas, params, frame)` required
- `p5`: `p5Draw(p, params, frame)` required; `p5Setup` optional but preferred

### Colourway layer schema

Each entry in `canvas.colourway[]`:

```javascript
{
    id:        string,          // camelCase, unique within script
    label:     string,          // shown in OUTPUT palette
    kind:      'stroke'|'fill', // determines which OUTPUT controls render
    colour:    string,          // hex
    alpha:     number,          // 0–1, default 1
    lineWidth: number,          // px, stroke layers only, default 1
    lineCap:   string,          // 'butt'|'round'|'square', optional
    lineJoin:  string,          // 'miter'|'round'|'bevel', optional
}
```

`kind` may be omitted for back-compat; the host infers it from the layer's first draw call.

### Modulator descriptor schema

Each entry in `animation.modulators[]`:

```javascript
{
    targetKey: string,          // matches a param key or colourway__<id>
    enabled:   boolean,         // default false — opt-in per user action
    driver: {
        type:   string,         // 'lfo'|'linear'|'expression'|'param-ref'|'curve'|'link'|'noise'
        config: object          // driver-specific fields; see driver-registry.js
    },
    shape: {
        easing:   string,       // 'linear'|'ease-in'|'ease-out'|'ease-in-out', default 'linear'
        quantise: number,       // snap steps (0 = off), use for integer params
        smooth:   number,       // slew rate (0 = off)
        invert:   boolean,      // flip signal
    },
    range: {
        depth:   number,        // fraction of swing, 0–1, default 1
        bias:    number,        // offset from base, default 0
        min:     number|null,   // null = inherit param def
        max:     number|null,
        bipolar: boolean,       // true = swing around base; false = swing above base
    },
    combine: string,            // 'add'|'multiply'|'replace'|'drift'|'max'|'min'
    sync: {
        clock:   string,        // 'free'|'loop'|'timeline'|'trigger'
        rateMul: number,        // multiplier, default 1
        trigger: string|null,
    }
}
```

Legacy format (`animatableParams: ['key']` or `animatableParams: [{ key, mode, rate }]`) is automatically migrated to `modulators[]` by the schema shim in `script-types.js` before validation. No hand-edit required for back-compat.

## 7. Sequencer Law

Use a sequencer iff the generator is frame-addressable.

Frame-addressable means:

- frame index changes output deterministically
- the script can render arbitrary frame `n` without replaying history

If this is false, the generator must not declare `sequencer: true`.

## 8. Rebuild Law

Structural params (those that rebuild cached data structures) may trigger a re-setup.

Presentation params must not rebuild data.

Examples:

- particle count may rebuild data
- grid resolution may rebuild data
- display mode must not rebuild data
- zoom/pan must not rebuild data
- colour changes must not rebuild data

## 9. Modulation Law

Modulation is a four-stage pipeline evaluated once per frame by `modulation-engine.js`:

```
driver.sample(state, t, frame, ctx)  →  number | string
  → shape stage  (easing, quantise, smooth, invert)
  → range stage  (depth, min, max, bias, polarity)
  → combine stage (add | multiply | replace | drift | max | min)
  → params[targetKey]
```

### Driver types (built-in)

| Driver | Output | Use |
|---|---|---|
| `lfo` | Oscillates | Periodic wobble, breathing |
| `linear` | Ramps | Constant rotation, drift, scrolling |
| `expression` | Arbitrary | Anything the others cannot express |
| `param-ref` | Maps another param | "Colour driven by viewX" |
| `curve` | Keyframe spline over loopFrames | Bespoke per-loop shapes |
| `link` | Another modulator's output | Sidechain, macro |
| `noise` | Perlin field | Non-periodic drift |

Custom drivers may be registered at runtime via `driver-registry.js`.

### Expression driver contract

The `expression` driver evaluates a user-typed function body within a sandboxed context defined in `expression-context.js`. That file is the single source of truth for all available variables and helpers. A contextual cheat-sheet popover MUST surface the same list at every expression input site.

Context includes: `t`, `frame`, `fps`, `loop`, `speed`, `TAU`, `PI`, `E`, `params`, `mods`, `prev`, `canvas`, `audio`, `pointer`, math helpers (`sin cos tan abs floor ceil round clamp lerp wrap map smoothstep`), noise helpers (`noise hash`), colour helpers (`hsl rgb mix gradient`).

### Evaluation order

Modulators evaluate in declaration order. A downstream modulator reading `params.<key>` sees the value already written by an upstream modulator in the same frame. Cycles are resolved via `prev.<key>` (previous frame) and produce a console warning.

### Integer params

Modulators on integer params (e.g. `numSpirals`, `meshRingCount`) MUST declare `shape.quantise: 1` (or higher) to prevent sub-integer values producing visible stepping artefacts.

## 10. OUTPUT Law

The OUTPUT tab contains host-level concerns shared by every script. A control belongs in OUTPUT iff it applies identically when the script is replaced by a different one.

Mandatory blocks:

- **SIZE** — width × height in a 3-col `[input × input]` grid with aspect-lock toggle
- **PALETTE** — one 5-col row per `colourway[]` entry; each row: label, swatch, hex input, width-or-alpha, modulator chip

Optional block (declared per-script via `output.post: true`):

- **POST** — grain, vignette, posterise, invert; collapsed by default

### What belongs in OUTPUT

Universal to every script: canvas dimensions, per-layer colour, per-layer stroke width, per-layer alpha, line cap/join, pixel ratio.

### What does NOT belong in OUTPUT

Algorithm-specific knobs, seed, loop length, geometry params, mode toggles. These define what is generated, not how the output is displayed.

## 11. Documentation Law

Per-generator docs must capture:

- what the generator is
- what files own it
- how it works
- what UI it exposes

Do not duplicate host rules inside per-generator packs. Link upward to this file instead.
