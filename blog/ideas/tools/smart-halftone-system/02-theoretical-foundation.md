# Smart Halftone System — Theoretical Foundation

## 1. Dyadic Line Families

### Line Coordinate

$$
u = \frac{\mathbf{d} \cdot \mathbf{p}}{P} + \phi
$$

$$
u_p = \text{fract}(u)
$$

### Family Phase

$$
v_\ell = \text{fract}(2^\ell u_p)
$$

### Distance to Line

$$
d_\ell = |v_\ell - 0.5|
$$

### Mask

$$
L_\ell = \mathbf{1}[d_\ell < \alpha_\ell / 2]
$$

### Tone-Dependent Activation

$$
T = \lfloor g \cdot N \rfloor
$$

$$
M = 1 - \prod_{\ell \le T}(1 - L_\ell)
$$

## 2. Gradient and Tangent Fields

### Gradient

$$
\nabla g = \left( \frac{\partial g}{\partial x}, \frac{\partial g}{\partial y} \right)
$$

### Tangent

$$
\mathbf{t} = \frac{(-\nabla g_y, \nabla g_x)}{|\nabla g|}
$$

**Reference:** `blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/Sobel_operator.md`

## 3. Domain Warp

$$
g'(x, y) = g(x + W_x(x,y), y + W_y(x,y))
$$

## 4. Iso-Contour Extraction

$$
c = h \cdot N_c
$$

$$
f = \text{fract}(c)
$$

$$
d = |f - 0.5|
$$

$$
C = \mathbf{1}[d < w/2]
$$

**Reference:** `blog/ideas/reference documentation/03_Raster_Vector_Contour/Marching_squares.md`

## 5. Gray-Scott RD

$$
\frac{\partial u}{\partial t} = D_u \nabla^2 u - uv^2 + f(1-u)
$$

**Reference:** `blog/ideas/reference documentation/08_Reaction_Diffusion_PDE/Gray-Scott_model.md`

