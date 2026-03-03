// ── Colour / Tone ──
import { GreyscaleNode } from './colour/GreyscaleNode.js';
import { LevelsNode } from './colour/LevelsNode.js';
import { ContrastNode } from './colour/ContrastNode.js';
import { QuantiseNode } from './colour/QuantiseNode.js';
import { DitherNode } from './colour/DitherNode.js';
import { InvertNode } from './colour/InvertNode.js';
import { HSLAdjustNode } from './colour/HSLAdjustNode.js';
import { ChannelMixerNode } from './colour/ChannelMixerNode.js';
import { ColourBalanceNode } from './colour/ColourBalanceNode.js';
import { GradientMapNode } from './colour/GradientMapNode.js';
import { TemperatureTintNode } from './colour/TemperatureTintNode.js';
import { VibranceNode } from './colour/VibranceNode.js';
import { CurvesNode } from './colour/CurvesNode.js';
import { PosterizeNode } from './colour/PosterizeNode.js';
import { HistogramEQNode } from './colour/HistogramEQNode.js';
import { CLAHENode } from './colour/CLAHENode.js';

// ── Blur ──
import { BoxBlurNode } from './blur/BoxBlurNode.js';
import { GaussianBlurNode } from './blur/GaussianBlurNode.js';
import { MotionBlurNode } from './blur/MotionBlurNode.js';
import { RadialBlurNode } from './blur/RadialBlurNode.js';
import { MedianFilterNode } from './blur/MedianFilterNode.js';
import { BilateralFilterNode } from './blur/BilateralFilterNode.js';

// ── Sharpen ──
import { UnsharpMaskNode } from './sharpen/UnsharpMaskNode.js';
import { HighPassNode } from './sharpen/HighPassNode.js';

// ── Transform ──
import { AffineTransformNode } from './transform/AffineTransformNode.js';

// ── Warp ──
import { FlowFieldNode } from './warp/FlowFieldNode.js';
import { BandShiftNode } from './warp/BandShiftNode.js';
import { AdvectionNode } from './warp/AdvectionNode.js';

// ── Refraction ──
import { RadialRippleNode } from './refraction/RadialRippleNode.js';
import { LensBubblesNode } from './refraction/LensBubblesNode.js';

// ── Distortion ──
import { PixelateNode } from './distortion/PixelateNode.js';
import { PolarCoordsNode } from './distortion/PolarCoordsNode.js';
import { SpherizeNode } from './distortion/SpherizeNode.js';
import { TwirlNode } from './distortion/TwirlNode.js';
import { ChromaticAbNode } from './distortion/ChromaticAbNode.js';

// ── Accumulation ──
import { IterativeRewarpNode } from './accumulation/IterativeRewarpNode.js';

// ── Line Render ──
import { LuminanceFlowNode } from './line/LuminanceFlowNode.js';
import { SerpentineNode } from './line/SerpentineNode.js';
import { StaticHalftoneNode } from './line/StaticHalftoneNode.js';
import { ModuleFlowLinesNode } from './line/ModuleFlowLinesNode.js';
import { ModuleSerpentineNode } from './line/ModuleSerpentineNode.js';
import { ModuleStaticLinesNode } from './line/ModuleStaticLinesNode.js';

// ── Generative ──
import { PaintStrokeNode } from './generative/PaintStrokeNode.js';

// ── Composite ──
import { TileBlendNode } from './composite/TileBlendNode.js';
import { StippleNode } from './composite/StippleNode.js';
import { DelaunayMeshNode } from './composite/DelaunayMeshNode.js';

// ── Edge ──
import { SobelNode } from './edge/SobelNode.js';
import { CannyNode } from './edge/CannyNode.js';
import { LaplacianNode } from './edge/LaplacianNode.js';
import { DoGNode } from './edge/DoGNode.js';

// ── Pattern ──
import { TruchetNode } from './pattern/TruchetNode.js';
import { GratingNode } from './pattern/GratingNode.js';
import { MoireNode } from './pattern/MoireNode.js';
import { HalftonePatternNode } from './pattern/HalftonePatternNode.js';

// ── Noise ──
import { PerlinOverlayNode } from './noise/PerlinOverlayNode.js';
import { DomainWarpNode } from './noise/DomainWarpNode.js';

