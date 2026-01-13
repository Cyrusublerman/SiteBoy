# Linear programming

Linear programming (LP), also called linear optimization, is a method to achieve the best outcome (such as maximum profit or lowest cost) in a mathematical model whose requirements and objective are represented by linear relationships. Linear programming is a special case of mathematical programming (also known as mathematical optimization).

More formally, linear programming is a technique for the optimization of a linear objective function, subject to linear equality and linear inequality constraints. Its feasible region is a convex polytope, which is a set defined as the intersection of finitely many half spaces, each of which is defined by a linear inequality ; alternatively, a convex polytope is the [[Minkowski sum]] of a [[convex polytope]] and a convex [[polyhedral cone]] . Its objective function is a real-valued affine (linear) function defined on this polytope. A linear programming algorithm finds a point in the polytope where this function has the largest (or smallest) value if such a point exists.

Linear programs are problems that can be expressed in standard form as:


$${\begin{aligned}&{\text{Find a vector}}&&\mathbf {x} \\&{\text{that maximizes}}&&\mathbf {c} ^{\mathsf {T}}\mathbf {x} \\&{\text{subject to}}&&A\mathbf {x} \leq \mathbf {b} \\&{\text{and}}&&\mathbf {x} \geq \mathbf {0} .\end{aligned}}
$$

Here the components of $\mathbf {x}$ are the variables to be determined, $\mathbf {c}$ and $\mathbf {b}$ are given vectors, and $A$ is a given matrix. The function whose value is to be maximized (
$$\mathbf {x} \mapsto \mathbf {c} ^{\mathsf {T}}\mathbf {x}
$$in this case) is called the objective function. The constraints $A\mathbf {x} \leq \mathbf {b}$ and $\mathbf {x} \geq \mathbf {0}$ specify a convex polytope over which the objective function is to be optimized.

Linear programming can be applied to various fields of study. It is widely used in mathematics and, to a lesser extent, in business, economics, and some engineering problems. There is a close connection between linear programs, eigenequations, John von Neumann's general equilibrium model, and structural equilibrium models (see dual linear program for details). Industries that use linear programming models include transportation, energy, telecommunications, and manufacturing. It has proven useful in modeling diverse types of problems in planning, routing, scheduling, assignment, and design.


## History

The problem of solving a system of linear inequalities dates back at least as far as Fourier, who in 1827 published a method for solving them, and after whom the method of Fourier–Motzkin elimination is named.

In the late 1930s, Soviet mathematician Leonid Kantorovich and American economist Wassily Leontief independently delved into the practical applications of linear programming. Kantorovich focused on manufacturing schedules, while Leontief explored economic applications. Their groundbreaking work was largely overlooked for decades.

The turning point came during World War II when linear programming emerged as a vital tool. It found extensive use in addressing complex wartime challenges, including transportation logistics, scheduling, and resource allocation. Linear programming proved invaluable in optimizing these processes while considering critical constraints such as costs and resource availability.

Despite its initial obscurity, the wartime successes propelled linear programming into the spotlight. Post-WWII, the method gained widespread recognition and became a cornerstone in various fields, from operations research to economics. The overlooked contributions of Kantorovich and Leontief in the late 1930s eventually became foundational to the broader acceptance and utilization of linear programming in optimizing decision-making processes.

Kantorovich's work was initially neglected in the USSR. About the same time as Kantorovich, the Dutch-American economist T. C. Koopmans formulated classical economic problems as linear programs. Kantorovich and Koopmans later shared the 1975 Nobel Memorial Prize in Economic Sciences. In 1941, Frank Lauren Hitchcock also formulated transportation problems as linear programs and gave a solution very similar to the later simplex method. Hitchcock had died in 1957, and the Nobel Memorial Prize is not awarded posthumously.

