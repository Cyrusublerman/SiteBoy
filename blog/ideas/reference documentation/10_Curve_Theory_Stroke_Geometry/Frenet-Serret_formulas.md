# Frenet–Serret formulas

In differential geometry, the Frenet–Serret formulas describe the kinematic properties of a particle moving along a differentiable curve in three-dimensional Euclidean space $\mathbb {R} ^{3},$ or the geometric properties of the curve itself irrespective of any motion. More specifically, the formulas describe the derivatives of the so-called tangent, normal, and binormal unit vectors in terms of each other. The formulas are named after the two French mathematicians who independently discovered them: Jean Frédéric Frenet, in his thesis of 1847, and Joseph Alfred Serret, in 1851. Vector notation and linear algebra currently used to write these formulas were not yet available at the time of their discovery.

The tangent, normal, and binormal unit vectors, often called T, N, and B, or collectively the Frenet–Serret basis (or TNB basis), together form an orthonormal basis that spans $\mathbb {R} ^{3},$ and are defined as follows:


- T is the unit vector tangent to the curve, pointing in the direction of motion.
- N is the normal unit vector, the derivative of T with respect to the arclength parameter of the curve, divided by its length.
- B is the binormal unit vector, the cross product of T and N.

The above basis in conjunction with an origin at the point of evaluation on the curve define a moving frame, the Frenet–Serret frame (or TNB frame).

The Frenet–Serret formulas are:
$${\begin{aligned}{\frac {\mathrm {d} \mathbf {T} }{\mathrm {d} s}}&=\kappa \mathbf {N} ,\\[4pt]{\frac {\mathrm {d} \mathbf {N} }{\mathrm {d} s}}&=-\kappa \mathbf {T} +\tau \mathbf {B} ,\\[4pt]{\frac {\mathrm {d} \mathbf {B} }{\mathrm {d} s}}&=-\tau \mathbf {N} ,\end{aligned}}
$$where ${\tfrac {d}{ds}}$ is the derivative with respect to arclength, κ is the curvature, and τ is the torsion of the space curve. (Intuitively, curvature measures the failure of a curve to be a straight line, while torsion measures the failure of a curve to be planar.) The TNB basis combined with the two scalars, κ and τ, is called collectively the Frenet–Serret apparatus.


## Definitions

Let r(t) be a curve in Euclidean space, representing the position vector of the particle as a function of time. The Frenet–Serret formulas apply to curves which are non-degenerate, which roughly means that they have nonzero curvature. More formally, in this situation the velocity vector r′(t) and the acceleration vector r′′(t) are required not to be proportional.

Let s(t) represent the arc length which the particle has moved along the curve in time t. The quantity s is used to give the curve traced out by the trajectory of the particle a natural parametrization by arc length (i.e. arc-length parametrization), since many different particle paths may trace out the same geometrical curve by traversing it at different rates. In detail, s is given by
$$s(t)=\int _{0}^{t}\left\|\mathbf {r} '(\sigma )\right\|d\sigma .
$$Moreover, since we have assumed that r′ ≠ 0, it follows that s(t) is a strictly monotonically increasing function. Therefore, it is possible to solve for t as a function of s, and thus to write r(s) = r(t(s)). The curve is thus parametrized in a preferred manner by its arc length.

With a non-degenerate curve r(s), parameterized by its arc length, it is now possible to define the Frenet–Serret frame (or TNB frame):


- The tangent unit vector T is defined as
$$\mathbf {T} :={\frac {\mathrm {d} \mathbf {r} }{\mathrm {d} s}}.
$$
- The normal unit vector N is defined as
$$\mathbf {N} :={{\frac {\mathrm {d} \mathbf {T} }{\mathrm {d} s}} \over \left\|{\frac {\mathrm {d} \mathbf {T} }{\mathrm {d} s}}\right\|},
$$from which it follows, since T always has unit magnitude, that N (the change of T) is always perpendicular to T, since there is no change in length of T. Note that by calling curvature
$$\kappa =\left\|{\frac {\mathrm {d} \mathbf {T} }{\mathrm {d} s}}\right\|
$$we automatically obtain the first relation.


- The binormal unit vector B is defined as the cross product of T and N: $\mathbf {B} :=\mathbf {T} \times \mathbf {N} ,$

