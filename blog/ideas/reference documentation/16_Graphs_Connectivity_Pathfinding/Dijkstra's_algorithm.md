# Dijkstra's algorithm


*[Table: Dijkstra's algorithm]*

Dijkstra's algorithm (/ˈdaɪkstrəz/ DYKE-strəz) is an algorithm for finding the shortest paths between nodes in a weighted graph, which may represent, for example, a road network. It was conceived by computer scientist Edsger W. Dijkstra in 1956 and published three years later.

Dijkstra's algorithm finds the shortest path from a given source node to every other node. It can be used to find the shortest path to a specific destination node, by terminating the algorithm after determining the shortest path to the destination node. For example, if the nodes of the graph represent cities, and the costs of edges represent the distances between pairs of cities connected by a direct road, then Dijkstra's algorithm can be used to find the shortest route between one city and all other cities. A common application of shortest path algorithms is network routing protocols, most notably IS-IS (Intermediate System to Intermediate System) and OSPF (Open Shortest Path First). It is also employed as a subroutine in algorithms such as Johnson's algorithm.

The algorithm uses a min-priority queue data structure for selecting the shortest paths known so far. Before more advanced priority queue structures were discovered, Dijkstra's original algorithm ran in $\Theta (|V|^{2})$ time, where $|V|$ is the number of nodes. Fredman & Tarjan 1984 proposed a Fibonacci heap priority queue to optimize the running time complexity to $\Theta (|E|+|V|\log |V|)$. This is asymptotically the fastest known single-source shortest-path algorithm for arbitrary directed graphs with unbounded non-negative weights. However, specialized cases (such as bounded/integer weights, directed acyclic graphs etc.) can be improved further. If preprocessing is allowed, algorithms such as contraction hierarchies can be up to seven orders of magnitude faster.

Dijkstra's algorithm is commonly used on graphs where the edge weights are positive integers or real numbers. It can be generalized to any graph where the edge weights are partially ordered, provided the subsequent labels (a subsequent label is produced when traversing an edge) are monotonically non-decreasing.

In many fields, particularly artificial intelligence, Dijkstra's algorithm or a variant offers a uniform cost search and is formulated as an instance of the more general idea of best-first search.


## History

Dijkstra thought about the shortest path problem while working as a programmer at the Mathematical Center in Amsterdam in 1956. He wanted to demonstrate the capabilities of the new ARMAC computer. His objective was to choose a problem and a computer solution that non-computing people could understand. He designed the shortest path algorithm and later implemented it for ARMAC for a slightly simplified transportation map of 64 cities in the Netherlands (he limited it to 64, so that 6 bits would be sufficient to encode the city number). A year later, he came across another problem advanced by hardware engineers working on the institute's next computer: minimize the amount of wire needed to connect the pins on the machine's back panel. As a solution, he re-discovered Prim's minimal spanning tree algorithm (known earlier to Jarník, and also rediscovered by Prim). Dijkstra published the algorithm in 1959, two years after Prim and 29 years after Jarník.


## Algorithm

The algorithm requires a starting node, and computes the shortest distance from that starting node to each other node. Dijkstra's algorithm starts with infinite distances and tries to improve them step by step:


1. Create a set of all unvisited nodes: the unvisited set.
2. Assign to every node a distance from start value: for the starting node, it is zero, and for all other nodes, it is infinity, since initially no path is known to these nodes. During execution, the distance of a node N is the length of the shortest path discovered so far between the starting node and N.
3. From the unvisited set, select the current node to be the one with the smallest (finite) distance; initially, this is the starting node (distance zero). If the unvisited set is empty, or contains only nodes with infinite distance (which are unreachable), then the algorithm terminates by skipping to step 6. If the only concern is the path to a target node, the algorithm terminates once the current node is the target node. Otherwise, the algorithm continues.
4. For the current node, consider all of its unvisited neighbors and update their distances through the current node; compare the newly calculated distance to the one currently assigned to the neighbor and assign the smaller one to it. For example, if the current node A is marked with a distance of 6, and the edge connecting it with its neighbor B has length 2, then the distance to B through A is 6 + 2 = 8. If B was previously marked with a distance greater than 8, then update it to 8 (the path to B through A is shorter). Otherwise, keep its current distance (the path to B through A is not the shortest).
5. After considering all of the current node's unvisited neighbors, the current node is removed from the unvisited set. Thus a visited node is never rechecked, which is correct because the distance recorded on the current node is minimal (as ensured in step 3), and thus final. Repeat from step 3.
6. Once the loop exits (steps 3–5), every visited node contains its shortest distance from the starting node.


## Description

The shortest path between two intersections on a city map can be found by this algorithm using pencil and paper. Every intersection is listed on a separate line: one is the starting point and is labeled (given a distance of) 0. Every other intersection is initially labeled with a distance of infinity. This is done to note that no path to these intersections has yet been established. At each iteration one intersection becomes the current intersection. For the first iteration, this is the starting point.

From the current intersection, the distance to every neighbor (directly-connected) intersection is assessed by summing the label (value) of the current intersection and the distance to the neighbor and then relabeling the neighbor with the lesser of that sum and the neighbor's existing label. I.e., the neighbor is relabeled if the path to it through the current intersection is shorter than previously assessed paths. If so, mark the road to the neighbor with an arrow pointing to it, and erase any other arrow that points to it. After the distances to each of the current intersection's neighbors have been assessed, the current intersection is marked as visited. The unvisited intersection with the smallest label becomes the current intersection and the process repeats until all nodes with labels less than the destination's label have been visited.

Once no unvisited nodes remain with a label smaller than the destination's label, the remaining arrows show the shortest path.


## Pseudocode

In the following pseudocode, .mw-parser-output .monospaced{font-family:monospace,monospace}dist is an array that contains the current distances from the source to other vertices, i.e. dist[u] is the current distance from the source to the vertex u. The prev array contains pointers to previous-hop nodes on the shortest path from source to the given vertex (equivalently, it is the next-hop on the path from the given vertex to the source). The code u ← vertex in Q with min dist[u], searches for the vertex u in the vertex set Q that has the least dist[u] value. Graph.Edges(u, v) returns the length of the edge joining (i.e. the distance between) the two neighbor-nodes u and v. The variable alt on line 14 is the length of the path from the source node to the neighbor node v if it were to go through u. If this path is shorter than the current shortest path recorded for v, then the distance of v is updated to alt.

To find the shortest path between vertices source and target, the search terminates after line 10 if u = target. The shortest path from source to target can be obtained by reverse iteration:

Now sequence S is the list of vertices constituting one of the shortest paths from source to target, or the empty sequence if no path exists.

A more general problem is to find all the shortest paths between source and target (there might be several of the same length). Then instead of storing only a single node in each entry of prev[] all nodes satisfying the relaxation condition can be stored. For example, if both r and source connect to target and they lie on different shortest paths through target (because the edge cost is the same in both cases), then both r and source are added to prev[target]. When the algorithm completes, prev[] data structure describes a graph that is a subset of the original graph with some edges removed. Its key property is that if the algorithm was run with some starting node, then every path from that node to any other node in the new graph is the shortest path between those nodes graph, and all paths of that length from the original graph are present in the new graph. Then to actually find all these shortest paths between two given nodes, a path finding algorithm on the new graph, such as depth-first search would work.


### Using a priority queue

A min-priority queue is an abstract data type that provides 3 basic operations: add_with_priority(), decrease_priority() and extract_min(). As mentioned earlier, using such a data structure can lead to faster computing times than using a basic queue. Notably, Fibonacci heap or Brodal queue offer optimal implementations for those 3 operations. As the algorithm is slightly different in appearance, it is mentioned here, in pseudocode as well:

Instead of filling the priority queue with all nodes in the initialization phase, it is possible to initialize it to contain only source; then, inside the if alt < dist[v] block, the decrease_priority() becomes an add_with_priority() operation.

Yet another alternative is to add nodes unconditionally to the priority queue and to instead check after extraction (u ← Q.extract_min()) that it isn't revisiting, or that no shorter connection was found yet in the if alt < dist[v] block. This can be done by additionally extracting the associated priority p from the queue and only processing further if p == dist[u] inside the while Q is not empty loop.

These alternatives can use entirely array-based priority queues without decrease-key functionality, which have been found to achieve even faster computing times in practice. However, the difference in performance was found to be narrower for denser graphs.


## Proof

To prove the correctness of Dijkstra's algorithm, mathematical induction can be used on the number of visited nodes.

Invariant hypothesis: For each visited node v, dist[v] is the shortest distance from source to v, and for each unvisited node u, dist[u] is the shortest distance from source to u when traveling via visited nodes only, or infinity if no such path exists. (Note: we do not assume dist[u] is the actual shortest distance for unvisited nodes, while dist[v] is the actual shortest distance)


### Base case

The base case is when there is just one visited node, source. Its distance is defined to be zero, which is the shortest distance, since negative weights are not allowed. Hence, the hypothesis holds.


### Induction

Assuming that the hypothesis holds for $k$ visited nodes, to show it holds for $k+1$ nodes, let u be the next visited node, i.e. the node with minimum dist[u]. The claim is that dist[u] is the shortest distance from source to u.

The proof is by contradiction. If a shorter path were available, then this shorter path either contains another unvisited node or not.


- In the former case, let w be the first unvisited node on this shorter path. By induction, the shortest paths from source to u and w through visited nodes only have costs dist[u] and dist[w] respectively. This means the cost of going from source to u via w has the cost of at least dist[w] + the minimal cost of going from w to u. As the edge costs are positive, the minimal cost of going from w to u is a positive number. However, dist[u] is at most dist[w] because otherwise w would have been picked by the priority queue instead of u. This is a contradiction, since it has already been established that dist[w] + a positive number < dist[u].
- In the latter case, let w be the last but one node on the shortest path. That means dist[w] + Graph.Edges[w,u] < dist[u]. That is a contradiction because by the time w is visited, it should have set dist[u] to at most dist[w] + Graph.Edges[w,u].

For all other visited nodes v, the dist[v] is already known to be the shortest distance from source already, because of the inductive hypothesis, and these values are unchanged.

After processing u, it is still true that for each unvisited node w, dist[w] is the shortest distance from source to w using visited nodes only. Any shorter path that did not use u, would already have been found, and if a shorter path used u it would have been updated when processing u.

After all nodes are visited, the shortest path from source to any node v consists only of visited nodes. Therefore, dist[v] is the shortest distance.


## Running time

Bounds of the running time of Dijkstra's algorithm on a graph with edges E and vertices V can be expressed as a function of the number of edges, denoted $|E|$, and the number of vertices, denoted $|V|$, using big-O notation. The complexity bound depends mainly on the data structure used to represent the set Q. In the following, upper bounds can be simplified because $|E|$ is $O(|V|^{2})$ for any simple graph, but that simplification disregards the fact that in some problems, other upper bounds on $|E|$ may hold.

For any data structure for the vertex set Q, the running time is:


$$\Theta (|E|\cdot T_{\mathrm {dk} }+|V|\cdot T_{\mathrm {em} }),
$$

where $T_{\mathrm {dk} }$ and $T_{\mathrm {em} }$ are the complexities of the decrease-key and extract-minimum operations in Q, respectively.

The simplest version of Dijkstra's algorithm stores the vertex set Q as a linked list or array, and edges as an adjacency list or matrix. In this case, extract-minimum is simply a linear search through all vertices in Q, so the running time is $\Theta (|E|+|V|^{2})=\Theta (|V|^{2})$.

For sparse graphs, that is, graphs with far fewer than $|V|^{2}$ edges, Dijkstra's algorithm can be implemented more efficiently by storing the graph in the form of adjacency lists and using a self-balancing binary search tree, binary heap, pairing heap, Fibonacci heap or a priority heap as a priority queue to implement extracting minimum efficiently. To perform decrease-key steps in a binary heap efficiently, it is necessary to use an auxiliary data structure that maps each vertex to its position in the heap, and to update this structure as the priority queue Q changes. With a self-balancing binary search tree or binary heap, the algorithm requires

$\Theta ((|E|+|V|)\log |V|)$

time in the worst case; for connected graphs this time bound can be simplified to $\Theta (|E|\log |V|)$. The Fibonacci heap improves this to

$\Theta (|E|+|V|\log |V|).$

When using binary heaps, the average case time complexity is lower than the worst-case: assuming edge costs are drawn independently from a common probability distribution, the expected number of decrease-key operations is bounded by $\Theta (|V|\log(|E|/|V|))$, giving a total running time of


$$O\left(|E|+|V|\log {\frac {|E|}{|V|}}\log |V|\right).
$$


### Practical optimizations and infinite graphs

In common presentations of Dijkstra's algorithm, initially all nodes are entered into the priority queue. This is, however, not necessary: the algorithm can start with a priority queue that contains only one item, and insert new items as they are discovered (instead of doing a decrease-key, check whether the key is in the queue; if it is, decrease its key, otherwise insert it). This variant has the same worst-case bounds as the common variant, but maintains a smaller priority queue in practice, speeding up queue operations.

Moreover, not inserting all nodes in a graph makes it possible to extend the algorithm to find the shortest path from a single source to the closest of a set of target nodes on infinite graphs or those too large to represent in memory. The resulting algorithm is called uniform-cost search (UCS) in the artificial intelligence literature and can be expressed in pseudocode as

Its complexity can be expressed in an alternative way for very large graphs: when C is the length of the shortest path from the start node to any node satisfying the "goal" predicate, each edge has cost at least ε, and the number of neighbors per node is bounded by b, then the algorithm's worst-case time and space complexity are both in O(b).

Further optimizations for the single-target case include bidirectional variants, goal-directed variants such as the A* algorithm (see § Related problems and algorithms), graph pruning to determine which nodes are likely to form the middle segment of shortest paths (reach-based routing), and hierarchical decompositions of the input graph that reduce s–t routing to connecting s and t to their respective "transit nodes" followed by shortest-path computation between these transit nodes using a "highway". Combinations of such techniques may be needed for optimal practical performance on specific problems.


### Bidirectional Dijkstra

Bidirectional Dijkstra is a variant of Dijkstra’s algorithm designed to efficiently compute the shortest path between a given source vertex s and target vertex t, rather than all vertices. The key idea is to run two simultaneous searches: one forward from s on the original graph and one backward from t on the graph with edges reversed. Each search maintains its own tentative distance estimates, priority queue, and set of “settled” vertices. The two frontiers advance toward each other and meet somewhere along the shortest s–t path.

Two distance arrays are maintained: df[v] (distance from s to v) and db[v] (distance from v to t), initialized to ∞ except df[s] = 0 and db[t] = 0. Two priority queues Qf and Qb hold vertices not yet fully processed, and two sets Sf and Sb store vertices whose shortest-path distance is finalized in each direction. A variable μ stores the length of the best full s–t path found so far, initially ∞.

The algorithm repeatedly extracts the minimum-distance vertex from whichever queue currently has the smaller key, relaxes its outgoing (or incoming) edges, and updates μ whenever it discovers a connection between the two settled sets:


$$\mu \leftarrow \min(\mu ,\;d_{f}[u]+w(u,x)+d_{b}[x])
$$when relaxing edge (u,x) in the forward search and x ∈ Sb,

and symmetrically for the backward search.

A key feature is the stopping condition: once the sum of the current minimum priorities in both queues is at least μ, no yet-unsettled path can improve upon μ. At this point μ equals the true shortest-path distance δ(s,t), and the search terminates.

This criterion avoids a common mistake of halting as soon as the two frontiers touch, which may overlook a shorter alternative crossing elsewhere.

Because each search only needs to explore roughly half of the search space in typical graphs, the bidirectional method often visits far fewer vertices and relaxes far fewer edges than one-directional Dijkstra on single-pair queries. In road-network–like graphs the savings can be dramatic, sometimes reducing the explored region from an exponential-size ball to two smaller half-balls.

The method is widely used in point-to-point routing for maps and navigation software and serves as a base for many speed-up techniques such as the ALT, contraction hierarchies, and reach-based routing.

If the actual shortest path (not just its distance) is desired, predecessor pointers can be stored in both searches. When μ is updated through some crossing vertex x, the algorithm records this meeting point and reconstructs the final route as the forward path from s to x concatenated with the backward path from x to t.

Theoretical research shows that an optimized bidirectional approach can be instance-optimal, meaning no correct algorithm can asymptotically relax fewer edges on the same graph instance.


### Optimality for comparison-sorting by distance

As well as simply computing distances and paths, Dijkstra's algorithm can be used to sort vertices by their distances from a given starting vertex. In 2023, Haeupler, Rozhoň, Tětek, Hladík, and Tarjan (one of the inventors of the 1984 heap), proved that, for this sorting problem on a positively-weighted directed graph, a version of Dijkstra's algorithm with a special heap data structure has a runtime and number of comparisons that is within a constant factor of optimal among comparison-based algorithms for the same sorting problem on the same graph and starting vertex but with variable edge weights. To achieve this, they use a comparison-based heap whose cost of returning/removing the minimum element from the heap is logarithmic in the number of elements inserted after it rather than in the number of elements in the heap.


### Specialized variants

When arc weights are small integers (bounded by a parameter $C$), specialized queues can be used for increased speed. The first algorithm of this type was Dial's algorithm for graphs with positive integer edge weights, which uses a bucket queue to obtain a running time $O(|E|+|V|C)$. The use of a Van Emde Boas tree as the priority queue brings the complexity to $O(|E|+|V|\log C/\log \log |V|C)$ . Another interesting variant based on a combination of a new radix heap and the well-known Fibonacci heap runs in time $O(|E|+|V|{\sqrt {\log C}})$ . Finally, the best algorithms in this special case run in $O(|E|\log \log |V|)$ time and
$$O(|E|+|V|\min\{(\log |V|)^{1/3+\varepsilon },(\log C)^{1/4+\varepsilon }\})
$$time.


## Related problems and algorithms

Dijkstra's original algorithm can be extended with modifications. For example, sometimes it is desirable to present solutions which are less than mathematically optimal. To obtain a ranked list of less-than-optimal solutions, the optimal solution is first calculated. A single edge appearing in the optimal solution is removed from the graph, and the optimum solution to this new graph is calculated. Each edge of the original solution is suppressed in turn and a new shortest-path calculated. The secondary solutions are then ranked and presented after the first optimal solution.

Dijkstra's algorithm is usually the working principle behind link-state routing protocols. OSPF and IS-IS are the most common.

Unlike Dijkstra's algorithm, the Bellman–Ford algorithm can be used on graphs with negative edge weights, as long as the graph contains no negative cycle reachable from the source vertex s. The presence of such cycles means that no shortest path can be found, since the label becomes lower each time the cycle is traversed. (This statement assumes that a "path" is allowed to repeat vertices. In graph theory that is normally not allowed. In theoretical computer science it often is allowed.) It is possible to adapt Dijkstra's algorithm to handle negative weights by combining it with the Bellman-Ford algorithm (to remove negative edges and detect negative cycles): Johnson's algorithm.

The A* algorithm is a generalization of Dijkstra's algorithm that reduces the size of the subgraph that must be explored, if additional information is available that provides a lower bound on the distance to the target.

The process that underlies Dijkstra's algorithm is similar to the greedy process used in Prim's algorithm. Prim's purpose is to find a minimum spanning tree that connects all nodes in the graph; Dijkstra is concerned with only two nodes. Prim's does not evaluate the total weight of the path from the starting node, only the individual edges.

Breadth-first search can be viewed as a special-case of Dijkstra's algorithm on unweighted graphs, where the priority queue degenerates into a FIFO queue.

The fast marching method can be viewed as a continuous version of Dijkstra's algorithm which computes the geodesic distance on a triangle mesh.


### Dynamic programming perspective

From a dynamic programming point of view, Dijkstra's algorithm is a successive approximation scheme that solves the dynamic programming functional equation for the shortest path problem by the Reaching method.

In fact, Dijkstra's explanation of the logic behind the algorithm:

is a paraphrasing of Bellman's principle of optimality in the context of the shortest path problem.


## See also


- A* search algorithm
- Bellman–Ford algorithm
- Euclidean shortest path
- Floyd–Warshall algorithm
- Johnson's algorithm
- Longest path problem
- Parallel all-pairs shortest path algorithm


## External links


- Oral history interview with Edsger W. Dijkstra, Charles Babbage Institute, University of Minnesota, Minneapolis
- Implementation of Dijkstra's algorithm using TDD, Robert Cecil Martin, The Clean Code Blog