From 1946 to 1947 George B. Dantzig independently developed general linear programming formulation to use for planning problems in the US Air Force. In 1947, Dantzig also invented the simplex method that, for the first time efficiently, tackled the linear programming problem in most cases. When Dantzig arranged a meeting with John von Neumann to discuss his simplex method, von Neumann immediately conjectured the theory of duality by realizing that the problem he had been working in game theory was equivalent. Dantzig provided formal proof in an unpublished report "A Theorem on Linear Inequalities" on January 5, 1948. Dantzig's work was made available to public in 1951. In the post-war years, many industries applied it in their daily planning.

Dantzig's original example was to find the best assignment of 70 people to 70 jobs. The computing power required to test all the permutations to select the best assignment is vast; the number of possible configurations exceeds the number of particles in the observable universe. However, it takes only a moment to find the optimum solution by posing the problem as a linear program and applying the simplex algorithm. The theory behind linear programming drastically reduces the number of possible solutions that must be checked.

The linear programming problem was first shown to be solvable in polynomial time by Leonid Khachiyan in 1979, but a larger theoretical and practical breakthrough in the field came in 1984 when Narendra Karmarkar introduced a new interior-point method for solving linear-programming problems.


## Uses

Linear programming is a widely used field of optimization for several reasons. Many practical problems in operations research can be expressed as linear programming problems. Certain special cases of linear programming, such as network flow problems and multicommodity flow problems, are considered important enough to have much research on specialized algorithms. A number of algorithms for other types of optimization problems work by solving linear programming problems as sub-problems. Historically, ideas from linear programming have inspired many of the central concepts of optimization theory, such as duality, decomposition, and the importance of convexity and its generalizations. Likewise, linear programming was heavily used in the early formation of microeconomics, and it is currently utilized in company management, such as planning, production, transportation, and technology. Although the modern management issues are ever-changing, most companies would like to maximize profits and minimize costs with limited resources. Google also uses linear programming to stabilize YouTube videos.


## Standard form

Standard form is the usual and most intuitive form of describing a linear programming problem. It consists of the following three parts:


- A linear (or affine) function to be maximized

e.g. $f(x_{1},x_{2})=c_{1}x_{1}+c_{2}x_{2}$


- Problem constraints of the following form

e.g. a 11 x 1 + a 12 x 2 ≤ b 1 a 21 x 1 + a 22 x 2 ≤ b 2 a 31 x 1 + a 32 x 2 ≤ b 3 {\displaystyle {\begin{matrix}a_{11}x_{1}+a_{12}x_{2}&\leq b_{1}\\a_{21}x_{1}+a_{22}x_{2}&\leq b_{2}\\a_{31}x_{1}+a_{32}x_{2}&\leq b_{3}\\\end{matrix}}}


$${\begin{matrix}a_{11}x_{1}+a_{12}x_{2}&\leq b_{1}\\a_{21}x_{1}+a_{22}x_{2}&\leq b_{2}\\a_{31}x_{1}+a_{32}x_{2}&\leq b_{3}\\\end{matrix}}
$$


- Non-negative variables

e.g. x 1 ≥ 0 x 2 ≥ 0 {\displaystyle {\begin{matrix}x_{1}\geq 0\\x_{2}\geq 0\end{matrix}}}


$${\begin{matrix}x_{1}\geq 0\\x_{2}\geq 0\end{matrix}}
$$

The problem is usually expressed in matrix form, and then becomes:


$$\max\{\,\mathbf {c} ^{\mathsf {T}}\mathbf {x} \mid \mathbf {x} \in \mathbb {R} ^{n}\land A\mathbf {x} \leq \mathbf {b} \land \mathbf {x} \geq 0\,\}
$$

Other forms, such as minimization problems, problems with constraints on alternative forms, and problems involving negative variables can always be rewritten into an equivalent problem in standard form.


### Example

Suppose that a farmer has a piece of farm land, say L hectares, to be planted with either wheat or barley or some combination of the two. The farmer has F kilograms of fertilizer and P kilograms of pesticide. Every hectare of wheat requires F1 kilograms of fertilizer and P1 kilograms of pesticide, while every hectare of barley requires F2 kilograms of fertilizer and P2 kilograms of pesticide. Let S1 be the selling price of wheat and S2 be the selling price of barley, per hectare. If we denote the area of land planted with wheat and barley by x1 and x2 respectively, then profit can be maximized by choosing optimal values for x1 and x2. This problem can be expressed with the following linear programming problem in the standard form:

In matrix form this becomes:

maximize
$${\begin{bmatrix}S_{1}&S_{2}\end{bmatrix}}{\begin{bmatrix}x_{1}\\x_{2}\end{bmatrix}}
$$

subject to
$${\begin{bmatrix}1&1\\F_{1}&F_{2}\\P_{1}&P_{2}\end{bmatrix}}{\begin{bmatrix}x_{1}\\x_{2}\end{bmatrix}}\leq {\begin{bmatrix}L\\F\\P\end{bmatrix}},\,{\begin{bmatrix}x_{1}\\x_{2}\end{bmatrix}}\geq {\begin{bmatrix}0\\0\end{bmatrix}}.
$$


## Augmented form (slack form)

Linear programming problems can be converted into an augmented form in order to apply the common form of the simplex algorithm. This form introduces non-negative slack variables to replace inequalities with equalities in the constraints. The problems can then be written in the following block matrix form:

Maximize $z$:


$${\begin{bmatrix}1&-\mathbf {c} ^{\mathsf {T}}&0\\0&\mathbf {A} &\mathbf {I} \end{bmatrix}}{\begin{bmatrix}z\\\mathbf {x} \\\mathbf {s} \end{bmatrix}}={\begin{bmatrix}0\\\mathbf {b} \end{bmatrix}}
$$

$\mathbf {x} \geq 0,\mathbf {s} \geq 0$

where $\mathbf {s}$ are the newly introduced slack variables, $\mathbf {x}$ are the decision variables, and $z$ is the variable to be maximized.


### Example

The example above is converted into the following augmented form:

Maximize: S 1 ⋅ x 1 + S 2 ⋅ x 2 {\displaystyle S_{1}\cdot x_{1}+S_{2}\cdot x_{2}} (objective function) subject to: x 1 + x 2 + x 3 = L {\displaystyle x_{1}+x_{2}+x_{3}=L} (augmented constraint) F 1 ⋅ x 1 + F 2 ⋅ x 2 + x 4 = F {\displaystyle F_{1}\cdot x_{1}+F_{2}\cdot x_{2}+x_{4}=F} (augmented constraint) P 1 ⋅ x 1 + P 2 ⋅ x 2 + x 5 = P {\displaystyle P_{1}\cdot x_{1}+P_{2}\cdot x_{2}+x_{5}=P} (augmented constraint) x 1 , x 2 , x 3 , x 4 , x 5 ≥ 0. {\displaystyle x_{1},x_{2},x_{3},x_{4},x_{5}\geq 0.}

where $x_{3},x_{4},x_{5}$ are (non-negative) slack variables, representing in this example the unused area, the amount of unused fertilizer, and the amount of unused pesticide.

In matrix form this becomes:

Maximize $z$:


$${\begin{bmatrix}1&-S_{1}&-S_{2}&0&0&0\\0&1&1&1&0&0\\0&F_{1}&F_{2}&0&1&0\\0&P_{1}&P_{2}&0&0&1\\\end{bmatrix}}{\begin{bmatrix}z\\x_{1}\\x_{2}\\x_{3}\\x_{4}\\x_{5}\end{bmatrix}}={\begin{bmatrix}0\\L\\F\\P\end{bmatrix}},\,{\begin{bmatrix}x_{1}\\x_{2}\\x_{3}\\x_{4}\\x_{5}\end{bmatrix}}\geq 0.
$$


## Duality

Every linear programming problem, referred to as a primal problem, can be converted into a dual problem, which provides an upper bound to the optimal value of the primal problem. In matrix form, we can express the primal problem as:

Maximize cx subject to Ax ≤ b, x ≥ 0; with the corresponding symmetric dual problem,

with the corresponding symmetric dual problem,

Minimize by subject to Ay ≥ c, y ≥ 0.

