# Hessian matrix

In mathematics, the Hessian matrix, Hessian or (less commonly) Hesse matrix is a square matrix of second-order partial derivatives of a scalar-valued function, or scalar field. It describes the local curvature of a function of many variables. The Hessian matrix was developed in the 19th century by the German mathematician Ludwig Otto Hesse and later named after him. Hesse originally used the term "functional determinants". The Hessian is sometimes denoted by H or $\nabla \nabla$ or $\nabla ^{2}$ or $\nabla \otimes \nabla$ or $D^{2}$.


## Definitions and properties

Suppose $f:\mathbb {R} ^{n}\to \mathbb {R}$ is a function taking as input a vector $\mathbf {x} \in \mathbb {R} ^{n}$ and outputting a scalar $f(\mathbf {x} )\in \mathbb {R} .$ If all second-order partial derivatives of $f$ exist, then the Hessian matrix $\mathbf {H}$ of $f$ is a square $n\times n$ matrix, usually defined and arranged as
$$\mathbf {H} _{f}={\begin{bmatrix}{\dfrac {\partial ^{2}f}{\partial x_{1}^{2}}}&{\dfrac {\partial ^{2}f}{\partial x_{1}\,\partial x_{2}}}&\cdots &{\dfrac {\partial ^{2}f}{\partial x_{1}\,\partial x_{n}}}\\[2.2ex]{\dfrac {\partial ^{2}f}{\partial x_{2}\,\partial x_{1}}}&{\dfrac {\partial ^{2}f}{\partial x_{2}^{2}}}&\cdots &{\dfrac {\partial ^{2}f}{\partial x_{2}\,\partial x_{n}}}\\[2.2ex]\vdots &\vdots &\ddots &\vdots \\[2.2ex]{\dfrac {\partial ^{2}f}{\partial x_{n}\,\partial x_{1}}}&{\dfrac {\partial ^{2}f}{\partial x_{n}\,\partial x_{2}}}&\cdots &{\dfrac {\partial ^{2}f}{\partial x_{n}^{2}}}\end{bmatrix}}.
$$That is, the entry of the ith row and the jth column is
$$(\mathbf {H} _{f})_{i,j}={\frac {\partial ^{2}f}{\partial x_{i}\,\partial x_{j}}}.
$$

If furthermore the second partial derivatives are all continuous, the Hessian matrix is a symmetric matrix by the symmetry of second derivatives.

The determinant of the Hessian matrix is called the Hessian determinant.

The Hessian matrix of a function $f$ is the transpose of the Jacobian matrix of the gradient of the function $f$; that is:
$$\mathbf {H} (f(\mathbf {x} ))=\mathbf {J} (\nabla f(\mathbf {x} ))^{\mathsf {T}}.
$$


## Applications


### Inflection points

If $f$ is a homogeneous polynomial in three variables, the equation $f=0$ is the implicit equation of a plane projective curve. The inflection points of the curve are exactly the non-singular points where the Hessian determinant is zero. It follows by Bézout's theorem that a cubic plane curve has at most 9 inflection points, since the Hessian determinant is a polynomial of degree 3.


### Second-derivative test

The Hessian matrix of a convex function is positive semi-definite. Refining this property allows us to test whether a critical point $x$ is a local maximum, local minimum, or a saddle point, as follows:

If the Hessian is positive-definite at $x,$ then $f$ attains an isolated local minimum at $x.$ If the Hessian is negative-definite at $x,$ then $f$ attains an isolated local maximum at $x.$ If the Hessian has both positive and negative eigenvalues, then $x$ is a saddle point for $f.$ Otherwise the test is inconclusive. This implies that at a local minimum the Hessian is positive-semidefinite, and at a local maximum the Hessian is negative-semidefinite.

For positive-semidefinite and negative-semidefinite Hessians the test is inconclusive (a critical point where the Hessian is semidefinite but not definite may be a local extremum or a saddle point). However, more can be said from the point of view of Morse theory.

The second-derivative test for functions of one and two variables is simpler than the general case. In one variable, the Hessian contains exactly one second derivative; if it is positive, then $x$ is a local minimum, and if it is negative, then $x$ is a local maximum; if it is zero, then the test is inconclusive. In two variables, the determinant can be used, because the determinant is the product of the eigenvalues. If it is positive, then the eigenvalues are both positive, or both negative. If it is negative, then the two eigenvalues have different signs. If it is zero, then the second-derivative test is inconclusive.

