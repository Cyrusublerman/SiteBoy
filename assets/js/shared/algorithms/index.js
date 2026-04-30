/**
 * @fileoverview Algorithms Library — Pure Functional Implementations
 * 
 * Location: assets/js/shared/algorithms/
 * 
 * Modular collection of algorithms extracted from Wikipedia reference documentation.
 * All functions are pure and stateless following functional programming principles.
 * 
 * NOTE: This is the production library. Reference documentation (.md files) remain
 * in blog/ideas/reference documentation/ for research purposes only.
 * 
 * Modules:
 * - core/math-utils: Vector math, statistics, interpolation, Hamming distance
 * - core/matrix: Convolution kernels, matrix operations
 * - core/coordinate-transforms: Polar mapping, projections, oscilloscope rendering
 * - combinatorics/sequences: Multifilament printing sequence generation
 * - color/color-utils: RGB/hex conversion, color distance, GIMP palette I/O
 * - color/quantization: Floyd-Steinberg dithering, spatial filtering, layer expansion
 * - layout/grid-layout: Grid dimension calculation for calibration prints
 * - geometry/stl-generation: STL file generation, pixel vectorization
 * - image/image-utils: Scan analysis, color extraction from grids
 * - edge-detection/edge-operators: Sobel, Canny, LoG, gradient operators
 * - segmentation/thresholding: Otsu thresholding, connected components
 * - sampling/point-distribution: Poisson disk, Halton, importance sampling
 * - space-filling/space-filling-curves: Hilbert, Peano, L-systems
 * - tsp/path-optimization: Path optimization (nearest neighbor, 2-opt)
 * - noise/noise-functions: Simplex noise, Perlin, fBm, domain warping
 * - astronomy/time-anchors: Historical/scientific time anchors across 11 scales (Big Bang → seconds)
 * - patterns/pattern-generators: Truchet tiles, gratings, moiré, superellipse
 * - patterns/halftone-patterns: Line halftone, contour lattice, dyadic scaling
 * - geometry/sdf-operations: Signed distance functions, boolean ops
 * - geometry/bin-packing: Rectangle packing algorithms
 * - geometry/marching-squares: Contour extraction from scalar fields
 * - geometry/spatial-index: K-d tree, radius search, spatial hash
 * - geometry/curve-geometry: Extrusion, normals, curvature, depth sorting
 * - physics/advection: Flow field advection, particle tracing
 * - physics/reaction-diffusion: Gray-Scott, cellular automata
 * - physics/wave-solver: 1D/2D wave equation simulation
 * - distance/jfa: Jump Flood Algorithm for distance transforms
 * - distance/geodesic: Fast marching geodesic distance, Laplace solver
 * - optics/interference: Thin-film interference, birefringence, conoscopy
 * - features/hog: Histogram of Oriented Gradients
 * - image/posterization: Tone quantization, level reduction
 * - image/image-analysis: Glyph density, feature matching, coherence
 * - audio/wav-encoder: WAV file encoding, audio generation
 * - audio/dsp-evaluator: DSP equation parsing and evaluation
 * - animation/animation-utils: LFO, perfect loops, easing, morphing
 * - rendering/rendering-utils: Sprite caching, pseudo-3D, jittered sampling
 * - line/flow-line-engine: Wavefront flow lines, streamline tracing
 * - line/serpentine-line-engine: Luminance-responsive serpentine path
 * - line/static-line-engine: Parallel grid lines with displacement
 * - line/line-engine-common: Shared clipping, bounds, seeded RNG, path length
 * - line/front-propagation-core: Generic iterative front propagation
 * - field/vector-field: 2-D vector field creation, normalisation, sampling
 * - field/base-gradient: Sobel gradient VectorField from RGBA pixels
 * - image/morphology: Binary and greyscale erosion/dilation/open/close
 * - painter/brush-engine: Circular brush stamp and polyline painting
 * - painter/layer-tracker: RGBA layer accumulation and alpha-over flattening
 * - image/colour-adjustments: Histogram EQ, CLAHE, channel mixer, vibrance, temp/tint, gradient map
 * - image/blur-filters: Bilateral filter, motion blur, radial blur (zoom/spin)
 * - image/spatial-filters: Unsharp mask, high pass
 * - image/texture-overlays: Film grain, vignette, scanlines
 * - image/compositing: Luminance-weighted stipple, tile blend
 * - geometry/distortion: Band shift, spherize, twirl, chromatic aberration, lens bubbles
 * 
 * @example
 * import { EdgeDetection, Sampling, SpaceFilling, TSP, Noise, Patterns, SDF } from './shared/algorithms/index.js';
 */