An alternative primal formulation is:

Maximize cx subject to Ax ≤ b; with the corresponding asymmetric dual problem,

with the corresponding asymmetric dual problem,

Minimize by subject to Ay = c, y ≥ 0.

There are two ideas fundamental to duality theory. One is the fact that (for the symmetric dual) the dual of a dual linear program is the original primal linear program. Additionally, every feasible solution for a linear program gives a bound on the optimal value of the objective function of its dual. The weak duality theorem states that the objective function value of the dual at any feasible solution is always greater than or equal to the objective function value of the primal at any feasible solution. The strong duality theorem states that if the primal has an optimal solution, x, then the dual also has an optimal solution, y, and cx=by.

A linear program can also be unbounded or infeasible. Duality theory tells us that if the primal is unbounded then the dual is infeasible by the weak duality theorem. Likewise, if the dual is unbounded, then the primal must be infeasible. However, it is possible for both the dual and the primal to be infeasible. See dual linear program for details and several more examples.


## Variations


### Covering/packing dualities

A covering LP is a linear program of the form:

Minimize: bTy,

subject to: ATy ≥ c, y ≥ 0,

such that the matrix A and the vectors b and c are non-negative.

The dual of a covering LP is a packing LP, a linear program of the form:

Maximize: cTx,

subject to: Ax ≤ b, x ≥ 0,

such that the matrix A and the vectors b and c are non-negative.


#### Examples

Covering and packing LPs commonly arise as a linear programming relaxation of a combinatorial problem and are important in the study of approximation algorithms. For example, the LP relaxations of the set packing problem, the independent set problem, and the matching problem are packing LPs. The LP relaxations of the set cover problem, the vertex cover problem, and the dominating set problem are also covering LPs.

Finding a fractional coloring of a graph is another example of a covering LP. In this case, there is one constraint for each vertex of the graph and one variable for each independent set of the graph.


## Complementary slackness

It is possible to obtain an optimal solution to the dual when only an optimal solution to the primal is known using the complementary slackness theorem. The theorem states:

Suppose that x = (x1, x2, ... , xn) is primal feasible and that y = (y1, y2, ... , ym) is dual feasible. Let (w1, w2, ..., wm) denote the corresponding primal slack variables, and let (z1, z2, ... , zn) denote the corresponding dual slack variables. Then x and y are optimal for their respective problems if and only if


- xj zj = 0, for j = 1, 2, ... , n, and
- wi yi = 0, for i = 1, 2, ... , m.

So if the i-th slack variable of the primal is not zero, then the i-th variable of the dual is equal to zero. Likewise, if the j-th slack variable of the dual is not zero, then the j-th variable of the primal is equal to zero.

This necessary condition for optimality conveys a fairly simple economic principle. In standard form (when maximizing), if there is slack in a constrained primal resource (i.e., there are "leftovers"), then additional quantities of that resource must have no value. Likewise, if there is slack in the dual (shadow) price non-negativity constraint requirement, i.e., the price is not zero, then there must be scarce supplies (no "leftovers").


## Theory


### Existence of optimal solutions

Geometrically, the linear constraints define the feasible region, which is a convex polytope. A linear function is a convex function, which implies that every local minimum is a global minimum; similarly, a linear function is a concave function, which implies that every local maximum is a global maximum.

An optimal solution need not exist, for two reasons. First, if the constraints are inconsistent, then no feasible solution exists: For instance, the constraints x ≥ 2 and x ≤ 1 cannot be satisfied jointly; in this case, we say that the LP is infeasible. Second, when the polytope is unbounded in the direction of the gradient of the objective function (where the gradient of the objective function is the vector of the coefficients of the objective function), then no optimal value is attained because it is always possible to do better than any finite value of the objective function.


### Optimal vertices (and rays) of polyhedra

