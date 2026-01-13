# Space-filling tree

Space-filling trees are geometric constructions that are analogous to space-filling curves, but have a branching, tree-like structure and are rooted. A space-filling tree is defined by an incremental process that results in a tree for which every point in the space has a finite-length path that converges to it. In contrast to space-filling curves, individual paths in the tree are short, allowing any part of the space to be quickly reached from the root. The simplest examples of space-filling trees have a regular, self-similar, fractal structure, but can be generalized to non-regular and even randomized/Monte-Carlo variants (see Rapidly exploring random tree). Space-filling trees have interesting parallels in nature, including fluid distribution systems, vascular networks, and fractal plant growth, and many interesting connections to L-systems in computer science.


## Definition

A space-filling tree is defined by an iterative process whereby a single point in a continuous space is connected via a continuous path to every other point in the space by a path of finite length, and for every point in the space, there is at least one path that converges to it.

The concept of a "space-filling tree" in this sense was described in Chapter 15 of Mandelbrot's influential book The Fractal Geometry of Nature (1982). The concept was made more rigorous and given the name "space-filling tree" in a 2009 tech report that defines "space-filling" and "tree" differently than their traditional definitions in mathematics. As explained in the space-filling curve article, in 1890, Peano found the first space-filling curve, and by Jordan's 1887 definition, which is now standard, a curve is a single function, not a sequence of functions. The curve is "space filling" because it is "a curve whose range contains the entire 2-dimensional unit square" (as explained in the first sentence of space-filling curve).

In contrast, a space-filling tree, as defined in the tech report, is not a single tree. It is only a sequence of trees. The paper says "A space-filling tree is actually defined as an infinite sequence of trees". It defines $T_{\text{square}}$ as a "sequence of trees", then states "$T_{\text{square}}$ is a space-filling tree". It is not space-filling in the standard sense of including the entire 2-dimensional unit square. Instead, the paper defines it as having trees in the sequence coming arbitrarily close to every point. It states "A tree sequence T is called 'space filling' in a space X if for every x ∈ X, there exists a path in the tree that starts at the root and converges to x.". The standard term for this concept is that it includes a set of points that is dense everywhere in the unit square.


## Examples

The simplest example of a space-filling tree is one that fills a square planar region. The images illustrate the construction for the planar region $[0,1]^{2}\subset \mathbb {R} ^{2}$. At each iteration, additional branches are added to the existing trees.


- Square space-filling tree (Iteration 1)
- Square space-filling tree (Iteration 2)
- Square space-filling tree (Iteration 3)
- Square space-filling tree (Iteration 4)
- Square space-filling tree (Iteration 5)
- Square space-filling tree (Iteration 6)

Space-filling trees can also be defined for a variety of other shapes and volumes. Below is the subdivision scheme used to define a space-filling for a triangular region. At each iteration, additional branches are added to the existing trees connecting the center of each triangle to the centers of the four subtriangles.


- Subdivision scheme for the first three iterations of the triangle space-filling tree

The first six iterations of the triangle space-filling tree are illustrated below:


- Triangle space-filling tree (Iteration 1)
- Triangle space-filling tree (Iteration 2)
- Triangle space-filling tree (Iteration 3)
- Triangle space-filling tree (Iteration 4)
- Triangle space-filling tree (Iteration 5)
- Triangle space-filling tree (Iteration 6)

Space-filling trees can also be constructed in higher dimensions. The simplest examples are cubes in $\mathbb {R} ^{3}$ and hypercubes in $\mathbb {R} ^{n}$. A similar sequence of iterations used for the square space-filling tree can be used for hypercubes. The third iteration of such a space-filling tree in $\mathbb {R} ^{3}$ is illustrated below:


- Cube space-filling tree (Iteration 3)


## See also

H tree Space-filling curve Rapidly exploring random tree (RRTs) Binary space partitioning
