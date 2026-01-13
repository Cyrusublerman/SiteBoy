# Catmull–Clark subdivision surface

The Catmull–Clark algorithm is a technique used in 3D computer graphics to create curved surfaces by using subdivision surface modeling. It was devised by Edwin Catmull and Jim Clark in 1978 as a generalization of bi-cubic uniform B-spline surfaces to arbitrary topology.

In 2005/06, Edwin Catmull, together with Tony DeRose and Jos Stam, received an Academy Award for Technical Achievement for their invention and application of subdivision surfaces. DeRose wrote about "efficient, fair interpolation" and character animation. Stam described a technique for a direct evaluation of the limit surface without recursion.


## Recursive evaluation

Catmull–Clark surfaces are defined recursively, using the following refinement scheme.

Start with a mesh of an arbitrary polyhedron. All the vertices in this mesh shall be called original points.


- For each face, add a face point Set each face point to be the average of all original points for the respective faceFace points (blue spheres)
- For each edge, add an edge point. Set each edge point to be the average of the two neighbouring face points (A,F) and the two endpoints of the edge (M,E) A + F + M + E 4 {\displaystyle {\frac {A+F+M+E}{4}}} [2]Edge points (magenta cubes)
- For each original point (P), take the average (F) of all n (recently created) face points for faces touching P, and take the average (R) of all n edge midpoints for original edges touching P, where each edge midpoint is the average of its two endpoint vertices (not to be confused with new edge points above). (Note that from the perspective of a vertex P, the number of edges neighboring P is also the number of adjacent faces, hence n) Move each original point to the new vertex point F + 2 R + ( n − 3 ) P n {\displaystyle {\frac {F+2R+(n-3)P}{n}}} (This is the barycenter of P, R and F with respective weights (n − 3), 2 and 1)New vertex points (green cones)
- Form edges and faces in the new mesh Connect each new face point to the new edge points of all original edges defining the original faceNew edges, 4 per face point Connect each new vertex point to the new edge points of all original edges incident on the original vertex 3 new edges per vertex point of shifted original vertices Define new faces as enclosed by edges Final faces to the mesh


### Properties

The new mesh will consist only of quadrilaterals, which in general will not be planar. The new mesh will generally look "smoother" (i.e. less "jagged" or "pointy") than the old mesh. Repeated subdivision results in meshes that are more and more rounded.

The arbitrary-looking barycenter formula was chosen by Catmull and Clark based on the aesthetic appearance of the resulting surfaces rather than on a mathematical derivation, although they do go to great lengths to rigorously show that the method converges to bicubic B-spline surfaces.

It can be shown that the limit surface obtained by this refinement process is at least ${\mathcal {C}}^{1}$ at extraordinary vertices and ${\mathcal {C}}^{2}$ everywhere else (when n indicates how many derivatives are continuous, we speak of ${\mathcal {C}}^{n}$ continuity). After one iteration, the number of extraordinary points on the surface remains constant.


## Exact evaluation

The limit surface of Catmull–Clark subdivision surfaces can also be evaluated directly, without any recursive refinement. This can be accomplished by means of the technique of Jos Stam (1998). This method reformulates the recursive refinement process into a matrix exponential problem, which can be solved directly by means of matrix diagonalization.


## Software using the algorithm


## See also


- Conway polyhedron notation - A set of related topological polyhedron and polygonal mesh operators.
- Doo-Sabin subdivision surface
- Loop subdivision surface


## Further reading


- Derose, T.; Kass, M.; Truong, T. (1998). "Subdivision surfaces in character animation" (PDF). Proceedings of the 25th annual conference on Computer graphics and interactive techniques - SIGGRAPH '98. pp. 85. CiteSeerX 10.1.1.679.1198. doi:10.1145/280814.280826. ISBN 978-0897919999. S2CID 1221330.
- Loop, C.; Schaefer, S. (2008). "Approximating Catmull-Clark subdivision surfaces with bicubic patches" (PDF). ACM Transactions on Graphics. 27: 1–11. CiteSeerX 10.1.1.153.2047. doi:10.1145/1330511.1330519. S2CID 6068564.
- Kovacs, D.; Mitchell, J.; Drone, S.; Zorin, D. (2010). "Real-Time Creased Approximate Subdivision Surfaces with Displacements" (PDF). IEEE Transactions on Visualization and Computer Graphics. 16 (5): 742–51. doi:10.1109/TVCG.2010.31. PMID 20616390. S2CID 17138394. preprint
- Matthias Nießner, Charles Loop, Mark Meyer, Tony DeRose, "Feature Adaptive GPU Rendering of Catmull-Clark Subdivision Surfaces", ACM Transactions on Graphics Volume 31 Issue 1, January 2012, doi:10.1145/2077341.2077347, demo
- Nießner, Matthias; Loop, Charles; Greiner, Günther: Efficient Evaluation of Semi-Smooth Creases in Catmull-Clark Subdivision Surfaces: Eurographics 2012 Annex: Short Papers (Eurographics 2012, Cagliary). 2012, pp 41–44.
- Wade Brainerd, Tessellation in Call of Duty: Ghosts also presented as a SIGGRAPH2014 tutorial
- D. Doo and M. Sabin: Behavior of recursive division surfaces near extraordinary points, Computer-Aided Design, 10 (6) 356–360 (1978), (doi, pdf)
