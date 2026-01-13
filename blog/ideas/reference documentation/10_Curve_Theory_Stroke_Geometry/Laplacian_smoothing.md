# Laplacian smoothing

Laplacian smoothing is an algorithm to smooth a polygonal mesh. For each vertex in a mesh, a new position is chosen based on local information (such as the position of neighbours) and the vertex is moved there. In the case that a mesh is topologically a rectangular grid (that is, each internal vertex is connected to four neighbours) then this operation produces the Laplacian of the mesh.

More formally, the smoothing operation may be described per-vertex as:


$${\bar {x}}_{i}={\frac {1}{N}}\sum _{j=1}^{N}{\bar {x}}_{j}
$$

Where $N$ is the number of adjacent vertices to node $i$, ${\bar {x}}_{j}$ is the position of the $j$-th adjacent vertex and ${\bar {x}}_{i}$ is the new position for node $i$.


## See also


- Tutte embedding, an embedding of a planar mesh in which each vertex is already at the average of its neighbours' positions
