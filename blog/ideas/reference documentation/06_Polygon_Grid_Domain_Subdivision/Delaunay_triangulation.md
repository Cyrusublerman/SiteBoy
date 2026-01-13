# Delaunay triangulation

In computational geometry, a Delaunay triangulation or Delone triangulation of a set of points in the plane subdivides their convex hull into triangles whose circumcircles do not contain any of the points; that is, each circumcircle has its generating points on its circumference, but all other points in the set are outside of it. This maximizes the size of the smallest angle in any of the triangles, and tends to avoid sliver triangles.

The triangulation is named after Boris Delaunay for his work on it from 1934.

If the points all lie on a straight line, the notion of triangulation becomes degenerate and there is no Delaunay triangulation. For four or more points on the same circle (e.g., the vertices of a rectangle) the Delaunay triangulation is not unique: each of the two possible triangulations that split the quadrangle into two triangles satisfies the "Delaunay condition", i.e., the requirement that the circumcircles of all triangles have empty interiors.

By considering circumscribed spheres, the notion of Delaunay triangulation extends to three and higher dimensions. Generalizations are possible to metrics other than Euclidean distance. However, in these cases a Delaunay triangulation is not guaranteed to exist or be unique.


## Relationship with the Voronoi diagram

The Delaunay triangulation of a discrete point set P in general position corresponds to the dual graph of the Voronoi diagram for P. The circumcenters of Delaunay triangles are the vertices of the Voronoi diagram. In the 2D case, the Voronoi vertices are connected via edges, that can be derived from adjacency-relationships of the Delaunay triangles: If two triangles share an edge in the Delaunay triangulation, their circumcenters are to be connected with an edge in the Voronoi tesselation.

Special cases where this relationship does not hold, or is ambiguous, include cases like:


- Three or more collinear points, where the circumcircles are of infinite radii.
- Four or more points on a perfect circle, where the triangulation is ambiguous and all circumcenters are trivially identical. In this case the Voronoi diagram contains vertices of degree four or greater and its dual graph contains polygonal faces with four or more sides. The various triangulations of these faces complete the various possible Delaunay triangulations.
- Edges of the Voronoi diagram going to infinity are not defined by this relation in case of a finite set P. If the Delaunay triangulation is calculated using the Bowyer–Watson algorithm then the circumcenters of triangles having a common vertex with the "super" triangle should be ignored. Edges going to infinity start from a circumcenter and they are perpendicular to the common edge between the kept and ignored triangle.


## d-dimensional Delaunay

For a set P of points in the (d-dimensional) Euclidean space, a Delaunay triangulation is a triangulation DT(P) such that no point in P is inside the circum-hypersphere of any d-simplex in DT(P). It is known that there exists a unique Delaunay triangulation for P if P is a set of points in general position; that is, the affine hull of P is d-dimensional and no set of d + 2 points in P lie on the boundary of a ball whose interior does not intersect P.

The problem of finding the Delaunay triangulation of a set of points in d-dimensional Euclidean space can be converted to the problem of finding the convex hull of a set of points in (d + 1)-dimensional space. This may be done by giving each point p an extra coordinate equal to |p|, thus turning it into a hyper-paraboloid (this is termed "lifting"); taking the bottom side of the convex hull (as the top end-cap faces upwards away from the origin, and must be discarded); and mapping back to d-dimensional space by deleting the last coordinate. As the convex hull is unique, so is the triangulation, assuming all facets of the convex hull are simplices. Nonsimplicial facets only occur when d + 2 of the original points lie on the same d-hypersphere, i.e., the points are not in general position.


## Properties

Let n be the number of points and d the number of dimensions.


