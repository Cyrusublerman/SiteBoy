# Structure tensor

In mathematics, the structure tensor, also referred to as the second-moment matrix, is a matrix derived from the gradient of a function. It describes the distribution of the gradient in a specified neighborhood around a point and makes the information invariant to the observing coordinates Example: if you have a 2D image with two components storing the gradient direction and a Gaussian blur is performed separately on each component, the result will be ill&#x2D;formed (specially for the directions were vector orientations flip). On the other hand if the blur is performed component&#x2D;wise on a 2x2 structure tensor the main eigenvector (scaled by its eigenvalue) will properly represent the gradient. . The structure tensor is often used in image processing and computer vision.


## The 2D structure tensor


### Continuous version

For a function $I$ of two variables p = (x, y), the structure tensor is the 2×2 matrix


$$S_{w}(p)={\begin{bmatrix}\int w(r)(I_{x}(p-r))^{2}\,dr&\int w(r)I_{x}(p-r)I_{y}(p-r)\,dr\\[10pt]\int w(r)I_{x}(p-r)I_{y}(p-r)\,dr&\int w(r)(I_{y}(p-r))^{2}\,dr\end{bmatrix}}
$$where $I_{x}$ and $I_{y}$ are the partial derivatives of $I$ with respect to x and y; the integrals range over the plane $\mathbb {R} ^{2}$; and w is some fixed "window function" (such as a Gaussian blur), a distribution on two variables. Note that the matrix $S_{w}$ is itself a function of p = (x, y).

The formula above can be written also as ${\textstyle S_{w}(p)=\int w(r)S_{0}(p-r)\,dr}$, where $S_{0}$ is the matrix-valued function defined by
$$S_{0}(p)={\begin{bmatrix}(I_{x}(p))^{2}&I_{x}(p)I_{y}(p)\\[10pt]I_{x}(p)I_{y}(p)&(I_{y}(p))^{2}\end{bmatrix}}
$$

If the gradient $\nabla I=(I_{x},I_{y})^{\text{T}}$ of $I$ is viewed as a 2×1 (single-column) matrix, where $(\cdot )^{\text{T}}$ denotes transpose operation, turning a row vector to a column vector, the matrix $S_{0}$ can be written as the matrix product $(\nabla I)(\nabla I)^{\text{T}}$ or tensor or outer product $\nabla I\otimes \nabla I$. Note however that the structure tensor $S_{w}(p)$ cannot be factored in this way in general except if $w$ is a Dirac delta function.


### Discrete version

In image processing and other similar applications, the function $I$ is usually given as a discrete array of samples $I[p]$, where p is a pair of integer indices. The 2D structure tensor at a given pixel is usually taken to be the discrete sum


$$S_{w}[p]={\begin{bmatrix}\sum _{r}w[r](I_{x}[p-r])^{2}&\sum _{r}w[r]I_{x}[p-r]I_{y}[p-r]\\[10pt]\sum _{r}w[r]I_{x}[p-r]I_{y}[p-r]&\sum _{r}w[r](I_{y}[p-r])^{2}\end{bmatrix}}
$$

Here the summation index r ranges over a finite set of index pairs (the "window", typically $\{-m\ldots +m\}\times \{-m\ldots +m\}$ for some m), and w[r] is a fixed "window weight" that depends on r, such that the sum of all weights is 1. The values $I_{x}[p],I_{y}[p]$ are the partial derivatives sampled at pixel p; which, for instance, may be estimated from by $I$ by finite difference formulas.

The formula of the structure tensor can be written also as
$${\textstyle S_{w}[p]=\sum _{r}w[r]S_{0}[p-r]}
$$, where $S_{0}$ is the matrix-valued array such that
$$S_{0}[p]={\begin{bmatrix}(I_{x}[p])^{2}&I_{x}[p]I_{y}[p]\\[10pt]I_{x}[p]I_{y}[p]&(I_{y}[p])^{2}\end{bmatrix}}
$$


### Interpretation

The importance of the 2D structure tensor $S_{w}$ stems from the fact eigenvalues $\lambda _{1},\lambda _{2}$ (which can be ordered so that $\lambda _{1}\geq \lambda _{2}\geq 0$) and the corresponding eigenvectors $e_{1},e_{2}$ summarize the distribution of the gradient $\nabla I=(I_{x},I_{y})$ of $I$ within the window defined by $w$ centered at $p$.

Namely, if $\lambda _{1}>\lambda _{2}$, then $e_{1}$ (or $-e_{1}$) is the direction that is maximally aligned with the gradient within the window.

