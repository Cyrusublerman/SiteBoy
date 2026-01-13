# Peano curve

In geometry, the Peano curve is the first example of a space-filling curve to be discovered, by Giuseppe Peano in 1890. Peano's curve is a surjective, continuous function from the unit interval onto the unit square, however it is not injective. Peano was motivated by an earlier result of Georg Cantor that these two sets have the same cardinality. Because of this example, some authors use the phrase "Peano curve" to refer more generally to any space-filling curve.


## Construction

Peano's curve may be constructed by a sequence of steps, where the $i$th step constructs a set $S_{i}$ of squares, and a sequence $P_{i}$ of the centers of the squares, from the set and sequence constructed in the previous step. As a base case, $S_{0}$ consists of the single unit square, and $P_{0}$ is the one-element sequence consisting of its center point.

In step $i$, each square $s$ of $S_{i-1}$ is partitioned into nine smaller equal squares, and its center point $c$ is replaced by a contiguous subsequence of the centers of these nine smaller squares. This subsequence is formed by grouping the nine smaller squares into three columns, ordering the centers contiguously within each column, and then ordering the columns from one side of the square to the other, in such a way that the distance between each consecutive pair of points in the subsequence equals the side length of the small squares. There are four such orderings possible:


- Left three centers bottom to top, middle three centers top to bottom, and right three centers bottom to top
- Right three centers bottom to top, middle three centers top to bottom, and left three centers bottom to top
- Left three centers top to bottom, middle three centers bottom to top, and right three centers top to bottom
- Right three centers top to bottom, middle three centers bottom to top, and left three centers top to bottom

Among these four orderings, the one for $s$ is chosen in such a way that the distance between the first point of the ordering and its predecessor in $P_{i}$ also equals the side length of the small squares. If $c$ was the first point in its ordering, then the first of these four orderings is chosen for the nine centers that replace $c$.

The Peano curve itself is the limit of the curves through the sequences of square centers, as $i$ goes to infinity.


## L-system construction

The Peano curve shown in the introduction can be constructed using a Lindenmayer system. This L-system can be described as follows:

where "F" means "draw forward", "+" means "turn clockwise 90°", and "−" means "turn anticlockwise 90°". The image in the introduction shows the images of the first three iterations of the rules.

The curve shown in the 'construction' section be constructed as follows:

where "F" means "draw forward", "+" means "turn clockwise 90°", and "−" means "turn anticlockwise 90°". The image above shows the first two iterations of the rule.


## Variants

In the definition of the Peano curve, it is possible to perform some or all of the steps by making the centers of each row of three squares be contiguous, rather than the centers of each column of squares. These choices lead to many different variants of the Peano curve.

A "multiple radix" variant of this curve with different numbers of subdivisions in different directions can be used to fill rectangles of arbitrary shapes.

The Hilbert curve is a simpler variant of the same idea, based on subdividing squares into four equal smaller squares instead of into nine equal smaller squares.
