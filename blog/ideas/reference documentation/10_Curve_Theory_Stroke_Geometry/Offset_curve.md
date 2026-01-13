# Offset curve

A parallel curve of a given (progenitor) curve is the envelope of a family of congruent (equal-radius) circles centered on the curve. It generalises the concept of parallel (straight) lines. It can also be defined as a curve whose points are at a constant normal distance from a given curve. These two definitions are not entirely equivalent as the latter assumes smoothness, whereas the former does not.

In computer-aided design the preferred term for a parallel curve is offset curve. (In other geometric contexts, the term "offset" can also refer to a translation; however, a parallel curve may have a different shape than its progenitor.) Offset curves are important, for example, in numerically controlled (NC) machining, where they describe, for example, the shape of the cut made by a round cutting tool of a two-axis machine. The shape of the cut is offset from the trajectory of the cutter by a constant distance in the direction normal to the cutter trajectory at every point.

In the area of 2D computer graphics known as vector graphics, the (approximate) computation of parallel curves is involved in one of the fundamental drawing operations, called stroking, which is typically applied to polylines or polybeziers (themselves called paths) in that field.

Except in the case of a line or circle, the parallel curves have a more complicated mathematical structure than the progenitor curve. For example, even if the progenitor curve is smooth, its offsets may not be so; this property is illustrated in the top figure, using a sine curve as progenitor curve. In general, even if a curve is rational, its offsets may not be so. For example, the offsets of a parabola are rational curves, but the offsets of an ellipse or of a hyperbola are not rational, even though these progenitor curves themselves are rational.

The notion also generalizes to 3D surfaces, where it is called an offset surface or parallel surface. Increasing a solid volume by a (constant) distance offset is sometimes called dilation (similar to the dilation image operation). The opposite operation is sometimes called shelling. Offset surfaces are important in NC, where they describe the shape of the cut made by a ball nose end mill of a three-axis machine. Other shapes of cutting bits can be modelled mathematically by general offset surfaces.


## Parallel curve of a parametrically given curve

If there is a regular parametric representation ${\vec {x}}=(x(t),y(t))$ of the given curve available, the second definition of a parallel curve (s. above) leads to the following parametric representation of the parallel curve with distance $|d|$:

${\vec {x}}_{d}(t)={\vec {x}}(t)+d{\vec {n}}(t)$ with the unit normal ${\vec {n}}(t)$.

In cartesian coordinates:


