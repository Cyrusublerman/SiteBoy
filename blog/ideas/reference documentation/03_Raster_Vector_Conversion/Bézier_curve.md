# Bézier curve

A Bézier curve (/ˈbɛz.i.eɪ/ BEH-zee-ay, .mw-parser-output .IPA-label-small{font-size:85%}.mw-parser-output .references .IPA-label-small,.mw-parser-output .infobox .IPA-label-small,.mw-parser-output .navbox .IPA-label-small{font-size:100%}French pronunciation: [bezje]) is a parametric curve used in computer graphics and related fields. A set of discrete "control points" defines a smooth, continuous curve by means of a formula. Usually the curve is intended to approximate a real-world shape that otherwise has no mathematical representation or whose representation is unknown or too complicated. The Bézier curve is named after French engineer Pierre Bézier (1910–1999), who used it in the 1960s for designing curves for the bodywork of Renault cars. Other uses include the design of computer fonts and animation. Bézier curves can be combined to form a Bézier spline, or generalized to higher dimensions to form Bézier surfaces. The Bézier triangle is a special case of the latter.

In vector graphics, Bézier curves are used to model smooth curves that can be scaled indefinitely. "Paths", as they are commonly referred to in image manipulation programs, are combinations of linked Bézier curves. Paths are not bound by the limits of rasterized images and are intuitive to modify.

Bézier curves are also used in the time domain, particularly in animation, user interface design and smoothing cursor trajectory in eye gaze controlled interfaces. For example, a Bézier curve can be used to specify the velocity over time of an object such as an icon moving from A to B, rather than simply moving at a fixed number of pixels per step. When animators or interface designers talk about the "physics" or "feel" of an operation, they may be referring to the particular Bézier curve used to control the velocity over time of the move in question.

This also applies to robotics where the motion of a welding arm, for example, should be smooth to avoid unnecessary wear.


## Invention

The mathematical basis for Bézier curves—the Bernstein polynomials—was established in 1912, but the polynomials were not applied to graphics until some 50 years later when mathematician Paul de Casteljau in 1959 developed de Casteljau's algorithm, a numerically stable method for evaluating the curves, and became the first to apply them to computer-aided design at French automaker Citroën. De Casteljau's method was patented in France but not published until the 1980s while the Bézier polynomials were widely publicised in the 1960s by the French engineer Pierre Bézier, who discovered them independently and used them to design automobile bodies at Renault.


## Specific cases

A Bézier curve is defined by a set of control points P0 through Pn, where n is called the order of the curve (n = 1 for linear, 2 for quadratic, 3 for cubic, etc.). The first and last control points are always the endpoints of the curve; however, the intermediate control points generally do not lie on the curve. The sums in the following sections are to be understood as affine combinations – that is, the coefficients sum to 1.


### Linear Bézier curves

Given distinct points P0 and P1, a linear Bézier curve is simply a line between those two points. The curve is given by


$$\mathbf {B} (t)=\mathbf {P} _{0}+t(\mathbf {P} _{1}-\mathbf {P} _{0})=(1-t)\mathbf {P} _{0}+t\mathbf {P} _{1},\ 0\leq t\leq 1
$$

This is the simplest and is equivalent to linear interpolation. The quantity $\mathbf {P} _{1}-\mathbf {P} _{0}$ represents the displacement vector from the start point to the end point.


### Quadratic Bézier curves

A quadratic Bézier curve is the path traced by the function B(t), given points P0, P1, and P2,


$$\mathbf {B} (t)=(1-t)[(1-t)\mathbf {P} _{0}+t\mathbf {P} _{1}]+t[(1-t)\mathbf {P} _{1}+t\mathbf {P} _{2}],\ 0\leq t\leq 1
$$,

which can be interpreted as the linear interpolant of corresponding points on the linear Bézier curves from P0 to P1 and from P1 to P2 respectively. Rearranging the preceding equation yields:


