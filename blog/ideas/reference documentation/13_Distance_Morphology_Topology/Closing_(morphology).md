# Closing (morphology)

In mathematical morphology, the closing of a set (binary image) A by a structuring element B is the erosion of the dilation of that set,

$A\bullet B=(A\oplus B)\ominus B,\,$

where $\oplus$ and $\ominus$ denote the dilation and erosion, respectively.

In image processing, closing is, together with opening, the basic workhorse of morphological noise removal. Opening removes small objects, while closing removes small holes.


## Example

Perform Dilation ( $A\oplus B$ ):

Suppose A is the following 11 x 11 matrix and B is the following 3 x 3 matrix:

For each pixel in A that has a value of 1, superimpose B, with the center of B aligned with the corresponding pixel in A.

Each pixel of every superimposed B is included in the dilation of A by B.

The dilation of A by B is given by this 11 x 11 matrix.

$A\oplus B$ is given by :

Now, Perform Erosion on the result: ($A\oplus B$) $\ominus B$

$A\oplus B$ is the following 11 x 11 matrix and B is the following 3 x 3 matrix:

Assuming that the origin B is at its center, for each pixel in $A\oplus B$ superimpose the origin of B, if B is completely contained by A the pixel is retained, else deleted.

Therefore the Erosion of $A\oplus B$ by B is given by this 11 x 11 matrix.

($A\oplus B$) $\ominus B$ is given by:

Therefore Closing Operation fills small holes and smoothes the object by filling narrow gaps.


## Properties


- It is idempotent, that is, $(A\bullet B)\bullet B=A\bullet B$.
- It is increasing, that is, if $A\subseteq C$, then $A\bullet B\subseteq C\bullet B$.
- It is extensive, i.e., $A\subseteq A\bullet B$.
- It is translation invariant.


## See also


- Mathematical morphology
- Dilation
- Erosion
- Opening
- Top-hat transformation


## External links


- Introduction to mathematical morphology
