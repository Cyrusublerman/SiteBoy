# Curvature

In mathematics, curvature is any of several strongly related concepts in geometry that intuitively measure the amount by which a curve deviates from being a straight line or by which a surface deviates from being a plane. If a curve or surface is contained in a larger space, curvature can be defined extrinsically relative to the ambient space. Curvature of Riemannian manifolds of dimension at least two can be defined intrinsically without reference to a larger space.

For curves, curvature describes how sharply the curve bends. The canonical examples are circles: smaller circles bend more sharply and hence have higher curvature. For a point on a general curve, the direction of the curve is described by its tangent line. How sharply the curve is bending at that point can be measured by how much that tangent line changes direction per unit distance along the curve.

Curvature measures the angular rate of change of the direction of the tangent line, or the unit tangent vector, of the curve per unit distance along the curve. Curvature is expressed in units of radians per unit distance. For a circle, that rate of change is the same at all points on the circle and is equal to the reciprocal of the circle’s radius. Straight lines don’t change direction and have zero curvature. The curvature at a point on a twice differentiable curve is the magnitude of its curvature vector at that point and is also the curvature of its osculating circle, which is the circle that best approximates the curve near that point.

For surfaces (and, more generally for higher-dimensional manifolds), that are embedded in a Euclidean space, the concept of curvature is more complex, as it depends on the choice of a direction on the surface or manifold. This leads to the concepts of maximal curvature, minimal curvature, and mean curvature.


## History

The history of curvature began with the ancient Greeks' basic distinction between straight and circular lines, with the concept later developed by figures like Aristotle and Apollonius. The development of calculus in the 17th century, particularly by Newton and Leibniz, provided tools to systematically calculate curvature for curves. Euler then extended the study to surfaces, followed by Gauss's crucial insight of "intrinsic" curvature, which is independent of how a surface is embedded in space, and Riemann's generalization to higher dimensions.

In Tractatus de configurationibus qualitatum et motuum, the 14th-century philosopher and mathematician Nicole Oresme introduces the concept of curvature as a measure of departure from straightness; for circles he has the curvature as being inversely proportional to the radius; and he attempts to extend this idea to other curves as a continuously varying magnitude.

The curvature of a differentiable curve was originally defined through osculating circles. In this setting, Augustin-Louis Cauchy showed that the center of curvature is the intersection point of two infinitely close normal lines to the curve.


## Curves

Intuitively, curvature describes for any part of a curve how much the curve direction changes over a small distance along the curve. The direction of the curve at any point P is described by a unit tangent vector, T. A section of a curve is also called an arc, and length along the curve is arc length, s. So the curvature for a small section of the curve is the angle of the change of the direction of the tangent vector divided by the arc length Δs. For a general curve which might have a varying curvature along its length, the curvature at a point P on the curve is the limit of the curvature of sections containing P as the length of the sections approaches zero. For a twice differentiable curve, that limit is the magnitude of the derivative of the unit tangent vector with respect to arc length. Using the lowercase Greek letter kappa to denote curvature:


$$\kappa =\left\|{\frac {\mathrm {d} {\boldsymbol {T}}}{\mathrm {d} s}}\right\|.
$$

Curvature is a differential-geometric property of the curve; it does not depend on the parametrization of the curve. In particular, it does not depend on the orientation of the parametrized curve, i.e. which direction along the curve is associated with increasing parameter values.


### Arc-length parametrization

A curve that is parametrized by arc length is a vector-valued function that is denoted by the Greek letter gamma with an overbar, –γ, that describes the position of a point on the curve, P, in terms of its arc-length distance, s along the curve from some other reference point on the curve. Thus for some interval I = [a, b] in ℝ, –γ: I → ℝ with


$${\boldsymbol {P}}(s)={\boldsymbol {\bar {\gamma }}}(s).
$$

If –γ is a differentiable curve, then the first derivative of –γ, –γ′(s) is a unit tangent vector, T(s), and


$$\left\|{\boldsymbol {\bar {\gamma }}}'(s)\right\|=1
$$


$${\boldsymbol {T}}(s)={\boldsymbol {\bar {\gamma }}}'(s).
$$

If –γ is twice differentiable, the second derivative of –γ is T′(s), which is also the curvature vector, K(s).


$${\boldsymbol {K}}(s)={\boldsymbol {T}}'(s)={\boldsymbol {\bar {\gamma }}}''(s)
$$

Curvature is the magnitude of the second derivative of –γ .
$$\kappa (s)=\left\|{\boldsymbol {K}}(s)\right\|=\left\|{\boldsymbol {T}}'(s)\right\|=\left\|{\boldsymbol {\bar {\gamma }}}''(s)\right\|
$$

The parameter s can also be interpreted as a time parameter. Then –γ(s) describes the path of a particle that moves along the curve at a constant unit speed. Curvature can then be understood as a measure of how fast the direction of the particle rotates.


### General parametrization

A twice differentiable curve, γ: [a, b] → ℝ, that is not parametrized by arc length can be re-parametrized by arc length provided that γ′(t) is everywhere not zero, so that 1/‖γ′(t)‖ is always a finite positive number.

The arc-length parameter, s, is defined by