In particular, if $\lambda _{1}>0,\lambda _{2}=0$ then the gradient is always a multiple of $e_{1}$ (positive, negative or zero); this is the case if and only if $I$ within the window varies along the direction $e_{1}$ but is constant along $e_{2}$. This condition of eigenvalues is also called linear symmetry condition because then the iso-curves of $I$ consist in parallel lines, i.e there exists a one dimensional function $g$ which can generate the two dimensional function $I$ as $I(x,y)=g(d^{\text{T}}p)$ for some constant vector $d=(d_{x},d_{y})^{T}$ and the coordinates $p=(x,y)^{T}$.

If $\lambda _{1}=\lambda _{2}$, on the other hand, the gradient in the window has no predominant direction; which happens, for instance, when the image has rotational symmetry within that window. This condition of eigenvalues is also called balanced body, or directional equilibrium condition because it holds when all gradient directions in the window are equally frequent/probable.

Furthermore, the condition $\lambda _{1}=\lambda _{2}=0$ happens if and only if the function $I$ is constant ($\nabla I=(0,0)$) within $W$.

More generally, the value of $\lambda _{k}$, for k=1 or k=2, is the $w$-weighted average, in the neighborhood of p, of the square of the directional derivative of $I$ along $e_{k}$. The relative discrepancy between the two eigenvalues of $S_{w}$ is an indicator of the degree of anisotropy of the gradient in the window, namely how strongly is it biased towards a particular direction (and its opposite). This attribute can be quantified by the coherence, defined as


$$c_{w}=\left({\frac {\lambda _{1}-\lambda _{2}}{\lambda _{1}+\lambda _{2}}}\right)^{2}
$$

if $\lambda _{2}>0$. This quantity is 1 when the gradient is totally aligned, and 0 when it has no preferred direction. The formula is undefined, even in the limit, when the image is constant in the window ($\lambda _{1}=\lambda _{2}=0$). Some authors define it as 0 in that case.

Note that the average of the gradient $\nabla I$ inside the window is not a good indicator of anisotropy. Aligned but oppositely oriented gradient vectors would cancel out in this average, whereas in the structure tensor they are properly added together. This is a reason for why $(\nabla I)(\nabla I)^{\text{T}}$ is used in the averaging of the structure tensor to optimize the direction instead of $\nabla I$.

By expanding the effective radius of the window function $w$ (that is, increasing its variance), one can make the structure tensor more robust in the face of noise, at the cost of diminished spatial resolution. The formal basis for this property is described in more detail below, where it is shown that a multi-scale formulation of the structure tensor, referred to as the multi-scale structure tensor, constitutes a true multi-scale representation of directional data under variations of the spatial extent of the window function.


### Complex version

The interpretation and implementation of the 2D structure tensor becomes particularly accessible using complex numbers. The structure tensor consists in 3 real numbers


$$S_{w}(p)={\begin{bmatrix}\mu _{20}&\mu _{11}\\[10pt]\mu _{11}&\mu _{02}\end{bmatrix}}
$$

