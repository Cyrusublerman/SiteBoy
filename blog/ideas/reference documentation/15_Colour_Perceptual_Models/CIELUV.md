# CIELUV

In colorimetry, the CIE 1976 L*, u*, v* color space, commonly known by its abbreviation CIELUV, is a color space adopted by the International Commission on Illumination (CIE) in 1976, as a simple-to-compute transformation of the 1931 CIE XYZ color space, which attempted perceptual uniformity. It is extensively used for applications such as computer graphics which deal with colored lights. Although additive mixtures of different colored lights will fall on a line in CIELUV's uniform chromaticity diagram (called the CIE 1976 UCS), such additive mixtures will not, contrary to popular belief, fall along a line in the CIELUV color space unless the mixtures are constant in lightness.


## Historical background

CIELUV is an Adams chromatic valence color space and is an update of the CIE 1964 (U*, V*, W*) color space (CIEUVW). The differences include a slightly modified lightness scale and a modified uniform chromaticity scale, in which one of the coordinates, v′, is 1.5 times as large as v in its 1960 predecessor. CIELUV and CIELAB were adopted simultaneously by the CIE when no clear consensus could be formed behind only one or the other of these two color spaces.

CIELUV uses Judd-type (translational) white point adaptation (in contrast with CIELAB, which uses a von Kries transform). This can produce useful results when working with a single illuminant, but can predict imaginary colors (i.e., outside the spectral locus) when attempting to use it as a chromatic adaptation transform. The translational adaptation transform used in CIELUV has also been shown to perform poorly in predicting corresponding colors.


## XYZ → CIELUV and CIELUV → XYZ conversions

By definition, 0 ≤ L* ≤ 100 .


### The forward transformation

CIELUV is based on CIEUVW and is another attempt to define an encoding with uniformity in the perceptibility of color differences. The non-linear relations for L*, u*, and v* are given below:


$${\begin{aligned}L^{*}&={\begin{cases}{\bigl (}{\tfrac {29}{3}}{\bigr )}^{3}Y/Y_{n},&Y/Y_{n}\leq {\bigl (}{\tfrac {6}{29}}{\bigr )}^{3},\\[3mu]116{\sqrt[{3}]{Y/Y_{n}}}-16,&Y/Y_{n}>{\bigl (}{\tfrac {6}{29}}{\bigr )}^{3},\end{cases}}\\[5mu]u^{*}&=13L^{*}\cdot (u^{\prime }-u_{n}^{\prime }),\\[3mu]v^{*}&=13L^{*}\cdot (v^{\prime }-v_{n}^{\prime }).\end{aligned}}
$$

The quantities u′n and v′n are the (u′, v′) chromaticity coordinates of a "specified white object" – which may be termed the white point – and Yn is its luminance. In reflection mode, this is often (but not always) taken as the (u′, v′) of the perfect reflecting diffuser under that illuminant. (For example, for the 2° observer and standard illuminant C, u′n = 0.2009, v′n = 0.4610.) Equations for u′ and v′ are given below:


$${\begin{alignedat}{3}u^{\prime }&={\frac {4X}{X+15Y+3Z}}&&={\frac {4x}{-2x+12y+3}},\\[5mu]v^{\prime }&={\frac {9Y}{X+15Y+3Z}}&&={\frac {9y}{-2x+12y+3}}.\end{alignedat}}
$$


### The reverse transformation

The transformation from (u′, v′) to (x, y) is:


$${\begin{aligned}x&={\frac {9u^{\prime }}{6u^{\prime }-16v^{\prime }+12}}\\[5mu]y&={\frac {4v^{\prime }}{6u^{\prime }-16v^{\prime }+12}}\end{aligned}}
$$

The transformation from CIELUV to XYZ is performed as follows:


$${\begin{aligned}u^{\prime }&={\tfrac {1}{13}}(u^{*}/L^{*})+u_{n}^{\prime },\\[3mu]v^{\prime }&={\tfrac {1}{13}}(v^{*}/L^{*})+v_{n}^{\prime },\\[5mu]Y&={\begin{cases}{\bigl (}{\frac {3}{29}}{\bigr )}^{3}L^{*}~\!Y_{n},&L^{*}\leq 8,\\[3mu]{\bigl (}{\tfrac {1}{116}}(L^{*}+16){\bigr )}^{3}\,Y_{n},&L^{*}>8,\end{cases}}\\[5mu]X&={\frac {9u^{\prime }}{4v^{\prime }}}Y,\\[5mu]Z&={\frac {12-3u^{\prime }-20v^{\prime }}{4v^{\prime }}}Y.\end{aligned}}
$$


## Cylindrical representation (CIELCh)

CIELChuv, or HCL color space (hue–chroma–luminance) is increasingly seen in the information visualization community as a way to help with presenting data without the bias implicit in using varying saturation.

The cylindrical version of CIELUV is known as CIELChuv, or CIELChuv, CIELCh(uv) or CIEHLCuv, where C*uv is the chroma and huv is the hue:


$$C_{uv}^{*}=\operatorname {hypot} (u^{*},v^{*})={\sqrt {(u^{*})^{2}+(v^{*})^{2}}},
$$

$h_{uv}=\operatorname {atan2} (v^{*},u^{*}),$

where atan2 function, a "two-argument arctangent", computes the polar angle from a Cartesian coordinate pair.

Furthermore, the saturation correlate can be defined as


$$s_{uv}={\frac {C^{*}}{L^{*}}}=13{\sqrt {(u'-u'_{n})^{2}+(v'-v'_{n})^{2}}}.
$$

Similar correlates of chroma and hue, but not saturation, exist for CIELAB. See Colorfulness for more discussion on saturation.


## Color and hue difference

The color difference can be calculated using the Euclidean distance of the (L*, u*, v*) coordinates. It follows that a chromaticity distance of ${\sqrt {(\Delta u')^{2}+(\Delta v')^{2}}}=1/13$ corresponds to the same ΔE*uv as a lightness difference of ΔL* = 1, in direct analogy to CIEUVW.

The Euclidean metric can also be used in CIELCh, with that component of ΔE*uv attributable to difference in hue as ΔH* = √C*1C*2 2 sin (Δh/2), where Δh = h2 − h1.


## See also


- YUV
- CIELAB color space


## External links


- Chromaticity diagrams, including the CIE 1931, CIE 1960, CIE 1976
- Colorlab MATLAB toolbox for color science computation and accurate color reproduction (by Jesus Malo and Maria Jose Luque, Universitat de Valencia). It includes CIE standard tristimulus colorimetry and transformations to a number of non-linear color appearance models (CIELAB, CIE CAM, etc.).
