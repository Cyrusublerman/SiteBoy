# 3-opt

In optimization, 3-opt is a simple local search heuristic for finding approximate solutions to the travelling salesperson problem and related network optimization problems. Compared to the simpler 2-opt algorithm, it is slower but can generate higher-quality solutions.

3-opt analysis involves deleting three edges from the current solution to the problem, creating three sub-tours. There are eight ways of connecting these sub-tours back into a single tour, one of which consists of the three deleted edges. These reconnections are analysed to find the optimum one. This process is then repeated for a different set of 3 connections, until all possible combinations have been tried in a network. A single pass through all triples of edges has a time complexity of $O(n^{3})$. Iterated 3-opt, in which passes are repeated until no more improvements can be found, has a higher time complexity.

In an array representation of a tour with $k$ nodes $S=[n_{0},n_{1},n_{2},...,n_{k-1},n_{k}]$, where $n_{0}=n_{k}$, deleting three edges separates $S$ into four segments $S_{1}$, $S_{2}$, $S_{3}$ and $S_{4}$. Note that the segments $S_{1}$ and $S_{4}$ are connected. The reconnection of the Subtours is done by a combination of reversing one or both of $S_{2}$ and $S_{3}$ and switching their respective positions. The 8 possible new tours are $[S_{1},S_{2},S_{3},S_{4}]$, $[S_{1},{\overleftrightarrow {S_{2}}},S_{3},S_{4}]$, $[S_{1},S_{2},{\overleftrightarrow {S_{3}}},S_{4}]$,
$$[S_{1},{\overleftrightarrow {S_{2}}},{\overleftrightarrow {S_{3}}},S_{4}]
$$, $[S_{1},S_{3},S_{2},S_{4}]$, $[S_{1},{\overleftrightarrow {S_{3}}},S_{2},S_{4}]$, $[S_{1},S_{3},{\overleftrightarrow {S_{2}}},S_{4}]$ and
$$[S_{1},{\overleftrightarrow {S_{3}}},{\overleftrightarrow {S_{2}}},S_{4}]
$$. Here ${\overleftrightarrow {S_{i}}}$ indicates that segment $i$ is reversed.


## See also


- 2-opt
- Local search
- Lin–Kernighan heuristic


## Further reading


- BOCK, F. (1958). "An algorithm for solving traveling-salesman and related network optimization problems". Operations Research. 6 (6).
- Lin, Shen (1965). "Computer Solutions of the Traveling Salesman Problem". Bell System Technical Journal. 44 (10). Institute of Electrical and Electronics Engineers (IEEE): 2245–2269. doi:10.1002/j.1538-7305.1965.tb04146.x. ISSN 0005-8580.
- Lin, S.; Kernighan, B. W. (1973). "An Effective Heuristic Algorithm for the Traveling-Salesman Problem". Operations Research. 21 (2). Institute for Operations Research and the Management Sciences (INFORMS): 498–516. doi:10.1287/opre.21.2.498. ISSN 0030-364X.
- Sipser, Michael (2006). Introduction to the theory of computation. Boston: Thomson Course Technology. ISBN 0-534-95097-3. OCLC 58544333.
