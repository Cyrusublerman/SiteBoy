# Self-avoiding walk

In mathematics, a self-avoiding walk (SAW) is a sequence of moves on a lattice (a lattice path) that does not visit the same point more than once. This is a special case of the graph theoretical notion of a path. A self-avoiding polygon (SAP) is a closed self-avoiding walk on a lattice. Very little is known rigorously about the self-avoiding walk from a mathematical perspective, although physicists have provided numerous conjectures that are believed to be true and are strongly supported by numerical simulations.

In computational physics, a self-avoiding walk is a chain-like path in R or R with a certain number of nodes, typically a fixed step length and has the property that it doesn't cross itself or another walk. A system of SAWs satisfies the so-called excluded volume condition. In higher dimensions, the SAW is believed to behave much like the ordinary random walk.

SAWs and SAPs play a central role in the modeling of the topological and knot-theoretic behavior of thread- and loop-like molecules such as proteins. Indeed, SAWs may have first been introduced by the chemist Paul Flory in order to model the real-life behavior of chain-like entities such as solvents and polymers, whose physical volume prohibits multiple occupation of the same spatial point.

SAWs are fractals. For example, in d = 2 the fractal dimension is 4/3, for d = 3 it is close to 5/3 while for d ≥ 4 the fractal dimension is 2. The dimension is called the upper critical dimension above which excluded volume is negligible. A SAW that does not satisfy the excluded volume condition was recently studied to model explicit surface geometry resulting from expansion of a SAW. The average size of a self-avoiding walk increases with respect to its length according to an exponent that is the reciprocal of the fractal dimension. The radius of gyration of a SAW depends on the 3/4 power of length in two dimensions, and approximately the 3/5th power in three dimensions.

The properties of SAWs cannot be calculated analytically, so numerical simulations are employed. The pivot algorithm is a common method for Markov chain Monte Carlo simulations for the uniform measure on n-step self-avoiding walks. The pivot algorithm works by taking a self-avoiding walk and randomly choosing a point on this walk, and then applying symmetrical transformations (rotations and reflections) on the walk after the nth step to create a new walk.

Calculating the number of self-avoiding walks in any given lattice is a common computational problem. There is currently no known formula, although there are rigorous methods of approximation.


## Universality

One of the phenomena associated with self-avoiding walks and statistical physics models in general is the notion of universality, that is, independence of macroscopic observables from microscopic details, such as the choice of the lattice. One important quantity that appears in conjectures for universal laws is the connective constant, defined as follows. Let cn denote the number of n-step self-avoiding walks. Since every (n + m)-step self avoiding walk can be decomposed into an n-step self-avoiding walk and an m-step self-avoiding walk, it follows that cn+m ≤ cncm. Therefore, the sequence {log cn} is subadditive and we can apply Fekete's lemma to show that the following limit exists:


$$\mu =\lim _{n\to \infty }c_{n}^{\frac {1}{n}}.
$$

μ is called the connective constant, since cn depends on the particular lattice chosen for the walk so does μ. The exact value of μ is only known for the hexagonal lattice, found by Stanislav Smirnov and Hugo Duminil-Copin, where it is equal to:

${\sqrt {2+{\sqrt {2}}}}.$

For other lattices, μ has only been approximated numerically, and is believed not to even be an algebraic number. It is conjectured that


$$c_{n}\approx \mu ^{n}n^{\frac {11}{32}}
$$

as n → ∞, where μ depends on the lattice, but the power law correction
$$n^{\frac {11}{32}}
$$does not; in other words, this law is believed to be universal.


## Growing self-avoiding walk

