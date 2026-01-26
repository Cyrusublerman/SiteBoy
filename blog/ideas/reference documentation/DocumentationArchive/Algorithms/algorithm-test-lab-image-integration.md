# Algorithm Test Lab - Lorem Picsum Integration & Image Processing Parameters

## Summary
Added Lorem Picsum image fetching for image processing algorithms and parameter controls for edge detection, filtering, and segmentation algorithms based on their documentation.

## Changes Made

### 1. Image State & Fetching System
- **Location**: Lines 45-115
- Added `imageState` object to cache loaded images
- Implemented `fetchLoremPicsum(width, height, seed)` - fetches grayscale images from Lorem Picsum
- Implemented `ensureTestImage(ctx, canvas, forceNew)` - caches and reuses images across renders

### 2. New Image Button Controls
Added "New Image" button to domains that process images:
- **Edges** (line 1054): Edge detection algorithms
- **Filtering** (line 1183): Image smoothing/noise reduction
- **Segmentation** (line 1209): Region extraction algorithms  
- **Vectorization** (line 1220): Contour extraction algorithms
- **Quantization** (line 1306-1322): Posterization/dithering algorithms

### 3. Edge Detection Algorithm Parameters
Based on Wikipedia/reference documentation, added adjustable parameters for each edge detection algorithm:

#### Canny Edge Detector
- **Low Threshold** (0.01 - 0.2, default: 0.05): Lower bound for hysteresis thresholding
- **High Threshold** (0.05 - 0.4, default: 0.15): Upper bound for hysteresis thresholding
- **Gaussian σ** (0.5 - 3.0, default: 1.4): Standard deviation for initial Gaussian blur
  - Larger σ = more smoothing, less noise sensitivity, may miss fine edges
  - Smaller σ = less smoothing, more noise sensitivity, better fine edge detection

**Documentation notes**:
- High/low thresholds control edge strength filtering
- Threshold ratio typically 2:1 or 3:1 (high:low)
- Gaussian blur removes noise but can also blur edges

#### Laplacian of Gaussian (LoG)
- **Gaussian σ** (0.5 - 5.0, default: 2.0): Controls scale of blob detection
  - σ affects detected blob size: r² = 2σ² (in 2D)
  - Larger σ detects larger structures
  - Smaller σ detects finer details

**Documentation notes**:
- Multi-scale approach necessary for different blob sizes
- Scale-normalized operator: ∇²_norm L = σ² (L_xx + L_yy)

#### Difference of Gaussians (DoG)
- **σ1 (small)** (0.5 - 3.0, default: 1.0): Smaller Gaussian scale
- **σ2 (large)** (1.0 - 5.0, default: 2.0): Larger Gaussian scale
  - σ2 should be > σ1
  - Approximates LoG: ∇²L ≈ (L(σ2) - L(σ1)) / Δσ

**Documentation notes**:
- DoG is approximation of Laplacian operator
- Used in SIFT algorithm
- More computationally efficient than LoG

#### Structure Tensor
- **Window σ** (0.5 - 3.0, default: 1.5): Size of integration window
  - Controls spatial extent of gradient analysis
  - Larger window = more robust to noise, less localized
  - Smaller window = more precise localization, more noise sensitive

**Documentation notes**:
- Also called second-moment matrix
- Captures local structure orientation
- Useful for edge and corner detection

#### Sobel & Laplacian
- No adjustable parameters (fixed kernel sizes)
- Sobel: 3×3 kernel for gradient approximation
- Laplacian: 3×3 discrete differential operator

### 4. Filtering Algorithm Parameters

#### Gaussian Blur
- **Gaussian σ** (0.5 - 5.0, default: 1.5): Standard deviation of Gaussian distribution
  - Controls amount of smoothing
  - Larger σ = more blur, smoother result
  - Pixels beyond 3σ contribute negligibly
- **Kernel Size** (3 - 15, default: 5): Discrete kernel dimensions
  - Typically ⌈6σ⌉ × ⌈6σ⌉ for accuracy
  - Must be odd number
  - Larger kernel = more computation but more accurate

