# Sobol sequence

Sobol’ sequences (also called LPτ sequences or (t, s) sequences in base 2) are a type of quasi-random low-discrepancy sequence. They were first introduced by the Russian mathematician Ilya M. Sobol’ (Илья Меерович Соболь) in 1967.

These sequences use a base of two to form successively finer uniform partitions of the unit interval and then reorder the coordinates in each dimension.


## Good distributions in the s-dimensional unit hypercube

Let I = [0,1] be the s-dimensional unit hypercube, and f a real integrable function over I. The original motivation of Sobol’ was to construct a sequence xn in I so that
$$\lim _{n\to \infty }{\frac {1}{n}}\sum _{i=1}^{n}f(x_{i})=\int _{I^{s}}f
$$and the convergence be as fast as possible.

It is more or less clear that for the sum to converge towards the integral, the points xn should fill I minimizing the holes. Another good property would be that the projections of xn on a lower-dimensional face of I leave very few holes as well. Hence the homogeneous filling of I does not qualify because in lower dimensions many points will be at the same place, therefore useless for the integral estimation.

These good distributions are called (t,m,s)-nets and (t,s)-sequences in base b. To introduce them, define first an elementary s-interval in base b a subset of I of the form
$$\prod _{j=1}^{s}\left[{\frac {a_{j}}{b^{d_{j}}}},{\frac {a_{j}+1}{b^{d_{j}}}}\right],
$$where aj and dj are non-negative integers, and $a_{j}<b^{d_{j}}$ for all j in {1, ...,s}.

Given 2 integers $0\leq t\leq m$, a (t,m,s)-net in base b is a sequence xn of b points of I such that
$$\operatorname {Card} P\cap \{x_{1},...,x_{b^{m}}\}=b^{t}
$$for all elementary interval P in base b of hypervolume λ(P) = b.

Given a non-negative integer t, a (t,s)-sequence in base b is an infinite sequence of points xn such that for all integers $k\geq 0,m\geq t$, the sequence $\{x_{kb^{m}},...,x_{(k+1)b^{m}-1}\}$ is a (t,m,s)-net in base b.

In his article, Sobol’ described Πτ-meshes and LPτ sequences, which are (t,m,s)-nets and (t,s)-sequences in base 2 respectively. The terms (t,m,s)-nets and (t,s)-sequences in base b (also called Niederreiter sequences) were coined in 1988 by Harald Niederreiter. The term Sobol’ sequences was introduced in late English-speaking papers in comparison with Halton, Faure and other low-discrepancy sequences.


## A fast algorithm

A more efficient Gray code implementation was proposed by Antonov and Saleev.

As for the generation of Sobol’ numbers, they are clearly aided by the use of Gray code $G(n)=n\oplus \lfloor n/2\rfloor$ instead of n for constructing the n-th point draw.

Suppose we have already generated all the Sobol’ sequence draws up to n − 1 and kept in memory the values xn−1,j for all the required dimensions. Since the Gray code G(n) differs from that of the preceding one G(n − 1) by just a single, say the k-th, bit (which is a rightmost zero bit of n − 1), all that needs to be done is a single XOR operation for each dimension in order to propagate all of the xn−1 to xn, i.e.

$x_{n,i}=x_{n-1,i}\oplus v_{k,i}.$


## Additional uniformity properties

Sobol’ introduced additional uniformity conditions known as property A and A’.


**Definition**

A low-discrepancy sequence is said to satisfy Property A if for any binary segment (not an arbitrary subset) of the d-dimensional sequence of length 2 there is exactly one draw in each 2 hypercubes that result from subdividing the unit hypercube along each of its length extensions into half.


**Definition**

A low-discrepancy sequence is said to satisfy Property A’ if for any binary segment (not an arbitrary subset) of the d-dimensional sequence of length 4 there is exactly one draw in each 4 hypercubes that result from subdividing the unit hypercube along each of its length extensions into four equal parts.

There are mathematical conditions that guarantee properties A and A'.

Tests for properties A and A’ are independent. Thus it is possible to construct the Sobol’ sequence that satisfies both properties A and A’ or only one of them.


## The initialisation of Sobol’ numbers

To construct a Sobol’ sequence, a set of direction numbers vi,j needs to be selected. There is some freedom in the selection of initial direction numbers. Therefore, it is possible to receive different realisations of the Sobol’ sequence for selected dimensions. A bad selection of initial numbers can considerably reduce the efficiency of Sobol’ sequences when used for computation.

Arguably the easiest choice for the initialisation numbers is just to have the l-th leftmost bit set, and all other bits to be zero, i.e. mk,j = 1 for all k and j. This initialisation is usually called unit initialisation. However, such a sequence fails the test for Property A and A’ even for low dimensions and hence this initialisation is bad.


## Implementation and availability

Good initialisation numbers for different numbers of dimensions are provided by several authors. For example, Sobol’ provides initialisation numbers for dimensions up to 51. The same set of initialisation numbers is used by Bratley and Fox.

Initialisation numbers for high dimensions are available on Joe and Kuo. Peter Jäckel provides initialisation numbers up to dimension 32 in his book "Monte Carlo methods in finance".

Other implementations are available as C, Fortran 77, or Fortran 90 routines in the Numerical Recipes collection of software. A free/open-source implementation in up to 1111 dimensions, based on the Joe and Kuo initialisation numbers, is available in C, and up to 21201 dimensions in Python and Julia. A different free/open-source implementation in up to 1111 dimensions is available for C++, Fortran 90, Matlab, and Python.

Commercial Sobol’ sequence generators are available within, for example, the NAG Library. BRODA Ltd. provides Sobol' and scrambled Sobol' sequences generators with additional unifomity properties A and A' up to a maximum dimension 131072. These generators were co-developed with Prof. I. Sobol'. MATLAB contains Sobol' sequences generators up to dimension 1111 as part of its Statistics Toolbox.


## See also


- Low-discrepancy sequence – Type of mathematical sequences
- Quasi-Monte Carlo method – Numerical integration process


## External links


- Collected Algorithms of the ACM (See algorithms 647, 659, and 738.)
- Collection of Sobol’ sequences generator programming codes
- Freeware C++ generator of Sobol’ sequence
