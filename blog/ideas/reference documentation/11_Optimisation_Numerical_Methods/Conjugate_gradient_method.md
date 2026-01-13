# Conjugate gradient method

In mathematics, the conjugate gradient method is an algorithm for the numerical solution of particular systems of linear equations, namely those whose matrix is positive-semidefinite. The conjugate gradient method is often implemented as an iterative algorithm, applicable to sparse systems that are too large to be handled by a direct implementation or other direct methods such as the Cholesky decomposition. Large sparse systems often arise when numerically solving partial differential equations or optimization problems.

The conjugate gradient method can also be used to solve unconstrained optimization problems such as energy minimization. It is commonly attributed to Magnus Hestenes and Eduard Stiefel, who programmed it on the Z4, and extensively researched it.

The biconjugate gradient method provides a generalization to non-symmetric matrices. Various nonlinear conjugate gradient methods seek minima of nonlinear optimization problems.


## Description of the problem addressed by conjugate gradients

Suppose we want to solve the system of linear equations

$\mathbf {A} \mathbf {x} =\mathbf {b}$

for the vector $\mathbf {x}$, where the known $n\times n$ matrix $\mathbf {A}$ is symmetric (i.e., $\mathbf {A} ^{\mathsf {T}}=\mathbf {A}$), positive-definite (i.e. $\mathbf {x} ^{\mathsf {T}}\mathbf {Ax} >0$ for all non-zero vectors $\mathbf {x}$ in $\mathbb {R} ^{n}$), and real, and $\mathbf {b}$ is known as well. We denote the unique solution of this system by $\mathbf {x} _{*}$.


## Derivation as a direct method

The conjugate gradient method can be derived from several different perspectives, including specialization of the conjugate direction method for optimization, and variation of the Arnoldi/Lanczos iteration for eigenvalue problems. Despite differences in their approaches, these derivations share a common topic—proving the orthogonality of the residuals and conjugacy of the search directions. These two properties are crucial to developing the well-known succinct formulation of the method.

We say that two non-zero vectors $\mathbf {u}$ and $\mathbf {v}$ are conjugate (with respect to $\mathbf {A}$) if


$$\mathbf {u} ^{\mathsf {T}}\mathbf {A} \mathbf {v} =0.
$$

Since $\mathbf {A}$ is symmetric and positive-definite, the left-hand side defines an inner product


$$\mathbf {u} ^{\mathsf {T}}\mathbf {A} \mathbf {v} =\langle \mathbf {u} ,\mathbf {v} \rangle _{\mathbf {A} }:=\langle \mathbf {A} \mathbf {u} ,\mathbf {v} \rangle =\langle \mathbf {u} ,\mathbf {A} ^{\mathsf {T}}\mathbf {v} \rangle =\langle \mathbf {u} ,\mathbf {A} \mathbf {v} \rangle .
$$

Two vectors are conjugate if and only if they are orthogonal with respect to this inner product. Being conjugate is a symmetric relation: if $\mathbf {u}$ is conjugate to $\mathbf {v}$, then $\mathbf {v}$ is conjugate to $\mathbf {u}$. Suppose that

$P=\{\mathbf {p} _{1},\dots ,\mathbf {p} _{n}\}$

is a set of $n$ mutually conjugate vectors with respect to $\mathbf {A}$, i.e.
$$\mathbf {p} _{i}^{\mathsf {T}}\mathbf {A} \mathbf {p} _{j}=0
$$for all $i\neq j$. Then $P$ forms a basis for $\mathbb {R} ^{n}$, and we may express the solution $\mathbf {x} _{*}$ of $\mathbf {Ax} =\mathbf {b}$ in this basis:


$$\mathbf {x} _{*}=\sum _{i=1}^{n}\alpha _{i}\mathbf {p} _{i}\Rightarrow \mathbf {A} \mathbf {x} _{*}=\sum _{i=1}^{n}\alpha _{i}\mathbf {A} \mathbf {p} _{i}.
$$

Left-multiplying the problem $\mathbf {Ax} =\mathbf {b}$ with the vector $\mathbf {p} _{k}^{\mathsf {T}}$ yields


$$\mathbf {p} _{k}^{\mathsf {T}}\mathbf {b} =\mathbf {p} _{k}^{\mathsf {T}}\mathbf {A} \mathbf {x} _{*}=\sum _{i=1}^{n}\alpha _{i}\mathbf {p} _{k}^{\mathsf {T}}\mathbf {A} \mathbf {p} _{i}=\sum _{i=1}^{n}\alpha _{i}\left\langle \mathbf {p} _{k},\mathbf {p} _{i}\right\rangle _{\mathbf {A} }=\alpha _{k}\left\langle \mathbf {p} _{k},\mathbf {p} _{k}\right\rangle _{\mathbf {A} }
$$


$$\alpha _{k}={\frac {\langle \mathbf {p} _{k},\mathbf {b} \rangle }{\langle \mathbf {p} _{k},\mathbf {p} _{k}\rangle _{\mathbf {A} }}}.
$$

This gives the following method for solving the equation $\mathbf {Ax} =\mathbf {b}$: find a sequence of $n$ conjugate directions, and then compute the coefficients $\alpha _{k}$.


## As an iterative method

If we choose the conjugate vectors $\mathbf {p} _{k}$ carefully, then we may not need all of them to obtain a good approximation to the solution $\mathbf {x} _{*}$. So, we want to regard the conjugate gradient method as an iterative method. This also allows us to approximately solve systems where $n$ is so large that the direct method would take too much time.

We denote the initial guess for $\mathbf {x} _{*}$ by $\mathbf {x} _{0}$ (we can assume without loss of generality that $\mathbf {x} _{0}=\mathbf {0}$, otherwise consider the system $\mathbf {Az} =\mathbf {b} -\mathbf {Ax} _{0}$ instead). Starting with $\mathbf {x} _{0}$ we search for the solution and in each iteration we need a metric to tell us whether we are closer to the solution $\mathbf {x} _{*}$ (that is unknown to us). This metric comes from the fact that the solution $\mathbf {x} _{*}$ is also the unique minimizer of the following quadratic function


