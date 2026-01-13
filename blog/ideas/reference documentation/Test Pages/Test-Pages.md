## Purpose

- **Goal**: specify concrete test pages that exercise combinations of reference domains + `processing` modules.
- **Item**: one section = one test page concept; keep pages few but coverage broad.

## Page: Noise, Sampling, Patterns

- **Goal**: probe `17_Noise_Functions`, `04_Sampling_Point_Distribution`, `18_Pattern_Generation`.  
- **Domains**: noise families, point distributions, Truchet/tiling + procedural textures.  
- **Processing modules**: `noise/noise-functions.js`, `sampling/point-distribution.js`, `patterns/pattern-generators.js`.  
- **Tests**:
  - Vary noise families (value/gradient/cellular/fractal, coloured noise) and show impact on point sets and textures.  
  - Compare regular / stratified / blue noise sampling as inputs to the same pattern generator.  
  - Demonstrate domain warping + fBm on pattern motifs.  
- **Coverage intent**: high coverage of noise+sampling design space; direct mapping to expansion items in `17_Noise_Functions`, `04_Sampling_Point_Distribution`, `18_Pattern_Generation`.

## Page: Edges, Filtering, Segmentation

- **Goal**: probe `01_Edge_Gradient_Differential_Operators`, `14_Signal_Processing_Filtering`, `02_Image_Segmentation_Region_Extraction`.  
- **Domains**: differential operators, linear/non-linear filters, classical + graph-based segmentation.  
- **Processing modules**: `edge-detection/edge-operators.js`, `image/posterization.js`, `segmentation/thresholding.js`.  
- **Tests**:
  - Show how pre-filtering (Gaussian/bilateral/guided) affects edge operator outputs.  
  - Compare gradient-based vs threshold-based vs region-based segmentation on common inputs.  
  - Visualise scale-space behaviour and its effect on segmentation stability.  
- **Coverage intent**: tie together operators, filters, and segmentation taxonomy; validate LTI / scale-space / energy-based perspectives.

## Page: Curves, Distance, Topology, Raster↔Vector

- **Goal**: probe `10_Curve_Theory_Stroke_Geometry`, `13_Distance_Morphology_Topology`, `03_Raster_Vector_Conversion`, `12_Triangulation_Meshing_Geometry`.  
- **Domains**: stroke geometry, distance fields, morphology, vectorisation pipelines, basic meshing.  
- **Processing modules**: `geometry/sdf-operations.js`, `geometry/polygon-operations.js`, `distance/jfa.js`.  
- **Tests**:
  - Start with raster shapes → skeletonisation / medial axis → curve fitting and stroke reconstruction.  
  - Use SDF + morphology to grow/shrink regions and observe topological effects.  
  - Build simple triangulations from extracted curves and compare meshing quality.  
- **Coverage intent**: end-to-end pipeline from raster to structured geometry with explicit topology and distance reasoning.

## Page: Space-Filling, TSP, Graphs

- **Goal**: probe `05_Space_Filling_Curves`, `07_TSP_Based_Space_Filling`, `16_Graphs_Connectivity_Pathfinding`.  
- **Domains**: space-filling curves, TSP path optimisation, graph traversal and metrics.  
- **Processing modules**: `space-filling/space-filling-curves.js`, `tsp/path-optimization.js`.  
- **Tests**:
  - Compare Hilbert/Peano/Gosper-style curves against TSP-derived tours over the same point sets.  
  - Analyse path statistics (edge lengths, angle changes) and relate to visual qualities.  
  - Visualise graph structures (MST, nearest-neighbour graphs) underlying TSP heuristics.  
- **Coverage intent**: link theoretical curves, optimisation heuristics, and graph-theoretic views.

## Page: Optics, Physics, PDE Patterns

- **Goal**: probe `19_Interference_Optics`, `20_Physics_Simulation`, `08_Reaction_Diffusion_PDE`, with links to `14_Signal_Processing_Filtering`.  
- **Domains**: interference, wave/heat/reactive PDEs, basic numerical integration, pattern formation.  
- **Processing modules**: `optics/interference.js`, `physics/advection.js`.  
- **Tests**:
  - Simulate thin-film / moiré-style interference and vary sampling / filtering to expose aliasing.  
  - Run reaction–diffusion / advection experiments and classify resulting pattern regimes.  
  - Compare explicit vs more stable schemes (where implemented) for time-stepping.  
- **Coverage intent**: connect physical models, numerical schemes, and observable texture behaviours.

## Page: Colour and Perception

- **Goal**: probe `15_Colour_Perceptual_Models` in interaction with patterns and sampling.  
- **Domains**: colour spaces, quantisation, perceptual differences, basic appearance effects.  
- **Processing modules**: `image/posterization.js`, plus any colour-handling utilities.  
- **Tests**:
  - Show how different quantisation / palette strategies interact with noisy and structured patterns.  
- **Coverage intent**: ensure colour-space and perceptual concepts are exercised in the same contexts as noise, sampling, and pattern generation.


