# B-spline

In numerical analysis, a B-spline (short for basis spline) is a type of spline function designed to have minimal support (overlap) for a given degree, smoothness, and set of breakpoints (knots that partition its domain), making it a fundamental building block for all spline functions of that degree. A B-spline is defined as a piecewise polynomial of order $n$, meaning a degree of $n-1$. It is built from sections that meet at these knots, where the continuity of the function and its derivatives depends on how often each knot repeats (its multiplicity). Any spline function of a specific degree can be uniquely expressed as a linear combination of B-splines of that degree over the same knots, a property that makes them versatile in mathematical modeling. A special subtype, cardinal B-splines, uses equidistant knots.

The concept of B-splines traces back to the 19th century, when Nikolai Lobachevsky explored similar ideas at Kazan University in Russia, though the term "B-spline" was coined by Isaac Jacob Schoenberg in 1967, reflecting their role as basis functions.

B-splines are widely used in fields like computer-aided design (CAD) and computer graphics, where they shape curves and surfaces through a set of control points, as well as in data analysis for tasks like curve fitting and numerical differentiation of experimental data. From designing car bodies to smoothing noisy measurements, B-splines offer a flexible way to represent complex shapes and functions with precision.


## Definition

A B-spline of order $p+1$ is a collection of piecewise polynomial functions $B_{i,p}(t)$ of degree $p$ in a variable $t$. The values of $t$ where the pieces of polynomial meet are known as knots, denoted $t_{0},t_{1},t_{2},\ldots ,t_{m}$ and sorted into nondecreasing order.

For a given sequence of knots, there is, up to a scaling factor, a unique spline $B_{i,p}(t)$ satisfying


$$B_{i,p}(t)={\begin{cases}{\text{non-zero}}&{\text{if }}t_{i}\leq t<t_{i+p+1},\\0&{\text{if }}t<t_{i}\lor t_{i+p+1}\leq t.\end{cases}}
$$

If we add the additional constraint that


$$\sum _{i=0}^{m-p-1}B_{i,p}(t)=1
$$

for all $t$ between the knots $t_{p}$ and $t_{m-p}$, then the scaling factor of $B_{i,p}(t)$ becomes fixed. The knots in-between (and not including) $t_{p}$ and $t_{m-p}$ are called the internal knots.

B-splines can be constructed by means of the Cox–de Boor recursion formula. We start with the B-splines of degree $p=0$, i.e. piecewise constant polynomials.


$$B_{i,0}(t):={\begin{cases}1&{\text{if }}t_{i}\leq t<t_{i+1},\\0&{\text{otherwise}}.\end{cases}}
$$

The higher $(p+1)$-degree B-splines are defined by recursion


$$B_{i,p}(t):={\dfrac {t-t_{i}}{t_{i+p}-t_{i}}}B_{i,p-1}(t)+{\dfrac {t_{i+p+1}-t}{t_{i+p+1}-t_{i+1}}}B_{i+1,p-1}(t).
$$


## Properties

A B-spline function is a combination of flexible bands that is controlled by a number of points that are called control points, creating smooth curves. These functions are used to create and manage complex shapes and surfaces using a number of points. B-spline function and Bézier functions are applied extensively in shape optimization methods.

A B-spline of order $n$ is a piecewise polynomial function of degree $n-1$ in a variable $x$. It is defined over $1+n$ locations $t_{j}$, called knots or breakpoints, which must be in non-descending order $t_{j}\leq t_{j+1}$. The B-spline contributes only in the range between the first and last of these knots and is zero elsewhere. If each knot is separated by the same distance $h$ (where $h=t_{j+1}-t_{j}$) from its predecessor, the knot vector and the corresponding B-splines are called "uniform" (see cardinal B-spline below).

For each finite knot interval where it is non-zero, a B-spline is a polynomial of degree $n-1$. A B-spline is a continuous function at the knots. When all knots belonging to the B-spline are distinct, its derivatives are also continuous up to the derivative of degree $n-2$. If the knots are coincident at a given value of $x$, the continuity of derivative order is reduced by 1 for each additional coincident knot. B-splines may share a subset of their knots, but two B-splines defined over exactly the same knots are identical. In other words, a B-spline is uniquely defined by its knots.