$$f(\mathbf {x} )={\tfrac {1}{2}}\mathbf {x} ^{\mathsf {T}}\mathbf {A} \mathbf {x} -\mathbf {x} ^{\mathsf {T}}\mathbf {b} ,\qquad \mathbf {x} \in \mathbb {R} ^{n}\,.
$$

The existence of a unique minimizer is apparent as its Hessian matrix of second derivatives is symmetric positive-definite

$\mathbf {H} (f(\mathbf {x} ))=\mathbf {A} \,,$

and that the minimizer (use $Df(\mathbf {x} )=0$) solves the initial problem follows from its first derivative


$$\nabla f(\mathbf {x} )=\mathbf {A} \mathbf {x} -\mathbf {b} \,.
$$

This suggests taking the first basis vector $\mathbf {p} _{0}$ to be the negative of the gradient of $f$ at $\mathbf {x} =\mathbf {x} _{0}$. The gradient of $f$ equals $\mathbf {Ax} -\mathbf {b}$. Starting with an initial guess $\mathbf {x} _{0}$, this means we take $\mathbf {p} _{0}=\mathbf {b} -\mathbf {Ax} _{0}$. The other vectors in the basis will be conjugate to the gradient, hence the name conjugate gradient method. Note that $\mathbf {p} _{0}$ is also the residual provided by this initial step of the algorithm.

Let $\mathbf {r} _{k}$ be the residual at the $k$th step:

$\mathbf {r} _{k}=\mathbf {b} -\mathbf {Ax} _{k}.$

As observed above, $\mathbf {r} _{k}$ is the negative gradient of $f$ at $\mathbf {x} _{k}$, so the gradient descent method would require to move in the direction rk. Here, however, we insist that the directions $\mathbf {p} _{k}$ must be conjugate to each other. A practical way to enforce this is by requiring that the next search direction be built out of the current residual and all previous search directions. The conjugation constraint is an orthonormal-type constraint and hence the algorithm can be viewed as an example of Gram-Schmidt orthonormalization. This gives the following expression:


$$\mathbf {p} _{k}=\mathbf {r} _{k}-\sum _{i<k}{\frac {\mathbf {r} _{k}^{\mathsf {T}}\mathbf {A} \mathbf {p} _{i}}{\mathbf {p} _{i}^{\mathsf {T}}\mathbf {A} \mathbf {p} _{i}}}\mathbf {p} _{i}
$$

(see the picture at the top of the article for the effect of the conjugacy constraint on convergence). Following this direction, the next optimal location is given by


$$\mathbf {x} _{k+1}=\mathbf {x} _{k}+\alpha _{k}\mathbf {p} _{k}
$$


$$\alpha _{k}={\frac {\mathbf {p} _{k}^{\mathsf {T}}(\mathbf {b} -\mathbf {Ax} _{k})}{\mathbf {p} _{k}^{\mathsf {T}}\mathbf {A} \mathbf {p} _{k}}}={\frac {\mathbf {p} _{k}^{\mathsf {T}}\mathbf {r} _{k}}{\mathbf {p} _{k}^{\mathsf {T}}\mathbf {A} \mathbf {p} _{k}}},
$$

where the last equality follows from the definition of $\mathbf {r} _{k}$ . The expression for $\alpha _{k}$ can be derived if one substitutes the expression for xk+1 into f and minimizing it with respect to $\alpha _{k}$


