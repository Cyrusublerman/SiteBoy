# Octree

An octree is a tree data structure in which each internal node has exactly eight children. Octrees are most often used to partition a three-dimensional space by recursively subdividing it into eight octants. Octrees are the three-dimensional analog of quadtrees. The word is derived from oct (Greek root meaning "eight") + tree. Octrees are often used in 3D graphics and 3D game engines.


## For spatial representation

Each node in an octree subdivides the space it represents into eight octants. In a point region (PR) octree (analogous to a point quadtree), the node stores an explicit three-dimensional point, which is the "center" of the subdivision for that node; the point defines one of the corners for each of the eight children. In a matrix-based (MX) octree (analogous to a region quadtree), the subdivision point is implicitly the center of the space the node represents. The root node of a PR octree can represent infinite space; the root node of an MX octree must represent a finite bounded space so that the implicit centers are well-defined. Note that octrees are not the same as k-d trees: k-d trees split along a dimension and octrees split around a point. Also k-d trees are always binary, which is not the case for octrees. By using a depth-first search the nodes are to be traversed and only required surfaces are to be viewed.


## History

The use of octrees for 3D computer graphics was pioneered by Donald Meagher at Rensselaer Polytechnic Institute, described in a 1980 report "Octree Encoding: A New Technique for the Representation, Manipulation and Display of Arbitrary 3-D Objects by Computer", for which he holds a 1995 patent (with a 1984 priority date) "High-speed image generation of complex solid objects using octree encoding"


## Common uses


- Level of detail rendering in 3D computer graphics
- Spatial indexing
- Nearest neighbor search
- Efficient collision detection in three dimensions
- View frustum culling
- Fast multipole method
- Unstructured grid
- Finite element analysis
- Sparse voxel octree
- State estimation
- Set estimation


## Application to color quantization

The octree color quantization algorithm, invented by Gervautz and Purgathofer in 1988, encodes image color data as an octree up to nine levels deep. Octrees are used because $2^{3}=8$ and there are three color components in the RGB system. The node index to branch out from at the top level is determined by a formula that uses the most significant bits of the red, green, and blue color components, e.g. 4r + 2g + b. The next lower level uses the next bit significance, and so on. Less significant bits are sometimes ignored to reduce the tree size.

The algorithm is highly memory efficient because the tree's size can be limited. The bottom level of the octree consists of leaf nodes that accrue color data not represented in the tree; these nodes initially contain single bits. If much more than the desired number of palette colors are entered into the octree, its size can be continually reduced by seeking out a bottom-level node and averaging its bit data up into a leaf node, pruning part of the tree. Once sampling is complete, exploring all routes in the tree down to the leaf nodes, taking note of the bits along the way, will yield approximately the required number of colors.


## Implementation for point decomposition

The example recursive algorithm outline below (MATLAB syntax) decomposes an array of 3-dimensional points into octree style bins. The implementation begins with a single bin surrounding all given points, which then recursively subdivides into its 8 octree regions. Recursion is stopped when a given exit condition is met. Examples of such exit conditions (shown in code below) are:


- When a bin contains fewer than a given number of points
- When a bin reaches a minimum size or volume based on the length of its edges
- When recursion has reached a maximum number of subdivisions


## Example color quantization

Taking the full list of colors of a 24-bit RGB image as point input to the Octree point decomposition implementation outlined above, the following example show the results of octree color quantization. The first image is the original (532818 distinct colors), while the second is the quantized image (184 distinct colors) using octree decomposition, with each pixel assigned the color at the center of the octree bin in which it falls. Alternatively, final colors could be chosen at the centroid of all colors in each octree bin, however this added computation has very little effect on the visual result.


## See also


- Binary space partitioning
- Bounding interval hierarchy
- Cube 2: Sauerbraten, a 3D game engine in which geometry is almost entirely based on octrees
- id Tech 6 is a 3D game engine that utilizes voxels stored in octrees
- Irrlicht Engine, supports octree scene nodes
- Klee's measure problem
- Linear octree
- OGRE, has an octree scene manager implementation
- Subpaving
- Voxel
- Quadtree


## External links


- Octree Quantization in Microsoft Systems Journal
- Color Quantization using Octrees in Dr. Dobb's
- Octree Color Quantization Overview
- Sojan Lal, P.; Unnikrishnan, A.; Poulose Jacob, K. (1998). "Parallel implementation of octtree generation algorithm". Proceedings 1998 International Conference on Image Processing. ICIP98 (Cat. No.98CB36269). Vol. 3. pp. 1005–1009. doi:10.1109/ICIP.1998.727419. ISBN 0-8186-8821-1. S2CID 195863788.
- Generation of Octrees from Raster Scan with Reduced Information Loss, P. Sojan Lal, A Unnikrishnan, K Poulose Jacob, IASTED International conference VIIP 2001
- Parallel Octrees for Finite Element Applications Archived 2016-03-03 at the Wayback Machine
- Video: Use of an octree in state estimation
- Quadtrees, Octrees, and Orthtrees, a chapter in CGAL, the Computational Algorithms Library
