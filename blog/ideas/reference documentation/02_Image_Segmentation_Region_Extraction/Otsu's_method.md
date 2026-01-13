# Otsu's method

In computer vision and image processing, Otsu's method大津の二値化法, named after Nobuyuki Otsu (大津展之, Ōtsu Nobuyuki), is used to perform automatic image thresholding. In the simplest form, the algorithm returns a single intensity threshold that separate pixels into two classes – foreground and background. This threshold is determined by minimizing intra-class intensity variance, or equivalently, by maximizing inter-class variance.

Otsu's method is a one-dimensional discrete analogue of Fisher's discriminant analysis, is related to Jenks optimization method, and is equivalent to a globally optimal k-means performed on the intensity histogram. The extension to multi-level thresholding was described in the original paper, and computationally efficient implementations have since been proposed.


## Otsu's method

Let, $H$ be the normalised histogram of the pixels in an image (s.t. it becomes the probability distribution of pixel intensities) with $L$ bins. There are two classes of this histogram: $C_{0}$ for background pixels, and $C_{1}$ for foreground pixels. The primary disciminator of pixels (to assort them into classes) is the threshold ${\textstyle t}$. $C_{0}$ includes pixels from $0$ to $(t-1)$, and $C_{1}$ includes from $t$ to $(L-1)$.

The algorithm is then global search for an optimal threshold $t^{*}$ such that intra-class variance (variance of pixels intensities in $C_{0}$ or $C_{1}$) is minimised.

Let, $\omega _{0}$ denote the cumulative probability of $C_{0}$, and $\omega _{1}$denote of $C_{1}$.
$${\begin{aligned}\omega _{0}(t)&=\sum _{i=0}^{t-1}P(i),\\\omega _{1}(t)&=\sum _{i=t}^{L-1}P(i).\end{aligned}}
$$For a classes $C_{0}$ and $C_{1}$, the conditional probability of selecting the $i$-th pixel in those classes is $P(i|C_{0})$ and $P(i|C_{1})$ respectively.

Now, let $\mu _{0}(t)$ and $\mu _{1}(t)$ be the mean (pixel intensity) of $C_{0}$ and $C_{1}$ respectively.


$${\begin{aligned}\mu _{0}(t)&=\sum _{i=0}^{t-1}iP(i|C_{0})=\sum _{i=0}^{t-1}{\frac {iP(i)}{\omega _{0}(t)}}={\frac {\sum _{i=0}^{t-1}iP(i)}{\omega _{0}(t)}}.\end{aligned}}
$$


$$\mu _{1}(t)={\frac {\sum _{i=t}^{L-1}iP(i)}{\omega _{1}(t)}}.
$$

Now, let $\sigma _{0}^{2}(t)$ and $\sigma _{1}^{2}(t)$ be the (pixel intensity) variance of $C_{0}$ and $C_{1}$ respectively.


$${\begin{aligned}\sigma _{0}^{2}(t)&=\sum _{i=0}^{t-1}(i-\mu _{0})^{2}P(i|C_{0})=\sum _{i=0}^{t-1}{\frac {(i-\mu _{0})^{2}P(i)}{\omega _{0}}}={\frac {\sum _{i=0}^{t-1}(i-\mu _{0})^{2}P(i)}{\omega _{0}(t)}}.\end{aligned}}
$$


$$\sigma _{1}^{2}(t)={\frac {\sum _{i=t}^{L-1}(i-\mu _{1})^{2}P(i)}{\omega _{1}(t)}}.
$$

Let, $\sigma _{b}^{2}(t)$ be the inter-class (pixel intensity) variance, which is defined as the weighted sum of variances of aforementioned two classes.


$${\begin{aligned}\sigma _{b}^{2}(t)&=\sigma _{T}^{2}-\left[\omega _{0}(t)\sigma _{0}^{2}(t)+\omega _{1}(t)\sigma _{1}^{2}(t)\right]\\&=\omega _{0}(\mu _{0}-\mu _{T})^{2}+w_{1}(\mu _{1}-\mu _{T})^{2}\\&=\omega _{0}\omega _{1}(\mu _{0}-\mu _{1})^{2}.\end{aligned}}
$$

