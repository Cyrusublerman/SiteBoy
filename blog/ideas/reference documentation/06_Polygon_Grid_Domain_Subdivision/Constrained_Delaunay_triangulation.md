# Constrained Delaunay triangulation

In computational geometry, a constrained Delaunay triangulation is a generalization of the Delaunay triangulation that forces certain required segments into the triangulation as edges, unlike the Delaunay triangulation itself which is based purely on the position of a given set of vertices without regard to how they should be connected by edges. It can be computed efficiently and has applications in geographic information systems and in mesh generation.


## Definition

The input to the constrained Delaunay triangulation problem is a planar straight-line graph, a set of points and non-crossing line segments in the plane. The constrained Delaunay triangulation of this input is a triangulation of its convex hull, including all of the input segments as edges, and using only the vertices of the input. For every additional edge $e$ added to this input to make it into a triangulation, there should exist a circle through the endpoints of $e$, such that any vertex interior to the circle is blocked from visibility from at least one endpoint of $e$ by a segment of the input. This generalizes the defining property of two-dimensional Delaunay triangulations of points, that each edge have a circle through its two endpoints containing no other vertices. A triangulation satisfying these properties always exists.

Jonathan Shewchuk has generalized this definition to constrained Delaunay triangulations of three-dimensional inputs, systems of points and non-crossing segments and triangles in three-dimensional space; however, not every input of this type has a constrained Delaunay triangulation according to his generalized definition.


## Algorithms

Several algorithms for computing constrained Delaunay triangulations of planar straight-line graphs in time $O(n\log n)$ are known. The constrained Delaunay triangulation of a simple polygon can be constructed in linear time.


## Applications

In topographic surveying, one constructs a triangulation from points shot in the field. If an edge of the triangulation crosses a river, the resulting surface does not accurately model the path of the river. So one draws break lines along rivers, edges of roads, mountain ridges, and the like. The break lines are used as constraints when constructing the triangulation.

Constrained Delaunay triangulation can also be used in Delaunay refinement methods for mesh generation, as a way to force the mesh to conform with the domain boundaries as it is being refined.


## External links


- CDT Open Source implementation.
- 2D Triangulations in CGAL, the Computational Geometry Algorithms Library
- 3D Constrained Triangulations in CGAL, the Computational Geometry Algorithms Library