// ═══════════════════════════════════════════════════════════════════════════
// CORE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════
export { MathUtils } from './core/math-utils.js';
export { Matrix } from './core/matrix.js';
export * as CoordinateTransforms from './core/coordinate-transforms.js';

// ═══════════════════════════════════════════════════════════════════════════
// MULTIFILAMENT PRINTING (New modules for 3D print tool)
// ═══════════════════════════════════════════════════════════════════════════
export * as Combinatorics from './combinatorics/sequences.js';
export * as ColorUtils from './color/color-utils.js';
export * as ColorQuantization from './color/quantization.js';
export * as STLGeneration from './geometry/stl-generation.js';
export * as GridLayout from './layout/grid-layout.js';
export * as ImageUtils from './image/image-utils.js';
export * as CSVExport from './data/csv-export.js';

// ═══════════════════════════════════════════════════════════════════════════
// ALGORITHM MODULES (Namespace exports)
// ═══════════════════════════════════════════════════════════════════════════
export * as EdgeDetection from './edge-detection/edge-operators.js';
export * as Segmentation from './segmentation/thresholding.js';
export * as Sampling from './sampling/point-distribution.js';
export * as SpaceFilling from './space-filling/space-filling-curves.js';
export * as TSP from './tsp/path-optimization.js';
export * as Geometry from './geometry/polygon-operations.js';
export * as Noise from './noise/noise-functions.js';
export * as ValueNoise from './noise/value-2d.js';
export * as WorleyNoise from './noise/worley-2d.js';
export * as WhiteGaussianNoise from './noise/white-gaussian-2d.js';
export * as RidgedFbm from './noise/ridged-fbm-2d.js';
export * as Turbulence from './noise/turbulence-2d.js';
export * as BlueNoiseMask from './noise/blue-noise-mask-2d.js';
export * as PaintStroke from './rendering/paintstroke-error.js';
export * as Patterns from './patterns/pattern-generators.js';
export * as HalftonePatterns from './patterns/halftone-patterns.js';

// Geometry extensions
export * as SDF from './geometry/sdf-operations.js';
export * as BinPacking from './geometry/bin-packing.js';
export * as MarchingSquares from './geometry/marching-squares.js';
export * as Delaunay from './geometry/delaunay-2d.js';
export * as Voronoi2D from './geometry/voronoi-2d.js';
export * as SpatialIndex from './geometry/spatial-index.js';
export * as CurveGeometry from './geometry/curve-geometry.js';

// Physics
export * as Advection from './physics/advection.js';
export * as ReactionDiffusion from './physics/reaction-diffusion.js';
export * as WaveSolver from './physics/wave-solver.js';

// Distance
export * as JFA from './distance/jfa.js';
export * as Geodesic from './distance/geodesic.js';

// Optics
export * as Optics from './optics/interference.js';

// Features
export * as HOG from './features/hog.js';
export * as FeatureExtraction from './features/feature-extraction.js';
export * as GaussianKernelMath from './math/gaussian-kernel-1d.js';

// Image
export * as Posterization from './image/posterization.js';
export * as ImageAnalysis from './image/image-analysis.js';
export * as ImageAdjustments from './image/image-adjustments.js';
export * as ImageResize from './image/image-resize.js';

// Color & Dithering (Color Quantizer algorithms)
export * as ColorSpace from './color/color-space.js';
export * as Dither from './dither/index.js';

// Audio
export * as WavEncoder from './audio/wav-encoder.js';
export * as DSPEvaluator from './audio/dsp-evaluator.js';