// ── Physics ──
import { ReactionDiffusionNode } from './physics/ReactionDiffusionNode.js';
import { WaveDistortionNode } from './physics/WaveDistortionNode.js';
import { CellularAutomataNode } from './physics/CellularAutomataNode.js';

// ── Texture ──
import { FilmGrainNode } from './texture/FilmGrainNode.js';
import { VignetteNode } from './texture/VignetteNode.js';
import { ScanlinesNode } from './texture/ScanlinesNode.js';

// ── Morphology ──
import { DilateErodeNode } from './morphology/DilateErodeNode.js';
import { OpenCloseNode } from './morphology/OpenCloseNode.js';

// ── Segmentation ──
import { OtsuThresholdNode } from './segmentation/OtsuThresholdNode.js';

// ── Geometric ──
import { VoronoiNode } from './geometric/VoronoiNode.js';
import { ContourNode } from './geometric/ContourNode.js';
import { SDFShapeNode } from './geometric/SDFShapeNode.js';

// ── Optics ──
import { InterferenceNode } from './optics/InterferenceNode.js';

export const REGISTRY = {
  'COLOUR / TONE': [
    { type: 'greyscale',    label: 'GREYSCALE',      factory: () => new GreyscaleNode() },
    { type: 'levels',       label: 'LEVELS',          factory: () => new LevelsNode() },
    { type: 'contrast',     label: 'LIFT/GAM/GAIN',   factory: () => new ContrastNode() },
    { type: 'curves',       label: 'CURVES',           factory: () => new CurvesNode() },
    { type: 'hsladjust',    label: 'HSL ADJUST',      factory: () => new HSLAdjustNode() },
    { type: 'channelmixer', label: 'CHANNEL MIXER',   factory: () => new ChannelMixerNode() },
    { type: 'colourbalance',label: 'COLOUR BALANCE',  factory: () => new ColourBalanceNode() },
    { type: 'temptint',     label: 'TEMP / TINT',     factory: () => new TemperatureTintNode() },
    { type: 'vibrance',     label: 'VIBRANCE',        factory: () => new VibranceNode() },
    { type: 'gradientmap',  label: 'GRADIENT MAP',    factory: () => new GradientMapNode() },
    { type: 'invert',       label: 'INVERT',          factory: () => new InvertNode() },
    { type: 'quantise',     label: 'QUANTISE',        factory: () => new QuantiseNode() },
    { type: 'posterize',    label: 'POSTERIZE',       factory: () => new PosterizeNode() },
    { type: 'dither',       label: 'DITHER',           factory: () => new DitherNode() },
    { type: 'histogrameq',  label: 'HISTOGRAM EQ',    factory: () => new HistogramEQNode() },
    { type: 'clahe',        label: 'CLAHE',            factory: () => new CLAHENode() }
  ],
  'BLUR': [
    { type: 'boxblur',    label: 'BOX BLUR',    factory: () => new BoxBlurNode() },
    { type: 'gaussblur',  label: 'GAUSS BLUR',  factory: () => new GaussianBlurNode() },
    { type: 'motionblur', label: 'MOTION BLUR', factory: () => new MotionBlurNode() },
    { type: 'radialblur', label: 'RADIAL BLUR', factory: () => new RadialBlurNode() },
    { type: 'median',     label: 'MEDIAN',      factory: () => new MedianFilterNode() },
    { type: 'bilateral',  label: 'BILATERAL',   factory: () => new BilateralFilterNode() }
  ],
  'SHARPEN': [
    { type: 'unsharpmask', label: 'UNSHARP MASK', factory: () => new UnsharpMaskNode() },
    { type: 'highpass',    label: 'HIGH PASS',    factory: () => new HighPassNode() }
  ],
  'TRANSFORM': [
    { type: 'affine', label: 'AFFINE XFORM', factory: () => new AffineTransformNode() }
  ],
  'WARP': [
    { type: 'flowfield', label: 'FLOW FIELD', factory: () => new FlowFieldNode() },
    { type: 'bandshift', label: 'BAND SHIFT', factory: () => new BandShiftNode() },
    { type: 'advection', label: 'ADVECTION',  factory: () => new AdvectionNode() }
  ],
  'REFRACTION': [
    { type: 'ripple',      label: 'RADIAL RIPPLE', factory: () => new RadialRippleNode() },
    { type: 'lensbubbles', label: 'LENS BUBBLES',  factory: () => new LensBubblesNode() }
  ],
  'DISTORTION': [
    { type: 'pixelate',    label: 'PIXELATE',     factory: () => new PixelateNode() },
    { type: 'polarcoords', label: 'POLAR COORDS', factory: () => new PolarCoordsNode() },
    { type: 'spherize',    label: 'SPHERIZE',     factory: () => new SpherizeNode() },
    { type: 'twirl',       label: 'TWIRL',        factory: () => new TwirlNode() },
    { type: 'chromaticab', label: 'CHROMATIC AB', factory: () => new ChromaticAbNode() }
  ],
  'ACCUMULATION': [
    { type: 'iterrewarp', label: 'ITER REWARP', factory: () => new IterativeRewarpNode() }
  ],
  'LINE RENDER': [
    { type: 'lumflow',        label: 'LUMINANCE FLOW',  factory: () => new LuminanceFlowNode() },
    { type: 'serpentine',     label: 'SERPENTINE',      factory: () => new SerpentineNode() },
    { type: 'statichalftone', label: 'STATIC HALFTONE', factory: () => new StaticHalftoneNode() }
  ],
  'LINE RENDER (MODULE)': [
    { type: 'moduleflowlines',   label: 'MODULE FLOW LINES',   factory: () => new ModuleFlowLinesNode() },
    { type: 'moduleserpentine',  label: 'MODULE SERPENTINE',   factory: () => new ModuleSerpentineNode() },
    { type: 'modulestaticlines', label: 'MODULE STATIC LINES', factory: () => new ModuleStaticLinesNode() }
  ],
  'EDGE': [
    { type: 'sobel',     label: 'SOBEL EDGE',    factory: () => new SobelNode() },
    { type: 'canny',     label: 'CANNY EDGE',    factory: () => new CannyNode() },
    { type: 'laplacian', label: 'LAPLACIAN',     factory: () => new LaplacianNode() },
    { type: 'dog',       label: 'DIFF OF GAUSS', factory: () => new DoGNode() }
  ],
  'PATTERN': [
    { type: 'truchet',         label: 'TRUCHET',      factory: () => new TruchetNode() },
    { type: 'grating',         label: 'GRATING',      factory: () => new GratingNode() },
    { type: 'moire',           label: 'MOIRE',        factory: () => new MoireNode() },
    { type: 'halftonepattern', label: 'HALFTONE DOT', factory: () => new HalftonePatternNode() }
  ],
  'NOISE': [
    { type: 'perlinoverlay', label: 'NOISE OVERLAY', factory: () => new PerlinOverlayNode() },
    { type: 'domainwarp',    label: 'DOMAIN WARP',   factory: () => new DomainWarpNode() }
  ],
  'PHYSICS': [
    { type: 'reactiondiffusion', label: 'REACT-DIFFUSE', factory: () => new ReactionDiffusionNode() },
    { type: 'wavedistortion',    label: 'WAVE DISTORT',  factory: () => new WaveDistortionNode() },
    { type: 'cellularautomata',  label: 'CELL AUTOMATA', factory: () => new CellularAutomataNode() }
  ],
  'GENERATIVE': [
    { type: 'paintstroke', label: 'PAINT STROKE', factory: () => new PaintStrokeNode() }
  ],
  'COMPOSITE': [
    { type: 'tileblend',    label: 'TILE BLEND',    factory: () => new TileBlendNode() },
    { type: 'stipple',      label: 'STIPPLE',       factory: () => new StippleNode() },
    { type: 'delaunaymesh', label: 'DELAUNAY MESH', factory: () => new DelaunayMeshNode() }
  ],
  'TEXTURE': [
    { type: 'filmgrain', label: 'FILM GRAIN', factory: () => new FilmGrainNode() },
    { type: 'vignette',  label: 'VIGNETTE',   factory: () => new VignetteNode() },
    { type: 'scanlines', label: 'SCANLINES',  factory: () => new ScanlinesNode() }
  ],
  'MORPHOLOGY': [
    { type: 'dilateerode', label: 'DILATE/ERODE', factory: () => new DilateErodeNode() },
    { type: 'openclose',   label: 'OPEN/CLOSE',   factory: () => new OpenCloseNode() }
  ],
  'SEGMENTATION': [
    { type: 'otsuthreshold', label: 'OTSU THRESH', factory: () => new OtsuThresholdNode() }
  ],
  'GEOMETRIC': [
    { type: 'voronoi',  label: 'VORONOI',   factory: () => new VoronoiNode() },
    { type: 'contour',  label: 'CONTOUR',   factory: () => new ContourNode() },
    { type: 'sdfshape', label: 'SDF SHAPE', factory: () => new SDFShapeNode() }
  ],
  'OPTICS': [
    { type: 'interference', label: 'INTERFERENCE', factory: () => new InterferenceNode() }
  ]
};

