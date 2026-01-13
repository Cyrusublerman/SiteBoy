# Color difference

In color science, color difference or color distance is the separation between two colors. This metric allows quantified examination of a notion that formerly could only be described with adjectives. Quantification of these properties is of great importance to those whose work is color-critical. Common definitions make use of the Euclidean distance in a device-independent color space.


## Euclidean


### sRGB

As most definitions of color difference are distances within a color space, the standard means of determining distances is the Euclidean distance. If one presently has an RGB (red, green, blue) tuple and wishes to find the color difference, computationally one of the easiest is to consider R, G, B linear dimensions defining the color space.

A very simple example can be given between the two colors with RGB values (0, 64, 0) ( ) and (255, 64, 0) ( ): their distance is 255. Going from there to (255, 64, 128) ( ) is a distance of 128.

When we wish to calculate distance from the first point to the third point (i.e. changing more than one of the color values), we can do this:


$${\text{distance}}={\sqrt {(R_{2}-R_{1})^{2}+(G_{2}-G_{1})^{2}+(B_{2}-B_{1})^{2}}}.
$$

When the result should be computationally simple as well, it is often acceptable to remove the square root and simply use


$${\text{distance}}^{2}=(R_{2}-R_{1})^{2}+(G_{2}-G_{1})^{2}+(B_{2}-B_{1})^{2}.
$$

This will work in cases when a single color is to be compared to a single color and the need is to simply know whether a distance is greater. If these squared color distances are summed, such a metric effectively becomes the variance of the color distances.

There have been many attempts to weigh RGB values, however these are demonstrably worse at color determinations and are properly the contributions to the brightness of these colors, rather than to the degree to which human vision has less tolerance for these colors. The closer approximations would be more properly (for non-linear sRGB, using a color range of 0–255):
$${\begin{cases}{\sqrt {2\Delta R^{2}+4\Delta G^{2}+3\Delta B^{2}}},&{\bar {R}}<128,\\{\sqrt {3\Delta R^{2}+4\Delta G^{2}+2\Delta B^{2}}}&{\text{otherwise}},\end{cases}}
$$

where:
$${\begin{aligned}\Delta R&=R_{1}-R_{2},\\\Delta G&=G_{1}-G_{2},\\\Delta B&=B_{1}-B_{2},\\{\bar {R}}&={\frac {1}{2}}(R_{1}+R_{2}).\end{aligned}}
$$

One of the better low-cost approximations, sometimes called "redmean", combines the two cases smoothly:


$${\begin{aligned}{\bar {r}}&={\frac {1}{2}}(R_{1}+R_{2}),\\\Delta C&={\sqrt {\left(2+{\frac {\bar {r}}{256}}\right)\Delta R^{2}+4\Delta G^{2}+\left(2+{\frac {255-{\bar {r}}}{256}}\right)\Delta B^{2}}}.\end{aligned}}
$$

There are a number of color distance formulae that attempt to use color spaces like HSV or HSL with the hue represented as a circle, placing the various colors within a three-dimensional space of either a cylinder or cone, but most of these are just modifications of RGB; without accounting for differences in human color perception, they will tend to be on par with a simple Euclidean metric.


### Uniform color spaces

CIELAB and CIELUV are relatively perceptually-uniform color spaces and they have been used as spaces for Euclidean measures of color difference. The CIELAB version is known as CIE76. However, the non-uniformity of these spaces were later discovered, leading to the creation of more complex formulae.

A uniform color space is supposed to make a simple measure of color difference, usually Euclidean, "just work". Color spaces that improve on this issue include CAM02-UCS, CAM16-UCS, and Jzazbz.


#### Rec. ITU-R BT.2124 or ΔEITP

In 2019 a new standard for WCG and HDR was introduced, since CIEDE2000 was not adequate for it: CIEDE2000 is not reliable below 1 cd/m and has not been verified above 100 cd/m; in addition, even in BT.709 blue primary CIEDE2000 is underpredicting the error. ΔEITP is scaled so that a value of 1 indicates the potential of a just noticeable color difference. The ΔEITP color difference metric is derived from display referenced ICTCP, but XYZ is also available in the standard. The formula is a simply scaled Euclidean distance:


