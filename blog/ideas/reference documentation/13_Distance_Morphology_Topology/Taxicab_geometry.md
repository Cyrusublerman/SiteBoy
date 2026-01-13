# Taxicab geometry

Taxicab geometry or Manhattan geometry is geometry where the familiar Euclidean distance is ignored, and the distance between two points is instead defined to be the sum of the absolute differences of their respective Cartesian coordinates, a distance function (or metric) called the taxicab distance, Manhattan distance, or city block distance. The name refers to the island of Manhattan, or generically any planned city with a rectangular grid of streets, in which a taxicab can only travel along grid directions. In taxicab geometry, the distance between any two points equals the length of their shortest grid path. This different definition of distance also leads to a different definition of the length of a curve, for which a line segment between any two points has the same length as a grid path between those points rather than its Euclidean length.

The taxicab distance is also sometimes known as rectilinear distance or L distance (see Lp space). This geometry has been used in regression analysis since the 18th century, and is often referred to as LASSO. Its geometric interpretation dates to non-Euclidean geometry of the 19th century and is due to Hermann Minkowski.

In the two-dimensional real coordinate space $\mathbb {R} ^{2}$, the taxicab distance between two points $(x_{1},y_{1})$ and $(x_{2},y_{2})$ is $\left|x_{1}-x_{2}\right|+\left|y_{1}-y_{2}\right|$. That is, it is the sum of the absolute values of the differences in both coordinates.


## Formal definition

The taxicab distance, $d_{\text{T}}$, between two points
$$\mathbf {p} =(p_{1},p_{2},\dots ,p_{n}){\text{ and }}\mathbf {q} =(q_{1},q_{2},\dots ,q_{n})
$$in an n-dimensional real coordinate space with fixed Cartesian coordinate system, is the sum of the lengths of the projections of the line segment between the points onto the coordinate axes. More formally,
$$d_{\text{T}}(\mathbf {p} ,\mathbf {q} )=\left\|\mathbf {p} -\mathbf {q} \right\|_{\text{T}}=\sum _{i=1}^{n}\left|p_{i}-q_{i}\right|
$$For example, in $\mathbb {R} ^{2}$, the taxicab distance between $\mathbf {p} =(p_{1},p_{2})$ and $\mathbf {q} =(q_{1},q_{2})$ is $\left|p_{1}-q_{1}\right|+\left|p_{2}-q_{2}\right|.$


## History

The L metric was used in regression analysis, as a measure of goodness of fit, in 1757 by Roger Joseph Boscovich. The interpretation of it as a distance between points in a geometric space dates to the late 19th century and the development of non-Euclidean geometries. Notably it appeared in 1910 in the works of both Frigyes Riesz and Hermann Minkowski. The formalization of Lp spaces, which include taxicab geometry as a special case, is credited to Riesz. In developing the geometry of numbers, Hermann Minkowski established his Minkowski inequality, stating that these spaces define normed vector spaces.

The name taxicab geometry was introduced by Karl Menger in a 1952 booklet You Will Like Geometry, accompanying a geometry exhibit intended for the general public at the Museum of Science and Industry in Chicago.


## Properties

Thought of as an additional structure layered on Euclidean space, taxicab distance depends on the orientation of the coordinate system and is changed by Euclidean rotation of the space, but is unaffected by translation or axis-aligned reflections. Taxicab geometry satisfies all of Hilbert's axioms (a formalization of Euclidean geometry) except that the congruence of angles cannot be defined to precisely match the Euclidean concept, and under plausible definitions of congruent taxicab angles, the side-angle-side axiom is not satisfied as in general triangles with two taxicab-congruent sides and a taxicab-congruent angle between them are not congruent triangles.


### Spheres

In any metric space, a sphere is a set of points at a fixed distance, the radius, from a specific center point. Whereas a Euclidean sphere is round and rotationally symmetric, under the taxicab distance, the shape of a sphere is a cross-polytope, the n-dimensional generalization of a regular octahedron, whose points $\mathbf {p}$ satisfy the equation:


$$d_{\text{T}}(\mathbf {p} ,\mathbf {c} )=\sum _{i=1}^{n}|p_{i}-c_{i}|=r,
$$

where $\mathbf {c}$ is the center and r is the radius. Points $\mathbf {p}$ on the unit sphere, a sphere of radius 1 centered at the origin, satisfy the equation
$${\textstyle d_{\text{T}}(\mathbf {p} ,\mathbf {0} )=\sum _{i=1}^{n}|p_{i}|=1.}
$$

In two dimensional taxicab geometry, the sphere (called a circle) is a square oriented diagonally to the coordinate axes. The image to the right shows in red the set of all points on a square grid with a fixed distance from the blue center. As the grid is made finer, the red points become more numerous, and in the limit tend to a continuous tilted square. Each side has taxicab length 2r, so the circumference is 8r. Thus, in taxicab geometry, the value of the analog of the circle constant π, the ratio of circumference to diameter, is equal to 4.

A closed ball (or closed disk in the 2-dimensional case) is a filled-in sphere, the set of points at distance less than or equal to the radius from a specific center. For cellular automata on a square grid, a taxicab disk is the von Neumann neighborhood of range r of its center.

A circle of radius r for the Chebyshev distance (L∞ metric) on a plane is also a square with side length 2r parallel to the coordinate axes, so planar Chebyshev distance can be viewed as equivalent by rotation and scaling to planar taxicab distance. However, this equivalence between L1 and L∞ metrics does not generalize to higher dimensions.

