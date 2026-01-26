# Algorithms Test Lab - Complete Implementation Plan

## Architecture (CORRECT)

```
[DROPDOWN: Page Selection]  |  [OUTPUT | ABOUT]
[TABS: Domain within Page]
[Sidebar Controls]  |  [Canvas: Algorithm Testing]
```

## 6 Pages (Dropdown Options)

### Page 1: NOISE, SAMPLING, PATTERNS

**Tabs (Domains):**
1. **NOISE FUNCTIONS** (17_Noise_Functions)
   - Simplex ✅
   - Perlin
   - Value
   - Worley/Cellular
   - Fractional Brownian Motion (fBm) ✅
   - Domain Warping ✅
   - Colored Noise
   
2. **SAMPLING** (04_Sampling_Point_Distribution)
   - Poisson Disk ✅
   - Halton Sequence ✅
   - Sobol Sequence
   - Blue Noise
   - Stratified Sampling
   - Jittered Sampling
   - Importance Sampling
   
3. **PATTERNS** (18_Pattern_Generation)
   - Truchet Tiles ✅
   - Voronoi Diagrams
   - Delaunay Triangulation

**Sidebar Controls:**
- Noise type selector
- Scale slider
- Octaves, Lacunarity, Persistence (for fBm)
- Seed
- Color mapping options
- Sampling density
- Pattern parameters

**ABOUT docs:** Fetch from `blog/ideas/reference documentation/17_Noise_Functions/`, `04_Sampling_Point_Distribution/`, `18_Pattern_Generation/`

---

### Page 2: EDGES, FILTERING, SEGMENTATION

**Tabs (Domains):**
1. **EDGE DETECTION** (01_Edge_Gradient_Differential_Operators)
   - Sobel operator
   - Canny edge detector
   - Laplacian of Gaussian
   - Difference of Gaussians
   - Roberts cross
   - Prewitt operator
   
2. **FILTERING** (14_Signal_Processing_Filtering)
   - Gaussian blur
   - Bilateral filter
   - Median filter
   - Guided filter
   
3. **SEGMENTATION** (02_Image_Segmentation_Region_Extraction)
   - Otsu's method
   - Watershed
   - Mean shift
   - Connected components

**Sidebar Controls:**
- Source image selector
- Filter parameters (sigma, kernel size)
- Threshold values
- Edge strength
- Segmentation parameters

**ABOUT docs:** `01_Edge_Gradient_Differential_Operators/`, `14_Signal_Processing_Filtering/`, `02_Image_Segmentation_Region_Extraction/`

---

### Page 3: CURVES, DISTANCE, TOPOLOGY

**Tabs (Domains):**
1. **CURVES** (10_Curve_Theory_Stroke_Geometry)
   - Bézier curves
   - B-splines
   - Catmull-Rom splines
   - Ramer-Douglas-Peucker
   
2. **DISTANCE FIELDS** (13_Distance_Morphology_Topology)
   - Jump Flood Algorithm ✅
   - Signed Distance Fields
   - Grassfire transform
   - Morphological operations
   
3. **VECTORIZATION** (03_Raster_Vector_Conversion)
   - Potrace
   - Marching squares
   - Boundary tracing
   - Zhang-Suen thinning

**Sidebar Controls:**
- Shape primitives
- Distance field resolution
- SDF operations (union, intersection, difference)
- Morphology parameters (dilate, erode)
- Vectorization tolerance

**ABOUT docs:** `10_Curve_Theory_Stroke_Geometry/`, `13_Distance_Morphology_Topology/`, `03_Raster_Vector_Conversion/`

---

### Page 4: SPACE-FILLING, TSP, GRAPHS

**Tabs (Domains):**
1. **SPACE-FILLING CURVES** (05_Space_Filling_Curves)
   - Hilbert curve ✅
   - Peano curve
   - Gosper curve
   - Z-order curve
   - Moore curve
   
2. **TSP PATH OPTIMIZATION** (07_TSP_Based_Space_Filling)
   - Nearest neighbor ✅
   - 2-opt ✅
   - 3-opt
   - Christofides algorithm
   - Lin-Kernighan heuristic
   
3. **GRAPHS** (16_Graphs_Connectivity_Pathfinding)
   - Minimum spanning tree
   - A* pathfinding
   - Dijkstra's algorithm