One distinguishes internal knots and end points. Internal knots cover the $x$-domain one is interested in. Since a single B-spline already extends over $1+n$ knots, it follows that the internal knots need to be extended with $n-1$ endpoints on each side, to give full support to the first and last B-spline, which affect the internal knot intervals. The values of the endpoints do not matter, usually the first or last internal knot is just repeated.

The usefulness of B-splines lies in the fact that any spline function of order $n$ on a given set of knots can be expressed as a linear combination of B-splines:


$$S_{n,\mathbf {t} }(x)=\sum _{i}\alpha _{i}B_{i,n}(x).
$$

B-splines play the role of basis functions for the spline function space, hence the name. This property follows from the fact that all pieces have the same continuity properties, within their individual range of support, at the knots.

Expressions for the polynomial pieces can be derived by means of the Cox–de Boor recursion formula


$$B_{i,0}(x):={\begin{cases}1&{\text{if }}t_{i}\leq x<t_{i+1},\\0&{\text{otherwise}}.\end{cases}}
$$


$$B_{i,k}(x):={\frac {x-t_{i}}{t_{i+k}-t_{i}}}B_{i,k-1}(x)+{\frac {t_{i+k+1}-x}{t_{i+k+1}-t_{i+1}}}B_{i+1,k-1}(x).
$$

That is, $B_{j,0}(x)$ is piecewise constant one or zero indicating which knot span x is in (zero if knot span j is repeated). The recursion equation is in two parts:


$${\frac {x-t_{i}}{t_{i+k}-t_{i}}}
$$

ramps from zero to one as x goes from $t_{i}$ to $t_{i+k}$, and


$${\frac {t_{i+k+1}-x}{t_{i+k+1}-t_{i+1}}}
$$

ramps from one to zero as x goes from $t_{i+1}$ to $t_{i+k+1}$. The corresponding Bs are zero outside those respective ranges. For example, $B_{i,1}(x)$ is a triangular function that is zero below $x=t_{i}$, ramps to one at $x=t_{i+1}$ and back to zero at and beyond $x=t_{i+2}$. However, because B-spline basis functions have local support, B-splines are typically computed by algorithms that do not need to evaluate basis functions where they are zero, such as de Boor's algorithm.

This relation leads directly to the FORTRAN-coded algorithm BSPLV, which generates values of the B-splines of order n at x. The following scheme illustrates how each piece of order n is a linear combination of the pieces of B-splines of order n − 1 to its left.


$${\begin{matrix}&&0\\&0&\\0&&B_{i-2,2}\\&B_{i-1,1}&\\B_{i,0}&&B_{i-1,2}\\&B_{i,1}&\\0&&B_{i,2}\\&0&\\&&0\end{matrix}}
$$

Application of the recursion formula with the knots at $(0,1,2,3)$ gives the pieces of the uniform B-spline of order 3


$${\begin{aligned}B_{1}&=x^{2}/2,&0&\leq x<1,\\B_{2}&=(-2x^{2}+6x-3)/2,&1&\leq x<2,\\B_{3}&=(3-x)^{2}/2,&2&\leq x<3.\end{aligned}}
$$

These pieces are shown in the diagram. The continuity property of a quadratic spline function and its first derivative at the internal knots are illustrated, as follows


$${\begin{aligned}&{\text{At }}x=1\colon \ B_{1}=B_{2}=0.5,\ {\frac {dB_{1}}{dx}}={\frac {dB_{2}}{dx}}=1.\\[6pt]&{\text{At }}x=2\colon \ B_{2}=B_{3}=0.5,\ {\frac {dB_{2}}{dx}}={\frac {dB_{3}}{dx}}=-1.\end{aligned}}
$$

The second derivative of a B-spline of degree 2 is discontinuous at the knots:


$${\frac {d^{2}B_{1}}{dx^{2}}}=1,\ {\frac {d^{2}B_{2}}{dx^{2}}}=-2,\ {\frac {d^{2}B_{3}}{dx^{2}}}=1.
$$

Faster variants of the de Boor algorithm have been proposed, but they suffer from comparatively lower stability.


### Cardinal B-spline

