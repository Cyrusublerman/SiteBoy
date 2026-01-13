# HSL and HSV

HSL and HSV are the two most common cylindrical-coordinate representations of points in an RGB color model. The two representations rearrange the geometry of RGB in an attempt to be more intuitive and perceptually relevant than the cartesian (cube) representation. Developed in the 1970s for computer graphics applications, HSL and HSV are used today in color pickers, in image editing software, and less commonly in image analysis and computer vision.

HSL stands for hue, saturation, and lightness, and is often also called HLS. HSV stands for hue, saturation, and value, and is also often called HSB (B for brightness). A third model, common in computer vision applications, is HSI, for hue, saturation, and intensity. However, while typically consistent, these definitions are not standardized, and any of these abbreviations might be used for any of these three or several other related cylindrical models. (For technical definitions of these terms, see below.)

In each cylinder, the angle around the central vertical axis corresponds to "hue", the distance from the axis corresponds to "saturation", and the distance along the axis corresponds to "lightness", "value" or "brightness". Note that while "hue" in HSL and HSV refers to the same attribute, their definitions of "saturation" differ dramatically. Because HSL and HSV are simple transformations of device-dependent RGB models, the physical colors they define depend on the colors of the red, green, and blue primaries of the device or of the particular RGB space, and on the gamma correction used to represent the amounts of those primaries. Each unique RGB device therefore has unique HSL and HSV spaces to accompany it, and numerical HSL or HSV values describe a different color for each basis RGB space.

Both of these representations are used widely in computer graphics, and one or the other of them is often more convenient than RGB, but both are also criticized for not adequately separating color-making attributes, or for their lack of perceptual uniformity. Other more computationally intensive models, such as CIELAB or CIECAM02 are said to better achieve these goals.


## Basic principle

HSL and HSV are both cylindrical geometries (fig. 2), with hue, their angular dimension, starting at the red primary at 0°, passing through the green primary at 120° and the blue primary at 240°, and then wrapping back to red at 360°. In each geometry, the central vertical axis comprises the neutral, achromatic, or gray colors ranging, from top to bottom, white at lightness 1 (value 1) to black at lightness 0 (value 0).

In both geometries, the additive primary and secondary colors – red, yellow, green, cyan, blue and magenta – and linear mixtures between adjacent pairs of them, sometimes called pure colors, are arranged around the outside edge of the cylinder with saturation 1. These saturated colors have lightness 0.5 in HSL, while in HSV they have value 1. Mixing these pure colors with black – producing so-called shades – leaves saturation unchanged. In HSL, saturation is also unchanged by tinting with white, and only mixtures with both black and white – called tones – have saturation less than 1. In HSV, tinting alone reduces saturation.

Because these definitions of saturation – in which very dark (in both models) or very light (in HSL) near-neutral colors are considered fully saturated (for instance, from the bottom right in the sliced HSL cylinder or from the top right) – conflict with the intuitive notion of color purity, often a conic or biconic solid is drawn instead (fig. 3), with what this article calls chroma as its radial dimension (equal to the range of the RGB values), instead of saturation (where the saturation is equal to the chroma over the maximum chroma in that slice of the (bi)cone). Confusingly, such diagrams usually label this radial dimension "saturation", blurring or erasing the distinction between saturation and chroma. As described below, computing chroma is a helpful step in the derivation of each model. Because such an intermediate model – with dimensions hue, chroma, and HSV value or HSL lightness – takes the shape of a cone or bicone, HSV is often called the "hexcone model" while HSL is often called the "bi-hexcone model" (fig. 8).


## Motivation

Most televisions, computer displays, and projectors produce colors by combining red, green, and blue light in varying intensities – the so-called RGB additive primary colors. The resulting mixtures in RGB color space can reproduce a wide variety of colors (called a gamut); however, the relationship between the constituent amounts of red, green, and blue light and the resulting color is unintuitive, especially for inexperienced users, and for users familiar with subtractive color mixing of paints or traditional artists' models based on tints and shades (fig. 4). Furthermore, neither additive nor subtractive color models define color relationships the same way the human eye does.

For example, imagine we have an RGB display whose color is controlled by three sliders ranging from 0–255, one controlling the intensity of each of the red, green, and blue primaries. If we begin with a relatively colorful orange , with sRGB values R = 217, G = 118, B = 33, and want to reduce its colorfulness by half to a less saturated orange , we would need to drag the sliders to decrease R by 31, increase G by 24, and increase B by 59, as pictured below.

Beginning in the 1950s, color television broadcasts used a compatible color system whereby "luminance" and "chrominance" signals were encoded separately, so that existing unmodified black-and-white televisions could still receive color broadcasts and show a monochrome image.

In an attempt to accommodate more traditional and intuitive color mixing models, computer graphics pioneers at PARC and NYIT introduced the HSV model for computer display technology in the mid-1970s, formally described by Alvy Ray Smith in the August 1978 issue of Computer Graphics. In the same issue, Joblove and Greenberg described the HSL model – whose dimensions they labeled hue, relative chroma, and intensity – and compared it to HSV (fig. 1). Their model was based more upon how colors are organized and conceptualized in human vision in terms of other color-making attributes, such as hue, lightness, and chroma; as well as upon traditional color mixing methods – e.g., in painting – that involve mixing brightly colored pigments with black or white to achieve lighter, darker, or less colorful colors.

