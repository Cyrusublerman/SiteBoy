# Cubic Hermite spline

In numerical analysis, a cubic Hermite spline or cubic Hermite interpolator is a spline where each piece is a third-degree polynomial specified in Hermite form, that is, by its values and first derivatives at the end points of the corresponding domain interval.

Cubic Hermite splines are typically used for interpolation of numeric data specified at given argument values $x_{1},x_{2},\ldots ,x_{n}$, to obtain a continuous function. The data should consist of the desired function value and derivative at each $x_{k}$. (If only the values are provided, the derivatives must be estimated from them.) The Hermite formula is applied to each interval $(x_{k},x_{k+1})$ separately. The resulting spline will be continuous and will have continuous first derivative.

Cubic polynomial splines can be specified in other ways, the Bezier cubic being the most common. However, these two methods provide the same set of splines, and data can be easily converted between the Bézier and Hermite forms; so the names are often used as if they were synonymous.

Cubic polynomial splines are extensively used in computer graphics and geometric modeling to obtain curves or motion trajectories that pass through specified points of the plane or three-dimensional space. In these applications, each coordinate of the plane or space is separately interpolated by a cubic spline function of a separate parameter t. Cubic polynomial splines are also used extensively in structural analysis applications, such as Euler–Bernoulli beam theory. Cubic polynomial splines have also been applied to mortality analysis and mortality forecasting.

Cubic splines can be extended to functions of two or more parameters, in several ways. Bicubic splines (Bicubic interpolation) are often used to interpolate data on a regular rectangular grid, such as pixel values in a digital image or altitude data on a terrain. Bicubic surface patches, defined by three bicubic splines, are an essential tool in computer graphics.

Cubic splines are often called csplines, especially in computer graphics. Hermite splines are named after Charles Hermite.


## Interpolation on a single interval


### Unit interval [0, 1]

On the unit interval $[0,1]$, given a starting point ${\boldsymbol {p}}_{0}$ at $t=0$ and an ending point ${\boldsymbol {p}}_{1}$ at $t=1$ with starting tangent ${\boldsymbol {m}}_{0}$ at $t=0$ and ending tangent ${\boldsymbol {m}}_{1}$ at $t=1$, the polynomial can be defined by
$${\boldsymbol {p}}(t)=\left(2t^{3}-3t^{2}+1\right){\boldsymbol {p}}_{0}+\left(t^{3}-2t^{2}+t\right){\boldsymbol {m}}_{0}+\left(-2t^{3}+3t^{2}\right){\boldsymbol {p}}_{1}+\left(t^{3}-t^{2}\right){\boldsymbol {m}}_{1},
$$where t ∈ [0, 1].


### Interpolation on an arbitrary interval

Interpolating $x$ in an arbitrary interval $(x_{k},x_{k+1})$ is done by mapping the latter to $[0,1]$ through an affine (degree-1) change of variable. The formula is
$${\boldsymbol {p}}(x)=h_{00}(t){\boldsymbol {p}}_{k}+h_{10}(t)(x_{k+1}-x_{k}){\boldsymbol {m}}_{k}+h_{01}(t){\boldsymbol {p}}_{k+1}+h_{11}(t)(x_{k+1}-x_{k}){\boldsymbol {m}}_{k+1},
$$where $t=(x-x_{k})/(x_{k+1}-x_{k})$, and $h$ refers to the basis functions, defined below. Note that the tangent values have been scaled by $x_{k+1}-x_{k}$ compared to the equation on the unit interval.


### Uniqueness

The formula specified above provides the unique third-degree polynomial path between the two points with the given tangents.

Proof. Let $P,Q$ be two third-degree polynomials satisfying the given boundary conditions. Define $R=Q-P,$ then:

$R(0)=Q(0)-P(0)=0,$

$R(1)=Q(1)-P(1)=0.$

Since both $Q$ and $P$ are third-degree polynomials, $R$ is at most a third-degree polynomial. So $R$ must be of the form $R(x)=ax(x-1)(x-r).$ Calculating the derivative gives $R'(x)=ax(x-1)+ax(x-r)+a(x-1)(x-r).$

We know furthermore that

$R'(0)=Q'(0)-P'(0)=0,$

$R'(1)=Q'(1)-P'(1)=0,$

Putting (1) and (2) together, we deduce that $a=0$, and therefore $R=0,$ thus $P=Q.$


### Representations

We can write the interpolation polynomial on the unit interval (for an arbitrary interval see the rescaled version above) as
$${\boldsymbol {p}}(t)=h_{00}(t){\boldsymbol {p}}_{0}+h_{10}(t){\boldsymbol {m}}_{0}+h_{01}(t){\boldsymbol {p}}_{1}+h_{11}(t){\boldsymbol {m}}_{1}
$$where $h_{00}$, $h_{10}$, $h_{01}$, $h_{11}$ are Hermite basis functions. These can be written in different ways, each way revealing different properties:

