# Complex Line Shading — System Architecture

## 1. High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER INPUT                                 │
│                                                                         │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐  │
│   │ Image File   │    │ Parameters   │    │ Fill Method Selection    │  │
│   │ (JPEG/PNG)   │    │ (sliders)    │    │ (Hilbert/TSP/L-System)   │  │
│   └──────┬───────┘    └──────┬───────┘    └────────────┬─────────────┘  │
└──────────┼───────────────────┼─────────────────────────┼────────────────┘
           │                   │                         │
           ▼                   ▼                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           PROCESSING PIPELINE                            │
│                                                                          │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐  │
│  │   DECODE    │──▶│  GRAYSCALE  │──▶│    EDGE     │──▶│   REGION    │  │
│  │   IMAGE     │   │  CONVERT    │   │  DETECTION  │   │ EXTRACTION  │  │
│  └─────────────┘   └─────────────┘   └─────────────┘   └──────┬──────┘  │
│                                                               │         │
│                    ┌──────────────────────────────────────────┘         │
│                    │                                                    │
│                    ▼                                                    │
│           ┌────────────────┐                                            │
│           │  FOR EACH      │                                            │
│           │    REGION      │◀──────────────────────────────────┐        │
│           └───────┬────────┘                                   │        │
│                   │                                            │        │
│       ┌───────────┼───────────┐                               │        │
│       ▼           ▼           ▼                               │        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                         │        │
│  │ HILBERT │ │   TSP   │ │ L-SYSTEM│                         │        │
│  │  FILL   │ │  FILL   │ │  FILL   │                         │        │
│  └────┬────┘ └────┬────┘ └────┬────┘                         │        │
│       │           │           │                               │        │
│       └───────────┼───────────┘                               │        │
│                   │                                            │        │
│                   ▼                                            │        │
│           ┌────────────────┐                                   │        │
│           │   MODULATE     │                                   │        │
│           │    WIDTH       │───────────────────────────────────┘        │
│           └───────┬────────┘                                            │
│                   │                                                     │
└───────────────────┼─────────────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                              OUTPUT                                       │
│                                                                           │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐   │
│   │ Canvas       │    │ SVG          │    │ PNG                      │   │
│   │ Preview      │    │ Download     │    │ Export                   │   │
│   └──────────────┘    └──────────────┘    └──────────────────────────┘   │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Type Definitions

### 2.1 Input Types

```typescript
interface ImageInput {
    data: Uint8ClampedArray;  // RGBA pixels
    width: number;
    height: number;
}

interface Parameters {
    // Edge detection
    edgeSigma: number;        // 0.5-5.0
    edgeLow: number;          // 0.0-1.0
    edgeHigh: number;         // 0.0-1.0
    
    // Fill method
    fillMethod: 'hilbert' | 'tsp' | 'lsystem';
    
    // Hilbert
    minSquareSize: number;    // 4-64
    curveOrder: number;       // 2-6
    adaptiveDensity: boolean;
    
    // TSP
    pointSpacingMin: number;  // 2-32
    pointSpacingMax: number;  // 8-128
    optimization: 'none' | '2opt' | '3opt';
    
    // Modulation
    lineWidthMin: number;     // 0.1-5.0
    lineWidthMax: number;     // 0.5-10.0
    smoothing: number;        // 0-20
    invert: boolean;
}
```

### 2.2 Intermediate Types

```typescript
type Grayscale = Float32Array;           // [0-255], length = w×h
type Binary = Uint8Array;                // [0,1], length = w×h
type Labels = Int32Array;                // [0-n], length = w×h

interface Vec2 {
    x: number;
    y: number;
}

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Contour {
    vertices: Vec2[];
    closed: boolean;
    parentId?: number;
}

interface Region {
    id: number;
    contour: Contour;
    bounds: Rect;
    area: number;
}

interface EdgeData {
    edges: Uint8Array;
    magnitude: Float32Array;
    direction: Float32Array;
}
```

### 2.3 Output Types

```typescript
interface ModulatedPath {
    points: Vec2[];
    widths: number[];
    regionId: number;
}

interface ToolOutput {
    paths: ModulatedPath[];
    svg: string;
    metadata: {
        regionCount: number;
        totalPoints: number;
        processingTime: number;
    };
}
```

---