Otherwise, if a feasible solution exists and if the constraint set is bounded, then the optimum value is always attained on the boundary of the constraint set, by the maximum principle for convex functions (alternatively, by the minimum principle for concave functions) since linear functions are both convex and concave. However, some problems have distinct optimal solutions; for example, the problem of finding a feasible solution to a system of linear inequalities is a linear programming problem in which the objective function is the zero function (i.e., the constant function taking the value zero everywhere). For this feasibility problem with the zero-function for its objective-function, if there are two distinct solutions, then every convex combination of the solutions is a solution.

The vertices of the polytope are also called basic feasible solutions. The reason for this choice of name is as follows. Let d denote the number of variables. Then the fundamental theorem of linear inequalities implies (for feasible problems) that for every vertex x of the LP feasible region, there exists a set of d (or fewer) inequality constraints from the LP such that, when we treat those d constraints as equalities, the unique solution is x. Thereby we can study these vertices by means of looking at certain subsets of the set of all constraints (a discrete set), rather than the continuum of LP solutions. This principle underlies the simplex algorithm for solving linear programs.


## Algorithms


### Basis exchange algorithms


#### Simplex algorithm of Dantzig

The simplex algorithm, developed by George Dantzig in 1947, solves LP problems by constructing a feasible solution at a vertex of the polytope and then walking along a path on the edges of the polytope to vertices with non-decreasing values of the objective function until an optimum is reached for sure. In many practical problems, "stalling" occurs: many pivots are made with no increase in the objective function. In rare practical problems, the usual versions of the simplex algorithm may actually "cycle". To avoid cycles, researchers developed new pivoting rules.

In practice, the simplex algorithm is quite efficient and can be guaranteed to find the global optimum if certain precautions against cycling are taken. The simplex algorithm has been proved to solve "random" problems efficiently, i.e. in a cubic number of steps, which is similar to its behavior on practical problems.

However, the simplex algorithm has poor worst-case behavior: Klee and Minty constructed a family of linear programming problems for which the simplex method takes a number of steps exponential in the problem size. In fact, for some time it was not known whether the linear programming problem was solvable in polynomial time, i.e. of complexity class P.


#### Criss-cross algorithm

Like the simplex algorithm of Dantzig, the criss-cross algorithm is a basis-exchange algorithm that pivots between bases. However, the criss-cross algorithm need not maintain feasibility, but can pivot rather from a feasible basis to an infeasible basis. The criss-cross algorithm does not have polynomial time-complexity for linear programming. Both algorithms visit all 2 corners of a (perturbed) cube in dimension D, the Klee–Minty cube, in the worst case.


### Interior point

In contrast to the simplex algorithm, which finds an optimal solution by traversing the edges between vertices on a polyhedral set, interior-point methods move through the interior of the feasible region.


#### Ellipsoid algorithm, following Khachiyan

This is the first worst-case polynomial-time algorithm ever found for linear programming. To solve a problem which has n variables and can be encoded in L input bits, this algorithm runs in $O(n^{6}L)$ time. Leonid Khachiyan solved this long-standing complexity issue in 1979 with the introduction of the ellipsoid method. The convergence analysis has (real-number) predecessors, notably the iterative methods developed by Naum Z. Shor and the approximation algorithms by Arkadi Nemirovski and D. Yudin.


#### Projective algorithm of Karmarkar

Khachiyan's algorithm was of landmark importance for establishing the polynomial-time solvability of linear programs. The algorithm was not a computational break-through, as the simplex method is more efficient for all but specially constructed families of linear programs.

However, Khachiyan's algorithm inspired new lines of research in linear programming. In 1984, N. Karmarkar proposed a n interior&#x2D;point projective method for linear programming. Karmarkar's algorithm improved on Khachiyan's worst-case polynomial bound (giving $O(n^{3.5}L)$). Karmarkar claimed that his algorithm was much faster in practical LP than the simplex method, a claim that created great interest in interior-point methods. Since Karmarkar's discovery, many interior-point methods have been proposed and analyzed.


#### Vaidya's 87 algorithm

In 1987, Vaidya proposed an algorithm that runs in $O(n^{3})$ time.


#### Vaidya's 89 algorithm