Equivalently, the second-order conditions that are sufficient for a local minimum or maximum can be expressed in terms of the sequence of principal (upper-leftmost) minors (determinants of sub-matrices) of the Hessian; these conditions are a special case of those given in the next section for bordered Hessians for constrained optimization—the case in which the number of constraints is zero. Specifically, the sufficient condition for a minimum is that all of these principal minors be positive, while the sufficient condition for a maximum is that the minors alternate in sign, with the $1\times 1$ minor being negative.


### Critical points

If the gradient (the vector of the partial derivatives) of a function $f$ is zero at some point $\mathbf {x} ,$ then $f$ has a critical point (or stationary point) at $\mathbf {x} .$ The determinant of the Hessian at $\mathbf {x}$ is called, in some contexts, a discriminant. If this determinant is zero then $\mathbf {x}$ is called a degenerate critical point of $f,$ or a non-Morse critical point of $f.$ Otherwise it is non-degenerate, and called a Morse critical point of $f.$

The Hessian matrix plays an important role in Morse theory and catastrophe theory, because its kernel and eigenvalues allow classification of the critical points.

The determinant of the Hessian matrix, when evaluated at a critical point of a function, is equal to the Gaussian curvature of the function considered as a manifold. The eigenvalues of the Hessian at that point are the principal curvatures of the function, and the eigenvectors are the principal directions of curvature. (See Gaussian curvature § Relation to principal curvatures.)


### Use in optimization

Hessian matrices are used in large-scale optimization problems within Newton-type methods because they are the coefficient of the quadratic term of a local Taylor expansion of a function. That is,
$$y=f(\mathbf {x} +\Delta \mathbf {x} )\approx f(\mathbf {x} )+\nabla f(\mathbf {x} )^{\mathsf {T}}\Delta \mathbf {x} +{\frac {1}{2}}\,\Delta \mathbf {x} ^{\mathsf {T}}\mathbf {H} (\mathbf {x} )\,\Delta \mathbf {x}
$$where $\nabla f$ is the gradient
$$\left({\frac {\partial f}{\partial x_{1}}},\ldots ,{\frac {\partial f}{\partial x_{n}}}\right).
$$Computing and storing the full Hessian matrix takes Θ ( n 2 ) {\displaystyle \Theta \left(n^{2}\right)} memory, which is infeasible for high-dimensional functions such as the loss functions of neural nets, conditional random fields, and other statistical models with large numbers of parameters. For such situations, truncated-Newton and quasi-Newton algorithms have been developed. The latter family of algorithms use approximations to the Hessian; one of the most popular quasi-Newton algorithms is BFGS.

Such approximations may use the fact that an optimization algorithm uses the Hessian only as a linear operator $\mathbf {H} (\mathbf {v} ),$ and proceed by first noticing that the Hessian also appears in the local expansion of the gradient:
$$\nabla f(\mathbf {x} +\Delta \mathbf {x} )=\nabla f(\mathbf {x} )+\mathbf {H} (\mathbf {x} )\,\Delta \mathbf {x} +{\mathcal {O}}(\|\Delta \mathbf {x} \|^{2})
$$

Letting $\Delta \mathbf {x} =r\mathbf {v}$ for some scalar $r,$ this gives
$$\mathbf {H} (\mathbf {x} )\,\Delta \mathbf {x} =\mathbf {H} (\mathbf {x} )r\mathbf {v} =r\mathbf {H} (\mathbf {x} )\mathbf {v} =\nabla f(\mathbf {x} +r\mathbf {v} )-\nabla f(\mathbf {x} )+{\mathcal {O}}(r^{2}),
$$that is,
$$\mathbf {H} (\mathbf {x} )\mathbf {v} ={\frac {1}{r}}\left[\nabla f(\mathbf {x} +r\mathbf {v} )-\nabla f(\mathbf {x} )\right]+{\mathcal {O}}(r)
$$so if the gradient is already computed, the approximate Hessian can be computed by a linear (in the size of the gradient) number of scalar operations. (While simple to program, this approximation scheme is not numerically stable since $r$ has to be made small to prevent error due to the ${\mathcal {O}}(r)$ term, but decreasing it loses precision in the first term.)

Notably regarding Randomized Search Heuristics, the evolution strategy's covariance matrix adapts to the inverse of the Hessian matrix, up to a scalar factor and small random fluctuations. This result has been formally proven for a single-parent strategy and a static model, as the population size increases, relying on the quadratic approximation.


### Other applications

The Hessian matrix is commonly used for expressing image processing operators in image processing and computer vision (see the Laplacian of Gaussian (LoG) blob detector, the determinant of Hessian (DoH) blob detector and scale space). It can be used in normal mode analysis to calculate the different molecular frequencies in infrared spectroscopy. It can also be used in local sensitivity and statistical diagnostics.