A cardinal B-spline has a constant separation h between knots. The cardinal B-splines for a given order n are just shifted copies of each other. They can be obtained from the simpler definition.


$$B_{i,n,t}(x)={\frac {x-t_{i}}{h}}n[0,\dots ,n](\cdot -t_{i})_{+}^{n-1}.
$$

The "placeholder" notation is used to indicate that the n-th divided difference of the function $(t-x)_{+}^{n-1}$ of the two variables t and x is to be taken by fixing x and considering $(t-x)_{+}^{n-1}$ as a function of t alone.

A cardinal B-spline has uniformly spaced knots, therefore interpolation between the knots equals convolution with a smoothing kernel.

Example, if we want to interpolate three values in between B-spline nodes (${\textbf {b}}$), we can write the signal as


$$\mathbf {x} =[\mathbf {b} _{1},0,0,\mathbf {b} _{2},0,0,\mathbf {b} _{3},0,0,\dots ,\mathbf {b} _{n},0,0].
$$

Convolution of the signal $\mathbf {x}$ with a rectangle function $\mathbf {h} =[1/3,1/3,1/3]$ gives first order interpolated B-spline values. Second-order B-spline interpolation is convolution with a rectangle function twice $\mathbf {y} =\mathbf {x} *\mathbf {h} *\mathbf {h}$; by iterative filtering with a rectangle function, higher-order interpolation is obtained.

Fast B-spline interpolation on a uniform sample domain can be done by iterative mean-filtering. Alternatively, a rectangle function equals sinc in Fourier domain. Therefore, cubic spline interpolation equals multiplying the signal in Fourier domain with sinc.

See Irwin–Hall distribution#Special cases for algebraic expressions for the cardinal B-splines of degree 1–4.


### P-spline

The term P-spline stands for "penalized B-spline". It refers to using the B-spline representation where the coefficients are determined partly by the data to be fitted, and partly by an additional penalty function that aims to impose smoothness to avoid overfitting.

Two- and multidimensional P-spline approximations of data can use the face-splitting product of matrices to the minimization of calculation operations.


## Derivative expressions

The derivative of a B-spline of degree k is simply a function of B-splines of degree k − 1:


$${\frac {dB_{i,k}(x)}{dx}}=k\left({\frac {B_{i,k-1}(x)}{t_{i+k}-t_{i}}}-{\frac {B_{i+1,k-1}(x)}{t_{i+k+1}-t_{i+1}}}\right).
$$

This implies that


$${\frac {d}{dx}}\sum _{i}\alpha _{i}B_{i,k}=\sum _{i=r-k+2}^{s-1}k{\frac {\alpha _{i}-\alpha _{i-1}}{t_{i+k}-t_{i}}}B_{i,k-1}\quad {\text{on}}\quad [t_{r},t_{s}],
$$

which shows that there is a simple relationship between the derivative of a spline function and the B-splines of degree one less.


## Moments of univariate B-splines

Univariate B-splines, i.e. B-splines where the knot positions lie in a single dimension, can be used to represent 1-d probability density functions $p(x)$. An example is a weighted sum of $i$ B-spline basis functions of order $n$, which each are area-normalized to unity (i.e. not directly evaluated using the standard de-Boor algorithm)


$$p(x)=\sum _{i}c_{i}\cdot B_{i,n,{\textbf {norm}}}(x)
$$

and with normalization constant constraint
$$\sum _{i}c_{i}=1
$$. The k-th raw moment $\mu _{k}$ of a normalized B-spline $B_{i,n,{\textbf {norm}}}$ can be written as Carlson's Dirichlet average $R_{k}$, which in turn can be solved exactly via a contour integral and an iterative sum as


$$\mu _{k}=R_{k}(\mathbf {m} ;\mathbf {t} )=\int _{-\infty }^{\infty }x^{k}\cdot B_{i,n,{\textbf {norm}}}(x\mid t_{1}\dots t_{j})\,dx={\frac {\Gamma (k+1)\Gamma (m)}{\Gamma (m+k)}}\cdot D_{k}(\mathbf {m} ,\mathbf {t} )
$$


