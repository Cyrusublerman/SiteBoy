# Laplacian of Gaussian

In computer vision and image processing, blob detection methods are aimed at detecting regions in a digital image that differ in properties, such as brightness or color, compared to surrounding regions. Informally, a blob is a region of an image in which some properties are constant or approximately constant; all the points in a blob can be considered in some sense to be similar to each other. The most common method for blob detection is by using convolution.

Given some property of interest expressed as a function of position on the image, there are two main classes of blob detectors: (i) differential methods, which are based on derivatives of the function with respect to position, and (ii) methods based on local extrema, which are based on finding the local maxima and minima of the function. With the more recent terminology used in the field, these detectors can also be referred to as interest point operators, or alternatively interest region operators (see also interest point detection and corner detection).

There are several motivations for studying and developing blob detectors. One main reason is to provide complementary information about regions, which is not obtained from edge detectors or corner detectors. In early work in the area, blob detection was used to obtain regions of interest for further processing. These regions could signal the presence of objects or parts of objects in the image domain with application to object recognition and/or object tracking. In other domains, such as histogram analysis, blob descriptors can also be used for peak detection with application to segmentation. Another common use of blob descriptors is as main primitives for texture analysis and texture recognition. In more recent work, blob descriptors have found increasingly popular use as interest points for wide baseline stereo matching and to signal the presence of informative image features for appearance-based object recognition based on local image statistics. There is also the related notion of ridge detection to signal the presence of elongated objects.


## The Laplacian of Gaussian

One of the first and also most common blob detectors is based on the Laplacian of the Gaussian (LoG). Given an input image $f(x,y)$, this image is convolved by a Gaussian kernel


$$g(x,y,t)={\frac {1}{2\pi t}}e^{-{\frac {x^{2}+y^{2}}{2t}}}
$$

at a certain scale $t$ to give a scale space representation $L(x,y;t)\ =g(x,y,t)*f(x,y)$. Then, the result of applying the Laplacian operator

$\nabla ^{2}L=L_{xx}+L_{yy}$

is computed, which usually results in strong positive responses for dark blobs of radius ${\textstyle r^{2}=2t}$ (for a two-dimensional image, ${\textstyle r^{2}=dt}$ for a ${\textstyle d}$-dimensional image) and strong negative responses for bright blobs of similar size. A main problem when applying this operator at a single scale, however, is that the operator response is strongly dependent on the relationship between the size of the blob structures in the image domain and the size of the Gaussian kernel used for pre-smoothing. In order to automatically capture blobs of different (unknown) size in the image domain, a multi-scale approach is therefore necessary.

A straightforward way to obtain a multi-scale blob detector with automatic scale selection is to consider the scale-normalized Laplacian operator

$\nabla _{\mathrm {norm} }^{2}L=t\,(L_{xx}+L_{yy})$

and to detect scale-space maxima/minima, that are points that are simultaneously local maxima/minima of $\nabla _{\mathrm {norm} }^{2}L$ with respect to both space and scale (Lindeberg 1994, 1998). Thus, given a discrete two-dimensional input image $f(x,y)$ a three-dimensional discrete scale-space volume $L(x,y,t)$ is computed and a point is regarded as a bright (dark) blob if the value at this point is greater (smaller) than the value in all its 26 neighbours. Thus, simultaneous selection of interest points $({\hat {x}},{\hat {y}})$ and scales ${\hat {t}}$ is performed according to


$$({\hat {x}},{\hat {y}};{\hat {t}})=\operatorname {argmaxminlocal} _{(x,y;t)}((\nabla _{\mathrm {norm} }^{2}L)(x,y;t))
$$.

Note that this notion of blob provides a concise and mathematically precise operational definition of the notion of "blob", which directly leads to an efficient and robust algorithm for blob detection. Some basic properties of blobs defined from scale-space maxima of the normalized Laplacian operator are that the responses are covariant with translations, rotations and rescalings in the image domain. Thus, if a scale-space maximum is assumed at a point $(x_{0},y_{0};t_{0})$ then under a rescaling of the image by a scale factor $s$, there will be a scale-space maximum at $\left(sx_{0},sy_{0};s^{2}t_{0}\right)$ in the rescaled image (Lindeberg 1998). This in practice highly useful property implies that besides the specific topic of Laplacian blob detection, local maxima/minima of the scale-normalized Laplacian are also used for scale selection in other contexts, such as in corner detection, scale-adaptive feature tracking (Bretzner and Lindeberg 1998), in the scale-invariant feature transform (Lowe 2004) as well as other image descriptors for image matching and object recognition.

