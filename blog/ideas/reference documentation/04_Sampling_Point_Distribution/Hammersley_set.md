# Hammersley set

In mathematics, a low-discrepancy sequence is a sequence with the property that for all values of $N$, its subsequence $x_{1},\ldots ,x_{N}$ has a low discrepancy.

Roughly speaking, the discrepancy of a sequence is low if the proportion of points in the sequence falling into an arbitrary set B is close to proportional to the measure of B, as would happen on average (but not for particular samples) in the case of an equidistributed sequence. Specific definitions of discrepancy differ regarding the choice of B (hyperspheres, hypercubes, etc.) and how the discrepancy for every B is computed (usually normalized) and combined (usually by taking the worst value).

Low-discrepancy sequences are also called quasirandom sequences, due to their common use as a replacement of uniformly distributed random numbers. The "quasi" modifier is used to denote more clearly that the values of a low-discrepancy sequence are neither random nor pseudorandom, but such sequences share some properties of random variables and in certain applications such as the quasi-Monte Carlo method their lower discrepancy is an important advantage.


## Applications

Quasirandom numbers have an advantage over pure random numbers in that they cover the domain of interest quickly and evenly.

Two useful applications are in finding the characteristic function of a probability density function, and in finding the derivative function of a deterministic function with a small amount of noise. Quasirandom numbers allow higher-order moments to be calculated to high accuracy very quickly.

Applications that don't involve sorting would be in finding the mean, standard deviation, skewness and kurtosis of a statistical distribution, and in finding the integral and global maxima and minima of difficult deterministic functions. Quasirandom numbers can also be used for providing starting points for deterministic algorithms that only work locally, such as Newton–Raphson iteration.

Quasirandom numbers can also be combined with search algorithms. With a search algorithm, quasirandom numbers can be used to find the mode, median, confidence intervals and cumulative distribution of a statistical distribution, and all local minima and all solutions of deterministic functions.


### Low-discrepancy sequences in numerical integration

Various methods of numerical integration can be phrased as approximating the integral of a function $f$ in some interval, e.g. [0,1], as the average of the function evaluated at a set $\{x_{1},\dots ,x_{N}}\$ in that interval:
$$\int _{0}^{1}f(u)\,du\approx {\frac {1}{N}}\,\sum _{i=1}^{N}f(x_{i}).
$$

If the points are chosen as $x_{i}=i/N$, this is the rectangle rule. If the points are chosen to be randomly (or pseudorandomly) distributed, this is the Monte Carlo method. If the points are chosen as elements of a low-discrepancy sequence, this is the quasi-Monte Carlo method. A remarkable result, the Koksma–Hlawka inequality (stated below), shows that the error of such a method can be bounded by the product of two terms, one of which depends only on $f$, and the other one is the discrepancy of the set $\{x_{1},\dots ,x_{N}}\$.

It is convenient to construct the set $\{x_{1},\dots ,x_{N}}\$ in such a way that if a set with $N+1$ elements is constructed, the previous $N$ elements need not be recomputed. The rectangle rule uses points set which have low discrepancy, but in general the elements must be recomputed if $N$ is increased. Elements need not be recomputed in the random Monte Carlo method if $N$ is increased, but the point sets do not have minimal discrepancy. By using low-discrepancy sequences we aim for low discrepancy and no need for recomputations, but actually low-discrepancy sequences can only be incrementally good on discrepancy if we allow no recomputation.


## Definition of discrepancy

The discrepancy of a set $P=\{x_{1},\dots ,x_{N}}\$ is defined, using Niederreiter's notation, as
$$D_{N}(P)=\sup _{B\in J}\left|{\frac {A(B;P)}{N}}-\lambda _{s}(B)\right|
$$

where $\lambda _{s}$ is the $s$-dimensional Lebesgue measure, $A(B;P)$ is the number of points in $P$ that fall into $B$, and $J$ is the set of $s$-dimensional intervals or boxes of the form


