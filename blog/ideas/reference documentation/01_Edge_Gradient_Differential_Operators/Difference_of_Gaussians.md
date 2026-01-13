# Difference of Gaussians

In imaging science, difference of Gaussians (DoG) is a feature enhancement algorithm that involves the subtraction of one Gaussian blurred version of an original image from another, less blurred version of the original. In the simple case of grayscale images, the blurred images are obtained by convolving the original grayscale images with Gaussian kernels having differing width (standard deviations). Blurring an image using a Gaussian kernel suppresses only high-frequency spatial information. Subtracting one image from the other preserves spatial information that lies between the range of frequencies that are preserved in the two blurred images. Thus, the DoG is a spatial band-pass filter that attenuates frequencies in the original grayscale image that are far from the band center.


## Formulation

Let $\Phi _{t}:\mathbb {R} ^{n}\rightarrow \mathbb {R}$ denote the radial Gaussian function $\Phi _{t}(x)={\mathcal {N}}(x|0,t)$ with mean $0$ and variance $t$, i.e., the multivariate Gaussian function $\Phi _{t}(x)={\mathcal {N}}(x|0,tI)$ with mean $0$ and covariance $tI$. More explicitly, we have


$$\Phi _{t}(x)={\frac {1}{(2\pi {}t)^{n/2}}}e^{-{\frac {\|x\|^{2}}{2t}}}.
$$

The difference of Gaussians with variances $t_{1}<t_{2}$ is the kernel function

$K_{t_{1},t_{2}}=\Phi _{t_{1}}-\Phi _{t_{2}}$

obtained by subtracting the higher-variance Gaussian from the lower-variance Gaussian. The difference of Gaussian operator is the convolutional operator associated with this kernel function. So given an n-dimensional grayscale image $I:\mathbb {R} ^{n}\rightarrow \mathbb {R}$, the difference of Gaussians of the image $I$ is the n-dimensional image


$$I*K_{t_{1},t_{2}}=I*(\Phi _{t_{1}}-\Phi _{t_{2}})=I*\Phi _{t_{1}}-I*\Phi _{t_{2}}.
$$

Because convolution is bilinear, convolving against the difference of Gaussians is equivalent to applying two different Gaussian blurs and then taking the difference. In practice, this is faster because Gaussian blur is a separable filter.


### Approximation

The difference of Gaussians can be thought of as an approximation of the Mexican hat kernel function used for the Laplacian of the Gaussian operator. The key observation is that the family of Gaussians $\Phi _{t}$ is the fundamental solution of the heat equation


$$\partial _{t}\Phi _{t}(x)={\frac {1}{2}}\Delta \Phi _{t}(x).
$$

The left-hand side can be approximated by the difference quotient


$${\frac {\Phi _{t+\delta {t}}(x)-\Phi _{t}(x)}{\delta {t}}}={\frac {1}{\delta {t}}}K_{t+\delta {t},t}(x).
$$

Meanwhile, the right-hand side is precisely the Laplacian of the Gaussian function. Note that the Laplacian of the Gaussian can be used as a filter to produce a Gaussian blur of the Laplacian of the image because $I*\Delta \Phi _{t}=\Delta {I}*\Phi _{t}$ by standard properties of convolution. The relationship between the difference of Gaussians operator and the Laplacian of the Gaussian operator is explained further in Appendix A in Lindeberg (2015).


## Details and applications

As a feature enhancement algorithm, the difference of Gaussians can be utilized to increase the visibility of edges and other detail present in a digital image. A wide variety of alternative edge sharpening filters operate by enhancing high frequency detail, but because random noise also has a high spatial frequency, many of these sharpening filters tend to enhance noise, which can be an undesirable artifact. The difference of Gaussians algorithm removes high frequency detail that often includes random noise, rendering this approach one of the most suitable for processing images with a high degree of noise. A major drawback to application of the algorithm is an inherent reduction in overall image contrast produced by the operation.

When utilized for image enhancement, the difference of Gaussians algorithm is typically applied when the size ratio of kernel (2) to kernel (1) is 4:1 or 5:1. In the example images, the sizes of the Gaussian kernels employed to smooth the sample image were 10 pixels and 5 pixels.

The algorithm can also be used to obtain an approximation of the Laplacian of Gaussian when the ratio of size 2 to size 1 is roughly equal to 1.6. The Laplacian of Gaussian is useful for detecting edges that appear at various image scales or degrees of image focus. The exact values of sizes of the two kernels that are used to approximate the Laplacian of Gaussian will determine the scale of the difference image, which may appear blurry as a result.

Differences of Gaussians have also been used for blob detection in the scale-invariant feature transform (SIFT). In fact, the DoG as the difference of two Multivariate normal distribution has always a total null sum and convolving it with a uniform signal generates no response. It approximates well a second derivate of Gaussian (Laplacian of Gaussian) with K~1.6 and the receptive fields of ganglion cells in the retina with K~5. It may easily be used in recursive schemes and is used as an operator in real-time algorithms for blob detection and automatic scale selection.


## More information

In its operation, the difference of Gaussians algorithm is believed to mimic how neural processing in the retina of the eye extracts details from images destined for transmission to the brain.


## See also


- Marr–Hildreth algorithm
- Treatment of the difference of Gaussians approach in blob detection.
- Blob detection
- Gaussian pyramid
- Scale space


## Further reading


- Notes by Melisa Durmuş on Edge Detection and Gaussian related mathematics from the University of Edinburgh.