$$s(t)~{=}~\int _{a}^{t}\left\|{\boldsymbol {\gamma }}'(x)\right\|\,\mathrm {d} {x},
$$

which has an inverse function t(s). The arc-length parametrization is the function –γ which is defined as


$${\boldsymbol {\bar {\gamma }}}(s)~{=}~{\boldsymbol {\gamma }}(t(s)).
$$

Both γ and –γ trace the same path in ℝ and so have the same curvature vector and curvature at each point P on the curve. For a given s and its corresponding t = t(s), point P and its unit tangent vector, T, curvature vector, K, and curvature, κ, are:


$${\boldsymbol {P}}={\boldsymbol {\bar {\gamma }}}(s)={\boldsymbol {\gamma }}(t)
$$


$${\boldsymbol {T}}={\boldsymbol {\bar {\gamma }}}'(s)={\frac {{\boldsymbol {\gamma }}'(t)}{\left\|{\boldsymbol {\gamma }}'(t)\right\|}}
$$


$${\boldsymbol {K}}={\boldsymbol {\bar {\gamma }}}''(s)={\frac {{\boldsymbol {\gamma }}''(t)}{\left\|{\boldsymbol {\gamma }}'(t)\right\|^{2}}}-{\boldsymbol {T}}\left({\boldsymbol {T}}\cdot {\frac {{\boldsymbol {\gamma }}''(t)}{\left\|{\boldsymbol {\gamma }}'(t)\right\|^{2}}}\right)
$$


