# Alpha shape

In computational geometry, an alpha shape, or α-shape, is a family of piecewise linear simple curves in the Euclidean plane associated with the shape of a finite set of points. They were first defined by Edelsbrunner, Kirkpatrick & Seidel (1983). The alpha-shape associated with a set of points is a generalization of the concept of the convex hull, i.e. every convex hull is an alpha-shape but not every alpha shape is a convex hull.


## Characterization

For each real number α, define the concept of a generalized disk of radius 1/α as follows:


- If α = 0, it is a closed half-plane;
- If α > 0, it is a closed disk of radius 1/α;
- If α < 0, it is the closure of the complement of a disk of radius −1/α.

Then, an edge of the alpha-shape is drawn between two members of the finite point set whenever there exists a generalized disk of radius 1/α that has the two points on its boundary and that contains none of the point set in its interior.

If α = 0, then the alpha-shape associated with the finite point set is its ordinary convex hull.


## Alpha complex

Alpha shapes are closely related to alpha complexes, which are subcomplexes of the Delaunay triangulation of the point set. Each edge or triangle of the Delaunay triangulation may be associated with a characteristic radius: the radius of the smallest empty circle containing the edge or triangle. For each real number α, the α-complex of the given set of points is the simplicial complex formed by the set of edges and triangles whose radii are at most 1/α.

The α-complex is also a subcomplex of the Čech complex, but computationally more efficient if the ambient space has dimension 2 or 3.

The union of the edges and triangles in the α-complex forms a shape closely resembling the α-shape; however it differs in that it has polygonal edges rather than edges formed from arcs of circles. More specifically, Edelsbrunner (1995) showed that the two shapes are homotopy equivalent. (In this later work, Edelsbrunner used the name "α-shape" to refer to the union of the cells in the α-complex, and instead called the related curvilinear shape an α-body.)


## Examples

This technique can be employed to reconstruct a Fermi surface from the electronic Bloch spectral function evaluated at the Fermi level, as obtained from the Green's function in a generalised ab-initio study of the problem. The Fermi surface is then defined as the set of reciprocal space points within the first Brillouin zone, where the signal is highest. The definition has the advantage of covering also cases of various forms of disorder.


## See also


- Beta skeleton


## External links


- 2D Alpha Shapes and 3D Alpha Shapes in CGAL the Computational Geometry Algorithms Library
- Alpha Complex in the GUDHI library.
- Description and implementation by Duke University
- Everything You Always Wanted to Know About Alpha Shapes But Were Afraid to Ask – with illustrations and interactive demonstration
- Implementation of the 3D alpha-shape for the reconstruction of 3D sets from a point cloud in R
- Description of the implementation details for alpha shapes – lecture providing a description of the formal and intuitive aspects of alpha shape implementation
- Alpha Hulls, Shapes, and Weighted things – lecture slides by Robert Pless at the Washington University in St. Louis
