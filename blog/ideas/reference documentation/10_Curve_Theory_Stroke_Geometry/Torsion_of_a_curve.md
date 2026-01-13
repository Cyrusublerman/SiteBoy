# Torsion of a curve

In the differential geometry of curves in three dimensions, the torsion of a curve measures how sharply it is twisting out of the osculating plane. Taken together, the curvature and the torsion of a space curve are analogous to the curvature of a plane curve. For example, they are coefficients in the system of differential equations for the Frenet frame given by the Frenet–Serret formulas.


## Definition

Let r be a space curve parametrized by arc length s and with the unit tangent vector T. If the curvature κ of r at a certain point is not zero then the principal normal vector and the binormal vector at that point are the unit vectors


$$\mathbf {N} ={\frac {\mathbf {T} '}{\kappa }},\quad \mathbf {B} =\mathbf {T} \times \mathbf {N}
$$

respectively, where the prime denotes the derivative of the vector with respect to the parameter s. The torsion τ measures the speed of rotation of the binormal vector at the given point. It is found from the equation

$\mathbf {B} '=-\tau \mathbf {N} .$

which means

$\tau =-\mathbf {N} \cdot \mathbf {B} '.$

As $\mathbf {N} \cdot \mathbf {B} =0$, this is equivalent to $\tau =\mathbf {N} '\cdot \mathbf {B}$.

Remark: The derivative of the binormal vector is perpendicular to both the binormal and the tangent, hence it has to be proportional to the principal normal vector. The negative sign is simply a matter of convention: it is a byproduct of the historical development of the subject.

Geometric relevance: The torsion τ(s) measures the turnaround of the binormal vector. The larger the torsion is, the faster the binormal vector rotates around the axis given by the tangent vector (see graphical illustrations). In the animated figure the rotation of the binormal vector is clearly visible at the peaks of the torsion function.


## Properties


- A plane curve with non-vanishing curvature has zero torsion at all points. Conversely, if the torsion of a regular curve with non-vanishing curvature is identically zero, then this curve belongs to a fixed plane.
- The curvature and the torsion of a helix are constant. Conversely, any space curve whose curvature and torsion are both constant and non-zero is a helix. The torsion is positive for a right-handed helix and is negative for a left-handed one.


## Alternative description

Let r = r(t) be the parametric equation of a space curve. Assume that this is a regular parametrization and that the curvature of the curve does not vanish. Analytically, r(t) is a three times differentiable function of t with values in R and the vectors

$\mathbf {r'} (t),\mathbf {r''} (t)$

are linearly independent.

Then the torsion can be computed from the following formula:


$$\tau ={\frac {\det \left({\mathbf {r} ',\mathbf {r} '',\mathbf {r} '''}\right)}{\left\|{\mathbf {r} '\times \mathbf {r} ''}\right\|^{2}}}={\frac {\left({\mathbf {r} '\times \mathbf {r} ''}\right)\cdot \mathbf {r} '''}{\left\|{\mathbf {r} '\times \mathbf {r} ''}\right\|^{2}}}.
$$

Here the primes denote the derivatives with respect to t and the cross denotes the cross product. For r = (x, y, z), the formula in components is


$$\tau ={\frac {x'''\left(y'z''-y''z'\right)+y'''\left(x''z'-x'z''\right)+z'''\left(x'y''-x''y'\right)}{\left(y'z''-y''z'\right)^{2}+\left(x''z'-x'z''\right)^{2}+\left(x'y''-x''y'\right)^{2}}}.
$$
