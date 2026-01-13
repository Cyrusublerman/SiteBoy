# Arc length

Arc length is the distance between two points along a curve. It can be formalized mathematically for smooth curves using vector calculus and differential geometry, or for curves that might not necessarily be smooth as a limit of lengths of polygonal chains. The curves for which this limit exists are called rectifiable curves, and the process of determining their arc length in this way is called curve rectification.


## Definitions


### As an integral

In the most basic formulation of arc length for a parametric curve (thought of as the trajectory of a particle, moving in the plane with position $(x(t),y(t))$ at time $t$) the arc length is obtained by integrating speed (the magnitude of the velocity vector) over the curve with respect to time. Thus the length of a continuously differentiable curve in the Euclidean plane, parameterized as $(x(t),y(t))$, for $a\leq t\leq b$, is given as the integral $L=\int _{a}^{b}{\sqrt {x'(t)^{2}+y'(t)^{2}}}\,dt.$ Here the integrand (the square root inside the integral) is the particle's speed. This defining integral of arc length does not always have a closed-form expression, and numerical integration may be used instead to obtain numerical values of arc length.

More generally, for curves that are not necessarily in the plane, let $f\colon [a,b]\to \mathbb {R} ^{n}$ be continuously differentiable (i.e., the derivative is a continuous function) function. The length of the curve is given by the formula $L(f)=\int _{a}^{b}|f'(t)|\,dt$ where $|f'(t)|$ is the Euclidean norm of the tangent vector $f'(t)$ to the curve.

A curve can be parameterized in infinitely many ways. The arc length of the curve is the same regardless of the parameterization used to define the curve.


### As a limit

A curve in the plane can be approximated by connecting a finite number of points on the curve, in consecutive order, using (straight) line segments to create a polygonal chain. One may calculate the length of each linear segment using the Pythagorean theorem, and sum these lengths to obtain the total length of the chain; that approximation is known as the (cumulative) chordal distance.

If additional points are placed along the curve, the chordal distance will not decrease. It can increase to a finite bound, in the limit, as the length of the longest segment in the chain decreases to zero, or it can increase without bound. In the case where the length of the refined polygonal chain increases to a finite bound, this bound is the length of the curve. For a smooth curve of finite length, this limiting length always equals the length obtained from integration, but this limit-based definition of length also applies to certain non-smooth curves. A curve with the property that every arc between two points of the curve has finite length, when measured in this way, is called a rectifiable curve, even if the whole curve has infinite length.


### Sign

A signed arc length can be defined to convey a sense of orientation or "direction" with respect to a reference point taken as origin in the curve (see also: curve orientation and signed distance).


## Finding arc lengths by integration

If a planar curve in $\mathbb {R} ^{2}$ is defined by the equation $y=f(x),$ where $f$ is continuously differentiable, then it is simply a special case of a parametric equation where $x=t$ and $y=f(t).$ The Euclidean distance of each infinitesimal segment of the arc can be given by:
$${\sqrt {dx^{2}+dy^{2}}}={\sqrt {1+\left({\frac {dy}{dx}}\right)^{2}\,}}dx.
$$

The arc length is then given by:


$$s=\int _{a}^{b}{\sqrt {1+\left({\frac {dy}{dx}}\right)^{2}\,}}dx.
$$

Curves with closed-form solutions for arc length include the catenary, circle, cycloid, logarithmic spiral, parabola, semicubical parabola and straight line. The lack of a closed form solution for the arc length of an elliptic and hyperbolic arc led to the development of the elliptic integrals.


### Numerical integration

In most cases, including even simple curves, there are no closed-form solutions for arc length and numerical integration is necessary. Numerical integration of the arc length integral is usually very efficient. For example, consider the problem of finding the length of a quarter of the unit circle by numerically integrating the arc length integral. The upper half of the unit circle can be parameterized as $y={\sqrt {1-x^{2}}}.$ The interval $x\in \left[-{\sqrt {2}}/2,{\sqrt {2}}/2\right]$ corresponds to a quarter of the circle. Since ${\textstyle dy/dx=-x{\big /}{\sqrt {1-x^{2}}}}$ and $1+(dy/dx)^{2}=1{\big /}\left(1-x^{2}\right),$ the length of a quarter of the unit circle is


