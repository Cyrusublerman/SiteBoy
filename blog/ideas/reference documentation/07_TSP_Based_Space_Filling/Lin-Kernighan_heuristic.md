# Lin–Kernighan heuristic

In combinatorial optimization, Lin–Kernighan is one of the best heuristics for solving the symmetric travelling salesman problem. It belongs to the class of local search algorithms, which take a tour (Hamiltonian cycle) as part of the input and attempt to improve it by searching in the neighbourhood of the given tour for one that is shorter, and upon finding one repeats the process from that new one, until encountering a local minimum. As in the case of the related 2-opt and 3-opt algorithms, the relevant measure of "distance" between two tours is the number of edges which are in one but not the other; new tours are built by reassembling pieces of the old tour in a different order, sometimes changing the direction in which a sub-tour is traversed. Lin–Kernighan is adaptive and has no fixed number of edges to replace at a step, but favours small numbers such as 2 or 3.


## Derivation

For a given instance $(G,c)$ of the travelling salesman problem, tours are uniquely determined by their sets of edges, so we may as well encode them as such. In the main loop of the local search, we have a current tour $T\subset \mathrm {E} (G)$ and are looking for new tour $T'\subset \mathrm {E} (G)$ such that the symmetric difference $F=T\mathbin {\triangle } T'$ is not too large and the length
$$\sum _{e\in T'}c(e)
$$of the new tour is less than the length
$$\sum _{e\in T}c(e)
$$of the current tour. Since $F$ is typically much smaller than $T$ and $T'$, it is convenient to consider the quantity


$$g(F)=\sum _{e\in F\cap T}c(e)-\sum _{e\in F\setminus T}c(e)\quad
$$— the gain of using $F\subseteq \mathrm {E} (G)$ when switching from $T$ —

since
$$g(T\mathbin {\triangle } T')=\sum _{e\in T}c(e)-\sum _{e\in T'}c(e)
$$: how much longer the current tour $T$ is than the new tour $T'$. Naively $k$-opt can be regarded as examining all $F\subseteq \mathrm {E} (G)$ with exactly $2k$ elements ($k$ in $T$ but not in $T'$, and another $k$ in $T'$ but not in $T$) such that $T\mathbin {\triangle } F$ is again a tour, looking for such a set which has $g(F)>0$. It is however easier to do those tests in the opposite order: first search for plausible $F$ with positive gain, and only second check if $T\mathbin {\triangle } F$ is in fact a tour.

Define a trail in $G$ to be alternating (with respect to $T$) if its edges are alternatingly in $T$ and not in $T$, respectively. Because the subgraphs ${\bigl (}\mathrm {V} (G),T{\bigr )}$ and ${\bigl (}\mathrm {V} (G),T'{\bigr )}$ are $2$-regular, the subgraph
$$G[T\mathbin {\triangle } T']={\bigl (}\mathrm {V} (G),T\mathbin {\triangle } T'{\bigr )}
$$will have vertices of degree $0$, $2$, and $4$ only, and at each vertex there are as many incident edges from $T$ as there are from $T'$. Hence (essentially by Hierholzer's algorithm for finding Eulerian circuits) the graph $G[T\mathbin {\triangle } T']$ decomposes into closed alternating trails. Sets $F\subseteq \mathrm {E} (G)$ that may satisfy $F=T\mathbin {\triangle } T'$ for some tour $T'$ may thus be found by enumerating closed alternating trails in $G$, even if not every closed alternating trail $F$ makes $T\mathbin {\triangle } F$ into a tour; it could alternatively turn out to be a disconnected $2$-regular subgraph.


### Key idea

Alternating trails (closed or open) are built by extending a shorter alternating trail, so when exploring the neighbourhood of the current tour $T$, one is exploring a search tree of alternating trails. The key idea of the Lin–Kernighan algorithm is to remove from this tree all alternating trails which have gain $\leq 0$. This does not prevent finding every closed trail with positive gain, thanks to the following lemma.

Lemma. If $a_{0},\dotsc ,a_{n-1}$ are numbers such that
$$\sum _{i=0}^{n-1}a_{i}>0
$$, then there is a cyclic permutation of these numbers such that all partial sums are positive as well, i.e., there is some $k$ such that


$$\sum _{i=0}^{r}a_{(k+i){\bmod {n}}}>0
$$for all $r=0,1,\dotsc ,n-1$.

For a closed alternating trail $F=e_{0}\,e_{1}\,\dots \,e_{n-1}$, one may define $a_{i}=c(e_{i})$ if $e_{i}\in T$ and $a_{i}=-c(e_{i})$ if $e_{i}\notin T$; the sum
$$\sum \nolimits _{i=0}^{n-1}a_{i}
$$is then the gain $g(F)$. Here the lemma implies that there for every closed alternating trail with positive gain exists at least one starting vertex $v_{0}$ for which all the gains of the partial trails are positive as well, so $F$ will be found when the search explores the branch of alternating trails starting at $v_{0}$. (Prior to that the search may have considered other subtrails of $F$ starting at other vertices but backed out because some subtrail failed the positive gain constraint.) Reducing the number of branches to explore translates directly to a reduction in runtime, and the sooner a branch can be pruned, the better.

This yields the following algorithm for finding all closed, positive gain alternating trails in the graph.

State: a stack of triples $(u,i,g)$, where $u\in \mathrm {V} (G)$ is a vertex, $i\geq 0$ is the current number of edges in the trail, and $g$ is the current trail gain.


1. For all $u\in \mathrm {V} (G)$, push $(u,0,0)$ onto the stack.
2. While the stack is nonempty: Pop ( u , i , g ) {\displaystyle (u,i,g)} off the stack and let v i := u {\displaystyle v_{i}:=u} . The current alternating trail is now F = { v 0 v 1 , v 1 v 2 , … , v i − 1 v i } {\displaystyle F=\{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i}\}} . If i {\displaystyle i} is even then: For each u ∈ V ( G ) {\displaystyle u\in \mathrm {V} (G)} such that v i u ∈ T ∖ { v 0 v 1 , v 1 v 2 , … , v i − 1 v i } {\displaystyle v_{i}u\in T\setminus \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i}\}} (there are at most two of these), push ( u , i + 1 , g + c ( v i u ) ) {\displaystyle {\bigl (}u,i+1,g+c(v_{i}u){\bigr )}} onto the stack. If instead i {\displaystyle i} is odd then: If g > c ( v i v 0 ) {\displaystyle g>c(v_{i}v_{0})} then report { v 0 v 1 , v 1 v 2 , … , v i − 1 v i , v i v 0 } {\displaystyle \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i},v_{i}v_{0}\}} as a closed alternating trail with gain g − c ( v i v 0 ) > 0 {\displaystyle g-c(v_{i}v_{0})>0} . For each u ∈ V ( G ) {\displaystyle u\in \mathrm {V} (G)} such that g > c ( v i u ) {\displaystyle g>c(v_{i}u)} and v i u ∉ T ∪ { v 0 v 1 , v 1 v 2 , … , v i − 1 v i } {\displaystyle v_{i}u\notin T\cup \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i}\}} (there may be O ( n ) {\displaystyle O(n)} of these, or there could be none), push ( u , i + 1 , g − c ( v i u ) ) {\displaystyle {\bigl (}u,i+1,g-c(v_{i}u){\bigr )}} onto the stack.
3. Stop