The growing self-avoiding walk (GSAW) is a dynamical process in which a walk starts at the origin of a lattice and takes a step to an unoccupied site in a random direction. When there are no empty adjacent sites, the walk is said to be trapped, similar to the ending scenario in the video game Snake. On a square lattice it is known from computer simulations that the average number of steps reached by a growing self-avoiding walk is approximately 71. The shortest walk that leads to trapping on a square lattice is six steps, and can be achieved by starting on an empty lattice and moving up, right, right, down, down, left, and up. The average number of steps to trapping depends on the lattice or network, it is similar for the honeycomb lattice but near 78 for the triangular lattice. The average trapping length is much higher in three dimensions, being close to 4000 for the simple cubic lattice. The statistics of the traditional self-avoiding walk assume that each walk of a given length is equally likely, which is not the case for GSAWs. For example, there are 100 square lattice SAWs of length 4 starting at the origin, and four that are completely straight, such that there is a 0.04 probability of such a SAW being straight. However, a GSAW must make its first step in any direction with probability 1, its second in the same direction with probability 1/3, as with its third and fourth steps. Thus the probability of a GSAW being straight is 1/81≈0.012. For this reason, GSAWs are empirically observed in simulations to have a smaller scaling exponent (the relationship between the average radius of gyration and length) than the 3/4 predicted by the Flory model, and is observed to be close to 0.68.


## Knots in self-avoiding polygons

Self-avoiding polygons in three dimensions may form knots. On a simple cubic lattice the shortest knotted self-avoiding polygon is a trefoil knot that occupies 24 vertices. As self-avoiding polygons of greater length are considered, the probability of finding knots increases. It is proven that as the length of a randomly chosen SAP increases, the probability of finding an unknot decreases exponentially, implying that the probability of a self-avoiding polygon being knotted approaches 100% as its length increases. The length of a SAP at which the probability of knotting on a face-centered cubic lattice reaches 50% is approximately 100,000, and this may vary in other lattices. Self-avoiding walks that are not closed into polygons may also form entanglements that are colloquially recognized as knots, but these are not formally considered knots within knot theory unless the two ends of the walk are connected in some way.


## On networks

Self-avoiding walks have also been studied in the context of network theory. In this context, it is customary to treat the SAW as a dynamical process, such that in every time-step a walker randomly hops between neighboring nodes of the network. The walk ends when the walker reaches a dead-end state, such that it can no longer progress to newly un-visited nodes. It was recently found that on Erdős–Rényi networks, the distribution of path lengths of such dynamically grown SAWs can be calculated analytically, and follows the Gompertz distribution. For arbitrary networks, the distribution of path lengths of the walk, the degree distribution of the non-visited network and the first-hitting-time distribution to a node can be obtained by solving a set of coupled recurrence equations.


## Limits

Consider the uniform measure on n-step self-avoiding walks in the full plane. It is currently unknown whether the limit of the uniform measure as n → ∞ induces a measure on infinite full-plane walks. However, Harry Kesten has shown that such a measure exists for self-avoiding walks in the half-plane. One important question involving self-avoiding walks is the existence and conformal invariance of the scaling limit, that is, the limit as the length of the walk goes to infinity and the mesh of the lattice goes to zero. The scaling limit of the self-avoiding walk is conjectured to be described by Schramm–Loewner evolution with parameter κ = .mw-parser-output .sfrac{white-space:nowrap}.mw-parser-output .sfrac.tion,.mw-parser-output .sfrac .tion{display:inline-block;vertical-align:-0.5em;font-size:85%;text-align:center}.mw-parser-output .sfrac .num{display:block;line-height:1em;margin:0.0em 0.1em;border-bottom:1px solid}.mw-parser-output .sfrac .den{display:block;line-height:1em;margin:0.1em 0.1em}.mw-parser-output .sr-only{border:0;clip:rect(0,0,0,0);clip-path:polygon(0px 0px,0px 0px,0px 0px);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}⁠8/3⁠.


## See also


- Critical phenomena – Physics associated with critical points
- Hamiltonian path – Path in a graph that visits each vertex exactly once
- Knight's tour – Mathematical problem set on a chessboard
- Random walk – Process forming a path from many random steps
- Snake – Video game genre
- Universality – Concept in statistical mechanics
- Space-filling curves – All are self-avoiding.


## Further reading


## External links


- OEIS sequence A007764 (Number of nonintersecting (or self-avoiding) rook paths joining opposite corners of an n X n grid)—the number of self-avoiding paths joining opposite corners of an N × N grid, for N from 0 to 12. Also includes an extended list up to N = 21.
- Weisstein, Eric W. "Self-Avoiding Walk". MathWorld.
- Java applet of a 2D self-avoiding walk
- Generic python implementation to simulate SAWs and expanding FiberWalks on a square lattices in n-dimensions.
- Norris software to generate SAWs on the Diamond cubic.