Where, $\sigma _{T}^{2}(t)$ variance of the total histogram.

The algorithm is now to maximise $\sigma _{b}^{2}(t)$, i.e. inter-class variance. This standpoint is motivated by a conjecture that well-thresholded classes would be separated in pixel intensities, and conversely a threshold $t^{*}$ giving the best separation of classes in pixel intensities would be the best threshold.

Formally, this problem is summarised as the following.


### Algorithm


1. Compute histogram and probabilities of each intensity level.
2. Set up initial $\omega _{0}(0)$, $\mu _{0}(0)$ and $\omega _{1}(0)$ and $\mu _{1}(0)$.
3. Step through all possible thresholds from $t=1$ to maximum intensity. Update ω 0 ( 0 ) {\displaystyle \omega _{0}(0)} , μ 0 ( 0 ) {\displaystyle \mu _{0}(0)} and ω 1 ( 0 ) {\displaystyle \omega _{1}(0)} and μ 1 ( 0 ) {\displaystyle \mu _{1}(0)} . Compute σ b 2 ( t ) {\displaystyle \sigma _{b}^{2}(t)} .
4. Desired threshold $t^{*}$ corresponds to the maximum $\sigma _{b}^{2}(t)$.


### MATLAB implementation

histogramCounts is a 256-element histogram of a grayscale image different gray-levels (typical for 8-bit images). level is the threshold for the image (double).

Matlab has built-in functions graythresh() and multithresh() in the Image Processing Toolbox, which are implemented with Otsu's method and multi-Otsu's method respectively.


### Python implementation

This implementation requires the NumPy library.

Python libraries dedicated to image processing such as OpenCV and Scikit-image provide built-in implementations of the algorithm.


## Limitations and variations

Otsu's method performs well when the histogram has a bimodal distribution with a deep and sharp valley between the two peaks.

Like all other global thresholding methods, Otsu's method performs badly in case of heavy noise, small objects size, inhomogeneous lighting and larger intra-class than inter-class variance. In those cases, local adaptations of the Otsu method have been developed.

