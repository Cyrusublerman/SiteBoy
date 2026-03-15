# Defecated — Issues and Conflicts

## ERROR

**[RESOLVED]** **[BUG] Generator is an unimplemented stub**
Full implementation present in `defecated.gen.js` v1.0.0: GLSL blur-threshold shader, 40-font cycling, power-curve morphology, offscreen buffer double-buffering, debug overlay.

**[RESOLVED]** **[ARCHITECTURE] WebGL context not supported by generator host**
Resolved by recreating the canvas in WEBGL mode inside `p5Setup` via `p.createCanvas(800, 600, p.WEBGL)`. Generator host does not need a `webgl` context option; p5.js manages the WEBGL canvas directly.

**[PARTIAL]** **[ARCHITECTURE] `text` input type not supported by SCRIPT_CONFIG**
Line content implemented as dropdown options (5 choices per line) rather than free-text input. Free-text input remains unsupported by the SCRIPT_CONFIG parameter system; content is constrained to the predefined word lists.

## WARN

**[RESOLVED]** **[STANDARDS] Inert `param` slider**
Replaced with full parameter set across Text, Layout, Timing, Effect, and Display groups.

**[DESIGN] Non-deterministic animation**
Font cycling uses Fisher-Yates shuffle backed by `Math.random()`, and morph timing uses `p.millis()` (wall-clock). Animation is non-deterministic and non-loopable. Documented in KNOWN LIMITATIONS and ANIMATION infoSections; GIF/WebM export disabled.

**[EXTERNAL DEPENDENCY] Google Fonts CDN**
40 font families still fetched from `fonts.googleapis.com` on init. No offline fallback; text renders in system fallback until CDN response arrives. Documented in KNOWN LIMITATIONS.

## NOTE

**[RESOLVED]** **[ARCHITECTURE] iframe isolation model in ToolBase**
Generator now uses standard `p5Setup`/`p5Draw` pattern. No iframe involved.

**[DESIGN] `blurMax = 24` Gaussian kernel at 31×31 resolution**
Gaussian blur samples up to 31×31 = 961 texels per output pixel within the GLSL fragment shader. At 800×600, ~460M texture reads/frame during peak morphing. Efficient on GPU; documented in PERFORMANCE infoSection.