$$\prod _{i=1}^{s}[a_{i},b_{i})=\{\mathbf {x} \in \mathbf {R} ^{s}:a_{i}\leq x_{i}<b_{i}\}\,
$$

where $0\leq a_{i}<b_{i}\leq 1$.

The star-discrepancy $D_{N}^{*}(P)$ is defined similarly, except that the supremum is taken over the set $J^{*}$ of rectangular boxes of the form

$\prod _{i=1}^{s}[0,u_{i})$

where $u_{i}$ is in the half-open interval [0, 1).

The two are related by

$D_{N}^{*}\leq D_{N}\leq 2^{s}D_{N}^{*}.\,$

Note: With these definitions, discrepancy represents the worst-case or maximum point density deviation of a uniform set. However, also other error measures are meaningful, leading to other definitions and variation measures. For instance, $L^{2}$-discrepancy or modified centered $L^{2}$-discrepancy are also used intensively to compare the quality of uniform point sets. Both are much easier to calculate for large $N$ and $s$.


## The Koksma–Hlawka inequality

Let ${\overline {I}}^{s}$ be the $s$-dimensional unit cube,
$${\overline {I}}^{s}=[0,1]\times \cdots \times [0,1]
$$. Let $f$ have bounded variation $V(f)$ on ${\overline {I}}^{s}$ in the sense of Hardy and Krause. Then for any $x_{1},\ldots ,x_{N}$ in $I^{s}=[0,1)^{s}=[0,1)\times \cdots \times [0,1)$,


$$\left|{\frac {1}{N}}\sum _{i=1}^{N}f(x_{i})-\int _{{\bar {I}}^{s}}f(u)\,du\right|\leq V(f)\,D_{N}^{*}(x_{1},\ldots ,x_{N}).
$$The Koksma–Hlawka inequality is sharp in the following sense: For any point set $\{x_{1},\ldots ,x_{N}\}$ in $I^{s}$ and any $\varepsilon >0$, there is a function $f$ with bounded variation and $V(f)=1$ such that


$$\left|{\frac {1}{N}}\sum _{i=1}^{N}f(x_{i})-\int _{{\bar {I}}^{s}}f(u)\,du\right|>D_{N}^{*}(x_{1},\ldots ,x_{N})-\varepsilon .
$$

Therefore, the quality of a numerical integration rule depends only on the discrepancy $D_{N}^{*}(x_{1},\ldots ,x_{N})$.


## The formula of Hlawka–Zaremba

Let $D=\{1,2,\ldots ,d\}$. For $\emptyset \neq u\subseteq D$ we write $dx_{u}:=\prod _{j\in u}dx_{j}$ and denote by $(x_{u},1)$ the point obtained from x by replacing the coordinates not in u by $1$. Then


$${\frac {1}{N}}\sum _{i=1}^{N}f(x_{i})-\int _{{\bar {I}}^{s}}f(u)\,du=\sum _{\emptyset \neq u\subseteq D}(-1)^{|u|}\int _{[0,1]^{|u|}}\operatorname {disc} (x_{u},1){\frac {\partial ^{|u|}}{\partial x_{u}}}f(x_{u},1)\,dx_{u},
$$

where
$$\operatorname {disc} (z)={\frac {1}{N}}\sum _{i=1}^{N}\prod _{j=1}^{d}1_{[0,z_{j})}(x_{i,j})-\prod _{j=1}^{d}z_{i}
$$is the discrepancy function.


## The L2 version of the Koksma–Hlawka inequality

Applying the Cauchy–Schwarz inequality for integrals and sums to the Hlawka–Zaremba identity, we obtain an $L^{2}$ version of the Koksma–Hlawka inequality:


$$\left|{\frac {1}{N}}\sum _{i=1}^{N}f(x_{i})-\int _{{\bar {I}}^{s}}f(u)\,du\right|\leq \|f\|_{d}\operatorname {disc} _{d}(\{t_{i}\}),
$$


