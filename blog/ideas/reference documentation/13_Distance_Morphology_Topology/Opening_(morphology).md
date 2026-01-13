# Opening (morphology)

In mathematical morphology, opening is the dilation of the erosion of a set A by a structuring element B:

$A\circ B=(A\ominus B)\oplus B,\,$

where $\ominus$ and $\oplus$ denote erosion and dilation, respectively.

Together with closing, the opening serves in computer vision and image processing as a basic workhorse of morphological noise removal. Opening removes small objects from the foreground (usually taken as the bright pixels) of an image, placing them in the background, while closing removes small holes in the foreground, changing small islands of background into foreground. These techniques can also be used to find specific shapes in an image. Opening can be used to find things into which a specific structuring element can fit (edges, corners, ...).

One can think of B sweeping around the inside of the boundary of A, so that it does not extend beyond the boundary, and shaping the A boundary around the boundary of the element.


## Properties


- Opening is idempotent, that is, $(A\circ B)\circ B=A\circ B$.
- Opening is increasing, that is, if $A\subseteq C$, then $A\circ B\subseteq C\circ B$.
- Opening is anti-extensive, i.e., $A\circ B\subseteq A$.
- Opening is translation invariant.
- Opening and closing satisfy the duality $A\bullet B=(A^{c}\circ B^{c})^{c}$, where $\bullet$ denotes closing.


## Example

Perform Erosion $(A\ominus B)$:

Suppose A is the following 16 x 15 matrix and B is the following 3 x 3 matrix:

First, perform Erosion on A by B $(A\ominus B$):

Assuming that the origin of B is at its center, for each pixel in A superimpose the origin of B, if B is completely contained by A the pixel is retained, else deleted.

Therefore the Erosion of A by B is given by this 16 x 15 matrix.

$(A\ominus B)$ is given by:

Then, perform Dilation on the result of Erosion by B: $(A\ominus B)\oplus B$:

For each pixel in $(A\ominus B)$ that has a value of 1, superimpose B, with the center of B aligned with the corresponding pixel in $(A\ominus B)$.

Each pixel of every superimposed B is included in the dilation of A by B.

The dilation of $(A\ominus B)$ by B is given by this 16 x 15 matrix.

$(A\ominus B)\oplus B$ is given by :

Therefore, the opening operation $A\circ B$ removes small protrusions from the boundary of the object represented by A, while preserving the overall shape and size of the larger components.


## Extension: Opening by reconstruction

In morphological opening $(A\ominus B)\oplus B$, the erosion operation removes objects that are smaller than structuring element B and the dilation operation (approximately) restores the size and shape of the remaining objects. However, restoration accuracy in the dilation operation depends highly on the type of structuring element and the shape of the restoring objects. The opening by reconstruction method is able to restore the objects more completely after erosion has been applied. It is defined as the reconstruction by geodesic dilation of $n$ erosions of $F$ by $B$ with respect to $F$ :

$O_{R}^{(n)}(F)=R_{F}^{D}[(F\ominus nB)],$

where $(F\ominus nB)$ denotes a marker image and $F$ is a mask image in morphological reconstruction by dilation.
$$R_{F}^{D}[(F\ominus nB)]=D_{F}^{(k)}[(F\ominus nB)],
$$$D$ denotes geodesic dilation with $k$ iterations until stability, i.e., such that
$$D_{F}^{(k)}[(F\ominus nB)]=D_{F}^{(k-1)}[(F\ominus nB)].
$$Since
$$D_{F}^{(1)}[(F\ominus nB)]=([(F\ominus nB)]\oplus B)\cap F
$$, the marker image is limited in the growth region by the mask image, so the dilation operation on the marker image will not expand beyond the mask image. As a result, the marker image is a subset of the mask image $(F\ominus nB)\subseteq F.$ (Strictly, this holds for binary masks only. However, similar statements hold when the mask is not binary.)

The images below present a simple opening-by-reconstruction example which extracts the vertical strokes from an input text image. Since the original image is converted from grayscale to binary image, it has a few distortions in some characters so that same characters might have different vertical lengths. In this case, the structuring element is an 8-pixel vertical line which is applied in the erosion operation in order to find objects of interest. Moreover, morphological reconstruction by dilation,
$$R_{F}^{D}[(F\ominus nB)]=D_{F}^{(k)}[(F\ominus nB)]
$$iterates $k=9$ times until the resulting image converges.


## See also


- Mathematical morphology
- Closing
- Dilation
- Erosion


## External links


- http://homepages.inf.ed.ac.uk/rbf/HIPR2/open.htm - Morphological Opening