In 1989, Vaidya developed an algorithm that runs in $O(n^{2.5})$ time. Formally speaking, the algorithm takes $O((n+d)^{1.5}nL)$ arithmetic operations in the worst case, where $d$ is the number of constraints, $n$ is the number of variables, and $L$ is the number of bits.


#### Input sparsity time algorithms

In 2015, Lee and Sidford showed that linear programming can be solved in ${\tilde {O}}((nnz(A)+d^{2}){\sqrt {d}}L)$ time, where ${\tilde {O}}$ denotes the soft O notation, and $nnz(A)$ represents the number of non-zero elements, and it remains taking $O(n^{2.5}L)$ in the worst case.


#### Current matrix multiplication time algorithm

In 2019, Cohen, Lee and Song improved the running time to
$${\tilde {O}}((n^{\omega }+n^{2.5-\alpha /2}+n^{2+1/6})L)
$$time, $\omega$ is the exponent of matrix multiplication and $\alpha$ is the dual exponent of matrix multiplication. $\alpha$ is (roughly) defined to be the largest number such that one can multiply an $n\times n$ matrix by a $n\times n^{\alpha }$ matrix in $O(n^{2})$ time. In a followup work by Lee, Song and Zhang, they reproduce the same result via a different method. These two algorithms remain ${\tilde {O}}(n^{2+1/6}L)$ when $\omega =2$ and $\alpha =1$. The result due to Jiang, Song, Weinstein and Zhang improved ${\tilde {O}}(n^{2+1/6}L)$ to ${\tilde {O}}(n^{2+1/18}L)$.


### Comparison of interior-point methods and simplex algorithms

The current opinion is that the efficiencies of good implementations of simplex-based methods and interior point methods are similar for routine applications of linear programming. However, for specific types of LP problems, it may be that one type of solver is better than another (sometimes much better), and that the structure of the solutions generated by interior point methods versus simplex-based methods are significantly different with the support set of active variables being typically smaller for the latter one.


## Open problems and recent work

There are several open problems in the theory of linear programming, the solution of which would represent fundamental breakthroughs in mathematics and potentially major advances in our ability to solve large-scale linear programs.


- Does LP admit a strongly polynomial-time algorithm?
- Does LP admit a strongly polynomial-time algorithm to find a strictly complementary solution?
- Does LP admit a polynomial-time algorithm in the real number (unit cost) model of computation?

This closely related set of problems has been cited by Stephen Smale as among the 18 greatest unsolved problems of the 21st century. In Smale's words, the third version of the problem "is the main unsolved problem of linear programming theory." While algorithms exist to solve linear programming in weakly polynomial time, such as the ellipsoid methods and interior-point techniques, no algorithms have yet been found that allow strongly polynomial-time performance in the number of constraints and the number of variables. The development of such algorithms would be of great theoretical interest, and perhaps allow practical gains in solving large LPs as well.

Although the Hirsch conjecture was recently disproved for higher dimensions, it still leaves the following questions open.


- Are there pivot rules which lead to polynomial-time simplex variants?
- Do all polytopal graphs have polynomially bounded diameter?

These questions relate to the performance analysis and development of simplex-like methods. The immense efficiency of the simplex algorithm in practice despite its exponential-time theoretical performance hints that there may be variations of simplex that run in polynomial or even strongly polynomial time. It would be of great practical and theoretical significance to know whether any such variants exist, particularly as an approach to deciding if LP can be solved in strongly polynomial time.

The simplex algorithm and its variants fall in the family of edge-following algorithms, so named because they solve linear programming problems by moving from vertex to vertex along edges of a polytope. This means that their theoretical performance is limited by the maximum number of edges between any two vertices on the LP polytope. As a result, we are interested in knowing the maximum graph-theoretical diameter of polytopal graphs. It has been proved that all polytopes have subexponential diameter. The recent disproof of the Hirsch conjecture is the first step to prove whether any polytope has superpolynomial diameter. If any such polytopes exist, then no edge-following variant can run in polynomial time. Questions about polytope diameter are of independent mathematical interest.

