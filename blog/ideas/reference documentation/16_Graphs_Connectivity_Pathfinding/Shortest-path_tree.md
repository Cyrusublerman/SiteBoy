# Shortest-path tree

In mathematics and computer science, a shortest-path tree rooted at a vertex v of a connected, undirected graph G is a spanning tree T of G, such that the path distance from root v to any other vertex u in T is the shortest path distance from v to u in G.

In connected graphs where shortest paths are well-defined (i.e. where there are no negative-length cycles), we may construct a shortest-path tree using the following algorithm:


1. Compute dist(u), the shortest-path distance from root v to vertex u in G using Dijkstra's algorithm or Bellman–Ford algorithm.
2. For all non-root vertices u, we can assign to u a parent vertex pu such that pu is connected to u, and that dist(pu) + edge_dist(pu,u) = dist(u). In case multiple choices for pu exist, choose pu for which there exists a shortest path from v to pu with as few edges as possible; this tie-breaking rule is needed to prevent loops when there exist zero-length cycles.
3. Construct the shortest-path tree using the edges between each node and its parent.

The above algorithm guarantees the existence of shortest-path trees. Like minimum spanning trees, shortest-path trees in general are not unique.

In graphs for which all edge weights are equal, shortest path trees coincide with breadth-first search trees.

In graphs that have negative cycles, the set of shortest simple paths from v to all other vertices do not necessarily form a tree.

For simple connected graphs, shortest-path trees can be used to suggest a non-linear relationship between two network centrality measures, closeness and degree. By assuming that the branches of the shortest-path trees are statistically similar for any root node in one network, one may show that the size of the branches depend only on the number of branches connected to the root vertex, i.e. to the degree of the root node. From this one deduces that the inverse of closeness, a length scale associated with each vertex, varies approximately linearly with the logarithm of degree. The relationship is not exact but it captures a correlation between closeness and degree in large number of networks constructed from real data and this success suggests that shortest-path trees can be a useful approximation in network analysis.


## See also


- Shortest path problem
