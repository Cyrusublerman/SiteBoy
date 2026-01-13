# Breadth-first search

Breadth-first search (BFS) is an algorithm for searching a tree data structure for a node that satisfies a given property. It starts at the tree root and explores all nodes at the present depth prior to moving on to the nodes at the next depth level. Extra memory, usually a queue, is needed to keep track of the child nodes that were encountered but not yet explored.

For example, in a chess endgame, a chess engine may build the game tree from the current position by applying all possible moves and use breadth-first search to find a winning position for White. Implicit trees (such as game trees or other problem-solving trees) may be of infinite size; breadth-first search is guaranteed to find a solution node if one exists.

In contrast, (plain) depth-first search (DFS), which explores the node branch as far as possible before backtracking and expanding other nodes, may get lost in an infinite branch and never make it to the solution node. Iterative deepening depth-first search avoids the latter drawback at the price of exploring the tree's top parts over and over again. On the other hand, both depth-first algorithms typically require far less extra memory than breadth-first search.

Breadth-first search can be generalized to both undirected graphs and directed graphs with a given start node (sometimes referred to as a 'search key'). In state space search in artificial intelligence, repeated searches of vertices are often allowed, while in theoretical analysis of algorithms based on breadth-first search, precautions are typically taken to prevent repetitions.

BFS and its application in finding connected components of graphs were invented in 1945 by Konrad Zuse, in his (rejected) Ph.D. thesis on the Plankalkül programming language, but this was not published until 1972. It was reinvented in 1959 by Edward F. Moore, who used it to find the shortest path out of a maze, and later developed by C. Y. Lee into a wire routing algorithm (published in 1961).


## Pseudocode

Input: A graph G and a starting vertex root of G

Output: Goal state. The parent links trace the shortest path back to root


### More details

This non-recursive implementation is similar to the non-recursive implementation of depth-first search, but differs from it in two ways:


1. it uses a queue (First In First Out) instead of a stack (Last In First Out) and
2. it checks whether a vertex has been explored before enqueueing the vertex rather than delaying this check until the vertex is dequeued from the queue.

If G is a tree, replacing the queue of this breadth-first search algorithm with a stack will yield a depth-first search algorithm. For general graphs, replacing the stack of the iterative depth-first search implementation with a queue would also produce a breadth-first search algorithm, although a somewhat nonstandard one.

The Q queue contains the frontier along which the algorithm is currently searching.

Nodes can be labelled as explored by storing them in a set, or by an attribute on each node, depending on the implementation.

Note that the word node is usually interchangeable with the word vertex.

The parent attribute of each node is useful for accessing the nodes in a shortest path, for example by backtracking from the destination node up to the starting node, once the BFS has been run, and the predecessors nodes have been set.

Breadth-first search produces a breadth-first tree which is shown in the example below.


### Example

The lower diagram shows the breadth-first tree obtained by running a BFS on an example graph of German cities (upper diagram) starting from Frankfurt.


## Analysis


### Time and space complexity

The time complexity can be expressed as $O(|V|+|E|)$, as every vertex and every edge will be explored in the worst case. $|V|$ is the number of vertices and $|E|$ is the number of edges in the graph. Note that $O(|E|)$ may vary between $O(1)$ and $O(|V|^{2})$, depending on how sparse the input graph is.

When the number of vertices in the graph is known ahead of time, and additional data structures are used to determine which vertices have already been added to the queue, the space complexity can be expressed as $O(|V|)$, where $|V|$ is the number of vertices. This is in addition to the space required for the graph itself, which may vary depending on the graph representation used by an implementation of the algorithm.

When working with graphs that are too large to store explicitly (or infinite), it is more practical to describe the complexity of breadth-first search in different terms: to find the nodes that are at distance d from the start node (measured in number of edge traversals), BFS takes O(b) time and memory, where b is the "branching factor" of the graph (the average out-degree).


### Completeness

In the analysis of algorithms, the input to breadth-first search is assumed to be a finite graph, represented as an adjacency list, adjacency matrix, or similar representation. However, in the application of graph traversal methods in artificial intelligence the input may be an implicit representation of an infinite graph. In this context, a search method is described as being complete if it is guaranteed to find a goal state if one exists. Breadth-first search is complete, but depth-first search is not. When applied to infinite graphs represented implicitly, breadth-first search will eventually find the goal state, but depth first search may get lost in parts of the graph that have no goal state and never return.


## BFS ordering

An enumeration of the vertices of a graph is said to be a BFS ordering if it is a possible output of the application of BFS to this graph.

Let $G=(V,E)$ be a graph with $n$ vertices. Recall that $N(v)$ is the set of neighbors of $v$. Let $\sigma =(v_{1},\dots ,v_{m})$ be a list of distinct elements of $V$, for $v\in V\setminus \{v_{1},\dots ,v_{m}\}$, let $\nu _{\sigma }(v)$ be the least $i$ such that $v_{i}$ is a neighbor of $v$, if such a $i$ exists, and be $\infty$ otherwise.

Let $\sigma =(v_{1},\dots ,v_{n})$ be an enumeration of the vertices of $V$. The enumeration $\sigma$ is said to be a BFS ordering (with source $v_{1}$) if, for all $1<i\leq n$, $v_{i}$ is the vertex $w\in V\setminus \{v_{1},\dots ,v_{i-1}\}$ such that $\nu _{(v_{1},\dots ,v_{i-1})}(w)$ is minimal. Equivalently, $\sigma$ is a BFS ordering if, for all $1\leq i<j<k\leq n$ with $v_{i}\in N(v_{k})\setminus N(v_{j})$, there exists a neighbor $v_{m}$ of $v_{j}$ such that $m<i$.


## Applications

Breadth-first search can be used to solve many problems in graph theory, for example:


- Copying garbage collection, Cheney's algorithm
- Finding the shortest path between two nodes u and v, with path length measured by number of edges (an advantage over depth-first search)
- (Reverse) Cuthill–McKee mesh numbering
- Ford–Fulkerson method for computing the maximum flow in a flow network
- Serialization/Deserialization of a binary tree vs serialization in sorted order, allows the tree to be re-constructed in an efficient manner.
- Construction of the failure function of the Aho-Corasick pattern matcher.
- Testing bipartiteness of a graph.
- Implementing parallel algorithms for computing a graph's transitive closure.


## See also


- Depth-first search – Algorithm to search the nodes of a graph
- Dijkstra's algorithm – Algorithm for finding shortest paths
- Iterative deepening depth-first search – Search strategy
- Level structure – Object in graph theory
- Lexicographic breadth-first search – Partition-based graph traversal method
- Parallel breadth-first search – Parallel version of breadth-first search algorithm


## External links


- Open Data Structures - Section 12.3.1 - Breadth-First Search, Pat Morin
