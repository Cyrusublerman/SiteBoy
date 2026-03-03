# Effect Module Style Guide

How effect modules present through the DISTORT ToolBase interface.

**Scope:** UI presentation of effect modules only. Does not cover algorithm implementation or structural requirements. Does not repeat `ui-interface-overview.md` — it maps each site ideology principle to the constraints of the module domain.

**UPSTREAM:**
- `blog/docs/site/ui-interface-overview.md` — Site-wide design ideology
- `blog/docs/guides/effect-module-standards.md` — Structural requirements
- `blog/docs/guides/tools/effect-module-build-guide.md` — Authoring steps

---

## 1. Ideology Mapping

| Site Principle | Module-Domain Constraint |
|----------------|--------------------------|
| **Grid Absolutism** | paramDef `step` for spatial params (px, radius, offset) must snap to F-grid multiples (14, 7, 28) where the output renders on a canvas. Non-spatial params (amounts, ratios) are exempt. Slider heights and gaps are handled by ToolBase automatically. |
| **Single-Sheet Reality** | Node panels in the PIPELINE tab stack flush with shared 1px borders. No per-node background colour. No card chrome. Collapsed node shows only its name; expanded shows only paramDef controls. |
| **Informative Minimalism** | `paramDef.label` is the only text shown per parameter. No tooltips, no helper text, no inline documentation. The label alone must make the parameter's purpose unambiguous. |
| **Component Monotheism** | paramDefs map to exactly three ComponentLibrary control types: range slider (default), Dropdown (`type: 'select'`), Checkbox (`type: 'toggle'`). No custom controls. |
| **Zero Ambiguity** | Labels must name the effect, not the value. Use `NOISE SCALE` not `SCALE`. Use `CENTRE X` not `CX`. Use `ITERATIONS` not `N`. |
| **Hierarchy as Function** | PIPELINE tab > node row > param controls. Three levels, always. No param controls outside the CONTROLS tab. No node-level headings inside the stack beyond the node name. |
| **Silence** | No icons, no category colour coding, no decorative separators beyond shared 1px borders. |

---

## 2. Naming Conventions

| Item | Rule | Permitted | Forbidden |
|------|------|-----------|-----------|
| paramDef label | UPPERCASE, max 16 chars | `AMOUNT`, `CENTRE X`, `NOISE SCALE` | `scale`, `centreX`, `Noise Scale`, `N` |
| Standard abbreviations | Allowed | `FPS`, `RGB`, `HSL`, `LUT`, `RMS` | All others |
| Node display name | UPPERCASE, max 20 chars | `SPHERIZE`, `REACTION DIFFUSION` | `Spherize`, `RD` |
| Type string | lowercase, no spaces, no hyphens | `spherize`, `reactiondiffusion` | `Spherize`, `reaction-diffusion`, `rd` |
| Category name in registry | UPPERCASE, spaces allowed, `/` for sub-group | `COLOUR / TONE`, `LINE RENDER` | `Colour`, `line_render` |
| Select option strings | UPPERCASE | `NEAREST`, `BILINEAR`, `NONE` | `nearest`, `Nearest` |
| paramDef key | camelCase | `centreX`, `noiseScale` | `centre_x`, `NoiseSCale` |

---

## 3. Control Tier Hierarchy

Every node panel renders controls in a fixed tier order. The order moves from **universal and non-optional** at the top to **specific and optional** at the bottom. Declare `paramDefs` keys in tier order so the rendered control sequence matches.

### Tier structure (top to bottom)

```
┌─────────────────────────────────────────┐
│  [ ✓ ]  NODE NAME              [ × ]   │  ← Header row (not a paramDef)
├─────────────────────────────────────────┤
│  OPACITY         ──────●──────   0.80  │  ← Tier 1: Universal base
├─────────────────────────────────────────┤
│  LINE COLOUR     ■ #ffffff              │  ← Tier 2: Type-specific base
│  BG COLOUR       ■ none / #000000      │    (vector nodes only)
│  LINE WIDTH      ──●──────────   1.50  │
├─────────────────────────────────────────┤
│  [primary param] ──────────●──   0.60  │  ← Tier 3: Primary algorithm params
│  [primary param] ──●──────────   0.20  │    (1–3 params, highest impact)
├─────────────────────────────────────────┤
│  [secondary param] ────●──────   0.40  │  ← Tier 4: Secondary params
│  [secondary param] ──────●────   2.00  │    (refinements, adjustments)
├─────────────────────────────────────────┤
│  SAMPLING        NEAREST ▾             │  ← Tier 5: Quality / mode
│  ITERATIONS      ──────────●  200     │    (sampling, edge handling,
│  WRAP            CLAMP ▾               │     iteration counts)
├─────────────────────────────────────────┤
│  MASK SOURCE     NONE ▾                │  ← Mask section (always last)
│  INVERT          [ ]                   │    Collapsed by default
│  FEATHER         ●──────────────   0  │
└─────────────────────────────────────────┘
```