$$D_{k}={\frac {1}{k}}\sum \limits _{u=1}^{k}\left[\left(\sum \limits _{i=1}^{j}m_{i}\cdot {t_{i}}^{u}\right)D_{k-u}\right]
$$

and $D_{0}=1$. Here, $\mathbf {t}$ represents a vector with the $j$ knot positions and $\mathbf {m}$ a vector with the respective knot multiplicities. One can therefore calculate any moment of a probability density function $p(x)$ represented by a sum of B-spline basis functions exactly, without resorting to numerical techniques.


## Relationship to piecewise/composite Bézier

A Bézier curve is also a polynomial curve definable using a recursion from lower-degree curves of the same class and encoded in terms of control points, but a key difference is that all terms in the recursion for a Bézier curve segment have the same domain of definition (usually $[0,1]$), whereas the supports of the two terms in the B-spline recursion are different (the outermost subintervals are not common). This means that a Bézier curve of degree $n$ given by $m\gg n$ control points consists of about $m/n$ mostly independent segments, whereas the B-spline with the same parameters smoothly transitions from subinterval to subinterval. To get something comparable from a Bézier curve, one would need to impose a smoothness condition on transitions between segments, resulting in some manner of Bézier spline (for which many control points would be determined by the smoothness requirement).

A piecewise/composite Bézier curve is a series of Bézier curves joined with at least C0 continuity (the last point of one curve coincides with the starting point of the next curve). Depending on the application, additional smoothness requirements (such as C1 or C2 continuity) may be added. C1 continuous curves have identical tangents at the breakpoint (where the two curves meet). C2 continuous curves have identical curvature at the breakpoint.


## Curve fitting

Usually in curve fitting, a set of data points is fitted with a curve defined by some mathematical function. For example, common types of curve fitting use a polynomial or a set of exponential functions. When there is no theoretical basis for choosing a fitting function, the curve may be fitted with a spline function composed of a sum of B-splines, using the method of least squares. Thus, the objective function for least-squares minimization is, for a spline function of degree k,


$$U=\sum _{{\text{all}}~x}\left\{W(x)\left[y(x)-\sum _{i}\alpha _{i}B_{i,k,t}(x)\right]\right\}^{2},
$$

where W(x) is a weight, and y(x) is the datum value at x. The coefficients $\alpha _{i}$ are the parameters to be determined. The knot values may be fixed or treated as parameters.

The main difficulty in applying this process is in determining the number of knots to use and where they should be placed. de Boor suggests various strategies to address this problem. For instance, the spacing between knots is decreased in proportion to the curvature (2nd derivative) of the data. A few applications have been published. For instance, the use of B-splines for fitting single Lorentzian and Gaussian curves has been investigated. Optimal spline functions of degrees 3–7 inclusive, based on symmetric arrangements of 5, 6, and 7 knots, have been computed and the method was applied for smoothing and differentiation of spectroscopic curves. In a comparable study, the two-dimensional version of the Savitzky–Golay filtering and the spline method produced better results than moving average or Chebyshev filtering.


## Computer-aided design and computer graphics

In computer-aided design and computer graphics applications, a spline curve is sometimes represented as $C(t)$, a parametric curve of some real parameter $t$. In this case the curve $C(t)$ can be treated as two or three separate coordinate functions $(x(t),y(t))$, or $(x(t),y(t),z(t))$. The coordinate functions $x(t)$, $y(t)$ and $z(t)$ are each spline functions, with a common set of knot values $t_{1},t_{2},\ldots ,t_{n}$.

Because a B-splines form basis functions, each of the coordinate functions can be expressed as a linear sum of B-splines, so we have


$${\begin{aligned}X(t)&=\sum _{i}x_{i}B_{i,n}(t),\\Y(t)&=\sum _{i}y_{i}B_{i,n}(t),\\Z(t)&=\sum _{i}z_{i}B_{i,n}(t).\end{aligned}}
$$

The weights $x_{i}$, $y_{i}$ and $z_{i}$ can be combined to form points $P_{i}=(x_{i},y_{i},z_{i})$ in 3-d space. These points $P_{i}$ are commonly known as control points.

Working in reverse, a sequence of control points, knot values, and order of the B-spline define a parametric curve. This representation of a curve by control points has several useful properties:


1. The control points $P_{i}$ define a curve. If the control points are all transformed together in some way, such as being translated, rotated, scaled, or moved by any affine transformation, then the corresponding curve is transformed in the same way.
2. Because the B-splines are non-zero for just a finite number of knot intervals, if a single control point is moved, the corresponding change to the parametric curve is just over the parameter range of a small number knot intervals.
3. Because
$$\sum _{i}B_{i,n}(x)=1
$$, and at all times each $B_{i,n}(x)\geq 0$, then the curve remains inside the bounding box of the control points. Also, in some sense, the curve broadly follows the control points.

A less desirable feature is that the parametric curve does not interpolate the control points. Usually the curve does not pass through the control points.


## Cubic B-Splines

A cubic B-spline curve $\mathbf {C} (t)$ with a normalized parameter $t\in [0,1]$ is defined by four nodes (i.e. control points) ${\textbf {b}}_{0}$, ${\textbf {b}}_{1}$, ${\textbf {b}}_{2}$, and ${\textbf {b}}_{3}$. It forms a polynomial of degree 3 that can be written as


$$\mathbf {C} (t)={\frac {1}{6}}\;{\begin{bmatrix}t^{3}&t^{2}&t&1\end{bmatrix}}{\begin{bmatrix}-1&3&-3&1\\3&-6&3&0\\-3&0&3&0\\1&4&1&0\end{bmatrix}}{\begin{bmatrix}\mathbf {b} _{0}\\\mathbf {b} _{1}\\\mathbf {b} _{2}\\\mathbf {b} _{3}\end{bmatrix}}
$$.

This corresponds to B-spline polynomials


$${\begin{aligned}B_{0}(t)&={\frac {1}{6}}(-t^{3}+3t^{2}-3t+1)\\B_{1}(t)&={\frac {1}{6}}(3t^{3}-6t^{2}+4)\\B_{2}(t)&={\frac {1}{6}}(-3t^{3}+3t^{2}+3t+1)\\B_{3}(t)&={\frac {1}{6}}t^{3}\end{aligned}}
$$

and the curve can be evaluated as
$$\mathbf {C} (t)=\sum _{i=0}^{3}B_{i}(t)\,\mathbf {b} _{i}
$$. Expanding this, we can write the full polynomial form as below


$$\mathbf {C} (t)={\frac {1}{6}}{\biggl (}(-\mathbf {b} _{0}+3\mathbf {b} _{1}-3\mathbf {b} _{2}+\mathbf {b} _{3})t^{3}+(3\mathbf {b} _{0}-6\mathbf {b} _{1}+3\mathbf {b} _{2})t^{2}+(-3\mathbf {b} _{0}+3\mathbf {b} _{2})t+(\mathbf {b} _{0}+4\mathbf {b} _{1}+\mathbf {b} _{2}){\biggr )}
$$.

Since this is a cubic polynomial, we can also write it as a cubic Bézier curve with control points ${\textbf {P}}_{0}$, ${\textbf {P}}_{1}$, ${\textbf {P}}_{2}$, and ${\textbf {P}}_{3}$, such that


$${\begin{aligned}\mathbf {P} _{0}&={\frac {1}{6}}(\mathbf {b} _{0}+4\mathbf {b} _{1}+\mathbf {b} _{2}),\\\mathbf {P} _{1}&={\frac {1}{3}}(2\mathbf {b} _{1}+\mathbf {b} _{2}),\\\mathbf {P} _{2}&={\frac {1}{3}}(\mathbf {b} _{1}+2\mathbf {b} _{2}),\\\mathbf {P} _{3}&={\frac {1}{6}}(\mathbf {b} _{1}+4\mathbf {b} _{2}+\mathbf {b} _{3}).\end{aligned}}
$$

A piecewise cubic B-spline is formed by a set of nodes and each four consecutive nodes define a cubic piece of the curve with the formulation above.


## NURBS

