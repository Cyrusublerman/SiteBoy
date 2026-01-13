# Point in polygon

In computational geometry, the point-in-polygon (PIP) problem asks whether a given point in the plane lies inside, outside, or on the boundary of a polygon. It is a special case of point location problems and finds applications in areas that deal with processing geometrical data, such as computer graphics, computer vision, geographic information systems (GIS), motion planning, and computer-aided design (CAD).

An early description of the problem in computer graphics shows two common approaches (ray casting and angle summation) in use as early as 1974.

An attempt of computer graphics veterans to trace the history of the problem and some tricks for its solution can be found in an issue of the Ray Tracing News.


## Ray casting algorithm

One simple way of finding whether the point is inside or outside a simple polygon is to test how many times a ray, starting from the point and going in any fixed direction, intersects the edges of the polygon. If the point is on the outside of the polygon the ray will intersect its edge an even number of times. If the point is on the inside of the polygon then it will intersect the edge an odd number of times. The status of a point on the edge of the polygon depends on the details of the ray intersection algorithm.

This algorithm is sometimes also known as the crossing number algorithm or the even–odd rule algorithm, and was known as early as 1962. The algorithm is based on a simple observation that if a point moves along a ray from infinity to the probe point and if it crosses the boundary of a polygon, possibly several times, then it alternately goes from the outside to inside, then from the inside to the outside, etc. As a result, after every two "border crossings" the moving point goes outside. This observation may be mathematically proved using the Jordan curve theorem.


### Limited precision

If implemented on a computer with finite precision arithmetics, the results may be incorrect if the point lies very close to that boundary, because of rounding errors. For some applications, like video games or other entertainment products, this is not a large concern since they often favor speed over precision. However, for a formally correct computer program, one would have to introduce a numerical tolerance ε and test in line whether P (the point) lies within ε of L (the Line), in which case the algorithm should stop and report "P lies very close to the boundary."

Most implementations of the ray casting algorithm consecutively check intersections of a ray with all sides of the polygon in turn. In this case the following problem must be addressed. If the ray passes exactly through a vertex of a polygon, then it will intersect 2 segments at their endpoints. While it is OK for the case of the topmost vertex in the example or the vertex between crossing 4 and 5, the case of the rightmost vertex (in the example) requires that we count one intersection for the algorithm to work correctly. A similar problem arises with horizontal segments that happen to fall on the ray. The issue is solved as follows: If the intersection point is a vertex of a tested polygon side, then the intersection counts only if the other vertex of the side lies below the ray. This is effectively equivalent to considering vertices on the ray as lying slightly above the ray.

Once again, the case of the ray passing through a vertex may pose numerical problems in finite precision arithmetics: for two sides adjacent to the same vertex the straightforward computation of the intersection with a ray may not give the vertex in both cases. If the polygon is specified by its vertices, then this problem is eliminated by checking the y-coordinates of the ray and the ends of the tested polygon side before actual computation of the intersection. In other cases, when polygon sides are computed from other types of data, other tricks must be applied for the numerical robustness of the algorithm.


## Winding number algorithm

Another technique used to check if a point is inside a polygon is to compute the given point's winding number with respect to the polygon. If the winding number is non-zero, the point lies inside the polygon. This algorithm is sometimes also known as the nonzero-rule algorithm.

One way to compute the winding number is to sum up the angles subtended by each side of the polygon. However, this involves costly inverse trigonometric functions, which generally makes this algorithm performance-inefficient (slower) compared to the ray casting algorithm. Luckily, these inverse trigonometric functions do not need to be computed. Since the result, the sum of all angles, can add up to 0 or $2\pi$ (or multiples of $2\pi$) only, it is sufficient to track through which quadrants the polygon winds, as it turns around the test point, which makes the winding number algorithm comparable in speed to counting the boundary crossings.

An improved algorithm to calculate the winding number was developed by Dan Sunday in 2001. It does not use angles in calculations, nor any trigonometry, and functions exactly the same as the ray casting algorithms described above. Sunday's algorithm works by considering an infinite horizontal ray cast from the point being checked. Whenever that ray crosses an edge of the polygon, Juan Pineda's edge crossing algorithm (1988) is used to determine how the crossing will affect the winding number. As Sunday describes it, if the edge crosses the ray going "upwards", the winding number is incremented; if it crosses the ray "downwards", the number is decremented. Sunday's algorithm gives the correct answer for nonsimple polygons, whereas the boundary crossing algorithm fails in this case.


## Implementations


### SVG

Similar methods are used in SVG for defining a way of filling with color various shapes (such as path, polyline, polygon, text etc.). The algorithm of filling is influenced by 'fill-rule' attribute. The value may be either nonzero or evenodd. For example, in a pentagram, there is a central "hole" (visible background) with evenodd, and none with nonzero attribute.

For simple polygons, the algorithms will give the same result. However, for complex polygons, the algorithms may give different results for points in the regions where the polygon intersects itself, where the polygon does not have a clearly defined inside and outside. One solution using the even-odd rule is to transform (complex) polygons into simpler ones that are even-odd-equivalent before the intersection check. This, however, is computationally expensive. It is less expensive to use the fast non-zero winding number algorithm, which gives the correct result even when the polygon overlaps itself.


## Point in polygon queries

The point in polygon problem may be considered in the general repeated geometric query setting: given a single polygon and a sequence of query points, quickly find the answers for each query point. Clearly, any of the general approaches for planar point location may be used. Simpler solutions are available for some special polygons.


### Special cases

Simpler algorithms are possible for monotone polygons, star-shaped polygons, convex polygons and triangles.

The triangle case can be solved easily by use of a barycentric coordinate system, parametric equation or dot product. The dot product method extends naturally to any convex polygon.


## See also


- Java Topology Suite (JTS)
- Discussion: http://www.ics.uci.edu/~eppstein/161/960307.html
- Winding number versus crossing number methods: https://web.archive.org/web/20131210180851/http://geomalgorithms.com/a03-_inclusion.html, also available at Scribd https://www.scribd.com/document/735206906/Inclusion-of-a-Point-in-a-Polygon (subscription required)
