# Defecated — Issues and Conflicts

## ERROR

**[BUG] Generator is an unimplemented stub**
`defecated.gen.js` fills the canvas black and exposes one inert `param` slider. No content from the intended implementation is present.
Status: blocked pending architectural host extensions (see migration-log).

**[ARCHITECTURE] WebGL context not supported by generator host**
The intended effect requires a WebGL context for the GLSL blur-threshold shader. The current generative-tool-host supports `2d` and `p5` (P5.js 2D) contexts only. A `webgl` context option must be added to the host before this generator can be migrated.

**[ARCHITECTURE] `text` input type not supported by SCRIPT_CONFIG**
The three user-configurable text lines (`line1`, `line2`, `line3`) require free-text inputs. The SCRIPT_CONFIG parameter system only defines `slider`, `dropdown`, and `toggle` types. Host extension is required.

## WARN

**[STANDARDS] Inert `param` slider**
`param: slider 1–100, default 50` is declared but never read in the `draw` function.

**[DESIGN] Non-deterministic animation**
Font cycling relies on `shuffleArray` (random) and `millis()` (wall-clock). This is incompatible with frame-based determinism required for pre-render, export, and replay. Migration would require either: (a) accepting non-deterministic output with no pre-render, or (b) redesigning with a seeded PRNG and `frame`-based timing.

**[EXTERNAL DEPENDENCY] Google Fonts CDN**
40 fonts loaded from `fonts.googleapis.com`. No offline fallback. Network latency affects first-render quality; fonts may render in fallback face before loading completes.

## NOTE

**[ARCHITECTURE] iframe isolation model in ToolBase**
`defecated-tool.js` generates an HTML string containing the full P5 sketch and injects it into an iframe via `generateHTML()`. This approach is incompatible with the current generator host model, which expects a synchronous `draw` function. Replacing the iframe with a direct P5 WebGL instance requires significant host-level changes.

**[DESIGN] `blurMax = 24` Gaussian kernel at 31×31 resolution**
Gaussian blur samples up to 31×31 = 961 texels per output pixel, all within the GLSL fragment shader. At 800×600, this is ~460M texture reads/frame during peak morphing. Efficient on GPU but may require reduced canvas resolution on mobile.