## 3. Module Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PROCESSING LIBRARY                              │
│                                                                         │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                          CORE                                    │  │
│   │   ┌─────────────────┐    ┌─────────────────┐                    │  │
│   │   │   math-utils    │    │     matrix      │                    │  │
│   │   │ (vectors, stats)│    │  (convolution)  │                    │  │
│   │   └────────┬────────┘    └────────┬────────┘                    │  │
│   └────────────┼──────────────────────┼─────────────────────────────┘  │
│                │                      │                                 │
│   ┌────────────┼──────────────────────┼─────────────────────────────┐  │
│   │            ▼                      ▼                              │  │
│   │   ┌─────────────────┐    ┌─────────────────┐                    │  │
│   │   │ edge-detection  │    │  segmentation   │                    │  │
│   │   │ (sobel, canny)  │    │ (otsu, cc)      │                    │  │
│   │   └────────┬────────┘    └────────┬────────┘                    │  │
│   │            │                      │                              │  │
│   └────────────┼──────────────────────┼─────────────────────────────┘  │
│                │                      │                                 │
│   ┌────────────┼──────────────────────┼─────────────────────────────┐  │
│   │            ▼                      ▼                              │  │
│   │   ┌─────────────────┐    ┌─────────────────┐                    │  │
│   │   │    geometry     │◀───│    sampling     │                    │  │
│   │   │ (pip, packing)  │    │ (poisson, etc)  │                    │  │
│   │   └────────┬────────┘    └────────┬────────┘                    │  │
│   │            │                      │                              │  │
│   └────────────┼──────────────────────┼─────────────────────────────┘  │
│                │                      │                                 │
│   ┌────────────┼──────────────────────┼─────────────────────────────┐  │
│   │            ▼                      ▼                              │  │
│   │   ┌─────────────────┐    ┌─────────────────┐                    │  │
│   │   │  space-filling  │    │      tsp        │                    │  │
│   │   │ (hilbert, etc)  │    │  (nn, 2-opt)    │                    │  │
│   │   └─────────────────┘    └─────────────────┘                    │  │
│   │                                                                  │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         TOOL IMPLEMENTATION                             │
│                                                                         │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                    complex-line-shading.js                       │  │
│   │                                                                  │  │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │  │
│   │   │  Pipeline   │  │  Hilbert    │  │    TSP      │             │  │
│   │   │  Manager    │  │  Filler     │  │   Filler    │             │  │
│   │   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │  │
│   │          │                │                │                     │  │
│   │          └────────────────┼────────────────┘                     │  │
│   │                           │                                      │  │
│   │                           ▼                                      │  │
│   │                  ┌─────────────────┐                            │  │
│   │                  │   SVG Output    │                            │  │
│   │                  │   Generator     │                            │  │
│   │                  └─────────────────┘                            │  │
│   │                                                                  │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           UI LAYER                                      │
│                                                                         │
│   ┌────────────────┐  ┌────────────────┐  ┌────────────────┐           │
│   │    Sidebar     │  │    Canvas      │  │    Export      │           │
│   │   Controls     │  │    Preview     │  │   Controller   │           │
│   └────────────────┘  └────────────────┘  └────────────────┘           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Stage-by-Stage Processing

### Stage 1: Image Decode

```
Input:  File (JPEG/PNG)
Output: ImageData { data: Uint8ClampedArray, width, height }

Process:
1. Create Image element
2. Draw to temporary canvas
3. Extract ImageData
```

### Stage 2: Grayscale Conversion

```
Input:  ImageData
Output: Float32Array (grayscale)

Process:
1. For each pixel: L = 0.299R + 0.587G + 0.114B
2. Store in Float32Array

Dependencies: None
Cacheable: Yes (key: imageHash)
```

### Stage 3: Edge Detection

```
Input:  grayscale, { sigma, lowThreshold, highThreshold }
Output: { edges, magnitude, direction }

Process:
1. Gaussian blur (sigma)
2. Sobel gradients
3. Non-maximum suppression
4. Hysteresis thresholding

Dependencies: grayscale
Cacheable: Yes (key: grayscaleHash + params)
Invalidated by: sigma, lowThreshold, highThreshold changes
```

### Stage 4: Region Extraction

```
Input:  grayscale
Output: { labels, regions: Region[] }

Process:
1. Otsu threshold
2. Connected components
3. Marching squares per component
4. Douglas-Peucker simplification

Dependencies: grayscale
Cacheable: Yes (key: grayscaleHash)
```

### Stage 5: Space Filling (per region)

```
Input:  region: Region, grayscale, fillMethod, params
Output: Vec2[] (path)

Process (Hilbert):
1. Pack squares in polygon
2. Generate Hilbert curve per square
3. Connect curves

Process (TSP):
1. Sample points (variable Poisson)
2. Filter to inside polygon
3. Nearest neighbor
4. 2-opt improvement

Dependencies: region, grayscale
Cacheable: Yes (key: regionId + fillMethod + params)
Invalidated by: fillMethod, Hilbert/TSP params
```

### Stage 6: Width Modulation

