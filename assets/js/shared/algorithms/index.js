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
export * as Patterns from './patterns/pattern-generators.js';
export * as HalftonePatterns from './patterns/halftone-patterns.js';

// Geometry extensions
export * as SDF from './geometry/sdf-operations.js';
export * as BinPacking from './geometry/bin-packing.js';
export * as MarchingSquares from './geometry/marching-squares.js';
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

// Image
export * as Posterization from './image/posterization.js';
export * as ImageAnalysis from './image/image-analysis.js';

// Audio
export * as WavEncoder from './audio/wav-encoder.js';
export * as DSPEvaluator from './audio/dsp-evaluator.js';

// Animation
export * as Animation from './animation/animation-utils.js';

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
    mapNoiseRange
} from './noise/noise-functions.js';

// ═══════════════════════════════════════════════════════════════════════════
// RE-EXPORTS: Pattern Generators
// ═══════════════════════════════════════════════════════════════════════════
export {
    generateTruchetGrid,
    getTruchetArcs,
    truchetSDF,
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
    uniformVelocityField,
    rotationalVelocityField,
    curlNoiseVelocityField
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
    jfaVoronoi
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

