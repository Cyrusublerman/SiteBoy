# DISTORT Effect Module Index

69 modules across 21 categories.

**System docs:**
- [UI/UX specification](ui-ux.md) — layout, ASCII diagrams, what to build, aesthetic compliance
- [Driver system](driver-system.md) — image drivers, expression drivers, variable & function reference
- [Performance management](performance.md) — render execution, animation pacing, loading feedback, memory
- [Module standards](../../guides/effect-module-standards.md)
- [Module style guide](../../guides/effect-module-style-guide.md)
- [Module build guide](../../guides/tools/effect-module-build-guide.md)

## COLOUR / TONE

| Type | Name | Doc |
|------|------|-----|
| `greyscale` | GREYSCALE | [greyscale.md](modules/greyscale.md) |
| `levels` | LEVELS | [levels.md](modules/levels.md) |
| `contrast` | LIFT/GAM/GAIN | [contrast.md](modules/contrast.md) |
| `curves` | CURVES | [curves.md](modules/curves.md) |
| `hsladjust` | HSL ADJUST | [hsladjust.md](modules/hsladjust.md) |
| `channelmixer` | CHANNEL MIXER | [channelmixer.md](modules/channelmixer.md) |
| `colourbalance` | COLOUR BALANCE | [colourbalance.md](modules/colourbalance.md) |
| `temptint` | TEMP / TINT | [temptint.md](modules/temptint.md) |
| `vibrance` | VIBRANCE | [vibrance.md](modules/vibrance.md) |
| `gradientmap` | GRADIENT MAP | [gradientmap.md](modules/gradientmap.md) |
| `invert` | INVERT | [invert.md](modules/invert.md) |
| `quantise` | QUANTISE | [quantise.md](modules/quantise.md) |
| `posterize` | POSTERIZE | [posterize.md](modules/posterize.md) |
| `dither` | DITHER | [dither.md](modules/dither.md) |
| `histogrameq` | HISTOGRAM EQ | [histogrameq.md](modules/histogrameq.md) |
| `clahe` | CLAHE | [clahe.md](modules/clahe.md) |

## BLUR

| Type | Name | Doc |
|------|------|-----|
| `boxblur` | BOX BLUR | [boxblur.md](modules/boxblur.md) |
| `gaussblur` | GAUSS BLUR | [gaussblur.md](modules/gaussblur.md) |
| `motionblur` | MOTION BLUR | [motionblur.md](modules/motionblur.md) |
| `radialblur` | RADIAL BLUR | [radialblur.md](modules/radialblur.md) |
| `median` | MEDIAN | [median.md](modules/median.md) |
| `bilateral` | BILATERAL | [bilateral.md](modules/bilateral.md) |

## SHARPEN

| Type | Name | Doc |
|------|------|-----|
| `unsharpmask` | UNSHARP MASK | [unsharpmask.md](modules/unsharpmask.md) |
| `highpass` | HIGH PASS | [highpass.md](modules/highpass.md) |

## TRANSFORM

| Type | Name | Doc |
|------|------|-----|
| `affine` | AFFINE XFORM | [affine.md](modules/affine.md) |

## WARP

| Type | Name | Doc |
|------|------|-----|
| `flowfield` | FLOW FIELD | [flowfield.md](modules/flowfield.md) |
| `bandshift` | BAND SHIFT | [bandshift.md](modules/bandshift.md) |
| `advection` | ADVECTION | [advection.md](modules/advection.md) |

## REFRACTION

| Type | Name | Doc |
|------|------|-----|
| `ripple` | RADIAL RIPPLE | [ripple.md](modules/ripple.md) |
| `lensbubbles` | LENS BUBBLES | [lensbubbles.md](modules/lensbubbles.md) |

## DISTORTION

| Type | Name | Doc |
|------|------|-----|
| `pixelate` | PIXELATE | [pixelate.md](modules/pixelate.md) |
| `polarcoords` | POLAR COORDS | [polarcoords.md](modules/polarcoords.md) |
| `spherize` | SPHERIZE | [spherize.md](modules/spherize.md) |
| `twirl` | TWIRL | [twirl.md](modules/twirl.md) |
| `chromaticab` | CHROMATIC AB | [chromaticab.md](modules/chromaticab.md) |

## ACCUMULATION