The "expanded" column shows the representation used in the definition above. The "factorized" column shows immediately that $h_{10}$ and $h_{11}$ are zero at the boundaries. You can further conclude that $h_{01}$ and $h_{11}$ have a zero of multiplicity 2 at 0, and $h_{00}$ and $h_{10}$ have such a zero at 1, thus they have slope 0 at those boundaries. The "Bernstein" column shows the decomposition of the Hermite basis functions into Bernstein polynomials of order 3:
$$B_{k}(t)={\binom {3}{k}}\cdot t^{k}\cdot (1-t)^{3-k}.
$$

Using this connection you can express cubic Hermite interpolation in terms of cubic Bézier curves with respect to the four values
$${\textstyle {\boldsymbol {p}}_{0},{\boldsymbol {p}}_{0}+{\frac {1}{3}}{\boldsymbol {m}}_{0},{\boldsymbol {p}}_{1}-{\frac {1}{3}}{\boldsymbol {m}}_{1},{\boldsymbol {p}}_{1}}
$$and do Hermite interpolation using the de Casteljau algorithm. It shows that in a cubic Bézier patch the two control points in the middle determine the tangents of the interpolation curve at the respective outer points.

We can also write the polynomial in standard form as
$${\boldsymbol {p}}(t)=\left(2{\boldsymbol {p}}_{0}+{\boldsymbol {m}}_{0}-2{\boldsymbol {p}}_{1}+{\boldsymbol {m}}_{1}\right)t^{3}+\left(-3{\boldsymbol {p}}_{0}+3{\boldsymbol {p}}_{1}-2{\boldsymbol {m}}_{0}-{\boldsymbol {m}}_{1}\right)t^{2}+{\boldsymbol {m}}_{0}t+{\boldsymbol {p}}_{0}
$$where the control points and tangents are coefficients. This permits efficient evaluation of the polynomial at various values of t since the constant coefficients can be computed once and reused.


## Interpolating a data set

A data set, $(x_{k},{\boldsymbol {p}}_{k})$ for $k=1,\ldots ,n$, can be interpolated by applying the above procedure on each interval, where the tangents are chosen in a sensible manner, meaning that the tangents for intervals sharing endpoints are equal. The interpolated curve then consists of piecewise cubic Hermite splines and is globally continuously differentiable in $(x_{1},x_{n})$.

The choice of tangents is not unique, and there are several options available.


### Finite difference

The simplest choice is the three-point difference, not requiring constant interval lengths:


$${\boldsymbol {m}}_{k}={\frac {1}{2}}\left({\frac {{\boldsymbol {p}}_{k+1}-{\boldsymbol {p}}_{k}}{x_{k+1}-x_{k}}}+{\frac {{\boldsymbol {p}}_{k}-{\boldsymbol {p}}_{k-1}}{x_{k}-x_{k-1}}}\right)
$$

for internal points $k=2,\dots ,n-1$, and one-sided difference at the endpoints of the data set.


### Cardinal spline

A cardinal spline, sometimes called a canonical spline, is obtained if


$${\boldsymbol {m}}_{k}=(1-c){\frac {{\boldsymbol {p}}_{k+1}-{\boldsymbol {p}}_{k-1}}{x_{k+1}-x_{k-1}}}
$$

is used to calculate the tangents. The parameter c is a tension parameter that must be in the interval [0, 1]. In some sense, this can be interpreted as the "length" of the tangent. Choosing c = 1 yields all zero tangents, and choosing c = 0 yields a Catmull–Rom spline in the uniform parameterization case.


### Catmull–Rom spline

For tangents chosen to be


$${\boldsymbol {m}}_{k}={\frac {{\boldsymbol {p}}_{k+1}-{\boldsymbol {p}}_{k-1}}{2}}
$$

a Catmull–Rom spline is obtained, being a special case of a cardinal spline. This assumes uniform parameter spacing.

The curve is named after Edwin Catmull and Raphael Rom. The principal advantage of this technique is that the points along the original set of points also make up the control points for the spline curve. Two additional points are required on either end of the curve. The uniform Catmull–Rom implementation can produce loops and self-intersections. The chordal and centripetal Catmull–Rom implementations solve this problem, but use a slightly different calculation. In computer graphics, Catmull–Rom splines are frequently used to get smooth interpolated motion between key frames. For example, most camera path animations generated from discrete key-frames are handled using Catmull–Rom splines. They are popular mainly for being relatively easy to compute, guaranteeing that each key frame position will be hit exactly, and also guaranteeing that the tangents of the generated curve are continuous over multiple segments.


### Kochanek–Bartels spline

A Kochanek–Bartels spline is a further generalization on how to choose the tangents given the data points ${\boldsymbol {p}}_{k-1}$, ${\boldsymbol {p}}_{k}$ and ${\boldsymbol {p}}_{k+1}$, with three parameters possible: tension, bias and a continuity parameter.


### Monotone cubic interpolation

If a cubic Hermite spline of any of the above listed types is used for interpolation of a monotonic data set, the interpolated function will not necessarily be monotonic, but monotonicity can be preserved by adjusting the tangents.