```
Input:  path: Vec2[], grayscale, { wMin, wMax, smoothing }
Output: number[] (widths)

Process:
1. Sample intensity at each path point
2. Map to width range
3. Gaussian smooth

Dependencies: path, grayscale
Cacheable: Yes (key: pathHash + params)
Invalidated by: wMin, wMax, smoothing changes
```

### Stage 7: SVG Generation

```
Input:  ModulatedPath[]
Output: string (SVG)

Process:
1. Build SVG header with viewBox
2. For each path: generate <path> or <line> elements
3. Apply stroke-width per segment
4. Close SVG

Dependencies: paths
Cacheable: No (always regenerate)
```

---

## 5. Caching Strategy

### Cache Keys

```javascript
const cacheKeys = {
    grayscale: hashImage(imageData),
    edges: `${cacheKeys.grayscale}_${sigma}_${lowT}_${highT}`,
    regions: cacheKeys.grayscale,
    fill: (regionId) => `${regionId}_${fillMethod}_${fillParams}`,
    width: (pathHash) => `${pathHash}_${wMin}_${wMax}_${smoothing}`
};
```

### Invalidation Rules

| Parameter Change | Invalidates |
|------------------|-------------|
| New image | All caches |
| Edge params | edges, (nothing else if not using edges for regions) |
| Fill method | fill caches for all regions |
| Hilbert params | fill caches (Hilbert regions only) |
| TSP params | fill caches (TSP regions only) |
| Width params | width caches only |

---

## 6. Event Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            EVENT FLOW                                   │
│                                                                         │
│   USER ACTION              HANDLER                    PIPELINE STAGE    │
│   ───────────              ───────                    ──────────────    │
│                                                                         │
│   Upload Image      →      onFileChange()       →     1-7 (full)        │
│                                                                         │
│   Change Sigma      →      onParamChange()      →     3-7 (from edges)  │
│                                                                         │
│   Change Fill       →      onParamChange()      →     5-7 (from fill)   │
│   Method                                                                │
│                                                                         │
│   Change Square     →      onParamChange()      →     5-7 (Hilbert      │
│   Size                                                 only)            │
│                                                                         │
│   Change Width      →      onParamChange()      →     6-7 (width only)  │
│   Min/Max                                                               │
│                                                                         │
│   Click Download    →      onExport()           →     7 (SVG generate)  │
│   SVG                                                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Error Handling

### Error Categories

| Category | Example | Response |
|----------|---------|----------|
| Input | Invalid image format | Show error, keep previous state |
| Processing | Region too small | Skip region, continue |
| Resource | Memory limit | Reduce resolution, warn user |
| Timeout | TSP too slow | Cap iterations, return best so far |

### Error Propagation

```javascript
class ProcessingError extends Error {
    constructor(stage, message, recoverable = true) {
        super(`[${stage}] ${message}`);
        this.stage = stage;
        this.recoverable = recoverable;
    }
}

// Usage
try {
    const regions = extractRegions(grayscale, width, height);
} catch (e) {
    if (e.recoverable) {
        showWarning(e.message);
        // Continue with partial results
    } else {
        showError(e.message);
        // Abort pipeline
    }
}
```

---

## 8. Performance Budgets

### Target Metrics

| Image Size | Edge Detection | Region Extract | Fill (per region) | Total |
|------------|----------------|----------------|-------------------|-------|
| 512×512 | <50ms | <100ms | <200ms | <1s |
| 1024×1024 | <200ms | <400ms | <500ms | <3s |
| 2048×2048 | <800ms | <1500ms | <1000ms | <10s |

### Optimization Strategies

1. **Web Workers** — Offload edge detection and region extraction
2. **Progressive Rendering** — Show partial results as regions complete
3. **Level of Detail** — Reduce curve order for large images
4. **Spatial Indexing** — Grid-based point lookup for TSP

---

## 9. State Management

### Tool State Structure

```javascript
const toolState = {
    // Input
    sourceImage: ImageData | null,
    
    // Cached intermediates
    grayscale: Float32Array | null,
    edges: EdgeData | null,
    regions: Region[] | null,
    
    // Per-region fills (keyed by region ID)
    fills: Map<number, Vec2[]>,
    
    // Output
    paths: ModulatedPath[],
    svg: string,
    
    // UI state
    processing: boolean,
    progress: number,
    error: string | null,
    
    // Parameters (bound to UI)
    params: Parameters
};
```

### State Transitions

```
IDLE ──[upload]──▶ LOADING ──[decode]──▶ PROCESSING ──[complete]──▶ READY
  ▲                   │                       │                        │
  │                   │                       │                        │
  └──────[clear]──────┴───────[error]─────────┴───────[param change]───┘
```