$$\mathbf {B} (t)=(1-t)^{2}\mathbf {P} _{0}+2(1-t)t\mathbf {P} _{1}+t^{2}\mathbf {P} _{2},\ 0\leq t\leq 1.
$$

This can be written in a way that highlights the symmetry with respect to P1:


$$\mathbf {B} (t)=\mathbf {P} _{1}+(1-t)^{2}(\mathbf {P} _{0}-\mathbf {P} _{1})+t^{2}(\mathbf {P} _{2}-\mathbf {P} _{1}),\ 0\leq t\leq 1.
$$

Which immediately gives the derivative of the Bézier curve with respect to t:


$$\mathbf {B} '(t)=2(1-t)(\mathbf {P} _{1}-\mathbf {P} _{0})+2t(\mathbf {P} _{2}-\mathbf {P} _{1}),
$$

from which it can be concluded that the tangents to the curve at P0 and P2 intersect at P1. As t increases from 0 to 1, the curve departs from P0 in the direction of P1, then bends to arrive at P2 from the direction of P1.

The second derivative of the Bézier curve with respect to t is


$$\mathbf {B} ''(t)=2(\mathbf {P} _{2}-2\mathbf {P} _{1}+\mathbf {P} _{0}).
$$


### Cubic Bézier curves

Four points P0, P1, P2 and P3 in the plane or in higher-dimensional space define a cubic Bézier curve. The curve starts at P0 going toward P1 and arrives at P3 coming from the direction of P2. Usually, it will not pass through P1 or P2; these points are only there to provide directional information. The distance between P1 and P2 determines "how far" and "how fast" the curve moves towards P1 before turning towards P2.

Writing BPi,Pj,Pk(t) for the quadratic Bézier curve defined by points Pi, Pj, and Pk, the cubic Bézier curve can be defined as an affine combination of two quadratic Bézier curves:


$$\mathbf {B} (t)=(1-t)\mathbf {B} _{\mathbf {P} _{0},\mathbf {P} _{1},\mathbf {P} _{2}}(t)+t\mathbf {B} _{\mathbf {P} _{1},\mathbf {P} _{2},\mathbf {P} _{3}}(t),\ 0\leq t\leq 1.
$$

The explicit form of the curve is:


$$\mathbf {B} (t)=(1-t)^{3}\mathbf {P} _{0}+3(1-t)^{2}t\mathbf {P} _{1}+3(1-t)t^{2}\mathbf {P} _{2}+t^{3}\mathbf {P} _{3},\ 0\leq t\leq 1.
$$

For some choices of P1 and P2 the curve may intersect itself, or contain a cusp.

Any series of 4 distinct points can be converted to a cubic Bézier curve that goes through all 4 points in order. Given the starting and ending point of some cubic Bézier curve, and the points along the curve corresponding to t = 1/3 and t = 2/3, the control points for the original Bézier curve can be recovered.

The derivative of the cubic Bézier curve with respect to t is


$$\mathbf {B} '(t)=3(1-t)^{2}(\mathbf {P} _{1}-\mathbf {P} _{0})+6(1-t)t(\mathbf {P} _{2}-\mathbf {P} _{1})+3t^{2}(\mathbf {P} _{3}-\mathbf {P} _{2})\,.
$$

The second derivative of the Bézier curve with respect to t is


$$\mathbf {B} ''(t)=6(1-t)(\mathbf {P} _{2}-2\mathbf {P} _{1}+\mathbf {P} _{0})+6t(\mathbf {P} _{3}-2\mathbf {P} _{2}+\mathbf {P} _{1})\,.
$$

For control points whose consecutive triples form two similar triangles with the same orientation, the resulting cubic Bézier curve is an arc of a (scaled and translated) Tschirnhausen cubic. These are Pythagorean hodograph curves, curves whose arc length and offset curves have a rational parameterization, and they are the only cubic curves with these properties.


## General definition

Bézier curves can be defined for any degree n.


### Recursive definition

A recursive definition for the Bézier curve of degree n expresses it as a point-to-point linear combination (linear interpolation) of a pair of corresponding points in two Bézier curves of degree n − 1.