The following year, 1979, at SIGGRAPH, Tektronix introduced graphics terminals using HSL for color designation, and the Computer Graphics Standards Committee recommended it in their annual status report (fig. 7). These models were useful not only because they were more intuitive than raw RGB values, but also because the conversions to and from RGB were extremely fast to compute: they could run in real time on the hardware of the 1970s. Consequently, these models and similar ones have become ubiquitous throughout image editing and graphics software since then. Some of their uses are described below.


## Formal derivation


### Color-making attributes

The dimensions of the HSL and HSV geometries – simple transformations of the not-perceptually-based RGB model – are not directly related to the photometric color-making attributes of the same names, as defined by scientists such as the CIE or ASTM. Nonetheless, it is worth reviewing those definitions before leaping into the derivation of our models. For the definitions of color-making attributes which follow, see:


**Hue**


**Radiance (Le,Ω)**


**Luminance (Y or Lv,Ω)**


**Luma (Y′)**


**Brightness (or value)**


**Lightness**


**Colorfulness**


**Chroma**


**Saturation**

The "attribute of a visual sensation according to which an area appears to be similar to one of the perceived colors: red, yellow, green, and blue, or to a combination of two of them".

The radiant power of light passing through a particular surface per unit solid angle per unit projected area, measured in SI units in watt per steradian per square metre (W·sr·m).

The radiance weighted by the effect of each wavelength on a typical human observer, measured in SI units in candela per square meter (cd/m). Often the term luminance is used for the relative luminance, Y/Yn, where Yn is the luminance of the reference white point.

The weighted sum of gamma-corrected R′, G′, and B′ values, and used in Y′CbCr, for JPEG compression and video transmission.

The "attribute of a visual sensation according to which an area appears to emit more or less light".

The "brightness relative to the brightness of a similarly illuminated white".

The "attribute of a visual sensation according to which the perceived color of an area appears to be more or less chromatic".

The "colorfulness relative to the brightness of a similarly illuminated white".

The "colorfulness of a stimulus relative to its own brightness".

Brightness and colorfulness are absolute measures, which usually describe the spectral distribution of light entering the eye, while lightness and chroma are measured relative to some white point, and are thus often used for descriptions of surface colors, remaining roughly constant even as brightness and colorfulness change with different illumination. Saturation can be defined as either the ratio of colorfulness to brightness, or that of chroma to lightness.


### General approach

HSL, HSV, and related models can be derived via geometric strategies, or can be thought of as specific instances of a "generalized LHS model". The HSL and HSV model-builders took an RGB cube – with constituent amounts of red, green, and blue light in a color denoted R, G, B ∈ [0, 1] – and tilted it on its corner, so that black rested at the origin with white directly above it along the vertical axis, then measured the hue of the colors in the cube by their angle around that axis, starting with red at 0°. Then they came up with a characterization of brightness/value/lightness, and defined saturation to range from 0 along the axis to 1 at the most colorful point for each pair of other parameters. End-use software may use another scaling. For example, in Microsoft Paint, hue runs from 0 to 239 rather than from 0 to 360 degrees, and saturation and lightness (termed "Lum") run from 0 to 240 instead of 0 to 1.


### Hue and chroma

In each of our models, we calculate both hue and what this article will call chroma, after Joblove and Greenberg (1978), in the same way – that is, the hue of a color has the same numerical values in all of these models, as does its chroma. If we take our tilted RGB cube, and project it onto the "chromaticity plane" perpendicular to the neutral axis, our projection takes the shape of a hexagon, with red, yellow, green, cyan, blue, and magenta at its corners (fig. 9). Hue is roughly the angle of the vector to a point in the projection, with red at 0°, while chroma is roughly the distance of the point from the origin.

More precisely, both hue and chroma in this model are defined with respect to the hexagonal shape of the projection. The chroma is the proportion of the distance from the origin to the edge of the hexagon. In the lower part of the adjacent diagram, this is the ratio of lengths OP/OP′, or alternatively the ratio of the radii of the two hexagons. This ratio is the difference between the largest and smallest values among R, G, or B in a color. To make our definitions easier to write, we'll define these maximum, minimum, and chroma component values as M, m, and C, respectively.

$M=\max(R,G,B)$

$m=\min(R,G,B)$

$C=\operatorname {range} (R,G,B)=M-m$

These operations do not require R, G and B values to be normalized to a specific range (e.g. a range of 0–1 works as well as a range of 0–255).

To understand why chroma can be written as M − m, notice that any neutral color, with R = G = B, projects onto the origin and so has 0 chroma. Thus if we add or subtract the same amount from all three of R, G, and B, we move vertically within our tilted cube, and do not change the projection. Therefore, any two colors of (R, G, B) and (R − m, G − m, B − m) project on the same point, and have the same chroma. The chroma of a color with one of its components equal to zero (m = 0) is simply the maximum of the other two components. This chroma is M in the particular case of a color with a zero component, and M − m in general.

