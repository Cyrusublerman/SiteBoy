# Gauss–Seidel method

In numerical linear algebra, the Gauss–Seidel method, also known as the Liebmann method or the method of successive displacement, is an iterative method used to solve a system of linear equations. It is named after the German mathematicians Carl Friedrich Gauss and Philipp Ludwig von Seidel. Though it can be applied to any matrix with non-zero elements on the diagonals, convergence is only guaranteed if the matrix is either strictly diagonally dominant, or symmetric and positive definite. It was only mentioned in a private letter from Gauss to his student Gerling in 1823. A publication was not delivered before 1874 by Seidel.


## Description

Let ${\textstyle \mathbf {A} \mathbf {x} =\mathbf {b} }$ be a square system of n linear equations, where:


$$\mathbf {A} ={\begin{bmatrix}a_{11}&a_{12}&\cdots &a_{1n}\\a_{21}&a_{22}&\cdots &a_{2n}\\\vdots &\vdots &\ddots &\vdots \\a_{n1}&a_{n2}&\cdots &a_{nn}\end{bmatrix}},\qquad \mathbf {x} ={\begin{bmatrix}x_{1}\\x_{2}\\\vdots \\x_{n}\end{bmatrix}},\qquad \mathbf {b} ={\begin{bmatrix}b_{1}\\b_{2}\\\vdots \\b_{n}\end{bmatrix}}.
$$

When $\mathbf {A}$ and $\mathbf {b}$ are known, and $\mathbf {x}$ is unknown, the Gauss–Seidel method can be used to iteratively approximate $\mathbf {x}$. The vector $\mathbf {x} ^{(0)}$ denotes the initial guess for $\mathbf {x}$, often $\mathbf {x} _{i}^{(0)}=0$ for $i=1,2,...,n$. Denote by $\mathbf {x} ^{(k)}$ the $k$-th approximation or iteration of $\mathbf {x}$, and by $\mathbf {x} ^{(k+1)}$ the approximation of $\mathbf {x}$ at the next (or $k+1$-th) iteration.


### Matrix-based formula

The solution is obtained iteratively via
$$\mathbf {L} \mathbf {x} ^{(k+1)}=\mathbf {b} -\mathbf {U} \mathbf {x} ^{(k)},
$$where the matrix $\mathbf {A}$ is decomposed into a lower triangular component $\mathbf {L}$, and a strictly upper triangular component $\mathbf {U}$ such that $\mathbf {A} =\mathbf {L} +\mathbf {U}$. More specifically, the decomposition of $\mathbf {A}$ into $\mathbf {L}$ and $\mathbf {U}$ is given by:


$$\mathbf {A} =\underbrace {\begin{bmatrix}a_{11}&0&\cdots &0\\a_{21}&a_{22}&\cdots &0\\\vdots &\vdots &\ddots &\vdots \\a_{n1}&a_{n2}&\cdots &a_{nn}\end{bmatrix}} _{\textstyle \mathbf {L} }+\underbrace {\begin{bmatrix}0&a_{12}&\cdots &a_{1n}\\0&0&\cdots &a_{2n}\\\vdots &\vdots &\ddots &\vdots \\0&0&\cdots &0\end{bmatrix}} _{\textstyle \mathbf {U} }.
$$


#### Why the matrix-based formula works

The system of linear equations may be rewritten as:


$${\begin{alignedat}{1}\mathbf {A} \mathbf {x} &=\mathbf {b} \\(\mathbf {L} +\mathbf {U} )\mathbf {x} &=\mathbf {b} \\\mathbf {L} \mathbf {x} +\mathbf {U} \mathbf {x} &=\mathbf {b} \\\mathbf {L} \mathbf {x} &=\mathbf {b} -\mathbf {U} \mathbf {x} \end{alignedat}}
$$

The Gauss–Seidel method now solves the left hand side of this expression for $\mathbf {x}$, using the previous value for $\mathbf {x}$ on the right hand side. Analytically, this may be written as
$$\mathbf {x} ^{(k+1)}=\mathbf {L} ^{-1}\left(\mathbf {b} -\mathbf {U} \mathbf {x} ^{(k)}\right).
$$


