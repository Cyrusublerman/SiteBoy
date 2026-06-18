# Distort review issue register

Auto-extracted. Rows: 220

**WU-3 note:** `driveable` + `_applyNodeModulation` patch scalar `params` (centre-pixel) before `apply()`; true per-pixel modulation in-effect is not implemented — intentional for current pipeline.

|module|tag|summary|blocked_by|standalone|
|---|---|---|---|---|
|advection|NOTE|[PARITY] Module purpose and param semantics are not clearly communicated|phase10|no|
|advection|NOTE|[PARITY] No image-based vector source option|phase10|no|
|advection|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|affine|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|bandshift|ERROR|[BUG] NOISE mode output is broken — amplitude param has no coherent reference unit|phase10|no|
|bandshift|ERROR|[BUG] STEPPED mode output is a mess — params do not produce intelligible output|—|maybe|
|bandshift|WARN|[STANDARDS] Param semantics are unclear across modes — no unit labels, no tooltips|—|maybe|
|bandshift|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|bilateral|ERROR|[BUG] Module does not finish rendering — hangs or times out|G12|no|
|bilateral|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|boxblur|WARN|[PERFORMANCE] Module is slow at high radius/pass values|G12|no|
|boxblur|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|canny|WARN|[PARITY] Output is fixed monochrome — no colour mapping stage|phase10|no|
|canny|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|cellularautomata|ERROR|[PARITY] No image coupling — initialisation only uses threshold; no image-driven rule fields or forcing|phase10|no|
|cellularautomata|ERROR|[PARITY] No stepping control — warmup/steps-per-frame/freeze absent|phase10|no|
|cellularautomata|ERROR|[PARITY] Output is binary alive/dead overlay only — no derived fields or colour mapping|phase10|no|
|cellularautomata|WARN|[PARITY] Rule system is named presets only — no custom birth/survival set definition|phase10|no|
|channelmixer|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|chromaticab|ERROR|[PARITY] Effect is a naive uniform RGB split — not a proper chromatic aberration implementation|phase10|no|
|chromaticab|ERROR|[PARITY] Missing required params — full param set specified below|phase10|no|
|chromaticab|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|clahe|WARN|[STANDARDS] Should be merged with HISTOGRAM EQ into a single EQUALISATION module|—|maybe|
|colourbalance|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|contour|ERROR|[BUG] All four driveable params have non-functional driver slots — apply() omits modulate|G1|no|
|contour|WARN|[STANDARDS] Domain locked to BT.601 luminance — no alternative input field|—|maybe|
|contour|WARN|[STANDARDS] Band spacing is uniform only — no perceptual or histogram-adaptive banding|—|maybe|
|contour|WARN|[STANDARDS] Stroke colour is a single greyscale scalar (STROKE LVL 0–255) — no RGB, no source-derived colour|—|maybe|
|contour|NOTE|[PARITY] No region/fill output mode — module cannot produce filled contour bands|phase10|no|
|contour|NOTE|[PARITY] No field export — module cannot feed structural results downstream|phase10|no|
|contour|WARN|[PERFORMANCE] No previewMax cap on LEVELS or STROKE W — preview unprotected at max params|G12|no|
|contour|WARN|[STANDARDS] Name shows "CONTOUR" with "MODULE" prefix visible in picker|—|maybe|
|contour|ERROR|[BUG] Driver slot +D button non-functional — see G1|G1|no|
|contrast|WARN|[STANDARDS] CategoryPicker display name reads "LIFT/GAM/GAIN" instead of "CONTRAST"|—|maybe|
|contrast|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|curves|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|delaunaymesh|ERROR|[PARITY] Seed placement is not image-aware — density is spatially uniform|phase10|no|
|delaunaymesh|ERROR|[PARITY] No density field — no gradient/edge/contrast-weighted seeding|phase10|no|
|delaunaymesh|ERROR|[PARITY] No seed optimisation — no relaxation or Lloyd iteration|phase10|no|
|delaunaymesh|WARN|[PARITY] Topology limited to Delaunay only — no Voronoi, hex, quad, or adaptive subdivision|phase10|no|
|delaunaymesh|WARN|[PARITY] No wire/border render modes — fill only|phase10|no|
|delaunaymesh|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|dilateerode|ERROR|[BUG] SHAPE param is non-functional — forwarded to UI but not to algorithm call|—|maybe|
|dilateerode|ERROR|[BUG] RADIUS marked driveable but apply() lacks modulate parameter — driver modulation impossible|G1|no|
|dilateerode|WARN|[STANDARDS] Module is framed as a direct image effect — incorrect for a morphological primitive|—|maybe|
|dilateerode|WARN|[STANDARDS] Algorithm identity unverified — legacy docs reference grayscaleDilate/grayscaleErode; live code imports morp|phase10|no|
|dilateerode|WARN|[PERFORMANCE] O((2r+1)²) per-pixel cost — no worker offload confirmed; slow at full radius on large images|G12|no|
|dilateerode|ERROR|[BUG] Driver slot +D button non-functional — see G1|G1|no|
|dither|ERROR|[PARITY] Dithering method set is incomplete|phase10|no|
|dither|WARN|[STANDARDS] Standalone module is redundant — dithering is a sub-operation of quantisation|—|maybe|
|dither|NOTE|[PERFORMANCE] Combined QUANTISE module performance must be reviewed post-merge|G12|no|
|dog|WARN|[PARITY] Output is fixed monochrome — no colour mapping stage|phase10|no|
|dog|NOTE|[STANDARDS] No enforcement of Sigma 2 > Sigma 1 — invalid param combinations possible|—|maybe|
|dog|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|domainwarp|ERROR|[PARITY] Module only performs whole-image coordinate warp — target selection and selective warp absent|G12|no|
|domainwarp|WARN|[PARITY] Warp field type is limited — no field type selection|phase10|no|
|domainwarp|WARN|[PARITY] Directional mode is implicit — no control over how noise becomes displacement|phase10|no|
|domainwarp|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|filmgrain|ERROR|[PARITY] Module is a simple overlay — not a field-driven grain system|phase10|no|
|filmgrain|ERROR|[PARITY] No multi-scale or multi-layer grain — single noise source only|phase10|no|
|filmgrain|ERROR|[PARITY] Chromatic toggle is too blunt — no channel processing system|phase10|no|
|filmgrain|WARN|[PARITY] No tonal zone controls — single LUMINANCE RESPONSE slider|phase10|no|
|filmgrain|WARN|[PARITY] No image-reactive driver mapping — grain does not respond to edge, contrast, or structural fields|G1|no|
|filmgrain|ERROR|[PARITY] No field output — grain cannot be reused by downstream modules|phase10|no|
|filmgrain|WARN|[PARITY] No temporal control — no deterministic per-frame grain, drift, or baked state|phase10|no|
|flowfield|WARN|[PARITY] No seed control for Perlin noise|phase10|no|
|flowfield|NOTE|[PARITY] No octave/layer control for Perlin noise|phase10|no|
|flowfield|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|gaussblur|WARN|[PERFORMANCE] Module is slow at high radius/sigma values|G12|no|
|gaussblur|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|gradientmap|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|grating|ERROR|[PARITY] Module is a static overlay — not a field-driven pattern system|phase10|no|
|grating|WARN|[STANDARDS] Mode-conditional params must be hidden when mode is not active (global — see _global_issues.md G14)|G1|no|
|grating|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|greyscale|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|halftonepattern|WARN|[PARITY] Module is a single hardcoded dot pattern — architecture does not accommodate future pattern types|phase10|no|
|halftonepattern|WARN|[PARITY] Response source is hardcoded to luminance — no control over what image value drives dot size|phase10|no|
|halftonepattern|WARN|[PARITY] Response curve is hardcoded — no control over mapping shape|phase10|no|
|halftonepattern|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|highpass|WARN|[STANDARDS] Module miscategorised under SHARPEN — high pass is a frequency separation filter, not a sharpening operation|—|maybe|
|histogrameq|ERROR|[BUG] STRENGTH param has no meaningful output|—|maybe|
|histogrameq|WARN|[STANDARDS] Should be merged with CLAHE into a single EQUALISATION module|—|maybe|
|hsl|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|hsladjust|ERROR|[STANDARDS] Duplicate module — hsladjust is functionally identical to hsl|—|maybe|
|hsladjust|WARN|[STANDARDS] HSL module CategoryPicker label should be renamed to "HSL"|—|maybe|
|interference|ERROR|[BUG] All four driveable params have non-functional driver slots — apply() omits modulate|G1|no|
|interference|ERROR|[PARITY] Refractive index hardcoded at n = 1.33 — not user-accessible|phase10|no|
|interference|WARN|[STANDARDS] Thickness field locked to luminance — no alternative source domain|—|maybe|
|interference|WARN|[STANDARDS] No separation between base thickness and luminance coupling strength|—|maybe|
|interference|NOTE|[PARITY] No field output — OPD, phase, and fringe bands are computed and discarded|phase10|no|
|interference|NOTE|[PARITY] No luminance-preserving render mode — interference always replaces or blends full RGB|G13|no|
|interference|NOTE|[PARITY] No temporal logic — phase is static per render invocation|phase10|no|
|interference|WARN|[STANDARDS] IRIDESCENCE label is ambiguous — does not describe what the param actually controls|—|maybe|
|interference|ERROR|[BUG] Driver slot +D button non-functional — see G1|G1|no|
|invert|NOTE|[PARITY] No independent invert-luminosity vs invert-colour control|phase10|no|
|invert|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|iterrewarp|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|laplacian|WARN|[STANDARDS] NORMALIZE param is ambiguous — behaviour is undefined|—|maybe|
|laplacian|WARN|[PARITY] Output is fixed monochrome — no colour mapping stage|phase10|no|
|laplacian|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|lensbubbles|WARN|[PARITY] No control over bubble position noise — missing seed, translation, and noise params|phase10|no|
|lensbubbles|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|levels|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|lumflow|WARN|[STANDARDS] CategoryPicker display name reads "LUMINANCE FLOW" — should be "LUMFLOW" or vice versa; names must be consis|—|maybe|
|lumflow|ERROR|[PARITY] Module covers only the base pattern layer of the reference — seven higher-level systems are absent|phase10|no|
|median|WARN|[PERFORMANCE] Median blur is inherently expensive at larger radii|G12|no|
|median|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|moduleflowlines|ERROR|[PARITY] Module has enormous issues and requires a complete rebuild against reference|phase10|no|
|moduleflowlines|WARN|[PARITY] Rendering is monochrome scalar only — no colour control|phase10|no|
|moduleflowlines|WARN|[PARITY] Seed grid is uniform only — no adaptive or luminance-weighted seeding|phase10|no|
|moduleflowlines|WARN|[PARITY] No variable step integration — fixed forward Euler only|phase10|no|
|moduleflowlines|WARN|[STANDARDS] FRAME param required — advection is iteration-based|—|maybe|
|moduleflowlines|NOTE|[PARITY] SVG export exists via DistortActions.exportSVG() but not exposed in NodePanel — see _global_issues.md G10|G1|no|
|moduleflowlines|NOTE|[PARITY] All range params listed as lacking getModulated() calls — driver system not wired|G1|no|
|moduleflowlines|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|moduleserpentine|ERROR|[BUG] Module is non-functional|—|maybe|
|moduleserpentine|ERROR|[STANDARDS] Duplicate of serpentine — redundant module|—|maybe|
|modulestaticlines|ERROR|[BUG] Module is non-functional|—|maybe|
|modulestaticlines|ERROR|[STANDARDS] Duplicate of statichalftone — redundant module|—|maybe|
|moire|ERROR|[PARITY] Module is a static overlay — not a field-driven interference system|phase10|no|
|moire|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|motionblur|NOTE|[PARITY] No directional weighting/anisotropy control|phase10|no|
|motionblur|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|openclose|ERROR|[BUG] RADIUS marked driveable but apply() lacks modulate parameter — driver modulation impossible|G1|no|
|openclose|WARN|[STANDARDS] No SHAPE/kernel control — structuring element shape is implicit in algorithm|—|maybe|
|openclose|WARN|[STANDARDS] Module locked to direct RGBA image morphology — no domain selection|—|maybe|
|openclose|NOTE|[PARITY] Extended compound operations absent — TOPHAT, BLACKHAT, OPEN-CLOSE, CLOSE-OPEN, GRADIENT not implemented|phase10|no|
|openclose|NOTE|[PARITY] No residue or field output — module cannot export structural results downstream|phase10|no|
|openclose|WARN|[PERFORMANCE] Double-pass O((2r+1)²) cost — no worker offload confirmed; >500 ms at radius 10, 4K|G12|no|
|openclose|ERROR|[BUG] Driver slot +D button non-functional — see G1|G1|no|
|otsuthreshold|WARN|[STANDARDS] Computed threshold value is not exposed — module operates as a black box|—|maybe|
|otsuthreshold|WARN|[STANDARDS] No threshold bias or offset control|—|maybe|
|otsuthreshold|WARN|[STANDARDS] Domain locked to BT.601 luminance — no alternative input domain|—|maybe|
|otsuthreshold|NOTE|[PARITY] No post-segmentation cleanup — thresholded output often contains speckle, holes, and isolated islands|phase10|no|
|otsuthreshold|NOTE|[PARITY] No field output mode — module cannot export segmentation result for downstream pipeline use|phase10|no|
|otsuthreshold|NOTE|[PARITY] Multi-level Otsu not implemented — single binary threshold only|phase10|no|
|paintstroke|ERROR|[PARITY] Module is not a painter — it is a stochastic dot depositor|phase10|no|
|paintstroke|ERROR|[PARITY] No placement strategy — purely random dot placement|phase10|no|
|paintstroke|ERROR|[PARITY] No directional strokes — no stroke angle, length, or edge/gradient alignment|phase10|no|
|paintstroke|ERROR|[PARITY] No multi-pass coarse-to-fine reconstruction|phase10|no|
|paintstroke|ERROR|[PARITY] No error-driven refinement — no reconstruction error tracking|phase10|no|
|paintstroke|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|perlinoverlay|WARN|[STANDARDS] Module name is inconsistent — dropdown shows "NOISE OVERLAY", module header shows "PERLINOVERLAY"|—|maybe|
|perlinoverlay|ERROR|[PARITY] Module is a raw Perlin multiply layer — not a field-driven noise system|phase10|no|
|perlinoverlay|WARN|[PARITY] Only Perlin noise supported — no noise family selection|phase10|no|
|perlinoverlay|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|pixelate|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|polarcoords|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|posterize|ERROR|[PARITY] Posterise is missing per-channel control|phase10|no|
|posterize|WARN|[STANDARDS] Standalone module is redundant — posterisation is a mode of quantisation|—|maybe|
|quantise|ERROR|[PARITY] Dithering entirely absent|phase10|no|
|quantise|ERROR|[PARITY] Palette selection is severely limited|phase10|no|
|quantise|ERROR|[PARITY] No palette-from-image sampling|phase10|no|
|quantise|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|radialblur|NOTE|[PARITY] No canvas-click centre point picker|phase10|no|
|radialblur|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|reactiondiffusion|ERROR|[PARITY] Module lacks image-responsive simulation — no image-driven seeding, parameter fields, or forcing|phase10|no|
|reactiondiffusion|ERROR|[PARITY] No stepping control — warmup steps, steps-per-frame, and freeze/evolve mode absent|phase10|no|
|reactiondiffusion|ERROR|[PARITY] No output mapping controls — simulation field is not legibly rendered|phase10|no|
|reactiondiffusion|WARN|[PARITY] Presets are labels only — no spatial preset blending or image-driven parameter families|G13|no|
|ripple|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|scanlines|WARN|[STANDARDS] Two params both labelled OPACITY — naming collision|—|maybe|
|scanlines|ERROR|[PARITY] Line system is too primitive — fixed horizontal stripes only|phase10|no|
|scanlines|ERROR|[PARITY] Module is a visible overlay only — no field output, no image modification|phase10|no|
|scanlines|WARN|[PARITY] No image-reactive behaviour — line pattern is globally uniform|phase10|no|
|scanlines|WARN|[PARITY] No channel processing system — single monochrome stripe|phase10|no|
|scanlines|WARN|[PARITY] No temporal behaviour — static only|phase10|no|
|sdfshape|ERROR|[BUG] All seven driveable params have non-functional driver slots — apply() omits modulate|G1|no|
|sdfshape|ERROR|[PARITY] Signed distance field computed then immediately discarded — the core geometric information is not exposed|phase10|no|
|sdfshape|WARN|[STANDARDS] No outline mode — most fundamental SDF rendering mode absent|—|maybe|
|sdfshape|WARN|[STANDARDS] RING annulus width hardcoded at size × 0.15 — not user-controllable|—|maybe|
|sdfshape|WARN|[STANDARDS] No non-uniform scale or rotation — module cannot align to composition|—|maybe|
|sdfshape|WARN|[STANDARDS] FILL R/G/B split across tier 4 and tier 5 — inconsistent grouping; wrong colour control model|—|maybe|
|sdfshape|NOTE|[PARITY] Shape vocabulary limited to 3 primitives — ellipse, capsule, rounded box, polygon absent|phase10|no|
|sdfshape|NOTE|[PARITY] No image-modification-by-field mode — SDF cannot modulate image properties by distance|phase10|no|
|sdfshape|ERROR|[BUG] Driver slot +D button non-functional — see G1|G1|no|
|serpentine|ERROR|[BUG] Blending/compositing appears broken — module may not be rasterised correctly into the pipeline|G13|no|
|serpentine|ERROR|[PARITY] No FRAME param — time/iteration state is inaccessible|phase10|no|
|serpentine|ERROR|[PARITY] Missing oscillation bounds controls — no spawn rate, no vertical bounds|phase10|no|
|serpentine|WARN|[PARITY] Drag response shaping absent — no response curve or curve strength|phase10|no|
|serpentine|WARN|[PARITY] No line tension subsystem|phase10|no|
|serpentine|WARN|[PARITY] Rendering is monochrome scalar only — no explicit colour control|phase10|no|
|serpentine|NOTE|[PARITY] SVG export not exposed in module — see _global_issues.md G10|G1|no|
|serpentine|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|sobel|WARN|[PARITY] Output is fixed monochrome — no colour mapping stage|phase10|no|
|sobel|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|spherize|WARN|[PARITY] AMOUNT param maximum is too low|phase10|no|
|spherize|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|statichalftone|NOTE|[PARITY] Post-serpentine review recommended|phase10|no|
|statichalftone|WARN|[STANDARDS] FRAME param likely required — time/iteration state|—|maybe|
|statichalftone|NOTE|[PARITY] SVG export not exposed in module — see _global_issues.md G10|G1|no|
|statichalftone|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|stipple|ERROR|[PARITY] Module is not a stippler — it is fixed-radius random dot placement|phase10|no|
|stipple|ERROR|[PARITY] No density field — placement is uniform random, not luminance-driven|phase10|no|
|stipple|ERROR|[PARITY] No seeding algorithm choice — no Poisson, no weighted rejection, no jittered grid|phase10|no|
|stipple|ERROR|[PARITY] No relaxation/optimisation — points are never moved toward correct distribution|phase10|no|
|stipple|ERROR|[PARITY] No size mapping — all dots are fixed radius|phase10|no|
|stipple|ERROR|[PARITY] No multiscale passes — no coarse-to-fine reconstruction|phase10|no|
|stipple|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|temptint|WARN|[STANDARDS] Redundant module — temperature and tint params should be folded into HSL|—|maybe|
|tileblend|ERROR|[PARITY] Source region is not explicitly controllable — tiling is blunt full-image repetition|phase10|no|
|tileblend|ERROR|[PARITY] Topology limited to simple grid repeat and mirror — no kaleidoscope, mosaic, or recursive modes|phase10|no|
|tileblend|WARN|[PARITY] No per-tile transform variation — all tiles are identical|phase10|no|
|tileblend|WARN|[PARITY] Combination logic is shallow — only mix + exposure + gamma|phase10|no|
|tileblend|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|truchet|ERROR|[PARITY] Module is a static overlay — not a field-driven pattern system|phase10|no|
|truchet|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|twirl|NOTE|[PARITY] No canvas click-to-pick for centre point — see _global_issues.md G6|phase10|no|
|twirl|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|unsharpmask|ERROR|[BUG] Driver slot button non-functional — see _global_issues.md G1|G1|no|
|vibrance|WARN|[STANDARDS] Redundant standalone module — vibrance param should be folded into CONTRAST|—|maybe|
|vignette|ERROR|[PARITY] Spatial definition is too shallow — locked to centred oval with one roundness control|phase10|no|
|vignette|ERROR|[PARITY] Module only darkens — no other render modes|phase10|no|
|vignette|ERROR|[PARITY] No field output — vignette cannot drive downstream modules|phase10|no|
|vignette|WARN|[PARITY] No image-aware modulation — purely geometric|phase10|no|
|vignette|WARN|[PARITY] No image modification mode — only composites over image|phase10|no|
|voronoi|WARN|[STANDARDS] Module is redundant — Voronoi tessellation covered by DELAUNAY MESH|—|maybe|
|wavedistortion|ERROR|[PARITY] Module is a static ripple distortion — not a stateful wave simulation|phase10|no|
|wavedistortion|ERROR|[PARITY] No emitter system — single implicit ripple source only|phase10|no|
|wavedistortion|ERROR|[PARITY] No image coupling — wave field does not respond to image data|phase10|no|
