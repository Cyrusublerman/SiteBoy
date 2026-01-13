# Discrete Fourier transform

In mathematics, the discrete Fourier transform (DFT) is a discrete version of the Fourier transform that converts a finite sequence of equally-spaced samples of a function into a same-length sequence of equally-spaced samples of the discrete-time Fourier transform (DTFT), which is a complex-valued function of frequency. The interval at which the DTFT is sampled is the reciprocal of the duration of the input sequence. An inverse DFT (IDFT) is a Fourier series, using the DTFT samples as coefficients of complex sinusoids at the corresponding DTFT frequencies. It has the same sample-values as the original input sequence. The DFT is therefore said to be a frequency domain representation of the original input sequence. If the original sequence spans all the non-zero values of a function, its DTFT is continuous (and periodic), and the DFT provides discrete samples of one cycle. If the original sequence is one cycle of a periodic function, the DFT provides all the non-zero values of one DTFT cycle.

The DFT is used in the Fourier analysis of many practical applications. In digital signal processing, the function is any quantity or signal that varies over time, such as the pressure of a sound wave, a radio signal, or daily temperature readings, sampled over a finite time interval (often defined by a window function). In image processing, the samples can be the values of pixels along a row or column of a raster image. The DFT is also used to efficiently solve partial differential equations, and to perform other operations such as convolutions or multiplying large integers.

Since it deals with a finite amount of data, it can be implemented in computers by numerical algorithms or even dedicated hardware. These implementations usually employ efficient fast Fourier transform (FFT) algorithms; so much so that the terms "FFT" and "DFT" are often used interchangeably. Prior to its current usage, the "FFT" initialism may have also been used for the ambiguous term "finite Fourier transform".


## Definition

The discrete Fourier transform transforms a sequence of N complex numbers
$$\left\{\mathbf {x} _{n}\right\}:=x_{0},x_{1},\ldots ,x_{N-1}
$$into another sequence of complex numbers,
$$\left\{\mathbf {X} _{k}\right\}:=X_{0},X_{1},\ldots ,X_{N-1},
$$which is defined by:

Note: this definition omits the sampling interval, so the frequency axis becomes dimensionless and the amplitude is expressed only in relative scale. However, most software libraries, including FFT implementations, use this relative form.

The transform is sometimes denoted by the symbol ${\mathcal {F}}$, as in
$$\mathbf {X} ={\mathcal {F}}\left\{\mathbf {x} \right\}
$$or ${\mathcal {F}}\left(\mathbf {x} \right)$ or ${\mathcal {F}}\mathbf {x}$.

Eq.1 can be interpreted or derived in various ways, for example:

Eq.1 can also be evaluated outside the domain $k\in [0,N-1]$, and that extended sequence is $N$-periodic. Accordingly, other sequences of $N$ indices are sometimes used, such as
$${\textstyle \left[-{\frac {N}{2}},{\frac {N}{2}}-1\right]}
$$(if $N$ is even) and
$${\textstyle \left[-{\frac {N-1}{2}},{\frac {N-1}{2}}\right]}
$$(if $N$ is odd), which amounts to swapping the left and right halves of the result of the transform.

The inverse transform is given by:

Eq.2. is also $N$-periodic (in index n). In Eq.2, each $X_{k}$ is a complex number whose polar coordinates are the amplitude and phase of a complex sinusoidal component $\left(e^{i2\pi {\tfrac {k}{N}}n}\right)$ of function $x_{n}.$ (see Discrete Fourier series) The sinusoid's frequency is $k$ cycles per $N$ samples.

The normalization factor multiplying the DFT and IDFT (here 1 and ${\tfrac {1}{N}}$) and the signs of the exponents are the most common conventions. The only actual requirements of these conventions are that the DFT and IDFT have opposite-sign exponents and that the product of their normalization factors be ${\tfrac {1}{N}}.$ An uncommon normalization of ${\sqrt {\tfrac {1}{N}}}$ for both the DFT and IDFT makes the transform-pair unitary.


### DFT including sampling interval

Using the standard definition of the DFT omits the sampling interval (or sampling distance) $\Delta t$ in cases where the index corresponds to the sampling interval according to $n\Delta t=t$.

To express the DFT consistently with the continuous Fourier transform, including the sampling intervals, the sampling interval can be included explicitly as


$$X_{k}=\Delta t\sum _{n=0}^{N-1}x_{n}\cdot e^{-i2\pi {\tfrac {k}{N}}n}
$$

Note: most software libraries don't use this form but rather use the relative form, including their corresponding FFT implementations.

The corresponding inverse transform then becomes:


$$x_{n}=\Delta f\sum _{k=0}^{N-1}X_{k}\cdot e^{i2\pi {\tfrac {k}{N}}n}
$$

where the frequency spacing is
$$\Delta f={\frac {1}{\Delta tN}}
$$.


## Example

This example demonstrates how to apply the DFT to a sequence of length $N=4$ and the input vector


$$\mathbf {x} ={\begin{pmatrix}x_{0}\\x_{1}\\x_{2}\\x_{3}\end{pmatrix}}={\begin{pmatrix}1\\2-i\\-i\\-1+2i\end{pmatrix}}.
$$

Calculating the DFT of $\mathbf {x}$ using Eq.1


$${\begin{aligned}X_{0}&=e^{-i2\pi 0\cdot 0/4}\cdot 1+e^{-i2\pi 0\cdot 1/4}\cdot (2-i)+e^{-i2\pi 0\cdot 2/4}\cdot (-i)+e^{-i2\pi 0\cdot 3/4}\cdot (-1+2i)=2\\X_{1}&=e^{-i2\pi 1\cdot 0/4}\cdot 1+e^{-i2\pi 1\cdot 1/4}\cdot (2-i)+e^{-i2\pi 1\cdot 2/4}\cdot (-i)+e^{-i2\pi 1\cdot 3/4}\cdot (-1+2i)=-2-2i\\X_{2}&=e^{-i2\pi 2\cdot 0/4}\cdot 1+e^{-i2\pi 2\cdot 1/4}\cdot (2-i)+e^{-i2\pi 2\cdot 2/4}\cdot (-i)+e^{-i2\pi 2\cdot 3/4}\cdot (-1+2i)=-2i\\X_{3}&=e^{-i2\pi 3\cdot 0/4}\cdot 1+e^{-i2\pi 3\cdot 1/4}\cdot (2-i)+e^{-i2\pi 3\cdot 2/4}\cdot (-i)+e^{-i2\pi 3\cdot 3/4}\cdot (-1+2i)=4+4i\end{aligned}}
$$

results in
$$\mathbf {X} ={\begin{pmatrix}X_{0}\\X_{1}\\X_{2}\\X_{3}\end{pmatrix}}={\begin{pmatrix}2\\-2-2i\\-2i\\4+4i\end{pmatrix}}.
$$


## Properties


### Linearity

The DFT is a linear transform, i.e. if ${\mathcal {F}}(\{x_{n}\})_{k}=X_{k}$ and ${\mathcal {F}}(\{y_{n}\})_{k}=Y_{k}$, then for any complex numbers $a,b$:


$${\mathcal {F}}(\{ax_{n}+by_{n}\})_{k}=aX_{k}+bY_{k}
$$


### Time and frequency reversal