### Element-based formula

However, by taking advantage of the triangular form of $\mathbf {L}$, the elements of $\mathbf {x} ^{(k+1)}$ can be computed sequentially for each row $i$ using forward substitution:
$$x_{i}^{(k+1)}={\frac {1}{a_{ii}}}\left(b_{i}-\sum _{j=1}^{i-1}a_{ij}x_{j}^{(k+1)}-\sum _{j=i+1}^{n}a_{ij}x_{j}^{(k)}\right),\quad i=1,2,\dots ,n.
$$

Notice that the formula uses two summations per iteration which can be expressed as one summation
$$\sum _{j\neq i}a_{ij}x_{j}
$$that uses the most recently calculated iteration of $x_{j}$. The procedure is generally continued until the changes made by an iteration are below some tolerance, such as a sufficiently small residual.


### Discussion

The element-wise formula for the Gauss–Seidel method is related to that of the (iterative) Jacobi method, with an important difference:

In Gauss-Seidel, the computation of $\mathbf {x} ^{(k+1)}$ uses the elements of $\mathbf {x} ^{(k+1)}$ that have already been computed, and only the elements of $\mathbf {x} ^{(k)}$ that have not been computed in the $(k+1)$-th iteration. This means that, unlike the Jacobi method, only one storage vector is required as elements can be overwritten as they are computed, which can be advantageous for very large problems.

However, unlike the Jacobi method, the computations for each element are generally much harder to implement in parallel, since they can have a very long critical path, and are thus most feasible for sparse matrices. Furthermore, the values at each iteration are dependent on the order of the original equations.

Gauss-Seidel is the same as successive over-relaxation with $\omega =1$.


## Convergence

The convergence properties of the Gauss–Seidel method are dependent on the matrix $\mathbf {A}$. Namely, the procedure is known to converge if either:


- $\mathbf {A}$ is symmetric positive-definite, or
- $\mathbf {A}$ is strictly or irreducibly diagonally dominant.

The Gauss–Seidel method may converge even if these conditions are not satisfied.

Golub and Van Loan give a theorem for an algorithm that splits $\mathbf {A}$ into two parts. Suppose $\mathbf {A} =\mathbf {M} -\mathbf {N}$ is nonsingular. Let $r=\rho (\mathbf {M} ^{-1}\mathbf {N} )$ be the spectral radius of $\mathbf {M} ^{-1}\mathbf {N}$. Then the iterates $\mathbf {x} ^{(k)}$ defined by
$$\mathbf {M} \mathbf {x} ^{(k+1)}=\mathbf {N} \mathbf {x} ^{(k)}+\mathbf {b}
$$converge to $\mathbf {x} =\mathbf {A} ^{-1}\mathbf {b}$ for any starting vector $\mathbf {x} ^{(0)}$ if $\mathbf {M}$ is nonsingular and $r<1$.


## Algorithm

Since elements can be overwritten as they are computed in this algorithm, only one storage vector is needed, and vector indexing is omitted. The algorithm goes as follows:


## Examples


### An example for the matrix version

A linear system shown as $\mathbf {A} \mathbf {x} =\mathbf {b}$ is given by:
$$\mathbf {A} ={\begin{bmatrix}16&3\\7&-11\\\end{bmatrix}}\quad {\text{and}}\quad \mathbf {b} ={\begin{bmatrix}11\\13\end{bmatrix}}.
$$

Use the equation
$$\mathbf {x} ^{(k+1)}=\mathbf {L} ^{-1}(\mathbf {b} -\mathbf {U} \mathbf {x} ^{(k)})
$$in the form
$$\mathbf {x} ^{(k+1)}=\mathbf {T} \mathbf {x} ^{(k)}+\mathbf {c}
$$where:


$$\mathbf {T} =-\mathbf {L} ^{-1}\mathbf {U} \quad {\text{and}}\quad \mathbf {c} =\mathbf {L} ^{-1}\mathbf {b} .
$$

