/**
 * Plan2403 algorithm nameplate exports — re-use shared/algorithms where present;
 * unimplemented entries throw at call time (migrate modules incrementally).
 */
export { perlin2D as perlinNoise2D, simplex2D as simplexNoise2D, fbm2D as fbmNoise2D } from '../../../shared/algorithms/noise/noise-functions.js';
export { histogramEqualise as histogramEqualiseGlobal, clahe as claheTiles } from '../../../shared/algorithms/image/colour-adjustments.js';
export { otsuThreshold as otsuGlobalThreshold } from '../../../shared/algorithms/segmentation/thresholding.js';

function _todo(name) {
  return function stub(..._args) {
    throw new Error(`[plan2403-algorithms] ${name} — not wired to shared implementation yet`);
  };
}

export const separableGaussianKernel1D = _todo('separableGaussianKernel1D');
export const separableBoxBlurPasses = _todo('separableBoxBlurPasses');
export const gradientMagnitude2D = _todo('gradientMagnitude2D');
export const euclideanDistanceTransform = _todo('euclideanDistanceTransform');
export const edgeTangentDistance2D = _todo('edgeTangentDistance2D');
export const morphologySeparableApprox = _todo('morphologySeparableApprox');
export const medianHistogramApprox = _todo('medianHistogramApprox');
export const bilateralGridApprox = _todo('bilateralGridApprox');
export const whiteGaussianNoise2D = _todo('whiteGaussianNoise2D');
export const valueNoise2D = _todo('valueNoise2D');
export const worleyNoise2D = _todo('worleyNoise2D');
export const curlNoise2D = _todo('curlNoise2D');
export const ridgedFbm2D = _todo('ridgedFbm2D');
export const turbulenceField2D = _todo('turbulenceField2D');
export const blueNoiseMask2D = _todo('blueNoiseMask2D');
export const delaunayTriangulation2D = _todo('delaunayTriangulation2D');
export const voronoiDiagram2D = _todo('voronoiDiagram2D');
export const poissonDiscSampling2D = _todo('poissonDiscSampling2D');
export const sdfPrimitive2D = _todo('sdfPrimitive2D');
export const marchingSquaresContour = _todo('marchingSquaresContour');
export const halftoneResponseMap = _todo('halftoneResponseMap');
export const gratingBandField2D = _todo('gratingBandField2D');
export const moireWaveInterference2D = _todo('moireWaveInterference2D');
export const truchetTileField2D = _todo('truchetTileField2D');
export const streamlineIntegrate2D = _todo('streamlineIntegrate2D');
export const serpentineOscillatorRaster = _todo('serpentineOscillatorRaster');
export const stippleLloydRelax2D = _todo('stippleLloydRelax2D');
export const paintStrokeErrorGuided = _todo('paintStrokeErrorGuided');
export const cellularAutomataTotalisticStep = _todo('cellularAutomataTotalisticStep');
export const grayScottStep2D = _todo('grayScottStep2D');
export const waveEquationFD2D = _todo('waveEquationFD2D');
export const thinFilmPhaseThickness = _todo('thinFilmPhaseThickness');
