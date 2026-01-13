# Total variation denoising

In signal processing, particularly image processing, total variation denoising, also known as total variation regularization or total variation filtering, is a noise removal process (filter). It is based on the principle that signals with excessive and possibly spurious detail have high total variation, that is, the integral of the image gradient magnitude is high. According to this principle, reducing the total variation of the signal—subject to it being a close match to the original signal—removes unwanted detail whilst preserving important details such as edges. The concept was pioneered by L. I. Rudin, S. Osher, and E. Fatemi in 1992 and so is today known as the ROF model.

This noise removal technique has advantages over simple techniques such as linear smoothing or median filtering which reduce noise but at the same time smooth away edges to a greater or lesser degree. By contrast, total variation denoising is a remarkably effective edge-preserving filter, i.e., simultaneously preserving edges whilst smoothing away noise in flat regions, even at low signal-to-noise ratios.


## 1D signal series

For a digital signal $x_{n}$, we can, for example, define the total variation as


$$V(x)=\sum _{n}|x_{n+1}-x_{n}|.
$$

Given an input signal $x_{n}$, the goal of total variation denoising is to find an approximation, call it $y_{n}$, that has smaller total variation than $x_{n}$ but is "close" to $x_{n}$. One measure of closeness is the sum of square errors:


$$\operatorname {E} (x,y)={\frac {1}{n}}\sum _{n}(x_{n}-y_{n})^{2}.
$$

So the total-variation denoising problem amounts to minimizing the following discrete functional over the signal $y_{n}$:

$\operatorname {E} (x,y)+\lambda V(y).$

By differentiating this functional with respect to $y_{n}$, we can derive a corresponding Euler–Lagrange equation, that can be numerically integrated with the original signal $x_{n}$ as initial condition. This was the original approach. Alternatively, since this is a convex functional, techniques from convex optimization can be used to minimize it and find the solution $y_{n}$.


## Regularization properties

The regularization parameter $\lambda$ plays a critical role in the denoising process. When $\lambda =0$, there is no smoothing and the result is the same as minimizing the sum of squared errors. As $\lambda \to \infty$, however, the total variation term plays an increasingly strong role, which forces the result to have smaller total variation, at the expense of being less like the input (noisy) signal. Thus, the choice of regularization parameter is critical to achieving just the right amount of noise removal.


## 2D signal images

We now consider 2D signals y, such as images. The total-variation norm proposed by the 1992 article is


$$V(y)=\sum _{i,j}{\sqrt {|y_{i+1,j}-y_{i,j}|^{2}+|y_{i,j+1}-y_{i,j}|^{2}}}
$$

and is isotropic and not differentiable. A variation that is sometimes used, since it may sometimes be easier to minimize, is an anisotropic version


$$V_{\operatorname {aniso} }(y)=\sum _{i,j}{\sqrt {|y_{i+1,j}-y_{i,j}|^{2}}}+{\sqrt {|y_{i,j+1}-y_{i,j}|^{2}}}=\sum _{i,j}|y_{i+1,j}-y_{i,j}|+|y_{i,j+1}-y_{i,j}|.
$$

The standard total-variation denoising problem is still of the form

$\min _{y}[\operatorname {E} (x,y)+\lambda V(y)],$

where E is the 2D L2 norm. In contrast to the 1D case, solving this denoising is non-trivial. A recent algorithm that solves this is known as the primal dual method.

Due in part to much research in compressed sensing in the mid-2000s, there are many algorithms, such as the split-Bregman method, that solve variants of this problem.


## Rudin–Osher–Fatemi PDE

Suppose that we are given a noisy image $f$ and wish to compute a denoised image $u$ over a 2D space. ROF showed that the minimization problem we are looking to solve is:


$$\min _{u\in \operatorname {BV} (\Omega )}\;\|u\|_{\operatorname {TV} (\Omega )}+{\lambda \over 2}\int _{\Omega }(f-u)^{2}\,dx
$$

where ${\textstyle \operatorname {BV} (\Omega )}$ is the set of functions with bounded variation over the domain $\Omega$, ${\textstyle \operatorname {TV} (\Omega )}$ is the total variation over the domain, and ${\textstyle \lambda }$ is a penalty term. When ${\textstyle u}$ is smooth, the total variation is equivalent to the integral of the gradient magnitude:


$$\|u\|_{\operatorname {TV} (\Omega )}=\int _{\Omega }\|\nabla u\|\,dx
$$

where ${\textstyle \|\cdot \|}$ is the Euclidean norm. Then the objective function of the minimization problem becomes:
$$\min _{u\in \operatorname {BV} (\Omega )}\;\int _{\Omega }\left[\|\nabla u\|+{\lambda \over 2}(f-u)^{2}\right]\,dx
$$From this functional, the Euler-Lagrange equation for minimization – assuming no time-dependence – gives us the nonlinear elliptic partial differential equation:

For some numerical algorithms, it is preferable to instead solve the time-dependent version of the ROF equation:
$${\partial u \over {\partial t}}=\nabla \cdot \left({\nabla u \over {\|\nabla u\|}}\right)+\lambda (f-u)
$$


## Applications

The Rudin–Osher–Fatemi model was a pivotal component in producing the first image of a black hole.


## See also


- Anisotropic diffusion
- Bounded variation
- Basis pursuit denoising
- Chambolle-Pock algorithm
- Digital image processing
- Lasso (statistics)
- Noise reduction
- Non-local means
- Signal processing
- Total variation


## External links


- TVDIP: Full-featured Matlab 1D total variation denoising implementation.
- Efficient Primal-Dual Total Variation
- TV-L1 image denoising algorithm in Matlab
