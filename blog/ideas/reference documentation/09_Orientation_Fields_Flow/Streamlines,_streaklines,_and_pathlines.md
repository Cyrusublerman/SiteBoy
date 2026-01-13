# Streamlines, streaklines, and pathlines

Streamlines, streaklines and pathlines are field lines in a fluid flow. They differ only when the flow changes with time, that is, when the flow is not steady. Considering a velocity vector field in three-dimensional space in the framework of continuum mechanics:


- Streamlines are a family of curves whose tangent vectors constitute the velocity vector field of the flow. These show the direction in which a massless fluid element will travel at any point in time.
- Streaklines are the loci of points of all the fluid particles that have passed continuously through a particular spatial point in the past. Dye steadily injected into the fluid at a fixed point (as in dye tracing) extends along a streakline.
- Pathlines are the trajectories that individual fluid particles follow. These can be thought of as "recording" the path of a fluid element in the flow over a certain period. The direction the path takes will be determined by the streamlines of the fluid at each moment in time.

By definition, different streamlines at the same instant in a flow do not intersect, because a fluid particle cannot have two different velocities at the same point. Pathlines are allowed to intersect themselves or other pathlines (except the starting and end points of the different pathlines, which need to be distinct). Streaklines can also intersect themselves and other streaklines.

Streamlines provide a snapshot of some flowfield characteristics, whereas streaklines and pathlines depend on the full time-history of the flow. Often, sequences of streamlines or streaklines at different instants, presented either in a single image or with a videostream, may provide insight to the flow and its history.

If a line, curve or closed curve is used as start point for a continuous set of streamlines, the result is a stream surface. In the case of a closed curve in a steady flow, fluid that is inside a stream surface must remain forever within that same stream surface, because the streamlines are tangent to the flow velocity. A scalar function whose contour lines define the streamlines is known as the stream function.


## Mathematical description


### Streamlines

Streamlines are defined by
$${d{\vec {x}}_{S} \over ds}\times {\vec {u}}({\vec {x}}_{S})={\vec {0}},
$$where "$\times$" denotes the vector cross product and ${\vec {x}}_{S}(s)$ is the parametric representation of just one streamline at one moment in time.

If the components of the velocity are written ${\vec {u}}=(u,v,w),$ and those of the streamline as ${\vec {x}}_{S}=(x_{S},y_{S},z_{S}),$ then
$${dx_{S} \over u}={dy_{S} \over v}={dz_{S} \over w},
$$which shows that the curves are parallel to the velocity vector. Here $s$ is a variable which parametrizes the curve $s\mapsto {\vec {x}}_{S}(s).$ Streamlines are calculated instantaneously, meaning that at one instance of time they are calculated throughout the fluid from the instantaneous flow velocity field.

A streamtube consists of a bundle of streamlines, much like communication cable.

The equation of motion of a fluid on a streamline for a flow in a vertical plane is:
$${\frac {\partial c}{\partial t}}+c{\frac {\partial c}{\partial s}}=\nu {\frac {\partial ^{2}c}{\partial r^{2}}}-{\frac {1}{\rho }}{\frac {\partial p}{\partial s}}-g{\frac {\partial z}{\partial s}}
$$

The flow velocity in the direction $s$ of the streamline is denoted by $c$. $r$ is the radius of curvature of the streamline. The density of the fluid is denoted by $\rho$ and the kinematic viscosity by $\nu$.
$${\frac {\partial p}{\partial s}}
$$is the pressure gradient and
$${\frac {\partial c}{\partial s}}
$$the velocity gradient along the streamline. For a steady flow, the time derivative of the velocity is zero:
$${\frac {\partial c}{\partial t}}=0
$$. $g$ denotes the gravitational acceleration.


### Pathlines

Pathlines are defined by
$${\begin{cases}{\dfrac {d{\vec {x}}_{P}}{dt}}(t)={\vec {u}}_{P}({\vec {x}}_{P}(t),t)\\[1.2ex]{\vec {x}}_{P}(t_{0})={\vec {x}}_{P0}\end{cases}}
$$

