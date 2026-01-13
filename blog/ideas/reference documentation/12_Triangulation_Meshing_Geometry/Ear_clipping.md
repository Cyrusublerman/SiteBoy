# Ear clipping

In computational geometry, polygon triangulation is the partition of a polygonal area (simple polygon) P into a set of triangles, i.e., finding a set of triangles with pairwise non-intersecting interiors whose union is P.

Triangulations may be viewed as special cases of planar straight-line graphs. When there are no holes or added points, triangulations form maximal outerplanar graphs.


## Polygon triangulation without extra vertices

Over time, a number of algorithms have been proposed to triangulate a polygon.


### Special cases

It is trivial to triangulate any convex polygon in linear time into a fan triangulation, by adding diagonals from one vertex to all other non-nearest neighbor vertices.

The total number of ways to triangulate a convex n-gon by non-intersecting diagonals is the (n−2)nd Catalan number, which equals

a formula found by Leonhard Euler.

A monotone polygon can be triangulated in linear time with either the algorithm of A. Fournier and D.Y. Montuno, or the algorithm of Godfried Toussaint.


### Ear clipping method

One way to triangulate a simple polygon is based on the two ears theorem, as the fact that any simple polygon with at least 4 vertices without holes has at least two "ears", which are triangles with two sides being the edges of the polygon and the third one completely inside it. The algorithm then consists of finding such an ear, removing it from the polygon (which results in a new polygon that still meets the conditions) and repeating until there is only one triangle left.

This algorithm is easy to implement, but slower than some other algorithms, and it only works on polygons without holes. An implementation that keeps separate lists of convex and concave vertices will run in O(n2) time. This method is known as ear clipping and sometimes ear trimming. An efficient algorithm for cutting off ears was discovered by Hossam ElGindy, Hazel Everett, and Godfried Toussaint.


### Monotone polygon triangulation

A simple polygon is monotone with respect to a line L, if any line orthogonal to L intersects the polygon at most twice. A monotone polygon can be split into two monotone chains. A polygon that is monotone with respect to the y-axis is called y-monotone. A monotone polygon with n vertices can be triangulated in O(n) time. Assuming a given polygon is y-monotone, the greedy algorithm begins by walking on one chain of the polygon from top to bottom while adding diagonals whenever it is possible. It is easy to see that the algorithm can be applied to any monotone polygon.


### Triangulating a non-monotone polygon

If a polygon is not monotone, it can be partitioned into monotone subpolygons in O(n log n) time using a sweep-line approach. The algorithm does not require the polygon to be simple, thus it can be applied to polygons with holes. Generally, this algorithm can triangulate a planar subdivision with n vertices in O(n log n) time using O(n) space.


### Dual graph of a triangulation

A useful graph that is often associated with a triangulation of a polygon P is the dual graph. Given a triangulation TP of P, one defines the graph G(TP) as the graph whose vertex set are the triangles of TP, two vertices (triangles) being adjacent if and only if they share a diagonal. It is easy to observe that G(TP) is a tree with maximum degree 3.


### Computational complexity

Until 1988, whether a simple polygon can be triangulated faster than O(n log n) time was an open problem in computational geometry. Then, Tarjan & Van Wyk (1988) discovered an O(n log log n)-time algorithm for triangulation, later simplified by Kirkpatrick, Klawe & Tarjan (1992). Several improved methods with complexity O(n log* n) (in practice, indistinguishable from linear time) followed.

Bernard Chazelle showed in 1991 that any simple polygon can be triangulated in linear time, though the proposed algorithm is very complex. A simpler randomized algorithm with linear expected time is also known.

Seidel's decomposition algorithm and Chazelle's triangulation method are discussed in detail in Li & Klette (2011).

The time complexity of triangulation of an n-vertex polygon with holes has an Ω(n log n) lower bound, in algebraic computation tree models of computation. It is possible to compute the number of distinct triangulations of a simple polygon in polynomial time using dynamic programming, and (based on this counting algorithm) to generate uniformly random triangulations in polynomial time. However, counting the triangulations of a polygon with holes is #P-complete, making it unlikely that it can be done in polynomial time.


## Related objects and problems


- Both triangulation problems are a special case of triangulation (geometry) and a special case of polygon partition.
- Minimum-weight triangulation is a triangulation in which the goal is to minimize the total edge length.
- A point-set triangulation is a polygon triangulation of the convex hull of a set of points. A Delaunay triangulation is another way to create a triangulation based on a set of points.
- The associahedron is a polytope whose vertices correspond to the triangulations of a convex polygon.
- Polygon triangle covering, in which the triangles may overlap.
- Tiling by polygons, where the goal is to cover the entire plane with polygons of pre-specified shapes.


## See also


- Nonzero-rule
- Catalan number
- Planar graph
- Flip graph


## External links


- Demo as Flash swf, A Sweep Line algorithm.
- Song Ho's explanation of the OpenGL GLU tesselator
