# Watershed (image processing)

In the study of image processing, a watershed is a transformation defined on a grayscale image. The name refers metaphorically to a geological watershed, or drainage divide, which separates adjacent drainage basins. The watershed transformation treats the image it operates upon like a topographic map, with the brightness of each point representing its height, and finds the lines that run along the tops of ridges.

There are different technical definitions of a watershed. In graphs, watershed lines may be defined on the nodes, on the edges, or hybrid lines on both nodes and edges. Watersheds may also be defined in the continuous domain. There are also many different algorithms to compute watersheds. Watershed algorithms are used in image processing primarily for object segmentation purposes, that is, for separating different objects in an image. This allows for counting the objects or for further analysis of the separated objects.


- Relief of the gradient magnitude
- Gradient magnitude image
- Watershed of the gradient
- Watershed of the gradient (relief)


## Definitions

In geology, a watershed is a divide that separates adjacent catchment basins.


### Watershed by flooding

The idea was introduced in 1979 by S. Beucher and C. Lantuéjoul. The basic idea consisted of placing a water source in each regional minimum in the relief, to flood the entire relief from sources, and build barriers when different water sources meet. The resulting set of barriers constitutes a watershed by flooding. A number of improvements, collectively called Priority-Flood, have since been made to this algorithm.


### Watershed by topographic distance

Intuitively, a drop of water falling on a topographic relief flows towards the "nearest" minimum. The "nearest" minimum is that minimum which lies at the end of the path of steepest descent. In terms of topography, this occurs if the point lies in the catchment basin of that minimum. The previous definition does not verify this condition.


### Watershed by the drop of water principle

Intuitively, the watershed is a separation of the regional minima from which a drop of water can flow down towards distinct minima. A formalization of this intuitive idea was provided in for defining a watershed of an edge-weighted graph.


### Inter-pixel watershed

S. Beucher and F. Meyer introduced an algorithmic inter-pixel implementation of the watershed method, given the following procedure:


1. Label each minimum with a distinct label. Initialize a set S with the labeled nodes.
2. Extract from S a node x of minimal altitude F, that is to say F(x) = min{F(y)|y ∈ S}. Attribute the label of x to each non-labeled node y adjacent to x, and insert y in S.
3. Repeat Step 2 until S is empty.


### Topological watershed

Previous notions focus on catchment basins, but not to the produced separating line. The topological watershed was introduced by M. Couprie and G. Bertrand in 1997, and beneficiate of the following fundamental property. A function W is a watershed of a function F if and only if W ≤ F and W preserves the contrast between the regional minima of F; where the contrast between two regional minima M1 and M2 is defined as the minimal altitude to which one must climb in order to go from M1 to M2. An efficient algorithm is detailed in the paper.

Watershed algorithm

Different approaches may be employed to use the watershed principle for image segmentation.


- Local minima of the gradient of the image may be chosen as markers, in this case an over-segmentation is produced and a second step involves region merging.
- Marker based watershed transformation make use of specific marker positions which have been either explicitly defined by the user or determined automatically with morphological operators or other ways.


### Meyer's flooding algorithm

One of the most common watershed algorithms was introduced by F. Meyer in the early 1990s, though a number of improvements, collectively called Priority-Flood, have since been made to this algorithm, including variants suitable for datasets consisting of trillions of pixels.

The algorithm works on a gray scale image. During the successive flooding of the grey value relief, watersheds with adjacent catchment basins are constructed. This flooding process is performed on the gradient image, i.e. the basins should emerge along the edges. Normally this will lead to an over-segmentation of the image, especially for noisy image material, e.g. medical CT data. Either the image must be pre-processed or the regions must be merged on the basis of a similarity criterion afterwards.


1. A set of markers, pixels where the flooding shall start, are chosen. Each is given a different label.
2. The neighboring pixels of each marked area are inserted into a priority queue with a priority level corresponding to the gradient magnitude of the pixel.
3. The pixel with the lowest priority level is extracted from the priority queue. If the neighbors of the extracted pixel that have already been labeled all have the same label, then the pixel is labeled with their label. All non-marked neighbors that are not yet in the priority queue are put into the priority queue.
4. Redo step 3 until the priority queue is empty.

The non-labeled pixels are the watershed lines.


### Optimal spanning forest algorithms (watershed cuts)

Watersheds as optimal spanning forest have been introduced by Jean Cousty et al. They establish the consistency of these watersheds: they can be equivalently defined by their “catchment basins” (through a steepest descent property) or by the “dividing lines” separating these catchment basins (through the drop of water principle). Then they prove, through an equivalence theorem, their optimality in terms of minimum spanning forests. Afterward, they introduce a linear-time algorithm to compute them. It is worthwhile to note that similar properties are not verified in other frameworks and the proposed algorithm is the most efficient existing algorithm, both in theory and practice.


- An image with two markers (green), and a Minimum Spanning Forest computed on the gradient of the image.
- Result of the segmentation by Minimum Spanning Forest


## Links with other algorithms in computer vision


### Graph cuts

In 2007, C. Allène et al. established links relating Graph Cuts to optimal spanning forests. More precisely, they show that when the power of the weights of the graph is above a certain number, the cut minimizing the graph cuts energy is a cut by maximum spanning forest.


### Shortest-path forests

The image foresting transform (IFT) of Falcao et al. is a procedure for computing shortest path forests. It has been proved by J. Cousty et al. that when the markers of the IFT corresponds to extrema of the weight function, the cut induced by the forest is a watershed cut.


### Random walker

The random walker algorithm is a segmentation algorithm solving the combinatorial Dirichlet problem, adapted to image segmentation by L. Grady in 2006. In 2011, C. Couprie et al. proved that when the power of the weights of the graph converge toward infinity, the cut minimizing the random walker energy is a cut by maximum spanning forest.


## Hierarchies

A hierarchical watershed transformation converts the result into a graph display (i.e. the neighbor relationships of the segmented regions are determined) and applies further watershed transformations recursively. See for more details. A theory linking watershed to hierarchical segmentations has been developed in


## External links


- The Watershed Transformation Archived 2011-04-11 at the Wayback Machine with animations of the watershed algorithm.
- Topological Watershed Transform with papers, lecture slides and source code.
- An open source watershed plugin for ImageJ.
- The Topology ToolKit (2D and 3D watersheds based on the Morse complex)
