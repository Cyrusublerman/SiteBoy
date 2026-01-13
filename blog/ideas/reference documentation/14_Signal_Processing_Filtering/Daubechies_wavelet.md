# Daubechies wavelet

The Daubechies wavelets, based on the work of Ingrid Daubechies, are a family of orthogonal wavelets defining a discrete wavelet transform and characterized by a maximal number of vanishing moments for some given support. With each wavelet type of this class, there is a scaling function (called the father wavelet) which generates an orthogonal multiresolution analysis.


## Properties

In general the Daubechies wavelets are chosen to have the highest number A of vanishing moments, (this does not imply the best smoothness) for given support width (number of coefficients) 2A. There are two naming schemes in use, DN using the length or number of taps, and dbA referring to the number of vanishing moments. So D4 and db2 are the same wavelet transform.

Among the 2 possible solutions of the algebraic equations for the moment and orthogonality conditions, the one is chosen whose scaling filter has extremal phase. The wavelet transform is also easy to put into practice using the fast wavelet transform. Daubechies wavelets are widely used in solving a broad range of problems, e.g. self-similarity properties of a signal or fractal problems, signal discontinuities, etc.

The Daubechies wavelets are not defined in terms of the resulting scaling and wavelet functions; in fact, they are not possible to write down in closed form. The graphs below are generated using the cascade algorithm, a numeric technique consisting of inverse-transforming [1 0 0 0 0 ... ] an appropriate number of times.

Note that the spectra shown here are not the frequency response of the high and low pass filters, but rather the amplitudes of the continuous Fourier transforms of the scaling (blue) and wavelet (red) functions.

Daubechies orthogonal wavelets D2–D20 resp. db1–db10 are commonly used. Each wavelet has a number of zero moments or vanishing moments equal to half the number of coefficients. For example, D2 has one vanishing moment, D4 has two, etc. A vanishing moment limits the wavelets ability to represent polynomial behaviour or information in a signal. For example, D2, with one vanishing moment, easily encodes polynomials of one coefficient, or constant signal components. D4 encodes polynomials with two coefficients, i.e. constant and linear signal components; and D6 encodes 3-polynomials, i.e. constant, linear and quadratic signal components. This ability to encode signals is nonetheless subject to the phenomenon of scale leakage, and the lack of shift-invariance, which arise from the discrete shifting operation (below) during application of the transform. Sub-sequences which represent linear, quadratic (for example) signal components are treated differently by the transform depending on whether the points align with even- or odd-numbered locations in the sequence. The lack of the important property of shift-invariance, has led to the development of several different versions of a shift-invariant (discrete) wavelet transform.


## Construction

Both the scaling sequence (low-pass filter) and the wavelet sequence (band-pass filter) (see orthogonal wavelet for details of this construction) will here be normalized to have sum equal 2 and sum of squares equal 2. In some applications, they are normalised to have sum ${\sqrt {2}}$, so that both sequences and all shifts of them by an even number of coefficients are orthonormal to each other.

Using the general representation for a scaling sequence of an orthogonal discrete wavelet transform with approximation order A,

$a(Z)=2^{1-A}(1+Z)^{A}p(Z),$

with N = 2A, p having real coefficients, p(1) = 1 and deg(p) = A − 1, one can write the orthogonality condition as


$$a(Z)a\left(Z^{-1}\right)+a(-Z)a\left(-Z^{-1}\right)=4,
$$

or equally as

$(2-X)^{A}P(X)+X^{A}P(2-X)=2^{A}\qquad (*),$

with the Laurent-polynomial


$$X:={\frac {1}{2}}\left(2-Z-Z^{-1}\right)
$$

generating all symmetric sequences and $X(-Z)=2-X(Z).$ Further, P(X) stands for the symmetric Laurent-polynomial

$P(X(Z))=p(Z)p\left(Z^{-1}\right).$

$X(e^{iw})=1-\cos(w)$

$p(e^{iw})p(e^{-iw})=|p(e^{iw})|^{2}$

P takes nonnegative values on the segment [0,2].

Equation (*) has one minimal solution for each A, which can be obtained by division in the ring of truncated power series in X,


