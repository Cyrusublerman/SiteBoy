## Purpose

- **Goal**: track missing or thin concepts in `@reference documentation`.
- **Item**: one bullet = one candidate reference page or major extension.

## 17_Noise_Functions

- [ ] **Noise families (core)**  
  - Includes: value noise, gradient noise, Perlin variants, Simplex/OpenSimplex (1D–4D), domain warping taxonomy.  
  - Gap: only Perlin/Simplex + basic warping currently; need full family, dimensional cases, and aliasing notes.  
  - Priority: High.
- [ ] **Cellular / feature-point noise**  
  - Includes: Worley noise, Voronoi-based textures, ridge/valley variants.  
  - Gap: no dedicated entries; only implicit via Voronoi and distance topics.  
  - Priority: High.
- [ ] **Spectral / coloured noise**  
  - Includes: white, pink (1/f), brown, blue, violet, 1/f^β, band-limited noise.  
  - Gap: no explicit spectral framing or colour-noise taxonomy.  
  - Priority: Medium.
- [ ] **Fractal noise constructions**  
  - Includes: fBm, multifractal noise, hybrid multifractals, turbulence, ridged noise.  
  - Gap: fractal layering used in practice but not formalised here.  
  - Priority: High.
- [ ] **Noise on manifolds and fields**  
  - Includes: noise on curves/surfaces/spheres, vector noise, curl noise, divergence-free fields.  
  - Gap: only scalar Euclidean noise treated.  
  - Priority: Medium.

## 14_Signal_Processing_Filtering

- [ ] **LTI systems and convolution formalism**  
  - Includes: impulse response, step response, convolution theorem, stability.  
  - Gap: convolution is present but not tied into LTI-system language.  
  - Priority: High.
- [ ] **Filter design space (domain + type)**  
  - Includes: spatial vs frequency vs wavelet domain; low-/high-/band-pass, band-stop; separable filters.  
  - Gap: individual transforms/filters exist, but no unifying taxonomy.  
  - Priority: Medium.
- [ ] **Sampling theory + aliasing**  
  - Includes: Nyquist rate, reconstruction filters, anti-aliasing for images and signals.  
  - Gap: crucial link between filtering and sampling not yet explicit.  
  - Priority: High.
- [ ] **Non-linear and edge-preserving filters (survey)**  
  - Includes: median filter, bilateral variants, guided filters, anisotropic diffusion as filtering.  
  - Gap: operators are listed but relationships and design trade-offs are missing.  
  - Priority: Medium.
- [ ] **Multi-resolution representations**  
  - Includes: Laplacian pyramids, Gaussian pyramids, wavelet packets.  
  - Gap: wavelet entries exist but multi-scale representation design not separated.  
  - Priority: Medium.

## 01_Edge_Gradient_Differential_Operators

- [ ] **Unified gradient / Hessian framework**  
  - Includes: continuous vs discrete derivatives, differential operators on grids, smoothing vs differentiation order.  
  - Gap: many operators documented separately; need a single conceptual scaffold.  
  - Priority: High.
- [ ] **Scale-space theory**  
  - Includes: Gaussian scale space, Laplacian scale-normalisation, blob detection.  
  - Gap: pieces (LoG, DoG) exist but not tied into a formal scale-space view.  
  - Priority: Medium.
- [ ] **Orientation and steerable filters**  
  - Includes: oriented derivatives, steerable filters, orientation pooling.  
  - Gap: orientation appears via HOG, but not as differential-operator design.  
  - Priority: Medium.

## 02_Image_Segmentation_Region_Extraction

- [ ] **Segmentation taxonomy**  
  - Includes: region-based, edge-based, clustering-based, graph-based, energy-based methods.  
  - Gap: algorithms are listed without a common classification framework.  
  - Priority: High.
- [ ] **Energy / variational formulations**  
  - Includes: Mumford–Shah, active contours (snakes), geodesic active contours.  
  - Gap: only level sets and a few methods; need explicit energy-function view.  
  - Priority: Medium.
- [ ] **Probabilistic segmentation**  
  - Includes: Markov random fields, conditional random fields, EM-based mixtures.  
  - Gap: no explicit probabilistic modelling section.  
  - Priority: Medium.

## 03_Raster_Vector_Conversion

- [ ] **Global pipeline overview**  
  - Includes: smoothing, edge extraction, skeletonisation, curve fitting, simplification, topology repair.  
  - Gap: algorithms are present but no end-to-end pipeline description.  
  - Priority: High.
- [ ] **Topology-preserving operations**  
  - Includes: guarantees on connectivity, hole preservation, homotopy constraints.  
  - Gap: individual methods touch topology but not in a unified way.  
  - Priority: Medium.
