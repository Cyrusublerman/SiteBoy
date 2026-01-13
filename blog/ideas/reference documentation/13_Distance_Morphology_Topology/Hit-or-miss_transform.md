# Hit-or-miss transform

In mathematical morphology, hit-or-miss transform is an operation that detects a given configuration (or pattern) in a binary image, using the morphological erosion operator and a pair of disjoint structuring elements. The result of the hit-or-miss transform is the set of positions where the first structuring element fits in the foreground of the input image, and the second structuring element misses it completely.


## Mathematical definition

In binary morphology, an image is viewed as a subset of a Euclidean space $\mathbb {R} ^{d}$ or the integer grid $\mathbb {Z} ^{d}$, for some dimension d. Let us denote this space or grid by E.

A structuring element is a simple, pre-defined shape, represented as a binary image, used to probe another binary image, in morphological operations such as erosion, dilation, opening, and closing.

Let $C$ and $D$ be two structuring elements satisfying $C\cap D=\emptyset$. The pair (C,D) is sometimes called a composite structuring element. The hit-or-miss transform of a given image A by B=(C,D) is given by:

A ⊙ B = ( A ⊖ C ) ∩ ( A c ⊖ D ) {\displaystyle A\odot B=(A\ominus C)\cap (A^{c}\ominus D)} ,

$A\odot B=(A\ominus C)\cap (A^{c}\ominus D)$,

where $A^{c}$ is the set complement of A.

That is, a point x in E belongs to the hit-or-miss transform output if C translated to x fits in A, and D translated to x misses A (fits the background of A).


## Structuring elements

The hit-or-miss transform uses pairs of structuring elements that are disjoint. Here are four common structuring elements used in various morphological operations.

The following structuring elements are designed to match patterns where the corner pixel and the pixels directly adjacent form a specific configuration and can be used to find different convex corner points in binary images. In these masks, '1's indicate the corner and its surroundings, '0's represent the background, and 'X's are don't-care conditions.


- Mask for bottom-left corner [dubious – discuss]
- Mask for top-left corner
- Mask for top-right corner [dubious – discuss]
- Mask for bottom-right corner

After obtaining the locations of corners in each orientation, we can then simply OR (Logic OR) all these images together to get the final result showing the locations of all right angle convex corners in any orientation.


## Some applications


### Thinning

Let $E=\mathbb {Z} ^{2}$, and consider the eight composite structuring elements, composed of:

$C_{1}=\{(0,0),(-1,-1),(0,-1),(1,-1)\}$ and $D_{1}=\{(-1,1),(0,1),(1,1)\}$,

$C_{2}=\{(-1,0),(0,0),(-1,-1),(0,-1)\}$ and $D_{2}=\{(0,1),(1,1),(1,0)\}$

and the three rotations of each by 90°, 180°, and 270°. The corresponding composite structuring elements are denoted $B_{1},\ldots ,B_{8}$.

For any i between 1 and 8, and any binary image X, define

X ⊗ B i = X ∖ ( X ⊙ B i ) , {\displaystyle X\otimes B_{i}=X\setminus (X\odot B_{i}),}

$X\otimes B_{i}=X\setminus (X\odot B_{i}),$

where $\setminus$ denotes the set-theoretical difference.

The thinning of an image A is obtained by cyclically iterating until convergence:


$$A\otimes B_{1}\otimes B_{2}\otimes \ldots \otimes B_{8}\otimes B_{1}\otimes B_{2}\otimes \ldots
$$


### Other applications


- Pattern detection. By definition, the hit-or-miss transform indicates the positions where a certain pattern (characterized by the composite structuring element B) occurs in the input image.
- Pruning. The hit-or-miss transform can be used to identify the end-points of a line to allow this line to be shrunk from each end to remove unwanted branches.
- Computing the Euler number.