from which it follows that B is always perpendicular to both T and N. Thus, the three unit vectors T, N, B are all perpendicular to each other.

The Frenet–Serret formulas are:


$${\begin{aligned}{\frac {\mathrm {d} \mathbf {T} }{\mathrm {d} s}}&=\kappa \mathbf {N} ,\\[4pt]{\frac {\mathrm {d} \mathbf {N} }{\mathrm {d} s}}&=-\kappa \mathbf {T} +\tau \mathbf {B} ,\\[4pt]{\frac {\mathrm {d} \mathbf {B} }{\mathrm {d} s}}&=-\tau \mathbf {N} ,\end{aligned}}
$$

where κ is the curvature and τ is the torsion.

The Frenet–Serret formulas are also known as Frenet–Serret theorem, and can be stated more concisely using matrix notation:
$${\begin{bmatrix}\mathbf {T'} \\\mathbf {N'} \\\mathbf {B'} \end{bmatrix}}={\begin{bmatrix}0&\kappa &0\\-\kappa &0&\tau \\0&-\tau &0\end{bmatrix}}{\begin{bmatrix}\mathbf {T} \\\mathbf {N} \\\mathbf {B} \end{bmatrix}}.
$$

This matrix is skew-symmetric.


## Formulas in n dimensions

The Frenet–Serret formulas were generalized to higher-dimensional Euclidean spaces by Camille Jordan in 1874.

Suppose that r(s) is a smooth curve in $\mathbb {R} ^{n},$ and that the first n derivatives of r are linearly independent. The vectors in the Frenet–Serret frame are an orthonormal basis constructed by applying the Gram–Schmidt process to the vectors (r′(s), r′′(s), ..., r(s)).

In detail, the unit tangent vector is the first Frenet vector e1(s) and is defined as


$$\mathbf {e} _{1}(s)={\frac {{\overline {\mathbf {e} _{1}}}(s)}{\|{\overline {\mathbf {e} _{1}}}(s)\|}}
$$

${\overline {\mathbf {e} _{1}}}(s)=\mathbf {r} '(s)$

The normal vector, sometimes called the curvature vector, indicates the deviance of the curve from being a straight line. It is defined as
$${\overline {\mathbf {e} _{2}}}(s)=\mathbf {r} ''(s)-\langle \mathbf {r} ''(s),\mathbf {e} _{1}(s)\rangle \,\mathbf {e} _{1}(s)
$$

Its normalized form, the unit normal vector, is the second Frenet vector e2(s) and defined as


$$\mathbf {e} _{2}(s)={\frac {{\overline {\mathbf {e} _{2}}}(s)}{\|{\overline {\mathbf {e} _{2}}}(s)\|}}
$$

The tangent and the normal vector at point s define the osculating plane at point r(s).

The remaining vectors in the frame (the binormal, trinormal, etc.) are defined similarly by


$${\begin{aligned}\mathbf {e} _{j}(s)&={\frac {{\overline {\mathbf {e} _{j}}}(s)}{\|{\overline {\mathbf {e} _{j}}}(s)\|}},\\{\overline {\mathbf {e} _{j}}}(s)&=\mathbf {r} ^{(j)}(s)-\sum _{i=1}^{j-1}\langle \mathbf {r} ^{(j)}(s),\mathbf {e} _{i}(s)\rangle \,\mathbf {e} _{i}(s).\end{aligned}}
$$

The last vector in the frame is defined by the cross-product of the first n − 1 vectors:
$$\mathbf {e} _{n}(s)=\mathbf {e} _{1}(s)\times \mathbf {e} _{2}(s)\times \dots \times \mathbf {e} _{n-2}(s)\times \mathbf {e} _{n-1}(s)
$$

The real valued functions used below χi(s) are called generalized curvature and are defined as


$$\chi _{i}(s)=\langle \mathbf {e} _{i}'(s),\mathbf {e} _{i+1}(s)\rangle
$$

The Frenet–Serret formulas, stated in matrix language, are


$${\begin{bmatrix}\mathbf {e} _{1}'(s)\\\vdots \\\mathbf {e} _{n}'(s)\\\end{bmatrix}}={\begin{bmatrix}0&\chi _{1}(s)&0&0\\[4pt]-\chi _{1}(s)&\ddots &\ddots &0\\[4pt]0&\ddots &\ddots &\chi _{n-1}(s)\\[4pt]0&0&-\chi _{n-1}(s)&0\end{bmatrix}}{\begin{bmatrix}\mathbf {e} _{1}(s)\\\vdots \\\mathbf {e} _{n}(s)\\\end{bmatrix}}
$$

Notice that as defined here, the generalized curvatures and the frame may differ slightly from the convention found in other sources. The top curvature χn−1 (also called the torsion, in this context) and the last vector in the frame en, differ by a sign


$$\operatorname {or} \left(\mathbf {r} ^{(1)},\dots ,\mathbf {r} ^{(n)}\right)
$$

(the orientation of the basis) from the usual torsion. The Frenet–Serret formulas are invariant under flipping the sign of both χn−1 and en, and this change of sign makes the frame positively oriented. As defined above, the frame inherits its orientation from the jet of r.


## Proof of the Frenet–Serret formulas

The first Frenet–Serret formula holds by the definition of the normal N and the curvature κ, and the third Frenet–Serret formula holds by the definition of the torsion τ. Thus what is needed is to show the second Frenet–Serret formula.

Since T, N, B are orthogonal unit vectors with B = T × N, one also has T = N × B and N = B × T. Differentiating the last equation with respect to s gives


$${\frac {\partial \mathbf {N} }{\partial s}}=\left({\frac {\partial \mathbf {B} }{\partial s}}\right)\times \mathbf {T} +\mathbf {B} \times \left({\frac {\partial \mathbf {T} }{\partial s}}\right)
$$

Using that
$${\tfrac {\partial \mathbf {B} }{\partial s}}=-\tau \mathbf {N}
$$and
$${\tfrac {\partial \mathbf {T} }{\partial s}}=\kappa \mathbf {N} ,
$$this becomes


$${\begin{aligned}{\frac {\partial \mathbf {N} }{\partial s}}&=-\tau (\mathbf {N} \times \mathbf {T} )+\kappa (\mathbf {B} \times \mathbf {N} )\\&=\tau \mathbf {B} -\kappa \mathbf {T} \end{aligned}}
$$

This is exactly the second Frenet–Serret formula.


## Applications and interpretation


### Kinematics of the frame

The Frenet–Serret frame consisting of the tangent T, normal N, and binormal B collectively forms an orthonormal basis of 3-space. At each point of the curve, this attaches a frame of reference or rectilinear coordinate system (see image).

The Frenet–Serret formulas admit a kinematic interpretation. Imagine that an observer moves along the curve in time, using the attached frame at each point as their coordinate system. The Frenet–Serret formulas mean that this coordinate system is constantly rotating as an observer moves along the curve. Hence, this coordinate system is always non-inertial. The angular momentum of the observer's coordinate system is proportional to the Darboux vector of the frame.

Concretely, suppose that the observer carries an (inertial) top (or gyroscope) with them along the curve. If the axis of the top points along the tangent to the curve, then it will be observed to rotate about its axis with angular velocity −τ relative to the observer's non-inertial coordinate system. If, on the other hand, the axis of the top points in the binormal direction, then it is observed to rotate with angular velocity −κ. This is easily visualized in the case when the curvature is a positive constant and the torsion vanishes. The observer is then in uniform circular motion. If the top points in the direction of the binormal, then by conservation of angular momentum it must rotate in the opposite direction of the circular motion. In the limiting case when the curvature vanishes, the observer's normal precesses about the tangent vector, and similarly the top will rotate in the opposite direction of this precession.

The general case is illustrated below. There are further illustrations on Wikimedia.


#### Applications

The kinematics of the frame have many applications in the sciences.


- In the life sciences, particularly in models of microbial motion, considerations of the Frenet–Serret frame have been used to explain the mechanism by which a moving organism in a viscous medium changes its direction.
- In physics, the Frenet–Serret frame is useful when it is impossible or inconvenient to assign a natural coordinate system for a trajectory. Such is often the case, for instance, in relativity theory. Within this setting, Frenet–Serret frames have been used to model the precession of a gyroscope in a gravitational well.More elementary applications? Classic papers on coriolis effects maybe?


#### Graphical Illustrations


1. Example of a moving Frenet basis (T in blue, N in green, B in purple) along Viviani's curve.


2. On the example of a torus knot, the tangent vector T, the normal vector N, and the binormal vector B, along with the curvature κ(s), and the torsion τ(s) are displayed. At the peaks of the torsion function the rotation of the Frenet–Serret frame (T,N,B) around the tangent vector is clearly visible.


2. The kinematic significance of the curvature is best illustrated with plane curves (having constant torsion equal to zero). See the page on curvature of plane curves.


### Frenet–Serret formulas in calculus

The Frenet–Serret formulas are frequently introduced in courses on multivariable calculus as a companion to the study of space curves such as the helix. A helix can be characterized by the height 2πh and radius r of a single turn. The curvature and torsion of a helix (with constant radius) are given by the formulas
$${\begin{aligned}\kappa &={\frac {r}{r^{2}+h^{2}}}\\[4pt]\tau &=\pm {\frac {h}{r^{2}+h^{2}}}.\end{aligned}}
$$

The sign of the torsion is determined by the right-handed or left-handed sense in which the helix twists around its central axis. Explicitly, the parametrization of a single turn of a right-handed helix with height 2πh and radius r is
$${\begin{aligned}x&=r\cos t\\y&=r\sin t\\z&=ht\\(0&\leq t\leq 2\pi )\end{aligned}}
$$and, for a left-handed helix,
$${\begin{aligned}x&=r\cos t\\y&=-r\sin t\\z&=ht\\(0&\leq t\leq 2\pi ).\end{aligned}}
$$Note that these are not the arc length parametrizations (in which case, each of x, y, z would need to be divided by ${\sqrt {h^{2}+r^{2}}}$.)

In his expository writings on the geometry of curves, Rudy Rucker employs the model of a slinky to explain the meaning of the torsion and curvature. The slinky, he says, is characterized by the property that the quantity $A^{2}=h^{2}+r^{2}$ remains constant if the slinky is vertically stretched out along its central axis. (Here 2πh is the height of a single twist of the slinky, and r the radius.) In particular, curvature and torsion are complementary in the sense that the torsion can be increased at the expense of curvature by stretching out the slinky.


### Taylor expansion

Repeatedly differentiating the curve and applying the Frenet–Serret formulas gives the following Taylor approximation to the curve near s = 0 if the curve is parameterized by arclength:
$$\mathbf {r} (s)=\mathbf {r} (0)+\left(s-{\frac {s^{3}\kappa ^{2}(0)}{6}}\right)\mathbf {T} (0)+\left({\frac {s^{2}\kappa (0)}{2}}+{\frac {s^{3}\kappa '(0)}{6}}\right)\mathbf {N} (0)+\left({\frac {s^{3}\kappa (0)\tau (0)}{6}}\right)\mathbf {B} (0)+o(s^{3}).
$$

For a generic curve with nonvanishing torsion, the projection of the curve onto various coordinate planes in the T, N, B coordinate system at s = 0 have the following interpretations:


- The osculating plane is the plane containing T and N. The projection of the curve onto this plane has the form:
$$\mathbf {r} (0)+s\mathbf {T} (0)+{\frac {s^{2}\kappa (0)}{2}}\mathbf {N} (0)+o(s^{2}).
$$This is a parabola up to terms of order O(s), whose curvature at 0 is equal to κ(0). The osculating plane has the special property that the distance from the curve to the osculating plane is O(s), while the distance from the curve to any other plane is no better than O(s). This can be seen from the above Taylor expansion. Thus in a sense the osculating plane is the closest plane to the curve at a given point.
- The normal plane is the plane containing N and B. The projection of the curve onto this plane has the form:
$$\mathbf {r} (0)+\left({\frac {s^{2}\kappa (0)}{2}}+{\frac {s^{3}\kappa '(0)}{6}}\right)\mathbf {N} (0)+\left({\frac {s^{3}\kappa (0)\tau (0)}{6}}\right)\mathbf {B} (0)+o(s^{3})
$$which is a cuspidal cubic to order o(s).
- The rectifying plane is the plane containing T and B. The projection of the curve onto this plane is:
$$\mathbf {r} (0)+\left(s-{\frac {s^{3}\kappa ^{2}(0)}{6}}\right)\mathbf {T} (0)+\left({\frac {s^{3}\kappa (0)\tau (0)}{6}}\right)\mathbf {B} (0)+o(s^{3})
$$which traces out the graph of a cubic polynomial to order o(s).


### Ribbons and tubes

The Frenet–Serret apparatus allows one to define certain optimal ribbons and tubes centered around a curve. These have diverse applications in materials science and elasticity theory, as well as to computer graphics.

The Frenet ribbon along a curve C is the surface traced out by sweeping the line segment [−N,N] generated by the unit normal along the curve. This surface is sometimes confused with the tangent developable, which is the envelope E of the osculating planes of C. This is perhaps because both the Frenet ribbon and E exhibit similar properties along C. Namely, the tangent planes of both sheets of E, near the singular locus C where these sheets intersect, approach the osculating planes of C; the tangent planes of the Frenet ribbon along C are equal to these osculating planes. The Frenet ribbon is in general not developable.


### Congruence of curves

In classical Euclidean geometry, one is interested in studying the properties of figures in the plane which are invariant under congruence, so that if two figures are congruent then they must have the same properties. The Frenet–Serret apparatus presents the curvature and torsion as numerical invariants of a space curve.

Roughly speaking, two curves C and C' in space are congruent if one can be rigidly moved to the other. A rigid motion consists of a combination of a translation and a rotation. A translation moves one point of C to a point of C'. The rotation then adjusts the orientation of the curve C to line up with that of C'. Such a combination of translation and rotation is called a Euclidean motion. In terms of the parametrization r(t) defining the first curve C, a general Euclidean motion of C is a composite of the following operations:


- (Translation) r(t) → r(t) + v, where v is a constant vector.
- (Rotation) r(t) + v → M(r(t) + v), where M is the matrix of a rotation.

The Frenet–Serret frame is particularly well-behaved with regard to Euclidean motions. First, since T, N, and B can all be given as successive derivatives of the parametrization of the curve, each of them is insensitive to the addition of a constant vector to r(t). Intuitively, the TNB frame attached to r(t) is the same as the TNB frame attached to the new curve r(t) + v.

This leaves only the rotations to consider. Intuitively, if we apply a rotation M to the curve, then the TNB frame also rotates. More precisely, the matrix Q whose rows are the TNB vectors of the Frenet–Serret frame changes by the matrix of a rotation

$Q\rightarrow QM.$

A fortiori, the matrix ${\tfrac {dQ}{ds}}Q^{\mathrm {T} }$ is unaffected by a rotation:


$${\frac {\mathrm {d} (QM)}{\mathrm {d} s}}(QM)^{\top }={\frac {\mathrm {d} Q}{\mathrm {d} s}}MM^{\top }Q^{\top }={\frac {\mathrm {d} Q}{\mathrm {d} s}}Q^{\top }
$$

since MM = I for the matrix of a rotation.

Hence the entries κ and τ of ${\tfrac {dQ}{ds}}Q^{\mathrm {T} }$ are invariants of the curve under Euclidean motions: if a Euclidean motion is applied to a curve, then the resulting curve has the same curvature and torsion.

Moreover, using the Frenet–Serret frame, one can also prove the converse: any two curves having the same curvature and torsion functions must be congruent by a Euclidean motion. Roughly speaking, the Frenet–Serret formulas express the Darboux derivative of the TNB frame. If the Darboux derivatives of two frames are equal, then a version of the fundamental theorem of calculus asserts that the curves are congruent. In particular, the curvature and torsion are a complete set of invariants for a curve in three-dimensions.


## Other expressions of the frame

The formulas given above for T, N, and B depend on the curve being given in terms of the arclength parameter. This is a natural assumption in Euclidean geometry, because the arclength is a Euclidean invariant of the curve. In the terminology of physics, the arclength parametrization is a natural choice of gauge. However, it may be awkward to work with in practice. A number of other equivalent expressions are available.

Suppose that the curve is given by r(t), where the parameter t need no longer be arclength. Then the unit tangent vector T may be written as


$$\mathbf {T} (t)={\frac {\mathbf {r} '(t)}{\|\mathbf {r} '(t)\|}}
$$

The normal vector N takes the form


$$\mathbf {N} (t)={\frac {\mathbf {T} '(t)}{\|\mathbf {T} '(t)\|}}
$$

Using that
$$\mathbf {r} '(t)=\|\mathbf {r} '(t)\|\mathbf {T} (t)
$$and the acceleration formula
$$\mathbf {r} ''(t)=\|\mathbf {r} '(t)\|'\mathbf {T} +\kappa \|\mathbf {r} '(t)\|^{2}\mathbf {N}
$$the binormal vector B is then given by


$$\mathbf {B} (t)=\mathbf {T} (t)\times \mathbf {N} (t)={\frac {\mathbf {r} '(t)\times \mathbf {r} ''(t)}{\|\mathbf {r} '(t)\times \mathbf {r} ''(t)\|}}
$$

An alternative way to arrive at the same expressions is to take the first three derivatives of the curve r′(t), r′′(t), r′′′(t), and to apply the Gram-Schmidt process. The resulting ordered orthonormal basis is precisely the TNB frame. This procedure also generalizes to produce Frenet frames in higher dimensions.

In terms of the parameter t, the Frenet–Serret formulas pick up an additional factor of ||r′(t)|| because of the chain rule:


$${\frac {\mathrm {d} }{\mathrm {d} t}}{\begin{bmatrix}\mathbf {T} \\\mathbf {N} \\\mathbf {B} \end{bmatrix}}=\|\mathbf {r} '(t)\|{\begin{bmatrix}0&\kappa &0\\-\kappa &0&\tau \\0&-\tau &0\end{bmatrix}}{\begin{bmatrix}\mathbf {T} \\\mathbf {N} \\\mathbf {B} \end{bmatrix}}
$$

Explicit expressions for the curvature and torsion may be computed. For example,


$$\kappa ={\frac {\|\mathbf {r} '(t)\times \mathbf {r} ''(t)\|}{\|\mathbf {r} '(t)\|^{3}}}
$$

The torsion may be expressed using a scalar triple product as follows,


$$\tau ={\frac {[\mathbf {r} '(t),\mathbf {r} ''(t),\mathbf {r} '''(t)]}{\|\mathbf {r} '(t)\times \mathbf {r} ''(t)\|^{2}}}
$$


## Special cases

If the curvature is always zero then the curve will be a straight line. Here the vectors N, B and the torsion are not well defined.

If the torsion is always zero then the curve will lie in a plane.

A curve may have nonzero curvature and zero torsion. For example, the circle of radius R given by r(t) = (R cos t, R sin t, 0) in the z = 0 plane has zero torsion and curvature equal to 1/R. The converse, however, is false. That is, a regular curve with nonzero torsion must have nonzero curvature. This is just the contrapositive of the fact that zero curvature implies zero torsion.

A helix has constant curvature and constant torsion.


### Plane curves

If a curve ${\bf {r}}(t)=\langle x(t),y(t),0\rangle$ is contained in the xy-plane, then its tangent vector
$$\mathbf {T} ={\tfrac {\mathbf {r} '(t)}{||\mathbf {r} '(t)||}}
$$and principal unit normal vector
$$\mathbf {N} ={\tfrac {\mathbf {T} '(t)}{||\mathbf {T} '(t)||}}
$$will also lie in the xy-plane. As a result, the unit binormal vector $\mathbf {B} =\mathbf {T} \times \mathbf {N}$ is perpendicular to the xy-plane and thus must be either $\langle 0,0,1\rangle$ or $\langle 0,0,-1\rangle$. By the right-hand rule B will be $\langle 0,0,1\rangle$ if, when viewed from above, the curve's trajectory is turning leftward, and will be $\langle 0,0,-1\rangle$ if it is turning rightward. As a result, the torsion τ will always be zero and the formula
$${\tfrac {||\mathbf {r} '(t)\times \mathbf {r} ''(t)||}{||\mathbf {r} '(t)||^{3}}}
$$for the curvature κ becomes
$$\kappa ={\frac {|x'(t)y''(t)-y'(t)x''(t)|}{{\bigl [}(x'(t))^{2}+(y'(t))^{2}{\bigr ]}^{3/2}}}
$$


## See also


- Mathematics portal


- Affine geometry of curves
- Differentiable curve
- Darboux frame
- Kinematics
- Moving frame
- Tangential and normal components
- Radial, transverse, normal


## External links


- Create your own animated illustrations of moving Frenet-Serret frames, curvature and torsion functions (Maple Worksheet)
- Rudy Rucker's KappaTau Paper.
- Very nice visual representation for the trihedron