Let
$$\mathbf {B} _{\mathbf {P} _{0}\mathbf {P} _{1}\ldots \mathbf {P} _{k}}
$$denote the Bézier curve determined by any selection of points P0, P1, ..., Pk. Then to start,


$$\mathbf {B} _{\mathbf {P} _{0}}(t)=\mathbf {P} _{0}{\text{, and}}
$$


$$\mathbf {B} (t)=\mathbf {B} _{\mathbf {P} _{0}\mathbf {P} _{1}\ldots \mathbf {P} _{n}}(t)=(1-t)\mathbf {B} _{\mathbf {P} _{0}\mathbf {P} _{1}\ldots \mathbf {P} _{n-1}}(t)+t\mathbf {B} _{\mathbf {P} _{1}\mathbf {P} _{2}\ldots \mathbf {P} _{n}}(t)
$$

This recursion is elucidated in the animations below.


### Explicit definition

The formula can be expressed explicitly as follows (where t and (1-t) are extended continuously to be 1 throughout [0,1]):


$${\begin{aligned}\mathbf {B} (t)&=\sum _{i=0}^{n}{n \choose i}(1-t)^{n-i}t^{i}\mathbf {P} _{i}\\&=(1-t)^{n}\mathbf {P} _{0}+{n \choose 1}(1-t)^{n-1}t\mathbf {P} _{1}+\cdots +{n \choose n-1}(1-t)t^{n-1}\mathbf {P} _{n-1}+t^{n}\mathbf {P} _{n},&&0\leqslant t\leqslant 1\end{aligned}}
$$

where $\scriptstyle {n \choose i}$ are the binomial coefficients.

For example, when n = 5:


$${\begin{aligned}\mathbf {B} (t)&=(1-t)^{5}\mathbf {P} _{0}+5t(1-t)^{4}\mathbf {P} _{1}+10t^{2}(1-t)^{3}\mathbf {P} _{2}+10t^{3}(1-t)^{2}\mathbf {P} _{3}+5t^{4}(1-t)\mathbf {P} _{4}+t^{5}\mathbf {P} _{5},&&0\leqslant t\leqslant 1.\end{aligned}}
$$


### Terminology

Some terminology is associated with these parametric curves. We have


$$\mathbf {B} (t)=\sum _{i=0}^{n}b_{i,n}(t)\mathbf {P} _{i},\ \ \ 0\leq t\leq 1
$$

where the polynomials


$$b_{i,n}(t)={n \choose i}t^{i}(1-t)^{n-i},\ \ \ i=0,\ldots ,n
$$

are known as Bernstein basis polynomials of degree n.

t = 1, (1 − t) = 1, and the binomial coefficient, $\scriptstyle {n \choose i}$, is:


$${n \choose i}={\frac {n!}{i!(n-i)!}}.
$$

The points Pi are called control points for the Bézier curve. The polygon formed by connecting the Bézier points with lines, starting with P0 and finishing with Pn, is called the Bézier polygon (or control polygon). The convex hull of the Bézier polygon contains the Bézier curve.


### Polynomial form

Sometimes it is desirable to express the Bézier curve as a polynomial instead of a sum of less straightforward Bernstein polynomials. Application of the binomial theorem to the definition of the curve followed by some rearrangement will yield


$$\mathbf {B} (t)=\sum _{j=0}^{n}{t^{j}\mathbf {C} _{j}}
$$


$$\mathbf {C} _{j}={\frac {n!}{(n-j)!}}\sum _{i=0}^{j}{\frac {(-1)^{i+j}\mathbf {P} _{i}}{i!(j-i)!}}=\prod _{m=0}^{j-1}(n-m)\sum _{i=0}^{j}{\frac {(-1)^{i+j}\mathbf {P} _{i}}{i!(j-i)!}}.
$$