// Animation
export * as Animation from './animation/animation-utils.js';

// Export utilities
export * as ExportUtils from './export/export-utils.js';

// Rendering
export * as Rendering from './rendering/rendering-utils.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Edge Detection
// ═══════════════════════════════════════════════════════════════════════════
export { 
    sobel, 
    canny, 
    laplacian, 
    laplacianOfGaussian,
    differenceOfGaussians,
    structureTensor 
} from './edge-detection/edge-operators.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Segmentation
// ═══════════════════════════════════════════════════════════════════════════
export { 
    otsuThreshold, 
    applyThreshold,
    connectedComponents,
    floodFill 
} from './segmentation/thresholding.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Sampling
// ═══════════════════════════════════════════════════════════════════════════
export { 
    poissonDisk, 
    variablePoissonDisk,
    haltonSequence,
    lloydRelaxation,
    importanceSampling 
} from './sampling/point-distribution.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Space-Filling Curves
// ═══════════════════════════════════════════════════════════════════════════
export { 
    HilbertCurve, 
    PeanoCurve, 
    MooreCurve,
    ZOrderCurve,
    LSystem,
    CurveUtils 
} from './space-filling/space-filling-curves.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: TSP
// ═══════════════════════════════════════════════════════════════════════════
export { 
    nearestNeighbor, 
    twoOpt, 
    christofides,
    solveTSP,
    computePathLength 
} from './tsp/path-optimization.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Geometry
// ═══════════════════════════════════════════════════════════════════════════
export {
    pointInPolygon,
    polygonArea,
    polygonCentroid,
    polygonBounds,
    packSquaresInPolygon
} from './geometry/polygon-operations.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Noise Functions
// ═══════════════════════════════════════════════════════════════════════════
export {
    perlin2D,
    simplex2D,
    fbm2D,
    domainWarp2D,
    multiWarp2D,
    smoothstep,
    smootherstep,
    seedNoise,
    mapNoiseRange,
    perlin2D as perlinNoise2D,
    simplex2D as simplexNoise2D,
    fbm2D as fbmNoise2D
} from './noise/noise-functions.js';