$$\Delta E_{\text{ITP}}=720{\sqrt {(I_{1}-I_{2})^{2}+(T_{1}-T_{2})^{2}+(P_{1}-P_{2})^{2}}},
$$

where the components of this "ITP" is given by

I = I,

T = 0.5 CT,

P = CP.


### Other geometric constructions

The Euclidean measure is known to work poorly on large color distances (i.e. more than 10 units in most systems). On CIELAB, a hybrid approach where a taxicab distance is used between the lightness and the chroma plane,
$${\textstyle \Delta E_{\text{HyAB}}={\sqrt {(a_{2}-a_{1})^{2}+(b_{2}-b_{1})^{2}}}+\left|L_{2}-L_{1}\right|}
$$, is shown to work better than euclidean and CIEDE2000.


## CIELAB ΔE*

The International Commission on Illumination (CIE) calls their distance metric ΔE* (also inaccurately called dE*, dE, or "Delta E") where delta is a Greek letter often used to denote difference, and E stands for Empfindung; German for "sensation". Use of this term can be traced back to Hermann von Helmholtz and Ewald Hering.

Perceptual non-uniformities in the underlying CIELAB color space have led to the CIE refining their definition over the years, leading to the superior (as recommended by the CIE) 1994 and 2000 formulas. These non-uniformities are important because the human eye is more sensitive to certain colors than others. CIELAB metric is used to define color tolerance of CMYK solids. A good metric should take this into account in order for the notion of a "just noticeable difference" (JND) to have meaning. Otherwise, a certain ΔE may be insignificant between two colors in one part of the color space while being significant in some other part.

All ΔE* formulae are originally designed to have the difference of 1.0 stand for a JND. This convention is generally followed by other perceptual distance functions such as the aforementioned ΔEITP. However, further experimentation may invalidate this design assumption, the revision of CIE76 ΔEab JND to 2.3 being an example.


### CIE76

The CIE 1976 color difference formula is the first formula that related a measured color difference to a known set of CIELAB coordinates. This formula has been succeeded by the 1994 and 2000 formulas because the CIELAB space turned out to be not as perceptually uniform as intended, especially in the saturated regions. This means that this formula rates these colors too highly as opposed to other colors.

Given two colors in CIELAB color space, ${\textstyle ({L_{1}^{*}},{a_{1}^{*}},{b_{1}^{*}})}$ and ${\textstyle ({L_{2}^{*}},{a_{2}^{*}},{b_{2}^{*}})}$, the CIE76 color difference formula is defined as:


$$\Delta E_{ab}^{*}={\sqrt {(L_{2}^{*}-L_{1}^{*})^{2}+(a_{2}^{*}-a_{1}^{*})^{2}+(b_{2}^{*}-b_{1}^{*})^{2}}}.
$$

${\textstyle \Delta E_{ab}^{*}\approx 2.3}$ corresponds to a JND (just noticeable difference).


### CMC l:c (1984)

In 1984, the Colour Measurement Committee of the Society of Dyers and Colourists defined a difference measure based on the CIE L*C*h color model, an alternative representation of L*a*b* coordinates. Named after the developing committee, their metric is called CMC l:c. The quasimetric (i.e. it violates symmetry: parameter T is based on the hue of the reference $h_{1}$ alone) has two parameters: lightness (l) and chroma (c), allowing the users to weight the difference based on the ratio of l:c that is deemed appropriate for the application. Commonly used values are 2:1 for acceptability and 1:1 for the threshold of imperceptibility.

The distance of a color ${\textstyle (L_{2}^{*},C_{2}^{*},h_{2})}$ to a reference ${\textstyle (L_{1}^{*},C_{1}^{*},h_{1})}$ is:


$$\Delta E_{CMC}^{*}={\sqrt {\left({\frac {L_{2}^{*}-L_{1}^{*}}{l\times S_{L}}}\right)^{2}+\left({\frac {C_{2}^{*}-C_{1}^{*}}{c\times S_{C}}}\right)^{2}+\left({\frac {\Delta H_{ab}^{*}}{S_{H}}}\right)^{2}}}
$$


