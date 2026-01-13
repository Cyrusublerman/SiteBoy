# Line integral convolution

In scientific visualization, line integral convolution (LIC) is a method to visualize a vector field (such as fluid motion) at high spatial resolutions. The LIC technique was first proposed by Brian Cabral and Leith Casey Leedom in 1993.

In LIC, discrete numerical line integration is performed along the field lines (curves) of the vector field on a uniform grid. The integral operation is a convolution of a filter kernel and an input texture, often white noise. In signal processing, this process is known as a discrete convolution.


## Overview

Traditional visualizations of vector fields use small arrows or lines to represent vector direction and magnitude. This method has a low spatial resolution, which limits the density of presentable data and risks obscuring characteristic features in the data. More sophisticated methods, such as streamlines and particle tracing techniques, can be more revealing but are highly dependent on proper seed points. Texture-based methods, like LIC, avoid these problems since they depict the entire vector field at point-like (pixel) resolution.

Compared to other integration-based techniques that compute field lines of the input vector field, LIC has the advantage that all structural features of the vector field are displayed, without the need to adapt the start and end points of field lines to the specific vector field. In other words, it shows the topology of the vector field.

In user testing, LIC was found to be particularly good for identifying critical points.


## Algorithm


### Informal description

LIC causes output values to be strongly correlated along the field lines, but uncorrelated in orthogonal directions. As a result, the field lines contrast each other and stand out visually from the background.

Intuitively, the process can be understood with the following example: the flow of a vector field can be visualized by overlaying a fixed, random pattern of dark and light paint. As the flow passes by the paint, the fluid picks up some of the paint's color, averaging it with the color it has already acquired. The result is a randomly striped, smeared texture where points along the same streamline tend to have a similar color. Other physical examples include:


- whorl patterns of paint, oil, or foam on a river
- visualisation of magnetic field lines using randomly distributed iron filings
- fine sand being blown by strong wind


### Formal mathematical description

Although the input vector field and the result image are discretized, it pays to look at it from a continuous viewpoint. Let $\mathbf {v}$ be the vector field given in some domain $\Omega$. Although the input vector field is typically discretized, we regard the field $\mathbf {v}$ as defined in every point of $\Omega$, i.e. we assume an interpolation. Streamlines, or more generally field lines, are tangent to the vector field in each point. They end either at the boundary of $\Omega$ or at critical points where $\mathbf {v} =\mathbf {0}$. For the sake of simplicity, critical points and boundaries are ignored in the following.

A field line ${\boldsymbol {\sigma }}$, parametrized by arc length $s$, is defined as


$${\frac {d{\boldsymbol {\sigma }}(s)}{ds}}={\frac {\mathbf {v} ({\boldsymbol {\sigma }}(s))}{|\mathbf {v} ({\boldsymbol {\sigma }}(s))|}}.
$$

Let ${\boldsymbol {\sigma }}_{\mathbf {r} }(s)$ be the field line that passes through the point $\mathbf {r}$ for $s=0$. Then the image gray value at $\mathbf {r}$ is set to


$$D(\mathbf {r} )=\int _{-L/2}^{L/2}k(s)N({\boldsymbol {\sigma }}_{\mathbf {r} }(s))ds
$$

where $k(s)$ is the convolution kernel, $N(\mathbf {r} )$ is the noise image, and $L$ is the length of field line segment that is followed.

$D(\mathbf {r} )$ has to be computed for each pixel in the LIC image. If carried out naively, this is quite expensive. First, the field lines have to be computed using a numerical method for solving ordinary differential equations, like a Runge–Kutta method, and then for each pixel the convolution along a field line segment has to be calculated.

The final image will normally be colored in some way. Typically, some scalar field in $\Omega$ (like the vector length) is used to determine the hue, while the grayscale LIC output determines the brightness.

Different choices of convolution kernels and random noise produce different textures; for example, pink noise produces a cloudy pattern where areas of higher flow stand out as smearing, suitable for weather visualization. Further refinements in the convolution can improve the quality of the image.