## Generalizations


### Bordered Hessian

A bordered Hessian is used for the second-derivative test in certain constrained optimization problems. Given the function $f$ considered previously, but adding a constraint function $g$ such that $g(\mathbf {x} )=c,$ the bordered Hessian is the Hessian of the Lagrange function
$$\Lambda (\mathbf {x} ,\lambda )=f(\mathbf {x} )+\lambda [g(\mathbf {x} )-c]
$$:
$$\mathbf {H} (\Lambda )={\begin{bmatrix}{\dfrac {\partial ^{2}\Lambda }{\partial \lambda ^{2}}}&{\dfrac {\partial ^{2}\Lambda }{\partial \lambda \partial \mathbf {x} }}\\\left({\dfrac {\partial ^{2}\Lambda }{\partial \lambda \partial \mathbf {x} }}\right)^{\mathsf {T}}&{\dfrac {\partial ^{2}\Lambda }{\partial \mathbf {x} ^{2}}}\end{bmatrix}}={\begin{bmatrix}0&{\dfrac {\partial g}{\partial x_{1}}}&{\dfrac {\partial g}{\partial x_{2}}}&\cdots &{\dfrac {\partial g}{\partial x_{n}}}\\[2.2ex]{\dfrac {\partial g}{\partial x_{1}}}&{\dfrac {\partial ^{2}\Lambda }{\partial x_{1}^{2}}}&{\dfrac {\partial ^{2}\Lambda }{\partial x_{1}\,\partial x_{2}}}&\cdots &{\dfrac {\partial ^{2}\Lambda }{\partial x_{1}\,\partial x_{n}}}\\[2.2ex]{\dfrac {\partial g}{\partial x_{2}}}&{\dfrac {\partial ^{2}\Lambda }{\partial x_{2}\,\partial x_{1}}}&{\dfrac {\partial ^{2}\Lambda }{\partial x_{2}^{2}}}&\cdots &{\dfrac {\partial ^{2}\Lambda }{\partial x_{2}\,\partial x_{n}}}\\[2.2ex]\vdots &\vdots &\vdots &\ddots &\vdots \\[2.2ex]{\dfrac {\partial g}{\partial x_{n}}}&{\dfrac {\partial ^{2}\Lambda }{\partial x_{n}\,\partial x_{1}}}&{\dfrac {\partial ^{2}\Lambda }{\partial x_{n}\,\partial x_{2}}}&\cdots &{\dfrac {\partial ^{2}\Lambda }{\partial x_{n}^{2}}}\end{bmatrix}}={\begin{bmatrix}0&{\dfrac {\partial g}{\partial \mathbf {x} }}\\\left({\dfrac {\partial g}{\partial \mathbf {x} }}\right)^{\mathsf {T}}&{\dfrac {\partial ^{2}\Lambda }{\partial \mathbf {x} ^{2}}}\end{bmatrix}}
$$

If there are, say, $m$ constraints then the zero in the upper-left corner is an $m\times m$ block of zeros, and there are $m$ border rows at the top and $m$ border columns at the left.

The above rules stating that extrema are characterized (among critical points with a non-singular Hessian) by a positive-definite or negative-definite Hessian cannot apply here since a bordered Hessian can neither be negative-definite nor positive-definite, as
$$\mathbf {z} ^{\mathsf {T}}\mathbf {H} \mathbf {z} =0
$$if $\mathbf {z}$ is any vector whose sole non-zero entry is its first.

The second derivative test consists here of sign restrictions of the determinants of a certain set of $n-m$ submatrices of the bordered Hessian. Intuitively, the $m$ constraints can be thought of as reducing the problem to one with $n-m$ free variables. (For example, the maximization of $f\left(x_{1},x_{2},x_{3}\right)$ subject to the constraint $x_{1}+x_{2}+x_{3}=1$ can be reduced to the maximization of $f\left(x_{1},x_{2},1-x_{1}-x_{2}\right)$ without constraint.)

Specifically, sign conditions are imposed on the sequence of leading principal minors (determinants of upper-left-justified sub-matrices) of the bordered Hessian, for which the first $2m$ leading principal minors are neglected, the smallest minor consisting of the truncated first $2m+1$ rows and columns, the next consisting of the truncated first $2m+2$ rows and columns, and so on, with the last being the entire bordered Hessian; if $2m+1$ is larger than $n+m,$ then the smallest leading principal minor is the Hessian itself. There are thus $n-m$ minors to consider, each evaluated at the specific point being considered as a candidate maximum or minimum. A sufficient condition for a local maximum is that these minors alternate in sign with the smallest one having the sign of $(-1)^{m+1}.$ A sufficient condition for a local minimum is that all of these minors have the sign of $(-1)^{m}.$ (In the unconstrained case of $m=0$ these conditions coincide with the conditions for the unbordered Hessian to be negative definite or positive definite respectively).