Reversing the time (i.e. replacing $n$ by $N-n$) in $x_{n}$ corresponds to reversing the frequency (i.e. $k$ by $N-k$). Mathematically, if $\{x_{n}\}$ represents the vector x then

if ${\mathcal {F}}(\{x_{n}\})_{k}=X_{k}$

then ${\mathcal {F}}(\{x_{N-n}\})_{k}=X_{N-k}$


### Conjugation in time

If ${\mathcal {F}}(\{x_{n}\})_{k}=X_{k}$ then ${\mathcal {F}}(\{x_{n}^{*}\})_{k}=X_{N-k}^{*}$.


### Real and imaginary part

This table shows some mathematical operations on $x_{n}$ in the time domain and the corresponding effects on its DFT $X_{k}$ in the frequency domain.


### Orthogonality

The vectors
$$u_{k}=\left[\left.e^{{\frac {i2\pi }{N}}kn}\;\right|\;n=0,1,\ldots ,N-1\right]^{\mathsf {T}}
$$, for $k=0,1,\ldots ,N-1$, form an orthogonal basis over the set of N-dimensional complex vectors:


$$u_{k}^{\mathsf {T}}u_{k'}^{*}=\sum _{n=0}^{N-1}\left(e^{{\frac {i2\pi }{N}}kn}\right)\left(e^{{\frac {i2\pi }{N}}(-k')n}\right)=\sum _{n=0}^{N-1}e^{{\frac {i2\pi }{N}}(k-k')n}=N~\delta _{kk'}
$$

where $\delta _{kk'}$ is the Kronecker delta. (In the last step, the summation is trivial if $k=k'$, where it is 1 + 1 + ⋯ = N, and otherwise is a geometric series that can be explicitly summed to obtain zero.) This orthogonality condition can be used to derive the formula for the IDFT from the definition of the DFT, and is equivalent to the unitarity property below.


### The Plancherel theorem and Parseval's theorem

If $X_{k}$ and $Y_{k}$ are the DFTs of $x_{n}$ and $y_{n}$ respectively then Parseval's theorem states:


$$\sum _{n=0}^{N-1}x_{n}y_{n}^{*}={\frac {1}{N}}\sum _{k=0}^{N-1}X_{k}Y_{k}^{*}
$$

where the star denotes complex conjugation. The Plancherel theorem is a special case of Parseval's theorem and states:


$$\sum _{n=0}^{N-1}|x_{n}|^{2}={\frac {1}{N}}\sum _{k=0}^{N-1}|X_{k}|^{2}.
$$

These theorems are also equivalent to the unitary condition below.


### Periodicity

The periodicity can be shown directly from the definition:


$$X_{k+N}\ \triangleq \ \sum _{n=0}^{N-1}x_{n}e^{-{\frac {i2\pi }{N}}(k+N)n}=\sum _{n=0}^{N-1}x_{n}e^{-{\frac {i2\pi }{N}}kn}\underbrace {e^{-i2\pi n}} _{1}=\sum _{n=0}^{N-1}x_{n}e^{-{\frac {i2\pi }{N}}kn}=X_{k}.
$$

Similarly, it can be shown that the IDFT formula leads to a periodic extension of $x_{n}$.


### Shift theorem

Multiplying $x_{n}$ by a linear phase
$$e^{{\frac {i2\pi }{N}}nm}
$$for some integer m corresponds to a circular shift of the output $X_{k}$: $X_{k}$ is replaced by $X_{k-m}$, where the subscript is interpreted modulo N (i.e., periodically). Similarly, a circular shift of the input $x_{n}$ corresponds to multiplying the output $X_{k}$ by a linear phase. Mathematically, if $\{x_{n}\}$ represents the vector x then

if ${\mathcal {F}}(\{x_{n}\})_{k}=X_{k}$

then
$${\mathcal {F}}\left(\left\{x_{n}\cdot e^{{\frac {i2\pi }{N}}nm}\right\}\right)_{k}=X_{k-m}
$$

and
$${\mathcal {F}}\left(\left\{x_{n-m}\right\}\right)_{k}=X_{k}\cdot e^{-{\frac {i2\pi }{N}}km}
$$


### Circular convolution theorem and cross-correlation theorem

The convolution theorem for the discrete-time Fourier transform (DTFT) indicates that a convolution of two sequences can be obtained as the inverse transform of the product of the individual transforms. An important simplification occurs when one of sequences is N-periodic, denoted here by $y_{_{N}},$ because
$$\scriptstyle {\text{DTFT}}\displaystyle \{y_{_{N}}\}
$$is non-zero at only discrete frequencies (see DTFT § Periodic data), and therefore so is its product with the continuous function $\scriptstyle {\text{DTFT}}\displaystyle \{x\}.$ That leads to a considerable simplification of the inverse transform.


$$x*y_{_{N}}\ =\ \scriptstyle {\rm {DTFT}}^{-1}\displaystyle \left[\scriptstyle {\rm {DTFT}}\displaystyle \{x\}\cdot \scriptstyle {\rm {DTFT}}\displaystyle \{y_{_{N}}\}\right]\ =\ \scriptstyle {\rm {DFT}}^{-1}\displaystyle \left[\scriptstyle {\rm {DFT}}\displaystyle \{x_{_{N}}\}\cdot \scriptstyle {\rm {DFT}}\displaystyle \{y_{_{N}}\}\right],
$$

where $x_{_{N}}$ is a periodic summation of the $x$ sequence:
$$(x_{_{N}})_{n}\ \triangleq \sum _{m=-\infty }^{\infty }x_{(n-mN)}.
$$

Customarily, the DFT and inverse DFT summations are taken over the domain $[0,N-1]$. Defining those DFTs as $X$ and $Y$, the result is:


$$(x*y_{_{N}})_{n}\triangleq \sum _{\ell =-\infty }^{\infty }x_{\ell }\cdot (y_{_{N}})_{n-\ell }=\underbrace {{\mathcal {F}}^{-1}} _{\rm {DFT^{-1}}}\left\{X\cdot Y\right\}_{n}.
$$

In practice, the $x$ sequence is usually length N or less, and $y_{_{N}}$ is a periodic extension of an N-length $y$-sequence, which can also be expressed as a circular function:


$$(y_{_{N}})_{n}=\sum _{p=-\infty }^{\infty }y_{(n-pN)}=y_{(n\operatorname {mod} N)},\quad n\in \mathbb {Z} .
$$

Then the convolution can be written as:

which gives rise to the interpretation as a circular convolution of $x$ and $y.$ It is often used to efficiently compute their linear convolution. (see Circular convolution, Fast convolution algorithms, and Overlap-save)

Similarly, the cross-correlation of $x$ and $y_{_{N}}$ is given by:


$$(x\star y_{_{N}})_{n}\triangleq \sum _{\ell =-\infty }^{\infty }x_{\ell }^{*}\cdot (y_{_{N}})_{n+\ell }={\mathcal {F}}^{-1}\left\{X^{*}\cdot Y\right\}_{n}.
$$


### Uniqueness of the Discrete Fourier Transform

As seen above, the discrete Fourier transform has the fundamental property of carrying convolution into componentwise product. A natural question is whether it is the only one with this ability. It has been shown that any linear transform that turns convolution into pointwise product is the DFT up to a permutation of coefficients. Since the number of permutations of n elements equals n!, there exist exactly n! linear and invertible maps with the same fundamental property as the DFT with respect to convolution.


### Convolution theorem duality

It can also be shown that:


$${\mathcal {F}}\left\{\mathbf {x\cdot y} \right\}_{k}\ \triangleq \sum _{n=0}^{N-1}x_{n}\cdot y_{n}\cdot e^{-i{\frac {2\pi }{N}}kn}
$$= 1 N ( X ∗ Y N ) k , {\displaystyle ={\frac {1}{N}}(\mathbf {X*Y_{N}} )_{k},} which is the circular convolution of X {\displaystyle \mathbf {X} } and Y {\displaystyle \mathbf {Y} } .


$$={\frac {1}{N}}(\mathbf {X*Y_{N}} )_{k},
$$which is the circular convolution of $\mathbf {X}$ and $\mathbf {Y}$.


### Trigonometric interpolation polynomial

The trigonometric interpolation polynomial


$$p(t)={\begin{cases}\displaystyle {\frac {1}{N}}\left[{\begin{alignedat}{3}X_{0}+X_{1}e^{i2\pi t}+\cdots &+X_{{\frac {N}{2}}-1}e^{i2\pi {\big (}\!{\frac {N}{2}}-1\!{\big )}t}&\\&+X_{\frac {N}{2}}\cos(N\pi t)&\\&+X_{{\frac {N}{2}}+1}e^{-i2\pi {\big (}\!{\frac {N}{2}}-1\!{\big )}t}&+\cdots +X_{N-1}e^{-i2\pi t}\end{alignedat}}\right]&N{\text{ even}}\\\displaystyle {\frac {1}{N}}\left[{\begin{alignedat}{3}X_{0}+X_{1}e^{i2\pi t}+\cdots &+X_{\frac {N-1}{2}}e^{i2\pi {\frac {N-1}{2}}t}&\\&+X_{\frac {N+1}{2}}e^{-i2\pi {\frac {N-1}{2}}t}&+\cdots +X_{N-1}e^{-i2\pi t}\end{alignedat}}\right]&N{\text{ odd}}\end{cases}}
$$

where the coefficients Xk are given by the DFT of xn above, satisfies the interpolation property $p(n/N)=x_{n}$ for $n=0,\ldots ,N-1$.

For even N, notice that the Nyquist component
$${\textstyle {\frac {X_{N/2}}{N}}\cos(N\pi t)}
$$is handled specially.

This interpolation is not unique: aliasing implies that one could add N to any of the complex-sinusoid frequencies (e.g. changing $e^{-it}$ to $e^{i(N-1)t}$) without changing the interpolation property, but giving different values in between the $x_{n}$ points. The choice above, however, is typical because it has two useful properties. First, it consists of sinusoids whose frequencies have the smallest possible magnitudes: the interpolation is bandlimited. Second, if the $x_{n}$ are real numbers, then $p(t)$ is real as well.

In contrast, the most obvious trigonometric interpolation polynomial is the one in which the frequencies range from 0 to $N-1$ (instead of roughly $-N/2$ to $+N/2$ as above), similar to the inverse DFT formula. This interpolation does not minimize the slope, and is not generally real-valued for real $x_{n}$; its use is a common mistake.


### The unitary DFT

Another way of looking at the DFT is to note that in the above discussion, the DFT can be expressed as the DFT matrix, a Vandermonde matrix, introduced by Sylvester in 1867,


$$\mathbf {F} ={\begin{bmatrix}\omega _{N}^{0\cdot 0}&\omega _{N}^{0\cdot 1}&\cdots &\omega _{N}^{0\cdot (N-1)}\\\omega _{N}^{1\cdot 0}&\omega _{N}^{1\cdot 1}&\cdots &\omega _{N}^{1\cdot (N-1)}\\\vdots &\vdots &\ddots &\vdots \\\omega _{N}^{(N-1)\cdot 0}&\omega _{N}^{(N-1)\cdot 1}&\cdots &\omega _{N}^{(N-1)\cdot (N-1)}\\\end{bmatrix}}
$$

where $\omega _{N}=e^{-i2\pi /N}$ is a primitive Nth root of unity.

For example, in the case when $N=2$, $\omega _{N}=e^{-i\pi }=-1$, and


$$\mathbf {F} ={\begin{bmatrix}1&1\\1&-1\\\end{bmatrix}},
$$

(which is a Hadamard matrix) or when $N=4$ as in the Discrete Fourier transform § Example above, $\omega _{N}=e^{-i\pi /2}=-i$, and


$$\mathbf {F} ={\begin{bmatrix}1&1&1&1\\1&-i&-1&i\\1&-1&1&-1\\1&i&-1&-i\\\end{bmatrix}}.
$$

The inverse transform is then given by the inverse of the above matrix,


$$\mathbf {F} ^{-1}={\frac {1}{N}}\mathbf {F} ^{*}
$$

With unitary normalization constants ${\textstyle 1/{\sqrt {N}}}$, the DFT becomes a unitary transformation, defined by a unitary matrix:


$${\begin{aligned}\mathbf {U} &={\frac {1}{\sqrt {N}}}\mathbf {F} \\\mathbf {U} ^{-1}&=\mathbf {U} ^{*}\\\left|\det(\mathbf {U} )\right|&=1\end{aligned}}
$$

where $\det()$ is the determinant function. The determinant is the product of the eigenvalues, which are always $\pm 1$ or $\pm i$ as described below. In a real vector space, a unitary transformation can be thought of as simply a rigid rotation of the coordinate system, and all of the properties of a rigid rotation can be found in the unitary DFT.

The orthogonality of the DFT is now expressed as an orthonormality condition (which arises in many areas of mathematics as described in root of unity):


$$\sum _{m=0}^{N-1}U_{km}U_{mn}^{*}=\delta _{kn}
$$

If X is defined as the unitary DFT of the vector x, then


$$X_{k}=\sum _{n=0}^{N-1}U_{kn}x_{n}
$$

and the Parseval's theorem is expressed as


$$\sum _{n=0}^{N-1}x_{n}y_{n}^{*}=\sum _{k=0}^{N-1}X_{k}Y_{k}^{*}
$$

If we view the DFT as just a coordinate transformation which simply specifies the components of a vector in a new coordinate system, then the above is just the statement that the dot product of two vectors is preserved under a unitary DFT transformation. For the special case $\mathbf {x} =\mathbf {y}$, this implies that the length of a vector is preserved as well — this is just Plancherel theorem,


$$\sum _{n=0}^{N-1}|x_{n}|^{2}=\sum _{k=0}^{N-1}|X_{k}|^{2}
$$

A consequence of the circular convolution theorem is that the DFT matrix F diagonalizes any circulant matrix.


### Expressing the inverse DFT in terms of the DFT

A useful property of the DFT is that the inverse DFT can be easily expressed in terms of the (forward) DFT, via several well-known "tricks". (For example, in computations, it is often convenient to only implement a fast Fourier transform corresponding to one transform direction and then to get the other transform direction from the first.)

First, we can compute the inverse DFT by reversing all but one of the inputs (Duhamel et al., 1988):


$${\mathcal {F}}^{-1}(\{x_{n}\})={\frac {1}{N}}{\mathcal {F}}(\{x_{N-n}\})
$$

(As usual, the subscripts are interpreted modulo N; thus, for $n=0$, we have $x_{N-0}=x_{0}$.)

Second, one can also conjugate the inputs and outputs:


$${\mathcal {F}}^{-1}(\mathbf {x} )={\frac {1}{N}}{\mathcal {F}}\left(\mathbf {x} ^{*}\right)^{*}
$$

Third, a variant of this conjugation trick, which is sometimes preferable because it requires no modification of the data values, involves swapping real and imaginary parts (which can be done on a computer simply by modifying pointers). Define ${\textstyle \operatorname {swap} (x_{n})}$ as $x_{n}$ with its real and imaginary parts swapped—that is, if $x_{n}=a+bi$ then ${\textstyle \operatorname {swap} (x_{n})}$ is $b+ai$. Equivalently, ${\textstyle \operatorname {swap} (x_{n})}$ equals $ix_{n}^{*}$. Then


$${\mathcal {F}}^{-1}(\mathbf {x} )={\frac {1}{N}}\operatorname {swap} ({\mathcal {F}}(\operatorname {swap} (\mathbf {x} )))
$$

That is, the inverse transform is the same as the forward transform with the real and imaginary parts swapped for both input and output, up to a normalization (Duhamel et al., 1988).

The conjugation trick can also be used to define a new transform, closely related to the DFT, that is involutory—that is, which is its own inverse. In particular,
$$T(\mathbf {x} )={\mathcal {F}}\left(\mathbf {x} ^{*}\right)/{\sqrt {N}}
$$is clearly its own inverse: $T(T(\mathbf {x} ))=\mathbf {x}$. A closely related involutory transformation (by a factor of
$${\textstyle {\frac {1+i}{\sqrt {2}}}}
$$) is
$$H(\mathbf {x} )={\mathcal {F}}\left((1+i)\mathbf {x} ^{*}\right)/{\sqrt {2N}}
$$, since the $(1+i)$ factors in $H(H(\mathbf {x} ))$ cancel the 2. For real inputs $\mathbf {x}$, the real part of $H(\mathbf {x} )$ is none other than the discrete Hartley transform, which is also involutory.


### Eigenvalues and eigenvectors

The eigenvalues of the DFT matrix are simple and well-known, whereas the eigenvectors are complicated, not unique, and are the subject of ongoing research. Explicit formulas are given with a significant amount of number theory.

Consider the unitary form $\mathbf {U}$ defined above for the DFT of length N, where


$$\mathbf {U} _{m,n}={\frac {1}{\sqrt {N}}}\omega _{N}^{(m-1)(n-1)}={\frac {1}{\sqrt {N}}}e^{-{\frac {i2\pi }{N}}(m-1)(n-1)}.
$$

This matrix satisfies the matrix polynomial equation:

$\mathbf {U} ^{4}=\mathbf {I} .$

This can be seen from the inverse properties above: operating $\mathbf {U}$ twice gives the original data in reverse order, so operating $\mathbf {U}$ four times gives back the original data and is thus the identity matrix. This means that the eigenvalues $\lambda$ satisfy the equation:

$\lambda ^{4}=1.$

Therefore, the eigenvalues of $\mathbf {U}$ are the fourth roots of unity: $\lambda$ is +1, −1, +i, or −i.

Since there are only four distinct eigenvalues for this $N\times N$ matrix, they have some multiplicity. The multiplicity gives the number of linearly independent eigenvectors corresponding to each eigenvalue. (There are N independent eigenvectors; a unitary matrix is never defective.)

The problem of their multiplicity was solved by McClellan and Parks (1972), although it was later shown to have been equivalent to a problem solved by Gauss (Dickinson and Steiglitz, 1982). The multiplicity depends on the value of N modulo 4, and is given by the following table:


*[Table: Multiplicities of the eigenvalues λ of the unitary DFT matrix U as a function of the transform size N (in terms of an integer m).]*

Otherwise stated, the characteristic polynomial of $\mathbf {U}$ is:


$$\det(\lambda I-\mathbf {U} )=(\lambda -1)^{\left\lfloor {\tfrac {N+4}{4}}\right\rfloor }(\lambda +1)^{\left\lfloor {\tfrac {N+2}{4}}\right\rfloor }(\lambda +i)^{\left\lfloor {\tfrac {N+1}{4}}\right\rfloor }(\lambda -i)^{\left\lfloor {\tfrac {N-1}{4}}\right\rfloor }.
$$

No simple analytical formula for general eigenvectors is known. Moreover, the eigenvectors are not unique because any linear combination of eigenvectors for the same eigenvalue is also an eigenvector for that eigenvalue. Various researchers have proposed different choices of eigenvectors, selected to satisfy useful properties like orthogonality and to have "simple" forms (e.g., McClellan and Parks, 1972; Dickinson and Steiglitz, 1982; Grünbaum, 1982; Candan et al., 2000; Hanna et al., 2004; Gurevich and Hadani, 2008).

One method to construct DFT eigenvectors to an eigenvalue $\lambda$ is based on the linear combination of operators:


$${\mathcal {P}}_{\lambda }={\frac {1}{4}}\left(\mathbf {I} +\lambda ^{-1}\mathbf {U} +\lambda ^{-2}\mathbf {U} ^{2}+\lambda ^{-3}\mathbf {U} ^{3}\right)
$$

For an arbitrary vector $\mathbf {v}$, vector
$$\mathbf {u} (\lambda )={\mathcal {P}}_{\lambda }\mathbf {v}
$$satisfies:


$${\textbf {U}}\mathbf {u} (\lambda )=\lambda \mathbf {u} (\lambda )
$$

hence, vector $\mathbf {u} (\lambda )$ is, indeed, the eigenvector of DFT matrix $\mathbf {U}$. Operators ${\mathcal {P}}_{\lambda }$ project vectors onto subspaces which are orthogonal for each value of $\lambda$. That is, for two eigenvectors,
$$\mathbf {u} (\lambda )={\mathcal {P}}_{\lambda }\mathbf {v}
$$and
$$\mathbf {u} '(\lambda ')={\mathcal {P}}_{\lambda '}\mathbf {v} '
$$we have:


$$\mathbf {u} ^{\dagger }(\lambda )\mathbf {u} '(\lambda ')=\delta _{\lambda \lambda '}\mathbf {u} ^{\dagger }(\lambda )\mathbf {v} '
$$

However, in general, projection operator method does not produce orthogonal eigenvectors within one subspace. The operator ${\mathcal {P}}_{\lambda }$ can be seen as a matrix, whose columns are eigenvectors of $\mathbf {U}$, but they are not orthogonal. When a set of vectors $\{\mathbf {v} _{n}\}_{n=1,\dots ,N_{\lambda }}$, spanning $N_{\lambda }$-dimensional space (where $N_{\lambda }$ is the multiplicity of eigenvalue $\lambda$) is chosen to generate the set of eigenvectors
$$\{\mathbf {u} _{n}(\lambda )={\mathcal {P}}_{\lambda }\mathbf {v} _{n}\}_{n=1,\dots ,N_{\lambda }}
$$to eigenvalue $\lambda$, the mutual orthogonality of $\mathbf {u} _{n}(\lambda )$ is not guaranteed. However, the orthogonal set can be obtained by further applying orthogonalization algorithm to the set
$$\{\mathbf {u} _{n}(\lambda )\}_{n=1,\dots ,N_{\lambda }}
$$, e.g. Gram-Schmidt process.

A straightforward approach to obtain DFT eigenvectors is to discretize an eigenfunction of the continuous Fourier transform, of which the most famous is the Gaussian function. Since periodic summation of the function means discretizing its frequency spectrum and discretization means periodic summation of the spectrum, the discretized and periodically summed Gaussian function yields an eigenvector of the discrete transform:


- 
$$F(m)=\sum _{k\in \mathbb {Z} }\exp \left(-{\frac {\pi \cdot (m+N\cdot k)^{2}}{N}}\right).
$$

The closed form expression for the series can be expressed by Jacobi theta functions as


- 
$$F(m)={\frac {1}{\sqrt {N}}}\vartheta _{3}\left({\frac {\pi m}{N}},\exp \left(-{\frac {\pi }{N}}\right)\right).
$$

Several other simple closed-form analytical eigenvectors for special DFT period N were found (Casper-Yakimov, 2024):

For DFT period N = 2L + 1 = 4K + 1, where K is an integer, the following is an eigenvector of DFT:


- 
$$F(m)=\prod _{s=K+1}^{L}\left[\cos \left({\frac {2\pi }{N}}m\right)-\cos \left({\frac {2\pi }{N}}s\right)\right]
$$

For DFT period N = 2L = 4K, where K is an integer, the following are eigenvectors of DFT:


- 
$$F(m)=\sin \left({\frac {2\pi }{N}}m\right)\prod _{s=K+1}^{L-1}\left[\cos \left({\frac {2\pi }{N}}m\right)-\cos \left({\frac {2\pi }{N}}s\right)\right]
$$
- 
$$F(m)=\cos \left({\frac {\pi }{N}}m\right)\prod _{s=K+1}^{3K-1}\sin \left({\frac {\pi (s-m)}{N}}\right)
$$

For DFT period N = 4K - 1, where K is an integer, the following are eigenvectors of DFT:


- 
$$F(m)=\sin \left({\frac {2\pi }{N}}m\right)\prod _{s=K+1}^{3K-2}\sin \left({\frac {\pi (s-m)}{N}}\right)
$$
- 
$$F(m)=\left(\cos \left({\frac {2\pi }{N}}m\right)-\cos \left({\frac {2\pi }{N}}K\right)\pm \sin \left({\frac {2\pi }{N}}K\right)\right)\prod _{s=K+1}^{3K-2}\sin \left({\frac {\pi (s-m)}{N}}\right)
$$

The choice of eigenvectors of the DFT matrix has become important in recent years in order to define a discrete analogue of the fractional Fourier transform—the DFT matrix can be taken to fractional powers by exponentiating the eigenvalues. For the continuous Fourier transform, the natural orthogonal eigenfunctions are the Hermite functions, so various discrete analogues of these have been employed as the eigenvectors of the DFT, such as the Kravchuk polynomials. The "best" choice of eigenvectors to define a fractional discrete Fourier transform remains an open question, however.


### Uncertainty principles


#### Probabilistic uncertainty principle

If the random variable Xk is constrained by


$$\sum _{n=0}^{N-1}|X_{n}|^{2}=1,
$$

$P_{n}=|X_{n}|^{2}$

may be considered to represent a discrete probability mass function of n, with an associated probability mass function constructed from the transformed variable,

$Q_{m}=N|x_{m}|^{2}.$

For the case of continuous functions $P(x)$ and $Q(k)$, the Heisenberg uncertainty principle states that


$$D_{0}(X)D_{0}(x)\geq {\frac {1}{16\pi ^{2}}}
$$

where $D_{0}(X)$ and $D_{0}(x)$ are the variances of $|X|^{2}$ and $|x|^{2}$ respectively, with the equality attained in the case of a suitably normalized Gaussian distribution. Although the variances may be analogously defined for the DFT, an analogous uncertainty principle is not useful, because the uncertainty will not be shift-invariant. Still, a meaningful uncertainty principle has been introduced by Massar and Spindel.

However, the Hirschman entropic uncertainty will have a useful analog for the case of the DFT. The Hirschman uncertainty principle is expressed in terms of the Shannon entropy of the two probability functions.

In the discrete case, the Shannon entropies are defined as


$$H(X)=-\sum _{n=0}^{N-1}P_{n}\ln P_{n}
$$


$$H(x)=-\sum _{m=0}^{N-1}Q_{m}\ln Q_{m},
$$

and the entropic uncertainty principle becomes

$H(X)+H(x)\geq \ln(N).$

The equality is obtained for $P_{n}$ equal to translations and modulations of a suitably normalized Kronecker comb of period $A$ where $A$ is any exact integer divisor of $N$. The probability mass function $Q_{m}$ will then be proportional to a suitably translated Kronecker comb of period $B=N/A$.


#### Deterministic uncertainty principle

There is also a well-known deterministic uncertainty principle that uses signal sparsity (or the number of non-zero coefficients). Let $\left\|x\right\|_{0}$ and $\left\|X\right\|_{0}$ be the number of non-zero elements of the time and frequency sequences $x_{0},x_{1},\ldots ,x_{N-1}$ and $X_{0},X_{1},\ldots ,X_{N-1}$, respectively. Then,


$$N\leq \left\|x\right\|_{0}\cdot \left\|X\right\|_{0}.
$$

As an immediate consequence of the inequality of arithmetic and geometric means, one also has
$$2{\sqrt {N}}\leq \left\|x\right\|_{0}+\left\|X\right\|_{0}
$$. Both uncertainty principles were shown to be tight for specifically chosen "picket-fence" sequences (discrete impulse trains), and find practical use for signal recovery applications.


#### Additive uncertainty principle

The additive uncertainty principles quantify how sparse a signal is in terms of the additive energy of the non-zero elements of the signal's transform. More specifically, if $E=\{i\in \{0,1,...,N-1\}\;|\;x_{i}\neq 0\}$ and $F=\{i\in \{0,1,...,N-1\}\;|\;X_{i}\neq 0\}$, then the two additive uncertainty principles states that


- 
$$N\leq \Lambda (E)^{\frac {1}{3}}\cdot \left\|X\right\|_{0}\;\;\;\;\&\;\;\;\;N\leq \Lambda (F)^{\frac {1}{3}}\cdot \left\|x\right\|_{0},
$$
- 
$$N\leq \left(\max _{U\subseteq E}\left\{{\frac {\Lambda (U)}{|U|^{2}}}\right\}\right)\cdot \left\|X\right\|_{0}\;\;\;\;\&\;\;\;\;N\leq \left(\max _{U\subseteq F}\left\{{\frac {\Lambda (U)}{|U|^{2}}}\right\}\right)\cdot \left\|x\right\|_{0}.
$$

where the additive energy of a set $A\subseteq \{0,1,2,...,N-1\}$ is defined and denoted by
$$\Lambda (A)=\left|\{(x_{1},x_{2},y_{1},y_{2})\in A^{4}\;|\;x_{1}+x_{2}\equiv y_{1}+y_{2}\mod N\}\right|.
$$It is well known in additive combinatorics that $2|A|^{2}-|A|\leq \Lambda (A)\leq |A|^{3},$ and that random subsets of $\{0,1,...,N-1\}$ often have low additive energy. It follows that either variation of the additive uncertainty principle is stronger than the aforementioned deterministic uncertainty principle, with equality holding if and only if the additive energies of both $E$ and $F$ are maximal, i.e., when $\Lambda (E)=|E|^{3}$ and $\Lambda (F)=|F|^{3}$.


### DFT of real and purely imaginary signals


- If $x_{0},\ldots ,x_{N-1}$ are real numbers, as they often are in practical applications, then the DFT $X_{0},\ldots ,X_{N-1}$ is even symmetric:


$$x_{n}\in \mathbb {R} \quad \forall n\in \{0,\ldots ,N-1\}\implies X_{k}=X_{-k\mod N}^{*}\quad \forall k\in \{0,\ldots ,N-1\}
$$, where $X^{*}\,$ denotes complex conjugation.

It follows that for even $N$ $X_{0}$ and $X_{N/2}$ are real-valued, and the remainder of the DFT is completely specified by just $N/2-1$ complex numbers.


- If $x_{0},\ldots ,x_{N-1}$ are purely imaginary numbers, then the DFT $X_{0},\ldots ,X_{N-1}$ is odd symmetric:


$$x_{n}\in i\mathbb {R} \quad \forall n\in \{0,\ldots ,N-1\}\implies X_{k}=-X_{-k\mod N}^{*}\quad \forall k\in \{0,\ldots ,N-1\}
$$, where $X^{*}\,$ denotes complex conjugation.


## Generalized DFT (shifted and non-linear phase)

It is possible to shift the transform sampling in time and/or frequency domain by some real shifts a and b, respectively. This is sometimes known as a generalized DFT (or GDFT), also called the shifted DFT or offset DFT, and has analogous properties to the ordinary DFT:


$$X_{k}=\sum _{n=0}^{N-1}x_{n}e^{-{\frac {i2\pi }{N}}(k+b)(n+a)}\quad \quad k=0,\dots ,N-1.
$$

Most often, shifts of $1/2$ (half a sample) are used. While the ordinary DFT corresponds to a periodic signal in both time and frequency domains, $a=1/2$ produces a signal that is anti-periodic in frequency domain ($X_{k+N}=-X_{k}$) and vice versa for $b=1/2$. Thus, the specific case of $a=b=1/2$ is known as an odd-time odd-frequency discrete Fourier transform (or O DFT). Such shifted transforms are most often used for symmetric data, to represent different boundary symmetries, and for real-symmetric data they correspond to different forms of the discrete cosine and sine transforms.

Another interesting choice is $a=b=-(N-1)/2$, which is called the centered DFT (or CDFT). The centered DFT has the useful property that, when N is a multiple of four, all four of its eigenvalues (see above) have equal multiplicities.

The term GDFT is also used for the non-linear phase extensions of DFT. Hence, GDFT method provides a generalization for constant amplitude orthogonal block transforms including linear and non-linear phase types. GDFT is a framework to improve time and frequency domain properties of the traditional DFT, e.g. auto/cross-correlations, by the addition of the properly designed phase shaping function (non-linear, in general) to the original linear phase functions.

The discrete Fourier transform can be viewed as a special case of the z-transform, evaluated on the unit circle in the complex plane; more general z-transforms correspond to complex shifts a and b above.


## Multidimensional DFT

The ordinary DFT transforms a one-dimensional sequence or array $x_{n}$ that is a function of exactly one discrete variable n. The multidimensional DFT of a multidimensional array $x_{n_{1},n_{2},\dots ,n_{d}}$ that is a function of d discrete variables $n_{\ell }=0,1,\dots ,N_{\ell }-1$ for $\ell$ in $1,2,\dots ,d$ is defined by:


$$X_{k_{1},k_{2},\dots ,k_{d}}=\sum _{n_{1}=0}^{N_{1}-1}\left(\omega _{N_{1}}^{~k_{1}n_{1}}\sum _{n_{2}=0}^{N_{2}-1}\left(\omega _{N_{2}}^{~k_{2}n_{2}}\cdots \sum _{n_{d}=0}^{N_{d}-1}\omega _{N_{d}}^{~k_{d}n_{d}}\cdot x_{n_{1},n_{2},\dots ,n_{d}}\right)\right),
$$

where $\omega _{N_{\ell }}=\exp(-i2\pi /N_{\ell })$ as above and the d output indices run from $k_{\ell }=0,1,\dots ,N_{\ell }-1$. This is more compactly expressed in vector notation, where we define $\mathbf {n} =(n_{1},n_{2},\dots ,n_{d})$ and $\mathbf {k} =(k_{1},k_{2},\dots ,k_{d})$ as d-dimensional vectors of indices from 0 to $\mathbf {N} -1$, which we define as $\mathbf {N} -1=(N_{1}-1,N_{2}-1,\dots ,N_{d}-1)$:


$$X_{\mathbf {k} }=\sum _{\mathbf {n} =\mathbf {0} }^{\mathbf {N} -1}e^{-i2\pi \mathbf {k} \cdot (\mathbf {n} /\mathbf {N} )}x_{\mathbf {n} }\,,
$$

where the division $\mathbf {n} /\mathbf {N}$ is defined as
$$\mathbf {n} /\mathbf {N} =(n_{1}/N_{1},\dots ,n_{d}/N_{d})
$$to be performed element-wise, and the sum denotes the set of nested summations above.

The inverse of the multi-dimensional DFT is, analogous to the one-dimensional case, given by:


$$x_{\mathbf {n} }={\frac {1}{\prod _{\ell =1}^{d}N_{\ell }}}\sum _{\mathbf {k} =\mathbf {0} }^{\mathbf {N} -1}e^{i2\pi \mathbf {n} \cdot (\mathbf {k} /\mathbf {N} )}X_{\mathbf {k} }\,.
$$

As the one-dimensional DFT expresses the input $x_{n}$ as a superposition of sinusoids, the multidimensional DFT expresses the input as a superposition of plane waves, or multidimensional sinusoids. The direction of oscillation in space is $\mathbf {k} /\mathbf {N}$. The amplitudes are $X_{\mathbf {k} }$. This decomposition is of great importance for everything from digital image processing (two-dimensional) to solving partial differential equations. The solution is broken up into plane waves.

The multidimensional DFT can be computed by the composition of a sequence of one-dimensional DFTs along each dimension. In the two-dimensional case $x_{n_{1},n_{2}}$ the $N_{1}$ independent DFTs of the rows (i.e., along $n_{2}$) are computed first to form a new array $y_{n_{1},k_{2}}$. Then the $N_{2}$ independent DFTs of y along the columns (along $n_{1}$) are computed to form the final result $X_{k_{1},k_{2}}$. Alternatively the columns can be computed first and then the rows. The order is immaterial because the nested summations above commute.

An algorithm to compute a one-dimensional DFT is thus sufficient to efficiently compute a multidimensional DFT. This approach is known as the row-column algorithm. There are also intrinsically multidimensional FFT algorithms.


### The real-input multidimensional DFT

For input data $x_{n_{1},n_{2},\dots ,n_{d}}$ consisting of real numbers, the DFT outputs have a conjugate symmetry similar to the one-dimensional case above:


$$X_{k_{1},k_{2},\dots ,k_{d}}=X_{N_{1}-k_{1},N_{2}-k_{2},\dots ,N_{d}-k_{d}}^{*},
$$

where the star again denotes complex conjugation and the $\ell$-th subscript is again interpreted modulo $N_{\ell }$ (for $\ell =1,2,\ldots ,d$).


## Applications

The DFT has seen wide usage across a large number of fields; we only sketch a few examples below (see also the references at the end). All applications of the DFT depend crucially on the availability of a fast algorithm to compute discrete Fourier transforms and their inverses, a fast Fourier transform.


### Spectral analysis

When the DFT is used for signal spectral analysis, the $\{x_{n}\}$ sequence usually represents a finite set of uniformly spaced time-samples of some signal $x(t)\,$, where $t$ represents time. The conversion from continuous time to samples (discrete-time) changes the underlying Fourier transform of $x(t)$ into a discrete-time Fourier transform (DTFT), which generally entails a type of distortion called aliasing. Choice of an appropriate sample-rate (see Nyquist rate) is the key to minimizing that distortion. Similarly, the conversion from a very long (or infinite) sequence to a manageable size entails a type of distortion called leakage, which is manifested as a loss of detail (a.k.a. resolution) in the DTFT. Choice of an appropriate sub-sequence length is the primary key to minimizing that effect. When the available data (and time to process it) is more than the amount needed to attain the desired frequency resolution, a standard technique is to perform multiple DFTs, for example to create a spectrogram. If the desired result is a power spectrum and noise or randomness is present in the data, averaging the magnitude components of the multiple DFTs is a useful procedure to reduce the variance of the spectrum (also called a periodogram in this context); two examples of such techniques are the Welch method and the Bartlett method; the general subject of estimating the power spectrum of a noisy signal is called spectral estimation.

A final source of distortion (or perhaps illusion) is the DFT itself, because it is just a discrete sampling of the DTFT, which is a function of a continuous frequency domain. That can be mitigated by increasing the resolution of the DFT. That procedure is illustrated at § Sampling the DTFT.


- The procedure is sometimes referred to as zero-padding, which is a particular implementation used in conjunction with the fast Fourier transform (FFT) algorithm. The inefficiency of performing multiplications and additions with zero-valued "samples" is more than offset by the inherent efficiency of the FFT.
- As already stated, leakage imposes a limit on the inherent resolution of the DTFT, so there is a practical limit to the benefit that can be obtained from a fine-grained DFT.


### Optics, diffraction, and tomography

The discrete Fourier transform is widely used with spatial frequencies in modeling the way that light, electrons, and other probes travel through optical systems and scatter from objects in two and three dimensions. The dual (direct/reciprocal) vector space of three dimensional objects further makes available a three dimensional reciprocal lattice, whose construction from translucent object shadows (via the Fourier slice theorem) allows tomographic reconstruction of three dimensional objects with a wide range of applications e.g. in modern medicine.


### Filter bank

See § FFT filter banks and § Sampling the DTFT.


### Data compression

The field of digital signal processing relies heavily on operations in the frequency domain (i.e. on the Fourier transform). For example, several lossy image and sound compression methods employ the discrete Fourier transform: the signal is cut into short segments, each is transformed, and then the Fourier coefficients of high frequencies, which are assumed to be unnoticeable, are discarded. The decompressor computes the inverse transform based on this reduced number of Fourier coefficients. (Compression applications often use a specialized form of the DFT, the discrete cosine transform or sometimes the modified discrete cosine transform.)

Some relatively recent compression algorithms, however, use wavelet transforms, which give a more uniform compromise between time and frequency domain than obtained by chopping data into segments and transforming each segment. In the case of JPEG2000, this avoids the spurious image features that appear when images are highly compressed with the original JPEG.


### Partial differential equations

Discrete Fourier transforms are often used to solve partial differential equations, where again the DFT is used as an approximation for the Fourier series (which is recovered in the limit of infinite N). The advantage of this approach is that it expands the signal in complex exponentials $e^{inx}$, which are eigenfunctions of differentiation:
$${{\text{d}}{\big (}e^{inx}{\big )}}/{\text{d}}x=ine^{inx}
$$. Thus, in the Fourier representation, differentiation is simple—we just multiply by $in$. (However, the choice of $n$ is not unique due to aliasing; for the method to be convergent, a choice similar to that in the trigonometric interpolation section above should be used.) A linear differential equation with constant coefficients is transformed into an easily solvable algebraic equation. One then uses the inverse DFT to transform the result back into the ordinary spatial representation. Such an approach is called a spectral method.


### Polynomial multiplication

Suppose we wish to compute the polynomial product c(x) = a(x) · b(x). The ordinary product expression for the coefficients of c involves a linear (acyclic) convolution, where indices do not "wrap around." This can be rewritten as a cyclic convolution by taking the coefficient vectors for a(x) and b(x) with constant term first, then appending zeros so that the resultant coefficient vectors a and b have dimension d > deg(a(x)) + deg(b(x)). Then,

$\mathbf {c} =\mathbf {a} *\mathbf {b}$

Where c is the vector of coefficients for c(x), and the convolution operator $*\,$ is defined so


$$c_{n}=\sum _{m=0}^{d-1}a_{m}b_{n-m\ \mathrm {mod} \ d}\qquad \qquad \qquad n=0,1\dots ,d-1
$$

But convolution becomes multiplication under the DFT:


$${\mathcal {F}}(\mathbf {c} )={\mathcal {F}}(\mathbf {a} ){\mathcal {F}}(\mathbf {b} )
$$

Here the vector product is taken elementwise. Thus the coefficients of the product polynomial c(x) are just the terms 0, ..., deg(a(x)) + deg(b(x)) of the coefficient vector


$$\mathbf {c} ={\mathcal {F}}^{-1}({\mathcal {F}}(\mathbf {a} ){\mathcal {F}}(\mathbf {b} )).
$$

With a fast Fourier transform, the resulting algorithm takes O(N log N) arithmetic operations. Due to its simplicity and speed, the Cooley–Tukey FFT algorithm, which is limited to composite sizes, is often chosen for the transform operation. In this case, d should be chosen as the smallest integer greater than the sum of the input polynomial degrees that is factorizable into small prime factors (e.g. 2, 3, and 5, depending upon the FFT implementation).


#### Multiplication of large integers

The fastest known algorithms for the multiplication of very large integers use the polynomial multiplication method outlined above. Integers can be treated as the value of a polynomial evaluated specifically at the number base, with the coefficients of the polynomial corresponding to the digits in that base (ex. $123=1\cdot 10^{2}+2\cdot 10^{1}+3\cdot 10^{0}$). After polynomial multiplication, a relatively low-complexity carry-propagation step completes the multiplication.


#### Convolution

When data is convolved with a function with wide support, such as for downsampling by a large sampling ratio, because of the Convolution theorem and the FFT algorithm, it may be faster to transform it, multiply pointwise by the transform of the filter and then reverse transform it. Alternatively, a good filter is obtained by simply truncating the transformed data and re-transforming the shortened data set.


## Some discrete Fourier transform pairs


*[Table: Some DFT pairs]*


## Generalizations


### Representation theory

The DFT can be interpreted as a complex-valued representation of the finite cyclic group. In other words, a sequence of $n$ complex numbers can be thought of as an element of $n$-dimensional complex space $\mathbb {C} ^{n}$ or equivalently a function $f$ from the finite cyclic group of order $n$ to the complex numbers, $\mathbb {Z} _{n}\mapsto \mathbb {C}$. So $f$ is a class function on the finite cyclic group, and thus can be expressed as a linear combination of the irreducible characters of this group, which are the roots of unity.

From this point of view, one may generalize the DFT to representation theory generally, or more narrowly to the representation theory of finite groups.

More narrowly still, one may generalize the DFT by either changing the target (taking values in a field other than the complex numbers), or the domain (a group other than a finite cyclic group), as detailed in the sequel.


### Other fields

Many of the properties of the DFT only depend on the fact that
$$e^{-{\frac {i2\pi }{N}}}
$$is a primitive root of unity, sometimes denoted $\omega _{N}$ or $W_{N}$ (so that $\omega _{N}^{N}=1$). Such properties include the completeness, orthogonality, Plancherel/Parseval, periodicity, shift, convolution, and unitarity properties above, as well as many FFT algorithms. For this reason, the discrete Fourier transform can be defined by using roots of unity in fields other than the complex numbers, and such generalizations are commonly called number-theoretic transforms (NTTs) in the case of finite fields. For more information, see number-theoretic transform and discrete Fourier transform (general).


### Other finite groups

The standard DFT acts on a sequence x0, x1, ..., xN−1 of complex numbers, which can be viewed as a function {0, 1, ..., N − 1} → C. The multidimensional DFT acts on multidimensional sequences, which can be viewed as functions


$$\{0,1,\ldots ,N_{1}-1\}\times \cdots \times \{0,1,\ldots ,N_{d}-1\}\to \mathbb {C} .
$$

This suggests the generalization to Fourier transforms on arbitrary finite groups, which act on functions G → C where G is a finite group. In this framework, the standard DFT is seen as the Fourier transform on a cyclic group, while the multidimensional DFT is a Fourier transform on a direct sum of cyclic groups.

Further, Fourier transform can be on cosets of a group.


## Alternatives

There are various alternatives to the DFT for various applications, prominent among which are wavelets. The analog of the DFT is the discrete wavelet transform (DWT). From the point of view of time–frequency analysis, a key limitation of the Fourier transform is that it does not include location information, only frequency information, and thus has difficulty in representing transients. As wavelets have location as well as frequency, they are better able to represent location, at the expense of greater difficulty representing frequency. For details, see comparison of the discrete wavelet transform with the discrete Fourier transform.


## See also


- Companion matrix
- DFT matrix
- Fast Fourier transform
- FFTPACK
- Fastest Fourier Transform in the West
- Generalizations of Pauli matrices
- Least-squares spectral analysis
- List of Fourier-related transforms
- Multidimensional transform
- Zak transform
- Quantum Fourier transform


## Further reading


- Brigham, E. Oran (1988). The fast Fourier transform and its applications. Englewood Cliffs, N.J.: Prentice Hall. ISBN 978-0-13-307505-2.
- Smith, Steven W. (1999). "Chapter 8: The Discrete Fourier Transform". The Scientist and Engineer's Guide to Digital Signal Processing (Second ed.). San Diego, Calif.: California Technical Publishing. ISBN 978-0-9660176-3-2.
- Cormen, Thomas H.; Charles E. Leiserson; Ronald L. Rivest; Clifford Stein (2001). "Chapter 30: Polynomials and the FFT". Introduction to Algorithms (Second ed.). MIT Press and McGraw-Hill. pp. 822–848. ISBN 978-0-262-03293-3. esp. section 30.2: The DFT and FFT, pp. 830–838.
- P. Duhamel; B. Piron; J. M. Etcheto (1988). "On computing the inverse DFT". IEEE Transactions on Acoustics, Speech, and Signal Processing. 36 (2): 285–286. Bibcode:1988ITASS..36..285D. doi:10.1109/29.1519.
- J. H. McClellan; T. W. Parks (1972). "Eigenvalues and eigenvectors of the discrete Fourier transformation". IEEE Transactions on Audio and Electroacoustics. 20 (1): 66–74. doi:10.1109/TAU.1972.1162342.
- Bradley W. Dickinson; Kenneth Steiglitz (1982). "Eigenvectors and functions of the discrete Fourier transform" (PDF). IEEE Transactions on Acoustics, Speech, and Signal Processing. 30 (1): 25–31. Bibcode:1982ITASS..30...25D. CiteSeerX 10.1.1.434.5279. doi:10.1109/TASSP.1982.1163843. (Note that this paper has an apparent typo in its table of the eigenvalue multiplicities: the +i/−i columns are interchanged. The correct table can be found in McClellan and Parks, 1972, and is easily confirmed numerically.)
- F. A. Grünbaum (1982). "The eigenvectors of the discrete Fourier transform". Journal of Mathematical Analysis and Applications. 88 (2): 355–363. doi:10.1016/0022-247X(82)90199-8.
- C. Candan; M. A. Kutay; H. M.Ozaktas (2000). "The discrete fractional Fourier transform" (PDF). IEEE Transactions on Signal Processing. 48 (5): 1329–1337. Bibcode:2000ITSP...48.1329C. doi:10.1109/78.839980. hdl:11693/11130. Archived (PDF) from the original on 2017-09-21.
- Magdy Tawfik Hanna, Nabila Philip Attalla Seif, and Waleed Abd El Maguid Ahmed (2004). "Hermite-Gaussian-like eigenvectors of the discrete Fourier transform matrix based on the singular-value decomposition of its orthogonal projection matrices". IEEE Transactions on Circuits and Systems I: Regular Papers. 51 (11): 2245–2254. Bibcode:2004ITCSE..51.2245H. doi:10.1109/TCSI.2004.836850. S2CID 14468134.{{cite journal}}: CS1 maint: multiple names: authors list (link)
- Shamgar Gurevich; Ronny Hadani (2009). "On the diagonalization of the discrete Fourier transform". Applied and Computational Harmonic Analysis. 27 (1): 87–99. arXiv:0808.3281. doi:10.1016/j.acha.2008.11.003. S2CID 14833478. preprint at.
- Shamgar Gurevich; Ronny Hadani; Nir Sochen (2008). "The finite harmonic oscillator and its applications to sequences, communication and radar". IEEE Transactions on Information Theory. 54 (9): 4239–4253. arXiv:0808.1495. Bibcode:2008arXiv0808.1495G. doi:10.1109/TIT.2008.926440. S2CID 6037080. preprint at.
- Casper, William; Yakimov, Milen (2024). "The restricted discrete Fourier transform". arXiv:2407.20379 [math.CA].


## External links


- Interactive explanation of the DFT
- Matlab tutorial on the Discrete Fourier Transformation Archived 2016-03-04 at the Wayback Machine
- Interactive flash tutorial on the DFT
- Mathematics of the Discrete Fourier Transform by Julius O. Smith III
- FFTW: Fast implementation of the DFT - coded in C and under General Public License (GPL)
- General Purpose FFT Package: Yet another fast DFT implementation in C & FORTRAN, permissive license
- Explained: The Discrete Fourier Transform
- Discrete Fourier Transform
- Indexing and shifting of Discrete Fourier Transform
- Discrete Fourier Transform Properties
- Generalized Discrete Fourier Transform (GDFT) with Nonlinear Phase
