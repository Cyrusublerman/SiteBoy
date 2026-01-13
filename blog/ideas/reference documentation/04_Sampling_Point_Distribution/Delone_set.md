# Delone set

In the mathematical theory of metric spaces, ε-nets, ε-packings, ε-coverings, uniformly discrete sets, relatively dense sets, and Delone sets (named after Boris Delone) are several closely related definitions of well-spaced sets of points, and the packing radius and covering radius of these sets measure how well-spaced they are. These sets have applications in coding theory, approximation algorithms, and the theory of quasicrystals.


## Definitions

If (M, d) is a metric space, and X is a subset of M, then the packing radius, r, of X is half of the smallest distance between distinct members of X. Open balls of radius r centered at the points of X will all be disjoint from each other. The covering radius, R, of X is the smallest distance such that every point of M is within distance R of at least one point in X; that is, R is the smallest radius such that closed balls of that radius centered at the points of X have all of M as their union.

An ε-packing is a set X of packing radius r ≥ ε/2 (equivalently, minimum distance ≥ ε), an ε-covering is a set X of covering radius R ≤ ε, and an ε-net is a set that is both an ε-packing and an ε-covering (ε/2 ≤ r ≤ R ≤ ε).

A set is uniformly discrete if it has a nonzero packing radius (0 < r), and relatively dense if it has a finite covering radius (R < ∞).

A Delone set is a set that is both uniformly discrete and relatively dense (0 < r ≤ R < ∞). Thus every ε-net is Delone, but not vice versa.


## Construction of ε-nets

As the most restrictive of the definitions above, ε-nets are at least as difficult to construct as ε-packings, ε-coverings, and Delone sets. However, whenever the points of M have a well-ordering, transfinite induction shows that it is possible to construct an ε-net N, by including in N every point for which the infimum of distances to the set of earlier points in the ordering is at least ε. For finite sets of points in a Euclidean space of bounded dimension, each point may be tested in constant time by mapping it to a grid of cells of diameter ε, and using a hash table to test which nearby cells already contain points of N; thus, in this case, an ε-net can be constructed in linear time.

For more general finite or compact metric spaces, an alternative algorithm of Teo Gonzalez based on the farthest-first traversal can be used to construct a finite ε-net. This algorithm initializes the net N to be empty, and then repeatedly adds to N the farthest point in M from N, breaking ties arbitrarily and stopping when all points of M are within distance ε of N. In spaces of bounded doubling dimension, Gonzalez' algorithm can be implemented in O(n log n) time for point sets with a polynomial ratio between their farthest and closest distances, and approximated in the same time bound for arbitrary point sets.


## Applications


### Coding theory

In the theory of error-correcting codes, the metric space containing a block code C consists of strings of a fixed length, say n, taken over an alphabet of size q (can be thought of as vectors), with the Hamming metric. This space is denoted by ⁠${\mathcal {A}}_{q}^{n}.$⁠ The covering radius and packing radius of this metric space are related to the code's ability to correct errors. An example is provided by the Berlekamp switching game.


### Approximation algorithms

Har-Peled & Raichel (2013) describe an algorithmic paradigm that they call "net and prune" for designing approximation algorithms for certain types of geometric optimization problems defined on sets of points in Euclidean spaces. An algorithm of this type works by performing the following steps:


1. Choose a random point p from the point set, find its nearest neighbor q, and set ε to the distance between p and q.
2. Test whether ε is (approximately) bigger than or smaller than the optimal solution value (using a technique specific to the particular optimization problem being solved) If it is bigger, remove from the input the points whose closest neighbor is farther than ε If it is smaller, construct an ε-net N, and remove from the input the points that are not in N.

In both cases, the expected number of remaining points decreases by a constant factor, so the time is dominated by the testing step. As they show, this paradigm can be used to construct fast approximation algorithms for k-center clustering, finding a pair of points with median distance, and several related problems.

A hierarchical system of nets, called a net-tree, may be used in spaces of bounded doubling dimension to construct well-separated pair decompositions, geometric spanners, and approximate nearest neighbors.


### Crystallography

For points in Euclidean space, a set X is a Meyer set if it is relatively dense and its difference set X − X is uniformly discrete. Equivalently, X is a Meyer set if both X and X − X are Delone sets. Meyer sets are named after Yves Meyer, who introduced them (with a different but equivalent definition based on harmonic analysis) as a mathematical model for quasicrystals. They include the point sets of lattices, Penrose tilings, and the Minkowski sums of these sets with finite sets.

The Voronoi cells of symmetric Delone sets form space-filling polyhedra called plesiohedra.


## External links


- Delone set – Tilings Encyclopedia
