# Visvalingam–Whyatt algorithm

The Visvalingam–Whyatt algorithm, or simply the Visvalingam algorithm, is an algorithm that decimates a curve composed of line segments to a similar curve with fewer points, primarily for usage in cartographic generalisation.


## Idea

Given a polygonal chain (often called a polyline), the algorithm attempts to find a similar chain composed of fewer points.

Points are assigned an importance based on local conditions, and points are removed from the least important to most important.

In Visvalingam's algorithm, the importance is related to the triangular area added by each point.


## Algorithm

Given a chain of 2d points
$$\left\{p_{i}\right\}=\left\{{\begin{bmatrix}x_{i}\\y_{i}\end{bmatrix}}\right\}
$$, the importance of each interior point is computed by finding the area of the triangle formed by it and its immediate neighbors. This can be done quickly using a matrix determinant. Alternatively, the equivalent formula below can be used


$$A_{i}={\frac {1}{2}}\left|x_{i-1}y_{i}+x_{i}y_{i+1}+x_{i+1}y_{i-1}-x_{i-1}y_{i+1}-x_{i}y_{i-1}-x_{i+1}y_{i}\right|
$$

The minimum importance point $p_{i}$ is located and marked for removal (note that $A_{i-1}$ and $A_{i+1}$ will need to be recomputed). This process is repeated until either the desired number of points is reached, or the contribution of the least important point is large enough to not neglect.


### Advantages


- The algorithm is easy to understand and explain, but is often competitive with much more complex approaches.
- With the use of a priority queue, the algorithm is performant on large inputs, since the importance of each point can be computed using only its neighbors, and removing a point only requires recomputing the importance of two other points.
- It is simple to generalize to higher dimensions, since the area of the triangle between points has a consistent meaning.


### Disadvantages


- The algorithm does not differentiate between sharp spikes and shallow features, meaning that it will clean up sharp spikes that may be important.
- The algorithm simplifies the entire length of the curve evenly, meaning that curves with high and low detail areas will likely have their fine details eroded.


## See also


- Curve fitting

Alternative algorithms for line simplification include:


- Ramer–Douglas–Peucker
- Reumann–Witkam
- Opheim simplification
- Lang simplification
- Zhao–Saalfeld algorithm


## External links


- Interactive example of the algorithm
