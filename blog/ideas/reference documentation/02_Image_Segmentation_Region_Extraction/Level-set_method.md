# Level-set method

The Level-set method (LSM) is a conceptual framework for using level sets as a tool for numerical analysis of surfaces and shapes. LSM can perform numerical computations involving curves and surfaces on a fixed Cartesian grid without having to parameterize these objects. LSM makes it easier to perform computations on shapes with sharp corners and shapes that change topology (such as by splitting in two or developing holes). These characteristics make LSM effective for modeling objects that vary in time, such as an airbag inflating or a drop of oil floating in water.


## Overview

The figure on the right illustrates several ideas about LSM. In the upper left corner is a bounded region with a well-behaved boundary. Below it, the red surface is the graph of a level set function $\varphi$ determining this shape, and the flat blue region represents the X-Y plane. The boundary of the shape is then the zero-level set of $\varphi$, while the shape itself is the set of points in the plane for which $\varphi$ is positive (interior of the shape) or zero (at the boundary).

In the top row, the shape's topology changes as it is split in two. It is challenging to describe this transformation numerically by parameterizing the boundary of the shape and following its evolution. An algorithm can be used to detect the moment the shape splits in two and then construct parameterizations for the two newly obtained curves. On the bottom row, however, the plane at which the level set function is sampled is translated upwards, on which the shape's change in topology is described. It is less challenging to work with a shape through its level-set function rather than with itself directly, in which a method would need to consider all the possible deformations the shape might undergo.

Thus, in two dimensions, the level-set method amounts to representing a closed curve $\Gamma$ (such as the shape boundary in our example) using an auxiliary function $\varphi$, called the level-set function. The curve $\Gamma$ is represented as the zero-level set of $\varphi$ by

$\Gamma =\{(x,y)\mid \varphi (x,y)=0\},$

and the level-set method manipulates $\Gamma$ implicitly through the function $\varphi$. This function $\varphi$ is assumed to take positive values inside the region delimited by the curve $\Gamma$ and negative values outside.


## The level-set equation

If the curve $\Gamma$ moves in the normal direction with a speed $v$, then by chain rule and implicit differentiation, it can be determined that the level-set function $\varphi$ satisfies the level-set equation


$${\frac {\partial \varphi }{\partial t}}=v|\nabla \varphi |.
$$

Here, $|\cdot |$ is the Euclidean norm (denoted customarily by single bars in partial differential equations), and $t$ is time. This is a partial differential equation, in particular a Hamilton–Jacobi equation, and can be solved numerically, for example, by using finite differences on a Cartesian grid.

However, the numerical solution of the level set equation may require advanced techniques. Simple finite difference methods fail quickly. Upwinding methods such as the Godunov method are considered better; however, the level set method does not guarantee preservation of the volume and shape of the set level in an advection field that maintains shape and size, for example, a uniform or rotational velocity field. Instead, the shape of the level set may become distorted, and the level set may disappear over a few time steps. Therefore, high-order finite difference schemes, such as high-order essentially non-oscillatory (ENO) schemes, are often required, and even then, the feasibility of long-term simulations is questionable. More advanced methods have been developed to overcome this; for example, combinations of the leveling method with tracking marker particles suggested by the velocity field.


## Example

Consider a unit circle in ${\textstyle \mathbb {R} ^{2}}$, shrinking in on itself at a constant rate, i.e. each point on the boundary of the circle moves along its inwards pointing normally at some fixed speed. The circle will shrink and eventually collapse down to a point. If an initial distance field is constructed (i.e. a function whose value is the signed Euclidean distance to the boundary, positive interior, negative exterior) on the initial circle, the normalized gradient of this field will be the circle normal.

If the field has a constant value subtracted from it in time, the zero level (which was the initial boundary) of the new fields will also be circular and will similarly collapse to a point. This is due to this being effectively the temporal integration of the Eikonal equation with a fixed front velocity.


## Applications


- In mathematical modeling of combustion, LSM is used to describe the instantaneous flame surface, known as the G equation.
- Level-set data structures have been developed to facilitate the use of the level-set method in computer applications.
- Computational fluid dynamics
- Trajectory planning
- Optimization
- Image processing
- Computational biophysics
- Discrete complex dynamics (visualization of the parameter plane and the dynamic plane)


## History

The level-set method was developed in 1979 by Alain Dervieux, and subsequently popularized by Stanley Osher and James Sethian. It has since become popular in many disciplines, such as image processing, computer graphics, computational geometry, optimization, computational fluid dynamics, and computational biology.


## See also


## External links


- See Ronald Fedkiw's academic web page for many pictures and animations showing how the level-set method can be used to model real-life phenomena.
- Multivac is a C++ library for front tracking in 2D with level-set methods.
- James Sethian's web page on level-set method.
- Stanley Osher's homepage.
- The Level Set Method. MIT 16.920J / 2.097J / 6.339J. Numerical Methods for Partial Differential Equations by Per-Olof Persson. March 8, 2005
- Lecture 11: The Level Set Method: MIT 18.086. Mathematical Methods for Engineers II by Gilbert Strang
