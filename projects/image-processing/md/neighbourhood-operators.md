### Convolution

A linear neighbourhood operator is a convolution: for a kernel \(K\) of size \((2r+1) \times (2r+1)\), the output at pixel \((x, y)\) is:

$$O(x, y) = \sum_{i=-r}^{r} \sum_{j=-r}^{r} K(i+r, j+r) \cdot I(x+i, y+j)$$

The border is handled by clamping pixel coordinates to the image boundary (replicate padding). All convolutions are computed on a floating-point copy of the buffer to avoid integer overflow and rounding during accumulation.

**Box blur** — uniform kernel, all entries \(1/(2r+1)^2\). Equivalent to a rectangular low-pass filter. Separable: implemented as two 1D passes (horizontal then vertical) for \(O(rWH)\) rather than \(O(r^2 WH)\).

**Gaussian blur** — kernel entries weighted by the 2D Gaussian \(G(i,j) = e^{-(i^2+j^2)/(2\sigma^2)}\). Separable into two 1D Gaussian passes. Sigma determines the spatial scale of smoothing; radius is typically \(r = \lceil 3\sigma \rceil\).

**Unsharp mask** — subtract a blurred copy from the original, scaled by an amount factor:

$$U = I + \text{amount} \cdot (I - \text{blur}(I, \sigma))$$

**Sobel edge detection** — two separable kernels compute the gradient:

$$G_x = \begin{bmatrix} -1 & 0 & 1 \\ -2 & 0 & 2 \\ -1 & 0 & 1 \end{bmatrix}, \quad G_y = \begin{bmatrix} -1 & -2 & -1 \\ 0 & 0 & 0 \\ 1 & 2 & 1 \end{bmatrix}$$

Gradient magnitude: \(G = \sqrt{G_x^2 + G_y^2}\). Gradient direction: \(\theta = \text{atan2}(G_y, G_x)\). Used in Canny edge detection (DISTORT) and HOG feature extraction (ASCII Art Generator).

**Laplacian** — second derivative operator; detects edges as zero-crossings:

$$\nabla^2 I = \frac{\partial^2 I}{\partial x^2} + \frac{\partial^2 I}{\partial y^2} \approx \begin{bmatrix} 0 & -1 & 0 \\ -1 & 4 & -1 \\ 0 & -1 & 0 \end{bmatrix} * I$$

### Morphological operations

Morphological operators interpret each pixel as binary (foreground/background) and apply set-theoretic operations using a structuring element \(B\) (typically a disc or square of radius \(r\)).

**Dilation** — grows foreground regions: \((I \oplus B)(x,y) = 1\) if any pixel within \(B\) of \((x,y)\) is foreground.

**Erosion** — shrinks foreground regions: \((I \ominus B)(x,y) = 1\) if all pixels within \(B\) of \((x,y)\) are foreground.

**Opening** = erosion then dilation: removes small foreground spots.

**Closing** = dilation then erosion: fills small background holes.

**Median filter** — non-linear; replaces each pixel with the median of its \((2r+1)^2\) neighbourhood. Preserves edges (unlike blur) while removing salt-and-pepper noise.

**Bilateral filter** — edge-preserving smoothing. Weights each neighbourhood pixel by a Gaussian in both spatial distance and intensity difference:

$$O(x,y) = \frac{\sum_{i,j} G_s(i,j) \cdot G_r(I(x+i,y+j) - I(x,y)) \cdot I(x+i,y+j)}{\sum_{i,j} G_s(i,j) \cdot G_r(I(x+i,y+j) - I(x,y))}$$

The spatial kernel \(G_s\) controls the spatial smoothing radius; the range kernel \(G_r\) controls the intensity-difference tolerance, effectively switching off smoothing across edges.
