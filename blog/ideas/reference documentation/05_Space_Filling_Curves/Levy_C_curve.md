# Lévy C curve

In mathematics, the Lévy C curve is a self-similar fractal curve that was first described and whose differentiability properties were analysed by Ernesto Cesàro in 1906 and Georg Faber in 1910, but now bears the name of French mathematician Paul Lévy, who was the first to describe its self-similarity properties as well as to provide a geometrical construction showing it as a representative curve in the same class as the Koch curve. It is a special case of a period-doubling curve, a de Rham curve.


## L-system construction

If using a Lindenmayer system then the construction of the C curve starts with a straight line. An isosceles triangle with angles of 45°, 90° and 45° is built using this line as its hypotenuse. The original line is then replaced by the other two sides of this triangle.

At the second stage, the two new lines each form the base for another right-angled isosceles triangle, and are replaced by the other two sides of their respective triangle. So, after two stages, the curve takes the appearance of three sides of a rectangle with the same length as the original line, but only half as wide.

At each subsequent stage, each straight line segment in the curve is replaced by the other two sides of a right-angled isosceles triangle built on it. After n stages the curve consists of 2 line segments, each of which is smaller than the original line by a factor of 2.

This L-system can be described as follows:

where "F" means "draw forward", "+" means "turn clockwise 45°", and "−" means "turn anticlockwise 45°".

The fractal curve that is the limit of this "infinite" process is the Lévy C curve. It takes its name from its resemblance to a highly ornamented version of the letter "C". The curve resembles the finer details of the Pythagoras tree.

The Hausdorff dimension of the C curve equals 2 (it contains open sets), whereas the boundary has dimension about 1.9340 .


### Variations

The standard C curve is built using 45° isosceles triangles. Variations of the C curve can be constructed by using isosceles triangles with angles other than 45°. As long as the angle is less than 60°, the new lines introduced at each stage are each shorter than the lines that they replace, so the construction process tends towards a limit curve. Angles less than 45° produce a fractal that is less tightly "curled".


## IFS construction

If using an iterated function system (IFS, or the chaos game IFS-method actually), then the construction of the C curve is a bit easier. It will need a set of two "rules" which are: Two points in a plane (the translators), each associated with a scale factor of 1/√2. The first rule is a rotation of 45° and the second −45°. This set will iterate a point [x, y] from randomly choosing any of the two rules and use the parameters associated with the rule to scale/rotate and translate the point using a 2D-transform function.

Put into formulae:


$$f_{1}(z)={\frac {(1-i)z}{2}}
$$


$$f_{2}(z)=1+{\frac {(1+i)(z-1)}{2}}
$$

from the initial set of points $S_{0}=\{0,1\}$.


## Sample Implementation of Levy C Curve


## See also


- Dragon curve
- Pythagoras tree (fractal)
