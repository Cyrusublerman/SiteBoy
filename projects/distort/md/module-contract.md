Every effect module is a plain JavaScript module file exporting a single default object that satisfies the following shape:

```js
{
  id:          string,           // unique kebab-case identifier
  name:        string,           // display name in the UI
  category:    string,           // one of the 21 canonical categories
  description: string,           // one-sentence tooltip
  params:      ParamDeclaration[], // declarative parameter list
  gpuEligible: boolean,          // true iff apply() can delegate to GPUFoundation
  apply(src, dst, w, h, params, ctx, modulate): void,   // required — pixel raster
  buildGeometry?(w, h, params):  GeometryResult,        // optional — SVG/vector output
  buildAnimFrame?(frameIdx, totalFrames, params): ParamPatch, // optional — animation
}
```

### `apply(src, dst, w, h, params, ctx, modulate)`

The core pixel-raster method. Arguments:

| Arg | Type | Description |
|---|---|---|
| `src` | `Uint8ClampedArray` | Source pixel buffer (RGBA, row-major) |
| `dst` | `Uint8ClampedArray` | Destination pixel buffer (pre-allocated, same size) |
| `w`, `h` | `number` | Canvas width and height in pixels |
| `params` | `object` | Resolved parameter values keyed by `id` |
| `ctx` | `object` | Host context: `{ seed, quality, frameIdx, totalFrames }` |
| `modulate` | `function` | Per-pixel modulation hook — `modulate(x, y) → float [0,1]` |

The function must be pure with respect to `src`; it may write only to `dst`. It must not allocate persistent state.

### `ParamDeclaration`

```js
{
  id:      string,
  label:   string,
  type:    'range' | 'select' | 'bool' | 'colour' | 'text',
  default: any,
  // type-specific fields:
  min?, max?, step?,           // for 'range'
  options?: { label, value }[], // for 'select'
}
```

The pipeline engine resolves all param values at runtime and passes the resolved `params` object to `apply()`. Modules do not read from DOM.

### `buildGeometry(w, h, params)`

Returns a `GeometryResult` that the host converts to an SVG layer:

```js
{ shapes: [ { type: 'path'|'circle'|'rect'|'line', attrs: {} } ] }
```

Called only when the EXPORT SVG action is triggered. The `[Export SVG]` button in the EXPORT dropdown is shown only when at least one node in the stack exports `buildGeometry`.

### `buildAnimFrame(frameIdx, totalFrames, params)`

Returns a `ParamPatch` — a partial `params` object — that overrides the base params for a specific frame. The pipeline engine merges the patch before calling `apply()`. Used for procedural animation: the module declares what changes each frame without managing its own loop.

### Capability flags

| Flag | Effect |
|---|---|
| `gpuEligible: true` | `apply()` may call `GPUFoundation.dispatch(...)`. Falls back to CPU if tier is insufficient. |
| `buildGeometry` defined | Host shows EXPORT SVG in export dropdown. |
| `buildAnimFrame` defined | Host shows FRAME COUNT and FPS sliders in the Canvas tab. |

A module may implement `buildAnimFrame` without `gpuEligible`. A module that defines `buildGeometry` and `buildAnimFrame` may produce animated SVG sequences.
