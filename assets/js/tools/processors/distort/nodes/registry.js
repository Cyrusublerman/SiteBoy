// ── Colour / Tone ──
import { GreyscaleNode } from './colour/GreyscaleNode.js';
import { LevelsNode } from './colour/LevelsNode.js';
import { ContrastNode } from './colour/ContrastNode.js';
import { QuantiseNode } from './colour/QuantiseNode.js';
import { InvertNode } from './colour/InvertNode.js';
import { HSLAdjustNode } from './colour/HSLAdjustNode.js';
import { ChannelMixerNode } from './colour/ChannelMixerNode.js';
import { ColourBalanceNode } from './colour/ColourBalanceNode.js';
import { GradientMapNode } from './colour/GradientMapNode.js';
import { TemperatureTintNode } from './colour/TemperatureTintNode.js';
import { CurvesNode } from './colour/CurvesNode.js';
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

// ── Generative ──
import { PaintStrokeNode } from './generative/PaintStrokeNode.js';

// ── Composite ──
import { TileBlendNode } from './composite/TileBlendNode.js';
import { StippleNode } from './composite/StippleNode.js';
import { MosaicNode } from './composite/DelaunayMeshNode.js';

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

// ── Geometric (nodes retained; category dissolved — ContourNode → EDGE, SDFShapeNode → GENERATIVE) ──
import { ContourNode } from './geometric/ContourNode.js';
import { SDFShapeNode } from './geometric/SDFShapeNode.js';

// ── Optics ──
import { InterferenceNode } from './optics/InterferenceNode.js';