The hue is the proportion of the distance around the edge of the hexagon which passes through the projected point, originally measured on the range [0, 1] but now typically measured in degrees [0°, 360°). For points which project onto the origin in the chromaticity plane (i.e., grays), hue is undefined. Mathematically, this definition of hue is written piecewise:


$$H'={\begin{cases}\mathrm {undefined} ,&{\text{if }}C=0\\{\frac {G-B}{C}}{\bmod {6}},&{\text{if }}M=R\\{\frac {B-R}{C}}+2,&{\text{if }}M=G\\{\frac {R-G}{C}}+4,&{\text{if }}M=B\end{cases}}
$$

$H=60^{\circ }\times H'$

Sometimes, neutral colors (i.e. with C = 0) are assigned a hue of 0° for convenience of representation.

These definitions amount to a geometric warping of hexagons into circles: each side of the hexagon is mapped linearly onto a 60° arc of the circle (fig. 10). After such a transformation, hue is precisely the angle around the origin and chroma the distance from the origin: the angle and magnitude of the vector pointing to a color.

Sometimes for image analysis applications, this hexagon-to-circle transformation is skipped, and hue and chroma (we'll denote these H2 and C2) are defined by the usual cartesian-to-polar coordinate transformations (fig. 11). The easiest way to derive those is via a pair of cartesian chromaticity coordinates which we'll call α and β:


$$\alpha =R-G\cdot \cos(60^{\circ })-B\cdot \cos(60^{\circ })={\tfrac {1}{2}}(2R-G-B)
$$


$$\beta =G\cdot \sin(60^{\circ })-B\cdot \sin(60^{\circ })={\tfrac {\sqrt {3}}{2}}(G-B)
$$

$H_{2}=\operatorname {atan2} (\beta ,\alpha )$


$$C_{2}=\operatorname {gmean} (\alpha ,\beta )={\sqrt {\alpha ^{2}+\beta ^{2}}}
$$

(The atan2 function, a "two-argument arctangent", computes the angle from a cartesian coordinate pair.)

Notice that these two definitions of hue (H and H2) nearly coincide, with a maximum difference between them for any color of about 1.12° – which occurs at twelve particular hues, for instance H = 13.38°, H2 = 12.26° – and with H = H2 for every multiple of 30°. The two definitions of chroma (C and C2) differ more substantially: they are equal at the corners of our hexagon, but at points halfway between two corners, such as H = H2 = 30°, we have C = 1, but
$${\textstyle C_{2}={\sqrt {\frac {3}{4}}}\approx 0.866,}
$$a difference of about 13.4%.


### Lightness

While the definition of hue is relatively uncontroversial – it roughly satisfies the criterion that colors of the same perceived hue should have the same numerical hue – the definition of a lightness or value dimension is less obvious: there are several possibilities depending on the purpose and goals of the representation. Here are four of the most common (fig. 12; three of these are also shown in fig. 8):


- The simplest definition is just the arithmetic mean, i.e. average, of the three components, in the HSI model called intensity (fig. 12a). This is simply the projection of a point onto the neutral axis – the vertical height of a point in our tilted cube. The advantage is that, together with Euclidean-distance calculations of hue and chroma, this representation preserves distances and angles from the geometry of the RGB cube. I = avg ⁡ ( R , G , B ) = 1 3 ( R + G + B ) {\displaystyle I=\operatorname {avg} (R,G,B)={\tfrac {1}{3}}(R+G+B)}
- In the HSV "hexcone" model, value is defined as the largest component of a color, our M above (fig. 12b). This places all three primaries, and also all of the "secondary colors" – cyan, yellow, and magenta – into a plane with white, forming a hexagonal pyramid out of the RGB cube. V = max ( R , G , B ) = M {\displaystyle V=\max(R,G,B)=M}
- In the HSL "bi-hexcone" model, lightness is defined as the average of the largest and smallest color components (fig. 12c), i.e. the mid-range of the RGB components. This definition also puts the primary and secondary colors into a plane, but a plane passing halfway between white and black. The resulting color solid is a double-cone similar to Ostwald's, shown above. L = mid ⁡ ( R , G , B ) = 1 2 ( M + m ) {\displaystyle L=\operatorname {mid} (R,G,B)={\tfrac {1}{2}}(M+m)}
- A more perceptually relevant alternative is to use luma, Y′, as a lightness dimension (fig. 12d). Luma is the weighted average of gamma-corrected R, G, and B, based on their contribution to perceived lightness, long used as the monochromatic dimension in color television broadcast. For sRGB, the Rec. 709 primaries yield Y′709, digital NTSC uses Y′601 according to Rec. 601 and some other primaries are also in use which result in different coefficients. Y 601 ′ = 0.299 ⋅ R + 0.587 ⋅ G + 0.114 ⋅ B {\displaystyle Y'_{\text{601}}=0.299\cdot R+0.587\cdot G+0.114\cdot B} (SDTV) Y 240 ′ = 0.212 ⋅ R + 0.701 ⋅ G + 0.087 ⋅ B {\displaystyle Y'_{\text{240}}=0.212\cdot R+0.701\cdot G+0.087\cdot B} (Adobe) Y 709 ′ = 0.2126 ⋅ R + 0.7152 ⋅ G + 0.0722 ⋅ B {\displaystyle Y'_{\text{709}}=0.2126\cdot R+0.7152\cdot G+0.0722\cdot B} (HDTV) Y 2020 ′ = 0.2627 ⋅ R + 0.6780 ⋅ G + 0.0593 ⋅ B {\displaystyle Y'_{\text{2020}}=0.2627\cdot R+0.6780\cdot G+0.0593\cdot B} (UHDTV, HDR)

All four of these leave the neutral axis alone. That is, for colors with R = G = B, any of the four formulations yields a lightness equal to the value of R, G, or B.

For a graphical comparison, see fig. 13 below.


### Saturation

When encoding colors in a hue/lightness/chroma or hue/value/chroma model (using the definitions from the previous two sections), not all combinations of lightness (or value) and chroma are meaningful: that is, half of the colors denotable using H ∈ [0°, 360°), C ∈ [0, 1], and V ∈ [0, 1] fall outside the RGB gamut (the gray parts of the slices in figure 14). The creators of these models considered this a problem for some uses. For example, in a color selection interface with two of the dimensions in a rectangle and the third on a slider, half of that rectangle is made of unused space. Now imagine we have a slider for lightness: the user's intent when adjusting this slider is potentially ambiguous: how should the software deal with out-of-gamut colors? Or conversely, If the user has selected as colorful as possible a dark purple , and then shifts the lightness slider upward, what should be done: would the user prefer to see a lighter purple still as colorful as possible for the given hue and lightness , or a lighter purple of exactly the same chroma as the original color ?

To solve problems such as these, the HSL and HSV models scale the chroma so that it always fits into the range [0, 1] for every combination of hue and lightness or value, calling the new attribute saturation in both cases (fig. 14). To calculate either, simply divide the chroma by the maximum chroma for that value or lightness.


$$S_{V}={\begin{cases}0,&{\text{if }}V=0\\{\frac {C}{V}},&{\text{otherwise}}\end{cases}}
$$


$$S_{L}={\begin{cases}0,&{\text{if }}L=1{\text{ or }}L=0\\{\frac {C}{1-|2L-1|}},&{\text{otherwise}}\end{cases}}
$$

The HSI model commonly used for computer vision, which takes H2 as a hue dimension and the component average I ("intensity") as a lightness dimension, does not attempt to "fill" a cylinder by its definition of saturation. Instead of presenting color choice or modification interfaces to end users, the goal of HSI is to facilitate separation of shapes in an image. Saturation is therefore defined in line with the psychometric definition: chroma relative to lightness (fig. 15). See the Use in image analysis section of this article.


$$S_{I}={\begin{cases}0,&{\text{if }}I=0\\1-{\frac {m}{I}},&{\text{otherwise}}\end{cases}}
$$

Using the same name for these three different definitions of saturation leads to some confusion, as the three attributes describe substantially different color relationships; in HSV and HSI, the term roughly matches the psychometric definition, of a chroma of a color relative to its own lightness, but in HSL it does not come close. Even worse, the word saturation is also often used for one of the measurements we call chroma above (C or C2).


### Examples

All parameter values shown below are given as values in the interval [0, 1], except those for H and H2, which are in the interval [0°, 360°).


## Use in end-user software

The original purpose of HSL and HSV and similar models, and their most common current application, is in color selection tools. At their simplest, some such color pickers provide three sliders, one for each attribute. Most, however, show a two-dimensional slice through the model, along with a slider controlling which particular slice is shown. The latter type of GUI exhibits great variety, because of the choice of cylinders, hexagonal prisms, or cones/bicones that the models suggest (see the diagram near the top of the page). Several color choosers from the 1990s are shown to the right, most of which have remained nearly unchanged in the intervening time: today, nearly every computer color chooser uses HSL or HSV, at least as an option. Some more sophisticated variants are designed for choosing whole sets of colors, basing their suggestions of compatible colors on the HSL or HSV relationships between them.

Most web applications needing color selection also base their tools on HSL or HSV, and pre-packaged open source color choosers exist for most major web front-end frameworks. The CSS 3 specification allows web authors to specify colors for their pages directly with HSL coordinates.

HSL and HSV are sometimes used to define gradients for data visualization, as in maps or medical images. For example, the popular GIS program ArcGIS historically applied customizable HSV-based gradients to numerical geographical data. Several studies have been done on color scheme choices for such data display, and the use of HSL&#x2D; and HSV&#x2D;based schemes has

Image editing software also commonly includes tools for adjusting colors with reference to HSL or HSV coordinates, or to coordinates in a model based on the "intensity" or luma defined above. In particular, tools with a pair of "hue" and "saturation" sliders are commonplace, dating to at least the late-1980s, but various more complicated color tools have also been implemented. For instance, the Unix image viewer and color editor xv allowed six user-definable hue (H) ranges to be rotated and resized, included a dial-like control for saturation (SHSV), and a curves-like interface for controlling value (V) – see fig. 17. The image editor Picture Window Pro includes a "color correction" tool which affords complex remapping of points in a hue/saturation plane relative to either HSL or HSV space.

Video editors also use these models. For example, both Avid and Final Cut Pro include color tools based on HSL or a similar geometry for use adjusting the color in video. With the Avid tool, users pick a vector by clicking a point within the hue/saturation circle to shift all the colors at some lightness level (shadows, mid-tones, highlights) by that vector.

Since version 4.0, Adobe Photoshop's "Luminosity", "Hue", "Saturation", and "Color" blend modes composite layers using a luma/chroma/hue color geometry. These have been copied widely, but several imitators use the HSL (e.g. PhotoImpact, Paint Shop Pro) or HSV geometries instead. could use a ref about photoimpact, PSP, GIMP


## Use in image analysis

HSL, HSV, HSI, or related models are often used in computer vision and image analysis for feature detection or image segmentation. The applications of such tools include object detection, for instance in robot vision; object recognition, for instance of faces, text, or license plates; content-based image retrieval; and analysis of medical images.

For the most part, computer vision algorithms used on color images are straightforward extensions to algorithms designed for grayscale images, for instance k-means or fuzzy clustering of pixel colors, or canny edge detection. At the simplest, each color component is separately passed through the same algorithm. It is important, therefore, that the features of interest can be distinguished in the color dimensions used. Because the R, G, and B components of an object's color in a digital image are all correlated with the amount of light hitting the object, and therefore with each other, image descriptions in terms of those components make object discrimination difficult. Descriptions in terms of hue/lightness/chroma or hue/lightness/saturation are often more relevant.

Starting in the late 1970s, transformations like HSV or HSI were used as a compromise between effectiveness for segmentation and computational complexity. They can be thought of as similar in approach and intent to the neural processing used by human color vision, without agreeing in particulars: if the goal is object detection, roughly separating hue, lightness, and chroma or saturation is effective, but there is no particular reason to strictly mimic human color response. John Kender's 1976 master's thesis proposed the HSI model. Ohta et al. (1980) instead used a model made up of dimensions similar to those we have called I, α, and β. In recent years, such models have continued to see wide use, as their performance compares favorably with more complex models, and their computational simplicity remains compelling.


## Disadvantages

While HSL, HSV, and related spaces serve well enough to, for instance, choose a single color, they ignore much of the complexity of color appearance. Essentially, they trade off perceptual relevance for computation speed, from a time in computing history (high-end 1970s graphics workstations, or mid-1990s consumer desktops) when more sophisticated models would have been too computationally expensive.

HSL and HSV are simple transformations of RGB which preserve symmetries in the RGB cube unrelated to human perception, such that its R, G, and B corners are equidistant from the neutral axis, and equally spaced around it. If we plot the RGB gamut in a more perceptually-uniform space, such as CIELAB (see below), it becomes immediately clear that the red, green, and blue primaries do not have the same lightness or chroma, or evenly spaced hues. Furthermore, different RGB displays use different primaries, and so have different gamuts. Because HSL and HSV are defined purely with reference to some RGB space, they are not absolute color spaces: to specify a color precisely requires reporting not only HSL or HSV values, but also the characteristics of the RGB space they are based on, including the gamma correction in use.

If we take an image and extract the hue, saturation, and lightness or value components, and then compare these to the components of the same name as defined by color scientists, we can quickly see the difference, perceptually. For example, examine the following images of a fire breather (fig. 13). The original is in the sRGB colorspace. CIELAB L* is a CIE-defined achromatic lightness quantity (dependent solely on the perceptually achromatic luminance Y, but not the mixed-chromatic components X or Z, of the CIEXYZ colorspace from which the sRGB colorspace itself is derived), and it is plain that this appears similar in perceptual lightness to the original color image. Luma is roughly similar, but differs somewhat at high chroma, where it deviates most from depending solely on the true achromatic luminance (Y, or equivalently L*) and is influenced by the colorimetric chromaticity (x,y, or equivalently, a*,b* of CIELAB). HSL L and HSV V, by contrast, diverge substantially from perceptual lightness.

Though none of the dimensions in these spaces match their perceptual analogs, the value of HSV and the saturation of HSL are particular offenders. In HSV, the blue primary and white are held to have the same value, even though perceptually the blue primary has somewhere around 10% of the luminance of white (the exact fraction depends on the particular RGB primaries in use). In HSL, a mix of 100% red, 100% green, 90% blue – that is, a very light yellow – is held to have the same saturation as the green primary , even though the former color has almost no chroma or saturation by the conventional psychometric definitions. Such perversities led Cynthia Brewer, expert in color scheme choices for maps and information displays, to tell the American Statistical Association:

If these problems make HSL and HSV problematic for choosing colors or color schemes, they make them much worse for image adjustment. HSL and HSV, as Brewer mentioned, confound perceptual color-making attributes, so that changing any dimension results in non-uniform changes to all three perceptual dimensions, and distorts all of the color relationships in the image. For instance, rotating the hue of a pure dark blue toward green will also reduce its perceived chroma, and increase its perceived lightness (the latter is grayer and lighter), but the same hue rotation will have the opposite impact on lightness and chroma of a lighter bluish-green – to (the latter is more colorful and slightly darker). In the example below (fig. 21), the image (a) is the original photograph of a green turtle. In the image (b), we have rotated the hue (H) of each color by −30°, while keeping HSV value and saturation or HSL lightness and saturation constant. In the image right (c), we make the same rotation to the HSL/HSV hue of each color, but then we force the CIELAB lightness (L*, a decent approximation of perceived lightness) to remain constant. Notice how the hue-shifted middle version without such a correction dramatically changes the perceived lightness relationships between colors in the image. In particular, the turtle's shell is much darker and has less contrast, and the background water is much lighter. Image (d) uses CIELAB to hue shift; the difference from (c) demonstrates the errors in hue and saturation.

Because hue is a circular quantity, represented numerically with a discontinuity at 360°, it is difficult to use in statistical computations or quantitative comparisons: analysis requires the use of circular statistics. Furthermore, hue is defined piecewise, in 60° chunks, where the relationship of lightness, value, and chroma to R, G, and B depends on the hue chunk in question. This definition introduces discontinuities, corners which can plainly be seen in horizontal slices of HSL or HSV.

Charles Poynton, digital video expert, lists the above problems with HSL and HSV in his Color FAQ, and concludes that:


## Other cylindrical-coordinate color models

The creators of HSL and HSV were far from the first to imagine colors fitting into conic or spherical shapes, with neutrals running from black to white in a central axis, and hues corresponding to angles around that axis. Similar arrangements date back to the 18th century, and continue to be developed in the most modern and scientific models.


## Color conversion formulae

To convert from HSL or HSV to RGB, we essentially invert the steps listed above (as before, R, G, B ∈ [0, 1]). First, we compute chroma, by multiplying saturation by the maximum chroma for a given lightness or value. Next, we find the point on one of the bottom three faces of the RGB cube which has the same hue and chroma as our color (and therefore projects onto the same point in the chromaticity plane). Finally, we add equal amounts of R, G, and B to reach the proper lightness or value.


### To RGB


#### HSL to RGB

Given a color with hue H ∈ [0°, 360°), saturation SL ∈ [0, 1], and lightness L ∈ [0, 1], we first find chroma:

$C=(1-\left\vert 2L-1\right\vert )\times S_{L}$

Then we can find a point (R1, G1, B1) along the bottom three faces of the RGB cube, with the same hue and chroma as our color (using the intermediate value X for the second largest component of this color):


$$H^{\prime }={\frac {H}{60^{\circ }}}
$$

$X=C\times (1-|H^{\prime }\;{\bmod {2}}-1|)$

In the above equation, the notation $H^{\prime }\;{\bmod {2}}$ refers to the remainder of the Euclidean division of $H^{\prime }$ by 2. $H^{\prime }$ is not necessarily an integer.


$$(R_{1},G_{1},B_{1})={\begin{cases}(C,X,0)&{\text{if }}0\leq H^{\prime }<1\\(X,C,0)&{\text{if }}1\leq H^{\prime }<2\\(0,C,X)&{\text{if }}2\leq H^{\prime }<3\\(0,X,C)&{\text{if }}3\leq H^{\prime }<4\\(X,0,C)&{\text{if }}4\leq H^{\prime }<5\\(C,0,X)&{\text{if }}5\leq H^{\prime }<6\end{cases}}
$$

When $H^{\prime }$ is an integer, the "neighbouring" formula would yield the same result, as $X=0$ or $X=C$, as appropriate.

Finally, we can find R, G, and B by adding the same amount to each component, to match lightness:


$$m=L-{\frac {C}{2}}
$$

$(R,G,B)=(R_{1}+m,G_{1}+m,B_{1}+m)$


##### HSL to RGB alternative

The polygonal piecewise functions can be somewhat simplified by clever use of minimum and maximum values as well as the remainder operation.

Given a color with hue $H\in [0^{\circ },360^{\circ }]$, saturation $S=S_{L}\in [0,1]$, and lightness $L\in [0,1]$, we first define the function:

$f(n)=L-a\max(-1,\min(k-3,9-k,1))$

where $k,n\in \mathbb {R} _{\geq 0}$ and:


$$k=\left(n+{\frac {H}{30^{\circ }}}\right){\bmod {1}}2
$$

$a=S_{L}\min(L,1-L)$

And output R,G,B values (from $[0,1]^{3}$) are:

$(R,G,B)=(f(0),f(8),f(4))$

The above alternative formulas allow for shorter implementations. In the above formulas the $a{\bmod {b}}$ operation also returns the fractional part of the module e.g. $7.4{\bmod {6}}=1.4$, and $k\in [0,12)$.

The base shape $T(k)=t(n,H)=\max(\min(k-3,9-k,1),-1)$ is constructed as follows: $t_{1}=\min(k-3,9-k)$ is a "triangle" for which values greater or equal to −1 start from k=2 and end at k=10, and the highest point is at k=6. Then by $t_{2}=\min(t_{1},1)=\min(k-3,9-k,1)$ we change values bigger than 1 to equal 1. Then by $t=\max(t_{2},-1)$ we change values less than −1 to equal −1. At this point, we get something similar to the red shape from fig. 24 after a vertical flip (where the maximum is 1 and the minimum is −1). The R,G,B functions of H use this shape transformed in the following way: modulo-shifted on X (by n) (differently for R,G,B) scaled on Y (by $-a$) and shifted on Y (by L).

We observe the following shape properties (Fig. 24 can help to get an intuition about them):

$t(n,H)=-t(n+6,H)$

$\min \ (t(n,H),t(n+4,H),t(n+8,H))=-1$

$\max \ (t(n,H),t(n+4,H),t(n+8,H))=+1$


#### HSV to RGB

Given an HSV color with hue H ∈ [0°, 360°), saturation SV ∈ [0, 1], and value V ∈ [0, 1], we can use the same strategy. First, we find chroma:

$C=V\times S_{V}$

Then we can, again, find a point (R1, G1, B1) along the bottom three faces of the RGB cube, with the same hue and chroma as our color (using the intermediate value X for the second largest component of this color):


$$H^{\prime }={\frac {H}{60^{\circ }}}
$$

$X=C\times (1-|H^{\prime }{\bmod {2}}-1|)$


$$(R_{1},G_{1},B_{1})={\begin{cases}(C,X,0)&{\text{if }}0\leq H^{\prime }<1\\(X,C,0)&{\text{if }}1\leq H^{\prime }<2\\(0,C,X)&{\text{if }}2\leq H^{\prime }<3\\(0,X,C)&{\text{if }}3\leq H^{\prime }<4\\(X,0,C)&{\text{if }}4\leq H^{\prime }<5\\(C,0,X)&{\text{if }}5\leq H^{\prime }<6\end{cases}}
$$

As before, when $H^{\prime }$ is an integer, "neighbouring" formulas would yield the same result.

Finally, we can find R, G, and B by adding the same amount to each component, to match value:

$m=V-C$

$(R,G,B)=(R_{1}+m,G_{1}+m,B_{1}+m)$


##### HSV to RGB alternative

Given a color with hue $H\in [0^{\circ },360^{\circ }]$, saturation $S=S_{V}\in [0,1]$, and value $V\in [0,1]$, first we define function :

$f(n)=V-VS\max(0,\min(k,4-k,1))$

where $k,n\in \mathbb {R} _{\geq 0}$ and:


$$k=\left(n+{\frac {H}{60^{\circ }}}\right){\bmod {6}}
$$

And output R,G,B values (from $[0,1]^{3}$) are:

$(R,G,B)=(f(5),f(3),f(1))$

Above alternative equivalent formulas allow shorter implementation. In above formulas the $a{\bmod {b}}$ returns also fractional part of module e.g. the formula $7.4{\bmod {6}}=1.4$. The values of $k\in \mathbb {R} \land k\in [0,6)$. The base shape

$t(n,H)=T(k)=\max(0,\min(k,4-k,1))$

is constructed as follows: $t_{1}=\min(k,4-k)$ is "triangle" for which non-negative values starts from k=0, highest point at k=2 and "ends" at k=4, then we change values bigger than one to one by $t_{2}=\min(t_{1},1)=\min(k,4-k,1)$, then change negative values to zero by $t=\max(t2,0)$ – and we get (for $n=0$) something similar to green shape from Fig. 24 (which max value is 1 and min value is 0). The R,G,B functions of H use this shape transformed in following way: modulo-shifted on X (by n) (differently for R,G,B) scaled on Y (by $-VS$) and shifted on Y (by V). We observe following shape properties(Fig. 24 can help to get intuition about this):

$t(n,H)=1-t(n+3,H)$

$\min(t(n,H),t(n+2,H),t(n+4,H))=0$

$\max(t(n,H),t(n+2,H),t(n+4,H))=1$


#### HSI to RGB

Given an HSI color with hue H ∈ [0°, 360°), saturation SI ∈ [0, 1], and intensity I ∈ [0, 1], we can use the same strategy, in a slightly different order:


$$H^{\prime }={\frac {H}{60^{\circ }}}
$$

$Z=1-|H^{\prime }\;{\bmod {2}}-1|$


$$C={\frac {3\cdot I\cdot S_{I}}{1+Z}}
$$

$X=C\cdot Z$

Where $C$ is the chroma.

Then we can, again, find a point (R1, G1, B1) along the bottom three faces of the RGB cube, with the same hue and chroma as our color (using the intermediate value X for the second largest component of this color):


$$(R_{1},G_{1},B_{1})={\begin{cases}(0,0,0)&{\text{if }}H{\text{ is undefined}}\\(C,X,0)&{\text{if }}0\leq H^{\prime }\leq 1\\(X,C,0)&{\text{if }}1\leq H^{\prime }\leq 2\\(0,C,X)&{\text{if }}2\leq H^{\prime }\leq 3\\(0,X,C)&{\text{if }}3\leq H^{\prime }\leq 4\\(X,0,C)&{\text{if }}4\leq H^{\prime }\leq 5\\(C,0,X)&{\text{if }}5\leq H^{\prime }<6\end{cases}}
$$

Overlap (when $H^{\prime }$ is an integer) occurs because two ways to calculate the value are equivalent: $X=0$ or $X=C$, as appropriate.

Finally, we can find R, G, and B by adding the same amount to each component, to match lightness:

$m=I\cdot (1-S_{I})$

$(R,G,B)=(R_{1}+m,G_{1}+m,B_{1}+m)$


#### Luma, chroma and hue to RGB

Given a color with hue H ∈ [0°, 360°), chroma C ∈ [0, 1], and luma Y′601 ∈ [0, 1], we can again use the same strategy. Since we already have H and C, we can straightaway find our point (R1, G1, B1) along the bottom three faces of the RGB cube:


$${\begin{aligned}H^{\prime }&={\frac {H}{60^{\circ }}}\\X&=C\times (1-|H^{\prime }{\bmod {2}}-1|)\end{aligned}}
$$


$$(R_{1},G_{1},B_{1})={\begin{cases}(0,0,0)&{\text{if }}H{\text{ is undefined}}\\(C,X,0)&{\text{if }}0\leq H^{\prime }\leq 1\\(X,C,0)&{\text{if }}1\leq H^{\prime }\leq 2\\(0,C,X)&{\text{if }}2\leq H^{\prime }\leq 3\\(0,X,C)&{\text{if }}3\leq H^{\prime }\leq 4\\(X,0,C)&{\text{if }}4\leq H^{\prime }\leq 5\\(C,0,X)&{\text{if }}5\leq H^{\prime }<6\end{cases}}
$$

Overlap (when $H^{\prime }$ is an integer) occurs because two ways to calculate the value are equivalent: $X=0$ or $X=C$, as appropriate.

Then we can find R, G, and B by adding the same amount to each component, to match luma:


$$m=Y_{601}^{\prime }-(0.30R_{1}+0.59G_{1}+0.11B_{1})
$$

$(R,G,B)=(R_{1}+m,G_{1}+m,B_{1}+m)$


### Interconversion


#### HSV to HSL

Given a color with hue $H_{V}\in [0^{\circ },360^{\circ })$, saturation $S_{V}\in [0,1]$, and value $V\in [0,1]$,

$H_{L}=H_{V}$


$$S_{L}={\begin{cases}0&{\text{if }}L=0{\text{ or }}L=1\\{\frac {V-L}{\min(L,1-L)}}&{\text{otherwise}}\\\end{cases}}
$$


$$L=V\left(1-{\frac {S_{V}}{2}}\right)
$$


#### HSL to HSV

Given a color with hue $H_{L}\in [0^{\circ },360^{\circ })$, saturation $S_{L}\in [0,1]$, and luminance $L\in [0,1]$,

$H_{V}=H_{L}$


$$S_{V}={\begin{cases}0&{\text{if }}V=0\\2\left(1-{\frac {L}{V}}\right)&{\text{otherwise}}\\\end{cases}}
$$

$V=L+S_{L}\min(L,1-L)$


### From RGB

This is a reiteration of the previous conversion.

Value must be in range $R,G,B\in [0,1]$.

With maximum component (i. e. value)

$X_{\text{max}}:=\max(R,G,B)=:V$

and minimum component

$X_{\text{min}}:=\min(R,G,B)=V-C$,

range (i. e. chroma)

$C:=X_{\text{max}}-X_{\text{min}}=2(V-L)$

and mid-range (i. e. lightness)


$$L:=\operatorname {mid} (R,G,B)={\frac {X_{\text{max}}+X_{\text{min}}}{2}}=V-{\frac {C}{2}}
$$,

we get common hue:


$$H:={\begin{cases}0,&{\text{if }}C=0\\60^{\circ }\cdot \left({\frac {G-B}{C}}\mod 6\right),&{\text{if }}V=R\\60^{\circ }\cdot \left({\frac {B-R}{C}}+2\right),&{\text{if }}V=G\\60^{\circ }\cdot \left({\frac {R-G}{C}}+4\right),&{\text{if }}V=B\end{cases}}
$$

and distinct saturations:


$$S_{V}:={\begin{cases}0,&{\text{if }}V=0\\{\frac {C}{V}},&{\text{otherwise}}\end{cases}}
$$


$$S_{L}:={\begin{cases}0,&{\text{if }}L=0{\text{ or }}L=1\\{\frac {C}{1-\left\vert 2V-C-1\right\vert }}={\frac {2(V-L)}{1-\left\vert 2L-1\right\vert }}={\frac {V-L}{\min(L,1-L)}},&{\text{otherwise}}\end{cases}}
$$


## Swatches

Mouse over the swatches below to see the R, G, and B values for each swatch in a tooltip.


### HSL


### HSV


## See also


- Munsell color system
- TSL color space


## External links


- Demonstrative color conversion applet
- HSV Colors by Hector Zenil, The Wolfram Demonstrations Project.
- HSV to RGB by CodeBeautify.
