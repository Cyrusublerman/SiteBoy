# Mean shift

Mean shift is a non-parametric feature-space mathematical analysis technique for locating the maxima of a density function, a so-called mode-seeking algorithm. Application domains include cluster analysis in computer vision and image processing.


## History

The mean shift procedure is usually credited to work by Fukunaga and Hostetler in 1975. It is, however, reminiscent of earlier work by Schnell in 1964.


## Overview

Mean shift is a procedure for locating the maxima—the modes—of a density function given discrete data sampled from that function. This is an iterative method, and we start with an initial estimate $x$. Let a kernel function $K(x_{i}-x)$ be given. This function determines the weight of nearby points for re-estimation of the mean. Typically a Gaussian kernel on the distance to the current estimate is used, $K(x_{i}-x)=e^{-c||x_{i}-x||^{2}}$. The weighted mean of the density in the window determined by $K$ is


$$m(x)={\frac {\sum _{x_{i}\in N(x)}K(x_{i}-x)x_{i}}{\sum _{x_{i}\in N(x)}K(x_{i}-x)}}
$$

where $N(x)$ is the neighborhood of $x$, a set of points for which $K(x_{i}-x)\neq 0$.

The difference $m(x)-x$ is called mean shift in Fukunaga and Hostetler. The mean-shift algorithm now sets $x\leftarrow m(x)$, and repeats the estimation until $m(x)$ converges.

Although the mean shift algorithm has been widely used in many applications, a rigid proof for the convergence of the algorithm using a general kernel in a high dimensional space is still not known. Aliyari Ghassabeh showed the convergence of the mean shift algorithm in one dimension with a differentiable, convex, and strictly decreasing profile function. However, the one-dimensional case has limited real world applications. Also, the convergence of the algorithm in higher dimensions with a finite number of the stationary (or isolated) points has been proved. However, sufficient conditions for a general kernel function to have finite stationary (or isolated) points have not been provided.

Gaussian Mean-Shift is an Expectation–maximization algorithm.


## Details

Let data be a finite set $S$ embedded in the $n$-dimensional Euclidean space, $X$. Let $K$ be a flat kernel that is the characteristic function of the $\lambda$-ball in $X$,

In each iteration of the algorithm, $s\leftarrow m(s)$ is performed for all $s\in S$ simultaneously. The first question, then, is how to estimate the density function given a sparse set of samples. One of the simplest approaches is to just smooth the data, e.g., by convolving it with a fixed kernel of width $h$,

where $x_{i}$ are the input samples and $k(r)$ is the kernel function (or Parzen window). $h$ is the only parameter in the algorithm and is called the bandwidth. This approach is known as kernel density estimation or the Parzen window technique. Once we have computed $f(x)$ from the equation above, we can find its local maxima using gradient ascent or some other optimization technique. The problem with this "brute force" approach is that, for higher dimensions, it becomes computationally prohibitive to evaluate $f(x)$ over the complete search space. Instead, mean shift uses a variant of what is known in the optimization literature as multiple restart gradient descent. Starting at some guess for a local maximum, $y_{k}$, which can be a random input data point $x_{1}$, mean shift computes the gradient of the density estimate $f(x)$ at $y_{k}$ and takes an uphill step in that direction.


## Types of kernels

Kernel definition: Let $X$ be the $n$-dimensional Euclidean space, $\mathbb {R} ^{n}$. The norm of $x$ is a non-negative number, $\|x\|^{2}=x^{\top }x\geq 0$. A function $K:X\rightarrow \mathbb {R}$ is said to be a kernel if there exists a profile, $k:[0,\infty ]\rightarrow \mathbb {R}$ , such that

$K(x)=k(\|x\|^{2})$ and


- k is non-negative.
- k is non-increasing: $k(a)\geq k(b)$ if $a<b$.
- k is piecewise continuous and $\int _{0}^{\infty }k(r)\,dr<\infty \$

The two most frequently used kernel profiles for mean shift are:


**Flat kernel**


**Gaussian kernel**

where the standard deviation parameter $\sigma$ works as the bandwidth parameter, $h$.


## Applications


### Clustering

Consider a set of points in two-dimensional space. Assume a circular window centered at $C$ and having radius $r$ as the kernel. Mean-shift is a hill climbing algorithm which involves shifting this kernel iteratively to a higher density region until convergence. Every shift is defined by a mean shift vector. The mean shift vector always points toward the direction of the maximum increase in the density. At every iteration the kernel is shifted to the centroid or the mean of the points within it. The method of calculating this mean depends on the choice of the kernel. In this case if a Gaussian kernel is chosen instead of a flat kernel, then every point will first be assigned a weight which will decay exponentially as the distance from the kernel's center increases. At convergence, there will be no direction at which a shift can accommodate more points inside the kernel.


### Tracking

The mean shift algorithm can be used for visual tracking. The simplest such algorithm would create a confidence map in the new image based on the color histogram of the object in the previous image, and use mean shift to find the peak of a confidence map near the object's old position. The confidence map is a probability density function on the new image, assigning each pixel of the new image a probability, which is the probability of the pixel color occurring in the object in the previous image. A few algorithms, such as kernel-based object tracking, ensemble tracking, CAMshift expand on this idea.


### Smoothing

Let $x_{i}$ and $z_{i},i=1,...,n,$ be the $d$-dimensional input and filtered image pixels in the joint spatial-range domain. For each pixel,


- Initialize $j=1$ and $y_{i,1}=x_{i}$
- Compute $y_{i,j+1}$ according to $m(\cdot )$ until convergence, $y=y_{i,c}$.
- Assign $z_{i}=(x_{i}^{s},y_{i,c}^{r})$. The superscripts s and r denote the spatial and range components of a vector, respectively. The assignment specifies that the filtered data at the spatial location axis will have the range component of the point of convergence $y_{i,c}^{r}$.


## Strengths


1. Mean shift is an application-independent tool suitable for real data analysis.
2. Does not assume any predefined shape on data clusters.
3. It is capable of handling arbitrary feature spaces.
4. The procedure relies on choice of a single parameter: bandwidth.
5. The bandwidth/window size 'h' has a physical meaning, unlike k-means.


## Weaknesses


1. The selection of a window size is not trivial.
2. Inappropriate window size can cause modes to be merged, or generate additional “shallow” modes.
3. Often requires using adaptive window size.


## Availability

Variants of the algorithm can be found in machine learning and image processing packages:


- ELKI. Java data mining tool with many clustering algorithms.
- ImageJ. Image filtering using the mean shift filter.
- mlpack. Efficient dual-tree algorithm-based implementation.
- OpenCV contains mean-shift implementation via cvMeanShift Method
- Orfeo toolbox. A C++ implementation.
- scikit-learn Numpy/Python implementation uses ball tree for efficient neighboring points lookup


## See also


- DBSCAN
- OPTICS algorithm
- Kernel density estimation (KDE)
- Kernel (statistics)