$${\begin{aligned}\kappa =\left\|{\boldsymbol {\bar {\gamma }}}''(s)\right\|&={\frac {\sqrt {{\bigl \|}{\boldsymbol {\gamma }}'(t){\bigr \|}{\vphantom {'}}^{2}{\bigl \|}{\boldsymbol {\gamma }}''(t){\bigr \|}{\vphantom {'}}^{2}-{\bigl (}{\boldsymbol {\gamma }}'(t)\cdot {\boldsymbol {\gamma }}''(t){\bigr )}{\vphantom {'}}^{2}}}{{\bigl \|}{\boldsymbol {\gamma }}'(t){\bigr \|}{\vphantom {'}}^{3}}}\\\\&={\frac {\left\|{\boldsymbol {\gamma }}''(t)\right\|}{\left\|{\boldsymbol {\gamma }}'(t)\right\|^{2}}}{\sqrt {1-\left({\boldsymbol {T}}\cdot {\frac {{\boldsymbol {\gamma }}''(t)}{{\bigl \|}{\boldsymbol {\gamma }}''(t){\bigr \|}}}\right)^{2}~}}~~.\\\end{aligned}}
$$

The curvature vector, K, is the perpendicular component of γ′′(t) / ‖γ′(t)‖ relative to the tangent vector γ′(t). This is also reflected in the second expression for the curvature: the expression inside the parentheses is cos θ, where θ is the angle between the vectors T and γ′′(t), so that the square root produces sin θ.

If γ is twice continuously differentiable, then so is s(t) and –γ, while T(t) is continuously differentiable, and K(t) and κ(t) are continuous.

Often it is difficult or impossible to express the arc-length parametrization, –γ, in closed form even when γ is given in closed form. This is typically the case when it is difficult or impossible to express s(t) or its inverse t(s) in closed form. However curvature can be expressed only in terms of the first and second derivatives of γ, without direct reference to –γ.


### Curvature Vector

The curvature vector, denoted with an upper-case K, is the derivative of the unit tangent vector, T, with respect to arc length, s:


$${\boldsymbol {K}}={\frac {\mathrm {d} {\boldsymbol {T}}}{\mathrm {d} s}}.
$$

The curvature vector represents both the direction towards which the curve is turning as well as how sharply it turns.

The curvature vector has the following properties:


- The magnitude of the curvature vector is the curvature: $\kappa =\left\|{\boldsymbol {K}}\right\|.$


- The curvature vector is perpendicular to the unit tangent vector T, or in terms of the dot product: ${\boldsymbol {K}}\cdot {\boldsymbol {T}}=0~.$


- The curvature vector is the second derivative of an arc-length parametrization –γ :
$${\boldsymbol {K}}(s)={\boldsymbol {\bar {\gamma }}}''(s).
$$


- The curvature vector of a general parametrization, γ, is the perpendicular component of γ′′(t) / ‖γ′(t)‖ relative to the tangent vector γ′(t):
$${\boldsymbol {K}}(t)={\frac {{\boldsymbol {\gamma }}''(t)}{\left\|{\boldsymbol {\gamma }}'(t)\right\|^{2}}}-{\boldsymbol {T}}\left({\boldsymbol {T}}\cdot {\frac {{\boldsymbol {\gamma }}''(t)}{\left\|{\boldsymbol {\gamma }}'(t)\right\|^{2}}}\right).
$$If the curve is in ℝ, then the curvature vector can also be expressed as:
$${\boldsymbol {K}}(t)={\boldsymbol {T}}\times {\frac {{\boldsymbol {\gamma }}''(t)}{\left\|{\boldsymbol {\gamma }}'(t)\right\|^{2}}}\times {\boldsymbol {T}}
$$where × denotes the vector cross product.


- If the curvature vector is not zero: The curvature vector points from the point on the curve, P, in the direction of the center of the osculating circle. The curvature vector and the tangent vector are perpendicular vectors that span the osculating plane, the plane containing the osculating circle. The curvature vector scaled to unit length is the unit normal vector, N: N = K ‖ K ‖ . {\displaystyle {\boldsymbol {N}}={\frac {K}{\left\|K\right\|}}.}


- The curvature vector is a differential-geometric property of the curve at P; it does not depend on how the curve is parametrized.


### Osculating circle

Historically, the curvature of a differentiable curve was defined through the osculating circle, which is the circle that best approximates the curve at a point. More precisely, given a point P on a curve, every other point Q of the curve defines a circle (or sometimes a line) passing through Q and tangent to the curve at P. The osculating circle is the limit, if it exists, of this circle when Q tends to P. Then the center of curvature and the radius of curvature of the curve at P are the center and the radius of the osculating circle.

The radius of curvature, R, is the reciprocal of the curvature, provided that the curvature is not zero:
$$R={\frac {1}{\kappa }}~.
$$

For a curve γ, since a non-zero curvature vector, K(t), points from the point P = γ(t) towards the center of curvature, but the magnitude of K(t) is the curvature, κ(t), the center of curvature, C(t) is


$${\boldsymbol {C}}(t)={\boldsymbol {\gamma }}(t)+{\frac {{\boldsymbol {K}}(t)}{\kappa (t)^{2}}}~.
$$

When the curvature is zero, for example on a straight line or at a point of inflection, the radius of curvature is infinite and the center of curvature is indeterminate or "at infinity".


### Curvature from arc and chord length

Given two points P and Q on a curve γ, let s(P,Q) be the arc length of the portion of the curve between P and Q and let d(P,Q) denote the length of the line segment from P to Q. The curvature of γ at P is given by the limit


$$\kappa ({\boldsymbol {P}})=\lim _{{\boldsymbol {Q}}\to {\boldsymbol {P}}}{\sqrt {\frac {24{\bigl (}s({\boldsymbol {P}},{\boldsymbol {Q}})-d({\boldsymbol {P}},{\boldsymbol {Q}}){\bigr )}}{s({\boldsymbol {P}},{\boldsymbol {Q}}){\vphantom {Q}}^{3}}}}~,
$$

where the limit is taken as the point Q approaches P on γ. The denominator can equally well be taken to be d(P,Q). The formula is valid in any dimension. The formula follows by verifying it for the osculating circle.


### Exceptional cases

There may be some situations where the preconditions for the above formulas do not apply, but where it is still appropriate to apply the concept of curvature.

It can be useful to apply the concept of curvature to a curve γ at a point P = γ(t0) if the one-sided derivatives for γ′(t0) exist but are different values, or likewise for γ′′(t0). In such a case, it could be useful to describe the curve with curvature at each side. Such might be the case of a curve that is constructed piecewise.

Another situation occurs when the limit of a ratio results in an indeterminate 0 / 0 value for the curvature, for example when both derivatives exist but are both zero. In such a case, it might be possible to evaluate the underlying limit using l'Hôpital's rule.


### Examples

The following are examples of curves with application of the relevant concepts and formulas.


#### Circle

A geometric explanation for why the curvature of a circle of radius R at any point P is 1/R is partially illustrated by the diagram to the right.

The length of the red arc is L and the measure in radians of the arc's central angle, angle ACB, is L/R. The angle between the arc endpoint tangents is angle BDE, which is the same size as the central angle, because both angles are supplementary to angle BDE.

The ratio of the angle between the arc endpoint tangents, measured in radians, divided by the arc length L is (L/R)/L = 1/R.

Since the ratio is 1/R for any arc of the circle that is less than a half circle, for arcs containing any given point P on the circle, the limit of the ratio as arc length approaches zero is also 1/R. Hence the curvature of the circle at any point P is 1/R.

A common parametrization of a circle of radius r is γ(t) = (r cos t, r sin t). Then
$${\begin{array}{lll}{\boldsymbol {\gamma }}'(t)=(-r~\mathrm {sin} ~t,r~\mathrm {cos} ~t)&\qquad &\left\|{\boldsymbol {\gamma }}'(t)\right\|=r\\{\boldsymbol {\gamma }}''(t)=(-r~\mathrm {cos} ~t,-r~\mathrm {sin} ~t)&\qquad &\left\|{\boldsymbol {\gamma }}''(t)\right\|=r\\{\boldsymbol {\gamma }}'(t)\cdot {\boldsymbol {\gamma }}''(t)=0~.\\\end{array}}
$$The general formula for curvature gives
$$\kappa (t)={\frac {\sqrt {r^{2}\,r^{2}-0^{2}\,}}{r^{3}}}={\frac {1}{r}}~.
$$and the formula for a plane curve gives
$$\kappa (t)={\frac {r^{2}\sin ^{2}t+r^{2}\cos ^{2}t}{{\bigl (}r^{2}\cos ^{2}t+r^{2}\sin ^{2}t{\bigr )}{\vphantom {'}}^{3/2}}}={\frac {1}{r}}.
$$

It follows, as expected, that the radius of curvature is the radius of the circle, and that the center of curvature is the center of the circle.

The circle is a rare case where the arc-length parametrization is easy to compute, as it is
$${\boldsymbol {\bar {\gamma }}}(s)=\left(r\cos {\frac {s}{r}},\,r\sin {\frac {s}{r}}\right).
$$It is an arc-length parametrization, since the norm of
$${\boldsymbol {\bar {\gamma }}}'(s)=\left(-\sin {\frac {s}{r}},\,\cos {\frac {s}{r}}\right)
$$is equal to one. Then
$$\kappa (s)=\left\|{\boldsymbol {\bar {\gamma }}}''(s)\right\|=\left\|\left(-{\frac {1}{r}}\cos {\frac {s}{r}},\,-{\frac {1}{r}}\sin {\frac {s}{r}}\right)\right\|={\frac {1}{r}}
$$gives the same value for the curvature.

The same circle can also be defined by the implicit equation F(x, y) = 0 with F(x, y) = x + y – r. Then, the formula for the curvature in this case gives
$${\begin{aligned}\kappa &={\frac {\left|F_{y}^{2}F_{xx}-2F_{x}F_{y}F_{xy}+F_{x}^{2}F_{yy}\right|}{{\bigl (}F_{x}^{2}+F_{y}^{2}{\bigr )}{\vphantom {'}}^{3/2}}}\\&={\frac {8y^{2}+8x^{2}}{{\bigl (}4x^{2}+4y^{2}{\bigr )}{\vphantom {'}}^{3/2}}}\\&={\frac {8r^{2}}{{\bigl (}4r^{2}{\bigr )}{\vphantom {'}}^{3/2}}}={\frac {1}{r}}.\end{aligned}}
$$


#### Parabola

Consider the parabola y = ax + bx + c.

It is the graph of a function, with derivative 2ax + b, and second derivative 2a. So, the signed curvature is
$$k(x)={\frac {2a}{{\bigl (}1+\left(2ax+b\right)^{2}{\bigr )}{\vphantom {)}}^{3/2}}}~.
$$It has the sign of a for all values of x. This means that, if a > 0, the concavity is upward directed everywhere; if a < 0, the concavity is downward directed; for a = 0, the curvature is zero everywhere, confirming that the parabola degenerates into a line in this case.

The (unsigned) curvature is maximal for x = –.mw-parser-output .sfrac{white-space:nowrap}.mw-parser-output .sfrac.tion,.mw-parser-output .sfrac .tion{display:inline-block;vertical-align:-0.5em;font-size:85%;text-align:center}.mw-parser-output .sfrac .num{display:block;line-height:1em;margin:0.0em 0.1em;border-bottom:1px solid}.mw-parser-output .sfrac .den{display:block;line-height:1em;margin:0.1em 0.1em}.mw-parser-output .sr-only{border:0;clip:rect(0,0,0,0);clip-path:polygon(0px 0px,0px 0px,0px 0px);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}⁠b/2a⁠, that is at the stationary point (zero derivative) of the function, which is the vertex of the parabola.

Consider the parametrization γ(t) = (t, at + bt + c) = (x, y). The first derivative of x is 1, and the second derivative is zero. Substituting into the formula for general parametrizations gives exactly the same result as above, with x replaced by t and with primes referring to derivatives with respect to the parameter t.

The same parabola can also be defined by the implicit equation F(x, y) = 0 with F(x, y) = ax + bx + c – y. As Fy = –1, and Fyy = Fxy = 0, one obtains exactly the same value for the (unsigned) curvature. However, the signed curvature is not defined for an implicit equation since the signed curvature depends on an orientation of the curve that is not provided by the implicit equation.


### Plane curves

Let γ(t) = (x(t), y(t)) be a proper parametric representation of a twice differentiable plane curve. Here proper means that on the domain of definition of the parametrization, the derivative ⁠dγ/dt⁠ exists and is nowhere equal to the zero vector.

The curvature κ of a plane curve can be expressed in ways that are specific to two dimensions, such as


$$\kappa ={\frac {\left|x'y''-y'x''\right|}{{\bigl (}{x'}^{2}+{y'}^{2}{\bigr )}{\vphantom {'}}^{3/2}}},
$$

where primes refer to derivatives with respect to t.

This can be expressed in a coordinate-free way as
$$\kappa ={\frac {\left|\det \left({\boldsymbol {\gamma }}',{\boldsymbol {\gamma }}''\right)\right|}{\|{\boldsymbol {\gamma }}'\|^{3}}},
$$

where the numerator is the absolute value of the determinant of the 2-by-2 matrix with γ′ and γ′′ as the columns.

These formulas can be understood as an application of the cross product formula for curvature in three dimensions. Since the operands have zeros in the third dimension, the cross product result will have zero values for the first two dimensions, so only the value in the third dimension is relevant to calculating the magnitude of the cross product. The formula for the value of the third dimension thus appears in the numerator of the above formulas.


#### Signed curvature

For plane curves, it can be useful to express the curvature as a single scalar that can be positive or negative, called the signed curvature or oriented curvature and denoted with a lowercase k. The signed curvature formulas are similar to those for κ except that they omit taking the absolute value of the numerator:


$$k={\frac {x'y''-y'x''}{{\bigl (}{x'}^{2}+{y'}^{2}{\bigr )}{\vphantom {'}}^{3/2}}}={\frac {\det \left({\boldsymbol {\gamma }}',{\boldsymbol {\gamma }}''\right)}{\|{\boldsymbol {\gamma }}'\|^{3}}}~.
$$

Then k = ± κ. Whether k is positive or negative depends on the orientation of the curve. Whether a positive k corresponds to clockwise or counterclockwise turning depends on the orientation of the curve and the orientation of the coordinate axes. With a standard orientation of the coordinate axes, when moving along the curve in the direction of increasing t, k is positive if the curve turns to the left, counterclockwise, and it is negative if the curve turns to the right, clockwise. This is consistent with the convention of treating counterclockwise rotations as rotations through a positive angle. However, since the sign of k is dependent on the orientation of the parametrization, k is not differential-geometric property property of the curve.

Except for orientation issues, the signed curvature for a plane curve captures similar information as the curvature vector, which for a plane curve is constrained to just one dimension, the line that is perpendicular to the unit tangent vector.

Using a standard orientation of the coordinate axes, let —N be the unit normal vector obtained from the unit tangent vector, T, by a counterclockwise rotation of ⁠π/2⁠. Then —N is dependent on the orientation of the curve and points to the left when moving along the curve in the direction of increasing t. However the curvature vector, K is equal to the product of the signed curvature, k and —N, because their orientation dependencies cancel:

${\boldsymbol {K}}=k\,{\boldsymbol {\bar {N}}}.$

Similarly, the center of curvature can be expressed using the signed curvature and —N:
$${\boldsymbol {C}}(s)={\boldsymbol {\gamma }}(s)+{\frac {\mathbf {\bar {N}} (s)}{k(s)}}.
$$


#### Graph of a function

The graph of a function y = f(x), is a special case of a parametrized curve, of the form
$${\begin{aligned}x&=t\\y&=f(t).\end{aligned}}
$$As the first and second derivatives of x are 1 and 0, previous formulas simplify to
$$\kappa ={\frac {\left|y''\right|}{{\bigl (}1+{y'}^{2}{\bigr )}{\vphantom {'}}^{3/2}}}
$$for the curvature and to
$$k={\frac {y''}{{\bigl (}1+{y'}^{2}{\bigr )}{\vphantom {'}}^{3/2}}}
$$for the signed curvature.

In the general case of a curve, the sign of the signed curvature is somewhat arbitrary, as it depends on the orientation of the curve. In the case of the graph of a function, there is a natural orientation by increasing values of x. This gives additional significance to the sign of the signed curvature.

The sign of the signed curvature is the same as the sign of the second derivative of f. If it is positive then the graph has an upward concavity, and, if it is negative the graph has a downward concavity. If it is zero, then one has an inflection point or an undulation point.

When the slope of the graph (that is the derivative of the function) is small, the signed curvature is well approximated by the second derivative. More precisely, using big O notation, one has
$$k(x)=y''{\Bigl (}1+O{\bigl (}{\textstyle y'}^{2}{\bigr )}{\Bigr )}.
$$

It is common in physics and engineering to approximate the curvature with the second derivative, for example, in beam theory or for deriving the wave equation of a string under tension, and other applications where small slopes are involved. This often allows systems that are otherwise nonlinear to be treated approximately as linear.


#### Implicit curve

For a curve defined by an implicit equation F(x, y) = 0 with partial derivatives denoted Fx , Fy , Fxx , Fxy , Fyy , the curvature is given by
$$\kappa ={\frac {\left|F_{y}^{2}F_{xx}-2F_{x}F_{y}F_{xy}+F_{x}^{2}F_{yy}\right|}{{\bigl (}F_{x}^{2}+F_{y}^{2}{\bigr )}{\vphantom {'}}^{3/2}}}.
$$

The signed curvature is not defined, as it depends on an orientation of the curve that is not provided by the implicit equation. Note that changing F into –F would not change the curve defined by F(x, y) = 0, but it would change the sign of the numerator if the absolute value were omitted in the preceding formula.

A point of the curve where Fx = Fy = 0 is a singular point, which means that the curve is not differentiable at this point, and thus that the curvature is not defined (most often, the point is either a crossing point or a cusp).

The above formula for the curvature can be derived from the expression of the curvature of the graph of a function by using the implicit function theorem and the fact that, on such a curve, one has
$${\frac {dy}{dx}}=-{\frac {F_{x}}{F_{y}}}.
$$


#### Polar coordinates

If a curve is defined in polar coordinates by the radius expressed as a function of the polar angle, that is r is a function of θ, then its curvature is
$$\kappa (\theta )={\frac {\left|r^{2}+2{r'}^{2}-r\,r''\right|}{{\bigl (}r^{2}+{r'}^{2}{\bigr )}{\vphantom {'}}^{3/2}}},
$$where the prime refers to differentiation with respect to θ.

This results from the formula for general parametrizations, by considering the parametrization
$${\begin{aligned}x&=r\cos \theta \\y&=r\sin \theta .\end{aligned}}
$$


#### Curvature comb

A curvature comb can be used to represent graphically the curvature of every point on a curve. If γ is a curve parametrized t, its comb is defined as the parametrized curve defined by
$$\mathrm {Comb} (t)={\boldsymbol {\gamma }}(t)-s\,\kappa (t){\boldsymbol {N}}(t),
$$where κ is the curvature, N is the unit normal vector that points toward the center of curvature, and s is a scaling factor that is chosen to enhance the graphical representation.

Curvature combs are useful when combining two different curves in CAD environments. They provide a visual representation of the continuity between the curves. The continuity can be defined as being in one of four levels.

G0 : The 2 curvature combs are at an angle at the junction.

G1 : The teeth of the 2 combs are parallel at the junction but are of different length.

G2 : The teeth are parallel and of the same length. However the tangents of the 2 combs are not the same.

G3 : The teeth are parallel and of the same length and the tangents of the 2 combs are the same.

The above image shows a G2 continuity at the 2 junctions.


#### Frenet–Serret formulas for plane curves

The first Frenet–Serret formula relates the unit tangent vector, curvature, and the normal vector of an arc-length parametrization $\mathbf {T} '(s)=\kappa (s)\mathbf {N} (s),$ where the primes refer to the derivatives with respect to the arc length s, and N(s) is the normal unit vector in the direction of T′(s).

As planar curves have zero torsion, the second Frenet–Serret formula provides the relation
$${\begin{aligned}{\frac {d\mathbf {N} }{ds}}&=-\kappa \mathbf {T} ,\\&=-\kappa {\frac {d{\boldsymbol {\gamma }}}{ds}}.\end{aligned}}
$$

For a general parametrization by a parameter t, one needs expressions involving derivatives with respect to t. As these are obtained by multiplying by ⁠ds/dt⁠ the derivatives with respect to s, one has, for any proper parametrization
$$\mathbf {N} '(t)=-\kappa (t){\boldsymbol {\gamma }}'(t).
$$


### Curves in three dimensions

For a parametrically defined curve in three dimensions given in Cartesian coordinates by γ(t) = (x(t), y(t), z(t)), the curvature is


$$\kappa ={\frac {\sqrt {{\bigl (}z''y'-y''z'{\bigr )}{\vphantom {'}}^{2}+{\bigl (}x''z'-z''x'{\bigr )}{\vphantom {'}}^{2}+{\bigl (}y''x'-x''y'{\bigr )}{\vphantom {'}}^{2}}}{{\bigl (}{x'}^{2}+{y'}^{2}+{z'}^{2}{\bigr )}{\vphantom {'}}^{3/2}}},
$$

where the prime denotes differentiation with respect to the parameter t. Both the curvature and the curvature vector can be expressed using the vector cross product and the unit tangent vector T:


$${\boldsymbol {K}}={\boldsymbol {T}}\times {\frac {{\boldsymbol {\gamma }}''}{\left\|{\boldsymbol {\gamma }}'\right\|^{2}}}\times {\boldsymbol {T}}
$$


$$\kappa ={\frac {{\bigl \|}{\boldsymbol {\gamma }}'\times {\boldsymbol {\gamma }}''{\bigr \|}}{{\bigl \|}{\boldsymbol {\gamma }}'{\bigr \|}{\vphantom {'}}^{3}}}~.
$$

These formulas are related to the general formulas for curvature and the curvature vector, except that they use the vector cross product instead of the scalar dot product to express the perpendicular component of γ′′ / ‖γ′‖^2 relative to γ′.


## Surfaces

The curvature of curves drawn on a surface is the main tool for the defining and studying the curvature of the surface.


### Curves on surfaces

For a curve drawn on a surface (embedded in three-dimensional Euclidean space), several curvatures are defined, which relates the direction of curvature to the surface's unit normal vector, including the:


- normal curvature
- geodesic curvature
- geodesic torsion

Any non-singular curve on a smooth surface has its tangent vector T contained in the tangent plane of the surface. The normal curvature, kn, is the curvature of the curve projected onto the plane containing the curve's tangent T and the surface normal u; the geodesic curvature, kg, is the curvature of the curve projected onto the surface's tangent plane; and the geodesic torsion (or relative torsion), τr, measures the rate of change of the surface normal around the curve's tangent.

Let the curve be arc-length parametrized, and let t = u × T so that T, t, u form an orthonormal basis, called the Darboux frame. The above quantities are related by:


$${\begin{pmatrix}\mathbf {T} '\\\mathbf {t} '\\\mathbf {u} '\end{pmatrix}}={\begin{pmatrix}0&\kappa _{\mathrm {g} }&\kappa _{\mathrm {n} }\\-\kappa _{\mathrm {g} }&0&\tau _{\mathrm {r} }\\-\kappa _{\mathrm {n} }&-\tau _{\mathrm {r} }&0\end{pmatrix}}{\begin{pmatrix}\mathbf {T} \\\mathbf {t} \\\mathbf {u} \end{pmatrix}}
$$


#### Principal curvature

All curves on the surface with the same tangent vector at a given point will have the same normal curvature, which is the same as the curvature of the curve obtained by intersecting the surface with the plane containing T and u. Taking all possible tangent vectors, the maximum and minimum values of the normal curvature at a point are called the principal curvatures, k1 and k2, and the directions of the corresponding tangent vectors are called principal normal directions.


### Normal sections

Curvature can be evaluated along surface normal sections, similar to § Curves on surfaces above (see for example the Earth radius of curvature).


### Developable surfaces

Some curved surfaces, such as those made from a smooth sheet of paper, can be flattened down into the plane without distorting their intrinsic features in any way. Such developable surfaces have zero Gaussian curvature (see below).


### Gaussian curvature

In contrast to curves, which do not have intrinsic curvature, but do have extrinsic curvature (they only have a curvature given an embedding), surfaces can have intrinsic curvature, independent of an embedding. The Gaussian curvature, named after Carl Friedrich Gauss, is equal to the product of the principal curvatures, k1k2. It has a dimension of length and is positive for spheres, negative for one-sheet hyperboloids and zero for planes and cylinders. It determines whether a surface is locally convex (when it is positive) or locally saddle-shaped (when it is negative).

Gaussian curvature is an intrinsic property of the surface, meaning it does not depend on the particular embedding of the surface; intuitively, this means that ants living on the surface could determine the Gaussian curvature. For example, an ant living on a sphere could measure the sum of the interior angles of a triangle and determine that it was greater than 180 degrees, implying that the space it inhabited had positive curvature. On the other hand, an ant living on a cylinder would not detect any such departure from Euclidean geometry; in particular the ant could not detect that the two surfaces have different mean curvatures (see below), which is a purely extrinsic type of curvature.

Formally, Gaussian curvature only depends on the Riemannian metric of the surface. This is Gauss's celebrated Theorema Egregium, which he found while concerned with geographic surveys and mapmaking.

An intrinsic definition of the Gaussian curvature at a point P is the following: imagine an ant which is tied to P with a short thread of length r. It runs around P while the thread is completely stretched and measures the length C(r) of one complete trip around P. If the surface were flat, the ant would find C(r) = 2πr. On curved surfaces, the formula for C(r) will be different, and the Gaussian curvature K at the point P can be computed by the Bertrand–Diguet–Puiseux theorem as


$$K=\lim _{r\to 0^{+}}3\left({\frac {2\pi r-C(r)}{\pi r^{3}}}\right).
$$

The integral of the Gaussian curvature over the whole surface is closely related to the surface's Euler characteristic; see the Gauss–Bonnet theorem.

The discrete analog of curvature, corresponding to curvature being concentrated at a point and particularly useful for polyhedra, is the (angular) defect; the analog for the Gauss–Bonnet theorem is Descartes' theorem on total angular defect.

Because (Gaussian) curvature can be defined without reference to an embedding space, it is not necessary that a surface be embedded in a higher-dimensional space in order to be curved. Such an intrinsically curved two-dimensional surface is a simple example of a Riemannian manifold.


### Mean curvature

The mean curvature is an extrinsic measure of curvature equal to half the sum of the principal curvatures, ⁠k1 + k2/2⁠. It has a dimension of length. Mean curvature is closely related to the first variation of surface area. In particular, a minimal surface such as a soap film has mean curvature zero and a soap bubble has constant mean curvature. Unlike Gauss curvature, the mean curvature is extrinsic and depends on the embedding, for instance, a cylinder and a plane are locally isometric but the mean curvature of a plane is zero while that of a cylinder is nonzero.


### Second fundamental form

The intrinsic and extrinsic curvature of a surface can be combined in the second fundamental form. This is a quadratic form in the tangent plane to the surface at a point whose value at a particular tangent vector X to the surface is the normal component of the acceleration of a curve along the surface tangent to X; that is, it is the normal curvature to a curve tangent to X (see above). Symbolically,


$$\operatorname {I\!I} (\mathbf {X} ,\mathbf {X} )=\mathbf {N} \cdot (\nabla _{\mathbf {X} }\mathbf {X} )
$$

where N is the unit normal to the surface. For unit tangent vectors X, the second fundamental form assumes the maximum value k1 and minimum value k2, which occur in the principal directions u1 and u2, respectively. Thus, by the principal axis theorem, the second fundamental form is


$$\operatorname {I\!I} (\mathbf {X} ,\mathbf {X} )=k_{1}\left(\mathbf {X} \cdot \mathbf {u} _{1}\right)^{2}+k_{2}\left(\mathbf {X} \cdot \mathbf {u} _{2}\right)^{2}.
$$

Thus the second fundamental form encodes both the intrinsic and extrinsic curvatures.


### Shape operator

An encapsulation of surface curvature can be found in the shape operator, S, which is a self-adjoint linear operator from the tangent plane to itself (specifically, the differential of the Gauss map).

For a surface with tangent vectors X and normal N, the shape operator can be expressed compactly in index summation notation as

$\partial _{a}\mathbf {N} =-S_{ba}\mathbf {X} _{b}.$

(Compare the alternative expression of curvature for a plane curve.)

The Weingarten equations give the value of S in terms of the coefficients of the first and second fundamental forms as


$$S=\left(EG-F^{2}\right)^{-1}{\begin{pmatrix}eG-fF&fG-gF\\fE-eF&gE-fF\end{pmatrix}}.
$$

The principal curvatures are the eigenvalues of the shape operator, the principal curvature directions are its eigenvectors, the Gauss curvature is its determinant, and the mean curvature is half its trace.


## Curvature of space

By extension of the former argument, a space of three or more dimensions can be intrinsically curved. The curvature is intrinsic in the sense that it is a property defined at every point in the space, rather than a property defined with respect to a larger space that contains it. In general, a curved space may or may not be conceived as being embedded in a higher-dimensional ambient space; if not then its curvature can only be defined intrinsically.

After the discovery of the intrinsic definition of curvature, which is closely connected with non-Euclidean geometry, many mathematicians and scientists questioned whether ordinary physical space might be curved, although the success of Euclidean geometry up to that time meant that the radius of curvature must be astronomically large. In the theory of general relativity, which describes gravity and cosmology, the idea is slightly generalised to the "curvature of spacetime"; in relativity theory spacetime is a pseudo-Riemannian manifold. Once a time coordinate is defined, the three-dimensional space corresponding to a particular time is generally a curved Riemannian manifold; but since the time coordinate choice is largely arbitrary, it is the underlying spacetime curvature that is physically significant.

Although an arbitrarily curved space is very complex to describe, the curvature of a space which is locally isotropic and homogeneous is described by a single Gaussian curvature, as for a surface; mathematically these are strong conditions, but they correspond to reasonable physical assumptions (all points and all directions are indistinguishable). A positive curvature corresponds to the inverse square radius of curvature; an example is a sphere or hypersphere. An example of negatively curved space is hyperbolic geometry (see also: non-positive curvature). A space or space-time with zero curvature is called flat. For example, Euclidean space is an example of a flat space, and Minkowski space is an example of a flat spacetime. There are other examples of flat geometries in both settings, though. A torus or a cylinder can both be given flat metrics, but differ in their topology. Other topologies are also possible for curved space .mw-parser-output div.crossreference{padding-left:0}(see also: Shape of the universe).


## Generalizations

The mathematical notion of curvature is also defined in much more general contexts. Many of these generalizations emphasize different aspects of the curvature as it is understood in lower dimensions.

One such generalization is kinematic. The curvature of a curve can naturally be considered as a kinematic quantity, representing the force felt by a certain observer moving along the curve; analogously, curvature in higher dimensions can be regarded as a kind of tidal force (this is one way of thinking of the sectional curvature). This generalization of curvature depends on how nearby test particles diverge or converge when they are allowed to move freely in the space; see Jacobi field.

Another broad generalization of curvature comes from the study of parallel transport on a surface. For instance, if a vector is moved around a loop on the surface of a sphere keeping parallel throughout the motion, then the final position of the vector may not be the same as the initial position of the vector. This phenomenon is known as holonomy. Various generalizations capture in an abstract form this idea of curvature as a measure of holonomy; see curvature form. A closely related notion of curvature comes from gauge theory in physics, where the curvature represents a field and a vector potential for the field is a quantity that is in general path-dependent: it may change if an observer moves around a loop.

Two more generalizations of curvature are the scalar curvature and Ricci curvature. In a curved surface such as the sphere, the area of a disc on the surface differs from the area of a disc of the same radius in flat space. This difference (in a suitable limit) is measured by the scalar curvature. The difference in area of a sector of the disc is measured by the Ricci curvature. Each of the scalar curvature and Ricci curvature are defined in analogous ways in three and higher dimensions. They are particularly important in relativity theory, where they both appear on the side of Einstein's field equations that represents the geometry of spacetime (the other side of which represents the presence of matter and energy). These generalizations of curvature underlie, for instance, the notion that curvature can be a property of a measure; see curvature of a measure.

Another generalization of curvature relies on the ability to compare a curved space with another space that has constant curvature. Often this is done with triangles in the spaces. The notion of a triangle makes senses in metric spaces, and this gives rise to CAT(k) spaces.


## See also


- Curvature form for the appropriate notion of curvature for vector bundles and principal bundles with connection
- Curvature of a measure for a notion of curvature in measure theory
- Curvature of parametric surfaces
- Curvature of Riemannian manifolds for generalizations of Gauss curvature to higher-dimensional Riemannian manifolds
- Curvature vector and geodesic curvature for appropriate notions of curvature of curves in Riemannian manifolds, of any dimension
- Degree of curvature
- Differential geometry of curves for a full treatment of curves embedded in a Euclidean space of arbitrary dimension
- Dioptre, a measurement of curvature used in optics
- Evolute, the locus of the centers of curvature of a given curve
- Fundamental theorem of curves
- Gauss–Bonnet theorem for an elementary application of curvature
- Gauss map for more geometric properties of Gauss curvature
- Gauss's principle of least constraint, an expression of the Principle of Least Action
- Mean curvature at one point on a surface
- Minimum railway curve radius
- Radius of curvature
- Second fundamental form for the extrinsic curvature of hypersurfaces in general
- Sinuosity
- Torsion of a curve


## External links


- The Feynman Lectures on Physics Vol. II Ch. 42: Curved Space
- The History of Curvature
- Curvature, Intrinsic and Extrinsic at MathPages