The scale selection properties of the Laplacian operator and other closely scale-space interest point detectors are analyzed in detail in (Lindeberg 2013a). In (Lindeberg 2013b, 2015) it is shown that there exist other scale-space interest point detectors, such as the determinant of the Hessian operator, that perform better than Laplacian operator or its difference-of-Gaussians approximation for image-based matching using local SIFT-like image descriptors.


## The difference of Gaussians approach

From the fact that the scale space representation $L(x,y,t)$ satisfies the diffusion equation


$$\partial _{t}L={\frac {1}{2}}\nabla ^{2}L
$$

it follows that the Laplacian of the Gaussian operator $\nabla ^{2}L(x,y,t)$ can also be computed as the limit case of the difference between two Gaussian smoothed images (scale space representations)


$$\nabla _{\mathrm {norm} }^{2}L(x,y;t)\approx {\frac {t}{\Delta t}}\left(L(x,y;t+\Delta t)-L(x,y;t)\right)
$$.

In the computer vision literature, this approach is referred to as the difference of Gaussians (DoG) approach. Besides minor technicalities, however, this operator is in essence similar to the Laplacian and can be seen as an approximation of the Laplacian operator. In a similar fashion as for the Laplacian blob detector, blobs can be detected from scale-space extrema of differences of Gaussians—see (Lindeberg 2012, 2015) for the explicit relation between the difference-of-Gaussian operator and the scale-normalized Laplacian operator. This approach is for instance used in the scale-invariant feature transform (SIFT) algorithm—see Lowe (2004).


## The determinant of the Hessian

By considering the scale-normalized determinant of the Hessian, also referred to as the Monge–Ampère operator,


$$\det H_{\mathrm {norm} }L=t^{2}\left(L_{xx}L_{yy}-L_{xy}^{2}\right)
$$

where $HL$ denotes the Hessian matrix of the scale-space representation $L$ and then detecting scale-space maxima of this operator one obtains another straightforward differential blob detector with automatic scale selection which also responds to saddles (Lindeberg 1994, 1998)


$$({\hat {x}},{\hat {y}};{\hat {t}})=\operatorname {argmaxlocal} _{(x,y;t)}((\det H_{\mathrm {norm} }L)(x,y;t))
$$.

The blob points $({\hat {x}},{\hat {y}})$ and scales ${\hat {t}}$ are also defined from an operational differential geometric definitions that leads to blob descriptors that are covariant with translations, rotations and rescalings in the image domain. In terms of scale selection, blobs defined from scale-space extrema of the determinant of the Hessian (DoH) also have slightly better scale selection properties under non-Euclidean affine transformations than the more commonly used Laplacian operator (Lindeberg 1994, 1998, 2015). In simplified form, the scale-normalized determinant of the Hessian computed from Haar wavelets is used as the basic interest point operator in the SURF descriptor (Bay et al. 2006) for image matching and object recognition.

A detailed analysis of the selection properties of the determinant of the Hessian operator and other closely scale-space interest point detectors is given in (Lindeberg 2013a) showing that the determinant of the Hessian operator has better scale selection properties under affine image transformations than the Laplacian operator. In (Lindeberg 2013b, 2015) it is shown that the determinant of the Hessian operator performs significantly better than the Laplacian operator or its difference-of-Gaussians approximation, as well as better than the Harris or Harris-Laplace operators, for image-based matching using local SIFT-like or SURF-like image descriptors, leading to higher efficiency values and lower 1-precision scores.


## The hybrid Laplacian and determinant of the Hessian operator (Hessian-Laplace)

A hybrid operator between the Laplacian and the determinant of the Hessian blob detectors has also been proposed, where spatial selection is done by the determinant of the Hessian and scale selection is performed with the scale-normalized Laplacian (Mikolajczyk and Schmid 2004):


$$({\hat {x}},{\hat {y}})=\operatorname {argmaxlocal} _{(x,y)}((\det HL)(x,y;t))
$$


$${\hat {t}}=\operatorname {argmaxminlocal} _{t}((\nabla _{\mathrm {norm} }^{2}L)({\hat {x}},{\hat {y}};t))
$$

This operator has been used for image matching, object recognition as well as texture analysis.


## Affine-adapted differential blob detectors

The blob descriptors obtained from these blob detectors with automatic scale selection are invariant to translations, rotations and uniform rescalings in the spatial domain. The images that constitute the input to a computer vision system are, however, also subject to perspective distortions. To obtain blob descriptors that are more robust to perspective transformations, a natural approach is to devise a blob detector that is invariant to affine transformations. In practice, affine invariant interest points can be obtained by applying affine shape adaptation to a blob descriptor, where the shape of the smoothing kernel is iteratively warped to match the local image structure around the blob, or equivalently a local image patch is iteratively warped while the shape of the smoothing kernel remains rotationally symmetric (Lindeberg and Garding 1997; Baumberg 2000; Mikolajczyk and Schmid 2004, Lindeberg 2008). In this way, we can define affine-adapted versions of the Laplacian/Difference of Gaussian operator, the determinant of the Hessian and the Hessian-Laplace operator (see also Harris-Affine and Hessian-Affine).