As an enumeration algorithm this is slightly flawed, because it may report the same trail multiple times, with different starting points, but Lin–Kernighan does not care because it mostly aborts the enumeration after finding the first hit. It should however be remarked that:


- Lin–Kernighan is not satisfied with just having found a closed alternating trail $F$ of positive gain, it additionally requires that $T\mathbin {\triangle } F$ is a tour.
- Lin–Kernighan also restricts the search in various ways, most obviously regarding the search depth (but not only in that way). The above unrestricted search still terminates because at $i=2n$ there is no longer any unpicked edge remaining in $T$, but that is far beyond what is practical to explore.
- In most iterations one wishes to quickly find a better tour $T'$, so rather than actually listing all siblings in the search tree before exploring the first of them, one may wish to generate these siblings lazily.


### Basic Lin–Kernighan algorithm

The basic form of the Lin–Kernighan algorithm not only does a local search counterpart of the above enumeration, but it also introduces two parameters that narrow the search.


- The backtracking depth $p_{1}$ is an upper bound on the length of the alternating trail after backtracking; beyond this depth, the algorithm explores at most one way of extending the alternating trail. Standard value is that $p_{1}=5$.
- The infeasibility depth $p_{2}$ is an alternating path length beyond which it begins to be required that closing the current trail (regardless of the gain of doing so) yields an exchange to a new tour. Standard value is that $p_{2}=2$.

