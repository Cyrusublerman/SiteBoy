# Jacobi method

In numerical linear algebra, the Jacobi method (a.k.a. the Jacobi iteration method) is an iterative algorithm for determining the solutions of a strictly diagonally dominant system of linear equations. Each diagonal element is solved for, and an approximate value is plugged in. The process is then iterated until it converges. This algorithm is a stripped-down version of the Jacobi transformation method of matrix diagonalization. The method is named after Carl Gustav Jacob Jacobi.


## Description

Let $A\mathbf {x} =\mathbf {b}$ be a square system of n linear equations, where:
$$A={\begin{bmatrix}a_{11}&a_{12}&\cdots &a_{1n}\\a_{21}&a_{22}&\cdots &a_{2n}\\\vdots &\vdots &\ddots &\vdots \\a_{n1}&a_{n2}&\cdots &a_{nn}\end{bmatrix}},\qquad \mathbf {x} ={\begin{bmatrix}x_{1}\\x_{2}\\\vdots \\x_{n}\end{bmatrix}},\qquad \mathbf {b} ={\begin{bmatrix}b_{1}\\b_{2}\\\vdots \\b_{n}\end{bmatrix}}.
$$

When $A$ and $\mathbf {b}$ are known, and $\mathbf {x}$ is unknown, we can use the Jacobi method to approximate $\mathbf {x}$. The vector $\mathbf {x} ^{(0)}$ denotes our initial guess for $\mathbf {x}$ (often $\mathbf {x} _{i}^{(0)}=0$ for $i=1,2,...,n$). We denote $\mathbf {x} ^{(k)}$ as the k-th approximation or iteration of $\mathbf {x}$, and $\mathbf {x} ^{(k+1)}$ is the next (or k+1) iteration of $\mathbf {x}$.


### Matrix-based formula

Then A can be decomposed into a diagonal component D, a lower triangular part L and an upper triangular part U:
$$A=D+L+U\qquad {\text{where}}\qquad D={\begin{bmatrix}a_{11}&0&\cdots &0\\0&a_{22}&\cdots &0\\\vdots &\vdots &\ddots &\vdots \\0&0&\cdots &a_{nn}\end{bmatrix}}{\text{ and }}L+U={\begin{bmatrix}0&a_{12}&\cdots &a_{1n}\\a_{21}&0&\cdots &a_{2n}\\\vdots &\vdots &\ddots &\vdots \\a_{n1}&a_{n2}&\cdots &0\end{bmatrix}}.
$$The solution is then obtained iteratively via


$$\mathbf {x} ^{(k+1)}=D^{-1}(\mathbf {b} -(L+U)\mathbf {x} ^{(k)}).
$$


### Element-based formula

The element-based formula for each row $i$ is thus:
$$x_{i}^{(k+1)}={\frac {1}{a_{ii}}}\left(b_{i}-\sum _{j\neq i}a_{ij}x_{j}^{(k)}\right),\quad i=1,2,\ldots ,n.
$$The computation of $x_{i}^{(k+1)}$ requires each element in $\mathbf {x} ^{(k)}$ except itself. Unlike the Gauss–Seidel method, we cannot overwrite $x_{i}^{(k)}$ with $x_{i}^{(k+1)}$, as that value will be needed by the rest of the computation. The minimum amount of storage is two vectors of size n.


## Algorithm


## Convergence

The standard convergence condition (for any iterative method) is when the spectral radius of the iteration matrix is less than 1:

$\rho (D^{-1}(L+U))<1.$

A sufficient (but not necessary) condition for the method to converge is that the matrix A is strictly or irreducibly diagonally dominant. Strict row diagonal dominance means that for each row, the absolute value of the diagonal term is greater than the sum of absolute values of other terms:


$$\left|a_{ii}\right|>\sum _{j\neq i}{\left|a_{ij}\right|}.
$$

The Jacobi method sometimes converges even if these conditions are not satisfied.

Note that the Jacobi method does not converge for every symmetric positive-definite matrix. For example,
$$A={\begin{pmatrix}29&2&1\\2&6&1\\1&1&{\frac {1}{5}}\end{pmatrix}}\quad \Rightarrow \quad D^{-1}(L+U)={\begin{pmatrix}0&{\frac {2}{29}}&{\frac {1}{29}}\\{\frac {1}{3}}&0&{\frac {1}{6}}\\5&5&0\end{pmatrix}}\quad \Rightarrow \quad \rho (D^{-1}(L+U))\approx 1.0661\,.
$$


## Examples


### Example question

A linear system of the form $Ax=b$ with initial estimate $x^{(0)}$ is given by


$$A={\begin{bmatrix}2&1\\5&7\\\end{bmatrix}},\ b={\begin{bmatrix}11\\13\\\end{bmatrix}}\quad {\text{and}}\quad x^{(0)}={\begin{bmatrix}1\\1\\\end{bmatrix}}.
$$