export const PRESETS = {
  SCAN: { version:1, globalSeed:42, previewScale:0.5, nodes:[
    {type:'greyscale',enabled:true,opacity:1,params:{wr:0.33,wg:0.33,wb:0.33}},
    {type:'levels',enabled:true,opacity:1,params:{blackPoint:20,whitePoint:230,midGamma:1.2,outBlack:0,outWhite:255}},
    {type:'bandshift',enabled:true,opacity:1,params:{axis:'horizontal',bandSize:15,intensity:60,offsetType:'noise',phase:0,freq:1,noiseScale:3}},
    {type:'bandshift',enabled:true,opacity:0.6,params:{axis:'vertical',bandSize:40,intensity:25,offsetType:'stepped',phase:0,freq:1,noiseScale:2}},
    {type:'gaussblur',enabled:true,opacity:1,params:{sigma:0.8,passes:1}}
  ]},
  LIQUID: { version:1, globalSeed:77, previewScale:0.5, nodes:[
    {type:'greyscale',enabled:true,opacity:1,params:{wr:0.299,wg:0.587,wb:0.114}},
    {type:'contrast',enabled:true,opacity:1,params:{lift:0,gamma:0.9,gain:1.1,contrast:0.15,pivot:0.5}},
    {type:'flowfield',enabled:true,opacity:1,params:{noiseScale:4,octaves:4,lacunarity:2,gain:0.5,strength:80,curl:0.3,advectSteps:4}},
    {type:'gaussblur',enabled:true,opacity:1,params:{sigma:1.5,passes:1}},
    {type:'levels',enabled:true,opacity:1,params:{blackPoint:30,whitePoint:220,midGamma:1,outBlack:5,outWhite:250}}
  ]},
  DROWNED: { version:1, globalSeed:123, previewScale:0.5, nodes:[
    {type:'greyscale',enabled:true,opacity:1,params:{wr:0.2,wg:0.7,wb:0.1}},
    {type:'ripple',enabled:true,opacity:1,params:{centreX:0.5,centreY:0.5,amplitude:20,frequency:15,phase:0,falloff:1.5}},
    {type:'lensbubbles',enabled:true,opacity:1,params:{count:8,minRadius:0.04,maxRadius:0.15,magnification:2,edgeSoft:0.3}},
    {type:'iterrewarp',enabled:true,opacity:1,params:{samples:8,jitterX:8,jitterY:4,opacityMode:'decay',decay:0.75,rotJitter:1.5,scaleJitter:0.02}},
    {type:'gaussblur',enabled:true,opacity:0.7,params:{sigma:1.2,passes:1}},
    {type:'levels',enabled:true,opacity:1,params:{blackPoint:15,whitePoint:240,midGamma:1.1,outBlack:0,outWhite:245}}
  ]},
  DATAMOSH: { version:1, globalSeed:55, previewScale:0.5, nodes:[
    {type:'bandshift',enabled:true,opacity:1,params:{axis:'horizontal',bandSize:12,intensity:80,offsetType:'noise',phase:0,freq:1,noiseScale:4}},
    {type:'quantise',enabled:true,opacity:1,params:{palette:'3-bit'}},
    {type:'dither',enabled:true,opacity:1,params:{method:'bayer',levels:4,strength:1}},
    {type:'flowfield',enabled:true,opacity:0.6,params:{noiseScale:5,octaves:3,lacunarity:2,gain:0.5,strength:30,curl:0,advectSteps:2}}
  ]},
  ENGRAVE: { version:1, globalSeed:200, previewScale:0.5, nodes:[
    {type:'greyscale',enabled:true,opacity:1,params:{wr:0.299,wg:0.587,wb:0.114}},
    {type:'lumflow',enabled:true,opacity:1,params:{patternType:'horizontal',spacing:6,strokeWeight:0.7,resolution:2,amplitude:15,lumExp:1.2,damping:0.95,iterations:5,bgBrightness:10}}
  ]},
  WAVEFORM: { version:1, globalSeed:333, previewScale:0.5, nodes:[
    {type:'greyscale',enabled:true,opacity:1,params:{wr:0.299,wg:0.587,wb:0.114}},
    {type:'serpentine',enabled:true,opacity:1,params:{mode:'flow',spacing:6,amplitude:2.5,frequency:1,baseSpeed:0.5,dragLight:0,dragDark:0.5,iterations:300,strokeW:1,bgColor:255,strokeColor:0}}
  ]},
  SIGNAL: { version:1, globalSeed:88, previewScale:0.5, nodes:[
    {type:'greyscale',enabled:true,opacity:1,params:{wr:0.33,wg:0.33,wb:0.33}},
    {type:'bandshift',enabled:true,opacity:1,params:{axis:'horizontal',bandSize:8,intensity:40,offsetType:'sine',phase:0,freq:3,noiseScale:2}},
    {type:'levels',enabled:true,opacity:1,params:{blackPoint:10,whitePoint:240,midGamma:1.1,outBlack:0,outWhite:255}},
    {type:'dither',enabled:true,opacity:0.8,params:{method:'floyd-steinberg',levels:4,strength:0.8}}
  ]},
  HOLOGRAM: { version:1, globalSeed:777, previewScale:0.5, nodes:[
    {type:'chromaticab',enabled:true,opacity:1,params:{redShift:4,blueShift:-4,centreX:0.5,centreY:0.5}},
    {type:'grating',enabled:true,opacity:0.4,params:{type:'linear',wavelength:8,phase:0,angle:30,spiralRate:1,blendMode:'screen'}},
    {type:'scanlines',enabled:true,opacity:1,params:{spacing:3,thickness:0.3,opacity:0.2}},
    {type:'vignette',enabled:true,opacity:1,params:{amount:0.6,softness:0.5,roundness:0.8}}
  ]},
  LITHO: { version:1, globalSeed:444, previewScale:0.5, nodes:[
    {type:'greyscale',enabled:true,opacity:1,params:{wr:0.299,wg:0.587,wb:0.114}},
    {type:'posterize',enabled:true,opacity:1,params:{levels:4}},
    {type:'halftonepattern',enabled:true,opacity:1,params:{spacing:6,angle:45,minDot:0.5,maxDot:3,bgLevel:255,dotLevel:0}}
  ]},
  DARKROOM: { version:1, globalSeed:111, previewScale:0.5, nodes:[
    {type:'curves',enabled:true,opacity:1,params:{shadowIn:0,shadowOut:10,midIn:128,midOut:140,highIn:255,highOut:245}},
    {type:'vibrance',enabled:true,opacity:1,params:{vibrance:0.3}},
    {type:'vignette',enabled:true,opacity:1,params:{amount:0.4,softness:0.6,roundness:0.9}},
    {type:'filmgrain',enabled:true,opacity:1,params:{amount:15,size:1,lumResp:0.5,chromatic:0}}
  ]},
  CORRODED: { version:1, globalSeed:666, previewScale:0.5, nodes:[
    {type:'canny',enabled:true,opacity:1,params:{sigma:1.4,lowThreshold:0.08,highThreshold:0.2}},
    {type:'dilateerode',enabled:true,opacity:1,params:{mode:'dilate',radius:1,shape:'circle'}},
    {type:'levels',enabled:true,opacity:1,params:{blackPoint:0,whitePoint:200,midGamma:1.5,outBlack:0,outWhite:255}},
    {type:'dither',enabled:true,opacity:1,params:{method:'floyd-steinberg',levels:2,strength:1}}
  ]},
  ETCH: { version:1, globalSeed:222, previewScale:0.5, nodes:[
    {type:'sobel',enabled:true,opacity:1,params:{threshold:10,normalize:1}},
    {type:'invert',enabled:true,opacity:1,params:{}},
    {type:'levels',enabled:true,opacity:1,params:{blackPoint:30,whitePoint:220,midGamma:1.2,outBlack:0,outWhite:255}},
    {type:'dither',enabled:true,opacity:0.6,params:{method:'bayer',levels:3,strength:0.7}}
  ]}
};
