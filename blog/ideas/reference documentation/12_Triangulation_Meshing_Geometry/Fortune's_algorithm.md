# Fortune's algorithm

Fortune's algorithm is a sweep line algorithm for generating a Voronoi diagram from a set of points in a plane using O(n log n) time and O(n) space. It was originally published by Steven Fortune in 1986 in his paper "A sweepline algorithm for Voronoi diagrams."


## Algorithm description

The algorithm maintains both a sweep line and a beach line, which both move through the plane as the algorithm progresses. The sweep line is a straight line, which we may by convention assume to be vertical and moving left to right across the plane. At any time during the algorithm, the input points left of the sweep line will have been incorporated into the Voronoi diagram, while the points right of the sweep line will not have been considered yet. The beach line is not a straight line, but a complicated, piecewise curve to the left of the sweep line, composed of pieces of parabolas; it divides the portion of the plane within which the Voronoi diagram can be known, regardless of what other points might be right of the sweep line, from the rest of the plane. For each point left of the sweep line, one can define a parabola of points equidistant from that point and from the sweep line; the beach line is the boundary of the union of these parabolas. As the sweep line progresses, the vertices of the beach line, at which two parabolas cross, trace out the edges of the Voronoi diagram. The beach line progresses by keeping each parabola base exactly halfway between the points initially swept over with the sweep line, and the new position of the sweep line. Mathematically, this means each parabola is formed by using the sweep line as the directrix and the input point as the focus.

The algorithm maintains as data structures a binary search tree describing the combinatorial structure of the beach line, and a priority queue listing potential future events that could change the beach line structure. These events include the addition of another parabola to the beach line (when the sweep line crosses another input point) and the removal of a curve from the beach line (when the sweep line becomes tangent to a circle through some three input points whose parabolas form consecutive segments of the beach line). Each such event may be prioritized by the x-coordinate of the sweep line at the point the event occurs. The algorithm itself then consists of repeatedly removing the next event from the priority queue, finding the changes the event causes in the beach line, and updating the data structures.

As there are O(n) events to process (each being associated with some feature of the Voronoi diagram) and O(log n) time to process an event (each consisting of a constant number of binary search tree and priority queue operations) the total time is O(n log n).


### Pseudocode

Pseudocode description of the algorithm.


## Weighted sites and disks


### Additively weighted sites

As Fortune describes in ref., a modified version of the sweep line algorithm can be used to construct an additively weighted Voronoi diagram, in which the distance to each site is offset by the weight of the site; this may equivalently be viewed as a Voronoi diagram of a set of disks, centered at the sites with radius equal to the weight of the site. the algorithm is found to have $O(n\log(n))$ time complexity with n being the number of sites according to ref.

Weighted sites may be used to control the areas of the Voronoi cells when using Voronoi diagrams to construct treemaps. In an additively weighted Voronoi diagram, the bisector between sites is in general a hyperbola, in contrast to unweighted Voronoi diagrams and power diagrams of disks for which it is a straight line.


## External links


- Steven Fortune's C implementation
- Fortune's Voronoi algorithm implemented in C++
- Fortune's algorithm implemented in JavaScript archived on GitHub as of August 2015
- Fortune's Algorithm Visualization as of 2025 access is blocked