### Tier definitions

| Tier | Name | Present | Content |
|------|------|---------|---------|
| **Header** | Node row | Always | Enable checkbox, node name, expand/collapse, remove |
| **1** | Universal base | Always | `opacity` only — from `EffectNode.opacity`, not a paramDef |
| **2** | Type-specific base | By node type | Vector: `lineColour`, `bgColour`, `lineWidth`. Composite: `blendMode`. See table below. |
| **3** | Primary params | Always | 1–3 paramDefs with highest visual impact on the algorithm output |
| **4** | Secondary params | Most nodes | Refinements that modulate the primary effect |
| **5** | Quality / mode | Where applicable | `sampling`, `iterations`, `wrap`, `edgeMode` — rarely changed after initial setup |
| **Mask** | Mask block | Always | Fixed block at bottom: `mask.source`, `mask.invert`, `mask.feather` — rendered by NodePanel, not paramDefs |

### Type-specific Tier 2 params

| Node type | Tier 2 params | Components |
|-----------|---------------|------------|
| Vector / line render | `lineColour` (color), `bgColour` (color), `lineWidth` (slider) | color, color, slider+number |
| Composite overlay | `blendMode` (dropdown) | dropdown |
| Colour / tone | none — start at Tier 3 | — |
| All others | none — start at Tier 3 | — |

---

## 4. Component Selection Matrix

Which ToolBase component to use for which data type. Apply these rules consistently across all nodes.

### Numeric params

| Data characteristic | Component | Config |
|--------------------|-----------|--------|
| Continuous float, small range (0–1, 0–2π) | `slider` | `withNumber: true`, `step: 0.01` |
| Continuous float, wide range (0–100, 0–1000) | `slider` | `withNumber: true`, `step` ≥ 1 or fractional |
| Integer count ≤ 20 (grid N, octaves, passes) | `stepper` | `step: 1` |
| Integer count > 20 (iterations, pixel radius) | `slider` | `step: 1`, `withNumber: true` |
| Exact numeric entry, no slider makes sense | `number` | precision set to match step |

**Rule: always use `withNumber: true` on sliders for effect nodes.** Image processing params require precise control that a slider position alone cannot give.

### Categorical params

| Data characteristic | Component | Config |
|--------------------|-----------|--------|
| 2–3 mutually exclusive options, frequently compared | `radio` | inline, UPPERCASE items |
| 4+ options, or infrequently changed | `dropdown` | UPPERCASE options |
| Single boolean flag (independent on/off) | `toggle` | single item in array |
| Multiple independent flags that combine | `toggle` | multi-item array |

**`radio` vs `dropdown` rule:** If users need to visually compare the options (e.g. NEAREST vs BILINEAR vs BICUBIC sampling where the difference is visible), use `radio`. If the list is long or the choice is set-and-forget, use `dropdown`.

**`toggle` rule:** Never use a single-item `toggle` for a fundamental on/off state that affects the whole node — that belongs in the header enable checkbox. Use `toggle` only for optional feature flags within the algorithm (e.g. WRAP EDGES, INVERT, NORMALISE).

### Colour params

| Data characteristic | Component |
|--------------------|-----------|
| RGB/RGBA colour selection (line, fill, background) | `color` |

Always present `color` in Tier 2 for vector nodes. Never use a text input or hex `number` field for colour.

### File params

| Data characteristic | Component |
|--------------------|-----------|
| Source image upload | `file` (accept: `image/*`) |
| Mask image upload | `file` (accept: `image/*`) — rendered in Mask block, not paramDefs |
| Modulation map upload | `file` (accept: `image/*`) — rendered in Modulation block, not paramDefs |