Decompose $\mathbf {A}$ into the sum of a lower triangular component $\mathbf {L}$ and a strict upper triangular component $U$:
$$\mathbf {L} ={\begin{bmatrix}16&0\\7&-11\\\end{bmatrix}}\quad {\text{and}}\quad \mathbf {U} ={\begin{bmatrix}0&3\\0&0\end{bmatrix}}.
$$

The inverse of $\mathbf {L}$ is:
$$\mathbf {L} ^{-1}={\begin{bmatrix}16&0\\7&-11\end{bmatrix}}^{-1}={\begin{bmatrix}0.0625&0.0000\\0.0398&-0.0909\\\end{bmatrix}}.
$$

Now find:
$${\begin{aligned}\mathbf {T} &=-{\begin{bmatrix}0.0625&0.0000\\0.0398&-0.0909\end{bmatrix}}{\begin{bmatrix}0&3\\0&0\end{bmatrix}}={\begin{bmatrix}0.000&-0.1875\\0.000&-0.1194\end{bmatrix}},\\[1ex]\mathbf {c} &={\begin{bmatrix}0.0625&0.0000\\0.0398&-0.0909\end{bmatrix}}{\begin{bmatrix}11\\13\end{bmatrix}}={\begin{bmatrix}0.6875\\-0.7439\end{bmatrix}}.\end{aligned}}
$$

With $\mathbf {T}$ and $\mathbf {c}$ the vectors $\mathbf {x}$ can be obtained iteratively.

First of all, choose $\mathbf {x} ^{(0)}$, for example
$$\mathbf {x} ^{(0)}={\begin{bmatrix}1.0\\1.0\end{bmatrix}}.
$$The closer the guess to the final solution, the fewer iterations the algorithm will need.

Then calculate:
$${\begin{aligned}\mathbf {x} ^{(1)}&={\begin{bmatrix}0.000&-0.1875\\0.000&-0.1193\end{bmatrix}}{\begin{bmatrix}1.0\\1.0\end{bmatrix}}+{\begin{bmatrix}0.6875\\-0.7443\end{bmatrix}}={\begin{bmatrix}0.5000\\-0.8636\end{bmatrix}}.\\[1ex]\mathbf {x} ^{(2)}&={\begin{bmatrix}0.000&-0.1875\\0.000&-0.1193\end{bmatrix}}{\begin{bmatrix}0.5000\\-0.8636\end{bmatrix}}+{\begin{bmatrix}0.6875\\-0.7443\end{bmatrix}}={\begin{bmatrix}0.8494\\-0.6413\end{bmatrix}}.\\[1ex]\mathbf {x} ^{(3)}&={\begin{bmatrix}0.000&-0.1875\\0.000&-0.1193\end{bmatrix}}{\begin{bmatrix}0.8494\\-0.6413\\\end{bmatrix}}+{\begin{bmatrix}0.6875\\-0.7443\end{bmatrix}}={\begin{bmatrix}0.8077\\-0.6678\end{bmatrix}}.\\[1ex]\mathbf {x} ^{(4)}&={\begin{bmatrix}0.000&-0.1875\\0.000&-0.1193\end{bmatrix}}{\begin{bmatrix}0.8077\\-0.6678\end{bmatrix}}+{\begin{bmatrix}0.6875\\-0.7443\end{bmatrix}}={\begin{bmatrix}0.8127\\-0.6646\end{bmatrix}}.\\[1ex]\mathbf {x} ^{(5)}&={\begin{bmatrix}0.000&-0.1875\\0.000&-0.1193\end{bmatrix}}{\begin{bmatrix}0.8127\\-0.6646\end{bmatrix}}+{\begin{bmatrix}0.6875\\-0.7443\end{bmatrix}}={\begin{bmatrix}0.8121\\-0.6650\end{bmatrix}}.\\[1ex]\mathbf {x} ^{(6)}&={\begin{bmatrix}0.000&-0.1875\\0.000&-0.1193\end{bmatrix}}{\begin{bmatrix}0.8121\\-0.6650\end{bmatrix}}+{\begin{bmatrix}0.6875\\-0.7443\end{bmatrix}}={\begin{bmatrix}0.8122\\-0.6650\end{bmatrix}}.\\[1ex]\mathbf {x} ^{(7)}&={\begin{bmatrix}0.000&-0.1875\\0.000&-0.1193\end{bmatrix}}{\begin{bmatrix}0.8122\\-0.6650\end{bmatrix}}+{\begin{bmatrix}0.6875\\-0.7443\end{bmatrix}}={\begin{bmatrix}0.8122\\-0.6650\end{bmatrix}}.\end{aligned}}
$$