### Programming description

Algorithmically, LIC takes a vector field and noise texture as input, and outputs a texture. The process starts by generating in the domain of the vector field a random gray level image at the desired output resolution. Then, for every pixel in this image, the forward and backward streamline of a fixed arc length is calculated. The value assigned to the current pixel is computed by a convolution of a suitable convolution kernel with the gray levels of all the noise pixels lying on a segment of this streamline. This creates a gray level LIC image.


## Versions


### Basic

Basic LIC images are grayscale images, without color and animation. While such LIC images convey the direction of the field vectors, they do not indicate orientation; for stationary fields, this can be remedied by animation. Basic LIC images do not show the length of the vectors (or the strength of the field).


### Color

The length of the vectors (or the strength of the field) is usually coded in color; alternatively, animation can be used.


### Animation

LIC images can be animated by using a kernel that changes over time. Samples at a constant time from the streamline would still be used, but instead of averaging all pixels in a streamline with a static kernel, a ripple-like kernel constructed from a periodic function multiplied by a Hann function acting as a window (in order to prevent artifacts) is used. The periodic function is then shifted along the period to create an animation.


### Fast LIC (FLIC)

The computation can be significantly accelerated by re-using parts of already computed field lines, specializing to a box function as convolution kernel $k(s)$ and avoiding redundant computations during convolution. The resulting fast LIC method can be generalized to convolution kernels that are arbitrary polynomials.


### Oriented Line Integral Convolution (OLIC)

Because LIC does not encode flow orientation, it cannot distinguish between streamlines of equal direction but opposite orientation. Oriented Line Integral Convolution (OLIC) solves this issue by using a ramp-like asymmetric kernel and a low-density noise texture. The kernel asymmetrically modulates the intensity along the streamline, producing a trace that encodes orientation; the low-density of the noise texture prevents smeared traces from overlapping, aiding readability.

Fast Rendering of Oriented Line Integral Convolution (FROLIC) is a variation that approximates OLIC by rendering each trace in discrete steps instead of as a continuous smear.


### Unsteady Flow LIC (UFLIC)

For time-dependent vector fields (unsteady flow), a variant called Unsteady Flow LIC has been designed that maintains the coherence of the flow animation. An interactive GPU-based implementation of UFLIC has been presented.


### Parallel

Since the computation of an LIC image is expensive but inherently parallel, the process has been parallelized and, with availability of GPU-based implementations, interactive on PCs.


### Multidimensional

Note that the domain $\Omega$ does not have to be a 2D domain: the method is applicable to higher dimensional domains using multidimensional noise fields. However, the visualization of the higher-dimensional LIC texture is problematic; one way is to use interactive exploration with 2D slices that are manually positioned and rotated. The domain $\Omega$ does not have to be flat either; the LIC texture can be computed also for arbitrarily shaped 2D surfaces in 3D space.


## Applications

This technique has been applied to a wide range of problems since it first was published in 1993, both scientific and creative, including:

Representing vector fields:


- visualization of steady (time-independent) flows (streamlines)
- visual exploration of 2D autonomous dynamical systems
- wind mapping
- water flow mapping

Artistic effects for image generation and stylization:


- pencil drawing (automatic pencil drawing generation technique using LIC pencil filter)
- automatic generation of hair textures
- creating marbling texture

Terrain generalization:


- creating generalized shaded relief


## Implementations


- GPU Based Image Processing Tools by Raymond McGuire
- ParaView : Line Integral Convolution
- A 2D flow visualization tool based on LIC and RK4. Developed using C++ and VTK. by Andres Bejarano
- Wolfram Research (2008), LineIntegralConvolutionPlot, Wolfram Language function, https://reference.wolfram.com/language/ref/LineIntegralConvolutionPlot.html (updated 2014).


## See also


- Weighted arithmetic mean
