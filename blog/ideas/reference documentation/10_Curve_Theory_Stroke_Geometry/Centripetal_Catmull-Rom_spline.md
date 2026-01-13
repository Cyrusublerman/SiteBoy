# Centripetal Catmull–Rom spline

In computer graphics, the centripetal Catmull–Rom spline is a variant form of the Catmull–Rom spline, originally formulated by Edwin Catmull and Raphael Rom, which can be evaluated using a recursive algorithm proposed by Barry and Goldman. It is a type of interpolating spline (a curve that goes through its control points) defined by four control points
$$\mathbf {P} _{0},\mathbf {P} _{1},\mathbf {P} _{2},\mathbf {P} _{3}
$$, with the curve drawn only from $\mathbf {P} _{1}$ to $\mathbf {P} _{2}$.


## Definition

Let $\mathbf {P} _{i}=[x_{i}\quad y_{i}]^{T}$ denote a point. For a curve segment $\mathbf {C}$ defined by points
$$\mathbf {P} _{0},\mathbf {P} _{1},\mathbf {P} _{2},\mathbf {P} _{3}
$$and knot sequence $t_{0},t_{1},t_{2},t_{3}$, the centripetal Catmull–Rom spline can be produced by:


$$\mathbf {C} ={\frac {t_{2}-t}{t_{2}-t_{1}}}\mathbf {B} _{1}+{\frac {t-t_{1}}{t_{2}-t_{1}}}\mathbf {B} _{2}
$$


$$\mathbf {B} _{1}={\frac {t_{2}-t}{t_{2}-t_{0}}}\mathbf {A} _{1}+{\frac {t-t_{0}}{t_{2}-t_{0}}}\mathbf {A} _{2}
$$


$$\mathbf {B} _{2}={\frac {t_{3}-t}{t_{3}-t_{1}}}\mathbf {A} _{2}+{\frac {t-t_{1}}{t_{3}-t_{1}}}\mathbf {A} _{3}
$$


$$\mathbf {A} _{1}={\frac {t_{1}-t}{t_{1}-t_{0}}}\mathbf {P} _{0}+{\frac {t-t_{0}}{t_{1}-t_{0}}}\mathbf {P} _{1}
$$


$$\mathbf {A} _{2}={\frac {t_{2}-t}{t_{2}-t_{1}}}\mathbf {P} _{1}+{\frac {t-t_{1}}{t_{2}-t_{1}}}\mathbf {P} _{2}
$$


$$\mathbf {A} _{3}={\frac {t_{3}-t}{t_{3}-t_{2}}}\mathbf {P} _{2}+{\frac {t-t_{2}}{t_{3}-t_{2}}}\mathbf {P} _{3}
$$


$$t_{i+1}=\left[{\sqrt {(x_{i+1}-x_{i})^{2}+(y_{i+1}-y_{i})^{2}}}\right]^{\alpha }+t_{i}
$$

in which $\alpha$ ranges from 0 to 1 for knot parameterization, and $i=0,1,2,3$ with $t_{0}=0$. For centripetal Catmull–Rom spline, the value of $\alpha$ is $0.5$. When $\alpha =0$, the resulting curve is the standard uniform Catmull–Rom spline; when $\alpha =1$, the result is a chordal Catmull–Rom spline.

Plugging $t=t_{1}$ into the spline equations
$$\mathbf {A} _{1},\mathbf {A} _{2},\mathbf {A} _{3},\mathbf {B} _{1},\mathbf {B} _{2},
$$and $\mathbf {C}$ shows that the value of the spline curve at $t_{1}$ is $\mathbf {C} =\mathbf {P} _{1}$. Similarly, substituting $t=t_{2}$ into the spline equations shows that $\mathbf {C} =\mathbf {P} _{2}$ at $t_{2}$. This is true independent of the value of $\alpha$ since the equation for $t_{i+1}$ is not needed to calculate the value of $\mathbf {C}$ at points $t_{1}$ and $t_{2}$.

The extension to 3D points is simply achieved by considering $\mathbf {P} _{i}=[x_{i}\quad y_{i}\quad z_{i}]^{T}$a generic 3D point $\mathbf {P} _{i}$ and


$$t_{i+1}=\left[{\sqrt {(x_{i+1}-x_{i})^{2}+(y_{i+1}-y_{i})^{2}+(z_{i+1}-z_{i})^{2}}}\right]^{\alpha }+t_{i}
$$


## Advantages

Centripetal Catmull–Rom splines have several desirable mathematical properties compared to the original and the other types of Catmull-Rom formulation. First, loops and self-intersections do not occur within a curve segment. Second, cusps will never occur within a curve segment. Third, it follows the control points more tightly.


## Other uses

In computer vision, the centripetal Catmull-Rom spline forms the basis of the active spline model for segmentation. The model is based on the active shape model but connects successive points with centripetal Catmull-Rom splines rather than straight lines, reducing the required number of control points. As such, segmentation models trained to produce control points for centripetal Catmull-Rom splines converge more quickly, and the resulting curves are faster to edit than linear polygons or other cubic splines.


## Code example in Python

The following is an implementation of the Catmull–Rom spline in Python that produces the plot shown beneath.


## Code example in Unity C#

C# with the Unity game engine.


## Code example in Unreal C++


## See also


- Cubic Hermite splines


## External links


- Catmull-Rom curve with no cusps and no self-intersections – implementation in Java
- Catmull-Rom curve with no cusps and no self-intersections – simplified implementation in C++
- Catmull-Rom splines – interactive generation via Python, in a Jupyter notebook
- Smooth Paths Using Catmull-Rom Splines – another versatile implementation in C++ including centripetal CR splines