export {
    valueNoise2D
} from './noise/value-2d.js';
export {
    worleyNoise2D
} from './noise/worley-2d.js';
export {
    whiteGaussianNoise2D
} from './noise/white-gaussian-2d.js';
export {
    ridgedFbm2D
} from './noise/ridged-fbm-2d.js';
export {
    turbulenceField2D
} from './noise/turbulence-2d.js';
export {
    paintStrokeErrorGuided
} from './rendering/paintstroke-error.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Pattern Generators
// ═══════════════════════════════════════════════════════════════════════════
export {
    generateTruchetGrid,
    getTruchetArcs,
    truchetSDF,
    truchetTileField2D,
    moireWaveInterference2D,
    gratingBandField2D,
    linearGrating,
    radialGrating,
    angularGrating,
    spiralGrating,
    combineMoire,
    superellipse,
    superellipsePoint,
    superellipsePoints
} from './patterns/pattern-generators.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Halftone Patterns
// ═══════════════════════════════════════════════════════════════════════════
export {
    lineHalftone,
    crossHatchHalftone,
    contourAlignedLattice,
    sizeDotsFromLuminance,
    halftoneResponseMap,
    dyadicHalftone,
    extractLuminance,
    extractNormalMap,
    extractDepthMap
} from './patterns/halftone-patterns.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: SDF Operations
// ═══════════════════════════════════════════════════════════════════════════
export {
    sdfCircle,
    sdfBox,
    sdfRoundedBox,
    sdfSegment,
    sdfEllipse,
    sdfCapsule,
    sdfRing,
    sdfPrimitive2D,
    sdfPolygon,
    sdfUnion,
    sdfIntersection,
    sdfSubtraction,
    sdfSmoothUnion,
    sdfSmoothSubtraction,
    sdfSmoothIntersection,
    sdfRepeat,
    sdfRotate,
    sdfRound,
    sdfAnnular,
    evaluateSDFGrid,
    sdfGradient,
    sdfToMask,
    sdfAlpha
} from './geometry/sdf-operations.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Bin Packing
// ═══════════════════════════════════════════════════════════════════════════
export {
    maxRectsPack,
    shelfPack,
    multiBinPack,
    totalArea,
    estimateMinBins
} from './geometry/bin-packing.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Marching Squares
// ═══════════════════════════════════════════════════════════════════════════
export {
    marchingSquares,
    extractContours,
    marchingSquaresContour,
    extractMultipleContours,
    autoContourLevels,
    contourArea,
    simplifyContour
} from './geometry/marching-squares.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Spatial Index
// ═══════════════════════════════════════════════════════════════════════════
export {
    buildKdTree,
    kdNearestNeighbor,
    kdRadiusSearch,
    kdKNearestNeighbors,
    createSpatialHash,
    findClosePointPairs,
    nearestSiteGrid
} from './geometry/spatial-index.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Curve Geometry
// ═══════════════════════════════════════════════════════════════════════════
export {
    computeTangents,
    computeNormals,
    computeCurvature,
    extrudeRibbon,
    ribbonTriangles,
    extrudeWithCurvature,
    depthSortBackToFront,
    depthSortFrontToBack,
    assignDepthFromY,
    sortRibbonTriangles,
    offsetCurve,
    multipleOffsetCurves,
    normalShading,
    rimLighting,
    combinedShading
} from './geometry/curve-geometry.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Advection
// ═══════════════════════════════════════════════════════════════════════════
export {
    bilinearSample,
    advectSemiLagrangian,
    advectMacCormack,
    advectParticleEuler,
    advectParticleRK4,
    traceStreamline,
    streamlineIntegrate2D,
    uniformVelocityField,
    rotationalVelocityField,
    curlNoiseVelocityField,
    curlNoise2D
} from './physics/advection.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Reaction-Diffusion
// ═══════════════════════════════════════════════════════════════════════════
export {
    initGrayScott,
    stepGrayScott,
    runGrayScott,
    GRAY_SCOTT_PRESETS,
    stepTuringPattern,
    stepGameOfLife,
    stepCellularAutomaton,
    CA_RULES,
    initCellularAutomaton
} from './physics/reaction-diffusion.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Wave Solver
// ═══════════════════════════════════════════════════════════════════════════
export {
    initWave1D,
    stepWave1D,
    impulseWave1D,
    initWave2D,
    stepWave2D,
    rippleWave2D,
    travellingWave,
    standingWave,
    waveEnergy
} from './physics/wave-solver.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: JFA / Distance Transforms
// ═══════════════════════════════════════════════════════════════════════════
export {
    jfaInitialize,
    jfaPass,
    jumpFloodAlgorithm,
    jfaToDistanceField,
    jfaSignedDistanceField,
    jfaVoronoi,
    euclideanDistanceTransform2D
} from './distance/jfa.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Geodesic Distance
// ═══════════════════════════════════════════════════════════════════════════
export {
    fastMarchingGeodesic,
    geodesicWithObstacles,
    solveLaplace,
    harmonicInterpolation
} from './distance/geodesic.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Optics / Interference
// ═══════════════════════════════════════════════════════════════════════════
export {
    opticalPathLength,
    opdToPhase,
    twoBeamInterference,
    thinFilmOPD,
    thinFilmOPDAngle,
    thinFilmReflectance,
    thinFilmColor,
    birefringentRetardation,
    crossedPolarIntensity,
    uniaxialConoscopy,
    conoscopicColor,
    wavelengthToRGB,
    retardationToMichelLevy
} from './optics/interference.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: HOG Features
// ═══════════════════════════════════════════════════════════════════════════
export {
    computeGradients,
    buildCellHistogram,
    normalizeHistogram,
    computeHOG,
    compareHOG,
    hogVisualizationData
} from './features/hog.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Posterization
// ═══════════════════════════════════════════════════════════════════════════
export {
    posterize,
    posterizeGamma,
    posterizeSmooth,
    posterizeCustom,
    histogramOptimalLevels,
    posterizeImage,
    posterizeImageRGB,
    posterizeImageLuminance,
    posterizeDither,
    posterizeImageBayer,
    extractPosterContours
} from './image/posterization.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Image Analysis
// ═══════════════════════════════════════════════════════════════════════════
export {
    analyzeGlyph,
    computeOrientationHistogram,
    analyzeGlyphSet,
    matchGlyph,
    hammingDistance,
    coherenceSmoothing,
    edgePreservingSmoothing
} from './image/image-analysis.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Audio / WAV Encoder
// ═══════════════════════════════════════════════════════════════════════════
export {
    createWavHeader,
    encodeWavMono,
    encodeWavStereo,
    createWavBlob,
    createWavUrl,
    generateSine,
    generateSquare,
    generateSawtooth,
    generateTriangle,
    generateNoise,
    applyEnvelope,
    mixTracks
} from './audio/wav-encoder.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: DSP Evaluator
// ═══════════════════════════════════════════════════════════════════════════
export {
    parseEquation,
    evaluateEquation,
    validateEquation,
    getEquationVariables
} from './audio/dsp-evaluator.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Coordinate Transforms
// ═══════════════════════════════════════════════════════════════════════════
export {
    cartesianToPolar,
    polarToCartesian,
    linearToCircular,
    waveformToCircular,
    rectangularToPolar,
    polarToRectangular,
    waveformToPath,
    lissajousFigure,
    oscilloscopeTrail,
    rotatePoint,
    scalePoint,
    fishEye,
    barrelDistortion
} from './core/coordinate-transforms.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Animation
// ═══════════════════════════════════════════════════════════════════════════
export {
    LFO_WAVEFORM,
    createLFO,
    combineLFOs,
    loopTime,
    pingpong,
    loopingNoise1D,
    keyframeLoop,
    Easing,
    morphLayout,
    staggeredTime,
    createSpring
} from './animation/animation-utils.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Rendering
// ═══════════════════════════════════════════════════════════════════════════
export {
    createSpriteCache,
    createOffscreenBuffer,
    calculate3DShading,
    renderBeveledTile,
    renderRimHighlight,
    createBatchRenderer,
    createDirtyRegionTracker,
    jitteredGridSamples,
    stratifiedSamples,
    fieldToImageData,
    renderScalarField,
    metaballField,
    renderMetaballs,
    renderBlobs,
    renderConcentricContours,
    renderDistanceContours
} from './rendering/rendering-utils.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Multifilament Print - Grid CSV Parser
// ═══════════════════════════════════════════════════════════════════════════
export {
    parseGridCSV,
    validateGridConfig
} from './data/grid-csv-parser.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Multifilament Print - Tile Color Extraction
// ═══════════════════════════════════════════════════════════════════════════
export {
    extractTileColor,
    extractMultipleTileColors,
    visualizeDeadZone
} from './image/tile-color-extraction.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Multifilament Print - Grid-Scan Transform
// ═══════════════════════════════════════════════════════════════════════════
export {
    transformGridToScan,
    transformScanToGrid,
    transformGridRectToScan,
    calculateTileRectsInScan,
    findTileAtScanPoint,
    calculateGridBoundsInScan,
    calculateAutoFitTransform
} from './geometry/grid-scan-transform.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Multifilament Print - Color Similarity Grouping
// ═══════════════════════════════════════════════════════════════════════════
export {
    groupBySimilarity,
    sortByHue,
    sortByLuminance,
    sortBySaturation,
    findAlternativeSequences,
    calculateColorStatistics
} from './color/color-similarity-grouping.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Math Utils (additions)
// ═══════════════════════════════════════════════════════════════════════════
// MathUtils.hashInt, hashToFloat, hash2D, quickRandom are now available