This could be practical if $\mathbf {C} _{j}$ can be computed prior to many evaluations of $\mathbf {B} (t)$; however one should use caution as high order curves may lack numeric stability (de Casteljau's algorithm should be used if this occurs). Note that the empty product is 1.


### Properties


- The curve begins at $\mathbf {P} _{0}$ and ends at $\mathbf {P} _{n}$; this is the so-called endpoint interpolation property.
- The curve is a line if and only if all the control points are collinear.
- The start and end of the curve is tangent to the first and last section of the Bézier polygon, respectively.
- A curve can be split at any point into two subcurves, or into arbitrarily many subcurves, each of which is also a Bézier curve.
- Some curves that seem simple, such as the circle, cannot be described exactly by a Bézier or piecewise Bézier curve; though a four-piece cubic Bézier curve can approximate a circle (see composite Bézier curve), with a maximum radial error of less than one part in a thousand, when each inner control point (or offline point) is the distance
$$\textstyle {\frac {4\left({\sqrt {2}}-1\right)}{3}}
$$horizontally or vertically from an outer control point on a unit circle. More generally, an n-piece cubic Bézier curve can approximate a circle, when each inner control point is the distance
$$\textstyle {\frac {4}{3}}\tan(t/4)
$$from an outer control point on a unit circle, where ${\textstyle t=2\pi /n}$ (i.e. $t=360^{\circ }/n$), and $n>2$.
- Every quadratic Bézier curve is also a cubic Bézier curve, and more generally, every degree n Bézier curve is also a degree m curve for any m > n. In detail, a degree n curve with control points $\mathbf {P} _{0},\,\dots ,\,\mathbf {P} _{n}$ is equivalent (including the parametrization) to the degree n + 1 curve with control points $\mathbf {P} '_{0},\,\dots ,\,\mathbf {P} '_{n+1}$, where
$$\mathbf {P} '_{k}={\tfrac {k}{n+1}}\mathbf {P} _{k-1}+\left(1-{\tfrac {k}{n+1}}\right)\mathbf {P} _{k}
$$, $\forall k=0,\,1,\,\dots ,\,n,\,n+1$ and define $\mathbf {P} _{n+1}:=\mathbf {P} _{0}$, $\mathbf {P} _{-1}:=\mathbf {P} _{n}$.
- Bézier curves have the variation diminishing property. What this means in intuitive terms is that a Bézier curve does not "undulate" more than the polygon of its control points, and may actually "undulate" less than that.
- There is no local control in degree n Bézier curves—meaning that any change to a control point requires recalculation of and thus affects the aspect of the entire curve, "although the further that one is from the control point that was changed, the smaller is the change in the curve".
- A Bézier curve of order higher than two may intersect itself or have a cusp for certain choices of the control points.


### Second-order curve is a parabolic segment

A quadratic Bézier curve is also a segment of a parabola. As a parabola is a conic section, some sources refer to quadratic Béziers as "conic arcs". With reference to the figure on the right, the important features of the parabola can be derived as follows:


1. Tangents to the parabola at the endpoints of the curve (A and B) intersect at its control point (C).
2. If D is the midpoint of AB, the tangent to the curve which is perpendicular to CD (dashed cyan line) defines its vertex (V). Its axis of symmetry (dash-dot cyan) passes through V and is perpendicular to the tangent.
3. E is either point on the curve with a tangent at 45° to CD (dashed green). If G is the intersection of this tangent and the axis, the line passing through G and perpendicular to CD is the directrix (solid green).
4. The focus (F) is at the intersection of the axis and a line passing through E and perpendicular to CD (dotted yellow). The latus rectum is the line segment within the curve (solid yellow).


### Derivative

The derivative for a curve of order n is


$$\mathbf {B} '(t)=n\sum _{i=0}^{n-1}b_{i,n-1}(t)(\mathbf {P} _{i+1}-\mathbf {P} _{i}).
$$


## Constructing Bézier curves


### Linear curves

Let t denote the fraction of progress (from 0 to 1) the point B(t) has made along its traversal from P0 to P1. For example, when t=0.25, B(t) is one quarter of the way from point P0 to P1. As t varies from 0 to 1, B(t) draws a line from P0 to P1.


### Quadratic curves

For quadratic Bézier curves one can construct intermediate points Q0 and Q1 such that as t varies from 0 to 1:


- Point Q0(t) varies from P0 to P1 and describes a linear Bézier curve.
- Point Q1(t) varies from P1 to P2 and describes a linear Bézier curve.
- Point B(t) is interpolated linearly between Q0(t) to Q1(t) and describes a quadratic Bézier curve.


### Higher-order curves

For higher-order curves one needs correspondingly more intermediate points. For cubic curves one can construct intermediate points Q0, Q1, and Q2 that describe linear Bézier curves, and points R0 and R1 that describe quadratic Bézier curves:

For fourth-order curves one can construct intermediate points Q0, Q1, Q2 and Q3 that describe linear Bézier curves, points R0, R1 and R2 that describe quadratic Bézier curves, and points S0 and S1 that describe cubic Bézier curves:

For fifth-order curves, one can construct similar intermediate points.

These representations rest on the process used in De Casteljau's algorithm to calculate Bézier curves.


### Offsets (or stroking) of Bézier curves

The curve at a fixed offset from a given Bézier curve, called an offset or parallel curve in mathematics (lying "parallel" to the original curve, like the offset between rails in a railroad track), cannot be exactly formed by a Bézier curve (except in some trivial cases). In general, the two-sided offset curve of a cubic Bézier is a 10th-order algebraic curve and more generally for a Bézier of degree n the two-sided offset curve is an algebraic curve of degree 4n − 2. However, there are heuristic methods that usually give an adequate approximation for practical purposes.

In the field of vector graphics, painting two symmetrically distanced offset curves is called stroking (the Bézier curve or in general a path of several Bézier segments). The conversion from offset curves to filled Bézier contours is of practical importance in converting fonts defined in Metafont, which require stroking of Bézier curves, to the more widely used PostScript type 1 fonts, which only require (for efficiency purposes) the mathematically simpler operation of filling a contour defined by (non-self-intersecting) Bézier curves.


## Degree elevation

A Bézier curve of degree n can be converted into a Bézier curve of degree n + 1 with the same shape. This is useful if software supports Bézier curves only of specific degree. For example, systems that can only work with cubic Bézier curves can implicitly work with quadratic curves by using their equivalent cubic representation.

To do degree elevation, we use the equality
$$\mathbf {B} (t)=(1-t)\mathbf {B} (t)+t\mathbf {B} (t).
$$Each component $\mathbf {b} _{i,n}(t)\mathbf {P} _{i}$ is multiplied by (1 − t) and t, thus increasing a degree by one, without changing the value. Here is the example of increasing degree from 2 to 3.


$${\begin{aligned}(1-t)^{2}\mathbf {P} _{0}+2(1-t)t\mathbf {P} _{1}+t^{2}\mathbf {P} _{2}&=(1-t)^{3}\mathbf {P} _{0}+2(1-t)^{2}t\mathbf {P} _{1}+(1-t)t^{2}\mathbf {P} _{2}+(1-t)^{2}t\mathbf {P} _{0}+2(1-t)t^{2}\mathbf {P} _{1}+t^{3}\mathbf {P} _{2}\\&=(1-t)^{3}\mathbf {P} _{0}+(1-t)^{2}t\left(\mathbf {P} _{0}+2\mathbf {P} _{1}\right)+(1-t)t^{2}\left(2\mathbf {P} _{1}+\mathbf {P} _{2}\right)+t^{3}\mathbf {P} _{2}\\&=(1-t)^{3}\mathbf {P} _{0}+3(1-t)^{2}t{\tfrac {1}{3}}\left(\mathbf {P} _{0}+2\mathbf {P} _{1}\right)+3(1-t)t^{2}{\tfrac {1}{3}}\left(2\mathbf {P} _{1}+\mathbf {P} _{2}\right)+t^{3}\mathbf {P} _{2}\end{aligned}}
$$

In other words, the original start and end points are unchanged. The new control points are
$$\mathbf {P'} _{1}={\tfrac {1}{3}}\left(\mathbf {P} _{0}+2\mathbf {P} _{1}\right)
$$and
$$\mathbf {P'} _{2}={\tfrac {1}{3}}\left(2\mathbf {P} _{1}+\mathbf {P} _{2}\right)
$$.

For arbitrary n we use equalities


$${\begin{cases}{n+1 \choose i}(1-t)\mathbf {b} _{i,n}={n \choose i}\mathbf {b} _{i,n+1}\\{n+1 \choose i+1}t\mathbf {b} _{i,n}={n \choose i}\mathbf {b} _{i+1,n+1}\end{cases}}\quad \implies \quad {\begin{cases}(1-t)\mathbf {b} _{i,n}={\frac {n+1-i}{n+1}}\mathbf {b} _{i,n+1}\\t\mathbf {b} _{i,n}={\frac {i+1}{n+1}}\mathbf {b} _{i+1,n+1}\end{cases}}
$$


$${\begin{aligned}\mathbf {B} (t)&=(1-t)\sum _{i=0}^{n}\mathbf {b} _{i,n}(t)\mathbf {P} _{i}+t\sum _{i=0}^{n}\mathbf {b} _{i,n}(t)\mathbf {P} _{i}\\&=\sum _{i=0}^{n}{\frac {n+1-i}{n+1}}\mathbf {b} _{i,n+1}(t)\mathbf {P} _{i}+\sum _{i=0}^{n}{\frac {i+1}{n+1}}\mathbf {b} _{i+1,n+1}(t)\mathbf {P} _{i}\\&=\sum _{i=0}^{n+1}\left({\frac {i}{n+1}}\mathbf {P} _{i-1}+{\frac {n+1-i}{n+1}}\mathbf {P} _{i}\right)\mathbf {b} _{i,n+1}(t)\\&=\sum _{i=0}^{n+1}\mathbf {b} _{i,n+1}(t)\mathbf {P'} _{i}\end{aligned}}
$$

introducing arbitrary $\mathbf {P} _{-1}$ and $\mathbf {P} _{n+1}$.

Therefore, new control points are


$$\mathbf {P'} _{i}={\frac {i}{n+1}}\mathbf {P} _{i-1}+{\frac {n+1-i}{n+1}}\mathbf {P} _{i},\quad i=0,\ldots ,n+1.
$$


### Repeated degree elevation

The concept of degree elevation can be repeated on a control polygon R to get a sequence of control polygons R, R1, R2, and so on. After r degree elevations, the polygon Rr has the vertices P0,r, P1,r, P2,r, ..., Pn+r,r given by


$$\mathbf {P} _{i,r}=\sum _{j=0}^{n}\mathbf {P} _{j}{\tbinom {n}{j}}{\frac {\tbinom {r}{i-j}}{\tbinom {n+r}{i}}}.
$$

It can also be shown that for the underlying Bézier curve B,

$\mathbf {\lim _{r\to \infty }R_{r}} =\mathbf {B} .$


### Degree reduction

Degree reduction can only be done exactly when the curve in question is originally elevated from a lower degree. A number of approximation algorithms have been proposed and used in practice.


## Rational Bézier curves

The rational Bézier curve adds adjustable weights to provide closer approximations to arbitrary shapes. The numerator is a weighted Bernstein-form Bézier curve and the denominator is a weighted sum of Bernstein polynomials. Rational Bézier curves can, among other uses, be used to represent segments of conic sections exactly, including circular arcs.

Given n + 1 control points P0, ..., Pn, the rational Bézier curve can be described by


$$\mathbf {B} (t)={\frac {\sum _{i=0}^{n}b_{i,n}(t)\mathbf {P} _{i}w_{i}}{\sum _{i=0}^{n}b_{i,n}(t)w_{i}}},
$$


$$\mathbf {B} (t)={\frac {\sum _{i=0}^{n}{n \choose i}t^{i}(1-t)^{n-i}\mathbf {P} _{i}w_{i}}{\sum _{i=0}^{n}{n \choose i}t^{i}(1-t)^{n-i}w_{i}}}.
$$

The expression can be extended by using number systems besides reals for the weights. In the complex plane the points {1}, {-1}, and {1} with weights {$i$}, {1}, and {$-i$} generate a full circle with radius one. For curves with points and weights on a circle, the weights can be scaled without changing the curve's shape. Scaling the central weight of the above curve by 1.35508 gives a more uniform parameterization.


## Applications


### Computer graphics

Bézier curves are widely used in computer graphics to model smooth curves. As the curve is completely contained in the convex hull of its control points, the points can be graphically displayed and used to manipulate the curve intuitively. Affine transformations such as translation and rotation can be applied on the curve by applying the respective transform on the control points of the curve.

Quadratic and cubic Bézier curves are most common. Higher degree curves are more computationally expensive to evaluate. When more complex shapes are needed, low order Bézier curves are patched together, producing a composite Bézier curve. A composite Bézier curve is commonly referred to as a "path" in vector graphics languages (like PostScript), vector graphics standards (like SVG) and vector graphics programs (like Artline 1990 , Timeworks Publisher early 1990s , Adobe Illustrator, CorelDraw, Inkscape, and Allegro). In order to join Bézier curves into a composite Bézier curve without kinks, a property called G1 continuity suffices to force the control point at which two constituent Bézier curves meet to lie on the line defined by the two control points on either side.

The simplest method for scan converting (rasterizing) a Bézier curve is to evaluate it at many closely spaced points and scan convert the approximating sequence of line segments. However, this does not guarantee that the rasterized output looks sufficiently smooth, because the points may be spaced too far apart. Conversely it may generate too many points in areas where the curve is close to linear. A common adaptive method is recursive subdivision, in which a curve's control points are checked to see if the curve approximates a line to within a small tolerance. If not, the curve is subdivided parametrically into two segments, 0 ≤ t ≤ 0.5 and 0.5 ≤ t ≤ 1, and the same procedure is applied recursively to each half. There are also forward differencing methods, but great care must be taken to analyse error propagation.

Analytical methods where a Bézier is intersected with each scan line involve finding roots of cubic polynomials (for cubic Béziers) and dealing with multiple roots, so they are not often used in practice.

The rasterisation algorithm used in Metafont is based on discretising the curve, so that it is approximated by a sequence of "rook moves" that are purely vertical or purely horizontal, along the pixel boundaries. To that end, the plane is first split into eight 45° sectors (by the coordinate axes and the two lines $y=\pm x$), then the curve is decomposed into smaller segments such that the direction of a curve segment stays within one sector; since the curve velocity is a second degree polynomial, finding the $t$ values where it is parallel to one of these lines can be done by solving quadratic equations. Within each segment, either horizontal or vertical movement dominates, and the total number of steps in either direction can be read off from the endpoint coordinates; in for example the 0–45° sector horizontal movement to the right dominates, so it only remains to decide between which steps to the right the curve should make a step up.

There is also a modified curve form of Bresenham's line drawing algorithm by Zingl that performs this rasterization by subdividing the curve into rational pieces and calculating the error at each pixel location such that it either travels at a 45° angle or straight depending on compounding error as it iterates through the curve. This reduces the next step calculation to a series of integer additions and subtractions.


### Animation

In animation applications, such as Adobe Flash and Synfig, Bézier curves are used to outline, for example, movement. Users outline the wanted path in Bézier curves, and the application creates the needed frames for the object to move along the path.

In 3D animation, Bézier curves are often used to define 3D paths as well as 2D curves for keyframe interpolation. Bézier curves are now very frequently used to control the animation easing in CSS, JavaScript, JavaFx and Flutter SDK.


### Fonts

TrueType fonts use composite Bézier curves composed of quadratic Bézier curves. Other languages and imaging tools (such as PostScript, Asymptote, Metafont, and SVG) use composite Béziers composed of cubic Bézier curves for drawing curved shapes. OpenType fonts can use either kind of curve, depending on which font technology underlies the OpenType wrapper.

Font engines, like FreeType, draw the font's curves (and lines) on a pixellated surface using a process known as font rasterization. Typically font engines and vector graphics engines render Bézier curves by splitting them recursively up to the point where the curve is flat enough to be drawn as a series of linear or circular segments. The exact splitting algorithm is implementation dependent, only the flatness criteria must be respected to reach the necessary precision and to avoid non-monotonic local changes of curvature. The "smooth curve" feature of charts in Microsoft Excel also uses this algorithm.

Because arcs of circles and ellipses cannot be exactly represented by Bézier curves, they are first approximated by Bézier curves, which are in turn approximated by arcs of circles. This is inefficient as there exists also approximations of all Bézier curves using arcs of circles or ellipses, which can be rendered incrementally with arbitrary precision. Another approach, used by modern hardware graphics adapters with accelerated geometry, can convert exactly all Bézier and conic curves (or surfaces) into NURBS, that can be rendered incrementally without first splitting the curve recursively to reach the necessary flatness condition. This approach also preserves the curve definition under all linear or perspective 2D and 3D transforms and projections.


### Robotics

Because the control polygon allows to tell whether or not the path collides with any obstacles, Bézier curves are used in producing trajectories of the end effectors. Furthermore, joint space trajectories can be accurately differentiated using Bézier curves. Consequently, the derivatives of joint space trajectories are used in the calculation of the dynamics and control effort (torque profiles) of the robotic manipulator.


## See also


- Bézier surface
- B-spline
- GEM/4 and GEM/5
- Hermite curve
- NURBS
- String art – Bézier curves are also formed by many common forms of string art, where strings are looped across a frame of nails.
- Variation diminishing property of Bézier curves


### Sources


## Further reading


- A Primer on Bézier Curves – an open source online book explaining Bézier curves and associated graphics algorithms, with interactive graphics
- Cubic Bezier Curves – Under the Hood (video) – video showing how computers render a cubic Bézier curve, by Peter Nowell
- From Bézier to Bernstein Feature Column from American Mathematical Society
- "Bézier curve", Encyclopedia of Mathematics, EMS Press, 2001 [1994]
- Prautzsch, Hartmut; Boehm, Wolfgang; Paluszny, Marco (2002). Bézier and B-Spline Techniques. Springer Science & Business Media. ISBN 978-3-540-43761-1.
- Gallier, Jean (1999). "Chapter 5. Polynomial Curves as Bézier Curves". Curves and Surfaces in Geometric Modeling: Theory and Algorithms. Morgan Kaufmann. This book is out of print and freely available from the author.
- Farin, Gerald E. (2002). Curves and Surfaces for CAGD: A Practical Guide (5th ed.). Morgan Kaufmann. ISBN 978-1-55860-737-8.
- Weisstein, Eric W. "Bézier Curve". MathWorld.
- Hoffmann, Gernot. "Bézier Curves" (PDF). Archived from the original (PDF) on 2006-12-02. (60 pages)
- Ahn, Young Joon (2004). "Approximation of circular arcs and offset curves by Bézier curves of high degree". Journal of Computational and Applied Mathematics. 167 (2): 405–416. Bibcode:2004JCoAM.167..405A. doi:10.1016/j.cam.2003.10.008.
- Davies, Jason. "Animated Bézier curves".
- Hovey, Chad (2022). Formulation and Python Implementation of Bézier and B-Spline Geometry. SAND2022-7702C. (153 pages)


## External links


**Computer code**


- TinySpline: Open source C-library for NURBS, B-splines and Bézier curves with bindings for various languages
- C++ library to generate Bézier functions at compile time
- Simple Bézier curve implementation via recursive method in Python