Whenever each pair in a collection of these circles has a nonempty intersection, there exists an intersection point for the whole collection; therefore, the Manhattan distance forms an injective metric space.


### Arc length

Let $y=f(x)$ be a continuously differentiable function. Let $s$ be the taxicab arc length of the graph of $f$ on some interval $[a,b]$. Take a partition of the interval into equal infinitesimal subintervals, and let $\Delta s_{i}$ be the taxicab length of the $i^{\text{th}}$ subarc. Then


$$\Delta s_{i}=\Delta x_{i}+\Delta y_{i}=\Delta x_{i}+|f(x_{i})-f(x_{i-1})|.
$$

By the mean value theorem, there exists some point $x_{i}^{*}$ between $x_{i}$ and $x_{i-1}$ such that $f(x_{i})-f(x_{i-1})=f'(x_{i}^{*})dx_{i}$. Then the previous equation can be written


$$\Delta s_{i}=\Delta x_{i}+|f'(x_{i}^{*})|\Delta x_{i}=\Delta x_{i}(1+|f'(x_{i}^{*})|).
$$

Then $s$ is given as the sum of every partition of $s$ on $[a,b]$ as they get arbitrarily small.


$${\begin{aligned}s&=\lim _{n\to \infty }\sum _{i=1}^{n}\Delta x_{i}(1+|f'(x_{i}^{*})|)\\&=\int _{a}^{b}1+|f'(x)|\,dx\end{aligned}}
$$To test this, take the taxicab circle of radius $r$ centered at the origin. Its curve in the first quadrant is given by $f(x)=-x+r$ whose length is

$s=\int _{0}^{r}1+|-1|dx=2r$

Multiplying this value by $4$ to account for the remaining quadrants gives $8r$, which agrees with the circumference of a taxicab circle. Now take the Euclidean circle of radius $r$ centered at the origin, which is given by $f(x)={\sqrt {r^{2}-x^{2}}}$. Its arc length in the first quadrant is given by


$${\begin{aligned}s&=\int _{0}^{r}1+\left|{\frac {-x}{\sqrt {r^{2}-x^{2}}}}\right|dx\\&=\left.x+{\sqrt {r^{2}-x^{2}}}\right|_{0}^{r}\\&=r-(-r)\\&=2r\end{aligned}}
$$

Accounting for the remaining quadrants gives $4\times 2r=8r$ again. Therefore, the circumference of the taxicab circle and the Euclidean circle in the taxicab metric are equal. In fact, for any function $f$ that is monotonic and differentiable with a continuous derivative over an interval $[a,b]$, the arc length of $f$ over $[a,b]$ is $(b-a)+\mid f(b)-f(a)\mid$.


### Triangle congruence

Two triangles are congruent if and only if three corresponding sides are equal in distance and three corresponding angles are equal in measure. There are several theorems that guarantee triangle congruence in Euclidean geometry, namely Angle-Angle-Side (AAS), Angle-Side-Angle (ASA), Side-Angle-Side (SAS), and Side-Side-Side (SSS). In taxicab geometry, however, only SASAS guarantees triangle congruence.

Take, for example, two right isosceles taxicab triangles whose angles measure 45-90-45. The two legs of both triangles have a taxicab length 2, but the hypotenuses are not congruent. This counterexample eliminates AAS, ASA, and SAS. It also eliminates AASS, AAAS, and even ASASA. Having three congruent angles and two sides does not guarantee triangle congruence in taxicab geometry. Therefore, the only triangle congruence theorem in taxicab geometry is SASAS, where all three corresponding sides must be congruent and at least two corresponding angles must be congruent. This result is mainly due to the fact that the length of a line segment depends on its orientation in taxicab geometry.


## Applications


### Compressed sensing

In solving an underdetermined system of linear equations, the regularization term for the parameter vector is expressed in terms of the $\ell _{1}$ norm (taxicab geometry) of the vector. This approach appears in the signal recovery framework called compressed sensing.


### Differences of frequency distributions

Taxicab geometry can be used to assess the differences in discrete frequency distributions. For example, in RNA splicing positional distributions of hexamers, which plot the probability of each hexamer appearing at each given nucleotide near a splice site, can be compared with L1-distance. Each position distribution can be represented as a vector where each entry represents the likelihood of the hexamer starting at a certain nucleotide. A large L1-distance between the two vectors indicates a significant difference in the nature of the distributions while a small distance denotes similarly shaped distributions. This is equivalent to measuring the area between the two distribution curves because the area of each segment is the absolute difference between the two curves' likelihoods at that point. When summed together for all segments, it provides the same measure as L1-distance.


## See also


- Chebyshev distance
- Hamming distance – The number of differing bits between two strings of binary digits
- Lee distance
- Orthogonal convex hull – Minimal superset that intersects each axis-parallel line in an interval
- Staircase paradox – The paradox that the limit of the lengths of finer and finer "staircase curves" does not tend to the length of the diagonal line segment the curves tend towards


## Further reading


- Gardner, Martin (1997). "10. Taxicab Geometry". The Last Recreations. Copernicus. pp. 159–176. ISBN 0-387-94929-1.
- Krause, Eugene F. (1975). Taxicab Geometry. Addison-Wesley. ISBN 0201039346. Reprinted by Dover (1986), ISBN 0-486-25202-7.
- Strogatz, Steven (2025-06-09). "Taxicab Geometry". The New York Times.


## External links


- Weisstein, Eric W. "Taxicab Metric". MathWorld.
- Malkevitch, Joe (October 1, 2007). "Taxi!". American Mathematical Society. Retrieved October 6, 2019.
- Taxicab metric with stoplights
