# Bilateral filter

A bilateral filter is a non-linear, edge-preserving, and noise-reducing smoothing filter for images. It replaces the intensity of each pixel with a weighted average of intensity values from nearby pixels. This weight can be based on a Gaussian distribution. Crucially, the weights depend not only on Euclidean distance of pixels, but also on the radiometric differences (e.g., variations in color intensity or depth). This dual dependency preserves sharp edges while suppressing noise.


## Definition

The bilateral filter is defined as


$$I^{\text{filtered}}(x)={\frac {1}{W_{p}}}\sum _{x_{i}\in \Omega }I(x_{i})f_{r}(\|I(x_{i})-I(x)\|)g_{s}(\|x_{i}-x\|),
$$

and normalization term, ${W_{p}}$, is defined as


$$W_{p}=\sum _{x_{i}\in \Omega }{f_{r}(\|I(x_{i})-I(x)\|)g_{s}(\|x_{i}-x\|)}
$$

$I^{\text{filtered}}$ is the filtered image;

$I$ is the original input image to be filtered;

$x$ are the coordinates of the current pixel to be filtered;

$\Omega$ is the window centered in $x$, so $x_{i}\in \Omega$ is another pixel;

$f_{r}$ is the range kernel for smoothing differences in intensities (this function can be a Gaussian function);

$g_{s}$ is the spatial (or domain) kernel for smoothing differences in coordinates (this function can be a Gaussian function).

The weight $W_{p}$ is assigned using the spatial closeness (using the spatial kernel $g_{s}$) and the intensity difference (using the range kernel $f_{r}$). Consider a pixel located at $(i,j)$ that needs to be denoised in image using its neighbouring pixels and one of its neighbouring pixels is located at $(k,l)$. Then, assuming the range and spatial kernels to be Gaussian kernels, the weight assigned for pixel $(k,l)$ to denoise the pixel $(i,j)$ is given by


$$w(i,j,k,l)=\exp \left(-{\frac {(i-k)^{2}+(j-l)^{2}}{2\sigma _{d}^{2}}}-{\frac {\|I(i,j)-I(k,l)\|^{2}}{2\sigma _{r}^{2}}}\right),
$$

where σd and σr are smoothing parameters, and I(i, j) and I(k, l) are the intensity of pixels $(i,j)$ and $(k,l)$ respectively.

After calculating the weights, normalize them:


$$I_{D}(i,j)={\frac {\sum _{k,l}I(k,l)w(i,j,k,l)}{\sum _{k,l}w(i,j,k,l)}},
$$

where $I_{D}$ is the denoised intensity of pixel $(i,j)$.


## Parameters


- As the range parameter σr increases, the bilateral filter gradually approaches Gaussian convolution more closely because the range Gaussian widens and flattens, which means that it becomes nearly constant over the intensity interval of the image.
- As the spatial parameter σd increases, the larger features get smoothened.


## Limitations

The bilateral filter in its direct form can introduce several types of image artifacts:


- Staircase effect – intensity plateaus that lead to images appearing like cartoons
- Gradient reversal – introduction of false edges in the image.

There exist several extensions to the filter that deal with these artifacts, like the scaled bilateral filter that uses downscaled image for computing the weights. Alternative filters, like the guided filter, have also been proposed as an efficient alternative without these limitations.


## Implementations

Adobe Photoshop implements a bilateral filter in its surface blur tool.

GIMP implements a bilateral filter in its Filters → Blur tools; and it is called Selective Gaussian Blur. The free G'MIC plugin Repair → Smooth [bilateral] for GIMP adds more control. A simple trick to efficiently implement a bilateral filter is to exploit Poisson-disk subsampling.

OpenCV implements the function: bilateralFilter( source, destination, Ω {\displaystyle \Omega } , f r {\displaystyle f_{r}} , g s {\displaystyle g_{s}} ).


## Related models

The bilateral filter has been shown to be an application of the short time kernel of the Beltrami flow that was introduced as an edge preserving selective smoothing mechanism before the bilateral filter.

Other edge-preserving smoothing filters include: anisotropic diffusion, weighted least squares, edge-avoiding wavelets, geodesic editing, guided filtering, and domain transforms.


## See also


- Gaussian filter
- Gaussian function
- Gaussian blur
- Convolution