As expected, the algorithm converges to the solution:
$$\mathbf {x} =\mathbf {A} ^{-1}\mathbf {b} \approx {\begin{bmatrix}0.8122\\-0.6650\end{bmatrix}}
$$.

In fact, the matrix A is strictly diagonally dominant, but not positive definite.


### Another example for the matrix version

Another linear system shown as $\mathbf {A} \mathbf {x} =\mathbf {b}$ is given by:


$$\mathbf {A} ={\begin{bmatrix}2&3\\5&7\\\end{bmatrix}}\quad {\text{and}}\quad \mathbf {b} ={\begin{bmatrix}11\\13\\\end{bmatrix}}.
$$

Use the equation
$$\mathbf {x} ^{(k+1)}=\mathbf {L} ^{-1}(\mathbf {b} -\mathbf {U} \mathbf {x} ^{(k)})
$$in the form
$$\mathbf {x} ^{(k+1)}=\mathbf {T} \mathbf {x} ^{(k)}+\mathbf {c}
$$where:


$$\mathbf {T} =-\mathbf {L} ^{-1}\mathbf {U} \quad {\text{and}}\quad \mathbf {c} =\mathbf {L} ^{-1}\mathbf {b} .
$$

Decompose $\mathbf {A}$ into the sum of a lower triangular component $\mathbf {L}$ and a strict upper triangular component $\mathbf {U}$:
$$\mathbf {L} ={\begin{bmatrix}2&0\\5&7\\\end{bmatrix}}\quad {\text{and}}\quad \mathbf {U} ={\begin{bmatrix}0&3\\0&0\\\end{bmatrix}}.
$$

The inverse of $\mathbf {L}$ is:
$$\mathbf {L} ^{-1}={\begin{bmatrix}2&0\\5&7\\\end{bmatrix}}^{-1}={\begin{bmatrix}0.500&0.000\\-0.357&0.143\\\end{bmatrix}}.
$$

Now find:
$${\begin{aligned}\mathbf {T} &=-{\begin{bmatrix}0.500&0.000\\-0.357&0.143\\\end{bmatrix}}{\begin{bmatrix}0&3\\0&0\\\end{bmatrix}}={\begin{bmatrix}0.000&-1.500\\0.000&1.071\\\end{bmatrix}},\\[1ex]\mathbf {c} &={\begin{bmatrix}0.500&0.000\\-0.357&0.143\\\end{bmatrix}}{\begin{bmatrix}11\\13\\\end{bmatrix}}={\begin{bmatrix}5.500\\-2.071\\\end{bmatrix}}.\end{aligned}}
$$

With $\mathbf {T}$ and $\mathbf {c}$ the vectors $\mathbf {x}$ can be obtained iteratively.

First of all, we have to choose $\mathbf {x} ^{(0)}$, for example
$$\mathbf {x} ^{(0)}={\begin{bmatrix}1.1\\2.3\end{bmatrix}}
$$

Then calculate:
$${\begin{aligned}\mathbf {x} ^{(1)}&={\begin{bmatrix}0&-1.500\\0&1.071\\\end{bmatrix}}{\begin{bmatrix}1.1\\2.3\\\end{bmatrix}}+{\begin{bmatrix}5.500\\-2.071\\\end{bmatrix}}={\begin{bmatrix}2.050\\0.393\\\end{bmatrix}}.\\[1ex]\mathbf {x} ^{(2)}&={\begin{bmatrix}0&-1.500\\0&1.071\\\end{bmatrix}}{\begin{bmatrix}2.050\\0.393\\\end{bmatrix}}+{\begin{bmatrix}5.500\\-2.071\\\end{bmatrix}}={\begin{bmatrix}4.911\\-1.651\end{bmatrix}}.\\[1ex]\mathbf {x} ^{(3)}&=\cdots .\end{aligned}}
$$

