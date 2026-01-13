# Anisotropic diffusion

In image processing and computer vision, anisotropic diffusion, also called Perona–Malik diffusion, is a technique aiming at reducing image noise without removing significant parts of the image content, typically edges, lines or other details that are important for the interpretation of the image. Anisotropic diffusion resembles the process that creates a scale space, where an image generates a parameterized family of successively more and more blurred images based on a diffusion process. Each of the resulting images in this family are given as a convolution between the image and a 2D isotropic Gaussian filter, where the width of the filter increases with the parameter. This diffusion process is a linear and space-invariant transformation of the original image. Anisotropic diffusion is a generalization of this diffusion process: it produces a family of parameterized images, but each resulting image is a combination between the original image and a filter that depends on the local content of the original image. As a consequence, anisotropic diffusion is a non-linear and space-variant transformation of the original image.

In its original formulation, presented by Perona and Malik in 1987, the space-variant filter is in fact isotropic but depends on the image content such that it approximates an impulse function close to edges and other structures that should be preserved in the image over the different levels of the resulting scale space. This formulation was referred to as anisotropic diffusion by Perona and Malik even though the locally adapted filter is isotropic, but it has also been referred to as inhomogeneous and nonlinear diffusion or Perona–Malik diffusion by other authors. A more general formulation allows the locally adapted filter to be truly anisotropic close to linear structures such as edges or lines: it has an orientation given by the structure such that it is elongated along the structure and narrow across. Such methods are referred to as shape-adapted smoothing or coherence enhancing diffusion. As a consequence, the resulting images preserve linear structures while at the same time smoothing is made along these structures. Both these cases can be described by a generalization of the usual diffusion equation where the diffusion coefficient, instead of being a constant scalar, is a function of image position and assumes a matrix (or tensor) value (see structure tensor).

Although the resulting family of images can be described as a combination between the original image and space-variant filters, the locally adapted filter and its combination with the image do not have to be realized in practice. Anisotropic diffusion is normally implemented by means of an approximation of the generalized diffusion equation: each new image in the family is computed by applying this equation to the previous image. Consequently, anisotropic diffusion is an iterative process where a relatively simple set of computations is used to compute each successive image in the family and this process is continued until a sufficient degree of smoothing is obtained.


## Formal definition

Formally, let $\Omega \subset \mathbb {R} ^{2}$ denote a subset of the plane and $I(\cdot ,t):\Omega \rightarrow \mathbb {R}$ be a family of gray scale images. I ( ⋅ , 0 ) {\displaystyle I(\cdot ,0)} is the input image. Then anisotropic diffusion is defined as


$${\frac {\partial I}{\partial t}}=\operatorname {div} \left(c(x,y,t)\nabla I\right)=\nabla c\cdot \nabla I+c(x,y,t)\,\Delta I
$$

where $\Delta$ denotes the Laplacian, $\nabla$ denotes the gradient, $\operatorname {div} (\cdots )$ is the divergence operator and $c(x,y,t)$ is the diffusion coefficient.

For $t>0$, the output image is available as $I(\cdot ,t)$, with larger $t$ producing blurrier images.

$c(x,y,t)$ controls the rate of diffusion and is usually chosen as a function of the image gradient so as to preserve edges in the image. Pietro Perona and Jitendra Malik pioneered the idea of anisotropic diffusion in 1990 and proposed two functions for the diffusion coefficient:


$$c\left(\|\nabla I\|\right)=e^{-\left(\|\nabla I\|/K\right)^{2}}
$$


$$c\left(\|\nabla I\|\right)={\frac {1}{1+\left({\frac {\|\nabla I\|}{K}}\right)^{2}}}
$$

the constant K controls the sensitivity to edges and is usually chosen experimentally or as a function of the noise in the image.


## Motivation

Let $M$ denote the manifold of smooth images, then the diffusion equations presented above can be interpreted as the gradient descent equations for the minimization of the energy functional $E:M\rightarrow \mathbb {R}$ defined by