### Action params (buttons)

| Action | Component | Placement |
|--------|-----------|-----------|
| Stack-level: ADD EFFECT, UNDO, REDO, CLEAR | `button` | PIPELINE tab, Stack block |
| Node-level: RANDOMISE SEED (if applicable) | `button` | Inside node body, Tier 5 |
| Export: SAVE RECIPE, EXPORT PNG | `button` | EXPORT tab |

### Output / status components

| Use case | Component |
|----------|-----------|
| Read-only computed values (resolution, count) | `value` |
| Render progress | `progress` (indeterminate while rendering) |
| Section label inside a complex node body | `label` with `variant: 'caption'` — use sparingly |

### Precision rule

Slider numeric readout precision is determined by `step`:

| step | Displayed precision |
|------|---------------------|
| ≥ 1 | Integer |
| 0.1 | 1 decimal |
| 0.01 | 2 decimals |
| 0.001 | 3 decimals |

---

## 5. Modulation System

Modulation attaches a per-pixel influence source to an individual numeric param, overriding its constant value with a spatially varying value at render time.

### Decision: typed expression vs dropdown

**Do NOT use typed expressions in input fields.** Reasons:
- Violates Component Monotheism: a slider that accepts both `0.5` and `@mask*sin(t)` is not a slider
- Violates Zero Ambiguity: the control's semantic becomes unclear
- Breaks bijection: `node.params[key]` must be a number for the pipeline to read it
- Expression parsing belongs to `ExpressionEval.js` and is scoped to seed/frame params only

**Use a compact inline dropdown** on each eligible slider row. The dropdown is a suffix to the param row, not a separate block.

### Modulation sources

| Source ID | Description | Available when |
|-----------|-------------|----------------|
| `(none)` | No modulation; use constant param value | Always |
| map name | Greyscale image uploaded as a mod map | `AppState.modMaps` is non-empty |
| `FRAME` | Normalised frame index 0→1 over animation duration | Multi-frame mode active |

The modulation dropdown shows `—` when no source is selected. When a source is selected, the effective param value at each pixel is: `base_value * (1 - amount + mapValue * amount)`.

### Modulation UI rules

- The inline mod dropdown appears on **numeric slider rows only** (not colour, file, dropdown, or toggle params)
- It is **absent** when `AppState.getModMapNames()` returns empty and multi-frame is off
- It renders as a compact `dropdown` (≤ 60px wide) appended to the right of the slider row — inside the same 2F row height
- A modulation **amount** slider (0–1) appears below the row only when a source is actively assigned

```
NOISE SCALE  ──────●──────  0.40  [MAP1 ▾]
                   ●──────────  1.00   ← amount (only when MAP1 is active)
```

### Mask system

Masks operate at node level (not per-param). Every node has a mask section rendered by NodePanel below all paramDef controls:

| Control | Component | Tier |
|---------|-----------|------|
| MASK SOURCE | `dropdown`: NONE, LUMINANCE, GRADIENT, UPLOAD | Mask block |
| INVERT | `toggle` (single item) | Mask block |
| FEATHER | `slider`, range 0–20, step 1, `withNumber: true` | Mask block |
| [mask file] | `file` (accept: `image/*`) — appears only when SOURCE = UPLOAD | Mask block |

The mask block is **always the last block** in the node panel, regardless of node type. It is rendered by NodePanel infrastructure, not declared in `paramDefs`.

---

## 7. Layout and Proportions

Rules derived from MFP, Algorithms Test Lab, and ToolBase canvas patterns. These govern how the DISTORT viewport and stack interact with ToolBase layout, not the content of pixel output.

### Viewport canvas config

```javascript
canvas: {
  fillContainer: true,   // viewport fills available area
  displayMode: 'fit',    // image fitted inside, centred
  enableZoom: true,      // scroll-to-zoom
  enablePan: true        // drag-to-pan
}
```

Rationale: image processing output is arbitrary size and content. `fit` with zoom/pan preserves the Tool Primacy principle without imposing a fixed canvas size on image data.

### Sidebar dimensions