- [ ] **Stroke vs region vectorisation**  
  - Includes: centreline vs boundary extraction models; mixed representations.  
  - Gap: distinction only implicit via algorithms.  
  - Priority: Medium.

## 04_Sampling_Point_Distribution

- [ ] **Sampling design space**  
  - Includes: regular, jittered, stratified, blue noise, low-discrepancy, Poisson processes.  
  - Gap: strong per-method coverage but no compact classification.  
  - Priority: High.
- [ ] **Spectral analysis of point sets**  
  - Includes: power spectrum, anisotropy, radial distribution function.  
  - Gap: methods lack shared spectral-quality vocabulary.  
  - Priority: Medium.
- [ ] **Sampling on manifolds and irregular domains**  
  - Includes: curved surfaces, implicit surfaces, adaptive sampling.  
  - Gap: domain-generalisation mostly absent.  
  - Priority: Medium.

## 05_Space_Filling_Curves

- [ ] **Unified framework for space-filling constructions**  
  - Includes: substitution rules, iterated function systems, L-systems, digit-interleaving schemes.  
  - Gap: curves listed individually; need shared generative schema.  
  - Priority: High.
- [ ] **Metric and continuity properties**  
  - Includes: Hölder continuity, locality, distortion measures, traversal quality.  
  - Gap: properties only implicit; need explicit comparison section.  
  - Priority: Medium.
- [ ] **Applications taxonomy**  
  - Includes: indexing, dithering, scanning, pattern generation, path planning.  
  - Gap: uses are scattered across other folders, not summarised here.  
  - Priority: Medium.

## 06_Polygon_Grid_Domain_Subdivision

- [ ] **Domain discretisation overview**  
  - Includes: structured vs unstructured grids, primal/dual meshes, refinement strategies.  
  - Gap: algorithms are present, but grid/mesh design space is not summarised.  
  - Priority: High.
- [ ] **Quality measures and constraints**  
  - Includes: aspect ratio, angle bounds, smoothness across levels.  
  - Gap: no shared quality language across subdivision/triangulation methods.  
  - Priority: Medium.
- [ ] **Hierarchical data structures**  
  - Includes: trees vs graphs vs hybrid structures for multiresolution domains.  
  - Gap: quadtree/octree/K-d tree appear in isolation, not comparatively.  
  - Priority: Medium.

## 07_TSP_Based_Space_Filling

- [ ] **TSP for drawing vs optimisation**  
  - Includes: distinction between aesthetic space-filling tours and classical TSP objectives.  
  - Gap: algorithms are optimisation-flavoured; generative-art framing is missing.  
  - Priority: Medium.
- [ ] **Tour regularity and visual properties**  
  - Includes: edge-length distribution, angular change statistics, local density.  
  - Gap: no explicit metrics for “good” drawing tours.  
  - Priority: Medium.

## 08_Reaction_Diffusion_PDE

- [ ] **Pattern taxonomy from reaction–diffusion**  
  - Includes: spots, stripes, labyrinths, oscillatory and chaotic regimes.  
  - Gap: models are described but visual regimes not systematically catalogued.  
  - Priority: High.
- [ ] **Discretisation and stability overview**  
  - Includes: finite differences, finite elements, explicit vs implicit schemes, CFL conditions.  
  - Gap: numerical aspects appear piecemeal; need a compact stability/accuracy summary.  
  - Priority: High.
- [ ] **Links to texture and shape processing**  
  - Includes: RD on surfaces, morphogenesis-inspired texturing.  
  - Gap: applications to generative pattern design not centralised.  
  - Priority: Medium.

## 09_Orientation_Fields_Flow

- [ ] **Field representation choices**  
  - Includes: vector vs tensor fields, orientation vs direction, ambiguity handling.  
  - Gap: orientation tools exist, but representational trade-offs are not summarised.  
  - Priority: Medium.
- [ ] **Field design and editing**  
  - Includes: constraint-based design, smoothing, singularity placement.  
  - Gap: focus is on analysis/visualisation; design aspects are missing.  
  - Priority: Medium.

## 10_Curve_Theory_Stroke_Geometry

- [ ] **Stroke model taxonomy**  
  - Includes: centreline + width, offset curves, ribbons, variable-width strokes.  
  - Gap: individual notions exist (offsets, curvature) but not tied into a stroke model.  
  - Priority: High.
- [ ] **Discrete differential geometry for strokes**  
  - Includes: curvature/torsion on polylines, discrete Frenet frames, smoothing vs fairness.  
  - Gap: several entries exist but no unified DDC framing.  
  - Priority: Medium.
- [ ] **Perceptual stroke quality**  
  - Includes: corner handling, pressure emulation, calligraphic effects.  
  - Gap: pattern- and UX-driven stroke constraints absent.  
  - Priority: Medium.

