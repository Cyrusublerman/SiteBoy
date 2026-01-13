# Dilation (morphology)

Dilation (usually represented by ⊕) is one of the basic operations in mathematical morphology. Originally developed for binary images, it has been expanded first to grayscale images, and then to complete lattices. The dilation operation usually uses a structuring element for probing and expanding the shapes contained in the input image.


## Binary dilation

In binary morphology, dilation is a shift-invariant (translation invariant) operator, equivalent to Minkowski addition.

A binary image is viewed in mathematical morphology as a subset of a Euclidean space R or the integer grid Z, for some dimension d. Let E be a Euclidean space or an integer grid, A a binary image in E, and B a structuring element regarded as a subset of R.

The dilation of A by B is defined by

A ⊕ B = ⋃ b ∈ B A b , {\displaystyle A\oplus B=\bigcup _{b\in B}A_{b},}

$A\oplus B=\bigcup _{b\in B}A_{b},$

where Ab is the translation of A by b.

Dilation is commutative, also given by $A\oplus B=B\oplus A=\bigcup _{a\in A}B_{a}$.

If B has a center on the origin, then the dilation of A by B can be understood as the locus of the points covered by B when the center of B moves inside A. The dilation of a square of size 10, centered at the origin, by a disk of radius 2, also centered at the origin, is a square of size 14, with rounded corners, centered at the origin. The radius of the rounded corners is 2.

The dilation can also be obtained by
$$A\oplus B=\{z\in E\mid (B^{s})_{z}\cap A\neq \varnothing \}
$$, where B denotes the symmetric of B, that is, $B^{s}=\{x\in E\mid -x\in B\}$.


### Example

Suppose A is the following 11 x 11 matrix and B is the following 3 x 3 matrix:

For each pixel in A that has a value of 1, superimpose B, with the center of B aligned with the corresponding pixel in A.

Each pixel of every superimposed B is included in the dilation of A by B.

The dilation of A by B is given by this 11 x 11 matrix.


### Properties of binary dilation

Here are some properties of the binary dilation operator


- It is translation invariant.
- It is increasing, that is, if $A\subseteq C$, then $A\oplus B\subseteq C\oplus B$.
- It is commutative.
- If the origin of E belongs to the structuring element B, then it is extensive, i.e., $A\subseteq A\oplus B$.
- It is associative, i.e., $(A\oplus B)\oplus C=A\oplus (B\oplus C)$.
- It is distributive over set union


## Grayscale dilation

In grayscale morphology, images are functions mapping a Euclidean space or grid E into $\mathbb {R} \cup \{\infty ,-\infty \}$, where $\mathbb {R}$ is the set of reals, $\infty$ is an element greater than any real number, and $-\infty$ is an element less than any real number.

Grayscale structuring elements are also functions of the same format, called "structuring functions".

Denoting an image by f(x) and the structuring function by b(x), the grayscale dilation of f by b is given by

( f ⊕ b ) ( x ) = sup y ∈ E [ f ( y ) + b ( x − y ) ] , {\displaystyle (f\oplus b)(x)=\sup _{y\in E}[f(y)+b(x-y)],}

$(f\oplus b)(x)=\sup _{y\in E}[f(y)+b(x-y)],$

where "sup" denotes the supremum.


### Flat structuring functions

It is common to use flat structuring elements in morphological applications. Flat structuring functions are functions b(x) in the form

b ( x ) = { 0 , x ∈ B , − ∞ , otherwise , {\displaystyle b(x)=\left\{{\begin{array}{ll}0,&x\in B,\\-\infty ,&{\text{otherwise}},\end{array}}\right.}


$$b(x)=\left\{{\begin{array}{ll}0,&x\in B,\\-\infty ,&{\text{otherwise}},\end{array}}\right.
$$

where $B\subseteq E$.

In this case, the dilation is greatly simplified, and given by

( f ⊕ b ) ( x ) = sup y ∈ E [ f ( y ) + b ( x − y ) ] = sup z ∈ E [ f ( x − z ) + b ( z ) ] = sup z ∈ B [ f ( x − z ) ] . {\displaystyle (f\oplus b)(x)=\sup _{y\in E}[f(y)+b(x-y)]=\sup _{z\in E}[f(x-z)+b(z)]=\sup _{z\in B}[f(x-z)].}


$$(f\oplus b)(x)=\sup _{y\in E}[f(y)+b(x-y)]=\sup _{z\in E}[f(x-z)+b(z)]=\sup _{z\in B}[f(x-z)].
$$

(Suppose x = (px, qx), z = (pz, qz), then x − z = (px − pz, qx − qz).)

In the bounded, discrete case (E is a grid and B is bounded), the supremum operator can be replaced by the maximum. Thus, dilation is a particular case of order statistics filters, returning the maximum value within a moving window (the symmetric of the structuring function support B).


## Dilation on complete lattices

Complete lattices are partially ordered sets, where every subset has an infimum and a supremum. In particular, it contains a least element and a greatest element (also denoted "universe").

Let $(L,\leq )$ be a complete lattice, with infimum and supremum symbolized by $\wedge$ and $\vee$, respectively. Its universe and least element are symbolized by U and $\varnothing$, respectively. Moreover, let $\{X_{i}\}$ be a collection of elements from L.

A dilation is any operator $\delta :L\rightarrow L$ that distributes over the supremum, and preserves the least element. That is, the following are true:


- 
$$\bigvee _{i}\delta (X_{i})=\delta \left(\bigvee _{i}X_{i}\right),
$$
- $\delta (\varnothing )=\varnothing .$


## See also


- Buffer (GIS)
- Closing (morphology)
- Erosion (morphology)
- Mathematical morphology
- Opening (morphology)
- Minkowski addition
- Parallel curve