// ═══════════════════════════════════════════════════════════════════════════
// LINE ENGINES — wavefront, serpentine, static, flow-line generation
// ═══════════════════════════════════════════════════════════════════════════
export * as LineEngineCommon from './line/line-engine-common.js';
export * as FrontPropagation from './line/front-propagation-core.js';
export * as FlowLineEngine from './line/flow-line-engine.js';
export * as SerpentineLineEngine from './line/serpentine-line-engine.js';
export * as StaticLineEngine from './line/static-line-engine.js';

// ═══════════════════════════════════════════════════════════════════════════
// VECTOR FIELDS — creation, normalisation, gradient extraction, sampling
// ═══════════════════════════════════════════════════════════════════════════
export * as VectorField from './field/vector-field.js';
export * as BaseGradient from './field/base-gradient.js';

// ═══════════════════════════════════════════════════════════════════════════
// MORPHOLOGY — binary and greyscale erosion/dilation/open/close
// ═══════════════════════════════════════════════════════════════════════════
export * as Morphology from './image/morphology.js';

// ═══════════════════════════════════════════════════════════════════════════
// PAINTER — circular brush stamp and layer compositing
// ═══════════════════════════════════════════════════════════════════════════
export * as BrushEngine from './painter/brush-engine.js';
export { LayerTracker } from './painter/layer-tracker.js';