### Vector-valued functions

If $f$ is instead a vector field $\mathbf {f} :\mathbb {R} ^{n}\to \mathbb {R} ^{m},$ that is,
$$\mathbf {f} (\mathbf {x} )=\left(f_{1}(\mathbf {x} ),f_{2}(\mathbf {x} ),\ldots ,f_{m}(\mathbf {x} )\right),
$$then the collection of second partial derivatives is not a $n\times n$ matrix, but rather a third-order tensor. This can be thought of as an array of $m$ Hessian matrices, one for each component of $\mathbf {f}$:
$$\mathbf {H} (\mathbf {f} )=\left(\mathbf {H} (f_{1}),\mathbf {H} (f_{2}),\ldots ,\mathbf {H} (f_{m})\right).
$$This tensor degenerates to the usual Hessian matrix when $m=1.$


### Generalization to the complex case

In the context of several complex variables, the Hessian may be generalized. Suppose $f\colon \mathbb {C} ^{n}\to \mathbb {C} ,$ and write $f\left(z_{1},\ldots ,z_{n}\right).$ Identifying ${\mathbb {C} }^{n}$ with ${\mathbb {R} }^{2n}$, the normal "real" Hessian is a $2n\times 2n$ matrix. As the object of study in several complex variables are holomorphic functions, that is, solutions to the n-dimensional Cauchy–Riemann conditions, we usually look on the part of the Hessian that contains information invariant under holomorphic changes of coordinates. This "part" is the so-called complex Hessian, which is the matrix
$$\left({\frac {\partial ^{2}f}{\partial z_{j}\partial {\bar {z}}_{k}}}\right)_{j,k}.
$$Note that if $f$ is holomorphic, then its complex Hessian matrix is identically zero, so the complex Hessian is used to study smooth but not holomorphic functions, see for example Levi pseudoconvexity. When dealing with holomorphic functions, we could consider the Hessian matrix
$$\left({\frac {\partial ^{2}f}{\partial z_{j}\partial z_{k}}}\right)_{j,k}.
$$


### Generalizations to Riemannian manifolds

Let $(M,g)$ be a Riemannian manifold and $\nabla$ its Levi-Civita connection. Let $f:M\to \mathbb {R}$ be a smooth function. Define the Hessian tensor by
$$\operatorname {Hess} (f)\in \Gamma \left(T^{*}M\otimes T^{*}M\right)\quad {\text{ by }}\quad \operatorname {Hess} (f):=\nabla \nabla f=\nabla df,
$$where this takes advantage of the fact that the first covariant derivative of a function is the same as its ordinary differential. Choosing local coordinates $\left\{x^{i}\right\}$ gives a local expression for the Hessian as
$$\operatorname {Hess} (f)=\nabla _{i}\,\partial _{j}f\ dx^{i}\!\otimes \!dx^{j}=\left({\frac {\partial ^{2}f}{\partial x^{i}\partial x^{j}}}-\Gamma _{ij}^{k}{\frac {\partial f}{\partial x^{k}}}\right)dx^{i}\otimes dx^{j}
$$where $\Gamma _{ij}^{k}$ are the Christoffel symbols of the connection. Other equivalent forms for the Hessian are given by
$$\operatorname {Hess} (f)(X,Y)=\langle \nabla _{X}\operatorname {grad} f,Y\rangle \quad {\text{ and }}\quad \operatorname {Hess} (f)(X,Y)=X(Yf)-df(\nabla _{X}Y).
$$


## See also


- Mathematics portal


- The determinant of the Hessian matrix is a covariant; see Invariant of a binary form
- Polarization identity, useful for rapid calculations involving Hessians.
- Jacobian matrix – Matrix of partial derivatives of a vector-valued functionPages displaying short descriptions of redirect targets
- Hessian equation


## Further reading


- Lewis, David W. (1991). Matrix Theory. Singapore: World Scientific. ISBN 978-981-02-0689-5.
- Magnus, Jan R.; Neudecker, Heinz (1999). "The Second Differential". Matrix Differential Calculus: With Applications in Statistics and Econometrics (Revised ed.). New York: Wiley. pp. 99–115. ISBN 0-471-98633-X.


## External links


- "Hessian of a function", Encyclopedia of Mathematics, EMS Press, 2001 [1994]
- Weisstein, Eric W. "Hessian". MathWorld.