$$S_{L}={\begin{cases}0.511&L_{1}^{*}<16\\{\frac {0.040975L_{1}^{*}}{1+0.01765L_{1}^{*}}}&L_{1}^{*}\geq 16\end{cases}}\quad S_{C}={\frac {0.0638C_{1}^{*}}{1+0.0131C_{1}^{*}}}+0.638\quad S_{H}=S_{C}(FT+1-F)
$$


$$F={\sqrt {\frac {C_{1}^{*^{4}}}{C_{1}^{*^{4}}+1900}}}\quad T={\begin{cases}0.56+|0.2\cos(h_{1}+168^{\circ })|&164^{\circ }\leq h_{1}\leq 345^{\circ }\\0.36+|0.4\cos(h_{1}+35^{\circ })|&{\mbox{otherwise}}\end{cases}}
$$

CMC l:c is designed to be used with D65 and the CIE Supplementary Observer.


### CIE94

The CIE 1976 color difference definition was extended to address perceptual non-uniformities, while retaining the CIELAB color space, by the introduction of application-specific parametric weighting factors kL, kC and kH, and functions SL, SC, and SH derived from an automotive paint test's tolerance data.

As with the CMC I:c, ΔE (1994) is defined in the L*C*h* color space and likewise violates symmetry, therefore defining a quasimetric. Given a reference color $(L_{1}^{*},a_{1}^{*},b_{1}^{*})$ and another color $(L_{2}^{*},a_{2}^{*},b_{2}^{*})$, the difference is


$$\Delta E_{94}^{*}={\sqrt {\left({\frac {\Delta L^{*}}{k_{L}S_{L}}}\right)^{2}+\left({\frac {\Delta C^{*}}{k_{C}S_{C}}}\right)^{2}+\left({\frac {\Delta H^{*}}{k_{H}S_{H}}}\right)^{2}}},
$$


$${\begin{aligned}\Delta L^{*}&=L_{1}^{*}-L_{2}^{*},\\C_{1}^{*}&={\sqrt {{a_{1}^{*}}^{2}+{b_{1}^{*}}^{2}}},\\C_{2}^{*}&={\sqrt {{a_{2}^{*}}^{2}+{b_{2}^{*}}^{2}}},\\\Delta C^{*}&=C_{1}^{*}-C_{2}^{*},\\\Delta H^{*}&={\sqrt {{\Delta E_{ab}^{*}}^{2}-{\Delta L^{*}}^{2}-{\Delta C^{*}}^{2}}}={\sqrt {{\Delta a^{*}}^{2}+{\Delta b^{*}}^{2}-{\Delta C^{*}}^{2}}},\\\Delta a^{*}&=a_{1}^{*}-a_{2}^{*},\\\Delta b^{*}&=b_{1}^{*}-b_{2}^{*},\\S_{L}&=1,\\S_{C}&=1+K_{1}C_{1}^{*},\\S_{H}&=1+K_{2}C_{1}^{*},\\\end{aligned}}
$$

and where kC and kH are usually both set to unity, and the parametric weighting factors kL, K1 and K2 depend on the application:

graphic arts textiles k L {\displaystyle k_{L}} 1 2 K 1 {\displaystyle K_{1}} 0.045 0.048 K 2 {\displaystyle K_{2}} 0.015 0.014

Geometrically, the quantity $\Delta H_{ab}^{*}$ corresponds to the arithmetic mean of the chord lengths of the equal chroma circles of the two colors.


### CIEDE2000

Since the 1994 definition did not adequately resolve the perceptual uniformity issue, the CIE refined their definition with the CIEDE2000 formula published in 2001, adding five corrections:


- A hue rotation term (RT), to deal with the problematic blue region (hue angles in the neighborhood of 275°):
- Compensation for neutral colors (the primed values in the L*C*h differences)
- Compensation for lightness (SL)
- Compensation for chroma (SC)
- Compensation for hue (SH)


