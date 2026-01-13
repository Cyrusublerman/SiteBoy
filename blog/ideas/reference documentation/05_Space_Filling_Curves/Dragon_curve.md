# Dragon curve

A dragon curve is any member of a family of self-similar fractal curves, which can be approximated by recursive methods such as Lindenmayer systems. The dragon curve is probably most commonly thought of as the shape that is generated from repeatedly folding a strip of paper in half, although there are other curves that are called dragon curves that are generated differently.


## Heighway dragon

The Heighway dragon (also known as the Harter–Heighway dragon or the Jurassic Park dragon) was first investigated by NASA physicists John Heighway, Bruce Banks, and William Harter. It was described by Martin Gardner in his Scientific American column Mathematical Games in 1967. Many of its properties were first published by Chandler Davis and Donald Knuth. It appeared on the section title pages of the Michael Crichton novel Jurassic Park.


### Construction

The Heighway dragon can be constructed from a base line segment by repeatedly replacing each segment by two segments with a right angle and with a rotation of 45° alternatively to the right and to the left:

The Heighway dragon is also the limit set of the following iterated function system in the complex plane:


$$f_{1}(z)={\frac {(1+i)z}{2}}
$$


$$f_{2}(z)=1-{\frac {(1-i)z}{2}}
$$

with the initial set of points $S_{0}=\{0,1\}$.

Using pairs of real numbers instead, this is the same as the two functions consisting of


$$f_{1}(x,y)={\frac {1}{\sqrt {2}}}{\begin{pmatrix}\cos 45^{\circ }&-\sin 45^{\circ }\\\sin 45^{\circ }&\cos 45^{\circ }\end{pmatrix}}{\begin{pmatrix}x\\y\end{pmatrix}}
$$


$$f_{2}(x,y)={\frac {1}{\sqrt {2}}}{\begin{pmatrix}\cos 135^{\circ }&-\sin 135^{\circ }\\\sin 135^{\circ }&\cos 135^{\circ }\end{pmatrix}}{\begin{pmatrix}x\\y\end{pmatrix}}+{\begin{pmatrix}1\\0\end{pmatrix}}
$$


### Folding the dragon

The Heighway dragon curve can be constructed by folding a strip of paper, which is how it was originally discovered. Take a strip of paper and fold it in half to the right. Fold it in half again to the right. If the strip was opened out now, unbending each fold to become a 90-degree turn, the turn sequence would be RRL, i.e. the second iteration of the Heighway dragon. Fold the strip in half again to the right, and the turn sequence of the unfolded strip is now RRLRRLL – the third iteration of the Heighway dragon. Continuing folding the strip in half to the right to create further iterations of the Heighway dragon (in practice, the strip becomes too thick to fold sharply after four or five iterations).

The folding patterns of this sequence of paper strips, as sequences of right (R) and left (L) folds, are:


- 1st iteration: R
- 2nd iteration: R R L
- 3rd iteration: R R L R R L L
- 4th iteration: R R L R R L L R R R L L R L L.

Each iteration can be found by copying the previous iteration, then an R, then a second copy of the previous iteration in reverse order with the L and R letters swapped.


### Properties


- Many self-similarities can be seen in the Heighway dragon curve. The most obvious is the repetition of the same pattern tilted by 45° and with a reduction ratio of $\textstyle {\sqrt {2}}$. Based on these self-similarities, many of its lengths are simple rational numbers.


- The dragon curve can tile the plane. One possible tiling replaces each edge of a square tiling with a dragon curve, using the recursive definition of the dragon starting from a line segment. The initial direction to expand each segment can be determined from a checkerboard coloring of a square tiling, expanding vertical segments into black tiles and out of white tiles, and expanding horizontal segments into white tiles and out of black ones.
- As a space-filling curve, the dragon curve has fractal dimension exactly 2. For a dragon curve with initial segment length 1, its area is 1/2, as can be seen from its tilings of the plane.
- The boundary of the set covered by the dragon curve has infinite length, with fractal dimension $2\log _{2}\lambda \approx 1.523627086202492,$ where
$$\lambda ={\frac {1+(28-3{\sqrt {87}})^{1/3}+(28+3{\sqrt {87}})^{1/3}}{3}}\approx 1.69562076956
$$is the real solution of the equation $\lambda ^{3}-\lambda ^{2}-2=0.$