- The union of all simplices in the triangulation is the convex hull of the points.
- The Delaunay triangulation contains ⁠
$$\textstyle O{\bigl (}n^{\lceil d/2\rceil }{\bigr )}
$$⁠ simplices.
- In the plane (d = 2), if there are b vertices on the convex hull, then any triangulation of the points has at most 2n – 2 – b triangles, plus one exterior face (see Euler characteristic).
- If points are distributed according to a Poisson process in the plane with constant intensity, then each vertex has on average six surrounding triangles. More generally for the same process in d dimensions the average number of neighbors is a constant depending only on d.
- In the plane, the Delaunay triangulation maximizes the minimum angle. Compared to any other triangulation of the points, the smallest angle in the Delaunay triangulation is at least as large as the smallest angle in any other. However, the Delaunay triangulation does not necessarily minimize the maximum angle. The Delaunay triangulation also does not necessarily minimize the length of the edges.
- A circle circumscribing any Delaunay triangle does not contain any other input points in its interior.
- If a circle passing through two of the input points doesn't contain any other input points in its interior, then the segment connecting the two points is an edge of a Delaunay triangulation of the given points.
- Each triangle of the Delaunay triangulation of a set of points in d-dimensional spaces corresponds to a facet of convex hull of the projection of the points onto a (d + 1)-dimensional paraboloid, and vice versa.
- The closest neighbor b to any point p is on an edge bp in the Delaunay triangulation since the nearest neighbor graph is a subgraph of the Delaunay triangulation.
- The Delaunay triangulation is a geometric spanner: In the plane (d = 2), the shortest path between two vertices, along Delaunay edges, is known to be no longer than 1.998 times the Euclidean distance between them.


## Visual Delaunay definition: Flipping

From the above properties an important feature arises: Looking at two triangles △ABD, △BCD with the common edge BD (see figures), if the sum of the angles α + γ ≤ 180°, the triangles meet the Delaunay condition.

This is an important property because it allows the use of a flipping technique. If two triangles do not meet the Delaunay condition, switching the common edge BD for the common edge AC produces two triangles that do meet the Delaunay condition:


- This triangulation does not meet the Delaunay condition (the sum of α and γ is bigger than 180°).
- This pair of triangles does not meet the Delaunay condition (there is a point within the interior of the circumcircle).
- Flipping the common edge produces a valid Delaunay triangulation for the four points.

This operation is called a flip, and can be generalised to three and higher dimensions.


## Algorithms

Many algorithms for computing Delaunay triangulations rely on fast operations for detecting when a point is within a triangle's circumcircle and an efficient data structure for storing triangles and edges. In two dimensions, one way to detect if point D lies in the circumcircle of A, B, C is to evaluate the determinant:


$${\begin{aligned}&{\begin{vmatrix}A_{x}&A_{y}&A_{x}^{2}+A_{y}^{2}&1\\B_{x}&B_{y}&B_{x}^{2}+B_{y}^{2}&1\\C_{x}&C_{y}&C_{x}^{2}+C_{y}^{2}&1\\D_{x}&D_{y}&D_{x}^{2}+D_{y}^{2}&1\end{vmatrix}}\\[8pt]={}&{\begin{vmatrix}A_{x}-D_{x}&A_{y}-D_{y}&(A_{x}-D_{x})^{2}+(A_{y}-D_{y})^{2}\\B_{x}-D_{x}&B_{y}-D_{y}&(B_{x}-D_{x})^{2}+(B_{y}-D_{y})^{2}\\C_{x}-D_{x}&C_{y}-D_{y}&(C_{x}-D_{x})^{2}+(C_{y}-D_{y})^{2}\end{vmatrix}}>0\end{aligned}}
$$

When A, B, C are sorted in a counterclockwise order, this determinant is positive only if D lies inside the circumcircle.


### Flip algorithms

As mentioned above, if a triangle is non-Delaunay, we can flip one of its edges. This leads to a straightforward algorithm: construct any triangulation of the points, and then flip edges until no triangle is non-Delaunay. Unfortunately, this can take Ω(n) edge flips. While this algorithm can be generalised to three and higher dimensions, its convergence is not guaranteed in these cases, as it is conditioned to the connectedness of the underlying flip graph: this graph is connected for two-dimensional sets of points, but may be disconnected in higher dimensions.


### Incremental

The most straightforward way of efficiently computing the Delaunay triangulation is to repeatedly add one vertex at a time, retriangulating the affected parts of the graph. When a vertex v is added, we split in three the triangle that contains v, then we apply the flip algorithm. Done naïvely, this will take O(n) time: we search through all the triangles to find the one that contains v, then we potentially flip away every triangle. Then the overall runtime is O(n).

If we insert vertices in random order, it turns out (by a somewhat intricate proof) that each insertion will flip, on average, only O(1) triangles – although sometimes it will flip many more. This still leaves the point location time to improve. We can store the history of the splits and flips performed: each triangle stores a pointer to the two or three triangles that replaced it. To find the triangle that contains v, we start at a root triangle, and follow the pointer that points to a triangle that contains v, until we find a triangle that has not yet been replaced. On average, this will also take O(log n) time. Over all vertices, then, this takes O(n log n) time. While the technique extends to higher dimensions (as proved by Edelsbrunner and Shah), the runtime can be exponential in the dimension even if the final Delaunay triangulation is small.

