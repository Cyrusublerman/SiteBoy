**Status:** ARCHIVED

## Cloth

Cloth is a very interesting and complicated subject in computer graphics. More accurately referred to as thin-shell material models, the objective is to simulate the motion of thin objects such as cloth, folded paper, clothing, etc. People have come up with a wide array of cloth models, and no single model has proven itself strongly dominant. In order to compare the existing models, we'll break down the model into five categories: equations of motion, integrators, collisions, improvements, and rendering.

### Results

A powerpoint presentation corresponding to these topics can be found here.

Various videos of the cloth simulation in action:

- Cloth with two corners fixed
    
- Cloth with two corners fixed falling on a sphere
    
- Cloth with a random interior vertex fixed
    
- Cloth with two random interior vertices fixed
    
- Human figure draping a cloth around itself
    

---

## Equations of Motion

### Mass-Spring Model

The equations of motion for a system govern the motion of the system. One of the first (and simplest) cloth models is as follows: consider the sheet of cloth. Divide it up into a series of approximately evenly spaced masses $M$. Connect nearby masses by a spring, and use Hooke's Law and Newton's 2nd Law as the equations of motion. Various additions, such as spring damping or angular springs, can be made. A mesh structure proves invaluable for storing the cloth and performing the simulation directly on it. Each vertex can store all of its own local information (velocity, position, forces, etc.) and when it comes time to render, the face information allows for immediate rendering as a normal mesh.

In the cloth structure, the red nodes are vertices, and the black lines are springs. The diagonal springs are necessary to resist collapse of the face; it ensures that the entire cloth does not decompose into a straight line. The blue represents the mesh faces. Looking at the equations of motion:

$$M \cdot \ddot{\mathbf{x}} = M \cdot \mathbf{g} - k(\mathbf{x}_{current} - \mathbf{x}_{rest}) + \mathbf{F}_{wind} - a \cdot \dot{\mathbf{x}}$$

To determine $M$, a simple constant (say, 1) is fine for all vertices. To be more accurate, you should compute the area of each triangle, and assign 1/3rd of it towards the mass of each incident vertex; this way the mass of the entire cloth is the total area of all the triangles times the mass density of the cloth. The gravity vector $\mathbf{g}$ can also be an arbitrary vector; if all distance units were meters, time was measured in seconds, and we were on the surface of the earth and "y" was the "up/down" vector, `(0, -9.8, 0)` would be the correct "g". $\mathbf{x}_{current}$ is just the current length of the spring, and $\mathbf{x}_{rest}$, the spring's rest length, needs to be stored in each spring structure. $\mathbf{F}_{wind}$ can just be some globally varying constant function, say `(sin(x*y*t), cos(z*t), sin(cos(5*x*y*z)))`. $a$ is a simple constant determined by the properties of the surrounding fluid (usually air), but it can also be used to achieve certain cloth effects, and can help with the numeric stability of the cloth. $k$ is a very important constant; if too low, the cloth will sag unrealistically.

On the other hand, if $k$ is chosen too large, the system will be unrealistically tight (retain its original shape). Worse yet, the system will be more and more "stiff" the larger $k$ is chosen; this is a mathematical term for explosive. Without careful attention to the integration method, the system will gain energy as a function of time, and the system will explode with vertices tending towards infinity.

### Elasticity Model

The mass-spring model above has several shortcomings. Mostly, it is not very physically correct, so attempting to use physically accurate constants is generally unsuccessful. Furthermore, it requires guessing arbitrarily which vertices should be connected to which by a spring, and choosing $k$ such that increasing the resolution of the grid leads to a system with similar characteristics can be tricky. A more accurate model, based on integrating an energy over the surface of the cloth, considers energy terms such as:

- Triangles and edges resist changes in their size, and compressing or expanding them requires energy.
    
- Edges resist bending, so bending the two faces adjacent away from the initial bend of this edge (0 for a planar initial condition) requires energy.
    
- Triangles resist deformation (in addition to resisting changes in size). So attempting to shear or otherwise deform a triangle requires energy.
    

We imagine a giant vector, $S$, representing every important variable in the system (position and velocities of all the vertices, although potentially there could be more degrees of freedom). Given energy as a function of the current state of the system, $E(S)$, the equation of motion for a single vertex at position $(x, y, z)$ is then rather simple:

$$F_x = -\frac{\partial E(S)}{\partial x}$$

Evaluating this, however, is not so simple. Generally, this derivative must be computed analytically. Suppose we attempted to compute the derivative numerically; we consider the state variable constant, reducing our energy $E(S)$ to $E(x)$. We then say:

$$\frac{\partial E}{\partial x} \approx \frac{E(x + \epsilon) - E(x - \epsilon)}{2\epsilon}$$

But evaluating the energy $E(S)$ takes a long time; we must iterate over all the vertices, faces, and edges, summing the energy of each one. But we might notice that the effect of $x$ on the energy depends on a very local region (all the incident edges and faces, called the one-ring of the vertex). So to keep our algorithm $O(n)$ when doing the derivative numerically, we must make sure that we compute $E(x)$ by only considering the energy of the one-ring of the vertex in question.

In general, this method can be very challenging to implement, and although it is physically much more sound, in practice the results are in some ways better and in some ways worse than the mass-spring model.

---

## Integrators

After we decide on the cloth model, we need a method to integrate the equation of motion. Assuming our model is Newtonian, we have at every vertex defined a position and velocity at each time step $t$, and our equation of motion tells us $dv/dt$, or the acceleration of each vertex at time $t$, and we want to know the position and velocity at the next time step.

### Euler's Method (Explicit)

The simplest method for integrating our equations is Euler's method. It goes like this:

$$\mathbf{x}_{t+dt} = \mathbf{x}_t + \mathbf{v}_t \cdot dt$$

$$\mathbf{v}_{t+dt} = \mathbf{v}_t + \left(\frac{d\mathbf{v}}{dt}\right)_t \cdot dt$$

The $t$ subscript on $dv/dt$ means "$dv/dt$ evaluated at time $t$" (as opposed to say, $dv/dt$ at the previous or the next time step). Delta $t$ refers to the timestep we're taking (smaller time step means more accurate results but slower computation times). We can derive the above method quite simply. This method is very simple to implement, but it has the disadvantage that for most systems, it has a large amount of positive feedback, and tends to cause all variables to rapidly increase to ridiculous values, no matter how small the time step. The only way to solve this problem without altering the model is to use an implicit integrator.

### Runge Kutta (Explicit)

Euler's method is not only explosive, it is very inaccurate. As you decrease the time step, the error decreases proportionally. It is possible to use higher-order terms of the derivative to create a much more accurate integrator. There are many such methods, one of the most widely-used of which is called Runge-Kutta. 4th order is considered optimal, since it guarantees the integrator error decreases proportional to the fourth power of the time step.

### Verlet Algorithm (Explicit)

The Verlet integration algorithm is an explicit model with the very interesting property that it does not need to know anything about the velocity; it computes this internally via looking at the position at both the current and previous time step:

$$\mathbf{x}_{t+dt} = 2\mathbf{x}_t - \mathbf{x}_{t-dt} + \mathbf{a}_t \cdot dt^2$$

Another wonderful aspect of this algorithm is that like 4th order Runge-Kutta, it is 4th order accurate. Because it is quite accurate, easy to implement, and does not need the velocity terms, it is an excellent explicit model.

### Euler's Method (Implicit)

Unlike an explicit integrator, an implicit integrator uses the state variable at the current time step and the derivative at the next time step to compute the state variable at the next time step.

$$\mathbf{v}_{t+dt} = \mathbf{v}_t + \left(\frac{d\mathbf{v}}{dt}\right)_{t+dt} \cdot dt$$

$$\mathbf{x}_{t+dt} = \mathbf{x}_t + \mathbf{v}_{t+dt} \cdot dt$$

Linearize the equations of motion so we can represent $dv/dt$ at time $t+dt$ as follows:

$$\left(\frac{d\mathbf{v}}{dt}\right)_{t+dt} \approx \left(\frac{d\mathbf{v}}{dt}\right)_t + \mathbf{Q} \cdot \Delta \mathbf{v}$$

Where $\mathbf{Q}$ is a giant 3n by 6n matrix representing the linear relationship between the change in velocities and the state of the system. We would then substitute this into the implicit euler equation for $dv/dt$, and solve for the velocity at the new time step. However, this would involve inverting the massive matrix $\mathbf{Q}$ (which is thankfully very sparse). This is generally accomplished with linear conjugate gradient descent.

