# Orientation (geometry)

In geometry, the orientation, attitude, bearing, direction, or angular position of an object – such as a line, plane or rigid body – is part of the description of how it is placed in the space it occupies. More specifically, it refers to the imaginary rotation that is needed to move the object from a reference placement to its current placement. A rotation may not be enough to reach the current placement, in which case it may be necessary to add an imaginary translation to change the object's position (or linear position). The position and orientation together fully describe how the object is placed in space. The above-mentioned imaginary rotation and translation may be thought to occur in any order, as the orientation of an object does not change when it translates, and its position does not change when it rotates.

Euler's rotation theorem shows that in three dimensions any orientation can be reached with a single rotation around a fixed axis. This gives one common way of representing the orientation using an axis–angle representation. Other widely used methods include rotation quaternions, rotors, Euler angles, or rotation matrices. More specialist uses include Miller indices in crystallography, strike and dip in geology and grade on maps and signs. A unit vector may also be used to represent an object's normal vector direction or the relative direction between two points.

Typically, the orientation is given relative to a frame of reference, usually specified by a Cartesian coordinate system.


## Mathematical representations


### Three dimensions

In general the position and orientation in space of a rigid body are defined as the position and orientation, relative to the main reference frame, of another reference frame, which is fixed relative to the body, and hence translates and rotates with it (the body's local reference frame, or local coordinate system). At least three independent values are needed to describe the orientation of this local frame. Three other values describe the position of a point on the object. All the points of the body change their position during a rotation except for those lying on the rotation axis. If the rigid body has rotational symmetry not all orientations are distinguishable, except by observing how the orientation evolves in time from a known starting orientation. For example, the orientation in space of a line, line segment, or vector can be specified with only two values, for example two direction cosines. Another example is the position of a point on the Earth, often described using the orientation of a line joining it with the Earth's center, measured using the two angles of longitude and latitude. Likewise, the orientation of a plane can be described with two values as well, for instance by specifying the orientation of a line normal to that plane, or by using the strike and dip angles.

Further details about the mathematical methods to represent the orientation of rigid bodies and planes in three dimensions are given in the following sections.


### Two dimensions

In two dimensions the orientation of any object (line, vector, or plane figure) is given by a single value: the angle through which it has rotated. There is only one degree of freedom and only one fixed point about which the rotation takes place.


### Multiple dimensions

When there are d dimensions, specification of an orientation of an object that does not have any rotational symmetry requires d(d − 1) / 2 independent values.


## Rigid body in three dimensions

Several methods to describe orientations of a rigid body in three dimensions have been developed. They are summarized in the following sections.


### Euler angles

The first attempt to represent an orientation is attributed to Leonhard Euler. He imagined three reference frames that could rotate one around the other, and realized that by starting with a fixed reference frame and performing three rotations, he could get any other reference frame in the space (using two rotations to fix the vertical axis and another to fix the other two axes). The values of these three rotations are called Euler angles.


#### Tait–Bryan angles

These are three angles, also known as yaw, pitch and roll, Navigation angles and Cardan angles. Mathematically they constitute a set of six possibilities inside the twelve possible sets of Euler angles, the ordering being the one best used for describing the orientation of a vehicle such as an airplane. In aerospace engineering they are usually referred to as Euler angles.


### Orientation vector

Euler also realized that the composition of two rotations is equivalent to a single rotation about a different fixed axis (Euler's rotation theorem). Therefore, the composition of the former three angles has to be equal to only one rotation, whose axis was complicated to calculate until matrices were developed.

Based on this fact he introduced a vectorial way to describe any rotation, with a vector on the rotation axis and module equal to the value of the angle. Therefore, any orientation can be represented by a rotation vector (also called Euler vector) that leads to it from the reference frame. When used to represent an orientation, the rotation vector is commonly called orientation vector, or attitude vector.

A similar method, called axis–angle representation, describes a rotation or orientation using a unit vector aligned with the rotation axis, and a separate value to indicate the angle (see figure).


### Orientation matrix

With the introduction of matrices, the Euler theorems were rewritten. The rotations were described by orthogonal matrices referred to as rotation matrices or direction cosine matrices. When used to represent an orientation, a rotation matrix is commonly called orientation matrix, or attitude matrix.

The above-mentioned Euler vector is the eigenvector of a rotation matrix (a rotation matrix has a unique real eigenvalue). The product of two rotation matrices is the composition of rotations. Therefore, as before, the orientation can be given as the rotation from the initial frame to achieve the frame that we want to describe.

The configuration space of a non-symmetrical object in n-dimensional space is SO(n) × Rn. Orientation may be visualized by attaching a basis of tangent vectors to an object. The direction in which each vector points determines its orientation.


### Orientation quaternion

Another way to describe rotations is using rotation quaternions, also called versors. They are equivalent to rotation matrices and rotation vectors. With respect to rotation vectors, they can be more easily converted to and from matrices. When used to represent orientations, rotation quaternions are typically called orientation quaternions or attitude quaternions.


## Usage examples


### Rigid body

The attitude of a rigid body is its orientation as described, for example, by the orientation of a frame fixed in the body relative to a fixed reference frame. The attitude is described by attitude coordinates, and consists of at least three coordinates. One scheme for orienting a rigid body is based upon body-axes rotation; successive rotations three times about the axes of the body's fixed reference frame, thereby establishing the body's Euler angles. Another is based upon roll, pitch and yaw, although these terms also refer to incremental deviations from the nominal attitude


## See also


- Angular displacement
- Attitude control
- Body relative direction
- Directional statistics
- Oriented area
- Plane of rotation
- Rotation formalisms in three dimensions
- Signed direction
- Terms of orientation
- Triad method


## External links


- @media screen{html.skin-theme-clientpref-night .mw-parser-output .sister-inline-image img[src*="Wiktionary-logo-en-v2.svg"]{filter:invert(1)brightness(55%)contrast(250%)hue-rotate(180deg)}}@media screen and (prefers-color-scheme:dark){html.skin-theme-clientpref-os .mw-parser-output .sister-inline-image img[src*="Wiktionary-logo-en-v2.svg"]{filter:invert(1)brightness(55%)contrast(250%)hue-rotate(180deg)}} Media related to Orientation (mathematics) at Wikimedia Commons