// ═══════════════════════════════════════════════════════════════════════════
// COLOUR ADJUSTMENTS — histogram EQ, CLAHE, channel mixer, vibrance, temp/tint
// ═══════════════════════════════════════════════════════════════════════════
export * as ColourAdjustments from './image/colour-adjustments.js';

// ═══════════════════════════════════════════════════════════════════════════
// BLUR FILTERS — bilateral, motion blur, radial blur
// ═══════════════════════════════════════════════════════════════════════════
export * as BlurFilters from './image/blur-filters.js';

// ═══════════════════════════════════════════════════════════════════════════
// SPATIAL FILTERS — unsharp mask, high pass
// ═══════════════════════════════════════════════════════════════════════════
export * as SpatialFilters from './image/spatial-filters.js';

// ═══════════════════════════════════════════════════════════════════════════
// TEXTURE OVERLAYS — film grain, vignette, scanlines
// ═══════════════════════════════════════════════════════════════════════════
export * as TextureOverlays from './image/texture-overlays.js';

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE COMPOSITING — stipple placement, tile blend
// ═══════════════════════════════════════════════════════════════════════════
export * as ImageCompositing from './image/compositing.js';

// ═══════════════════════════════════════════════════════════════════════════
// plan2403 / audit — flat aliases (supplement namespace exports above)
// ═══════════════════════════════════════════════════════════════════════════
export { separableGaussianKernel1D } from './math/gaussian-kernel-1d.js';
export { gradientMagnitude2D, edgeTangentDistance2D } from './features/feature-extraction.js';
export {
  bilateralGridApprox,
  separableBoxBlurPasses,
  medianHistogramApprox
} from './image/blur-filters.js';
export { morphologySeparableApprox } from './image/morphology.js';
export { stippleLloydRelax2d } from './image/compositing.js';
export {
  lloydRelaxationToneWeighted,
  poissonDisk as poissonDiscSampling2d
} from './sampling/point-distribution.js';
export { histogramEqualise as histogramEqualiseGlobal, clahe as claheTiles } from './image/colour-adjustments.js';
export { otsuThreshold as otsuGlobalThreshold } from './segmentation/thresholding.js';
export {
  stepGrayScott as grayscottStep2d,
  stepCellularAutomaton as cellularAutomataTotalisticStep
} from './physics/reaction-diffusion.js';
export { stepWave2D as waveEquationFd2D } from './physics/wave-solver.js';
export { thinFilmOPD as thinFilmPhaseThickness } from './optics/interference.js';

export { blueNoiseMask2D, generateBlueNoiseTile } from './noise/blue-noise-mask-2d.js';
export { delaunayTriangulation2D } from './geometry/delaunay-2d.js';
export { voronoiDiagram2d, voronoiQuery2d } from './geometry/voronoi-2d.js';
export { serpentineOscillatorRaster } from './line/serpentine-line-engine.js';

// ═══════════════════════════════════════════════════════════════════════════
// GEOMETRIC DISTORTION — band shift, spherize, twirl, chromatic aberration, lens bubbles
// ═══════════════════════════════════════════════════════════════════════════
export * as GeometricDistortion from './geometry/distortion.js';