$${\begin{aligned}f(\mathbf {x} _{k+1})&=f(\mathbf {x} _{k}+\alpha _{k}\mathbf {p} _{k})=:g(\alpha _{k})\\g'(\alpha _{k})&{\overset {!}{=}}0\quad \Rightarrow \quad \alpha _{k}={\frac {\mathbf {p} _{k}^{\mathsf {T}}(\mathbf {b} -\mathbf {Ax} _{k})}{\mathbf {p} _{k}^{\mathsf {T}}\mathbf {A} \mathbf {p} _{k}}}\,.\end{aligned}}
$$


### The resulting algorithm

The above algorithm gives the most straightforward explanation of the conjugate gradient method. Seemingly, the algorithm as stated requires storage of all previous searching directions and residue vectors, as well as many matrix–vector multiplications, and thus can be computationally expensive. However, a closer analysis of the algorithm shows that $\mathbf {r} _{i}$ is orthogonal to $\mathbf {r} _{j}$, i.e. $\mathbf {r} _{i}^{\mathsf {T}}\mathbf {r} _{j}=0$, for $i\neq j$. And $\mathbf {p} _{i}$ is $\mathbf {A}$-orthogonal to $\mathbf {p} _{j}$, i.e.
$$\mathbf {p} _{i}^{\mathsf {T}}\mathbf {A} \mathbf {p} _{j}=0
$$, for $i\neq j$. This can be regarded that as the algorithm progresses, $\mathbf {p} _{i}$ and $\mathbf {r} _{i}$ span the same Krylov subspace, where $\mathbf {r} _{i}$ form the orthogonal basis with respect to the standard inner product, and $\mathbf {p} _{i}$ form the orthogonal basis with respect to the inner product induced by $\mathbf {A}$. Therefore, $\mathbf {x} _{k}$ can be regarded as the projection of $\mathbf {x}$ on the Krylov subspace.

That is, if the CG method starts with $\mathbf {x} _{0}=0$, then
$$x_{k}=\mathrm {argmin} _{y\in \mathbb {R} ^{n}}{\left\{(x-y)^{\top }A(x-y):y\in \operatorname {span} \left\{b,Ab,\ldots ,A^{k-1}b\right\}\right\}}
$$The algorithm is detailed below for solving $\mathbf {A} \mathbf {x} =\mathbf {b}$ where $\mathbf {A}$ is a real, symmetric, positive-definite matrix. The input vector $\mathbf {x} _{0}$ can be an approximate initial solution or $\mathbf {0}$. It is a different formulation of the exact procedure described above.


$${\begin{aligned}&\mathbf {r} _{0}:=\mathbf {b} -\mathbf {Ax} _{0}\\&{\hbox{if }}\mathbf {r} _{0}{\text{ is sufficiently small, then return }}\mathbf {x} _{0}{\text{ as the result}}\\&\mathbf {p} _{0}:=\mathbf {r} _{0}\\&k:=0\\&{\text{repeat}}\\&\qquad \alpha _{k}:={\frac {\mathbf {r} _{k}^{\mathsf {T}}\mathbf {r} _{k}}{\mathbf {p} _{k}^{\mathsf {T}}\mathbf {Ap} _{k}}}\\&\qquad \mathbf {x} _{k+1}:=\mathbf {x} _{k}+\alpha _{k}\mathbf {p} _{k}\\&\qquad \mathbf {r} _{k+1}:=\mathbf {r} _{k}-\alpha _{k}\mathbf {Ap} _{k}\\&\qquad {\hbox{if }}\mathbf {r} _{k+1}{\text{ is sufficiently small, then exit loop}}\\&\qquad \beta _{k}:={\frac {\mathbf {r} _{k+1}^{\mathsf {T}}\mathbf {r} _{k+1}}{\mathbf {r} _{k}^{\mathsf {T}}\mathbf {r} _{k}}}\\&\qquad \mathbf {p} _{k+1}:=\mathbf {r} _{k+1}+\beta _{k}\mathbf {p} _{k}\\&\qquad k:=k+1\\&{\text{end repeat}}\\&{\text{return }}\mathbf {x} _{k+1}{\text{ as the result}}\end{aligned}}
$$

This is the most commonly used algorithm. The same formula for $\beta _{k}$ is also used in the Fletcher–Reeves nonlinear conjugate gradient method.


#### Restarts

We note that $\mathbf {x} _{1}$ is computed by the gradient descent method applied to $\mathbf {x} _{0}$. Setting $\beta _{k}=0$ would similarly make $\mathbf {x} _{k+1}$ computed by the gradient descent method from $\mathbf {x} _{k}$, i.e., can be used as a simple implementation of a restart of the conjugate gradient iterations. Restarts could slow down convergence, but may improve stability if the conjugate gradient method misbehaves, e.g., due to round-off error.


#### Explicit residual calculation

The formulas
$$\mathbf {x} _{k+1}:=\mathbf {x} _{k}+\alpha _{k}\mathbf {p} _{k}
$$and $\mathbf {r} _{k}:=\mathbf {b} -\mathbf {Ax} _{k}$, which both hold in exact arithmetic, make the formulas
$$\mathbf {r} _{k+1}:=\mathbf {r} _{k}-\alpha _{k}\mathbf {Ap} _{k}
$$and
$$\mathbf {r} _{k+1}:=\mathbf {b} -\mathbf {Ax} _{k+1}
$$mathematically equivalent. The former is used in the algorithm to avoid an extra multiplication by $\mathbf {A}$ since the vector $\mathbf {Ap} _{k}$ is already computed to evaluate $\alpha _{k}$. The latter may be more accurate, substituting the explicit calculation
$$\mathbf {r} _{k+1}:=\mathbf {b} -\mathbf {Ax} _{k+1}
$$for the implicit one by the recursion subject to round-off error accumulation, and is thus recommended for an occasional evaluation.

A norm of the residual is typically used for stopping criteria. The norm of the explicit residual
$$\mathbf {r} _{k+1}:=\mathbf {b} -\mathbf {Ax} _{k+1}
$$provides a guaranteed level of accuracy both in exact arithmetic and in the presence of the rounding errors, where convergence naturally stagnates. In contrast, the implicit residual
$$\mathbf {r} _{k+1}:=\mathbf {r} _{k}-\alpha _{k}\mathbf {Ap} _{k}
$$is known to keep getting smaller in amplitude well below the level of rounding errors and thus cannot be used to determine the stagnation of convergence.


#### Computation of alpha and beta

In the algorithm, $\alpha _{k}$ is chosen such that $\mathbf {r} _{k+1}$ is orthogonal to $\mathbf {r} _{k}$. The denominator is simplified from


$$\alpha _{k}={\frac {\mathbf {r} _{k}^{\mathsf {T}}\mathbf {r} _{k}}{\mathbf {r} _{k}^{\mathsf {T}}\mathbf {A} \mathbf {p} _{k}}}={\frac {\mathbf {r} _{k}^{\mathsf {T}}\mathbf {r} _{k}}{\mathbf {p} _{k}^{\mathsf {T}}\mathbf {Ap} _{k}}}
$$

since
$$\mathbf {r} _{k+1}=\mathbf {p} _{k+1}-\mathbf {\beta } _{k}\mathbf {p} _{k}
$$. The $\beta _{k}$ is chosen such that $\mathbf {p} _{k+1}$ is conjugate to $\mathbf {p} _{k}$. Initially, $\beta _{k}$ is


$$\beta _{k}=-{\frac {\mathbf {r} _{k+1}^{\mathsf {T}}\mathbf {A} \mathbf {p} _{k}}{\mathbf {p} _{k}^{\mathsf {T}}\mathbf {A} \mathbf {p} _{k}}}
$$


$$\mathbf {r} _{k+1}=\mathbf {r} _{k}-\alpha _{k}\mathbf {A} \mathbf {p} _{k}
$$

and equivalently


$$\mathbf {A} \mathbf {p} _{k}={\frac {1}{\alpha _{k}}}(\mathbf {r} _{k}-\mathbf {r} _{k+1}),
$$

the numerator of $\beta _{k}$ is rewritten as


$$\mathbf {r} _{k+1}^{\mathsf {T}}\mathbf {A} \mathbf {p} _{k}={\frac {1}{\alpha _{k}}}\mathbf {r} _{k+1}^{\mathsf {T}}(\mathbf {r} _{k}-\mathbf {r} _{k+1})=-{\frac {1}{\alpha _{k}}}\mathbf {r} _{k+1}^{\mathsf {T}}\mathbf {r} _{k+1}
$$

because $\mathbf {r} _{k+1}$ and $\mathbf {r} _{k}$ are orthogonal by design. The denominator is rewritten as


$$\mathbf {p} _{k}^{\mathsf {T}}\mathbf {A} \mathbf {p} _{k}=(\mathbf {r} _{k}+\beta _{k-1}\mathbf {p} _{k-1})^{\mathsf {T}}\mathbf {A} \mathbf {p} _{k}={\frac {1}{\alpha _{k}}}\mathbf {r} _{k}^{\mathsf {T}}(\mathbf {r} _{k}-\mathbf {r} _{k+1})={\frac {1}{\alpha _{k}}}\mathbf {r} _{k}^{\mathsf {T}}\mathbf {r} _{k}
$$

using that the search directions $\mathbf {p} _{k}$ are conjugated and again that the residuals are orthogonal. This gives the $\beta$ in the algorithm after cancelling $\alpha _{k}$.


#### Example code in Julia (programming language)


#### Example code in MATLAB


### Numerical example

Consider the linear system Ax = b given by


$$\mathbf {A} \mathbf {x} ={\begin{bmatrix}4&1\\1&3\end{bmatrix}}{\begin{bmatrix}x_{1}\\x_{2}\end{bmatrix}}={\begin{bmatrix}1\\2\end{bmatrix}},
$$

we will perform two steps of the conjugate gradient method beginning with the initial guess


$$\mathbf {x} _{0}={\begin{bmatrix}2\\1\end{bmatrix}}
$$

in order to find an approximate solution to the system.


#### Solution

For reference, the exact solution is


$$\mathbf {x} ={\begin{bmatrix}{\frac {1}{11}}\\\\{\frac {7}{11}}\end{bmatrix}}\approx {\begin{bmatrix}0.0909\\\\0.6364\end{bmatrix}}
$$

Our first step is to calculate the residual vector r0 associated with x0. This residual is computed from the formula r0 = b - Ax0, and in our case is equal to


$$\mathbf {r} _{0}={\begin{bmatrix}1\\2\end{bmatrix}}-{\begin{bmatrix}4&1\\1&3\end{bmatrix}}{\begin{bmatrix}2\\1\end{bmatrix}}={\begin{bmatrix}-8\\-3\end{bmatrix}}=\mathbf {p} _{0}.
$$

Since this is the first iteration, we will use the residual vector r0 as our initial search direction p0; the method of selecting pk will change in further iterations.

We now compute the scalar α0 using the relationship


$$\alpha _{0}={\frac {\mathbf {r} _{0}^{\mathsf {T}}\mathbf {r} _{0}}{\mathbf {p} _{0}^{\mathsf {T}}\mathbf {Ap} _{0}}}={\frac {{\begin{bmatrix}-8&-3\end{bmatrix}}{\begin{bmatrix}-8\\-3\end{bmatrix}}}{{\begin{bmatrix}-8&-3\end{bmatrix}}{\begin{bmatrix}4&1\\1&3\end{bmatrix}}{\begin{bmatrix}-8\\-3\end{bmatrix}}}}={\frac {73}{331}}\approx 0.2205
$$

We can now compute x1 using the formula


$$\mathbf {x} _{1}=\mathbf {x} _{0}+\alpha _{0}\mathbf {p} _{0}={\begin{bmatrix}2\\1\end{bmatrix}}+{\frac {73}{331}}{\begin{bmatrix}-8\\-3\end{bmatrix}}\approx {\begin{bmatrix}0.2356\\0.3384\end{bmatrix}}.
$$

This result completes the first iteration, the result being an "improved" approximate solution to the system, x1. We may now move on and compute the next residual vector r1 using the formula


$$\mathbf {r} _{1}=\mathbf {r} _{0}-\alpha _{0}\mathbf {A} \mathbf {p} _{0}={\begin{bmatrix}-8\\-3\end{bmatrix}}-{\frac {73}{331}}{\begin{bmatrix}4&1\\1&3\end{bmatrix}}{\begin{bmatrix}-8\\-3\end{bmatrix}}\approx {\begin{bmatrix}-0.2810\\0.7492\end{bmatrix}}.
$$

Our next step in the process is to compute the scalar β0 that will eventually be used to determine the next search direction p1.


$$\beta _{0}={\frac {\mathbf {r} _{1}^{\mathsf {T}}\mathbf {r} _{1}}{\mathbf {r} _{0}^{\mathsf {T}}\mathbf {r} _{0}}}\approx {\frac {{\begin{bmatrix}-0.2810&0.7492\end{bmatrix}}{\begin{bmatrix}-0.2810\\0.7492\end{bmatrix}}}{{\begin{bmatrix}-8&-3\end{bmatrix}}{\begin{bmatrix}-8\\-3\end{bmatrix}}}}=0.0088.
$$

Now, using this scalar β0, we can compute the next search direction p1 using the relationship


$$\mathbf {p} _{1}=\mathbf {r} _{1}+\beta _{0}\mathbf {p} _{0}\approx {\begin{bmatrix}-0.2810\\0.7492\end{bmatrix}}+0.0088{\begin{bmatrix}-8\\-3\end{bmatrix}}={\begin{bmatrix}-0.3511\\0.7229\end{bmatrix}}.
$$

We now compute the scalar α1 using our newly acquired p1 using the same method as that used for α0.


$$\alpha _{1}={\frac {\mathbf {r} _{1}^{\mathsf {T}}\mathbf {r} _{1}}{\mathbf {p} _{1}^{\mathsf {T}}\mathbf {Ap} _{1}}}\approx {\frac {{\begin{bmatrix}-0.2810&0.7492\end{bmatrix}}{\begin{bmatrix}-0.2810\\0.7492\end{bmatrix}}}{{\begin{bmatrix}-0.3511&0.7229\end{bmatrix}}{\begin{bmatrix}4&1\\1&3\end{bmatrix}}{\begin{bmatrix}-0.3511\\0.7229\end{bmatrix}}}}=0.4122.
$$

Finally, we find x2 using the same method as that used to find x1.


$$\mathbf {x} _{2}=\mathbf {x} _{1}+\alpha _{1}\mathbf {p} _{1}\approx {\begin{bmatrix}0.2356\\0.3384\end{bmatrix}}+0.4122{\begin{bmatrix}-0.3511\\0.7229\end{bmatrix}}={\begin{bmatrix}0.0909\\0.6364\end{bmatrix}}.
$$

The result, x2, is a "better" approximation to the system's solution than x1 and x0. If exact arithmetic were to be used in this example instead of limited-precision, then the exact solution would theoretically have been reached after n = 2 iterations (n being the order of the system).


## Finite Termination Property

Under exact arithmetic, the number of iterations required is no more than the order of the matrix. This behavior is known as the finite termination property of the conjugate gradient method. It refers to the method's ability to reach the exact solution of a linear system in a finite number of steps—at most equal to the dimension of the system—when exact arithmetic is used. This property arises from the fact that, at each iteration, the method generates a residual vector that is orthogonal to all previous residuals. These residuals form a mutually orthogonal set.

In an n-dimensional space, it is impossible to construct more than n linearly independent and mutually orthogonal vectors unless one of them is the zero vector. Therefore, once a zero residual appears, the method has reached the solution and must terminate. This ensures that the conjugate gradient method converges in at most n steps.

To demonstrate this, consider the system:


$$A={\begin{bmatrix}3&-2\\-2&4\end{bmatrix}},\quad \mathbf {b} ={\begin{bmatrix}1\\1\end{bmatrix}}
$$

We start from an initial guess
$$\mathbf {x} _{0}={\begin{bmatrix}1\\2\end{bmatrix}}
$$. Since $A$ is symmetric positive-definite and the system is 2-dimensional, the conjugate gradient method should find the exact solution in no more than 2 steps. The following MATLAB code demonstrates this behavior:

The output confirms that the method reaches
$${\begin{bmatrix}1\\1\end{bmatrix}}
$$after two iterations, consistent with the theoretical prediction. This example illustrates how the conjugate gradient method behaves as a direct method under idealized conditions.


### Application to Sparse Systems

The finite termination property also has practical implications in solving large sparse systems, which frequently arise in scientific and engineering applications. For instance, discretizing the two-dimensional Laplace equation $\nabla ^{2}u=0$ using finite differences on a uniform grid leads to a sparse linear system $A\mathbf {x} =\mathbf {b}$, where $A$ is symmetric and positive definite.

Using a $5\times 5$ interior grid yields a $25\times 25$ system, and the coefficient matrix $A$ has a five-point stencil pattern. Each row of $A$ contains at most five nonzero entries corresponding to the central point and its immediate neighbors. For example, the matrix generated from such a grid may look like:


$$A={\begin{bmatrix}4&-1&0&\cdots &-1&0&\cdots \\-1&4&-1&\cdots &0&0&\cdots \\0&-1&4&-1&0&0&\cdots \\\vdots &\vdots &\ddots &\ddots &\ddots &\vdots \\-1&0&\cdots &-1&4&-1&\cdots \\0&0&\cdots &0&-1&4&\cdots \\\vdots &\vdots &\cdots &\cdots &\cdots &\ddots \end{bmatrix}}
$$

Although the system dimension is 25, the conjugate gradient method is theoretically guaranteed to terminate in at most 25 iterations under exact arithmetic. In practice, convergence often occurs in far fewer steps due to the matrix's spectral properties. This efficiency makes CGM particularly attractive for solving large-scale systems arising from partial differential equations, such as those found in heat conduction, fluid dynamics, and electrostatics.


## Convergence properties

The conjugate gradient method can theoretically be viewed as a direct method, as in the absence of round-off error it produces the exact solution after a finite number of iterations, which is not larger than the size of the matrix. In practice, the exact solution is never obtained since the conjugate gradient method is unstable with respect to even small perturbations, e.g., most directions are not in practice conjugate, due to a degenerative nature of generating the Krylov subspaces.

As an iterative method, the conjugate gradient method monotonically (in the energy norm) improves approximations $\mathbf {x} _{k}$ to the exact solution and may reach the required tolerance after a relatively small (compared to the problem size) number of iterations. The improvement is typically linear and its speed is determined by the condition number $\kappa (A)$ of the system matrix $A$: the larger $\kappa (A)$ is, the slower the improvement.

However, an interesting case appears when the eigenvalues are spaced logarithmically for a large symmetric matrix. For example, let $A=QDQ^{T}$ where $Q$ is a random orthogonal matrix and $D$ is a diagonal matrix with eigenvalues ranging from $\lambda _{n}=1$ to $\lambda _{1}=10^{6}$, spaced logarithmically. Despite the finite termination property of CGM, where the exact solution should theoretically be reached in at most $n$ steps, the method may exhibit stagnation in convergence. In such a scenario, even after many more iterations—e.g., ten times the matrix size—the error may only decrease modestly (e.g., to $10^{-5}$). Moreover, the iterative error may oscillate significantly, making it unreliable as a stopping condition. This poor convergence is not explained by the condition number alone (e.g., $\kappa _{2}(A)=10^{6}$), but rather by the eigenvalue distribution itself. When the eigenvalues are more evenly spaced or randomly distributed, such convergence issues are typically absent, highlighting that CGM performance depends not only on $\kappa (A)$ but also on how the eigenvalues are distributed.

If $\kappa (A)$ is large, preconditioning is commonly used to replace the original system $\mathbf {Ax} -\mathbf {b} =0$ with $\mathbf {M} ^{-1}(\mathbf {Ax} -\mathbf {b} )=0$ such that $\kappa (\mathbf {M} ^{-1}\mathbf {A} )$ is smaller than $\kappa (\mathbf {A} )$, see below.


### Convergence theorem

Define a subset of polynomials as


$$\Pi _{k}^{*}:=\left\lbrace \ p\in \Pi _{k}\ :\ p(0)=1\ \right\rbrace \,,
$$

where $\Pi _{k}$ is the set of polynomials of maximal degree $k$.

Let $\left(\mathbf {x} _{k}\right)_{k}$ be the iterative approximations of the exact solution $\mathbf {x} _{*}$, and define the errors as
$$\mathbf {e} _{k}:=\mathbf {x} _{k}-\mathbf {x} _{*}
$$. Now, the rate of convergence can be approximated as


$${\begin{aligned}\left\|\mathbf {e} _{k}\right\|_{\mathbf {A} }&=\min _{p\in \Pi _{k}^{*}}\left\|p(\mathbf {A} )\mathbf {e} _{0}\right\|_{\mathbf {A} }\\&\leq \min _{p\in \Pi _{k}^{*}}\,\max _{\lambda \in \sigma (\mathbf {A} )}|p(\lambda )|\ \left\|\mathbf {e} _{0}\right\|_{\mathbf {A} }\\&\leq 2\left({\frac {{\sqrt {\kappa (\mathbf {A} )}}-1}{{\sqrt {\kappa (\mathbf {A} )}}+1}}\right)^{k}\ \left\|\mathbf {e} _{0}\right\|_{\mathbf {A} }\\&\leq 2\exp \left({\frac {-2k}{\sqrt {\kappa (\mathbf {A} )}}}\right)\ \left\|\mathbf {e} _{0}\right\|_{\mathbf {A} }\,,\end{aligned}}
$$

where $\sigma (\mathbf {A} )$ denotes the spectrum, and $\kappa (\mathbf {A} )$ denotes the condition number.

This shows
$$k={\tfrac {1}{2}}{\sqrt {\kappa (\mathbf {A} )}}\log \left(\left\|\mathbf {e} _{0}\right\|_{\mathbf {A} }\varepsilon ^{-1}\right)
$$iterations suffices to reduce the error to $2\varepsilon$ for any $\varepsilon >0$.

Note, the important limit when $\kappa (\mathbf {A} )$ tends to $\infty$


$${\frac {{\sqrt {\kappa (\mathbf {A} )}}-1}{{\sqrt {\kappa (\mathbf {A} )}}+1}}\approx 1-{\frac {2}{\sqrt {\kappa (\mathbf {A} )}}}\quad {\text{for}}\quad \kappa (\mathbf {A} )\gg 1\,.
$$

This limit shows a faster convergence rate compared to the iterative methods of Jacobi or Gauss–Seidel which scale as
$$\approx 1-{\frac {2}{\kappa (\mathbf {A} )}}
$$.

No round-off error is assumed in the convergence theorem, but the convergence bound is commonly valid in practice as theoretically explained by Anne Greenbaum.


### Practical convergence

If initialized randomly, the first stage of iterations is often the fastest, as the error is eliminated within the Krylov subspace that initially reflects a smaller effective condition number. The second stage of convergence is typically well defined by the theoretical convergence bound with ${\textstyle {\sqrt {\kappa (\mathbf {A} )}}}$, but may be super-linear, depending on a distribution of the spectrum of the matrix $A$ and the spectral distribution of the error. In the last stage, the smallest attainable accuracy is reached and the convergence stalls or the method may even start diverging. In typical scientific computing applications in double-precision floating-point format for matrices of large sizes, the conjugate gradient method uses a stopping criterion with a tolerance that terminates the iterations during the first or second stage.


## The preconditioned conjugate gradient method

In most cases, preconditioning is necessary to ensure fast convergence of the conjugate gradient method. If $\mathbf {M} ^{-1}$ is symmetric positive-definite and $\mathbf {M} ^{-1}\mathbf {A}$ has a better condition number than $\mathbf {A} ,$ a preconditioned conjugate gradient method can be used. It takes the following form:

$\mathbf {r} _{0}:=\mathbf {b} -\mathbf {Ax} _{0}$


$${\textrm {Solve:}}\mathbf {M} \mathbf {z} _{0}:=\mathbf {r} _{0}
$$

$\mathbf {p} _{0}:=\mathbf {z} _{0}$

$k:=0\,$

repeat α k := r k T z k p k T A p k {\displaystyle \alpha _{k}:={\frac {\mathbf {r} _{k}^{\mathsf {T}}\mathbf {z} _{k}}{\mathbf {p} _{k}^{\mathsf {T}}\mathbf {Ap} _{k}}}} x k + 1 := x k + α k p k {\displaystyle \mathbf {x} _{k+1}:=\mathbf {x} _{k}+\alpha _{k}\mathbf {p} _{k}} r k + 1 := r k − α k A p k {\displaystyle \mathbf {r} _{k+1}:=\mathbf {r} _{k}-\alpha _{k}\mathbf {Ap} _{k}} if rk+1 is sufficiently small then exit loop end if S o l v e M z k + 1 := r k + 1 {\displaystyle \mathrm {Solve} \ \mathbf {M} \mathbf {z} _{k+1}:=\mathbf {r} _{k+1}} β k := r k + 1 T z k + 1 r k T z k {\displaystyle \beta _{k}:={\frac {\mathbf {r} _{k+1}^{\mathsf {T}}\mathbf {z} _{k+1}}{\mathbf {r} _{k}^{\mathsf {T}}\mathbf {z} _{k}}}} p k + 1 := z k + 1 + β k p k {\displaystyle \mathbf {p} _{k+1}:=\mathbf {z} _{k+1}+\beta _{k}\mathbf {p} _{k}} k := k + 1 {\displaystyle k:=k+1\,}


$$\alpha _{k}:={\frac {\mathbf {r} _{k}^{\mathsf {T}}\mathbf {z} _{k}}{\mathbf {p} _{k}^{\mathsf {T}}\mathbf {Ap} _{k}}}
$$


$$\mathbf {x} _{k+1}:=\mathbf {x} _{k}+\alpha _{k}\mathbf {p} _{k}
$$


$$\mathbf {r} _{k+1}:=\mathbf {r} _{k}-\alpha _{k}\mathbf {Ap} _{k}
$$

if rk+1 is sufficiently small then exit loop end if


$$\mathrm {Solve} \ \mathbf {M} \mathbf {z} _{k+1}:=\mathbf {r} _{k+1}
$$


$$\beta _{k}:={\frac {\mathbf {r} _{k+1}^{\mathsf {T}}\mathbf {z} _{k+1}}{\mathbf {r} _{k}^{\mathsf {T}}\mathbf {z} _{k}}}
$$


$$\mathbf {p} _{k+1}:=\mathbf {z} _{k+1}+\beta _{k}\mathbf {p} _{k}
$$

$k:=k+1\,$

end repeat

The result is xk+1

The above formulation is equivalent to applying the regular conjugate gradient method to the preconditioned system


$$\mathbf {E} ^{-1}\mathbf {A} (\mathbf {E} ^{-1})^{\mathsf {T}}\mathbf {\hat {x}} =\mathbf {E} ^{-1}\mathbf {b}
$$


$$\mathbf {EE} ^{\mathsf {T}}=\mathbf {M} ,\qquad \mathbf {\hat {x}} =\mathbf {E} ^{\mathsf {T}}\mathbf {x} .
$$

The Cholesky decomposition of the preconditioner must be used to keep the symmetry (and positive definiteness) of the system. However, this decomposition does not need to be computed, and it is sufficient to know $\mathbf {M} ^{-1}$. It can be shown that
$$\mathbf {E} ^{-1}\mathbf {A} (\mathbf {E} ^{-1})^{\mathsf {T}}
$$has the same spectrum as $\mathbf {M} ^{-1}\mathbf {A}$.

The preconditioner matrix $\mathbf {M}$ has to be symmetric positive-definite and fixed, i.e., cannot change from iteration to iteration. If any of these assumptions on the preconditioner is violated, the behavior of the preconditioned conjugate gradient method may become unpredictable.

An example of a commonly used preconditioner is the incomplete Cholesky factorization.


### Using the preconditioner in practice

It is important to keep in mind that we don't want to invert the matrix $\mathbf {M}$ explicitly in order to get $\mathbf {M} ^{-1}$ for use it in the process, since inverting $\mathbf {M}$ would take more time/computational resources than solving the conjugate gradient algorithm itself. As an example, let's say that we are using a preconditioner coming from incomplete Cholesky factorization. The resulting matrix is the lower triangular matrix $\mathbf {L}$, and the preconditioner matrix is:

$\mathbf {M} =\mathbf {LL} ^{\mathsf {T}}$

Then we have to solve:

$\mathbf {Mz} =\mathbf {r}$

$\mathbf {z} =\mathbf {M} ^{-1}\mathbf {r}$


$$\mathbf {M} ^{-1}=(\mathbf {L} ^{-1})^{\mathsf {T}}\mathbf {L} ^{-1}
$$


$$\mathbf {z} =(\mathbf {L} ^{-1})^{\mathsf {T}}\mathbf {L} ^{-1}\mathbf {r}
$$

Let's take an intermediary vector $\mathbf {a}$:

$\mathbf {a} =\mathbf {L} ^{-1}\mathbf {r}$

$\mathbf {r} =\mathbf {L} \mathbf {a}$

Since $\mathbf {r}$ and $\mathbf {L}$ and known, and $\mathbf {L}$ is lower triangular, solving for $\mathbf {a}$ is easy and computationally cheap by using forward substitution. Then, we substitute $\mathbf {a}$ in the original equation:


$$\mathbf {z} =(\mathbf {L} ^{-1})^{\mathsf {T}}\mathbf {a}
$$

$\mathbf {a} =\mathbf {L} ^{\mathsf {T}}\mathbf {z}$

Since $\mathbf {a}$ and $\mathbf {L} ^{\mathsf {T}}$ are known, and $\mathbf {L} ^{\mathsf {T}}$ is upper triangular, solving for $\mathbf {z}$ is easy and computationally cheap by using backward substitution.

Using this method, there is no need to invert $\mathbf {M}$ or $\mathbf {L}$ explicitly at all, and we still obtain $\mathbf {z}$.


## The flexible preconditioned conjugate gradient method

In numerically challenging applications, sophisticated preconditioners are used, which may lead to variable preconditioning, changing between iterations. Even if the preconditioner is symmetric positive-definite on every iteration, the fact that it may change makes the arguments above invalid, and in practical tests leads to a significant slow down of the convergence of the algorithm presented above. Using the Polak–Ribière formula


$$\beta _{k}:={\frac {\mathbf {r} _{k+1}^{\mathsf {T}}\left(\mathbf {z} _{k+1}-\mathbf {z} _{k}\right)}{\mathbf {r} _{k}^{\mathsf {T}}\mathbf {z} _{k}}}
$$

instead of the Fletcher–Reeves formula


$$\beta _{k}:={\frac {\mathbf {r} _{k+1}^{\mathsf {T}}\mathbf {z} _{k+1}}{\mathbf {r} _{k}^{\mathsf {T}}\mathbf {z} _{k}}}
$$

may dramatically improve the convergence in this case. This version of the preconditioned conjugate gradient method can be called flexible, as it allows for variable preconditioning. The flexible version is also shown to be robust even if the preconditioner is not symmetric positive definite (SPD).

The implementation of the flexible version requires storing an extra vector. For a fixed SPD preconditioner,
$$\mathbf {r} _{k+1}^{\mathsf {T}}\mathbf {z} _{k}=0,
$$so both formulas for βk are equivalent in exact arithmetic, i.e., without the round-off error.

The mathematical explanation of the better convergence behavior of the method with the Polak–Ribière formula is that the method is locally optimal in this case, in particular, it does not converge slower than the locally optimal steepest descent method.


## Vs. the locally optimal steepest descent method

In both the original and the preconditioned conjugate gradient methods one only needs to set $\beta _{k}:=0$ in order to make them locally optimal, using the line search, steepest descent methods. With this substitution, vectors p are always the same as vectors z, so there is no need to store vectors p. Thus, every iteration of these steepest descent methods is a bit cheaper compared to that for the conjugate gradient methods. However, the latter converge faster, unless a (highly) variable and/or non-SPD preconditioner is used, see above.


## Conjugate gradient method as optimal feedback controller for double integrator

The conjugate gradient method can also be derived using optimal control theory. In this approach, the conjugate gradient method falls out as an optimal feedback controller,$u=k(x,v):=-\gamma _{a}\nabla f(x)-\gamma _{b}v$ for the double integrator system,${\dot {x}}=v,\quad {\dot {v}}=u$ The quantities $\gamma _{a}$ and $\gamma _{b}$ are variable feedback gains.


## Conjugate gradient on the normal equations

The conjugate gradient method can be applied to an arbitrary n-by-m matrix by applying it to normal equations AA and right-hand side vector Ab, since AA is a symmetric positive-semidefinite matrix for any A. The result is conjugate gradient on the normal equations (CGN or CGNR).

AAx = Ab

As an iterative method, it is not necessary to form AA explicitly in memory but only to perform the matrix–vector and transpose matrix–vector multiplications. Therefore, CGNR is particularly useful when A is a sparse matrix since these operations are usually extremely efficient. However the downside of forming the normal equations is that the condition number κ(AA) is equal to κ(A) and so the rate of convergence of CGNR may be slow and the quality of the approximate solution may be sensitive to roundoff errors. Finding a good preconditioner is often an important part of using the CGNR method.

Several algorithms have been proposed (e.g., CGLS, LSQR). The LSQR algorithm purportedly has the best numerical stability when A is ill-conditioned, i.e., A has a large condition number.


## Conjugate gradient method for complex Hermitian matrices

The conjugate gradient method with a trivial modification is extendable to solving, given complex-valued matrix A and vector b, the system of linear equations $\mathbf {A} \mathbf {x} =\mathbf {b}$ for the complex-valued vector x, where A is Hermitian (i.e., A' = A) and positive-definite matrix, and the symbol ' denotes the conjugate transpose. The trivial modification is simply substituting the conjugate transpose for the real transpose everywhere.


## Advantages and disadvantages

The advantages and disadvantages of the conjugate gradient methods are summarized in the lecture notes by Nemirovsky and BenTal.


### A pathological example

This example is from Let ${\textstyle t\in (0,1)}$, and define
$$W={\begin{bmatrix}t&{\sqrt {t}}&&&&\\{\sqrt {t}}&1+t&{\sqrt {t}}&&&\\&{\sqrt {t}}&1+t&{\sqrt {t}}&&\\&&{\sqrt {t}}&\ddots &\ddots &\\&&&\ddots &&\\&&&&&{\sqrt {t}}\\&&&&{\sqrt {t}}&1+t\end{bmatrix}},\quad b={\begin{bmatrix}1\\0\\\vdots \\0\end{bmatrix}}
$$Since $W$ is invertible, there exists a unique solution to ${\textstyle Wx=b}$. Solving it by conjugate gradient descent gives us rather bad convergence:
$$\|b-Wx_{k}\|^{2}=(1/t)^{k},\quad \|b-Wx_{n}\|^{2}=0
$$In words, during the CG process, the error grows exponentially, until it suddenly becomes zero as the unique solution is found.


## See also


## Further reading


- Atkinson, Kendell A. (1988). "Section 8.9". An introduction to numerical analysis (2nd ed.). John Wiley and Sons. ISBN 978-0-471-50023-0.
- Avriel, Mordecai (2003). Nonlinear Programming: Analysis and Methods. Dover Publishing. ISBN 978-0-486-43227-4.
- Golub, Gene H.; Van Loan, Charles F. (2013). "Chapter 11". Matrix Computations (4th ed.). Johns Hopkins University Press. ISBN 978-1-4214-0794-4.
- Saad, Yousef (2003-04-01). "Chapter 6". Iterative methods for sparse linear systems (2nd ed.). SIAM. ISBN 978-0-89871-534-7.
- Gérard Meurant: "Detection and correction of silent errors in the conjugate gradient algorithm", Numerical Algorithms, vol.92 (2023), pp.869-891. url=https://doi.org/10.1007/s11075-022-01380-1
- Meurant, Gerard; Tichy, Petr (2024). Error Norm Estimation in the Conjugate Gradient Algorithm. SIAM. ISBN 978-1-61197-785-1.


## External links


- "Conjugate gradients, method of", Encyclopedia of Mathematics, EMS Press, 2001 [1994]