## Twindragon

The twindragon (also known as the Davis–Knuth dragon) can be constructed by placing two Heighway dragon curves back to back. It is also the limit set of the following iterated function system:


$$f_{1}(z)={\frac {(1+i)z}{2}}
$$


$$f_{2}(z)=1-{\frac {(1+i)z}{2}}
$$

where the initial shape is defined by the following set $S_{0}=\{0,1,1-i\}$.

It can be also written as a Lindenmayer system – it only needs adding another section in the initial string:


- angle 90°
- initial string FX+FX+
- string rewriting rules X ↦ X+YF Y ↦ FX−Y.

It is also the locus of points in the complex plane with the same integer part when written in base ( − 1 ± i ) {\displaystyle (-1\pm i)} .


## Terdragon

The terdragon can be written as a Lindenmayer system:


- angle 120°
- initial string F
- string rewriting rules F ↦ F+F−F.

It is the limit set of the following iterated function system:

$f_{1}(z)=\lambda z$


$$f_{2}(z)={\frac {i}{\sqrt {3}}}z+\lambda
$$

$f_{3}(z)=\lambda z+\lambda ^{*}$


$${\mbox{where }}\lambda ={\frac {1}{2}}-{\frac {i}{2{\sqrt {3}}}}{\text{ and }}\lambda ^{*}={\frac {1}{2}}+{\frac {i}{2{\sqrt {3}}}}.
$$


## Lévy dragon

The Lévy C curve is sometimes known as the Lévy dragon.


## Occurrences of the dragon curve in solution sets

Having obtained the set of solutions to a linear differential equation, any linear combination of the solutions will, because of the superposition principle, also obey the original equation. In other words, new solutions are obtained by applying a function to the set of existing solutions. This is similar to how an iterated function system produces new points in a set, though not all IFS are linear functions. In a conceptually similar vein, a set of Littlewood polynomials can be arrived at by such iterated applications of a set of functions.

A Littlewood polynomial is a polynomial:
$$p(x)=\sum _{i=0}^{n}a_{i}x^{i}\,
$$where all $a_{i}=\pm 1$.

For some $|w|<1$ we define the following functions:

$f_{+}(z)=1+wz$

$f_{-}(z)=1-wz$

Starting at z=0 we can generate all Littlewood polynomials of degree d using these functions iteratively d+1 times. For instance: $f_{+}(f_{-}(f_{-}(0)))=1+(1-w)w=1+1w-1w^{2}$

It can be seen that for $w=(1+i)/2$, the above pair of functions is equivalent to the IFS formulation of the Heighway dragon. That is, the Heighway dragon, iterated to a certain iteration, describe the set of all Littlewood polynomials up to a certain degree, evaluated at the point $w=(1+i)/2$. Indeed, when plotting a sufficiently high number of roots of the Littlewood polynomials, structures similar to the dragon curve appear at points close to these coordinates.


## Variants

The dragon curve belongs to a basic set of iteration functions consisting of two lines with four possible orientations at perpendicular angles


*[Table: ]*

It is possible to change the turn angle from 90° to other angles. Changing to 120° yields a structure of triangles, while 60° gives the following curve:

A discrete dragon curve can be converted to a dragon polyomino as shown. Like discrete dragon curves, dragon polyominoes approach the fractal dragon curve as a limit.


## See also


- List of fractals by Hausdorff dimension
- Complex-base system


## External links


- Weisstein, Eric W., "Dragon Curve", MathWorld
- Knuth on the Dragon Curve
- Dragon Curve