In computer-aided design, computer-aided manufacturing, and computer graphics, a powerful extension of B-splines is non-uniform rational B-splines (NURBS). NURBS are essentially B-splines in homogeneous coordinates. Like B-splines, they are defined by their order, and a knot vector, and a set of control points, but unlike simple B-splines, the control points each have a weight. When the weight is equal to 1, a NURBS is simply a B-spline and as such NURBS generalizes both B-splines and Bézier curves and surfaces, the primary difference being the weighting of the control points which makes NURBS curves "rational".

By evaluating a NURBS at various values of the parameters, the curve can be traced through space; likewise, by evaluating a NURBS surface at various values of the two parameters, the surface can be represented in Cartesian space.

Like B-splines, NURBS control points determine the shape of the curve. Each point of the curve is computed by taking a weighted sum of a number of control points. The weight of each point varies according to the governing parameter. For a curve of degree d, the influence of any control point is only nonzero in d+1 intervals (knot spans) of the parameter space. Within those intervals, the weight changes according to a polynomial function (basis functions) of degree d. At the boundaries of the intervals, the basis functions go smoothly to zero, the smoothness being determined by the degree of the polynomial.

The knot vector is a sequence of parameter values that determines where and how the control points affect the NURBS curve. The number of knots is always equal to the number of control points plus curve degree plus one. Each time the parameter value enters a new knot span, a new control point becomes active, while an old control point is discarded.

A NURBS curve takes the following form:


$$C(u)={\frac {\sum _{i=1}^{k}N_{i,n}(u)w_{i}P_{i}}{\sum _{i=1}^{k}N_{i,n}(u)w_{i}}}
$$

Here the notation is as follows. u is the independent variable (instead of x), k is the number of control points, N is a B-spline (used instead of B), n is the polynomial degree, P is a control point and w is a weight. The denominator is a normalizing factor that evaluates to one if all weights are one.

It is customary to write this as


$$C(u)=\sum _{i=1}^{k}R_{i,n}(u)P_{i}
$$

in which the functions


$$R_{i,n}(u)={\frac {N_{i,n}(u)w_{i}}{\sum _{j=1}^{k}N_{j,n}(u)w_{j}}}
$$

are known as the rational basis functions.

A NURBS surface is obtained as the tensor product of two NURBS curves, thus using two independent parameters u and v (with indices i and j respectively):


$$S(u,v)=\sum _{i=1}^{k}\sum _{j=1}^{\ell }R_{i,j}(u,v)P_{i,j}
$$


$$R_{i,j}(u,v)={\frac {N_{i,n}(u)N_{j,m}(v)w_{i,j}}{\sum _{p=1}^{k}\sum _{q=1}^{\ell }N_{p,n}(u)N_{q,m}(v)w_{p,q}}}
$$

as rational basis functions.


## See also


- Bézier curve
- Box spline
- De Boor's algorithm
- I-spline
- M-spline
- Spline wavelet
- T-spline


## Further reading


- Richard H. Bartels; John C. Beatty; Brian A. Barsky (1987). An Introduction to Splines for Use in Computer Graphics and Geometric Modeling. Morgan Kaufmann. ISBN 978-1-55860-400-1.
- Jean Gallier (1999). Curves and Surfaces in Geometric Modeling: Theory and Algorithms. Morgan Kaufmann. Chapter 6. B-Spline Curves. This book is out of print and freely available from the author.
- Hartmut Prautzsch; Wolfgang Boehm; Marco Paluszny (2002). Bézier and B-Spline Techniques. Springer Science & Business Media. ISBN 978-3-540-43761-1.
- David Salomon (2006). Curves and Surfaces for Computer Graphics. Springer. Chapter 7. B-Spline Approximation. ISBN 978-0-387-28452-1.
- Hovey, Chad (2022). Formulation and Python Implementation of Bézier and B-Spline Geometry. SAND2022-7702C. (153 pages)


## External links


- Weisstein, Eric W. "B-Spline". MathWorld.
- Ruf, Johannes. "B-splines of third order on a non-uniform grid" (PDF). Archived from the original (PDF) on 2013-11-06. Retrieved 2012-05-02.
- bivariate B-spline from numpy
- Interactive B-splines with JSXGraph
- TinySpline: Opensource C-library with bindings for various languages
- Uniform non rational B-Splines, Modelling curves in 2D space. Author:Stefan G. Beck
- B-Spline Editor by Shukant Pal