| Type | Name | Doc |
|------|------|-----|
| `iterrewarp` | ITER REWARP | [iterrewarp.md](modules/iterrewarp.md) |

## LINE RENDER

| Type | Name | Doc |
|------|------|-----|
| `lumflow` | LUMINANCE FLOW | [lumflow.md](modules/lumflow.md) |
| `serpentine` | SERPENTINE | [serpentine.md](modules/serpentine.md) |
| `statichalftone` | STATIC HALFTONE | [statichalftone.md](modules/statichalftone.md) |

## LINE RENDER (MODULE)

| Type | Name | Doc |
|------|------|-----|
| `moduleflowlines` | MODULE FLOW LINES | [moduleflowlines.md](modules/moduleflowlines.md) |
| `moduleserpentine` | MODULE SERPENTINE | [moduleserpentine.md](modules/moduleserpentine.md) |
| `modulestaticlines` | MODULE STATIC LINES | [modulestaticlines.md](modules/modulestaticlines.md) |

## EDGE

| Type | Name | Doc |
|------|------|-----|
| `sobel` | SOBEL EDGE | [sobel.md](modules/sobel.md) |
| `canny` | CANNY EDGE | [canny.md](modules/canny.md) |
| `laplacian` | LAPLACIAN | [laplacian.md](modules/laplacian.md) |
| `dog` | DIFF OF GAUSS | [dog.md](modules/dog.md) |

## PATTERN

| Type | Name | Doc |
|------|------|-----|
| `truchet` | TRUCHET | [truchet.md](modules/truchet.md) |
| `grating` | GRATING | [grating.md](modules/grating.md) |
| `moire` | MOIRE | [moire.md](modules/moire.md) |
| `halftonepattern` | HALFTONE DOT | [halftonepattern.md](modules/halftonepattern.md) |

## NOISE

| Type | Name | Doc |
|------|------|-----|
| `perlinoverlay` | NOISE OVERLAY | [perlinoverlay.md](modules/perlinoverlay.md) |
| `domainwarp` | DOMAIN WARP | [domainwarp.md](modules/domainwarp.md) |

## PHYSICS

| Type | Name | Doc |
|------|------|-----|
| `reactiondiffusion` | REACT-DIFFUSE | [reactiondiffusion.md](modules/reactiondiffusion.md) |
| `wavedistortion` | WAVE DISTORT | [wavedistortion.md](modules/wavedistortion.md) |
| `cellularautomata` | CELL AUTOMATA | [cellularautomata.md](modules/cellularautomata.md) |

## GENERATIVE

| Type | Name | Doc |
|------|------|-----|
| `paintstroke` | PAINT STROKE | [paintstroke.md](modules/paintstroke.md) |

## COMPOSITE

| Type | Name | Doc |
|------|------|-----|
| `tileblend` | TILE BLEND | [tileblend.md](modules/tileblend.md) |
| `stipple` | STIPPLE | [stipple.md](modules/stipple.md) |
| `delaunaymesh` | DELAUNAY MESH | [delaunaymesh.md](modules/delaunaymesh.md) |

## TEXTURE

| Type | Name | Doc |
|------|------|-----|
| `filmgrain` | FILM GRAIN | [filmgrain.md](modules/filmgrain.md) |
| `vignette` | VIGNETTE | [vignette.md](modules/vignette.md) |
| `scanlines` | SCANLINES | [scanlines.md](modules/scanlines.md) |

## MORPHOLOGY

| Type | Name | Doc |
|------|------|-----|
| `dilateerode` | DILATE/ERODE | [dilateerode.md](modules/dilateerode.md) |
| `openclose` | OPEN/CLOSE | [openclose.md](modules/openclose.md) |

## SEGMENTATION

| Type | Name | Doc |
|------|------|-----|
| `otsuthreshold` | OTSU THRESH | [otsuthreshold.md](modules/otsuthreshold.md) |

## GEOMETRIC

| Type | Name | Doc |
|------|------|-----|
| `voronoi` | VORONOI | [voronoi.md](modules/voronoi.md) |
| `contour` | CONTOUR | [contour.md](modules/contour.md) |
| `sdfshape` | SDF SHAPE | [sdfshape.md](modules/sdfshape.md) |

## OPTICS

| Type | Name | Doc |
|------|------|-----|
| `interference` | INTERFERENCE | [interference.md](modules/interference.md) |
