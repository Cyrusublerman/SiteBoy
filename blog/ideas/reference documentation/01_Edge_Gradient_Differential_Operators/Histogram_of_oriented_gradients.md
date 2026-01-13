# Histogram of Oriented Gradients (HOG)

## 1. Overview
Histogram of Oriented Gradients (HOG) is a feature descriptor used in computer vision for object detection. It counts occurrences of gradient orientation in localized portions of an image, capturing edge structure and local shape information. Originally developed for pedestrian detection, HOG is widely used for pattern recognition.

## 2. Algorithm Steps

### 2.1 Gradient Computation
Compute horizontal and vertical gradients using simple filters:

$$G_x = \begin{bmatrix} -1 & 0 & 1 \end{bmatrix} * I$$
$$G_y = \begin{bmatrix} -1 \\ 0 \\ 1 \end{bmatrix} * I$$

Or Sobel operators for smoother results.

### 2.2 Gradient Magnitude and Orientation
$$|G| = \sqrt{G_x^2 + G_y^2}$$
$$\theta = \arctan2(G_y, G_x)$$

Convert to unsigned orientation (0° to 180°) for illumination invariance:
$$\theta_{\text{unsigned}} = \theta \mod 180°$$

### 2.3 Cell Division
Divide image into small cells (typically 8×8 pixels).

### 2.4 Orientation Binning
For each cell, create histogram of gradient orientations:
- Typical: 9 bins covering 0°-180° (20° per bin)
- Weight each pixel's contribution by gradient magnitude
- Bilinear interpolation for soft binning:

$$\text{bin}_{\text{lower}} = \lfloor \theta / \text{bin\_width} \rfloor$$
$$\text{weight}_{\text{lower}} = 1 - (\theta \mod \text{bin\_width}) / \text{bin\_width}$$

### 2.5 Block Normalization
Group cells into overlapping blocks (typically 2×2 cells) and normalize:

**L2-norm**:
$$v_{\text{normalized}} = \frac{v}{\sqrt{\|v\|_2^2 + \epsilon^2}}$$

**L2-Hys** (clipped L2):
1. L2-normalize
2. Clip values to max 0.2
3. Re-normalize

**L1-sqrt**:
$$v_{\text{normalized}} = \sqrt{\frac{v}{\|v\|_1 + \epsilon}}$$

### 2.6 Feature Vector
Concatenate all normalized block histograms into single descriptor.

## 3. Parameters

| Parameter | Typical Value | Description |
|-----------|---------------|-------------|
| Cell size | 8×8 pixels | Spatial granularity |
| Block size | 2×2 cells | Normalization region |
| Block stride | 1 cell | Overlap between blocks |
| Bins | 9 | Orientation resolution |
| Orientation | 0°-180° | Unsigned gradients |

## 4. Descriptor Size
For image of \(W \times H\) pixels:
- Cells: \(\lfloor W/\text{cell} \rfloor \times \lfloor H/\text{cell} \rfloor\)
- Blocks: \((\text{cells}_x - 1) \times (\text{cells}_y - 1)\) for stride=1
- Features per block: \(\text{cells\_per\_block}^2 \times \text{bins}\)
- Total: \(\text{blocks} \times \text{features\_per\_block}\)

Example: 64×128 window → 3780 features

## 5. Soft Binning (Trilinear Interpolation)
For smoother histograms, distribute each pixel's contribution across:
- 2 spatial bins (x-direction)
- 2 spatial bins (y-direction)  
- 2 orientation bins

$$w_{ijk} = (1 - |x - x_i|)(1 - |y - y_j|)(1 - |\theta - \theta_k|)$$

## 6. Implementation

### 6.1 Pseudocode
```
function computeHOG(image):
    // Compute gradients
    gx = convolve(image, [-1, 0, 1])
    gy = convolve(image, [-1, 0, 1].T)
    magnitude = sqrt(gx² + gy²)
    orientation = atan2(gy, gx) * 180/π
    orientation = orientation mod 180
    
    // Build cell histograms
    cells = empty array
    for each cell (cx, cy):
        hist = zeros(num_bins)
        for each pixel (x, y) in cell:
            bin = floor(orientation[x,y] / bin_width)
            hist[bin] += magnitude[x,y]
        cells[cx, cy] = hist
    
    // Block normalization
    features = []
    for each block (bx, by):
        block_hist = concatenate cells in block
        block_hist = normalize(block_hist)
        features.append(block_hist)
    
    return concatenate(features)
```

### 6.2 Visualization
Display gradient directions as small line segments:
- Direction: orientation angle
- Length: magnitude
- Or show cell histograms as star glyphs

## 7. Variants
- **R-HOG**: Rectangular blocks (standard)
- **C-HOG**: Circular blocks
- **PHOG**: Pyramid of HOG (multi-scale)
- **FHOG**: Felzenszwalb HOG (adds contrast-insensitive features)

## 8. Applications
- Pedestrian detection
- Object recognition
- Glyph/character matching
- Texture analysis
- ASCII art generation (matching glyphs to image regions)

## 9. References
- Dalal, N., and Triggs, B. "Histograms of oriented gradients for human detection." CVPR 2005.
- Felzenszwalb, P., et al. "Object detection with discriminatively trained part-based models." PAMI 2010.
- "Histogram of oriented gradients." Wikipedia. https://en.wikipedia.org/wiki/Histogram_of_oriented_gradients