Because there are $O(n^{\lfloor p_{1}/2\rfloor })$ alternating trails of length $p_{1}$, and the final round of the algorithm may have to check all of them before concluding that the current tour is locally optimal, we get $\lfloor p_{1}/2\rfloor$ (standard value $2$) as a lower bound on the exponent of the algorithm complexity. Lin & Kernighan report $2.2$ as an empirical exponent of $n$ in the average overall running time for their algorithm, but other implementors have had trouble reproducing that result. It appears unlikely that the worst-case running time is polynomial.

In terms of a stack as above, the algorithm is:

Input: an instance $(G,c)$ of the travelling salesman problem, and a tour $T\subset \mathrm {E} (G)$

Output: a locally optimal tour

Variables: a stack of triples ( u , i , g ) {\displaystyle (u,i,g)} , where u ∈ V ( G ) {\displaystyle u\in \mathrm {V} (G)} is a vertex, i ≥ 0 {\displaystyle i\geq 0} is the current number of edges in the trail, and g {\displaystyle g} is the current trail gain, the sequence v 0 , v 1 , … {\displaystyle v_{0},v_{1},\dotsc } of vertices in the current alternating trail, the best set F {\displaystyle F} of exchange edges found for current tour, and its corresponding gain g ∗ {\displaystyle g^{*}} .

a stack of triples $(u,i,g)$, where $u\in \mathrm {V} (G)$ is a vertex, $i\geq 0$ is the current number of edges in the trail, and $g$ is the current trail gain,

the sequence $v_{0},v_{1},\dotsc$ of vertices in the current alternating trail,

the best set $F$ of exchange edges found for current tour, and its corresponding gain $g^{*}$.

Initialise the stack to being empty.

Repeat Set g ∗ := 0 {\displaystyle g^{*}:=0} and F := ∅ {\displaystyle F:=\varnothing } . For all u ∈ V ( G ) {\displaystyle u\in \mathrm {V} (G)} , push ( u , 0 , 0 ) {\displaystyle (u,0,0)} onto the stack. While the stack is nonempty: Pop ( u , i , g ) {\displaystyle (u,i,g)} off the stack and let v i := u {\displaystyle v_{i}:=u} . If i {\displaystyle i} is even then for each u ∈ V ( G ) {\displaystyle u\in \mathrm {V} (G)} such that v i u ∈ T ∖ { v 0 v 1 , v 1 v 2 , … , v i − 1 v i } {\displaystyle v_{i}u\in T\setminus \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i}\}} , push ( u , i + 1 , g + c ( v i u ) ) {\displaystyle {\bigl (}u,i+1,g+c(v_{i}u){\bigr )}} onto the stack if: i ≤ p 2 {\displaystyle i\leq p_{2}} , or u v 0 ∉ T ∪ { v 0 v 1 , v 1 v 2 , … , v i − 1 v i , v i u } {\displaystyle uv_{0}\notin T\cup \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i},v_{i}u\}} and T △ { v 0 v 1 , v 1 v 2 , … , v i − 1 v i , v i u , u v 0 } {\displaystyle T\mathbin {\triangle } \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i},v_{i}u,uv_{0}\}} is a tour (Hamiltonicity check) else ( i {\displaystyle i} is odd): If g > c ( v i v 0 ) {\displaystyle g>c(v_{i}v_{0})} , g − c ( v i v 0 ) > g ∗ {\displaystyle g-c(v_{i}v_{0})>g^{*}} , and T △ { v 0 v 1 , v 1 v 2 , … , v i − 1 v i , v i v 0 } {\displaystyle T\mathbin {\triangle } \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i},v_{i}v_{0}\}} is a tour (Hamiltonicity check) then let F := { v 0 v 1 , v 1 v 2 , … , v i − 1 v i , v i v 0 } {\displaystyle F:=\{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i},v_{i}v_{0}\}} and g ∗ := g − c ( v i v 0 ) {\displaystyle g^{*}:=g-c(v_{i}v_{0})} . For each u ∈ V ( G ) {\displaystyle u\in \mathrm {V} (G)} such that g > c ( v i u ) {\displaystyle g>c(v_{i}u)} and v i u ∉ T ∪ { v 0 v 1 , v 1 v 2 , … , v i − 1 v i } {\displaystyle v_{i}u\notin T\cup \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i}\}} , push ( u , i + 1 , g − c ( v i u ) ) {\displaystyle {\bigl (}u,i+1,g-c(v_{i}u){\bigr )}} onto the stack. End if. Let ( u , j , g ) {\displaystyle (u,j,g)} be the top element on the stack (peek, not pop). If i ≤ j {\displaystyle i\leq j} then if g ∗ > 0 {\displaystyle g^{*}>0} then set T := T △ F {\displaystyle T:=T\mathbin {\triangle } F} (update current tour) and clear the stack. else if i > p 1 {\displaystyle i>p_{1}} then pop all elements ( u , j , g ) {\displaystyle (u,j,g)} off the stack that have j > p 1 {\displaystyle j>p_{1}} end if end if end while

