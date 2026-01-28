/**
 * Algorithms Bundle for Web Workers
 * 
 * Re-exports all pure algorithm functions from the main algorithms library
 * in a format that Web Workers can import and use.
 * 
 * This bundle contains ONLY pure functions with no DOM dependencies,
 * making them safe to execute in worker context.
 * 
 * @module workers/algorithms-bundle
 */

// ═══════════════════════════════════════════════════════════════════════════
// CORE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════
export { MathUtils } from '../algorithms/core/math-utils.js';
export { Matrix } from '../algorithms/core/matrix.js';
export * as CoordinateTransforms from '../algorithms/core/coordinate-transforms.js';

// ═══════════════════════════════════════════════════════════════════════════
// COLOR & DITHERING (Primary use case for workers)
// ═══════════════════════════════════════════════════════════════════════════
export * as ColorSpace from '../algorithms/color/color-space.js';
export * as ColorUtils from '../algorithms/color/color-utils.js';
export * as ColorQuantization from '../algorithms/color/quantization.js';
export * as PaletteExtraction from '../algorithms/color/palette-extraction.js';
export * as Dither from '../algorithms/dither/index.js';

// Unified dither processor for easy worker access
export { processDither } from './dither-processor.js';

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE PROCESSING
// ═══════════════════════════════════════════════════════════════════════════
export * as ImageAdjustments from '../algorithms/image/image-adjustments.js';
export * as ImageResize from '../algorithms/image/image-resize.js';
export * as ImageAnalysis from '../algorithms/image/image-analysis.js';
export * as ImageUtils from '../algorithms/image/image-utils.js';
export * as Posterization from '../algorithms/image/posterization.js';

// ═══════════════════════════════════════════════════════════════════════════
// EDGE DETECTION & SEGMENTATION
// ═══════════════════════════════════════════════════════════════════════════
export * as EdgeDetection from '../algorithms/edge-detection/edge-operators.js';
export * as Segmentation from '../algorithms/segmentation/thresholding.js';

// ═══════════════════════════════════════════════════════════════════════════
// SAMPLING & DISTRIBUTION
// ═══════════════════════════════════════════════════════════════════════════
export * as Sampling from '../algorithms/sampling/point-distribution.js';

// ═══════════════════════════════════════════════════════════════════════════
// GEOMETRY
// ═══════════════════════════════════════════════════════════════════════════
export * as Geometry from '../algorithms/geometry/polygon-operations.js';
export * as SDF from '../algorithms/geometry/sdf-operations.js';
export * as BinPacking from '../algorithms/geometry/bin-packing.js';
export * as MarchingSquares from '../algorithms/geometry/marching-squares.js';
export * as SpatialIndex from '../algorithms/geometry/spatial-index.js';
export * as CurveGeometry from '../algorithms/geometry/curve-geometry.js';
export * as STLGeneration from '../algorithms/geometry/stl-generation.js';

// ═══════════════════════════════════════════════════════════════════════════
// SPACE-FILLING CURVES
// ═══════════════════════════════════════════════════════════════════════════
export * as SpaceFilling from '../algorithms/space-filling/space-filling-curves.js';

// ═══════════════════════════════════════════════════════════════════════════
// TSP & PATH OPTIMIZATION
// ═══════════════════════════════════════════════════════════════════════════
export * as TSP from '../algorithms/tsp/path-optimization.js';

// ═══════════════════════════════════════════════════════════════════════════
// NOISE & PATTERNS
// ═══════════════════════════════════════════════════════════════════════════
export * as Noise from '../algorithms/noise/noise-functions.js';
export * as Patterns from '../algorithms/patterns/pattern-generators.js';
export * as HalftonePatterns from '../algorithms/patterns/halftone-patterns.js';

// ═══════════════════════════════════════════════════════════════════════════
// PHYSICS SIMULATIONS
// ═══════════════════════════════════════════════════════════════════════════
export * as Advection from '../algorithms/physics/advection.js';
export * as ReactionDiffusion from '../algorithms/physics/reaction-diffusion.js';
export * as WaveSolver from '../algorithms/physics/wave-solver.js';

// ═══════════════════════════════════════════════════════════════════════════
// DISTANCE TRANSFORMS
// ═══════════════════════════════════════════════════════════════════════════
export * as JFA from '../algorithms/distance/jfa.js';
export * as Geodesic from '../algorithms/distance/geodesic.js';

// ═══════════════════════════════════════════════════════════════════════════
// OPTICS
// ═══════════════════════════════════════════════════════════════════════════
export * as Optics from '../algorithms/optics/interference.js';

// ═══════════════════════════════════════════════════════════════════════════
// FEATURES
// ═══════════════════════════════════════════════════════════════════════════
export * as HOG from '../algorithms/features/hog.js';

// ═══════════════════════════════════════════════════════════════════════════
// AUDIO
// ═══════════════════════════════════════════════════════════════════════════
export * as WavEncoder from '../algorithms/audio/wav-encoder.js';
export * as DSPEvaluator from '../algorithms/audio/dsp-evaluator.js';

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION
// ═══════════════════════════════════════════════════════════════════════════
export * as Animation from '../algorithms/animation/animation-utils.js';

// ═══════════════════════════════════════════════════════════════════════════
// RENDERING
// ═══════════════════════════════════════════════════════════════════════════
export * as Rendering from '../algorithms/rendering/rendering-utils.js';

// ═══════════════════════════════════════════════════════════════════════════
// DATA & EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export * as CSVExport from '../algorithms/data/csv-export.js';
export * as ExportUtils from '../algorithms/export/export-utils.js';

// ═══════════════════════════════════════════════════════════════════════════
// COMBINATORICS
// ═══════════════════════════════════════════════════════════════════════════
export * as Combinatorics from '../algorithms/combinatorics/sequences.js';

// ═══════════════════════════════════════════════════════════════════════════
// LAYOUT
// ═══════════════════════════════════════════════════════════════════════════
export * as GridLayout from '../algorithms/layout/grid-layout.js';

