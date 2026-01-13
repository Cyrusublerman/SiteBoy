# Topological skeleton

In shape analysis, skeleton (or topological skeleton) of a shape is a thin version of that shape that is equidistant to its boundaries. The skeleton usually emphasizes geometrical and topological properties of the shape, such as its connectivity, topology, length, direction, and width. Together with the distance of its points to the shape boundary, the skeleton can also serve as a representation of the shape (they contain all the information necessary to reconstruct the shape).

Skeletons have several different mathematical definitions in the technical literature, and there are many different algorithms for computing them. Various different variants of skeleton can also be found, including straight skeletons, morphological skeletons, etc.

In the technical literature, the concepts of skeleton and medial axis are used interchangeably by some authors, while some other authors regard them as related, but not the same. Similarly, the concepts of skeletonization and thinning are also regarded as identical by some, and not by others.

Skeletons are widely used in computer vision, image analysis, pattern recognition and digital image processing for purposes such as optical character recognition, fingerprint recognition, visual inspection or compression. Within the life sciences skeletons found extensive use to characterize protein folding and plant morphology on various biological scales.


## Mathematical definitions

Skeletons have several different mathematical definitions in the technical literature; most of them lead to similar results in continuous spaces, but usually yield different results in discrete spaces.


### Quench points of the fire propagation model

In his seminal paper, Harry Blum of the Air Force Cambridge Research Laboratories at Hanscom Air Force Base, in Bedford, Massachusetts, defined a medial axis for computing a skeleton of a shape, using an intuitive model of fire propagation on a grass field, where the field has the form of the given shape. If one "sets fire" at all points on the boundary of that grass field simultaneously, then the skeleton is the set of quench points, i.e., those points where two or more wavefronts meet. This intuitive description is the starting point for a number of more precise definitions.


### Centers of maximal disks (or balls)

A disk (or ball) B is said to be maximal in a set A if


- $B\subseteq A$, and
- If another disc D contains B, then $D\not \subseteq A$.

One way of defining the skeleton of a shape A is as the set of centers of all maximal disks in A.


### Centers of bi-tangent circles

The skeleton of a shape A can also be defined as the set of centers of the discs that touch the boundary of A in two or more locations. This definition assures that the skeleton points are equidistant from the shape boundary and is mathematically equivalent to Blum's medial axis transform.


### Ridges of the distance function

Many definitions of skeleton make use of the concept of distance function, which is a function that returns for each point x inside a shape A its distance to the closest point on the boundary of A. Using the distance function is very attractive because its computation is relatively fast.

One of the definitions of skeleton using the distance function is as the ridges of the distance function. There is a common mis-statement in the literature that the skeleton consists of points which are "locally maximum" in the distance transform. This is simply not the case, as even cursory comparison of a distance transform and the resulting skeleton will show. Ridges may have varying height, so a point on the ridge may be lower than its immediate neighbor on the ridge. It is thus not a local maximum, even though it belongs to the ridge. It is, however, less far away vertically than its ground distance would warrant. Otherwise it would be part of the slope.


### Other definitions


- Points with no upstream segments in the distance function. The upstream of a point x is the segment starting at x which follows the maximal gradient path.
- Points where the gradient of the distance function are different from 1 (or, equivalently, not well defined)
- Smallest possible set of lines that preserve the topology and are equidistant to the borders


## Skeletonization algorithms

There are many different algorithms for computing skeletons for shapes in digital images, as well as continuous sets.


- Using morphological operators (See Morphological skeleton)
- Supplementing morphological operators with shape based pruning
- Using intersections of distances from boundary sections
- Using curve evolution
- Using level sets
- Finding ridge points on the distance function
- "Peeling" the shape, without changing the topology, until convergence
- Zhang-Suen Thinning Algorithm

Skeletonization algorithms can sometimes create unwanted branches on the output skeletons. Pruning algorithms are often used to remove these branches.


## See also


- Medial axis
- Straight skeleton
- β-skeleton
- Grassfire Transform
- Stroke-based fonts


## Open source software


- ITK (C++)
- Skeletonize3D (Java)
- Graphics gems IV (C)
- EVG-Thin (C++)
- NeuronStudio


## External links


- Skeletonization/Medial Axis Transform
- Skeletons of a region
- Skeletons in Digital image processing (pdf)
- Comparison of 15 line thinning algorithms
- Skeletonization using Level Set Methods
- Curve Skeletons
- Skeletons from laser scanned point clouds (Homepage)