## 11_Optimisation_Numerical_Methods

- [ ] **Optimisation landscape and problem types**  
  - Includes: convex vs non-convex, continuous vs discrete, constrained vs unconstrained.  
  - Gap: algorithms are listed without a typology of problem classes.  
  - Priority: High.
- [ ] **Regularisation and priors**  
  - Includes: L1/L2, TV, sparsity, smoothness; links to PDEs and segmentation.  
  - Gap: regularisation appears in other folders but not centralised here.  
  - Priority: Medium.
- [ ] **Stochastic vs deterministic trade-offs**  
  - Includes: convergence guarantees, exploration vs exploitation, noise in gradients.  
  - Gap: no compact comparison across MCMC, SA, GA, gradient methods.  
  - Priority: Medium.

## 12_Triangulation_Meshing_Geometry

- [ ] **Mesh quality and optimisation**  
  - Includes: Laplacian smoothing vs curvature flow, energy-based remeshing.  
  - Gap: quality-driven remeshing is only hinted at.  
  - Priority: Medium.
- [ ] **Higher-dimensional meshes and simplicial complexes**  
  - Includes: tetrahedral meshes, general simplices.  
  - Gap: focus is currently 2D; higher-D is absent.  
  - Priority: Low.

## 13_Distance_Morphology_Topology

- [ ] **Unified distance + morphology + topology framework**  
  - Includes: distance transforms, morphological operations, connectivity, homology.  
  - Gap: strong coverage of pieces, missing single conceptual map.  
  - Priority: High.
- [ ] **Topological invariants and stability**  
  - Includes: Betti numbers, persistence diagrams, stability theorems.  
  - Gap: persistent homology exists but without a small “tool user” summary.  
  - Priority: Medium.

## 14_Signal_Processing_Filtering (see above)

- **Note**: keep this section synchronised with filtering-related additions in other folders.

## 15_Colour_Perceptual_Models

- [ ] **Colour appearance models**  
  - Includes: CIECAM02 and successors; adaptation, surround, viewing conditions.  
  - Gap: current focus is spaces and quantisation; appearance-level models missing.  
  - Priority: Medium.
- [ ] **Perceptual metrics for patterns**  
  - Includes: contrast sensitivity, masking, just-noticeable differences in texture.  
  - Gap: colour metrics exist; pattern metrics do not.  
  - Priority: Medium.

## 16_Graphs_Connectivity_Pathfinding

- [ ] **Graph types and embeddings**  
  - Includes: grid graphs, proximity graphs, planar vs non-planar, geometric graphs.  
  - Gap: algorithms are present without explicit graph-class framing.  
  - Priority: Medium.
- [ ] **Spectral graph view**  
  - Includes: Laplacian eigenmaps, diffusion maps, relation to clustering and PDEs.  
  - Gap: Laplacian matrix and spectral clustering are present; need unified spectral narrative.  
  - Priority: Medium.

## 18_Pattern_Generation

- [ ] **Pattern taxonomy**  
  - Includes: tilings, stochastic textures, procedural textures, structural patterns, flow-based patterns.  
  - Gap: only Truchet tiles currently; need a domain-wide map connecting to other folders.  
  - Priority: High.
- [ ] **Compositional pattern systems**  
  - Includes: rule-based systems, grammar-based composition, pattern algebras.  
  - Gap: patterns treated individually, not as composable systems.  
  - Priority: Medium.

## 19_Interference_Optics

- [ ] **Wave optics foundations**  
  - Includes: Huygens–Fresnel principle, coherence, phase, superposition.  
  - Gap: applications listed without a minimal unifying theory section.  
  - Priority: Medium.
- [ ] **Digital synthesis of interference patterns**  
  - Includes: numerical simulation strategies, sampling issues, aliasing.  
  - Gap: link to discrete implementations (as in processing modules) not explicit.  
  - Priority: Medium.

## 20_Physics_Simulation

- [ ] **Physics simulation taxonomy**  
  - Includes: ODE vs PDE, particles vs fields, explicit vs implicit integrators.  
  - Gap: individual laws/models present; need high-level map.  
  - Priority: High.
- [ ] **Numerical integration overview**  
  - Includes: Euler, semi-implicit, Runge–Kutta, symplectic schemes.  
  - Gap: time integration not yet centralised here.  
  - Priority: Medium.

## Cross-cutting / processing code alignment

- [ ] **Reference ↔ processing alignment index**  
  - Includes: a small table or list mapping each processing module (noise, patterns, sampling, segmentation, space-filling, etc.) to its primary reference entries.  
  - Gap: code and theory match well by naming, but there is no explicit index.  
  - Priority: Medium.