$$\operatorname {disc} _{d}(\{t_{i}\})=\left(\sum _{\emptyset \neq u\subseteq D}\int _{[0,1]^{|u|}}\operatorname {disc} (x_{u},1)^{2}\,dx_{u}\right)^{1/2}
$$


$$\|f\|_{d}=\left(\sum _{u\subseteq D}\int _{[0,1]^{|u|}}\left|{\frac {\partial ^{|u|}}{\partial x_{u}}}f(x_{u},1)\right|^{2}dx_{u}\right)^{1/2}.
$$

$L^{2}$ discrepancy has a high practical importance because fast explicit calculations are possible for a given point set. This way it is easy to create point set optimizers using $L^{2}$ discrepancy as criteria.


## The Erdős–Turán–Koksma inequality

It is computationally hard to find the exact value of the discrepancy of large point sets. The Erdős–Turán–Koksma inequality provides an upper bound.

Let $x_{1},\ldots ,x_{N}$ be points in $I^{s}$ and $H$ be an arbitrary positive integer. Then


$$D_{N}^{*}(x_{1},\ldots ,x_{N})\leq \left({\frac {3}{2}}\right)^{s}\left({\frac {2}{H+1}}+\sum _{0<\|h\|_{\infty }\leq H}{\frac {1}{r(h)}}\left|{\frac {1}{N}}\sum _{n=1}^{N}e^{2\pi i\langle h,x_{n}\rangle }\right|\right)
$$


$$r(h)=\prod _{i=1}^{s}\max\{1,|h_{i}|\}\quad {\text{for}}\quad h=(h_{1},\ldots ,h_{s})\in \mathbb {Z} ^{s}.
$$


## The main conjectures

Conjecture 1. There is a constant $c_{s}$ depending only on the dimension $s$, such that
$$D_{N}^{*}(x_{1},\ldots ,x_{N})\geq c_{s}{\frac {(\ln N)^{s-1}}{N}}
$$for any finite point set ${x_{1},\ldots ,x_{N}}$.

Conjecture 2. There is a constant $c'_{s}$ depending only on :$s$, such that:
$$D_{N}^{*}(x_{1},\ldots ,x_{N})\geq c'_{s}{\frac {(\ln N)^{s}}{N}}
$$

for infinite number of $N$ for any infinite sequence $x_{1},x_{2},x_{3},\ldots$.

These conjectures are equivalent. They have been proved for $s\leq 2$ by W. M. Schmidt. In higher dimensions, the corresponding problem is still open. The best-known lower bounds are due to Michael Lacey and collaborators.


## Lower bounds

Let $s=1$. Then


$$D_{N}^{*}(x_{1},\ldots ,x_{N})\geq {\frac {1}{2N}}
$$

for any finite point set $\{x_{1},\dots ,x_{N}}\$.

Let $s=2$. W. M. Schmidt proved that for any finite point set $\{x_{1},\dots ,x_{N}}\$,


$$D_{N}^{*}(x_{1},\ldots ,x_{N})\geq C{\frac {\log N}{N}}
$$


$$C=\max _{a\geq 3}{\frac {1}{16}}{\frac {a-2}{a\log a}}=0.023335\dots .
$$

For arbitrary dimensions $s>1$, K. F. Roth proved that


$$D_{N}^{*}(x_{1},\ldots ,x_{N})\geq {\frac {1}{2^{4s}}}{\frac {1}{((s-1)\log 2)^{\frac {s-1}{2}}}}{\frac {\log ^{\frac {s-1}{2}}N}{N}}
$$

for any finite point set $\{x_{1},\dots ,x_{N}}\$. Jozef Beck established a double log improvement of this result in three dimensions. This was improved by D. Bilyk and M. T. Lacey to a power of a single logarithm. The best known bound for s > 2 is due D. Bilyk and M. T. Lacey and A. Vagharshakyan. There exists a $t>0$ depending on s so that
$$D_{N}^{*}(x_{1},\ldots ,x_{N})\geq t{\frac {\log ^{{\frac {s-1}{2}}+t}N}{N}}
$$