### Symplectic Euler's Method (Semi-Implicit)

Many algorithms exist which are compromises between implicit and explicit models. A simple one is called Symplectic Euler's Method. Its equations of motion are:

$$\mathbf{v}_{t+dt} = \mathbf{v}_t + \mathbf{a}_t \cdot dt$$

$$\mathbf{x}_{t+dt} = \mathbf{x}_t + \mathbf{v}_{t+dt} \cdot dt$$

It is called semi-implicit because it computes the velocity explicitly, but the new position implicitly. This helps reduce the feedback (positive or negative) and can greatly improve stability, at no cost in algorithmic complexity.

---

## Collisions

### Cloth-Object Collisions

Generally the easier of the two types of collisions to deal with, we assume we have some solid objects in the scene, and independent of their motion, their position at and around time $t$ is fixed and known.

**Physically Correct Model:**

- Starting at time $t$ and cloth positions $x(t)$, compute the proposed $x(t + dt)$
    
- For every face on the mesh, consider its initial and final position. If between $t$ and $t + dt$, this face has interacted an external object, compute the exact time when these surfaces first came into contact.
    
- Find the time of the earliest such collision. Back the simulation up to this time, and mark this face as being in contact with the surface it hit.
    
- When a face is marked as in contact, compute all of its static and kinetic friction forces. Resume the simulation from this new time step, and repeat.
    

**Easy-to-implement Model:**

The only thing the algorithm considers is if a vertex at the positions computed for the next time step is inside one of the objects in the scene, we detect a collision. Our response can be one of two things: move the vertex back to where it came from (this is equivalent to an infinite-friction surface) or we could "repel" the object to its closest valid normal point.

### Cloth-Cloth Collisions

Cloth looks very unrealistic if it passes through itself.

A simple solution is to apply a repulsive force to vertices that get too close, encouraging separation.

A separate, powerful solution is to compute the new positions, determine any intersections that happened, go back to the previous time step, and modify the magnitudes of the velocities in such a way that the collisions no longer occur.

Another method is to consider the cloth as a set of connected marbles centered around each vertex. If the new positions contain vertices whose marbles are inside each other, back the vertices up such that this collision has not occurred and zero the new velocities.

---

## Improvements

### Maximum Stretch

The idea of maximum stretch is the savior of all exploding cloth simulations. The idea is very simple: whenever two connected vertices are stretched beyond a certain maximum ratio compared to their rest distance (say 110%, so 10% stretch) move them such that they are stretched at exactly 10%. Likewise we can say that whenever two connected vertices are compressed closer than 90%, place them at exactly 90% compression. The energy of the system will not explode, and the cloth will always settle into a reasonable configuration.

### Bending Springs

Rather than just connecting a vertex to its immediate neighbors by a spring, we can attach a vertex to its more distant, "two-ring" neighbors, as well. The strength of these long-range springs compared to the base strength can be thought of as a bending strength, since resistance to this kind of motion will keep the cloth locally more flat.

---

## Rendering

### Subdivision

The cloth structure can be easily rendered by using the triangle structure of the original mesh. If one wants volume, they can generate an implicit function across a 3D grid and use marching cubes to extract an offset surface.

By increasing the resolution of the marching cubes, we can make the approximation as close as we wish. However, marching cubes does not give us a very uniform triangulation of the surface. To solve this, we first simplify the mesh producing many less vertices, and then we perform subdivision on the resulting mesh, finally refitting it to the original surface $f(x, y, z)$.

We can do many other tricks using this quilting; for example, if we define $d(x, y, z)$ as the distance to a vertex on the initial cloth, rather than the distance to the surface of the cloth, we will get a "knot" at each source vertex.

---

_© 2014 Matthew Fisher. All rights reserved._

---

## Related ideas

- [Smart Halftone System](../smart-halftone-system/00-overview.md)
- [Topographic Dot Halftone](../topographic-dot-halftone/00-overview.md)
- [ASCII Art Generator](../ascii-art-generator/00-overview.md)
- [Stipple → Single-Line Path](../../art/generative/stipple-single-line-path.md)
- [Complex Line Shading](../complex-line-shading/00-overview.md)
- [Stipple Node Spec](../image-editor/Nodes.md)
