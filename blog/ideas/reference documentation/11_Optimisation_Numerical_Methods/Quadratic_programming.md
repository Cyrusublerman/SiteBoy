# Quadratic programming

Quadratic programming (QP) is the process of solving certain mathematical optimization problems involving quadratic functions. Specifically, one seeks to optimize (minimize or maximize) a multivariate quadratic function subject to linear constraints on the variables. Quadratic programming is a type of nonlinear programming.

"Programming" in this context refers to a formal procedure for solving mathematical problems. This usage dates to the 1940s and is not specifically tied to the more recent notion of "computer programming." To avoid confusion, some practitioners prefer the term "optimization" — e.g., "quadratic optimization."


## Problem formulation

The quadratic programming problem with n variables and m constraints can be formulated as follows. Given:


- a real-valued, n-dimensional vector c,
- an n×n-dimensional real symmetric matrix Q,
- an m×n-dimensional real matrix A, and
- an m-dimensional real vector b,

the objective of quadratic programming is to find an n-dimensional vector x, that will

minimize 1 2 x T Q x + c T x {\displaystyle {\tfrac {1}{2}}\mathbf {x} ^{\mathrm {T} }Q\mathbf {x} +\mathbf {c} ^{\mathrm {T} }\mathbf {x} } subject to A x ⪯ b , {\displaystyle A\mathbf {x} \preceq \mathbf {b} ,}

where x denotes the vector transpose of x, and the notation Ax ⪯ b means that every entry of the vector Ax is less than or equal to the corresponding entry of the vector b (component-wise inequality).


### Constrained least squares

As a special case when Q is symmetric positive-definite, the cost function reduces to least squares:

minimize 1 2 ‖ R x − d ‖ 2 {\displaystyle {\tfrac {1}{2}}\|R\mathbf {x} -\mathbf {d} \|^{2}} subject to A x ⪯ b , {\displaystyle A\mathbf {x} \preceq \mathbf {b} ,}

where Q = RR follows from the Cholesky decomposition of Q and c = −R d. Conversely, any such constrained least squares program can be equivalently framed as a quadratic programming problem, even for a generic non-square R matrix.


### Generalizations

When minimizing a function f in the neighborhood of some reference point x0, Q is set to its Hessian matrix H(f(x0)) and c is set to its gradient ∇f(x0). A related programming problem, quadratically constrained quadratic programming, can be posed by adding quadratic constraints on the variables.


## Solution methods

For general problems a variety of methods are commonly used, including

interior point, active set,[3] augmented Lagrangian,[4] conjugate gradient, gradient projection, extensions of the simplex algorithm.[3]

In the case in which Q is positive definite, the problem is a special case of the more general field of convex optimization.


### Equality constraints

Quadratic programming is particularly simple when Q is positive definite and there are only equality constraints; specifically, the solution process is linear. By using Lagrange multipliers and seeking the extremum of the Lagrangian, it may be readily shown that the solution to the equality constrained problem


$${\text{Minimize}}\quad {\tfrac {1}{2}}\mathbf {x} ^{\mathrm {T} }Q\mathbf {x} +\mathbf {c} ^{\mathrm {T} }\mathbf {x}
$$

${\text{subject to}}\quad E\mathbf {x} =\mathbf {d}$

is given by the linear system


$${\begin{bmatrix}Q&E^{\top }\\E&0\end{bmatrix}}{\begin{bmatrix}\mathbf {x} \\\lambda \end{bmatrix}}={\begin{bmatrix}-\mathbf {c} \\\mathbf {d} \end{bmatrix}}
$$

where λ is a set of Lagrange multipliers which come out of the solution alongside x.

The easiest means of approaching this system is direct solution (for example, LU factorization), which for small problems is very practical. For large problems, the system poses some unusual difficulties, most notably that the problem is never positive definite (even if Q is), making it potentially very difficult to find a good numeric approach, and there are many approaches to choose from dependent on the problem.

If the constraints don't couple the variables too tightly, a relatively simple attack is to change the variables so that constraints are unconditionally satisfied. For example, suppose d = 0 (generalizing to nonzero is straightforward). Looking at the constraint equations:

$E\mathbf {x} =0$

introduce a new variable y defined by

$Z\mathbf {y} =\mathbf {x}$

where y has dimension of x minus the number of constraints. Then

$EZ\mathbf {y} =\mathbf {0}$

and if Z is chosen so that EZ = 0 the constraint equation will be always satisfied. Finding such Z entails finding the null space of E, which is more or less simple depending on the structure of E. Substituting into the quadratic form gives an unconstrained minimization problem:


$${\tfrac {1}{2}}\mathbf {x} ^{\top }Q\mathbf {x} +\mathbf {c} ^{\top }\mathbf {x} \quad \implies \quad {\tfrac {1}{2}}\mathbf {y} ^{\top }Z^{\top }QZ\mathbf {y} +\left(Z^{\top }\mathbf {c} \right)^{\top }\mathbf {y}
$$

the solution of which is given by:

$Z^{\top }QZ\mathbf {y} =-Z^{\top }\mathbf {c}$

Under certain conditions on Q, the reduced matrix ZQZ will be positive definite. It is possible to write a variation on the conjugate gradient method which avoids the explicit calculation of Z.


## Lagrangian duality

The Lagrangian dual of a quadratic programming problem is also a quadratic programming problem. To see this let us focus on the case where c = 0 and Q is positive definite. We write the Lagrangian function as


$$L(x,\lambda )={\tfrac {1}{2}}x^{\top }Qx+\lambda ^{\top }(Ax-b).
$$

Defining the (Lagrangian) dual function g(λ) as $g(\lambda )=\inf _{x}L(x,\lambda )$, we find an infimum of L, using $\nabla _{x}L(x,\lambda )=0$ and positive-definiteness of Q:

$x^{*}=-Q^{-1}A^{\top }\lambda .$

Hence the dual function is


$$g(\lambda )=-{\tfrac {1}{2}}\lambda ^{\top }AQ^{-1}A^{\top }\lambda -\lambda ^{\top }b,
$$

and so the Lagrangian dual of the quadratic programming problem is


$${\text{maximize}}_{\lambda \geq 0}\quad -{\tfrac {1}{2}}\lambda ^{\top }AQ^{-1}A^{\top }\lambda -\lambda ^{\top }b.
$$

Besides the Lagrangian duality theory, there are other duality pairings (e.g. Wolfe, etc.).


## Run-time complexity


### Convex quadratic programming

For positive definite Q, when the problem is convex, the ellipsoid method solves the problem in (weakly) polynomial time.

Ye and Tse present a polynomial-time algorithm, which extends Karmarkar's algorithm from linear programming to convex quadratic programming. On a system with n variables and L input bits, their algorithm requires O(L n) iterations, each of which can be done using O(L n) arithmetic operations, for a total runtime complexity of O(L n).

Kapoor and Vaidya present another algorithm, which requires O(L * log L * n * log n) arithmetic operations.


### Non-convex quadratic programming

If Q is indefinite, (so the problem is non-convex) then the problem is NP-hard. A simple way to see this is to consider the non-convex quadratic constraint xi = xi. This constraint is equivalent to requiring that xi is in {0,1}, that is, xi is a binary integer variable. Therefore, such constraints can be used to model any integer program with binary variables, which is known to be NP-hard.

Moreover, these non-convex problems might have several stationary points and local minima. In fact, even if Q has only one negative eigenvalue, the problem is (strongly) NP-hard.

Moreover, finding a KKT point of a non-convex quadratic program is CLS-hard.


## Mixed-integer quadratic programming

There are some situations where one or more elements of the vector x will need to take on integer values. This leads to the formulation of a mixed-integer quadratic programming (MIQP) problem. Applications of MIQP include water resources and the construction of index funds.


## Solvers and scripting (programming) languages


## Extensions

Polynomial optimization is a more general framework, in which the constraints can be polynomial functions of any degree, not only 2.


## See also


- Sequential quadratic programming
- Linear programming
- Critical line method


## Further reading


- Cottle, Richard W.; Pang, Jong-Shi; Stone, Richard E. (1992). The linear complementarity problem. Computer Science and Scientific Computing. Boston, MA: Academic Press, Inc. pp. xxiv+762 pp. ISBN 978-0-12-192350-1. MR 1150683.
- Garey, Michael R.; Johnson, David S. (1979). Computers and Intractability: A Guide to the Theory of NP-Completeness. W.H. Freeman. ISBN 978-0-7167-1045-5. A6: MP2, pg.245.
- Gould, Nicholas I. M.; Toint, Philippe L. (2000). "A Quadratic Programming Bibliography" (PDF). RAL Numerical Analysis Group Internal Report 2000-1. Archived from the original (PDF) on 2017-07-05.


## External links


- A page about quadratic programming Archived 2011-06-07 at the Wayback Machine
- NEOS Optimization Guide: Quadratic Programming
- Quadratic Programming Archived 2023-04-08 at the Wayback Machine
- Cubic programming and beyond, in Operations Research stack exchange