| Dimension | Value | F-multiple |
|-----------|-------|-----------|
| Sidebar width | 420px | 30F |
| Tab rail height | 28px | 2F |
| Control height | 28px | 2F |
| Gap between controls | 7px | F/2 |
| Block padding | 14px | 1F |

These are handled automatically by ToolBase. Do not override them.

### Stack panel within sidebar

The effect stack list lives inside a sidebar block (not in the canvas area). It is a scrollable ordered list of node rows. Each row height = 2F (28px) collapsed; expanded height varies with paramDef count.

```
PIPELINE tab
└── Stack block
    ├── [+ ADD EFFECT]    ← button, full width, 2F
    ├── [UNDO] [REDO]     ← button pair, half width each, 2F
    └── node rows...      ← each 2F collapsed, expands in-place
        ├── ▸ NODE NAME   ← header: enable, name, opacity, remove
        └── [params]      ← F/2 gap between param controls
```

No right panel, no floating panel, no overlay. All controls are in the sidebar. The canvas area is exclusively for image output.

### Canvas area

Contains only the rendered pipeline image. No controls, sliders, or text overlaid on the canvas except:

- Zoom/pan state is handled by ToolBase's built-in interaction layer
- A single status label below the canvas (ToolBase `setStatus()`) may show resolution and quality

### Action module pattern (from MFP)

All stateful operations (stack manipulation, rendering, history, export) live in dedicated action modules with no DOM access. The main tool file wires callbacks only.

```
distort-main.js         ← TOOL_CONFIG + mount only
DistortActions.js       ← stack, render queue, history, export (no DOM)
```

---

## 8. Canvas Output Colour

The canvas displays the **output of the image processing pipeline** — arbitrary RGBA pixel data. There is no colour constraint on pipeline output.

**VGA palette applies only to UI elements** (borders, backgrounds, text), and only via `var(--c-*)` tokens through ToolBase/ComponentLibrary. Nodes have no UI code, so this constraint is automatically satisfied.

| Context | Rule |
|---------|------|
| Pipeline output (canvas) | Any colour — determined by input image and applied effects |
| UI chrome (sidebar, tabs, borders) | `var(--c-bg)`, `var(--c-text)`, `var(--c-border)` only — via ToolBase |
| Node code | No colour-setting code of any kind |

---

## 9. Preview Quality Contract

Every node must render at `ctx.quality === 'preview'` producing an output that:

1. Is visually recognisable as the same effect
2. Completes faster than full quality
3. Does not error or produce a blank result

### Per-type strategies

| Node type | Preview strategy |
|-----------|-----------------|
| Iteration-heavy | `Math.min(preview_cap, this.params.iterations)` where `preview_cap` is documented in the node |
| Convolution | Reduce kernel radius: `Math.ceil(r * ctx.previewScale)` |
| Spatial warp/distort | Scale spatial params: `param * ctx.previewScale` |
| Sampling-heavy | Nearest-neighbour only; skip sub-pixel interpolation |
| Generative | Reduce grid resolution proportionally |
| Colour/LUT | No preview strategy needed; apply full quality (computation is O(n)) |

**Hard rule:** The effect must be visible in preview. Zero-output preview is a defect.

---

## 10. Category Taxonomy

Standard categories with precise semantic definitions. A node belongs to exactly one category. When a node spans two categories, assign to the more specific one.

