# Halton sequence

In statistics, Halton sequences Who's Halton? are sequences used to generate points in space for numerical methods such as Monte Carlo simulations. Although these sequences are deterministic, they are of low discrepancy, that is, appear to be random for many purposes. They were first introduced in 1960 and are an example of a quasi-random number sequence. They generalize the one-dimensional van der Corput sequences.


## Example of Halton sequence used to generate points in (0, 1) × (0, 1) in R2

The Halton sequence is constructed according to a deterministic method that uses coprime numbers as its bases. As a simple example, let's take one dimension of the two-dimensional Halton sequence to be based on 2 and the other dimension on 3. To generate the sequence for 2, we start by dividing the interval (0,1) in half, then in fourths, eighths, etc., which generates

.mw-parser-output .frac{white-space:nowrap}.mw-parser-output .frac .num,.mw-parser-output .frac .den{font-size:80%;line-height:0;vertical-align:super}.mw-parser-output .frac .den{vertical-align:sub}.mw-parser-output .sr-only{border:0;clip:rect(0,0,0,0);clip-path:polygon(0px 0px,0px 0px,0px 0px);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}1⁄2,

1⁄4, 3⁄4,

1⁄8, 5⁄8, 3⁄8, 7⁄8,

1⁄16, 9⁄16,...

Equivalently, the nth number of this sequence is the number n written in binary representation, inverted, and written after the decimal point. This is true for any base. As an example, to find the sixth element of the above sequence, we'd write 6 = 1*2 + 1*2 + 0*2 = 1102, which can be inverted and placed after the decimal point to give 0.0112 = 0*2 + 1*2 + 1*2 = 3⁄8. So the sequence above is the same as

0.12, 0.012, 0.112, 0.0012, 0.1012, 0.0112, 0.1112, 0.00012, 0.10012,...

To generate the sequence for 3 for the other dimension, we divide the interval (0,1) in thirds, then ninths, twenty-sevenths, etc., which generates

1⁄3, 2⁄3, 1⁄9, 4⁄9, 7⁄9, 2⁄9, 5⁄9, 8⁄9, 1⁄27,...

When we pair them up, we get a sequence of points in a unit square:

(1⁄2, 1⁄3), (1⁄4, 2⁄3), (3⁄4, 1⁄9), (1⁄8, 4⁄9), (5⁄8, 7⁄9), (3⁄8, 2⁄9), (7⁄8, 5⁄9), (1⁄16, 8⁄9), (9⁄16, 1⁄27).

Even though standard Halton sequences perform very well in low dimensions, correlation problems have been noted between sequences generated from higher primes. For example, if we started with the primes 17 and 19, the first 16 pairs of points: (1⁄17, 1⁄19), (2⁄17, 2⁄19), (3⁄17, 3⁄19) ... (16⁄17, 16⁄19) would have perfect linear correlation. To avoid this, it is common to drop the first 20 entries, or some other predetermined quantity depending on the primes chosen. Several other methods have also been proposed. One of the most prominent solutions is the scrambled Halton sequence, which uses permutations of the coefficients used in the construction of the standard sequence. Another solution is the leaped Halton, which skips points in the standard sequence. Using, e.g., only each 409th point (also other prime numbers not used in the Halton core sequence are possible), can achieve significant improvements.


## Implementation

In pseudocode:

An alternative implementation that produces subsequent numbers of a Halton sequence for base b is given in the following generator function (in Python). This algorithm uses only integer numbers internally, which makes it robust against round-off errors.


## See also


- Constructions of low-discrepancy sequences