$$P_{A}(X)=\sum _{k=0}^{A-1}{\binom {A+k-1}{A-1}}2^{-k}X^{k}.
$$

Obviously, this has positive values on (0,2).

The homogeneous equation for (*) is antisymmetric about X = 1 and has thus the general solution

$X^{A}(X-1)R\left((X-1)^{2}\right),$

with R some polynomial with real coefficients. That the sum

$P(X)=P_{A}(X)+X^{A}(X-1)R\left((X-1)^{2}\right)$

shall be nonnegative on the interval [0,2] translates into a set of linear restrictions on the coefficients of R. The values of P on the interval [0,2] are bounded by some quantity $4^{A-r},$ maximizing r results in a linear program with infinitely many inequality conditions.

$P(X(Z))=p(Z)p\left(Z^{-1}\right)$

for p one uses a technique called spectral factorization resp. Fejér-Riesz-algorithm. The polynomial P(X) splits into linear factors


$$P(X)=(X-\mu _{1})\cdots (X-\mu _{N}),\qquad N=A+1+2\deg(R).
$$

Each linear factor represents a Laurent-polynomial


$$X(Z)-\mu =-{\frac {1}{2}}Z+1-\mu -{\frac {1}{2}}Z^{-1}
$$

that can be factored into two linear factors. One can assign either one of the two linear factors to p(Z), thus one obtains 2 possible solutions. For extremal phase one chooses the one that has all complex roots of p(Z) inside or on the unit circle and is thus real.

For Daubechies wavelet transform, a pair of linear filters is used. Each filter of the pair should be a quadrature mirror filter. Solving the coefficient of the linear filter $c_{i}$ using the quadrature mirror filter property results in the following solution for the coefficient values for filter of order 4.


$$c_{0}={\frac {1+{\sqrt {3}}}{4{\sqrt {2}}}},\quad c_{1}={\frac {3+{\sqrt {3}}}{4{\sqrt {2}}}},\quad c_{2}={\frac {3-{\sqrt {3}}}{4{\sqrt {2}}}},\quad c_{3}={\frac {1-{\sqrt {3}}}{4{\sqrt {2}}}}.
$$


## The scaling sequences of lowest approximation order

Below are the coefficients for the scaling functions for D2-20. The wavelet coefficients are derived by reversing the order of the scaling function coefficients and then reversing the sign of every second one, (i.e., D4 wavelet $\approx$ {−0.1830127, −0.3169873, 1.1830127, −0.6830127}). Mathematically, this looks like $b_{k}=(-1)^{k}a_{N-1-k}$ where k is the coefficient index, b is a coefficient of the wavelet sequence and a a coefficient of the scaling sequence. N is the wavelet index, i.e., 2 for D2.

Parts of the construction are also used to derive the biorthogonal Cohen–Daubechies–Feauveau wavelets (CDFs).


## Implementation

While software such as Mathematica supports Daubechies wavelets directly a basic implementation is possible in MATLAB (in this case, Daubechies 4). This implementation uses periodization to handle the problem of finite length signals. Other, more sophisticated methods are available, but often it is not necessary to use these as it only affects the very ends of the transformed signal. The periodization is accomplished in the forward transform directly in MATLAB vector notation, and the inverse transform by using the circshift() function:


### Transform, D4

It is assumed that S, a column vector with an even number of elements, has been pre-defined as the signal to be analyzed. Note that the D4 coefficients are [1 + √3, 3 + √3, 3 − √3, 1 − √3]/4.


### Inverse transform, D4


## Binomial-QMF

It was shown by Ali Akansu in 1990 that the binomial quadrature mirror filter bank (binomial QMF) is identical to the Daubechies wavelet filter, and its performance was ranked among known subspace solutions from a discrete-time signal processing perspective. It was an extension of the prior work on binomial coefficient and Hermite polynomials that led to the development of the Modified Hermite Transformation (MHT) in 1987. The magnitude square functions of Binomial-QMF filters are the unique maximally flat functions in a two-band perfect reconstruction QMF (PR-QMF) design formulation that is related to the wavelet regularity in the continuous domain.


## Applications


