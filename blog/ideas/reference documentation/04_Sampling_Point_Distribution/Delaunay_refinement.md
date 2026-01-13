# Delaunay refinement

In mesh generation, Delaunay refinements are algorithms for mesh generation based on the principle of adding Steiner points to the geometry of an input to be meshed, in a way that causes the Delaunay triangulation or constrained Delaunay triangulation of the augmented input to meet the quality requirements of the meshing application. Delaunay refinement methods include methods by Chew and by Ruppert.


## Chew's second algorithm

Chew's second algorithm takes a piecewise linear system (PLS) and returns a constrained Delaunay triangulation of only quality triangles where quality is defined by the minimum angle in a triangle. Developed by L. Paul Chew for meshing surfaces embedded in three-dimensional space, Chew's second algorithm has been adopted as a two-dimensional mesh generator due to practical advantages over Ruppert's algorithm in certain cases and is the default quality mesh generator implemented in the freely available Triangle package. Chew's second algorithm is guaranteed to terminate and produce a local feature size-graded meshes with minimum angle up to about 28.6 degrees.

The algorithm begins with a constrained Delaunay triangulation of the input vertices. At each step, the circumcenter of a poor-quality triangle is inserted into the triangulation with one exception: If the circumcenter lies on the opposite side of an input segment as the poor quality triangle, the midpoint of the segment is inserted. Moreover, any previously inserted circumcenters inside the diametral ball of the original segment (before it is split) are removed from the triangulation. Circumcenter insertion is repeated until no poor-quality triangles exist.


## Ruppert's algorithm

Ruppert's algorithm takes a planar straight-line graph (or in dimension higher than two a piecewise linear system) and returns a conforming Delaunay triangulation of only quality triangles. A triangle is considered poor-quality if it has a circumradius to shortest edge ratio larger than some prescribed threshold. Discovered by Jim Ruppert in the early 1990s, "Ruppert's algorithm for two-dimensional quality mesh generation is perhaps the first theoretically guaranteed meshing algorithm to be truly satisfactory in practice."


### Motivation

When doing computer simulations such as computational fluid dynamics, one starts with a model such as a 2D outline of a wing section. The input to a 2D finite element method needs to be in the form of triangles that fill all space, and each triangle to be filled with one kind of material – in this example, either "air" or "wing". Long, skinny triangles cannot be simulated accurately. The simulation time is generally proportional to the number of triangles, and so one wants to minimize the number of triangles, while still using enough triangles to give reasonably accurate results – typically by using an unstructured grid. The computer uses Ruppert's algorithm (or some similar meshing algorithm) to convert the polygonal model into triangles suitable for the finite element method.


### Algorithm

The algorithm begins with a Delaunay triangulation of the input vertices and then consists of two main operations.


- The midpoint of a segment with non-empty diametral circles is inserted into the triangulation.
- The circumcenter of a poor-quality triangle is inserted into the triangulation, unless this circumcenter lies in the diametral circle of some segment. In this case, the encroached segment is split instead.

These operations are repeated until no poor-quality triangles exist and all segments are not encroached.


**Pseudocode**


### Practical usage

Without modification Ruppert's algorithm is guaranteed to terminate and generate a quality mesh for non-acute input and any poor-quality threshold less than about 20.7 degrees. To relax these restrictions various small improvements have been made. By relaxing the quality requirement near small input angles, the algorithm can be extended to handle any straight-line input. Curved input can also be meshed using similar techniques. Ruppert's algorithm can be naturally extended to three dimensions, however its output guarantees are somewhat weaker due to the sliver type tetrahedron.

An extension of Ruppert's algorithm in two dimensions is implemented in the freely available Triangle package. Two variants of Ruppert's algorithm in this package are guaranteed to terminate for a poor-quality threshold of about 26.5 degrees. In practice these algorithms are successful for poor-quality thresholds over 30 degrees. However, examples are known which cause the algorithm to fail with a threshold greater than 29.06 degrees.


## See also


- Local feature size
- Polygon mesh
- TetGen
- Voronoi diagram


## Further reading


- Rineau, Laurent. "2D Conforming Triangulations and Meshes". Retrieved 28 December 2018.


- Shewchuk, Jonathan. "Triangle: A Two-Dimensional Quality Mesh Generator and Delaunay Triangulator". Retrieved 28 December 2018.


- Si, Hang (2015). "TetGen: A Quality Tetrahedral Mesh Generator and a 3D Delaunay Triangulator". Archived from the original on 29 December 2018. Retrieved 28 December 2018.{{cite web}}: CS1 maint: bot: original URL status unknown (link)