The Bowyer–Watson algorithm provides another approach for incremental construction. It gives an alternative to edge flipping for computing the Delaunay triangles containing a newly inserted vertex.

Unfortunately the flipping-based algorithms are generally hard to parallelize, since adding some certain point (e.g. the center point of a wagon wheel) can lead to up to O(n) consecutive flips. Blelloch et al. proposed another version of incremental algorithm based on rip-and-tent, which is practical and highly parallelized with polylogarithmic span.


### Divide and conquer

A divide and conquer algorithm for triangulations in two dimensions was developed by Lee and Schachter and improved by Guibas and Stolfi and later by Dwyer. In this algorithm, one recursively draws a line to split the vertices into two sets. The Delaunay triangulation is computed for each set, and then the two sets are merged along the splitting line. Using some clever tricks, the merge operation can be done in time O(n), so the total running time is O(n log n).

For certain types of point sets, such as a uniform random distribution, by intelligently picking the splitting lines the expected time can be reduced to O(n log log n) while still maintaining worst-case performance.

A divide and conquer paradigm to performing a triangulation in d dimensions is presented in "DeWall: A fast divide and conquer Delaunay triangulation algorithm in E" by P. Cignoni, C. Montani, R. Scopigno.

The divide and conquer algorithm has been shown to be the fastest DT generation technique sequentially.


### Sweephull

Sweephull is a hybrid technique for 2D Delaunay triangulation that uses a radially propagating sweep-hull, and a flipping algorithm. The sweep-hull is created sequentially by iterating a radially-sorted set of 2D points, and connecting triangles to the visible part of the convex hull, which gives a non-overlapping triangulation. One can build a convex hull in this manner so long as the order of points guarantees no point would fall within the triangle. But, radially sorting should minimize flipping by being highly Delaunay to start. This is then paired with a final iterative triangle flipping step.


## Applications

The Euclidean minimum spanning tree of a set of points is a subset of the Delaunay triangulation of the same points, and this can be exploited to compute it efficiently.

For modelling terrain or other objects given a point cloud, the Delaunay triangulation gives a nice set of triangles to use as polygons in the model. In particular, the Delaunay triangulation avoids narrow triangles (as they have large circumcircles compared to their area). See triangulated irregular network.

Delaunay triangulations can be used to determine the density or intensity of points samplings by means of the Delaunay tessellation field estimator (DTFE).

Delaunay triangulations are often used to generate meshes for space-discretised solvers such as the finite element method and the finite volume method of physics simulation, because of the angle guarantee and because fast triangulation algorithms have been developed. Typically, the domain to be meshed is specified as a coarse simplicial complex; for the mesh to be numerically stable, it must be refined, for instance by using Ruppert's algorithm.

The increasing popularity of finite element method and boundary element method techniques increases the incentive to improve automatic meshing algorithms. However, all of these algorithms can create distorted and even unusable grid elements. Fortunately, several techniques exist which can take an existing mesh and improve its quality. For example, smoothing (also referred to as mesh refinement) is one such method, which repositions nodes to minimize element distortion. The stretched grid method allows the generation of pseudo-regular meshes that meet the Delaunay criteria easily and quickly in a one-step solution.

Constrained Delaunay triangulation has found applications in path planning in automated driving and topographic surveying.


## See also


## External links


- Henry, Ian (July 11, 2022). "Visualizing Delaunay Triangulation". Blog post detailing algorithms for Delaunay triangulation.
- Delaunay triangulation in CGAL, the Computational Geometry Algorithms Library: Mariette Yvinec. 2D Triangulation. Retrieved April 2010. Pion, Sylvain; Teillaud, Monique. 3D Triangulations. Retrieved April 2010. Hornus, Samuel; Devillers, Olivier; Jamin, Clément. dD Triangulations. Hert, Susan; Seel, Michael. dD Convex Hulls and Delaunay Triangulations. Retrieved April 2010.
- "Poly2Tri: Incremental constrained Delaunay triangulation. Open source C++ implementation. Retrieved April 2019.
- "Divide & Conquer Delaunay triangulation construction". Open source C99 implementation. Retrieved April 2019.
- "CDT: Constrained Delaunay Triangulation in C++". Open source C++ implementation. Retrieved August 2022.