Set $g^{*}:=0$ and $F:=\varnothing$.

For all $u\in \mathrm {V} (G)$, push $(u,0,0)$ onto the stack.

While the stack is nonempty: Pop ( u , i , g ) {\displaystyle (u,i,g)} off the stack and let v i := u {\displaystyle v_{i}:=u} . If i {\displaystyle i} is even then for each u ∈ V ( G ) {\displaystyle u\in \mathrm {V} (G)} such that v i u ∈ T ∖ { v 0 v 1 , v 1 v 2 , … , v i − 1 v i } {\displaystyle v_{i}u\in T\setminus \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i}\}} , push ( u , i + 1 , g + c ( v i u ) ) {\displaystyle {\bigl (}u,i+1,g+c(v_{i}u){\bigr )}} onto the stack if: i ≤ p 2 {\displaystyle i\leq p_{2}} , or u v 0 ∉ T ∪ { v 0 v 1 , v 1 v 2 , … , v i − 1 v i , v i u } {\displaystyle uv_{0}\notin T\cup \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i},v_{i}u\}} and T △ { v 0 v 1 , v 1 v 2 , … , v i − 1 v i , v i u , u v 0 } {\displaystyle T\mathbin {\triangle } \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i},v_{i}u,uv_{0}\}} is a tour (Hamiltonicity check) else ( i {\displaystyle i} is odd): If g > c ( v i v 0 ) {\displaystyle g>c(v_{i}v_{0})} , g − c ( v i v 0 ) > g ∗ {\displaystyle g-c(v_{i}v_{0})>g^{*}} , and T △ { v 0 v 1 , v 1 v 2 , … , v i − 1 v i , v i v 0 } {\displaystyle T\mathbin {\triangle } \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i},v_{i}v_{0}\}} is a tour (Hamiltonicity check) then let F := { v 0 v 1 , v 1 v 2 , … , v i − 1 v i , v i v 0 } {\displaystyle F:=\{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i},v_{i}v_{0}\}} and g ∗ := g − c ( v i v 0 ) {\displaystyle g^{*}:=g-c(v_{i}v_{0})} . For each u ∈ V ( G ) {\displaystyle u\in \mathrm {V} (G)} such that g > c ( v i u ) {\displaystyle g>c(v_{i}u)} and v i u ∉ T ∪ { v 0 v 1 , v 1 v 2 , … , v i − 1 v i } {\displaystyle v_{i}u\notin T\cup \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i}\}} , push ( u , i + 1 , g − c ( v i u ) ) {\displaystyle {\bigl (}u,i+1,g-c(v_{i}u){\bigr )}} onto the stack. End if. Let ( u , j , g ) {\displaystyle (u,j,g)} be the top element on the stack (peek, not pop). If i ≤ j {\displaystyle i\leq j} then if g ∗ > 0 {\displaystyle g^{*}>0} then set T := T △ F {\displaystyle T:=T\mathbin {\triangle } F} (update current tour) and clear the stack. else if i > p 1 {\displaystyle i>p_{1}} then pop all elements ( u , j , g ) {\displaystyle (u,j,g)} off the stack that have j > p 1 {\displaystyle j>p_{1}} end if end if

Pop $(u,i,g)$ off the stack and let $v_{i}:=u$.

