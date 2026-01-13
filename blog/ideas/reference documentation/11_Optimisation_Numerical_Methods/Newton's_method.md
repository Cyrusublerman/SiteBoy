# Newton's method

In numerical analysis, the Newton–Raphson method, also known simply as Newton's method, named after Isaac Newton and Joseph Raphson, is a root-finding algorithm which produces successively better approximations to the roots (or zeroes) of a real-valued function. The most basic version starts with a real-valued function f, its derivative f′, and an initial guess x0 for a root of f. If f satisfies certain assumptions and the initial guess is close, then


$$x_{1}=x_{0}-{\frac {f(x_{0})}{f'(x_{0})}}
$$

is a better approximation of the root than x0. Geometrically, (x1, 0) is the x-intercept of the tangent to the graph of f at (x0, f(x0)): that is, the improved guess, x1, is the unique root of the linear approximation of f at the initial guess, x0. The process is repeated as


$$x_{n+1}=x_{n}-{\frac {f(x_{n})}{f'(x_{n})}}
$$

until a sufficiently precise value is reached. The number of correct digits roughly doubles with each step. This algorithm is first in the class of Householder's methods, and was succeeded by Halley's method. The method can also be extended to complex functions and to systems of equations.


## Description

The purpose of Newton's method is to find a root of a function. The idea is to start with an initial guess near a root, approximate the function by its tangent line near the guess, and then take the root of the linear approximation as a next guess at the function's root. This will typically be closer to the function's root than the previous guess, and the method can be iterated.

The best linear approximation to an arbitrary differentiable function $f(x)$ near the point $x=x_{n}$ is the tangent line to the curve, with equation

$f(x)\approx f(x_{n})+f'(x_{n})(x-x_{n}).$

The root of this linear function, the place where it intercepts the ⁠$x$⁠-axis, can be taken as a closer approximate root ⁠$x_{n+1}$⁠:


$$x_{n+1}=x_{n}-{\frac {f(x_{n})}{f'(x_{n})}}.
$$

The process can be started with any arbitrary initial guess ⁠$x_{0}$⁠, though it will generally require fewer iterations to converge if the guess is close to one of the function's roots. The method will usually converge if ⁠$f'(x_{0})\neq 0$⁠. Furthermore, for a root of multiplicity 1, the convergence is at least quadratic (see Rate of convergence) in some sufficiently small neighbourhood of the root: the number of correct digits of the approximation roughly doubles with each additional step. More details can be found in § Analysis below.

Householder's methods are similar but have higher order for even faster convergence. However, the extra computations required for each step can slow down the overall performance relative to Newton's method, particularly if ⁠$f$⁠ or its derivatives are computationally expensive to evaluate.


## History

In the Old Babylonian period (19th–16th century BCE), the side of a square of known area could be effectively approximated, and this is conjectured to have been done using a special case of Newton's method, described algebraically below, by iteratively improving an initial estimate; an equivalent method can be found in Hero of Alexandria's Metrica (1st–2nd century CE), so is often called Heron's method. Jamshīd al-Kāshī used a method to solve x − N = 0 to find roots of N, a method that was algebraically equivalent to Newton's method, and in which a similar method was found in Trigonometria Britannica, published by Henry Briggs in 1633. His method first appeared in his 1427 publication Miftāḥ al-Ḥisāb (The Key to Arithmetic). Al-Kāshī's work was founded on the earlier contributions of the polymath al-Bīrūnī (973–1048) and the mathematician Sharaf al-Dīn al-Ṭūsī (1135–1213). The contributions of al-Kāshī remained largely unknown to the Western scientific community for centuries, until the work of François Viète (1540–1603). In 1600, Viète rediscovered a technique similar to al-Kāshī's in the context of solving scalar polynomial equations of degree six.

The method that laid the groundwork for what is now the modern Newton's method which would be developed by Joseph Raphson and Thomas Simpson first appeared in Isaac Newton's work in De analysi per aequationes numero terminorum infinitas (written in 1669, published in 1711 by William Jones) and in De metodis fluxionum et serierum infinitarum (written in 1671, translated and published as Method of Fluxions in 1736 by John Colson). However, while Newton gave the basic ideas, his method differs from the modern method given above. He applied the method only to polynomials, starting with an initial root estimate and extracting a sequence of error corrections. He used each correction to rewrite the polynomial in terms of the remaining error, and then solved for a new correction by neglecting higher-degree terms. He did not explicitly connect the method with derivatives or present a general formula. Newton applied this method to both numerical and algebraic problems, producing Taylor series in the latter case. Despite this, in the later second and third editions of Newton's 1687 Philosophiæ Naturalis Principia Mathematica, he did apply his method in an iterative manner to a nonpolynomial equation, specifically Kepler's equation, which were the first published uses of Newton's method in this form by him.

Newton may have derived his method from a similar, less precise method by mathematician Viète, however, the two methods are not the same. The essence of Viète's own method can be found in the work of the mathematician Sharaf al-Din al-Tusi.

The Japanese mathematician Seki Kōwa used a form of Newton's method in the 1680s to solve single-variable equations, though the connection with calculus was missing.

Newton's method was first published in 1685 in A Treatise of Algebra both Historical and Practical by John Wallis. In 1690, Raphson published a simplified description in Analysis aequationum universalis. Raphson also applied the method only to polynomials, but he avoided Newton's tedious rewriting process by extracting each successive correction from the original polynomial. This allowed him to derive a reusable iterative expression for each problem. Finally, in 1740, Simpson described Newton's method as an iterative method for solving general nonlinear equations using calculus, essentially giving the description above. In the same publication, Simpson also gives the generalization to systems of two equations and notes that Newton's method can be used for solving optimization problems by setting the gradient to zero.

Arthur Cayley in 1879 in The Newton–Fourier imaginary problem was the first to notice the difficulties in generalizing Newton's method to complex roots of polynomials with degree greater than 2 and complex initial values. This opened the way to the study of the theory of iterations of rational functions.


## Practical considerations

Newton's method is a powerful technique—if the derivative of the function at the root is nonzero, then the convergence is at least quadratic: as the method converges on the root, the difference between the root and the approximation is squared (the number of accurate digits roughly doubles) at each step. However, there are some difficulties with the method.


### Difficulty in calculating the derivative of a function

Newton's method requires that the derivative can be calculated directly. An analytical expression for the derivative may not be easily obtainable or could be expensive to evaluate. In these situations, it may be appropriate to approximate the derivative by using the slope of a line through two nearby points on the function. Using this approximation would result in something like the secant method whose convergence is slower than that of Newton's method.


### Failure of the method to converge to the root

It is important to review the proof of quadratic convergence of Newton's method before implementing it. Specifically, one should review the assumptions made in the proof. For situations where the method fails to converge, it is because the assumptions made in this proof are not met.

For example, in some cases, if the first derivative is not well behaved in the neighborhood of a particular root, then it is possible that Newton's method will fail to converge no matter where the initialization is set. In some cases, Newton's method can be stabilized by using successive over-relaxation, or the speed of convergence can be increased by using the same method.

In a robust implementation of Newton's method, it is common to place limits on the number of iterations, bound the solution to an interval known to contain the root, and combine the method with a more robust root finding method.


### Slow convergence for roots of multiplicity greater than 1

If the root being sought has multiplicity greater than one, the convergence rate is merely linear (errors reduced by a constant factor at each step) unless special steps are taken. When there are two or more roots that are close together then it may take many iterations before the iterates get close enough to one of them for the quadratic convergence to be apparent. However, if the multiplicity m of the root is known, the following modified algorithm preserves the quadratic convergence rate:


$$x_{n+1}=x_{n}-m{\frac {f(x_{n})}{f'(x_{n})}}.
$$

This is equivalent to using successive over-relaxation. On the other hand, if the multiplicity m of the root is not known, it is possible to estimate m after carrying out one or two iterations, and then use that value to increase the rate of convergence.

If the multiplicity m of the root is finite then g(x) = .mw-parser-output .sfrac{white-space:nowrap}.mw-parser-output .sfrac.tion,.mw-parser-output .sfrac .tion{display:inline-block;vertical-align:-0.5em;font-size:85%;text-align:center}.mw-parser-output .sfrac .num{display:block;line-height:1em;margin:0.0em 0.1em;border-bottom:1px solid}.mw-parser-output .sfrac .den{display:block;line-height:1em;margin:0.1em 0.1em}.mw-parser-output .sr-only{border:0;clip:rect(0,0,0,0);clip-path:polygon(0px 0px,0px 0px,0px 0px);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}⁠f(x)/f′(x)⁠ will have a root at the same location with multiplicity 1. Applying Newton's method to find the root of g(x) recovers quadratic convergence in many cases although it generally involves the second derivative of f(x). In a particularly simple case, if f(x) = x then g(x) = ⁠x/m⁠ and Newton's method finds the root in a single iteration with


$$x_{n+1}=x_{n}-{\frac {g(x_{n})}{g'(x_{n})}}=x_{n}-{\frac {\;{\frac {x_{n}}{m}}\;}{\frac {1}{m}}}=0\,.
$$


### Slow convergence

The function f(x) = x has a root at 0. Since f is continuously differentiable at its root, the theory guarantees that Newton's method as initialized sufficiently close to the root will converge. However, since the derivative f ′ is zero at the root, quadratic convergence is not ensured by the theory. In this particular example, the Newton iteration is given by


$$x_{n+1}=x_{n}-{\frac {f(x_{n})}{f'(x_{n})}}={\frac {1}{2}}x_{n}.
$$

It is visible from this that Newton's method could be initialized anywhere and converge to zero, but at only a linear rate. If initialized at 1, dozens of iterations would be required before ten digits of accuracy are achieved.

The function f(x) = x + x also has a root at 0, where it is continuously differentiable. Although the first derivative f ′ is nonzero at the root, the second derivative f ′′ is nonexistent there, so that quadratic convergence cannot be guaranteed. In fact the Newton iteration is given by


$$x_{n+1}=x_{n}-{\frac {f(x_{n})}{f'(x_{n})}}={\frac {x_{n}^{4/3}}{3+4x_{n}^{1/3}}}\approx x_{n}\cdot {\frac {x_{n}^{1/3}}{3}}.
$$

From this, it can be seen that the rate of convergence is superlinear but subquadratic. This can be seen in the following tables, the left of which shows Newton's method applied to the above f(x) = x + x and the right of which shows Newton's method applied to f(x) = x + x. The quadratic convergence in iteration shown on the right is illustrated by the orders of magnitude in the distance from the iterate to the true root (0,1,2,3,5,10,20,39,...) being approximately doubled from row to row. While the convergence on the left is superlinear, the order of magnitude is only multiplied by about 4/3 from row to row (0,1,2,4,5,7,10,13,...).

The rate of convergence is distinguished from the number of iterations required to reach a given accuracy. For example, the function f(x) = x − 1 has a root at 1. Since f ′(1) ≠ 0 and f is smooth, it is known that any Newton iteration convergent to 1 will converge quadratically. However, if initialized at 0.5, the first few iterates of Newton's method are approximately 26214, 24904, 23658, 22476, decreasing slowly, with only the 200th iterate being 1.0371. The following iterates are 1.0103, 1.00093, 1.0000082, and 1.00000000065, illustrating quadratic convergence. This highlights that quadratic convergence of a Newton iteration does not mean that only few iterates are required; this only applies once the sequence of iterates is sufficiently close to the root.


### Convergence dependent on initialization

The function f(x) = x(1 + x) has a root at 0. The Newton iteration is given by


$$x_{n+1}=x_{n}-{\frac {f(x_{n})}{f'(x_{n})}}=x_{n}-{\frac {x_{n}(1+x_{n}^{2})^{-1/2}}{(1+x_{n}^{2})^{-3/2}}}=-x_{n}^{3}.
$$

From this, it can be seen that there are three possible phenomena for a Newton iteration. If initialized strictly between ±1, the Newton iteration will converge (super-)quadratically to 0; if initialized exactly at 1 or −1, the Newton iteration will oscillate endlessly between ±1; if initialized anywhere else, the Newton iteration will diverge. This same trichotomy occurs for f(x) = arctan x.

In cases where the function in question has multiple roots, it can be difficult to control, via choice of initialization, which root (if any) is identified by Newton's method. For example, the function f(x) = x(x − 1)(x − 3)e has roots at −1, 0, 1, and 3. If initialized at −1.488, the Newton iteration converges to 0; if initialized at −1.487, it diverges to ∞; if initialized at −1.486, it converges to −1; if initialized at −1.485, it diverges to −∞; if initialized at −1.4843, it converges to 3; if initialized at −1.484, it converges to 1. This kind of subtle dependence on initialization is not uncommon; it is frequently studied in the complex plane in the form of the Newton fractal.


### Divergence even when initialization is close to the root

Consider the problem of finding a root of f(x) = x. The Newton iteration is


$$x_{n+1}=x_{n}-{\frac {f(x_{n})}{f'(x_{n})}}=x_{n}-{\frac {x_{n}^{1/3}}{{\frac {1}{3}}x_{n}^{-2/3}}}=-2x_{n}.
$$

Unless Newton's method is initialized at the exact root 0, it is seen that the sequence of iterates will fail to converge. For example, even if initialized at the reasonably accurate guess of 0.001, the first several iterates are −0.002, 0.004, −0.008, 0.016, reaching 1048.58, −2097.15, ... by the 20th iterate. This failure of convergence is not contradicted by the analytic theory, since in this case f is not differentiable at its root.

In the above example, failure of convergence is reflected by the failure of f(xn) to get closer to zero as n increases, as well as by the fact that successive iterates are growing further and further apart. However, the function f(x) = xe also has a root at 0. The Newton iteration is given by


$$x_{n+1}=x_{n}-{\frac {f(x_{n})}{f'(x_{n})}}=x_{n}\left(1-{\frac {3}{1-6x_{n}^{2}}}\right).
$$

In this example, where again f is not differentiable at the root, any Newton iteration not starting exactly at the root will diverge, but with both xn + 1 − xn and f(xn) converging to zero. This is seen in the following table showing the iterates with initialization 1:

Although the convergence of xn + 1 − xn in this case is not very rapid, it can be proved from the iteration formula. This example highlights the possibility that a stopping criterion for Newton's method based only on the smallness of xn + 1 − xn and f(xn) might falsely identify a root.


### Oscillatory behavior

It is easy to find situations for which Newton's method oscillates endlessly between two distinct values. For example, for Newton's method as applied to a function f to oscillate between 0 and 1, it is only necessary that the tangent line to f at 0 intersects the x-axis at 1 and that the tangent line to f at 1 intersects the x-axis at 0. This is the case, for example, if f(x) = x − 2x + 2. For this function, it is even the case that Newton's iteration as initialized sufficiently close to 0 or 1 will asymptotically oscillate between these values. For example, Newton's method as initialized at 0.99 yields iterates 0.99, −0.06317, 1.00628, 0.03651, 1.00196, 0.01162, 1.00020, 0.00120, 1.000002, and so on. This behavior is present despite the presence of a root of f approximately equal to −1.76929.


### Undefinedness of Newton's method

In some cases, it is not even possible to perform the Newton iteration. For example, if f(x) = x − 1, then the Newton iteration is defined by


$$x_{n+1}=x_{n}-{\frac {f(x_{n})}{f'(x_{n})}}=x_{n}-{\frac {x_{n}^{2}-1}{2x_{n}}}={\frac {x_{n}^{2}+1}{2x_{n}}}.
$$

So Newton's method cannot be initialized at 0, since this would make x1 undefined. Geometrically, this is because the tangent line to f at 0 is horizontal (i.e. f ′(0) = 0), never intersecting the x-axis.

Even if the initialization is selected so that the Newton iteration can begin, the same phenomenon can block the iteration from being indefinitely continued.

If f has an incomplete domain, it is possible for Newton's method to send the iterates outside of the domain, so that it is impossible to continue the iteration. For example, the natural logarithm function f(x) = ln x has a root at 1, and is defined only for positive x. Newton's iteration in this case is given by


$$x_{n+1}=x_{n}-{\frac {f(x_{n})}{f'(x_{n})}}=x_{n}(1-\ln x_{n}).
$$

So if the iteration is initialized at e, the next iterate is 0; if the iteration is initialized at a value larger than e, then the next iterate is negative. In either case, the method cannot be continued.


## Analysis

Suppose that the function f has a zero at α, i.e., f(α) = 0, and f is differentiable in a neighborhood of α.

If f is continuously differentiable and its derivative is nonzero at α, then there exists a neighborhood of α such that for all starting values x0 in that neighborhood, the sequence (xn) will converge to α.

If f is continuously differentiable, its derivative is nonzero at α, and it has a second derivative at α, then the convergence is quadratic or faster. If the second derivative is not 0 at α then the convergence is merely quadratic. If the third derivative exists and is bounded in a neighborhood of α, then:


$$\Delta x_{i+1}={\frac {f''(\alpha )}{2f'(\alpha )}}\left(\Delta x_{i}\right)^{2}+O\left(\Delta x_{i}\right)^{3}\,,
$$

$\Delta x_{i}\triangleq x_{i}-\alpha \,.$

If the derivative is 0 at α, then the convergence is usually only linear. Specifically, if f is twice continuously differentiable, f′(α) = 0 and f″(α) ≠ 0, then there exists a neighborhood of α such that, for all starting values x0 in that neighborhood, the sequence of iterates converges linearly, with rate ⁠1/2⁠. Alternatively, if f′(α) = 0 and f′(x) ≠ 0 for x ≠ α, x in a neighborhood U of α, α being a zero of multiplicity r, and if f ∈ C(U), then there exists a neighborhood of α such that, for all starting values x0 in that neighborhood, the sequence of iterates converges linearly.

However, even linear convergence is not guaranteed in pathological situations.

In practice, these results are local, and the neighborhood of convergence is not known in advance. But there are also some results on global convergence: for instance, given a right neighborhood U+ of α, if f is twice differentiable in U+ and if f′ ≠ 0, f · f″ > 0 in U+, then, for each x0 in U+ the sequence xk is monotonically decreasing to α.


### Proof of quadratic convergence for Newton's iterative method

According to Taylor's theorem, any function f(x) which has a continuous second derivative can be represented by an expansion about a point that is close to a root of f(x). Suppose this root is α. Then the expansion of f(α) about xn is:

where the Lagrange form of the Taylor series expansion remainder is


$$R_{1}={\frac {1}{2!}}f''(\xi _{n})\left(\alpha -x_{n}\right)^{2}\,,
$$

where ξn is in between xn and α.

Since α is the root, (1) becomes:

Dividing equation (2) by f′(xn) and rearranging gives

Remembering that xn + 1 is defined by

one finds that


$$\underbrace {\alpha -x_{n+1}} _{\varepsilon _{n+1}}={\frac {-f''(\xi _{n})}{2f'(x_{n})}}{(\,\underbrace {\alpha -x_{n}} _{\varepsilon _{n}}\,)}^{2}\,.
$$

Taking the absolute value of both sides gives

Equation (6) shows that the order of convergence is at least quadratic if the following conditions are satisfied:


1. f′(x) ≠ 0; for all x ∈ I, where I is the interval [α − |ε0|, α + |ε0|];
2. f″(x) is continuous, for all x ∈ I;
3. M |ε0| < 1

where M is given by


$$M={\frac {1}{2}}\left(\sup _{x\in I}\vert f''(x)\vert \right)\left(\sup _{x\in I}{\frac {1}{\vert f'(x)\vert }}\right).\,
$$

If these conditions hold,


$$\vert \varepsilon _{n+1}\vert \leq M\cdot \varepsilon _{n}^{2}\,.
$$


### Fourier conditions

Suppose that f(x) is a concave function on an interval, which is strictly increasing. If it is negative at the left endpoint and positive at the right endpoint, the intermediate value theorem guarantees that there is a zero ζ of f somewhere in the interval. From geometrical principles, it can be seen that the Newton iteration xi starting at the left endpoint is monotonically increasing and convergent, necessarily to ζ.

Joseph Fourier introduced a modification of Newton's method starting at the right endpoint:


$$y_{i+1}=y_{i}-{\frac {f(y_{i})}{f'(x_{i})}}.
$$

This sequence is monotonically decreasing and convergent. By passing to the limit in this definition, it can be seen that the limit of yi must also be the zero ζ.

So, in the case of a concave increasing function with a zero, initialization is largely irrelevant. Newton iteration starting anywhere left of the zero will converge, as will Fourier's modified Newton iteration starting anywhere right of the zero. The accuracy at any step of the iteration can be determined directly from the difference between the location of the iteration from the left and the location of the iteration from the right. If f is twice continuously differentiable, it can be proved using Taylor's theorem that


$$\lim _{i\to \infty }{\frac {y_{i+1}-x_{i+1}}{(y_{i}-x_{i})^{2}}}=-{\frac {1}{2}}{\frac {f''(\zeta )}{f'(\zeta )}},
$$

showing that this difference in locations converges quadratically to zero.

All of the above can be extended to systems of equations in multiple variables, although in that context the relevant concepts of monotonicity and concavity are more subtle to formulate. In the case of single equations in a single variable, the above monotonic convergence of Newton's method can also be generalized to replace concavity by positivity or negativity conditions on an arbitrary higher-order derivative of f. However, in this generalization, Newton's iteration is modified so as to be based on Taylor polynomials rather than the tangent line. In the case of concavity, this modification coincides with the standard Newton method.


### Error for n>1 variables

If we seek the root of a single function $f:\mathbf {R} ^{n}\to \mathbf {R}$ then the error $\epsilon _{n}=x_{n}-\alpha$ is a vector such that its components obey
$$\epsilon _{k}^{(n+1)}={\frac {1}{2}}(\epsilon ^{(n)})^{T}Q_{k}\epsilon ^{(n)}+O(\|\epsilon ^{(n)}\|^{3})
$$where $Q_{k}$ is a quadratic form:
$$(Q_{k})_{i,j}=\sum _{\ell }((D^{2}f)^{-1})_{i,\ell }{\frac {\partial ^{3}f}{\partial x_{j}\partial x_{k}\partial x_{\ell }}}
$$evaluated at the root $\alpha$ (where $D^{2}f$ is the 2nd derivative Hessian matrix).


## Examples


### Use of Newton's method to compute square roots

Newton's method is one of many known methods of computing square roots. Given a positive number a, the problem of finding a number x such that x = a is equivalent to finding a root of the function f(x) = x − a. The Newton iteration defined by this function is given by


$$x_{n+1}=x_{n}-{\frac {f(x_{n})}{f'(x_{n})}}=x_{n}-{\frac {x_{n}^{2}-a}{2x_{n}}}={\frac {1}{2}}\left(x_{n}+{\frac {a}{x_{n}}}\right)
$$.

This happens to coincide with the "Babylonian" method of finding square roots, which consists of replacing an approximate root xn by the arithmetic mean of xn and .mw-parser-output .frac{white-space:nowrap}.mw-parser-output .frac .num,.mw-parser-output .frac .den{font-size:80%;line-height:0;vertical-align:super}.mw-parser-output .frac .den{vertical-align:sub}.mw-parser-output .sr-only{border:0;clip:rect(0,0,0,0);clip-path:polygon(0px 0px,0px 0px,0px 0px);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}a⁄xn. By performing this iteration, it is possible to evaluate a square root to any desired accuracy by only using the basic arithmetic operations.

The following three tables show examples of the result of this computation for finding the square root of 612, with the iteration initialized at the values of 1, 10, and −20. Each row in a "xn" column is obtained by applying the preceding formula to the entry above it, for instance


$$306.5={\frac {1}{2}}\left(1+{\frac {612}{1}}\right).
$$

The correct digits are underlined. It is seen that with only a few iterations one can obtain a solution accurate to many decimal places. The first table shows that this is true even if the Newton iteration were initialized by the very inaccurate guess of 1.

When computing any nonzero square root, the first derivative of f must be nonzero at the root, and that f is a smooth function. So, even before any computation, it is known that any convergent Newton iteration has a quadratic rate of convergence. This is reflected in the above tables by the fact that once a Newton iterate gets close to the root, the number of correct digits approximately doubles with each iteration.


### Solution of cos(x) = x3 using Newton's method

Consider the problem of finding the positive number x with cos (x) = x. We can rephrase that as finding the zero of f(x) = cos(x) − x. We have f′(x) = −sin(x) − 3x. Since cos(x) ≤ 1 for all x and x > 1 for x > 1, we know that our solution lies between 0 and 1.

A starting value of 0 will lead to an undefined result which illustrates the importance of using a starting point close to the solution. For example, with an initial guess x0 = 0.5, the sequence given by Newton's method is:


$${\begin{matrix}x_{1}&=&x_{0}-{\dfrac {f(x_{0})}{f'(x_{0})}}&=&0.5-{\dfrac {\cos 0.5-0.5^{3}}{-\sin 0.5-3\times 0.5^{2}}}&=&1.112\,141\,637\,097\dots \\x_{2}&=&x_{1}-{\dfrac {f(x_{1})}{f'(x_{1})}}&=&\vdots &=&{\underline {0.}}909\,672\,693\,736\dots \\x_{3}&=&\vdots &=&\vdots &=&{\underline {0.86}}7\,263\,818\,209\dots \\x_{4}&=&\vdots &=&\vdots &=&{\underline {0.865\,47}}7\,135\,298\dots \\x_{5}&=&\vdots &=&\vdots &=&{\underline {0.865\,474\,033\,1}}11\dots \\x_{6}&=&\vdots &=&\vdots &=&{\underline {0.865\,474\,033\,102}}\dots \end{matrix}}
$$

The correct digits are underlined in the above example. In particular, x6 is correct to 12 decimal places. We see that the number of correct digits after the decimal point increases from 2 (for x3) to 5 and 10, illustrating the quadratic convergence.


## Multidimensional formulations


### Systems of equations


#### k variables, k functions

One may also use Newton's method to solve systems of k equations, which amounts to finding the (simultaneous) zeroes of k continuously differentiable functions $f:\mathbb {R} ^{k}\to \mathbb {R} .$ This is equivalent to finding the zeroes of a single vector-valued function $F:\mathbb {R} ^{k}\to \mathbb {R} ^{k}.$ In the formulation given above, the scalars xn are replaced by vectors xn and instead of dividing the function f(xn) by its derivative f′(xn) one instead has to left multiply the function F(xn) by the inverse of its k × k Jacobian matrix JF(xn). This results in the expression


$$\mathbf {x} _{n+1}=\mathbf {x} _{n}-J_{F}(\mathbf {x} _{n})^{-1}F(\mathbf {x} _{n}).
$$

or, by solving the system of linear equations


$$J_{F}(\mathbf {x} _{n})(\mathbf {x} _{n+1}-\mathbf {x} _{n})=-F(\mathbf {x} _{n})
$$

for the unknown xn + 1 − xn.


#### k variables, m equations, with m > k

The k-dimensional variant of Newton's method can be used to solve systems of greater than k (nonlinear) equations as well if the algorithm uses the generalized inverse of the non-square Jacobian matrix J = (JJ)J instead of the inverse of J. If the nonlinear system has no solution, the method attempts to find a solution in the non-linear least squares sense. See Gauss–Newton algorithm for more information.


#### Example

A milk carton with a capacity of 2 pints is to be constructed from a sheet of waxed carboard with a 5mm overlap. The requirement is that the minimum surface area is used for the carton.

Suppose the width, breadth and height of the carton are denoted by $w$, $b$ and $h$ respectively, in millimetres. The total surface area, $A$, is given by

$A=(2b+2w+5)(h+b+10).$

Since 2 pints is approximately 1.136 litres, and 1 litre is $1000000mm^{3}$, it also follows that

$hbw=1136000.$

Solving for $w$ gives


$$w={\frac {1136000}{hb}}.
$$

Letting
$$\mathbf {x} =\left[b,h\right]\in {\mathbb {R} }^{2}
$$be the vector of two unknowns, $b$ and $h$, the surface area can then be expressed as


$$A(\mathbf {x} )=(h+b+10)\left({\frac {2272000}{hb}}+2b+5\right).
$$

Minimization of this function entails equating its partial derivatives to zero, which gives


$${\frac {\partial A}{\partial b}}={\frac {2272000}{hb}}+2b+5+(h+b+10)\left({\frac {-2272000}{hb^{2}}}+2\right)=0
$$


$${\frac {\partial A}{\partial h}}={\frac {2272000}{hb}}+2b+5-(h+b+10)\left({\frac {2272000}{h^{2}b}}\right)=0.
$$

To simplify notation, let


$$f_{1}(\mathbf {x} )={\frac {\partial A}{\partial b}}
$$


$$f_{2}(\mathbf {x} )={\frac {\partial A}{\partial h}}.
$$

The function vector $\mathbf {F} (\mathbf {x} )$ is therefore


$$\mathbf {F} (\mathbf {x} )={\begin{bmatrix}{\begin{aligned}~&f_{1}(\mathbf {x} )\\~&f_{2}(\mathbf {x} )\end{aligned}}\end{bmatrix}}~=~{\begin{bmatrix}{\begin{aligned}~&{\frac {2272000}{hb}}+2b+5+(h+b+10)\left({\frac {-2272000}{hb^{2}}}+2\right)\\~&{\frac {2272000}{hb}}+2b+5-(h+b+10)\left({\frac {2272000}{h^{2}b}}\right)\end{aligned}}\end{bmatrix}}
$$

and Jacobian matrix $\mathbf {J} (\mathbf {x} )$ is


$${\begin{aligned}\mathbf {J} (\mathbf {x} )={\begin{bmatrix}~{\frac {\ \partial {f_{1}}\ }{\partial {b}}}\ &~{\frac {\ \partial {f_{1}}\ }{\partial {h}}}~\\~{\frac {\ \partial {f_{2}}\ }{\partial {b}}}\ &~{\frac {\ \partial {f_{2}}\ }{\partial {h}}}~\end{bmatrix}}~=~{\begin{bmatrix}{\begin{aligned}~&{\frac {4544000}{b^{3}}}+{\frac {45440000}{hb^{3}}}+4\ &&{\frac {22720000}{h^{2}b^{2}}}+2\\~&{\frac {22720000}{h^{2}b^{2}}}+2\ &&{\frac {4544000}{h^{3}}}+{\frac {45440000}{bh^{3}}}\end{aligned}}\end{bmatrix}}.\end{aligned}}
$$

Applying Newton's method with initial guess $\mathbf {x} _{0}=\left[100,100\right]$ and with a stopping criterion of
$$\|\ \mathbf {x} _{i}-\mathbf {x} _{i-1}\|_{2}<10^{-6}
$$gives the following iterations:

To show that
$$\mathbf {x} _{8}=\left[65.67176536,138.5684895\right]
$$minimises $A(\mathbf {x} )$, it suffices to show that its Hessian matrix is positive definite. In this case, the Hessian matrix is simply


$$\mathbf {J} (\mathbf {x} _{8})\approx {\begin{bmatrix}~20.15939696&~2.27436075~\\~2.27436075&~1.9678865~\end{bmatrix}}.
$$

The characteristic polynomial of this matrix is

$\lambda ^{2}-22.12728346\lambda +34.49868830=0$.

Applying the quadratic formula gives the two eigenvalues as


$$\lambda _{1}={\frac {22.12728346+{\sqrt {351.62192}}}{2}}\approx 20.43943
$$


$$\lambda _{2}={\frac {22.12728346-{\sqrt {351.62192}}}{2}}\approx 1.68784.
$$

Since all eigenvalues are positive, $\mathbf {J} (\mathbf {x} _{8})$ is positive definite, and therefore $\mathbf {x} _{8}$ is a minimum.


### Complex functions

When dealing with complex functions, Newton's method can be directly applied to find their zeroes. Each zero has a basin of attraction in the complex plane, the set of all starting values that cause the method to converge to that particular zero. These sets can be mapped as in the image shown. For many complex functions, the boundaries of the basins of attraction are fractals.

In some cases there are regions in the complex plane which are not in any of these basins of attraction, meaning the iterates do not converge. For example, if one uses a real initial condition to seek a root of x + 1, all subsequent iterates will be real numbers and so the iterations cannot converge to either root, since both roots are non-real. In this case almost all real initial conditions lead to chaotic behavior, while some initial conditions iterate either to infinity or to repeating cycles of any finite length.

Curt McMullen has shown that for any possible purely iterative algorithm similar to Newton's method, the algorithm will diverge on some open regions of the complex plane when applied to some polynomial of degree 4 or higher. However, McMullen gave a generally convergent algorithm for polynomials of degree 3. Also, for any polynomial, Hubbard, Schleicher, and Sutherland gave a method for selecting a set of initial points such that Newton's method will certainly converge at one of them at least.


### In a Banach space

Another generalization is Newton's method to find a root of a functional F defined in a Banach space. In this case the formulation is


$$X_{n+1}=X_{n}-{\bigl (}F'(X_{n}){\bigr )}^{-1}F(X_{n}),\,
$$

where F′(Xn) is the Fréchet derivative computed at Xn. One needs the Fréchet derivative to be boundedly invertible at each Xn in order for the method to be applicable. A condition for existence of and convergence to a root is given by the Newton–Kantorovich theorem.


#### Nash–Moser iteration

In the 1950s, John Nash developed a version of the Newton's method to apply to the problem of constructing isometric embeddings of general Riemannian manifolds in Euclidean space. The loss of derivatives problem, present in this context, made the standard Newton iteration inapplicable, since it could not be continued indefinitely (much less converge). Nash's solution involved the introduction of smoothing operators into the iteration. He was able to prove the convergence of his smoothed Newton method, for the purpose of proving an implicit function theorem for isometric embeddings. In the 1960s, Jürgen Moser showed that Nash's methods were flexible enough to apply to problems beyond isometric embedding, particularly in celestial mechanics. Since then, a number of mathematicians, including Mikhael Gromov and Richard Hamilton, have found generalized abstract versions of the Nash–Moser theory. In Hamilton's formulation, the Nash–Moser theorem forms a generalization of the Banach space Newton method which takes place in certain Fréchet spaces.


## Modifications


### Quasi-Newton methods

When the Jacobian is unavailable or too expensive to compute at every iteration, a quasi-Newton method can be used.


### Chebyshev's third-order method

Since higher-order Taylor expansions offer more accurate local approximations of a function f, it is reasonable to ask why Newton’s method relies only on a second-order Taylor approximation. In the 19th century, Russian mathematician Pafnuty Chebyshev explored this idea by developing a variant of Newton’s method that used cubic approximations.


### Over p-adic numbers

In p-adic analysis, the standard method to show a polynomial equation in one variable has a p-adic root is Hensel's lemma, which uses the recursion from Newton's method on the p-adic numbers. Because of the more stable behavior of addition and multiplication in the p-adic numbers compared to the real numbers (specifically, the unit ball in the p-adics is a ring), convergence in Hensel's lemma can be guaranteed under much simpler hypotheses than in the classical Newton's method on the real line.


### q-analog

Newton's method can be generalized with the q-analog of the usual derivative.


### Modified Newton methods


#### Maehly's procedure

A nonlinear equation has multiple solutions in general. But if the initial value is not appropriate, Newton's method may not converge to the desired solution or may converge to the same solution found earlier. When we have already found N solutions of $f(x)=0$, then the next root can be found by applying Newton's method to the next equation:


$$F(x)={\frac {f(x)}{\prod _{i=1}^{N}(x-x_{i})}}=0.
$$

This method is applied to obtain zeros of the Bessel function of the second kind.


#### Hirano's modified Newton method

Hirano's modified Newton method is a modification conserving the convergence of Newton method and avoiding unstableness. It is developed to solve complex polynomials.


#### Interval Newton's method

Combining Newton's method with interval arithmetic is very useful in some contexts. This provides a stopping criterion that is more reliable than the usual ones (which are a small value of the function or a small variation of the variable between consecutive iterations). Also, this may detect cases where Newton's method converges theoretically but diverges numerically because of an insufficient floating-point precision (this is typically the case for polynomials of large degree, where a very small change of the variable may change dramatically the value of the function; see Wilkinson's polynomial).

Consider f → C(X), where X is a real interval, and suppose that we have an interval extension F′ of f′, meaning that F′ takes as input an interval Y ⊆ X and outputs an interval F′(Y) such that:


$${\begin{aligned}F'([y,y])&=\{f'(y)\}\\[5pt]F'(Y)&\supseteq \{f'(y)\mid y\in Y\}.\end{aligned}}
$$

We also assume that 0 ∉ F′(X), so in particular f has at most one root in X. We then define the interval Newton operator by:


$$N(Y)=m-{\frac {f(m)}{F'(Y)}}=\left\{\left.m-{\frac {f(m)}{z}}~\right|~z\in F'(Y)\right\}
$$

where m ∈ Y. Note that the hypothesis on F′ implies that N(Y) is well defined and is an interval (see interval arithmetic for further details on interval operations). This naturally leads to the following sequence:


$${\begin{aligned}X_{0}&=X\\X_{k+1}&=N(X_{k})\cap X_{k}.\end{aligned}}
$$

The mean value theorem ensures that if there is a root of f in Xk, then it is also in Xk + 1. Moreover, the hypothesis on F′ ensures that Xk + 1 is at most half the size of Xk when m is the midpoint of Y, so this sequence converges towards [x*, x*], where x* is the root of f in X.

If F′(X) strictly contains 0, the use of extended interval division produces a union of two intervals for N(X); multiple roots are therefore automatically separated and bounded.


## Applications


### Minimization and maximization problems

Newton's method can be used to find a minimum or maximum of a function f(x). The derivative is zero at a minimum or maximum, so local minima and maxima can be found by applying Newton's method to the derivative. The iteration becomes:


$$x_{n+1}=x_{n}-{\frac {f'(x_{n})}{f''(x_{n})}}.
$$


### Multiplicative inverses of numbers and power series

An important application is Newton–Raphson division, which can be used to quickly find the reciprocal of a number a, using only multiplication and subtraction, that is to say the number x such that ⁠1/x⁠ = a. We can rephrase that as finding the zero of f(x) = ⁠1/x⁠ − a. We have f′(x) = −⁠1/x⁠.

Newton's iteration is


$$x_{n+1}=x_{n}-{\frac {f(x_{n})}{f'(x_{n})}}=x_{n}+{\frac {{\frac {1}{x_{n}}}-a}{\frac {1}{x_{n}^{2}}}}=x_{n}(2-ax_{n}).
$$

Therefore, Newton's iteration needs only two multiplications and one subtraction.

This method is also very efficient to compute the multiplicative inverse of a power series.


### Solving transcendental equations

Many transcendental equations can be solved up to an arbitrary precision by using Newton's method. For example, finding the cumulative probability density function, such as a Normal distribution to fit a known probability generally involves integral functions with no known means to solve in closed form. However, computing the derivatives needed to solve them numerically with Newton's method is generally known, making numerical solutions possible. For an example, see the numerical solution to the inverse Normal cumulative distribution.


### Numerical verification for solutions of nonlinear equations

A numerical verification for solutions of nonlinear equations has been established by using Newton's method multiple times and forming a set of solution candidates.


## Code

The following is an example of a possible implementation of Newton's method in the Python (version 3.x) programming language for finding a root of a function f which has derivative f_prime.

The initial guess will be x0 = 1 and the function will be f(x) = x − 2 so that f′(x) = 2x.

Each new iteration of Newton's method will be denoted by x1. We will check during the computation whether the denominator (y_prime) becomes too small (smaller than epsilon), which would be the case if f′(xn) ≈ 0, since otherwise a large amount of error could be introduced.


## See also


## Further reading


- Kendall E. Atkinson: An Introduction to Numerical Analysis, John Wiley & Sons Inc., ISBN 0-471-62489-6 (1989).
- Tjalling J. Ypma: "Historical development of the Newton–Raphson method", SIAM Review, vol.37, no.4, (1995), pp. 531–551. doi:10.1137/1037125.
- Bonnans, J. Frédéric; Gilbert, J. Charles; Lemaréchal, Claude; Sagastizábal, Claudia A. (2006). Numerical optimization: Theoretical and practical aspects. Universitext (Second revised ed. of translation of 1997 French ed.). Berlin: Springer-Verlag. pp. xiv+490. doi:10.1007/978-3-540-35447-5. ISBN 3-540-35445-X. MR 2265882.
- P. Deuflhard: Newton Methods for Nonlinear Problems: Affine Invariance and Adaptive Algorithms, Springer Berlin (Series in Computational Mathematics, Vol. 35) (2004). ISBN 3-540-21099-7.
- C. T. Kelley: Solving Nonlinear Equations with Newton's Method, SIAM (Fundamentals of Algorithms, 1) (2003). ISBN 0-89871-546-6.
- J. M. Ortega, and W. C. Rheinboldt: Iterative Solution of Nonlinear Equations in Several Variables, SIAM (Classics in Applied Mathematics) (2000). ISBN 0-89871-461-3.
- Press, W. H.; Teukolsky, S. A.; Vetterling, W. T.; Flannery, B. P. (2007). "Chapter 9. Root Finding and Nonlinear Sets of Equations Importance Sampling". Numerical Recipes: The Art of Scientific Computing (3rd ed.). New York: Cambridge Univ. Press. ISBN 978-0-521-88068-8.. See especially Sections 9.4, 9.6, and 9.7.
- Avriel, Mordecai (1976). Nonlinear Programming: Analysis and Methods. Prentice Hall. pp. 216–221. ISBN 0-13-623603-0.


## External links


- "Newton method", Encyclopedia of Mathematics, EMS Press, 2001 [1994]
- Weisstein, Eric W. "Newton's Method". MathWorld.
- Newton's method, Citizendium.
- Mathews, J., The Accelerated and Modified Newton Methods, Course notes.
- Wu, X., Roots of Equations, Course notes.