**Documentation notes** (Gaussian_blur.md):
- Low-pass filter that attenuates high frequencies
- Separable filter: can apply 1D horizontally then vertically
- Reduces standard deviation: σr ≈ σX / (σf × 2√π)
- Commonly used for noise reduction and pre-processing

#### Bilateral Filter
- **Spatial σd** (1 - 10, default: 3): Spatial closeness weight
  - Controls size of neighborhood considered
  - Larger σd = larger features get smoothed
  - Similar to Gaussian blur's σ
- **Range σr** (0.01 - 0.3, default: 0.1): Intensity difference weight
  - Controls edge preservation
  - Larger σr = more like Gaussian blur (less edge preservation)
  - Smaller σr = stronger edge preservation

**Documentation notes** (Bilateral_filter.md):
- Non-linear, edge-preserving smoothing filter
- Weight based on both spatial distance AND intensity difference
- w(i,j,k,l) = exp(-(distance²/2σd²) - (intensity_diff²/2σr²))
- As σr increases, approaches Gaussian convolution
- Can introduce staircase artifacts or gradient reversal

#### Median Filter
- **Kernel Size** (3 - 9, default: 3): Size of neighborhood window
  - Must be odd number (3, 5, 7, 9)
  - Larger kernel = more smoothing, slower
  - Effective for salt-and-pepper noise

**Documentation notes**:
- Non-linear filter, replaces pixel with median of neighborhood
- Excellent for impulse noise removal
- Preserves edges better than linear filters

### 5. Segmentation Algorithm Parameters

#### Otsu's Method
- **No parameters** (automatic thresholding)
  - Algorithm automatically finds optimal threshold
  - Minimizes intra-class variance
  - Maximizes inter-class variance
  - Works best with bimodal histograms

