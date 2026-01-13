# Sobel operator

The Sobel operator, sometimes called the Sobel–Feldman operator or Sobel filter, is used in image processing and computer vision, particularly within edge detection algorithms where it creates an image emphasising edges. It is named after Irwin Sobel and Gary M. Feldman, colleagues at the Stanford Artificial Intelligence Laboratory (SAIL). Sobel and Feldman presented the idea of an "Isotropic 3 × 3 Image Gradient Operator" at a talk at SAIL in 1968. Technically, it is a discrete differentiation operator, computing an approximation of the gradient of the image intensity function. At each point in the image, the result of the Sobel–Feldman operator is either the corresponding gradient vector or the norm of this vector. The Sobel–Feldman operator is based on convolving the image with a small, separable, and integer-valued filter in the horizontal and vertical directions and is therefore relatively inexpensive in terms of computations. On the other hand, the gradient approximation that it produces is relatively crude, in particular for high-frequency variations in the image.


## Formulation

The operator uses two 3×3 kernels which are convolved with the original image to calculate approximations of the derivatives – one for horizontal changes, and one for vertical. If we define A as the source image, and Gx and Gy are two images which at each point contain the horizontal and vertical derivative approximations respectively, the computations are as follows:


$${\begin{aligned}\mathbf {G} _{x}&={\begin{bmatrix}-1&0&+1\\-2&0&+2\\-1&0&+1\end{bmatrix}}*\mathbf {A} \\\mathbf {G} _{y}&={\begin{bmatrix}-1&-2&-1\\0&0&0\\+1&+2&+1\end{bmatrix}}*\mathbf {A} \end{aligned}}
$$

where $*$ here denotes the 2-dimensional signal processing convolution operation.

In his text describing the origin of the operator, Sobel shows different signs for these kernels. He defined the operators as neighborhood masks (i.e. correlation kernels), and therefore are mirrored from what described here as convolution kernels. He also assumed the vertical axis increasing upwards instead of downwards as is common in image processing nowadays, and hence the vertical kernel is flipped.

Since the Sobel kernels can be decomposed as the products of an averaging and a differentiation kernel, they compute the gradient with smoothing. For example, $\mathbf {G} _{x}$ and $\mathbf {G} _{y}$ can be written as


$${\begin{aligned}\mathbf {G} _{x}&={\begin{bmatrix}1\\2\\1\end{bmatrix}}*\left({\begin{bmatrix}1&0&-1\end{bmatrix}}*\mathbf {A} \right)\\\mathbf {G} _{y}&={\begin{bmatrix}+1\\0\\-1\end{bmatrix}}*\left({\begin{bmatrix}1&2&1\end{bmatrix}}*\mathbf {A} \right)\end{aligned}}
$$

The x-coordinate is defined here as increasing in the "right"-direction, and the y-coordinate is defined as increasing in the "down"-direction. At each point in the image, the resulting gradient approximations can be combined to give the gradient magnitude, using Pythagorean addition:


$$\mathbf {G} ={\sqrt {{\mathbf {G} _{x}}^{2}+{\mathbf {G} _{y}}^{2}}}
$$

Using this information, we can also calculate the gradient's direction:


$$\mathbf {\Theta } =\operatorname {atan2} (\mathbf {G} _{y},\mathbf {G} _{x})
$$

where, for example, $\mathbf {\Theta }$ is 0 for a vertical edge which is lighter on the right side (for $\operatorname {atan2}$ see atan2).


## More formally

Since the intensity function of a digital image is only known at discrete points, derivatives of this function cannot be defined unless we assume that there is an underlying differentiable intensity function that has been sampled at the image points. With some additional assumptions, the derivative of the continuous intensity function can be computed as a function on the sampled intensity function, i.e. the digital image. It turns out that the derivatives at any particular point are functions of the intensity values at virtually all image points. However, approximations of these derivative functions can be defined at lesser or larger degrees of accuracy.

The Sobel–Feldman operator represents a rather inaccurate approximation of the image gradient, but is still of sufficient quality to be of practical use in many applications. More precisely, it uses intensity values only in a 3×3 region around each image point to approximate the corresponding image gradient, and it uses only integer values for the coefficients which weight the image intensities to produce the gradient approximation.


## Extension to other dimensions

The Sobel–Feldman operator consists of two separable operations:


- Smoothing perpendicular to the derivative direction with a triangle filter: $h(-1)=1,h(0)=2,h(1)=1$
- Simple central difference in the derivative direction: $h'(-1)=1,h'(0)=0,h'(1)=-1$

Sobel–Feldman filters for image derivatives in different dimensions with $x,y,z,t\in \left\{0,-1,1\right\}$ :

1D: $h_{x}'(x)=h'(x);$

2D: $h_{x}'(x,y)=h'(x)h(y)$

2D: $h_{y}'(x,y)=h(x)h'(y)$

3D: $h_{y}'(x,y,z)=h(x)h'(y)h(z)$

3D: $h_{z}'(x,y,z)=h(x)h(y)h'(z)$

4D: $h_{x}'(x,y,z,t)=h'(x)h(y)h(z)h(t)$

Thus as an example the 3D Sobel–Feldman kernel in z-direction:


$$h_{z}'(:,:,-1)={\begin{bmatrix}+1&+2&+1\\+2&+4&+2\\+1&+2&+1\end{bmatrix}}\quad h_{z}'(:,:,0)={\begin{bmatrix}0&0&0\\0&0&0\\0&0&0\end{bmatrix}}\quad h_{z}'(:,:,1)={\begin{bmatrix}-1&-2&-1\\-2&-4&-2\\-1&-2&-1\end{bmatrix}}
$$


## Technical details

As a consequence of its definition, the Sobel operator can be implemented by simple means in both hardware and software: only eight image points around a point are needed to compute the corresponding result and only integer arithmetic is needed to compute the gradient vector approximation. Furthermore, the two discrete filters described above are both separable:


$${\begin{bmatrix}1&0&-1\\2&0&-2\\1&0&-1\end{bmatrix}}={\begin{bmatrix}1\\2\\1\end{bmatrix}}{\begin{bmatrix}1&0&-1\end{bmatrix}}={\begin{bmatrix}1\\1\end{bmatrix}}*{\begin{bmatrix}1\\1\end{bmatrix}}{\begin{bmatrix}1&-1\end{bmatrix}}*{\begin{bmatrix}1&1\end{bmatrix}}
$$


$${\begin{bmatrix}\ \ 1&\ \ 2&\ \ 1\\\ \ 0&\ \ 0&\ \ 0\\-1&-2&-1\end{bmatrix}}={\begin{bmatrix}\ \ 1\\\ \ 0\\-1\end{bmatrix}}{\begin{bmatrix}1&2&1\end{bmatrix}}={\begin{bmatrix}1\\1\end{bmatrix}}*{\begin{bmatrix}\ \ 1\\-1\end{bmatrix}}{\begin{bmatrix}1&1\end{bmatrix}}*{\begin{bmatrix}1&1\end{bmatrix}}
$$

and the two derivatives Gx and Gy can therefore be computed as


$$\mathbf {G} _{x}={\begin{bmatrix}1\\2\\1\end{bmatrix}}*\left({\begin{bmatrix}1&0&-1\end{bmatrix}}*\mathbf {A} \right)\quad {\mbox{and}}\quad \mathbf {G} _{y}={\begin{bmatrix}\ \ 1\\\ \ 0\\-1\end{bmatrix}}*\left({\begin{bmatrix}1&2&1\end{bmatrix}}*\mathbf {A} \right)
$$

In certain implementations, this separable computation may be advantageous since it implies fewer arithmetic computations for each image point.

Applying convolution K to pixel group P can be represented in pseudocode as:


$$N(x,y)=\sum _{i=-1}^{1}\sum _{j=-1}^{1}K(i,j)\,P(x-i,y-j)
$$

where $N(x,y)$ represents the new pixel matrix resulted after applying the convolution K to P; P being the original pixel matrix.


## Example

The result of the Sobel–Feldman operator is a 2-dimensional map of the gradient at each point. It can be processed and viewed as though it is itself an image, with the areas of high gradient (the likely edges) visible as white lines. The following images illustrate this, by showing the computation of the Sobel–Feldman operator on a simple image.