## Spatio-temporal blob detectors

The determinant of the Hessian operator has been extended to joint space-time by Willems et al. and Lindeberg, leading to the following scale-normalized differential expression:


$$\det(H_{(x,y,t),\mathrm {norm} }L)=s^{2\gamma _{s}}\tau ^{\gamma _{\tau }}\left(L_{xx}L_{yy}L_{tt}+2L_{xy}L_{xt}L_{yt}-L_{xx}L_{yt}^{2}-L_{yy}L_{xt}^{2}-L_{tt}L_{xy}^{2}\right).
$$

In the work by Willems et al., a simpler expression corresponding to $\gamma _{s}=1$ and $\gamma _{\tau }=1$ was used. In Lindeberg, it was shown that $\gamma _{s}=5/4$ and $\gamma _{\tau }=5/4$ implies better scale selection properties in the sense that the selected scale levels obtained from a spatio-temporal Gaussian blob with spatial extent $s=s_{0}$ and temporal extent $\tau =\tau _{0}$ will perfectly match the spatial extent and the temporal duration of the blob, with scale selection performed by detecting spatio-temporal scale-space extrema of the differential expression.

The Laplacian operator has been extended to spatio-temporal video data by Lindeberg, leading to the following two spatio-temporal operators, which also constitute models of receptive fields of non-lagged vs. lagged neurons in the LGN:


$$\partial _{t,\mathrm {norm} }(\nabla _{(x,y),\mathrm {norm} }^{2}L)=s^{\gamma _{s}}\tau ^{\gamma _{\tau }/2}(L_{xxt}+L_{yyt}),
$$


$$\partial _{tt,\mathrm {norm} }(\nabla _{(x,y),\mathrm {norm} }^{2}L)=s^{\gamma _{s}}\tau ^{\gamma _{\tau }}(L_{xxtt}+L_{yytt}).
$$

For the first operator, scale selection properties call for using $\gamma _{s}=1$ and $\gamma _{\tau }=1/2$, if we want this operator to assume its maximum value over spatio-temporal scales at a spatio-temporal scale level reflecting the spatial extent and the temporal duration of an onset Gaussian blob. For the second operator, scale selection properties call for using $\gamma _{s}=1$ and $\gamma _{\tau }=3/4$, if we want this operator to assume its maximum value over spatio-temporal scales at a spatio-temporal scale level reflecting the spatial extent and the temporal duration of a blinking Gaussian blob.


## Grey-level blobs, grey-level blob trees and scale-space blobs

A natural approach to detect blobs is to associate a bright (dark) blob with each local maximum (minimum) in the intensity landscape. A main problem with such an approach, however, is that local extrema are very sensitive to noise. To address this problem, Lindeberg (1993, 1994) studied the problem of detecting local maxima with extent at multiple scales in scale space. A region with spatial extent defined from a watershed analogy was associated with each local maximum, as well a local contrast defined from a so-called delimiting saddle point. A local extremum with extent defined in this way was referred to as a grey-level blob. Moreover, by proceeding with the watershed analogy beyond the delimiting saddle point, a grey-level blob tree was defined to capture the nested topological structure of level sets in the intensity landscape, in a way that is invariant to affine deformations in the image domain and monotone intensity transformations. By studying how these structures evolve with increasing scales, the notion of scale-space blobs was introduced. Beyond local contrast and extent, these scale-space blobs also measured how stable image structures are in scale-space, by measuring their scale-space lifetime.

It was proposed that regions of interest and scale descriptors obtained in this way, with associated scale levels defined from the scales at which normalized measures of blob strength assumed their maxima over scales could be used for guiding other early visual processing. An early prototype of simplified vision systems was developed where such regions of interest and scale descriptors were used for directing the focus-of-attention of an active vision system. While the specific technique that was used in these prototypes can be substantially improved with the current knowledge in computer vision, the overall general approach is still valid, for example in the way that local extrema over scales of the scale-normalized Laplacian operator are nowadays used for providing scale information to other visual processes.


### Lindeberg's watershed-based grey-level blob detection algorithm

For the purpose of detecting grey-level blobs (local extrema with extent) from a watershed analogy, Lindeberg developed an algorithm based on pre-sorting the pixels, alternatively connected regions having the same intensity, in decreasing order of the intensity values. Then, comparisons were made between nearest neighbours of either pixels or connected regions.

For simplicity, consider the case of detecting bright grey-level blobs and let the notation "higher neighbour" stand for "neighbour pixel having a higher grey-level value". Then, at any stage in the algorithm (carried out in decreasing order of intensity values) is based on the following classification rules:


1. If a region has no higher neighbour, then it is a local maximum and will be the seed of a blob. Set a flag which allows the blob to grow.
2. Else, if it has at least one higher neighbour, which is background, then it cannot be part of any blob and must be background.
3. Else, if it has more than one higher neighbour and if those higher neighbours are parts of different blobs, then it cannot be a part of any blob, and must be background. If any of the higher neighbors are still allowed to grow, clear their flag which allows them to grow.
4. Else, it has one or more higher neighbours, which are all parts of the same blob. If that blob is still allowed to grow then the current region should be included as a part of that blob. Otherwise the region should be set to background.

Compared to other watershed methods, the flooding in this algorithm stops once the intensity level falls below the intensity value of the so-called delimiting saddle point associated with the local maximum. However, it is rather straightforward to extend this approach to other types of watershed constructions. For example, by proceeding beyond the first delimiting saddle point a "grey-level blob tree" can be constructed. Moreover, the grey-level blob detection method was embedded in a scale space representation and performed at all levels of scale, resulting in a representation called the scale-space primal sketch.

This algorithm with its applications in computer vision is described in more detail in Lindeberg's thesis as well as the monograph on scale-space theory partially based on that work. Earlier presentations of this algorithm can also be found in . More detailed treatments of applications of grey-level blob detection and the scale-space primal sketch to computer vision and medical image analysis are given in .


## Maximally stable extremal regions (MSER)

Matas et al. (2002) were interested in defining image descriptors that are robust under perspective transformations. They studied level sets in the intensity landscape and measured how stable these were along the intensity dimension. Based on this idea, they defined a notion of maximally stable extremal regions and showed how these image descriptors can be used as image features for stereo matching.

There are close relations between this notion and the above-mentioned notion of grey-level blob tree. The maximally stable extremal regions can be seen as making a specific subset of the grey-level blob tree explicit for further processing.


## See also


- Blob extraction
- Corner detection
- Affine shape adaptation
- Scale space
- Ridge detection
- Interest point detection
- Feature detection (computer vision)
- Harris affine region detector
- Hessian affine region detector
- PCBR


## Further reading


- H. Bay; T. Tuytelaars & L. van Gool (2006). "SURF: Speeded Up Robust Features". Proceedings of the 9th European Conference on Computer Vision, Springer LNCS volume 3951, part 1. pp. 404–417.
- L. Bretzner & T. Lindeberg (1998). "Feature Tracking with Automatic Selection of Spatial Scales" (abstract page). Computer Vision and Image Understanding. 71 (3): 385–392. doi:10.1006/cviu.1998.0650.
- T. Lindeberg (1993). "Detecting Salient Blob-Like Image Structures and Their Scales with a Scale-Space Primal Sketch: A Method for Focus-of-Attention" (abstract page). International Journal of Computer Vision. 11 (3): 283–318. doi:10.1007/BF01469346. S2CID 11998035.
- T. Lindeberg (1994). Scale-Space Theory in Computer Vision. Springer. ISBN 978-0-7923-9418-1.
- T. Lindeberg (1998). "Feature detection with automatic scale selection" (abstract page). International Journal of Computer Vision. 30 (2): 77–116. doi:10.1023/A:1008045108935. S2CID 723210.
- Lindeberg, T.; Garding, J. (1997). "Shape-adapted smoothing in estimation of 3-{{#parsoidfragment:0}}{D} depth cues from affine distortions of local 2-{{#parsoidfragment:1}}{D} structure". Image and Vision Computing. 15 (6): 415–434. doi:10.1016/S0262-8856(97)01144-X.
- Lindeberg, T. (2008). "Scale-space". In Wah, Benjamin (ed.). Encyclopedia of Computer Science and Engineering. Vol. IV. John Wiley and Sons. pp. 2495–2504. doi:10.1002/9780470050118.ecse609. ISBN 978-0-470-05011-8.
- D. G. Lowe (2004). "Distinctive Image Features from Scale-Invariant Keypoints". International Journal of Computer Vision. 60 (2): 91–110. CiteSeerX 10.1.1.73.2924. doi:10.1023/B:VISI.0000029664.99615.94. S2CID 221242327.
- J. Matas; O. Chum; M. Urban & T. Pajdla (2002). "Robust wide baseline stereo from maximally stable extremum regions" (PDF). British Machine Vision Conference. pp. 384–393.
- K. Mikolajczyk; C. Schmid (2004). "Scale and affine invariant interest point detectors" (PDF). International Journal of Computer Vision. 60 (1): 63–86. doi:10.1023/B:VISI.0000027790.02288.f2. S2CID 1704741.