$$E[I]={\frac {1}{2}}\int _{\Omega }g\left(\|\nabla I(x)\|^{2}\right)\,dx
$$

where $g:\mathbb {R} \rightarrow \mathbb {R}$ is a real-valued function which is intimately related to the diffusion coefficient. Then for any compactly supported infinitely differentiable test function $h$,


$${\begin{aligned}\left.{\frac {d}{dt}}\right|_{t=0}E[I+th]&={\frac {d}{dt}}{\big |}_{t=0}{\frac {1}{2}}\int _{\Omega }g\left(\|\nabla (I+th)(x)\|^{2}\right)\,dx\\[5pt]&=\int _{\Omega }g'\left(\|\nabla I(x)\|^{2}\right)\nabla I\cdot \nabla h\,dx\\[5pt]&=-\int _{\Omega }\operatorname {div} (g'\left(\|\nabla I(x)\|^{2}\right)\nabla I)h\,dx\end{aligned}}
$$

where the last line follows from multidimensional integration by parts. Letting $\nabla E_{I}$ denote the gradient of E with respect to the $L^{2}(\Omega ,\mathbb {R} )$ inner product evaluated at I, this gives


$$\nabla E_{I}=-\operatorname {div} (g'\left(\|\nabla I(x)\|^{2}\right)\nabla I)
$$

Therefore, the gradient descent equations on the functional E are given by


$${\frac {\partial I}{\partial t}}=-\nabla E_{I}=\operatorname {div} (g'\left(\|\nabla I(x)\|^{2}\right)\nabla I)
$$

Thus by letting $c=g'$ the anisotropic diffusion equations are obtained.


## Regularization

The diffusion coefficient, $c(x,y,t)$, as proposed by Perona and Malik can lead to instabilities when $\|\nabla I\|^{2}>K^{2}$. It can be proven that this condition is equivalent to the physical diffusion coefficient (which is different from the mathematical diffusion coefficient defined by Perona and Malik) becoming negative and it leads to backward diffusion that enhances contrasts of image intensity rather than smoothing them. To avoid the problem, regularization is necessary and people have shown that spatial regularizations lead to converged and constant steady-state solution.

To this end one of the modified Perona–Malik models (which is also known as regularization of P-M equation) will be discussed. In this approach, the unknown is convolved with a Gaussian inside the non-linearity to obtain a modified Perona–Malik equation


$${\frac {\partial I}{\partial t}}=\operatorname {div} \left(c(|\nabla (G_{\sigma }*I)|^{2})\nabla I\right)
$$

where
$$G_{\sigma }=C\sigma ^{-1/2}\exp \left(-|x|^{2}/4\sigma \right)
$$.

The well-posedness of the equation can be achieved by this regularization but it also introduces blurring effect, which is the main drawback of regularization. A prior knowledge of noise level is required as the choice of regularization parameter depends on it.


## Applications

Anisotropic diffusion can be used to remove noise from digital images without blurring edges. With a constant diffusion coefficient, the anisotropic diffusion equations reduce to the heat equation which is equivalent to Gaussian blurring. This is ideal for removing noise but also indiscriminately blurs edges too. When the diffusion coefficient is chosen as an edge avoiding function, such as in Perona–Malik, the resulting equations encourage diffusion (hence smoothing) within regions of smoother image intensity and suppress it across strong edges. Hence the edges are preserved while removing noise from the image.

Along the same lines as noise removal, anisotropic diffusion can be used in edge detection algorithms. By running the diffusion with an edge seeking diffusion coefficient for a certain number of iterations, the image can be evolved towards a piecewise constant image with the boundaries between the constant components being detected as edges.


## See also


- Bilateral filter
- Edge detection
- Edge-preserving smoothing
- Heat equation
- Image noise
- Noise reduction
- Scale space
- Total variation denoising
- Bounded variation


## External links


- Mathematica PeronaMalikFilter function.
- IDL nonlinear anisotropic diffusion package(edge enhancing and coherence enhancing):
