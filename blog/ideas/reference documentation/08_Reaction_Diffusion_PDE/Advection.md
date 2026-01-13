# Advection

## 1. Overview
Advection is the transport of a substance or quantity by the bulk motion of a fluid. In computer graphics and simulation, advection describes how properties (color, density, temperature, particles) are carried along by a velocity field. It is fundamental to fluid dynamics, smoke simulation, and flow visualization.

## 2. Mathematical Definition
The advection equation describes how a scalar field \(\phi\) evolves when transported by a velocity field \(\mathbf{u}\):

$$\frac{\partial \phi}{\partial t} + \mathbf{u} \cdot \nabla\phi = 0$$

For a 2D velocity field \(\mathbf{u} = (u, v)\):

$$\frac{\partial \phi}{\partial t} + u\frac{\partial \phi}{\partial x} + v\frac{\partial \phi}{\partial y} = 0$$

## 3. Numerical Methods

### 3.1 Semi-Lagrangian Advection
The most stable method for large timesteps. Instead of pushing values forward, trace backward to find where each point came from:

1. For each grid point \(\mathbf{x}\), trace backward along velocity: \(\mathbf{x}' = \mathbf{x} - \Delta t \cdot \mathbf{u}(\mathbf{x})\)
2. Interpolate \(\phi\) at \(\mathbf{x}'\)
3. Set \(\phi^{n+1}(\mathbf{x}) = \phi^n(\mathbf{x}')\)

**Advantages**: Unconditionally stable
**Disadvantages**: Numerical dissipation (blurring)

### 3.2 MacCormack Method
A predictor-corrector scheme that reduces dissipation:

1. **Predict**: \(\phi^* = \text{advect}(\phi^n, \mathbf{u}, \Delta t)\)
2. **Correct**: \(\phi^{**} = \text{advect}(\phi^*, -\mathbf{u}, \Delta t)\)
3. **Combine**: \(\phi^{n+1} = \phi^* + 0.5(\phi^n - \phi^{**})\)

### 3.3 BFECC (Back and Forth Error Compensation and Correction)
Similar to MacCormack but with explicit error compensation:

$$\phi^{n+1} = \phi^* + \frac{1}{2}(\phi^n - \phi^{**})$$

With clamping to prevent oscillations:
$$\phi^{n+1} = \text{clamp}(\phi^{n+1}, \min_{\text{neighbors}}, \max_{\text{neighbors}})$$

### 3.4 Upwind Scheme
For forward Euler, use upwind differencing based on velocity direction:

$$\frac{\partial \phi}{\partial x} \approx \begin{cases}
\frac{\phi_i - \phi_{i-1}}{\Delta x} & \text{if } u > 0 \\
\frac{\phi_{i+1} - \phi_i}{\Delta x} & \text{if } u < 0
\end{cases}$$

## 4. Flow Field Advection

### 4.1 Particle Advection
Update particle position using velocity field:

$$\mathbf{p}^{n+1} = \mathbf{p}^n + \Delta t \cdot \mathbf{u}(\mathbf{p}^n)$$

Higher-order integration (RK4):
$$\mathbf{k}_1 = \mathbf{u}(\mathbf{p}^n)$$
$$\mathbf{k}_2 = \mathbf{u}(\mathbf{p}^n + 0.5\Delta t \cdot \mathbf{k}_1)$$
$$\mathbf{k}_3 = \mathbf{u}(\mathbf{p}^n + 0.5\Delta t \cdot \mathbf{k}_2)$$
$$\mathbf{k}_4 = \mathbf{u}(\mathbf{p}^n + \Delta t \cdot \mathbf{k}_3)$$
$$\mathbf{p}^{n+1} = \mathbf{p}^n + \frac{\Delta t}{6}(\mathbf{k}_1 + 2\mathbf{k}_2 + 2\mathbf{k}_3 + \mathbf{k}_4)$$

### 4.2 Streamline Integration
Trace a path following the velocity field:

```
path = [start_point]
p = start_point
while in_bounds(p):
    p = p + dt * velocity(p)
    path.append(p)
```

### 4.3 Line Integral Convolution (LIC)
Visualize flow by smearing noise along streamlines.

## 5. CFL Condition
For explicit schemes, stability requires the Courant-Friedrichs-Lewy condition:

$$\text{CFL} = \frac{|u| \Delta t}{\Delta x} \leq 1$$

The timestep must be small enough that information doesn't skip grid cells.

## 6. Velocity Field Sources

### 6.1 Analytic Fields
- **Uniform**: \(\mathbf{u} = (U, 0)\)
- **Radial**: \(\mathbf{u} = \frac{\mathbf{p} - c}{\|\mathbf{p} - c\|}\)
- **Rotational**: \(\mathbf{u} = (-(y - c_y), (x - c_x))\)
- **Noise-based**: \(\mathbf{u} = (\text{noise}_1(\mathbf{p}), \text{noise}_2(\mathbf{p}))\)

### 6.2 Curl Noise (Divergence-Free)
Create incompressible flow from potential:
$$\mathbf{u} = \nabla \times \psi = \left(\frac{\partial \psi}{\partial y}, -\frac{\partial \psi}{\partial x}\right)$$

Where \(\psi\) is Perlin or simplex noise.

## 7. Applications
- Fluid simulation (smoke, water, fire)
- Flow visualization
- Procedural animation (grass, hair)
- Weather simulation
- Generative art (particle systems)

## 8. References
- Stam, Jos. "Stable fluids." SIGGRAPH 99 (1999): 121-128.
- Bridson, Robert. "Fluid simulation for computer graphics." CRC Press, 2015.
- "Advection." Wikipedia. https://en.wikipedia.org/wiki/Advection