Simplex pivot methods preserve primal (or dual) feasibility. On the other hand, criss-cross pivot methods do not preserve (primal or dual) feasibility – they may visit primal feasible, dual feasible or primal-and-dual infeasible bases in any order. Pivot methods of this type have been studied since the 1970s. Essentially, these methods attempt to find the shortest pivot path on the arrangement polytope under the linear programming problem. In contrast to polytopal graphs, graphs of arrangement polytopes are known to have small diameter, allowing the possibility of strongly polynomial-time criss-cross pivot algorithm without resolving questions about the diameter of general polytopes.


## Integer unknowns

If all of the unknown variables are required to be integers, then the problem is called an integer programming (IP) or integer linear programming (ILP) problem. In contrast to linear programming, which can be solved efficiently in the worst case, integer programming problems are in many practical situations (those with bounded variables) NP-hard. 0–1 integer programming or binary integer programming (BIP) is the special case of integer programming where variables are required to be 0 or 1 (rather than arbitrary integers). This problem is also classified as NP-hard, and in fact the decision version was one of Karp's 21 NP-complete problems.

If only some of the unknown variables are required to be integers, then the problem is called a mixed integer (linear) programming (MIP or MILP) problem. These are generally also NP-hard because they are even more general than ILP programs.

There are however some important subclasses of IP and MIP problems that are efficiently solvable, most notably problems where the constraint matrix is totally unimodular and the right-hand sides of the constraints are integers or – more general – where the system has the total dual integrality (TDI) property.

Advanced algorithms for solving integer linear programs include:


- cutting-plane method
- Branch and bound
- Branch and cut
- Branch and price
- if the problem has some extra structure, it may be possible to apply delayed column generation.

Such integer-programming algorithms are discussed by Padberg and in Beasley.


## Integral linear programs

A linear program in real variables is said to be integral if it has at least one optimal solution which is integral, i.e., made of only integer values. Likewise, a polyhedron $P=\{x\mid Ax\geq 0\}$ is said to be integral if for all bounded feasible objective functions c, the linear program $\{\max cx\mid x\in P\}$ has an optimum $x^{*}$ with integer coordinates. As observed by Edmonds and Giles in 1977, one can equivalently say that the polyhedron $P$ is integral if for every bounded feasible integral objective function c, the optimal value of the linear program $\{\max cx\mid x\in P\}$ is an integer.

Integral linear programs are of central importance in the polyhedral aspect of combinatorial optimization since they provide an alternate characterization of a problem. Specifically, for any problem, the convex hull of the solutions is an integral polyhedron; if this polyhedron has a nice/compact description, then we can efficiently find the optimal feasible solution under any linear objective. Conversely, if we can prove that a linear programming relaxation is integral, then it is the desired description of the convex hull of feasible (integral) solutions.

Terminology is not consistent throughout the literature, so one should be careful to distinguish the following two concepts,


- in an integer linear program, described in the previous section, variables are forcibly constrained to be integers, and this problem is NP-hard in general,
- in an integral linear program, described in this section, variables are not constrained to be integers but rather one has proven somehow that the continuous problem always has an integral optimal value (assuming c is integral), and this optimal value may be found efficiently since all polynomial-size linear programs can be solved in polynomial time.

One common way of proving that a polyhedron is integral is to show that it is totally unimodular. There are other general methods including the integer decomposition property and total dual integrality. Other specific well-known integral LPs include the matching polytope, lattice polyhedra, submodular flow polyhedra, and the intersection of two generalized polymatroids/g-polymatroids – e.g. see Schrijver 2003.


## Solvers and scripting (programming) languages

Permissive licenses:

Copyleft (reciprocal) licenses:

MINTO (Mixed Integer Optimizer, an integer programming solver which uses branch and bound algorithm) has publicly available source code but is not open source.

Proprietary licenses:


## See also


## Further reading


## External links


- Guidance On Formulating LP Problems
- Mathematical Programming Glossary
- The Linear Programming FAQ
- Benchmarks For Optimisation Software