**Documentation notes** (Otsu's_method.md):
- Optimal threshold t* minimizes within-class variance
- Equivalent to globally optimal k-means on histogram
- Performance degrades with:
  - Heavy noise
  - Small objects
  - Inhomogeneous lighting
  - Larger intra-class than inter-class variance

#### Connected Components & Flood Fill
- **No parameters** (use Otsu threshold automatically)
- Connected Components: Labels distinct regions after thresholding
- Flood Fill: Fills region from center point after thresholding

### 6. Updated Renderers (Now Async)
Modified these renderers to use cached Lorem Picsum images:

- **renderEdges** (line 2463): 
  - Fetches image via `ensureTestImage()`
  - Draws to canvas and extracts grayscale data
  - Passes user-adjusted parameters to algorithms
  - Processes with edge detection algorithms

- **renderSegmentation** (line 2550):
  - Uses cached image for segmentation tests
  - Converts to grayscale for processing
  - Parameters passed to algorithms

- **renderVectorization** (line 2732):
  - Uses cached image as scalar field
  - Extracts contours at threshold

- **renderQuantization** (line 3320):
  - Uses cached image for quantization/dithering
  - Tests posterization algorithms on real photos

### 7. Handler Function
- **handleFetchNewImage** (line 877): 
  - Generates new random seed
  - Clears cached image to force re-fetch on next render

### 8. Main Render Function
- **renderAlgorithm** (line 1360): Now `async`
  - Awaits async renderers (edges, segmentation, vectorization, quantization)
  - Other renderers remain synchronous

### 9. Config Updates
- **onUpdate** (line 3457): Added handler for `_fetchImage` button clicks
- **onDraw** (line 3528): Now `async` to support async renderers

## API Usage
Using Lorem Picsum grayscale images:
```
https://picsum.photos/seed/{seed}/720/720?grayscale
```

## Parameter Documentation Sources

### Edge Detection
- **Canny_edge_detector.md**: Lines 176-183 (Parameters section)
- **Laplacian_of_Gaussian.md**: Lines 10-36 (LoG operator)
- **Difference_of_Gaussians.md**: Lines 39-53 (DoG approximation)
- **Sobel_operator.md**: Fixed 3×3 kernels
- **Structure_tensor.md**: Integration window

### Filtering
- **Gaussian_blur.md**: Lines 10-36 (Mathematics, σ and kernel size)
  - Formula: G(x,y) = (1/2πσ²)exp(-(x²+y²)/2σ²)
  - Kernel typically ⌈6σ⌉ × ⌈6σ⌉
- **Bilateral_filter.md**: Lines 32-54 (Parameters section)
  - σd controls spatial smoothing
  - σr controls edge preservation
  - Weight formula includes both spatial and range terms

### Segmentation
- **Otsu's_method.md**: Lines 8-58 (Algorithm description)
  - Automatic threshold selection
  - Minimizes intra-class variance
  - Works best with bimodal distributions

## Benefits
1. **Real photo testing**: Image processing algorithms tested on actual photos
2. **Consistent testing**: Seeded random images ensure reproducibility
3. **Fast loading**: Images cached per session, only fetched when "New Image" clicked
4. **CORS-friendly**: Lorem Picsum supports `crossOrigin='anonymous'`
5. **Tunable parameters**: Users can adjust algorithm behavior based on documentation
6. **Educational**: Parameter names and ranges match academic literature
7. **Interactive learning**: See effect of σ, kernel size, thresholds in real-time

## User Flow
1. Navigate to Algorithm Test Lab → Page 2 (Edges/Filtering/Segmentation)
2. Select an image processing algorithm
3. First render fetches a random image from Lorem Picsum
4. Adjust algorithm parameters using sliders:
   - Edge detection: thresholds, σ values
   - Filtering: spatial/range σ, kernel sizes
   - Segmentation: automatic (no parameters for Otsu)
5. Click "New Image" button to fetch a different random photo
6. Algorithm processes and displays results with current parameter settings

## Technical Notes
- Images are 720×720 grayscale (matching canvas size)
- Seed stored in `imageState.lastSeed` for consistency
- Loading shows "Loading image..." fallback
- CORS enabled via `img.crossOrigin = 'anonymous'`
- ImageData cached alongside Image for efficient re-processing
- Parameter defaults match common academic/OpenCV conventions
- All filtering algorithms work on grayscale images
- Bilateral filter preserves edges while smoothing (non-linear)
- Median filter excellent for salt-and-pepper noise

## Changes Made

### 1. Image State & Fetching System
- **Location**: Lines 45-115
- Added `imageState` object to cache loaded images
- Implemented `fetchLoremPicsum(width, height, seed)` - fetches grayscale images from Lorem Picsum
- Implemented `ensureTestImage(ctx, canvas, forceNew)` - caches and reuses images across renders

### 2. New Image Button Controls
Added "New Image" button to domains that process images:
- **Edges** (line 1054): Edge detection algorithms
- **Segmentation** (line 1059): Region extraction algorithms  
- **Vectorization** (line 1087): Contour extraction algorithms
- **Quantization** (line 1173-1189): Posterization/dithering algorithms

### 3. Edge Detection Algorithm Parameters
Based on Wikipedia/reference documentation, added adjustable parameters for each edge detection algorithm:

#### Canny Edge Detector
- **Low Threshold** (0.01 - 0.2, default: 0.05): Lower bound for hysteresis thresholding
- **High Threshold** (0.05 - 0.4, default: 0.15): Upper bound for hysteresis thresholding
- **Gaussian σ** (0.5 - 3.0, default: 1.4): Standard deviation for initial Gaussian blur
  - Larger σ = more smoothing, less noise sensitivity, may miss fine edges
  - Smaller σ = less smoothing, more noise sensitivity, better fine edge detection

**Documentation notes**:
- High/low thresholds control edge strength filtering
- Threshold ratio typically 2:1 or 3:1 (high:low)
- Gaussian blur removes noise but can also blur edges

#### Laplacian of Gaussian (LoG)
- **Gaussian σ** (0.5 - 5.0, default: 2.0): Controls scale of blob detection
  - σ affects detected blob size: r² = 2σ² (in 2D)
  - Larger σ detects larger structures
  - Smaller σ detects finer details

**Documentation notes**:
- Multi-scale approach necessary for different blob sizes
- Scale-normalized operator: ∇²_norm L = σ² (L_xx + L_yy)

#### Difference of Gaussians (DoG)
- **σ1 (small)** (0.5 - 3.0, default: 1.0): Smaller Gaussian scale
- **σ2 (large)** (1.0 - 5.0, default: 2.0): Larger Gaussian scale
  - σ2 should be > σ1
  - Approximates LoG: ∇²L ≈ (L(σ2) - L(σ1)) / Δσ

**Documentation notes**:
- DoG is approximation of Laplacian operator
- Used in SIFT algorithm
- More computationally efficient than LoG

#### Structure Tensor
- **Window σ** (0.5 - 3.0, default: 1.5): Size of integration window
  - Controls spatial extent of gradient analysis
  - Larger window = more robust to noise, less localized
  - Smaller window = more precise localization, more noise sensitive

**Documentation notes**:
- Also called second-moment matrix
- Captures local structure orientation
- Useful for edge and corner detection

#### Sobel & Laplacian
- No adjustable parameters (fixed kernel sizes)
- Sobel: 3×3 kernel for gradient approximation
- Laplacian: 3×3 discrete differential operator

### 4. Updated Renderers (Now Async)
Modified these renderers to use cached Lorem Picsum images:

- **renderEdges** (line 2430): 
  - Fetches image via `ensureTestImage()`
  - Draws to canvas and extracts grayscale data
  - Passes user-adjusted parameters to algorithms
  - Processes with edge detection algorithms

- **renderSegmentation** (line 2517):
  - Uses cached image for segmentation tests
  - Converts to grayscale for processing

- **renderVectorization** (line 2699):
  - Uses cached image as scalar field
  - Extracts contours at threshold

- **renderQuantization** (line 3287):
  - Uses cached image for quantization/dithering
  - Tests posterization algorithms on real photos

### 5. Handler Function
- **handleFetchNewImage** (line 868): 
  - Generates new random seed
  - Clears cached image to force re-fetch on next render

### 6. Main Render Function
- **renderAlgorithm** (line 1327): Now `async`
  - Awaits async renderers (edges, segmentation, vectorization, quantization)
  - Other renderers remain synchronous

### 7. Config Updates
- **onUpdate** (line 3424): Added handler for `_fetchImage` button clicks
- **onDraw** (line 3495): Now `async` to support async renderers

## API Usage
Using Lorem Picsum grayscale images:
```
https://picsum.photos/seed/{seed}/720/720?grayscale
```

## Parameter Documentation Sources
Edge detection parameters based on:
- **Canny_edge_detector.md**: Lines 176-183 (Parameters section)
  - Gaussian filter size affects noise sensitivity vs edge localization
  - Dual thresholds provide flexibility in edge detection
- **Laplacian_of_Gaussian.md**: Lines 10-36 (LoG operator and scale selection)
  - Blob size relationship: r² = 2σ² for 2D images
  - Scale-normalized operator for multi-scale detection
- **Difference_of_Gaussians.md**: Lines 39-53 (DoG as LoG approximation)
  - DoG approximates Laplacian via scale-space difference
  - Used in SIFT for efficiency
- **Sobel_operator.md**: Fixed 3×3 kernels (no parameters)
- **Structure_tensor.md**: Integration window controls local analysis

## Benefits
1. **Real photo testing**: Image processing algorithms tested on actual photos
2. **Consistent testing**: Seeded random images ensure reproducibility
3. **Fast loading**: Images cached per session, only fetched when "New Image" clicked
4. **CORS-friendly**: Lorem Picsum supports `crossOrigin='anonymous'`
5. **Tunable parameters**: Users can adjust algorithm behavior based on documentation
6. **Educational**: Parameter names and ranges match academic literature

## User Flow
1. Navigate to Algorithm Test Lab → Page 2 (Edges/Segmentation)
2. Select an edge detection algorithm
3. First render fetches a random image from Lorem Picsum
4. Adjust algorithm parameters (thresholds, σ values) using sliders
5. Click "New Image" button to fetch a different random photo
6. Algorithm processes and displays results with current parameter settings

## Technical Notes
- Images are 720×720 grayscale (matching canvas size)
- Seed stored in `imageState.lastSeed` for consistency
- Loading shows "Loading image..." fallback
- CORS enabled via `img.crossOrigin = 'anonymous'`
- ImageData cached alongside Image for efficient re-processing
- Parameter defaults match common academic/OpenCV conventions

