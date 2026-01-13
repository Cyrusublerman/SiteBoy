# Roberts cross

The Roberts cross operator is used in image processing and computer vision for edge detection. It was one of the first edge detectors and was initially proposed by Lawrence Roberts in 1963. As a differential operator, the idea behind the Roberts cross operator is to approximate the gradient of an image through discrete differentiation which is achieved by computing the sum of the squares of the differences between diagonally adjacent pixels.


## Motivation

According to Roberts, an edge detector should have the following properties: the produced edges should be well-defined, the background should contribute as little noise as possible, and the intensity of edges should correspond as close as possible to what a human would perceive. With these criteria in mind and based on then prevailing psychophysical theory Roberts proposed the following equations:

$y_{i,j}={\sqrt {x_{i,j}}}$


$$z_{i,j}={\sqrt {(y_{i,j}-y_{i+1,j+1})^{2}+(y_{i+1,j}-y_{i,j+1})^{2}}}
$$

where x is the initial intensity value in the image, z is the computed derivative and i,j represent the location in the image.

The results of this operation will highlight changes in intensity in a diagonal direction. One of the most appealing aspects of this operation is its simplicity; the kernel is small and contains only integers. However with the speed of computers today this advantage is negligible and the Roberts cross suffers greatly from sensitivity to noise.


## Formulation

In order to perform edge detection with the Roberts operator we first convolve the original image, with the following two kernels:


$${\begin{bmatrix}+1&0\\0&-1\\\end{bmatrix}}\quad {\mbox{and}}\quad {\begin{bmatrix}0&+1\\-1&0\\\end{bmatrix}}.
$$

Let $I(x,y)$ be a point in the original image and $G_{x}(x,y)$ be a point in an image formed by convolving with the first kernel and $G_{y}(x,y)$ be a point in an image formed by convolving with the second kernel. The gradient can then be defined as:


$$\nabla I(x,y)=G(x,y)={\begin{bmatrix}G_{x}\\G_{y}\end{bmatrix}},\;\left\|\nabla I(x,y)\right\|={\sqrt {G_{x}^{2}+G_{y}^{2}}}.
$$

The direction of the gradient can also be defined as follows:


$$\Theta (x,y)=\arctan {\left({\frac {G_{y}(x,y)}{G_{x}(x,y)}}\right)}-{\frac {3\pi }{4}}.
$$

Note that angle of 0° corresponds to a vertical orientation such that the direction of maximum contrast from black to white runs from left to right on the image.


## Example comparisons

Here, four different gradient operators are used to estimate the magnitude of the gradient of the test image.


## See also


- Digital image processing
- Feature detection (computer vision)
- Feature extraction
- Sobel operator
- Prewitt operator