**Sidebar Controls:**
- Point count
- Curve order/level
- TSP algorithm selector
- Graph type
- Visualization options

**ABOUT docs:** `05_Space_Filling_Curves/`, `07_TSP_Based_Space_Filling/`, `16_Graphs_Connectivity_Pathfinding/`

---

### Page 5: OPTICS, PHYSICS, PDE

**Tabs (Domains):**
1. **INTERFERENCE** (19_Interference_Optics)
   - Thin-film interference
   - Moiré patterns
   - Diffraction
   
2. **PHYSICS SIMULATION** (20_Physics_Simulation)
   - Wave equation
   - Heat equation
   - Advection
   
3. **REACTION-DIFFUSION** (08_Reaction_Diffusion_PDE)
   - Gray-Scott ✅
   - Turing patterns
   - FitzHugh-Nagumo

**Sidebar Controls:**
- Simulation parameters (feed rate, kill rate)
- Time step
- Diffusion coefficients
- Wave parameters
- Initial conditions

**ABOUT docs:** `19_Interference_Optics/`, `20_Physics_Simulation/`, `08_Reaction_Diffusion_PDE/`

---

### Page 6: COLOUR AND PERCEPTION

**Tabs (Domains):**
1. **COLOUR SPACES** (15_Colour_Perceptual_Models)
   - RGB/HSL/HSV conversion
   - LAB/LCH
   - Perceptual distance
   
2. **QUANTIZATION**
   - Posterization
   - Palette reduction
   - Dithering
   
3. **APPEARANCE**
   - Contrast enhancement
   - Histogram equalization

**Sidebar Controls:**
- Color space selector
- Quantization levels
- Palette size
- Dithering algorithm
- Source pattern selector

**ABOUT docs:** `15_Colour_Perceptual_Models/`

---

## Implementation Strategy

### Phase 1: Infrastructure ✅ COMPLETE
- CategoryTabsBar component ✅
- Tool layout structure ✅
- Basic tab switching ✅
- Category filtering ✅

### Phase 2: ABOUT System (NEXT)
1. Create markdown loader function (like biophilia project)
2. Load domain docs when ABOUT tab is selected
3. Cache loaded docs for performance
4. Display using ComponentLibrary.MarkdownBody

### Phase 3: Expand Algorithm Library
1. Implement missing algorithms in `assets/js/shared/algorithms/`
2. Each with proper @source citations to reference docs
3. Organize by domain folders

### Phase 4: Complete Tool Configuration
1. Update ALGORITHM_GROUPS with all 6 pages
2. Add all domain tabs for each page
3. Add appropriate controls for each domain
4. Wire rendering functions

### Phase 5: Testing & Polish
1. Test all page/domain combinations
2. Verify all controls work
3. Ensure ABOUT loads correctly for each domain
4. Performance optimization

---

## File Structure

```
blog/ideas/reference documentation/
├── 01_Edge_Gradient_Differential_Operators/  ← ABOUT docs
├── 02_Image_Segmentation_Region_Extraction/
├── 03_Raster_Vector_Conversion/
├── 04_Sampling_Point_Distribution/
├── 05_Space_Filling_Curves/
├── 07_TSP_Based_Space_Filling/
├── 08_Reaction_Diffusion_PDE/
├── 10_Curve_Theory_Stroke_Geometry/
├── 13_Distance_Morphology_Topology/
├── 14_Signal_Processing_Filtering/
├── 15_Colour_Perceptual_Models/
├── 16_Graphs_Connectivity_Pathfinding/
├── 17_Noise_Functions/
├── 18_Pattern_Generation/
├── 19_Interference_Optics/
└── 20_Physics_Simulation/

assets/js/shared/algorithms/
├── noise/
├── sampling/
├── patterns/
├── edge-detection/
├── filtering/
├── segmentation/
├── curves/
├── distance/
├── vectorization/
├── space-filling/
├── tsp/
├── graphs/
├── optics/
├── physics/
├── reaction-diffusion/
└── color/
```

---

## Estimated Scope

- **Total Algorithms**: ~150+ across all domains
- **Total Markdown Docs**: ~140+ reference files
- **Controls**: ~50+ unique control configurations
- **Canvas Renderers**: ~30+ unique rendering functions

This is a **substantial research tool** - equivalent to 6 specialized test pages combined into one modular interface.






