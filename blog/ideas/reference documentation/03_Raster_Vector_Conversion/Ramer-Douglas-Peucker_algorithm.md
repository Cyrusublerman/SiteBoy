# Ramer–Douglas–Peucker algorithm

The Ramer–Douglas–Peucker algorithm, also known as the Douglas–Peucker algorithm and iterative end-point fit algorithm, is an algorithm that decimates a curve composed of line segments to a similar curve with fewer points. It was one of the earliest successful algorithms developed for cartographic generalization. It produces the most accurate generalization, but it is also more time-consuming.


## Algorithm

The starting curve is an ordered set of points or lines and the distance dimension ε > 0.

The algorithm recursively divides the line. Initially it is given all the points between the first and last point. It automatically marks the first and last point to be kept. It then finds the point that is farthest from the line segment with the first and last points as end points; this point is always farthest on the curve from the approximating line segment between the end points. If the point is closer than ε to the line segment, then any points not currently marked to be kept can be discarded without the simplified curve being worse than ε.

If the point farthest from the line segment is greater than ε from the approximation then that point must be kept. The algorithm recursively calls itself with the first point and the farthest point and then with the farthest point and the last point, which includes the farthest point being marked as kept.

When the recursion is completed a new output curve can be generated consisting of all and only those points that have been marked as kept.


### Non-parametric Ramer–Douglas–Peucker

The choice of ε is usually user-defined. Like most line fitting, polygonal approximation or dominant point detection methods, it can be made non-parametric by using the error bound due to digitization and quantization as a termination condition.


### Pseudocode

Assuming the input is a one-based array:


## Application

The algorithm is used for the processing of vector graphics and cartographic generalization. It is recognized as the one that delivers the best perceptual representations of the original lines. But a self-intersection could occur if the accepted approximation is not sufficiently fine which led to the development of variant algorithms.

The algorithm is widely used in robotics to perform simplification and denoising of range data acquired by a rotating range scanner; in this field it is known as the split-and-merge algorithm and is attributed to Duda and Hart.


## Complexity

The running time of this algorithm when run on a polyline consisting of n – 1 segments and n vertices is given by the recurrence T(n) = T(i + 1) + T(n − i) + O(n) where i = 1, 2,..., n − 2 is the value of index in the pseudocode. In the worst case, i = 1 or i = n − 2 at each recursive invocation yields a running time of O(n). In the best case, i = .mw-parser-output .sfrac{white-space:nowrap}.mw-parser-output .sfrac.tion,.mw-parser-output .sfrac .tion{display:inline-block;vertical-align:-0.5em;font-size:85%;text-align:center}.mw-parser-output .sfrac .num{display:block;line-height:1em;margin:0.0em 0.1em;border-bottom:1px solid}.mw-parser-output .sfrac .den{display:block;line-height:1em;margin:0.1em 0.1em}.mw-parser-output .sr-only{border:0;clip:rect(0,0,0,0);clip-path:polygon(0px 0px,0px 0px,0px 0px);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}⁠n/2⁠ or i = ⁠n ± 1/2⁠ at each recursive invocation yields a running time of Ω(n log n).

Using (fully or semi-) dynamic convex hull data structures, the simplification performed by the algorithm can be accomplished in O(n log n) time.

Given specific conditions related to the bounding metric, it is possible to decrease the computational complexity to a range between O(n) and O(2n) through the application of an iterative method.

The running time for digital elevation model generalization using the three-dimensional variant of the algorithm is O(n), but techniques have been developed to reduce the running time for larger data in practice.


## Similar algorithms

Alternative algorithms for line simplification include:


- Visvalingam–Whyatt
- Reumann–Witkam
- Opheim simplification
- Lang simplification
- Zhao–Saalfeld
- Imai-Iri


## See also


- Curve fitting


## Further reading


## External links


- Boost.Geometry support Douglas–Peucker simplification algorithm
- Implementation of Ramer–Douglas–Peucker and many other simplification algorithms with open source licence in C++
- XSLT implementation of the algorithm for use with KML data.
- You can see the algorithm applied to a GPS log from a bike ride at the bottom of this page
- Interactive visualization of the algorithm
- Implementation in F#
- Ruby gem implementation
- JTS, Java Topology Suite, contains Java implementation of many algorithms, including the Douglas-Peucker algorithm
- Rosetta Code (Implementations in many languages)