export const REGISTRY = {
  'COLOUR / TONE': [
    { type: 'greyscale',    label: 'GREYSCALE',      description: 'Converts image to greyscale using weighted luminance channels',      factory: () => new GreyscaleNode() },
    { type: 'levels',       label: 'LEVELS',          description: 'Remaps tonal range via black point, white point, and gamma',         factory: () => new LevelsNode() },
    { type: 'contrast',     label: 'CONTRAST',         description: 'Adjusts shadow lift, midtone gamma, highlight gain, and vibrance',     factory: () => new ContrastNode() },
    { type: 'curves',       label: 'CURVES',           description: 'Maps input to output tones using a custom bezier curve',             factory: () => new CurvesNode() },
    { type: 'hsladjust',    label: 'HSL ADJUST',      description: 'Shifts hue, saturation, and lightness globally or per colour range', factory: () => new HSLAdjustNode() },
    { type: 'channelmixer', label: 'CHANNEL MIXER',   description: 'Blends RGB channels into each output channel with custom weights',   factory: () => new ChannelMixerNode() },
    { type: 'colourbalance',label: 'COLOUR BALANCE',  description: 'Shifts colour balance in shadows, midtones, and highlights',         factory: () => new ColourBalanceNode() },
    { type: 'temptint',     label: 'TEMP / TINT',     description: 'Adjusts colour temperature (warm/cool) and green-magenta tint',      factory: () => new TemperatureTintNode() },
    { type: 'gradientmap',  label: 'GRADIENT MAP',    description: 'Maps luminance values to a two-colour gradient',                     factory: () => new GradientMapNode() },
    { type: 'invert',       label: 'INVERT',          description: 'Inverts all pixel values to produce a colour negative',              factory: () => new InvertNode() },
    { type: 'quantise',     label: 'QUANTISE',        description: 'Palette quantisation, dithering, and per-channel posterisation',     factory: () => new QuantiseNode() },
    { type: 'histogrameq',  label: 'HISTOGRAM EQ',    description: 'Redistributes tones to flatten the luminance histogram',             factory: () => new HistogramEQNode() },
    { type: 'clahe',        label: 'CLAHE',            description: 'Locally equalises contrast in tiles to enhance local detail',       factory: () => new CLAHENode() }
  ],
  'BLUR': [
    { type: 'boxblur',    label: 'BOX BLUR',    description: 'Applies a uniform average blur over a square kernel',                factory: () => new BoxBlurNode() },
    { type: 'gaussblur',  label: 'GAUSS BLUR',  description: 'Applies a Gaussian-weighted blur with configurable sigma',           factory: () => new GaussianBlurNode() },
    { type: 'motionblur', label: 'MOTION BLUR', description: 'Blurs along a directional angle to simulate camera or object motion', factory: () => new MotionBlurNode() },
    { type: 'radialblur', label: 'RADIAL BLUR', description: 'Blurs outward from a centre point to simulate zoom or rotation',     factory: () => new RadialBlurNode() },
    { type: 'median',     label: 'MEDIAN',      description: 'Replaces each pixel with the median of its neighbourhood, removing noise', factory: () => new MedianFilterNode() },
    { type: 'bilateral',  label: 'BILATERAL',   description: 'Edge-preserving blur that smooths flat regions while keeping boundaries', factory: () => new BilateralFilterNode() }
  ],
  'SHARPEN': [
    { type: 'unsharpmask', label: 'UNSHARP MASK', description: 'Sharpens by subtracting a blurred version from the original',       factory: () => new UnsharpMaskNode() }
  ],
  'TRANSFORM': [
    { type: 'affine', label: 'AFFINE XFORM', description: 'Applies rotation, scale, and translation via an inverse affine remap about a configurable pivot', factory: () => new AffineTransformNode() }
  ],
  'WARP': [
    { type: 'flowfield', label: 'FLOW FIELD', description: 'Displaces pixels along a Perlin noise flow field for fluid distortion', factory: () => new FlowFieldNode() },
    { type: 'bandshift', label: 'BAND SHIFT', description: 'Offsets horizontal or vertical bands by a noise or sine pattern',       factory: () => new BandShiftNode() },
    { type: 'advection', label: 'ADVECTION',  description: 'Iteratively advects pixels along a velocity field for smearing effects', factory: () => new AdvectionNode() }
  ],
  'REFRACTION': [
    { type: 'ripple',      label: 'RADIAL RIPPLE', description: 'Displaces pixels along concentric ripples from a centre point',    factory: () => new RadialRippleNode() },
    { type: 'lensbubbles', label: 'LENS BUBBLES',  description: 'Places refraction bubbles that magnify regions beneath them',      factory: () => new LensBubblesNode() }
  ],
  'DISTORTION': [
    { type: 'pixelate',    label: 'PIXELATE',     description: 'Reduces image to large square pixels by averaging block regions',   factory: () => new PixelateNode() },
    { type: 'polarcoords', label: 'POLAR COORDS', description: 'Converts between rectangular and polar coordinate spaces',          factory: () => new PolarCoordsNode() },
    { type: 'spherize',    label: 'SPHERIZE',     description: 'Wraps the image onto a spherical surface to create a globe effect', factory: () => new SpherizeNode() },
    { type: 'twirl',       label: 'TWIRL',        description: 'Rotates pixels around a centre point by an amount tied to radius',  factory: () => new TwirlNode() },
    { type: 'chromaticab', label: 'CHROMATIC AB', description: 'Laterally offsets RGB channels to simulate lens chromatic aberration', factory: () => new ChromaticAbNode() }
  ],
  'ACCUMULATION': [
    { type: 'iterrewarp', label: 'ITER REWARP', description: 'Repeatedly warps and resamples to accumulate painterly smear trails', factory: () => new IterativeRewarpNode() }
  ],
  'LINE RENDER': [
    { type: 'lumflow',        label: 'LUMINANCE FLOW',  description: 'Draws contour lines that follow luminance gradients across the image', factory: () => new LuminanceFlowNode(), vector: true },
    { type: 'serpentine',     label: 'SERPENTINE',      description: 'Fills the image with a single continuous serpentine line modulated by luminance', factory: () => new SerpentineNode(), vector: true },
    { type: 'statichalftone', label: 'STATIC HALFTONE', description: 'Renders the image as a grid of lines whose weight varies with brightness', factory: () => new StaticHalftoneNode(), vector: true },
    { type: 'moduleflowlines', label: 'FLOW LINES',      description: 'Traces flow lines through a gradient field derived from source image structure', factory: () => new ModuleFlowLinesNode(), vector: true }
  ],
  'EDGE': [
    { type: 'sobel',     label: 'SOBEL EDGE',    description: 'Detects edges using the Sobel gradient operator on luminance',        factory: () => new SobelNode() },
    { type: 'canny',     label: 'CANNY EDGE',    description: 'Multi-stage edge detector with noise suppression and hysteresis',     factory: () => new CannyNode() },
    { type: 'laplacian', label: 'LAPLACIAN',     description: 'Detects edges at zero-crossings of the Laplacian of luminance',       factory: () => new LaplacianNode() },
    { type: 'dog',       label: 'DIFF OF GAUSS', description: 'Subtracts two Gaussian blurs to isolate edges at a specific scale',   factory: () => new DoGNode() },
    { type: 'contour',   label: 'CONTOUR',       description: 'Draws isolines at equal luminance intervals like a topographic map',  factory: () => new ContourNode() }
  ],
  'PATTERN': [
    { type: 'truchet',         label: 'TRUCHET',      description: 'Renders a Truchet tile pattern with luminance-driven tile selection', factory: () => new TruchetNode() },
    { type: 'grating',         label: 'GRATING',      description: 'Overlays a linear, radial, or spiral interference grating',          factory: () => new GratingNode() },
    { type: 'moire',           label: 'MOIRE',        description: 'Generates moiré interference patterns from two overlapping grids',    factory: () => new MoireNode() },
    { type: 'halftonepattern', label: 'HALFTONE DOT', description: 'Renders a dot halftone pattern where dot size maps to luminance',     factory: () => new HalftonePatternNode() }
  ],
  'NOISE': [
    { type: 'perlinoverlay', label: 'NOISE FIELD',   description: 'Overlays multi-octave Perlin noise onto the image at variable opacity', factory: () => new PerlinOverlayNode() },
    { type: 'domainwarp',    label: 'DOMAIN WARP',   description: 'Warps noise lookup coordinates to produce folded, organic shapes',     factory: () => new DomainWarpNode() }
  ],
  'PHYSICS': [
    { type: 'reactiondiffusion', label: 'REACT-DIFFUSE', description: 'Simulates Gray-Scott reaction-diffusion to grow organic spot patterns', factory: () => new ReactionDiffusionNode() },
    { type: 'wavedistortion',    label: 'WAVE DISTORT',  description: 'Displaces pixels using a sine-wave field with configurable frequency', factory: () => new WaveDistortionNode() },
    { type: 'cellularautomata',  label: 'CELL AUTOMATA', description: 'Evolves a cellular automaton over the image to create texture growth', factory: () => new CellularAutomataNode() }
  ],
  'GENERATIVE': [
    { type: 'paintstroke', label: 'PAINT STROKE', description: 'Renders the image as overlapping brushstrokes distributed by luminance', factory: () => new PaintStrokeNode() },
    { type: 'sdfshape',    label: 'SDF SHAPE',    description: 'Composites a signed-distance-field shape mask over the image',          factory: () => new SDFShapeNode() }
  ],
  'COMPOSITE': [
    { type: 'tileblend',    label: 'TILE BLEND',    description: 'Blends tiled copies of the image offset by varying amounts',          factory: () => new TileBlendNode() },
    { type: 'stipple',      label: 'STIPPLE',       description: 'Renders the image as a field of dots whose density maps to brightness', factory: () => new StippleNode() },
    { type: 'mosaic',       label: 'MOSAIC',        description: 'Multi-topology tessellation: Delaunay or Voronoi mosaic with image-aware density seeding', factory: () => new MosaicNode() }
  ],
  'TEXTURE': [
    { type: 'filmgrain', label: 'FILM GRAIN', description: 'Adds luminance-responsive grain simulating film emulsion noise',        factory: () => new FilmGrainNode() },
    { type: 'vignette',  label: 'VIGNETTE',   description: 'Darkens image edges with a configurable oval falloff from the centre',  factory: () => new VignetteNode() },
    { type: 'scanlines', label: 'SCANLINES',  description: 'Overlays horizontal scanlines to simulate CRT or print screen effects', factory: () => new ScanlinesNode() }
  ],
  'MORPHOLOGY': [
    { type: 'dilateerode', label: 'DILATE/ERODE', description: 'Expands (dilates) or shrinks (erodes) bright regions using a shaped kernel', factory: () => new DilateErodeNode() },
    { type: 'openclose',   label: 'OPEN/CLOSE',   description: 'Removes noise speckles (open) or fills small gaps (close) in bright areas', factory: () => new OpenCloseNode() }
  ],
  'SEGMENTATION': [
    { type: 'otsuthreshold', label: 'OTSU THRESH', description: 'Automatically thresholds to binary using Otsu variance maximisation', factory: () => new OtsuThresholdNode() }
  ],
  'OPTICS': [
    { type: 'interference', label: 'INTERFERENCE', description: 'Generates thin-film interference colour patterns from luminance', factory: () => new InterferenceNode() }
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
    {type:'quantise',enabled:true,opacity:1,params:{mode:'palette',palette:'3-bit',ditherMode:'bayer',ditherStrength:1}},
    {type:'flowfield',enabled:true,opacity:0.6,params:{noiseScale:5,octaves:3,lacunarity:2,gain:0.5,strength:30,curl:0,advectSteps:2}}
  ]},
  ENGRAVE: { version:1, globalSeed:200, previewScale:0.5, nodes:[
    {type:'greyscale',enabled:true,opacity:1,params:{wr:0.299,wg:0.587,wb:0.114}},
    {type:'lumflow',enabled:true,opacity:1,params:{patternType:'horizontal',spacing:6,strokeWeight:0.7,resolution:2,amplitude:15,lumExp:1.2,damping:0.95,iterations:5,bgBrightness:10}}
  ]},
  WAVEFORM: { version:1, globalSeed:333, previewScale:0.5, nodes:[
    {type:'greyscale',enabled:true,opacity:1,params:{wr:0.299,wg:0.587,wb:0.114}},
    {type:'serpentine',enabled:true,opacity:1,params:{spacing:6,amplitude:2.5,frequency:1,baseSpeed:0.5,dragLight:0,dragDark:0.5,iterations:300,strokeW:1,bgColor:255,strokeColor:0}}
  ]},
  SIGNAL: { version:1, globalSeed:88, previewScale:0.5, nodes:[
    {type:'greyscale',enabled:true,opacity:1,params:{wr:0.33,wg:0.33,wb:0.33}},
    {type:'bandshift',enabled:true,opacity:1,params:{axis:'horizontal',bandSize:8,intensity:40,offsetType:'sine',phase:0,freq:3,noiseScale:2}},
    {type:'levels',enabled:true,opacity:1,params:{blackPoint:10,whitePoint:240,midGamma:1.1,outBlack:0,outWhite:255}},
    {type:'quantise',enabled:true,opacity:0.8,params:{mode:'palette',palette:'1-bit',ditherMode:'floyd-steinberg',ditherStrength:0.8}}
  ]},
  HOLOGRAM: { version:1, globalSeed:777, previewScale:0.5, nodes:[
    {type:'chromaticab',enabled:true,opacity:1,params:{strength:8,redScale:1,greenScale:0,blueScale:-1,falloff:'quadratic',edgeMode:'clamp',samplingMode:'bilinear',radiusNorm:'corner distance',centreX:0.5,centreY:0.5}},
    {type:'grating',enabled:true,opacity:0.4,params:{gratingType:'LINEAR',wavelength:8,phase:0,angle:30,spiralRate:1,internalBlend:'SCREEN'}},
    {type:'scanlines',enabled:true,opacity:1,params:{spacing:3,thickness:0.3,scOpacity:0.2}},
    {type:'vignette',enabled:true,opacity:1,params:{amount:0.6,softness:0.5,roundness:0.8}}
  ]},
  LITHO: { version:1, globalSeed:444, previewScale:0.5, nodes:[
    {type:'greyscale',enabled:true,opacity:1,params:{wr:0.299,wg:0.587,wb:0.114}},
    {type:'quantise',enabled:true,opacity:1,params:{mode:'posterise',posteriseSpace:'rgb',rLevels:4,gLevels:4,bLevels:4}},
    {type:'halftonepattern',enabled:true,opacity:1,params:{spacing:6,angle:45,minDot:0.5,maxDot:3,bgLevel:255,dotLevel:0}}
  ]},
  DARKROOM: { version:1, globalSeed:111, previewScale:0.5, nodes:[
    {type:'curves',enabled:true,opacity:1,params:{shadowIn:0,shadowOut:10,midIn:128,midOut:140,highIn:255,highOut:245}},
    {type:'contrast',enabled:true,opacity:1,params:{lift:0,gamma:1,gain:1,contrast:0,pivot:0.5,vibrance:0.3}},
    {type:'vignette',enabled:true,opacity:1,params:{amount:0.4,softness:0.6,roundness:0.9}},
    {type:'filmgrain',enabled:true,opacity:1,params:{amount:15,size:1,lumResp:0.5,chromatic:0}}
  ]},
  CORRODED: { version:1, globalSeed:666, previewScale:0.5, nodes:[
    {type:'canny',enabled:true,opacity:1,params:{sigma:1.4,lowThreshold:0.08,highThreshold:0.2}},
    {type:'dilateerode',enabled:true,opacity:1,params:{mode:'dilate',radius:1,shape:'circle'}},
    {type:'levels',enabled:true,opacity:1,params:{blackPoint:0,whitePoint:200,midGamma:1.5,outBlack:0,outWhite:255}},
    {type:'quantise',enabled:true,opacity:1,params:{mode:'palette',palette:'1-bit',ditherMode:'floyd-steinberg',ditherStrength:1}}
  ]},
  ETCH: { version:1, globalSeed:222, previewScale:0.5, nodes:[
    {type:'sobel',enabled:true,opacity:1,params:{threshold:10,normalize:1}},
    {type:'invert',enabled:true,opacity:1,params:{}},
    {type:'levels',enabled:true,opacity:1,params:{blackPoint:30,whitePoint:220,midGamma:1.2,outBlack:0,outWhite:255}},
    {type:'quantise',enabled:true,opacity:0.6,params:{mode:'palette',palette:'1-bit',ditherMode:'bayer',ditherStrength:0.7}}
  ]}
};
