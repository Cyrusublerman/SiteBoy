# 2-opt

In optimization, 2-opt is a simple local search algorithm for solving the traveling salesman problem. The 2-opt algorithm was first proposed by Croes in 1958, although the basic move had already been suggested by Flood. The main idea behind it is to take a route that crosses over itself and reorder it so that it does not. A complete 2-opt local search will compare every possible valid combination of the swapping mechanism. This technique can be applied to the traveling salesman problem as well as many related problems. These include the vehicle routing problem (VRP) as well as the capacitated VRP, which require minor modification of the algorithm.


## Pseudocode

Visually, one swap looks like:

In pseudocode, the mechanism by which the 2-opt swap manipulates a given route is as follows. Here v1 and v2 are the first vertices of the edges that are to be swapped when traversing through the route:

Here is an example of the above with arbitrary input:


- Example route: A → B → E → D → C → F → G → H → A
- Example parameters: v1=1, v2=4 (assuming starting index is 0)
- Contents of new_route by step: (A → B) A → B → (C → D → E) A → B → C → D → E → (F → G → H → A)

This is the complete 2-opt swap making use of the above mechanism:

The particular nodes or depots that are at the start and at the end of the path should be removed from the search as an eligible candidates for swapping, as reversing the order would cause an invalid path.

For example, with depot at A:

Swapping using node[0] and node[2] would yield

which is not valid (does not leave from A, the depot).


## Efficient implementation

Building the new route and calculating the distance of the new route can be a very expensive operation, usually $O(n)$ where n is the number of vertices in the route. In a symmetric case (where the distance between A and B is the same as between B and A), this can be skipped by performing a $O(1)$ operation. Since a 2-opt operation involves removing 2 edges and adding 2 different edges we can subtract and add the distances of only those edges.

If lengthDelta is negative that would mean that the new distance after the swap would be smaller. Once it is known that lengthDelta is negative, then we perform a 2-opt swap. This saves us a lot of computation.


### C++ code


### Output


### Visualization


## See also


- 3-opt
- local search (optimization)
- Lin–Kernighan heuristic


## External links


- The Traveling Salesman Problem: A Case Study in Local Optimization
- Improving Solutions: 2-opt Exchanges