If $i$ is even then for each u ∈ V ( G ) {\displaystyle u\in \mathrm {V} (G)} such that v i u ∈ T ∖ { v 0 v 1 , v 1 v 2 , … , v i − 1 v i } {\displaystyle v_{i}u\in T\setminus \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i}\}} , push ( u , i + 1 , g + c ( v i u ) ) {\displaystyle {\bigl (}u,i+1,g+c(v_{i}u){\bigr )}} onto the stack if: i ≤ p 2 {\displaystyle i\leq p_{2}} , or u v 0 ∉ T ∪ { v 0 v 1 , v 1 v 2 , … , v i − 1 v i , v i u } {\displaystyle uv_{0}\notin T\cup \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i},v_{i}u\}} and T △ { v 0 v 1 , v 1 v 2 , … , v i − 1 v i , v i u , u v 0 } {\displaystyle T\mathbin {\triangle } \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i},v_{i}u,uv_{0}\}} is a tour (Hamiltonicity check)

for each $u\in \mathrm {V} (G)$ such that
$$v_{i}u\in T\setminus \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i}\}
$$, push ( u , i + 1 , g + c ( v i u ) ) {\displaystyle {\bigl (}u,i+1,g+c(v_{i}u){\bigr )}} onto the stack if: i ≤ p 2 {\displaystyle i\leq p_{2}} , or u v 0 ∉ T ∪ { v 0 v 1 , v 1 v 2 , … , v i − 1 v i , v i u } {\displaystyle uv_{0}\notin T\cup \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i},v_{i}u\}} and T △ { v 0 v 1 , v 1 v 2 , … , v i − 1 v i , v i u , u v 0 } {\displaystyle T\mathbin {\triangle } \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i},v_{i}u,uv_{0}\}} is a tour (Hamiltonicity check)

push ${\bigl (}u,i+1,g+c(v_{i}u){\bigr )}$ onto the stack if: $i\leq p_{2}$, or
$$uv_{0}\notin T\cup \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i},v_{i}u\}
$$and
$$T\mathbin {\triangle } \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i},v_{i}u,uv_{0}\}
$$is a tour (Hamiltonicity check)

else ($i$ is odd): If g > c ( v i v 0 ) {\displaystyle g>c(v_{i}v_{0})} , g − c ( v i v 0 ) > g ∗ {\displaystyle g-c(v_{i}v_{0})>g^{*}} , and T △ { v 0 v 1 , v 1 v 2 , … , v i − 1 v i , v i v 0 } {\displaystyle T\mathbin {\triangle } \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i},v_{i}v_{0}\}} is a tour (Hamiltonicity check) then let F := { v 0 v 1 , v 1 v 2 , … , v i − 1 v i , v i v 0 } {\displaystyle F:=\{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i},v_{i}v_{0}\}} and g ∗ := g − c ( v i v 0 ) {\displaystyle g^{*}:=g-c(v_{i}v_{0})} . For each u ∈ V ( G ) {\displaystyle u\in \mathrm {V} (G)} such that g > c ( v i u ) {\displaystyle g>c(v_{i}u)} and v i u ∉ T ∪ { v 0 v 1 , v 1 v 2 , … , v i − 1 v i } {\displaystyle v_{i}u\notin T\cup \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i}\}} , push ( u , i + 1 , g − c ( v i u ) ) {\displaystyle {\bigl (}u,i+1,g-c(v_{i}u){\bigr )}} onto the stack.

If $g>c(v_{i}v_{0})$, $g-c(v_{i}v_{0})>g^{*}$, and
$$T\mathbin {\triangle } \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i},v_{i}v_{0}\}
$$is a tour (Hamiltonicity check) then let
$$F:=\{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i},v_{i}v_{0}\}
$$and $g^{*}:=g-c(v_{i}v_{0})$.

For each $u\in \mathrm {V} (G)$ such that $g>c(v_{i}u)$ and
$$v_{i}u\notin T\cup \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{i-1}v_{i}\}
$$, push ${\bigl (}u,i+1,g-c(v_{i}u){\bigr )}$ onto the stack.

End if.

Let $(u,j,g)$ be the top element on the stack (peek, not pop). If $i\leq j$ then if g ∗ > 0 {\displaystyle g^{*}>0} then set T := T △ F {\displaystyle T:=T\mathbin {\triangle } F} (update current tour) and clear the stack. else if i > p 1 {\displaystyle i>p_{1}} then pop all elements ( u , j , g ) {\displaystyle (u,j,g)} off the stack that have j > p 1 {\displaystyle j>p_{1}} end if

