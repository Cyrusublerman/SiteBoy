# Guided filter

A guided filter is an edge-preserving smoothing image filter. As with a bilateral filter, it can filter out noise or texture while retaining sharp edges.


## Comparison

Compared to the bilateral filter, the guided image filter has two advantages: bilateral filters have high computational complexity, while the guided image filter uses simpler calculations with linear computational complexity. Bilateral filters sometimes include unwanted gradient reversal artifacts and cause image distortion. The guided image filter is based on linear combination, making the output image consistent with the gradient direction of the guidance image, preventing gradient reversal.


## Definition

One key assumption of the guided filter is that the relation between guidance $I$ and the filtering output $q$ is linear. Suppose that $q$ is a linear transformation of $I$ in a window $\omega _{k}$ centered at the pixel $k$.

In order to determine the linear coefficient $(a_{k},b_{k})$, constraints from the filtering input $p$ are required. The output $q$ is modeled as the input $p$ with unwanted components $n$, such as noise/textures subtracted.

The basic model：

(1) $q_{i}=a_{k}I_{i}+b_{k},\forall i\in \omega _{k}$

(2) $q_{i}=p_{i}-n_{i}$

$q_{i}$ is the $i_{th}$ output pixel;

$p_{i}$ is the $i_{th}$ input pixel;

$n_{i}$ is the $i_{th}$ pixel of noise components;

$I_{i}$ is the $i_{th}$ guidance image pixel;

$(a_{k},b_{k})$ are some linear coefficients assumed to be constant in $\omega _{k}$.

The reason to use a linear combination is that the boundary of an object is related to its gradient. The local linear model ensures that $q$ has an edge only if $I$ has an edge, since $\nabla q=a\nabla I$.

Subtract (1) and (2) to get formula (3)；At the same time, define a cost function (4)：

(3) $n_{i}=p_{i}-a_{k}I_{i}-b_{k}$

(4)
$$E(a_{k},b_{k})=\sum _{i{\epsilon }{\omega }_{k}}^{}((a_{k}I_{i}+b_{k}-p_{i})^{2}+{\epsilon }a_{k}^{2})
$$

$\epsilon$ is a regularization parameter penalizing large $a_{k}$;

$\omega _{k}$ is a window centered at the pixel $k$.

And the cost function's solution is：

(5)
$$a_{k}={\frac {{\frac {1}{\left|\omega \right|}}\sum _{i\epsilon \omega _{k}}I_{i}p_{i}-\mu _{k}{\bar {p_{k}}}}{\sigma _{k}^{2}+\epsilon }}
$$

(6) $b_{k}={\bar {p_{k}}}-a_{k}\mu _{k}$

$\mu _{k}$ and $\sigma _{k}^{2}$ are the mean and variance of $I$ in $\omega _{k}$;

$\left|\omega \right|$ is the number of pixels in $\omega _{k}$;


$${\bar {p}}_{k}={\frac {1}{\left|\omega \right|}}\sum _{i\epsilon \omega _{k}}p_{i}
$$is the mean of $p$ in $\omega _{k}$.

After obtaining the linear coefficients $(a_{k},b_{k})$, the filtering output $q_{i}$ is provided by the following algorithm:


### Algorithm

By definition, the algorithm can be written as:


#### Algorithm 1. Guided Filter

input： filtering input image $p$ ，guidance image $I$ ，window radius $r$ ，regularization $\epsilon$

output： filtering output $q$

$f_{mean}$ is a mean filter with a wide variety of O(N) time methods.


## Properties


### Edge-preserving filtering

When the guidance image $I$ is the same as the filtering input $p$. The guided filter removes noise in the input image while preserving clear edges.

Specifically, a “flat patch” or a “high variance patch” can be specified by the parameter $\epsilon$ of the guided filter. Patches with variance much lower than the parameter $\epsilon$ will be smoothed, and those with variances much higher than $\epsilon$ will be preserved. The role of the range variance $\sigma _{r}^{2}$ in the bilateral filter is similar to $\epsilon$ in the guided filter. Both of them define the edge/high variance patches that should be kept and noise/flat patches that should be smoothed.”


### Gradient-preserving filtering

When using the bilateral filter to filter an image, artifacts may appear on the edges. This is because of the pixel value's abrupt change on the edge. These artifacts are inherent and hard to avoid, because edges appear in all kinds of pictures.

The guided filter performs better in avoiding gradient reversal. Moreover, in some cases, it can be ensured that gradient reversal does not occur.


### Structure-transferring filtering

Due to the local linear model of $q=aI+b$, it is possible to transfer the structure from the guidance $I$ to the output $q$. This property enables some special filtering-based applications, such as feathering, matting and dehazing.


## Implementations


- MATLAB
- OpenCV
- FFmpeg


## See also


- Bilateral filter
