# ASCII Art Generator — Theoretical Foundation

## 1. Glyph Feature Extraction

### Density Metrics

**Global density:**
$$
D_g = \frac{1}{WH} \sum_{x,y} G(x,y)
$$

**Quadrant density:**
$$
D_{q} = \text{mean}(G|_{\text{quadrant } q})
$$

### Orientation Analysis

**Sobel gradients:**
$$
G_x, G_y \rightarrow \theta = \arctan2(G_y, G_x)
$$

**Orientation histogram:** bucket \( \theta \) into [0, π).

**Dominant orientation vector:**
$$
\mathbf{o}_g = \text{argmax}_\theta \text{hist}(\theta)
$$

**Strength:**
$$
M_g = \text{mean}(\sqrt{G_x^2 + G_y^2})
$$

**Reference:** `blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/Histogram_of_oriented_gradients.md`

### 4×4 Signature

Partition bitmap into 4×4 grid, threshold → 16-bit binary signature \( S_g \).

## 2. Matching Cost Function

$$
C = \alpha \cdot C_{tone} + \beta \cdot C_{quad} + \gamma \cdot C_{ori} + \delta \cdot C_{sig}
$$

Where:
- \( C_{tone} = |D_g - D_t| \)
- \( C_{quad} = \sum_q |D_{g,q} - D_{t,q}| \)
- \( C_{ori} = (1 - |\mathbf{o}_g \cdot \mathbf{o}_t|) \cdot M_g \cdot M_t \)
- \( C_{sig} = \text{Hamming}(S_g, S_t) / 16 \)

**Reference:** `blog/ideas/reference documentation/11_Optimisation_Numerical_Methods/Hamming_distance.md`

## 3. Coherence Engine

**Neighbor penalty:**
$$
P = \lambda (1 - |\mathbf{o}_g \cdot \mathbf{o}_{neighbor}|)
$$

**Refinement:** Iterative passes, optionally lock strong edges.

## 4. Error Diffusion

Apply tone error diffusion across tiles for global brightness structure.

**Reference:** `blog/ideas/reference documentation/14_Signal_Processing_Filtering/Posterization.md`