| Category Name | Semantic Definition |
|---------------|---------------------|
| `COLOUR / TONE` | Per-pixel RGBA transforms with no spatial dependence. Each output pixel depends only on the corresponding input pixel. |
| `BLUR` | Spatial averaging: convolution-based (box, Gaussian) or accumulation-based. Output pixel depends on a neighbourhood of input pixels. |
| `SHARPEN` | Inverse of blur. Amplifies high-frequency spatial content (unsharp mask, high-pass filter). |
| `TRANSFORM` | Affine or projective geometric transforms. Output pixel position is a linear function of input position. |
| `WARP` | Spatially-varying displacement. Each pixel is moved by a vector field that varies across the image (flow field, advection, band shift). |
| `REFRACTION` | Lens-like optical displacement. Displacement pattern mimics refraction (ripple, lens bubbles). Distinguishable from WARP by physical optics analogy. |
| `DISTORTION` | Non-linear geometric distortion not fitting WARP or REFRACTION (spherize, twirl, polar coordinates, chromatic aberration). |
| `ACCUMULATION` | Iterative self-application. The output of one pass is fed as input to the next (iterative rewarp). |
| `LINE RENDER` | Generates vector line geometry (polylines) that is rasterised to pixels via `vectorToRaster`. Output is line-based, not pixel-based. |
| `EDGE` | Detects boundaries or transitions in the image. Output is a response to local intensity gradient (Sobel, Canny, DoG, Laplacian). |
| `PATTERN` | Procedural tile-based or periodic structure generation overlaid on or replacing the image (Truchet, grating, moiré, halftone). |
| `NOISE` | Noise-based overlay or displacement. Uses structured pseudorandom functions (Perlin overlay, domain warp). |
| `PHYSICS` | Simulation-based effects where output evolves via a physical model (reaction-diffusion, wave equation, cellular automata). |
| `GENERATIVE` | Stroke or paint generation that produces output independent of input pixel values (paint strokes, particle trails). |
| `COMPOSITE` | Multi-source or multi-element compositing. Combines the pipeline image with tiled copies, stipple grids, or mesh overlays. |
| `TEXTURE` | Photographic or physical texture overlaid on the image (film grain, vignette, scanlines). |
| `MORPHOLOGY` | Mathematical morphology on binary or greyscale images (dilation, erosion, opening, closing). |
| `SEGMENTATION` | Thresholding or region extraction producing a binary or labelled output (Otsu threshold, histogram segmentation). |
| `GEOMETRIC` | Geometric primitive rendering derived from image data (Voronoi diagram, contour lines, signed distance field shape). |
| `OPTICS` | Physical optics simulation (wave interference, diffraction patterns). Distinguishable from PHYSICS by optics-domain specificity. |

**New category rule:** If a node does not fit any category above, propose a new category with a definition using the same semantic format before creating it. Do not add the node to the closest-sounding category if the definition does not fit.

---

## 11. Prohibited Patterns

| Pattern | Violation | Alternative |
|---------|-----------|-------------|
| Raw hex in node code affecting UI | Grid Absolutism / Color System | Nodes have no UI code |
| `style.color`, `style.background` in node | Single-Sheet Reality | Use ComponentLibrary via ToolBase |
| Custom DOM elements per node | Component Monotheism | All controls via paramDefs → ToolBase |
| Inline CSS in node file | Grid Absolutism | No CSS in node files |
| Per-node font or font-size override | Hierarchy as Function | Typography inherited from ToolBase |
| Icons, emojis, colour-coded categories | Silence | Text labels only |
| Gradients, shadows, rounded corners | Single-Sheet Reality | Explicitly prohibited |
| Node-level help text or documentation | Informative Minimalism | Redirect to `effect-module-build-guide.md` |
| More than 20 paramDef entries per node | Informative Minimalism | Split into two nodes or reduce exposed params |
| paramDef label with lowercase | Zero Ambiguity | UPPERCASE only |
| paramDef label > 16 chars | Grid Absolutism | Abbreviate or reword |
| Select options with mixed case | Zero Ambiguity | UPPERCASE only |

---

## 12. Style Compliance Checklist

Pre-submission check (distinct from the structural checklist in `effect-module-standards.md`):

| # | Check | Question |
|---|-------|----------|
| 1 | Label casing | Are ALL paramDef labels UPPERCASE? |
| 2 | Label length | Are ALL labels ≤ 16 characters? |
| 3 | Label clarity | Does each label describe the effect, not the value? |
| 4 | Type string | Is the type string lowercase with no spaces or hyphens? |
| 5 | Category fit | Does the node's category match the semantic definition exactly? |
| 6 | Select options | Are all dropdown option strings UPPERCASE? |
| 7 | Tier order | Are paramDefs declared in tier order: type-specific base → primary → secondary → quality/mode? |
| 8 | Component selection | Does each param use the correct component per the Component Selection Matrix (§4)? |
| 9 | Number display | Do all sliders use `withNumber: true`? |
| 10 | UI colour | Does the node contain zero colour-setting code? (All UI colour via ToolBase.) |
| 11 | Modulation | Is modulation via inline dropdown only — no typed expressions in inputs? |
| 12 | Preview quality | Is the effect visually present in preview mode? |

Any "no" response requires correction before the node is accepted.