## Interpolation on the unit interval with matched derivatives at endpoints

Consider a single coordinate of the points
$${\boldsymbol {p}}_{n-1},{\boldsymbol {p}}_{n},{\boldsymbol {p}}_{n+1}
$$and ${\boldsymbol {p}}_{n+2}$ as the values that a function f(x) takes at integer ordinates x = n − 1, n, n + 1 and n + 2,

$p_{n}=f(n)\quad \forall n\in \mathbb {Z} .$

In addition, assume that the tangents at the endpoints are defined as the centered differences of the adjacent points:
$$m_{n}={\frac {f(n+1)-f(n-1)}{2}}={\frac {p_{n+1}-p_{n-1}}{2}}\quad \forall n\in \mathbb {Z} .
$$

To evaluate the interpolated f(x) for a real x, first separate x into the integer portion n and fractional portion u:

$x=n+u,$

$n=\lfloor x\rfloor =\operatorname {floor} (x),$

$u=x-n=x-\lfloor x\rfloor ,$

$0\leq u<1,$

where $\lfloor x\rfloor$ denotes the floor function, which returns the largest integer no larger than x.

Then the Catmull–Rom spline is
$${\begin{aligned}f(x)=f(n+u)&={\text{CINT}}_{u}(p_{n-1},p_{n},p_{n+1},p_{n+2})\\&={\begin{bmatrix}1&u&u^{2}&u^{3}\end{bmatrix}}{\begin{bmatrix}0&1&0&0\\-{\tfrac {1}{2}}&0&{\tfrac {1}{2}}&0\\1&-{\tfrac {5}{2}}&2&-{\tfrac {1}{2}}\\-{\tfrac {1}{2}}&{\tfrac {3}{2}}&-{\tfrac {3}{2}}&{\tfrac {1}{2}}\end{bmatrix}}{\begin{bmatrix}p_{n-1}\\p_{n}\\p_{n+1}\\p_{n+2}\end{bmatrix}}\\&={\frac {1}{2}}{\begin{bmatrix}-u^{3}+2u^{2}-u\\3u^{3}-5u^{2}+2\\-3u^{3}+4u^{2}+u\\u^{3}-u^{2}\end{bmatrix}}^{\mathrm {T} }{\begin{bmatrix}p_{n-1}\\p_{n}\\p_{n+1}\\p_{n+2}\end{bmatrix}}\\&={\frac {1}{2}}{\begin{bmatrix}u{\big (}(2-u)u-1{\big )}\\u^{2}(3u-5)+2\\u{\big (}(4-3u)u+1{\big )}\\u^{2}(u-1)\end{bmatrix}}^{\mathrm {T} }{\begin{bmatrix}p_{n-1}\\p_{n}\\p_{n+1}\\p_{n+2}\end{bmatrix}}\\&={\tfrac {1}{2}}{\Big (}{\big (}u^{2}(2-u)-u{\big )}p_{n-1}+{\big (}u^{2}(3u-5)+2{\big )}p_{n}+{\big (}u^{2}(4-3u)+u{\big )}p_{n+1}+u^{2}(u-1)p_{n+2}{\Big )}\\&={\tfrac {1}{2}}{\big (}(-u^{3}+2u^{2}-u)p_{n-1}+(3u^{3}-5u^{2}+2)p_{n}+(-3u^{3}+4u^{2}+u)p_{n+1}+(u^{3}-u^{2})p_{n+2}{\big )}\\&={\tfrac {1}{2}}{\big (}(-p_{n-1}+3p_{n}-3p_{n+1}+p_{n+2})u^{3}+(2p_{n-1}-5p_{n}+4p_{n+1}-p_{n+2})u^{2}+(-p_{n-1}+p_{n+1})u+2p_{n}{\big )}\\&={\tfrac {1}{2}}{\Big (}{\big (}(-p_{n-1}+3p_{n}-3p_{n+1}+p_{n+2})u+(2p_{n-1}-5p_{n}+4p_{n+1}-p_{n+2}){\big )}u+(-p_{n-1}+p_{n+1}){\Big )}u+p_{n},\end{aligned}}
$$where $\mathrm {T}$ denotes the matrix transpose. The bottom equality is depicting the application of Horner's method.

This writing is relevant for tricubic interpolation, where one optimization requires computing CINTu sixteen times with the same u and different p.


## See also


- Bicubic interpolation, a generalization to two dimensions
- Tricubic interpolation, a generalization to three dimensions
- Hermite interpolation
- Multivariate interpolation
- Spline interpolation
- Discrete spline interpolation


## External links


- Spline Curves, Prof. Donald H. House Clemson University
- Multi-dimensional Hermite Interpolation and Approximation, Prof. Chandrajit Bajaj, Purdue University
- Introduction to Catmull–Rom Splines, MVPs.org
- Interpolating Cardinal and Catmull–Rom splines
- Interpolation methods: linear, cosine, cubic and hermite (with C sources)
- Common Spline Equations
