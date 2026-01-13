# Polygon partition

In geometry, a partition of a polygon is a set of primitive units (e.g., triangles, rectangles, etc.), which do not overlap and whose union equals the polygon. A polygon partition problem is a problem of finding a partition which is minimal in some sense, for example a partition with a smallest number of units or with units of smallest total side-length (sum of the perimeters).

Polygon partitioning is an important class of problems in computational geometry. There are many different polygon partition problems, depending on the type of polygon being partitioned and on the types of units allowed in the partition.

The term "polygon decomposition" is often used as a general term that includes both polygon partitioning and polygon covering, which allows overlapping units.


## Applications

Polygon decomposition is applied in several areas:


- Pattern recognition techniques extract information from an object in order to describe, identify or classify it. An established strategy for recognising a general polygonal object is to decompose it into simpler components, then identify the components and their interrelationships and use this information to determine the shape of the object.
- In VLSI artwork data processing, layouts are represented as polygons, and one approach to preparation for electron-beam lithography is to decompose these polygon regions into fundamental figures. Polygon decomposition is also used in the process of dividing the routing region into channels.
- In computational geometry, algorithms for problems on general polygons are often more complex than those for restricted types of polygons such as convex or star-shaped. The point-in-polygon problem is one example. A strategy for solving some of these types of problems on general polygons is to decompose the polygon into simple component parts, solve the problem on each component using a specialized algorithm, and then combine the partial solutions.
- Other applications include data compression, database systems, image processing and computer graphics.


## Partitioning a polygon into triangles

The most well-studied polygon partition Do not add a link to "partition problem" here, it is not the same concept. problem is partitioning to a smallest number of triangles, also called triangulation. For a hole-free polygon with $n$ vertices, a triangulation can be calculated in time $\Theta (n)$. For a polygon with holes, there is a lower bound of $\Omega (n\log n)$.

A related problem is partitioning to triangles with a minimal total edge length, also called minimum-weight triangulation.


## Partitioning a polygon into pseudo-triangles

The same two variants of the problem were studied for the case in which the pieces should be pseudotriangles – polygons that like triangles have exactly three convex vertices. The variants are: partitioning to a smallest number of pseudotriangles, and partitioning to pseudotriangles with a minimal total edge length.


## Partitioning a rectilinear polygon into rectangles

An important sub-family of polygon partition problems arises when the large polygon is a rectilinear polygon, and the goal is to partition it into rectangles. Such partitions are known as rectangular partitions. They have practical applications in a variety of fields, including VLSI design and image processing.


### Minimizing the number of components

Several polynomial-time algorithms are known to compute a rectangular partition which minimizes the number of component rectangles. See : 10–13 and : 3–5 for surveys.

The problem of partitioning a rectilinear polygon into a smallest number of squares (instead of arbitrary rectangles) is NP-hard.


### Minimizing the total edge length

In some applications, it is more important to minimize the total length of the cuts (e.g. to minimize the cost of performing the partition, or to minimize the amount of dust). This problem is called minimum edge-length rectangular partitioning. It was first studied by Lingas, Pinter, Rivest and Shamir in 1982. The run-time complexity of this problem crucially depends on whether the raw polygon is allowed to have holes.

If the raw polygon is hole-free, then an optimal partition can be found in time $O(n^{4})$, where n is the number of vertices of the polygon. In the special case of a "histogram polygon", the complexity improves to $O(n^{3})$. The algorithm uses dynamic programming and relies on the following fact: if the polygon is hole-free, then it has a minimum-length partition in which each maximal line-segment contains a vertex of the boundary. The reason is that, in any minimum-length partition, every maximal line-segment can be "pushed" until it hits one of the vertices of the boundary, without changing the total length. Therefore, there are only $O(n^{2})$ candidates for a line segment in an optimal partition, and they can be checked efficiently using dynamic programming.: 166–167

If the raw polygon might have holes, even if they are degenerate holes (i.e., single points), the problem is NP-hard. This can be proved by reduction from Planar SAT. For the case in which all holes are single points, several constant-factor approximations have been developed:


- A (3+sqrt(3)) approximation in time $O(n^{2})$;
- A (3+sqrt(3)) approximation in time $O(n\log {n})$;
- A 4 approximation in time $O(n\log {n})$ (more generally, in d dimensions, it is a $2d$ approximation in time $O(dn\log {n})$),
- A 3 approximation in time $O(n^{4})$;
- A 1.75 approximation in time $O(n^{5})$ (more generally, in d dimensions, it is a $2d-4+4/d$ approximation in time $O(dn^{2d+1})$); the latter approximation uses a restricted variant of the problem called guillotine partitioning, in which the cuts must be guillotine cuts (edge-to-edge cuts).
- Several polynomial-time approximation schemes using sophisticated guillotine cuts.


### Minimizing the number of blanks

In this setting, the large polygon already contains some pairwise-disjoint rectangles. The goal is to find a partition of the polygon into rectangles such that each original rectangle is contained in one of the pieces, and subject to this, the number of "blanks" (pieces that do not contain an original rectangle) is as small as possible. The following results are known:


- If the large polygon is a rectangle, then in any maximal arrangement of n rectangles, all the holes are rectangles, and their number is at most $n-\lceil 2{\sqrt {n}}-1\rceil$, and this is tight.
- If the large polygon is a rectilinear polygon with T reflex vertices, then in any maximal arrangement of n rectangles, the holes can be partitioned into at most $T+n-\lceil 2{\sqrt {n}}-1\rceil$ rectangles, and this is tight.


## Partition a polygon into trapezoids

In VLSI artwork processing systems, it is often required to partition a polygonal region into the minimum number of trapezoids, with two horizontal sides. A triangle with a horizontal side is considered to be a trapezoid with two horizontal sides one of which is degenerate. For a hole-free polygon with $n$ sides, a smallest such partition can be found in time $O(n^{2})$.

If the number of trapezoids need not be minimal a trapezoidation can be found in time $O(n)$, as a by-product of a polygon triangulation algorithm.

If the polygon does contain holes, the problem is NP-complete, but a 3-approximation can be found in time $O(n\log n)$.


## Partition a polygon into convex quadrilaterals

A quadrilateralization or a quadrangulation is a partition into quadrilaterals.

A recurring characteristic of quadrangulation problems is whether they Steiner point are allowed, i.e., whether the algorithm is allowed to add points which are not vertices of the polygon. Allowing Steiner points may enable smaller divisions, but then it is much more difficult to guarantee that the divisions found by an algorithms have minimum size.

There are linear-time algorithms for quadrangulations of hole-free polygons with Steiner points, but they are not guaranteed to find a smallest partition.


## Partition a polygon into m-gons

A generalization of previous problems is the partitioning into polygons that have exactly m sides, or at most m sides. Here the goal is to minimize the total edge length. This problem can be solved in time polynomial in n and m.


## Partition a polygon into convex polygons

When partitioning a general polygon into convex polygons, several objectives have been studied.


### Minimizing the number of components

The optimal convex partitioning problem is to partition a non-convex polygon into as few as possible convex polygons, using only the initial polygon's vertices. There are exact and approximate algorithms for this problem.


### Minimizing the number of blanks

The original polygon already contains some pairwise-disjoint convex figures, and the goal is to partition it into convex polygons that such that each original figure is contained in one of the pieces, and subject to this, the number of "blanks" (pieces that do not contain an original figure) is as small as possible. If the large polygon is convex, then in any maximal arrangement of n convex figures, all the holes are convex, and their number is at most $2n-5$, and this is tight.


### Equalizing the area and perimeter

The fair polygon partitioning problem is to partition a (convex) polygon into (convex) pieces with an equal perimeter and equal area (this is a special case of fair cake-cutting). Any convex polygon can be easily cut into any number n of convex pieces with an area of exactly 1/n. However, ensuring that the pieces have both equal area and equal perimeter is more challenging. There are algorithms for solving this problem when the number of pieces is a power of 2.

A generalization of this problem is when the area and perimeter measures are replaced with a measure on the body and on the boundary of the polygon, respectively. This problem was studied for 2 and 3 pieces.

There is a further generalization to handle any number of measures.


## More general component shapes

More general shapes of pieces have been studied, including: spiral shapes, star polygons and monotone polygons. See for a survey.


## See also


- Polygon covering – a related problem in which the pieces are allowed to overlap.
- Packing problem – a related problem in which the pieces have to fit within the entire large object but do not have to cover it entirely.
- Euclidean tilings by convex regular polygons – a problem of partitioning the entire plane to simple polygons such as rectangles.
- Squaring the square – a problem of partitioning an integral square using only other integral squares.
- Space partitioning
- Tiling puzzle – a puzzle of packing several given pieces into a given larger polygon.
- Guillotine partition