where
$${\textstyle \mu _{20}=\int (w(r)(I_{x}(p-r))^{2}\,dr}
$$,
$${\textstyle \mu _{02}=\int (w(r)(I_{y}(p-r))^{2}\,dr}
$$and
$${\textstyle \mu _{11}=\int w(r)I_{x}(p-r)I_{y}(p-r)\,dr}
$$in which integrals can be replaced by summations for discrete representation. Using Parseval's identity it is clear that the three real numbers are the second order moments of the power spectrum of $I$. The following second order complex moment of the power spectrum of $I$ can then be written as


$$\kappa _{20}=\mu _{20}-\mu _{02}+i2\mu _{11}=\int w(r)(I_{x}(p-r)+iI_{y}(p-r))^{2}\,dr=(\lambda _{1}-\lambda _{2})\exp(i2\phi )
$$

where $i={\sqrt {-1}}$ and $\phi$ is the direction angle of the most significant eigenvector of the structure tensor $\phi =\angle {e_{1}}$ whereas $\lambda _{1}$ and $\lambda _{2}$ are the most and the least significant eigenvalues. From, this it follows that $\kappa _{20}$ contains both a certainty $|\kappa _{20}|=\lambda _{1}-\lambda _{2}$ and the optimal direction in double angle representation since it is a complex number consisting of two real numbers. It follows also that if the gradient is represented as a complex number, and is remapped by squaring (i.e. the argument angles of the complex gradient is doubled), then averaging acts as an optimizer in the mapped domain, since it directly delivers both the optimal direction (in double angle representation) and the associated certainty. The complex number represents thus how much linear structure (linear symmetry) there is in image $I$, and the complex number is obtained directly by averaging the gradient in its (complex) double angle representation without computing the eigenvalues and the eigenvectors explicitly.

Likewise the following second order complex moment of the power spectrum of $I$, which happens to be always real because $I$ is real,


$$\kappa _{11}=\mu _{20}+\mu _{02}=\int w(r)|I_{x}(p-r)+iI_{y}(p-r)|^{2}\,dr=\lambda _{1}+\lambda _{2}
$$

can be obtained, with $\lambda _{1}$ and $\lambda _{2}$ being the eigenvalues as before. Notice that this time the magnitude of the complex gradient is squared (which is always real).

However, decomposing the structure tensor in its eigenvectors yields its tensor components as


$$S_{w}(p)=\lambda _{1}e_{1}e_{1}^{\text{T}}+\lambda _{2}e_{2}e_{2}^{\text{T}}=(\lambda _{1}-\lambda _{2})e_{1}e_{1}^{\text{T}}+\lambda _{2}(e_{1}e_{1}^{\text{T}}+e_{2}e_{2}^{\text{T}})=(\lambda _{1}-\lambda _{2})e_{1}e_{1}^{\text{T}}+\lambda _{2}E
$$

where $E$ is the identity matrix in 2D because the two eigenvectors are always orthogonal (and sum to unity). The first term in the last expression of the decomposition, $(\lambda _{1}-\lambda _{2})e_{1}e_{1}^{\text{T}}$, represents the linear symmetry component of the structure tensor containing all directional information (as a rank-1 matrix), whereas the second term represents the balanced body component of the tensor, which lacks any directional information (containing an identity matrix $E$). To know how much directional information there is in $I$ is then the same as checking how large $\lambda _{1}-\lambda _{2}$ is compared to $\lambda _{2}$.

Evidently, $\kappa _{20}$ is the complex equivalent of the first term in the tensor decomposition, whereas
$${\tfrac {1}{2}}(|\kappa _{20}|-\kappa _{11})=\lambda _{2}
$$is the equivalent of the second term. Thus the two scalars, comprising three real numbers,


$${\begin{aligned}\kappa _{20}&=&(\lambda _{1}-\lambda _{2})\exp(i2\phi )&=w*(h*I)^{2}\\\kappa _{11}&=&\lambda _{1}+\lambda _{2}&=w*|h*I|^{2}\\\end{aligned}}
$$where $h(x,y)=(x+iy)\exp(-(x^{2}+y^{2})/(2\sigma ^{2}))$ is the (complex) gradient filter, and $*$ is convolution, constitute a complex representation of the 2D Structure Tensor. As discussed here and elsewhere $w$ defines the local image which is usually a Gaussian (with a certain variance defining the outer scale), and $\sigma$ is the (inner scale) parameter determining the effective frequency range in which the orientation $2\phi$ is to be estimated.

The elegance of the complex representation stems from that the two components of the structure tensor can be obtained as averages and independently. In turn, this means that $\kappa _{20}$ and $\kappa _{11}$ can be used in a scale space representation to describe the evidence for presence of unique orientation and the evidence for the alternative hypothesis, the presence of multiple balanced orientations, without computing the eigenvectors and eigenvalues. A functional, such as squaring the complex numbers have to this date not been shown to exist for structure tensors with dimensions higher than two. In Bigun 91, it has been put forward with due argument that this is because complex numbers are commutative algebras whereas quaternions, the possible candidate to construct such a functional by, constitute a non-commutative algebra.

The complex representation of the structure tensor is frequently used in fingerprint analysis to obtain direction maps containing certainties which in turn are used to enhance them, to find the locations of the global (cores and deltas) and local (minutia) singularities, as well as automatically evaluate the quality of the fingerprints.


## The 3D structure tensor


### Definition

The structure tensor can be defined also for a function $I$ of three variables p=(x,y,z) in an entirely analogous way. Namely, in the continuous version we have ${\textstyle S_{w}(p)=\int w(r)S_{0}(p-r)\,dr}$, where
$$S_{0}(p)={\begin{bmatrix}(I_{x}(p))^{2}&I_{x}(p)I_{y}(p)&I_{x}(p)I_{z}(p)\\[10pt]I_{x}(p)I_{y}(p)&(I_{y}(p))^{2}&I_{y}(p)I_{z}(p)\\[10pt]I_{x}(p)I_{z}(p)&I_{y}(p)I_{z}(p)&(I_{z}(p))^{2}\end{bmatrix}}
$$where $I_{x},I_{y},I_{z}$ are the three partial derivatives of $I$, and the integral ranges over $\mathbb {R} ^{3}$.

In the discrete version,
$${\textstyle S_{w}[p]=\sum _{r}w[r]S_{0}[p-r]}
$$, where
$$S_{0}[p]={\begin{bmatrix}(I_{x}[p])^{2}&I_{x}[p]I_{y}[p]&I_{x}[p]I_{z}[p]\\[10pt]I_{x}[p]I_{y}[p]&(I_{y}[p])^{2}&I_{y}[p]I_{z}[p]\\[10pt]I_{x}[p]I_{z}[p]&I_{y}[p]I_{z}[p]&(I_{z}[p])^{2}\end{bmatrix}}
$$and the sum ranges over a finite set of 3D indices, usually
$$\{-m\ldots +m\}\times \{-m\ldots +m\}\times \{-m\ldots +m\}
$$for some m.


### Interpretation

As in the two-dimensional case, the eigenvalues $\lambda _{1},\lambda _{2},\lambda _{3}$ of $S_{w}[p]$, and the corresponding eigenvectors ${\hat {e}}_{1},{\hat {e}}_{2},{\hat {e}}_{3}$, summarize the distribution of gradient directions within the neighborhood of p defined by the window $w$. This information can be visualized as an ellipsoid whose semi-axes are equal to the eigenvalues and directed along their corresponding eigenvectors.

In particular, if the ellipsoid is stretched along one axis only, like a cigar (that is, if $\lambda _{1}$ is much larger than both $\lambda _{2}$ and $\lambda _{3}$), it means that the gradient in the window is predominantly aligned with the direction $e_{1}$, so that the isosurfaces of $I$ tend to be flat and perpendicular to that vector. This situation occurs, for instance, when p lies on a thin plate-like feature, or on the smooth boundary between two regions with contrasting values.

If the ellipsoid is flattened in one direction only, like a pancake (that is, if $\lambda _{3}$ is much smaller than both $\lambda _{1}$ and $\lambda _{2}$), it means that the gradient directions are spread out but perpendicular to $e_{3}$; so that the isosurfaces tend to be like tubes parallel to that vector. This situation occurs, for instance, when p lies on a thin line-like feature, or on a sharp corner of the boundary between two regions with contrasting values.

Finally, if the ellipsoid is roughly spherical (that is, if
$$\lambda _{1}\approx \lambda _{2}\approx \lambda _{3}
$$), it means that the gradient directions in the window are more or less evenly distributed, with no marked preference; so that the function $I$ is mostly isotropic in that neighborhood. This happens, for instance, when the function has spherical symmetry in the neighborhood of p. In particular, if the ellipsoid degenerates to a point (that is, if the three eigenvalues are zero), it means that $I$ is constant (has zero gradient) within the window.


## The multi-scale structure tensor

The structure tensor is an important tool in scale space analysis. The multi-scale structure tensor (or multi-scale second moment matrix) of a function $I$ is in contrast to other one-parameter scale-space features an image descriptor that is defined over two scale parameters. One scale parameter, referred to as local scale $t$, is needed for determining the amount of pre-smoothing when computing the image gradient $(\nabla I)(x;t)$. Another scale parameter, referred to as integration scale $s$, is needed for specifying the spatial extent of the window function $w(\xi ;s)$ that determines the weights for the region in space over which the components of the outer product of the gradient by itself $(\nabla I)(\nabla I)^{\text{T}}$ are accumulated.

More precisely, suppose that $I$ is a real-valued signal defined over $\mathbb {R} ^{k}$. For any local scale $t>0$, let a multi-scale representation $I(x;t)$ of this signal be given by $I(x;t)=h(x;t)*I(x)$ where $h(x;t)$ represents a pre-smoothing kernel. Furthermore, let $(\nabla I)(x;t)$ denote the gradient of the scale space representation. Then, the multi-scale structure tensor/second-moment matrix is defined by
$$\mu (x;t,s)=\int _{\xi \in \mathbb {R} ^{k}}(\nabla I)(x-\xi ;t)\,(\nabla I)^{\text{T}}(x-\xi ;t)\,w(\xi ;s)\,d\xi
$$Conceptually, one may ask if it would be sufficient to use any self-similar families of smoothing functions $h(x;t)$ and $w(\xi ;s)$. If one naively would apply, for example, a box filter, however, then non-desirable artifacts could easily occur. If one wants the multi-scale structure tensor to be well-behaved over both increasing local scales $t$ and increasing integration scales $s$, then it can be shown that both the smoothing function and the window function have to be Gaussian. The conditions that specify this uniqueness are similar to the scale-space axioms that are used for deriving the uniqueness of the Gaussian kernel for a regular Gaussian scale space of image intensities.

There are different ways of handling the two-parameter scale variations in this family of image descriptors. If we keep the local scale parameter $t$ fixed and apply increasingly broadened versions of the window function by increasing the integration scale parameter $s$ only, then we obtain a true formal scale space representation of the directional data computed at the given local scale $t$. If we couple the local scale and integration scale by a relative integration scale $r\geq 1$, such that $s=rt$ then for any fixed value of $r$, we obtain a reduced self-similar one-parameter variation, which is frequently used to simplify computational algorithms, for example in corner detection, interest point detection, texture analysis and image matching. By varying the relative integration scale $r\geq 1$ in such a self-similar scale variation, we obtain another alternative way of parameterizing the multi-scale nature of directional data obtained by increasing the integration scale.

A conceptually similar construction can be performed for discrete signals, with the convolution integral replaced by a convolution sum and with the continuous Gaussian kernel $g(x;t)$ replaced by the discrete Gaussian kernel $T(n;t)$:
$$\mu (x;t,s)=\sum _{n\in \mathbb {Z} ^{k}}(\nabla I)(x-n;t)\,(\nabla I)^{\text{T}}(x-n;t)\,w(n;s)
$$When quantizing the scale parameters $t$ and $s$ in an actual implementation, a finite geometric progression $\alpha ^{i}$ is usually used, with i ranging from 0 to some maximum scale index m. Thus, the discrete scale levels will bear certain similarities to image pyramid, although spatial subsampling may not necessarily be used in order to preserve more accurate data for subsequent processing stages.


## Applications

The eigenvalues of the structure tensor play a significant role in many image processing algorithms, for problems like corner detection, interest point detection, and feature tracking. The structure tensor also plays a central role in the Lucas-Kanade optical flow algorithm, and in its extensions to estimate affine shape adaptation; where the magnitude of $\lambda _{2}$ is an indicator of the reliability of the computed result. The tensor has been used for scale space analysis, estimation of local surface orientation from monocular or binocular cues, non-linear fingerprint enhancement, diffusion-based image processing, and several other image processing problems. The structure tensor can be also applied in geology to filter seismic data.


### Processing spatio-temporal video data with the structure tensor

The three-dimensional structure tensor has been used to analyze three-dimensional video data (viewed as a function of x, y, and time t). If one in this context aims at image descriptors that are invariant under Galilean transformations, to make it possible to compare image measurements that have been obtained under variations of a priori unknown image velocities $v=(v_{x},v_{y})^{\text{T}}$
$${\begin{bmatrix}x'\\y'\\t'\end{bmatrix}}=G{\begin{bmatrix}x\\y\\t\end{bmatrix}}={\begin{bmatrix}x-v_{x}\,t\\y-v_{y}\,t\\t\end{bmatrix}},
$$it is, however, from a computational viewpoint preferable to parameterize the components in the structure tensor/second-moment matrix $S$ using the notion of Galilean diagonalization
$$S'=R_{\text{space}}^{-{\text{T}}}\,G^{-{\text{T}}}\,S\,G^{-1}\,R_{\text{space}}^{-1}={\begin{bmatrix}\nu _{1}&\,&\,\\\,&\nu _{2}&\,\\\,&\,&\nu _{3}\end{bmatrix}}
$$where $G$ denotes a Galilean transformation of spacetime and $R_{\text{space}}$ a two-dimensional rotation over the spatial domain, compared to the abovementioned use of eigenvalues of a 3-D structure tensor, which corresponds to an eigenvalue decomposition and a (non-physical) three-dimensional rotation of spacetime
$$S''=R_{\text{spacetime}}^{-{\text{T}}}\,S\,R_{\text{spacetime}}^{-1}={\begin{bmatrix}\lambda _{1}&&\\&\lambda _{2}&\\&&\lambda _{3}\end{bmatrix}}.
$$To obtain true Galilean invariance, however, also the shape of the spatio-temporal window function needs to be adapted, corresponding to the transfer of affine shape adaptation from spatial to spatio-temporal image data. In combination with local spatio-temporal histogram descriptors, these concepts together allow for Galilean invariant recognition of spatio-temporal events.


## See also


- Tensor
- Tensor operator
- Directional derivative
- Gaussian
- Corner detection
- Edge detection
- Lucas-Kanade method
- Affine shape adaptation
- Generalized structure tensor


## Resources


- Download MATLAB Source
- Structure Tensor Tutorial (Original)