if $g^{*}>0$ then set T := T △ F {\displaystyle T:=T\mathbin {\triangle } F} (update current tour) and clear the stack.

set $T:=T\mathbin {\triangle } F$ (update current tour) and clear the stack.

else if $i>p_{1}$ then pop all elements ( u , j , g ) {\displaystyle (u,j,g)} off the stack that have j > p 1 {\displaystyle j>p_{1}}

pop all elements $(u,j,g)$ off the stack that have $j>p_{1}$

end if

end if

end while

until $g^{*}=0$.

Return $T$

The length of the alternating trails considered are thus not explicitly bounded, but beyond the backtracking depth $p_{1}$ no more than one way of extending the current trail is considered, which in principle stops those explorations from raising the exponent in the runtime complexity.


### Limitations

The closed alternating trails found by the above method are all connected, but the symmetric difference $T\mathbin {\triangle } T'$ of two tours need not be, so in general this method of alternating trails cannot explore the full neighbourhood of a trail $T$. The literature on the Lin–Kernighan heuristic uses the term sequential exchanges for those that are described by a single alternating trail. The smallest non-sequential exchange would however replace 4 edges and consist of two cycles of 4 edges each (2 edges added, 2 removed), so it is long compared to the typical Lin–Kernighan exchange, and there are few of these compared to the full set of 4-edge exchanges.

In at least one implementation by Lin & Kernighan there was an extra final step considering such non-sequential exchanges of 4 edges before declaring a tour locally optimal, which would mean the tours produced are 4-opt unless one introduces further constraints on the search (which Lin and Kernighan in fact did). The literature is vague on exactly what is included in the Lin–Kernighan heuristic proper, and what constitutes further refinements.

For the asymmetric TSP, the idea of using positive gain alternating trails to find favourable exchanges is less useful, because there are fewer ways in which pieces of a tour can be rearranged to yield new tours when one may not reverse the orientation of a piece. Two pieces can only be patched together to reproduce the original tour. Three pieces can be patched together to form a different tour in one way only, and the corresponding alternating trail does not extend to a closed trail for rearranging four pieces into a new tour. To rearrange four pieces, one needs a non-sequential exchange.


## Checking Hamiltonicity

The Lin–Kernighan heuristic checks the validity of tour candidates $T\mathbin {\triangle } F$ at two points: obviously when deciding whether a better tour has been found, but also as a constraint to descending in the search tree, as controlled via the infeasibility depth $p_{2}$. Concretely, at larger depths in the search a vertex $v_{2k+1}$ is only appended to the alternating trail if
$$T\mathbin {\triangle } \{v_{0}v_{1},v_{1}v_{2},\dotsc ,v_{2k}v_{2k+1},v_{2k+1}v_{0}\}
$$is a tour. By design that set of edges constitutes a 2-factor in $G$, so what needs to be determined is whether that 2-factor consists of a single Hamiltonian cycle, or instead is made up of several cycles.

If naively posing this subproblem as giving a subroutine the set of $n$ edges as input, one ends up with $O(n)$ as the time complexity for this check, since it is necessary to walk around the full tour before being able to determine that it is in fact a Hamiltonian cycle. That is too slow for the second usage of this test, which gets carried out for every alternating trail with more than $2$ edges from $T$. If keeping track of more information, the test can instead be carried out in constant time.

A useful degree of freedom here is that one may choose the order in which step 2.3.2 iterates over all vertices; in particular, one may follow the known tour $T$. After picking $k$ edges from $T$, the remaining subgraph
$${\bigl (}\mathrm {V} (G),T\setminus \{v_{0}v_{1},\dotsc ,v_{2k-2}v_{2k-1}\}{\bigr )}
$$consists of $k$ paths. The outcome of the Hamiltonicity test done when considering the $(k+1)$th edge $v_{2k}v_{2k+1}$ depends only on in which of these paths that $v_{2k}$ resides and whether $v_{2k+1}$ is before or after $v_{2k}$. Hence it would be sufficient to examine $2k$ different cases as part of performing step 2.3.2 for $v_{2k-1}$; as far as $v_{2k+1}$ is concerned, the outcome of this test can be inherited information rather than something that has to be computed fresh.


## External links


- LKH implementation
- Concorde TSP implementation
- LK Heuristic in Python