$$x_{d}(t)=x(t)+{\frac {d\;y'(t)}{\sqrt {x'(t)^{2}+y'(t)^{2}}}}
$$


$$y_{d}(t)=y(t)-{\frac {d\;x'(t)}{\sqrt {x'(t)^{2}+y'(t)^{2}}}}\ .
$$

The distance parameter $d$ may be negative. In this case, one gets a parallel curve on the opposite side of the curve (see diagram on the parallel curves of a circle). One can easily check that a parallel curve of a line is a parallel line in the common sense, and the parallel curve of a circle is a concentric circle.


### Geometric properties:[12]


- ${\vec {x}}'_{d}(t)\parallel {\vec {x}}'(t),\quad$ that means: the tangent vectors for a fixed parameter are parallel.
- 
$$k_{d}(t)={\frac {k(t)}{1+dk(t)}},\quad
$$with $k(t)$ the curvature of the given curve and $k_{d}(t)$ the curvature of the parallel curve for parameter $t$.
- $R_{d}(t)=R(t)+d,\quad$ with $R(t)$ the radius of curvature of the given curve and $R_{d}(t)$ the radius of curvature of the parallel curve for parameter $t$.
- When they exist, the osculating circles to parallel curves at corresponding points are concentric.
- As for parallel lines, a normal line to a curve is also normal to its parallels.
- When parallel curves are constructed they will have cusps when the distance from the curve matches the radius of curvature. These are the points where the curve touches the evolute.
- If the progenitor curve is a boundary of a planar set and its parallel curve is without self-intersections, then the latter is the boundary of the Minkowski sum of the planar set and the disk of the given radius.

If the given curve is polynomial (meaning that $x(t)$ and $y(t)$ are polynomials), then the parallel curves are usually not polynomial. In CAD area this is a drawback, because CAD systems use polynomials or rational curves. In order to get at least rational curves, the square root of the representation of the parallel curve has to be solvable. Such curves are called Pythagorean hodograph curves and were investigated by R.T. Farouki.


## Parallel curves of an implicit curve

Not all implicit curves have parallel curves with analytic representations, but this is possible in some special cases. For instance, the Pythagorean hodograph curves are rational curves with rational parallel curves, which can be converted to implicit representations. Another class of implicit rational curves with rational parallel curves is the parabolas. For the simpler cases of lines and circles the parallel curves can be described easily. For example:

Line $\;f(x,y)=x+y-1=0\;$ → distance function:
$$\;h(x,y)={\frac {x+y-1}{\sqrt {2}}}=d\;
$$(Hesse normalform)

Circle $\;f(x,y)=x^{2}+y^{2}-1=0\;$ → distance function: $\;h(x,y)={\sqrt {x^{2}+y^{2}}}-1=d\;.$

In general, presuming certain conditions, one can prove the existence of an oriented distance function $h(x,y)$. In practice one has to treat it numerically. Considering parallel curves the following is true:


- The parallel curve for distance d is the level set $h(x,y)=d$ of the corresponding oriented distance function $h$.


### Properties of the distance function:[12][17]


- $|\operatorname {grad} h({\vec {x}})|=1\;,$
- 
$$h({\vec {x}}+d\operatorname {grad} h({\vec {x}}))=h({\vec {x}})+d\;,
$$
- 
$$\operatorname {grad} h({\vec {x}}+d\operatorname {grad} h({\vec {x}}))=\operatorname {grad} h({\vec {x}})\;.
$$

Example: The diagram shows parallel curves of the implicit curve with equation $\;f(x,y)=x^{4}+y^{4}-1=0\;.$ Remark: The curves $\;f(x,y)=x^{4}+y^{4}-1=d\;$ are not parallel curves, because $\;|\operatorname {grad} f(x,y)|=1\;$ is not true in the area of interest.


## Further examples


- The involutes of a given curve are a set of parallel curves. For example: the involutes of a circle are parallel spirals (see diagram).


- A parabola has as (two-sided) offsets rational curves of degree 6.
- A hyperbola or an ellipse has as (two-sided) offsets an algebraic curve of degree 8.
- A Bézier curve of degree n has as (two-sided) offsets algebraic curves of degree 4n − 2. In particular, a cubic Bézier curve has as (two-sided) offsets algebraic curves of degree 10.


## Parallel curve to a curve with a corner

When determining the cutting path of part with a sharp corner for machining, you must define the parallel (offset) curve to a given curve that has a discontinuous normal at the corner. Even though the given curve is not smooth at the sharp corner, its parallel curve may be smooth with a continuous normal, or it may have cusps when the distance from the curve matches the radius of curvature at the sharp corner.


### Normal fans

As described above, the parametric representation of a parallel curve, ${\vec {x}}_{d}(t)$, to a given curver, ${\vec {x}}(t)$, with distance $|d|$ is:

${\vec {x}}_{d}(t)={\vec {x}}(t)+d{\vec {n}}(t)$ with the unit normal ${\vec {n}}(t)$.

At a sharp corner ($t=t_{c}$), the normal to ${\vec {x}}(t_{c})$ given by ${\vec {n}}(t_{c})$ is discontinuous, meaning the one-sided limit of the normal from the left ${\vec {n}}(t_{c}^{-})$ is unequal to the limit from the right ${\vec {n}}(t_{c}^{+})$. Mathematically,


$${\vec {n}}(t_{c}^{-})=\lim _{t\to t_{c}^{-}}{\vec {n}}(t)\neq {\vec {n}}(t_{c}^{+})=\lim _{t\to t_{c}^{+}}{\vec {n}}(t)
$$.

However, we can define a normal fan ${\vec {n}}_{f}(\alpha )$ that provides an interpolant between ${\vec {n}}(t_{c}^{-})$ and ${\vec {n}}(t_{c}^{+})$, and use ${\vec {n}}_{f}(\alpha )$ in place of ${\vec {n}}(t_{c})$ at the sharp corner:


$${\vec {n}}_{f}(\alpha )={\frac {(1-\alpha ){\vec {n}}(t_{c}^{-})+\alpha {\vec {n}}(t_{c}^{+})}{\lVert (1-\alpha ){\vec {n}}(t_{c}^{-})+\alpha {\vec {n}}(t_{c}^{+})\rVert }},\quad
$$where $0<\alpha <1$.

The resulting definition of the parallel curve ${\vec {x}}_{d}(t)$ provides the desired behavior:


$${\vec {x}}_{d}(t)={\begin{cases}{\vec {x}}(t)+d{\vec {n}}(t),&{\text{if }}t<t_{c}{\text{ or }}t>t_{c}\\{\vec {x}}(t_{c})+d{\vec {n}}_{f}(\alpha ),&{\text{if }}t=t_{c}{\text{ where }}0<\alpha <1\end{cases}}
$$


## Algorithms

In general, the parallel curve of a Bézier curve is not another Bézier curve, a result proved by Tiller and Hanson in 1984. Thus, in practice, approximation techniques are used. Any desired level of accuracy is possible by repeatedly subdividing the curve, though better techniques require fewer subdivisions to attain the same level of accuracy. A 1997 survey by Elber, Lee and Kim is widely cited, though better techniques have been proposed more recently. A modern technique based on curve fitting, with references and comparisons to other algorithms, as well as open source JavaScript source code, was published in a blog post in September 2022.

Another efficient algorithm for offsetting is the level approach described by Kimmel and Bruckstein (1993).


## Parallel (offset) surfaces

Offset surfaces are important in numerically controlled machining, where they describe the shape of the cut made by a ball nose end mill of a three-axis mill. If there is a regular parametric representation ${\vec {x}}(u,v)=(x(u,v),y(u,v),z(u,v))$ of the given surface available, the second definition of a parallel curve (see above) generalizes to the following parametric representation of the parallel surface with distance $|d|$:


$${\vec {x}}_{d}(u,v)={\vec {x}}(u,v)+d{\vec {n}}(u,v)
$$with the unit normal
$${\vec {n}}_{d}(u,v)={{{\partial {\vec {x}} \over \partial u}\times {\partial {\vec {x}} \over \partial v}} \over {|{{\partial {\vec {x}} \over \partial u}\times {\partial {\vec {x}} \over \partial v}}|}}
$$.

Distance parameter $d$ may be negative, too. In this case one gets a parallel surface on the opposite side of the surface (see similar diagram on the parallel curves of a circle). One easily checks: a parallel surface of a plane is a parallel plane in the common sense and the parallel surface of a sphere is a concentric sphere.


### Geometric properties:[23]


- 
$${\partial {\vec {x}}_{d} \over \partial u}\parallel {\partial {\vec {x}} \over \partial u},\quad {\partial {\vec {x}}_{d} \over \partial v}\parallel {\partial {\vec {x}} \over \partial v},\quad
$$that means: the tangent vectors for fixed parameters are parallel.
- ${\vec {n}}_{d}(u,v)=\pm {\vec {n}}(u,v),\quad$ that means: the normal vectors for fixed parameters match direction.
- $S_{d}=(1+dS)^{-1}S,\quad$ where $S_{d}$ and $S$ are the shape operators for ${\vec {x}}_{d}$ and ${\vec {x}}$, respectively.

The principal curvatures are the eigenvalues of the shape operator, the principal curvature directions are its eigenvectors, the Gaussian curvature is its determinant, and the mean curvature is half its trace.


- $S_{d}^{-1}=S^{-1}+dI,\quad$ where $S_{d}^{-1}$ and $S^{-1}$ are the inverses of the shape operators for ${\vec {x}}_{d}$ and ${\vec {x}}$, respectively.

The principal radii of curvature are the eigenvalues of the inverse of the shape operator, the principal curvature directions are its eigenvectors, the reciprocal of the Gaussian curvature is its determinant, and the mean radius of curvature is half its trace.

Note the similarity to the geometric properties of parallel curves.


## Generalizations

The problem generalizes fairly obviously to higher dimensions e.g. to offset surfaces, and slightly less trivially to pipe surfaces. Note that the terminology for the higher-dimensional versions varies even more widely than in the planar case, e.g. other authors speak of parallel fibers, ribbons, and tubes. For curves embedded in 3D surfaces the offset may be taken along a geodesic.

Another way to generalize it is (even in 2D) to consider a variable distance, e.g. parametrized by another curve. One can for example stroke (envelope) with an ellipse instead of circle as it is possible for example in METAFONT.

More recently Adobe Illustrator has added somewhat similar facility in version CS5, although the control points for the variable width are visually specified. In contexts where it's important to distinguish between constant and variable distance offsetting the acronyms CDO and VDO are sometimes used.


### General offset curves

Assume you have a regular parametric representation of a curve, ${\vec {x}}(t)=(x(t),y(t))$, and you have a second curve that can be parameterized by its unit normal, ${\vec {d}}({\vec {n}})$, where the normal of ${\vec {d}}({\vec {n}})={\vec {n}}$ (this parameterization by normal exists for curves whose curvature is strictly positive or negative, and thus convex, smooth, and not straight). The parametric representation of the general offset curve of ${\vec {x}}(t)$ offset by ${\vec {d}}({\vec {n}})$ is:


$${\vec {x}}_{d}(t)={\vec {x}}(t)+{\vec {d}}({\vec {n}}(t)),\quad
$$where ${\vec {n}}(t)$ is the unit normal of ${\vec {x}}(t)$.

Note that the trival offset, ${\vec {d}}({\vec {n}})=d{\vec {n}}$, gives you ordinary parallel (aka, offset) curves.


#### Geometric properties:[23]


- ${\vec {x}}'_{d}(t)\parallel {\vec {x}}'(t),\quad$ that means: the tangent vectors for a fixed parameter are parallel.
- As for parallel lines, a normal to a curve is also normal to its general offsets.
- 
$$k_{d}(t)={\dfrac {k(t)}{1+{\dfrac {k(t)}{k_{n}(t)}}}},\quad
$$with $k_{d}(t)$ the curvature of the general offset curve, $k(t)$ the curvature of ${\vec {x}}(t)$, and $k_{n}(t)$ the curvature of ${\vec {d}}({\vec {n}}(t))$ for parameter $t$.
- $R_{d}(t)=R(t)+R_{n}(t),\quad$ with $R_{d}(t)$ the radius of curvature of the general offset curve, $R(t)$ the radius of curvature of ${\vec {x}}(t)$, and $R_{n}(t)$ the radius of curvature of ${\vec {d}}({\vec {n}}(t))$ for parameter $t$.
- When general offset curves are constructed they will have cusps when the curvature of the curve matches curvature of the offset. These are the points where the curve touches the evolute.


### General offset surfaces

General offset surfaces describe the shape of cuts made by a variety of cutting bits used by three-axis end mills in numerically controlled machining. Assume you have a regular parametric representation of a surface, ${\vec {x}}(u,v)=(x(u,v),y(u,v),z(u,v))$, and you have a second surface that can be parameterized by its unit normal, ${\vec {d}}({\vec {n}})$, where the normal of ${\vec {d}}({\vec {n}})={\vec {n}}$ (this parameterization by normal exists for surfaces whose Gaussian curvature is strictly positive, and thus convex, smooth, and not flat). The parametric representation of the general offset surface of ${\vec {x}}(t)$ offset by ${\vec {d}}({\vec {n}})$ is:


$${\vec {x}}_{d}(u,v)={\vec {x}}(u,v)+{\vec {d}}({\vec {n}}(u,v)),\quad
$$where ${\vec {n}}(u,v)$ is the unit normal of ${\vec {x}}(u,v)$.

Note that the trival offset, ${\vec {d}}({\vec {n}})=d{\vec {n}}$, gives you ordinary parallel (aka, offset) surfaces.


#### Geometric properties:[23]


- As for parallel lines, the tangent plane of a surface is parallel to the tangent plane of its general offsets.
- As for parallel lines, a normal to a surface is also normal to its general offsets.
- $S_{d}=(1+SS_{n}^{-1})^{-1}S,\quad$ where $S_{d},S,$ and $S_{n}$ are the shape operators for ${\vec {x}}_{d},{\vec {x}},$ and ${\vec {d}}({\vec {n}})$, respectively.

The principal curvatures are the eigenvalues of the shape operator, the principal curvature directions are its eigenvectors, the Gaussian curvature is its determinant, and the mean curvature is half its trace.


- $S_{d}^{-1}=S^{-1}+S_{n}^{-1},\quad$ where $S_{d}^{-1},S^{-1}$ and $S_{n}^{-1}$ are the inverses of the shape operators for ${\vec {x}}_{d},{\vec {x}},$ and ${\vec {d}}({\vec {n}})$, respectively.

The principal radii of curvature are the eigenvalues of the inverse of the shape operator, the principal curvature directions are its eigenvectors, the reciprocal of the Gaussian curvature is its determinant, and the mean radius of curvature is half its trace.

Note the similarity to the geometric properties of general offset curves.


### Derivation of geometric properties for general offsets

The geometric properties listed above for general offset curves and surfaces can be derived for offsets of arbitrary dimension. Assume you have a regular parametric representation of an n-dimensional surface, ${\vec {x}}({\vec {u}})$, where the dimension of ${\vec {u}}$ is n-1. Also assume you have a second n-dimensional surface that can be parameterized by its unit normal, ${\vec {d}}({\vec {n}})$, where the normal of ${\vec {d}}({\vec {n}})={\vec {n}}$ (this parameterization by normal exists for surfaces whose Gaussian curvature is strictly positive, and thus convex, smooth, and not flat). The parametric representation of the general offset surface of ${\vec {x}}({\vec {u}})$ offset by ${\vec {d}}({\vec {n}})$ is:


$${\vec {x}}_{d}({\vec {u}})={\vec {x}}({\vec {u}})+{\vec {d}}({\vec {n}}({\vec {u}})),\quad
$$where ${\vec {n}}({\vec {u}})$ is the unit normal of ${\vec {x}}({\vec {u}})$. (The trival offset, ${\vec {d}}({\vec {n}})=d{\vec {n}}$, gives you ordinary parallel surfaces.)

First, notice that the normal of ${\vec {x}}({\vec {u}})=$ the normal of
$${\vec {d}}({\vec {n}}({\vec {u}}))={\vec {n}}({\vec {u}}),
$$by definition. Now, we'll apply the differential w.r.t. ${\vec {u}}$ to ${\vec {x}}_{d}$, which gives us its tangent vectors spanning its tangent plane.


$$\partial {\vec {x}}_{d}({\vec {u}})=\partial {\vec {x}}({\vec {u}})+\partial {\vec {d}}({\vec {n}}({\vec {u}}))
$$

Notice, the tangent vectors for ${\vec {x}}_{d}$ are the sum of tangent vectors for ${\vec {x}}({\vec {u}})$ and its offset ${\vec {d}}({\vec {n}})$, which share the same unit normal. Thus, the general offset surface shares the same tangent plane and normal with ${\vec {x}}({\vec {u}})$ and ${\vec {d}}({\vec {n}}({\vec {u}}))$. That aligns with the nature of envelopes.

We now consider the Weingarten equations for the shape operator, which can be written as $\partial {\vec {n}}=-\partial {\vec {x}}S$. If $S$ is invertable, $\partial {\vec {x}}=-\partial {\vec {n}}S^{-1}$. Recall that the principal curvatures of a surface are the eigenvalues of the shape operator, the principal curvature directions are its eigenvectors, the Gauss curvature is its determinant, and the mean curvature is half its trace. The inverse of the shape operator holds these same values for the radii of curvature.

Substituting into the equation for the differential of ${\vec {x}}_{d}$, we get:


$$\partial {\vec {x}}_{d}=\partial {\vec {x}}-\partial {\vec {n}}S_{n}^{-1},\quad
$$where $S_{n}$ is the shape operator for ${\vec {d}}({\vec {n}}({\vec {u}}))$.

Next, we use the Weingarten equations again to replace $\partial {\vec {n}}$:


$$\partial {\vec {x}}_{d}=\partial {\vec {x}}+\partial {\vec {x}}SS_{n}^{-1},\quad
$$where $S$ is the shape operator for ${\vec {x}}({\vec {u}})$.

Then, we solve for $\partial {\vec {x}}$ and multiple both sides by $-S$ to get back to the Weingarten equations, this time for $\partial {\vec {x}}_{d}$:


$$\partial {\vec {x}}_{d}(I+SS_{n}^{-1})^{-1}=\partial {\vec {x}},
$$


$$-\partial {\vec {x}}_{d}(I+SS_{n}^{-1})^{-1}S=-\partial {\vec {x}}S=\partial {\vec {n}}.
$$

Thus, $S_{d}=(I+SS_{n}^{-1})^{-1}S$, and inverting both sides gives us, $S_{d}^{-1}=S^{-1}+S_{n}^{-1}$.


## See also


- Bump mapping
- Channel surface
- Distance function and signed distance function
- Distance field
- Offset printing
- Tubular neighborhood


## Further reading


- Farouki, R. T.; Neff, C. A. (1990). "Analytic properties of plane offset curves". Computer Aided Geometric Design. 7 (1–4): 83–99. doi:10.1016/0167-8396(90)90023-K.
- Piegl, Les A. (1999). "Computing offsets of NURBS curves and surfaces". Computer-Aided Design. 31 (2): 147–156. CiteSeerX 10.1.1.360.2793. doi:10.1016/S0010-4485(98)00066-9.
- Porteous, Ian R. (2001). Geometric Differentiation: For the Intelligence of Curves and Surfaces (2nd ed.). Cambridge University Press. pp. 1–25. ISBN 978-0-521-00264-6.
- Patrikalakis, Nicholas M.; Maekawa, Takashi (2010) [2002]. Shape Interrogation for Computer Aided Design and Manufacturing. Springer Science & Business Media. Chapter 11. Offset Curves and Surfaces. ISBN 978-3-642-04074-0. Free online version.
- Anton, François; Emiris, Ioannis Z.; Mourrain, Bernard; Teillaud, Monique (May 2005). "The O set to an Algebraic Curve and an Application to Conics". International Conference on Computational Science and its Applications. Singapore: Springer Verlag. pp. 683–696.
- Farouki, Rida T. (2008). Pythagorean-Hodograph Curves: Algebra and Geometry Inseparable. Springer Science & Business Media. pp. 141–178. ISBN 978-3-540-73397-3. Pages listed are the general and introductory material.
- Au, C. K.; Ma, Y.-S. (2013). "Computation of Offset Curves Using a Distance Function: Addressing a Key Challenge in Cutting Tool Path Generation". In Ma, Y.-S. (ed.). Semantic Modeling and Interoperability in Product and Process Engineering: A Technology for Engineering Informatics. Springer Science & Business Media. pp. 259–273. ISBN 978-1-4471-5073-2.


## External links


- Parallel curves on MathWorld
- Visual Dictionary of Plane Curves Xah Lee