$$\int _{-{\sqrt {2}}/2}^{{\sqrt {2}}/2}{\frac {dx}{\sqrt {1-x^{2}}}}\,.
$$

The 15-point Gauss–Kronrod rule estimate for this integral of 1.570796326808177 differs from the true length of


$$\arcsin x{\bigg |}_{-{\sqrt {2}}/2}^{{\sqrt {2}}/2}={\frac {\pi }{2}}
$$

by 1.3×10 and the 16-point Gaussian quadrature rule estimate of 1.570796326794727 differs from the true length by only 1.7×10. This means it is possible to evaluate this integral to almost machine precision with only 16 integrand evaluations.


### Curve on a surface

Let $\mathbf {x} (u,v)$ be a surface mapping and let $\mathbf {C} (t)=(u(t),v(t))$ be a curve on this surface. The integrand of the arc length integral is
$$\left|\left(\mathbf {x} \circ \mathbf {C} \right)'(t)\right|.
$$Evaluating the derivative requires the chain rule for vector fields:


$$D(\mathbf {x} \circ \mathbf {C} )=(\mathbf {x} _{u}\ \mathbf {x} _{v}){\binom {u'}{v'}}=\mathbf {x} _{u}u'+\mathbf {x} _{v}v'.
$$

The squared norm of this vector is


$$\left(\mathbf {x} _{u}u'+\mathbf {x} _{v}v'\right)\cdot (\mathbf {x} _{u}u'+\mathbf {x} _{v}v')=g_{11}\left(u'\right)^{2}+2g_{12}u'v'+g_{22}\left(v'\right)^{2}
$$

(where $g_{ij}$ is the first fundamental form coefficient), so the integrand of the arc length integral can be written as
$${\sqrt {g_{ab}\left(u^{a}\right)'\left(u^{b}\right)'\,}}
$$(where $u^{1}=u$ and $u^{2}=v$).


### Other coordinate systems

Let $\mathbf {C} (t)=(r(t),\theta (t))$ be a curve expressed in polar coordinates. The mapping that transforms from polar coordinates to rectangular coordinates is


$$\mathbf {x} (r,\theta )=(r\cos \theta ,r\sin \theta ).
$$

The integrand of the arc length integral is
$$\left|\left(\mathbf {x} \circ \mathbf {C} \right)'(t)\right|.
$$The chain rule for vector fields shows that
$$D(\mathbf {x} \circ \mathbf {C} )=\mathbf {x} _{r}r'+\mathbf {x} _{\theta }\theta '.
$$So the squared integrand of the arc length integral is


$$\left(\mathbf {x_{r}} \cdot \mathbf {x_{r}} \right)\left(r'\right)^{2}+2\left(\mathbf {x} _{r}\cdot \mathbf {x} _{\theta }\right)r'\theta '+\left(\mathbf {x} _{\theta }\cdot \mathbf {x} _{\theta }\right)\left(\theta '\right)^{2}=\left(r'\right)^{2}+r^{2}\left(\theta '\right)^{2}.
$$

So for a curve expressed in polar coordinates, the arc length is:
$$\int _{t_{1}}^{t_{2}}{\sqrt {\left({\frac {dr}{dt}}\right)^{2}+r^{2}\left({\frac {d\theta }{dt}}\right)^{2}\,}}dt=\int _{\theta (t_{1})}^{\theta (t_{2})}{\sqrt {\left({\frac {dr}{d\theta }}\right)^{2}+r^{2}\,}}d\theta .
$$

The second expression is for a polar graph $r=r(\theta )$ parameterized by $t=\theta$.

