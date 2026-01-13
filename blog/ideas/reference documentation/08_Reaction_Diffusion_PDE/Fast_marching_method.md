# Fast marching method

The fast marching method is a numerical method created by James Sethian for solving boundary value problems of the Eikonal equation:

$|\nabla u(x)|=1/f(x){\text{ for }}x\in \Omega$

$u(x)=0{\text{ for }}x\in \partial \Omega$

Typically, such a problem describes the evolution of a closed surface as a function of time $u$ with speed $f$ in the normal direction at a point $x$ on the propagating surface. The speed function is specified, and the time at which the contour crosses a point $x$ is obtained by solving the equation. Alternatively, $u(x)$ can be thought of as the minimum amount of time it would take to reach $\partial \Omega$ starting from the point $x$. The fast marching method takes advantage of this optimal control interpretation of the problem in order to build a solution outwards starting from the "known information", i.e. the boundary values.

The algorithm is similar to Dijkstra's algorithm and uses the fact that information only flows outward from the seeding area. This problem is a special case of level-set methods. More general algorithms exist but are normally slower.

Extensions to non-flat (triangulated) domains solving

| ∇ S u ( x ) | = 1 / f ( x ) , {\displaystyle |\nabla _{S}u(x)|=1/f(x),}

$|\nabla _{S}u(x)|=1/f(x),$

for the surface $S$ and $x\in S$, were introduced by Ron Kimmel and James Sethian.


- Maze as speed function shortest path
- Distance map multi-stencils with random source points


## Algorithm

First, assume that the domain has been discretized into a mesh. We will refer to mesh points as nodes. Each node $x_{i}$ has a corresponding value $U_{i}=U(x_{i})\approx u(x_{i})$.

The algorithm works just like Dijkstra's algorithm but differs in how the nodes' values are calculated. In Dijkstra's algorithm, a node's value is calculated using a single one of the neighboring nodes. However, in solving the PDE in $\mathbb {R} ^{n}$, between $1$ and $n$ of the neighboring nodes are used.

Nodes are labeled as far (not yet visited), considered (visited and value tentatively assigned), and accepted (visited and value permanently assigned).


1. Assign every node $x_{i}$ the value of $U_{i}=+\infty$ and label them as far; for all nodes $x_{i}\in \partial \Omega$ set $U_{i}=0$ and label $x_{i}$ as accepted.
2. For every far node $x_{i}$, use the Eikonal update formula to calculate a new value for ${\tilde {U}}$. If ${\tilde {U}}<U_{i}$ then set $U_{i}={\tilde {U}}$ and label $x_{i}$ as considered.
3. Let ${\tilde {x}}$ be the considered node with the smallest value $U$. Label ${\tilde {x}}$ as accepted.
4. For every neighbor $x_{i}$ of ${\tilde {x}}$ that is not-accepted, calculate a tentative value ${\tilde {U}}$.
5. If ${\tilde {U}}<U_{i}$ then set $U_{i}={\tilde {U}}$. If $x_{i}$ was labeled as far, update the label to considered.
6. If there exists a considered node, return to step 3. Otherwise, terminate.


## See also


- Level-set method
- Fast sweeping method
- Bellman–Ford algorithm


## External links


- Dijkstra-like Methods for the Eikonal Equation J.N. Tsitsiklis, 1995
- The Fast Marching Method and its Applications by James A. Sethian
- Multi-Stencils Fast Marching Methods
- Multi-Stencils Fast Marching Matlab Implementation
- Implementation Details of the Fast Marching Methods
- Generalized Fast Marching method by Forcadel et al. [2008] for applications in image segmentation.
- Python Implementation of the Fast Marching Method
- See Chapter 8 in Design and Optimization of Nano-Optical Elements by Coupling Fabrication to Optical Behavior Archived 2013-08-20 at the Wayback Machine
