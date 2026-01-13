# Hilbert curve

The Hilbert curve (also known as the Hilbert space-filling curve) is a continuous fractal space-filling curve first described by the German mathematician David Hilbert in 1891, as a variant of the space-filling Peano curves discovered by Giuseppe Peano in 1890.

Because it is space-filling, its Hausdorff dimension is 2 (precisely, its image is the unit square, whose dimension is 2 in any definition of dimension; its graph is a compact set homeomorphic to the closed unit interval, with Hausdorff dimension 1).

The Hilbert curve is constructed as a limit of piecewise linear curves. The length of the $n$th curve is $\textstyle 2^{n}-{1 \over 2^{n}}$, i.e., the length grows exponentially with $n$, even though each curve is contained in a square with area $1$.


## Images


- Hilbert curve, first order
- Hilbert curves, first and second orders
- Hilbert curves, first to third orders
- Production rules
- Hilbert curve, construction color-coded
- A 3-D Hilbert curve with color showing progression
- Variant, first three iterations[3]


## Applications and mapping algorithms

Both the true Hilbert curve and its discrete approximations are useful because they give a mapping between 1D and 2D space that preserves locality fairly well. This means that two data points which are close to each other in one-dimensional space are also close to each other after folding. The converse is not always true.

Because of this locality property, the Hilbert curve is widely used in computer science. For example, the range of IP addresses used by computers can be mapped into a picture using the Hilbert curve. Code to generate the image would map from 2D to 1D to find the color of each pixel, and the Hilbert curve is sometimes used because it keeps nearby IP addresses close to each other in the picture. The locality property of the Hilbert curve has also been used to design algorithms for exploring regions with mobile robots and indexing geospatial location data.

In an algorithm called Riemersma dithering, grayscale photographs can be converted to a dithered black-and-white image using thresholding, with the leftover amount from each pixel added to the next pixel along the Hilbert curve. Code to do this would map from 1D to 2D, and the Hilbert curve is sometimes used because it does not create the distracting patterns that would be visible to the eye if the order were simply left to right across each row of pixels. Hilbert curves in higher dimensions are an instance of a generalization of Gray codes, and are sometimes used for similar purposes, for similar reasons. For multidimensional databases, Hilbert order has been proposed to be used instead of Z order because it has better locality-preserving behavior. For example, Hilbert curves have been used to compress and accelerate R-tree indexes (see Hilbert R-tree). They have also been used to help compress data warehouses.

The linear distance of any point along the curve can be converted to coordinates in n dimensions for a given n, and vice versa, using any of several standard mathematical techniques such as Skilling's method.

It is possible to implement Hilbert curves efficiently even when the data space does not form a square. Moreover, there are several possible generalizations of Hilbert curves to higher dimensions.


## Representation as Lindenmayer system

The Hilbert Curve can be expressed by a rewrite system (L-system).

Alphabet : A, B

Constants : F + −

Axiom : A

Production rules: A → +BF−AFA−FB+ B → −AF+BFB+FA−

A → +BF−AFA−FB+

B → −AF+BFB+FA−

Here, "F" means "draw forward", "+" means "turn left 90°", "-" means "turn right 90°" (see turtle graphics), and "A" and "B" are ignored during drawing.


## Other implementations

Graphics Gems II discusses Hilbert curve coherency, and provides implementation.

The Hilbert Curve is commonly used among rendering images or videos. Common programs such as Blender and Cinema 4D use the Hilbert Curve to trace the objects, and render the scene.

The slicer software used to convert 3D models into toolpaths for a 3D printer typically has the Hilbert curve as an option for an infill pattern.


## See also


- Hilbert curve scheduling
- Hilbert R-tree
- Locality of reference
- Locality-sensitive hashing
- Moore curve
- Murray polygon
- Sierpiński curve
- List of fractals by Hausdorff dimension


## Further reading


- Warren Jr., Henry S. (2013). Hacker's Delight (2 ed.). Addison Wesley – Pearson Education, Inc. ISBN 978-0-321-84268-8.
- McKenna, Douglas M. (2019). Hilbert Curves: Outside-In and Inside-Gone. Mathemaesthetics, Inc. ISBN 978-1-7332188-0-1.


## External links


- Dynamic Hilbert curve with JSXGraph
- Three.js WebGL 3D Hilbert curve demo
- XKCD cartoon using the locality properties of the Hilbert curve to create a "map of the internet"
- Gcode generator for Hilbert curve Archived 2019-07-09 at the Wayback Machine
- Iterative implementation of Hilbert curve in JavaScript
- Algorithm 781: generating Hilbert's space-filling curve by recursion (ACM Digital Library)