for any finite point set $\{x_{1},\dots ,x_{N}}\$.


## Construction of low-discrepancy sequences

Because any distribution of random numbers can be mapped onto a uniform distribution, and quasirandom numbers are mapped in the same way, this article only concerns generation of quasirandom numbers on a multidimensional uniform distribution.

There are constructions of sequences known such that
$$D_{N}^{*}(x_{1},\ldots ,x_{N})\leq C{\frac {(\ln N)^{s}}{N}}.
$$where $C$ is a certain constant, depending on the sequence. After Conjecture 2, these sequences are believed to have the best possible order of convergence. Examples below are the van der Corput sequence, the Halton sequences, and the Sobol’ sequences. One general limitation is that construction methods can usually only guarantee the order of convergence. Practically, low discrepancy can be only achieved if $N$ is large enough, and for large given s this minimum $N$ can be very large. This means running a Monte-Carlo analysis with e.g. $s=20$ variables and $N=1000$ points from a low-discrepancy sequence generator may offer only a very minor accuracy improvement .


### Random numbers

Sequences of quasirandom numbers can be generated from random numbers by imposing a negative correlation on those random numbers. One way to do this is to start with a set of random numbers $r_{i}$ on $[0,0.5)$ and construct quasirandom numbers $s_{i}$ which are uniform on $[0,1)$ using:

$s_{i}=r_{i}$ for $i$ odd and $s_{i}=0.5+r_{i}$ for $i$ even.

A second way to do it with the starting random numbers is to construct a random walk with offset 0.5 as in:

$s_{i}=s_{i-1}+0.5+r_{i}{\pmod {1}}.\,$

That is, take the previous quasirandom number, add 0.5 and the random number, and take the result modulo 1.

For more than one dimension, Latin squares of the appropriate dimension can be used to provide offsets to ensure that the whole domain is covered evenly.


### Additive recurrence

For any irrational $\alpha$, the sequence

$s_{n}=\{s_{0}+n\alpha \}$

has discrepancy tending to $1/N$. Note that the sequence can be defined recursively by $s_{n+1}=(s_{n}+\alpha ){\bmod {1}}\;.$

A good value of $\alpha$ gives lower discrepancy than a sequence of independent uniform random numbers.

The discrepancy can be bounded by the approximation exponent of $\alpha$. If the approximation exponent is $\mu$, then for any $\varepsilon >0$, the following bound holds:


$$D_{N}((s_{n}))=O_{\varepsilon }(N^{-1/(\mu -1)+\varepsilon }).
$$

By the Thue–Siegel–Roth theorem, the approximation exponent of any irrational algebraic number is 2, giving a bound of $N^{-1+\varepsilon }$ above.

The recurrence relation above is similar to the recurrence relation used by a linear congruential generator, a poor-quality pseudorandom number generator:

$r_{i}=(ar_{i-1}+c){\bmod {m}}$

For the low discrepancy additive recurrence above, a and m are chosen to be 1. Note, however, that this will not generate independent random numbers, so should not be used for purposes requiring independence.

The value of $c$ with lowest discrepancy is the fractional part of the golden ratio:


$$c={\frac {{\sqrt {5}}-1}{2}}=\varphi -1\approx 0.618034.
$$

Another value that is nearly as good is the fractional part of the silver ratio, which is the fractional part of the square root of 2:

$c={\sqrt {2}}-1\approx 0.414214.\,$

In more than one dimension, separate quasirandom numbers are needed for each dimension. A convenient set of values that are used, is the square roots of primes from two up, all taken modulo 1:


$$c={\sqrt {2}},{\sqrt {3}},{\sqrt {5}},{\sqrt {7}},{\sqrt {11}},\ldots \,
$$

However, a set of values based on the generalised golden ratio has been shown to produce more evenly distributed points.

The list of pseudorandom number generators lists methods for generating independent pseudorandom numbers. Note: In few dimensions, recursive recurrence leads to uniform sets of good quality, but for larger $s$ (like $s>8$) other point set generators can offer much lower discrepancies.