The images below illustrate the change in the direction of the gradient on a grayscale circle. When the sign of $\mathbf {G_{x}}$ and $\mathbf {G_{y}}$ are the same the gradient's angle is positive, and negative when different. In the example below the red and yellow colors on the edge of the circle indicate positive angles, and the blue and cyan colors indicate negative angles. The vertical edges on the left and right sides of the circle have an angle of 0 because there is no local change in $\mathbf {G_{y}}$. The horizontal edges at the top and bottom sides of the circle have angles of −.mw-parser-output .sfrac{white-space:nowrap}.mw-parser-output .sfrac.tion,.mw-parser-output .sfrac .tion{display:inline-block;vertical-align:-0.5em;font-size:85%;text-align:center}.mw-parser-output .sfrac .num{display:block;line-height:1em;margin:0.0em 0.1em;border-bottom:1px solid}.mw-parser-output .sfrac .den{display:block;line-height:1em;margin:0.1em 0.1em}.mw-parser-output .sr-only{border:0;clip:rect(0,0,0,0);clip-path:polygon(0px 0px,0px 0px,0px 0px);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}⁠π/2⁠ and ⁠π/2⁠ respectively because there is no local change in $\mathbf {G_{x}}$. The negative angle for top edge signifies the transition is from a bright to dark region, and the positive angle for the bottom edge signifies a transition from a dark to bright region. All other pixels are marked as black due to no local change in either $\mathbf {G_{x}}$ or $\mathbf {G_{y}}$, and thus the angle is not defined. Since the angle is a function of the ratio of $\mathbf {G_{y}}$ to $\mathbf {G_{x}}$ pixels with small rates of change can still have a large angle response. As a result noise can have a large angle response which is typically undesired. When using gradient angle information for image processing applications effort should be made to remove image noise to reduce this false response.


## Alternative operators

The Sobel–Feldman operator, while reducing artifacts associated with a pure central differences operator, does not exhibit a good rotational symmetry (about 1° of error). Scharr looked into optimizing this property by producing kernels optimized for specific given numeric precision (integer, float…) and dimensionalities (1D, 2D, 3D). Optimized 3D filter kernels up to a size of 5 x 5 x 5 have been presented there, but the most frequently used, with an error of about 0.2° is:


$$h_{x}'(:,:)={\begin{bmatrix}+3&0&-3\\+10&0&-10\\+3&0&-3\end{bmatrix}}\ \ \ \ \ \ \ \ \ h_{y}'(:,:)={\begin{bmatrix}+3&+10&+3\\0&0&0\\-3&-10&-3\end{bmatrix}}
$$

This factors similarly:


- 
$${\begin{bmatrix}3&10&3\end{bmatrix}}={\begin{bmatrix}3&1\end{bmatrix}}*{\begin{bmatrix}1&3\end{bmatrix}}
$$

Scharr operators result from an optimization minimizing weighted mean squared angular error in the Fourier domain. This optimization is done under the condition that resulting filters are numerically consistent. Therefore they really are derivative kernels rather than merely keeping symmetry constraints. The optimal 8 bit integer valued 3x3 filter stemming from Scharr's theory is


$$h_{x}'(:,:)={\begin{bmatrix}47&0&-47\\162&0&-162\\47&0&-47\end{bmatrix}}\ \ \ \ \ \ \ \ \ h_{y}'(:,:)={\begin{bmatrix}47&162&47\\0&0&0\\-47&-162&-47\end{bmatrix}}
$$

A similar optimization strategy and resulting filters were also presented by Farid and Simoncelli. They also investigate higher-order derivative schemes. In contrast to the work of Scharr, these filters are not enforced to be numerically consistent.

The problem of derivative filter design has been revisited e.g. by Kroon.

Derivative filters based on arbitrary cubic splines were presented by Hast. He showed how first and second order derivatives can be computed correctly using cubic or trigonometric splines by a double filtering approach giving filters of length 7.

Another similar operator that was originally generated from the Sobel operator is the Kayyali operator, a perfect rotational symmetry based convolution filter 3x3.

Orientation-optimal derivative kernels drastically reduce systematic estimation errors in optical flow estimation. Larger schemes with even higher accuracy and optimized filter families for extended optical flow estimation have been presented in subsequent work by Scharr. Second order derivative filter sets have been investigated for transparent motion estimation. It has been observed that the larger the resulting kernels are, the better they approximate derivative-of-Gaussian filters.


## Example comparisons

Here, four different gradient operators are used to estimate the magnitude of the gradient of the test image.


## See also


- Digital image processing
- Feature detection (computer vision)
- Feature extraction
- Discrete Laplace operator
- Prewitt operator


## External links


- Sobel edge detection in OpenCV
- Sobel Filter, in the SciPy Python Library
- Bibliographic citations for Irwin Sobel in DBLP
- Sobel edge detection example using computer algorithms
- Sobel edge detection for image processing