We use the equation $x^{(k+1)}=D^{-1}(b-(L+U)x^{(k)})$, described above, to estimate $x$. First, we rewrite the equation in a more convenient form $D^{-1}(b-(L+U)x^{(k)})=Tx^{(k)}+C$, where $T=-D^{-1}(L+U)$ and $C=D^{-1}b$. From the known values
$$D^{-1}={\begin{bmatrix}1/2&0\\0&1/7\\\end{bmatrix}},\ L={\begin{bmatrix}0&0\\5&0\\\end{bmatrix}}\quad {\text{and}}\quad U={\begin{bmatrix}0&1\\0&0\\\end{bmatrix}}.
$$we determine $T=-D^{-1}(L+U)$ as
$$T={\begin{bmatrix}1/2&0\\0&1/7\\\end{bmatrix}}\left\{{\begin{bmatrix}0&0\\-5&0\\\end{bmatrix}}+{\begin{bmatrix}0&-1\\0&0\\\end{bmatrix}}\right\}={\begin{bmatrix}0&-1/2\\-5/7&0\\\end{bmatrix}}.
$$Further, $C$ is found as
$$C={\begin{bmatrix}1/2&0\\0&1/7\\\end{bmatrix}}{\begin{bmatrix}11\\13\\\end{bmatrix}}={\begin{bmatrix}11/2\\13/7\\\end{bmatrix}}.
$$With $T$ and $C$ calculated, we estimate $x$ as $x^{(1)}=Tx^{(0)}+C$:
$$x^{(1)}={\begin{bmatrix}0&-1/2\\-5/7&0\\\end{bmatrix}}{\begin{bmatrix}1\\1\\\end{bmatrix}}+{\begin{bmatrix}11/2\\13/7\\\end{bmatrix}}={\begin{bmatrix}5.0\\8/7\\\end{bmatrix}}\approx {\begin{bmatrix}5\\1.143\\\end{bmatrix}}.
$$The next iteration yields
$$x^{(2)}={\begin{bmatrix}0&-1/2\\-5/7&0\\\end{bmatrix}}{\begin{bmatrix}5.0\\8/7\\\end{bmatrix}}+{\begin{bmatrix}11/2\\13/7\\\end{bmatrix}}={\begin{bmatrix}69/14\\-12/7\\\end{bmatrix}}\approx {\begin{bmatrix}4.929\\-1.714\\\end{bmatrix}}.
$$This process is repeated until convergence (i.e., until $\|Ax^{(n)}-b\|$ is small). The solution after 25 iterations is


$$x={\begin{bmatrix}7.111\\-3.222\end{bmatrix}}.
$$


### Example question 2

Suppose we are given the following linear system:


$${\begin{aligned}10x_{1}-x_{2}+2x_{3}&=6,\\-x_{1}+11x_{2}-x_{3}+3x_{4}&=25,\\2x_{1}-x_{2}+10x_{3}-x_{4}&=-11,\\3x_{2}-x_{3}+8x_{4}&=15.\end{aligned}}
$$

If we choose (0, 0, 0, 0) as the initial approximation, then the first approximate solution is given by
$${\begin{aligned}x_{1}&=(6+0-(2*0))/10=0.6,\\x_{2}&=(25+0+0-(3*0))/11=25/11=2.2727,\\x_{3}&=(-11-(2*0)+0+0)/10=-1.1,\\x_{4}&=(15-(3*0)+0)/8=1.875.\end{aligned}}
$$Using the approximations obtained, the iterative procedure is repeated until the desired accuracy has been reached. The following are the approximated solutions after five iterations.

The exact solution of the system is (1, 2, −1, 1).


### Python example


## Weighted Jacobi method

The weighted Jacobi iteration uses a parameter $\omega$ to compute the iteration as


$$\mathbf {x} ^{(k+1)}=\omega D^{-1}(\mathbf {b} -(L+U)\mathbf {x} ^{(k)})+\left(1-\omega \right)\mathbf {x} ^{(k)}
$$

with $\omega =2/3$ being the usual choice. From the relation $L+U=A-D$, this may also be expressed as


$${\begin{aligned}\mathbf {x} ^{(k+1)}&=\omega D^{-1}\mathbf {b} +\left(I-\omega D^{-1}A\right)\mathbf {x} ^{(k)}\\&=\mathbf {x} ^{(k)}+\omega D^{-1}\mathbf {r} ^{(k)},\end{aligned}}
$$

where
$$\mathbf {r} ^{(k)}=\mathbf {b} -A\mathbf {x} ^{(k)}
$$is the algebraic residual at iteration $k$.


### Convergence in the symmetric positive definite case

If the system matrix $A$ is symmetric positive-definite, one can show convergence.

Let $C=C_{\omega }=I-\omega D^{-1}A$ be the iteration matrix. Then, convergence is guaranteed for


$$\rho (C_{\omega })<1\quad \Longleftrightarrow \quad 0<\omega <{\frac {2}{\lambda _{\text{max}}(D^{-1}A)}}\,,
$$

where $\lambda _{\text{max}}$ is the maximal eigenvalue.

The spectral radius can be minimized for a particular choice of $\omega =\omega _{\text{opt}}$ as follows
$$\min _{\omega }\rho (C_{\omega })=\rho (C_{\omega _{\text{opt}}})=1-{\frac {2}{\kappa (D^{-1}A)+1}}\quad {\text{for}}\quad \omega _{\text{opt}}:={\frac {2}{\lambda _{\text{min}}(D^{-1}A)+\lambda _{\text{max}}(D^{-1}A)}}\,,
$$where $\kappa$ is the matrix condition number.


## See also


- Gauss–Seidel method
- Successive over-relaxation
- Iterative method § Linear systems
- Gaussian Belief Propagation
- Matrix splitting


## External links


- This article incorporates text from the article Jacobi_method on CFD-Wiki that is under the GFDL license.


- Black, Noel; Moore, Shirley & Weisstein, Eric W. "Jacobi method". MathWorld.
- Jacobi Method from www.math-linux.com