### van der Corput sequence


$$n=\sum _{k=0}^{L-1}d_{k}(n)b^{k}
$$

be the $b$-ary representation of the positive integer $n\geq 1$, i.e. $0\leq d_{k}(n)<b$. Set


$$g_{b}(n)=\sum _{k=0}^{L-1}d_{k}(n)b^{-k-1}.
$$

Then there is a constant $C$ depending only on $b$ such that $(g_{b}(n))_{n\geq 1}$ satisfies


$$D_{N}^{*}(g_{b}(1),\dots ,g_{b}(N))\leq C{\frac {\log N}{N}},
$$

where $D_{N}^{*}$ is the star discrepancy.


### Halton sequence

The Halton sequence is a natural generalization of the van der Corput sequence to higher dimensions. Let s be an arbitrary dimension and b1, ..., bs be arbitrary coprime integers greater than 1. Define

$x(n)=(g_{b_{1}}(n),\dots ,g_{b_{s}}(n)).$

Then there is a constant C depending only on b1, ..., bs, such that sequence {x(n)}n≥1 is a s-dimensional sequence with


$$D_{N}^{*}(x(1),\dots ,x(N))\leq C'{\frac {(\log N)^{s}}{N}}.
$$


### Hammersley set

Let $b_{1},\ldots ,b_{s-1}$ be coprime positive integers greater than 1. For given $s$ and $N$, the $s$-dimensional Hammersley set of size $N$ is defined by


$$x(n)=\left(g_{b_{1}}(n),\dots ,g_{b_{s-1}}(n),{\frac {n}{N}}\right)
$$

for $n=1,\ldots ,N$. Then


$$D_{N}^{*}(x(1),\dots ,x(N))\leq C{\frac {(\log N)^{s-1}}{N}}
$$

where $C$ is a constant depending only on $b_{1},\ldots ,b_{s-1}$.

Note: The formulas show that the Hammersley set is actually the Halton sequence, but we get one more dimension for free by adding a linear sweep. This is only possible if $N$ is known upfront. A linear set is also the set with lowest possible one-dimensional discrepancy in general. Unfortunately, for higher dimensions, no such "discrepancy record sets" are known. For $s=2$, most low-discrepancy point set generators deliver at least near-optimum discrepancies.


### Sobol sequence

The Antonov–Saleev variant of the Sobol’ sequence generates numbers between zero and one directly as binary fractions of length $w,$ from a set of $w$ special binary fractions, $V_{i},i=1,2,\dots ,w$ called direction numbers. The bits of the Gray code of $i$, $G(i)$, are used to select direction numbers. To get the Sobol’ sequence value $s_{i}$ take the exclusive or of the binary value of the Gray code of $i$ with the appropriate direction number. The number of dimensions required affects the choice of $V_{i}$.


### Poisson disk sampling

Poisson disk sampling is popular in video games to rapidly place objects in a way that appears random-looking but guarantees that every two points are separated by at least the specified minimum distance. This does not guarantee low discrepancy (as e. g. Sobol’), but at least a significantly lower discrepancy than pure random sampling. The goal of these sampling patterns is based on frequency analysis rather than discrepancy, a type of so-called "blue noise" patterns.


## Graphical examples

The points plotted below are the first 100, 1000, and 10000 elements in a sequence of the Sobol' type. For comparison, 10000 elements of a sequence of pseudorandom points are also shown. The low-discrepancy sequence was generated by TOMS algorithm 659. An implementation of the algorithm in Fortran is available from Netlib.


## See also


- Discrepancy theory
- Markov chain Monte Carlo
- Quasi-Monte Carlo method
- Sparse grid
- Systematic sampling


## External links


- Collected Algorithms of the ACM (See algorithms 647, 659, and 738.)
- Quasi-Random Sequences from the GNU Scientific Library
- Quasi-random sampling subject to constraints at FinancialMathematics.Com
- C++ generator of Sobol’ sequence
- SciPy QMC API Reference: scipy.stats.qmc