Now let $\mathbf {C} (t)=(r(t),\theta (t),\phi (t))$ be a curve expressed in spherical coordinates where $\theta$ is the polar angle measured from the positive $z$-axis and $\phi$ is the azimuthal angle. The mapping that transforms from spherical coordinates to rectangular coordinates is
$$\mathbf {x} (r,\theta ,\phi )=(r\sin \theta \cos \phi ,r\sin \theta \sin \phi ,r\cos \theta ).
$$

Using the chain rule again shows that
$$D(\mathbf {x} \circ \mathbf {C} )=\mathbf {x} _{r}r'+\mathbf {x} _{\theta }\theta '+\mathbf {x} _{\phi }\phi '.
$$All dot products $\mathbf {x} _{i}\cdot \mathbf {x} _{j}$ where $i$ and $j$ differ are zero, so the squared norm of this vector is
$$\left(\mathbf {x} _{r}\cdot \mathbf {x} _{r}\right)\left(r'^{2}\right)+\left(\mathbf {x} _{\theta }\cdot \mathbf {x} _{\theta }\right)\left(\theta '\right)^{2}+\left(\mathbf {x} _{\phi }\cdot \mathbf {x} _{\phi }\right)\left(\phi '\right)^{2}=\left(r'\right)^{2}+r^{2}\left(\theta '\right)^{2}+r^{2}\sin ^{2}\theta \left(\phi '\right)^{2}.
$$

So for a curve expressed in spherical coordinates, the arc length is
$$\int _{t_{1}}^{t_{2}}{\sqrt {\left({\frac {dr}{dt}}\right)^{2}+r^{2}\left({\frac {d\theta }{dt}}\right)^{2}+r^{2}\sin ^{2}\theta \left({\frac {d\phi }{dt}}\right)^{2}\,}}dt.
$$

A very similar calculation shows that the arc length of a curve expressed in cylindrical coordinates is
$$\int _{t_{1}}^{t_{2}}{\sqrt {\left({\frac {dr}{dt}}\right)^{2}+r^{2}\left({\frac {d\theta }{dt}}\right)^{2}+\left({\frac {dz}{dt}}\right)^{2}\,}}dt.
$$


## Simple cases


### Arcs of circles

Arc lengths are denoted by s, since the Latin word for length (or size) is spatium.

In the following lines, $r$ represents the radius of a circle, $d$ is its diameter, $C$ is its circumference, $s$ is the length of an arc of the circle, and $\theta$ is the angle which the arc subtends at the centre of the circle. The distances $r,d,C,$ and $s$ are expressed in the same units.


- $C=2\pi r,$ which is the same as $C=\pi d.$ This equation is a definition of π . {\displaystyle \pi .}
- If the arc is a semicircle, then $s=\pi r.$
- For an arbitrary circular arc: If θ {\displaystyle \theta } is in radians then s = r θ . {\displaystyle s=r\theta .} This is a definition of the radian. If θ {\displaystyle \theta } is in degrees, then s = π r θ 180 ∘ , {\displaystyle s={\frac {\pi r\theta }{180^{\circ }}},} which is the same as s = C θ 360 ∘ . {\displaystyle s={\frac {C\theta }{360^{\circ }}}.} If θ {\displaystyle \theta } is in grads (100 grads, or grades, or gradians are one right-angle), then s = π r θ 200 grad , {\displaystyle s={\frac {\pi r\theta }{200{\text{ grad}}}},} which is the same as s = C θ 400 grad . {\displaystyle s={\frac {C\theta }{400{\text{ grad}}}}.} If θ {\displaystyle \theta } is in turns (one turn is a complete rotation, or 360°, or 400 grads, or 2 π {\displaystyle 2\pi } radians), then s = C θ / 1 turn {\displaystyle s=C\theta /1{\text{ turn}}} .


#### Great circles on Earth

Two units of length, the nautical mile and the metre (or kilometre), were originally defined so the lengths of arcs of great circles on the Earth's surface would be simply numerically related to the angles they subtend at its centre. The simple equation $s=\theta$ applies in the following circumstances:


- if $s$ is in nautical miles, and $\theta$ is in arcminutes (.mw-parser-output .frac{white-space:nowrap}.mw-parser-output .frac .num,.mw-parser-output .frac .den{font-size:80%;line-height:0;vertical-align:super}.mw-parser-output .frac .den{vertical-align:sub}.mw-parser-output .sr-only{border:0;clip:rect(0,0,0,0);clip-path:polygon(0px 0px,0px 0px,0px 0px);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}1⁄60 degree), or
- if $s$ is in kilometres, and $\theta$ is in gradians.

The lengths of the distance units were chosen to make the circumference of the Earth equal 40000 kilometres, or 21600 nautical miles. Those are the numbers of the corresponding angle units in one complete turn.

Those definitions of the metre and the nautical mile have been superseded by more precise ones, but the original definitions are still accurate enough for conceptual purposes and some calculations. For example, they imply that one kilometre is exactly 0.54 nautical miles. Using official modern definitions, one nautical mile is exactly 1.852 kilometres, which implies that 1 kilometre is about 0.53995680 nautical miles. This modern ratio differs from the one calculated from the original definitions by less than one part in 10,000.


### Other simple cases


- Archimedean spiral § Arc length
- Cycloid § Arc length
- Ellipse § Arc length
- Helix § Arc length
- Parabola § Arc length
- Sine and cosine § Arc length
- Triangle wave § Arc length


## Historical methods


### Antiquity

For much of the history of mathematics, even the greatest thinkers considered it impossible to compute the length of an irregular arc. Although Archimedes had pioneered a way of finding the area beneath a curve with his "method of exhaustion", few believed it was even possible for curves to have definite lengths, as do straight lines. The first ground was broken in this field, as it often has been in calculus, by approximation. People began to inscribe polygons within the curves and compute the length of the sides for a somewhat accurate measurement of the length. By using more segments, and by decreasing the length of each segment, they were able to obtain a more and more accurate approximation. In particular, by inscribing a polygon of many sides in a circle, they were able to find approximate values of π.


### 17th century

In the 17th century, the method of exhaustion led to the rectification by geometrical methods of several transcendental curves: the logarithmic spiral by Evangelista Torricelli in 1645 (some sources say John Wallis in the 1650s), the cycloid by Christopher Wren in 1658, and the catenary by Gottfried Leibniz in 1691.

In 1659, Wallis credited William Neile's discovery of the first rectification of a nontrivial algebraic curve, the semicubical parabola. The accompanying figures appear on page 145. On page 91, William Neile is mentioned as Gulielmus Nelius.


### Integral form

Before the full formal development of calculus, the basis for the modern integral form for arc length was independently discovered by Hendrik van Heuraet and Pierre de Fermat.

In 1659 van Heuraet published a construction showing that the problem of determining arc length could be transformed into the problem of determining the area under a curve (i.e., an integral). As an example of his method, he determined the arc length of a semicubical parabola, which required finding the area under a parabola. In 1660, Fermat published a more general theory containing the same result in his De linearum curvarum cum lineis rectis comparatione dissertatio geometrica (Geometric dissertation on curved lines in comparison with straight lines).

Building on his previous work with tangents, Fermat used the curve


$$y=x^{\frac {3}{2}}\,
$$

whose tangent at x = a had a slope of


$${3 \over 2}a^{\frac {1}{2}}
$$

so the tangent line would have the equation


$$y={3 \over 2}a^{\frac {1}{2}}(x-a)+f(a).
$$

Next, he increased a by a small amount to a + ε, making segment AC a relatively good approximation for the length of the curve from A to D. To find the length of the segment AC, he used the Pythagorean theorem:


$${\begin{aligned}AC^{2}&=AB^{2}+BC^{2}\\&=\varepsilon ^{2}+{9 \over 4}a\varepsilon ^{2}\\&=\varepsilon ^{2}\left(1+{9 \over 4}a\right)\end{aligned}}
$$

which, when solved, yields