The subscript $P$ indicates a following of the motion of a fluid particle. The following statement does not seem to make sense to me. Please correct it and remove the comment. For pathlines there is a <math&#x3E;t</math&#x3E; (time) dependence. This is because they are how the fluid moves one particle so if the flow changes in time this is reflected affects the path. Note that at point ${\vec {x}}_{P}$ the curve is parallel to the flow velocity vector ${\vec {u}}$, where the velocity vector is evaluated at the position of the particle ${\vec {x}}_{P}$ at that time $t$.


### Streaklines

Streaklines can be expressed as,
$${\begin{cases}\displaystyle {\frac {d{\vec {x}}_{str}}{dt}}={\vec {u}}_{P}({\vec {x}}_{str},t)\\[1.2ex]{\vec {x}}_{str}(t=\tau _{P})={\vec {x}}_{P0}\end{cases}}
$$where, ${\vec {u}}_{P}({\vec {x}},t)$ is the velocity of a particle $P$ at location ${\vec {x}}$ and time $t$. The parameter $\tau _{P}$, parametrizes the streakline ${\vec {x}}_{str}(t,\tau _{P})$ and $t_{0}\leq \tau _{P}\leq t$, where $t$ is a time of interest.


## Steady flows

In steady flow (when the velocity vector-field does not change with time), the streamlines, pathlines, and streaklines coincide. This is because when a particle on a streamline reaches a point, $a_{0}$, further on that streamline the equations governing the flow will send it in a certain direction ${\vec {x}}$. As the equations that govern the flow remain the same when another particle reaches $a_{0}$ it will also go in the direction ${\vec {x}}$. If the flow is not steady then when the next particle reaches position $a_{0}$ the flow would have changed and the particle will go in a different direction.

This is useful, because it is usually very difficult to look at streamlines in an experiment. If the flow is steady, one can use streaklines to describe the streamline pattern.


## Frame dependence

Streamlines are frame-dependent. That is, the streamlines observed in one inertial reference frame are different from those observed in another inertial reference frame. For instance, the streamlines in the air around an aircraft wing are defined differently for the passengers in the aircraft than for an observer on the ground. In the aircraft example, the observer on the ground will observe unsteady flow, and the observers in the aircraft will observe steady flow, with constant streamlines. When possible, fluid dynamicists try to find a reference frame in which the flow is steady, so that they can use experimental methods of creating streaklines to identify the streamlines.


## Application

Knowledge of the streamlines can be useful in fluid dynamics. The curvature of a streamline is related to the pressure gradient acting perpendicular to the streamline. The center of curvature of the streamline lies in the direction of decreasing radial pressure. The magnitude of the radial pressure gradient can be calculated directly from the density of the fluid, the curvature of the streamline and the local velocity.

Dye can be used in water, or smoke in air, in order to see streaklines, from which pathlines can be calculated. Streaklines are identical to streamlines for steady flow. Further, dye can be used to create timelines. The patterns guide design modifications, aiming to reduce the drag. This task is known as streamlining, and the resulting design is referred to as being streamlined. Streamlined objects and organisms, like airfoils, streamliners, cars and dolphins are often aesthetically pleasing to the eye. The Streamline Moderne style, a 1930s and 1940s offshoot of Art Deco, brought flowing lines to architecture and design of the era. The canonical example of a streamlined shape is a chicken egg with the blunt end facing forwards. This shows clearly that the curvature of the front surface can be much steeper than the back of the object. Most drag is caused by eddies in the fluid behind the moving object, and the objective should be to allow the fluid to slow down after passing around the object, and regain pressure, without forming eddies.

The same terms have since become common vernacular to describe any process that smooths an operation. For instance, it is common to hear references to streamlining a business practice, or operation.


## See also


- Physics portal


- Drag coefficient
- Elementary flow
- Equipotential surface
- Flow visualization
- Flow velocity
- Scientific visualization
- Seeding (fluid dynamics)
- Stream function
- Streamsurface
- Streamlet (scientific visualization)


## Notes and references


## External links


- Streamline illustration
- Tutorial - Illustration of Streamlines, Streaklines and Pathlines of a Velocity Field(with applet)
- Joukowsky Transform Interactive WebApp