Moreover, the mathematical grounding of Otsu's method models the histogram of the image as a mixture of two normal distributions with equal variance and equal size. However, Otsu's thresholding may yield satisfying results even when these assumptions are not met, in the same way statistical tests (to which Otsu's method is heavily connected) can perform correctly even when the working assumptions are not fully satisfied.

Several variations of Otsu's methods have been proposed to account for more severe deviations from these assumptions, such as the Kittler–Illingworth method.


### A variation for noisy images

A popular local adaptation is the two-dimensional Otsu's method, which performs better for the object segmentation task in noisy images. Here, the intensity value of a given pixel is compared with the average intensity of its immediate neighborhood to improve segmentation results.

At each pixel, the average gray-level value of the neighborhood is calculated. Let the gray level of the given pixel be divided into $L$ discrete values, and the average gray level is also divided into the same $L$ values. Then a pair is formed: the pixel gray level and the average of the neighborhood $(i,j)$. Each pair belongs to one of the $L\times L$ possible 2-dimensional bins. The total number of occurrences (frequency) $f_{ij}$ of a pair $(i,j)$, divided by the total number of pixels in the image $N$, defines the joint probability mass function in a 2-dimensional histogram:
$$P_{ij}={\frac {f_{ij}}{N}},\qquad \sum _{i=0}^{L-1}\sum _{j=0}^{L-1}P_{ij}=1.
$$

And the 2-dimensional Otsu's method is developed based on the 2-dimensional histogram as follows.

The probabilities of two classes can be denoted as
$${\begin{aligned}\omega _{0}&=\sum _{i=0}^{s-1}\sum _{j=0}^{t-1}P_{ij},\\\omega _{1}&=\sum _{i=s}^{L-1}\sum _{j=t}^{L-1}P_{ij}.\end{aligned}}
$$

The intensity mean-value vectors of two classes and total mean vector can be expressed as follows:
$${\begin{aligned}\mu _{0}&=[\mu _{0i},\mu _{0j}]^{T}=\left[\sum _{i=0}^{s-1}\sum _{j=0}^{t-1}i{\frac {P_{ij}}{\omega _{0}}},\sum _{i=0}^{s-1}\sum _{j=0}^{t-1}j{\frac {P_{ij}}{\omega _{0}}}\right]^{T},\\\mu _{1}&=[\mu _{1i},\mu _{1j}]^{T}=\left[\sum _{i=s}^{L-1}\sum _{j=t}^{L-1}i{\frac {P_{ij}}{\omega _{1}}},\sum _{i=s}^{L-1}\sum _{j=t}^{L-1}j{\frac {P_{ij}}{\omega _{1}}}\right]^{T},\\\mu _{T}&=[\mu _{Ti},\mu _{Tj}]^{T}=\left[\sum _{i=0}^{L-1}\sum _{j=0}^{L-1}iP_{ij},\sum _{i=0}^{L-1}\sum _{j=0}^{L-1}jP_{ij}\right]^{T}.\end{aligned}}
$$

In most cases the probability off-diagonal will be negligible, so it is easy to verify $\omega _{0}+\omega _{1}\cong 1,$
$$\omega _{0}\mu _{0}+\omega _{1}\mu _{1}\cong \mu _{T}.
$$

The inter-class discrete matrix is defined as
$$S_{b}=\sum _{k=0}^{1}\omega _{k}[(\mu _{k}-\mu _{T})(\mu _{k}-\mu _{T})^{T}].
$$

The trace of the discrete matrix can be expressed as
$${\begin{aligned}\operatorname {tr} (S_{b})&=\omega _{0}[(\mu _{0i}-\mu _{Ti})^{2}+(\mu _{0j}-\mu _{Tj})^{2}]+\omega _{1}[(\mu _{1i}-\mu _{Ti})^{2}+(\mu _{1j}-\mu _{Tj})^{2}]\\&={\frac {(\mu _{Ti}\omega _{0}-\mu _{i})^{2}+(\mu _{Tj}\omega _{0}-\mu _{j})^{2}}{\omega _{0}(1-\omega _{0})}},\end{aligned}}
$$where
$$\mu _{i}=\sum _{i=0}^{s-1}\sum _{j=0}^{t-1}iP_{ij},
$$
$$\mu _{j}=\sum _{i=0}^{s-1}\sum _{j=0}^{t-1}jP_{ij}.
$$

Similar to one-dimensional Otsu's method, the optimal threshold $(s,t)$ is obtained by maximizing $\operatorname {tr} (S_{b})$.


#### Algorithm

The $s$ and $t$ is obtained iteratively, which is similar with one-dimensional Otsu's method. The values of $s$ and $t$ are changed till we obtain the maximum of $\operatorname {tr} (S_{b})$, that is

Notice that for evaluating $\operatorname {tr} (S_{b})$, we can use a fast recursive dynamic programming algorithm to improve time performance. However, even with the dynamic programming approach, 2D Otsu's method still has large time complexity. Therefore, much research has been done to reduce the computation cost.

If summed area tables are used to build the 3 tables – sum over $P_{ij}$, sum over $iP_{ij}$, and sum over $jP_{ij}$ – then the runtime complexity is
$$\max {\big (}O(N_{\text{pixels}}),O(N_{\text{bins}}^{2}){\big )}
$$. Note that if only coarse resolution is needed in terms of threshold, $N_{\text{bins}}$ can be reduced.


#### MATLAB implementation

Function inputs and output:

hists is a $256\times 256$ 2D histogram of grayscale value and neighborhood average grayscale value pair.

total is the number of pairs in the given image, determined by the number of the bins of 2D histogram at each direction.

threshold is the threshold obtained.


### A variation for unbalanced images

When the levels of gray of the classes of the image can be considered as normal distributions but with unequal size and/or unequal variances, assumptions for the Otsu algorithm are not met. The Kittler–Illingworth algorithm (also known as "minimum-error thresholding") is a variation of Otsu's method to handle such cases. There are several ways to mathematically describe this algorithm. One of them is to consider that for each threshold being tested, the parameters of the normal distributions in the resulting binary image are estimated by maximum likelihood estimation given the data.

While this algorithm could seem superior to Otsu's method, it introduces nuisance parameters to be estimated, and this can result in the algorithm being over-parametrized and thus unstable. In many cases where the assumptions from Otsu's method seem at least partially valid, it may be preferable to favor Otsu's method over the Kittler–Illingworth algorithm, following Occam's razor.


### Iterative triclass thresholding based on the Otsu's method

One limitation of the Otsu’s method is that it cannot segment weak objects, as the method searches for a single threshold to separate an image into two classes, namely, foreground and background, in one shot. Because the Otsu’s method looks to segment an image with one threshold, it tends to bias toward the class with the large variance. Iterative triclass thresholding algorithm is a variation of the Otsu’s method to circumvent this limitation. Given an image, at the first iteration, the triclass thresholding algorithm calculates a threshold $\eta _{1}$ using the Otsu’s method. Based on threshold $\eta _{1}$, the algorithm calculates mean $\mu _{\text{upper}}^{[1]}$ of pixels above $\eta _{1}$ and mean $\mu _{\text{lower}}^{[1]}$ of pixels below $\eta _{1}$. Then the algorithm tentatively separates the image into three classes (hence the name triclass), with the pixels above the upper mean $\mu _{\text{upper}}^{[1]}$ designated as the temporary foreground $F$ class and pixels below the lower mean $\mu _{\text{lower}}^{[1]}$ designated as the temporary background $B$ class. Pixels fall between
$$[\mu _{\text{lower}}^{[1]},\mu _{\text{upper}}^{[1]}]
$$are denoted as a to-be-determined (TBD) region. This completes the first iteration of the algorithm. For the second iteration, the Otsu’s method is applied to the TBD region only to obtain a new threshold $\eta _{2}$. The algorithm then calculates the mean $\mu _{\text{upper}}^{[2]}$ of pixels in the TBD region that are above $\eta _{2}$ and the mean $\mu _{\text{lower}}^{[2]}$ of pixels in the TBD region that are below $\eta _{2}$. Pixels in the TBD region that are greater than the upper mean $\mu _{\text{upper}}^{[2]}$ are added to the temporary foreground $F$. And pixels in the TBD region that are less than the lower mean $\mu _{\text{lower}}^{[2]}$ are added to the temporary background $B$. Similarly, a new TBD region is obtained, which contains all the pixels falling between
$$[\mu _{\text{lower}}^{[2]},\mu _{\text{upper}}^{[2]}]
$$. This completes the second iteration. The algorithm then proceeds to the next iteration to process the new TBD region until it meets the stopping criterion. The criterion is that, when the difference between Otsu’s thresholds computed from two consecutive iterations is less than a small number, the iteration shall stop. For the last iteration, pixels above $\eta _{n}$ are assigned to the foreground class, and pixels below the threshold are assigned to the background class. At the end, all the temporary foreground pixels are combined to constitute the final foreground. All the temporary background pixels are combined to become the final background. In implementation, the algorithm involves no parameter except for the stopping criterion in terminating the iterations. By iteratively applying the Otsu’s method and gradually shrinking the TBD region for segmentation, the algorithm can obtain a result that preserves weak objects better than the standard Otsu’s method does.


## External links


- Implementation of Otsu's thresholding method as GIMP-plugin using Script-Fu (a Scheme-based language)
- Lecture notes on thresholding – covers the Otsu method
- A plugin for ImageJ using Otsu's method to do the threshold
- A full explanation of Otsu's method with a working example and Java implementation
- Implementation of Otsu's method in ITK
- Otsu Thresholding in C# – a straightforward C# implementation with explanation
- Otsu's method using MATLAB
- Otsu Thresholding with scikit-image in Python