$AC=\varepsilon {\sqrt {1+{9 \over 4}a\,}}.$

In order to approximate the length, Fermat would sum up a sequence of short segments.


## Curves with infinite length

As mentioned above, some curves are non-rectifiable. That is, there is no upper bound on the lengths of polygonal approximations; the length can be made arbitrarily large. Informally, such curves are said to have infinite length. There are continuous curves on which every arc (other than a single-point arc) has infinite length. An example of such a curve is the Koch curve. Another example of a curve with infinite length is the graph of the function defined by f(x) = x sin(1/x) for any open set with 0 as one of its delimiters and f(0) = 0. Sometimes the Hausdorff dimension and Hausdorff measure are used to quantify the size of such curves.


## Generalization to (pseudo-)Riemannian manifolds

Let $M$ be a (pseudo-)Riemannian manifold, $g$ the (pseudo-) metric tensor, $\gamma :[0,1]\rightarrow M$ a curve in $M$ defined by $n$ parametric equations

γ ( t ) = [ γ 1 ( t ) , … , γ n ( t ) ] , t ∈ [ 0 , 1 ] {\displaystyle \gamma (t)=[\gamma ^{1}(t),\dots ,\gamma ^{n}(t)],\quad t\in [0,1]}


$$\gamma (t)=[\gamma ^{1}(t),\dots ,\gamma ^{n}(t)],\quad t\in [0,1]
$$

γ ( 0 ) = x , γ ( 1 ) = y {\displaystyle \gamma (0)=\mathbf {x} ,\,\,\gamma (1)=\mathbf {y} }

$\gamma (0)=\mathbf {x} ,\,\,\gamma (1)=\mathbf {y}$

The length of $\gamma$, is defined to be


$$\ell (\gamma )=\int \limits _{0}^{1}||\gamma '(t)||_{\gamma (t)}dt
$$,

or, choosing local coordinates $x$,


$$\ell (\gamma )=\int \limits _{0}^{1}{\sqrt {\pm \sum _{i,j=1}^{n}g_{ij}(x(\gamma (t))){\frac {dx^{i}(\gamma (t))}{dt}}{\frac {dx^{j}(\gamma (t))}{dt}}}}dt
$$,

$\gamma '(t)\in T_{\gamma (t)}M$

is the tangent vector of $\gamma$ at $t.$ The sign in the square root is chosen once for a given curve, to ensure that the square root is a real number. The positive sign is chosen for spacelike curves; in a pseudo-Riemannian manifold, the negative sign may be chosen for timelike curves. Thus the length of a curve is a non-negative real number. Usually no curves are considered which are partly spacelike and partly timelike.

In theory of relativity, arc length of timelike curves (world lines) is the proper time elapsed along the world line, and arc length of a spacelike curve the proper distance along the curve.


## See also


- Arc (geometry)
- Circumference
- Crofton formula
- Elliptic integral
- Geodesics
- Intrinsic equation
- Integral approximations
- Line integral
- Meridian arc
- Multivariable calculus
- Sinuosity


## Sources


- Farouki, Rida T. (1999). "Curves from motion, motion from curves". In Laurent, P.-J.; Sablonniere, P.; Schumaker, L. L. (eds.). Curve and Surface Design: Saint-Malo 1999. Vanderbilt Univ. Press. pp. 63–90. ISBN 978-0-8265-1356-4.


## External links


- "Rectifiable curve", Encyclopedia of Mathematics, EMS Press, 2001 [1994]
- The History of Curvature
- Weisstein, Eric W. "Arc Length". MathWorld.
- Arc Length by Ed Pegg Jr., The Wolfram Demonstrations Project, 2007.
- Calculus Study Guide – Arc Length (Rectification)
- Famous Curves Index The MacTutor History of Mathematics archive
- Arc Length Approximation by Chad Pierson, Josh Fritz, and Angela Sharp, The Wolfram Demonstrations Project.
- Length of a Curve Experiment Illustrates numerical solution of finding length of a curve.