- The application of Daubechies wavelet transform as a watermarking scheme has been proved effective. This approach operates in a proficient multi-resolution frequency domain, enabling the incorporation of an encrypted digital logo in the format of QR codes.
- Daubechies wavelet approximation can be used to analyze Griffith crack behavior in nonlocal magneto-elastic horizontally shear (SH) wave propagation within a finite-thickness, infinitely long homogeneous isotropic strip.
- Daubechies wavelet cepstral coefficients can be useful in the context of Parkinson's disease detection. Daubechies wavelets, known for their efficient multi-resolution analysis, are utilized to extract cepstral features from vocal signal data. These wavelet-based coefficients can act as discriminative features for accurately identifying patterns indicative of Parkinson's disease, offering a novel approach to diagnostic methodologies.
- When it comes to analysis and detection of Community Acquired Pneumonia (CAP), Complex Daubechies wavelets can be used to identify intricate details of the CAP affected areas in infected lungs to produce accurate results.
- The elastohydrodynamic lubrication problem involves the study of lubrication regimes in which the deformation of the contacting surfaces significantly influences the lubricating film. Daubechies wavelets can address the challenges associated with accurately modeling and simulating such intricate lubrication phenomena. Daubechies wavelets allows for a more detailed and refined exploration of the interactions between the lubricant and the contacting surfaces.
- Daubechies Wavelet can extract intricate details and features from the vibroacoustic signals, offering a comprehensive diagnostic approach for evaluating the condition and performance of diesel engines in combine harvesters. The Daubechies Wavelet spectrum serves as a powerful analytical tool, allowing the researchers to identify patterns, anomalies, and characteristic signatures within the signals associated with different engine conditions. This detailed spectral analysis aids in enhancing the accuracy of diagnostic assessments, enabling a more nuanced understanding of the vibrational and acoustic characteristics indicative of engine health or potential issues.
- In practical terms, the Daubechies wavelets facilitate a finely tuned examination of the temporal and spatial characteristics of dynamic waves within elastic materials. This approach enables a more nuanced understanding of how elastic solids respond to varying dynamic conditions over time. The integration of Daubechies wavelets into the finite wavelet domain method likely contributes to a more versatile and robust analytical framework for studying transient dynamic waves in elastic solids.
- The brachistochrone problem can be formulated and expressed as a variational problem, emphasizing the importance of finding the optimal curve that minimizes the time of descent. By introducing Daubechies wavelets into the mathematical framework, scaling functions associated with these wavelets can construct an approximation of the optimal curve. Daubechies wavelets, with their ability to capture both high and low-frequency components of a function, prove instrumental in achieving a detailed representation of the brachistochrone curve.


## See also


- Fast wavelet transform


## External links


- Ingrid Daubechies: Ten Lectures on Wavelets, SIAM 1992.
- Proc. 1st NJIT Symposium on Wavelets, Subbands and Transforms, April 1990.
- Akansu, Ali N.; Haddad, Richard A. (1992), Multiresolution Signal Decomposition: Transforms, Subbands, and Wavelets, Boston, MA: Academic Press, ISBN 978-0-12-047141-6
- A.N. Akansu, Filter Banks and Wavelets in Signal Processing: A Critical Review, Proc. SPIE Video Communications and PACS for Medical Applications (Invited Paper), pp. 330–341, vol. 1977, Berlin, Oct. 1993.
- Carlos Cabrelli, Ursula Molter: "Generalized Self-similarity", Journal of Mathematical Analysis and Applications, 230: 251–260, 1999.
- Hardware implementation of wavelets
- "Daubechies wavelets", Encyclopedia of Mathematics, EMS Press, 2001 [1994].
- I. Kaplan, The Daubechies D4 Wavelet Transform.
- Jensen; la Cour-Harbo (2001). Ripples in Mathematics. Berlin: Springer. pp. 157–160. ISBN 3-540-41662-5. Archived from the original on 2008-12-02. Retrieved 2008-12-10.
- Jianhong (Jackie) Shen and Gilbert Strang, Applied and Computational Harmonic Analysis, 5(3), Asymptotics of Daubechies Filters, Scaling Functions, and Wavelets.