$$\Delta E_{00}^{*}={\sqrt {\left({\frac {\Delta L'}{k_{L}S_{L}}}\right)^{2}+\left({\frac {\Delta C'}{k_{C}S_{C}}}\right)^{2}+\left({\frac {\Delta H'}{k_{H}S_{H}}}\right)^{2}+R_{T}{\frac {\Delta C'}{k_{C}S_{C}}}{\frac {\Delta H'}{k_{H}S_{H}}}}}
$$

The formulae below should use degrees rather than radians; the issue is significant for RT.

The parametric weighting factors kL, kC, and kH are usually set to unity.

$\Delta L^{\prime }=L_{2}^{*}-L_{1}^{*}$


$${\bar {L}}={\frac {L_{1}^{*}+L_{2}^{*}}{2}}\quad {\bar {C}}={\frac {C_{1}^{*}+C_{2}^{*}}{2}}\quad {\mbox{where }}C_{1}^{*}={\sqrt {{a_{1}^{*}}^{2}+{b_{1}^{*}}^{2}}},\quad C_{2}^{*}={\sqrt {{a_{2}^{*}}^{2}+{b_{2}^{*}}^{2}}},\quad
$$


$$a_{1}^{\prime }=a_{1}^{*}+{\frac {a_{1}^{*}}{2}}\left(1-{\sqrt {\frac {{\bar {C}}^{7}}{{\bar {C}}^{7}+25^{7}}}}\right)\quad a_{2}^{\prime }=a_{2}^{*}+{\frac {a_{2}^{*}}{2}}\left(1-{\sqrt {\frac {{\bar {C}}^{7}}{{\bar {C}}^{7}+25^{7}}}}\right)
$$


$${\bar {C}}^{\prime }={\frac {C_{1}^{\prime }+C_{2}^{\prime }}{2}}{\mbox{ and }}\Delta {C'}=C'_{2}-C'_{1}\quad {\mbox{where }}C_{1}^{\prime }={\sqrt {a_{1}^{'^{2}}+b_{1}^{*^{2}}}}\quad C_{2}^{\prime }={\sqrt {a_{2}^{'^{2}}+b_{2}^{*^{2}}}}\quad
$$


$$h_{1}^{\prime }={\text{atan2}}(b_{1}^{*},a_{1}^{\prime })\mod 360^{\circ },\quad h_{2}^{\prime }={\text{atan2}}(b_{2}^{*},a_{2}^{\prime })\mod 360^{\circ }
$$

The inverse tangent (tan) can be computed using a common library routine atan2(b, a′) which usually has a range from −π to π radians; color specifications are given in 0 to 360 degrees, so some adjustment is needed. The inverse tangent is indeterminate if both a′ and b are zero (which also means that the corresponding C′ is zero); in that case, set the hue angle to zero. See Sharma 2005, eqn. 7.

The example above expects the parameter order of atan2 to be atan2(y, x).


$$\Delta h'={\begin{cases}h_{2}^{\prime }-h_{1}^{\prime }&\left|h_{2}^{\prime }-h_{1}^{\prime }\right|\leq 180^{\circ }\\\left(h_{2}^{\prime }-h_{1}^{\prime }\right)-360^{\circ }&\left(h_{2}^{\prime }-h_{1}^{\prime }\right)>180^{\circ }\\\left(h_{2}^{\prime }-h_{1}^{\prime }\right)+360^{\circ }&\left(h_{2}^{\prime }-h_{1}^{\prime }\right)<-180^{\circ }\end{cases}}
$$

When either C′1 or C′2 is zero, then Δh′ is irrelevant and may be set to zero. See Sharma 2005, eqn. 10.


$$\Delta H^{\prime }=2{\sqrt {C_{1}^{\prime }C_{2}^{\prime }}}\sin \left({\frac {\Delta h^{\prime }}{2}}\right),\quad {\bar {h}}^{\prime }={\begin{cases}\left({\frac {h_{1}^{\prime }+h_{2}^{\prime }}{2}}\right)&\left|h_{1}^{\prime }-h_{2}^{\prime }\right|\leq 180^{\circ }\\\left({\frac {h_{1}^{\prime }+h_{2}^{\prime }+360^{\circ }}{2}}\right)&\left|h_{1}^{\prime }-h_{2}^{\prime }\right|>180^{\circ },h_{1}^{\prime }+h_{2}^{\prime }<360^{\circ }\\\left({\frac {h_{1}^{\prime }+h_{2}^{\prime }-360^{\circ }}{2}}\right)&\left|h_{1}^{\prime }-h_{2}^{\prime }\right|>180^{\circ },h_{1}^{\prime }+h_{2}^{\prime }\geq 360^{\circ }\\\end{cases}}
$$

When either C′1 or C′2 is zero, then h′ is h′1+h′2 (no divide by 2; essentially, if one angle is indeterminate, then use the other angle as the average; relies on indeterminate angle being set to zero). See Sharma 2005, eqn. 7 and p. 23 stating most implementations on the Internet at the time had "an error in the computation of average hue".


$$T=1-0.17\cos({\bar {h}}^{\prime }-30^{\circ })+0.24\cos(2{\bar {h}}^{\prime })+0.32\cos(3{\bar {h}}^{\prime }+6^{\circ })-0.20\cos(4{\bar {h}}^{\prime }-63^{\circ })
$$


$$S_{L}=1+{\frac {0.015\left({\bar {L}}-50\right)^{2}}{\sqrt {20+{\left({\bar {L}}-50\right)}^{2}}}}\quad S_{C}=1+0.045{\bar {C}}^{\prime }\quad S_{H}=1+0.015{\bar {C}}^{\prime }T
$$


$$R_{T}=-2{\sqrt {\frac {{\bar {C}}'^{7}}{{\bar {C}}'^{7}+25^{7}}}}\sin \left[60^{\circ }\cdot \exp \left(-\left[{\frac {{\bar {h}}'-275^{\circ }}{25^{\circ }}}\right]^{2}\right)\right]
$$

CIEDE 2000 is not mathematically continuous. The discontinuity stems from calculating the mean hue ${\textstyle \Delta H^{\prime }}$ and the hue difference ${\textstyle \Delta h'}$. The maximum discontinuity happens when the hues of two sample colors are about 180° apart, and is usually small relative to ΔE (less than 4%). There is also a negligible amount of discontinuity from hue rollover.

Sharma, Wu, and Dalal has provided some additional notes on the mathematics and implementation of the formula.


## Tolerance

Tolerancing concerns the question "What is a set of colors that are imperceptibly/acceptably close to a given reference?" If the distance measure is perceptually uniform, then the answer is simply "the set of points whose distance to the reference is less than the just-noticeable-difference (JND) threshold". This requires a perceptually uniform metric in order for the threshold to be constant throughout the gamut (range of colors). Otherwise, the threshold will be a function of the reference color—cumbersome as a practical guide.

In the CIE 1931 color space, for example, the tolerance contours are defined by the MacAdam ellipse, which holds L* (lightness) fixed. As can be observed on the adjacent diagram, the ellipses denoting the tolerance contours vary in size. It is partly this non-uniformity that led to the creation of CIELUV and CIELAB.

More generally, if the lightness is allowed to vary, then we find the tolerance set to be ellipsoidal. Increasing the weighting factor in the aforementioned distance expressions has the effect of increasing the size of the ellipsoid along the respective axis.

The definition of "acceptably close" also depends on the industrial requirements and practicality. In the automotive industry the ΔE*CMC is rather stringent, often less than 0.5 under D65/10. In printing, the typical limit is 2.0 under D50, though some processes require up to 5.0.


## See also


- CIELAB
- Color coding in data visualization


## Footnotes


## Further reading


## External links


- Bruce Lindbloom's color difference calculator. Uses all CIELAB metrics defined herein.
- The CIEDE2000 Color-Difference Formula, by Gaurav Sharma. Implementations in MATLAB and Excel.
- Explore the Spectrum with Colors in Between, by Bettie M. Cobb.
- Excel add-in for color difference calculations and color space conversions, by Edgardo García.
- Michel Leonard's CIE ΔE 2000 implementations consistent in 20+ programming languages.