In a test for convergence we find that the algorithm diverges. In fact, the matrix $\mathbf {A}$ is neither diagonally dominant nor positive definite. Then, convergence to the exact solution
$$\mathbf {x} =\mathbf {A} ^{-1}\mathbf {b} ={\begin{bmatrix}-38\\29\end{bmatrix}}
$$is not guaranteed and, in this case, will not occur.


### An example for the equation version

Suppose given $n$ equations and a starting point $\mathbf {x} _{0}$. At any step in a Gauss-Seidel iteration, solve the first equation for $x_{1}$ in terms of $x_{2},\dots ,x_{n}$; then solve the second equation for $x_{2}$ in terms of $x_{1}$ just found and the remaining $x_{3},\dots ,x_{n}$; and continue to $x_{n}$. Then, repeat iterations until convergence is achieved, or break if the divergence in the solutions start to diverge beyond a predefined level.

Consider an example:
$${\begin{array}{rrrrl}10x_{1}&-x_{2}&+2x_{3}&&=6,\\-x_{1}&+11x_{2}&-x_{3}&+3x_{4}&=25,\\2x_{1}&-x_{2}&+10x_{3}&-x_{4}&=-11,\\&3x_{2}&-x_{3}&+8x_{4}&=15.\end{array}}
$$

Solving for $x_{1},x_{2},x_{3}$ and $x_{4}$ gives:
$${\begin{aligned}x_{1}&=x_{2}/10-x_{3}/5+3/5,\\x_{2}&=x_{1}/11+x_{3}/11-3x_{4}/11+25/11,\\x_{3}&=-x_{1}/5+x_{2}/10+x_{4}/10-11/10,\\x_{4}&=-3x_{2}/8+x_{3}/8+15/8.\end{aligned}}
$$

Suppose (0, 0, 0, 0) is the initial approximation, then the first approximate solution is given by:
$${\begin{aligned}x_{1}&=3/5=0.6,\\x_{2}&=(3/5)/11+25/11=3/55+25/11=2.3272,\\x_{3}&=-(3/5)/5+(2.3272)/10-11/10=-3/25+0.23272-1.1=-0.9873,\\x_{4}&=-3(2.3272)/8+(-0.9873)/8+15/8=0.8789.\end{aligned}}
$$

Using the approximations obtained, the iterative procedure is repeated until the desired accuracy has been reached. The following are the approximated solutions after four iterations.

The exact solution of the system is (1, 2, −1, 1).


### An example using Python and NumPy

The following iterative procedure produces the solution vector of a linear system of equations:

Produces the output:


### Program to solve arbitrary number of equations using Matlab

The following code uses the formula
$$x_{i}^{(k+1)}={\frac {1}{a_{ii}}}\left(b_{i}-\sum _{j<i}a_{ij}x_{j}^{(k+1)}-\sum _{j>i}a_{ij}x_{j}^{(k)}\right),\quad {\begin{array}{l}i=1,2,\ldots ,n\\k=0,1,2,\ldots \end{array}}
$$


## See also


- Conjugate gradient method
- Gaussian belief propagation
- Iterative method: Linear systems
- Kaczmarz method (a "row-oriented" method, whereas Gauss-Seidel is "column-oriented." See, for example, this paper.)
- Matrix splitting
- Richardson iteration


## External links


- "Seidel method", Encyclopedia of Mathematics, EMS Press, 2001 [1994]
- Gauss–Seidel from www.math-linux.com
- Gauss–Seidel From Holistic Numerical Methods Institute
- Gauss Siedel Iteration from www.geocities.com
- The Gauss-Seidel Method
- Bickson
- Matlab code
- C code example
