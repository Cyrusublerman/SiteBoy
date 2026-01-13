# Christofides algorithm

The Christofides algorithm or Christofides–Serdyukov algorithm is an algorithm for finding approximate solutions to the travelling salesman problem, on instances where the distances form a metric space (they are symmetric and obey the triangle inequality). It is an approximation algorithm that guarantees that its solutions will be within a factor of 3/2 of the optimal solution length, and is named after Nicos Christofides and Anatoliy Serdyukov (Russian: Анатолий Иванович Сердюков). Christofides published the algorithm in 1976; Serdyukov discovered it independently in 1976 but published it in 1978.


## Algorithm

Let G = (V,w) be an instance of the travelling salesman problem. That is, G is a complete graph on the set V of vertices, and the function w assigns a nonnegative real weight to every edge of G. According to the triangle inequality, for every three vertices u, v, and x, it should be the case that w(uv) + w(vx) ≥ w(ux).

Then the algorithm can be described in pseudocode as follows.


1. Create a minimum spanning tree T of G.
2. Let O be the set of vertices with odd degree in T. By the handshaking lemma, O has an even number of vertices.
3. Find a minimum-weight perfect matching M in the subgraph induced in G by O.
4. Combine the edges of M and T to form a connected multigraph H in which each vertex has even degree.
5. Form an Eulerian circuit in H.
6. Make the circuit found in previous step into a Hamiltonian circuit by skipping repeated vertices (shortcutting).

Steps 5 and 6 do not necessarily yield only a single result; as such, the heuristic can give several different paths.


### Computational complexity

The worst-case complexity of the algorithm is dominated by the perfect matching step, which has $O(n^{3})$ complexity. Serdyukov's paper claimed $O(n^{3}\log n)$ complexity, because the author was only aware of a less efficient perfect matching algorithm.


## Approximation ratio

The cost of the solution produced by the algorithm is within 3/2 of the optimum. To prove this, let C be the optimal traveling salesman tour. Removing an edge from C produces a spanning tree, which must have weight at least that of the minimum spanning tree, implying that w(T) ≤ w(C) - lower bound to the cost of the optimal solution.

The algorithm addresses the problem that T is not a tour by identifying all the odd degree vertices in T; since the sum of degrees in any graph is even (by the handshaking lemma), there is an even number of such vertices. The algorithm finds a minimum-weight perfect matching M among the odd-degree ones.

Next, number the vertices of O in cyclic order around C, and partition C into two sets of paths: the ones in which the first path vertex in cyclic order has an odd number and the ones in which the first path vertex has an even number. Each set of paths corresponds to a perfect matching of O that matches the two endpoints of each path, and the weight of this matching is at most equal to the weight of the paths. In fact, each path endpoint will be connected to another endpoint, which also has an odd number of visits due to the nature of the tour.

Since these two sets of paths partition the edges of C, one of the two sets has at most half of the weight of C, and thanks to the triangle inequality its corresponding matching has weight that is also at most half the weight of C. The minimum-weight perfect matching can have no larger weight, so w(M) ≤ w(C)/2. Adding the weights of T and M gives the weight of the Euler tour, at most 3w(C)/2. Thanks to the triangle inequality, even though the Euler tour might revisit vertices, shortcutting does not increase the weight, so the weight of the output is also at most 3w(C)/2.


## Lower bounds

There exist inputs to the travelling salesman problem that cause the Christofides algorithm to find a solution whose approximation ratio is arbitrarily close to 3/2. One such class of inputs are formed by a path of n vertices, with the path edges having weight 1, together with a set of edges connecting vertices two steps apart in the path with weight 1 + ε for a number ε chosen close to zero but positive.

All remaining edges of the complete graph have distances given by the shortest paths in this subgraph. Then the minimum spanning tree will be given by the path, of length n − 1, and the only two odd vertices will be the path endpoints, whose perfect matching consists of a single edge with weight approximately n/2.

The union of the tree and the matching is a cycle, with no possible shortcuts, and with weight approximately 3n/2. However, the optimal solution uses the edges of weight 1 + ε together with two weight-1 edges incident to the endpoints of the path, and has total weight (1 + ε)(n − 2) + 2, close to n for small values of ε. Hence we obtain an approximation ratio of 3/2.


## Example


## Further developments

This algorithm is no longer the best polynomial time approximation algorithm for the TSP on general metric spaces. Karlin, Klein, and Gharan introduced a randomized approximation algorithm with approximation ratio 1.5 − 10. It follows similar principles to Christofides' algorithm, but uses a randomly chosen tree from a carefully chosen random distribution in place of the minimum spanning tree. The paper received a best paper award at the 2021 Symposium on Theory of Computing.

In the special case of Euclidean space of dimension $d$, for any $c>0$, there is a polynomial-time algorithm that finds a tour of length at most $1+{\tfrac {1}{c}}$ times the optimal for geometric instances of TSP in

$O\left(n(\log n)^{(O(c{\sqrt {d}}))^{d-1}}\right)$ time.

For each constant $c$ this time bound is in polynomial time, so this is called a polynomial-time approximation scheme (PTAS). Sanjeev Arora and Joseph S. B. Mitchell were awarded the Gödel Prize in 2010 for their simultaneous discovery of a PTAS for the Euclidean TSP.

Methods based on the Christofides–Serdyukov algorithm can also be used to approximate the stacker crane problem, a generalization of the TSP in which the input consists of ordered pairs of points from a metric space that must be traversed consecutively and in order. For this problem, it achieves an approximation ratio of 9/5.


## External links


- NIST Christofides Algorithm Definition
