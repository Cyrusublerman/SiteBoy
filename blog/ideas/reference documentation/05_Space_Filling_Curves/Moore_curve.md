# Moore curve

A Moore curve (after E. H. Moore) is a continuous fractal space-filling curve which is a variant of the Hilbert curve. Precisely, it is the loop version of the Hilbert curve, and it may be thought as the union of four copies of the Hilbert curves combined in such a way to make the endpoints coincide.

Because the Moore curve is plane-filling, its Hausdorff dimension is 2.

The following figure shows the initial stages of the Moore curve:


## Representation as Lindenmayer system

The Moore curve can be expressed by a rewrite system (L-system).

Alphabet: L, R

Constants: F, +, −

Axiom: LFL+F+LFL

Production rules:

L → −RF+LFL+FR−

R → +LF−RFR−FL+

Here, F means "draw forward", − means "turn left 90°", and + means "turn right 90°" (see turtle graphics).


## Generalization to higher dimensions

There is an elegant generalization of the Hilbert curve to arbitrary higher dimensions. Traversing the polyhedron vertices of an n-dimensional hypercube in Gray code order produces a generator for the n-dimensional Hilbert curve.

To construct the order N Moore curve in K dimensions, you place 2 copies of the order N−1 K-dimensional Hilbert curve at each corner of a K-dimensional hypercube, rotate them and connect them by line segments. The added line segments follow the path of an order 1 Hilbert curve. This construction even works for the order 1 Moore curve if you define the order 0 Hilbert curve to be a geometric point. It then follows that an order 1 Moore curve is the same as an order 1 Hilbert curve.

To construct the order N Moore curve in three dimensions, you place 8 copies of the order N−1 3D Hilbert curve at the corners of a cube, rotate them and connect them by line segments.


## See also


- Hilbert curve
- Sierpiński curve
- z-order (curve)
- List of fractals by Hausdorff dimension


## External links


- A. Bogomolny, Plane Filling Curves from Interactive Mathematics Miscellany and Puzzles, Accessed 7 May 2008.
